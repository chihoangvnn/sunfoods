import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  LayoutDashboard, 
  Users, 
  TrendingUp, 
  DollarSign,
  LogOut,
  Menu,
  X,
  Award,
  BarChart3,
  Link2,
  Settings,
  User,
  AlertCircle,
  CheckCircle,
  Loader2,
  ShoppingCart,
  Package
} from 'lucide-react';

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

interface AffiliateSessionResponse {
  authenticated: boolean;
  affiliate: Affiliate;
}

interface AffiliateLayoutProps {
  children: React.ReactNode;
}

export default function AffiliateLayout({ children }: AffiliateLayoutProps) {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Check affiliate authentication
  const { 
    data: sessionData, 
    isLoading: sessionLoading, 
    error: sessionError 
  } = useQuery<AffiliateSessionResponse>({
    queryKey: ['/api/affiliate-auth/session'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/affiliate-auth/session');
      
      if (!response.ok) {
        throw new Error('Not authenticated');
      }
      
      return response.json();
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/affiliate-auth/logout');
      return response.json();
    },
    onSuccess: () => {
      // Clear all queries
      queryClient.clear();
      
      toast({
        title: "Đăng xuất thành công",
        description: "Cảm ơn bạn đã sử dụng hệ thống Affiliate",
        duration: 3000,
      });
      
      setLocation('/aff/login');
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi đăng xuất",
        description: error.message || 'Không thể đăng xuất, vui lòng thử lại',
        variant: "destructive",
        duration: 3000,
      });
    },
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (sessionError && !sessionLoading) {
      setLocation('/aff/login');
    }
  }, [sessionError, sessionLoading, setLocation]);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Navigation items
  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: '/aff/dashboard',
      description: 'Tổng quan hiệu suất'
    },
    {
      id: 'create-order',
      label: 'Tạo đơn hàng',
      icon: ShoppingCart,
      path: '/aff/create-order',
      description: 'Tạo đơn cho khách'
    },
    {
      id: 'products',
      label: 'Sản phẩm',
      icon: Package,
      path: '/aff/products',
      description: 'Danh mục sản phẩm'
    },
    {
      id: 'tools',
      label: 'Công cụ',
      icon: Link2,
      path: '/aff/tools',
      description: 'Tạo link & QR code'
    },
    {
      id: 'earnings',
      label: 'Hoa hồng',
      icon: DollarSign,
      path: '/aff/earnings',
      description: 'Lịch sử thu nhập'
    },
    {
      id: 'settings',
      label: 'Cài đặt',
      icon: Settings,
      path: '/aff/settings',
      description: 'Quản lý tài khoản'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">🟢 Hoạt động</Badge>;
      case 'inactive':
        return <Badge className="bg-yellow-100 text-yellow-800">🟡 Tạm dừng</Badge>;
      case 'suspended':
        return <Badge className="bg-red-100 text-red-800">🔴 Đình chỉ</Badge>;
      default:
        return <Badge variant="secondary">Chưa xác định</Badge>;
    }
  };

  const formatCommissionRate = (rate: string) => {
    const numRate = parseFloat(rate);
    return `${numRate.toFixed(1)}%`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  // Loading state
  if (sessionLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <div className="text-gray-600">Đang kiểm tra phiên đăng nhập...</div>
        </div>
      </div>
    );
  }

  // Error state
  if (sessionError || !sessionData?.authenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 mx-auto mb-4 text-red-600" />
          <div className="text-gray-600">Phiên làm việc hết hạn. Đang chuyển hướng...</div>
        </div>
      </div>
    );
  }

  const affiliate = sessionData.affiliate;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Left side - Logo and Mobile Menu */}
            <div className="flex items-center">
              {/* Mobile menu button */}
              <button
                onClick={toggleMobileMenu}
                className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>

              {/* Logo */}
              <div className="flex items-center ml-4 lg:ml-0">
                <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg mr-3">
                  <Award className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">
                    Affiliate Portal
                  </h1>
                  <div className="text-xs text-gray-500 hidden sm:block">
                    Marketing Dashboard
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - User info and logout */}
            <div className="flex items-center space-x-4">
              {/* User Info */}
              <div className="hidden md:flex flex-col items-end">
                <div className="text-sm font-medium text-gray-900">
                  {affiliate.name}
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">
                    {affiliate.affiliate_code}
                  </span>
                  {getStatusBadge(affiliate.affiliate_status)}
                </div>
              </div>

              {/* Commission Rate Badge */}
              <Badge className="bg-blue-100 text-blue-800 hidden sm:flex">
                {formatCommissionRate(affiliate.commission_rate)} hoa hồng
              </Badge>

              {/* Logout Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
                className="text-gray-600 hover:text-gray-900"
              >
                {logoutMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <LogOut className="h-4 w-4" />
                )}
                <span className="hidden sm:ml-2 sm:inline">Đăng xuất</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 w-64 
          bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out
          lg:block overflow-y-auto mt-16 lg:mt-0
        `}>
          <div className="p-4 space-y-6">
            {/* Mobile User Info */}
            <div className="lg:hidden">
              <Card className="border-blue-200 bg-blue-50/50">
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="font-medium text-blue-900">{affiliate.name}</div>
                    <div className="text-sm text-blue-700">{affiliate.affiliate_code}</div>
                    <div className="mt-2">{getStatusBadge(affiliate.affiliate_status)}</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Navigation Menu */}
            <nav className="space-y-2">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Menu chính
              </div>
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.path;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setLocation(item.path);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`
                      w-full text-left px-3 py-2 rounded-lg transition-colors
                      ${isActive 
                        ? 'bg-blue-100 text-blue-900 border border-blue-200' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }
                    `}
                  >
                    <div className="flex items-center">
                      <Icon className={`h-5 w-5 mr-3 ${isActive ? 'text-blue-600' : ''}`} />
                      <div className="flex-1">
                        <div className="font-medium">{item.label}</div>
                        <div className="text-xs text-gray-500">{item.description}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </nav>

            {/* Quick Stats */}
            <Card className="border-purple-200 bg-purple-50/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                  Thông tin nhanh
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Tỷ lệ hoa hồng:</span>
                  <span className="font-medium text-purple-900">
                    {formatCommissionRate(affiliate.commission_rate)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Tham gia từ:</span>
                  <span className="font-medium text-purple-900">
                    {formatDate(affiliate.join_date)}
                  </span>
                </div>
                {affiliate.membership_tier && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Hạng thành viên:</span>
                    <span className="font-medium text-purple-900">
                      {affiliate.membership_tier}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </aside>

        {/* Mobile overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={toggleMobileMenu}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}