'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, User, CheckCircle, MapPin, Navigation, XCircle } from "lucide-react";
import type { Seat } from "./SeatSelector";
import RatingStats from "./RatingStats";
import ReviewsList from "./ReviewsList";
import { mockPassengerReviews } from "../mockData";

interface PassengerDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  seat: Seat | null;
  onConfirm?: (seatId: string) => void;
  onCancel?: (seatId: string) => void;
  pricePerSeat: number;
}

export default function PassengerDetailsDialog({
  open,
  onClose,
  seat,
  onConfirm,
  onCancel,
  pricePerSeat
}: PassengerDetailsDialogProps) {
  if (!seat || !seat.passengerName || !seat.passengerPhone) {
    return null;
  }

  // Lấy reviews của khách hàng (dùng passengerId làm key)
  const passengerReviews = seat.passengerId ? mockPassengerReviews[seat.passengerId] || [] : [];

  const handleCall = () => {
    window.location.href = `tel:${seat.passengerPhone}`;
  };

  const handleOpenMaps = () => {
    if (!seat.pickupLocation) return;
    
    if (seat.pickupLocation.gpsCoords) {
      const { lat, lng } = seat.pickupLocation.gpsCoords;
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
    } else if (seat.pickupLocation.address) {
      const encodedAddress = encodeURIComponent(seat.pickupLocation.address);
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`, '_blank');
    }
  };

  const handleConfirm = () => {
    if (onConfirm && seat.status === "pending_confirmation") {
      onConfirm(seat.id);
    }
    onClose();
  };

  const handleCancel = () => {
    const confirmCancel = window.confirm(
      `Bạn có chắc chắn muốn hủy đặt chỗ của ${seat.passengerName}?\n\nGhế ${seat.id} sẽ trở về trạng thái trống.`
    );
    
    if (confirmCancel && onCancel) {
      onCancel(seat.id);
      onClose();
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Thông tin ghế {seat.id}
            {seat.status === "pending_confirmation" && (
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                Chờ xác nhận
              </Badge>
            )}
            {seat.status === "confirmed" && (
              <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                Đã xác nhận
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Chi tiết khách hàng đã đặt ghế này
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="bg-blue-50 p-4 rounded-lg space-y-3">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-xs text-blue-700">Họ tên</p>
                <p className="font-medium text-blue-900">{seat.passengerName}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-xs text-blue-700">Số điện thoại</p>
                <p className="font-medium text-blue-900">{seat.passengerPhone}</p>
              </div>
            </div>

            {seat.pickupLocation && (
              <div className="flex items-start gap-3 pt-3 border-t border-blue-200">
                <MapPin className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-blue-700">Vị trí đón</p>
                  {seat.pickupLocation.address && (
                    <p className="font-medium text-blue-900">{seat.pickupLocation.address}</p>
                  )}
                  {seat.pickupLocation.gpsCoords && (
                    <p className="text-xs text-blue-600 mt-1">
                      📍 GPS: {seat.pickupLocation.gpsCoords.lat.toFixed(6)}, {seat.pickupLocation.gpsCoords.lng.toFixed(6)}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Đánh giá khách hàng từ các chuyến trước */}
          {seat.passengerId && (
            <div className="border rounded-lg p-4 bg-white space-y-3">
              <h4 className="font-medium text-sm text-gray-900">Đánh giá từ các tài xế khác</h4>
              <RatingStats reviews={passengerReviews} />
              {passengerReviews.length > 0 && (
                <>
                  <div className="max-h-[200px] overflow-y-auto">
                    <ReviewsList reviews={passengerReviews.slice(0, 3)} />
                  </div>
                  {passengerReviews.length > 3 && (
                    <p className="text-xs text-muted-foreground text-center">
                      Và {passengerReviews.length - 3} đánh giá khác...
                    </p>
                  )}
                </>
              )}
            </div>
          )}

          <div className="bg-muted p-3 rounded-lg">
            <p className="text-sm">
              <strong>Giá vé:</strong> {formatPrice(pricePerSeat)}
            </p>
          </div>

          {seat.status === "confirmed" && (
            <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
              <p className="text-sm text-green-800 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Đặt chỗ đã được xác nhận
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0 flex-wrap">
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
          <Button
            variant="outline"
            onClick={handleCall}
            className="gap-2"
          >
            <Phone className="h-4 w-4" />
            Gọi ngay
          </Button>
          {seat.pickupLocation && (seat.pickupLocation.address || seat.pickupLocation.gpsCoords) && (
            <Button
              variant="outline"
              onClick={handleOpenMaps}
              className="gap-2 bg-green-50 hover:bg-green-100 border-green-200"
            >
              <Navigation className="h-4 w-4" />
              🗺️ Chỉ đường
            </Button>
          )}
          {(seat.status === "pending_confirmation" || seat.status === "confirmed") && onCancel && (
            <Button 
              variant="destructive" 
              onClick={handleCancel}
              className="gap-2"
            >
              <XCircle className="h-4 w-4" />
              Hủy đặt chỗ
            </Button>
          )}
          {seat.status === "pending_confirmation" && onConfirm && (
            <Button onClick={handleConfirm} className="gap-2">
              <CheckCircle className="h-4 w-4" />
              Xác nhận
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
