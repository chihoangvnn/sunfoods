'use client'

import React from 'react';
import { ShieldCheck } from 'lucide-react';

interface CertificateBadgeProps {
  hasCertificate: boolean;
  className?: string;
}

export const CertificateBadge: React.FC<CertificateBadgeProps> = ({ 
  hasCertificate,
  className = '' 
}) => {
  if (!hasCertificate) return null;

  return (
    <div 
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-600/90 backdrop-blur-sm border border-emerald-400/40 shadow-lg ${className}`}
    >
      <ShieldCheck className="h-3.5 w-3.5 text-white" strokeWidth={2} />
      <span className="text-xs font-nunito font-semibold text-white">
        Có chứng nhận
      </span>
    </div>
  );
};
