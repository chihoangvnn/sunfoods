# 🚀 HƯỚNG DẪN DEPLOY VPS - 3 CÁCH

## ⚡ CÁCH 1: Upload Trực Tiếp (NHANH NHẤT - 5 phút)

### Bước 1: Chạy script upload trên Replit
```bash
bash QUICK_UPLOAD_VPS.sh sunfoods.vn root
```

### Bước 2: Trên VPS cài đặt
```bash
ssh root@sunfoods.vn
cd /var/www/sun
bash install.sh
```

**XONG!** ✅

---

## 📦 CÁCH 2: Download & Upload Manual

### Bước 1: Download từ Replit
1. Click **Tools** (góc trái màn hình)
2. Chọn **Download as ZIP**
3. Đợi download xong

### Bước 2: Giải nén và upload
```bash
# Trên máy local
unzip workspace.zip
cd workspace

# Upload lên VPS
scp -r backend/dist root@sunfoods.vn:/var/www/sun/backend/
scp -r backend/public root@sunfoods.vn:/var/www/sun/backend/
scp -r backend/shared root@sunfoods.vn:/var/www/sun/backend/
scp backend/package.json root@sunfoods.vn:/var/www/sun/backend/

scp -r customer-mobile/.next root@sunfoods.vn:/var/www/sun/customer-mobile/
scp customer-mobile/package.json root@sunfoods.vn:/var/www/sun/customer-mobile/

scp vps-quick-deploy/ecosystem.config.js root@sunfoods.vn:/var/www/sun/
scp vps-quick-deploy/install.sh root@sunfoods.vn:/var/www/sun/
```

### Bước 3: Trên VPS cài đặt
```bash
ssh root@sunfoods.vn
cd /var/www/sun
bash install.sh
```

---

## 🔄 CÁCH 3: Dùng Git (CHO UPDATE SAU NÀY)

### Setup lần đầu (1 lần thôi)
```bash
# Trên VPS
ssh root@sunfoods.vn
cd /var/www/sun

# Init git
git init
git remote add origin https://github.com/chihoangvnn/sun.git
git fetch origin main
git checkout -b main --track origin/main
```

### Mỗi lần update
```bash
# Trên VPS
cd /var/www/sun
git pull origin main

# Cài dependencies và build (nếu có thay đổi)
# Backend: Install ALL deps (includes dev deps for TypeScript build)
cd backend && npm install && npm run build
cd ../customer-mobile && npm ci --production

# Restart
pm2 restart all
```

---

## 📋 FILES QUAN TRỌNG

### Backend (TypeScript + tsx runtime)
- ✅ `backend/src/` - TypeScript source code
- ✅ `backend/public/` - Admin panel UI  
- ✅ `backend/shared/` - Shared schemas
- ✅ `backend/package.json` - Dependencies (includes tsx)

### Customer Mobile (Đã build sẵn)
- ✅ `customer-mobile/.next/` - Next.js build
- ✅ `customer-mobile/package.json` - Dependencies

### Config Files
- ✅ `vps-quick-deploy/ecosystem.config.js` - PM2 config
- ✅ `vps-quick-deploy/install.sh` - Install script
- ✅ `vps-quick-deploy/.env.example` - Env template

---

## ✅ SAU KHI CÀI ĐẶT

### Kiểm tra status
```bash
pm2 status
```

### Xem logs
```bash
pm2 logs
pm2 logs backend
pm2 logs mobile
```

### Test URLs
```bash
curl http://localhost:3000
curl http://localhost:3001
```

### Truy cập admin
- URL: `https://sunfoods.vn/adminhoang`
- Email: `admin@example.com`
- Password: `admin123`

---

## 🔧 TROUBLESHOOTING

### Lỗi "backend not starting"
```bash
pm2 logs backend --lines 50
cd /var/www/sun/backend
node dist/index.js  # Test trực tiếp
```

### Lỗi "Cannot find module"
```bash
cd /var/www/sun/backend
npm ci --production --force
cd ../customer-mobile
npm ci --production --force
pm2 restart all
```

### Lỗi database
```bash
# Check .env
cat /var/www/sun/.env

# Test connection
psql $DATABASE_URL -c "SELECT 1"
```

### Reset tất cả
```bash
cd /var/www/sun
pm2 delete all
bash install.sh
```

---

## 🔄 UPDATE APP

Khi có bản update mới:

**Cách nhanh nhất:**
```bash
# Trên Replit
bash QUICK_UPLOAD_VPS.sh sunfoods.vn root

# Trên VPS  
ssh root@sunfoods.vn
cd /var/www/sun
pm2 restart all
```

**Hoặc dùng Git:**
```bash
# Trên VPS
cd /var/www/sun
git pull origin main
pm2 restart all
```

---

## 📞 HỖ TRỢ

Nếu gặp vấn đề:
1. Check logs: `pm2 logs`
2. Check status: `pm2 status`
3. Restart: `pm2 restart all`
4. Reset: `pm2 delete all && bash install.sh`

---

**KHUYẾN NGHỊ:** Dùng **CÁCH 1** để deploy lần đầu - nhanh nhất! 🚀
