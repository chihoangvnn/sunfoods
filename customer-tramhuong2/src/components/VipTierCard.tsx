'use client'

import React from 'react';
import { VipProgress, formatCurrency, formatCurrencyShort } from '@/utils/vipCalculator';
import { Crown } from 'lucide-react';

interface VipTierCardProps {
  vipProgress: VipProgress;
}

export function VipTierCard({ vipProgress }: VipTierCardProps) {
  const { currentTier, totalSpent, nextTier, progressToNext, amountToNext } = vipProgress;

  return (
    <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-tramhuong-accent/20 p-4 mb-4 overflow-hidden relative shadow-[0_8px_32px_rgba(193,168,117,0.3)]">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-tramhuong-accent/30 to-transparent"></div>
      </div>

      {/* Tier Header with Crown Badge */}
      <div className={`relative bg-tramhuong-accent/20 backdrop-blur-sm rounded-xl p-4 mb-3 overflow-hidden border border-tramhuong-accent/30`}>
        {/* Shimmer Effect for Diamond */}
        {currentTier.id === 'diamond' && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer-slow"></div>
        )}
        
        {/* Glow Effect for Gold */}
        {currentTier.id === 'gold' && (
          <div className="absolute inset-0 bg-gradient-to-r from-tramhuong-accent/20 via-transparent to-tramhuong-accent/20 animate-pulse"></div>
        )}

        <div className="relative flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {currentTier.id !== 'member' && (
                <Crown className="w-5 h-5 text-tramhuong-accent" />
              )}
              <h3 className={`text-[16px] md:text-[18px] font-playfair font-bold text-tramhuong-primary tracking-tight`}>
                KHÁCH HÀNG {currentTier.name.toUpperCase()}
              </h3>
            </div>
            <p className={`text-[16px] md:text-[17px] text-tramhuong-primary opacity-90 mb-2`}>
              Tổng chi tiêu: {formatCurrency(totalSpent)}
            </p>
            <div className={`text-[16px] md:text-[17px] font-semibold text-tramhuong-primary leading-tight`}>
              {currentTier.motivationalTitle} • {currentTier.motivationalSubtitle}
            </div>
          </div>
          
          <div className="flex-shrink-0 ml-3">
            <span className="text-4xl animate-bounce">{currentTier.emoji}</span>
          </div>
        </div>
      </div>

      {/* Enhanced Progress & Benefits */}
      <div className="relative space-y-3">
        {/* Benefits List */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3 border border-tramhuong-accent/20">
          <div className="flex items-center gap-2 text-[16px] md:text-[17px] text-tramhuong-primary flex-wrap">
            {currentTier.benefits.slice(0, 3).map((benefit: string, index: number) => (
              <span key={index} className="whitespace-nowrap font-medium">✓ {benefit}</span>
            ))}
          </div>
        </div>
          
        {/* Progress Section with Ring Style */}
        {nextTier && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[16px] md:text-[17px]">
              <span className="text-tramhuong-primary font-medium">
                Lên cấp {nextTier.name}
              </span>
              <span className="text-tramhuong-accent font-bold">
                {formatCurrencyShort(amountToNext)}đ
              </span>
            </div>
            
            {/* Enhanced Progress Bar */}
            <div className="w-full bg-white rounded-full h-3 overflow-hidden shadow-inner">
              <div 
                className="bg-gradient-to-r from-tramhuong-accent to-tramhuong-accent/80 h-full rounded-full transition-all duration-300 relative"
                style={{ width: `${progressToNext}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </div>
            </div>
            <p className="text-[16px] md:text-[17px] text-tramhuong-primary text-center">
              Đã đạt {progressToNext}%
            </p>
          </div>
        )}
        
        {/* CTA Button */}
        {nextTier && (
          <button className="w-full bg-tramhuong-accent/90 hover:bg-tramhuong-accent text-white font-playfair font-bold py-3 px-4 rounded-xl transition-all duration-300 shadow-[0_8px_32px_rgba(193,168,117,0.3)] text-[16px] md:text-[18px] min-h-[56px]">
            Mua sắm để lên hạng
          </button>
        )}
      </div>

    </div>
  );
}