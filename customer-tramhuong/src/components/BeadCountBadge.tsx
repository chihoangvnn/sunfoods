'use client'

import React from 'react';
import { Circle } from 'lucide-react';

interface BeadCountBadgeProps {
  count: number;
  size?: string;
  className?: string;
}

export const BeadCountBadge: React.FC<BeadCountBadgeProps> = ({ 
  count, 
  size,
  className = '' 
}) => {
  return (
    <div 
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-tramhuong-accent/90 backdrop-blur-sm border border-white/40 shadow-lg ${className}`}
    >
      <Circle className="h-3 w-3 text-white" strokeWidth={2} />
      <span className="text-xs font-nunito font-semibold text-white">
        {size ? `${size} - ` : ''}{count} hạt
      </span>
    </div>
  );
};
