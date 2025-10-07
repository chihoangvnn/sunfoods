'use client'

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { FullBookingCard } from "@/ride-sharing/components/FullBookingCard";
import { CompactBookingCard } from "@/ride-sharing/components/CompactBookingCard";
import { useToast } from "@/hooks/use-toast";
import { canPassengerCheckIn } from "@/ride-sharing/utils/tripValidation";
import type { TripStatus, PassengerCheckIn } from "@/ride-sharing/mockData";
import { mockTrips } from "@/ride-sharing/mockData";

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

interface BookingWithTripState {
  tripStatus: TripStatus;
  checkInTime: string | null;
  passengerCheckIns: PassengerCheckIn[];
}

export default function MyBookings() {
  const { toast } = useToast();
  
  const [bookingStates, setBookingStates] = useState<Record<string, BookingWithTripState>>(() => {
    const initialStates: Record<string, BookingWithTripState> = {};
    mockBookings.forEach(booking => {
      const mockTrip = mockTrips.find(t => t.id === booking.tripId);
      initialStates[booking.id] = {
        tripStatus: mockTrip?.status || "pending",
        checkInTime: mockTrip?.checkInTime || null,
        passengerCheckIns: mockTrip?.passengerCheckIns || [],
      };
    });
    return initialStates;
  });

  const handlePassengerCheckIn = async (bookingId: string) => {
    const booking = mockBookings.find(b => b.id === bookingId);
    if (!booking) return;

    const bookingState = bookingStates[bookingId];
    const validation = canPassengerCheckIn(
      bookingState.tripStatus,
      bookingState.checkInTime,
      bookingState.passengerCheckIns,
      booking.passengerId,
      booking.trip.departureWindowStart
    );

    if (!validation.canPassengerCheckIn) {
      toast({
        title: "Không thể check-in",
        description: validation.reason,
        variant: "destructive",
      });
      return;
    }

    setBookingStates(prev => ({
      ...prev,
      [bookingId]: {
        ...prev[bookingId],
        passengerCheckIns: [
          ...prev[bookingId].passengerCheckIns,
          {
            passengerId: booking.passengerId,
            passengerName: "Bạn",
            checkedInAt: new Date().toISOString(),
            seatId: "A",
          }
        ]
      }
    }));

    toast({
      title: "✅ Check-in thành công",
      description: "Tài xế đã nhận được thông báo. Chúc bạn đi đường an toàn!",
    });
  };

  const sortedBookings = [...mockBookings].sort((a, b) => {
    const aDate = new Date(a.trip.departureWindowStart).getTime();
    const bDate = new Date(b.trip.departureWindowStart).getTime();
    
    const statusPriority = {
      'pending_confirmation': 1,
      'confirmed': 2,
      'cancelled_by_driver': 3,
      'cancelled_by_passenger': 4,
      'completed': 5
    };
    
    const aPriority = statusPriority[a.status];
    const bPriority = statusPriority[b.status];
    
    if (aPriority !== bPriority) {
      return aPriority - bPriority;
    }
    
    return bDate - aDate;
  });

  const activeBookings = sortedBookings.filter(
    b => b.status === 'pending_confirmation' || b.status === 'confirmed'
  );
  
  const recentCancellations = sortedBookings.filter(
    b => {
      if (b.status !== 'cancelled_by_driver' && b.status !== 'cancelled_by_passenger') return false;
      const daysAgo = (Date.now() - new Date(b.trip.departureWindowStart).getTime()) / (1000 * 60 * 60 * 24);
      return daysAgo <= 7;
    }
  );
  
  const pastBookings = sortedBookings.filter(
    b => {
      if (b.status === 'completed') return true;
      if (b.status === 'cancelled_by_driver' || b.status === 'cancelled_by_passenger') {
        const daysAgo = (Date.now() - new Date(b.trip.departureWindowStart).getTime()) / (1000 * 60 * 60 * 24);
        return daysAgo > 7;
      }
      return false;
    }
  );

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Lịch sử đặt vé</h1>
        <p className="text-muted-foreground">Quản lý các chuyến xe đã đặt</p>
      </div>

      <div className="space-y-6">
        {activeBookings.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground">CHUYẾN SẮP TỚI</h2>
            <div className="space-y-3">
              {activeBookings.map(booking => {
                const bookingState = bookingStates[booking.id] || { 
                  tripStatus: "pending" as TripStatus, 
                  checkInTime: null, 
                  passengerCheckIns: [] 
                };

                return (
                  <FullBookingCard
                    key={booking.id}
                    booking={booking}
                    tripStatus={bookingState.tripStatus}
                    checkInTime={bookingState.checkInTime}
                    passengerCheckIns={bookingState.passengerCheckIns}
                    onCheckIn={() => handlePassengerCheckIn(booking.id)}
                  />
                );
              })}
            </div>
          </div>
        )}

        {recentCancellations.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-orange-600">VÉ BỊ HỦY GẦN ĐÂY</h2>
            <div className="space-y-2">
              {recentCancellations.map(booking => {
                if (booking.status === 'cancelled_by_driver' || booking.status === 'cancelled_by_passenger') {
                  return (
                    <CompactBookingCard
                      key={booking.id}
                      booking={booking}
                    />
                  );
                }
                return null;
              })}
            </div>
          </div>
        )}

        {pastBookings.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground">LỊCH SỬ</h2>
            <div className="space-y-2">
              {pastBookings.map(booking => {
                if (booking.status === 'completed' || booking.status === 'cancelled_by_driver' || booking.status === 'cancelled_by_passenger') {
                  return (
                    <CompactBookingCard
                      key={booking.id}
                      booking={booking}
                    />
                  );
                }
                return null;
              })}
            </div>
          </div>
        )}

        {mockBookings.length === 0 && (
          <Card className="p-8 text-center text-muted-foreground">
            Bạn chưa đặt chuyến xe nào
          </Card>
        )}
      </div>
    </div>
  );
}
