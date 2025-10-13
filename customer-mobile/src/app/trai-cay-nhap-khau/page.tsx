'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ShoppingBag, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MediaViewer } from '@/components/MediaViewer';
import { formatVietnamPrice } from '@/utils/currency';
import { fetchProducts } from '@/services/apiService';
import { StorefrontBottomNav } from '@/components/StorefrontBottomNav';
import { CategoryNavigationMenu } from '@/components/CategoryNavigationMenu';

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
}

type CountryFilter = 'all' | 'us' | 'au' | 'jp' | 'kr';

const COUNTRY_FILTERS = [
  { value: 'all' as CountryFilter, label: 'Tất cả', flag: '🌍' },
  { value: 'us' as CountryFilter, label: 'Mỹ', flag: '🇺🇸' },
  { value: 'au' as CountryFilter, label: 'Úc', flag: '🇦🇺' },
  { value: 'jp' as CountryFilter, label: 'Nhật', flag: '🇯🇵' },
  { value: 'kr' as CountryFilter, label: 'Hàn', flag: '🇰🇷' },
];

const getProductCountry = (name: string): CountryFilter => {
  const nameLower = name.toLowerCase();
  if (nameLower.includes('mỹ') || nameLower.includes('california') || nameLower.includes('washington')) return 'us';
  if (nameLower.includes('úc') || nameLower.includes('australia')) return 'au';
  if (nameLower.includes('nhật') || nameLower.includes('japan')) return 'jp';
  if (nameLower.includes('hàn') || nameLower.includes('korea')) return 'kr';
  return 'us';
};

export default function TraiCayNhapKhauPage() {
  const router = useRouter();
  const [selectedCountry, setSelectedCountry] = useState<CountryFilter>('all');

  const { 
    data: products = [], 
    isLoading 
  } = useQuery<Product[]>({
    queryKey: ['imported-fruits-products'],
    queryFn: async () => {
      try {
        return await fetchProducts({
          categoryId: 'trai-cay-nhap',
          limit: 50,
          sortBy: 'newest',
          sortOrder: 'desc'
        });
      } catch (error) {
        console.error('Failed to fetch products:', error);
        return [];
      }
    },
    staleTime: 30000,
  });

  const filteredProducts = products.filter(product => {
    if (selectedCountry === 'all') return true;
    return getProductCountry(product.name) === selectedCountry;
  });

  const handleProductClick = (product: Product) => {
    router.push(`/product/${product.slug || product.id}`);
  };

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    console.log('Add to cart:', product);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50 pb-20">
      {/* Premium Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-rose-200 shadow-lg">
        <div className="flex items-center gap-3 px-4 py-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="p-2 hover:bg-rose-100 rounded-full transition-all"
          >
            <ArrowLeft className="h-5 w-5 text-rose-600" />
          </Button>
          
          <div className="flex items-center gap-3 flex-1">
            <span className="text-3xl">🍎</span>
            <h1 className="text-xl md:text-2xl font-serif font-bold bg-gradient-to-r from-rose-600 to-orange-600 bg-clip-text text-transparent">
              Trái Cây Nhập Khẩu
            </h1>
            <Sparkles className="h-5 w-5 text-amber-400" />
          </div>
          
          <div className="text-sm font-semibold text-rose-600 bg-rose-100 px-3 py-1 rounded-full">
            {filteredProducts.length} SP
          </div>
        </div>
      </div>

      {/* Category Navigation Menu */}
      <CategoryNavigationMenu activeCategory="trai-cay-nhap-khau" />

      {/* Premium Country Filter */}
      <div className="sticky top-[120px] z-40 bg-white/90 backdrop-blur-md border-b border-rose-200 shadow-md overflow-x-auto touch-pan-x [&::-webkit-scrollbar]:hidden [-webkit-overflow-scrolling:touch] [scrollbar-width:none]">
        <div className="flex gap-3 px-4 py-3">
          {COUNTRY_FILTERS.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setSelectedCountry(filter.value)}
              className={`
                flex-shrink-0 px-4 py-2 rounded-full text-sm font-serif font-medium transition-all flex items-center gap-2
                ${selectedCountry === filter.value 
                  ? 'bg-gradient-to-r from-rose-600 to-orange-600 text-white' 
                  : 'border-2 border-rose-300 text-rose-700 hover:border-rose-500'
                }
              `}
            >
              <span className="text-lg">{filter.flag}</span>
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Premium Products Grid */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border-2 border-rose-100 overflow-hidden">
                <div className="aspect-[4/3] bg-gradient-to-br from-rose-200 to-orange-200 animate-pulse" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-rose-200 rounded animate-pulse" />
                  <div className="h-6 bg-orange-200 rounded w-2/3 animate-pulse" />
                  <div className="h-10 bg-amber-200 rounded-2xl animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🍎</div>
            <h3 className="text-xl font-serif font-bold text-rose-800 mb-2">
              Không tìm thấy sản phẩm
            </h3>
            <p className="text-rose-600 mb-6">
              Hãy thử bộ lọc khác
            </p>
            <Button
              onClick={() => setSelectedCountry('all')}
              className="bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white rounded-full px-8 py-3 shadow-lg"
            >
              Xem tất cả
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {filteredProducts.map((product, index) => {
              const productCountry = getProductCountry(product.name);
              const countryInfo = COUNTRY_FILTERS.find(c => c.value === productCountry);
              
              return (
                <div
                  key={product.id}
                  onClick={() => handleProductClick(product)}
                  className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border-2 border-transparent hover:border-rose-300 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer overflow-hidden relative"
                  style={{
                    animationDelay: `${index * 50}ms`
                  }}
                >
                  {/* NEW ARRIVAL Ribbon */}
                  {product.isNew && (
                    <div className="absolute top-0 right-0 z-10">
                      <div className="bg-gradient-to-r from-rose-500 to-orange-500 text-white text-xs font-bold px-4 py-1 rounded-bl-2xl shadow-lg">
                        NEW ARRIVAL
                      </div>
                    </div>
                  )}

                  {/* Image Container with Glass-morphism */}
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <MediaViewer
                      src={product.media || product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      isHomepage={false}
                    />
                    
                    {/* Glass-morphism Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* IMPORTED Gold Badge */}
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-900 text-xs font-bold px-3 py-1 rounded-full shadow-lg border-2 border-amber-300">
                        ✨ IMPORTED
                      </Badge>
                    </div>

                    {/* Country Badge */}
                    {countryInfo && (
                      <div className="absolute bottom-3 left-3">
                        <Badge className="bg-white/90 backdrop-blur-sm text-rose-800 text-xs font-semibold px-3 py-1 rounded-full shadow-md border border-rose-200">
      {countryInfo.flag} {countryInfo.label}
                        </Badge>
                      </div>
                    )}
                    
                    {/* Stock indicator */}
                    {product.stock === 0 && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                        <span className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                          Hết hàng
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <h3 className="font-serif font-bold text-sm md:text-base text-gray-800 line-clamp-2 mb-2 min-h-[2.5rem]">
                      {product.name}
                    </h3>
                    
                    {/* Premium Price Display */}
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-rose-600 to-orange-600 bg-clip-text text-transparent">
                        {formatVietnamPrice(product.price)}
                      </span>
                      {product.originalPrice && (
                        <span className="text-sm text-gray-400 line-through font-medium">
                          {formatVietnamPrice(product.originalPrice)}
                        </span>
                      )}
                    </div>

                    {/* Premium Add to Cart Button with Shimmer */}
                    <Button
                      disabled={product.stock === 0}
                      className="w-full bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white rounded-2xl py-3 px-6 font-semibold shadow-md hover:shadow-xl transition-all relative overflow-hidden group/btn"
                      onClick={(e) => handleAddToCart(e, product)}
                    >
                      {/* Shimmer effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
                      
                      <ShoppingBag className="h-4 w-4 mr-2" />
                      Thêm vào giỏ
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Premium Badge */}
      <div className="fixed bottom-24 right-4 bg-gradient-to-r from-rose-500 to-orange-500 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-all cursor-pointer z-30 animate-pulse">
        <Sparkles className="h-6 w-6" />
      </div>

      {/* Bottom Navigation */}
      <StorefrontBottomNav activeTab="categories" onTabChange={() => {}} />
    </div>
  );
}
