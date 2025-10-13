'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import { Star } from 'lucide-react';
import { formatVietnamPrice } from '@/utils/currency';
import { Product } from '@/types/api';
import { JewelryCarousel } from './JewelryCarousel';
import { GradeBadge } from './GradeBadge';
import { BeadCountBadge } from './BeadCountBadge';
import { CertificateBadge } from './CertificateBadge';
import { InteractiveSizeSelector, getBraceletSizes } from './InteractiveSizeSelector';
import { GiftPackagingIndicator } from './GiftPackagingIndicator';

interface BraceletProductCardProps {
  product: Product;
  onSizeSelect?: (size: string) => void;
}

export const BraceletProductCard: React.FC<BraceletProductCardProps> = ({ 
  product,
  onSizeSelect 
}) => {
  const [selectedSize, setSelectedSize] = useState<string | undefined>(undefined);
  
  const rating = product.rating || 4.5;
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  const handleSizeSelect = (size: string) => {
    setSelectedSize(size);
    onSizeSelect?.(size);
  };

  // Prepare images for carousel (support both images array and single image)
  const carouselImages = product.images && product.images.length > 0 
    ? product.images 
    : product.image 
    ? [product.image] 
    : [];

  // Extract product data with backward compatibility
  const grade = product.grade as 'AAA' | 'AA+' | 'A+' | 'A' | undefined;
  const beadCount = product.beadCount || product.specifications?.beadCount;
  const beadSize = product.beadSize || product.specifications?.beadSize || '10mm';
  const hasCertificate = product.hasCertificate || false;
  const isGiftReady = product.isGiftReady || false;

  return (
    <Link
      href={`/product/${product.slug || product.id}`}
      className="group relative block overflow-hidden rounded-xl backdrop-blur-xl will-change-transform transition-all duration-200 bg-[#FFFFFF]/85 border border-tramhuong-accent/20 shadow-[0_2px_8px_rgba(193,168,117,0.1),0_8px_24px_rgba(193,168,117,0.15)]
      hover:-translate-y-2 hover:border-tramhuong-accent/40 hover:shadow-[0_4px_16px_rgba(193,168,117,0.2),0_12px_32px_rgba(193,168,117,0.25)]"
    >
      {/* Badge Stack - Top Left */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
        {grade && <GradeBadge grade={grade} />}
        {beadCount && <BeadCountBadge count={beadCount} size={beadSize} />}
      </div>

      {/* Image Carousel */}
      <div className="relative">
        <JewelryCarousel 
          images={carouselImages}
          productName={product.name}
          aspectRatio="aspect-square"
        />
        
        {/* Certificate Badge - Bottom Left of Carousel */}
        {hasCertificate && (
          <div className="absolute bottom-3 left-3 z-10">
            <CertificateBadge hasCertificate={true} />
          </div>
        )}
      </div>

      {/* Product Information */}
      <div className="p-4 space-y-3">
        <h3 className="font-playfair text-base leading-tight line-clamp-2 font-semibold text-tramhuong-primary">
          {product.name}
        </h3>

        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, index) => (
            <Star
              key={index}
              className="h-3.5 w-3.5"
              fill={index < fullStars || (index === fullStars && hasHalfStar) ? '#3D2B1F' : '#E5E7EB'}
              stroke={index < fullStars || (index === fullStars && hasHalfStar) ? '#C1A875' : '#D1D5DB'}
              strokeWidth={1}
            />
          ))}
          <span className="font-nunito text-xs text-tramhuong-primary/60 ml-1">
            ({rating.toFixed(1)})
          </span>
        </div>

        {product.short_description && (
          <p className="font-nunito text-xs line-clamp-2 text-tramhuong-primary/70 leading-relaxed">
            {product.short_description}
          </p>
        )}

        {/* Size Selector */}
        <InteractiveSizeSelector
          sizes={getBraceletSizes()}
          selectedSize={selectedSize}
          onSizeSelect={handleSizeSelect}
          productType="bracelet"
        />

        {/* Price Section */}
        <div className="pt-2 border-t border-tramhuong-accent/20 space-y-2">
          <span className="font-playfair text-xl font-bold text-tramhuong-primary">
            {formatVietnamPrice(product.price)}
          </span>
          
          {/* Gift Packaging Indicator */}
          {isGiftReady && (
            <div className="pt-1">
              <GiftPackagingIndicator isGiftReady={true} />
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};
