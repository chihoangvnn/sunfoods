import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, DollarSign, Users, ShoppingBag, Crown, AlertCircle } from "lucide-react";
import { useLocation, useRoute } from "wouter";
import { useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import QuickOrderForm from "@/components/QuickOrderForm";

export default function CustomerAffiliateDashboard() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/customer/affiliate-dashboard/:customerId");
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
    if (!isLoading && user && user.customerRole !== "affiliate") {
      setLocation("/");
    }
  }, [user, isLoading, error, customerId, setLocation]);

  const { data: stats } = useQuery({
    queryKey: ["affiliate-stats", customerId],
    queryFn: async () => {
      if (!customerId) throw new Error("Customer ID required");
      const res = await fetch(`/api/customers/${customerId}/affiliate-stats`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
    enabled: !!customerId && !!user && user.customerRole === "affiliate",
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

  if (user.customerRole !== "affiliate") {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Access denied. This dashboard is only for Affiliate users.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Affiliate Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Xin chào, {user.fullName || user.email}!
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-sm">
              <Crown className="h-3 w-3 mr-1" />
              Affiliate
            </Badge>
            {user.membershipTier && (
              <Badge variant="outline" className="text-sm">
                Tier: {user.membershipTier}
              </Badge>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-primary" />
                Tổng doanh số
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.totalSales?.toLocaleString('vi-VN')}₫
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                +{stats?.salesGrowth || 0}% so với tháng trước
              </p>
            </CardContent>
          </Card>

          <Card className="border-emerald-500/20 bg-gradient-to-br from-card to-emerald-500/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
                Hoa hồng kiếm được
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-500">
                {stats?.totalCommission?.toLocaleString('vi-VN')}₫
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Tỷ lệ: {stats?.commissionRate || 10}%
              </p>
            </CardContent>
          </Card>

          <Card className="border-blue-500/20 bg-gradient-to-br from-card to-blue-500/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-500" />
                Khách hàng giới thiệu
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.referralCount || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                +{stats?.newReferrals || 0} khách mới tuần này
              </p>
            </CardContent>
          </Card>

          <Card className="border-amber-500/20 bg-gradient-to-br from-card to-amber-500/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-amber-500" />
                Đơn hàng thành công
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.successfulOrders || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Tỷ lệ chuyển đổi: {stats?.conversionRate || 0}%
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Order Form */}
        <QuickOrderForm affiliateId={customerId || ""} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Liên kết giới thiệu của bạn</CardTitle>
              <CardDescription>
                Chia sẻ link này để nhận hoa hồng
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-muted rounded-lg font-mono text-sm">
                {window.location.origin}/sf/store?ref={user.id}
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${window.location.origin}/sf/store?ref=${user.id}`
                  );
                }}
                className="mt-3 w-full py-2 px-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Copy Link
              </button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Hướng dẫn Affiliate</CardTitle>
              <CardDescription>
                Cách tối ưu hoa hồng của bạn
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-semibold text-primary">1</span>
                </div>
                <div>
                  <p className="text-sm font-medium">Chia sẻ link trên mạng xã hội</p>
                  <p className="text-xs text-muted-foreground">Facebook, Instagram, Zalo</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-semibold text-primary">2</span>
                </div>
                <div>
                  <p className="text-sm font-medium">Tạo nội dung review sản phẩm</p>
                  <p className="text-xs text-muted-foreground">Video, hình ảnh chất lượng cao</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-semibold text-primary">3</span>
                </div>
                <div>
                  <p className="text-sm font-medium">Hỗ trợ khách hàng tốt nhất</p>
                  <p className="text-xs text-muted-foreground">Tư vấn nhiệt tình, chuyên nghiệp</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
