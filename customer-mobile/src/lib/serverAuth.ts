/**
 * Server-side authentication utilities for API routes
 */

import { NextRequest } from 'next/server';

export interface AuthenticatedUser {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
}

/**
 * Get authenticated user from request session
 * Returns null if no valid session exists
 */
export async function getAuthenticatedUser(request: NextRequest): Promise<AuthenticatedUser | null> {
  const sessionId = request.cookies.get('session_id')?.value;
  
  if (!sessionId) {
    return null;
  }

  try {
    const { sessionManager } = await import('../../server/sessionManager');
    const sessionData = await sessionManager.getSession(sessionId);
    
    if (!sessionData || !sessionData.userId) {
      return null;
    }

    return {
      userId: sessionData.userId,
      email: sessionData.email || '',
      firstName: sessionData.firstName || '',
      lastName: sessionData.lastName || '',
      profileImageUrl: sessionData.profileImageUrl,
    };
  } catch (error) {
    console.error('Session validation error:', error);
    return null;
  }
}

/**
 * Require authentication - throws if user not authenticated
 * Use this at the start of API routes that require authentication
 */
export async function requireAuthentication(request: NextRequest): Promise<AuthenticatedUser> {
  const user = await getAuthenticatedUser(request);
  
  if (!user) {
    throw new Error('Authentication required');
  }
  
  return user;
}
