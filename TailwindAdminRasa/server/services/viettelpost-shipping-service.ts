import { db } from '../db.js';
import { orders } from '../../shared/schema.js';
import { eq, and, desc, sql } from 'drizzle-orm';
import ViettelPostAPI, { VTPOrderRequest, VTPOrderResponse, VTPTrackingResponse } from './viettelpost-api.js';
import crypto from 'crypto';

export interface ShippingOrder {
  orderId: string;
  orderNumber: string;
  customerInfo: {
    fullName: string;
    phone: string;
    email?: string;
    address: string;
    wardId: number;
    districtId: number;
    provinceId: number;
  };
  productInfo: {
    name: string;
    description?: string;
    quantity: number;
    price: number;
    weight: number; // in grams
    dimensions?: {
      length: number;
      width: number;
      height: number;
    };
  };
  serviceOptions: {
    serviceCode: string; // VCN, VNM, VTK
    paymentMethod: number; // 1: Người gửi trả, 2: Người nhận trả, 3: Thu hộ
    moneyCollection?: number; // Tiền thu hộ
    insuranceValue?: number;
    note?: string;
  };
}

export interface VTPShippingResult {
  success: boolean;
  vtpOrderSystemCode?: string;
  trackingNumber?: string;
  totalFee?: number;
  estimatedDelivery?: Date;
  error?: string;
}

export interface VTPTrackingResult {
  success: boolean;
  status: string;
  statusName: string;
  currentLocation: string;
  lastUpdate: Date;
  estimatedDelivery?: Date;
  history: Array<{
    status: string;
    statusName: string;
    date: string;
    location: string;
    note?: string;
  }>;
  error?: string;
}

class ViettelPostShippingService {
  private vtpApi?: ViettelPostAPI;

  /**
   * Khởi tạo với cấu hình ViettelPost
   */
  async initialize(configId?: string): Promise<void> {
    try {
      let config;
      
      if (configId) {
        config = await db
          .select()
          .from(viettelpostConfigs)
          .where(and(
            eq(viettelpostConfigs.id, configId),
            eq(viettelpostConfigs.isActive, true)
          ))
          .limit(1);
      } else {
        // Lấy cấu hình mặc định
        config = await db
          .select()
          .from(viettelpostConfigs)
          .where(and(
            eq(viettelpostConfigs.isDefault, true),
            eq(viettelpostConfigs.isActive, true)
          ))
          .limit(1);
      }

      if (!config || config.length === 0) {
        throw new Error('No active ViettelPost configuration found');
      }

      const vtpConfig = config[0];
      
      // Decrypt password
      const decryptedPassword = this.decryptPassword(vtpConfig.password);
      
      this.vtpApi = new ViettelPostAPI({
        username: vtpConfig.username,
        password: decryptedPassword,
        baseUrl: 'https://partner.viettelpost.vn/v2',
        groupAddressId: vtpConfig.groupAddressId || undefined
      });

      // Update last token refresh
      await db
        .update(viettelpostConfigs)
        .set({ 
          lastTokenRefresh: new Date(),
          updatedAt: new Date()
        })
        .where(eq(viettelpostConfigs.id, vtpConfig.id));

    } catch (error) {
      console.error('ViettelPost service initialization error:', error);
      throw error;
    }
  }

  /**
   * Tạo đơn vận chuyển ViettelPost
   */
  async createShippingOrder(shippingData: ShippingOrder): Promise<VTPShippingResult> {
    try {
      if (!this.vtpApi) {
        await this.initialize();
      }

      // Lấy thông tin người gửi mặc định
      const defaultConfig = await this.getDefaultConfig();
      const senderInfo = defaultConfig.defaultSenderInfo;

      // Tạo ORDER_NUMBER unique
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

      // Chuẩn bị dữ liệu đơn hàng VTP
      const vtpOrderData: VTPOrderRequest = {
        ORDER_NUMBER: orderNumber,
        GROUPADDRESS_ID: defaultConfig.groupAddressId || 1,
        
        // Thông tin người gửi
        SENDER_FULLNAME: senderInfo.fullName,
        SENDER_ADDRESS: senderInfo.address,
        SENDER_PHONE: senderInfo.phone,
        SENDER_EMAIL: senderInfo.email,
        SENDER_WARD: senderInfo.wardId,
        SENDER_DISTRICT: senderInfo.districtId,
        SENDER_PROVINCE: senderInfo.provinceId,
        
        // Thông tin người nhận
        RECEIVER_FULLNAME: shippingData.customerInfo.fullName,
        RECEIVER_ADDRESS: shippingData.customerInfo.address,
        RECEIVER_PHONE: shippingData.customerInfo.phone,
        RECEIVER_EMAIL: shippingData.customerInfo.email,
        RECEIVER_WARD: shippingData.customerInfo.wardId,
        RECEIVER_DISTRICT: shippingData.customerInfo.districtId,
        RECEIVER_PROVINCE: shippingData.customerInfo.provinceId,
        
        // Thông tin sản phẩm
        PRODUCT_NAME: shippingData.productInfo.name,
        PRODUCT_DESCRIPTION: shippingData.productInfo.description,
        PRODUCT_QUANTITY: shippingData.productInfo.quantity,
        PRODUCT_PRICE: shippingData.productInfo.price,
        PRODUCT_WEIGHT: shippingData.productInfo.weight,
        PRODUCT_LENGTH: shippingData.productInfo.dimensions?.length,
        PRODUCT_WIDTH: shippingData.productInfo.dimensions?.width,
        PRODUCT_HEIGHT: shippingData.productInfo.dimensions?.height,
        
        // Tùy chọn dịch vụ
        ORDER_PAYMENT: shippingData.serviceOptions.paymentMethod,
        ORDER_SERVICE: shippingData.serviceOptions.serviceCode,
        ORDER_NOTE: shippingData.serviceOptions.note,
        MONEY_COLLECTION: shippingData.serviceOptions.moneyCollection || 0,
      };

      // Gọi API ViettelPost
      const vtpResponse = await this.vtpApi!.createOrder(vtpOrderData);

      if (vtpResponse.status === 200 && vtpResponse.data) {
        // Cập nhật thông tin VTP vào database
        await this.updateOrderVTPInfo(shippingData.orderId, {
          vtpOrderSystemCode: vtpResponse.data.ORDER_SYSTEMCODE,
          vtpOrderNumber: orderNumber,
          vtpServiceCode: shippingData.serviceOptions.serviceCode,
          vtpStatus: 'pending',
          vtpShippingInfo: {
            senderInfo: {
              fullName: senderInfo.fullName,
              address: senderInfo.address,
              phone: senderInfo.phone,
              email: senderInfo.email,
              wardId: senderInfo.wardId,
              districtId: senderInfo.districtId,
              provinceId: senderInfo.provinceId,
            },
            receiverInfo: shippingData.customerInfo,
            productInfo: shippingData.productInfo,
            serviceOptions: shippingData.serviceOptions,
          },
          vtpTrackingData: {
            shippingFee: vtpResponse.data.MONEY_TOTALFEE,
            totalFee: vtpResponse.data.MONEY_TOTAL,
            weightExchange: vtpResponse.data.EXCHANGE_WEIGHT,
            statusHistory: [{
              status: '100',
              statusName: 'Đơn hàng đã được tạo',
              date: new Date().toISOString(),
              location: senderInfo.address,
              note: 'Đơn hàng được tạo thành công'
            }]
          },
          vtpCreatedAt: new Date(),
          vtpUpdatedAt: new Date(),
        });

        return {
          success: true,
          vtpOrderSystemCode: vtpResponse.data.ORDER_SYSTEMCODE,
          trackingNumber: vtpResponse.data.ORDER_SYSTEMCODE,
          totalFee: vtpResponse.data.MONEY_TOTAL,
        };
      } else {
        throw new Error(`VTP API Error: ${vtpResponse.message}`);
      }

    } catch (error) {
      console.error('ViettelPost create shipping order error:', error);
      
      // Cập nhật trạng thái lỗi
      await this.updateOrderVTPInfo(shippingData.orderId, {
        vtpStatus: 'failed',
        vtpUpdatedAt: new Date(),
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Theo dõi đơn hàng
   */
  async trackOrder(orderId: string): Promise<VTPTrackingResult> {
    try {
      if (!this.vtpApi) {
        await this.initialize();
      }

      // Lấy thông tin đơn hàng từ database
      const order = await db
        .select()
        .from(orders)
        .where(eq(orders.id, orderId))
        .limit(1);

      if (!order || order.length === 0) {
        throw new Error('Order not found');
      }

      const vtpOrderSystemCode = order[0].vtpOrderSystemCode;
      if (!vtpOrderSystemCode) {
        throw new Error('No ViettelPost tracking code found for this order');
      }

      // Gọi API tracking ViettelPost
      const trackingResponse = await this.vtpApi!.trackOrder(vtpOrderSystemCode);

      if (trackingResponse.status === 200 && trackingResponse.data && trackingResponse.data.length > 0) {
        const latestStatus = trackingResponse.data[0];
        
        // Map VTP status to our internal status
        const internalStatus = this.mapVTPStatusToInternal(latestStatus.ORDER_STATUS);
        
        // Cập nhật tracking data
        await this.updateOrderVTPInfo(orderId, {
          vtpStatus: internalStatus,
          vtpTrackingData: {
            ...order[0].vtpTrackingData,
            lastUpdate: latestStatus.UPDATE_DATE,
            currentLocation: latestStatus.LOCATION_CURRENT,
            statusHistory: trackingResponse.data.map(status => ({
              status: status.ORDER_STATUS.toString(),
              statusName: status.ORDER_STATUSNAME,
              date: status.UPDATE_DATE,
              location: status.LOCATION_CURRENT,
              note: status.NOTE,
            }))
          },
          vtpUpdatedAt: new Date(),
        });

        return {
          success: true,
          status: latestStatus.ORDER_STATUS.toString(),
          statusName: latestStatus.ORDER_STATUSNAME,
          currentLocation: latestStatus.LOCATION_CURRENT,
          lastUpdate: new Date(latestStatus.UPDATE_DATE),
          history: trackingResponse.data.map(status => ({
            status: status.ORDER_STATUS.toString(),
            statusName: status.ORDER_STATUSNAME,
            date: status.UPDATE_DATE,
            location: status.LOCATION_CURRENT,
            note: status.NOTE,
          }))
        };
      } else {
        throw new Error('No tracking information available');
      }

    } catch (error) {
      console.error('ViettelPost tracking error:', error);
      return {
        success: false,
        status: 'unknown',
        statusName: 'Không thể truy vấn thông tin',
        currentLocation: '',
        lastUpdate: new Date(),
        history: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Hủy đơn hàng
   */
  async cancelOrder(orderId: string, reason?: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.vtpApi) {
        await this.initialize();
      }

      // Lấy thông tin đơn hàng
      const order = await db
        .select()
        .from(orders)
        .where(eq(orders.id, orderId))
        .limit(1);

      if (!order || order.length === 0) {
        throw new Error('Order not found');
      }

      const vtpOrderSystemCode = order[0].vtpOrderSystemCode;
      if (!vtpOrderSystemCode) {
        throw new Error('No ViettelPost tracking code found for this order');
      }

      // Gọi API hủy đơn
      const cancelResponse = await this.vtpApi!.cancelOrder(vtpOrderSystemCode, reason);

      if (cancelResponse.status === 200) {
        // Cập nhật trạng thái hủy
        await this.updateOrderVTPInfo(orderId, {
          vtpStatus: 'cancelled',
          vtpUpdatedAt: new Date(),
        });

        return { success: true };
      } else {
        throw new Error(`VTP Cancel Error: ${cancelResponse.message}`);
      }

    } catch (error) {
      console.error('ViettelPost cancel order error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Tính phí vận chuyển
   */
  async calculateShippingFee(params: {
    senderProvinceId: number;
    senderDistrictId: number;
    receiverProvinceId: number;
    receiverDistrictId: number;
    weight: number; // gram
    value: number; // VND
    serviceCode: string;
  }): Promise<{ success: boolean; fee?: number; estimatedDays?: number; error?: string }> {
    try {
      if (!this.vtpApi) {
        await this.initialize();
      }

      const nationalType = params.senderProvinceId === params.receiverProvinceId ? 1 : 0;
      
      const feeResponse = await this.vtpApi!.calculateShippingFee({
        senderProvinceId: params.senderProvinceId,
        senderDistrictId: params.senderDistrictId,
        receiverProvinceId: params.receiverProvinceId,
        receiverDistrictId: params.receiverDistrictId,
        productType: 1, // Hàng hóa thông thường
        weight: params.weight,
        value: params.value,
        serviceCode: params.serviceCode,
        nationalType: nationalType,
      });

      if (feeResponse.status === 200 && feeResponse.data) {
        return {
          success: true,
          fee: feeResponse.data.MONEY_TOTAL,
          estimatedDays: feeResponse.data.ESTIMATED_DAYS,
        };
      } else {
        throw new Error(`VTP Fee Calculation Error: ${feeResponse.message}`);
      }

    } catch (error) {
      console.error('ViettelPost calculate fee error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Lấy danh sách dịch vụ ViettelPost
   */
  async getAvailableServices(): Promise<any[]> {
    try {
      if (!this.vtpApi) {
        await this.initialize();
      }

      const servicesResponse = await this.vtpApi!.getServices();
      
      if (servicesResponse.status === 200 && servicesResponse.data) {
        return servicesResponse.data;
      }
      
      return [];
    } catch (error) {
      console.error('ViettelPost get services error:', error);
      return [];
    }
  }

  // Helper Methods

  private async getDefaultConfig() {
    const config = await db
      .select()
      .from(viettelpostConfigs)
      .where(and(
        eq(viettelpostConfigs.isDefault, true),
        eq(viettelpostConfigs.isActive, true)
      ))
      .limit(1);

    if (!config || config.length === 0) {
      throw new Error('No default ViettelPost configuration found');
    }

    return config[0];
  }

  private async updateOrderVTPInfo(orderId: string, updateData: any) {
    await db
      .update(orders)
      .set(updateData)
      .where(eq(orders.id, orderId));
  }

  private mapVTPStatusToInternal(vtpStatus: number): string {
    const statusMap: { [key: number]: string } = {
      100: 'pending',      // Chờ lấy hàng
      101: 'processing',   // Đã lấy hàng
      102: 'in_transit',   // Đang vận chuyển
      103: 'in_transit',   // Đang phát
      200: 'delivered',    // Đã giao
      300: 'failed',       // Giao không thành công
      400: 'cancelled',    // Đã hủy
      500: 'failed',       // Hoàn trả
    };

    return statusMap[vtpStatus] || 'pending';
  }

  private encryptPassword(password: string): string {
    const algorithm = 'aes-256-cbc';
    const key = crypto.scryptSync(process.env.ENCRYPTION_KEY || 'default-key', 'salt', 32);
    const iv = crypto.randomBytes(16);
    
    const cipher = crypto.createCipher(algorithm, key);
    let encrypted = cipher.update(password, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return `${iv.toString('hex')}:${encrypted}`;
  }

  private decryptPassword(encryptedPassword: string): string {
    try {
      const algorithm = 'aes-256-cbc';
      const key = crypto.scryptSync(process.env.ENCRYPTION_KEY || 'default-key', 'salt', 32);
      
      const [ivHex, encrypted] = encryptedPassword.split(':');
      const iv = Buffer.from(ivHex, 'hex');
      
      const decipher = crypto.createDecipher(algorithm, key);
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      console.error('Password decryption error:', error);
      return encryptedPassword; // Fallback to plain text for development
    }
  }
}

export default ViettelPostShippingService;