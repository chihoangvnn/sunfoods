/**
 * 🎫 GIFT VOUCHERS API
 * 
 * API endpoints for managing gift vouchers and redemptions
 * Supports Vietnamese incense business e-commerce platform
 */

import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { giftVouchers } from '@shared/schema';
import { eq, desc } from 'drizzle-orm';
import { nanoid } from 'nanoid';

const router = Router();

/**
 * Utility function to generate unique voucher code
 */
async function generateVoucherCode(): Promise<string> {
  let code: string;
  let isUnique = false;
  
  while (!isUnique) {
    // Format: NH-XXXX-XXXX (NH = Nhang, XXXX = random alphanumeric)
    const part1 = nanoid(4).toUpperCase().replace(/[0OI1]/g, 'A'); // Remove confusing chars
    const part2 = nanoid(4).toUpperCase().replace(/[0OI1]/g, 'B');
    code = `NH-${part1}-${part2}`;
    
    // Check uniqueness
    const existing = await db.select({ id: giftVouchers.id })
      .from(giftVouchers)
      .where(eq(giftVouchers.voucherCode, code))
      .limit(1);
      
    isUnique = existing.length === 0;
  }
  
  return code!;
}

/**
 * GET /api/gift-vouchers - Get all gift vouchers
 */
router.get('/', async (req, res) => {
  try {
    const vouchers = await db.select().from(giftVouchers).orderBy(desc(giftVouchers.createdAt));
    
    res.json({
      success: true,
      data: vouchers
    });
  } catch (error) {
    console.error('Error fetching gift vouchers:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch vouchers'
    });
  }
});

/**
 * GET /api/gift-vouchers/:id - Get gift voucher by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [voucher] = await db.select()
      .from(giftVouchers)
      .where(eq(giftVouchers.id, id));
    
    if (!voucher) {
      return res.status(404).json({
        success: false,
        error: 'Voucher not found'
      });
    }
    
    res.json({
      success: true,
      data: voucher
    });
  } catch (error) {
    console.error('Error fetching voucher:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch voucher'
    });
  }
});

/**
 * POST /api/gift-vouchers - Create new gift voucher
 */
router.post('/', async (req, res) => {
  try {
    const voucherData = req.body;
    const voucherCode = await generateVoucherCode();
    
    const [newVoucher] = await db.insert(giftVouchers)
      .values({
        ...voucherData,
        voucherCode,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    
    res.json({
      success: true,
      data: newVoucher
    });
  } catch (error) {
    console.error('Error creating voucher:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create voucher'
    });
  }
});

/**
 * GET /api/gift-vouchers/analytics/summary - Get voucher analytics
 */
router.get('/analytics/summary', async (req, res) => {
  try {
    const vouchers = await db.select().from(giftVouchers);
    
    const analytics = {
      totalVouchers: vouchers.length,
      activeVouchers: vouchers.filter(v => v.status === 'issued').length,
      redeemedVouchers: vouchers.filter(v => v.status === 'fully_redeemed').length,
      expiredVouchers: vouchers.filter(v => v.status === 'expired').length
    };
    
    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics'
    });
  }
});

export default router;