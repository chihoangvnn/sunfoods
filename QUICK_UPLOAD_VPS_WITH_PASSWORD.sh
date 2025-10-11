#!/bin/bash
# Quick VPS Upload Script with Password Auto-login
# ⚠️ WARNING: Storing password in script is NOT secure for production!
# Usage: bash QUICK_UPLOAD_VPS_WITH_PASSWORD.sh

# ========== CẤU HÌNH VPS ==========
VPS_IP="sunfoods.vn"
VPS_USER="root"
VPS_PASSWORD="XPMtymPMggn8dhtRPFse"  # ⚠️ THAY ĐỔI PASSWORD Ở ĐÂY
VPS_DIR="/var/www/sun"

# Check if sshpass is installed
if ! command -v sshpass &> /dev/null; then
    echo "❌ sshpass chưa cài đặt!"
    echo "Cài đặt: apt-get install sshpass (Ubuntu/Debian)"
    exit 1
fi

# SCP with password
SCP_CMD="sshpass -p '$VPS_PASSWORD' scp -o StrictHostKeyChecking=no"

echo "🚀 Uploading to $VPS_USER@$VPS_IP..."
echo ""

# Upload backend src
echo "▶ Uploading backend src..."
eval "$SCP_CMD -r backend/src $VPS_USER@$VPS_IP:$VPS_DIR/backend/"

# Upload backend public
echo "▶ Uploading backend public..."
eval "$SCP_CMD -r backend/public $VPS_USER@$VPS_IP:$VPS_DIR/backend/"

# Upload backend shared
echo "▶ Uploading backend shared..."
eval "$SCP_CMD -r backend/shared $VPS_USER@$VPS_IP:$VPS_DIR/backend/"

# Upload backend package.json
echo "▶ Uploading backend package.json..."
eval "$SCP_CMD backend/package.json $VPS_USER@$VPS_IP:$VPS_DIR/backend/"

# Upload customer-mobile .next
echo "▶ Uploading customer-mobile .next..."
eval "$SCP_CMD -r customer-mobile/.next $VPS_USER@$VPS_IP:$VPS_DIR/customer-mobile/"

# Upload customer-mobile public (if exists)
echo "▶ Uploading customer-mobile public..."
eval "$SCP_CMD -r customer-mobile/public $VPS_USER@$VPS_IP:$VPS_DIR/customer-mobile/" 2>/dev/null || echo "  (public folder not found, skipping)"

# Upload customer-mobile package.json
echo "▶ Uploading customer-mobile package.json..."
eval "$SCP_CMD customer-mobile/package.json $VPS_USER@$VPS_IP:$VPS_DIR/customer-mobile/"

# Upload PM2 config
echo "▶ Uploading PM2 config..."
eval "$SCP_CMD vps-quick-deploy/ecosystem.config.js $VPS_USER@$VPS_IP:$VPS_DIR/"

# Upload install script
echo "▶ Uploading install script..."
eval "$SCP_CMD vps-quick-deploy/install.sh $VPS_USER@$VPS_IP:$VPS_DIR/"

# Upload .env example
echo "▶ Uploading .env.example..."
eval "$SCP_CMD vps-quick-deploy/.env.example $VPS_USER@$VPS_IP:$VPS_DIR/"

echo ""
echo "✅ Upload complete!"
echo ""
echo "📥 Now SSH to VPS and run:"
echo "   sshpass -p '$VPS_PASSWORD' ssh $VPS_USER@$VPS_IP 'cd $VPS_DIR && bash install.sh'"
echo ""
