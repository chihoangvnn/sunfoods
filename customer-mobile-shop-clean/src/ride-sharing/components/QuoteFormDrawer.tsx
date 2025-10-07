'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MapPin, Clock, Lightbulb, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RideRequest {
  id: string;
  pickupLocation: string;
  dropoffLocation: string;
  customerNotes?: string | null;
  estimatedDistance?: number | null;
}

interface QuoteFormDrawerProps {
  request: RideRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface PricingStats {
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
  sampleSize: number;
}

export function QuoteFormDrawer({ request, open, onOpenChange, onSuccess }: QuoteFormDrawerProps) {
  const router = useRouter();
  const [quotedPrice, setQuotedPrice] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [message, setMessage] = useState('');
  const [estimatedPickupTime, setEstimatedPickupTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pricingStats, setPricingStats] = useState<PricingStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open && request) {
      setLoadingStats(true);
      fetch(`/api/pricing/suggestions?pickupLocation=${encodeURIComponent(request.pickupLocation)}&dropoffLocation=${encodeURIComponent(request.dropoffLocation)}`)
        .then(res => res.json())
        .then(data => {
          if (data.sampleSize > 0) {
            setPricingStats(data);
          } else {
            setPricingStats(null);
          }
        })
        .catch(error => {
          console.error('Failed to fetch pricing suggestions:', error);
          setPricingStats(null);
        })
        .finally(() => {
          setLoadingStats(false);
        });
    }
  }, [open, request]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!request || !quotedPrice) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng nhập giá báo',
        variant: 'destructive',
      });
      return;
    }

    const price = parseInt(quotedPrice);
    if (isNaN(price) || price <= 0) {
      toast({
        title: 'Lỗi',
        description: 'Giá báo phải là số dương',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/ride-requests/${request.id}/quotes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quotedPrice: price,
          vehicleModel: vehicleModel || null,
          licensePlate: licensePlate || null,
          message: message || null,
          estimatedPickupTime: estimatedPickupTime ? parseInt(estimatedPickupTime) : null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        
        if (response.status === 409 && data.requiresPhoneUpdate) {
          toast({
            title: '⚠️ Cần cập nhật số điện thoại',
            description: data.error || 'Vui lòng cập nhật số điện thoại để báo giá',
            variant: 'destructive',
          });
          onOpenChange(false);
          setTimeout(() => {
            router.push('/profile');
          }, 1500);
          return;
        }
        
        throw new Error(data.error || 'Failed to submit quote');
      }

      toast({
        title: 'Thành công',
        description: 'Đã gửi báo giá thành công',
      });

      setQuotedPrice('');
      setVehicleModel('');
      setLicensePlate('');
      setMessage('');
      setEstimatedPickupTime('');
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      console.error('Error submitting quote:', error);
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể gửi báo giá',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  if (!request) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Báo giá giao dịch</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Request Details */}
          <div className="bg-gray-50 rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-blue-600" />
              <span className="font-medium">{request.pickupLocation}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-orange-600" />
              <span className="font-medium">{request.dropoffLocation}</span>
            </div>
            {request.estimatedDistance && (
              <p className="text-xs text-gray-600">~{request.estimatedDistance} km</p>
            )}
            {request.customerNotes && (
              <div className="bg-yellow-50 border border-yellow-200 rounded p-2 mt-2">
                <p className="text-xs text-yellow-800">
                  <span className="font-semibold">Ghi chú:</span> {request.customerNotes}
                </p>
              </div>
            )}
          </div>

          {/* Pricing Suggestions */}
          {loadingStats ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-600">Đang tải dữ liệu giá...</p>
            </div>
          ) : pricingStats ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-blue-600" />
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">Giá TB route này:</span> {formatVND(pricingStats.avgPrice)} (từ {pricingStats.sampleSize} chuyến)
                </p>
              </div>
              {pricingStats.sampleSize >= 3 && (
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-gray-500" />
                  <p className="text-xs text-gray-600">
                    <span className="font-medium">Quotes cạnh tranh:</span> {formatVND(pricingStats.minPrice)} - {formatVND(pricingStats.maxPrice)}
                  </p>
                </div>
              )}
            </div>
          ) : open && !loadingStats ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-600">📊 Chưa có dữ liệu giá cho route này</p>
            </div>
          ) : null}

          {/* Form Fields */}
          <div className="space-y-3">
            <div>
              <Label htmlFor="quotedPrice" className="text-sm font-medium">
                Giá báo (VND) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="quotedPrice"
                type="number"
                value={quotedPrice}
                onChange={(e) => setQuotedPrice(e.target.value)}
                placeholder="Nhập giá..."
                className="mt-1"
                required
              />
              {quotedPrice && !isNaN(parseInt(quotedPrice)) && (
                <p className="text-xs text-gray-500 mt-1">
                  {formatVND(parseInt(quotedPrice))}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="vehicleModel" className="text-sm font-medium">
                Loại xe
              </Label>
              <Input
                id="vehicleModel"
                value={vehicleModel}
                onChange={(e) => setVehicleModel(e.target.value)}
                placeholder="VD: Honda City"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="licensePlate" className="text-sm font-medium">
                Biển số xe
              </Label>
              <Input
                id="licensePlate"
                value={licensePlate}
                onChange={(e) => setLicensePlate(e.target.value)}
                placeholder="VD: 51A-12345"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="estimatedPickupTime" className="text-sm font-medium">
                Thời gian đón (phút)
              </Label>
              <Input
                id="estimatedPickupTime"
                type="number"
                value={estimatedPickupTime}
                onChange={(e) => setEstimatedPickupTime(e.target.value)}
                placeholder="VD: 15"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="message" className="text-sm font-medium">
                Lời nhắn cho khách
              </Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="VD: Tôi đang ở gần đây, có thể đón ngay..."
                className="mt-1"
                rows={3}
              />
            </div>
          </div>

          {/* Preview */}
          {quotedPrice && !isNaN(parseInt(quotedPrice)) && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-800">
                Bạn đang báo giá <span className="font-bold">{formatVND(parseInt(quotedPrice))}</span> cho chuyến đi{' '}
                <span className="font-semibold">{request.pickupLocation}</span> →{' '}
                <span className="font-semibold">{request.dropoffLocation}</span>
              </p>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700"
            disabled={isSubmitting || !quotedPrice}
          >
            {isSubmitting ? 'Đang gửi...' : 'Gửi báo giá'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
