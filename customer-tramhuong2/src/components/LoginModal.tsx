'use client';

import React, { useState } from 'react';
import { X, User, Mail, Chrome } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGuestLogin?: () => void;
  hideGuestOption?: boolean;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onGuestLogin, hideGuestOption = false }) => {
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

  const handleReplitLogin = () => {
    // Redirect to Replit Auth
    window.location.href = '/api/login';
  };

  const handleFacebookLogin = () => {
    // Redirect to Replit Auth (supports multiple providers)
    window.location.href = '/api/login';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-tramhuong-primary/20 backdrop-blur-sm p-4">
      <div className="bg-white/60 backdrop-blur-md rounded-2xl w-full max-w-sm mx-auto shadow-[0_8px_32px_rgba(193,168,117,0.3)] animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-tramhuong-accent/20">
          <div>
            <h2 className="text-xl font-bold text-tramhuong-primary font-playfair">Đăng nhập</h2>
            <p className="text-sm text-tramhuong-primary/70">Chọn cách thức đăng nhập</p>
          </div>
          <button
            onClick={onClose}
            className="text-tramhuong-primary/40 hover:text-tramhuong-primary transition-all duration-300 p-1"
            aria-label="Đóng"
          >
            <X size={20} />
          </button>
        </div>

        {/* Login Options */}
        <div className="p-6 space-y-4">
          {/* Guest Login */}
          {!hideGuestOption && (
            <button
              onClick={handleGuestLogin}
              disabled={isLoading !== null}
              className="w-full flex items-center justify-center space-x-3 p-4 bg-tramhuong-accent/10 hover:bg-tramhuong-accent/20 disabled:bg-tramhuong-accent/5 rounded-xl transition-all duration-300 border-2 border-transparent hover:border-tramhuong-accent/30"
            >
              <div className="w-6 h-6 bg-tramhuong-accent rounded-full flex items-center justify-center">
                <User size={14} className="text-white" />
              </div>
              <span className="font-medium text-tramhuong-primary">
                {isLoading === 'guest' ? 'Đang đăng nhập...' : 'Tiếp tục với khách'}
              </span>
              {isLoading === 'guest' && (
                <div className="w-4 h-4 border-2 border-tramhuong-accent/30 border-t-tramhuong-accent rounded-full animate-spin"></div>
              )}
            </button>
          )}

          {/* Gmail Login */}
          <button
            onClick={handleReplitLogin}
            disabled={isLoading !== null}
            className="w-full flex items-center justify-center space-x-3 p-4 bg-tramhuong-accent/10 hover:bg-tramhuong-accent/20 disabled:bg-tramhuong-accent/5 rounded-xl transition-all duration-300 border-2 border-transparent hover:border-tramhuong-accent/30"
          >
            <div className="w-6 h-6 bg-tramhuong-accent rounded-full flex items-center justify-center">
              <Mail size={14} className="text-white" />
            </div>
            <span className="font-medium text-tramhuong-primary">
              {isLoading === 'gmail' ? 'Đang chuyển hướng...' : 'Đăng nhập với Gmail'}
            </span>
            {isLoading === 'gmail' && (
              <div className="w-4 h-4 border-2 border-tramhuong-accent/30 border-t-tramhuong-accent rounded-full animate-spin"></div>
            )}
          </button>

          {/* Facebook Login */}
          <button
            onClick={handleFacebookLogin}
            disabled={isLoading !== null}
            className="w-full flex items-center justify-center space-x-3 p-4 bg-tramhuong-accent/10 hover:bg-tramhuong-accent/20 disabled:bg-tramhuong-accent/5 rounded-xl transition-all duration-300 border-2 border-transparent hover:border-tramhuong-accent/30"
          >
            <div className="w-6 h-6 bg-tramhuong-accent rounded-full flex items-center justify-center">
              <Chrome size={14} className="text-white" />
            </div>
            <span className="font-medium text-tramhuong-primary">
              {isLoading === 'facebook' ? 'Đang kết nối...' : 'Đăng nhập với Facebook'}
            </span>
            {isLoading === 'facebook' && (
              <div className="w-4 h-4 border-2 border-tramhuong-accent/30 border-t-tramhuong-accent rounded-full animate-spin"></div>
            )}
          </button>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          <div className="border-t border-tramhuong-accent/20 pt-4">
            <p className="text-xs text-tramhuong-primary/60 text-center leading-relaxed">
              Bằng cách đăng nhập, bạn đồng ý với{' '}
              <a href="#" className="text-tramhuong-accent hover:underline transition-all duration-300">Điều khoản</a>
              {' '}và{' '}
              <a href="#" className="text-tramhuong-accent hover:underline transition-all duration-300">Chính sách bảo mật</a>
              {' '}của chúng tôi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;