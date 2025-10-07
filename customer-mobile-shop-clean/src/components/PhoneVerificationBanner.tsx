'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, X } from 'lucide-react';
import Link from 'next/link';

export function PhoneVerificationBanner() {
  const [needsPhoneUpdate, setNeedsPhoneUpdate] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkPhoneStatus() {
      try {
        const response = await fetch('/api/customer/profile');
        if (response.ok) {
          const customer = await response.json();
          const membershipData = customer.membershipData || {};
          const isPlaceholder = customer.phone?.startsWith('GOOGLE_');
          
          setNeedsPhoneUpdate(membershipData.needsPhoneUpdate === true || isPlaceholder);
        }
      } catch (error) {
        console.error('Failed to check phone status:', error);
      } finally {
        setIsLoading(false);
      }
    }

    checkPhoneStatus();
  }, []);

  if (isLoading || !needsPhoneUpdate || isDismissed) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-50 border-b-2 border-yellow-400 shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1">
            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-900">
                Vui lòng cập nhật số điện thoại để đặt xe và nhận báo giá
              </p>
              <p className="text-xs text-yellow-700 mt-0.5">
                Số điện thoại cần thiết để tài xế/khách hàng liên hệ với bạn
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Link
              href="/profile"
              className="px-4 py-1.5 bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Cập nhật ngay
            </Link>
            <button
              onClick={() => setIsDismissed(true)}
              className="p-1 hover:bg-yellow-100 rounded-lg transition-colors"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4 text-yellow-700" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
