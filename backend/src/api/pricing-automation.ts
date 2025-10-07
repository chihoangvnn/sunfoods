import express from 'express';
import { pricingEngine } from '../services/pricing-automation';
import { db } from '../db';
import { bookPricingRules } from '../../shared/schema';
import { eq, desc, sql } from 'drizzle-orm';
import type { BookPricingRule, InsertBookPricingRule } from '../../shared/schema';

const router = express.Router();

// Get all pricing rules
router.get('/rules', async (req, res) => {
  try {
    const rules = await db
      .select()
      .from(bookPricingRules)
      .orderBy(desc(bookPricingRules.priority));

    res.json(rules);
  } catch (error) {
    console.error('Error fetching pricing rules:', error);
    res.status(500).json({ error: 'Failed to fetch pricing rules' });
  }
});

// Create new pricing rule
router.post('/rules', async (req, res) => {
  try {
    const ruleData: InsertBookPricingRule = req.body;
    
    const [newRule] = await db
      .insert(bookPricingRules)
      .values(ruleData)
      .returning();

    res.status(201).json(newRule);
  } catch (error) {
    console.error('Error creating pricing rule:', error);
    res.status(500).json({ error: 'Failed to create pricing rule' });
  }
});

// Update pricing rule
router.patch('/rules/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const [updatedRule] = await db
      .update(bookPricingRules)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(bookPricingRules.id, id))
      .returning();

    if (!updatedRule) {
      return res.status(404).json({ error: 'Pricing rule not found' });
    }

    res.json(updatedRule);
  } catch (error) {
    console.error('Error updating pricing rule:', error);
    res.status(500).json({ error: 'Failed to update pricing rule' });
  }
});

// Delete pricing rule
router.delete('/rules/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [deletedRule] = await db
      .delete(bookPricingRules)
      .where(eq(bookPricingRules.id, id))
      .returning();

    if (!deletedRule) {
      return res.status(404).json({ error: 'Pricing rule not found' });
    }

    res.json({ success: true, message: 'Pricing rule deleted successfully' });
  } catch (error) {
    console.error('Error deleting pricing rule:', error);
    res.status(500).json({ error: 'Failed to delete pricing rule' });
  }
});

// Calculate prices for a specific product across all sellers
router.post('/calculate/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { basePrice } = req.body;
    
    if (!basePrice || isNaN(basePrice)) {
      return res.status(400).json({ error: 'Valid base price is required' });
    }

    const sellerPrices = await pricingEngine.calculatePricesForAllSellers(productId, basePrice);
    
    // Convert Map to object for JSON response
    const pricesObject = Object.fromEntries(sellerPrices);
    
    res.json({
      success: true,
      productId,
      basePrice,
      sellerPrices: pricesObject,
      totalSellers: sellerPrices.size
    });
  } catch (error) {
    console.error('Error calculating prices:', error);
    if (error instanceof Error && error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to calculate prices' });
  }
});

// Update pricing for a product across all sellers
router.post('/update-pricing/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    
    await pricingEngine.updatePricingForProduct(productId);
    
    res.json({
      success: true,
      message: `Pricing updated for product ${productId} across all sellers`
    });
  } catch (error) {
    console.error('Error updating pricing:', error);
    if (error instanceof Error && error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to update pricing' });
  }
});

// Get pricing summary for all sellers
router.get('/summary', async (req, res) => {
  try {
    const summary = await pricingEngine.getPricingSummary();
    
    res.json({
      success: true,
      summary,
      totalSellers: summary.length
    });
  } catch (error) {
    console.error('Error getting pricing summary:', error);
    res.status(500).json({ error: 'Failed to get pricing summary' });
  }
});

// Test pricing rules on a product
router.post('/test-rules', async (req, res) => {
  try {
    const { productData, basePrice } = req.body;
    
    if (!productData || !basePrice) {
      return res.status(400).json({ error: 'Product data and base price are required' });
    }

    // Create a temporary product object for testing
    const testProduct = {
      id: 'test-product',
      price: basePrice.toString(),
      categoryId: productData.categoryId || null,
      isbn: productData.isbn || null,
      stock: productData.stock || 100,
      tagIds: productData.tagIds || [],
      ...productData
    };

    const sellerPrices = await pricingEngine.calculatePricesForTestProduct(testProduct, basePrice);
    const pricesObject = Object.fromEntries(sellerPrices);
    
    res.json({
      success: true,
      testProduct,
      basePrice,
      calculatedPrices: pricesObject,
      totalSellers: sellerPrices.size,
      message: 'This is a test calculation - no data was saved'
    });
  } catch (error) {
    console.error('Error testing pricing rules:', error);
    res.status(500).json({ error: 'Failed to test pricing rules' });
  }
});

// Get pricing automation stats
router.get('/stats', async (req, res) => {
  try {
    const [totalRulesResult] = await db.select({ count: sql<number>`count(*)::int` }).from(bookPricingRules);
    const [activeRulesResult] = await db.select({ count: sql<number>`count(*)::int` }).from(bookPricingRules).where(eq(bookPricingRules.isActive, true));
    
    const stats = {
      totalRules: totalRulesResult.count,
      activeRules: activeRulesResult.count,
      // Add more stats as needed
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Error getting pricing stats:', error);
    res.status(500).json({ error: 'Failed to get pricing stats' });
  }
});

export default router;