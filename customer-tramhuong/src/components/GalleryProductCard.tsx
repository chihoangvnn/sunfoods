'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, ZoomIn } from 'lucide-react';
import { formatVietnamPrice } from '@/utils/currency';
import { Product } from '@/types/api';

interface GalleryProductCardProps {
  product: Product;
}

export const GalleryProductCard: React.FC<GalleryProductCardProps> = ({ product }) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const rating = product.rating || 4.5;
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  const weight = product.specifications?.weight || 'N/A';
  const size = product.specifications?.size || 'N/A';

  return (
    <>
      <Link
        href={`/product/${product.slug || product.id}`}
        className="group relative block overflow-hidden rounded-xl backdrop-blur-xl will-change-transform transition-all duration-300 bg-[#FFFFFF]/85 border border-tramhuong-accent/20 shadow-[0_2px_8px_rgba(193,168,117,0.1),0_8px_24px_rgba(193,168,117,0.15)]
        hover:-translate-y-2 hover:border-tramhuong-accent/40 hover:shadow-[0_4px_16px_rgba(193,168,117,0.2),0_12px_32px_rgba(193,168,117,0.25)]"
      >
        <div className="relative aspect-[3/4] overflow-hidden">
          <div className="absolute inset-0 border border-tramhuong-accent/30" />
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
              quality={85}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-tramhuong-bg/30">
              <span className="text-sm font-nunito text-tramhuong-accent">Sản phẩm</span>
            </div>
          )}
          
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsZoomed(true);
            }}
            className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/60 backdrop-blur-md border border-tramhuong-accent/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-tramhuong-accent/20"
          >
            <ZoomIn className="h-5 w-5 text-tramhuong-primary" />
          </button>

          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {[0, 1, 2].map((idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === 0 ? 'w-6 bg-tramhuong-accent' : 'w-1.5 bg-tramhuong-accent/40'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="p-5 space-y-3">
          <h3 className="font-playfair text-lg leading-tight line-clamp-2 font-semibold text-tramhuong-primary">
            {product.name}
          </h3>

          <div className="flex items-center justify-between text-sm font-nunito">
            <div className="flex items-center gap-2">
              <span className="text-tramhuong-primary/60">Trọng lượng:</span>
              <span className="font-semibold text-tramhuong-accent">{weight}</span>
            </div>
            {size !== 'N/A' && (
              <div className="flex items-center gap-2">
                <span className="text-tramhuong-primary/60">Size:</span>
                <span className="font-semibold text-tramhuong-accent">{size}</span>
              </div>
            )}
          </div>

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

          <div className="pt-2 border-t border-tramhuong-accent/20">
            <span className="font-playfair text-2xl font-bold text-tramhuong-primary">
              {formatVietnamPrice(product.price)}
            </span>
          </div>
        </div>
      </Link>

      {isZoomed && (
        <div
          className="fixed inset-0 z-50 bg-tramhuong-primary/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300"
          onClick={() => setIsZoomed(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full h-full">
            {product.image && (
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-contain"
                quality={95}
              />
            )}
            <button
              onClick={() => setIsZoomed(false)}
              className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/80 backdrop-blur-md border border-tramhuong-accent/40 flex items-center justify-center hover:bg-tramhuong-accent/20 transition-all duration-300"
            >
              <span className="text-tramhuong-primary text-2xl">&times;</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};
