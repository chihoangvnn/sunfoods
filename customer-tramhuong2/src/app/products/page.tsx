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
import { ProductCard } from '@/components/ProductCard';

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
    <div className="min-h-screen bg-gradient-to-br from-tramhuong-primary/5 via-white to-tramhuong-accent/5">
      {/* Desktop Shopee Header - Only on desktop */}
      <DesktopShopeeHeader 
        cartCount={0}
        onSearch={(query) => router.push('/')}
        onCategoryClick={(cat) => router.push('/')}
        onCartClick={() => router.push('/')}
        onAccountClick={() => router.push('/')}
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
            <h1 className="text-2xl md:text-3xl font-playfair font-bold text-tramhuong-primary mb-6">
              Tất cả sản phẩm
            </h1>

          <div className="mb-8">
            <h2 className="text-lg font-playfair font-semibold text-tramhuong-primary mb-4">Danh mục</h2>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                    selectedCategory === category.id
                      ? 'bg-gradient-to-r from-tramhuong-primary to-tramhuong-accent text-white shadow-[0_4px_16px_rgba(193,168,117,0.4)]'
                      : 'bg-white/60 backdrop-blur-md text-tramhuong-primary border border-tramhuong-accent/30 hover:border-tramhuong-accent/60 hover:shadow-[0_2px_12px_rgba(193,168,117,0.3)]'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Sort Dropdown */}
          <div className="mb-6 flex justify-end">
            <select className="px-4 py-2 rounded-lg bg-white/60 backdrop-blur-md border border-tramhuong-accent/30 text-tramhuong-primary font-medium transition-all duration-300 hover:border-tramhuong-accent/60 focus:border-tramhuong-accent focus:ring-2 focus:ring-tramhuong-accent/20 outline-none">
              <option value="newest">Mới nhất</option>
              <option value="price-asc">Giá thấp đến cao</option>
              <option value="price-desc">Giá cao đến thấp</option>
              <option value="popular">Phổ biến</option>
            </select>
          </div>

          <div className={`grid ${layoutConfig.gridCols} ${layoutConfig.gridGap}`}>
            {productsLoading ? (
              Array.from({ length: 12 }).map((_, index) => (
                <div key={index} className="bg-white/60 backdrop-blur-md rounded-xl shadow-[0_4px_16px_rgba(193,168,117,0.2)] border border-tramhuong-accent/20 overflow-hidden">
                  <div className="aspect-[4/5] bg-tramhuong-accent/10 animate-pulse" />
                  <div className="p-4">
                    <div className="h-4 bg-tramhuong-accent/20 rounded animate-pulse mb-2" />
                    <div className="h-3 bg-tramhuong-accent/20 rounded animate-pulse w-2/3" />
                  </div>
                </div>
              ))
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12 col-span-full">
                <span className="text-4xl mb-4 block">🔍</span>
                <p className="text-tramhuong-primary text-lg font-playfair">Không tìm thấy sản phẩm</p>
                <p className="text-tramhuong-primary/60 text-sm mt-2">Thử tìm kiếm với từ khóa khác hoặc chọn danh mục khác</p>
              </div>
            ) : (
              filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={(p) => handleAddToCart({ stopPropagation: () => {}, preventDefault: () => {} } as any, p)}
                />
              ))
            )}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
