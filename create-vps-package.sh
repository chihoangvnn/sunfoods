#!/bin/bash
set -e

echo "📦 Creating VPS deployment package..."

# Clean and create deployment folder
rm -rf vps-quick-deploy
mkdir -p vps-quick-deploy/{backend,customer-mobile}

# Backend files
echo "▶ Copying backend..."
cp -r backend/dist vps-quick-deploy/backend/
cp -r backend/public vps-quick-deploy/backend/
cp -r backend/shared vps-quick-deploy/backend/
cp backend/package*.json vps-quick-deploy/backend/

# Customer-mobile files
echo "▶ Copying customer-mobile..."
cp -r customer-mobile/.next vps-quick-deploy/customer-mobile/
cp -r customer-mobile/public vps-quick-deploy/customer-mobile/ 2>/dev/null || true
cp customer-mobile/package*.json vps-quick-deploy/customer-mobile/

# Create PM2 ecosystem config
echo "▶ Creating PM2 config..."
cat > vps-quick-deploy/ecosystem.config.js << 'PM2'
module.exports = {
  apps: [
    {
      name: 'backend',
      script: 'dist/index.js',
      cwd: '/var/www/sun/backend',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: '../logs/backend-error.log',
      out_file: '../logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    },
    {
      name: 'mobile',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3001',
      cwd: '/var/www/sun/customer-mobile',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production'
      },
      error_file: '../logs/mobile-error.log',
      out_file: '../logs/mobile-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    }
  ]
};
PM2

# Create install script
echo "▶ Creating install script..."
cat > vps-quick-deploy/install.sh << 'INSTALL'
#!/bin/bash
set -e

echo "🚀 Installing Sun E-commerce on VPS..."

# Create logs folder
mkdir -p logs

# Install backend dependencies
echo "▶ Installing backend dependencies..."
cd backend
npm ci --production --loglevel=error
cd ..

# Install mobile dependencies
echo "▶ Installing mobile dependencies..."
cd customer-mobile
npm ci --production --loglevel=error
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
INSTALL

chmod +x vps-quick-deploy/install.sh

# Create .env template
echo "▶ Creating .env template..."
cat > vps-quick-deploy/.env.example << 'ENV'
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/ecommerce_db

# Session Secret
SESSION_SECRET=your-secret-key-change-this

# API Keys (if needed)
GEMINI_API_KEY=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
ENV

# Create README
echo "▶ Creating README..."
cat > vps-quick-deploy/README.md << 'README'
# Sun E-commerce VPS Deployment Package

## 📥 Installation Steps

### 1. Upload to VPS
```bash
scp vps-quick-deploy.tar.gz root@your-vps-ip:/tmp/
```

### 2. Extract on VPS
```bash
ssh root@your-vps-ip
cd /var/www/sun
tar -xzf /tmp/vps-quick-deploy.tar.gz --strip-components=1
```

### 3. Configure Environment
```bash
cp .env.example .env
nano .env  # Edit with your credentials
```

### 4. Install & Start
```bash
bash install.sh
```

## ✅ Verify Installation

```bash
pm2 status
pm2 logs
curl http://localhost:3000
curl http://localhost:3001
```

## 🔄 Update App

To update with new code:
1. Upload new package
2. Extract to /var/www/sun
3. Run: `pm2 restart all`

## 📞 Troubleshooting

**Backend not starting:**
```bash
pm2 logs backend --lines 50
```

**Mobile not starting:**
```bash
pm2 logs mobile --lines 50
```

**Restart services:**
```bash
pm2 restart all
```
README

# Create tarball
echo "▶ Creating tarball..."
tar -czf vps-quick-deploy.tar.gz vps-quick-deploy/

# Show results
echo ""
echo "✅ Package created successfully!"
echo ""
ls -lh vps-quick-deploy.tar.gz
echo ""
echo "📤 Upload to VPS:"
echo "   scp vps-quick-deploy.tar.gz root@sunfoods.vn:/tmp/"
echo ""
echo "📥 On VPS run:"
echo "   cd /var/www/sun"
echo "   tar -xzf /tmp/vps-quick-deploy.tar.gz --strip-components=1"
echo "   bash install.sh"
echo ""
