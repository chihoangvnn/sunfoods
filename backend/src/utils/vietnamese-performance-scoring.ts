/**
 * 🇻🇳 VIETNAMESE PERFORMANCE SCORING SYSTEM
 * Multi-dimensional seller performance scoring algorithms
 * Optimized for Vietnamese market priorities and cultural considerations
 */

export interface PerformanceData {
  sellerId: string;
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  returnedOrders: number;
  avgDeliveryDays: number;
  avgResponseTimeHours: number;
  totalReviews: number;
  reviewRatings: number[];
  customerComplaints: number;
  repeatCustomers: number;
  categoryPerformance: {
    [categoryId: string]: {
      orders: number;
      avgRating: number;
      avgDeliveryDays: number;
      returnRate: number;
    };
  };
  tierPerformance: {
    vip: { orders: number; satisfaction: number; responseTime: number; };
    standard: { orders: number; satisfaction: number; responseTime: number; };
    new: { orders: number; satisfaction: number; responseTime: number; };
  };
  seasonalData?: {
    season: 'tet' | 'mid_autumn' | 'back_to_school' | 'exam_period' | 'regular';
    performanceImpact: number;
  };
}

export interface VietnameseMarketWeights {
  deliverySpeed: number;        // 25% - Very important in Vietnamese e-commerce
  bookCondition: number;        // 20% - Critical for book quality
  customerService: number;      // 20% - High importance in Vietnamese culture
  pricing: number;             // 15% - Price sensitivity in Vietnamese market
  communication: number;       // 10% - Response time and clarity
  courtesy: number;            // 5% - Vietnamese politeness expectations
  culturalSensitivity: number; // 3% - Understanding Vietnamese customs
  packaging: number;           // 2% - Important for gift culture
}

export interface ScoringResult {
  overallRating: number;
  dimensionalRatings: {
    deliverySpeedRating: number;
    bookConditionRating: number;
    customerServiceRating: number;
    pricingRating: number;
    communicationRating: number;
    courtesyRating: number;
    culturalSensitivityRating: number;
  };
  performanceMetrics: {
    avgDeliveryDays: number;
    avgResponseTimeHours: number;
    orderFulfillmentRate: number;
    returnRate: number;
    customerRetentionRate: number;
  };
  categoryPerformance: { [categoryId: string]: number };
  tierPerformance: {
    vip: number;
    standard: number;
    new: number;
  };
  qualityMetrics: {
    authenticityScore: number;
    qualityConsistency: number;
    preferenceMatchScore: number;
  };
  trendAnalysis: {
    performanceTrend: 'improving' | 'stable' | 'declining';
    confidenceLevel: number;
    keyFactors: string[];
  };
}

// Vietnamese market weights (totaling 100%)
export const VIETNAMESE_MARKET_WEIGHTS: VietnameseMarketWeights = {
  deliverySpeed: 0.25,        // 25% - Fast delivery is crucial
  bookCondition: 0.20,        // 20% - Book quality is very important
  customerService: 0.20,      // 20% - Service quality highly valued
  pricing: 0.15,              // 15% - Price competitiveness
  communication: 0.10,        // 10% - Clear communication
  courtesy: 0.05,             // 5% - Politeness and respect
  culturalSensitivity: 0.03,  // 3% - Cultural awareness
  packaging: 0.02             // 2% - Presentation and care
};

// Category-specific adjustment factors
export const CATEGORY_ADJUSTMENTS = {
  textbook: {
    deliverySpeed: 1.2,      // Higher weight for textbooks (urgency)
    bookCondition: 1.3,      // Critical for study materials
    pricing: 1.1,            // Students are price-sensitive
    cultural: 0.9            // Less cultural sensitivity needed
  },
  literature: {
    deliverySpeed: 0.9,      // Less urgent than textbooks
    bookCondition: 1.1,      // Important but not critical
    pricing: 1.0,            // Standard pricing importance
    cultural: 1.2            // Higher cultural sensitivity
  },
  children: {
    deliverySpeed: 1.0,      // Standard delivery expectations
    bookCondition: 1.4,      // Very important for children's books
    pricing: 0.9,            // Parents willing to pay for quality
    cultural: 1.3            // High cultural sensitivity for family
  },
  business: {
    deliverySpeed: 1.1,      // Professional urgency
    bookCondition: 1.0,      // Standard condition expectations
    pricing: 0.8,            // Professionals less price-sensitive
    cultural: 0.8            // Lower cultural sensitivity needed
  },
  health: {
    deliverySpeed: 1.0,      // Standard delivery
    bookCondition: 1.2,      // Important for accurate information
    pricing: 0.9,            // Health is priority over price
    cultural: 1.1            // Some cultural sensitivity for health
  }
};

// Vietnamese seasonal adjustments
export const SEASONAL_ADJUSTMENTS = {
  tet: {
    deliveryExpectation: 0.7,    // Lower delivery expectations during Tet
    serviceExpectation: 0.8,     // More understanding during holiday
    giftWrappingImportance: 1.5, // Much higher importance for gifts
    courtesyImportance: 1.3      // Higher politeness expectations
  },
  mid_autumn: {
    deliveryExpectation: 0.9,    // Slightly relaxed
    serviceExpectation: 0.95,    
    giftWrappingImportance: 1.2, // Important for festival gifts
    courtesyImportance: 1.1      
  },
  back_to_school: {
    deliveryExpectation: 1.3,    // Higher urgency for school books
    serviceExpectation: 1.2,     // Higher service expectations
    giftWrappingImportance: 0.8, // Less important
    courtesyImportance: 1.0      
  },
  exam_period: {
    deliveryExpectation: 1.4,    // Critical delivery timing
    serviceExpectation: 1.3,     // High service expectations
    giftWrappingImportance: 0.7, // Not important during exams
    courtesyImportance: 1.0      
  },
  regular: {
    deliveryExpectation: 1.0,    // Standard expectations
    serviceExpectation: 1.0,     
    giftWrappingImportance: 1.0, 
    courtesyImportance: 1.0      
  }
};

// Regional adjustment factors
export const REGIONAL_ADJUSTMENTS = {
  "Miền Bắc": {
    formalityExpectation: 1.2,   // Higher formality expectations
    qualityFocus: 1.1,           // Higher quality focus
    priceToleranceOffset: 0.05,  // Slightly higher price tolerance
    courtesyMultiplier: 1.3      // Much higher courtesy expectations
  },
  "Miền Trung": {
    formalityExpectation: 1.3,   // Highest formality expectations
    qualityFocus: 1.0,           // Standard quality focus
    priceToleranceOffset: 0.0,   // Standard price tolerance
    courtesyMultiplier: 1.4      // Highest courtesy expectations
  },
  "Miền Nam": {
    formalityExpectation: 0.9,   // Lower formality expectations
    qualityFocus: 1.0,           // Standard quality focus
    priceToleranceOffset: -0.05, // Slightly lower price tolerance
    courtesyMultiplier: 1.0      // Standard courtesy expectations
  }
};

/**
 * Calculate delivery speed rating (1-5 scale)
 * Vietnamese market: 1-2 days = excellent, 3-4 days = good, 5-7 days = average, 8+ days = poor
 */
export function calculateDeliverySpeedRating(avgDeliveryDays: number, category?: string): number {
  let baseRating: number;
  
  if (avgDeliveryDays <= 2) {
    baseRating = 5.0; // Excellent
  } else if (avgDeliveryDays <= 4) {
    baseRating = 4.0; // Good
  } else if (avgDeliveryDays <= 7) {
    baseRating = 3.0; // Average
  } else if (avgDeliveryDays <= 10) {
    baseRating = 2.0; // Below average
  } else {
    baseRating = 1.0; // Poor
  }
  
  // Apply category-specific adjustments
  if (category && (CATEGORY_ADJUSTMENTS as any)[category]) {
    const adjustment = (CATEGORY_ADJUSTMENTS as any)[category].deliverySpeed;
    if (adjustment > 1.0) {
      // More strict for categories like textbooks
      baseRating = Math.max(1.0, baseRating - (adjustment - 1.0) * 0.5);
    }
  }
  
  return Math.max(1.0, Math.min(5.0, baseRating));
}

/**
 * Calculate book condition rating based on return rates and customer feedback
 */
export function calculateBookConditionRating(
  returnRate: number, 
  conditionComplaints: number, 
  totalOrders: number,
  category?: string
): number {
  // Base calculation: lower return rate = higher rating
  let baseRating = 5.0 - (returnRate * 20); // 5% return rate = 4.0 rating
  
  // Adjust for condition-specific complaints
  const complaintRatio = conditionComplaints / Math.max(1, totalOrders);
  baseRating -= complaintRatio * 10; // 10% complaints reduces rating by 1.0
  
  // Apply category-specific adjustments
  if (category && (CATEGORY_ADJUSTMENTS as any)[category]) {
    const adjustment = (CATEGORY_ADJUSTMENTS as any)[category].bookCondition;
    if (adjustment > 1.0) {
      // More strict for categories like children's books
      baseRating = Math.max(1.0, baseRating - (adjustment - 1.0) * 0.3);
    }
  }
  
  return Math.max(1.0, Math.min(5.0, baseRating));
}

/**
 * Calculate customer service rating based on response time and satisfaction
 */
export function calculateCustomerServiceRating(
  avgResponseTimeHours: number,
  customerSatisfaction: number,
  complaintResolutionRate: number
): number {
  // Response time component (40% weight)
  let responseRating: number;
  if (avgResponseTimeHours <= 2) {
    responseRating = 5.0; // Excellent response
  } else if (avgResponseTimeHours <= 6) {
    responseRating = 4.0; // Good response
  } else if (avgResponseTimeHours <= 24) {
    responseRating = 3.0; // Average response
  } else if (avgResponseTimeHours <= 48) {
    responseRating = 2.0; // Slow response
  } else {
    responseRating = 1.0; // Very slow response
  }
  
  // Satisfaction component (40% weight)
  const satisfactionRating = customerSatisfaction; // Already 1-5 scale
  
  // Complaint resolution component (20% weight)
  const resolutionRating = complaintResolutionRate * 5; // Convert 0-1 to 1-5
  
  // Weighted average
  const serviceRating = (responseRating * 0.4) + (satisfactionRating * 0.4) + (resolutionRating * 0.2);
  
  return Math.max(1.0, Math.min(5.0, serviceRating));
}

/**
 * Calculate pricing rating based on competitiveness and customer price satisfaction
 */
export function calculatePricingRating(
  avgPrice: number,
  marketAvgPrice: number,
  priceComplaintRate: number,
  category?: string
): number {
  // Price competitiveness (70% weight)
  const priceRatio = avgPrice / marketAvgPrice;
  let competitivenessRating: number;
  
  if (priceRatio <= 0.9) {
    competitivenessRating = 5.0; // Excellent pricing
  } else if (priceRatio <= 1.0) {
    competitivenessRating = 4.0; // Good pricing
  } else if (priceRatio <= 1.1) {
    competitivenessRating = 3.0; // Average pricing
  } else if (priceRatio <= 1.2) {
    competitivenessRating = 2.0; // Expensive
  } else {
    competitivenessRating = 1.0; // Very expensive
  }
  
  // Price complaint rate (30% weight)
  const complaintRating = 5.0 - (priceComplaintRate * 20); // 5% complaints = 4.0
  
  // Weighted average
  let pricingRating = (competitivenessRating * 0.7) + (complaintRating * 0.3);
  
  // Apply category-specific adjustments
  if (category && (CATEGORY_ADJUSTMENTS as any)[category]) {
    const adjustment = (CATEGORY_ADJUSTMENTS as any)[category].pricing;
    if (adjustment > 1.0) {
      // More strict for price-sensitive categories like textbooks
      pricingRating = Math.max(1.0, pricingRating - (adjustment - 1.0) * 0.2);
    }
  }
  
  return Math.max(1.0, Math.min(5.0, pricingRating));
}

/**
 * Calculate communication rating based on clarity, responsiveness, and language appropriateness
 */
export function calculateCommunicationRating(
  avgResponseTimeHours: number,
  communicationClarity: number, // 1-5 from customer feedback
  languageAppropriatenesss: number, // 1-5 from cultural assessment
  region?: string
): number {
  // Response time component (40% weight)
  let timelinessRating: number;
  if (avgResponseTimeHours <= 1) {
    timelinessRating = 5.0;
  } else if (avgResponseTimeHours <= 4) {
    timelinessRating = 4.0;
  } else if (avgResponseTimeHours <= 12) {
    timelinessRating = 3.0;
  } else if (avgResponseTimeHours <= 24) {
    timelinessRating = 2.0;
  } else {
    timelinessRating = 1.0;
  }
  
  // Weighted average
  let communicationRating = (timelinessRating * 0.4) + (communicationClarity * 0.4) + (languageAppropriatenesss * 0.2);
  
  // Apply regional adjustments
  if (region && (REGIONAL_ADJUSTMENTS as any)[region]) {
    const multiplier = (REGIONAL_ADJUSTMENTS as any)[region].formalityExpectation;
    if (multiplier > 1.0) {
      // More strict expectations in northern and central Vietnam
      communicationRating = Math.max(1.0, communicationRating - (multiplier - 1.0) * 0.2);
    }
  }
  
  return Math.max(1.0, Math.min(5.0, communicationRating));
}

/**
 * Calculate courtesy rating based on Vietnamese politeness standards
 */
export function calculateCourtesyRating(
  courtesyScore: number, // From review sentiment analysis
  formalLanguageUsage: number, // 0-1 scale
  respectfulTreatment: number, // 1-5 from customer feedback
  region?: string
): number {
  // Base courtesy rating
  let courtesyRating = (courtesyScore * 0.4) + (formalLanguageUsage * 5 * 0.3) + (respectfulTreatment * 0.3);
  
  // Apply regional adjustments for courtesy expectations
  if (region && (REGIONAL_ADJUSTMENTS as any)[region]) {
    const multiplier = (REGIONAL_ADJUSTMENTS as any)[region].courtesyMultiplier;
    if (multiplier > 1.0) {
      // Higher expectations in central and northern Vietnam
      courtesyRating = Math.max(1.0, courtesyRating - (multiplier - 1.0) * 0.3);
    }
  }
  
  return Math.max(1.0, Math.min(5.0, courtesyRating));
}

/**
 * Calculate cultural sensitivity rating
 */
export function calculateCulturalSensitivityRating(
  festivalAwareness: number, // 0-1 scale
  giftWrappingQuality: number, // 1-5 scale
  familyApproach: number, // 1-5 scale
  languageCulturalFit: number // 1-5 scale
): number {
  const culturalRating = (festivalAwareness * 5 * 0.3) + (giftWrappingQuality * 0.3) + 
                        (familyApproach * 0.2) + (languageCulturalFit * 0.2);
  
  return Math.max(1.0, Math.min(5.0, culturalRating));
}

/**
 * Calculate tier-specific performance
 */
export function calculateTierPerformance(tierData: {
  vip: { orders: number; satisfaction: number; responseTime: number; };
  standard: { orders: number; satisfaction: number; responseTime: number; };
  new: { orders: number; satisfaction: number; responseTime: number; };
}): { vip: number; standard: number; new: number; } {
  const calculateTierScore = (data: { orders: number; satisfaction: number; responseTime: number; }) => {
    if (data.orders === 0) return 3.0; // No data = average score
    
    // VIP customers should get faster response (weight: 50%)
    let responseScore = 5.0;
    if (data.responseTime > 24) responseScore = 1.0;
    else if (data.responseTime > 12) responseScore = 2.0;
    else if (data.responseTime > 6) responseScore = 3.0;
    else if (data.responseTime > 2) responseScore = 4.0;
    
    // Satisfaction weight: 50%
    const satisfactionScore = data.satisfaction;
    
    return (responseScore * 0.5) + (satisfactionScore * 0.5);
  };
  
  return {
    vip: calculateTierScore(tierData.vip),
    standard: calculateTierScore(tierData.standard),
    new: calculateTierScore(tierData.new)
  };
}

/**
 * Calculate seasonal performance adjustments
 */
export function applySeasonalAdjustments(
  baseRating: number,
  season: 'tet' | 'mid_autumn' | 'back_to_school' | 'exam_period' | 'regular',
  performanceType: 'delivery' | 'service' | 'packaging' | 'courtesy'
): number {
  const adjustments = SEASONAL_ADJUSTMENTS[season];
  let adjustmentFactor = 1.0;
  
  switch (performanceType) {
    case 'delivery':
      adjustmentFactor = adjustments.deliveryExpectation;
      break;
    case 'service':
      adjustmentFactor = adjustments.serviceExpectation;
      break;
    case 'packaging':
      adjustmentFactor = adjustments.giftWrappingImportance;
      break;
    case 'courtesy':
      adjustmentFactor = adjustments.courtesyImportance;
      break;
  }
  
  // Apply adjustment (factor < 1.0 = more lenient, factor > 1.0 = more strict)
  if (adjustmentFactor < 1.0) {
    // More lenient - boost rating slightly
    return Math.min(5.0, baseRating + (1.0 - adjustmentFactor) * 0.5);
  } else if (adjustmentFactor > 1.0) {
    // More strict - reduce rating slightly
    return Math.max(1.0, baseRating - (adjustmentFactor - 1.0) * 0.3);
  }
  
  return baseRating;
}

/**
 * Main function to calculate comprehensive Vietnamese market performance scores
 */
export function calculateVietnamesePerformanceScore(data: PerformanceData): ScoringResult {
  // Calculate dimensional ratings
  const deliverySpeedRating = calculateDeliverySpeedRating(data.avgDeliveryDays);
  const bookConditionRating = calculateBookConditionRating(
    data.returnedOrders / Math.max(1, data.totalOrders),
    data.customerComplaints,
    data.totalOrders
  );
  const customerServiceRating = calculateCustomerServiceRating(
    data.avgResponseTimeHours,
    data.reviewRatings.length > 0 ? data.reviewRatings.reduce((a, b) => a + b) / data.reviewRatings.length : 3.0,
    0.85 // Assumed complaint resolution rate
  );
  const pricingRating = calculatePricingRating(100, 100, 0.02); // Placeholder values
  const communicationRating = calculateCommunicationRating(data.avgResponseTimeHours, 4.0, 4.0);
  const courtesyRating = calculateCourtesyRating(4.0, 0.8, 4.0);
  const culturalSensitivityRating = calculateCulturalSensitivityRating(0.7, 4.0, 4.0, 4.0);
  
  // Apply seasonal adjustments if season data is available
  let adjustedDeliveryRating = deliverySpeedRating;
  let adjustedServiceRating = customerServiceRating;
  let adjustedCourtesyRating = courtesyRating;
  
  if (data.seasonalData) {
    adjustedDeliveryRating = applySeasonalAdjustments(deliverySpeedRating, data.seasonalData.season, 'delivery');
    adjustedServiceRating = applySeasonalAdjustments(customerServiceRating, data.seasonalData.season, 'service');
    adjustedCourtesyRating = applySeasonalAdjustments(courtesyRating, data.seasonalData.season, 'courtesy');
  }
  
  // Calculate weighted overall rating
  const weights = VIETNAMESE_MARKET_WEIGHTS;
  const overallRating = 
    (adjustedDeliveryRating * weights.deliverySpeed) +
    (bookConditionRating * weights.bookCondition) +
    (adjustedServiceRating * weights.customerService) +
    (pricingRating * weights.pricing) +
    (communicationRating * weights.communication) +
    (adjustedCourtesyRating * weights.courtesy) +
    (culturalSensitivityRating * weights.culturalSensitivity);
  
  // Calculate performance metrics
  const orderFulfillmentRate = data.completedOrders / Math.max(1, data.totalOrders);
  const returnRate = data.returnedOrders / Math.max(1, data.totalOrders);
  const customerRetentionRate = data.repeatCustomers / Math.max(1, data.totalOrders);
  
  // Calculate category performance
  const categoryPerformance: { [categoryId: string]: number } = {};
  Object.entries(data.categoryPerformance).forEach(([categoryId, categoryData]) => {
    categoryPerformance[categoryId] = categoryData.avgRating;
  });
  
  // Calculate tier performance
  const tierPerformance = calculateTierPerformance(data.tierPerformance);
  
  // Analyze trends (simplified)
  let performanceTrend: 'improving' | 'stable' | 'declining' = 'stable';
  if (overallRating > 4.0) performanceTrend = 'improving';
  else if (overallRating < 3.0) performanceTrend = 'declining';
  
  return {
    overallRating: Math.max(1.0, Math.min(5.0, overallRating)),
    dimensionalRatings: {
      deliverySpeedRating: adjustedDeliveryRating,
      bookConditionRating,
      customerServiceRating: adjustedServiceRating,
      pricingRating,
      communicationRating,
      courtesyRating: adjustedCourtesyRating,
      culturalSensitivityRating
    },
    performanceMetrics: {
      avgDeliveryDays: data.avgDeliveryDays,
      avgResponseTimeHours: data.avgResponseTimeHours,
      orderFulfillmentRate,
      returnRate,
      customerRetentionRate
    },
    categoryPerformance,
    tierPerformance,
    qualityMetrics: {
      authenticityScore: 4.5 + Math.random() * 0.5, // Placeholder
      qualityConsistency: 4.0 + Math.random() * 1.0, // Placeholder
      preferenceMatchScore: 3.5 + Math.random() * 1.0 // Placeholder
    },
    trendAnalysis: {
      performanceTrend,
      confidenceLevel: 0.85,
      keyFactors: ['delivery_speed', 'customer_service', 'book_condition']
    }
  };
}

/**
 * Calculate sentiment analysis from Vietnamese reviews
 */
export function analyzeVietnameseReviewSentiment(reviews: any[]): {
  positive: number;
  neutral: number;
  negative: number;
  keywordFrequency: { [keyword: string]: number };
  emotionalTone: "very_positive" | "positive" | "neutral" | "negative" | "very_negative";
} {
  if (reviews.length === 0) {
    return {
      positive: 0.5,
      neutral: 0.3,
      negative: 0.2,
      keywordFrequency: {},
      emotionalTone: "neutral"
    };
  }
  
  // Positive keywords in Vietnamese
  const positiveKeywords = [
    'tốt', 'tuyệt vời', 'hài lòng', 'nhanh', 'chất lượng', 'đẹp', 'uy tín', 
    'tận tâm', 'chu đáo', 'nhiệt tình', 'chuyên nghiệp', 'recommend', 'like'
  ];
  
  // Negative keywords in Vietnamese
  const negativeKeywords = [
    'tệ', 'kém', 'chậm', 'không hài lòng', 'xấu', 'lỗi', 'hỏng', 
    'thất vọng', 'không tốt', 'problem', 'issue', 'bad'
  ];
  
  let positiveCount = 0;
  let negativeCount = 0;
  let neutralCount = 0;
  const keywordFrequency: { [keyword: string]: number } = {};
  
  reviews.forEach(review => {
    const content = (review.reviewTitle + ' ' + review.reviewContent).toLowerCase();
    let sentimentScore = 0;
    
    // Count positive keywords
    positiveKeywords.forEach(keyword => {
      const occurrences = (content.match(new RegExp(keyword, 'g')) || []).length;
      if (occurrences > 0) {
        sentimentScore += occurrences;
        keywordFrequency[keyword] = (keywordFrequency[keyword] || 0) + occurrences;
      }
    });
    
    // Count negative keywords
    negativeKeywords.forEach(keyword => {
      const occurrences = (content.match(new RegExp(keyword, 'g')) || []).length;
      if (occurrences > 0) {
        sentimentScore -= occurrences;
        keywordFrequency[keyword] = (keywordFrequency[keyword] || 0) + occurrences;
      }
    });
    
    // Also consider rating
    if (review.overallRating) {
      if (review.overallRating >= 4) sentimentScore += 2;
      else if (review.overallRating >= 3) sentimentScore += 0;
      else sentimentScore -= 2;
    }
    
    // Classify sentiment
    if (sentimentScore > 1) positiveCount++;
    else if (sentimentScore < -1) negativeCount++;
    else neutralCount++;
  });
  
  const total = reviews.length;
  const positive = positiveCount / total;
  const negative = negativeCount / total;
  const neutral = neutralCount / total;
  
  // Determine emotional tone
  let emotionalTone: "very_positive" | "positive" | "neutral" | "negative" | "very_negative";
  if (positive > 0.7) emotionalTone = "very_positive";
  else if (positive > 0.5) emotionalTone = "positive";
  else if (negative > 0.5) emotionalTone = "negative";
  else if (negative > 0.7) emotionalTone = "very_negative";
  else emotionalTone = "neutral";
  
  return {
    positive,
    neutral,
    negative,
    keywordFrequency,
    emotionalTone
  };
}

/**
 * Generate performance recommendations based on scoring results
 */
export function generatePerformanceRecommendations(scoring: ScoringResult): string[] {
  const recommendations: string[] = [];
  
  if (scoring.dimensionalRatings.deliverySpeedRating < 3.5) {
    recommendations.push("Cải thiện tốc độ giao hàng - khách Việt Nam rất coi trọng việc nhận hàng nhanh");
  }
  
  if (scoring.dimensionalRatings.bookConditionRating < 3.5) {
    recommendations.push("Nâng cao chất lượng đóng gói và bảo quản sách để đảm bảo tình trạng tốt");
  }
  
  if (scoring.dimensionalRatings.customerServiceRating < 3.5) {
    recommendations.push("Cải thiện dịch vụ chăm sóc khách hàng, trả lời nhanh và tận tình hơn");
  }
  
  if (scoring.dimensionalRatings.courtesyRating < 3.5) {
    recommendations.push("Sử dụng ngôn ngữ lịch sự và phù hợp với văn hóa Việt Nam");
  }
  
  if (scoring.dimensionalRatings.culturalSensitivityRating < 3.5) {
    recommendations.push("Tăng cường hiểu biết về văn hóa Việt Nam, đặc biệt trong các dịp lễ tết");
  }
  
  if (scoring.performanceMetrics.returnRate > 0.05) {
    recommendations.push("Giảm tỷ lệ trả hàng bằng cách mô tả sản phẩm chính xác hơn");
  }
  
  return recommendations;
}