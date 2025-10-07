import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
import {
  Badge,
} from '@/components/ui/badge';
import {
  Button,
} from '@/components/ui/button';
import {
  Input,
} from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  Search, 
  Handshake, 
  HandCoins, 
  TrendingUp, 
  Users, 
  Clock,
  CheckCircle,
  Filter,
  Eye,
  Edit,
  Ban,
  Award,
  DollarSign,
  Shield
} from 'lucide-react';
import { SecureAddressManagement } from '@/components/SecureAddressManagement';
import { useLocation } from 'wouter';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  isAffiliate?: boolean;
  affiliateCode?: string;
  affiliateStatus?: 'active' | 'inactive' | 'suspended';
  commissionRate?: number;
  totalCommission?: number;
  pendingCommission?: number;
  paidCommission?: number;
  affiliateData?: {
    activatedAt?: string;
    paymentMethod?: string;
    paymentSchedule?: string;
    totalReferrals?: number;
    conversionRate?: number;
    vietnameseOrderTypes?: {
      daLen: { count: number; commission: number; }; // Đã lên
      chiaSeLink: { count: number; commission: number; }; // Chia sẻ link  
      datChoKhach: { count: number; commission: number; }; // Đặt cho khách
    };
  };
}

const statusConfig = {
  active: { label: '🟢 Hoạt động', variant: 'default' as const },
  inactive: { label: '🟡 Tạm dừng', variant: 'secondary' as const },
  suspended: { label: '🔴 Đình chỉ', variant: 'destructive' as const },
};

const getStatusBadge = (status?: string) => {
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive;
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

// Format price utility function
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price);
};

export default function AffiliateManagement() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State for search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('totalCommission');
  
  // State for secure address management
  const [selectedAffiliate, setSelectedAffiliate] = useState<Customer | null>(null);
  const [showSecureAddresses, setShowSecureAddresses] = useState(false);

  // Fetch all customers (would be filtered server-side in production)
  const { data: customers = [], isLoading, error } = useQuery<Customer[]>({
    queryKey: ['/api/customers'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/customers');
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    cacheTime: 10 * 60 * 1000, // 10 minutes cache
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Filter to show only affiliates
  const affiliates = customers.filter(customer => customer.isAffiliate);

  // Apply search and status filters
  const filteredAffiliates = affiliates.filter(affiliate => {
    const matchesSearch = affiliate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         affiliate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (affiliate.affiliateCode || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || affiliate.affiliateStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Sort affiliates with enhanced sorting options
  const sortedAffiliates = [...filteredAffiliates].sort((a, b) => {
    switch (sortBy) {
      case 'totalCommission':
        return (b.affiliateData?.totalCommissionEarned || 0) - (a.affiliateData?.totalCommissionEarned || 0);
      case 'pendingCommission':
        return (b.affiliateData?.totalCommissionPending || 0) - (a.affiliateData?.totalCommissionPending || 0);
      case 'paidCommission':
        return (b.affiliateData?.totalCommissionPaid || 0) - (a.affiliateData?.totalCommissionPaid || 0);
      case 'revenue':
        return (b.affiliateData?.totalReferralRevenue || 0) - (a.affiliateData?.totalReferralRevenue || 0);
      case 'conversionRate':
        return (b.affiliateData?.conversionRate || 0) - (a.affiliateData?.conversionRate || 0);
      case 'referrals':
        return (b.affiliateData?.totalReferrals || 0) - (a.affiliateData?.totalReferrals || 0);
      case 'commissionRate':
        return (parseFloat(b.commissionRate || '0') || 0) - (parseFloat(a.commissionRate || '0') || 0);
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  // Calculate summary statistics with enhanced commission tracking
  const stats = {
    totalAffiliates: affiliates.length,
    activeAffiliates: affiliates.filter(a => a.affiliateStatus === 'active').length,
    totalCommissions: affiliates.reduce((sum, a) => sum + (a.affiliateData?.totalCommissionEarned || 0), 0),
    pendingCommissions: affiliates.reduce((sum, a) => sum + (a.affiliateData?.totalCommissionPending || 0), 0),
    paidCommissions: affiliates.reduce((sum, a) => sum + (a.affiliateData?.totalCommissionPaid || 0), 0),
    totalReferrals: affiliates.reduce((sum, a) => sum + (a.affiliateData?.totalReferrals || 0), 0),
    totalRevenue: affiliates.reduce((sum, a) => sum + (a.affiliateData?.totalReferralRevenue || 0), 0),
    averageCommissionRate: affiliates.length > 0 
      ? affiliates.reduce((sum, a) => sum + (parseFloat(a.commissionRate || '0') / 100), 0) / affiliates.length 
      : 0,
    averageConversionRate: affiliates.length > 0 
      ? affiliates.reduce((sum, a) => sum + (a.affiliateData?.conversionRate || 0), 0) / affiliates.length 
      : 0,
    // Vietnamese order type statistics
    vietnameseOrderStats: {
      daLen: affiliates.reduce((acc, a) => {
        const data = a.affiliateData?.vietnameseOrderTypes?.daLen;
        return {
          count: acc.count + (data?.count || 0),
          commission: acc.commission + (data?.commission || 0)
        };
      }, { count: 0, commission: 0 }),
      chiaSeLink: affiliates.reduce((acc, a) => {
        const data = a.affiliateData?.vietnameseOrderTypes?.chiaSeLink;
        return {
          count: acc.count + (data?.count || 0),
          commission: acc.commission + (data?.commission || 0)
        };
      }, { count: 0, commission: 0 }),
      datChoKhach: affiliates.reduce((acc, a) => {
        const data = a.affiliateData?.vietnameseOrderTypes?.datChoKhach;
        return {
          count: acc.count + (data?.count || 0),
          commission: acc.commission + (data?.commission || 0)
        };
      }, { count: 0, commission: 0 }),
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const formatPercentage = (value?: number) => {
    return `${((value || 0) * 100).toFixed(1)}%`;
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="text-center py-8">
          <div className="text-muted-foreground">Đang tải dữ liệu affiliate...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="text-center py-8">
          <div className="text-red-500 mb-4">Lỗi khi tải dữ liệu affiliate</div>
          <div className="text-muted-foreground mb-4">
            Không thể kết nối tới server. Vui lòng thử lại sau.
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6" data-testid="page-affiliate-management">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Handshake className="h-6 w-6 text-green-600" />
          Quản lý Affiliate Marketing
        </h1>
        <p className="text-muted-foreground mt-1">
          Theo dõi và quản lý hệ thống affiliate của doanh nghiệp
        </p>
      </div>

      {/* Enhanced Summary Stats */}
      <div className="grid gap-4 md:grid-cols-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-muted-foreground">Tổng Affiliate</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">{stats.totalAffiliates}</div>
            <div className="text-xs text-green-600">
              {stats.activeAffiliates} hoạt động
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <HandCoins className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-muted-foreground">Tổng hoa hồng</span>
            </div>
            <div className="text-2xl font-bold text-purple-600">
              {formatPrice(stats.totalCommissions)}
            </div>
            <div className="text-xs text-muted-foreground">Tất cả thời gian</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium text-muted-foreground">Chờ thanh toán</span>
            </div>
            <div className="text-2xl font-bold text-orange-600">
              {formatPrice(stats.pendingCommissions)}
            </div>
            <div className="text-xs text-muted-foreground">Cần xử lý</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
              <span className="text-sm font-medium text-muted-foreground">Đã thanh toán</span>
            </div>
            <div className="text-2xl font-bold text-emerald-600">
              {formatPrice(stats.paidCommissions)}
            </div>
            <div className="text-xs text-muted-foreground">Đã trả</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-indigo-600" />
              <span className="text-sm font-medium text-muted-foreground">Tổng giới thiệu</span>
            </div>
            <div className="text-2xl font-bold text-indigo-600">{stats.totalReferrals}</div>
            <div className="text-xs text-muted-foreground">
              {stats.averageConversionRate > 0 ? `${(stats.averageConversionRate * 100).toFixed(1)}% chuyển đổi` : 'TB chuyển đổi'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-pink-600" />
              <span className="text-sm font-medium text-muted-foreground">Doanh thu tạo ra</span>
            </div>
            <div className="text-2xl font-bold text-pink-600">
              {formatPrice(stats.totalRevenue)}
            </div>
            <div className="text-xs text-muted-foreground">
              TB {(stats.averageCommissionRate * 100).toFixed(1)}% hoa hồng
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vietnamese Order Types Tracking */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            Theo dõi đơn hàng Việt Nam
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Phân loại đơn hàng theo phương thức bán của affiliate
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {/* Đã lên */}
            <Card className="border-blue-200 bg-blue-50/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                  <span className="font-semibold text-blue-900">Đã lên</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-blue-700">Số đơn:</span>
                    <span className="font-bold text-blue-900">
                      {stats.vietnameseOrderStats.daLen.count}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-blue-700">Hoa hồng:</span>
                    <span className="font-bold text-blue-900 text-sm">
                      {formatPrice(stats.vietnameseOrderStats.daLen.commission)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-blue-700">TB/đơn:</span>
                    <span className="font-bold text-blue-900 text-xs">
                      {stats.vietnameseOrderStats.daLen.count > 0 
                        ? formatPrice(stats.vietnameseOrderStats.daLen.commission / stats.vietnameseOrderStats.daLen.count)
                        : formatPrice(0)
                      }
                    </span>
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-blue-200">
                  <div className="text-xs text-blue-600">
                    📱 Affiliate tự post lên trang cá nhân
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Chia sẻ link */}
            <Card className="border-purple-200 bg-purple-50/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <HandCoins className="h-5 w-5 text-purple-600" />
                  <span className="font-semibold text-purple-900">Chia sẻ link</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-purple-700">Số đơn:</span>
                    <span className="font-bold text-purple-900">
                      {stats.vietnameseOrderStats.chiaSeLink.count}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-purple-700">Hoa hồng:</span>
                    <span className="font-bold text-purple-900 text-sm">
                      {formatPrice(stats.vietnameseOrderStats.chiaSeLink.commission)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-purple-700">TB/đơn:</span>
                    <span className="font-bold text-purple-900 text-xs">
                      {stats.vietnameseOrderStats.chiaSeLink.count > 0 
                        ? formatPrice(stats.vietnameseOrderStats.chiaSeLink.commission / stats.vietnameseOrderStats.chiaSeLink.count)
                        : formatPrice(0)
                      }
                    </span>
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-purple-200">
                  <div className="text-xs text-purple-600">
                    🔗 Share link qua mạng xã hội
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Đặt cho khách */}
            <Card className="border-orange-200 bg-orange-50/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="h-5 w-5 text-orange-600" />
                  <span className="font-semibold text-orange-900">Đặt cho khách</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-orange-700">Số đơn:</span>
                    <span className="font-bold text-orange-900">
                      {stats.vietnameseOrderStats.datChoKhach.count}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-orange-700">Hoa hồng:</span>
                    <span className="font-bold text-orange-900 text-sm">
                      {formatPrice(stats.vietnameseOrderStats.datChoKhach.commission)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-orange-700">TB/đơn:</span>
                    <span className="font-bold text-orange-900 text-xs">
                      {stats.vietnameseOrderStats.datChoKhach.count > 0 
                        ? formatPrice(stats.vietnameseOrderStats.datChoKhach.commission / stats.vietnameseOrderStats.datChoKhach.count)
                        : formatPrice(0)
                      }
                    </span>
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-orange-200">
                  <div className="text-xs text-orange-600">
                    👥 Affiliate đặt thay cho khách hàng
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <strong>Tổng hoa hồng từ 3 loại đơn:</strong>
              <span className="font-bold text-foreground">
                {formatPrice(
                  affiliates.reduce((sum, a) => 
                    sum + 
                    (a.affiliateData?.vietnameseOrderTypes?.daLen.commission || 0) +
                    (a.affiliateData?.vietnameseOrderTypes?.chiaSeLink.commission || 0) +
                    (a.affiliateData?.vietnameseOrderTypes?.datChoKhach.commission || 0),
                    0
                  )
                )}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tìm kiếm và lọc</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm theo tên, email, mã affiliate..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="active">Hoạt động</SelectItem>
                <SelectItem value="inactive">Tạm dừng</SelectItem>
                <SelectItem value="suspended">Đình chỉ</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <TrendingUp className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Sắp xếp" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="totalCommission">💰 Hoa hồng tổng</SelectItem>
                <SelectItem value="pendingCommission">⏰ Chờ thanh toán</SelectItem>
                <SelectItem value="paidCommission">✅ Đã thanh toán</SelectItem>
                <SelectItem value="revenue">💵 Doanh thu tạo ra</SelectItem>
                <SelectItem value="conversionRate">📈 Tỷ lệ chuyển đổi</SelectItem>
                <SelectItem value="referrals">👥 Số giới thiệu</SelectItem>
                <SelectItem value="commissionRate">📊 Tỷ lệ hoa hồng</SelectItem>
                <SelectItem value="name">🔤 Tên A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Affiliates Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Danh sách Affiliate ({sortedAffiliates.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sortedAffiliates.length === 0 ? (
            <div className="text-center py-8">
              <Award className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <div className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Không tìm thấy affiliate nào phù hợp với tiêu chí tìm kiếm'
                  : 'Chưa có affiliate nào trong hệ thống'
                }
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Affiliate</TableHead>
                    <TableHead>Mã</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Tỷ lệ HH</TableHead>
                    <TableHead>Tổng HH</TableHead>
                    <TableHead>Chờ TT</TableHead>
                    <TableHead>Giới thiệu</TableHead>
                    <TableHead>CV Rate</TableHead>
                    <TableHead>Kích hoạt</TableHead>
                    <TableHead>Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedAffiliates.map((affiliate) => (
                    <TableRow key={affiliate.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{affiliate.name}</div>
                          <div className="text-sm text-muted-foreground">{affiliate.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-xs">
                          {affiliate.affiliateCode || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(affiliate.affiliateStatus)}
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-green-600">
                          {affiliate.commissionRate || 0}%
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          {formatPrice(affiliate.affiliateData?.totalCommissionEarned || 0)}
                        </span>
                        <div className="text-xs text-green-600">
                          đã trả: {formatPrice(affiliate.affiliateData?.totalCommissionPaid || 0)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-orange-600">
                          {formatPrice(affiliate.affiliateData?.totalCommissionPending || 0)}
                        </span>
                        {affiliate.affiliateData?.totalReferralRevenue && (
                          <div className="text-xs text-muted-foreground">
                            từ {formatPrice(affiliate.affiliateData.totalReferralRevenue)} doanh thu
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          {affiliate.affiliateData?.totalReferrals || 0}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          {formatPercentage(affiliate.affiliateData?.conversionRate)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(affiliate.affiliateData?.activatedAt)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setLocation(`/customers/${affiliate.id}`)}
                            title="Xem chi tiết"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedAffiliate(affiliate);
                              setShowSecureAddresses(true);
                            }}
                            title="Quản lý địa chỉ bảo mật"
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Shield className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Chỉnh sửa"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {affiliate.affiliateStatus === 'active' ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Tạm dừng"
                            >
                              <Ban className="h-4 w-4 text-orange-500" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Kích hoạt"
                            >
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 🔐 SECURE ADDRESS MANAGEMENT MODAL */}
      {showSecureAddresses && selectedAffiliate && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center gap-3">
                <Shield className="h-6 w-6 text-blue-600" />
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Quản Lý Địa Chỉ Bảo Mật</h2>
                  <p className="text-sm text-gray-600">
                    Affiliate: {selectedAffiliate.name} ({selectedAffiliate.affiliateCode})
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowSecureAddresses(false);
                  setSelectedAffiliate(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </Button>
            </div>
            <div className="flex-1 overflow-auto p-6">
              <SecureAddressManagement
                affiliateId={selectedAffiliate.id}
                affiliateName={selectedAffiliate.name}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}