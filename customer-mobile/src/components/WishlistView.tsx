'use client'

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Heart, ShoppingCart, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

interface WishlistProduct {
  id: string;
  productId: string;
  productName: string;
  productPrice: number;
  productImage: string;
  productSlug?: string;
  productStock: number;
  productStatus: string;
  addedAt: string;
}

interface WishlistViewProps {
  onBack: () => void;
  addToCart?: (product: any) => void;
}

const API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || '/api';

export function WishlistView({ onBack, addToCart }: WishlistViewProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Fetch wishlist
  const { data: wishlistData, isLoading, error } = useQuery({
    queryKey: ['wishlist', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const res = await fetch(`${API_URL}/wishlist`, {
        credentials: 'include' // Include session cookie
      });
      if (!res.ok) throw new Error('Failed to fetch wishlist');
      
      const data = await res.json();
      return data.wishlist || [];
    },
    enabled: !!user?.id
  });

  const wishlist = wishlistData || [];

  // Remove from wishlist mutation
  const removeFromWishlistMutation = useMutation({
    mutationFn: async (productId: string) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const res = await fetch(`${API_URL}/wishlist/${productId}`, {
        method: 'DELETE',
        credentials: 'include' // Include session cookie
      });
      
      if (!res.ok) throw new Error('Failed to remove from wishlist');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist', user?.id] });
    }
  });

  const handleRemoveFromWishlist = (productId: string) => {
    removeFromWishlistMutation.mutate(productId);
  };

  const handleAddToCart = (product: WishlistProduct) => {
    if (addToCart) {
      addToCart({
        id: product.productId,
        name: product.productName,
        price: product.productPrice,
        image: product.productImage,
        category_id: '',
        stock: product.productStock
      });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  // Not authenticated state
  if (!user) {
    return (
      <div className="p-4 pt-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={onBack} className="p-2 mr-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold text-gray-900">Sản phẩm yêu thích</h1>
        </div>
        <div className="text-center py-16">
          <Heart className="w-20 h-20 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Vui lòng đăng nhập
          </h3>
          <p className="text-gray-500 mb-6">
            Đăng nhập để xem sản phẩm yêu thích của bạn
          </p>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="p-4 pt-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={onBack} className="p-2 mr-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold text-gray-900">Sản phẩm yêu thích</h1>
        </div>
        <div className="text-center py-16">
          <Loader2 className="w-12 h-12 text-green-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-500">Đang tải...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-4 pt-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={onBack} className="p-2 mr-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold text-gray-900">Sản phẩm yêu thích</h1>
        </div>
        <div className="text-center py-16">
          <p className="text-red-500">Có lỗi xảy ra. Vui lòng thử lại.</p>
        </div>
      </div>
    );
  }

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
          {wishlist.map((product: WishlistProduct) => {
            const inStock = product.productStock > 0 && product.productStatus === 'active';
            
            return (
              <div
                key={product.id}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-gray-100 relative"
              >
                {/* Remove Button */}
                <button
                  onClick={() => handleRemoveFromWishlist(product.productId)}
                  disabled={removeFromWishlistMutation.isPending}
                  className="absolute top-2 right-2 z-10 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 disabled:opacity-50"
                >
                  {removeFromWishlistMutation.isPending ? (
                    <Loader2 className="w-4 h-4 text-red-500 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4 text-red-500" />
                  )}
                </button>

                {/* Product Image */}
                <div className="aspect-square bg-gray-100 relative overflow-hidden">
                  <img
                    src={product.productImage || '/images/placeholder-product.jpg'}
                    alt={product.productName}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    onError={(e) => {
                      e.currentTarget.src = '/images/placeholder-product.jpg';
                    }}
                  />
                  
                  {/* Stock Badge */}
                  {!inStock && (
                    <div className="absolute top-2 left-2 bg-gray-900/80 text-white px-2 py-1 rounded text-xs font-medium">
                      Hết hàng
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-3">
                  <h3 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2 min-h-[40px]">
                    {product.productName}
                  </h3>
                  
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-lg font-bold text-green-600">
                      {formatPrice(product.productPrice)}
                    </span>
                  </div>

                  {/* Add to Cart Button */}
                  <Button
                    onClick={() => handleAddToCart(product)}
                    disabled={!inStock}
                    className={`w-full ${
                      inStock
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                    size="sm"
                  >
                    <ShoppingCart className="w-4 h-4 mr-1" />
                    {inStock ? 'Thêm giỏ hàng' : 'Hết hàng'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
