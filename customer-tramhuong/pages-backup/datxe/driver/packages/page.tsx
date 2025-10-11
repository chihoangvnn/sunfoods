'use client'

import { useState, useEffect } from 'react';
import { Package, MapPin, Weight, Send, X, Clock, Loader2, AlertCircle, EyeOff } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface PackageItem {
  id: string;
  pickupLocation: string;
  dropoffLocation: string;
  estimatedDistance: number | null;
  weight: number | null;
  suggestedPrice: number;
  pickupTime: string | null;
  deliveryNote: string | null;
  createdAt: string;
}

function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}

function formatDistance(distance: number | null): string {
  if (!distance) return 'N/A';
  return `${distance.toFixed(1)}km`;
}

function formatWeight(weight: number | null): string {
  if (!weight) return 'N/A';
  return `${weight}kg`;
}

function formatPickupTime(pickupTime: string | null): string {
  if (!pickupTime) return 'Chưa xác định';
  try {
    const date = new Date(pickupTime);
    return date.toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit'
    });
  } catch {
    return pickupTime;
  }
}

export default function DriverPackagesPage() {
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bidPackage, setBidPackage] = useState<PackageItem | null>(null);
  const [bidPrice, setBidPrice] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [bidError, setBidError] = useState<string | null>(null);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/ride-requests/available');
      
      if (!response.ok) {
        throw new Error('Không thể tải danh sách đơn hàng');
      }
      
      const data = await response.json();
      setPackages(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
      setPackages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const totalAvailable = packages.length;
  const totalValue = packages.reduce((sum, p) => sum + p.suggestedPrice, 0);

  const handleBid = (pkg: PackageItem) => {
    setBidPackage(pkg);
    setBidPrice(pkg.suggestedPrice.toString());
    setBidError(null);
  };

  const confirmBid = async () => {
    if (!bidPackage || !bidPrice) return;
    
    try {
      setSubmitting(true);
      setBidError(null);
      
      const response = await fetch(`/api/ride-requests/${bidPackage.id}/quotes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quotedPrice: parseFloat(bidPrice),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Không thể gửi báo giá');
      }

      setBidPackage(null);
      setBidPrice('');
      await fetchPackages();
    } catch (err) {
      setBidError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pb-6">
      {/* Stats Card */}
      <Card className="border-none shadow-md m-4">
        <CardContent className="p-4">
          <div className="flex items-center justify-around">
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Đơn khả dụng</p>
              <p className="text-3xl font-bold text-blue-600">{totalAvailable}</p>
            </div>
            <div className="h-12 w-px bg-gray-200"></div>
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Tổng giá trị</p>
              <p className="text-xl font-bold text-green-600">{formatVND(totalValue)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <Card className="m-4 border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-900">{error}</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={fetchPackages}
                className="border-red-300 text-red-700 hover:bg-red-100"
              >
                Thử lại
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Packages Grid */}
      {!loading && !error && (
        <div className="px-4 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {packages.length === 0 ? (
            <Card className="col-span-full border-none shadow-md">
              <CardContent className="p-12 text-center">
                <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Không có đơn hàng
                </h3>
                <p className="text-gray-600">
                  Chưa có đơn hàng khả dụng
                </p>
              </CardContent>
            </Card>
          ) : (
            packages.map((pkg) => (
              <Card key={pkg.id} className="border-none shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-3">
                  {/* Price - Hero */}
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-sm font-medium text-gray-600">#{pkg.id}</span>
                    <span className="text-2xl font-bold text-green-600">
                      {formatVND(pkg.suggestedPrice)}
                    </span>
                  </div>

                  {/* Route */}
                  <div className="space-y-1.5 mb-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-blue-600 flex-shrink-0" />
                      <span className="text-sm text-gray-900 font-medium truncate">{pkg.pickupLocation}</span>
                    </div>
                    <div className="h-4 w-px bg-gray-300 ml-1.5"></div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-orange-600 flex-shrink-0" />
                      <span className="text-sm text-gray-900 font-medium truncate">{pkg.dropoffLocation}</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-2 pb-2 border-t pt-2">
                    <div className="flex items-center gap-1">
                      <Weight className="h-3 w-3" />
                      <span>{formatWeight(pkg.weight)}</span>
                    </div>
                    <span>{formatDistance(pkg.estimatedDistance)}</span>
                  </div>

                  {/* Privacy Info - Hidden sender details */}
                  <div className="mb-2 pb-2 border-t pt-2">
                    <div className="flex items-center gap-1.5 text-xs bg-gray-50 rounded p-2">
                      <EyeOff className="h-3 w-3 text-gray-500" />
                      <span className="text-gray-600">Thông tin người gửi: <span className="font-medium">Ẩn đến khi chấp nhận</span></span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs mt-1">
                      <Clock className="h-3 w-3 text-gray-500" />
                      <span className="text-gray-700">Lấy: {formatPickupTime(pkg.pickupTime)}</span>
                    </div>
                  </div>

                  {/* Delivery Note */}
                  {pkg.deliveryNote && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded px-2 py-1 mb-3">
                      <p className="text-xs text-yellow-800">
                        <span className="font-semibold">Lưu ý:</span> {pkg.deliveryNote}
                      </p>
                    </div>
                  )}

                  {/* Bid Button */}
                  <Button
                    size="sm"
                    onClick={() => handleBid(pkg)}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <Send className="h-4 w-4 mr-1" />
                    Báo giá
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Quick Bid Drawer */}
      {bidPackage && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end" onClick={() => setBidPackage(null)}>
          <div className="bg-white w-full rounded-t-2xl p-6 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Báo giá giao hàng</h3>
              <button onClick={() => setBidPackage(null)} className="text-gray-500">
                <X className="h-5 w-5" />
              </button>
            </div>

            {bidError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-800">{bidError}</p>
              </div>
            )}

            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                <div>
                  <p className="text-xs text-gray-500">Mã đơn</p>
                  <p className="font-semibold text-gray-900">#{bidPackage.id}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Tuyến đường</p>
                  <p className="font-medium">{bidPackage.pickupLocation} → {bidPackage.dropoffLocation}</p>
                  <p className="text-xs text-gray-600">{formatDistance(bidPackage.estimatedDistance)} • {formatWeight(bidPackage.weight)}</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded p-2">
                  <div className="flex items-center gap-1.5 text-xs">
                    <EyeOff className="h-3 w-3 text-blue-600" />
                    <span className="text-blue-800 font-medium">Thông tin người gửi sẽ hiển thị sau khi báo giá được chấp nhận</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Thời gian lấy hàng</p>
                  <p className="font-medium">{formatPickupTime(bidPackage.pickupTime)}</p>
                </div>
                {bidPackage.deliveryNote && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
                    <p className="text-xs text-yellow-800">
                      <span className="font-semibold">Lưu ý:</span> {bidPackage.deliveryNote}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm text-gray-600 mb-1 block">Giá bạn muốn nhận (đ)</label>
                <input
                  type="number"
                  value={bidPrice}
                  onChange={(e) => setBidPrice(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Nhập giá..."
                  disabled={submitting}
                />
                <p className="text-xs text-gray-500 mt-1">Giá đề xuất: {formatVND(bidPackage.suggestedPrice)}</p>
              </div>

              <Button
                onClick={confirmBid}
                disabled={!bidPrice || submitting}
                className="w-full bg-green-600 hover:bg-green-700 h-12"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Đang gửi...
                  </>
                ) : (
                  'Xác nhận báo giá'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
