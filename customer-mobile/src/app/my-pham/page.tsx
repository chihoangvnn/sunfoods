'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ShoppingBag, Heart, Star, Sparkles, Eye, X } from 'lucide-react';
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

type SkinType = 'all' | 'da-kho' | 'da-dau' | 'da-hon-hop' | 'da-nhay-cam';

const SKIN_TYPE_FILTERS = [
  { value: 'all' as SkinType, label: 'Tất cả loại da' },
  { value: 'da-kho' as SkinType, label: 'Da khô' },
  { value: 'da-dau' as SkinType, label: 'Da dầu' },
  { value: 'da-hon-hop' as SkinType, label: 'Da hỗn hợp' },
  { value: 'da-nhay-cam' as SkinType, label: 'Da nhạy cảm' },
];

const BRANDS = ['All Brands', 'Laneige', 'Sulwhasoo', 'Innisfree', 'Etude House', 'The Face Shop'];

const getProductSkinType = (name: string, description?: string): SkinType => {
  const text = (name + ' ' + (description || '')).toLowerCase();
  if (text.includes('da khô') || text.includes('dưỡng ẩm')) return 'da-kho';
  if (text.includes('da dầu') || text.includes('kiểm soát dầu')) return 'da-dau';
  if (text.includes('da hỗn hợp')) return 'da-hon-hop';
  if (text.includes('da nhạy cảm') || text.includes('nhẹ nhàng')) return 'da-nhay-cam';
  return 'all';
};

const getProductBrand = (name: string): string => {
  const nameLower = name.toLowerCase();
  if (nameLower.includes('laneige')) return 'Laneige';
  if (nameLower.includes('sulwhasoo')) return 'Sulwhasoo';
  if (nameLower.includes('innisfree')) return 'Innisfree';
  if (nameLower.includes('etude')) return 'Etude House';
  if (nameLower.includes('face shop')) return 'The Face Shop';
  return 'Premium Brand';
};

const StarRating = ({ rating = 5, reviewCount = 0 }: { rating?: number; reviewCount?: number }) => (
  <div className="flex items-center gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        className={`h-4 w-4 ${
          star <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
        }`}
      />
    ))}
    <span className="text-xs text-gray-500 ml-1">({reviewCount})</span>
  </div>
);

export default function MyPhamPage() {
  const router = useRouter();
  const [selectedSkinType, setSelectedSkinType] = useState<SkinType>('all');
  const [selectedBrand, setSelectedBrand] = useState('All Brands');
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const { 
    data: products = [], 
    isLoading 
  } = useQuery<Product[]>({
    queryKey: ['cosmetics-products'],
    queryFn: async () => {
      try {
        return await fetchProducts({
          categoryId: 'my-pham',
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
    const skinTypeMatch = selectedSkinType === 'all' || 
      getProductSkinType(product.name, product.short_description) === selectedSkinType;
    
    const brandMatch = selectedBrand === 'All Brands' || 
      getProductBrand(product.name) === selectedBrand;
    
    return skinTypeMatch && brandMatch;
  });

  const handleProductClick = (product: Product) => {
    router.push(`/product/${product.slug || product.id}`);
  };

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    console.log('Add to cart:', product);
  };

  const toggleWishlist = (e: React.MouseEvent, productId: string) => {
    e.stopPropagation();
    setWishlist(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const openQuickView = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    setQuickViewProduct(product);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-fuchsia-50 to-pink-100 pb-20">
      {/* Luxury Header */}
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-pink-200 shadow-xl">
        <div className="flex items-center gap-3 px-4 py-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="p-2 hover:bg-pink-100 rounded-full transition-all"
          >
            <ArrowLeft className="h-5 w-5 text-pink-600" />
          </Button>
          
          <div className="flex items-center gap-3 flex-1">
            <span className="text-3xl">💄</span>
            <h1 className="text-xl md:text-2xl font-serif font-light tracking-wide bg-gradient-to-r from-pink-600 via-fuchsia-600 to-pink-600 bg-clip-text text-transparent">
              MỸ PHẨM CAO CẤP
            </h1>
            <Sparkles className="h-5 w-5 text-amber-500 animate-pulse" />
          </div>
          
          <div className="text-sm font-semibold text-pink-600 bg-pink-100 px-3 py-1 rounded-full border border-amber-300">
            {filteredProducts.length} SP
          </div>
        </div>
      </div>

      {/* Category Navigation Menu */}
      <CategoryNavigationMenu activeCategory="my-pham" />

      {/* Luxury Filters */}
      <div className="sticky top-[120px] z-40 bg-white/95 backdrop-blur-lg border-b border-pink-200 shadow-md">
        {/* Skin Type Filter */}
        <div className="overflow-x-auto touch-pan-x [&::-webkit-scrollbar]:hidden [-webkit-overflow-scrolling:touch] [scrollbar-width:none]">
          <div className="flex gap-2 px-4 py-2">
            {SKIN_TYPE_FILTERS.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setSelectedSkinType(filter.value)}
                className={`
                  flex-shrink-0 px-4 py-2 rounded-full text-sm font-serif font-light transition-all tracking-wide
                  ${selectedSkinType === filter.value 
                    ? 'bg-gradient-to-r from-pink-600 to-fuchsia-600 text-white' 
                    : 'border border-pink-300 text-pink-700 hover:border-pink-500'
                  }
                `}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* Brand Filter */}
        <div className="overflow-x-auto touch-pan-x [&::-webkit-scrollbar]:hidden [-webkit-overflow-scrolling:touch] [scrollbar-width:none] border-t border-pink-100">
          <div className="flex gap-2 px-4 py-2">
            {BRANDS.map((brand) => (
              <button
                key={brand}
                onClick={() => setSelectedBrand(brand)}
                className={`
                  flex-shrink-0 px-4 py-2 rounded-full text-xs font-serif font-light transition-all tracking-widest uppercase
                  ${selectedBrand === brand 
                    ? 'bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white' 
                    : 'border border-fuchsia-300 text-fuchsia-700 hover:border-fuchsia-500'
                  }
                `}
              >
                {brand}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg border border-amber-300 overflow-hidden">
                <div className="aspect-[3/4] bg-gradient-to-br from-pink-200 to-fuchsia-200 animate-pulse" />
                <div className="p-4 space-y-3">
                  <div className="h-3 bg-pink-200 rounded animate-pulse" />
                  <div className="h-4 bg-fuchsia-200 rounded w-3/4 animate-pulse" />
                  <div className="h-6 bg-amber-200 rounded w-1/2 animate-pulse" />
                  <div className="h-10 bg-pink-200 rounded-full animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">💄</div>
            <h3 className="text-xl font-serif font-light text-pink-800 mb-2 tracking-wide">
              Không tìm thấy sản phẩm
            </h3>
            <p className="text-pink-600 mb-6">
              Hãy thử bộ lọc khác
            </p>
            <Button
              onClick={() => {
                setSelectedSkinType('all');
                setSelectedBrand('All Brands');
              }}
              className="bg-gradient-to-r from-pink-500 to-fuchsia-500 hover:from-pink-600 hover:to-fuchsia-600 text-white rounded-full px-8 py-3 shadow-lg"
            >
              Xem tất cả
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {filteredProducts.map((product, index) => {
              const brand = getProductBrand(product.name);
              const isInWishlist = wishlist.has(product.id);
              
              return (
                <div
                  key={product.id}
                  onClick={() => handleProductClick(product)}
                  className="group bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg border border-amber-300 hover:border-amber-400 hover:shadow-pink-200 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer overflow-hidden relative"
                  style={{
                    animationDelay: `${index * 50}ms`
                  }}
                >
                  {/* Luxury Badge */}
                  {product.isBestseller && (
                    <div className="absolute top-3 left-3 z-10">
                      <Badge className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-amber-900 text-xs font-bold px-3 py-1 rounded-full shadow-lg border-2 border-amber-300">
                        ✨ BESTSELLER
                      </Badge>
                    </div>
                  )}

                  {/* Wishlist Heart Button */}
                  <button
                    onClick={(e) => toggleWishlist(e, product.id)}
                    className="absolute top-3 right-3 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-pink-100 transition-all group/heart"
                  >
                    <Heart
                      className={`h-5 w-5 transition-all ${
                        isInWishlist 
                          ? 'fill-pink-500 text-pink-500' 
                          : 'text-gray-400 group-hover/heart:text-pink-500'
                      }`}
                    />
                    {isInWishlist && (
                      <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-amber-400 animate-ping" />
                    )}
                  </button>

                  {/* Quick View Button */}
                  <button
                    onClick={(e) => openQuickView(e, product)}
                    className="absolute top-14 right-3 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-fuchsia-100 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Eye className="h-5 w-5 text-fuchsia-500" />
                  </button>

                  {/* Image with Vignette Effect */}
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <MediaViewer
                      src={product.media || product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      isHomepage={false}
                    />
                    
                    {/* Soft Vignette Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-pink-900/30 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
                    
                    {/* Glow Effect on Hover */}
                    <div className="absolute inset-0 bg-pink-500/0 group-hover:bg-pink-500/10 transition-all duration-300" />
                    
                    {/* Stock indicator */}
                    {product.stock === 0 && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                        <span className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                          Hết hàng
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    {/* Brand Name - UPPERCASE with wide spacing */}
                    <p className="text-xs font-light text-gray-500 uppercase tracking-widest mb-1">
                      {brand}
                    </p>
                    
                    <h3 className="font-serif font-light text-sm md:text-base text-gray-800 line-clamp-2 mb-2 min-h-[2.5rem]">
                      {product.name}
                    </h3>
                    
                    {/* Star Rating */}
                    <div className="mb-3">
                      <StarRating rating={5} reviewCount={Math.floor(Math.random() * 500) + 50} />
                    </div>
                    
                    {/* Price - Italic font */}
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-xl md:text-2xl font-medium italic bg-gradient-to-r from-pink-600 to-fuchsia-600 bg-clip-text text-transparent">
                        {formatVietnamPrice(product.price)}
                      </span>
                      {product.originalPrice && (
                        <span className="text-sm text-gray-400 line-through font-light">
                          {formatVietnamPrice(product.originalPrice)}
                        </span>
                      )}
                    </div>

                    {/* Ingredient Tags */}
                    <div className="flex gap-1 mb-3 flex-wrap">
                      {Math.random() > 0.5 && (
                        <Badge className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full border-none">
                          🌿 Organic
                        </Badge>
                      )}
                      {Math.random() > 0.6 && (
                        <Badge className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full border-none">
                          🐰 Cruelty-Free
                        </Badge>
                      )}
                    </div>

                    {/* Add to Cart Button - Pink Pill Shape */}
                    <Button
                      disabled={product.stock === 0}
                      className="w-full bg-pink-500 hover:bg-pink-600 text-white rounded-full py-3 px-6 font-light tracking-wide shadow-md hover:shadow-xl transition-all relative overflow-hidden group/btn"
                      onClick={(e) => handleAddToCart(e, product)}
                    >
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

      {/* Quick View Modal */}
      {quickViewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setQuickViewProduct(null)}>
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-amber-300" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white p-4 flex items-center justify-between rounded-t-3xl">
              <h3 className="font-serif font-light text-lg tracking-wide">Quick View</h3>
              <button onClick={() => setQuickViewProduct(null)} className="p-2 hover:bg-white/20 rounded-full transition-all">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Image */}
                <div className="md:w-1/2">
                  <div className="aspect-[3/4] rounded-2xl overflow-hidden border border-amber-300">
                    <MediaViewer
                      src={quickViewProduct.media || quickViewProduct.image}
                      alt={quickViewProduct.name}
                      className="w-full h-full object-cover"
                      isHomepage={false}
                    />
                  </div>
                </div>

                {/* Details */}
                <div className="md:w-1/2">
                  <p className="text-sm font-light text-gray-500 uppercase tracking-widest mb-2">
                    {getProductBrand(quickViewProduct.name)}
                  </p>
                  <h2 className="text-2xl font-serif font-light text-gray-800 mb-3">
                    {quickViewProduct.name}
                  </h2>
                  
                  <div className="mb-4">
                    <StarRating rating={5} reviewCount={Math.floor(Math.random() * 500) + 50} />
                  </div>

                  <div className="flex items-baseline gap-3 mb-6">
                    <span className="text-3xl font-medium italic bg-gradient-to-r from-pink-600 to-fuchsia-600 bg-clip-text text-transparent">
                      {formatVietnamPrice(quickViewProduct.price)}
                    </span>
                    {quickViewProduct.originalPrice && (
                      <span className="text-lg text-gray-400 line-through">
                        {formatVietnamPrice(quickViewProduct.originalPrice)}
                      </span>
                    )}
                  </div>

                  {quickViewProduct.short_description && (
                    <p className="text-gray-600 mb-6 font-light leading-relaxed">
                      {quickViewProduct.short_description}
                    </p>
                  )}

                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleProductClick(quickViewProduct)}
                      className="flex-1 bg-gradient-to-r from-pink-500 to-fuchsia-500 hover:from-pink-600 hover:to-fuchsia-600 text-white rounded-full py-3 shadow-lg"
                    >
                      Xem chi tiết
                    </Button>
                    <Button
                      onClick={(e) => handleAddToCart(e, quickViewProduct)}
                      className="flex-1 bg-pink-500 hover:bg-pink-600 text-white rounded-full py-3 shadow-lg"
                      disabled={quickViewProduct.stock === 0}
                    >
                      <ShoppingBag className="h-4 w-4 mr-2" />
                      Thêm giỏ hàng
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Sparkle Badge */}
      <div className="fixed bottom-24 right-4 bg-gradient-to-r from-pink-500 via-fuchsia-500 to-pink-500 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-all cursor-pointer z-30 animate-pulse">
        <Sparkles className="h-6 w-6" />
      </div>

      {/* Bottom Navigation */}
      <StorefrontBottomNav activeTab="categories" onTabChange={() => {}} />
    </div>
  );
}
