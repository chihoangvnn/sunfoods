'use client'

import React, { useState, useEffect } from 'react';
import { VoucherCard, type Voucher } from '@/components/VoucherCard';
import { Loader2, Gift, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

type VoucherStatus = 'available' | 'upcoming' | 'expired';

interface VouchersResponse {
  available: Voucher[];
  upcoming: Voucher[];
  expired: Voucher[];
  total: number;
}

export default function VouchersPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<VoucherStatus>('available');
  const [vouchers, setVouchers] = useState<VouchersResponse>({
    available: [],
    upcoming: [],
    expired: [],
    total: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/public-vouchers');
      
      if (!response.ok) {
        throw new Error('Không thể tải danh sách voucher');
      }

      const data = await response.json();
      setVouchers(data);
    } catch (err) {
      console.error('Error fetching vouchers:', err);
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const handleUseVoucher = (voucherId: string) => {
    router.push('/cart');
  };

  const getCurrentVouchers = () => {
    return vouchers[activeTab] || [];
  };

  const getTabCount = (status: VoucherStatus) => {
    return vouchers[status]?.length || 0;
  };

  const tabs: { key: VoucherStatus; label: string }[] = [
    { key: 'available', label: 'Khả dụng' },
    { key: 'upcoming', label: 'Sắp tới' },
    { key: 'expired', label: 'Hết hạn' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-sunrise-leaf to-fresh-soil text-white px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Gift className="w-8 h-8" />
            <h1 className="text-2xl font-bold">Kho Voucher</h1>
          </div>
          <p className="text-white/90 text-sm">
            Tất cả voucher đang khả dụng - Không cần nhập code!
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-4">
        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm p-1 mb-6">
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all ${
                  activeTab === tab.key
                    ? 'bg-gradient-to-r from-sunrise-leaf to-fresh-soil text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {tab.label}
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  activeTab === tab.key
                    ? 'bg-white/20'
                    : 'bg-gray-100'
                }`}>
                  {getTabCount(tab.key)}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-12 h-12 text-sunrise-leaf animate-spin mb-4" />
            <p className="text-gray-500">Đang tải vouchers...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <p className="text-red-600 font-medium mb-2">Có lỗi xảy ra</p>
            <p className="text-red-500 text-sm mb-4">{error}</p>
            <button
              onClick={fetchVouchers}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Thử lại
            </button>
          </div>
        ) : getCurrentVouchers().length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-12 text-center">
            <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium mb-1">
              {activeTab === 'available' && 'Chưa có voucher khả dụng'}
              {activeTab === 'upcoming' && 'Chưa có voucher sắp tới'}
              {activeTab === 'expired' && 'Chưa có voucher hết hạn'}
            </p>
            <p className="text-gray-400 text-sm">
              {activeTab === 'available' && 'Admin sẽ cập nhật voucher mới sớm!'}
              {activeTab === 'upcoming' && 'Hãy theo dõi để không bỏ lỡ!'}
              {activeTab === 'expired' && 'Các voucher đã hết hạn sẽ hiển thị ở đây'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {getCurrentVouchers().map((voucher) => (
              <VoucherCard
                key={voucher.id}
                voucher={voucher}
                onUse={activeTab === 'available' ? handleUseVoucher : undefined}
              />
            ))}
          </div>
        )}

        {/* Info Footer */}
        {!loading && !error && vouchers.total > 0 && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-700">
                <p className="font-medium mb-1">💡 Lưu ý:</p>
                <ul className="space-y-1 text-blue-600">
                  <li>• Voucher tự động hiển thị, không cần nhập code</li>
                  <li>• Copy mã voucher để sử dụng khi thanh toán</li>
                  <li>• Kiểm tra điều kiện đơn hàng tối thiểu</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
