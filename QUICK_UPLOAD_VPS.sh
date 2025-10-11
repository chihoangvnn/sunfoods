#!/bin/bash
# Quick VPS Upload Script for Sun E-commerce
# Usage: bash QUICK_UPLOAD_VPS.sh your-vps-ip

VPS_IP=${1:-sunfoods.vn}
VPS_USER=${2:-root}
VPS_DIR="/var/www/sun"

echo "🚀 Uploading to $VPS_USER@$VPS_IP..."
echo ""

# Upload backend src
echo "▶ Uploading backend src..."
scp -r backend/src $VPS_USER@$VPS_IP:$VPS_DIR/backend/

# Upload backend public
echo "▶ Uploading backend public..."
scp -r backend/public $VPS_USER@$VPS_IP:$VPS_DIR/backend/

# Upload backend shared
echo "▶ Uploading backend shared..."
scp -r backend/shared $VPS_USER@$VPS_IP:$VPS_DIR/backend/

# Upload backend package.json
echo "▶ Uploading backend package.json..."
scp backend/package.json $VPS_USER@$VPS_IP:$VPS_DIR/backend/

# Upload customer-mobile .next
echo "▶ Uploading customer-mobile .next..."
scp -r customer-mobile/.next $VPS_USER@$VPS_IP:$VPS_DIR/customer-mobile/

# Upload customer-mobile public (if exists)
echo "▶ Uploading customer-mobile public..."
scp -r customer-mobile/public $VPS_USER@$VPS_IP:$VPS_DIR/customer-mobile/ 2>/dev/null || echo "  (public folder not found, skipping)"

# Upload customer-mobile package.json
echo "▶ Uploading customer-mobile package.json..."
scp customer-mobile/package.json $VPS_USER@$VPS_IP:$VPS_DIR/customer-mobile/

# Upload PM2 config
echo "▶ Uploading PM2 config..."
scp vps-quick-deploy/ecosystem.config.js $VPS_USER@$VPS_IP:$VPS_DIR/

# Upload install script
echo "▶ Uploading install script..."
scp vps-quick-deploy/install.sh $VPS_USER@$VPS_IP:$VPS_DIR/

# Upload .env example
echo "▶ Uploading .env.example..."
scp vps-quick-deploy/.env.example $VPS_USER@$VPS_IP:$VPS_DIR/

echo ""
echo "✅ Upload complete!"
echo ""
echo "📥 Now SSH to VPS and run:"
echo "   ssh $VPS_USER@$VPS_IP"
echo "   cd $VPS_DIR"
echo "   bash install.sh"
echo ""
