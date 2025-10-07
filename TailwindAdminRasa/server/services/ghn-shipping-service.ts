import { db } from '../db.js';
import { vendorOrders } from '../../shared/schema.js';
import { eq, and } from 'drizzle-orm';
import GHNApi, { GHNOrderRequest, GHNOrderResponse, GHNTrackingResponse } from './ghn-api.js';

export interface ShippingOrder {
  vendorOrderId: string;
  orderNumber: string;
  customerInfo: {
    fullName: string;
    phone: string;
    address: string;
    wardCode: string;
    districtId: number;
    wardName?: string;
    districtName?: string;
    provinceName?: string;
  };
  productInfo: {
    name: string;
    quantity: number;
    price: number;
    weight: number;
    dimensions?: {
      length: number;
      width: number;
      height: number;
    };
  };
  serviceOptions: {
    paymentTypeId: number;
    requiredNote?: string;
    codAmount?: number;
    insuranceValue?: number;
    serviceTypeId?: number;
    note?: string;
    content?: string;
  };
}

export interface GHNShippingResult {
  success: boolean;
  orderCode?: string;
  trackingNumber?: string;
  totalFee?: number;
  expectedDeliveryTime?: string;
  error?: string;
}

export interface GHNTrackingResult {
  success: boolean;
  status: string;
  currentLocation?: string;
  lastUpdate?: Date;
  history: Array<{
    status: string;
    date: string;
    location: string;
  }>;
  error?: string;
}

class GHNShippingService {
  private ghnApi?: GHNApi;

  async initialize(config?: { token: string; shopId: number; baseUrl?: string }): Promise<void> {
    try {
      if (!config) {
        throw new Error('GHN configuration is required');
      }

      this.ghnApi = new GHNApi({
        token: config.token,
        shopId: config.shopId,
        baseUrl: config.baseUrl || 'https://online-gateway.ghn.vn/shiip/public-api/'
      });

    } catch (error) {
      console.error('GHN service initialization error:', error);
      throw error;
    }
  }

  async createShippingOrder(shippingData: ShippingOrder, senderInfo: {
    name: string;
    phone: string;
    address: string;
    wardName: string;
    districtName: string;
    provinceName: string;
  }): Promise<GHNShippingResult> {
    try {
      if (!this.ghnApi) {
        throw new Error('GHN API not initialized');
      }

      const ghnOrderData: GHNOrderRequest = {
        payment_type_id: shippingData.serviceOptions.paymentTypeId,
        note: shippingData.serviceOptions.note,
        required_note: shippingData.serviceOptions.requiredNote || 'KHONGCHOXEMHANG',
        
        from_name: senderInfo.name,
        from_phone: senderInfo.phone,
        from_address: senderInfo.address,
        from_ward_name: senderInfo.wardName,
        from_district_name: senderInfo.districtName,
        from_province_name: senderInfo.provinceName,
        
        to_name: shippingData.customerInfo.fullName,
        to_phone: shippingData.customerInfo.phone,
        to_address: shippingData.customerInfo.address,
        to_ward_code: shippingData.customerInfo.wardCode,
        to_district_id: shippingData.customerInfo.districtId,
        
        cod_amount: shippingData.serviceOptions.codAmount || 0,
        content: shippingData.serviceOptions.content || shippingData.productInfo.name,
        weight: shippingData.productInfo.weight,
        length: shippingData.productInfo.dimensions?.length,
        width: shippingData.productInfo.dimensions?.width,
        height: shippingData.productInfo.dimensions?.height,
        insurance_value: shippingData.serviceOptions.insuranceValue,
        service_type_id: shippingData.serviceOptions.serviceTypeId,
        
        items: [{
          name: shippingData.productInfo.name,
          quantity: shippingData.productInfo.quantity,
          price: shippingData.productInfo.price,
        }],
      };

      const ghnResponse = await this.ghnApi.createOrder(ghnOrderData);

      if (ghnResponse.code === 200 && ghnResponse.data) {
        await this.updateVendorOrderShippingInfo(shippingData.vendorOrderId, {
          shippingProvider: 'GHN',
          shippingCode: ghnResponse.data.order_code,
          status: 'processing',
          processingAt: new Date(),
          notes: JSON.stringify({
            ghnResponse: ghnResponse.data,
            fee: ghnResponse.data.fee,
            totalFee: ghnResponse.data.total_fee,
            expectedDeliveryTime: ghnResponse.data.expected_delivery_time,
            senderInfo,
            receiverInfo: shippingData.customerInfo,
            createdAt: new Date().toISOString(),
          }),
          updatedAt: new Date(),
        });

        return {
          success: true,
          orderCode: ghnResponse.data.order_code,
          trackingNumber: ghnResponse.data.order_code,
          totalFee: ghnResponse.data.total_fee,
          expectedDeliveryTime: ghnResponse.data.expected_delivery_time,
        };
      } else {
        throw new Error(`GHN API Error: ${ghnResponse.message}`);
      }

    } catch (error) {
      console.error('GHN create shipping order error:', error);
      
      await this.updateVendorOrderShippingInfo(shippingData.vendorOrderId, {
        status: 'pending',
        notes: JSON.stringify({
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString(),
        }),
        updatedAt: new Date(),
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async trackOrder(vendorOrderId: string): Promise<GHNTrackingResult> {
    try {
      if (!this.ghnApi) {
        throw new Error('GHN API not initialized');
      }

      const vendorOrder = await db
        .select()
        .from(vendorOrders)
        .where(eq(vendorOrders.id, vendorOrderId))
        .limit(1);

      if (!vendorOrder || vendorOrder.length === 0) {
        throw new Error('Vendor order not found');
      }

      const shippingCode = vendorOrder[0].shippingCode;
      if (!shippingCode) {
        throw new Error('No GHN tracking code found for this vendor order');
      }

      const trackingResponse = await this.ghnApi.getOrderDetails(shippingCode);

      if (trackingResponse.code === 200 && trackingResponse.data) {
        const internalStatus = this.mapGHNStatusToInternal(trackingResponse.data.status);
        
        const updateData: any = {
          status: internalStatus as any,
          updatedAt: new Date(),
        };

        if (internalStatus === 'processing' && !vendorOrder[0].processingAt) {
          updateData.processingAt = new Date();
        } else if (internalStatus === 'shipped' && !vendorOrder[0].shippedAt) {
          updateData.shippedAt = new Date();
        } else if (internalStatus === 'delivered' && !vendorOrder[0].deliveredAt) {
          updateData.deliveredAt = new Date();
        } else if (internalStatus === 'cancelled' && !vendorOrder[0].cancelledAt) {
          updateData.cancelledAt = new Date();
        }

        const existingNotes = vendorOrder[0].notes ? JSON.parse(vendorOrder[0].notes) : {};
        updateData.notes = JSON.stringify({
          ...existingNotes,
          trackingData: {
            status: trackingResponse.data.status,
            orderCode: trackingResponse.data.order_code,
            log: trackingResponse.data.log,
            lastUpdate: new Date().toISOString(),
          }
        });

        await this.updateVendorOrderShippingInfo(vendorOrderId, updateData);

        return {
          success: true,
          status: trackingResponse.data.status,
          currentLocation: trackingResponse.data.log?.[0]?.location || '',
          lastUpdate: trackingResponse.data.log?.[0]?.updated_date 
            ? new Date(trackingResponse.data.log[0].updated_date) 
            : new Date(),
          history: trackingResponse.data.log?.map(log => ({
            status: log.status,
            date: log.updated_date,
            location: log.location,
          })) || []
        };
      } else {
        throw new Error('No tracking information available');
      }

    } catch (error) {
      console.error('GHN tracking error:', error);
      return {
        success: false,
        status: 'unknown',
        history: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async cancelOrder(vendorOrderId: string, reason?: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.ghnApi) {
        throw new Error('GHN API not initialized');
      }

      const vendorOrder = await db
        .select()
        .from(vendorOrders)
        .where(eq(vendorOrders.id, vendorOrderId))
        .limit(1);

      if (!vendorOrder || vendorOrder.length === 0) {
        throw new Error('Vendor order not found');
      }

      const shippingCode = vendorOrder[0].shippingCode;
      if (!shippingCode) {
        throw new Error('No GHN tracking code found for this vendor order');
      }

      const cancelResponse = await this.ghnApi.cancelOrder([shippingCode]);

      if (cancelResponse.code === 200) {
        await this.updateVendorOrderShippingInfo(vendorOrderId, {
          status: 'cancelled',
          cancelledAt: new Date(),
          notes: JSON.stringify({
            ...(vendorOrder[0].notes ? JSON.parse(vendorOrder[0].notes) : {}),
            cancelReason: reason || 'Cancelled by request',
            cancelledAt: new Date().toISOString(),
          }),
          updatedAt: new Date(),
        });

        return { success: true };
      } else {
        throw new Error(`GHN Cancel Error: ${cancelResponse.message}`);
      }

    } catch (error) {
      console.error('GHN cancel order error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async calculateShippingFee(params: {
    fromDistrictId: number;
    fromWardCode?: string;
    toDistrictId: number;
    toWardCode: string;
    weight: number;
    length?: number;
    width?: number;
    height?: number;
    insuranceValue?: number;
    serviceTypeId?: number;
    codValue?: number;
  }): Promise<{ success: boolean; fee?: number; feeDetails?: any; error?: string }> {
    try {
      if (!this.ghnApi) {
        throw new Error('GHN API not initialized');
      }

      const feeResponse = await this.ghnApi.calculateShippingFee({
        from_district_id: params.fromDistrictId,
        from_ward_code: params.fromWardCode,
        to_district_id: params.toDistrictId,
        to_ward_code: params.toWardCode,
        weight: params.weight,
        length: params.length,
        width: params.width,
        height: params.height,
        insurance_value: params.insuranceValue,
        service_type_id: params.serviceTypeId,
        cod_value: params.codValue,
      });

      if (feeResponse.code === 200 && feeResponse.data) {
        return {
          success: true,
          fee: feeResponse.data.total,
          feeDetails: feeResponse.data,
        };
      } else {
        throw new Error(`GHN Fee Calculation Error: ${feeResponse.message}`);
      }

    } catch (error) {
      console.error('GHN calculate shipping fee error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private mapGHNStatusToInternal(ghnStatus: string): string {
    const statusMap: { [key: string]: string } = {
      'ready_to_pick': 'pending',
      'picking': 'processing',
      'picked': 'processing',
      'storing': 'processing',
      'transporting': 'shipped',
      'sorting': 'shipped',
      'delivering': 'shipped',
      'money_collect_delivering': 'shipped',
      'delivered': 'delivered',
      'delivery_fail': 'pending',
      'cancel': 'cancelled',
      'returned': 'returned',
      'return_transporting': 'returned',
      'return_sorting': 'returned',
      'returning': 'returned',
      'return_fail': 'pending',
      'exception': 'pending',
      'damage': 'pending',
      'lost': 'pending',
    };
    return statusMap[ghnStatus] || 'pending';
  }

  private async updateVendorOrderShippingInfo(vendorOrderId: string, data: any): Promise<void> {
    try {
      await db
        .update(vendorOrders)
        .set(data)
        .where(eq(vendorOrders.id, vendorOrderId));
    } catch (error) {
      console.error('Error updating vendor order shipping info:', error);
      throw error;
    }
  }
}

export default GHNShippingService;
