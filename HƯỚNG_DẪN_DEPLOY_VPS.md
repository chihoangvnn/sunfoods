# 🚀 HƯỚNG DẪN DEPLOY LÊN VPS - ĐƠN GIẢN

## 📦 CÁCH 1: Download từ Replit (KHUYẾN NGHỊ)

### Bước 1: Download từ Replit
1. Trên Replit, click vào **Tools** (góc trái)
2. Chọn **Download as ZIP**  
3. Download toàn bộ project về máy

### Bước 2: Giải nén và chuẩn bị
```bash
# Trên máy local
unzip workspace.zip
cd workspace

# Tạo deployment folder
mkdir vps-deploy
cp -r backend/dist vps-deploy/backend-dist
cp -r backend/public vps-deploy/backend-public
cp -r backend/shared vps-deploy/backend-shared
cp backend/package.json vps-deploy/backend-package.json
cp -r customer-mobile/.next vps-deploy/mobile-next
cp -r customer-mobile/public vps-deploy/mobile-public 2>/dev/null || true
cp customer-mobile/package.json vps-deploy/mobile-package.json
cp ecosystem.config.js vps-deploy/
cp nginx.conf vps-deploy/
cp .env.production.example vps-deploy/
```

### Bước 3: Upload lên VPS
```bash
# Upload folder lên VPS
scp -r vps-deploy user@your-vps-ip:/tmp/
```

---

## 📦 CÁCH 2: Deploy trực tiếp từ Replit (NHANH)

### Bước 1: Tạo SSH key để connect VPS
```bash
# Trên Replit Shell
ssh-keygen -t rsa -b 4096 -f ~/.ssh/vps_key -N ""
cat ~/.ssh/vps_key.pub
```

### Bước 2: Add public key vào VPS
```bash
# Copy output của lệnh trên, sau đó trên VPS:
echo "YOUR_PUBLIC_KEY" >> ~/.ssh/authorized_keys
```

### Bước 3: Deploy trực tiếp từ Replit
```bash
# Trên Replit Shell
export VPS_IP="your-vps-ip"
export VPS_USER="your-username"

# Tạo deployment script
cat > deploy-direct.sh << 'EOF'
#!/bin/bash
VPS_IP=$1
VPS_USER=$2
VPS_DIR="/var/www/sun"

echo "🚀 Deploying to $VPS_USER@$VPS_IP..."

# Create remote directory
ssh -i ~/.ssh/vps_key $VPS_USER@$VPS_IP "mkdir -p $VPS_DIR/{backend,customer-mobile}"

# Upload backend
echo "▶ Uploading backend..."
scp -i ~/.ssh/vps_key -r backend/dist $VPS_USER@$VPS_IP:$VPS_DIR/backend/
scp -i ~/.ssh/vps_key -r backend/public $VPS_USER@$VPS_IP:$VPS_DIR/backend/
scp -i ~/.ssh/vps_key -r backend/shared $VPS_USER@$VPS_IP:$VPS_DIR/backend/
scp -i ~/.ssh/vps_key backend/package.json $VPS_USER@$VPS_IP:$VPS_DIR/backend/

# Upload customer-mobile
echo "▶ Uploading customer-mobile..."
scp -i ~/.ssh/vps_key -r customer-mobile/.next $VPS_USER@$VPS_IP:$VPS_DIR/customer-mobile/
scp -i ~/.ssh/vps_key -r customer-mobile/public $VPS_USER@$VPS_IP:$VPS_DIR/customer-mobile/ 2>/dev/null || true
scp -i ~/.ssh/vps_key customer-mobile/package.json $VPS_USER@$VPS_IP:$VPS_DIR/customer-mobile/

# Upload configs
echo "▶ Uploading configs..."
scp -i ~/.ssh/vps_key ecosystem.config.js $VPS_USER@$VPS_IP:$VPS_DIR/ecosystem.config.js
scp -i ~/.ssh/vps_key nginx.conf $VPS_USER@$VPS_IP:$VPS_DIR/nginx.conf
scp -i ~/.ssh/vps_key .env.production.example $VPS_USER@$VPS_IP:$VPS_DIR/.env.example

echo "✅ Upload complete!"
EOF

chmod +x deploy-direct.sh
./deploy-direct.sh $VPS_IP $VPS_USER
```

---

## 🖥️ SETUP TRÊN VPS

### Bước 1: SSH vào VPS
```bash
ssh user@your-vps-ip
```

### Bước 2: Install dependencies
```bash
# Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# PM2
sudo npm install -g pm2

# Nginx
sudo apt install -y nginx

# PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# SSL Certificate tool
sudo apt install -y certbot python3-certbot-nginx
```

### Bước 3: Setup PostgreSQL
```bash
sudo -u postgres psql

# Trong psql:
CREATE DATABASE ecommerce_db;
CREATE USER appuser WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE ecommerce_db TO appuser;
\q
```

### Bước 4: Setup application
```bash
cd /var/www/sun

# Tạo .env từ template
cp .env.example .env
nano .env
# Điền thông tin database và API keys

# Install backend dependencies
cd backend
npm ci --production
cd ..

# Install mobile dependencies  
cd customer-mobile
npm ci --production
cd ..
```

### Bước 5: Chỉnh ecosystem.config.js
```bash
nano ecosystem.config.js
```

Sửa dòng `args` của backend thành:
```javascript
{
  name: 'backend',
  script: 'dist/index.js',  // Thay vì npm start
  cwd: '/var/www/sun/backend',
  // ... rest
}
```

### Bước 6: Start PM2
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
# Chạy lệnh mà PM2 output
```

### Bước 7: Setup Nginx
```bash
# Sửa domain trong config
sudo sed -i 's/sunfoods.vn/yourdomain.com/g' nginx.conf

# Copy config
sudo cp nginx.conf /etc/nginx/sites-available/yourdomain.com
sudo ln -sf /etc/nginx/sites-available/yourdomain.com /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test và reload
sudo nginx -t
sudo systemctl reload nginx
```

### Bước 8: Setup SSL
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### Bước 9: Firewall
```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

---

## ✅ KIỂM TRA

```bash
# Check PM2
pm2 status
pm2 logs

# Check Nginx
sudo systemctl status nginx

# Test URLs
curl https://yourdomain.com
curl https://yourdomain.com/adminhoang
```

**Admin login:**
- Email: `admin@example.com`
- Password: `admin123`

---

## 🔄 UPDATE APP

Khi cần update code:

### Từ Replit:
```bash
./deploy-direct.sh $VPS_IP $VPS_USER
```

### Trên VPS:
```bash
pm2 restart all
```

---

## 📞 TROUBLESHOOTING

### PM2 không start
```bash
pm2 logs backend
# Kiểm tra .env có đủ biến chưa
cat .env
```

### Nginx 502 Bad Gateway
```bash
# Check PM2 đang chạy
pm2 status

# Check ports
sudo lsof -i :3000
sudo lsof -i :3001
```

### CSS không load
```bash
# Kiểm tra files admin
ls -la /var/www/sun/backend/public/admin/assets/

# Restart
pm2 restart backend
```

---

## 📁 CẤU TRÚC THƯ MỤC VPS

```
/var/www/sun/
├── backend/
│   ├── dist/           # Backend compiled
│   ├── public/         # Admin static files
│   ├── shared/         # Shared schemas
│   └── package.json
├── customer-mobile/
│   ├── .next/          # Next.js build
│   ├── public/         # Static assets
│   └── package.json
├── ecosystem.config.js # PM2 config
├── nginx.conf          # Nginx config
└── .env               # Environment variables
```

---

## 🎯 QUICK COMMANDS

```bash
# Status
pm2 status
sudo systemctl status nginx

# Logs
pm2 logs backend --lines 50
pm2 logs mobile --lines 50
sudo tail -f /var/log/nginx/yourdomain.com-error.log

# Restart
pm2 restart all
pm2 restart backend
sudo systemctl reload nginx

# Stop
pm2 stop all
pm2 delete all
```

---

Chọn **CÁCH 1** nếu muốn download files trước.  
Chọn **CÁCH 2** nếu muốn deploy nhanh trực tiếp từ Replit! 🚀
