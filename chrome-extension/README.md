# Cookie Manager Pro - Chrome Extension

Extension quản lý 1000+ cookie profiles cho Facebook, Instagram, Twitter, TikTok.

## 🚀 Cài Đặt

### Bước 1: Load Extension Vào Chrome
1. Mở Chrome và truy cập: `chrome://extensions/`
2. Bật **Developer mode** (góc trên bên phải)
3. Click **Load unpacked**
4. Chọn thư mục `chrome-extension`

### Bước 2: Đăng Nhập
- Password: `021088`
- Extension sẽ lưu token và auto-login lần sau

## ✨ Tính Năng

### 📸 Capture Cookies
1. Mở tab Facebook/Instagram/Twitter/TikTok
2. Click extension → Tab "Capture"
3. Nhập account name (email/username)
4. Click "Capture Cookies"
5. Cookies tự động sync lên backend

### 🔍 Load Cookies
1. Click extension → Tab "Load"
2. Tìm kiếm account (gõ tên, platform...)
3. Click vào kết quả → Cookies được load
4. Trang tự động reload

## 🔧 Cấu Hình Backend

Extension kết nối với backend tại: `http://localhost:5000/api`

Để thay đổi URL backend, edit file `api-client.js`:
```javascript
this.baseURL = 'https://your-backend-url.com/api';
```

## 🎯 Auto Group Tagging

Extension tự động tạo group tag theo format:
```
{platform}-{year}-{month}-w{week}
```

Ví dụ: `facebook-2025-10-w1`

## 🔐 Bảo Mật

- Password được lưu local trong Chrome
- Cookies được mã hóa khi gửi lên server
- Extension CHỈ hoạt động trên các domain được phép

## 📝 Permissions

- `cookies`: Đọc/ghi cookies
- `activeTab`: Xác định tab hiện tại
- `storage`: Lưu auth token
- Host permissions cho Facebook, Instagram, Twitter, TikTok

## 🐛 Debug

Để xem logs:
1. Right click extension icon → Inspect popup
2. Mở Console tab
