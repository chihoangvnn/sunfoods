'use client'

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, Clock, Flame } from 'lucide-react';
import { formatVietnamPrice } from '@/utils/currency';
import { Product } from '@/types/api';

interface IncenseProductCardProps {
  product: Product;
}

export const IncenseProductCard: React.FC<IncenseProductCardProps> = ({ product }) => {
  const rating = product.rating || 4.5;
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  const scent = product.specifications?.scent || 'Thơm nhẹ';
  const burnTime = product.specifications?.burnTime || '60 phút';
  const packageSize = product.specifications?.packageSize || '20';
  const usage = product.specifications?.usage || 'Thờ cúng';

  const getScentColor = (scentType: string) => {
    if (scentType.includes('nhẹ')) return 'bg-tramhuong-accent/20 text-tramhuong-accent border-tramhuong-accent/40';
    if (scentType.includes('Đậm')) return 'bg-tramhuong-primary/20 text-tramhuong-primary border-tramhuong-primary/40';
    return 'bg-tramhuong-accent/30 text-tramhuong-primary border-tramhuong-accent/50';
  };

  return (
    <Link
      href={`/product/${product.slug || product.id}`}
      className="group relative block overflow-hidden rounded-xl backdrop-blur-xl will-change-transform transition-all duration-300 bg-[#FFFFFF]/85 border border-tramhuong-accent/20 shadow-[0_2px_8px_rgba(193,168,117,0.1),0_8px_24px_rgba(193,168,117,0.15)]
      hover:-translate-y-2 hover:border-tramhuong-accent/40 hover:shadow-[0_4px_16px_rgba(193,168,117,0.2),0_12px_32px_rgba(193,168,117,0.25)]"
    >
      <div className="relative aspect-[4/5] overflow-hidden">
        <div className="absolute inset-0 border border-tramhuong-accent/30" />
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
            quality={85}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-tramhuong-bg/30">
            <Flame className="h-12 w-12 text-tramhuong-accent" />
          </div>
        )}

        <div className="absolute top-3 right-3 z-10">
          <div className={`px-3 py-1.5 rounded-full backdrop-blur-sm border font-nunito text-xs font-semibold shadow-lg ${getScentColor(scent)}`}>
            {scent}
          </div>
        </div>

        <div className="absolute bottom-3 left-3 right-3 z-10 flex gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 backdrop-blur-sm text-tramhuong-primary text-xs font-nunito font-semibold shadow-md">
            <Clock className="h-3 w-3 text-tramhuong-accent" />
            {burnTime}
          </div>
          <div className="px-3 py-1.5 rounded-full bg-tramhuong-accent/90 backdrop-blur-sm text-white text-xs font-nunito font-semibold shadow-md">
            {packageSize} que
          </div>
        </div>
      </div>

      <div className="p-5 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-playfair text-lg leading-tight line-clamp-2 font-semibold text-tramhuong-primary flex-1">
            {product.name}
          </h3>
          <div className="px-2 py-1 rounded-md bg-tramhuong-primary/10 text-tramhuong-primary text-xs font-nunito font-medium whitespace-nowrap">
            {usage}
          </div>
        </div>

        {product.short_description && (
          <p className="font-nunito text-sm line-clamp-2 text-tramhuong-primary/70 leading-relaxed">
            {product.short_description}
          </p>
        )}

        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, index) => (
            <Star
              key={index}
              className="h-4 w-4"
              fill={index < fullStars || (index === fullStars && hasHalfStar) ? '#3D2B1F' : '#E5E7EB'}
              stroke={index < fullStars || (index === fullStars && hasHalfStar) ? '#C1A875' : '#D1D5DB'}
              strokeWidth={1}
            />
          ))}
          <span className="font-nunito text-sm text-tramhuong-primary/60 ml-1">
            ({rating.toFixed(1)})
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {['10 que', '20 que', '50 que', '100 que'].map((pkg) => (
            <button
              key={pkg}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              className="px-2 py-1 rounded-md bg-tramhuong-accent/10 text-tramhuong-accent text-xs font-nunito font-medium border border-tramhuong-accent/30 hover:bg-tramhuong-accent/20 hover:border-tramhuong-accent/50 transition-all duration-300"
            >
              {pkg}
            </button>
          ))}
        </div>

        <div className="pt-3 border-t border-tramhuong-accent/20">
          <span className="font-playfair text-2xl font-bold text-tramhuong-primary">
            {formatVietnamPrice(product.price)}
          </span>
        </div>
      </div>
    </Link>
  );
};
