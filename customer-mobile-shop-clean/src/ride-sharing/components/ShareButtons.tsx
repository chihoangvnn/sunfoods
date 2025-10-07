'use client'

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Link as LinkIcon, Facebook, MessageCircle } from "lucide-react";

interface ShareButtonsProps {
  tripId: string;
  tripRoute: string;
  driverId: string;
}

export default function ShareButtons({ tripId, tripRoute, driverId }: ShareButtonsProps) {
  const { toast } = useToast();
  const [isCopying, setIsCopying] = useState(false);

  const generateShareUrl = () => {
    if (typeof window === 'undefined') return '';
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
    return `${baseUrl}/datxe/trip/${tripId}?driver=${driverId}`;
  };

  const handleCopyLink = async () => {
    try {
      setIsCopying(true);
      const shareUrl = generateShareUrl();
      
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Đã sao chép liên kết",
          description: "Link đã được sao chép vào clipboard",
        });
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = shareUrl;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        toast({
          title: "Đã sao chép liên kết",
          description: "Link đã được sao chép",
        });
      }
    } catch (error) {
      console.error('Copy failed:', error);
      toast({
        title: "Không thể sao chép",
        description: "Vui lòng thử lại hoặc sao chép thủ công",
        variant: "destructive",
      });
    } finally {
      setIsCopying(false);
    }
  };

  const handleShareFacebook = () => {
    const shareUrl = generateShareUrl();
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
  };

  const handleShareZalo = async () => {
    const shareUrl = generateShareUrl();
    const shareText = `Chuyến xe ${tripRoute} - Đặt vé ngay!`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareText,
          text: `${shareText}\n`,
          url: shareUrl,
        });
        toast({
          title: "Chia sẻ thành công",
          description: "Đã chia sẻ chuyến xe",
        });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          fallbackZaloShare(shareUrl, shareText);
        }
      }
    } else {
      fallbackZaloShare(shareUrl, shareText);
    }
  };

  const fallbackZaloShare = (shareUrl: string, shareText: string) => {
    const zaloUrl = `https://zalo.me/sharelink?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareText)}`;
    window.open(zaloUrl, '_blank', 'width=600,height=400');
  };

  return (
    <div className="flex gap-2 flex-wrap">
      <Button
        variant="outline"
        size="sm"
        onClick={handleCopyLink}
        disabled={isCopying}
        className="flex items-center gap-1 text-xs"
      >
        <LinkIcon className="h-3 w-3" />
        {isCopying ? "Đang sao chép..." : "Sao chép link"}
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={handleShareFacebook}
        className="flex items-center gap-1 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
      >
        <Facebook className="h-3 w-3" />
        Facebook
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={handleShareZalo}
        className="flex items-center gap-1 text-xs bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200"
      >
        <MessageCircle className="h-3 w-3" />
        Zalo
      </Button>
    </div>
  );
}
