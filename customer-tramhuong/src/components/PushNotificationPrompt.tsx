'use client';

import { useState, useEffect } from 'react';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { useAuth } from '../hooks/useAuth';
import { canAccessShopFeatures, isShopOwnerCached, updateShopOwnerCache } from '../lib/permissions';
import { Bell, BellOff, X } from 'lucide-react';

export function PushNotificationPrompt() {
  const { user, isAuthenticated } = useAuth();
  const [showPrompt, setShowPrompt] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [canReceiveNotifications, setCanReceiveNotifications] = useState(false);
  const {
    isSupported,
    permission,
    subscription,
    isLoading,
    requestPermission,
    subscribe,
  } = usePushNotifications();

  // Check if user is shop owner
  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      setCanReceiveNotifications(false);
      return;
    }

    // Use cached value immediately
    const cached = isShopOwnerCached(user.id);
    setCanReceiveNotifications(cached);

    // Then verify with server (uses session auth)
    canAccessShopFeatures().then((isOwner) => {
      setCanReceiveNotifications(isOwner);
      updateShopOwnerCache(user.id, isOwner);
    });
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    // Show prompt if:
    // 1. User is authenticated and can receive notifications
    // 2. Notifications are supported
    // 3. Permission not yet granted
    // 4. Not already subscribed
    // 5. Not dismissed by user
    if (
      canReceiveNotifications &&
      !isLoading &&
      isSupported &&
      permission === 'default' &&
      !subscription &&
      !isDismissed
    ) {
      // Delay showing prompt so it doesn't immediately appear
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [canReceiveNotifications, isLoading, isSupported, permission, subscription, isDismissed]);

  async function handleEnable() {
    if (!user?.id) return;
    
    const granted = await requestPermission();
    if (granted) {
      const success = await subscribe();
      if (success) {
        setShowPrompt(false);
      }
    }
  }

  function handleDismiss() {
    setShowPrompt(false);
    setIsDismissed(true);
    // Store dismissal in localStorage
    localStorage.setItem('pushNotificationPromptDismissed', 'true');
  }

  useEffect(() => {
    // Check if user previously dismissed
    const dismissed = localStorage.getItem('pushNotificationPromptDismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
    }
  }, []);

  if (!showPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 z-50 animate-slide-up">
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
          <Bell className="w-5 h-5 text-green-600" />
        </div>

        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">
            Nhận thông báo đơn hàng mới
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            Bật thông báo để được cập nhật ngay khi có đơn hàng mới
          </p>

          <div className="flex gap-2">
            <button
              onClick={handleEnable}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium text-sm"
            >
              Bật thông báo
            </button>
            <button
              onClick={handleDismiss}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm"
            >
              Để sau
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
