'use client'

import React, { useState } from 'react';
import { Check, Copy, Gift, Calendar, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface Voucher {
  id: string;
  code: string;
  title: string;
  description: string;
  discount: number;
  discountType: 'percentage' | 'fixed';
  minOrderValue: number;
  expiryDate: string;
  status: 'available' | 'used' | 'expired';
  category?: string;
}

interface VoucherCardProps {
  voucher: Voucher;
  onUse?: (voucherId: string) => void;
}

export function VoucherCard({ voucher, onUse }: VoucherCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    // Client-side only clipboard access
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(voucher.code).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(err => {
        console.error('Failed to copy:', err);
      });
    }
  };

  const getStatusColor = () => {
    switch (voucher.status) {
      case 'available':
        return 'border-green-200 bg-gradient-to-br from-green-50 to-white';
      case 'used':
        return 'border-gray-200 bg-gray-50 opacity-60';
      case 'expired':
        return 'border-gray-200 bg-gray-50 opacity-60';
      default:
        return 'border-gray-200 bg-white';
    }
  };

  const getStatusBadge = () => {
    switch (voucher.status) {
      case 'available':
        return <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full">Khả dụng</span>;
      case 'used':
        return <span className="text-xs font-semibold text-gray-600 bg-gray-200 px-2 py-1 rounded-full">Đã dùng</span>;
      case 'expired':
        return <span className="text-xs font-semibold text-red-600 bg-red-100 px-2 py-1 rounded-full">Hết hạn</span>;
    }
  };

  const formatDiscount = () => {
    if (voucher.discountType === 'percentage') {
      return `${voucher.discount}%`;
    }
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(voucher.discount);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const getDaysRemaining = () => {
    const today = new Date();
    const expiry = new Date(voucher.expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysRemaining = getDaysRemaining();

  return (
    <div className={`rounded-xl border-2 p-4 transition-all ${getStatusColor()} ${voucher.status === 'available' ? 'hover:shadow-md' : ''}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sunrise-leaf to-fresh-soil flex items-center justify-center">
            <Gift className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">{voucher.title}</h3>
            {voucher.category && (
              <span className="text-xs text-gray-500">{voucher.category}</span>
            )}
          </div>
        </div>
        {getStatusBadge()}
      </div>

      <div className="mb-3">
        <p className="text-sm text-gray-600 mb-2">{voucher.description}</p>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <ShoppingBag className="w-4 h-4" />
            <span>Đơn tối thiểu: {formatCurrency(voucher.minOrderValue)}</span>
          </div>
        </div>
      </div>

      {/* Discount Badge */}
      <div className="bg-gradient-to-r from-warm-sun to-amber-400 text-white font-bold text-2xl py-3 px-4 rounded-lg text-center mb-3">
        Giảm {formatDiscount()}
      </div>

      {/* Expiry Info */}
      <div className="flex items-center gap-2 mb-3 text-sm">
        <Calendar className="w-4 h-4 text-gray-500" />
        <span className="text-gray-600">
          {voucher.status === 'available' && daysRemaining > 0 && daysRemaining <= 7 && (
            <span className="text-orange-600 font-medium">Còn {daysRemaining} ngày - </span>
          )}
          HSD: {new Date(voucher.expiryDate).toLocaleDateString('vi-VN')}
        </span>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <div className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2 font-mono text-sm text-gray-900 flex items-center justify-between">
          <span className="font-semibold">{voucher.code}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="p-1 h-auto hover:bg-gray-100"
            disabled={voucher.status !== 'available'}
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : (
              <Copy className="w-4 h-4 text-gray-600" />
            )}
          </Button>
        </div>
        {voucher.status === 'available' && onUse && (
          <Button
            onClick={() => onUse(voucher.id)}
            className="bg-gradient-to-r from-sunrise-leaf to-fresh-soil text-white hover:opacity-90 px-6"
          >
            Dùng ngay
          </Button>
        )}
      </div>
    </div>
  );
}
