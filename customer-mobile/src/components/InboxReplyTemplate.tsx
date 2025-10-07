'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MessageSquare, Copy, Check } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Product {
  id: string;
  name: string;
  description?: string;
  shortDescription?: string;
  price: string;
  image?: string;
  slug?: string;
  commissionPercentage?: number;
  commission?: number;
}

interface InboxReplyTemplateProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  affiliateId: string;
}

const formatVND = (amount: string | number) => {
  const num = typeof amount === 'string' ? parseInt(amount) : amount;
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(num);
};

export function InboxReplyTemplate({ 
  product, 
  isOpen, 
  onClose,
  affiliateId
}: InboxReplyTemplateProps) {
  const [copiedTemplate, setCopiedTemplate] = useState<string | null>(null);

  const productLink = `https://nhangsach.net/product/${product.slug || product.id}?ref=${affiliateId}`;

  const templates = {
    priceInquiry: `Chào bạn! 😊

${product.name}
💰 Giá: ${formatVND(product.price)}

${product.shortDescription || product.description || ''}

🔗 Xem chi tiết và đặt hàng tại đây:
${productLink}`,

    productDetails: `📦 ${product.name}

✨ Mô tả: ${product.shortDescription || product.description || 'Sản phẩm chất lượng cao'}

💵 Giá: ${formatVND(product.price)}

🛒 Đặt hàng ngay:
${productLink}

Có gì thắc mắc inbox mình nhé! 💬`,

    recommendation: `Mình recommend bạn sản phẩm này nha! 🌟

${product.name}

${product.shortDescription || product.description || ''}

💰 Giá chỉ: ${formatVND(product.price)}
${product.commissionPercentage ? `🎁 Hoa hồng CTV: ${formatVND(product.commission || 0)}` : ''}

👉 Link đặt hàng:
${productLink}`,

    followUp: `Bạn quan tâm ${product.name} đúng không? 😊

Sản phẩm này đang có giá tốt: ${formatVND(product.price)}

Bạn cần tư vấn thêm gì không ạ?

Link sản phẩm: ${productLink}`,

    linkOnly: `${productLink}`
  };

  const handleCopy = async (templateKey: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedTemplate(templateKey);
      setTimeout(() => setCopiedTemplate(null), 2000);
    } catch (error) {
      console.error('Copy failed:', error);
      alert('Không thể copy. Vui lòng thử lại!');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            Template trả lời inbox
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Product Preview */}
          <div className="flex gap-3 p-3 bg-gray-50 rounded-lg">
            {product.image && (
              <img 
                src={product.image} 
                alt={product.name}
                className="w-16 h-16 object-cover rounded"
              />
            )}
            <div className="flex-1">
              <h3 className="font-semibold text-sm">{product.name}</h3>
              <p className="text-blue-600 font-bold">{formatVND(product.price)}</p>
            </div>
          </div>

          {/* Templates */}
          <Tabs defaultValue="priceInquiry" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="priceInquiry">Hỏi giá</TabsTrigger>
              <TabsTrigger value="productDetails">Chi tiết</TabsTrigger>
              <TabsTrigger value="recommendation">Giới thiệu</TabsTrigger>
            </TabsList>
            
            <TabsContent value="priceInquiry" className="space-y-3">
              <div className="bg-white border rounded-lg p-4">
                <pre className="whitespace-pre-wrap text-sm font-sans text-gray-700">
                  {templates.priceInquiry}
                </pre>
              </div>
              <Button
                onClick={() => handleCopy('priceInquiry', templates.priceInquiry)}
                className="w-full"
                variant={copiedTemplate === 'priceInquiry' ? 'default' : 'outline'}
              >
                {copiedTemplate === 'priceInquiry' ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Đã copy!
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy template này
                  </>
                )}
              </Button>
            </TabsContent>

            <TabsContent value="productDetails" className="space-y-3">
              <div className="bg-white border rounded-lg p-4">
                <pre className="whitespace-pre-wrap text-sm font-sans text-gray-700">
                  {templates.productDetails}
                </pre>
              </div>
              <Button
                onClick={() => handleCopy('productDetails', templates.productDetails)}
                className="w-full"
                variant={copiedTemplate === 'productDetails' ? 'default' : 'outline'}
              >
                {copiedTemplate === 'productDetails' ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Đã copy!
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy template này
                  </>
                )}
              </Button>
            </TabsContent>

            <TabsContent value="recommendation" className="space-y-3">
              <div className="bg-white border rounded-lg p-4">
                <pre className="whitespace-pre-wrap text-sm font-sans text-gray-700">
                  {templates.recommendation}
                </pre>
              </div>
              <Button
                onClick={() => handleCopy('recommendation', templates.recommendation)}
                className="w-full"
                variant={copiedTemplate === 'recommendation' ? 'default' : 'outline'}
              >
                {copiedTemplate === 'recommendation' ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Đã copy!
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy template này
                  </>
                )}
              </Button>
            </TabsContent>
          </Tabs>

          {/* Additional Templates */}
          <div className="space-y-2 border-t pt-4">
            <h4 className="text-sm font-semibold text-gray-700">Template khác:</h4>
            
            <div className="space-y-2">
              <div className="flex gap-2">
                <div className="flex-1 bg-gray-50 p-3 rounded text-sm">
                  <p className="font-medium mb-1">📨 Theo dõi</p>
                  <pre className="whitespace-pre-wrap text-xs text-gray-600">
                    {templates.followUp}
                  </pre>
                </div>
                <Button
                  onClick={() => handleCopy('followUp', templates.followUp)}
                  size="sm"
                  variant="outline"
                >
                  {copiedTemplate === 'followUp' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>

              <div className="flex gap-2">
                <div className="flex-1 bg-gray-50 p-3 rounded text-sm">
                  <p className="font-medium mb-1">🔗 Chỉ link</p>
                  <p className="text-xs text-gray-600 break-all">{templates.linkOnly}</p>
                </div>
                <Button
                  onClick={() => handleCopy('linkOnly', templates.linkOnly)}
                  size="sm"
                  variant="outline"
                >
                  {copiedTemplate === 'linkOnly' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-500 text-center">
            💡 Chọn template phù hợp và copy để trả lời inbox nhanh chóng!
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
