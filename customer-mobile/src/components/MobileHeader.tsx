'use client'

import React, { useState } from 'react';
import { Home, Search, ShoppingCart, Bell, User, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import LoginModal from './LoginModal';

interface MobileHeaderProps {
  onSearchClick?: () => void;
  onCartClick?: () => void;
  onProfileClick?: () => void;
  cartCount?: number;
  storeName?: string;
}

export function MobileHeader({ 
  onSearchClick, 
  onCartClick, 
  onProfileClick,
  cartCount = 0, 
  storeName = "Nhang Sạch .Net" 
}: MobileHeaderProps) {
  const { user, isAuthenticated } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  return (
    <div className="sticky top-0 z-50 bg-gradient-to-r from-green-600 to-green-700 shadow-lg">
      <div className="flex items-center justify-between p-4 text-white">
        {/* Left: Store name as home button */}
        <Button 
          variant="ghost" 
          className="text-white hover:bg-white/20 p-2 flex items-center gap-2"
          onClick={() => window.location.href = '/'}
        >
          <Home size={18} />
          <div className="text-left">
            <h1 className="font-bold text-lg">{storeName}</h1>
            <p className="text-xs text-green-100">Sản phẩm tự nhiên</p>
          </div>
        </Button>

        {/* Right: Actions */}
        <div className="flex items-center gap-1">
          {/* User Profile/Login */}
          {isAuthenticated ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={onProfileClick}
              className="text-white hover:bg-white/20 p-2"
            >
              {user?.profileImageUrl ? (
                <img 
                  src={user.profileImageUrl} 
                  alt="Profile" 
                  className="w-5 h-5 rounded-full object-cover border border-white/30"
                />
              ) : (
                <User size={18} />
              )}
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsLoginModalOpen(true)}
              className="text-white hover:bg-white/20 p-2"
            >
              <LogIn size={18} />
            </Button>
          )}

          {/* Notifications */}
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20 p-2"
          >
            <Bell size={20} />
          </Button>

          {/* Cart with count */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onCartClick}
            className="text-white hover:bg-white/20 p-2 relative"
          >
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center p-0 min-w-0">
                {cartCount > 99 ? '99+' : cartCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Login Modal */}
      <LoginModal 
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onGuestLogin={() => setIsLoginModalOpen(false)}
      />
    </div>
  );
}