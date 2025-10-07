import { Router, Request, Response } from 'express';
import { storage } from '../storage';
import { db } from '../db';
import { customers, affiliateLandingPages, affiliateClicks, orders, products } from '@shared/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { AffiliateService } from '../services/affiliate-service';
import { z } from 'zod';

const router = Router();

// Middleware: Check if customer is logged in
const requireCustomerAuth = (req: Request, res: Response, next: any) => {
  const session = req.session as any;
  if (!session || !session.userId) {
    return res.status(401).json({
      error: 'Not authenticated',
      message: 'Please log in first'
    });
  }
  next();
};

// CSRF protection for state-changing operations
const requireCSRFToken = (req: any, res: any, next: any) => {
  // For development, allow all requests
  if (process.env.NODE_ENV === 'development') {
    next();
    return;
  }
  
  const csrfToken = req.headers['x-csrf-token'] || req.body.csrfToken;
  const sessionCSRF = req.session.csrfToken;
  
  if (!csrfToken || !sessionCSRF || csrfToken !== sessionCSRF) {
    return res.status(403).json({ 
      error: "CSRF token invalid", 
      message: "Invalid or missing CSRF token" 
    });
  }
  
  next();
};

// Middleware: Check if customer is active affiliate
const requireActiveAffiliate = async (req: Request, res: Response, next: any) => {
  try {
    const session = req.session as any;
    if (!session?.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const customer = await storage.getCustomer(session.userId);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Check if customer is affiliate and active
    const isAffiliate = customer.isAffiliate || customer.customerRole?.includes('affiliate');
    const isActive = customer.affiliateStatus === 'active';

    if (!isAffiliate || !isActive) {
      return res.status(403).json({
        error: 'Not an active affiliate',
        message: 'You need to be an approved affiliate to access this'
      });
    }

    // Attach customer to request
    (req as any).customer = customer;
    next();
  } catch (error) {
    console.error('❌ Affiliate auth error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * 📝 POST /api/affiliate/apply
 * Simple affiliate registration - just click button, no form
 */
router.post('/apply', requireCustomerAuth, requireCSRFToken, async (req: Request, res: Response) => {
  try {
    const session = req.session as any;
    const customerId = session.userId;
    
    // Get customer
    const customer = await storage.getCustomer(customerId);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Check if already affiliate
    if (customer.isAffiliate || customer.customerRole?.includes('affiliate')) {
      return res.json({
        success: true,
        status: customer.affiliateStatus || 'pending',
        message: customer.affiliateStatus === 'active' 
          ? 'You are already an active affiliate' 
          : 'Your affiliate application is pending approval'
      });
    }

    // Add affiliate role to customerRole array
    const currentRoles = customer.customerRole || [];
    const newRoles = currentRoles.includes('affiliate') 
      ? currentRoles 
      : [...(currentRoles as any), 'affiliate'];

    // Update customer with affiliate role and pending status
    await db.update(customers)
      .set({
        isAffiliate: true,
        customerRole: newRoles as any,
        affiliateStatus: 'pending', // Use dedicated affiliateStatus field
        affiliateCode: `AFF${Date.now().toString(36).toUpperCase()}`, // Generate code
        commissionRate: '10', // Default 10%
      })
      .where(eq(customers.id, customerId));

    res.json({
      success: true,
      status: 'pending',
      message: 'Affiliate application submitted successfully. Waiting for admin approval.'
    });

  } catch (error) {
    console.error('❌ Affiliate apply error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * 👤 GET /api/affiliate/me
 * Get affiliate profile and status
 */
router.get('/me', requireCustomerAuth, async (req: Request, res: Response) => {
  try {
    const session = req.session as any;
    const customerId = session.userId;
    
    const customer = await storage.getCustomer(customerId);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Check if is affiliate
    const isAffiliate = customer.isAffiliate || customer.customerRole?.includes('affiliate');
    if (!isAffiliate) {
      return res.json({
        isAffiliate: false,
        message: 'Not an affiliate'
      });
    }

    // Get affiliate status from dedicated field
    const status = customer.affiliateStatus || 'pending';

    res.json({
      isAffiliate: true,
      status,
      profile: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        affiliateCode: customer.affiliateCode,
        commissionRate: parseFloat(customer.commissionRate || '10'),
        joinDate: customer.joinDate
      }
    });

  } catch (error) {
    console.error('❌ Get affiliate profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * 📊 GET /api/affiliate/me/dashboard
 * Dashboard stats for affiliate
 */
router.get('/me/dashboard', requireActiveAffiliate, async (req: Request, res: Response) => {
  try {
    const customer = (req as any).customer;

    // Get landing pages stats
    const [landingPages] = await db
      .select({
        totalPages: sql<number>`count(*)::int`,
        totalClicks: sql<number>`sum(${affiliateLandingPages.totalClicks})::int`,
        totalOrders: sql<number>`sum(${affiliateLandingPages.totalOrders})::int`,
        totalRevenue: sql<string>`sum(${affiliateLandingPages.totalRevenue})`,
      })
      .from(affiliateLandingPages)
      .where(eq(affiliateLandingPages.affiliateId, customer.id));

    // Get orders stats
    const [ordersStats] = await db
      .select({
        totalOrders: sql<number>`count(*)::int`,
        totalRevenue: sql<string>`sum(${orders.total})`,
        totalCommission: sql<string>`sum(${orders.affiliateCommission})`,
      })
      .from(orders)
      .where(eq(orders.affiliateId, customer.id));

    const commission = parseFloat(customer.commissionRate || '10');
    
    res.json({
      success: true,
      data: {
        affiliate: {
          id: customer.id,
          name: customer.name,
          affiliateCode: customer.affiliateCode,
          commissionRate: commission
        },
        stats: {
          totalLandingPages: landingPages?.totalPages || 0,
          totalClicks: landingPages?.totalClicks || 0,
          totalOrders: ordersStats?.totalOrders || 0,
          totalRevenue: parseFloat(ordersStats?.totalRevenue || '0'),
          totalCommission: parseFloat(ordersStats?.totalCommission || '0'),
          conversionRate: landingPages?.totalClicks > 0 
            ? ((ordersStats?.totalOrders || 0) / (landingPages?.totalClicks || 1) * 100).toFixed(2)
            : '0.00'
        }
      }
    });

  } catch (error) {
    console.error('❌ Dashboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * 🛍️ GET /api/affiliate/me/products
 * Get products with commission preview for affiliate
 */
router.get('/me/products', requireActiveAffiliate, async (req: Request, res: Response) => {
  try {
    const customer = (req as any).customer;
    const { search, category, limit = 50 } = req.query;

    // Get products
    const allProducts = await storage.getProducts(
      parseInt(limit as string),
      category as string,
      search as string,
      0
    );

    const commission = parseFloat(customer.commissionRate || '10');

    // Add commission info to each product
    const productsWithCommission = allProducts.map((product: any) => {
      const price = parseFloat(product.price);
      const commissionAmount = price * (commission / 100);

      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        price,
        priceFormatted: new Intl.NumberFormat('vi-VN', { 
          style: 'currency', 
          currency: 'VND' 
        }).format(price),
        imageUrl: product.imageUrl,
        categoryId: product.categoryId,
        commission: {
          rate: commission,
          amount: commissionAmount,
          amountFormatted: new Intl.NumberFormat('vi-VN', { 
            style: 'currency', 
            currency: 'VND' 
          }).format(commissionAmount)
        }
      };
    });

    res.json({
      success: true,
      data: {
        products: productsWithCommission,
        affiliateCode: customer.affiliateCode,
        commissionRate: commission
      }
    });

  } catch (error) {
    console.error('❌ Products error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * 🎨 POST /api/affiliate/me/landing-pages
 * Create landing page from product
 */
router.post('/me/landing-pages', requireActiveAffiliate, requireCSRFToken, async (req: Request, res: Response) => {
  try {
    const customer = (req as any).customer;
    const { 
      productId, 
      title, 
      customPrice, 
      heroTitle, 
      heroSubtitle,
      features,
      autoSeedingEnabled = false
    } = req.body;

    // Validate required fields
    if (!productId || !title) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'productId and title are required'
      });
    }

    // Get product to generate slug
    const product = await storage.getProduct(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Generate unique slug with affiliate code
    const baseSlug = product.slug || product.name.toLowerCase().replace(/\s+/g, '-');
    let affiliateSlug = `${baseSlug}-${customer.affiliateCode?.toLowerCase()}`;
    
    // Check slug uniqueness and add suffix if needed
    let slugSuffix = 0;
    let finalSlug = affiliateSlug;
    while (true) {
      const existing = await storage.getProductLandingPageBySlug(finalSlug);
      if (!existing) break;
      slugSuffix++;
      finalSlug = `${affiliateSlug}-${slugSuffix}`;
    }

    // Create landing page with affiliate tracking
    const landingPage = await storage.createProductLandingPage({
      title,
      slug: finalSlug,
      productId,
      customPrice: customPrice || product.price,
      originalPrice: product.price,
      heroTitle: heroTitle || title,
      heroSubtitle: heroSubtitle || product.description,
      features: features || [],
      affiliateId: customer.id,
      affiliateCode: customer.affiliateCode,
      autoSeedingEnabled: autoSeedingEnabled || false,
      isActive: true,
      theme: 'light',
      primaryColor: '#007bff',
      contactInfo: {
        phone: customer.phone || '',
        email: customer.email || '',
        businessName: customer.name || ''
      },
      paymentMethods: {
        cod: true,
        bankTransfer: true,
        online: false
      }
    });

    res.json({
      success: true,
      data: {
        ...landingPage,
        publicUrl: `/p/${landingPage.slug}`,
        shareUrl: `/p/${landingPage.slug}?ref=${landingPage.affiliateCode}`
      },
      message: 'Landing page created successfully'
    });

  } catch (error) {
    console.error('❌ Create landing page error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * 📋 GET /api/affiliate/me/landing-pages
 * Get affiliate's landing pages with stats
 */
router.get('/me/landing-pages', requireActiveAffiliate, async (req: Request, res: Response) => {
  try {
    const customer = (req as any).customer;

    // Get all landing pages for this affiliate
    const allPages = await storage.getAllProductLandingPages();
    const affiliatePages = allPages.filter((page: any) => page.affiliateId === customer.id);

    // Add URLs and stats
    const pagesWithDetails = affiliatePages.map((page: any) => ({
      ...page,
      publicUrl: `/p/${page.slug}`,
      shareUrl: `/p/${page.slug}?ref=${page.affiliateCode || customer.affiliateCode}`, // Use page's affiliateCode
      performance: {
        views: page.viewCount || 0,
        orders: page.orderCount || 0,
        conversionRate: parseFloat(page.conversionRate || '0'),
        estimatedEarnings: (page.orderCount || 0) * parseFloat(page.customPrice || '0') * (parseFloat(customer.commissionRate || '10') / 100)
      }
    }));

    res.json({
      success: true,
      data: {
        landingPages: pagesWithDetails,
        total: pagesWithDetails.length,
        affiliateCode: customer.affiliateCode
      }
    });

  } catch (error) {
    console.error('❌ Get landing pages error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * 🔄 PUT /api/affiliate/me/landing-pages/:id
 * Update affiliate's landing page
 */
router.put('/me/landing-pages/:id', requireActiveAffiliate, requireCSRFToken, async (req: Request, res: Response) => {
  try {
    const customer = (req as any).customer;
    const { id } = req.params;

    // Verify ownership
    const landingPage = await storage.getProductLandingPageById(id);
    if (!landingPage) {
      return res.status(404).json({ error: 'Landing page not found' });
    }
    
    if (landingPage.affiliateId !== customer.id) {
      return res.status(403).json({ error: 'You can only update your own landing pages' });
    }

    // Whitelist of updatable fields - SECURITY: prevent changing affiliateId, affiliateCode, productId, slug
    const allowedFields = [
      'title', 'description', 'customPrice', 'originalPrice',
      'heroTitle', 'heroSubtitle', 'heroImage', 'callToAction',
      'features', 'testimonials', 'autoSeedingEnabled',
      'isActive', 'theme', 'primaryColor', 'themeConfigId', 'advancedThemeConfig',
      'contactInfo', 'paymentMethods'
    ];
    
    const updateData: any = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    // Update landing page
    const updated = await storage.updateProductLandingPage(id, updateData);

    res.json({
      success: true,
      data: updated,
      message: 'Landing page updated successfully'
    });

  } catch (error) {
    console.error('❌ Update landing page error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * 🗑️ DELETE /api/affiliate/me/landing-pages/:id
 * Delete affiliate's landing page
 */
router.delete('/me/landing-pages/:id', requireActiveAffiliate, requireCSRFToken, async (req: Request, res: Response) => {
  try {
    const customer = (req as any).customer;
    const { id } = req.params;

    // Verify ownership
    const landingPage = await storage.getProductLandingPageById(id);
    if (!landingPage) {
      return res.status(404).json({ error: 'Landing page not found' });
    }
    
    if (landingPage.affiliateId !== customer.id) {
      return res.status(403).json({ error: 'You can only delete your own landing pages' });
    }

    // Delete landing page
    await storage.deleteProductLandingPage(id);

    res.json({
      success: true,
      message: 'Landing page deleted successfully'
    });

  } catch (error) {
    console.error('❌ Delete landing page error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * 📦 POST /api/affiliate/me/create-order
 * Create order directly for customer (Affiliate creates order for customer via portal)
 * This is earning method #1: Direct order creation
 */
router.post('/me/create-order', requireActiveAffiliate, requireCSRFToken, async (req: Request, res: Response) => {
  try {
    const customer = (req as any).customer; // The affiliate
    const { phone, productId, quantity, shippingAddress, customerName, note } = req.body;

    // Validate input
    if (!phone || !productId || !quantity) {
      return res.status(400).json({ 
        error: 'Missing required fields: phone, productId, quantity' 
      });
    }

    // Validate and coerce quantity to positive integer
    const qty = Math.max(1, Math.floor(Number(quantity)));
    if (isNaN(qty) || qty < 1) {
      return res.status(400).json({ 
        error: 'Quantity must be a positive number' 
      });
    }

    // Get product details
    const product = await storage.getProduct(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check stock
    if (product.stock < qty) {
      return res.status(400).json({ 
        error: `Insufficient stock. Available: ${product.stock}` 
      });
    }

    // Lookup or create customer by phone
    let orderCustomer = await storage.getCustomerByPhone(phone);
    if (!orderCustomer) {
      // Create new customer
      orderCustomer = await storage.createCustomer({
        phone,
        name: customerName || `Customer ${phone}`,
        email: `${phone}@affiliate-order.local`,
        status: 'active'
      });
    }

    // Calculate order total
    const unitPrice = parseFloat(product.price);
    const subtotal = unitPrice * qty;
    const shippingFee = 5.00; // Default shipping fee
    const total = subtotal + shippingFee;

    // Calculate affiliate commission (on subtotal only, excluding shipping)
    const commissionRate = parseFloat(customer.commissionRate || '10') / 100;
    const affiliateCommission = (subtotal * commissionRate).toFixed(2);

    // Create order with affiliate tracking
    const orderData: any = {
      customerId: orderCustomer.id,
      items: [{
        productId: product.id,
        productName: product.name,
        quantity: qty,
        price: unitPrice
      }],
      subtotal: subtotal.toString(),
      shippingFee: shippingFee.toString(),
      total: total.toString(),
      shippingInfo: {
        address: shippingAddress || '',
        phone: orderCustomer.phone,
        name: orderCustomer.name,
        note: note || ''
      },
      status: 'pending',
      affiliateId: customer.id,
      affiliateCommission,
      paymentStatus: 'pending',
      paymentMethod: 'cod' // Default to cash on delivery for affiliate orders
    };

    const order = await storage.createOrder(orderData);

    res.json({
      success: true,
      data: {
        order,
        commission: {
          rate: `${(commissionRate * 100).toFixed(0)}%`,
          amount: affiliateCommission,
          currency: 'VND'
        },
        customer: {
          id: orderCustomer.id,
          name: orderCustomer.name,
          phone: orderCustomer.phone
        }
      },
      message: 'Order created successfully'
    });

  } catch (error) {
    console.error('❌ Create affiliate order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * 📊 GET /api/affiliate/me/orders
 * Get list of orders created by this affiliate
 */
router.get('/me/orders', requireActiveAffiliate, async (req: Request, res: Response) => {
  try {
    const customer = (req as any).customer;
    const { status, limit = 50, offset = 0 } = req.query;

    // Get all orders for this affiliate
    const allOrders = await storage.getOrders();
    let affiliateOrders = allOrders.filter((order: any) => order.affiliateId === customer.id);

    // Filter by status if provided
    if (status && status !== 'all') {
      affiliateOrders = affiliateOrders.filter((order: any) => order.status === status);
    }

    // Sort by created date (newest first)
    affiliateOrders.sort((a: any, b: any) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });

    // Paginate
    const paginatedOrders = affiliateOrders.slice(
      parseInt(offset as string), 
      parseInt(offset as string) + parseInt(limit as string)
    );

    // Calculate statistics
    const totalOrders = affiliateOrders.length;
    const totalCommission = affiliateOrders.reduce((sum: number, order: any) => 
      sum + parseFloat(order.affiliateCommission || '0'), 0
    );
    const pendingCommission = affiliateOrders
      .filter((order: any) => order.status === 'pending' || order.status === 'confirmed')
      .reduce((sum: number, order: any) => sum + parseFloat(order.affiliateCommission || '0'), 0);
    const paidCommission = affiliateOrders
      .filter((order: any) => order.status === 'delivered')
      .reduce((sum: number, order: any) => sum + parseFloat(order.affiliateCommission || '0'), 0);

    res.json({
      success: true,
      data: {
        orders: paginatedOrders,
        pagination: {
          total: totalOrders,
          limit: parseInt(limit as string),
          offset: parseInt(offset as string)
        },
        summary: {
          totalOrders,
          totalCommission: totalCommission.toFixed(2),
          pendingCommission: pendingCommission.toFixed(2),
          paidCommission: paidCommission.toFixed(2)
        }
      }
    });

  } catch (error) {
    console.error('❌ Get affiliate orders error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * 💰 GET /api/affiliate/me/earnings
 * Get commission earnings history
 */
router.get('/me/earnings', requireActiveAffiliate, async (req: Request, res: Response) => {
  try {
    const customer = (req as any).customer;
    const { startDate, endDate } = req.query;

    // Get all orders for this affiliate
    const allOrders = await storage.getOrders();
    let affiliateOrders = allOrders.filter((order: any) => order.affiliateId === customer.id);

    // Filter by date range if provided
    if (startDate) {
      affiliateOrders = affiliateOrders.filter((order: any) => 
        new Date(order.createdAt) >= new Date(startDate as string)
      );
    }
    if (endDate) {
      affiliateOrders = affiliateOrders.filter((order: any) => 
        new Date(order.createdAt) <= new Date(endDate as string)
      );
    }

    // Group by status
    const groupedByStatus = affiliateOrders.reduce((acc: any, order: any) => {
      const status = order.status || 'unknown';
      if (!acc[status]) {
        acc[status] = {
          count: 0,
          commission: 0
        };
      }
      acc[status].count++;
      acc[status].commission += parseFloat(order.affiliateCommission || '0');
      return acc;
    }, {});

    // Calculate totals
    const totalCommission = affiliateOrders.reduce((sum: number, order: any) => 
      sum + parseFloat(order.affiliateCommission || '0'), 0
    );

    // Group by month for trend analysis
    const monthlyEarnings = affiliateOrders.reduce((acc: any, order: any) => {
      const month = new Date(order.createdAt).toISOString().slice(0, 7); // YYYY-MM
      if (!acc[month]) {
        acc[month] = {
          orders: 0,
          commission: 0
        };
      }
      acc[month].orders++;
      acc[month].commission += parseFloat(order.affiliateCommission || '0');
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        summary: {
          totalCommission: totalCommission.toFixed(2),
          totalOrders: affiliateOrders.length,
          averageCommissionPerOrder: (totalCommission / (affiliateOrders.length || 1)).toFixed(2),
          commissionRate: customer.commissionRate || '10'
        },
        byStatus: Object.entries(groupedByStatus).map(([status, data]: [string, any]) => ({
          status,
          count: data.count,
          commission: data.commission.toFixed(2)
        })),
        monthlyTrend: Object.entries(monthlyEarnings)
          .map(([month, data]: [string, any]) => ({
            month,
            orders: data.orders,
            commission: data.commission.toFixed(2)
          }))
          .sort((a, b) => b.month.localeCompare(a.month))
      }
    });

  } catch (error) {
    console.error('❌ Get affiliate earnings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * 📈 GET /api/affiliate/me/landing-pages/:id/stats
 * Get detailed stats for a specific landing page
 */
router.get('/me/landing-pages/:id/stats', requireActiveAffiliate, async (req: Request, res: Response) => {
  try {
    const customer = (req as any).customer;
    const { id } = req.params;

    // Verify ownership
    const landingPage = await storage.getProductLandingPageById(id);
    if (!landingPage) {
      return res.status(404).json({ error: 'Landing page not found' });
    }
    
    if (landingPage.affiliateId !== customer.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get click tracking data
    // Note: We would need a storage function to get clicks by landingPageId
    // For now, return landing page metrics
    const stats = {
      landingPage: {
        id: landingPage.id,
        title: landingPage.title,
        slug: landingPage.slug,
        isActive: landingPage.isActive,
        createdAt: landingPage.createdAt
      },
      performance: {
        views: landingPage.viewCount || 0,
        orders: landingPage.orderCount || 0,
        conversionRate: parseFloat(landingPage.conversionRate || '0'),
        averageOrderValue: landingPage.customPrice || '0'
      },
      urls: {
        public: `/p/${landingPage.slug}`,
        share: `/p/${landingPage.slug}?ref=${landingPage.affiliateCode}`
      }
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('❌ Get landing page stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /me/create-order
 * Create order as affiliate (for customers they refer)
 */
const createOrderSchema = z.object({
  phone: z.string().min(1, 'Phone number is required'),
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int().positive('Quantity must be positive'),
  shippingAddress: z.string().min(1, 'Shipping address is required'),
  customerName: z.string().min(1, 'Customer name is required'),
  note: z.string().optional()
});

router.post('/me/create-order', requireActiveAffiliate, async (req: Request, res: Response) => {
  try {
    const affiliate = (req as any).customer;
    
    // Validate request body
    const validationResult = createOrderSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation error',
        details: validationResult.error.errors
      });
    }

    const { phone, productId, quantity, shippingAddress, customerName, note } = validationResult.data;

    // Get product
    const product = await storage.getProduct(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check stock
    if (product.stock < quantity) {
      return res.status(400).json({ 
        error: 'Insufficient stock',
        available: product.stock
      });
    }

    // Calculate tier and commission
    const affiliateData = affiliate.affiliateData as any || {};
    const totalOrders = affiliateData.totalReferrals || 0;
    const tierInfo = AffiliateService.calculateTier(totalOrders);
    
    const productPrice = parseFloat(product.price.toString());
    const orderTotal = productPrice * quantity;
    const commissionAmount = (orderTotal * tierInfo.commissionRate) / 100;

    // Create order
    const order = await storage.createOrder({
      customerId: affiliate.id,
      total: orderTotal.toString(),
      status: 'pending',
      customerName: customerName,
      customerPhone: phone,
      customerAddress: shippingAddress,
      items: [{
        productId: productId,
        productName: product.name,
        quantity: quantity,
        price: productPrice.toString()
      }],
      source: 'affiliate_created',
      notes: note || '',
      affiliateCode: affiliate.affiliateCode
    });

    // Create affiliate order entry
    await storage.createAffiliateOrder({
      affiliateId: affiliate.id,
      orderId: order.id,
      productId: productId,
      orderType: 'created',
      commissionAmount: commissionAmount.toString(),
      commissionRate: tierInfo.commissionRate.toString(),
      orderTotal: orderTotal.toString(),
      status: 'pending'
    });

    // Update affiliate stats
    const updatedAffiliateData = {
      ...affiliateData,
      totalReferrals: totalOrders + 1,
      totalRevenue: (parseFloat(affiliateData.totalRevenue || '0') + orderTotal).toString()
    };

    await storage.updateCustomer(affiliate.id, {
      affiliateData: updatedAffiliateData
    });

    res.json({
      success: true,
      data: {
        orderId: order.id,
        commission: {
          amount: commissionAmount,
          rate: tierInfo.commissionRate
        }
      }
    });

  } catch (error) {
    console.error('❌ Create order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as affiliateLandingRouter };
