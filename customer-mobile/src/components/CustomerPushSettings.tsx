'use client';

import { useState } from 'react';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { Bell, BellOff } from 'lucide-react';

export function CustomerPushSettings() {
  const {
    isSupported,
    permission,
    subscription,
    isLoading,
    requestPermission,
    subscribe,
    unsubscribe,
  } = usePushNotifications();

  if (!isSupported) {
    return (
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="flex items-center gap-2 text-gray-600">
          <BellOff className="w-5 h-5" />
          <span className="text-sm">Trình duyệt không hỗ trợ thông báo đẩy</span>
        </div>
      </div>
    );
  }

  async function handleToggleNotifications() {
    if (subscription) {
      await unsubscribe();
    } else {
      const granted = await requestPermission();
      if (granted) {
        await subscribe();
      }
    }
  }

  if (isLoading) {
    return (
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="animate-pulse flex items-center gap-2">
          <div className="w-5 h-5 bg-gray-300 rounded-full" />
          <div className="h-4 bg-gray-300 rounded w-32" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center ${
              subscription
                ? 'bg-green-100 text-green-600'
                : 'bg-gray-100 text-gray-400'
            }`}
          >
            {subscription ? <Bell className="w-6 h-6" /> : <BellOff className="w-6 h-6" />}
          </div>

          <div>
            <h3 className="font-semibold text-gray-900">Thông báo đẩy</h3>
            <p className="text-sm text-gray-600">
              {subscription
                ? 'Đang bật - Nhận thông báo về đơn hàng'
                : 'Tắt - Không nhận thông báo'}
            </p>
          </div>
        </div>

        <button
          onClick={handleToggleNotifications}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            subscription
              ? 'bg-red-50 text-red-600 hover:bg-red-100'
              : 'bg-green-600 text-white hover:bg-green-700'
          }`}
        >
          {subscription ? 'Tắt' : 'Bật'}
        </button>
      </div>

      {permission === 'denied' && (
        <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
          <p className="text-sm text-yellow-800">
            ⚠️ Bạn đã chặn thông báo. Vui lòng vào cài đặt trình duyệt để bật lại.
          </p>
        </div>
      )}

      <div className="mt-4 bg-blue-50 p-3 rounded-lg">
        <p className="text-sm text-blue-800">
          💡 Bật thông báo để nhận cập nhật tức thì về đơn hàng, khuyến mãi và ưu đãi đặc biệt!
        </p>
      </div>
    </div>
  );
}
