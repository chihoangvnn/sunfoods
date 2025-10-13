'use client'

import React from 'react';
import { Leaf, Clock, MapPin } from 'lucide-react';

interface OrganicProductBadgeProps {
  type: 'certified' | 'fresh' | 'local';
  text?: string;
  size?: 'sm' | 'md';
}

export function OrganicProductBadge({ type, text, size = 'sm' }: OrganicProductBadgeProps) {
  const badges = {
    certified: {
      icon: <Leaf className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} />,
      bgColor: 'bg-sunrise-leaf/10',
      textColor: 'text-sunrise-leaf',
      borderColor: 'border-sunrise-leaf/20',
      defaultText: 'Organic'
    },
    fresh: {
      icon: <Clock className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} />,
      bgColor: 'bg-category-fruits/10',
      textColor: 'text-category-fruits',
      borderColor: 'border-category-fruits/20',
      defaultText: 'Tươi hôm nay'
    },
    local: {
      icon: <MapPin className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} />,
      bgColor: 'bg-category-pantry/10',
      textColor: 'text-category-pantry',
      borderColor: 'border-category-pantry/20',
      defaultText: 'Farm Việt Nam'
    }
  };

  const badge = badges[type];
  const displayText = text || badge.defaultText;

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border ${badge.bgColor} ${badge.textColor} ${badge.borderColor}`}>
      {badge.icon}
      <span className={size === 'sm' ? 'text-xs font-medium' : 'text-sm font-semibold'}>
        {displayText}
      </span>
    </div>
  );
}
