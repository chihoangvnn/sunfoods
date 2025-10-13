import { Router } from 'express';
import { db } from '../db';
import { productPromotions } from '@shared/schema';
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

// GET /api/products/:productId/promotions - Get all promotions for a product
router.get('/:productId/promotions', async (req, res) => {
  try {
    const { productId } = req.params;
    
    const promotions = await db
      .select()
      .from(productPromotions)
      .where(eq(productPromotions.productId, productId));
    
    res.json({
      success: true,
      promotions
    });
  } catch (error) {
    console.error('❌ Error fetching product promotions:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch product promotions' 
    });
  }
});

// POST /api/products/:productId/promotions - Create new promotion
router.post('/:productId/promotions', requireAuth, async (req, res) => {
  try {
    const { productId } = req.params;
    const promotionData = req.body;
    
    const [newPromotion] = await db
      .insert(productPromotions)
      .values({
        productId,
        ...promotionData
      })
      .returning();
    
    res.json({
      success: true,
      promotion: newPromotion
    });
  } catch (error) {
    console.error('❌ Error creating product promotion:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to create product promotion' 
    });
  }
});

// PUT /api/products/:productId/promotions/:promotionId - Update promotion
router.put('/:productId/promotions/:promotionId', requireAuth, async (req, res) => {
  try {
    const { productId, promotionId } = req.params;
    const updateData = req.body;
    
    const [updatedPromotion] = await db
      .update(productPromotions)
      .set({
        ...updateData,
        updatedAt: new Date().toISOString()
      })
      .where(
        and(
          eq(productPromotions.id, promotionId),
          eq(productPromotions.productId, productId)
        )
      )
      .returning();
    
    if (!updatedPromotion) {
      return res.status(404).json({ 
        success: false,
        error: 'Promotion not found' 
      });
    }
    
    res.json({
      success: true,
      promotion: updatedPromotion
    });
  } catch (error) {
    console.error('❌ Error updating product promotion:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to update product promotion' 
    });
  }
});

// DELETE /api/products/:productId/promotions/:promotionId - Delete promotion
router.delete('/:productId/promotions/:promotionId', requireAuth, async (req, res) => {
  try {
    const { productId, promotionId } = req.params;
    
    const [deletedPromotion] = await db
      .delete(productPromotions)
      .where(
        and(
          eq(productPromotions.id, promotionId),
          eq(productPromotions.productId, productId)
        )
      )
      .returning();
    
    if (!deletedPromotion) {
      return res.status(404).json({ 
        success: false,
        error: 'Promotion not found' 
      });
    }
    
    res.json({
      success: true,
      message: 'Promotion deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting product promotion:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to delete product promotion' 
    });
  }
});

export default router;
