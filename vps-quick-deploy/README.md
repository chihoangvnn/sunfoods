# 🚀 Sun E-commerce VPS Deployment Package

## 📦 Package Contents

- ✅ Backend (TypeScript source + dependencies - runs with tsx runtime)
- ✅ Customer Mobile Storefront (.next build)
- ✅ PM2 ecosystem config
- ✅ Installation script
- ✅ Environment template

## 📥 Installation Steps

### 1. Upload to VPS
```bash
scp vps-quick-deploy.tar.gz root@sunfoods.vn:/tmp/
```

### 2. SSH to VPS
```bash
ssh root@sunfoods.vn
```

### 3. Extract Package
```bash
cd /var/www/sun
tar -xzf /tmp/vps-quick-deploy.tar.gz --strip-components=1
```

### 4. Configure Environment
```bash
cp .env.example .env
nano .env  # Edit with your credentials
```

### 5. Install & Start
```bash
chmod +x install.sh
bash install.sh
```

## ✅ Verify Installation

```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs

# Test endpoints
curl http://localhost:3000
curl http://localhost:3001
```

## 🔄 Update Application

When you have new code:

1. Upload new package:
   ```bash
   scp vps-quick-deploy.tar.gz root@sunfoods.vn:/tmp/
   ```

2. Extract on VPS:
   ```bash
   cd /var/www/sun
   tar -xzf /tmp/vps-quick-deploy.tar.gz --strip-components=1
   ```

3. Reinstall dependencies (if package.json changed):
   ```bash
   # Backend: Install ALL deps (includes dev for TypeScript build), then build
   cd backend && npm install && npm run build
   cd ../customer-mobile && npm ci --production
   ```

4. Restart:
   ```bash
   pm2 restart all
   ```

## 📞 Troubleshooting

### Backend not starting
```bash
pm2 logs backend --lines 50
cd /var/www/sun/backend
node dist/index.js  # Test directly
```

### Mobile not starting
```bash
pm2 logs mobile --lines 50
cd /var/www/sun/customer-mobile
npm run start  # Test directly
```

### Database connection error
```bash
# Check .env file
cat /var/www/sun/.env

# Test PostgreSQL connection
psql $DATABASE_URL -c "SELECT 1"
```

### Port already in use
```bash
# Find process on port
sudo lsof -i :3000
sudo lsof -i :3001

# Kill if needed
sudo kill -9 <PID>
```

### Restart everything
```bash
pm2 restart all
pm2 save
```

### Reset PM2
```bash
pm2 delete all
pm2 start ecosystem.config.js
pm2 save
```

## 📋 Important Files

- `/var/www/sun/backend/src/` - Backend TypeScript source (runs with tsx)
- `/var/www/sun/customer-mobile/.next/` - Mobile build
- `/var/www/sun/ecosystem.config.js` - PM2 configuration
- `/var/www/sun/.env` - Environment variables
- `/var/www/sun/logs/` - Application logs

## 🎯 Admin Access

After installation, access admin panel at:
- **URL:** `https://sunfoods.vn/adminhoang`
- **Email:** `admin@example.com`
- **Password:** `admin123`

**⚠️ Change the admin password immediately after first login!**

## 🔐 Environment Variables

Required variables in `.env`:

```bash
# Database (Required)
DATABASE_URL=postgresql://user:password@localhost:5432/ecommerce_db

# Session (Required)
SESSION_SECRET=your-secret-key-minimum-32-characters

# Optional API Keys
GEMINI_API_KEY=your-gemini-key
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret
```

## 📈 Monitoring

```bash
# Real-time logs
pm2 logs

# Specific app logs
pm2 logs backend
pm2 logs mobile

# System info
pm2 monit

# Process list
pm2 list
```

---

**Need help?** Check logs first: `pm2 logs`
