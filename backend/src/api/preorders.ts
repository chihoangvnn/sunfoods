import { Router } from 'express';
import { storage } from '../storage';
import { z } from 'zod';

const router = Router();

function generateSlug(title: string): string {
  if (!title || title.trim().length === 0) {
    return 'preorder';
  }
  
  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
    .replace(/[èéẹẻẽêềếệểễ]/g, 'e')
    .replace(/[ìíịỉĩ]/g, 'i')
    .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
    .replace(/[ùúụủũưừứựửữ]/g, 'u')
    .replace(/[ỳýỵỷỹ]/g, 'y')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

  return slug || 'preorder';
}

const requireAdminAuth = (req: any, res: any, next: any) => {
  if (!req.session || !req.session.adminId) {
    return res.status(401).json({ 
      error: "Unauthorized. Admin access required.",
      code: "ADMIN_AUTH_REQUIRED"
    });
  }
  next();
};

const createPreorderSchema = z.object({
  productId: z.string().optional(),
  slug: z.string().optional(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  price: z.number().positive('Price must be positive'),
  estimatedDate: z.string().min(1, 'Estimated date is required'),
  bannerImage: z.string().optional(),
  unit: z.string().optional().default('cái')
});

const updatePreorderSchema = createPreorderSchema.partial();

router.get('/', requireAdminAuth, async (req, res) => {
  try {
    const { limit, offset } = req.query;
    const limitNum = limit ? parseInt(limit as string) : 50;
    const offsetNum = offset ? parseInt(offset as string) : 0;

    console.log('📊 Admin: Getting all preorders', { limitNum, offsetNum });

    const preorders = await storage.getPreorders(limitNum, offsetNum);

    res.json({
      success: true,
      data: preorders
    });
  } catch (error) {
    console.error('❌ Error fetching preorders:', error);
    res.status(500).json({
      error: 'Failed to fetch preorders',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.post('/', requireAdminAuth, async (req, res) => {
  try {
    const validatedData = createPreorderSchema.parse(req.body);

    const slug = validatedData.slug || generateSlug(validatedData.title);

    const preorder = await storage.createPreorder({
      productId: validatedData.productId,
      slug,
      title: validatedData.title,
      description: validatedData.description,
      price: validatedData.price.toString(),
      estimatedDate: validatedData.estimatedDate,
      bannerImage: validatedData.bannerImage,
      unit: validatedData.unit || 'cái',
      isActive: true
    });

    console.log('✅ Preorder created:', preorder.id);

    res.status(201).json({
      success: true,
      data: preorder
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors
      });
    }

    console.error('❌ Error creating preorder:', error);
    res.status(500).json({
      error: 'Failed to create preorder',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.put('/:id', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = updatePreorderSchema.parse(req.body);

    const updateData: any = {};

    if (validatedData.productId !== undefined) updateData.productId = validatedData.productId;
    if (validatedData.slug !== undefined) updateData.slug = validatedData.slug;
    if (validatedData.title !== undefined) updateData.title = validatedData.title;
    if (validatedData.description !== undefined) updateData.description = validatedData.description;
    if (validatedData.price !== undefined) updateData.price = validatedData.price.toString();
    if (validatedData.estimatedDate !== undefined) updateData.estimatedDate = validatedData.estimatedDate;
    if (validatedData.bannerImage !== undefined) updateData.bannerImage = validatedData.bannerImage;
    if (validatedData.unit !== undefined) updateData.unit = validatedData.unit;

    const preorder = await storage.updatePreorder(id, updateData);

    if (!preorder) {
      return res.status(404).json({
        error: 'Preorder not found'
      });
    }

    console.log('✅ Preorder updated:', id);

    res.json({
      success: true,
      data: preorder
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors
      });
    }

    console.error('❌ Error updating preorder:', error);
    res.status(500).json({
      error: 'Failed to update preorder',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.delete('/:id', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await storage.deletePreorder(id);

    if (!deleted) {
      return res.status(404).json({
        error: 'Preorder not found'
      });
    }

    console.log('✅ Preorder deleted:', id);

    res.json({
      success: true,
      message: 'Preorder deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting preorder:', error);
    res.status(500).json({
      error: 'Failed to delete preorder',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.get('/public/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    console.log('🔍 Public: Getting preorder by slug:', slug);

    const preorder = await storage.getPreorderBySlug(slug);

    if (!preorder || !preorder.isActive) {
      return res.status(404).json({
        error: 'Preorder not found or inactive'
      });
    }

    res.json({
      success: true,
      data: preorder
    });
  } catch (error) {
    console.error('❌ Error fetching preorder by slug:', error);
    res.status(500).json({
      error: 'Failed to fetch preorder',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.get('/active', async (req, res) => {
  try {
    console.log('🔍 Public: Getting active preorders');

    const activePreorders = await storage.getActivePreorders();

    res.json({
      success: true,
      data: activePreorders
    });
  } catch (error) {
    console.error('❌ Error fetching active preorders:', error);
    res.status(500).json({
      error: 'Failed to fetch active preorders',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
