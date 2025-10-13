'use client'

import React from 'react';
import { Leaf, Shield, Clock, MapPin, Sparkles, Truck } from 'lucide-react';

export type BadgeType = 
  | 'organic' | 'vietgap' | 'safe-farming'
  | 'fresh-today' | 'new-harvest' | 'fast-delivery'
  | 'new-arrival' | 'fresh-live' | 'pre-order' | 'deal'
  | 'farm-dalat' | 'farm-sapa' | 'farm-mekong'
  | 'usa' | 'australia' | 'thailand' | 'newzealand' | 'japan' | 'korea';

interface OrganicBadgesProps {
  type: BadgeType;
  size?: 'sm' | 'md';
  variant?: 'solid' | 'outlined';
}

export function OrganicBadges({ type, size = 'sm', variant = 'solid' }: OrganicBadgesProps) {
  const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';
  const textSize = size === 'sm' ? 'text-[10px]' : 'text-xs';
  const padding = size === 'sm' ? 'px-2 py-0.5' : 'px-3 py-1';

  const badgeConfig: Record<BadgeType, {
    label: string;
    icon?: React.ReactNode;
    flag?: string;
    solidBg: string;
    solidText: string;
    outlinedBg: string;
    outlinedText: string;
    outlinedBorder: string;
  }> = {
    // Certification badges
    'organic': {
      label: '100% Organic',
      icon: <Leaf className={iconSize} />,
      solidBg: 'bg-sunrise-leaf',
      solidText: 'text-white',
      outlinedBg: 'bg-sunrise-leaf/10',
      outlinedText: 'text-sunrise-leaf',
      outlinedBorder: 'border-sunrise-leaf/30'
    },
    'vietgap': {
      label: 'VietGAP',
      icon: <Shield className={iconSize} />,
      solidBg: 'bg-green-600',
      solidText: 'text-white',
      outlinedBg: 'bg-green-50',
      outlinedText: 'text-green-700',
      outlinedBorder: 'border-green-300'
    },
    'safe-farming': {
      label: 'Canh Tác An Toàn',
      icon: <Shield className={iconSize} />,
      solidBg: 'bg-emerald-600',
      solidText: 'text-white',
      outlinedBg: 'bg-emerald-50',
      outlinedText: 'text-emerald-700',
      outlinedBorder: 'border-emerald-300'
    },
    
    // Freshness badges
    'fresh-today': {
      label: 'Tươi Hôm Nay',
      icon: <Sparkles className={iconSize} />,
      solidBg: 'bg-warm-sun',
      solidText: 'text-gray-900',
      outlinedBg: 'bg-warm-sun/20',
      outlinedText: 'text-warm-sun',
      outlinedBorder: 'border-warm-sun/40'
    },
    'new-harvest': {
      label: 'Mới Thu Hoạch',
      icon: <Clock className={iconSize} />,
      solidBg: 'bg-cyan-500',
      solidText: 'text-white',
      outlinedBg: 'bg-cyan-50',
      outlinedText: 'text-cyan-700',
      outlinedBorder: 'border-cyan-300'
    },
    'fast-delivery': {
      label: 'Giao Trong 2H',
      icon: <Truck className={iconSize} />,
      solidBg: 'bg-orange-500',
      solidText: 'text-white',
      outlinedBg: 'bg-orange-50',
      outlinedText: 'text-orange-600',
      outlinedBorder: 'border-orange-300'
    },
    'new-arrival': {
      label: 'Hàng Mới Về',
      icon: <Sparkles className={iconSize} />,
      solidBg: 'bg-pink-500',
      solidText: 'text-white',
      outlinedBg: 'bg-pink-50',
      outlinedText: 'text-pink-600',
      outlinedBorder: 'border-pink-300'
    },
    'fresh-live': {
      label: 'Hàng Tươi Sống',
      icon: <Leaf className={iconSize} />,
      solidBg: 'bg-emerald-500',
      solidText: 'text-white',
      outlinedBg: 'bg-emerald-50',
      outlinedText: 'text-emerald-700',
      outlinedBorder: 'border-emerald-300'
    },
    'pre-order': {
      label: 'Hàng Orders',
      icon: <Clock className={iconSize} />,
      solidBg: 'bg-indigo-500',
      solidText: 'text-white',
      outlinedBg: 'bg-indigo-50',
      outlinedText: 'text-indigo-700',
      outlinedBorder: 'border-indigo-300'
    },
    'deal': {
      label: 'Hàng Ưu Đãi',
      icon: <Sparkles className={iconSize} />,
      solidBg: 'bg-red-500',
      solidText: 'text-white',
      outlinedBg: 'bg-red-50',
      outlinedText: 'text-red-600',
      outlinedBorder: 'border-red-300'
    },

    // Farm origin badges
    'farm-dalat': {
      label: 'Farm Đà Lạt',
      icon: <MapPin className={iconSize} />,
      solidBg: 'bg-purple-500',
      solidText: 'text-white',
      outlinedBg: 'bg-white',
      outlinedText: 'text-purple-700',
      outlinedBorder: 'border-purple-300'
    },
    'farm-sapa': {
      label: 'Farm Sapa',
      icon: <MapPin className={iconSize} />,
      solidBg: 'bg-blue-500',
      solidText: 'text-white',
      outlinedBg: 'bg-white',
      outlinedText: 'text-blue-700',
      outlinedBorder: 'border-blue-300'
    },
    'farm-mekong': {
      label: 'Farm Mekong',
      icon: <MapPin className={iconSize} />,
      solidBg: 'bg-teal-500',
      solidText: 'text-white',
      outlinedBg: 'bg-white',
      outlinedText: 'text-teal-700',
      outlinedBorder: 'border-teal-300'
    },

    // Country flags
    'usa': {
      label: 'USA',
      flag: '🇺🇸',
      solidBg: 'bg-blue-600',
      solidText: 'text-white',
      outlinedBg: 'bg-white',
      outlinedText: 'text-blue-700',
      outlinedBorder: 'border-blue-300'
    },
    'australia': {
      label: 'Úc',
      flag: '🇦🇺',
      solidBg: 'bg-blue-700',
      solidText: 'text-white',
      outlinedBg: 'bg-white',
      outlinedText: 'text-blue-800',
      outlinedBorder: 'border-blue-300'
    },
    'thailand': {
      label: 'Thái Lan',
      flag: '🇹🇭',
      solidBg: 'bg-red-600',
      solidText: 'text-white',
      outlinedBg: 'bg-white',
      outlinedText: 'text-red-700',
      outlinedBorder: 'border-red-300'
    },
    'newzealand': {
      label: 'New Zealand',
      flag: '🇳🇿',
      solidBg: 'bg-slate-700',
      solidText: 'text-white',
      outlinedBg: 'bg-white',
      outlinedText: 'text-slate-800',
      outlinedBorder: 'border-slate-300'
    },
    'japan': {
      label: 'Nhật Bản',
      flag: '🇯🇵',
      solidBg: 'bg-red-500',
      solidText: 'text-white',
      outlinedBg: 'bg-white',
      outlinedText: 'text-red-600',
      outlinedBorder: 'border-red-300'
    },
    'korea': {
      label: 'Hàn Quốc',
      flag: '🇰🇷',
      solidBg: 'bg-blue-500',
      solidText: 'text-white',
      outlinedBg: 'bg-white',
      outlinedText: 'text-blue-600',
      outlinedBorder: 'border-blue-300'
    }
  };

  const config = badgeConfig[type];

  if (variant === 'solid') {
    return (
      <div className={`inline-flex items-center gap-1 ${padding} rounded-full ${config.solidBg} ${config.solidText} font-semibold ${textSize} shadow-sm`}>
        {config.flag && <span className="text-sm">{config.flag}</span>}
        {config.icon}
        <span>{config.label}</span>
      </div>
    );
  }

  // Outlined variant
  return (
    <div className={`inline-flex items-center gap-1 ${padding} rounded-full border ${config.outlinedBg} ${config.outlinedText} ${config.outlinedBorder} font-medium ${textSize}`}>
      {config.flag && <span className="text-sm">{config.flag}</span>}
      {config.icon}
      <span>{config.label}</span>
    </div>
  );
}
