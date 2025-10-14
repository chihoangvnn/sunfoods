"use client";

import React, { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Clock, Calendar, Tag, Star, Zap } from 'lucide-react';

interface ProductBadges {
  organic?: boolean;
  fresh?: boolean;
  newArrival?: boolean;
  live?: boolean;
  preorder?: boolean;
  deal?: boolean;
  shippingTime?: string | null; // "10:30" or "17:00"
}

interface DynamicBadgeProps {
  badges?: ProductBadges | null;
  className?: string;
  variant?: 'overlay' | 'inline';
}

interface BadgeConfig {
  icon: React.ElementType;
  label: string;
  color: string;
  bgColor: string;
  show: boolean;
}

export function DynamicBadge({ badges, className = '', variant = 'overlay' }: DynamicBadgeProps) {
  const badgeConfigs: BadgeConfig[] = useMemo(() => {
    if (!badges) return [];
    
    return [
      {
        icon: Star,
        label: 'Hữu cơ',
        color: 'text-green-700',
        bgColor: 'bg-green-100',
        show: badges.organic || false
      },
      {
        icon: Sparkles,
        label: 'Tươi hôm nay',
        color: 'text-blue-700',
        bgColor: 'bg-blue-100',
        show: badges.fresh || false
      },
      {
        icon: Tag,
        label: 'Hàng mới về',
        color: 'text-purple-700',
        bgColor: 'bg-purple-100',
        show: badges.newArrival || false
      },
      {
        icon: Zap,
        label: 'Tươi sống',
        color: 'text-cyan-700',
        bgColor: 'bg-cyan-100',
        show: badges.live || false
      },
      {
        icon: Calendar,
        label: 'Đặt trước',
        color: 'text-orange-700',
        bgColor: 'bg-orange-100',
        show: badges.preorder || false
      },
      {
        icon: Tag,
        label: 'Ưu đãi',
        color: 'text-red-700',
        bgColor: 'bg-red-100',
        show: badges.deal || false
      },
    ].filter(config => config.show);
  }, [badges]);

  const shippingCountdown = useMemo(() => {
    if (!badges?.shippingTime) return null;

    const now = new Date();
    const [hours, minutes] = badges.shippingTime.split(':').map(Number);
    const shippingDate = new Date();
    shippingDate.setHours(hours, minutes, 0, 0);

    // If shipping time has passed today, show next day
    if (shippingDate < now) {
      shippingDate.setDate(shippingDate.getDate() + 1);
    }

    const diff = shippingDate.getTime() - now.getTime();
    const hoursLeft = Math.floor(diff / (1000 * 60 * 60));
    const minutesLeft = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hoursLeft <= 0 && minutesLeft <= 0) return null;

    return {
      label: `Giao ${badges.shippingTime} ${hoursLeft > 0 ? `(${hoursLeft}h${minutesLeft}p)` : `(${minutesLeft}p)`}`,
      urgent: hoursLeft < 2
    };
  }, [badges?.shippingTime]);

  if (badgeConfigs.length === 0 && !shippingCountdown) {
    return null;
  }

  if (variant === 'overlay') {
    return (
      <div className={`absolute top-2 left-2 right-2 flex flex-col gap-1 z-10 ${className}`}>
        {/* Product badges */}
        <div className="flex flex-wrap gap-1">
          {badgeConfigs.slice(0, 2).map((config, index) => {
            const Icon = config.icon;
            return (
              <Badge 
                key={index}
                className={`${config.bgColor} ${config.color} text-xs px-1.5 py-0.5 font-medium shadow-sm`}
              >
                <Icon className="h-3 w-3 mr-0.5" />
                {config.label}
              </Badge>
            );
          })}
        </div>
        
        {/* Shipping countdown */}
        {shippingCountdown && (
          <Badge 
            className={`${shippingCountdown.urgent ? 'bg-red-500 text-white' : 'bg-yellow-100 text-yellow-800'} text-xs px-1.5 py-0.5 font-medium shadow-sm w-fit`}
          >
            <Clock className="h-3 w-3 mr-0.5" />
            {shippingCountdown.label}
          </Badge>
        )}
      </div>
    );
  }

  // Inline variant
  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {badgeConfigs.map((config, index) => {
        const Icon = config.icon;
        return (
          <Badge 
            key={index}
            className={`${config.bgColor} ${config.color} text-xs px-1.5 py-0.5 font-medium`}
          >
            <Icon className="h-3 w-3 mr-0.5" />
            {config.label}
          </Badge>
        );
      })}
      
      {shippingCountdown && (
        <Badge 
          className={`${shippingCountdown.urgent ? 'bg-red-500 text-white' : 'bg-yellow-100 text-yellow-800'} text-xs px-1.5 py-0.5 font-medium`}
        >
          <Clock className="h-3 w-3 mr-0.5" />
          {shippingCountdown.label}
        </Badge>
      )}
    </div>
  );
}
