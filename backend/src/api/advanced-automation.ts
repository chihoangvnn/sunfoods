// @ts-nocheck
import { Router, Request, Response } from "express";
import { storage } from "../storage";
import type { 
  InsertMarketTrend, UpdateMarketTrend,
  InsertCompetitorProfile, UpdateCompetitorProfile,
  InsertSeasonalRule, UpdateSeasonalRule,
  InsertPricingStrategy, UpdatePricingStrategy
} from "@shared/schema";

const router = Router();

// 📈 MARKET TRENDS ENDPOINTS
router.get("/market-trends", async (req: Request, res: Response) => {
  try {
    const { categoryId, trendDirection, automationEnabled } = req.query;
    
    const trends = await storage.getMarketTrends({
      categoryId: categoryId as string,
      trendDirection: trendDirection as string,
      automationEnabled: automationEnabled === 'true' ? true : automationEnabled === 'false' ? false : undefined
    });
    
    res.json({ success: true, data: trends });
  } catch (error: any) {
    console.error('❌ Error fetching market trends:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/market-trends/:id", async (req: Request, res: Response) => {
  try {
    const trend = await storage.getMarketTrendById(req.params.id);
    if (!trend) {
      return res.status(404).json({ success: false, error: "Market trend not found" });
    }
    res.json({ success: true, data: trend });
  } catch (error: any) {
    console.error('❌ Error fetching market trend:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/market-trends", async (req: Request, res: Response) => {
  try {
    const data: InsertMarketTrend = req.body;
    const trend = await storage.createMarketTrend(data);
    res.status(201).json({ success: true, data: trend });
  } catch (error: any) {
    console.error('❌ Error creating market trend:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.patch("/market-trends/:id", async (req: Request, res: Response) => {
  try {
    const data: UpdateMarketTrend = req.body;
    const trend = await storage.updateMarketTrend(req.params.id, data);
    if (!trend) {
      return res.status(404).json({ success: false, error: "Market trend not found" });
    }
    res.json({ success: true, data: trend });
  } catch (error: any) {
    console.error('❌ Error updating market trend:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete("/market-trends/:id", async (req: Request, res: Response) => {
  try {
    const deleted = await storage.deleteMarketTrend(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: "Market trend not found" });
    }
    res.json({ success: true, message: "Market trend deleted" });
  } catch (error: any) {
    console.error('❌ Error deleting market trend:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 🏆 COMPETITOR PROFILES ENDPOINTS
router.get("/competitors", async (req: Request, res: Response) => {
  try {
    const { competitorType, pricingStrategy, isActive } = req.query;
    
    const profiles = await storage.getCompetitorProfiles({
      competitorType: competitorType as string,
      pricingStrategy: pricingStrategy as string,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined
    });
    
    res.json({ success: true, data: profiles });
  } catch (error: any) {
    console.error('❌ Error fetching competitor profiles:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/competitors/:id", async (req: Request, res: Response) => {
  try {
    const profile = await storage.getCompetitorProfileById(req.params.id);
    if (!profile) {
      return res.status(404).json({ success: false, error: "Competitor profile not found" });
    }
    res.json({ success: true, data: profile });
  } catch (error: any) {
    console.error('❌ Error fetching competitor profile:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/competitors", async (req: Request, res: Response) => {
  try {
    const data: InsertCompetitorProfile = req.body;
    const profile = await storage.createCompetitorProfile(data);
    res.status(201).json({ success: true, data: profile });
  } catch (error: any) {
    console.error('❌ Error creating competitor profile:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.patch("/competitors/:id", async (req: Request, res: Response) => {
  try {
    const data: UpdateCompetitorProfile = req.body;
    const profile = await storage.updateCompetitorProfile(req.params.id, data);
    if (!profile) {
      return res.status(404).json({ success: false, error: "Competitor profile not found" });
    }
    res.json({ success: true, data: profile });
  } catch (error: any) {
    console.error('❌ Error updating competitor profile:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete("/competitors/:id", async (req: Request, res: Response) => {
  try {
    const deleted = await storage.deleteCompetitorProfile(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: "Competitor profile not found" });
    }
    res.json({ success: true, message: "Competitor profile deleted" });
  } catch (error: any) {
    console.error('❌ Error deleting competitor profile:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 🎄 SEASONAL RULES ENDPOINTS
router.get("/seasonal-rules", async (req: Request, res: Response) => {
  try {
    const { seasonType, ruleType, isActive, autoApply } = req.query;
    
    const rules = await storage.getSeasonalRules({
      seasonType: seasonType as string,
      ruleType: ruleType as string,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      autoApply: autoApply === 'true' ? true : autoApply === 'false' ? false : undefined
    });
    
    res.json({ success: true, data: rules });
  } catch (error: any) {
    console.error('❌ Error fetching seasonal rules:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/seasonal-rules/:id", async (req: Request, res: Response) => {
  try {
    const rule = await storage.getSeasonalRuleById(req.params.id);
    if (!rule) {
      return res.status(404).json({ success: false, error: "Seasonal rule not found" });
    }
    res.json({ success: true, data: rule });
  } catch (error: any) {
    console.error('❌ Error fetching seasonal rule:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/seasonal-rules", async (req: Request, res: Response) => {
  try {
    const data: InsertSeasonalRule = req.body;
    const rule = await storage.createSeasonalRule(data);
    res.status(201).json({ success: true, data: rule });
  } catch (error: any) {
    console.error('❌ Error creating seasonal rule:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.patch("/seasonal-rules/:id", async (req: Request, res: Response) => {
  try {
    const data: UpdateSeasonalRule = req.body;
    const rule = await storage.updateSeasonalRule(req.params.id, data);
    if (!rule) {
      return res.status(404).json({ success: false, error: "Seasonal rule not found" });
    }
    res.json({ success: true, data: rule });
  } catch (error: any) {
    console.error('❌ Error updating seasonal rule:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete("/seasonal-rules/:id", async (req: Request, res: Response) => {
  try {
    const deleted = await storage.deleteSeasonalRule(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: "Seasonal rule not found" });
    }
    res.json({ success: true, message: "Seasonal rule deleted" });
  } catch (error: any) {
    console.error('❌ Error deleting seasonal rule:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/seasonal-rules/:id/apply", async (req: Request, res: Response) => {
  try {
    const rule = await storage.applySeasonalRule(req.params.id);
    if (!rule) {
      return res.status(404).json({ success: false, error: "Seasonal rule not found" });
    }
    res.json({ success: true, data: rule, message: "Seasonal rule applied successfully" });
  } catch (error: any) {
    console.error('❌ Error applying seasonal rule:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 💰 PRICING STRATEGIES ENDPOINTS
router.get("/pricing-strategies", async (req: Request, res: Response) => {
  try {
    const { sellerId, strategyType, isActive, autoAdjustmentEnabled } = req.query;
    
    const strategies = await storage.getPricingStrategies({
      sellerId: sellerId as string,
      strategyType: strategyType as string,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      autoAdjustmentEnabled: autoAdjustmentEnabled === 'true' ? true : autoAdjustmentEnabled === 'false' ? false : undefined
    });
    
    res.json({ success: true, data: strategies });
  } catch (error: any) {
    console.error('❌ Error fetching pricing strategies:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/pricing-strategies/:id", async (req: Request, res: Response) => {
  try {
    const strategy = await storage.getPricingStrategyById(req.params.id);
    if (!strategy) {
      return res.status(404).json({ success: false, error: "Pricing strategy not found" });
    }
    res.json({ success: true, data: strategy });
  } catch (error: any) {
    console.error('❌ Error fetching pricing strategy:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/pricing-strategies/seller/:sellerId", async (req: Request, res: Response) => {
  try {
    const strategy = await storage.getPricingStrategyBySellerId(req.params.sellerId);
    if (!strategy) {
      return res.status(404).json({ success: false, error: "No active pricing strategy found for seller" });
    }
    res.json({ success: true, data: strategy });
  } catch (error: any) {
    console.error('❌ Error fetching seller pricing strategy:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/pricing-strategies", async (req: Request, res: Response) => {
  try {
    const data: InsertPricingStrategy = req.body;
    const strategy = await storage.createPricingStrategy(data);
    res.status(201).json({ success: true, data: strategy });
  } catch (error: any) {
    console.error('❌ Error creating pricing strategy:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.patch("/pricing-strategies/:id", async (req: Request, res: Response) => {
  try {
    const data: UpdatePricingStrategy = req.body;
    const strategy = await storage.updatePricingStrategy(req.params.id, data);
    if (!strategy) {
      return res.status(404).json({ success: false, error: "Pricing strategy not found" });
    }
    res.json({ success: true, data: strategy });
  } catch (error: any) {
    console.error('❌ Error updating pricing strategy:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete("/pricing-strategies/:id", async (req: Request, res: Response) => {
  try {
    const deleted = await storage.deletePricingStrategy(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: "Pricing strategy not found" });
    }
    res.json({ success: true, message: "Pricing strategy deleted" });
  } catch (error: any) {
    console.error('❌ Error deleting pricing strategy:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/pricing-strategies/:id/record-adjustment", async (req: Request, res: Response) => {
  try {
    const { priceChangePercent } = req.body;
    if (typeof priceChangePercent !== 'number') {
      return res.status(400).json({ success: false, error: "priceChangePercent must be a number" });
    }
    
    const strategy = await storage.recordPricingAdjustment(req.params.id, priceChangePercent);
    if (!strategy) {
      return res.status(404).json({ success: false, error: "Pricing strategy not found" });
    }
    res.json({ success: true, data: strategy, message: "Price adjustment recorded" });
  } catch (error: any) {
    console.error('❌ Error recording pricing adjustment:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 📊 AUTOMATION DASHBOARD & ANALYTICS
router.get("/dashboard/overview", async (req: Request, res: Response) => {
  try {
    const [
      allTrends,
      allCompetitors,
      allRules,
      allStrategies
    ] = await Promise.all([
      storage.getMarketTrends(),
      storage.getCompetitorProfiles({ isActive: true }),
      storage.getSeasonalRules({ isActive: true }),
      storage.getPricingStrategies({ isActive: true })
    ]);

    const overview = {
      marketTrends: {
        total: allTrends.length,
        rising: allTrends.filter(t => t.trendDirection === 'rising').length,
        declining: allTrends.filter(t => t.trendDirection === 'declining').length,
        automated: allTrends.filter(t => t.automationEnabled).length
      },
      competitors: {
        total: allCompetitors.length,
        aggressive: allCompetitors.filter(c => c.competitorType === 'aggressive_pricer').length,
        premium: allCompetitors.filter(c => c.competitorType === 'premium_quality').length,
        avgMarketShare: allCompetitors.reduce((sum, c) => sum + parseFloat(c.marketShare.toString()), 0) / (allCompetitors.length || 1)
      },
      seasonalRules: {
        total: allRules.length,
        autoApply: allRules.filter(r => r.autoApply).length,
        byType: {
          pricing: allRules.filter(r => r.ruleType === 'pricing').length,
          inventory: allRules.filter(r => r.ruleType === 'inventory').length,
          marketing: allRules.filter(r => r.ruleType === 'marketing').length,
          combined: allRules.filter(r => r.ruleType === 'combined').length
        }
      },
      pricingStrategies: {
        total: allStrategies.length,
        automated: allStrategies.filter(s => s.autoAdjustmentEnabled).length,
        avgProfitability: allStrategies.reduce((sum, s) => sum + parseFloat(s.profitabilityScore.toString()), 0) / (allStrategies.length || 1),
        byType: {
          competitive: allStrategies.filter(s => s.strategyType === 'competitive').length,
          dynamic: allStrategies.filter(s => s.strategyType === 'dynamic').length,
          costPlus: allStrategies.filter(s => s.strategyType === 'cost_plus').length
        }
      }
    };

    res.json({ success: true, data: overview });
  } catch (error: any) {
    console.error('❌ Error fetching automation dashboard:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 🌱 SEED DATA ENDPOINT - Populate automation tables with Vietnamese book market data
router.post("/seed-data", async (req: Request, res: Response) => {
  try {
    // Check if data already exists
    const existingTrends = await storage.getMarketTrends();
    if (existingTrends.length > 0) {
      return res.status(400).json({ 
        success: false, 
        error: "Seed data already exists. Delete existing data first." 
      });
    }

    // 1️⃣ Create Market Trends - Vietnamese book categories
    const trendData: InsertMarketTrend[] = [
      {
        categoryId: 'cat-1',
        categoryName: 'Văn học Việt Nam',
        trendScore: 0.85,
        trendDirection: 'rising',
        momentum: 0.15,
        demandIndicator: 0.78,
        predictedGrowth: 0.22,
        regionalDemand: { 'hanoi': 0.9, 'hcm': 0.85, 'danang': 0.7 },
        automationEnabled: true
      },
      {
        categoryId: 'cat-2',
        categoryName: 'Sách Kinh Tế',
        trendScore: 0.72,
        trendDirection: 'stable',
        momentum: 0.05,
        demandIndicator: 0.68,
        predictedGrowth: 0.08,
        regionalDemand: { 'hanoi': 0.75, 'hcm': 0.8, 'danang': 0.65 },
        automationEnabled: true
      },
      {
        categoryId: 'cat-3',
        categoryName: 'Sách Thiếu Nhi',
        trendScore: 0.68,
        trendDirection: 'rising',
        momentum: 0.12,
        demandIndicator: 0.65,
        predictedGrowth: 0.18,
        regionalDemand: { 'hanoi': 0.7, 'hcm': 0.72, 'danang': 0.6 },
        automationEnabled: true
      },
      {
        categoryId: 'cat-4',
        categoryName: 'Sách Học Ngoại Ngữ',
        trendScore: 0.55,
        trendDirection: 'declining',
        momentum: -0.08,
        demandIndicator: 0.52,
        predictedGrowth: -0.05,
        regionalDemand: { 'hanoi': 0.6, 'hcm': 0.55, 'danang': 0.45 },
        automationEnabled: false
      }
    ];

    const createdTrends = await Promise.all(
      trendData.map(data => storage.createMarketTrend(data))
    );

    // 2️⃣ Create Competitor Profiles - Vietnamese book sellers
    const competitorData: InsertCompetitorProfile[] = [
      {
        competitorName: 'Fahasa Online',
        competitorType: 'aggressive_pricer',
        pricingStrategy: 'discount_heavy',
        avgDiscount: 0.25,
        marketShare: 0.35,
        responseTime: 24,
        businessPractices: { 
          'free_shipping_threshold': 150000, 
          'return_policy_days': 7,
          'loyalty_program': true,
          'flash_sales': true
        },
        isActive: true
      },
      {
        competitorName: 'Nhã Nam Books',
        competitorType: 'premium_quality',
        pricingStrategy: 'premium_positioning',
        avgDiscount: 0.10,
        marketShare: 0.18,
        responseTime: 72,
        businessPractices: { 
          'curated_selection': true,
          'author_events': true,
          'book_clubs': true,
          'exclusive_editions': true
        },
        isActive: true
      },
      {
        competitorName: 'Tiki Books',
        competitorType: 'volume_seller',
        pricingStrategy: 'competitive',
        avgDiscount: 0.20,
        marketShare: 0.28,
        responseTime: 12,
        businessPractices: { 
          'fast_delivery': true,
          'tiki_now': true,
          'membership_benefits': true,
          'bundling': true
        },
        isActive: true
      },
      {
        competitorName: 'Shopee Books',
        competitorType: 'market_follower',
        pricingStrategy: 'match_competition',
        avgDiscount: 0.18,
        marketShare: 0.12,
        responseTime: 48,
        businessPractices: { 
          'vouchers': true,
          'coins_cashback': true,
          'livestream_sales': true
        },
        isActive: true
      },
      {
        competitorName: 'Local Bookstores',
        competitorType: 'niche_specialist',
        pricingStrategy: 'value_added',
        avgDiscount: 0.05,
        marketShare: 0.07,
        responseTime: 168,
        businessPractices: { 
          'personal_recommendations': true,
          'community_events': true,
          'rare_books': true,
          'local_authors': true
        },
        isActive: true
      }
    ];

    const createdCompetitors = await Promise.all(
      competitorData.map(data => storage.createCompetitorProfile(data))
    );

    // 3️⃣ Create Seasonal Rules - Vietnamese cultural events
    const seasonalData: InsertSeasonalRule[] = [
      {
        ruleName: 'Tết Nguyên Đán',
        seasonType: 'tet',
        startDate: new Date('2025-01-20'),
        endDate: new Date('2025-02-10'),
        ruleType: 'combined',
        priceAdjustment: 0.10,
        inventoryMultiplier: 2.5,
        marketingBoost: 0.40,
        priority: 10,
        autoApply: true,
        culturalSignificance: 'Tết là dịp lễ quan trọng nhất trong năm, nhu cầu mua sắm tăng mạnh',
        targetCategories: ['Văn học Việt Nam', 'Sách Thiếu Nhi', 'Sách Kỹ Năng Sống'],
        isActive: true
      },
      {
        ruleName: 'Trung Thu',
        seasonType: 'mid_autumn',
        startDate: new Date('2025-09-01'),
        endDate: new Date('2025-09-20'),
        ruleType: 'inventory',
        inventoryMultiplier: 2.0,
        marketingBoost: 0.30,
        priority: 8,
        autoApply: true,
        culturalSignificance: 'Tết Trung Thu - mùa mua sách thiếu nhi cao điểm',
        targetCategories: ['Sách Thiếu Nhi', 'Truyện Tranh'],
        isActive: true
      },
      {
        ruleName: 'Khai Giảng',
        seasonType: 'back_to_school',
        startDate: new Date('2025-08-15'),
        endDate: new Date('2025-09-10'),
        ruleType: 'pricing',
        priceAdjustment: -0.15,
        marketingBoost: 0.35,
        priority: 9,
        autoApply: true,
        culturalSignificance: 'Mùa khai giảng năm học mới - nhu cầu sách giáo khoa và tham khảo tăng',
        targetCategories: ['Sách Giáo Khoa', 'Sách Tham Khảo', 'Sách Học Ngoại Ngữ'],
        isActive: true
      },
      {
        ruleName: 'Black Friday Vietnam',
        seasonType: 'promotional_season',
        startDate: new Date('2025-11-24'),
        endDate: new Date('2025-11-30'),
        ruleType: 'pricing',
        priceAdjustment: -0.30,
        marketingBoost: 0.50,
        priority: 7,
        autoApply: false,
        culturalSignificance: 'Black Friday - ngày mua sắm giảm giá lớn',
        targetCategories: ['all'],
        isActive: true
      }
    ];

    const createdRules = await Promise.all(
      seasonalData.map(data => storage.createSeasonalRule(data))
    );

    // 4️⃣ Create Pricing Strategies - Get existing sellers first
    let existingSellers = await storage.getBookSellers({ isActive: true });
    
    // If no sellers exist, create a default automation seller for demonstration
    if (existingSellers.length === 0) {
      const defaultSeller = await storage.createBookSeller({
        sellerId: 'AUTO_SEED_001',
        displayName: 'Automation Demo Seller',
        businessName: 'Vietnamese Book Automation Demo',
        tier: 'professional',
        pricingTier: 'market_price',
        isActive: true,
        autoAssignBooks: true
      });
      existingSellers = [defaultSeller];
    }

    const pricingData: InsertPricingStrategy[] = existingSellers.slice(0, 3).map((seller, index) => {
      const strategies = [
        {
          strategyName: 'Chiến lược Cạnh tranh Cao',
          strategyType: 'competitive' as const,
          minPriceMargin: 0.08,
          maxPriceMargin: 0.25,
          competitorResponseSpeed: 6,
          demandSensitivity: 0.75,
          inventoryThreshold: 20,
          profitabilityScore: 0.72,
          autoAdjustmentEnabled: true
        },
        {
          strategyName: 'Giá Linh Hoạt Theo Nhu Cầu',
          strategyType: 'dynamic' as const,
          minPriceMargin: 0.10,
          maxPriceMargin: 0.35,
          demandSensitivity: 0.85,
          inventoryThreshold: 15,
          profitabilityScore: 0.78,
          autoAdjustmentEnabled: true
        },
        {
          strategyName: 'Cost Plus Ổn Định',
          strategyType: 'cost_plus' as const,
          minPriceMargin: 0.15,
          maxPriceMargin: 0.20,
          demandSensitivity: 0.50,
          profitabilityScore: 0.68,
          autoAdjustmentEnabled: false
        }
      ];

      return {
        sellerId: seller.id,
        ...strategies[index % strategies.length],
        isActive: true
      };
    });

    const createdStrategies = await Promise.all(
      pricingData.map(data => storage.createPricingStrategy(data))
    );

    res.json({ 
      success: true, 
      message: 'Seed data created successfully for Vietnamese book market automation',
      data: {
        marketTrends: createdTrends.length,
        competitorProfiles: createdCompetitors.length,
        seasonalRules: createdRules.length,
        pricingStrategies: createdStrategies.length,
        summary: {
          totalRecords: createdTrends.length + createdCompetitors.length + createdRules.length + createdStrategies.length,
          culturalEvents: ['Tết Nguyên Đán', 'Trung Thu', 'Khai Giảng', 'Black Friday Vietnam'],
          competitors: ['Fahasa', 'Nhã Nam', 'Tiki', 'Shopee', 'Local Bookstores'],
          categories: ['Văn học Việt Nam', 'Kinh Tế', 'Thiếu Nhi', 'Ngoại Ngữ']
        }
      }
    });
  } catch (error: any) {
    console.error('❌ Error seeding automation data:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
