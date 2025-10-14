'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { toast } from '@/hooks/use-toast';
import { formatVietnamPrice } from '@/utils/currency';

interface FlashSaleActionsProps {
  flashSale: {
    slug: string;
    salePrice: number;
    productId: string;
    productName: string;
    productImage: string;
    stock: number;
    isExpired: boolean;
  };
}

export default function FlashSaleActions({ flashSale }: FlashSaleActionsProps) {
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
    if (flashSale.isExpired) {
      toast({
        title: "Flash Sale đã kết thúc",
        description: "Chương trình khuyến mãi này đã hết hạn",
        variant: "destructive",
      });
      return;
    }

    setIsAddingToCart(true);
    
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: flashSale.productId,
        name: flashSale.productName,
        price: flashSale.salePrice,
        image: flashSale.productImage,
      } as any, 1);
    }
    
    toast({
      title: "Đã thêm vào giỏ hàng",
      description: `${quantity} x ${flashSale.productName}`,
      duration: 2000,
    });
    
    setTimeout(() => setIsAddingToCart(false), 600);
  };

  const handleBuyNow = () => {
    if (flashSale.isExpired) {
      toast({
        title: "Flash Sale đã kết thúc",
        description: "Chương trình khuyến mãi này đã hết hạn",
        variant: "destructive",
      });
      return;
    }

    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: flashSale.productId,
        name: flashSale.productName,
        price: flashSale.salePrice,
        image: flashSale.productImage,
      } as any, 1);
    }
    router.push('/checkout');
  };

  return (
    <>
      {/* Desktop Action Section */}
      <div className="hidden lg:block lg:fixed lg:bottom-8 lg:right-8 lg:w-96 lg:z-50">
        <div className="bg-white rounded-2xl shadow-2xl border-2 border-orange-200 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-3 text-white">
            <p className="font-bold text-center">⚡ MUA NGAY - GIÁ SỐC</p>
          </div>
          
          <div className="p-6 space-y-4">
            {/* Quantity Selector */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Số lượng
              </label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  className="w-10 h-10 flex items-center justify-center border-2 border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
                  className="w-20 text-center text-lg font-semibold border-2 border-gray-300 rounded-lg py-2 focus:border-orange-500 focus:outline-none"
                  min="1"
                  max="99"
                />
                <button
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= 99}
                  className="w-10 h-10 flex items-center justify-center border-2 border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Total Price */}
            <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-lg border border-orange-200">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Tổng tiền:</span>
                <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600">
                  {formatVietnamPrice(flashSale.salePrice * quantity)}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                onClick={handleBuyNow}
                disabled={flashSale.isExpired || flashSale.stock === 0}
                className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-4 rounded-xl font-bold text-lg hover:from-orange-700 hover:to-red-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
              >
                {flashSale.isExpired ? 'Đã hết hạn' : flashSale.stock === 0 ? 'Hết hàng' : '🔥 MUA NGAY'}
              </button>
              <button
                onClick={handleAddToCart}
                disabled={isAddingToCart || flashSale.isExpired || flashSale.stock === 0}
                className={`w-full border-2 border-orange-600 text-orange-600 py-3 rounded-xl font-semibold hover:bg-orange-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  isAddingToCart ? 'scale-95 bg-orange-50' : ''
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <ShoppingCart className={`h-5 w-5 ${isAddingToCart ? 'text-orange-600' : ''}`} />
                  <span>Thêm vào Giỏ</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Fixed Bottom Action Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t-2 border-orange-200 px-4 py-3 z-50 shadow-2xl">
        <div className="space-y-3">
          {/* Quantity Selector - Mobile */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Số lượng:</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
                className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Minus className="h-3 w-3" />
              </button>
              <span className="text-lg font-bold w-8 text-center">{quantity}</span>
              <button
                onClick={() => handleQuantityChange(1)}
                disabled={quantity >= 99}
                className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* Action Buttons - Mobile */}
          <div className="flex gap-2">
            <button
              onClick={handleAddToCart}
              disabled={isAddingToCart || flashSale.isExpired || flashSale.stock === 0}
              className={`flex-shrink-0 flex items-center justify-center gap-2 px-4 py-3 border-2 border-orange-600 text-orange-600 rounded-xl font-medium hover:bg-orange-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                isAddingToCart ? 'scale-95 bg-orange-50' : ''
              }`}
            >
              <ShoppingCart className="h-5 w-5" />
              <span className="hidden sm:inline">Giỏ hàng</span>
            </button>
            <button
              onClick={handleBuyNow}
              disabled={flashSale.isExpired || flashSale.stock === 0}
              className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 text-white py-3 rounded-xl font-bold hover:from-orange-700 hover:to-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {flashSale.isExpired ? 'Đã hết hạn' : flashSale.stock === 0 ? 'Hết hàng' : `🔥 Mua ngay ${formatVietnamPrice(flashSale.salePrice * quantity)}`}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
