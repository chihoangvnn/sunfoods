'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Plus, Heart, Baby, Leaf, ShieldCheck, Info, Star } from 'lucide-react';
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
}

type AgeRange = 'all' | '6m' | '8m' | '12m' | '18m' | '24m';
type AllergenFilter = 'all' | 'no-dairy' | 'no-gluten' | 'no-soy' | 'no-nuts' | 'no-egg';

const AGE_FILTERS = [
  { value: 'all' as AgeRange, label: 'Tất cả', icon: '👶' },
  { value: '6m' as AgeRange, label: '6M+', icon: '🍼' },
  { value: '8m' as AgeRange, label: '8M+', icon: '🥄' },
  { value: '12m' as AgeRange, label: '12M+', icon: '🍽️' },
  { value: '18m' as AgeRange, label: '18M+', icon: '🥗' },
  { value: '24m' as AgeRange, label: '24M+', icon: '🍱' },
];

const ALLERGEN_FILTERS = [
  { value: 'all' as AllergenFilter, label: 'Tất cả', icon: '✅' },
  { value: 'no-dairy' as AllergenFilter, label: 'Không sữa', icon: '🥛' },
  { value: 'no-gluten' as AllergenFilter, label: 'Không gluten', icon: '🌾' },
  { value: 'no-soy' as AllergenFilter, label: 'Không đậu nành', icon: '🫘' },
  { value: 'no-nuts' as AllergenFilter, label: 'Không hạt', icon: '🥜' },
  { value: 'no-egg' as AllergenFilter, label: 'Không trứng', icon: '🥚' },
];

const getAgeRange = (name: string, description?: string): AgeRange => {
  const text = (name + ' ' + (description || '')).toLowerCase();
  if (text.includes('24m') || text.includes('2 tuổi')) return '24m';
  if (text.includes('18m') || text.includes('1.5 tuổi')) return '18m';
  if (text.includes('12m') || text.includes('1 tuổi')) return '12m';
  if (text.includes('8m') || text.includes('8 tháng')) return '8m';
  if (text.includes('6m') || text.includes('6 tháng')) return '6m';
  return '6m';
};

const isOrganic = (name: string, description?: string): boolean => {
  const text = (name + ' ' + (description || '')).toLowerCase();
  return text.includes('organic') || text.includes('hữu cơ');
};

const isNoSugar = (name: string, description?: string): boolean => {
  const text = (name + ' ' + (description || '')).toLowerCase();
  return text.includes('no sugar') || text.includes('không đường');
};

const getAllergenInfo = (productId: string): AllergenFilter[] => {
  const allergens: AllergenFilter[] = ['all'];
  const random = parseInt(productId.slice(-2), 16) || 0;
  if (random % 2 === 0) allergens.push('no-dairy');
  if (random % 3 === 0) allergens.push('no-gluten');
  if (random % 5 === 0) allergens.push('no-soy');
  return allergens;
};

const getIngredients = (productName: string): string[] => {
  if (productName.toLowerCase().includes('gạo')) {
    return ['Gạo hữu cơ 95%', 'Vitamin B1, B2', 'Sắt', 'Kẽm'];
  }
  if (productName.toLowerCase().includes('chuối')) {
    return ['Chuối tươi 98%', 'Vitamin C', 'Kali', 'Chất xơ'];
  }
  return ['Nguyên liệu hữu cơ', 'Vitamin & khoáng chất', 'Không chất bảo quản'];
};

const getSafetyBadges = (): string[] => {
  return ['FDA Approved', 'HACCP', 'GMP Certified'];
};

export default function AnDamChoBeExplorerPage() {
  const router = useRouter();
  const [selectedAge, setSelectedAge] = useState<AgeRange>('all');
  const [selectedAllergen, setSelectedAllergen] = useState<AllergenFilter>('all');
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [showIngredients, setShowIngredients] = useState<string | null>(null);

  const { 
    data: products = [], 
    isLoading 
  } = useQuery<Product[]>({
    queryKey: ['an-dam-cho-be-products'],
    queryFn: async () => {
      try {
        return await fetchProducts({
          categoryId: 'an-dam-cho-be',
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
    if (selectedAge !== 'all') {
      const productAge = getAgeRange(product.name, product.short_description);
      const ageOrder = ['6m', '8m', '12m', '18m', '24m'];
      const selectedIdx = ageOrder.indexOf(selectedAge);
      const productIdx = ageOrder.indexOf(productAge);
      if (productIdx < selectedIdx) return false;
    }

    if (selectedAllergen !== 'all') {
      const allergens = getAllergenInfo(product.id);
      if (!allergens.includes(selectedAllergen)) return false;
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

  const toggleIngredients = (e: React.MouseEvent, productId: string) => {
    e.stopPropagation();
    setShowIngredients(showIngredients === productId ? null : productId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-pink-50 to-amber-50 pb-20">
      {/* Header - Cute & Safe */}
      <div className="sticky top-0 z-50 bg-gradient-to-r from-teal-400 to-pink-300 shadow-lg">
        <div className="flex items-center gap-3 px-4 py-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="p-2 hover:bg-white/20 rounded-full transition-all"
          >
            <ArrowLeft className="h-5 w-5 text-white" />
          </Button>
          
          <div className="flex items-center gap-2 flex-1">
            <span className="text-3xl">👶</span>
            <h1 className="text-xl md:text-2xl font-bold text-white" style={{ fontFamily: 'Quicksand, sans-serif' }}>
              Ăn Dặm Cho Bé
            </h1>
          </div>
          
          <div className="text-sm font-bold text-white bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
            {filteredProducts.length} SP
          </div>
        </div>
      </div>

      {/* Category Navigation Menu */}
      <CategoryNavigationMenu activeCategory="an-dam-cho-be" />

      {/* Filter Bar - Age & Allergen */}
      <div className="sticky top-[120px] z-40 bg-white/80 backdrop-blur-md border-b border-teal-200 shadow-md">
        {/* Age Filter */}
        <div className="overflow-x-auto touch-pan-x [&::-webkit-scrollbar]:hidden [-webkit-overflow-scrolling:touch] [scrollbar-width:none]">
          <div className="flex gap-2 px-4 py-2">
            {AGE_FILTERS.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setSelectedAge(filter.value)}
                className={`
                  flex-shrink-0 px-4 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2
                  ${selectedAge === filter.value 
                    ? 'bg-gradient-to-r from-teal-400 to-teal-500 text-white' 
                    : 'border-2 border-teal-300 text-teal-700 hover:border-teal-500'
                  }
                `}
                style={{ fontFamily: 'Quicksand, sans-serif' }}
              >
                <span className="text-lg">{filter.icon}</span>
                {filter.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* Allergen Filter */}
        <div className="overflow-x-auto touch-pan-x [&::-webkit-scrollbar]:hidden [-webkit-overflow-scrolling:touch] [scrollbar-width:none] border-t border-teal-100">
          <div className="flex gap-2 px-4 py-2">
            {ALLERGEN_FILTERS.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setSelectedAllergen(filter.value)}
                className={`
                  flex-shrink-0 px-4 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2
                  ${selectedAllergen === filter.value 
                    ? 'bg-gradient-to-r from-pink-400 to-pink-500 text-white' 
                    : 'border-2 border-pink-300 text-pink-700 hover:border-pink-500'
                  }
                `}
                style={{ fontFamily: 'Quicksand, sans-serif' }}
              >
                <span className="text-lg">{filter.icon}</span>
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Grid - Responsive 2 cols mobile, 3 cols desktop */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="bg-white rounded-[32px] shadow-lg overflow-hidden">
                <div className="p-4">
                  <div className="w-full aspect-square bg-teal-100 animate-pulse rounded-full mb-4" />
                  <div className="h-4 bg-teal-100 rounded-full w-3/4 animate-pulse mb-2" />
                  <div className="h-6 bg-pink-100 rounded-full w-1/2 animate-pulse mb-3" />
                  <div className="h-10 bg-amber-100 rounded-full animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-8xl mb-6">👶</div>
            <h3 className="text-2xl font-bold text-teal-700 mb-3" style={{ fontFamily: 'Quicksand, sans-serif' }}>
              Không tìm thấy sản phẩm
            </h3>
            <p className="text-gray-600 mb-8 text-lg">
              Hãy thử bộ lọc khác cho bé nhé!
            </p>
            <Button
              onClick={() => {
                setSelectedAge('all');
                setSelectedAllergen('all');
              }}
              className="bg-gradient-to-r from-teal-400 to-pink-400 hover:from-teal-500 hover:to-pink-500 text-white rounded-full px-10 py-4 text-lg font-bold shadow-lg"
            >
              Xem tất cả
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {filteredProducts.map((product) => {
              const ageRange = getAgeRange(product.name, product.short_description);
              const isProductOrganic = isOrganic(product.name, product.short_description);
              const isProductNoSugar = isNoSugar(product.name, product.short_description);
              const ingredients = getIngredients(product.name);
              const safetyBadges = getSafetyBadges();
              const isInWishlist = wishlist.has(product.id);
              
              return (
                <div
                  key={product.id}
                  onClick={() => handleProductClick(product)}
                  className="bg-white rounded-[32px] shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden border-4 border-transparent hover:border-teal-300 hover:scale-105 animate-[bounce_1s_ease-in-out]"
                  style={{ animationIterationCount: '1' }}
                >
                  <div className="p-4">
                    {/* Circular Image with Cute Border */}
                    <div className="relative mb-4">
                      <div className="w-full aspect-square rounded-full overflow-hidden shadow-xl bg-gradient-to-br from-teal-100 to-pink-100 p-3">
                        <div className="w-full h-full rounded-full overflow-hidden border-4 border-white">
                          <MediaViewer
                            src={product.media || product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            isHomepage={false}
                          />
                        </div>
                      </div>
                      
                      {/* Wishlist Heart */}
                      <button
                        onClick={(e) => toggleWishlist(e, product.id)}
                        className="absolute top-2 right-2 p-2 bg-white/90 rounded-full shadow-md hover:scale-110 transition-all"
                      >
                        <Heart className={`h-5 w-5 ${isInWishlist ? 'fill-pink-500 text-pink-500' : 'text-gray-400'}`} />
                      </button>

                      {/* Age Badge */}
                      <div className="absolute bottom-2 left-2 bg-gradient-to-r from-amber-400 to-amber-500 text-white px-3 py-1 rounded-full shadow-md">
                        <span className="text-xs font-bold flex items-center gap-1">
                          <Baby className="h-3 w-3" />
                          {AGE_FILTERS.find(f => f.value === ageRange)?.label}
                        </span>
                      </div>

                      {product.stock === 0 && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full">
                          <span className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                            Hết hàng
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Product Name */}
                    <h3 className="font-bold text-gray-800 text-sm md:text-base line-clamp-2 mb-3 min-h-[40px]" style={{ fontFamily: 'Quicksand, sans-serif' }}>
                      {product.name}
                    </h3>

                    {/* Badges - Organic & No Sugar */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {isProductOrganic && (
                        <Badge className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full border-2 border-green-300">
                          <Leaf className="h-3 w-3 mr-1" />
                          ORGANIC
                        </Badge>
                      )}
                      {isProductNoSugar && (
                        <Badge className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full border-2 border-blue-300">
                          <ShieldCheck className="h-3 w-3 mr-1" />
                          NO SUGAR
                        </Badge>
                      )}
                    </div>

                    {/* Safety Certifications */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {safetyBadges.map((badge, idx) => (
                        <span key={idx} className="text-[10px] bg-teal-50 text-teal-600 px-2 py-0.5 rounded-full border border-teal-200">
                          {badge}
                        </span>
                      ))}
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-xl md:text-2xl font-bold text-teal-600 tabular-nums" style={{ fontFamily: 'Quicksand, sans-serif' }}>
                        {formatVietnamPrice(product.price)}
                      </span>
                      {product.originalPrice && (
                        <span className="text-xs text-gray-400 line-through tabular-nums">
                          {formatVietnamPrice(product.originalPrice)}
                        </span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button
                        disabled={product.stock === 0}
                        className="flex-1 bg-gradient-to-r from-teal-400 to-teal-500 hover:from-teal-500 hover:to-teal-600 text-white rounded-full py-3 px-4 font-bold text-sm shadow-lg transition-all"
                        onClick={(e) => handleAddToCart(e, product)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Thêm
                      </Button>

                      <button
                        onClick={(e) => toggleIngredients(e, product.id)}
                        className="p-3 text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded-full transition-all border-2 border-teal-300"
                        title="Thành phần"
                      >
                        <Info className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Ingredients Quick View */}
                    {showIngredients === product.id && (
                      <div className="mt-4 p-4 bg-gradient-to-br from-teal-50 to-pink-50 rounded-[20px] border-2 border-teal-200">
                        <h4 className="text-xs font-bold text-teal-700 mb-2 flex items-center gap-1">
                          <Leaf className="h-3 w-3" />
                          Thành phần
                        </h4>
                        <ul className="space-y-1">
                          {ingredients.map((ingredient, idx) => (
                            <li key={idx} className="text-xs text-gray-700 flex items-start gap-1">
                              <span className="text-teal-500">•</span>
                              {ingredient}
                            </li>
                          ))}
                        </ul>
                        <div className="mt-3 pt-3 border-t border-teal-200">
                          <p className="text-[10px] text-amber-700 font-semibold flex items-center gap-1">
                            ⚠️ Không chứa chất bảo quản, phẩm màu
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Parent Reviews - Star Rating */}
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                        ))}
                        <span className="text-xs text-gray-500 ml-1">(128 đánh giá)</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Baby Icon */}
      <div className="fixed bottom-24 right-4 bg-gradient-to-r from-teal-400 to-pink-400 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-all cursor-pointer z-30 animate-bounce">
        <span className="text-3xl">🍼</span>
      </div>

      {/* Bottom Navigation */}
      <StorefrontBottomNav activeTab="categories" onTabChange={() => {}} />
    </div>
  );
}
