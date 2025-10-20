import { Router } from 'express';
import { requireAdminAuth } from '../middleware/admin-auth';
import { db } from '../db';
import { campaigns, campaignParticipations, discountCodes, customers } from '@shared/schema';
import { validateCampaign } from '../services/campaigns';
import { z } from 'zod';
import { eq, and, sql, desc, count } from 'drizzle-orm';

const router = Router();

const createCampaignSchema = z.object({
  name: z.string().min(3, { message: 'Tên chiến dịch phải có ít nhất 3 ký tự' }).max(200, { message: 'Tên chiến dịch không được quá 200 ký tự' }),
  description: z.string().optional(),
  type: z.enum(['share_to_earn', 'referral', 'engagement'], {
    errorMap: () => ({ message: 'Loại chiến dịch không hợp lệ' })
  }),
  rewardType: z.enum(['voucher', 'points', 'both'], {
    errorMap: () => ({ message: 'Loại thưởng không hợp lệ' })
  }),
  rewardVoucherCodeId: z.string().uuid({ message: 'ID voucher không hợp lệ' }).optional(),
  rewardPoints: z.number().int().min(0, { message: 'Số điểm thưởng không được âm' }).default(0),
  startDate: z.string().datetime({ message: 'Ngày bắt đầu không hợp lệ' }),
  endDate: z.string().datetime({ message: 'Ngày kết thúc không hợp lệ' }).optional(),
  verificationDelayHours: z.number().int().min(0, { message: 'Thời gian chờ xác minh không được âm' }).default(24),
  minEngagementLikes: z.number().int().min(0, { message: 'Số lượt thích tối thiểu không được âm' }).default(0),
  minEngagementShares: z.number().int().min(0, { message: 'Số lượt chia sẻ tối thiểu không được âm' }).default(0),
  minEngagementComments: z.number().int().min(0, { message: 'Số bình luận tối thiểu không được âm' }).default(0),
  requirePostStillExists: z.boolean().default(true),
  maxParticipations: z.number().int().positive({ message: 'Số lượng tham gia tối đa phải lớn hơn 0' }).optional(),
  maxParticipationsPerCustomer: z.number().int().positive({ message: 'Số lượng tham gia tối đa mỗi khách hàng phải lớn hơn 0' }).default(1),
  shareTemplate: z.string().optional(),
  requiredHashtags: z.array(z.string()).default([])
});

const updateCampaignSchema = createCampaignSchema.partial();

const statusUpdateSchema = z.object({
  status: z.enum(['draft', 'active', 'paused', 'ended'], {
    errorMap: () => ({ message: 'Trạng thái không hợp lệ' })
  })
});

router.get('/admin-campaigns', requireAdminAuth, async (req, res) => {
  try {
    const { status, limit = '50', offset = '0' } = req.query;
    
    const limitNum = Math.min(parseInt(limit as string, 10) || 50, 100);
    const offsetNum = parseInt(offset as string, 10) || 0;

    let whereConditions: any[] = [];

    if (status && ['draft', 'active', 'paused', 'ended'].includes(status as string)) {
      whereConditions.push(eq(campaigns.status, status as any));
    }

    const whereClause = whereConditions.length > 0 
      ? and(...whereConditions)
      : undefined;

    const results = await db
      .select({
        id: campaigns.id,
        name: campaigns.name,
        description: campaigns.description,
        type: campaigns.type,
        rewardType: campaigns.rewardType,
        rewardVoucherCodeId: campaigns.rewardVoucherCodeId,
        rewardPoints: campaigns.rewardPoints,
        status: campaigns.status,
        startDate: campaigns.startDate,
        endDate: campaigns.endDate,
        maxParticipations: campaigns.maxParticipations,
        maxParticipationsPerCustomer: campaigns.maxParticipationsPerCustomer,
        createdAt: campaigns.createdAt,
        updatedAt: campaigns.updatedAt,
        voucherName: discountCodes.name,
        totalParticipations: sql<number>`CAST(COUNT(DISTINCT ${campaignParticipations.id}) AS INTEGER)`,
        rewardedCount: sql<number>`CAST(COUNT(DISTINCT CASE WHEN ${campaignParticipations.status} = 'rewarded' THEN ${campaignParticipations.id} END) AS INTEGER)`
      })
      .from(campaigns)
      .leftJoin(discountCodes, eq(campaigns.rewardVoucherCodeId, discountCodes.id))
      .leftJoin(campaignParticipations, eq(campaignParticipations.campaignId, campaigns.id))
      .where(whereClause)
      .groupBy(
        campaigns.id,
        campaigns.name,
        campaigns.description,
        campaigns.type,
        campaigns.rewardType,
        campaigns.rewardVoucherCodeId,
        campaigns.rewardPoints,
        campaigns.status,
        campaigns.startDate,
        campaigns.endDate,
        campaigns.maxParticipations,
        campaigns.maxParticipationsPerCustomer,
        campaigns.createdAt,
        campaigns.updatedAt,
        discountCodes.name
      )
      .orderBy(desc(campaigns.createdAt))
      .limit(limitNum)
      .offset(offsetNum);

    res.json(results.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      type: row.type,
      rewardType: row.rewardType,
      rewardVoucherCodeId: row.rewardVoucherCodeId,
      rewardPoints: row.rewardPoints,
      status: row.status,
      startDate: row.startDate,
      endDate: row.endDate,
      maxParticipations: row.maxParticipations,
      maxParticipationsPerCustomer: row.maxParticipationsPerCustomer,
      voucherName: row.voucherName,
      totalParticipations: row.totalParticipations || 0,
      rewardedCount: row.rewardedCount || 0,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    })));
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({ error: 'Lỗi lấy danh sách chiến dịch' });
  }
});

router.get('/admin-campaigns/:id', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const [campaign] = await db
      .select({
        id: campaigns.id,
        name: campaigns.name,
        description: campaigns.description,
        type: campaigns.type,
        rewardType: campaigns.rewardType,
        rewardVoucherCodeId: campaigns.rewardVoucherCodeId,
        rewardPoints: campaigns.rewardPoints,
        status: campaigns.status,
        startDate: campaigns.startDate,
        endDate: campaigns.endDate,
        verificationDelayHours: campaigns.verificationDelayHours,
        minEngagementLikes: campaigns.minEngagementLikes,
        minEngagementShares: campaigns.minEngagementShares,
        minEngagementComments: campaigns.minEngagementComments,
        requirePostStillExists: campaigns.requirePostStillExists,
        maxParticipations: campaigns.maxParticipations,
        maxParticipationsPerCustomer: campaigns.maxParticipationsPerCustomer,
        shareTemplate: campaigns.shareTemplate,
        requiredHashtags: campaigns.requiredHashtags,
        createdAt: campaigns.createdAt,
        updatedAt: campaigns.updatedAt,
        createdBy: campaigns.createdBy,
        voucherCode: discountCodes.code,
        voucherName: discountCodes.name,
        voucherDescription: discountCodes.description
      })
      .from(campaigns)
      .leftJoin(discountCodes, eq(campaigns.rewardVoucherCodeId, discountCodes.id))
      .where(eq(campaigns.id, id))
      .limit(1);

    if (!campaign) {
      return res.status(404).json({ error: 'Không tìm thấy chiến dịch' });
    }

    const stats = await db
      .select({
        pending: sql<number>`CAST(COUNT(CASE WHEN ${campaignParticipations.status} = 'pending' THEN 1 END) AS INTEGER)`,
        verifying: sql<number>`CAST(COUNT(CASE WHEN ${campaignParticipations.status} = 'verifying' THEN 1 END) AS INTEGER)`,
        verified: sql<number>`CAST(COUNT(CASE WHEN ${campaignParticipations.status} = 'verified' THEN 1 END) AS INTEGER)`,
        rejected: sql<number>`CAST(COUNT(CASE WHEN ${campaignParticipations.status} = 'rejected' THEN 1 END) AS INTEGER)`,
        rewarded: sql<number>`CAST(COUNT(CASE WHEN ${campaignParticipations.status} = 'rewarded' THEN 1 END) AS INTEGER)`
      })
      .from(campaignParticipations)
      .where(eq(campaignParticipations.campaignId, id));

    res.json({
      ...campaign,
      stats: stats[0] || {
        pending: 0,
        verifying: 0,
        verified: 0,
        rejected: 0,
        rewarded: 0
      }
    });
  } catch (error) {
    console.error('Error fetching campaign:', error);
    res.status(500).json({ error: 'Lỗi lấy thông tin chiến dịch' });
  }
});

router.post('/admin-campaigns', requireAdminAuth, async (req, res) => {
  try {
    const validation = createCampaignSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        error: validation.error.errors[0]?.message || 'Dữ liệu không hợp lệ' 
      });
    }

    const { startDate, endDate, ...restData } = validation.data;
    const campaignDataForValidation = {
      ...restData,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : undefined
    };

    const campaignValidation = await validateCampaign(campaignDataForValidation);
    if (!campaignValidation.valid) {
      return res.status(400).json({ 
        error: campaignValidation.errors?.[0] || 'Dữ liệu chiến dịch không hợp lệ' 
      });
    }
    const [newCampaign] = await db
      .insert(campaigns)
      .values({
        ...restData,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : undefined,
        createdBy: (req as any).admin!.id,
        createdAt: new Date(),
        updatedAt: new Date()
      } as any)
      .returning();

    res.status(201).json(newCampaign);
  } catch (error) {
    console.error('Error creating campaign:', error);
    res.status(500).json({ error: 'Lỗi tạo chiến dịch' });
  }
});

router.patch('/admin-campaigns/:id', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const validation = updateCampaignSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        error: validation.error.errors[0]?.message || 'Dữ liệu không hợp lệ' 
      });
    }

    const [existingCampaign] = await db
      .select()
      .from(campaigns)
      .where(eq(campaigns.id, id))
      .limit(1);

    if (!existingCampaign) {
      return res.status(404).json({ error: 'Không tìm thấy chiến dịch' });
    }

    const { startDate: newStartDate, endDate: newEndDate, ...restValidationData } = validation.data;
    
    const mergedData = {
      ...existingCampaign,
      ...restValidationData,
      startDate: newStartDate ? new Date(newStartDate) : existingCampaign.startDate,
      endDate: newEndDate ? new Date(newEndDate) : existingCampaign.endDate
    };

    const campaignValidation = await validateCampaign(mergedData);
    if (!campaignValidation.valid) {
      return res.status(400).json({ 
        error: campaignValidation.errors?.[0] || 'Dữ liệu chiến dịch không hợp lệ' 
      });
    }

    const { startDate, endDate, ...restData } = validation.data;
    const updateData: any = {
      ...restData,
      updatedAt: new Date()
    };
    
    if (startDate) {
      updateData.startDate = new Date(startDate);
    }
    if (endDate) {
      updateData.endDate = new Date(endDate);
    }

    const [updatedCampaign] = await db
      .update(campaigns)
      .set(updateData as any)
      .where(eq(campaigns.id, id))
      .returning();

    res.json(updatedCampaign);
  } catch (error) {
    console.error('Error updating campaign:', error);
    res.status(500).json({ error: 'Lỗi cập nhật chiến dịch' });
  }
});

router.delete('/admin-campaigns/:id', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const [campaign] = await db
      .select()
      .from(campaigns)
      .where(eq(campaigns.id, id))
      .limit(1);

    if (!campaign) {
      return res.status(404).json({ error: 'Không tìm thấy chiến dịch' });
    }

    const [participationCount] = await db
      .select({ count: count() })
      .from(campaignParticipations)
      .where(eq(campaignParticipations.campaignId, id));

    if (participationCount.count > 0 && campaign.status !== 'draft') {
      return res.status(400).json({ 
        error: 'Chỉ có thể xóa chiến dịch ở trạng thái nháp hoặc chưa có người tham gia' 
      });
    }

    await db
      .delete(campaigns)
      .where(eq(campaigns.id, id));

    res.json({ success: true, message: 'Xóa chiến dịch thành công' });
  } catch (error) {
    console.error('Error deleting campaign:', error);
    res.status(500).json({ error: 'Lỗi xóa chiến dịch' });
  }
});

router.get('/admin-campaigns/:id/participations', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, limit = '50', offset = '0' } = req.query;
    
    const limitNum = Math.min(parseInt(limit as string, 10) || 50, 100);
    const offsetNum = parseInt(offset as string, 10) || 0;

    const [campaign] = await db
      .select()
      .from(campaigns)
      .where(eq(campaigns.id, id))
      .limit(1);

    if (!campaign) {
      return res.status(404).json({ error: 'Không tìm thấy chiến dịch' });
    }

    let whereConditions: any[] = [eq(campaignParticipations.campaignId, id)];

    if (status && ['pending', 'verifying', 'verified', 'rejected', 'rewarded'].includes(status as string)) {
      whereConditions.push(eq(campaignParticipations.status, status as any));
    }

    const results = await db
      .select({
        id: campaignParticipations.id,
        campaignId: campaignParticipations.campaignId,
        customerId: campaignParticipations.customerId,
        customerName: customers.name,
        customerEmail: customers.email,
        customerPhone: customers.phone,
        shareUrl: campaignParticipations.shareUrl,
        submittedAt: campaignParticipations.submittedAt,
        status: campaignParticipations.status,
        verificationScheduledAt: campaignParticipations.verificationScheduledAt,
        lastVerifiedAt: campaignParticipations.lastVerifiedAt,
        rewardedAt: campaignParticipations.rewardedAt,
        voucherId: campaignParticipations.voucherId,
        rejectionReason: campaignParticipations.rejectionReason,
        verificationAttempts: campaignParticipations.verificationAttempts,
        metadata: campaignParticipations.metadata,
        createdAt: campaignParticipations.createdAt,
        updatedAt: campaignParticipations.updatedAt
      })
      .from(campaignParticipations)
      .leftJoin(customers, eq(campaignParticipations.customerId, customers.id))
      .where(and(...whereConditions))
      .orderBy(desc(campaignParticipations.submittedAt))
      .limit(limitNum)
      .offset(offsetNum);

    res.json(results);
  } catch (error) {
    console.error('Error fetching campaign participations:', error);
    res.status(500).json({ error: 'Lỗi lấy danh sách tham gia chiến dịch' });
  }
});

router.patch('/admin-campaigns/:id/status', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const validation = statusUpdateSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        error: validation.error.errors[0]?.message || 'Dữ liệu không hợp lệ' 
      });
    }

    const { status } = validation.data;

    const [existingCampaign] = await db
      .select()
      .from(campaigns)
      .where(eq(campaigns.id, id))
      .limit(1);

    if (!existingCampaign) {
      return res.status(404).json({ error: 'Không tìm thấy chiến dịch' });
    }

    const [updatedCampaign] = await db
      .update(campaigns)
      .set({
        status: status as any,
        updatedAt: new Date()
      } as any)
      .where(eq(campaigns.id, id))
      .returning();

    res.json(updatedCampaign);
  } catch (error) {
    console.error('Error updating campaign status:', error);
    res.status(500).json({ error: 'Lỗi cập nhật trạng thái chiến dịch' });
  }
});

export default router;
