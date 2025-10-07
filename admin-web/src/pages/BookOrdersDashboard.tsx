import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, DollarSign, Package, ShoppingCart, TrendingUp, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function BookOrdersDashboard() {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ["book-orders-stats"],
    queryFn: async () => {
      const res = await fetch('/api/book-orders/sync/stats', {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
  });

  const { data: orders } = useQuery({
    queryKey: ["book-orders-list"],
    queryFn: async () => {
      const res = await fetch('/api/book-orders?limit=10', {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch orders");
      const json = await res.json();
      // Handle both direct array and { data, meta } structure
      if (Array.isArray(json)) return json;
      if (json && Array.isArray(json.data)) return json.data;
      return [];
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error.message || "Failed to load dashboard data"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-amber-500/5 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-amber-400 bg-clip-text text-transparent">
              Book Orders Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Quản lý và thống kê đơn hàng sách
            </p>
          </div>
          <Badge variant="secondary" className="text-sm bg-amber-500/10 text-amber-600 border-amber-500/20">
            <BookOpen className="h-3 w-3 mr-1" />
            Book Management
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-blue-500/20 bg-gradient-to-br from-card to-blue-500/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Package className="h-4 w-4 text-blue-500" />
                Tổng đơn hàng
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.total || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Tất cả đơn hàng sách
              </p>
            </CardContent>
          </Card>

          <Card className="border-emerald-500/20 bg-gradient-to-br from-card to-emerald-500/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-emerald-500" />
                Hoa hồng tổng
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-500">
                {(stats?.totalCommissions || 0).toLocaleString('vi-VN')}₫
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Tổng hoa hồng seller
              </p>
            </CardContent>
          </Card>

          <Card className="border-amber-500/20 bg-gradient-to-br from-card to-amber-500/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-amber-500" />
                Đồng bộ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.bySyncStatus?.synced || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Đã đồng bộ / {stats?.total || 0} tổng
              </p>
            </CardContent>
          </Card>

          <Card className="border-purple-500/20 bg-gradient-to-br from-card to-purple-500/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-purple-500" />
                AbeBooks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.byBookSource?.abebooks || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Đơn từ AbeBooks
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Theo nguồn đơn hàng</CardTitle>
              <CardDescription>
                Phân bổ đơn hàng theo nguồn bán
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats?.bySource && Object.entries(stats.bySource).map(([source, count]: [string, any]) => (
                  <div key={source} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <span className="text-sm capitalize">{source}</span>
                    </div>
                    <Badge variant="outline">{count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Theo trạng thái sách</CardTitle>
              <CardDescription>
                Phân bổ theo tình trạng sách
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats?.byCondition && Object.entries(stats.byCondition).map(([condition, count]: [string, any]) => (
                  <div key={condition} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-sm capitalize">{condition.replace('_', ' ')}</span>
                    </div>
                    <Badge variant="outline">{count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Trạng thái đồng bộ</CardTitle>
              <CardDescription>
                Tình trạng đồng bộ hệ thống
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats?.bySyncStatus && Object.entries(stats.bySyncStatus).map(([status, count]: [string, any]) => (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        status === 'synced' ? 'bg-emerald-500' :
                        status === 'pending' ? 'bg-amber-500' :
                        status === 'failed' ? 'bg-red-500' :
                        'bg-gray-500'
                      }`} />
                      <span className="text-sm capitalize">{status}</span>
                    </div>
                    <Badge variant="outline">{count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Đơn hàng gần đây</CardTitle>
              <CardDescription>
                10 đơn hàng mới nhất
              </CardDescription>
            </CardHeader>
            <CardContent>
              {orders && orders.length > 0 ? (
                <div className="space-y-3">
                  {orders.slice(0, 5).map((order: any) => (
                    <div
                      key={order.id}
                      className="p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-sm">{order.customerNameBook}</span>
                        <Badge variant="outline" className="text-xs">
                          {order.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{order.items} items</span>
                        <span className="font-semibold text-blue-600">
                          {parseFloat(order.total).toLocaleString('vi-VN')}₫
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p>Chưa có đơn hàng nào</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
