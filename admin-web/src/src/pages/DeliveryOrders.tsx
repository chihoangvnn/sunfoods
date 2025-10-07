import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Package, Search, AlertCircle, Truck, Clock, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Order {
  id: string;
  userId: string;
  total: string;
  status: string;
  paymentMethod: string;
  shippingAddress: string | null;
  createdAt: string;
}

export default function DeliveryOrders() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: ordersData, isLoading, error } = useQuery<any[]>({
    queryKey: ["delivery-orders"],
    queryFn: async () => {
      const res = await fetch('/api/delivery-management/delivery-orders?limit=100', {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch orders");
      return await res.json();
    },
  });

  // Transform the data to extract order and driver info
  const orders = ordersData?.map(item => ({
    ...(item?.order ?? {}),
    driver: item?.driver
  }));

  const filteredOrders = orders?.filter(order => {
    const matchesSearch = 
      (order?.id ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order?.shippingAddress ?? "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || order?.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processing':
        return <Clock className="h-4 w-4 text-amber-500" />;
      case 'shipped':
        return <Truck className="h-4 w-4 text-blue-500" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'processing':
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">Chờ giao</Badge>;
      case 'shipped':
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">Đang giao</Badge>;
      case 'delivered':
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Đã giao</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

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
            {error.message || "Failed to load delivery orders"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const processingCount = orders?.filter(o => o.status === 'processing').length || 0;
  const shippedCount = orders?.filter(o => o.status === 'shipped').length || 0;
  const deliveredCount = orders?.filter(o => o.status === 'delivered').length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-emerald-500/5 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent">
              Đơn Giao Hàng
            </h1>
            <p className="text-muted-foreground mt-1">
              Quản lý và theo dõi đơn hàng cần giao
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-amber-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-500" />
                Chờ giao hàng
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-500">{processingCount}</div>
            </CardContent>
          </Card>

          <Card className="border-blue-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Truck className="h-4 w-4 text-blue-500" />
                Đang giao
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500">{shippedCount}</div>
            </CardContent>
          </Card>

          <Card className="border-emerald-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                Đã giao
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-500">{deliveredCount}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div>
                <CardTitle>Danh sách đơn hàng</CardTitle>
                <CardDescription>
                  Tổng {orders?.length || 0} đơn hàng cần giao
                </CardDescription>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Tìm đơn hàng..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="processing">Chờ giao</SelectItem>
                    <SelectItem value="shipped">Đang giao</SelectItem>
                    <SelectItem value="delivered">Đã giao</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã đơn</TableHead>
                  <TableHead>Địa chỉ giao hàng</TableHead>
                  <TableHead>Tổng tiền</TableHead>
                  <TableHead>Thanh toán</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders?.map((order, index) => (
                  <TableRow key={order?.id || `order-${index}`}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(order?.status || 'pending')}
                        {order?.id?.slice(0, 8) || 'N/A'}...
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {order?.shippingAddress || "Chưa có địa chỉ"}
                    </TableCell>
                    <TableCell className="font-medium">
                      {parseFloat(order?.total || '0').toLocaleString('vi-VN')}₫
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {order?.paymentMethod || 'N/A'}
                      </Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(order?.status || 'pending')}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {order?.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredOrders?.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {searchTerm ? "Không tìm thấy đơn hàng" : "Chưa có đơn hàng nào"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
