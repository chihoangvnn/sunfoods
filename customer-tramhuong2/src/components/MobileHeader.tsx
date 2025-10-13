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
  storeName = "Trầm Hương Hoàng Ngân" 
}: MobileHeaderProps) {
  const { user, isAuthenticated } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  return (
    <div className="sticky top-0 z-50 bg-tramhuong-primary/95 backdrop-blur-sm md:backdrop-blur-md gpu-accelerate shadow-[0_8px_32px_rgba(193,168,117,0.3)] border-b border-tramhuong-accent/20 lg:hidden">
      <div className="flex items-center justify-between p-4 text-tramhuong-bg">
        {/* Left: Store name as home button */}
        <Button 
          variant="ghost" 
          className="text-tramhuong-bg hover:bg-tramhuong-accent/20 hover:text-tramhuong-accent p-2 flex items-center gap-2 transition-all duration-300"
          onClick={() => window.location.href = '/'}
        >
          <Home size={18} className="text-tramhuong-accent" />
          <div className="text-left">
            <h1 className="font-playfair font-bold text-lg">{storeName}</h1>
            <p className="text-xs text-tramhuong-accent">Tinh Hoa Trầm Hương</p>
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
              className="text-tramhuong-bg hover:bg-tramhuong-accent/20 hover:text-tramhuong-accent p-2 transition-all duration-300"
            >
              {user?.profileImageUrl ? (
                <img 
                  src={user.profileImageUrl} 
                  alt="Profile" 
                  className="w-5 h-5 rounded-full object-cover border-2 border-tramhuong-accent"
                />
              ) : (
                <User size={18} className="text-tramhuong-accent" />
              )}
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsLoginModalOpen(true)}
              className="text-tramhuong-bg hover:bg-tramhuong-accent/20 hover:text-tramhuong-accent p-2 transition-all duration-300"
            >
              <LogIn size={18} className="text-tramhuong-accent" />
            </Button>
          )}

          {/* Notifications */}
          <Button
            variant="ghost"
            size="sm"
            className="text-tramhuong-accent hover:bg-tramhuong-accent/20 hover:shadow-[0_0_10px_rgba(193,168,117,0.3)] p-2 transition-all duration-300"
          >
            <Bell size={20} />
          </Button>

          {/* Cart with count */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onCartClick}
            className="text-tramhuong-accent hover:bg-tramhuong-accent/20 hover:shadow-[0_0_10px_rgba(193,168,117,0.3)] p-2 relative transition-all duration-300"
          >
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full gradient-bronze-shimmer text-tramhuong-primary text-xs flex items-center justify-center p-0 min-w-0 font-bold shadow-lg">
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