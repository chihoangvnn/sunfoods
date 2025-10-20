// Fallback type for environments without DOM lib
type HeadersInit = Record<string, string>;
export interface GHTKConfig {
  token: string;
  clientSource?: string;
  baseUrl: string;
}

export interface GHTKOrderRequest {
  products: Array<{
    name: string;
    weight: number;
    quantity: number;
    price?: number;
  }>;
  order: {
    id: string;
    pick_name: string;
    pick_address: string;
    pick_province: string;
    pick_district: string;
    pick_ward?: string;
    pick_tel: string;
    tel: string;
    name: string;
    address: string;
    province: string;
    district: string;
    ward?: string;
    hamlet?: string;
    is_freeship?: string;
    pick_date?: string;
    pick_money?: number;
    note?: string;
    value?: number;
    transport?: string;
    pick_option?: string;
    deliver_option?: string;
    pick_session?: number;
    tags?: number[];
  };
}

export interface GHTKOrderResponse {
  success: boolean;
  message: string;
  order?: {
    partner_id: string;
    label: string;
    area: string;
    fee: number;
    insurance_fee: number;
    estimated_pick_time: string;
    estimated_deliver_time: string;
    status_id: number;
  };
  error?: string;
}

export interface GHTKTrackingResponse {
  success: boolean;
  message: string;
  order?: {
    label_id: string;
    partner_id: string;
    status: string;
    status_text: string;
    created: string;
    modified: string;
    pick_date?: string;
    deliver_date?: string;
    customer_fullname: string;
    customer_tel: string;
    address: string;
    storage_day: number;
    ship_money: string;
    insurance: string;
    value: string;
    weight: string;
    pick_money: string;
  };
}

export interface GHTKCancelResponse {
  success: boolean;
  message: string;
  error?: string;
}

export interface GHTKFeeResponse {
  success: boolean;
  message: string;
  fee?: {
    name: string;
    fee: number;
    insurance_fee: number;
    include_vat: string;
    cost_id: string;
    delivery: boolean;
    ship_fee_only?: number;
  };
  error?: string;
}

class GHTKApi {
  private config: GHTKConfig;

  constructor(config: GHTKConfig) {
    this.config = {
      ...config,
      baseUrl: config.baseUrl || 'https://services.giaohangtietkiem.vn'
    };
  }

  private getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'Token': this.config.token,
      'X-Client-Source': this.config.clientSource || '',
    };
  }

  async testConnection(): Promise<{ success: boolean }> {
    try {
      const response = await fetch(`${this.config.baseUrl}/services/authenticated`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      const result: any = await response.json();
      
      if (response.ok && result.success) {
        return { success: true };
      } else {
        console.error('GHTK Test Connection Error:', result);
        return { success: false };
      }
    } catch (error) {
      console.error('GHTK test connection error:', error);
      return { success: false };
    }
  }

  async createOrder(orderData: GHTKOrderRequest): Promise<GHTKOrderResponse> {
    try {
      const response = await fetch(`${this.config.baseUrl}/services/shipment/order`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(orderData),
      });

      const result: any = await response.json();
      
      if (!result.success) {
        console.error('GHTK Create Order Error:', result);
        throw new Error(`GHTK Create Order failed: ${result.message}`);
      }

      return result;
    } catch (error) {
      console.error('GHTK create order error:', error);
      throw error;
    }
  }

  async getOrderStatus(labelId: string): Promise<GHTKTrackingResponse> {
    try {
      const response = await fetch(`${this.config.baseUrl}/services/shipment/v2/${labelId}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      const result: any = await response.json();
      
      if (!result.success) {
        console.error('GHTK Get Order Status Error:', result);
        throw new Error(`GHTK Get Order Status failed: ${result.message}`);
      }

      return result;
    } catch (error) {
      console.error('GHTK get order status error:', error);
      throw error;
    }
  }

  async cancelOrder(labelId: string): Promise<GHTKCancelResponse> {
    try {
      const response = await fetch(`${this.config.baseUrl}/services/shipment/cancel/${labelId}`, {
        method: 'POST',
        headers: this.getHeaders(),
      });

      const result: any = await response.json();
      
      if (!result.success) {
        console.error('GHTK Cancel Order Error:', result);
        throw new Error(`GHTK Cancel Order failed: ${result.message}`);
      }

      return result;
    } catch (error) {
      console.error('GHTK cancel order error:', error);
      throw error;
    }
  }

  async calculateShippingFee(params: {
    pick_province: string;
    pick_district: string;
    pick_address?: string;
    province: string;
    district: string;
    address?: string;
    weight: number;
    value?: number;
    transport?: string;
    deliver_option?: string;
    tags?: number[];
  }): Promise<GHTKFeeResponse> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('pick_province', params.pick_province);
      queryParams.append('pick_district', params.pick_district);
      if (params.pick_address) queryParams.append('pick_address', params.pick_address);
      queryParams.append('province', params.province);
      queryParams.append('district', params.district);
      if (params.address) queryParams.append('address', params.address);
      queryParams.append('weight', params.weight.toString());
      if (params.value) queryParams.append('value', params.value.toString());
      if (params.transport) queryParams.append('transport', params.transport);
      if (params.deliver_option) queryParams.append('deliver_option', params.deliver_option);
      if (params.tags && params.tags.length > 0) {
        queryParams.append('tags', JSON.stringify(params.tags));
      }

      const response = await fetch(`${this.config.baseUrl}/services/shipment/fee?${queryParams.toString()}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      const result: any = await response.json();
      
      if (!result.success) {
        console.error('GHTK Calculate Fee Error:', result);
        throw new Error(`GHTK Calculate Fee failed: ${result.message}`);
      }

      return result;
    } catch (error) {
      console.error('GHTK calculate shipping fee error:', error);
      throw error;
    }
  }
}

export default GHTKApi;
