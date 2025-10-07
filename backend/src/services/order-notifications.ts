import { storage } from '../storage';
import { PushNotificationService } from './push-notification-service';

const STATUS_MESSAGES: Record<string, string> = {
  pending: 'Đang xử lý',
  processing: 'Đang giao hàng',
  shipped: 'Đã giao cho đơn vị vận chuyển',
  delivered: 'Đã giao thành công',
  cancelled: 'Đã hủy'
};

/**
 * 💬 Tìm chatbot conversation (web chat) của customer
 */
export async function getChatbotConversationByCustomer(customerId: string) {
  try {
    const conversations = await storage.getChatbotConversations(100);
    
    const customerConversations = conversations.filter(
      conv => conv.customerId === customerId && conv.status === 'active'
    );

    if (customerConversations.length === 0) {
      return null;
    }

    // Sort by latest message
    customerConversations.sort((a, b) => {
      const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return dateB - dateA;
    });

    return customerConversations[0];
  } catch (error) {
    console.error('Error getting chatbot conversation:', error);
    return null;
  }
}

/**
 * 📱 Tìm Facebook conversation của customer (KHÔNG SỬ DỤNG - Vi phạm FB policy)
 * CHỈ gửi nếu customer đã chat trên Facebook Messenger
 */
export async function getCustomerFacebookConversation(customerId: string) {
  try {
    const customer = await storage.getCustomer(customerId);
    if (!customer) {
      return null;
    }

    const facebookId = customer.socialData?.facebookId;
    if (!facebookId) {
      return null;
    }

    const conversations = await storage.getFacebookConversations(undefined, 100);
    
    const customerConversations = conversations.filter(
      conv => conv.participantId === facebookId
    );

    if (customerConversations.length === 0) {
      return null;
    }

    customerConversations.sort((a, b) => {
      const dateA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
      const dateB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
      return dateB - dateA;
    });

    return customerConversations[0];
  } catch (error) {
    console.error('Error getting customer Facebook conversation:', error);
    return null;
  }
}

/**
 * 🆕 Gửi order status notification vào WEB CHAT conversation
 * CHỈ gửi vào chatbot conversation (không gửi Facebook để tránh vi phạm policy)
 */
export async function sendOrderStatusNotification(
  orderId: string,
  newStatus: string,
  oldStatus: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const order = await storage.getOrder(orderId);
    if (!order || !order.customerId) {
      console.log(`💬 No customer found for order ${orderId}`);
      return { success: false, error: 'No customer found' };
    }

    // 🎯 Tìm web chat conversation của customer
    const chatConversation = await getChatbotConversationByCustomer(order.customerId);
    if (!chatConversation) {
      console.log(`💬 No web chat conversation found for customer ${order.customerId}`);
      return { success: false, error: 'No web chat conversation found' };
    }

    const statusMessage = STATUS_MESSAGES[newStatus] || newStatus;
    const orderNumber = order.id.slice(-8).toUpperCase();
    const message = `✅ Đơn hàng #${orderNumber} đã được ${statusMessage.toLowerCase()}! Cảm ơn bạn đã mua hàng.`;

    // 💬 Push message vào chatbot conversation
    await storage.addMessageToChatbotConversation(chatConversation.id, {
      senderType: 'bot',
      senderName: 'Hệ thống',
      content: message,
      messageType: 'text',
      metadata: {
        type: 'order_notification',
        orderId: order.id,
        orderStatus: newStatus,
        automated: true
      }
    });

    // 🔔 Gửi Web Push Notification (non-blocking)
    PushNotificationService.sendOrderNotification(
      order.customerId,
      order.id,
      orderNumber,
      newStatus
    ).catch((error: Error) => {
      console.error('Failed to send push notification:', error);
    });

    console.log(`✅ Order notification sent to web chat for order ${orderId}: ${statusMessage}`);
    return { success: true };
  } catch (error) {
    console.error('💬 Error sending order notification to web chat:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}
