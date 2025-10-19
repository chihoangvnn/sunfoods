#!/bin/bash

echo "🚀 Quick VPS Fix Script"
echo "========================"

# Upload comprehensive fix script to VPS
echo "📤 Uploading fix script to VPS..."
scp backend/comprehensive-fix.js root@your-vps-ip:/var/www/sun/backend/

# Run fix on VPS
echo "🔧 Running fix on VPS..."
ssh root@your-vps-ip << 'EOF'
cd /var/www/sun/backend

echo "📝 Running comprehensive fix..."
node comprehensive-fix.js

echo "🏗️ Building..."
npm run build

echo "🔄 Restarting backend..."
pm2 restart backend || systemctl restart backend

echo "✅ Fix completed!"
EOF

echo "🎉 VPS fix completed!"
