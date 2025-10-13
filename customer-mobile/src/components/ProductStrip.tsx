'use client'

import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatVietnamPrice } from '@/utils/currency';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

interface Product {
  id: string;
  slug?: string;
  name: string;
  price: number;
  originalPrice?: number;
  image?: string;
  media?: string;
  category_id: string;
  stock: number;
  short_description?: string;
  status: string;
  benefits?: string | string[];
  isNew?: boolean;
  isTopseller?: boolean;
  isFreeshipping?: boolean;
  isBestseller?: boolean;
  rating?: number;
  reviewCount?: number;
  totalReviews?: number;
  positivePercent?: number;
  createdAt?: string | Date;
}

interface ProductStripProps {
  title: string;
  subtitle?: string;
  products: Product[];
  onProductClick: (product: Product) => void;
  icon?: React.ReactNode;
}

export function ProductStrip({ title, subtitle, products, onProductClick, icon }: ProductStripProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    
    const scrollAmount = 300;
    const newScrollPosition = scrollContainerRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
    
    scrollContainerRef.current.scrollTo({
      left: newScrollPosition,
      behavior: 'smooth'
    });
  };

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setShowLeftArrow(scrollLeft > 0);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
  };

  const renderProductBadges = (product: Product) => {
    const badges = [];
    
    if (product.isNew) {
      badges.push(
        <Badge key="new" variant="new" className="text-xs">
          🆕 MỚI
        </Badge>
      );
    }
    
    if (product.isBestseller) {
      badges.push(
        <Badge key="bestseller" variant="bestseller" className="text-xs">
          ⭐ BÁN CHẠY
        </Badge>
      );
    }
    
    return badges;
  };

  return (
    <div className="w-full px-6 lg:px-8 xl:px-12 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            {icon && <span className="text-3xl">{icon}</span>}
            <h2 className="text-sunrise-leaf font-bold text-2xl">{title}</h2>
          </div>
          {subtitle && (
            <p className="text-gray-600 text-sm">{subtitle}</p>
          )}
        </div>

        {/* Products Carousel */}
        <div className="relative group">
          {/* Left Arrow - Desktop Only */}
          {showLeftArrow && (
            <button
              onClick={() => scroll('left')}
              className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-warm-sun text-white rounded-full p-3 shadow-lg hover:bg-warm-sun/90 transition-all opacity-0 group-hover:opacity-100"
              aria-label="Previous products"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}

          {/* Right Arrow - Desktop Only */}
          {showRightArrow && (
            <button
              onClick={() => scroll('right')}
              className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-warm-sun text-white rounded-full p-3 shadow-lg hover:bg-warm-sun/90 transition-all opacity-0 group-hover:opacity-100"
              aria-label="Next products"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}

          {/* Gradient Fade Indicators */}
          <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-white to-transparent pointer-events-none z-[5] opacity-0 group-hover:opacity-100 transition-opacity hidden md:block" />
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white to-transparent pointer-events-none z-[5] opacity-0 group-hover:opacity-100 transition-opacity hidden md:block" />

          {/* Scroll Container */}
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {products.map((product) => (
              <div
                key={product.id}
                onClick={() => onProductClick(product)}
                className="flex-shrink-0 snap-start min-w-[160px] md:min-w-[200px] cursor-pointer group/card"
              >
                {/* Product Card */}
                <div className="bg-white border border-neutral-mist/30 rounded-xl overflow-hidden transition-all hover:scale-105 hover:shadow-lg">
                  {/* Product Image */}
                  <div className="relative aspect-[4/5] bg-neutral-mist overflow-hidden">
                    {product.media || product.image ? (
                      <Image
                        src={product.media || product.image || ''}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 160px, 200px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-neutral-mist">
                        <span className="text-4xl">🌿</span>
                      </div>
                    )}
                    
                    {/* Badges Overlay */}
                    {renderProductBadges(product).length > 0 && (
                      <div className="absolute top-2 left-2 flex flex-col gap-1">
                        {renderProductBadges(product)}
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-3">
                    <h3 className="font-medium text-gray-900 text-sm mb-2 line-clamp-2 min-h-[2.5rem]">
                      {product.name}
                    </h3>
                    <p className="text-sunrise-leaf font-semibold text-lg">
                      {formatVietnamPrice(product.price)}
                    </p>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <p className="text-gray-400 text-sm line-through">
                        {formatVietnamPrice(product.originalPrice)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hide scrollbar globally for this component */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
