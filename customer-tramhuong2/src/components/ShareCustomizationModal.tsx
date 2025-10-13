'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Share2, Image as ImageIcon, Type, Eye, Sparkles, Clock, Calendar as CalendarIcon } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description?: string;
  shortDescription?: string;
  price: string;
  image?: string;
  images?: string[];
  slug?: string;
  commissionPercentage?: number;
  commission?: number;
  category?: string;
}

interface Affiliate {
  tier?: 'bronze' | 'silver' | 'gold' | null;
}

interface ShareCustomizationModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  affiliateId: string;
  affiliateTier?: 'bronze' | 'silver' | 'gold' | null;
  onShare?: (imageIndex: number, caption: string, platform: string) => Promise<void>;
}

const formatVND = (amount: string | number) => {
  const num = typeof amount === 'string' ? parseInt(amount) : amount;
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(num);
};

export function ShareCustomizationModal({ 
  product, 
  isOpen, 
  onClose, 
  affiliateId,
  affiliateTier,
  onShare 
}: ShareCustomizationModalProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [caption, setCaption] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledTime, setScheduledTime] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<'facebook' | 'zalo' | 'tiktok'>('facebook');

  if (!product) return null;

  const productImages = product.images && product.images.length > 0 
    ? product.images 
    : product.image 
      ? [product.image] 
      : [];

  // Caption templates
  const templates = [
    {
      id: 1,
      name: 'Giới thiệu sản phẩm',
      generate: () => `🔥 ${product.name}

💰 Giá: ${formatVND(product.price)}
${product.commissionPercentage ? `🎁 Hoa hồng CTV (${product.commissionPercentage}%): ${formatVND(product.commission || 0)}` : ''}

✨ ${product.shortDescription || product.description || 'Sản phẩm chất lượng cao'}

📞 Đặt hàng ngay tại link bên dưới! 👇`
    },
    {
      id: 2,
      name: 'Ưu đãi đặc biệt',
      generate: () => `🎁 DEAL SỐC HÔM NAY!

${product.name}
💰 Giá chỉ: ${formatVND(product.price)}
⏰ Số lượng có hạn!

${product.commissionPercentage ? `🎯 Hoa hồng dành cho CTV: ${formatVND(product.commission || 0)} (${product.commissionPercentage}%)` : ''}

👉 Đặt ngay kẻo lỡ!`
    },
    {
      id: 3,
      name: 'Review cá nhân',
      generate: () => `⭐ Mình mới dùng ${product.name}

👉 Cảm nhận: ${product.shortDescription || 'Rất hài lòng với chất lượng!'}
💯 Đánh giá: 5 sao!

💰 Giá: ${formatVND(product.price)}
${product.commissionPercentage ? `🎁 Hoa hồng: ${formatVND(product.commission || 0)}` : ''}

📦 Order ngay nhé các bạn!`
    },
    {
      id: 4,
      name: 'Khuyến mãi hot',
      generate: () => `🔥🔥 HOT DEAL 🔥🔥

${product.name}
💸 Giá cực tốt: ${formatVND(product.price)}

✨ ${product.shortDescription || product.description || 'Sản phẩm chất lượng cao'}

${product.commissionPercentage ? `💰 CTV kiếm ngay: ${formatVND(product.commission || 0)}` : ''}

🛒 Đặt hàng ngay!`
    },
    {
      id: 5,
      name: 'Gợi ý mua sắm',
      generate: () => `💡 GỢI Ý CHO BẠN

${product.name} là sản phẩm mình đang giới thiệu

💰 ${formatVND(product.price)}
✨ ${product.shortDescription || 'Chất lượng tuyệt vời'}

${product.commissionPercentage ? `🎁 Mua qua mình để nhận ưu đãi tốt nhất!` : '📞 Liên hệ đặt hàng ngay!'}

👇 Link đặt hàng bên dưới`
    }
  ];

  const handleTemplateSelect = (template: typeof templates[0]) => {
    setSelectedTemplate(template.id);
    setCaption(template.generate());
  };

  const handleGenerateAI = async () => {
    setIsGeneratingAI(true);
    try {
      const response = await fetch('/api/affiliate-portal/generate-post-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: product.name,
          description: product.description,
          shortDescription: product.shortDescription,
          price: product.price,
          category: product.category,
          affiliateTier: affiliateTier
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate AI caption');
      }

      const data = await response.json();
      setCaption(data.caption);
      setSelectedTemplate(null);
    } catch (error) {
      console.error('AI generation error:', error);
      alert('⚠️ Không thể tạo nội dung bằng AI. Vui lòng thử lại sau.');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleShare = async () => {
    setIsSharing(true);
    try {
      if (isScheduled) {
        if (!scheduledTime) {
          alert('⚠️ Vui lòng chọn thời gian đăng bài');
          setIsSharing(false);
          return;
        }

        const response = await fetch('/api/affiliate-portal/schedule-post', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: product.id,
            productName: product.name,
            productSlug: product.slug,
            imageIndex: selectedImageIndex,
            caption,
            platform: selectedPlatform,
            scheduledFor: scheduledTime,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to schedule post');
        }

        alert(`✅ ${data.message}\n📅 Thời gian: ${new Date(scheduledTime).toLocaleString('vi-VN')}`);
        onClose();
      } else {
        if (onShare) {
          await onShare(selectedImageIndex, caption, selectedPlatform);
        } else {
          const publicUrl = `https://nhangsach.net/product/${product.slug || product.id}?ref=${affiliateId}&img=${selectedImageIndex}`;
          
          if (selectedPlatform === 'facebook') {
            const fbShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(publicUrl)}&quote=${encodeURIComponent(caption)}`;
            window.open(fbShareUrl, 'facebook-share-dialog', 'width=626,height=436');
          } else if (selectedPlatform === 'zalo') {
            // Zalo doesn't have web share dialog - copy to clipboard
            await navigator.clipboard.writeText(`${caption}\n\n${publicUrl}`);
            alert(`✅ Đã copy nội dung!\n\n📱 Mở app Zalo và dán (paste) vào bài đăng của bạn.\n\n🔗 Link: ${publicUrl}`);
          } else if (selectedPlatform === 'tiktok') {
            // TikTok doesn't have web share dialog - copy to clipboard
            await navigator.clipboard.writeText(`${caption}\n\n${publicUrl}`);
            alert(`✅ Đã copy nội dung!\n\n📱 Mở app TikTok và dán (paste) vào caption video của bạn.\n\n🔗 Link: ${publicUrl}`);
          }
        }
        
        onClose();
      }
    } catch (error: any) {
      console.error('Error sharing:', error);
      alert(error.message || 'Có lỗi khi chia sẻ. Vui lòng thử lại.');
    } finally {
      setIsSharing(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
      setSelectedImageIndex(0);
      setCaption('');
      setSelectedTemplate(null);
      setIsScheduled(false);
      setScheduledTime('');
    }
  };

  const getMinScheduleTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 5);
    return now.toISOString().slice(0, 16);
  };

  const getMaxScheduleTime = () => {
    const max = new Date();
    max.setDate(max.getDate() + 7);
    return max.toISOString().slice(0, 16);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-white/60 backdrop-blur-md shadow-[0_8px_32px_rgba(193,168,117,0.3)]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-playfair text-tramhuong-primary">
            <Share2 className="h-5 w-5 text-tramhuong-accent" />
            Tùy chỉnh bài đăng {selectedPlatform === 'facebook' ? 'Facebook' : selectedPlatform === 'zalo' ? 'Zalo' : 'TikTok'}
          </DialogTitle>
          <DialogDescription className="text-tramhuong-primary/70">
            Chọn hình ảnh và nội dung để chia sẻ sản phẩm lên {selectedPlatform === 'facebook' ? 'Facebook' : selectedPlatform === 'zalo' ? 'Zalo' : 'TikTok'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Product Info */}
          <div className="flex gap-3 p-3 bg-tramhuong-accent/5 rounded-lg border border-tramhuong-accent/20">
            {productImages[selectedImageIndex] && (
              <img 
                src={productImages[selectedImageIndex]} 
                alt={product.name}
                className="w-20 h-20 object-cover rounded"
              />
            )}
            <div className="flex-1">
              <h3 className="font-semibold text-sm text-tramhuong-primary">{product.name}</h3>
              <p className="text-tramhuong-accent font-bold text-lg">{formatVND(product.price)}</p>
              {product.commissionPercentage && (
                <p className="text-tramhuong-accent text-xs">
                  🎁 Hoa hồng: {formatVND(product.commission || 0)} ({product.commissionPercentage}%)
                </p>
              )}
            </div>
          </div>

          {/* Platform Selector */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-tramhuong-primary">
              <Share2 className="h-4 w-4 text-tramhuong-accent" />
              Chọn nền tảng chia sẻ
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={selectedPlatform === 'facebook' ? 'default' : 'outline'}
                onClick={() => setSelectedPlatform('facebook')}
                className={selectedPlatform === 'facebook' ? 'bg-tramhuong-accent hover:bg-tramhuong-accent/90 transition-all duration-300' : 'border-tramhuong-accent/30 text-tramhuong-primary hover:bg-tramhuong-accent/10 transition-all duration-300'}
              >
                📘 Facebook
              </Button>
              <Button
                variant={selectedPlatform === 'zalo' ? 'default' : 'outline'}
                onClick={() => setSelectedPlatform('zalo')}
                className={selectedPlatform === 'zalo' ? 'bg-tramhuong-accent hover:bg-tramhuong-accent/90 transition-all duration-300' : 'border-tramhuong-accent/30 text-tramhuong-primary hover:bg-tramhuong-accent/10 transition-all duration-300'}
              >
                💬 Zalo
              </Button>
              <Button
                variant={selectedPlatform === 'tiktok' ? 'default' : 'outline'}
                onClick={() => setSelectedPlatform('tiktok')}
                className={selectedPlatform === 'tiktok' ? 'bg-tramhuong-accent hover:bg-tramhuong-accent/90 transition-all duration-300' : 'border-tramhuong-accent/30 text-tramhuong-primary hover:bg-tramhuong-accent/10 transition-all duration-300'}
              >
                🎵 TikTok
              </Button>
            </div>
            <p className="text-xs text-tramhuong-primary/60">
              💡 Mỗi nền tảng có giới hạn riêng: 4 bài/ngày, cách nhau tối thiểu 2 giờ
            </p>
          </div>

          {/* Image Selector */}
          {productImages.length > 1 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-tramhuong-primary">
                <ImageIcon className="h-4 w-4 text-tramhuong-accent" />
                Chọn hình ảnh ({productImages.length} ảnh)
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {productImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                      selectedImageIndex === index 
                        ? 'border-tramhuong-accent ring-2 ring-tramhuong-accent/20' 
                        : 'border-tramhuong-accent/20 hover:border-tramhuong-accent/40'
                    }`}
                  >
                    <img 
                      src={img} 
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {selectedImageIndex === index && (
                      <div className="absolute inset-0 bg-tramhuong-accent/20 flex items-center justify-center">
                        <div className="w-6 h-6 bg-tramhuong-accent rounded-full flex items-center justify-center text-white text-xs font-bold">
                          ✓
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Caption Templates */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium text-tramhuong-primary">
                <Type className="h-4 w-4 text-tramhuong-accent" />
                Chọn mẫu nội dung
              </div>
              <Button
                onClick={handleGenerateAI}
                disabled={isGeneratingAI}
                size="sm"
                variant="default"
                className="bg-tramhuong-accent hover:bg-tramhuong-accent/90 text-white transition-all duration-300"
              >
                {isGeneratingAI ? (
                  <>
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                    Đang tạo...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-1 h-3 w-3" />
                    ✨ Tạo bằng AI
                  </>
                )}
              </Button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {templates.map((template) => (
                <Button
                  key={template.id}
                  variant={selectedTemplate === template.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleTemplateSelect(template)}
                  className={`text-xs h-auto py-2 transition-all duration-300 ${selectedTemplate === template.id ? 'bg-tramhuong-accent hover:bg-tramhuong-accent/90' : 'border-tramhuong-accent/30 text-tramhuong-primary hover:bg-tramhuong-accent/10'}`}
                >
                  {template.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Caption Editor */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-tramhuong-primary">
              <Eye className="h-4 w-4 text-tramhuong-accent" />
              Nội dung bài đăng
            </div>
            <Textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Chọn mẫu hoặc tự viết nội dung..."
              className="min-h-[180px] text-sm border-tramhuong-accent/20 focus:ring-tramhuong-accent focus:border-tramhuong-accent transition-all duration-300"
            />
            <p className="text-xs text-tramhuong-primary/60">
              💡 Mẹo: Thêm câu chuyện cá nhân hoặc cảm nhận của bạn để bài đăng sinh động hơn!
            </p>
          </div>

          {/* Scheduled Post Option */}
          <div className="space-y-3 border-t border-tramhuong-accent/20 pt-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="schedule-post"
                checked={isScheduled}
                onChange={(e) => setIsScheduled(e.target.checked)}
                className="h-4 w-4 rounded border-tramhuong-accent/30 text-tramhuong-accent focus:ring-tramhuong-accent"
              />
              <label htmlFor="schedule-post" className="text-sm font-medium text-tramhuong-primary flex items-center gap-2 cursor-pointer">
                <Clock className="h-4 w-4 text-tramhuong-accent" />
                Đăng theo lịch (tự động)
              </label>
            </div>

            {isScheduled && (
              <div className="bg-tramhuong-accent/5 border border-tramhuong-accent/20 rounded-lg p-3 space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-tramhuong-primary">
                  <CalendarIcon className="h-4 w-4 text-tramhuong-accent" />
                  Chọn thời gian đăng bài
                </div>
                <input
                  type="datetime-local"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  min={getMinScheduleTime()}
                  max={getMaxScheduleTime()}
                  className="w-full px-3 py-2 border border-tramhuong-accent/30 rounded-md focus:outline-none focus:ring-2 focus:ring-tramhuong-accent transition-all duration-300"
                />
                <p className="text-xs text-tramhuong-primary/70">
                  ⏰ Bài đăng sẽ tự động được chia sẻ vào thời gian đã chọn (tối thiểu sau 5 phút, tối đa 7 ngày)
                </p>
              </div>
            )}
          </div>

          {/* Preview */}
          {caption && (
            <div className="space-y-2">
              <div className="text-sm font-medium text-tramhuong-primary">Xem trước bài đăng</div>
              <div className="border border-tramhuong-accent/20 rounded-lg p-4 bg-tramhuong-accent/5 space-y-3">
                {productImages[selectedImageIndex] && (
                  <img 
                    src={productImages[selectedImageIndex]} 
                    alt={product.name}
                    className="w-full rounded-lg max-h-60 object-cover"
                  />
                )}
                <div className="text-sm whitespace-pre-wrap text-tramhuong-primary">
                  {caption}
                </div>
                <div className="text-xs text-tramhuong-accent break-all">
                  🔗 https://nhangsach.net/product/{product.slug || product.id}?ref={affiliateId}
                </div>
              </div>
            </div>
          )}

          {/* Share Button */}
          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleShare}
              disabled={!caption || isSharing || (isScheduled && !scheduledTime)}
              className="flex-1 bg-tramhuong-accent hover:bg-tramhuong-accent/90 transition-all duration-300"
            >
              {isSharing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isScheduled ? 'Đang đặt lịch...' : 'Đang chia sẻ...'}
                </>
              ) : isScheduled ? (
                <>
                  <Clock className="mr-2 h-4 w-4" />
                  Đặt lịch đăng bài
                </>
              ) : (
                <>
                  <Share2 className="mr-2 h-4 w-4" />
                  Đăng ngay
                </>
              )}
            </Button>
            <Button
              onClick={() => onClose()}
              variant="outline"
              disabled={isSharing}
              className="border-tramhuong-accent/30 text-tramhuong-primary hover:bg-tramhuong-accent/10 transition-all duration-300"
            >
              Hủy
            </Button>
          </div>

          {/* Warning */}
          <div className="bg-tramhuong-accent/5 border border-tramhuong-accent/20 rounded-lg p-3 text-xs text-tramhuong-primary">
            ⚠️ <strong>Lưu ý:</strong> Để tránh bị Facebook coi là spam, nên:
            <ul className="mt-1 ml-4 list-disc space-y-0.5 text-tramhuong-primary/70">
              <li>Chỉ đăng 3-4 bài/ngày, cách nhau ít nhất 2 giờ</li>
              <li>Thay đổi nội dung mỗi lần đăng</li>
              <li>Thêm câu chuyện cá nhân để bài viết sinh động</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
