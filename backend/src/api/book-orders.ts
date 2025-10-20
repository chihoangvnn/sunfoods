// @ts-nocheck
import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { storage } from '../storage';
import { bookOrders, bookOrderItems, bookSellers, products } from '../../shared/schema';
import { insertBookOrderSchema, insertBookOrderItemSchema } from '../../shared/schema';
import type { BookOrder, BookOrderItem, InsertBookOrder } from '../../shared/schema';
import { eq, and, desc, like, or, sql } from 'drizzle-orm';
import { vtpOrderIntegration } from '../services/vtp-order-integration';
import { notificationService, VIETNAMESE_ORDER_TEMPLATES } from '../services/notificationService';

const router = Router();

// 🔒 Authentication middleware (reuse from main routes)
const requireAuth = (req: any, res: any, next: any) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ 
      error: "Unauthorized. Please log in to perform sync operations.",
      code: "AUTH_REQUIRED"
    });
  }
  next();
};

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

/**
 * 📚 BOOK ORDERS API - Comprehensive CRUD operations for book order management
 * Cloned from existing orders API with book-specific customizations
 */

// GET /api/book-orders - List book orders with filtering
router.get('/', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;

    // Simple query first - select all from bookOrders only
    const orders = await db.select().from(bookOrders).orderBy(desc(bookOrders.createdAt)).limit(limit);

    // Add enhanced information for response
    const enhancedOrders = orders.map(order => ({
      ...order,
      sourceInfo: {
        source: order.source || 'admin',
        sourceOrderId: order.sourceOrderId || null,
        sourceReference: order.sourceReference || null,
        syncStatus: order.syncStatus || 'manual'
      },
      bookInfo: {
        sellerId: order.sellerId,
        bookSource: order.bookSource,
        isbn: order.isbn,
        condition: order.condition,
        sellerCommission: order.sellerCommission,
        bookMetadata: order.bookMetadata,
        inventoryStatus: order.inventoryStatus
      }
    }));

    res.json(enhancedOrders);
  } catch (error) {
    console.error("Error fetching book orders:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/book-orders/sync/stats - Get book order sync statistics
router.get('/sync/stats', async (req, res) => {
  try {
    const orders = await db.select().from(bookOrders);
    
    const stats = {
      total: orders.length,
      bySource: {
        admin: orders.filter(o => !o.source || o.source === 'admin').length,
        storefront: orders.filter(o => o.source === 'storefront').length,
        'tiktok-shop': orders.filter(o => o.source === 'tiktok-shop').length,
        'landing-page': orders.filter(o => o.source === 'landing-page').length,
        pos: orders.filter(o => o.source === 'pos').length
      },
      bySyncStatus: {
        manual: orders.filter(o => !o.syncStatus || o.syncStatus === 'manual').length,
        synced: orders.filter(o => o.syncStatus === 'synced').length,
        pending: orders.filter(o => o.syncStatus === 'pending').length,
        failed: orders.filter(o => o.syncStatus === 'failed').length
      },
      byCondition: {
        new: orders.filter(o => o.condition === 'new').length,
        like_new: orders.filter(o => o.condition === 'like_new').length,
        very_good: orders.filter(o => o.condition === 'very_good').length,
        good: orders.filter(o => o.condition === 'good').length,
        acceptable: orders.filter(o => o.condition === 'acceptable').length
      },
      byBookSource: {
        abebooks: orders.filter(o => o.bookSource === 'abebooks').length,
        local_inventory: orders.filter(o => o.bookSource === 'local_inventory').length,
        dropship: orders.filter(o => o.bookSource === 'dropship').length,
        consignment: orders.filter(o => o.bookSource === 'consignment').length
      },
      byInventoryStatus: {
        reserved: orders.filter(o => o.inventoryStatus === 'reserved').length,
        allocated: orders.filter(o => o.inventoryStatus === 'allocated').length,
        shipped: orders.filter(o => o.inventoryStatus === 'shipped').length,
        returned: orders.filter(o => o.inventoryStatus === 'returned').length
      },
      totalCommissions: orders.reduce((sum, order) => {
        return sum + parseFloat(order.sellerCommission?.toString() || '0');
      }, 0)
    };
    
    res.json(stats);
  } catch (error) {
    console.error("Error fetching book order sync stats:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/book-orders/:id - Get book order by ID with details
router.get('/:id', async (req, res) => {
  try {
    const [order] = await db
      .select({
        id: bookOrders.id,
        customerNameBook: bookOrders.customerNameBook,
        customerEmailBook: bookOrders.customerEmailBook,
        customerPhoneBook: bookOrders.customerPhoneBook,
        customerAddressBook: bookOrders.customerAddressBook,
        total: bookOrders.total,
        status: bookOrders.status,
        paymentMethod: bookOrders.paymentMethod,
        items: bookOrders.items,
        source: bookOrders.source,
        sourceOrderId: bookOrders.sourceOrderId,
        sourceReference: bookOrders.sourceReference,
        syncStatus: bookOrders.syncStatus,
        syncData: bookOrders.syncData,
        sourceCustomerInfo: bookOrders.sourceCustomerInfo,
        vtpOrderSystemCode: bookOrders.vtpOrderSystemCode,
        vtpStatus: bookOrders.vtpStatus,
        vtpTrackingData: bookOrders.vtpTrackingData,
        // Book-specific fields
        sellerId: bookOrders.sellerId,
        bookSource: bookOrders.bookSource,
        isbn: bookOrders.isbn,
        condition: bookOrders.condition,
        sellerCommission: bookOrders.sellerCommission,
        bookMetadata: bookOrders.bookMetadata,
        inventoryStatus: bookOrders.inventoryStatus,
        createdAt: bookOrders.createdAt,
        updatedAt: bookOrders.updatedAt,
      })
      .from(bookOrders)
      .where(eq(bookOrders.id, req.params.id));

    if (!order) {
      return res.status(404).json({ error: "Book order not found" });
    }

    // Get order items with product details
    const orderItems = await db
      .select({
        id: bookOrderItems.id,
        orderId: bookOrderItems.orderId,
        productId: bookOrderItems.productId,
        quantity: bookOrderItems.quantity,
        price: bookOrderItems.price,
        isbn: bookOrderItems.isbn,
        condition: bookOrderItems.condition,
        sellerPrice: bookOrderItems.sellerPrice,
        marketPrice: bookOrderItems.marketPrice,
        sourceCost: bookOrderItems.sourceCost,
        productName: products.name,
        productSku: products.sku,
        productImage: products.image,
      })
      .from(bookOrderItems)
      .leftJoin(products, eq(bookOrderItems.productId, products.id))
      .where(eq(bookOrderItems.orderId, req.params.id));

    const orderWithDetails = {
      ...order,
      items: orderItems,
      bookInfo: {
        sellerId: order.sellerId,
        bookSource: order.bookSource,
        isbn: order.isbn,
        condition: order.condition,
        sellerCommission: order.sellerCommission,
        bookMetadata: order.bookMetadata,
        inventoryStatus: order.inventoryStatus
      }
    };

    res.json(orderWithDetails);
  } catch (error) {
    console.error("Error fetching book order:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/book-orders - Create new book order
router.post('/', async (req, res) => {
  try {
    console.log("📚 Creating book order with data:", req.body);
    
    // Handle different order creation formats (POS vs Admin)
    let orderData = { ...req.body };
    
    // If items is an array (from POS system), convert to count and store items separately
    let orderItems = [];
    if (Array.isArray(orderData.items)) {
      orderItems = orderData.items;
      orderData.items = orderItems.length;
    }
    
    // Validate the book order data
    const validatedData = insertBookOrderSchema.parse(orderData);
    console.log("✅ Validated book order data:", validatedData);
    
    // Create the book order
    const [order] = await db.insert(bookOrders).values({
      ...validatedData,
      source: validatedData.source || 'admin',
      syncStatus: validatedData.syncStatus || 'manual',
      paymentMethod: validatedData.paymentMethod || 'cash',
      bookSource: validatedData.bookSource || 'local_inventory',
      condition: validatedData.condition || 'new',
      inventoryStatus: validatedData.inventoryStatus || 'reserved'
    }).returning();
    
    console.log("🎯 Created book order:", order.id);
    
    // If we have order items, create them
    if (orderItems.length > 0) {
      console.log("📚 Creating book order items:", orderItems.length);
      for (const item of orderItems) {
        await db.insert(bookOrderItems).values({
          orderId: order.id,
          productId: item.productId,
          quantity: String(item.quantity),
          price: String(item.price),
          isbn: item.isbn,
          condition: item.condition || 'new',
          sellerPrice: String(item.sellerPrice || item.price),
          marketPrice: item.marketPrice ? String(item.marketPrice) : null,
          sourceCost: item.sourceCost ? String(item.sourceCost) : null
        });
      }
    }

    // 📚 SELLER INTEGRATION: Reserve inventory if seller is assigned
    if (order.sellerId) {
      try {
        console.log("📦 Reserving inventory for seller:", order.sellerId);
        const reserveResult = await storage.updateSellerInventoryFromOrder(order.id, 'reserve');
        if (reserveResult) {
          console.log("✅ Inventory reserved successfully for order:", order.id);
        } else {
          console.log("⚠️ Inventory reservation failed for order:", order.id);
        }
      } catch (reserveError) {
        console.error("❌ Error reserving inventory:", reserveError);
        // Non-critical error, continue with order creation
      }
    }

    // 🚚 ViettelPost Auto Shipping Integration (non-blocking)
    try {
      if (order.status === 'paid' || order.status === 'processing') {
        console.log("🚚 Attempting ViettelPost auto shipping for book order:", order.id);
        
        const shippingData = {
          orderId: order.id,
          customerInfo: {
            name: order.sourceCustomerInfo?.name || 'Khách hàng',
            phone: order.sourceCustomerInfo?.phone || '0123456789',
            email: order.sourceCustomerInfo?.email,
            address: order.sourceCustomerInfo?.address || 'Địa chỉ khách hàng',
          },
          productInfo: {
            name: `Sách - Đơn hàng #${order.id.slice(-8)}`,
            totalValue: parseFloat(order.total.toString()),
            totalWeight: undefined,
            items: orderItems.length > 0 ? orderItems.map(item => ({
              name: item.name || `ISBN: ${item.isbn || 'N/A'}`,
              quantity: item.quantity,
              price: item.price,
              isbn: item.isbn,
              condition: item.condition
            })) : [{
              name: `Sách - Đơn hàng #${order.id.slice(-8)}`,
              quantity: 1,
              price: parseFloat(order.total.toString()),
            }],
          },
          shippingOptions: {
            serviceCode: 'VCN',
            paymentMethod: 1,
            note: `Đơn hàng sách e-commerce #${order.id.slice(-8)} - ${order.condition} - ISBN: ${order.isbn || 'N/A'}`,
          }
        };

        const vtpResult = await vtpOrderIntegration.autoCreateShippingForOrder(shippingData);
        
        if (vtpResult.success) {
          console.log("✅ ViettelPost shipping created successfully:", vtpResult.vtpOrderSystemCode);
        } else {
          console.log("⚠️ ViettelPost shipping not created:", vtpResult.error);
        }
      }
    } catch (vtpError) {
      console.error("🚚 ViettelPost integration error (non-critical):", vtpError);
    }
    
    res.status(201).json(order);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("❌ Validation error:", error.errors);
      return res.status(400).json({ error: "Validation error", details: error.errors });
    }
    console.error("❌ Error creating book order:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/book-orders/:id/status - Update book order status
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ error: "Status is required" });
    }
    
    const [order] = await db
      .update(bookOrders)
      .set({ status: status as any, updatedAt: new Date() })
      .where(eq(bookOrders.id, req.params.id))
      .returning();
    
    if (!order) {
      return res.status(404).json({ error: "Book order not found" });
    }

    // 📚 SELLER INTEGRATION: Handle inventory and commission based on status change
    if (order.sellerId) {
      try {
        // Handle inventory updates based on status change
        if (status === 'processing') {
          // Allocate inventory when order is confirmed for processing
          console.log("📦 Allocating inventory for processing order:", order.id);
          await storage.updateSellerInventoryFromOrder(order.id, 'allocate');
        } else if (status === 'shipped') {
          // Update sales stats when shipped
          console.log("🚚 Updating inventory for shipped order:", order.id);
          await storage.updateSellerInventoryFromOrder(order.id, 'ship');
        } else if (status === 'cancelled') {
          // Release reserved inventory if order is cancelled
          console.log("❌ Releasing inventory for cancelled order:", order.id);
          await storage.updateSellerInventoryFromOrder(order.id, 'release');
        }

        // Calculate commission for delivered or shipped orders
        if (status === 'delivered' || status === 'shipped') {
          console.log("💰 Calculating seller commission for order:", order.id);
          const commissionResult = await storage.calculateSellerCommission(order.id);
          if (commissionResult.success) {
            console.log(`✅ Commission calculated: $${commissionResult.commission.toFixed(2)}`);
          } else {
            console.log(`⚠️ Commission calculation failed: ${commissionResult.message}`);
          }
        }
      } catch (sellerError) {
        console.error("❌ Seller integration error:", sellerError);
        // Continue with order status update even if seller integration fails
      }
    }

    // 🔔 Auto-send Vietnamese customer notifications (non-blocking)
    try {
      if (order.customerPhoneBook || order.customerEmailBook) {
        const notificationChannels: ('email' | 'sms' | 'messenger')[] = [];
        if (order.customerPhoneBook) notificationChannels.push('sms');
        if (order.customerEmailBook) notificationChannels.push('email');
        
        let templateType = '';
        if (status === 'shipped') templateType = 'order_status_shipped';
        else if (status === 'delivered') templateType = 'order_status_delivered';
        else if (status === 'paid') templateType = 'payment_confirmed';
        
        if (templateType && notificationChannels.length > 0) {
          const template = VIETNAMESE_ORDER_TEMPLATES[templateType as keyof typeof VIETNAMESE_ORDER_TEMPLATES];
          if (template) {
            const variables = {
              customerName: order.customerNameBook || 'Khách hàng',
              orderNumber: order.id.slice(-8).toUpperCase(),
              orderTotal: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(order.total)),
              shippedDate: new Date().toLocaleDateString('vi-VN'),
              paymentTime: new Date().toLocaleString('vi-VN'),
              amount: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(order.total)),
              isbn: order.isbn || 'N/A',
              condition: order.condition || 'new'
            };

            // Send notifications
            const notificationPromises = [];
            
            if (notificationChannels.includes('sms') && order.customerPhoneBook) {
              notificationPromises.push(
                notificationService.sendNotification({
                  orderId: order.id,
                  templateId: templateType,
                  title: template.title,
                  content: template.sms,
                  recipientPhone: order.customerPhoneBook,
                  channels: ['sms'],
                  variables: variables
                }).catch(notifError => {
                  console.error('🚨 SMS notification failed (non-critical):', notifError);
                })
              );
            }
            
            if (notificationChannels.includes('email') && order.customerEmailBook) {
              notificationPromises.push(
                notificationService.sendNotification({
                  orderId: order.id,
                  templateId: templateType,
                  title: template.title,
                  content: template.email,
                  recipientEmail: order.customerEmailBook,
                  channels: ['email'],
                  variables: variables
                }).catch(notifError => {
                  console.error('🚨 Email notification failed (non-critical):', notifError);
                })
              );
            }
            
            if (notificationPromises.length > 0) {
              Promise.all(notificationPromises).catch(() => {});
            }
          }
        }
      }
    } catch (notifError) {
      console.error('🚨 Customer notification error (non-critical):', notifError);
    }

    res.json(order);
  } catch (error) {
    console.error("Error updating book order status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/book-orders/:id - Update book order
router.put('/:id', async (req, res) => {
  try {
    const partialBookOrderSchema = insertBookOrderSchema.partial();
    const validatedData = partialBookOrderSchema.parse(req.body);
    
    const [order] = await db
      .update(bookOrders)
      .set({ ...validatedData, updatedAt: new Date() })
      .where(eq(bookOrders.id, req.params.id))
      .returning();
    
    if (!order) {
      return res.status(404).json({ error: "Book order not found" });
    }
    res.json(order);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Validation error", details: error.errors });
    }
    console.error("Error updating book order:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/book-orders/:id - Delete book order
router.delete('/:id', async (req, res) => {
  try {
    const orderId = req.params.id;
    
    // First check if order exists
    const [existingOrder] = await db.select().from(bookOrders).where(eq(bookOrders.id, orderId));
    if (!existingOrder) {
      return res.status(404).json({ error: "Book order not found" });
    }

    // Delete associated order items first
    await db.delete(bookOrderItems).where(eq(bookOrderItems.orderId, orderId));

    // Then delete the order
    await db.delete(bookOrders).where(eq(bookOrders.id, orderId));
    
    res.json({ 
      success: true, 
      message: "Book order deleted successfully",
      deletedOrder: existingOrder 
    });
  } catch (error) {
    console.error("Error deleting book order:", error);
    res.status(500).json({ 
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// 📚 BOOK-SPECIFIC ENDPOINTS

// GET /api/book-orders/by-isbn/:isbn - Find orders by ISBN
router.get('/by-isbn/:isbn', async (req, res) => {
  try {
    const isbn = req.params.isbn;
    
    const orders = await db
      .select({
        id: bookOrders.id,
        customerNameBook: bookOrders.customerNameBook,
        customerPhoneBook: bookOrders.customerPhoneBook,
        total: bookOrders.total,
        status: bookOrders.status,
        condition: bookOrders.condition,
        isbn: bookOrders.isbn,
        sellerId: bookOrders.sellerId,
        sellerCommission: bookOrders.sellerCommission,
        inventoryStatus: bookOrders.inventoryStatus,
        createdAt: bookOrders.createdAt,
        sellerName: bookSellers.name,
      })
      .from(bookOrders)
      .leftJoin(bookSellers, eq(bookOrders.sellerId, bookSellers.id))
      .where(or(
        eq(bookOrders.isbn, isbn),
        like(bookOrders.isbn, `%${isbn}%`)
      ))
      .orderBy(desc(bookOrders.createdAt));

    // Also check order items for ISBN matches
    const itemOrders = await db
      .select({
        id: bookOrders.id,
        customerNameBook: bookOrders.customerNameBook,
        customerPhoneBook: bookOrders.customerPhoneBook,
        total: bookOrders.total,
        status: bookOrders.status,
        condition: bookOrders.condition,
        isbn: bookOrders.isbn,
        sellerId: bookOrders.sellerId,
        sellerCommission: bookOrders.sellerCommission,
        inventoryStatus: bookOrders.inventoryStatus,
        createdAt: bookOrders.createdAt,
        sellerName: bookSellers.name,
        itemIsbn: bookOrderItems.isbn,
        itemCondition: bookOrderItems.condition,
      })
      .from(bookOrderItems)
      .innerJoin(bookOrders, eq(bookOrderItems.orderId, bookOrders.id))
      .leftJoin(bookSellers, eq(bookOrders.sellerId, bookSellers.id))
      .where(or(
        eq(bookOrderItems.isbn, isbn),
        like(bookOrderItems.isbn, `%${isbn}%`)
      ))
      .orderBy(desc(bookOrders.createdAt));

    // Combine and deduplicate results
    const allOrders = [...orders, ...itemOrders];
    const uniqueOrders = allOrders.filter((order, index, self) => 
      index === self.findIndex(o => o.id === order.id)
    );

    res.json({
      isbn: isbn,
      totalFound: uniqueOrders.length,
      orders: uniqueOrders
    });
  } catch (error) {
    console.error("Error fetching orders by ISBN:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/book-orders/by-seller/:sellerId - Find orders by seller
router.get('/by-seller/:sellerId', requireAuth, requireCSRFToken, async (req, res) => {
  try {
    const sellerId = req.params.sellerId;
    const status = req.query.status as string;
    const condition = req.query.condition as string;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;

    let query = db
      .select({
        id: bookOrders.id,
        customerNameBook: bookOrders.customerNameBook,
        customerEmailBook: bookOrders.customerEmailBook,
        customerPhoneBook: bookOrders.customerPhoneBook,
        total: bookOrders.total,
        status: bookOrders.status,
        condition: bookOrders.condition,
        isbn: bookOrders.isbn,
        sellerId: bookOrders.sellerId,
        sellerCommission: bookOrders.sellerCommission,
        inventoryStatus: bookOrders.inventoryStatus,
        bookSource: bookOrders.bookSource,
        bookMetadata: bookOrders.bookMetadata,
        createdAt: bookOrders.createdAt,
        sellerName: bookSellers.name,
        sellerEmail: bookSellers.email,
      })
      .from(bookOrders)
      .leftJoin(bookSellers, eq(bookOrders.sellerId, bookSellers.id))
      .where(eq(bookOrders.sellerId, sellerId));

    // Apply additional filters
    const conditions = [eq(bookOrders.sellerId, sellerId)];
    
    if (status && status !== 'all') {
      conditions.push(eq(bookOrders.status, status as any));
    }
    
    if (condition && condition !== 'all') {
      conditions.push(eq(bookOrders.condition, condition as any));
    }

    if (conditions.length > 1) {
      query = query.where(and(...conditions));
    }

    const orders = await query
      .orderBy(desc(bookOrders.createdAt))
      .limit(limit);

    // Calculate seller statistics
    const stats = {
      totalOrders: orders.length,
      totalCommissions: orders.reduce((sum, order) => sum + parseFloat(order.sellerCommission?.toString() || '0'), 0),
      totalRevenue: orders.reduce((sum, order) => sum + parseFloat(order.total.toString()), 0),
      byStatus: {
        pending: orders.filter(o => o.status === 'pending').length,
        processing: orders.filter(o => o.status === 'processing').length,
        shipped: orders.filter(o => o.status === 'shipped').length,
        delivered: orders.filter(o => o.status === 'delivered').length,
        cancelled: orders.filter(o => o.status === 'cancelled').length,
      },
      byCondition: {
        new: orders.filter(o => o.condition === 'new').length,
        like_new: orders.filter(o => o.condition === 'like_new').length,
        very_good: orders.filter(o => o.condition === 'very_good').length,
        good: orders.filter(o => o.condition === 'good').length,
        acceptable: orders.filter(o => o.condition === 'acceptable').length,
      }
    };

    res.json({
      sellerId: sellerId,
      sellerName: orders[0]?.sellerName,
      sellerEmail: orders[0]?.sellerEmail,
      stats: stats,
      orders: orders
    });
  } catch (error) {
    console.error("Error fetching orders by seller:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/book-orders/condition/:condition - Filter by book condition
router.get('/condition/:condition', async (req, res) => {
  try {
    const condition = req.params.condition;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    const status = req.query.status as string;
    const sellerId = req.query.sellerId as string;

    let query = db
      .select({
        id: bookOrders.id,
        customerNameBook: bookOrders.customerNameBook,
        customerPhoneBook: bookOrders.customerPhoneBook,
        total: bookOrders.total,
        status: bookOrders.status,
        condition: bookOrders.condition,
        isbn: bookOrders.isbn,
        sellerId: bookOrders.sellerId,
        sellerCommission: bookOrders.sellerCommission,
        inventoryStatus: bookOrders.inventoryStatus,
        bookSource: bookOrders.bookSource,
        bookMetadata: bookOrders.bookMetadata,
        createdAt: bookOrders.createdAt,
        sellerName: bookSellers.name,
      })
      .from(bookOrders)
      .leftJoin(bookSellers, eq(bookOrders.sellerId, bookSellers.id));

    const conditions = [eq(bookOrders.condition, condition as any)];
    
    if (status && status !== 'all') {
      conditions.push(eq(bookOrders.status, status as any));
    }
    
    if (sellerId) {
      conditions.push(eq(bookOrders.sellerId, sellerId));
    }

    const orders = await query
      .where(and(...conditions))
      .orderBy(desc(bookOrders.createdAt))
      .limit(limit);

    const stats = {
      totalOrders: orders.length,
      totalValue: orders.reduce((sum, order) => sum + parseFloat(order.total.toString()), 0),
      totalCommissions: orders.reduce((sum, order) => sum + parseFloat(order.sellerCommission?.toString() || '0'), 0),
      averageValue: orders.length > 0 ? orders.reduce((sum, order) => sum + parseFloat(order.total.toString()), 0) / orders.length : 0,
      uniqueSellers: new Set(orders.filter(o => o.sellerId).map(o => o.sellerId)).size,
      uniqueCustomers: new Set(orders.filter(o => o.customerPhoneBook).map(o => o.customerPhoneBook)).size,
    };

    res.json({
      condition: condition,
      stats: stats,
      orders: orders
    });
  } catch (error) {
    console.error("Error fetching orders by condition:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/book-orders/calculate-commission - Calculate seller commissions
router.post('/calculate-commission', async (req, res) => {
  try {
    const { sellerId, orderIds, commissionRate, commissionType = 'percentage' } = req.body;

    if (!sellerId && !orderIds) {
      return res.status(400).json({ error: "Either sellerId or orderIds must be provided" });
    }

    let ordersQuery = db
      .select({
        id: bookOrders.id,
        total: bookOrders.total,
        sellerCommission: bookOrders.sellerCommission,
        sellerId: bookOrders.sellerId,
        status: bookOrders.status,
        createdAt: bookOrders.createdAt,
        sellerName: bookSellers.name,
      })
      .from(bookOrders)
      .leftJoin(bookSellers, eq(bookOrders.sellerId, bookSellers.id));

    if (sellerId) {
      ordersQuery = ordersQuery.where(eq(bookOrders.sellerId, sellerId));
    } else if (orderIds && Array.isArray(orderIds)) {
      ordersQuery = ordersQuery.where(or(...orderIds.map(id => eq(bookOrders.id, id))));
    }

    const orders = await ordersQuery;

    if (orders.length === 0) {
      return res.status(404).json({ error: "No orders found for commission calculation" });
    }

    const calculations = orders.map(order => {
      const orderTotal = parseFloat(order.total.toString());
      const currentCommission = parseFloat(order.sellerCommission?.toString() || '0');
      
      let newCommission = 0;
      
      if (commissionRate) {
        if (commissionType === 'percentage') {
          newCommission = orderTotal * (parseFloat(commissionRate) / 100);
        } else if (commissionType === 'fixed') {
          newCommission = parseFloat(commissionRate);
        }
      } else {
        newCommission = currentCommission;
      }

      return {
        orderId: order.id,
        orderTotal: orderTotal,
        currentCommission: currentCommission,
        newCommission: newCommission,
        commissionDifference: newCommission - currentCommission,
        sellerId: order.sellerId,
        sellerName: order.sellerName,
        status: order.status,
        createdAt: order.createdAt
      };
    });

    const summary = {
      totalOrders: calculations.length,
      totalOrderValue: calculations.reduce((sum, calc) => sum + calc.orderTotal, 0),
      totalCurrentCommissions: calculations.reduce((sum, calc) => sum + calc.currentCommission, 0),
      totalNewCommissions: calculations.reduce((sum, calc) => sum + calc.newCommission, 0),
      totalCommissionIncrease: calculations.reduce((sum, calc) => sum + calc.commissionDifference, 0),
      averageCommissionRate: calculations.length > 0 ? 
        (calculations.reduce((sum, calc) => sum + (calc.newCommission / calc.orderTotal * 100), 0) / calculations.length) : 0
    };

    res.json({
      commissionRate: commissionRate,
      commissionType: commissionType,
      summary: summary,
      calculations: calculations
    });
  } catch (error) {
    console.error("Error calculating commissions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /api/book-orders/:id/inventory-status - Update inventory status
router.patch('/:id/inventory-status', async (req, res) => {
  try {
    const { inventoryStatus } = req.body;
    
    if (!inventoryStatus || !['reserved', 'allocated', 'shipped', 'returned'].includes(inventoryStatus)) {
      return res.status(400).json({ 
        error: "Invalid inventory status",
        validStatuses: ['reserved', 'allocated', 'shipped', 'returned']
      });
    }

    const [order] = await db
      .update(bookOrders)
      .set({ inventoryStatus: inventoryStatus as any, updatedAt: new Date() })
      .where(eq(bookOrders.id, req.params.id))
      .returning();

    if (!order) {
      return res.status(404).json({ error: "Book order not found" });
    }

    // Log inventory status change
    console.log(`📦 Book order ${order.id} inventory status changed to: ${inventoryStatus}`);

    res.json({
      success: true,
      message: `Inventory status updated to ${inventoryStatus}`,
      order: order
    });
  } catch (error) {
    console.error("Error updating inventory status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/book-orders/batch-commission-update - Batch update seller commissions
router.put('/batch-commission-update', requireAuth, requireCSRFToken, async (req, res) => {
  try {
    const { orderIds, commissionRate, commissionType = 'percentage' } = req.body;

    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({ error: "orderIds must be a non-empty array" });
    }

    if (!commissionRate) {
      return res.status(400).json({ error: "commissionRate is required" });
    }

    const results = [];
    const errors = [];

    for (const orderId of orderIds) {
      try {
        // Get current order
        const [currentOrder] = await db.select().from(bookOrders).where(eq(bookOrders.id, orderId));
        
        if (!currentOrder) {
          errors.push({ orderId, error: "Order not found" });
          continue;
        }

        const orderTotal = parseFloat(currentOrder.total.toString());
        let newCommission = 0;
        
        if (commissionType === 'percentage') {
          newCommission = orderTotal * (parseFloat(commissionRate) / 100);
        } else if (commissionType === 'fixed') {
          newCommission = parseFloat(commissionRate);
        }

        const [updatedOrder] = await db
          .update(bookOrders)
          .set({ sellerCommission: newCommission.toString(), updatedAt: new Date() })
          .where(eq(bookOrders.id, orderId))
          .returning();

        results.push({
          orderId,
          oldCommission: parseFloat(currentOrder.sellerCommission?.toString() || '0'),
          newCommission,
          orderTotal
        });
      } catch (err) {
        errors.push({ orderId, error: "Update failed" });
      }
    }

    res.json({
      success: true,
      updatedCount: results.length,
      totalRequested: orderIds.length,
      commissionRate,
      commissionType,
      results,
      errors: errors.length > 0 ? errors : undefined,
      message: `${results.length} book orders updated with new commission rate`
    });
  } catch (error) {
    console.error("Error batch updating commissions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 📚 SELLER-SPECIFIC ENDPOINTS

// GET /api/book-orders/seller/:sellerId - Get orders for a specific seller
router.get('/seller/:sellerId', requireAuth, requireCSRFToken, async (req, res) => {
  try {
    const { sellerId } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    
    const orders = await storage.getBookOrdersBySellerId(sellerId, limit);
    
    res.json({
      success: true,
      sellerId,
      orders,
      totalOrders: orders.length
    });
  } catch (error) {
    console.error("Error fetching seller orders:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/book-orders/seller/:sellerId/performance - Get seller performance metrics
router.get('/seller/:sellerId/performance', requireAuth, requireCSRFToken, async (req, res) => {
  try {
    const { sellerId } = req.params;
    
    const performance = await storage.getSellerPerformanceMetrics(sellerId);
    
    res.json({
      success: true,
      sellerId,
      performance,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error fetching seller performance:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/book-orders/seller/:sellerId/status/:status - Get seller orders by status
router.get('/seller/:sellerId/status/:status', requireAuth, requireCSRFToken, async (req, res) => {
  try {
    const { sellerId, status } = req.params;
    
    const orders = await storage.getBookOrdersBySellerAndStatus(sellerId, status);
    
    res.json({
      success: true,
      sellerId,
      status,
      orders,
      totalOrders: orders.length
    });
  } catch (error) {
    console.error("Error fetching seller orders by status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/book-orders/seller/:sellerId/inventory - Get seller inventory
router.get('/seller/:sellerId/inventory', requireAuth, requireCSRFToken, async (req, res) => {
  try {
    const { sellerId } = req.params;
    
    const inventory = await storage.getSellerInventoryBySellerId(sellerId);
    
    res.json({
      success: true,
      sellerId,
      inventory,
      totalItems: inventory.length,
      totalStock: inventory.reduce((sum, item) => sum + (item.stock || 0), 0),
      totalReserved: inventory.reduce((sum, item) => sum + (item.reservedStock || 0), 0)
    });
  } catch (error) {
    console.error("Error fetching seller inventory:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/book-orders/:orderId/calculate-commission - Calculate commission for an order
router.post('/:orderId/calculate-commission', async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const result = await storage.calculateSellerCommission(orderId);
    
    res.json({
      success: result.success,
      orderId,
      commission: result.commission,
      message: result.message,
      calculatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error calculating commission:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/book-orders/:orderId/inventory/:action - Update order inventory
router.put('/:orderId/inventory/:action', async (req, res) => {
  try {
    const { orderId, action } = req.params;
    
    const validActions = ['reserve', 'allocate', 'release', 'ship'];
    if (!validActions.includes(action)) {
      return res.status(400).json({ 
        error: "Invalid action. Must be one of: reserve, allocate, release, ship" 
      });
    }
    
    const result = await storage.updateSellerInventoryFromOrder(orderId, action as any);
    
    res.json({
      success: result,
      orderId,
      action,
      message: result ? `Inventory ${action} successful` : `Inventory ${action} failed`,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error updating inventory:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/book-orders/seller/:sellerId/rating - Update seller rating
router.put('/seller/:sellerId/rating', requireAuth, requireCSRFToken, async (req, res) => {
  try {
    const { sellerId } = req.params;
    const { rating, feedback } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ 
        error: "Rating must be between 1 and 5" 
      });
    }
    
    const updatedSeller = await storage.updateSellerRating(sellerId, rating, feedback);
    
    if (!updatedSeller) {
      return res.status(404).json({ error: "Seller not found" });
    }
    
    res.json({
      success: true,
      sellerId,
      newRating: updatedSeller.avgRating,
      feedback,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error updating seller rating:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;