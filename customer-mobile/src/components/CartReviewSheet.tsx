'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { X, Leaf } from 'lucide-react';

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
      
      <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl z-50 max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold">Đơn hàng của bạn</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cartItems.map(({ vegetable, quantity }) => (
            <div key={vegetable.id} className="flex items-center gap-3 border-b pb-3">
              {vegetable.image ? (
                <img src={vegetable.image} alt={vegetable.name} className="w-16 h-16 rounded object-cover" />
              ) : (
                <div className="w-16 h-16 rounded bg-green-50 flex items-center justify-center">
                  <Leaf className="h-8 w-8 text-green-300" />
                </div>
              )}
              <div className="flex-1">
                <h3 className="font-semibold">{vegetable.name}</h3>
                <p className="text-green-600">
                  {vegetable.price.toLocaleString()}₫/{vegetable.unit}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => {
                    const decrement = vegetable.unit === 'kg' ? 0.1 : 1;
                    const newQty = Math.max(0, Math.round((quantity - decrement) * 10) / 10);
                    onUpdateQuantity(vegetable.id, newQty);
                  }}
                  className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors flex items-center justify-center"
                >
                  -
                </button>
                <span className="w-16 text-center font-medium">
                  {vegetable.unit === 'kg' ? quantity.toFixed(1) : quantity} {vegetable.unit}
                </span>
                <button 
                  onClick={() => {
                    const increment = vegetable.unit === 'kg' ? 0.1 : 1;
                    const newQty = Math.round((quantity + increment) * 10) / 10;
                    onUpdateQuantity(vegetable.id, newQty);
                  }}
                  className="w-8 h-8 rounded-full bg-green-600 text-white hover:bg-green-700 transition-colors flex items-center justify-center"
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 border-t space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
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
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                isPhoneLocked ? 'bg-gray-100 cursor-not-allowed' : ''
              }`}
            />
            {isPhoneLocked && (
              <p className="text-xs text-gray-500 mt-1">
                ✓ Sử dụng số điện thoại đã đăng ký
              </p>
            )}
          </div>
          
          <div className="flex items-center justify-between text-lg font-bold">
            <span>Tổng cộng:</span>
            <span className="text-green-600">{total.toLocaleString()}₫</span>
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-green-600 text-white py-4 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Đang xử lý...' : 'XÁC NHẬN ĐẶT HÀNG'}
          </button>
        </form>
      </div>
    </>
  );
}
