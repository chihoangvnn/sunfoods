import { Request, Response, Router } from 'express';
import { storage } from '../storage';
import { cacheMiddleware, CacheKeys } from '../middleware/cache';

const router = Router();

// GET /api/shop-info - Public endpoint for frontend to get shop information
// Cached for 5 minutes to reduce DB load
router.get('/', cacheMiddleware(300, () => CacheKeys.SHOP_INFO), async (req: Request, res: Response) => {
  try {
    const settings = await storage.getShopSettings();
    
    if (!settings) {
      return res.status(404).json({
        error: 'Shop information not configured yet'
      });
    }
    
    // Return ONLY public fields - exclude admin-oriented data
    const publicInfo = {
      // Basic Information
      businessName: settings.businessName,
      tagline: settings.tagline,
      description: settings.description,
      logoUrl: settings.logoUrl,
      
      // Contact Information
      address: settings.address,
      phone: settings.phone,
      email: settings.email,
      website: settings.website,
      zaloNumber: settings.zaloNumber,
      
      // Ratings & Reviews
      rating: settings.rating,
      totalReviews: settings.totalReviews,
      
      // Working Hours
      workingHours: settings.workingHours,
      workingDays: settings.workingDays,
      support247: settings.support247,
      
      // Footer Menus (for frontend footer)
      footerMenuProducts: settings.footerMenuProducts,
      footerMenuSupport: settings.footerMenuSupport,
      footerMenuConnect: settings.footerMenuConnect,
      
      // App Download Links
      appStoreUrl: settings.appStoreUrl,
      googlePlayUrl: settings.googlePlayUrl,
      
      // Copyright & Legal
      copyrightMain: settings.copyrightMain,
      copyrightSub: settings.copyrightSub,
      termsUrl: settings.termsUrl,
      privacyUrl: settings.privacyUrl,
      sitemapUrl: settings.sitemapUrl,
      
      // Feature Boxes
      featureBoxes: settings.featureBoxes,
      
      // Quick Links
      quickLinks: settings.quickLinks,
      
      // Hero Slider (for homepage)
      heroSlider: settings.heroSlider
      
      // EXCLUDED: id, isDefault, createdAt, updatedAt (admin-only fields)
    };
    
    res.json({
      success: true,
      data: publicInfo
    });
  } catch (error) {
    console.error('❌ Get Shop Info Error:', error);
    res.status(500).json({
      error: 'Failed to fetch shop information',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
