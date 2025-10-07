'use client';

import React, { useState } from 'react';
import { X, User, Mail, Chrome } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface DesktopLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGuestLogin?: () => void;
  hideGuestOption?: boolean;
}

const DesktopLoginModal: React.FC<DesktopLoginModalProps> = ({ isOpen, onClose, onGuestLogin, hideGuestOption = false }) => {
  const [isLoading, setIsLoading] = useState<'guest' | 'gmail' | 'facebook' | null>(null);
  const { isAuthenticated } = useAuth();

  // Close modal if user is already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      onClose();
    }
  }, [isAuthenticated, onClose]);

  const handleGuestLogin = async () => {
    setIsLoading('guest');
    try {
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate loading
      if (onGuestLogin) onGuestLogin();
      onClose();
    } catch (error) {
      console.error('Guest login error:', error);
    } finally {
      setIsLoading(null);
    }
  };

  const handleGoogleLogin = () => {
    // Redirect to Google OAuth
    window.location.href = '/api/login';
  };

  const handleFacebookLogin = () => {
    // Redirect to Google OAuth (supports multiple providers)
    window.location.href = '/api/login';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg mx-auto shadow-2xl animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-gray-100">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Đăng nhập</h2>
            <p className="text-base text-gray-600 mt-1">Chọn cách thức đăng nhập</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100"
            aria-label="Đóng"
          >
            <X size={24} />
          </button>
        </div>

        {/* Login Options */}
        <div className="p-8 space-y-5">
          {/* Guest Login */}
          {!hideGuestOption && (
            <button
              onClick={handleGuestLogin}
              disabled={isLoading !== null}
              className="w-full flex items-center justify-center space-x-4 p-5 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 rounded-xl transition-colors duration-200 border-2 border-transparent hover:border-gray-300"
            >
              <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
                <User size={18} className="text-white" />
              </div>
              <span className="font-medium text-gray-700 text-lg">
                {isLoading === 'guest' ? 'Đang đăng nhập...' : 'Tiếp tục với khách'}
              </span>
              {isLoading === 'guest' && (
                <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
              )}
            </button>
          )}

          {/* Gmail Login */}
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading !== null}
            className="w-full flex items-center justify-center space-x-4 p-5 bg-red-50 hover:bg-red-100 disabled:bg-red-25 rounded-xl transition-colors duration-200 border-2 border-transparent hover:border-red-200"
          >
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
              <Mail size={18} className="text-white" />
            </div>
            <span className="font-medium text-red-700 text-lg">
              {isLoading === 'gmail' ? 'Đang chuyển hướng...' : 'Đăng nhập với Gmail'}
            </span>
            {isLoading === 'gmail' && (
              <div className="w-5 h-5 border-2 border-red-200 border-t-red-500 rounded-full animate-spin"></div>
            )}
          </button>

          {/* Facebook Login */}
          <button
            onClick={handleFacebookLogin}
            disabled={isLoading !== null}
            className="w-full flex items-center justify-center space-x-4 p-5 bg-blue-50 hover:bg-blue-100 disabled:bg-blue-25 rounded-xl transition-colors duration-200 border-2 border-transparent hover:border-blue-200"
          >
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <Chrome size={18} className="text-white" />
            </div>
            <span className="font-medium text-blue-700 text-lg">
              {isLoading === 'facebook' ? 'Đang kết nối...' : 'Đăng nhập với Facebook'}
            </span>
            {isLoading === 'facebook' && (
              <div className="w-5 h-5 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            )}
          </button>
        </div>

        {/* Footer */}
        <div className="px-8 pb-8">
          <div className="border-t border-gray-100 pt-6">
            <p className="text-sm text-gray-500 text-center leading-relaxed">
              Bằng cách đăng nhập, bạn đồng ý với{' '}
              <a href="#" className="text-green-600 hover:underline">Điều khoản</a>
              {' '}và{' '}
              <a href="#" className="text-green-600 hover:underline">Chính sách bảo mật</a>
              {' '}của chúng tôi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesktopLoginModal;