export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Workers not supported');
    return null;
  }
  
  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    console.log('Service Worker registered:', registration);
    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return null;
  }
};
