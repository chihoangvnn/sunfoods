'use client';

import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { X, Minus, Plus, Phone } from 'lucide-react';

interface Vegetable {
  id: string;
  name: string;
  price: number;
  unit: string;
  image: string | null;
  status: string;
  availableDate: Date | null;
  description: string | null;
}

interface VegetableOrderSheetProps {
  vegetable: Vegetable | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function VegetableOrderSheet({ 
  vegetable, 
  isOpen, 
  onClose, 
  onSuccess 
}: VegetableOrderSheetProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const phoneInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
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
  }, [isOpen]);

  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [isOpen]);

  const handleClose = () => {
    setQuantity(1);
    setCustomerPhone('');
    setCustomerName('');
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!vegetable) return;

    if (!customerPhone) {
      toast.error('Vui lòng nhập số điện thoại');
      return;
    }

    if (quantity < 1) {
      toast.error('Số lượng phải lớn hơn 0');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/vegetables/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vegetableId: vegetable.id,
          customerPhone,
          customerName: customerName || null,
          quantity,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || 'Đặt hàng thành công!', {
          description: `Đơn hàng #${data.order.id.substring(0, 8)} - Tổng tiền: ${data.order.totalAmount.toLocaleString('vi-VN')}₫`,
          duration: 5000,
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

  const incrementQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decrementQuantity = () => {
    setQuantity(prev => Math.max(1, prev - 1));
  };

  if (!isOpen || !vegetable) return null;

  const totalAmount = quantity * vegetable.price;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />
      
      <div className="fixed bottom-0 left-0 right-0 bg-white/60 backdrop-blur-md rounded-t-2xl z-50 max-h-[70vh] overflow-y-auto animate-slide-up shadow-[0_8px_32px_rgba(193,168,117,0.3)]">
        <div className="flex items-center gap-3 p-4 border-b border-tramhuong-accent/20 sticky top-0 bg-tramhuong-accent/10 backdrop-blur-md">
          {vegetable.image && (
            <img 
              src={vegetable.image} 
              alt={vegetable.name}
              className="w-16 h-16 rounded-lg object-cover"
            />
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-playfair font-bold text-lg truncate text-tramhuong-primary">{vegetable.name}</h3>
            <p className="text-tramhuong-accent font-semibold">
              {vegetable.price.toLocaleString('vi-VN')}₫/{vegetable.unit}
            </p>
          </div>
          <button 
            onClick={handleClose}
            className="flex-shrink-0 p-2 hover:bg-tramhuong-accent/10 rounded-full transition-all duration-300"
          >
            <X className="h-5 w-5 text-tramhuong-accent" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-tramhuong-primary mb-1">
              Số điện thoại *
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-tramhuong-accent/60" />
              <input
                ref={phoneInputRef}
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="0xxxxxxxxx"
                pattern="0[0-9]{9,10}"
                className="w-full pl-10 pr-4 py-3 border border-tramhuong-accent/20 rounded-lg focus:ring-2 focus:ring-tramhuong-accent focus:border-tramhuong-accent transition-all duration-300"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-tramhuong-primary mb-1">
              Tên khách hàng (tuỳ chọn)
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Nhập tên của bạn"
              className="w-full px-4 py-3 border border-tramhuong-accent/20 rounded-lg focus:ring-2 focus:ring-tramhuong-accent focus:border-tramhuong-accent transition-all duration-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-tramhuong-primary mb-2">
              Số lượng
            </label>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={decrementQuantity}
                className="w-12 h-12 flex items-center justify-center bg-tramhuong-accent/10 text-tramhuong-accent rounded-lg hover:bg-tramhuong-accent/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={quantity <= 1}
              >
                <Minus className="h-5 w-5" />
              </button>
              <span className="text-2xl font-bold text-tramhuong-primary min-w-[3rem] text-center">
                {quantity}
              </span>
              <button
                type="button"
                onClick={incrementQuantity}
                className="w-12 h-12 flex items-center justify-center bg-tramhuong-accent/10 text-tramhuong-accent rounded-lg hover:bg-tramhuong-accent/20 transition-all duration-300"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="bg-tramhuong-accent/5 p-4 rounded-lg border border-tramhuong-accent/20">
            <div className="flex justify-between items-center">
              <span className="text-tramhuong-primary font-medium">Tổng tiền:</span>
              <span className="text-2xl font-bold text-tramhuong-accent">
                {totalAmount.toLocaleString('vi-VN')}₫
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-tramhuong-accent text-white py-4 rounded-lg font-bold text-lg hover:bg-tramhuong-accent/90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Đang xử lý...' : 'ĐẶT TRƯỚC NGAY 🌿'}
          </button>

          <p className="text-xs text-center text-tramhuong-primary/60">
            Chúng tôi sẽ liên hệ với bạn để xác nhận đơn hàng
          </p>
        </form>
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
