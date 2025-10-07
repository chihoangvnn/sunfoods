import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Star, 
  Package, 
  Activity,
  Award,
  Timer,
  CheckCircle
} from "lucide-react";
import { 
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

export default function SellerPerformanceAnalytics() {
  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['seller-performance-dashboard'],
    queryFn: async () => {
      const res = await fetch('/api/seller-performance/dashboard');
      if (!res.ok) throw new Error('Failed to fetch dashboard');
      return res.json();
    },
    refetchInterval: 60000 // Refresh every minute for real-time monitoring
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const stats = dashboard?.data;

  return (
    <div className="space-y-6 p-6" data-testid="page-seller-analytics">
      <div>
        <h1 className="text-3xl font-bold">📊 Hiệu Suất Nhà Bán</h1>
        <p className="text-muted-foreground mt-1">
          Theo dõi real-time: Doanh thu, bán hàng, đánh giá và hiệu quả
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Cập nhật lúc: {new Date(dashboard?.timestamp).toLocaleString('vi-VN')}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng Nhà Bán</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.overview?.totalSellers || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.overview?.activeSellers || 0} đang hoạt động
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng Doanh Thu</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(stats?.overview?.totalRevenue || 0).toLocaleString('vi-VN')} ₫
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.overview?.totalOrders || 0} đơn hàng
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đánh Giá Trung Bình</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.overview?.averageRating || 0}/5.0
            </div>
            <p className="text-xs text-muted-foreground">
              Chất lượng dịch vụ
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng Hàng Tồn</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.overview?.totalInventory || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Cuốn sách
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Xu Hướng Doanh Thu (7 ngày)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={stats?.salesTrends || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => new Date(date).toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' })}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => [`${value.toLocaleString('vi-VN')} ₫`, 'Doanh thu']}
                  labelFormatter={(date) => new Date(date).toLocaleDateString('vi-VN')}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#8884d8" 
                  fill="#8884d8" 
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Phân Bố Theo Hạng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats?.tierBreakdown || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="tier" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="sellerCount" fill="#8884d8" name="Số nhà bán" />
                <Bar yAxisId="right" dataKey="revenue" fill="#82ca9d" name="Doanh thu (₫)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Top 10 Nhà Bán Xuất Sắc
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats?.topPerformers?.map((seller: any, index: number) => (
              <div key={seller.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{seller.displayName}</div>
                    <div className="text-sm text-muted-foreground">{seller.businessName}</div>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-right">
                  <div>
                    <div className="text-sm font-medium">{seller.totalSales.toLocaleString('vi-VN')} ₫</div>
                    <div className="text-xs text-muted-foreground">{seller.totalOrders} đơn</div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-medium">{seller.avgRating.toFixed(1)}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">{seller.totalReviews} đánh giá</div>
                  </div>
                  <div className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium">
                    {seller.tier}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Chỉ Số Hiệu Quả
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Timer className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Thời Gian Phản Hồi</span>
              </div>
              <div className="text-2xl font-bold">
                {stats?.efficiencyMetrics?.avgResponseTime?.toFixed(1) || 0}h
              </div>
              <div className="text-xs text-muted-foreground">Trung bình</div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Độ Chính Xác</span>
              </div>
              <div className="text-2xl font-bold">
                {stats?.efficiencyMetrics?.avgFulfillmentAccuracy?.toFixed(1) || 0}%
              </div>
              <div className="text-xs text-muted-foreground">Giao đúng hẹn</div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Tốc Độ Giao Hàng</span>
              </div>
              <div className="text-2xl font-bold">
                {stats?.efficiencyMetrics?.avgDeliverySpeed?.toFixed(1) || 0}/5.0
              </div>
              <div className="text-xs text-muted-foreground">Đánh giá</div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Dịch Vụ Khách Hàng</span>
              </div>
              <div className="text-2xl font-bold">
                {stats?.efficiencyMetrics?.avgCustomerService?.toFixed(1) || 0}/5.0
              </div>
              <div className="text-xs text-muted-foreground">Chất lượng</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
