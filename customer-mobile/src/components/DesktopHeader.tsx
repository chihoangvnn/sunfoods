'use client'

import React, { useState } from 'react';
import { ShoppingCart, Search, User, LogIn, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import DesktopLoginModal from './DesktopLoginModal';
import { SunFoodsLogo } from './SunFoodsLogo';

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
  const { user, isAuthenticated } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  
  const handleGuestLogin = () => {
    onGuestLogin?.();
    setIsLoginModalOpen(false);
  };
  
  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="w-full px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="flex items-center justify-between h-16">
          {/* Store Logo/Name - Clickable */}
          <div className="flex items-center">
            <button 
              onClick={onLogoClick}
              className="hover:opacity-80 transition-opacity duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-sunrise-leaf/20 rounded-md px-2 py-1"
              aria-label="Về trang chủ"
            >
              <SunFoodsLogo size="lg" showText={true} variant="default" />
            </button>
          </div>

          {/* Desktop Search Bar - Premium Style */}
          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-warm-sun" />
              </div>
              <input
                type="text"
                placeholder="Tìm thực phẩm organic..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="block w-full pl-12 pr-4 py-2.5 border border-gray-200 rounded-lg leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:placeholder-gray-300 focus:ring-2 focus:ring-warm-sun focus:border-warm-sun focus:bg-white text-sm transition-all duration-200"
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-3">
            {/* Blog Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={onBlogClick}
              className="border-gray-200 text-sunrise-leaf hover:bg-sunrise-leaf/5 hover:border-sunrise-leaf/30"
            >
              <PlusCircle className="h-4 w-4" />
              <span className="ml-2 hidden lg:inline">Thêm Blog</span>
            </Button>
            
            {/* Cart Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={onCartClick}
              className="relative border-gray-200 text-sunrise-leaf hover:bg-sunrise-leaf/5 hover:border-sunrise-leaf/30"
            >
              <ShoppingCart className="h-4 w-4" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-warm-sun text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold shadow-md">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
              <span className="ml-2 hidden lg:inline">Giỏ hàng</span>
            </Button>

            {/* Profile/Login Button */}
            {isAuthenticated ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.href = '/profile'}
                className="flex border-gray-200 text-sunrise-leaf hover:bg-sunrise-leaf/5 hover:border-sunrise-leaf/30 px-4 py-2"
              >
                {user?.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt="Profile" 
                    className="h-5 w-5 rounded-full object-cover"
                  />
                ) : (
                  <User className="h-5 w-5" />
                )}
                <span className="ml-2">
                  {user?.name || 'Tài khoản'}
                </span>
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.href = '/login'}
                className="flex border-gray-200 text-sunrise-leaf hover:bg-sunrise-leaf/5 hover:border-sunrise-leaf/30 hover:shadow-md transition-all duration-200 px-4 py-2"
              >
                <LogIn className="h-5 w-5" />
                <span className="ml-2 font-medium">Đăng nhập</span>
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Login Modal */}
      <DesktopLoginModal 
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onGuestLogin={handleGuestLogin}
      />
    </header>
  );
}