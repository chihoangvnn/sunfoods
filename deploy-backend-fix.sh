#!/bin/bash

echo "🚀 Deploying backend fixes to VPS..."

# Configuration
VPS_HOST="your-vps-ip"
VPS_USER="root"
VPS_PATH="/var/www/sun/backend"

# Create deployment package
echo "📦 Creating deployment package..."
tar -czf backend-fix.tar.gz \
  --exclude=node_modules \
  --exclude=dist \
  --exclude=.git \
  --exclude=*.log \
  backend/

# Upload to VPS
echo "📤 Uploading to VPS..."
scp backend-fix.tar.gz $VPS_USER@$VPS_HOST:/tmp/

# Deploy on VPS
echo "🔧 Deploying on VPS..."
ssh $VPS_USER@$VPS_HOST << 'EOF'
cd /var/www/sun/backend

# Backup current version
echo "💾 Backing up current version..."
tar -czf backup-$(date +%Y%m%d-%H%M%S).tar.gz --exclude=node_modules --exclude=dist .

# Extract new version
echo "📥 Extracting new version..."
tar -xzf /tmp/backend-fix.tar.gz --strip-components=1

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Run comprehensive fix
echo "🔧 Running comprehensive fix..."
node comprehensive-fix.js

# Build
echo "🏗️ Building..."
npm run build

# Restart services
echo "🔄 Restarting services..."
pm2 restart backend || systemctl restart backend

echo "✅ Deployment completed!"
EOF

# Cleanup
echo "🧹 Cleaning up..."
rm backend-fix.tar.gz

echo "🎉 Deployment completed successfully!"
