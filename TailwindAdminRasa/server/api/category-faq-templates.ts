import { Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { categoryFAQTemplates, faqLibrary, categories, contentFAQAssignments } from '@shared/schema';
import { eq, desc, and, count, sql, inArray, asc } from 'drizzle-orm';

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

// 🏷️ Category FAQ Templates API - Auto-inherit FAQ system for Vietnamese incense business
// Cho phép mỗi danh mục có template FAQ mà sản phẩm mới sẽ tự động kế thừa

// Zod schemas for validation
const CreateTemplateSchema = z.object({
  categoryId: z.string().uuid('Invalid category ID format'),
  faqId: z.string().uuid('Invalid FAQ ID format'),
  sortOrder: z.number().int().min(0).max(9999).default(0),
  isActive: z.boolean().default(true),
  autoInherit: z.boolean().default(true), // Sản phẩm mới có tự động kế thừa FAQ này không
  createdBy: z.string().optional(),
  templateNote: z.string().max(500, 'Template note too long').optional()
});

const UpdateTemplateSchema = z.object({
  sortOrder: z.number().int().min(0).max(9999).optional(),
  isActive: z.boolean().optional(),
  autoInherit: z.boolean().optional(),
  createdBy: z.string().optional(),
  templateNote: z.string().max(500, 'Template note too long').optional()
});

const BulkCreateTemplatesSchema = z.object({
  categoryId: z.string().uuid('Invalid category ID format'),
  faqIds: z.array(z.string().uuid()).min(1, 'At least one FAQ required').max(20, 'Maximum 20 FAQs per category'),
  autoInherit: z.boolean().default(true),
  createdBy: z.string().optional()
});

const ReorderTemplatesSchema = z.object({
  templates: z.array(z.object({
    id: z.string().uuid('Invalid template ID format'),
    sortOrder: z.number().int().min(0).max(9999)
  })).min(1, 'At least one template required').max(50, 'Maximum 50 templates per reorder')
});

// 📋 **GET /api/category-faq-templates** - List templates by category with FAQ details
export const getCategoryFAQTemplates = async (req: Request, res: Response) => {
  try {
    const query = z.object({
      categoryId: z.string().uuid('Invalid category ID format').optional(),
      isActive: z.enum(['all', 'true', 'false']).default('all'),
      autoInherit: z.enum(['all', 'true', 'false']).default('all'),
      sortBy: z.enum(['sort_order', 'created_at', 'updated_at']).default('sort_order'),
      sortOrder: z.enum(['asc', 'desc']).default('asc')
    }).parse(req.query);

    console.log(`🏷️ Listing Category FAQ Templates - Category: ${query.categoryId || 'all'}`);

    // Build query conditions
    const whereConditions = [];
    
    if (query.categoryId) {
      whereConditions.push(eq(categoryFAQTemplates.categoryId, query.categoryId));
    }
    
    if (query.isActive !== 'all') {
      whereConditions.push(eq(categoryFAQTemplates.isActive, query.isActive === 'true'));
    }
    
    if (query.autoInherit !== 'all') {
      whereConditions.push(eq(categoryFAQTemplates.autoInherit, query.autoInherit === 'true'));
    }

    // Execute query with JOINs
    const templates = await db
      .select({
        id: categoryFAQTemplates.id,
        categoryId: categoryFAQTemplates.categoryId,
        categoryName: categories.name,
        faqId: categoryFAQTemplates.faqId,
        faqQuestion: faqLibrary.question,
        faqAnswer: faqLibrary.answer,
        faqPriority: faqLibrary.priority,
        sortOrder: categoryFAQTemplates.sortOrder,
        isActive: categoryFAQTemplates.isActive,
        autoInherit: categoryFAQTemplates.autoInherit,
        createdBy: categoryFAQTemplates.createdBy,
        templateNote: categoryFAQTemplates.templateNote,
        createdAt: categoryFAQTemplates.createdAt,
        updatedAt: categoryFAQTemplates.updatedAt
      })
      .from(categoryFAQTemplates)
      .leftJoin(categories, eq(categoryFAQTemplates.categoryId, categories.id))
      .leftJoin(faqLibrary, eq(categoryFAQTemplates.faqId, faqLibrary.id))
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .orderBy(
        query.sortBy === 'sort_order' 
          ? (query.sortOrder === 'asc' ? asc(categoryFAQTemplates.sortOrder) : desc(categoryFAQTemplates.sortOrder))
          : query.sortBy === 'created_at' 
          ? (query.sortOrder === 'asc' ? asc(categoryFAQTemplates.createdAt) : desc(categoryFAQTemplates.createdAt))
          : (query.sortOrder === 'asc' ? asc(categoryFAQTemplates.updatedAt) : desc(categoryFAQTemplates.updatedAt))
      );

    console.log(`✅ Found ${templates.length} category FAQ templates`);

    res.json({
      success: true,
      data: templates,
      message: `Found ${templates.length} category FAQ templates`
    });

  } catch (error) {
    console.error('❌ Error listing category FAQ templates:', error);
    
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

// ➕ **POST /api/category-faq-templates** - Create new template
export const createCategoryFAQTemplate = async (req: Request, res: Response) => {
  try {
    const data = CreateTemplateSchema.parse(req.body);
    console.log('🆕 Creating category FAQ template:', data);

    // Check if combination already exists
    const existingTemplate = await db
      .select()
      .from(categoryFAQTemplates)
      .where(
        and(
          eq(categoryFAQTemplates.categoryId, data.categoryId),
          eq(categoryFAQTemplates.faqId, data.faqId)
        )
      )
      .limit(1);

    if (existingTemplate.length > 0) {
      return res.status(409).json({
        success: false,
        error: "Template already exists for this category and FAQ combination",
        code: "DUPLICATE_TEMPLATE"
      });
    }

    // Create template
    const [newTemplate] = await db
      .insert(categoryFAQTemplates)
      .values({
        ...data,
        createdAt: sql`now()`,
        updatedAt: sql`now()`
      })
      .returning();

    console.log('✅ Category FAQ template created:', newTemplate.id);

    res.status(201).json({
      success: true,
      data: newTemplate,
      message: "Category FAQ template created successfully"
    });

  } catch (error) {
    console.error('❌ Error creating category FAQ template:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: error.errors,
        code: "VALIDATION_ERROR"
      });
    }

    // Handle unique constraint violation
    if (error && typeof error === 'object' && 'code' in error && error.code === '23505') {
      return res.status(409).json({
        success: false,
        error: "Template already exists for this category and FAQ combination",
        code: "DUPLICATE_TEMPLATE"
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to create category FAQ template",
      code: "CREATION_FAILED"
    });
  }
};

// 📝 **PUT /api/category-faq-templates/:id** - Update template
export const updateCategoryFAQTemplate = async (req: Request, res: Response) => {
  try {
    const templateId = req.params.id;
    const updates = UpdateTemplateSchema.parse(req.body);
    
    console.log(`📝 Updating category FAQ template: ${templateId}`, updates);

    // Check if template exists
    const existingTemplate = await db
      .select()
      .from(categoryFAQTemplates)
      .where(eq(categoryFAQTemplates.id, templateId))
      .limit(1);

    if (existingTemplate.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Category FAQ template not found",
        code: "TEMPLATE_NOT_FOUND"
      });
    }

    // Update template
    const [updatedTemplate] = await db
      .update(categoryFAQTemplates)
      .set({
        ...updates,
        updatedAt: sql`now()`
      })
      .where(eq(categoryFAQTemplates.id, templateId))
      .returning();

    console.log('✅ Category FAQ template updated:', updatedTemplate.id);

    res.json({
      success: true,
      data: updatedTemplate,
      message: "Category FAQ template updated successfully"
    });

  } catch (error) {
    console.error('❌ Error updating category FAQ template:', error);
    
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
      error: "Failed to update category FAQ template",
      code: "UPDATE_FAILED"
    });
  }
};

// 🗑️ **DELETE /api/category-faq-templates/:id** - Delete template
export const deleteCategoryFAQTemplate = async (req: Request, res: Response) => {
  try {
    const templateId = req.params.id;
    console.log(`🗑️ Deleting category FAQ template: ${templateId}`);

    // Check if template exists
    const existingTemplate = await db
      .select()
      .from(categoryFAQTemplates)
      .where(eq(categoryFAQTemplates.id, templateId))
      .limit(1);

    if (existingTemplate.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Category FAQ template not found",
        code: "TEMPLATE_NOT_FOUND"
      });
    }

    // Delete template (this will also set template_id to null in content_faq_assignments due to ON DELETE SET NULL)
    await db
      .delete(categoryFAQTemplates)
      .where(eq(categoryFAQTemplates.id, templateId));

    console.log('✅ Category FAQ template deleted:', templateId);

    res.json({
      success: true,
      message: "Category FAQ template deleted successfully"
    });

  } catch (error) {
    console.error('❌ Error deleting category FAQ template:', error);

    res.status(500).json({
      success: false,
      error: "Failed to delete category FAQ template",
      code: "DELETION_FAILED"
    });
  }
};

// 📦 **POST /api/category-faq-templates/bulk-create** - Bulk create templates for category
export const bulkCreateCategoryFAQTemplates = async (req: Request, res: Response) => {
  try {
    const data = BulkCreateTemplatesSchema.parse(req.body);
    console.log('📦 Bulk creating category FAQ templates:', data);

    // Check for existing templates to avoid duplicates
    const existingTemplates = await db
      .select()
      .from(categoryFAQTemplates)
      .where(
        and(
          eq(categoryFAQTemplates.categoryId, data.categoryId),
          inArray(categoryFAQTemplates.faqId, data.faqIds)
        )
      );

    const existingFaqIds = existingTemplates.map(t => t.faqId);
    const newFaqIds = data.faqIds.filter(faqId => !existingFaqIds.includes(faqId));

    if (newFaqIds.length === 0) {
      return res.status(409).json({
        success: false,
        error: "All FAQ templates already exist for this category",
        code: "ALL_DUPLICATES"
      });
    }

    // Create new templates
    const templateData = newFaqIds.map((faqId, index) => ({
      categoryId: data.categoryId,
      faqId,
      sortOrder: index,
      autoInherit: data.autoInherit,
      createdBy: data.createdBy,
      isActive: true
    }));

    const newTemplates = await db
      .insert(categoryFAQTemplates)
      .values(templateData)
      .returning();

    console.log(`✅ Created ${newTemplates.length} category FAQ templates`);

    res.status(201).json({
      success: true,
      data: newTemplates,
      message: `Created ${newTemplates.length} category FAQ templates`,
      skipped: existingFaqIds.length
    });

  } catch (error) {
    console.error('❌ Error bulk creating category FAQ templates:', error);
    
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
      error: "Failed to bulk create category FAQ templates",
      code: "BULK_CREATION_FAILED"
    });
  }
};

// 🔄 **PUT /api/category-faq-templates/reorder** - Reorder templates
export const reorderCategoryFAQTemplates = async (req: Request, res: Response) => {
  try {
    const data = ReorderTemplatesSchema.parse(req.body);
    console.log('🔄 Reordering category FAQ templates:', data);

    // Update sort orders in a transaction-like manner
    const updatePromises = data.templates.map(({ id, sortOrder }) =>
      db
        .update(categoryFAQTemplates)
        .set({ 
          sortOrder,
          updatedAt: sql`now()` 
        })
        .where(eq(categoryFAQTemplates.id, id))
    );

    await Promise.all(updatePromises);

    console.log(`✅ Reordered ${data.templates.length} category FAQ templates`);

    res.json({
      success: true,
      message: `Reordered ${data.templates.length} category FAQ templates`
    });

  } catch (error) {
    console.error('❌ Error reordering category FAQ templates:', error);
    
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
      error: "Failed to reorder category FAQ templates",
      code: "REORDER_FAILED"
    });
  }
};

// Export with auth middleware
export const categoryFAQTemplatesRoutes = {
  get: [requireAuth, getCategoryFAQTemplates],
  post: [requireAuth, createCategoryFAQTemplate],
  put: [requireAuth, updateCategoryFAQTemplate],
  delete: [requireAuth, deleteCategoryFAQTemplate],
  bulkCreate: [requireAuth, bulkCreateCategoryFAQTemplates],
  reorder: [requireAuth, reorderCategoryFAQTemplates]
};