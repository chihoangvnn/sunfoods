// New Backend API Types
export interface BackendProduct {
  id: string;
  name: string;
  description: string;
  sku: string;
  itemCode: string | null;
  isbn: string | null;
  price: string; // Backend returns as string
  stock: number;
  categoryId: string | null;
  status: string;
  image: string | null;
  images: string[];
  videos: string[];
  descriptions: Record<string, any>;
  defaultImageIndex: number;
  tagIds: string[];
  shortDescription: string | null;
  slug: string;
  productStory: Record<string, any>;
  ingredients: string[];
  benefits: string[];
  usageInstructions: string | null;
  specifications: Record<string, any>;
  seoTitle: string | null;
  seoDescription: string | null;
  ogImageUrl: string | null;
  unitType: string;
  unit: string;
  allowDecimals: boolean;
  minQuantity: string;
  quantityStep: string;
  consultationData: Record<string, any>;
  urgencyData: {
    demand_level: string;
    sales_velocity: number;
    urgency_messages: string[];
    is_limited_edition: boolean;
    low_stock_threshold: number;
  };
  socialProofData: {
    total_sold: number;
    total_reviews: number;
    average_rating: number;
    media_mentions: string[];
    celebrity_users: string[];
    repurchase_rate: number;
    featured_reviews: any[];
    trending_hashtags: string[];
    expert_endorsements: string[];
    awards_certifications: string[];
  };
  personalizationData: {
    skin_types: string[];
    income_bracket: string;
    lifestyle_tags: string[];
    profession_fit: string[];
    problem_solving: string[];
    usage_scenarios: string[];
    personality_match: string[];
    seasonal_relevance: string[];
    target_demographics: {
      primary: {
        gender: string[];
        location: string[];
        age_range: string;
        lifestyle: string[];
        income_level: string;
      };
    };
  };
  leadingQuestionsData: {
    emotional_hooks: string[];
    desire_questions: string[];
    closing_questions: string[];
    discovery_prompts: string[];
    comparison_triggers: string[];
    pain_point_questions: string[];
    objection_anticipation: string[];
  };
  objectionHandlingData: {
    trust_builders: string[];
    risk_mitigation: string[];
    safety_assurance: string[];
    common_objections: string[];
    price_justification: {
      daily_cost: string;
      comparison_points: string[];
      value_proposition: string;
    };
    quality_proof_points: string[];
    competitor_advantages: string[];
    effectiveness_guarantee: {
      timeline: string;
      success_rate: string;
      guarantee_text: string;
    };
  };
  smartFAQ: any;
  needsAssessment: any;
  botPersonality: any;
  consultationScenarios: any;
  competitorComparison: any;
  crossSellData: any;
  consultationTracking: any;
  customDescriptions: any;
  originalPrice: string | null;
  fakeSalesCount: number;
  isNew: boolean;
  isTopseller: boolean;
  isFreeshipping: boolean;
  isBestseller: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BackendCategory {
  id: string;
  name: string;
  description: string;
  industryId: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  consultationConfig: Record<string, any>;
  consultationTemplates: Record<string, any>;
  salesAdviceTemplate: Record<string, any>;
}

// Current UI Types (simplified for compatibility)
export interface Product {
  id: string;
  slug?: string;
  name: string;
  price: number;
  image?: string;
  images?: string[];
  media?: string;
  category_id: string;
  stock: number;
  short_description?: string;
  status: string;
  benefits?: string | string[];
  // Badge properties
  isNew?: boolean;
  isTopseller?: boolean;
  isFreeshipping?: boolean;
  isBestseller?: boolean;
  // Additional properties for specialized product cards
  rating?: number;
  specifications?: Record<string, any>;
  // Jewelry-specific properties
  grade?: 'AAA' | 'AA+' | 'A+' | 'A';
  beadCount?: number;
  beadSize?: string;
  hasCertificate?: boolean;
  isGiftReady?: boolean;
  giftCategory?: 'male' | 'female' | 'feng-shui' | 'couple';
  availableSizes?: string[];
}

export interface Category {
  id: string;
  name: string;
}

// API Configuration
export interface ApiConfig {
  baseUrl: string;
  frontendId: string;
  enableFallback: boolean;
}