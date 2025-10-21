#!/bin/bash

echo "🚀 DEPLOYING ALL FIXES TO VPS"
echo "============================="

# Configuration
VPS_HOST="your-vps-ip"
VPS_USER="root"
BACKEND_PATH="/var/www/sun/backend"
CUSTOMER_PATH="/var/www/sun/customer-nhangsach"

# 1. Deploy backend fixes
echo "📤 Deploying backend fixes..."
scp backend/ultra-safe-fix.js $VPS_USER@$VPS_HOST:$BACKEND_PATH/

echo "🔧 Running backend fix on VPS..."
ssh $VPS_USER@$VPS_HOST << 'EOF'
cd /var/www/sun/backend

echo "📝 Running ultra safe fix..."
node ultra-safe-fix.js

echo "🏗️ Building backend..."
npm run build

echo "🔄 Restarting backend..."
pm2 restart backend || systemctl restart backend

echo "✅ Backend fix completed!"
EOF

# 2. Deploy customer-nhangsach fixes
echo "📤 Deploying customer-nhangsach fixes..."
scp customer-nhangsach/ultra-safe-fix.js $VPS_USER@$VPS_HOST:$CUSTOMER_PATH/

echo "🔧 Running customer-nhangsach fix on VPS..."
ssh $VPS_USER@$VPS_HOST << 'EOF'
cd /var/www/sun/customer-nhangsach

echo "📝 Running ultra safe fix..."
node ultra-safe-fix.js

echo "🏗️ Building customer-nhangsach..."
npm run build

echo "🔄 Restarting customer-nhangsach..."
pm2 restart customer-nhangsach || systemctl restart customer-nhangsach

echo "✅ Customer-nhangsach fix completed!"
EOF

echo "🎉 ALL DEPLOYMENTS COMPLETED!"
echo "============================="
echo "✅ Backend: Fixed and deployed"
echo "✅ Customer-nhangsach: Fixed and deployed"
echo "✅ All services restarted"



