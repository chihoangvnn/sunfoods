import React, { createContext, useContext, useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface Affiliate {
  id: string;
  name: string;
  email: string;
  affiliate_code: string;
  commission_rate: string;
  affiliate_status: string;
  affiliate_data: any;
  join_date: string;
  total_spent?: number;
  membership_tier?: string;
}

interface AffiliateAuthContextType {
  affiliate: Affiliate | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: Error | null;
  login: (affiliateCode: string) => Promise<void>;
  logout: () => Promise<void>;
  refetchSession: () => void;
}

const AffiliateAuthContext = createContext<AffiliateAuthContextType | undefined>(undefined);

export const useAffiliateAuth = () => {
  const context = useContext(AffiliateAuthContext);
  if (!context) {
    throw new Error('useAffiliateAuth must be used within an AffiliateAuthProvider');
  }
  return context;
};

interface AffiliateAuthProviderProps {
  children: React.ReactNode;
}

interface SessionResponse {
  authenticated: boolean;
  affiliate?: Affiliate;
}

interface LoginResponse {
  success: boolean;
  message: string;
  affiliate: Affiliate;
}

export const AffiliateAuthProvider: React.FC<AffiliateAuthProviderProps> = ({ children }) => {
  const queryClient = useQueryClient();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [affiliate, setAffiliate] = useState<Affiliate | null>(null);

  // Session query
  const {
    data: sessionData,
    isLoading,
    error,
    refetch: refetchSession,
  } = useQuery<SessionResponse>({
    queryKey: ['/api/affiliate-auth/session'],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/affiliate-auth/session');
        
        if (!response.ok) {
          throw new Error('Not authenticated');
        }
        
        return await response.json();
      } catch (err) {
        throw new Error('Session check failed');
      }
    },
    retry: false,
    refetchOnWindowFocus: true,
    refetchInterval: 5 * 60 * 1000, // Check every 5 minutes
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Update state based on session data
  useEffect(() => {
    if (sessionData?.authenticated && sessionData.affiliate) {
      setIsAuthenticated(true);
      setAffiliate(sessionData.affiliate);
    } else {
      setIsAuthenticated(false);
      setAffiliate(null);
    }
  }, [sessionData]);

  // Login function
  const login = async (affiliateCode: string): Promise<void> => {
    try {
      const response = await apiRequest('POST', '/api/affiliate-auth/login', {
        body: JSON.stringify({ affiliate_code: affiliateCode }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Login failed');
      }

      const data: LoginResponse = await response.json();
      
      if (data.success && data.affiliate) {
        setIsAuthenticated(true);
        setAffiliate(data.affiliate);
        
        // Invalidate and refetch session
        queryClient.invalidateQueries({ queryKey: ['/api/affiliate-auth/session'] });
        queryClient.invalidateQueries({ queryKey: ['/api/affiliate-portal/dashboard'] });
      } else {
        throw new Error('Login response invalid');
      }
    } catch (error) {
      setIsAuthenticated(false);
      setAffiliate(null);
      throw error;
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      await apiRequest('POST', '/api/affiliate-auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with logout even if API call fails
    } finally {
      // Clear state
      setIsAuthenticated(false);
      setAffiliate(null);
      
      // Clear all queries
      queryClient.clear();
    }
  };

  const contextValue: AffiliateAuthContextType = {
    affiliate,
    isAuthenticated,
    isLoading,
    error: error as Error | null,
    login,
    logout,
    refetchSession,
  };

  return (
    <AffiliateAuthContext.Provider value={contextValue}>
      {children}
    </AffiliateAuthContext.Provider>
  );
};