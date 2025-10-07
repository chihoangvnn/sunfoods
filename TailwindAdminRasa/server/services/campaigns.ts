/**
 * 🎯 CAMPAIGN SERVICE
 * 
 * Centralized business logic for viral campaign operations
 * Handles validation, eligibility checks, and participation limits
 */

import { db } from '../db';
import { 
  campaigns, 
  campaignParticipations, 
  shareVerifications, 
  customerVouchers,
  type Campaign,
  type InsertCampaign,
  type CampaignParticipation
} from '@shared/schema';
import { eq, and, lte, count, sql } from 'drizzle-orm';

/**
 * Validates campaign data before creation or update
 * 
 * @param campaignData - Partial campaign data to validate
 * @returns Validation result with errors if invalid
 */
export async function validateCampaign(campaignData: Partial<InsertCampaign>): Promise<{
  valid: boolean;
  errors?: string[];
}> {
  const errors: string[] = [];

  // 1. Validate start date before end date
  if (campaignData.startDate && campaignData.endDate) {
    const startDate = new Date(campaignData.startDate);
    const endDate = new Date(campaignData.endDate);
    
    if (startDate >= endDate) {
      errors.push("Ngày bắt đầu phải trước ngày kết thúc");
    }
  }

  // 2. Validate reward configuration (must have voucher OR points)
  if (campaignData.rewardType) {
    if (campaignData.rewardType === 'voucher' && !campaignData.rewardVoucherCodeId) {
      errors.push("Phải chọn voucher khi loại thưởng là 'voucher'");
    }
    
    if (campaignData.rewardType === 'points' && (!campaignData.rewardPoints || campaignData.rewardPoints <= 0)) {
      errors.push("Số điểm thưởng phải lớn hơn 0 khi loại thưởng là 'points'");
    }
    
    if (campaignData.rewardType === 'both') {
      if (!campaignData.rewardVoucherCodeId) {
        errors.push("Phải chọn voucher khi loại thưởng là 'both'");
      }
      if (!campaignData.rewardPoints || campaignData.rewardPoints <= 0) {
        errors.push("Số điểm thưởng phải lớn hơn 0 khi loại thưởng là 'both'");
      }
    }
  }

  // 3. Validate anti-fraud settings are reasonable
  if (campaignData.verificationDelayHours !== undefined && campaignData.verificationDelayHours <= 0) {
    errors.push("Thời gian chờ xác minh phải lớn hơn 0 giờ");
  }

  if (campaignData.minEngagementLikes !== undefined && campaignData.minEngagementLikes !== null && campaignData.minEngagementLikes < 0) {
    errors.push("Số lượt thích tối thiểu không được âm");
  }

  if (campaignData.minEngagementShares !== undefined && campaignData.minEngagementShares !== null && campaignData.minEngagementShares < 0) {
    errors.push("Số lượt chia sẻ tối thiểu không được âm");
  }

  if (campaignData.minEngagementComments !== undefined && campaignData.minEngagementComments !== null && campaignData.minEngagementComments < 0) {
    errors.push("Số bình luận tối thiểu không được âm");
  }

  // 4. Validate max participations > 0 if set
  if (campaignData.maxParticipations !== undefined && campaignData.maxParticipations !== null && campaignData.maxParticipations <= 0) {
    errors.push("Số lượng tham gia tối đa phải lớn hơn 0");
  }

  if (campaignData.maxParticipationsPerCustomer !== undefined && campaignData.maxParticipationsPerCustomer !== null && campaignData.maxParticipationsPerCustomer <= 0) {
    errors.push("Số lượng tham gia tối đa mỗi khách hàng phải lớn hơn 0");
  }

  // Return validation result
  return {
    valid: errors.length === 0,
    ...(errors.length > 0 && { errors })
  };
}

/**
 * Checks if a customer is eligible to participate in a campaign
 * 
 * @param campaignId - Campaign ID to check
 * @param customerId - Customer ID to check
 * @returns Eligibility result with reason if not eligible
 */
export async function checkCampaignEligibility(
  campaignId: string,
  customerId: string
): Promise<{
  eligible: boolean;
  reason?: string;
}> {
  // 1. Get campaign details
  const [campaign] = await db
    .select()
    .from(campaigns)
    .where(eq(campaigns.id, campaignId));

  if (!campaign) {
    return {
      eligible: false,
      reason: "Chiến dịch không tồn tại"
    };
  }

  // 2. Check if campaign is active
  if (campaign.status !== 'active') {
    return {
      eligible: false,
      reason: "Chiến dịch chưa kích hoạt hoặc đã tạm dừng"
    };
  }

  // 3. Check if campaign has not ended
  const now = new Date();
  
  if (campaign.endDate && new Date(campaign.endDate) < now) {
    return {
      eligible: false,
      reason: "Chiến dịch đã kết thúc"
    };
  }

  if (campaign.startDate && new Date(campaign.startDate) > now) {
    return {
      eligible: false,
      reason: "Chiến dịch chưa bắt đầu"
    };
  }

  // 4. Check if campaign is not full (maxParticipations)
  if (campaign.maxParticipations) {
    const [participationCount] = await db
      .select({ count: count() })
      .from(campaignParticipations)
      .where(eq(campaignParticipations.campaignId, campaignId));

    if (participationCount.count >= campaign.maxParticipations) {
      return {
        eligible: false,
        reason: "Chiến dịch đã đạt giới hạn số người tham gia"
      };
    }
  }

  // 5. Check per-customer participation limit
  const customerParticipations = await db
    .select({ count: count() })
    .from(campaignParticipations)
    .where(
      and(
        eq(campaignParticipations.campaignId, campaignId),
        eq(campaignParticipations.customerId, customerId)
      )
    );

  const customerCount = customerParticipations[0]?.count || 0;
  const maxPerCustomer = campaign.maxParticipationsPerCustomer || 1;

  if (customerCount >= maxPerCustomer) {
    if (maxPerCustomer === 1) {
      return {
        eligible: false,
        reason: "Bạn đã tham gia chiến dịch này rồi"
      };
    } else {
      return {
        eligible: false,
        reason: `Bạn đã đạt giới hạn ${maxPerCustomer} lần tham gia`
      };
    }
  }

  // Customer is eligible
  return {
    eligible: true
  };
}

/**
 * Validates and parses a Facebook share URL
 * 
 * @param url - Facebook share URL to validate
 * @returns Validation result with extracted post ID if valid
 */
export function validateShareUrl(url: string): {
  valid: boolean;
  facebookPostId?: string;
  error?: string;
} {
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname.toLowerCase();

    // Check if it's a Facebook URL
    if (!hostname.includes('facebook.com') && !hostname.includes('fb.com')) {
      return {
        valid: false,
        error: "URL phải là liên kết Facebook"
      };
    }

    let postId: string | undefined;

    // Format 1: https://www.facebook.com/[username]/posts/[postId]
    const postMatch = parsedUrl.pathname.match(/\/posts\/(\d+)/);
    if (postMatch) {
      postId = postMatch[1];
    }

    // Format 2: https://www.facebook.com/permalink.php?story_fbid=[postId]&id=[pageId]
    if (!postId && parsedUrl.pathname.includes('permalink.php')) {
      const storyFbid = parsedUrl.searchParams.get('story_fbid');
      if (storyFbid) {
        postId = storyFbid;
      }
    }

    // Format 3: https://m.facebook.com/story.php?story_fbid=[postId]&id=[userId]
    if (!postId && parsedUrl.pathname.includes('story.php')) {
      const storyFbid = parsedUrl.searchParams.get('story_fbid');
      if (storyFbid) {
        postId = storyFbid;
      }
    }

    // Format 4: https://www.facebook.com/[username]/videos/[videoId] (for video posts)
    if (!postId) {
      const videoMatch = parsedUrl.pathname.match(/\/videos\/(\d+)/);
      if (videoMatch) {
        postId = videoMatch[1];
      }
    }

    // Format 5: https://www.facebook.com/photo?fbid=[photoId]
    if (!postId && parsedUrl.pathname.includes('photo')) {
      const fbid = parsedUrl.searchParams.get('fbid');
      if (fbid) {
        postId = fbid;
      }
    }

    if (!postId) {
      return {
        valid: false,
        error: "Không thể trích xuất ID bài viết từ URL. Vui lòng sử dụng liên kết trực tiếp đến bài viết Facebook."
      };
    }

    return {
      valid: true,
      facebookPostId: postId
    };
  } catch (error) {
    return {
      valid: false,
      error: "URL không hợp lệ"
    };
  }
}

/**
 * Checks current participation count and limits for a campaign
 * 
 * @param campaignId - Campaign ID to check
 * @returns Participation limit information
 */
export async function checkParticipationLimits(campaignId: string): Promise<{
  canAcceptMore: boolean;
  current: number;
  max: number | null;
}> {
  // Get campaign details
  const [campaign] = await db
    .select()
    .from(campaigns)
    .where(eq(campaigns.id, campaignId));

  if (!campaign) {
    return {
      canAcceptMore: false,
      current: 0,
      max: null
    };
  }

  // Count current participations
  const [participationCount] = await db
    .select({ count: count() })
    .from(campaignParticipations)
    .where(eq(campaignParticipations.campaignId, campaignId));

  const current = participationCount.count;
  const max = campaign.maxParticipations;

  // Check if can accept more
  const canAcceptMore = max === null || current < max;

  return {
    canAcceptMore,
    current,
    max
  };
}

/**
 * Gets all participations that are due for verification
 * Used by background job to process pending verifications
 * 
 * @returns Array of participations ready for verification
 */
export async function getParticipationsDueForVerification(): Promise<CampaignParticipation[]> {
  const now = new Date();

  // Query participations where:
  // - status = 'pending'
  // - verificationScheduledAt <= NOW
  const participations = await db
    .select()
    .from(campaignParticipations)
    .where(
      and(
        eq(campaignParticipations.status, 'pending'),
        lte(campaignParticipations.verificationScheduledAt, now)
      )
    )
    .orderBy(campaignParticipations.verificationScheduledAt);

  return participations;
}
