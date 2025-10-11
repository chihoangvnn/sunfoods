'use client'

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Package as PackageIcon, User, Clock } from "lucide-react";

interface EstimatedTimeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bidId: string;
  driverName: string;
  packageId: string;
  onConfirm: (estimatedTime: string) => void;
}

export function EstimatedTimeDialog({
  open,
  onOpenChange,
  bidId,
  driverName,
  packageId,
  onConfirm,
}: EstimatedTimeDialogProps) {
  const [estimatedTime, setEstimatedTime] = useState("");

  const formatDateTimeLocal = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  useEffect(() => {
    if (open) {
      const now = new Date();
      now.setHours(now.getHours() + 2);
      const defaultTime = formatDateTimeLocal(now);
      setEstimatedTime(defaultTime);
    }
  }, [open]);

  const getCurrentMinTime = () => {
    const now = new Date();
    return formatDateTimeLocal(now);
  };

  const handleConfirm = () => {
    if (estimatedTime) {
      const isoString = new Date(estimatedTime).toISOString();
      onConfirm(isoString);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Xác nhận báo giá</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center gap-2 text-sm">
            <PackageIcon className="h-4 w-4 text-orange-600" />
            <span className="text-muted-foreground">Mã đơn:</span>
            <span className="font-semibold">{packageId.toUpperCase()}</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-blue-600" />
            <span className="text-muted-foreground">Tài xế:</span>
            <span className="font-semibold">{driverName}</span>
          </div>

          <div className="space-y-2">
            <Label htmlFor="estimated-time" className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-green-600" />
              Thời gian giao hàng dự kiến
            </Label>
            <Input
              id="estimated-time"
              type="datetime-local"
              value={estimatedTime}
              min={getCurrentMinTime()}
              onChange={(e) => setEstimatedTime(e.target.value)}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Thời gian dự kiến tài xế sẽ giao hàng
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
          >
            Hủy
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!estimatedTime}
          >
            Xác nhận
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
