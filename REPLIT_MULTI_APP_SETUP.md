# 🚀 Hướng Dẫn Setup 4 Replit Apps từ 1 GitHub Repo

## 📋 Tổng Quan

Sau khi push code lên GitHub, bạn sẽ tạo **4 Replit Apps riêng biệt**:
- **1 Backend API** (shared)
- **3 Frontend Apps** (SunFoods, Trầm Hương, Nhang Sạch)

## 🔗 GitHub Repository

```
https://github.com/chihoangvnn/sun-foods-multi-store
```

---

## 📦 Bước 1: Import Backend API Repl

### Import URL:
```
https://replit.com/github/chihoangvnn/sun-foods-multi-store
```

### Setup:
1. **Tên Repl**: `backend-api`
2. **Template**: Node.js
3. **Visibility**: Private (khuyến nghị)

### Workflow Configuration:
```bash
# Run backend only
cd backend && npm install && npm run dev
```

### Environment Variables (.env):
```bash
NODE_ENV=development
PORT=5000
DATABASE_URL=<your-neon-database-url>
ENCRYPTION_KEY=<32-character-key>
SESSION_SECRET=<your-session-secret>

# 🔐 CORS Security: Frontend Origins (REQUIRED for Replit multi-app setup)
# Add ALL frontend Repl URLs here (comma-separated, no spaces around commas)
# Example: FRONTEND_ORIGINS=https://backend-api-username.replit.dev,https://sunfoods-frontend-username.replit.app,https://tramhuong-frontend-username.replit.app,https://nhangsach-frontend-username.replit.app
FRONTEND_ORIGINS=https://sunfoods-frontend-<username>.replit.app,https://tramhuong-frontend-<username>.replit.app,https://nhangsach-frontend-<username>.replit.app

# External Services
CLOUDINARY_CLOUD_NAME=<your-cloudinary-cloud>
CLOUDINARY_API_KEY=<your-key>
CLOUDINARY_API_SECRET=<your-secret>
GEMINI_API_KEY=<your-gemini-key>
ORS_API_KEY=<your-ors-key>
```

⚠️ **QUAN TRỌNG - CORS Security**:
- Backend chỉ accept requests từ URLs trong `FRONTEND_ORIGINS`
- Development mode: Allow tất cả origins (testing)
- Production mode: Chỉ allow explicit URLs (security)
- Phải update `FRONTEND_ORIGINS` mỗi khi tạo Repl mới!

### ✅ Verify:
- Backend chạy thành công trên port 5000
- Check: `https://<your-backend-repl>.replit.dev/api/health`

**📝 Lưu Backend URL**: Bạn sẽ cần nó cho 3 frontend apps!

---

## 📦 Bước 2: Import SunFoods Frontend Repl

### Import URL:
```
https://replit.com/github/chihoangvnn/sun-foods-multi-store
```

### Setup:
1. **Tên Repl**: `sunfoods-frontend`
2. **Template**: Next.js
3. **Visibility**: Public hoặc Private

### Workflow Configuration:
```bash
# Run SunFoods frontend only
cd customer-mobile && npm install && npm run dev -- -p 3001 -H 0.0.0.0
```

### Environment Variables (.env.local):
```bash
# Backend API URL (từ Backend Repl)
NEXT_PUBLIC_API_URL=https://<your-backend-repl>.replit.dev/api

# Store Configuration
NEXT_PUBLIC_STORE_ID=sunfoods
NEXT_PUBLIC_STORE_NAME=SunFoods
```

### ✅ Verify:
- Frontend chạy thành công trên port 3001
- Products hiển thị đúng từ SunFoods store
- Không có CORS errors

---

## 📦 Bước 3: Import Trầm Hương Frontend Repl

### Import URL:
```
https://replit.com/github/chihoangvnn/sun-foods-multi-store
```

### Setup:
1. **Tên Repl**: `tramhuong-frontend`
2. **Template**: Next.js
3. **Visibility**: Public hoặc Private

### Workflow Configuration:
```bash
# Run Tramhuong frontend only
cd customer-tramhuong && npm install && npm run dev -- -p 3002 -H 0.0.0.0
```

### Environment Variables (.env.local):
```bash
# Backend API URL (từ Backend Repl)
NEXT_PUBLIC_API_URL=https://<your-backend-repl>.replit.dev/api

# Store Configuration
NEXT_PUBLIC_STORE_ID=tramhuong
NEXT_PUBLIC_STORE_NAME=Trầm Hương Hoàng Ngân
```

### ✅ Verify:
- Frontend chạy thành công trên port 3002
- Products hiển thị đúng từ Trầm Hương store
- Không có CORS errors

---

## 📦 Bước 4: Import Nhang Sạch Frontend Repl

### Import URL:
```
https://replit.com/github/chihoangvnn/sun-foods-multi-store
```

### Setup:
1. **Tên Repl**: `nhangsach-frontend`
2. **Template**: Next.js
3. **Visibility**: Public hoặc Private

### Workflow Configuration:
```bash
# Run Nhangsach frontend only
cd customer-nhangsach && npm install && npm run dev -- -p 3003 -H 0.0.0.0
```

### Environment Variables (.env.local):
```bash
# Backend API URL (từ Backend Repl)
NEXT_PUBLIC_API_URL=https://<your-backend-repl>.replit.dev/api

# Store Configuration
NEXT_PUBLIC_STORE_ID=nhangsach
NEXT_PUBLIC_STORE_NAME=Nhang Sạch
```

### ✅ Verify:
- Frontend chạy thành công trên port 3003
- Products hiển thị đúng từ Nhang Sạch store
- Không có CORS errors

---

## 🔄 Git Sync Workflow

### Khi Code trên 1 Repl:

**Ví dụ: Code UI cho SunFoods**

1. **Trong SunFoods Repl**:
```bash
# Pull code mới nhất trước khi bắt đầu
git pull origin main

# Code trong customer-mobile/...
# (Chỉnh sửa files)

# Commit và push
git add customer-mobile/
git commit -m "Update SunFoods UI: new hero section"
git push origin main
```

2. **Trong Tramhuong Repl** (để sync code mới):
```bash
# Pull để nhận code mới (bao gồm cả backend updates)
git pull origin main

# Tiếp tục code customer-tramhuong/...
```

3. **Trong Nhangsach Repl** (để sync code mới):
```bash
# Pull để nhận code mới
git pull origin main

# Tiếp tục code customer-nhangsach/...
```

### ⚠️ Tránh Conflicts:

**✅ AN TOÀN** (mỗi Repl sửa folder riêng):
- Backend Repl → Chỉ sửa `backend/`
- SunFoods Repl → Chỉ sửa `customer-mobile/`
- Tramhuong Repl → Chỉ sửa `customer-tramhuong/`
- Nhangsach Repl → Chỉ sửa `customer-nhangsach/`

**❌ CONFLICT** (nhiều Repl sửa cùng file):
- 2 Repls cùng sửa `backend/src/index.ts`
- Phải resolve conflict thủ công

### Git Workflow Best Practices:

```bash
# ❌ SAI: Code trực tiếp không pull
git add .
git commit -m "..."
git push  # ← Có thể bị reject vì outdated

# ✅ ĐÚNG: Pull trước, code, rồi push
git pull origin main  # Lấy code mới nhất
# ... code ...
git add .
git commit -m "..."
git push origin main  # ← Không bị conflict
```

---

## 🎯 Kiến Trúc Final

```
GitHub: chihoangvnn/sun-foods-multi-store
                    │
        ┌───────────┴───────────┬──────────────┐
        │                       │              │
   Backend Repl          SunFoods Repl    Tramhuong Repl
   (port 5000)           (port 3001)      (port 3002)
        │                       │              │
        └───────────────────────┴──────────────┴─────────┐
                                                          │
                                                   Nhangsach Repl
                                                   (port 3003)
```

### API Flow:
```
Frontend Repls ──(CORS enabled)──> Backend Repl ──> Database
```

---

## 📝 Checklist

### Backend Repl:
- [ ] Imported from GitHub
- [ ] .env configured với DATABASE_URL
- [ ] FRONTEND_ORIGINS set với 3 Repl URLs
- [ ] Backend chạy thành công trên port 5000
- [ ] API health check: `/api/health` returns 200

### SunFoods Repl:
- [ ] Imported from GitHub
- [ ] .env.local configured với NEXT_PUBLIC_API_URL
- [ ] Frontend chạy trên port 3001
- [ ] Products load thành công (10 SunFoods products)
- [ ] Không có CORS errors

### Tramhuong Repl:
- [ ] Imported from GitHub
- [ ] .env.local configured
- [ ] Frontend chạy trên port 3002
- [ ] Products load thành công (10 Trầm Hương products)
- [ ] Không có CORS errors

### Nhangsach Repl:
- [ ] Imported from GitHub
- [ ] .env.local configured
- [ ] Frontend chạy trên port 3003
- [ ] Products load thành công (10 Nhang Sạch products)
- [ ] Không có CORS errors

---

## 🐛 Troubleshooting

### CORS Errors:
```
Access to fetch at '<backend-url>' from origin '<frontend-url>' has been blocked by CORS
```

**Fix**:
1. Check Backend Repl `.env`: FRONTEND_ORIGINS có đúng frontend URL không?
2. Restart Backend Repl sau khi update .env
3. Verify CORS config trong `backend/src/index.ts`

### API Connection Failed:
```
Failed to fetch: net::ERR_CONNECTION_REFUSED
```

**Fix**:
1. Check Backend Repl có đang chạy không?
2. Verify NEXT_PUBLIC_API_URL trong frontend .env.local
3. Test backend health: `curl https://<backend-repl>.replit.dev/api/health`

### Git Push Rejected:
```
error: failed to push some refs
```

**Fix**:
```bash
# Pull trước rồi push lại
git pull origin main
git push origin main
```

### Products Not Loading:
```
Products array is empty
```

**Fix**:
1. Check database có 30 products đã seed chưa?
2. Verify store_id trong API call
3. Check backend logs: `pm2 logs backend` (nếu dùng PM2)

---

## 🚀 Next Steps

Sau khi setup xong 4 Repls:

1. **Test API Flow**: Mỗi frontend call được backend API
2. **Test Git Sync**: Code trên 1 Repl, push, pull ở Repls khác
3. **Customize UIs**: Thiết kế riêng từng storefront
4. **Deploy Production**: Follow DEPLOYMENT.md để deploy lên VPS

**Happy Coding!** 🎉
