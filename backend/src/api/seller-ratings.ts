/**
 * 🌟 SELLER RATING & FEEDBACK SYSTEM API
 * Comprehensive Vietnamese book marketplace seller rating system
 * Includes auto-generated reviews, performance scoring, and satisfaction tracking
 */

import express from 'express';
import { eq, desc, sql, and, gte, lte, count, avg } from 'drizzle-orm';
import { db } from '../db';
import { 
  sellerRatings, 
  customerReviews, 
  satisfactionSurveys, 
  performanceMetrics,
  vietnameseReviewTemplates,
  bookSellers,
  bookCustomers,
  bookOrders,
  type SellerRating,
  type CustomerReview,
  type SatisfactionSurvey,
  type PerformanceMetric,
  type InsertSellerRating,
  type InsertCustomerReview,
  type InsertSatisfactionSurvey,
  type InsertPerformanceMetric
} from '@shared/schema';
import { 
  generateVietnameseReview, 
  generateSellerReviews,
  generateReviewTimestamps,
  REVIEW_TEMPLATES 
} from '../utils/vietnamese-review-generator';
import { 
  calculateVietnamesePerformanceScore,
  analyzeVietnameseReviewSentiment,
  generatePerformanceRecommendations,
  type PerformanceData,
  type ScoringResult
} from '../utils/vietnamese-performance-scoring';

const router = express.Router();

// ============================================
// 🌟 SELLER RATING ENDPOINTS
// ============================================

/**
 * GET /api/seller-ratings
 * Get all seller ratings with optional filtering and pagination
 */
router.get('/', async (req, res) => {
  try {
    const { 
      sellerId, 
      minRating, 
      maxRating, 
      sortBy = 'overallRating', 
      sortOrder = 'desc',
      page = '1',
      limit = '20'
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    let query = db
      .select({
        rating: sellerRatings,
        seller: {
          id: bookSellers.id,
          sellerId: bookSellers.sellerId,
          displayName: bookSellers.displayName,
          businessName: bookSellers.businessName,
          tier: bookSellers.tier,
          profile: bookSellers.profile
        }
      })
      .from(sellerRatings)
      .leftJoin(bookSellers, eq(sellerRatings.sellerId, bookSellers.id))
      .limit(limitNum)
      .offset(offset);

    // Apply filters
    if (sellerId) {
      query = query.where(eq(sellerRatings.sellerId, sellerId as string));
    }
    if (minRating) {
      query = query.where(gte(sellerRatings.overallRating, minRating as string));
    }
    if (maxRating) {
      query = query.where(lte(sellerRatings.overallRating, maxRating as string));
    }

    // Apply sorting
    if (sortBy === 'overallRating') {
      query = sortOrder === 'desc' 
        ? query.orderBy(desc(sellerRatings.overallRating))
        : query.orderBy(sellerRatings.overallRating);
    } else if (sortBy === 'totalReviews') {
      query = sortOrder === 'desc'
        ? query.orderBy(desc(sellerRatings.totalReviews))
        : query.orderBy(sellerRatings.totalReviews);
    }

    const ratings = await query;

    // Get total count for pagination
    const totalCount = await db
      .select({ count: count() })
      .from(sellerRatings);

    res.json({
      success: true,
      data: ratings,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCount[0].count,
        totalPages: Math.ceil(totalCount[0].count / limitNum)
      }
    });

  } catch (error) {
    console.error('Error fetching seller ratings:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch seller ratings' 
    });
  }
});

/**
 * GET /api/seller-ratings/:sellerId
 * Get detailed rating information for a specific seller
 */
router.get('/:sellerId', async (req, res) => {
  try {
    const { sellerId } = req.params;

    // Get seller rating
    const rating = await db
      .select()
      .from(sellerRatings)
      .where(eq(sellerRatings.sellerId, sellerId))
      .limit(1);

    if (rating.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Seller rating not found'
      });
    }

    // Get recent reviews
    const recentReviews = await db
      .select()
      .from(customerReviews)
      .where(eq(customerReviews.sellerId, sellerId))
      .orderBy(desc(customerReviews.createdAt))
      .limit(10);

    // Get performance metrics
    const metrics = await db
      .select()
      .from(performanceMetrics)
      .where(eq(performanceMetrics.sellerId, sellerId))
      .orderBy(desc(performanceMetrics.periodStart))
      .limit(12); // Last 12 periods

    res.json({
      success: true,
      data: {
        rating: rating[0],
        recentReviews,
        performanceHistory: metrics
      }
    });

  } catch (error) {
    console.error('Error fetching seller rating details:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch seller rating details' 
    });
  }
});

/**
 * POST /api/seller-ratings/calculate/:sellerId
 * Calculate and update seller rating based on current data
 */
router.post('/calculate/:sellerId', async (req, res) => {
  try {
    const { sellerId } = req.params;

    // Get seller data
    const seller = await db
      .select()
      .from(bookSellers)
      .where(eq(bookSellers.id, sellerId))
      .limit(1);

    if (seller.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Seller not found'
      });
    }

    // Get all orders for this seller
    const orders = await db
      .select()
      .from(bookOrders)
      .where(sql`
        EXISTS (
          SELECT 1 FROM book_seller_inventory bsi 
          WHERE bsi.seller_id = ${sellerId} 
          AND bsi.book_isbn IN (
            SELECT DISTINCT book_isbn FROM book_order_items boi 
            WHERE boi.order_id = book_orders.id
          )
        )
      `);

    // Get all reviews for this seller
    const reviews = await db
      .select()
      .from(customerReviews)
      .where(eq(customerReviews.sellerId, sellerId));

    // Prepare performance data
    const performanceData: PerformanceData = {
      sellerId,
      totalOrders: orders.length,
      completedOrders: orders.filter(o => o.status === 'delivered').length,
      cancelledOrders: orders.filter(o => o.status === 'cancelled').length,
      returnedOrders: 0, // Would need return tracking
      avgDeliveryDays: 3.5, // Would calculate from actual delivery data
      avgResponseTimeHours: 6, // Would calculate from communication data
      totalReviews: reviews.length,
      reviewRatings: reviews.map(r => r.overallRating),
      customerComplaints: reviews.filter(r => r.overallRating <= 2).length,
      repeatCustomers: 0, // Would calculate from customer data
      categoryPerformance: {},
      tierPerformance: {
        vip: { orders: 0, satisfaction: 4.5, responseTime: 2 },
        standard: { orders: orders.length, satisfaction: 4.0, responseTime: 6 },
        new: { orders: 0, satisfaction: 3.8, responseTime: 8 }
      }
    };

    // Calculate performance score
    const scoringResult = calculateVietnamesePerformanceScore(performanceData);

    // Analyze review sentiment
    const sentimentAnalysis = analyzeVietnameseReviewSentiment(reviews);

    // Update or create seller rating
    const ratingData: InsertSellerRating = {
      sellerId,
      overallRating: scoringResult.overallRating.toString(),
      totalReviews: reviews.length,
      totalRatings: reviews.length,
      deliverySpeedRating: scoringResult.dimensionalRatings.deliverySpeedRating.toString(),
      bookConditionRating: scoringResult.dimensionalRatings.bookConditionRating.toString(),
      customerServiceRating: scoringResult.dimensionalRatings.customerServiceRating.toString(),
      pricingRating: scoringResult.dimensionalRatings.pricingRating.toString(),
      communicationRating: scoringResult.dimensionalRatings.communicationRating.toString(),
      courtesyRating: scoringResult.dimensionalRatings.courtesyRating.toString(),
      culturalSensitivityRating: scoringResult.dimensionalRatings.culturalSensitivityRating.toString(),
      avgDeliveryDays: scoringResult.performanceMetrics.avgDeliveryDays.toString(),
      avgResponseTimeHours: scoringResult.performanceMetrics.avgResponseTimeHours.toString(),
      orderFulfillmentRate: scoringResult.performanceMetrics.orderFulfillmentRate.toString(),
      returnRate: scoringResult.performanceMetrics.returnRate.toString(),
      categoryPerformance: scoringResult.categoryPerformance,
      tierPerformance: scoringResult.tierPerformance,
      sentimentAnalysis,
      authenticityScore: scoringResult.qualityMetrics.authenticityScore.toString(),
      qualityConsistency: scoringResult.qualityMetrics.qualityConsistency.toString(),
      preferenceMatchScore: scoringResult.qualityMetrics.preferenceMatchScore.toString(),
      lastCalculatedAt: new Date()
    };

    // Upsert seller rating
    const existingRating = await db
      .select()
      .from(sellerRatings)
      .where(eq(sellerRatings.sellerId, sellerId))
      .limit(1);

    if (existingRating.length > 0) {
      await db
        .update(sellerRatings)
        .set(ratingData)
        .where(eq(sellerRatings.sellerId, sellerId));
    } else {
      await db
        .insert(sellerRatings)
        .values(ratingData);
    }

    res.json({
      success: true,
      data: {
        sellerRating: ratingData,
        scoringResult,
        sentimentAnalysis,
        recommendations: generatePerformanceRecommendations(scoringResult)
      }
    });

  } catch (error) {
    console.error('Error calculating seller rating:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to calculate seller rating' 
    });
  }
});

// ============================================
// 📝 CUSTOMER REVIEW ENDPOINTS
// ============================================

/**
 * GET /api/seller-ratings/reviews/:sellerId
 * Get all reviews for a specific seller
 */
router.get('/reviews/:sellerId', async (req, res) => {
  try {
    const { sellerId } = req.params;
    const { 
      page = '1', 
      limit = '20', 
      rating, 
      sortBy = 'createdAt',
      isAutoGenerated 
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    let query = db
      .select()
      .from(customerReviews)
      .where(eq(customerReviews.sellerId, sellerId))
      .limit(limitNum)
      .offset(offset);

    // Apply filters
    if (rating) {
      query = query.where(eq(customerReviews.overallRating, parseInt(rating as string)));
    }
    if (isAutoGenerated !== undefined) {
      query = query.where(eq(customerReviews.isAutoGenerated, isAutoGenerated === 'true'));
    }

    // Apply sorting
    if (sortBy === 'createdAt') {
      query = query.orderBy(desc(customerReviews.createdAt));
    } else if (sortBy === 'rating') {
      query = query.orderBy(desc(customerReviews.overallRating));
    }

    const reviews = await query;

    // Get total count
    const totalCount = await db
      .select({ count: count() })
      .from(customerReviews)
      .where(eq(customerReviews.sellerId, sellerId));

    res.json({
      success: true,
      data: reviews,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCount[0].count,
        totalPages: Math.ceil(totalCount[0].count / limitNum)
      }
    });

  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch reviews' 
    });
  }
});

/**
 * POST /api/seller-ratings/reviews/generate
 * Generate Vietnamese reviews for a seller
 */
router.post('/reviews/generate', async (req, res) => {
  try {
    const { 
      sellerId, 
      count = 50, 
      qualityDistribution,
      bookCategories = ['literature', 'textbook', 'children'],
      timeframeDays = 180
    } = req.body;

    if (!sellerId) {
      return res.status(400).json({
        success: false,
        error: 'sellerId is required'
      });
    }

    // Verify seller exists
    const seller = await db
      .select()
      .from(bookSellers)
      .where(eq(bookSellers.id, sellerId))
      .limit(1);

    if (seller.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Seller not found'
      });
    }

    // Generate reviews
    const generatedReviews = generateSellerReviews(
      sellerId,
      count,
      qualityDistribution
    );

    // Generate realistic timestamps
    const timestamps = generateReviewTimestamps(count, timeframeDays / 30);

    // Prepare review data for insertion
    const reviewInserts: InsertCustomerReview[] = generatedReviews.map((review, index) => ({
      ...review,
      createdAt: timestamps[index],
      updatedAt: timestamps[index]
    }));

    // Insert reviews in batches
    const batchSize = 20;
    const insertedReviews = [];
    
    for (let i = 0; i < reviewInserts.length; i += batchSize) {
      const batch = reviewInserts.slice(i, i + batchSize);
      const inserted = await db
        .insert(customerReviews)
        .values(batch)
        .returning();
      insertedReviews.push(...inserted);
    }

    // Recalculate seller rating
    await fetch(`/api/seller-ratings/calculate/${sellerId}`, { method: 'POST' });

    res.json({
      success: true,
      data: {
        generatedCount: insertedReviews.length,
        reviews: insertedReviews.slice(0, 5), // Return first 5 as sample
        qualityDistribution: {
          excellent: generatedReviews.filter(r => r.overallRating === 5).length,
          good: generatedReviews.filter(r => r.overallRating === 4).length,
          average: generatedReviews.filter(r => r.overallRating === 3).length,
          poor: generatedReviews.filter(r => r.overallRating <= 2).length
        }
      }
    });

  } catch (error) {
    console.error('Error generating reviews:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to generate reviews' 
    });
  }
});

/**
 * POST /api/seller-ratings/reviews/bulk-generate
 * Generate reviews for multiple sellers
 */
router.post('/reviews/bulk-generate', async (req, res) => {
  try {
    const { 
      sellerIds, 
      reviewsPerSeller = 50,
      qualityDistribution 
    } = req.body;

    if (!sellerIds || !Array.isArray(sellerIds)) {
      return res.status(400).json({
        success: false,
        error: 'sellerIds array is required'
      });
    }

    const results = [];

    for (const sellerId of sellerIds) {
      try {
        // Generate reviews for this seller
        const generatedReviews = generateSellerReviews(
          sellerId,
          reviewsPerSeller,
          qualityDistribution
        );

        // Generate timestamps
        const timestamps = generateReviewTimestamps(reviewsPerSeller, 6); // 6 months

        // Prepare review data
        const reviewInserts: InsertCustomerReview[] = generatedReviews.map((review, index) => ({
          ...review,
          createdAt: timestamps[index],
          updatedAt: timestamps[index]
        }));

        // Insert reviews
        await db
          .insert(customerReviews)
          .values(reviewInserts);

        results.push({
          sellerId,
          success: true,
          generatedCount: reviewInserts.length
        });

      } catch (error) {
        console.error(`Error generating reviews for seller ${sellerId}:`, error);
        results.push({
          sellerId,
          success: false,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      data: {
        results,
        totalSellers: sellerIds.length,
        successfulSellers: results.filter(r => r.success).length
      }
    });

  } catch (error) {
    console.error('Error bulk generating reviews:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to bulk generate reviews' 
    });
  }
});

// ============================================
// 📊 SATISFACTION SURVEY ENDPOINTS
// ============================================

/**
 * GET /api/seller-ratings/satisfaction/:sellerId
 * Get satisfaction surveys for a seller
 */
router.get('/satisfaction/:sellerId', async (req, res) => {
  try {
    const { sellerId } = req.params;
    const { 
      surveyType, 
      customerTier,
      page = '1', 
      limit = '20' 
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    let query = db
      .select()
      .from(satisfactionSurveys)
      .where(eq(satisfactionSurveys.sellerId, sellerId))
      .limit(limitNum)
      .offset(offset)
      .orderBy(desc(satisfactionSurveys.createdAt));

    // Apply filters
    if (surveyType) {
      query = query.where(eq(satisfactionSurveys.surveyType, surveyType as any));
    }
    if (customerTier) {
      query = query.where(eq(satisfactionSurveys.customerTier, customerTier as any));
    }

    const surveys = await query;

    // Calculate average satisfaction scores
    const avgScores = await db
      .select({
        avgOverall: avg(satisfactionSurveys.overallSatisfaction),
        avgBrowsing: avg(satisfactionSurveys.browsingSatisfaction),
        avgOrdering: avg(satisfactionSurveys.orderingSatisfaction),
        avgCommunication: avg(satisfactionSurveys.communicationSatisfaction),
        avgDelivery: avg(satisfactionSurveys.deliverySatisfaction),
        avgPostPurchase: avg(satisfactionSurveys.postPurchaseSatisfaction)
      })
      .from(satisfactionSurveys)
      .where(eq(satisfactionSurveys.sellerId, sellerId));

    res.json({
      success: true,
      data: {
        surveys,
        averageScores: avgScores[0],
        pagination: {
          page: pageNum,
          limit: limitNum
        }
      }
    });

  } catch (error) {
    console.error('Error fetching satisfaction surveys:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch satisfaction surveys' 
    });
  }
});

/**
 * POST /api/seller-ratings/satisfaction
 * Create a satisfaction survey
 */
router.post('/satisfaction', async (req, res) => {
  try {
    const surveyData: InsertSatisfactionSurvey = req.body;

    const survey = await db
      .insert(satisfactionSurveys)
      .values(surveyData)
      .returning();

    res.json({
      success: true,
      data: survey[0]
    });

  } catch (error) {
    console.error('Error creating satisfaction survey:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create satisfaction survey' 
    });
  }
});

// ============================================
// 📈 ANALYTICS & REPORTING ENDPOINTS
// ============================================

/**
 * GET /api/seller-ratings/analytics/overview
 * Get system-wide rating analytics
 */
router.get('/analytics/overview', async (req, res) => {
  try {
    const { timeframe = '30d' } = req.query;

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    
    switch (timeframe) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }

    // Get overall statistics
    const overallStats = await db
      .select({
        totalSellers: count(sellerRatings.id),
        avgRating: avg(sellerRatings.overallRating),
        totalReviews: sql`SUM(${sellerRatings.totalReviews})`,
        avgDeliveryDays: avg(sellerRatings.avgDeliveryDays)
      })
      .from(sellerRatings);

    // Get rating distribution
    const ratingDistribution = await db
      .select({
        rating: sql`FLOOR(${sellerRatings.overallRating})`,
        count: count()
      })
      .from(sellerRatings)
      .groupBy(sql`FLOOR(${sellerRatings.overallRating})`)
      .orderBy(sql`FLOOR(${sellerRatings.overallRating})`);

    // Get top performers
    const topPerformers = await db
      .select({
        sellerId: sellerRatings.sellerId,
        sellerName: bookSellers.displayName,
        overallRating: sellerRatings.overallRating,
        totalReviews: sellerRatings.totalReviews
      })
      .from(sellerRatings)
      .leftJoin(bookSellers, eq(sellerRatings.sellerId, bookSellers.id))
      .orderBy(desc(sellerRatings.overallRating))
      .limit(10);

    // Get recent activity
    const recentReviews = await db
      .select({
        id: customerReviews.id,
        sellerId: customerReviews.sellerId,
        sellerName: bookSellers.displayName,
        rating: customerReviews.overallRating,
        title: customerReviews.reviewTitle,
        createdAt: customerReviews.createdAt
      })
      .from(customerReviews)
      .leftJoin(bookSellers, eq(customerReviews.sellerId, bookSellers.id))
      .where(gte(customerReviews.createdAt, startDate))
      .orderBy(desc(customerReviews.createdAt))
      .limit(20);

    res.json({
      success: true,
      data: {
        overview: overallStats[0],
        ratingDistribution,
        topPerformers,
        recentActivity: recentReviews,
        timeframe,
        dateRange: { startDate, endDate }
      }
    });

  } catch (error) {
    console.error('Error fetching analytics overview:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch analytics overview' 
    });
  }
});

/**
 * GET /api/seller-ratings/analytics/trends/:sellerId
 * Get performance trends for a specific seller
 */
router.get('/analytics/trends/:sellerId', async (req, res) => {
  try {
    const { sellerId } = req.params;
    const { period = 'monthly' } = req.query;

    // Get performance metrics history
    const trends = await db
      .select()
      .from(performanceMetrics)
      .where(
        and(
          eq(performanceMetrics.sellerId, sellerId),
          eq(performanceMetrics.periodType, period as string)
        )
      )
      .orderBy(performanceMetrics.periodStart)
      .limit(12); // Last 12 periods

    // Get review trends
    const reviewTrends = await db
      .select({
        month: sql`DATE_TRUNC('month', ${customerReviews.createdAt})`,
        avgRating: avg(customerReviews.overallRating),
        count: count()
      })
      .from(customerReviews)
      .where(eq(customerReviews.sellerId, sellerId))
      .groupBy(sql`DATE_TRUNC('month', ${customerReviews.createdAt})`)
      .orderBy(sql`DATE_TRUNC('month', ${customerReviews.createdAt})`)
      .limit(12);

    res.json({
      success: true,
      data: {
        performanceTrends: trends,
        reviewTrends,
        period
      }
    });

  } catch (error) {
    console.error('Error fetching seller trends:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch seller trends' 
    });
  }
});

/**
 * GET /api/seller-ratings/analytics/comparison
 * Compare multiple sellers
 */
router.get('/analytics/comparison', async (req, res) => {
  try {
    const { sellerIds } = req.query;

    if (!sellerIds) {
      return res.status(400).json({
        success: false,
        error: 'sellerIds parameter is required'
      });
    }

    const sellerIdArray = (sellerIds as string).split(',');

    // Get ratings for comparison
    const ratings = await db
      .select({
        rating: sellerRatings,
        seller: {
          id: bookSellers.id,
          displayName: bookSellers.displayName,
          tier: bookSellers.tier
        }
      })
      .from(sellerRatings)
      .leftJoin(bookSellers, eq(sellerRatings.sellerId, bookSellers.id))
      .where(sql`${sellerRatings.sellerId} = ANY(${sellerIdArray})`);

    // Calculate benchmarks
    const benchmarks = await db
      .select({
        avgOverallRating: avg(sellerRatings.overallRating),
        avgDeliverySpeed: avg(sellerRatings.deliverySpeedRating),
        avgCustomerService: avg(sellerRatings.customerServiceRating),
        avgBookCondition: avg(sellerRatings.bookConditionRating)
      })
      .from(sellerRatings);

    res.json({
      success: true,
      data: {
        sellers: ratings,
        benchmarks: benchmarks[0],
        comparisonDate: new Date()
      }
    });

  } catch (error) {
    console.error('Error fetching seller comparison:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch seller comparison' 
    });
  }
});

// ============================================
// 🎯 AUTOMATION & UTILITY ENDPOINTS
// ============================================

/**
 * POST /api/seller-ratings/automation/daily-calculation
 * Run daily rating calculations for all sellers
 */
router.post('/automation/daily-calculation', async (req, res) => {
  try {
    // Get all sellers
    const sellers = await db
      .select({ id: bookSellers.id })
      .from(bookSellers)
      .where(eq(bookSellers.isActive, true));

    const results = [];

    // Calculate ratings for each seller
    for (const seller of sellers) {
      try {
        // This would normally be a background job
        await fetch(`/api/seller-ratings/calculate/${seller.id}`, { method: 'POST' });
        results.push({ sellerId: seller.id, success: true });
      } catch (error) {
        results.push({ sellerId: seller.id, success: false, error: error.message });
      }
    }

    res.json({
      success: true,
      data: {
        processedSellers: sellers.length,
        successfulCalculations: results.filter(r => r.success).length,
        failedCalculations: results.filter(r => !r.success).length,
        results
      }
    });

  } catch (error) {
    console.error('Error running daily calculations:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to run daily calculations' 
    });
  }
});

/**
 * POST /api/seller-ratings/templates/seed
 * Seed Vietnamese review templates
 */
router.post('/templates/seed', async (req, res) => {
  try {
    const templates = [];

    // Create templates for each quality level and region
    const qualityLevels = ['excellent', 'good', 'average', 'poor'];
    const regions = ['Miền Bắc', 'Miền Trung', 'Miền Nam', 'universal'];

    for (const quality of qualityLevels) {
      for (const region of regions) {
        const template = REVIEW_TEMPLATES[quality];
        if (template && template.titles[region]) {
          templates.push({
            templateName: `${quality}_${region}`,
            templateCategory: quality,
            region,
            languageStyle: region === 'Miền Bắc' ? 'formal' : region === 'Miền Nam' ? 'casual' : 'regional',
            titleTemplates: template.titles[region],
            contentTemplates: template.content_templates[region] || [],
            ratingRange: template.ratings,
            isActive: true
          });
        }
      }
    }

    // Insert templates
    const insertedTemplates = await db
      .insert(vietnameseReviewTemplates)
      .values(templates)
      .returning();

    res.json({
      success: true,
      data: {
        insertedCount: insertedTemplates.length,
        templates: insertedTemplates
      }
    });

  } catch (error) {
    console.error('Error seeding review templates:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to seed review templates' 
    });
  }
});

export default router;