import { Router, Request, Response } from 'express';
import { db } from '../db';
import { orders, customers, facebookConversations, socialAccounts, invoiceTemplates } from '../../shared/schema';
import { eq } from 'drizzle-orm';
import { generateInvoiceImage } from '../utils/invoice-generator';
import FormData from 'form-data';
import axios from 'axios';

const router = Router();

export async function sendInvoiceToMessenger(
  orderId: string, 
  facebookIdOverride?: string
): Promise<{
  success: boolean;
  messageId?: string;
  recipient?: string;
  error?: string;
}> {
  try {
    console.log(`📄 [INVOICE SEND] Starting invoice send for order ${orderId}`);
    console.log(`📄 [INVOICE SEND] PSID override provided: ${facebookIdOverride || 'NO'}`);
    
    const defaultTemplateResult = await db
      .select()
      .from(invoiceTemplates)
      .where(eq(invoiceTemplates.isDefault, true))
      .limit(1);

    const templateConfig = defaultTemplateResult.length > 0 
      ? defaultTemplateResult[0].config 
      : undefined;

    if (templateConfig) {
      console.log(`📄 [INVOICE SEND] Using default template: ${defaultTemplateResult[0].name} (ID: ${defaultTemplateResult[0].id})`);
    } else {
      console.log(`📄 [INVOICE SEND] No default template found, using DEFAULT_CONFIG from generator`);
    }
    
    const orderResult = await db
      .select()
      .from(orders)
      .leftJoin(customers, eq(orders.customerId, customers.id))
      .where(eq(orders.id, orderId))
      .limit(1);

    if (!orderResult.length) {
      console.log(`❌ [INVOICE SEND] Order ${orderId} not found in database`);
      return { success: false, error: 'Order not found' };
    }

    const order = orderResult[0].orders;
    const customer = orderResult[0].customers;

    console.log(`📄 [INVOICE SEND] Order found - Customer: ${customer?.name} (ID: ${customer?.id})`);
    console.log(`📄 [INVOICE SEND] Customer social data: ${JSON.stringify(customer?.socialData)}`);

    const facebookId = facebookIdOverride || customer?.socialData?.facebookId;
    const psidSource = facebookIdOverride ? 'override parameter' : 'customer.socialData.facebookId';
    
    if (!facebookId) {
      console.log(`⚠️ [INVOICE SEND] FAILED - No PSID available`);
      console.log(`   - Override PSID: ${facebookIdOverride || 'NOT PROVIDED'}`);
      console.log(`   - Customer social data: ${JSON.stringify(customer?.socialData)}`);
      return { 
        success: false,
        error: 'Cannot send invoice: customer does not have Facebook ID' 
      };
    }

    console.log(`✅ [INVOICE SEND] Using PSID: ${facebookId} (source: ${psidSource})`);

    const invoiceBuffer = await generateInvoiceImage(orderId, templateConfig || undefined);
    console.log(`📄 [INVOICE SEND] Invoice image generated (${invoiceBuffer.length} bytes)`);

    const conversationResult = await db
      .select()
      .from(facebookConversations)
      .where(eq(facebookConversations.participantId, facebookId))
      .orderBy(facebookConversations.createdAt)
      .limit(1);

    if (!conversationResult.length) {
      console.log(`❌ [INVOICE SEND] No Facebook conversation found for PSID ${facebookId}`);
      return {
        success: false,
        error: 'No Facebook conversation found for this customer'
      };
    }

    const conversation = conversationResult[0];
    const pageId = conversation.pageId;
    console.log(`📄 [INVOICE SEND] Found conversation - Page ID: ${pageId}`);

    const socialAccountResult = await db
      .select()
      .from(socialAccounts)
      .where(eq(socialAccounts.platform, 'facebook'))
      .limit(100);

    let pageAccessToken: string | undefined;

    for (const account of socialAccountResult) {
      const pageTokens = account.pageAccessTokens || [];
      const pageToken = pageTokens.find((pt: any) => pt.pageId === pageId);
      if (pageToken && pageToken.accessToken) {
        pageAccessToken = pageToken.accessToken;
        break;
      }
    }

    if (!pageAccessToken) {
      console.log(`❌ [INVOICE SEND] No access token found for page ${pageId}`);
      return {
        success: false,
        error: 'No Facebook page access token found for this page'
      };
    }

    console.log(`✅ [INVOICE SEND] Page access token found for page ${pageId}`);

    const form = new FormData();
    form.append('recipient', JSON.stringify({ id: facebookId }));
    form.append('message', JSON.stringify({
      attachment: {
        type: 'image',
        payload: {
          is_reusable: false
        }
      }
    }));
    form.append('filedata', invoiceBuffer, {
      filename: `invoice-${orderId}.png`,
      contentType: 'image/png'
    });

    console.log(`📤 [INVOICE SEND] Sending to Facebook Graph API...`);
    const response = await axios.post(
      `https://graph.facebook.com/v21.0/me/messages?access_token=${pageAccessToken}`,
      form,
      {
        headers: form.getHeaders()
      }
    );

    console.log(`📥 [INVOICE SEND] Graph API response:`, response.data);

    if (response.data.message_id) {
      await db
        .update(orders)
        .set({
          invoiceSentAt: new Date(),
          invoiceSentVia: 'messenger'
        })
        .where(eq(orders.id, orderId));

      console.log(`✅ [INVOICE SEND] SUCCESS - Message ID: ${response.data.message_id}, Recipient: ${facebookId}`);
      return {
        success: true,
        messageId: response.data.message_id,
        recipient: facebookId
      };
    } else {
      console.log(`❌ [INVOICE SEND] No message_id in response:`, response.data);
      return {
        success: false,
        error: 'Failed to send invoice via Messenger'
      };
    }
  } catch (error: any) {
    console.error(`❌ [INVOICE SEND] Error sending invoice for order ${orderId}:`, error.message);
    if (error.response) {
      console.error(`   - Graph API error response:`, error.response.data);
    }
    return {
      success: false,
      error: error.message || 'Failed to send invoice'
    };
  }
}

router.post('/orders/:orderId/send-invoice', async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const result = await sendInvoiceToMessenger(orderId);

    if (result.success) {
      return res.json(result);
    } else {
      // Determine appropriate status code based on error type
      let statusCode = 500; // Default to internal error
      
      if (result.error?.includes('not found')) {
        statusCode = 404;
      } else if (result.error?.includes('Cannot send invoice') || 
                 result.error?.includes('No Facebook') ||
                 result.error?.includes('does not have Facebook ID')) {
        statusCode = 400;
      }
      
      return res.status(statusCode).json({ error: result.error });
    }
  } catch (error: any) {
    console.error('Error in send invoice endpoint:', error);
    return res.status(500).json({
      error: error.message || 'Failed to send invoice'
    });
  }
});

export default router;
