import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Car, Clock, Star, MapPin, User, Phone, Lock } from "lucide-react";
import { mockTrips, mockTripSeats, mockDriverReviews } from "@/ride-sharing/mockData";
import SeatSelector from "@/ride-sharing/components/SeatSelector";
import PhoneInputDialog from "@/ride-sharing/components/PhoneInputDialog";
import RatingStats from "@/ride-sharing/components/RatingStats";
import ReviewsList from "@/ride-sharing/components/ReviewsList";

export default function TripDetails() {
  const [, params] = useRoute("/ride-trip/:id");
  const { toast } = useToast();
  const [phoneDialogOpen, setPhoneDialogOpen] = useState(false);
  const [selectedSeatId, setSelectedSeatId] = useState<string | null>(null);
  const [tripSeats, setTripSeats] = useState(mockTripSeats);
  const [showDriverInfo, setShowDriverInfo] = useState(false);

  const trip = mockTrips.find(t => t.id === params?.id);
  const currentTripSeats = tripSeats[trip?.id || ""] || [];
  const driverReviews = mockDriverReviews[trip?.id || ""] || [];

  if (!trip) {
    return (
      <div className="container mx-auto py-6">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Không tìm thấy chuyến xe</p>
        </Card>
      </div>
    );
  }

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  // Kiểm tra xem khách hàng có ghế đã được xác nhận không
  useEffect(() => {
    if (!trip) return;
    
    const bookingKey = `ride_booking_${trip.id}`;
    const savedBooking = localStorage.getItem(bookingKey);
    
    if (savedBooking) {
      try {
        const booking = JSON.parse(savedBooking);
        // Tìm ghế của khách hàng hiện tại
        const passengerSeat = currentTripSeats.find(
          seat => seat.id === booking.seatId
        );
        
        // Chỉ hiển thị thông tin tài xế nếu ghế đã được xác nhận
        if (passengerSeat && passengerSeat.status === "confirmed") {
          setShowDriverInfo(true);
        } else {
          setShowDriverInfo(false);
        }
      } catch (error) {
        console.error("Error parsing booking data:", error);
        setShowDriverInfo(false);
      }
    } else {
      // Nếu chưa có booking, ẩn thông tin tài xế
      setShowDriverInfo(false);
    }
  }, [trip, currentTripSeats]);

  const handleSeatClick = (seatId: string) => {
    const seat = currentTripSeats.find(s => s.id === seatId);
    if (!seat || seat.status !== "available") return;

    setSelectedSeatId(seatId);
    setPhoneDialogOpen(true);
  };

  const handlePhoneSubmit = (name: string, phone: string, pickupLocation?: { address?: string; gpsCoords?: { lat: number; lng: number } }) => {
    if (!selectedSeatId) return;

    const updatedSeats = currentTripSeats.map(seat => 
      seat.id === selectedSeatId 
        ? { ...seat, status: "pending_confirmation" as const, passengerName: name, passengerPhone: phone, pickupLocation }
        : seat
    );

    setTripSeats({
      ...tripSeats,
      [trip.id]: updatedSeats
    });

    // Lưu thông tin booking vào localStorage
    const bookingKey = `ride_booking_${trip.id}`;
    localStorage.setItem(bookingKey, JSON.stringify({
      tripId: trip.id,
      seatId: selectedSeatId,
      passengerName: name,
      passengerPhone: phone,
      bookingTime: new Date().toISOString()
    }));

    setPhoneDialogOpen(false);
    setSelectedSeatId(null);

    toast({
      title: "Đặt ghế thành công!",
      description: `Ghế ${selectedSeatId} đang chờ xác nhận. Tài xế ${trip.driverName} sẽ sớm gọi điện cho bạn.`,
    });
  };

  const availableSeatsCount = currentTripSeats.filter(s => s.status === "available").length;

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-4xl">
      <Card className="p-6 space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Chi tiết chuyến xe</h1>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{trip.startLocation} → {trip.endLocation}</span>
            </div>
          </div>
          <Badge variant={availableSeatsCount > 0 ? "default" : "secondary"} className="text-lg px-4 py-2">
            Còn {availableSeatsCount}/{trip.totalSeats} chỗ
          </Badge>
        </div>

        {trip.vehicleImageUrl && (
          <div className="rounded-lg overflow-hidden">
            <img src={trip.vehicleImageUrl} alt={trip.vehicleModel} className="w-full h-64 object-cover" />
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h2 className="font-semibold text-lg">Thông tin tài xế</h2>
            {showDriverInfo ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">{trip.driverName}</span>
                  <div className="flex items-center gap-1 ml-auto">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{trip.driverRating}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <span>{trip.driverPhone}</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                <Lock className="h-5 w-5 text-muted-foreground" />
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium mb-1">Thông tin bảo mật</p>
                  <p>Thông tin tài xế sẽ hiển thị sau khi đặt ghế được xác nhận</p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h2 className="font-semibold text-lg">Thông tin xe</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Car className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{trip.vehicleModel}</p>
                  <p className="text-sm text-muted-foreground">
                    {trip.seatType} chỗ
                    {showDriverInfo && (
                      <> • {trip.licensePlate}</>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t pt-6">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">Khung giờ xuất phát</p>
              <p className="text-sm text-muted-foreground">
                {formatTime(trip.departureWindowStart)} - {formatTime(trip.departureWindowEnd)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Car className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">Giá vé</p>
              <p className="text-2xl font-bold text-primary">{formatPrice(trip.pricePerSeat)}/chỗ</p>
            </div>
          </div>
        </div>
      </Card>

      <SeatSelector
        seatType={trip.seatType as 4 | 7}
        seats={currentTripSeats}
        onSeatClick={handleSeatClick}
        mode="passenger"
      />

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-6">Đánh giá từ khách hàng</h2>
        <div className="space-y-6">
          <RatingStats reviews={driverReviews} />
          <ReviewsList reviews={driverReviews} emptyMessage="Tài xế chưa có đánh giá nào" />
        </div>
      </Card>

      <PhoneInputDialog
        open={phoneDialogOpen}
        onClose={() => {
          setPhoneDialogOpen(false);
          setSelectedSeatId(null);
        }}
        onSubmit={handlePhoneSubmit}
        seatId={selectedSeatId || ""}
        pricePerSeat={trip.pricePerSeat}
      />
    </div>
  );
}
