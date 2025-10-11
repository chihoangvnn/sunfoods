import React, { useState } from 'react';
import { ShoppingCart, Search, Users, Activity, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import DesktopLoginModal from './DesktopLoginModal';

interface DesktopHeaderProps {
  storeName: string;
  cartCount: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onCartClick: () => void;
  onProfileClick?: () => void;
  onGuestLogin?: () => void;
  onBlogClick?: () => void;
  onLogoClick?: () => void;
}

export function DesktopHeader({
  storeName,
  cartCount,
  searchQuery,
  onSearchChange,
  onCartClick,
  onProfileClick,
  onGuestLogin,
  onBlogClick,
  onLogoClick
}: DesktopHeaderProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  
  const handleGuestLogin = () => {
    onGuestLogin?.();
    setIsLoginModalOpen(false);
  };
  
  return (
    <header className="bg-green-600 shadow-sm sticky top-0 z-50">
      <div className="w-full px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <button 
              onClick={onLogoClick}
              className="text-xl lg:text-2xl font-bold text-white hover:text-green-100 transition-colors duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/20 rounded-md px-2 py-1"
              aria-label="Về trang chủ"
            >
              {storeName}
            </button>
          </div>

          <div className="flex-1 max-w-xs mx-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Tìm kiếm..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="block w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded-md leading-4 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-green-400 focus:border-green-400 text-sm"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={onBlogClick}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30"
            >
              <Plus className="h-4 w-4" />
              <span className="ml-2 hidden lg:inline">Thêm Blog</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onCartClick}
              className="relative bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30"
            >
              <ShoppingCart className="h-4 w-4" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
              <span className="ml-2 hidden lg:inline">Giỏ hàng</span>
            </Button>

            {isAuthenticated ? (
              <Button
                variant="outline"
                size="sm"
                onClick={onProfileClick}
                className="flex bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30 px-4 py-2"
              >
                {user?.profileImageUrl ? (
                  <img 
                    src={user.profileImageUrl} 
                    alt="Profile" 
                    className="h-5 w-5 rounded-full object-cover"
                  />
                ) : (
                  <Users className="h-5 w-5" />
                )}
                <span className="ml-2">
                  {user?.firstName || user?.lastName 
                    ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                    : 'Tài khoản'
                  }
                </span>
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsLoginModalOpen(true)}
                className="flex bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30 hover:shadow-md transition-all duration-200 px-4 py-2"
              >
                <Activity className="h-5 w-5" />
                <span className="ml-2 font-medium">Đăng nhập</span>
              </Button>
            )}
          </div>
        </div>
      </div>
      
      <DesktopLoginModal 
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onGuestLogin={handleGuestLogin}
      />
    </header>
  );
}
