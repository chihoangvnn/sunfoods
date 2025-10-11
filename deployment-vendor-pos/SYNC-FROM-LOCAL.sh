#!/bin/bash
# Script to sync deployment from Replit to your VPS
# Run this on YOUR LOCAL MACHINE

echo "=== Sync Deployment from Replit to VPS ==="
echo ""

# Step 1: Instructions
cat << 'EOF'
IMPORTANT: Run this script on YOUR LOCAL MACHINE, not on Replit!

Prerequisites:
1. You need SSH access to your VPS (sunfoods.vn)
2. You need access to this Replit project

Steps:
------

METHOD 1: Download then Upload (Easiest)
1. In Replit, click on "deployment-vendor-pos" folder in left sidebar
2. Right-click → "Download as zip"
3. Extract on your local machine
4. Run from the extracted directory:
   scp -r deployment-vendor-pos/ user@sunfoods.vn:/tmp/

METHOD 2: Using Replit's download feature
1. Download the entire "deployment-vendor-pos" folder from Replit
2. Upload to VPS:
   scp -r /path/to/deployment-vendor-pos user@sunfoods.vn:/tmp/

Then on your VPS:
-----------------
ssh user@sunfoods.vn

# Backup current version
cd /var/www/sunfoods
pm2 stop all
mv backend backend.backup-$(date +%Y%m%d-%H%M%S)

# Deploy new version
cp -r /tmp/deployment-vendor-pos/backend ./
bash backend/deploy-to-vps.sh  # Or: bash /tmp/deployment-vendor-pos/deploy-to-vps.sh

# Start services
pm2 start ecosystem.config.js
pm2 save
pm2 logs backend

# Verify
curl http://localhost:5000/adminhoang

Done! Your admin with Vendor Management & POS is now live at:
https://sunfoods.vn/adminhoang

EOF
