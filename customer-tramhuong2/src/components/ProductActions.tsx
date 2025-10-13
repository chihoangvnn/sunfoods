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
          className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 border-2 border-tramhuong-accent/40 bg-white/60 backdrop-blur-sm text-tramhuong-primary rounded-lg font-playfair font-medium hover:bg-tramhuong-accent/10 hover:border-tramhuong-accent/60 hover:shadow-[0_4px_20px_rgba(193,168,117,0.25)] transition-all duration-300 ${
            isAddingToCart ? 'scale-95 bg-tramhuong-accent/10' : ''
          }`}
        >
          <ShoppingCart className={`h-5 w-5 ${isAddingToCart ? 'text-tramhuong-accent' : ''}`} />
          <span>Thêm vào Giỏ</span>
        </button>
        <button 
          onClick={handleBuyNow}
          className="flex-1 bg-gradient-to-r from-tramhuong-primary to-tramhuong-accent text-white px-6 py-3 rounded-lg font-playfair font-medium hover:shadow-[0_4px_20px_rgba(193,168,117,0.4)] hover:scale-105 transition-all duration-300"
        >
          Mua Ngay
        </button>
      </div>

      {/* Fixed Bottom Action Bar - Mobile Only */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-tramhuong-accent/20 px-4 py-3 flex gap-2 z-40 shadow-[0_-4px_24px_rgba(193,168,117,0.15)]">
        <button className="flex-shrink-0 flex flex-col items-center justify-center px-3 py-2 border border-tramhuong-accent/30 bg-white/60 backdrop-blur-sm rounded-lg hover:bg-tramhuong-accent/10 transition-all duration-300">
          <MessageCircle className="h-5 w-5 text-tramhuong-accent" />
          <span className="text-xs text-tramhuong-primary mt-1 font-nunito">Chat ngay</span>
        </button>
        <button 
          onClick={handleAddToCart}
          disabled={isAddingToCart}
          className={`flex-shrink-0 flex flex-col items-center justify-center px-3 py-2 border border-tramhuong-accent/30 bg-white/60 backdrop-blur-sm rounded-lg hover:bg-tramhuong-accent/10 transition-all duration-300 ${
            isAddingToCart ? 'scale-95 bg-tramhuong-accent/10 border-tramhuong-accent/60' : ''
          }`}
        >
          <ShoppingCart className={`h-5 w-5 ${isAddingToCart ? 'text-tramhuong-accent' : 'text-tramhuong-primary'}`} />
          <span className={`text-xs mt-1 font-nunito ${isAddingToCart ? 'text-tramhuong-accent' : 'text-tramhuong-primary'}`}>Thêm vào Giỏ</span>
        </button>
        <button 
          onClick={handleBuyNow}
          className="flex-1 bg-gradient-to-r from-tramhuong-primary to-tramhuong-accent text-white py-3 rounded-lg font-playfair font-medium hover:shadow-[0_4px_20px_rgba(193,168,117,0.4)] transition-all duration-300"
        >
          Mua với voucher {formatVietnamPrice(product.price)}
        </button>
      </div>
    </>
  );
}
