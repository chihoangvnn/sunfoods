import { Router } from 'express';
import { db } from '../db';
import { customers, oauthConnections } from '../../shared/schema';
import { eq, and } from 'drizzle-orm';
import crypto from 'crypto';
import { storage } from '../storage';

const router = Router();

// Extend Express session to support Google OAuth sessions
declare module 'express-session' {
  interface SessionData {
    userId?: string;
    provider?: string;
  }
}

// Store for OAuth state validation (in production, use Redis or database)
const oauthStates = new Map<string, { timestamp: number; sessionId?: string }>();

// Clean expired states every 10 minutes
setInterval(() => {
  const now = Date.now();
  oauthStates.forEach((data, state) => {
    if (now - data.timestamp > 600000) { // 10 minutes
      oauthStates.delete(state);
    }
  });
}, 600000);

// Environment variables
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const BASE_URL = process.env.REPLIT_DOMAIN 
  ? `https://${process.env.REPLIT_DOMAIN}` 
  : 'http://localhost:5000';

// Google OAuth URLs
const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USER_INFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo';

// TypeScript Interfaces
interface GoogleTokens {
  access_token: string;
  token_type: string;
  expires_in?: number;
  refresh_token?: string;
  scope?: string;
  id_token?: string;
}

interface GoogleProfile {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  locale?: string;
}

/**
 * Helper: Exchange authorization code for access token
 */
async function exchangeCodeForToken(code: string): Promise<GoogleTokens> {
  try {
    const redirectUri = `${BASE_URL}/api/auth/google/callback`;
    
    const params = new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID!,
      client_secret: GOOGLE_CLIENT_SECRET!,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    });

    console.log('🔄 Exchanging code for Google access token...');
    
    const response = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Google token exchange failed:', response.status, errorText);
      throw new Error(`Token exchange failed: ${response.status}`);
    }

    const tokens = await response.json();
    console.log('✅ Successfully obtained Google access token');
    return tokens;
  } catch (error) {
    console.error('❌ Error exchanging code for token:', error);
    throw new Error('Failed to exchange authorization code for access token');
  }
}

/**
 * Helper: Get user profile from Google
 */
async function getGoogleUserProfile(accessToken: string): Promise<GoogleProfile> {
  try {
    console.log('🔄 Fetching Google user profile...');
    
    const response = await fetch(GOOGLE_USER_INFO_URL, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Google user info fetch failed:', response.status, errorText);
      throw new Error(`User info fetch failed: ${response.status}`);
    }

    const profile = await response.json();
    console.log('✅ Successfully fetched Google profile:', profile.email);
    return profile;
  } catch (error) {
    console.error('❌ Error fetching Google user profile:', error);
    throw new Error('Failed to fetch user profile from Google');
  }
}

/**
 * Helper: Find or create customer from Google profile
 */
async function findOrCreateCustomerFromGoogle(profile: GoogleProfile): Promise<any> {
  try {
    // Check if customer already exists by email
    const existingCustomers = await db
      .select()
      .from(customers)
      .where(eq(customers.email, profile.email))
      .limit(1);

    if (existingCustomers.length > 0) {
      console.log('✅ Found existing customer:', existingCustomers[0].email);
      return existingCustomers[0];
    }

    // Create new customer
    console.log('🆕 Creating new customer for:', profile.email);
    
    const customerName = profile.name || 
      (profile.given_name && profile.family_name 
        ? `${profile.given_name} ${profile.family_name}` 
        : profile.email.split('@')[0]);

    // Generate a temporary phone number from Google ID (required field)
    // Users can update this later in their profile
    const tempPhone = `google_${profile.id}`;

    const [newCustomer] = await db
      .insert(customers)
      .values({
        name: customerName,
        email: profile.email,
        phone: tempPhone, // Required field - temporary placeholder
        membershipTier: 'member',
        totalSpent: '0',
        pointsBalance: 0,
        pointsEarned: 0,
        registrationSource: 'web', // Registered via web OAuth
        profileStatus: 'incomplete', // Profile needs phone number update
        membershipData: {
          tierProgressPercent: 0,
          nextTierThreshold: 3000000, // 3M VND for Silver
          specialOffers: [],
          tierHistory: [{
            tier: 'member',
            date: new Date().toISOString(),
            reason: 'Đăng ký qua Google'
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

/**
 * Helper: Save or update Google OAuth connection
 */
async function saveGoogleOAuthConnection(
  customerId: string, 
  profile: GoogleProfile, 
  tokens: GoogleTokens
): Promise<void> {
  try {
    // Check if OAuth connection already exists
    const existingConnections = await db
      .select()
      .from(oauthConnections)
      .where(
        and(
          eq(oauthConnections.provider, 'google'),
          eq(oauthConnections.providerUserId, profile.id)
        )
      )
      .limit(1);

    // Calculate token expiry
    const tokenExpiresAt = tokens.expires_in 
      ? new Date(Date.now() + tokens.expires_in * 1000)
      : null;

    // Check if this is the customer's first OAuth connection (to set as primary)
    const customerConnections = await db
      .select()
      .from(oauthConnections)
      .where(eq(oauthConnections.customerId, customerId));
    
    const isPrimary = customerConnections.length === 0;

    const oauthData = {
      customerId,
      provider: 'google' as const,
      providerUserId: profile.id,
      email: profile.email,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token || null,
      tokenExpiresAt,
      profileData: {
        name: profile.name,
        firstName: profile.given_name,
        lastName: profile.family_name,
        picture: profile.picture,
        locale: profile.locale,
      },
      isPrimary,
      updatedAt: new Date(),
    };

    if (existingConnections.length > 0) {
      // Update existing connection
      console.log('🔄 Updating existing Google OAuth connection');
      await db
        .update(oauthConnections)
        .set(oauthData)
        .where(eq(oauthConnections.id, existingConnections[0].id));
    } else {
      // Create new connection
      console.log('🆕 Creating new Google OAuth connection');
      await db
        .insert(oauthConnections)
        .values(oauthData);
    }

    console.log('✅ Google OAuth connection saved successfully');
  } catch (error) {
    console.error('❌ Error saving Google OAuth connection:', error);
    throw new Error('Failed to save OAuth connection');
  }
}

/**
 * Helper: Fill empty customer profile fields from Google profile
 * Strategy: ONLY fill empty fields - never overwrite existing data
 * Follows the same pattern as Messenger auto-update (routes.ts lines 420-521)
 */
async function fillEmptyCustomerFields(customer: any, profile: GoogleProfile): Promise<void> {
  try {
    // Extract current profile data from customer record
    const membershipData = (customer.membershipData as any) || {};
    const socialData = (customer.socialData as any) || {};
    
    // Check which fields are empty (read from correct locations)
    const needsAvatar = !customer.avatar; // ✅ Read from root customer.avatar
    const needsFirstName = !socialData.firstName;
    const needsLastName = !socialData.lastName;
    const needsLocale = !membershipData.locale;
    
    // Only process if at least one field is empty (optimization)
    const hasEmptyFields = needsAvatar || needsFirstName || needsLastName || needsLocale;
    
    if (!hasEmptyFields) {
      console.log(`ℹ️ Customer ${customer.id} profile is complete - skipping auto-fill`);
      return;
    }
    
    console.log(`📋 Auto-filling empty fields for customer ${customer.id} from Google profile`);
    
    // Build update object with ONLY empty fields (fill-empty-only strategy)
    const updateData: any = {};
    let fieldsUpdated: string[] = [];
    
    // Update root-level avatar (only if empty)
    if (needsAvatar && profile.picture) {
      updateData.avatar = profile.picture; // ✅ Write to root customer.avatar
      fieldsUpdated.push('avatar');
    }
    
    // Update socialData fields (only if empty)
    if (needsFirstName || needsLastName) {
      updateData.socialData = { ...socialData };
      
      if (needsFirstName && profile.given_name) {
        updateData.socialData.firstName = profile.given_name;
        fieldsUpdated.push('firstName');
      }
      if (needsLastName && profile.family_name) {
        updateData.socialData.lastName = profile.family_name;
        fieldsUpdated.push('lastName');
      }
    }
    
    // Update membershipData fields (only if empty)
    if (needsLocale && profile.locale) {
      updateData.membershipData = { ...membershipData };
      updateData.membershipData.locale = profile.locale;
      fieldsUpdated.push('locale');
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

/**
 * GET /auth/google
 * Initiate Google OAuth flow - Redirect to Google login
 */
router.get('/google', async (req, res) => {
  try {
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      return res.status(500).json({ 
        error: 'Google OAuth chưa được cấu hình. Vui lòng liên hệ quản trị viên.' 
      });
    }

    // Generate secure random state parameter for CSRF protection
    const state = crypto.randomBytes(32).toString('hex');
    
    // Store state with timestamp for validation
    oauthStates.set(state, {
      timestamp: Date.now(),
      sessionId: req.sessionID || req.ip
    });

    const redirectUri = `${BASE_URL}/api/auth/google/callback`;
    
    // Required scopes for Google OAuth
    const scope = 'openid email profile';

    // Build Google OAuth authorization URL
    const authUrl = `${GOOGLE_AUTH_URL}?` +
      `client_id=${encodeURIComponent(GOOGLE_CLIENT_ID)}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent(scope)}&` +
      `state=${state}&` +
      `access_type=offline&` + // Request refresh token
      `prompt=consent`; // Force consent screen to get refresh token

    console.log('🔐 Redirecting to Google OAuth:', authUrl);
    
    res.redirect(authUrl);
  } catch (error) {
    console.error('❌ Google OAuth initiation error:', error);
    res.status(500).json({ 
      error: 'Không thể khởi tạo đăng nhập Google',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /auth/google/callback
 * Handle Google OAuth callback with authorization code
 */
router.get('/google/callback', async (req, res) => {
  try {
    const { code, state, error: oauthError, error_description } = req.query;

    // Handle OAuth errors (user denied access, etc.)
    if (oauthError) {
      console.error('❌ Google OAuth error:', oauthError, error_description);
      return res.redirect(`/?error=${encodeURIComponent('Đăng nhập Google bị hủy')}`);
    }

    // Validate required parameters
    if (!code) {
      console.error('❌ Authorization code missing from Google response');
      return res.redirect(`/?error=${encodeURIComponent('Mã xác thực không hợp lệ')}`);
    }

    // CRITICAL: Validate state parameter to prevent CSRF attacks
    if (!state) {
      console.error('🚨 OAuth callback missing state parameter - possible CSRF attack');
      return res.status(400).json({ 
        error: 'Lỗi bảo mật: thiếu tham số state' 
      });
    }

    const storedState = oauthStates.get(state as string);
    if (!storedState) {
      console.error('🚨 OAuth callback with invalid/expired state - possible CSRF attack');
      return res.status(400).json({ 
        error: 'Lỗi bảo mật: tham số state không hợp lệ hoặc đã hết hạn' 
      });
    }

    // Check state age (10 minutes max)
    if (Date.now() - storedState.timestamp > 600000) {
      console.error('🚨 OAuth callback with expired state');
      oauthStates.delete(state as string);
      return res.status(400).json({ 
        error: 'Lỗi bảo mật: phiên đăng nhập đã hết hạn' 
      });
    }

    // Remove used state to prevent replay attacks
    oauthStates.delete(state as string);

    console.log('🔄 Processing Google OAuth callback...');

    // Step 1: Exchange authorization code for access token
    const tokens = await exchangeCodeForToken(code as string);
    
    // Step 2: Get user profile from Google
    const profile = await getGoogleUserProfile(tokens.access_token);
    
    // Step 3: Find or create customer
    const customer = await findOrCreateCustomerFromGoogle(profile);
    
    // Step 3.5: Auto-fill empty customer profile fields from Google profile
    // This works for both new and existing customers
    await fillEmptyCustomerFields(customer, profile);
    
    // Step 4: Save OAuth connection
    await saveGoogleOAuthConnection(customer.id, profile, tokens);
    
    // Step 5: Set session with customer ID
    if (req.session) {
      req.session.userId = customer.id;
      req.session.provider = 'google';
      console.log('✅ Session established for customer:', customer.id);
    }
    
    console.log('✅ Google OAuth successful for:', profile.email);
    
    // Redirect to success page
    res.redirect(`/?success=google_login&name=${encodeURIComponent(customer.name)}`);
    
  } catch (error) {
    console.error('❌ Google OAuth callback error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Đăng nhập thất bại';
    res.redirect(`/?error=${encodeURIComponent(errorMessage)}`);
  }
});

/**
 * GET /auth/google/status
 * Check current Google authentication status
 */
router.get('/google/status', async (req, res) => {
  try {
    // Check if Google OAuth is configured
    const configured = !!(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET);
    
    if (!configured) {
      return res.json({
        configured: false,
        authenticated: false,
        message: 'Google OAuth chưa được cấu hình'
      });
    }

    // Check if user has an active session
    const customerId = req.session?.userId;
    if (!customerId) {
      return res.json({
        configured: true,
        authenticated: false,
        message: 'Chưa đăng nhập'
      });
    }

    // Get customer's Google OAuth connection
    const googleConnections = await db
      .select()
      .from(oauthConnections)
      .where(
        and(
          eq(oauthConnections.customerId, customerId),
          eq(oauthConnections.provider, 'google')
        )
      )
      .limit(1);

    if (googleConnections.length === 0) {
      return res.json({
        configured: true,
        authenticated: false,
        customerId,
        message: 'Không tìm thấy kết nối Google'
      });
    }

    const connection = googleConnections[0];
    const isTokenExpired = connection.tokenExpiresAt 
      ? new Date(connection.tokenExpiresAt) < new Date()
      : false;

    res.json({
      configured: true,
      authenticated: true,
      customerId,
      connection: {
        provider: connection.provider,
        email: connection.email,
        profileData: connection.profileData,
        isPrimary: connection.isPrimary,
        tokenExpired: isTokenExpired,
        connectedAt: connection.createdAt,
        lastUpdated: connection.updatedAt,
      }
    });
  } catch (error) {
    console.error('❌ Google status check error:', error);
    res.status(500).json({ 
      error: 'Không thể kiểm tra trạng thái Google OAuth',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
