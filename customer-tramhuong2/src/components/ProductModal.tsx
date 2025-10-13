'use client'

import React, { useState } from 'react';
import { X, Star, ShoppingCart, Store, Heart, Truck, Shield, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatVietnamPrice } from '@/utils/currency';
import { ProductReviews } from '@/components/ProductReviews';

interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
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

interface CartItem {
  product: Product;
  quantity: number;
}

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  onViewFull?: (product: Product) => void;
  cart: CartItem[];
}

export function ProductModal({ product, isOpen, onClose, onAddToCart, onViewFull, cart }: ProductModalProps) {
  const [quantity, setQuantity] = useState(1);
  
  React.useEffect(() => {
    if (isOpen && product) {
      setQuantity(1);
    }
  }, [isOpen, product?.id]);
  
  if (!isOpen || !product) return null;

  const cartItem = cart.find(item => item.product.id === product.id);
  const quantityInCart = cartItem?.quantity || 0;

  const handleAddToCart = () => {
    onAddToCart(product);
  };

  const formatBenefits = (benefits: string | string[] | undefined) => {
    if (!benefits) return [];
    if (typeof benefits === 'string') {
      return benefits.split(',').map(b => b.trim()).filter(b => b.length > 0);
    }
    return benefits;
  };

  const getStableRating = (productId: string) => {
    let hash = 0;
    for (let i = 0; i < productId.length; i++) {
      const char = productId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return 4.0 + Math.abs(hash % 10) / 10;
  };

  const getStableReviewCount = (productId: string) => {
    let hash = 0;
    for (let i = 0; i < productId.length; i++) {
      const char = productId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return 25 + Math.abs(hash % 75);
  };

  const rating = getStableRating(product.id);
  const reviewCount = getStableReviewCount(product.id);

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<Star key={i} className="h-4 w-4 fill-tramhuong-accent text-tramhuong-accent transition-all duration-300" />);
      } else if (i - rating < 1) {
        stars.push(<Star key={i} className="h-4 w-4 fill-tramhuong-accent/50 text-tramhuong-accent transition-all duration-300" />);
      } else {
        stars.push(<Star key={i} className="h-4 w-4 text-tramhuong-accent/30 transition-all duration-300" />);
      }
    }
    return stars;
  };

  const renderBadges = () => {
    const badges = [];
    if (product.isBestseller) {
      badges.push(
        <div key="bestseller" className="border border-tramhuong-accent/30 text-tramhuong-accent px-3 py-1 rounded text-xs font-medium transition-all duration-300 hover:border-tramhuong-accent/50">
          Bestseller
        </div>
      );
    }
    if (product.isNew) {
      badges.push(
        <div key="new" className="border border-tramhuong-accent/30 text-tramhuong-accent px-3 py-1 rounded text-xs font-medium transition-all duration-300 hover:border-tramhuong-accent/50">
          New
        </div>
      );
    }
    if (product.isTopseller) {
      badges.push(
        <div key="topseller" className="border border-tramhuong-accent/30 text-tramhuong-accent px-3 py-1 rounded text-xs font-medium transition-all duration-300 hover:border-tramhuong-accent/50">
          Premium
        </div>
      );
    }
    if (product.isFreeshipping) {
      badges.push(
        <div key="freeship" className="border border-tramhuong-accent/30 text-tramhuong-accent px-3 py-1 rounded text-xs font-medium transition-all duration-300 hover:border-tramhuong-accent/50">
          Free Shipping
        </div>
      );
    }
    return badges;
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-tramhuong-primary/20 backdrop-blur-sm z-50 animate-in fade-in-0 duration-300"
        onClick={onClose}
      />
      
      <div className="fixed inset-0 z-[51] flex items-center justify-center p-4"
           onClick={onClose}>
        <div 
          className="bg-white/60 backdrop-blur-md rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-[0_8px_32px_rgba(193,168,117,0.3)] animate-in slide-in-from-bottom-4 zoom-in-95 duration-300 border border-tramhuong-accent/20"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative bg-tramhuong-accent/10 backdrop-blur-md border-b border-tramhuong-accent/20 px-8 py-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="absolute top-4 right-4 h-10 w-10 p-0 text-tramhuong-accent hover:text-tramhuong-primary hover:bg-tramhuong-accent/20 rounded-full transition-all duration-300 z-10"
            >
              <X className="h-5 w-5" />
            </Button>
            
            <div className="text-sm text-tramhuong-accent mb-2">
              <span className="hover:text-tramhuong-primary cursor-pointer transition-all duration-300">Sản phẩm</span> 
              <span className="mx-2">•</span> 
              <span className="text-tramhuong-primary font-medium">Chi tiết</span>
            </div>
            
            <div className="pr-16">
              <h1 className="font-playfair text-xl font-semibold text-tramhuong-primary mb-3 leading-tight">
                {product.name}
              </h1>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  {renderStars(rating)}
                  <span className="ml-2 text-sm font-medium text-tramhuong-primary">
                    {rating.toFixed(1)}
                  </span>
                </div>
                <div className="text-sm text-tramhuong-accent">
                  ({reviewCount} đánh giá)
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {renderBadges()}
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 p-8 overflow-y-auto max-h-[calc(90vh-200px)]">
            <div className="space-y-4">
              <div className="aspect-[5/4] bg-tramhuong-accent/10 backdrop-blur-sm relative overflow-hidden rounded-lg border border-tramhuong-accent/20">
                {product.image ? (
                  <img 
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-tramhuong-accent">
                    <div className="text-center">
                      <Store className="h-24 w-24 mx-auto mb-4 text-tramhuong-accent/50" />
                      <p className="text-tramhuong-accent font-medium text-lg">Hình ảnh sản phẩm</p>
                    </div>
                  </div>
                )}
                
                <div className="absolute top-4 left-4">
                  {product.stock <= 5 && product.stock > 0 && (
                    <div className="bg-tramhuong-accent text-tramhuong-primary px-3 py-1 rounded-md text-xs font-medium tracking-wide">
                      LOW STOCK: {product.stock}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 transition-all duration-300 hover:bg-tramhuong-accent/10 rounded-lg">
                  <Shield className="h-5 w-5 text-tramhuong-accent mx-auto mb-2" />
                  <p className="text-sm text-tramhuong-primary">Chất lượng</p>
                </div>
                <div className="p-3 transition-all duration-300 hover:bg-tramhuong-accent/10 rounded-lg">
                  <Truck className="h-5 w-5 text-tramhuong-accent mx-auto mb-2" />
                  <p className="text-sm text-tramhuong-primary">Giao hàng</p>
                </div>
                <div className="p-3 transition-all duration-300 hover:bg-tramhuong-accent/10 rounded-lg">
                  <Award className="h-5 w-5 text-tramhuong-accent mx-auto mb-2" />
                  <p className="text-sm text-tramhuong-primary">Uy tín</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="border border-tramhuong-accent/20 rounded-lg p-6 bg-tramhuong-accent/10 backdrop-blur-sm">
                <div className="flex items-baseline gap-3 mb-3">
                  <span className="text-2xl font-semibold text-tramhuong-primary">
                    {formatVietnamPrice(product.price)}
                  </span>
                  <span className="text-base text-tramhuong-primary/40 line-through">
                    {formatVietnamPrice(Math.floor(product.price * 1.2))}
                  </span>
                </div>
                <div className="text-sm text-tramhuong-primary/70">
                  Tiết kiệm {Math.floor(((Math.floor(product.price * 1.2) - product.price) / Math.floor(product.price * 1.2)) * 100)}% so với giá gốc
                </div>
              </div>

              {product.short_description && (
                <div className="bg-tramhuong-accent/10 backdrop-blur-sm rounded-lg p-6 border border-tramhuong-accent/20">
                  <h3 className="font-playfair font-semibold text-tramhuong-primary mb-4 text-base">
                    Mô tả sản phẩm
                  </h3>
                  <p className="text-tramhuong-primary/80 leading-relaxed text-sm">
                    {product.short_description}
                  </p>
                </div>
              )}

              {product.benefits && formatBenefits(product.benefits).length > 0 && (
                <div className="border border-tramhuong-accent/20 rounded-lg p-6 bg-white/40 backdrop-blur-sm">
                  <h3 className="font-playfair font-semibold text-tramhuong-primary mb-4 text-base">
                    Công dụng nổi bật
                  </h3>
                  <ul className="space-y-2">
                    {formatBenefits(product.benefits).map((benefit, index) => (
                      <li key={index} className="flex items-start gap-3 text-tramhuong-primary/80 text-sm">
                        <span className="w-1.5 h-1.5 bg-tramhuong-accent rounded-full mt-2 flex-shrink-0"></span>
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex items-center justify-between py-3 px-4 bg-tramhuong-accent/10 backdrop-blur-sm rounded-lg border border-tramhuong-accent/20">
                <span className="text-sm text-tramhuong-primary/70">Tình trạng</span>
                {product.stock > 0 ? (
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-tramhuong-accent rounded-full"></div>
                    <span className="text-tramhuong-accent font-medium text-sm">
                      Còn hàng ({product.stock})
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-tramhuong-primary/50 rounded-full"></div>
                    <span className="text-tramhuong-primary/50 font-medium text-sm">Hết hàng</span>
                  </div>
                )}
              </div>

              {quantityInCart > 0 && (
                <div className="bg-tramhuong-accent/10 backdrop-blur-sm border border-tramhuong-accent/20 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <ShoppingCart className="h-4 w-4 text-tramhuong-accent" />
                    <div>
                      <span className="font-medium text-tramhuong-primary text-sm">
                        Đã có {quantityInCart} sản phẩm trong giỏ hàng
                      </span>
                      <p className="text-xs text-tramhuong-accent">Bạn có thể thêm nhiều hơn nữa</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="px-8 pb-8">
            <ProductReviews productId={product.id} />
          </div>

          <div className="bg-tramhuong-accent/10 backdrop-blur-md border-t border-tramhuong-accent/20 p-8">
            <div className="space-y-4">
              {onViewFull && (
                <Button
                  variant="outline"
                  onClick={() => onViewFull(product)}
                  className="w-full border border-tramhuong-accent/30 text-tramhuong-accent hover:bg-tramhuong-accent/20 hover:border-tramhuong-accent/50 font-medium py-4 px-6 rounded-lg transition-all duration-300"
                >
                  <Store className="h-5 w-5 mr-2" />
                  Xem đầy đủ
                </Button>
              )}
              
              <div className={`grid gap-4 ${onViewFull ? 'grid-cols-3' : 'grid-cols-2'}`}>
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="border-2 border-tramhuong-accent/30 text-tramhuong-accent hover:bg-tramhuong-accent/20 font-semibold py-4 rounded-xl transition-all duration-300"
                >
                  Đóng
                </Button>
                
                <Button
                  variant="outline"
                  className="border-2 border-tramhuong-accent/30 text-tramhuong-accent hover:bg-tramhuong-accent/20 font-semibold py-4 rounded-xl transition-all duration-300"
                >
                  <Heart className="h-5 w-5 mr-2" />
                  Yêu thích
                </Button>
                
                <Button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className={`font-medium py-4 rounded-lg transition-all duration-300 ${
                    onViewFull ? '' : 'col-span-2'
                  } ${
                    product.stock === 0 
                      ? 'bg-tramhuong-accent/40 hover:bg-tramhuong-accent/40' 
                      : 'bg-tramhuong-accent hover:bg-tramhuong-accent/80'
                  } text-tramhuong-primary`}
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  {product.stock === 0 ? 'Hết hàng' : 'Thêm vào giỏ hàng'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
