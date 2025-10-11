# 🚀 HƯỚNG DẪN DEPLOY LÊN VPS - HOÀN CHỈNH

## 📋 YÊU CẦU HỆ THỐNG

- **VPS**: Ubuntu 20.04+ (2GB RAM, 20GB disk tối thiểu)
- **Domain**: Đã trỏ về IP của VPS
- **SSL**: Let's Encrypt (miễn phí, tự động setup)

---

## 🎯 BƯỚC 1: CHUẨN BỊ TRÊN LOCAL

### 1.1. Build Admin Panel
```bash
cd admin-web
npm run build
```
**Kết quả**: Tạo folder `admin-web/dist/` (5-6 MB)

### 1.2. Build Customer Mobile
```bash
cd customer-mobile
npm run build
```
**Kết quả**: Tạo folder `customer-mobile/.next/` (15-20 MB)

### 1.3. Build Backend
```bash
cd backend
npm run build
```
**Kết quả**: Tạo folder `backend/dist/` (500KB)

### 1.4. Copy Admin build vào Backend
```bash
# Từ thư mục gốc project
rm -rf backend/public/admin
mkdir -p backend/public/admin
cp -r admin-web/dist/* backend/public/admin/
```

### 1.5. Tạo deployment package
```bash
# Chạy script tạo package
chmod +x CREATE_DEPLOYMENT_PACKAGE.sh
./CREATE_DEPLOYMENT_PACKAGE.sh
```

**Kết quả**: Tạo file `vps-deployment.tar.gz` (~25MB)

---

## 🖥️ BƯỚC 2: SETUP VPS

### 2.1. Kết nối SSH vào VPS
```bash
ssh root@your-vps-ip
```

### 2.2. Tạo user mới (nếu chưa có)
```bash
adduser appuser
usermod -aG sudo appuser
su - appuser
```

### 2.3. Cài đặt Node.js 20
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version  # Phải là v20.x
```

### 2.4. Cài đặt PM2
```bash
sudo npm install -g pm2
```

### 2.5. Cài đặt PostgreSQL
```bash
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Tạo database
sudo -u postgres psql
```

Trong PostgreSQL shell:
```sql
CREATE DATABASE ecommerce_db;
CREATE USER appuser WITH PASSWORD 'your_strong_password';
GRANT ALL PRIVILEGES ON DATABASE ecommerce_db TO appuser;
\q
```

### 2.6. Cài đặt Nginx
```bash
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

---

## 📦 BƯỚC 3: DEPLOY ỨNG DỤNG

### 3.1. Upload deployment package lên VPS
**Trên máy local:**
```bash
scp vps-deployment.tar.gz appuser@your-vps-ip:/tmp/
```

### 3.2. Extract package trên VPS
```bash
# Trên VPS
cd /var/www
sudo mkdir -p sun
sudo chown -R appuser:appuser sun
cd sun

# Extract
tar -xzf /tmp/vps-deployment.tar.gz
```

### 3.3. Tạo file .env
```bash
cd /var/www/sun
nano .env
```

**Copy nội dung từ `.env.production.example` và điền thông tin thực:**
```bash
DATABASE_URL=postgresql://appuser:your_password@localhost:5432/ecommerce_db
NODE_ENV=production
DOMAIN=yourdomain.com
# ... (điền các biến khác)
```

### 3.4. Cài đặt dependencies

**Backend:**
```bash
cd /var/www/sun/backend
npm ci --production
```

**SunFoods Storefront:**
```bash
cd /var/www/sun/customer-mobile
npm ci --production
```

**Tramhuong Storefront:**
```bash
cd /var/www/sun/customer-tramhuong
npm ci --production
```

**Nhangsach Storefront:**
```bash
cd /var/www/sun/customer-nhangsach
npm ci --production
```

### 3.5. Chạy database migrations
```bash
cd /var/www/sun/backend
npm run db:push
```

---

## ⚙️ BƯỚC 4: CẤU HÌNH PM2

### 4.1. Sửa file ecosystem.config.js
```bash
cd /var/www/sun
nano ecosystem.config.js
```

**Cập nhật đường dẫn nếu cần** (mặc định đã đúng `/var/www/sun`)

### 4.2. Start PM2
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

**Quan trọng:** Chạy lệnh mà PM2 outputs (bắt đầu bằng `sudo env PATH=...`)

### 4.3. Kiểm tra PM2
```bash
pm2 status
pm2 logs
```

**Expected:**
```
┌─────┬───────────────────────┬─────────┬──────┬───────┐
│ id  │ name                  │ status  │ cpu  │ mem   │
├─────┼───────────────────────┼─────────┼──────┼───────┤
│ 0   │ backend-api           │ online  │ 0%   │ 150MB │
│ 1   │ sunfoods-storefront   │ online  │ 0%   │ 180MB │
│ 2   │ tramhuong-storefront  │ online  │ 0%   │ 180MB │
│ 3   │ nhangsach-storefront  │ online  │ 0%   │ 180MB │
└─────┴───────────────────────┴─────────┴──────┴───────┘
```

---

## 🌐 BƯỚC 5: CẤU HÌNH NGINX

### 5.1. Copy Nginx config
```bash
sudo cp /var/www/sun/nginx.conf /etc/nginx/sites-available/yourdomain.com
```

### 5.2. Sửa domain trong config
```bash
sudo nano /etc/nginx/sites-available/yourdomain.com
```

**Thay thế `sunfoods.vn` bằng domain của bạn** (tìm và thay 3 chỗ)

### 5.3. Enable site
```bash
sudo ln -sf /etc/nginx/sites-available/yourdomain.com /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
```

### 5.4. Test và reload Nginx
```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🔒 BƯỚC 6: SETUP SSL (Let's Encrypt)

### 6.1. Cài đặt Certbot
```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 6.2. Tạo SSL certificate
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

**Làm theo hướng dẫn:**
1. Nhập email
2. Đồng ý Terms of Service
3. Chọn redirect HTTP → HTTPS (option 2)

### 6.3. Test auto-renewal
```bash
sudo certbot renew --dry-run
```

---

## 🔥 BƯỚC 7: CẤU HÌNH FIREWALL

```bash
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
sudo ufw status
```

---

## ✅ BƯỚC 8: KIỂM TRA DEPLOYMENT

### 8.1. Test URLs
**Mobile Storefront:**
```
https://yourdomain.com
```

**Admin Panel:**
```
https://yourdomain.com/adminhoang
```

### 8.2. Login Admin
- Email: `admin@example.com`
- Password: `admin123`

**⚠️ Đổi password ngay sau khi login!**

### 8.3. Kiểm tra logs
```bash
# PM2 logs
pm2 logs backend --lines 50
pm2 logs mobile --lines 50

# Nginx logs
sudo tail -f /var/log/nginx/yourdomain.com-access.log
sudo tail -f /var/log/nginx/yourdomain.com-error.log
```

---

## 🔧 BƯỚC 9: CẤU HÌNH PRODUCTION (Tùy chọn)

### 9.1. Tăng giới hạn file
```bash
sudo nano /etc/security/limits.conf
```

Thêm:
```
* soft nofile 65536
* hard nofile 65536
```

### 9.2. Tăng worker processes Nginx
```bash
sudo nano /etc/nginx/nginx.conf
```

Sửa:
```nginx
worker_processes auto;
worker_connections 2048;
```

### 9.3. Enable Brotli compression (nếu có)
```bash
sudo apt install -y nginx-module-brotli
```

---

## 📊 LỆNH HỮU ÍCH

### PM2 Commands
```bash
pm2 status              # Xem trạng thái
pm2 logs                # Xem logs real-time
pm2 logs backend        # Logs backend only
pm2 restart all         # Restart tất cả
pm2 restart backend     # Restart backend only
pm2 reload all          # Zero-downtime reload
pm2 monit              # Monitor CPU/memory
```

### Nginx Commands
```bash
sudo nginx -t                    # Test config
sudo systemctl reload nginx      # Reload config
sudo systemctl restart nginx     # Restart Nginx
sudo systemctl status nginx      # Check status
```

### Database Commands
```bash
sudo -u postgres psql ecommerce_db   # Connect to DB
```

### Monitoring
```bash
htop                    # System resources
df -h                   # Disk usage
free -m                 # Memory usage
```

---

## 🚨 TROUBLESHOOTING

### Issue 1: PM2 app không start
```bash
pm2 logs backend --lines 100
# Check lỗi trong logs, thường là:
# - .env file thiếu
# - Database không connect được
# - Port đã được sử dụng
```

**Fix:**
```bash
# Kiểm tra .env
cat /var/www/sun/.env

# Test database connection
psql -U appuser -d ecommerce_db -h localhost

# Kiểm tra port
sudo lsof -i :3000
sudo lsof -i :3001
```

### Issue 2: Nginx 502 Bad Gateway
```bash
sudo tail -f /var/log/nginx/error.log
```

**Fix:**
```bash
# Kiểm tra PM2 đang chạy
pm2 status

# Restart PM2
pm2 restart all

# Restart Nginx
sudo systemctl restart nginx
```

### Issue 3: Admin CSS không load
```bash
# Kiểm tra files
ls -la /var/www/sun/backend/public/admin/assets/

# Kiểm tra Nginx config
sudo nginx -t

# Test direct URL
curl -I https://yourdomain.com/adminhoang/assets/index-XXXXX.css
```

### Issue 4: SSL không renew tự động
```bash
# Test renewal
sudo certbot renew --dry-run

# Check cron job
sudo systemctl status certbot.timer
```

---

## 🔄 UPDATE ỨNG DỤNG

### Cách 1: Quick update (chỉ code thay đổi)
```bash
# 1. Build mới trên local
# 2. Upload lên VPS
scp -r admin-web/dist/* appuser@vps:/var/www/sun/backend/public/admin/
scp -r customer-mobile/.next/* appuser@vps:/var/www/sun/customer-mobile/.next/

# 3. Restart PM2
pm2 reload all
```

### Cách 2: Full deployment
```bash
# 1. Tạo package mới
./CREATE_DEPLOYMENT_PACKAGE.sh

# 2. Upload lên VPS
scp vps-deployment.tar.gz appuser@vps:/tmp/

# 3. Backup và deploy
cd /var/www/sun
mv backend backend.backup
mv customer-mobile customer-mobile.backup
tar -xzf /tmp/vps-deployment.tar.gz

# 4. Install dependencies and build
# Backend: Install ALL deps (includes dev for TypeScript build), then build
cd backend && npm install && npm run build
cd ../customer-mobile && npm ci --production
cd ../customer-tramhuong && npm ci --production
cd ../customer-nhangsach && npm ci --production

# 5. Restart
pm2 restart all
```

---

## 📞 HỖ TRỢ

**Khi gặp lỗi, cung cấp:**
1. PM2 logs: `pm2 logs --lines 50`
2. Nginx logs: `sudo tail -50 /var/log/nginx/error.log`
3. Browser console errors (F12)
4. Screenshot lỗi

---

## ✨ DONE!

**Ứng dụng của bạn đã chạy production tại:**
- 🌐 Mobile: `https://yourdomain.com`
- 🔐 Admin: `https://yourdomain.com/adminhoang`

**Monitoring:**
- PM2 Dashboard: `pm2 monit`
- Nginx Status: `sudo systemctl status nginx`
- Disk Usage: `df -h`
