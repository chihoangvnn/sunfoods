import { Card } from "@/components/ui/card";
import { BookingStatusBadge } from "./BookingStatusBadge";
import { PassengerCheckInDialog } from "./PassengerCheckInDialog";
import { DepartureCountdown } from "./DepartureCountdown";
import { Calendar, MapPin, Car, Users } from "lucide-react";
import type { TripStatus, PassengerCheckIn } from "@/ride-sharing/mockData";

interface FullBookingCardProps {
  booking: {
    id: string;
    tripId: string;
    passengerId: string;
    seatsBooked: number;
    status: "pending_confirmation" | "confirmed";
    bookingTime: string;
    trip: {
      driverName: string;
      vehicleModel: string;
      licensePlate: string;
      startLocation: string;
      endLocation: string;
      departureWindowStart: string;
      departureWindowEnd: string;
      pricePerSeat: number;
    };
  };
  tripStatus: TripStatus;
  checkInTime: string | null;
  passengerCheckIns: PassengerCheckIn[];
  onCheckIn: () => void;
}

export function FullBookingCard({
  booking,
  tripStatus,
  checkInTime,
  passengerCheckIns,
  onCheckIn,
}: FullBookingCardProps) {
  const hasCheckedIn = passengerCheckIns.some(c => c.passengerId === booking.passengerId);

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  return (
    <Card className="p-4">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="font-semibold">
                {booking.trip.startLocation} → {booking.trip.endLocation}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 flex-shrink-0" />
              <span>{formatDate(booking.trip.departureWindowStart)}</span>
              <span>•</span>
              <span>
                {formatTime(booking.trip.departureWindowStart)} - {formatTime(booking.trip.departureWindowEnd)}
              </span>
            </div>
            <DepartureCountdown departureWindowStart={booking.trip.departureWindowStart} />
          </div>
          <BookingStatusBadge status={booking.status} />
        </div>

        <div className="grid md:grid-cols-3 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Car className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <div className="min-w-0">
              <p className="font-medium">Tài xế {booking.trip.driverName}</p>
              <p className="text-muted-foreground truncate">
                {booking.trip.vehicleModel} • {booking.trip.licensePlate}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <div>
              <p className="font-medium">{booking.seatsBooked} ghế</p>
              <p className="text-muted-foreground">Đã đặt</p>
            </div>
          </div>

          <div>
            <p className="text-muted-foreground">Tổng tiền</p>
            <p className="font-bold text-primary">
              {formatPrice(booking.trip.pricePerSeat * booking.seatsBooked)}
            </p>
          </div>
        </div>

        {booking.status === 'pending_confirmation' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
            ⏳ Tài xế sẽ sớm gọi điện xác nhận. Vui lòng giữ máy.
          </div>
        )}

        {booking.status === 'confirmed' && !hasCheckedIn && (
          <div className="flex items-center gap-2">
            <PassengerCheckInDialog
              tripId={booking.tripId}
              status={tripStatus}
              checkInTime={checkInTime}
              passengerCheckIns={passengerCheckIns}
              passengerId={booking.passengerId}
              departureWindowStart={booking.trip.departureWindowStart}
              driverName={booking.trip.driverName}
              vehicleModel={booking.trip.vehicleModel}
              licensePlate={booking.trip.licensePlate}
              pickupLocation="Điểm đón đã chọn"
              seatId="A"
              onCheckIn={onCheckIn}
            />
          </div>
        )}

        {hasCheckedIn && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800">
            ✅ Bạn đã check-in. Hẹn gặp bạn tại điểm đón!
          </div>
        )}
      </div>
    </Card>
  );
}
