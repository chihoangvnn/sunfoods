# 🔄 Git Sync Workflow - Multi Repl Setup

## 📋 Tổng Quan

Khi bạn có **4 Replit Apps** connect vào **1 GitHub repo**, Git sync giúp:
- ✅ Code trên 1 Repl → Push → Pull ở các Repl khác
- ✅ Share backend updates tự động
- ✅ Tránh conflicts khi mỗi Repl sửa folder riêng

---

## 🏗️ Kiến Trúc

```
GitHub Repo: chihoangvnn/sun-foods-multi-store
                    │
        ┌───────────┴───────────┬──────────────┬──────────────┐
        │                       │              │              │
   Backend Repl          SunFoods Repl    Tramhuong Repl  Nhangsach Repl
   (backend/)            (customer-       (customer-       (customer-
                          mobile/)         tramhuong/)      nhangsach/)
```

**Quy tắc vàng**: Mỗi Repl chỉ sửa 1 folder riêng → KHÔNG BAO GIỜ conflict!

---

## ✅ Workflow Chuẩn

### **Trước Khi Code (Bắt Buộc!)**

```bash
# PULL TRƯỚC KHI LÀM GÌ HẾT!
git pull origin main
```

**Tại sao?** Để lấy code mới nhất từ các Repls khác đã push.

### **Trong Khi Code**

**Ví dụ: Code UI cho SunFoods trong SunFoods Repl**

```bash
# 1. Đã pull rồi nhé!
git pull origin main  # ✅ Lấy code mới

# 2. Code trong customer-mobile/
# (Chỉnh sửa files, thêm components, etc.)

# 3. Check changes
git status

# 4. Thấy có changes trong customer-mobile/ → OK!
# Thấy có changes ngoài customer-mobile/ → NGUY HIỂM (có thể conflict)
```

### **Sau Khi Code Xong**

```bash
# 1. Add changes (chỉ add folder của mình)
git add customer-mobile/

# 2. Commit với message rõ ràng
git commit -m "Update SunFoods: Add new hero section with slider"

# 3. Push lên GitHub
git push origin main
```

### **Ở Các Repls Khác (Sync)**

**Trong Tramhuong Repl**:
```bash
# Pull để nhận code mới từ SunFoods (và backend nếu có)
git pull origin main

# Giờ có code mới! Tiếp tục code customer-tramhuong/
```

**Trong Backend Repl**:
```bash
# Pull để nhận updates (nếu có ai sửa backend)
git pull origin main

# Tiếp tục code backend/
```

---

## 🎯 Ví Dụ Thực Tế

### Scenario 1: Update Backend API

**Backend Repl**:
```bash
# Pull trước
git pull origin main

# Sửa backend/src/routes/products.ts
# (Thêm API endpoint mới)

# Commit & push
git add backend/
git commit -m "Backend: Add GET /api/products/featured endpoint"
git push origin main
```

**SunFoods Repl** (cần API mới):
```bash
# Pull để nhận backend code mới
git pull origin main

# Giờ có API mới rồi!
# Update customer-mobile/ để call API mới

git add customer-mobile/
git commit -m "SunFoods: Integrate featured products API"
git push origin main
```

**Tramhuong & Nhangsach Repls**:
```bash
# Pull để nhận cả backend + SunFoods updates
git pull origin main

# Có thể dùng API mới hoặc ignore
```

### Scenario 2: Mỗi Repl Code UI Riêng

**Morning - SunFoods Repl**:
```bash
git pull origin main
# Code SunFoods UI...
git add customer-mobile/
git commit -m "SunFoods: New product card design"
git push origin main
```

**Afternoon - Tramhuong Repl**:
```bash
git pull origin main  # ← Nhận SunFoods UI update
# Code Tramhuong UI...
git add customer-tramhuong/
git commit -m "Tramhuong: Luxury theme updates"
git push origin main
```

**Evening - Nhangsach Repl**:
```bash
git pull origin main  # ← Nhận cả SunFoods + Tramhuong updates
# Code Nhangsach UI...
git add customer-nhangsach/
git commit -m "Nhangsach: Clean design refresh"
git push origin main
```

**Night - Backend Repl**:
```bash
git pull origin main  # ← Nhận tất cả frontend updates
# Thấy có updates nhưng không ảnh hưởng backend → OK
```

---

## ⚠️ Tránh Conflicts

### ✅ **An Toàn** (Highly Recommended)

```
Backend Repl     → Chỉ sửa backend/
SunFoods Repl    → Chỉ sửa customer-mobile/
Tramhuong Repl   → Chỉ sửa customer-tramhuong/
Nhangsach Repl   → Chỉ sửa customer-nhangsach/
```

**→ KHÔNG BAO GIỜ CONFLICT!** ✅

### ❌ **Nguy Hiểm** (Avoid!)

```
2 Repls cùng sửa backend/src/index.ts
→ Conflict khi push/pull
→ Phải resolve thủ công
```

### 🛡️ **Best Practices**:

1. **1 Repl = 1 Folder**
   - Backend Repl → `backend/`
   - Frontend Repl → `customer-{store}/`

2. **Pull Trước Khi Code**
   ```bash
   # Mở Repl lên là:
   git pull origin main
   ```

3. **Commit Thường Xuyên**
   ```bash
   # Xong 1 feature nhỏ là commit
   git add .
   git commit -m "Feature: ..."
   git push origin main
   ```

4. **Message Rõ Ràng**
   ```bash
   # ✅ Tốt
   git commit -m "SunFoods: Add product filtering by category"
   
   # ❌ Không rõ
   git commit -m "update"
   ```

---

## 🐛 Troubleshooting

### Problem: Push Rejected

```
error: failed to push some refs to 'https://github.com/...'
hint: Updates were rejected because the remote contains work that you do
hint: not have locally. This is usually caused by another repository pushing
```

**Nguyên nhân**: Bạn chưa pull code mới từ GitHub.

**Fix**:
```bash
# Pull trước
git pull origin main

# Giờ push lại
git push origin main
```

### Problem: Merge Conflict

```
CONFLICT (content): Merge conflict in backend/src/index.ts
Automatic merge failed; fix conflicts and then commit the result.
```

**Nguyên nhân**: 2 Repls cùng sửa 1 file.

**Fix**:
```bash
# 1. Mở file conflict (có <<<<<<< ======= >>>>>>>)
# 2. Chọn code giữ lại hoặc merge cả 2
# 3. Remove conflict markers

# 4. Add resolved file
git add backend/src/index.ts

# 5. Commit
git commit -m "Resolve conflict in backend/src/index.ts"

# 6. Push
git push origin main
```

**Prevent**: Chỉ sửa folder của Repl mình!

### Problem: Detached HEAD

```
You are in 'detached HEAD' state...
```

**Fix**:
```bash
# Quay về main branch
git checkout main

# Pull mới
git pull origin main
```

---

## 📊 Git Status Guide

### Khi `git status` hiển thị:

```bash
# ✅ An toàn (chỉ sửa folder của mình)
On branch main
Changes not staged for commit:
    modified:   customer-mobile/src/App.tsx
    modified:   customer-mobile/src/components/Hero.tsx

# ❌ Cẩn thận (sửa nhiều folders)
On branch main
Changes not staged for commit:
    modified:   backend/src/index.ts          ← Backend
    modified:   customer-mobile/src/App.tsx   ← SunFoods
    
→ Kiểm tra lại có ai đang sửa backend không!
```

### Khi `git pull` hiển thị:

```bash
# ✅ Tốt
Already up to date.

# ✅ Có updates (không conflict)
Updating a1b2c3d..e4f5g6h
Fast-forward
 customer-tramhuong/src/App.tsx | 10 +++++-----
 1 file changed, 5 insertions(+), 5 deletions(-)

# ⚠️ Có conflict
CONFLICT (content): Merge conflict in backend/src/index.ts
Automatic merge failed; fix conflicts and then commit the result.

→ Phải resolve thủ công!
```

---

## 🎓 Advanced: Branches (Optional)

Nếu muốn code feature lớn mà không ảnh hưởng main:

### Tạo Feature Branch:

```bash
# Trong SunFoods Repl
git checkout -b feature/sunfoods-new-checkout

# Code feature...
git add customer-mobile/
git commit -m "WIP: New checkout flow"
git push origin feature/sunfoods-new-checkout
```

### Merge về Main sau khi xong:

```bash
# Chuyển về main
git checkout main

# Merge feature vào
git merge feature/sunfoods-new-checkout

# Push
git push origin main

# Xóa branch (nếu muốn)
git branch -d feature/sunfoods-new-checkout
git push origin --delete feature/sunfoods-new-checkout
```

---

## ✅ Daily Workflow Checklist

**Morning (Bắt đầu ngày)**:
- [ ] Mở Repl
- [ ] `git pull origin main` (quan trọng!)
- [ ] Check có code mới từ hôm qua không
- [ ] Bắt đầu code

**During Work**:
- [ ] Chỉ sửa folder của Repl mình
- [ ] Commit thường xuyên
- [ ] Push lên GitHub sau mỗi feature nhỏ

**End of Day**:
- [ ] `git status` check changes
- [ ] `git add .` và commit
- [ ] `git push origin main`
- [ ] Verify trên GitHub (check code đã up chưa)

**Next Morning (Repl khác)**:
- [ ] `git pull origin main` (nhận code từ hôm qua)
- [ ] Continue coding...

---

## 🚀 Summary

**Golden Rules**:
1. 🔄 **Pull trước khi code** - LUÔN LUÔN!
2. 📁 **1 Repl = 1 Folder** - Không sửa folder của Repl khác
3. ✍️ **Commit thường xuyên** - Đừng để nhiều changes
4. 💬 **Message rõ ràng** - Biết ai làm gì
5. 🔁 **Push sau khi xong** - Share với các Repls khác

**Result**:
- ✅ Không conflict
- ✅ Code đồng bộ tự động
- ✅ Mỗi Repl độc lập nhưng vẫn share backend
- ✅ Happy coding!

---

**Pro Tip**: Tạo alias để nhanh hơn:

```bash
# Thêm vào ~/.bashrc hoặc ~/.zshrc
alias gp='git pull origin main'
alias gs='git status'
alias ga='git add .'
alias gc='git commit -m'
alias gps='git push origin main'

# Sử dụng:
gp          # Pull
ga          # Add all
gc "Update" # Commit
gps         # Push
```

🎉 **Happy Multi-Repl Coding!**
