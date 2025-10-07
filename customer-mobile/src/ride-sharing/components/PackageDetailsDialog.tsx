'use client'

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
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Package, 
  MapPin, 
  Phone, 
  ImageIcon, 
  DollarSign, 
  Scale,
  Ruler,
  Package2,
  Wallet,
  CreditCard,
  AlertCircle,
  Info,
  Camera,
  Star,
  Clock
} from "lucide-react";
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
  const isPriceConfirmed = pkg.status === "price_confirmed" || pkg.status === "in_transit" || pkg.status === "delivered";

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatEstimatedTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    const time = date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    
    if (targetDate.getTime() === today.getTime()) {
      return `${time} hôm nay`;
    } else if (targetDate.getTime() === today.getTime() + 86400000) {
      return `${time} ngày mai`;
    } else {
      return date.toLocaleString('vi-VN', { 
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const getPackageTypeConfig = (type?: string) => {
    switch (type) {
      case "electronics":
        return { label: "Điện tử", color: "bg-blue-100 text-blue-700", icon: Package2 };
      case "food":
        return { label: "Thực phẩm", color: "bg-green-100 text-green-700", icon: Package2 };
      case "fragile":
        return { label: "Dễ vỡ", color: "bg-red-100 text-red-700", icon: AlertCircle };
      case "documents":
        return { label: "Giấy tờ", color: "bg-purple-100 text-purple-700", icon: Package2 };
      case "clothing":
        return { label: "Quần áo", color: "bg-pink-100 text-pink-700", icon: Package2 };
      case "other":
        return { label: "Khác", color: "bg-gray-100 text-gray-700", icon: Package2 };
      default:
        return null;
    }
  };

  const getPaymentMethodConfig = (method: string) => {
    switch (method) {
      case "cod":
        return { label: "COD", color: "bg-amber-100 text-amber-700", icon: DollarSign };
      case "cash":
        return { label: "Tiền mặt", color: "bg-green-100 text-green-700", icon: Wallet };
      case "bank_transfer":
        return { label: "Chuyển khoản", color: "bg-blue-100 text-blue-700", icon: CreditCard };
      default:
        return { label: method, color: "bg-gray-100 text-gray-700", icon: DollarSign };
    }
  };

  const packageTypeConfig = getPackageTypeConfig(pkg.packageType);
  const paymentConfig = getPaymentMethodConfig(pkg.paymentMethod);
  const PaymentIcon = paymentConfig.icon;
  const PackageTypeIcon = packageTypeConfig?.icon || Package2;

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

            {(pkg.weight || pkg.dimensions || pkg.value || pkg.packageType || pkg.description) && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Package2 className="h-4 w-4" />
                  <span className="font-semibold">Thông tin hàng hóa</span>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {pkg.weight && (
                      <div className="flex items-center gap-2">
                        <Scale className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Khối lượng:</span>
                        <span>{pkg.weight}kg</span>
                      </div>
                    )}
                    {pkg.dimensions && (
                      <div className="flex items-center gap-2">
                        <Ruler className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Kích thước:</span>
                        <span>{pkg.dimensions.length}x{pkg.dimensions.width}x{pkg.dimensions.height}cm</span>
                      </div>
                    )}
                    {pkg.value && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Giá trị:</span>
                        <span>{pkg.value.toLocaleString('vi-VN')} ₫</span>
                      </div>
                    )}
                    {packageTypeConfig && (
                      <div className="flex items-center gap-2">
                        <PackageTypeIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Loại hàng:</span>
                        <Badge variant="secondary" className={`${packageTypeConfig.color} text-xs`}>
                          {packageTypeConfig.label}
                        </Badge>
                      </div>
                    )}
                  </div>
                  {pkg.description && (
                    <div className="text-sm pt-2 border-t">
                      <span className="font-medium">Mô tả: </span>
                      <span className="text-muted-foreground">{pkg.description}</span>
                    </div>
                  )}
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

            <div>
              <div className="flex items-center gap-2 mb-3">
                <PaymentIcon className="h-4 w-4" />
                <span className="font-semibold">Thông tin thanh toán</span>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Phương thức:</span>
                  <Badge variant="secondary" className={`${paymentConfig.color} flex items-center gap-1`}>
                    <PaymentIcon className="h-3 w-3" />
                    {paymentConfig.label}
                  </Badge>
                </div>
                
                {pkg.paymentMethod === "cod" && pkg.codAmount && (
                  <div className="text-sm">
                    <span className="font-medium">Số tiền thu hộ:</span>
                    <span className="ml-2 font-bold text-amber-700">
                      {pkg.codAmount.toLocaleString('vi-VN')} ₫
                    </span>
                  </div>
                )}

                {pkg.confirmedPrice && pkg.deliveryFee && pkg.serviceFee ? (
                  <div className="text-sm space-y-2 pt-2 border-t">
                    <div className="font-medium mb-1">
                      {isPriceConfirmed ? "Chi phí giao hàng:" : "Chi phí dự kiến:"}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Phí giao hàng:</span>
                      <span>{pkg.deliveryFee.toLocaleString('vi-VN')} ₫</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Phí dịch vụ:</span>
                      <span>{pkg.serviceFee.toLocaleString('vi-VN')} ₫</span>
                    </div>
                    <div className="flex justify-between font-bold text-emerald-700 pt-1 border-t">
                      <span>Tổng cộng:</span>
                      <span>{pkg.confirmedPrice.toLocaleString('vi-VN')} ₫</span>
                    </div>
                  </div>
                ) : pkg.confirmedPrice ? (
                  <div className="text-sm pt-2 border-t">
                    <div className="flex justify-between font-bold text-emerald-700">
                      <span>{isPriceConfirmed ? "Tổng chi phí:" : "Chi phí dự kiến:"}</span>
                      <span>{pkg.confirmedPrice.toLocaleString('vi-VN')} ₫</span>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            {(pkg.specialNotes || pkg.deliveryInstructions) && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Info className="h-4 w-4" />
                  <span className="font-semibold">Hướng dẫn đặc biệt</span>
                </div>
                <div className="space-y-3">
                  {pkg.specialNotes && (
                    <div className="bg-orange-50 border border-orange-200 p-3 rounded-lg">
                      <div className="flex items-start gap-2 text-sm">
                        <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-medium text-orange-900 mb-1">Lưu ý đặc biệt:</div>
                          <div className="text-orange-700">{pkg.specialNotes}</div>
                        </div>
                      </div>
                    </div>
                  )}
                  {pkg.deliveryInstructions && (
                    <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                      <div className="flex items-start gap-2 text-sm">
                        <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-medium text-blue-900 mb-1">Hướng dẫn giao hàng:</div>
                          <div className="text-blue-700">{pkg.deliveryInstructions}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {pkg.estimatedDeliveryTime && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="font-semibold text-blue-900">Dự kiến giao:</div>
                    <div className="text-lg font-bold text-blue-700">
                      {formatEstimatedTime(pkg.estimatedDeliveryTime)}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {pkg.status === "delivered" && (pkg.podImages || pkg.podTimestamp || pkg.podOtp) && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Camera className="h-4 w-4" />
                  <span className="font-semibold">Xác nhận giao hàng (POD)</span>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  {pkg.podImages && pkg.podImages.length > 0 && (
                    <div>
                      <div className="text-sm font-medium mb-2">Hình ảnh xác nhận:</div>
                      <div className="grid grid-cols-2 gap-2">
                        {pkg.podImages.map((image, index) => (
                          <div key={index} className="aspect-square rounded overflow-hidden bg-gray-200 border">
                            <img 
                              src={image} 
                              alt={`POD ${index + 1}`} 
                              className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                              onClick={() => window.open(image, '_blank')}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {pkg.podTimestamp && (
                    <div className="text-sm">
                      <span className="font-medium">Thời gian giao:</span>
                      <span className="ml-2 text-muted-foreground">{formatTime(pkg.podTimestamp)}</span>
                    </div>
                  )}
                  {pkg.podOtp && (
                    <div className="text-sm">
                      <span className="font-medium">Mã OTP đã sử dụng:</span>
                      <span className="ml-2 font-mono text-muted-foreground">****</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {pkg.rating && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  <span className="font-semibold">Đánh giá</span>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-5 w-5 ${i < pkg.rating! ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} 
                        />
                      ))}
                    </div>
                    <span className="font-bold text-lg">{pkg.rating.toFixed(1)}</span>
                  </div>
                  {pkg.ratingComment && (
                    <div className="text-sm text-gray-700 mt-2">
                      "{pkg.ratingComment}"
                    </div>
                  )}
                  {pkg.ratedAt && (
                    <div className="text-xs text-gray-500 mt-2">
                      Đánh giá vào: {formatTime(pkg.ratedAt)}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="text-xs text-gray-500 border-t pt-3">
              Đơn hàng được tạo lúc: {formatTime(pkg.createdAt)}
            </div>

            {pkg.confirmedPrice && !pkg.rating && (
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
