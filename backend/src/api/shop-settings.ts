import { Request, Response, Router, type RequestHandler } from 'express';
import { storage } from '../storage';
import { z } from 'zod';
import { invalidateCacheMiddleware } from '../middleware/cache';
import multer from 'multer';
import { uploadToCloudinary, deleteFromCloudinary } from '../services/cloudinary';

const router = Router();

// Configure multer for file uploads (store in memory)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for shop images
  },
  fileFilter: (req, file, cb) => {
    // Accept images only for shop settings
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed'));
    }
  },
});

// 🔐 Admin Auth Middleware - Check if user is authenticated admin
const requireAdminAuth: RequestHandler = (req, res, next) => {
  const adminId = req.session.adminId;
  
  if (!adminId) {
    return res.status(401).json({ error: 'Chưa đăng nhập. Vui lòng đăng nhập với tài khoản admin.' });
  }
  
  next();
};

// Zod validation schemas
const menuLinkSchema = z.object({
  label: z.string(),
  url: z.string(),
  icon: z.string().optional()
});

const featureBoxSchema = z.object({
  title: z.string(),
  desc: z.string(),
  icon: z.string().optional(),
  link: z.string().optional()
});

const heroSliderItemSchema = z.object({
  type: z.enum(['image', 'video']),
  url: z.string(),
  alt: z.string().optional(),
  thumbnail: z.string().optional()
});

const updateShopSettingsSchema = z.object({
  // Basic Info
  businessName: z.string().min(1).optional(),
  tagline: z.string().optional(),
  description: z.string().optional(),
  logoUrl: z.string().url().optional().or(z.literal('')),
  
  // Contact
  address: z.string().min(1).optional(),
  phone: z.string().min(1).optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional().or(z.literal('')),
  zaloNumber: z.string().optional(),
  
  // Ratings (coerce from string to number to handle form inputs)
  rating: z.coerce.number().min(0).max(5).optional(),
  totalReviews: z.coerce.number().int().nonnegative().optional(),
  
  // Working Hours
  workingHours: z.string().optional(),
  workingDays: z.string().optional(),
  support247: z.boolean().optional(),
  
  // Footer Menus (JSON arrays)
  footerMenuProducts: z.array(menuLinkSchema).optional(),
  footerMenuSupport: z.array(menuLinkSchema).optional(),
  footerMenuConnect: z.array(menuLinkSchema).optional(),
  
  // App Links
  appStoreUrl: z.string().url().optional().or(z.literal('')),
  googlePlayUrl: z.string().url().optional().or(z.literal('')),
  
  // Copyright & Legal
  copyrightMain: z.string().optional(),
  copyrightSub: z.string().optional(),
  termsUrl: z.string().url().optional().or(z.literal('')),
  privacyUrl: z.string().url().optional().or(z.literal('')),
  sitemapUrl: z.string().url().optional().or(z.literal('')),
  
  // Feature Boxes & Quick Links
  featureBoxes: z.array(featureBoxSchema).optional(),
  quickLinks: z.array(menuLinkSchema).optional(),
  
  // Hero Slider
  heroSlider: z.array(heroSliderItemSchema).optional()
}).strict(); // Strict mode to reject unknown fields

// GET /api/admin/shop-settings - Get current shop settings (PROTECTED)
router.get('/', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const settings = await storage.getShopSettings();
    
    if (!settings) {
      // Return empty template if no settings exist yet
      return res.json({
        success: true,
        data: null,
        message: 'No shop settings found. Please create one.'
      });
    }
    
    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('❌ Get Shop Settings Error:', error);
    res.status(500).json({
      error: 'Failed to fetch shop settings',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// PUT /api/admin/shop-settings/:id - Update shop settings (PROTECTED)
// Invalidate public cache after successful update
router.put('/:id', requireAdminAuth, invalidateCacheMiddleware('shop-info'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Validate request body with Zod
    const validationResult = updateShopSettingsSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Invalid request data',
        details: validationResult.error.errors
      });
    }
    
    const updateData = validationResult.data;
    
    // Additional safety: Remove system fields (in case strict() didn't catch them)
    const safeUpdateData: any = { ...updateData };
    delete safeUpdateData.id;
    delete safeUpdateData.createdAt;
    delete safeUpdateData.isDefault; // Don't allow changing default flag via update
    
    const updated = await storage.updateShopSettings(id, safeUpdateData);
    
    if (!updated) {
      return res.status(404).json({
        error: 'Shop settings not found'
      });
    }
    
    res.json({
      success: true,
      data: updated,
      message: 'Cập nhật thông tin shop thành công'
    });
  } catch (error) {
    console.error('❌ Update Shop Settings Error:', error);
    res.status(500).json({
      error: 'Failed to update shop settings',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/admin/shop-settings - Create shop settings (PROTECTED, admin only, first setup)
// Invalidate public cache after successful creation
router.post('/', requireAdminAuth, invalidateCacheMiddleware('shop-info'), async (req: Request, res: Response) => {
  try {
    // Check if default settings already exist first (to prevent duplicates)
    const existing = await storage.getShopSettings();
    if (existing) {
      return res.status(400).json({
        error: 'Shop settings already exist. Use PUT to update.',
        existingId: existing.id
      });
    }
    
    // Validate with required fields for creation
    const createSchema = updateShopSettingsSchema.extend({
      businessName: z.string().min(1),
      address: z.string().min(1),
      phone: z.string().min(1),
      email: z.string().email()
    });
    
    const validationResult = createSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Invalid request data. Required fields: businessName, address, phone, email',
        details: validationResult.error.errors
      });
    }
    
    const createData = validationResult.data;
    
    // Ensure this is marked as default
    const safeCreateData: any = { ...createData, isDefault: true };
    
    const created = await storage.createShopSettings(safeCreateData);
    
    res.status(201).json({
      success: true,
      data: created,
      message: 'Tạo thông tin shop thành công'
    });
  } catch (error) {
    console.error('❌ Create Shop Settings Error:', error);
    res.status(500).json({
      error: 'Failed to create shop settings',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/admin/shop-settings/upload-image - Upload image to Cloudinary (PROTECTED)
// Supports logo and hero slider images
router.post('/upload-image', requireAdminAuth, upload.single('image'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No image file provided'
      });
    }
    
    // Get upload type (logo or slider) from query param, default to 'slider'
    const uploadType = req.query.type === 'logo' ? 'logo' : 'slider';
    const folder = `shop-settings/${uploadType}`;
    
    // Upload to Cloudinary
    const result = await uploadToCloudinary(
      req.file.buffer,
      req.file.mimetype,
      {
        folder,
        tags: ['shop-settings', uploadType]
      }
    );
    
    res.json({
      success: true,
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format
      },
      message: `Upload ${uploadType === 'logo' ? 'logo' : 'slider image'} thành công`
    });
  } catch (error) {
    console.error('❌ Upload Image Error:', error);
    res.status(500).json({
      error: 'Failed to upload image',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// DELETE /api/admin/shop-settings/delete-image - Delete image from Cloudinary (PROTECTED)
router.delete('/delete-image', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const { publicId } = req.body;
    
    if (!publicId || typeof publicId !== 'string') {
      return res.status(400).json({
        error: 'publicId is required and must be a string'
      });
    }
    
    // Delete from Cloudinary
    await deleteFromCloudinary(publicId, 'image');
    
    res.json({
      success: true,
      message: 'Xóa hình thành công'
    });
  } catch (error) {
    console.error('❌ Delete Image Error:', error);
    res.status(500).json({
      error: 'Failed to delete image',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
