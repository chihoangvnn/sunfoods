#!/bin/bash
# Quick Deploy - Build & Deploy in One Command
# Uses VPS_PASSWORD from Replit Secrets

echo "🏗️  Building customer-mobile..."
cd customer-mobile
npm run build
cd ..

echo ""
echo "🚀 Deploying to VPS..."
node deploy-and-install.js
