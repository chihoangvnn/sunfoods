import { apiConfig } from '@/lib/apiConfig';

/**
 * Enhanced fetch with error handling and timeout
 */
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout = 20000): Promise<Response> {
  const controller = new AbortController();
  
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Request timeout after ${timeout}ms`));
    }, timeout);
  });

  const fetchPromise = fetch(url, {
    ...options,
    signal: controller.signal,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  try {
    const response = await Promise.race([fetchPromise, timeoutPromise]);
    return response;
  } catch (error) {
    controller.abort();
    
    if (error instanceof Error) {
      if (error.message.includes('timeout') || error.name === 'AbortError') {
        const timeoutError = new Error(`Request timeout after ${timeout}ms`);
        timeoutError.name = 'TimeoutError';
        throw timeoutError;
      }
    }
    throw error;
  }
}

export interface AffiliateOrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  commission?: number;
}

export interface AffiliateOrderData {
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerWard?: string;
  customerDistrict?: string;
  customerProvince?: string;
  items: AffiliateOrderItem[];
  affiliateNote?: string;
  shippingMethod?: 'ghn' | 'ghtk' | 'viettel';
  codAmount?: number;
}

export interface AffiliateOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: AffiliateOrderItem[];
  totalAmount: number;
  totalCommission: number;
  commissionRate: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  trackingCode?: string;
  carrier?: string;
  affiliateNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderResponse {
  success: boolean;
  order: AffiliateOrder;
  trackingCode?: string;
  estimatedCommission: number;
  message: string;
}

/**
 * Create affiliate order with automatic vendor assignment and GHN tracking
 */
export async function createAffiliateOrder(orderData: AffiliateOrderData): Promise<CreateOrderResponse> {
  try {
    const baseUrl = apiConfig.baseUrl;
    const url = `${baseUrl}/affiliate-portal/me/create-order`;
    
    console.log('Creating affiliate order:', orderData);
    
    const response = await fetchWithTimeout(url, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify(orderData),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error('Error creating affiliate order:', error);
    throw error;
  }
}

/**
 * Fetch affiliate orders
 */
export async function fetchAffiliateOrders(filters?: {
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  offset?: number;
}): Promise<AffiliateOrder[]> {
  try {
    const baseUrl = apiConfig.baseUrl;
    const queryParams = new URLSearchParams();
    
    if (filters?.status && filters.status !== 'all') {
      queryParams.append('status', filters.status);
    }
    if (filters?.dateFrom) {
      queryParams.append('dateFrom', filters.dateFrom);
    }
    if (filters?.dateTo) {
      queryParams.append('dateTo', filters.dateTo);
    }
    if (filters?.limit) {
      queryParams.append('limit', filters.limit.toString());
    }
    if (filters?.offset) {
      queryParams.append('offset', filters.offset.toString());
    }

    const url = `${baseUrl}/affiliate-portal/orders?${queryParams.toString()}`;
    console.log('Fetching affiliate orders from:', url);
    
    const response = await fetchWithTimeout(url, {
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error('Error fetching affiliate orders:', error);
    throw error;
  }
}

/**
 * Get single affiliate order by ID
 */
export async function fetchAffiliateOrder(orderId: string): Promise<AffiliateOrder> {
  try {
    const baseUrl = apiConfig.baseUrl;
    const url = `${baseUrl}/affiliate-portal/orders/${orderId}`;
    
    const response = await fetchWithTimeout(url, {
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error('Error fetching affiliate order:', error);
    throw error;
  }
}

/**
 * Calculate estimated commission for order
 */
export async function calculateCommission(items: AffiliateOrderItem[]): Promise<{
  totalAmount: number;
  estimatedCommission: number;
  commissionRate: number;
}> {
  try {
    const baseUrl = apiConfig.baseUrl;
    const url = `${baseUrl}/affiliate-portal/calculate-commission`;
    
    const response = await fetchWithTimeout(url, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({ items }),
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error('Error calculating commission:', error);
    throw error;
  }
}

/**
 * Track order shipment (uses vendor order service under the hood)
 */
export async function trackAffiliateOrderShipment(trackingCode: string): Promise<{
  trackingCode: string;
  status: string;
  statusDescription: string;
  currentLocation?: string;
  estimatedDelivery?: string;
  history: Array<{
    time: string;
    status: string;
    location: string;
    description: string;
  }>;
}> {
  try {
    const baseUrl = apiConfig.baseUrl;
    const url = `${baseUrl}/shipping/ghn/tracking/${trackingCode}`;
    
    const response = await fetchWithTimeout(url, {
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error('Error tracking shipment:', error);
    throw error;
  }
}
