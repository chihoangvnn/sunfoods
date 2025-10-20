// @ts-nocheck
import express from 'express';
import { db } from '../db';
import { 
  categories,
  frontendCategoryAssignments,
  industries,
  insertCategoriesSchema,
  insertFrontendCategoryAssignmentsSchema,
  type Category,
  type InsertCategory,
  type FrontendCategoryAssignment
} from '../../shared/schema';
import { eq, desc, asc, like, or, and, sql, count } from 'drizzle-orm';

const router = express.Router();

// =====================================================
// 🏪 GENERAL PRODUCT CATEGORY MANAGEMENT ENDPOINTS
// =====================================================

// Get all general product categories (industry-based, non-hierarchical)
router.get('/', async (req, res) => {
  try {
    const { includeStats, industryId, search, isActive = 'true', limit = '50', offset = '0' } = req.query;
    
    let whereConditions: any[] = [];
    
    // Filter by industry ID
    if (industryId && industryId !== 'all') {
      whereConditions.push(eq(categories.industryId, industryId as string));
    }
    
    // Filter by active status
    if (isActive !== 'all') {
      whereConditions.push(eq(categories.isActive, isActive === 'true'));
    }
    
    // Search filter
    if (search) {
      whereConditions.push(
        or(
          like(categories.name, `%${search}%`),
          like(categories.description, `%${search}%`)
        )
      );
    }
    
    // Get categories with industry info
    const categoriesResult = await db
      .select({
        id: categories.id,
        name: categories.name,
        description: categories.description,
        industryId: categories.industryId,
        industryName: industries.name,
        isActive: categories.isActive,
        sortOrder: categories.sortOrder,
        createdAt: categories.createdAt,
        updatedAt: categories.updatedAt,
        // Additional consultation fields
        consultationConfig: categories.consultationConfig,
        consultationTemplates: categories.consultationTemplates,
        salesAdviceTemplate: categories.salesAdviceTemplate
      })
      .from(categories)
      .leftJoin(industries, eq(categories.industryId, industries.id))
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .orderBy(asc(categories.sortOrder), asc(categories.name))
      .limit(Number(limit))
      .offset(Number(offset));

    // Include stats if requested (frontend assignments)
    if (includeStats === 'true') {
      const categoriesWithStats = await Promise.all(
        categoriesResult.map(async (category) => {
          // Get frontend assignment count
          const frontendAssignments = await db
            .select({ count: count() })
            .from(frontendCategoryAssignments)
            .where(eq(frontendCategoryAssignments.categoryId, category.id));
          
          const assignmentCount = frontendAssignments[0]?.count || 0;
          
          return {
            ...category,
            stats: {
              frontendAssignments: assignmentCount,
              isAssigned: assignmentCount > 0
            }
          };
        })
      );
      
      res.json(categoriesWithStats);
    } else {
      res.json(categoriesResult);
    }
  } catch (error) {
    console.error('Error fetching general product categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get all industries (for category creation/filtering) - MUST be before /:id route
router.get('/industries', async (req, res) => {
  try {
    const industriesList = await db
      .select()
      .from(industries)
      .where(eq(industries.isActive, true))
      .orderBy(asc(industries.sortOrder), asc(industries.name));
    
    res.json(industriesList);
  } catch (error) {
    console.error('Error fetching industries:', error);
    res.status(500).json({ error: 'Failed to fetch industries' });
  }
});

// Get single category by ID  
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const categoryResult = await db
      .select({
        id: categories.id,
        name: categories.name,
        description: categories.description,
        industryId: categories.industryId,
        industryName: industries.name,
        isActive: categories.isActive,
        sortOrder: categories.sortOrder,
        createdAt: categories.createdAt,
        updatedAt: categories.updatedAt,
        consultationConfig: categories.consultationConfig,
        consultationTemplates: categories.consultationTemplates,
        salesAdviceTemplate: categories.salesAdviceTemplate
      })
      .from(categories)
      .leftJoin(industries, eq(categories.industryId, industries.id))
      .where(eq(categories.id, id))
      .limit(1);

    if (categoryResult.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json(categoryResult[0]);
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ error: 'Failed to fetch category' });
  }
});

// Create new category
router.post('/', async (req, res) => {
  try {
    const categoryData = insertCategoriesSchema.parse(req.body);
    
    const [newCategory] = await db
      .insert(categories)
      .values(categoryData)
      .returning();
    
    res.status(201).json(newCategory);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// Update category
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = insertCategoriesSchema.partial().parse(req.body);
    
    const [updatedCategory] = await db
      .update(categories)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(categories.id, id))
      .returning();
    
    if (!updatedCategory) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.json(updatedCategory);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// Delete category
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check for existing frontend assignments
    const assignments = await db
      .select({ count: count() })
      .from(frontendCategoryAssignments)
      .where(eq(frontendCategoryAssignments.categoryId, id));
    
    if (assignments[0]?.count > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete category with existing frontend assignments. Remove assignments first.' 
      });
    }
    
    const [deletedCategory] = await db
      .delete(categories)
      .where(eq(categories.id, id))
      .returning();
    
    if (!deletedCategory) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.json({ message: 'Category deleted successfully', deletedCategory });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

// =====================================================
// 🎯 FRONTEND CATEGORY ASSIGNMENTS
// =====================================================

// Get category assignments for a specific frontend
router.get('/frontend/:frontendId', async (req, res) => {
  try {
    const { frontendId } = req.params;
    const { isActive = 'true' } = req.query;
    
    let whereConditions: any[] = [
      eq(frontendCategoryAssignments.frontendId, frontendId)
    ];
    
    if (isActive !== 'all') {
      whereConditions.push(eq(frontendCategoryAssignments.isActive, isActive === 'true'));
    }
    
    const assignments = await db
      .select({
        assignmentId: frontendCategoryAssignments.id,
        categoryId: frontendCategoryAssignments.categoryId,
        categoryName: categories.name,
        industryName: industries.name,
        isLocalOnly: frontendCategoryAssignments.isLocalOnly,
        sortOrder: frontendCategoryAssignments.sortOrder,
        isActive: frontendCategoryAssignments.isActive,
        createdAt: frontendCategoryAssignments.createdAt
      })
      .from(frontendCategoryAssignments)
      .leftJoin(categories, eq(frontendCategoryAssignments.categoryId, categories.id))
      .leftJoin(industries, eq(categories.industryId, industries.id))
      .where(and(...whereConditions))
      .orderBy(asc(frontendCategoryAssignments.sortOrder));
    
    res.json(assignments);
  } catch (error) {
    console.error('Error fetching frontend category assignments:', error);
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
});

// Assign category to frontend
router.post('/frontend/assign', async (req, res) => {
  try {
    const assignmentData = insertFrontendCategoryAssignmentsSchema.parse(req.body);
    
    const [newAssignment] = await db
      .insert(frontendCategoryAssignments)
      .values(assignmentData)
      .returning();
    
    res.status(201).json(newAssignment);
  } catch (error) {
    console.error('Error creating frontend assignment:', error);
    res.status(500).json({ error: 'Failed to create assignment' });
  }
});

// Update frontend assignment
router.put('/frontend/assign/:assignmentId', async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const updateData = insertFrontendCategoryAssignmentsSchema.partial().parse(req.body);
    
    const [updatedAssignment] = await db
      .update(frontendCategoryAssignments)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(frontendCategoryAssignments.id, assignmentId))
      .returning();
    
    if (!updatedAssignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }
    
    res.json(updatedAssignment);
  } catch (error) {
    console.error('Error updating frontend assignment:', error);
    res.status(500).json({ error: 'Failed to update assignment' });
  }
});

// Remove category from frontend
router.delete('/frontend/assign/:assignmentId', async (req, res) => {
  try {
    const { assignmentId } = req.params;
    
    const [deletedAssignment] = await db
      .delete(frontendCategoryAssignments)
      .where(eq(frontendCategoryAssignments.id, assignmentId))
      .returning();
    
    if (!deletedAssignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }
    
    res.json({ message: 'Frontend assignment removed successfully' });
  } catch (error) {
    console.error('Error removing frontend assignment:', error);
    res.status(500).json({ error: 'Failed to remove assignment' });
  }
});

export default router;