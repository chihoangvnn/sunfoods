'use client'

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Phone, Clock, ArrowLeft, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { RatingModal } from '@/components/RatingModal';

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
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  createdAt: string;
  updatedAt: string;
  pickupLocation: string;
  pickupLat: string | null;
  pickupLng: string | null;
  dropoffLocation: string;
  dropoffLat: string | null;
  dropoffLng: string | null;
  customerNotes: string | null;
  requestStatus: string;
  customerPhone?: string | null;
  customerName?: string | null;
  customerId?: string | null;
}

export default function MyQuotesPage() {
  const router = useRouter();
  const [quotes, setQuotes] = useState<DriverQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedCustomerForRating, setSelectedCustomerForRating] = useState<{ 
    id: string; 
    name: string; 
    rideRequestId: string; 
  } | null>(null);
  const [ratedQuotes, setRatedQuotes] = useState<Set<string>>(new Set());

  const fetchQuotes = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/driver-quotes/my-quotes');
      if (response.ok) {
        const data = await response.json();
        setQuotes(data);
      }
    } catch (error) {
      console.error('Error fetching quotes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, []);

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleOpenRatingModal = (quote: DriverQuote) => {
    if (quote.customerId && quote.customerName) {
      setSelectedCustomerForRating({
        id: quote.customerId,
        name: quote.customerName,
        rideRequestId: quote.rideRequestId,
      });
      setShowRatingModal(true);
    }
  };

  const handleRatingSubmitted = () => {
    if (selectedCustomerForRating) {
      setRatedQuotes(prev => new Set(prev).add(selectedCustomerForRating.rideRequestId));
    }
    setShowRatingModal(false);
    setSelectedCustomerForRating(null);
  };

  const statusConfig = {
    pending: { label: 'Chờ phản hồi', color: 'bg-yellow-100 text-yellow-800' },
    accepted: { label: 'Đã nhận', color: 'bg-green-100 text-green-800' },
    rejected: { label: 'Đã từ chối', color: 'bg-red-100 text-red-800' },
    expired: { label: 'Hết hạn', color: 'bg-gray-100 text-gray-800' },
  };

  const pendingQuotes = quotes.filter((q) => q.status === 'pending');
  const acceptedQuotes = quotes.filter((q) => q.status === 'accepted');
  const rejectedQuotes = quotes.filter((q) => q.status === 'rejected' || q.status === 'expired');

  const renderQuoteCards = (quotesList: DriverQuote[]) => {
    if (quotesList.length === 0) {
      return (
        <Card className="border-none shadow-md">
          <CardContent className="p-12 text-center">
            <MapPin className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có báo giá</h3>
            <p className="text-gray-600">Chưa có báo giá nào trong mục này</p>
          </CardContent>
        </Card>
      );
    }

    return quotesList.map((quote) => (
      <Card key={quote.id} className="border-none shadow-md hover:shadow-lg transition-shadow">
        <CardContent className="p-3">
          {/* Header - Status & Price */}
          <div className="flex items-center justify-between mb-3">
            <span
              className={`px-2 py-1 rounded text-xs font-semibold ${
                statusConfig[quote.status].color
              }`}
            >
              {statusConfig[quote.status].label}
            </span>
            <span
              className={`text-xl font-bold ${
                quote.status === 'accepted' ? 'text-green-600' : 'text-gray-900'
              }`}
            >
              {formatVND(quote.quotedPrice)}
            </span>
          </div>

          {/* Route - Horizontal */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <MapPin className="h-4 w-4 text-blue-600 flex-shrink-0" />
              <span className="text-sm font-semibold text-gray-900 truncate">
                {quote.pickupLocation}
              </span>
            </div>
            <span className="text-gray-400 flex-shrink-0">→</span>
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <MapPin className="h-4 w-4 text-orange-600 flex-shrink-0" />
              <span className="text-sm font-semibold text-gray-900 truncate">
                {quote.dropoffLocation}
              </span>
            </div>
          </div>

          {/* Quote Details */}
          <div className="space-y-1 mb-2 pb-2 border-b">
            {quote.vehicleModel && (
              <p className="text-xs text-gray-600">Xe: {quote.vehicleModel}</p>
            )}
            {quote.licensePlate && (
              <p className="text-xs text-gray-600">Biển số: {quote.licensePlate}</p>
            )}
            {quote.estimatedPickupTime && (
              <p className="text-xs text-gray-600">Đón sau: {quote.estimatedPickupTime} phút</p>
            )}
            {quote.message && (
              <p className="text-xs text-gray-600 italic">"{quote.message}"</p>
            )}
          </div>

          {/* Timestamp */}
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
            <Clock className="h-3 w-3" />
            <span>{formatDateTime(quote.createdAt)}</span>
          </div>

          {/* Customer Info - Only if Accepted */}
          {quote.status === 'accepted' && quote.customerPhone && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-2">
              <p className="text-xs text-green-800 font-semibold mb-2">Thông tin khách hàng:</p>
              <div className="space-y-1">
                {quote.customerName && (
                  <p className="text-sm text-green-900">Tên: {quote.customerName}</p>
                )}
                <p className="text-sm text-green-900">SĐT: {quote.customerPhone}</p>
                {quote.customerNotes && (
                  <p className="text-xs text-green-800 mt-2 italic">
                    Ghi chú: {quote.customerNotes}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Call Customer Button - Only if Accepted */}
          {quote.status === 'accepted' && quote.customerPhone && (
            <div className="space-y-2">
              <a href={`tel:${quote.customerPhone}`}>
                <Button
                  size="sm"
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <Phone className="h-4 w-4 mr-1" />
                  Gọi khách
                </Button>
              </a>

              {!ratedQuotes.has(quote.rideRequestId) ? (
                <Button
                  size="sm"
                  onClick={() => handleOpenRatingModal(quote)}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
                  disabled={!quote.customerId || !quote.customerName}
                >
                  <Star className="h-4 w-4 mr-1" />
                  Đánh giá khách hàng
                </Button>
              ) : (
                <div className="flex items-center justify-center gap-2 text-green-700 font-medium py-2 bg-green-50 rounded-md">
                  <span className="text-xl">✅</span>
                  <span className="text-sm">Đã đánh giá</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    ));
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
          <h1 className="text-xl font-bold">Báo giá của tôi</h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="pending">
              Chờ phản hồi
              {pendingQuotes.length > 0 && (
                <span className="ml-1 bg-yellow-500 text-white text-xs rounded-full px-1.5 py-0.5">
                  {pendingQuotes.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="accepted">
              Đã nhận
              {acceptedQuotes.length > 0 && (
                <span className="ml-1 bg-green-500 text-white text-xs rounded-full px-1.5 py-0.5">
                  {acceptedQuotes.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Đã từ chối
              {rejectedQuotes.length > 0 && (
                <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                  {rejectedQuotes.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-3">
            {loading ? (
              <Card className="border-none shadow-md">
                <CardContent className="p-12 text-center">
                  <p className="text-gray-600">Đang tải...</p>
                </CardContent>
              </Card>
            ) : (
              renderQuoteCards(pendingQuotes)
            )}
          </TabsContent>

          <TabsContent value="accepted" className="space-y-3">
            {loading ? (
              <Card className="border-none shadow-md">
                <CardContent className="p-12 text-center">
                  <p className="text-gray-600">Đang tải...</p>
                </CardContent>
              </Card>
            ) : (
              renderQuoteCards(acceptedQuotes)
            )}
          </TabsContent>

          <TabsContent value="rejected" className="space-y-3">
            {loading ? (
              <Card className="border-none shadow-md">
                <CardContent className="p-12 text-center">
                  <p className="text-gray-600">Đang tải...</p>
                </CardContent>
              </Card>
            ) : (
              renderQuoteCards(rejectedQuotes)
            )}
          </TabsContent>
        </Tabs>
      </div>

      {showRatingModal && selectedCustomerForRating && (
        <RatingModal
          open={showRatingModal}
          onOpenChange={setShowRatingModal}
          rideRequestId={selectedCustomerForRating.rideRequestId}
          ratedUserId={selectedCustomerForRating.id}
          ratedUserName={selectedCustomerForRating.name}
          raterType="driver"
          onRatingSubmitted={handleRatingSubmitted}
        />
      )}
    </div>
  );
}
