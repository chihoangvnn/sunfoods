import { db } from '../db.js';
import { vendorOrders } from '../../shared/schema.js';
import { eq } from 'drizzle-orm';
import GHTKApi, { GHTKOrderRequest, GHTKOrderResponse, GHTKTrackingResponse } from './ghtk-api.js';

export interface ShippingOrder {
  vendorOrderId: string;
  orderNumber: string;
  customerInfo: {
    fullName: string;
    phone: string;
    address: string;
    province: string;
    district: string;
    ward?: string;
    hamlet?: string;
  };
  productInfo: {
    name: string;
    quantity: number;
    price: number;
    weight: number;
  };
  serviceOptions: {
    pickMoney?: number;
    isFreeship?: boolean;
    note?: string;
    value?: number;
    transport?: string;
    pickOption?: string;
    deliverOption?: string;
    pickSession?: number;
    tags?: number[];
  };
}

export interface GHTKShippingResult {
  success: boolean;
  labelId?: string;
  trackingNumber?: string;
  fee?: number;
  insuranceFee?: number;
  estimatedPickTime?: string;
  estimatedDeliverTime?: string;
  error?: string;
}

export interface GHTKTrackingResult {
  success: boolean;
  status: string;
  statusText?: string;
  pickDate?: string;
  deliverDate?: string;
  lastUpdate?: Date;
  error?: string;
}

class GHTKShippingService {
  private ghtkApi?: GHTKApi;

  async initialize(config?: { token: string; clientSource?: string; baseUrl?: string }): Promise<void> {
    try {
      if (!config) {
        throw new Error('GHTK configuration is required');
      }

      this.ghtkApi = new GHTKApi({
        token: config.token,
        clientSource: config.clientSource,
        baseUrl: config.baseUrl || 'https://services.giaohangtietkiem.vn'
      });

    } catch (error) {
      console.error('GHTK service initialization error:', error);
      throw error;
    }
  }

  async createShippingOrder(shippingData: ShippingOrder, senderInfo: {
    name: string;
    phone: string;
    address: string;
    province: string;
    district: string;
    ward?: string;
  }): Promise<GHTKShippingResult> {
    try {
      if (!this.ghtkApi) {
        throw new Error('GHTK API not initialized');
      }

      const ghtkOrderData: GHTKOrderRequest = {
        products: [{
          name: shippingData.productInfo.name,
          weight: shippingData.productInfo.weight,
          quantity: shippingData.productInfo.quantity,
          price: shippingData.productInfo.price,
        }],
        order: {
          id: shippingData.orderNumber,
          pick_name: senderInfo.name,
          pick_address: senderInfo.address,
          pick_province: senderInfo.province,
          pick_district: senderInfo.district,
          pick_ward: senderInfo.ward,
          pick_tel: senderInfo.phone,
          
          tel: shippingData.customerInfo.phone,
          name: shippingData.customerInfo.fullName,
          address: shippingData.customerInfo.address,
          province: shippingData.customerInfo.province,
          district: shippingData.customerInfo.district,
          ward: shippingData.customerInfo.ward,
          hamlet: shippingData.customerInfo.hamlet,
          
          is_freeship: shippingData.serviceOptions.isFreeship ? "1" : "0",
          pick_money: shippingData.serviceOptions.pickMoney,
          note: shippingData.serviceOptions.note,
          value: shippingData.serviceOptions.value,
          transport: shippingData.serviceOptions.transport,
          pick_option: shippingData.serviceOptions.pickOption,
          deliver_option: shippingData.serviceOptions.deliverOption,
          pick_session: shippingData.serviceOptions.pickSession,
          tags: shippingData.serviceOptions.tags,
        },
      };

      const ghtkResponse = await this.ghtkApi.createOrder(ghtkOrderData);

      if (ghtkResponse.success && ghtkResponse.order) {
        await this.updateVendorOrderShippingInfo(shippingData.vendorOrderId, {
          shippingProvider: 'GHTK',
          shippingCode: ghtkResponse.order.label,
          status: 'processing',
          processingAt: new Date(),
          notes: JSON.stringify({
            ghtkResponse: ghtkResponse.order,
            fee: ghtkResponse.order.fee,
            insuranceFee: ghtkResponse.order.insurance_fee,
            estimatedPickTime: ghtkResponse.order.estimated_pick_time,
            estimatedDeliverTime: ghtkResponse.order.estimated_deliver_time,
            senderInfo,
            receiverInfo: shippingData.customerInfo,
            createdAt: new Date().toISOString(),
          }),
          updatedAt: new Date(),
        });

        return {
          success: true,
          labelId: ghtkResponse.order.label,
          trackingNumber: ghtkResponse.order.label,
          fee: ghtkResponse.order.fee,
          insuranceFee: ghtkResponse.order.insurance_fee,
          estimatedPickTime: ghtkResponse.order.estimated_pick_time,
          estimatedDeliverTime: ghtkResponse.order.estimated_deliver_time,
        };
      } else {
        throw new Error(`GHTK API Error: ${ghtkResponse.message}`);
      }

    } catch (error) {
      console.error('GHTK create shipping order error:', error);
      
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

  async trackOrder(vendorOrderId: string): Promise<GHTKTrackingResult> {
    try {
      if (!this.ghtkApi) {
        throw new Error('GHTK API not initialized');
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
        throw new Error('No GHTK tracking code found for this vendor order');
      }

      const trackingResponse = await this.ghtkApi.getOrderStatus(shippingCode);

      if (trackingResponse.success && trackingResponse.order) {
        const internalStatus = this.mapGHTKStatusToInternal(trackingResponse.order.status);
        
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
            labelId: trackingResponse.order.label_id,
            status: trackingResponse.order.status,
            statusText: trackingResponse.order.status_text,
            pickDate: trackingResponse.order.pick_date,
            deliverDate: trackingResponse.order.deliver_date,
            customerFullname: trackingResponse.order.customer_fullname,
            customerTel: trackingResponse.order.customer_tel,
            address: trackingResponse.order.address,
            shipMoney: trackingResponse.order.ship_money,
            pickMoney: trackingResponse.order.pick_money,
            lastUpdate: new Date().toISOString(),
          }
        });

        await this.updateVendorOrderShippingInfo(vendorOrderId, updateData);

        return {
          success: true,
          status: trackingResponse.order.status,
          statusText: trackingResponse.order.status_text,
          pickDate: trackingResponse.order.pick_date,
          deliverDate: trackingResponse.order.deliver_date,
          lastUpdate: new Date(trackingResponse.order.modified),
        };
      } else {
        throw new Error('No tracking information available');
      }

    } catch (error) {
      console.error('GHTK tracking error:', error);
      return {
        success: false,
        status: 'unknown',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async cancelOrder(vendorOrderId: string, reason?: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.ghtkApi) {
        throw new Error('GHTK API not initialized');
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
        throw new Error('No GHTK tracking code found for this vendor order');
      }

      const cancelResponse = await this.ghtkApi.cancelOrder(shippingCode);

      if (cancelResponse.success) {
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
        throw new Error(`GHTK Cancel Error: ${cancelResponse.message}`);
      }

    } catch (error) {
      console.error('GHTK cancel order error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async calculateShippingFee(params: {
    pickProvince: string;
    pickDistrict: string;
    pickAddress?: string;
    province: string;
    district: string;
    address?: string;
    weight: number;
    value?: number;
    transport?: string;
    deliverOption?: string;
    tags?: number[];
  }): Promise<{ success: boolean; fee?: number; feeDetails?: any; error?: string }> {
    try {
      if (!this.ghtkApi) {
        throw new Error('GHTK API not initialized');
      }

      const feeResponse = await this.ghtkApi.calculateShippingFee({
        pick_province: params.pickProvince,
        pick_district: params.pickDistrict,
        pick_address: params.pickAddress,
        province: params.province,
        district: params.district,
        address: params.address,
        weight: params.weight,
        value: params.value,
        transport: params.transport,
        deliver_option: params.deliverOption,
        tags: params.tags,
      });

      if (feeResponse.success && feeResponse.fee) {
        return {
          success: true,
          fee: feeResponse.fee.fee,
          feeDetails: feeResponse.fee,
        };
      } else {
        throw new Error(`GHTK Fee Calculation Error: ${feeResponse.message}`);
      }

    } catch (error) {
      console.error('GHTK calculate shipping fee error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private mapGHTKStatusToInternal(ghtk_status: string): string {
    const statusMap: { [key: string]: string } = {
      '-1': 'cancelled',
      '1': 'pending',
      '2': 'processing',
      '3': 'processing',
      '4': 'processing',
      '5': 'shipped',
      '6': 'shipped',
      '7': 'delivered',
      '8': 'failed',
      '9': 'failed',
      '10': 'pending',
      '11': 'failed',
      '12': 'shipped',
      '13': 'processing',
      '20': 'failed',
      '123': 'processing',
      '127': 'failed',
    };
    return statusMap[ghtk_status] || 'pending';
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

export default GHTKShippingService;
