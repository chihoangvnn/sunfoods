import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Timer } from "lucide-react";
import { Link } from "wouter";

interface TripCardProps {
  trip: {
    id: string;
    driverName: string;
    driverRating: number;
    vehicleModel: string;
    seatType: number;
    licensePlate: string;
    startLocation: string;
    endLocation: string;
    departureWindowStart: string;
    departureWindowEnd: string;
    availableSeats: number;
    pricePerSeat: number;
  };
}

export function TripCard({ trip }: TripCardProps) {
  const [countdown, setCountdown] = useState<{ minutes: number; seconds: number; totalMinutes: number; difference: number } | null>(null);

  useEffect(() => {
    const calculateCountdown = () => {
      const now = new Date().getTime();
      const departureTime = new Date(trip.departureWindowStart).getTime();
      const difference = departureTime - now;

      if (difference <= 0) {
        setCountdown({ minutes: 0, seconds: 0, totalMinutes: 0, difference });
      } else {
        const minutes = Math.floor(difference / 60000);
        const seconds = Math.floor((difference % 60000) / 1000);
        setCountdown({ minutes, seconds, totalMinutes: minutes, difference });
      }
    };

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 1000);

    return () => clearInterval(interval);
  }, [trip.departureWindowStart]);

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatPriceShort = (price: number) => {
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1).replace(/\.0$/, '')}tr`;
    } else if (price >= 1000) {
      return `${(price / 1000).toFixed(0)}k`;
    }
    return `${price}`;
  };

  const getCountdownStatus = () => {
    if (!countdown) return { text: "Đang tải...", color: "bg-gray-500", textColor: "text-white" };
    
    const TEN_MINUTES_MS = 10 * 60 * 1000;
    const THIRTY_MINUTES_MS = 30 * 60 * 1000;
    
    if (countdown.difference <= 0) {
      return { text: "Đã xuất phát", color: "bg-gray-400", textColor: "text-white" };
    } else if (countdown.difference < TEN_MINUTES_MS) {
      return { text: "Khẩn cấp!", color: "bg-red-500", textColor: "text-white" };
    } else if (countdown.difference <= THIRTY_MINUTES_MS) {
      return { text: "Sắp xuất phát", color: "bg-yellow-500", textColor: "text-white" };
    } else {
      return { text: "", color: "bg-green-500", textColor: "text-white" };
    }
  };

  const status = getCountdownStatus();

  return (
    <Card className="p-3 hover:shadow-md transition-shadow">
      <div className="flex gap-3 h-full">
        <div className="flex-1 space-y-1.5">
          <div className="font-semibold text-base">
            {trip.vehicleModel} {trip.seatType} chỗ
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4" />
            {formatTime(trip.departureWindowStart)} - {formatTime(trip.departureWindowEnd)}
          </div>
          
          <div className="text-sm">
            <span className="text-muted-foreground">👥 {trip.availableSeats} chỗ</span>
            <span className="text-muted-foreground"> • </span>
            <span className="text-emerald-700 font-semibold">💰 {formatPriceShort(trip.pricePerSeat)}</span>
          </div>
          
          <div className={`${status.color} ${status.textColor} rounded px-2 py-1.5 inline-flex items-center gap-2 text-sm w-fit`}>
            <Timer className="h-4 w-4" />
            {countdown && countdown.difference > 0 ? (
              <>
                Còn {countdown.minutes}p{countdown.seconds}s
                {status.text && <span>• {status.text}</span>}
              </>
            ) : (
              <span>{status.text}</span>
            )}
          </div>
        </div>
        
        <Link href={`/ride-trip/${trip.id}`}>
          <Button className="h-full w-28 flex items-center justify-center bg-orange-700 hover:bg-orange-800 text-white font-bold">
            Đặt chỗ ngay
          </Button>
        </Link>
      </div>
    </Card>
  );
}
