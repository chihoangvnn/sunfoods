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
