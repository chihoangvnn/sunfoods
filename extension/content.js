// Content Script for Cookie Sync Extension
// Runs on supported social media sites

(function() {
  'use strict';
  
  // Supported platforms configuration
  const PLATFORMS = {
    'facebook.com': {
      name: 'Facebook',
      icon: '👤',
      selectors: {
        userInfo: '[data-testid="nav_account_switcher"], [aria-label*="profile"], .x1i10hfl[role="link"]',
        loginForm: '[data-testid="royal_login_form"], #login_form',
        loggedIn: '[data-testid="nav_account_switcher"], [aria-label="Account"]'
      }
    },
    'instagram.com': {
      name: 'Instagram',
      icon: '📷',
      selectors: {
        userInfo: '[data-testid="user-avatar"], a[href*="/accounts/"]',
        loginForm: 'form[method="post"]',
        loggedIn: '[data-testid="user-avatar"], [aria-label="Profile"]'
      }
    },
    'tiktok.com': {
      name: 'TikTok',
      icon: '🎵',
      selectors: {
        userInfo: '[data-e2e="profile-icon"], [data-e2e="nav-profile"]',
        loginForm: '[data-e2e="login-form"]',
        loggedIn: '[data-e2e="profile-icon"]'
      }
    },
    'twitter.com': {
      name: 'Twitter',
      icon: '🐦',
      selectors: {
        userInfo: '[data-testid="SideNav_AccountSwitcher_Button"], [aria-label="Profile"]',
        loginForm: '[data-testid="LoginForm"]',
        loggedIn: '[data-testid="SideNav_AccountSwitcher_Button"]'
      }
    },
    'x.com': {
      name: 'X (Twitter)',
      icon: '❌',
      selectors: {
        userInfo: '[data-testid="SideNav_AccountSwitcher_Button"], [aria-label="Profile"]',
        loginForm: '[data-testid="LoginForm"]',
        loggedIn: '[data-testid="SideNav_AccountSwitcher_Button"]'
      }
    },
    'linkedin.com': {
      name: 'LinkedIn',
      icon: '💼',
      selectors: {
        userInfo: '.global-nav__me, [data-control-name="identity_welcome_message"]',
        loginForm: '.login__form',
        loggedIn: '.global-nav__me'
      }
    },
    'youtube.com': {
      name: 'YouTube',
      icon: '📹',
      selectors: {
        userInfo: '#avatar-btn, [aria-label="Account menu"]',
        loginForm: '[aria-label="Sign in"]',
        loggedIn: '#avatar-btn'
      }
    }
  };
  
  // Get current platform
  const currentDomain = window.location.hostname.replace('www.', '');
  const platform = PLATFORMS[currentDomain];
  
  if (!platform) {
    console.log('Cookie Sync: Unsupported platform');
    return;
  }
  
  console.log(`Cookie Sync: Initialized on ${platform.name}`);
  
  // Platform detection and user status
  let userStatus = {
    platform: platform.name,
    domain: currentDomain,
    icon: platform.icon,
    isLoggedIn: false,
    userInfo: null
  };
  
  // Check if user is logged in
  function checkLoginStatus() {
    try {
      const loggedInElement = document.querySelector(platform.selectors.loggedIn);
      const loginFormElement = document.querySelector(platform.selectors.loginForm);
      
      userStatus.isLoggedIn = !!loggedInElement && !loginFormElement;
      
      if (userStatus.isLoggedIn) {
        // Try to extract user info
        const userInfoElement = document.querySelector(platform.selectors.userInfo);
        if (userInfoElement) {
          userStatus.userInfo = {
            element: userInfoElement.tagName,
            text: userInfoElement.textContent?.trim().substring(0, 50) || '',
            hasAvatar: !!userInfoElement.querySelector('img'),
            href: userInfoElement.href || null
          };
        }
      }
      
      console.log('Cookie Sync: Login status updated', userStatus);
      
      // Notify background script
      chrome.runtime.sendMessage({
        type: 'USER_STATUS_UPDATE',
        status: userStatus
      });
      
    } catch (error) {
      console.error('Cookie Sync: Error checking login status', error);
    }
  }
  
  // Extract cookies for current domain
  function extractCookies() {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({
        type: 'EXTRACT_COOKIES',
        tabId: null, // Will be determined by background script
        domain: currentDomain
      }, (response) => {
        if (response.success) {
          console.log('Cookie Sync: Cookies extracted successfully');
          resolve(response.data);
        } else {
          console.error('Cookie Sync: Failed to extract cookies', response.error);
          resolve(null);
        }
      });
    });
  }
  
  // Listen for messages from popup
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.type) {
      case 'GET_PAGE_INFO':
        sendResponse({
          success: true,
          data: userStatus
        });
        return true;
        
      case 'EXTRACT_COOKIES_REQUEST':
        extractCookies().then(data => {
          sendResponse({
            success: !!data,
            data: data
          });
        });
        return true;
        
      case 'REFRESH_STATUS':
        checkLoginStatus();
        sendResponse({ success: true });
        return true;
    }
  });
  
  // Monitor DOM changes for login/logout detection
  function setupLoginMonitoring() {
    const observer = new MutationObserver((mutations) => {
      let shouldCheck = false;
      
      mutations.forEach((mutation) => {
        // Check if any relevant elements were added/removed
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node;
            if (element.matches && (
              element.matches(platform.selectors.loggedIn) ||
              element.matches(platform.selectors.loginForm) ||
              element.matches(platform.selectors.userInfo)
            )) {
              shouldCheck = true;
            }
          }
        });
        
        mutation.removedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node;
            if (element.matches && (
              element.matches(platform.selectors.loggedIn) ||
              element.matches(platform.selectors.loginForm)
            )) {
              shouldCheck = true;
            }
          }
        });
      });
      
      if (shouldCheck) {
        // Debounce the check
        clearTimeout(window.cookieSyncCheckTimeout);
        window.cookieSyncCheckTimeout = setTimeout(checkLoginStatus, 1000);
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    return observer;
  }
  
  // Cookie change monitoring
  function setupCookieMonitoring() {
    // Listen for cookie changes via storage events
    window.addEventListener('storage', (event) => {
      if (event.key && event.key.includes('session')) {
        console.log('Cookie Sync: Potential session change detected');
        setTimeout(checkLoginStatus, 500);
      }
    });
    
    // Monitor for potential authentication-related URL changes
    let lastUrl = window.location.href;
    new MutationObserver(() => {
      const currentUrl = window.location.href;
      if (currentUrl !== lastUrl) {
        lastUrl = currentUrl;
        
        // Check if URL change might indicate login/logout
        if (currentUrl.includes('login') || 
            currentUrl.includes('logout') || 
            currentUrl.includes('auth')) {
          setTimeout(checkLoginStatus, 1000);
        }
      }
    }).observe(document, { subtree: true, childList: true });
  }
  
  // Initialize when DOM is ready
  function initialize() {
    console.log(`Cookie Sync: Initializing for ${platform.name}`);
    
    // Initial status check
    checkLoginStatus();
    
    // Setup monitoring
    setupLoginMonitoring();
    setupCookieMonitoring();
    
    // Periodic status check (fallback)
    setInterval(checkLoginStatus, 30000); // Every 30 seconds
  }
  
  // Start initialization
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    // DOM already loaded
    setTimeout(initialize, 1000); // Give the page a moment to settle
  }
  
  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    console.log('Cookie Sync: Content script unloading');
  });
  
})();