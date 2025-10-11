import { Router } from 'express';
import { db } from '../db';
import { stores, storeProducts, storeCategories, products } from '../../shared/schema';
import { eq, and, sql } from 'drizzle-orm';

const router = Router();

// GET /api/stores - List all stores
router.get('/', async (req, res) => {
  try {
    const storesList = await db
      .select()
      .from(stores)
      .where(eq(stores.isActive, true))
      .orderBy(stores.name);

    res.json({ stores: storesList });
  } catch (error) {
    console.error('Error fetching stores:', error);
    res.status(500).json({ error: 'Failed to fetch stores' });
  }
});

// GET /api/admin/store-products/assignments - Get all current store-product assignments
router.get('/admin/store-products/assignments', async (req, res) => {
  try {
    const assignments = await db
      .select({
        storeId: storeProducts.storeId,
        productId: storeProducts.productId,
        storeName: stores.name,
        productName: products.name,
        priceOverride: storeProducts.priceOverride,
        isFeatured: storeProducts.isFeatured,
        sortOrder: storeProducts.sortOrder,
        isActive: storeProducts.isActive,
      })
      .from(storeProducts)
      .innerJoin(stores, eq(stores.id, storeProducts.storeId))
      .innerJoin(products, eq(products.id, storeProducts.productId))
      .orderBy(stores.name, storeProducts.sortOrder);

    res.json(assignments);
  } catch (error) {
    console.error('Error fetching store-product assignments:', error);
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
});

// POST /api/admin/store-products - Assign products to stores (admin only)
router.post('/admin/store-products', async (req, res) => {
  try {
    const { storeId, productIds, isFeatured = false, priceOverride } = req.body;

    if (!storeId || !Array.isArray(productIds)) {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    const assignments = productIds.map((productId, index) => ({
      storeId,
      productId,
      isFeatured,
      priceOverride,
      sortOrder: index,
      isActive: true,
    }));

    await db.insert(storeProducts).values(assignments).onConflictDoNothing();

    res.json({ success: true, count: assignments.length });
  } catch (error) {
    console.error('Error assigning products to store:', error);
    res.status(500).json({ error: 'Failed to assign products' });
  }
});

// PUT /api/admin/store-products/:storeId/:productId - Update assignment
router.put('/admin/store-products/:storeId/:productId', async (req, res) => {
  try {
    const { storeId, productId } = req.params;
    const { priceOverride, isFeatured, sortOrder } = req.body;

    const updateData: any = {};
    
    if (priceOverride !== undefined) {
      updateData.priceOverride = priceOverride;
    }
    if (isFeatured !== undefined) {
      updateData.isFeatured = isFeatured;
    }
    if (sortOrder !== undefined) {
      updateData.sortOrder = sortOrder;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    await db
      .update(storeProducts)
      .set(updateData)
      .where(
        and(
          eq(storeProducts.storeId, storeId),
          eq(storeProducts.productId, productId)
        )
      );

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating store-product assignment:', error);
    res.status(500).json({ error: 'Failed to update assignment' });
  }
});

// DELETE /api/admin/store-products/:storeId/:productId - Remove product from store
router.delete('/admin/store-products/:storeId/:productId', async (req, res) => {
  try {
    const { storeId, productId } = req.params;

    await db
      .delete(storeProducts)
      .where(
        and(
          eq(storeProducts.storeId, storeId),
          eq(storeProducts.productId, productId)
        )
      );

    res.json({ success: true });
  } catch (error) {
    console.error('Error removing product from store:', error);
    res.status(500).json({ error: 'Failed to remove product from store' });
  }
});

// GET /api/stores/:storeId/config - Get store configuration
router.get('/:storeId/config', async (req, res) => {
  try {
    const { storeId } = req.params;
    
    const [store] = await db
      .select()
      .from(stores)
      .where(eq(stores.id, storeId))
      .limit(1);

    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    res.json(store);
  } catch (error) {
    console.error('Error fetching store config:', error);
    res.status(500).json({ error: 'Failed to fetch store config' });
  }
});

// GET /api/stores/:storeId/products - Get products for a store
router.get('/:storeId/products', async (req, res) => {
  try {
    const { storeId } = req.params;

    const storeProductsList = await db
      .select({
        product: products,
        storeProduct: storeProducts,
      })
      .from(storeProducts)
      .innerJoin(products, eq(products.id, storeProducts.productId))
      .where(
        and(
          eq(storeProducts.storeId, storeId),
          eq(storeProducts.isActive, true)
        )
      )
      .orderBy(storeProducts.sortOrder);

    const result = storeProductsList.map(({ product, storeProduct }) => ({
      ...product,
      // Override price if store has specific pricing
      price: storeProduct.priceOverride || product.price,
      isFeatured: storeProduct.isFeatured,
    }));

    res.json(result);
  } catch (error) {
    console.error('Error fetching store products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

export default router;
