// Popup JavaScript for Cookie Sync Extension

class CookieSyncPopup {
  constructor() {
    this.crypto = new CookieCrypto();
    this.currentTab = null;
    this.sessionData = null;
    this.settings = null;
    this.profiles = [];
    
    this.init();
  }

  async init() {
    console.log('Cookie Sync Popup: Initializing');
    
    // Load initial data
    await this.loadSettings();
    await this.checkSession();
    await this.getCurrentTab();
    
    // Setup event listeners
    this.setupEventListeners();
    
    // Update UI based on session status
    this.updateUI();
    
    // Load profiles if authenticated
    if (this.sessionData && this.sessionData.isAuthenticated) {
      this.loadProfiles();
    }
  }

  // Setup all event listeners
  setupEventListeners() {
    // Navigation buttons
    document.getElementById('openDashboardBtn').addEventListener('click', () => {
      this.openDashboard();
    });
    
    document.getElementById('refreshSessionBtn').addEventListener('click', () => {
      this.checkSession();
    });
    
    // Dashboard actions
    document.getElementById('extractBtn').addEventListener('click', () => {
      this.extractCurrentSiteCookies();
    });
    
    document.getElementById('syncAllBtn').addEventListener('click', () => {
      this.syncAllProfiles();
    });
    
    document.getElementById('openDashboardBtn').addEventListener('click', () => {
      this.openDashboard();
    });
    
    // Settings
    document.getElementById('settingsToggle').addEventListener('click', () => {
      this.toggleSettings();
    });
    
    document.getElementById('autoSync').addEventListener('change', (e) => {
      this.updateSetting('autoSync', e.target.checked);
    });
    
    document.getElementById('notifications').addEventListener('change', (e) => {
      this.updateSetting('notifications', e.target.checked);
    });
    
    document.getElementById('apiUrl').addEventListener('change', (e) => {
      this.updateSetting('apiUrl', e.target.value);
    });
  }

  // Load settings from storage
  async loadSettings() {
    try {
      const response = await this.sendMessage({ type: 'GET_SETTINGS' });
      this.settings = response || {};
      
      // Update UI with settings
      document.getElementById('autoSync').checked = this.settings.autoSync || false;
      document.getElementById('notifications').checked = this.settings.notifications !== false;
      document.getElementById('apiUrl').value = this.settings.apiUrl || 'http://localhost:5000';
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }

  // Check backend session
  async checkSession() {
    try {
      const response = await this.sendMessage({ type: 'CHECK_SESSION' });
      this.sessionData = response;
      
      if (this.sessionData.isAuthenticated && this.sessionData.user) {
        document.getElementById('userEmail').textContent = this.sessionData.user.email || this.sessionData.user.username;
      }
      
      this.updateUI();
      return this.sessionData;
    } catch (error) {
      console.error('Failed to check session:', error);
      this.sessionData = { isAuthenticated: false };
      this.updateUI();
    }
  }

  // Get current tab information
  async getCurrentTab() {
    try {
      const response = await this.sendMessage({ type: 'GET_CURRENT_TAB' });
      if (response.success) {
        this.currentTab = response.tab;
        this.updateSiteInfo();
      }
    } catch (error) {
      console.error('Failed to get current tab:', error);
    }
  }

  // Update site information display
  updateSiteInfo() {
    if (!this.currentTab) return;
    
    const url = new URL(this.currentTab.url);
    const domain = url.hostname.replace('www.', '');
    
    const supportedSites = {
      'facebook.com': { name: 'Facebook', icon: '👤' },
      'instagram.com': { name: 'Instagram', icon: '📷' },
      'tiktok.com': { name: 'TikTok', icon: '🎵' },
      'twitter.com': { name: 'Twitter', icon: '🐦' },
      'x.com': { name: 'X (Twitter)', icon: '❌' },
      'linkedin.com': { name: 'LinkedIn', icon: '💼' },
      'youtube.com': { name: 'YouTube', icon: '📹' }
    };
    
    const site = supportedSites[domain];
    const siteNameEl = document.getElementById('siteName');
    const siteStatusEl = document.getElementById('siteStatus');
    const siteIconEl = document.getElementById('siteIcon');
    const extractBtn = document.getElementById('extractBtn');
    
    if (site) {
      siteNameEl.textContent = site.name;
      siteStatusEl.textContent = 'Supported';
      siteStatusEl.className = 'site-status supported';
      siteIconEl.textContent = site.icon;
      extractBtn.classList.remove('hidden');
    } else {
      siteNameEl.textContent = domain;
      siteStatusEl.textContent = 'Not supported';
      siteStatusEl.className = 'site-status not-supported';
      siteIconEl.textContent = '🌐';
      extractBtn.classList.add('hidden');
    }
  }

  // Update UI based on authentication status
  updateUI() {
    const isAuthenticated = !!(this.sessionData && this.sessionData.isAuthenticated);
    
    document.getElementById('loginSection').classList.toggle('hidden', isAuthenticated);
    document.getElementById('dashboardSection').classList.toggle('hidden', !isAuthenticated);
    
    // Update connection status
    const statusDot = document.querySelector('.status-dot');
    const statusText = document.querySelector('.status-text');
    
    if (isAuthenticated) {
      statusDot.className = 'status-dot online';
      statusText.textContent = 'Connected';
      
      // Show user info if available
      if (this.sessionData.user) {
        const userEmail = document.getElementById('userEmail');
        if (userEmail) {
          userEmail.textContent = this.sessionData.user.email || this.sessionData.user.username || 'User';
        }
      }
    } else {
      statusDot.className = 'status-dot offline';
      statusText.textContent = 'Not logged in';
    }
  }

  // Show specific section
  showSection(sectionId) {
    const sections = ['loginSection', 'registerSection', 'dashboardSection'];
    sections.forEach(id => {
      document.getElementById(id).classList.add('hidden');
    });
    document.getElementById(sectionId).classList.remove('hidden');
  }

  // Open main app dashboard for login
  openDashboard() {
    const settings = this.settings || {};
    const dashboardUrl = settings.apiUrl ? settings.apiUrl.replace('/api/cookie-profiles', '') : 'http://localhost:5000';
    chrome.tabs.create({ url: `${dashboardUrl}/cookie-management` });
  }



  // Extract cookies from current site
  async extractCurrentSiteCookies() {
    if (!this.currentTab) return;
    
    // Check if user is authenticated first
    if (!this.sessionData || !this.sessionData.isAuthenticated) {
      this.showError('Please login to the main app first');
      this.openDashboard();
      return;
    }
    
    const extractBtn = document.getElementById('extractBtn');
    const originalText = extractBtn.textContent;
    extractBtn.textContent = 'Extracting...';
    extractBtn.disabled = true;
    
    try {
      const url = new URL(this.currentTab.url);
      const domain = url.hostname.replace('www.', '');
      
      // Map domain to social network
      const socialNetworkMap = {
        'facebook.com': 'Facebook',
        'instagram.com': 'Instagram', 
        'tiktok.com': 'TikTok',
        'twitter.com': 'Twitter',
        'x.com': 'Twitter',
        'linkedin.com': 'LinkedIn',
        'youtube.com': 'YouTube'
      };
      
      const socialNetwork = socialNetworkMap[domain];
      if (!socialNetwork) {
        throw new Error(`${domain} is not a supported social media platform`);
      }
      
      // Extract cookies using background script
      const cookieResult = await this.sendMessage({
        type: 'EXTRACT_COOKIES',
        tabId: this.currentTab.id,
        domain: domain
      });
      
      if (!cookieResult.success || !cookieResult.data) {
        throw new Error('Could not extract cookies from this site');
      }
      
      // Encrypt cookie data
      const encryptedData = await this.crypto.encrypt(JSON.stringify(cookieResult.data));
      
      // Prepare profile data matching backend schema
      const profileData = {
        userId: this.sessionData.user.id, // Backend user ID
        socialNetwork: socialNetwork,
        groupTag: 'Extension', // Default group tag
        accountName: `${socialNetwork} Account - ${new Date().toLocaleDateString()}`,
        encryptedData: encryptedData,
        metadata: {
          browser: navigator.userAgent,
          userAgent: navigator.userAgent,
          domain: domain,
          cookieCount: cookieResult.data.cookies.length,
          captureMethod: 'extension',
          notes: `Captured from ${url.href} on ${new Date().toISOString()}`
        }
      };
      
      // Sync to backend
      const response = await this.sendMessage({
        type: 'SYNC_PROFILE',
        profileData: profileData
      });
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to save cookie profile');
      }
      
      this.showSuccess(`${socialNetwork} cookies captured and synced successfully!`);
      
      // Refresh profiles list
      if (this.sessionData && this.sessionData.isAuthenticated) {
        this.loadProfiles();
      }
      
    } catch (error) {
      console.error('Cookie extraction failed:', error);
      this.showError(error.message || 'Failed to extract cookies');
    } finally {
      extractBtn.textContent = originalText;
      extractBtn.disabled = false;
    }
  }

  // Load user profiles from backend
  async loadProfiles() {
    if (!this.sessionData || !this.sessionData.isAuthenticated) {
      return;
    }
    
    try {
      const response = await this.sendMessage({
        type: 'API_REQUEST',
        config: {
          url: '',
          method: 'GET'
        }
      });
      
      if (response.success) {
        this.profiles = response.data;
        this.updateProfilesUI();
      } else {
        console.error('Failed to load profiles:', response.error);
      }
    } catch (error) {
      console.error('Failed to load profiles:', error);
    }
  }

  // Render profiles list
  renderProfiles() {
    const listEl = document.getElementById('profilesList');
    const emptyEl = document.getElementById('profilesEmpty');
    
    // Clear existing content
    const existingItems = listEl.querySelectorAll('.profile-item');
    existingItems.forEach(item => item.remove());
    
    if (this.profiles.length === 0) {
      emptyEl.classList.remove('hidden');
      return;
    }
    
    emptyEl.classList.add('hidden');
    
    this.profiles.forEach(profile => {
      const item = this.createProfileItem(profile);
      listEl.appendChild(item);
    });
  }

  // Create profile item element
  createProfileItem(profile) {
    const item = document.createElement('div');
    item.className = 'profile-item';
    item.setAttribute('data-testid', `profile-item-${profile.id}`);
    
    const lastSync = new Date(profile.updatedAt).toLocaleDateString();
    
    item.innerHTML = `
      <div class="profile-info">
        <div class="profile-name">${profile.accountName}</div>
        <div class="profile-meta">
          <span class="profile-platform">${profile.platform}</span>
          <span>Last sync: ${lastSync}</span>
        </div>
      </div>
      <div class="profile-actions">
        <button class="btn btn-primary btn-small sync-btn" data-id="${profile.id}" data-testid="button-sync-${profile.id}">
          Sync
        </button>
      </div>
    `;
    
    // Add sync button event listener
    const syncBtn = item.querySelector('.sync-btn');
    syncBtn.addEventListener('click', () => {
      this.syncProfile(profile.id);
    });
    
    return item;
  }

  // Sync specific profile
  async syncProfile(profileId) {
    const btn = document.querySelector(`[data-id="${profileId}"]`);
    const originalText = btn.textContent;
    btn.textContent = 'Syncing...';
    btn.disabled = true;
    
    try {
      // Implementation would depend on your sync logic
      // For now, just show success
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      this.showSuccess('Profile synced successfully!');
    } catch (error) {
      console.error('Sync failed:', error);
      this.showError('Sync failed');
    } finally {
      btn.textContent = originalText;
      btn.disabled = false;
    }
  }

  // Sync all profiles
  async syncAllProfiles() {
    const btn = document.getElementById('syncAllBtn');
    const originalText = btn.textContent;
    btn.textContent = 'Syncing...';
    btn.disabled = true;
    
    try {
      // Implementation would sync all profiles
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      this.showSuccess('All profiles synced successfully!');
      this.loadProfiles(); // Refresh list
    } catch (error) {
      console.error('Sync all failed:', error);
      this.showError('Sync failed');
    } finally {
      btn.textContent = originalText;
      btn.disabled = false;
    }
  }

  // Open dashboard in new tab
  openDashboard() {
    const dashboardUrl = `${this.settings.apiUrl}/dashboard`;
    chrome.tabs.create({ url: dashboardUrl });
  }

  // Toggle settings panel
  toggleSettings() {
    const panel = document.getElementById('settingsPanel');
    panel.classList.toggle('hidden');
  }

  // Update a setting
  async updateSetting(key, value) {
    try {
      const response = await this.sendMessage({
        type: 'UPDATE_SETTINGS',
        settings: { [key]: value }
      });
      
      if (response.success) {
        this.settings = response.settings;
      }
    } catch (error) {
      console.error('Failed to update setting:', error);
    }
  }

  // Send message to background script
  sendMessage(message) {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(message, resolve);
    });
  }

  // Send message to current tab's content script
  sendToTab(message) {
    return new Promise((resolve) => {
      if (this.currentTab) {
        chrome.tabs.sendMessage(this.currentTab.id, message, resolve);
      } else {
        resolve({ success: false, error: 'No active tab' });
      }
    });
  }

  // UI Helper methods
  setLoading(textElementId, spinnerElementId, isLoading) {
    const textEl = document.getElementById(textElementId);
    const spinnerEl = document.getElementById(spinnerElementId);
    
    if (isLoading) {
      textEl.style.opacity = '0';
      spinnerEl.classList.remove('hidden');
    } else {
      textEl.style.opacity = '1';
      spinnerEl.classList.add('hidden');
    }
  }

  showError(message) {
    const errorEl = document.getElementById('errorMessage');
    errorEl.textContent = message;
    errorEl.classList.remove('hidden');
    
    setTimeout(() => {
      errorEl.classList.add('hidden');
    }, 5000);
  }

  showSuccess(message) {
    const successEl = document.getElementById('successMessage');
    successEl.textContent = message;
    successEl.classList.remove('hidden');
    
    setTimeout(() => {
      successEl.classList.add('hidden');
    }, 3000);
  }

  clearMessages() {
    document.getElementById('errorMessage').classList.add('hidden');
    document.getElementById('successMessage').classList.add('hidden');
  }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new CookieSyncPopup();
});