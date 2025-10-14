# Nginx Multi-Site Setup Guide

## 📋 Overview
This configuration serves 3 e-commerce stores on different domains, all sharing a single backend API.

### Architecture
```
┌─────────────────────────────────────────────────┐
│                  Nginx (Port 80/443)            │
├─────────────────────────────────────────────────┤
│                                                 │
│  sunfoods.vn          → Port 3001 (Sunfoods)   │
│  tramhuonghoangngan.com → Port 3002 (Tramhuong)│
│  nhangsach.net        → Port 3003 (Nhangsach)  │
│                                                 │
│  All /api/* requests  → Port 5000 (Backend)    │
│  All /adminhoang/*    → Port 5000 (Backend)    │
└─────────────────────────────────────────────────┘
```

## 🚀 Installation Steps

### 1. Install Nginx
```bash
sudo apt update
sudo apt install nginx -y
```

### 2. Copy Configuration
```bash
# Backup existing config
sudo cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.backup

# Copy multi-site config
sudo cp nginx-multisite.conf /etc/nginx/sites-available/multisite

# Enable the site
sudo ln -sf /etc/nginx/sites-available/multisite /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
```

### 3. Install SSL Certificates (Let's Encrypt)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get certificates for all 3 domains
sudo certbot --nginx -d sunfoods.vn -d www.sunfoods.vn
sudo certbot --nginx -d tramhuonghoangngan.com -d www.tramhuonghoangngan.com
sudo certbot --nginx -d nhangsach.net -d www.nhangsach.net

# Auto-renewal (already enabled by certbot)
sudo certbot renew --dry-run
```

### 4. Test Configuration
```bash
# Check syntax
sudo nginx -t

# If OK, reload
sudo systemctl reload nginx
```

### 5. Configure Firewall
```bash
# CRITICAL: Allow SSH first to prevent lockout
sudo ufw allow OpenSSH

# Allow HTTP and HTTPS
sudo ufw allow 'Nginx Full'

# Enable firewall
sudo ufw enable

# Verify rules
sudo ufw status
```

## 🔧 PM2 Services

### Start All Services
```bash
# Install PM2 globally
npm install -g pm2

# Start all apps
pm2 start ecosystem.config.js

# Save PM2 config
pm2 save
pm2 startup
```

### Port Assignment
- **Backend API**: Port 5000 (serves API + Admin Dashboard)
- **Sunfoods Storefront**: Port 3001 (customer-mobile)
- **Tramhuong Storefront**: Port 3002 (customer-tramhuong)  
- **Nhangsach Storefront**: Port 3003 (customer-nhangsach)

## 📊 Monitoring & Logs

### Nginx Logs
```bash
# Access logs
sudo tail -f /var/log/nginx/sunfoods_access.log
sudo tail -f /var/log/nginx/tramhuong_access.log
sudo tail -f /var/log/nginx/nhangsach_access.log

# Error logs
sudo tail -f /var/log/nginx/sunfoods_error.log
sudo tail -f /var/log/nginx/tramhuong_error.log
sudo tail -f /var/log/nginx/nhangsach_error.log
```

### PM2 Logs
```bash
# All apps
pm2 logs

# Specific app
pm2 logs backend-api
pm2 logs sunfoods-storefront
pm2 logs tramhuong-storefront
pm2 logs nhangsach-storefront
```

### PM2 Status
```bash
pm2 status
pm2 monit
```

## 🔐 Security Features

### Rate Limiting
- **API endpoints**: 100 requests/second (burst: 20)
- **Web pages**: 200 requests/second (burst: 50)

### Security Headers
- X-Frame-Options: SAMEORIGIN
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- Strict-Transport-Security: HSTS enabled

### SSL/TLS
- TLS 1.2 and 1.3 only
- Strong cipher suites
- Auto-renewal with Certbot

## 🛠️ Troubleshooting

### Port Already in Use
```bash
# Find process using port
sudo lsof -i :5000
sudo lsof -i :3001

# Kill process
sudo kill -9 <PID>
```

### Nginx Won't Start
```bash
# Check config syntax
sudo nginx -t

# View detailed error
sudo systemctl status nginx
sudo journalctl -xeu nginx
```

### PM2 App Crashed
```bash
# Restart specific app
pm2 restart backend-api

# View logs
pm2 logs backend-api --lines 100

# Delete and restart
pm2 delete backend-api
pm2 start ecosystem.config.js --only backend-api
```

### SSL Certificate Issues
```bash
# Renew manually
sudo certbot renew

# Check certificate expiry
sudo certbot certificates
```

## 📝 DNS Configuration

Point your domains to your VPS IP:

### sunfoods.vn
```
A     @          <YOUR_VPS_IP>
A     www        <YOUR_VPS_IP>
```

### tramhuonghoangngan.com
```
A     @          <YOUR_VPS_IP>
A     www        <YOUR_VPS_IP>
```

### nhangsach.net
```
A     @          <YOUR_VPS_IP>
A     www        <YOUR_VPS_IP>
```

## ✅ Verification

### Test Each Domain
```bash
# HTTP redirect to HTTPS
curl -I http://sunfoods.vn
curl -I http://tramhuonghoangngan.com
curl -I http://nhangsach.net

# HTTPS response
curl -I https://sunfoods.vn
curl -I https://tramhuonghoangngan.com
curl -I https://nhangsach.net

# API endpoint (shared backend)
curl https://sunfoods.vn/api/health
curl https://tramhuonghoangngan.com/api/health
curl https://nhangsach.net/api/health
```

### Health Check Endpoints
- `GET /api/health` - Backend health status
- `GET /api/stores` - List all stores
- `GET /adminhoang/` - Admin dashboard

## 🔄 Updates & Deployment

### Deploy Code Updates
```bash
# Pull latest code
git pull origin main

# Install dependencies
npm install

# Build all storefronts
cd customer-mobile && npm run build && cd ..
cd customer-tramhuong && npm run build && cd ..
cd customer-nhangsach && npm run build && cd ..

# Restart PM2 apps
pm2 restart all

# Or restart individually
pm2 restart backend-api
pm2 restart sunfoods-storefront
pm2 restart tramhuong-storefront
pm2 restart nhangsach-storefront
```

### Zero-Downtime Reload
```bash
# Reload instead of restart
pm2 reload all
```

## 📞 Support

### Quick Commands Reference
```bash
# Nginx
sudo nginx -t                    # Test config
sudo systemctl reload nginx      # Reload config
sudo systemctl restart nginx     # Restart service

# PM2
pm2 status                       # Check all apps
pm2 logs                         # View all logs
pm2 restart all                  # Restart all apps
pm2 save                         # Save config

# SSL
sudo certbot renew              # Renew certificates
sudo certbot certificates       # List certificates
```
