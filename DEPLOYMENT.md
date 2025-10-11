# Hướng Dẫn Triển Khai / Deployment Guide

Tài liệu này hướng dẫn chi tiết cách triển khai ứng dụng Multi-Storefront E-commerce lên VPS Ubuntu với 3 tên miền:
- **sunfoods.vn** - Cửa hàng thực phẩm
- **tramhuonghoangngan.com** - Cửa hàng trầm hương
- **nhangsach.net** - Cửa hàng nhang sạch

---

## 📋 1. Prerequisites / Yêu Cầu Hệ Thống

### Server Requirements
- **OS**: Ubuntu 22.04 LTS (khuyến nghị)
- **RAM**: Tối thiểu 2GB (khuyến nghị 4GB+)
- **Storage**: Tối thiểu 20GB
- **CPU**: 2 cores trở lên

### Software Requirements
- **Node.js**: v20.x hoặc mới hơn
- **npm**: v9.x hoặc mới hơn
- **PostgreSQL**: v14 hoặc mới hơn
- **Nginx**: v1.18 hoặc mới hơn
- **PM2**: Latest version
- **Git**: Latest version

### Domain & SSL
- 3 tên miền đã trỏ về IP của server:
  - sunfoods.vn (và www.sunfoods.vn)
  - tramhuonghoangngan.com (và www.tramhuonghoangngan.com)
  - nhangsach.net (và www.nhangsach.net)
- Chứng chỉ SSL (sẽ cài đặt bằng Let's Encrypt)

### External Services (Tùy chọn)
- Cloudinary account (cho upload ảnh)
- Facebook App (cho social login)
- Google Gemini API key (cho AI features)
- SendGrid/Twilio (cho email/SMS)

---

## 🚀 2. Initial Server Setup / Thiết Lập Server Ban Đầu

### 2.1 Update System Packages

```bash
# Cập nhật danh sách packages
sudo apt update && sudo apt upgrade -y

# Cài đặt các công cụ cần thiết
sudo apt install -y curl wget git build-essential
```

### 2.2 Install Node.js 20.x

```bash
# Thêm NodeSource repository cho Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Cài đặt Node.js và npm
sudo apt install -y nodejs

# Kiểm tra phiên bản
node --version  # Should show v20.x.x
npm --version   # Should show v9.x.x or higher
```

### 2.3 Install PostgreSQL 14+

```bash
# Cài đặt PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Khởi động PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Kiểm tra trạng thái
sudo systemctl status postgresql
```

### 2.4 Install Nginx

```bash
# Cài đặt Nginx
sudo apt install -y nginx

# Khởi động Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Kiểm tra trạng thái
sudo systemctl status nginx
```

### 2.5 Install PM2 Globally

```bash
# Cài đặt PM2 globally
sudo npm install -g pm2

# Kiểm tra phiên bản
pm2 --version
```

### 2.6 Configure PostgreSQL Database

```bash
# Chuyển sang user postgres
sudo -u postgres psql

# Trong PostgreSQL shell:
CREATE DATABASE ecommerce_db;
CREATE USER ecommerce_user WITH ENCRYPTED PASSWORD 'your_secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE ecommerce_db TO ecommerce_user;
ALTER DATABASE ecommerce_db OWNER TO ecommerce_user;

# Thoát PostgreSQL shell
\q
```

**Lưu ý bảo mật**: Thay `your_secure_password_here` bằng mật khẩu mạnh và lưu lại để cấu hình sau.

---

## 🔐 3. SSL Certificate Setup / Thiết Lập SSL

### 3.1 Install Certbot

```bash
# Cài đặt Certbot cho Nginx
sudo apt install -y certbot python3-certbot-nginx
```

### 3.2 Obtain SSL Certificates

**Quan trọng**: Đảm bảo các domain đã trỏ về IP của server trước khi chạy lệnh này.

```bash
# SSL cho sunfoods.vn
sudo certbot certonly --nginx -d sunfoods.vn -d www.sunfoods.vn

# SSL cho tramhuonghoangngan.com
sudo certbot certonly --nginx -d tramhuonghoangngan.com -d www.tramhuonghoangngan.com

# SSL cho nhangsach.net
sudo certbot certonly --nginx -d nhangsach.net -d www.nhangsach.net
```

Certbot sẽ lưu certificates tại:
- `/etc/letsencrypt/live/sunfoods.vn/`
- `/etc/letsencrypt/live/tramhuonghoangngan.com/`
- `/etc/letsencrypt/live/nhangsach.net/`

### 3.3 Configure Auto-Renewal

```bash
# Test renewal process
sudo certbot renew --dry-run

# Setup auto-renewal (Certbot tự động tạo cron job)
# Kiểm tra cron job
sudo systemctl status certbot.timer
```

SSL certificates sẽ tự động gia hạn khi sắp hết hạn.

---

## 📦 4. Application Deployment Steps / Triển Khai Ứng Dụng

### 4.1 Create Application Directory

```bash
# Tạo thư mục cho application
sudo mkdir -p /var/www/ecommerce
sudo chown -R $USER:$USER /var/www/ecommerce
cd /var/www/ecommerce
```

### 4.2 Clone Repository

```bash
# Clone repository (thay YOUR_REPO_URL bằng URL thực tế)
git clone YOUR_REPO_URL .

# Hoặc nếu đã có source code, upload lên server qua SCP/SFTP
```

### 4.3 Configure Environment Variables

```bash
# Copy file mẫu
cp .env.production.example .env.production

# Chỉnh sửa file .env.production
nano .env.production
```

**Cấu hình các biến môi trường quan trọng**:

```bash
# Database - Sử dụng thông tin đã tạo ở bước 2.6
DATABASE_URL=postgresql://ecommerce_user:your_secure_password_here@localhost:5432/ecommerce_db

# Backend API
NODE_ENV=production
PORT=5000

# Security - Tạo key bảo mật
ENCRYPTION_KEY=$(openssl rand -hex 32)
SESSION_SECRET=$(openssl rand -hex 32)

# External Services (điền thông tin của bạn)
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

GEMINI_API_KEY=your-gemini-api-key
ORS_API_KEY=your-openrouteservice-api-key

FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret

# Vietnamese Bank Info
SHB_ACCOUNT_NAME=your-bank-account-name
SHB_BANK_ACCOUNT=your-bank-account-number

# Store Domains
SUNFOODS_DOMAIN=https://sunfoods.vn
TRAMHUONG_DOMAIN=https://tramhuonghoangngan.com
NHANGSACH_DOMAIN=https://nhangsach.net
```

### 4.4 Install Dependencies

**IMPORTANT - Backend Build Requirement**: The backend is written in TypeScript and must be compiled to JavaScript before running in production. The TypeScript compiler (`tsc`) is a devDependency, so we must install ALL dependencies (including dev) before building.

**Correct Installation Order:**
1. Install ALL backend dependencies (including devDependencies for build tools)
2. Build the backend (compile TypeScript → JavaScript)
3. Optionally prune devDependencies after build (not recommended as they're needed for updates)

```bash
# Backend dependencies - Install ALL (including dev dependencies for TypeScript)
cd /var/www/ecommerce/backend
npm install

# Customer Mobile (sunfoods.vn) dependencies
cd /var/www/ecommerce/customer-mobile
npm install --production

# Customer Tramhuong dependencies
cd /var/www/ecommerce/customer-tramhuong
npm install --production

# Customer Nhangsach dependencies
cd /var/www/ecommerce/customer-nhangsach
npm install --production

# Quay về root
cd /var/www/ecommerce
```

**Why not `--production` for backend?**
- The backend build process requires TypeScript compiler (`tsc`) which is in devDependencies
- Using `npm install --production` removes devDependencies, causing build to fail with "tsc: command not found"
- Install all dependencies first, build the code, then optionally clean up
- Keeping devDependencies is recommended for easier updates and rebuilds

### 4.5 Build Applications

**IMPORTANT**: The backend TypeScript code must be compiled to JavaScript before running in production. PM2 will run the compiled code from the `dist/` folder.

```bash
# Build backend (compile TypeScript to JavaScript)
cd /var/www/ecommerce/backend
npm run build

# Build sunfoods storefront
cd /var/www/ecommerce/customer-mobile
npm run build

# Build tramhuong storefront
cd /var/www/ecommerce/customer-tramhuong
npm run build

# Build nhangsach storefront
cd /var/www/ecommerce/customer-nhangsach
npm run build

# Quay về root
cd /var/www/ecommerce
```

**Note**: The backend build step compiles TypeScript files from `backend/src/` to JavaScript in `backend/dist/`. The PM2 configuration is set to run `npm start` which executes `node dist/index.js`.

### 4.6 Database Migration/Setup

```bash
# Chạy database migrations (nếu có)
cd /var/www/ecommerce/backend
npm run db:push

# Hoặc nếu cần force push
npm run db:push -- --force
```

---

## 🌐 5. Nginx Configuration / Cấu Hình Nginx

### 5.1 Copy Nginx Configuration

```bash
# Copy nginx.conf vào sites-available
sudo cp /var/www/ecommerce/nginx.conf /etc/nginx/sites-available/ecommerce

# Tạo symbolic link vào sites-enabled
sudo ln -s /etc/nginx/sites-available/ecommerce /etc/nginx/sites-enabled/

# Xóa default site (nếu cần)
sudo rm /etc/nginx/sites-enabled/default
```

### 5.2 Test Nginx Configuration

```bash
# Test cấu hình nginx
sudo nginx -t

# Nếu test thành công, reload nginx
sudo systemctl reload nginx
```

### 5.3 Verify Nginx Status

```bash
# Kiểm tra trạng thái nginx
sudo systemctl status nginx

# Xem logs nếu có lỗi
sudo tail -f /var/log/nginx/error.log
```

---

## ⚙️ 6. PM2 Process Management / Quản Lý Process với PM2

### 6.1 Start Applications with PM2

```bash
# Di chuyển tới thư mục root
cd /var/www/ecommerce

# Start tất cả processes từ ecosystem.config.js
pm2 start ecosystem.config.js

# Hoặc start từng process riêng lẻ
pm2 start ecosystem.config.js --only backend-api
pm2 start ecosystem.config.js --only sunfoods-storefront
pm2 start ecosystem.config.js --only tramhuong-storefront
pm2 start ecosystem.config.js --only nhangsach-storefront
```

### 6.2 Save PM2 Process List

```bash
# Lưu danh sách process hiện tại
pm2 save

# PM2 sẽ lưu vào ~/.pm2/dump.pm2
```

### 6.3 Configure PM2 Startup Script

```bash
# Tạo startup script để PM2 tự khởi động khi server reboot
pm2 startup

# Chạy lệnh mà PM2 suggest (thường là):
# sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp /home/$USER

# Sau đó save lại
pm2 save
```

### 6.4 Monitor PM2 Processes

```bash
# Xem danh sách processes
pm2 list

# Xem logs của tất cả processes
pm2 logs

# Xem logs của một process cụ thể
pm2 logs backend-api

# Monitor real-time
pm2 monit

# Xem thông tin chi tiết
pm2 show backend-api
```

---

## ✅ 7. Post-Deployment Checklist / Kiểm Tra Sau Triển Khai

### 7.1 Verify Domain Accessibility

Kiểm tra các domain trong trình duyệt:

- [ ] https://sunfoods.vn - Trang chủ SunFoods hiển thị đúng
- [ ] https://www.sunfoods.vn - Redirect hoặc hiển thị đúng
- [ ] https://tramhuonghoangngan.com - Trang chủ Trầm Hương hiển thị đúng
- [ ] https://www.tramhuonghoangngan.com - Redirect hoặc hiển thị đúng
- [ ] https://nhangsach.net - Trang chủ Nhang Sạch hiển thị đúng
- [ ] https://www.nhangsach.net - Redirect hoặc hiển thị đúng

### 7.2 Test API Endpoints

```bash
# Test backend API health
curl https://sunfoods.vn/api/health
curl https://tramhuonghoangngan.com/api/health
curl https://nhangsach.net/api/health

# Test products endpoint
curl https://sunfoods.vn/api/products
```

### 7.3 Check SSL Certificates

```bash
# Kiểm tra SSL certificate
openssl s_client -connect sunfoods.vn:443 -servername sunfoods.vn < /dev/null | grep 'Verify return code'

# Hoặc dùng online tool: https://www.ssllabs.com/ssltest/
```

Kết quả mong muốn: `Verify return code: 0 (ok)`

### 7.4 Monitor Application Logs

```bash
# PM2 logs
pm2 logs --lines 100

# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

### 7.5 Test Database Connection

```bash
# Kết nối database
psql -U ecommerce_user -d ecommerce_db -h localhost

# Kiểm tra tables
\dt

# Thoát
\q
```

### 7.6 Performance Check

```bash
# Kiểm tra resource usage
pm2 monit

# System resources
htop
free -h
df -h
```

---

## 🔧 8. Troubleshooting / Xử Lý Sự Cố

### 8.1 Common Issues and Solutions

#### Issue: Port 5000 already in use
```bash
# Tìm process đang dùng port 5000
sudo lsof -i :5000

# Kill process
sudo kill -9 <PID>

# Hoặc restart PM2
pm2 restart backend-api
```

#### Issue: Next.js build errors
```bash
# Clear cache và rebuild
cd /var/www/ecommerce/customer-mobile
rm -rf .next node_modules
npm install
npm run build
```

#### Issue: Nginx 502 Bad Gateway
```bash
# Kiểm tra backend có chạy không
pm2 list

# Kiểm tra nginx error log
sudo tail -f /var/log/nginx/error.log

# Restart backend
pm2 restart backend-api
```

#### Issue: SSL certificate errors
```bash
# Kiểm tra certificate files
sudo ls -la /etc/letsencrypt/live/sunfoods.vn/

# Renew certificate
sudo certbot renew

# Reload nginx
sudo systemctl reload nginx
```

### 8.2 Log Locations

- **PM2 Logs**: `~/.pm2/logs/`
- **Nginx Access**: `/var/log/nginx/access.log`
- **Nginx Error**: `/var/log/nginx/error.log`
- **PostgreSQL**: `/var/log/postgresql/`
- **Application Logs**: Kiểm tra trong code, thường ghi vào console (PM2 logs)

### 8.3 Service Restart Commands

```bash
# Restart PM2 processes
pm2 restart all
pm2 restart backend-api
pm2 restart sunfoods-storefront

# Restart Nginx
sudo systemctl restart nginx

# Restart PostgreSQL
sudo systemctl restart postgresql

# Reload Nginx (không downtime)
sudo systemctl reload nginx
```

### 8.4 Database Connection Issues

```bash
# Kiểm tra PostgreSQL đang chạy
sudo systemctl status postgresql

# Kiểm tra connection
psql -U ecommerce_user -d ecommerce_db -h localhost

# Kiểm tra pg_hba.conf (authentication config)
sudo nano /etc/postgresql/14/main/pg_hba.conf

# Sau khi sửa, restart PostgreSQL
sudo systemctl restart postgresql
```

### 8.5 Permission Issues

```bash
# Fix ownership của application files
sudo chown -R $USER:$USER /var/www/ecommerce

# Fix permissions
chmod -R 755 /var/www/ecommerce
```

---

## 🔄 9. Maintenance / Bảo Trì

### 9.1 Updating the Application

```bash
# Backup trước khi update
cd /var/www/ecommerce
tar -czf backup-$(date +%Y%m%d).tar.gz .

# Pull latest code
git pull origin main

# Install new dependencies and build
# Backend: Install ALL dependencies (including dev) for TypeScript compilation
cd backend && npm install && npm run build
cd ../customer-mobile && npm install --production && npm run build
cd ../customer-tramhuong && npm install --production && npm run build
cd ../customer-nhangsach && npm install --production && npm run build

# Run migrations if needed
cd ../backend && npm run db:push

# Restart applications
cd ..
pm2 restart all
```

### 9.2 Database Backups

#### Manual Backup
```bash
# Backup toàn bộ database
pg_dump -U ecommerce_user -d ecommerce_db > /var/backups/ecommerce_db_$(date +%Y%m%d_%H%M%S).sql

# Backup với compression
pg_dump -U ecommerce_user -d ecommerce_db | gzip > /var/backups/ecommerce_db_$(date +%Y%m%d_%H%M%S).sql.gz
```

#### Automated Daily Backup Script
```bash
# Tạo backup script
sudo nano /usr/local/bin/backup-db.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/database"
DATE=$(date +%Y%m%d_%H%M%S)
FILENAME="ecommerce_db_$DATE.sql.gz"

mkdir -p $BACKUP_DIR
pg_dump -U ecommerce_user -d ecommerce_db | gzip > $BACKUP_DIR/$FILENAME

# Xóa backup cũ hơn 30 ngày
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

echo "Backup completed: $FILENAME"
```

```bash
# Make executable
sudo chmod +x /usr/local/bin/backup-db.sh

# Add to crontab (chạy hàng ngày lúc 2 AM)
sudo crontab -e
# Thêm dòng:
0 2 * * * /usr/local/bin/backup-db.sh >> /var/log/backup.log 2>&1
```

#### Restore from Backup
```bash
# Restore từ backup file
gunzip < /var/backups/ecommerce_db_20250101_020000.sql.gz | psql -U ecommerce_user -d ecommerce_db
```

### 9.3 Log Rotation

Nginx và PostgreSQL tự động rotate logs. Để rotate PM2 logs:

```bash
# Install PM2 log rotate module
pm2 install pm2-logrotate

# Configure log rotation
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
pm2 set pm2-logrotate:compress true
```

### 9.4 SSL Certificate Renewal Monitoring

```bash
# Check certificate expiry
sudo certbot certificates

# Test renewal
sudo certbot renew --dry-run

# View renewal cron job
sudo systemctl list-timers | grep certbot
```

Certificate sẽ tự động gia hạn 30 ngày trước khi hết hạn.

### 9.5 Security Updates

```bash
# Update system packages regularly
sudo apt update && sudo apt upgrade -y

# Update Node.js packages
cd /var/www/ecommerce
npm audit
npm audit fix

# Check for outdated packages
npm outdated
```

### 9.6 Performance Monitoring

#### Setup monitoring với PM2 Plus (optional)
```bash
# Đăng ký tại https://pm2.io
pm2 link <secret_key> <public_key>
```

#### Basic monitoring commands
```bash
# CPU và Memory usage
pm2 monit

# Process metrics
pm2 describe backend-api

# System info
pm2 sysmonit
```

---

## 📝 10. Quick Reference Commands / Lệnh Tham Khảo Nhanh

### PM2 Commands
```bash
# Start/Stop/Restart
pm2 start ecosystem.config.js          # Start all apps
pm2 stop all                            # Stop all apps
pm2 restart all                         # Restart all apps
pm2 reload all                          # Reload all apps (0-downtime)
pm2 delete all                          # Delete all apps

# Specific app
pm2 start ecosystem.config.js --only backend-api
pm2 restart backend-api
pm2 stop sunfoods-storefront

# Monitoring
pm2 list                                # List all processes
pm2 logs                                # View all logs
pm2 logs backend-api                    # View specific app logs
pm2 logs --lines 200                    # View last 200 lines
pm2 monit                               # Real-time monitoring
pm2 show backend-api                    # Detailed app info

# Management
pm2 save                                # Save current process list
pm2 startup                             # Generate startup script
pm2 unstartup                           # Remove startup script
pm2 update                              # Update PM2
```

### Nginx Commands
```bash
# Service management
sudo systemctl start nginx              # Start Nginx
sudo systemctl stop nginx               # Stop Nginx
sudo systemctl restart nginx            # Restart Nginx
sudo systemctl reload nginx             # Reload config (no downtime)
sudo systemctl status nginx             # Check status

# Configuration
sudo nginx -t                           # Test configuration
sudo nginx -T                           # Test and dump configuration

# Logs
sudo tail -f /var/log/nginx/access.log  # Follow access log
sudo tail -f /var/log/nginx/error.log   # Follow error log
sudo less /var/log/nginx/error.log      # View error log
```

### PostgreSQL Commands
```bash
# Service management
sudo systemctl start postgresql         # Start PostgreSQL
sudo systemctl stop postgresql          # Stop PostgreSQL
sudo systemctl restart postgresql       # Restart PostgreSQL
sudo systemctl status postgresql        # Check status

# Database operations
sudo -u postgres psql                   # Connect as postgres user
psql -U ecommerce_user -d ecommerce_db  # Connect as app user

# In psql:
\l                                      # List databases
\dt                                     # List tables
\du                                     # List users
\q                                      # Quit

# Backup/Restore
pg_dump -U ecommerce_user -d ecommerce_db > backup.sql
pg_dump -U ecommerce_user -d ecommerce_db | gzip > backup.sql.gz
psql -U ecommerce_user -d ecommerce_db < backup.sql
gunzip < backup.sql.gz | psql -U ecommerce_user -d ecommerce_db
```

### SSL/Certbot Commands
```bash
# Certificate management
sudo certbot certificates               # List all certificates
sudo certbot renew                      # Renew all certificates
sudo certbot renew --dry-run            # Test renewal
sudo certbot delete --cert-name sunfoods.vn  # Delete certificate

# Renewal timer
sudo systemctl status certbot.timer     # Check renewal timer
sudo systemctl list-timers              # List all timers
```

### System Commands
```bash
# Process management
ps aux | grep node                      # Find Node.js processes
ps aux | grep nginx                     # Find Nginx processes
sudo kill -9 <PID>                      # Kill process by PID
sudo lsof -i :<PORT>                    # Find process using port

# Disk usage
df -h                                   # Disk space
du -sh /var/www/ecommerce              # Directory size
ncdu /var/www                          # Interactive disk usage

# Memory usage
free -h                                 # Memory usage
htop                                    # Interactive process viewer
top                                     # Process monitor

# Network
netstat -tulpn | grep LISTEN           # List listening ports
curl -I https://sunfoods.vn            # Test HTTP headers
ping sunfoods.vn                       # Test connectivity
```

### Git Commands (for updates)
```bash
# Update code
cd /var/www/ecommerce
git status                              # Check status
git pull origin main                    # Pull latest code
git log -5                              # View last 5 commits
git diff                                # View changes

# Stash local changes
git stash                               # Save local changes
git pull origin main                    # Pull updates
git stash pop                           # Restore local changes
```

### File Operations
```bash
# Navigation
cd /var/www/ecommerce                  # Go to app directory
cd backend                             # Go to backend
cd ../customer-mobile                  # Go to mobile app

# Viewing logs
tail -f ~/.pm2/logs/backend-api-out.log    # Follow PM2 log
tail -100 ~/.pm2/logs/backend-api-error.log # Last 100 lines
less /var/log/nginx/error.log              # View with pager

# Permissions
sudo chown -R $USER:$USER /var/www/ecommerce
chmod -R 755 /var/www/ecommerce

# Backup
tar -czf backup-$(date +%Y%m%d).tar.gz /var/www/ecommerce
```

---

## 🆘 Emergency Procedures / Quy Trình Khẩn Cấp

### Complete System Restart
```bash
# 1. Stop all applications
pm2 stop all

# 2. Restart services
sudo systemctl restart postgresql
sudo systemctl restart nginx

# 3. Start applications
pm2 start ecosystem.config.js

# 4. Verify
pm2 list
curl https://sunfoods.vn/api/health
```

### Rollback to Previous Version
```bash
# 1. Stop applications
pm2 stop all

# 2. Restore from backup
cd /var/www/ecommerce
tar -xzf backup-YYYYMMDD.tar.gz

# 3. Restore database
gunzip < /var/backups/ecommerce_db_YYYYMMDD.sql.gz | psql -U ecommerce_user -d ecommerce_db

# 4. Restart
pm2 start ecosystem.config.js
```

---

## 📞 Support / Hỗ Trợ

- **Documentation**: Xem file này và README.md
- **Logs**: Luôn kiểm tra logs khi gặp lỗi
- **Community**: Stack Overflow, GitHub Issues
- **Emergency**: Backup database và source code thường xuyên

---

## 📚 Additional Resources

- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)

---

**Lưu ý**: Tài liệu này được viết cho môi trường production. Đảm bảo đã test kỹ trên môi trường staging trước khi áp dụng lên production thực tế.

**Cập nhật lần cuối**: October 2025
