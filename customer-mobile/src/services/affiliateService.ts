import { apiConfig } from '@/lib/apiConfig';

const API_BASE_URL = apiConfig.baseUrl;

async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `API error: ${response.status}`);
  }

  return response;
}

export interface AffiliateDashboard {
  affiliate: {
    id: string;
    name: string;
    affiliateCode: string;
    commissionRate: number;
    status: string;
  };
  metrics: {
    totalEarnings: number;
    pendingEarnings: number;
    paidEarnings: number;
    totalReferrals: number;
    totalRevenue: number;
    conversionRate: number;
    revenueGrowth: number;
  };
  recentActivity: any[];
  quickStats: {
    ordersThisMonth: number;
    revenueThisMonth: number;
    averageOrderValue: number;
  };
}

export interface AffiliateStats {
  dailyStats: any[];
  topProducts: any[];
  trends: any;
  conversionMetrics: any;
}

export interface EarningsSummary {
  totalEarned: number;
  totalPaid: number;
  totalPending: number;
  commissionRate: number;
  totalReferrals: number;
}

export interface Earning {
  orderId: string;
  orderTotal: number;
  commissionAmount: number;
  commissionRate: number;
  processedAt: string;
  status: string;
}

export interface PaymentInfo {
  bankName: string;
  accountNumber: string;
  accountName: string;
  paymentMethod: string;
}

export interface AffiliateOrder {
  id: string;
  customerName: string;
  customerPhone: string;
  productName: string;
  quantity: number;
  total: number;
  commission: number;
  status: string;
  createdAt: string;
}

export interface AffiliateProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  stockBadge: string;
  stockStatus: string;
  imageUrl: string;
  categoryName: string;
  commission: number;
  affiliateCost: number;
  commissionPercentage: number;
}

export interface ProductRequest {
  productName: string;
  productDescription?: string;
  productLink?: string;
  suggestedPrice?: string;
  categoryId?: string;
  requestReason?: string;
}

export interface ProductRequestStatus {
  id: string;
  productName: string;
  status: string;
  statusText: string;
  suggestedPrice?: number;
  requestReason?: string;
  adminNotes?: string;
  approvedProductId?: string;
  approvedCommissionRate?: number;
  createdAt: string;
  reviewedAt?: string;
}

export interface QuickOrderData {
  customerPhone: string;
  customerName: string;
  customerAddress: string;
  productId: string;
  quantity: number;
}

export interface AffiliateLink {
  productId: string;
  productName: string;
  affiliateUrl: string;
  clicks: number;
  conversions: number;
}

export interface TierInfo {
  currentTier: string;
  commissionRate: number;
  totalOrders: number;
  nextTierOrders?: number;
}

export const affiliateService = {
  async getDashboard(): Promise<AffiliateDashboard> {
    const response = await fetchWithAuth(`${API_BASE_URL}/affiliate-portal/dashboard`);
    const result = await response.json();
    return result.data;
  },

  async getStats(period: number = 30): Promise<AffiliateStats> {
    const response = await fetchWithAuth(`${API_BASE_URL}/affiliate-portal/stats?period=${period}`);
    const result = await response.json();
    return result.data;
  },

  async getEarnings(params: { limit?: number; status?: string } = {}): Promise<{
    summary: EarningsSummary;
    earnings: Earning[];
  }> {
    const queryParams = new URLSearchParams();
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.status) queryParams.append('status', params.status);

    const response = await fetchWithAuth(
      `${API_BASE_URL}/affiliate-portal/earnings?${queryParams.toString()}`
    );
    const result = await response.json();
    return result.data;
  },

  async getPaymentInfo(): Promise<{
    paymentInfo: PaymentInfo;
    paymentHistory: {
      totalPaid: number;
      lastPaymentAt: string;
      lastPaymentAmount: number;
    };
    availablePaymentMethods: Array<{ value: string; label: string }>;
  }> {
    const response = await fetchWithAuth(`${API_BASE_URL}/affiliate-portal/payment-info`);
    const result = await response.json();
    return result.data;
  },

  async updatePaymentInfo(paymentInfo: Partial<PaymentInfo>): Promise<void> {
    await fetchWithAuth(`${API_BASE_URL}/affiliate-portal/payment-info`, {
      method: 'PUT',
      body: JSON.stringify(paymentInfo),
    });
  },

  async getOrders(params: {
    status?: string;
    limit?: number;
    offset?: number;
    startDate?: string;
    endDate?: string;
    search?: string;
  } = {}): Promise<{ orders: AffiliateOrder[]; total: number }> {
    const queryParams = new URLSearchParams();
    if (params.status) queryParams.append('status', params.status);
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.offset) queryParams.append('offset', params.offset.toString());
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    if (params.search) queryParams.append('search', params.search);

    const response = await fetchWithAuth(
      `${API_BASE_URL}/affiliate-portal/orders?${queryParams.toString()}`
    );
    const result = await response.json();
    return result.data;
  },

  async createQuickOrder(orderData: QuickOrderData): Promise<{
    orderId: string;
    commission: number;
    total: number;
    order: any;
  }> {
    const response = await fetchWithAuth(`${API_BASE_URL}/affiliate-portal/quick-order`, {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
    const result = await response.json();
    return result.data;
  },

  async getProducts(params: {
    search?: string;
    categoryId?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<{
    products: AffiliateProduct[];
    pagination: { total: number; limit: number };
    tierInfo: TierInfo;
  }> {
    const queryParams = new URLSearchParams();
    if (params.search) queryParams.append('search', params.search);
    if (params.categoryId) queryParams.append('categoryId', params.categoryId);
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.offset) queryParams.append('offset', params.offset.toString());

    const response = await fetchWithAuth(
      `${API_BASE_URL}/affiliate-portal/products?${queryParams.toString()}`
    );
    const result = await response.json();
    return result.data;
  },

  async requestProduct(request: ProductRequest): Promise<{
    requestId: string;
    productName: string;
    status: string;
  }> {
    const response = await fetchWithAuth(`${API_BASE_URL}/affiliate-portal/products/request`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
    const result = await response.json();
    return result.data;
  },

  async getProductRequests(params: { status?: string } = {}): Promise<{
    requests: ProductRequestStatus[];
  }> {
    const queryParams = new URLSearchParams();
    if (params.status) queryParams.append('status', params.status);

    const response = await fetchWithAuth(
      `${API_BASE_URL}/affiliate-portal/products/requests?${queryParams.toString()}`
    );
    const result = await response.json();
    return result.data;
  },

  async getAffiliateLinks(productId?: string): Promise<{ links: AffiliateLink[] }> {
    const queryParams = new URLSearchParams();
    if (productId) queryParams.append('productId', productId);

    const response = await fetchWithAuth(
      `${API_BASE_URL}/affiliate-portal/links?${queryParams.toString()}`
    );
    const result = await response.json();
    return result.data;
  },

  async updateProfile(profileData: any): Promise<void> {
    await fetchWithAuth(`${API_BASE_URL}/affiliate-portal/profile`, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },
};
