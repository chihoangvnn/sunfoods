# 🚨 FIX VPS DEPLOYMENT - Critical Steps

## Problem: PM2 apps crash với "Exit prior to config file resolving"

## Root Cause:
1. ❌ Không có file .env trên VPS
2. ❌ Apps chưa build nhưng PM2 chạy `npm start`
3. ❌ customer-mobile thiếu package `xlsx`

---

## ✅ SOLUTION - Run these commands on VPS:

### 1. Create .env file (REQUIRED!)
```bash
cd /var/www/sun

cat > .env << 'ENVFILE'
NODE_ENV=production
PORT=3000

# Database - FILL IN YOUR ACTUAL VALUES!
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Security - Generate random 64-char strings!
SESSION_SECRET=your_random_secret_here_min_64_chars
ENCRYPTION_KEY=your_random_encryption_key_min_64_chars

# Optional Services (if you have them)
GEMINI_API_KEY=
BOT_API_KEY=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=
SHB_ACCOUNT_NAME=
SHB_BANK_ACCOUNT=

# Frontend URLs
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_BACKEND_API_URL=http://localhost:3000
ENVFILE

# Edit with real values:
nano .env
```

### 2. Install missing package
```bash
cd /var/www/sun/customer-mobile
pnpm add xlsx
```

### 3. Pull latest code (ecosystem.config.js updated!)
```bash
cd /var/www/sun
git pull origin main
```

### 4. Restart PM2 with new config
```bash
pm2 delete all
pm2 start ecosystem.config.js
pm2 save
pm2 logs
```

---

## Expected Result:
- ✅ Backend running on port 3000
- ✅ Mobile running on port 3001
- ✅ No crashes, no config errors

## If still errors:
```bash
pm2 logs backend --lines 100
pm2 logs mobile --lines 100
```
