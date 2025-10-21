# PowerShell script to deploy ultra safe fix to VPS
Write-Host "🚀 Deploying ULTRA SAFE fix to VPS..." -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

# Configuration
$VPS_HOST = "your-vps-ip"
$VPS_USER = "root"
$VPS_PATH = "/var/www/sun/backend"

# Upload the ultra safe fix script
Write-Host "📤 Uploading ultra safe fix script..." -ForegroundColor Yellow
scp backend/ultra-safe-fix.js ${VPS_USER}@${VPS_HOST}:${VPS_PATH}/

# Run the fix on VPS
Write-Host "🔧 Running ultra safe fix on VPS..." -ForegroundColor Yellow
ssh ${VPS_USER}@${VPS_HOST} @"
cd /var/www/sun/backend

echo "📝 Running ultra safe fix..."
node ultra-safe-fix.js

echo "🏗️ Building..."
npm run build

echo "🔄 Restarting backend..."
pm2 restart backend || systemctl restart backend

echo "✅ Ultra safe fix completed!"
"@

Write-Host "🎉 VPS deployment completed!" -ForegroundColor Green



