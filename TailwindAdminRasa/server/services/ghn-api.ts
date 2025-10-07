export interface GHNConfig {
  token: string;
  shopId: number;
  baseUrl: string;
}

export interface GHNOrderRequest {
  payment_type_id: number;
  note?: string;
  required_note?: string;
  from_name: string;
  from_phone: string;
  from_address: string;
  from_ward_name: string;
  from_district_name: string;
  from_province_name: string;
  to_name: string;
  to_phone: string;
  to_address: string;
  to_ward_code: string;
  to_district_id: number;
  cod_amount?: number;
  content?: string;
  weight: number;
  length?: number;
  width?: number;
  height?: number;
  insurance_value?: number;
  service_type_id?: number;
  items: Array<{
    name: string;
    code?: string;
    quantity: number;
    price?: number;
  }>;
}

export interface GHNOrderResponse {
  code: number;
  message: string;
  data?: {
    order_code: string;
    sort_code?: string;
    trans_type?: string;
    ward_encode?: string;
    district_encode?: string;
    fee: {
      main_service: number;
      insurance: number;
      cod_fee: number;
      station_do: number;
      station_pu: number;
      return: number;
      r2s: number;
      coupon: number;
      total: number;
    };
    total_fee: number;
    expected_delivery_time: string;
  };
}

export interface GHNTrackingResponse {
  code: number;
  message: string;
  data?: {
    order_code: string;
    status: string;
    log: Array<{
      status: string;
      updated_date: string;
      location: string;
    }>;
  };
}

export interface GHNServiceResponse {
  code: number;
  message: string;
  data?: Array<{
    service_id: number;
    short_name: string;
    service_type_id: number;
  }>;
}

export interface GHNFeeResponse {
  code: number;
  message: string;
  data?: {
    total: number;
    service_fee: number;
    insurance_fee: number;
    pick_station_fee: number;
    coupon_value: number;
    r2s_fee: number;
  };
}

export interface GHNCancelResponse {
  code: number;
  message: string;
  data?: any;
}

class GHNApi {
  private config: GHNConfig;

  constructor(config: GHNConfig) {
    this.config = {
      ...config,
      baseUrl: config.baseUrl || 'https://online-gateway.ghn.vn/shiip/public-api/'
    };
  }

  private getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'Token': this.config.token,
      'ShopId': this.config.shopId.toString(),
    };
  }

  async createOrder(orderData: GHNOrderRequest): Promise<GHNOrderResponse> {
    try {
      const response = await fetch(`${this.config.baseUrl}v2/shipping-order/create`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(orderData),
      });

      const result: GHNOrderResponse = await response.json();
      
      if (result.code !== 200) {
        console.error('GHN Create Order Error:', result);
        throw new Error(`GHN Create Order failed: ${result.message}`);
      }

      return result;
    } catch (error) {
      console.error('GHN create order error:', error);
      throw error;
    }
  }

  async getOrderDetails(orderCode: string): Promise<GHNTrackingResponse> {
    try {
      const response = await fetch(`${this.config.baseUrl}v2/shipping-order/detail`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          order_code: orderCode,
        }),
      });

      const result: GHNTrackingResponse = await response.json();
      
      if (result.code !== 200) {
        console.error('GHN Get Order Details Error:', result);
        throw new Error(`GHN Get Order Details failed: ${result.message}`);
      }

      return result;
    } catch (error) {
      console.error('GHN get order details error:', error);
      throw error;
    }
  }

  async cancelOrder(orderCodes: string[]): Promise<GHNCancelResponse> {
    try {
      const response = await fetch(`${this.config.baseUrl}v2/switch-status/cancel`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          order_codes: orderCodes,
        }),
      });

      const result: GHNCancelResponse = await response.json();
      
      if (result.code !== 200) {
        console.error('GHN Cancel Order Error:', result);
        throw new Error(`GHN Cancel Order failed: ${result.message}`);
      }

      return result;
    } catch (error) {
      console.error('GHN cancel order error:', error);
      throw error;
    }
  }

  async calculateShippingFee(params: {
    from_district_id: number;
    from_ward_code?: string;
    to_district_id: number;
    to_ward_code: string;
    weight: number;
    length?: number;
    width?: number;
    height?: number;
    insurance_value?: number;
    service_type_id?: number;
    cod_value?: number;
  }): Promise<GHNFeeResponse> {
    try {
      const response = await fetch(`${this.config.baseUrl}v2/shipping-order/fee`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(params),
      });

      const result: GHNFeeResponse = await response.json();
      
      if (result.code !== 200) {
        console.error('GHN Calculate Fee Error:', result);
        throw new Error(`GHN Calculate Fee failed: ${result.message}`);
      }

      return result;
    } catch (error) {
      console.error('GHN calculate shipping fee error:', error);
      throw error;
    }
  }

  async getAvailableServices(params: {
    shop_id: number;
    from_district: number;
    to_district: number;
  }): Promise<GHNServiceResponse> {
    try {
      const response = await fetch(`${this.config.baseUrl}v2/shipping-order/available-services`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(params),
      });

      const result: GHNServiceResponse = await response.json();
      
      if (result.code !== 200) {
        console.error('GHN Get Available Services Error:', result);
        throw new Error(`GHN Get Available Services failed: ${result.message}`);
      }

      return result;
    } catch (error) {
      console.error('GHN get available services error:', error);
      throw error;
    }
  }
}

export default GHNApi;
