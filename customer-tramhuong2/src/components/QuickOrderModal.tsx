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
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto bg-white/60 backdrop-blur-md border-tramhuong-accent/20 shadow-[0_8px_32px_rgba(193,168,117,0.3)]">
        <DialogHeader>
          <DialogTitle className="font-playfair text-tramhuong-primary">Lên đơn nhanh</DialogTitle>
          <DialogDescription className="text-tramhuong-primary/70">
            Tạo đơn hàng cho: <span className="font-semibold text-tramhuong-accent">{product.name}</span>
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-8 text-center">
            <div className="mx-auto w-12 h-12 bg-tramhuong-accent/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-4">
              <Check className="w-6 h-6 text-tramhuong-accent" />
            </div>
            <h3 className="font-playfair text-lg font-semibold text-tramhuong-accent mb-2">Đã tạo đơn thành công!</h3>
            <p className="text-sm text-tramhuong-primary/70">Đơn hàng đã được ghi nhận</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-tramhuong-accent/10 backdrop-blur-sm p-3 rounded-lg border border-tramhuong-accent/20">
              <div className="flex items-center gap-3">
                {product.image && (
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                )}
                <div className="flex-1">
                  <p className="font-medium text-sm text-tramhuong-primary">{product.name}</p>
                  <p className="text-tramhuong-accent font-semibold">
                    {productPrice.toLocaleString('vi-VN')}đ
                  </p>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="quantity" className="text-tramhuong-primary">Số lượng</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                max={product.stock}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                required
                className="border-tramhuong-accent/30 focus:border-tramhuong-accent transition-all duration-300"
              />
              <p className="text-xs text-tramhuong-primary/60 mt-1">Còn {product.stock} sản phẩm</p>
            </div>

            <div>
              <Label htmlFor="customerName" className="text-tramhuong-primary">Tên khách hàng *</Label>
              <Input
                id="customerName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Nguyễn Văn A"
                required
                className="border-tramhuong-accent/30 focus:border-tramhuong-accent transition-all duration-300"
              />
            </div>

            <div>
              <Label htmlFor="customerPhone" className="text-tramhuong-primary">Số điện thoại *</Label>
              <Input
                id="customerPhone"
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="0912345678"
                required
                className="border-tramhuong-accent/30 focus:border-tramhuong-accent transition-all duration-300"
              />
            </div>

            <div>
              <Label htmlFor="customerAddress" className="text-tramhuong-primary">Địa chỉ giao hàng *</Label>
              <Textarea
                id="customerAddress"
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                placeholder="123 Nguyễn Huệ, Quận 1, TP.HCM"
                rows={2}
                required
                className="border-tramhuong-accent/30 focus:border-tramhuong-accent transition-all duration-300 resize-none"
              />
            </div>

            <div>
              <Label htmlFor="customerNotes" className="text-tramhuong-primary">Ghi chú giao hàng (tùy chọn)</Label>
              <Textarea
                id="customerNotes"
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
                placeholder="Giao giờ hành chính..."
                rows={2}
                className="border-tramhuong-accent/30 focus:border-tramhuong-accent transition-all duration-300 resize-none"
              />
            </div>

            <div className="bg-tramhuong-accent/10 backdrop-blur-sm p-3 rounded-lg space-y-2 border border-tramhuong-accent/20">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-tramhuong-primary">Tổng tiền:</span>
                <span className="text-xl font-bold text-tramhuong-accent">
                  {totalAmount.toLocaleString('vi-VN')}đ
                </span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-tramhuong-accent/20">
                <span className="text-sm text-tramhuong-primary/70">🎁 Hoa hồng ({commissionRate}%):</span>
                <span className="text-lg font-semibold text-tramhuong-accent">
                  {commissionAmount.toLocaleString('vi-VN')}đ
                </span>
              </div>
            </div>

            <div>
              <Label htmlFor="affiliateNotes" className="text-tramhuong-primary">📝 Phần ghi chú của Aff (tùy chọn)</Label>
              <Textarea
                id="affiliateNotes"
                value={affiliateNotes}
                onChange={(e) => setAffiliateNotes(e.target.value)}
                placeholder="Ghi chú riêng cho bạn (khách không thấy)..."
                rows={2}
                className="border-tramhuong-accent/30 focus:border-tramhuong-accent transition-all duration-300 resize-none"
              />
            </div>

            {error && (
              <div className="bg-tramhuong-accent/20 backdrop-blur-sm border border-tramhuong-accent/30 text-tramhuong-primary px-4 py-3 rounded text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isSubmitting}
                className="flex-1 border-tramhuong-accent/30 text-tramhuong-accent hover:bg-tramhuong-accent/20 transition-all duration-300"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-tramhuong-accent hover:bg-tramhuong-accent/80 text-tramhuong-primary transition-all duration-300"
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
