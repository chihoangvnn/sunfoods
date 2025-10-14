import { Router } from 'express';
import { db } from '../db';
import { discountCodes } from '@shared/schema';
import { and, eq, or, isNull, sql } from 'drizzle-orm';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const now = new Date();
    
    const allVouchers = await db
      .select({
        id: discountCodes.id,
        code: discountCodes.code,
        name: discountCodes.name,
        description: discountCodes.description,
        type: discountCodes.type,
        discountValue: discountCodes.discountValue,
        maxDiscountAmount: discountCodes.maxDiscountAmount,
        minOrderAmount: discountCodes.minOrderAmount,
        validFrom: discountCodes.validFrom,
        validUntil: discountCodes.validUntil,
        maxUsage: discountCodes.maxUsage,
        maxUsagePerCustomer: discountCodes.maxUsagePerCustomer,
        usageCount: discountCodes.usageCount,
        status: discountCodes.status,
      })
      .from(discountCodes)
      .where(eq(discountCodes.status, 'active'))
      .orderBy(sql`${discountCodes.validUntil} ASC NULLS LAST`);

    const formattedVouchers = allVouchers.map(voucher => {
      const isExpired = voucher.validUntil && new Date(voucher.validUntil) <= now;
      const isNotStarted = voucher.validFrom && new Date(voucher.validFrom) > now;
      const isFullyUsed = voucher.maxUsage && voucher.usageCount >= voucher.maxUsage;
      
      let voucherStatus = 'available';
      if (isExpired || isFullyUsed) {
        voucherStatus = 'expired';
      } else if (isNotStarted) {
        voucherStatus = 'upcoming';
      }

      return {
        id: voucher.id.toString(),
        code: voucher.code,
        title: voucher.name,
        description: voucher.description || '',
        discount: Number(voucher.discountValue),
        discountType: voucher.type === 'percentage' ? 'percentage' : 'fixed',
        minOrderValue: Number(voucher.minOrderAmount || 0),
        maxDiscountAmount: voucher.maxDiscountAmount ? Number(voucher.maxDiscountAmount) : null,
        expiryDate: voucher.validUntil || null,
        validFrom: voucher.validFrom || null,
        status: voucherStatus,
        maxUsage: voucher.maxUsage,
        usageCount: voucher.usageCount || 0,
        remainingUsage: voucher.maxUsage ? voucher.maxUsage - (voucher.usageCount || 0) : null,
        category: voucher.type === 'percentage' ? 'Giảm %' : 'Giảm tiền',
      };
    });

    const available = formattedVouchers.filter(v => v.status === 'available');
    const upcoming = formattedVouchers.filter(v => v.status === 'upcoming');
    const expired = formattedVouchers.filter(v => v.status === 'expired');

    res.json({
      available,
      upcoming,
      expired,
      total: formattedVouchers.length
    });
  } catch (error) {
    console.error('❌ Error fetching public vouchers:', error);
    res.status(500).json({ error: 'Lỗi hệ thống khi tải vouchers' });
  }
});

export default router;
