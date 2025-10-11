import { ProductReview, ReviewSummary, ReviewsResponse, ReviewFilters, ReviewApiConfig } from '@/types/review';

class ReviewService {
  private config: ReviewApiConfig;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  constructor(config: ReviewApiConfig) {
    this.config = config;
  }

  /**
   * Get reviews for a product with caching
   */
  async getProductReviews(
    productId: string, 
    filters: ReviewFilters = {},
    page: number = 1,
    limit: number = 10
  ): Promise<ReviewsResponse> {
    const cacheKey = `${productId}_${JSON.stringify(filters)}_${page}_${limit}`;
    
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data as ReviewsResponse;
    }

    try {
      let response: ReviewsResponse;

      switch (this.config.provider) {
        case 'internal':
          response = await this.getInternalReviews(productId, filters, page, limit);
          break;
        case 'trustpilot':
          response = await this.getTrustpilotReviews(productId, filters, page, limit);
          break;
        case 'yotpo':
          response = await this.getYotpoReviews(productId, filters, page, limit);
          break;
        default:
          response = await this.getDemoReviews(productId, filters, page, limit);
      }

      // Cache the response
      this.cache.set(cacheKey, { data: response, timestamp: Date.now() });
      return response;

    } catch (error) {
      console.error('Error fetching reviews:', error);
      // Return demo data as fallback
      return this.getDemoReviews(productId, filters, page, limit);
    }
  }

  /**
   * Get review summary only (for faster loading)
   */
  async getReviewSummary(productId: string): Promise<ReviewSummary> {
    const cacheKey = `summary_${productId}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data as ReviewSummary;
    }

    try {
      const response = await this.getProductReviews(productId, {}, 1, 1);
      
      // Validate summary exists before caching (no need for productId check)
      if (response.summary && typeof response.summary.averageRating !== 'undefined') {
        // Add productId to summary if missing
        const summaryWithId = { ...response.summary, productId };
        this.cache.set(cacheKey, { data: summaryWithId, timestamp: Date.now() });
        return summaryWithId;
      } else {
        console.log('Summary missing or invalid, using demo data');
        const demoSummary = this.getDemoSummary(productId);
        this.cache.set(cacheKey, { data: demoSummary, timestamp: Date.now() });
        return demoSummary;
      }
    } catch (error) {
      console.error('Error fetching review summary:', error);
      const demoSummary = this.getDemoSummary(productId);
      // Cache demo summary too
      this.cache.set(cacheKey, { data: demoSummary, timestamp: Date.now() });
      return demoSummary;
    }
  }

  /**
   * Internal API implementation
   */
  private async getInternalReviews(
    productId: string, 
    filters: ReviewFilters, 
    page: number, 
    limit: number
  ): Promise<ReviewsResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters.rating && { rating: filters.rating.toString() },
      ...filters.verified && { verified: filters.verified.toString() },
      ...filters.hasImages && { hasImages: filters.hasImages.toString() },
      ...filters.sortBy && { sortBy: filters.sortBy }
    });

    const response = await fetch(`/api/products/${productId}/reviews?${params}`);
    if (!response.ok) throw new Error('Failed to fetch reviews');
    
    return response.json();
  }

  /**
   * Trustpilot API implementation
   */
  private async getTrustpilotReviews(
    productId: string, 
    filters: ReviewFilters, 
    page: number, 
    limit: number
  ): Promise<ReviewsResponse> {
    // Implementation for Trustpilot API
    // This would use their Product Reviews API
    throw new Error('Trustpilot API not implemented yet');
  }

  /**
   * Yotpo API implementation
   */
  private async getYotpoReviews(
    productId: string, 
    filters: ReviewFilters, 
    page: number, 
    limit: number
  ): Promise<ReviewsResponse> {
    // Implementation for Yotpo API
    throw new Error('Yotpo API not implemented yet');
  }

  /**
   * Demo/fallback reviews for development
   */
  private async getDemoReviews(
    productId: string, 
    filters: ReviewFilters, 
    page: number, 
    limit: number
  ): Promise<ReviewsResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const demoReviews: ProductReview[] = [
      {
        id: '1',
        productId,
        userId: 'user1',
        userName: 'Nguyễn Minh An',
        userAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b5c5?w=40&h=40&fit=crop&crop=face',
        rating: 5,
        title: 'Sản phẩm tuyệt vời!',
        comment: 'Mình đã sử dụng sản phẩm này được 2 tuần và thấy hiệu quả rất tốt. Chất lượng vượt mong đợi, giao hàng nhanh. Sẽ mua thêm lần sau!',
        createdAt: '2025-09-20T10:30:00Z',
        updatedAt: '2025-09-20T10:30:00Z',
        verified: true,
        helpful: 12,
        images: ['https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=150&h=150&fit=crop']
      },
      {
        id: '2',
        productId,
        userId: 'user2',
        userName: 'Trần Thị Bình',
        rating: 4,
        comment: 'Sản phẩm ổn, đóng gói cẩn thận. Mình thích mùi hương này, dùng rất thư giãn.',
        createdAt: '2025-09-18T15:20:00Z',
        updatedAt: '2025-09-18T15:20:00Z',
        verified: true,
        helpful: 8
      },
      {
        id: '3',
        productId,
        userId: 'user3',
        userName: 'Lê Văn Cường',
        rating: 5,
        title: 'Chất lượng cao, giá hợp lý',
        comment: 'Mình đã thử nhiều loại nhang nhưng loại này là tốt nhất. Mùi hương tự nhiên, không gây khó chịu.',
        createdAt: '2025-09-15T09:45:00Z',
        updatedAt: '2025-09-15T09:45:00Z',
        verified: false,
        helpful: 5
      },
      {
        id: '4',
        productId,
        userId: 'user4',
        userName: 'Phạm Thu Hà',
        rating: 3,
        comment: 'Sản phẩm tạm được, nhưng mùi hương không đậm đà như mong đợi.',
        createdAt: '2025-09-12T14:10:00Z',
        updatedAt: '2025-09-12T14:10:00Z',
        verified: true,
        helpful: 2
      }
    ];

    // Apply filters
    let filteredReviews = demoReviews;
    
    if (filters.rating) {
      filteredReviews = filteredReviews.filter(r => r.rating === filters.rating);
    }
    
    if (filters.verified !== undefined) {
      filteredReviews = filteredReviews.filter(r => r.verified === filters.verified);
    }
    
    if (filters.hasImages) {
      filteredReviews = filteredReviews.filter(r => r.images && r.images.length > 0);
    }

    // Apply sorting
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'newest':
          filteredReviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
        case 'oldest':
          filteredReviews.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
          break;
        case 'rating_high':
          filteredReviews.sort((a, b) => b.rating - a.rating);
          break;
        case 'rating_low':
          filteredReviews.sort((a, b) => a.rating - b.rating);
          break;
        case 'helpful':
          filteredReviews.sort((a, b) => b.helpful - a.helpful);
          break;
      }
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedReviews = filteredReviews.slice(startIndex, endIndex);

    const summary = this.getDemoSummary(productId);

    return {
      reviews: paginatedReviews,
      summary,
      pagination: {
        page,
        limit,
        total: filteredReviews.length,
        hasMore: endIndex < filteredReviews.length
      }
    };
  }

  private getDemoSummary(productId: string): ReviewSummary {
    return {
      productId,
      averageRating: 4.2,
      totalReviews: 47,
      ratingDistribution: {
        5: 23,
        4: 15,
        3: 6,
        2: 2,
        1: 1
      }
    };
  }

  /**
   * Clear cache (useful for testing)
   */
  clearCache(): void {
    this.cache.clear();
  }
}

// Default instance - adapted for Vite
export const reviewService = new ReviewService({
  provider: 'internal', // Default to internal for now
  baseUrl: '/api'
});

export default ReviewService;
