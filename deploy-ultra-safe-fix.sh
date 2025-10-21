#!/bin/bash

echo "🚀 Deploying ULTRA SAFE fix to VPS..."
echo "====================================="

# Configuration
VPS_HOST="your-vps-ip"
VPS_USER="root"
VPS_PATH="/var/www/sun/backend"

# Upload the ultra safe fix script
echo "📤 Uploading ultra safe fix script..."
scp backend/ultra-safe-fix.js $VPS_USER@$VPS_HOST:$VPS_PATH/

# Run the fix on VPS
echo "🔧 Running ultra safe fix on VPS..."
ssh $VPS_USER@$VPS_HOST << 'EOF'
cd /var/www/sun/backend

echo "📝 Running ultra safe fix..."
node ultra-safe-fix.js

echo "🏗️ Building..."
npm run build

echo "🔄 Restarting backend..."
pm2 restart backend || systemctl restart backend

echo "✅ Ultra safe fix completed!"
EOF

echo "🎉 VPS deployment completed!"



