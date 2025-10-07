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
    <div className="bg-white">
      {/* User Info Header */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-t-lg">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center overflow-hidden">
              {user.profileImageUrl ? (
                <img 
                  src={user.profileImageUrl} 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={24} className="text-white" />
              )}
            </div>
            {user.isGuest && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
                <Crown size={10} className="text-yellow-800" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg">{getUserDisplayName()}</h3>
            <p className="text-green-100 text-sm">{getUserSubtext()}</p>
            {user.isGuest && (
              <div className="mt-2">
                <button 
                  onClick={() => window.location.href = '/api/login'}
                  className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-colors"
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
        <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <ShoppingBag size={16} className="text-blue-600" />
            </div>
            <span className="font-medium text-gray-800">Đơn hàng của tôi</span>
          </div>
          <ChevronRight size={16} className="text-gray-400" />
        </button>

        {/* Wishlist */}
        <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
              <Heart size={16} className="text-red-600" />
            </div>
            <span className="font-medium text-gray-800">Sản phẩm yêu thích</span>
          </div>
          <ChevronRight size={16} className="text-gray-400" />
        </button>

        {/* Settings */}
        {!user.isGuest && (
          <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <Settings size={16} className="text-gray-600" />
              </div>
              <span className="font-medium text-gray-800">Cài đặt tài khoản</span>
            </div>
            <ChevronRight size={16} className="text-gray-400" />
          </button>
        )}

        {/* Logout */}
        <button 
          onClick={handleLogout}
          disabled={isLoading}
          className="w-full flex items-center justify-between p-3 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
              <LogOut size={16} className="text-red-600" />
            </div>
            <span className="font-medium text-red-600">
              {isLoading ? 'Đang đăng xuất...' : 'Đăng xuất'}
            </span>
          </div>
          {isLoading && (
            <div className="w-4 h-4 border-2 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
          )}
        </button>
      </div>

      {/* Guest Upgrade Prompt */}
      {user.isGuest && (
        <div className="m-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <Crown size={20} className="text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-semibold text-gray-800 text-sm">Nâng cấp tài khoản</h4>
              <p className="text-gray-600 text-xs mt-1 leading-relaxed">
                Đăng nhập để lưu đơn hàng, theo dõi giao hàng và nhận ưu đãi độc quyền
              </p>
              <button 
                onClick={() => window.location.href = '/api/login'}
                className="mt-2 text-xs bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1.5 rounded-md transition-colors font-medium"
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