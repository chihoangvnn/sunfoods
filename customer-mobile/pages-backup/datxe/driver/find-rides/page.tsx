'use client'

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, FileText, ArrowLeft } from 'lucide-react';
import { QuoteFormDrawer } from '@/ride-sharing/components/QuoteFormDrawer';
import { useRouter } from 'next/navigation';

interface RideRequest {
  id: string;
  customerId: string;
  pickupLocation: string;
  pickupLat: string | null;
  pickupLng: string | null;
  dropoffLocation: string;
  dropoffLat: string | null;
  dropoffLng: string | null;
  estimatedDistance: number | null;
  customerNotes?: string | null;
  status: string;
  expiresAt: string;
  createdAt: string;
}

export default function FindRidesPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<RideRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<RideRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<RideRequest | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/ride-requests/active');
      if (response.ok) {
        const data = await response.json();
        setRequests(data);
        setFilteredRequests(data);
      }
    } catch (error) {
      console.error('Error fetching ride requests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    if (selectedFilter === 'all') {
      setFilteredRequests(requests);
    } else {
      const filtered = requests.filter(
        (req) =>
          req.pickupLocation.toLowerCase().includes(selectedFilter.toLowerCase()) ||
          req.dropoffLocation.toLowerCase().includes(selectedFilter.toLowerCase())
      );
      setFilteredRequests(filtered);
    }
  }, [selectedFilter, requests]);

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date().getTime();
    const expiry = new Date(expiresAt).getTime();
    const diff = expiry - now;

    if (diff <= 0) return 'Hết hạn';

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours > 0) {
      return `Còn ${hours}h ${remainingMinutes}p`;
    }
    return `Còn ${minutes}p`;
  };

  const getNewestRequestTime = () => {
    if (filteredRequests.length === 0) return 'Chưa có';
    const newest = filteredRequests[0];
    const date = new Date(newest.createdAt);
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleQuoteClick = (request: RideRequest) => {
    setSelectedRequest(request);
    setDrawerOpen(true);
  };

  const handleQuoteSuccess = () => {
    fetchRequests();
  };

  const cities = ['all', 'Quận 1', 'Quận 3', 'Quận 7', 'Bình Thạnh', 'Tân Bình', 'Phú Nhuận'];

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      {/* Header */}
      <div className="bg-green-600 text-white p-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-1 hover:bg-green-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold">Tìm khách</h1>
        </div>
      </div>

      {/* Stats Card */}
      <Card className="border-none shadow-md m-4">
        <CardContent className="p-4">
          <div className="flex items-center justify-around">
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Yêu cầu đang mở</p>
              <p className="text-3xl font-bold text-green-600">{filteredRequests.length}</p>
            </div>
            <div className="h-12 w-px bg-gray-200"></div>
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Mới nhất lúc</p>
              <p className="text-xl font-bold text-gray-900">{getNewestRequestTime()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filter Chips */}
      <div className="px-4 pb-3">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {cities.map((city) => (
            <button
              key={city}
              onClick={() => setSelectedFilter(city)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedFilter === city
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {city === 'all' ? 'Tất cả' : city}
            </button>
          ))}
        </div>
      </div>

      {/* Request Cards */}
      <div className="px-4 space-y-3">
        {loading ? (
          <Card className="border-none shadow-md">
            <CardContent className="p-12 text-center">
              <p className="text-gray-600">Đang tải...</p>
            </CardContent>
          </Card>
        ) : filteredRequests.length === 0 ? (
          <Card className="border-none shadow-md">
            <CardContent className="p-12 text-center">
              <MapPin className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có yêu cầu</h3>
              <p className="text-gray-600">Chưa có yêu cầu đặt xe nào</p>
            </CardContent>
          </Card>
        ) : (
          filteredRequests.map((request) => (
            <Card
              key={request.id}
              className="border-none shadow-md hover:shadow-lg transition-shadow"
            >
              <CardContent className="p-3">
                {/* Route - Horizontal Grab-style */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <MapPin className="h-4 w-4 text-blue-600 flex-shrink-0" />
                    <span className="text-sm font-semibold text-gray-900 truncate">
                      {request.pickupLocation}
                    </span>
                  </div>
                  <span className="text-gray-400 flex-shrink-0">→</span>
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <MapPin className="h-4 w-4 text-orange-600 flex-shrink-0" />
                    <span className="text-sm font-semibold text-gray-900 truncate">
                      {request.dropoffLocation}
                    </span>
                  </div>
                </div>

                {/* Stats Row */}
                <div className="flex items-center justify-between text-xs text-gray-600 mb-2 pb-2 border-b">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    <span className="font-medium">{getTimeRemaining(request.expiresAt)}</span>
                  </div>
                  {request.estimatedDistance && (
                    <span>~{request.estimatedDistance} km</span>
                  )}
                </div>

                {/* Customer Notes */}
                {request.customerNotes && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded px-2 py-1.5 mb-3">
                    <div className="flex items-start gap-1.5">
                      <FileText className="h-3.5 w-3.5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-yellow-800 flex-1">
                        <span className="font-semibold">Ghi chú:</span> {request.customerNotes}
                      </p>
                    </div>
                  </div>
                )}

                {/* Quote Button */}
                <Button
                  size="sm"
                  onClick={() => handleQuoteClick(request)}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  Báo giá
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Quote Form Drawer */}
      <QuoteFormDrawer
        request={selectedRequest}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onSuccess={handleQuoteSuccess}
      />
    </div>
  );
}
