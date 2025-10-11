'use client';

import { useState } from 'react';
import { ArrowLeft, Share2, MessageCircle, Info } from 'lucide-react';
import Link from 'next/link';
import type { Product, ProductFaq } from '../../../../../shared/schema';
import { ShareProductModal } from '@/components/ShareProductModal';

interface ProductDetailClientProps {
  initialData: {
    product: Product;
    faqs: ProductFaq[];
    tierInfo: {
      currentTier: string;
      commissionRate: number;
      totalOrders: number;
      nextTierOrders?: number;
    };
  };
  affiliateCode: string;
}

export default function ProductDetailClient({ initialData, affiliateCode }: ProductDetailClientProps) {
  const { product, faqs, tierInfo } = initialData;
  const [showShareModal, setShowShareModal] = useState(false);

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Diamond':
        return 'text-blue-600 bg-blue-50';
      case 'Gold':
        return 'text-yellow-600 bg-yellow-50';
      case 'Silver':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-orange-600 bg-orange-50';
    }
  };

  const formatPrice = (price: number | string) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(numPrice);
  };

  const calculateCommission = (price: number | string) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return Math.round((numPrice * tierInfo.commissionRate) / 100);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4 pb-24">
        <Link
          href="/affiliate/products"
          className="inline-flex items-center gap-2 text-green-700 hover:text-green-800 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Quay lại danh sách</span>
        </Link>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="relative aspect-square w-full bg-gray-100">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                Không có hình ảnh
              </div>
            )}
          </div>

          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {product.name}
                </h1>
                <p className="text-sm text-gray-500">SKU: {product.sku || 'N/A'}</p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  product.status === 'active'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {product.status === 'active' ? 'Còn hàng' : 'Hết hàng'}
              </span>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <div className="text-3xl font-bold text-green-700">
                  {formatPrice(product.price)}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Còn lại: {product.stock} sản phẩm
                </div>
              </div>

              <div className={`p-4 rounded-lg ${getTierColor(tierInfo.currentTier)}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">Hoa hồng của bạn</div>
                    <div className="text-2xl font-bold mt-1">
                      {formatPrice(calculateCommission(product.price))}
                    </div>
                    <div className="text-xs mt-1">
                      {tierInfo.currentTier} • {tierInfo.commissionRate}%
                    </div>
                  </div>
                  <Info className="w-6 h-6 opacity-50" />
                </div>
              </div>
            </div>

            {product.shortDescription && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  Mô tả ngắn
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  {product.shortDescription}
                </p>
              </div>
            )}

            {product.description && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  Mô tả chi tiết
                </h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            )}

            <div className="border-t pt-6">
              <div className="flex items-center gap-2 mb-4">
                <MessageCircle className="w-5 h-5 text-gray-700" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Câu hỏi thường gặp
                </h2>
              </div>

              {faqs.length > 0 ? (
                <div className="space-y-4">
                  {faqs.map((faq) => (
                    <div key={faq.id} className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-2 flex items-start">
                        <span className="text-green-700 mr-2">Q:</span>
                        {faq.question}
                      </h3>
                      <p className="text-gray-700 pl-6 leading-relaxed">
                        <span className="text-green-700 font-semibold mr-2">A:</span>
                        {faq.answer}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Chưa có câu hỏi nào cho sản phẩm này</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-10">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => setShowShareModal(true)}
            className="w-full flex items-center justify-center gap-2 bg-green-700 text-white font-semibold py-4 rounded-lg hover:bg-green-800 transition-colors shadow-md"
          >
            <Share2 className="w-5 h-5" />
            Tạo bài đăng
          </button>
        </div>
      </div>

      <ShareProductModal
        product={showShareModal ? {
          id: product.id,
          name: product.name,
          price: typeof product.price === 'string' ? product.price : product.price.toString(),
          image: product.image || '',
          description: product.description || product.shortDescription || '',
          slug: product.slug || product.id,
        } : null}
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        affiliateId={affiliateCode}
      />
    </div>
  );
}
