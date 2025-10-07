/**
 * 🎟️ SHARED VOUCHER VALIDATION SERVICE
 * 
 * Centralized voucher validation logic used by both:
 * - /api/checkout/validate-voucher (authenticated customers)
 * - /api/guest-checkout (guest customers)
 * 
 * Eliminates the need for HTTP fetch calls between APIs
 */

import { db } from '../db';
import { 
  discountCodes, 
  discountScopeAssignments, 
  discountCodeUsages,
  customers,
  orders,
  type DiscountCode
} from '@shared/schema';
import { eq, and, count } from 'drizzle-orm';

export interface VoucherValidationItem {
  productId: string;
  categoryId?: string;
  quantity: number;
  price: number;
}

export interface VoucherValidationResult {
  valid: boolean;
  error?: string;
  discount?: {
    code: string;
    type: string;
    value: number;
    discountAmount: number;
    finalTotal: number;
    message: string;
  };
  voucher?: {
    id: string;
    code: string;
    name: string | null;
    description: string | null;
    type: string;
    discountValue: string;
    maxDiscountAmount: string | null;
    minOrderAmount: string | null;
    validFrom: Date | null;
    validUntil: Date | null;
    usageCount: number;
    maxUsage: number | null;
    maxUsagePerCustomer: number | null;
    localizedMessages: unknown;
  };
}

/**
 * Main validation function - validates voucher and calculates discount
 */
export async function validateVoucherForOrder(
  voucherCode: string,
  orderAmount: number,
  customerId?: string,
  items?: VoucherValidationItem[]
): Promise<VoucherValidationResult> {
  try {
    // Normalize voucher code to uppercase
    const normalizedCode = voucherCode.trim().toUpperCase();

    // 1. Check if voucher exists
    const [voucher] = await db
      .select()
      .from(discountCodes)
      .where(eq(discountCodes.code, normalizedCode));

    if (!voucher) {
      return {
        valid: false,
        error: "Mã giảm giá không tồn tại"
      };
    }

    // 2. Check if voucher is active
    if (voucher.status !== 'active') {
      return {
        valid: false,
        error: "Mã giảm giá không khả dụng"
      };
    }

    // 3. Check expiration dates
    const now = new Date();

    if (voucher.validFrom) {
      const validFrom = new Date(voucher.validFrom);
      if (now < validFrom) {
        return {
          valid: false,
          error: `Mã giảm giá chưa có hiệu lực (bắt đầu từ ${validFrom.toLocaleDateString('vi-VN')})`
        };
      }
    }

    if (voucher.validUntil) {
      const validUntil = new Date(voucher.validUntil);
      if (now > validUntil) {
        return {
          valid: false,
          error: "Mã giảm giá đã hết hạn"
        };
      }
    }

    // 4. Check global usage limit
    if (voucher.maxUsage && voucher.usageCount >= voucher.maxUsage) {
      return {
        valid: false,
        error: "Mã giảm giá đã hết lượt sử dụng"
      };
    }

    // 5. Check customer-specific usage limit
    if (customerId && voucher.maxUsagePerCustomer) {
      const [customerUsage] = await db
        .select({ count: count() })
        .from(discountCodeUsages)
        .where(
          and(
            eq(discountCodeUsages.discountCodeId, voucher.id),
            eq(discountCodeUsages.customerId, customerId),
            eq(discountCodeUsages.wasSuccessful, true)
          )
        );

      if (customerUsage.count >= voucher.maxUsagePerCustomer) {
        return {
          valid: false,
          error: `Bạn đã sử dụng hết lượt cho mã giảm giá này (tối đa ${voucher.maxUsagePerCustomer} lần)`
        };
      }
    }

    // 6. Check minimum order amount
    const minOrderAmount = voucher.minOrderAmount ? parseFloat(voucher.minOrderAmount) : 0;
    if (orderAmount < minOrderAmount) {
      return {
        valid: false,
        error: `Đơn hàng chưa đủ ${minOrderAmount.toLocaleString('vi-VN')}đ để áp dụng mã giảm giá`
      };
    }

    // 7. Check customer eligibility (VIP, local, first-time buyer)
    if (customerId) {
      const eligibilityCheck = await checkEligibility(voucher, customerId);
      if (!eligibilityCheck.isEligible) {
        return {
          valid: false,
          error: eligibilityCheck.message
        };
      }
    }

    // 8. Check product/category restrictions
    if (items && items.length > 0) {
      const scopeCheck = await checkScopeRestrictions(voucher, items);
      if (!scopeCheck.isValid) {
        return {
          valid: false,
          error: scopeCheck.message
        };
      }
    }

    // 9. Calculate discount amount
    const discountCalculation = calculateDiscount(voucher, orderAmount);

    // 10. Build success message
    const successMessage = buildSuccessMessage(voucher, discountCalculation);

    // 11. Return success response
    return {
      valid: true,
      discount: {
        code: voucher.code,
        type: voucher.type === 'hybrid_tiered' ? 'percentage' : voucher.type,
        value: parseFloat(voucher.discountValue),
        discountAmount: discountCalculation.discountAmount,
        finalTotal: discountCalculation.finalTotal,
        message: successMessage
      },
      voucher: {
        id: voucher.id,
        code: voucher.code,
        name: voucher.name,
        description: voucher.description,
        type: voucher.type,
        discountValue: voucher.discountValue,
        maxDiscountAmount: voucher.maxDiscountAmount,
        minOrderAmount: voucher.minOrderAmount,
        validFrom: voucher.validFrom,
        validUntil: voucher.validUntil,
        usageCount: voucher.usageCount,
        maxUsage: voucher.maxUsage,
        maxUsagePerCustomer: voucher.maxUsagePerCustomer,
        localizedMessages: voucher.localizedMessages
      }
    };

  } catch (error) {
    console.error('❌ Error in validateVoucherForOrder:', error);
    return {
      valid: false,
      error: 'Có lỗi xảy ra khi kiểm tra mã giảm giá'
    };
  }
}

/**
 * Calculate discount amount based on voucher type
 */
export function calculateDiscount(voucher: DiscountCode, orderAmount: number) {
  let discountAmount = 0;
  let appliedTier = '';

  if (voucher.type === 'percentage') {
    discountAmount = (orderAmount * parseFloat(voucher.discountValue)) / 100;
    
    if (voucher.maxDiscountAmount) {
      discountAmount = Math.min(discountAmount, parseFloat(voucher.maxDiscountAmount));
    }
  } 
  else if (voucher.type === 'fixed_amount') {
    discountAmount = parseFloat(voucher.discountValue);
  }
  else if (voucher.type === 'hybrid_tiered' && voucher.tierRules) {
    const tierRules = voucher.tierRules as any;
    if (tierRules.tiers && Array.isArray(tierRules.tiers)) {
      const applicableTiers = tierRules.tiers
        .filter((tier: any) => orderAmount >= tier.minSpend)
        .sort((a: any, b: any) => b.minSpend - a.minSpend);

      if (applicableTiers.length > 0) {
        const bestTier = applicableTiers[0];
        
        if (bestTier.discountPercent) {
          discountAmount = (orderAmount * bestTier.discountPercent) / 100;
          if (voucher.maxDiscountAmount) {
            discountAmount = Math.min(discountAmount, parseFloat(voucher.maxDiscountAmount));
          }
        } else if (bestTier.fixedAmount) {
          discountAmount = bestTier.fixedAmount;
        }
        
        appliedTier = bestTier.label || '';
      }
    }
  }

  discountAmount = Math.min(discountAmount, orderAmount);
  discountAmount = Math.max(0, discountAmount);

  const finalTotal = Math.max(0, orderAmount - discountAmount);

  return {
    discountAmount: Math.round(discountAmount),
    finalTotal: Math.round(finalTotal),
    appliedTier
  };
}

/**
 * Build success message for voucher validation
 */
function buildSuccessMessage(voucher: DiscountCode, calculation: { discountAmount: number, appliedTier: string }): string {
  const { discountAmount } = calculation;
  
  const messages = voucher.localizedMessages as any;
  if (messages?.vi?.successMessage) {
    return messages.vi.successMessage
      .replace('{amount}', discountAmount.toLocaleString('vi-VN') + 'đ');
  }

  if (voucher.type === 'percentage') {
    const percentage = parseFloat(voucher.discountValue);
    const maxCap = voucher.maxDiscountAmount ? ` (tối đa ${parseFloat(voucher.maxDiscountAmount).toLocaleString('vi-VN')}đ)` : '';
    return `Giảm ${percentage}%${maxCap}`;
  } 
  else if (voucher.type === 'fixed_amount') {
    return `Giảm ${discountAmount.toLocaleString('vi-VN')}đ`;
  }
  else if (voucher.type === 'hybrid_tiered') {
    return `Giảm ${discountAmount.toLocaleString('vi-VN')}đ`;
  }

  return `Giảm ${discountAmount.toLocaleString('vi-VN')}đ`;
}

/**
 * Check customer eligibility based on tier rules
 */
export async function checkEligibility(voucher: DiscountCode, customerId: string): Promise<{ isEligible: boolean, message: string }> {
  if (!voucher.tierRules) {
    return { isEligible: true, message: '' };
  }

  const tierRules = voucher.tierRules as any;

  if (tierRules.vipCustomerOnly) {
    const [customer] = await db
      .select({ membershipTier: customers.membershipTier })
      .from(customers)
      .where(eq(customers.id, customerId));

    if (!customer || customer.membershipTier !== 'diamond') {
      return { 
        isEligible: false, 
        message: 'Mã giảm giá chỉ dành cho khách hàng VIP' 
      };
    }
  }

  if (tierRules.localCustomerOnly) {
    const [customer] = await db
      .select({ isLocalCustomer: customers.isLocalCustomer })
      .from(customers)
      .where(eq(customers.id, customerId));

    if (!customer || !customer.isLocalCustomer) {
      return { 
        isEligible: false, 
        message: 'Mã giảm giá chỉ dành cho khách hàng địa phương' 
      };
    }
  }

  if (tierRules.firstTimeBuyerOnly) {
    const [orderCount] = await db
      .select({ count: count() })
      .from(orders)
      .where(eq(orders.customerId, customerId));

    if (orderCount && orderCount.count > 0) {
      return { 
        isEligible: false, 
        message: 'Mã giảm giá chỉ dành cho khách hàng mới' 
      };
    }
  }

  return { isEligible: true, message: '' };
}

/**
 * Check product/category scope restrictions
 */
export async function checkScopeRestrictions(voucher: DiscountCode, items: Array<{ productId: string, categoryId?: string }>): Promise<{ isValid: boolean, message: string }> {
  const scopeAssignments = await db
    .select()
    .from(discountScopeAssignments)
    .where(eq(discountScopeAssignments.discountCodeId, voucher.id));

  if (scopeAssignments.length === 0) {
    return { isValid: true, message: '' };
  }

  const hasGlobalAssignment = scopeAssignments.some(
    scope => scope.assignmentType === 'global' && !scope.isExclusion
  );

  if (hasGlobalAssignment) {
    return { isValid: true, message: '' };
  }

  const productInclusions = scopeAssignments.filter(
    scope => scope.assignmentType === 'product' && !scope.isExclusion
  );
  const productExclusions = scopeAssignments.filter(
    scope => scope.assignmentType === 'product' && scope.isExclusion
  );
  const categoryInclusions = scopeAssignments.filter(
    scope => scope.assignmentType === 'category' && !scope.isExclusion
  );
  const categoryExclusions = scopeAssignments.filter(
    scope => scope.assignmentType === 'category' && scope.isExclusion
  );

  for (const item of items) {
    if (productExclusions.some(scope => scope.productId === item.productId)) {
      return { 
        isValid: false, 
        message: 'Mã giảm giá không áp dụng cho một số sản phẩm trong giỏ hàng' 
      };
    }

    if (item.categoryId && categoryExclusions.some(scope => scope.categoryId === item.categoryId)) {
      return { 
        isValid: false, 
        message: 'Mã giảm giá không áp dụng cho một số danh mục trong giỏ hàng' 
      };
    }

    if (productInclusions.length > 0) {
      if (!productInclusions.some(scope => scope.productId === item.productId)) {
        return { 
          isValid: false, 
          message: 'Mã giảm giá chỉ áp dụng cho một số sản phẩm cụ thể' 
        };
      }
    }

    if (categoryInclusions.length > 0 && item.categoryId) {
      if (!categoryInclusions.some(scope => scope.categoryId === item.categoryId)) {
        return { 
          isValid: false, 
          message: 'Mã giảm giá chỉ áp dụng cho một số danh mục cụ thể' 
        };
      }
    }
  }

  return { isValid: true, message: '' };
}
