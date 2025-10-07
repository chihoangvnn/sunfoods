'use client'

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { getMinutesUntilDeparture } from "../utils/tripValidation";

interface DepartureCountdownProps {
  departureWindowStart: string;
  className?: string;
}

export function DepartureCountdown({ departureWindowStart, className }: DepartureCountdownProps) {
  const [mounted, setMounted] = useState(false);
  const [minutesLeft, setMinutesLeft] = useState(0);

  useEffect(() => {
    setMounted(true);
    setMinutesLeft(getMinutesUntilDeparture(departureWindowStart));
  }, [departureWindowStart]);

  useEffect(() => {
    if (!mounted) return;
    
    const interval = setInterval(() => {
      setMinutesLeft(getMinutesUntilDeparture(departureWindowStart));
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [mounted, departureWindowStart]);

  const getCountdownText = () => {
    if (minutesLeft < 0) {
      return `Đã khởi hành ${Math.abs(minutesLeft)} phút trước`;
    } else if (minutesLeft === 0) {
      return "Đang khởi hành";
    } else if (minutesLeft < 60) {
      return `Còn ${minutesLeft} phút`;
    } else {
      const hours = Math.floor(minutesLeft / 60);
      const mins = minutesLeft % 60;
      return `Còn ${hours}h${mins > 0 ? ` ${mins}p` : ''}`;
    }
  };

  const getCountdownColor = () => {
    if (minutesLeft < 0) {
      return "text-muted-foreground";
    } else if (minutesLeft <= 15) {
      return "text-red-600 font-semibold animate-pulse";
    } else if (minutesLeft <= 30) {
      return "text-orange-600 font-semibold";
    } else {
      return "text-green-600";
    }
  };

  if (!mounted) {
    return (
      <div className={`flex items-center gap-1.5 ${className}`}>
        <Clock className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Đang tải...</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <Clock className={`h-4 w-4 ${getCountdownColor()}`} />
      <span className={`text-sm ${getCountdownColor()}`}>
        {getCountdownText()}
      </span>
    </div>
  );
}
