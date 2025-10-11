export interface ProductReview {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number; // 1-5
  title?: string;
  comment: string;
  createdAt: string;
  updatedAt: string;
  verified: boolean; // Verified purchase
  helpful: number; // Helpful votes
  images?: string[]; // Review images
}

export interface ReviewSummary {
  productId: string;
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export interface ReviewFilters {
  rating?: number;
  verified?: boolean;
  hasImages?: boolean;
  sortBy?: 'newest' | 'oldest' | 'rating_high' | 'rating_low' | 'helpful';
}

export interface ReviewsResponse {
  reviews: ProductReview[];
  summary: ReviewSummary;
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

export interface ReviewApiConfig {
  provider: 'trustpilot' | 'yotpo' | 'webz' | 'internal';
  apiKey?: string;
  baseUrl?: string;
  rateLimit?: number; // requests per second
}
