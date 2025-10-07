import { db } from '../db.js';
import { orders } from '../../shared/schema.js';
import { eq, and } from 'drizzle-orm';
import ViettelPostShippingService from './viettelpost-shipping-service.js';

export interface OrderShippingData {
  orderId: string;
  customerInfo: {
    name: string;
    phone: string;
    email?: string;
    address: string;
  };
  productInfo: {
    name: string;
    totalValue: number;
    totalWeight?: number;
    items: Array<{
      name: string;
      quantity: number;
      price: number;
    }>;
  };
  shippingOptions?: {
    serviceCode?: string;
    paymentMethod?: number;
    moneyCollection?: number;
    note?: string;
  };
}

class VTPOrderIntegration {
  private vtpService: ViettelPostShippingService;

  constructor() {
    this.vtpService = new ViettelPostShippingService();
  }

  /**
   * Tự động tạo ViettelPost shipping cho đơn hàng mới
   */
  async autoCreateShippingForOrder(orderData: OrderShippingData): Promise<{
    success: boolean;
    vtpOrderSystemCode?: string;
    error?: string;
  }> {
    try {
      // Kiểm tra cấu hình auto create order
      const config = await this.getActiveConfig();
      if (!config || !config.autoCreateOrder) {
        return {
          success: false,
          error: 'Auto create order is disabled or no active ViettelPost configuration found'
        };
      }

      // Chuẩn bị dữ liệu shipping
      const shippingData = await this.prepareShippingData(orderData, config);
      
      // Tạo đơn vận chuyển ViettelPost
      const result = await this.vtpService.createShippingOrder(shippingData);

      if (result.success) {
        console.log(`✅ ViettelPost shipping created for order ${orderData.orderId}: ${result.vtpOrderSystemCode}`);
        
        // Log shipping creation event
        await this.logShippingEvent(orderData.orderId, 'created', {
          vtpOrderSystemCode: result.vtpOrderSystemCode,
          totalFee: result.totalFee,
        });

        return {
          success: true,
          vtpOrderSystemCode: result.vtpOrderSystemCode,
        };
      } else {
        console.error(`❌ Failed to create ViettelPost shipping for order ${orderData.orderId}:`, result.error);
        
        // Log error event
        await this.logShippingEvent(orderData.orderId, 'failed', {
          error: result.error,
        });

        return {
          success: false,
          error: result.error,
        };
      }

    } catch (error) {
      console.error('VTP auto create shipping error:', error);
      
      // Log error event
      await this.logShippingEvent(orderData.orderId, 'error', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Tính phí vận chuyển cho đơn hàng
   */
  async calculateShippingFeeForOrder(orderData: OrderShippingData): Promise<{
    success: boolean;
    fee?: number;
    estimatedDays?: number;
    error?: string;
  }> {
    try {
      const config = await this.getActiveConfig();
      if (!config) {
        return {
          success: false,
          error: 'No active ViettelPost configuration found'
        };
      }

      // Sử dụng địa chỉ mặc định từ config hoặc default values
      const senderInfo = config.defaultSenderInfo;
      
      // TODO: Parse địa chỉ khách hàng thành province/district/ward ID
      // Hiện tại sử dụng default values - cần implement address parsing
      const receiverProvinceId = 1; // HCM
      const receiverDistrictId = 1; // Q1
      
      const result = await this.vtpService.calculateShippingFee({
        senderProvinceId: senderInfo.provinceId,
        senderDistrictId: senderInfo.districtId,
        receiverProvinceId: receiverProvinceId,
        receiverDistrictId: receiverDistrictId,
        weight: orderData.productInfo.totalWeight || 500, // Default 500g
        value: orderData.productInfo.totalValue,
        serviceCode: orderData.shippingOptions?.serviceCode || config.defaultServiceCode,
      });

      return result;

    } catch (error) {
      console.error('VTP calculate fee error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Kiểm tra trạng thái đơn hàng ViettelPost
   */
  async checkOrderStatus(orderId: string): Promise<{
    success: boolean;
    status?: string;
    statusName?: string;
    lastUpdate?: Date;
    error?: string;
  }> {
    try {
      const result = await this.vtpService.trackOrder(orderId);
      
      if (result.success) {
        // Log tracking event
        await this.logShippingEvent(orderId, 'tracked', {
          status: result.status,
          statusName: result.statusName,
          currentLocation: result.currentLocation,
        });

        return {
          success: true,
          status: result.status,
          statusName: result.statusName,
          lastUpdate: result.lastUpdate,
        };
      } else {
        return {
          success: false,
          error: result.error,
        };
      }

    } catch (error) {
      console.error('VTP check order status error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Hủy đơn vận chuyển ViettelPost
   */
  async cancelShipping(orderId: string, reason?: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const result = await this.vtpService.cancelOrder(orderId, reason);
      
      if (result.success) {
        console.log(`✅ ViettelPost shipping cancelled for order ${orderId}`);
        
        // Log cancellation event
        await this.logShippingEvent(orderId, 'cancelled', {
          reason: reason,
        });

        return { success: true };
      } else {
        console.error(`❌ Failed to cancel ViettelPost shipping for order ${orderId}:`, result.error);
        return {
          success: false,
          error: result.error,
        };
      }

    } catch (error) {
      console.error('VTP cancel shipping error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Helper Methods

  private async getActiveConfig() {
    const configs = await db
      .select()
      .from(viettelpostConfigs)
      .where(and(
        eq(viettelpostConfigs.isActive, true),
        eq(viettelpostConfigs.isDefault, true)
      ))
      .limit(1);

    return configs.length > 0 ? configs[0] : null;
  }

  private async prepareShippingData(orderData: OrderShippingData, config: any) {
    // Parse địa chỉ khách hàng - hiện tại sử dụng default values
    // TODO: Implement proper address parsing for Vietnam locations
    const customerWardId = 1;
    const customerDistrictId = 1;
    const customerProvinceId = 1;

    // Tính tổng trọng lượng từ items
    let totalWeight = orderData.productInfo.totalWeight || 0;
    if (totalWeight === 0) {
      // Estimate weight based on items (default 100g per item)
      totalWeight = orderData.productInfo.items.reduce((sum, item) => {
        return sum + (item.quantity * 100); // 100g per item
      }, 0);
    }

    return {
      orderId: orderData.orderId,
      orderNumber: `ORDER-${orderData.orderId.slice(-8)}`,
      customerInfo: {
        fullName: orderData.customerInfo.name,
        phone: orderData.customerInfo.phone,
        email: orderData.customerInfo.email,
        address: orderData.customerInfo.address,
        wardId: customerWardId,
        districtId: customerDistrictId,
        provinceId: customerProvinceId,
      },
      productInfo: {
        name: orderData.productInfo.items.length > 1 
          ? `Đơn hàng #${orderData.orderId.slice(-8)} (${orderData.productInfo.items.length} sản phẩm)`
          : orderData.productInfo.items[0]?.name || 'Sản phẩm',
        description: orderData.productInfo.items.map(item => 
          `${item.name} x${item.quantity}`
        ).join(', '),
        quantity: orderData.productInfo.items.reduce((sum, item) => sum + item.quantity, 0),
        price: orderData.productInfo.totalValue,
        weight: Math.max(totalWeight, 100), // Minimum 100g
      },
      serviceOptions: {
        serviceCode: orderData.shippingOptions?.serviceCode || config.defaultServiceCode,
        paymentMethod: orderData.shippingOptions?.paymentMethod || 1, // Người gửi trả
        moneyCollection: orderData.shippingOptions?.moneyCollection || 0,
        note: orderData.shippingOptions?.note || `Đơn hàng từ e-commerce #${orderData.orderId.slice(-8)}`,
      }
    };
  }

  private async logShippingEvent(orderId: string, eventType: string, eventData: any) {
    try {
      // Log shipping events for monitoring and debugging
      console.log(`📦 VTP Event [${eventType}] for order ${orderId}:`, eventData);
      
      // TODO: Store shipping events in database for audit trail
      // This could be useful for tracking shipping history and debugging issues
      
    } catch (error) {
      console.error('Error logging shipping event:', error);
    }
  }
}

export const vtpOrderIntegration = new VTPOrderIntegration();