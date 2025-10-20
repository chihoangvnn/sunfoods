// @ts-nocheck
/**
 * 🌟 SELLER RATING & FEEDBACK SYSTEM API
 * Vietnamese book marketplace seller rating system with REAL DATABASE INTEGRATION
 */

import { Router } from 'express';
import { db } from '../db';
import { eq, desc, count, avg, sql } from 'drizzle-orm';
import { 
  bookSellers, 
  sellerRatings, 
  vietnameseReviewTemplates, 
  userSatisfactionScores,
  customerReviews
} from '../../shared/schema';

const router = Router();

// ============================================
// 🌟 CORE SELLER RATING ENDPOINTS
// ============================================

/**
 * GET /api/seller-ratings/overview
 * Get rating system overview and statistics from REAL DATABASE
 */
router.get('/overview', async (req, res) => {
  try {
    // Get actual seller statistics
    const sellersResult = await db
      .select({ count: count() })
      .from(bookSellers);

    // Get actual rating statistics
    const ratingsResult = await db
      .select({ 
        totalRatings: sql<number>`COALESCE(SUM(${sellerRatings.totalRatings}), 0)`,
        totalReviews: sql<number>`COALESCE(SUM(${sellerRatings.totalReviews}), 0)`,
        avgRating: sql<number>`COALESCE(AVG(${sellerRatings.overallRating}), 0)`
      })
      .from(sellerRatings);

    // Get template statistics
    const templatesResult = await db
      .select({ count: count() })
      .from(vietnameseReviewTemplates)
      .where(eq(vietnameseReviewTemplates.isActive, true));

    const totalSellers = sellersResult[0]?.count || 0;
    const ratingStats = ratingsResult[0] || { totalRatings: 0, totalReviews: 0, avgRating: 0 };
    const totalTemplates = templatesResult[0]?.count || 0;

    const overview = {
      success: true,
      data: {
        totalSellers,
        totalReviews: ratingStats.totalReviews,
        totalRatings: ratingStats.totalRatings,
        averageRating: Number(Number(ratingStats.avgRating).toFixed(2)),
        totalTemplates,
        systemStatus: totalTemplates > 0 ? 'operational' : 'needs_initialization',
        featuresAvailable: [
          'Vietnamese review generation',
          'Multi-dimensional seller ratings',
          'Cultural sensitivity scoring',
          'Regional dialect templates',
          'Performance analytics'
        ],
        databaseStatus: {
          sellersTable: totalSellers > 0 ? 'populated' : 'empty',
          ratingsTable: ratingStats.totalRatings > 0 ? 'populated' : 'empty',
          templatesTable: totalTemplates > 0 ? 'populated' : 'empty'
        }
      }
    };

    res.json(overview);
  } catch (error) {
    console.error('Error fetching rating overview:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch rating overview'
    });
  }
});

/**
 * GET /api/seller-ratings/vietnamese-templates
 * Get Vietnamese review templates from REAL DATABASE
 */
router.get('/vietnamese-templates', async (req, res) => {
  try {
    // Get templates using direct SQL to avoid schema mapping issues
    const result = await db.execute(sql`
      SELECT 
        id,
        template_name,
        template_category,
        region_dialect,
        book_category,
        review_title_template,
        review_content_template,
        sentiment_score,
        formality_level,
        usage_count
      FROM vietnamese_review_templates 
      WHERE is_active = true 
      ORDER BY sentiment_score DESC
    `);

    const templates = result.rows;

    // Group templates by category using actual database column names
    const groupedTemplates = templates.reduce((acc: any, template: any) => {
      const category = template.template_category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push({
        id: template.id,
        name: template.template_name,
        title: template.review_title_template,
        content: template.review_content_template,
        region: template.region_dialect,
        bookCategory: template.book_category,
        sentimentScore: template.sentiment_score,
        formalityLevel: template.formality_level,
        usageCount: template.usage_count || 0
      });
      return acc;
    }, {} as Record<string, any[]>);

    const response = {
      success: true,
      data: {
        templates: groupedTemplates,
        totalTemplates: templates.length,
        categories: Object.keys(groupedTemplates),
        scoringDimensions: {
          deliverySpeed: 'Tốc độ giao hàng',
          bookCondition: 'Tình trạng sách',
          customerService: 'Dịch vụ khách hàng',
          pricing: 'Giá cả hợp lý',
          culturalSensitivity: 'Phù hợp văn hóa'
        }
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching Vietnamese templates:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch Vietnamese review templates'
    });
  }
});

/**
 * GET /api/seller-ratings/sellers
 * Get list of sellers with their actual ratings from database
 */
router.get('/sellers', async (req, res) => {
  try {
    // Get sellers with rating data using direct SQL to avoid schema mapping issues
    const result = await db.execute(sql`
      SELECT 
        bs.id,
        bs.seller_id,
        bs.display_name,
        bs.business_name,
        bs.tier,
        bs.is_active,
        bs.total_sales,
        bs.total_orders,
        bs.avg_rating,
        bs.current_books,
        sr.overall_rating,
        sr.total_reviews,
        sr.total_ratings,
        sr.delivery_speed_rating,
        sr.book_condition_rating,
        sr.customer_service_rating,
        sr.cultural_sensitivity_rating,
        sr.response_time_hours,
        sr.fulfillment_accuracy_percent
      FROM book_sellers bs
      LEFT JOIN seller_ratings sr ON bs.id = sr.seller_id
      WHERE bs.is_active = true
      ORDER BY sr.overall_rating DESC NULLS LAST, bs.created_at DESC
      LIMIT 50
    `);

    const sellersWithRatings = result.rows;

    res.json({
      success: true,
      data: sellersWithRatings,
      count: sellersWithRatings.length
    });
  } catch (error) {
    console.error('Error fetching sellers with ratings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch sellers with ratings'
    });
  }
});

/**
 * POST /api/seller-ratings/seed-templates
 * Seed Vietnamese review templates into database
 */
router.post('/seed-templates', async (req, res) => {
  try {
    // Check if templates already exist
    const existingTemplates = await db
      .select({ count: count() })
      .from(vietnameseReviewTemplates);

    if (existingTemplates[0]?.count > 0) {
      return res.json({
        success: true,
        message: `Templates already exist (${existingTemplates[0].count} templates)`,
        alreadySeeded: true
      });
    }

    // Vietnamese review templates with CORRECT DATABASE COLUMN NAMES
    const templates = [
      {
        templateName: 'Dịch vụ xuất sắc Miền Bắc',
        templateCategory: 'excellent',
        regionDialect: 'Miền Bắc',
        bookCategory: 'general',
        reviewTitleTemplate: 'Shop uy tín, sách chất lượng!',
        reviewContentTemplate: 'Shop bán hàng rất uy tín, sách đẹp như mới. Giao hàng nhanh, đóng gói cẩn thận. Sẽ ủng hộ shop lâu dài!',
        sentimentScore: 4.8,
        formalityLevel: 'casual',
        ageGroup: 'adult',
        isActive: true
      },
      {
        templateName: 'Dịch vụ tuyệt vời Miền Nam',
        templateCategory: 'excellent',
        regionDialect: 'Miền Nam',
        bookCategory: 'general',
        reviewTitleTemplate: 'Rất hài lòng với shop!',
        reviewContentTemplate: 'Chất lượng sách tốt, giá cả hợp lý. Chủ shop tư vấn nhiệt tình, giao hàng đúng hẹn. Recommend shop này!',
        sentimentScore: 4.9,
        formalityLevel: 'casual',
        ageGroup: 'adult',
        isActive: true
      },
      {
        templateName: 'Đánh giá tốt',
        templateCategory: 'good',
        regionDialect: 'Miền Trung',
        bookCategory: 'textbook',
        reviewTitleTemplate: 'Khá ổn, sẽ mua lại',
        reviewContentTemplate: 'Sách chất lượng tốt, đóng gói cẩn thận. Thời gian giao hàng hơi lâu một chút nhưng còn acceptable.',
        sentimentScore: 4.2,
        formalityLevel: 'casual',
        ageGroup: 'student',
        isActive: true
      },
      {
        templateName: 'Đánh giá trung bình',
        templateCategory: 'average',
        regionDialect: 'universal',
        bookCategory: 'literature',
        reviewTitleTemplate: 'Tạm được',
        reviewContentTemplate: 'Sách bình thường, có vài chỗ hơi cũ nhưng vẫn đọc được. Giá cả ok.',
        sentimentScore: 3.5,
        formalityLevel: 'casual',
        ageGroup: 'adult',
        isActive: true
      },
      {
        templateName: 'Đánh giá chuyên nghiệp',
        templateCategory: 'excellent',
        regionDialect: 'universal',
        bookCategory: 'professional',
        reviewTitleTemplate: 'Dịch vụ chuyên nghiệp',
        reviewContentTemplate: 'Quý shop cung cấp dịch vụ rất chuyên nghiệp. Sách đầy đủ, chất lượng tốt. Tôi sẽ giới thiệu cho bạn bè.',
        sentimentScore: 4.7,
        formalityLevel: 'formal',
        ageGroup: 'adult',
        isActive: true
      }
    ];

    // Insert templates using direct SQL to avoid schema mapping issues
    const insertPromises = templates.map(template => {
      return db.execute(sql`
        INSERT INTO vietnamese_review_templates (
          template_name,
          template_category,
          region_dialect,
          book_category,
          review_title_template,
          review_content_template,
          sentiment_score,
          formality_level,
          age_group,
          is_active
        ) VALUES (
          ${template.templateName},
          ${template.templateCategory},
          ${template.regionDialect},
          ${template.bookCategory},
          ${template.reviewTitleTemplate},
          ${template.reviewContentTemplate},
          ${template.sentimentScore},
          ${template.formalityLevel},
          ${template.ageGroup},
          ${template.isActive}
        )
      `);
    });

    await Promise.all(insertPromises);

    res.json({
      success: true,
      message: `Seeded ${templates.length} Vietnamese review templates`,
      data: templates
    });
  } catch (error) {
    console.error('Error seeding templates:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to seed Vietnamese review templates'
    });
  }
});

/**
 * GET /api/seller-ratings/analytics
 * Get REAL seller rating analytics from database
 */
router.get('/analytics', async (req, res) => {
  try {
    // Get seller statistics using direct SQL
    const sellersResult = await db.execute(sql`
      SELECT COUNT(*) as count FROM book_sellers
    `);

    // Get actual rating statistics using direct SQL 
    const ratingsStats = await db.execute(sql`
      SELECT 
        COALESCE(SUM(total_ratings), 0) as total_ratings,
        COALESCE(SUM(total_reviews), 0) as total_reviews,
        COALESCE(AVG(overall_rating), 0) as avg_overall_rating,
        COALESCE(AVG(delivery_speed_rating), 0) as avg_delivery_speed,
        COALESCE(AVG(book_condition_rating), 0) as avg_book_condition,
        COALESCE(AVG(customer_service_rating), 0) as avg_customer_service,
        COALESCE(AVG(cultural_sensitivity_rating), 0) as avg_cultural_sensitivity
      FROM seller_ratings
    `);

    // Get top performing sellers using direct SQL
    const topSellers = await db.execute(sql`
      SELECT 
        sr.seller_id,
        bs.display_name,
        sr.overall_rating,
        sr.total_reviews,
        sr.response_time_hours
      FROM seller_ratings sr
      LEFT JOIN book_sellers bs ON sr.seller_id = bs.id
      ORDER BY sr.overall_rating DESC, sr.total_reviews DESC
      LIMIT 5
    `);

    // Get template statistics using direct SQL
    const templatesStats = await db.execute(sql`
      SELECT 
        template_category,
        COUNT(*) as category_count
      FROM vietnamese_review_templates
      WHERE is_active = true
      GROUP BY template_category
    `);

    // Use actual database field names from direct SQL results
    const stats = ratingsStats.rows[0] || {
      total_ratings: 0,
      total_reviews: 0,
      avg_overall_rating: 0,
      avg_delivery_speed: 0,
      avg_book_condition: 0,
      avg_customer_service: 0,
      avg_cultural_sensitivity: 0
    };

    const analytics = {
      success: true,
      data: {
        totalSellers: sellersResult.rows[0]?.count || 0,
        totalReviews: stats.total_reviews,
        totalRatings: stats.total_ratings,
        averageRating: Number(Number(stats.avg_overall_rating || 0).toFixed(2)),
        topPerformingSellers: topSellers.rows,
        performanceMetrics: {
          avgDeliverySpeed: Number(Number(stats.avg_delivery_speed || 0).toFixed(2)),
          avgBookCondition: Number(Number(stats.avg_book_condition || 0).toFixed(2)),
          avgCustomerService: Number(Number(stats.avg_customer_service || 0).toFixed(2)),
          avgCulturalSensitivity: Number(Number(stats.avg_cultural_sensitivity || 0).toFixed(2))
        },
        templatesAvailable: templatesStats.rows.length,
        systemReadiness: {
          databaseConnected: true,
          ratingsTablePopulated: stats.total_ratings > 0,
          templatesSeeded: templatesStats.rows.length > 0,
          apiEndpoints: 'functional'
        }
      }
    };

    res.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics'
    });
  }
});

export default router;