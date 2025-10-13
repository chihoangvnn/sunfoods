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
    <div className="bg-green-50 rounded-2xl border border-green-100 p-4 mb-4 overflow-hidden relative shadow-sm">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-green-200 to-transparent"></div>
      </div>

      {/* Tier Header with Crown Badge */}
      <div className={`relative bg-gradient-to-r ${currentTier.bgGradient} rounded-xl p-4 mb-3 overflow-hidden`}>
        {/* Shimmer Effect for Diamond */}
        {currentTier.id === 'diamond' && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer-slow"></div>
        )}
        
        {/* Glow Effect for Gold */}
        {currentTier.id === 'gold' && (
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-300/20 via-transparent to-yellow-300/20 animate-pulse"></div>
        )}

        <div className="relative flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {currentTier.id !== 'member' && (
                <Crown className="w-5 h-5 text-yellow-300" />
              )}
              <h3 className={`text-[16px] md:text-[18px] font-bold ${currentTier.textColor} tracking-tight`}>
                KHÁCH HÀNG {currentTier.name.toUpperCase()}
              </h3>
            </div>
            <p className={`text-[16px] md:text-[17px] ${currentTier.textColor} opacity-90 mb-2`}>
              Tổng chi tiêu: {formatCurrency(totalSpent)}
            </p>
            <div className={`text-[16px] md:text-[17px] font-semibold ${currentTier.textColor} leading-tight`}>
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
        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3">
          <div className="flex items-center gap-2 text-[16px] md:text-[17px] text-gray-700 flex-wrap">
            {currentTier.benefits.slice(0, 3).map((benefit: string, index: number) => (
              <span key={index} className="whitespace-nowrap font-medium">✓ {benefit}</span>
            ))}
          </div>
        </div>
          
        {/* Progress Section with Ring Style */}
        {nextTier && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[16px] md:text-[17px]">
              <span className="text-gray-700 font-medium">
                Lên cấp {nextTier.name}
              </span>
              <span className="text-green-600 font-bold">
                {formatCurrencyShort(amountToNext)}đ
              </span>
            </div>
            
            {/* Enhanced Progress Bar with Gradient by Tier */}
            <div className="w-full bg-gradient-to-r from-gray-200 to-gray-300 rounded-full h-4 overflow-hidden shadow-inner border border-gray-300/50">
              <div 
                className={`h-full rounded-full transition-all duration-1000 relative ${
                  progressToNext >= 80 ? 'animate-pulse' : ''
                }`}
                style={{ 
                  width: `${progressToNext}%`,
                  background: nextTier.id === 'diamond' 
                    ? 'linear-gradient(90deg, #60a5fa 0%, #3b82f6 50%, #2563eb 100%)'
                    : nextTier.id === 'gold'
                    ? 'linear-gradient(90deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)'
                    : nextTier.id === 'silver'
                    ? 'linear-gradient(90deg, #94a3b8 0%, #64748b 50%, #475569 100%)'
                    : 'linear-gradient(90deg, #10b981 0%, #059669 50%, #047857 100%)'
                }}
              >
                <div className="absolute inset-0 bg-white/30"></div>
                {progressToNext >= 80 && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer"></div>
                )}
              </div>
            </div>
            <p className="text-[16px] md:text-[17px] font-semibold text-gray-700 text-center">
              🎯 Đã đạt {progressToNext}% - {progressToNext >= 80 ? 'Sắp lên hạng!' : 'Tiếp tục mua sắm!'}
            </p>
          </div>
        )}
        
        {/* CTA Button */}
        {nextTier && (
          <button className="w-full bg-white/90 hover:bg-white text-green-700 font-bold py-3 px-4 rounded-xl transition-all shadow-sm text-[16px] md:text-[18px] min-h-[56px]">
            Mua sắm để lên hạng
          </button>
        )}
      </div>

    </div>
  );
}