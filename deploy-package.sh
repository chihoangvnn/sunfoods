#!/bin/bash

echo "🚀 Creating VPS Deployment Package..."

# Create deployment directory
mkdir -p vps-deploy

# Copy backend
echo "📦 Copying backend..."
cp -r backend/dist vps-deploy/
cp -r backend/public vps-deploy/backend-public
cp backend/package.json vps-deploy/backend-package.json
cp backend/package-lock.json vps-deploy/backend-package-lock.json

# Copy mobile
echo "📱 Copying mobile frontend..."
cp -r customer-mobile/.next vps-deploy/
cp customer-mobile/package.json vps-deploy/mobile-package.json
cp customer-mobile/package-lock.json vps-deploy/mobile-package-lock.json
[ -d customer-mobile/public ] && cp -r customer-mobile/public vps-deploy/mobile-public

# Copy configs
echo "⚙️ Copying configs..."
cp ecosystem.config.js vps-deploy/
cp nginx.conf.template vps-deploy/

# Copy .env if exists
[ -f .env ] && cp .env vps-deploy/ && echo "✅ .env copied"

# Create tar.gz
echo "📦 Creating deployment archive..."
tar -czf vps-deployment.tar.gz vps-deploy/

echo "✅ Deployment package created: vps-deployment.tar.gz"
echo "📊 Package size: $(du -h vps-deployment.tar.gz | cut -f1)"

# Cleanup
rm -rf vps-deploy

echo ""
echo "📥 Download vps-deployment.tar.gz and upload to your VPS"
