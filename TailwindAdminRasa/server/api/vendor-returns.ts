import { Router } from 'express';
import { storage } from '../storage';
import { vendorRefundService } from '../services/vendor-refund-service';
import { db } from '../db';
import { vendorReturns, vendorOrders, vendors } from '@shared/schema';
import { eq, and, gte, lte, sql, desc } from 'drizzle-orm';
import { PushNotificationService } from '../services/push-notification-service';

const router = Router();

declare module 'express-session' {
  interface SessionData {
    vendorId?: string;
    adminId?: string;
    adminRole?: 'superadmin' | 'admin' | 'staff' | 'cashier';
  }
}

const requireVendorAuth = (req: any, res: any, next: any) => {
  if (!req.session.vendorId && !req.session.adminId) {
    return res.status(401).json({ error: 'Unauthorized. Please log in.' });
  }
  next();
};

const requireAdminAuth = (req: any, res: any, next: any) => {
  if (!req.session.adminId) {
    return res.status(401).json({ error: 'Admin authentication required' });
  }
  next();
};

// 📋 GET /api/vendor/returns - List returns with filtering
router.get('/', requireVendorAuth, async (req, res) => {
  try {
    const { status, vendorId: queryVendorId, limit = '50', offset = '0' } = req.query;
    const isAdmin = !!req.session.adminId;
    const currentVendorId = req.session.vendorId;

    let query = db
      .select({
        return: vendorReturns,
        vendor: {
          id: vendors.id,
          name: vendors.name,
        },
        vendorOrder: {
          id: vendorOrders.id,
          vendorCost: vendorOrders.vendorCost,
        },
      })
      .from(vendorReturns)
      .leftJoin(vendors, eq(vendorReturns.vendorId, vendors.id))
      .leftJoin(vendorOrders, eq(vendorReturns.vendorOrderId, vendorOrders.id))
      .$dynamic();

    const conditions: any[] = [];

    if (!isAdmin && currentVendorId) {
      conditions.push(eq(vendorReturns.vendorId, currentVendorId));
    }

    if (isAdmin && queryVendorId && typeof queryVendorId === 'string') {
      conditions.push(eq(vendorReturns.vendorId, queryVendorId));
    }

    if (status && typeof status === 'string') {
      conditions.push(eq(vendorReturns.status, status));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const returns = await query
      .orderBy(desc(vendorReturns.createdAt))
      .limit(parseInt(limit as string))
      .offset(parseInt(offset as string));

    const formattedReturns = returns.map(r => ({
      id: r.return.id,
      returnReason: r.return.returnReason,
      returnType: r.return.returnType,
      quantityReturned: r.return.quantityReturned,
      refundAmount: r.return.refundAmount,
      status: r.return.status,
      images: r.return.images,
      adminNotes: r.return.adminNotes,
      vendorId: r.vendor?.id,
      vendorName: r.vendor?.name,
      vendorOrderId: r.vendorOrder?.id,
      orderTotal: r.vendorOrder?.vendorCost,
      createdAt: r.return.createdAt,
      processedAt: r.return.processedAt,
      updatedAt: r.return.updatedAt,
    }));

    res.json({
      success: true,
      returns: formattedReturns,
      count: formattedReturns.length,
    });
  } catch (error) {
    console.error('Get vendor returns error:', error);
    res.status(500).json({ error: 'Failed to fetch returns' });
  }
});

// 📝 POST /api/vendor/returns - Create return request
router.post('/', requireVendorAuth, async (req, res) => {
  try {
    const { vendorOrderId, returnReason, returnType, quantityReturned, images } = req.body;
    const vendorId = req.session.vendorId;

    if (!vendorId && !req.session.adminId) {
      return res.status(401).json({ error: 'Vendor authentication required' });
    }

    if (!vendorOrderId || !returnReason || !returnType || !quantityReturned) {
      return res.status(400).json({ 
        error: 'Missing required fields: vendorOrderId, returnReason, returnType, quantityReturned' 
      });
    }

    const validReturnTypes = ['defective', 'wrong_item', 'customer_request', 'damaged', 'other'];
    if (!validReturnTypes.includes(returnType)) {
      return res.status(400).json({ error: 'Invalid return type' });
    }

    const [vendorOrder] = await db
      .select()
      .from(vendorOrders)
      .where(eq(vendorOrders.id, vendorOrderId));

    if (!vendorOrder) {
      return res.status(404).json({ error: 'Vendor order not found' });
    }

    if (vendorId && vendorOrder.vendorId !== vendorId) {
      return res.status(403).json({ error: 'This order does not belong to you' });
    }

    const refundAmount = vendorOrder.vendorCost;

    const [newReturn] = await db
      .insert(vendorReturns)
      .values({
        vendorId: vendorOrder.vendorId,
        vendorOrderId: vendorOrderId,
        returnReason,
        returnType,
        quantityReturned: parseInt(quantityReturned),
        refundAmount,
        refundMethod: 'deposit_credit',
        status: 'pending',
        images: images || [],
      })
      .returning();

    try {
      await PushNotificationService.sendReturnRequestNotification(
        vendorOrder.vendorId,
        newReturn.id,
        parseFloat(refundAmount)
      );
      console.log(`📱 Sent return request push notification to vendor ${vendorOrder.vendorId}`);
    } catch (notifError) {
      console.error(`Failed to send return request push notification to vendor ${vendorOrder.vendorId}:`, notifError);
    }

    res.status(201).json({
      success: true,
      return: newReturn,
    });
  } catch (error) {
    console.error('Create return request error:', error);
    res.status(500).json({ error: 'Failed to create return request' });
  }
});

// ✅ PUT /api/vendor/returns/:id/approve - Approve return (Admin only)
router.put('/:id/approve', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.session.adminId;

    const [returnRequest] = await db
      .select()
      .from(vendorReturns)
      .where(eq(vendorReturns.id, id));

    if (!returnRequest) {
      return res.status(404).json({ error: 'Return request not found' });
    }

    if (returnRequest.status !== 'pending') {
      return res.status(400).json({ 
        error: `Cannot approve return with status: ${returnRequest.status}` 
      });
    }

    const refundAmount = parseFloat(returnRequest.refundAmount);

    try {
      const refundResult = await vendorRefundService.processRefund(
        returnRequest.vendorId,
        returnRequest.id,
        refundAmount,
        returnRequest.vendorOrderId,
        adminId
      );

      const [updatedReturn] = await db
        .update(vendorReturns)
        .set({
          status: 'approved',
          processedBy: adminId,
          processedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(vendorReturns.id, id))
        .returning();

      await db
        .update(vendorOrders)
        .set({
          status: 'returned',
          updatedAt: new Date(),
        })
        .where(eq(vendorOrders.id, returnRequest.vendorOrderId));

      res.json({
        success: true,
        return: updatedReturn,
        refundResult,
        message: 'Return approved and refund processed successfully',
      });
    } catch (refundError: any) {
      if (refundError.message === 'Returns not allowed for upfront payment model') {
        return res.status(400).json({ 
          error: 'Returns not allowed for upfront payment model' 
        });
      }
      throw refundError;
    }
  } catch (error) {
    console.error('Approve return error:', error);
    res.status(500).json({ error: 'Failed to approve return' });
  }
});

// ❌ PUT /api/vendor/returns/:id/reject - Reject return (Admin only)
router.put('/:id/reject', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;
    const adminId = req.session.adminId;

    if (!rejectionReason) {
      return res.status(400).json({ error: 'Rejection reason is required' });
    }

    const [returnRequest] = await db
      .select()
      .from(vendorReturns)
      .where(eq(vendorReturns.id, id));

    if (!returnRequest) {
      return res.status(404).json({ error: 'Return request not found' });
    }

    if (returnRequest.status !== 'pending') {
      return res.status(400).json({ 
        error: `Cannot reject return with status: ${returnRequest.status}` 
      });
    }

    const [updatedReturn] = await db
      .update(vendorReturns)
      .set({
        status: 'rejected',
        processedBy: adminId,
        processedAt: new Date(),
        adminNotes: rejectionReason,
        updatedAt: new Date(),
      })
      .where(eq(vendorReturns.id, id))
      .returning();

    res.json({
      success: true,
      return: updatedReturn,
      message: 'Return rejected successfully',
    });
  } catch (error) {
    console.error('Reject return error:', error);
    res.status(500).json({ error: 'Failed to reject return' });
  }
});

// 📊 GET /api/vendor/returns/analytics - Returns analytics
router.get('/analytics', requireVendorAuth, async (req, res) => {
  try {
    const { vendorId: queryVendorId, startDate, endDate } = req.query;
    const isAdmin = !!req.session.adminId;
    const currentVendorId = req.session.vendorId;

    let targetVendorId: string | undefined;
    
    if (isAdmin && queryVendorId && typeof queryVendorId === 'string') {
      targetVendorId = queryVendorId;
    } else if (currentVendorId) {
      targetVendorId = currentVendorId;
    }

    const conditions: any[] = [];
    
    if (targetVendorId) {
      conditions.push(eq(vendorReturns.vendorId, targetVendorId));
    }

    if (startDate && typeof startDate === 'string') {
      conditions.push(gte(vendorReturns.createdAt, new Date(startDate)));
    }

    if (endDate && typeof endDate === 'string') {
      conditions.push(lte(vendorReturns.createdAt, new Date(endDate)));
    }

    let query = db.select().from(vendorReturns).$dynamic();

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const returns = await query;

    const totalReturns = returns.length;
    const totalRefundAmount = returns.reduce((sum, r) => sum + parseFloat(r.refundAmount), 0);
    const averageRefundAmount = totalReturns > 0 ? totalRefundAmount / totalReturns : 0;

    const returnsByStatus = returns.reduce((acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const returnsByType = returns.reduce((acc, r) => {
      acc[r.returnType] = (acc[r.returnType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    let totalOrders = 0;
    if (targetVendorId) {
      const ordersConditions: any[] = [eq(vendorOrders.vendorId, targetVendorId)];
      
      if (startDate && typeof startDate === 'string') {
        ordersConditions.push(gte(vendorOrders.createdAt, new Date(startDate)));
      }
      
      if (endDate && typeof endDate === 'string') {
        ordersConditions.push(lte(vendorOrders.createdAt, new Date(endDate)));
      }

      const orders = await db
        .select()
        .from(vendorOrders)
        .where(and(...ordersConditions));
      
      totalOrders = orders.length;
    }

    const returnRate = totalOrders > 0 ? ((totalReturns / totalOrders) * 100).toFixed(2) : '0.00';

    res.json({
      success: true,
      analytics: {
        totalReturns,
        totalRefundAmount: totalRefundAmount.toFixed(2),
        averageRefundAmount: averageRefundAmount.toFixed(2),
        returnsByStatus,
        returnsByType,
        returnRatePercentage: returnRate,
        totalOrders,
      },
    });
  } catch (error) {
    console.error('Get returns analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

export default router;
