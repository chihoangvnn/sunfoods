'use client'

import { useState, useEffect } from 'react';
import { Package, MapPin, Weight, Clock, Loader2, AlertCircle, User, Phone, Car, MessageSquare, CheckCircle, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface DriverQuote {
  id: string;
  rideRequestId: string;
  driverId: string;
  quotedPrice: number;
  vehicleModel: string | null;
  licensePlate: string | null;
  seatType: number | null;
  message: string | null;
  estimatedPickupTime: number | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  driverName: string | null;
  driverPhone: string | null;
  driverAvatar: string | null;
}

interface PackageRequest {
  id: string;
  customerId: string;
  type: string;
  pickupLocation: string;
  dropoffLocation: string;
  estimatedDistance: number | null;
  senderName: string | null;
  senderPhone: string | null;
  weight: string | null;
  suggestedPrice: number | null;
  pickupTime: string | null;
  deliveryNote: string | null;
  status: string;
  acceptedQuoteId: string | null;
  createdAt: string;
  quotes: DriverQuote[];
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

function formatEstimatedPickup(estimatedMinutes: number | null): string {
  if (!estimatedMinutes) return 'Chưa xác định';
  if (estimatedMinutes < 60) {
    return `~${estimatedMinutes} phút`;
  }
  const hours = Math.floor(estimatedMinutes / 60);
  const minutes = estimatedMinutes % 60;
  return minutes > 0 ? `~${hours}h${minutes}p` : `~${hours}h`;
}

function getStatusBadge(status: string, quotesCount: number) {
  if (status === 'accepted') {
    return <Badge className="bg-green-600 text-white">Đã chấp nhận</Badge>;
  }
  if (status === 'quoted' || quotesCount > 0) {
    return <Badge className="bg-blue-600 text-white">Có báo giá ({quotesCount})</Badge>;
  }
  if (status === 'pending') {
    return <Badge className="bg-yellow-600 text-white">Chờ báo giá</Badge>;
  }
  if (status === 'completed') {
    return <Badge className="bg-gray-600 text-white">Hoàn thành</Badge>;
  }
  if (status === 'cancelled') {
    return <Badge className="bg-red-600 text-white">Đã hủy</Badge>;
  }
  return <Badge variant="outline">{status}</Badge>;
}

export default function MyPackagesPage() {
  const [packages, setPackages] = useState<PackageRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedPackage, setExpandedPackage] = useState<string | null>(null);
  const [acceptingQuote, setAcceptingQuote] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/ride-requests/my-packages');
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Vui lòng đăng nhập để xem đơn hàng');
        }
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

  const handleAcceptQuote = async (packageId: string, quoteId: string) => {
    try {
      setAcceptingQuote(quoteId);
      setSuccessMessage(null);
      
      const response = await fetch(`/api/ride-requests/${packageId}/accept-quote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quoteId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Không thể chấp nhận báo giá');
      }

      setSuccessMessage('Đã chấp nhận báo giá thành công!');
      await fetchPackages();
      
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
      setTimeout(() => setError(null), 5000);
    } finally {
      setAcceptingQuote(null);
    }
  };

  const togglePackageExpansion = (packageId: string) => {
    setExpandedPackage(expandedPackage === packageId ? null : packageId);
  };

  const activePackages = packages.filter(p => p.status !== 'completed' && p.status !== 'cancelled');
  const completedPackages = packages.filter(p => p.status === 'completed' || p.status === 'cancelled');

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-6 w-6" />
            <div>
              <h1 className="text-xl font-bold">Đơn Giao Hàng</h1>
              <p className="text-sm text-green-100">Quản lý gửi hàng của bạn</p>
            </div>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={fetchPackages}
            className="text-white hover:bg-green-800"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {successMessage && (
        <div className="m-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
          <p className="text-sm text-green-800">{successMessage}</p>
        </div>
      )}

      {error && !loading && (
        <div className="m-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        </div>
      )}

      {!loading && !error && packages.length === 0 && (
        <Card className="m-4 border-none shadow-md">
          <CardContent className="p-12 text-center">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Chưa có đơn giao hàng
            </h3>
            <p className="text-gray-600 mb-4">
              Bạn chưa tạo đơn giao hàng nào
            </p>
            <Button 
              onClick={() => window.location.href = '/datxe/send-package'}
              className="bg-green-600 hover:bg-green-700"
            >
              Gửi hàng ngay
            </Button>
          </CardContent>
        </Card>
      )}

      {!loading && activePackages.length > 0 && (
        <div className="p-4 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Đơn hàng đang giao</h2>
          {activePackages.map((pkg) => {
            const acceptedQuote = pkg.quotes.find(q => q.id === pkg.acceptedQuoteId);
            const isExpanded = expandedPackage === pkg.id;
            
            return (
              <Card key={pkg.id} className="border-none shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusBadge(pkg.status, pkg.quotes.length)}
                        <span className="text-xs text-gray-500">#{pkg.id.slice(0, 8)}</span>
                      </div>
                    </div>
                    {pkg.suggestedPrice && (
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Giá đề xuất</p>
                        <p className="text-lg font-bold text-green-600">{formatVND(pkg.suggestedPrice)}</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 mb-3">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-500">Lấy hàng</p>
                        <p className="text-sm font-medium text-gray-900">{pkg.pickupLocation}</p>
                      </div>
                    </div>
                    <div className="h-4 w-px bg-gray-300 ml-2"></div>
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-orange-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-500">Giao hàng</p>
                        <p className="text-sm font-medium text-gray-900">{pkg.dropoffLocation}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-gray-600 pb-3 border-b">
                    {pkg.weight && (
                      <div className="flex items-center gap-1">
                        <Weight className="h-3 w-3" />
                        <span>{pkg.weight}</span>
                      </div>
                    )}
                    {pkg.estimatedDistance && (
                      <span>{formatDistance(pkg.estimatedDistance)}</span>
                    )}
                    {pkg.pickupTime && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatPickupTime(pkg.pickupTime)}</span>
                      </div>
                    )}
                  </div>

                  {pkg.deliveryNote && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded px-2 py-2 mt-3">
                      <p className="text-xs text-yellow-800">
                        <span className="font-semibold">Ghi chú:</span> {pkg.deliveryNote}
                      </p>
                    </div>
                  )}

                  {acceptedQuote && (
                    <div className="bg-green-50 border-2 border-green-500 rounded-lg p-3 mt-3">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <h3 className="font-semibold text-green-900">Đã chọn tài xế</h3>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-green-700" />
                          <span className="text-sm font-medium text-green-900">{acceptedQuote.driverName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-green-700" />
                          <a href={`tel:${acceptedQuote.driverPhone}`} className="text-sm text-green-900 underline">
                            {acceptedQuote.driverPhone}
                          </a>
                        </div>
                        {acceptedQuote.vehicleModel && (
                          <div className="flex items-center gap-2">
                            <Car className="h-4 w-4 text-green-700" />
                            <span className="text-sm text-green-900">
                              {acceptedQuote.vehicleModel}
                              {acceptedQuote.licensePlate && ` - ${acceptedQuote.licensePlate}`}
                            </span>
                          </div>
                        )}
                        <div className="pt-2 border-t border-green-200">
                          <p className="text-xs text-green-700">Giá đã thỏa thuận</p>
                          <p className="text-xl font-bold text-green-900">{formatVND(acceptedQuote.quotedPrice)}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {!acceptedQuote && pkg.quotes.length > 0 && (
                    <div className="mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => togglePackageExpansion(pkg.id)}
                        className="w-full"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="h-4 w-4 mr-1" />
                            Ẩn báo giá ({pkg.quotes.length})
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-4 w-4 mr-1" />
                            Xem báo giá ({pkg.quotes.length})
                          </>
                        )}
                      </Button>

                      {isExpanded && (
                        <div className="mt-3 space-y-3">
                          {pkg.quotes.map((quote) => (
                            <div key={quote.id} className="border border-gray-200 rounded-lg p-3 bg-white">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <User className="h-4 w-4 text-gray-600" />
                                    <span className="font-semibold text-gray-900">{quote.driverName}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Phone className="h-3 w-3" />
                                    <span>{quote.driverPhone}</span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs text-gray-500">Giá báo</p>
                                  <p className="text-xl font-bold text-blue-600">{formatVND(quote.quotedPrice)}</p>
                                </div>
                              </div>

                              {quote.vehicleModel && (
                                <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                                  <Car className="h-4 w-4" />
                                  <span>
                                    {quote.vehicleModel}
                                    {quote.licensePlate && ` - ${quote.licensePlate}`}
                                  </span>
                                </div>
                              )}

                              {quote.estimatedPickupTime && (
                                <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                                  <Clock className="h-4 w-4" />
                                  <span>Có thể đến sau {formatEstimatedPickup(quote.estimatedPickupTime)}</span>
                                </div>
                              )}

                              {quote.message && (
                                <div className="bg-blue-50 border border-blue-200 rounded px-2 py-2 mb-2">
                                  <div className="flex items-start gap-1">
                                    <MessageSquare className="h-3 w-3 text-blue-600 mt-0.5 flex-shrink-0" />
                                    <p className="text-xs text-blue-800">{quote.message}</p>
                                  </div>
                                </div>
                              )}

                              <Button
                                size="sm"
                                onClick={() => handleAcceptQuote(pkg.id, quote.id)}
                                disabled={acceptingQuote === quote.id}
                                className="w-full bg-green-600 hover:bg-green-700"
                              >
                                {acceptingQuote === quote.id ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Đang xử lý...
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Chấp nhận
                                  </>
                                )}
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {!acceptedQuote && pkg.quotes.length === 0 && pkg.status === 'pending' && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg text-center">
                      <Loader2 className="h-5 w-5 text-blue-600 mx-auto mb-2 animate-spin" />
                      <p className="text-sm text-blue-800">Đang chờ tài xế báo giá...</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {!loading && completedPackages.length > 0 && (
        <div className="p-4 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Lịch sử</h2>
          {completedPackages.map((pkg) => {
            const acceptedQuote = pkg.quotes.find(q => q.id === pkg.acceptedQuoteId);
            
            return (
              <Card key={pkg.id} className="border-none shadow-sm opacity-75">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusBadge(pkg.status, pkg.quotes.length)}
                        <span className="text-xs text-gray-500">#{pkg.id.slice(0, 8)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1 mb-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3 w-3 text-blue-600" />
                      <span className="text-sm text-gray-700">{pkg.pickupLocation}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3 w-3 text-orange-600" />
                      <span className="text-sm text-gray-700">{pkg.dropoffLocation}</span>
                    </div>
                  </div>

                  {acceptedQuote && (
                    <div className="bg-gray-100 rounded p-2 text-sm">
                      <p className="text-gray-600">Tài xế: {acceptedQuote.driverName}</p>
                      <p className="text-gray-900 font-semibold">{formatVND(acceptedQuote.quotedPrice)}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
