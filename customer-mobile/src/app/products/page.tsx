'use client'

import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ShoppingCart, Star } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { fetchProducts } from '@/services/apiService';
import { useResponsive } from '@/hooks/use-mobile';
import { formatVietnamPrice } from '@/utils/currency';
import { Product, Category } from '@/types/api';
import { MobileHeader } from '@/components/MobileHeader';
import { DesktopShopeeHeader } from '@/components/DesktopShopeeHeader';

export default function ProductsPage() {
  const router = useRouter();
  const { isMobile } = useResponsive();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const layoutConfig = useMemo(() => ({
    gridCols: isMobile ? 'grid-cols-1' : 'grid-cols-4',
    containerClass: 'w-full',
    contentPadding: isMobile ? 'px-3 py-4' : 'px-6 py-8 lg:px-12 xl:px-16',
    gridGap: isMobile ? 'gap-2' : 'gap-4 lg:gap-5 xl:gap-6',
    desktopProductContainer: 'max-w-7xl mx-auto',
  }), [isMobile]);

  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ['all-products', selectedCategory],
    queryFn: async () => {
      return await fetchProducts({
        limit: 1000,
        categoryId: selectedCategory !== 'all' ? selectedCategory : undefined,
        sortBy: 'newest',
        sortOrder: 'desc'
      });
    },
    retry: false,
    staleTime: 30000,
  });

  const { data: categoriesData = [], isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await fetch(`/api/categories/filter?frontendId=frontend-a`);
      if (!response.ok) throw new Error('Failed to fetch categories');
      return response.json();
    },
    retry: false,
    staleTime: 60000,
  });

  const categories = useMemo(() => {
    return [
      { id: 'all', name: 'Tất cả' },
      ...categoriesData.filter(cat => cat.id !== 'all')
    ];
  }, [categoriesData]);

  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category_id === selectedCategory);
    }

    return filtered;
  }, [products, selectedCategory]);

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    e.preventDefault();
    console.log('Added to cart:', product.name);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Desktop Shopee Header - Only on desktop */}
      <DesktopShopeeHeader 
        cartCount={0}
        onSearch={(query) => router.push('/')}
        onCategoryClick={(cat) => router.push('/')}
        onCartClick={() => router.push('/')}
        onLogin={() => router.push('/')}
        onRegister={() => router.push('/')}
      />

      {/* Mobile Header - Only on mobile */}
      <MobileHeader
        storeName="Nhang Sạch .Net"
        cartCount={0}
        onCartClick={() => router.push('/')}
        onSearchClick={() => router.push('/')}
        onProfileClick={() => router.push('/')}
      />

      {/* Main Content with padding for desktop sticky header */}
      <div className="lg:pt-[160px]">
        <div className={layoutConfig.contentPadding}>
          <div className={layoutConfig.desktopProductContainer}>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
              Tất cả sản phẩm
            </h1>

          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-green-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:border-green-500'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          <div className={`grid ${layoutConfig.gridCols} ${layoutConfig.gridGap}`}>
            {productsLoading ? (
              Array.from({ length: 12 }).map((_, index) => (
                <div key={index} className="bg-white rounded-xl shadow-sm border border-green-100 overflow-hidden">
                  <div className="aspect-[4/5] bg-green-50 animate-pulse" />
                  <div className="p-4">
                    <div className="h-4 bg-green-100 rounded animate-pulse mb-2" />
                    <div className="h-3 bg-green-100 rounded animate-pulse w-2/3" />
                  </div>
                </div>
              ))
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12 col-span-full">
                <span className="text-4xl mb-4 block">🔍</span>
                <p className="text-gray-600 text-lg">Không tìm thấy sản phẩm</p>
                <p className="text-gray-400 text-sm mt-2">Thử tìm kiếm với từ khóa khác hoặc chọn danh mục khác</p>
              </div>
            ) : (
              filteredProducts.map((product) => {
                const rating = (product as any).rating || 4.5;
                const fullStars = Math.floor(rating);
                const hasHalfStar = rating % 1 >= 0.5;
                
                const mediaUrl = product.media || product.image || '';
                const isVideo = /\.(mp4|webm|mov)$/i.test(mediaUrl);
                
                return (
                  <Link 
                    key={product.id} 
                    href={`/product/${product.slug || product.id}`}
                    className="group relative bg-white rounded-lg border border-gray-200 overflow-hidden transition-all duration-300 shadow-sm hover:shadow-xl hover:border-green-500 block"
                  >
                    {product.isNew && (
                      <div className="absolute top-2 left-2 z-10">
                        <span className="bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded">
                          NEW
                        </span>
                      </div>
                    )}

                    <div className="relative aspect-[4/5] bg-gray-100 overflow-hidden">
                      {isVideo ? (
                        <video 
                          src={mediaUrl}
                          autoPlay 
                          muted 
                          loop 
                          playsInline 
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : product.image ? (
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                          loading="lazy"
                          quality={85}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <span className="text-sm">Sản phẩm</span>
                        </div>
                      )}
                    </div>

                    <div className="p-3 space-y-2">
                      <h3 className="font-medium text-gray-900 line-clamp-1 text-base" title={product.name}>
                        {product.name}
                      </h3>

                      {product.short_description && (
                        <div className="flex items-start gap-1">
                          <span className="text-green-600 mt-0.5">✓</span>
                          <p className="text-xs text-green-600 line-clamp-2">
                            {product.short_description}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, index) => (
                          <Star 
                            key={index} 
                            className={`h-4 w-4 ${
                              index < fullStars 
                                ? 'fill-yellow-400 text-yellow-400' 
                                : index === fullStars && hasHalfStar
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'fill-gray-200 text-gray-200'
                            }`}
                          />
                        ))}
                        <span className="text-sm text-gray-600">({rating.toFixed(1)})</span>
                      </div>

                      <div className="pt-1">
                        <span className="text-xl font-bold text-green-600">
                          {formatVietnamPrice(product.price)}
                        </span>
                      </div>

                      <button
                        onClick={(e) => handleAddToCart(e, product)}
                        disabled={product.stock === 0}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md flex items-center justify-center gap-2 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        <ShoppingCart className="h-4 w-4" />
                        <span>Add to Cart</span>
                      </button>

                      <div className="text-center">
                        {product.stock > 0 ? (
                          <span className="text-sm text-gray-500">
                            {product.stock} available
                          </span>
                        ) : (
                          <span className="text-sm text-gray-500">
                            Out of stock
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
