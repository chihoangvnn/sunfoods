import React, { useState } from "react";
import { Search, MoreHorizontal, UserPlus, Filter, Mail, Phone, Edit, Trash2, BookOpen, Eye } from "lucide-react";
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

// Book Customer interface extending base customer for book-specific data
export interface BookCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  preferredGenres: string[];
  totalBooksPurchased: number;
  averageOrderValue: number;
  lastPurchaseDate: string;
  membershipTier: string;
  readingInterests: string[];
  communicationPreferences: string[];
  deliveryAddresses: any[];
  isActive: boolean;
  joinedDate: string;
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    notation: 'compact',
    maximumFractionDigits: 0,
  }).format(price);
};

const getReaderTierBadge = (tier: string) => {
  switch (tier) {
    case "bibliophile":
      return { icon: "📚", name: "Mọt sách", class: "bg-purple-100 text-purple-800 border-purple-200" };
    case "frequent":
      return { icon: "📖", name: "Thường xuyên", class: "bg-blue-100 text-blue-800 border-blue-200" };
    case "casual":
      return { icon: "📝", name: "Bình thường", class: "bg-green-100 text-green-800 border-green-200" };
    default:
      return { icon: "👤", name: "Mới", class: "bg-gray-100 text-gray-800 border-gray-200" };
  }
};

export default function BookCustomers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string>("all");
  const { toast } = useToast();

  // Mock data for now - will be replaced with real API
  const mockBookCustomers: BookCustomer[] = [
    {
      id: "bc1",
      name: "Nguyễn Văn An",
      email: "nva@example.com",
      phone: "0901234567",
      preferredGenres: ["Tiểu thuyết", "Khoa học viễn tưởng"],
      totalBooksPurchased: 25,
      averageOrderValue: 450000,
      lastPurchaseDate: "2024-03-15",
      membershipTier: "bibliophile",
      readingInterests: ["Văn học Việt Nam", "Khoa học"],
      communicationPreferences: ["email", "phone"],
      deliveryAddresses: [],
      isActive: true,
      joinedDate: "2023-06-10"
    },
    {
      id: "bc2", 
      name: "Trần Thị Bình",
      email: "ttb@example.com",
      phone: "0987654321",
      preferredGenres: ["Kinh doanh", "Tâm lý học"],
      totalBooksPurchased: 12,
      averageOrderValue: 320000,
      lastPurchaseDate: "2024-03-20",
      membershipTier: "frequent",
      readingInterests: ["Phát triển bản thân"],
      communicationPreferences: ["email"],
      deliveryAddresses: [],
      isActive: true,
      joinedDate: "2023-12-05"
    }
  ];

  const filteredCustomers = mockBookCustomers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.preferredGenres.some(genre => 
      genre.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleViewCustomer = (customer: BookCustomer) => {
    toast({
      title: "Xem thông tin khách hàng",
      description: `Đang xem thông tin của ${customer.name}`,
    });
  };

  const handleEditCustomer = (customer: BookCustomer) => {
    toast({
      title: "Chỉnh sửa khách hàng",
      description: `Đang chỉnh sửa thông tin của ${customer.name}`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Khách Hàng Sách
            </h1>
            <p className="text-muted-foreground mt-2">
              Quản lý khách hàng mua sách và theo dõi sở thích đọc
            </p>
          </div>
          <Button className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            <UserPlus className="h-4 w-4" />
            Thêm khách hàng
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center">
                <BookOpen className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold">{mockBookCustomers.length}</p>
                  <p className="text-sm text-muted-foreground">Tổng khách hàng</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Eye className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold">
                    {mockBookCustomers.filter(c => c.isActive).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Đang hoạt động</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Filter className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold">
                    {mockBookCustomers.filter(c => c.membershipTier === 'bibliophile').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Mọt sách</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Mail className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold">
                    {formatPrice(
                      mockBookCustomers.reduce((sum, c) => sum + c.averageOrderValue, 0) / mockBookCustomers.length
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">Giá trị TB/đơn</p>
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
                  placeholder="Tìm kiếm theo tên, email hoặc thể loại sách..."
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

        {/* Customer List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Danh sách khách hàng ({filteredCustomers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredCustomers.map((customer) => {
                const tierBadge = getReaderTierBadge(customer.membershipTier);
                return (
                  <div
                    key={customer.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={customer.avatar} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                          {customer.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{customer.name}</h3>
                          <Badge className={tierBadge.class}>
                            {tierBadge.icon} {tierBadge.name}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{customer.email}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>📚 {customer.totalBooksPurchased} cuốn</span>
                          <span>💰 {formatPrice(customer.averageOrderValue)}/đơn</span>
                          <span>📅 {customer.lastPurchaseDate}</span>
                        </div>
                        <div className="flex gap-1">
                          {customer.preferredGenres.slice(0, 2).map((genre, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {genre}
                            </Badge>
                          ))}
                          {customer.preferredGenres.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{customer.preferredGenres.length - 2}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewCustomer(customer)}
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditCustomer(customer)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewCustomer(customer)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Xem chi tiết
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditCustomer(customer)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Xóa
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