'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ShoppingCart, Trash2, Plus, Minus } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { formatVietnamPrice } from '@/utils/currency';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

export default function CartPage() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const { cartItems, updateQuantity, removeFromCart, getCartTotal } = useCart();
  const [selectedItems, setSelectedItems] = useState<Set<string>>(
    new Set(cartItems.map(item => item.product_id))
  );

  const handleNavigateBack = () => {
    router.push('/');
  };

  const handleCheckout = () => {
    if (cartItems.length > 0) {
      router.push('/checkout');
    }
  };

  const handleQuantityDecrease = (productId: string, currentQuantity: number) => {
    if (currentQuantity > 1) {
      updateQuantity(productId, currentQuantity - 1);
    }
  };

  const handleQuantityIncrease = (productId: string, currentQuantity: number) => {
    updateQuantity(productId, currentQuantity + 1);
  };

  const handleRemoveItem = (productId: string) => {
    removeFromCart(productId);
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(productId);
      return newSet;
    });
  };

  const toggleItemSelection = (productId: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const calculateItemSubtotal = (price: number, quantity: number) => {
    return price * quantity;
  };

  return (
    <div className="min-h-screen bg-gray-50 lg:bg-gray-100 pb-24 lg:pb-8">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 lg:px-12 py-3 lg:py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={handleNavigateBack}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Quay lại"
            >
              <ArrowLeft className="h-5 w-5 lg:h-6 lg:w-6 text-gray-700" />
            </button>
            <h1 className="text-lg lg:text-2xl font-semibold text-gray-900">
              Giỏ Hàng
              {cartItems.length > 0 && (
                <span className="ml-2 text-sm lg:text-base font-normal text-gray-500">
                  ({cartItems.length} sản phẩm)
                </span>
              )}
            </h1>
          </div>
        </div>
      </div>

      {/* Empty Cart State */}
      {cartItems.length === 0 ? (
        <div className="max-w-7xl mx-auto px-4 lg:px-12 py-6">
          <div className="flex flex-col items-center justify-center px-6 py-16 lg:py-32">
            <div className="w-32 h-32 lg:w-48 lg:h-48 mb-6 lg:mb-8 bg-gray-100 rounded-full flex items-center justify-center">
              <ShoppingCart className="h-16 w-16 lg:h-24 lg:w-24 text-gray-300" />
            </div>
            <h2 className="text-xl lg:text-3xl font-medium text-gray-900 mb-2 lg:mb-4">
              Giỏ hàng trống
            </h2>
            <p className="text-gray-500 lg:text-lg text-center mb-6 lg:mb-8">
              Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm
            </p>
            <Button
              onClick={handleNavigateBack}
              className="bg-green-600 hover:bg-green-700 text-white px-8 lg:px-12 py-3 lg:py-4 rounded-lg font-medium text-base lg:text-lg"
            >
              Tiếp tục mua sắm
            </Button>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 lg:px-12 py-4 lg:py-6">
          <div className="lg:flex lg:gap-6">
            {/* Cart Items Section - Desktop: 2/3 width, Mobile: Full width */}
            <div className="lg:flex-1">
              {/* Desktop: Table Header */}
              <div className="hidden lg:block bg-white rounded-t-lg border border-gray-200 px-6 py-4">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-4 flex-1">
                    <input
                      type="checkbox"
                      checked={selectedItems.size === cartItems.length}
                      onChange={() => {
                        if (selectedItems.size === cartItems.length) {
                          setSelectedItems(new Set());
                        } else {
                          setSelectedItems(new Set(cartItems.map(item => item.product_id)));
                        }
                      }}
                      className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
                      aria-label="Chọn tất cả"
                    />
                    <span className="text-sm font-medium text-gray-700">Sản phẩm</span>
                  </div>
                  <div className="w-32 text-center text-sm font-medium text-gray-700">Đơn giá</div>
                  <div className="w-32 text-center text-sm font-medium text-gray-700">Số lượng</div>
                  <div className="w-32 text-center text-sm font-medium text-gray-700">Thành tiền</div>
                  <div className="w-16 text-center text-sm font-medium text-gray-700">Xóa</div>
                </div>
              </div>

              {/* Cart Items List */}
              <div className="space-y-3 lg:space-y-0">
                {cartItems.map((item, index) => (
                  <div
                    key={item.id}
                    className={`bg-white rounded-lg lg:rounded-none shadow-sm border border-gray-200 lg:border-t-0 p-4 lg:px-6 lg:py-6 ${
                      index === cartItems.length - 1 ? 'lg:rounded-b-lg' : ''
                    }`}
                  >
                    {/* Mobile Layout */}
                    <div className="flex gap-3 lg:hidden">
                      <div className="flex-shrink-0 pt-1">
                        <input
                          type="checkbox"
                          checked={selectedItems.has(item.product_id)}
                          onChange={() => toggleItemSelection(item.product_id)}
                          className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
                          aria-label={`Chọn ${item.name}`}
                        />
                      </div>

                      <div className="flex-shrink-0">
                        <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ShoppingCart className="h-8 w-8 text-gray-300" />
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">
                          {item.name}
                        </h3>

                        <div className="text-base font-semibold text-red-600 mb-3">
                          {formatVietnamPrice(item.price)}
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleQuantityDecrease(item.product_id, item.quantity)}
                              disabled={item.quantity <= 1}
                              className={`w-8 h-8 flex items-center justify-center border rounded ${
                                item.quantity <= 1
                                  ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                                  : 'border-gray-300 text-gray-700 hover:bg-gray-50 active:bg-gray-100'
                              }`}
                              aria-label="Giảm số lượng"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            
                            <span className="w-12 text-center text-sm font-medium text-gray-900">
                              {item.quantity}
                            </span>
                            
                            <button
                              onClick={() => handleQuantityIncrease(item.product_id, item.quantity)}
                              className="w-8 h-8 flex items-center justify-center border border-gray-300 text-gray-700 rounded hover:bg-gray-50 active:bg-gray-100"
                              aria-label="Tăng số lượng"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>

                          <button
                            onClick={() => handleRemoveItem(item.product_id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            aria-label="Xóa sản phẩm"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>

                        <div className="mt-2 pt-2 border-t border-gray-100">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">Tạm tính:</span>
                            <span className="text-sm font-semibold text-gray-900">
                              {formatVietnamPrice(calculateItemSubtotal(item.price, item.quantity))}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Desktop Layout */}
                    <div className="hidden lg:flex lg:items-center lg:gap-6">
                      <div className="flex items-center gap-4 flex-1">
                        <input
                          type="checkbox"
                          checked={selectedItems.has(item.product_id)}
                          onChange={() => toggleItemSelection(item.product_id)}
                          className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
                          aria-label={`Chọn ${item.name}`}
                        />
                        
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ShoppingCart className="h-10 w-10 text-gray-300" />
                              </div>
                            )}
                          </div>
                          
                          <h3 className="text-base font-medium text-gray-900 line-clamp-2 flex-1">
                            {item.name}
                          </h3>
                        </div>
                      </div>

                      <div className="w-32 text-center">
                        <span className="text-base font-semibold text-gray-900">
                          {formatVietnamPrice(item.price)}
                        </span>
                      </div>

                      <div className="w-32 flex justify-center">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleQuantityDecrease(item.product_id, item.quantity)}
                            disabled={item.quantity <= 1}
                            className={`w-8 h-8 flex items-center justify-center border rounded ${
                              item.quantity <= 1
                                ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                                : 'border-gray-300 text-gray-700 hover:bg-gray-50 active:bg-gray-100'
                            }`}
                            aria-label="Giảm số lượng"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          
                          <span className="w-12 text-center text-sm font-medium text-gray-900">
                            {item.quantity}
                          </span>
                          
                          <button
                            onClick={() => handleQuantityIncrease(item.product_id, item.quantity)}
                            className="w-8 h-8 flex items-center justify-center border border-gray-300 text-gray-700 rounded hover:bg-gray-50 active:bg-gray-100"
                            aria-label="Tăng số lượng"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="w-32 text-center">
                        <span className="text-lg font-bold text-red-600">
                          {formatVietnamPrice(calculateItemSubtotal(item.price, item.quantity))}
                        </span>
                      </div>

                      <div className="w-16 flex justify-center">
                        <button
                          onClick={() => handleRemoveItem(item.product_id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          aria-label="Xóa sản phẩm"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Shipping & Promotion Section - Mobile */}
              <div className="px-4 py-3 bg-white border-y border-gray-200 mt-4 lg:hidden">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">🚚 Miễn phí vận chuyển</span>
                  <span className="text-green-600 font-medium">Đơn hàng từ 0đ</span>
                </div>
              </div>
            </div>

            {/* Summary Section - Desktop: Sidebar, Mobile: Sticky Bottom */}
            {!isMobile && cartItems.length > 0 && (
              <div className="lg:w-96 lg:flex-shrink-0">
                <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-24">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Tóm tắt đơn hàng</h2>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Tạm tính ({selectedItems.size} sản phẩm)</span>
                      <span className="font-medium text-gray-900">{formatVietnamPrice(getCartTotal())}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Phí vận chuyển</span>
                      <span className="font-medium text-green-600">Miễn phí</span>
                    </div>
                    
                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-base font-semibold text-gray-900">Tổng cộng</span>
                        <span className="text-2xl font-bold text-red-600">{formatVietnamPrice(getCartTotal())}</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleCheckout}
                    disabled={selectedItems.size === 0}
                    className={`w-full py-4 rounded-lg font-semibold text-base transition-colors ${
                      selectedItems.size === 0
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700 text-white active:bg-green-800'
                    }`}
                  >
                    Thanh Toán ({selectedItems.size})
                  </Button>

                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex items-start gap-2 text-sm text-gray-600">
                      <span>🚚</span>
                      <span>Miễn phí vận chuyển cho đơn hàng từ 0đ</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sticky Bottom Bar - Mobile Only */}
      {isMobile && cartItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedItems.size === cartItems.length}
                  onChange={() => {
                    if (selectedItems.size === cartItems.length) {
                      setSelectedItems(new Set());
                    } else {
                      setSelectedItems(new Set(cartItems.map(item => item.product_id)));
                    }
                  }}
                  className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
                  aria-label="Chọn tất cả"
                />
                <span className="text-sm text-gray-700">
                  Tất cả ({cartItems.length})
                </span>
              </div>
              
              <div className="text-right">
                <div className="text-xs text-gray-500 mb-1">Tổng cộng</div>
                <div className="text-xl font-bold text-red-600">
                  {formatVietnamPrice(getCartTotal())}
                </div>
              </div>
            </div>

            <Button
              onClick={handleCheckout}
              disabled={cartItems.length === 0}
              className={`w-full py-3 rounded-lg font-semibold text-base transition-colors ${
                cartItems.length === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white active:bg-green-800'
              }`}
            >
              Thanh Toán ({selectedItems.size})
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
