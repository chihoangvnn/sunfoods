#!/bin/bash
# =============================================================================
# Build and Create VPS Deployment Package
# =============================================================================

set -e

echo "🚀 Building VPS Deployment Package..."

# Clean previous builds
echo "▶ Cleaning previous builds..."
rm -r -f vps-deployment vps-deployment.tar.gz

# Create deployment structure
echo "▶ Creating deployment structure..."
mkdir -p vps-deployment/{backend,customer-mobile,logs}

# Copy backend files
echo "▶ Copying backend..."
cp -r backend/dist vps-deployment/backend/
cp -r backend/public vps-deployment/backend/
cp backend/package.json vps-deployment/backend/
mkdir -p vps-deployment/backend/shared
cp -r backend/shared/* vps-deployment/backend/shared/ 2>/dev/null || true

# Copy customer-mobile files
echo "▶ Copying customer-mobile..."
cp -r customer-mobile/.next vps-deployment/customer-mobile/
cp -r customer-mobile/public vps-deployment/customer-mobile/ 2>/dev/null || true
cp customer-mobile/package.json vps-deployment/customer-mobile/

# Copy config files
echo "▶ Copying configurations..."
cp ecosystem.config.js vps-deployment/ecosystem.config.js
cp nginx.conf vps-deployment/nginx.conf
cp .env.production.example vps-deployment/.env.example
cp DEPLOY_TO_VPS_INSTRUCTIONS.md vps-deployment/README.md

# Create tarball
echo "▶ Creating package..."
tar -c -f vps-deployment.tar vps-deployment/
gzip vps-deployment.tar

# Get size
SIZE=$(ls -lh vps-deployment.tar.gz | awk '{print $5}')

echo ""
echo "=========================================="
echo "✅ Deployment Package Created!"
echo "=========================================="
echo ""
echo "📦 File: vps-deployment.tar.gz"
echo "📊 Size: $SIZE"
echo ""
echo "📥 Next Steps:"
echo "1. Download 'vps-deployment.tar.gz' từ Replit"
echo "2. Upload lên VPS"
echo "3. Làm theo hướng dẫn trong README.md"
echo ""
