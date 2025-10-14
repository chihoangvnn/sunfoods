'use client'

import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  avatar?: string;
  membershipTier: 'bronze' | 'silver' | 'gold' | 'platinum';
  points: number;
  joinDate: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || '/api';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const res = await fetch(`${API_URL}/session/status`, {
          credentials: 'include' // Include cookies
        });
        
        if (!res.ok) {
          throw new Error('Failed to check session status');
        }
        
        const data = await res.json();
        
        if (data.authenticated && data.customer) {
          setUser({
            id: data.customer.id,
            email: data.customer.email,
            name: data.customer.name,
            phone: data.customer.phone,
            avatar: data.customer.avatar,
            membershipTier: data.customer.membershipTier || 'bronze',
            points: data.customer.points || 0,
            joinDate: data.customer.joinDate
          });
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Session restoration error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(`${API_URL}/session/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // Include cookies
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        return { 
          success: false, 
          error: data.error || 'Đăng nhập thất bại' 
        };
      }

      if (data.success && data.customer) {
        const userData: User = {
          id: data.customer.id,
          email: data.customer.email,
          name: data.customer.name,
          phone: data.customer.phone,
          avatar: data.customer.avatar,
          membershipTier: data.customer.membershipTier || 'bronze',
          points: data.customer.points || 0,
          joinDate: data.customer.joinDate
        };
        
        setUser(userData);
        setIsAuthenticated(true);
        return { success: true };
      }

      return { success: false, error: 'Đăng nhập thất bại' };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: 'Có lỗi xảy ra. Vui lòng thử lại.' 
      };
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API_URL}/session/logout`, {
        method: 'POST',
        credentials: 'include' // Include cookies
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear state regardless of API response
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const updateProfile = (data: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
    }
  };

  // Don't render children until session check is complete
  if (isLoading) {
    return null; // or a loading spinner
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
