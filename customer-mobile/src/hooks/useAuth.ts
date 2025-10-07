import React from 'react';
import { useQuery } from "@tanstack/react-query";

// Removed unused API_BASE_URL - using relative paths for auth

export interface User {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export function useAuth() {
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ['/api/auth/user'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/auth/user', {
          method: 'GET',
          credentials: 'include',
        });
        
        if (response.status === 401) {
          // Gracefully handle unauthenticated state - don't throw error
          return null;
        }
        
        if (!response.ok) {
          // Return null for failed auth instead of throwing
          return null;
        }
        
        return await response.json();
      } catch (error) {
        // Return null for any network errors
        console.log('Auth check failed, treating as unauthenticated');
        return null;
      }
    },
    retry: false, // Don't retry auth requests
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnMount: false, // Don't refetch on mount if cached
  });

  const login = () => {
    // Redirect to secure Replit Auth OAuth flow
    window.location.href = '/api/login';
  };

  const logout = () => {
    // Redirect to secure Replit Auth logout
    window.location.href = '/api/logout';
  };

  return {
    user: user || null,
    isLoading: isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    error,
  };
}

export function isUnauthorizedError(error: Error): boolean {
  return /^401: .*Unauthorized/.test(error.message);
}