# PowerShell script to fix VPS backend
Write-Host "🚀 Quick VPS Fix Script" -ForegroundColor Green
Write-Host "========================" -ForegroundColor Green

# Configuration
$VPS_HOST = "your-vps-ip"
$VPS_USER = "root"
$VPS_PATH = "/var/www/sun/backend"

# Upload comprehensive fix script to VPS
Write-Host "📤 Uploading fix script to VPS..." -ForegroundColor Yellow
scp backend/comprehensive-fix.js ${VPS_USER}@${VPS_HOST}:${VPS_PATH}/

# Run fix on VPS
Write-Host "🔧 Running fix on VPS..." -ForegroundColor Yellow
ssh ${VPS_USER}@${VPS_HOST} @"
cd /var/www/sun/backend

echo "📝 Running comprehensive fix..."
node comprehensive-fix.js

echo "🏗️ Building..."
npm run build

echo "🔄 Restarting backend..."
pm2 restart backend || systemctl restart backend

echo "✅ Fix completed!"
"@

Write-Host "🎉 VPS fix completed!" -ForegroundColor Green
