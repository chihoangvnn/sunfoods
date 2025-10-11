'use client'

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Clock, MapPin, User, Car, Phone, Star } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BookingConfirmedModal } from '@/ride-sharing/components/BookingConfirmedModal';
import { RatingModal } from '@/components/RatingModal';

interface RideRequest {
  id: string;
  pickupLocation: string;
  dropoffLocation: string;
  customerNotes: string | null;
  status: string;
  expiresAt: string;
  createdAt: string;
}

interface Quote {
  id: string;
  driverId: string;
  driverName: string;
  driverPhone: string;
  driverAvatar: string | null;
  quotedPrice: number;
  vehicleModel: string | null;
  licensePlate: string | null;
  seatType: number | null;
  message: string | null;
  estimatedPickupTime: number | null;
  createdAt: string;
}

export default function ViewQuotesPage() {
  const params = useParams();
  const router = useRouter();
  const requestId = params.id as string;

  const [rideRequest, setRideRequest] = useState<RideRequest | null>(null);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [isExpired, setIsExpired] = useState(false);
  const [isAccepting, setIsAccepting] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<any | null>(null);
  const [driverRatings, setDriverRatings] = useState<Record<string, { averageRating: number | null; totalRatings: number }>>({});
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedDriverForRating, setSelectedDriverForRating] = useState<{ id: string; name: string } | null>(null);
  const [customerHasRated, setCustomerHasRated] = useState(false);

  const fetchRequestAndQuotes = async () => {
    try {
      const [requestResponse, quotesResponse] = await Promise.all([
        fetch(`/api/ride-requests/${requestId}`),
        fetch(`/api/ride-requests/${requestId}/quotes`),
      ]);

      if (!requestResponse.ok) {
        throw new Error('Không thể tải thông tin yêu cầu');
      }

      const requestData = await requestResponse.json();
      setRideRequest(requestData);

      if (quotesResponse.ok) {
        const quotesData = await quotesResponse.json();
        const sortedQuotes = quotesData.sort((a: Quote, b: Quote) => a.quotedPrice - b.quotedPrice);
        setQuotes(sortedQuotes);

        const ratingsMap: Record<string, { averageRating: number | null; totalRatings: number }> = {};
        await Promise.all(
          sortedQuotes.map(async (quote: Quote) => {
            try {
              const ratingResponse = await fetch(`/api/users/${quote.driverId}/rating?role=driver`);
              if (ratingResponse.ok) {
                const ratingData = await ratingResponse.json();
                ratingsMap[quote.driverId] = {
                  averageRating: ratingData.averageRating,
                  totalRatings: ratingData.totalRatings,
                };
              }
            } catch (err) {
              console.error(`Error fetching rating for driver ${quote.driverId}:`, err);
            }
          })
        );
        setDriverRatings(ratingsMap);
      }

      if (requestData.status === 'accepted' && requestData.acceptedQuoteId) {
        try {
          const hasRatedResponse = await fetch(`/api/ride-ratings?rideRequestId=${requestId}`);
          if (hasRatedResponse.ok) {
            const ratings = await hasRatedResponse.json();
            setCustomerHasRated(ratings && ratings.length > 0);
          }
        } catch (err) {
          console.error('Error checking customer rating status:', err);
        }
      }

      setIsLoading(false);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Đã xảy ra lỗi');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequestAndQuotes();

    const interval = setInterval(() => {
      fetchRequestAndQuotes();
    }, 10000);

    return () => clearInterval(interval);
  }, [requestId]);

  useEffect(() => {
    if (!rideRequest) return;

    const updateCountdown = () => {
      const now = new Date().getTime();
      const expiry = new Date(rideRequest.expiresAt).getTime();
      const diff = expiry - now;

      if (diff <= 0) {
        setTimeRemaining('Đã hết hạn');
        setIsExpired(true);
        return;
      }

      const minutes = Math.floor(diff / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeRemaining(`${minutes} phút ${seconds} giây`);
      setIsExpired(false);
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);

    return () => clearInterval(timer);
  }, [rideRequest]);

  const handleAcceptQuote = async (quoteId: string) => {
    setIsAccepting(quoteId);
    
    try {
      const response = await fetch(`/api/ride-requests/${requestId}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quoteId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Không thể chấp nhận báo giá');
      }

      const result = await response.json();
      
      const acceptedQuote = quotes.find(q => q.id === quoteId);
      if (acceptedQuote && rideRequest) {
        setConfirmedBooking({
          driverName: acceptedQuote.driverName,
          driverPhone: acceptedQuote.driverPhone,
          vehicleModel: acceptedQuote.vehicleModel || 'Xe 4 chỗ',
          licensePlate: acceptedQuote.licensePlate || 'N/A',
          pickupLocation: rideRequest.pickupLocation,
          dropoffLocation: rideRequest.dropoffLocation,
          quotedPrice: acceptedQuote.quotedPrice,
          estimatedPickupTime: acceptedQuote.estimatedPickupTime,
        });
      }

      await fetchRequestAndQuotes();
    } catch (err: any) {
      console.error('Error accepting quote:', err);
      alert(err.message || 'Đã xảy ra lỗi. Vui lòng thử lại.');
    } finally {
      setIsAccepting(null);
    }
  };

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)}M`;
    } else if (price >= 1000) {
      return `${(price / 1000).toFixed(0)}K`;
    }
    return `${price}`;
  };

  const handleCloseModal = () => {
    setConfirmedBooking(null);
    router.push('/datxe/bookings');
  };

  const handleOpenRatingModal = () => {
    if (rideRequest?.status === 'accepted' && rideRequest.acceptedQuoteId) {
      const acceptedQuote = quotes.find(q => q.id === rideRequest.acceptedQuoteId);
      if (acceptedQuote) {
        setSelectedDriverForRating({
          id: acceptedQuote.driverId,
          name: acceptedQuote.driverName,
        });
        setShowRatingModal(true);
      }
    }
  };

  const handleRatingSubmitted = () => {
    setCustomerHasRated(true);
    setShowRatingModal(false);
    fetchRequestAndQuotes();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-green-600 text-white p-4 sticky top-0 z-10 shadow-md">
          <div className="flex items-center gap-3">
            <Link href="/datxe" className="hover:bg-green-700 p-2 rounded-lg transition-colors -ml-2">
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <h1 className="text-xl font-bold">Đang tải...</h1>
          </div>
        </div>
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải thông tin...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !rideRequest) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-green-600 text-white p-4 sticky top-0 z-10 shadow-md">
          <div className="flex items-center gap-3">
            <Link href="/datxe" className="hover:bg-green-700 p-2 rounded-lg transition-colors -ml-2">
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <h1 className="text-xl font-bold">Lỗi</h1>
          </div>
        </div>
        <div className="p-4">
          <Card className="p-6 text-center">
            <p className="text-red-600 font-medium">{error || 'Không tìm thấy yêu cầu'}</p>
            <Button asChild className="mt-4">
              <Link href="/datxe">Quay lại</Link>
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="bg-green-600 text-white p-4 sticky top-0 z-10 shadow-md">
          <div className="flex items-center gap-3 mb-3">
            <Link href="/datxe" className="hover:bg-green-700 p-2 rounded-lg transition-colors -ml-2">
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <div className="flex-1">
              <h1 className="text-lg font-bold">Yêu cầu đặt xe</h1>
            </div>
          </div>
          
          <div className="bg-white/10 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-4 w-4" />
              <span className="font-semibold text-sm">{rideRequest.pickupLocation}</span>
              <ArrowRight className="h-4 w-4" />
              <span className="font-semibold text-sm">{rideRequest.dropoffLocation}</span>
            </div>
            
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span className={isExpired ? 'text-red-200' : ''}>
                  {isExpired ? 'Đã hết hạn' : `Còn ${timeRemaining}`}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto p-4 space-y-4">
          <Card className="p-4">
            <h2 className="font-bold text-lg mb-2 flex items-center gap-2">
              <span className={`inline-block w-2 h-2 rounded-full ${isExpired ? 'bg-red-500' : 'bg-yellow-500 animate-pulse'}`}></span>
              {isExpired ? 'Yêu cầu đã hết hạn' : 'Đang chờ báo giá...'}
            </h2>
            <p className="text-gray-600 text-sm">
              {isExpired 
                ? 'Yêu cầu của bạn đã hết hạn. Vui lòng tạo yêu cầu mới.'
                : quotes.length > 0 
                  ? `Đã có ${quotes.length} tài xế gửi báo giá. Chọn tài xế phù hợp nhất!`
                  : 'Tài xế đang xem yêu cầu của bạn. Vui lòng đợi trong giây lát...'}
            </p>
          </Card>

          {quotes.length === 0 && !isExpired && (
            <Card className="p-8 text-center">
              <div className="animate-pulse mb-4">
                <Car className="h-12 w-12 text-gray-400 mx-auto" />
              </div>
              <p className="text-gray-600">Đang tìm tài xế cho bạn...</p>
              <p className="text-sm text-gray-500 mt-2">Trang sẽ tự động cập nhật khi có báo giá mới</p>
            </Card>
          )}

          {quotes.length > 0 && (
            <div className="space-y-3">
              <h2 className="font-bold text-lg px-1">Báo giá từ tài xế ({quotes.length})</h2>
              
              {quotes.map((quote) => (
                <Card key={quote.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-center gap-3">
                        {quote.driverAvatar ? (
                          <img 
                            src={quote.driverAvatar} 
                            alt={quote.driverName}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                            <User className="h-6 w-6 text-gray-500" />
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-gray-900">{quote.driverName}</h3>
                            {driverRatings[quote.driverId] && driverRatings[quote.driverId].averageRating !== null && (
                              <div className="flex items-center gap-1 text-sm bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-full">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                <span className="font-semibold">{driverRatings[quote.driverId].averageRating}</span>
                                <span className="text-xs">({driverRatings[quote.driverId].totalRatings})</span>
                              </div>
                            )}
                            {driverRatings[quote.driverId] && driverRatings[quote.driverId].averageRating === null && (
                              <span className="text-xs text-gray-400">Chưa có đánh giá</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            {quote.vehicleModel && (
                              <>
                                <Car className="h-3.5 w-3.5" />
                                <span>{quote.vehicleModel}</span>
                              </>
                            )}
                            {quote.licensePlate && (
                              <>
                                <span className="text-gray-400">•</span>
                                <span className="font-mono">{quote.licensePlate}</span>
                              </>
                            )}
                          </div>
                          {quote.estimatedPickupTime && (
                            <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                              <Clock className="h-3.5 w-3.5" />
                              <span>Đón sau {quote.estimatedPickupTime} phút</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">
                          {formatPrice(quote.quotedPrice)}đ
                        </div>
                      </div>
                    </div>

                    {quote.message && (
                      <div className="bg-gray-50 rounded-lg p-3 mb-3">
                        <p className="text-sm text-gray-700">{quote.message}</p>
                      </div>
                    )}

                    <Button
                      onClick={() => handleAcceptQuote(quote.id)}
                      disabled={isAccepting !== null || isExpired || rideRequest.status !== 'pending'}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold"
                    >
                      {isAccepting === quote.id ? 'Đang xử lý...' : rideRequest.status === 'accepted' ? 'Đã chọn tài xế khác' : 'Chọn'}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {rideRequest.customerNotes && (
            <Card className="p-4 bg-blue-50 border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-1 text-sm">Ghi chú của bạn:</h3>
              <p className="text-sm text-blue-800">{rideRequest.customerNotes}</p>
            </Card>
          )}

          {rideRequest.status === 'accepted' && (
            <Card className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
              <h3 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                <span className="text-2xl">✓</span>
                Chuyến đi đã được xác nhận
              </h3>
              {!customerHasRated ? (
                <Button
                  onClick={handleOpenRatingModal}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold flex items-center justify-center gap-2"
                >
                  <Star className="h-5 w-5" />
                  Đánh giá tài xế
                </Button>
              ) : (
                <div className="flex items-center justify-center gap-2 text-green-700 font-medium py-2">
                  <span className="text-xl">✅</span>
                  Đã đánh giá
                </div>
              )}
            </Card>
          )}
        </div>
      </div>

      {confirmedBooking && (
        <BookingConfirmedModal
          isOpen={!!confirmedBooking}
          onClose={handleCloseModal}
          booking={confirmedBooking}
        />
      )}

      {showRatingModal && selectedDriverForRating && (
        <RatingModal
          open={showRatingModal}
          onOpenChange={setShowRatingModal}
          rideRequestId={requestId}
          ratedUserId={selectedDriverForRating.id}
          ratedUserName={selectedDriverForRating.name}
          raterType="customer"
          onRatingSubmitted={handleRatingSubmitted}
        />
      )}
    </>
  );
}
