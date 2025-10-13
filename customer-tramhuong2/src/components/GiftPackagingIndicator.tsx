'use client'

import React from 'react';
import { Gift } from 'lucide-react';

interface GiftPackagingIndicatorProps {
  isGiftReady?: boolean;
  className?: string;
}

export const GiftPackagingIndicator: React.FC<GiftPackagingIndicatorProps> = ({ 
  isGiftReady = true,
  className = '' 
}) => {
  if (!isGiftReady) return null;

  return (
    <div 
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gradient-to-r from-pink-100 to-rose-100 border border-pink-300/50 ${className}`}
    >
      <Gift className="h-3.5 w-3.5 text-rose-600" strokeWidth={2} />
      <span className="text-xs font-nunito font-medium text-rose-700">
        Đóng hộp miễn phí
      </span>
    </div>
  );
};
