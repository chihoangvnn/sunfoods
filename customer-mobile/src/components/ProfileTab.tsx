'use client'

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { User, LogIn, LogOut, Mail, Shield, ArrowLeft, Package, Heart, MapPin, Bell, Crown, FileText, ChevronRight, Plus, Truck, AlertCircle, Calendar, Tag, Ticket } from 'lucide-react';
import { OrderHistory } from '@/components/OrderHistory';
import { AddressManagement } from '@/components/AddressManagement';
import { NotesManagementPage } from '@/components/NotesManagementPage';
import { CustomerPushSettings } from '@/components/CustomerPushSettings';
import { CustomerProfileAddress } from '@/components/CustomerProfileAddress';
import { VoucherCard, type Voucher } from '@/components/VoucherCard';
import { WishlistView } from '@/components/WishlistView';
import { FullScreenLunarCalendar } from '@/components/FullScreenLunarCalendar';
import { calculateVipStatus } from '@/utils/vipCalculator';
import { useQuery } from '@tanstack/react-query';
import { fetchOrders } from '@/lib/orderApi';
import LoginModal from './LoginModal';
import DesktopLoginModal from './DesktopLoginModal';
import { useResponsive } from '@/hooks/use-mobile';

// Mock voucher data
const MOCK_VOUCHERS: Voucher[] = [
  {
    id: 'v1',
    code: 'ORGANIC20',
    title: 'Giảm 20% Rau Organic',
    description: 'Áp dụng cho tất cả rau củ organic',
    discount: 20,
    discountType: 'percentage',
    minOrderValue: 200000,
    expiryDate: '2024-11-30',
    status: 'available',
    category: 'Rau củ'
  },
  {
    id: 'v2',
    code: 'FREESHIP50',
    title: 'Miễn phí vận chuyển',
    description: 'Free ship đơn từ 300k',
    discount: 50000,
    discountType: 'fixed',
    minOrderValue: 300000,
    expiryDate: '2024-11-25',
    status: 'available',
    category: 'Vận chuyển'
  },
  {
    id: 'v3',
    code: 'NEWFRESH100',
    title: 'Giảm 100K cho khách mới',
    description: 'Dành cho đơn hàng đầu tiên',
    discount: 100000,
    discountType: 'fixed',
    minOrderValue: 500000,
    expiryDate: '2024-12-15',
    status: 'available',
    category: 'Khách mới'
  },
  {
    id: 'v4',
    code: 'FRUIT15',
    title: 'Giảm 15% Trái cây',
    description: 'Áp dụng cho tất cả trái cây tươi',
    discount: 15,
    discountType: 'percentage',
    minOrderValue: 150000,
    expiryDate: '2024-11-20',
    status: 'available',
    category: 'Trái cây'
  },
  {
    id: 'v5',
    code: 'SUMMER50',
    title: 'Ưu đãi mùa hè',
    description: 'Giảm giá đặc biệt',
    discount: 50000,
    discountType: 'fixed',
    minOrderValue: 400000,
    expiryDate: '2024-10-15',
    status: 'expired',
    category: 'Khuyến mãi'
  },
  {
    id: 'v6',
    code: 'VIP30',
    title: 'VIP Member - 30% OFF',
    description: 'Dành riêng thành viên VIP',
    discount: 30,
    discountType: 'percentage',
    minOrderValue: 1000000,
    expiryDate: '2024-10-10',
    status: 'used',
    category: 'VIP'
  }
];

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
  const { user, isAuthenticated, login, logout } = useAuth();
  const [activeView, setActiveView] = useState<'profile' | 'orders' | 'wishlist' | 'shipping' | 'notifications' | 'notes' | 'address' | 'vouchers' | 'calendar'>('profile');
  const [vouchers] = useState<Voucher[]>(MOCK_VOUCHERS);
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

  // Calculate real total spent from delivered orders - guard against null/undefined totals
  const totalSpent = orders
    .filter(order => order.status === 'delivered') // Only count delivered orders
    .reduce((sum, order) => sum + (order.total || 0), 0);

  // Calculate VIP status based on real purchase history
  const vipProgress = calculateVipStatus(totalSpent);

  const handleTestLogin = async () => {
    await login('test@sunfoods.vn', 'password123');
  };

  if (!isAuthenticated) {
    return (
      <div className="px-5 pt-5">
        <div className="bg-white rounded-xl p-4 mb-4 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <User className="w-10 h-10 text-gray-400" />
          </div>
          
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Chào mừng bạn!
          </h2>
          
          <p className="text-base text-gray-600 mb-6">
            Đăng nhập để trải nghiệm mua sắm tốt nhất và theo dõi đơn hàng của bạn.
          </p>
          
          <div className="space-y-3">
            <Button 
              onClick={() => setIsLoginModalOpen(true)}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-base min-h-[56px]"
            >
              <LogIn className="w-5 h-5 mr-2" />
              Đăng nhập
            </Button>
            
            <Button 
              onClick={handleTestLogin}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3 text-base min-h-[56px]"
            >
              🧪 Test Login (Demo)
            </Button>
          </div>
          
          <div className="mt-4 text-sm text-gray-500">
            <p className="flex items-center justify-center">
              <Shield className="w-4 h-4 mr-1" />
              Đăng nhập an toàn với Gmail, Facebook hoặc khách
            </p>
          </div>
        </div>

        {/* Guest Features */}
        <div className="bg-white rounded-xl p-4">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Tính năng khi đăng nhập
          </h3>
          <ul className="space-y-3 text-base text-gray-700">
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
      <div className="px-5 pt-5">
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
      <div className="px-5 pt-5">
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
        
        <CustomerPushSettings />
      </div>
    );
  }

  if (activeView === 'wishlist') {
    return (
      <WishlistView 
        onBack={() => setActiveView('profile')}
        addToCart={addToCart}
      />
    );
  }

  if (activeView === 'calendar') {
    return (
      <div className="min-h-screen">
        {/* Back Button */}
        <div className="flex items-center mb-4 px-5 pt-5 bg-white">
          <Button
            variant="ghost"
            onClick={() => setActiveView('profile')}
            className="p-2 mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold text-gray-900">Lịch Âm</h1>
        </div>
        
        <FullScreenLunarCalendar />
      </div>
    );
  }

  if (activeView === 'vouchers') {
    const availableVouchers = vouchers.filter(v => v.status === 'available');
    const usedVouchers = vouchers.filter(v => v.status === 'used');
    const expiredVouchers = vouchers.filter(v => v.status === 'expired');

    const handleUseVoucher = (voucherId: string) => {
      // Navigate to cart tab and apply voucher (in real app, pass voucher to cart state)
      const voucher = vouchers.find(v => v.id === voucherId);
      if (voucher) {
        // Store voucher in localStorage for cart to pick up
        if (typeof window !== 'undefined') {
          localStorage.setItem('selectedVoucher', JSON.stringify(voucher));
        }
        setActiveTab?.('cart');
      }
    };

    return (
      <div className="px-5 pt-5 pb-20">
        {/* Back Button */}
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            onClick={() => setActiveView('profile')}
            className="p-2 mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold text-gray-900">Kho Voucher</h1>
        </div>

        {/* Claim New Voucher Button */}
        <div className="mb-6">
          <button className="w-full bg-gradient-to-r from-warm-sun to-amber-400 text-white font-semibold py-4 px-6 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-md">
            <Plus className="w-5 h-5" />
            Nhận voucher mới
          </button>
        </div>

        {/* Available Vouchers */}
        {availableVouchers.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Ticket className="w-5 h-5 text-green-600" />
              Khả dụng ({availableVouchers.length})
            </h2>
            <div className="space-y-4">
              {availableVouchers.map(voucher => (
                <VoucherCard 
                  key={voucher.id} 
                  voucher={voucher} 
                  onUse={handleUseVoucher}
                />
              ))}
            </div>
          </div>
        )}

        {/* Used Vouchers */}
        {usedVouchers.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-700 mb-4">
              Đã sử dụng ({usedVouchers.length})
            </h2>
            <div className="space-y-4">
              {usedVouchers.map(voucher => (
                <VoucherCard key={voucher.id} voucher={voucher} />
              ))}
            </div>
          </div>
        )}

        {/* Expired Vouchers */}
        {expiredVouchers.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-700 mb-4">
              Hết hạn ({expiredVouchers.length})
            </h2>
            <div className="space-y-4">
              {expiredVouchers.map(voucher => (
                <VoucherCard key={voucher.id} voucher={voucher} />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {vouchers.length === 0 && (
          <div className="text-center py-12">
            <Ticket className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Bạn chưa có voucher nào</p>
            <p className="text-gray-400 text-sm mt-2">Nhận voucher để tiết kiệm chi phí!</p>
          </div>
        )}
      </div>
    );
  }

  // Profile overview (default view)
  return (
    <div className="px-5 pt-6 pb-24 bg-gray-50 min-h-screen">
      {/* Clean Centered Hero Header */}
      <div className="bg-white rounded-2xl p-6 mb-6 text-center shadow-sm relative">
        {/* Large Centered Avatar with Ring */}
        <div className="relative inline-block mb-4">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center ring-4 ring-green-600 ring-offset-2">
            {user.avatar ? (
              <img 
                src={user.avatar} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-12 h-12 text-gray-400" />
            )}
          </div>
          {/* Verified Badge */}
          <div className="absolute bottom-0 right-0 w-7 h-7 bg-green-600 rounded-full flex items-center justify-center ring-2 ring-white">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
        
        {/* Name in Gray (NOT amber) */}
        <h2 className="text-xl font-semibold text-gray-900 mb-3">
          {user.name || 'Người dùng'}
        </h2>
        
        {/* VIP Progress Bar - Moved up to replace subtitle */}
        <div className="max-w-[280px] mx-auto">
          {vipProgress.nextTier ? (
            <>
              {/* Progress Label with Crown */}
              <div className="flex items-center justify-center gap-2 mb-2">
                <Crown className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-medium text-gray-700">
                  Lên cấp {vipProgress.nextTier.name}
                </span>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 mb-1.5">
                <div 
                  className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-300"
                  style={{ width: `${vipProgress.progressToNext}%` }}
                />
              </div>
              
              {/* Progress Percentage */}
              <p className="text-xs text-gray-600 text-center">
                <Crown className="w-3 h-3 inline text-amber-500 mr-1" />
                Đã đạt {vipProgress.progressToNext}% - Tiếp tục mua sắm!
              </p>
            </>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <Crown className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-medium text-gray-700">{vipProgress.currentTier.name}</span>
            </div>
          )}
        </div>
        
        {/* Logout Button - Top Right */}
        <Button 
          onClick={logout}
          variant="ghost"
          size="sm"
          className="absolute top-4 right-4 text-gray-600 hover:bg-gray-100"
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>

      {/* Khuyến Mãi Button */}
      <div className="bg-white rounded-2xl p-4 mb-6 shadow-sm">
        <button
          onClick={() => setActiveView('vouchers')}
          className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-red-50 transition-colors active:scale-95 border border-red-100"
        >
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center">
            <Tag className="w-7 h-7 text-red-600" />
          </div>
          <div className="flex-1 text-left">
            <h3 className="text-base font-semibold text-gray-900">Khuyến Mãi</h3>
            <p className="text-sm text-gray-600">Xem các chương trình ưu đãi hấp dẫn</p>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Colorful Icon Grid - No heading for space optimization */}
      <div className="bg-white rounded-2xl p-5 mb-6 shadow-sm">
        <div className="grid grid-cols-3 gap-3">
          {/* Đơn hàng - Blue */}
          <button
            onClick={() => setActiveView('orders')}
            className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-blue-50 transition-colors active:scale-95"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-xs font-medium text-gray-700">Đơn hàng</span>
          </button>

          {/* Địa chỉ - Green */}
          <button
            onClick={() => setActiveView('address')}
            className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-green-50 transition-colors active:scale-95"
          >
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <MapPin className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-xs font-medium text-gray-700">Địa chỉ</span>
          </button>

          {/* Voucher - Amber */}
          <button
            onClick={() => setActiveView('vouchers')}
            className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-amber-50 transition-colors active:scale-95"
          >
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
              <Ticket className="w-6 h-6 text-amber-600" />
            </div>
            <span className="text-xs font-medium text-gray-700">Voucher</span>
          </button>

          {/* Yêu thích - Red */}
          <button
            onClick={() => setActiveView('wishlist')}
            className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-red-50 transition-colors active:scale-95"
          >
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <Heart className="w-6 h-6 text-red-600" />
            </div>
            <span className="text-xs font-medium text-gray-700">Yêu thích</span>
          </button>

          {/* Customer Care - Purple */}
          <button
            onClick={() => setActiveView('notifications')}
            className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-purple-50 transition-colors active:scale-95"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Bell className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-xs font-medium text-gray-700">Thông báo</span>
          </button>

          {/* Lịch Âm - Teal */}
          <button
            onClick={() => setActiveView('calendar')}
            className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-teal-50 transition-colors active:scale-95"
          >
            <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
              <Calendar className="w-6 h-6 text-teal-600" />
            </div>
            <span className="text-xs font-medium text-gray-700">Lịch Âm</span>
          </button>
        </div>
      </div>

      {/* Simple Menu - 4 Items Only (No Sections/Dividers) */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <button 
          onClick={() => setActiveView('orders')}
          className="w-full px-5 py-4 flex items-center hover:bg-gray-50 transition-colors border-b border-gray-100"
        >
          <Package className="w-5 h-5 text-gray-600 mr-4" />
          <span className="flex-1 text-left text-base font-medium text-gray-900">Đơn hàng</span>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>

        <button 
          onClick={() => setActiveView('address')}
          className="w-full px-5 py-4 flex items-center hover:bg-gray-50 transition-colors border-b border-gray-100"
        >
          <MapPin className="w-5 h-5 text-gray-600 mr-4" />
          <span className="flex-1 text-left text-base font-medium text-gray-900">Địa chỉ</span>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>

        <button 
          onClick={() => setActiveView('vouchers')}
          className="w-full px-5 py-4 flex items-center hover:bg-gray-50 transition-colors border-b border-gray-100"
        >
          <Ticket className="w-5 h-5 text-gray-600 mr-4" />
          <span className="flex-1 text-left text-base font-medium text-gray-900">Voucher</span>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>

        <button 
          onClick={() => setActiveView('wishlist')}
          className="w-full px-5 py-4 flex items-center hover:bg-gray-50 transition-colors"
        >
          <Heart className="w-5 h-5 text-gray-600 mr-4" />
          <span className="flex-1 text-left text-base font-medium text-gray-900">Yêu thích</span>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>
      </div>
    </div>
  );
}