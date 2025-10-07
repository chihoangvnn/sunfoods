import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { Loader2, AlertCircle } from 'lucide-react';

interface AffiliateProtectedRouteProps {
  children: React.ReactNode;
}

interface AffiliateSessionResponse {
  authenticated: boolean;
  affiliate: {
    id: string;
    name: string;
    email: string;
    affiliate_code: string;
    commission_rate: string;
    affiliate_status: string;
    affiliate_data: any;
    join_date: string;
  };
}

export default function AffiliateProtectedRoute({ children }: AffiliateProtectedRouteProps) {
  const [, setLocation] = useLocation();

  // Check affiliate authentication
  const { 
    data: sessionData, 
    isLoading, 
    error 
  } = useQuery<AffiliateSessionResponse>({
    queryKey: ['/api/affiliate-auth/session'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/affiliate-auth/session');
      
      if (!response.ok) {
        throw new Error('Not authenticated');
      }
      
      return response.json();
    },
    retry: false,
    refetchOnWindowFocus: true,
    refetchInterval: 5 * 60 * 1000, // Check every 5 minutes
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Redirect to login if not authenticated (wait for query to resolve before redirecting)
  React.useEffect(() => {
    if (!isLoading && (error || !sessionData?.authenticated)) {
      setLocation('/aff/login');
    }
  }, [isLoading, error, sessionData, setLocation]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <div className="text-gray-600">Đang kiểm tra phiên đăng nhập...</div>
          <div className="text-sm text-gray-500 mt-2">
            Vui lòng chờ trong giây lát
          </div>
        </div>
      </div>
    );
  }

  // Error or not authenticated - show message (redirect handled by useEffect above)
  if (error || !sessionData?.authenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 mx-auto mb-4 text-red-600" />
          <div className="text-gray-600 mb-2">
            Phiên đăng nhập hết hạn hoặc không hợp lệ
          </div>
          <div className="text-sm text-gray-500">
            Đang chuyển hướng đến trang đăng nhập...
          </div>
        </div>
      </div>
    );
  }

  // Check if affiliate account is still active
  if (sessionData.affiliate.affiliate_status !== 'active') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md w-full">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-yellow-600" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Tài khoản Affiliate tạm dừng
          </h2>
          <p className="text-gray-600 mb-4">
            Tài khoản affiliate của bạn hiện đang ở trạng thái:{' '}
            <span className="font-medium">
              {sessionData.affiliate.affiliate_status === 'inactive' ? 'Tạm dừng' : 'Đình chỉ'}
            </span>
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Vui lòng liên hệ với quản trị viên để biết thêm thông tin và kích hoạt lại tài khoản.
          </p>
          <button
            onClick={() => setLocation('/aff/login')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Quay lại đăng nhập
          </button>
        </div>
      </div>
    );
  }

  // Authenticated and active - render children
  return <>{children}</>;
}