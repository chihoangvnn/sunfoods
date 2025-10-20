import { useState, useEffect } from 'react';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

interface PushNotificationState {
  isSupported: boolean;
  permission: NotificationPermission;
  subscription: PushSubscription | null;
  isLoading: boolean;
  error: string | null;
}

export function usePushNotifications() {
  const [state, setState] = useState<PushNotificationState>({
    isSupported: false,
    permission: 'default',
    subscription: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    checkSupport();
  }, []);

  async function checkSupport() {
    try {
      const isSupported =
        'serviceWorker' in navigator &&
        'PushManager' in window &&
        'Notification' in window;

      if (!isSupported) {
        setState((prev) => ({
          ...prev,
          isSupported: false,
          isLoading: false,
          error: 'Push notifications not supported',
        }));
        return;
      }

      setState((prev) => ({
        ...prev,
        isSupported: true,
        permission: Notification.permission,
      }));

      // Register service worker
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      await navigator.serviceWorker.ready;

      // Check existing subscription
      const subscription = await registration.pushManager.getSubscription();

      setState((prev) => ({
        ...prev,
        subscription,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error checking push notification support:', error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: 'Failed to initialize push notifications',
      }));
    }
  }

  async function requestPermission(): Promise<boolean> {
    try {
      if (!state.isSupported) {
        throw new Error('Push notifications not supported');
      }

      const permission = await Notification.requestPermission();
      setState((prev) => ({ ...prev, permission }));

      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      setState((prev) => ({
        ...prev,
        error: 'Failed to request permission',
      }));
      return false;
    }
  }

  async function subscribe(): Promise<boolean> {
    try {
      if (!VAPID_PUBLIC_KEY) {
        throw new Error('VAPID public key not configured');
      }

      const registration = await navigator.serviceWorker.ready;

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as any,
      });

      // Send subscription to server (session auth)
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
          deviceInfo: {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save subscription');
      }

      setState((prev) => ({ ...prev, subscription }));
      return true;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      setState((prev) => ({
        ...prev,
        error: 'Failed to subscribe',
      }));
      return false;
    }
  }

  async function unsubscribe(): Promise<boolean> {
    try {
      if (!state.subscription) {
        return true;
      }

      // Unsubscribe from push manager
      await state.subscription.unsubscribe();

      // Notify server (session auth)
      await fetch('/api/push/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endpoint: state.subscription.endpoint,
        }),
      });

      setState((prev) => ({ ...prev, subscription: null }));
      return true;
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      setState((prev) => ({
        ...prev,
        error: 'Failed to unsubscribe',
      }));
      return false;
    }
  }

  return {
    ...state,
    requestPermission,
    subscribe,
    unsubscribe,
  };
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}
