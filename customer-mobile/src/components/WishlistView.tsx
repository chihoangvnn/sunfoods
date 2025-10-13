'use client'

import React, { useState } from 'react';
import { ArrowLeft, Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WishlistProduct {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  inStock: boolean;
}

// Mock wishlist data
const MOCK_WISHLIST: WishlistProduct[] = [
  {
    id: 'w1',
    name: 'Rau cải organic tươi',
    price: 25000,
    originalPrice: 35000,
    image: '/images/products/rau-cai-organic.jpg',
    category: 'Rau củ',
    inStock: true
  },
  {
    id: 'w2',
    name: 'Cà chua bi organic',
    price: 45000,
    image: '/images/products/ca-chua-bi.jpg',
    category: 'Rau củ',
    inStock: true
  },
  {
    id: 'w3',
    name: 'Gạo lứt hữu cơ 5kg',
    price: 120000,
    originalPrice: 150000,
    image: '/images/products/gao-lut.jpg',
    category: 'Gạo',
    inStock: true
  },
  {
    id: 'w4',
    name: 'Dầu ô liu nguyên chất',
    price: 180000,
    image: '/images/products/dau-oliu.jpg',
    category: 'Dầu ăn',
    inStock: true
  },
  {
    id: 'w5',
    name: 'Mật ong rừng tự nhiên',
    price: 250000,
    image: '/images/products/mat-ong.jpg',
    category: 'Mật ong',
    inStock: false
  },
  {
    id: 'w6',
    name: 'Bí đỏ organic',
    price: 35000,
    image: '/images/products/bi-do.jpg',
    category: 'Rau củ',
    inStock: true
  },
  {
    id: 'w7',
    name: 'Táo Fuji hữu cơ',
    price: 85000,
    originalPrice: 95000,
    image: '/images/products/tao-fuji.jpg',
    category: 'Trái cây',
    inStock: true
  },
  {
    id: 'w8',
    name: 'Sữa hạt điều organic',
    price: 65000,
    image: '/images/products/sua-hat-dieu.jpg',
    category: 'Sữa hạt',
    inStock: true
  }
];

interface WishlistViewProps {
  onBack: () => void;
  addToCart?: (product: any) => void;
}

export function WishlistView({ onBack, addToCart }: WishlistViewProps) {
  const [wishlist, setWishlist] = useState<WishlistProduct[]>(MOCK_WISHLIST);

  const handleRemoveFromWishlist = (productId: string) => {
    setWishlist(prev => prev.filter(p => p.id !== productId));
  };

  const handleAddToCart = (product: WishlistProduct) => {
    if (addToCart) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        category_id: product.category,
        stock: product.inStock ? 100 : 0
      });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  return (
    <div className="p-4 pt-6">
      {/* Header */}
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          onClick={onBack}
          className="p-2 mr-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-gray-900">Sản phẩm yêu thích</h1>
          <p className="text-sm text-gray-500 mt-0.5">{wishlist.length} sản phẩm</p>
        </div>
      </div>

      {/* Empty State */}
      {wishlist.length === 0 ? (
        <div className="text-center py-16">
          <Heart className="w-20 h-20 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Chưa có sản phẩm yêu thích
          </h3>
          <p className="text-gray-500 mb-6">
            Thêm sản phẩm vào danh sách để mua sau
          </p>
          <Button 
            onClick={onBack}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Khám phá sản phẩm
          </Button>
        </div>
      ) : (
        /* Product Grid - 2 cols mobile, 4 cols desktop */
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {wishlist.map((product) => (
            <div
              key={product.id}
              className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-gray-100 relative"
            >
              {/* Remove Button */}
              <button
                onClick={() => handleRemoveFromWishlist(product.id)}
                className="absolute top-2 right-2 z-10 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>

              {/* Product Image */}
              <div className="aspect-square bg-gray-100 relative overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  onError={(e) => {
                    e.currentTarget.src = '/images/placeholder-product.jpg';
                  }}
                />
                
                {/* Stock Badge */}
                {!product.inStock && (
                  <div className="absolute top-2 left-2 bg-gray-900/80 text-white px-2 py-1 rounded text-xs font-medium">
                    Hết hàng
                  </div>
                )}

                {/* Discount Badge */}
                {product.originalPrice && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                    -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-3">
                <h3 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2 min-h-[40px]">
                  {product.name}
                </h3>
                
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-lg font-bold text-green-600">
                    {formatPrice(product.price)}
                  </span>
                  {product.originalPrice && (
                    <span className="text-xs text-gray-400 line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                  )}
                </div>

                {/* Add to Cart Button */}
                <Button
                  onClick={() => handleAddToCart(product)}
                  disabled={!product.inStock}
                  className={`w-full ${
                    product.inStock
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                  size="sm"
                >
                  <ShoppingCart className="w-4 h-4 mr-1" />
                  {product.inStock ? 'Thêm giỏ hàng' : 'Hết hàng'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
