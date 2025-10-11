# 🚀 Quick VPS Deployment Guide

> **Mục đích:** Deploy code từ Replit lên VPS sunfoods.vn một cách nhanh chóng

---

## 📋 Deployment Steps

### 1️⃣ Build Admin Panel (Replit)
```bash
cd admin-web && npm run build
```

### 2️⃣ Deploy to VPS (Replit)
```bash
node deploy-and-install.js
```

**Script tự động:**
- ✅ Upload backend code (src, shared, package.json)
- ✅ Upload admin-web/dist → `/var/www/sun/backend/public/admin`
- ✅ Upload customer-mobile (.next, public, package.json)
- ✅ Install dependencies
- ✅ Restart PM2 services (backend-api, mobile-app)

### 3️⃣ Verify (Browser)
- **Backend API:** https://sunfoods.vn/api/health
- **Admin Panel:** https://sunfoods.vn/adminhoang/
- **Mobile Store:** https://sunfoods.vn

---

## 🔧 Manual PM2 Management (If Needed)

### Check Status
```bash
ssh root@sunfoods.vn
pm2 list
```

### Restart Services
```bash
# Restart backend
pm2 restart backend-api

# Restart mobile app
pm2 restart mobile-app

# Or start mobile app if not exists
PORT=3001 pm2 start "npm run start" --name mobile-app --cwd /var/www/sun/customer-mobile

# Save config
pm2 save
```

### View Logs
```bash
# Backend logs
pm2 logs backend-api --lines 50

# Mobile logs
pm2 logs mobile-app --lines 50

# All logs
pm2 logs --lines 20
```

---

## 🏗️ Architecture

| Service | Port | Path | Description |
|---------|------|------|-------------|
| **Backend API** | 3000 | `/api/`, `/adminhoang/` | Express server |
| **Mobile App** | 3001 | `/` | Next.js SSR |
| **Admin Files** | - | `/var/www/sun/backend/public/admin` | Static files |

**Nginx Config:** `/etc/nginx/sites-enabled/sunfoods.vn`

---

## ⚠️ Common Issues

### Admin Panel Blank Screen
**Causes:**
1. CORS not configured
2. Files in wrong folder
3. Backend not running

**Fix:**
```bash
# 1. Check CORS in backend/src/index.ts
#    Must include: 'https://sunfoods.vn'

# 2. Verify files location
ls -la /var/www/sun/backend/public/admin

# 3. Restart backend
pm2 restart backend-api
```

### Mobile App Not Loading
**Fix:**
```bash
# Check if running
pm2 list

# Start if needed
PORT=3001 pm2 start "npm run start" --name mobile-app --cwd /var/www/sun/customer-mobile
pm2 save
```

### Deployment Script Timeout
**Normal behavior** - Mobile dependencies install may timeout.

**Action:** Manually restart PM2 services after timeout:
```bash
ssh root@sunfoods.vn
cd /var/www/sun
pm2 restart backend-api
pm2 restart mobile-app
pm2 save
```

---

## 📝 Important Notes

### CORS Configuration
Backend allows these origins (in `backend/src/index.ts`):
- ✅ `https://sunfoods.vn`
- ✅ `https://www.sunfoods.vn`
- ✅ Development origins (localhost)

### Admin Panel Paths
- **Files location:** `/var/www/sun/backend/public/admin` ← Must be here!
- **URL path:** `/adminhoang/` ← Nginx proxy handles this
- **Backend serves from:** `backend/public/admin` in code

### Environment Variables
Backend uses these on VPS (already configured):
- `NODE_ENV=production`
- `DATABASE_URL` (PostgreSQL)
- API keys from `.env` file

---

## ✅ Deployment Checklist

Before deploying:
- [ ] Build admin-web locally (`npm run build`)
- [ ] Verify VPS_PASSWORD in Replit Secrets
- [ ] Test locally first if possible

After deploying:
- [ ] Check PM2 status (`pm2 list`)
- [ ] Verify all 3 URLs work
- [ ] Check logs for errors
- [ ] Test admin panel functionality

---

## 🆘 Emergency Rollback

If deployment breaks production:
```bash
ssh root@sunfoods.vn
cd /var/www/sun

# View git history
git log --oneline -10

# Rollback to previous commit
git reset --hard <commit-hash>

# Restart services
pm2 restart all
pm2 save
```

---

**Last Updated:** October 11, 2025  
**Deployment Script:** `deploy-and-install.js`  
**Full Documentation:** See `replit.md`
