# 📤 Upload Files to VPS - Quick Guide

## 🎯 Cách Nhanh Nhất (3 Bước)

### **Bước 1: Download Files từ Replit**

**Option A: Download toàn bộ project**
1. Click vào 3 chấm ⋮ ở góc trên cùng Replit
2. Chọn "Download as zip"
3. File `project.zip` sẽ được download

**Option B: Download qua terminal**
```bash
# Tạo package (chỉ files cần thiết)
tar -czf deploy-package.tar.gz \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='dist' \
  --exclude='.next' \
  --exclude='build' \
  backend/ \
  customer-mobile/ \
  customer-tramhuong/ \
  customer-nhangsach/ \
  shared/ \
  ecosystem.config.js \
  nginx-multisite.conf \
  setup-on-vps.sh \
  package.json

# Download file này về máy
```

### **Bước 2: Upload lên VPS**

**Option A: SCP (từ máy local)**
```bash
# Upload toàn bộ folder
scp -r /path/to/project root@YOUR_VPS_IP:/var/www/ecommerce

# Hoặc upload package
scp deploy-package.tar.gz root@YOUR_VPS_IP:~/
```

**Option B: SFTP GUI (WinSCP/FileZilla)**
1. Mở WinSCP hoặc FileZilla
2. Connect to VPS:
   - Host: YOUR_VPS_IP
   - Username: root
   - Password: YOUR_PASSWORD
   - Port: 22
3. Upload folder/file vào `/var/www/ecommerce`

**Option C: Git Clone (nếu có repo)**
```bash
# SSH vào VPS
ssh root@YOUR_VPS_IP

# Clone project
git clone https://github.com/youruser/yourrepo.git /var/www/ecommerce
cd /var/www/ecommerce
```

### **Bước 3: Chạy Setup Script trên VPS**

```bash
# SSH vào VPS
ssh root@YOUR_VPS_IP

# Nếu upload tar.gz
cd ~
tar -xzf deploy-package.tar.gz
cd project-folder

# Hoặc cd vào folder đã upload
cd /var/www/ecommerce

# Chạy setup script
chmod +x setup-on-vps.sh
bash setup-on-vps.sh
```

Script sẽ tự động:
- ✅ Cài đặt Node.js, Nginx, PM2, Certbot
- ✅ Build tất cả storefronts
- ✅ Setup Nginx config
- ✅ Cấu hình firewall
- ✅ Start PM2 services
- ✅ Setup SSL (nếu bạn chọn)

---

## 📋 Chi Tiết Từng Option

### **Option 1: SCP Upload (Command Line)**

```bash
# 1. Tạo package trên local (sau khi download từ Replit)
cd /path/to/downloaded/project
tar -czf deploy-package.tar.gz \
  --exclude='node_modules' \
  --exclude='.git' \
  backend customer-mobile customer-tramhuong customer-nhangsach \
  shared ecosystem.config.js nginx-multisite.conf setup-on-vps.sh

# 2. Upload lên VPS
scp deploy-package.tar.gz root@YOUR_VPS_IP:~/

# 3. SSH vào VPS và extract
ssh root@YOUR_VPS_IP
mkdir -p /var/www/ecommerce
tar -xzf ~/deploy-package.tar.gz -C /var/www/ecommerce
cd /var/www/ecommerce

# 4. Run setup
chmod +x setup-on-vps.sh
bash setup-on-vps.sh
```

### **Option 2: SFTP GUI (WinSCP - Windows)**

**Download WinSCP:** https://winscp.net/eng/download.php

**Steps:**
1. Mở WinSCP
2. Click "New Site"
3. Điền thông tin:
   ```
   File protocol: SFTP
   Host name: YOUR_VPS_IP
   Port number: 22
   User name: root
   Password: YOUR_PASSWORD
   ```
4. Click "Login"
5. Drag & drop project folder từ local vào `/var/www/ecommerce` trên VPS
6. Mở terminal trong WinSCP: Ctrl+T
7. Run:
   ```bash
   cd /var/www/ecommerce
   chmod +x setup-on-vps.sh
   bash setup-on-vps.sh
   ```

### **Option 3: FileZilla (Cross-platform)**

**Download FileZilla:** https://filezilla-project.org/download.php?type=client

**Steps:**
1. Mở FileZilla
2. Click "File" → "Site Manager" → "New Site"
3. Điền thông tin:
   ```
   Protocol: SFTP
   Host: YOUR_VPS_IP
   Port: 22
   Logon Type: Normal
   User: root
   Password: YOUR_PASSWORD
   ```
4. Click "Connect"
5. Navigate remote site to `/var/www/ecommerce`
6. Drag files từ local (left) sang VPS (right)
7. SSH vào VPS và run setup:
   ```bash
   ssh root@YOUR_VPS_IP
   cd /var/www/ecommerce
   chmod +x setup-on-vps.sh
   bash setup-on-vps.sh
   ```

### **Option 4: Git Push + Pull (Nếu có GitHub repo)**

```bash
# 1. Push code lên GitHub (từ Replit hoặc local)
git add .
git commit -m "Deploy ready"
git push origin main

# 2. SSH vào VPS
ssh root@YOUR_VPS_IP

# 3. Clone hoặc pull
git clone https://github.com/youruser/repo.git /var/www/ecommerce
# Hoặc nếu đã clone: cd /var/www/ecommerce && git pull

# 4. Run setup
cd /var/www/ecommerce
chmod +x setup-on-vps.sh
bash setup-on-vps.sh
```

---

## ⚙️ Sau Khi Chạy Setup Script

### **1. Tạo .env File**

```bash
# SSH vào VPS
ssh root@YOUR_VPS_IP

# Tạo backend .env
nano /var/www/ecommerce/backend/.env
```

**Nội dung .env:**
```env
# Database
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# Security
ENCRYPTION_KEY=your-32-character-encryption-key
SESSION_SECRET=your-session-secret-key

# Cloudinary (optional)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Facebook (optional)
FACEBOOK_APP_ID=your-app-id
FACEBOOK_APP_SECRET=your-app-secret

# Other secrets as needed
```

**Save:** Ctrl+X → Y → Enter

### **2. Restart Services**

```bash
pm2 restart all
```

### **3. Setup DNS (nếu có domains)**

Point A records về VPS IP:
```
sunfoods.vn → YOUR_VPS_IP
tramhuonghoangngan.com → YOUR_VPS_IP
nhangsach.net → YOUR_VPS_IP
```

### **4. Setup SSL (sau khi DNS ready)**

```bash
# Run certbot
sudo certbot --nginx -d sunfoods.vn -d www.sunfoods.vn
sudo certbot --nginx -d tramhuonghoangngan.com -d www.tramhuonghoangngan.com
sudo certbot --nginx -d nhangsach.net -d www.nhangsach.net

# Reload nginx
sudo systemctl reload nginx
```

---

## ✅ Verification

```bash
# Check services
pm2 status

# View logs
pm2 logs

# Test endpoints
curl http://localhost:5000/api/health
curl http://localhost:3001
curl http://localhost:3002
curl http://localhost:3003

# Check Nginx
sudo nginx -t
sudo systemctl status nginx
```

---

## 🔧 Troubleshooting

### Build failed?
```bash
cd /var/www/ecommerce
rm -rf node_modules */node_modules
npm install
cd customer-mobile && npm install && npm run build && cd ..
cd customer-tramhuong && npm install && npm run build && cd ..
cd customer-nhangsach && npm install && npm run build && cd ..
pm2 restart all
```

### PM2 not starting?
```bash
pm2 logs backend-api --lines 50
pm2 logs sunfoods-storefront --lines 50
```

### Nginx error?
```bash
sudo nginx -t
sudo tail -f /var/log/nginx/error.log
```

---

## 📊 Files Bạn Cần Upload

**Essential Files:**
```
✅ backend/
✅ customer-mobile/
✅ customer-tramhuong/
✅ customer-nhangsach/
✅ shared/
✅ ecosystem.config.js
✅ nginx-multisite.conf
✅ setup-on-vps.sh
✅ package.json
```

**KHÔNG upload (exclude):**
```
❌ node_modules/
❌ .git/
❌ dist/
❌ .next/
❌ build/
❌ .cache/
```

---

## 🎯 Quick Commands Summary

```bash
# Download từ Replit → Upload → Setup

# 1. Upload (chọn 1 cách)
scp -r project/ root@VPS:/var/www/ecommerce
# hoặc dùng WinSCP/FileZilla

# 2. SSH vào VPS
ssh root@VPS_IP

# 3. Run setup
cd /var/www/ecommerce
chmod +x setup-on-vps.sh
bash setup-on-vps.sh

# 4. Setup .env
nano backend/.env

# 5. Done!
pm2 status
```

**Xong! Bạn có 3 stores chạy trên VPS rồi** 🎉
