'use client'

import React from 'react';
import { Award } from 'lucide-react';

interface GradeBadgeProps {
  grade: 'AAA' | 'AA+' | 'A+' | 'A';
  className?: string;
}

export const GradeBadge: React.FC<GradeBadgeProps> = ({ grade, className = '' }) => {
  const getGradientClass = () => {
    switch (grade) {
      case 'AAA':
        return 'bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600';
      case 'AA+':
        return 'bg-gradient-to-r from-tramhuong-primary to-tramhuong-accent';
      case 'A+':
        return 'bg-tramhuong-accent';
      case 'A':
        return 'bg-tramhuong-primary/80';
      default:
        return 'bg-tramhuong-primary/60';
    }
  };

  const getBorderClass = () => {
    return grade === 'AAA' 
      ? 'border-2 border-amber-300/50' 
      : grade === 'AA+' 
      ? 'border-2 border-tramhuong-accent/50'
      : 'border border-white/40';
  };

  return (
    <div 
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${getGradientClass()} ${getBorderClass()} shadow-lg ${className}`}
    >
      <Award className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
      <span className="text-xs font-nunito font-bold text-white tracking-wide">
        {grade}
      </span>
    </div>
  );
};
