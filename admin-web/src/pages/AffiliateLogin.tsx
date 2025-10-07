import React, { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  LogIn, 
  Users, 
  TrendingUp, 
  DollarSign,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle
} from 'lucide-react';

interface LoginRequest {
  affiliate_code: string;
}

interface LoginResponse {
  success: boolean;
  message: string;
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

export default function AffiliateLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    affiliate_code: ''
  });
  const [showCodePreview, setShowCodePreview] = useState(false);

  // Check if already authenticated
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await apiRequest('GET', '/api/affiliate-auth/session');
        const data = await response.json();
        
        if (data.authenticated) {
          // Already logged in, redirect to dashboard
          setLocation('/aff/dashboard');
        }
      } catch (error) {
        // Not authenticated, stay on login page
        console.log('Not authenticated, showing login form');
      }
    };

    checkSession();
  }, [setLocation]);

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (data: LoginRequest) => {
      const response = await apiRequest('POST', '/api/affiliate-auth/login', {
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Đăng nhập không thành công');
      }

      return response.json() as Promise<LoginResponse>;
    },
    onSuccess: (data) => {
      toast({
        title: "Đăng nhập thành công!",
        description: `Chào mừng ${data.affiliate.name} quay trở lại`,
        duration: 3000,
      });
      
      // Redirect to dashboard
      setLocation('/aff/dashboard');
    },
    onError: (error: Error) => {
      toast({
        title: "Đăng nhập thất bại",
        description: error.message || 'Vui lòng kiểm tra lại mã affiliate của bạn',
        variant: "destructive",
        duration: 5000,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.affiliate_code.trim()) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng nhập mã affiliate của bạn",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    loginMutation.mutate({
      affiliate_code: formData.affiliate_code.trim().toUpperCase()
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gray-50/10 opacity-30"></div>

      <div className="relative w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-4">
            <Users className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Affiliate Portal
          </h1>
          <p className="text-gray-600">
            Đăng nhập để xem thống kê hoa hồng và hiệu suất
          </p>
        </div>

        {/* Statistics Preview */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card className="text-center border-blue-200 bg-blue-50/50">
            <CardContent className="p-4">
              <div className="text-blue-600 mb-2">
                <TrendingUp className="h-6 w-6 mx-auto" />
              </div>
              <div className="text-sm font-medium text-blue-900">Hiệu suất</div>
              <div className="text-xs text-blue-700">Theo dõi real-time</div>
            </CardContent>
          </Card>
          
          <Card className="text-center border-purple-200 bg-purple-50/50">
            <CardContent className="p-4">
              <div className="text-purple-600 mb-2">
                <DollarSign className="h-6 w-6 mx-auto" />
              </div>
              <div className="text-sm font-medium text-purple-900">Hoa hồng</div>
              <div className="text-xs text-purple-700">Thu nhập chi tiết</div>
            </CardContent>
          </Card>
          
          <Card className="text-center border-green-200 bg-green-50/50">
            <CardContent className="p-4">
              <div className="text-green-600 mb-2">
                <Users className="h-6 w-6 mx-auto" />
              </div>
              <div className="text-sm font-medium text-green-900">Giới thiệu</div>
              <div className="text-xs text-green-700">Khách hàng mới</div>
            </CardContent>
          </Card>
        </div>

        {/* Login Form */}
        <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl text-center flex items-center justify-center gap-2">
              <LogIn className="h-5 w-5 text-blue-600" />
              Đăng nhập Affiliate
            </CardTitle>
            <p className="text-sm text-gray-600 text-center">
              Nhập mã affiliate để truy cập dashboard
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Affiliate Code Input */}
              <div className="space-y-2">
                <Label htmlFor="affiliate_code" className="text-sm font-medium">
                  Mã Affiliate <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="affiliate_code"
                    name="affiliate_code"
                    type={showCodePreview ? "text" : "password"}
                    value={formData.affiliate_code}
                    onChange={handleInputChange}
                    placeholder="Nhập mã affiliate của bạn"
                    className="pr-10 text-center font-mono text-lg uppercase tracking-wider"
                    maxLength={20}
                    required
                    disabled={loginMutation.isPending}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowCodePreview(!showCodePreview)}
                  >
                    {showCodePreview ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                
                {/* Input Helper */}
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <AlertCircle className="h-3 w-3" />
                  <span>Mã affiliate là duy nhất và được cấp bởi quản trị viên</span>
                </div>
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-2.5"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang đăng nhập...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Đăng nhập
                  </>
                )}
              </Button>
            </form>

            {/* Help Section */}
            <div className="border-t pt-4 space-y-3">
              <div className="text-center">
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  Cần hỗ trợ?
                </h3>
              </div>
              
              <div className="space-y-2 text-xs text-gray-600">
                <div className="flex items-start gap-2">
                  <div className="w-1 h-1 bg-gray-400 rounded-full mt-2"></div>
                  <div>
                    <strong>Quên mã affiliate:</strong> Liên hệ quản trị viên để lấy lại mã
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <div className="w-1 h-1 bg-gray-400 rounded-full mt-2"></div>
                  <div>
                    <strong>Tài khoản bị khóa:</strong> Kiểm tra trạng thái affiliate với admin
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <div className="w-1 h-1 bg-gray-400 rounded-full mt-2"></div>
                  <div>
                    <strong>Lỗi kỹ thuật:</strong> Thử tải lại trang hoặc liên hệ support
                  </div>
                </div>
              </div>
              
              <div className="text-center pt-2">
                <p className="text-xs text-gray-500">
                  Hệ thống Affiliate Marketing © 2025
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}