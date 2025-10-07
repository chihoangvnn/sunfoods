import { Router } from 'express';
import { storage } from '../storage';
import { cacheMiddleware, invalidateCacheMiddleware, CacheKeys } from '../middleware/cache';
import { requirePOSAuth } from '../middleware/pos-auth';
import { db } from '../db';
import { categoryFaqTemplates, contentFaqAssignments } from '@shared/schema';
import { eq, and, sql } from 'drizzle-orm';
import { AIFAQGenerator } from '../services/ai-faq-generator';
import { 
  filterProductsByVIPAccess, 
  isProductAccessible, 
  getCustomerTierFromSession, 
  isAdminUser 
} from '../utils/vip-utils';

const router = Router();

// 🏷️ Auto-inherit FAQ Templates from Category helper function
async function inheritCategoryFAQTemplates(productId: string, categoryId: string): Promise<number> {
  if (!categoryId) {
    console.log('🤷 No category specified for product, skipping FAQ inheritance');
    return 0;
  }

  try {
    console.log(`🏷️ Auto-inheriting FAQ templates for product ${productId} from category ${categoryId}`);
    
    // Get active auto-inherit templates for this category
    const templates = await db
      .select()
      .from(categoryFaqTemplates)
      .where(
        and(
          eq(categoryFaqTemplates.categoryId, categoryId),
          eq(categoryFaqTemplates.isActive, true),
          eq(categoryFaqTemplates.autoInherit, true)
        )
      )
      .orderBy(categoryFaqTemplates.sortOrder);

    if (templates.length === 0) {
      console.log('🤷 No auto-inherit FAQ templates found for this category');
      return 0;
    }

    console.log(`📋 Found ${templates.length} FAQ templates to inherit`);

    // Create content FAQ assignments for inherited FAQs
    const assignments = templates.map((template, index) => ({
      faqId: template.faqId,
      contentType: 'product' as const,
      contentId: productId,
      sortOrder: template.sortOrder || index,
      isVisible: true,
      isInherited: true,
      templateId: template.id,
      inheritedAt: sql`now()`,
      assignedBy: 'system_auto_inherit',
      assignmentNote: `Auto-inherited from category FAQ template: ${template.templateNote || 'No note'}`
    }));

    // Insert all assignments at once
    const createdAssignments = await db
      .insert(contentFaqAssignments)
      .values(assignments)
      .returning();

    console.log(`✅ Successfully inherited ${createdAssignments.length} FAQ templates for product`);
    return createdAssignments.length;

  } catch (error) {
    console.error('❌ Error inheriting FAQ templates:', error);
    // Don't throw error - product creation should succeed even if FAQ inheritance fails
    return 0;
  }
}

// 🔒 Simple auth middleware for development
const requireAuth = (req: any, res: any, next: any) => {
  // For development, allow all requests
  if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
    next();
    return;
  }
  
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ 
      error: "Unauthorized. Please log in.",
      code: "AUTH_REQUIRED"
    });
  }
  next();
};

// GET /api/products/admin/all - List all products for admin (no POS auth required)
// 👑 Admin endpoint for affiliate product assignment and other admin features
router.get('/admin/all', requireAuth, async (req, res) => {
  try {
    const { limit, categoryId, search, offset, sortBy, sortOrder } = req.query;
    const limitNum = limit ? parseInt(limit as string) : 1000; // Higher limit for admin
    const offsetNum = offset ? parseInt(offset as string) : 0;
    const sortByStr = sortBy as string || 'newest';
    const sortOrderStr = sortOrder as string || 'desc';
    
    console.log('👑 ADMIN API: Getting all products with filters:', { 
      limitNum, categoryId, search, offsetNum, sortBy: sortByStr, sortOrder: sortOrderStr 
    });
    
    const products = await storage.getProducts(
      limitNum, 
      categoryId as string, 
      search as string, 
      offsetNum,
      sortByStr,
      sortOrderStr
    );
    
    console.log(`👑 Admin products fetched: ${products.length} total`);
    
    res.json({
      success: true,
      products: products
    });
  } catch (error) {
    console.error('❌ Error fetching admin products:', error);
    res.status(500).json({ 
      error: 'Failed to fetch products',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/products - List all products with search and sort support
// ⚠️ NO CACHING: This endpoint returns personalized results based on customer VIP tier
router.get('/', requirePOSAuth, async (req, res) => {
  try {
    const { limit, categoryId, search, offset, sortBy, sortOrder } = req.query;
    const limitNum = limit ? parseInt(limit as string) : 50;
    const offsetNum = offset ? parseInt(offset as string) : 0;
    const sortByStr = sortBy as string || 'newest';
    const sortOrderStr = sortOrder as string || 'desc';
    
    console.log('📊 API: Getting products with filters:', { 
      limitNum, categoryId, search, offsetNum, sortBy: sortByStr, sortOrder: sortOrderStr 
    });
    
    const products = await storage.getProducts(
      limitNum, 
      categoryId as string, 
      search as string, 
      offsetNum,
      sortByStr,
      sortOrderStr
    );
    
    // 💎 VIP TIER FILTERING - Filter products based on customer VIP tier
    const customerTier = getCustomerTierFromSession(req.session);
    const isAdmin = isAdminUser(req.session);
    
    console.log('💎 VIP Filter - Customer tier:', customerTier, 'Is Admin:', isAdmin);
    
    // Apply VIP access control filtering
    const filteredProducts = filterProductsByVIPAccess(products, customerTier, isAdmin);
    
    console.log(`📊 Filtered products: ${products.length} → ${filteredProducts.length} (removed ${products.length - filteredProducts.length} VIP-restricted)`);
    
    res.json(filteredProducts);
  } catch (error) {
    console.error('❌ Error fetching products:', error);
    res.status(500).json({ 
      error: 'Failed to fetch products',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/products/slug/:slug - Get product by slug (for public ProductPage)
router.get('/slug/:slug', 
  cacheMiddleware(300, (req) => CacheKeys.productSlug(req.params.slug)),
  async (req, res) => {
  try {
    const { slug } = req.params;
    console.log('📊 API: Getting product with slug:', slug);
    
    const product = await storage.getProductBySlug(slug);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // 💎 VIP TIER ACCESS CHECK - Check if customer can access this product
    const customerTier = getCustomerTierFromSession(req.session);
    const isAdmin = isAdminUser(req.session);
    
    if (!isProductAccessible(product, customerTier, isAdmin)) {
      console.log(`🚫 VIP Access Denied - Product ${product.id} requires ${product.requiredVipTier || 'VIP'}, customer has ${customerTier}`);
      return res.status(403).json({ 
        error: 'Access forbidden',
        message: 'This product is exclusive to VIP members',
        requiredTier: product.requiredVipTier || 'VIP',
        code: 'VIP_ACCESS_REQUIRED'
      });
    }
    
    res.json(product);
  } catch (error) {
    console.error('❌ Error fetching product by slug:', error);
    res.status(500).json({ 
      error: 'Failed to fetch product',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/products/:id/faqs - Get product FAQs
router.get('/:id/faqs', async (req, res) => {
  try {
    const { id } = req.params;
    const includeInactive = req.query.includeInactive === 'true';
    console.log('📊 API: Getting FAQs for product:', id, includeInactive ? '(including inactive)' : '(active only)');
    
    const faqs = await storage.getProductFAQs(id, includeInactive);
    res.json(faqs);
  } catch (error) {
    console.error('❌ Error fetching product FAQs:', error);
    res.status(500).json({ 
      error: 'Failed to fetch product FAQs',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/products/:id/policies - Get product policies
router.get('/:id/policies', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('📊 API: Getting policies for product:', id);
    
    const associations = await storage.getProductPolicyAssociations(id);
    // Transform associations to return just the policies with defensive mapping
    const policies = associations
      .map(assoc => assoc.policy)
      .filter(Boolean); // Remove any null/undefined policies
    res.json(policies);
  } catch (error) {
    console.error('❌ Error fetching product policies:', error);
    res.status(500).json({ 
      error: 'Failed to fetch product policies',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/products/by-barcode - Get product by barcode (optimized for barcode scanning)
// IMPORTANT: This route must come BEFORE /:id to avoid conflicts
router.get('/by-barcode', 
  requirePOSAuth,
  cacheMiddleware(120), // Shorter cache for barcode lookup
  async (req, res) => {
  try {
    const { code } = req.query;
    
    if (!code) {
      return res.status(400).json({ error: 'Barcode code is required' });
    }
    
    console.log('📊 API: Getting product by barcode:', code);
    
    // First try to get by SKU
    let product = await storage.getProductBySKU(code as string);
    
    // If not found by SKU, search by itemCode
    if (!product) {
      const products = await storage.getProducts(1, undefined, code as string);
      product = products.find(p => p.itemCode === code);
    }
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found', code });
    }
    
    res.json(product);
  } catch (error) {
    console.error('❌ Error fetching product by barcode:', error);
    res.status(500).json({ 
      error: 'Failed to fetch product by barcode',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/products/:id/reviews - Get product reviews with stats
router.get('/:id/reviews', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('📊 API: Getting reviews for product:', id);
    
    const reviewsData = await storage.getProductReviewsWithStats(id);
    res.json(reviewsData);
  } catch (error) {
    console.error('❌ Error fetching product reviews:', error);
    res.status(500).json({ 
      error: 'Failed to fetch product reviews',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/products/:id - Get single product
router.get('/:id', requirePOSAuth, async (req, res) => {
  try {
    const { id } = req.params;
    console.log('📊 API: Getting product with ID:', id);
    
    const product = await storage.getProduct(id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // 💎 VIP TIER ACCESS CHECK - Check if customer can access this product
    const customerTier = getCustomerTierFromSession(req.session);
    const isAdmin = isAdminUser(req.session);
    
    if (!isProductAccessible(product, customerTier, isAdmin)) {
      console.log(`🚫 VIP Access Denied - Product ${product.id} requires ${product.requiredVipTier || 'VIP'}, customer has ${customerTier}`);
      return res.status(403).json({ 
        error: 'Access forbidden',
        message: 'This product is exclusive to VIP members',
        requiredTier: product.requiredVipTier || 'VIP',
        code: 'VIP_ACCESS_REQUIRED'
      });
    }
    
    res.json(product);
  } catch (error) {
    console.error('❌ Error fetching product:', error);
    res.status(500).json({ 
      error: 'Failed to fetch product',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/products - Create new product  
router.post('/', requireAuth, invalidateCacheMiddleware('product'), async (req, res) => {
  try {
    console.log('📊 API: Creating new product');
    
    // Map camelCase frontend fields to snake_case database fields
    const { 
      originalPrice, 
      fakeSalesCount, 
      isNew, 
      isTopseller, 
      isFreeshipping, 
      isBestseller,
      categoryId,  // Add categoryId extraction
      ...otherFields 
    } = req.body;
    
    const createData = {
      ...otherFields,
      // Category field mapping (CRITICAL for auto-inheritance)
      ...(categoryId !== undefined && { category_id: categoryId }),
      // Marketing & Pricing fields mapping
      ...(originalPrice !== undefined && { original_price: originalPrice }),
      ...(fakeSalesCount !== undefined && { fake_sales_count: fakeSalesCount }),
      ...(isNew !== undefined && { is_new: isNew }),
      ...(isTopseller !== undefined && { is_topseller: isTopseller }),
      ...(isFreeshipping !== undefined && { is_freeshipping: isFreeshipping }),
      ...(isBestseller !== undefined && { is_bestseller: isBestseller }),
    };
    
    console.log('📊 Creating product with fields:', { 
      categoryId, originalPrice, fakeSalesCount, isNew, isTopseller, isFreeshipping, isBestseller 
    });
    console.log('🗂️ Mapped createData category_id:', createData.category_id);
    
    const product = await storage.createProduct(createData);
    console.log('🎯 PRODUCT CREATED:', product.id, 'categoryId:', createData.category_id);
    
    // 🏷️ Auto-inherit FAQ templates from category (if categoryId is provided)
    try {
      if (createData.category_id || createData.categoryId) {
        const categoryId = createData.category_id || createData.categoryId;
        console.log('🏷️ STARTING AUTO-INHERITANCE for product:', product.id, 'category:', categoryId);
        const inheritedCount = await inheritCategoryFAQTemplates(product.id, categoryId);
        console.log(`✅ AUTO-INHERITANCE SUCCESS: Inherited ${inheritedCount} FAQ templates from category ${categoryId}`);
      } else {
        console.log('🤷 NO CATEGORY PROVIDED - Skipping FAQ auto-inheritance');
      }
    } catch (inheritError) {
      console.error('❌ AUTO-INHERITANCE ERROR:', inheritError);
    }

    // 🤖 AUTO-GENERATE AI FAQs for new product (CRITICAL REQUIREMENT)
    try {
      console.log('🤖 STARTING AI FAQ AUTO-GENERATION for new product:', product.id);
      const aiFAQGenerator = new AIFAQGenerator();
      
      // Trigger AI FAQ generation in background (don't wait for completion)
      aiFAQGenerator.generateFAQsForProduct(product.id, false).then((result) => {
        if (result.success) {
          console.log(`✅ AI FAQ AUTO-GENERATION SUCCESS: Generated ${result.totalGenerated} FAQs for product ${product.id}`);
        } else {
          console.log(`⚠️ AI FAQ AUTO-GENERATION SKIPPED: ${result.error || 'Product may already have FAQs'}`);
        }
      }).catch((error) => {
        console.error('❌ AI FAQ AUTO-GENERATION FAILED:', error);
      });
      
    } catch (error) {
      console.error('❌ Failed to start AI FAQ auto-generation:', error);
      // Don't fail product creation if AI FAQ generation fails
    }
    
    res.status(201).json(product);
  } catch (error) {
    console.error('❌ Error creating product:', error);
    res.status(500).json({ 
      error: 'Failed to create product',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// PUT /api/products/:id - Update existing product
router.put('/:id', requireAuth, invalidateCacheMiddleware('product'), async (req, res) => {
  try {
    const { id } = req.params;
    console.log('📊 API: Updating product with ID:', id);
    
    // Map camelCase frontend fields to snake_case database fields
    const { 
      originalPrice, 
      fakeSalesCount, 
      isNew, 
      isTopseller, 
      isFreeshipping, 
      isBestseller,
      categoryId,  // Add categoryId extraction for updates too
      ...otherFields 
    } = req.body;
    
    const updateData = {
      ...otherFields,
      // Category field mapping (for consistency with create)
      ...(categoryId !== undefined && { category_id: categoryId }),
      // Marketing & Pricing fields mapping (with proper null handling)
      ...(originalPrice !== undefined && { 
        original_price: originalPrice && originalPrice.toString().trim() !== "" 
          ? parseFloat(originalPrice) 
          : null 
      }),
      ...(fakeSalesCount !== undefined && { fake_sales_count: parseInt(fakeSalesCount) || 0 }),
      ...(isNew !== undefined && { is_new: Boolean(isNew) }),
      ...(isTopseller !== undefined && { is_topseller: Boolean(isTopseller) }),
      ...(isFreeshipping !== undefined && { is_freeshipping: Boolean(isFreeshipping) }),
      ...(isBestseller !== undefined && { is_bestseller: Boolean(isBestseller) }),
    };
    
    console.log('📊 Mapped marketing fields:', { 
      originalPrice, fakeSalesCount, isNew, isTopseller, isFreeshipping, isBestseller 
    });
    
    const updatedProduct = await storage.updateProduct(id, updateData);
    if (!updatedProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // 🤖 AUTO-GENERATE AI FAQs for updated product (if significant changes)
    try {
      // Only auto-generate if product name, description, or category changed
      if (updateData.name || updateData.description || updateData.category_id) {
        console.log('🤖 STARTING AI FAQ AUTO-GENERATION for updated product:', updatedProduct.id);
        const aiFAQGenerator = new AIFAQGenerator();
        
        // Trigger AI FAQ generation in background (don't wait for completion)
        aiFAQGenerator.generateFAQsForProduct(updatedProduct.id, false).then((result) => {
          if (result.success) {
            console.log(`✅ AI FAQ AUTO-GENERATION SUCCESS: Generated ${result.totalGenerated} FAQs for updated product ${updatedProduct.id}`);
          } else {
            console.log(`⚠️ AI FAQ AUTO-GENERATION SKIPPED: ${result.error || 'Product may already have FAQs'}`);
          }
        }).catch((error) => {
          console.error('❌ AI FAQ AUTO-GENERATION FAILED:', error);
        });
      } else {
        console.log('🤷 MINOR UPDATE - Skipping AI FAQ auto-generation');
      }
    } catch (error) {
      console.error('❌ Failed to start AI FAQ auto-generation:', error);
      // Don't fail product update if AI FAQ generation fails
    }
    
    res.json(updatedProduct);
  } catch (error) {
    console.error('❌ Error updating product:', error);
    res.status(500).json({ 
      error: 'Failed to update product',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// DELETE /api/products/:id - Delete product  
router.delete('/:id', requireAuth, invalidateCacheMiddleware('product'), async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🗑️ API: Deleting product with ID:', id);
    
    if (!id) {
      return res.status(400).json({ 
        error: 'Product ID is required',
        message: 'Please provide a valid product ID' 
      });
    }
    
    const deleted = await storage.deleteProduct(id);
    
    if (!deleted) {
      console.log('❌ Product cannot be deleted:', id);
      return res.status(400).json({ 
        error: 'Cannot delete product',
        message: 'This product cannot be deleted because it has been ordered by customers or does not exist',
        code: 'PRODUCT_HAS_ORDERS'
      });
    }

    console.log('✅ Product deleted successfully:', id);
    res.json({ 
      success: true, 
      message: 'Product deleted successfully',
      deletedId: id
    });

  } catch (error) {
    console.error('❌ Error deleting product:', error);
    res.status(500).json({ 
      error: 'Failed to delete product',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;