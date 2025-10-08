# 🚀 HƯỚNG DẪN DEPLOY ADMIN LÊN VPS - FIX CSS ISSUE

## ⚠️ VẤN ĐỀ HIỆN TẠI
Admin page hiển thị nhưng **không có CSS** → Các file trong `/adminhoang/assets/` không load được

## 📦 FILE DEPLOYMENT MỚI
**Download từ Replit:** `admin-deploy-VPS.tar.gz` (5.8 MB)

**Nội dung package:**
```
admin/
  ├── assets/
  │   ├── index-Er0XnHwT.js (5.5MB)
  │   └── index-WjAjsFk0.css (46KB)  ← FILE CSS QUAN TRỌNG
  ├── index.html
  └── [images...]
```

## 🔧 BƯỚC 1: DEPLOY ĐÚNG CÁCH

### Trên VPS, chạy commands:

```bash
# 1. Upload file admin-deploy-VPS.tar.gz lên VPS vào /tmp/

# 2. Backup cũ (nếu cần)
cd /var/www/sun/backend
mv public/admin public/admin.backup

# 3. Extract file mới
mkdir -p public
cd public
tar -xzf /tmp/admin-deploy-VPS.tar.gz

# 4. Verify files đã extract đúng
ls -la admin/assets/
# PHẢI CÓ 2 files: index-Er0XnHwT.js và index-WjAjsFk0.css

# 5. Restart backend
pm2 restart backend
```

## 🔍 BƯỚC 2: DEBUG NẾU VẪN LỖI

### Test 1: Kiểm tra file tồn tại
```bash
ls -lah /var/www/sun/backend/public/admin/assets/
```
**Expected:** Phải thấy 2 files (JS và CSS)

### Test 2: Test direct URL
Mở browser, vào URL:
```
http://sunfoods.vn/adminhoang/assets/index-WjAjsFk0.css
```
**Expected:** Phải download được file CSS

### Test 3: Check Nginx config
```bash
cat /etc/nginx/sites-available/sunfoods.vn | grep -A 10 adminhoang
```

**Expected Nginx config:**
```nginx
# Admin và API routes → Backend (port 3000)
location ~ ^/(adminhoang|api)/ {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

### Test 4: Check backend logs
```bash
pm2 logs backend --lines 50
```
Tìm lỗi khi request `/adminhoang/assets/*`

## ✅ FIX PHÁT HIỆN

### Nếu Test 2 FAIL (CSS không download được):

**Option A: Nginx chặn static files**
```bash
# Edit Nginx config
sudo nano /etc/nginx/sites-available/sunfoods.vn

# ĐẢM BẢO có config này:
location ~ ^/adminhoang/ {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}

# Reload Nginx
sudo nginx -t
sudo systemctl reload nginx
```

**Option B: Backend không serve static files**
```bash
# Check backend code at /var/www/sun/backend/dist/vite.js
# Dòng ~81-88 PHẢI CÓ:
app.use('/adminhoang', express.static(adminDistPath, {...}));
```

## 🎯 EXPECTED RESULT

Sau khi fix xong:
1. ✅ Vào http://sunfoods.vn/adminhoang/login → Thấy form đẹp với CSS
2. ✅ Login với: admin@example.com / admin123
3. ✅ Dashboard hiển thị với sidebar, colors, fonts đầy đủ

## 📞 NẾU VẪN LỖI

Reply kèm kết quả của:
```bash
# 1. Check files
ls -lah /var/www/sun/backend/public/admin/assets/

# 2. Test CSS URL
curl -I http://sunfoods.vn/adminhoang/assets/index-WjAjsFk0.css

# 3. Backend logs
pm2 logs backend --lines 20
```
