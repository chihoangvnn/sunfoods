'use client'

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, ShoppingCart } from 'lucide-react';
import { formatVietnamPrice } from '@/utils/currency';

interface ProductCardProps {
  product: {
    id: string;
    slug?: string;
    name: string;
    price: number;
    originalPrice?: number;
    image?: string;
    media?: string;
    short_description?: string;
    stock: number;
    isNew?: boolean;
    rating?: number;
    reviewCount?: number;
  };
  onAddToCart?: (product: any) => void;
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  className = ''
}) => {
  const rating = product.rating || 4.5;
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  
  const mediaUrl = product.media || product.image || '';
  const isVideo = /\.(mp4|webm|mov)$/i.test(mediaUrl);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (onAddToCart) {
      onAddToCart(product);
    }
  };

  return (
    <Link
      href={`/product/${product.slug || product.id}`}
      className={`group relative block overflow-hidden rounded-xl backdrop-blur-xl will-change-transform transition-all duration-300 ${className}`}
      style={{
        background: 'rgba(255, 255, 255, 0.85)',
        border: '1px solid rgba(193, 168, 117, 0.2)',
        boxShadow: '0 2px 8px rgba(193, 168, 117, 0.1), 0 8px 24px rgba(193, 168, 117, 0.15)',
      }}
      onMouseEnter={(e) => {
        const target = e.currentTarget as HTMLElement;
        target.style.transform = 'translateY(-8px)';
        target.style.borderColor = 'rgba(193, 168, 117, 0.4)';
        target.style.boxShadow = '0 4px 16px rgba(193, 168, 117, 0.2), 0 12px 32px rgba(193, 168, 117, 0.25)';
      }}
      onMouseLeave={(e) => {
        const target = e.currentTarget as HTMLElement;
        target.style.transform = 'translateY(0)';
        target.style.borderColor = 'rgba(193, 168, 117, 0.2)';
        target.style.boxShadow = '0 2px 8px rgba(193, 168, 117, 0.1), 0 8px 24px rgba(193, 168, 117, 0.15)';
      }}
    >
      {product.isNew && (
        <div className="absolute -top-2 -right-2 z-10">
          <div 
            className="flex items-center justify-center w-12 h-12 rounded-full border-2 border-white font-bold text-[10px] text-white"
            style={{
              background: 'linear-gradient(135deg, #3D2B1F 0%, #C1A875 100%)',
              boxShadow: '0 4px 12px rgba(193, 168, 117, 0.4)',
            }}
          >
            MỚI
          </div>
        </div>
      )}

      <div className="relative aspect-[4/5] overflow-hidden">
        <div 
          className="absolute inset-0 border"
          style={{
            borderColor: 'rgba(193, 168, 117, 0.3)',
          }}
        />
        {isVideo ? (
          <video
            src={mediaUrl}
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            quality={85}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ color: '#C1A875' }}>
            <span className="text-sm font-nunito">Sản phẩm</span>
          </div>
        )}
      </div>

      <div className="p-5 md:p-6 space-y-4">
        <h3 
          className="font-playfair text-lg leading-tight line-clamp-2 font-medium"
          style={{ color: '#3D2B1F' }}
          title={product.name}
        >
          {product.name}
        </h3>

        {product.short_description && (
          <p 
            className="font-nunito text-sm line-clamp-2 leading-relaxed"
            style={{ color: 'rgba(61, 43, 31, 0.7)' }}
          >
            {product.short_description}
          </p>
        )}

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="relative">
                <Star
                  className="h-4 w-4"
                  style={{
                    fill: index < fullStars ? '#3D2B1F' : (index === fullStars && hasHalfStar ? '#3D2B1F' : '#E5E7EB'),
                    color: index < fullStars ? '#3D2B1F' : (index === fullStars && hasHalfStar ? '#3D2B1F' : '#E5E7EB'),
                  }}
                />
                <Star
                  className="h-4 w-4 absolute top-0 left-0"
                  style={{
                    fill: 'none',
                    stroke: '#3D2B1F',
                    strokeWidth: 1,
                    opacity: index < fullStars || (index === fullStars && hasHalfStar) ? 1 : 0,
                  }}
                />
              </div>
            ))}
            <span className="text-gray-600 font-nunito text-sm ml-1">
              ({rating.toFixed(1)})
            </span>
          </div>

          <div className="relative inline-block">
            <span 
              className="font-playfair text-2xl font-bold"
              style={{ color: '#3D2B1F' }}
            >
              {formatVietnamPrice(product.price)}
            </span>
            <div 
              className="absolute bottom-0 left-0 right-0 h-0.5"
              style={{
                background: 'linear-gradient(90deg, #C1A875 0%, rgba(193, 168, 117, 0.3) 100%)',
              }}
            />
          </div>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className="w-full font-nunito font-bold text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: product.stock > 0 ? 'linear-gradient(135deg, #3D2B1F 0%, #C1A875 100%)' : 'rgba(193, 168, 117, 0.3)',
            minHeight: '44px',
          }}
          onMouseEnter={(e) => {
            if (product.stock > 0) {
              const target = e.currentTarget as HTMLElement;
              target.style.transform = 'scale(1.02)';
              target.style.background = 'linear-gradient(135deg, #C1A875 0%, #3D2B1F 100%)';
              target.style.boxShadow = '0 8px 24px rgba(193, 168, 117, 0.5)';
            }
          }}
          onMouseLeave={(e) => {
            if (product.stock > 0) {
              const target = e.currentTarget as HTMLElement;
              target.style.transform = 'scale(1)';
              target.style.background = 'linear-gradient(135deg, #3D2B1F 0%, #C1A875 100%)';
              target.style.boxShadow = 'none';
            }
          }}
        >
          <ShoppingCart className="h-5 w-5" />
          <span>{product.stock > 0 ? 'Thêm vào giỏ' : 'Hết hàng'}</span>
        </button>
      </div>
    </Link>
  );
};
