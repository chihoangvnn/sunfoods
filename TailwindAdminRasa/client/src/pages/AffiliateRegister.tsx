import React, { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  UserPlus, 
  Users, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  ArrowRight,
  Clock,
  DollarSign,
  TrendingUp
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CustomerInfo {
  id: string;
  name: string;
  email: string;
  phone: string;
  isAffiliate?: boolean;
  affiliateStatus?: string;
}

export default function AffiliateRegister() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [applicationStatus, setApplicationStatus] = useState<'none' | 'pending' | 'active'>('none');

  // Check customer session and affiliate status
  useEffect(() => {
    const checkCustomerSession = async () => {
      try {
        const response = await apiRequest('GET', '/api/affiliate/me');
        
        if (!response.ok) {
          // Not logged in as customer
          setIsLoading(false);
          return;
        }

        const data = await response.json();
        setCustomerInfo(data.customer);
        
        // Check affiliate status
        if (data.customer.isAffiliate || data.customer.customerRole?.includes('affiliate')) {
          if (data.customer.affiliateStatus === 'active') {
            setApplicationStatus('active');
          } else {
            setApplicationStatus('pending');
          }
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Session check error:', error);
        setIsLoading(false);
      }
    };

    checkCustomerSession();
  }, []);

  // Apply mutation
  const applyMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/affiliate/apply', {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Không thể gửi yêu cầu');
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Gửi yêu cầu thành công!",
        description: "Yêu cầu của bạn đã được gửi đến quản trị viên. Vui lòng chờ phê duyệt.",
        duration: 5000,
      });
      
      setApplicationStatus('pending');
    },
    onError: (error: Error) => {
      toast({
        title: "Gửi yêu cầu thất bại",
        description: error.message || 'Vui lòng thử lại sau',
        variant: "destructive",
        duration: 5000,
      });
    },
  });

  const handleApply = () => {
    applyMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600 mb-4" />
          <p className="text-gray-600">Đang kiểm tra thông tin...</p>
        </div>
      </div>
    );
  }

  // Not logged in as customer
  if (!customerInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-xl">
          <CardHeader className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4 mx-auto">
              <AlertCircle className="h-8 w-8 text-yellow-600" />
            </div>
            <CardTitle className="text-2xl">Yêu cầu đăng nhập</CardTitle>
            <CardDescription>
              Bạn cần đăng nhập với tài khoản khách hàng để đăng ký làm Affiliate
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Vui lòng đăng nhập hoặc tạo tài khoản khách hàng trước khi đăng ký làm Affiliate.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2">
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={() => setLocation('/sf/main')}
              >
                Về trang chủ cửa hàng
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            
            <p className="text-xs text-gray-500 text-center">
              Sau khi đăng nhập, bạn có thể quay lại trang này để đăng ký
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Already active affiliate
  if (applicationStatus === 'active') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-xl">
          <CardHeader className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4 mx-auto">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Bạn đã là Affiliate!</CardTitle>
            <CardDescription>
              Tài khoản của bạn đã được kích hoạt với quyền Affiliate
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800">
                Bạn có thể truy cập Dashboard Affiliate để quản lý thu nhập và công cụ marketing.
              </p>
            </div>
            
            <Button 
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              onClick={() => setLocation('/aff/login')}
            >
              Đăng nhập Affiliate Portal
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Pending approval
  if (applicationStatus === 'pending') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-xl">
          <CardHeader className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4 mx-auto">
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
            <CardTitle className="text-2xl">Đang chờ phê duyệt</CardTitle>
            <CardDescription>
              Yêu cầu của bạn đang được xem xét bởi quản trị viên
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="bg-yellow-50 border-yellow-200">
              <Clock className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                Yêu cầu đăng ký Affiliate của bạn đã được gửi thành công. 
                Quản trị viên sẽ xem xét và phê duyệt trong thời gian sớm nhất.
              </AlertDescription>
            </Alert>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Thông tin tài khoản</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p><strong>Tên:</strong> {customerInfo.name}</p>
                <p><strong>Email:</strong> {customerInfo.email}</p>
                {customerInfo.phone && (
                  <p><strong>Số điện thoại:</strong> {customerInfo.phone}</p>
                )}
              </div>
            </div>
            
            <p className="text-xs text-gray-500 text-center">
              Bạn sẽ nhận được thông báo qua email khi yêu cầu được phê duyệt
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Ready to apply
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-50/10 opacity-30"></div>
      
      <div className="relative w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-4">
            <Users className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Đăng ký Affiliate
          </h1>
          <p className="text-gray-600">
            Trở thành đối tác và kiếm hoa hồng từ mỗi đơn hàng
          </p>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card className="text-center border-blue-200 bg-blue-50/50">
            <CardContent className="p-4">
              <div className="text-blue-600 mb-2">
                <TrendingUp className="h-6 w-6 mx-auto" />
              </div>
              <div className="text-sm font-medium text-blue-900">Thu nhập</div>
              <div className="text-xs text-blue-700">Hoa hồng hấp dẫn</div>
            </CardContent>
          </Card>
          
          <Card className="text-center border-purple-200 bg-purple-50/50">
            <CardContent className="p-4">
              <div className="text-purple-600 mb-2">
                <DollarSign className="h-6 w-6 mx-auto" />
              </div>
              <div className="text-sm font-medium text-purple-900">Công cụ</div>
              <div className="text-xs text-purple-700">Landing pages</div>
            </CardContent>
          </Card>
          
          <Card className="text-center border-green-200 bg-green-50/50">
            <CardContent className="p-4">
              <div className="text-green-600 mb-2">
                <Users className="h-6 w-6 mx-auto" />
              </div>
              <div className="text-sm font-medium text-green-900">Hỗ trợ</div>
              <div className="text-xs text-green-700">24/7 Support</div>
            </CardContent>
          </Card>
        </div>

        {/* Application Form */}
        <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl text-center flex items-center justify-center gap-2">
              <UserPlus className="h-5 w-5 text-blue-600" />
              Thông tin đăng ký
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Customer Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3">Thông tin của bạn</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span className="text-gray-500">Tên:</span>
                  <span className="font-medium text-gray-900">{customerInfo.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Email:</span>
                  <span className="font-medium text-gray-900">{customerInfo.email}</span>
                </div>
                {customerInfo.phone && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Số điện thoại:</span>
                    <span className="font-medium text-gray-900">{customerInfo.phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Benefits List */}
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900">Quyền lợi Affiliate:</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Nhận hoa hồng từ mỗi đơn hàng thành công</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Tạo landing page sản phẩm với link theo dõi</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Tạo đơn hàng trực tiếp cho khách hàng</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Dashboard theo dõi thu nhập và hiệu suất</span>
                </li>
              </ul>
            </div>

            {/* Apply Button */}
            <Button 
              onClick={handleApply}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-2.5"
              disabled={applyMutation.isPending}
            >
              {applyMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang gửi yêu cầu...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Gửi yêu cầu đăng ký
                </>
              )}
            </Button>

            {/* Terms */}
            <p className="text-xs text-gray-500 text-center">
              Bằng việc gửi yêu cầu, bạn đồng ý với điều khoản và chính sách của chương trình Affiliate
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
