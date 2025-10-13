'use client';

import { ShoppingCart } from 'lucide-react';
import { formatVietnamPrice } from '@/utils/formatPrice';

interface FloatingCartButtonProps {
  itemCount: number;
  totalAmount: number;
  onClick: () => void;
}

export default function FloatingCartButton({ itemCount, totalAmount, onClick }: FloatingCartButtonProps) {
  if (itemCount === 0) return null;
  
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 p-4 bg-gradient-to-t from-white via-white to-transparent pointer-events-none">
      <button
        onClick={onClick}
        className="w-full bg-white/60 backdrop-blur-md text-tramhuong-accent py-4 rounded-lg shadow-[0_8px_32px_rgba(193,168,117,0.3)] flex items-center justify-between px-6 active:scale-95 transition-all duration-300 hover:bg-white/70 pointer-events-auto border border-tramhuong-accent/30"
      >
        <div className="flex items-center gap-3">
          <ShoppingCart className="w-6 h-6 text-tramhuong-accent" />
          <span className="font-playfair font-semibold text-lg">Xem đơn hàng ({itemCount} món)</span>
        </div>
        <div className="text-lg font-bold bg-white text-tramhuong-primary px-3 py-1 rounded-md">
          {formatVietnamPrice(totalAmount)}
        </div>
      </button>
    </div>
  );
}
