#!/bin/bash

echo "🚀 Quick VPS Ultra Safe Fix"
echo "============================"

# Upload script to VPS
echo "📤 Uploading ultra safe fix script..."
scp backend/ultra-safe-fix.js root@your-vps-ip:/var/www/sun/backend/

# Run fix on VPS
echo "🔧 Running fix on VPS..."
ssh root@your-vps-ip "cd /var/www/sun/backend && node ultra-safe-fix.js && npm run build && pm2 restart backend"

echo "✅ Done!"



