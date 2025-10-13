'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { X, Leaf } from 'lucide-react';
import { formatVietnamPrice } from '@/utils/formatPrice';

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

interface CartReviewSheetProps {
  isOpen: boolean;
  onClose: () => void;
  cart: Record<string, {vegetable: Vegetable, quantity: number}>;
  onUpdateQuantity: (vegId: string, qty: number) => void;
  onSubmit: (phone: string) => Promise<void>;
}

export default function CartReviewSheet({ 
  isOpen, 
  onClose, 
  cart, 
  onUpdateQuantity,
  onSubmit 
}: CartReviewSheetProps) {
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPhoneLocked, setIsPhoneLocked] = useState(false);
  const [userName, setUserName] = useState('');
  
  const cartItems = Object.values(cart);
  const total = cartItems.reduce((sum, item) => 
    sum + (item.vegetable.price * item.quantity), 0
  );

  useEffect(() => {
    if (isOpen) {
      fetchUserData();
    }
  }, [isOpen]);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/auth/user');
      if (response.ok) {
        const userData = await response.json();
        if (userData?.phone) {
          setPhone(userData.phone);
          setIsPhoneLocked(true);
        }
        if (userData?.firstName) {
          setUserName(userData.firstName);
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPhoneLocked && (!phone || phone.length < 10)) {
      toast.error('Vui lòng nhập số điện thoại hợp lệ');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onSubmit(phone);
      if (!isPhoneLocked) {
        setPhone('');
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      
      <div className="fixed bottom-0 left-0 right-0 bg-white/60 backdrop-blur-md rounded-t-2xl z-50 max-h-[80vh] flex flex-col shadow-[0_8px_32px_rgba(193,168,117,0.3)] border-t border-tramhuong-accent/20">
        <div className="flex items-center justify-between p-4 border-b border-tramhuong-accent/20">
          <h2 className="text-xl font-playfair font-bold text-tramhuong-primary">Đơn hàng của bạn</h2>
          <button onClick={onClose} className="p-2 hover:bg-tramhuong-accent/10 rounded-full transition-all duration-300">
            <X className="h-5 w-5 text-tramhuong-accent" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cartItems.map(({ vegetable, quantity }) => (
            <div key={vegetable.id} className="flex items-center gap-3 border-b border-tramhuong-accent/20 pb-3">
              {vegetable.image ? (
                <img src={vegetable.image} alt={vegetable.name} className="w-16 h-16 rounded object-cover" />
              ) : (
                <div className="w-16 h-16 rounded bg-tramhuong-accent/10 backdrop-blur-sm flex items-center justify-center">
                  <Leaf className="h-8 w-8 text-tramhuong-accent" />
                </div>
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-tramhuong-primary">{vegetable.name}</h3>
                <p className="text-tramhuong-accent">
                  {formatVietnamPrice(vegetable.price)}/{vegetable.unit}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => {
                    const decrement = vegetable.unit === 'kg' ? 0.1 : 1;
                    const newQty = Math.max(0, Math.round((quantity - decrement) * 10) / 10);
                    onUpdateQuantity(vegetable.id, newQty);
                  }}
                  className="w-8 h-8 rounded-full bg-tramhuong-accent/20 hover:bg-tramhuong-accent/30 transition-all duration-300 flex items-center justify-center text-tramhuong-primary"
                >
                  -
                </button>
                <span className="w-16 text-center font-medium text-tramhuong-primary">
                  {vegetable.unit === 'kg' ? quantity.toFixed(1) : quantity} {vegetable.unit}
                </span>
                <button 
                  onClick={() => {
                    const increment = vegetable.unit === 'kg' ? 0.1 : 1;
                    const newQty = Math.round((quantity + increment) * 10) / 10;
                    onUpdateQuantity(vegetable.id, newQty);
                  }}
                  className="w-8 h-8 rounded-full bg-tramhuong-accent text-white hover:bg-tramhuong-accent/90 transition-all duration-300 flex items-center justify-center"
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 border-t border-tramhuong-accent/20 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-tramhuong-primary">
              📞 Số điện thoại {!isPhoneLocked && '*'}
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0xxxxxxxxx"
              pattern="0[0-9]{9,10}"
              required={!isPhoneLocked}
              readOnly={isPhoneLocked}
              className={`w-full px-4 py-3 border border-tramhuong-accent/30 rounded-lg focus:ring-2 focus:ring-tramhuong-accent focus:border-transparent transition-all duration-300 ${
                isPhoneLocked ? 'bg-tramhuong-accent/10 cursor-not-allowed' : 'bg-white/80'
              }`}
            />
            {isPhoneLocked && (
              <p className="text-xs text-tramhuong-accent mt-1">
                ✓ Sử dụng số điện thoại đã đăng ký
              </p>
            )}
          </div>
          
          <div className="flex items-center justify-between text-lg font-playfair font-bold">
            <span className="text-tramhuong-primary">Tổng cộng:</span>
            <span className="text-tramhuong-accent">{formatVietnamPrice(total)}</span>
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-tramhuong-accent text-white py-4 rounded-lg font-playfair font-semibold hover:bg-tramhuong-accent/90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_8px_32px_rgba(193,168,117,0.3)]"
          >
            {isSubmitting ? 'Đang xử lý...' : 'XÁC NHẬN ĐẶT HÀNG'}
          </button>
        </form>
      </div>
    </>
  );
}
