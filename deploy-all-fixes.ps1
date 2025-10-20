# PowerShell script to deploy all fixes to VPS
Write-Host "🚀 DEPLOYING ALL FIXES TO VPS" -ForegroundColor Green
Write-Host "=============================" -ForegroundColor Green

# Configuration
$VPS_HOST = "your-vps-ip"
$VPS_USER = "root"
$BACKEND_PATH = "/var/www/sun/backend"
$CUSTOMER_PATH = "/var/www/sun/customer-nhangsach"

# 1. Deploy backend fixes
Write-Host "📤 Deploying backend fixes..." -ForegroundColor Yellow
scp backend/ultra-safe-fix.js ${VPS_USER}@${VPS_HOST}:${BACKEND_PATH}/

Write-Host "🔧 Running backend fix on VPS..." -ForegroundColor Yellow
ssh ${VPS_USER}@${VPS_HOST} @"
cd /var/www/sun/backend

echo "📝 Running ultra safe fix..."
node ultra-safe-fix.js

echo "🏗️ Building backend..."
npm run build

echo "🔄 Restarting backend..."
pm2 restart backend || systemctl restart backend

echo "✅ Backend fix completed!"
"@

# 2. Deploy customer-nhangsach fixes
Write-Host "📤 Deploying customer-nhangsach fixes..." -ForegroundColor Yellow
scp customer-nhangsach/ultra-safe-fix.js ${VPS_USER}@${VPS_HOST}:${CUSTOMER_PATH}/

Write-Host "🔧 Running customer-nhangsach fix on VPS..." -ForegroundColor Yellow
ssh ${VPS_USER}@${VPS_HOST} @"
cd /var/www/sun/customer-nhangsach

echo "📝 Running ultra safe fix..."
node ultra-safe-fix.js

echo "🏗️ Building customer-nhangsach..."
npm run build

echo "🔄 Restarting customer-nhangsach..."
pm2 restart customer-nhangsach || systemctl restart customer-nhangsach

echo "✅ Customer-nhangsach fix completed!"
"@

Write-Host "🎉 ALL DEPLOYMENTS COMPLETED!" -ForegroundColor Green
Write-Host "=============================" -ForegroundColor Green
Write-Host "✅ Backend: Fixed and deployed" -ForegroundColor Green
Write-Host "✅ Customer-nhangsach: Fixed and deployed" -ForegroundColor Green
Write-Host "✅ All services restarted" -ForegroundColor Green


