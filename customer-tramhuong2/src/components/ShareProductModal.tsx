'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Copy, Download, Loader2, RefreshCw, Share2, Check } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

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
      toast({
        title: 'Lỗi tạo nội dung',
        description: 'Không thể tạo nội dung tự động. Vui lòng thử lại sau.',
        variant: 'destructive',
        duration: 3000
      });
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-white/60 backdrop-blur-md border-tramhuong-accent/20 shadow-[0_8px_32px_rgba(193,168,117,0.3)]">
        <DialogHeader>
          <DialogTitle className="font-playfair flex items-center gap-2 text-tramhuong-primary">
            <Share2 className="h-5 w-5 text-tramhuong-accent" />
            Tạo bài đăng
          </DialogTitle>
          <DialogDescription className="text-tramhuong-primary/70">
            Tạo nội dung marketing bằng AI và tải ảnh để đăng lên Facebook/Zalo
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex gap-3 p-3 bg-tramhuong-accent/10 backdrop-blur-sm rounded-lg border border-tramhuong-accent/20">
            {product.image && (
              <img 
                src={product.image} 
                alt={product.name}
                className="w-20 h-20 object-cover rounded"
              />
            )}
            <div className="flex-1">
              <h4 className="font-semibold text-sm text-tramhuong-primary">{product.name}</h4>
              <p className="text-tramhuong-accent font-bold mt-1">
                {new Intl.NumberFormat('vi-VN').format(Number(product.price))}đ
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-tramhuong-primary">Nội dung bài viết</label>
              <Button
                size="sm"
                variant="outline"
                onClick={generateCaption}
                disabled={isGenerating}
                className="border-tramhuong-accent/30 text-tramhuong-accent hover:bg-tramhuong-accent/20 transition-all duration-300"
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
              className="resize-none border-tramhuong-accent/30 focus:border-tramhuong-accent transition-all duration-300"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-tramhuong-primary">Link giới thiệu của bạn</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={affiliateLink}
                readOnly
                className="flex-1 px-3 py-2 border border-tramhuong-accent/30 rounded-md bg-tramhuong-accent/10 backdrop-blur-sm text-sm text-tramhuong-primary"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={copyLink}
                className="border-tramhuong-accent/30 text-tramhuong-accent hover:bg-tramhuong-accent/20 transition-all duration-300"
              >
                {copiedLink ? (
                  <Check className="h-4 w-4 text-tramhuong-accent" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-tramhuong-primary/60">
              Khách hàng mua qua link này, bạn sẽ nhận hoa hồng
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button
              variant="outline"
              onClick={downloadImage}
              disabled={!product.image}
              className="w-full border-tramhuong-accent/30 text-tramhuong-accent hover:bg-tramhuong-accent/20 transition-all duration-300"
            >
              <Download className="h-4 w-4 mr-2" />
              Tải ảnh
            </Button>
            <Button
              onClick={copyAll}
              disabled={!caption}
              className="w-full bg-tramhuong-accent hover:bg-tramhuong-accent/80 text-tramhuong-primary transition-all duration-300"
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

          <div className="bg-tramhuong-accent/10 backdrop-blur-sm border border-tramhuong-accent/20 rounded-lg p-3">
            <p className="text-sm text-tramhuong-primary">
              <strong className="text-tramhuong-accent">Hướng dẫn:</strong> Nhấn "Copy tất cả" để copy nội dung + link, 
              sau đó paste lên Facebook/Zalo. Tải ảnh về để đăng kèm bài viết.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
