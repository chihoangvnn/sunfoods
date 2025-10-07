import { Router } from 'express';
import { requireAdminAuth } from '../middleware/admin-auth';
import { db } from '../db';
import { vendors, vendorOrders, vendorProducts, consignmentRequests, admins } from '@shared/schema';
import { z } from 'zod';
import { eq, and, sql, desc, or, ilike } from 'drizzle-orm';

const router = Router();

const statusUpdateSchema = z.object({
  status: z.enum(['active', 'inactive', 'suspended'], {
    errorMap: () => ({ message: 'Trạng thái không hợp lệ' })
  })
});

const approveSchema = z.object({
  notes: z.string().max(500).optional()
});

const rejectSchema = z.object({
  rejectionReason: z.string().min(10, {
    message: 'Lý do từ chối phải từ 10-500 ký tự'
  }).max(500, {
    message: 'Lý do từ chối phải từ 10-500 ký tự'
  })
});

router.get('/vendors', requireAdminAuth, async (req, res) => {
  try {
    const { status, search, limit = '50', offset = '0' } = req.query;
    
    const limitNum = Math.min(parseInt(limit as string, 10) || 50, 100);
    const offsetNum = parseInt(offset as string, 10) || 0;

    let whereConditions: any[] = [];

    if (status && ['active', 'inactive', 'suspended', 'pending'].includes(status as string)) {
      whereConditions.push(eq(vendors.status, status as any));
    }

    if (search && typeof search === 'string' && search.trim()) {
      const searchTerm = `%${search.trim()}%`;
      whereConditions.push(
        or(
          ilike(vendors.name, searchTerm),
          ilike(vendors.email, searchTerm),
          ilike(vendors.phone, searchTerm)
        )
      );
    }

    const whereClause = whereConditions.length > 0 
      ? and(...whereConditions)
      : undefined;

    const results = await db
      .select({
        id: vendors.id,
        name: vendors.name,
        contactPerson: vendors.contactPerson,
        email: vendors.email,
        phone: vendors.phone,
        status: vendors.status,
        depositBalance: vendors.depositBalance,
        createdAt: vendors.createdAt,
        updatedAt: vendors.updatedAt,
        totalOrders: sql<number>`CAST(COUNT(DISTINCT ${vendorOrders.id}) AS INTEGER)`,
        totalRevenue: sql<string>`COALESCE(SUM(CASE WHEN ${vendorOrders.status} = 'delivered' THEN ${vendorOrders.codAmount} ELSE 0 END), 0)`
      })
      .from(vendors)
      .leftJoin(vendorOrders, eq(vendorOrders.vendorId, vendors.id))
      .where(whereClause)
      .groupBy(
        vendors.id,
        vendors.name,
        vendors.contactPerson,
        vendors.email,
        vendors.phone,
        vendors.status,
        vendors.depositBalance,
        vendors.createdAt,
        vendors.updatedAt
      )
      .orderBy(desc(vendors.createdAt))
      .limit(limitNum)
      .offset(offsetNum);

    res.json(results.map(row => ({
      id: row.id,
      name: row.name,
      contactPerson: row.contactPerson,
      email: row.email,
      phone: row.phone,
      businessLicense: null,
      taxId: null,
      status: row.status,
      verificationStatus: row.status === 'active' ? 'verified' : 'pending',
      depositBalance: row.depositBalance,
      totalOrders: row.totalOrders || 0,
      totalRevenue: row.totalRevenue || '0.00',
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    })));
  } catch (error) {
    console.error('Error fetching vendors:', error);
    res.status(500).json({ error: 'Lỗi lấy danh sách nhà cung cấp' });
  }
});

router.put('/vendors/:id/status', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const validation = statusUpdateSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        error: validation.error.errors[0]?.message || 'Dữ liệu không hợp lệ' 
      });
    }

    const { status } = validation.data;

    const [existingVendor] = await db
      .select()
      .from(vendors)
      .where(eq(vendors.id, id))
      .limit(1);

    if (!existingVendor) {
      return res.status(404).json({ error: 'Không tìm thấy nhà cung cấp' });
    }

    const updateData: any = {
      status,
      updatedAt: new Date()
    };

    const [updatedVendor] = await db
      .update(vendors)
      .set(updateData)
      .where(eq(vendors.id, id))
      .returning();

    res.json(updatedVendor);
  } catch (error) {
    console.error('Error updating vendor status:', error);
    res.status(500).json({ error: 'Lỗi cập nhật trạng thái nhà cung cấp' });
  }
});

router.post('/consignment-requests/:id/approve', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const validation = approveSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        error: validation.error.errors[0]?.message || 'Dữ liệu không hợp lệ' 
      });
    }

    const { notes } = validation.data;

    const [request] = await db
      .select()
      .from(consignmentRequests)
      .where(eq(consignmentRequests.id, id))
      .limit(1);

    if (!request) {
      return res.status(404).json({ error: 'Không tìm thấy yêu cầu ký gửi' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ 
        error: `Yêu cầu đã được ${request.status === 'approved' ? 'phê duyệt' : 'từ chối'} trước đó` 
      });
    }

    const result = await db.transaction(async (tx) => {
      const [approvedRequest] = await tx
        .update(consignmentRequests)
        .set({
          status: 'approved',
          reviewerId: req.admin!.id,
          reviewerNotes: notes || null,
          reviewedAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(consignmentRequests.id, id))
        .returning();

      if (!request.productId) {
        return { approvedRequest, vendorProduct: null };
      }

      const [existingVendorProduct] = await tx
        .select()
        .from(vendorProducts)
        .where(
          and(
            eq(vendorProducts.vendorId, request.vendorId),
            eq(vendorProducts.productId, request.productId)
          )
        )
        .limit(1);

      let vendorProduct;

      if (existingVendorProduct) {
        [vendorProduct] = await tx
          .update(vendorProducts)
          .set({
            quantityConsigned: sql`${vendorProducts.quantityConsigned} + ${request.quantity}`,
            consignmentPrice: request.proposedPrice,
            discountPercent: request.discountPercent || '0.00',
            updatedAt: new Date()
          })
          .where(eq(vendorProducts.id, existingVendorProduct.id))
          .returning();
      } else {
        [vendorProduct] = await tx
          .insert(vendorProducts)
          .values({
            vendorId: request.vendorId,
            productId: request.productId,
            quantityConsigned: request.quantity,
            consignmentPrice: request.proposedPrice,
            discountPercent: request.discountPercent || '0.00',
            status: 'active',
            consignmentDate: new Date(),
            createdAt: new Date(),
            updatedAt: new Date()
          })
          .returning();
      }

      return { approvedRequest, vendorProduct };
    });

    res.json(result);
  } catch (error) {
    console.error('Error approving consignment request:', error);
    res.status(500).json({ error: 'Lỗi phê duyệt yêu cầu ký gửi' });
  }
});

router.post('/consignment-requests/:id/reject', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const validation = rejectSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        error: validation.error.errors[0]?.message || 'Dữ liệu không hợp lệ' 
      });
    }

    const { rejectionReason } = validation.data;

    const [request] = await db
      .select()
      .from(consignmentRequests)
      .where(eq(consignmentRequests.id, id))
      .limit(1);

    if (!request) {
      return res.status(404).json({ error: 'Không tìm thấy yêu cầu ký gửi' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ 
        error: `Yêu cầu đã được ${request.status === 'approved' ? 'phê duyệt' : 'từ chối'} trước đó` 
      });
    }

    const [rejectedRequest] = await db
      .update(consignmentRequests)
      .set({
        status: 'rejected',
        reviewerId: req.admin!.id,
        reviewerNotes: rejectionReason,
        reviewedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(consignmentRequests.id, id))
      .returning();

    res.json(rejectedRequest);
  } catch (error) {
    console.error('Error rejecting consignment request:', error);
    res.status(500).json({ error: 'Lỗi từ chối yêu cầu ký gửi' });
  }
});

export default router;
