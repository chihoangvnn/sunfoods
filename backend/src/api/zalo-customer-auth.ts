// @ts-nocheck
import { Router } from 'express';
import { db } from '../db';
import { customers, oauthConnections } from '../../shared/schema';
import { eq, and } from 'drizzle-orm';
import crypto from 'crypto';

const router = Router();

declare module 'express-session' {
  interface SessionData {
    userId?: string;
    provider?: string;
  }
}

const oauthStates = new Map<string, { timestamp: number; sessionId?: string }>();

setInterval(() => {
  const now = Date.now();
  oauthStates.forEach((data, state) => {
    if (now - data.timestamp > 600000) {
      oauthStates.delete(state);
    }
  });
}, 600000);

const ZALO_APP_ID = process.env.ZALO_APP_ID;
const ZALO_APP_SECRET = process.env.ZALO_APP_SECRET;
const BASE_URL = process.env.REPLIT_DOMAIN 
  ? `https://${process.env.REPLIT_DOMAIN}` 
  : 'http://localhost:5000';

const ZALO_AUTH_URL = 'https://oauth.zaloapp.com/v4/permission';
const ZALO_TOKEN_URL = 'https://oauth.zaloapp.com/v4/access_token';
const ZALO_USER_INFO_URL = 'https://graph.zalo.me/v2.0/me';

interface ZaloTokens {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
}

interface ZaloProfile {
  id: string;
  name: string;
  email?: string;
  picture?: {
    data: {
      url: string;
    };
  };
}

async function exchangeCodeForToken(code: string): Promise<ZaloTokens> {
  try {
    const redirectUri = `${BASE_URL}/api/auth/zalo/callback`;
    
    const params = new URLSearchParams({
      app_id: ZALO_APP_ID!,
      app_secret: ZALO_APP_SECRET!,
      code,
      grant_type: 'authorization_code',
    });

    console.log('🔄 Exchanging code for Zalo access token...');
    
    const response = await fetch(ZALO_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Zalo token exchange failed:', response.status, errorText);
      throw new Error(`Token exchange failed: ${response.status}`);
    }

    const tokens = await response.json();
    console.log('✅ Successfully obtained Zalo access token');
    return tokens;
  } catch (error) {
    console.error('❌ Error exchanging code for token:', error);
    throw new Error('Failed to exchange authorization code for access token');
  }
}

async function getZaloUserProfile(accessToken: string): Promise<ZaloProfile> {
  try {
    console.log('🔄 Fetching Zalo user profile...');
    
    const fields = 'id,name,picture';
    const profileUrl = `${ZALO_USER_INFO_URL}?fields=${fields}&access_token=${accessToken}`;
    
    const response = await fetch(profileUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Zalo user info fetch failed:', response.status, errorText);
      throw new Error(`User info fetch failed: ${response.status}`);
    }

    const profile = await response.json();
    console.log('✅ Successfully fetched Zalo profile:', profile.id);
    return profile;
  } catch (error) {
    console.error('❌ Error fetching Zalo user profile:', error);
    throw new Error('Failed to fetch user profile from Zalo');
  }
}

async function findOrCreateCustomerFromZalo(profile: ZaloProfile): Promise<any> {
  try {
    if (profile.email) {
      const existingCustomers = await db
        .select()
        .from(customers)
        .where(eq(customers.email, profile.email))
        .limit(1);

      if (existingCustomers.length > 0) {
        console.log('✅ Found existing customer:', existingCustomers[0].email);
        return existingCustomers[0];
      }
    }

    console.log('🆕 Creating new customer for:', profile.email || profile.id);
    
    const customerName = profile.name || 'Zalo User';

    const tempPhone = `zalo_${profile.id}`;
    const customerEmail = profile.email || `zalo_${profile.id}@zalo.local`;

    const [newCustomer] = await db
      .insert(customers)
      .values({
        name: customerName,
        email: customerEmail,
        phone: tempPhone,
        membershipTier: 'member',
        totalSpent: '0',
        pointsBalance: 0,
        pointsEarned: 0,
        registrationSource: 'web',
        profileStatus: 'incomplete',
        membershipData: {
          tierProgressPercent: 0,
          nextTierThreshold: 3000000,
          specialOffers: [],
          tierHistory: [{
            tier: 'member',
            date: new Date().toISOString(),
            reason: 'Đăng ký qua Zalo'
          }]
        }
      })
      .returning();

    console.log('✅ Created new customer:', newCustomer.id);
    return newCustomer;
  } catch (error) {
    console.error('❌ Error finding/creating customer:', error);
    throw new Error('Failed to find or create customer');
  }
}

async function saveZaloOAuthConnection(
  customerId: string, 
  profile: ZaloProfile, 
  tokens: ZaloTokens
): Promise<void> {
  try {
    const existingConnections = await db
      .select()
      .from(oauthConnections)
      .where(
        and(
          eq(oauthConnections.provider, 'zalo'),
          eq(oauthConnections.providerUserId, profile.id)
        )
      )
      .limit(1);

    const tokenExpiresAt = tokens.expires_in 
      ? new Date(Date.now() + tokens.expires_in * 1000)
      : null;

    const customerConnections = await db
      .select()
      .from(oauthConnections)
      .where(eq(oauthConnections.customerId, customerId));
    
    const isPrimary = customerConnections.length === 0;

    const oauthData = {
      customerId,
      provider: 'zalo' as const,
      providerUserId: profile.id,
      email: profile.email || null,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token || null,
      tokenExpiresAt,
      profileData: {
        name: profile.name,
        picture: profile.picture?.data?.url,
      },
      isPrimary,
      updatedAt: new Date(),
    };

    if (existingConnections.length > 0) {
      console.log('🔄 Updating existing Zalo OAuth connection');
      await db
        .update(oauthConnections)
        .set(oauthData)
        .where(eq(oauthConnections.id, existingConnections[0].id));
    } else {
      console.log('🆕 Creating new Zalo OAuth connection');
      await db
        .insert(oauthConnections)
        .values(oauthData);
    }

    console.log('✅ Zalo OAuth connection saved successfully');
  } catch (error) {
    console.error('❌ Error saving Zalo OAuth connection:', error);
    throw new Error('Failed to save OAuth connection');
  }
}

router.get('/zalo', async (req, res) => {
  try {
    if (!ZALO_APP_ID || !ZALO_APP_SECRET) {
      return res.status(500).json({ 
        error: 'Zalo OAuth chưa được cấu hình. Vui lòng liên hệ quản trị viên.' 
      });
    }

    const state = crypto.randomBytes(32).toString('hex');
    
    oauthStates.set(state, {
      timestamp: Date.now(),
      sessionId: req.sessionID || req.ip
    });

    const redirectUri = `${BASE_URL}/api/auth/zalo/callback`;
    
    const authUrl = `${ZALO_AUTH_URL}?` +
      `app_id=${encodeURIComponent(ZALO_APP_ID)}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `state=${state}`;

    console.log('🔐 Zalo customer login redirect initiated');
    res.redirect(authUrl);
  } catch (error) {
    console.error('❌ Zalo OAuth initiation error:', error);
    res.status(500).json({ 
      error: 'Không thể khởi tạo đăng nhập Zalo',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.get('/zalo/callback', async (req, res) => {
  try {
    const { code, state, error, error_description } = req.query;

    if (error) {
      console.error('❌ Zalo OAuth error:', error, error_description);
      const errorUrl = `/customer-dashboard?error=${encodeURIComponent('zalo_denied')}`;
      return res.redirect(errorUrl);
    }

    if (!code) {
      return res.redirect('/customer-dashboard?error=no_code');
    }

    if (!state) {
      console.error('🚨 OAuth callback missing state parameter - possible CSRF attack');
      return res.redirect('/customer-dashboard?error=security_error');
    }

    const storedState = oauthStates.get(state as string);
    if (!storedState) {
      console.error('🚨 OAuth callback with invalid/expired state - possible CSRF attack');
      return res.redirect('/customer-dashboard?error=security_error');
    }

    if (Date.now() - storedState.timestamp > 600000) {
      console.error('🚨 OAuth callback with expired state');
      oauthStates.delete(state as string);
      return res.redirect('/customer-dashboard?error=expired');
    }

    oauthStates.delete(state as string);

    console.log('🔄 Processing Zalo customer login callback...');

    const tokens = await exchangeCodeForToken(code as string);
    const profile = await getZaloUserProfile(tokens.access_token);

    if (!profile.email) {
      console.warn('⚠️ Zalo user did not provide email (optional in Zalo)');
    }

    const customer = await findOrCreateCustomerFromZalo(profile);
    await saveZaloOAuthConnection(customer.id, profile, tokens);

    if (req.session) {
      req.session.userId = customer.id;
      req.session.provider = 'zalo';
    }

    console.log(`✅ Zalo customer login successful for customer: ${customer.id}`);
    
    const successUrl = `/customer-dashboard?success=zalo_login`;
    res.redirect(successUrl);
    
  } catch (error) {
    console.error('❌ Zalo OAuth callback error:', error);
    const errorUrl = `/customer-dashboard?error=${encodeURIComponent('authentication_failed')}`;
    res.redirect(errorUrl);
  }
});

router.get('/zalo/status', async (req, res) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.json({
        authenticated: false,
        message: 'Chưa đăng nhập'
      });
    }

    const customerId = req.session.userId;

    const connections = await db
      .select()
      .from(oauthConnections)
      .where(
        and(
          eq(oauthConnections.customerId, customerId),
          eq(oauthConnections.provider, 'zalo')
        )
      )
      .limit(1);

    if (connections.length === 0) {
      return res.json({
        authenticated: true,
        customerId,
        zaloConnected: false
      });
    }

    const connection = connections[0];
    const isExpired = connection.tokenExpiresAt 
      ? new Date(connection.tokenExpiresAt) < new Date()
      : false;

    res.json({
      authenticated: true,
      customerId,
      zaloConnected: true,
      isPrimary: connection.isPrimary,
      email: connection.email,
      profileData: connection.profileData,
      tokenExpired: isExpired,
      connectedAt: connection.createdAt
    });
  } catch (error) {
    console.error('❌ Zalo status check error:', error);
    res.status(500).json({ 
      error: 'Không thể kiểm tra trạng thái Zalo',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
