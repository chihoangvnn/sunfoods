import React, { useState } from 'react';
import { X, Users, Mail, Facebook } from 'lucide-react';
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

  React.useEffect(() => {
    if (isAuthenticated) {
      onClose();
    }
  }, [isAuthenticated, onClose]);

  const handleGuestLogin = async () => {
    setIsLoading('guest');
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      if (onGuestLogin) onGuestLogin();
      onClose();
    } catch (error) {
      console.error('Guest login error:', error);
    } finally {
      setIsLoading(null);
    }
  };

  const handleReplitLogin = () => {
    window.location.href = '/api/login';
  };

  const handleFacebookLogin = () => {
    window.location.href = '/api/login';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm mx-auto shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Đăng nhập</h2>
            <p className="text-sm text-gray-600">Chọn cách thức đăng nhập</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            aria-label="Đóng"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {!hideGuestOption && (
            <button
              onClick={handleGuestLogin}
              disabled={isLoading !== null}
              className="w-full flex items-center justify-center space-x-3 p-4 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 rounded-xl transition-colors duration-200 border-2 border-transparent hover:border-gray-300"
            >
              <div className="w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center">
                <Users size={14} className="text-white" />
              </div>
              <span className="font-medium text-gray-700">
                {isLoading === 'guest' ? 'Đang đăng nhập...' : 'Tiếp tục với khách'}
              </span>
              {isLoading === 'guest' && (
                <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
              )}
            </button>
          )}

          <button
            onClick={handleReplitLogin}
            disabled={isLoading !== null}
            className="w-full flex items-center justify-center space-x-3 p-4 bg-red-50 hover:bg-red-100 disabled:bg-red-25 rounded-xl transition-colors duration-200 border-2 border-transparent hover:border-red-200"
          >
            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
              <Mail size={14} className="text-white" />
            </div>
            <span className="font-medium text-red-700">
              {isLoading === 'gmail' ? 'Đang chuyển hướng...' : 'Đăng nhập với Gmail'}
            </span>
            {isLoading === 'gmail' && (
              <div className="w-4 h-4 border-2 border-red-200 border-t-red-500 rounded-full animate-spin"></div>
            )}
          </button>

          <button
            onClick={handleFacebookLogin}
            disabled={isLoading !== null}
            className="w-full flex items-center justify-center space-x-3 p-4 bg-blue-50 hover:bg-blue-100 disabled:bg-blue-25 rounded-xl transition-colors duration-200 border-2 border-transparent hover:border-blue-200"
          >
            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
              <Facebook size={14} className="text-white" />
            </div>
            <span className="font-medium text-blue-700">
              {isLoading === 'facebook' ? 'Đang kết nối...' : 'Đăng nhập với Facebook'}
            </span>
            {isLoading === 'facebook' && (
              <div className="w-4 h-4 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            )}
          </button>
        </div>

        <div className="px-6 pb-6">
          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs text-gray-500 text-center leading-relaxed">
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

export default LoginModal;
