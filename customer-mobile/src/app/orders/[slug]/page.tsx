import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { formatVietnamPrice } from '@/utils/currency';
import ProductImageCarousel from '@/components/ProductImageCarousel';
import ProductHeader from '@/components/ProductHeader';
import PreorderActions from '@/components/PreorderActions';
import { Calendar } from 'lucide-react';

interface PreorderData {
  id: string;
  productId?: string;
  slug: string;
  title: string;
  description?: string;
  price: string;
  estimatedDate: string;
  bannerImage?: string;
  unit: string;
  isActive: boolean;
  product?: {
    id: string;
    name: string;
    description: string;
    image: string;
    images: string[];
    slug: string;
    stock: number;
    benefits?: string[];
    unit?: string;
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

async function getPreorder(slug: string): Promise<PreorderData | null> {
  try {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    const response = await fetch(`${backendUrl}/api/preorders/public/${slug}`, {
      next: { revalidate: 10 }
    });
    
    if (!response.ok) return null;
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching preorder:', error);
    return null;
  }
}

function formatVietnameseDate(dateString: string): string {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const preorder = await getPreorder(slug);

  if (!preorder) {
    return {
      title: 'Pre-order không tìm thấy',
      description: 'Pre-order bạn đang tìm không tồn tại.',
    };
  }

  const displayName = preorder.product?.name || preorder.title;
  const displayDescription = preorder.product?.description || preorder.description || '';
  const truncatedDescription = displayDescription.length > 160 
    ? displayDescription.substring(0, 157) + '...'
    : displayDescription;

  const siteUrl = getSiteUrl();
  const productImages = preorder.product?.images && preorder.product.images.length > 0 
    ? preorder.product.images 
    : preorder.product?.image ? [preorder.product.image] : [];
  const selectedImage = preorder.bannerImage || productImages[0] || '/images/placeholder.jpg';
  const absoluteImageUrl = selectedImage?.startsWith('http') 
    ? selectedImage 
    : `${siteUrl}${selectedImage}`;
  
  return {
    title: `${displayName} - PRE-ORDER | Trầm Hương`,
    description: truncatedDescription,
    openGraph: {
      title: `🔔 ${displayName} - Pre-order ngay`,
      description: truncatedDescription,
      type: 'website',
      url: `${siteUrl}/orders/${preorder.slug}`,
      images: [
        {
          url: absoluteImageUrl,
          width: 1200,
          height: 630,
          alt: displayName,
        }
      ],
      siteName: 'Trầm Hương Store',
    },
    twitter: {
      card: 'summary_large_image',
      title: `🔔 ${displayName} - Pre-order`,
      description: truncatedDescription,
      images: [absoluteImageUrl],
    },
    alternates: {
      canonical: `/orders/${preorder.slug}`,
    },
  };
}

export default async function PreorderPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const preorder = await getPreorder(slug);

  if (!preorder) {
    notFound();
  }

  const displayName = preorder.product?.name || preorder.title;
  const displayDescription = preorder.product?.description || preorder.description || '';
  const displayUnit = preorder.product?.unit || preorder.unit || 'cái';
  const price = parseFloat(preorder.price);

  const productImages = preorder.product?.images && preorder.product.images.length > 0 
    ? preorder.product.images 
    : preorder.product?.image 
      ? [preorder.product.image] 
      : preorder.bannerImage 
        ? [preorder.bannerImage]
        : ['/images/placeholder.jpg'];

  const siteUrl = getSiteUrl();
  const absoluteImages = productImages
    .filter(Boolean)
    .map((img: string) => img.startsWith('http') ? img : `${siteUrl}${img}`);
  
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": displayName,
    "description": displayDescription,
    "url": `${siteUrl}/orders/${preorder.slug}`,
    "image": absoluteImages,
    "offers": {
      "@type": "Offer",
      "price": price,
      "priceCurrency": "VND",
      "availability": preorder.isActive ? "https://schema.org/PreOrder" : "https://schema.org/OutOfStock",
      "priceValidUntil": preorder.estimatedDate,
      "availabilityStarts": preorder.estimatedDate,
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white lg:bg-gray-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <ProductHeader productName={displayName} />

      <main className="pb-32 lg:pb-0">
        <div className="max-w-7xl mx-auto px-0 lg:px-12 lg:py-6">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8">
            <div className="lg:sticky lg:top-24 lg:self-start">
              <div className="relative">
                <ProductImageCarousel images={productImages} productName={displayName} />
                
                <div className="absolute top-4 right-4 z-10">
                  <div className="bg-gradient-to-br from-amber-600 to-yellow-700 text-white px-4 py-2 rounded-full shadow-2xl animate-pulse">
                    <p className="text-sm font-bold leading-none">PRE-ORDER</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="bg-gradient-to-br from-amber-700 via-yellow-600 to-amber-800 px-4 py-6 lg:rounded-t-lg shadow-xl lg:mb-4">
                <div className="flex items-center justify-center gap-3 text-white mb-3">
                  <Calendar className="h-6 w-6" />
                  <h2 className="text-lg font-bold">DỰ KIẾN HÀNG VỀ</h2>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">
                    {formatVietnameseDate(preorder.estimatedDate)}
                  </div>
                  <p className="text-amber-100 text-sm">
                    ⭐ Đặt hàng trước để đảm bảo nhận hàng sớm nhất
                  </p>
                </div>
              </div>

              <div className="px-4 py-6 border-b-8 lg:border-b-0 border-gray-100 lg:bg-white lg:rounded-lg lg:mb-4 lg:shadow-md">
                <div className="mb-4">
                  <span className="inline-block bg-gradient-to-r from-amber-600 to-yellow-700 text-white text-sm px-4 py-1.5 rounded-full font-bold mb-3 shadow-md">
                    🔔 PRE-ORDER
                  </span>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{displayName}</h1>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {displayDescription}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-yellow-50 backdrop-blur-sm p-6 rounded-2xl mb-4 border-2 border-amber-200 shadow-lg">
                  <div className="flex items-baseline gap-4 mb-3">
                    <span className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-700 to-yellow-700">
                      {formatVietnamPrice(price)}
                    </span>
                    <span className="text-gray-600 text-lg">/ {displayUnit}</span>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="bg-gradient-to-r from-amber-600 to-yellow-700 text-white text-sm px-4 py-1.5 rounded-full font-bold shadow-md">
                      Giá ưu đãi Pre-order
                    </span>
                  </div>
                </div>

                {preorder.product?.benefits && preorder.product.benefits.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <span className="text-xl">✨</span>
                      <span>Điểm nổi bật</span>
                    </h3>
                    <ul className="space-y-2">
                      {preorder.product.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-start gap-3 text-gray-700">
                          <span className="text-amber-600 mt-1 flex-shrink-0">✓</span>
                          <span className="text-sm leading-relaxed">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                  <h3 className="font-semibold text-gray-900 mb-2 text-sm">📅 Thông tin Pre-order</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Dự kiến hàng về:</span>
                      <span className="font-medium text-amber-700">
                        {formatVietnameseDate(preorder.estimatedDate)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Đơn vị:</span>
                      <span className="font-medium">{displayUnit}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-4 py-6 border-b-8 lg:border-b-0 border-gray-100 lg:bg-white lg:rounded-lg lg:mb-4 lg:shadow-md">
                <h2 className="font-semibold text-gray-900 mb-3 text-lg">📋 Chi tiết sản phẩm</h2>
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                    {displayDescription}
                  </p>
                </div>
              </div>

              <div className="px-4 py-6 border-b-8 lg:border-b-0 border-gray-100 lg:bg-white lg:rounded-lg lg:mb-4 lg:shadow-md">
                <h2 className="font-semibold text-gray-900 mb-4 text-lg">📦 Pre-order như thế nào?</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-600 to-yellow-700 text-white flex items-center justify-center font-bold flex-shrink-0">
                      1
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 mb-1">Đặt hàng ngay</div>
                      <div className="text-gray-600 text-sm">Chọn số lượng và thêm vào giỏ hàng để đặt trước</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-600 to-yellow-700 text-white flex items-center justify-center font-bold flex-shrink-0">
                      2
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 mb-1">Chờ hàng về</div>
                      <div className="text-gray-600 text-sm">Sản phẩm dự kiến về ngày {formatVietnameseDate(preorder.estimatedDate)}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-600 to-yellow-700 text-white flex items-center justify-center font-bold flex-shrink-0">
                      3
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 mb-1">Nhận hàng ưu tiên</div>
                      <div className="text-gray-600 text-sm">Khách đặt trước sẽ được ưu tiên giao hàng đầu tiên</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-4 py-6 lg:bg-white lg:rounded-lg lg:shadow-md">
                <h2 className="font-semibold text-gray-900 mb-4 text-lg">🛡️ Chính sách mua hàng</h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <span className="text-2xl flex-shrink-0">✅</span>
                    <div>
                      <div className="font-medium text-green-900">Đảm bảo chất lượng</div>
                      <div className="text-green-700 text-sm">100% sản phẩm cao cấp, nguồn gốc rõ ràng</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <span className="text-2xl flex-shrink-0">🚚</span>
                    <div>
                      <div className="font-medium text-blue-900">Giao hàng ưu tiên</div>
                      <div className="text-blue-700 text-sm">Khách đặt trước được ưu tiên giao sớm nhất</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <span className="text-2xl flex-shrink-0">💰</span>
                    <div>
                      <div className="font-medium text-amber-900">Thanh toán linh hoạt</div>
                      <div className="text-amber-700 text-sm">Hỗ trợ nhiều hình thức thanh toán tiện lợi</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <PreorderActions 
        preorder={{
          id: preorder.id,
          productId: preorder.product?.id || preorder.id,
          slug: preorder.slug,
          name: displayName,
          price: price,
          image: preorder.bannerImage || preorder.product?.image || '/images/placeholder.jpg',
          unit: displayUnit,
          stock: preorder.product?.stock || 999,
          isActive: preorder.isActive,
        }}
      />
    </div>
  );
}
