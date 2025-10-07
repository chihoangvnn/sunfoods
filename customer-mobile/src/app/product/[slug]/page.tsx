import React from 'react';
import { Metadata } from 'next';
import { permanentRedirect, notFound } from 'next/navigation';
import { Heart, Star, ChevronRight, Package, Shield, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatVietnamPrice } from '@/utils/currency';
import ProductImageCarousel from '@/components/ProductImageCarousel';
import ProductActions from '@/components/ProductActions';
import ProductHeader from '@/components/ProductHeader';

interface ProductData {
  id: string;
  slug: string;
  name: string;
  price: number;
  originalPrice: number;
  image: string;
  images: string[];
  category_id: string;
  stock: number;
  short_description: string;
  description: string;
  status: string;
  benefits: string[];
  isNew?: boolean;
  isTopseller?: boolean;
  isFreeshipping?: boolean;
  isBestseller?: boolean;
  salesCount: number;
  rating: number;
  reviewCount: number;
  flashSale?: {
    startTime: string;
    endTime: string;
    discountPercent: number;
  };
  delivery: {
    from: string;
    to: string;
  };
  vouchers?: Array<{
    code: string;
    discount?: number;
    minPurchase?: number;
    type?: string;
  }>;
  returnPolicy: string;
  paymentOptions: string[];
}

function getSiteUrl(): string {
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  if (process.env.REPLIT_DEV_DOMAIN) return `https://${process.env.REPLIT_DEV_DOMAIN}`;
  return 'http://localhost:5000';
}

function isUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

async function getProduct(slug: string): Promise<ProductData | null> {
  try {
    const response = await fetch(`${getSiteUrl()}/api/products/slug/${slug}`, {
      next: { revalidate: 60 }
    });
    
    if (!response.ok) return null;
    return response.json();
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

export async function generateMetadata({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return {
      title: 'Sản phẩm không tìm thấy',
      description: 'Sản phẩm bạn đang tìm không tồn tại hoặc đã bị xóa.',
    };
  }

  const truncatedDescription = product.short_description?.length > 160 
    ? product.short_description.substring(0, 157) + '...'
    : product.short_description || product.description?.substring(0, 160);

  const keywords = [
    product.name,
    ...(product.benefits || []),
    'mua online',
    'giao hàng nhanh',
    'chất lượng cao'
  ].join(', ');

  const siteUrl = getSiteUrl();
  
  // Read ?img= parameter to support custom image selection for social sharing
  const resolvedSearchParams = await searchParams;
  const imgParam = resolvedSearchParams.img;
  const imageIndex = imgParam && typeof imgParam === 'string' ? parseInt(imgParam, 10) : 0;
  
  // Select image based on index (for affiliate sharing with different images)
  const productImages = product.images && product.images.length > 0 ? product.images : [product.image];
  const selectedImage = productImages[imageIndex] || productImages[0] || product.image;
  const absoluteImageUrl = selectedImage?.startsWith('http') ? selectedImage : `${siteUrl}${selectedImage}`;
  
  return {
    title: `${product.name} - Mua Online`,
    description: truncatedDescription,
    keywords: keywords,
    openGraph: {
      title: `${product.name} - Mua Online`,
      description: truncatedDescription,
      type: 'website',
      url: `${siteUrl}/product/${product.slug}`,
      images: [
        {
          url: absoluteImageUrl,
          width: 800,
          height: 600,
          alt: product.name,
        }
      ],
      siteName: 'Shop Online',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} - Mua Online`,
      description: truncatedDescription,
      images: [absoluteImageUrl],
    },
    alternates: {
      canonical: `/product/${product.slug}`,
    },
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  if (isUUID(slug)) {
    const response = await fetch(`${getSiteUrl()}/api/products/${slug}`, {
      next: { revalidate: 60 }
    });
    
    if (response.ok) {
      const product = await response.json();
      if (product.slug) {
        permanentRedirect(`/product/${product.slug}`);
      }
    }
  }
  
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  const discountPercent = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

  const formatDeliveryDate = (date: string) => {
    const d = new Date(date);
    return `${d.getDate()} Th${d.getMonth() + 1}`;
  };

  const formatSalesCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k+`;
    }
    return count.toString();
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`h-4 w-4 ${
            i <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
          }`}
        />
      );
    }
    return stars;
  };

  // Structured Data for Google Rich Results
  const siteUrl = getSiteUrl();
  
  const absoluteImages = (product.images?.length > 0 ? product.images : [product.image])
    .filter(Boolean)
    .map(img => img.startsWith('http') ? img : `${siteUrl}${img}`);
  
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": absoluteImages,
    "description": product.description,
    "sku": product.id,
    "brand": {
      "@type": "Brand",
      "name": "Shop Online"
    },
    "offers": {
      "@type": "Offer",
      "url": `${siteUrl}/product/${product.slug}`,
      "priceCurrency": "VND",
      "price": product.price,
      "priceValidUntil": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "itemCondition": "https://schema.org/NewCondition"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": product.rating,
      "reviewCount": product.reviewCount,
      "bestRating": 5,
      "worstRating": 1
    }
  };

  return (
    <div className="min-h-screen bg-white lg:bg-gray-50 pb-20 lg:pb-0">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <ProductHeader productName={product.name} />

      {/* Main Content - Responsive Grid */}
      <div className="max-w-7xl mx-auto px-0 lg:px-12 lg:py-6">
        <div className="lg:grid lg:grid-cols-2 lg:gap-8">
          {/* Left Column - Image Gallery (Sticky on Desktop) */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <ProductImageCarousel images={product.images} productName={product.name} />
          </div>

          {/* Right Column - Product Info */}
          <div>
            {/* Flash Sale Section */}
            {product.flashSale && (
              <div className="bg-gradient-to-r from-green-600 to-green-700 px-4 py-3 lg:rounded-t-lg text-white lg:mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  <span className="font-medium">
                    Flash Sale bắt đầu lúc 12:00, 30 Tháng 9
                  </span>
                </div>
              </div>
            )}

            {/* Product Info Section */}
            <div className="px-4 py-4 border-b-8 lg:border-b-0 border-gray-100 lg:bg-white lg:rounded-lg lg:mb-4">
              {/* Product Title with HOT badge */}
              <h1 className="text-lg font-bold mb-3 lg:hidden">
                <span className="inline-block bg-green-600 text-white text-xs px-2 py-0.5 rounded mr-2">
                  HOT
                </span>
                {product.name}
              </h1>

              {/* Price Display */}
              <div className="bg-gray-50 p-4 rounded-lg mb-3">
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="text-3xl font-bold text-green-600">
                    {formatVietnamPrice(product.price)}
                  </span>
                  <span className="text-gray-400 line-through">
                    {formatVietnamPrice(product.originalPrice)}
                  </span>
                  <span className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded">
                    -{discountPercent}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Đã bán {formatSalesCount(product.salesCount)}
                  </span>
                  <button className="text-green-600">
                    <Heart className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Delivery Info */}
              <div className="space-y-2 mb-3">
                <div className="flex items-center gap-2 text-sm">
                  <Package className="h-4 w-4 text-green-600" />
                  <span className="text-gray-600">
                    Nhận từ {formatDeliveryDate(product.delivery.from)} - {formatDeliveryDate(product.delivery.to)}
                  </span>
                </div>
                {product.isFreeshipping && (
                  <div className="flex items-center gap-2">
                    <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded">
                      Phí ship ₫0
                    </span>
                  </div>
                )}
              </div>

              {/* Vouchers */}
              {product.vouchers && product.vouchers.length > 0 && (
                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium">Mã giảm giá của Shop</span>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {product.vouchers.map((voucher, index) => (
                      <div
                        key={index}
                        className="flex-shrink-0 border border-green-600 text-green-700 px-3 py-1 rounded text-xs"
                      >
                        {voucher.type === 'freeship' ? 'Freeship' : `Giảm ${formatVietnamPrice(voucher.discount || 0)}`}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Discount Badge */}
              {product.vouchers && product.vouchers.length > 0 && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded text-sm mb-3">
                  Mua tối thiểu ₫250k để được giảm 5%
                </div>
              )}

              {/* Return Policy */}
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                <Shield className="h-4 w-4 text-green-600" />
                <span>{product.returnPolicy}</span>
              </div>

              {/* Payment Options */}
              <div className="space-y-2">
                <div className="text-sm font-medium">Phương thức thanh toán</div>
                <div className="flex gap-2 flex-wrap">
                  {product.paymentOptions.map((option, index) => (
                    <span
                      key={index}
                      className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-xs"
                    >
                      {option}
                    </span>
                  ))}
                </div>
              </div>

              <ProductActions product={product} />
            </div>

            {/* Product Description */}
            <div className="px-4 py-4 border-b-8 lg:border-b-0 border-gray-100 lg:bg-white lg:rounded-lg lg:mb-4">
              <h2 className="font-medium mb-3">Chi tiết sản phẩm</h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                {product.description}
              </p>
              {product.benefits && product.benefits.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-medium mb-2">Công dụng:</h3>
                  <ul className="space-y-1">
                    {product.benefits.map((benefit, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="text-green-600 mt-1">•</span>
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Reviews Section */}
            <div className="px-4 py-4 border-b-8 lg:border-b-0 border-gray-100 lg:bg-white lg:rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-medium">{product.rating}</span>
                  <div className="flex">
                    {renderStars(product.rating)}
                  </div>
                  <span className="text-sm text-gray-500">
                    ({product.reviewCount} đánh giá)
                  </span>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>

              <button className="w-full border border-green-600 text-green-700 py-2 rounded-lg text-sm font-medium hover:bg-green-50">
                ⭐ Đánh Giá Sản Phẩm
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
