'use client'

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import { formatVietnamPrice } from '@/utils/currency';
import { Badge } from '@/components/ui/badge';

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
  isNew?: boolean;
  isTopseller?: boolean;
  isFreeshipping?: boolean;
  isBestseller?: boolean;
  rating?: number;
  totalReviews?: number;
}

interface ShopSettings {
  featuredProducts?: string[];
  customBanners?: Array<{
    imageUrl: string;
    title?: string;
    description?: string;
    link?: string;
    position: 'top' | 'middle' | 'bottom';
    isActive: boolean;
  }>;
}

export function FeaturedProducts() {
  // Fetch shop settings to get featured product IDs
  const { data: shopSettings, isLoading: settingsLoading } = useQuery<{ data: ShopSettings }>({
    queryKey: ['shop-info'],
    queryFn: async () => {
      const res = await fetch('/api/shop-info');
      if (!res.ok) throw new Error('Failed to fetch shop settings');
      return res.json();
    },
    staleTime: 300000, // 5 minutes
  });

  const featuredProductIds = shopSettings?.data?.featuredProducts || [];

  // Fetch product details for featured products
  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ['featured-products', featuredProductIds],
    queryFn: async () => {
      if (!featuredProductIds || featuredProductIds.length === 0) {
        return [];
      }

      // Fetch products in parallel
      const productPromises = featuredProductIds.map(async (id: string) => {
        try {
          const res = await fetch(`/api/products/${id}`);
          if (!res.ok) return null;
          const response = await res.json();
          const product = response.data;
          return product;
        } catch (error) {
          console.error(`Failed to fetch product ${id}:`, error);
          return null;
        }
      });

      const results = await Promise.all(productPromises);
      // Filter out null results and ensure we have valid products
      return results.filter((p): p is Product => p !== null && p?.status === 'active');
    },
    enabled: featuredProductIds.length > 0,
    staleTime: 300000, // 5 minutes
  });

  const isLoading = settingsLoading || productsLoading;

  // Don't render if no featured products configured or fetched
  if (!isLoading && (!products || products.length === 0)) {
    return null;
  }

  const renderProductBadges = (product: Product) => {
    const badges = [];
    
    if (product.isNew) {
      badges.push(
        <Badge key="new" variant="new" className="text-xs">
          🆕 MỚI
        </Badge>
      );
    }
    
    if (product.isBestseller || product.isTopseller) {
      badges.push(
        <Badge key="bestseller" variant="bestseller" className="text-xs">
          ⭐ BÁN CHẠY
        </Badge>
      );
    }
    
    return badges;
  };

  return (
    <section className="w-full px-4 md:px-6 lg:px-8 xl:px-12 py-8 md:py-12 bg-gradient-to-b from-white to-[#FFF9F0]">
      <div className="max-w-7xl mx-auto">
        {/* Section Title - Trầm Hương Bronze Theme */}
        <div className="mb-6 md:mb-8">
          <h2 
            className="text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-2"
            style={{ 
              fontFamily: 'Playfair Display, serif',
              color: '#3D2B1F' // Bronze brown
            }}
          >
            Sản Phẩm Nổi Bật
          </h2>
          <div className="w-24 h-1 mx-auto rounded-full" style={{ backgroundColor: '#C1A875' }}></div>
        </div>

        {/* Products Grid - Responsive */}
        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="space-y-3 animate-pulse">
                <div className="aspect-[3/4] w-full rounded-xl bg-gray-200" />
                <div className="h-4 w-3/4 bg-gray-200 rounded" />
                <div className="h-6 w-1/2 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
            {products?.map((product) => {
              const productLink = product.slug ? `/product/${product.slug}` : `/products?id=${product.id}`;
              
              return (
                <Link 
                  key={product.id} 
                  href={productLink}
                  className="group cursor-pointer"
                >
                  <div 
                    className="bg-white rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl border border-transparent hover:border-[#C1A875]/30"
                    style={{
                      boxShadow: '0 2px 8px rgba(193, 168, 117, 0.1)'
                    }}
                  >
                    {/* Product Image */}
                    <div className="relative aspect-[3/4] bg-gray-50 overflow-hidden">
                      {product.media || product.image ? (
                        <Image
                          src={product.media || product.image || ''}
                          alt={product.name}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 16vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: '#FFF9F0' }}>
                          <span className="text-4xl">🌿</span>
                        </div>
                      )}
                      
                      {/* Bronze Glass Morphism Overlay on Hover */}
                      <div 
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                        style={{
                          background: 'rgba(193, 168, 117, 0.15)',
                          backdropFilter: 'blur(2px)'
                        }}
                      />
                      
                      {/* Badges Overlay */}
                      {renderProductBadges(product).length > 0 && (
                        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                          {renderProductBadges(product)}
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-3 md:p-4">
                      <h3 
                        className="font-medium text-sm md:text-base mb-2 line-clamp-2 min-h-[2.5rem]"
                        style={{ 
                          fontFamily: 'Nunito Sans, sans-serif',
                          color: '#3D2B1F' 
                        }}
                      >
                        {product.name}
                      </h3>
                      <p 
                        className="font-bold text-lg md:text-xl"
                        style={{ color: '#C1A875' }}
                      >
                        {formatVietnamPrice(product.price)}
                      </p>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <p className="text-gray-400 text-sm line-through">
                          {formatVietnamPrice(product.originalPrice)}
                        </p>
                      )}
                      
                      {/* Rating Display */}
                      {product.rating && product.rating > 0 && (
                        <div className="flex items-center gap-1 mt-2">
                          <span style={{ color: '#C1A875' }}>★</span>
                          <span className="text-sm" style={{ color: '#3D2B1F' }}>
                            {product.rating.toFixed(1)}
                          </span>
                          {product.totalReviews && product.totalReviews > 0 && (
                            <span className="text-xs text-gray-500">
                              ({product.totalReviews})
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
