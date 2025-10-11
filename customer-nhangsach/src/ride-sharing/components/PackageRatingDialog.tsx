'use client'

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, Package as PackageIcon, User, Calendar } from "lucide-react";
import type { Package } from "../mockData";

interface PackageRatingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  package: Package;
  onSubmitRating: (rating: number, comment: string) => void;
}

export function PackageRatingDialog({ 
  open, 
  onOpenChange, 
  package: pkg, 
  onSubmitRating 
}: PackageRatingDialogProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");

  const handleSubmit = () => {
    if (rating === 0) return;
    onSubmitRating(rating, comment);
    handleClose();
  };

  const handleClose = () => {
    setRating(0);
    setHoveredRating(0);
    setComment("");
    onOpenChange(false);
  };

  const handleSkip = () => {
    handleClose();
  };

  const formatDeliveryDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRatingLabel = (rating: number) => {
    switch (rating) {
      case 1: return "Rất tệ";
      case 2: return "Tệ";
      case 3: return "Bình thường";
      case 4: return "Tốt";
      case 5: return "Tuyệt vời";
      default: return "Chọn số sao để đánh giá";
    }
  };

  const characterCount = comment.length;
  const maxCharacters = 500;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Đánh giá tài xế</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-3 bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <PackageIcon className="h-4 w-4 text-orange-600" />
              <span className="font-medium">Mã đơn hàng:</span>
              <span className="text-muted-foreground">{pkg.id.toUpperCase()}</span>
            </div>

            {pkg.confirmedDriverName && (
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-blue-600" />
                <span className="font-medium">Tài xế:</span>
                <span className="text-muted-foreground">{pkg.confirmedDriverName}</span>
              </div>
            )}

            {pkg.deliveredAt && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-green-600" />
                <span className="font-medium">Giao lúc:</span>
                <span className="text-muted-foreground">{formatDeliveryDate(pkg.deliveredAt)}</span>
              </div>
            )}
          </div>

          <div className="flex flex-col items-center gap-4 py-2">
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110 active:scale-95 p-1"
                  aria-label={`Đánh giá ${star} sao`}
                >
                  <Star
                    className={`h-12 w-12 ${
                      star <= (hoveredRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              {getRatingLabel(rating)}
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Nhận xét về tài xế
              <span className="text-muted-foreground font-normal ml-1">(Tùy chọn)</span>
            </label>
            <Textarea
              placeholder="Chia sẻ trải nghiệm của bạn với tài xế..."
              value={comment}
              onChange={(e) => {
                const newValue = e.target.value;
                if (newValue.length <= maxCharacters) {
                  setComment(newValue);
                }
              }}
              rows={4}
              className="resize-none"
              maxLength={maxCharacters}
            />
            <div className="flex justify-end">
              <span className={`text-xs ${
                characterCount > maxCharacters * 0.9 
                  ? 'text-orange-600 font-medium' 
                  : 'text-muted-foreground'
              }`}>
                {characterCount}/{maxCharacters}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button 
            variant="ghost" 
            onClick={handleSkip}
            className="flex-1 sm:flex-none"
          >
            Bỏ qua
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={rating === 0}
            className="flex-1 sm:flex-none"
          >
            Gửi đánh giá
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
