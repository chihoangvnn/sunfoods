// @ts-nocheck
/**
 * 🛒 CHECKOUT VOUCHER VALIDATION API
 * 
 * Customer-facing API for validating discount vouchers at checkout
 * Provides real-time discount preview before order completion
 */

import { Router } from 'express';
import { z } from 'zod';
import { validateVoucherForOrder } from '../services/voucher-validation';

const router = Router();

const ValidateVoucherSchema = z.object({
  voucherCode: z.string().min(1, "Vui lòng nhập mã giảm giá"),
  orderAmount: z.number().min(0, "Số tiền đơn hàng không hợp lệ"),
  customerId: z.string().uuid().optional(),
  items: z.array(z.object({
    productId: z.string().uuid(),
    categoryId: z.string().uuid().optional(),
    quantity: z.number().min(1),
    price: z.number().min(0)
  })).optional()
});

// 🔍 POST /api/checkout/validate-voucher - Validate voucher for customer checkout
router.post('/validate-voucher', async (req, res) => {
  try {
    const validatedData = ValidateVoucherSchema.parse(req.body);
    const { voucherCode, orderAmount, customerId, items } = validatedData;

    const result = await validateVoucherForOrder(
      voucherCode,
      orderAmount,
      customerId,
      items
    );

    if (result.valid) {
      return res.json({
        status: "success",
        valid: true,
        discount: result.discount,
        voucher: result.voucher
      });
    } else {
      return res.json({
        status: "error",
        valid: false,
        error: result.error
      });
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        status: "error",
        valid: false,
        error: error.errors[0]?.message || 'Dữ liệu không hợp lệ'
      });
    }

    console.error('❌ Error validating voucher:', error);
    return res.status(500).json({
      status: "error",
      valid: false,
      error: 'Có lỗi xảy ra khi kiểm tra mã giảm giá'
    });
  }
});

export default router;
