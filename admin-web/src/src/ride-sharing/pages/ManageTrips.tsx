import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Car, MapPin, Clock } from "lucide-react";
import { mockTrips, mockTripSeats } from "@/ride-sharing/mockData";
import SeatSelector from "@/ride-sharing/components/SeatSelector";
import PassengerDetailsDialog from "@/ride-sharing/components/PassengerDetailsDialog";
import type { Seat } from "@/ride-sharing/components/SeatSelector";

export default function ManageTrips() {
  const { toast } = useToast();
  const [tripSeats, setTripSeats] = useState(mockTripSeats);
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

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

  const handleSeatClick = (tripId: string, seatId: string) => {
    const seats = tripSeats[tripId] || [];
    const seat = seats.find(s => s.id === seatId);
    
    if (!seat || seat.status === "available") return;

    setSelectedSeat(seat);
    setSelectedTripId(tripId);
    setDetailsDialogOpen(true);
  };

  const handleConfirmBooking = (tripId: string, seatId: string) => {
    const seats = tripSeats[tripId] || [];
    const updatedSeats = seats.map(seat => 
      seat.id === seatId 
        ? { ...seat, status: "confirmed" as const }
        : seat
    );

    setTripSeats({
      ...tripSeats,
      [tripId]: updatedSeats
    });

    const seat = seats.find(s => s.id === seatId);
    
    toast({
      title: "Đã xác nhận đặt chỗ",
      description: `Ghế ${seatId} của ${seat?.passengerName} đã được xác nhận`,
    });

    setDetailsDialogOpen(false);
    setSelectedSeat(null);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Quản lý chuyến xe</h1>
        <p className="text-muted-foreground">Xem và xác nhận các yêu cầu đặt vé</p>
      </div>

      <div className="space-y-6">
        {mockTrips.map(trip => {
          const currentTripSeats = tripSeats[trip.id] || [];
          const pendingCount = currentTripSeats.filter(s => s.status === "pending_confirmation").length;
          const confirmedCount = currentTripSeats.filter(s => s.status === "confirmed").length;
          const availableCount = currentTripSeats.filter(s => s.status === "available").length;
          
          return (
          <Card key={trip.id} className="p-6">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <h2 className="text-xl font-semibold">
                      {trip.startLocation} → {trip.endLocation}
                    </h2>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{formatDate(trip.departureWindowStart)}</span>
                    <span>•</span>
                    <span>
                      {formatTime(trip.departureWindowStart)} - {formatTime(trip.departureWindowEnd)}
                    </span>
                  </div>
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
                    <Badge variant={availableCount > 0 ? "default" : "secondary"}>
                      {availableCount} trống
                    </Badge>
                  </div>
                  <p className="text-sm font-medium text-primary">
                    {formatPrice(trip.pricePerSeat)}/chỗ
                  </p>
                </div>
              </div>

              <div className="border-t pt-4">
                <SeatSelector
                  seatType={trip.seatType as 4 | 7}
                  seats={currentTripSeats}
                  onSeatClick={(seatId) => handleSeatClick(trip.id, seatId)}
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
        pricePerSeat={
          selectedTripId
            ? mockTrips.find(t => t.id === selectedTripId)?.pricePerSeat || 0
            : 0
        }
      />
    </div>
  );
}
