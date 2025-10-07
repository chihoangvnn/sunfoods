import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Package, MapPin, Phone, ImageIcon, DollarSign } from "lucide-react";
import { PackageStatusBadge } from "./PackageStatusBadge";
import type { Package as PackageType } from "../mockData";

interface PackageDetailsDialogProps {
  package: PackageType | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitBid?: (packageId: string, price: number) => void;
  viewerType: "driver" | "sender";
}

export function PackageDetailsDialog({
  package: pkg,
  open,
  onOpenChange,
  onSubmitBid,
  viewerType
}: PackageDetailsDialogProps) {
  const [bidPrice, setBidPrice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!pkg) return null;

  const canSeeReceiverPhone = viewerType === "sender" || pkg.status === "price_confirmed" || pkg.status === "in_transit" || pkg.status === "delivered";
  const canBid = viewerType === "driver" && (pkg.status === "pending" || pkg.status === "bidded");

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSubmitBid = async () => {
    const price = parseInt(bidPrice);
    if (isNaN(price) || price <= 0) {
      alert("Vui lòng nhập giá hợp lệ");
      return;
    }

    if (price < 10000) {
      alert("Giá phải ít nhất 10,000 VNĐ");
      return;
    }

    setIsSubmitting(true);
    try {
      onSubmitBid?.(pkg.id, price);
      setBidPrice("");
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-orange-600" />
              Chi tiết đơn hàng {pkg.id.toUpperCase()}
            </DialogTitle>
            <PackageStatusBadge status={pkg.status} />
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            {pkg.images.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <ImageIcon className="h-4 w-4" />
                  <span className="font-semibold">Hình ảnh hàng hóa</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {pkg.images.map((image, index) => (
                    <div key={index} className="aspect-square rounded-lg overflow-hidden bg-gray-100 border">
                      <img 
                        src={image} 
                        alt={`Package ${index + 1}`} 
                        className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                        onClick={() => window.open(image, '_blank')}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-5 w-5 flex items-center justify-center bg-green-100 rounded text-green-700 text-xs font-bold">
                  G
                </div>
                <span className="font-semibold">Người gửi</span>
              </div>
              <div className="space-y-2 text-sm bg-gray-50 p-3 rounded-lg">
                <div><span className="font-medium">Tên:</span> {pkg.senderName}</div>
                <div className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  <span className="font-medium">SĐT:</span> {pkg.senderPhone}
                </div>
                <div className="flex items-start gap-1">
                  <MapPin className="h-3 w-3 mt-0.5" />
                  <div>
                    <span className="font-medium">Địa chỉ:</span> {pkg.senderAddress}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-5 w-5 flex items-center justify-center bg-red-100 rounded text-red-700 text-xs font-bold">
                  N
                </div>
                <span className="font-semibold">Người nhận</span>
              </div>
              <div className="space-y-2 text-sm bg-gray-50 p-3 rounded-lg">
                <div><span className="font-medium">Tên:</span> {pkg.receiverName}</div>
                {canSeeReceiverPhone ? (
                  <div className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    <span className="font-medium">SĐT:</span> {pkg.receiverPhone}
                  </div>
                ) : (
                  <div className="text-xs text-gray-400 italic">
                    SĐT hiển thị sau khi xác nhận giá
                  </div>
                )}
                <div className="flex items-start gap-1">
                  <MapPin className="h-3 w-3 mt-0.5" />
                  <div>
                    <span className="font-medium">Địa chỉ:</span> {pkg.receiverAddress}
                  </div>
                </div>
              </div>
            </div>

            <div className="text-xs text-gray-500 border-t pt-3">
              Đơn hàng được tạo lúc: {formatTime(pkg.createdAt)}
            </div>

            {pkg.confirmedPrice && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-emerald-800">Giá đã xác nhận:</span>
                  <span className="text-xl font-bold text-emerald-700">
                    {pkg.confirmedPrice.toLocaleString('vi-VN')} ₫
                  </span>
                </div>
                {pkg.confirmedDriverName && (
                  <div className="text-sm text-emerald-700 mt-1">
                    Tài xế: {pkg.confirmedDriverName}
                  </div>
                )}
              </div>
            )}
          </div>
        </ScrollArea>

        {canBid && (
          <DialogFooter className="border-t pt-4">
            <div className="w-full space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <DollarSign className="h-4 w-4" />
                <span>Báo giá của bạn cho đơn hàng này:</span>
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <Label htmlFor="bidPrice" className="sr-only">Giá báo</Label>
                  <Input
                    id="bidPrice"
                    type="number"
                    placeholder="VD: 50000"
                    value={bidPrice}
                    onChange={(e) => setBidPrice(e.target.value)}
                    min="10000"
                    step="1000"
                  />
                </div>
                <Button 
                  onClick={handleSubmitBid}
                  disabled={isSubmitting || !bidPrice}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  {isSubmitting ? "Đang gửi..." : "Gửi báo giá"}
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Giá tối thiểu: 10,000 ₫
              </p>
            </div>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
