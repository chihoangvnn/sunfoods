'use client'

import { useState } from 'react';
import { Search, Plus, Package, Share2, Eye, ShoppingCart, Unlock, Facebook, MessageSquare } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import type { AffiliateProduct, TierInfo, ProductRequest } from '@/services/affiliateService';
import { affiliateService } from '@/services/affiliateService';
import { ShareProductModal } from '@/components/ShareProductModal';
import { ShareCustomizationModal } from '@/components/ShareCustomizationModal';
import { QuickOrderModal } from '@/components/QuickOrderModal';
import { InboxReplyTemplate } from '@/components/InboxReplyTemplate';

function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}

function ProductCard({ 
  product, 
  onShare, 
  onQuickOrder,
  onUnlockRequest,
  onFacebookShare,
  onInboxReply
}: { 
  product: AffiliateProduct; 
  onShare: () => void;
  onQuickOrder: () => void;
  onUnlockRequest: () => void;
  onFacebookShare: () => void;
  onInboxReply: () => void;
}) {
  const stockClass = product.stockStatus === 'in_stock' 
    ? 'bg-green-100 text-green-800' 
    : 'bg-red-100 text-red-800';

  const isLocked = (product as any).isLocked || false;

  return (
    <Card className="hover:shadow-lg transition-shadow border-none">
      <CardContent className="p-4">
        <Link href={`/affiliate/products/${product.id}`} className="block">
          <div className="relative aspect-square mb-3 bg-gray-100 rounded-lg overflow-hidden">
            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <Package className="h-16 w-16 text-gray-300" />
              </div>
            )}
            <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-semibold ${stockClass}`}>
              {product.stockBadge}
            </div>
            {isLocked && (
              <div className="absolute top-2 left-2 px-2 py-1 rounded text-xs font-semibold bg-yellow-100 text-yellow-800">
                🔒 Khóa
              </div>
            )}
            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-opacity flex items-center justify-center opacity-0 hover:opacity-100">
              <div className="bg-white rounded-full p-2">
                <Eye className="h-6 w-6 text-green-700" />
              </div>
            </div>
          </div>

          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 h-12">
            {product.name}
          </h3>
          
          <div className="text-xs text-gray-500 mb-3">{product.categoryName}</div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Giá bán:</span>
              <span className="font-bold text-gray-900">{formatVND(product.price)}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Hoa hồng ({product.commissionPercentage}%):</span>
              <span className="font-bold text-green-600">{formatVND(product.commission)}</span>
            </div>

            <div className="pt-2 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Tồn kho:</span>
                <span className="text-sm font-semibold text-gray-700">{product.stock}</span>
              </div>
            </div>
          </div>
        </Link>

        <div className="mt-3 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onQuickOrder();
              }}
              className="bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-1"
              size="sm"
              disabled={isLocked}
            >
              <ShoppingCart className="h-4 w-4" />
              Lên đơn
            </Button>
            <Button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onFacebookShare();
              }}
              className="bg-blue-500 hover:bg-blue-600 flex items-center justify-center gap-1"
              size="sm"
            >
              <Facebook className="h-4 w-4" />
              Đăng FB
            </Button>
          </div>
          
          <Button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onInboxReply();
            }}
            variant="outline"
            className="w-full border-green-300 text-green-700 hover:bg-green-50 flex items-center justify-center gap-1"
            size="sm"
          >
            <MessageSquare className="h-4 w-4" />
            Trả lời inbox
          </Button>
          
          {isLocked && (
            <Button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onUnlockRequest();
              }}
              variant="outline"
              className="w-full border-yellow-300 text-yellow-700 hover:bg-yellow-50 flex items-center justify-center gap-1"
              size="sm"
            >
              <Unlock className="h-4 w-4" />
              Request mở khóa
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ProductRequestModal({ 
  isOpen, 
  onClose, 
  onSubmit 
}: { 
  isOpen: boolean; 
  onClose: () => void;
  onSubmit: (data: ProductRequest) => Promise<void>;
}) {
  const [formData, setFormData] = useState<ProductRequest>({
    productName: '',
    productDescription: '',
    productLink: '',
    suggestedPrice: '',
    requestReason: ''
  });
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(formData);
      setFormData({
        productName: '',
        productDescription: '',
        productLink: '',
        suggestedPrice: '',
        requestReason: ''
      });
      onClose();
    } catch (error) {
      console.error('Error submitting request:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Yêu cầu sản phẩm mới</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên sản phẩm *
              </label>
              <input
                type="text"
                required
                value={formData.productName}
                onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="VD: Nhang Cam Thảo Organic"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mô tả sản phẩm
              </label>
              <textarea
                value={formData.productDescription}
                onChange={(e) => setFormData({ ...formData, productDescription: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Mô tả chi tiết về sản phẩm..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Link tham khảo
              </label>
              <input
                type="url"
                value={formData.productLink}
                onChange={(e) => setFormData({ ...formData, productLink: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="https://shopee.vn/..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Giá đề xuất
              </label>
              <input
                type="text"
                value={formData.suggestedPrice}
                onChange={(e) => setFormData({ ...formData, suggestedPrice: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="350,000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lý do yêu cầu *
              </label>
              <textarea
                required
                value={formData.requestReason}
                onChange={(e) => setFormData({ ...formData, requestReason: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="VD: Có 10 khách hàng hỏi tuần này..."
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={submitting}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-green-600 hover:bg-green-700"
                disabled={submitting}
              >
                {submitting ? 'Đang gửi...' : 'Gửi yêu cầu'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

interface ProductsClientProps {
  initialData: {
    products: AffiliateProduct[];
    tierInfo: TierInfo;
    pagination: { total: number; limit: number };
  };
  affiliateId?: string;
}

export default function ProductsClient({ initialData, affiliateId = 'AFF001' }: ProductsClientProps) {
  const [products, setProducts] = useState<AffiliateProduct[]>(initialData.products);
  const [tierInfo, setTierInfo] = useState<TierInfo>(initialData.tierInfo);
  const [searchQuery, setSearchQuery] = useState('');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showQuickOrderModal, setShowQuickOrderModal] = useState(false);
  const [showCustomizationModal, setShowCustomizationModal] = useState(false);
  const [showInboxReplyModal, setShowInboxReplyModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function loadProducts(search?: string) {
    try {
      setLoading(true);
      const data = await affiliateService.getProducts({
        search: search || searchQuery,
        limit: 100
      });
      setProducts(data.products);
      setTierInfo(data.tierInfo);
    } catch (err) {
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleProductRequest(requestData: ProductRequest) {
    try {
      await affiliateService.requestProduct(requestData);
      alert('Đã gửi yêu cầu thành công! Admin sẽ xem xét và phản hồi sớm.');
    } catch (error) {
      alert('Lỗi gửi yêu cầu. Vui lòng thử lại.');
      throw error;
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadProducts(searchQuery);
  };

  const handleShareProduct = (product: AffiliateProduct) => {
    setSelectedProduct({
      id: product.id,
      name: product.name,
      description: product.name,
      shortDescription: product.name,
      price: product.price.toString(),
      image: product.imageUrl,
      slug: product.slug || product.id
    });
    setShowShareModal(true);
  };

  const handleQuickOrder = (product: AffiliateProduct) => {
    setSelectedProduct({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.imageUrl,
      stock: product.stock
    });
    setShowQuickOrderModal(true);
  };

  const handleUnlockRequest = async (product: AffiliateProduct) => {
    if (!confirm(`Bạn có chắc muốn gửi yêu cầu mở khóa sản phẩm "${product.name}"?`)) {
      return;
    }

    try {
      const response = await fetch('/api/affiliate-portal/unlock-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          reason: ''
        })
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || 'Lỗi khi gửi yêu cầu');
        return;
      }

      alert(data.message || 'Đã gửi yêu cầu mở khóa thành công!');
    } catch (error) {
      console.error('Unlock request error:', error);
      alert('Lỗi khi gửi yêu cầu. Vui lòng thử lại.');
    }
  };

  const handleFacebookShare = (product: AffiliateProduct) => {
    // Open customization modal instead of directly sharing
    setSelectedProduct(product);
    setShowCustomizationModal(true);
  };

  const handleInboxReply = (product: AffiliateProduct) => {
    setSelectedProduct(product);
    setShowInboxReplyModal(true);
  };

  const handleCustomShare = async (imageIndex: number, caption: string, platform: string) => {
    if (!selectedProduct) return;
    
    try {
      // Log the share to backend (rate limiting check)
      // Note: affiliateId is retrieved from session on backend for security
      const response = await fetch('/api/affiliate-portal/share-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProduct.id,
          productSlug: selectedProduct.slug, // Include slug for proper redirect
          productName: selectedProduct.name,
          imageIndex,
          caption,
          platform
        })
      });

      const data = await response.json();

      if (!response.ok) {
        // Rate limit exceeded
        alert(data.error || 'Không thể chia sẻ lúc này');
        return;
      }

      // Share successful - use short code for tracking if available
      const shareUrl = data.shortCode 
        ? `${window.location.origin}/api/r/${data.shortCode}`
        : `https://nhangsach.net/product/${selectedProduct.slug || selectedProduct.id}?ref=${affiliateId}&img=${imageIndex}`;
      
      if (platform === 'facebook') {
        const fbShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(caption)}`;
        window.open(fbShareUrl, 'facebook-share-dialog', 'width=626,height=436');
      } else if (platform === 'zalo') {
        await navigator.clipboard.writeText(`${caption}\n\n${shareUrl}`);
        alert(`✅ Đã copy nội dung!\n\n📱 Mở app Zalo và dán (paste) vào bài đăng của bạn.\n\n🔗 Link: ${shareUrl}`);
        return; // Return early to skip remaining message
      } else if (platform === 'tiktok') {
        await navigator.clipboard.writeText(`${caption}\n\n${shareUrl}`);
        alert(`✅ Đã copy nội dung!\n\n📱 Mở app TikTok và dán (paste) vào caption video của bạn.\n\n🔗 Link: ${shareUrl}`);
        return; // Return early to skip remaining message
      }

      // Show success message (only for Facebook since Zalo/TikTok return early)
      const remainingMsg = data.sharesRemaining > 0 
        ? `Bạn còn ${data.sharesRemaining} lượt chia sẻ hôm nay.`
        : 'Đây là lượt chia sẻ cuối cùng hôm nay!';
      
      alert(`✅ ${data.message}\n${remainingMsg}`);
      
    } catch (error) {
      console.error('Error sharing product:', error);
      alert('Có lỗi xảy ra khi chia sẻ. Vui lòng thử lại.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Danh mục sản phẩm</h1>
          <p className="text-gray-600 mt-1">Tất cả sản phẩm có sẵn để bán</p>
        </div>
        
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 text-green-600">
                <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600">Cấp độ hiện tại</p>
                <p className="text-lg font-bold text-green-600">
                  {tierInfo.currentTier} - {tierInfo.commissionRate}%
                </p>
                {tierInfo.nextTierOrders && (
                  <p className="text-xs text-gray-500">
                    Còn {tierInfo.nextTierOrders} đơn nữa để lên cấp
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm sản phẩm..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <Button type="submit" className="bg-green-600 hover:bg-green-700">
            Tìm kiếm
          </Button>
        </form>
        
        <Button
          onClick={() => setShowRequestModal(true)}
          className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Yêu cầu sản phẩm
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-96 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Không tìm thấy sản phẩm
            </h3>
            <p className="text-gray-600">
              Thử tìm kiếm với từ khóa khác hoặc yêu cầu sản phẩm mới
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onShare={() => handleShareProduct(product)}
              onQuickOrder={() => handleQuickOrder(product)}
              onUnlockRequest={() => handleUnlockRequest(product)}
              onFacebookShare={() => handleFacebookShare(product)}
              onInboxReply={() => handleInboxReply(product)}
            />
          ))}
        </div>
      )}

      <ProductRequestModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        onSubmit={handleProductRequest}
      />

      <ShareProductModal
        product={selectedProduct}
        isOpen={showShareModal}
        onClose={() => {
          setShowShareModal(false);
          setSelectedProduct(null);
        }}
        affiliateId={affiliateId}
      />

      <QuickOrderModal
        product={selectedProduct}
        isOpen={showQuickOrderModal}
        onClose={() => {
          setShowQuickOrderModal(false);
          setSelectedProduct(null);
        }}
        onSuccess={() => {
          loadProducts();
        }}
        commissionRate={tierInfo.commissionRate}
      />

      <ShareCustomizationModal
        product={selectedProduct}
        isOpen={showCustomizationModal}
        onClose={() => {
          setShowCustomizationModal(false);
          setSelectedProduct(null);
        }}
        affiliateId={affiliateId}
        affiliateTier={tierInfo.currentTier.toLowerCase() as 'bronze' | 'silver' | 'gold' | null}
        onShare={handleCustomShare}
      />

      {selectedProduct && (
        <InboxReplyTemplate
          product={selectedProduct}
          isOpen={showInboxReplyModal}
          onClose={() => {
            setShowInboxReplyModal(false);
            setSelectedProduct(null);
          }}
          affiliateId={affiliateId}
        />
      )}
    </div>
  );
}
