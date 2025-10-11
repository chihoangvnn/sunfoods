# Deploy Script Usage Guide

## Quick Start

The `deploy.sh` script automates the entire VPS deployment process for the multi-storefront e-commerce platform.

### Prerequisites

Ensure the VPS has:
- Ubuntu 22.04 LTS
- Node.js 20+ 
- npm
- PM2 (globally installed)
- PostgreSQL 14+
- Nginx (optional, for reverse proxy)

### Usage

1. **Make script executable:**
   ```bash
   chmod +x deploy.sh
   ```

2. **Run interactive deployment:**
   ```bash
   ./deploy.sh
   ```
   
3. **Run quick/non-interactive deployment:**
   ```bash
   ./deploy.sh --quick
   ```

## What the Script Does

### Step 1: Check Prerequisites
- Validates Node.js version (20+)
- Checks if npm, PM2, Nginx, PostgreSQL are installed
- Verifies system requirements

### Step 2: Build Applications
- Installs backend dependencies
- Builds all 3 Next.js storefronts:
  - customer-mobile (SunFoods)
  - customer-tramhuong (Trầm Hương)
  - customer-nhangsach (Nhang Sạch)

### Step 3: Environment Configuration
- Creates .env.production from .env.production.example
- Backs up existing .env if present
- Validates required environment variables

### Step 4: Database Setup
- Runs database migrations (`npm run db:push`)
- Optionally seeds sample data

### Step 5: PM2 Deployment
- Stops existing PM2 processes
- Starts all apps using ecosystem.config.js
- Saves PM2 configuration
- Configures PM2 startup on boot

### Step 6: Nginx Configuration (Optional)
- Copies nginx.conf to /etc/nginx/sites-available/
- Creates symlink to sites-enabled
- Tests and reloads Nginx
- Displays SSL setup instructions

### Step 7: Post-Deployment Checks
- Verifies PM2 processes are running
- Checks API health endpoints
- Displays next steps

## Features

- ✅ **Color-coded output** (green=success, red=error, yellow=warning)
- ✅ **Interactive prompts** with yes/no confirmations
- ✅ **Error handling** with helpful error messages
- ✅ **Safe operations** (asks before destructive actions)
- ✅ **Quick mode** for automated deployments
- ✅ **Backup creation** for existing configurations

## Example Output

```
================================================================
    Multi-Storefront E-commerce Deployment
    SunFoods | TramHuongHoangNgan | NhangSach
================================================================

Step 1/7: Checking Prerequisites
✓ Node.js v20.x installed (required v20+)
✓ npm 9.x installed
✓ PM2 installed
✓ Nginx installed
✓ PostgreSQL installed
✓ All prerequisites met

Step 2/7: Building Applications
...
```

## Post-Deployment

After successful deployment:

1. **Check running processes:**
   ```bash
   pm2 list
   pm2 logs
   ```

2. **Setup SSL certificates:**
   ```bash
   sudo certbot --nginx -d sunfoods.vn -d www.sunfoods.vn
   sudo certbot --nginx -d tramhuonghoangngan.com -d www.tramhuonghoangngan.com  
   sudo certbot --nginx -d nhangsach.net -d www.nhangsach.net
   ```

3. **Access websites:**
   - https://sunfoods.vn
   - https://tramhuonghoangngan.com
   - https://nhangsach.net

4. **Manage processes:**
   ```bash
   pm2 restart all    # Restart all apps
   pm2 stop all       # Stop all apps
   pm2 monit          # Monitor in real-time
   ```

## Troubleshooting

### Prerequisites Not Met
If prerequisites fail, install missing components:
```bash
# Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# PM2
sudo npm install -g pm2

# PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Nginx
sudo apt install -y nginx
```

### Build Failures
- Check Node.js version: `node --version`
- Clear caches: `rm -rf node_modules && npm install`
- Check build logs for specific errors

### Database Issues
- Verify DATABASE_URL in .env.production
- Check PostgreSQL is running: `sudo systemctl status postgresql`
- Force push schema: `npm run db:push -- --force`

### PM2 Not Starting
- Check ecosystem.config.js exists
- View PM2 logs: `pm2 logs`
- Restart individual app: `pm2 restart backend-api`

### Nginx Configuration Errors
- Test config: `sudo nginx -t`
- Check error logs: `sudo tail -f /var/log/nginx/error.log`
- Verify SSL certificates exist

## Quick Mode Behavior

When using `--quick` flag:
- Auto-answers "yes" to all prompts
- Skips interactive confirmations
- Useful for CI/CD pipelines
- Still validates all requirements

## Safety Features

The script includes several safety measures:
- ✅ Backs up existing .env files before overwriting
- ✅ Asks before stopping PM2 processes
- ✅ Tests Nginx config before reloading
- ✅ Validates database connection before migrations
- ✅ Checks syntax before starting builds

## Support

For issues or questions:
1. Check the logs: `pm2 logs`
2. Review Nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. Verify environment variables in .env.production
4. Ensure all domains point to the correct IP
