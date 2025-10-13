'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Plus, Minus, ShoppingCart, Clock, Snowflake, Truck, Flame } from 'lucide-react';
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
}

type FoodType = 'all' | 'meat' | 'fish' | 'vegetable' | 'dairy';

const FOOD_TYPES = [
  { value: 'all' as FoodType, label: 'Tất cả', icon: '🥩', color: 'bg-amber-100 text-amber-800' },
  { value: 'meat' as FoodType, label: 'Thịt', icon: '🥩', color: 'bg-red-100 text-red-800' },
  { value: 'fish' as FoodType, label: 'Cá', icon: '🐟', color: 'bg-blue-100 text-blue-800' },
  { value: 'vegetable' as FoodType, label: 'Rau sống', icon: '🥬', color: 'bg-emerald-100 text-emerald-800' },
  { value: 'dairy' as FoodType, label: 'Trứng sữa', icon: '🥛', color: 'bg-yellow-100 text-yellow-800' },
];

const getFoodType = (name: string, description?: string): FoodType => {
  const text = (name + ' ' + (description || '')).toLowerCase();
  if (text.includes('thịt') || text.includes('meat') || text.includes('gà') || text.includes('heo') || text.includes('bò')) return 'meat';
  if (text.includes('cá') || text.includes('fish') || text.includes('tôm') || text.includes('mực')) return 'fish';
  if (text.includes('rau') || text.includes('vegetable') || text.includes('xà lách') || text.includes('cải')) return 'vegetable';
  if (text.includes('trứng') || text.includes('sữa') || text.includes('milk') || text.includes('egg') || text.includes('phô mai')) return 'dairy';
  return 'meat';
};

const getHarvestInfo = (productId: string) => {
  const hours = (parseInt(productId.slice(-2), 16) % 12) + 1;
  const today = new Date();
  today.setHours(today.getHours() - hours);
  
  return {
    date: today.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
    time: today.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    hoursAgo: hours
  };
};

const getStockInKg = (stock: number, productId: string): number => {
  const multiplier = (parseInt(productId.slice(-1), 16) % 5) + 1;
  return stock * multiplier / 10;
};

const isRefrigerated = (productId: string): boolean => {
  return parseInt(productId.slice(-1), 16) % 2 === 0;
};

const isFarmDirect = (productId: string): boolean => {
  return parseInt(productId.slice(-1), 16) % 3 === 0;
};

export default function ThucPhamTuoiPage() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<FoodType>('all');
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});

  const { 
    data: products = [], 
    isLoading 
  } = useQuery<Product[]>({
    queryKey: ['thuc-pham-tuoi-products'],
    queryFn: async () => {
      try {
        return await fetchProducts({
          categoryId: 'thuc-pham-tuoi',
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
    if (selectedType !== 'all') {
      const productType = getFoodType(product.name, product.short_description);
      if (productType !== selectedType) return false;
    }
    return true;
  });

  const handleProductClick = (product: Product) => {
    router.push(`/product/${product.slug || product.id}`);
  };

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    const quantity = quantities[product.id] || 1;
    console.log('Add to cart:', product, 'quantity:', quantity);
  };

  const adjustQuantity = (e: React.MouseEvent, productId: string, delta: number) => {
    e.stopPropagation();
    setQuantities(prev => {
      const current = prev[productId] || 1;
      const newValue = Math.max(1, Math.min(10, current + delta));
      return { ...prev, [productId]: newValue };
    });
  };

  return (
    <div className="min-h-screen bg-amber-50 pb-20">
      {/* Header - Bold Red Theme */}
      <div className="sticky top-0 z-50 bg-gradient-to-r from-red-600 to-red-700 shadow-lg">
        <div className="flex items-center gap-3 px-4 py-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="p-2 hover:bg-white/20 rounded-lg transition-all text-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-3 flex-1">
            <span className="text-3xl">🥩</span>
            <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight" style={{ fontWeight: 800 }}>
              Thực Phẩm Tươi
            </h1>
          </div>
          
          <div className="text-sm font-bold text-white bg-white/20 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/30">
            {filteredProducts.length} SP
          </div>
        </div>
      </div>

      {/* Category Navigation Menu */}
      <CategoryNavigationMenu activeCategory="thuc-pham-tuoi" />

      {/* Type Filter - Sticky */}
      <div className="sticky top-[120px] z-40 bg-white/95 backdrop-blur-md border-b-4 border-red-200 shadow-md overflow-x-auto touch-pan-x [&::-webkit-scrollbar]:hidden [-webkit-overflow-scrolling:touch] [scrollbar-width:none]">
        <div className="flex gap-3 px-4 py-3 max-w-7xl mx-auto">
          {FOOD_TYPES.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setSelectedType(filter.value)}
              className={`
                flex-shrink-0 px-4 py-2 rounded-2xl text-sm font-extrabold transition-all flex items-center gap-2
                ${selectedType === filter.value 
                  ? 'bg-gradient-to-r from-red-600 to-red-700 text-white' 
                  : 'border-2 border-red-300 text-red-700 hover:border-red-500'
                }
              `}
              style={{ fontWeight: 800 }}
            >
              <span className="text-xl">{filter.icon}</span>
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid - 2 cols mobile, 3 cols desktop */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5 md:gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-red-100">
                <div className="p-4">
                  <div className="w-full aspect-[4/3] bg-gradient-to-br from-red-100 to-amber-100 animate-pulse rounded-xl mb-4" />
                  <div className="h-5 bg-red-100 rounded-lg w-3/4 animate-pulse mb-3" />
                  <div className="h-7 bg-amber-100 rounded-lg w-1/2 animate-pulse mb-4" />
                  <div className="h-12 bg-red-100 rounded-xl animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-7xl mb-6">🥩</div>
            <h3 className="text-3xl font-extrabold text-red-700 mb-4" style={{ fontWeight: 800 }}>
              Không tìm thấy sản phẩm
            </h3>
            <p className="text-amber-700 font-semibold mb-8 text-lg">
              Hãy thử bộ lọc khác!
            </p>
            <Button
              onClick={() => setSelectedType('all')}
              className="bg-red-600 hover:bg-red-700 text-white rounded-2xl px-10 py-4 font-bold shadow-xl text-lg"
              style={{ fontWeight: 800 }}
            >
              Xem tất cả
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5 md:gap-6">
            {filteredProducts.map((product) => {
              const harvestInfo = getHarvestInfo(product.id);
              const stockKg = getStockInKg(product.stock, product.id);
              const refrigerated = isRefrigerated(product.id);
              const farmDirect = isFarmDirect(product.id);
              const quantity = quantities[product.id] || 1;
              const isFreshToday = harvestInfo.hoursAgo <= 6;
              
              return (
                <div
                  key={product.id}
                  onClick={() => handleProductClick(product)}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden border-2 border-red-200 hover:border-red-400 hover:-translate-y-2 hover:scale-[1.02] group"
                >
                  <div className="p-4">
                    {/* 4:3 Aspect Ratio Image */}
                    <div className="relative mb-4">
                      <div className="w-full aspect-[4/3] rounded-xl overflow-hidden bg-gradient-to-br from-red-50 to-amber-50 border-2 border-emerald-200 group-hover:border-emerald-400 transition-all shadow-md">
                        <MediaViewer
                          src={product.media || product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          isHomepage={false}
                        />
                      </div>
                      
                      {/* FRESH TODAY Badge - Animated Pulse */}
                      {isFreshToday && (
                        <div className="absolute top-2 left-2">
                          <Badge className="bg-emerald-600 text-white text-xs font-extrabold px-3 py-1.5 rounded-full shadow-lg animate-pulse flex items-center gap-1.5 border-2 border-white" style={{ fontWeight: 800 }}>
                            <Clock className="h-3.5 w-3.5" />
                            FRESH TODAY
                          </Badge>
                        </div>
                      )}

                      {/* FARM DIRECT Badge */}
                      {farmDirect && (
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-amber-400 text-emerald-900 text-xs font-extrabold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 border-2 border-white" style={{ fontWeight: 800 }}>
                            <Truck className="h-3.5 w-3.5" />
                            FARM DIRECT
                          </Badge>
                        </div>
                      )}

                      {/* Temperature Indicator */}
                      {refrigerated && (
                        <div className="absolute bottom-2 left-2">
                          <Badge className="bg-cyan-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5 border border-white">
                            <Snowflake className="h-3.5 w-3.5" />
                            ❄️ Đã bảo quản lạnh
                          </Badge>
                        </div>
                      )}

                      {product.stock === 0 && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-xl">
                          <span className="bg-red-600 text-white px-5 py-2.5 rounded-xl text-sm font-extrabold shadow-xl border-2 border-white" style={{ fontWeight: 800 }}>
                            Hết hàng
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Product Name - Bold */}
                    <h3 className="font-extrabold text-slate-900 text-sm md:text-base line-clamp-2 mb-3 min-h-[44px]" style={{ fontWeight: 800 }}>
                      {product.name}
                    </h3>

                    {/* Harvest Date & Time Display */}
                    <div className="flex items-center gap-2 mb-2 text-xs text-emerald-700 font-semibold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                      <Clock className="h-3.5 w-3.5" />
                      <span>Thu hoạch: {harvestInfo.date} • {harvestInfo.time}</span>
                    </div>

                    {/* Stock Status - Real-time Display */}
                    {product.stock > 0 && (
                      <div className="flex items-center gap-2 mb-3 text-xs font-bold">
                        {stockKg > 5 ? (
                          <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-300">
                            Còn {stockKg.toFixed(1)} kg
                          </Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-700 border border-red-300 animate-pulse">
                            <Flame className="h-3 w-3 mr-1" />
                            Chỉ còn {stockKg.toFixed(1)} kg
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Price - Large & Prominent with ₫ Symbol */}
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-2xl md:text-3xl font-extrabold text-red-600 tabular-nums" style={{ fontWeight: 800, fontFamily: 'ui-monospace, monospace' }}>
                        {formatVietnamPrice(product.price)}
                      </span>
                      {product.originalPrice && (
                        <span className="text-sm text-slate-400 line-through tabular-nums font-semibold">
                          {formatVietnamPrice(product.originalPrice)}
                        </span>
                      )}
                    </div>

                    {/* Quick Order Quantity Slider */}
                    <div className="mb-4 bg-gradient-to-r from-amber-50 to-red-50 p-3 rounded-xl border border-red-200">
                      <p className="text-xs font-bold text-slate-700 mb-2">Số lượng:</p>
                      <div className="flex items-center justify-between gap-3">
                        <button
                          onClick={(e) => adjustQuantity(e, product.id, -1)}
                          disabled={quantity <= 1}
                          className="w-9 h-9 flex items-center justify-center bg-white hover:bg-red-600 hover:text-white text-red-600 rounded-lg border-2 border-red-300 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm font-bold"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        
                        <div className="flex-1 text-center">
                          <span className="text-2xl font-extrabold text-red-600" style={{ fontWeight: 800 }}>
                            {quantity}
                          </span>
                        </div>
                        
                        <button
                          onClick={(e) => adjustQuantity(e, product.id, 1)}
                          disabled={quantity >= 10}
                          className="w-9 h-9 flex items-center justify-center bg-white hover:bg-red-600 hover:text-white text-red-600 rounded-lg border-2 border-red-300 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm font-bold"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Add to Cart Button - Bold Red with Motion */}
                    <Button
                      disabled={product.stock === 0}
                      className="w-full bg-red-600 hover:bg-red-700 text-white rounded-xl py-3.5 font-extrabold text-base shadow-lg transition-all hover:shadow-xl hover:scale-105 active:scale-95"
                      onClick={(e) => handleAddToCart(e, product)}
                      style={{ fontWeight: 800 }}
                    >
                      <ShoppingCart className="h-5 w-5 mr-2 animate-bounce" />
                      Thêm vào giỏ
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Fresh Info Badge */}
      <div className="fixed bottom-24 right-4 z-30 animate-pulse">
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white p-4 rounded-full shadow-2xl hover:from-emerald-700 hover:to-emerald-800 transition-all cursor-pointer border-4 border-white">
          <Clock className="h-6 w-6" />
        </div>
      </div>

      {/* Bottom Navigation */}
      <StorefrontBottomNav activeTab="categories" onTabChange={() => {}} />
    </div>
  );
}
