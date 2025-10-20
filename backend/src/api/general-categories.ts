// @ts-nocheck
import express from 'express';
import { db } from '../db';
import { 
  generalCategories, 
  generalCategoryAssignments,
  generalCategoryPriceRules,
  generalCategoryAnalytics,
  insertGeneralCategoriesSchema,
  insertGeneralCategoryAssignmentsSchema,
  insertGeneralCategoryPriceRulesSchema,
  type GeneralCategory,
  type GeneralCategoryWithStats,
  type GeneralCategoryWithChildren
} from '../../shared/schema';
import { eq, desc, asc, like, or, and, sql, isNull, count } from 'drizzle-orm';

const router = express.Router();

// =====================================================
// 🏪 GENERAL CATEGORY MANAGEMENT ENDPOINTS
// =====================================================

// Get all general categories with hierarchy
router.get('/', async (req, res) => {
  try {
    const { includeStats, parentId, level, search, isActive = 'true' } = req.query;
    
    let whereConditions: any[] = [];
    
    // Filter by parent ID (null for root categories)
    if (parentId === 'null' || parentId === '') {
      whereConditions.push(isNull(generalCategories.parentId));
    } else if (parentId) {
      whereConditions.push(eq(generalCategories.parentId, parentId as string));
    }
    
    // Filter by level
    if (level !== undefined && level !== 'all' && level !== '') {
      const levelNum = Number(level);
      if (!isNaN(levelNum)) {
        whereConditions.push(eq(generalCategories.level, levelNum));
      }
    }
    
    // Filter by active status
    if (isActive !== 'all') {
      whereConditions.push(eq(generalCategories.isActive, isActive === 'true'));
    }
    
    // Search filter
    if (search) {
      whereConditions.push(
        or(
          like(generalCategories.name, `%${search}%`),
          like(generalCategories.description, `%${search}%`)
        )
      );
    }
    
    // Get categories
    const categories = await db
      .select()
      .from(generalCategories)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .orderBy(asc(generalCategories.level), asc(generalCategories.sortOrder), asc(generalCategories.name));
    
    // Include stats if requested
    if (includeStats === 'true') {
      const categoriesWithStats = await Promise.all(
        categories.map(async (category) => {
          // Get product count and other stats
          const assignments = await db
            .select({ count: count() })
            .from(generalCategoryAssignments)
            .where(eq(generalCategoryAssignments.categoryId, category.id));
          
          const productCount = assignments[0]?.count || 0;
          
          return {
            ...category,
            productCount, // Align with UI expectations
            stats: {
              totalProducts: productCount,
              avgPrice: 0, // TODO: Calculate from actual products
              priceRange: { min: 0, max: 0 },
              recentOrders: 0,
              popularProducts: []
            }
          };
        })
      );
      
      res.json(categoriesWithStats);
    } else {
      res.json(categories);
    }
    
  } catch (error) {
    console.error('Error fetching general categories:', error);
    res.status(500).json({ error: 'Failed to fetch general categories' });
  }
});

// Get single general category by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { includeChildren, includeStats } = req.query;
    
    const category = await db
      .select()
      .from(generalCategories)
      .where(eq(generalCategories.id, id))
      .limit(1);
    
    if (!category.length) {
      return res.status(404).json({ error: 'General category not found' });
    }
    
    let result = category[0];
    
    // Include children if requested
    if (includeChildren === 'true') {
      const children = await db
        .select()
        .from(generalCategories)
        .where(eq(generalCategories.parentId, id))
        .orderBy(asc(generalCategories.sortOrder), asc(generalCategories.name));
      
      result = { ...result, children };
    }
    
    // Include stats if requested
    if (includeStats === 'true') {
      const assignments = await db
        .select({ count: count() })
        .from(generalCategoryAssignments)
        .where(eq(generalCategoryAssignments.categoryId, id));
      
      const productCount = assignments[0]?.count || 0;
      
      result = {
        ...result,
        productCount, // Align with UI expectations
        stats: {
          totalProducts: productCount,
          avgPrice: 0,
          priceRange: { min: 0, max: 0 },
          recentOrders: 0,
          popularProducts: []
        }
      };
    }
    
    res.json(result);
    
  } catch (error) {
    console.error('Error fetching general category:', error);
    res.status(500).json({ error: 'Failed to fetch general category' });
  }
});

// Create new general category
router.post('/', async (req, res) => {
  try {
    const validatedData = insertGeneralCategoriesSchema.parse(req.body);
    
    // Auto-generate slug if not provided
    if (!validatedData.slug && validatedData.name) {
      validatedData.slug = validatedData.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim('-');
    }
    
    // Calculate level based on parent
    if (validatedData.parentId) {
      const parentCategory = await db
        .select({ level: generalCategories.level })
        .from(generalCategories)
        .where(eq(generalCategories.id, validatedData.parentId))
        .limit(1);
      
      if (parentCategory.length > 0) {
        validatedData.level = (parentCategory[0].level || 0) + 1;
      }
    }
    
    const newCategory = await db
      .insert(generalCategories)
      .values(validatedData)
      .returning();
    
    console.log('✅ General category created:', newCategory[0].name);
    res.status(201).json(newCategory[0]);
    
  } catch (error) {
    console.error('Error creating general category:', error);
    res.status(500).json({ error: 'Failed to create general category' });
  }
});

// Update general category
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = insertGeneralCategoriesSchema.partial().parse(req.body);
    
    // Auto-generate slug if name is updated
    if (validatedData.name && !validatedData.slug) {
      validatedData.slug = validatedData.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim('-');
    }
    
    // Recalculate level if parent changed
    if (validatedData.parentId !== undefined) {
      if (validatedData.parentId) {
        const parentCategory = await db
          .select({ level: generalCategories.level })
          .from(generalCategories)
          .where(eq(generalCategories.id, validatedData.parentId))
          .limit(1);
        
        if (parentCategory.length > 0) {
          validatedData.level = (parentCategory[0].level || 0) + 1;
        }
      } else {
        validatedData.level = 0;
      }
    }
    
    const updatedCategory = await db
      .update(generalCategories)
      .set({ ...validatedData, updatedAt: new Date() })
      .where(eq(generalCategories.id, id))
      .returning();
    
    if (!updatedCategory.length) {
      return res.status(404).json({ error: 'General category not found' });
    }
    
    console.log('✅ General category updated:', updatedCategory[0].name);
    res.json(updatedCategory[0]);
    
  } catch (error) {
    console.error('Error updating general category:', error);
    res.status(500).json({ error: 'Failed to update general category' });
  }
});

// Delete general category
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if category has children
    const children = await db
      .select({ count: count() })
      .from(generalCategories)
      .where(eq(generalCategories.parentId, id));
    
    if (children[0]?.count > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete category with subcategories. Please delete or move subcategories first.' 
      });
    }
    
    // Check if category has product assignments
    const assignments = await db
      .select({ count: count() })
      .from(generalCategoryAssignments)
      .where(eq(generalCategoryAssignments.categoryId, id));
    
    if (assignments[0]?.count > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete category with assigned products. Please remove product assignments first.' 
      });
    }
    
    const deletedCategory = await db
      .delete(generalCategories)
      .where(eq(generalCategories.id, id))
      .returning();
    
    if (!deletedCategory.length) {
      return res.status(404).json({ error: 'General category not found' });
    }
    
    console.log('✅ General category deleted:', deletedCategory[0].name);
    res.json({ message: 'General category deleted successfully', category: deletedCategory[0] });
    
  } catch (error) {
    console.error('Error deleting general category:', error);
    res.status(500).json({ error: 'Failed to delete general category' });
  }
});

// Get category price rules
router.get('/:id/price-rules', async (req, res) => {
  try {
    const { id } = req.params;
    
    const priceRules = await db
      .select({
        id: generalCategoryPriceRules.id,
        ruleName: generalCategoryPriceRules.ruleName,
        ruleType: generalCategoryPriceRules.ruleType,
        minPrice: generalCategoryPriceRules.minPrice,
        maxPrice: generalCategoryPriceRules.maxPrice,
        discountPercentage: generalCategoryPriceRules.discountPercentage,
        markupPercentage: generalCategoryPriceRules.markupPercentage,
        priority: generalCategoryPriceRules.priority,
        isActive: generalCategoryPriceRules.isActive,
        startDate: generalCategoryPriceRules.startDate,
        endDate: generalCategoryPriceRules.endDate,
        createdAt: generalCategoryPriceRules.createdAt,
      })
      .from(generalCategoryPriceRules)
      .where(eq(generalCategoryPriceRules.categoryId, id))
      .orderBy(desc(generalCategoryPriceRules.priority));
    
    res.json(priceRules);
    
  } catch (error) {
    console.error('Error fetching general category price rules:', error);
    res.status(500).json({ error: 'Failed to fetch general category price rules' });
  }
});

// Create price rule for category
router.post('/:id/price-rules', async (req, res) => {
  try {
    const { id: categoryId } = req.params;
    const validatedData = insertGeneralCategoryPriceRulesSchema.parse({
      ...req.body,
      categoryId
    });
    
    const newPriceRule = await db
      .insert(generalCategoryPriceRules)
      .values(validatedData)
      .returning();
    
    console.log('✅ General category price rule created:', newPriceRule[0].ruleName);
    res.status(201).json(newPriceRule[0]);
    
  } catch (error) {
    console.error('Error creating general category price rule:', error);
    res.status(500).json({ error: 'Failed to create general category price rule' });
  }
});

export default router;