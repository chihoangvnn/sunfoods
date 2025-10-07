import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { TrendingUp } from 'lucide-react';
import { formatVietnamPrice } from '@/utils/currency';
import ProductImageCarousel from '@/components/ProductImageCarousel';
import ProductHeader from '@/components/ProductHeader';
import QuickOrderForm from '@/components/QuickOrderForm';
import CountdownTimer from '@/components/CountdownTimer';

interface DealData {
  id: string;
  slug: string;
  type: string;
  title: string;
  description: string;
  originalPrice: number;
  dealPrice: number;
  discountPercent: number;
  startTime: string;
  endTime: string;
  targetQuantity: number;
  currentQuantity: number;
  deadline: string;
  status: string;
  product: {
    id: string;
    name: string;
    description: string;
    image: string;
    images: any[];
    slug: string;
    shortDescription: string;
    stock: number;
  };
}

function getSiteUrl(): string {
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  if (process.env.REPLIT_DEV_DOMAIN) return `https://${process.env.REPLIT_DEV_DOMAIN}`;
  return 'http://localhost:5000';
}

async function getDeal(slug: string): Promise<DealData | null> {
  try {
    const response = await fetch(`${getSiteUrl()}/api/deals/${slug}`, {
      next: { revalidate: 10 }
    });
    
    if (!response.ok) return null;
    return response.json();
  } catch (error) {
    console.error('Error fetching deal:', error);
    return null;
  }
}

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const deal = await getDeal(slug);

  if (!deal) {
    return {
      title: 'Deal không tìm thấy',
      description: 'Deal bạn đang tìm không tồn tại hoặc đã hết hạn.',
    };
  }

  const dealTypeText = deal.type === 'flash_sale' ? 'Flash Sale' : 'Gom Đơn';
  const truncatedDescription = deal.description?.length > 160 
    ? deal.description.substring(0, 157) + '...'
    : deal.description || deal.product.description?.substring(0, 160);

  const siteUrl = getSiteUrl();
  const productImages = deal.product.images && deal.product.images.length > 0 
    ? deal.product.images 
    : [deal.product.image];
  const selectedImage = productImages[0] || deal.product.image;
  const absoluteImageUrl = selectedImage?.startsWith('http') 
    ? selectedImage 
    : `${siteUrl}${selectedImage}`;
  
  return {
    title: `${deal.title} - ${dealTypeText} ${deal.discountPercent}% OFF`,
    description: truncatedDescription,
    openGraph: {
      title: `${deal.title} - ${dealTypeText} ${deal.discountPercent}% OFF`,
      description: truncatedDescription,
      type: 'website',
      url: `${siteUrl}/deals/${deal.slug}`,
      images: [
        {
          url: absoluteImageUrl,
          width: 800,
          height: 600,
          alt: deal.title,
        }
      ],
      siteName: 'Shop Online',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${deal.title} - ${dealTypeText} ${deal.discountPercent}% OFF`,
      description: truncatedDescription,
      images: [absoluteImageUrl],
    },
    alternates: {
      canonical: `/deals/${deal.slug}`,
    },
  };
}

function ProgressBar({ current, target }: { current: number; target: number }) {
  const percentage = Math.min((current / target) * 100, 100);

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-600">Tiến độ gom đơn</span>
        <span className="font-medium">
          {current}/{target}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className="bg-green-600 h-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="text-xs text-gray-500 text-center">
        {percentage.toFixed(1)}% hoàn thành
      </div>
    </div>
  );
}

export default async function DealLandingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const deal = await getDeal(slug);

  if (!deal) {
    notFound();
  }

  const productImages = deal.product.images && deal.product.images.length > 0 
    ? deal.product.images 
    : [deal.product.image];

  const dealBadgeText = deal.type === 'flash_sale'
    ? `FLASH SALE ${deal.discountPercent}% OFF`
    : `GOM ĐƠN ${deal.currentQuantity}/${deal.targetQuantity}`;

  const siteUrl = getSiteUrl();
  const absoluteImages = productImages
    .filter(Boolean)
    .map((img: string) => img.startsWith('http') ? img : `${siteUrl}${img}`);
  
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Offer",
    "name": deal.title,
    "description": deal.description,
    "url": `${siteUrl}/deals/${deal.slug}`,
    "image": absoluteImages,
    "price": deal.dealPrice,
    "priceCurrency": "VND",
    "availability": deal.status === 'active' ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    "priceValidUntil": deal.type === 'flash_sale' ? deal.endTime : deal.deadline,
    "itemOffered": {
      "@type": "Product",
      "name": deal.product.name,
      "description": deal.product.description,
      "image": absoluteImages,
    }
  };

  return (
    <div className="min-h-screen bg-white lg:bg-gray-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <ProductHeader productName={deal.title} />

      {/* Main Scrollable Content */}
      <main className="pb-24 lg:pb-0">
        <div className="max-w-7xl mx-auto px-0 lg:px-12 lg:py-6">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8">
            <div className="lg:sticky lg:top-24 lg:self-start">
              <ProductImageCarousel images={productImages} productName={deal.product.name} />
            </div>

            <div>
              {deal.type === 'flash_sale' && (
                <div className="bg-gradient-to-r from-red-600 to-orange-600 px-4 py-3 lg:rounded-t-lg text-white lg:mb-4">
                  <CountdownTimer targetDate={deal.endTime} />
                </div>
              )}

              <div className="px-4 py-4 border-b-8 lg:border-b-0 border-gray-100 lg:bg-white lg:rounded-lg lg:mb-4">
                <div className="mb-3">
                  <span className="inline-block bg-red-600 text-white text-sm px-3 py-1 rounded font-bold mb-2">
                    {dealBadgeText}
                  </span>
                  <h1 className="text-xl font-bold">{deal.title}</h1>
                </div>

                <div className="bg-gradient-to-r from-red-50 to-orange-50 p-4 rounded-lg mb-4 border border-red-200">
                  <div className="flex items-baseline gap-3 mb-2">
                    <span className="text-3xl font-bold text-red-600">
                      {formatVietnamPrice(deal.dealPrice)}
                    </span>
                    <span className="text-gray-400 line-through text-lg">
                      {formatVietnamPrice(deal.originalPrice)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-red-600 text-white text-sm px-3 py-1 rounded font-bold">
                      Giảm {deal.discountPercent}%
                    </span>
                    <span className="text-sm text-gray-600">
                      Tiết kiệm {formatVietnamPrice(deal.originalPrice - deal.dealPrice)}
                    </span>
                  </div>
                </div>

                {deal.type === 'group_buy' && (
                  <div className="mb-4">
                    <ProgressBar current={deal.currentQuantity} target={deal.targetQuantity} />
                    <div className="mt-2 text-sm text-gray-600 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span>Còn {deal.targetQuantity - deal.currentQuantity} đơn nữa để đạt mục tiêu!</span>
                    </div>
                  </div>
                )}

                <div className="prose prose-sm max-w-none">
                  <h2 className="text-base font-medium mb-2">Mô tả deal</h2>
                  <p className="text-gray-600 leading-relaxed">
                    {deal.description || deal.product.description}
                  </p>
                </div>
              </div>

              <div className="px-4 py-4 border-b-8 lg:border-b-0 border-gray-100 lg:bg-white lg:rounded-lg lg:mb-4">
                <h2 className="font-medium mb-3">Chi tiết sản phẩm</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tên sản phẩm:</span>
                    <span className="font-medium">{deal.product.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tồn kho:</span>
                    <span className="font-medium">{deal.product.stock} sản phẩm</span>
                  </div>
                  {deal.type === 'flash_sale' && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Bắt đầu:</span>
                        <span className="font-medium">
                          {new Date(deal.startTime).toLocaleString('vi-VN')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Kết thúc:</span>
                        <span className="font-medium">
                          {new Date(deal.endTime).toLocaleString('vi-VN')}
                        </span>
                      </div>
                    </>
                  )}
                  {deal.type === 'group_buy' && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Hạn chót:</span>
                      <span className="font-medium">
                        {new Date(deal.deadline).toLocaleString('vi-VN')}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="px-4 py-4 lg:bg-white lg:rounded-lg lg:mb-4">
                <h2 className="font-medium mb-3">Chính sách giao hàng</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 text-2xl">💵</span>
                    <div>
                      <div className="font-medium text-gray-900">Thanh toán khi nhận hàng</div>
                      <div className="text-gray-600 text-xs">Kiểm tra hàng trước khi thanh toán</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 text-2xl">🚚</span>
                    <div>
                      <div className="font-medium text-gray-900">Giao hàng toàn quốc</div>
                      <div className="text-gray-600 text-xs">Miễn phí vận chuyển cho đơn từ 500.000đ</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 text-2xl">📞</span>
                    <div>
                      <div className="font-medium text-gray-900">Hỗ trợ 24/7</div>
                      <div className="text-gray-600 text-xs">Hotline: 1900-xxxx (8h-22h)</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Fixed Bottom Sheet - Mobile Only */}
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
        <QuickOrderForm 
          dealSlug={deal.slug} 
          dealPrice={deal.dealPrice}
          productName={deal.product.name}
          productImage={deal.product.image}
          dealType={deal.type}
          dealEndTime={deal.endTime}
        />
      </div>

      {/* Desktop Order Form */}
      <div className="hidden lg:block lg:fixed lg:bottom-8 lg:right-8 lg:w-96 lg:z-50">
        <div className="bg-white rounded-2xl shadow-2xl">
          <QuickOrderForm 
            dealSlug={deal.slug} 
            dealPrice={deal.dealPrice}
            productName={deal.product.name}
            productImage={deal.product.image}
            dealType={deal.type}
            dealEndTime={deal.endTime}
          />
        </div>
      </div>
    </div>
  );
}
