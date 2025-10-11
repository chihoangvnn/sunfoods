#!/bin/bash
# =============================================================================
# Create Production Deployment Package - All Storefronts
# =============================================================================

echo "📦 Creating deployment package for all storefronts..."

# Build all 3 Next.js storefronts
echo "▶ Building SunFoods storefront..."
cd customer-mobile && npm run build && cd ..

echo "▶ Building Tramhuong storefront..."
cd customer-tramhuong && npm run build && cd ..

echo "▶ Building Nhangsach storefront..."
cd customer-nhangsach && npm run build && cd ..

# Create deployment structure
mkdir -p deployment/{backend,customer-mobile,customer-tramhuong,customer-nhangsach}

# Copy backend built files
echo "▶ Copying backend production files..."
cp -r backend/dist deployment/backend/
cp -r backend/public deployment/backend/
cp backend/package.json deployment/backend/
cp backend/package-lock.json deployment/backend/

# Copy SunFoods storefront (customer-mobile)
echo "▶ Copying SunFoods storefront files..."
cp -r customer-mobile/.next deployment/customer-mobile/
cp -r customer-mobile/src deployment/customer-mobile/
cp -r customer-mobile/public deployment/customer-mobile/ 2>/dev/null || true
cp customer-mobile/package.json deployment/customer-mobile/
cp customer-mobile/package-lock.json deployment/customer-mobile/
cp customer-mobile/next.config.* deployment/customer-mobile/ 2>/dev/null || true

# Copy Tramhuong storefront (customer-tramhuong)
echo "▶ Copying Tramhuong storefront files..."
cp -r customer-tramhuong/.next deployment/customer-tramhuong/
cp -r customer-tramhuong/src deployment/customer-tramhuong/
cp -r customer-tramhuong/public deployment/customer-tramhuong/ 2>/dev/null || true
cp customer-tramhuong/package.json deployment/customer-tramhuong/
cp customer-tramhuong/package-lock.json deployment/customer-tramhuong/
cp customer-tramhuong/next.config.* deployment/customer-tramhuong/ 2>/dev/null || true

# Copy Nhangsach storefront (customer-nhangsach)
echo "▶ Copying Nhangsach storefront files..."
cp -r customer-nhangsach/.next deployment/customer-nhangsach/
cp -r customer-nhangsach/src deployment/customer-nhangsach/
cp -r customer-nhangsach/public deployment/customer-nhangsach/ 2>/dev/null || true
cp customer-nhangsach/package.json deployment/customer-nhangsach/
cp customer-nhangsach/package-lock.json deployment/customer-nhangsach/
cp customer-nhangsach/next.config.* deployment/customer-nhangsach/ 2>/dev/null || true

# Copy configs
echo "▶ Copying configuration files..."
cp ecosystem.config.js deployment/
cp nginx.conf deployment/nginx.conf

# Copy .env.production.example
echo "▶ Copying environment template..."
cp .env.production.example deployment/

# Create VPS install script
cat > deployment/INSTALL_ON_VPS.sh << 'EOFSCRIPT'
#!/bin/bash
set -e

DOMAIN="yourdomain.com"  # TODO: Replace with your domain
APP_DIR="/var/www/app"

echo "🚀 Installing pre-built application on VPS..."

# Install Node.js if not exists
if ! command -v node &> /dev/null; then
    echo "▶ Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Install PM2 globally
echo "▶ Installing PM2..."
sudo npm install -g pm2

# Install Nginx
if ! command -v nginx &> /dev/null; then
    echo "▶ Installing Nginx..."
    sudo apt install -y nginx
fi

# Install Certbot
echo "▶ Installing Certbot for SSL..."
sudo apt install -y certbot python3-certbot-nginx

# Setup app directory
echo "▶ Setting up application..."
sudo mkdir -p ${APP_DIR}
sudo chown -R $USER:$USER ${APP_DIR}

# Copy files (assuming script is in deployment folder)
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cp -r ${SCRIPT_DIR}/* ${APP_DIR}/

# Install backend dependencies (production only)
echo "▶ Installing backend dependencies..."
cd ${APP_DIR}/backend
npm ci --production

# Install SunFoods storefront dependencies
echo "▶ Installing SunFoods storefront dependencies..."
cd ${APP_DIR}/customer-mobile
npm ci --production

# Install Tramhuong storefront dependencies
echo "▶ Installing Tramhuong storefront dependencies..."
cd ${APP_DIR}/customer-tramhuong
npm ci --production

# Install Nhangsach storefront dependencies
echo "▶ Installing Nhangsach storefront dependencies..."
cd ${APP_DIR}/customer-nhangsach
npm ci --production

# Setup environment
cd ${APP_DIR}
if [ ! -f .env ]; then
    echo "⚠️  Creating .env from template..."
    cp .env.production.example .env
    echo "⚠️  IMPORTANT: Edit .env and add your real credentials!"
    nano .env
fi

# Start PM2
echo "▶ Starting applications with PM2..."
pm2 start ecosystem.config.js
pm2 save
pm2 startup

echo ""
echo "⚠️  Run the PM2 startup command above, then press Enter..."
read

# Configure Nginx
echo "▶ Configuring Nginx..."
sudo sed "s/yourdomain.com/${DOMAIN}/g" ${APP_DIR}/nginx.conf > /tmp/nginx-site.conf
sudo mv /tmp/nginx-site.conf /etc/nginx/sites-available/${DOMAIN}
sudo ln -sf /etc/nginx/sites-available/${DOMAIN} /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test and reload Nginx
sudo nginx -t && sudo systemctl reload nginx

# Setup SSL
echo "▶ Setting up SSL certificate..."
read -p "Setup SSL now? (y/n): " setup_ssl
if [ "$setup_ssl" = "y" ]; then
    sudo certbot --nginx -d ${DOMAIN} -d www.${DOMAIN}
    sudo systemctl reload nginx
fi

# Configure firewall
echo "▶ Configuring firewall..."
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

echo ""
echo "=========================================="
echo "✅ Installation Complete!"
echo "=========================================="
echo ""
echo "Your app is running at:"
echo "  https://${DOMAIN}"
echo "  https://${DOMAIN}/adminhoang"
echo ""
echo "Useful commands:"
echo "  pm2 status"
echo "  pm2 logs"
echo "  pm2 restart all"
echo ""
EOFSCRIPT

chmod +x deployment/INSTALL_ON_VPS.sh

# Create README
cat > deployment/README.md << 'EOF'
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
EOF

# Create tarball
echo "▶ Creating compressed package..."
tar -czf vps-deployment.tar.gz deployment/

# Show result
echo ""
echo "=========================================="
echo "✅ Deployment Package Created!"
echo "=========================================="
echo ""
echo "📦 Package: vps-deployment.tar.gz"
echo "📊 Size: $(du -h vps-deployment.tar.gz | cut -f1)"
echo ""
echo "📁 Contents:"
ls -lh deployment/
echo ""
echo "📥 Next Steps:"
echo "1. Download 'vps-deployment.tar.gz' from Replit"
echo "2. Extract on your VPS: tar -xzf vps-deployment.tar.gz"
echo "3. Run: cd deployment && ./INSTALL_ON_VPS.sh"
echo ""
