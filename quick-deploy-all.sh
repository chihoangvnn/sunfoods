#!/bin/bash

echo "🚀 Quick Deploy All Fixes to VPS"
echo "================================="

# Upload scripts
echo "📤 Uploading fix scripts..."
scp backend/ultra-safe-fix.js root@your-vps-ip:/var/www/sun/backend/
scp customer-nhangsach/ultra-safe-fix.js root@your-vps-ip:/var/www/sun/customer-nhangsach/

# Run fixes
echo "🔧 Running fixes on VPS..."
ssh root@your-vps-ip << 'EOF'
# Fix backend
cd /var/www/sun/backend
node ultra-safe-fix.js
npm run build
pm2 restart backend

# Fix customer-nhangsach
cd /var/www/sun/customer-nhangsach
node ultra-safe-fix.js
npm run build
pm2 restart customer-nhangsach

echo "✅ All fixes completed!"
EOF

echo "🎉 Done!"



