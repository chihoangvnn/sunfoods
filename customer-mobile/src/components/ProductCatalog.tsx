'use client'

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatVietnamPrice } from '@/utils/currency';
import Image from 'next/image';
import Link from 'next/link';

interface Category {
  id: string;
  name: string;
  icon?: string;
}

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

interface ProductCatalogProps {
  categories: Category[];
  selectedCategory: string;
  onCategorySelect: (categoryId: string) => void;
  isLoading?: boolean;
  bestSellerProducts?: Product[];
  newHarvestProducts?: Product[];
  topRatedProducts?: Product[];
  onProductClick?: (product: Product) => void;
}

export function ProductCatalog({ 
  categories, 
  selectedCategory, 
  onCategorySelect, 
  isLoading = false,
  bestSellerProducts = [],
  newHarvestProducts = [],
  topRatedProducts = [],
  onProductClick
}: ProductCatalogProps) {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState('bestsellers');

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

  const renderProductCard = (product: Product) => (
    <div
      key={product.id}
      onClick={() => onProductClick?.(product)}
      className="cursor-pointer group"
    >
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-gray-100">
        <div className="relative aspect-[4/5] bg-neutral-mist overflow-hidden">
          {product.media || product.image ? (
            <Image
              src={product.media || product.image || ''}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 16vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-neutral-mist">
              <span className="text-4xl">🌿</span>
            </div>
          )}
          
          {renderProductBadges(product).length > 0 && (
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {renderProductBadges(product)}
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="font-medium text-gray-800 text-sm mb-2 line-clamp-2 min-h-[2.5rem]">
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
  );

  const renderProductGrid = (products: Product[], emptyMessage: string) => {
    if (products.length === 0) {
      return (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">🌿</p>
          <p className="mt-2">{emptyMessage}</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {products.map(renderProductCard)}
      </div>
    );
  };

  if (isLoading || categories.length === 0) {
    return (
      <div className="bg-gradient-to-b from-white to-neutral-mist/20 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-gray-800 text-center">Danh mục sản phẩm</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 border border-gray-100">
                <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-2 animate-pulse" />
                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-white to-neutral-mist/20 py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-gray-800 text-center">Danh mục sản phẩm</h2>
        
        {/* Curated Collections Tab Row */}
        <div className="mb-8">
          <div className="flex gap-3 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <button
              onClick={() => setActiveTab('bestsellers')}
              className={`
                flex-shrink-0 rounded-xl px-6 py-3 transition-all duration-200 font-medium
                ${activeTab === 'bestsellers'
                  ? 'bg-sunrise-leaf text-white shadow-md'
                  : 'bg-white text-gray-700 hover:shadow-sm'
                }
              `}
            >
              🌟 Bán chạy
            </button>
            <button
              onClick={() => setActiveTab('newharvest')}
              className={`
                flex-shrink-0 rounded-xl px-6 py-3 transition-all duration-200 font-medium
                ${activeTab === 'newharvest'
                  ? 'bg-sunrise-leaf text-white shadow-md'
                  : 'bg-white text-gray-700 hover:shadow-sm'
                }
              `}
            >
              🆕 Mới về
            </button>
            <button
              onClick={() => setActiveTab('toprated')}
              className={`
                flex-shrink-0 rounded-xl px-6 py-3 transition-all duration-200 font-medium
                ${activeTab === 'toprated'
                  ? 'bg-sunrise-leaf text-white shadow-md'
                  : 'bg-white text-gray-700 hover:shadow-sm'
                }
              `}
            >
              🏆 Đánh giá cao
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'bestsellers' ? (
          renderProductGrid(bestSellerProducts, 'Không có sản phẩm bán chạy')
        ) : activeTab === 'newharvest' ? (
          renderProductGrid(newHarvestProducts, 'Không có sản phẩm mới')
        ) : (
          renderProductGrid(topRatedProducts, 'Không có sản phẩm đánh giá cao')
        )}

        {/* View All Categories Button */}
        <div className="mt-8 text-center">
          <Link href="/categories">
            <button className="
              bg-white text-sunrise-leaf
              hover:bg-sunrise-leaf hover:text-white
              px-8 py-3 rounded-xl font-semibold
              transition-all duration-200
              shadow-sm hover:shadow-md
              inline-flex items-center gap-2
            ">
              <span>Xem tất cả danh mục</span>
              <span>→</span>
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
