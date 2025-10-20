// @ts-nocheck
import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { bookCategories, bookCategoryAssignments } from '../../shared/schema';
import { eq, desc, like, or, and, count, sql } from 'drizzle-orm';

const router = Router();

const bookCategorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  slug: z.string().min(1, "Slug is required"),
  parentId: z.string().nullable().optional(),
  sortOrder: z.number().default(0),
  description: z.string().nullable().optional(),
  icon: z.string().nullable().optional(),
  color: z.string().default("#3b82f6"),
  amazonCategoryId: z.string().nullable().optional(),
  amazonBestsellerUrl: z.string().nullable().optional(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  metaTitle: z.string().nullable().optional(),
  metaDescription: z.string().nullable().optional(),
});

router.get('/', async (req, res) => {
  try {
    const { search, parentId, level, isActive, limit = '100' } = req.query;
    
    let whereConditions: any[] = [];
    
    if (search) {
      whereConditions.push(
        or(
          like(bookCategories.name, `%${search}%`),
          like(bookCategories.description, `%${search}%`)
        )
      );
    }
    
    if (parentId) {
      if (parentId === 'root') {
        whereConditions.push(sql`${bookCategories.parentId} IS NULL`);
      } else {
        whereConditions.push(eq(bookCategories.parentId, parentId as string));
      }
    }
    
    if (level !== undefined) {
      whereConditions.push(eq(bookCategories.level, parseInt(level as string)));
    }
    
    if (isActive !== undefined && isActive !== 'all') {
      whereConditions.push(eq(bookCategories.isActive, isActive === 'true'));
    }
    
    const categories = await db
      .select()
      .from(bookCategories)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .orderBy(desc(bookCategories.sortOrder), desc(bookCategories.createdAt))
      .limit(parseInt(limit as string));
    
    res.json(categories);
  } catch (error) {
    console.error("Error fetching book categories:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const categories = await db.select().from(bookCategories);
    
    const stats = {
      total: categories.length,
      active: categories.filter(c => c.isActive).length,
      inactive: categories.filter(c => !c.isActive).length,
      featured: categories.filter(c => c.isFeatured).length,
      byLevel: {
        root: categories.filter(c => c.level === 0).length,
        sub: categories.filter(c => c.level === 1).length,
        subSub: categories.filter(c => c.level === 2).length,
      },
      totalBooks: categories.reduce((sum, cat) => sum + (cat.bookCount || 0), 0),
    };
    
    res.json(stats);
  } catch (error) {
    console.error("Error fetching book category stats:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [category] = await db
      .select()
      .from(bookCategories)
      .where(eq(bookCategories.id, req.params.id));
    
    if (!category) {
      return res.status(404).json({ error: "Book category not found" });
    }
    
    const [bookCountResult] = await db
      .select({ count: count() })
      .from(bookCategoryAssignments)
      .where(eq(bookCategoryAssignments.categoryId, req.params.id));
    
    const categoryWithBooks = {
      ...category,
      actualBookCount: bookCountResult?.count || 0,
    };
    
    res.json(categoryWithBooks);
  } catch (error) {
    console.error("Error fetching book category:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post('/', async (req, res) => {
  try {
    console.log("📚 Creating book category with data:", req.body);
    
    const validatedData = bookCategorySchema.parse(req.body);
    console.log("✅ Validated book category data:", validatedData);
    
    let level = 0;
    if (validatedData.parentId) {
      const [parent] = await db
        .select()
        .from(bookCategories)
        .where(eq(bookCategories.id, validatedData.parentId));
      
      if (!parent) {
        return res.status(400).json({ error: "Parent category not found" });
      }
      
      level = (parent.level || 0) + 1;
      console.log(`📊 Calculated level: ${level} (parent level: ${parent.level})`);
    }
    
    const [category] = await db.insert(bookCategories).values({
      ...validatedData,
      level,
    }).returning();
    
    console.log("🎯 Created book category:", category.id);
    
    res.status(201).json(category);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("❌ Validation error:", error.errors);
      return res.status(400).json({ error: "Validation error", details: error.errors });
    }
    console.error("❌ Error creating book category:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const partialSchema = bookCategorySchema.partial();
    const validatedData = partialSchema.parse(req.body);
    
    let dataToUpdate = { ...validatedData, updatedAt: new Date() };
    
    if ('parentId' in validatedData) {
      let level = 0;
      if (validatedData.parentId) {
        const [parent] = await db
          .select()
          .from(bookCategories)
          .where(eq(bookCategories.id, validatedData.parentId));
        
        if (!parent) {
          return res.status(400).json({ error: "Parent category not found" });
        }
        
        level = (parent.level || 0) + 1;
        console.log(`📊 Recalculated level: ${level} (parent level: ${parent.level})`);
      } else {
        console.log(`📊 Recalculated level: 0 (root category)`);
      }
      
      dataToUpdate = { ...dataToUpdate, level };
    }
    
    const [category] = await db
      .update(bookCategories)
      .set(dataToUpdate)
      .where(eq(bookCategories.id, req.params.id))
      .returning();
    
    if (!category) {
      return res.status(404).json({ error: "Book category not found" });
    }
    
    res.json(category);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Validation error", details: error.errors });
    }
    console.error("Error updating book category:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const categoryId = req.params.id;
    
    const [existingCategory] = await db.select().from(bookCategories).where(eq(bookCategories.id, categoryId));
    if (!existingCategory) {
      return res.status(404).json({ error: "Book category not found" });
    }
    
    const [bookCount] = await db
      .select({ count: count() })
      .from(bookCategoryAssignments)
      .where(eq(bookCategoryAssignments.categoryId, categoryId));
    
    if (bookCount.count > 0) {
      return res.status(400).json({ 
        error: "Cannot delete category with books assigned",
        bookCount: bookCount.count 
      });
    }
    
    const [childCount] = await db
      .select({ count: count() })
      .from(bookCategories)
      .where(eq(bookCategories.parentId, categoryId));
    
    if (childCount.count > 0) {
      return res.status(400).json({ 
        error: "Cannot delete category with subcategories",
        childCount: childCount.count 
      });
    }
    
    await db.delete(bookCategories).where(eq(bookCategories.id, categoryId));
    
    res.json({ 
      success: true, 
      message: "Book category deleted successfully",
      deletedCategory: existingCategory 
    });
  } catch (error) {
    console.error("Error deleting book category:", error);
    res.status(500).json({ 
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

router.put('/:id/toggle-active', async (req, res) => {
  try {
    const [category] = await db
      .select()
      .from(bookCategories)
      .where(eq(bookCategories.id, req.params.id));
    
    if (!category) {
      return res.status(404).json({ error: "Book category not found" });
    }
    
    const [updated] = await db
      .update(bookCategories)
      .set({ 
        isActive: !category.isActive,
        updatedAt: new Date() 
      })
      .where(eq(bookCategories.id, req.params.id))
      .returning();
    
    res.json(updated);
  } catch (error) {
    console.error("Error toggling book category status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
