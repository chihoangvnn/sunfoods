'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { toast } from '@/hooks/use-toast';
import { formatVietnamPrice } from '@/utils/currency';

interface PreorderActionsProps {
  preorder: {
    id: string;
    productId: string;
    slug: string;
    name: string;
    price: number;
    image: string;
    unit: string;
    stock: number;
    isActive: boolean;
  };
}

export default function PreorderActions({ preorder }: PreorderActionsProps) {
  const router = useRouter();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= 99) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    if (!preorder.isActive) {
      toast({
        title: "Pre-order không khả dụng",
        description: "Sản phẩm này hiện không thể đặt trước",
        variant: "destructive",
      });
      return;
    }

    setIsAddingToCart(true);
    
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: preorder.productId,
        name: preorder.name,
        price: preorder.price,
        image: preorder.image,
      } as any, 1);
    }
    
    toast({
      title: "Đã thêm vào giỏ hàng",
      description: `${quantity} ${preorder.unit} ${preorder.name}`,
      duration: 2000,
    });
    
    setTimeout(() => setIsAddingToCart(false), 600);
  };

  const handlePreorderNow = () => {
    if (!preorder.isActive) {
      toast({
        title: "Pre-order không khả dụng",
        description: "Sản phẩm này hiện không thể đặt trước",
        variant: "destructive",
      });
      return;
    }

    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: preorder.productId,
        name: preorder.name,
        price: preorder.price,
        image: preorder.image,
      } as any, 1);
    }
    router.push('/checkout');
  };

  return (
    <>
      <div className="hidden lg:block lg:fixed lg:bottom-8 lg:right-8 lg:w-96 lg:z-50">
        <div className="bg-white rounded-2xl shadow-2xl border-2 border-amber-200 overflow-hidden">
          <div className="bg-gradient-to-r from-amber-600 to-yellow-700 px-6 py-3 text-white">
            <p className="font-bold text-center">🔔 ĐẶT TRƯỚC NGAY</p>
          </div>
          
          <div className="p-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Số lượng ({preorder.unit})
              </label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  className="w-10 h-10 flex items-center justify-center border-2 border-gray-300 rounded-lg hover:border-amber-600 hover:bg-amber-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 1;
                    if (val >= 1 && val <= 99) setQuantity(val);
                  }}
                  className="w-20 text-center text-lg font-semibold border-2 border-gray-300 rounded-lg py-2 focus:border-amber-600 focus:outline-none"
                  min="1"
                  max="99"
                />
                <button
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= 99}
                  className="w-10 h-10 flex items-center justify-center border-2 border-gray-300 rounded-lg hover:border-amber-600 hover:bg-amber-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                = {quantity} {preorder.unit}
              </p>
            </div>

            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-4 rounded-lg border border-amber-200">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Tổng tiền:</span>
                <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-700 to-yellow-700">
                  {formatVietnamPrice(preorder.price * quantity)}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={handlePreorderNow}
                disabled={!preorder.isActive || preorder.stock === 0}
                className="w-full bg-gradient-to-r from-amber-600 to-yellow-700 text-white py-4 rounded-xl font-bold text-lg hover:from-amber-700 hover:to-yellow-800 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
              >
                {!preorder.isActive ? 'Không khả dụng' : preorder.stock === 0 ? 'Hết hàng' : '🔔 ĐẶT TRƯỚC NGAY'}
              </button>
              <button
                onClick={handleAddToCart}
                disabled={isAddingToCart || !preorder.isActive || preorder.stock === 0}
                className={`w-full border-2 border-amber-600 text-amber-700 py-3 rounded-xl font-semibold hover:bg-amber-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  isAddingToCart ? 'scale-95 bg-amber-50' : ''
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <ShoppingCart className={`h-5 w-5 ${isAddingToCart ? 'text-amber-700' : ''}`} />
                  <span>Thêm vào Giỏ</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t-2 border-amber-200 px-4 py-3 z-50 shadow-2xl">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Số lượng ({preorder.unit}):</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
                className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:border-amber-600 hover:bg-amber-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Minus className="h-3 w-3" />
              </button>
              <span className="text-lg font-bold w-12 text-center">{quantity}</span>
              <button
                onClick={() => handleQuantityChange(1)}
                disabled={quantity >= 99}
                className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:border-amber-600 hover:bg-amber-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleAddToCart}
              disabled={isAddingToCart || !preorder.isActive || preorder.stock === 0}
              className={`flex-shrink-0 flex items-center justify-center gap-2 px-4 py-3 border-2 border-amber-600 text-amber-700 rounded-xl font-medium hover:bg-amber-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                isAddingToCart ? 'scale-95 bg-amber-50' : ''
              }`}
            >
              <ShoppingCart className="h-5 w-5" />
              <span className="hidden sm:inline">Giỏ hàng</span>
            </button>
            <button
              onClick={handlePreorderNow}
              disabled={!preorder.isActive || preorder.stock === 0}
              className="flex-1 bg-gradient-to-r from-amber-600 to-yellow-700 text-white py-3 rounded-xl font-bold hover:from-amber-700 hover:to-yellow-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {!preorder.isActive ? 'Không khả dụng' : preorder.stock === 0 ? 'Hết hàng' : `🔔 Đặt trước ${formatVietnamPrice(preorder.price * quantity)}`}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
