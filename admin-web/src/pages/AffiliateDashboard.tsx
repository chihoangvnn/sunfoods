import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { apiRequest } from '@/lib/queryClient';
import { 
  DollarSign,
  TrendingUp,
  Users,
  BarChart,
  Clock,
  CheckCircle,
  Award,
  ArrowUpRight,
  ArrowDownRight,
  Package,
  Target,
  Star,
  Calendar,
  RefreshCw,
  AlertCircle,
  Loader2,
  Eye,
  Link2
} from 'lucide-react';
import AffiliateLayout from '@/layouts/AffiliateLayout';

interface DashboardData {
  affiliate: {
    id: string;
    name: string;
    email: string;
    affiliateCode: string;
    commissionRate: number;
    joinDate: string;
    status: string;
  };
  metrics: {
    totalEarnings: number;
    totalEarningsFormatted: string;
    pendingEarnings: number;
    pendingEarningsFormatted: string;
    paidEarnings: number;
    paidEarningsFormatted: string;
    totalReferrals: number;
    totalRevenue: number;
    totalRevenueFormatted: string;
    conversionRate: number;
    revenueGrowth: number;
  };
  recentActivity: Array<{
    id: string;
    customerName: string;
    total: number;
    totalFormatted: string;
    status: string;
    createdAt: string;
    productName: string;
  }>;
  quickStats: {
    ordersThisMonth: number;
    revenueThisMonth: number;
    revenueThisMonthFormatted: string;
    averageOrderValue: number;
    averageOrderValueFormatted: string;
  };
}

export default function AffiliateDashboard() {
  // Fetch dashboard data
  const { 
    data: dashboardData, 
    isLoading, 
    error, 
    refetch,
    isRefetching
  } = useQuery<{success: boolean, data: DashboardData}>({
    queryKey: ['/api/affiliate-portal/dashboard'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/affiliate-portal/dashboard');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Không thể tải dữ liệu dashboard');
      }
      
      return response.json();
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateOnly = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">✅ Hoàn thành</Badge>;
      case 'shipped':
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-800">🚚 Đang giao</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">⏳ Chờ xử lý</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">❌ Hủy bỏ</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) {
      return <ArrowUpRight className="h-4 w-4 text-green-600" />;
    } else if (growth < 0) {
      return <ArrowDownRight className="h-4 w-4 text-red-600" />;
    } else {
      return <TrendingUp className="h-4 w-4 text-gray-500" />;
    }
  };

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return 'text-green-600';
    if (growth < 0) return 'text-red-600';
    return 'text-gray-500';
  };

  if (isLoading) {
    return (
      <AffiliateLayout>
        <div className="space-y-6">
          {/* Loading skeleton */}
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-8 bg-gray-200 rounded w-64 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
            </div>
            <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
          </div>
          
          <div className="grid gap-6 md:grid-cols-4">
            {[1,2,3,4].map(i => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="h-8 bg-gray-200 rounded w-24"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <div className="text-gray-600">Đang tải dữ liệu dashboard...</div>
          </div>
        </div>
      </AffiliateLayout>
    );
  }

  if (error) {
    return (
      <AffiliateLayout>
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-600" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Lỗi tải dữ liệu
          </h3>
          <p className="text-gray-600 mb-6">
            {(error as Error).message || 'Không thể kết nối tới server. Vui lòng thử lại.'}
          </p>
          <Button onClick={() => refetch()} className="bg-blue-600 hover:bg-blue-700">
            <RefreshCw className="h-4 w-4 mr-2" />
            Thử lại
          </Button>
        </div>
      </AffiliateLayout>
    );
  }

  if (!dashboardData?.success || !dashboardData?.data) {
    return (
      <AffiliateLayout>
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-yellow-600" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Không có dữ liệu
          </h3>
          <p className="text-gray-600">
            Chưa có thông tin dashboard để hiển thị.
          </p>
        </div>
      </AffiliateLayout>
    );
  }

  const { affiliate, metrics, recentActivity, quickStats } = dashboardData.data;

  return (
    <AffiliateLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full">
                <Award className="h-6 w-6 text-white" />
              </div>
              Chào mừng, {affiliate.name}!
            </h1>
            <p className="text-gray-600 mt-1">
              Mã affiliate: <span className="font-mono font-medium">{affiliate.affiliateCode}</span> • 
              Tham gia từ {formatDateOnly(affiliate.joinDate)} • 
              Hoa hồng {affiliate.commissionRate}%
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isRefetching}
            >
              {isRefetching ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Làm mới
            </Button>
          </div>
        </div>

        {/* Earnings Summary Cards */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card className="border-blue-200 bg-blue-50/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">Tổng hoa hồng</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {metrics.totalEarningsFormatted}
                  </p>
                  <div className="flex items-center mt-2 text-sm text-blue-600">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    Tất cả thời gian
                  </div>
                </div>
                <div className="p-3 bg-blue-600 rounded-full">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-orange-50/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-700">Chờ thanh toán</p>
                  <p className="text-2xl font-bold text-orange-900">
                    {metrics.pendingEarningsFormatted}
                  </p>
                  <div className="flex items-center mt-2 text-sm text-orange-600">
                    <Clock className="h-4 w-4 mr-1" />
                    Đang xử lý
                  </div>
                </div>
                <div className="p-3 bg-orange-600 rounded-full">
                  <Clock className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">Đã thanh toán</p>
                  <p className="text-2xl font-bold text-green-900">
                    {metrics.paidEarningsFormatted}
                  </p>
                  <div className="flex items-center mt-2 text-sm text-green-600">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Đã nhận
                  </div>
                </div>
                <div className="p-3 bg-green-600 rounded-full">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700">Giới thiệu</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {metrics.totalReferrals}
                  </p>
                  <div className="flex items-center mt-2 text-sm text-purple-600">
                    <Users className="h-4 w-4 mr-1" />
                    Khách hàng
                  </div>
                </div>
                <div className="p-3 bg-purple-600 rounded-full">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Metrics */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart className="h-5 w-5 text-blue-600" />
                Hiệu suất tháng này
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-900">
                    {quickStats.ordersThisMonth}
                  </div>
                  <div className="text-sm text-blue-700">Đơn hàng</div>
                  <div className="text-xs text-blue-600 mt-1">
                    <Package className="h-3 w-3 inline mr-1" />
                    Tháng này
                  </div>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-900">
                    {quickStats.revenueThisMonthFormatted}
                  </div>
                  <div className="text-sm text-purple-700">Doanh thu</div>
                  <div className="text-xs text-purple-600 mt-1">
                    <TrendingUp className="h-3 w-3 inline mr-1" />
                    Tháng này
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Tỷ lệ chuyển đổi:</span>
                  <span className="font-medium text-gray-900">
                    {metrics.conversionRate.toFixed(1)}%
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Giá trị đơn TB:</span>
                  <span className="font-medium text-gray-900">
                    {quickStats.averageOrderValueFormatted}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Tổng doanh thu:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">
                      {metrics.totalRevenueFormatted}
                    </span>
                    <div className={`flex items-center ${getGrowthColor(metrics.revenueGrowth)}`}>
                      {getGrowthIcon(metrics.revenueGrowth)}
                      <span className="text-xs font-medium">
                        {metrics.revenueGrowth > 0 ? '+' : ''}{metrics.revenueGrowth.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-5 w-5 text-green-600" />
                Thống kê nhanh
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-600 rounded-full">
                      <Star className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-green-900">Hạng affiliate</div>
                      <div className="text-sm text-green-700">Dựa trên hiệu suất</div>
                    </div>
                  </div>
                  <Badge className="bg-green-600 text-white">
                    {metrics.totalReferrals >= 50 ? 'Gold' : metrics.totalReferrals >= 20 ? 'Silver' : 'Bronze'}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-600 rounded-full">
                      <Calendar className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-blue-900">Ngày tham gia</div>
                      <div className="text-sm text-blue-700">Thành viên từ</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-blue-900">
                      {formatDateOnly(affiliate.joinDate)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-600 rounded-full">
                      <TrendingUp className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-purple-900">Tỷ lệ hoa hồng</div>
                      <div className="text-sm text-purple-700">Hiện tại</div>
                    </div>
                  </div>
                  <div className="font-bold text-purple-900 text-lg">
                    {affiliate.commissionRate}%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-600" />
              Hoạt động gần đây
            </CardTitle>
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              Xem tất cả
            </Button>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <div className="text-gray-500">Chưa có hoạt động nào gần đây</div>
                <div className="text-sm text-gray-400 mt-1">
                  Đơn hàng từ liên kết giới thiệu sẽ hiển thị ở đây
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Khách hàng</TableHead>
                      <TableHead>Sản phẩm</TableHead>
                      <TableHead>Giá trị</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Ngày đặt</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentActivity.slice(0, 5).map((activity) => (
                      <TableRow key={activity.id}>
                        <TableCell className="font-medium">
                          {activity.customerName}
                        </TableCell>
                        <TableCell>
                          <div className="max-w-48 truncate" title={activity.productName}>
                            {activity.productName}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-green-600">
                          {activity.totalFormatted}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(activity.status)}
                        </TableCell>
                        <TableCell className="text-gray-500">
                          {formatDate(activity.createdAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-dashed border-2 border-gray-300">
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Bắt đầu kiếm hoa hồng ngay
            </h3>
            <p className="text-gray-600 mb-6">
              Tạo liên kết giới thiệu và chia sẻ sản phẩm để bắt đầu kiếm tiền
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Link2 className="h-4 w-4 mr-2" />
                Tạo liên kết affiliate
              </Button>
              <Button variant="outline">
                <BarChart className="h-4 w-4 mr-2" />
                Xem thống kê chi tiết
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AffiliateLayout>
  );
}