import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  Settings, 
  User, 
  CreditCard, 
  Bell,
  Save,
  Loader2,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Edit3,
  Shield,
  Info,
  Award,
  Calendar,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import AffiliateLayout from '@/layouts/AffiliateLayout';

interface AffiliateProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  affiliateCode: string;
  commissionRate: number;
  affiliateStatus: string;
  joinDate: string;
  totalSpent?: number;
  membershipTier?: string;
  affiliateData?: any;
}

interface PaymentInfo {
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  paymentMethod?: string;
  paymentNotes?: string;
}

interface AffiliateSessionResponse {
  authenticated: boolean;
  affiliate: AffiliateProfile;
}

export default function AffiliateSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State for form data
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    avatar: ''
  });
  
  const [paymentData, setPaymentData] = useState<PaymentInfo>({
    bankName: '',
    accountNumber: '',
    accountName: '',
    paymentMethod: 'bank_transfer',
    paymentNotes: ''
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    orderNotifications: true,
    paymentNotifications: true,
    marketingEmails: false
  });

  const [editingProfile, setEditingProfile] = useState(false);
  const [editingPayment, setEditingPayment] = useState(false);

  // Fetch current affiliate session data
  const { 
    data: sessionData, 
    isLoading: sessionLoading, 
    error: sessionError,
    refetch: refetchSession
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
    onSuccess: (data) => {
      if (data.authenticated) {
        const affiliate = data.affiliate;
        setProfileData({
          name: affiliate.name || '',
          email: affiliate.email || '',
          phone: affiliate.phone || '',
          avatar: affiliate.avatar || ''
        });
        
        // Load payment info from affiliate data
        const paymentInfo = affiliate.affiliateData?.paymentInfo || {};
        setPaymentData({
          bankName: paymentInfo.bankName || '',
          accountNumber: paymentInfo.accountNumber || '',
          accountName: paymentInfo.accountName || '',
          paymentMethod: paymentInfo.paymentMethod || 'bank_transfer',
          paymentNotes: paymentInfo.paymentNotes || ''
        });

        // Load notification settings
        const notifications = affiliate.affiliateData?.notificationSettings || {};
        setNotificationSettings({
          emailNotifications: notifications.emailNotifications !== false,
          smsNotifications: notifications.smsNotifications === true,
          orderNotifications: notifications.orderNotifications !== false,
          paymentNotifications: notifications.paymentNotifications !== false,
          marketingEmails: notifications.marketingEmails === true
        });
      }
    }
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: typeof profileData) => {
      const response = await apiRequest('PUT', '/api/affiliate-portal/profile', {
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Không thể cập nhật thông tin');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Cập nhật thành công!",
        description: "Thông tin hồ sơ đã được cập nhật",
        duration: 3000,
      });
      setEditingProfile(false);
      queryClient.invalidateQueries(['/api/affiliate-auth/session']);
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi cập nhật",
        description: error.message,
        variant: "destructive",
        duration: 3000,
      });
    },
  });

  // Update payment info mutation
  const updatePaymentMutation = useMutation({
    mutationFn: async (data: PaymentInfo) => {
      const response = await apiRequest('PUT', '/api/affiliate-portal/payment-info', {
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Không thể cập nhật thông tin thanh toán');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Cập nhật thành công!",
        description: "Thông tin thanh toán đã được cập nhật",
        duration: 3000,
      });
      setEditingPayment(false);
      queryClient.invalidateQueries(['/api/affiliate-auth/session']);
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi cập nhật",
        description: error.message,
        variant: "destructive",
        duration: 3000,
      });
    },
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(profileData);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updatePaymentMutation.mutate(paymentData);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">🟢 Hoạt động</Badge>;
      case 'inactive':
        return <Badge className="bg-yellow-100 text-yellow-800">🟡 Tạm dừng</Badge>;
      case 'suspended':
        return <Badge className="bg-red-100 text-red-800">🔴 Đình chỉ</Badge>;
      default:
        return <Badge variant="secondary">Chưa xác định</Badge>;
    }
  };

  if (sessionLoading) {
    return (
      <AffiliateLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-8 bg-gray-200 rounded w-64 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
            </div>
          </div>
          
          <div className="grid gap-6">
            {[1,2,3].map(i => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="h-6 bg-gray-200 rounded w-48"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <div className="text-gray-600">Đang tải cài đặt tài khoản...</div>
          </div>
        </div>
      </AffiliateLayout>
    );
  }

  if (sessionError || !sessionData?.authenticated) {
    return (
      <AffiliateLayout>
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-600" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Lỗi tải dữ liệu
          </h3>
          <p className="text-gray-600 mb-6">
            Không thể tải thông tin tài khoản. Vui lòng thử lại.
          </p>
          <Button onClick={() => refetchSession()} className="bg-blue-600 hover:bg-blue-700">
            <RefreshCw className="h-4 w-4 mr-2" />
            Thử lại
          </Button>
        </div>
      </AffiliateLayout>
    );
  }

  const affiliate = sessionData.affiliate;

  return (
    <AffiliateLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-gray-600 to-blue-600 rounded-full">
                <Settings className="h-6 w-6 text-white" />
              </div>
              Cài đặt Tài khoản
            </h1>
            <p className="text-gray-600 mt-1">
              Quản lý thông tin cá nhân, thanh toán và cài đặt thông báo
            </p>
          </div>
        </div>

        {/* Account Status Overview */}
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Tổng quan tài khoản
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-white rounded-lg">
                <Award className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <div className="font-medium text-blue-900">Mã Affiliate</div>
                <div className="text-sm font-mono text-blue-700">{affiliate.affiliateCode}</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <div className="text-2xl mb-2">💰</div>
                <div className="font-medium text-blue-900">Tỷ lệ hoa hồng</div>
                <div className="text-sm text-blue-700">{affiliate.commissionRate}%</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <Calendar className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <div className="font-medium text-blue-900">Tham gia từ</div>
                <div className="text-sm text-blue-700">{formatDate(affiliate.joinDate)}</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <div className="mb-2">{getStatusBadge(affiliate.affiliateStatus)}</div>
                <div className="font-medium text-blue-900">Trạng thái</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-purple-600" />
                Thông tin cá nhân
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingProfile(!editingProfile)}
                disabled={updateProfileMutation.isPending}
              >
                <Edit3 className="h-4 w-4 mr-2" />
                {editingProfile ? 'Hủy' : 'Chỉnh sửa'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Họ và tên <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="name"
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                      className="pl-10"
                      disabled={!editingProfile}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                      className="pl-10"
                      disabled={!editingProfile}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Số điện thoại</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="phone"
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                      className="pl-10"
                      placeholder="0987654321"
                      disabled={!editingProfile}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="avatar">Avatar URL</Label>
                  <Input
                    id="avatar"
                    type="url"
                    value={profileData.avatar}
                    onChange={(e) => setProfileData(prev => ({ ...prev, avatar: e.target.value }))}
                    placeholder="https://example.com/avatar.jpg"
                    disabled={!editingProfile}
                  />
                </div>
              </div>

              {editingProfile && (
                <div className="flex gap-4">
                  <Button 
                    type="submit" 
                    disabled={updateProfileMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {updateProfileMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Đang cập nhật...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Lưu thay đổi
                      </>
                    )}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setEditingProfile(false)}
                  >
                    Hủy
                  </Button>
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Payment Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-green-600" />
                Thông tin thanh toán
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingPayment(!editingPayment)}
                disabled={updatePaymentMutation.isPending}
              >
                <Edit3 className="h-4 w-4 mr-2" />
                {editingPayment ? 'Hủy' : 'Chỉnh sửa'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <strong>Lưu ý:</strong> Thông tin thanh toán được sử dụng để chuyển khoản hoa hồng. 
                  Vui lòng cung cấp thông tin chính xác để đảm bảo nhận được thanh toán đúng hạn.
                </div>
              </div>
            </div>

            <form onSubmit={handlePaymentSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Phương thức thanh toán</Label>
                <Select 
                  value={paymentData.paymentMethod} 
                  onValueChange={(value) => setPaymentData(prev => ({ ...prev, paymentMethod: value }))}
                  disabled={!editingPayment}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn phương thức" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank_transfer">Chuyển khoản ngân hàng</SelectItem>
                    <SelectItem value="momo">Ví MoMo</SelectItem>
                    <SelectItem value="zalopay">Ví ZaloPay</SelectItem>
                    <SelectItem value="paypal">PayPal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="bankName">Tên ngân hàng</Label>
                  <Input
                    id="bankName"
                    type="text"
                    value={paymentData.bankName}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, bankName: e.target.value }))}
                    placeholder="VD: Vietcombank"
                    disabled={!editingPayment}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Số tài khoản</Label>
                  <Input
                    id="accountNumber"
                    type="text"
                    value={paymentData.accountNumber}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, accountNumber: e.target.value }))}
                    placeholder="1234567890"
                    disabled={!editingPayment}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountName">Tên chủ tài khoản</Label>
                <Input
                  id="accountName"
                  type="text"
                  value={paymentData.accountName}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, accountName: e.target.value }))}
                  placeholder="NGUYEN VAN A"
                  disabled={!editingPayment}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentNotes">Ghi chú thanh toán</Label>
                <Textarea
                  id="paymentNotes"
                  value={paymentData.paymentNotes}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, paymentNotes: e.target.value }))}
                  placeholder="Ghi chú thêm về thông tin thanh toán..."
                  disabled={!editingPayment}
                />
              </div>

              {editingPayment && (
                <div className="flex gap-4">
                  <Button 
                    type="submit" 
                    disabled={updatePaymentMutation.isPending}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {updatePaymentMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Đang cập nhật...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Lưu thông tin thanh toán
                      </>
                    )}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setEditingPayment(false)}
                  >
                    Hủy
                  </Button>
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Bell className="h-5 w-5 text-orange-600" />
              Cài đặt thông báo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base">Thông báo email</Label>
                  <p className="text-sm text-gray-600">Nhận thông báo qua email</p>
                </div>
                <Switch
                  checked={notificationSettings.emailNotifications}
                  onCheckedChange={(checked) => 
                    setNotificationSettings(prev => ({ ...prev, emailNotifications: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base">Thông báo SMS</Label>
                  <p className="text-sm text-gray-600">Nhận thông báo qua tin nhắn SMS</p>
                </div>
                <Switch
                  checked={notificationSettings.smsNotifications}
                  onCheckedChange={(checked) => 
                    setNotificationSettings(prev => ({ ...prev, smsNotifications: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base">Thông báo đơn hàng</Label>
                  <p className="text-sm text-gray-600">Thông báo khi có đơn hàng mới từ giới thiệu</p>
                </div>
                <Switch
                  checked={notificationSettings.orderNotifications}
                  onCheckedChange={(checked) => 
                    setNotificationSettings(prev => ({ ...prev, orderNotifications: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base">Thông báo thanh toán</Label>
                  <p className="text-sm text-gray-600">Thông báo khi hoa hồng được thanh toán</p>
                </div>
                <Switch
                  checked={notificationSettings.paymentNotifications}
                  onCheckedChange={(checked) => 
                    setNotificationSettings(prev => ({ ...prev, paymentNotifications: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base">Email marketing</Label>
                  <p className="text-sm text-gray-600">Nhận thông tin khuyến mãi và tin tức</p>
                </div>
                <Switch
                  checked={notificationSettings.marketingEmails}
                  onCheckedChange={(checked) => 
                    setNotificationSettings(prev => ({ ...prev, marketingEmails: checked }))
                  }
                />
              </div>
            </div>

            <div className="pt-4 border-t">
              <Button className="bg-orange-600 hover:bg-orange-700">
                <Save className="h-4 w-4 mr-2" />
                Lưu cài đặt thông báo
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Request Commission Rate Change */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="h-5 w-5 text-purple-600" />
              Yêu cầu thay đổi tỷ lệ hoa hồng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-purple-900 mb-2">
                      Tỷ lệ hoa hồng hiện tại: {affiliate.commissionRate}%
                    </div>
                    <div className="text-sm text-purple-700">
                      Nếu bạn muốn đề xuất thay đổi tỷ lệ hoa hồng, vui lòng gửi yêu cầu kèm lý do. 
                      Yêu cầu sẽ được xem xét dựa trên hiệu suất và thành tích của bạn.
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="requestedRate">Tỷ lệ hoa hồng mong muốn (%)</Label>
                  <Input
                    id="requestedRate"
                    type="number"
                    min="0"
                    max="50"
                    step="0.1"
                    placeholder="VD: 12.5"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="requestReason">Lý do yêu cầu</Label>
                  <Textarea
                    id="requestReason"
                    placeholder="Vui lòng mô tả lý do bạn muốn thay đổi tỷ lệ hoa hồng..."
                    rows={4}
                  />
                </div>
              </div>
              
              <Button variant="outline" className="w-full">
                <Award className="h-4 w-4 mr-2" />
                Gửi yêu cầu thay đổi tỷ lệ hoa hồng
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AffiliateLayout>
  );
}