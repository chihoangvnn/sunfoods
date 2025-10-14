# API Workflows Documentation
## Hướng dẫn sử dụng API cho n8n Workflow Automation

> **Tài liệu này cung cấp chi tiết request/response examples cho tất cả API endpoints để tích hợp với n8n workflows.**

## Mục lục
- [Authentication](#authentication)
- [Products](#products)
- [Orders & POS](#orders--pos)
- [Customers](#customers)
- [Flash Sales](#flash-sales)
- [Pre-orders](#pre-orders)
- [Wishlist](#wishlist)
- [Notifications](#notifications)
- [Shipping & Delivery](#shipping--delivery)
- [Vouchers & Discounts](#vouchers--discounts)

---

## Authentication

### Session-Based Customer Login
Tất cả customer-facing endpoints yêu cầu session authentication với cookie credentials.

#### POST /api/session/login
**Description:** Customer login - creates session and returns customer data

**Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Request Body:**
```json
{
  "email": "test@sunfoods.vn",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "customer": {
    "id": "cust_123",
    "email": "test@sunfoods.vn",
    "name": "Nguyễn Văn Test",
    "phone": "0912345678",
    "avatar": "https://ui-avatars.com/api/?name=Nguyen+Van+Test",
    "membershipTier": "gold",
    "points": 2500,
    "joinDate": "2025-01-15T08:00:00.000Z",
    "status": "active",
    "address": "123 Lê Lợi, Q1, TPHCM",
    "address2": null
  }
}
```

**Error Responses:**
```json
// 400 - Missing credentials
{
  "error": "Email và mật khẩu là bắt buộc",
  "code": "MISSING_CREDENTIALS"
}

// 401 - Invalid credentials
{
  "error": "Email hoặc mật khẩu không đúng",
  "code": "INVALID_CREDENTIALS"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3001/api/session/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@sunfoods.vn",
    "password": "password123"
  }' \
  -c cookies.txt
```

**n8n HTTP Request Node Config:**
```json
{
  "method": "POST",
  "url": "={{$env.API_URL}}/api/session/login",
  "authentication": "none",
  "sendHeaders": true,
  "headerParameters": {
    "parameters": [
      {
        "name": "Content-Type",
        "value": "application/json"
      }
    ]
  },
  "sendBody": true,
  "bodyParameters": {
    "parameters": [
      {
        "name": "email",
        "value": "={{$json.email}}"
      },
      {
        "name": "password",
        "value": "={{$json.password}}"
      }
    ]
  },
  "options": {
    "response": {
      "response": {
        "fullResponse": true,
        "neverError": false
      }
    }
  }
}
```

**⚠️ IMPORTANT - Cookie Extraction:**
After login, you MUST extract the session cookie from the response headers:
```javascript
// In n8n Function node after login
const setCookieHeader = $input.item.json.headers['set-cookie'];
if (setCookieHeader && setCookieHeader.length > 0) {
  const cookie = setCookieHeader[0].split(';')[0];
  return { cookie };
} else {
  throw new Error('No session cookie received from login');
}
```

---

#### GET /api/session/status
**Description:** Check session status and get current customer data

**Headers:**
```json
{
  "Cookie": "connect.sid=s%3A..."
}
```

**Response (200 OK - Authenticated):**
```json
{
  "authenticated": true,
  "customer": {
    "id": "cust_123",
    "email": "test@sunfoods.vn",
    "name": "Nguyễn Văn Test",
    "phone": "0912345678",
    "avatar": "https://ui-avatars.com/api/?name=Nguyen+Van+Test",
    "membershipTier": "gold",
    "points": 2500,
    "joinDate": "2025-01-15T08:00:00.000Z",
    "status": "active",
    "address": "123 Lê Lợi, Q1, TPHCM",
    "address2": null
  }
}
```

**Response (200 OK - Not Authenticated):**
```json
{
  "authenticated": false,
  "customer": null
}
```

**cURL Example:**
```bash
curl -X GET http://localhost:3001/api/session/status \
  -b cookies.txt
```

---

#### POST /api/session/logout
**Description:** Destroy customer session

**Headers:**
```json
{
  "Cookie": "connect.sid=s%3A..."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Đăng xuất thành công"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3001/api/session/logout \
  -b cookies.txt
```

---

## Products

### GET /api/products
**Description:** List all products with search, filter, sort (VIP-tier filtered)

**Authentication:** Requires session (POS auth)

**Query Parameters:**
- `limit` (optional, default: 50): Number of products to return
- `offset` (optional, default: 0): Pagination offset
- `categoryId` (optional): Filter by category ID
- `search` (optional): Search term for product name
- `sortBy` (optional, default: 'newest'): Sort field (newest, price, name)
- `sortOrder` (optional, default: 'desc'): Sort order (asc, desc)

**Request:**
```
GET /api/products?limit=10&categoryId=cat_123&search=trầm&sortBy=price&sortOrder=asc
```

**Headers:**
```json
{
  "Cookie": "connect.sid=s%3A..."
}
```

**Response (200 OK):**
```json
[
  {
    "id": "prod_abc123",
    "name": "Trầm Hương Khánh Hòa AAA",
    "slug": "tram-huong-khanh-hoa-aaa",
    "price": "5500000",
    "originalPrice": "7000000",
    "image": "https://res.cloudinary.com/...",
    "description": "Trầm hương cao cấp từ Khánh Hòa",
    "categoryId": "cat_123",
    "stock": 25,
    "unit": "cây",
    "status": "active",
    "requiredVipTier": null,
    "barcode": "8934567890123",
    "createdAt": "2025-01-15T08:00:00.000Z"
  }
]
```

**cURL Example:**
```bash
curl -X GET "http://localhost:3001/api/products?limit=10&search=tr%E1%BA%A7m" \
  -H "Cookie: connect.sid=s%3A..." \
  -H "Content-Type: application/json"
```

**n8n HTTP Request Node Config:**
```json
{
  "method": "GET",
  "url": "={{$env.API_URL}}/api/products",
  "authentication": "genericCredentialType",
  "genericAuthType": "httpHeaderAuth",
  "sendQuery": true,
  "queryParameters": {
    "parameters": [
      {
        "name": "limit",
        "value": "={{$json.limit || 50}}"
      },
      {
        "name": "offset",
        "value": "={{$json.offset || 0}}"
      },
      {
        "name": "search",
        "value": "={{$json.search}}"
      },
      {
        "name": "categoryId",
        "value": "={{$json.categoryId}}"
      }
    ]
  }
}
```

---

### GET /api/products/admin/all
**Description:** Admin-only endpoint - get ALL products without VIP filtering

**Authentication:** Requires admin session

**Query Parameters:**
- `limit` (optional, default: 1000): Number of products
- `offset` (optional, default: 0): Pagination offset
- `categoryId` (optional): Filter by category
- `search` (optional): Search term
- `sortBy` (optional): Sort field
- `sortOrder` (optional): Sort order

**Request:**
```
GET /api/products/admin/all?limit=100
```

**Response (200 OK):**
```json
{
  "success": true,
  "products": [
    {
      "id": "prod_123",
      "name": "Sản phẩm VIP",
      "slug": "san-pham-vip",
      "price": "15000000",
      "requiredVipTier": "platinum",
      "status": "active"
    }
  ]
}
```

---

### GET /api/products/slug/:slug
**Description:** Get product by slug (public-facing product page)

**Authentication:** Optional (session-based for VIP access control)

**Path Parameters:**
- `slug`: Product slug (e.g., "tram-huong-khanh-hoa-aaa")

**Request:**
```
GET /api/products/slug/tram-huong-khanh-hoa-aaa
```

**Response (200 OK):**
```json
{
  "id": "prod_abc123",
  "name": "Trầm Hương Khánh Hòa AAA",
  "slug": "tram-huong-khanh-hoa-aaa",
  "price": "5500000",
  "originalPrice": "7000000",
  "image": "https://res.cloudinary.com/...",
  "description": "Trầm hương cao cấp từ Khánh Hòa, hương thơm nồng nàn, lâu bay.",
  "categoryId": "cat_123",
  "stock": 25,
  "unit": "cây",
  "status": "active",
  "requiredVipTier": null,
  "barcode": "8934567890123",
  "createdAt": "2025-01-15T08:00:00.000Z"
}
```

**Error Response (403 - VIP Access Required):**
```json
{
  "error": "Access forbidden",
  "message": "This product is exclusive to VIP members",
  "requiredTier": "platinum",
  "code": "VIP_ACCESS_REQUIRED"
}
```

**Error Response (404 - Not Found):**
```json
{
  "error": "Product not found"
}
```

**cURL Example:**
```bash
curl -X GET http://localhost:3001/api/products/slug/tram-huong-khanh-hoa-aaa
```

---

### GET /api/products/by-barcode
**Description:** Get product by barcode (optimized for POS barcode scanning)

**Authentication:** Requires POS auth

**Query Parameters:**
- `barcode` (required): Product barcode

**Request:**
```
GET /api/products/by-barcode?barcode=8934567890123
```

**Response (200 OK):**
```json
{
  "id": "prod_abc123",
  "name": "Trầm Hương Khánh Hòa AAA",
  "barcode": "8934567890123",
  "price": "5500000",
  "stock": 25,
  "unit": "cây",
  "image": "https://res.cloudinary.com/..."
}
```

**Error Response (404):**
```json
{
  "error": "Product not found with barcode: 8934567890123"
}
```

---

## Flash Sales

### GET /api/flash-sales
**Description:** Get all flash sales (Admin only)

**Authentication:** Requires admin session

**Query Parameters:**
- `limit` (optional, default: 50): Number of items
- `offset` (optional, default: 0): Pagination offset

**Request:**
```
GET /api/flash-sales?limit=10&offset=0
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "flash_001",
      "productId": "prod_123",
      "slug": "giam-gia-soc-tram-huong",
      "title": "Giảm Giá Sốc Trầm Hương AAA",
      "originalPrice": "7000000",
      "salePrice": "4900000",
      "discountPercent": 30,
      "startTime": "2025-10-15T00:00:00.000Z",
      "endTime": "2025-10-20T23:59:59.000Z",
      "bannerImage": "https://res.cloudinary.com/flash-sale-banner.jpg",
      "description": "Flash sale đặc biệt - tiết kiệm 30%",
      "unit": "kg",
      "isActive": true,
      "createdAt": "2025-10-14T10:00:00.000Z"
    }
  ]
}
```

---

### POST /api/flash-sales
**Description:** Create new flash sale (Admin only)

**Authentication:** Requires admin session

**Request Body:**
```json
{
  "productId": "prod_123",
  "slug": "giam-gia-soc-tram-huong",
  "title": "Giảm Giá Sốc Trầm Hương AAA",
  "originalPrice": 7000000,
  "salePrice": 4900000,
  "discountPercent": 30,
  "startTime": "2025-10-15T00:00:00.000Z",
  "endTime": "2025-10-20T23:59:59.000Z",
  "bannerImage": "https://res.cloudinary.com/flash-sale-banner.jpg",
  "description": "Flash sale đặc biệt - tiết kiệm 30%",
  "unit": "kg",
  "isActive": true
}
```

**⚠️ CRITICAL - Type Requirements:**
- `originalPrice`, `salePrice`: MUST be numbers (not strings)
- `discountPercent`: MUST be integer number (0-100)
- `isActive`: MUST be boolean (true/false)

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "flash_001",
    "productId": "prod_123",
    "slug": "giam-gia-soc-tram-huong",
    "title": "Giảm Giá Sốc Trầm Hương AAA",
    "originalPrice": "7000000",
    "salePrice": "4900000",
    "discountPercent": 30,
    "startTime": "2025-10-15T00:00:00.000Z",
    "endTime": "2025-10-20T23:59:59.000Z",
    "isActive": true
  }
}
```

**Error Response (400 - Validation Error):**
```json
{
  "error": "Validation error",
  "details": [
    {
      "code": "invalid_type",
      "expected": "number",
      "received": "string",
      "path": ["salePrice"]
    }
  ]
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3001/api/flash-sales \
  -H "Content-Type: application/json" \
  -H "Cookie: connect.sid=s%3A..." \
  -d '{
    "productId": "prod_123",
    "title": "Giảm Giá Sốc Trầm Hương AAA",
    "originalPrice": 7000000,
    "salePrice": 4900000,
    "startTime": "2025-10-15T00:00:00.000Z",
    "endTime": "2025-10-20T23:59:59.000Z",
    "unit": "kg"
  }'
```

**n8n HTTP Request Node Config:**
```json
{
  "method": "POST",
  "url": "={{$env.API_URL}}/api/flash-sales",
  "authentication": "none",
  "sendHeaders": true,
  "headerParameters": {
    "parameters": [
      {
        "name": "Content-Type",
        "value": "application/json"
      },
      {
        "name": "Cookie",
        "value": "={{$node['Extract Cookie'].json.cookie}}"
      }
    ]
  },
  "sendBody": true,
  "specifyBody": "json",
  "jsonBody": "={{ {\n  \"productId\": $json.productId,\n  \"title\": $json.title,\n  \"originalPrice\": Number($json.originalPrice),\n  \"salePrice\": Number($json.salePrice),\n  \"startTime\": $json.startTime,\n  \"endTime\": $json.endTime,\n  \"unit\": $json.unit || 'cái'\n} }}"
}
```

**⚠️ Key Points:**
1. Use `"specifyBody": "json"` and `"jsonBody"` to send raw JSON
2. Wrap numbers with `Number()` to ensure correct types
3. Include admin session cookie in headers
4. Reference cookie from previous "Extract Cookie" node

---

### GET /api/flash-sales/public/slug/:slug
**Description:** Get public flash sale by slug (customer-facing)

**Authentication:** None required

**Path Parameters:**
- `slug`: Flash sale slug

**Request:**
```
GET /api/flash-sales/public/slug/giam-gia-soc-tram-huong
```

**Response (200 OK):**
```json
{
  "id": "flash_001",
  "productId": "prod_123",
  "slug": "giam-gia-soc-tram-huong",
  "title": "Giảm Giá Sốc Trầm Hương AAA",
  "originalPrice": "7000000",
  "salePrice": "4900000",
  "discountPercent": 30,
  "startTime": "2025-10-15T00:00:00.000Z",
  "endTime": "2025-10-20T23:59:59.000Z",
  "bannerImage": "https://res.cloudinary.com/flash-sale-banner.jpg",
  "description": "Flash sale đặc biệt",
  "unit": "kg",
  "isActive": true,
  "product": {
    "id": "prod_123",
    "name": "Trầm Hương Khánh Hòa AAA",
    "image": "https://res.cloudinary.com/product-image.jpg",
    "stock": 25
  }
}
```

---

## Pre-orders

### GET /api/preorders
**Description:** Get all preorders (Admin only)

**Authentication:** Requires admin session

**Request:**
```
GET /api/preorders?limit=20&offset=0
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "preorder_001",
      "productId": "prod_456",
      "slug": "dat-truoc-nhan-sam-han-quoc",
      "title": "Đặt Trước Nhân Sâm Hàn Quốc Cao Cấp",
      "description": "Hàng về ngày 25/10, đặt trước nhận ưu đãi",
      "price": "2500000",
      "estimatedDate": "2025-10-25T00:00:00.000Z",
      "bannerImage": "https://res.cloudinary.com/preorder-banner.jpg",
      "unit": "hộp",
      "isActive": true,
      "createdAt": "2025-10-10T08:00:00.000Z"
    }
  ]
}
```

---

### POST /api/preorders
**Description:** Create new preorder (Admin only)

**Authentication:** Requires admin session

**Request Body:**
```json
{
  "productId": "prod_456",
  "slug": "dat-truoc-nhan-sam-han-quoc",
  "title": "Đặt Trước Nhân Sâm Hàn Quốc Cao Cấp",
  "description": "Hàng về ngày 25/10, đặt trước nhận ưu đãi",
  "price": 2500000,
  "estimatedDate": "2025-10-25T00:00:00.000Z",
  "bannerImage": "https://res.cloudinary.com/preorder-banner.jpg",
  "unit": "hộp"
}
```

**⚠️ CRITICAL - Type Requirements:**
- `price`: MUST be number (not string)
- `estimatedDate`: MUST be ISO 8601 string
- `unit`: Optional string (default: 'cái')

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "preorder_001",
    "productId": "prod_456",
    "slug": "dat-truoc-nhan-sam-han-quoc",
    "title": "Đặt Trước Nhân Sâm Hàn Quốc Cao Cấp",
    "price": "2500000",
    "estimatedDate": "2025-10-25T00:00:00.000Z",
    "unit": "hộp",
    "isActive": true
  }
}
```

---

### GET /api/preorders/public/slug/:slug
**Description:** Get public preorder by slug (customer-facing)

**Authentication:** None required

**Request:**
```
GET /api/preorders/public/slug/dat-truoc-nhan-sam-han-quoc
```

**Response (200 OK):**
```json
{
  "id": "preorder_001",
  "productId": "prod_456",
  "slug": "dat-truoc-nhan-sam-han-quoc",
  "title": "Đặt Trước Nhân Sâm Hàn Quốc Cao Cấp",
  "description": "Hàng về ngày 25/10",
  "price": "2500000",
  "estimatedDate": "2025-10-25T00:00:00.000Z",
  "bannerImage": "https://res.cloudinary.com/preorder-banner.jpg",
  "unit": "hộp",
  "isActive": true,
  "product": {
    "id": "prod_456",
    "name": "Nhân Sâm Hàn Quốc 6 năm tuổi",
    "image": "https://res.cloudinary.com/product.jpg"
  }
}
```

---

## Wishlist

### GET /api/wishlist
**Description:** Get customer's wishlist with product details

**Authentication:** Requires customer session

**Request:**
```
GET /api/wishlist
```

**Headers:**
```json
{
  "Cookie": "connect.sid=s%3A..."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "wishlist": [
    {
      "id": "wish_001",
      "productId": "prod_123",
      "addedAt": "2025-10-12T14:30:00.000Z",
      "productName": "Trầm Hương Khánh Hòa AAA",
      "productPrice": "5500000",
      "productImage": "https://res.cloudinary.com/product.jpg",
      "productSlug": "tram-huong-khanh-hoa-aaa",
      "productStock": 25,
      "productStatus": "active"
    }
  ],
  "count": 1
}
```

**Error Response (401):**
```json
{
  "error": "Unauthorized - please log in"
}
```

---

### POST /api/wishlist
**Description:** Add product to wishlist

**Authentication:** Requires customer session

**Request Body:**
```json
{
  "productId": "prod_123"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Product added to wishlist",
  "wishlistItem": {
    "id": "wish_001",
    "customerId": "cust_123",
    "productId": "prod_123",
    "addedAt": "2025-10-14T10:00:00.000Z"
  }
}
```

**Error Response (409 - Already exists):**
```json
{
  "error": "Product already in wishlist",
  "wishlistItem": {
    "id": "wish_001",
    "customerId": "cust_123",
    "productId": "prod_123"
  }
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3001/api/wishlist \
  -H "Content-Type: application/json" \
  -H "Cookie: connect.sid=s%3A..." \
  -d '{"productId": "prod_123"}'
```

---

### DELETE /api/wishlist/:productId
**Description:** Remove product from wishlist

**Authentication:** Requires customer session

**Path Parameters:**
- `productId`: Product ID to remove

**Request:**
```
DELETE /api/wishlist/prod_123
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Product removed from wishlist",
  "deletedItem": {
    "id": "wish_001",
    "customerId": "cust_123",
    "productId": "prod_123"
  }
}
```

**Error Response (404):**
```json
{
  "error": "Wishlist item not found"
}
```

---

## Notifications

### GET /api/notifications
**Description:** Get customer's notifications

**Authentication:** Requires customer session

**Request:**
```
GET /api/notifications
```

**Response (200 OK):**
```json
[
  {
    "id": "notif_001",
    "customerId": "cust_123",
    "orderId": "order_456",
    "type": "order_update",
    "title": "Đơn hàng đang được vận chuyển",
    "message": "Đơn hàng #456 của bạn đang trên đường giao. Dự kiến giao trong 2-3 ngày.",
    "data": {
      "orderId": "order_456",
      "status": "shipping",
      "trackingNumber": "VTP123456789"
    },
    "isRead": false,
    "createdAt": "2025-10-14T09:30:00.000Z"
  }
]
```

**cURL Example:**
```bash
curl -X GET http://localhost:3001/api/notifications \
  -H "Cookie: connect.sid=s%3A..."
```

---

### POST /api/notifications/read
**Description:** Mark notifications as read

**Authentication:** Requires customer session

**Request Body:**
```json
{
  "notificationIds": ["notif_001", "notif_002"]
}
```

**Response (200 OK):**
```json
{
  "success": true
}
```

**Error Response (400):**
```json
{
  "error": "Invalid notification IDs"
}
```

---

### DELETE /api/notifications/:id
**Description:** Delete a notification

**Authentication:** Requires customer session

**Path Parameters:**
- `id`: Notification ID

**Request:**
```
DELETE /api/notifications/notif_001
```

**Response (200 OK):**
```json
{
  "success": true
}
```

**Error Response (404):**
```json
{
  "error": "Notification not found or unauthorized"
}
```

---

## Common Patterns for n8n

### Pattern 1: Authenticated Workflow (CORRECT WAY)
```
1. Admin Login Node (POST /api/admin/login)
   - Set "Full Response" = true in options
   ↓
2. Extract Cookie Function Node
   - Code: Extract Set-Cookie header
   - Return { cookie: 'connect.sid=...' }
   ↓
3. Authenticated Request Node (POST /api/flash-sales)
   - Header: Cookie = {{$node['Extract Cookie'].json.cookie}}
   - Body: Use "specifyBody": "json" for proper types
```

**⚠️ CRITICAL MISTAKES TO AVOID:**
1. ❌ NOT setting `fullResponse: true` in login node → No headers available
2. ❌ Sending numeric fields as strings → Zod validation fails (400 error)
3. ❌ Using bodyParameters for complex objects → Type coercion issues
4. ✅ Use `specifyBody: "json"` + `jsonBody` for proper JSON with correct types

### Pattern 2: Error Handling
```javascript
// In n8n Function node
if ($json.code === 'AUTH_REQUIRED') {
  // Retry login
} else if ($json.code === 'VIP_ACCESS_REQUIRED') {
  // Handle VIP restriction
}
```

### Pattern 3: Pagination Loop
```javascript
// In n8n Function node
const limit = 50;
let offset = 0;
const allProducts = [];

while (true) {
  const response = await fetch(`/api/products?limit=${limit}&offset=${offset}`);
  const products = await response.json();
  
  if (products.length === 0) break;
  
  allProducts.push(...products);
  offset += limit;
}

return allProducts;
```

---

## Environment Variables for n8n

Thiết lập các biến môi trường sau trong n8n:

```
API_URL=http://localhost:3001
ADMIN_EMAIL=admin@sunfoods.vn
ADMIN_PASSWORD=your-secure-password
```

---

## Rate Limits

- GET endpoints: 100 requests/minute
- POST/PUT/DELETE endpoints: 50 requests/minute
- Login endpoint: 10 requests/minute

---

## Troubleshooting Guide

### Issue 1: 401 Unauthorized on Authenticated Endpoints
**Symptoms:** All POST/PUT/DELETE requests return 401 after login
**Cause:** Session cookie not properly extracted or sent
**Solution:**
```javascript
// ✅ CORRECT: Extract cookie in Function node after login
const setCookieHeader = $input.item.json.headers['set-cookie'];
if (!setCookieHeader || setCookieHeader.length === 0) {
  throw new Error('No session cookie received');
}
const cookie = setCookieHeader[0].split(';')[0];
return { cookie };

// ✅ CORRECT: Send cookie in subsequent requests
// In HTTP Request node headers:
{
  "name": "Cookie",
  "value": "={{$node['Extract Cookie'].json.cookie}}"
}
```

### Issue 2: 400 Validation Error on Flash Sale/Preorder Creation
**Symptoms:** `Validation error` with details about expected types
**Cause:** Sending numbers as strings (e.g., `"7000000"` instead of `7000000`)
**Solution:**
```javascript
// ❌ WRONG: Using bodyParameters (coerces to strings)
{
  "bodyParameters": {
    "originalPrice": "={{$json.originalPrice}}"  // Becomes string!
  }
}

// ✅ CORRECT: Using jsonBody with Number() coercion
{
  "specifyBody": "json",
  "jsonBody": "={{ {\n  originalPrice: Number($json.originalPrice),\n  salePrice: Number($json.salePrice)\n} }}"
}
```

### Issue 3: Missing fullResponse in Login Node
**Symptoms:** Cannot access headers['set-cookie'] in Extract Cookie node
**Cause:** Login node not configured to return full HTTP response
**Solution:**
```json
// In Login HTTP Request node options:
{
  "options": {
    "response": {
      "response": {
        "fullResponse": true,
        "neverError": false
      }
    }
  }
}
```

### Issue 4: CORS Errors from Frontend
**Symptoms:** Blocked by CORS policy
**Cause:** Missing credentials in fetch requests
**Solution:**
```javascript
// Always include credentials for session-based auth
fetch(`${API_URL}/api/products`, {
  credentials: 'include',  // Required for cookies
  headers: {
    'Content-Type': 'application/json'
  }
});
```

### Issue 5: VIP Access Denied (403)
**Symptoms:** `Access forbidden`, `VIP_ACCESS_REQUIRED` error
**Cause:** Product has `requiredVipTier` and customer doesn't have that tier
**Solution:**
- Use `/api/products/admin/all` endpoint for admin (bypasses VIP filter)
- Or ensure customer has proper VIP tier before accessing product

---

## Support & Contact

- Documentation: `/docs/API_QUICK_REFERENCE.md`
- Example Workflows: `/docs/N8N_WORKFLOW_EXAMPLES.json`
- Technical Support: dev@sunfoods.vn
