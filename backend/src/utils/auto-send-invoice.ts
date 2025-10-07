import { db } from '../db';
import { orders } from '../../shared/schema';
import { eq } from 'drizzle-orm';
import axios from 'axios';

export async function autoSendInvoiceIfNeeded(orderId: string, newStatus: string) {
  try {
    if (newStatus !== 'Đã gửi') {
      return;
    }

    const orderResult = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (!orderResult.length) {
      console.error(`Auto-send invoice: Order ${orderId} not found`);
      return;
    }

    const order = orderResult[0];

    const isChatbotOrder = order.tags && Array.isArray(order.tags) && order.tags.includes('chatbot');
    const shouldSendInvoice = (order.sendInvoiceToChat || isChatbotOrder) && !order.invoiceSentAt;

    if (shouldSendInvoice) {
      console.log(`Auto-sending invoice for order ${orderId} via Messenger... (Chatbot: ${isChatbotOrder})`);
      
      const apiUrl = process.env.REPLIT_DEV_DOMAIN 
        ? `https://${process.env.REPLIT_DEV_DOMAIN}/api/orders/${orderId}/send-invoice`
        : `http://localhost:5000/api/orders/${orderId}/send-invoice`;

      try {
        const response = await axios.post(apiUrl);
        console.log(`✅ Invoice sent successfully for order ${orderId}:`, response.data);
      } catch (error: any) {
        console.error(`❌ Failed to auto-send invoice for order ${orderId}:`, error.message);
      }
    }
  } catch (error: any) {
    console.error(`Error in autoSendInvoiceIfNeeded for order ${orderId}:`, error.message);
  }
}
