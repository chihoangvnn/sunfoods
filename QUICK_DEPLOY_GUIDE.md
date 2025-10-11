# 🚀 Hướng Dẫn Deploy VPS - Siêu Đơn Giản

## 📋 Chuẩn Bị

### 1. VPS Ubuntu cần có:
- Ubuntu 20.04/22.04
- RAM: tối thiểu 2GB
- Domain đã trỏ về IP VPS

### 2. Trên máy local, chuẩn bị các files:

```bash
# Tạo folder deploy
mkdir vps-files
cd vps-files

# Copy các files cần thiết từ Replit:
# - backend/dist/
# - backend/public/
# - backend/package.json
# - backend/package-lock.json
# - customer-mobile/.next/
# - customer-mobile/package.json  
# - customer-mobile/package-lock.json
# - ecosystem.config.js
# - nginx.conf.template
# - .env (file environment variables)
# - VPS_DEPLOY.sh
```

## 🎯 Deploy 3 Bước

### Bước 1: Upload files lên VPS

```bash
# Từ máy local
scp -r vps-files/* user@your-vps-ip:/tmp/app-deploy/
```

### Bước 2: SSH vào VPS và chạy script

```bash
# SSH vào VPS
ssh user@your-vps-ip

# Di chuyển files
sudo mkdir -p /var/www/app
sudo cp -r /tmp/app-deploy/* /var/www/app/
cd /var/www/app

# Sửa domain trong script
nano VPS_DEPLOY.sh  
# Đổi DOMAIN="yourdomain.com" thành domain thật

# Chạy script tự động
chmod +x VPS_DEPLOY.sh
./VPS_DEPLOY.sh
```

### Bước 3: Làm theo hướng dẫn script

Script sẽ tự động:
- ✅ Cài Node.js, PM2, Nginx
- ✅ Setup PM2 chạy backend + mobile
- ✅ Config Nginx reverse proxy
- ✅ Setup SSL với Let's Encrypt
- ✅ Config firewall

## 🌐 Kết Quả

Sau khi xong:
- **Mobile**: https://yourdomain.com
- **Admin**: https://yourdomain.com/adminhoang
- **API**: https://yourdomain.com/api

## 🔧 Lệnh Hữu Ích

```bash
# Xem trạng thái app
pm2 status

# Xem logs
pm2 logs

# Restart app
pm2 restart all

# Reload Nginx
sudo systemctl reload nginx

# Check SSL
sudo certbot certificates
```

## ⚠️ Lưu Ý Quan Trọng

1. **File .env**: Nhớ upload file `.env` với:
   - DATABASE_URL
   - API keys (GEMINI_API_KEY, CLOUDINARY_*, etc)
   - Các secrets khác

2. **Domain DNS**: Đảm bảo domain đã trỏ về IP VPS trước khi chạy SSL

3. **Port Firewall**: VPS cần mở port 80, 443, 22

## 🆘 Troubleshooting

### PM2 không start:
```bash
# Check logs
pm2 logs

# Restart
cd /var/www/app
pm2 delete all
pm2 start ecosystem.config.js
```

### Nginx lỗi:
```bash
# Test config
sudo nginx -t

# Reload
sudo systemctl reload nginx

# Check status
sudo systemctl status nginx
```

### SSL không work:
```bash
# Thử lại
sudo certbot --nginx -d yourdomain.com

# Check logs
sudo tail -f /var/log/letsencrypt/letsencrypt.log
```

---

**Nhanh nhất**: Chỉ cần upload files và chạy `VPS_DEPLOY.sh` - script tự động lo hết! 🎉
