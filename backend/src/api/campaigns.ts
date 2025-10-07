import { Router } from 'express';
import { requireCustomerAuth } from '../middleware/customer-auth';
import { db } from '../db';
import { campaigns, campaignParticipations, discountCodes, type InsertCampaignParticipation } from '@shared/schema';
import { 
  checkCampaignEligibility, 
  validateShareUrl, 
  checkParticipationLimits 
} from '../services/campaigns';
import { z } from 'zod';
import { eq, and, lte, gte, or, isNull, desc, sql } from 'drizzle-orm';

const router = Router();

// Zod Schemas
const participateSchema = z.object({
  shareUrl: z.string().url({ message: 'URL không hợp lệ' })
});

// Rate Limiting - In-memory store for participation rate limiting
const participationRateLimiter = new Map<string, number[]>();

function checkRateLimit(customerId: string): boolean {
  const now = Date.now();
  const hourAgo = now - 3600000;
  
  const timestamps = participationRateLimiter.get(customerId) || [];
  const recentTimestamps = timestamps.filter(t => t > hourAgo);
  
  if (recentTimestamps.length >= 5) {
    return false; // Rate limit exceeded
  }
  
  recentTimestamps.push(now);
  participationRateLimiter.set(customerId, recentTimestamps);
  return true;
}

// Clean up old rate limit entries every hour
setInterval(() => {
  const now = Date.now();
  const hourAgo = now - 3600000;
  
  participationRateLimiter.forEach((timestamps, customerId) => {
    const recentTimestamps = timestamps.filter(t => t > hourAgo);
    if (recentTimestamps.length === 0) {
      participationRateLimiter.delete(customerId);
    } else {
      participationRateLimiter.set(customerId, recentTimestamps);
    }
  });
}, 3600000); // Run every hour

/**
 * GET /api/campaigns - List active campaigns
 * Public endpoint - no auth required
 */
router.get('/', async (req, res) => {
  try {
    const now = new Date();
    
    // Get active campaigns with reward details
    const activeCampaigns = await db
      .select({
        id: campaigns.id,
        name: campaigns.name,
        description: campaigns.description,
        type: campaigns.type,
        rewardType: campaigns.rewardType,
        rewardPoints: campaigns.rewardPoints,
        startDate: campaigns.startDate,
        endDate: campaigns.endDate,
        shareTemplate: campaigns.shareTemplate,
        requiredHashtags: campaigns.requiredHashtags,
        maxParticipations: campaigns.maxParticipations,
        maxParticipationsPerCustomer: campaigns.maxParticipationsPerCustomer,
        // Include voucher details
        voucherCode: discountCodes.code,
        voucherName: discountCodes.name,
        voucherDescription: discountCodes.description,
      })
      .from(campaigns)
      .leftJoin(discountCodes, eq(campaigns.rewardVoucherCodeId, discountCodes.id))
      .where(
        and(
          eq(campaigns.status, 'active'),
          lte(campaigns.startDate, now),
          or(
            isNull(campaigns.endDate),
            gte(campaigns.endDate, now)
          )
        )
      )
      .orderBy(desc(campaigns.startDate))
      .limit(50);

    res.json({
      success: true,
      campaigns: activeCampaigns
    });
  } catch (error) {
    console.error('❌ Error fetching campaigns:', error);
    res.status(500).json({ 
      error: 'Không thể tải danh sách chiến dịch',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/campaigns/my-participations - List customer's participations
 * Requires customer authentication
 * NOTE: Must come before /:id route to avoid route conflicts
 */
router.get('/my-participations', requireCustomerAuth, async (req, res) => {
  try {
    const customerId = req.customer!.id;

    // Get all participations for this customer with campaign details
    const participations = await db
      .select({
        id: campaignParticipations.id,
        campaignId: campaignParticipations.campaignId,
        shareUrl: campaignParticipations.shareUrl,
        status: campaignParticipations.status,
        submittedAt: campaignParticipations.submittedAt,
        verificationScheduledAt: campaignParticipations.verificationScheduledAt,
        lastVerifiedAt: campaignParticipations.lastVerifiedAt,
        rejectionReason: campaignParticipations.rejectionReason,
        rewardedAt: campaignParticipations.rewardedAt,
        // Campaign details
        campaignName: campaigns.name,
        campaignType: campaigns.type,
        rewardType: campaigns.rewardType,
        rewardPoints: campaigns.rewardPoints,
        // Voucher details
        voucherCode: discountCodes.code,
        voucherName: discountCodes.name,
      })
      .from(campaignParticipations)
      .leftJoin(campaigns, eq(campaignParticipations.campaignId, campaigns.id))
      .leftJoin(discountCodes, eq(campaigns.rewardVoucherCodeId, discountCodes.id))
      .where(eq(campaignParticipations.customerId, customerId))
      .orderBy(desc(campaignParticipations.submittedAt));

    res.json({
      success: true,
      participations
    });
  } catch (error) {
    console.error('❌ Error fetching customer participations:', error);
    res.status(500).json({ 
      error: 'Không thể tải danh sách tham gia',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/campaigns/:id - Get campaign details
 * Public endpoint
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const now = new Date();
    
    // Get campaign with voucher details
    const [campaign] = await db
      .select({
        id: campaigns.id,
        name: campaigns.name,
        description: campaigns.description,
        type: campaigns.type,
        rewardType: campaigns.rewardType,
        rewardPoints: campaigns.rewardPoints,
        startDate: campaigns.startDate,
        endDate: campaigns.endDate,
        shareTemplate: campaigns.shareTemplate,
        requiredHashtags: campaigns.requiredHashtags,
        maxParticipations: campaigns.maxParticipations,
        maxParticipationsPerCustomer: campaigns.maxParticipationsPerCustomer,
        status: campaigns.status,
        // Voucher details
        voucherCode: discountCodes.code,
        voucherName: discountCodes.name,
        voucherDescription: discountCodes.description,
      })
      .from(campaigns)
      .leftJoin(discountCodes, eq(campaigns.rewardVoucherCodeId, discountCodes.id))
      .where(eq(campaigns.id, id));

    if (!campaign) {
      return res.status(404).json({ 
        error: 'Không tìm thấy chiến dịch' 
      });
    }

    // Check if campaign is active and within date range
    if (campaign.status !== 'active') {
      return res.status(404).json({ 
        error: 'Chiến dịch không hoạt động' 
      });
    }

    const startDate = new Date(campaign.startDate);
    const endDate = campaign.endDate ? new Date(campaign.endDate) : null;

    if (startDate > now) {
      return res.status(404).json({ 
        error: 'Chiến dịch chưa bắt đầu' 
      });
    }

    if (endDate && endDate < now) {
      return res.status(404).json({ 
        error: 'Chiến dịch đã kết thúc' 
      });
    }

    res.json({
      success: true,
      campaign
    });
  } catch (error) {
    console.error('❌ Error fetching campaign details:', error);
    res.status(500).json({ 
      error: 'Không thể tải thông tin chiến dịch',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/campaigns/:id/participate - Submit share participation
 * Requires customer authentication
 */
router.post('/:id/participate', requireCustomerAuth, async (req, res) => {
  try {
    const { id: campaignId } = req.params;
    const customerId = req.customer!.id;

    // Validate request body
    const parseResult = participateSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: 'Dữ liệu không hợp lệ',
        details: parseResult.error.errors
      });
    }

    const { shareUrl } = parseResult.data;

    // Check rate limit
    if (!checkRateLimit(customerId)) {
      return res.status(429).json({
        error: 'Bạn đã tham gia quá nhiều lần. Vui lòng thử lại sau 1 giờ.',
        code: 'RATE_LIMIT_EXCEEDED'
      });
    }

    // 1. Get campaign and check if it exists and is active
    const [campaign] = await db
      .select()
      .from(campaigns)
      .where(eq(campaigns.id, campaignId));

    if (!campaign) {
      return res.status(404).json({ 
        error: 'Không tìm thấy chiến dịch' 
      });
    }

    if (campaign.status !== 'active') {
      return res.status(400).json({ 
        error: 'Chiến dịch không hoạt động' 
      });
    }

    // 2. Check customer eligibility
    const eligibility = await checkCampaignEligibility(campaignId, customerId);
    if (!eligibility.eligible) {
      return res.status(400).json({ 
        error: eligibility.reason || 'Bạn không đủ điều kiện tham gia chiến dịch này',
        code: 'NOT_ELIGIBLE'
      });
    }

    // 3. Validate share URL and extract post ID
    const urlValidation = validateShareUrl(shareUrl);
    if (!urlValidation.valid) {
      return res.status(400).json({ 
        error: urlValidation.error || 'URL chia sẻ không hợp lệ',
        code: 'INVALID_SHARE_URL'
      });
    }

    const facebookPostId = urlValidation.facebookPostId!;

    // 4. Check if this post has already been submitted (across ALL campaigns)
    const existingPost = await db
      .select({
        id: campaignParticipations.id,
        campaignId: campaignParticipations.campaignId,
        campaignName: campaigns.name
      })
      .from(campaignParticipations)
      .leftJoin(campaigns, eq(campaigns.id, campaignParticipations.campaignId))
      .where(sql`${campaignParticipations.metadata}->>'facebookPostId' = ${facebookPostId}`)
      .limit(1);

    if (existingPost.length > 0) {
      const existingCampaign = existingPost[0];
      if (existingCampaign.campaignId === campaignId) {
        return res.status(400).json({
          success: false,
          error: 'Bạn đã chia sẻ bài viết này cho chiến dịch này rồi.',
          code: 'DUPLICATE_POST'
        });
      } else {
        return res.status(400).json({
          success: false,
          error: `Bài viết này đã được sử dụng cho chiến dịch "${existingCampaign.campaignName}". Mỗi bài viết chỉ được dùng một lần.`,
          code: 'DUPLICATE_POST_DIFFERENT_CAMPAIGN'
        });
      }
    }

    // 5. Check participation limits
    const limits = await checkParticipationLimits(campaignId);
    if (!limits.canAcceptMore) {
      return res.status(400).json({ 
        error: 'Chiến dịch đã đạt giới hạn số người tham gia',
        code: 'CAMPAIGN_FULL'
      });
    }

    // 6. Calculate verification scheduled time
    const verificationDelayHours = campaign.verificationDelayHours || 24;
    const verificationScheduledAt = new Date(Date.now() + verificationDelayHours * 3600000);

    // 7. Create participation record
    const participationData: InsertCampaignParticipation = {
      campaignId,
      customerId,
      shareUrl,
      status: 'pending',
      verificationScheduledAt,
      metadata: {
        facebookPostId: facebookPostId,
        ipAddress: req.ip || req.socket.remoteAddress,
        userAgent: req.get('user-agent')
      }
    };

    const [participation] = await db
      .insert(campaignParticipations)
      .values(participationData)
      .returning();

    console.log(`✅ Participation created: ${participation.id} for customer ${customerId} in campaign ${campaignId}`);

    res.status(201).json({
      success: true,
      message: 'Đã gửi tham gia thành công. Chúng tôi sẽ xác minh và trao thưởng trong vòng 24 giờ.',
      participation: {
        id: participation.id,
        status: participation.status,
        submittedAt: participation.submittedAt,
        verificationScheduledAt: participation.verificationScheduledAt
      }
    });
  } catch (error) {
    console.error('❌ Error creating participation:', error);
    res.status(500).json({ 
      error: 'Không thể gửi tham gia',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
