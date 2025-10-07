'use client'

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Phone, User, MapPin, Loader2, CheckCircle2, Plus } from "lucide-react";

interface PickupLocation {
  address?: string;
  gpsCoords?: {
    lat: number;
    lng: number;
  };
}

interface PhoneInputDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (name: string, phone: string, pickupLocation?: PickupLocation) => void;
  seatId: string;
  pricePerSeat: number;
}

export default function PhoneInputDialog({
  open,
  onClose,
  onSubmit,
  seatId,
  pricePerSeat
}: PhoneInputDialogProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState({ name: "", phone: "" });
  
  const [showLocationSection, setShowLocationSection] = useState(false);
  const [pickupAddress, setPickupAddress] = useState("");
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState("");

  const validatePhone = (phoneNumber: string) => {
    const phoneRegex = /^(0|\+84)[0-9]{9}$/;
    return phoneRegex.test(phoneNumber.replace(/\s/g, ""));
  };

  const handleShareGPS = () => {
    if (!navigator.geolocation) {
      setLocationError("Trình duyệt không hỗ trợ GPS");
      return;
    }

    setIsGettingLocation(true);
    setLocationError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setGpsCoords(coords);
        setIsGettingLocation(false);
        setPickupAddress(`GPS: ${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`);
      },
      (error) => {
        setIsGettingLocation(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError("Bạn đã từ chối quyền truy cập vị trí");
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError("Không thể lấy vị trí hiện tại");
            break;
          case error.TIMEOUT:
            setLocationError("Hết thời gian chờ GPS");
            break;
          default:
            setLocationError("Lỗi không xác định");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const handleSubmit = () => {
    const newErrors = { name: "", phone: "" };

    if (!name.trim()) {
      newErrors.name = "Vui lòng nhập họ tên";
    }

    if (!phone.trim()) {
      newErrors.phone = "Vui lòng nhập số điện thoại";
    } else if (!validatePhone(phone)) {
      newErrors.phone = "Số điện thoại không hợp lệ";
    }

    if (newErrors.name || newErrors.phone) {
      setErrors(newErrors);
      return;
    }

    const pickupLocation: PickupLocation | undefined = showLocationSection && (pickupAddress || gpsCoords)
      ? {
          address: pickupAddress || undefined,
          gpsCoords: gpsCoords || undefined
        }
      : undefined;

    onSubmit(name, phone, pickupLocation);
    setName("");
    setPhone("");
    setErrors({ name: "", phone: "" });
    setShowLocationSection(false);
    setPickupAddress("");
    setGpsCoords(null);
    setLocationError("");
  };

  const handleClose = () => {
    setName("");
    setPhone("");
    setErrors({ name: "", phone: "" });
    setShowLocationSection(false);
    setPickupAddress("");
    setGpsCoords(null);
    setLocationError("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Đặt ghế {seatId}</DialogTitle>
          <DialogDescription>
            Vui lòng nhập thông tin để đặt ghế. Tài xế sẽ gọi điện xác nhận trong ít phút.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">
              <User className="inline h-4 w-4 mr-1" />
              Họ và tên
            </Label>
            <Input
              id="name"
              placeholder="Nguyễn Văn A"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors({ ...errors, name: "" });
              }}
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="phone">
              <Phone className="inline h-4 w-4 mr-1" />
              Số điện thoại
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="0901234567"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (errors.phone) setErrors({ ...errors, phone: "" });
              }}
              className={errors.phone ? "border-red-500" : ""}
            />
            {errors.phone && (
              <p className="text-sm text-red-500">{errors.phone}</p>
            )}
          </div>

          <Button
            type="button"
            variant={showLocationSection ? "default" : "outline"}
            className="w-full justify-start"
            onClick={() => setShowLocationSection(!showLocationSection)}
          >
            <Plus className={`h-4 w-4 mr-2 transition-transform ${showLocationSection ? 'rotate-45' : ''}`} />
            {showLocationSection ? "Ẩn vị trí đón" : "Thêm vị trí đón"}
          </Button>

          {showLocationSection && (
            <div className="grid gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="grid gap-2">
                <Label htmlFor="pickup-address">
                  <MapPin className="inline h-4 w-4 mr-1" />
                  Vị trí đón (tùy chọn)
                </Label>
                <Input
                  id="pickup-address"
                  placeholder="Ví dụ: Ngã 3 Tiên Kỳ, Trước chợ..."
                  value={pickupAddress}
                  onChange={(e) => {
                    setPickupAddress(e.target.value);
                    setLocationError("");
                  }}
                  disabled={isGettingLocation}
                />
              </div>

              <div className="flex items-center gap-2">
                <div className="h-[1px] bg-green-300 flex-1"></div>
                <span className="text-xs text-green-600">hoặc</span>
                <div className="h-[1px] bg-green-300 flex-1"></div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleShareGPS}
                disabled={isGettingLocation}
              >
                {isGettingLocation ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Đang lấy vị trí...
                  </>
                ) : gpsCoords ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
                    Đã có GPS chính xác
                  </>
                ) : (
                  <>
                    <MapPin className="h-4 w-4 mr-2" />
                    📍 Share vị trí GPS
                  </>
                )}
              </Button>

              {locationError && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <span className="text-red-500">⚠️</span>
                  {locationError}
                </p>
              )}

              {gpsCoords && (
                <p className="text-xs text-green-700">
                  ✓ GPS: {gpsCoords.lat.toFixed(6)}, {gpsCoords.lng.toFixed(6)}
                </p>
              )}
            </div>
          )}

          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>Giá vé:</strong> {pricePerSeat.toLocaleString("vi-VN")} VNĐ
            </p>
            <p className="text-xs text-blue-700 mt-1">
              Tài xế sẽ gọi điện xác nhận và thông báo điểm đón
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose}>
            Hủy
          </Button>
          <Button onClick={handleSubmit}>
            Đặt ghế ngay
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
