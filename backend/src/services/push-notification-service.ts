import webpush from 'web-push';
import { storage } from '../storage';
import type { PushSubscription, VendorPushSubscription } from '../../shared/schema';

if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
  console.warn('⚠️  VAPID keys not configured! Push notifications will not work.');
  console.warn('   Set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY environment variables.');
}

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@incense-shop.vn';

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    VAPID_SUBJECT,
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  );
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  data?: any;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  tag?: string;
  requireInteraction?: boolean;
  silent?: boolean;
}

export class PushNotificationService {
  
  static getVapidPublicKey(): string {
    return VAPID_PUBLIC_KEY;
  }

  static async sendToCustomer(
    customerId: string,
    payload: PushNotificationPayload
  ): Promise<{ success: boolean; sent: number; failed: number; errors: string[] }> {
    try {
      const subscriptions = await storage.getPushSubscriptionsByCustomer(customerId);
      
      if (!subscriptions || subscriptions.length === 0) {
        console.log(`📱 No push subscriptions found for customer ${customerId}`);
        return { success: false, sent: 0, failed: 0, errors: ['No subscriptions'] };
      }

      return await this.sendToSubscriptions(subscriptions, payload);
    } catch (error) {
      console.error('Error sending push to customer:', error);
      return { 
        success: false, 
        sent: 0, 
        failed: 0, 
        errors: [error instanceof Error ? error.message : 'Unknown error'] 
      };
    }
  }

  static async sendToSubscriptions(
    subscriptions: PushSubscription[],
    payload: PushNotificationPayload
  ): Promise<{ success: boolean; sent: number; failed: number; errors: string[] }> {
    const results = {
      success: true,
      sent: 0,
      failed: 0,
      errors: [] as string[]
    };

    const pushPayload = JSON.stringify(payload);

    for (const subscription of subscriptions) {
      if (!subscription.isActive) {
        continue;
      }

      try {
        const pushSubscription = {
          endpoint: subscription.endpoint,
          expirationTime: subscription.expirationTime ? new Date(subscription.expirationTime).getTime() : null,
          keys: subscription.keys as { p256dh: string; auth: string }
        };

        await webpush.sendNotification(pushSubscription, pushPayload);
        
        await storage.updatePushSubscription(subscription.id, {
          lastUsedAt: new Date(),
          failureCount: 0,
          lastError: null
        });

        results.sent++;
        console.log(`✅ Push sent to subscription ${subscription.id}`);
      } catch (error: any) {
        results.failed++;
        const errorMessage = error?.message || 'Unknown error';
        results.errors.push(`Subscription ${subscription.id}: ${errorMessage}`);

        if (error?.statusCode === 410 || error?.statusCode === 404) {
          await storage.updatePushSubscription(subscription.id, {
            isActive: false,
            lastError: 'Subscription expired or invalid'
          });
          console.log(`🗑️ Marked subscription ${subscription.id} as inactive (expired)`);
        } else {
          const failureCount = (subscription.failureCount || 0) + 1;
          await storage.updatePushSubscription(subscription.id, {
            failureCount,
            lastError: errorMessage,
            isActive: failureCount < 5
          });
          console.error(`❌ Push failed for subscription ${subscription.id}:`, errorMessage);
        }
      }
    }

    if (results.failed > 0) {
      results.success = false;
    }

    console.log(`📊 Push results: ${results.sent} sent, ${results.failed} failed`);
    return results;
  }

  static async sendOrderNotification(
    customerId: string,
    orderId: string,
    orderNumber: string,
    status: string
  ): Promise<{ success: boolean; sent: number }> {
    const statusMessages: Record<string, string> = {
      pending: 'Đang xử lý',
      processing: 'Đang giao hàng',
      shipped: 'Đã giao cho đơn vị vận chuyển',
      delivered: 'Đã giao thành công',
      cancelled: 'Đã hủy'
    };

    const statusMessage = statusMessages[status] || status;
    
    const payload: PushNotificationPayload = {
      title: '🔔 Cập nhật đơn hàng',
      body: `Đơn hàng #${orderNumber} đã được ${statusMessage.toLowerCase()}`,
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      data: {
        type: 'order_update',
        orderId,
        orderNumber,
        status,
        url: `/orders/${orderId}`
      },
      actions: [
        {
          action: 'view',
          title: 'Xem đơn hàng',
        },
        {
          action: 'close',
          title: 'Đóng',
        }
      ],
      tag: `order-${orderId}`,
      requireInteraction: false
    };

    const result = await this.sendToCustomer(customerId, payload);
    return { success: result.success, sent: result.sent };
  }

  static async sendChatNotification(
    customerId: string,
    message: string,
    conversationId: string
  ): Promise<{ success: boolean; sent: number }> {
    const payload: PushNotificationPayload = {
      title: '💬 Tin nhắn mới',
      body: message.length > 100 ? message.substring(0, 97) + '...' : message,
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      data: {
        type: 'chat_message',
        conversationId,
        url: `/chat/${conversationId}`
      },
      tag: `chat-${conversationId}`,
      requireInteraction: true
    };

    const result = await this.sendToCustomer(customerId, payload);
    return { success: result.success, sent: result.sent };
  }

  static async sendToVendor(
    vendorId: string,
    payload: PushNotificationPayload
  ): Promise<{ success: boolean; sent: number; failed: number; errors: string[] }> {
    try {
      const subscriptions = await storage.getVendorPushSubscriptions(vendorId);
      
      if (!subscriptions || subscriptions.length === 0) {
        console.log(`📱 No push subscriptions found for vendor ${vendorId}`);
        return { success: false, sent: 0, failed: 0, errors: ['No subscriptions'] };
      }

      return await this.sendToVendorSubscriptions(subscriptions, payload);
    } catch (error) {
      console.error('Error sending push to vendor:', error);
      return { 
        success: false, 
        sent: 0, 
        failed: 0, 
        errors: [error instanceof Error ? error.message : 'Unknown error'] 
      };
    }
  }

  static async sendToVendorSubscriptions(
    subscriptions: VendorPushSubscription[],
    payload: PushNotificationPayload
  ): Promise<{ success: boolean; sent: number; failed: number; errors: string[] }> {
    const results = {
      success: true,
      sent: 0,
      failed: 0,
      errors: [] as string[]
    };

    const pushPayload = JSON.stringify(payload);

    for (const subscription of subscriptions) {
      if (!subscription.isActive) {
        continue;
      }

      try {
        const pushSubscription = {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.p256dh,
            auth: subscription.auth
          }
        };

        await webpush.sendNotification(pushSubscription, pushPayload);
        
        await storage.updateVendorLastNotifiedAt(subscription.vendorId);

        results.sent++;
        console.log(`✅ Push sent to vendor subscription ${subscription.id}`);
      } catch (error: any) {
        results.failed++;
        const errorMessage = error?.message || 'Unknown error';
        results.errors.push(`Subscription ${subscription.id}: ${errorMessage}`);

        if (error?.statusCode === 410 || error?.statusCode === 404) {
          await storage.markVendorPushSubscriptionInactive(subscription.id);
          console.log(`🗑️ Marked vendor subscription ${subscription.id} as inactive (expired)`);
        } else {
          console.error(`❌ Push failed for vendor subscription ${subscription.id}:`, errorMessage);
        }
      }
    }

    if (results.failed > 0) {
      results.success = false;
    }

    console.log(`📊 Vendor push results: ${results.sent} sent, ${results.failed} failed`);
    return results;
  }

  static async sendNewOrderNotification(
    vendorId: string,
    orderId: string,
    orderTotal: number
  ): Promise<{ success: boolean; sent: number }> {
    const payload: PushNotificationPayload = {
      title: '🛒 Đơn hàng mới',
      body: `Bạn có đơn hàng mới trị giá ${orderTotal.toLocaleString('vi-VN')} VNĐ`,
      icon: '/icon-new-order.png',
      badge: '/badge-72x72.png',
      data: {
        type: 'new_order',
        orderId,
        url: `/vendor/orders/${orderId}`
      },
      tag: `vendor-order-${orderId}`,
      requireInteraction: true
    };

    const result = await this.sendToVendor(vendorId, payload);
    return { success: result.success, sent: result.sent };
  }

  static async sendReturnRequestNotification(
    vendorId: string,
    returnId: string,
    returnAmount: number
  ): Promise<{ success: boolean; sent: number }> {
    const payload: PushNotificationPayload = {
      title: '↩️ Yêu cầu trả hàng',
      body: `Có yêu cầu trả hàng trị giá ${returnAmount.toLocaleString('vi-VN')} VNĐ`,
      icon: '/icon-return.png',
      badge: '/badge-72x72.png',
      data: {
        type: 'return_request',
        returnId,
        url: `/vendor/returns/${returnId}`
      },
      tag: `vendor-return-${returnId}`,
      requireInteraction: true
    };

    const result = await this.sendToVendor(vendorId, payload);
    return { success: result.success, sent: result.sent };
  }

  static async sendLowStockNotification(
    vendorId: string,
    productName: string,
    productId: string,
    stock: number
  ): Promise<{ success: boolean; sent: number }> {
    const payload: PushNotificationPayload = {
      title: '⚠️ Cảnh báo tồn kho',
      body: `Sản phẩm "${productName}" chỉ còn ${stock} trong kho`,
      icon: '/icon-low-stock.png',
      badge: '/badge-72x72.png',
      data: {
        type: 'low_stock',
        productId,
        productName,
        stock,
        url: `/vendor/products/${productId}`
      },
      tag: `vendor-stock-${productId}`,
      requireInteraction: false
    };

    const result = await this.sendToVendor(vendorId, payload);
    return { success: result.success, sent: result.sent };
  }

  static async sendPaymentReminderNotification(
    vendorId: string,
    dueAmount: number,
    daysUntilDue: number
  ): Promise<{ success: boolean; sent: number }> {
    const payload: PushNotificationPayload = {
      title: '💰 Nhắc nhở thanh toán',
      body: `Bạn có ${dueAmount.toLocaleString('vi-VN')} VNĐ cần thanh toán trong ${daysUntilDue} ngày`,
      icon: '/icon-payment.png',
      badge: '/badge-72x72.png',
      data: {
        type: 'payment_reminder',
        dueAmount,
        daysUntilDue,
        url: '/vendor/payments'
      },
      tag: 'vendor-payment-reminder',
      requireInteraction: true
    };

    const result = await this.sendToVendor(vendorId, payload);
    return { success: result.success, sent: result.sent };
  }
}

export const pushNotificationService = new PushNotificationService();
