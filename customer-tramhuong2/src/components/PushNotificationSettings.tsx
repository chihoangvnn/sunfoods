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
      <div className="bg-tramhuong-accent/10 backdrop-blur-sm p-4 rounded-lg border border-tramhuong-accent/20">
        <p className="text-tramhuong-primary">
          {isAuthenticated 
            ? 'Chỉ chủ shop mới có thể cài đặt thông báo đơn hàng.'
            : 'Vui lòng đăng nhập để cài đặt thông báo.'}
        </p>
      </div>
    );
  }

  if (!isSupported) {
    return (
      <div className="bg-white/60 backdrop-blur-md p-4 rounded-lg border border-tramhuong-accent/20 shadow-[0_8px_32px_rgba(193,168,117,0.3)]">
        <div className="flex items-center gap-2 text-tramhuong-accent">
          <BellOff className="w-5 h-5 transition-all duration-300" />
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
      <div className="bg-white/60 backdrop-blur-md p-4 rounded-lg border border-tramhuong-accent/20 shadow-[0_8px_32px_rgba(193,168,117,0.3)]">
        <div className="animate-pulse flex items-center gap-2">
          <div className="w-5 h-5 bg-tramhuong-accent/30 rounded-full" />
          <div className="h-4 bg-tramhuong-accent/30 rounded w-32" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/60 backdrop-blur-md p-4 rounded-lg border border-tramhuong-accent/20 shadow-[0_8px_32px_rgba(193,168,117,0.3)] space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
              subscription
                ? 'bg-tramhuong-accent/20 text-tramhuong-accent'
                : 'bg-tramhuong-accent/10 text-tramhuong-accent/50'
            }`}
          >
            {subscription ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
          </div>

          <div>
            <h3 className="font-playfair font-semibold text-tramhuong-primary">Thông báo đẩy</h3>
            <p className="text-sm text-tramhuong-accent">
              {subscription
                ? 'Đang bật - Nhận thông báo đơn hàng mới'
                : 'Đã tắt - Không nhận thông báo'}
            </p>
          </div>
        </div>

        <button
          onClick={handleToggleNotifications}
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
            subscription
              ? 'bg-tramhuong-accent/20 text-tramhuong-accent hover:bg-tramhuong-accent/30'
              : 'bg-tramhuong-accent text-white hover:bg-tramhuong-accent/80'
          }`}
        >
          {subscription ? 'Tắt' : 'Bật'}
        </button>
      </div>

      {permission === 'denied' && (
        <div className="bg-tramhuong-accent/10 backdrop-blur-sm p-3 rounded-lg border border-tramhuong-accent/20">
          <p className="text-sm text-tramhuong-primary">
            ⚠️ Bạn đã chặn thông báo. Vui lòng vào cài đặt trình duyệt để bật lại.
          </p>
        </div>
      )}

      {subscription && (
        <div className="pt-3 border-t border-tramhuong-accent/20">
          <button
            onClick={handleTestNotification}
            disabled={isSending}
            className="w-full bg-tramhuong-accent/10 text-tramhuong-accent hover:bg-tramhuong-accent/20 px-4 py-2 rounded-lg font-medium disabled:opacity-50 transition-all duration-300"
          >
            {isSending ? 'Đang gửi...' : '📣 Gửi thông báo thử nghiệm'}
          </button>
          {testMessage && (
            <p className="text-sm text-center mt-2 text-tramhuong-accent">{testMessage}</p>
          )}
        </div>
      )}

      {subscription && (
        <div className="text-xs text-tramhuong-accent flex items-center gap-2 transition-all duration-300">
          <Smartphone className="w-4 h-4" />
          <span>Thiết bị này đã đăng ký nhận thông báo</span>
        </div>
      )}
    </div>
  );
}
