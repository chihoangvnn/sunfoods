'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ChevronDown, ChevronUp, ShoppingCart, PackageCheck } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { formatVietnamPrice } from '@/utils/currency';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

interface CustomerFormData {
  fullName: string;
  phoneNumber: string;
  address: string;
  notes: string;
}

interface FormErrors {
  fullName?: string;
  phoneNumber?: string;
  address?: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const [formData, setFormData] = useState<CustomerFormData>({
    fullName: '',
    phoneNumber: '',
    address: '',
    notes: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isOrderSummaryExpanded, setIsOrderSummaryExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const shippingFee = 0;
  const subtotal = getCartTotal();
  const total = subtotal + shippingFee;

  const validatePhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^0\d{9}$/;
    return phoneRegex.test(phone);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Vui lòng nhập họ và tên';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Vui lòng nhập số điện thoại';
    } else if (!validatePhoneNumber(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Số điện thoại không hợp lệ (10 số, bắt đầu bằng 0)';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Vui lòng nhập địa chỉ giao hàng';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof CustomerFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    if (cartItems.length === 0) {
      toast({
        title: '❌ Lỗi',
        description: 'Giỏ hàng trống. Vui lòng thêm sản phẩm trước khi đặt hàng.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const orderData = {
        customerName: formData.fullName,
        customerPhone: formData.phoneNumber,
        customerAddress: formData.address,
        customerNotes: formData.notes || undefined,
        totalAmount: total,
        items: cartItems.map(item => ({
          product_id: item.product_id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image
        }))
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast({
          title: '✅ Đặt hàng thành công!',
          description: 'Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đang được xử lý.',
          variant: 'default',
        });

        clearCart();

        setFormData({
          fullName: '',
          phoneNumber: '',
          address: '',
          notes: ''
        });

        router.push(`/order/${result.orderId}`);
      } else {
        toast({
          title: '❌ Đặt hàng thất bại',
          description: result.error || 'Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Order submission error:', error);
      toast({
        title: '❌ Lỗi kết nối',
        description: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNavigateBack = () => {
    router.push('/cart');
  };

  const OrderSummaryContent = () => (
    <>
      {/* Cart Items */}
      <div className="px-4 lg:px-6 py-3 lg:py-4 space-y-3 max-h-64 lg:max-h-96 overflow-y-auto">
        {cartItems.map((item) => (
          <div key={item.id} className="flex gap-3 py-2">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 lg:w-20 lg:h-20 bg-tramhuong-accent/5 rounded-lg overflow-hidden">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingCart className="h-6 w-6 text-tramhuong-primary/30" />
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-sm lg:text-base font-playfair font-medium text-tramhuong-primary line-clamp-2 mb-1">
                {item.name}
              </h3>
              <div className="flex items-center justify-between">
                <span className="text-xs lg:text-sm text-tramhuong-primary/60">
                  SL: {item.quantity}
                </span>
                <span className="text-sm lg:text-base font-semibold text-tramhuong-accent">
                  {formatVietnamPrice(item.price * item.quantity)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Price Summary */}
      <div className="border-t border-tramhuong-accent/20 px-4 lg:px-6 py-3 lg:py-4 space-y-2 lg:space-y-3">
        <div className="flex items-center justify-between text-sm lg:text-base">
          <span className="text-tramhuong-primary/70">Tạm tính</span>
          <span className="font-medium text-tramhuong-accent">
            {formatVietnamPrice(subtotal)}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm lg:text-base">
          <span className="text-tramhuong-primary/70">Phí vận chuyển</span>
          <span className="font-medium text-tramhuong-accent">
            {shippingFee === 0 ? 'Miễn phí' : formatVietnamPrice(shippingFee)}
          </span>
        </div>
        <div className="pt-2 border-t border-tramhuong-accent/20 flex items-center justify-between">
          <span className="text-base lg:text-lg font-semibold text-tramhuong-primary">Tổng cộng</span>
          <span className="text-lg lg:text-2xl font-bold text-tramhuong-accent">
            {formatVietnamPrice(total)}
          </span>
        </div>
      </div>
    </>
  );

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-tramhuong-primary/5 via-white to-tramhuong-accent/5 flex flex-col">
        <div className="sticky top-0 z-50 bg-white/60 backdrop-blur-md border-b border-tramhuong-accent/20 shadow-[0_4px_16px_rgba(193,168,117,0.2)]">
          <div className="flex items-center gap-3 px-4 py-3">
            <button
              onClick={() => router.push('/')}
              className="p-2 hover:bg-tramhuong-accent/10 rounded-full transition-all duration-300"
              aria-label="Quay lại"
            >
              <ArrowLeft className="h-5 w-5 text-tramhuong-primary" />
            </button>
            <h1 className="text-lg font-playfair font-semibold text-tramhuong-primary">Thanh Toán</h1>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center flex-1 px-6 py-16">
          <div className="w-32 h-32 mb-6 bg-tramhuong-accent/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-tramhuong-accent/20">
            <ShoppingCart className="h-16 w-16 text-tramhuong-accent/40" />
          </div>
          <h2 className="text-xl font-playfair font-medium text-tramhuong-primary mb-2">
            Giỏ hàng trống
          </h2>
          <p className="text-tramhuong-primary/60 text-center mb-6">
            Vui lòng thêm sản phẩm vào giỏ hàng để tiếp tục thanh toán
          </p>
          <Button
            onClick={() => router.push('/')}
            className="bg-gradient-to-r from-tramhuong-primary to-tramhuong-accent text-white px-8 py-3 rounded-lg font-medium shadow-[0_4px_16px_rgba(193,168,117,0.4)] hover:shadow-[0_6px_24px_rgba(193,168,117,0.5)] transition-all duration-300"
          >
            Về trang chủ
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-tramhuong-primary/5 via-white to-tramhuong-accent/5 lg:pb-8 pb-32">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-white/60 backdrop-blur-md border-b border-tramhuong-accent/20 shadow-[0_4px_16px_rgba(193,168,117,0.2)]">
        <div className="max-w-7xl mx-auto flex items-center gap-3 px-4 lg:px-12 py-3 lg:py-4">
          <button
            onClick={handleNavigateBack}
            className="p-2 hover:bg-tramhuong-accent/10 rounded-full transition-all duration-300"
            aria-label="Quay lại giỏ hàng"
          >
            <ArrowLeft className="h-5 w-5 text-tramhuong-primary" />
          </button>
          <h1 className="text-lg lg:text-2xl font-playfair font-semibold text-tramhuong-primary">Thanh Toán</h1>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 lg:px-12 py-4 lg:py-6">
        {/* Desktop 2-Column Layout / Mobile Stacked */}
        <div className="lg:grid lg:grid-cols-3 lg:gap-6 space-y-4 lg:space-y-0">
          {/* Left Column - Customer Information Form (2/3 width on desktop) */}
          <div className="lg:col-span-2 space-y-4 lg:space-y-6">
            <div className="bg-white/60 backdrop-blur-md rounded-lg shadow-[0_4px_16px_rgba(193,168,117,0.2)] border border-tramhuong-accent/30 p-4 lg:p-6">
              <h2 className="text-base lg:text-xl font-playfair font-semibold text-tramhuong-primary mb-4 lg:mb-6">
                Thông tin người nhận
              </h2>

              <div className="space-y-4 lg:space-y-5">
                {/* Full Name */}
                <div>
                  <label htmlFor="fullName" className="block text-sm lg:text-base font-medium text-tramhuong-primary mb-1.5 lg:mb-2">
                    Họ và tên <span className="text-tramhuong-accent">*</span>
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    placeholder="Nhập họ và tên"
                    className={`w-full px-3 lg:px-4 py-2 lg:py-3 text-sm lg:text-base border rounded-lg focus:outline-none focus:ring-2 ${
                      errors.fullName
                        ? 'border-tramhuong-accent/60 focus:ring-tramhuong-accent/30'
                        : 'border-tramhuong-accent/30 focus:ring-tramhuong-accent/30'
                    }`}
                  />
                  {errors.fullName && (
                    <p className="mt-1 text-xs lg:text-sm text-tramhuong-accent">{errors.fullName}</p>
                  )}
                </div>

                {/* Phone Number */}
                <div>
                  <label htmlFor="phoneNumber" className="block text-sm lg:text-base font-medium text-tramhuong-primary mb-1.5 lg:mb-2">
                    Số điện thoại <span className="text-tramhuong-accent">*</span>
                  </label>
                  <input
                    id="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    placeholder="Nhập số điện thoại (10 số)"
                    className={`w-full px-3 lg:px-4 py-2 lg:py-3 text-sm lg:text-base border rounded-lg focus:outline-none focus:ring-2 ${
                      errors.phoneNumber
                        ? 'border-tramhuong-accent/60 focus:ring-tramhuong-accent/30'
                        : 'border-tramhuong-accent/30 focus:ring-tramhuong-accent/30'
                    }`}
                  />
                  {errors.phoneNumber && (
                    <p className="mt-1 text-xs lg:text-sm text-tramhuong-accent">{errors.phoneNumber}</p>
                  )}
                </div>

                {/* Address */}
                <div>
                  <label htmlFor="address" className="block text-sm lg:text-base font-medium text-tramhuong-primary mb-1.5 lg:mb-2">
                    Địa chỉ giao hàng <span className="text-tramhuong-accent">*</span>
                  </label>
                  <textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Nhập địa chỉ chi tiết (số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố)"
                    rows={3}
                    className={`w-full px-3 lg:px-4 py-2 lg:py-3 text-sm lg:text-base border rounded-lg focus:outline-none focus:ring-2 resize-none ${
                      errors.address
                        ? 'border-tramhuong-accent/60 focus:ring-tramhuong-accent/30'
                        : 'border-tramhuong-accent/30 focus:ring-tramhuong-accent/30'
                    }`}
                  />
                  {errors.address && (
                    <p className="mt-1 text-xs lg:text-sm text-tramhuong-accent">{errors.address}</p>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <label htmlFor="notes" className="block text-sm lg:text-base font-medium text-tramhuong-primary mb-1.5 lg:mb-2">
                    Ghi chú đơn hàng
                  </label>
                  <textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Ghi chú thêm về đơn hàng (tùy chọn)"
                    rows={2}
                    className="w-full px-3 lg:px-4 py-2 lg:py-3 text-sm lg:text-base border border-tramhuong-accent/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-tramhuong-accent/30 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Shipping Info */}
            <div className="bg-tramhuong-accent/5 backdrop-blur-sm border border-tramhuong-accent/20 rounded-lg p-3 lg:p-4">
              <p className="text-sm lg:text-base text-tramhuong-primary">
                🚚 <strong>Miễn phí vận chuyển</strong> cho tất cả đơn hàng
              </p>
            </div>
          </div>

          {/* Right Column - Order Summary (1/3 width on desktop, sticky) */}
          <div className="lg:col-span-1">
            {/* Mobile: Collapsible Accordion */}
            {isMobile ? (
              <div className="bg-white/60 backdrop-blur-md rounded-lg shadow-[0_4px_16px_rgba(193,168,117,0.2)] border border-tramhuong-accent/30">
                <button
                  onClick={() => setIsOrderSummaryExpanded(!isOrderSummaryExpanded)}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-tramhuong-accent/5 transition-all duration-300"
                >
                  <div className="flex items-center gap-2">
                    <PackageCheck className="h-5 w-5 text-tramhuong-accent" />
                    <h2 className="text-base font-semibold text-tramhuong-primary">
                      Đơn hàng ({cartItems.length} sản phẩm)
                    </h2>
                  </div>
                  {isOrderSummaryExpanded ? (
                    <ChevronUp className="h-5 w-5 text-tramhuong-primary/60" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-tramhuong-primary/60" />
                  )}
                </button>

                {isOrderSummaryExpanded && (
                  <div className="border-t border-tramhuong-accent/20">
                    <OrderSummaryContent />
                  </div>
                )}

                {!isOrderSummaryExpanded && (
                  <div className="px-4 pb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-tramhuong-primary/70">Tổng cộng</span>
                      <span className="text-lg font-bold text-tramhuong-accent">
                        {formatVietnamPrice(total)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Desktop: Sticky Sidebar */
              <div className="lg:sticky lg:top-24">
                <div className="bg-white/60 backdrop-blur-md rounded-lg shadow-[0_4px_16px_rgba(193,168,117,0.2)] border border-tramhuong-accent/30">
                  <div className="px-6 py-4 border-b border-tramhuong-accent/20">
                    <div className="flex items-center gap-2">
                      <PackageCheck className="h-6 w-6 text-tramhuong-accent" />
                      <h2 className="text-xl font-playfair font-semibold text-tramhuong-primary">
                        Đơn hàng ({cartItems.length} sản phẩm)
                      </h2>
                    </div>
                  </div>

                  <OrderSummaryContent />

                  {/* Desktop Place Order Button */}
                  <div className="border-t border-tramhuong-accent/20 px-6 py-4">
                    <Button
                      onClick={handleSubmit}
                      disabled={isSubmitting || cartItems.length === 0}
                      className={`w-full py-3 rounded-lg font-semibold text-base transition-colors ${
                        isSubmitting || cartItems.length === 0
                          ? 'bg-tramhuong-accent/30 text-tramhuong-primary/50 cursor-not-allowed'
                          : 'bg-gradient-to-r from-tramhuong-primary to-tramhuong-accent text-white shadow-[0_4px_16px_rgba(193,168,117,0.4)] hover:shadow-[0_6px_24px_rgba(193,168,117,0.5)] transition-all duration-300'
                      }`}
                    >
                      {isSubmitting ? 'Đang xử lý...' : 'Đặt Hàng'}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile: Sticky Bottom Action Bar */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-tramhuong-accent/30 shadow-[0_-4px_16px_rgba(193,168,117,0.3)] z-50">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-tramhuong-primary/70">Tổng thanh toán</span>
              <span className="text-xl font-bold text-tramhuong-accent">
                {formatVietnamPrice(total)}
              </span>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || cartItems.length === 0}
              className={`w-full py-3 rounded-lg font-semibold text-base transition-colors ${
                isSubmitting || cartItems.length === 0
                  ? 'bg-tramhuong-accent/30 text-tramhuong-primary/50 cursor-not-allowed'
                  : 'bg-gradient-to-r from-tramhuong-primary to-tramhuong-accent text-white shadow-[0_4px_16px_rgba(193,168,117,0.4)] hover:shadow-[0_6px_24px_rgba(193,168,117,0.5)] transition-all duration-300'
              }`}
            >
              {isSubmitting ? 'Đang xử lý...' : 'Đặt Hàng'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
