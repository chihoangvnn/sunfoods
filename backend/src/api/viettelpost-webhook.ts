// @ts-nocheck
import express from 'express';
import { db } from '../db.js';
import { orders } from '../../shared/schema.js';
import { eq, and } from 'drizzle-orm';
import crypto from 'crypto';

const router = express.Router();

/**
 * POST /api/webhooks/viettelpost
 * Webhook để nhận cập nhật trạng thái từ ViettelPost
 */
router.post('/viettelpost', async (req, res) => {
  try {
    const webhookData = req.body;
    const signature = req.headers['x-vtp-signature'] || req.headers['x-signature'];
    
    console.log('📦 ViettelPost Webhook received:', {
      headers: req.headers,
      body: webhookData,
      signature: signature
    });

    // Validate webhook signature if available
    if (signature) {
      const isValid = await validateWebhookSignature(req.body, signature as string);
      if (!isValid) {
        console.error('❌ ViettelPost webhook signature validation failed');
        return res.status(401).json({ error: 'Invalid webhook signature' });
      }
    }

    // Process webhook data
    const result = await processViettelPostWebhook(webhookData);
    
    if (result.success) {
      console.log('✅ ViettelPost webhook processed successfully:', result.orderId);
      res.status(200).json({ 
        success: true, 
        message: 'Webhook processed successfully',
        orderId: result.orderId 
      });
    } else {
      console.error('❌ ViettelPost webhook processing failed:', result.error);
      res.status(400).json({ 
        success: false, 
        error: result.error 
      });
    }

  } catch (error) {
    console.error('ViettelPost webhook error:', error);
    res.status(500).json({ 
      error: 'Webhook processing failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/webhooks/viettelpost/test
 * Test endpoint để kiểm tra webhook connectivity
 */
router.get('/viettelpost/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'ViettelPost webhook endpoint is active',
    timestamp: new Date().toISOString()
  });
});

/**
 * Validate webhook signature
 */
async function validateWebhookSignature(payload: any, signature: string): Promise<boolean> {
  try {
    // Get webhook secret from configuration
    const configs = await db
      .select({ webhookSecret: viettelpostConfigs.webhookSecret })
      .from(viettelpostConfigs)
      .where(and(
        eq(viettelpostConfigs.isActive, true),
        eq(viettelpostConfigs.isDefault, true)
      ))
      .limit(1);

    if (!configs || configs.length === 0 || !configs[0].webhookSecret) {
      console.warn('⚠️ No webhook secret found for signature validation');
      return true; // Allow webhook if no secret configured
    }

    const webhookSecret = configs[0].webhookSecret;
    const payloadString = JSON.stringify(payload);
    
    // Generate expected signature
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(payloadString)
      .digest('hex');

    // Compare signatures
    const providedSignature = signature.replace('sha256=', '');
    
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(providedSignature, 'hex')
    );

  } catch (error) {
    console.error('Webhook signature validation error:', error);
    return false;
  }
}

/**
 * Process ViettelPost webhook data
 */
async function processViettelPostWebhook(webhookData: any): Promise<{
  success: boolean;
  orderId?: string;
  error?: string;
}> {
  try {
    // Expected webhook format from ViettelPost
    const {
      ORDER_NUMBER,
      ORDER_SYSTEMCODE,
      ORDER_STATUS,
      ORDER_STATUSNAME,
      UPDATE_DATE,
      LOCATION_CURRENT,
      NOTE,
      ESTIMATED_DELIVERY,
      TRACKING_CODE
    } = webhookData;

    if (!ORDER_SYSTEMCODE && !ORDER_NUMBER) {
      return {
        success: false,
        error: 'Missing ORDER_SYSTEMCODE or ORDER_NUMBER in webhook data'
      };
    }

    // Find order by VTP system code or order number
    const orderQuery = ORDER_SYSTEMCODE 
      ? eq(orders.vtpOrderSystemCode, ORDER_SYSTEMCODE)
      : eq(orders.vtpOrderNumber, ORDER_NUMBER);

    const existingOrders = await db
      .select()
      .from(orders)
      .where(orderQuery)
      .limit(1);

    if (!existingOrders || existingOrders.length === 0) {
      return {
        success: false,
        error: `Order not found for VTP code: ${ORDER_SYSTEMCODE || ORDER_NUMBER}`
      };
    }

    const order = existingOrders[0];
    
    // Map VTP status to internal status
    const internalStatus = mapVTPStatusToInternal(ORDER_STATUS);
    
    // Prepare tracking data update
    const currentTrackingData = order.vtpTrackingData || {};
    const statusHistory = currentTrackingData.statusHistory || [];
    
    // Add new status to history if not duplicate
    const lastStatus = statusHistory[statusHistory.length - 1];
    if (!lastStatus || lastStatus.status !== ORDER_STATUS.toString()) {
      statusHistory.push({
        status: ORDER_STATUS.toString(),
        statusName: ORDER_STATUSNAME || `Status ${ORDER_STATUS}`,
        date: UPDATE_DATE || new Date().toISOString(),
        location: LOCATION_CURRENT || '',
        note: NOTE || ''
      });
    }

    // Update order with new tracking information
    await db
      .update(orders)
      .set({
        vtpStatus: internalStatus,
        vtpTrackingData: {
          ...currentTrackingData,
          lastUpdate: UPDATE_DATE || new Date().toISOString(),
          currentLocation: LOCATION_CURRENT || currentTrackingData.currentLocation,
          statusHistory: statusHistory,
          estimatedDelivery: ESTIMATED_DELIVERY || currentTrackingData.estimatedDelivery,
        },
        vtpUpdatedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(orders.id, order.id));

    // Log status change
    console.log(`📦 Order ${order.id} status updated:`, {
      oldStatus: order.vtpStatus,
      newStatus: internalStatus,
      statusName: ORDER_STATUSNAME,
      location: LOCATION_CURRENT,
      updateDate: UPDATE_DATE
    });

    // TODO: Send notification to customer/admin about status change
    // await notificationService.sendOrderStatusUpdate(order.id, internalStatus);

    return {
      success: true,
      orderId: order.id
    };

  } catch (error) {
    console.error('Process VTP webhook error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown processing error'
    };
  }
}

/**
 * Map ViettelPost status codes to internal status
 */
function mapVTPStatusToInternal(vtpStatus: number): string {
  const statusMap: { [key: number]: string } = {
    // ViettelPost status codes
    100: 'pending',      // Chờ lấy hàng
    101: 'processing',   // Đã lấy hàng
    102: 'processing',   // Đã tiếp nhận
    103: 'in_transit',   // Đang vận chuyển
    104: 'in_transit',   // Đang phát
    105: 'in_transit',   // Phát không thành công lần 1
    106: 'in_transit',   // Phát không thành công lần 2
    107: 'in_transit',   // Phát không thành công lần 3
    200: 'delivered',    // Đã giao thành công
    201: 'delivered',    // Đã giao (người nhận ký nhận)
    300: 'failed',       // Giao không thành công
    301: 'failed',       // Không liên lạc được với người nhận
    302: 'failed',       // Người nhận từ chối nhận
    400: 'cancelled',    // Đã hủy
    401: 'cancelled',    // Hủy theo yêu cầu
    500: 'failed',       // Hoàn trả về người gửi
    501: 'failed',       // Đang hoàn trả
    502: 'failed',       // Đã hoàn trả thành công
  };

  return statusMap[vtpStatus] || 'pending';
}

export default router;