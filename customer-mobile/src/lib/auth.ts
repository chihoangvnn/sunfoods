import { NextRequest, NextResponse } from 'next/server';

// Session user type
export interface SessionUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
  provider: 'replit' | 'facebook';
}

// OAuth configurations
export const oauthConfigs = {
  replit: {
    clientID: process.env.REPLIT_CLIENT_ID || '',
    clientSecret: process.env.REPLIT_CLIENT_SECRET || '',
    callbackURL: process.env.NEXT_PUBLIC_BASE_URL + '/api/auth/replit/callback',
    authorizationURL: 'https://replit.com/oauth/authorize',
    tokenURL: 'https://replit.com/oauth/token',
    scope: ['user:read']
  },
  facebook: {
    clientID: process.env.FACEBOOK_APP_ID || '',
    clientSecret: process.env.FACEBOOK_APP_SECRET || '',
    callbackURL: process.env.NEXT_PUBLIC_BASE_URL + '/api/auth/facebook/callback',
    scope: ['email', 'public_profile']
  }
};

// Authentication middleware
export function requireAuth(handler: (req: NextRequest, session: any) => Promise<NextResponse>) {
  return async (req: NextRequest): Promise<NextResponse> => {
    // Simple session check - in production, you'd implement proper session handling
    const session = req.cookies.get('session')?.value;
    
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // In production, validate session with database
    // For now, assume valid if session cookie exists
    return handler(req, session);
  };
}

// CSRF token generation
export function generateCSRFToken(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

// Helper to validate CSRF token
export function validateCSRFToken(token: string, sessionToken: string): boolean {
  return token === sessionToken;
}