import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  DollarSign, 
  Download, 
  Calendar, 
  Filter,
  Search,
  Loader2,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  FileDown,
  Eye,
  Package
} from 'lucide-react';
import AffiliateLayout from '@/layouts/AffiliateLayout';

interface Earning {
  id: string;
  orderId: string;
  orderTotal: number;
  orderTotalFormatted: string;
  commissionAmount: number;
  commissionAmountFormatted: string;
  commissionRate: number;
  processedAt: string;
  orderStatus: string;
  status: string;
}

interface EarningsSummary {
  totalEarned: number;
  totalEarnedFormatted: string;
  totalPaid: number;
  totalPaidFormatted: string;
  totalPending: number;
  totalPendingFormatted: string;
  commissionRate: number;
  totalReferrals: number;
}

interface EarningsResponse {
  success: boolean;
  data: {
    summary: EarningsSummary;
    earnings: Earning[];
    pagination: {
      total: number;
      limit: number;
      offset: number;
      hasMore: boolean;
    };
  };
}

export default function AffiliateEarnings() {
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Fetch earnings data
  const { 
    data: earningsData, 
    isLoading, 
    error, 
    refetch,
    isRefetching
  } = useQuery<EarningsResponse>({
    queryKey: ['/api/affiliate-portal/earnings', { 
      status: statusFilter,
      search: searchQuery,
      startDate,
      endDate,
      offset: (currentPage - 1) * itemsPerPage,
      limit: itemsPerPage
    }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (searchQuery) params.append('search', searchQuery);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      params.append('offset', ((currentPage - 1) * itemsPerPage).toString());
      params.append('limit', itemsPerPage.toString());
      
      const response = await apiRequest('GET', `/api/affiliate-portal/earnings?${params}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Không thể tải dữ liệu hoa hồng');
      }
      
      return response.json();
    },
    staleTime: 1 * 60 * 1000, // 1 minute
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

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">✅ Đã thanh toán</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">⏳ Chờ thanh toán</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">❌ Hủy bỏ</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getOrderStatusBadge = (status: string) => {
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

  const exportToCSV = async () => {
    try {
      // Get all earnings data for export (no pagination)
      const response = await apiRequest('GET', `/api/affiliate-portal/earnings?limit=1000`);
      
      if (!response.ok) {
        throw new Error('Không thể tải dữ liệu để xuất file');
      }
      
      const data: EarningsResponse = await response.json();
      const earnings = data.data.earnings;

      // Create CSV content
      const headers = [
        'Mã đơn hàng',
        'Ngày xử lý', 
        'Tổng đơn hàng',
        'Tỷ lệ hoa hồng (%)',
        'Số tiền hoa hồng',
        'Trạng thái đơn hàng',
        'Trạng thái thanh toán'
      ];

      const csvContent = [
        headers.join(','),
        ...earnings.map(earning => [
          earning.orderId,
          formatDate(earning.processedAt),
          earning.orderTotalFormatted.replace(/[,]/g, ''),
          earning.commissionRate,
          earning.commissionAmountFormatted.replace(/[,]/g, ''),
          earning.orderStatus,
          earning.status
        ].join(','))
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `hoa-hong-affiliate-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Xuất file thành công!",
        description: "File CSV đã được tải về máy tính của bạn",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Lỗi xuất file",
        description: "Không thể xuất file CSV. Vui lòng thử lại.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const resetFilters = () => {
    setStatusFilter('');
    setSearchQuery('');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };

  if (isLoading) {
    return (
      <AffiliateLayout>
        <div className="space-y-6">
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
            <div className="text-gray-600">Đang tải dữ liệu hoa hồng...</div>
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

  const { summary, earnings, pagination } = earningsData?.data || {};
  const totalPages = Math.ceil((pagination?.total || 0) / itemsPerPage);

  return (
    <AffiliateLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-green-600 to-blue-600 rounded-full">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              Lịch sử Hoa hồng
            </h1>
            <p className="text-gray-600 mt-1">
              Theo dõi chi tiết các khoản hoa hồng từ việc giới thiệu khách hàng
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={exportToCSV}
            >
              <Download className="h-4 w-4 mr-2" />
              Xuất CSV
            </Button>
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

        {/* Summary Cards */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card className="border-blue-200 bg-blue-50/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">Tổng hoa hồng</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {summary?.totalEarnedFormatted || '0₫'}
                  </p>
                  <div className="flex items-center mt-2 text-sm text-blue-600">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    {summary?.totalReferrals || 0} đơn hàng
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
                    {summary?.totalPendingFormatted || '0₫'}
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
                    {summary?.totalPaidFormatted || '0₫'}
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
                  <p className="text-sm font-medium text-purple-700">Tỷ lệ hoa hồng</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {summary?.commissionRate || 0}%
                  </p>
                  <div className="flex items-center mt-2 text-sm text-purple-600">
                    <Package className="h-4 w-4 mr-1" />
                    Mỗi đơn hàng
                  </div>
                </div>
                <div className="p-3 bg-purple-600 rounded-full">
                  <Package className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="h-5 w-5 text-blue-600" />
                Bộ lọc
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                Xóa bộ lọc
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-4 gap-4">
              {/* Status Filter */}
              <div className="space-y-2">
                <Label htmlFor="status">Trạng thái thanh toán</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tất cả" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tất cả trạng thái</SelectItem>
                    <SelectItem value="pending">Chờ thanh toán</SelectItem>
                    <SelectItem value="paid">Đã thanh toán</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Search */}
              <div className="space-y-2">
                <Label htmlFor="search">Tìm kiếm</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    type="text"
                    placeholder="Mã đơn hàng..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Date Range */}
              <div className="space-y-2">
                <Label htmlFor="startDate">Từ ngày</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">Đến ngày</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Earnings Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileDown className="h-5 w-5 text-green-600" />
                Chi tiết hoa hồng
              </div>
              <div className="text-sm text-gray-500 font-normal">
                Tổng cộng: {pagination?.total || 0} bản ghi
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-32">Mã đơn hàng</TableHead>
                    <TableHead className="w-40">Ngày xử lý</TableHead>
                    <TableHead className="text-right w-32">Tổng đơn hàng</TableHead>
                    <TableHead className="text-center w-24">Hoa hồng (%)</TableHead>
                    <TableHead className="text-right w-32">Số tiền hoa hồng</TableHead>
                    <TableHead className="text-center w-36">Trạng thái đơn</TableHead>
                    <TableHead className="text-center w-36">Trạng thái thanh toán</TableHead>
                    <TableHead className="w-20"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {earnings?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12">
                        <Package className="h-8 w-8 mx-auto mb-4 text-gray-400" />
                        <div className="text-gray-500">Chưa có dữ liệu hoa hồng</div>
                        <div className="text-sm text-gray-400 mt-1">
                          Hoa hồng sẽ xuất hiện khi có khách hàng mua hàng qua link của bạn
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    earnings?.map((earning) => (
                      <TableRow key={earning.id} className="hover:bg-gray-50">
                        <TableCell className="font-mono text-sm">
                          {earning.orderId}
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatDate(earning.processedAt)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {earning.orderTotalFormatted}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary">
                            {earning.commissionRate}%
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-bold text-green-600">
                          {earning.commissionAmountFormatted}
                        </TableCell>
                        <TableCell className="text-center">
                          {getOrderStatusBadge(earning.orderStatus)}
                        </TableCell>
                        <TableCell className="text-center">
                          {getStatusBadge(earning.status)}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              toast({
                                title: "Chi tiết đơn hàng",
                                description: `Mã đơn: ${earning.orderId}`,
                                duration: 2000,
                              });
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Trang {currentPage} / {totalPages} • 
                  Hiển thị {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, pagination?.total || 0)} / {pagination?.total || 0} bản ghi
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Trước
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Sau
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AffiliateLayout>
  );
}