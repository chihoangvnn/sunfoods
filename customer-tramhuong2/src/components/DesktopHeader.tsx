'use client'

import React, { useState } from 'react';
import { ShoppingCart, Search, User, LogIn, PlusCircle } from 'lucide-react';
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
    <header className="bg-tramhuong-primary/95 backdrop-blur-sm md:backdrop-blur-md gpu-accelerate shadow-[0_8px_32px_rgba(193,168,117,0.3)] sticky top-0 z-50 border-b border-tramhuong-accent/20">
      <div className="w-full px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="flex items-center justify-between h-16">
          {/* Store Logo/Name - Clickable */}
          <div className="flex items-center">
            <button 
              onClick={onLogoClick}
              className="text-xl lg:text-2xl font-playfair font-bold text-tramhuong-bg hover:text-tramhuong-accent transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-tramhuong-accent/30 rounded-md px-2 py-1 hover-underline"
              aria-label="Về trang chủ"
            >
              TRẦM HƯƠNG 2
            </button>
          </div>

          {/* Desktop Search Bar - Luxury Styling */}
          <div className="flex-1 max-w-xs mx-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-tramhuong-accent" />
              </div>
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="block w-full pl-8 pr-3 py-2 border border-tramhuong-accent/40 rounded-lg leading-4 bg-tramhuong-bg/10 placeholder-tramhuong-bg/60 text-tramhuong-bg focus:outline-none focus:placeholder-tramhuong-bg/80 focus:ring-2 focus:ring-tramhuong-accent focus:border-tramhuong-accent focus:bg-tramhuong-bg/20 transition-all duration-300 text-sm"
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
              className="bg-tramhuong-accent/15 border-tramhuong-accent/40 text-tramhuong-bg hover:bg-tramhuong-accent/30 hover:border-tramhuong-accent hover:shadow-[0_0_15px_rgba(193,168,117,0.3)] transition-all duration-300"
            >
              <PlusCircle className="h-4 w-4 text-tramhuong-accent" />
              <span className="ml-2 hidden lg:inline">Thêm Blog</span>
            </Button>
            
            {/* Cart Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={onCartClick}
              className="relative bg-tramhuong-bg/15 border-tramhuong-accent/40 text-tramhuong-bg hover:bg-tramhuong-accent/20 hover:border-tramhuong-accent hover:shadow-[0_0_15px_rgba(193,168,117,0.3)] transition-all duration-300"
            >
              <ShoppingCart className="h-4 w-4 text-tramhuong-accent" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 gradient-bronze-shimmer text-tramhuong-primary text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold shadow-lg">
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
                onClick={onProfileClick}
                className="flex bg-tramhuong-bg/15 border-tramhuong-accent/40 text-tramhuong-bg hover:bg-tramhuong-accent/20 hover:border-tramhuong-accent hover:shadow-[0_0_15px_rgba(193,168,117,0.3)] transition-all duration-300 px-4 py-2"
              >
                {user?.profileImageUrl ? (
                  <img 
                    src={user.profileImageUrl} 
                    alt="Profile" 
                    className="h-5 w-5 rounded-full object-cover border border-tramhuong-accent"
                  />
                ) : (
                  <User className="h-5 w-5 text-tramhuong-accent" />
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
                className="flex bg-tramhuong-bg/15 border-tramhuong-accent/40 text-tramhuong-bg hover:bg-tramhuong-accent/20 hover:border-tramhuong-accent hover:shadow-[0_0_15px_rgba(193,168,117,0.3)] transition-all duration-300 px-4 py-2"
              >
                <LogIn className="h-5 w-5 text-tramhuong-accent" />
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