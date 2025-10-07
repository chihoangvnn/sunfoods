'use client'

import { useState, useEffect } from 'react';
import { affiliateService, type AffiliateProduct, type QuickOrderData } from '@/services/affiliateService';
import { Search, ShoppingCart, DollarSign, Package, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface QuickOrderClientProps {
  initialData: {
    products: AffiliateProduct[];
  };
}

function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}

export default function QuickOrderClient({ initialData }: QuickOrderClientProps) {
  const [products, setProducts] = useState<AffiliateProduct[]>(initialData.products.filter(p => p.stockStatus === 'in_stock'));
  const [selectedProduct, setSelectedProduct] = useState<AffiliateProduct | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [customerData, setCustomerData] = useState({
    name: '',
    phone: '',
    address: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function loadProducts(search?: string) {
    try {
      setError(null);
      const data = await affiliateService.getProducts({
        search: search || '',
        limit: 50
      });
      setProducts(data.products.filter(p => p.stockStatus === 'in_stock'));
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Lỗi tải dữ liệu';
      setError(errorMsg);
      console.error('Error loading products:', err);
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadProducts(searchQuery);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProduct) {
      alert('Vui lòng chọn sản phẩm');
      return;
    }

    if (!customerData.name || !customerData.phone || !customerData.address) {
      alert('Vui lòng điền đầy đủ thông tin khách hàng');
      return;
    }

    if (quantity > selectedProduct.stock) {
      alert(`Số lượng vượt quá tồn kho! Chỉ còn ${selectedProduct.stock} sản phẩm.`);
      return;
    }

    if (quantity < 1) {
      alert('Số lượng phải lớn hơn 0');
      return;
    }

    try {
      setSubmitting(true);
      const orderData: QuickOrderData = {
        customerPhone: customerData.phone,
        customerName: customerData.name,
        customerAddress: customerData.address,
        productId: selectedProduct.id,
        quantity
      };

      const result = await affiliateService.createQuickOrder(orderData);
      
      setSuccessMessage(
        `✅ Đơn hàng #${result.orderId} đã được tạo thành công!\n` +
        `Hoa hồng của bạn: ${formatVND(result.commission)}`
      );

      setCustomerData({ name: '', phone: '', address: '' });
      setSelectedProduct(null);
      setQuantity(1);
      
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      alert('Lỗi tạo đơn hàng. Vui lòng thử lại.');
      console.error('Error creating order:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const totalAmount = selectedProduct ? selectedProduct.price * quantity : 0;
  const commission = selectedProduct ? selectedProduct.commission * quantity : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Tạo đơn nhanh</h1>
        <p className="text-gray-600 mt-1">Tạo đơn hàng cho khách hàng nhanh chóng</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <svg className="h-5 w-5 text-red-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1">
            <p className="font-semibold text-red-900">Lỗi</p>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-600 hover:text-red-800"
          >
            ✕
          </button>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <Check className="h-5 w-5 text-green-600 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-green-900">Thành công!</p>
            <p className="text-sm text-green-700 whitespace-pre-line mt-1">{successMessage}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-green-600" />
                Thông tin khách hàng
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên khách hàng *
                </label>
                <input
                  type="text"
                  required
                  value={customerData.name}
                  onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Nguyễn Văn A"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số điện thoại *
                </label>
                <input
                  type="tel"
                  required
                  value={customerData.phone}
                  onChange={(e) => setCustomerData({ ...customerData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="0912345678"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Địa chỉ giao hàng *
                </label>
                <textarea
                  required
                  value={customerData.address}
                  onChange={(e) => setCustomerData({ ...customerData, address: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="123 Nguyễn Huệ, Quận 1, TP.HCM"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-green-600" />
                Chọn sản phẩm
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tìm sản phẩm
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          loadProducts(searchQuery);
                        }
                      }}
                      placeholder="Tìm theo tên sản phẩm..."
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <Button 
                    type="button" 
                    size="sm"
                    onClick={() => loadProducts(searchQuery)}
                  >
                    Tìm
                  </Button>
                </div>
              </div>

              <div className="max-h-64 overflow-y-auto space-y-2 border border-gray-200 rounded-lg p-2">
                {products.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-8">
                    Không tìm thấy sản phẩm còn hàng
                  </p>
                ) : (
                  products.map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => setSelectedProduct(product)}
                      className={`w-full p-2 rounded-lg text-left transition-colors ${
                        selectedProduct?.id === product.id
                          ? 'bg-green-100 border-2 border-green-500'
                          : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                      }`}
                    >
                      <div className="flex gap-2">
                        <div className="relative w-12 h-12 bg-gray-200 rounded flex-shrink-0">
                          {product.imageUrl && (
                            <Image
                              src={product.imageUrl}
                              alt={product.name}
                              fill
                              className="object-cover rounded"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {product.name}
                          </p>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-600">{formatVND(product.price)}</span>
                            <span className="text-green-600 font-semibold">
                              +{formatVND(product.commission)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>

              {selectedProduct && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số lượng
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={selectedProduct.stock}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Tồn kho: {selectedProduct.stock}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {selectedProduct && (
          <Card className="border-none shadow-md bg-gradient-to-br from-green-50 to-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                Tổng kết đơn hàng
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Sản phẩm</p>
                  <p className="font-semibold text-gray-900">{selectedProduct.name}</p>
                  <p className="text-xs text-gray-500">x{quantity}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Tổng tiền</p>
                  <p className="text-2xl font-bold text-gray-900">{formatVND(totalAmount)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Hoa hồng của bạn</p>
                  <p className="text-2xl font-bold text-green-600">{formatVND(commission)}</p>
                  <p className="text-xs text-gray-500">
                    {selectedProduct.commissionPercentage}% hoa hồng
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setCustomerData({ name: '', phone: '', address: '' });
              setSelectedProduct(null);
              setQuantity(1);
            }}
          >
            Làm mới
          </Button>
          <Button
            type="submit"
            disabled={!selectedProduct || submitting}
            className="bg-green-600 hover:bg-green-700 px-8"
          >
            {submitting ? 'Đang tạo đơn...' : 'Tạo đơn hàng'}
          </Button>
        </div>
      </form>
    </div>
  );
}
