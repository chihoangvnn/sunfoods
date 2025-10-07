class APIClient {
  constructor() {
    this.baseURL = this.detectBackendURL();
    this.password = '021088';
  }

  detectBackendURL() {
    const hostname = window.location.hostname;
    if (hostname.includes('replit')) {
      return `https://${hostname}/api`;
    }
    return 'http://localhost:5000/api';
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'X-Extension-Auth': this.password,
      ...options.headers
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  async upsertCookieProfile(profile) {
    return this.request('/cookie-profiles/upsert', {
      method: 'POST',
      body: JSON.stringify(profile)
    });
  }

  async searchCookieProfiles(query, platform) {
    const params = new URLSearchParams({ q: query, limit: '10' });
    if (platform) params.append('platform', platform);
    return this.request(`/cookie-profiles/search?${params.toString()}`);
  }

  async verifyCookieProfile(profileId) {
    return this.request(`/cookie-profiles/${profileId}/verify`, {
      method: 'POST'
    });
  }
}

const apiClient = new APIClient();
