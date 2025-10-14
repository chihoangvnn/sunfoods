'use client';

import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface FlashSaleCountdownProps {
  endTime: string | Date;
  compact?: boolean;
}

export default function FlashSaleCountdown({ endTime, compact = false }: FlashSaleCountdownProps) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0, expired: false });
  
  useEffect(() => {
    const calculateTimeLeft = () => {
      const target = new Date(endTime).getTime();
      const now = new Date().getTime();
      const diff = target - now;
      
      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, expired: true });
        return;
      }
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeLeft({ hours, minutes, seconds, expired: false });
    };
    
    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    
    return () => clearInterval(interval);
  }, [endTime]);

  if (timeLeft.expired) {
    return (
      <div className="text-center py-4">
        <p className="text-lg font-bold text-gray-500">🕐 Đã hết hạn</p>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <Clock className="h-4 w-4 text-red-600" />
        <span className="font-medium text-red-600">
          Còn {timeLeft.hours}h {timeLeft.minutes}p {timeLeft.seconds}s
        </span>
      </div>
    );
  }
  
  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-2 mb-2">
        <Clock className="h-6 w-6 text-white animate-pulse" />
        <p className="text-sm font-medium text-white/90">KẾT THÚC SAU</p>
      </div>
      <div className="flex justify-center gap-3">
        <div className="flex flex-col items-center bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 min-w-[70px]">
          <span className="text-3xl font-bold text-white tabular-nums">
            {String(timeLeft.hours).padStart(2, '0')}
          </span>
          <span className="text-xs text-white/80 mt-1">Giờ</span>
        </div>
        <div className="flex items-center">
          <span className="text-3xl font-bold text-white">:</span>
        </div>
        <div className="flex flex-col items-center bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 min-w-[70px]">
          <span className="text-3xl font-bold text-white tabular-nums">
            {String(timeLeft.minutes).padStart(2, '0')}
          </span>
          <span className="text-xs text-white/80 mt-1">Phút</span>
        </div>
        <div className="flex items-center">
          <span className="text-3xl font-bold text-white">:</span>
        </div>
        <div className="flex flex-col items-center bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 min-w-[70px]">
          <span className="text-3xl font-bold text-white tabular-nums">
            {String(timeLeft.seconds).padStart(2, '0')}
          </span>
          <span className="text-xs text-white/80 mt-1">Giây</span>
        </div>
      </div>
      <p className="text-sm text-white/90 mt-3">
        ⏰ Còn {timeLeft.hours} giờ {timeLeft.minutes} phút
      </p>
    </div>
  );
}
