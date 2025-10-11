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
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-blue-600" />
            Tùy chỉnh bài đăng {selectedPlatform === 'facebook' ? 'Facebook' : selectedPlatform === 'zalo' ? 'Zalo' : 'TikTok'}
          </DialogTitle>
          <DialogDescription>
            Chọn hình ảnh và nội dung để chia sẻ sản phẩm lên {selectedPlatform === 'facebook' ? 'Facebook' : selectedPlatform === 'zalo' ? 'Zalo' : 'TikTok'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Product Info */}
          <div className="flex gap-3 p-3 bg-gray-50 rounded-lg">
            {productImages[selectedImageIndex] && (
              <img 
                src={productImages[selectedImageIndex]} 
                alt={product.name}
                className="w-20 h-20 object-cover rounded"
              />
            )}
            <div className="flex-1">
              <h3 className="font-semibold text-sm">{product.name}</h3>
              <p className="text-blue-600 font-bold text-lg">{formatVND(product.price)}</p>
              {product.commissionPercentage && (
                <p className="text-green-600 text-xs">
                  🎁 Hoa hồng: {formatVND(product.commission || 0)} ({product.commissionPercentage}%)
                </p>
              )}
            </div>
          </div>

          {/* Platform Selector */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Share2 className="h-4 w-4" />
              Chọn nền tảng chia sẻ
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={selectedPlatform === 'facebook' ? 'default' : 'outline'}
                onClick={() => setSelectedPlatform('facebook')}
                className={selectedPlatform === 'facebook' ? 'bg-blue-600 hover:bg-blue-700' : ''}
              >
                📘 Facebook
              </Button>
              <Button
                variant={selectedPlatform === 'zalo' ? 'default' : 'outline'}
                onClick={() => setSelectedPlatform('zalo')}
                className={selectedPlatform === 'zalo' ? 'bg-sky-500 hover:bg-sky-600' : ''}
              >
                💬 Zalo
              </Button>
              <Button
                variant={selectedPlatform === 'tiktok' ? 'default' : 'outline'}
                onClick={() => setSelectedPlatform('tiktok')}
                className={selectedPlatform === 'tiktok' ? 'bg-gray-900 hover:bg-gray-800' : ''}
              >
                🎵 TikTok
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              💡 Mỗi nền tảng có giới hạn riêng: 4 bài/ngày, cách nhau tối thiểu 2 giờ
            </p>
          </div>

          {/* Image Selector */}
          {productImages.length > 1 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <ImageIcon className="h-4 w-4" />
                Chọn hình ảnh ({productImages.length} ảnh)
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {productImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImageIndex === index 
                        ? 'border-blue-500 ring-2 ring-blue-200' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img 
                      src={img} 
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {selectedImageIndex === index && (
                      <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
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
              <div className="flex items-center gap-2 text-sm font-medium">
                <Type className="h-4 w-4" />
                Chọn mẫu nội dung
              </div>
              <Button
                onClick={handleGenerateAI}
                disabled={isGeneratingAI}
                size="sm"
                variant="default"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
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
                  className="text-xs h-auto py-2"
                >
                  {template.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Caption Editor */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Eye className="h-4 w-4" />
              Nội dung bài đăng
            </div>
            <Textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Chọn mẫu hoặc tự viết nội dung..."
              className="min-h-[180px] text-sm"
            />
            <p className="text-xs text-gray-500">
              💡 Mẹo: Thêm câu chuyện cá nhân hoặc cảm nhận của bạn để bài đăng sinh động hơn!
            </p>
          </div>

          {/* Scheduled Post Option */}
          <div className="space-y-3 border-t pt-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="schedule-post"
                checked={isScheduled}
                onChange={(e) => setIsScheduled(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="schedule-post" className="text-sm font-medium text-gray-700 flex items-center gap-2 cursor-pointer">
                <Clock className="h-4 w-4 text-blue-600" />
                Đăng theo lịch (tự động)
              </label>
            </div>

            {isScheduled && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-blue-900">
                  <CalendarIcon className="h-4 w-4" />
                  Chọn thời gian đăng bài
                </div>
                <input
                  type="datetime-local"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  min={getMinScheduleTime()}
                  max={getMaxScheduleTime()}
                  className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-blue-700">
                  ⏰ Bài đăng sẽ tự động được chia sẻ vào thời gian đã chọn (tối thiểu sau 5 phút, tối đa 7 ngày)
                </p>
              </div>
            )}
          </div>

          {/* Preview */}
          {caption && (
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-700">Xem trước bài đăng</div>
              <div className="border rounded-lg p-4 bg-white space-y-3">
                {productImages[selectedImageIndex] && (
                  <img 
                    src={productImages[selectedImageIndex]} 
                    alt={product.name}
                    className="w-full rounded-lg max-h-60 object-cover"
                  />
                )}
                <div className="text-sm whitespace-pre-wrap text-gray-700">
                  {caption}
                </div>
                <div className="text-xs text-blue-600 break-all">
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
              className="flex-1 bg-blue-600 hover:bg-blue-700"
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
            >
              Hủy
            </Button>
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-800">
            ⚠️ <strong>Lưu ý:</strong> Để tránh bị Facebook coi là spam, nên:
            <ul className="mt-1 ml-4 list-disc space-y-0.5">
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
