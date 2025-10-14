# API Documentation for n8n Workflow Automation

## 📚 Tài liệu đã hoàn thành

Bạn hiện có 3 tài liệu chi tiết để tích hợp API backend với n8n workflows:

### 1. API_WORKFLOWS.md
**Tài liệu chính** - Request/response examples chi tiết cho từng endpoint:
- ✅ Authentication (Session login/logout)
- ✅ Products (List, search, get by slug/barcode)
- ✅ Flash Sales (Create, update, public access)
- ✅ Pre-orders (Create, manage, arrival dates)
- ✅ Wishlist (Add, remove, list items)
- ✅ Notifications (Get, mark as read, delete)
- ✅ cURL command examples
- ✅ n8n HTTP Request node configurations
- ✅ Troubleshooting guide (5 common issues + solutions)

### 2. API_QUICK_REFERENCE.md
**Bảng tra cứu nhanh** - Tất cả endpoints trong một bảng:
- Method | Path | Auth | Description
- 70+ endpoints được liệt kê
- Nhanh chóng tìm endpoint bạn cần

### 3. N8N_WORKFLOW_EXAMPLES.json
**6 workflows mẫu** - Import trực tiếp vào n8n:
1. **Auto Create Flash Sale from Product** - Tự động tạo flash sale khi có sản phẩm mới
2. **Sync Product Inventory** - Đồng bộ inventory hàng ngày (6 AM)
3. **Order Status Update Notification** - Gửi thông báo khi đơn hàng thay đổi status
4. **Low Stock Alert** - Cảnh báo khi sản phẩm sắp hết hàng (mỗi giờ)
5. **Wishlist to Flash Sale** - Tạo flash sale cho sản phẩm được yêu thích nhất
6. **Preorder Auto-Activate** - Tự động kích hoạt preorder khi hàng về

## 🚀 Cách sử dụng

### Bước 1: Import workflows vào n8n
```bash
# Trong n8n:
Workflows → Import from File → Chọn docs/N8N_WORKFLOW_EXAMPLES.json
```

### Bước 2: Thiết lập Environment Variables
Trong n8n Settings → Variables, thêm:
```
API_URL=http://localhost:3001
ADMIN_EMAIL=admin@sunfoods.vn
ADMIN_PASSWORD=your-secure-password
EXTERNAL_WAREHOUSE_API=https://warehouse.example.com/api
```

### Bước 3: Activate workflows
Bật từng workflow cần thiết trong n8n dashboard

## ⚠️ Điểm quan trọng

### Authentication Pattern (BẮT BUỘC)
Tất cả workflows authenticated phải tuân theo pattern này:

```
1. Admin Login Node
   └─ fullResponse: true ✅
   
2. Extract Cookie Function Node
   └─ Lấy Set-Cookie header ✅
   
3. Authenticated Requests
   └─ Header: Cookie = {{$node['Extract Cookie'].json.cookie}} ✅
```

### Type Handling (BẮT BUỘC)
```javascript
// ✅ ĐÚNG: Sử dụng specifyBody: "json" + jsonBody
{
  "specifyBody": "json",
  "jsonBody": "={{ {
    originalPrice: Number($json.originalPrice),
    salePrice: Number($json.salePrice),
    discountPercent: 30
  } }}"
}

// ❌ SAI: Sử dụng bodyParameters (convert thành string)
{
  "bodyParameters": {
    "originalPrice": "={{$json.originalPrice}}"  // Sẽ thành string!
  }
}
```

## 📋 Checklist khi tạo workflow mới

- [ ] Admin login node có `fullResponse: true`
- [ ] Có Extract Cookie function node sau login
- [ ] Tất cả authenticated requests có Cookie header
- [ ] Sử dụng `specifyBody: "json"` + `jsonBody` cho POST/PUT
- [ ] Numeric fields được wrap với `Number()`
- [ ] Test workflow trong n8n trước khi production

## 🐛 Troubleshooting

### 401 Unauthorized
- Kiểm tra login node có `fullResponse: true`
- Kiểm tra Extract Cookie node hoạt động đúng
- Kiểm tra Cookie header được gửi trong requests

### 400 Validation Error  
- Kiểm tra numeric fields được wrap với `Number()`
- Sử dụng `specifyBody: "json"` thay vì `bodyParameters`
- Xem chi tiết error trong response body

### 403 VIP Access Denied
- Sản phẩm yêu cầu VIP tier
- Sử dụng `/api/products/admin/all` để bypass VIP filter (admin only)

## 📊 API Endpoints phổ biến

### Authentication
```bash
POST /api/session/login
POST /api/admin/login
GET /api/session/status
```

### Products
```bash
GET /api/products              # List products (VIP filtered)
GET /api/products/admin/all    # Admin only (no VIP filter)
GET /api/products/slug/:slug   # Get by slug
GET /api/products/by-barcode   # POS barcode lookup
```

### Flash Sales
```bash
GET /api/flash-sales                    # Admin list
POST /api/flash-sales                   # Create
GET /api/flash-sales/public/slug/:slug  # Public view
```

### Preorders
```bash
GET /api/preorders                    # Admin list
POST /api/preorders                   # Create
GET /api/preorders/public/slug/:slug  # Public view
```

## 💡 Tips & Best Practices

1. **Always use fullResponse for login** - Không có cookie = không auth được
2. **Number() cho tất cả numeric fields** - Tránh validation errors
3. **Test từng workflow riêng lẻ** - Dễ debug hơn
4. **Monitor error logs** - n8n executions panel
5. **Use schedule wisely** - Đừng chạy quá thường xuyên (rate limits)

## 📞 Support

- Chi tiết troubleshooting: `API_WORKFLOWS.md` (cuối tài liệu)
- Quick reference: `API_QUICK_REFERENCE.md`
- Example workflows: `N8N_WORKFLOW_EXAMPLES.json`

---

**Lưu ý:** Tất cả workflows đã được test và validate JSON. Bạn có thể import trực tiếp vào n8n và sử dụng ngay sau khi config environment variables.
