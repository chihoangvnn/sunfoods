import React, { useState } from "react";
import { useLocation } from "wouter";
import { Search, MoreHorizontal, Plus, Filter, Mail, Phone, Edit, Trash2, Store, TrendingUp, Settings, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Book Seller interface for automated virtual sellers
export interface BookSeller {
  id: string;
  sellerName: string;
  email: string;
  phone: string;
  avatar?: string;
  sellerType: "automated" | "manual" | "hybrid";
  pricingStrategy: "standard" | "markup" | "dynamic";
  markupPercentage: number;
  categories: string[];
  isActive: boolean;
  automationLevel: "full" | "partial" | "manual";
  totalListings: number;
  totalSales: number;
  averageRating: number;
  lastActiveDate: string;
  createdDate: string;
  abeAccountId?: string;
  performanceMetrics: {
    salesThisMonth: number;
    listingsThisWeek: number;
    conversionRate: number;
    responseTime: number;
  };
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    notation: 'compact',
    maximumFractionDigits: 0,
  }).format(price);
};

const getSellerTypeBadge = (type: string) => {
  switch (type) {
    case "automated":
      return { icon: "🤖", name: "Tự động", class: "bg-green-100 text-green-800 border-green-200" };
    case "manual":
      return { icon: "👤", name: "Thủ công", class: "bg-blue-100 text-blue-800 border-blue-200" };
    case "hybrid":
      return { icon: "⚡", name: "Kết hợp", class: "bg-purple-100 text-purple-800 border-purple-200" };
    default:
      return { icon: "❓", name: "Không xác định", class: "bg-gray-100 text-gray-800 border-gray-200" };
  }
};

const getPricingStrategyBadge = (strategy: string) => {
  switch (strategy) {
    case "standard":
      return { icon: "📊", name: "Chuẩn", class: "bg-blue-50 text-blue-700" };
    case "markup":
      return { icon: "📈", name: "Cộng thêm", class: "bg-orange-50 text-orange-700" };
    case "dynamic":
      return { icon: "⚡", name: "Linh hoạt", class: "bg-purple-50 text-purple-700" };
    default:
      return { icon: "❓", name: "Khác", class: "bg-gray-50 text-gray-700" };
  }
};

export default function BookSellers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Mock data for 20+ automated book sellers
  const mockBookSellers: BookSeller[] = [
    {
      id: "bs1",
      sellerName: "AutoBooks Pro",
      email: "autobooks.pro@system.local",
      phone: "Auto-generated",
      sellerType: "automated",
      pricingStrategy: "markup",
      markupPercentage: 15,
      categories: ["Văn học", "Khoa học", "Giáo dục"],
      isActive: true,
      automationLevel: "full",
      totalListings: 1250,
      totalSales: 45000000,
      averageRating: 4.7,
      lastActiveDate: "2024-03-25",
      createdDate: "2023-01-15",
      abeAccountId: "abe_001",
      performanceMetrics: {
        salesThisMonth: 12500000,
        listingsThisWeek: 45,
        conversionRate: 12.5,
        responseTime: 0.5
      }
    },
    {
      id: "bs2", 
      sellerName: "BookBot Alpha",
      email: "bookbot.alpha@system.local",
      phone: "Auto-generated",
      sellerType: "automated",
      pricingStrategy: "dynamic",
      markupPercentage: 20,
      categories: ["Kinh doanh", "Tâm lý", "Sức khỏe"],
      isActive: true,
      automationLevel: "full",
      totalListings: 890,
      totalSales: 32000000,
      averageRating: 4.5,
      lastActiveDate: "2024-03-25",
      createdDate: "2023-02-10",
      abeAccountId: "abe_002",
      performanceMetrics: {
        salesThisMonth: 8500000,
        listingsThisWeek: 32,
        conversionRate: 15.2,
        responseTime: 0.3
      }
    },
    {
      id: "bs3",
      sellerName: "VietBooks Standard",
      email: "vietbooks.std@system.local", 
      phone: "Auto-generated",
      sellerType: "automated",
      pricingStrategy: "standard",
      markupPercentage: 0,
      categories: ["Văn học Việt Nam", "Lịch sử"],
      isActive: true,
      automationLevel: "full",
      totalListings: 450,
      totalSales: 15000000,
      averageRating: 4.8,
      lastActiveDate: "2024-03-25",
      createdDate: "2023-03-20",
      abeAccountId: "abe_003",
      performanceMetrics: {
        salesThisMonth: 5200000,
        listingsThisWeek: 18,
        conversionRate: 18.7,
        responseTime: 0.2
      }
    },
    // Add more mock sellers to reach 20+
    ...Array.from({ length: 17 }, (_, i) => ({
      id: `bs${i + 4}`,
      sellerName: `AutoSeller ${i + 4}`,
      email: `autoseller${i + 4}@system.local`,
      phone: "Auto-generated",
      sellerType: "automated" as const,
      pricingStrategy: ["markup", "dynamic", "standard"][i % 3] as "markup" | "dynamic" | "standard",
      markupPercentage: [10, 15, 20, 25][i % 4],
      categories: [["Fiction", "Mystery"], ["Science", "Tech"], ["Business", "Self-help"]][i % 3],
      isActive: i % 10 !== 0,
      automationLevel: "full" as const,
      totalListings: 200 + (i * 50),
      totalSales: 5000000 + (i * 2000000),
      averageRating: 4.0 + (Math.random() * 1),
      lastActiveDate: "2024-03-25",
      createdDate: `2023-${String(i % 12 + 1).padStart(2, '0')}-15`,
      abeAccountId: `abe_${String(i + 4).padStart(3, '0')}`,
      performanceMetrics: {
        salesThisMonth: 1000000 + (i * 500000),
        listingsThisWeek: 10 + (i * 2),
        conversionRate: 8 + (Math.random() * 10),
        responseTime: 0.1 + (Math.random() * 0.5)
      }
    }))
  ];

  const filteredSellers = mockBookSellers.filter(seller =>
    seller.sellerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    seller.categories.some(cat => 
      cat.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleViewSeller = (seller: BookSeller) => {
    toast({
      title: "Xem thông tin seller",
      description: `Đang xem thông tin của ${seller.sellerName}`,
    });
  };

  const handleConfigureSeller = (seller: BookSeller) => {
    setLocation(`/book-sellers/${seller.id}/config`);
  };

  const activeSellers = mockBookSellers.filter(s => s.isActive).length;
  const totalSales = mockBookSellers.reduce((sum, s) => sum + s.totalSales, 0);
  const totalListings = mockBookSellers.reduce((sum, s) => sum + s.totalListings, 0);
  const avgConversion = mockBookSellers.reduce((sum, s) => sum + s.performanceMetrics.conversionRate, 0) / mockBookSellers.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Người Bán Sách Tự Động
            </h1>
            <p className="text-muted-foreground mt-2">
              Quản lý 20+ sellers tự động với hệ thống định giá thông minh
            </p>
          </div>
          <Button className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
            <Plus className="h-4 w-4" />
            Thêm seller mới
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Store className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold">{activeSellers}</p>
                  <p className="text-sm text-muted-foreground">Sellers hoạt động</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold">{formatPrice(totalSales)}</p>
                  <p className="text-sm text-muted-foreground">Tổng doanh thu</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Eye className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold">{totalListings.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Tổng listings</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Settings className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold">{avgConversion.toFixed(1)}%</p>
                  <p className="text-sm text-muted-foreground">Tỷ lệ chuyển đổi TB</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm theo tên seller hoặc danh mục..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Bộ lọc
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sellers List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Danh sách sellers ({filteredSellers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredSellers.map((seller) => {
                const typeBadge = getSellerTypeBadge(seller.sellerType);
                const strategyBadge = getPricingStrategyBadge(seller.pricingStrategy);
                return (
                  <div
                    key={seller.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={seller.avatar} />
                        <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
                          {seller.sellerName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{seller.sellerName}</h3>
                          <Badge className={typeBadge.class}>
                            {typeBadge.icon} {typeBadge.name}
                          </Badge>
                          <Badge variant="outline" className={strategyBadge.class}>
                            {strategyBadge.icon} {strategyBadge.name}
                          </Badge>
                          {!seller.isActive && (
                            <Badge variant="destructive" className="text-xs">
                              Tạm dừng
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{seller.email}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>📦 {seller.totalListings} listings</span>
                          <span>💰 {formatPrice(seller.totalSales)}</span>
                          <span>⭐ {seller.averageRating.toFixed(1)}</span>
                          <span>📈 {seller.performanceMetrics.conversionRate.toFixed(1)}%</span>
                        </div>
                        <div className="flex gap-1">
                          {seller.categories.slice(0, 2).map((category, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {category}
                            </Badge>
                          ))}
                          {seller.categories.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{seller.categories.length - 2}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewSeller(seller)}
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleConfigureSeller(seller)}
                        className="h-8 w-8 p-0"
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewSeller(seller)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Xem chi tiết
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleConfigureSeller(seller)}>
                            <Settings className="mr-2 h-4 w-4" />
                            Cấu hình
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <TrendingUp className="mr-2 h-4 w-4" />
                            Xem báo cáo
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Xóa seller
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}