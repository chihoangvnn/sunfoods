import { Router } from 'express';
import { storage } from '../storage';
import { z } from 'zod';

const router = Router();

function generateSlug(title: string): string {
  if (!title || title.trim().length === 0) {
    return 'flash-sale';
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

  return slug || 'flash-sale';
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

const createFlashSaleSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  slug: z.string().optional(),
  title: z.string().min(1, 'Title is required'),
  originalPrice: z.number().positive('Original price must be positive'),
  salePrice: z.number().positive('Sale price must be positive'),
  discountPercent: z.number().int().min(0).max(100).optional(),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  bannerImage: z.string().optional(),
  description: z.string().optional(),
  unit: z.string().optional(),
  isActive: z.boolean().optional().default(true)
});

const updateFlashSaleSchema = createFlashSaleSchema.partial();

router.get('/', requireAdminAuth, async (req, res) => {
  try {
    const { limit, offset } = req.query;
    const limitNum = limit ? parseInt(limit as string) : 50;
    const offsetNum = offset ? parseInt(offset as string) : 0;

    console.log('📊 Admin: Getting all flash sales', { limitNum, offsetNum });

    const flashSales = await storage.getFlashSales(limitNum, offsetNum);

    res.json({
      success: true,
      data: flashSales
    });
  } catch (error) {
    console.error('❌ Error fetching flash sales:', error);
    res.status(500).json({
      error: 'Failed to fetch flash sales',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.post('/', requireAdminAuth, async (req, res) => {
  try {
    const validatedData = createFlashSaleSchema.parse(req.body);

    if (new Date(validatedData.startTime) >= new Date(validatedData.endTime)) {
      return res.status(400).json({
        error: 'Start time must be before end time'
      });
    }

    if (validatedData.salePrice >= validatedData.originalPrice) {
      return res.status(400).json({
        error: 'Sale price must be less than original price'
      });
    }

    const slug = validatedData.slug || generateSlug(validatedData.title);

    const discountPercent = validatedData.discountPercent ?? 
      Math.round(((validatedData.originalPrice - validatedData.salePrice) / validatedData.originalPrice) * 100);

    const flashSale = await storage.createFlashSale({
      productId: validatedData.productId,
      slug,
      title: validatedData.title,
      originalPrice: validatedData.originalPrice.toString(),
      salePrice: validatedData.salePrice.toString(),
      discountPercent,
      startTime: validatedData.startTime,
      endTime: validatedData.endTime,
      bannerImage: validatedData.bannerImage,
      description: validatedData.description,
      unit: validatedData.unit,
      isActive: validatedData.isActive ?? true
    });

    console.log('✅ Flash sale created:', flashSale.id);

    res.status(201).json({
      success: true,
      data: flashSale
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors
      });
    }

    console.error('❌ Error creating flash sale:', error);
    res.status(500).json({
      error: 'Failed to create flash sale',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.put('/:id', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = updateFlashSaleSchema.parse(req.body);

    if (validatedData.startTime && validatedData.endTime) {
      if (new Date(validatedData.startTime) >= new Date(validatedData.endTime)) {
        return res.status(400).json({
          error: 'Start time must be before end time'
        });
      }
    }

    if (validatedData.salePrice !== undefined && validatedData.originalPrice !== undefined) {
      if (validatedData.salePrice >= validatedData.originalPrice) {
        return res.status(400).json({
          error: 'Sale price must be less than original price'
        });
      }
    }

    const updateData: any = {};

    if (validatedData.productId !== undefined) updateData.productId = validatedData.productId;
    if (validatedData.slug !== undefined) updateData.slug = validatedData.slug;
    if (validatedData.title !== undefined) updateData.title = validatedData.title;
    if (validatedData.originalPrice !== undefined) updateData.originalPrice = validatedData.originalPrice.toString();
    if (validatedData.salePrice !== undefined) updateData.salePrice = validatedData.salePrice.toString();
    if (validatedData.discountPercent !== undefined) updateData.discountPercent = validatedData.discountPercent;
    if (validatedData.startTime !== undefined) updateData.startTime = validatedData.startTime;
    if (validatedData.endTime !== undefined) updateData.endTime = validatedData.endTime;
    if (validatedData.bannerImage !== undefined) updateData.bannerImage = validatedData.bannerImage;
    if (validatedData.description !== undefined) updateData.description = validatedData.description;
    if (validatedData.unit !== undefined) updateData.unit = validatedData.unit;
    if (validatedData.isActive !== undefined) updateData.isActive = validatedData.isActive;

    const flashSale = await storage.updateFlashSale(id, updateData);

    if (!flashSale) {
      return res.status(404).json({
        error: 'Flash sale not found'
      });
    }

    console.log('✅ Flash sale updated:', id);

    res.json({
      success: true,
      data: flashSale
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors
      });
    }

    console.error('❌ Error updating flash sale:', error);
    res.status(500).json({
      error: 'Failed to update flash sale',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.delete('/:id', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await storage.deleteFlashSale(id);

    if (!deleted) {
      return res.status(404).json({
        error: 'Flash sale not found'
      });
    }

    console.log('✅ Flash sale deleted:', id);

    res.json({
      success: true,
      message: 'Flash sale deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting flash sale:', error);
    res.status(500).json({
      error: 'Failed to delete flash sale',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.get('/public/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    console.log('🔍 Public: Getting flash sale by slug:', slug);

    const flashSale = await storage.getFlashSaleBySlug(slug);

    if (!flashSale) {
      return res.status(404).json({
        error: 'Flash sale not found'
      });
    }

    const now = new Date();
    const startTime = new Date(flashSale.startTime);
    const endTime = new Date(flashSale.endTime);

    if (now < startTime || now > endTime || !flashSale.isActive) {
      return res.status(404).json({
        error: 'Flash sale is not active or has expired'
      });
    }

    res.json({
      success: true,
      data: flashSale
    });
  } catch (error) {
    console.error('❌ Error fetching flash sale by slug:', error);
    res.status(500).json({
      error: 'Failed to fetch flash sale',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.get('/active', async (req, res) => {
  try {
    console.log('🔍 Public: Getting active flash sales');

    const activeFlashSales = await storage.getActiveFlashSales();

    res.json({
      success: true,
      data: activeFlashSales
    });
  } catch (error) {
    console.error('❌ Error fetching active flash sales:', error);
    res.status(500).json({
      error: 'Failed to fetch active flash sales',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
