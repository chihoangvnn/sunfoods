interface GHNConfig {
  apiKey: string;
  shopId: string;
  baseURL: string;
}

interface GHNCreateOrderParams {
  to_name: string;
  to_phone: string;
  to_address: string;
  to_ward_code: string;
  to_district_id: number;
  cod_amount: number;
  content: string;
  weight: number;
  length: number;
  width: number;
  height: number;
  service_type_id: number;
  payment_type_id: number;
  required_note: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

interface GHNCreateOrderResponse {
  code: number;
  message: string;
  data: {
    order_code: string;
    sort_code: string;
    trans_type: string;
    ward_encode: string;
    district_encode: string;
    fee: {
      main_service: number;
      insurance: number;
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

interface GHNOrderDetailResponse {
  code: number;
  message: string;
  data: {
    order_code: string;
    status: string;
    log: Array<{
      status: string;
      updated_date: string;
      location?: string;
      message?: string;
    }>;
    expected_delivery_time?: string;
    leadtime?: string;
  };
}

interface GHNCancelOrderResponse {
  code: number;
  message: string;
  data: {
    order_code: string;
    result: boolean;
    message: string;
  };
}

interface GHNCalculateFeeParams {
  from_district_id: number;
  to_district_id: number;
  to_ward_code?: string;
  weight: number;
  length?: number;
  width?: number;
  height?: number;
  service_type_id: number;
  insurance_value?: number;
  coupon?: string;
}

interface GHNCalculateFeeResponse {
  code: number;
  message: string;
  data: {
    total: number;
    service_fee: number;
    insurance_fee: number;
    pick_station_fee: number;
    coupon_value: number;
    r2s_fee: number;
  };
}

interface GHNLabelTokenResponse {
  code: number;
  message: string;
  data: {
    token: string;
  };
}

export class GHNClient {
  private config: GHNConfig;

  constructor(config?: Partial<GHNConfig>) {
    this.config = {
      apiKey: config?.apiKey || process.env.GHN_API_KEY || '',
      shopId: config?.shopId || process.env.GHN_SHOP_ID || '',
      baseURL: config?.baseURL || process.env.GHN_API_BASE_URL || 'https://dev-online-gateway.ghn.vn'
    };

    if (!this.config.apiKey || !this.config.shopId) {
      console.warn('⚠️ GHN API credentials not configured. Set GHN_API_KEY and GHN_SHOP_ID environment variables.');
    }
  }

  private async makeRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' = 'POST',
    body?: any
  ): Promise<T> {
    if (!this.config.apiKey || !this.config.shopId) {
      throw new Error('GHN API credentials not configured');
    }

    const url = `${this.config.baseURL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Token': this.config.apiKey,
          'ShopId': this.config.shopId
        },
        body: body ? JSON.stringify(body) : undefined
      });

      const data = await response.json();

      if (data.code !== 200) {
        throw new Error(`GHN API Error: ${data.message || 'Unknown error'} (Code: ${data.code})`);
      }

      return data as T;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`GHN API request failed: ${error.message}`);
      }
      throw new Error('GHN API request failed with unknown error');
    }
  }

  async createOrder(params: GHNCreateOrderParams): Promise<GHNCreateOrderResponse> {
    return this.makeRequest<GHNCreateOrderResponse>(
      '/shiip/public-api/v2/shipping-order/create',
      'POST',
      params
    );
  }

  async getOrderDetail(orderCode: string): Promise<GHNOrderDetailResponse> {
    return this.makeRequest<GHNOrderDetailResponse>(
      '/shiip/public-api/v2/shipping-order/detail',
      'POST',
      { order_code: orderCode }
    );
  }

  async cancelOrder(orderCodes: string[]): Promise<GHNCancelOrderResponse> {
    return this.makeRequest<GHNCancelOrderResponse>(
      '/shiip/public-api/v2/shipping-order/cancel',
      'POST',
      { order_codes: orderCodes }
    );
  }

  async calculateFee(params: GHNCalculateFeeParams): Promise<GHNCalculateFeeResponse> {
    return this.makeRequest<GHNCalculateFeeResponse>(
      '/shiip/public-api/v2/shipping-order/fee',
      'POST',
      params
    );
  }

  async getShippingLabel(orderCode: string): Promise<GHNLabelTokenResponse> {
    return this.makeRequest<GHNLabelTokenResponse>(
      '/shiip/public-api/v2/a5/gen-token',
      'POST',
      { order_codes: [orderCode] }
    );
  }

  mapGHNStatusToVendorStatus(ghnStatus: string): 'pending' | 'picked_up' | 'in_transit' | 'delivered' | 'returned' | 'cancelled' {
    const statusMap: Record<string, 'pending' | 'picked_up' | 'in_transit' | 'delivered' | 'returned' | 'cancelled'> = {
      'ready_to_pick': 'pending',
      'picking': 'picked_up',
      'money_collect_picking': 'picked_up',
      'picked': 'picked_up',
      'storing': 'in_transit',
      'transporting': 'in_transit',
      'sorting': 'in_transit',
      'delivering': 'in_transit',
      'delivery_fail': 'in_transit',
      'waiting_to_return': 'in_transit',
      'return': 'returned',
      'return_transporting': 'returned',
      'return_sorting': 'returned',
      'returning': 'returned',
      'return_fail': 'in_transit',
      'returned': 'returned',
      'exception': 'in_transit',
      'damage': 'in_transit',
      'lost': 'cancelled',
      'cancel': 'cancelled',
      'delivered': 'delivered'
    };

    return statusMap[ghnStatus] || 'in_transit';
  }
}

export const ghnClient = new GHNClient();
