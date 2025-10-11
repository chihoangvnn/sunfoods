let VAPID_PUBLIC_KEY: string | null = null;

async function getVapidPublicKey(): Promise<string> {
  if (VAPID_PUBLIC_KEY) return VAPID_PUBLIC_KEY as string;
  
  const response = await fetch('/api/vapid-public-key');
  const data = await response.json();
  
  if (!data.publicKey) {
    throw new Error('VAPID public key not available');
  }
  
  VAPID_PUBLIC_KEY = data.publicKey;
  return VAPID_PUBLIC_KEY as string;
}

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: any;
  actions?: Array<{
    action: string;
    title: string;
  }>;
}

export const isNotificationSupported = (): boolean => {
  if (typeof window === 'undefined') return false;
  return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
};

export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!isNotificationSupported()) {
    throw new Error('Notifications not supported');
  }
  
  const permission = await Notification.requestPermission();
  return permission;
};

export const subscribeToPushNotifications = async (): Promise<PushSubscription> => {
  const vapidKey = await getVapidPublicKey();
  
  const registration = await navigator.serviceWorker.ready;
  
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidKey)
  });
  
  await fetch('/api/vendor/notifications/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(subscription)
  });
  
  return subscription;
};

export const unsubscribeFromPushNotifications = async (): Promise<void> => {
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  
  if (subscription) {
    await subscription.unsubscribe();
    
    await fetch('/api/vendor/notifications/unsubscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint: subscription.endpoint })
    });
  }
};

export const getNotificationSubscription = async (): Promise<PushSubscription | null> => {
  if (!isNotificationSupported()) return null;
  
  const registration = await navigator.serviceWorker.ready;
  return await registration.pushManager.getSubscription();
};

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
