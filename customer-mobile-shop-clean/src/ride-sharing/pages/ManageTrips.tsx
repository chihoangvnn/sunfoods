'use client'

/**
 * ManageTrips - Driver trip management with real-time status tracking
 * 
 * Features:
 * - Driver check-in workflow with validation
 * - Trip status progression: pending → checked_in → in_progress → completed
 * - Real-time notifications to passengers on check-in and status changes
 * - Seat management and booking confirmation
 * 
 * PRODUCTION NOTE: Trip states are currently managed locally via component state.
 * For cross-page consistency (MyBookings, LiveDeparturesBoard), implement a shared
 * state solution (React Context, Zustand, or Redux) to sync tripStates across pages.
 */

import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Car, MapPin, Clock, CheckCircle2, Play, CheckCircle } from "lucide-react";
import { mockTrips, mockTripSeats, type TripStatus } from "@/ride-sharing/mockData";
import SeatSelector from "@/ride-sharing/components/SeatSelector";
import PassengerDetailsDialog from "@/ride-sharing/components/PassengerDetailsDialog";
import ShareButtons from "@/ride-sharing/components/ShareButtons";
import { TripStatusBadge } from "@/ride-sharing/components/TripStatusBadge";
import { DriverCheckInDialog } from "@/ride-sharing/components/DriverCheckInDialog";
import { DepartureCountdown } from "@/ride-sharing/components/DepartureCountdown";
import { canStartTrip, canCompleteTrip } from "@/ride-sharing/utils/tripValidation";
import type { Seat } from "@/ride-sharing/components/SeatSelector";

const AUTO_CONFIRM_KEY = "driver_auto_confirm_bookings";

interface TripState {
  status: TripStatus;
  checkInTime: string | null;
  actualDepartureTime: string | null;
  completedTime: string | null;
}

export default function ManageTrips() {
  const { toast } = useToast();
  const [tripSeats, setTripSeats] = useState(mockTripSeats);
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [autoConfirm, setAutoConfirm] = useState(false);
  const lastAutoConfirmedCountRef = useRef(0);
  
  const [tripStates, setTripStates] = useState<Record<string, TripState>>(() => {
    const initialStates: Record<string, TripState> = {};
    mockTrips.forEach(trip => {
      initialStates[trip.id] = {
        status: trip.status || "pending",
        checkInTime: trip.checkInTime || null,
        actualDepartureTime: trip.actualDepartureTime || null,
        completedTime: trip.completedTime || null,
      };
    });
    return initialStates;
  });

  useEffect(() => {
    const saved = localStorage.getItem(AUTO_CONFIRM_KEY);
    if (saved !== null) {
      setAutoConfirm(saved === "true");
    }
  }, []);

  useEffect(() => {
    if (!autoConfirm) {
      lastAutoConfirmedCountRef.current = 0;
      return;
    }

    let autoConfirmedCount = 0;
    let hasChanges = false;

    setTripSeats(prevSeats => {
      const updatedTripSeats: typeof prevSeats = {};

      Object.keys(prevSeats).forEach(tripId => {
        const seats = prevSeats[tripId];
        const pendingSeats = seats.filter(s => s.status === "pending_confirmation");
        
        if (pendingSeats.length > 0) {
          hasChanges = true;
          autoConfirmedCount += pendingSeats.length;
          updatedTripSeats[tripId] = seats.map(seat => 
            seat.status === "pending_confirmation"
              ? { ...seat, status: "confirmed" as const }
              : seat
          );
        } else {
          updatedTripSeats[tripId] = seats;
        }
      });

      if (hasChanges) {
        return { ...prevSeats, ...updatedTripSeats };
      }
      
      return prevSeats;
    });

    if (hasChanges && autoConfirmedCount > 0 && autoConfirmedCount !== lastAutoConfirmedCountRef.current) {
      lastAutoConfirmedCountRef.current = autoConfirmedCount;
      toast({
        title: "Đã tự động xác nhận",
        description: `${autoConfirmedCount} đặt chỗ đã được tự động xác nhận do chế độ tự động đang bật`,
      });
    }
  }, [autoConfirm, tripSeats]);

  const handleAutoConfirmToggle = (checked: boolean) => {
    setAutoConfirm(checked);
    localStorage.setItem(AUTO_CONFIRM_KEY, String(checked));
    
    toast({
      title: checked ? "Đã bật tự động xác nhận" : "Đã tắt tự động xác nhận",
      description: checked 
        ? "Các đặt chỗ mới sẽ được tự động xác nhận" 
        : "Bạn cần xác nhận thủ công các đặt chỗ mới",
    });
  };

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

  const getTripBorderColor = (status: TripStatus): string => {
    switch (status) {
      case "pending":
        return "border-l-4 border-l-yellow-500";
      case "checked_in":
        return "border-l-4 border-l-blue-500";
      case "in_progress":
        return "border-l-4 border-l-green-500";
      case "completed":
        return "border-l-4 border-l-gray-400";
      case "cancelled":
        return "border-l-4 border-l-red-500";
      default:
        return "border-l-4 border-l-gray-300";
    }
  };

  const handleSeatClick = (tripId: string, seatId: string) => {
    const seats = tripSeats[tripId] || [];
    const seat = seats.find(s => s.id === seatId);
    
    if (!seat || seat.status === "available") return;

    setSelectedSeat(seat);
    setSelectedTripId(tripId);
    setDetailsDialogOpen(true);
  };

  const handleConfirmBooking = (tripId: string, seatId: string) => {
    let passengerName = "";
    
    setTripSeats(prevSeats => {
      const seats = prevSeats[tripId] || [];
      const seat = seats.find(s => s.id === seatId);
      if (seat) passengerName = seat.passengerName || "";
      
      const updatedSeats = seats.map(s => 
        s.id === seatId 
          ? { ...s, status: "confirmed" as const }
          : s
      );

      return {
        ...prevSeats,
        [tripId]: updatedSeats
      };
    });

    toast({
      title: "Đã xác nhận đặt chỗ",
      description: `Ghế ${seatId}${passengerName ? ` của ${passengerName}` : ''} đã được xác nhận`,
    });

    setDetailsDialogOpen(false);
    setSelectedSeat(null);
  };

  const handleCancelBooking = (tripId: string, seatId: string) => {
    let passengerName = "";
    
    setTripSeats(prevSeats => {
      const seats = prevSeats[tripId] || [];
      const seat = seats.find(s => s.id === seatId);
      if (seat) passengerName = seat.passengerName || "";
      
      const updatedSeats = seats.map(s => 
        s.id === seatId 
          ? { 
              ...s, 
              status: "available" as const,
              passengerName: undefined,
              passengerPhone: undefined,
              passengerId: undefined,
              pickupLocation: undefined
            }
          : s
      );

      return {
        ...prevSeats,
        [tripId]: updatedSeats
      };
    });

    toast({
      title: "Đã hủy đặt chỗ",
      description: `Ghế ${seatId}${passengerName ? ` của ${passengerName}` : ''} đã được hủy và trở về trạng thái trống`,
      variant: "destructive",
    });

    setDetailsDialogOpen(false);
    setSelectedSeat(null);
  };

  const handleLockSeat = (tripId: string, seatId: string) => {
    setTripSeats(prevSeats => {
      const seats = prevSeats[tripId] || [];
      const seat = seats.find(s => s.id === seatId);
      
      if (!seat || seat.status !== "available") {
        return prevSeats;
      }
      
      const updatedSeats = seats.map(s => 
        s.id === seatId 
          ? { ...s, status: "locked" as const }
          : s
      );

      return {
        ...prevSeats,
        [tripId]: updatedSeats
      };
    });

    toast({
      title: "Đã khóa ghế",
      description: `Ghế ${seatId} đã được khóa và không thể đặt`,
    });
  };

  const handleUnlockSeat = (tripId: string, seatId: string) => {
    setTripSeats(prevSeats => {
      const seats = prevSeats[tripId] || [];
      const seat = seats.find(s => s.id === seatId);
      
      if (!seat || seat.status !== "locked") {
        return prevSeats;
      }
      
      const updatedSeats = seats.map(s => 
        s.id === seatId 
          ? { ...s, status: "available" as const }
          : s
      );

      return {
        ...prevSeats,
        [tripId]: updatedSeats
      };
    });

    toast({
      title: "Đã mở khóa ghế",
      description: `Ghế ${seatId} đã được mở khóa và có thể đặt`,
    });
  };

  const handleDriverCheckIn = async (tripId: string) => {
    const trip = mockTrips.find(t => t.id === tripId);
    if (!trip) return;

    setTripStates(prev => ({
      ...prev,
      [tripId]: {
        ...prev[tripId],
        status: "checked_in",
        checkInTime: new Date().toISOString(),
      }
    }));

    toast({
      title: "✅ Đã check-in thành công",
      description: "Hành khách sẽ nhận được thông báo. Bạn có thể khởi hành khi sẵn sàng.",
    });

    const currentTripSeats = tripSeats[tripId] || [];
    const confirmedPassengers = currentTripSeats.filter(s => s.status === "confirmed" && s.passengerId);
    
    for (const seat of confirmedPassengers) {
      if (seat.passengerId && seat.pickupLocation?.address) {
        try {
          await fetch('/api/ride/trips/notify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              eventType: 'booking_confirmed',
              data: {
                passengerId: seat.passengerId,
                tripId: trip.id,
                driverName: trip.driverName,
                vehicleModel: trip.vehicleModel,
                departureTime: trip.departureWindowStart,
                pickupLocation: seat.pickupLocation.address,
              }
            })
          });
        } catch (error) {
          console.error('Failed to send booking confirmation notification:', error);
        }
      }
    }
  };

  const handleStartTrip = async (tripId: string) => {
    const tripState = tripStates[tripId];
    const validation = canStartTrip(tripState.status, tripState.checkInTime);

    if (!validation.canStartTrip) {
      toast({
        title: "Không thể khởi hành",
        description: validation.reason,
        variant: "destructive",
      });
      return;
    }

    const trip = mockTrips.find(t => t.id === tripId);
    if (!trip) return;

    setTripStates(prev => ({
      ...prev,
      [tripId]: {
        ...prev[tripId],
        status: "in_progress",
        actualDepartureTime: new Date().toISOString(),
      }
    }));

    toast({
      title: "🚗 Chuyến đi đã khởi hành",
      description: "Chúc bạn đi đường an toàn!",
    });
  };

  const handleCompleteTrip = async (tripId: string) => {
    const tripState = tripStates[tripId];
    const validation = canCompleteTrip(tripState.status);

    if (!validation.canCompleteTrip) {
      toast({
        title: "Không thể hoàn thành",
        description: validation.reason,
        variant: "destructive",
      });
      return;
    }

    setTripStates(prev => ({
      ...prev,
      [tripId]: {
        ...prev[tripId],
        status: "completed",
        completedTime: new Date().toISOString(),
      }
    }));

    toast({
      title: "🎉 Chuyến đi đã hoàn thành",
      description: "Hành khách có thể đánh giá chuyến đi của bạn.",
    });
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Quản lý chuyến xe</h1>
        <p className="text-muted-foreground">Xem và xác nhận các yêu cầu đặt vé</p>
      </div>

      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <label htmlFor="auto-confirm" className="text-base font-medium cursor-pointer">
                Tự động xác nhận đặt chỗ
              </label>
            </div>
            <p className="text-sm text-muted-foreground">
              {autoConfirm 
                ? "Đặt chỗ mới sẽ được tự động xác nhận ngay lập tức" 
                : "Bạn cần xác nhận thủ công từng đặt chỗ mới"}
            </p>
          </div>
          <Switch
            id="auto-confirm"
            checked={autoConfirm}
            onCheckedChange={handleAutoConfirmToggle}
          />
        </div>
      </Card>

      <div className="space-y-6">
        {mockTrips.map(trip => {
          const currentTripSeats = tripSeats[trip.id] || [];
          const pendingCount = currentTripSeats.filter(s => s.status === "pending_confirmation").length;
          const confirmedCount = currentTripSeats.filter(s => s.status === "confirmed").length;
          const lockedCount = currentTripSeats.filter(s => s.status === "locked").length;
          const availableCount = currentTripSeats.filter(s => s.status === "available").length;
          const tripState = tripStates[trip.id] || { status: "pending", checkInTime: null, actualDepartureTime: null, completedTime: null };
          
          return (
          <Card key={trip.id} className={`p-6 ${getTripBorderColor(tripState.status)}`}>
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <h2 className="text-xl font-semibold">
                      {trip.startLocation} → {trip.endLocation}
                    </h2>
                    <TripStatusBadge status={tripState.status} />
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{formatDate(trip.departureWindowStart)}</span>
                    <span>•</span>
                    <span>
                      {formatTime(trip.departureWindowStart)} - {formatTime(trip.departureWindowEnd)}
                    </span>
                  </div>
                  <DepartureCountdown departureWindowStart={trip.departureWindowStart} />
                  <div className="flex items-center gap-2 text-sm">
                    <Car className="h-4 w-4 text-muted-foreground" />
                    <span>{trip.vehicleModel} • {trip.licensePlate}</span>
                  </div>
                </div>

                <div className="text-right space-y-2">
                  <div className="flex flex-col gap-1">
                    {pendingCount > 0 && (
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        {pendingCount} chờ XN
                      </Badge>
                    )}
                    {confirmedCount > 0 && (
                      <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                        {confirmedCount} đã XN
                      </Badge>
                    )}
                    {lockedCount > 0 && (
                      <Badge variant="secondary" className="bg-gray-300 text-gray-700">
                        {lockedCount} khóa
                      </Badge>
                    )}
                    <Badge variant={availableCount > 0 ? "default" : "secondary"}>
                      {availableCount} trống
                    </Badge>
                  </div>
                  <p className="text-sm font-medium text-primary">
                    {formatPrice(trip.pricePerSeat)}/chỗ
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {tripState.status === "pending" && (
                  <DriverCheckInDialog
                    tripId={trip.id}
                    status={tripState.status}
                    departureWindowStart={trip.departureWindowStart}
                    checkInTime={tripState.checkInTime}
                    startLocation={trip.startLocation}
                    endLocation={trip.endLocation}
                    bookedSeats={confirmedCount}
                    totalSeats={trip.totalSeats}
                    onCheckIn={() => handleDriverCheckIn(trip.id)}
                  />
                )}
                
                {tripState.status === "checked_in" && (
                  <Button 
                    onClick={() => handleStartTrip(trip.id)}
                    size="sm"
                    className="gap-2"
                  >
                    <Play className="h-4 w-4" />
                    Khởi hành
                  </Button>
                )}
                
                {tripState.status === "in_progress" && (
                  <Button 
                    onClick={() => handleCompleteTrip(trip.id)}
                    size="sm"
                    className="gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Hoàn thành
                  </Button>
                )}
              </div>

              <div className="pb-4 pt-2">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-muted-foreground">Chia sẻ chuyến xe:</span>
                </div>
                <ShareButtons
                  tripId={trip.id}
                  tripRoute={`${trip.startLocation} → ${trip.endLocation}`}
                  driverId={trip.driverId || ""}
                />
              </div>

              <div className="border-t pt-4">
                <SeatSelector
                  seatType={trip.seatType as 4 | 7}
                  seats={currentTripSeats}
                  onSeatClick={(seatId) => handleSeatClick(trip.id, seatId)}
                  onLockSeat={(seatId) => handleLockSeat(trip.id, seatId)}
                  onUnlockSeat={(seatId) => handleUnlockSeat(trip.id, seatId)}
                  mode="driver"
                />
              </div>
            </div>
          </Card>
          );
        })}

        {mockTrips.length === 0 && (
          <Card className="p-8 text-center text-muted-foreground">
            Bạn chưa tạo chuyến xe nào
          </Card>
        )}
      </div>

      <PassengerDetailsDialog
        open={detailsDialogOpen}
        onClose={() => {
          setDetailsDialogOpen(false);
          setSelectedSeat(null);
          setSelectedTripId(null);
        }}
        seat={selectedSeat}
        onConfirm={(seatId) => {
          if (selectedSeat && selectedTripId) {
            handleConfirmBooking(selectedTripId, seatId);
          }
        }}
        onCancel={(seatId) => {
          if (selectedTripId) {
            handleCancelBooking(selectedTripId, seatId);
          }
        }}
        pricePerSeat={
          selectedTripId
            ? mockTrips.find(t => t.id === selectedTripId)?.pricePerSeat || 0
            : 0
        }
      />
    </div>
  );
}
