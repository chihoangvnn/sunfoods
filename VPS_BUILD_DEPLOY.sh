#!/bin/bash
# =============================================================================
# VPS Build & Deploy Script - Build Everything On VPS
# =============================================================================

set -e

echo "🚀 Build & Deploy on VPS..."

DOMAIN="yourdomain.com"  # TODO: Replace
APP_DIR="/var/www/app"

GREEN='\033[0;32m'
NC='\033[0m'

print_step() {
    echo -e "${GREEN}▶ $1${NC}"
}

# Install system packages
print_step "Installing system packages..."
sudo apt update
sudo apt install -y nodejs npm nginx certbot python3-certbot-nginx

# Install global packages
print_step "Installing PM2..."
sudo npm install -g pm2

# Setup app directory
print_step "Setting up app directory..."
sudo mkdir -p ${APP_DIR}
sudo chown -R $USER:$USER ${APP_DIR}

echo ""
echo "📥 Upload these SOURCE folders to ${APP_DIR}:"
echo "   - backend/ (source code, not dist)"
echo "   - admin-web/ (source code)"
echo "   - customer-mobile/ (source code)"
echo "   - ecosystem.config.js"
echo "   - nginx.conf.template"
echo "   - .env"
echo ""
read -p "Press Enter when uploaded..."

# Build Backend
print_step "Building backend..."
cd ${APP_DIR}/backend
npm install
npm run build  # Creates dist/

# Build Admin
print_step "Building admin frontend..."
cd ${APP_DIR}/admin-web
npm install
npm run build  # Creates dist/
mkdir -p ${APP_DIR}/backend/public
cp -r dist/* ${APP_DIR}/backend/public/admin/

# Build Mobile
print_step "Building mobile frontend..."
cd ${APP_DIR}/customer-mobile
npm install
npm run build  # Creates .next/

# Clean up dev dependencies (optional - keeps build smaller)
print_step "Cleaning up dev dependencies..."
cd ${APP_DIR}/backend
npm prune --production || echo "Warning: Could not prune dev dependencies"

cd ${APP_DIR}/customer-mobile
npm prune --production || echo "Warning: Could not prune dev dependencies"

# Start with PM2
print_step "Starting PM2..."
cd ${APP_DIR}
pm2 start ecosystem.config.js
pm2 save
pm2 startup

echo ""
echo "⚠️  Run the PM2 startup command above!"
read -p "Press Enter after running it..."

# Setup Nginx
print_step "Configuring Nginx..."
sudo sed "s/yourdomain.com/${DOMAIN}/g" ${APP_DIR}/nginx.conf.template > /tmp/nginx-site.conf
sudo mv /tmp/nginx-site.conf /etc/nginx/sites-available/${DOMAIN}
sudo ln -sf /etc/nginx/sites-available/${DOMAIN} /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

sudo nginx -t && sudo systemctl reload nginx

# Setup SSL
print_step "Setting up SSL..."
read -p "Setup SSL now? (y/n): " setup_ssl

if [ "$setup_ssl" = "y" ]; then
    sudo certbot --nginx -d ${DOMAIN} -d www.${DOMAIN}
    sudo systemctl reload nginx
fi

# Firewall
print_step "Configuring firewall..."
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp  
sudo ufw allow 443/tcp
sudo ufw --force enable

echo ""
echo "=========================================="
echo "✅ Build & Deploy Complete!"
echo "=========================================="
echo ""
echo "URLs:"
echo "  Mobile:  https://${DOMAIN}"
echo "  Admin:   https://${DOMAIN}/adminhoang"
echo ""
echo "Commands:"
echo "  pm2 status"
echo "  pm2 logs"
echo "  pm2 restart all"
echo ""
