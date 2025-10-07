'use client';

import { useEffect, useState } from 'react';
import { Leaf, Minus, Plus } from 'lucide-react';
import { toast } from 'sonner';
import FloatingCartButton from '@/components/FloatingCartButton';
import CartReviewSheet from '@/components/CartReviewSheet';
import CountdownTimer from '@/components/CountdownTimer';

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

export default function VegetablesPage() {
  const [vegetables, setVegetables] = useState<Vegetable[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<Record<string, {vegetable: Vegetable, quantity: number}>>({});
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    fetchVegetables();
  }, []);

  const fetchVegetables = async () => {
    try {
      const response = await fetch('/api/vegetables');
      if (response.ok) {
        const data = await response.json();
        setVegetables(data.vegetables || []);
      }
    } catch (error) {
      console.error('Error fetching vegetables:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (vegetable: Vegetable, quantity: number = 1) => {
    setCart(prev => ({
      ...prev,
      [vegetable.id]: { vegetable, quantity }
    }));
  };

  const updateQuantity = (vegetableId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(vegetableId);
    } else {
      setCart(prev => {
        const existingItem = prev[vegetableId];
        if (!existingItem) return prev;
        return {
          ...prev,
          [vegetableId]: { ...existingItem, quantity }
        };
      });
    }
  };

  const removeFromCart = (vegetableId: string) => {
    setCart(prev => {
      const newCart = { ...prev };
      delete newCart[vegetableId];
      return newCart;
    });
  };

  const clearCart = () => setCart({});

  const calculateTotal = () => {
    return Object.values(cart).reduce((sum, item) => 
      sum + (item.vegetable.price * item.quantity), 0
    );
  };

  const getTotalCartQuantity = () => {
    return Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);
  };

  const incrementQty = (vegId: string) => {
    const veg = vegetables.find(v => v.id === vegId);
    if (!veg) return;
    
    const currentQty = cart[vegId]?.quantity || 0;
    const increment = veg.unit === 'kg' ? 0.1 : 1;
    const newQty = Math.round((currentQty + increment) * 10) / 10;
    
    if (currentQty === 0) {
      addToCart(veg, increment);
    } else {
      updateQuantity(vegId, newQty);
    }
  };

  const decrementQty = (vegId: string) => {
    const veg = vegetables.find(v => v.id === vegId);
    if (!veg) return;
    
    const currentQty = cart[vegId]?.quantity || 0;
    const decrement = veg.unit === 'kg' ? 0.1 : 1;
    const newQty = Math.max(0, Math.round((currentQty - decrement) * 10) / 10);
    
    if (newQty > 0) {
      updateQuantity(vegId, newQty);
    } else {
      removeFromCart(vegId);
    }
  };

  const handleDirectInput = (vegId: string, value: string) => {
    const veg = vegetables.find(v => v.id === vegId);
    if (!veg) return;
    
    const qty = parseFloat(value);
    if (isNaN(qty) || qty <= 0) {
      removeFromCart(vegId);
    } else if (qty > 100) {
      toast.error('Số lượng tối đa: 100');
    } else {
      updateQuantity(vegId, Math.round(qty * 10) / 10);
    }
  };

  const handleCheckout = async (phone: string) => {
    const items = Object.values(cart).map(item => ({
      vegetableId: item.vegetable.id,
      quantity: item.quantity
    }));

    try {
      const response = await fetch('/api/vegetables/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, customerPhone: phone })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        clearCart();
        setIsCartOpen(false);
        fetchVegetables();
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Không thể kết nối đến server. Vui lòng thử lại.');
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Sắp về';
    const d = new Date(date);
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white pb-32">
      <header className="bg-green-600 text-white py-6 px-4 sticky top-0 z-10 shadow-md">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Leaf className="h-6 w-6" />
          Rau Hữu Cơ Sắp Về
        </h1>
        <p className="text-green-100 text-sm mt-1">Đặt trước - Đảm bảo tươi ngon</p>
      </header>

      <main className="py-6">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent"></div>
          </div>
        ) : vegetables.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 px-4">
            <Leaf className="h-16 w-16 text-green-300 mb-4" />
            <p className="text-gray-500 text-center">Chưa có rau nào sắp về</p>
            <p className="text-gray-400 text-sm text-center mt-2">Vui lòng quay lại sau</p>
          </div>
        ) : (
          <>
            <div className="lg:grid lg:grid-cols-3 lg:gap-4 flex flex-col gap-3 px-4 pb-32">
              {vegetables.map((vegetable) => (
                <div
                  key={vegetable.id}
                  className="flex lg:flex-col gap-3 bg-white rounded-lg p-3 shadow-sm items-start"
                >
                  {vegetable.image ? (
                    <img
                      src={vegetable.image}
                      alt={vegetable.name}
                      className="w-20 h-20 lg:w-full lg:h-48 object-cover rounded flex-shrink-0"
                    />
                  ) : (
                    <div className="w-20 h-20 lg:w-full lg:h-48 rounded bg-green-50 flex items-center justify-center flex-shrink-0">
                      <Leaf className="h-10 w-10 lg:h-16 lg:w-16 text-green-300" />
                    </div>
                  )}

                  <div className="flex-1 flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800 truncate">{vegetable.name}</h3>
                      <p className="text-green-600 font-bold text-lg mt-1">
                        {vegetable.price.toLocaleString()}₫/{vegetable.unit}
                      </p>
                      
                      {vegetable.status === 'upcoming' && vegetable.availableDate && (
                        <CountdownTimer targetDate={vegetable.availableDate} />
                      )}
                      
                      <p className="text-xs text-gray-500 mt-1">
                        {vegetable.status === 'available' ? '✓ Có sẵn' : '📦 Sắp về'}
                      </p>
                    </div>
                    
                    <div className="flex flex-col items-end">
                      <span className="text-xs text-gray-500 mb-1">Số lượng</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => decrementQty(vegetable.id)}
                          disabled={!cart[vegetable.id]}
                          className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        
                        {vegetable.unit === 'kg' ? (
                          <input
                            type="number"
                            step="0.1"
                            min="0.1"
                            max="100"
                            value={cart[vegetable.id]?.quantity || ''}
                            onChange={(e) => handleDirectInput(vegetable.id, e.target.value)}
                            className="w-16 text-center border rounded px-2 py-1 text-sm"
                            placeholder="0"
                          />
                        ) : (
                          <span className="w-16 text-center font-semibold text-sm">
                            {cart[vegetable.id]?.quantity || 0}
                          </span>
                        )}
                        
                        <button
                          onClick={() => incrementQty(vegetable.id)}
                          className="w-8 h-8 rounded-full bg-green-600 text-white hover:bg-green-700 flex items-center justify-center transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <span className="text-xs text-gray-600 mt-1">{vegetable.unit}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 px-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                  <Leaf className="h-5 w-5" />
                  Lợi ích rau hữu cơ
                </h3>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>✅ Không thuốc trừ sâu, an toàn cho sức khỏe</li>
                  <li>✅ Tươi ngon, thu hoạch trong ngày</li>
                  <li>✅ Giá tốt nhất khi đặt trước</li>
                  <li>✅ Đảm bảo nguồn gốc rõ ràng</li>
                </ul>
              </div>
            </div>
          </>
        )}
      </main>

      <FloatingCartButton
        itemCount={getTotalCartQuantity()}
        totalAmount={calculateTotal()}
        onClick={() => setIsCartOpen(true)}
      />

      <CartReviewSheet
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={updateQuantity}
        onSubmit={handleCheckout}
      />
    </div>
  );
}
