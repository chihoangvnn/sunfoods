import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Car, Package, Users, TrendingUp, AlertCircle, Truck, MapPin } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function DeliveryDashboard() {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ["delivery-dashboard-stats"],
    queryFn: async () => {
      const res = await fetch('/api/delivery-management/dashboard', {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-blue-500/5 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
              Dashboard Giao hàng & Xe
            </h1>
            <p className="text-muted-foreground mt-1">
              Tổng quan quản lý phương tiện và giao hàng
            </p>
          </div>
          <Badge variant="secondary" className="text-sm bg-blue-500/10 text-blue-600 border-blue-500/20">
            <Truck className="h-3 w-3 mr-1" />
            Delivery Management
          </Badge>
        </div>

        {/* Main Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-blue-500/20 bg-gradient-to-br from-card to-blue-500/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Car className="h-4 w-4 text-blue-500" />
                Xe hoạt động
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.vehicles?.active || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                / {stats?.vehicles?.total || 0} tổng số xe
              </p>
            </CardContent>
          </Card>

          <Card className="border-emerald-500/20 bg-gradient-to-br from-card to-emerald-500/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
                Chuyến hôm nay
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-500">
                {stats?.trips?.completed || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Hoàn thành / {stats?.trips?.today || 0} tổng
              </p>
            </CardContent>
          </Card>

          <Card className="border-amber-500/20 bg-gradient-to-br from-card to-amber-500/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4 text-amber-500" />
                Đang giao
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.trips?.inProgress || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Chuyến đang thực hiện
              </p>
            </CardContent>
          </Card>

          <Card className="border-purple-500/20 bg-gradient-to-br from-card to-purple-500/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-500" />
                Tài xế
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.drivers?.activeToday || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Đang làm việc hôm nay
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Phân loại xe</CardTitle>
              <CardDescription>
                Thống kê theo loại phương tiện
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Ô tô (Car)</span>
                  <Badge variant="secondary">{stats?.vehicles?.byType?.car || 0}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Xe tải (Truck)</span>
                  <Badge variant="secondary">{stats?.vehicles?.byType?.truck || 0}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Xe Van</span>
                  <Badge variant="secondary">{stats?.vehicles?.byType?.van || 0}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Xe máy (Motorcycle)</span>
                  <Badge variant="secondary">{stats?.vehicles?.byType?.motorcycle || 0}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tình trạng xe</CardTitle>
              <CardDescription>
                Trạng thái hoạt động của phương tiện
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                    Active (Hoạt động)
                  </span>
                  <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600">
                    {stats?.vehicles?.active || 0}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-gray-400"></div>
                    Inactive (Ngừng hoạt động)
                  </span>
                  <Badge variant="secondary">{stats?.vehicles?.inactive || 0}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-amber-500"></div>
                    Maintenance (Bảo trì)
                  </span>
                  <Badge variant="secondary" className="bg-amber-500/10 text-amber-600">
                    {stats?.vehicles?.maintenance || 0}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Chuyến đi</CardTitle>
              <CardDescription>
                Thống kê chuyến đi hôm nay
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Đã lên lịch (Scheduled)</span>
                  <Badge variant="secondary">{stats?.trips?.scheduled || 0}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Đang thực hiện (In Progress)</span>
                  <Badge variant="secondary" className="bg-blue-500/10 text-blue-600">
                    {stats?.trips?.inProgress || 0}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Hoàn thành (Completed)</span>
                  <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600">
                    {stats?.trips?.completed || 0}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Đơn giao hàng</CardTitle>
              <CardDescription>
                Trạng thái đơn hàng cần giao
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Chờ giao (Processing)</span>
                  <Badge variant="secondary" className="bg-amber-500/10 text-amber-600">
                    {stats?.deliveryOrders?.pending || 0}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Đang giao (Shipped)</span>
                  <Badge variant="secondary" className="bg-blue-500/10 text-blue-600">
                    {stats?.deliveryOrders?.shipped || 0}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Car Groups Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Nhóm xe</CardTitle>
            <CardDescription>
              Tổng quan các nhóm phân loại xe
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="text-3xl font-bold">{stats?.carGroups?.total || 0}</div>
                <p className="text-sm text-muted-foreground">Tổng số nhóm</p>
              </div>
              <div className="flex-1">
                <div className="text-3xl font-bold text-emerald-500">{stats?.carGroups?.active || 0}</div>
                <p className="text-sm text-muted-foreground">Nhóm đang hoạt động</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
