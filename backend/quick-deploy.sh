#!/bin/bash
echo "🚀 Tạo deployment package..."

# Tạo folder deployment
rm -rf vps-quick-deploy
mkdir -p vps-quick-deploy/{backend,customer-mobile}

# Copy backend dist + dependencies
cp -r backend/dist vps-quick-deploy/backend/
cp -r backend/public vps-quick-deploy/backend/
cp -r backend/shared vps-quick-deploy/backend/
cp backend/package*.json vps-quick-deploy/backend/

# Copy mobile build
cp -r customer-mobile/.next vps-quick-deploy/customer-mobile/
cp -r customer-mobile/public vps-quick-deploy/customer-mobile/ 2>/dev/null || true
cp customer-mobile/package*.json vps-quick-deploy/customer-mobile/

# Copy configs
cat > vps-quick-deploy/install.sh << 'INSTALL'
#!/bin/bash
echo "📥 Installing on VPS..."

# Install backend dependencies
cd backend
npm ci --production
cd ..

# Install mobile dependencies
cd customer-mobile
npm ci --production
cd ..

# Restart PM2
pm2 restart all || pm2 start ecosystem.config.js

echo "✅ Done! Check: pm2 status"
INSTALL

chmod +x vps-quick-deploy/install.sh

# Copy PM2 config
cp ecosystem.config.js vps-quick-deploy/ecosystem.config.js 2>/dev/null || \
cat > vps-quick-deploy/ecosystem.config.js << 'PM2'
module.exports = {
  apps: [
    {
      name: 'backend',
      script: 'dist/index.js',
      cwd: '/var/www/sun/backend',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    },
    {
      name: 'mobile',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3001',
      cwd: '/var/www/sun/customer-mobile',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
PM2

# Tạo tarball
tar -czf vps-quick-deploy.tar.gz vps-quick-deploy/
ls -lh vps-quick-deploy.tar.gz

echo ""
echo "✅ Package created: vps-quick-deploy.tar.gz"
echo ""
echo "📤 Upload to VPS:"
echo "   scp vps-quick-deploy.tar.gz root@sunfoods.vn:/tmp/"
echo ""
echo "📥 On VPS run:"
echo "   cd /var/www/sun"
echo "   tar -xzf /tmp/vps-quick-deploy.tar.gz --strip-components=1"
echo "   bash install.sh"
