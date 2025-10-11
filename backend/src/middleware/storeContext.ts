import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { stores } from '../../shared/schema';
import { eq } from 'drizzle-orm';

// In-memory cache for store lookups
const storeCache = new Map<string, any>();

export interface StoreContext {
  storeId?: string;
  storeName?: string;
  themeConfig?: any;
}

declare global {
  namespace Express {
    interface Request {
      store?: StoreContext;
    }
  }
}

export async function storeContextMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Extract domain from hostname
    const hostname = req.hostname || req.get('host') || '';
    const domain = hostname.replace(/^www\./, ''); // Remove www. prefix

    // Check cache first
    if (storeCache.has(domain)) {
      req.store = storeCache.get(domain);
      return next();
    }

    // Query database for store
    const [store] = await db
      .select()
      .from(stores)
      .where(eq(stores.domain, domain))
      .limit(1);

    if (store) {
      const storeContext: StoreContext = {
        storeId: store.id,
        storeName: store.name,
        themeConfig: store.themeConfig,
      };

      // Cache the result
      storeCache.set(domain, storeContext);
      req.store = storeContext;
    }

    next();
  } catch (error) {
    console.error('Store context middleware error:', error);
    next();
  }
}
