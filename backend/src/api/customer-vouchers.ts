import { Router } from 'express';
import { db } from '../db';
import { customerVouchers, discountCodes, discountCodeUsages, customers } from '@shared/schema';
import { eq, and, count } from 'drizzle-orm';
import { storage } from '../storage';
import { z } from 'zod';

const router = Router();

const requireCustomerAuth = async (req: any, res: any, next: any) => {
  if (!req.user) {
    return res.status(401).json({ error: "Vui lòng đăng nhập" });
  }

  const customer = await storage.getCustomerByAuthUser(req.user.id);
  if (!customer) {
    return res.status(404).json({ error: "Không tìm thấy thông tin khách hàng" });
  }

  req.customer = customer;
  next();
};

router.use(requireCustomerAuth);

router.get('/', async (req: any, res) => {
  try {
    const customerId = req.customer.id;
    
    const vouchers = await db
      .select({
        voucher: customerVouchers,
        discount: discountCodes,
      })
      .from(customerVouchers)
      .innerJoin(discountCodes, eq(customerVouchers.discountCodeId, discountCodes.id))
      .where(eq(customerVouchers.customerId, customerId));

    const now = new Date();
    
    const active = vouchers
      .filter(v => {
        if (v.voucher.status === 'used' || v.voucher.status === 'revoked') return false;
        if (!v.discount.validUntil) return v.voucher.status === 'active';
        return new Date(v.discount.validUntil) > now && v.voucher.status === 'active';
      })
      .map(v => ({ ...v.voucher, discount: v.discount }));

    const used = vouchers
      .filter(v => v.voucher.status === 'used')
      .map(v => ({ ...v.voucher, discount: v.discount }));

    const expired = vouchers
      .filter(v => {
        if (v.voucher.status === 'used' || v.voucher.status === 'revoked') return false;
        if (!v.discount.validUntil) return false;
        return new Date(v.discount.validUntil) <= now;
      })
      .map(v => ({ ...v.voucher, discount: v.discount }));

    res.json({ active, used, expired });
  } catch (error) {
    console.error('❌ Error fetching customer vouchers:', error);
    res.status(500).json({ error: 'Lỗi hệ thống' });
  }
});

router.post('/claim', async (req: any, res) => {
  try {
    const claimSchema = z.object({
      code: z.string().min(1, "Mã giảm giá không được để trống"),
    });

    const { code } = claimSchema.parse(req.body);
    const customerId = req.customer.id;
    const customer = req.customer;

    const [discountCode] = await db
      .select()
      .from(discountCodes)
      .where(eq(discountCodes.code, code.toUpperCase()));

    if (!discountCode) {
      return res.status(404).json({ 
        status: "error",
        error: "Mã giảm giá không tồn tại" 
      });
    }

    if (discountCode.status !== 'active') {
      return res.status(400).json({ 
        status: "error",
        error: "Mã giảm giá không còn hiệu lực" 
      });
    }

    const now = new Date();
    if (discountCode.validFrom && new Date(discountCode.validFrom) > now) {
      return res.status(400).json({ 
        status: "error",
        error: "Mã giảm giá chưa có hiệu lực" 
      });
    }

    if (discountCode.validUntil && new Date(discountCode.validUntil) <= now) {
      return res.status(400).json({ 
        status: "error",
        error: "Mã giảm giá đã hết hạn" 
      });
    }

    const [existingClaim] = await db
      .select()
      .from(customerVouchers)
      .where(
        and(
          eq(customerVouchers.customerId, customerId),
          eq(customerVouchers.discountCodeId, discountCode.id)
        )
      );

    if (existingClaim) {
      return res.status(409).json({ 
        status: "error",
        error: "Bạn đã lưu mã này rồi" 
      });
    }

    if (discountCode.maxUsage) {
      const [usageStats] = await db
        .select({ count: count() })
        .from(discountCodeUsages)
        .where(eq(discountCodeUsages.discountCodeId, discountCode.id));

      if (usageStats.count >= discountCode.maxUsage) {
        return res.status(400).json({ 
          status: "error",
          error: "Mã giảm giá đã hết lượt sử dụng" 
        });
      }
    }

    const tierRules = discountCode.tierRules as any;
    if (tierRules?.vipCustomerOnly) {
      const vipTiers = ['silver', 'gold', 'diamond', 'platinum', 'vip'];
      if (!vipTiers.includes(customer.membershipTier || '')) {
        return res.status(403).json({ 
          status: "error",
          error: "Mã giảm giá chỉ dành cho khách hàng VIP" 
        });
      }
    }

    if (tierRules?.localCustomerOnly && !customer.isLocalCustomer) {
      return res.status(403).json({ 
        status: "error",
        error: "Mã giảm giá chỉ dành cho khách hàng nội địa" 
      });
    }

    const [newVoucher] = await db
      .insert(customerVouchers)
      .values({
        customerId,
        discountCodeId: discountCode.id,
        claimedVia: 'manual_input',
        status: 'active',
      })
      .returning();

    res.json({
      status: "success",
      message: "Đã lưu mã giảm giá thành công!",
      voucher: newVoucher,
      discount: discountCode,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        status: "error",
        error: error.errors[0].message 
      });
    }
    console.error('❌ Error claiming voucher:', error);
    res.status(500).json({ 
      status: "error",
      error: 'Lỗi hệ thống' 
    });
  }
});

router.get('/:id', async (req: any, res) => {
  try {
    const voucherId = req.params.id;
    const customerId = req.customer.id;

    const [result] = await db
      .select({
        voucher: customerVouchers,
        discount: discountCodes,
      })
      .from(customerVouchers)
      .innerJoin(discountCodes, eq(customerVouchers.discountCodeId, discountCodes.id))
      .where(
        and(
          eq(customerVouchers.id, voucherId),
          eq(customerVouchers.customerId, customerId)
        )
      );

    if (!result) {
      return res.status(404).json({ error: "Không tìm thấy mã giảm giá" });
    }

    const now = new Date();
    let canUse = true;
    let reason: string | undefined;

    if (result.voucher.status === 'used') {
      canUse = false;
      reason = "Mã giảm giá đã được sử dụng";
    } else if (result.voucher.status === 'revoked') {
      canUse = false;
      reason = result.voucher.revokedReason || "Mã giảm giá đã bị thu hồi";
    } else if (result.discount.validUntil && new Date(result.discount.validUntil) <= now) {
      canUse = false;
      reason = "Mã giảm giá đã hết hạn";
    } else if (result.discount.status !== 'active') {
      canUse = false;
      reason = "Mã giảm giá không còn hiệu lực";
    } else if (result.discount.maxUsage) {
      const [usageStats] = await db
        .select({ count: count() })
        .from(discountCodeUsages)
        .where(eq(discountCodeUsages.discountCodeId, result.discount.id));

      if (usageStats.count >= result.discount.maxUsage) {
        canUse = false;
        reason = "Mã giảm giá đã hết lượt sử dụng";
      }
    }

    res.json({
      voucher: result.voucher,
      discount: result.discount,
      canUse,
      reason,
    });
  } catch (error) {
    console.error('❌ Error fetching voucher details:', error);
    res.status(500).json({ error: 'Lỗi hệ thống' });
  }
});

export default router;
