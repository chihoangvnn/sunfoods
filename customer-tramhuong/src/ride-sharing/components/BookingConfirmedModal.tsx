'use client'

import { CheckCircle, Phone, X } from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface BookingConfirmedModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: {
    driverName: string;
    driverPhone: string;
    vehicleModel: string;
    licensePlate: string;
    pickupLocation: string;
    dropoffLocation: string;
    quotedPrice: number;
    estimatedPickupTime?: number;
  };
}

export function BookingConfirmedModal({ isOpen, onClose, booking }: BookingConfirmedModalProps) {
  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)}M`;
    } else if (price >= 1000) {
      return `${(price / 1000).toFixed(0)}K`;
    }
    return `${price}`;
  };

  const handleCallDriver = () => {
    window.location.href = `tel:${booking.driverPhone}`;
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Đóng"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>

          <div className="p-6">
            <div className="flex flex-col items-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Đã xác nhận!</h2>
              <p className="text-gray-600 text-center">Tài xế sẽ liên hệ với bạn sớm</p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Thông tin tài xế</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tên tài xế:</span>
                    <span className="font-semibold text-gray-900">{booking.driverName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Số điện thoại:</span>
                    <a 
                      href={`tel:${booking.driverPhone}`}
                      className="font-semibold text-green-600 hover:text-green-700"
                    >
                      {booking.driverPhone}
                    </a>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Xe:</span>
                    <span className="font-semibold text-gray-900">{booking.vehicleModel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Biển số:</span>
                    <span className="font-semibold text-gray-900">{booking.licensePlate}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Chuyến đi</h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-gray-600 text-sm">Điểm đón:</span>
                    <p className="font-medium text-gray-900">{booking.pickupLocation}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 text-sm">Điểm trả:</span>
                    <p className="font-medium text-gray-900">{booking.dropoffLocation}</p>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                    <span className="text-gray-600">Giá:</span>
                    <span className="text-2xl font-bold text-green-600">{formatPrice(booking.quotedPrice)}đ</span>
                  </div>
                </div>
              </div>

              {booking.estimatedPickupTime && (
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <p className="text-sm text-blue-800">
                    <span className="font-semibold">Thời gian đón dự kiến:</span> {booking.estimatedPickupTime} phút
                  </p>
                </div>
              )}

              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                <p className="text-sm text-yellow-800">
                  <span className="font-semibold">Lưu ý:</span> Vui lòng có mặt đúng giờ tại điểm đón. Tài xế sẽ liên hệ nếu có thay đổi.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleCallDriver}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-6 text-lg"
              >
                <Phone className="h-5 w-5 mr-2" />
                Gọi tài xế
              </Button>
              <Button
                onClick={onClose}
                variant="outline"
                className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 py-6 text-lg"
              >
                Đóng
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
