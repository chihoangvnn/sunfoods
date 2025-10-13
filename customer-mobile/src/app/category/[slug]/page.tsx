'use client'

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MediaViewer } from '@/components/MediaViewer';
import { formatVietnamPrice } from '@/utils/currency';
import { fetchProducts } from '@/services/apiService';

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

// Category mapping with proper names and icons
const CATEGORY_MAP: Record<string, { name: string; icon: string; id: string }> = {
  'rau-cu-organic': { name: 'Rau củ organic', icon: '🥬', id: 'rau-cu' },
  'trai-cay-tuoi': { name: 'Trái cây tươi', icon: '🍎', id: 'trai-cay-nhap' },
  'thuc-pham-huu-co': { name: 'Thực phẩm hữu cơ', icon: '🌾', id: 'thuc-pham-kho' },
  'sieu-thuc-pham': { name: 'Siêu thực phẩm', icon: '💪', id: 'superfood' },
  'nam-tuoi': { name: 'Nấm tươi', icon: '🍄', id: 'nam-tuoi' },
  'hat-dinh-duong': { name: 'Hạt dinh dưỡng', icon: '🌰', id: 'hat-dinh-duong' },
  'gia-vi-organic': { name: 'Gia vị organic', icon: '🌿', id: 'gia-vi' }
};

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  
  const categoryData = CATEGORY_MAP[slug];
  const categoryId = categoryData?.id || slug;
  const categoryName = categoryData?.name || 'Sản phẩm';
  const categoryIcon = categoryData?.icon || '🌿';

  // Fetch products for this category
  const { 
    data: products = [], 
    isLoading, 
    error 
  } = useQuery<Product[]>({
    queryKey: ['category-products', categoryId],
    queryFn: async () => {
      try {
        return await fetchProducts({
          limit: 50,
          offset: 0,
          categoryId: categoryId !== 'all' ? categoryId : undefined,
          sortBy: 'newest',
          sortOrder: 'desc'
        });
      } catch (error) {
        console.error('Failed to fetch category products:', error);
        return [];
      }
    },
    retry: false,
    staleTime: 30000,
  });

  const handleProductClick = (product: Product) => {
    // Navigate to product detail page (if exists) or show modal
    router.push(`/product/${product.slug || product.id}`);
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
    
    if (product.isTopseller) {
      badges.push(
        <Badge key="topseller" variant="topseller" className="text-xs">
          🏆 BÁN CHẠY
        </Badge>
      );
    }
    
    if (product.isFreeshipping) {
      badges.push(
        <Badge key="freeshipping" variant="freeshipping" className="text-xs">
          🚚 FREESHIP
        </Badge>
      );
    }
    
    return badges;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center gap-3 px-4 py-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-2 flex-1">
            <span className="text-3xl">{categoryIcon}</span>
            <h1 className="text-lg md:text-xl font-bold text-gray-900">{categoryName}</h1>
          </div>
          
          <div className="text-sm text-gray-500">
            {products.length} sản phẩm
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-3 md:px-6 py-4">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <div className="aspect-square bg-gray-200 animate-pulse" />
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">{categoryIcon}</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Chưa có sản phẩm
            </h3>
            <p className="text-gray-500 mb-6">
              Danh mục này hiện chưa có sản phẩm nào
            </p>
            <Button
              onClick={() => router.push('/')}
              className="bg-sunrise-leaf hover:bg-sunrise-leaf/90"
            >
              Về trang chủ
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {products.map((product) => (
              <div
                key={product.id}
                onClick={() => handleProductClick(product)}
                className="bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md hover:border-sunrise-leaf/30 transition-all cursor-pointer overflow-hidden"
              >
                {/* Product Image */}
                <div className="aspect-square bg-gray-100 relative">
                  <MediaViewer
                    src={product.media || product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    isHomepage={false}
                  />
                  
                  {/* Badges */}
                  {renderProductBadges(product).length > 0 && (
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      {renderProductBadges(product)}
                    </div>
                  )}
                  
                  {/* Stock indicator */}
                  {product.stock === 0 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        Hết hàng
                      </span>
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-3">
                  <h3 className="font-medium text-sm md:text-base text-gray-900 line-clamp-2 mb-1 min-h-[2.5rem]">
                    {product.name}
                  </h3>
                  
                  {/* Price */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-base md:text-lg font-bold text-sunrise-leaf">
                      {formatVietnamPrice(product.price)}
                    </span>
                    {product.originalPrice && (
                      <span className="text-xs text-gray-400 line-through">
                        {formatVietnamPrice(product.originalPrice)}
                      </span>
                    )}
                  </div>

                  {/* Rating */}
                  {product.rating && (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <span className="text-yellow-500">★</span>
                      <span>{product.rating}</span>
                      {product.totalReviews && (
                        <span>({product.totalReviews})</span>
                      )}
                    </div>
                  )}

                  {/* Add to Cart Button */}
                  <Button
                    size="sm"
                    disabled={product.stock === 0}
                    className="w-full mt-2 bg-warm-sun hover:bg-warm-sun/90 text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Add to cart logic here
                      console.log('Add to cart:', product);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Thêm vào giỏ
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
