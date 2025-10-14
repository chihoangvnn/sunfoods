#!/bin/bash

# VPS Multi-Store Deployment Script
# Usage: ./deploy-vps.sh

set -e  # Exit on error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 VPS Multi-Store Deployment${NC}"
echo "================================"

# Check if SSH key exists
if [ ! -f ~/.ssh/id_rsa ] && [ ! -f ~/.ssh/id_ed25519 ]; then
    echo -e "${RED}❌ SSH key not found!${NC}"
    echo ""
    echo "Please setup SSH key authentication first:"
    echo "1. Generate SSH key: ssh-keygen -t ed25519 -C 'your-email@example.com'"
    echo "2. Copy to VPS: ssh-copy-id user@your-vps-ip"
    echo "3. Test: ssh user@your-vps-ip"
    exit 1
fi

# Prompt for VPS details
read -p "Enter VPS IP address: " VPS_IP
read -p "Enter VPS username (default: root): " VPS_USER
VPS_USER=${VPS_USER:-root}

read -p "Enter project directory on VPS (default: /var/www/ecommerce): " PROJECT_DIR
PROJECT_DIR=${PROJECT_DIR:-/var/www/ecommerce}

echo ""
echo -e "${YELLOW}📋 Deployment Configuration:${NC}"
echo "VPS IP: $VPS_IP"
echo "User: $VPS_USER"
echo "Project Dir: $PROJECT_DIR"
echo ""

read -p "Continue with deployment? (y/n): " CONFIRM
if [ "$CONFIRM" != "y" ]; then
    echo "Deployment cancelled."
    exit 0
fi

echo ""
echo -e "${GREEN}Step 1: Testing SSH connection...${NC}"
if ssh -o ConnectTimeout=5 $VPS_USER@$VPS_IP "echo 'SSH OK'" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ SSH connection successful${NC}"
else
    echo -e "${RED}✗ SSH connection failed${NC}"
    echo "Please setup SSH key authentication first"
    exit 1
fi

echo ""
echo -e "${GREEN}Step 2: Installing system requirements...${NC}"
ssh $VPS_USER@$VPS_IP << 'ENDSSH'
    # Update system
    sudo apt update
    
    # Install Node.js 20.x
    if ! command -v node &> /dev/null; then
        curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
        sudo apt install -y nodejs
    fi
    
    # Install Nginx
    if ! command -v nginx &> /dev/null; then
        sudo apt install -y nginx
    fi
    
    # Install PM2 globally
    if ! command -v pm2 &> /dev/null; then
        sudo npm install -g pm2
    fi
    
    # Install Certbot for SSL
    if ! command -v certbot &> /dev/null; then
        sudo apt install -y certbot python3-certbot-nginx
    fi
    
    echo "✓ System requirements installed"
ENDSSH

echo ""
echo -e "${GREEN}Step 3: Creating project directory...${NC}"
ssh $VPS_USER@$VPS_IP "sudo mkdir -p $PROJECT_DIR && sudo chown -R $VPS_USER:$VPS_USER $PROJECT_DIR"
echo -e "${GREEN}✓ Directory created: $PROJECT_DIR${NC}"

echo ""
echo -e "${GREEN}Step 4: Uploading project files...${NC}"
rsync -avz --progress \
    --exclude 'node_modules' \
    --exclude '.git' \
    --exclude 'dist' \
    --exclude '.next' \
    --exclude 'build' \
    --exclude '.replit' \
    --exclude '.cache' \
    ./ $VPS_USER@$VPS_IP:$PROJECT_DIR/

echo -e "${GREEN}✓ Files uploaded${NC}"

echo ""
echo -e "${GREEN}Step 5: Installing dependencies and building...${NC}"
ssh $VPS_USER@$VPS_IP << ENDSSH
    cd $PROJECT_DIR
    
    # Install root dependencies
    npm install
    
    # Build backend
    echo "Building backend..."
    cd backend && npm install && cd ..
    
    # Build Sunfoods storefront
    echo "Building Sunfoods..."
    cd customer-mobile && npm install && npm run build && cd ..
    
    # Build Tramhuong storefront
    echo "Building Tramhuong..."
    cd customer-tramhuong && npm install && npm run build && cd ..
    
    # Build Nhangsach storefront
    echo "Building Nhangsach..."
    cd customer-nhangsach && npm install && npm run build && cd ..
    
    echo "✓ All builds complete"
ENDSSH

echo ""
echo -e "${GREEN}Step 6: Setting up Nginx...${NC}"
ssh $VPS_USER@$VPS_IP << ENDSSH
    cd $PROJECT_DIR
    
    # Copy Nginx config
    sudo cp nginx-multisite.conf /etc/nginx/sites-available/multisite
    sudo ln -sf /etc/nginx/sites-available/multisite /etc/nginx/sites-enabled/
    sudo rm -f /etc/nginx/sites-enabled/default
    
    # Test Nginx config
    sudo nginx -t
    
    echo "✓ Nginx configured"
ENDSSH

echo ""
echo -e "${GREEN}Step 7: Configuring firewall...${NC}"
ssh $VPS_USER@$VPS_IP << 'ENDSSH'
    # Allow SSH (CRITICAL - prevent lockout)
    sudo ufw allow OpenSSH
    
    # Allow Nginx
    sudo ufw allow 'Nginx Full'
    
    # Enable firewall
    echo "y" | sudo ufw enable
    
    # Show status
    sudo ufw status
    
    echo "✓ Firewall configured"
ENDSSH

echo ""
echo -e "${GREEN}Step 8: Setting up SSL certificates...${NC}"
read -p "Setup SSL now? This requires domains pointing to VPS (y/n): " SETUP_SSL

if [ "$SETUP_SSL" = "y" ]; then
    read -p "Enter domain 1 (e.g., sunfoods.vn): " DOMAIN1
    read -p "Enter domain 2 (e.g., tramhuonghoangngan.com): " DOMAIN2
    read -p "Enter domain 3 (e.g., nhangsach.net): " DOMAIN3
    
    ssh $VPS_USER@$VPS_IP << ENDSSH
        # Get certificates
        sudo certbot --nginx -d $DOMAIN1 -d www.$DOMAIN1 --non-interactive --agree-tos --register-unsafely-without-email
        sudo certbot --nginx -d $DOMAIN2 -d www.$DOMAIN2 --non-interactive --agree-tos --register-unsafely-without-email
        sudo certbot --nginx -d $DOMAIN3 -d www.$DOMAIN3 --non-interactive --agree-tos --register-unsafely-without-email
        
        echo "✓ SSL certificates installed"
ENDSSH
else
    echo "⚠️  Skipping SSL setup. Run manually: sudo certbot --nginx -d yourdomain.com"
fi

echo ""
echo -e "${GREEN}Step 9: Copying environment variables...${NC}"
echo "⚠️  You need to manually copy .env files with sensitive data"
echo ""
echo "Run these commands on VPS:"
echo "  nano $PROJECT_DIR/backend/.env"
echo "  # Add: DATABASE_URL, ENCRYPTION_KEY, etc."

echo ""
read -p "Press Enter when .env files are ready..."

echo ""
echo -e "${GREEN}Step 10: Starting PM2 services...${NC}"
ssh $VPS_USER@$VPS_IP << ENDSSH
    cd $PROJECT_DIR
    
    # Stop existing PM2 processes
    pm2 delete all 2>/dev/null || true
    
    # Start all services
    pm2 start ecosystem.config.js
    
    # Save PM2 config
    pm2 save
    
    # Setup PM2 startup script
    pm2 startup systemd -u $VPS_USER --hp /home/$VPS_USER | tail -n 1 | sudo bash
    
    # Reload Nginx
    sudo systemctl reload nginx
    
    echo "✓ Services started"
ENDSSH

echo ""
echo -e "${GREEN}Step 11: Verifying deployment...${NC}"
ssh $VPS_USER@$VPS_IP << ENDSSH
    echo ""
    echo "PM2 Status:"
    pm2 status
    
    echo ""
    echo "Nginx Status:"
    sudo systemctl status nginx --no-pager
    
    echo ""
    echo "Open Ports:"
    sudo netstat -tlnp | grep -E ':(80|443|3000|3001|3002|3003|5000)'
ENDSSH

echo ""
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo "================================"
echo ""
echo "🌐 Access your stores:"
echo "  - Backend API: http://$VPS_IP:5000"
echo "  - Sunfoods: http://$VPS_IP:3001"
echo "  - Tramhuong: http://$VPS_IP:3002"
echo "  - Nhangsach: http://$VPS_IP:3003"
echo ""
echo "📊 Useful commands:"
echo "  - View logs: ssh $VPS_USER@$VPS_IP 'pm2 logs'"
echo "  - Restart: ssh $VPS_USER@$VPS_IP 'pm2 restart all'"
echo "  - Status: ssh $VPS_USER@$VPS_IP 'pm2 status'"
echo ""
echo "🔐 Next steps:"
echo "  1. Point your domains to VPS IP: $VPS_IP"
echo "  2. Test SSL: https://yourdomain.com"
echo "  3. Monitor logs: pm2 logs"
