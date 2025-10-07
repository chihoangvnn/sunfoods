'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, MessageCircle } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { toast } from '@/hooks/use-toast';
import { formatVietnamPrice } from '@/utils/currency';

interface ProductData {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  image: string;
  images: string[];
  category_id: string;
  stock: number;
  short_description: string;
  description: string;
  status: string;
  benefits: string[];
}

interface ProductActionsProps {
  product: ProductData;
}

export default function ProductActions({ product }: ProductActionsProps) {
  const router = useRouter();
  const { addToCart } = useCart();
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const handleAddToCart = () => {
    setIsAddingToCart(true);
    addToCart(product, 1);
    
    toast({
      title: "Đã thêm vào giỏ hàng",
      description: `${product.name}`,
      duration: 2000,
    });
    
    setTimeout(() => setIsAddingToCart(false), 600);
  };

  const handleBuyNow = () => {
    addToCart(product, 1);
    router.push('/checkout');
  };

  return (
    <>
      {/* Desktop Action Buttons */}
      <div className="hidden lg:flex gap-3 mt-6">
        <button 
          onClick={handleAddToCart}
          disabled={isAddingToCart}
          className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 border-2 border-green-600 text-green-700 rounded-lg font-medium hover:bg-green-50 transition-all ${
            isAddingToCart ? 'scale-95 bg-green-50' : ''
          }`}
        >
          <ShoppingCart className={`h-5 w-5 ${isAddingToCart ? 'text-green-600' : ''}`} />
          <span>Thêm vào Giỏ</span>
        </button>
        <button 
          onClick={handleBuyNow}
          className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors"
        >
          Mua Ngay
        </button>
      </div>

      {/* Fixed Bottom Action Bar - Mobile Only */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 flex gap-2 z-40">
        <button className="flex-shrink-0 flex flex-col items-center justify-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
          <MessageCircle className="h-5 w-5 text-gray-600" />
          <span className="text-xs text-gray-600 mt-1">Chat ngay</span>
        </button>
        <button 
          onClick={handleAddToCart}
          disabled={isAddingToCart}
          className={`flex-shrink-0 flex flex-col items-center justify-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all ${
            isAddingToCart ? 'scale-95 bg-green-50 border-green-500' : ''
          }`}
        >
          <ShoppingCart className={`h-5 w-5 ${isAddingToCart ? 'text-green-600' : 'text-gray-600'}`} />
          <span className={`text-xs mt-1 ${isAddingToCart ? 'text-green-600' : 'text-gray-600'}`}>Thêm vào Giỏ</span>
        </button>
        <button 
          onClick={handleBuyNow}
          className="flex-1 bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 transition-colors"
        >
          Mua với voucher {formatVietnamPrice(product.price)}
        </button>
      </div>
    </>
  );
}
