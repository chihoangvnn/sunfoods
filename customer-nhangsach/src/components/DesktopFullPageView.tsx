"use client";

import { useState } from 'react';
import { ArrowLeft, Star, ShoppingCart, Plus, Minus, Heart, Share } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { MediaViewer } from './MediaViewer';
import { ProductReviews } from './ProductReviews';
import { formatVietnamPrice } from '@/utils/currency';

// Types from page.tsx
interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
  media?: string; // Support both image and video URLs
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

interface DesktopFullPageViewProps {
  product: Product;
  cart: CartItem[];
  onBack: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
}

export function DesktopFullPageView({ product, cart, onBack, onAddToCart }: DesktopFullPageViewProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Generate deterministic rating based on product ID
  const generateRating = (productId: string) => {
    const hash = productId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return 3.5 + (Math.abs(hash) % 10) / 10; // Rating between 3.5-4.5
  };
  
  const rating = generateRating(product.id);
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  // Get product images (convert single image to array for consistency)
  const productImages = product.media 
    ? [product.media]
    : product.image 
      ? [product.image]
      : [];

  // Get quantity in cart
  const quantityInCart = cart.find(item => item.product.id === product.id)?.quantity || 0;

  const renderProductBadges = (product: Product) => {
    const badges = [];
    
    if (product.isNew) {
      badges.push(
        <Badge key="new" variant="new" className="text-xs">
          🆕 MỚI
        </Badge>
      );
    }
    
    if (product.isTopseller) {
      badges.push(
        <Badge key="topseller" variant="topseller" className="text-xs">
          🏆 BÁN CHẠY
        </Badge>
      );
    }
    
    if (product.isFreeshipping) {
      badges.push(
        <Badge key="freeshipping" variant="freeshipping" className="text-xs">
          🚚 FREESHIP
        </Badge>
      );
    }
    
    if (product.isBestseller) {
      badges.push(
        <Badge key="bestseller" variant="bestseller" className="text-xs">
          ⭐ YÊU THÍCH
        </Badge>
      );
    }
    
    return badges;
  };

  const handleAddToCart = () => {
    onAddToCart(product, quantity);
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Header with back button */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium">Quay lại</span>
          </button>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Heart className="h-4 w-4 mr-2" />
              Yêu thích
            </Button>
            <Button variant="outline" size="sm">
              <Share className="h-4 w-4 mr-2" />
              Chia sẻ
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content - 2 Column Layout */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Image Gallery (2/3 width) */}
          <div className="lg:col-span-2 space-y-4">
            {/* Main Image */}
            <div className="aspect-[4/3] bg-gray-100 rounded-2xl overflow-hidden shadow-sm">
              <MediaViewer
                src={productImages[selectedImageIndex]}
                alt={product.name}
                className="w-full h-full object-cover"
                isHomepage={false}
              />
            </div>
            
            {/* Thumbnail Gallery */}
            {productImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {productImages.map((image: string | undefined, index: number) => image && (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImageIndex === index 
                        ? 'border-blue-500 shadow-md' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <MediaViewer
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                      isHomepage={false}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Product Info (1/3 width) */}
          <div className="space-y-6">
            {/* Product Name & Badges */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-3 leading-tight">
                {product.name}
              </h1>
              
              {/* Product Badges */}
              {renderProductBadges(product).length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {renderProductBadges(product)}
                </div>
              )}
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {[...Array(fullStars)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
                {hasHalfStar && (
                  <Star className="h-5 w-5 fill-yellow-400/50 text-yellow-400" />
                )}
                {[...Array(emptyStars)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-gray-200 text-gray-200" />
                ))}
              </div>
              <span className="text-gray-600 text-sm">({rating.toFixed(1)})</span>
              <span className="text-blue-600 text-sm cursor-pointer hover:underline">
                Xem đánh giá
              </span>
            </div>

            {/* Price */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="text-3xl font-bold text-green-600 mb-1">
                {formatVietnamPrice(product.price)}
              </div>
              <div className="text-sm text-green-700">
                Giá đã bao gồm VAT
              </div>
            </div>

            {/* Description */}
            {product.short_description && (
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Mô tả sản phẩm</h3>
                <p className="text-gray-600 leading-relaxed text-sm">
                  {product.short_description}
                </p>
              </div>
            )}

            {/* Benefits */}
            {product.benefits && (
              <div className="bg-blue-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Công dụng chính</h3>
                <ul className="space-y-2">
                  {(typeof product.benefits === 'string' 
                    ? product.benefits.split(',').map(b => b.trim()).filter(b => b.length > 0)
                    : product.benefits
                  ).map((benefit, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <span className="text-blue-500 mt-1 text-lg">•</span>
                      <span className="text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Stock Status */}
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-700 font-medium">Tình trạng kho:</span>
                {product.stock > 0 ? (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-green-600 font-semibold">
                      Còn hàng ({product.stock})
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-red-600 font-semibold">Hết hàng</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quantity in Cart */}
            {quantityInCart > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-center gap-2 text-blue-800">
                  <ShoppingCart className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    Đã có {quantityInCart} sản phẩm trong giỏ hàng
                  </span>
                </div>
              </div>
            )}

            {/* Quantity Selector & Add to Cart */}
            <div className="sticky bottom-6 bg-white border border-gray-200 rounded-xl p-4 shadow-lg">
              {/* Quantity Selector */}
              <div className="flex items-center justify-center gap-4 mb-4">
                <span className="text-gray-700 font-medium">Số lượng:</span>
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="h-10 w-10 hover:bg-gray-100 rounded-none"
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center py-2 font-semibold bg-white">
                    {quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="h-10 w-10 hover:bg-gray-100 rounded-none"
                    disabled={quantity >= product.stock}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <Button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className={`w-full py-3 text-lg font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 ${
                  product.stock === 0 
                    ? 'bg-gray-400 hover:bg-gray-400' 
                    : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
                } text-white`}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                {product.stock === 0 ? 'Hết hàng' : `Thêm ${quantity} vào giỏ hàng`}
              </Button>
            </div>
          </div>
        </div>

        {/* Product Reviews Section */}
        <div className="mt-12 max-w-4xl">
          <ProductReviews productId={product.id} />
        </div>
      </div>
    </div>
  );
}