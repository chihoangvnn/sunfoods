'use client'

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { ArrowLeft, Route } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { calculateDistance, formatDistance } from '@/lib/distanceCalculator';

const CenterPinMapPicker = dynamic(() => import('@/components/CenterPinMapPicker').then(mod => ({ default: mod.CenterPinMapPicker })), {
  ssr: false,
  loading: () => (
    <div className="h-[280px] bg-gray-100 rounded-lg border-2 border-gray-300 flex items-center justify-center">
      <p className="text-gray-500">Đang tải bản đồ...</p>
    </div>
  ),
});

const LocationInput = dynamic(() => import('@/components/LocationInput').then(mod => ({ default: mod.LocationInput })), {
  ssr: false,
  loading: () => (
    <div className="h-[80px] bg-gray-100 rounded-lg border-2 border-gray-300 flex items-center justify-center">
      <p className="text-gray-500">Đang tải...</p>
    </div>
  ),
});

export default function BookRidePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [pickupLocation, setPickupLocation] = useState('');
  const [pickupLat, setPickupLat] = useState<number | null>(null);
  const [pickupLng, setPickupLng] = useState<number | null>(null);

  const [dropoffLocation, setDropoffLocation] = useState('');
  const [dropoffLat, setDropoffLat] = useState<number | null>(null);
  const [dropoffLng, setDropoffLng] = useState<number | null>(null);

  const [customerNotes, setCustomerNotes] = useState('');

  const distance = useMemo(() => {
    if (pickupLat && pickupLng && dropoffLat && dropoffLng) {
      return calculateDistance(pickupLat, pickupLng, dropoffLat, dropoffLng);
    }
    return null;
  }, [pickupLat, pickupLng, dropoffLat, dropoffLng]);

  const handlePickupLocationSelect = (address: string, lat: number, lng: number) => {
    setPickupLocation(address);
    setPickupLat(lat);
    setPickupLng(lng);
  };

  const handleDropoffLocationSelect = (address: string, lat: number, lng: number) => {
    setDropoffLocation(address);
    setDropoffLat(lat);
    setDropoffLng(lng);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!pickupLocation.trim()) {
      setError('Vui lòng nhập điểm đón');
      return;
    }

    if (!dropoffLocation.trim()) {
      setError('Vui lòng nhập điểm trả');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/ride-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pickupLocation,
          pickupLat,
          pickupLng,
          dropoffLocation,
          dropoffLat,
          dropoffLng,
          customerNotes: customerNotes.trim() || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        
        if (response.status === 409 && data.requiresPhoneUpdate) {
          setError('⚠️ ' + data.error);
          setTimeout(() => {
            router.push('/profile');
          }, 2000);
          return;
        }
        
        throw new Error(data.error || 'Không thể tạo yêu cầu');
      }

      const newRequest = await response.json();
      router.push(`/datxe/ride-request/${newRequest.id}`);
    } catch (err: any) {
      console.error('Error creating ride request:', err);
      setError(err.message || 'Đã xảy ra lỗi. Vui lòng thử lại.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-green-600 text-white p-4 sticky top-0 z-10 shadow-md">
        <div className="flex items-center gap-3">
          <Link href="/datxe" className="hover:bg-green-700 p-2 rounded-lg transition-colors -ml-2">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-xl font-bold">Đặt xe</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4">
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <CenterPinMapPicker
                onLocationSelect={handlePickupLocationSelect}
                initialCenter={pickupLat && pickupLng ? [pickupLat, pickupLng] : [16.0544, 108.2022]}
                label="📍 Điểm đón"
              />
            </div>

            {distance !== null && (
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-center gap-3">
                  <Route className="h-6 w-6 text-green-600" />
                  <div>
                    <p className="text-xs text-green-700 font-medium">Khoảng cách</p>
                    <p className="text-2xl font-bold text-green-900">~{formatDistance(distance)}</p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <LocationInput
                label="🎯 Điểm đến"
                placeholder="Nhập địa chỉ hoặc chia sẻ vị trí..."
                onLocationSelect={handleDropoffLocationSelect}
                initialValue={dropoffLocation}
                biasLat={pickupLat}
                biasLng={pickupLng}
                biasAddress={pickupLocation}
              />
            </div>

            <div>
              <Label htmlFor="customerNotes" className="text-base font-semibold mb-2">
                Ghi chú (không bắt buộc)
              </Label>
              <Textarea
                id="customerNotes"
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
                placeholder="Thêm ghi chú cho tài xế (ví dụ: số hành lý, yêu cầu đặc biệt...)"
                className="min-h-[100px] text-base"
                rows={4}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-6 text-lg"
            >
              {isSubmitting ? 'Đang tạo yêu cầu...' : 'Tạo yêu cầu'}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Cách thức hoạt động</h3>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>Tạo yêu cầu đặt xe với điểm đón và điểm trả</li>
                <li>Tài xế sẽ gửi báo giá cho bạn</li>
                <li>Chọn tài xế phù hợp nhất</li>
                <li>Liên hệ và hoàn thành chuyến đi</li>
              </ol>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
