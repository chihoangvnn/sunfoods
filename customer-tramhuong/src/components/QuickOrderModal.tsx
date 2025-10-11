'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, ShoppingCart, Check } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: string;
  image?: string;
  stock: number;
}

interface QuickOrderModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  commissionRate?: number;
}

export function QuickOrderModal({ product, isOpen, onClose, onSuccess, commissionRate = 5 }: QuickOrderModalProps) {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [affiliateNotes, setAffiliateNotes] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!product) return null;

  const productPrice = parseFloat(product.price.toString());
  const totalAmount = productPrice * quantity;
  const commissionAmount = Math.round((totalAmount * commissionRate) / 100);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      if (quantity > product.stock) {
        throw new Error(`Sản phẩm chỉ còn ${product.stock} sản phẩm`);
      }

      const response = await fetch('/api/affiliate-portal/quick-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: {
            name: customerName,
            phone: customerPhone,
            address: customerAddress,
            notes: customerNotes
          },
          products: [{
            id: product.id,
            quantity: quantity
          }],
          affiliateNotes: affiliateNotes
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Không thể tạo đơn hàng');
      }

      const data = await response.json();
      setSuccess(true);
      
      setTimeout(() => {
        onClose();
        resetForm();
        if (onSuccess) onSuccess();
      }, 1500);
    } catch (err: any) {
      console.error('Quick order error:', err);
      setError(err.message || 'Lỗi khi tạo đơn hàng. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setCustomerName('');
    setCustomerPhone('');
    setCustomerAddress('');
    setCustomerNotes('');
    setAffiliateNotes('');
    setQuantity(1);
    setSuccess(false);
    setError('');
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && !isSubmitting) {
      onClose();
      resetForm();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-green-700">Lên đơn nhanh</DialogTitle>
          <DialogDescription>
            Tạo đơn hàng cho: <span className="font-semibold">{product.name}</span>
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-8 text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Check className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-green-700 mb-2">Đã tạo đơn thành công!</h3>
            <p className="text-sm text-gray-600">Đơn hàng đã được ghi nhận</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center gap-3">
                {product.image && (
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                )}
                <div className="flex-1">
                  <p className="font-medium text-sm">{product.name}</p>
                  <p className="text-green-600 font-semibold">
                    {productPrice.toLocaleString('vi-VN')}đ
                  </p>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="quantity">Số lượng</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                max={product.stock}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                required
              />
              <p className="text-xs text-gray-500 mt-1">Còn {product.stock} sản phẩm</p>
            </div>

            <div>
              <Label htmlFor="customerName">Tên khách hàng *</Label>
              <Input
                id="customerName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Nguyễn Văn A"
                required
              />
            </div>

            <div>
              <Label htmlFor="customerPhone">Số điện thoại *</Label>
              <Input
                id="customerPhone"
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="0912345678"
                required
              />
            </div>

            <div>
              <Label htmlFor="customerAddress">Địa chỉ giao hàng *</Label>
              <Textarea
                id="customerAddress"
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                placeholder="123 Nguyễn Huệ, Quận 1, TP.HCM"
                rows={2}
                required
              />
            </div>

            <div>
              <Label htmlFor="customerNotes">Ghi chú giao hàng (tùy chọn)</Label>
              <Textarea
                id="customerNotes"
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
                placeholder="Giao giờ hành chính..."
                rows={2}
              />
            </div>

            <div className="bg-green-50 p-3 rounded-lg space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-700">Tổng tiền:</span>
                <span className="text-xl font-bold text-green-600">
                  {totalAmount.toLocaleString('vi-VN')}đ
                </span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-green-200">
                <span className="text-sm text-gray-600">🎁 Hoa hồng ({commissionRate}%):</span>
                <span className="text-lg font-semibold text-green-700">
                  {commissionAmount.toLocaleString('vi-VN')}đ
                </span>
              </div>
            </div>

            <div>
              <Label htmlFor="affiliateNotes">📝 Phần ghi chú của Aff (tùy chọn)</Label>
              <Textarea
                id="affiliateNotes"
                value={affiliateNotes}
                onChange={(e) => setAffiliateNotes(e.target.value)}
                placeholder="Ghi chú riêng cho bạn (khách không thấy)..."
                rows={2}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isSubmitting}
                className="flex-1"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang tạo...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Tạo đơn
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
