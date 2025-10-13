'use client'

import React from 'react';
import { ShoppingCart, Eye, Heart } from 'lucide-react';
import { OrganicBadges, BadgeType } from './OrganicBadges';
import { ShippingCountdown } from './ShippingCountdown';
import { useTheme } from '@/contexts/ThemeContext';

interface OrganicCardProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  image?: string;
  badges?: BadgeType[];
  price?: string;
  originalPrice?: string;
  onClick?: () => void;
  onAddToCart?: () => void;
  onQuickView?: () => void;
  className?: string;
  variant?: 'feature' | 'product' | 'category';
}

export default function OrganicCard({
  icon,
  title,
  description,
  image,
  badges = [],
  price,
  originalPrice,
  onClick,
  onAddToCart,
  onQuickView,
  className = '',
  variant = 'product'
}: OrganicCardProps) {
  const { currentTheme } = useTheme();
  
  if (variant === 'feature') {
    return (
      <div className={`bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all ${className}`}>
        <div className="flex flex-col items-center text-center space-y-3">
          {icon && <div className="text-3xl" style={{ color: currentTheme.primary }}>{icon}</div>}
          <h3 className="font-semibold text-gray-800">{title}</h3>
          {description && <p className="text-sm text-gray-600 leading-relaxed">{description}</p>}
        </div>
      </div>
    );
  }

  if (variant === 'category') {
    return (
      <button 
        onClick={onClick}
        className={`bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all border border-transparent ${className}`}
        style={{ 
          ['--hover-border-color' as string]: currentTheme.primary 
        } as React.CSSProperties}
        onMouseEnter={(e) => e.currentTarget.style.borderColor = currentTheme.primary}
        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
      >
        <div className="flex flex-col items-center text-center space-y-3">
          {icon && <div className="text-4xl" style={{ color: currentTheme.primary }}>{icon}</div>}
          <h3 className="font-medium text-gray-800">{title}</h3>
          {description && <p className="text-sm text-gray-500">{description}</p>}
        </div>
      </button>
    );
  }

  // Enhanced Product card variant with hover effects and animations
  return (
    <div 
      className={`group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 ${className}`}
      style={{
        ['--theme-primary' as string]: currentTheme.primary,
        ['--theme-secondary' as string]: currentTheme.secondary
      } as React.CSSProperties}
      onMouseEnter={(e) => e.currentTarget.style.borderColor = `${currentTheme.primary}80`}
      onMouseLeave={(e) => e.currentTarget.style.borderColor = '#f3f4f6'}
    >
      {/* Image Container with Zoom Effect */}
      <div className="relative overflow-hidden bg-gray-50">
        {image ? (
          <div className="aspect-square relative">
            <img 
              src={image} 
              alt={title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
            />
          </div>
        ) : (
          <div 
            className="aspect-square flex items-center justify-center"
            style={{
              background: `linear-gradient(to bottom right, ${currentTheme.primary}1A, ${currentTheme.secondary}33)`
            }}
          >
            <span className="text-4xl">🌿</span>
          </div>
        )}
        
        {/* Badges Overlay - Top Left */}
        {badges.length > 0 && (
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {badges.slice(0, 3).map((badge, index) => (
              <OrganicBadges 
                key={index} 
                type={badge} 
                size="sm" 
                variant="solid"
              />
            ))}
          </div>
        )}

        {/* Quick Actions Overlay - Appears on Hover */}
        <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {onQuickView && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onQuickView();
              }}
              className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white transition-colors"
              aria-label="Quick view"
            >
              <Eye className="h-4 w-4 text-gray-700" />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
            }}
            className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white transition-colors"
            aria-label="Add to wishlist"
          >
            <Heart className="h-4 w-4 text-gray-700" />
          </button>
        </div>

        {/* Discount Badge - Top Right Corner (if has discount) */}
        {originalPrice && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-md">
            SALE
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4" onClick={onClick}>
        {/* Title - Larger & Bolder on Mobile */}
        <h3 
          className="font-bold text-base md:text-lg text-gray-900 mb-2 line-clamp-2 min-h-[2.5rem] transition-colors"
          style={{
            ['--hover-text-color' as string]: currentTheme.primary
          } as React.CSSProperties}
          onMouseEnter={(e) => e.currentTarget.style.color = currentTheme.primary}
          onMouseLeave={(e) => e.currentTarget.style.color = '#111827'}
        >
          {title}
        </h3>

        {/* Description */}
        {description && (
          <p className="text-sm text-gray-500 mb-3 line-clamp-1">
            {description}
          </p>
        )}

        {/* Price Section */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span 
              className="font-bold text-lg"
              style={{ color: currentTheme.primary }}
            >
              {price}
            </span>
            {originalPrice && (
              <span className="text-gray-400 line-through text-sm">
                {originalPrice}
              </span>
            )}
          </div>
        </div>

        {/* Shipping Countdown */}
        <ShippingCountdown className="mb-3" />

        {/* Add to Cart Button */}
        {onAddToCart && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart();
            }}
            className="w-full text-white py-2.5 px-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-sm hover:shadow-md active:scale-95 group/btn"
            style={{ 
              backgroundColor: currentTheme.primary,
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            <ShoppingCart className="h-4 w-4 transition-transform group-hover/btn:scale-110" />
            <span>Thêm vào giỏ</span>
          </button>
        )}
      </div>
    </div>
  );
}
