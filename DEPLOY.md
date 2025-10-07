# VPS Deployment Guide

## Table of Contents
- [Introduction](#introduction)
- [Prerequisites](#prerequisites)
- [Step-by-Step Deployment](#step-by-step-deployment)
- [Testing Your Deployment](#testing-your-deployment)
- [Management Commands](#management-commands)
- [Troubleshooting](#troubleshooting)
- [Maintenance](#maintenance)

---

## Introduction

This guide walks you through deploying the **All-in-One E-Commerce Platform** on a VPS (Virtual Private Server). The deployment includes:

### What Will Be Deployed

- **Backend Admin Panel** (`/adminhoang`) - Full-featured admin interface running on port 3000
- **RESTful APIs** (`/api/*`) - Backend API endpoints for mobile and admin communication
- **Mobile Customer App** (root `/`) - Next.js customer-facing storefront running on port 3001

### Architecture Overview

```
Internet → Nginx (Port 80/443)
           ├─ /adminhoang/* → Backend (Port 3000)
           ├─ /api/*        → Backend (Port 3000)
           └─ /*            → Mobile App (Port 3001)
```

### System Requirements

- **Node.js**: Version 18.x or higher
- **Process Manager**: PM2 for process management
- **Web Server**: Nginx as reverse proxy
- **Database**: PostgreSQL 14+ or Neon (serverless Postgres)
- **VPS Specs**: Minimum 2GB RAM, 2 CPU cores, 20GB storage
- **Operating System**: Ubuntu 20.04 LTS or Debian 11+ (recommended)

---

## Prerequisites

### 1. VPS Requirements

**Minimum Specifications:**
- RAM: 2GB (4GB recommended)
- CPU: 2 cores (4 cores recommended)
- Storage: 20GB SSD (50GB recommended)
- Network: 100 Mbps uplink

**Recommended VPS Providers:**
- DigitalOcean (Droplets)
- Linode
- Vultr
- AWS Lightsail
- Hetzner Cloud

### 2. Ubuntu/Debian Installation

Ensure you have a fresh Ubuntu 20.04+ or Debian 11+ installation:

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install essential build tools
sudo apt install -y build-essential curl wget git
```

### 3. Install Node.js 18+

```bash
# Install Node.js 18.x using NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v18.x.x or higher
npm --version   # Should show 9.x.x or higher
```

### 4. Install PM2 Globally

```bash
# Install PM2 process manager
sudo npm install -g pm2

# Verify installation
pm2 --version
```

### 5. Install and Configure Nginx

```bash
# Install Nginx
sudo apt install -y nginx

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Verify Nginx is running
sudo systemctl status nginx
```

### 6. PostgreSQL/Neon Database Setup

**Option A: Use Neon (Recommended - Serverless)**

1. Sign up at [https://neon.tech](https://neon.tech)
2. Create a new project
3. Copy your connection string (format: `postgresql://user:password@host/database`)

**Option B: Install PostgreSQL Locally**

```bash
# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql << EOF
CREATE DATABASE ecommerce_admin;
CREATE USER ecommerce_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE ecommerce_admin TO ecommerce_user;
\q
EOF
```

### 7. Domain Configuration

**Point your domain to VPS:**

1. Log in to your domain registrar (Namecheap, GoDaddy, etc.)
2. Create an A record pointing to your VPS IP address:
   ```
   Type: A
   Name: @
   Value: YOUR_VPS_IP_ADDRESS
   TTL: 3600
   ```
3. Optionally, create a www subdomain:
   ```
   Type: A
   Name: www
   Value: YOUR_VPS_IP_ADDRESS
   TTL: 3600
   ```
4. Wait 5-30 minutes for DNS propagation

**Verify DNS propagation:**
```bash
# Check if domain resolves to your VPS IP
dig +short yourdomain.com
```

---

## Step-by-Step Deployment

### Step 1: Upload Code to VPS

**Method A: Git Clone (Recommended)**

```bash
# Navigate to web directory
cd /var/www

# Clone your repository
sudo git clone https://github.com/yourusername/your-repo.git ecommerce-platform

# Set proper ownership
sudo chown -R $USER:$USER /var/www/ecommerce-platform

# Navigate to project directory
cd ecommerce-platform
```

**Method B: Using rsync/scp**

```bash
# From your local machine, upload files to VPS
rsync -avz --exclude 'node_modules' --exclude '.git' \
  /path/to/local/project/ \
  user@your-vps-ip:/var/www/ecommerce-platform/

# SSH into your VPS
ssh user@your-vps-ip

# Navigate to project directory
cd /var/www/ecommerce-platform
```

---

### Step 2: Install Dependencies

```bash
# Navigate to project root
cd /var/www/ecommerce-platform

# Install root dependencies (PM2, etc.)
npm install

# Install backend dependencies
cd TailwindAdminRasa
npm install
cd ..

# Install mobile app dependencies
cd customer-mobile-shop-clean
npm install
cd ..
```

**Expected Output:**
- No critical errors in npm install logs
- All packages installed successfully
- May see peer dependency warnings (usually safe to ignore)

**Troubleshooting:**
```bash
# If npm install fails, try clearing cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

---

### Step 3: Configure Environment Variables

```bash
# Navigate to project root
cd /var/www/ecommerce-platform

# Copy environment template
cp .env.example .env

# Edit environment variables
nano .env  # or use vim, vi, or any text editor
```

**Critical Variables to Configure:**

```bash
# 1. REQUIRED: Set production mode
NODE_ENV=production

# 2. REQUIRED: Database connection
DATABASE_URL=postgresql://user:password@host:5432/database

# 3. REQUIRED: Generate secure session secret (min 32 chars)
SESSION_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

# 4. REQUIRED: Generate encryption key for OAuth tokens
ENCRYPTION_KEY=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

# 5. REQUIRED: Worker system secrets
WORKER_JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
WORKER_REGISTRATION_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
WORKER_DISPATCH_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

# 6. REQUIRED: CORS allowed origins
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# 7. REQUIRED (if using Redis): Redis connection
REDIS_URL=redis://localhost:6379
# OR use Upstash Redis (recommended for production)
# UPSTASH_REDIS_URL=rediss://:password@endpoint:6379

# 8. Mobile app API configuration
NEXT_PUBLIC_API_URL=https://yourdomain.com
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

**Quick Secret Generation:**

```bash
# Generate all required secrets at once
echo "SESSION_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")"
echo "ENCRYPTION_KEY=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")"
echo "WORKER_JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")"
echo "WORKER_REGISTRATION_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")"
echo "WORKER_DISPATCH_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")"
```

> ⚠️ **IMPORTANT**: Never commit `.env` to version control. Ensure `.env` is in your `.gitignore` file.

> 💡 **TIP**: See `.env.example` for complete list of all available configuration options with detailed comments.

---

### Step 4: Build Applications

```bash
# Navigate to project root
cd /var/www/ecommerce-platform

# Build both backend and mobile app
npm run build:all
```

**This command will:**
1. Build the backend (TailwindAdminRasa)
2. Build the mobile Next.js app (customer-mobile-shop-clean)

**Expected Output:**
```
> build:backend
Building backend...
✓ Backend build complete

> build:mobile  
Building mobile app...
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Creating an optimized production build
✓ Collecting page data
✓ Generating static pages
✓ Finalizing page optimization
```

**What to Check:**
- ✅ No build errors
- ✅ Both `TailwindAdminRasa/dist` and `customer-mobile-shop-clean/.next` directories created
- ✅ Build process completes without TypeScript errors

**If Build Fails:**
```bash
# Check Node.js version
node --version  # Must be 18.x or higher

# Clear build cache and retry
cd TailwindAdminRasa && rm -rf dist && cd ..
cd customer-mobile-shop-clean && rm -rf .next && cd ..
npm run build:all

# Check for specific errors in logs
npm run build:backend 2>&1 | tee backend-build.log
npm run build:mobile 2>&1 | tee mobile-build.log
```

---

### Step 5: Configure Nginx

```bash
# Navigate to project root
cd /var/www/ecommerce-platform

# Copy Nginx template to sites-available
sudo cp nginx.conf.template /etc/nginx/sites-available/yourdomain.com

# Edit the configuration and replace 'yourdomain.com' with your actual domain
sudo nano /etc/nginx/sites-available/yourdomain.com
```

**Find and Replace:**
- Replace ALL instances of `yourdomain.com` with your actual domain
- Replace `www.yourdomain.com` if using www subdomain

**Create Symlink:**
```bash
# Create symlink to sites-enabled
sudo ln -s /etc/nginx/sites-available/yourdomain.com /etc/nginx/sites-enabled/

# Remove default Nginx site (optional)
sudo rm /etc/nginx/sites-enabled/default
```

**Test Nginx Configuration:**
```bash
# Test for syntax errors
sudo nginx -t

# Expected output:
# nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
# nginx: configuration file /etc/nginx/nginx.conf test is successful
```

**Reload Nginx:**
```bash
# Reload Nginx to apply changes
sudo systemctl reload nginx

# Verify Nginx is running
sudo systemctl status nginx
```

> 💡 **TIP**: If Nginx fails to start, check error logs: `sudo tail -f /var/log/nginx/error.log`

---

### Step 6: Start PM2 Processes

```bash
# Navigate to project root
cd /var/www/ecommerce-platform

# Start all processes with PM2
npm run start:prod
```

**This command starts:**
- `backend` process (port 3000)
- `mobile` process (port 3001)

**Check Process Status:**
```bash
# View all PM2 processes
npm run status
# Or: pm2 status

# Expected output:
# ┌─────┬────────┬─────────┬─────────┬─────────┬──────────┐
# │ id  │ name   │ mode    │ status  │ cpu     │ memory   │
# ├─────┼────────┼─────────┼─────────┼─────────┼──────────┤
# │ 0   │ backend│ cluster │ online  │ 0%      │ 150.0mb  │
# │ 1   │ mobile │ fork    │ online  │ 0%      │ 200.0mb  │
# └─────┴────────┴─────────┴─────────┴─────────┴──────────┘
```

**View Logs:**
```bash
# View real-time logs for all processes
npm run logs
# Or: pm2 logs

# View logs for specific process
pm2 logs backend
pm2 logs mobile
```

**Save PM2 Process List:**
```bash
# Save current PM2 process list
pm2 save

# This creates a dump file so PM2 can resurrect processes after reboot
```

**Setup PM2 Startup Script:**
```bash
# Generate startup script
pm2 startup

# Follow the instructions shown (usually requires running a sudo command)
# Example output:
# [PM2] You have to run this command as root. Execute the following command:
# sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u youruser --hp /home/youruser

# Copy and run the command shown, then save again
pm2 save
```

> ✅ **SUCCESS**: Your applications are now running and will auto-start on server reboot!

---

### Step 7: Setup SSL with Let's Encrypt

**Install Certbot:**
```bash
# Install Certbot and Nginx plugin
sudo apt install -y certbot python3-certbot-nginx
```

**Obtain SSL Certificate:**
```bash
# Run Certbot for your domain
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Follow the prompts:
# 1. Enter your email address
# 2. Agree to Terms of Service
# 3. Choose whether to redirect HTTP to HTTPS (recommended: Yes)
```

**Expected Output:**
```
Congratulations! You have successfully enabled HTTPS on https://yourdomain.com
```

**Certbot will automatically:**
- Obtain SSL certificates from Let's Encrypt
- Update your Nginx configuration with SSL settings
- Configure HTTP to HTTPS redirect
- Set up auto-renewal

**Test Auto-Renewal:**
```bash
# Dry run renewal process
sudo certbot renew --dry-run

# Expected: "Congratulations, all simulated renewals succeeded"
```

**Check Auto-Renewal Timer:**
```bash
# Certbot creates a systemd timer for automatic renewal
sudo systemctl status certbot.timer

# Should show: active (waiting)
```

> 🔒 **SECURITY**: Your site is now secured with HTTPS! Certificates auto-renew every 60 days.

---

## Testing Your Deployment

### 1. Test Admin Interface

Open your browser and navigate to:
```
https://yourdomain.com/adminhoang
```

**Expected Result:**
- ✅ Admin login page loads
- ✅ HTTPS lock icon in browser
- ✅ No certificate warnings
- ✅ Page loads within 2-3 seconds

### 2. Test Mobile App

Navigate to:
```
https://yourdomain.com/
```

**Expected Result:**
- ✅ Mobile storefront homepage loads
- ✅ Product listings visible
- ✅ Images load correctly
- ✅ Navigation works smoothly

### 3. Test API Endpoints

**Check Health Endpoint:**
```bash
# Using curl
curl https://yourdomain.com/api/health

# Expected response:
# {"status":"ok","timestamp":"2024-01-15T12:00:00.000Z"}
```

**Test API from Browser:**
```
https://yourdomain.com/api/products
```

### 4. Monitor Logs

```bash
# Watch logs in real-time
pm2 logs

# Check for errors
pm2 logs --err

# Check Nginx access logs
sudo tail -f /var/log/nginx/yourdomain.com-access.log

# Check Nginx error logs
sudo tail -f /var/log/nginx/yourdomain.com-error.log
```

### 5. Performance Check

```bash
# Check resource usage
pm2 monit

# Check server load
htop  # or: top
```

---

## Management Commands

### PM2 Process Management

```bash
# Start all processes
npm run start:prod
# Or: pm2 start ecosystem.config.js

# Stop all processes
npm run stop
# Or: pm2 stop ecosystem.config.js

# Restart all processes
npm run restart
# Or: pm2 restart ecosystem.config.js

# View process status
npm run status
# Or: pm2 status

# View real-time logs
npm run logs
# Or: pm2 logs

# View logs for specific process
pm2 logs backend
pm2 logs mobile

# Restart specific process
pm2 restart backend
pm2 restart mobile

# Reload process with zero-downtime
pm2 reload backend
pm2 reload mobile

# Delete process from PM2
pm2 delete backend
pm2 delete mobile
```

### Nginx Management

```bash
# Test Nginx configuration
sudo nginx -t

# Reload Nginx (graceful reload)
sudo systemctl reload nginx

# Restart Nginx
sudo systemctl restart nginx

# Stop Nginx
sudo systemctl stop nginx

# Start Nginx
sudo systemctl start nginx

# Check Nginx status
sudo systemctl status nginx

# View Nginx error logs
sudo tail -f /var/log/nginx/error.log

# View Nginx access logs
sudo tail -f /var/log/nginx/access.log
```

### Update Deployment

**Standard Update Procedure:**

```bash
# 1. Navigate to project directory
cd /var/www/ecommerce-platform

# 2. Pull latest changes
git pull origin main  # or master

# 3. Install any new dependencies
npm install
cd TailwindAdminRasa && npm install && cd ..
cd customer-mobile-shop-clean && npm install && cd ..

# 4. Rebuild applications
npm run build:all

# 5. Restart PM2 processes
npm run restart

# 6. Verify deployment
npm run status
npm run logs
```

**Quick Update (if only code changes):**
```bash
cd /var/www/ecommerce-platform
git pull && npm run build:all && npm run restart
```

### Database Operations

```bash
# Backup database (PostgreSQL)
pg_dump -U ecommerce_user -h localhost ecommerce_admin > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore database
psql -U ecommerce_user -h localhost ecommerce_admin < backup_20240115_120000.sql

# Connect to database
psql -U ecommerce_user -h localhost ecommerce_admin
```

---

## Troubleshooting

### Issue: Port Already in Use

**Error:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution:**
```bash
# Find process using the port
sudo lsof -i :3000
sudo lsof -i :3001

# Kill the process
sudo kill -9 <PID>

# Or restart the specific PM2 process
pm2 restart backend
pm2 restart mobile
```

---

### Issue: Build Errors

**Error:**
```
ERROR in ./src/component.tsx
Module not found: Error: Can't resolve 'module-name'
```

**Solution:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear build cache
cd TailwindAdminRasa && rm -rf dist && cd ..
cd customer-mobile-shop-clean && rm -rf .next && cd ..

# Rebuild
npm run build:all
```

---

### Issue: Permission Issues

**Error:**
```
Error: EACCES: permission denied
```

**Solution:**
```bash
# Fix file ownership
sudo chown -R $USER:$USER /var/www/ecommerce-platform

# Fix PM2 permissions
pm2 kill
pm2 start ecosystem.config.js
```

---

### Issue: Database Connection Errors

**Error:**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solution:**
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Start PostgreSQL if not running
sudo systemctl start postgresql

# Verify DATABASE_URL in .env
cat .env | grep DATABASE_URL

# Test database connection
psql -U ecommerce_user -h localhost ecommerce_admin -c "SELECT 1;"
```

---

### Issue: Nginx 502 Bad Gateway

**Error:**
```
502 Bad Gateway
```

**Causes and Solutions:**

1. **Backend not running:**
   ```bash
   pm2 status
   pm2 restart backend
   ```

2. **Wrong port configuration:**
   ```bash
   # Check if backend is listening on port 3000
   sudo lsof -i :3000
   
   # Check Nginx config
   sudo nginx -t
   ```

3. **Check Nginx error logs:**
   ```bash
   sudo tail -f /var/log/nginx/error.log
   ```

---

### Issue: Redis Connection Refused

**Error:**
```
Error: connect ECONNREFUSED 127.0.0.1:6379
```

**Solution:**

**Option A: Install Redis locally**
```bash
# Install Redis
sudo apt install -y redis-server

# Start Redis
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Verify Redis is running
redis-cli ping  # Should return: PONG
```

**Option B: Use Upstash Redis (Recommended)**
```bash
# Sign up at https://upstash.com
# Create a Redis database
# Update .env with Upstash Redis URL
UPSTASH_REDIS_URL=rediss://:password@endpoint:6379
```

**Option C: Disable Redis-dependent features**
```bash
# Comment out Redis-dependent code in your application
# Or set environment variable to disable features requiring Redis
```

---

### How to Check Logs

**PM2 Logs:**
```bash
# All processes
pm2 logs

# Specific process
pm2 logs backend
pm2 logs mobile

# Error logs only
pm2 logs --err

# Flush logs
pm2 flush
```

**Nginx Logs:**
```bash
# Access logs
sudo tail -f /var/log/nginx/yourdomain.com-access.log

# Error logs
sudo tail -f /var/log/nginx/yourdomain.com-error.log
sudo tail -f /var/log/nginx/error.log
```

**System Logs:**
```bash
# View system journal
sudo journalctl -u nginx -f
sudo journalctl -xe
```

---

## Maintenance

### Backup Database

**Automated Backup Script:**

Create `/var/www/ecommerce-platform/scripts/backup-db.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/ecommerce"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$DATE.sql"

# Create backup directory if not exists
mkdir -p $BACKUP_DIR

# Backup database
pg_dump -U ecommerce_user -h localhost ecommerce_admin > $BACKUP_FILE

# Compress backup
gzip $BACKUP_FILE

# Delete backups older than 30 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete

echo "Backup completed: $BACKUP_FILE.gz"
```

**Make executable:**
```bash
chmod +x /var/www/ecommerce-platform/scripts/backup-db.sh
```

**Setup Cron Job for Daily Backups:**
```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /var/www/ecommerce-platform/scripts/backup-db.sh >> /var/log/db-backup.log 2>&1
```

---

### Update Procedure

**Regular Update Checklist:**

1. **Backup database** before major updates
2. **Test updates** in staging environment first (if available)
3. **Review changelog** for breaking changes
4. **Update during low-traffic hours**
5. **Monitor logs** after deployment

**Safe Update Steps:**
```bash
# 1. Backup database
./scripts/backup-db.sh

# 2. Pull latest changes
git pull origin main

# 3. Check for breaking changes
git log --oneline -10

# 4. Install dependencies
npm install
cd TailwindAdminRasa && npm install && cd ..
cd customer-mobile-shop-clean && npm install && cd ..

# 5. Build applications
npm run build:all

# 6. Restart with zero-downtime reload
pm2 reload all

# 7. Monitor logs for errors
pm2 logs --lines 100
```

---

### Monitoring Tips

**1. Setup Monitoring Tools:**

```bash
# Install htop for resource monitoring
sudo apt install -y htop

# Monitor resources
htop

# Monitor disk usage
df -h

# Monitor memory usage
free -h
```

**2. PM2 Monitoring:**

```bash
# Real-time monitoring dashboard
pm2 monit

# Plus (Advanced monitoring - optional)
pm2 plus
```

**3. Setup Alerts:**

Consider using monitoring services:
- **UptimeRobot** - Free uptime monitoring
- **Netdata** - Real-time performance monitoring
- **PM2 Plus** - Advanced PM2 monitoring with alerts

**4. Log Monitoring:**

```bash
# Install logrotate for log management
sudo apt install -y logrotate

# PM2 log rotation
pm2 install pm2-logrotate

# Configure log rotation
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

---

### Log Rotation Setup

**PM2 Log Rotation:**

```bash
# Install PM2 log rotate module
pm2 install pm2-logrotate

# Configure settings
pm2 set pm2-logrotate:max_size 10M        # Max file size
pm2 set pm2-logrotate:retain 7            # Keep 7 days
pm2 set pm2-logrotate:compress true       # Compress old logs
pm2 set pm2-logrotate:dateFormat YYYY-MM-DD_HH-mm-ss
pm2 set pm2-logrotate:rotateModule true

# Verify configuration
pm2 conf pm2-logrotate
```

**Nginx Log Rotation:**

Edit `/etc/logrotate.d/nginx`:

```bash
/var/log/nginx/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data adm
    sharedscripts
    prerotate
        if [ -d /etc/logrotate.d/httpd-prerotate ]; then \
            run-parts /etc/logrotate.d/httpd-prerotate; \
        fi
    endscript
    postrotate
        invoke-rc.d nginx rotate >/dev/null 2>&1
    endscript
}
```

---

### System Health Checks

**Create Health Check Script:**

Create `/var/www/ecommerce-platform/scripts/health-check.sh`:

```bash
#!/bin/bash

echo "=== System Health Check ==="
echo "Date: $(date)"
echo ""

# Check PM2 processes
echo "PM2 Processes:"
pm2 status

# Check disk space
echo ""
echo "Disk Usage:"
df -h | grep -E '^/dev/'

# Check memory
echo ""
echo "Memory Usage:"
free -h

# Check Nginx
echo ""
echo "Nginx Status:"
sudo systemctl is-active nginx

# Check database connection
echo ""
echo "Database Connection:"
psql -U ecommerce_user -h localhost ecommerce_admin -c "SELECT 1;" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✓ Database: Connected"
else
    echo "✗ Database: Connection failed"
fi

# Check backend health
echo ""
echo "Backend Health:"
curl -s https://yourdomain.com/api/health | grep -q "ok"
if [ $? -eq 0 ]; then
    echo "✓ Backend API: Healthy"
else
    echo "✗ Backend API: Unhealthy"
fi

echo ""
echo "=== Health Check Complete ==="
```

**Make executable and run:**
```bash
chmod +x /var/www/ecommerce-platform/scripts/health-check.sh
./scripts/health-check.sh
```

---

## Security Best Practices

### 1. Firewall Configuration

```bash
# Install UFW (Uncomplicated Firewall)
sudo apt install -y ufw

# Allow SSH (IMPORTANT: Do this first!)
sudo ufw allow 22/tcp

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

### 2. Fail2Ban (Brute Force Protection)

```bash
# Install Fail2Ban
sudo apt install -y fail2ban

# Enable and start
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 3. Regular Security Updates

```bash
# Enable automatic security updates
sudo apt install -y unattended-upgrades

# Configure automatic updates
sudo dpkg-reconfigure --priority=low unattended-upgrades
```

### 4. Environment Security

```bash
# Ensure .env is not readable by others
chmod 600 .env

# Ensure .env is in .gitignore
echo ".env" >> .gitignore
```

---

## Conclusion

Your e-commerce platform is now deployed and running on your VPS! 🎉

**Quick Reference:**

- **Admin Panel**: `https://yourdomain.com/adminhoang`
- **Customer App**: `https://yourdomain.com/`
- **API Endpoints**: `https://yourdomain.com/api/*`

**Daily Operations:**
```bash
# Check status
pm2 status

# View logs
pm2 logs

# Restart if needed
pm2 restart all
```

**For Support:**
- Check logs first: `pm2 logs`
- Review this guide's troubleshooting section
- Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`

**Next Steps:**
- Set up regular database backups
- Configure monitoring and alerts
- Implement CDN for static assets (optional)
- Set up staging environment for testing updates

---

**Document Version:** 1.0.0  
**Last Updated:** January 2025  
**Maintained By:** Development Team
