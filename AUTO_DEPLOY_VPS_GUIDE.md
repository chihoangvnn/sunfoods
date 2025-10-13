# 🚀 Hướng Dẫn Auto Deploy Lên VPS

## 📋 Tổng Quan

Script `auto-deploy-vps.sh` tự động build, package và deploy toàn bộ 4 ứng dụng (backend + 3 storefronts) lên VPS chỉ với **1 lệnh duy nhất**.

## 🔑 Setup Secrets (Lần Đầu)

### Bước 1: Thêm VPS Secrets vào Replit

1. **Mở Replit Secrets**:
   - Click vào **Tools** (góc trái màn hình)
   - Chọn **Secrets**

2. **Thêm 3 secrets sau**:

| Secret Name | Value | Ví Dụ |
|------------|-------|-------|
| `VPS_IP` | IP address VPS của bạn | `203.0.113.45` |
| `VPS_USER` | Username SSH | `root` hoặc `ubuntu` |
| `VPS_PASSWORD` | Password SSH | `your-password-here` |

3. **Click Save** sau khi thêm mỗi secret

### Bước 2: Verify Secrets

```bash
# Kiểm tra secrets đã được set chưa
echo $VPS_IP
echo $VPS_USER
echo $VPS_PASSWORD  # Chỉ hiện *** nếu đã set
```

---

## 🚀 Deploy Lên VPS (1 Lệnh)

### Cách 1: Deploy Toàn Bộ (Build + Upload + Start)

```bash
./auto-deploy-vps.sh
```

Script sẽ tự động:
1. ✅ Build backend (TypeScript → JavaScript)
2. ✅ Build 3 storefronts (Next.js SSR)
3. ✅ Tạo deployment package
4. ✅ Upload lên VPS qua SSH
5. ✅ Install dependencies trên VPS
6. ✅ Start PM2 processes
7. ✅ Hiển thị status

**Thời gian**: ~5-10 phút (tùy tốc độ mạng)

---

## 📦 Cấu Trúc Deploy

### Files được upload lên VPS:

```
/var/www/sun/
├── backend/
│   ├── dist/           # Backend compiled
│   ├── public/         # Static admin files
│   ├── shared/         # Shared schemas
│   └── package.json
├── customer-mobile/    # SunFoods
│   ├── .next/          # Next.js build
│   ├── public/
│   └── package.json
├── customer-tramhuong/ # Trầm Hương
│   ├── .next/
│   ├── public/
│   └── package.json
├── customer-nhangsach/ # Nhang Sạch
│   ├── .next/
│   ├── public/
│   └── package.json
├── ecosystem.config.js # PM2 config
├── nginx.conf          # Nginx config
└── .env.example        # Environment template
```

---

## ⚙️ Sau Khi Deploy

### 1. SSH vào VPS

```bash
# Dùng sshpass (script sẽ install tự động)
sshpass -p "$VPS_PASSWORD" ssh $VPS_USER@$VPS_IP

# Hoặc dùng password manual
ssh root@your-vps-ip
```

### 2. Configure Environment Variables

```bash
cd /var/www/sun

# Tạo .env.production từ template
nano .env.production
```

**Thêm các giá trị thực vào .env.production**:

```bash
NODE_ENV=production
PORT=5000

# Database (Neon hoặc local PostgreSQL)
DATABASE_URL=postgresql://user:password@host:port/database

# Security
ENCRYPTION_KEY=your-32-character-encryption-key-here
SESSION_SECRET=your-session-secret-key-here

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Gemini AI
GEMINI_API_KEY=your-gemini-api-key

# OpenRouteService
ORS_API_KEY=your-ors-api-key
```

### 3. Restart Applications

```bash
# Restart PM2 để apply .env.production
pm2 restart all

# Check status
pm2 list
pm2 logs
```

### 4. Setup Nginx (Nếu Chưa)

```bash
# Copy nginx config
sudo cp /var/www/sun/nginx.conf /etc/nginx/sites-available/ecommerce

# Enable site
sudo ln -s /etc/nginx/sites-available/ecommerce /etc/nginx/sites-enabled/

# Remove default site (optional)
sudo rm /etc/nginx/sites-enabled/default

# Test config
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

### 5. Setup SSL Certificates

```bash
# Install certbot (nếu chưa)
sudo apt install -y certbot python3-certbot-nginx

# Setup SSL cho từng domain
sudo certbot --nginx -d sunfoods.vn -d www.sunfoods.vn
sudo certbot --nginx -d tramhuonghoangngan.com -d www.tramhuonghoangngan.com
sudo certbot --nginx -d nhangsach.net -d www.nhangsach.net

# Auto-renew setup
sudo certbot renew --dry-run
```

---

## 🔄 Update Sau Này

Khi code thay đổi, chỉ cần chạy lại:

```bash
# Trên Replit
./auto-deploy-vps.sh
```

Script sẽ tự động:
1. Build lại code mới
2. Upload files thay đổi
3. Restart PM2

**Không cần** setup lại Nginx hay SSL!

---

## 🛠️ Troubleshooting

### Lỗi: "Cannot connect to VPS"

**Nguyên nhân**: VPS_IP, VPS_PASSWORD sai hoặc SSH bị block

**Fix**:
```bash
# 1. Verify secrets
echo $VPS_IP
echo $VPS_PASSWORD

# 2. Test SSH manual
ssh $VPS_USER@$VPS_IP

# 3. Check VPS firewall
# Trên VPS:
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

### Lỗi: "sshpass: command not found"

**Nguyên nhân**: sshpass chưa được cài (hiếm khi xảy ra vì đã cài sẵn)

**Fix**:
```bash
# Script sẽ tự install via nix, nhưng nếu fail:
nix-env -iA nixpkgs.sshpass

# Hoặc check xem đã cài chưa:
which sshpass
```

### Lỗi: PM2 processes không start

**Nguyên nhân**: .env.production chưa config đúng

**Fix**:
```bash
# SSH vào VPS
ssh $VPS_USER@$VPS_IP

# Check logs
pm2 logs

# Config lại .env
cd /var/www/sun
nano .env.production

# Restart
pm2 restart all
```

### Lỗi: "Port 3001/3002/3003 already in use"

**Nguyên nhân**: Processes cũ vẫn chạy

**Fix**:
```bash
# Trên VPS
pm2 delete all
pm2 start /var/www/sun/ecosystem.config.js
```

---

## 📊 Monitoring & Management

### Check Status

```bash
# PM2 status
pm2 list

# Live monitoring
pm2 monit

# View logs
pm2 logs
pm2 logs backend-api
pm2 logs sunfoods-storefront

# Show logs với số dòng
pm2 logs --lines 100
```

### Restart Applications

```bash
# Restart tất cả
pm2 restart all

# Restart từng app
pm2 restart backend-api
pm2 restart sunfoods-storefront
pm2 restart tramhuong-storefront
pm2 restart nhangsach-storefront
```

### Stop/Start

```bash
# Stop tất cả
pm2 stop all

# Start lại
pm2 start ecosystem.config.js

# Xóa tất cả processes
pm2 delete all
```

---

## 🎯 Kết Quả Cuối Cùng

Sau khi deploy xong, bạn sẽ có:

✅ **4 PM2 Processes** đang chạy:
- `backend-api` (port 5000)
- `sunfoods-storefront` (port 3001)
- `tramhuong-storefront` (port 3002)
- `nhangsach-storefront` (port 3003)

✅ **3 Websites** hoạt động:
- https://sunfoods.vn
- https://tramhuonghoangngan.com
- https://nhangsach.net

✅ **Admin Dashboard**:
- https://sunfoods.vn/adminhoang

✅ **API Endpoints**:
- https://sunfoods.vn/api

---

## 📝 Checklist Deploy

- [ ] Đã thêm VPS_IP vào Replit Secrets
- [ ] Đã thêm VPS_PASSWORD vào Replit Secrets
- [ ] Đã thêm VPS_USER vào Replit Secrets (hoặc dùng mặc định `root`)
- [ ] Chạy `./auto-deploy-vps.sh`
- [ ] SSH vào VPS và config `.env.production`
- [ ] Restart PM2: `pm2 restart all`
- [ ] Setup Nginx reverse proxy
- [ ] Setup SSL certificates với certbot
- [ ] Verify 3 websites hoạt động
- [ ] Check PM2 logs: `pm2 logs`

---

## 🚀 Next Steps

Sau khi deploy thành công:

1. **Test các websites**:
   - Mở https://sunfoods.vn → Kiểm tra products load
   - Mở https://tramhuonghoangngan.com → Kiểm tra Trầm Hương theme
   - Mở https://nhangsach.net → Kiểm tra Nhang Sạch theme

2. **Test Admin Dashboard**:
   - Login: https://sunfoods.vn/adminhoang
   - Thêm/sửa products
   - Check orders, customers

3. **Setup Monitoring** (Optional):
   - PM2 Plus: https://pm2.io
   - Uptimerobot: https://uptimerobot.com
   - Google Analytics

4. **Backup Strategy**:
   - Database backup schedule
   - Code backup (GitHub already done)
   - Media backup (Cloudinary)

---

**Happy Deploying!** 🎉
