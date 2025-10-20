// @ts-nocheck
import { Router } from 'express';
import { db } from '../db';
import { productVariants } from '@shared/schema';
import { eq, and } from 'drizzle-orm';

const router = Router();

const requireAuth = (req: any, res: any, next: any) => {
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

// GET /api/products/:productId/variants - Get all variants for a product
router.get('/:productId/variants', async (req, res) => {
  try {
    const { productId } = req.params;
    
    const variants = await db
      .select()
      .from(productVariants)
      .where(eq(productVariants.productId, productId))
      .orderBy(productVariants.sortOrder);
    
    res.json({
      success: true,
      variants
    });
  } catch (error) {
    console.error('❌ Error fetching product variants:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch product variants' 
    });
  }
});

// POST /api/products/:productId/variants - Create new variant
router.post('/:productId/variants', requireAuth, async (req, res) => {
  try {
    const { productId } = req.params;
    const variantData = req.body;
    
    const [newVariant] = await db
      .insert(productVariants)
      .values({
        productId,
        ...variantData
      })
      .returning();
    
    res.json({
      success: true,
      variant: newVariant
    });
  } catch (error) {
    console.error('❌ Error creating product variant:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to create product variant' 
    });
  }
});

// PUT /api/products/:productId/variants/:variantId - Update variant
router.put('/:productId/variants/:variantId', requireAuth, async (req, res) => {
  try {
    const { productId, variantId } = req.params;
    const updateData = req.body;
    
    const [updatedVariant] = await db
      .update(productVariants)
      .set({
        ...updateData,
        updatedAt: new Date().toISOString()
      })
      .where(
        and(
          eq(productVariants.id, variantId),
          eq(productVariants.productId, productId)
        )
      )
      .returning();
    
    if (!updatedVariant) {
      return res.status(404).json({ 
        success: false,
        error: 'Variant not found' 
      });
    }
    
    res.json({
      success: true,
      variant: updatedVariant
    });
  } catch (error) {
    console.error('❌ Error updating product variant:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to update product variant' 
    });
  }
});

// DELETE /api/products/:productId/variants/:variantId - Delete variant
router.delete('/:productId/variants/:variantId', requireAuth, async (req, res) => {
  try {
    const { productId, variantId } = req.params;
    
    const [deletedVariant] = await db
      .delete(productVariants)
      .where(
        and(
          eq(productVariants.id, variantId),
          eq(productVariants.productId, productId)
        )
      )
      .returning();
    
    if (!deletedVariant) {
      return res.status(404).json({ 
        success: false,
        error: 'Variant not found' 
      });
    }
    
    res.json({
      success: true,
      message: 'Variant deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting product variant:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to delete product variant' 
    });
  }
});

export default router;
