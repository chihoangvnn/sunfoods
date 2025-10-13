'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';

interface RatingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rideRequestId: string;
  ratedUserId: string;
  ratedUserName: string;
  raterType: 'customer' | 'driver';
  onRatingSubmitted?: () => void;
}

export function RatingModal({
  open,
  onOpenChange,
  rideRequestId,
  ratedUserId,
  ratedUserName,
  raterType,
  onRatingSubmitted,
}: RatingModalProps) {
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: 'Vui lòng chọn số sao',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/ride-ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rideRequestId,
          ratedUserId,
          rating,
          comment: comment.trim() || null,
          raterType,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        
        if (response.status === 409) {
          toast({
            title: 'Đã đánh giá',
            description: data.error || 'Bạn đã đánh giá chuyến đi này rồi',
            variant: 'destructive',
          });
        } else {
          throw new Error(data.error || 'Failed to submit rating');
        }
        return;
      }

      toast({
        title: 'Đánh giá thành công',
        description: 'Cảm ơn bạn đã đánh giá!',
      });

      setRating(0);
      setComment('');
      onOpenChange(false);
      
      if (onRatingSubmitted) {
        onRatingSubmitted();
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể gửi đánh giá. Vui lòng thử lại.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayRating = hoveredRating || rating;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white/60 backdrop-blur-md border-tramhuong-accent/20 shadow-[0_8px_32px_rgba(193,168,117,0.3)]">
        <DialogHeader>
          <DialogTitle className="font-playfair text-tramhuong-primary">
            Đánh giá {raterType === 'customer' ? 'tài xế' : 'khách hàng'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="text-center">
            <p className="text-lg font-medium mb-2 text-tramhuong-primary">{ratedUserName}</p>
            <p className="text-sm text-tramhuong-primary/70 mb-4">
              Bạn cảm thấy thế nào về {raterType === 'customer' ? 'tài xế' : 'khách hàng'} này?
            </p>

            <div className="flex items-center justify-center gap-2 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform duration-300 hover:scale-110"
                >
                  <Star
                    className={`h-10 w-10 transition-all duration-300 ${
                      star <= displayRating
                        ? 'fill-tramhuong-accent text-tramhuong-accent'
                        : 'fill-tramhuong-accent/20 text-tramhuong-accent/20'
                    }`}
                  />
                </button>
              ))}
            </div>

            {rating > 0 && (
              <p className="text-sm text-tramhuong-accent">
                {rating === 1 && 'Rất tệ'}
                {rating === 2 && 'Tệ'}
                {rating === 3 && 'Bình thường'}
                {rating === 4 && 'Tốt'}
                {rating === 5 && 'Tuyệt vời'}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-tramhuong-primary">
              Bình luận (không bắt buộc)
            </label>
            <Textarea
              placeholder={`Chia sẻ trải nghiệm của bạn với ${raterType === 'customer' ? 'tài xế' : 'khách hàng'}...`}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="resize-none border-tramhuong-accent/30 focus:border-tramhuong-accent transition-all duration-300"
            />
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 border-tramhuong-accent/30 text-tramhuong-accent hover:bg-tramhuong-accent/20 transition-all duration-300"
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              className="flex-1 bg-tramhuong-accent hover:bg-tramhuong-accent/80 text-tramhuong-primary transition-all duration-300"
              disabled={isSubmitting || rating === 0}
            >
              {isSubmitting ? 'Đang gửi...' : 'Gửi đánh giá'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
