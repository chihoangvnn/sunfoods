'use client';

import { useState, useEffect } from 'react';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { useAuth } from '../hooks/useAuth';
import { canAccessShopFeatures, isShopOwnerCached, updateShopOwnerCache } from '../lib/permissions';
import { Bell, BellOff, Smartphone } from 'lucide-react';

export function PushNotificationSettings() {
  const { user, isAuthenticated } = useAuth();
  const {
    isSupported,
    permission,
    subscription,
    isLoading,
    requestPermission,
    subscribe,
    unsubscribe,
  } = usePushNotifications();

  const [isSending, setIsSending] = useState(false);
  const [testMessage, setTestMessage] = useState('');
  const [canManageNotifications, setCanManageNotifications] = useState(false);
  
  // Check if user is shop owner
  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      setCanManageNotifications(false);
      return;
    }

    // Use cached value immediately
    const cached = isShopOwnerCached(user.id);
    setCanManageNotifications(cached);

    // Then verify with server (uses session auth)
    canAccessShopFeatures().then((isOwner) => {
      setCanManageNotifications(isOwner);
      updateShopOwnerCache(user.id, isOwner);
    });
  }, [isAuthenticated, user?.id]);
  
  if (!canManageNotifications) {
    return (
      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
        <p className="text-yellow-800">
          {isAuthenticated 
            ? 'Chỉ chủ shop mới có thể cài đặt thông báo đơn hàng.'
            : 'Vui lòng đăng nhập để cài đặt thông báo.'}
        </p>
      </div>
    );
  }

  if (!isSupported) {
    return (
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="flex items-center gap-2 text-gray-600">
          <BellOff className="w-5 h-5" />
          <span>Trình duyệt không hỗ trợ thông báo đẩy</span>
        </div>
      </div>
    );
  }

  async function handleToggleNotifications() {
    if (!user?.id) return;
    
    if (subscription) {
      // Unsubscribe
      await unsubscribe();
    } else {
      // Request permission and subscribe
      const granted = await requestPermission();
      if (granted) {
        await subscribe();
      }
    }
  }

  async function handleTestNotification() {
    if (!subscription || !user?.id) return;

    setIsSending(true);
    try {
      const response = await fetch('/api/push/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: '🔔 Test Notification',
          message: 'Hệ thống thông báo đang hoạt động tốt!',
        }),
      });

      if (response.ok) {
        setTestMessage('✅ Đã gửi thông báo thử nghiệm');
      } else {
        setTestMessage('❌ Lỗi gửi thông báo');
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
      setTestMessage('❌ Lỗi kết nối');
    } finally {
      setIsSending(false);
      setTimeout(() => setTestMessage(''), 3000);
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
    <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              subscription
                ? 'bg-green-100 text-green-600'
                : 'bg-gray-100 text-gray-400'
            }`}
          >
            {subscription ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
          </div>

          <div>
            <h3 className="font-semibold text-gray-900">Thông báo đẩy</h3>
            <p className="text-sm text-gray-600">
              {subscription
                ? 'Đang bật - Nhận thông báo đơn hàng mới'
                : 'Đã tắt - Không nhận thông báo'}
            </p>
          </div>
        </div>

        <button
          onClick={handleToggleNotifications}
          className={`px-4 py-2 rounded-lg font-medium ${
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

      {subscription && (
        <div className="pt-3 border-t border-gray-200">
          <button
            onClick={handleTestNotification}
            disabled={isSending}
            className="w-full bg-blue-50 text-blue-600 hover:bg-blue-100 px-4 py-2 rounded-lg font-medium disabled:opacity-50"
          >
            {isSending ? 'Đang gửi...' : '📣 Gửi thông báo thử nghiệm'}
          </button>
          {testMessage && (
            <p className="text-sm text-center mt-2 text-gray-600">{testMessage}</p>
          )}
        </div>
      )}

      {subscription && (
        <div className="text-xs text-gray-500 flex items-center gap-2">
          <Smartphone className="w-4 h-4" />
          <span>Thiết bị này đã đăng ký nhận thông báo</span>
        </div>
      )}
    </div>
  );
}
