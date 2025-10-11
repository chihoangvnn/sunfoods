#!/bin/bash
# =============================================================================
# VPS Deployment Script - Auto Deploy E-Commerce Platform
# =============================================================================

set -e  # Exit on error

echo "🚀 Starting VPS Deployment..."

# Configuration
DOMAIN="yourdomain.com"  # TODO: Replace with your domain
APP_DIR="/var/www/app"
NODE_VERSION="20"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper functions
print_step() {
    echo -e "${GREEN}▶ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
    print_error "Please do not run as root. Run as normal user with sudo privileges."
    exit 1
fi

# Step 1: Update system
print_step "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Step 2: Install Node.js
print_step "Installing Node.js ${NODE_VERSION}..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi
node --version
npm --version

# Step 3: Install PM2
print_step "Installing PM2..."
sudo npm install -g pm2

# Step 4: Install Nginx
print_step "Installing Nginx..."
if ! command -v nginx &> /dev/null; then
    sudo apt install -y nginx
fi

# Step 5: Install Certbot for SSL
print_step "Installing Certbot..."
sudo apt install -y certbot python3-certbot-nginx

# Step 6: Create app directory
print_step "Creating app directory..."
sudo mkdir -p ${APP_DIR}
sudo chown -R $USER:$USER ${APP_DIR}

# Step 7: Clone/Copy project files
print_step "Setting up project structure..."
cd ${APP_DIR}

# Create directory structure
mkdir -p backend customer-mobile logs

echo ""
print_warning "MANUAL STEPS REQUIRED:"
echo "1. Upload these folders to ${APP_DIR}:"
echo "   - backend/dist/"
echo "   - backend/public/"
echo "   - backend/package.json"
echo "   - customer-mobile/.next/"
echo "   - customer-mobile/package.json"
echo "   - ecosystem.config.js"
echo "   - nginx.conf.template"
echo ""
echo "2. Upload .env file with your environment variables"
echo ""
read -p "Press Enter when files are uploaded..."

# Step 8: Install dependencies
print_step "Installing backend dependencies..."
cd ${APP_DIR}/backend
npm ci --production

print_step "Installing mobile dependencies..."
cd ${APP_DIR}/customer-mobile
npm ci --production

# Step 9: Setup PM2
print_step "Starting PM2 processes..."
cd ${APP_DIR}
pm2 start ecosystem.config.js
pm2 save
pm2 startup

print_warning "Run the command that PM2 outputs above!"
read -p "Press Enter after running PM2 startup command..."

# Step 10: Configure Nginx
print_step "Configuring Nginx..."
sudo sed "s/yourdomain.com/${DOMAIN}/g" ${APP_DIR}/nginx.conf.template > /tmp/nginx-site.conf
sudo mv /tmp/nginx-site.conf /etc/nginx/sites-available/${DOMAIN}
sudo ln -sf /etc/nginx/sites-available/${DOMAIN} /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx config
sudo nginx -t

if [ $? -eq 0 ]; then
    print_step "Reloading Nginx..."
    sudo systemctl reload nginx
else
    print_error "Nginx configuration test failed!"
    exit 1
fi

# Step 11: Setup SSL
print_step "Setting up SSL certificate..."
read -p "Do you want to setup SSL now? (y/n): " setup_ssl

if [ "$setup_ssl" = "y" ]; then
    sudo certbot --nginx -d ${DOMAIN} -d www.${DOMAIN}
    
    if [ $? -eq 0 ]; then
        print_step "SSL certificate installed successfully!"
        sudo systemctl reload nginx
    else
        print_warning "SSL setup failed. You can run it manually later:"
        echo "sudo certbot --nginx -d ${DOMAIN}"
    fi
else
    print_warning "Skipping SSL setup. Run this later:"
    echo "sudo certbot --nginx -d ${DOMAIN}"
fi

# Step 12: Configure firewall
print_step "Configuring UFW firewall..."
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw --force enable

# Step 13: Final checks
print_step "Running final checks..."
pm2 status
sudo systemctl status nginx

echo ""
echo "=========================================="
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo "=========================================="
echo ""
echo "Your app is now running:"
echo "  Mobile:  http://${DOMAIN}"
echo "  Admin:   http://${DOMAIN}/adminhoang"
echo ""
if [ "$setup_ssl" = "y" ]; then
    echo "  Mobile:  https://${DOMAIN}"
    echo "  Admin:   https://${DOMAIN}/adminhoang"
    echo ""
fi
echo "Useful commands:"
echo "  pm2 status           - Check app status"
echo "  pm2 logs             - View logs"
echo "  pm2 restart all      - Restart apps"
echo "  sudo nginx -t        - Test Nginx config"
echo "  sudo systemctl reload nginx - Reload Nginx"
echo ""
