'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Plus, Info, Calendar, ChevronDown } from 'lucide-react';
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

type ProductType = 'all' | 'gao' | 'bot' | 'dau' | 'hat' | 'gia-vi';
type WeightOption = '250g' | '500g' | '1kg' | '2kg';

const PRODUCT_TYPE_FILTERS = [
  { value: 'all' as ProductType, label: 'Tất cả' },
  { value: 'gao' as ProductType, label: 'Gạo' },
  { value: 'bot' as ProductType, label: 'Bột' },
  { value: 'dau' as ProductType, label: 'Đậu' },
  { value: 'hat' as ProductType, label: 'Hạt' },
  { value: 'gia-vi' as ProductType, label: 'Gia vị' },
];

const WEIGHT_OPTIONS: WeightOption[] = ['250g', '500g', '1kg', '2kg'];

const getProductType = (name: string, description?: string): ProductType => {
  const text = (name + ' ' + (description || '')).toLowerCase();
  if (text.includes('gạo')) return 'gao';
  if (text.includes('bột') || text.includes('flour')) return 'bot';
  if (text.includes('đậu') || text.includes('bean')) return 'dau';
  if (text.includes('hạt') || text.includes('seed') || text.includes('nut')) return 'hat';
  if (text.includes('gia vị') || text.includes('spice') || text.includes('muối') || text.includes('đường')) return 'gia-vi';
  return 'all';
};

const getExpiryDate = (): string => {
  const date = new Date();
  date.setMonth(date.getMonth() + Math.floor(Math.random() * 12) + 6);
  return date.toLocaleDateString('vi-VN');
};

const isBulkSize = (name: string): boolean => {
  return name.includes('5kg') || name.includes('10kg') || name.includes('20kg');
};

const isEconomySize = (name: string): boolean => {
  return name.includes('túi lớn') || name.includes('economy') || name.includes('tiết kiệm');
};

export default function ThucPhamKhoPage() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<ProductType>('all');
  const [selectedWeights, setSelectedWeights] = useState<Record<string, WeightOption>>({});
  const [showWeightDropdown, setShowWeightDropdown] = useState<string | null>(null);
  const [showNutrition, setShowNutrition] = useState<string | null>(null);

  const { 
    data: products = [], 
    isLoading 
  } = useQuery<Product[]>({
    queryKey: ['thuc-pham-kho-products'],
    queryFn: async () => {
      try {
        return await fetchProducts({
          categoryId: 'thuc-pham-kho',
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
    if (selectedType === 'all') return true;
    return getProductType(product.name, product.short_description) === selectedType;
  });

  const handleProductClick = (product: Product) => {
    router.push(`/product/${product.slug || product.id}`);
  };

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    const weight = selectedWeights[product.id] || '500g';
    console.log('Add to cart:', product, 'Weight:', weight);
  };

  const toggleWeightDropdown = (e: React.MouseEvent, productId: string) => {
    e.stopPropagation();
    setShowWeightDropdown(showWeightDropdown === productId ? null : productId);
  };

  const selectWeight = (e: React.MouseEvent, productId: string, weight: WeightOption) => {
    e.stopPropagation();
    setSelectedWeights(prev => ({ ...prev, [productId]: weight }));
    setShowWeightDropdown(null);
  };

  const toggleNutrition = (e: React.MouseEvent, productId: string) => {
    e.stopPropagation();
    setShowNutrition(showNutrition === productId ? null : productId);
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      {/* Header - Stone theme */}
      <div className="sticky top-0 z-50 bg-white border-b border-stone-300 shadow-sm">
        <div className="flex items-center gap-3 px-4 py-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="p-2 hover:bg-stone-100 rounded-lg"
          >
            <ArrowLeft className="h-5 w-5 text-stone-700" />
          </Button>
          
          <div className="flex items-center gap-2 flex-1">
            <span className="text-2xl">🌾</span>
            <h1 className="text-xl md:text-2xl font-semibold text-stone-700">
              Thực Phẩm Khô
            </h1>
          </div>
          
          <div className="text-sm font-semibold text-stone-700 bg-stone-100 px-3 py-1 rounded-md">
            {filteredProducts.length} SP
          </div>
        </div>
      </div>

      {/* Category Navigation Menu */}
      <CategoryNavigationMenu activeCategory="thuc-pham-kho" />

      {/* Filter Bar - Sticky */}
      <div className="sticky top-[120px] z-40 bg-white border-b border-stone-200 shadow-sm overflow-x-auto touch-pan-x [&::-webkit-scrollbar]:hidden [-webkit-overflow-scrolling:touch] [scrollbar-width:none]">
        <div className="flex gap-3 px-4 py-3">
          {PRODUCT_TYPE_FILTERS.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setSelectedType(filter.value)}
              className={`
                flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${selectedType === filter.value 
                  ? 'bg-stone-700 text-white' 
                  : 'border border-stone-300 text-stone-700 hover:border-stone-500'
                }
              `}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Products List - Horizontal Cards */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow border border-stone-200 overflow-hidden">
                <div className="flex gap-4 p-4">
                  <div className="w-20 h-20 md:w-24 md:h-24 bg-stone-200 animate-pulse rounded-lg flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-stone-200 rounded w-3/4 animate-pulse" />
                    <div className="h-3 bg-stone-200 rounded w-1/2 animate-pulse" />
                    <div className="h-6 bg-stone-200 rounded w-1/3 animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🌾</div>
            <h3 className="text-xl font-semibold text-stone-700 mb-2">
              Không tìm thấy sản phẩm
            </h3>
            <p className="text-stone-600 mb-6">
              Hãy thử bộ lọc khác
            </p>
            <Button
              onClick={() => setSelectedType('all')}
              className="bg-stone-600 hover:bg-stone-700 text-white rounded-lg px-8 py-3"
            >
              Xem tất cả
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredProducts.map((product) => {
              const selectedWeight = selectedWeights[product.id] || '500g';
              const isBulk = isBulkSize(product.name);
              const isEconomy = isEconomySize(product.name);
              const expiryDate = getExpiryDate();
              
              return (
                <div
                  key={product.id}
                  onClick={() => handleProductClick(product)}
                  className="bg-white rounded-lg shadow border border-stone-200 hover:border-stone-400 hover:bg-stone-50 transition-all duration-200 cursor-pointer overflow-hidden"
                >
                  <div className="flex gap-4 p-3 md:p-4">
                    {/* Product Image - Square with shadow */}
                    <div className="relative flex-shrink-0">
                      <div className="w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden shadow-md bg-stone-100">
                        <MediaViewer
                          src={product.media || product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          isHomepage={false}
                        />
                        
                        {product.stock === 0 && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
                              Hết hàng
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0 flex flex-col">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-semibold text-stone-700 text-sm md:text-base line-clamp-2 flex-1">
                          {product.name}
                        </h3>
                        
                        {/* Badges */}
                        <div className="flex flex-col gap-1">
                          {isBulk && (
                            <Badge className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded border-none whitespace-nowrap">
                              BULK
                            </Badge>
                          )}
                          {isEconomy && (
                            <Badge className="bg-stone-200 text-stone-700 text-xs px-2 py-0.5 rounded border-none whitespace-nowrap">
                              ECONOMY
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Expiry Date */}
                      <div className="flex items-center gap-1 mb-2">
                        <Calendar className="h-3 w-3 text-stone-500" />
                        <span className="text-xs text-stone-500">
                          HSD: {expiryDate}
                        </span>
                      </div>

                      {/* Price and Weight */}
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-baseline gap-2">
                          <span className="text-lg md:text-xl font-bold text-stone-700 tabular-nums">
                            {formatVietnamPrice(product.price)}
                          </span>
                          {product.originalPrice && (
                            <span className="text-xs text-stone-400 line-through tabular-nums">
                              {formatVietnamPrice(product.originalPrice)}
                            </span>
                          )}
                        </div>

                        {/* Weight Selector */}
                        <div className="relative">
                          <button
                            onClick={(e) => toggleWeightDropdown(e, product.id)}
                            className="flex items-center gap-1 px-2 py-1 bg-stone-100 hover:bg-stone-200 rounded border border-stone-300 transition-all"
                          >
                            <span className="text-xs font-medium text-stone-600 tabular-nums">
                              {selectedWeight}
                            </span>
                            <ChevronDown className="h-3 w-3 text-stone-600" />
                          </button>

                          {showWeightDropdown === product.id && (
                            <div className="absolute top-full left-0 mt-1 bg-white rounded border border-stone-200 shadow-lg overflow-hidden z-50 min-w-[80px]">
                              {WEIGHT_OPTIONS.map((weight) => (
                                <button
                                  key={weight}
                                  onClick={(e) => selectWeight(e, product.id, weight)}
                                  className={`w-full text-left px-3 py-1.5 hover:bg-stone-50 transition-colors ${
                                    selectedWeight === weight ? 'bg-stone-100 text-yellow-700 font-medium' : 'text-stone-700'
                                  }`}
                                >
                                  <span className="text-xs tabular-nums">{weight}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 mt-auto">
                        <Button
                          disabled={product.stock === 0}
                          className="flex-1 bg-stone-600 hover:bg-stone-700 text-white rounded-lg py-2 px-4 font-medium text-sm shadow-sm transition-all"
                          onClick={(e) => handleAddToCart(e, product)}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Thêm giỏ
                        </Button>

                        <Button
                          variant="ghost"
                          className="text-stone-600 hover:text-stone-700 hover:bg-stone-100 rounded-lg px-3 py-2 text-sm font-medium"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleProductClick(product);
                          }}
                        >
                          Chi tiết
                        </Button>

                        <button
                          onClick={(e) => toggleNutrition(e, product.id)}
                          className="p-2 text-stone-600 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-all"
                          title="Thông tin dinh dưỡng"
                        >
                          <Info className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Nutrition Facts Quick View */}
                      {showNutrition === product.id && (
                        <div className="mt-3 p-3 bg-stone-50 rounded-lg border border-stone-200">
                          <h4 className="text-xs font-semibold text-stone-700 mb-2">Thông tin dinh dưỡng (100g)</h4>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="flex justify-between">
                              <span className="text-stone-600">Năng lượng:</span>
                              <span className="font-medium tabular-nums">350 kcal</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-stone-600">Protein:</span>
                              <span className="font-medium tabular-nums">8g</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-stone-600">Carbs:</span>
                              <span className="font-medium tabular-nums">75g</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-stone-600">Chất béo:</span>
                              <span className="font-medium tabular-nums">2g</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Info Badge */}
      <div className="fixed bottom-24 right-4 bg-stone-600 text-white p-3 rounded-lg shadow-lg hover:bg-stone-700 transition-all cursor-pointer z-30">
        <span className="text-2xl">🌾</span>
      </div>

      {/* Bottom Navigation */}
      <StorefrontBottomNav activeTab="categories" onTabChange={() => {}} />
    </div>
  );
}
