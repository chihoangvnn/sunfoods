# Chrome Extension Installation Instructions

## Complete Installation Guide

### Step 1: Prepare the Extension

The Chrome Extension is now complete and ready to install! All files are properly configured:

✅ **manifest.json** - Chrome Extension v3 manifest with correct permissions  
✅ **PNG Icons** - All required icon sizes (16x16, 32x32, 48x48, 128x128)  
✅ **Popup Interface** - Complete UI for authentication and profile management  
✅ **Background Service Worker** - API communication and cookie extraction  
✅ **Content Scripts** - Social media site detection and cookie access  
✅ **Client-side Encryption** - AES-GCM encryption for secure storage  
✅ **Host Permissions** - Access to API server and social media sites  

### Step 2: Start the Backend API Server

**Important:** The extension requires the backend API to be running.

```bash
# In your main project directory
npm run dev
```

The API server will start on `http://localhost:5000`

### Step 3: Load Extension in Chrome

1. **Open Chrome Extensions Page:**
   - Type `chrome://extensions/` in the address bar
   - Or go to ⋮ Menu → More Tools → Extensions

2. **Enable Developer Mode:**
   - Toggle "Developer mode" in the top-right corner

3. **Load Unpacked Extension:**
   - Click "Load unpacked" button
   - Navigate to and select the `extension` folder
   - Click "Select Folder" or "Open"

4. **Verify Installation:**
   - You should see "Cookie Sync - Social Media Cookie Manager" in your extensions list
   - The extension icon should appear in your Chrome toolbar

### Step 4: Initial Setup

1. **Click the Extension Icon** in your Chrome toolbar

2. **Create Account or Sign In:**
   - Click "Create Account" for new users
   - Enter email and password
   - Or use existing credentials to sign in

3. **Configure Settings (Optional):**
   - Click the "Settings" button in the popup
   - Verify API URL is set to `http://localhost:5000`
   - Enable auto-sync and notifications as desired

### Step 5: Test Cookie Extraction

1. **Visit a Supported Social Media Site:**
   - Facebook, Instagram, TikTok, Twitter/X, LinkedIn, or YouTube
   - Make sure you're logged in to the platform

2. **Extract Cookies:**
   - Click the Cookie Sync extension icon
   - The extension should detect the current site
   - Click "Extract Cookies" button
   - Verify success message appears

3. **View Profiles:**
   - Your saved profiles should appear in the popup
   - Click "Open Dashboard" to manage profiles in the web interface

## Supported Features

### 🔐 **Secure Cookie Management**
- Extract authentication cookies from social media sites
- Client-side AES-GCM encryption before sending to server
- Secure storage with user-controlled encryption keys

### 🌐 **Multi-Platform Support**
| Platform | Status | Detection |
|----------|--------|-----------|
| Facebook | ✅ Supported | Auto-detected |
| Instagram | ✅ Supported | Auto-detected |
| TikTok | ✅ Supported | Auto-detected |
| Twitter/X | ✅ Supported | Auto-detected |
| LinkedIn | ✅ Supported | Auto-detected |
| YouTube | ✅ Supported | Auto-detected |

### ⚙️ **Settings & Preferences**
- **Auto-sync:** Automatically sync when cookies change
- **Notifications:** Show sync status notifications
- **API URL:** Configure backend server location

### 📊 **Profile Management**
- View all saved cookie profiles
- Individual profile sync
- Bulk sync all profiles
- Web dashboard integration

## Troubleshooting

### Extension Won't Load
- ✅ Verify all PNG icon files exist in `icons/` folder
- ✅ Check manifest.json syntax is valid
- ✅ Ensure developer mode is enabled in Chrome

### Can't Connect to API
- ✅ Verify backend server is running on `http://localhost:5000`
- ✅ Check API URL in extension settings
- ✅ Ensure host permissions include your API server

### Cookie Extraction Fails
- ✅ Make sure you're logged in to the social media site
- ✅ Verify the site is in the supported platforms list
- ✅ Check browser console for error messages

### Authentication Issues
- ✅ Clear extension storage and re-authenticate
- ✅ Verify backend API is accessible
- ✅ Check network connection

## Development Mode

When developing or testing:

1. **Make Changes** to extension files
2. **Click Reload** button on the extension in `chrome://extensions/`
3. **Test Functionality** with the updated code

## Production Deployment

For production use:

1. **Replace PNG Icons** with proper high-quality versions
2. **Update API URL** to your production server
3. **Add Production Domains** to host_permissions if needed
4. **Test Thoroughly** in all supported browsers
5. **Package and Submit** to Chrome Web Store

## Security Notes

- All cookie data is encrypted client-side before transmission
- Extension only extracts essential authentication cookies
- No personal data is transmitted in plain text
- Users control their own encryption keys
- Data can be deleted at any time

## Need Help?

- Check the browser console for error messages
- Verify the backend API is running and accessible
- Ensure you're logged in to the target social media platform
- Review the extension permissions in Chrome
- Check the README.md for additional documentation