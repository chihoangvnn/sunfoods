'use client'

import { useState, useEffect } from "react";
import { Camera, Clock, User, Phone, Package } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ImageUploadPreview } from "./ImageUploadPreview";
import { cn } from "@/lib/utils";

interface PODUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  packageId: string;
  receiverName: string;
  receiverPhone: string;
  onConfirm: (podData: {
    podImages: string[];
    podOtp: string;
    podTimestamp: string;
  }) => void;
}

export function PODUploadDialog({
  open,
  onOpenChange,
  packageId,
  receiverName,
  receiverPhone,
  onConfirm,
}: PODUploadDialogProps) {
  const [podImages, setPodImages] = useState<string[]>([]);
  const [otp, setOtp] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [errors, setErrors] = useState<{ images?: string; otp?: string }>({});

  useEffect(() => {
    if (!open) {
      setPodImages([]);
      setOtp("");
      setErrors({});
    }
  }, [open]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 4);
    setOtp(value);
    if (errors.otp && value.length === 4) {
      setErrors({ ...errors, otp: undefined });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { images?: string; otp?: string } = {};

    if (podImages.length === 0) {
      newErrors.images = "Vui lòng tải lên ít nhất 1 ảnh bằng chứng";
    }

    if (otp.length !== 4) {
      newErrors.otp = "Mã OTP phải có đúng 4 chữ số";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirm = () => {
    if (!validateForm()) {
      return;
    }

    onConfirm({
      podImages,
      podOtp: otp,
      podTimestamp: new Date().toISOString(),
    });

    onOpenChange(false);
  };

  const isValid = podImages.length > 0 && otp.length === 4;

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Xác nhận giao hàng</DialogTitle>
          <DialogDescription className="text-base">
            Mã đơn hàng: <span className="font-semibold text-gray-900">{packageId}</span>
            <br />
            Người nhận: <span className="font-semibold text-gray-900">{receiverName}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-gray-600" />
              <span className="text-gray-600">Người nhận:</span>
              <span className="font-medium text-gray-900">{receiverName}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-gray-600" />
              <span className="text-gray-600">Số điện thoại:</span>
              <span className="font-medium text-gray-900">{receiverPhone}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Package className="h-4 w-4 text-gray-600" />
              <span className="text-gray-600">Mã đơn:</span>
              <span className="font-medium text-gray-900">{packageId}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-gray-600" />
              <span className="text-gray-600">Thời gian:</span>
              <span className="font-medium text-gray-900">
                {formatTime(currentTime)} - {formatDate(currentTime)}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-gray-700" />
              <label className="text-sm font-medium text-gray-900">
                Ảnh bằng chứng giao hàng
              </label>
            </div>
            <p className="text-xs text-gray-600">
              Chụp ảnh hàng hóa đã giao (1-3 ảnh)
            </p>
            <ImageUploadPreview
              images={podImages}
              onImagesChange={(images) => {
                setPodImages(images);
                if (errors.images && images.length > 0) {
                  setErrors({ ...errors, images: undefined });
                }
              }}
              maxFiles={3}
              maxSizeInMB={5}
            />
            {errors.images && (
              <p className="text-sm text-red-600 mt-1">{errors.images}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="otp" className="text-sm font-medium text-gray-900 block">
              Mã OTP từ người nhận
            </label>
            <p className="text-xs text-gray-600">
              Nhập mã 4 số từ người nhận
            </p>
            <Input
              id="otp"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="0000"
              value={otp}
              onChange={handleOtpChange}
              className={cn(
                "text-center text-2xl font-bold tracking-widest h-16 md:h-14",
                errors.otp && "border-red-500 focus-visible:ring-red-500"
              )}
              maxLength={4}
            />
            {errors.otp && (
              <p className="text-sm text-red-600 mt-1">{errors.otp}</p>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="flex-1 sm:flex-initial h-12 sm:h-9"
          >
            Hủy
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={!isValid}
            className="flex-1 sm:flex-initial h-12 sm:h-9 bg-green-600 hover:bg-green-700"
          >
            Xác nhận đã giao
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
