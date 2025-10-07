import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertCircle, Crown, Package, ShoppingBag, TrendingUp, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useLocation, useRoute } from "wouter";
import { useEffect, useState } from "react";

interface VipDashboardData {
  customer: {
    id: string;
    name: string;
    email: string;
    membershipTier: string;
    pointsBalance: number;
    roles: string[];
  };
  stats: {
    totalOrders: number;
    totalSpent: number;
    totalSpentFormatted: string;
    vipProductsAvailable: number;
    vipCategoriesAvailable: number;
  };
  recentOrders: Array<{
    id: string;
    total: number;
    totalFormatted: string;
    status: string;
    createdAt: string;
    paymentMethod: string;
  }>;
}

interface VipProduct {
  id: string;
  name: string;
  description: string | null;
  price: string;
  priceFormatted: string;
  image: string | null;
  categoryName: string;
  stock: number;
  isVipOnly: boolean;
}

export default function CustomerVIPDashboard() {
  const [, setLocation] = useLocation();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const limit = 12;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(0);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: dashboardData, isLoading: dashboardLoading, error: dashboardError } = useQuery<VipDashboardData>({
    queryKey: ["vip-dashboard"],
    queryFn: async () => {
      const res = await fetch(`/api/vip-portal/dashboard`, {
        credentials: "include",
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to fetch VIP dashboard");
      }
      return res.json();
    },
  });

  const { data: productsData, isLoading: productsLoading, error: productsError } = useQuery<{
    products: VipProduct[];
    pagination: {
      limit: number;
      offset: number;
      total: number;
      hasMore: boolean;
    };
  }>({
    queryKey: ["vip-products", debouncedSearch, currentPage],
    queryFn: async () => {
      const offset = currentPage * limit;
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
      });
      if (debouncedSearch) {
        params.append("search", debouncedSearch);
      }
      const res = await fetch(`/api/vip-portal/products?${params}`, {
        credentials: "include",
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to fetch VIP products");
      }
      return res.json();
    },
  });

  useEffect(() => {
    if (dashboardError) {
      console.error("VIP Dashboard error:", dashboardError);
    }
  }, [dashboardError]);

  if (dashboardLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (dashboardError) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {dashboardError.message || "Failed to load VIP dashboard"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!dashboardData) return null;

  const { customer, stats, recentOrders } = dashboardData;
  const totalPages = productsData ? Math.ceil(productsData.pagination.total / limit) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-background to-yellow-100/20 dark:from-background dark:via-background dark:to-yellow-900/10 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => setLocation(`/`)}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>
            <div className="flex items-center gap-3">
              <Crown className="h-8 w-8 text-yellow-500" />
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-400 bg-clip-text text-transparent">
                  VIP Dashboard
                </h1>
                <p className="text-muted-foreground">Sản phẩm độc quyền dành cho VIP</p>
              </div>
            </div>
          </div>
          <Badge variant="outline" className="capitalize bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-700">
            <Crown className="h-3 w-3 mr-1" />
            {customer.membershipTier}
          </Badge>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gradient-to-br from-yellow-50 to-white dark:from-yellow-900/20 dark:to-background border-yellow-200 dark:border-yellow-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng chi tiêu</CardTitle>
              <TrendingUp className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">{stats.totalSpentFormatted}</div>
              <p className="text-xs text-muted-foreground mt-1">{stats.totalOrders} đơn hàng</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-white dark:from-green-900/20 dark:to-background border-green-200 dark:border-green-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Điểm tích lũy</CardTitle>
              <Package className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700 dark:text-green-400">{customer.pointsBalance.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">Points</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/20 dark:to-background border-blue-200 dark:border-blue-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sản phẩm VIP</CardTitle>
              <ShoppingBag className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">{stats.vipProductsAvailable}</div>
              <p className="text-xs text-muted-foreground mt-1">Sản phẩm có sẵn</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/20 dark:to-background border-purple-200 dark:border-purple-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Danh mục VIP</CardTitle>
              <Package className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-700 dark:text-purple-400">{stats.vipCategoriesAvailable}</div>
              <p className="text-xs text-muted-foreground mt-1">Danh mục độc quyền</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders */}
        {recentOrders.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Đơn hàng gần đây
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                    <div className="flex-1">
                      <p className="font-medium">{order.totalFormatted}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString("vi-VN")} • {order.paymentMethod}
                      </p>
                    </div>
                    <Badge variant={order.status === "delivered" ? "default" : "secondary"} className="capitalize">
                      {order.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* VIP Products Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-500" />
                Sản phẩm VIP độc quyền
              </CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Tìm kiếm sản phẩm..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {productsError ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {productsError.message || "Không thể tải sản phẩm VIP. Vui lòng thử lại sau."}
                </AlertDescription>
              </Alert>
            ) : productsLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : productsData && productsData.products.length > 0 ? (
              <>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {productsData.products.map((product) => (
                    <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="aspect-square bg-muted relative">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-16 w-16 text-muted-foreground" />
                          </div>
                        )}
                        <Badge className="absolute top-2 right-2 bg-yellow-500 hover:bg-yellow-600">
                          <Crown className="h-3 w-3 mr-1" />
                          VIP
                        </Badge>
                      </div>
                      <CardContent className="pt-4 space-y-2">
                        <h3 className="font-semibold line-clamp-2 min-h-[3rem]">{product.name}</h3>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">{product.categoryName}</span>
                          <Badge variant="outline" className="text-xs">
                            {product.stock > 0 ? `Còn ${product.stock}` : "Hết hàng"}
                          </Badge>
                        </div>
                        <p className="text-lg font-bold text-yellow-700 dark:text-yellow-400">{product.priceFormatted}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-6">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
                      disabled={currentPage === 0}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Trước
                    </Button>
                    <span className="text-sm text-muted-foreground px-4">
                      Trang {currentPage + 1} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))}
                      disabled={currentPage >= totalPages - 1}
                    >
                      Sau
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {searchQuery ? "Không tìm thấy sản phẩm VIP nào" : "Chưa có sản phẩm VIP nào"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
