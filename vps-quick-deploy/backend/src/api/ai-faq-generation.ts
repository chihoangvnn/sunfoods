import { Request, Response } from 'express';
import { z } from 'zod';
import { aiFAQGenerator, ProductContext } from '../services/ai-faq-generator';
import { db } from '../db';
import { products, categories } from '@shared/schema';
import { eq } from 'drizzle-orm';

// 🤖 AI FAQ Generation API for Vietnamese incense business
// Auto-generates FAQs when products are created or updated

// Validation schemas
const GenerateFAQsSchema = z.object({
  productId: z.string().uuid('Invalid product ID format'),
  force: z.boolean().default(false) // Force regeneration even if FAQs exist
});

const BulkGenerateFAQsSchema = z.object({
  productIds: z.array(z.string().uuid()).min(1, 'At least one product required').max(50, 'Maximum 50 products per bulk operation'),
  force: z.boolean().default(false)
});

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

/**
 * 🤖 **POST /api/ai-faq-generation/generate** - Generate FAQs for a specific product
 */
export const generateProductFAQs = async (req: Request, res: Response) => {
  try {
    const { productId, force } = GenerateFAQsSchema.parse(req.body);
    
    console.log(`🤖 AI FAQ generation requested for product: ${productId}, force: ${force}`);

    // Fetch product with category information
    const productData = await db
      .select({
        id: products.id,
        name: products.name,
        description: products.description,
        categoryId: products.categoryId,
        categoryName: categories.name,
        ingredients: products.ingredients,
        benefits: products.benefits,
        usageInstructions: products.usageInstructions,
        productStory: products.productStory
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(eq(products.id, productId))
      .limit(1);

    if (productData.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Product not found",
        code: "PRODUCT_NOT_FOUND"
      });
    }

    const product = productData[0];

    // Check if regeneration is needed
    if (!force) {
      const shouldRegenerate = await aiFAQGenerator.shouldRegenerateFAQs(productId);
      if (!shouldRegenerate) {
        return res.status(200).json({
          success: true,
          message: "Product already has FAQs. Use force=true to regenerate.",
          productId,
          skipped: true
        });
      }
    }

    // Prepare product context for AI
    const productContext: ProductContext = {
      id: product.id,
      name: product.name,
      description: product.description || undefined,
      category: product.categoryId || undefined,
      categoryName: product.categoryName || undefined,
      ingredients: Array.isArray(product.ingredients) ? product.ingredients.join(', ') : product.ingredients || undefined,
      benefits: Array.isArray(product.benefits) ? product.benefits.join(', ') : product.benefits || undefined,
      usageInstructions: typeof product.usageInstructions === 'object' ? JSON.stringify(product.usageInstructions) : product.usageInstructions || undefined,
      productStory: product.productStory || undefined
    };

    // Generate FAQs using AI
    const result = await aiFAQGenerator.generateProductFAQs(productContext);

    // Return result
    if (result.success) {
      res.status(201).json({
        success: true,
        data: result,
        message: `Successfully generated ${result.totalGenerated} FAQs for ${product.name}`
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error || "Failed to generate FAQs",
        code: "GENERATION_FAILED",
        productId
      });
    }

  } catch (error) {
    console.error('❌ Error in AI FAQ generation:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: error.errors,
        code: "VALIDATION_ERROR"
      });
    }

    res.status(500).json({
      success: false,
      error: "Internal server error",
      code: "INTERNAL_ERROR"
    });
  }
};

/**
 * 🔄 **POST /api/ai-faq-generation/bulk-generate** - Bulk generate FAQs for multiple products
 */
export const bulkGenerateProductFAQs = async (req: Request, res: Response) => {
  try {
    const { productIds, force } = BulkGenerateFAQsSchema.parse(req.body);
    
    console.log(`🔄 Bulk AI FAQ generation for ${productIds.length} products, force: ${force}`);

    const results = [];
    let successCount = 0;
    let skippedCount = 0;

    // Process each product
    for (const productId of productIds) {
      try {
        // Fetch product data
        const productData = await db
          .select({
            id: products.id,
            name: products.name,
            description: products.description,
            categoryId: products.categoryId,
            categoryName: categories.name,
            ingredients: products.ingredients,
            benefits: products.benefits,
            usageInstructions: products.usageInstructions,
            productStory: products.productStory
          })
          .from(products)
          .leftJoin(categories, eq(products.categoryId, categories.id))
          .where(eq(products.id, productId))
          .limit(1);

        if (productData.length === 0) {
          results.push({
            productId,
            success: false,
            error: "Product not found"
          });
          continue;
        }

        const product = productData[0];

        // Check if regeneration is needed
        if (!force) {
          const shouldRegenerate = await aiFAQGenerator.shouldRegenerateFAQs(productId);
          if (!shouldRegenerate) {
            results.push({
              productId,
              success: true,
              skipped: true,
              message: "Product already has FAQs"
            });
            skippedCount++;
            continue;
          }
        }

        // Prepare context and generate
        const productContext: ProductContext = {
          id: product.id,
          name: product.name,
          description: product.description || undefined,
          category: product.categoryId || undefined,
          categoryName: product.categoryName || undefined,
          ingredients: Array.isArray(product.ingredients) ? product.ingredients.join(', ') : product.ingredients || undefined,
          benefits: Array.isArray(product.benefits) ? product.benefits.join(', ') : product.benefits || undefined,
          usageInstructions: typeof product.usageInstructions === 'object' ? JSON.stringify(product.usageInstructions) : product.usageInstructions || undefined,
          productStory: product.productStory || undefined
        };

        const result = await aiFAQGenerator.generateProductFAQs(productContext);
        results.push({
          ...result
        });

        if (result.success) {
          successCount++;
        }

      } catch (error) {
        console.error(`❌ Error generating FAQs for product ${productId}:`, error);
        results.push({
          productId,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    res.json({
      success: true,
      data: {
        results,
        summary: {
          total: productIds.length,
          successful: successCount,
          skipped: skippedCount,
          failed: productIds.length - successCount - skippedCount
        }
      },
      message: `Bulk generation completed: ${successCount} successful, ${skippedCount} skipped, ${productIds.length - successCount - skippedCount} failed`
    });

  } catch (error) {
    console.error('❌ Error in bulk AI FAQ generation:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: error.errors,
        code: "VALIDATION_ERROR"
      });
    }

    res.status(500).json({
      success: false,
      error: "Internal server error",
      code: "INTERNAL_ERROR"
    });
  }
};

/**
 * 📊 **GET /api/ai-faq-generation/status/:productId** - Check FAQ generation status
 */
export const getFAQGenerationStatus = async (req: Request, res: Response) => {
  try {
    const productId = req.params.id;
    
    if (!productId) {
      return res.status(400).json({
        success: false,
        error: "Product ID is required",
        code: "MISSING_PRODUCT_ID"
      });
    }

    // Check if product exists
    const product = await db
      .select({ id: products.id, name: products.name })
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    if (product.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Product not found",
        code: "PRODUCT_NOT_FOUND"
      });
    }

    // Check if FAQs need regeneration
    const needsRegeneration = await aiFAQGenerator.shouldRegenerateFAQs(productId);

    res.json({
      success: true,
      data: {
        productId,
        productName: product[0].name,
        needsRegeneration,
        hasExistingFAQs: !needsRegeneration
      }
    });

  } catch (error) {
    console.error('❌ Error checking FAQ generation status:', error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      code: "INTERNAL_ERROR"
    });
  }
};

// Export with auth middleware
export const aiFAQGenerationRoutes = {
  generate: [requireAuth, generateProductFAQs],
  bulkGenerate: [requireAuth, bulkGenerateProductFAQs],
  status: [requireAuth, getFAQGenerationStatus]
};

// Default router export for compatibility
import { Router } from 'express';
const router = Router();
router.post('/generate', ...aiFAQGenerationRoutes.generate);
router.post('/bulk-generate', ...aiFAQGenerationRoutes.bulkGenerate);
router.get('/status/:id', ...aiFAQGenerationRoutes.status);
export default router;