'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Order {
  id: string;
  code: string;
  date: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  items: number;
  total: number;
  productPreview?: string;
}

export interface Address {
  id: string;
  name: string;
  phone: string;
  address: string;
  ward: string;
  district: string;
  city: string;
  isDefault: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'vendor' | 'admin';
  avatar?: string;
  membershipTier?: 'bronze' | 'silver' | 'gold' | 'platinum';
  pointsBalance?: number;
  totalSpent?: number;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'tramhuong-auth-user';

const MOCK_USERS: { [key: string]: User } = {
  customer: {
    id: 'demo-customer-001',
    name: 'Nguyễn Văn A',
    email: 'customer@demo.com',
    phone: '0912345678',
    role: 'customer',
    membershipTier: 'gold',
    pointsBalance: 15000,
    totalSpent: 25000000,
  },
  vendor: {
    id: 'demo-vendor-001',
    name: 'Cửa Hàng Trầm Hương ABC',
    email: 'vendor@demo.com',
    phone: '0987654321',
    role: 'vendor',
  },
  admin: {
    id: 'demo-admin-001',
    name: 'Admin Hoàng Ngân',
    email: 'admin@demo.com',
    phone: '0901234567',
    role: 'admin',
  },
};

const MOCK_ORDERS: Order[] = [
  {
    id: 'order-001',
    code: 'TH2025001',
    date: '2025-10-10',
    status: 'completed',
    items: 3,
    total: 8500000,
    productPreview: 'Vòng Trầm Hương AAA+',
  },
  {
    id: 'order-002',
    code: 'TH2025002',
    date: '2025-10-08',
    status: 'processing',
    items: 1,
    total: 12000000,
    productPreview: 'Tượng Phật Di Lặc',
  },
  {
    id: 'order-003',
    code: 'TH2025003',
    date: '2025-10-05',
    status: 'pending',
    items: 2,
    total: 4500000,
    productPreview: 'Nhang Trầm Cao Cấp',
  },
  {
    id: 'order-004',
    code: 'TH2025004',
    date: '2025-09-28',
    status: 'completed',
    items: 5,
    total: 15200000,
    productPreview: 'Combo Trầm Hương Quý',
  },
  {
    id: 'order-005',
    code: 'TH2025005',
    date: '2025-09-15',
    status: 'cancelled',
    items: 1,
    total: 3000000,
    productPreview: 'Vòng Tay Trầm Hương',
  },
];

const MOCK_ADDRESSES: Address[] = [
  {
    id: 'addr-001',
    name: 'Nguyễn Văn A',
    phone: '0912345678',
    address: '123 Đường Láng',
    ward: 'Phường Láng Thượng',
    district: 'Quận Đống Đa',
    city: 'Hà Nội',
    isDefault: true,
  },
  {
    id: 'addr-002',
    name: 'Nguyễn Văn A',
    phone: '0912345678',
    address: '456 Phố Huế',
    ward: 'Phường Ngô Thì Nhậm',
    district: 'Quận Hai Bà Trưng',
    city: 'Hà Nội',
    isDefault: false,
  },
  {
    id: 'addr-003',
    name: 'Nguyễn Thị B (Văn phòng)',
    phone: '0987654321',
    address: '789 Trần Duy Hưng',
    ward: 'Phường Trung Hòa',
    district: 'Quận Cầu Giấy',
    city: 'Hà Nội',
    isDefault: false,
  },
];

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        }
      } catch (error) {
        console.error('Error loading user from localStorage:', error);
      } finally {
        setIsLoading(false);
      }
    }
  }, []);

  const login = (newUser: User) => {
    setUser(newUser);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
      } catch (error) {
        console.error('Error saving user to localStorage:', error);
      }
    }
  };

  const logout = () => {
    setUser(null);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      } catch (error) {
        console.error('Error removing user from localStorage:', error);
      }
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export { MOCK_USERS, MOCK_ORDERS, MOCK_ADDRESSES };
