import { Request, Response, Router, NextFunction } from 'express';
import { storage } from '../storage';
import { z } from 'zod';

const router = Router();

// Request validation schemas
const loginSchema = z.object({
  affiliate_code: z.string().min(1, 'Affiliate code is required').trim(),
});

// Extend Express session to support affiliate sessions
declare module 'express-session' {
  interface SessionData {
    authUserId?: string;  // Admin session
    affiliateId?: string; // Affiliate session
    affiliateCode?: string;
  }
}

// Extend Express Request for affiliate auth
declare global {
  namespace Express {
    interface Request {
      affiliate?: {
        id: string;
        name: string;
        email: string;
        affiliateCode: string;
        commissionRate: string;
        affiliateData?: any;
      };
    }
  }
}

/**
 * 🔐 POST /api/affiliate-auth/login
 * Authenticate affiliate using affiliate code
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    // Validate request body
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: 'Invalid input',
        details: parseResult.error.errors
      });
    }

    const { affiliate_code } = parseResult.data;

    // Find affiliate by affiliate code
    const affiliate = await storage.getCustomerByAffiliateCode(affiliate_code);

    if (!affiliate) {
      return res.status(401).json({
        error: 'Invalid affiliate code'
      });
    }

    // Verify affiliate is active
    if (!affiliate.isAffiliate || affiliate.affiliateStatus !== 'active') {
      return res.status(401).json({
        error: 'Affiliate account is not active'
      });
    }

    // Create affiliate session (separate from admin session)
    req.session.affiliateId = affiliate.id;
    req.session.affiliateCode = affiliate.affiliateCode;

    // Save session and return affiliate data
    req.session.save((err) => {
      if (err) {
        console.error('❌ Affiliate session save error:', err);
        return res.status(500).json({
          error: 'Session creation failed'
        });
      }

      res.json({
        success: true,
        message: 'Login successful',
        affiliate: {
          id: affiliate.id,
          name: affiliate.name,
          email: affiliate.email,
          affiliate_code: affiliate.affiliateCode,
          commission_rate: affiliate.commissionRate,
          affiliate_status: affiliate.affiliateStatus,
          affiliate_data: affiliate.affiliateData,
          join_date: affiliate.joinDate
        }
      });
    });

  } catch (error) {
    console.error('❌ Affiliate login error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

/**
 * 🚪 POST /api/affiliate-auth/logout
 * Destroy affiliate session
 */
router.post('/logout', async (req: Request, res: Response) => {
  try {
    if (!req.session.affiliateId) {
      return res.status(400).json({
        error: 'Not logged in as affiliate'
      });
    }

    // Clear affiliate session data (keep admin session if exists)
    delete req.session.affiliateId;
    delete req.session.affiliateCode;

    req.session.save((err) => {
      if (err) {
        console.error('❌ Affiliate logout error:', err);
        return res.status(500).json({
          error: 'Session cleanup failed'
        });
      }

      res.json({
        success: true,
        message: 'Logout successful'
      });
    });

  } catch (error) {
    console.error('❌ Affiliate logout error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

/**
 * 👤 GET /api/affiliate-auth/session
 * Get current affiliate session data
 */
router.get('/session', async (req: Request, res: Response) => {
  try {
    if (!req.session.affiliateId) {
      return res.status(401).json({
        error: 'Not authenticated as affiliate'
      });
    }

    // Get current affiliate data from database
    const affiliate = await storage.getCustomer(req.session.affiliateId);

    if (!affiliate || !affiliate.isAffiliate || affiliate.affiliateStatus !== 'active') {
      // Clear invalid session
      delete req.session.affiliateId;
      delete req.session.affiliateCode;
      
      return res.status(401).json({
        error: 'Affiliate session is no longer valid'
      });
    }

    res.json({
      authenticated: true,
      affiliate: {
        id: affiliate.id,
        name: affiliate.name,
        email: affiliate.email,
        affiliate_code: affiliate.affiliateCode,
        commission_rate: affiliate.commissionRate,
        affiliate_status: affiliate.affiliateStatus,
        affiliate_data: affiliate.affiliateData,
        join_date: affiliate.joinDate,
        total_spent: affiliate.totalSpent,
        membership_tier: affiliate.membershipTier
      }
    });

  } catch (error) {
    console.error('❌ Affiliate session check error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

/**
 * 🛡️ Middleware: Require affiliate authentication
 * Use this to protect affiliate-only routes
 */
export function requireAffiliateAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.affiliateId) {
    return res.status(401).json({
      error: 'Affiliate authentication required'
    });
  }
  next();
}

/**
 * 🛡️ Middleware: Load affiliate data into request
 * Use this to add affiliate data to protected routes
 */
export async function loadAffiliateData(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.session.affiliateId) {
      return res.status(401).json({
        error: 'Affiliate authentication required'
      });
    }

    const affiliate = await storage.getCustomer(req.session.affiliateId);

    if (!affiliate || !affiliate.isAffiliate || affiliate.affiliateStatus !== 'active') {
      // Clear invalid session
      delete req.session.affiliateId;
      delete req.session.affiliateCode;
      
      return res.status(401).json({
        error: 'Affiliate session is no longer valid'
      });
    }

    // Add affiliate data to request
    req.affiliate = {
      id: affiliate.id,
      name: affiliate.name,
      email: affiliate.email,
      affiliateCode: affiliate.affiliateCode || '',
      commissionRate: affiliate.commissionRate || '0.00',
      affiliateData: affiliate.affiliateData
    };

    next();

  } catch (error) {
    console.error('❌ Load affiliate data error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
}

export default router;