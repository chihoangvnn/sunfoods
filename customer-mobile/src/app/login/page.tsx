'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();
  const { currentTheme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    
    if (result.success) {
      router.push('/');
    } else {
      setError(result.error || 'Đăng nhập thất bại');
    }
    
    setLoading(false);
  };

  const fillTestCredentials = () => {
    setEmail('test@sunfoods.vn');
    setPassword('password123');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-fresh-soil/10 to-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Logo & Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ backgroundColor: currentTheme.secondary + '20' }}>
              <span className="text-3xl">🌱</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Đăng Nhập</h1>
            <p className="text-gray-600 mt-2">Chào mừng bạn trở lại SunFoods.vn</p>
          </div>

          {/* Test credentials hint */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800 mb-2">
              🧪 <strong>Test Account:</strong>
            </p>
            <p className="text-xs text-blue-700 font-mono mb-2">
              Email: test@sunfoods.vn<br />
              Password: password123
            </p>
            <button
              type="button"
              onClick={fillTestCredentials}
              className="text-xs text-blue-600 hover:text-blue-800 underline"
            >
              Click để tự động điền
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@sunfoods.vn"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all"
                style={{ 
                  '--tw-ring-color': currentTheme.primary 
                } as React.CSSProperties}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mật khẩu
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all"
                style={{ 
                  '--tw-ring-color': currentTheme.primary 
                } as React.CSSProperties}
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full py-3 rounded-lg text-white font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg"
              style={{ 
                backgroundColor: currentTheme.primary,
                opacity: loading || !email || !password ? 0.5 : 1
              }}
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Chưa có tài khoản?{' '}
              <a href="#" className="font-semibold hover:underline" style={{ color: currentTheme.primary }}>
                Đăng ký ngay
              </a>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-gray-500">
          <p>Bằng việc đăng nhập, bạn đồng ý với</p>
          <p>
            <a href="#" className="hover:underline">Điều khoản dịch vụ</a> và{' '}
            <a href="#" className="hover:underline">Chính sách bảo mật</a>
          </p>
        </div>
      </div>
    </div>
  );
}
