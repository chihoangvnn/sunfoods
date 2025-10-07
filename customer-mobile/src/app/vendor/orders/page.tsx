'use client'

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  fetchVendorOrders, 
  createGHNShipment, 
  generateShippingLabel,
  trackShipment,
  type VendorOrder 
} from '@/services/vendorOrderService';
import { toast } from '@/hooks/use-toast';
import { 
  Package, MapPin, Phone, User, Truck, Search, Filter, 
  Copy, Check, MoreVertical, Calendar, Printer, MessageSquare,
  Clock, CheckCircle, XCircle, AlertCircle 
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ShippingLabelPrint } from '@/components/ShippingLabelPrint';
import { PackingSlipPrint } from '@/components/PackingSlipPrint';
import '../print.css';

// TODO Backend: 
// - GET /api/vendor/orders?status=&carrier=&dateFrom=&dateTo=
// - GET /api/vendor/orders/:id
// - POST /api/vendor/orders/:id/print-label → generate GHN/GHTK label via API
// - Shipping carrier APIs (GHN, GHTK) integration for label generation
// - Store trackingCode, shippingLabel URL in database

interface OrderFilters {
  search: string;
  status: string;
  carrier: string;
  dateFrom: string;
  dateTo: string;
}

export default function VendorOrders() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<OrderFilters>({
    search: '',
    status: 'all',
    carrier: 'all',
    dateFrom: '',
    dateTo: '',
  });
  
  const [selectedOrder, setSelectedOrder] = useState<VendorOrder | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [showLabelPreview, setShowLabelPreview] = useState(false);
  const [showPackingSlipPreview, setShowPackingSlipPreview] = useState(false);

  const { data: orders = [], isLoading, error } = useQuery({
    queryKey: ['vendor-orders', filters],
    queryFn: () => fetchVendorOrders({
      search: filters.search,
      status: filters.status,
      carrier: filters.carrier,
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
    }),
    staleTime: 30000,
  });

  const createShipmentMutation = useMutation({
    mutationFn: createGHNShipment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-orders'] });
      toast({
        title: 'Thành công',
        description: 'Đã tạo vận đơn GHN',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Lỗi',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { label: 'Chờ lấy hàng', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
      confirmed: { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-700', icon: AlertCircle },
      shipped: { label: 'Đang giao', color: 'bg-blue-100 text-blue-700', icon: Truck },
      delivered: { label: 'Đã giao', color: 'bg-green-100 text-green-700', icon: CheckCircle },
      cancelled: { label: 'Đã hủy', color: 'bg-red-100 text-red-700', icon: XCircle },
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || { 
      label: status, 
      color: 'bg-gray-100 text-gray-700',
      icon: AlertCircle 
    };
    
    const StatusIcon = statusInfo.icon;
    
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${statusInfo.color}`}>
        <StatusIcon className="h-3 w-3" />
        {statusInfo.label}
      </span>
    );
  };

  const getCarrierIcon = (carrier: string) => {
    if (carrier.toLowerCase().includes('ghn') || carrier.toLowerCase().includes('giao hàng nhanh')) {
      return '🚚';
    } else if (carrier.toLowerCase().includes('ghtk')) {
      return '📦';
    } else if (carrier.toLowerCase().includes('viettel') || carrier.toLowerCase().includes('vnpost')) {
      return '✉️';
    } else if (carrier.toLowerCase().includes('j&t')) {
      return '📦';
    } else if (carrier.toLowerCase().includes('ninja')) {
      return '🥷';
    }
    return '📦';
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleSelectAllOrders = () => {
    if (selectedOrders.length === filteredOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filteredOrders.map(o => o.id));
    }
  };

  const handleSelectOrder = (orderId: string) => {
    setSelectedOrders(prev =>
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order: VendorOrder) => {
      const matchesSearch = !filters.search || 
        order.orderId.toLowerCase().includes(filters.search.toLowerCase()) ||
        order.trackingCode.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesStatus = filters.status === 'all' || order.status === filters.status;
      
      const matchesCarrier = filters.carrier === 'all' || 
        order.shippingCarrier.toLowerCase().includes(filters.carrier.toLowerCase());
      
      const matchesDateFrom = !filters.dateFrom || 
        new Date(order.createdAt) >= new Date(filters.dateFrom);
      
      const matchesDateTo = !filters.dateTo || 
        new Date(order.createdAt) <= new Date(filters.dateTo);
      
      return matchesSearch && matchesStatus && matchesCarrier && matchesDateFrom && matchesDateTo;
    });
  }, [orders, filters]);

  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    const pendingPickup = orders.filter((o: VendorOrder) => o.status === 'pending' || o.status === 'confirmed').length;
    const inTransit = orders.filter((o: VendorOrder) => o.status === 'shipped').length;
    const deliveredToday = orders.filter((o: VendorOrder) => {
      const orderDate = new Date(o.createdAt);
      orderDate.setHours(0, 0, 0, 0);
      return o.status === 'delivered' && orderDate.getTime() === today.getTime();
    }).length;
    
    const totalCODThisMonth = orders
      .filter((o: VendorOrder) => {
        const orderDate = new Date(o.createdAt);
        return orderDate.getMonth() === currentMonth && 
               orderDate.getFullYear() === currentYear &&
               o.status === 'delivered';
      })
      .reduce((sum: number, o: VendorOrder) => sum + o.codAmount, 0);

    return { pendingPickup, inTransit, deliveredToday, totalCODThisMonth };
  }, [orders]);

  const printLabel = async (order: VendorOrder) => {
    if (!order.shippingLabel) {
      try {
        const labelData = await generateShippingLabel(order.trackingCode);
        window.open(labelData.labelUrl, '_blank');
      } catch (error) {
        toast({
          title: 'Lỗi',
          description: 'Không thể tạo nhãn giao hàng',
          variant: 'destructive',
        });
      }
    } else {
      window.open(order.shippingLabel, '_blank');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải đơn hàng...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-8 max-w-md">
          <div className="text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Lỗi tải dữ liệu</h2>
            <p className="text-gray-600 mb-4">Không thể tải danh sách đơn hàng. Vui lòng thử lại.</p>
            <Button onClick={() => window.location.reload()}>Tải lại trang</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Quản lý Đơn hàng</h1>
        <p className="text-gray-600 mt-1">Theo dõi và quản lý đơn hàng ký gửi</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Chờ lấy hàng</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.pendingPickup}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <Package className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          {stats.pendingPickup > 0 && (
            <span className="inline-block mt-2 px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full font-medium">
              Cần đóng gói
            </span>
          )}
        </Card>

        <Card className="p-4 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Đang giao</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.inTransit}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Truck className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Giao hôm nay</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.deliveredToday}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">COD tháng này</p>
              <p className="text-xl font-bold text-gray-900 mt-1">
                {formatCurrency(stats.totalCODThisMonth)}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Package className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-4">
        <div className="space-y-4">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm theo mã đơn hàng hoặc mã vận đơn..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-10"
              />
            </div>
            
            <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
              <SelectTrigger className="w-full lg:w-[200px]">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="pending">Chờ lấy hàng</SelectItem>
                <SelectItem value="confirmed">Đã xác nhận</SelectItem>
                <SelectItem value="shipped">Đang giao</SelectItem>
                <SelectItem value="delivered">Đã giao</SelectItem>
                <SelectItem value="cancelled">Đã hủy</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.carrier} onValueChange={(value) => setFilters({ ...filters, carrier: value })}>
              <SelectTrigger className="w-full lg:w-[200px]">
                <SelectValue placeholder="Đơn vị vận chuyển" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả đơn vị</SelectItem>
                <SelectItem value="ghn">GHN 🚚</SelectItem>
                <SelectItem value="ghtk">GHTK 📦</SelectItem>
                <SelectItem value="viettel">VNPost ✉️</SelectItem>
                <SelectItem value="j&t">J&T Express 📦</SelectItem>
                <SelectItem value="ninja">Ninja Van 🥷</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label className="text-sm text-gray-600 mb-1 block">Từ ngày</label>
              <Input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              />
            </div>
            <div className="flex-1">
              <label className="text-sm text-gray-600 mb-1 block">Đến ngày</label>
              <Input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              />
            </div>
            {(filters.search || filters.status !== 'all' || filters.carrier !== 'all' || filters.dateFrom || filters.dateTo) && (
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => setFilters({ search: '', status: 'all', carrier: 'all', dateFrom: '', dateTo: '' })}
                >
                  Xóa bộ lọc
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-900">
              Danh sách đơn hàng ({filteredOrders.length})
            </h2>
            {filteredOrders.length > 0 && (
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                  onCheckedChange={handleSelectAllOrders}
                />
                <span className="text-sm text-gray-600">Chọn tất cả</span>
              </div>
            )}
          </div>
        </div>

        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                  <Checkbox
                    checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                    onCheckedChange={handleSelectAllOrders}
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mã đơn hàng
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Khách hàng
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vận chuyển
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  COD
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <Checkbox
                      checked={selectedOrders.includes(order.id)}
                      onCheckedChange={() => handleSelectOrder(order.id)}
                    />
                  </td>
                  <td className="px-4 py-4">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="text-orange-600 hover:text-orange-700 font-medium hover:underline"
                    >
                      {order.orderId}
                    </button>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm">
                      <p className="font-medium text-gray-900">{order.maskedCustomerName}</p>
                      <p className="text-gray-500">{order.maskedCustomerPhone}</p>
                      <p className="text-gray-500 text-xs truncate max-w-xs">{order.maskedAddress}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm">
                      <p className="font-medium text-gray-900 flex items-center gap-1">
                        <span>{getCarrierIcon(order.shippingCarrier)}</span>
                        {order.shippingCarrier}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {order.trackingCode}
                        </code>
                        <button
                          onClick={() => copyToClipboard(order.trackingCode, order.id)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          {copiedCode === order.id ? (
                            <Check className="h-3 w-3 text-green-600" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-sm font-bold text-gray-900">
                      {formatCurrency(order.codAmount)}
                    </p>
                    <p className="text-xs text-orange-600">
                      -{formatCurrency(order.depositDeducted)}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    {getStatusBadge(order.status)}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedOrder(order)}
                      >
                        Chi tiết
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => printLabel(order)}
                      >
                        <Printer className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="lg:hidden space-y-3">
          {filteredOrders.map((order) => (
            <Card key={order.id} className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <Checkbox
                  checked={selectedOrders.includes(order.id)}
                  onCheckedChange={() => handleSelectOrder(order.id)}
                />
                <div className="flex-1 flex items-start justify-between">
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="text-orange-600 hover:text-orange-700 font-semibold hover:underline"
                  >
                    {order.orderId}
                  </button>
                  {getStatusBadge(order.status)}
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <User className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">{order.maskedCustomerName}</p>
                    <p className="text-gray-500">{order.maskedCustomerPhone}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-600">{order.maskedAddress}</p>
                </div>

                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span className="flex items-center gap-1">
                    <span>{getCarrierIcon(order.shippingCarrier)}</span>
                    <span className="text-gray-900">{order.shippingCarrier}</span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded flex-1">
                    {order.trackingCode}
                  </code>
                  <button
                    onClick={() => copyToClipboard(order.trackingCode, order.id)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {copiedCode === order.id ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>

                <div className="pt-2 border-t flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Tiền COD</p>
                    <p className="font-bold text-gray-900">{formatCurrency(order.codAmount)}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedOrder(order)}
                    >
                      Chi tiết
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => printLabel(order)}
                    >
                      <Printer className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredOrders.length === 0 && (
          <Card className="p-12 text-center">
            <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Không tìm thấy đơn hàng phù hợp</p>
          </Card>
        )}
      </div>

      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Chi tiết đơn hàng {selectedOrder?.orderId}</DialogTitle>
            <DialogDescription>
              Thông tin chi tiết và phiếu giao hàng
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                {getStatusBadge(selectedOrder.status)}
                <span className="text-sm text-gray-500">
                  • {new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}
                </span>
              </div>

              <div className="border-l-4 border-orange-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">Lịch sử đơn hàng</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <span className="text-gray-600">Đơn hàng được tạo</span>
                    <span className="text-gray-400">
                      {new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}
                    </span>
                  </div>
                  {selectedOrder.status !== 'pending' && (
                    <div className="flex items-center gap-2 text-sm">
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      <span className="text-gray-600">Đã xác nhận</span>
                    </div>
                  )}
                  {(selectedOrder.status === 'shipped' || selectedOrder.status === 'delivered') && (
                    <div className="flex items-center gap-2 text-sm">
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      <span className="text-gray-600">Đã lấy hàng</span>
                    </div>
                  )}
                  {(selectedOrder.status === 'shipped' || selectedOrder.status === 'delivered') && (
                    <div className="flex items-center gap-2 text-sm">
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      <span className="text-gray-600">Đang vận chuyển</span>
                    </div>
                  )}
                  {selectedOrder.status === 'delivered' && (
                    <div className="flex items-center gap-2 text-sm">
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      <span className="text-gray-600">Đã giao hàng thành công</span>
                    </div>
                  )}
                  {selectedOrder.status === 'cancelled' && (
                    <div className="flex items-center gap-2 text-sm">
                      <div className="h-2 w-2 rounded-full bg-red-500"></div>
                      <span className="text-gray-600">Đơn hàng đã bị hủy</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Thông tin khách hàng (đã ẩn)</h3>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                      <div className="flex items-start gap-2">
                        <User className="h-4 w-4 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-gray-600">Tên khách hàng</p>
                          <p className="font-medium text-gray-900">{selectedOrder.maskedCustomerName}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Phone className="h-4 w-4 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-gray-600">Số điện thoại</p>
                          <p className="font-medium text-gray-900">{selectedOrder.maskedCustomerPhone}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-gray-600">Địa chỉ giao hàng</p>
                          <p className="font-medium text-gray-900">{selectedOrder.maskedAddress}</p>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-orange-600 mt-2">
                      ⚠️ Thông tin khách hàng đã được ẩn để bảo mật
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Thông tin sản phẩm</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Package className="h-8 w-8 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">Sản phẩm #{selectedOrder.orderId}</p>
                          <p className="text-sm text-gray-600">Sản phẩm ký gửi</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Thông tin vận chuyển</h3>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4 text-gray-400" />
                        <div className="flex-1">
                          <p className="text-gray-600">Đơn vị vận chuyển</p>
                          <p className="font-medium text-gray-900 flex items-center gap-1">
                            <span>{getCarrierIcon(selectedOrder.shippingCarrier)}</span>
                            {selectedOrder.shippingCarrier}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-600 mb-1">Mã vận đơn</p>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 bg-white px-3 py-2 rounded border font-mono text-sm">
                            {selectedOrder.trackingCode}
                          </code>
                          <button
                            onClick={() => copyToClipboard(selectedOrder.trackingCode, selectedOrder.id)}
                            className="p-2 hover:bg-gray-200 rounded"
                          >
                            {copiedCode === selectedOrder.id ? (
                              <Check className="h-4 w-4 text-green-600" />
                            ) : (
                              <Copy className="h-4 w-4 text-gray-600" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Thanh toán</h3>
                    <div className="bg-orange-50 p-4 rounded-lg space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Tiền COD:</span>
                        <span className="text-xl font-bold text-orange-600">
                          {formatCurrency(selectedOrder.codAmount)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Đã khấu trừ:</span>
                        <span className="font-medium text-gray-700">
                          -{formatCurrency(selectedOrder.depositDeducted)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-semibold text-gray-900 mb-4">Phiếu giao hàng</h3>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-white">
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Người gửi</p>
                      <div className="space-y-1 text-sm">
                        <p className="font-bold text-gray-900">{selectedOrder.vendorName || 'Nhà cung cấp'}</p>
                        <p className="text-gray-700">0901234567</p>
                        <p className="text-gray-600">Kho hàng - TP.HCM</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Người nhận</p>
                      <div className="space-y-1 text-sm">
                        <p className="font-bold text-gray-900">{selectedOrder.maskedCustomerName}</p>
                        <p className="text-gray-700">{selectedOrder.maskedCustomerPhone}</p>
                        <p className="text-gray-600">{selectedOrder.maskedAddress}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-4 border-y">
                    <div className="text-center flex-1">
                      <p className="text-xs text-gray-500 uppercase mb-2">Mã vận đơn</p>
                      <div className="font-mono text-lg font-bold bg-gray-100 px-4 py-2 rounded inline-block">
                        {selectedOrder.trackingCode}
                      </div>
                      <div className="mt-3 h-16 bg-gray-200 flex items-center justify-center rounded">
                        <span className="font-mono text-xs text-gray-500">|||||||||||||||||||</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 mt-6">
                    <div className="text-center">
                      <p className="text-xs text-gray-500 uppercase mb-2">Đơn vị vận chuyển</p>
                      <div className="text-4xl mb-2">{getCarrierIcon(selectedOrder.shippingCarrier)}</div>
                      <p className="font-bold text-gray-900">{selectedOrder.shippingCarrier}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 uppercase mb-2">Tiền thu hộ (COD)</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {formatCurrency(selectedOrder.codAmount)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-xs text-yellow-800 text-center">
                      🔒 Thông tin khách hàng đã được ẩn để bảo mật
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 mt-4">
                  <Button
                    className="flex-1"
                    onClick={() => printLabel(selectedOrder)}
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    In phiếu giao hàng
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Liên hệ shipper
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {selectedOrders.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white border shadow-lg rounded-lg p-4 flex items-center gap-4 z-50">
          <span className="text-sm font-medium">
            Đã chọn {selectedOrders.length} đơn hàng
          </span>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowLabelPreview(true)}
              className="gap-2"
            >
              <Printer className="w-4 h-4" />
              In tem gửi hàng
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPackingSlipPreview(true)}
              className="gap-2"
            >
              <Printer className="w-4 h-4" />
              In phiếu đóng gói
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedOrders([])}
            >
              Hủy
            </Button>
          </div>
        </div>
      )}

      <ShippingLabelPrint
        open={showLabelPreview}
        onClose={() => setShowLabelPreview(false)}
        orders={orders.filter((o: VendorOrder) => selectedOrders.includes(o.id))}
      />

      <PackingSlipPrint
        open={showPackingSlipPreview}
        onClose={() => setShowPackingSlipPreview(false)}
        orders={orders.filter((o: VendorOrder) => selectedOrders.includes(o.id))}
      />
    </div>
  );
}
