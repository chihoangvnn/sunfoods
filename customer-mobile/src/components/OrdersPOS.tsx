"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Package, Calendar, User, DollarSign } from "lucide-react";
import type { Order, Customer } from "@shared/schema";

const formatPrice = (price: string | number) => {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(numPrice);
};

const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const statusColors = {
  'Chờ xử lý': 'bg-yellow-100 text-yellow-800',
  'Đã xác nhận': 'bg-blue-100 text-blue-800',
  'Đang giao': 'bg-purple-100 text-purple-800',
  'Đã gửi': 'bg-purple-100 text-purple-800',
  'Hoàn thành': 'bg-green-100 text-green-800',
  'Đã hủy': 'bg-red-100 text-red-800',
};

export function OrdersPOS() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  // Fetch POS orders (orders with tag="POS")
  const { data: orders = [], isLoading } = useQuery<(Order & { customer?: Customer })[]>({
    queryKey: ['/api/orders', { tags: 'POS' }],
    queryFn: async () => {
      const params = new URLSearchParams({ tags: 'POS' });
      const res = await fetch(`/api/orders?${params}`);
      if (!res.ok) throw new Error('Failed to fetch POS orders');
      return res.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Filter orders based on search and date
  const filteredOrders = orders.filter(order => {
    const matchesSearch = !searchTerm || 
      order.id.toString().includes(searchTerm) ||
      order.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer?.phone?.includes(searchTerm);
    
    const matchesDate = !selectedDate || 
      new Date(order.createdAt).toISOString().split('T')[0] === selectedDate;
    
    return matchesSearch && matchesDate;
  });

  // Calculate stats
  const todayOrders = orders.filter(o => 
    new Date(o.createdAt).toDateString() === new Date().toDateString()
  );
  const todayRevenue = todayOrders.reduce((sum, o) => sum + parseFloat(o.total), 0);

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đơn hàng hôm nay</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayOrders.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Doanh thu hôm nay</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(todayRevenue)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng đơn POS</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Đơn hàng POS</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm theo mã đơn, tên khách, SĐT..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="pl-9 w-[200px]"
              />
            </div>
            {(searchTerm || selectedDate) && (
              <Button 
                variant="outline" 
                onClick={() => { setSearchTerm(""); setSelectedDate(""); }}
              >
                Xóa bộ lọc
              </Button>
            )}
          </div>

          {/* Orders List */}
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Đang tải...</div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm || selectedDate ? 'Không tìm thấy đơn hàng' : 'Chưa có đơn hàng POS nào'}
              </div>
            ) : (
              filteredOrders.map((order) => (
                <Card key={order.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">#{order.id}</span>
                          <Badge className={statusColors[order.status as keyof typeof statusColors] || 'bg-gray-100'}>
                            {order.status}
                          </Badge>
                          {order.tags && order.tags.includes('POS') && (
                            <Badge variant="outline">POS</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {order.customer?.name || 'Khách vãng lai'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(order.createdAt)}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-primary">
                          {formatPrice(order.total)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {order.paymentMethod === 'cash' ? 'Tiền mặt' : 'Chuyển khoản'}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
