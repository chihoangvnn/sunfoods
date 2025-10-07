/**
 * 📊 SELLER PERFORMANCE ANALYTICS API
 * Comprehensive real-time monitoring dashboard for book seller performance
 * Tracks revenue, sales count, ratings, efficiency metrics
 */

import { Router } from 'express';
import { db } from '../db';
import { sql } from 'drizzle-orm';

const router = Router();

/**
 * GET /api/seller-performance/dashboard
 * Get comprehensive dashboard data for all sellers
 */
router.get('/dashboard', async (req, res) => {
  try {
    // Get overall seller statistics using direct SQL
    const sellerStatsResult = await db.execute(sql`
      SELECT 
        COUNT(*) as total_sellers,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_sellers,
        COALESCE(SUM(total_sales), 0) as total_revenue,
        COALESCE(SUM(total_orders), 0) as total_orders,
        COALESCE(AVG(avg_rating), 0) as average_rating,
        COALESCE(SUM(current_books), 0) as total_inventory
      FROM book_sellers
    `);

    const sellerStats = sellerStatsResult.rows[0];

    // Get seller performance breakdown by tier
    const tierBreakdownResult = await db.execute(sql`
      SELECT 
        tier,
        COUNT(*) as seller_count,
        COALESCE(SUM(total_sales), 0) as tier_revenue,
        COALESCE(AVG(avg_rating), 0) as avg_rating
      FROM book_sellers
      WHERE is_active = true
      GROUP BY tier
      ORDER BY 
        CASE tier
          WHEN 'premium' THEN 1
          WHEN 'top_seller' THEN 2
          WHEN 'professional' THEN 3
          WHEN 'standard' THEN 4
          ELSE 5
        END
    `);

    // Get top performing sellers
    const topSellersResult = await db.execute(sql`
      SELECT 
        bs.id,
        bs.seller_id,
        bs.display_name,
        bs.business_name,
        bs.tier,
        bs.total_sales,
        bs.total_orders,
        bs.avg_rating,
        bs.current_books,
        sr.overall_rating,
        sr.total_reviews,
        sr.delivery_speed_rating,
        sr.customer_service_rating
      FROM book_sellers bs
      LEFT JOIN seller_ratings sr ON bs.id = sr.seller_id
      WHERE bs.is_active = true
      ORDER BY bs.total_sales DESC, bs.avg_rating DESC
      LIMIT 10
    `);

    // Get recent sales trends (last 7 days)
    const salesTrendsResult = await db.execute(sql`
      SELECT 
        DATE(created_at) as sale_date,
        COUNT(*) as order_count,
        COALESCE(SUM(total), 0) as daily_revenue
      FROM book_orders
      WHERE created_at >= NOW() - INTERVAL '7 days'
      GROUP BY DATE(created_at)
      ORDER BY sale_date DESC
    `);

    // Get rating distribution
    const ratingDistributionResult = await db.execute(sql`
      SELECT 
        CASE 
          WHEN avg_rating >= 4.5 THEN '4.5-5.0'
          WHEN avg_rating >= 4.0 THEN '4.0-4.5'
          WHEN avg_rating >= 3.5 THEN '3.5-4.0'
          WHEN avg_rating >= 3.0 THEN '3.0-3.5'
          ELSE 'Below 3.0'
        END as rating_range,
        COUNT(*) as seller_count
      FROM book_sellers
      WHERE is_active = true AND avg_rating > 0
      GROUP BY rating_range
      ORDER BY rating_range DESC
    `);

    // Get efficiency metrics
    const efficiencyMetricsResult = await db.execute(sql`
      SELECT 
        COALESCE(AVG(response_time_hours), 0) as avg_response_time,
        COALESCE(AVG(fulfillment_accuracy_percent), 0) as avg_fulfillment_accuracy,
        COALESCE(AVG(delivery_speed_rating), 0) as avg_delivery_speed,
        COALESCE(AVG(customer_service_rating), 0) as avg_customer_service
      FROM seller_ratings
    `);

    const efficiencyMetrics = efficiencyMetricsResult.rows[0] || {
      avg_response_time: 0,
      avg_fulfillment_accuracy: 0,
      avg_delivery_speed: 0,
      avg_customer_service: 0
    };

    // Format response
    const dashboard = {
      success: true,
      timestamp: new Date().toISOString(),
      data: {
        overview: {
          totalSellers: sellerStats.total_sellers,
          activeSellers: sellerStats.active_sellers,
          totalRevenue: Number(sellerStats.total_revenue || 0),
          totalOrders: Number(sellerStats.total_orders || 0),
          averageRating: Number(Number(sellerStats.average_rating || 0).toFixed(2)),
          totalInventory: Number(sellerStats.total_inventory || 0)
        },
        tierBreakdown: tierBreakdownResult.rows.map((tier: any) => ({
          tier: tier.tier,
          sellerCount: Number(tier.seller_count),
          revenue: Number(tier.tier_revenue || 0),
          averageRating: Number(Number(tier.avg_rating || 0).toFixed(2))
        })),
        topPerformers: topSellersResult.rows.map((seller: any) => ({
          id: seller.id,
          sellerId: seller.seller_id,
          displayName: seller.display_name,
          businessName: seller.business_name,
          tier: seller.tier,
          totalSales: Number(seller.total_sales || 0),
          totalOrders: Number(seller.total_orders || 0),
          avgRating: Number(Number(seller.avg_rating || 0).toFixed(2)),
          currentBooks: Number(seller.current_books || 0),
          overallRating: seller.overall_rating ? Number(Number(seller.overall_rating).toFixed(2)) : null,
          totalReviews: seller.total_reviews || 0,
          deliverySpeed: seller.delivery_speed_rating ? Number(Number(seller.delivery_speed_rating).toFixed(2)) : null,
          customerService: seller.customer_service_rating ? Number(Number(seller.customer_service_rating).toFixed(2)) : null
        })),
        salesTrends: salesTrendsResult.rows.map((day: any) => ({
          date: day.sale_date,
          orderCount: Number(day.order_count),
          revenue: Number(day.daily_revenue || 0)
        })),
        ratingDistribution: ratingDistributionResult.rows.map((range: any) => ({
          range: range.rating_range,
          count: Number(range.seller_count)
        })),
        efficiencyMetrics: {
          avgResponseTime: Number(Number(efficiencyMetrics.avg_response_time || 0).toFixed(2)),
          avgFulfillmentAccuracy: Number(Number(efficiencyMetrics.avg_fulfillment_accuracy || 0).toFixed(2)),
          avgDeliverySpeed: Number(Number(efficiencyMetrics.avg_delivery_speed || 0).toFixed(2)),
          avgCustomerService: Number(Number(efficiencyMetrics.avg_customer_service || 0).toFixed(2))
        }
      }
    };

    res.json(dashboard);
  } catch (error) {
    console.error('Error fetching seller performance dashboard:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch seller performance dashboard'
    });
  }
});

/**
 * GET /api/seller-performance/sellers/:sellerId
 * Get detailed performance analytics for a specific seller
 */
router.get('/sellers/:sellerId', async (req, res) => {
  try {
    const { sellerId } = req.params;

    // Get seller details
    const sellerResult = await db.execute(sql`
      SELECT 
        bs.*,
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
      WHERE bs.id = ${sellerId}
    `);

    if (sellerResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Seller not found'
      });
    }

    const seller = sellerResult.rows[0];

    // Get seller's sales history (last 30 days)
    const salesHistoryResult = await db.execute(sql`
      SELECT 
        DATE(created_at) as order_date,
        COUNT(*) as order_count,
        COALESCE(SUM(total), 0) as daily_revenue
      FROM book_orders
      WHERE seller_id = ${sellerId}
        AND created_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY order_date DESC
    `);

    // Get seller's inventory statistics
    const inventoryStatsResult = await db.execute(sql`
      SELECT 
        COUNT(*) as total_books,
        COUNT(CASE WHEN stock > 0 THEN 1 END) as in_stock_books,
        COUNT(CASE WHEN stock = 0 THEN 1 END) as out_of_stock_books,
        COALESCE(AVG(price), 0) as avg_book_price,
        COALESCE(SUM(stock), 0) as total_stock_units
      FROM book_inventory
      WHERE seller_id = ${sellerId}
    `);

    const inventoryStats = inventoryStatsResult.rows[0] || {};

    // Format response
    const sellerPerformance = {
      success: true,
      data: {
        seller: {
          id: seller.id,
          sellerId: seller.seller_id,
          displayName: seller.display_name,
          businessName: seller.business_name,
          tier: seller.tier,
          isActive: seller.is_active,
          totalSales: Number(seller.total_sales || 0),
          totalOrders: Number(seller.total_orders || 0),
          avgRating: Number(Number(seller.avg_rating || 0).toFixed(2)),
          currentBooks: Number(seller.current_books || 0),
          joinedAt: seller.created_at
        },
        ratings: {
          overallRating: seller.overall_rating ? Number(Number(seller.overall_rating).toFixed(2)) : null,
          totalReviews: seller.total_reviews || 0,
          totalRatings: seller.total_ratings || 0,
          deliverySpeed: seller.delivery_speed_rating ? Number(Number(seller.delivery_speed_rating).toFixed(2)) : null,
          bookCondition: seller.book_condition_rating ? Number(Number(seller.book_condition_rating).toFixed(2)) : null,
          customerService: seller.customer_service_rating ? Number(Number(seller.customer_service_rating).toFixed(2)) : null,
          culturalSensitivity: seller.cultural_sensitivity_rating ? Number(Number(seller.cultural_sensitivity_rating).toFixed(2)) : null
        },
        efficiency: {
          responseTimeHours: seller.response_time_hours ? Number(Number(seller.response_time_hours).toFixed(2)) : null,
          fulfillmentAccuracy: seller.fulfillment_accuracy_percent ? Number(Number(seller.fulfillment_accuracy_percent).toFixed(2)) : null
        },
        salesHistory: salesHistoryResult.rows.map((day: any) => ({
          date: day.order_date,
          orderCount: Number(day.order_count),
          revenue: Number(day.daily_revenue || 0)
        })),
        inventory: {
          totalBooks: Number(inventoryStats.total_books || 0),
          inStockBooks: Number(inventoryStats.in_stock_books || 0),
          outOfStockBooks: Number(inventoryStats.out_of_stock_books || 0),
          avgBookPrice: Number(Number(inventoryStats.avg_book_price || 0).toFixed(2)),
          totalStockUnits: Number(inventoryStats.total_stock_units || 0)
        }
      }
    };

    res.json(sellerPerformance);
  } catch (error) {
    console.error('Error fetching seller performance:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch seller performance'
    });
  }
});

export default router;
