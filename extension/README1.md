# Cookie Sync Chrome Extension

A secure Chrome Extension for synchronizing social media cookies across devices with encrypted storage.

## Features

- 🔒 **Secure Cookie Extraction** - Extract cookies from supported social media platforms
- 🔐 **Client-side Encryption** - AES-GCM encryption before sending to server
- 🔄 **Cross-device Sync** - Synchronize profiles across multiple devices
- 👥 **Multi-platform Support** - Facebook, Instagram, TikTok, Twitter/X, LinkedIn, YouTube
- 📊 **Profile Management** - Organize and manage multiple social media profiles
- ⚙️ **Settings & Preferences** - Customize auto-sync and notification settings

## Installation

### Development Installation

1. **Clone or Download** the extension folder
2. **Convert Icons** (Required for production):
   ```bash
   # Convert SVG icons to PNG format using ImageMagick or online converter
   # Icons needed: 16x16, 32x32, 48x48, 128x128 pixels
   ```
3. **Load in Chrome**:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (top right toggle)
   - Click "Load unpacked"
   - Select the `extension` folder

### Production Installation

1. Convert all SVG icons to PNG format with correct sizes
2. Update manifest.json to reference .png files instead of .svg
3. Test thoroughly in development
4. Package and submit to Chrome Web Store

## Setup

### Backend API Configuration

1. **Start the Backend Server**:
   ```bash
   npm run dev  # Start the Cookie Sync API server
   ```

2. **Configure API URL**:
   - Click the extension icon
   - Go to Settings
   - Set API Server URL (default: `http://localhost:5000`)

### User Account

1. **Create Account**:
   - Click extension icon
   - Click "Create Account"
   - Enter email and password

2. **Sign In**:
   - Enter your credentials
   - Extension will connect to the backend API

## Usage

### Extracting Cookies

1. **Visit a Supported Site**:
   - Navigate to Facebook, Instagram, TikTok, Twitter/X, LinkedIn, or YouTube
   - Make sure you're logged in to the social media platform

2. **Extract Cookies**:
   - Click the Cookie Sync extension icon
   - The extension will detect the current site
   - Click "Extract Cookies" button
   - Cookies are encrypted client-side and saved to your profile

### Managing Profiles

- **View Profiles**: See all your saved cookie profiles in the popup
- **Sync Profile**: Click "Sync" to update a specific profile
- **Sync All**: Click "Sync All Profiles" to update all profiles
- **Dashboard**: Click "Open Dashboard" to manage profiles in the web interface

### Settings

- **Auto-sync**: Automatically sync when cookies change
- **Notifications**: Show sync status notifications
- **API URL**: Configure backend server URL

## Supported Platforms

| Platform | Status | Icon |
|----------|--------|------|
| Facebook | ✅ Supported | 👤 |
| Instagram | ✅ Supported | 📷 |
| TikTok | ✅ Supported | 🎵 |
| Twitter/X | ✅ Supported | 🐦/❌ |
| LinkedIn | ✅ Supported | 💼 |
| YouTube | ✅ Supported | 📹 |

## Security

- **Client-side Encryption**: All cookie data is encrypted using AES-GCM before leaving your device
- **Secure Transport**: HTTPS communication with backend API
- **No Plain Text Storage**: Cookies are never stored in plain text
- **User-controlled Keys**: Encryption keys derived from user credentials

## Development

### File Structure

```
extension/
├── manifest.json          # Extension manifest (v3)
├── popup.html            # Extension popup UI
├── popup.js              # Popup functionality
├── background.js         # Service worker
├── content.js            # Content scripts for social media sites
├── crypto.js             # Client-side encryption utilities
├── styles.css            # Popup styling
├── icons/                # Extension icons
│   ├── icon16.svg        # 16x16 icon
│   ├── icon32.svg        # 32x32 icon
│   ├── icon48.svg        # 48x48 icon
│   └── icon128.svg       # 128x128 icon
└── README.md             # This file
```

### Key Components

- **Manifest v3**: Modern Chrome extension format with service workers
- **Background Service Worker**: Handles API communication and cookie extraction
- **Content Scripts**: Detect login status and extract cookies from social media sites
- **Client-side Encryption**: AES-GCM encryption using Web Crypto API
- **Popup Interface**: Complete UI for authentication and profile management

### API Integration

The extension connects to the Cookie Sync API backend:

- **Authentication**: JWT-based authentication
- **Profile Management**: CRUD operations for cookie profiles
- **Encrypted Storage**: All cookie data encrypted before storage
- **Cross-device Sync**: Profiles synchronized across user devices

## Troubleshooting

### Common Issues

1. **Extension Won't Load**:
   - Check that all icon files exist (convert SVG to PNG for production)
   - Verify manifest.json syntax
   - Check Chrome developer console for errors

2. **Can't Connect to API**:
   - Verify backend server is running
   - Check API URL in extension settings
   - Ensure CORS is configured for extension origin

3. **Cookie Extraction Fails**:
   - Make sure you're logged in to the social media site
   - Check that the site is supported
   - Verify site detection in popup

4. **Encryption Errors**:
   - Clear extension storage and re-authenticate
   - Check browser console for crypto errors
   - Verify Web Crypto API support

### Debug Mode

Enable Chrome Developer Tools for the extension:
1. Go to `chrome://extensions/`
2. Find Cookie Sync extension
3. Click "Inspect views: popup" to debug popup
4. Check background script logs in the extension management page

## Privacy

- Cookie data never leaves your control unencrypted
- Only essential authentication-related cookies are extracted
- No personal data is transmitted in plain text
- Users control their own encryption keys
- Data can be deleted at any time through the dashboard

## License

This extension is part of the Cookie Sync system. See the main project for license information.