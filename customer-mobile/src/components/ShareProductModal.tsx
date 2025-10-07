'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Copy, Download, Loader2, RefreshCw, Share2, Check } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description?: string;
  shortDescription?: string;
  price: string;
  image?: string;
  slug?: string;
}

interface ShareProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  affiliateId: string;
}

export function ShareProductModal({ product, isOpen, onClose, affiliateId }: ShareProductModalProps) {
  const [caption, setCaption] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!product) return null;

  const affiliateLink = `https://nhangsach.net/lp/${product.slug || product.id}?ref=${affiliateId}`;

  const generateCaption = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/affiliate-portal/generate-post-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: product.name,
          description: product.description,
          shortDescription: product.shortDescription,
          price: product.price
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate content');
      }

      const data = await response.json();
      setCaption(data.caption);
    } catch (error) {
      console.error('Error generating caption:', error);
      setCaption('Không thể tạo nội dung. Vui lòng thử lại.');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = async () => {
    if (!product.image) return;

    try {
      const response = await fetch(product.image);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${product.slug || product.id}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  const copyAll = async () => {
    const fullContent = `${caption}\n\n🔗 ${affiliateLink}`;
    await navigator.clipboard.writeText(fullContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(affiliateLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
      setCaption('');
      setCopied(false);
      setCopiedLink(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-green-600" />
            Tạo bài đăng
          </DialogTitle>
          <DialogDescription>
            Tạo nội dung marketing bằng AI và tải ảnh để đăng lên Facebook/Zalo
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Product Info */}
          <div className="flex gap-3 p-3 bg-gray-50 rounded-lg">
            {product.image && (
              <img 
                src={product.image} 
                alt={product.name}
                className="w-20 h-20 object-cover rounded"
              />
            )}
            <div className="flex-1">
              <h4 className="font-semibold text-sm">{product.name}</h4>
              <p className="text-green-600 font-bold mt-1">
                {new Intl.NumberFormat('vi-VN').format(Number(product.price))}đ
              </p>
            </div>
          </div>

          {/* AI Caption */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium">Nội dung bài viết</label>
              <Button
                size="sm"
                variant="outline"
                onClick={generateCaption}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Đang tạo...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    {caption ? 'Tạo lại' : 'Tạo nội dung AI'}
                  </>
                )}
              </Button>
            </div>
            <Textarea
              placeholder="Nhấn 'Tạo nội dung AI' để tạo caption tự động..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={8}
              className="resize-none"
            />
          </div>

          {/* Affiliate Link */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Link giới thiệu của bạn</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={affiliateLink}
                readOnly
                className="flex-1 px-3 py-2 border rounded-md bg-gray-50 text-sm"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={copyLink}
              >
                {copiedLink ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              Khách hàng mua qua link này, bạn sẽ nhận hoa hồng
            </p>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button
              variant="outline"
              onClick={downloadImage}
              disabled={!product.image}
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              Tải ảnh
            </Button>
            <Button
              onClick={copyAll}
              disabled={!caption}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Đã copy!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy tất cả
                </>
              )}
            </Button>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>Hướng dẫn:</strong> Nhấn "Copy tất cả" để copy nội dung + link, 
              sau đó paste lên Facebook/Zalo. Tải ảnh về để đăng kèm bài viết.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
