import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { vendorOrders } from '@shared/schema';
import { requireVendorAuth } from '../middleware/vendor-auth';
import { eq, and, gte, lte, desc, sql } from 'drizzle-orm';

const router = Router();

const markPackedSchema = z.object({
  notes: z.string().max(300).optional(),
});

type VendorOrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';

router.get('/', requireVendorAuth, async (req, res) => {
  try {
    const vendorId = req.vendor!.id;
    const { status, startDate, endDate } = req.query;

    const conditions = [eq(vendorOrders.vendorId, vendorId)];

    if (status && typeof status === 'string') {
      const validStatuses: VendorOrderStatus[] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'];
      if (validStatuses.includes(status as VendorOrderStatus)) {
        conditions.push(sql`${vendorOrders.status} = ${status}`);
      }
    }

    if (startDate && typeof startDate === 'string') {
      conditions.push(gte(vendorOrders.createdAt, new Date(startDate)));
    }

    if (endDate && typeof endDate === 'string') {
      conditions.push(lte(vendorOrders.createdAt, new Date(endDate)));
    }

    const orders = await db
      .select({
        id: vendorOrders.id,
        orderId: vendorOrders.orderId,
        maskedCustomerName: vendorOrders.maskedCustomerName,
        maskedCustomerPhone: vendorOrders.maskedCustomerPhone,
        maskedCustomerAddress: vendorOrders.maskedCustomerAddress,
        codAmount: vendorOrders.codAmount,
        vendorCost: vendorOrders.vendorCost,
        commissionAmount: vendorOrders.commissionAmount,
        shippingCarrier: vendorOrders.shippingProvider,
        trackingNumber: vendorOrders.shippingCode,
        status: vendorOrders.status,
        shippedAt: vendorOrders.shippedAt,
        deliveredAt: vendorOrders.deliveredAt,
        createdAt: vendorOrders.createdAt,
      })
      .from(vendorOrders)
      .where(and(...conditions))
      .orderBy(desc(vendorOrders.createdAt));

    res.json(orders);
  } catch (error) {
    console.error('Error fetching vendor orders:', error);
    res.status(500).json({ error: 'Lỗi khi tải danh sách đơn hàng' });
  }
});

router.get('/:id', requireVendorAuth, async (req, res) => {
  try {
    const vendorId = req.vendor!.id;
    const { id } = req.params;

    const [order] = await db
      .select({
        id: vendorOrders.id,
        orderId: vendorOrders.orderId,
        maskedCustomerName: vendorOrders.maskedCustomerName,
        maskedCustomerPhone: vendorOrders.maskedCustomerPhone,
        maskedCustomerAddress: vendorOrders.maskedCustomerAddress,
        codAmount: vendorOrders.codAmount,
        vendorCost: vendorOrders.vendorCost,
        commissionAmount: vendorOrders.commissionAmount,
        shippingCarrier: vendorOrders.shippingProvider,
        trackingNumber: vendorOrders.shippingCode,
        status: vendorOrders.status,
        shippedAt: vendorOrders.shippedAt,
        deliveredAt: vendorOrders.deliveredAt,
        createdAt: vendorOrders.createdAt,
      })
      .from(vendorOrders)
      .where(and(eq(vendorOrders.id, id), eq(vendorOrders.vendorId, vendorId)))
      .limit(1);

    if (!order) {
      return res.status(404).json({ error: 'Không tìm thấy đơn hàng' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error fetching vendor order:', error);
    res.status(500).json({ error: 'Lỗi khi tải thông tin đơn hàng' });
  }
});

router.post('/:id/mark-packed', requireVendorAuth, async (req, res) => {
  try {
    const vendorId = req.vendor!.id;
    const { id } = req.params;

    const validationResult = markPackedSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Dữ liệu không hợp lệ',
        details: validationResult.error.errors,
      });
    }

    const { notes } = validationResult.data;

    const [existingOrder] = await db
      .select()
      .from(vendorOrders)
      .where(and(eq(vendorOrders.id, id), eq(vendorOrders.vendorId, vendorId)))
      .limit(1);

    if (!existingOrder) {
      return res.status(404).json({ error: 'Không tìm thấy đơn hàng' });
    }

    if (
      existingOrder.status !== 'pending' &&
      existingOrder.status !== 'processing'
    ) {
      return res.status(400).json({
        error: 'Không thể đánh dấu đơn hàng đã giao hoặc đã hủy',
      });
    }

    const [updatedOrder] = await db
      .update(vendorOrders)
      .set({
        status: 'processing',
        processingAt: new Date(),
        notes: notes || existingOrder.notes,
        updatedAt: new Date(),
      })
      .where(and(eq(vendorOrders.id, id), eq(vendorOrders.vendorId, vendorId)))
      .returning({
        id: vendorOrders.id,
        orderId: vendorOrders.orderId,
        maskedCustomerName: vendorOrders.maskedCustomerName,
        maskedCustomerPhone: vendorOrders.maskedCustomerPhone,
        maskedCustomerAddress: vendorOrders.maskedCustomerAddress,
        codAmount: vendorOrders.codAmount,
        vendorCost: vendorOrders.vendorCost,
        commissionAmount: vendorOrders.commissionAmount,
        shippingCarrier: vendorOrders.shippingProvider,
        trackingNumber: vendorOrders.shippingCode,
        status: vendorOrders.status,
        shippedAt: vendorOrders.shippedAt,
        deliveredAt: vendorOrders.deliveredAt,
        createdAt: vendorOrders.createdAt,
      });

    res.json(updatedOrder);
  } catch (error) {
    console.error('Error marking order as packed:', error);
    res.status(500).json({ error: 'Lỗi khi cập nhật đơn hàng' });
  }
});

type ShippingProvider = 'GHN' | 'GHTK' | 'ViettelPost';

interface ShippingLabelResponse {
  success: boolean;
  orderId: string;
  provider: ShippingProvider;
  trackingCode: string;
  labelUrl: string | null;
  printInstructions?: string;
  error?: string;
}

router.get('/:id/shipping-label', requireVendorAuth, async (req, res) => {
  try {
    const vendorId = req.vendor!.id;
    const { id } = req.params;

    const [order] = await db
      .select({
        id: vendorOrders.id,
        orderId: vendorOrders.orderId,
        shippingProvider: vendorOrders.shippingProvider,
        shippingCode: vendorOrders.shippingCode,
      })
      .from(vendorOrders)
      .where(and(eq(vendorOrders.id, id), eq(vendorOrders.vendorId, vendorId)))
      .limit(1);

    if (!order) {
      return res.status(404).json({ 
        success: false,
        error: 'Không tìm thấy đơn hàng hoặc bạn không có quyền truy cập' 
      });
    }

    if (!order.shippingProvider || !order.shippingCode) {
      return res.status(400).json({
        success: false,
        error: 'Đơn hàng chưa có thông tin vận chuyển hoặc mã tracking'
      });
    }

    const provider = order.shippingProvider as ShippingProvider;
    const trackingCode = order.shippingCode;
    let response: ShippingLabelResponse;

    switch (provider) {
      case 'GHN':
        response = {
          success: true,
          orderId: order.orderId,
          provider: 'GHN',
          trackingCode: trackingCode,
          labelUrl: null,
          printInstructions: 'Đăng nhập GHN portal để in phiếu gửi hàng'
        };
        break;

      case 'GHTK':
        response = {
          success: true,
          orderId: order.orderId,
          provider: 'GHTK',
          trackingCode: trackingCode,
          labelUrl: `https://services.giaohangtietkiem.vn/services/label/${trackingCode}`
        };
        break;

      case 'ViettelPost':
        response = {
          success: true,
          orderId: order.orderId,
          provider: 'ViettelPost',
          trackingCode: trackingCode,
          labelUrl: null,
          printInstructions: 'Đăng nhập ViettelPost portal để in phiếu gửi hàng'
        };
        break;

      default:
        return res.status(400).json({
          success: false,
          error: `Nhà vận chuyển không được hỗ trợ: ${provider}`
        });
    }

    res.json(response);
  } catch (error) {
    console.error('Error fetching shipping label:', error);
    res.status(500).json({ 
      success: false,
      error: 'Lỗi khi lấy thông tin phiếu gửi hàng' 
    });
  }
});

export default router;
