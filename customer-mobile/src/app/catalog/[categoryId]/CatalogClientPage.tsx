'use client'

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ShoppingBasket, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MediaViewer } from '@/components/MediaViewer';
import { formatVietnamPrice } from '@/utils/currency';
import { StorefrontBottomNav } from '@/components/StorefrontBottomNav';
import { CategoryNavigationMenu } from '@/components/CategoryNavigationMenu';

interface Category {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  sort_order: number;
}

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

interface CatalogClientPageProps {
  category: Category;
  initialProducts: Product[];
}

export default function CatalogClientPage({ 
  category, 
  initialProducts 
}: CatalogClientPageProps) {
  const router = useRouter();

  const handleProductClick = (product: Product) => {
    router.push(`/product/${product.slug || product.id}`);
  };

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    console.log('Add to cart:', product);
  };

  return (
    <div className="min-h-screen bg-emerald-50 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-emerald-200 shadow-sm">
        <div className="flex items-center gap-3 px-4 py-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="p-2 hover:bg-emerald-100 rounded-full"
          >
            <ArrowLeft className="h-5 w-5 text-emerald-800" />
          </Button>
          
          <div className="flex items-center gap-2 flex-1">
            <Leaf className="h-7 w-7 text-emerald-600" />
            <h1 className="text-xl md:text-2xl font-extrabold text-emerald-800">
              {category.name}
            </h1>
          </div>
          
          <div className="text-sm font-semibold text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full">
            {initialProducts.length} SP
          </div>
        </div>
      </div>

      {/* Category Navigation Menu */}
      <CategoryNavigationMenu activeCategory={category.id} />

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        {initialProducts.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-extrabold text-emerald-800 mb-2">
              Không tìm thấy sản phẩm
            </h3>
            <p className="text-emerald-600 mb-6">
              Hiện chưa có sản phẩm trong danh mục này
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {initialProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => handleProductClick(product)}
                className="bg-white rounded-3xl shadow-md border border-emerald-100 hover:shadow-xl hover:scale-105 hover:border-emerald-300 transition-all duration-300 cursor-pointer overflow-hidden animate-[bounce_0.5s_ease-out]"
                style={{
                  animationFillMode: 'backwards',
                  animationDelay: '0s'
                }}
              >
                {/* Circular Image with Border */}
                <div className="p-4">
                  <div className="aspect-square rounded-full bg-emerald-100 relative overflow-hidden border-4 border-white shadow-lg">
                    <MediaViewer
                      src={product.media || product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      isHomepage={false}
                    />
                    
                    {/* ORGANIC Badge */}
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-emerald-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
                        ORGANIC
                      </Badge>
                    </div>

                    {/* TƯƠI Badge with Leaf Icon */}
                    <div className="absolute bottom-2 left-2">
                      <Badge className="bg-yellow-300 text-emerald-800 text-xs font-bold px-2 py-1 rounded-full shadow-md flex items-center gap-1">
                        <Leaf className="h-3 w-3" />
                        TƯƠI
                      </Badge>
                    </div>
                    
                    {/* Stock indicator */}
                    {product.stock === 0 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                          Hết hàng
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Product Info */}
                <div className="px-4 pb-4">
                  <h3 className="font-extrabold text-sm md:text-base text-emerald-800 line-clamp-2 mb-2 min-h-[2.5rem]">
                    {product.name}
                  </h3>
                  
                  {/* Price */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl md:text-2xl font-bold text-emerald-600">
                      {formatVietnamPrice(product.price)}
                    </span>
                    {product.originalPrice && (
                      <span className="text-xs text-gray-400 line-through">
                        {formatVietnamPrice(product.originalPrice)}
                      </span>
                    )}
                  </div>

                  {/* Add to Cart Button with Basket Icon */}
                  <Button
                    disabled={product.stock === 0}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-full py-3 px-6 font-bold shadow-md hover:shadow-lg transition-all"
                    onClick={(e) => handleAddToCart(e, product)}
                  >
                    <ShoppingBasket className="h-4 w-4 mr-2" />
                    Thêm vào giỏ
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Category Info */}
      <div className="fixed bottom-24 right-4 bg-emerald-600 text-white p-4 rounded-full shadow-lg hover:bg-emerald-700 transition-all cursor-pointer z-30">
        <Leaf className="h-6 w-6" />
      </div>

      {/* Bottom Navigation */}
      <StorefrontBottomNav activeTab="categories" onTabChange={() => {}} />
    </div>
  );
}
