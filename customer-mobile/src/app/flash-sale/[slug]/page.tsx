import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { formatVietnamPrice } from '@/utils/currency';
import ProductImageCarousel from '@/components/ProductImageCarousel';
import ProductHeader from '@/components/ProductHeader';
import FlashSaleCountdown from '@/components/FlashSaleCountdown';
import FlashSaleActions from '@/components/FlashSaleActions';

interface FlashSaleData {
  id: string;
  slug: string;
  title: string;
  description: string;
  bannerImage?: string;
  startTime: string;
  endTime: string;
  originalPrice: number;
  salePrice: number;
  discountPercent: number;
  unit?: string;
  status: string;
  product: {
    id: string;
    name: string;
    description: string;
    image: string;
    images: string[];
    slug: string;
    stock: number;
    benefits?: string[];
  };
}

function getBackendUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  return 'http://localhost:3001';
}

function getSiteUrl(): string {
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  if (process.env.REPLIT_DEV_DOMAIN) return `https://${process.env.REPLIT_DEV_DOMAIN}`;
  return 'http://localhost:3003';
}

async function getFlashSale(slug: string): Promise<FlashSaleData | null> {
  try {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    const response = await fetch(`${backendUrl}/api/flash-sales/public/${slug}`, {
      next: { revalidate: 10 }
    });
    
    if (!response.ok) return null;
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching flash sale:', error);
    return null;
  }
}

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const flashSale = await getFlashSale(slug);

  if (!flashSale) {
    return {
      title: 'Flash Sale không tìm thấy',
      description: 'Flash sale bạn đang tìm không tồn tại hoặc đã hết hạn.',
    };
  }

  const truncatedDescription = flashSale.description?.length > 160 
    ? flashSale.description.substring(0, 157) + '...'
    : flashSale.description || flashSale.product.description?.substring(0, 160);

  const siteUrl = getSiteUrl();
  const productImages = flashSale.product.images && flashSale.product.images.length > 0 
    ? flashSale.product.images 
    : [flashSale.product.image];
  const selectedImage = flashSale.bannerImage || productImages[0] || flashSale.product.image;
  const absoluteImageUrl = selectedImage?.startsWith('http') 
    ? selectedImage 
    : `${siteUrl}${selectedImage}`;
  
  return {
    title: `${flashSale.title} - FLASH SALE ${flashSale.discountPercent}% OFF`,
    description: truncatedDescription,
    openGraph: {
      title: `🔥 ${flashSale.title} - Giảm ${flashSale.discountPercent}%`,
      description: truncatedDescription,
      type: 'website',
      url: `${siteUrl}/flash-sale/${flashSale.slug}`,
      images: [
        {
          url: absoluteImageUrl,
          width: 1200,
          height: 630,
          alt: flashSale.title,
        }
      ],
      siteName: 'Trầm Hương Store',
    },
    twitter: {
      card: 'summary_large_image',
      title: `🔥 ${flashSale.title} - Giảm ${flashSale.discountPercent}%`,
      description: truncatedDescription,
      images: [absoluteImageUrl],
    },
    alternates: {
      canonical: `/flash-sale/${flashSale.slug}`,
    },
  };
}

export default async function FlashSalePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const flashSale = await getFlashSale(slug);

  if (!flashSale) {
    notFound();
  }

  const productImages = flashSale.product.images && flashSale.product.images.length > 0 
    ? flashSale.product.images 
    : [flashSale.product.image];

  const siteUrl = getSiteUrl();
  const absoluteImages = productImages
    .filter(Boolean)
    .map((img: string) => img.startsWith('http') ? img : `${siteUrl}${img}`);
  
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Offer",
    "name": flashSale.title,
    "description": flashSale.description,
    "url": `${siteUrl}/flash-sale/${flashSale.slug}`,
    "image": absoluteImages,
    "price": flashSale.salePrice,
    "priceCurrency": "VND",
    "availability": flashSale.status === 'active' ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    "priceValidUntil": flashSale.endTime,
    "itemOffered": {
      "@type": "Product",
      "name": flashSale.product.name,
      "description": flashSale.product.description,
      "image": absoluteImages,
    }
  };

  const isExpired = new Date(flashSale.endTime) <= new Date();

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white lg:bg-gray-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <ProductHeader productName={flashSale.title} />

      <main className="pb-32 lg:pb-0">
        <div className="max-w-7xl mx-auto px-0 lg:px-12 lg:py-6">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8">
            {/* Left Column - Image Gallery */}
            <div className="lg:sticky lg:top-24 lg:self-start">
              <div className="relative">
                <ProductImageCarousel images={productImages} productName={flashSale.product.name} />
                
                {/* Discount Badge - Top Right Corner */}
                <div className="absolute top-4 right-4 z-10">
                  <div className="bg-gradient-to-br from-red-600 to-orange-600 text-white px-4 py-2 rounded-full shadow-2xl transform rotate-12 animate-pulse">
                    <p className="text-2xl font-bold leading-none">-{flashSale.discountPercent}%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Flash Sale Info */}
            <div>
              {/* Countdown Timer Section */}
              <div className="bg-gradient-to-r from-red-600 via-orange-600 to-red-700 px-4 py-6 lg:rounded-t-lg shadow-xl lg:mb-4">
                <FlashSaleCountdown endTime={flashSale.endTime} />
              </div>

              {/* Product Info Section */}
              <div className="px-4 py-6 border-b-8 lg:border-b-0 border-gray-100 lg:bg-white lg:rounded-lg lg:mb-4 lg:shadow-md">
                <div className="mb-4">
                  <span className="inline-block bg-gradient-to-r from-red-600 to-orange-600 text-white text-sm px-4 py-1.5 rounded-full font-bold mb-3 shadow-md">
                    ⚡ FLASH SALE
                  </span>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{flashSale.title}</h1>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {flashSale.description || flashSale.product.description}
                  </p>
                </div>

                {/* Price Display with Glass Morphism */}
                <div className="bg-gradient-to-br from-orange-50 to-red-50 backdrop-blur-sm p-6 rounded-2xl mb-4 border-2 border-orange-200 shadow-lg">
                  <div className="flex items-baseline gap-4 mb-3">
                    <span className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-600 animate-pulse">
                      {formatVietnamPrice(flashSale.salePrice)}
                      {flashSale.unit && `/${flashSale.unit}`}
                    </span>
                    <span className="text-gray-400 line-through text-xl">
                      {formatVietnamPrice(flashSale.originalPrice)}
                      {flashSale.unit && `/${flashSale.unit}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="bg-gradient-to-r from-red-600 to-orange-600 text-white text-sm px-4 py-1.5 rounded-full font-bold shadow-md">
                      Giảm {flashSale.discountPercent}%
                    </span>
                    <span className="text-sm text-gray-700 font-medium">
                      💰 Tiết kiệm {formatVietnamPrice(flashSale.originalPrice - flashSale.salePrice)}
                    </span>
                  </div>
                </div>

                {/* Product Benefits */}
                {flashSale.product.benefits && flashSale.product.benefits.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <span className="text-xl">✨</span>
                      <span>Điểm nổi bật</span>
                    </h3>
                    <ul className="space-y-2">
                      {flashSale.product.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-start gap-3 text-gray-700">
                          <span className="text-orange-500 mt-1 flex-shrink-0">✓</span>
                          <span className="text-sm leading-relaxed">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Sale Period Info */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                  <h3 className="font-semibold text-gray-900 mb-2 text-sm">⏰ Thời gian Flash Sale</h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Bắt đầu:</span>
                      <span className="font-medium">
                        {new Date(flashSale.startTime).toLocaleString('vi-VN')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Kết thúc:</span>
                      <span className="font-medium text-red-600">
                        {new Date(flashSale.endTime).toLocaleString('vi-VN')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Description */}
              <div className="px-4 py-6 border-b-8 lg:border-b-0 border-gray-100 lg:bg-white lg:rounded-lg lg:mb-4 lg:shadow-md">
                <h2 className="font-semibold text-gray-900 mb-3 text-lg">📋 Chi tiết sản phẩm</h2>
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                    {flashSale.product.description}
                  </p>
                </div>
              </div>

              {/* Policies Section */}
              <div className="px-4 py-6 lg:bg-white lg:rounded-lg lg:shadow-md">
                <h2 className="font-semibold text-gray-900 mb-4 text-lg">🛡️ Chính sách mua hàng</h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <span className="text-2xl flex-shrink-0">✅</span>
                    <div>
                      <div className="font-medium text-green-900">Đảm bảo chính hãng</div>
                      <div className="text-green-700 text-sm">100% sản phẩm cao cấp, nguồn gốc rõ ràng</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <span className="text-2xl flex-shrink-0">🚚</span>
                    <div>
                      <div className="font-medium text-blue-900">Giao hàng nhanh chóng</div>
                      <div className="text-blue-700 text-sm">Miễn phí vận chuyển cho đơn từ 500.000đ</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <span className="text-2xl flex-shrink-0">🔄</span>
                    <div>
                      <div className="font-medium text-purple-900">Đổi trả dễ dàng</div>
                      <div className="text-purple-700 text-sm">Hỗ trợ đổi trả trong 7 ngày nếu có lỗi</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Fixed Bottom Action Bar */}
      <FlashSaleActions 
        flashSale={{
          slug: flashSale.slug,
          salePrice: flashSale.salePrice,
          productId: flashSale.product.id,
          productName: flashSale.product.name,
          productImage: flashSale.product.image,
          stock: flashSale.product.stock,
          isExpired: isExpired,
        }}
      />
    </div>
  );
}
