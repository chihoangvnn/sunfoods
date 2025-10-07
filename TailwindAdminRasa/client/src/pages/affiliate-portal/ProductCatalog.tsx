import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Package, Search, Filter, AlertCircle, CheckCircle, XCircle, Plus, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AffiliateProduct {
  productId: string;
  productName: string;
  productSku: string | null;
  productDescription: string | null;
  productPrice: string;
  productStock: number;
  productImage: string | null;
  productCategory: string | null;
  commissionRate: string;
  commissionType: 'percentage' | 'fixed';
  assignmentType: 'product' | 'category' | 'frontend';
  isPremium: boolean;
  categoryId: string | null;
}

interface ProductsResponse {
  success: boolean;
  data: {
    products: AffiliateProduct[];
    tierInfo: {
      tier: string;
      orderCount: number;
      nextTier: string | null;
      ordersToNextTier: number | null;
    };
    stats: {
      totalProducts: number;
      totalCommissionRate: string;
    };
  };
}

export default function ProductCatalog() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [stockFilter, setStockFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { data, isLoading, error } = useQuery<ProductsResponse>({
    queryKey: ["/api/affiliate-portal/products"],
  });

  const products = data?.data?.products || [];
  const tierInfo = data?.data?.tierInfo;
  const stats = data?.data?.stats;

  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.productCategory).filter(Boolean));
    return Array.from(cats);
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = searchQuery === "" || 
        product.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.productSku?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = categoryFilter === "all" || product.productCategory === categoryFilter;
      
      const matchesStock = stockFilter === "all" || 
        (stockFilter === "in-stock" && product.productStock > 10) ||
        (stockFilter === "low-stock" && product.productStock > 0 && product.productStock <= 10) ||
        (stockFilter === "out-of-stock" && product.productStock === 0);

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [products, searchQuery, categoryFilter, stockFilter]);

  const getStockBadge = (stock: number) => {
    if (stock === 0) {
      return <Badge variant="destructive" className="gap-1"><XCircle className="w-3 h-3" /> Hết hàng</Badge>;
    }
    if (stock <= 10) {
      return <Badge variant="outline" className="gap-1 border-orange-500 text-orange-600"><AlertCircle className="w-3 h-3" /> Sắp hết ({stock})</Badge>;
    }
    return <Badge variant="outline" className="gap-1 border-green-500 text-green-600"><CheckCircle className="w-3 h-3" /> Còn hàng ({stock})</Badge>;
  };

  const getTierBadge = (tier: string) => {
    const colors = {
      bronze: "bg-orange-100 text-orange-700",
      silver: "bg-gray-100 text-gray-700",
      gold: "bg-yellow-100 text-yellow-700",
      diamond: "bg-blue-100 text-blue-700"
    };
    return colors[tier.toLowerCase() as keyof typeof colors] || "bg-gray-100 text-gray-700";
  };

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              <p>Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header với Tier Info */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">📦 Danh Mục Sản Phẩm</h1>
          <p className="text-muted-foreground mt-1">
            Chọn sản phẩm để tạo đơn hàng hoặc chia sẻ link
          </p>
        </div>
        
        {tierInfo && (
          <Card className="lg:w-80">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Hạng của bạn</p>
                  <Badge className={`mt-1 ${getTierBadge(tierInfo.tier)}`}>
                    {tierInfo.tier.toUpperCase()}
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{tierInfo.orderCount}</p>
                  <p className="text-xs text-muted-foreground">đơn hàng</p>
                </div>
              </div>
              {tierInfo.nextTier && (
                <p className="text-xs text-muted-foreground mt-2">
                  Còn <span className="font-semibold">{tierInfo.ordersToNextTier} đơn</span> để lên {tierInfo.nextTier}
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Tổng sản phẩm</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.totalProducts}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Hoa hồng trung bình</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.totalCommissionRate}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Sản phẩm còn hàng</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {products.filter(p => p.productStock > 0).length}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Tìm theo tên hoặc SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Danh mục" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả danh mục</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat || ""}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={stockFilter} onValueChange={setStockFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Tồn kho" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="in-stock">Còn hàng</SelectItem>
                <SelectItem value="low-stock">Sắp hết</SelectItem>
                <SelectItem value="out-of-stock">Hết hàng</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="icon">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Request Product Button */}
      <div className="flex justify-end">
        <Button 
          variant="outline" 
          className="gap-2"
          onClick={() => setLocation("/aff/product-requests")}
        >
          <Plus className="w-4 h-4" />
          Yêu cầu sản phẩm mới
        </Button>
      </div>

      {/* Products Grid/List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-48 w-full mb-4" />
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="pt-12 pb-12 text-center">
            <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {searchQuery || categoryFilter !== "all" || stockFilter !== "all" 
                ? "Không tìm thấy sản phẩm phù hợp"
                : "Chưa có sản phẩm nào"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className={viewMode === "grid" 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" 
          : "space-y-4"
        }>
          {filteredProducts.map((product) => (
            <Card key={product.productId} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                {product.productImage && (
                  <img 
                    src={product.productImage} 
                    alt={product.productName}
                    className="w-full h-48 object-cover rounded-md mb-4"
                  />
                )}
                
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h3 className="font-semibold line-clamp-2">{product.productName}</h3>
                      {product.productSku && (
                        <p className="text-xs text-muted-foreground">SKU: {product.productSku}</p>
                      )}
                    </div>
                    {product.isPremium && (
                      <Badge variant="secondary" className="bg-purple-100 text-purple-700">⭐ VIP</Badge>
                    )}
                  </div>

                  {product.productDescription && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {product.productDescription}
                    </p>
                  )}

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-primary">
                        {parseInt(product.productPrice).toLocaleString('vi-VN')}₫
                      </p>
                      <p className="text-xs text-green-600 font-medium">
                        HH: {product.commissionRate}
                      </p>
                    </div>
                    {getStockBadge(product.productStock)}
                  </div>

                  {product.productCategory && (
                    <Badge variant="outline" className="text-xs">
                      {product.productCategory}
                    </Badge>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button 
                      className="flex-1 gap-2" 
                      size="sm"
                      disabled={product.productStock === 0}
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Tạo đơn
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1" 
                      size="sm"
                      disabled={product.productStock === 0}
                    >
                      Chia sẻ link
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
