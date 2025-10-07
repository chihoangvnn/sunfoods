# 🚀 Quick VPS Deployment Guide

## Prerequisites on VPS
```bash
# 1. Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 2. Install PM2 & Nginx
sudo npm install -g pm2
sudo apt install -y nginx
```

## Deploy Steps

### 1. Clone & Setup
```bash
# Clone your repository to VPS
git clone <your-repo-url> /var/www/ecommerce
cd /var/www/ecommerce

# Install dependencies (npm workspaces - installs all at once)
npm install

# OR install per-workspace if needed:
# cd backend && npm install && cd ..
# cd admin-web && npm install && cd ..
# cd customer-mobile && npm install && cd ..
```

### 2. Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Edit .env and add your values:
nano .env
```

**Required variables:**
```env
DATABASE_URL=postgresql://user:pass@host/db
NODE_ENV=production
PORT=3000

# Optional but recommended:
GEMINI_API_KEY=your_key
CLOUDINARY_CLOUD_NAME=your_cloud
# ... (see .env.example for full list)
```

### 3. Build Applications
```bash
# Build all applications from root
npm run build:all

# This builds:
# - Admin dashboard (Vite) → backend/public/admin/
# - Backend API (esbuild) → backend/dist/
# - Mobile app (Next.js) → customer-mobile/.next/

# OR build individually:
# npm run build:admin
# npm run build:backend
# npm run build:mobile
```

### 4. Configure Nginx
```bash
# Copy template
sudo cp nginx.conf.template /etc/nginx/sites-available/ecommerce

# Edit domain name
sudo nano /etc/nginx/sites-available/ecommerce
# Replace YOUR_DOMAIN with your actual domain

# Enable site
sudo ln -s /etc/nginx/sites-available/ecommerce /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 5. Start with PM2
```bash
# Start both apps
pm2 start ecosystem.config.js

# Setup auto-restart on reboot
pm2 startup
pm2 save
```

### 6. Verify Deployment
```bash
# Check PM2 status
pm2 status

# Check logs
pm2 logs backend --lines 50
pm2 logs mobile --lines 50

# Test endpoints
curl http://localhost:3000/api/health
curl http://localhost:3001
```

## Access Your App

- **Admin Panel**: `http://your-domain/adminhoang`
- **API**: `http://your-domain/api/*`
- **Customer App**: `http://your-domain/`

## Common PM2 Commands

```bash
pm2 status              # View all processes
pm2 restart all         # Restart all apps
pm2 logs                # View all logs
pm2 monit              # Monitor resources
pm2 stop all           # Stop all apps
pm2 delete all         # Remove all apps
```

## Troubleshooting

### App won't start
```bash
# Check logs
pm2 logs backend --err
pm2 logs mobile --err

# Check environment
cd backend && node -e "console.log(process.env.DATABASE_URL)"
```

### Nginx errors
```bash
# Check Nginx config
sudo nginx -t

# View Nginx logs
sudo tail -f /var/log/nginx/error.log
```

### Database connection failed
```bash
# Test database connection
cd backend
node -e "require('pg').Pool({connectionString: process.env.DATABASE_URL}).query('SELECT NOW()').then(r => console.log('✅ DB OK:', r.rows[0])).catch(e => console.error('❌ DB Error:', e.message))"
```

## SSL Setup (Optional)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo systemctl enable certbot.timer
```

---

**📚 Full detailed guide available in `DEPLOY.md`**
