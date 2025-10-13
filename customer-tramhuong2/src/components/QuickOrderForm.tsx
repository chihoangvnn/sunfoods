'use client';

import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { ChevronDown, ChevronUp, Phone, Package, MapPin, X } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import CountdownTimer from './CountdownTimer';

interface QuickOrderFormProps {
  dealSlug: string;
  dealPrice: number;
  productName: string;
  productImage?: string;
  dealType?: string;
  dealEndTime?: string;
  onSuccess?: () => void;
}

export default function QuickOrderForm({ 
  dealSlug, 
  dealPrice, 
  productName,
  productImage,
  dealType,
  dealEndTime,
  onSuccess 
}: QuickOrderFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddressOpen, setIsAddressOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const phoneInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    customerPhone: '',
    customerAddress: '',
    customerName: '',
    quantity: 1,
    notes: '',
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/auth/user');
        if (response.ok) {
          const userData = await response.json();
          if (userData) {
            setFormData(prev => ({
              ...prev,
              customerName: userData.firstName && userData.lastName 
                ? `${userData.firstName} ${userData.lastName}` 
                : userData.firstName || '',
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    if (isExpanded) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => {
        phoneInputRef.current?.focus();
      }, 300);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isExpanded]);

  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isExpanded) {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [isExpanded]);

  const handleOpen = () => {
    setIsExpanded(true);
  };

  const handleClose = () => {
    setIsExpanded(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.customerPhone) {
      toast.error('Vui lòng nhập số điện thoại');
      return;
    }

    if (formData.quantity < 1) {
      toast.error('Số lượng phải lớn hơn 0');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/deals/${dealSlug}/order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          customerAddress: formData.customerAddress || 'Sẽ cập nhật qua điện thoại',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || 'Đặt hàng thành công!', {
          description: `Đơn hàng #${data.order.id.substring(0, 8)} - Tổng tiền: ${(formData.quantity * dealPrice).toLocaleString('en-US')}₫`,
          duration: 5000,
        });
        
        setFormData({
          customerPhone: '',
          customerAddress: '',
          customerName: '',
          quantity: 1,
          notes: '',
        });

        handleClose();

        if (onSuccess) {
          onSuccess();
        }
      } else {
        toast.error(data.error || 'Có lỗi xảy ra khi đặt hàng');
      }
    } catch (error) {
      console.error('Order submission error:', error);
      toast.error('Không thể kết nối đến server. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalAmount = formData.quantity * dealPrice;

  const incrementQuantity = () => {
    setFormData({ ...formData, quantity: formData.quantity + 1 });
  };

  const decrementQuantity = () => {
    setFormData({ ...formData, quantity: Math.max(1, formData.quantity - 1) });
  };

  return (
    <>
      {/* MOBILE: Collapsed View (Default) */}
      <div className="lg:hidden">
        {!isExpanded && (
          <div className="bg-white border-t-2 border-gray-200">
            <div className="flex items-center justify-between px-4 py-3 gap-4">
              <div className="flex-1 min-w-0">
                <div className="text-2xl font-bold text-red-600 mb-1">
                  {dealPrice.toLocaleString('vi-VN')}₫
                </div>
                {dealType === 'flash_sale' && dealEndTime && (
                  <div className="text-xs text-gray-600">
                    <CountdownTimer targetDate={dealEndTime} />
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={handleOpen}
                className="flex-shrink-0 bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-bold text-base shadow-lg active:scale-95 transition-all min-h-[48px]"
              >
                ĐẶT HÀNG NGAY
              </button>
            </div>
          </div>
        )}

        {/* Backdrop */}
        {isExpanded && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
            onClick={handleClose}
          />
        )}

        {/* MOBILE: Expanded Bottom Sheet */}
        <div 
          className={`fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl z-50 max-h-[70vh] flex flex-col transition-transform duration-300 ease-out ${
            isExpanded ? 'translate-y-0' : 'translate-y-full'
          }`}
        >
          {/* Product Header */}
          <div className="flex items-center gap-3 p-4 border-b flex-shrink-0">
            {productImage && (
              <img 
                src={productImage} 
                alt={productName}
                className="w-16 h-16 object-cover rounded flex-shrink-0"
              />
            )}
            <h3 className="font-medium text-base flex-1 line-clamp-2">{productName}</h3>
            <button
              type="button"
              onClick={handleClose}
              className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Form Content (Scrollable) */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
            <div className="px-4 py-4 space-y-4">
              {/* Phone Number - Primary Field */}
              <div>
                <label htmlFor="customerPhone" className="block text-sm font-medium mb-2 text-gray-700">
                  <Phone className="inline h-4 w-4 mr-1" />
                  Số điện thoại <span className="text-red-500">*</span>
                </label>
                <input
                  ref={phoneInputRef}
                  type="tel"
                  id="customerPhone"
                  required
                  placeholder="Nhập số điện thoại của bạn"
                  value={formData.customerPhone}
                  onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                  className="w-full px-4 py-4 text-lg border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Quantity Selector - Large Touch-Friendly */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  <Package className="inline h-4 w-4 mr-1" />
                  Số lượng <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={decrementQuantity}
                    className="flex-shrink-0 w-12 h-12 flex items-center justify-center border-2 border-gray-300 rounded-xl hover:bg-gray-50 active:scale-95 transition-all text-xl font-bold text-gray-700"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    id="quantity"
                    required
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                    className="flex-1 text-center px-4 py-3 text-xl font-bold border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={incrementQuantity}
                    className="flex-shrink-0 w-12 h-12 flex items-center justify-center border-2 border-gray-300 rounded-xl hover:bg-gray-50 active:scale-95 transition-all text-xl font-bold text-gray-700"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Collapsible Address Section - Optional */}
              <Collapsible open={isAddressOpen} onOpenChange={setIsAddressOpen}>
                <CollapsibleTrigger asChild>
                  <button
                    type="button"
                    className="w-full flex items-center justify-between py-3 px-4 border-2 border-dashed border-gray-300 rounded-xl hover:bg-gray-50 transition-all"
                  >
                    <span className="flex items-center text-sm font-medium text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      Thêm địa chỉ giao hàng (Tùy chọn)
                    </span>
                    {isAddressOpen ? (
                      <ChevronUp className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-3 space-y-3">
                  <textarea
                    id="customerAddress"
                    placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
                    value={formData.customerAddress}
                    onChange={(e) => setFormData({ ...formData, customerAddress: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    id="customerName"
                    placeholder="Tên người nhận (Tùy chọn)"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </CollapsibleContent>
              </Collapsible>
            </div>

            {/* Price Summary & Submit Button (Sticky) */}
            <div className="sticky bottom-0 bg-white border-t-4 border-gray-100">
              {/* Price Summary */}
              <div className="px-4 py-3 bg-orange-50 border-b border-orange-200">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-xs text-gray-600">Tổng thanh toán</div>
                    <div className="text-xs text-gray-500">
                      {formData.quantity} sản phẩm
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-orange-600">
                      {totalAmount.toLocaleString('en-US')}₫
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="px-4 pb-4 pt-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-4 px-6 rounded-xl text-lg shadow-lg active:scale-[0.98] transition-all duration-200 min-h-[56px]"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      ĐANG XỬ LÝ...
                    </span>
                  ) : (
                    'XÁC NHẬN ĐẶT HÀNG'
                  )}
                </button>
                <p className="text-xs text-gray-500 text-center mt-2">
                  Nhân viên sẽ gọi xác nhận đơn hàng
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* DESKTOP: Original Form Layout */}
      <form onSubmit={handleSubmit} className="bg-white hidden lg:block">
        {/* Form Fields */}
        <div className="px-4 py-4 space-y-4">
          {/* Phone Number - Primary Field */}
          <div>
            <label htmlFor="customerPhone-desktop" className="block text-sm font-medium mb-2 text-gray-700">
              <Phone className="inline h-4 w-4 mr-1" />
              Số điện thoại <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              id="customerPhone-desktop"
              required
              placeholder="Nhập số điện thoại của bạn"
              value={formData.customerPhone}
              onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
              className="w-full px-4 py-4 text-lg border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Quantity Selector - Large Touch-Friendly */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              <Package className="inline h-4 w-4 mr-1" />
              Số lượng <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={decrementQuantity}
                className="flex-shrink-0 w-12 h-12 flex items-center justify-center border-2 border-gray-300 rounded-xl hover:bg-gray-50 active:scale-95 transition-all text-xl font-bold text-gray-700"
              >
                -
              </button>
              <input
                type="number"
                id="quantity-desktop"
                required
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                className="flex-1 text-center px-4 py-3 text-xl font-bold border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={incrementQuantity}
                className="flex-shrink-0 w-12 h-12 flex items-center justify-center border-2 border-gray-300 rounded-xl hover:bg-gray-50 active:scale-95 transition-all text-xl font-bold text-gray-700"
              >
                +
              </button>
            </div>
          </div>

          {/* Collapsible Address Section - Optional */}
          <Collapsible open={isAddressOpen} onOpenChange={setIsAddressOpen}>
            <CollapsibleTrigger asChild>
              <button
                type="button"
                className="w-full flex items-center justify-between py-3 px-4 border-2 border-dashed border-gray-300 rounded-xl hover:bg-gray-50 transition-all"
              >
                <span className="flex items-center text-sm font-medium text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  Thêm địa chỉ giao hàng (Tùy chọn)
                </span>
                {isAddressOpen ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-3 space-y-3">
              <textarea
                id="customerAddress-desktop"
                placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
                value={formData.customerAddress}
                onChange={(e) => setFormData({ ...formData, customerAddress: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <input
                type="text"
                id="customerName-desktop"
                placeholder="Tên người nhận (Tùy chọn)"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Price Summary & Order Button */}
        <div className="border-t-4 border-gray-100">
          {/* Price Summary */}
          <div className="px-4 py-3 bg-orange-50 border-b border-orange-200">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-xs text-gray-600">Tổng thanh toán</div>
                <div className="text-xs text-gray-500">
                  {formData.quantity} sản phẩm
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-orange-600">
                  {totalAmount.toLocaleString('en-US')}₫
                </div>
              </div>
            </div>
          </div>

          {/* Order Button */}
          <div className="px-4 pb-4 pt-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-4 px-6 rounded-xl text-lg shadow-lg active:scale-[0.98] transition-all duration-200 min-h-[56px]"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  ĐANG XỬ LÝ...
                </span>
              ) : (
                'ĐẶT HÀNG NGAY'
              )}
            </button>
            <p className="text-xs text-gray-500 text-center mt-2">
              Nhân viên sẽ gọi xác nhận đơn hàng
            </p>
          </div>
        </div>
      </form>
    </>
  );
}
