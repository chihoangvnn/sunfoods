import { Request, Response, Router } from 'express';
import { storage } from '../storage';
import { requireAffiliateAuth, loadAffiliateData } from './affiliate-auth';
import { CommissionService } from '../services/commission-service';
import { AffiliateService } from '../services/affiliate-service';
import { z } from 'zod';

const router = Router();

// Apply affiliate authentication middleware to all routes
router.use(requireAffiliateAuth);
router.use(loadAffiliateData);

// Validation schemas
const profileUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255).optional(),
  email: z.string().email('Invalid email format').optional(),
  phone: z.string().optional(),
  avatar: z.string().url('Invalid avatar URL').optional(),
});

const paymentInfoSchema = z.object({
  bankName: z.string().min(1, 'Bank name is required').max(255).optional(),
  accountNumber: z.string().min(1, 'Account number is required').max(50).optional(),
  accountName: z.string().min(1, 'Account name is required').max(255).optional(),
  paymentMethod: z.enum(['bank_transfer', 'momo', 'zalopay', 'paypal']).optional(),
  paymentNotes: z.string().max(500).optional(),
});

// Vietnamese currency formatter
function formatVietnameseCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
}

// Helper function to calculate conversion rate
function calculateConversionRate(referrals: number, orders: number): number {
  if (referrals === 0) return 0;
  return Math.round((orders / referrals) * 100 * 100) / 100; // Round to 2 decimal places
}

/**
 * 📊 GET /api/affiliate-portal/dashboard
 * Dashboard stats and overview for logged-in affiliate
 */
router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const affiliate = req.affiliate!;
    
    // Get affiliate metadata and calculate tier
    const affiliateCustomer = await storage.getCustomer(affiliate.id);
    const affiliateData = affiliateCustomer?.affiliateData as any || {};
    const totalOrders = affiliateData.totalReferrals || 0;
    const tierInfo = AffiliateService.calculateTier(totalOrders);
    
    // Get commission summary from affiliate_orders table
    const affiliateOrders = await storage.getAffiliateOrdersByAffiliateId(affiliate.id);
    
    const totalEarnings = affiliateOrders.reduce((sum, order) => 
      sum + parseFloat(order.commissionAmount || '0'), 0
    );
    const pendingEarnings = affiliateOrders
      .filter(order => order.status === 'pending')
      .reduce((sum, order) => sum + parseFloat(order.commissionAmount || '0'), 0);
    const paidEarnings = affiliateOrders
      .filter(order => order.status === 'paid')
      .reduce((sum, order) => sum + parseFloat(order.commissionAmount || '0'), 0);
    const totalReferrals = affiliateOrders.length;
    const totalRevenue = affiliateOrders.reduce((sum, order) => 
      sum + parseFloat(order.orderTotal || '0'), 0
    );
    const conversionRate = calculateConversionRate(
      affiliateData.totalClicks || 0, 
      totalReferrals
    );

    // Get recent orders (last 10)
    const recentOrderIds = affiliateOrders
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10)
      .map(ao => ao.orderId);
    
    const orders = await Promise.all(
      recentOrderIds.map(id => storage.getOrder(id))
    );
    
    const recentActivity = orders
      .filter(o => o)
      .map(order => ({
        id: order!.id,
        customerName: order!.customerName || 'N/A',
        total: parseFloat(order!.total.toString()),
        status: order!.status,
        createdAt: order!.createdAt,
        productName: (order!.orderItems?.[0] as any)?.productName || 'N/A'
      }));

    // Growth metrics (last 30 days vs previous 30 days)
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const recent30DaysOrders = affiliateOrders.filter(order => 
      new Date(order.createdAt) >= thirtyDaysAgo
    );
    const previous30DaysOrders = affiliateOrders.filter(order => 
      new Date(order.createdAt) >= sixtyDaysAgo && 
      new Date(order.createdAt) < thirtyDaysAgo
    );

    const currentPeriodRevenue = recent30DaysOrders.reduce((sum, order) => 
      sum + parseFloat(order.orderTotal || '0'), 0
    );
    const previousPeriodRevenue = previous30DaysOrders.reduce((sum, order) => 
      sum + parseFloat(order.orderTotal || '0'), 0
    );

    const revenueGrowth = previousPeriodRevenue > 0 
      ? ((currentPeriodRevenue - previousPeriodRevenue) / previousPeriodRevenue) * 100 
      : 0;

    res.json({
      success: true,
      data: {
        affiliate: {
          id: affiliate.id,
          name: affiliate.name,
          email: affiliate.email,
          affiliateCode: affiliate.affiliateCode,
          commissionRate: tierInfo.commissionRate,
          tier: tierInfo.tierName,
          joinDate: affiliateCustomer?.joinDate,
          status: affiliate.affiliateStatus
        },
        metrics: {
          totalEarnings: totalEarnings,
          pendingEarnings: pendingEarnings,
          paidEarnings: paidEarnings,
          totalReferrals: totalReferrals,
          totalRevenue: totalRevenue,
          conversionRate: conversionRate,
          revenueGrowth: Math.round(revenueGrowth * 100) / 100
        },
        recentActivity: recentActivity,
        quickStats: {
          ordersThisMonth: recent30DaysOrders.length,
          revenueThisMonth: currentPeriodRevenue,
          averageOrderValue: totalReferrals > 0 ? totalRevenue / totalReferrals : 0
        },
        tierInfo: tierInfo
      }
    });

  } catch (error) {
    console.error('❌ Dashboard error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to load dashboard data'
    });
  }
});

/**
 * 💰 GET /api/affiliate-portal/earnings
 * Commission history and earnings data for logged-in affiliate
 */
router.get('/earnings', async (req: Request, res: Response) => {
  try {
    const affiliate = req.affiliate!;
    const { limit = 50, offset = 0, status } = req.query;
    
    // Get commission history from service
    const commissionHistory = await CommissionService.getCommissionHistory(affiliate.id);
    const commissionSummary = await CommissionService.getCommissionSummary(affiliate.id);
    
    if (!commissionSummary) {
      return res.status(404).json({
        error: 'Affiliate earnings data not found'
      });
    }

    // Filter by status if provided
    let filteredHistory = commissionHistory;
    if (status && ['pending', 'paid'].includes(status as string)) {
      // Note: Commission history doesn't track individual payment status
      // This would need to be enhanced based on business requirements
      filteredHistory = commissionHistory;
    }

    // Apply pagination
    const limitNum = Math.min(parseInt(limit as string) || 50, 100);
    const offsetNum = parseInt(offset as string) || 0;
    const paginatedHistory = filteredHistory.slice(offsetNum, offsetNum + limitNum);

    // Format earnings data
    const earnings = paginatedHistory.map((entry: any) => ({
      id: entry.orderId,
      orderId: entry.orderId,
      orderTotal: entry.orderTotal,
      orderTotalFormatted: formatVietnameseCurrency(entry.orderTotal),
      commissionAmount: entry.commissionAmount,
      commissionAmountFormatted: formatVietnameseCurrency(entry.commissionAmount),
      commissionRate: entry.commissionRate,
      processedAt: entry.processedAt,
      orderStatus: entry.orderStatus,
      status: 'pending' // All earnings start as pending until manually marked as paid
    }));

    // Calculate totals
    const totalCommissionEarned = commissionSummary.totalCommissionEarned || 0;
    const totalCommissionPaid = commissionSummary.totalCommissionPaid || 0;
    const totalCommissionPending = commissionSummary.totalCommissionPending || 0;

    res.json({
      success: true,
      data: {
        summary: {
          totalEarned: totalCommissionEarned,
          totalEarnedFormatted: formatVietnameseCurrency(totalCommissionEarned),
          totalPaid: totalCommissionPaid,
          totalPaidFormatted: formatVietnameseCurrency(totalCommissionPaid),
          totalPending: totalCommissionPending,
          totalPendingFormatted: formatVietnameseCurrency(totalCommissionPending),
          commissionRate: commissionSummary.commissionRate,
          totalReferrals: commissionSummary.totalReferrals
        },
        earnings: earnings,
        pagination: {
          total: filteredHistory.length,
          limit: limitNum,
          offset: offsetNum,
          hasMore: offsetNum + limitNum < filteredHistory.length
        }
      }
    });

  } catch (error) {
    console.error('❌ Earnings error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to load earnings data'
    });
  }
});

/**
 * 📈 GET /api/affiliate-portal/stats
 * Performance metrics (conversion rates, referrals) for logged-in affiliate
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const affiliate = req.affiliate!;
    const { period = '30' } = req.query; // days
    
    const periodDays = Math.min(parseInt(period as string) || 30, 365);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodDays);
    
    // Get affiliate data and orders
    const affiliateCustomer = await storage.getCustomer(affiliate.id);
    const affiliateData = affiliateCustomer?.affiliateData as any || {};
    
    // Get orders for the period
    const periodOrders = await storage.getStorefrontOrdersByAffiliateCodeAndDateRange(
      affiliate.affiliateCode, startDate, new Date()
    );

    // Calculate daily stats for the period
    const dailyStats = [];
    for (let i = periodDays - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayOrders = periodOrders.filter((order: any) => {
        const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
        return orderDate === dateStr;
      });
      
      const dayRevenue = dayOrders.reduce((sum: number, order: any) => 
        sum + parseFloat(order.total.toString()), 0
      );
      
      dailyStats.push({
        date: dateStr,
        orders: dayOrders.length,
        revenue: dayRevenue,
        revenueFormatted: formatVietnameseCurrency(dayRevenue)
      });
    }

    // Calculate performance metrics
    const totalClicks = affiliateData.totalClicks || 0;
    const totalReferrals = periodOrders.length;
    const totalRevenue = periodOrders.reduce((sum: number, order: any) => 
      sum + parseFloat(order.total.toString()), 0
    );
    
    const conversionRate = calculateConversionRate(totalClicks, totalReferrals);
    const averageOrderValue = totalReferrals > 0 ? totalRevenue / totalReferrals : 0;
    
    // Top performing products
    const productPerformance = new Map();
    periodOrders.forEach((order: any) => {
      const productId = order.productId;
      const productName = order.productName;
      const revenue = parseFloat(order.total.toString());
      
      if (productPerformance.has(productId)) {
        const existing = productPerformance.get(productId);
        existing.orders += 1;
        existing.revenue += revenue;
      } else {
        productPerformance.set(productId, {
          productId,
          productName,
          orders: 1,
          revenue
        });
      }
    });
    
    const topProducts = Array.from(productPerformance.values())
      .sort((a: any, b: any) => b.revenue - a.revenue)
      .slice(0, 10)
      .map((product: any) => ({
        ...product,
        revenueFormatted: formatVietnameseCurrency(product.revenue)
      }));

    // Calculate trends (compare with previous period)
    const previousStartDate = new Date(startDate);
    previousStartDate.setDate(previousStartDate.getDate() - periodDays);
    
    const previousPeriodOrders = await storage.getStorefrontOrdersByAffiliateCodeAndDateRange(
      affiliate.affiliateCode, previousStartDate, startDate
    );
    
    const previousRevenue = previousPeriodOrders.reduce((sum: number, order: any) => 
      sum + parseFloat(order.total.toString()), 0
    );
    
    const revenueGrowth = previousRevenue > 0 
      ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 
      : 0;
    
    const ordersGrowth = previousPeriodOrders.length > 0 
      ? ((totalReferrals - previousPeriodOrders.length) / previousPeriodOrders.length) * 100 
      : 0;

    res.json({
      success: true,
      data: {
        period: {
          days: periodDays,
          startDate: startDate.toISOString(),
          endDate: new Date().toISOString()
        },
        metrics: {
          totalReferrals: totalReferrals,
          totalRevenue: totalRevenue,
          totalRevenueFormatted: formatVietnameseCurrency(totalRevenue),
          conversionRate: conversionRate,
          averageOrderValue: averageOrderValue,
          averageOrderValueFormatted: formatVietnameseCurrency(averageOrderValue),
          totalClicks: totalClicks,
          clickThroughRate: totalClicks > 0 ? (totalReferrals / totalClicks) * 100 : 0
        },
        trends: {
          revenueGrowth: Math.round(revenueGrowth * 100) / 100,
          ordersGrowth: Math.round(ordersGrowth * 100) / 100
        },
        dailyStats: dailyStats,
        topProducts: topProducts
      }
    });

  } catch (error) {
    console.error('❌ Stats error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to load performance stats'
    });
  }
});

/**
 * 🛍️ GET /api/affiliate-portal/orders
 * Orders attributed to this affiliate
 */
router.get('/orders', async (req: Request, res: Response) => {
  try {
    const affiliate = req.affiliate!;
    const { 
      limit = 50, 
      offset = 0, 
      status, 
      startDate, 
      endDate,
      search 
    } = req.query;
    
    const limitNum = Math.min(parseInt(limit as string) || 50, 100);
    const offsetNum = parseInt(offset as string) || 0;
    
    // Build filters
    const filters: any = {
      affiliateCode: affiliate.affiliateCode
    };
    
    if (status && typeof status === 'string') {
      filters.status = status;
    }
    
    if (startDate && typeof startDate === 'string') {
      filters.startDate = new Date(startDate);
    }
    
    if (endDate && typeof endDate === 'string') {
      filters.endDate = new Date(endDate);
    }
    
    if (search && typeof search === 'string') {
      filters.search = search;
    }

    // Get orders for this affiliate
    const orders = await storage.getStorefrontOrdersByAffiliateCodeWithFilters(
      filters, limitNum, offsetNum
    );
    
    // Get total count for pagination
    const totalCount = await storage.getStorefrontOrdersCountByAffiliateCode(
      affiliate.affiliateCode, filters
    );

    // Format orders data
    const formattedOrders = orders.map((order: any) => ({
      id: order.id,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      customerEmail: order.customerEmail,
      productId: order.productId,
      productName: order.productName,
      quantity: order.quantity,
      price: parseFloat(order.price.toString()),
      priceFormatted: formatVietnameseCurrency(parseFloat(order.price.toString())),
      total: parseFloat(order.total.toString()),
      totalFormatted: formatVietnameseCurrency(parseFloat(order.total.toString())),
      status: order.status,
      deliveryType: order.deliveryType,
      customerAddress: order.customerAddress,
      notes: order.notes,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      // Calculate commission for this order
      commissionAmount: parseFloat(order.total.toString()) * (parseFloat(affiliate.commissionRate) / 100),
      commissionAmountFormatted: formatVietnameseCurrency(
        parseFloat(order.total.toString()) * (parseFloat(affiliate.commissionRate) / 100)
      )
    }));

    // Calculate summary
    const totalRevenue = formattedOrders.reduce((sum: number, order: any) => sum + order.total, 0);
    const totalCommission = formattedOrders.reduce((sum: number, order: any) => sum + order.commissionAmount, 0);

    res.json({
      success: true,
      data: {
        orders: formattedOrders,
        summary: {
          totalOrders: totalCount,
          totalRevenue: totalRevenue,
          totalRevenueFormatted: formatVietnameseCurrency(totalRevenue),
          totalCommission: totalCommission,
          totalCommissionFormatted: formatVietnameseCurrency(totalCommission),
          averageOrderValue: formattedOrders.length > 0 ? totalRevenue / formattedOrders.length : 0,
          averageOrderValueFormatted: formattedOrders.length > 0 
            ? formatVietnameseCurrency(totalRevenue / formattedOrders.length)
            : formatVietnameseCurrency(0)
        },
        pagination: {
          total: totalCount,
          limit: limitNum,
          offset: offsetNum,
          hasMore: offsetNum + limitNum < totalCount
        }
      }
    });

  } catch (error) {
    console.error('❌ Orders error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to load orders data'
    });
  }
});

/**
 * 🔗 GET /api/affiliate-portal/links
 * Generate affiliate links for products
 */
router.get('/links', async (req: Request, res: Response) => {
  try {
    const affiliate = req.affiliate!;
    const { productId, categoryId, search, limit = 20 } = req.query;
    
    const limitNum = Math.min(parseInt(limit as string) || 20, 100);
    
    // Get products based on filters
    let products = [];
    
    if (productId && typeof productId === 'string') {
      // Get specific product
      const product = await storage.getProduct(productId);
      if (product) {
        products = [product];
      }
    } else {
      // Get products with filters
      products = await storage.getProducts(
        limitNum,
        categoryId as string,
        search as string,
        0
      );
    }

    // Get storefront config for link generation
    const storefrontConfigs = await storage.getStorefrontConfigs();
    const defaultStorefront = storefrontConfigs.find((config: any) => config.isDefault) || storefrontConfigs[0];
    
    if (!defaultStorefront) {
      return res.status(500).json({
        error: 'No storefront configuration found',
        message: 'Please contact administrator to set up storefront'
      });
    }

    // Generate affiliate links for products
    const affiliateLinks = products.map((product: any) => {
      const baseUrl = defaultStorefront.customDomain || `${process.env.DOMAIN || 'localhost:5000'}/storefront/${defaultStorefront.name}`;
      const affiliateLink = `${baseUrl}/product/${product.slug || product.id}?aff=${affiliate.affiliateCode}`;
      
      return {
        productId: product.id,
        productName: product.name,
        productSlug: product.slug,
        productPrice: parseFloat(product.price.toString()),
        productPriceFormatted: formatVietnameseCurrency(parseFloat(product.price.toString())),
        productImage: product.imageUrl,
        categoryId: product.categoryId,
        affiliateLink: affiliateLink,
        shortLink: affiliateLink, // Could implement URL shortening service here
        commissionAmount: parseFloat(product.price.toString()) * (parseFloat(affiliate.commissionRate) / 100),
        commissionAmountFormatted: formatVietnameseCurrency(
          parseFloat(product.price.toString()) * (parseFloat(affiliate.commissionRate) / 100)
        ),
        createdAt: new Date().toISOString()
      };
    });

    // Get categories for filter options
    const categories = await storage.getCategories();

    res.json({
      success: true,
      data: {
        affiliateCode: affiliate.affiliateCode,
        commissionRate: parseFloat(affiliate.commissionRate),
        storefrontUrl: defaultStorefront.customDomain || `${process.env.DOMAIN || 'localhost:5000'}/storefront/${defaultStorefront.name}`,
        links: affiliateLinks,
        categories: categories.map((cat: any) => ({
          id: cat.id,
          name: cat.name,
          slug: cat.slug
        })),
        linkUsageInstructions: {
          howToUse: "Share these links with your customers. When they make a purchase using your link, you'll earn commission.",
          trackingInfo: "All clicks and purchases are automatically tracked using your affiliate code.",
          commissionNote: `You earn ${affiliate.commissionRate}% commission on each sale through your links.`
        }
      }
    });

  } catch (error) {
    console.error('❌ Links error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to generate affiliate links'
    });
  }
});

/**
 * 👤 PUT /api/affiliate-portal/profile
 * Update affiliate profile information
 */
router.put('/profile', async (req: Request, res: Response) => {
  try {
    const affiliate = req.affiliate!;
    
    // Validate request body
    const parseResult = profileUpdateSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: 'Invalid input',
        details: parseResult.error.errors
      });
    }

    const updateData = parseResult.data;

    // Check if email is being updated and is unique
    if (updateData.email && updateData.email !== affiliate.email) {
      const existingCustomer = await storage.getCustomerByEmail(updateData.email);
      if (existingCustomer && existingCustomer.id !== affiliate.id) {
        return res.status(400).json({
          error: 'Email already in use',
          message: 'This email address is already associated with another account'
        });
      }
    }

    // Update customer record
    const updatedCustomer = await storage.updateCustomer(affiliate.id, updateData);
    
    if (!updatedCustomer) {
      return res.status(404).json({
        error: 'Affiliate not found'
      });
    }

    // Update affiliate data with last updated timestamp
    const currentAffiliateData = updatedCustomer.affiliateData as any || {};
    const updatedAffiliateData = {
      ...currentAffiliateData,
      lastProfileUpdate: new Date().toISOString(),
      profileUpdateHistory: [
        ...(currentAffiliateData.profileUpdateHistory || []),
        {
          updatedAt: new Date().toISOString(),
          fields: Object.keys(updateData)
        }
      ].slice(-10) // Keep last 10 updates
    };

    await storage.updateCustomer(affiliate.id, {
      affiliateData: updatedAffiliateData
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: updatedCustomer.id,
        name: updatedCustomer.name,
        email: updatedCustomer.email,
        phone: updatedCustomer.phone,
        avatar: updatedCustomer.avatar,
        affiliateCode: updatedCustomer.affiliateCode,
        commissionRate: parseFloat(updatedCustomer.commissionRate?.toString() || '5.00'),
        affiliateStatus: updatedCustomer.affiliateStatus,
        joinDate: updatedCustomer.joinDate,
        membershipTier: updatedCustomer.membershipTier
      }
    });

  } catch (error) {
    console.error('❌ Profile update error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update profile'
    });
  }
});

/**
 * 💳 GET /api/affiliate-portal/payment-info
 * Get payment settings for logged-in affiliate
 */
router.get('/payment-info', async (req: Request, res: Response) => {
  try {
    const affiliate = req.affiliate!;
    
    // Get current customer data
    const customer = await storage.getCustomer(affiliate.id);
    if (!customer) {
      return res.status(404).json({
        error: 'Affiliate not found'
      });
    }

    const affiliateData = customer.affiliateData as any || {};
    const paymentInfo = affiliateData.paymentInfo || {};

    res.json({
      success: true,
      data: {
        paymentInfo: {
          bankName: paymentInfo.bankName || '',
          accountNumber: paymentInfo.accountNumber || '',
          accountName: paymentInfo.accountName || '',
          paymentMethod: paymentInfo.paymentMethod || 'bank_transfer',
          paymentNotes: paymentInfo.paymentNotes || '',
          lastUpdated: paymentInfo.lastUpdated || null
        },
        paymentHistory: {
          totalPaid: affiliateData.totalCommissionPaid || 0,
          totalPaidFormatted: formatVietnameseCurrency(affiliateData.totalCommissionPaid || 0),
          totalPending: affiliateData.totalCommissionPending || 0,
          totalPendingFormatted: formatVietnameseCurrency(affiliateData.totalCommissionPending || 0),
          lastPaymentAt: affiliateData.lastPaymentAt || null,
          lastPaymentAmount: affiliateData.lastPaymentAmount || 0,
          lastPaymentAmountFormatted: formatVietnameseCurrency(affiliateData.lastPaymentAmount || 0),
          lastPaymentReference: affiliateData.lastPaymentReference || ''
        },
        availablePaymentMethods: [
          { value: 'bank_transfer', label: 'Chuyển khoản ngân hàng' },
          { value: 'momo', label: 'Ví MoMo' },
          { value: 'zalopay', label: 'Ví ZaloPay' },
          { value: 'paypal', label: 'PayPal' }
        ]
      }
    });

  } catch (error) {
    console.error('❌ Payment info error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to load payment information'
    });
  }
});

/**
 * 💳 PUT /api/affiliate-portal/payment-info
 * Update payment information for logged-in affiliate
 */
router.put('/payment-info', async (req: Request, res: Response) => {
  try {
    const affiliate = req.affiliate!;
    
    // Validate request body
    const parseResult = paymentInfoSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: 'Invalid input',
        details: parseResult.error.errors
      });
    }

    const updateData = parseResult.data;

    // Get current affiliate data
    const customer = await storage.getCustomer(affiliate.id);
    if (!customer) {
      return res.status(404).json({
        error: 'Affiliate not found'
      });
    }

    const currentAffiliateData = customer.affiliateData as any || {};
    const currentPaymentInfo = currentAffiliateData.paymentInfo || {};

    // Update payment info
    const updatedPaymentInfo = {
      ...currentPaymentInfo,
      ...updateData,
      lastUpdated: new Date().toISOString()
    };

    // Update affiliate data
    const updatedAffiliateData = {
      ...currentAffiliateData,
      paymentInfo: updatedPaymentInfo,
      paymentInfoHistory: [
        ...(currentAffiliateData.paymentInfoHistory || []),
        {
          updatedAt: new Date().toISOString(),
          fields: Object.keys(updateData),
          previousPaymentMethod: currentPaymentInfo.paymentMethod
        }
      ].slice(-10) // Keep last 10 updates
    };

    // Save to database
    await storage.updateCustomer(affiliate.id, {
      affiliateData: updatedAffiliateData
    });

    res.json({
      success: true,
      message: 'Payment information updated successfully',
      data: {
        paymentInfo: updatedPaymentInfo,
        updatedFields: Object.keys(updateData)
      }
    });

  } catch (error) {
    console.error('❌ Payment info update error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update payment information'
    });
  }
});

/**
 * 🚀 POST /api/affiliate-portal/quick-order
 * Create a quick order for a customer (affiliate creates order on behalf of customer)
 */
router.post('/quick-order', async (req: Request, res: Response) => {
  try {
    const affiliate = req.affiliate!;
    const { customerPhone, customerName, customerAddress, productId, quantity } = req.body;

    // Validate required fields
    if (!customerPhone || !customerName || !customerAddress || !productId || !quantity) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['customerPhone', 'customerName', 'customerAddress', 'productId', 'quantity']
      });
    }

    // Get product details
    const product = await storage.getProduct(productId.toString());
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Get default storefront config (or create one if none exists)
    const storefronts = await storage.getStorefrontConfigs();
    let storefrontConfig = storefronts.find((s: any) => s.isActive);
    if (!storefrontConfig) {
      // Use first storefront or create default
      storefrontConfig = storefronts[0];
      if (!storefrontConfig) {
        return res.status(400).json({ 
          error: 'No storefront configured. Please contact admin.' 
        });
      }
    }

    // Calculate order totals
    const productPrice = parseFloat(product.price.toString());
    const qty = parseInt(quantity);
    const total = productPrice * qty;

    // Calculate commission
    const commissionRate = parseFloat(affiliate.commissionRate) / 100;
    const commission = total * commissionRate;

    // Create storefront order with affiliate tracking
    const order = await storage.createStorefrontOrder({
      storefrontConfigId: storefrontConfig.id,
      customerName,
      customerPhone,
      customerAddress,
      productId: product.id.toString(),
      productName: product.name,
      quantity: qty,
      price: productPrice.toString(),
      total: total.toString(),
      deliveryType: 'cod_shipping',
      status: 'pending',
      affiliateCode: affiliate.affiliateCode,
    });

    res.json({
      success: true,
      message: 'Order created successfully',
      orderId: order.id,
      commission: commission,
      total: total,
      data: {
        order: {
          id: order.id,
          customerName: customerName,
          productName: product.name,
          quantity: qty,
          total: total,
          commission: commission,
        }
      }
    });

  } catch (error) {
    console.error('❌ Quick order creation error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create quick order'
    });
  }
});

/**
 * 📦 GET /api/affiliate-portal/products
 * Product catalog synced from admin inventory with tier-based commission
 */
router.get('/products', async (req: Request, res: Response) => {
  try {
    const affiliate = req.affiliate!;
    const { search, categoryId, limit = 50, offset = 0 } = req.query;
    
    // Get affiliate tier using AffiliateService
    const affiliateCustomer = await storage.getCustomer(affiliate.id);
    const affiliateData = affiliateCustomer?.affiliateData as any || {};
    const totalOrders = affiliateData.totalReferrals || 0;
    
    // Calculate tier-based commission rate (Bronze 5%, Silver 7%, Gold 10%, Platinum 12%)
    const tierInfo = AffiliateService.calculateTier(totalOrders);
    
    // Get all active products from admin inventory
    const allProducts = await storage.getProducts();
    
    // Filter by status and stock
    let products = allProducts.filter((p: any) => 
      p.status === 'active' && parseInt(p.stock?.toString() || '0') > 0
    );
    
    // Apply search filter
    if (search && typeof search === 'string') {
      const searchLower = search.toLowerCase();
      products = products.filter((p: any) => 
        p.name?.toLowerCase().includes(searchLower) ||
        p.description?.toLowerCase().includes(searchLower) ||
        p.sku?.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply category filter
    if (categoryId && typeof categoryId === 'string') {
      products = products.filter((p: any) => p.categoryId === categoryId);
    }
    
    // Pagination
    const total = products.length;
    const limitNum = parseInt(limit as string);
    const offsetNum = parseInt(offset as string);
    products = products.slice(offsetNum, offsetNum + limitNum);
    
    // Format products with commission and stock info
    const formattedProducts = products.map((product: any) => {
      const price = parseFloat(product.price.toString());
      const stock = parseInt(product.stock?.toString() || '0');
      const commission = (price * tierInfo.commissionRate) / 100;
      
      return {
        productId: product.id,
        productName: product.name,
        productSku: product.sku,
        productDescription: product.description,
        productPrice: price,
        productStock: stock,
        productImage: product.image || (product.images?.[0]?.url),
        productCategory: product.categoryId,
        commissionRate: tierInfo.commissionRate,
        commissionType: 'percentage',
        commissionAmount: commission,
        assignmentType: 'default',
        isPremium: false
      };
    });
    
    // Get categories for filter
    const categories = await storage.getCategories();
    
    res.json({
      success: true,
      data: {
        products: formattedProducts,
        tierInfo: tierInfo,
        stats: {
          totalProducts: total,
          totalCommissionRate: tierInfo.commissionRate
        },
        pagination: {
          total: total,
          limit: limitNum,
          offset: offsetNum,
          hasMore: offsetNum + limitNum < total
        },
        categories: categories.map((c: any) => ({
          id: c.id,
          name: c.name,
          slug: c.slug
        }))
      }
    });
    
  } catch (error) {
    console.error('❌ Products fetch error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to load products'
    });
  }
});

/**
 * 📝 POST /api/affiliate-portal/products/request
 * Affiliate request new product to sell
 */
router.post('/products/request', async (req: Request, res: Response) => {
  try {
    const affiliate = req.affiliate!;
    const { 
      productName, 
      productDescription, 
      productLink, 
      suggestedPrice, 
      categoryId,
      requestReason 
    } = req.body;
    
    // Validation
    if (!productName || productName.trim().length === 0) {
      return res.status(400).json({
        error: 'Tên sản phẩm không được để trống'
      });
    }
    
    // Create product request
    const request = await storage.createAffiliateProductRequest({
      affiliateId: affiliate.id,
      productName: productName.trim(),
      productDescription: productDescription?.trim(),
      productLink: productLink?.trim(),
      suggestedPrice: suggestedPrice ? suggestedPrice.toString() : null,
      categoryId: categoryId || null,
      requestReason: requestReason?.trim(),
      status: 'pending'
    });
    
    res.json({
      success: true,
      message: 'Đã gửi yêu cầu thành công! Admin sẽ xem xét và phản hồi sớm.',
      data: {
        requestId: request.id,
        productName: request.productName,
        status: request.status,
        createdAt: request.createdAt
      }
    });
    
  } catch (error) {
    console.error('❌ Product request error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Không thể gửi yêu cầu. Vui lòng thử lại sau.'
    });
  }
});

/**
 * 📋 GET /api/affiliate-portal/products/requests
 * Get affiliate's product request history
 */
router.get('/products/requests', async (req: Request, res: Response) => {
  try {
    const affiliate = req.affiliate!;
    const { status, limit = 20, offset = 0 } = req.query;
    
    const requests = await storage.getAffiliateProductRequests(affiliate.id, {
      status: status as string,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    });
    
    const formattedRequests = requests.map((r: any) => ({
      id: r.id,
      productName: r.productName,
      productDescription: r.productDescription,
      productLink: r.productLink,
      suggestedPrice: r.suggestedPrice ? parseFloat(r.suggestedPrice.toString()) : null,
      suggestedPriceFormatted: r.suggestedPrice ? formatVietnameseCurrency(parseFloat(r.suggestedPrice.toString())) : null,
      categoryId: r.categoryId,
      status: r.status,
      statusText: r.status === 'pending' ? 'Đang chờ duyệt' : 
                  r.status === 'approved' ? 'Đã duyệt' : 
                  r.status === 'rejected' ? 'Từ chối' : 'Đang xem xét',
      requestReason: r.requestReason,
      adminNotes: r.adminNotes,
      approvedProductId: r.approvedProductId,
      approvedCommissionRate: r.approvedCommissionRate ? parseFloat(r.approvedCommissionRate.toString()) : null,
      createdAt: r.createdAt,
      reviewedAt: r.reviewedAt
    }));
    
    res.json({
      success: true,
      data: {
        requests: formattedRequests,
        total: formattedRequests.length
      }
    });
    
  } catch (error) {
    console.error('❌ Product requests fetch error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Không thể tải danh sách yêu cầu'
    });
  }
});

export default router;