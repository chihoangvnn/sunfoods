'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Plus, Home, CheckSquare, Square, Leaf, Shield, Ruler } from 'lucide-react';
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

type RoomFilter = 'all' | 'kitchen' | 'bedroom' | 'bathroom' | 'living-room';
type MaterialVariant = { id: string; name: string; color: string };
type ColorVariant = { id: string; name: string; hex: string };

const ROOM_FILTERS = [
  { value: 'all' as RoomFilter, label: 'Tất cả', icon: '🏠' },
  { value: 'kitchen' as RoomFilter, label: 'Bếp', icon: '🍳' },
  { value: 'bedroom' as RoomFilter, label: 'Phòng ngủ', icon: '🛏️' },
  { value: 'bathroom' as RoomFilter, label: 'Phòng tắm', icon: '🚿' },
  { value: 'living-room' as RoomFilter, label: 'Phòng khách', icon: '🛋️' },
];

const getRoomType = (name: string, description?: string): RoomFilter => {
  const text = (name + ' ' + (description || '')).toLowerCase();
  if (text.includes('bếp') || text.includes('kitchen') || text.includes('nấu')) return 'kitchen';
  if (text.includes('phòng ngủ') || text.includes('bedroom') || text.includes('giường')) return 'bedroom';
  if (text.includes('phòng tắm') || text.includes('bathroom') || text.includes('tắm')) return 'bathroom';
  if (text.includes('phòng khách') || text.includes('living') || text.includes('sofa')) return 'living-room';
  return 'kitchen';
};

const isEcoFriendly = (name: string, description?: string): boolean => {
  const text = (name + ' ' + (description || '')).toLowerCase();
  return text.includes('eco') || text.includes('thân thiện môi trường') || text.includes('organic') || text.includes('hữu cơ');
};

const isDurable = (name: string, description?: string): boolean => {
  const text = (name + ' ' + (description || '')).toLowerCase();
  return text.includes('bền') || text.includes('durable') || text.includes('chống') || text.includes('resistant');
};

const getDimensions = (productId: string): string => {
  const dimensionSets = [
    '30×20×15 cm',
    '45×30×20 cm',
    '25×25×10 cm',
    '60×40×25 cm',
    '15×15×20 cm',
    '50×35×18 cm',
  ];
  const index = parseInt(productId.slice(-2), 16) % dimensionSets.length;
  return dimensionSets[index];
};

const getMaterialVariants = (productId: string): MaterialVariant[] => {
  const allMaterials = [
    { id: 'plastic', name: 'Nhựa', color: 'bg-blue-100 text-blue-700 border-blue-300' },
    { id: 'glass', name: 'Thủy tinh', color: 'bg-cyan-100 text-cyan-700 border-cyan-300' },
    { id: 'stainless', name: 'Inox', color: 'bg-slate-100 text-slate-700 border-slate-300' },
    { id: 'ceramic', name: 'Gốm sứ', color: 'bg-amber-100 text-amber-700 border-amber-300' },
    { id: 'wood', name: 'Gỗ', color: 'bg-orange-100 text-orange-700 border-orange-300' },
  ];
  const count = (parseInt(productId.slice(-1), 16) % 3) + 2;
  return allMaterials.slice(0, count);
};

const getColorVariants = (productId: string): ColorVariant[] => {
  const allColors = [
    { id: 'white', name: 'Trắng', hex: '#FFFFFF' },
    { id: 'black', name: 'Đen', hex: '#000000' },
    { id: 'blue', name: 'Xanh', hex: '#0284C7' },
    { id: 'green', name: 'Xanh lá', hex: '#10B981' },
    { id: 'gray', name: 'Xám', hex: '#6B7280' },
  ];
  const count = (parseInt(productId.slice(-1), 16) % 3) + 2;
  return allColors.slice(0, count);
};

export default function GiaDungPage() {
  const router = useRouter();
  const [selectedRoom, setSelectedRoom] = useState<RoomFilter>('all');
  const [compareList, setCompareList] = useState<Set<string>>(new Set());
  const [selectedMaterial, setSelectedMaterial] = useState<{ [key: string]: string }>({});
  const [selectedColor, setSelectedColor] = useState<{ [key: string]: string }>({});

  const { 
    data: products = [], 
    isLoading 
  } = useQuery<Product[]>({
    queryKey: ['gia-dung-products'],
    queryFn: async () => {
      try {
        return await fetchProducts({
          categoryId: 'gia-dung',
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
    if (selectedRoom !== 'all') {
      const productRoom = getRoomType(product.name, product.short_description);
      if (productRoom !== selectedRoom) return false;
    }
    return true;
  });

  const handleProductClick = (product: Product) => {
    router.push(`/product/${product.slug || product.id}`);
  };

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    console.log('Add to cart:', product);
  };

  const toggleCompare = (e: React.MouseEvent, productId: string) => {
    e.stopPropagation();
    setCompareList(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        if (newSet.size >= 4) {
          return prev;
        }
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const handleCompare = () => {
    if (compareList.size >= 2) {
      const ids = Array.from(compareList).join(',');
      router.push(`/compare?products=${ids}`);
    }
  };

  const selectMaterial = (e: React.MouseEvent, productId: string, materialId: string) => {
    e.stopPropagation();
    setSelectedMaterial(prev => ({ ...prev, [productId]: materialId }));
  };

  const selectColor = (e: React.MouseEvent, productId: string, colorId: string) => {
    e.stopPropagation();
    setSelectedColor(prev => ({ ...prev, [productId]: colorId }));
  };

  return (
    <div className="min-h-screen bg-sky-50 pb-20">
      {/* Header - Modern & Clean */}
      <div className="sticky top-0 z-50 bg-sky-600 shadow-md">
        <div className="flex items-center gap-3 px-4 py-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="p-2 hover:bg-white/10 rounded-lg transition-all text-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-3 flex-1">
            <Home className="h-6 w-6 text-white" />
            <h1 className="text-xl md:text-2xl font-semibold text-white" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
              Gia Dụng
            </h1>
          </div>
          
          <div className="text-sm font-medium text-white bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm">
            {filteredProducts.length} SP
          </div>
        </div>
      </div>

      {/* Category Navigation Menu */}
      <CategoryNavigationMenu activeCategory="gia-dung" />

      {/* Room Filter */}
      <div className="sticky top-[120px] z-40 bg-white/90 backdrop-blur-md border-b border-sky-200 shadow-sm overflow-x-auto touch-pan-x [&::-webkit-scrollbar]:hidden [-webkit-overflow-scrolling:touch] [scrollbar-width:none]">
        <div className="flex gap-3 px-4 py-3 max-w-7xl mx-auto">
          {ROOM_FILTERS.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setSelectedRoom(filter.value)}
              className={`
                flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2
                ${selectedRoom === filter.value 
                  ? 'bg-sky-600 text-white' 
                  : 'border border-sky-300 text-slate-700 hover:border-sky-500'
                }
              `}
            >
              <span className="text-lg">{filter.icon}</span>
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Compare Bar */}
      {compareList.size > 0 && (
        <div className="sticky top-[188px] z-30 bg-slate-700 text-white px-4 py-3 shadow-lg">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <span className="text-sm font-medium">
              Đã chọn {compareList.size}/4 sản phẩm
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setCompareList(new Set())}
                className="text-white hover:bg-white/10 rounded-lg"
              >
                Xóa
              </Button>
              {compareList.size >= 2 && (
                <Button
                  size="sm"
                  onClick={handleCompare}
                  className="bg-sky-600 hover:bg-sky-700 text-white rounded-lg"
                >
                  So sánh
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Products Grid - 3 cols desktop, 2 cols mobile */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-4">
                  <div className="w-full aspect-square bg-sky-100 animate-pulse rounded-lg mb-4" />
                  <div className="h-4 bg-sky-100 rounded w-3/4 animate-pulse mb-2" />
                  <div className="h-6 bg-slate-100 rounded w-1/2 animate-pulse mb-3" />
                  <div className="h-10 bg-sky-100 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-6">🏠</div>
            <h3 className="text-2xl font-semibold text-slate-700 mb-3">
              Không tìm thấy sản phẩm
            </h3>
            <p className="text-slate-600 mb-8">
              Hãy thử bộ lọc khác!
            </p>
            <Button
              onClick={() => setSelectedRoom('all')}
              className="bg-sky-600 hover:bg-sky-700 text-white rounded-lg px-8 py-3 font-medium shadow-md"
            >
              Xem tất cả
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {filteredProducts.map((product) => {
              const roomType = getRoomType(product.name, product.short_description);
              const productEcoFriendly = isEcoFriendly(product.name, product.short_description);
              const productDurable = isDurable(product.name, product.short_description);
              const dimensions = getDimensions(product.id);
              const materials = getMaterialVariants(product.id);
              const colors = getColorVariants(product.id);
              const isInCompare = compareList.has(product.id);
              
              return (
                <div
                  key={product.id}
                  onClick={() => handleProductClick(product)}
                  className="bg-white rounded-lg shadow hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden border border-sky-100 hover:border-sky-300 hover:-translate-y-1"
                >
                  <div className="p-4">
                    {/* Square Image with clean white background */}
                    <div className="relative mb-4">
                      <div className="w-full aspect-square rounded-lg overflow-hidden bg-white border border-sky-100">
                        <MediaViewer
                          src={product.media || product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          isHomepage={false}
                        />
                      </div>
                      
                      {/* Compare Checkbox */}
                      <button
                        onClick={(e) => toggleCompare(e, product.id)}
                        className="absolute top-2 right-2 p-1.5 bg-white/95 rounded-lg shadow-md hover:scale-110 transition-all"
                      >
                        {isInCompare ? (
                          <CheckSquare className="h-5 w-5 text-sky-600" />
                        ) : (
                          <Square className="h-5 w-5 text-slate-400" />
                        )}
                      </button>

                      {product.stock === 0 && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-lg">
                          <span className="bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg">
                            Hết hàng
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Product Name */}
                    <h3 className="font-semibold text-slate-800 text-sm md:text-base line-clamp-2 mb-3 min-h-[40px]" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                      {product.name}
                    </h3>

                    {/* Badges - ECO-FRIENDLY & DURABLE */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {productEcoFriendly && (
                        <Badge className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded-md border border-emerald-300">
                          <Leaf className="h-3 w-3 mr-1" />
                          ECO-FRIENDLY
                        </Badge>
                      )}
                      {productDurable && (
                        <Badge className="bg-sky-100 text-sky-700 text-xs px-2 py-1 rounded-md border border-sky-300">
                          <Shield className="h-3 w-3 mr-1" />
                          DURABLE
                        </Badge>
                      )}
                    </div>

                    {/* Dimensions */}
                    <div className="flex items-center gap-2 mb-3 text-xs text-slate-600">
                      <Ruler className="h-3 w-3" />
                      <span className="font-mono">{dimensions}</span>
                    </div>

                    {/* Material Variants */}
                    {materials.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs text-slate-600 mb-2 font-medium">Chất liệu:</p>
                        <div className="flex flex-wrap gap-1">
                          {materials.map((material) => (
                            <button
                              key={material.id}
                              onClick={(e) => selectMaterial(e, product.id, material.id)}
                              className={`text-xs px-2 py-1 rounded-md border transition-all ${
                                selectedMaterial[product.id] === material.id
                                  ? material.color + ' font-semibold scale-105'
                                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              {material.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Color Variants */}
                    {colors.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs text-slate-600 mb-2 font-medium">Màu sắc:</p>
                        <div className="flex flex-wrap gap-2">
                          {colors.map((color) => (
                            <button
                              key={color.id}
                              onClick={(e) => selectColor(e, product.id, color.id)}
                              className={`w-6 h-6 rounded-md border-2 transition-all hover:scale-110 ${
                                selectedColor[product.id] === color.id
                                  ? 'border-sky-600 scale-110'
                                  : 'border-slate-300'
                              }`}
                              style={{ 
                                backgroundColor: color.hex,
                                boxShadow: color.hex === '#FFFFFF' ? 'inset 0 0 0 1px #e2e8f0' : 'none'
                              }}
                              title={color.name}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Price - Tabular Numbers */}
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-xl md:text-2xl font-bold text-slate-800 tabular-nums" style={{ fontFamily: 'ui-monospace, monospace' }}>
                        {formatVietnamPrice(product.price)}
                      </span>
                      {product.originalPrice && (
                        <span className="text-xs text-slate-400 line-through tabular-nums">
                          {formatVietnamPrice(product.originalPrice)}
                        </span>
                      )}
                    </div>

                    {/* Add to Cart Button - Sky Blue Rectangular */}
                    <Button
                      disabled={product.stock === 0}
                      className="w-full bg-sky-600 hover:bg-sky-700 text-white rounded-lg py-3 font-medium text-sm shadow-md transition-all"
                      onClick={(e) => handleAddToCart(e, product)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Thêm vào giỏ
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <StorefrontBottomNav activeTab="categories" onTabChange={() => {}} />
    </div>
  );
}
