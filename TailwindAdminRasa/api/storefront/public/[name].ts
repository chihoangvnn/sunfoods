import { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../../server/storage';
import { 
  filterProductsByVIPAccess, 
  getCustomerTierFromSession, 
  isAdminUser 
} from '../../../server/utils/vip-utils';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { name } = req.query;
    
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: 'Storefront name is required' });
    }

    if (req.method === 'GET') {
      // GET /api/storefront/public/[name] - Get public storefront data
      const config = await storage.getStorefrontConfigByName(name);
      
      if (!config || !config.isActive) {
        return res.status(404).json({ error: 'Storefront not found or inactive' });
      }

      const topProducts = await storage.getTopProductsForStorefront(config.id);
      
      // 💎 VIP TIER FILTERING - Filter products based on customer VIP tier
      const customerTier = getCustomerTierFromSession((req as any).session);
      const isAdmin = isAdminUser((req as any).session);
      
      const filteredProducts = filterProductsByVIPAccess(topProducts, customerTier, isAdmin);
      
      // Return public-safe data (no sensitive admin info)
      res.json({
        name: config.name,
        theme: config.theme,
        primaryColor: config.primaryColor,
        contactInfo: config.contactInfo,
        products: filteredProducts.map(product => ({
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          image: product.image,
          category: product.category
        })),
        storefrontConfigId: config.id // Needed for order creation
      });
      
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
    
  } catch (error) {
    console.error('Public storefront API error:', error);
    res.status(500).json({ error: 'Failed to load storefront' });
  }
}