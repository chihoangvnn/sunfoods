import { Card } from "@/components/ui/card";
import { BookingStatusBadge } from "@/ride-sharing/components/BookingStatusBadge";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Car, Users } from "lucide-react";

const mockBookings = [
  {
    id: "1",
    tripId: "1",
    passengerId: "user-1",
    seatsBooked: 2,
    status: "pending_confirmation" as const,
    bookingTime: "2025-09-30T06:00:00",
    trip: {
      driverName: "Hùng",
      vehicleModel: "Toyota Innova",
      licensePlate: "92A-123.45",
      startLocation: "Tiên Phước",
      endLocation: "Đà Nẵng",
      departureWindowStart: "2025-09-30T07:00:00",
      departureWindowEnd: "2025-09-30T07:30:00",
      pricePerSeat: 120000
    }
  },
  {
    id: "2",
    tripId: "3",
    passengerId: "user-1",
    seatsBooked: 1,
    status: "confirmed" as const,
    bookingTime: "2025-09-29T15:00:00",
    trip: {
      driverName: "Thanh",
      vehicleModel: "Mazda CX-5",
      licensePlate: "92B-234.56",
      startLocation: "Đà Nẵng",
      endLocation: "Tiên Phước",
      departureWindowStart: "2025-09-30T14:00:00",
      departureWindowEnd: "2025-09-30T14:30:00",
      pricePerSeat: 110000
    }
  },
  {
    id: "3",
    tripId: "old-1",
    passengerId: "user-1",
    seatsBooked: 1,
    status: "completed" as const,
    bookingTime: "2025-09-28T08:00:00",
    trip: {
      driverName: "Minh",
      vehicleModel: "Ford Everest",
      licensePlate: "92A-567.89",
      startLocation: "Tiên Phước",
      endLocation: "Đà Nẵng",
      departureWindowStart: "2025-09-29T08:00:00",
      departureWindowEnd: "2025-09-29T08:30:00",
      pricePerSeat: 130000
    }
  },
  {
    id: "4",
    tripId: "cancelled-1",
    passengerId: "user-1",
    seatsBooked: 2,
    status: "cancelled_by_passenger" as const,
    bookingTime: "2025-09-27T10:00:00",
    trip: {
      driverName: "Tuấn",
      vehicleModel: "Honda CR-V",
      licensePlate: "92B-789.01",
      startLocation: "Tiên Phước",
      endLocation: "Đà Nẵng",
      departureWindowStart: "2025-09-28T15:00:00",
      departureWindowEnd: "2025-09-28T15:30:00",
      pricePerSeat: 125000
    }
  },
  {
    id: "5",
    tripId: "cancelled-2",
    passengerId: "user-1",
    seatsBooked: 1,
    status: "cancelled_by_driver" as const,
    bookingTime: "2025-09-26T14:00:00",
    trip: {
      driverName: "Phương",
      vehicleModel: "Toyota Fortuner",
      licensePlate: "92A-999.88",
      startLocation: "Đà Nẵng",
      endLocation: "Tiên Phước",
      departureWindowStart: "2025-09-27T09:00:00",
      departureWindowEnd: "2025-09-27T09:30:00",
      pricePerSeat: 115000
    }
  }
];

export default function MyBookings() {
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
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Lịch sử đặt vé</h1>
        <p className="text-muted-foreground">Quản lý các chuyến xe đã đặt</p>
      </div>

      <div className="space-y-4">
        {mockBookings.length > 0 ? (
          mockBookings.map(booking => (
            <Card key={booking.id} className="p-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold">
                        {booking.trip.startLocation} → {booking.trip.endLocation}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(booking.trip.departureWindowStart)}</span>
                      <span>•</span>
                      <span>
                        {formatTime(booking.trip.departureWindowStart)} - {formatTime(booking.trip.departureWindowEnd)}
                      </span>
                    </div>
                  </div>
                  <BookingStatusBadge status={booking.status} />
                </div>

                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Car className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Tài xế {booking.trip.driverName}</p>
                      <p className="text-muted-foreground">
                        {booking.trip.vehicleModel} • {booking.trip.licensePlate}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
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
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-8 text-center text-muted-foreground">
            Bạn chưa đặt chuyến xe nào
          </Card>
        )}
      </div>
    </div>
  );
}
