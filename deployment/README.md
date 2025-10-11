# VPS Deployment Package

## 📦 What's Included

This package contains pre-built production files for all 3 storefronts:

- ✅ `backend/dist/` - Compiled backend code
- ✅ `backend/public/` - Admin static files
- ✅ `customer-mobile/.next/` - SunFoods storefront (Port 3001)
- ✅ `customer-tramhuong/.next/` - Tramhuong storefront (Port 3002)
- ✅ `customer-nhangsach/.next/` - Nhangsach storefront (Port 3003)
- ✅ `ecosystem.config.js` - PM2 configuration for all apps
- ✅ `nginx.conf` - Nginx reverse proxy config
- ✅ `.env.production.example` - Environment variables template
- ✅ `INSTALL_ON_VPS.sh` - Automated installation script

## 🚀 Quick Deploy (3 Steps)

### Step 1: Upload to VPS

```bash
# From your local machine
scp -r deployment/* user@your-vps-ip:/tmp/app-deploy/
```

### Step 2: SSH and Install

```bash
# SSH to VPS
ssh user@your-vps-ip

# Move files
sudo mkdir -p /var/www/app
sudo cp -r /tmp/app-deploy/* /var/www/app/
cd /var/www/app

# Edit domain in script
nano INSTALL_ON_VPS.sh
# Change DOMAIN="yourdomain.com" to your actual domain

# Run installation
chmod +x INSTALL_ON_VPS.sh
./INSTALL_ON_VPS.sh
```

### Step 3: Configure Environment

Edit `.env` file with your real credentials:
```bash
nano /var/www/app/.env
```

That's it! Your app will be running at:
- Mobile: https://yourdomain.com
- Admin: https://yourdomain.com/adminhoang

## 🔧 Post-Deployment

### Check Status
```bash
pm2 status
pm2 logs
```

### Restart Apps
```bash
pm2 restart all
```

### Update SSL Certificate
```bash
sudo certbot renew --dry-run
```

## 📋 Requirements

- Ubuntu 20.04/22.04
- Domain pointed to VPS IP
- Minimum 2GB RAM
- Ports 80, 443, 22 open

## 🆘 Troubleshooting

### PM2 Issues
```bash
pm2 logs
pm2 restart all
```

### Nginx Issues
```bash
sudo nginx -t
sudo systemctl status nginx
```

### SSL Issues
```bash
sudo certbot certificates
sudo certbot --nginx -d yourdomain.com
```
