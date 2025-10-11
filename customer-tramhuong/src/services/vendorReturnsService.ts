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

export interface VendorReturnRequest {
  id: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  productName: string;
  quantity: number;
  reason: string;
  reasonDetails?: string;
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  images?: string[];
  refundAmount: number;
  shippingProvider?: 'ghn' | 'ghtk' | 'viettel';
  trackingNumber?: string;
  vendorNote?: string;
  rejectionReason?: string;
}

export interface ApproveReturnData {
  returnId: string;
  shippingProvider: 'ghn' | 'ghtk' | 'viettel';
  shippingNote?: string;
  shippingFeePayer: 'vendor' | 'customer';
}

export interface RejectReturnData {
  returnId: string;
  reason: string;
  note?: string;
}

export interface ReturnStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  completed: number;
  totalRefundAmount: number;
}

/**
 * Fetch all vendor return requests
 */
export async function fetchVendorReturns(status?: string): Promise<VendorReturnRequest[]> {
  try {
    const baseUrl = apiConfig.baseUrl;
    const queryParams = new URLSearchParams();
    
    if (status && status !== 'all') {
      queryParams.append('status', status);
    }

    const url = `${baseUrl}/vendor/returns?${queryParams.toString()}`;
    console.log('Fetching vendor returns from:', url);
    
    const response = await fetchWithTimeout(url, {
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error('Error fetching vendor returns:', error);
    throw error;
  }
}

/**
 * Get single return request by ID
 */
export async function fetchVendorReturn(returnId: string): Promise<VendorReturnRequest> {
  try {
    const baseUrl = apiConfig.baseUrl;
    const url = `${baseUrl}/vendor/returns/${returnId}`;
    
    const response = await fetchWithTimeout(url, {
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error('Error fetching return request:', error);
    throw error;
  }
}

/**
 * Approve return request and generate shipping label
 */
export async function approveReturn(data: ApproveReturnData): Promise<{
  success: boolean;
  trackingNumber: string;
  labelUrl: string;
  message: string;
}> {
  try {
    const baseUrl = apiConfig.baseUrl;
    const url = `${baseUrl}/vendor/returns/${data.returnId}/approve`;
    
    console.log('Approving return request:', data);
    
    const response = await fetchWithTimeout(url, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({
        shippingProvider: data.shippingProvider,
        shippingNote: data.shippingNote,
        shippingFeePayer: data.shippingFeePayer,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return result;

  } catch (error) {
    console.error('Error approving return:', error);
    throw error;
  }
}

/**
 * Reject return request
 */
export async function rejectReturn(data: RejectReturnData): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const baseUrl = apiConfig.baseUrl;
    const url = `${baseUrl}/vendor/returns/${data.returnId}/reject`;
    
    console.log('Rejecting return request:', data);
    
    const response = await fetchWithTimeout(url, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({
        reason: data.reason,
        note: data.note,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return result;

  } catch (error) {
    console.error('Error rejecting return:', error);
    throw error;
  }
}

/**
 * Get return statistics
 */
export async function fetchReturnStats(): Promise<ReturnStats> {
  try {
    const baseUrl = apiConfig.baseUrl;
    const url = `${baseUrl}/vendor/returns/stats`;
    
    const response = await fetchWithTimeout(url, {
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error('Error fetching return stats:', error);
    throw error;
  }
}

/**
 * Create return request (for vendor to initiate)
 */
export async function createReturnRequest(returnData: {
  orderId: string;
  reason: string;
  reasonDetails?: string;
  images?: string[];
}): Promise<VendorReturnRequest> {
  try {
    const baseUrl = apiConfig.baseUrl;
    const url = `${baseUrl}/vendor/returns`;
    
    const response = await fetchWithTimeout(url, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify(returnData),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error('Error creating return request:', error);
    throw error;
  }
}
