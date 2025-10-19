#!/bin/bash

# Simple script to fix VPS backend
echo "🚀 Fixing VPS Backend..."

# Upload the fix script
echo "📤 Uploading fix script..."
scp backend/comprehensive-fix.js root@your-vps-ip:/var/www/sun/backend/

# Run the fix
echo "🔧 Running fix on VPS..."
ssh root@your-vps-ip "cd /var/www/sun/backend && node comprehensive-fix.js && npm run build && pm2 restart backend"

echo "✅ Done!"
