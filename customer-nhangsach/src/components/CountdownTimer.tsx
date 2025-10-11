'use client';

import { useState, useEffect } from 'react';

interface CountdownTimerProps {
  targetDate: string | Date;
}

export default function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState('');
  
  useEffect(() => {
    const calculateTimeLeft = () => {
      const target = new Date(targetDate).getTime();
      const now = new Date().getTime();
      const diff = target - now;
      
      if (diff <= 0) {
        setTimeLeft('Đã đến hạn');
        return;
      }
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      if (days > 0) {
        setTimeLeft(`Còn ${days} ngày ${hours} giờ`);
      } else if (hours > 0) {
        setTimeLeft(`Còn ${hours} giờ ${minutes} phút`);
      } else {
        setTimeLeft(`Còn ${minutes} phút`);
      }
    };
    
    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 60000);
    
    return () => clearInterval(interval);
  }, [targetDate]);
  
  return (
    <p className="text-xs text-orange-600 font-medium">
      ⏰ {timeLeft} để đặt hàng
    </p>
  );
}
