import { Express } from 'express';
import { storage } from './storage';
import { firebaseStorage } from './firebase-storage';
import { RasaDescriptions, ConsultationType, QuickOrderInputSchema, QuickOrderItemSchema, facebookConversations } from '../shared/schema';
import { z } from 'zod';
import { ProductDescriptionService } from './services/product-description-service';
import { detectIntent, getIntentResponse, requiresCustomerIdentification } from './services/intent-detection-service';
import { db } from './db';
import { orders } from '../shared/schema';
import { eq, like } from 'drizzle-orm';
import { sendInvoiceToMessenger } from './api/invoice';
import { generateInvoiceImage } from './utils/invoice-generator';

/**
 * 🔢 Helper: Format order ID to 8-digit number (matching UI)
 * Extracts digits from UUID and returns last 8 digits, padded with zeros
 * Example: "68d7ce8c-b7a0-4d08-9df9-abfc6a7b71fe" → "08996771"
 */
function formatOrderNumber(orderId: string): string {
  const digitsOnly = orderId.replace(/\D/g, ''); // Extract only digits from UUID
  return digitsOnly.slice(-8).padStart(8, '0'); // Last 8 digits, pad with 0
}

/**
 * 📱 Helper: Check if sessionId is a valid Facebook PSID format
 * Facebook PSIDs are numeric strings with 13-20 digits
 * This helps distinguish real Facebook PSIDs from web session IDs
 * @param sessionId - The session ID to validate
 * @returns true if sessionId looks like a Facebook PSID
 */
function isFacebookPSID(sessionId: string | null | undefined): boolean {
  if (!sessionId) return false;
  
  // Check if it's all digits and has the right length (13-20 characters)
  const isNumeric = /^\d+$/.test(sessionId);
  const hasValidLength = sessionId.length >= 13 && sessionId.length <= 20;
  
  return isNumeric && hasValidLength;
}

/**
 * 📞 Helper: Normalize phone number for consistent lookup
 * Removes spaces, dashes, and standardizes format
 * Example: "+84 123-456-789" → "0123456789"
 * Example: "84123456789" → "0123456789"
 * @param phone - The phone number to normalize
 * @returns Normalized phone number
 */
function normalizePhone(phone: string): string {
  let normalized = phone.replace(/[\s\-()]/g, '');
  
  if (normalized.startsWith('+84')) {
    normalized = '0' + normalized.substring(3);
  } else if (normalized.startsWith('84')) {
    normalized = '0' + normalized.substring(2);
  }
  
  return normalized;
}

/**
 * 📝 TypeScript interface for personalization response
 */
interface PersonalizationResponse {
  firstName: string | null;
  lastName: string | null;
  gender: string | null;
  fullName: string | null;
  address: string | null;
  address2: string | null;
}

// Authentication middleware for RASA endpoints
const requireSessionAuth = (req: any, res: any, next: any) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ 
      status: "error",
      error: "Unauthorized. Authentication required for RASA endpoints.",
      code: "AUTH_REQUIRED"
    });
  }
  next();
};

// CSRF protection for state-changing RASA operations
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
      status: "error",
      error: "CSRF token invalid", 
      message: "Invalid or missing CSRF token" 
    });
  }
  
  next();
};

// 🛡️ RASA Chat Rate Limiting - Anti-spam protection for chat endpoint
const rasaChatRateLimit = new Map<string, { count: number; resetTime: number; lastRequest: number }>();
const CHAT_RATE_LIMIT_WINDOW = 60000; // 1 minute window
const CHAT_RATE_LIMIT_MAX = 60; // 60 messages per minute per IP
const CHAT_MIN_INTERVAL = 2000; // 2 seconds minimum between messages

const chatRateLimitMiddleware = (req: any, res: any, next: any) => {
  // For development, allow all requests (bypass rate limiting)
  if (process.env.NODE_ENV === 'development') {
    next();
    return;
  }

  const clientIP = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] || 'unknown';
  const now = Date.now();
  
  const clientData = rasaChatRateLimit.get(clientIP);
  
  // Check if this is a new client or if the window has reset
  if (!clientData || now > clientData.resetTime) {
    rasaChatRateLimit.set(clientIP, { 
      count: 1, 
      resetTime: now + CHAT_RATE_LIMIT_WINDOW,
      lastRequest: now
    });
    next();
    return;
  }
  
  // Check minimum interval between requests (anti-spam)
  if (now - clientData.lastRequest < CHAT_MIN_INTERVAL) {
    return res.status(429).json({ 
      status: "error",
      error: "Gửi tin nhắn quá nhanh. Vui lòng đợi 2 giây.",
      code: "RATE_LIMIT_INTERVAL",
      retryAfter: Math.ceil((CHAT_MIN_INTERVAL - (now - clientData.lastRequest)) / 1000)
    });
  }
  
  // Check if client has exceeded rate limit
  if (clientData.count >= CHAT_RATE_LIMIT_MAX) {
    const resetIn = Math.ceil((clientData.resetTime - now) / 1000);
    return res.status(429).json({ 
      status: "error",
      error: "Đã vượt quá giới hạn tin nhắn. Vui lòng đợi 1 phút.",
      code: "RATE_LIMIT_EXCEEDED",
      retryAfter: resetIn,
      limit: CHAT_RATE_LIMIT_MAX,
      windowSeconds: CHAT_RATE_LIMIT_WINDOW / 1000
    });
  }
  
  // Update client data
  clientData.count++;
  clientData.lastRequest = now;
  
  console.log(`🤖 Chat rate limit: IP ${clientIP} - ${clientData.count}/${CHAT_RATE_LIMIT_MAX} messages in window`);
  
  next();
};

// Helper function for real inventory data
const getInventory = async (productId: string, variantId?: string) => {
  try {
    // Get real product stock from database
    const product = await storage.getProduct(productId);
    if (!product) {
      return { currentStock: 0, soldQuantity: 0 };
    }
    
    // Use real stock data from products table
    return {
      currentStock: product.stock || 0,
      soldQuantity: 0 // Could be calculated from order_items if needed
    };
  } catch (error) {
    console.error('Error getting inventory for product:', productId, error);
    return { currentStock: 0, soldQuantity: 0 };
  }
};

// RASA-specific API routes for chatbot integration
export function setupRasaRoutes(app: Express) {
  
  // === CATALOG & PRODUCT DISCOVERY APIs ===
  
  /**
   * GET /api/rasa/catalogs
   * Lấy danh sách tất cả catalog cho tư vấn
   */
  app.get("/api/rasa/catalogs", async (req, res) => {
    try {
      // Get real categories from database
      const categories = await storage.getCategories();
      const activeCatalogs = categories
        .filter(cat => cat.isActive)
        .map(cat => ({
          id: cat.id,
          name: cat.name,
          description: cat.description || '',
          sortOrder: cat.sortOrder
        }));
      
      res.json({
        status: "success",
        data: activeCatalogs
      });
    } catch (error) {
      console.error("RASA API Error - Get Catalogs:", error);
      res.status(500).json({ 
        status: "error", 
        message: "Không thể lấy danh sách nghành hàng" 
      });
    }
  });

  /**
   * GET /api/rasa/catalog-tree
   * Lấy cấu trúc phân cấp Industries → Categories → Products cho RASA chatbot
   */
  app.get("/api/rasa/catalog-tree", async (req, res) => {
    try {
      // Get all active industries
      const industries = await storage.getIndustries();
      const activeIndustries = industries.filter(industry => industry.isActive);
      
      // Build hierarchical tree structure
      const catalogTree = [];
      
      for (const industry of activeIndustries) {
        // Get categories for this industry
        const categories = await storage.getCategories(industry.id);
        const activeCategories = categories.filter(cat => cat.isActive);
        
        // Build categories with their products
        const categoriesWithProducts = [];
        
        for (const category of activeCategories) {
          // Get products for this category
          const products = await storage.getProducts(50, category.id); // Limit to 50 products per category
          const activeProducts = products.filter(product => product.status === 'active');
          
          // Map products to RASA format
          const rasaProducts = activeProducts.map(product => ({
            id: product.id,
            name: product.name,
            description: product.description || '',
            price: parseFloat(product.price),
            stock: product.stock,
            image: product.image || null,
            sku: product.id
          }));
          
          categoriesWithProducts.push({
            id: category.id,
            name: category.name,
            description: category.description || '',
            sortOrder: category.sortOrder,
            products: rasaProducts,
            productCount: rasaProducts.length
          });
        }
        
        catalogTree.push({
          id: industry.id,
          name: industry.name,
          description: industry.description || '',
          sortOrder: industry.sortOrder,
          categories: categoriesWithProducts,
          categoryCount: categoriesWithProducts.length,
          totalProducts: categoriesWithProducts.reduce((sum, cat) => sum + cat.productCount, 0)
        });
      }
      
      res.json({
        status: "success",
        data: {
          catalogTree,
          summary: {
            totalIndustries: catalogTree.length,
            totalCategories: catalogTree.reduce((sum, ind) => sum + ind.categoryCount, 0),
            totalProducts: catalogTree.reduce((sum, ind) => sum + ind.totalProducts, 0)
          }
        }
      });
    } catch (error) {
      console.error("RASA API Error - Get Catalog Tree:", error);
      res.status(500).json({ 
        status: "error", 
        message: "Không thể lấy cấu trúc danh mục sản phẩm" 
      });
    }
  });

  /**
   * GET /api/rasa/catalogs/:catalogId/subcatalogs
   * Lấy danh sách sub-catalog theo catalog để tư vấn chi tiết
   */
  app.get("/api/rasa/catalogs/:catalogId/subcatalogs", async (req, res) => {
    try {
      const { catalogId } = req.params;
      // Fallback subcatalogs demo data
      const subCatalogs = [
        { id: 'sub-phones', name: 'Điện thoại', description: 'Smartphone, điện thoại thông minh', catalogId, sortOrder: 1 },
        { id: 'sub-laptops', name: 'Laptop', description: 'Máy tính xách tay', catalogId, sortOrder: 2 },
        { id: 'sub-accessories', name: 'Phụ kiện', description: 'Tai nghe, ốp lưng, sạc', catalogId, sortOrder: 3 }
      ];
      
      res.json({
        status: "success",
        data: subCatalogs.map(sub => ({
          id: sub.id,
          name: sub.name,
          description: sub.description,
          catalogId: sub.catalogId,
          sortOrder: sub.sortOrder
        }))
      });
    } catch (error) {
      console.error("RASA API Error - Get SubCatalogs:", error);
      res.status(500).json({ 
        status: "error", 
        message: "Không thể lấy danh sách danh mục con" 
      });
    }
  });

  /**
   * GET /api/rasa/products/by-catalog/:catalogId
   * Lấy sản phẩm theo catalog cho tư vấn
   */
  app.get("/api/rasa/products/by-catalog/:catalogId", async (req, res) => {
    try {
      const { catalogId } = req.params;
      const { limit = 20 } = req.query;
      
      // Get products by category from our real database
      const products = await storage.getProducts(parseInt(limit as string), catalogId);
      
      res.json({
        status: "success",
        data: products.map(product => ({
          id: product.id,
          name: product.name,
          description: product.description || '',
          basePrice: parseFloat(product.price),
          price: parseFloat(product.price),
          stock: product.stock,
          categoryId: product.categoryId,
          status: product.status,
          image: product.image,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt
        }))
      });
    } catch (error) {
      console.error("RASA API Error - Get Products by Catalog:", error);
      res.status(500).json({ 
        status: "error", 
        message: "Không thể lấy danh sách sản phẩm" 
      });
    }
  });

  /**
   * GET /api/rasa/products/search
   * Tìm kiếm sản phẩm cho tư vấn thông minh
   */
  app.get("/api/rasa/products/search", async (req, res) => {
    try {
      const { q: searchTerm, limit = 20 } = req.query;
      
      if (!searchTerm) {
        return res.status(400).json({
          status: "error",
          message: "Thiếu từ khóa tìm kiếm"
        });
      }

      // Get ALL products first, then filter and limit
      const allProducts = await storage.getProducts(1000); // Get up to 1000 products
      
      // Simple search filter by name and description
      const searchLower = (searchTerm as string).toLowerCase();
      const filteredProducts = allProducts
        .filter(product => 
          product.name.toLowerCase().includes(searchLower) ||
          (product.description && product.description.toLowerCase().includes(searchLower))
        )
        .slice(0, parseInt(limit as string) || 20); // Apply limit AFTER filtering

      res.json({
        status: "success",
        data: filteredProducts.map(product => ({
          id: product.id,
          name: product.name,
          description: product.description || "",
          basePrice: parseFloat(product.price),
          unit: product.unit || "cái",
          unitType: product.unitType || "count",
          minOrderQuantity: parseFloat(product.minQuantity || "1"),
          catalogId: "cat-electronics", // Demo category
          subCatalogId: null,
          images: product.image ? [product.image] : [],
          tags: [],
          sku: product.id,
          stock: product.stock || 0,
          currentStock: product.stock || 0
        }))
      });
    } catch (error) {
      console.error("RASA API Error - Search Products:", error);
      res.status(500).json({ 
        status: "error", 
        message: "Không thể tìm kiếm sản phẩm" 
      });
    }
  });

  /**
   * GET /api/rasa/products/:productId/details
   * Lấy chi tiết sản phẩm và variants cho tư vấn chính xác
   */
  app.get("/api/rasa/products/:productId/details", async (req, res) => {
    try {
      const { productId } = req.params;
      
      // Use PostgreSQL storage for product details
      const product = await storage.getProduct(productId);
      const variants: any[] = []; // Demo: no variants system yet
      const inventory = { quantity: 100, available: 95 }; // Demo inventory

      if (!product) {
        return res.status(404).json({
          status: "error",
          message: "Không tìm thấy sản phẩm"
        });
      }

      // Get variants with their inventory
      const variantsWithInventory = await Promise.all(
        variants.map(async (variant: any) => {
          const variantInventory = await getInventory(
            productId, 
            variant.id
          );
          return {
            id: variant.id,
            name: variant.name,
            price: variant.price,
            sku: variant.sku,
            isActive: variant.isActive,
            inventory: {
              currentStock: variantInventory.currentStock || 0,
              soldQuantity: variantInventory.soldQuantity || 0,
              isInStock: variantInventory.currentStock > 0
            }
          };
        })
      );

      res.json({
        status: "success",
        data: {
          product: {
            id: product.id,
            name: product.name,
            description: product.description,
            basePrice: parseFloat(product.price),
            unit: product.unit || "cái",
            unitType: product.unitType || "count",
            minOrderQuantity: parseFloat(product.minQuantity || "1"),
            images: product.image ? [product.image] : [],
            videos: [],
            tags: [],
            sku: product.id
          },
          variants: variantsWithInventory,
          baseInventory: {
            currentStock: inventory.quantity || 0,
            soldQuantity: inventory.available || 0,
            isInStock: inventory.quantity > 0
          }
        }
      });
    } catch (error) {
      console.error("RASA API Error - Get Product Details:", error);
      res.status(500).json({ 
        status: "error", 
        message: "Không thể lấy chi tiết sản phẩm" 
      });
    }
  });

  /**
   * GET /api/rasa/products/:productId/availability
   * Kiểm tra tồn kho cho chatbot
   */
  app.get("/api/rasa/products/:productId/availability", async (req, res) => {
    try {
      const { productId } = req.params;
      const { variantId, quantity = 1 } = req.query;

      const inventory = await getInventory(
        productId, 
        variantId as string
      );

      const requestedQty = parseFloat(quantity as string);
      const availableQty = inventory.currentStock || 0;
      const isAvailable = availableQty >= requestedQty;

      res.json({
        status: "success",
        data: {
          productId,
          variantId: variantId || null,
          requestedQuantity: requestedQty,
          availableQuantity: availableQty,
          isAvailable,
          soldQuantity: inventory.soldQuantity || 0,
          message: isAvailable 
            ? `Có sẵn ${availableQty} cái`
            : `Chỉ còn ${availableQty} cái, không đủ số lượng yêu cầu`
        }
      });
    } catch (error) {
      console.error("RASA API Error - Check Availability:", error);
      res.status(500).json({ 
        status: "error", 
        message: "Không thể kiểm tra tồn kho" 
      });
    }
  });

  // === CUSTOMER MANAGEMENT APIs ===

  /**
   * GET /api/rasa/customers/search
   * Tìm kiếm khách hàng cho bot
   */
  app.get("/api/rasa/customers/search", requireSessionAuth, async (req, res) => {
    try {
      const { q: searchTerm } = req.query;
      
      if (!searchTerm) {
        return res.status(400).json({
          status: "error",
          message: "Thiếu thông tin tìm kiếm khách hàng"
        });
      }

      // Use PostgreSQL storage to search customers
      const allCustomers = await storage.getCustomers(50);
      
      // Simple search filter by name, phone, or email
      const searchLower = (searchTerm as string).toLowerCase();
      const filteredCustomers = allCustomers.filter(customer => 
        customer.name.toLowerCase().includes(searchLower) ||
        (customer.phone && customer.phone.toLowerCase().includes(searchLower)) ||
        (customer.email && customer.email.toLowerCase().includes(searchLower))
      );

      res.json({
        status: "success",
        data: filteredCustomers.map(customer => ({
          id: customer.id,
          name: customer.name,
          phone: customer.phone,
          email: customer.email,
          customerType: "regular", // Default type
          totalDebt: 0, // Default no debt
          creditLimit: 50000000, // Default 50M credit limit
          isActive: customer.status === 'active'
        }))
      });
    } catch (error) {
      console.error("RASA API Error - Search Customers:", error);
      res.status(500).json({ 
        status: "error", 
        message: "Không thể tìm kiếm khách hàng" 
      });
    }
  });

  /**
   * GET /api/rasa/customers/:customerId/profile
   * Lấy thông tin chi tiết khách hàng
   */
  app.get("/api/rasa/customers/:customerId/profile", requireSessionAuth, async (req, res) => {
    try {
      const { customerId } = req.params;
      
      const [customer, topProducts] = await Promise.all([
        storage.getCustomer(customerId),
        Promise.resolve([]) // Demo: no top products tracking yet
      ]);

      if (!customer) {
        return res.status(404).json({
          status: "error",
          message: "Không tìm thấy khách hàng"
        });
      }

      res.json({
        status: "success",
        data: {
          customer: {
            id: customer.id,
            name: customer.name,
            phone: customer.phone,
            email: customer.email,
            customerType: "regular",
            totalDebt: 0,
            creditLimit: 50000000,
            isActive: customer.status === 'active',
            address: "Địa chỉ mặc định"
          },
          topProducts,
          debtStatus: {
            hasDebt: false,
            debtAmount: 0,
            creditAvailable: 50000000,
            canOrder: true
          }
        }
      });
    } catch (error) {
      console.error("RASA API Error - Get Customer Profile:", error);
      res.status(500).json({ 
        status: "error", 
        message: "Không thể lấy thông tin khách hàng" 
      });
    }
  });

  /**
   * POST /api/rasa/customers
   * Tạo khách hàng mới từ chatbot
   */
  app.post("/api/rasa/customers", requireSessionAuth, requireCSRFToken, async (req, res) => {
    try {
      const { name, phone, email, customerType = 'retail', creditLimit = 0 } = req.body;

      if (!name || !phone) {
        return res.status(400).json({
          status: "error",
          message: "Thiếu thông tin tên và số điện thoại"
        });
      }

      const customerId = await storage.createCustomer({
        name,
        phone,
        email,
        status: "active"
      });

      res.json({
        status: "success",
        data: {
          customerId,
          message: `Đã tạo khách hàng ${name} thành công`
        }
      });
    } catch (error) {
      console.error("RASA API Error - Create Customer:", error);
      res.status(500).json({ 
        status: "error", 
        message: "Không thể tạo khách hàng mới" 
      });
    }
  });

  /**
   * GET /api/rasa/customer/:phone/personalization
   * Lấy thông tin cá nhân hóa khách hàng cho RASA bot (tên, giới tính)
   * Dùng cho chào hỏi bằng tiếng Việt: "Anh [Tên]" (nam) hoặc "Chị [Tên]" (nữ)
   * 
   * Response format:
   * {
   *   firstName: string | null,   // Tên từ socialData hoặc phân tích từ fullName
   *   lastName: string | null,    // Họ từ socialData
   *   gender: string | null,      // "male" hoặc "female" từ socialData
   *   fullName: string | null,    // Tên đầy đủ (dự phòng nếu firstName = null)
   *   address: string | null,     // Địa chỉ chính từ customer.address
   *   address2: string | null     // Địa chỉ phụ từ customer.address2
   * }
   */
  app.get("/api/rasa/customer/:phone/personalization", async (req, res) => {
    try {
      const { phone } = req.params;

      if (!phone) {
        return res.status(400).json({
          status: "error",
          message: "Thiếu số điện thoại khách hàng"
        });
      }

      const normalizedPhone = normalizePhone(phone);
      
      const customer = await storage.getCustomerByPhone(normalizedPhone);

      if (!customer) {
        return res.status(404).json({
          status: "error",
          message: "Không tìm thấy khách hàng với số điện thoại này"
        });
      }

      const socialData = customer.socialData as any || {};
      
      let firstName = socialData.firstName || null;
      const lastName = socialData.lastName || null;
      const gender = socialData.gender || null;
      const fullName = customer.name || null;
      const address = customer.address || null;
      const address2 = customer.address2 || null;

      if (!firstName && fullName) {
        const nameParts = fullName.trim().split(/\s+/);
        if (nameParts.length > 1) {
          firstName = nameParts[nameParts.length - 1];
        } else {
          firstName = fullName;
        }
      }

      const response: PersonalizationResponse = {
        firstName,
        lastName,
        gender,
        fullName,
        address,
        address2
      };

      res.json({
        status: "success",
        data: response
      });
    } catch (error) {
      console.error("RASA API Error - Get Customer Personalization:", error);
      res.status(500).json({ 
        status: "error", 
        message: "Không thể lấy thông tin cá nhân hóa khách hàng" 
      });
    }
  });

  // === PRODUCT DESCRIPTION MANAGEMENT APIs ===

  /**
   * 🤖 ENHANCED RASA Product Description API with Custom Fields Support
   * GET /api/rasa/products/:productId/description
   * Query params: 
   * - context (spiritual|cultural|main|technical|sales) - Vietnamese incense categories
   * - category (for filtering specific custom fields)
   * - format (simple|detailed|rich) - Response format
   */
  app.get("/api/rasa/products/:productId/description", async (req, res) => {
    try {
      const { productId } = req.params;
      const { context, category, format = 'simple' } = req.query;
      
      const product = await storage.getProduct(productId);
      if (!product) {
        return res.status(404).json({
          status: "error",
          message: "Không tìm thấy sản phẩm"
        });
      }

      // 🎯 NEW: Get custom descriptions from new system
      const descriptionService = new ProductDescriptionService();
      let customDescriptions = null;
      let selectedCustomField = null;
      
      try {
        // Get all custom descriptions for this product using consultation method
        const consultationOptions = {
          intent: context as string || 'general',
          category: category as any
          // Remove priority filter to include all Vietnamese incense content (high, medium, low)
        };
        const allCustomFields = await descriptionService.getConsultationDescriptions(productId, consultationOptions);
        
        if (allCustomFields && allCustomFields.length > 0) {
          customDescriptions = allCustomFields;
          
          // Vietnamese incense context mapping
          if (context) {
            const contextMapping = {
              'spiritual': 'spiritual',     // 🙏 Tâm linh
              'cultural': 'cultural',       // 🏛️ Văn hóa  
              'main': 'main',              // 📋 Chính
              'technical': 'technical',     // ⚙️ Kỹ thuật
              'sales': 'sales',            // 💎 Bán hàng
              // Legacy RASA contexts mapped to new system
              'safety': 'technical',
              'convenience': 'main', 
              'quality': 'technical',
              'health': 'spiritual'
            };
            
            const targetCategory = contextMapping[context as string] || 'main';
            
            // Find custom field matching context/category
            selectedCustomField = allCustomFields.find(field => 
              field.category === targetCategory && 
              field.value && 
              field.value.trim().length > 0
            );
            
            // If no exact match, try any field with content
            if (!selectedCustomField) {
              selectedCustomField = allCustomFields.find(field => 
                field.value && field.value.trim().length > 0
              );
            }
          } else {
            // No specific context - pick the first available field
            selectedCustomField = allCustomFields.find(field => 
              field.value && field.value.trim().length > 0
            );
          }
        }
      } catch (customError) {
        console.warn('Custom descriptions not available, falling back to legacy:', customError);
      }

      // 🔄 LEGACY FALLBACK: Use old description system if custom fields unavailable
      let selectedDescription: string;
      let selectedIndex: string;
      let selectionType: string;
      let descriptionSource: string;

      if (selectedCustomField) {
        // 🎯 NEW: Use custom description field
        selectedDescription = selectedCustomField.value;
        selectedIndex = selectedCustomField.key;
        selectionType = "custom_field";
        descriptionSource = "custom_descriptions_v2";
      } else {
        // 🔄 LEGACY: Fall back to old description system
        const descriptions = (product.descriptions ?? {}) as Partial<RasaDescriptions>;
        const rasaVariations = descriptions.rasa_variations || {};
        const contexts = descriptions.contexts || {};

        if (context && contexts[context as string]) {
          selectedIndex = contexts[context as string];
          selectedDescription = rasaVariations[selectedIndex];
          
          if (!selectedDescription && Object.keys(rasaVariations).length > 0) {
            const availableKeys = Object.keys(rasaVariations);
            selectedIndex = availableKeys[Math.floor(Math.random() * availableKeys.length)];
            selectedDescription = rasaVariations[selectedIndex];
            selectionType = "legacy_context_fallback_random";
          } else if (selectedDescription) {
            selectionType = "legacy_context";
          } else {
            selectedDescription = product.description || product.name;
            selectedIndex = "primary";
            selectionType = "legacy_context_fallback_primary";
          }
        } else if (Object.keys(rasaVariations).length > 0) {
          const availableKeys = Object.keys(rasaVariations);
          selectedIndex = availableKeys[Math.floor(Math.random() * availableKeys.length)];
          selectedDescription = rasaVariations[selectedIndex];
          selectionType = "legacy_random";
        } else {
          selectedDescription = product.description || product.name;
          selectedIndex = "primary";
          selectionType = "legacy_fallback";
        }
        descriptionSource = "legacy_descriptions_v1";
      }

      // 📊 Response format options
      const baseResponse = {
        status: "success",
        data: {
          productId: product.id,
          productName: product.name,
          description: selectedDescription,
          descriptionIndex: selectedIndex,
          selectionType,
          descriptionSource,
          context: context || null,
          // 🇻🇳 Vietnamese incense specific metadata
          vietnameseIncenseData: selectedCustomField ? {
            category: selectedCustomField.category,
            fieldName: selectedCustomField.name,
            fieldType: selectedCustomField.type,
            categoryIcon: {
              'spiritual': '🙏',
              'cultural': '🏛️', 
              'main': '📋',
              'technical': '⚙️',
              'sales': '💎'
            }[selectedCustomField.category] || '📋'
          } : null,
          // Product details for context
          product: {
            id: product.id,
            name: product.name,
            basePrice: parseFloat(product.price),
            price: parseFloat(product.price),
            stock: product.stock,
            image: product.image,
            sku: product.id
          }
        }
      };

      // 🎨 Format-specific enhancements
      if (format === 'detailed' && customDescriptions) {
        // Detailed format includes all available custom fields
        baseResponse.data = {
          ...baseResponse.data,
          allCustomDescriptions: customDescriptions.map(field => ({
            key: field.key,
            name: field.name,
            category: field.category,
            type: field.type,
            value: field.value,
            hasContent: field.value && field.value.trim().length > 0
          })),
          availableContexts: [...new Set(customDescriptions.map(f => f.category))],
          totalCustomFields: customDescriptions.length,
          fieldsWithContent: customDescriptions.filter(f => f.value && f.value.trim().length > 0).length
        };
      } else if (format === 'rich') {
        // Rich format includes Vietnamese cultural context
        baseResponse.data = {
          ...baseResponse.data,
          vietnameseCultural: {
            isIncenseProduct: true,
            consultationContext: context || 'general',
            culturalSignificance: selectedCustomField?.category === 'spiritual' ? 'high' : 'medium',
            recommendedUse: selectedCustomField?.category === 'spiritual' ? 'tâm linh' : 'sinh hoạt',
            businessContext: 'vietnamese_incense_retail'
          }
        };
      }

      res.json(baseResponse);
    } catch (error) {
      console.error("RASA API Error - Get Product Description (Enhanced):", error);
      res.status(500).json({
        status: "error", 
        message: "Không thể lấy mô tả sản phẩm từ hệ thống mới"
      });
    }
  });

  /**
   * 🔮 Vietnamese Incense Consultation API
   * GET /api/rasa/incense/:productId/consultation
   * Specialized endpoint for Vietnamese incense spiritual consultation
   * Query params: intent (spiritual_guidance|cultural_practice|daily_use|healing)
   */
  app.get("/api/rasa/incense/:productId/consultation", async (req, res) => {
    try {
      const { productId } = req.params;
      const { intent = 'spiritual_guidance' } = req.query;
      
      const product = await storage.getProduct(productId);
      if (!product) {
        return res.status(404).json({
          status: "error",
          message: "Không tìm thấy sản phẩm nhang"
        });
      }

      // 🎯 Get custom descriptions for Vietnamese incense consultation
      const descriptionService = new ProductDescriptionService();
      const consultationOptions = {
        intent: intent as string,
        category: undefined // Will filter later based on intent mapping
        // Remove priority filter to include ALL Vietnamese incense content
      };
      const customFields = await descriptionService.getConsultationDescriptions(productId, consultationOptions);
      
      // 🇻🇳 Vietnamese incense intent mapping
      const intentToContextMapping = {
        'spiritual_guidance': 'spiritual',    // Hướng dẫn tâm linh
        'cultural_practice': 'cultural',      // Thực hành văn hóa
        'daily_use': 'main',                 // Sử dụng hàng ngày
        'healing': 'spiritual',              // Chữa lành
        'ceremony': 'cultural',              // Lễ nghi
        'meditation': 'spiritual',           // Thiền định
        'ancestor_worship': 'cultural'       // Thờ cúng tổ tiên
      };

      const targetCategory = intentToContextMapping[intent as string] || 'spiritual';
      
      // Find relevant custom fields for consultation
      const spiritualFields = customFields.filter(f => f.category === 'spiritual' && f.value?.trim());
      const culturalFields = customFields.filter(f => f.category === 'cultural' && f.value?.trim());
      const mainFields = customFields.filter(f => f.category === 'main' && f.value?.trim());
      
      // Select primary consultation field based on intent
      const primaryField = customFields.find(f => 
        f.category === targetCategory && f.value?.trim()
      ) || customFields.find(f => f.value?.trim());

      // 🎭 Consultation response
      const consultationResponse = {
        status: "success",
        data: {
          productId: product.id,
          productName: product.name,
          consultationIntent: intent,
          targetCategory,
          
          // Primary consultation content
          primaryGuidance: primaryField?.value || product.description || "Sản phẩm nhang chất lượng cao",
          primaryContext: primaryField?.category || 'main',
          
          // Structured consultation fields
          spiritualGuidance: spiritualFields.map(f => ({
            fieldName: f.name,
            content: f.value,
            icon: '🙏'
          })),
          
          culturalContext: culturalFields.map(f => ({
            fieldName: f.name, 
            content: f.value,
            icon: '🏛️'
          })),
          
          practicalUse: mainFields.map(f => ({
            fieldName: f.name,
            content: f.value,
            icon: '📋'
          })),
          
          // Vietnamese incense business metadata
          vietnameseIncenseMetadata: {
            isAuthentic: true,
            businessContext: 'vietnamese_incense_retail',
            consultationLanguage: 'vi',
            culturalSignificance: spiritualFields.length > 0 ? 'high' : 'medium',
            recommendedFor: targetCategory === 'spiritual' ? 'tâm linh' : 'sinh hoạt',
            supportedIntents: Object.keys(intentToContextMapping)
          },
          
          // Product details for ordering
          product: {
            id: product.id,
            name: product.name,
            price: parseFloat(product.price),
            stock: product.stock,
            image: product.image,
            available: product.stock > 0
          }
        }
      };
      
      res.json(consultationResponse);
    } catch (error) {
      console.error("Vietnamese Incense Consultation Error:", error);
      res.status(500).json({
        status: "error",
        message: "Không thể tư vấn sản phẩm nhang"
      });
    }
  });

  /**
   * GET /api/rasa/products/:productId/description/:index
   * Lấy mô tả sản phẩm theo index cụ thể (0, 1, 2, 3)
   */
  app.get("/api/rasa/products/:productId/description/:index", async (req, res) => {
    try {
      const { productId, index } = req.params;
      
      const product = await storage.getProduct(productId);
      if (!product) {
        return res.status(404).json({
          status: "error",
          message: "Không tìm thấy sản phẩm"
        });
      }

      const descriptions = (product.descriptions ?? {}) as Partial<RasaDescriptions>;
      const rasaVariations = descriptions.rasa_variations || {};

      if (!rasaVariations[index]) {
        return res.status(404).json({
          status: "error",
          message: `Không tìm thấy mô tả với index ${index}`
        });
      }

      res.json({
        status: "success",
        data: {
          productId: product.id,
          productName: product.name,
          description: rasaVariations[index],
          descriptionIndex: index,
          selectionType: "specific",
          price: parseFloat(product.price),
          stock: product.stock,
          image: product.image,
          sku: product.id
        }
      });
    } catch (error) {
      console.error("RASA API Error - Get Specific Description:", error);
      res.status(500).json({
        status: "error",
        message: "Không thể lấy mô tả sản phẩm"
      });
    }
  });

  /**
   * GET /api/rasa/products/:productId/descriptions/all
   * Lấy tất cả mô tả của sản phẩm cho A/B testing
   */
  app.get("/api/rasa/products/:productId/descriptions/all", async (req, res) => {
    try {
      const { productId } = req.params;
      
      const product = await storage.getProduct(productId);
      if (!product) {
        return res.status(404).json({
          status: "error",
          message: "Không tìm thấy sản phẩm"
        });
      }

      const descriptions = (product.descriptions ?? {}) as Partial<RasaDescriptions>;
      const rasaVariations = descriptions.rasa_variations || {};
      const contexts = descriptions.contexts || {};

      // Build all available descriptions
      const allDescriptions = Object.keys(rasaVariations).map(index => ({
        index,
        description: rasaVariations[index],
        context: Object.keys(contexts).find(ctx => contexts[ctx] === index) || null
      }));

      res.json({
        status: "success",
        data: {
          productId: product.id,
          productName: product.name,
          primary: product.description,
          variations: allDescriptions,
          contexts,
          totalVariations: allDescriptions.length,
          price: parseFloat(product.price),
          stock: product.stock,
          image: product.image
        }
      });
    } catch (error) {
      console.error("RASA API Error - Get All Descriptions:", error);
      res.status(500).json({
        status: "error",
        message: "Không thể lấy danh sách mô tả"
      });
    }
  });

  /**
   * POST /api/rasa/products/:productId/description/analytics
   * Track analytics cho description usage (A/B testing)
   */
  app.post("/api/rasa/products/:productId/description/analytics", async (req, res) => {
    try {
      const { productId } = req.params;
      const { descriptionIndex, action, userId, conversationId } = req.body;

      if (!descriptionIndex || !action) {
        return res.status(400).json({
          status: "error",
          message: "Thiếu thông tin index hoặc action"
        });
      }

      // Simple analytics tracking (could be enhanced with dedicated analytics table)
      const analyticsData = {
        productId,
        descriptionIndex,
        action, // "view", "click", "conversion"
        userId: userId || "anonymous",
        conversationId: conversationId || null,
        timestamp: new Date().toISOString()
      };

      // Log for now - could store in dedicated analytics table later
      console.log("RASA Description Analytics:", analyticsData);

      res.json({
        status: "success",
        message: "Analytics tracked successfully",
        data: { tracked: true }
      });
    } catch (error) {
      console.error("RASA API Error - Track Analytics:", error);
      res.status(500).json({
        status: "error",
        message: "Không thể ghi nhận analytics"
      });
    }
  });

  // === ORDER MANAGEMENT APIs ===

  /**
   * POST /api/rasa/orders/calculate
   * Tính toán đơn hàng trước khi tạo
   */
  app.post("/api/rasa/orders/calculate", requireSessionAuth, requireCSRFToken, async (req, res) => {
    try {
      const { customerId, items, discount = 0, shippingFee = 0 } = req.body;

      if (!customerId || !items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
          status: "error",
          message: "Thiếu thông tin khách hàng hoặc sản phẩm"
        });
      }

      const customer = await storage.getCustomer(customerId);
      if (!customer) {
        return res.status(404).json({
          status: "error",
          message: "Không tìm thấy khách hàng"
        });
      }

      let subtotal = 0;
      const calculatedItems = [];

      // Validate items and calculate prices
      for (const item of items) {
        const { productId, variantId, quantity } = item;
        
        if (!productId || !quantity || quantity <= 0) {
          return res.status(400).json({
            status: "error",
            message: "Thông tin sản phẩm không hợp lệ"
          });
        }

        const [product, variants, inventory] = await Promise.all([
          storage.getProduct(productId),
          variantId ? Promise.resolve([]) : Promise.resolve([]),
          getInventory(productId, variantId)
        ]);

        if (!product) {
          return res.status(404).json({
            status: "error",
            message: `Không tìm thấy sản phẩm ${productId}`
          });
        }

        // Check stock availability
        const availableStock = inventory.currentStock || 0;
        if (availableStock < quantity) {
          return res.status(400).json({
            status: "error",
            message: `Sản phẩm "${product.name}" chỉ còn ${availableStock} cái, không đủ số lượng yêu cầu ${quantity}`
          });
        }

        // Get price (variant price or base price)
        let unitPrice = parseFloat(product.price);
        let productName = product.name;
        let variantName;

        // Note: Variants not implemented in current schema
        // if (variantId && variants.length > 0) {
        //   const variant = variants.find((v: any) => v.id === variantId);
        //   if (variant) {
        //     unitPrice = variant.price;
        //     variantName = variant.name;
        //     productName = `${product.name} - ${variant.name}`;
        //   }
        // }

        const itemTotal = unitPrice * quantity;
        subtotal += itemTotal;

        calculatedItems.push({
          productId,
          variantId,
          productName,
          variantName,
          quantity,
          unitPrice,
          total: itemTotal,
          unit: "cái"
        });
      }

      const discountAmount = Math.min(discount, subtotal);
      const tax = 0; // Configure as needed
      const total = subtotal - discountAmount + tax + shippingFee;

      // Check customer credit limit
      const potentialDebt = 0 + total;
      const canAfford = potentialDebt <= 50000000;

      res.json({
        status: "success",
        data: {
          calculation: {
            subtotal,
            discount: discountAmount,
            tax,
            shippingFee,
            total
          },
          items: calculatedItems,
          customer: {
            id: customer.id,
            name: customer.name,
            currentDebt: 0,
            creditLimit: 50000000,
            availableCredit: 50000000,
            canAfford
          },
          validation: {
            isValid: canAfford,
            message: canAfford 
              ? "Đơn hàng hợp lệ, có thể tạo đơn"
              : `Vượt quá hạn mức tín dụng. Cần thanh toán ${potentialDebt - 50000000} trước khi đặt hàng`
          }
        }
      });
    } catch (error) {
      console.error("RASA API Error - Calculate Order:", error);
      res.status(500).json({ 
        status: "error", 
        message: "Không thể tính toán đơn hàng" 
      });
    }
  });

  /**
   * 🤖 POST /api/rasa/orders/create-from-bot
   * Tạo đơn hàng từ RASA chatbot - Không cần session auth, dùng API key
   * Header: X-RASA-API-KEY
   * Body: customerPhone, customerName, customerAddress, items, ...
   */
  app.post("/api/rasa/orders/create-from-bot", async (req, res) => {
    try {
      // ✅ Check RASA API key for security
      const apiKey = req.headers['x-rasa-api-key'] || req.body.apiKey;
      const expectedKey = process.env.RASA_API_KEY || 'dev-rasa-key-12345';
      
      if (apiKey !== expectedKey) {
        return res.status(401).json({
          status: "error",
          message: "Invalid or missing RASA API key",
          code: "INVALID_API_KEY"
        });
      }

      const { 
        customerPhone: rawCustomerPhone,
        customerName,
        customerAddress,
        items, 
        discount = 0, 
        shippingFee = 0, 
        paidAmount = 0,
        paymentMethod = "cod",
        deliveryMethod = "delivery",
        notes = "Đơn hàng từ chatbot RASA",
        facebookPsid, // Optional: Facebook Page-Scoped ID (flat format)
        customerSocialData, // Optional: Facebook PSID (nested format)
        sessionId, // Optional: RASA session ID (often the PSID in Messenger)
        sender_id // Optional: Alternative field name for PSID
      } = req.body;

      // 📱 Normalize phone number to Vietnam local format (0xxxxxxxxx)
      const { normalizePhoneToE164 } = await import('./utils/phone-normalizer');
      const customerPhone = normalizePhoneToE164(rawCustomerPhone);
      console.log(`📱 Phone normalization: ${rawCustomerPhone} → ${customerPhone}`);

      // 📱 Support multiple PSID formats with priority order:
      // 1. facebookPsid (explicit field)
      // 2. customerSocialData.facebookId (nested format)
      // 3. sessionId (RASA session, often the Messenger PSID)
      // 4. sender_id (alternative field name)
      const psidFromRequest = facebookPsid || customerSocialData?.facebookId || sessionId || sender_id;
      
      if (psidFromRequest) {
        let psidSource = 'unknown';
        if (facebookPsid) psidSource = 'facebookPsid';
        else if (customerSocialData?.facebookId) psidSource = 'customerSocialData.facebookId';
        else if (sessionId) psidSource = 'sessionId';
        else if (sender_id) psidSource = 'sender_id';
        
        console.log(`📱 [AUTO-SEND INVOICE] Received potential PSID from ${psidSource}: ${psidFromRequest}`);
      } else {
        console.log(`⚠️ [AUTO-SEND INVOICE] No PSID found in request body (checked: facebookPsid, customerSocialData.facebookId, sessionId, sender_id)`);
      }

      console.log('🤖 Bot Order Request:', JSON.stringify({
        customerPhone,
        customerName,
        customerAddress,
        items,
        discount,
        shippingFee,
        paidAmount
      }, null, 2));

      // Validate customer info and items
      if (!customerPhone || !customerName || !items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
          status: "error",
          message: "Thiếu thông tin khách hàng hoặc sản phẩm"
        });
      }

      // 🔍 Find or create customer
      let customer = await storage.getCustomerByPhone(customerPhone);
      
      if (!customer) {
        // Tạo khách hàng mới
        console.log(`📝 Creating new customer: ${customerName} (${customerPhone})`);
        customer = await storage.createCustomer({
          name: customerName,
          phone: customerPhone,
          email: null,
          status: "active",
          registrationSource: "bot"
        });
        console.log(`✅ Created customer ID: ${customer.id}`);
      } else {
        console.log(`✅ Found existing customer ID: ${customer.id}`);
      }

      if (!customer) {
        return res.status(500).json({
          status: "error",
          message: "Không thể tạo hoặc tìm khách hàng"
        });
      }

      // 📱 Validate and link Facebook PSID (manual or auto-detected)
      let detectedPsid: string | undefined;
      
      // Validate PSID from request if provided (either format)
      if (psidFromRequest) {
        if (isFacebookPSID(psidFromRequest)) {
          detectedPsid = psidFromRequest;
          console.log(`📱 Using validated Facebook PSID from request: ${detectedPsid}`);
        } else {
          console.warn(`⚠️ Invalid Facebook PSID format provided: ${psidFromRequest}, falling back to auto-detection`);
        }
      }
      
      // Auto-detect PSID from chatbot_conversations if not provided or invalid
      if (!detectedPsid) {
        try {
          const conversation = await storage.getChatbotConversationByCustomer(customer.id);
          
          if (conversation && conversation.sessionId && isFacebookPSID(conversation.sessionId)) {
            detectedPsid = conversation.sessionId;
            console.log(`📱 Auto-detected Facebook PSID ${detectedPsid} from chatbot_conversation for customer ${customer.id}`);
          }
        } catch (error) {
          console.error('Error auto-detecting PSID from chatbot_conversation:', error);
        }
      }
      
      // Auto-detect PSID from facebook_conversations if still not found
      if (!detectedPsid) {
        try {
          const fbConversations = await db
            .select()
            .from(facebookConversations)
            .where(like(facebookConversations.participantName, `%${customer.name}%`))
            .limit(5);
          
          // Try to match by participant_id (PSID)
          for (const conv of fbConversations) {
            if (conv.participantId && isFacebookPSID(conv.participantId)) {
              detectedPsid = conv.participantId;
              console.log(`📱 Auto-detected Facebook PSID ${detectedPsid} from facebook_conversations for customer ${customer.id}`);
              break;
            }
          }
        } catch (error) {
          console.error('Error auto-detecting PSID from facebook_conversations:', error);
        }
      }

      // 📱 Link Facebook PSID to customer if provided or auto-detected (Multi-PSID support)
      if (detectedPsid) {
        const existingSocialData = customer.socialData || {};
        const existingPages = existingSocialData.facebookPages || {};
        
        // Generate or detect pageId (can use a hash or extract from context)
        // For now, use first 8 chars of PSID as pageId identifier
        const pageId = detectedPsid.slice(0, 8);
        
        // Check if this PSID already exists in any page
        const psidExists = Object.values(existingPages).some(
          (page: any) => page.psid === detectedPsid
        );
        
        if (!psidExists) {
          // Add new PSID
          const updatedSocialData = {
            ...existingSocialData,
            facebookId: detectedPsid, // Keep for backward compatibility
            facebookPages: {
              ...existingPages,
              [pageId]: {
                psid: detectedPsid,
                pageName: 'Unknown Page', // Can be enhanced later
                lastInteraction: new Date().toISOString()
              }
            }
          };
          
          await storage.updateCustomer(customer.id, {
            socialData: updatedSocialData
          });
          
          console.log(`📱 Added Facebook PSID ${detectedPsid} (page: ${pageId}) to customer ${customer.id}`);
          
          // Update the customer object for subsequent use
          customer.socialData = updatedSocialData;
        } else {
          // Update lastInteraction for existing PSID
          const existingPageId = Object.keys(existingPages).find(
            (key) => existingPages[key].psid === detectedPsid
          );
          
          if (existingPageId) {
            existingPages[existingPageId].lastInteraction = new Date().toISOString();
            
            await storage.updateCustomer(customer.id, {
              socialData: { ...existingSocialData, facebookPages: existingPages }
            });
            
            console.log(`📱 Updated lastInteraction for PSID ${detectedPsid} on customer ${customer.id}`);
          }
        }
      }

      let subtotal = 0;
      const calculatedItems = [];

      // Validate items and calculate prices
      for (const item of items) {
        const { productId, variantId, quantity } = item;
        
        if (!productId || !quantity || quantity <= 0) {
          return res.status(400).json({
            status: "error",
            message: "Thông tin sản phẩm không hợp lệ"
          });
        }

        const [product, variants, inventory] = await Promise.all([
          storage.getProduct(productId),
          variantId ? Promise.resolve([]) : Promise.resolve([]),
          getInventory(productId, variantId)
        ]);

        if (!product) {
          return res.status(404).json({
            status: "error",
            message: `Không tìm thấy sản phẩm ${productId}`
          });
        }

        // Check stock availability
        const availableStock = inventory.currentStock || 0;
        if (availableStock < quantity) {
          return res.status(400).json({
            status: "error",
            message: `Sản phẩm "${product.name}" chỉ còn ${availableStock} cái, không đủ số lượng yêu cầu ${quantity}`
          });
        }

        // Get price
        let unitPrice = parseFloat(product.price);
        let productName = product.name;
        let variantName;

        const itemTotal = unitPrice * quantity;
        subtotal += itemTotal;

        calculatedItems.push({
          productId,
          variantId,
          productName,
          variantName,
          quantity,
          unitPrice,
          discount: 0,
          total: itemTotal
        });
      }

      const discountAmount = Math.min(discount, subtotal);
      const tax = 0;
      const total = subtotal - discountAmount + tax + shippingFee;

      // Check customer credit limit
      const potentialDebt = 0 + total;
      const canAfford = potentialDebt <= 50000000;

      if (!canAfford) {
        return res.status(400).json({
          status: "error",
          message: `Vượt quá hạn mức tín dụng. Cần thanh toán ${potentialDebt - 50000000} trước khi đặt hàng`
        });
      }

      const calculation = {
        subtotal,
        discount: discountAmount,
        tax,
        shippingFee,
        total
      };

      // Generate order reference for tracking
      const orderReference = `RASA-ORD-${Date.now()}`;
      const debtAmount = Math.max(0, calculation.total - paidAmount);
      const paymentStatus = paidAmount >= calculation.total ? 'paid' : (paidAmount > 0 ? 'partial' : 'pending');

      // 🛒 Map items to correct format for orders table
      const orderItems = calculatedItems.map(item => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        price: item.unitPrice
      }));

      // Create order with storage.createOrder
      const order = await storage.createOrder({
        customerId: customer.id,
        status: 'pending',
        total: calculation.total.toString(),
        items: orderItems, // ✅ Pass array, not count
        source: 'chatbot', // 🤖 Track order source
        sourceReference: orderReference, // Reference to chatbot order
        syncStatus: 'manual',
        tags: ['chatbot'] // 🏷️ Auto-tag for invoice auto-send
      });

      const orderId = order.id;
      const orderNumber = formatOrderNumber(orderId);

      console.log(`🤖 RASA Created Order: #${orderNumber} (ID: ${orderId}, Ref: ${orderReference}) - Customer: ${customer.name} - Total: ${calculation.total.toLocaleString('vi-VN')}₫`);

      // 📄 Auto-send invoice via Facebook Messenger (non-blocking)
      let invoiceStatus = 'not_sent';
      let invoiceError: string | undefined;
      
      if (detectedPsid) {
        console.log(`📄 Auto-sending invoice for order ${orderId} via Facebook Messenger to PSID ${detectedPsid}...`);
        
        // Send invoice asynchronously (non-blocking) with PSID override to avoid race condition
        sendInvoiceToMessenger(orderId, detectedPsid)
          .then((result) => {
            if (result.success) {
              console.log(`✅ Invoice sent successfully for order ${orderId} - Message ID: ${result.messageId}`);
            } else {
              console.error(`❌ Failed to send invoice for order ${orderId}: ${result.error}`);
            }
          })
          .catch((error: any) => {
            console.error(`❌ Error sending invoice for order ${orderId}:`, error.message);
          });
        
        invoiceStatus = 'sending';
      } else {
        console.warn(`⚠️ Cannot auto-send invoice for order ${orderId}: Customer does not have Facebook PSID`);
        invoiceError = 'Customer does not have Facebook PSID';
      }

      res.json({
        status: "success",
        data: {
          orderId,
          orderNumber,
          sourceReference: orderReference,
          customerId: customer.id,
          customerName: customer.name,
          total: calculation.total,
          paidAmount,
          debtAmount,
          message: `Đã tạo đơn hàng #${orderNumber} thành công cho ${customer.name}. ${debtAmount > 0 ? `Còn nợ ${debtAmount.toLocaleString('vi-VN')} VNĐ` : 'Đã thanh toán đủ'}. ${invoiceStatus === 'sending' ? 'Hóa đơn đang được gửi qua Messenger.' : ''}`,
          invoiceStatus,
          invoiceError
        }
      });
    } catch (error) {
      console.error("RASA API Error - Create Order from Bot:", error);
      res.status(500).json({ 
        status: "error", 
        message: "Không thể tạo đơn hàng",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  /**
   * 📱 POST /api/rasa/customers/link-facebook
   * Link Facebook PSID to customer by phone number
   * Called by bot immediately after collecting customer's phone number
   * Header: X-RASA-API-KEY
   * Body: phone, facebookPsid
   */
  app.post("/api/rasa/customers/link-facebook", async (req, res) => {
    try {
      // ✅ Check RASA API key for security
      const apiKey = req.headers['x-rasa-api-key'] || req.body.apiKey;
      const expectedKey = process.env.RASA_API_KEY || 'dev-rasa-key-12345';
      
      if (apiKey !== expectedKey) {
        return res.status(401).json({
          status: "error",
          message: "Invalid or missing RASA API key",
          code: "INVALID_API_KEY"
        });
      }

      const { phone, facebookPsid } = req.body;

      // Validate input
      if (!phone || !facebookPsid) {
        return res.status(400).json({
          status: "error",
          message: "Phone number and Facebook PSID are required"
        });
      }

      // Validate PSID format
      if (!isFacebookPSID(facebookPsid)) {
        return res.status(400).json({
          status: "error",
          message: "Invalid Facebook PSID format"
        });
      }

      // Find or create customer by phone
      let customer = await storage.getCustomerByPhone(phone);
      
      if (!customer) {
        // Create new customer
        console.log(`📱 Creating new customer for linking: ${phone}`);
        customer = await storage.createCustomer({
          name: "Khách hàng", // Default name, will be updated later
          phone: phone,
          email: null,
          status: "active",
          registrationSource: "bot"
        });
        console.log(`✅ Created customer ID: ${customer.id}`);
      } else {
        console.log(`✅ Found existing customer ID: ${customer.id}`);
      }

      // Link Facebook PSID to customer
      const existingSocialData = customer.socialData || {};
      
      // Check if PSID is already linked
      if (existingSocialData.facebookId === facebookPsid) {
        console.log(`📱 Facebook PSID ${facebookPsid} already linked to customer ${customer.id}`);
        return res.json({
          status: "success",
          message: "Facebook PSID already linked",
          data: {
            customerId: customer.id,
            phone: customer.phone,
            facebookPsid: facebookPsid,
            alreadyLinked: true
          }
        });
      }

      // Update customer with Facebook PSID
      const updatedSocialData = {
        ...existingSocialData,
        facebookId: facebookPsid
      };
      
      await storage.updateCustomer(customer.id, {
        socialData: updatedSocialData
      });
      
      console.log(`📱✅ Successfully linked Facebook PSID ${facebookPsid} to customer ${customer.id} (${phone})`);
      
      res.json({
        status: "success",
        message: "Facebook PSID linked successfully",
        data: {
          customerId: customer.id,
          phone: customer.phone,
          facebookPsid: facebookPsid,
          alreadyLinked: false
        }
      });
    } catch (error) {
      console.error("RASA API Error - Link Facebook PSID:", error);
      res.status(500).json({ 
        status: "error", 
        message: "Không thể liên kết Facebook ID",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  /**
   * POST /api/rasa/orders (Legacy - Requires session auth)
   * Tạo đơn hàng từ chatbot
   */
  app.post("/api/rasa/orders", requireSessionAuth, requireCSRFToken, async (req, res) => {
    try {
      const { 
        customerId, 
        items, 
        discount = 0, 
        shippingFee = 0, 
        paidAmount = 0,
        shippingAddress,
        notes = "Đơn hàng từ chatbot"
      } = req.body;

      // Validate items and calculate directly
      if (!customerId || !items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
          status: "error",
          message: "Thiếu thông tin khách hàng hoặc sản phẩm"
        });
      }

      const customer = await storage.getCustomer(customerId);
      if (!customer) {
        return res.status(404).json({
          status: "error",
          message: "Không tìm thấy khách hàng"
        });
      }

      let subtotal = 0;
      const calculatedItems = [];

      // Validate items and calculate prices
      for (const item of items) {
        const { productId, variantId, quantity } = item;
        
        if (!productId || !quantity || quantity <= 0) {
          return res.status(400).json({
            status: "error",
            message: "Thông tin sản phẩm không hợp lệ"
          });
        }

        const [product, variants, inventory] = await Promise.all([
          storage.getProduct(productId),
          variantId ? Promise.resolve([]) : Promise.resolve([]),
          getInventory(productId, variantId)
        ]);

        if (!product) {
          return res.status(404).json({
            status: "error",
            message: `Không tìm thấy sản phẩm ${productId}`
          });
        }

        // Check stock availability
        const availableStock = inventory.currentStock || 0;
        if (availableStock < quantity) {
          return res.status(400).json({
            status: "error",
            message: `Sản phẩm "${product.name}" chỉ còn ${availableStock} cái, không đủ số lượng yêu cầu ${quantity}`
          });
        }

        // Get price (variant price or base price)
        let unitPrice = parseFloat(product.price);
        let productName = product.name;
        let variantName;

        // Note: Variants not implemented in current schema
        // if (variantId && variants.length > 0) {
        //   const variant = variants.find((v: any) => v.id === variantId);
        //   if (variant) {
        //     unitPrice = variant.price;
        //     variantName = variant.name;
        //     productName = `${product.name} - ${variant.name}`;
        //   }
        // }

        const itemTotal = unitPrice * quantity;
        subtotal += itemTotal;

        calculatedItems.push({
          productId,
          variantId,
          productName,
          variantName,
          quantity,
          unitPrice,
          discount: 0,
          total: itemTotal
        });
      }

      const discountAmount = Math.min(discount, subtotal);
      const tax = 0;
      const total = subtotal - discountAmount + tax + shippingFee;

      // Check customer credit limit
      const potentialDebt = 0 + total;
      const canAfford = potentialDebt <= 50000000;

      if (!canAfford) {
        return res.status(400).json({
          status: "error",
          message: `Vượt quá hạn mức tín dụng. Cần thanh toán ${potentialDebt - 50000000} trước khi đặt hàng`
        });
      }

      const calculation = {
        subtotal,
        discount: discountAmount,
        tax,
        shippingFee,
        total
      };

      // Generate order reference for tracking
      const orderReference = `RASA-ORD-${Date.now()}`;
      const debtAmount = Math.max(0, calculation.total - paidAmount);
      const paymentStatus = paidAmount >= calculation.total ? 'paid' : (paidAmount > 0 ? 'partial' : 'pending');

      // 🛒 Map items to correct format for orders table
      const orderItems = calculatedItems.map(item => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        price: item.unitPrice
      }));

      // Create order with storage.createOrder
      const order = await storage.createOrder({
        customerId,
        status: 'pending',
        total: calculation.total.toString(),
        items: orderItems, // ✅ Pass array, not count
        source: 'chatbot', // 🤖 Track order source
        sourceReference: orderReference, // Reference to chatbot order
        syncStatus: 'manual'
      });

      const orderId = order.id;
      const orderNumber = formatOrderNumber(orderId);

      res.json({
        status: "success",
        data: {
          orderId,
          orderNumber,
          sourceReference: orderReference,
          total: calculation.total,
          paidAmount,
          debtAmount,
          message: `Đã tạo đơn hàng #${orderNumber} thành công. ${debtAmount > 0 ? `Còn nợ ${debtAmount.toLocaleString('vi-VN')} VNĐ` : 'Đã thanh toán đủ'}`
        }
      });
    } catch (error) {
      console.error("RASA API Error - Create Order:", error);
      res.status(500).json({ 
        status: "error", 
        message: "Không thể tạo đơn hàng" 
      });
    }
  });

  /**
   * 🤖 GET /api/rasa/orders/:orderId/status
   * Kiểm tra trạng thái đơn hàng cho chatbot - Không cần session auth, dùng API key
   * Header: X-RASA-API-KEY
   * Params: orderId (UUID hoặc source_reference như RASA-ORD-xxx)
   */
  app.get("/api/rasa/orders/:orderId/status", async (req, res) => {
    try {
      // ✅ Check RASA API key for security
      const apiKey = req.headers['x-rasa-api-key'];
      const expectedKey = process.env.RASA_API_KEY || 'dev-rasa-key-12345';
      
      if (apiKey !== expectedKey) {
        return res.status(401).json({
          status: "error",
          message: "Invalid or missing RASA API key",
          code: "INVALID_API_KEY"
        });
      }

      const { orderId } = req.params;
      
      // 🔍 Try to find order by ID, orderNumber, or source_reference
      let order;
      if (orderId.startsWith('RASA-')) {
        // Search by source_reference using direct query
        const result = await db
          .select()
          .from(orders)
          .where(eq(orders.sourceReference, orderId))
          .limit(1);
        order = result[0] || null;
      } else if (/^\d{8}$/.test(orderId)) {
        // Search by 8-digit orderNumber (display format)
        const allOrders = await db.select().from(orders);
        order = allOrders.find(o => formatOrderNumber(o.id) === orderId) || null;
      } else {
        // Search by UUID
        order = await storage.getOrder(orderId);
      }

      if (!order) {
        return res.status(404).json({
          status: "error",
          message: "Không tìm thấy đơn hàng"
        });
      }

      // 📋 Parse items from JSON
      let orderItems = [];
      if (order.items) {
        try {
          orderItems = typeof order.items === 'string' 
            ? JSON.parse(order.items) 
            : order.items;
        } catch (e) {
          console.error('Failed to parse order items:', e);
        }
      }

      // 👤 Get customer info
      const customer = order.customerId ? await storage.getCustomer(order.customerId) : null;

      // 🏷️ Vietnamese status labels
      const statusLabels = {
        pending: "Chờ xử lý",
        processing: "Đang xử lý",
        shipped: "Đã gửi",
        delivered: "Hoàn thành",
        cancelled: "Đã hủy"
      };

      // 🔢 Format order number to 8-digit format (matching UI)
      const orderNumber = formatOrderNumber(order.id);

      res.json({
        status: "success",
        data: {
          order: {
            id: order.id,
            orderNumber: orderNumber,
            status: order.status,
            statusLabel: statusLabels[order.status as keyof typeof statusLabels] || order.status,
            total: parseFloat(order.total || '0'),
            source: order.source || 'admin',
            sourceReference: order.sourceReference,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt
          },
          items: orderItems,
          customer: customer ? {
            id: customer.id,
            name: customer.name,
            phone: customer.phone,
            email: customer.email
          } : null
        }
      });
    } catch (error) {
      console.error("RASA API Error - Get Order Status:", error);
      res.status(500).json({ 
        status: "error", 
        message: "Không thể lấy thông tin đơn hàng" 
      });
    }
  });

  /**
   * GET /api/rasa/orders/:orderId (Legacy)
   * Lấy thông tin đơn hàng
   */
  app.get("/api/rasa/orders/:orderId", async (req, res) => {
    try {
      const { orderId } = req.params;
      
      const [order, items] = await Promise.all([
        storage.getOrder(orderId),
        Promise.resolve(orderId)
      ]);

      if (!order) {
        return res.status(404).json({
          status: "error",
          message: "Không tìm thấy đơn hàng"
        });
      }

      const customer = order.customerId ? await storage.getCustomer(order.customerId) : null;

      res.json({
        status: "success",
        data: {
          order: {
            id: order.id,
            orderNumber: `ORD-${Date.now()}`,
            status: order.status,
            total: order.total,
            paidAmount: 0,
            debtAmount: 0,
            paymentStatus: 'pending',
            createdAt: order.createdAt,
            notes: ''
          },
          items: [], // Order items would be fetched separately in real implementation
          customer: customer ? {
            name: customer.name,
            phone: customer.phone,
            email: customer.email
          } : null
        }
      });
    } catch (error) {
      console.error("RASA API Error - Get Order:", error);
      res.status(500).json({ 
        status: "error", 
        message: "Không thể lấy thông tin đơn hàng" 
      });
    }
  });

  // === RECOMMENDATION APIs ===

  /**
   * GET /api/rasa/recommendations/trending
   * Lấy sản phẩm bán chạy để tư vấn
   */
  app.get("/api/rasa/recommendations/trending", async (req, res) => {
    try {
      const { catalogId, limit = 10 } = req.query;
      
      // This is a simplified implementation
      // In production, you'd want to calculate this based on sales data
      let products;
      if (catalogId) {
        products = await storage.getProducts(20, catalogId as string);
      } else {
        // Get all active catalogs and their products
        const catalogs = await storage.getCategories();
        products = await storage.getProducts(parseInt(limit as string) || 10);
        // Simplified: just use the products already fetched
        // In real implementation, you'd fetch products from multiple categories
      }

      const limitedProducts = products.slice(0, parseInt(limit as string));

      res.json({
        status: "success",
        data: limitedProducts.map(product => ({
          id: product.id,
          name: product.name,
          description: product.description,
          basePrice: parseFloat(product.price),
          unit: "cái",
          images: product.image ? [product.image] : [],
          tags: []
        }))
      });
    } catch (error) {
      console.error("RASA API Error - Get Trending:", error);
      res.status(500).json({ 
        status: "error", 
        message: "Không thể lấy sản phẩm bán chạy" 
      });
    }
  });

  /**
   * GET /api/rasa/recommendations/customer/:customerId
   * Gợi ý sản phẩm dựa trên lịch sử mua hàng
   */
  app.get("/api/rasa/recommendations/customer/:customerId", async (req, res) => {
    try {
      const { customerId } = req.params;
      const { limit = 5 } = req.query;

      // Simplified: return sample products since we don't have customer purchase history tracking
      const topProducts = await storage.getProducts(parseInt(limit as string) || 5);

      res.json({
        status: "success",
        data: {
          customerId,
          recommendations: topProducts,
          message: topProducts.length > 0 
            ? "Dựa trên lịch sử mua hàng của bạn"
            : "Khách hàng chưa có lịch sử mua hàng"
        }
      });
    } catch (error) {
      console.error("RASA API Error - Get Customer Recommendations:", error);
      res.status(500).json({ 
        status: "error", 
        message: "Không thể lấy gợi ý sản phẩm" 
      });
    }
  });

  /**
   * GET /api/rasa/customer-by-psid/:psid
   * Check if customer exists by Facebook PSID (for bot to avoid asking phone again)
   */
  app.get("/api/rasa/customer-by-psid/:psid", async (req, res) => {
    try {
      const { psid } = req.params;
      
      if (!psid) {
        return res.status(400).json({
          status: "error",
          message: "PSID is required"
        });
      }
      
      console.log(`🔍 Looking up customer by PSID: ${psid}`);
      
      const customer = await storage.getCustomerByPSID(psid);
      
      if (customer) {
        console.log(`✅ Found customer: ${customer.name} (${customer.id})`);
        
        return res.json({
          status: "success",
          found: true,
          customer: {
            id: customer.id,
            name: customer.name,
            phone: customer.phone,
            email: customer.email,
            // Include address if available in customer data
            address: (customer as any).address || null
          }
        });
      } else {
        console.log(`❌ No customer found for PSID: ${psid}`);
        
        return res.json({
          status: "success",
          found: false,
          customer: null
        });
      }
    } catch (error) {
      console.error('Error in customer-by-psid lookup:', error);
      return res.status(500).json({
        status: "error",
        message: "Internal server error"
      });
    }
  });

  // === CHAT CONVERSATION API ===

  /**
   * POST /api/rasa/chat
   * Main chat endpoint for conversational interaction
   * Protected with rate limiting to prevent spam/abuse
   */
  app.post("/api/rasa/chat", chatRateLimitMiddleware, async (req, res) => {
    try {
      // 🔒 Input validation with Zod
      const chatRequestSchema = z.object({
        message: z.string().min(1, "Message cannot be empty").max(4000, "Message too long"),
        sender: z.string().min(1, "Sender ID required").max(255, "Sender ID too long"),
        context: z.any().optional()
      });

      const validationResult = chatRequestSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          status: "error",
          message: "Dữ liệu đầu vào không hợp lệ",
          details: validationResult.error.errors
        });
      }

      const { message, sender, context } = validationResult.data;

      // 🔄 CONVERSATION LOGGING - Find or create conversation
      let conversation = await storage.getChatbotConversationBySession(sender);
      
      if (!conversation) {
        // Create new conversation for this session
        conversation = await storage.createChatbotConversation({
          sessionId: sender,
          customerId: context?.customerId || null,
          status: 'active',
          messages: []
        });
        console.log(`💬 Created new conversation for session: ${sender}`);
      }

      // 📝 SAVE USER MESSAGE
      await storage.addMessageToChatbotConversation(conversation.id, {
        senderType: 'user',
        senderName: context?.customerName || 'User',
        content: message,
        messageType: 'text',
        metadata: {
          context: context,
          userAgent: req.headers['user-agent'],
          timestamp: new Date().toISOString()
        }
      });

      // Process message through RASA-like logic with context awareness
      const responses = await processConversationalMessage(message, sender, context);
      
      // 🤖 SAVE BOT RESPONSES
      for (const response of responses) {
        await storage.addMessageToChatbotConversation(conversation.id, {
          senderType: 'bot',
          senderName: 'Assistant',
          content: response.text || JSON.stringify(response),
          messageType: 'text', // Always use 'text', store interaction data in metadata
          metadata: {
            hasButtons: !!response.buttons,
            buttons: response.buttons || null,
            custom: response.custom || null,
            timestamp: new Date().toISOString()
          }
        });
      }

      console.log(`💬 Saved conversation turn - Session: ${sender}, Messages: ${responses.length}`);
      
      res.json({
        status: "success",
        responses,
        sender,
        conversationId: conversation.id
      });
    } catch (error) {
      console.error("RASA Chat API Error:", error);
      res.status(500).json({ 
        status: "error", 
        message: "Có lỗi xảy ra trong quá trình xử lý" 
      });
    }
  });

  /**
   * Process conversational message with intelligent routing
   */
  async function processConversationalMessage(message: string, sender: string, context: any) {
    const msgLower = message.toLowerCase();
    const responses = [];

    // Intent detection based on message content
    if (msgLower.includes("tìm") || msgLower.includes("sản phẩm") || msgLower.includes("có gì")) {
      // Enhanced product search with category detection
      const category = detectCategory(message);
      const searchTerm = extractSearchTerm(message);
      
      if (category) {
        // Category-specific search
        const categoryResults = await searchProductsByCategory(category, context);
        responses.push({
          text: categoryResults.text,
          custom: categoryResults.custom
        });
      } else if (searchTerm) {
        // General product search
        const searchResults = await searchProductsForChat(searchTerm, context);
        responses.push({
          text: searchResults.text,
          custom: searchResults.custom
        });
      } else {
        responses.push({
          text: "Bạn muốn tìm sản phẩm gì? Hãy cho tôi biết tên hoặc danh mục sản phẩm.",
          buttons: [
            { title: "📱 Điện thoại", payload: "/search_smartphone" },
            { title: "💻 Laptop", payload: "/search_laptop" },  
            { title: "🎧 Tai nghe", payload: "/search_headphone" },
            { title: "📺 TV", payload: "/search_tv" },
            { title: "Xem tất cả", payload: "/search_all" }
          ]
        });
      }
    }
    else if (msgLower.includes("còn hàng") || msgLower.includes("tồn kho") || msgLower.includes("có sẵn")) {
      // Stock check intent
      const productName = extractProductName(message);
      if (productName) {
        const stockInfo = await checkStockForChat(productName);
        responses.push({
          text: stockInfo.text,
          custom: stockInfo.custom
        });
      } else {
        responses.push({
          text: "Bạn muốn kiểm tra tồn kho sản phẩm nào? Vui lòng cho tôi biết tên sản phẩm.",
          buttons: [
            { title: "Kiểm tra sản phẩm cụ thể", payload: "/check_specific_product" }
          ]
        });
      }
    }
    else if (msgLower.includes("đặt hàng") || msgLower.includes("mua") || msgLower.includes("order")) {
      // Order intent
      if (context?.cartItems && context.cartItems.length > 0) {
        const orderSummary = await createOrderSummaryForChat(context.cartItems);
        responses.push({
          text: "Tôi thấy bạn đã có sản phẩm trong giỏ hàng. Bạn có muốn tiếp tục đặt hàng không?",
          custom: { order: orderSummary },
          buttons: [
            { title: "Xác nhận đặt hàng", payload: "/confirm_order" },
            { title: "Thêm sản phẩm khác", payload: "/add_more_products" },
            { title: "Xem chi tiết", payload: "/view_cart_details" }
          ]
        });
      } else {
        responses.push({
          text: "Bạn muốn đặt hàng sản phẩm nào? Tôi có thể giúp bạn tìm và thêm vào giỏ hàng.",
          buttons: [
            { title: "Xem sản phẩm hot", payload: "/show_trending" },
            { title: "Tìm theo danh mục", payload: "/browse_categories" }
          ]
        });
      }
    }
    else if (msgLower.includes("giá") || msgLower.includes("bao nhiêu") || msgLower.includes("price")) {
      // Price inquiry intent
      const productName = extractProductName(message);
      if (productName) {
        const priceInfo = await getPriceInfoForChat(productName);
        responses.push({
          text: priceInfo.text,
          custom: priceInfo.custom
        });
      } else {
        responses.push({
          text: "Bạn muốn hỏi giá sản phẩm nào? Hãy cho tôi biết tên sản phẩm.",
          buttons: [
            { title: "Xem bảng giá", payload: "/show_price_list" }
          ]
        });
      }
    }
    else if (msgLower.includes("giao hàng") || msgLower.includes("ship") || msgLower.includes("delivery")) {
      // Delivery info intent
      responses.push({
        text: "🚚 Thông tin giao hàng:\n\n• Giao hàng quanh thị trấn: 2-4 giờ\n• Ship COD toàn quốc: 1-3 ngày\n• FREE SHIP vào 11:00 và 17:00 hàng ngày\n• Phí ship theo khoảng cách\n\nBạn cần hỗ trợ gì thêm về giao hàng?",
        buttons: [
          { title: "Kiểm tra phí ship", payload: "/check_shipping_fee" },
          { title: "Thời gian giao hàng", payload: "/delivery_time" }
        ]
      });
    }
    else if (msgLower.includes("thanh toán") || msgLower.includes("payment") || msgLower.includes("trả tiền")) {
      // Payment info intent
      responses.push({
        text: "💳 Các hình thức thanh toán:\n\n• COD (Thanh toán khi nhận hàng)\n• Chuyển khoản ngân hàng\n• Ví điện tử\n\nTất cả đều an toàn và bảo mật. Bạn muốn biết thêm chi tiết nào?",
        buttons: [
          { title: "Hướng dẫn chuyển khoản", payload: "/bank_transfer_guide" },
          { title: "Chính sách bảo mật", payload: "/security_policy" }
        ]
      });
    }
    else if (msgLower.includes("quá đắt") || msgLower.includes("đắt quá") || msgLower.includes("rẻ hơn") || msgLower.includes("có gì rẻ") || msgLower.includes("thay thế") || msgLower.includes("tương tự")) {
      // NEW: Similar product suggestion intent
      const productName = extractProductName(message);
      if (productName) {
        const similarProducts = await getSimilarProductsForChat(productName);
        responses.push({
          text: similarProducts.text,
          custom: similarProducts.custom
        });
      } else {
        responses.push({
          text: "💰 Tôi hiểu bạn muốn tìm sản phẩm với giá tốt hơn. Bạn đang quan tâm đến sản phẩm nào để tôi gợi ý những lựa chọn phù hợp?",
          buttons: [
            { title: "Sản phẩm giá rẻ", payload: "/budget_products" },
            { title: "Khuyến mãi hot", payload: "/promotions" },
            { title: "So sánh giá", payload: "/price_comparison" }
          ]
        });
      }
    }
    else if (msgLower.includes("xin chào") || msgLower.includes("hello") || msgLower.includes("hi")) {
      // Greeting intent
      responses.push({
        text: `Xin chào! Tôi là trợ lý mua sắm. Tôi có thể giúp bạn:\n\n🔍 Tìm kiếm sản phẩm\n📦 Kiểm tra tồn kho\n🛒 Hỗ trợ đặt hàng\n💰 Tư vấn giá cả\n🚚 Thông tin giao hàng\n\nBạn cần hỗ trợ gì?`,
        buttons: [
          { title: "Tìm sản phẩm", payload: "/search_products" },
          { title: "Sản phẩm hot", payload: "/trending_products" },
          { title: "Khuyến mãi", payload: "/promotions" }
        ]
      });
    }
    else {
      // Default/fallback intent
      responses.push({
        text: "Tôi hiểu bạn đang cần hỗ trợ. Có thể bạn muốn:",
        buttons: [
          { title: "Tìm sản phẩm", payload: "/search_products" },
          { title: "Kiểm tra tồn kho", payload: "/check_stock" },
          { title: "Hỗ trợ đặt hàng", payload: "/help_order" },
          { title: "Thông tin giao hàng", payload: "/delivery_info" }
        ]
      });
    }

    return responses;
  }

  /**
   * Helper functions for conversation processing
   */
  function extractSearchTerm(message: string): string | null {
    const searchPatterns = [
      /tìm\s+(.+)/i,
      /có\s+(.+)\s+không/i,
      /(.+)\s+ở\s+đâu/i,
      /muốn\s+mua\s+(.+)/i
    ];
    
    for (const pattern of searchPatterns) {
      const match = message.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    return null;
  }

  function extractProductName(message: string): string | null {
    // Simple extraction - in production, use NER
    const words = message.split(' ');
    for (let i = 0; i < words.length; i++) {
      if (words[i].length > 2) {
        return words[i];
      }
    }
    return null;
  }

  // NEW: Category detection function
  function detectCategory(message: string): string | null {
    const msgLower = message.toLowerCase();
    const categoryMap = {
      'smartphone': ['điện thoại', 'smartphone', 'phone', 'di động', 'iphone', 'samsung', 'xiaomi'],
      'laptop': ['laptop', 'máy tính', 'macbook', 'dell', 'hp', 'asus'],
      'headphone': ['tai nghe', 'headphone', 'airpods', 'earphone'], 
      'tablet': ['máy tính bảng', 'tablet', 'ipad'],
      'tv': ['tivi', 'tv', 'smart tv', 'television'],
      'camera': ['máy ảnh', 'camera'],
      'watch': ['đồng hồ', 'smart watch', 'apple watch'],
      'speaker': ['loa', 'speaker', 'bluetooth']
    };

    for (const [category, keywords] of Object.entries(categoryMap)) {
      for (const keyword of keywords) {
        if (msgLower.includes(keyword)) {
          return category;
        }
      }
    }
    return null;
  }

  // NEW: Search products by category
  async function searchProductsByCategory(category: string, context: any) {
    try {
      const allProducts = await storage.getProducts(50);
      const filteredProducts = allProducts.filter(product => {
        const productName = product.name.toLowerCase();
        const categoryKeywords: Record<string, string[]> = {
          'smartphone': ['điện thoại', 'phone', 'iphone', 'samsung', 'xiaomi', 'oppo', 'vivo'],
          'laptop': ['laptop', 'macbook', 'dell', 'hp', 'asus', 'acer', 'lenovo'],
          'headphone': ['tai nghe', 'headphone', 'airpods', 'earphone'],
          'tablet': ['ipad', 'tablet'],
          'tv': ['tv', 'tivi', 'smart tv'],
          'camera': ['camera', 'máy ảnh'],  
          'watch': ['watch', 'đồng hồ'],
          'speaker': ['loa', 'speaker']
        };

        const keywords = categoryKeywords[category] || [];
        return keywords.some((keyword: string) => productName.includes(keyword));
      });

      if (filteredProducts.length === 0) {
        return {
          text: `Hiện tại chưa có sản phẩm nào trong danh mục "${category}". Bạn có thể xem các danh mục khác?`,
          custom: null
        };
      }

      // Show top 3 products in category
      const topProducts = filteredProducts.slice(0, 3);
      const productsWithStock = await Promise.all(
        topProducts.map(async (product) => {
          const inventory = await getInventory(product.id);
          return {
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            stock: inventory.currentStock
          };
        })
      );

      const categoryNames: Record<string, string> = {
        'smartphone': 'Điện thoại',
        'laptop': 'Laptop', 
        'headphone': 'Tai nghe',
        'tablet': 'Máy tính bảng',
        'tv': 'TV',
        'camera': 'Máy ảnh',
        'watch': 'Đồng hồ',
        'speaker': 'Loa'
      };

      return {
        text: `📱 Tìm thấy ${filteredProducts.length} sản phẩm trong danh mục ${categoryNames[category] || category}. Đây là những sản phẩm nổi bật:`,
        custom: {
          products: productsWithStock,
          category: category,
          totalCount: filteredProducts.length
        }
      };
    } catch (error) {
      return {
        text: "Có lỗi khi tìm kiếm theo danh mục. Vui lòng thử lại.",
        custom: null
      };
    }
  }

  // NEW: Get similar/cheaper product suggestions
  async function getSimilarProductsForChat(productName: string) {
    try {
      const allProducts = await storage.getProducts(50);
      const targetProduct = allProducts.find(p => 
        p.name.toLowerCase().includes(productName.toLowerCase())
      );

      if (!targetProduct) {
        return {
          text: `Không tìm thấy sản phẩm "${productName}". Bạn có thể cho tôi biết tên sản phẩm chính xác hơn?`,
          custom: null
        };
      }

      const targetPrice = parseFloat(targetProduct.price);
      
      // Find similar products in same category but cheaper
      const category = detectCategory(targetProduct.name);
      let similarProducts = allProducts.filter(p => {
        const productPrice = parseFloat(p.price);
        const isCheaper = productPrice < targetPrice;
        const isDifferentProduct = p.id !== targetProduct.id;
        
        if (category) {
          // Same category, cheaper price
          const productCategory = detectCategory(p.name);
          return productCategory === category && isCheaper && isDifferentProduct;
        } else {
          // Just cheaper products (fallback)
          return isCheaper && isDifferentProduct;
        }
      });

      // Sort by price ascending and get top 3
      similarProducts = similarProducts
        .sort((a, b) => parseFloat(a.price) - parseFloat(b.price))
        .slice(0, 3);

      if (similarProducts.length === 0) {
        return {
          text: `${targetProduct.name} (${parseInt(targetProduct.price).toLocaleString()}đ) đã là sản phẩm có giá tốt trong danh mục này. Bạn có thể xem các khuyến mãi đặc biệt?`,
          custom: {
            originalProduct: {
              id: targetProduct.id,
              name: targetProduct.name,
              price: targetProduct.price,
              image: targetProduct.image
            }
          }
        };
      }

      // Get stock info for similar products
      const productsWithStock = await Promise.all(
        similarProducts.map(async (product) => {
          const inventory = await getInventory(product.id);
          const savings = targetPrice - parseFloat(product.price);
          return {
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            stock: inventory.currentStock,
            savings: Math.round(savings)
          };
        })
      );

      return {
        text: `💡 Tôi tìm thấy ${similarProducts.length} sản phẩm tương tự với giá tốt hơn so với ${targetProduct.name}:`,
        custom: {
          originalProduct: {
            id: targetProduct.id,
            name: targetProduct.name,
            price: targetProduct.price
          },
          similarProducts: productsWithStock
        }
      };
    } catch (error) {
      return {
        text: "Có lỗi khi tìm sản phẩm tương tự. Vui lòng thử lại.",
        custom: null
      };
    }
  }

  async function searchProductsForChat(searchTerm: string, context: any) {
    try {
      const allProducts = await storage.getProducts(20);
      const filteredProducts = allProducts.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );

      if (filteredProducts.length === 0) {
        return {
          text: `Không tìm thấy sản phẩm nào với từ khóa "${searchTerm}". Bạn có thể thử tìm với từ khóa khác?`,
          custom: null
        };
      }

      const topProduct = filteredProducts[0];
      const inventory = await getInventory(topProduct.id);
      
      return {
        text: `Tìm thấy ${filteredProducts.length} sản phẩm cho "${searchTerm}". Đây là sản phẩm phù hợp nhất:`,
        custom: {
          product: {
            id: topProduct.id,
            name: topProduct.name,
            price: topProduct.price,
            image: topProduct.image,
            stock: inventory.currentStock
          }
        }
      };
    } catch (error) {
      return {
        text: "Có lỗi khi tìm kiếm sản phẩm. Vui lòng thử lại.",
        custom: null
      };
    }
  }

  async function checkStockForChat(productName: string) {
    try {
      const allProducts = await storage.getProducts(50);
      const product = allProducts.find(p => 
        p.name.toLowerCase().includes(productName.toLowerCase())
      );

      if (!product) {
        return {
          text: `Không tìm thấy sản phẩm "${productName}". Bạn có thể kiểm tra tên sản phẩm khác?`,
          custom: null
        };
      }

      const inventory = await getInventory(product.id);
      const stockStatus = inventory.currentStock > 0 ? "còn hàng" : "hết hàng";
      
      return {
        text: `${product.name} hiện tại ${stockStatus}. Còn lại ${inventory.currentStock} sản phẩm.`,
        custom: {
          product: {
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            stock: inventory.currentStock
          }
        }
      };
    } catch (error) {
      return {
        text: "Có lỗi khi kiểm tra tồn kho. Vui lòng thử lại.",
        custom: null
      };
    }
  }

  async function getPriceInfoForChat(productName: string) {
    try {
      const allProducts = await storage.getProducts(50);
      const product = allProducts.find(p => 
        p.name.toLowerCase().includes(productName.toLowerCase())
      );

      if (!product) {
        return {
          text: `Không tìm thấy thông tin giá cho "${productName}".`,
          custom: null
        };
      }

      const price = parseInt(product.price);
      return {
        text: `${product.name}: ${price.toLocaleString('vi-VN')}đ/kg`,
        custom: {
          product: {
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image
          }
        }
      };
    } catch (error) {
      return {
        text: "Có lỗi khi lấy thông tin giá. Vui lòng thử lại.",
        custom: null
      };
    }
  }

  async function createOrderSummaryForChat(cartItems: any[]) {
    let total = 0;
    const items = cartItems.map(item => {
      const itemTotal = parseFloat(item.price || 0) * parseFloat(item.quantity || 0);
      total += itemTotal;
      return {
        name: item.name,
        quantity: item.quantity,
        price: itemTotal
      };
    });

    return {
      items,
      total
    };
  }

  // === CONSULTATION APIs FOR RASA BOT ===
  
  /**
   * GET /api/consultation/product/:productId
   * Get consultation data for a specific product
   */
  app.get("/api/consultation/product/:productId", async (req, res) => {
    try {
      const { productId } = req.params;
      
      // Get product with consultation data and category configuration
      const product = await storage.getProduct(productId);
      if (!product) {
        return res.status(404).json({
          status: "error",
          message: "Không tìm thấy sản phẩm",
          data: null
        });
      }

      // Get category consultation configuration
      let categoryConfig = null;
      if (product.categoryId) {
        const category = await storage.getCategory(product.categoryId);
        if (category) {
          categoryConfig = {
            id: category.id,
            name: category.name,
            consultationConfig: category.consultationConfig,
            consultationTemplates: category.consultationTemplates,
            salesAdviceTemplate: category.salesAdviceTemplate
          };
        }
      }

      // Format consultation response for RASA
      const consultationData = {
        productId: product.id,
        productName: product.name,
        price: product.price,
        image: product.image,
        categoryConfig,
        consultationData: product.consultationData || {},
        hasConsultationData: !!(product.consultationData && Object.keys(product.consultationData).length > 0)
      };

      res.json({
        status: "success",
        data: consultationData
      });

    } catch (error) {
      console.error("RASA API Error - Get Product Consultation:", error);
      res.status(500).json({
        status: "error",
        message: "Lỗi khi lấy thông tin tư vấn sản phẩm"
      });
    }
  });

  /**
   * GET /api/consultation/categories
   * Get all categories with consultation configuration
   */
  app.get("/api/consultation/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      
      // Filter categories that have consultation configuration
      const consultationCategories = categories
        .filter(cat => cat.isActive && cat.consultationConfig && Object.keys(cat.consultationConfig).length > 0)
        .map(cat => ({
          id: cat.id,
          name: cat.name,
          description: cat.description,
          consultationTypes: cat.consultationConfig?.enabled_types || [],
          autoPrompts: cat.consultationConfig?.auto_prompts || [],
          requiredFields: cat.consultationConfig?.required_fields || [],
          optionalFields: cat.consultationConfig?.optional_fields || []
        }));

      res.json({
        status: "success",
        data: {
          categories: consultationCategories,
          totalCategories: consultationCategories.length
        }
      });

    } catch (error) {
      console.error("RASA API Error - Get Consultation Categories:", error);
      res.status(500).json({
        status: "error",
        message: "Lỗi khi lấy danh sách danh mục tư vấn"
      });
    }
  });

  /**
   * GET /api/consultation/search
   * Search products with consultation data by keywords
   */
  app.get("/api/consultation/search", async (req, res) => {
    try {
      const { q, category, consultation_type } = req.query;
      
      if (!q || typeof q !== 'string') {
        return res.status(400).json({
          status: "error",
          message: "Từ khóa tìm kiếm là bắt buộc"
        });
      }

      // Get all products with search and proper category filtering
      const allProducts = await storage.getProducts(100, category as string, q as string);
      
      // Filter products that have consultation data
      const consultationProducts = [];
      
      for (const product of allProducts) {
        if (product.consultationData && Object.keys(product.consultationData).length > 0) {
          // Get category info
          let categoryInfo = null;
          if (product.categoryId) {
            const cat = await storage.getCategory(product.categoryId);
            if (cat && cat.consultationConfig) {
              categoryInfo = {
                id: cat.id,
                name: cat.name,
                consultationTypes: cat.consultationConfig?.enabled_types || []
              };
            }
          }

          // Apply category filter if specified
          if (category && product.categoryId !== category) {
            continue;
          }

          // Apply consultation type filter if specified
          if (consultation_type && categoryInfo && typeof consultation_type === 'string') {
            if (!categoryInfo.consultationTypes.includes(consultation_type as ConsultationType)) {
              continue;
            }
          }

          consultationProducts.push({
            id: product.id,
            name: product.name,
            description: product.description,
            price: product.price,
            image: product.image,
            category: categoryInfo,
            consultationData: product.consultationData,
            relevantQuestions: categoryInfo?.consultationTypes || []
          });
        }
      }

      res.json({
        status: "success",
        data: {
          products: consultationProducts,
          totalResults: consultationProducts.length,
          searchQuery: q,
          filters: {
            category: category || null,
            consultationType: consultation_type || null
          }
        }
      });

    } catch (error) {
      console.error("RASA API Error - Search Consultation Products:", error);
      res.status(500).json({
        status: "error",
        message: "Lỗi khi tìm kiếm sản phẩm tư vấn"
      });
    }
  });

  /**
   * POST /api/consultation/generate-advice
   * Generate consultation advice based on product data and customer question
   */
  app.post("/api/consultation/generate-advice", async (req, res) => {
    try {
      const { productId, questionType, customerQuestion } = req.body;
      
      if (!productId || !questionType) {
        return res.status(400).json({
          status: "error",
          message: "Product ID và loại câu hỏi là bắt buộc"
        });
      }

      // Get product consultation data
      const product = await storage.getProduct(productId);
      if (!product) {
        return res.status(404).json({
          status: "error",
          message: "Không tìm thấy sản phẩm"
        });
      }

      // Get category templates
      let templates = {};
      if (product.categoryId) {
        const category = await storage.getCategory(product.categoryId);
        if (category && category.consultationTemplates) {
          templates = category.consultationTemplates;
        }
      }

      // Generate advice based on consultation data and templates
      const consultationData = product.consultationData || {};
      let advice = "";

      switch (questionType) {
        case "usage_guide":
          if ((templates as any).usage_guide_template && (consultationData as any).cách_thoa) {
            advice = (templates as any).usage_guide_template
              .replace(/\{cách_thoa\}/g, (consultationData as any).cách_thoa)
              .replace(/\{tần_suất\}/g, (consultationData as any).tần_suất || "theo hướng dẫn");
          }
          break;
        case "safety_profile":
          if ((templates as any).safety_template && (consultationData as any).lưu_ý_an_toàn) {
            advice = (templates as any).safety_template
              .replace(/\{lưu_ý_an_toàn\}/g, (consultationData as any).lưu_ý_an_toàn)
              .replace(/\{patch_test_required\}/g, (consultationData as any).patch_test_required || "");
          }
          break;
        case "care_instructions":
          if ((templates as any).care_template && (consultationData as any).bảo_quản) {
            advice = (templates as any).care_template
              .replace(/\{bảo_quản\}/g, (consultationData as any).bảo_quản);
          }
          break;
        default:
          advice = "Xin lỗi, tôi chưa có thông tin tư vấn cho loại câu hỏi này.";
      }

      if (!advice) {
        advice = `Xin lỗi, tôi chưa có thông tin chi tiết về ${questionType} cho sản phẩm ${product.name}. Bạn có thể liên hệ tư vấn viên để được hỗ trợ tốt hơn.`;
      }

      res.json({
        status: "success",
        data: {
          productId,
          productName: product.name,
          questionType,
          customerQuestion: customerQuestion || "",
          advice,
          consultationData: consultationData
        }
      });

    } catch (error) {
      console.error("RASA API Error - Generate Consultation Advice:", error);
      res.status(500).json({
        status: "error",
        message: "Lỗi khi tạo lời tư vấn"
      });
    }
  });

  // 🤖 Intent Detection & Smart Response
  app.post('/api/rasa/bot/detect-intent', async (req, res) => {
    try {
      const { message, customerId } = req.body;

      if (!message || typeof message !== 'string') {
        return res.status(400).json({
          status: 'error',
          message: 'Message is required'
        });
      }

      const detected = detectIntent(message);

      if (!detected || detected.confidence < 0.3) {
        return res.json({
          status: 'success',
          intent: 'unknown',
          confidence: detected?.confidence || 0,
          response: 'Xin lỗi, mình chưa hiểu ý bạn. Bạn có thể hỏi về:\n' +
                   '• Hạng thành viên và nâng hạng\n' +
                   '• Gợi ý sản phẩm phù hợp\n' +
                   '• Giỏ hàng và đơn hàng\n' +
                   '• Sản phẩm theo mùa/dịp lễ'
        });
      }

      const needsCustomer = requiresCustomerIdentification(detected.intent);
      
      if (needsCustomer && !customerId) {
        return res.json({
          status: 'success',
          intent: detected.intent,
          confidence: detected.confidence,
          needsCustomerId: true,
          response: getIntentResponse(detected.intent),
          matchedKeywords: detected.matchedKeywords
        });
      }

      return res.json({
        status: 'success',
        intent: detected.intent,
        confidence: detected.confidence,
        needsCustomerId: needsCustomer,
        response: getIntentResponse(detected.intent),
        matchedKeywords: detected.matchedKeywords,
        suggestedAction: getSuggestedAction(detected.intent, customerId)
      });

    } catch (error) {
      console.error('Intent detection error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Không thể phân tích ý định'
      });
    }
  });

  // 🎯 Bot Intelligence: Tier Upgrade Check
  app.get('/api/rasa/bot/tier-upgrade/:customerId', async (req, res) => {
    try {
      const { customerId } = req.params;
      
      const response = await fetch(`${process.env.API_BASE_URL || 'http://localhost:5000'}/api/bot/tier/check-upgrade/${customerId}`);
      const data = await response.json();

      if (!response.ok) {
        return res.status(response.status).json(data);
      }

      if (data.canUpgrade) {
        const tierNames: Record<string, string> = {
          member: 'Thành viên',
          silver: 'Bạc',
          gold: 'Vàng',
          diamond: 'Kim Cương'
        };

        const message = `🎉 Chúc mừng! Bạn sắp lên hạng ${tierNames[data.nextTier] || data.nextTier}!\n\n` +
                       `💎 Hạng hiện tại: ${tierNames[data.currentTier] || data.currentTier}\n` +
                       `🎯 Còn thiếu: ${data.amountNeeded.toLocaleString('vi-VN')}₫\n` +
                       `💰 Đã chi tiêu: ${data.totalSpent.toLocaleString('vi-VN')}₫\n` +
                       `📊 Tiến độ: ${data.progress}%\n\n` +
                       `Mua thêm ${data.amountNeeded.toLocaleString('vi-VN')}₫ để nhận ưu đãi đặc biệt! 🎁`;

        return res.json({
          status: 'success',
          intent: 'tier_upgrade_interest',
          response: message,
          data: {
            canUpgrade: true,
            currentTier: data.currentTier,
            nextTier: data.nextTier,
            amountNeeded: data.amountNeeded,
            progress: data.progress,
            totalSpent: data.totalSpent
          }
        });
      } else {
        const tierNames: Record<string, string> = {
          member: 'Thành viên',
          silver: 'Bạc',
          gold: 'Vàng',
          diamond: 'Kim Cương'
        };

        const message = `💎 Hạng thành viên hiện tại: ${tierNames[data.currentTier] || data.currentTier}\n\n` +
                       `Bạn đang ở hạng cao nhất hoặc cần mua thêm nhiều để lên hạng. ` +
                       `Hãy tiếp tục ủng hộ để nhận nhiều ưu đãi hơn! 🌟`;

        return res.json({
          status: 'success',
          intent: 'tier_upgrade_interest',
          response: message,
          data: {
            canUpgrade: false,
            currentTier: data.currentTier,
            totalSpent: data.totalSpent
          }
        });
      }
    } catch (error) {
      console.error('Tier upgrade check error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Không thể kiểm tra hạng thành viên'
      });
    }
  });

  // 🤖 Bot Intelligence: Product Recommendations
  app.get('/api/rasa/bot/recommendations/:customerId', async (req, res) => {
    try {
      const { customerId } = req.params;
      const { type = 'personalized' } = req.query;

      let endpoint = '';
      if (type === 'trending') {
        endpoint = '/api/bot/recommendations/trending';
      } else if (type === 'seasonal') {
        endpoint = '/api/bot/recommendations/seasonal';
      } else {
        endpoint = `/api/bot/recommendations/${customerId}`;
      }

      const response = await fetch(`${process.env.API_BASE_URL || 'http://localhost:5000'}${endpoint}`);
      const data = await response.json();

      if (!response.ok) {
        return res.status(response.status).json(data);
      }

      if (!data.products || data.products.length === 0) {
        return res.json({
          status: 'success',
          intent: 'product_recommendation_request',
          response: 'Xin lỗi, hiện tại chưa có sản phẩm phù hợp để gợi ý cho bạn. Bạn có thể xem danh mục sản phẩm của chúng tôi! 🛍️',
          data: { products: [] }
        });
      }

      let message = '';
      if (type === 'trending') {
        message = '🔥 **Top sản phẩm bán chạy:**\n\n';
      } else if (type === 'seasonal') {
        message = `🎉 **${data.message}**\n\n`;
      } else {
        message = '✨ **Gợi ý dành riêng cho bạn:**\n\n';
      }

      data.products.slice(0, 5).forEach((product: any, index: number) => {
        const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
        message += `${index + 1}. **${product.name}**\n`;
        message += `   💰 Giá: ${price.toLocaleString('vi-VN')}₫\n`;
        if (product.description) {
          const shortDesc = product.description.substring(0, 60) + (product.description.length > 60 ? '...' : '');
          message += `   📝 ${shortDesc}\n`;
        }
        message += '\n';
      });

      message += '\nBạn quan tâm sản phẩm nào? Mình có thể tư vấn chi tiết hơn! 💬';

      return res.json({
        status: 'success',
        intent: 'product_recommendation_request',
        response: message,
        data: {
          products: data.products.slice(0, 5),
          recommendationType: type
        }
      });
    } catch (error) {
      console.error('Product recommendations error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Không thể lấy gợi ý sản phẩm'
      });
    }
  });

  // 🛒 Bot Intelligence: Cart Recovery
  app.post('/api/rasa/bot/cart-recovery/:customerId', async (req, res) => {
    try {
      const { customerId } = req.params;
      const { hoursAgo = 24 } = req.body;

      const response = await fetch(`${process.env.API_BASE_URL || 'http://localhost:5000'}/api/bot/cart/recover/${customerId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hoursAgo })
      });
      const data = await response.json();

      if (!response.ok) {
        return res.status(response.status).json(data);
      }

      if (!data.abandonedItems || data.abandonedItems.length === 0) {
        return res.json({
          status: 'success',
          intent: 'cart_recovery',
          response: 'Bạn không có sản phẩm nào trong giỏ hàng bỏ quên. Hãy tiếp tục mua sắm nhé! 🛍️',
          data: { abandonedItems: [] }
        });
      }

      let message = '🛒 **Bạn còn sản phẩm trong giỏ hàng chưa thanh toán:**\n\n';
      
      data.abandonedItems.forEach((item: any, index: number) => {
        const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
        message += `${index + 1}. **${item.name}**\n`;
        message += `   💰 ${price.toLocaleString('vi-VN')}₫ x ${item.quantity}\n`;
        if (item.description) {
          const shortDesc = item.description.substring(0, 50) + (item.description.length > 50 ? '...' : '');
          message += `   📝 ${shortDesc}\n`;
        }
        message += '\n';
      });

      message += `**Tổng giá trị:** ${data.cartValue.toLocaleString('vi-VN')}₫\n\n`;
      message += 'Bạn có muốn hoàn tất đơn hàng không? Mình sẵn sàng hỗ trợ! 💬';

      return res.json({
        status: 'success',
        intent: 'cart_recovery',
        response: message,
        data: {
          abandonedItems: data.abandonedItems,
          cartValue: data.cartValue,
          itemCount: data.itemCount
        }
      });
    } catch (error) {
      console.error('Cart recovery error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Không thể kiểm tra giỏ hàng'
      });
    }
  });
}

// Helper function to get product unit
async function getProductUnit(productId: string): Promise<string> {
  try {
    const product = await storage.getProduct(productId);
    return 'cái';
  } catch {
    return 'sản phẩm';
  }
}

// Helper function to suggest next action based on intent
function getSuggestedAction(intent: string, customerId?: string): string {
  if (!customerId) {
    return '/api/rasa/bot/detect-intent';
  }

  const actions: { [key: string]: string } = {
    tier_upgrade_interest: `/api/rasa/bot/tier-upgrade/${customerId}`,
    product_recommendation_request: `/api/rasa/bot/recommendations/${customerId}?type=personalized`,
    cart_recovery: `/api/rasa/bot/cart-recovery/${customerId}`,
    seasonal_recommendations: `/api/bot/recommendations/seasonal`,
    tier_status_check: `/api/bot/tier/status/${customerId}`
  };

  return actions[intent] || '/api/rasa/bot/detect-intent';
}