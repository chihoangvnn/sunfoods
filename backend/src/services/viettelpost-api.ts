import crypto from 'crypto';

export interface ViettelPostConfig {
  username: string;
  password: string;
  token?: string;
  baseUrl: string;
  groupAddressId?: number;
}

export interface VTPOrderRequest {
  ORDER_NUMBER: string;
  GROUPADDRESS_ID: number;
  CUS_ID?: number;
  DELIVERY_DATE?: string;
  SENDER_FULLNAME: string;
  SENDER_ADDRESS: string;
  SENDER_PHONE: string;
  SENDER_EMAIL?: string;
  SENDER_WARD: number;
  SENDER_DISTRICT: number;
  SENDER_PROVINCE: number;
  RECEIVER_FULLNAME: string;
  RECEIVER_ADDRESS: string;
  RECEIVER_PHONE: string;
  RECEIVER_EMAIL?: string;
  RECEIVER_WARD: number;
  RECEIVER_DISTRICT: number;
  RECEIVER_PROVINCE: number;
  PRODUCT_NAME: string;
  PRODUCT_DESCRIPTION?: string;
  PRODUCT_QUANTITY: number;
  PRODUCT_PRICE: number;
  PRODUCT_WEIGHT: number;
  PRODUCT_LENGTH?: number;
  PRODUCT_WIDTH?: number;
  PRODUCT_HEIGHT?: number;
  ORDER_PAYMENT: number; // 1: Người gửi trả, 2: Người nhận trả, 3: Thu hộ
  ORDER_SERVICE: string; // VCN, VNM, VTK, etc.
  ORDER_SERVICE_ADD?: string; // Dịch vụ gia tăng
  ORDER_VOUCHER?: string;
  ORDER_NOTE?: string;
  MONEY_COLLECTION?: number; // Tiền thu hộ
  MONEY_TOTALFEE?: number; // Tổng cước phí
  MONEY_FEECOD?: number; // Phí thu hộ
  MONEY_FEEINSURANCE?: number; // Phí bảo hiểm
  MONEY_FEE?: number; // Cước chính
  MONEY_FEEOTHER?: number; // Phí khác
  MONEY_TOTALVAT?: number; // Tổng VAT
  MONEY_TOTAL?: number; // Tổng tiền
}

export interface VTPOrderResponse {
  status: number;
  message: string;
  data?: {
    ORDER_NUMBER: string;
    MONEY_TOTAL: number;
    MONEY_TOTALFEE: number;
    EXCHANGE_WEIGHT: number;
    ORDER_SYSTEMCODE?: string; // Mã vận đơn ViettelPost
  };
  error?: string;
}

export interface VTPTrackingResponse {
  status: number;
  message: string;
  data?: Array<{
    ORDER_SYSTEMCODE: string;
    ORDER_STATUSNAME: string;
    ORDER_STATUS: number;
    CREATE_DATE: string;
    UPDATE_DATE: string;
    LOCATION_CURRENT: string;
    NOTE?: string;
  }>;
}

export interface VTPServiceResponse {
  status: number;
  message: string;
  data?: Array<{
    MA_DV_CHINH: string;
    TEN_DICHVU: string;
    GIOI_HANTRONG_LUONG?: number;
    GIOI_HANKICHCO?: string;
    GHI_CHU?: string;
  }>;
}

export interface VTPLocationResponse {
  status: number;
  message: string;
  data?: Array<{
    PROVINCE_ID: number;
    PROVINCE_NAME: string;
    PROVINCE_CODE: string;
  }> | Array<{
    DISTRICT_ID: number;
    DISTRICT_NAME: string;
    DISTRICT_VALUE: number;
    PROVINCE_ID: number;
  }> | Array<{
    WARDS_ID: number;
    WARDS_NAME: string;
    WARDS_VALUE: number;
    DISTRICT_ID: number;
  }>;
}

class ViettelPostAPI {
  private config: ViettelPostConfig;
  private token?: string;
  private tokenExpiry?: Date;

  constructor(config: ViettelPostConfig) {
    this.config = {
      ...config,
      baseUrl: config.baseUrl || 'https://partner.viettelpost.vn/v2'
    };
  }

  /**
   * Login và lấy token xác thực
   */
  async authenticate(): Promise<string> {
    try {
      const response = await fetch(`${this.config.baseUrl}/user/Login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          USERNAME: this.config.username,
          PASSWORD: this.config.password,
        }),
      });

      const result = await response.json();
      
      if (result.status !== 200) {
        throw new Error(`VTP Authentication failed: ${result.message}`);
      }

      this.token = result.data.token;
      this.tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // Token hết hạn sau 24h
      
      return this.token!;
    } catch (error) {
      console.error('ViettelPost authentication error:', error);
      throw error;
    }
  }

  /**
   * Kiểm tra và làm mới token nếu cần
   */
  async ensureValidToken(): Promise<string> {
    if (!this.token || !this.tokenExpiry || this.tokenExpiry < new Date()) {
      await this.authenticate();
    }
    return this.token!;
  }

  /**
   * Tạo đơn hàng ViettelPost
   */
  async createOrder(orderData: VTPOrderRequest): Promise<VTPOrderResponse> {
    try {
      const token = await this.ensureValidToken();
      
      const response = await fetch(`${this.config.baseUrl}/order/createOrder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Token': token,
        },
        body: JSON.stringify(orderData),
      });

      const result: VTPOrderResponse = await response.json();
      
      if (result.status !== 200) {
        console.error('VTP Create Order Error:', result);
        throw new Error(`VTP Create Order failed: ${result.message || result.error}`);
      }

      return result;
    } catch (error) {
      console.error('ViettelPost create order error:', error);
      throw error;
    }
  }

  /**
   * Theo dõi đơn hàng
   */
  async trackOrder(orderSystemCode: string): Promise<VTPTrackingResponse> {
    try {
      const token = await this.ensureValidToken();
      
      const response = await fetch(`${this.config.baseUrl}/order/getOrderStatusByOrderNumber`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Token': token,
        },
        body: JSON.stringify({
          ORDER_NUMBER: orderSystemCode,
        }),
      });

      const result: VTPTrackingResponse = await response.json();
      
      return result;
    } catch (error) {
      console.error('ViettelPost tracking error:', error);
      throw error;
    }
  }

  /**
   * Hủy đơn hàng
   */
  async cancelOrder(orderSystemCode: string, reason?: string): Promise<VTPOrderResponse> {
    try {
      const token = await this.ensureValidToken();
      
      const response = await fetch(`${this.config.baseUrl}/order/cancelOrder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Token': token,
        },
        body: JSON.stringify({
          ORDER_NUMBER: orderSystemCode,
          NOTE: reason || 'Hủy đơn theo yêu cầu khách hàng',
        }),
      });

      const result: VTPOrderResponse = await response.json();
      
      return result;
    } catch (error) {
      console.error('ViettelPost cancel order error:', error);
      throw error;
    }
  }

  /**
   * Lấy danh sách dịch vụ
   */
  async getServices(): Promise<VTPServiceResponse> {
    try {
      const token = await this.ensureValidToken();
      
      const response = await fetch(`${this.config.baseUrl}/categories/listService`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Token': token,
        },
        body: JSON.stringify({}),
      });

      const result: VTPServiceResponse = await response.json();
      
      return result;
    } catch (error) {
      console.error('ViettelPost get services error:', error);
      throw error;
    }
  }

  /**
   * Lấy danh sách tỉnh/thành phố
   */
  async getProvinces(): Promise<VTPLocationResponse> {
    try {
      const token = await this.ensureValidToken();
      
      const response = await fetch(`${this.config.baseUrl}/categories/listProvinceById`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Token': token,
        },
        body: JSON.stringify({ PROVINCE_ID: -1 }),
      });

      const result: VTPLocationResponse = await response.json();
      
      return result;
    } catch (error) {
      console.error('ViettelPost get provinces error:', error);
      throw error;
    }
  }

  /**
   * Lấy danh sách quận/huyện theo tỉnh
   */
  async getDistricts(provinceId: number): Promise<VTPLocationResponse> {
    try {
      const token = await this.ensureValidToken();
      
      const response = await fetch(`${this.config.baseUrl}/categories/listDistrictByProvinceId`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Token': token,
        },
        body: JSON.stringify({ PROVINCE_ID: provinceId }),
      });

      const result: VTPLocationResponse = await response.json();
      
      return result;
    } catch (error) {
      console.error('ViettelPost get districts error:', error);
      throw error;
    }
  }

  /**
   * Lấy danh sách phường/xã theo quận/huyện
   */
  async getWards(districtId: number): Promise<VTPLocationResponse> {
    try {
      const token = await this.ensureValidToken();
      
      const response = await fetch(`${this.config.baseUrl}/categories/listWardsByDistrictId`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Token': token,
        },
        body: JSON.stringify({ DISTRICT_ID: districtId }),
      });

      const result: VTPLocationResponse = await response.json();
      
      return result;
    } catch (error) {
      console.error('ViettelPost get wards error:', error);
      throw error;
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
    productType: number; // 1: Hàng hóa thông thường, 2: Tài liệu
    weight: number; // Trọng lượng (gram)
    value: number; // Giá trị hàng hóa
    serviceCode: string; // VCN, VNM, VTK
    nationalType: number; // 1: Nội tỉnh, 0: Liên tỉnh
  }): Promise<any> {
    try {
      const token = await this.ensureValidToken();
      
      const response = await fetch(`${this.config.baseUrl}/order/getPriceAll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Token': token,
        },
        body: JSON.stringify({
          SENDER_PROVINCE: params.senderProvinceId,
          SENDER_DISTRICT: params.senderDistrictId,
          RECEIVER_PROVINCE: params.receiverProvinceId,
          RECEIVER_DISTRICT: params.receiverDistrictId,
          PRODUCT_TYPE: params.productType,
          PRODUCT_WEIGHT: params.weight,
          PRODUCT_PRICE: params.value,
          MONEY_COLLECTION: 0,
          TYPE: params.nationalType,
          SERVICE_TYPE: params.serviceCode,
        }),
      });

      const result = await response.json();
      
      return result;
    } catch (error) {
      console.error('ViettelPost calculate shipping fee error:', error);
      throw error;
    }
  }
}

export default ViettelPostAPI;