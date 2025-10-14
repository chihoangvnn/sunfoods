#!/bin/bash

# VPS Setup Script - Run this ON your VPS after uploading files
# Usage: bash setup-on-vps.sh

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}🚀 VPS Setup Started${NC}"
echo "================================"

# Get current directory
PROJECT_DIR=$(pwd)
echo "Project directory: $PROJECT_DIR"

echo ""
echo -e "${GREEN}Step 1: Installing system requirements...${NC}"

# Update system
sudo apt update

# Install Node.js 20.x
if ! command -v node &> /dev/null; then
    echo "Installing Node.js 20..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
fi

# Install Nginx
if ! command -v nginx &> /dev/null; then
    echo "Installing Nginx..."
    sudo apt install -y nginx
fi

# Install PM2
if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2..."
    sudo npm install -g pm2
fi

# Install Certbot
if ! command -v certbot &> /dev/null; then
    echo "Installing Certbot..."
    sudo apt install -y certbot python3-certbot-nginx
fi

echo -e "${GREEN}✓ System requirements installed${NC}"

echo ""
echo -e "${GREEN}Step 2: Installing dependencies...${NC}"

# Install backend dependencies
echo "Installing backend..."
cd backend && npm install && cd ..

# Install and build Sunfoods
echo "Building Sunfoods storefront..."
cd customer-mobile && npm install && npm run build && cd ..

# Install and build Tramhuong
echo "Building Tramhuong storefront..."
cd customer-tramhuong && npm install && npm run build && cd ..

# Install and build Nhangsach
echo "Building Nhangsach storefront..."
cd customer-nhangsach && npm install && npm run build && cd ..

echo -e "${GREEN}✓ All builds complete${NC}"

echo ""
echo -e "${GREEN}Step 3: Setting up Nginx...${NC}"

# Copy Nginx config
sudo cp nginx-multisite.conf /etc/nginx/sites-available/multisite
sudo ln -sf /etc/nginx/sites-available/multisite /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test config
sudo nginx -t

echo -e "${GREEN}✓ Nginx configured${NC}"

echo ""
echo -e "${GREEN}Step 4: Configuring firewall...${NC}"

# Allow SSH (prevent lockout)
sudo ufw allow OpenSSH

# Allow Nginx
sudo ufw allow 'Nginx Full'

# Enable firewall
echo "y" | sudo ufw enable || true

echo -e "${GREEN}✓ Firewall configured${NC}"

echo ""
echo -e "${YELLOW}Step 5: Environment variables setup${NC}"
echo "You need to create .env file manually:"
echo ""
echo "  nano $PROJECT_DIR/backend/.env"
echo ""
echo "Add these variables:"
echo "  DATABASE_URL=your-database-url"
echo "  ENCRYPTION_KEY=your-encryption-key"
echo "  SESSION_SECRET=your-session-secret"
echo ""
read -p "Press Enter when .env is ready..."

echo ""
echo -e "${GREEN}Step 6: Starting PM2 services...${NC}"

# Stop existing processes
pm2 delete all 2>/dev/null || true

# Start all services
pm2 start ecosystem.config.js

# Save config
pm2 save

# Setup startup script
pm2 startup systemd -u $USER --hp $HOME | tail -n 1 | sudo bash

# Reload Nginx
sudo systemctl reload nginx

echo -e "${GREEN}✓ Services started${NC}"

echo ""
echo -e "${GREEN}Step 7: SSL Certificates (optional)${NC}"
read -p "Setup SSL certificates now? (y/n): " SETUP_SSL

if [ "$SETUP_SSL" = "y" ]; then
    read -p "Enter domain 1 (e.g., sunfoods.vn): " DOMAIN1
    read -p "Enter domain 2 (e.g., tramhuonghoangngan.com): " DOMAIN2
    read -p "Enter domain 3 (e.g., nhangsach.net): " DOMAIN3
    
    sudo certbot --nginx -d $DOMAIN1 -d www.$DOMAIN1 --non-interactive --agree-tos --register-unsafely-without-email || true
    sudo certbot --nginx -d $DOMAIN2 -d www.$DOMAIN2 --non-interactive --agree-tos --register-unsafely-without-email || true
    sudo certbot --nginx -d $DOMAIN3 -d www.$DOMAIN3 --non-interactive --agree-tos --register-unsafely-without-email || true
    
    sudo systemctl reload nginx
fi

echo ""
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo "================================"
echo ""
echo "📊 Service Status:"
pm2 status

echo ""
echo "🌐 Access your services:"
echo "  Backend API: http://YOUR_VPS_IP:5000"
echo "  Sunfoods: http://YOUR_VPS_IP:3001"
echo "  Tramhuong: http://YOUR_VPS_IP:3002"
echo "  Nhangsach: http://YOUR_VPS_IP:3003"

echo ""
echo "📝 Useful commands:"
echo "  View logs: pm2 logs"
echo "  Restart: pm2 restart all"
echo "  Stop: pm2 stop all"

echo ""
echo "🎉 Deployment successful!"
