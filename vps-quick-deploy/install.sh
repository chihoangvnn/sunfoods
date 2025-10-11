#!/bin/bash
set -e

echo "🚀 Installing Sun E-commerce on VPS..."

# Create logs folder
mkdir -p logs

# Install backend dependencies (ALL - including dev deps for TypeScript build)
echo "▶ Installing backend dependencies..."
cd backend
npm install --loglevel=error
echo "▶ Building backend (compiling TypeScript)..."
npm run build
cd ..

# Install mobile dependencies
echo "▶ Installing mobile dependencies..."
cd customer-mobile
npm install --production --loglevel=error
cd ..

# Setup PM2
echo "▶ Setting up PM2..."
pm2 delete all 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save

echo ""
echo "✅ Installation complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Update .env file with your database credentials"
echo "   2. Check status: pm2 status"
echo "   3. View logs: pm2 logs"
echo ""
