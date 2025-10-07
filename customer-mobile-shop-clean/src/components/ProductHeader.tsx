'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Search, Share2, ShoppingCart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';
import { useIsMobile } from '@/hooks/use-mobile';

interface ProductHeaderProps {
  productName: string;
}

export default function ProductHeader({ productName }: ProductHeaderProps) {
  const router = useRouter();
  const { getCartItemsCount } = useCart();
  const isMobile = useIsMobile();
  const [scrolled, setScrolled] = useState(false);

  const cartItemsCount = getCartItemsCount();

  const handleNavigateBack = useCallback(() => {
    const isInternalNav = sessionStorage.getItem('internal-nav') === 'true';
    
    if (isInternalNav && window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
    
    sessionStorage.removeItem('internal-nav');
  }, [router]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!isMobile) return;

    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;
    let isSwiping = false;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      touchStartTime = Date.now();
      
      isSwiping = touchStartX < 50;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isSwiping) return;

      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStartX;
      const deltaY = Math.abs(touch.clientY - touchStartY);

      if (Math.abs(deltaX) > deltaY && deltaX > 10) {
        e.preventDefault();
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!isSwiping) return;

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartX;
      const deltaY = Math.abs(touch.clientY - touchStartY);
      const deltaTime = Date.now() - touchStartTime;
      
      const velocity = Math.abs(deltaX) / deltaTime;

      if (
        deltaX > 0 && 
        deltaX > deltaY * 2 && 
        (deltaX > 100 || velocity > 0.5)
      ) {
        handleNavigateBack();
      }

      isSwiping = false;
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleNavigateBack, isMobile]);

  return (
    <>
      {/* Sticky Top Bar - appears on scroll (Mobile only) */}
      <div
        className={`lg:hidden fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white shadow-md translate-y-0'
            : 'bg-transparent -translate-y-full'
        }`}
      >
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={handleNavigateBack}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1 bg-gray-100 rounded-lg px-3 py-2 flex items-center gap-2">
            <Search className="h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder={productName}
              className="bg-transparent flex-1 text-sm outline-none"
              readOnly
            />
          </div>
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <Share2 className="h-5 w-5" />
          </button>
          <button 
            onClick={() => router.push('/cart')}
            className="p-2 hover:bg-gray-100 rounded-full relative"
          >
            <ShoppingCart className="h-5 w-5" />
            {cartItemsCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                {cartItemsCount}
              </Badge>
            )}
          </button>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:block bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 lg:px-12 py-4 flex items-center gap-4">
          <button
            onClick={handleNavigateBack}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1 flex items-center gap-4">
            <h1 className="text-lg font-bold truncate">{productName}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <Share2 className="h-5 w-5" />
            </button>
            <button 
              onClick={() => router.push('/cart')}
              className="p-2 hover:bg-gray-100 rounded-full relative"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartItemsCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                  {cartItemsCount}
                </Badge>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Back button & Action buttons overlay for carousel (Mobile only) */}
      <div className="lg:hidden absolute top-0 left-0 right-0 z-10 flex items-start justify-between p-4">
        <button
          onClick={handleNavigateBack}
          className="p-2 bg-black/30 hover:bg-black/50 rounded-full text-white"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex gap-2">
          <button className="p-2 bg-black/30 hover:bg-black/50 rounded-full text-white">
            <Share2 className="h-5 w-5" />
          </button>
          <button 
            onClick={() => router.push('/cart')}
            className="p-2 bg-black/30 hover:bg-black/50 rounded-full text-white relative"
          >
            <ShoppingCart className="h-5 w-5" />
            {cartItemsCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                {cartItemsCount}
              </Badge>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
