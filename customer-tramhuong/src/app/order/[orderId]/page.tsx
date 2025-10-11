'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CheckCircle, Home, ShoppingBag, Package, User, Phone, MapPin, FileText, Loader2 } from 'lucide-react';
import { formatVietnamPrice } from '@/utils/currency';
import { Button } from '@/components/ui/button';

interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  productImage: string | null;
  productPrice: number;
  quantity: number;
  subtotal: number;
}

interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerNotes: string | null;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

export default function OrderConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setError('Không tìm thấy mã đơn hàng');
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/orders?orderId=${orderId}`);
        const data = await response.json();

        if (response.ok && data.success) {
          setOrder(data.order);
        } else {
          setError(data.error || 'Không tìm thấy đơn hàng');
        }
      } catch (err) {
        console.error('Error fetching order:', err);
        setError('Không thể tải thông tin đơn hàng');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const handleGoHome = () => {
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <Loader2 className="h-16 w-16 lg:h-20 lg:w-20 text-green-600 animate-spin mx-auto mb-4 lg:mb-6" />
          <p className="text-gray-600 text-base lg:text-lg">Đang tải thông tin đơn hàng...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md lg:max-w-lg">
          <div className="w-20 h-20 lg:w-28 lg:h-28 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 lg:mb-6">
            <Package className="h-10 w-10 lg:h-14 lg:w-14 text-red-600" />
          </div>
          <h2 className="text-xl lg:text-2xl font-semibold text-gray-900 mb-2 lg:mb-3">
            Không tìm thấy đơn hàng
          </h2>
          <p className="text-gray-600 text-base lg:text-lg mb-6 lg:mb-8">
            {error || 'Đơn hàng không tồn tại hoặc đã bị xóa'}
          </p>
          <Button
            onClick={handleGoHome}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 lg:px-10 lg:py-4 rounded-lg font-medium text-base lg:text-lg"
          >
            Về trang chủ
          </Button>
        </div>
      </div>
    );
  }

  const shippingFee = 0;
  const subtotal = order.items.reduce((sum, item) => sum + item.subtotal, 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-8 lg:pb-12">
      {/* Success Header */}
      <div className="bg-gradient-to-br from-green-50 to-green-100 border-b border-green-200 px-4 lg:px-12 py-8 lg:py-12">
        <div className="text-center max-w-md lg:max-w-2xl mx-auto">
          {/* Success Icon */}
          <div className="mb-4 lg:mb-6 flex justify-center">
            <div className="w-20 h-20 lg:w-28 lg:h-28 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
              <CheckCircle className="h-12 w-12 lg:h-16 lg:w-16 text-white" strokeWidth={2.5} />
            </div>
          </div>

          {/* Success Message */}
          <h1 className="text-2xl lg:text-4xl font-bold text-green-700 mb-2 lg:mb-3">
            ✅ Đặt hàng thành công!
          </h1>
          <p className="text-green-600 text-base lg:text-xl mb-4 lg:mb-6">
            Cảm ơn bạn đã đặt hàng
          </p>

          {/* Order ID */}
          <div className="bg-white rounded-lg px-4 py-3 lg:px-6 lg:py-4 inline-block border border-green-200">
            <p className="text-xs lg:text-sm text-gray-500 mb-1">Mã đơn hàng</p>
            <p className="text-lg lg:text-2xl font-bold text-gray-900">
              #{orderId.substring(0, 8).toUpperCase()}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 lg:px-12 py-6 lg:py-8 space-y-4 lg:space-y-6">
        {/* Customer Information Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6">
          <div className="flex items-center gap-2 lg:gap-3 mb-4 lg:mb-6">
            <User className="h-5 w-5 lg:h-6 lg:w-6 text-green-600" />
            <h2 className="text-base lg:text-lg font-semibold text-gray-900">
              Thông tin người nhận
            </h2>
          </div>

          <div className="space-y-3 lg:space-y-4">
            {/* Name */}
            <div className="flex items-start gap-3 lg:gap-4">
              <User className="h-4 w-4 lg:h-5 lg:w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs lg:text-sm text-gray-500 mb-0.5 lg:mb-1">Họ và tên</p>
                <p className="text-sm lg:text-base font-medium text-gray-900">{order.customerName}</p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-start gap-3 lg:gap-4">
              <Phone className="h-4 w-4 lg:h-5 lg:w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs lg:text-sm text-gray-500 mb-0.5 lg:mb-1">Số điện thoại</p>
                <p className="text-sm lg:text-base font-medium text-gray-900">{order.customerPhone}</p>
              </div>
            </div>

            {/* Address */}
            <div className="flex items-start gap-3 lg:gap-4">
              <MapPin className="h-4 w-4 lg:h-5 lg:w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs lg:text-sm text-gray-500 mb-0.5 lg:mb-1">Địa chỉ giao hàng</p>
                <p className="text-sm lg:text-base font-medium text-gray-900">{order.customerAddress}</p>
              </div>
            </div>

            {/* Notes (if available) */}
            {order.customerNotes && (
              <div className="flex items-start gap-3 lg:gap-4">
                <FileText className="h-4 w-4 lg:h-5 lg:w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs lg:text-sm text-gray-500 mb-0.5 lg:mb-1">Ghi chú</p>
                  <p className="text-sm lg:text-base font-medium text-gray-900">{order.customerNotes}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Order Items List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6">
          <div className="flex items-center gap-2 lg:gap-3 mb-4 lg:mb-6">
            <Package className="h-5 w-5 lg:h-6 lg:w-6 text-green-600" />
            <h2 className="text-base lg:text-lg font-semibold text-gray-900">
              Sản phẩm đã đặt
            </h2>
          </div>

          <div className="space-y-3 lg:space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex gap-3 lg:gap-5 py-2 lg:py-3 border-b border-gray-100 last:border-0">
                {/* Product Image */}
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 lg:w-24 lg:h-24 bg-gray-100 rounded-lg overflow-hidden">
                    {item.productImage ? (
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-6 w-6 lg:h-10 lg:w-10 text-gray-300" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Product Details */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm lg:text-base font-medium text-gray-900 line-clamp-2 mb-1 lg:mb-2">
                    {item.productName}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-xs lg:text-sm text-gray-500">
                      {formatVietnamPrice(item.productPrice)} × {item.quantity}
                    </span>
                    <span className="text-sm lg:text-base font-semibold text-gray-900">
                      {formatVietnamPrice(item.subtotal)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6">
          <h2 className="text-base lg:text-lg font-semibold text-gray-900 mb-4 lg:mb-6">
            Tổng đơn hàng
          </h2>

          <div className="space-y-2 lg:space-y-3">
            {/* Subtotal */}
            <div className="flex items-center justify-between text-sm lg:text-base">
              <span className="text-gray-600">Tạm tính</span>
              <span className="font-medium text-gray-900">
                {formatVietnamPrice(subtotal)}
              </span>
            </div>

            {/* Shipping Fee */}
            <div className="flex items-center justify-between text-sm lg:text-base">
              <span className="text-gray-600">Phí vận chuyển</span>
              <span className="font-medium text-green-600">
                {shippingFee === 0 ? 'Miễn phí' : formatVietnamPrice(shippingFee)}
              </span>
            </div>

            {/* Total */}
            <div className="pt-3 lg:pt-4 border-t border-gray-200 flex items-center justify-between">
              <span className="text-base lg:text-lg font-semibold text-gray-900">Tổng cộng</span>
              <span className="text-xl lg:text-2xl font-bold text-red-600">
                {formatVietnamPrice(order.totalAmount)}
              </span>
            </div>
          </div>
        </div>

        {/* Shipping Info */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 lg:p-5">
          <p className="text-sm lg:text-base text-green-700 text-center">
            🚚 Đơn hàng của bạn đang được xử lý và sẽ sớm được giao đến bạn
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 lg:gap-4 pt-2 lg:pt-4">
          <Button
            onClick={handleGoHome}
            variant="outline"
            className="flex-1 py-3 lg:py-4 rounded-lg font-medium text-sm lg:text-base border-gray-300 hover:bg-gray-50"
          >
            <Home className="h-4 w-4 lg:h-5 lg:w-5 mr-2" />
            Về trang chủ
          </Button>
          <Button
            onClick={handleGoHome}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 lg:py-4 rounded-lg font-medium text-sm lg:text-base"
          >
            <ShoppingBag className="h-4 w-4 lg:h-5 lg:w-5 mr-2" />
            Tiếp tục mua sắm
          </Button>
        </div>
      </div>
    </div>
  );
}
