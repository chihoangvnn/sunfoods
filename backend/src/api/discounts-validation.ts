/**
 * 🔍 DISCOUNT CODE VALIDATION & APPLICATION SERVICE
 * 
 * Service for validating and applying discount codes with Vietnamese business rules
 */

import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { 
  discountCodes, 
  discountScopeAssignments, 
  discountCodeUsages,
  customers,
  orders,
  products,
  categories,
  type DiscountApplicationRequest,
  type DiscountApplicationResult,
  type DiscountValidationResult,
  type DiscountCode
} from '@shared/schema';
import { eq, and, or, sql, desc, count, sum, gte, lte } from 'drizzle-orm';

const router = Router();

// Validation schemas
const ValidateDiscountRequestSchema = z.object({
  code: z.string().min(1),
  orderAmount: z.number().min(0),
  customerId: z.string().uuid().optional(),
  channel: z.enum(["online", "pos", "shopee", "tiktok", "facebook"]),
  orderItems: z.array(z.object({
    productId: z.string().uuid(),
    categoryId: z.string().uuid().optional(),
    quantity: z.number().min(1),
    unitPrice: z.number().min(0)
  })).optional()
});

const ApplyDiscountRequestSchema = ValidateDiscountRequestSchema.extend({
  orderId: z.string().uuid()
});

// 🔍 POST /api/discounts/validate - Validate discount code without applying
router.post('/validate', async (req, res) => {
  try {
    const validatedRequest = ValidateDiscountRequestSchema.parse(req.body);
    
    const validationResult = await validateDiscountCode(validatedRequest);
    
    res.json({
      success: true,
      data: validationResult
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Dữ liệu không hợp lệ',
        details: error.errors
      });
    }

    console.error('❌ Error validating discount:', error);
    res.status(500).json({
      success: false,
      error: 'Không thể kiểm tra mã giảm giá'
    });
  }
});

// ✅ POST /api/discounts/apply - Apply discount code to order
router.post('/apply', async (req, res) => {
  try {
    const validatedRequest = ApplyDiscountRequestSchema.parse(req.body);
    
    const applicationResult = await applyDiscountCode(validatedRequest);
    
    if (applicationResult.success) {
      res.json({
        success: true,
        data: applicationResult
      });
    } else {
      res.status(400).json({
        success: false,
        error: applicationResult.message,
        errorCode: applicationResult.errorCode
      });
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Dữ liệu không hợp lệ',
        details: error.errors
      });
    }

    console.error('❌ Error applying discount:', error);
    res.status(500).json({
      success: false,
      error: 'Không thể áp dụng mã giảm giá'
    });
  }
});

// 📊 GET /api/discounts/code/:code/analytics - Get discount code analytics
router.get('/code/:code/analytics', async (req, res) => {
  try {
    const { code } = req.params;

    // Get discount code
    const [discount] = await db
      .select()
      .from(discountCodes)
      .where(eq(discountCodes.code, code));

    if (!discount) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy mã giảm giá'
      });
    }

    // Get usage analytics
    const usageAnalytics = await db
      .select({
        totalUsages: count(),
        totalDiscountGiven: sum(discountCodeUsages.discountAmount),
        averageOrderValue: sql<number>`avg(${discountCodeUsages.originalOrderAmount})`,
        uniqueCustomers: sql<number>`count(distinct ${discountCodeUsages.customerId})`,
        successfulUsages: sql<number>`count(*) filter (where ${discountCodeUsages.wasSuccessful} = true)`,
        onlineUsages: sql<number>`count(*) filter (where ${discountCodeUsages.channel} = 'online')`,
        posUsages: sql<number>`count(*) filter (where ${discountCodeUsages.channel} = 'pos')`,
        shopeeUsages: sql<number>`count(*) filter (where ${discountCodeUsages.channel} = 'shopee')`,
        tiktokUsages: sql<number>`count(*) filter (where ${discountCodeUsages.channel} = 'tiktok')`,
        facebookUsages: sql<number>`count(*) filter (where ${discountCodeUsages.channel} = 'facebook')`
      })
      .from(discountCodeUsages)
      .where(eq(discountCodeUsages.discountCodeId, discount.id));

    const analytics = usageAnalytics[0];

    // Get daily usage trend (last 30 days)
    const dailyUsage = await db
      .select({
        date: sql<string>`date(${discountCodeUsages.usedAt})`,
        usages: count(),
        totalDiscount: sum(discountCodeUsages.discountAmount)
      })
      .from(discountCodeUsages)
      .where(
        and(
          eq(discountCodeUsages.discountCodeId, discount.id),
          gte(discountCodeUsages.usedAt, sql`current_date - interval '30 days'`)
        )
      )
      .groupBy(sql`date(${discountCodeUsages.usedAt})`)
      .orderBy(sql`date(${discountCodeUsages.usedAt})`);

    res.json({
      success: true,
      data: {
        discount: {
          id: discount.id,
          code: discount.code,
          name: discount.name,
          type: discount.type,
          status: discount.status
        },
        analytics: {
          ...analytics,
          successRate: analytics.totalUsages > 0 ? 
            Math.round((analytics.successfulUsages / analytics.totalUsages) * 100) : 0,
          usagePercentage: discount.maxUsage ? 
            Math.round((analytics.totalUsages / discount.maxUsage) * 100) : 0,
          averageDiscountAmount: analytics.totalUsages > 0 && analytics.totalDiscountGiven ? 
            (Number(analytics.totalDiscountGiven) / analytics.totalUsages) : 0
        },
        trends: {
          dailyUsage,
          channelBreakdown: {
            online: analytics.onlineUsages,
            pos: analytics.posUsages,
            shopee: analytics.shopeeUsages,
            tiktok: analytics.tiktokUsages,
            facebook: analytics.facebookUsages
          }
        }
      }
    });

  } catch (error) {
    console.error('❌ Error getting discount analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Không thể tải thống kê mã giảm giá'
    });
  }
});

// 📋 GET /api/discounts/customer/:customerId/eligible - Get eligible discounts for customer
router.get('/customer/:customerId/eligible', async (req, res) => {
  try {
    const { customerId } = req.params;
    const { orderAmount = '0', channel = 'online' } = req.query;

    const eligibleDiscounts = await getEligibleDiscountsForCustomer(
      customerId,
      parseFloat(orderAmount as string),
      channel as string
    );

    res.json({
      success: true,
      data: eligibleDiscounts
    });

  } catch (error) {
    console.error('❌ Error getting eligible discounts:', error);
    res.status(500).json({
      success: false,
      error: 'Không thể tải mã giảm giá khả dụng'
    });
  }
});

// 🔍 CORE VALIDATION FUNCTIONS

async function validateDiscountCode(request: DiscountApplicationRequest): Promise<DiscountValidationResult> {
  // 1. Get discount code
  const [discount] = await db
    .select()
    .from(discountCodes)
    .where(eq(discountCodes.code, request.code.toUpperCase()));

  if (!discount) {
    return {
      isValid: false,
      reason: 'Mã giảm giá không tồn tại',
      errorCode: 'CODE_NOT_FOUND'
    };
  }

  // 2. Check basic status and date validity
  if (discount.status !== 'active') {
    return {
      isValid: false,
      reason: 'Mã giảm giá không khả dụng',
      errorCode: 'CODE_INACTIVE'
    };
  }

  const now = new Date();
  if (now < new Date(discount.validFrom)) {
    return {
      isValid: false,
      reason: 'Mã giảm giá chưa có hiệu lực',
      errorCode: 'CODE_NOT_STARTED'
    };
  }

  if (now > new Date(discount.validUntil)) {
    return {
      isValid: false,
      reason: 'Mã giảm giá đã hết hạn',
      errorCode: 'CODE_EXPIRED'
    };
  }

  // 3. Check usage limits
  if (discount.maxUsage && discount.usageCount >= discount.maxUsage) {
    return {
      isValid: false,
      reason: 'Mã giảm giá đã hết lượt sử dụng',
      errorCode: 'CODE_USAGE_EXCEEDED'
    };
  }

  // 4. Check customer-specific usage limits
  if (request.customerId && discount.maxUsagePerCustomer) {
    const [customerUsage] = await db
      .select({ count: count() })
      .from(discountCodeUsages)
      .where(
        and(
          eq(discountCodeUsages.discountCodeId, discount.id),
          eq(discountCodeUsages.customerId, request.customerId),
          eq(discountCodeUsages.wasSuccessful, true)
        )
      );

    if (customerUsage.count >= discount.maxUsagePerCustomer) {
      return {
        isValid: false,
        reason: 'Bạn đã sử dụng hết lượt cho mã giảm giá này',
        errorCode: 'CUSTOMER_USAGE_EXCEEDED'
      };
    }
  }

  // 5. Check minimum order amount
  if (discount.minOrderAmount && request.orderAmount < parseFloat(discount.minOrderAmount)) {
    return {
      isValid: false,
      reason: `Đơn hàng tối thiểu ${parseFloat(discount.minOrderAmount).toLocaleString('vi-VN')}đ`,
      errorCode: 'MINIMUM_ORDER_NOT_MET'
    };
  }

  // 6. Check channel restrictions
  if (discount.channelRestrictions) {
    const restrictions = discount.channelRestrictions as any;
    
    if (restrictions.allowedChannels && !restrictions.allowedChannels.includes(request.channel)) {
      return {
        isValid: false,
        reason: 'Mã giảm giá không áp dụng cho kênh này',
        errorCode: 'CHANNEL_NOT_ALLOWED'
      };
    }

    if (restrictions.restrictedChannels && restrictions.restrictedChannels.includes(request.channel)) {
      return {
        isValid: false,
        reason: 'Mã giảm giá không áp dụng cho kênh này',
        errorCode: 'CHANNEL_RESTRICTED'
      };
    }
  }

  // 7. Check customer eligibility (VIP, local, first-time buyer)
  if (request.customerId) {
    const customerEligibility = await checkCustomerEligibility(discount, request.customerId);
    if (!customerEligibility.isEligible) {
      return {
        isValid: false,
        reason: customerEligibility.reason,
        errorCode: customerEligibility.errorCode
      };
    }
  }

  // 8. Check scope assignments (product/category restrictions)
  const scopeValidation = await checkScopeRestrictions(discount, request.orderItems || []);
  if (!scopeValidation.isValid) {
    return scopeValidation;
  }

  // 9. Calculate applicable tiers for hybrid_tiered discounts
  const eligibleTiers = calculateEligibleTiers(discount, request.orderAmount);

  return {
    isValid: true,
    discount,
    eligibleTiers
  };
}

async function applyDiscountCode(request: DiscountApplicationRequest): Promise<DiscountApplicationResult> {
  // First validate
  const validation = await validateDiscountCode(request);
  if (!validation.isValid) {
    return {
      success: false,
      discountAmount: 0,
      finalAmount: request.orderAmount,
      message: validation.reason || 'Mã giảm giá không hợp lệ',
      errorCode: validation.errorCode
    };
  }

  const discount = validation.discount!;

  // Calculate discount amount
  const discountCalculation = calculateDiscountAmount(discount, request.orderAmount, validation.eligibleTiers);

  // Record usage in database
  try {
    await db.transaction(async (tx) => {
      // Insert usage record
      await tx.insert(discountCodeUsages).values({
        discountCodeId: discount.id,
        orderId: request.orderId!,
        customerId: request.customerId,
        originalOrderAmount: request.orderAmount.toString(),
        discountAmount: discountCalculation.discountAmount.toString(),
        finalOrderAmount: discountCalculation.finalAmount.toString(),
        channel: request.channel,
        appliedTier: discountCalculation.appliedTier,
        applicationContext: {
          isFirstTimeCustomer: await isFirstTimeCustomer(request.customerId),
          customerMembershipTier: await getCustomerMembershipTier(request.customerId),
          lunarDate: getCurrentLunarDate(),
          festivalContext: getCurrentFestivalContext()
        },
        wasSuccessful: true
      });

      // Update usage count
      await tx
        .update(discountCodes)
        .set({ 
          usageCount: sql`${discountCodes.usageCount} + 1`,
          updatedAt: new Date()
        })
        .where(eq(discountCodes.id, discount.id));
    });

    console.log(`✅ Applied discount code: ${discount.code} - ${discountCalculation.discountAmount}đ off`);

    return {
      success: true,
      discountAmount: discountCalculation.discountAmount,
      finalAmount: discountCalculation.finalAmount,
      appliedCode: discount,
      appliedTier: discountCalculation.appliedTier,
      message: getSuccessMessage(discount, discountCalculation.discountAmount)
    };

  } catch (error) {
    console.error('❌ Error recording discount usage:', error);
    
    // Record failed usage
    await db.insert(discountCodeUsages).values({
      discountCodeId: discount.id,
      orderId: request.orderId!,
      customerId: request.customerId,
      originalOrderAmount: request.orderAmount.toString(),
      discountAmount: '0',
      finalOrderAmount: request.orderAmount.toString(),
      channel: request.channel,
      wasSuccessful: false,
      failureReason: 'Database error during application'
    });

    return {
      success: false,
      discountAmount: 0,
      finalAmount: request.orderAmount,
      message: 'Có lỗi xảy ra khi áp dụng mã giảm giá',
      errorCode: 'APPLICATION_ERROR'
    };
  }
}

function calculateDiscountAmount(discount: DiscountCode, orderAmount: number, eligibleTiers?: any[]) {
  let discountAmount = 0;
  let appliedTier = '';

  if (discount.type === 'percentage') {
    discountAmount = (orderAmount * parseFloat(discount.discountValue)) / 100;
    
    // Apply max discount cap
    if (discount.maxDiscountAmount) {
      discountAmount = Math.min(discountAmount, parseFloat(discount.maxDiscountAmount));
    }
  } 
  else if (discount.type === 'fixed_amount') {
    discountAmount = parseFloat(discount.discountValue);
  }
  else if (discount.type === 'hybrid_tiered' && eligibleTiers && eligibleTiers.length > 0) {
    // Find the best tier for this order amount
    const bestTier = eligibleTiers
      .filter(tier => orderAmount >= tier.minSpend)
      .sort((a, b) => b.minSpend - a.minSpend)[0]; // Highest minSpend tier that qualifies

    if (bestTier) {
      if (bestTier.discountPercent) {
        discountAmount = (orderAmount * bestTier.discountPercent) / 100;
      } else if (bestTier.fixedAmount) {
        discountAmount = bestTier.fixedAmount;
      }
      appliedTier = bestTier.label;
    }
  }

  // Ensure discount doesn't exceed order amount
  discountAmount = Math.min(discountAmount, orderAmount);
  const finalAmount = Math.max(0, orderAmount - discountAmount);

  return {
    discountAmount: Math.round(discountAmount),
    finalAmount: Math.round(finalAmount),
    appliedTier
  };
}

function calculateEligibleTiers(discount: DiscountCode, orderAmount: number) {
  if (discount.type !== 'hybrid_tiered' || !discount.tierRules) return [];
  
  const tierRules = discount.tierRules as any;
  if (!tierRules.tiers) return [];

  return tierRules.tiers
    .filter((tier: any) => orderAmount >= tier.minSpend)
    .map((tier: any) => ({
      minSpend: tier.minSpend,
      discountAmount: tier.discountPercent ? 
        Math.min((orderAmount * tier.discountPercent) / 100, discount.maxDiscountAmount ? parseFloat(discount.maxDiscountAmount) : Infinity) :
        tier.fixedAmount || 0,
      label: tier.label
    }));
}

// Helper functions (stubs - implement based on your business logic)
async function checkCustomerEligibility(discount: DiscountCode, customerId: string) {
  // Implementation depends on your customer data structure
  return { 
    isEligible: true,
    reason: '',
    errorCode: '' as const
  };
}

async function checkScopeRestrictions(discount: DiscountCode, orderItems: any[]) {
  // Implementation depends on your scope assignment logic
  return { isValid: true };
}

async function getEligibleDiscountsForCustomer(customerId: string, orderAmount: number, channel: string) {
  // Implementation depends on your business rules
  return [];
}

async function isFirstTimeCustomer(customerId?: string) {
  if (!customerId) return false;
  // Check if customer has any previous orders
  return false;
}

async function getCustomerMembershipTier(customerId?: string) {
  if (!customerId) return 'guest';
  // Get customer membership tier
  return 'bronze';
}

function getCurrentLunarDate() {
  // Calculate Vietnamese lunar calendar date
  return new Date().toISOString().split('T')[0];
}

function getCurrentFestivalContext() {
  // Determine current Vietnamese festival/holiday
  return '';
}

function getSuccessMessage(discount: DiscountCode, discountAmount: number) {
  const messages = discount.localizedMessages as any;
  const defaultMessage = `Áp dụng mã thành công! Bạn được giảm ${discountAmount.toLocaleString('vi-VN')}đ`;
  
  return messages?.vi?.successMessage?.replace('{amount}', discountAmount.toLocaleString('vi-VN') + 'đ') || defaultMessage;
}

export default router;