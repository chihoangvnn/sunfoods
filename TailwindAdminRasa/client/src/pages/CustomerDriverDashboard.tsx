import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Truck, MapPin, DollarSign, Package, Clock, AlertCircle } from "lucide-react";
import { useLocation, useRoute } from "wouter";
import { useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function CustomerDriverDashboard() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/customer/driver-services/:customerId");
  const customerId = params?.customerId;

  const { data: user, isLoading, error } = useQuery({
    queryKey: ["customer-auth", customerId],
    queryFn: async () => {
      if (!customerId) throw new Error("Customer ID required");
      const res = await fetch(`/api/customer-auth-status?mockCustomerId=${customerId}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Authentication failed");
      return res.json();
    },
    enabled: !!customerId,
  });

  useEffect(() => {
    if (!customerId) {
      setLocation("/");
    }
    if (!isLoading && error) {
      console.error("Auth error:", error);
    }
    if (!isLoading && user) {
      const customerRoles = user.customerRoles || [];
      const hasDriverRole = customerRoles.includes('driver') || user.customerRole === 'driver';
      if (!hasDriverRole) {
        setLocation("/");
      }
    }
  }, [user, isLoading, error, customerId, setLocation]);

  const { data: deliveries } = useQuery({
    queryKey: ["driver-deliveries", customerId],
    queryFn: async () => {
      if (!customerId) throw new Error("Customer ID required");
      const res = await fetch(`/api/customers/${customerId}/driver-deliveries`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch deliveries");
      return res.json();
    },
    enabled: !!customerId && !!user && ((user.customerRoles || []).includes('driver') || user.customerRole === 'driver'),
  });

  if (!customerId) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Customer ID is required. Please access this page with a valid customer ID.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error?.message || "Authentication failed. Please login first."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const customerRoles = user.customerRoles || [];
  const hasDriverRole = customerRoles.includes('driver') || user.customerRole === 'driver';
  if (!hasDriverRole) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Access denied. This dashboard is only for Driver users.
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
              Driver Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Xin chào, {user.fullName || user.email}!
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-sm bg-blue-500/10 text-blue-600 border-blue-500/20">
              <Truck className="h-3 w-3 mr-1" />
              Driver
            </Badge>
            {user.membershipTier && (
              <Badge variant="outline" className="text-sm">
                Tier: {user.membershipTier}
              </Badge>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-blue-500/20 bg-gradient-to-br from-card to-blue-500/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Package className="h-4 w-4 text-blue-500" />
                Đơn hôm nay
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{deliveries?.todayOrders || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {deliveries?.pendingOrders || 0} đơn chờ giao
              </p>
            </CardContent>
          </Card>

          <Card className="border-emerald-500/20 bg-gradient-to-br from-card to-emerald-500/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-emerald-500" />
                Thu nhập hôm nay
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-500">
                {deliveries?.todayEarnings?.toLocaleString('vi-VN')}₫
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Tổng tháng: {deliveries?.monthlyEarnings?.toLocaleString('vi-VN')}₫
              </p>
            </CardContent>
          </Card>

          <Card className="border-amber-500/20 bg-gradient-to-br from-card to-amber-500/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4 text-amber-500" />
                Quãng đường
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{deliveries?.todayDistance || 0} km</div>
              <p className="text-xs text-muted-foreground mt-1">
                Trung bình: {deliveries?.avgDistancePerOrder || 0} km/đơn
              </p>
            </CardContent>
          </Card>

          <Card className="border-purple-500/20 bg-gradient-to-br from-card to-purple-500/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-purple-500" />
                Thời gian giao
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{deliveries?.avgDeliveryTime || 0} phút</div>
              <p className="text-xs text-muted-foreground mt-1">
                Thời gian trung bình mỗi đơn
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Đơn hàng đang giao</CardTitle>
              <CardDescription>
                Danh sách đơn hàng cần giao hôm nay
              </CardDescription>
            </CardHeader>
            <CardContent>
              {deliveries?.activeOrders?.length > 0 ? (
                <div className="space-y-3">
                  {deliveries.activeOrders.map((order: any) => (
                    <div
                      key={order.id}
                      className="p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">#{order.orderNumber}</span>
                        <Badge variant="outline" className="text-xs">
                          {order.status}
                        </Badge>
                      </div>
                      <div className="flex items-start gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-2">{order.shippingAddress}</span>
                      </div>
                      <div className="flex items-center justify-between mt-2 text-xs">
                        <span className="text-muted-foreground">{order.customerName}</span>
                        <span className="font-semibold text-blue-600">
                          {order.deliveryFee?.toLocaleString('vi-VN')}₫
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Truck className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p>Không có đơn hàng nào cần giao</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Thống kê hiệu suất</CardTitle>
              <CardDescription>
                Thành tích giao hàng của bạn
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Tỷ lệ giao thành công</span>
                  <span className="font-semibold text-emerald-600">
                    {deliveries?.successRate || 0}%
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600"
                    style={{ width: `${deliveries?.successRate || 0}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Đánh giá khách hàng</span>
                  <span className="font-semibold text-amber-600">
                    {deliveries?.avgRating || 0} / 5.0
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-amber-500"
                    style={{ width: `${((deliveries?.avgRating || 0) / 5) * 100}%` }}
                  />
                </div>
              </div>

              <div className="pt-4 border-t space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Tổng đơn đã giao</span>
                  <span className="font-semibold">{deliveries?.totalDelivered || 0}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Tổng quãng đường</span>
                  <span className="font-semibold">{deliveries?.totalDistance || 0} km</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Tổng thu nhập</span>
                  <span className="font-semibold text-emerald-600">
                    {deliveries?.totalEarnings?.toLocaleString('vi-VN')}₫
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
