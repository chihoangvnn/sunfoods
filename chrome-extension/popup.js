const PLATFORMS = {
  'facebook.com': 'facebook',
  'instagram.com': 'instagram',
  'twitter.com': 'twitter',
  'x.com': 'twitter',
  'tiktok.com': 'tiktok'
};

let currentDomain = '';
let detectedPlatform = '';
let isAuthenticated = false;

async function init() {
  await checkAuth();
  if (isAuthenticated) {
    showMainScreen();
    await detectCurrentTab();
  } else {
    showLoginScreen();
  }
  setupEventListeners();
}

function checkAuth() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['authToken'], (result) => {
      isAuthenticated = result.authToken === '021088';
      resolve();
    });
  });
}

function showLoginScreen() {
  document.getElementById('login-screen').classList.remove('hidden');
  document.getElementById('main-screen').classList.add('hidden');
}

function showMainScreen() {
  document.getElementById('login-screen').classList.add('hidden');
  document.getElementById('main-screen').classList.remove('hidden');
}

async function detectCurrentTab() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.url) return;

    const url = new URL(tab.url);
    currentDomain = url.hostname;

    detectedPlatform = '';
    for (const [domain, platform] of Object.entries(PLATFORMS)) {
      if (currentDomain.includes(domain)) {
        detectedPlatform = platform;
        break;
      }
    }

    document.getElementById('current-domain').innerHTML = 
      `🌐 Đang truy cập: <strong>${currentDomain}</strong>`;
    
    document.getElementById('detected-platform').innerHTML = 
      `📱 Platform: <strong>${detectedPlatform || 'Không xác định'}</strong>`;

    const captureBtn = document.getElementById('capture-btn');
    const accountInput = document.getElementById('account-name-input');
    
    if (detectedPlatform) {
      captureBtn.disabled = false;
      accountInput.disabled = false;
      updateGroupTag();
    } else {
      captureBtn.disabled = true;
      accountInput.disabled = true;
      showStatus('capture-status', 'error', 'Vui lòng mở tab Facebook, Instagram, Twitter hoặc TikTok');
    }
  } catch (error) {
    console.error('Error detecting tab:', error);
  }
}

function updateGroupTag() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const weekOfMonth = Math.ceil(now.getDate() / 7);
  
  const groupTag = `${detectedPlatform}-${year}-${month}-w${weekOfMonth}`;
  document.getElementById('group-tag-input').value = groupTag;
  return groupTag;
}

function setupEventListeners() {
  document.getElementById('login-btn').addEventListener('click', handleLogin);
  
  document.getElementById('password-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleLogin();
  });

  document.getElementById('logout-btn').addEventListener('click', handleLogout);

  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });

  document.getElementById('capture-btn').addEventListener('click', handleCapture);
  
  document.getElementById('account-name-input').addEventListener('input', (e) => {
    const captureBtn = document.getElementById('capture-btn');
    captureBtn.disabled = !e.target.value.trim() || !detectedPlatform;
  });

  let searchTimeout;
  document.getElementById('search-input').addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => handleSearch(e.target.value), 300);
  });
}

function handleLogin() {
  const password = document.getElementById('password-input').value;
  const errorEl = document.getElementById('login-error');

  if (password === '021088') {
    chrome.storage.local.set({ authToken: password }, () => {
      isAuthenticated = true;
      showMainScreen();
      detectCurrentTab();
    });
  } else {
    errorEl.textContent = 'Mật khẩu không đúng!';
    errorEl.classList.remove('hidden');
  }
}

function handleLogout() {
  chrome.storage.local.remove('authToken', () => {
    isAuthenticated = false;
    showLoginScreen();
  });
}

function switchTab(tabName) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  
  document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
  document.getElementById(`${tabName}-tab`).classList.add('active');
}

async function handleCapture() {
  const accountName = document.getElementById('account-name-input').value.trim();
  const groupTag = document.getElementById('group-tag-input').value;

  if (!accountName || !detectedPlatform) {
    showStatus('capture-status', 'error', 'Vui lòng nhập tên account!');
    return;
  }

  showStatus('capture-status', 'loading', '⏳ Đang capture cookies...');

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const url = new URL(tab.url);
    
    const cookies = await chrome.cookies.getAll({ domain: url.hostname });

    if (cookies.length === 0) {
      showStatus('capture-status', 'error', 'Không tìm thấy cookies nào!');
      return;
    }

    const cookiesData = cookies.map(c => ({
      name: c.name,
      value: c.value,
      domain: c.domain,
      path: c.path,
      secure: c.secure,
      httpOnly: c.httpOnly,
      sameSite: c.sameSite,
      expirationDate: c.expirationDate
    }));

    const profile = {
      userId: 'extension-user',
      socialNetwork: detectedPlatform,
      accountName: accountName,
      groupTag: groupTag,
      encryptedData: JSON.stringify(cookiesData),
      isActive: true,
      metadata: {
        browser: 'Chrome',
        userAgent: navigator.userAgent,
        domain: url.hostname,
        cookieCount: cookies.length,
        captureMethod: 'extension'
      }
    };

    const result = await apiClient.upsertCookieProfile(profile);

    showStatus('capture-status', 'success', 
      `✅ Đã sync ${cookies.length} cookies lên server! (${result.action === 'created' ? 'Mới tạo' : 'Cập nhật'})`);

    document.getElementById('account-name-input').value = '';
  } catch (error) {
    console.error('Capture error:', error);
    showStatus('capture-status', 'error', `❌ Lỗi: ${error.message}`);
  }
}

async function handleSearch(query) {
  if (!query || query.trim().length < 2) {
    document.getElementById('search-results').innerHTML = `
      <div class="empty-state">
        <p>Nhập từ khóa để tìm kiếm</p>
      </div>
    `;
    return;
  }

  try {
    const results = await apiClient.searchCookieProfiles(query, detectedPlatform);

    if (results.length === 0) {
      document.getElementById('search-results').innerHTML = `
        <div class="empty-state">
          <p>Không tìm thấy kết quả</p>
        </div>
      `;
      return;
    }

    const html = results.map(profile => `
      <div class="result-item" data-profile='${JSON.stringify(profile).replace(/'/g, "&#39;")}'>
        <div class="account-name">${profile.accountName}</div>
        <div class="meta">
          <span class="badge badge-platform">${profile.socialNetwork}</span>
          <span class="badge badge-group">${profile.groupTag}</span>
          ${profile.hasAdsAccess ? '<span class="badge badge-ads">Có ADS</span>' : ''}
          <span class="badge badge-score">Score: ${profile.score || 0}</span>
        </div>
      </div>
    `).join('');

    document.getElementById('search-results').innerHTML = html;

    document.querySelectorAll('.result-item').forEach(item => {
      item.addEventListener('click', () => {
        const profile = JSON.parse(item.dataset.profile);
        handleLoadCookies(profile);
      });
    });
  } catch (error) {
    console.error('Search error:', error);
    showStatus('load-status', 'error', `❌ Lỗi tìm kiếm: ${error.message}`);
  }
}

async function handleLoadCookies(profile) {
  showStatus('load-status', 'loading', `⏳ Đang load cookies cho ${profile.accountName}...`);

  try {
    const cookies = JSON.parse(profile.encryptedData);
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const url = new URL(tab.url);

    for (const cookie of cookies) {
      await chrome.cookies.set({
        url: `${cookie.secure ? 'https' : 'http'}://${cookie.domain}${cookie.path}`,
        name: cookie.name,
        value: cookie.value,
        domain: cookie.domain,
        path: cookie.path,
        secure: cookie.secure,
        httpOnly: cookie.httpOnly,
        sameSite: cookie.sameSite || 'no_restriction',
        expirationDate: cookie.expirationDate
      });
    }

    showStatus('load-status', 'success', 
      `✅ Đã load ${cookies.length} cookies! Reload trang để áp dụng.`);

    setTimeout(() => {
      chrome.tabs.reload(tab.id);
    }, 1500);
  } catch (error) {
    console.error('Load error:', error);
    showStatus('load-status', 'error', `❌ Lỗi: ${error.message}`);
  }
}

function showStatus(elementId, type, message) {
  const el = document.getElementById(elementId);
  el.className = `status ${type}`;
  el.textContent = message;
  el.classList.remove('hidden');

  if (type !== 'loading') {
    setTimeout(() => {
      el.classList.add('hidden');
    }, 5000);
  }
}

init();
