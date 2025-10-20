'use client'

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { User, LogIn, LogOut, Mail, Shield, ArrowLeft, Package, Heart, MapPin, Bell, Crown, FileText, ChevronRight } from 'lucide-react';
import { OrderHistory } from '@/components/OrderHistory';
import { VipTierCard } from '@/components/VipTierCard';
import { AddressManagement } from '@/components/AddressManagement';
import { NotesManagementPage } from '@/components/NotesManagementPage';
import { PushNotificationSettings } from '@/components/PushNotificationSettings';
import { CustomerProfileAddress } from '@/components/CustomerProfileAddress';
import { calculateVipStatus } from '@/utils/vipCalculator';
import { useQuery } from '@tanstack/react-query';
import { fetchOrders } from '@/lib/orderApi';
import LoginModal from './LoginModal';
import DesktopLoginModal from './DesktopLoginModal';
import { useResponsive } from '@/hooks/use-mobile';

interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
  media?: string;
  category_id: string;
  stock: number;
  short_description?: string;
  status: string;
}

interface ProfileTabProps {
  addToCart?: (product: Product) => void;
  setActiveTab?: (tab: string) => void;
}

export function ProfileTab({ addToCart, setActiveTab }: ProfileTabProps = {}) {
  const { user, isAuthenticated, isLoading, login, logout } = useAuth();
  const [activeView, setActiveView] = useState<'profile' | 'orders' | 'wishlist' | 'shipping' | 'notifications' | 'notes' | 'address'>('profile');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { isMobile } = useResponsive();

  // Fetch real order history to calculate total spent - MUST be called before any conditional returns
  const { data: orders = [], isLoading: isLoadingOrders, error: ordersError } = useQuery({
    queryKey: ['orders'],
    queryFn: fetchOrders,
    enabled: isAuthenticated, // Only fetch when user is authenticated
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1, // Only retry once on failure
  });

  // Calculate real total spent from delivered orders
  const totalSpent = orders
    .filter(order => order.status === 'delivered') // Only count delivered orders
    .reduce((sum, order) => sum + order.total, 0);

  // Calculate VIP status based on real purchase history
  const vipProgress = calculateVipStatus(totalSpent);

  if (isLoading) {
    return (
      <div className="p-4 pt-6">
        <div className="bg-white rounded-xl p-6 mb-4 animate-pulse">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="p-4 pt-6">
        <div className="bg-white rounded-xl p-6 mb-4 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <User className="w-10 h-10 text-gray-400" />
          </div>
          
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Chào mừng bạn!
          </h2>
          
          <p className="text-[16px] md:text-[17px] text-gray-600 mb-6">
            Đăng nhập để trải nghiệm mua sắm tốt nhất và theo dõi đơn hàng của bạn.
          </p>
          
          <Button 
            onClick={() => setIsLoginModalOpen(true)}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-[16px] md:text-[18px] min-h-[56px]"
          >
            <LogIn className="w-5 h-5 mr-2" />
            Đăng nhập
          </Button>
          
          <div className="mt-4 text-[16px] md:text-[17px] text-gray-500">
            <p className="flex items-center justify-center">
              <Shield className="w-4 h-4 mr-1" />
              Đăng nhập an toàn với Gmail, Facebook hoặc khách
            </p>
          </div>
        </div>

        {/* Guest Features */}
        <div className="bg-white rounded-xl p-6">
          <h3 className="text-[18px] md:text-[20px] font-bold text-gray-900 mb-4">
            Tính năng khi đăng nhập
          </h3>
          <ul className="space-y-3 text-[16px] md:text-[17px] text-gray-700">
            <li className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3 flex-shrink-0"></div>
              Lưu giỏ hàng và sản phẩm yêu thích
            </li>
            <li className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3 flex-shrink-0"></div>
              Theo dõi lịch sử đơn hàng
            </li>
            <li className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3 flex-shrink-0"></div>
              Thanh toán nhanh với thông tin đã lưu
            </li>
            <li className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3 flex-shrink-0"></div>
              Nhận thông báo về ưu đãi đặc biệt
            </li>
          </ul>
        </div>

        {/* Login Modal - Responsive */}
        {isMobile ? (
          <LoginModal 
            isOpen={isLoginModalOpen}
            onClose={() => setIsLoginModalOpen(false)}
          />
        ) : (
          <DesktopLoginModal 
            isOpen={isLoginModalOpen}
            onClose={() => setIsLoginModalOpen(false)}
          />
        )}
      </div>
    );
  }

  // Authenticated user view
  if (!user) return null; // Type guard

  // Render different views based on activeView
  if (activeView === 'orders') {
    return (
      <div className="p-4 pt-6">
        {/* Back Button */}
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            onClick={() => setActiveView('profile')}
            className="p-2 mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold text-gray-900">Lịch sử đơn hàng</h1>
        </div>
        
        <OrderHistory addToCart={addToCart} setActiveTab={setActiveTab} />
      </div>
    );
  }

  if (activeView === 'shipping') {
    return (
      <AddressManagement onBack={() => setActiveView('profile')} />
    );
  }

  if (activeView === 'notes') {
    return (
      <NotesManagementPage onBack={() => setActiveView('profile')} />
    );
  }

  if (activeView === 'address') {
    return (
      <CustomerProfileAddress 
        onBack={() => setActiveView('profile')}
        onSaved={() => {
          setActiveView('profile');
        }}
      />
    );
  }

  if (activeView === 'notifications') {
    return (
      <div className="p-4 pt-6">
        {/* Back Button */}
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            onClick={() => setActiveView('profile')}
            className="p-2 mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold text-gray-900">Cài đặt thông báo</h1>
        </div>
        
        <PushNotificationSettings />
        
        <div className="mt-4 bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 className="text-[16px] md:text-[18px] font-semibold text-blue-900 mb-2">💡 Về thông báo đẩy</h3>
          <ul className="text-[16px] md:text-[17px] text-blue-800 space-y-1">
            <li>• Nhận thông báo ngay khi có đơn hàng mới</li>
            <li>• Hoạt động ngay cả khi không mở website</li>
            <li>• Có thể tắt bất cứ lúc nào</li>
          </ul>
        </div>
      </div>
    );
  }

  // Profile overview (default view)
  return (
    <div className="pb-4">
      {/* Enhanced Gradient Hero Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-500 p-6 mb-4 shadow-lg">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-[72px] h-[72px] rounded-full overflow-hidden bg-white/20 backdrop-blur-sm flex items-center justify-center ring-4 ring-white/30">
            {user.profileImageUrl ? (
              <img 
                src={user.profileImageUrl} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-10 h-10 text-white" />
            )}
          </div>
          
          <div className="flex-1">
            <h2 className="text-[20px] md:text-[22px] font-bold text-white tracking-tight leading-snug">
              {user.firstName || user.lastName 
                ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                : 'Người dùng'
              }
            </h2>
            {user.email && (
              <p className="text-white/90 text-[16px] md:text-[17px] flex items-center mt-1">
                <Mail className="w-4 h-4 mr-1" />
                {user.email}
              </p>
            )}
          </div>
          
          <Button 
            onClick={logout}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
        
        {/* Quick Action Buttons */}
        <div className="grid grid-cols-3 gap-2">
          <button 
            onClick={() => setActiveView('orders')}
            className="bg-white/90 backdrop-blur-sm rounded-xl p-3 text-center hover:bg-white transition-all shadow-sm min-h-[56px] flex flex-col items-center justify-center"
          >
            <Package className="h-5 w-5 text-green-600 mb-1" />
            <span className="text-[16px] md:text-[17px] font-medium text-gray-900">Đơn mua</span>
          </button>
          <button 
            onClick={() => {}}
            className="bg-white/90 backdrop-blur-sm rounded-xl p-3 text-center hover:bg-white transition-all shadow-sm min-h-[56px] flex flex-col items-center justify-center"
          >
            <Crown className="h-5 w-5 text-amber-500 mb-1" />
            <span className="text-[16px] md:text-[17px] font-medium text-gray-900">VIP</span>
          </button>
          <button 
            onClick={() => setActiveView('notifications')}
            className="bg-white/90 backdrop-blur-sm rounded-xl p-3 text-center hover:bg-white transition-all shadow-sm min-h-[56px] flex flex-col items-center justify-center"
          >
            <Bell className="h-5 w-5 text-orange-500 mb-1" />
            <span className="text-[16px] md:text-[17px] font-medium text-gray-900">Thông báo</span>
          </button>
        </div>
      </div>
      
      <div className="px-4">
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <div className="text-[24px] font-bold text-gray-900">{orders.length}</div>
          <div className="text-[16px] md:text-[17px] text-gray-600">Đơn hàng</div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <div className="text-[24px] font-bold text-green-600">
            {orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled' && o.status !== 'shipped').length}
          </div>
          <div className="text-[16px] md:text-[17px] text-gray-600">Chờ giao</div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <div className="text-[24px] font-bold text-amber-600">0</div>
          <div className="text-[16px] md:text-[17px] text-gray-600">Voucher</div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <div className="text-[24px] font-bold text-orange-600">0</div>
          <div className="text-[16px] md:text-[17px] text-gray-600">Tin mới</div>
        </div>
      </div>

      {/* VIP Tier System */}
      {isLoadingOrders ? (
        <div className="bg-white rounded-xl p-6 mb-4 animate-pulse">
          <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      ) : ordersError ? (
        <div className="bg-white rounded-xl p-6 mb-4">
          <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-yellow-700 text-[16px] md:text-[17px]">
              Không thể tải thông tin cấp độ. Hãy thử lại sau.
            </p>
          </div>
        </div>
      ) : (
        <VipTierCard vipProgress={vipProgress} />
      )}

      {/* Account Features - Shopee Style Menu */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="text-[18px] md:text-[20px] font-bold text-gray-900 px-6 pt-6 pb-3">
          Tài khoản của tôi
        </h3>
        
        <div className="space-y-0 divide-y divide-gray-100">
          <button 
            onClick={() => setActiveView('orders')}
            className="w-full text-left px-6 py-4 hover:bg-green-50/40 transition-colors flex items-center min-h-[56px] group"
          >
            <Package className="h-5 w-5 text-green-600 mr-4 flex-shrink-0" />
            <div className="flex-1">
              <div className="text-[16px] md:text-[18px] font-medium text-gray-900">Lịch sử đơn hàng</div>
              <div className="text-[16px] md:text-[17px] text-gray-500 mt-0.5">Xem các đơn hàng đã mua</div>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-green-600 transition-colors flex-shrink-0" />
          </button>
          
          <button 
            onClick={() => setActiveView('wishlist')}
            className="w-full text-left px-6 py-4 hover:bg-green-50/40 transition-colors flex items-center min-h-[56px] group"
          >
            <Heart className="h-5 w-5 text-red-500 mr-4 flex-shrink-0" />
            <div className="flex-1">
              <div className="text-[16px] md:text-[18px] font-medium text-gray-900">Sản phẩm yêu thích</div>
              <div className="text-[16px] md:text-[17px] text-gray-500 mt-0.5">Quản lý danh sách yêu thích</div>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-red-500 transition-colors flex-shrink-0" />
          </button>
          
          <button 
            onClick={() => setActiveView('shipping')}
            className="w-full text-left px-6 py-4 hover:bg-green-50/40 transition-colors flex items-center min-h-[56px] group"
          >
            <MapPin className="h-5 w-5 text-blue-600 mr-4 flex-shrink-0" />
            <div className="flex-1">
              <div className="text-[16px] md:text-[18px] font-medium text-gray-900">Thông tin giao hàng</div>
              <div className="text-[16px] md:text-[17px] text-gray-500 mt-0.5">Địa chỉ và thông tin liên lạc</div>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0" />
          </button>
          
          <button 
            onClick={() => setActiveView('address')}
            className="w-full text-left px-6 py-4 hover:bg-green-50/40 transition-colors flex items-center min-h-[56px] group"
          >
            <MapPin className="h-5 w-5 text-green-600 mr-4 flex-shrink-0" />
            <div className="flex-1">
              <div className="text-[16px] md:text-[18px] font-medium text-gray-900">Địa chỉ chính</div>
              <div className="text-[16px] md:text-[17px] text-gray-500 mt-0.5">Cập nhật địa chỉ trên bản đồ</div>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-green-600 transition-colors flex-shrink-0" />
          </button>
          
          <button 
            onClick={() => setActiveView('notes')}
            className="w-full text-left px-6 py-4 hover:bg-green-50/40 transition-colors flex items-center min-h-[56px] group"
          >
            <FileText className="h-5 w-5 text-purple-600 mr-4 flex-shrink-0" />
            <div className="flex-1">
              <div className="text-[16px] md:text-[18px] font-medium text-gray-900">Quản lý ghi chú</div>
              <div className="text-[16px] md:text-[17px] text-gray-500 mt-0.5">Xem và chỉnh sửa ghi chú lịch</div>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-purple-600 transition-colors flex-shrink-0" />
          </button>
          
          <button 
            onClick={() => setActiveView('notifications')}
            className="w-full text-left px-6 py-4 hover:bg-green-50/40 transition-colors flex items-center min-h-[56px] group"
          >
            <Bell className="h-5 w-5 text-orange-600 mr-4 flex-shrink-0" />
            <div className="flex-1">
              <div className="text-[16px] md:text-[18px] font-medium text-gray-900">Cài đặt thông báo</div>
              <div className="text-[16px] md:text-[17px] text-gray-500 mt-0.5">Nhận thông báo đơn hàng mới</div>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-orange-600 transition-colors flex-shrink-0" />
          </button>
        </div>
      </div>
      </div>
    </div>
  );
}