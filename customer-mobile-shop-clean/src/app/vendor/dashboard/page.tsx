'use client'

import { useState, useEffect } from 'react';
import { registerServiceWorker } from '@/lib/registerServiceWorker';
import { NotificationPermission } from '@/components/NotificationPermission';
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { mockVendor, mockVendorProducts, mockVendorOrders, mockDepositTransactions, paymentModelTerms, mockMonthlyStats, mockUpfrontStats, mockRevenueStats } from '@/data/mockVendorData';
import { PaymentModelTerms, PaymentModel } from '@/types/vendor';
import { 
  Package, 
  ShoppingCart, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle, 
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Clock,
  ArrowLeftRight,
  Check,
  AlertCircle,
  X,
  CreditCard,
  Bell
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { useVendorNotifications } from '@/hooks/useVendorNotifications';

function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
}

function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

function getCarrierIcon(carrier: string) {
  const lowerCarrier = carrier.toLowerCase();
  if (lowerCarrier.includes('ghn') || lowerCarrier.includes('giao hàng nhanh')) {
    return '🚚';
  } else if (lowerCarrier.includes('ghtk') || lowerCarrier.includes('giao hàng tiết kiệm')) {
    return '📦';
  } else if (lowerCarrier.includes('viettel')) {
    return '📮';
  } else if (lowerCarrier.includes('j&t')) {
    return '🚐';
  } else if (lowerCarrier.includes('ninja')) {
    return '🥷';
  }
  return '🚛';
}

function getStatusBadgeVariant(status: string) {
  switch (status) {
    case 'delivered':
      return 'default';
    case 'shipped':
      return 'new';
    case 'confirmed':
      return 'topseller';
    case 'pending':
      return 'secondary';
    default:
      return 'secondary';
  }
}

function getStatusText(status: string) {
  switch (status) {
    case 'delivered':
      return 'Đã giao';
    case 'shipped':
      return 'Đang giao';
    case 'confirmed':
      return 'Đã xác nhận';
    case 'pending':
      return 'Chờ xử lý';
    case 'cancelled':
      return 'Đã hủy';
    default:
      return status;
  }
}

export default function VendorDashboard() {
  const { triggerMockNotification } = useVendorNotifications();
  const [showModelComparison, setShowModelComparison] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [selectedModel, setSelectedModel] = useState<PaymentModelTerms | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingModelSwitch, setPendingModelSwitch] = useState<{
    targetModel: PaymentModel;
    requestedAt: Date;
    status: 'pending' | 'approved' | 'rejected';
  } | null>(null);
  
  const handleSelectModel = (model: PaymentModelTerms) => {
    setSelectedModel(model);
    setTermsAccepted(false);
    setShowConfirmationModal(true);
  };

  const handleConfirmSwitch = async () => {
    if (!selectedModel || !termsAccepted) return;
    
    setIsSubmitting(true);
    
    // TODO Backend:
    // - POST /api/vendor/model-switch-request
    //   Body: { targetModel: PaymentModel, termsAccepted: boolean }
    // - GET /api/vendor/model-switch-request (check pending)
    // - DELETE /api/vendor/model-switch-request/:id (cancel)
    // - Admin endpoint: PUT /api/admin/model-switch-request/:id/approve
    // - Admin endpoint: PUT /api/admin/model-switch-request/:id/reject
    
    console.log('Submitting model switch request:', {
      targetModel: selectedModel.id,
      termsAccepted,
      timestamp: new Date().toISOString()
    });
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setPendingModelSwitch({
      targetModel: selectedModel.id,
      requestedAt: new Date(),
      status: 'pending'
    });
    
    setIsSubmitting(false);
    setShowConfirmationModal(false);
    setShowModelComparison(false);
    
    toast({
      title: "Yêu cầu đã được gửi!",
      description: "Admin sẽ xem xét trong 1-2 ngày làm việc.",
      duration: 5000
    });
  };

  const handleCancelSwitch = () => {
    console.log('Cancelling model switch request');
    setPendingModelSwitch(null);
    
    toast({
      title: "Đã hủy yêu cầu",
      description: "Yêu cầu chuyển đổi mô hình đã được hủy.",
      duration: 3000
    });
  };

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const ordersThisMonth = mockVendorOrders.filter(o => {
    const orderDate = new Date(o.createdAt);
    return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
  });

  const ordersLastMonth = mockVendorOrders.filter(o => {
    const orderDate = new Date(o.createdAt);
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    return orderDate.getMonth() === lastMonth && orderDate.getFullYear() === lastMonthYear;
  });

  const totalOrdersThisMonth = ordersThisMonth.length;
  const totalOrdersLastMonth = ordersLastMonth.length;
  const ordersTrend = totalOrdersThisMonth - totalOrdersLastMonth;

  const pendingOrders = mockVendorOrders.filter(o => o.status === 'pending' || o.status === 'confirmed').length;
  
  const revenueThisMonth = ordersThisMonth
    .filter(o => o.status === 'delivered')
    .reduce((sum, o) => sum + o.codAmount, 0);

  const revenueLastMonth = ordersLastMonth
    .filter(o => o.status === 'delivered')
    .reduce((sum, o) => sum + o.codAmount, 0);

  const revenueTrend = revenueThisMonth - revenueLastMonth;

  const activeProducts = mockVendorProducts.filter(p => p.status === 'active').length;

  const lowStockProducts = mockVendorProducts.filter(p => p.quantity < 5 && p.quantity > 0 && p.status === 'active');

  const recentTransactions = mockDepositTransactions
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const lastTransaction = recentTransactions[0];

  const isLowBalance = mockVendor.depositBalance < 1000000;
  
  const targetModelData = pendingModelSwitch 
    ? paymentModelTerms.find(m => m.id === pendingModelSwitch.targetModel)
    : null;

  useEffect(() => {
    registerServiceWorker();
  }, []);

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Tổng quan hoạt động nhà cung cấp</p>
        </div>
        <Button 
          variant="outline" 
          onClick={triggerMockNotification}
          className="gap-2"
        >
          <Bell className="w-4 h-4" />
          Demo thông báo
        </Button>
      </div>

      <NotificationPermission />

      <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Mô hình thanh toán hiện tại</CardTitle>
              <CardDescription>
                Chọn mô hình phù hợp với nhu cầu kinh doanh của bạn
              </CardDescription>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowModelComparison(true)}
              className="gap-2"
              disabled={pendingModelSwitch !== null}
            >
              <ArrowLeftRight className="w-4 h-4" />
              So sánh mô hình
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {pendingModelSwitch && targetModelData && (
            <div className="mb-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-yellow-900">
                      Yêu cầu chuyển sang {targetModelData.nameVi} đang chờ phê duyệt
                    </p>
                    <p className="text-sm text-yellow-700 mt-1">
                      Dự kiến: 1-2 ngày làm việc
                    </p>
                    <p className="text-xs text-yellow-600 mt-1">
                      Gửi lúc: {formatDateTime(pendingModelSwitch.requestedAt)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelSwitch}
                  className="text-yellow-700 hover:text-yellow-900 hover:bg-yellow-100"
                >
                  Hủy yêu cầu
                </Button>
              </div>
            </div>
          )}
          
          <div className="grid md:grid-cols-4 gap-4">
            {paymentModelTerms.map(model => (
              <div
                key={model.id}
                className={cn(
                  "relative p-4 rounded-lg border-2 transition-all",
                  model.currentlyUsing
                    ? "border-orange-500 bg-orange-50"
                    : model.available && !pendingModelSwitch
                    ? "border-gray-200 hover:border-orange-300 cursor-pointer hover:shadow-md"
                    : "border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed"
                )}
                onClick={() => model.available && !model.currentlyUsing && !pendingModelSwitch && handleSelectModel(model)}
                title={pendingModelSwitch ? "Vui lòng đợi yêu cầu hiện tại được xử lý" : undefined}
              >
                {model.currentlyUsing && (
                  <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                    Đang dùng
                  </div>
                )}
                {!model.available && (
                  <div className="absolute -top-2 -right-2 bg-gray-400 text-white text-xs px-2 py-1 rounded-full">
                    Chưa đủ ĐK
                  </div>
                )}
                
                <div className="text-3xl mb-2">{model.icon}</div>
                <h3 className="font-semibold text-sm mb-1">{model.nameVi}</h3>
                <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                  {model.description}
                </p>
                
                {model.id === 'deposit' && (
                  <div className="text-xs">
                    <span className="text-gray-500">Phí:</span>{' '}
                    <span className="font-semibold text-orange-600">{model.commissionRate}%</span>
                  </div>
                )}
                {model.id === 'monthly' && (
                  <div className="text-xs">
                    <span className="text-gray-500">Phí:</span>{' '}
                    <span className="font-semibold text-green-600">{model.commissionRate}%</span>
                  </div>
                )}
                {model.id === 'upfront' && (
                  <div className="text-xs">
                    <span className="text-gray-500">Chiết khấu:</span>{' '}
                    <span className="font-semibold text-blue-600">{model.commissionRate}%</span>
                  </div>
                )}
                {model.id === 'revenue_share' && (
                  <div className="text-xs">
                    <span className="text-gray-500">Bạn nhận:</span>{' '}
                    <span className="font-semibold text-purple-600">{model.revenueShareVendor}%</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {mockVendor.paymentModel === 'deposit' && (
        <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-orange-800 font-medium mb-1">Số dư ký quỹ</p>
              <p className="text-3xl font-bold text-orange-900">
                {formatVND(mockVendor.depositBalance)}
              </p>
              {lastTransaction && (
                <p className="text-xs text-orange-700 mt-2 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Giao dịch gần nhất: {formatDateTime(new Date(lastTransaction.createdAt))}
                </p>
              )}
            </div>
            <div className="h-14 w-14 bg-orange-600 rounded-xl flex items-center justify-center">
              <Wallet className="h-8 w-8 text-white" />
            </div>
          </div>

          {isLowBalance && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-800">Cảnh báo số dư thấp</p>
                <p className="text-xs text-red-700 mt-1">Số dư ký quỹ của bạn thấp hơn 1,000,000 ₫. Vui lòng nạp thêm để đảm bảo các đơn hàng được xử lý.</p>
              </div>
            </div>
          )}

          <Button className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white">
            <Wallet className="h-4 w-4" />
            Nạp tiền ký quỹ
          </Button>
        </Card>
      )}

      {mockVendor.paymentModel === 'monthly' && (
        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <p className="text-sm text-green-800 font-medium mb-1">Hạn mức tín dụng</p>
              <div className="space-y-3 mt-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-green-700">Đã sử dụng</span>
                  <span className="font-semibold text-green-900">
                    {mockMonthlyStats.creditUsed.toLocaleString('vi-VN')} ₫
                  </span>
                </div>
                <Progress value={(mockMonthlyStats.creditUsed / mockMonthlyStats.creditLimit) * 100} className="h-3" />
                <div className="flex justify-between items-center text-sm text-green-700">
                  <span>Còn lại</span>
                  <span className="font-semibold">
                    {(mockMonthlyStats.creditLimit - mockMonthlyStats.creditUsed).toLocaleString('vi-VN')} ₫
                  </span>
                </div>
                <div className="text-xs text-green-600">
                  Hạn mức: {mockMonthlyStats.creditLimit.toLocaleString('vi-VN')} ₫
                </div>
              </div>
            </div>
            <div className="h-14 w-14 bg-green-600 rounded-xl flex items-center justify-center flex-shrink-0 ml-4">
              <CreditCard className="h-8 w-8 text-white" />
            </div>
          </div>
          <Badge variant="outline" className="text-green-700 border-green-300">
            Thanh toán: {mockMonthlyStats.nextSettlementDate}
          </Badge>
        </Card>
      )}

      {mockVendor.paymentModel === 'upfront' && (
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <p className="text-sm text-blue-800 font-medium mb-1">Giao dịch tháng này</p>
              <div className="space-y-3 mt-3">
                <div>
                  <p className="text-xs text-blue-600">Đã mua</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {mockUpfrontStats.totalPurchased.toLocaleString('vi-VN')} ₫
                  </p>
                </div>
                <div>
                  <p className="text-xs text-blue-600">Đã thanh toán</p>
                  <p className="text-2xl font-bold text-green-600">
                    {mockUpfrontStats.totalPaid.toLocaleString('vi-VN')} ₫
                  </p>
                </div>
                {mockUpfrontStats.nextPayment && (
                  <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                    <p className="text-xs text-yellow-700">Thanh toán tiếp theo</p>
                    <p className="font-semibold text-yellow-900">
                      {mockUpfrontStats.nextPayment.amount.toLocaleString('vi-VN')} ₫
                    </p>
                    <p className="text-xs text-yellow-600">
                      Ngày {mockUpfrontStats.nextPayment.dueDate}
                    </p>
                  </div>
                )}
              </div>
            </div>
            <div className="h-14 w-14 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 ml-4">
              <DollarSign className="h-8 w-8 text-white" />
            </div>
          </div>
        </Card>
      )}

      {mockVendor.paymentModel === 'revenue_share' && (
        <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <p className="text-sm text-purple-800 font-medium mb-1">Doanh thu chia sẻ</p>
              <div className="space-y-3 mt-3">
                <div>
                  <p className="text-xs text-purple-600">Tổng doanh thu bán</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {mockRevenueStats.totalRevenue.toLocaleString('vi-VN')} ₫
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-green-50 p-2 rounded-lg border border-green-200">
                    <p className="text-xs text-green-600">Bạn nhận (70%)</p>
                    <p className="font-semibold text-green-700">
                      {mockRevenueStats.vendorShare.toLocaleString('vi-VN')} ₫
                    </p>
                  </div>
                  <div className="bg-orange-50 p-2 rounded-lg border border-orange-200">
                    <p className="text-xs text-orange-600">Shop (30%)</p>
                    <p className="font-semibold text-orange-700">
                      {mockRevenueStats.shopShare.toLocaleString('vi-VN')} ₫
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="h-14 w-14 bg-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 ml-4">
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
          </div>
          <Badge variant="outline" className="text-purple-700 border-purple-300">
            Thanh toán: 10 & 25 hàng tháng
          </Badge>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Đơn hàng tháng này</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalOrdersThisMonth}</p>
              <div className="flex items-center gap-1 mt-2">
                {ordersTrend > 0 ? (
                  <>
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-xs text-green-600 font-medium">+{ordersTrend}</span>
                  </>
                ) : ordersTrend < 0 ? (
                  <>
                    <TrendingDown className="h-4 w-4 text-red-600" />
                    <span className="text-xs text-red-600 font-medium">{ordersTrend}</span>
                  </>
                ) : (
                  <span className="text-xs text-gray-500">Không đổi</span>
                )}
              </div>
            </div>
            <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <ShoppingCart className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Đơn chờ xử lý</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{pendingOrders}</p>
              <p className="text-xs text-gray-500 mt-2">Cần đóng gói & giao</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Doanh thu tháng này</p>
              <p className="text-xl font-bold text-gray-900 mt-1">{formatVND(revenueThisMonth)}</p>
              <div className="flex items-center gap-1 mt-2">
                {revenueTrend > 0 ? (
                  <>
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-xs text-green-600 font-medium">+{formatVND(revenueTrend)}</span>
                  </>
                ) : revenueTrend < 0 ? (
                  <>
                    <TrendingDown className="h-4 w-4 text-red-600" />
                    <span className="text-xs text-red-600 font-medium">{formatVND(revenueTrend)}</span>
                  </>
                ) : (
                  <span className="text-xs text-gray-500">Không đổi</span>
                )}
              </div>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Sản phẩm ký gửi</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{activeProducts}</p>
              <p className="text-xs text-gray-500 mt-2">Đang hoạt động</p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Package className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Đơn hàng gần đây</h2>
            <Link href="/vendor/orders">
              <Button variant="ghost" size="sm">
                Xem tất cả
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="space-y-3">
            {mockVendorOrders.slice(0, 5).map((order) => (
              <Link key={order.id} href={`/vendor/orders`}>
                <div className="flex justify-between items-start py-3 border-b last:border-0 hover:bg-gray-50 -mx-2 px-2 rounded transition-colors cursor-pointer">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-gray-900">{order.orderId}</p>
                      <Badge variant={getStatusBadgeVariant(order.status)}>
                        {getStatusText(order.status)}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{order.maskedCustomerName} • {order.maskedCustomerPhone}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">{getCarrierIcon(order.shippingCarrier)} {order.shippingCarrier}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{formatVND(order.codAmount)}</p>
                    <p className="text-xs text-gray-500 mt-1">COD</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Giao dịch ký quỹ</h2>
            <Link href="/vendor/financial">
              <Button variant="ghost" size="sm">
                Xem tất cả
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="space-y-3">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex justify-between items-start py-3 border-b last:border-0">
                <div className="flex items-start gap-3">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    transaction.type === 'deposit' ? 'bg-green-100' :
                    transaction.type === 'deduction' ? 'bg-red-100' :
                    'bg-blue-100'
                  }`}>
                    {transaction.type === 'deposit' ? (
                      <ArrowDownRight className="h-5 w-5 text-green-600" />
                    ) : transaction.type === 'deduction' ? (
                      <ArrowUpRight className="h-5 w-5 text-red-600" />
                    ) : (
                      <RefreshCw className="h-5 w-5 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <p className={`font-semibold ${
                      transaction.type === 'deposit' ? 'text-green-600' :
                      transaction.type === 'deduction' ? 'text-red-600' :
                      'text-blue-600'
                    }`}>
                      {transaction.type === 'deposit' ? '+' : transaction.type === 'deduction' ? '-' : '+'}
                      {formatVND(transaction.amount)}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">{transaction.description}</p>
                    <p className="text-xs text-gray-500 mt-1">{formatDateTime(new Date(transaction.createdAt))}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {lowStockProducts.length > 0 && (
        <Card className="p-6 bg-yellow-50 border-yellow-200">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <h2 className="text-lg font-semibold text-yellow-900">Cảnh báo tồn kho thấp</h2>
            </div>
            <Link href="/vendor/products">
              <Button variant="outline" size="sm" className="border-yellow-600 text-yellow-700 hover:bg-yellow-100">
                Xem tất cả
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {lowStockProducts.map((product) => (
              <div key={product.id} className="bg-white border border-yellow-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{product.productId}</p>
                    <p className="text-sm text-gray-600 mt-1">Còn {product.quantity} sản phẩm</p>
                  </div>
                  <Badge variant="destructive">
                    Sắp hết
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {showModelComparison && (
        <Dialog open={showModelComparison} onOpenChange={setShowModelComparison}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>So sánh mô hình thanh toán</DialogTitle>
              <DialogDescription>
                Chọn mô hình phù hợp nhất với quy mô và nhu cầu của bạn
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {paymentModelTerms.map(model => (
                <Card key={model.id} className={model.currentlyUsing ? 'border-orange-500' : ''}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{model.icon}</span>
                        <div>
                          <CardTitle className="text-lg">{model.nameVi}</CardTitle>
                          <CardDescription>{model.description}</CardDescription>
                        </div>
                      </div>
                      {model.currentlyUsing && (
                        <Badge className="bg-orange-500">Đang dùng</Badge>
                      )}
                      {!model.available && (
                        <Badge variant="outline">Chưa đủ điều kiện</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-sm mb-2 text-green-600">✓ Ưu điểm</h4>
                      <ul className="text-sm space-y-1">
                        {model.benefits.map((benefit, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm mb-2 text-orange-600">! Điều kiện</h4>
                      <ul className="text-sm space-y-1">
                        {model.requirements.map((req, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                            <span>{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                  {model.available && !model.currentlyUsing && (
                    <CardFooter>
                      <Button 
                        className="w-full bg-orange-600 hover:bg-orange-700"
                        onClick={() => handleSelectModel(model)}
                      >
                        Chọn mô hình này
                      </Button>
                    </CardFooter>
                  )}
                </Card>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {showConfirmationModal && selectedModel && (
        <Dialog open={showConfirmationModal} onOpenChange={setShowConfirmationModal}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-6 w-6 text-orange-500" />
                <DialogTitle className="text-xl">Chuyển sang {selectedModel.nameVi}?</DialogTitle>
              </div>
              <DialogDescription>
                Vui lòng xem xét kỹ các điều khoản trước khi gửi yêu cầu
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-4xl">{selectedModel.icon}</span>
                  <div>
                    <h3 className="font-semibold text-lg">{selectedModel.nameVi}</h3>
                    <p className="text-sm text-gray-600">{selectedModel.description}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mt-4">
                  {selectedModel.commissionRate && (
                    <div className="bg-white rounded p-3">
                      <p className="text-xs text-gray-500">Phí/Chiết khấu</p>
                      <p className="font-semibold text-orange-600">{selectedModel.commissionRate}%</p>
                    </div>
                  )}
                  {selectedModel.revenueShareVendor && (
                    <div className="bg-white rounded p-3">
                      <p className="text-xs text-gray-500">Vendor nhận</p>
                      <p className="font-semibold text-purple-600">{selectedModel.revenueShareVendor}%</p>
                    </div>
                  )}
                  <div className="bg-white rounded p-3">
                    <p className="text-xs text-gray-500">Chu kỳ thanh toán</p>
                    <p className="font-semibold text-sm">{selectedModel.settlementPeriod}</p>
                  </div>
                  <div className="bg-white rounded p-3">
                    <p className="text-xs text-gray-500">Chính sách trả hàng</p>
                    <p className="font-semibold text-sm">{selectedModel.returnPolicy}</p>
                  </div>
                  {selectedModel.creditLimit && (
                    <div className="bg-white rounded p-3 col-span-2">
                      <p className="text-xs text-gray-500">Hạn mức công nợ</p>
                      <p className="font-semibold text-green-600">{formatVND(selectedModel.creditLimit)}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Lưu ý quan trọng:
                </h4>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>Đơn hàng hiện tại vẫn theo mô hình cũ</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>Đơn hàng mới sẽ áp dụng mô hình mới</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>Cần phê duyệt từ admin (1-2 ngày làm việc)</span>
                  </li>
                  {mockVendor.paymentModel === 'deposit' && selectedModel.id !== 'deposit' && (
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>Số dư ký quỹ sẽ được hoàn trả sau khi đối soát</span>
                    </li>
                  )}
                </ul>
              </div>

              <div className="space-y-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  <span className="text-sm text-gray-700">
                    Tôi đã đọc và đồng ý với điều khoản của mô hình này
                  </span>
                </label>
                <button className="text-sm text-orange-600 hover:text-orange-700 underline ml-7">
                  Xem đầy đủ điều khoản
                </button>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowConfirmationModal(false);
                    setTermsAccepted(false);
                  }}
                  disabled={isSubmitting}
                >
                  Hủy
                </Button>
                <Button
                  className="flex-1 bg-orange-600 hover:bg-orange-700"
                  onClick={handleConfirmSwitch}
                  disabled={!termsAccepted || isSubmitting}
                >
                  {isSubmitting ? 'Đang gửi...' : 'Gửi yêu cầu chuyển đổi'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
