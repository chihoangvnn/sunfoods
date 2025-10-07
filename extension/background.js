// Background Service Worker for Cookie Sync Extension

// Storage keys
const STORAGE_KEYS = {
  SETTINGS: 'cookieSync_settings',
  LAST_SYNC: 'cookieSync_lastSync'
};

// Default settings - API URL points to backend cookie-profiles endpoint
const DEFAULT_SETTINGS = {
  autoSync: false,
  notifications: true,
  apiUrl: 'http://localhost:5000/api/cookie-profiles'
};

// Initialize extension
chrome.runtime.onInstalled.addListener(async () => {
  console.log('Cookie Sync Extension installed');
  
  // Set default settings if not exist
  const settings = await getSettings();
  if (!settings) {
    await setSettings(DEFAULT_SETTINGS);
  }
});

// Handle messages from popup and content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'GET_CURRENT_TAB':
      getCurrentTab().then(sendResponse);
      return true;
      
    case 'EXTRACT_COOKIES':
      extractCookiesFromTab(message.tabId, message.domain).then(sendResponse);
      return true;
      
    case 'API_REQUEST':
      makeApiRequest(message.config).then(sendResponse);
      return true;
      
    case 'CHECK_SESSION':
      checkBackendSession().then(sendResponse);
      return true;
      
    case 'SYNC_PROFILE':
      syncCookieProfile(message.profileData).then(sendResponse);
      return true;
      
    case 'GET_SETTINGS':
      getSettings().then(sendResponse);
      return true;
      
    case 'UPDATE_SETTINGS':
      updateSettings(message.settings).then(sendResponse);
      return true;
      
    case 'SHOW_NOTIFICATION':
      showNotification(message.title, message.message, message.type);
      sendResponse({ success: true });
      return true;
  }
});

// Get current active tab
async function getCurrentTab() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    return { success: true, tab };
  } catch (error) {
    console.error('Error getting current tab:', error);
    return { success: false, error: error.message };
  }
}

// Extract cookies from a specific tab and domain
async function extractCookiesFromTab(tabId, domain) {
  try {
    // Get cookies for the domain
    const cookies = await chrome.cookies.getAll({ domain });
    
    // Filter and format cookies
    const relevantCookies = cookies.filter(cookie => {
      // Filter out non-essential cookies
      const essentialPatterns = [
        /session/i,
        /auth/i,
        /token/i,
        /login/i,
        /user/i,
        /account/i,
        /csrf/i,
        /security/i
      ];
      
      return essentialPatterns.some(pattern => 
        pattern.test(cookie.name) || pattern.test(cookie.value)
      );
    });
    
    const cookieData = {
      domain,
      timestamp: Date.now(),
      cookies: relevantCookies.map(cookie => ({
        name: cookie.name,
        value: cookie.value,
        domain: cookie.domain,
        path: cookie.path,
        secure: cookie.secure,
        httpOnly: cookie.httpOnly,
        expirationDate: cookie.expirationDate
      }))
    };
    
    return { success: true, data: cookieData };
  } catch (error) {
    console.error('Error extracting cookies:', error);
    return { success: false, error: error.message };
  }
}

// Make API request with session-based authentication
async function makeApiRequest(config) {
  try {
    const settings = await getSettings();
    
    const headers = {
      'Content-Type': 'application/json',
      ...config.headers
    };
    
    const response = await fetch(`${settings.apiUrl}${config.url}`, {
      method: config.method || 'GET',
      headers,
      credentials: 'include', // Include session cookies
      body: config.body ? JSON.stringify(config.body) : undefined
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `HTTP ${response.status}`);
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('API request failed:', error);
    return { success: false, error: error.message };
  }
}

// Session-based authentication helpers
async function checkBackendSession() {
  try {
    const settings = await getSettings();
    
    // Check if user is logged in by making a request to the backend
    const response = await fetch(`${settings.apiUrl.replace('/api/cookie-profiles', '')}/api/auth/check`, {
      method: 'GET',
      credentials: 'include'
    });
    
    if (response.ok) {
      const userData = await response.json();
      return { success: true, isAuthenticated: true, user: userData };
    } else {
      return { success: true, isAuthenticated: false, user: null };
    }
  } catch (error) {
    console.error('Error checking backend session:', error);
    return { success: false, error: error.message, isAuthenticated: false };
  }
}

// Sync cookie profile to backend
async function syncCookieProfile(profileData) {
  try {
    const settings = await getSettings();
    
    // Create cookie profile using backend API
    const response = await fetch(settings.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(profileData)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }
    
    // Store last sync timestamp
    await chrome.storage.local.set({
      [STORAGE_KEYS.LAST_SYNC]: new Date().toISOString()
    });
    
    return { success: true, data };
  } catch (error) {
    console.error('Error syncing cookie profile:', error);
    return { success: false, error: error.message };
  }
}

// Settings helpers
async function getSettings() {
  try {
    const result = await chrome.storage.local.get([STORAGE_KEYS.SETTINGS]);
    return result[STORAGE_KEYS.SETTINGS] || DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Error getting settings:', error);
    return DEFAULT_SETTINGS;
  }
}

async function setSettings(settings) {
  try {
    await chrome.storage.local.set({
      [STORAGE_KEYS.SETTINGS]: settings
    });
    return { success: true };
  } catch (error) {
    console.error('Error setting settings:', error);
    return { success: false, error: error.message };
  }
}

async function updateSettings(newSettings) {
  try {
    const currentSettings = await getSettings();
    const updatedSettings = { ...currentSettings, ...newSettings };
    await setSettings(updatedSettings);
    return { success: true, settings: updatedSettings };
  } catch (error) {
    console.error('Error updating settings:', error);
    return { success: false, error: error.message };
  }
}

// Notification helper
async function showNotification(title, message, type = 'info') {
  const settings = await getSettings();
  
  if (!settings.notifications) {
    return;
  }
  
  const iconUrl = chrome.runtime.getURL('icons/icon48.png');
  
  chrome.notifications.create({
    type: 'basic',
    iconUrl,
    title,
    message
  });
}

// Cookie change monitoring for auto-sync
chrome.cookies.onChanged.addListener(async (changeInfo) => {
  const settings = await getSettings();
  
  if (!settings.autoSync) {
    return;
  }
  
  // Check if the cookie belongs to a supported domain
  const supportedDomains = [
    'facebook.com',
    'tiktok.com', 
    'instagram.com',
    'twitter.com',
    'x.com',
    'linkedin.com',
    'youtube.com'
  ];
  
  const cookieDomain = changeInfo.cookie.domain;
  const isSupported = supportedDomains.some(domain => 
    cookieDomain.includes(domain)
  );
  
  if (isSupported && !changeInfo.removed) {
    console.log('Cookie changed for supported domain:', cookieDomain);
    // Could trigger auto-sync here if needed
  }
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  // The popup will open automatically due to default_popup in manifest
  console.log('Extension icon clicked');
});