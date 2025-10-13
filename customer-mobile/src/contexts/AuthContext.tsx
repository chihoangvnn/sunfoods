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

// Mock user data cho test
const MOCK_USERS = {
  'test@sunfoods.vn': {
    id: '1',
    email: 'test@sunfoods.vn',
    name: 'Nguyễn Văn Test',
    phone: '0912345678',
    avatar: 'https://ui-avatars.com/api/?name=Nguyen+Van+Test&background=1F7A4D&color=fff&size=200',
    membershipTier: 'gold' as const,
    points: 2500,
    joinDate: '2024-01-15',
    password: 'password123'
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check localStorage for existing session
    const savedUser = localStorage.getItem('sunfoods_user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setIsAuthenticated(true);
      } catch (e) {
        localStorage.removeItem('sunfoods_user');
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // Mock authentication
    const mockUser = MOCK_USERS[email as keyof typeof MOCK_USERS];
    
    if (!mockUser) {
      return { success: false, error: 'Email không tồn tại' };
    }

    if (mockUser.password !== password) {
      return { success: false, error: 'Mật khẩu không đúng' };
    }

    // Remove password from user data
    const { password: _, ...userData } = mockUser;
    
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('sunfoods_user', JSON.stringify(userData));

    return { success: true };
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('sunfoods_user');
  };

  const updateProfile = (data: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      localStorage.setItem('sunfoods_user', JSON.stringify(updatedUser));
    }
  };

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
