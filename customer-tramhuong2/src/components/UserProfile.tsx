'use client';

import React, { useState } from 'react';
import { User, LogOut, ShoppingBag, Heart, Settings, ChevronRight, Crown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const UserProfile = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  if (!isAuthenticated || !user) {
    return null;
  }

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getUserDisplayName = () => {
    if (user.isGuest) {
      return user.guestName || 'Khách hàng';
    }
    
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    
    if (user.firstName) {
      return user.firstName;
    }
    
    if (user.email) {
      return user.email.split('@')[0];
    }
    
    return 'Người dùng';
  };

  const getUserSubtext = () => {
    if (user.isGuest) {
      return 'Tài khoản khách - Giới hạn tính năng';
    }
    
    return user.email || 'Người dùng đã xác thực';
  };

  return (
    <div className="bg-white/60 backdrop-blur-md shadow-[0_8px_32px_rgba(193,168,117,0.3)]">
      {/* User Info Header */}
      <div className="bg-gradient-to-r from-tramhuong-accent to-tramhuong-primary text-white p-6 rounded-t-lg shadow-[0_8px_32px_rgba(193,168,117,0.3)]">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center overflow-hidden border-2 border-tramhuong-accent/30">
              {user.profileImageUrl ? (
                <img 
                  src={user.profileImageUrl} 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={24} className="text-tramhuong-primary" />
              )}
            </div>
            {user.isGuest && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-tramhuong-accent rounded-full flex items-center justify-center">
                <Crown size={10} className="text-tramhuong-primary" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-playfair font-bold text-lg">{getUserDisplayName()}</h3>
            <p className="text-white/80 text-sm">{getUserSubtext()}</p>
            {user.isGuest && (
              <div className="mt-2">
                <button 
                  onClick={() => window.location.href = '/api/login'}
                  className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-all duration-300"
                >
                  Nâng cấp tài khoản
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Menu Options */}
      <div className="p-4 space-y-1">
        {/* Orders */}
        <button className="w-full flex items-center justify-between p-3 hover:bg-tramhuong-accent/10 rounded-lg transition-all duration-300">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-tramhuong-accent/10 rounded-lg flex items-center justify-center border border-tramhuong-accent/20">
              <ShoppingBag size={16} className="text-tramhuong-accent" />
            </div>
            <span className="font-medium text-tramhuong-primary">Đơn hàng của tôi</span>
          </div>
          <ChevronRight size={16} className="text-tramhuong-accent/60" />
        </button>

        {/* Wishlist */}
        <button className="w-full flex items-center justify-between p-3 hover:bg-tramhuong-accent/10 rounded-lg transition-all duration-300">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-tramhuong-accent/10 rounded-lg flex items-center justify-center border border-tramhuong-accent/20">
              <Heart size={16} className="text-tramhuong-accent" />
            </div>
            <span className="font-medium text-tramhuong-primary">Sản phẩm yêu thích</span>
          </div>
          <ChevronRight size={16} className="text-tramhuong-accent/60" />
        </button>

        {/* Settings */}
        {!user.isGuest && (
          <button className="w-full flex items-center justify-between p-3 hover:bg-tramhuong-accent/10 rounded-lg transition-all duration-300">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-tramhuong-accent/10 rounded-lg flex items-center justify-center border border-tramhuong-accent/20">
                <Settings size={16} className="text-tramhuong-accent" />
              </div>
              <span className="font-medium text-tramhuong-primary">Cài đặt tài khoản</span>
            </div>
            <ChevronRight size={16} className="text-tramhuong-accent/60" />
          </button>
        )}

        {/* Logout */}
        <button 
          onClick={handleLogout}
          disabled={isLoading}
          className="w-full flex items-center justify-between p-3 hover:bg-tramhuong-accent/10 rounded-lg transition-all duration-300 disabled:opacity-50"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-tramhuong-accent/10 rounded-lg flex items-center justify-center border border-tramhuong-accent/20">
              <LogOut size={16} className="text-tramhuong-accent" />
            </div>
            <span className="font-medium text-tramhuong-accent">
              {isLoading ? 'Đang đăng xuất...' : 'Đăng xuất'}
            </span>
          </div>
          {isLoading && (
            <div className="w-4 h-4 border-2 border-tramhuong-accent/20 border-t-tramhuong-accent rounded-full animate-spin"></div>
          )}
        </button>
      </div>

      {/* Guest Upgrade Prompt */}
      {user.isGuest && (
        <div className="m-4 p-4 bg-white/60 backdrop-blur-md border border-tramhuong-accent/20 rounded-lg shadow-[0_8px_32px_rgba(193,168,117,0.2)]">
          <div className="flex items-start space-x-3">
            <Crown size={20} className="text-tramhuong-accent mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-playfair font-semibold text-tramhuong-primary text-sm">Nâng cấp tài khoản</h4>
              <p className="text-tramhuong-primary/70 text-xs mt-1 leading-relaxed">
                Đăng nhập để lưu đơn hàng, theo dõi giao hàng và nhận ưu đãi độc quyền
              </p>
              <button 
                onClick={() => window.location.href = '/api/login'}
                className="mt-2 text-xs bg-tramhuong-accent hover:bg-tramhuong-primary text-white px-3 py-1.5 rounded-md transition-all duration-300 font-medium"
              >
                Đăng nhập ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;