# VPS Ubuntu 24 Deployment Fixes

## 🚀 Quick Fix Guide for Production Deployment

This document addresses specific issues encountered when deploying to VPS Ubuntu 24.

---

## ✅ What Was Fixed

### 1. **esbuild bcrypt Native Module Error**
**Problem:** `bcrypt` is a native C++ module that cannot be bundled by esbuild.
```
Error: No native build was found for platform=linux arch=x64
```

**Solution:** Marked `bcrypt` as external in `backend/package.json`:
```json
"build": "esbuild src/index.ts --bundle --platform=node --format=cjs --outdir=dist ... --external:bcrypt"
```

### 2. **PM2 Not Loading .env File**
**Problem:** Production mode (`node dist/index.js`) doesn't auto-load `.env` like dev mode.
```
Error: DATABASE_URL must be set
```

**Solution:** Added `dotenv` package and updated `package.json` start script:
```json
{
  "scripts": {
    "start": "node -r dotenv/config dist/index.js"
  },
  "dependencies": {
    "dotenv": "^16.4.7"
  }
}
```
The `-r dotenv/config` flag preloads dotenv to automatically load `.env` file.

### 3. **Missing ENCRYPTION_KEY**
**Problem:** Backend requires 64-character hex encryption key.
```
Error: ENCRYPTION_KEY must be a 64-character (32-byte) hex string
```

**Solution:** Generated proper encryption key and updated `.env.example` with format.

---

## 🔧 VPS Deployment Steps

### Step 1: Pull Latest Code
```bash
cd /var/www/sun
git pull origin main
```

### Step 2: Update .env File
```bash
# Copy example and edit
cp .env.example .env
nano .env

# Add/update these REQUIRED fields:
DATABASE_URL=postgresql://user:password@host:port/dbname
ENCRYPTION_KEY=c3a948be4ebd4b4bcee04378906aad2012a49fdde6d3b13ce080fab843a360ce

# Generate new ENCRYPTION_KEY if needed:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 3: Copy .env to Backend
```bash
# Copy root .env to backend directory
cp /var/www/sun/.env /var/www/sun/backend/.env
```

### Step 4: Install Dependencies
```bash
# Install backend dependencies (includes bcrypt as external + dotenv for .env loading)
cd backend
npm install
cd ..
```

### Step 5: Rebuild Backend
```bash
# Build with new esbuild config (bcrypt as external)
cd backend
npm run build
cd ..
```

### Step 6: Restart PM2
```bash
# Clean restart all processes
pm2 delete all
pm2 start ecosystem.config.js
pm2 save

# Check status
pm2 status
pm2 logs backend --lines 50
```

---

## 🐛 Troubleshooting

### Backend Won't Start - DATABASE_URL Error
```bash
# Check if .env exists in backend directory
ls -la /var/www/sun/backend/.env

# If missing, copy from root
cp /var/www/sun/.env /var/www/sun/backend/.env

# Restart
pm2 restart backend
```

### Backend Won't Start - ENCRYPTION_KEY Error
```bash
# Generate new key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Add to .env
echo "ENCRYPTION_KEY=<generated_key>" >> /var/www/sun/backend/.env

# Restart
pm2 restart backend
```

### bcrypt Native Module Error (Still Happening)
```bash
# Rebuild bcrypt for your platform
cd /var/www/sun/backend
npm rebuild bcrypt
pm2 restart backend
```

### Check if Backend is Running
```bash
# Test backend API
curl http://localhost:3000/api/health

# Should return: {"status":"ok"}
```

---

## 📋 Quick Checklist

Before deploying to VPS:

- [ ] Pull latest code from GitHub
- [ ] Update `.env` with all required variables (DATABASE_URL, ENCRYPTION_KEY)
- [ ] Copy `.env` to `backend/` directory
- [ ] Run `npm install` in backend
- [ ] Run `npm run build` in backend
- [ ] Restart PM2 processes
- [ ] Check logs: `pm2 logs backend --lines 50`
- [ ] Test API: `curl http://localhost:3000/api/health`

---

## 🎯 Summary of Changes

| Issue | File Changed | What Changed |
|-------|-------------|--------------|
| bcrypt bundling error | `backend/package.json` | Added `--external:bcrypt` to build script |
| PM2 not loading .env | `backend/package.json` | Added `dotenv` package and `node -r dotenv/config` to start script |
| Missing ENCRYPTION_KEY | `.env.example` | Added example key and generation instructions |
| ESM/CommonJS __dirname | `backend/src/index.ts` | Added conditional __dirname for ESM/CommonJS compatibility |

---

## 💡 Important Notes

1. **bcrypt is now external**: The `dist/index.js` file doesn't include bcrypt. It loads from `node_modules/bcrypt` at runtime.

2. **PM2 loads .env automatically**: No need to manually export environment variables.

3. **ENCRYPTION_KEY format**: Must be exactly 64 hex characters (32 bytes). Generate with:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

4. **.env location**: PM2 looks for `.env` in the `cwd` (current working directory), which is `./backend` for the backend process.

---

## 🔗 Related Documentation

- [DEPLOY.md](./DEPLOY.md) - Full VPS deployment guide
- [.env.example](./.env.example) - Environment variables reference
- [ecosystem.config.js](./ecosystem.config.js) - PM2 configuration

---

**Last Updated:** October 7, 2025 (VPS Ubuntu 24 compatibility fixes)
