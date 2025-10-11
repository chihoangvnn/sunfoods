# 🔐 Hướng Dẫn SSH Tự Động Login VPS

## 🎯 Mục Tiêu
Chạy script `QUICK_UPLOAD_VPS.sh` **không cần nhập password** mỗi lần

---

## ✅ **CÁCH 1: SSH KEY (KHUYÊN DÙNG - BẢN AN TOÀN)**

### Ưu Điểm:
- ✅ An toàn 100%
- ✅ Không lưu password trong code
- ✅ Industry standard practice

### Các Bước Thực Hiện:

#### 1️⃣ Tạo SSH Key trên Replit Shell
```bash
ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa -N ""
```

Output:
```
Generating public/private rsa key pair.
Your identification has been saved in /home/runner/.ssh/id_rsa
Your public key has been saved in /home/runner/.ssh/id_rsa.pub
```

#### 2️⃣ Copy Key lên VPS
```bash
ssh-copy-id -i ~/.ssh/id_rsa.pub root@sunfoods.vn
```

Nhập password **LẦN CUỐI** khi được hỏi.

#### 3️⃣ Test SSH (không cần password!)
```bash
ssh root@sunfoods.vn
```

Nếu login được không cần password → ✅ THÀNH CÔNG!

#### 4️⃣ Chạy Upload Script
```bash
bash QUICK_UPLOAD_VPS.sh
```

**XONG!** Script sẽ upload tự động không cần password 🎉

---

## ⚠️ **CÁCH 2: DÙNG PASSWORD TỰ ĐỘNG (KHÔNG KHUYÊN DÙNG)**

### Nhược Điểm:
- ❌ Password lưu trong file (security risk)
- ❌ Cần cài sshpass
- ❌ Không nên dùng cho production

### Các Bước:

#### 1️⃣ Cài sshpass (trên máy local)
```bash
# Ubuntu/Debian
sudo apt-get install sshpass

# MacOS
brew install hudochenkov/sshpass/sshpass
```

#### 2️⃣ Sửa file `QUICK_UPLOAD_VPS_WITH_PASSWORD.sh`
```bash
# Dòng 8: Thay password thật của VPS
VPS_PASSWORD="your-password-here"  # ← SỬA ĐÂY
```

#### 3️⃣ Chạy script
```bash
bash QUICK_UPLOAD_VPS_WITH_PASSWORD.sh
```

---

## 🔒 **BẢO MẬT**

### ✅ An Toàn (SSH Key):
- Key được mã hóa
- Không lưu password
- Có thể revoke bất cứ lúc nào

### ❌ Không An Toàn (Password trong script):
- Password plain text
- Có thể bị leak nếu push lên Git
- **TUYỆT ĐỐI KHÔNG** dùng cho production

---

## 📋 **KHUYẾN NGHỊ**

### Môi Trường Development:
→ Dùng **SSH Key** (CÁCH 1)

### Môi Trường Production:
→ **BẮT BUỘC** dùng SSH Key + thêm các biện pháp:
- Disable root login
- Dùng non-root user
- Enable 2FA
- IP whitelist

---

## 🚀 **QUICK START**

**Setup một lần:**
```bash
# Tạo key
ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa -N ""

# Copy lên VPS
ssh-copy-id -i ~/.ssh/id_rsa.pub root@sunfoods.vn
```

**Sau đó mỗi lần deploy:**
```bash
bash QUICK_UPLOAD_VPS.sh
```

✅ Done! Không cần password nữa!

---

## 🔧 **TROUBLESHOOTING**

### Lỗi: Permission denied (publickey)
```bash
# Fix permissions
chmod 700 ~/.ssh
chmod 600 ~/.ssh/id_rsa
chmod 644 ~/.ssh/id_rsa.pub
```

### Lỗi: ssh-copy-id not found
```bash
# Copy manual
cat ~/.ssh/id_rsa.pub | ssh root@sunfoods.vn 'mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys'
```

### Lỗi: sshpass not found (CÁCH 2)
```bash
# Ubuntu
sudo apt-get update && sudo apt-get install sshpass
```

---

## 📞 **HỖ TRỢ**

Nếu gặp vấn đề:
1. Kiểm tra SSH service trên VPS: `systemctl status sshd`
2. Check firewall: `ufw status`
3. Xem log: `tail -f /var/log/auth.log`
