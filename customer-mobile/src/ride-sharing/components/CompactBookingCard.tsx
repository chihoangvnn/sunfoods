interface CompactBookingCardProps {
  booking: {
    id: string;
    seatsBooked: number;
    status: "completed" | "cancelled_by_passenger" | "cancelled_by_driver";
    trip: {
      startLocation: string;
      endLocation: string;
      departureWindowStart: string;
      pricePerSeat: number;
    };
  };
}

export function CompactBookingCard({ booking }: CompactBookingCardProps) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
    });
  };

  const formatPrice = (price: number) => {
    return `${(price / 1000).toFixed(0)}K`;
  };

  const getStatusDisplay = (status: CompactBookingCardProps['booking']['status']) => {
    switch (status) {
      case 'completed':
        return { text: '✓ Hoàn thành', className: 'text-green-600' };
      case 'cancelled_by_passenger':
        return { text: '✕ Bạn hủy', className: 'text-red-600' };
      case 'cancelled_by_driver':
        return { text: '✕ Tài xế hủy', className: 'text-orange-600' };
    }
  };

  const totalPrice = booking.trip.pricePerSeat * booking.seatsBooked;
  const statusInfo = getStatusDisplay(booking.status);

  return (
    <div className="flex items-center gap-2 py-2 px-3 bg-gray-50 rounded-lg text-sm text-gray-600 border border-gray-200">
      <div className="flex-1 flex items-center gap-1.5 overflow-hidden">
        <span className="font-medium truncate">
          {booking.trip.startLocation} → {booking.trip.endLocation}
        </span>
        <span className="text-gray-400">•</span>
        <span className="whitespace-nowrap">{formatDate(booking.trip.departureWindowStart)}</span>
        <span className="text-gray-400">•</span>
        <span className="font-semibold whitespace-nowrap">{formatPrice(totalPrice)}</span>
      </div>
      <span className={`text-xs font-medium whitespace-nowrap ${statusInfo.className}`}>
        {statusInfo.text}
      </span>
    </div>
  );
}
