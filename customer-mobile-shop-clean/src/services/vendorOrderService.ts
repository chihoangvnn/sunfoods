import { apiConfig } from '@/lib/apiConfig';
import type { VendorOrder } from '@/types/vendor';

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

export type { VendorOrder } from '@/types/vendor';

export interface OrderFilters {
  search?: string;
  status?: string;
  carrier?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  offset?: number;
}

export interface GHNShipmentData {
  orderId: string;
  toName: string;
  toPhone: string;
  toAddress: string;
  toWard?: string;
  toDistrict?: string;
  toProvince?: string;
  codAmount?: number;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  insuranceValue?: number;
  note?: string;
}

export interface GHNShipmentResponse {
  success: boolean;
  trackingCode: string;
  orderId: string;
  expectedDeliveryTime?: string;
  shippingFee: number;
}

export interface ShippingLabel {
  trackingCode: string;
  labelUrl: string;
  format: 'pdf' | 'png';
}

export interface TrackingInfo {
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
}

/**
 * Fetch vendor orders with filters
 */
export async function fetchVendorOrders(filters: OrderFilters = {}): Promise<VendorOrder[]> {
  try {
    const baseUrl = apiConfig.baseUrl;
    const queryParams = new URLSearchParams();
    
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.status && filters.status !== 'all') queryParams.append('status', filters.status);
    if (filters.carrier && filters.carrier !== 'all') queryParams.append('carrier', filters.carrier);
    if (filters.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) queryParams.append('dateTo', filters.dateTo);
    if (filters.limit) queryParams.append('limit', filters.limit.toString());
    if (filters.offset) queryParams.append('offset', filters.offset.toString());

    const url = `${baseUrl}/vendor/orders?${queryParams.toString()}`;
    console.log('Fetching vendor orders from:', url);
    
    const response = await fetchWithTimeout(url, {
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error('Error fetching vendor orders:', error);
    throw error;
  }
}

/**
 * Get single vendor order by ID
 */
export async function fetchVendorOrder(orderId: string): Promise<VendorOrder> {
  try {
    const baseUrl = apiConfig.baseUrl;
    const url = `${baseUrl}/vendor/orders/${orderId}`;
    
    const response = await fetchWithTimeout(url, {
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error('Error fetching vendor order:', error);
    throw error;
  }
}

/**
 * Create GHN shipment for order
 */
export async function createGHNShipment(shipmentData: GHNShipmentData): Promise<GHNShipmentResponse> {
  try {
    const baseUrl = apiConfig.baseUrl;
    const url = `${baseUrl}/shipping/ghn/create-shipment`;
    
    console.log('Creating GHN shipment:', shipmentData);
    
    const response = await fetchWithTimeout(url, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify(shipmentData),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error('Error creating GHN shipment:', error);
    throw error;
  }
}

/**
 * Generate shipping label for tracking code
 */
export async function generateShippingLabel(trackingCode: string, format: 'pdf' | 'png' = 'pdf'): Promise<ShippingLabel> {
  try {
    const baseUrl = apiConfig.baseUrl;
    const url = `${baseUrl}/shipping/ghn/label/${trackingCode}?format=${format}`;
    
    const response = await fetchWithTimeout(url, {
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error('Error generating shipping label:', error);
    throw error;
  }
}

/**
 * Track GHN shipment
 */
export async function trackShipment(trackingCode: string): Promise<TrackingInfo> {
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

/**
 * Update order status
 */
export async function updateOrderStatus(orderId: string, status: string): Promise<void> {
  try {
    const baseUrl = apiConfig.baseUrl;
    const url = `${baseUrl}/vendor/orders/${orderId}/status`;
    
    const response = await fetchWithTimeout(url, {
      method: 'PUT',
      credentials: 'include',
      body: JSON.stringify({ status }),
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
}
