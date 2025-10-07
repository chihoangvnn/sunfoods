import { Router } from 'express';
import { requireAdminAuth } from '../middleware/admin-auth';
import { db } from '../db';
import { oauthConnections, customers } from '@shared/schema';
import { eq, sql, desc } from 'drizzle-orm';

const router = Router();

router.get('/oauth/status', requireAdminAuth, async (req, res) => {
  try {
    const getCustomerCountByProvider = async (provider: string): Promise<number> => {
      const result = await db
        .select({ count: sql<number>`count(distinct ${oauthConnections.customerId})::int` })
        .from(oauthConnections)
        .where(eq(oauthConnections.provider, provider));
      
      return result[0]?.count || 0;
    };

    const [googleCount, facebookCount, zaloCount, replitCount] = await Promise.all([
      getCustomerCountByProvider('google'),
      getCustomerCountByProvider('facebook'),
      getCustomerCountByProvider('zalo'),
      getCustomerCountByProvider('replit')
    ]);

    const providers = {
      google: {
        configured: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
        customerCount: googleCount,
        envVars: {
          clientId: !!process.env.GOOGLE_CLIENT_ID,
          clientSecret: !!process.env.GOOGLE_CLIENT_SECRET
        }
      },
      facebook: {
        configured: !!(process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET),
        customerCount: facebookCount,
        envVars: {
          appId: !!process.env.FACEBOOK_APP_ID,
          appSecret: !!process.env.FACEBOOK_APP_SECRET
        }
      },
      zalo: {
        configured: !!(process.env.ZALO_APP_ID && process.env.ZALO_APP_SECRET),
        customerCount: zaloCount,
        envVars: {
          appId: !!process.env.ZALO_APP_ID,
          appSecret: !!process.env.ZALO_APP_SECRET
        }
      },
      replit: {
        configured: !!(process.env.REPLIT_APP_ID && process.env.REPLIT_APP_SECRET),
        customerCount: replitCount,
        envVars: {
          appId: !!process.env.REPLIT_APP_ID,
          appSecret: !!process.env.REPLIT_APP_SECRET
        }
      }
    };

    res.json({ providers });
  } catch (error) {
    console.error('Error fetching OAuth status:', error);
    res.status(500).json({ error: 'Lỗi lấy trạng thái OAuth' });
  }
});

router.get('/oauth/stats', requireAdminAuth, async (req, res) => {
  try {
    const stats = await db
      .select({
        provider: oauthConnections.provider,
        count: sql<number>`count(*)::int`
      })
      .from(oauthConnections)
      .groupBy(oauthConnections.provider);

    const recentLogins = await db
      .select({
        provider: oauthConnections.provider,
        customerName: customers.name,
        customerEmail: customers.email,
        connectedAt: oauthConnections.createdAt
      })
      .from(oauthConnections)
      .innerJoin(customers, eq(oauthConnections.customerId, customers.id))
      .orderBy(desc(oauthConnections.createdAt))
      .limit(10);

    const totalCustomers = await db
      .select({ count: sql<number>`count(distinct ${oauthConnections.customerId})::int` })
      .from(oauthConnections);

    res.json({ 
      stats, 
      recentLogins,
      totalOAuthCustomers: totalCustomers[0]?.count || 0
    });
  } catch (error) {
    console.error('Error fetching OAuth stats:', error);
    res.status(500).json({ error: 'Lỗi lấy thống kê OAuth' });
  }
});

export default router;
