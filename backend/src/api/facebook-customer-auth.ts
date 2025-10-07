import { Router } from 'express';
import { db } from '../db';
import { customers, oauthConnections } from '../../shared/schema';
import { eq, and } from 'drizzle-orm';
import crypto from 'crypto';
import { storage } from '../storage';

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

const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID;
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET;
const BASE_URL = process.env.REPLIT_DOMAIN 
  ? `https://${process.env.REPLIT_DOMAIN}` 
  : 'http://localhost:5000';

const FACEBOOK_AUTH_URL = 'https://www.facebook.com/v18.0/dialog/oauth';
const FACEBOOK_TOKEN_URL = 'https://graph.facebook.com/v18.0/oauth/access_token';
const FACEBOOK_USER_INFO_URL = 'https://graph.facebook.com/v18.0/me';

interface FacebookTokens {
  access_token: string;
  token_type: string;
  expires_in?: number;
}

interface FacebookProfile {
  id: string;
  email?: string;
  name: string;
  first_name?: string;
  last_name?: string;
  gender?: string;
  picture?: {
    data?: {
      url?: string;
    };
  };
  locale?: string;
  timezone?: number;
}

async function exchangeCodeForToken(code: string): Promise<FacebookTokens> {
  try {
    const redirectUri = `${BASE_URL}/api/auth/facebook-login/callback`;
    
    const params = new URLSearchParams({
      code,
      client_id: FACEBOOK_APP_ID!,
      client_secret: FACEBOOK_APP_SECRET!,
      redirect_uri: redirectUri,
    });

    console.log('🔄 Exchanging code for Facebook access token...');
    
    const response = await fetch(`${FACEBOOK_TOKEN_URL}?${params.toString()}`, {
      method: 'GET',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Facebook token exchange failed:', response.status, errorText);
      throw new Error(`Token exchange failed: ${response.status}`);
    }

    const tokens = await response.json();
    console.log('✅ Successfully obtained Facebook access token');
    return tokens;
  } catch (error) {
    console.error('❌ Error exchanging code for token:', error);
    throw new Error('Failed to exchange authorization code for access token');
  }
}

async function getFacebookUserProfile(accessToken: string): Promise<FacebookProfile> {
  try {
    console.log('🔄 Fetching Facebook user profile...');
    
    const fields = 'id,name,email,first_name,last_name,gender,picture,locale,timezone';
    const response = await fetch(`${FACEBOOK_USER_INFO_URL}?fields=${fields}&access_token=${accessToken}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Facebook user info fetch failed:', response.status, errorText);
      throw new Error(`User info fetch failed: ${response.status}`);
    }

    const profile = await response.json();
    console.log('✅ Successfully fetched Facebook profile:', profile.email || profile.id);
    return profile;
  } catch (error) {
    console.error('❌ Error fetching Facebook user profile:', error);
    throw new Error('Failed to fetch user profile from Facebook');
  }
}

async function findOrCreateCustomerFromFacebook(profile: FacebookProfile): Promise<any> {
  try {
    if (profile.email) {
      const existingCustomers = await db
        .select()
        .from(customers)
        .where(eq(customers.email, profile.email))
        .limit(1);

      if (existingCustomers.length > 0) {
        const existingCustomer = existingCustomers[0];
        console.log('✅ Found existing customer:', existingCustomer.email);
        return existingCustomer;
      }
    }

    console.log('🆕 Creating new customer for:', profile.email || profile.id);
    
    const customerName = profile.name || 'Facebook User';

    const tempPhone = `facebook_${profile.id}`;
    const customerEmail = profile.email || `facebook_${profile.id}@temp.local`;

    const newCustomers = await db
      .insert(customers)
      .values({
        name: customerName,
        email: customerEmail,
        phone: tempPhone,
        avatar: profile.picture?.data?.url || null,
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
          locale: profile.locale,
          timezone: profile.timezone,
          tierHistory: [{
            tier: 'member',
            date: new Date().toISOString(),
            reason: 'Đăng ký qua Facebook'
          }]
        }
      })
      .returning();
    
    const newCustomer = newCustomers[0];

    console.log('✅ Created new customer:', newCustomer.id);
    return newCustomer;
  } catch (error) {
    console.error('❌ Error finding/creating customer:', error);
    throw new Error('Failed to find or create customer');
  }
}

async function saveFacebookOAuthConnection(
  customerId: string, 
  profile: FacebookProfile, 
  tokens: FacebookTokens
): Promise<void> {
  try {
    const existingConnections = await db
      .select()
      .from(oauthConnections)
      .where(
        and(
          eq(oauthConnections.provider, 'facebook'),
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
      provider: 'facebook' as const,
      providerUserId: profile.id,
      email: profile.email || null,
      accessToken: tokens.access_token,
      refreshToken: null,
      tokenExpiresAt,
      profileData: {
        name: profile.name,
        firstName: profile.first_name,
        lastName: profile.last_name,
        picture: profile.picture?.data?.url,
        locale: profile.locale,
        timezone: profile.timezone,
      },
      isPrimary,
      updatedAt: new Date(),
    };

    if (existingConnections.length > 0) {
      console.log('🔄 Updating existing Facebook OAuth connection');
      await db
        .update(oauthConnections)
        .set(oauthData)
        .where(eq(oauthConnections.id, existingConnections[0].id));
    } else {
      console.log('🆕 Creating new Facebook OAuth connection');
      await db
        .insert(oauthConnections)
        .values(oauthData);
    }

    console.log('✅ Facebook OAuth connection saved successfully');
  } catch (error) {
    console.error('❌ Error saving Facebook OAuth connection:', error);
    throw new Error('Failed to save OAuth connection');
  }
}

/**
 * Helper: Fill empty customer profile fields from Facebook profile
 * Strategy: ONLY fill empty fields - never overwrite existing data
 * Follows the same pattern as Google OAuth (google-auth.ts lines 273-339)
 */
async function fillEmptyCustomerFields(customer: any, profile: FacebookProfile): Promise<void> {
  try {
    // Extract current profile data from customer record
    const membershipData = (customer.membershipData as any) || {};
    const socialData = (customer.socialData as any) || {};
    
    // Check which fields are empty (read from correct locations)
    const needsAvatar = !customer.avatar; // ✅ Read from root customer.avatar
    const needsFirstName = !socialData.firstName;
    const needsLastName = !socialData.lastName;
    const needsGender = !socialData.gender; // Facebook-specific field
    const needsLocale = !membershipData.locale;
    const needsTimezone = !membershipData.timezone;
    
    // Only process if at least one field is empty (optimization)
    const hasEmptyFields = needsAvatar || needsFirstName || needsLastName || needsGender || needsLocale || needsTimezone;
    
    if (!hasEmptyFields) {
      console.log(`ℹ️ Customer ${customer.id} profile is complete - skipping auto-fill`);
      return;
    }
    
    console.log(`📋 Auto-filling empty fields for customer ${customer.id} from Facebook profile`);
    
    // Build update object with ONLY empty fields (fill-empty-only strategy)
    const updateData: any = {};
    let fieldsUpdated: string[] = [];
    
    // Update root-level avatar (only if empty)
    if (needsAvatar && profile.picture?.data?.url) {
      updateData.avatar = profile.picture.data.url; // ✅ Write to root customer.avatar
      fieldsUpdated.push('avatar');
    }
    
    // Update socialData fields (only if empty)
    if (needsFirstName || needsLastName || needsGender) {
      updateData.socialData = { ...socialData };
      
      if (needsFirstName && profile.first_name) {
        updateData.socialData.firstName = profile.first_name;
        fieldsUpdated.push('firstName');
      }
      if (needsLastName && profile.last_name) {
        updateData.socialData.lastName = profile.last_name;
        fieldsUpdated.push('lastName');
      }
      if (needsGender && profile.gender) {
        updateData.socialData.gender = profile.gender;
        fieldsUpdated.push('gender');
      }
    }
    
    // Update membershipData fields (only if empty)
    if (needsLocale || needsTimezone) {
      updateData.membershipData = { ...membershipData };
      
      if (needsLocale && profile.locale) {
        updateData.membershipData.locale = profile.locale;
        fieldsUpdated.push('locale');
      }
      if (needsTimezone && profile.timezone !== undefined) {
        updateData.membershipData.timezone = profile.timezone;
        fieldsUpdated.push('timezone');
      }
    }
    
    // Update customer in database if we have fields to update
    if (fieldsUpdated.length > 0) {
      await storage.updateCustomer(customer.id, updateData);
      console.log(`✅ Auto-filled customer ${customer.id} profile: ${fieldsUpdated.join(', ')}`);
    } else {
      console.log(`ℹ️ No new profile data to fill for customer ${customer.id}`);
    }
  } catch (error) {
    // Log error but don't break OAuth flow
    console.error('❌ Auto-fill customer profile failed:', error);
  }
}

router.get('/facebook-login', async (req, res) => {
  try {
    if (!FACEBOOK_APP_ID || !FACEBOOK_APP_SECRET) {
      return res.status(500).json({ 
        error: 'Facebook OAuth chưa được cấu hình. Vui lòng liên hệ quản trị viên.' 
      });
    }

    const state = crypto.randomBytes(32).toString('hex');
    
    oauthStates.set(state, {
      timestamp: Date.now(),
      sessionId: req.sessionID || req.ip
    });

    const redirectUri = `${BASE_URL}/api/auth/facebook-login/callback`;
    
    const scope = 'email,public_profile';

    const authUrl = `${FACEBOOK_AUTH_URL}?` +
      `client_id=${encodeURIComponent(FACEBOOK_APP_ID)}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=${encodeURIComponent(scope)}&` +
      `response_type=code&` +
      `state=${state}`;

    console.log(`🔐 Facebook customer login redirect initiated`);
    res.redirect(authUrl);
  } catch (error) {
    console.error('❌ Facebook OAuth initiation error:', error);
    res.status(500).json({ 
      error: 'Không thể khởi tạo đăng nhập Facebook',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.get('/facebook-login/callback', async (req, res) => {
  try {
    const { code, state, error, error_description } = req.query;

    if (error) {
      console.error('❌ Facebook OAuth error:', error, error_description);
      const errorUrl = `/customer-dashboard?error=${encodeURIComponent('facebook_denied')}`;
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

    console.log('🔄 Processing Facebook customer login callback...');

    const tokens = await exchangeCodeForToken(code as string);
    const profile = await getFacebookUserProfile(tokens.access_token);

    if (!profile.email) {
      console.warn('⚠️ Facebook user did not grant email permission');
    }

    const customer = await findOrCreateCustomerFromFacebook(profile);
    
    // Auto-fill empty customer profile fields from Facebook profile
    // This works for both new and existing customers
    await fillEmptyCustomerFields(customer, profile);
    
    await saveFacebookOAuthConnection(customer.id, profile, tokens);

    if (req.session) {
      req.session.userId = customer.id;
      req.session.provider = 'facebook';
    }

    console.log(`✅ Facebook customer login successful for customer: ${customer.id}`);
    
    const successUrl = `/customer-dashboard?success=facebook_login`;
    res.redirect(successUrl);
    
  } catch (error) {
    console.error('❌ Facebook OAuth callback error:', error);
    const errorUrl = `/customer-dashboard?error=${encodeURIComponent('authentication_failed')}`;
    res.redirect(errorUrl);
  }
});

router.get('/facebook-login/status', async (req, res) => {
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
          eq(oauthConnections.provider, 'facebook')
        )
      )
      .limit(1);

    if (connections.length === 0) {
      return res.json({
        authenticated: true,
        customerId,
        facebookConnected: false
      });
    }

    const connection = connections[0];
    const isExpired = connection.tokenExpiresAt 
      ? new Date(connection.tokenExpiresAt) < new Date()
      : false;

    res.json({
      authenticated: true,
      customerId,
      facebookConnected: true,
      isPrimary: connection.isPrimary,
      email: connection.email,
      profileData: connection.profileData,
      tokenExpired: isExpired,
      connectedAt: connection.createdAt
    });
  } catch (error) {
    console.error('❌ Facebook status check error:', error);
    res.status(500).json({ 
      error: 'Không thể kiểm tra trạng thái Facebook',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
