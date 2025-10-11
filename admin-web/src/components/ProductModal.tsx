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
  // Badge properties
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
  
  // Reset quantity when product changes or modal opens
  React.useEffect(() => {
    if (isOpen && product) {
      setQuantity(1);
    }
  }, [isOpen, product?.id]);
  
  if (!isOpen || !product) return null;

  // Get current quantity in cart
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

  // Generate stable rating based on product ID (deterministic)
  const getStableRating = (productId: string) => {
    let hash = 0;
    for (let i = 0; i < productId.length; i++) {
      const char = productId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return 4.0 + Math.abs(hash % 10) / 10; // Rating between 4.0-4.9
  };

  const getStableReviewCount = (productId: string) => {
    let hash = 0;
    for (let i = 0; i < productId.length; i++) {
      const char = productId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return 25 + Math.abs(hash % 75); // Review count between 25-99
  };

  const rating = getStableRating(product.id);
  const reviewCount = getStableReviewCount(product.id);

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
      } else if (i - rating < 1) {
        stars.push(<Star key={i} className="h-4 w-4 fill-yellow-400/50 text-yellow-400" />);
      } else {
        stars.push(<Star key={i} className="h-4 w-4 text-blue-300" />);
      }
    }
    return stars;
  };

  const renderBadges = () => {
    const badges = [];
    if (product.isBestseller) {
      badges.push(
        <div key="bestseller" className="border border-blue-300 text-blue-700 px-3 py-1 rounded text-xs font-medium">
          Bestseller
        </div>
      );
    }
    if (product.isNew) {
      badges.push(
        <div key="new" className="border border-blue-300 text-blue-700 px-3 py-1 rounded text-xs font-medium">
          New
        </div>
      );
    }
    if (product.isTopseller) {
      badges.push(
        <div key="topseller" className="border border-blue-300 text-blue-700 px-3 py-1 rounded text-xs font-medium">
          Premium
        </div>
      );
    }
    if (product.isFreeshipping) {
      badges.push(
        <div key="freeship" className="border border-blue-300 text-blue-700 px-3 py-1 rounded text-xs font-medium">
          Free Shipping
        </div>
      );
    }
    return badges;
  };

  return (
    <>
      {/* Premium Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in-0 duration-300"
        onClick={onClose}
      />
      
      {/* Premium Modal */}
      <div className="fixed inset-0 z-[51] flex items-center justify-center p-4"
           onClick={onClose}>
        <div 
          className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-xl animate-in slide-in-from-bottom-4 zoom-in-95 duration-300 border border-blue-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative bg-blue-50 border-b border-blue-100 px-8 py-6">
            {/* Close Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="absolute top-4 right-4 h-10 w-10 p-0 text-blue-400 hover:text-blue-600 hover:bg-blue-100 rounded-full transition-all duration-200 z-10"
            >
              <X className="h-5 w-5" />
            </Button>
            
            {/* Breadcrumb */}
            <div className="text-sm text-blue-500 mb-2">
              <span className="hover:text-blue-700 cursor-pointer">Sản phẩm</span> 
              <span className="mx-2">•</span> 
              <span className="text-blue-700 font-medium">Chi tiết</span>
            </div>
            
            {/* Product Title & Rating */}
            <div className="pr-16">
              <h1 className="text-xl font-semibold text-slate-900 mb-3 leading-tight">
                {product.name}
              </h1>
              
              {/* Rating & Reviews */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  {renderStars(rating)}
                  <span className="ml-2 text-sm font-medium text-slate-700">
                    {rating.toFixed(1)}
                  </span>
                </div>
                <div className="text-sm text-blue-500">
                  ({reviewCount} đánh giá)
                </div>
              </div>
              
              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                {renderBadges()}
              </div>
            </div>
          </div>

          {/* Content Grid */}
          <div className="grid lg:grid-cols-2 gap-8 p-8 overflow-y-auto max-h-[calc(90vh-200px)]">
            {/* Left Column - Image */}
            <div className="space-y-4">
              <div className="aspect-[5/4] bg-blue-50 relative overflow-hidden rounded-lg border border-blue-200">
                {product.image ? (
                  <img 
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-blue-400">
                    <div className="text-center">
                      <Store className="h-24 w-24 mx-auto mb-4 text-blue-300" />
                      <p className="text-blue-500 font-medium text-lg">Hình ảnh sản phẩm</p>
                    </div>
                  </div>
                )}
                
                {/* Image Overlay Badges */}
                <div className="absolute top-4 left-4">
                  {product.stock <= 5 && product.stock > 0 && (
                    <div className="bg-red-600 text-white px-3 py-1 rounded-md text-xs font-medium tracking-wide">
                      LOW STOCK: {product.stock}
                    </div>
                  )}
                </div>
              </div>

              {/* Product Features */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3">
                  <Shield className="h-5 w-5 text-slate-600 mx-auto mb-2" />
                  <p className="text-sm text-slate-700">Chất lượng</p>
                </div>
                <div className="p-3">
                  <Truck className="h-5 w-5 text-slate-600 mx-auto mb-2" />
                  <p className="text-sm text-slate-700">Giao hàng</p>
                </div>
                <div className="p-3">
                  <Award className="h-5 w-5 text-slate-600 mx-auto mb-2" />
                  <p className="text-sm text-slate-700">Uy tín</p>
                </div>
              </div>
            </div>

            {/* Right Column - Product Info */}
            <div className="space-y-6">
              {/* Pricing */}
              <div className="border border-blue-200 rounded-lg p-6 bg-blue-50">
                <div className="flex items-baseline gap-3 mb-3">
                  <span className="text-2xl font-semibold text-slate-900">
                    {formatVietnamPrice(product.price)}
                  </span>
                  <span className="text-base text-slate-400 line-through">
                    {formatVietnamPrice(Math.floor(product.price * 1.2))}
                  </span>
                </div>
                <div className="text-sm text-slate-600">
                  Tiết kiệm {Math.floor(((Math.floor(product.price * 1.2) - product.price) / Math.floor(product.price * 1.2)) * 100)}% so với giá gốc
                </div>
              </div>

              {/* Description */}
              {product.short_description && (
                <div className="bg-blue-50 rounded-lg p-6 border border-blue-100">
                  <h3 className="font-semibold text-slate-900 mb-4 text-base">
                    Mô tả sản phẩm
                  </h3>
                  <p className="text-slate-700 leading-relaxed text-sm">
                    {product.short_description}
                  </p>
                </div>
              )}

              {/* Benefits */}
              {product.benefits && formatBenefits(product.benefits).length > 0 && (
                <div className="border border-blue-200 rounded-lg p-6">
                  <h3 className="font-semibold text-slate-900 mb-4 text-base">
                    Công dụng nổi bật
                  </h3>
                  <ul className="space-y-2">
                    {formatBenefits(product.benefits).map((benefit, index) => (
                      <li key={index} className="flex items-start gap-3 text-slate-700 text-sm">
                        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Stock Status - Minimalist */}
              <div className="flex items-center justify-between py-3 px-4 bg-blue-50 rounded-lg">
                <span className="text-sm text-slate-600">Tình trạng</span>
                {product.stock > 0 ? (
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-green-700 font-medium text-sm">
                      Còn hàng ({product.stock})
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-red-700 font-medium text-sm">Hết hàng</span>
                  </div>
                )}
              </div>

              {/* Quantity in Cart */}
              {quantityInCart > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <ShoppingCart className="h-4 w-4 text-blue-600" />
                    <div>
                      <span className="font-medium text-blue-900 text-sm">
                        Đã có {quantityInCart} sản phẩm trong giỏ hàng
                      </span>
                      <p className="text-xs text-blue-600">Bạn có thể thêm nhiều hơn nữa</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Product Reviews */}
          <div className="px-8 pb-8">
            <ProductReviews productId={product.id} />
          </div>

          {/* Footer */}
          <div className="bg-blue-50 border-t border-blue-100 p-8">

            {/* Action Buttons */}
            <div className="space-y-4">
              {/* "Xem Đầy Đủ" Button - Professional */}
              {onViewFull && (
                <Button
                  variant="outline"
                  onClick={() => onViewFull(product)}
                  className="w-full border border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400 font-medium py-4 px-6 rounded-lg transition-colors duration-200"
                >
                  <Store className="h-5 w-5 mr-2" />
                  Xem đầy đủ
                </Button>
              )}
              
              {/* Other Action Buttons */}
              <div className={`grid gap-4 ${onViewFull ? 'grid-cols-3' : 'grid-cols-2'}`}>
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="border-2 border-blue-300 text-blue-700 hover:bg-blue-50 font-semibold py-4 rounded-xl transition-all duration-200"
                >
                  Đóng
                </Button>
                
                <Button
                  variant="outline"
                  className="border-2 border-blue-300 text-blue-600 hover:bg-blue-50 font-semibold py-4 rounded-xl transition-all duration-200"
                >
                  <Heart className="h-5 w-5 mr-2" />
                  Yêu thích
                </Button>
                
                <Button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className={`font-medium py-4 rounded-lg transition-colors duration-200 ${
                    onViewFull ? '' : 'col-span-2'
                  } ${
                    product.stock === 0 
                      ? 'bg-blue-400 hover:bg-blue-400' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  } text-white`}
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
