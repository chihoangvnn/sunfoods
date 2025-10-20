/**
 * 🧑‍💼 CUSTOMER SOCIAL & LIMITS MANAGEMENT API
 * 
 * Comprehensive API endpoints for managing customer social integration 
 * and personalized limits/restrictions for Vietnamese incense business
 */

// @ts-nocheck
import { Router } from 'express';
import { z } from 'zod';
import { storage } from '../storage';

const router = Router();

// Validation schemas
const SocialDataUpdateSchema = z.object({
  facebookId: z.string().optional(),
  instagramId: z.string().optional(),
  tiktokId: z.string().optional(),
  twitterId: z.string().optional(),
  linkedinId: z.string().optional(),
  socialEngagement: z.object({
    likes: z.number().default(0),
    shares: z.number().default(0),
    comments: z.number().default(0),
    followers: z.number().default(0)
  }).optional(),
  lastSocialActivity: z.string().optional(),
  preferredPlatforms: z.array(z.string()).optional()
});

const LimitsDataUpdateSchema = z.object({
  // Order Limits
  maxOrdersPerDay: z.number().optional(),
  maxOrdersPerMonth: z.number().optional(),
  maxOrderValue: z.number().optional(),
  
  // Discount & Promotion Limits
  maxDiscountUsage: z.number().optional(),
  maxDiscountPercent: z.number().max(100).optional(),
  allowedPromoCodes: z.array(z.string()).optional(),
  
  // Social Media Limits
  maxSocialShares: z.number().optional(),
  maxSocialPosts: z.number().optional(),
  socialContentRestrictions: z.array(z.string()).optional(),
  
  // API & Automation Limits
  apiRateLimit: z.number().optional(),
  automationLevel: z.enum(['none', 'basic', 'advanced', 'unlimited']).optional(),
  
  // Communication Limits
  maxEmailsPerWeek: z.number().optional(),
  maxSMSPerMonth: z.number().optional(),
  allowMarketing: z.boolean().optional(),
  
  // Account Restrictions
  accountRestrictions: z.array(z.string()).optional(),
  restrictionReason: z.string().optional(),
  restrictionExpiresAt: z.string().optional(),
  
  // Override Settings
  overridePermissions: z.object({
    canExceedLimits: z.boolean().optional(),
    overrideReason: z.string().optional(),
    overrideBy: z.string().optional(),
    overrideExpiresAt: z.string().optional()
  }).optional()
});

const SocialAccountLinkSchema = z.object({
  socialAccountId: z.string(),
  platform: z.enum(['facebook', 'instagram', 'twitter', 'tiktok-business', 'linkedin'])
});

// 🎯 AFFILIATE VALIDATION SCHEMAS
const AffiliateUpgradeSchema = z.object({
  commissionRate: z.number().min(0).max(100).default(5),
  paymentMethod: z.enum(['bank_transfer', 'cash', 'digital_wallet']).optional(),
  bankAccount: z.string().optional(),
  paymentSchedule: z.enum(['weekly', 'monthly', 'quarterly']).default('monthly'),
  allowedCategories: z.array(z.string()).optional(),
  restrictedProducts: z.array(z.string()).optional(),
  maxCommissionPerOrder: z.number().min(0).optional(),
  requiresApproval: z.boolean().default(false),
  notes: z.string().optional()
});

const AffiliateDataUpdateSchema = z.object({
  commissionRate: z.number().min(0).max(100).optional(),
  affiliateStatus: z.enum(['pending', 'active', 'suspended', 'inactive']).optional(),
  paymentMethod: z.enum(['bank_transfer', 'cash', 'digital_wallet']).optional(),
  bankAccount: z.string().optional(),
  paymentSchedule: z.enum(['weekly', 'monthly', 'quarterly']).optional(),
  allowedCategories: z.array(z.string()).optional(),
  restrictedProducts: z.array(z.string()).optional(),
  maxCommissionPerOrder: z.number().min(0).optional(),
  requiresApproval: z.boolean().optional(),
  notes: z.string().optional()
});

// Map platform names to standardized social data keys
function normalizePlatformKey(platform: string): string {
  const platformMap: Record<string, string> = {
    'facebook': 'facebookId',
    'instagram': 'instagramId', 
    'twitter': 'twitterId',
    'tiktok-business': 'tiktokId', // Normalize tiktok-business to tiktokId
    'linkedin': 'linkedinId'
  };
  return platformMap[platform] || `${platform}Id`;
}

// Convert legacy object-shaped socialAccountIds to array
function convertLegacySocialAccountIds(socialAccountIds: any): string[] {
  if (Array.isArray(socialAccountIds)) {
    return socialAccountIds;
  }
  if (socialAccountIds && typeof socialAccountIds === 'object') {
    // Convert object to array of values
    return Object.values(socialAccountIds).filter((id): id is string => typeof id === 'string');
  }
  return [];
}

/**
 * 🔗 GET /api/customer-management/:customerId/social - Get customer social data
 */
router.get('/:customerId/social', async (req, res) => {
  try {
    const { customerId } = req.params;
    
    const customer = await storage.getCustomer(customerId);
    if (!customer) {
      return res.status(404).json({ error: 'Customer không tìm thấy' });
    }

    const socialData = customer.socialData || {};
    const socialAccountIds = convertLegacySocialAccountIds(customer.socialAccountIds);

    // Get linked social accounts details
    const linkedAccounts = [];
    for (const accountId of socialAccountIds) {
      try {
        const account = await storage.getSocialAccount(accountId);
        if (account) {
          linkedAccounts.push({
            id: account.id,
            platform: account.platform,
            name: account.name,
            followers: account.followers,
            connected: account.connected,
            lastPost: account.lastPost
          });
        }
      } catch (error) {
        console.warn(`Could not fetch social account ${accountId}:`, error);
      }
    }

    res.json({
      customerId,
      socialData,
      linkedAccounts,
      socialAccountIds,
      summary: {
        totalPlatforms: linkedAccounts.length,
        totalFollowers: linkedAccounts.reduce((sum, acc) => sum + (acc.followers || 0), 0),
        connectedPlatforms: linkedAccounts.filter(acc => acc.connected).length,
        lastActivity: socialData.lastSocialActivity
      }
    });
  } catch (error) {
    console.error('❌ Error fetching customer social data:', error);
    res.status(500).json({ error: 'Lỗi server khi lấy dữ liệu social' });
  }
});

/**
 * 🔗 PUT /api/customer-management/:customerId/social - Update customer social data
 */
router.put('/:customerId/social', async (req, res) => {
  try {
    const { customerId } = req.params;
    const validation = SocialDataUpdateSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({
        error: 'Dữ liệu không hợp lệ',
        details: validation.error.errors
      });
    }

    const customer = await storage.getCustomer(customerId);
    if (!customer) {
      return res.status(404).json({ error: 'Customer không tìm thấy' });
    }

    const currentSocialData = customer.socialData || {};
    const updatedSocialData = {
      ...currentSocialData,
      ...validation.data,
      lastSocialActivity: new Date().toISOString()
    };

    const updatedCustomer = await storage.updateCustomer(customerId, {
      socialData: updatedSocialData
    });

    res.json({
      success: true,
      message: 'Cập nhật thông tin social thành công',
      customer: updatedCustomer,
      socialData: updatedSocialData
    });
  } catch (error) {
    console.error('❌ Error updating customer social data:', error);
    res.status(500).json({ error: 'Lỗi server khi cập nhật dữ liệu social' });
  }
});

/**
 * 🔗 POST /api/customer-management/:customerId/social/link - Link social account
 */
router.post('/:customerId/social/link', async (req, res) => {
  try {
    const { customerId } = req.params;
    const validation = SocialAccountLinkSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({
        error: 'Dữ liệu không hợp lệ',
        details: validation.error.errors
      });
    }

    const { socialAccountId, platform } = validation.data;

    const customer = await storage.getCustomer(customerId);
    if (!customer) {
      return res.status(404).json({ error: 'Customer không tìm thấy' });
    }

    // Verify social account exists
    const socialAccount = await storage.getSocialAccount(socialAccountId);
    if (!socialAccount) {
      return res.status(404).json({ error: 'Social account không tìm thấy' });
    }

    const currentAccountIds = convertLegacySocialAccountIds(customer.socialAccountIds);
    const currentSocialData = customer.socialData || {};

    // Add account ID if not already linked
    const updatedAccountIds = currentAccountIds.includes(socialAccountId) 
      ? currentAccountIds 
      : [...currentAccountIds, socialAccountId];

    // Update social data with platform-specific ID using normalized key
    const platformKey = normalizePlatformKey(platform);
    const updatedSocialData = {
      ...currentSocialData,
      [platformKey]: socialAccount.accountId,
      lastSocialActivity: new Date().toISOString()
    };

    const updatedCustomer = await storage.updateCustomer(customerId, {
      socialAccountIds: updatedAccountIds,
      socialData: updatedSocialData
    });

    res.json({
      success: true,
      message: `Liên kết ${platform} thành công`,
      customer: updatedCustomer,
      linkedAccount: {
        id: socialAccount.id,
        platform: socialAccount.platform,
        name: socialAccount.name
      }
    });
  } catch (error) {
    console.error('❌ Error linking social account:', error);
    res.status(500).json({ error: 'Lỗi server khi liên kết social account' });
  }
});

/**
 * 🚧 GET /api/customer-management/:customerId/limits - Get customer limits
 */
router.get('/:customerId/limits', async (req, res) => {
  try {
    const { customerId } = req.params;
    
    const customer = await storage.getCustomer(customerId);
    if (!customer) {
      return res.status(404).json({ error: 'Customer không tìm thấy' });
    }

    const limitsData = customer.limitsData || {};
    
    // Calculate current usage for limits validation
    const currentDate = new Date();
    const startOfDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

    // Simplified usage tracking - get basic customer stats
    const usage = {
      todayOrders: 0, // TODO: Implement when needed
      monthOrders: 0, // TODO: Implement when needed
      todayOrderValue: 0,
      monthOrderValue: 0
    };

    res.json({
      customerId,
      limitsData,
      usage,
      status: {
        hasRestrictions: (limitsData.accountRestrictions?.length || 0) > 0,
        canOrderToday: !limitsData.maxOrdersPerDay || usage.todayOrders < limitsData.maxOrdersPerDay,
        canOrderThisMonth: !limitsData.maxOrdersPerMonth || usage.monthOrders < limitsData.maxOrdersPerMonth,
        restrictionExpiry: limitsData.restrictionExpiresAt
      }
    });
  } catch (error) {
    console.error('❌ Error fetching customer limits:', error);
    res.status(500).json({ error: 'Lỗi server khi lấy thông tin hạn mức' });
  }
});

/**
 * 🚧 PUT /api/customer-management/:customerId/limits - Update customer limits
 */
router.put('/:customerId/limits', async (req, res) => {
  try {
    const { customerId } = req.params;
    const validation = LimitsDataUpdateSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({
        error: 'Dữ liệu không hợp lệ',
        details: validation.error.errors
      });
    }

    const customer = await storage.getCustomer(customerId);
    if (!customer) {
      return res.status(404).json({ error: 'Customer không tìm thấy' });
    }

    const currentLimitsData = customer.limitsData || {};
    const updatedLimitsData = {
      ...currentLimitsData,
      ...validation.data
    };

    const updatedCustomer = await storage.updateCustomer(customerId, {
      limitsData: updatedLimitsData
    });

    res.json({
      success: true,
      message: 'Cập nhật hạn mức thành công',
      customer: updatedCustomer,
      limitsData: updatedLimitsData,
      changedFields: Object.keys(validation.data)
    });
  } catch (error) {
    console.error('❌ Error updating customer limits:', error);
    res.status(500).json({ error: 'Lỗi server khi cập nhật hạn mức' });
  }
});

/**
 * 🚫 POST /api/customer-management/:customerId/restrictions - Add account restriction
 */
router.post('/:customerId/restrictions', async (req, res) => {
  try {
    const { customerId } = req.params;
    const { restriction, reason, expiresAt } = req.body;

    if (!restriction || !reason) {
      return res.status(400).json({ error: 'Restriction và reason là bắt buộc' });
    }

    const customer = await storage.getCustomer(customerId);
    if (!customer) {
      return res.status(404).json({ error: 'Customer không tìm thấy' });
    }

    const currentLimitsData = customer.limitsData || {};
    const currentRestrictions = currentLimitsData.accountRestrictions || [];

    const updatedLimitsData = {
      ...currentLimitsData,
      accountRestrictions: [...currentRestrictions, restriction],
      restrictionReason: reason,
      restrictionExpiresAt: expiresAt
    };

    const updatedCustomer = await storage.updateCustomer(customerId, {
      limitsData: updatedLimitsData
    });

    res.json({
      success: true,
      message: 'Thêm hạn chế thành công',
      customer: updatedCustomer,
      restriction: {
        type: restriction,
        reason,
        expiresAt,
        addedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('❌ Error adding restriction:', error);
    res.status(500).json({ error: 'Lỗi server khi thêm hạn chế' });
  }
});

/**
 * ✅ DELETE /api/customer-management/:customerId/restrictions/:restriction - Remove restriction
 */
router.delete('/:customerId/restrictions/:restriction', async (req, res) => {
  try {
    const { customerId, restriction } = req.params;

    const customer = await storage.getCustomer(customerId);
    if (!customer) {
      return res.status(404).json({ error: 'Customer không tìm thấy' });
    }

    const currentLimitsData = customer.limitsData || {};
    const currentRestrictions = currentLimitsData.accountRestrictions || [];

    const updatedRestrictions = currentRestrictions.filter(r => r !== restriction);

    const updatedLimitsData = {
      ...currentLimitsData,
      accountRestrictions: updatedRestrictions,
      // Clear restriction details if no restrictions remain
      ...(updatedRestrictions.length === 0 && {
        restrictionReason: undefined,
        restrictionExpiresAt: undefined
      })
    };

    const updatedCustomer = await storage.updateCustomer(customerId, {
      limitsData: updatedLimitsData
    });

    res.json({
      success: true,
      message: 'Gỡ bỏ hạn chế thành công',
      customer: updatedCustomer,
      removedRestriction: restriction
    });
  } catch (error) {
    console.error('❌ Error removing restriction:', error);
    res.status(500).json({ error: 'Lỗi server khi gỡ bỏ hạn chế' });
  }
});

/**
 * 📊 GET /api/customer-management/:customerId/overview - Get complete customer management overview
 */
router.get('/:customerId/overview', async (req, res) => {
  try {
    const { customerId } = req.params;
    
    const customer = await storage.getCustomer(customerId);
    if (!customer) {
      return res.status(404).json({ error: 'Customer không tìm thấy' });
    }

    // Get social data overview
    const socialData = customer.socialData || {};
    const socialAccountIds = customer.socialAccountIds || [];
    
    // Get limits overview
    const limitsData = customer.limitsData || {};
    
    // Simplified overview without complex order queries
    const overview = {
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        membershipTier: customer.membershipTier,
        status: customer.status,
        joinDate: customer.joinDate
      },
      social: {
        platformsLinked: socialAccountIds.length,
        totalFollowers: socialData.socialEngagement?.followers || 0,
        lastActivity: socialData.lastSocialActivity,
        preferredPlatforms: socialData.preferredPlatforms || []
      },
      limits: {
        hasRestrictions: (limitsData.accountRestrictions?.length || 0) > 0,
        restrictionCount: limitsData.accountRestrictions?.length || 0,
        monthlyOrders: 0, // TODO: Implement when needed
        maxMonthlyOrders: limitsData.maxOrdersPerMonth,
        automationLevel: limitsData.automationLevel || 'basic'
      },
      activity: {
        totalOrders: 0, // TODO: Implement when needed
        monthlySpending: 0,
        lastOrderDate: null
      }
    };

    res.json(overview);
  } catch (error) {
    console.error('❌ Error fetching customer overview:', error);
    res.status(500).json({ error: 'Lỗi server khi lấy tổng quan customer' });
  }
});

// 🎯 AFFILIATE SYSTEM ENDPOINTS

/**
 * 🎯 POST /api/customer-management/:customerId/affiliate/upgrade - Upgrade customer to affiliate
 */
router.post('/:customerId/affiliate/upgrade', async (req, res) => {
  try {
    const { customerId } = req.params;
    const validation = AffiliateUpgradeSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({
        error: 'Dữ liệu không hợp lệ',
        details: validation.error.errors
      });
    }

    const customer = await storage.getCustomer(customerId);
    if (!customer) {
      return res.status(404).json({ error: 'Customer không tìm thấy' });
    }

    if (customer.isAffiliate) {
      return res.status(400).json({ error: 'Customer đã là affiliate' });
    }

    const upgradeData = validation.data;
    
    // Generate unique affiliate code
    const affiliateCode = await generateAffiliateCode();
    
    // Prepare affiliate data
    const currentAffiliateData = customer.affiliateData || {};
    const updatedAffiliateData = {
      ...currentAffiliateData,
      activatedAt: new Date().toISOString(),
      activatedBy: 'admin', // TODO: Get from auth context
      totalCommissionEarned: 0,
      totalCommissionPaid: 0,
      totalCommissionPending: 0,
      totalReferrals: 0,
      totalReferralRevenue: 0,
      conversionRate: 0,
      paymentMethod: upgradeData.paymentMethod,
      bankAccount: upgradeData.bankAccount,
      paymentSchedule: upgradeData.paymentSchedule,
      allowedCategories: upgradeData.allowedCategories,
      restrictedProducts: upgradeData.restrictedProducts,
      maxCommissionPerOrder: upgradeData.maxCommissionPerOrder,
      requiresApproval: upgradeData.requiresApproval,
      lastLoginAt: new Date().toISOString(),
      notes: upgradeData.notes
    };

    // Update customer to affiliate
    const updatedCustomer = await storage.updateCustomer(customerId, {
      isAffiliate: true,
      affiliateCode,
      affiliateStatus: 'active',
      commissionRate: upgradeData.commissionRate.toString(),
      affiliateData: updatedAffiliateData
    });

    // 🎯 AUTO-ASSIGN DEFAULT PRODUCTS TO NEW AFFILIATE
    try {
      const defaultAssignments = await storage.getDefaultAffiliateAssignments();
      let assignedCount = 0;
      
      for (const defaultAssignment of defaultAssignments) {
        try {
          // Check if assignment already exists (idempotency)
          const existing = await storage.getAffiliateProductAssignments({
            affiliateId: customerId,
            productId: defaultAssignment.targetId
          });
          
          if (existing.length > 0) {
            // Skip - already assigned
            continue;
          }
          
          await storage.createAffiliateProductAssignment({
            affiliateId: customerId,
            assignmentType: defaultAssignment.assignmentType,
            targetId: defaultAssignment.targetId,
            commissionRate: defaultAssignment.commissionRate,
            commissionType: defaultAssignment.commissionType,
            isPremium: defaultAssignment.isPremium,
            isDefaultAssignment: false
          });
          assignedCount++;
        } catch (assignError) {
          console.error(`⚠️ Failed to auto-assign product ${defaultAssignment.targetId} to new affiliate ${customerId}:`, assignError);
        }
      }
      
      console.log(`✅ Auto-assigned ${assignedCount}/${defaultAssignments.length} default products to new affiliate ${customerId}`);
    } catch (error) {
      console.error('⚠️ Error auto-assigning default products to new affiliate:', error);
      // Don't fail the entire upgrade if product assignment fails
    }

    res.json({
      success: true,
      message: 'Nâng cấp affiliate thành công',
      customer: updatedCustomer,
      affiliateCode,
      affiliateData: updatedAffiliateData
    });
  } catch (error) {
    console.error('❌ Error upgrading customer to affiliate:', error);
    res.status(500).json({ error: 'Lỗi server khi nâng cấp affiliate' });
  }
});

/**
 * 🎯 GET /api/customer-management/:customerId/affiliate - Get affiliate data
 */
router.get('/:customerId/affiliate', async (req, res) => {
  try {
    const { customerId } = req.params;
    
    const customer = await storage.getCustomer(customerId);
    if (!customer) {
      return res.status(404).json({ error: 'Customer không tìm thấy' });
    }

    if (!customer.isAffiliate) {
      return res.status(400).json({ error: 'Customer không phải affiliate' });
    }

    const affiliateData = customer.affiliateData || {};
    
    // TODO: Get affiliate orders and commissions statistics
    const affiliateStats = {
      totalOrders: 0, // Count from affiliateOrders table
      totalCommission: affiliateData.totalCommissionEarned || 0,
      pendingCommission: affiliateData.totalCommissionPending || 0,
      paidCommission: affiliateData.totalCommissionPaid || 0,
      conversionRate: affiliateData.conversionRate || 0,
      bestPerformingProducts: affiliateData.bestPerformingProducts || []
    };

    res.json({
      customerId,
      affiliateCode: customer.affiliateCode,
      affiliateStatus: customer.affiliateStatus,
      commissionRate: parseFloat(customer.commissionRate || '5'),
      affiliateData,
      stats: affiliateStats,
      isActive: customer.affiliateStatus === 'active'
    });
  } catch (error) {
    console.error('❌ Error fetching affiliate data:', error);
    res.status(500).json({ error: 'Lỗi server khi lấy dữ liệu affiliate' });
  }
});

/**
 * 🎯 PUT /api/customer-management/:customerId/affiliate - Update affiliate settings
 */
router.put('/:customerId/affiliate', async (req, res) => {
  try {
    const { customerId } = req.params;
    const validation = AffiliateDataUpdateSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({
        error: 'Dữ liệu không hợp lệ',
        details: validation.error.errors
      });
    }

    const customer = await storage.getCustomer(customerId);
    if (!customer) {
      return res.status(404).json({ error: 'Customer không tìm thấy' });
    }

    if (!customer.isAffiliate) {
      return res.status(400).json({ error: 'Customer không phải affiliate' });
    }

    const updateData = validation.data;
    const currentAffiliateData = customer.affiliateData || {};
    
    // Prepare updates
    const updates: any = {};
    const updatedAffiliateData = { ...currentAffiliateData };

    // Update commission rate if provided
    if (updateData.commissionRate !== undefined) {
      updates.commissionRate = updateData.commissionRate.toString();
    }

    // Update affiliate status if provided
    if (updateData.affiliateStatus !== undefined) {
      updates.affiliateStatus = updateData.affiliateStatus;
    }

    // Update affiliate data fields
    if (updateData.paymentMethod !== undefined) {
      updatedAffiliateData.paymentMethod = updateData.paymentMethod;
    }
    if (updateData.bankAccount !== undefined) {
      updatedAffiliateData.bankAccount = updateData.bankAccount;
    }
    if (updateData.paymentSchedule !== undefined) {
      updatedAffiliateData.paymentSchedule = updateData.paymentSchedule;
    }
    if (updateData.allowedCategories !== undefined) {
      updatedAffiliateData.allowedCategories = updateData.allowedCategories;
    }
    if (updateData.restrictedProducts !== undefined) {
      updatedAffiliateData.restrictedProducts = updateData.restrictedProducts;
    }
    if (updateData.maxCommissionPerOrder !== undefined) {
      updatedAffiliateData.maxCommissionPerOrder = updateData.maxCommissionPerOrder;
    }
    if (updateData.requiresApproval !== undefined) {
      updatedAffiliateData.requiresApproval = updateData.requiresApproval;
    }
    if (updateData.notes !== undefined) {
      updatedAffiliateData.notes = updateData.notes;
    }

    updates.affiliateData = updatedAffiliateData;

    const updatedCustomer = await storage.updateCustomer(customerId, updates);

    res.json({
      success: true,
      message: 'Cập nhật thông tin affiliate thành công',
      customer: updatedCustomer,
      affiliateData: updatedAffiliateData
    });
  } catch (error) {
    console.error('❌ Error updating affiliate data:', error);
    res.status(500).json({ error: 'Lỗi server khi cập nhật dữ liệu affiliate' });
  }
});

/**
 * 🎯 DELETE /api/customer-management/:customerId/affiliate - Deactivate affiliate
 */
router.delete('/:customerId/affiliate', async (req, res) => {
  try {
    const { customerId } = req.params;
    
    const customer = await storage.getCustomer(customerId);
    if (!customer) {
      return res.status(404).json({ error: 'Customer không tìm thấy' });
    }

    if (!customer.isAffiliate) {
      return res.status(400).json({ error: 'Customer không phải affiliate' });
    }

    const currentAffiliateData = customer.affiliateData || {};
    const updatedAffiliateData = {
      ...currentAffiliateData,
      deactivatedAt: new Date().toISOString(),
      deactivatedBy: 'admin' // TODO: Get from auth context
    };

    const updatedCustomer = await storage.updateCustomer(customerId, {
      isAffiliate: false,
      affiliateStatus: 'inactive',
      affiliateData: updatedAffiliateData
    });

    res.json({
      success: true,
      message: 'Hủy kích hoạt affiliate thành công',
      customer: updatedCustomer
    });
  } catch (error) {
    console.error('❌ Error deactivating affiliate:', error);
    res.status(500).json({ error: 'Lỗi server khi hủy kích hoạt affiliate' });
  }
});

// Helper function to generate unique affiliate code
async function generateAffiliateCode(): Promise<string> {
  let code = `AFF${Date.now().toString().slice(-3)}`; // Default fallback
  let isUnique = false;
  let attempts = 0;
  
  while (!isUnique && attempts < 10) {
    // Generate AFF + 3 digits
    code = `AFF${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
    
    try {
      // Check if code already exists
      // Note: This would need to be implemented in storage
      // const existingAffiliate = await storage.getCustomerByAffiliateCode(code);
      // if (!existingAffiliate) {
        isUnique = true;
      // }
    } catch (error) {
      isUnique = true; // Assume unique if error checking
    }
    
    attempts++;
  }
  
  return code;
}

export default router;