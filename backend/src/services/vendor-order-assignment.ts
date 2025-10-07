import { db } from '../db';
import { vendorOrders, vendorProducts, customers } from '@shared/schema';
import { eq, inArray } from 'drizzle-orm';
import { PushNotificationService } from './push-notification-service';

function maskName(fullName: string): string {
  const parts = fullName.trim().split(' ');
  if (parts.length < 2) return fullName.charAt(0) + '***';
  
  const firstPart = parts[0];
  const secondPartInitial = parts[1].charAt(0);
  
  return `${firstPart} ${secondPartInitial}***`;
}

function maskPhone(phone: string): string {
  if (!phone || phone.length < 8) return '***';
  return phone.slice(0, 3) + '***' + phone.slice(-4);
}

function maskAddress(address: string): string {
  const parts = address.split(',');
  if (parts.length === 0) return '***';
  const streetPart = parts[0].trim();
  const streetWords = streetPart.split(' ');
  if (streetWords.length > 2) {
    streetWords[streetWords.length - 1] = '***';
  }
  parts[0] = streetWords.join(' ');
  return parts.join(',');
}

export async function assignOrderToVendors(params: {
  orderId: string;
  customerId: string;
  orderItems: Array<{ productId: string; quantity: number; price: string }>;
  paymentMethod: string;
  shippingInfo?: any;
}): Promise<{ success: boolean; vendorOrderIds: string[]; error?: string }> {
  try {
    const vendorOrderIds: string[] = [];

    await db.transaction(async (tx) => {
      const customer = await tx
        .select()
        .from(customers)
        .where(eq(customers.id, params.customerId))
        .limit(1);

      if (!customer || customer.length === 0) {
        throw new Error(`Customer not found: ${params.customerId}`);
      }

      const customerData = customer[0];
      const customerName = customerData.name || '';
      const customerPhone = customerData.phone || '';
      const customerAddress = customerData.address || '';

      const maskedName = maskName(customerName);
      const maskedPhone = maskPhone(customerPhone);
      const maskedAddress = maskAddress(customerAddress);

      const shippingProvider = params.shippingInfo?.provider || params.shippingInfo?.carrier || null;
      const shippingCode = params.shippingInfo?.trackingNumber || params.shippingInfo?.code || null;
      const shippingLabelUrl = params.shippingInfo?.labelUrl || null;

      const productIds = params.orderItems.map(item => item.productId);
      
      if (productIds.length === 0) {
        return;
      }

      const vendorProductsData = await tx
        .select()
        .from(vendorProducts)
        .where(inArray(vendorProducts.productId, productIds));

      if (vendorProductsData.length === 0) {
        console.log('No vendor products found in order items');
        return;
      }

      const vendorGroups = new Map<string, Array<{
        productId: string;
        quantity: number;
        consignmentPrice: string;
        commissionPerUnit: string;
      }>>();

      for (const orderItem of params.orderItems) {
        const vendorProduct = vendorProductsData.find(
          vp => vp.productId === orderItem.productId
        );

        if (!vendorProduct) {
          continue;
        }

        if (vendorProduct.status !== 'active') {
          console.log(`Skipping inactive vendor product: ${vendorProduct.id}`);
          continue;
        }

        const vendorId = vendorProduct.vendorId;
        
        if (!vendorGroups.has(vendorId)) {
          vendorGroups.set(vendorId, []);
        }

        vendorGroups.get(vendorId)!.push({
          productId: orderItem.productId,
          quantity: orderItem.quantity,
          consignmentPrice: vendorProduct.consignmentPrice.toString(),
          commissionPerUnit: (vendorProduct.commissionPerUnit || '0').toString()
        });
      }

      for (const [vendorId, items] of Array.from(vendorGroups.entries())) {
        let vendorCost = 0;
        let commissionAmount = 0;

        for (const item of items) {
          const quantity = item.quantity;
          const consignmentPrice = parseFloat(item.consignmentPrice);
          const commissionPerUnit = parseFloat(item.commissionPerUnit);

          vendorCost += quantity * consignmentPrice;
          commissionAmount += quantity * commissionPerUnit;
        }

        const codAmount = params.paymentMethod === 'cod' ? vendorCost : 0;

        const [insertedVendorOrder] = await tx
          .insert(vendorOrders)
          .values({
            vendorId: vendorId,
            orderId: params.orderId,
            maskedCustomerName: maskedName,
            maskedCustomerPhone: maskedPhone,
            maskedCustomerAddress: maskedAddress,
            shippingProvider: shippingProvider,
            shippingCode: shippingCode,
            shippingLabelUrl: shippingLabelUrl,
            codAmount: codAmount.toFixed(2),
            vendorCost: vendorCost.toFixed(2),
            commissionAmount: commissionAmount.toFixed(2),
            depositDeducted: '0.00',
            status: 'pending',
            notes: null,
          })
          .returning({ id: vendorOrders.id });

        vendorOrderIds.push(insertedVendorOrder.id);

        console.log(`✅ Created vendor order for vendor ${vendorId}:`, {
          vendorOrderId: insertedVendorOrder.id,
          orderId: params.orderId,
          vendorCost: vendorCost.toFixed(2),
          commissionAmount: commissionAmount.toFixed(2),
          codAmount: codAmount.toFixed(2),
          itemCount: items.length
        });

        try {
          await PushNotificationService.sendNewOrderNotification(
            vendorId,
            insertedVendorOrder.id,
            vendorCost
          );
          console.log(`📱 Sent push notification to vendor ${vendorId} for new order`);
        } catch (notifError) {
          console.error(`Failed to send push notification to vendor ${vendorId}:`, notifError);
        }
      }
    });

    if (vendorOrderIds.length === 0) {
      console.log(`No vendor orders created for order ${params.orderId} (no vendor products found)`);
    } else {
      console.log(`✅ Successfully created ${vendorOrderIds.length} vendor orders for order ${params.orderId}`);
    }

    return {
      success: true,
      vendorOrderIds: vendorOrderIds
    };

  } catch (error) {
    console.error(`❌ Error assigning order ${params.orderId} to vendors:`, error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return {
      success: false,
      vendorOrderIds: [],
      error: errorMessage
    };
  }
}
