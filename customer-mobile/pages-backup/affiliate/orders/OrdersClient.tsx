'use client'

import { useState } from 'react';
import { ShoppingCart, Filter, Calendar, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { AffiliateOrder } from '@/services/affiliateService';

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
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

const statusConfig = {
  pending: { label: 'Chờ xử lý', color: 'bg-yellow-100 text-yellow-800' },
  processing: { label: 'Đang xử lý', color: 'bg-blue-100 text-blue-800' },
  completed: { label: 'Hoàn thành', color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Đã hủy', color: 'bg-red-100 text-red-800' },
};

interface OrderData {
  id: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  orderTotal: number;
  commissionAmount: number;
  commissionRate: number;
  status: string;
  createdAt: string;
}

interface OrdersClientProps {
  initialData: {
    orders: OrderData[];
    total: number;
  };
}

export default function OrdersClient({ initialData }: OrdersClientProps) {
  const [orders, setOrders] = useState<OrderData[]>(initialData.orders);
  const [statusFilter, setStatusFilter] = useState<string>('');

  const filteredOrders = statusFilter 
    ? orders.filter(order => order.status === statusFilter)
    : orders;

  const totalCommission = filteredOrders.reduce((sum, order) => sum + order.commissionAmount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Đơn hàng của tôi</h1>
        <p className="text-gray-600 mt-1">Quản lý tất cả đơn hàng từ mã CTV của bạn</p>
      </div>

      {/* Compact Summary - Single Row */}
      <Card className="border-none shadow-md">
        <CardContent className="p-4">
          <div className="flex items-center justify-around gap-4">
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Tổng đơn</p>
              <p className="text-3xl font-bold text-gray-900">{initialData.total}</p>
            </div>
            <div className="h-12 w-px bg-gray-200"></div>
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Hiện tại</p>
              <p className="text-3xl font-bold text-blue-600">{filteredOrders.length}</p>
            </div>
            <div className="h-12 w-px bg-gray-200"></div>
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Hoa hồng</p>
              <p className="text-2xl font-bold text-green-600">
                {formatVND(totalCommission)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

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
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-green-600" />
            Danh sách đơn hàng
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Chưa có đơn hàng
              </h3>
              <p className="text-gray-600 mb-4">
                Tạo đơn hàng đầu tiên để bắt đầu kiếm hoa hồng
              </p>
              <a
                href="/affiliate/quick-order"
                className="inline-block px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Tạo đơn ngay
              </a>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredOrders.map((order) => {
                const status = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.pending;
                
                return (
                  <div
                    key={order.id}
                    className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    {/* Line 1: Order ID, Status, Total, Commission */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">#{order.orderId}</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Tổng</p>
                          <p className="text-sm font-bold text-gray-900">
                            {formatVND(order.orderTotal)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">HH</p>
                          <p className="text-sm font-bold text-green-600">
                            {formatVND(order.commissionAmount)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Line 2: Date, Commission Rate */}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(order.createdAt)}</span>
                      </div>
                      <span className="font-medium">Tỷ lệ: {order.commissionRate}%</span>
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
}
