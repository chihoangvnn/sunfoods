import { Router } from 'express';
import { storage } from '../storage';
import rateLimit from 'express-rate-limit';

const router = Router();

// 🔐 Bot API Key Authentication Middleware
function requireBotAuth(req: any, res: any, next: any) {
  const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
  
  if (!apiKey) {
    return res.status(401).json({ 
      error: 'API key required',
      message: 'Please provide API key via X-API-Key header or Authorization: Bearer <key>'
    });
  }

  const validApiKey = process.env.BOT_API_KEY;
  
  if (!validApiKey) {
    console.error('⚠️ BOT_API_KEY not configured in environment');
    return res.status(500).json({ 
      error: 'Server configuration error',
      message: 'Bot API key not configured'
    });
  }

  if (apiKey !== validApiKey) {
    console.warn('⚠️ Invalid bot API key attempt:', {
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });
    return res.status(403).json({ 
      error: 'Invalid API key',
      message: 'The provided API key is not valid'
    });
  }

  next();
}

// 🚦 Rate Limiting for Bot API (100 requests per minute)
const botApiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per window
  message: {
    error: 'Too many requests',
    message: 'Rate limit exceeded. Please try again later.',
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all bot config routes
router.use(botApiLimiter);

// 💾 In-memory cache for bot configs (5 min TTL)
// Cache only the merged config data, NOT metadata (timestamp/source)
interface CachedConfigData {
  mergedConfig: any;
  socialAccountName: string;
  hasCustomConfig: boolean;
  cacheTimestamp: number;
}

const configCache = new Map<string, CachedConfigData>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// 🧹 Clean expired cache entries every minute
setInterval(() => {
  const now = Date.now();
  const entries = Array.from(configCache.entries());
  for (const [key, cached] of entries) {
    if (now - cached.cacheTimestamp > CACHE_TTL) {
      configCache.delete(key);
    }
  }
}, 60 * 1000);

/**
 * 🤖 GET /api/bot/config/:pageId
 * 
 * READ-ONLY endpoint for RASA bot to fetch merged configuration
 * 
 * Returns merged config: per-fanpage settings override global defaults
 * 
 * Authentication: Requires BOT_API_KEY via X-API-Key header
 * Rate Limit: 100 requests/minute
 * Cache: 5 minutes TTL
 * 
 * Response:
 * {
 *   pageId: string,
 *   pageName: string,
 *   config: {
 *     enabled: boolean,
 *     autoReply: boolean,
 *     rasaUrl: string,
 *     welcomeMessage: string | null,
 *     errorMessage: string | null
 *   },
 *   source: "global" | "fanpage" | "merged",
 *   cachedAt: string
 * }
 */
router.get('/config/:pageId', requireBotAuth, async (req, res) => {
  try {
    const { pageId } = req.params;

    if (!pageId) {
      return res.status(400).json({
        error: 'Missing pageId',
        message: 'Page ID is required in URL path'
      });
    }

    // Check cache first
    const cacheKey = `bot-config:${pageId}`;
    const cached = configCache.get(cacheKey);
    
    if (cached && (Date.now() - cached.cacheTimestamp < CACHE_TTL)) {
      console.log(`✅ Bot config cache HIT for page: ${pageId}`);
      // Build fresh response with current timestamp but cached config data
      const source = cached.hasCustomConfig ? 'merged' : 'global';
      return res.json({
        pageId,
        pageName: cached.socialAccountName,
        config: cached.mergedConfig,
        source,
        timestamp: new Date().toISOString(), // Current timestamp
        cached: true,
        cachedAt: new Date(cached.cacheTimestamp).toISOString()
      });
    }

    console.log(`🔍 Bot config cache MISS for page: ${pageId} - fetching from database`);

    // Find social account by page ID
    const socialAccount = await storage.getSocialAccountByPageId(pageId);
    
    if (!socialAccount) {
      return res.status(404).json({
        error: 'Page not found',
        message: `No social account found for page ID: ${pageId}`,
        pageId
      });
    }

    // Load global bot settings
    const globalSettings = await storage.getBotSettings();
    
    // Load per-fanpage bot config (defaults to {} if not configured)
    const fanpageConfig = (await storage.getSocialAccountBotConfig(socialAccount.id)) || {};

    // Merge configs: fanpage settings override global settings (same logic as webhook)
    const mergedConfig = {
      enabled: fanpageConfig.enabled ?? globalSettings?.isEnabled ?? false,
      autoReply: fanpageConfig.autoReply ?? globalSettings?.autoReply ?? false,
      rasaUrl: fanpageConfig.rasaUrl ?? globalSettings?.rasaUrl ?? '',
      welcomeMessage: fanpageConfig.welcomeMessage ?? null,
      industry: fanpageConfig.industry ?? null,
      businessName: fanpageConfig.businessName ?? null,
      deliveryAreas: fanpageConfig.deliveryAreas ?? [],
      deliveryTimes: fanpageConfig.deliveryTimes ?? [],
      currency: fanpageConfig.currency ?? 'VND',
      paymentMethods: fanpageConfig.paymentMethods ?? [],
    };

    // Determine config source
    const hasCustomConfig = Object.keys(fanpageConfig).length > 0;
    const source = hasCustomConfig ? 'merged' : 'global';

    const response = {
      pageId,
      pageName: socialAccount.name,
      config: mergedConfig,
      source,
      timestamp: new Date().toISOString(),
      cached: false,
      cachedAt: null // No cache on first request
    };

    // Store ONLY config data in cache (not metadata like timestamp/source)
    configCache.set(cacheKey, {
      mergedConfig,
      socialAccountName: socialAccount.name,
      hasCustomConfig,
      cacheTimestamp: Date.now()
    });

    console.log(`✅ Bot config retrieved for ${socialAccount.name}:`, {
      enabled: mergedConfig.enabled,
      autoReply: mergedConfig.autoReply,
      hasCustomRasaUrl: !!fanpageConfig.rasaUrl,
      source
    });

    res.json(response);
  } catch (error) {
    console.error('❌ Error fetching bot config:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch bot configuration'
    });
  }
});

/**
 * 🔄 POST /api/bot/config/invalidate-cache
 * 
 * Invalidate cache for specific page or all pages
 * (Optional - for admin/webhook use if needed)
 */
router.post('/config/invalidate-cache', requireBotAuth, async (req, res) => {
  try {
    const { pageId } = req.body;

    if (pageId) {
      // Invalidate specific page
      const cacheKey = `bot-config:${pageId}`;
      const deleted = configCache.delete(cacheKey);
      
      res.json({
        success: true,
        message: `Cache invalidated for page: ${pageId}`,
        deleted
      });
    } else {
      // Invalidate all
      const size = configCache.size;
      configCache.clear();
      
      res.json({
        success: true,
        message: 'All bot config cache cleared',
        entriesCleared: size
      });
    }
  } catch (error) {
    console.error('❌ Error invalidating cache:', error);
    res.status(500).json({
      error: 'Failed to invalidate cache'
    });
  }
});

export default router;
