export interface ReviewMetrics {
  rating: number;
  totalReviews: number;
  positivePercent?: number;
}

export interface PricingData {
  price: number;
  originalPrice?: number;
  createdAt?: string | Date;
}

export interface MarketingBadges {
  topRating?: string;        // Hiển thị trên tên sản phẩm
  pricingBadges: string[];   // Hiển thị dưới giá
  reviewBadges: string[];    // Hiển thị cuối cùng
}

/**
 * Calculate marketing badges based on product reviews and pricing data
 */
export function calculateMarketingBadges(
  reviewMetrics?: ReviewMetrics,
  pricingData?: PricingData
): MarketingBadges {
  const badges: MarketingBadges = {
    pricingBadges: [],
    reviewBadges: []
  };

  // === TOP RATING BADGE (hiển thị trên tên) ===
  if (reviewMetrics && reviewMetrics.rating >= 4.5) {
    badges.topRating = 'Đánh giá cao';
  }

  // === PRICING BADGES (dưới giá) ===
  if (pricingData) {
    // Tính discount percent
    const discountPercent = pricingData.originalPrice
      ? Math.round(((pricingData.originalPrice - pricingData.price) / pricingData.originalPrice) * 100)
      : 0;

    // Giảm giá sốc - nếu discount > 20%
    if (discountPercent > 20) {
      badges.pricingBadges.push('Giảm giá sốc');
    }

    // Giá tốt - nếu giá < 100k hoặc discount 10-20%
    if (pricingData.price < 100000 || (discountPercent >= 10 && discountPercent <= 20)) {
      badges.pricingBadges.push('Giá tốt');
    }

    // Mới - nếu sản phẩm mới < 30 ngày
    if (pricingData.createdAt) {
      const createdDate = new Date(pricingData.createdAt);
      const daysSinceCreated = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysSinceCreated <= 30) {
        badges.pricingBadges.push('Mới');
      }
    }
  }

  // === REVIEW BADGES (cuối cùng) ===
  if (reviewMetrics) {
    // Đánh giá cao - nếu rating >= 4.5 (cũng hiển thị ở row này nữa)
    if (reviewMetrics.rating >= 4.5) {
      badges.reviewBadges.push('Đánh giá cao');
    }

    // Bán chạy - nếu totalReviews > 100
    if (reviewMetrics.totalReviews > 100) {
      badges.reviewBadges.push('Bán chạy');
    }

    // Được yêu thích - nếu positivePercent > 80%
    const positivePercent = reviewMetrics.positivePercent ?? 
      (reviewMetrics.rating >= 4 ? 85 : reviewMetrics.rating >= 3 ? 70 : 50);
    
    if (positivePercent > 80) {
      badges.reviewBadges.push('Được yêu thích');
    }
  }

  return badges;
}

/**
 * Calculate positive review percentage from rating distribution
 */
export function calculatePositivePercent(ratingDistribution: {
  5: number;
  4: number;
  3: number;
  2: number;
  1: number;
}): number {
  const total = Object.values(ratingDistribution).reduce((sum, count) => sum + count, 0);
  if (total === 0) return 0;
  
  // Consider 4 and 5 stars as positive
  const positiveCount = ratingDistribution[5] + ratingDistribution[4];
  return Math.round((positiveCount / total) * 100);
}
