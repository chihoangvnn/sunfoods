'use client'

import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface ShippingCountdownProps {
  className?: string;
}

export function ShippingCountdown({ className = '' }: ShippingCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [shippingType, setShippingType] = useState<'morning' | 'afternoon'>('morning');

  useEffect(() => {
    const calculateShipping = () => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();

      // Morning deadline: 10:30 AM
      const morningDeadline = new Date();
      morningDeadline.setHours(10, 30, 0, 0);

      // Afternoon deadline: 5:00 PM (17:00)
      const afternoonDeadline = new Date();
      afternoonDeadline.setHours(17, 0, 0, 0);

      if (currentHour < 10 || (currentHour === 10 && currentMinute < 30)) {
        // Before 10:30 AM - show morning shipping
        setShippingType('morning');
        const diff = morningDeadline.getTime() - now.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLeft(`${hours}h ${minutes}p`);
      } else if (currentHour < 17) {
        // Between 10:30 AM and 5:00 PM - show afternoon shipping
        setShippingType('afternoon');
        const diff = afternoonDeadline.getTime() - now.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLeft(`${hours}h ${minutes}p`);
      } else {
        // After 5:00 PM - show next morning
        setShippingType('morning');
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(10, 30, 0, 0);
        const diff = tomorrow.getTime() - now.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        setTimeLeft(`${hours}h`);
      }
    };

    calculateShipping();
    const interval = setInterval(calculateShipping, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`flex items-center gap-1.5 text-xs ${className}`}>
      <Clock className="h-3.5 w-3.5 text-orange-500" />
      <span className="text-gray-600">
        {shippingType === 'morning' ? (
          <>Giao <span className="font-semibold text-orange-600">sáng trước 10h30</span> {timeLeft && `(còn ${timeLeft})`}</>
        ) : (
          <>Giao <span className="font-semibold text-orange-600">chiều trước 17h</span> {timeLeft && `(còn ${timeLeft})`}</>
        )}
      </span>
    </div>
  );
}
