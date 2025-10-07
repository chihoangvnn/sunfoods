'use client'

import { useState } from 'react';
import { affiliateService, type Earning, type EarningsSummary, type PaymentInfo } from '@/services/affiliateService';
import { DollarSign, Clock, CheckCircle, CreditCard, Edit2, Save, TrendingUp, History, Wallet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

const statusConfig = {
  pending: { label: 'Chờ thanh toán', color: 'bg-yellow-100 text-yellow-800' },
  processing: { label: 'Đang xử lý', color: 'bg-blue-100 text-blue-800' },
  paid: { label: 'Đã thanh toán', color: 'bg-green-100 text-green-800' },
  rejected: { label: 'Từ chối', color: 'bg-red-100 text-red-800' },
};

interface EarningsClientProps {
  initialData: {
    summary: EarningsSummary;
    earnings: Earning[];
    paymentInfo: PaymentInfo;
    availablePaymentMethods: Array<{ value: string; label: string }>;
  };
}

export default function EarningsClient({ initialData }: EarningsClientProps) {
  const [summary] = useState<EarningsSummary>(initialData.summary);
  const [earnings] = useState<Earning[]>(initialData.earnings);
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>(initialData.paymentInfo);
  const [availablePaymentMethods] = useState(initialData.availablePaymentMethods);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [editingPayment, setEditingPayment] = useState(false);
  const [paymentFormData, setPaymentFormData] = useState<PaymentInfo>(initialData.paymentInfo);

  const filteredEarnings = statusFilter
    ? earnings.filter(earning => earning.status === statusFilter)
    : earnings;

  async function handleSavePaymentInfo() {
    try {
      await affiliateService.updatePaymentInfo(paymentFormData);
      setPaymentInfo(paymentFormData);
      setEditingPayment(false);
      alert('Đã cập nhật thông tin thanh toán!');
    } catch (error) {
      alert('Lỗi cập nhật thông tin. Vui lòng thử lại.');
    }
  }

  const summarySection = (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="border-none shadow-md bg-gradient-to-br from-green-50 to-green-100">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700 mb-1">Tổng thu nhập</p>
              <p className="text-2xl font-bold text-green-900">
                {formatVND(summary.totalEarned)}
              </p>
              <p className="text-xs text-green-600 mt-1">
                {summary.totalReferrals} đơn hàng • {summary.commissionRate}% hoa hồng
              </p>
            </div>
            <div className="p-3 bg-green-200 rounded-lg">
              <DollarSign className="h-8 w-8 text-green-700" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-md bg-gradient-to-br from-yellow-50 to-yellow-100">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-700 mb-1">Chờ thanh toán</p>
              <p className="text-2xl font-bold text-yellow-900">
                {formatVND(summary.totalPending)}
              </p>
              <p className="text-xs text-yellow-600 mt-1">Đang chờ xử lý</p>
            </div>
            <div className="p-3 bg-yellow-200 rounded-lg">
              <Clock className="h-8 w-8 text-yellow-700" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-md bg-gradient-to-br from-blue-50 to-blue-100">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700 mb-1">Đã thanh toán</p>
              <p className="text-2xl font-bold text-blue-900">
                {formatVND(summary.totalPaid)}
              </p>
              <p className="text-xs text-blue-600 mt-1">Đã nhận được</p>
            </div>
            <div className="p-3 bg-blue-200 rounded-lg">
              <CheckCircle className="h-8 w-8 text-blue-700" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const historySection = (
    <div className="space-y-6">
      <Card className="border-none shadow-md">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={statusFilter === '' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('')}
              size="sm"
              className={statusFilter === '' ? 'bg-green-600' : ''}
            >
              Tất cả
            </Button>
            {Object.entries(statusConfig).map(([status, config]) => (
              <Button
                key={status}
                variant={statusFilter === status ? 'default' : 'outline'}
                onClick={() => setStatusFilter(status)}
                size="sm"
                className={statusFilter === status ? 'bg-green-600' : ''}
              >
                {config.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-md">
        <CardHeader>
          <CardTitle>Lịch sử hoa hồng</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredEarnings.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Chưa có lịch sử hoa hồng
              </h3>
              <p className="text-gray-600">
                Tạo đơn hàng để bắt đầu kiếm hoa hồng
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredEarnings.map((earning, index) => {
                const status = statusConfig[earning.status as keyof typeof statusConfig] || statusConfig.pending;
                
                return (
                  <div
                    key={index}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-medium text-gray-900">
                            Đơn hàng #{earning.orderId}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${status.color}`}>
                            {status.label}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          Tổng đơn: {formatVND(earning.orderTotal)} • Tỷ lệ: {earning.commissionRate}%
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {formatDate(earning.processedAt)}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-600">Hoa hồng</p>
                        <p className="text-xl font-bold text-green-600">
                          {formatVND(earning.commissionAmount)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const paymentSection = (
    <Card className="border-none shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-green-600" />
            Thông tin thanh toán
          </CardTitle>
          {!editingPayment ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditingPayment(true)}
              className="flex items-center gap-2"
            >
              <Edit2 className="h-4 w-4" />
              Chỉnh sửa
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditingPayment(false);
                  setPaymentFormData(paymentInfo);
                }}
              >
                Hủy
              </Button>
              <Button
                size="sm"
                onClick={handleSavePaymentInfo}
                className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Lưu
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {editingPayment ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phương thức thanh toán
              </label>
              <select
                value={paymentFormData.paymentMethod}
                onChange={(e) => setPaymentFormData({ ...paymentFormData, paymentMethod: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                {availablePaymentMethods.map((method) => (
                  <option key={method.value} value={method.value}>
                    {method.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên ngân hàng
              </label>
              <input
                type="text"
                value={paymentFormData.bankName}
                onChange={(e) => setPaymentFormData({ ...paymentFormData, bankName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="VD: Techcombank"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số tài khoản
              </label>
              <input
                type="text"
                value={paymentFormData.accountNumber}
                onChange={(e) => setPaymentFormData({ ...paymentFormData, accountNumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="0123456789"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên chủ tài khoản
              </label>
              <input
                type="text"
                value={paymentFormData.accountName}
                onChange={(e) => setPaymentFormData({ ...paymentFormData, accountName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="NGUYEN VAN A"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Phương thức</p>
              <p className="font-semibold text-gray-900">
                {availablePaymentMethods.find(m => m.value === paymentInfo?.paymentMethod)?.label || paymentInfo?.paymentMethod || 'Chưa cập nhật'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Ngân hàng</p>
              <p className="font-semibold text-gray-900">{paymentInfo?.bankName || 'Chưa cập nhật'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Số tài khoản</p>
              <p className="font-semibold text-gray-900">{paymentInfo?.accountNumber || 'Chưa cập nhật'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Chủ tài khoản</p>
              <p className="font-semibold text-gray-900">{paymentInfo?.accountName || 'Chưa cập nhật'}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Thu nhập của tôi</h1>
        <p className="text-gray-600 mt-1">Quản lý hoa hồng và thông tin thanh toán</p>
      </div>

      {/* Mobile: Tabs */}
      <div className="md:hidden">
        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="summary" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span>Tổng quan</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              <span>Lịch sử</span>
            </TabsTrigger>
            <TabsTrigger value="payment" className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              <span>TT toán</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="summary" className="mt-0">
            {summarySection}
          </TabsContent>
          
          <TabsContent value="history" className="mt-0">
            {historySection}
          </TabsContent>
          
          <TabsContent value="payment" className="mt-0">
            {paymentSection}
          </TabsContent>
        </Tabs>
      </div>

      {/* Desktop: Vertical sections */}
      <div className="hidden md:block space-y-6">
        {summarySection}
        {paymentSection}
        {historySection}
      </div>
    </div>
  );
}
