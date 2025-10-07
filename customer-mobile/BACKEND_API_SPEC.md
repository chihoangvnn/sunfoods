# Backend API Specification - Vendor Portal

This document specifies all backend APIs required for the Vendor/Supplier Management Portal features.

## Base URL
`/api/vendor`

## Authentication
All endpoints require vendor authentication via session cookies.

## Common Response Formats

### Success Response
```json
{
  "success": true,
  "data": {
    "message": "Thao tác thành công"
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dữ liệu không hợp lệ"
  }
}
```

---

## 1. Returns & Refund Management

### 1.1 Get Returns List
**GET** `/api/vendor/returns`

Query Parameters:
- `status` (optional): pending | approved | rejected | completed
- `page` (optional): number, default 1
- `limit` (optional): number, default 20

Response:
```json
{
  "success": true,
  "data": {
    "returns": [
      {
        "id": "vr-12345",
        "orderId": "ord-98765",
        "productId": "vp-001",
        "productName": "Nhang trầm hương cao cấp",
        "customerName": "Nguyễn Văn A",
        "quantity": 2,
        "reason": "Sản phẩm bị lỗi",
        "requestDate": "2025-01-05T10:30:00Z",
        "status": "pending",
        "refundAmount": 450000,
        "shippingLabel": null
      }
    ],
    "total": 45,
    "page": 1,
    "totalPages": 3
  }
}
```

**Note:** Status values: `pending`, `approved`, `rejected`, `completed`

### 1.2 Approve Return
**POST** `/api/vendor/returns/:id/approve`

Request Body:
```json
{
  "refundAmount": 450000,
  "shippingCarrier": "ghn",
  "notes": "Đã xác nhận sản phẩm lỗi, chấp nhận hoàn trả"
}
```

**Note:** Shipping carrier options: `ghn`, `ghtk`, `viettel`

Response:
```json
{
  "success": true,
  "data": {
    "returnId": "vr-12345",
    "shippingLabel": {
      "carrier": "ghn",
      "trackingNumber": "GHN123456789",
      "labelUrl": "https://api.ghn.vn/labels/GHN123456789.pdf"
    },
    "refundProcessed": true
  }
}
```

### 1.3 Reject Return
**POST** `/api/vendor/returns/:id/reject`

Request Body:
```json
{
  "reason": "Sản phẩm không có dấu hiệu lỗi, khách hàng sử dụng không đúng cách"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "returnId": "vr-12345",
    "status": "rejected"
  }
}
```

### 1.4 Get Return Analytics
**GET** `/api/vendor/returns/analytics`

Query Parameters:
- `startDate` (optional): ISO8601
- `endDate` (optional): ISO8601

Response:
```json
{
  "success": true,
  "data": {
    "totalReturns": 127,
    "returnRate": 5.2,
    "topReasons": [
      { "reason": "Sản phẩm bị lỗi", "count": 45 },
      { "reason": "Không đúng mô tả", "count": 32 },
      { "reason": "Giao nhầm hàng", "count": 18 }
    ],
    "topProducts": [
      {
        "productId": "vp-001",
        "productName": "Nhang trầm hương cao cấp",
        "returnCount": 23,
        "returnRate": 8.5
      },
      {
        "productId": "vp-042",
        "productName": "Tinh dầu sả chanh",
        "returnCount": 15,
        "returnRate": 6.2
      }
    ],
    "monthlyTrend": [
      { "month": "2024-10", "count": 38 },
      { "month": "2024-11", "count": 42 },
      { "month": "2024-12", "count": 47 }
    ]
  }
}
```

---

## 2. Smart Notifications

### 2.1 Subscribe to Push Notifications
**POST** `/api/vendor/notifications/subscribe`

Request Body:
```json
{
  "subscription": {
    "endpoint": "https://fcm.googleapis.com/fcm/send/abc123def456",
    "keys": {
      "p256dh": "BEl62iUYgUivxIkv69yViEuiBIa-Ib37J8xQmrXj3dI...",
      "auth": "8eDyX_uCN0XRhSbY5hs7Hg"
    }
  }
}
```

Response:
```json
{
  "success": true,
  "data": {
    "subscriptionId": "sub-vendor-98765"
  }
}
```

### 2.2 Unsubscribe from Push Notifications
**DELETE** `/api/vendor/notifications/unsubscribe`

Request Body:
```json
{
  "endpoint": "https://fcm.googleapis.com/fcm/send/abc123def456"
}
```

Response:
```json
{
  "success": true
}
```

### 2.3 Send Test Notification
**POST** `/api/vendor/notifications/test`

Response:
```json
{
  "success": true,
  "data": {
    "sent": true
  }
}
```

### 2.4 Get VAPID Public Key
**GET** `/api/vapid-public-key`

Response:
```json
{
  "publicKey": "BKxLT9J3qN4b5WqF2mP8xVzY3kL9..."
}
```

### 2.5 Trigger Notifications (Backend Internal)

Backend should send push notifications for these events:
- New order created
- Return request submitted
- Product stock low (< 10 units)
- Payment reminder (monthly model, 3 days before due)
- Order delivered
- Deposit balance low (< minimum threshold)

Example notification payload:
```json
{
  "title": "Đơn hàng mới!",
  "body": "Bạn có đơn hàng mới từ khách Nguyễn V.A - Giá trị: 450,000₫",
  "icon": "/icon.png",
  "data": {
    "type": "new_order",
    "orderId": "ord-98765",
    "url": "/vendor/orders"
  }
}
```

**Note:** Notification types: `new_order`, `return_request`, `low_stock`, `payment_reminder`, `order_delivered`, `low_balance`

---

## 3. Bulk Operations

### 3.1 Bulk Upload Products (Excel)
**POST** `/api/vendor/products/bulk-upload`

Request: multipart/form-data
- `file`: Excel file (.xlsx, .xls)

Expected Excel columns:
- Tên sản phẩm (required)
- Số lượng (required, > 0)
- Giá ký gửi (required, > 0)
- Chiết khấu (%) (required, 0-100)
- Ngày hết hạn (optional, YYYY-MM-DD)

Response:
```json
{
  "success": true,
  "data": {
    "imported": 45,
    "failed": 3,
    "errors": [
      {
        "row": 7,
        "field": "quantity",
        "message": "Số lượng phải lớn hơn 0"
      },
      {
        "row": 12,
        "field": "price",
        "message": "Giá không hợp lệ"
      },
      {
        "row": 23,
        "field": "productName",
        "message": "Tên sản phẩm không được để trống"
      }
    ],
    "products": [
      {
        "id": "vp-101",
        "productName": "Nhang trầm hương cao cấp",
        "quantity": 100,
        "price": 250000,
        "discountPercent": 15
      },
      {
        "id": "vp-102",
        "productName": "Tinh dầu sả chanh",
        "quantity": 50,
        "price": 180000,
        "discountPercent": 10
      }
    ]
  }
}
```

### 3.2 Bulk Update Product Prices
**PATCH** `/api/vendor/products/bulk-update-price`

Request Body:
```json
{
  "productIds": ["vp-001", "vp-002", "vp-003"],
  "updateType": "increase",
  "value": 10000
}
```

**Note:** Update type options: `set`, `increase`, `decrease`

Response:
```json
{
  "success": true,
  "data": {
    "updated": 3,
    "products": [
      {
        "id": "vp-001",
        "oldPrice": 250000,
        "newPrice": 260000
      },
      {
        "id": "vp-002",
        "oldPrice": 180000,
        "newPrice": 190000
      },
      {
        "id": "vp-003",
        "oldPrice": 320000,
        "newPrice": 330000
      }
    ]
  }
}
```

### 3.3 Bulk Update Product Status
**PATCH** `/api/vendor/products/bulk-update-status`

Request Body:
```json
{
  "productIds": ["vp-001", "vp-002", "vp-003"],
  "status": "active"
}
```

**Note:** Status options: `active`, `out_of_stock`

Response:
```json
{
  "success": true,
  "data": {
    "updated": 3
  }
}
```

### 3.4 Bulk Delete Products
**DELETE** `/api/vendor/products/bulk-delete`

Request Body:
```json
{
  "productIds": ["vp-001", "vp-002", "vp-003"]
}
```

Response:
```json
{
  "success": true,
  "data": {
    "deleted": 3
  }
}
```

---

## 4. Batch Printing & Shipping

### 4.1 Create Shipment (Generate Shipping Label)
**POST** `/api/vendor/orders/:orderId/create-shipment`

Request Body:
```json
{
  "carrier": "ghn",
  "serviceType": "express",
  "pickupAddress": {
    "name": "Cửa hàng Nhang Sạch",
    "phone": "0901234567",
    "address": "123 Đường Lê Lợi",
    "ward": "Phường Bến Thành",
    "district": "Quận 1",
    "province": "Thành phố Hồ Chí Minh"
  }
}
```

**Note:** Carrier options: `ghn`, `ghtk`, `viettel`  
**Note:** Service type options: `standard`, `express`

Response:
```json
{
  "success": true,
  "data": {
    "trackingNumber": "GHN123456789",
    "labelUrl": "https://api.ghn.vn/labels/GHN123456789.pdf",
    "estimatedDelivery": "2025-01-08T17:00:00Z",
    "shippingFee": 35000
  }
}
```

### 4.2 Bulk Create Shipments
**POST** `/api/vendor/orders/bulk-create-shipments`

Request Body:
```json
{
  "orderIds": ["ord-98765", "ord-98766", "ord-98767"],
  "carrier": "ghn",
  "serviceType": "standard"
}
```

**Note:** Carrier options: `ghn`, `ghtk`, `viettel`  
**Note:** Service type options: `standard`, `express`

Response:
```json
{
  "success": true,
  "data": {
    "created": 2,
    "failed": 1,
    "shipments": [
      {
        "orderId": "ord-98765",
        "trackingNumber": "GHN123456789",
        "labelUrl": "https://api.ghn.vn/labels/GHN123456789.pdf"
      },
      {
        "orderId": "ord-98766",
        "trackingNumber": "GHN123456790",
        "labelUrl": "https://api.ghn.vn/labels/GHN123456790.pdf"
      }
    ],
    "errors": [
      {
        "orderId": "ord-98767",
        "error": "Địa chỉ giao hàng không hợp lệ"
      }
    ]
  }
}
```

### 4.3 Get Shipping Carriers Config
**GET** `/api/vendor/shipping/carriers`

Response:
```json
{
  "success": true,
  "data": {
    "carriers": [
      {
        "id": "ghn",
        "name": "Giao Hàng Nhanh",
        "services": [
          {
            "id": "standard",
            "name": "Tiêu chuẩn",
            "estimatedDays": "3-5"
          },
          {
            "id": "express",
            "name": "Hỏa tốc",
            "estimatedDays": "1-2"
          }
        ]
      }
    ]
  }
}
```

---

## 5. Financial Management

### 5.1 Get Vendor Balance
**GET** `/api/vendor/financial/balance`

Response:
```json
{
  "success": true,
  "data": {
    "paymentModel": "deposit",
    "depositBalance": 5250000,
    "monthlyCredit": null,
    "monthlyDebt": null,
    "revenueShare": {
      "vendorPercent": 70,
      "shopPercent": 30
    }
  }
}
```

**Note:** Payment model options: `deposit`, `monthly`, `upfront`, `revenue_share`  
**Note:** `depositBalance` is for deposit model only  
**Note:** `monthlyCredit` and `monthlyDebt` are for monthly model only

### 5.2 Get Transaction History
**GET** `/api/vendor/financial/transactions`

Query Parameters:
- `type` (optional): sale | refund | deposit | withdrawal
- `startDate` (optional): ISO8601
- `endDate` (optional): ISO8601
- `page` (optional): number
- `limit` (optional): number

Response:
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "txn-10001",
        "type": "sale",
        "amount": 450000,
        "date": "2025-01-05T14:30:00Z",
        "description": "Bán hàng - Đơn hàng #ord-98765",
        "relatedOrderId": "ord-98765"
      },
      {
        "id": "txn-10002",
        "type": "refund",
        "amount": -225000,
        "date": "2025-01-04T11:20:00Z",
        "description": "Hoàn tiền - Trả hàng #vr-12345",
        "relatedOrderId": "ord-98760"
      },
      {
        "id": "txn-10003",
        "type": "deposit",
        "amount": 2000000,
        "date": "2025-01-03T09:15:00Z",
        "description": "Nạp ký quỹ",
        "relatedOrderId": null
      }
    ],
    "total": 156,
    "page": 1
  }
}
```

**Note:** Transaction types: `sale`, `refund`, `deposit`, `withdrawal`

---

## 6. Database Schema Requirements

### Tables Needed:

#### vendor_returns
- id (primary key)
- order_id (foreign key)
- product_id (foreign key)
- vendor_id (foreign key)
- customer_name
- quantity
- reason
- request_date
- status (pending, approved, rejected, completed)
- refund_amount
- shipping_carrier
- tracking_number
- notes
- created_at
- updated_at

#### vendor_push_subscriptions
- id (primary key)
- vendor_id (foreign key)
- endpoint (unique)
- p256dh_key
- auth_key
- created_at

#### vendor_products (updates)
Add columns if not existing:
- expiry_date (nullable)
- discount_percent (default 0)

#### vendor_transactions
- id (primary key)
- vendor_id (foreign key)
- type (sale, refund, deposit, withdrawal)
- amount
- description
- related_order_id (nullable, foreign key)
- created_at

#### vendor_shipments
- id (primary key)
- order_id (foreign key)
- vendor_id (foreign key)
- carrier (ghn, ghtk, viettel)
- tracking_number
- label_url
- shipping_fee
- status (pending, picked_up, in_transit, delivered, failed)
- created_at
- updated_at

---

## 7. Third-Party Integration Requirements

### 7.1 GHN (Giao Hàng Nhanh)
API Documentation: https://api.ghn.vn/home/docs/detail
Required credentials:
- GHN_API_KEY
- GHN_SHOP_ID

### 7.2 GHTK (Giao Hàng Tiết Kiệm)
API Documentation: https://docs.giaohangtietkiem.vn/
Required credentials:
- GHTK_API_TOKEN

### 7.3 Viettel Post
API Documentation: https://viettelpost.vn/
Required credentials:
- VIETTEL_USERNAME
- VIETTEL_PASSWORD

### 7.4 Web Push (VAPID)
Required environment variables:
- VAPID_PUBLIC_KEY (already configured)
- VAPID_PRIVATE_KEY (already configured)
- VAPID_SUBJECT (already configured, e.g., mailto:admin@nhangsach.net)

Use library: `web-push` (npm)

---

## 8. Business Logic Requirements

### Return Refund Calculations by Payment Model:

1. **Deposit Model (Ký gửi có ký quỹ)**
   - Refund amount = product price × quantity
   - Action: Add refund amount to vendor's deposit balance

2. **Monthly Settlement**
   - Refund amount = product price × quantity
   - Action: Reduce from vendor's monthly debt or add to credit

3. **Upfront Purchase**
   - Returns NOT allowed (vendor already paid upfront)
   - Show error message to customer

4. **Revenue Share**
   - Refund amount = (product price × quantity) × vendor's share (70%)
   - Action: Deduct from vendor's balance

### Stock Updates on Return:
- When return approved: Increase product quantity by returned amount
- When return rejected: No stock change

### Notification Triggers:
- New order: Real-time when order created
- Return request: Real-time when customer requests return
- Low stock: Daily check at 9:00 AM for products < 10 units
- Payment reminder: 3 days before monthly invoice due date
- Order delivered: Real-time when shipping status = delivered
- Low deposit: When deposit balance < 1,000,000 VND

---

## Implementation Priority

**High Priority:**
1. Returns API (all endpoints)
2. Push notification subscription endpoints
3. Shipping label generation (at least one carrier - GHN recommended)

**Medium Priority:**
4. Bulk product upload
5. Bulk product operations
6. Financial transactions API

**Low Priority:**
7. Analytics endpoints
8. Additional shipping carriers (GHTK, Viettel)

---

## Testing Checklist

- [ ] All endpoints return proper error responses
- [ ] Authentication checks on all vendor endpoints
- [ ] CORS configured for web push
- [ ] File upload size limits configured (max 10MB for Excel)
- [ ] Excel parsing handles Vietnamese characters correctly
- [ ] Shipping label PDFs generated in correct format
- [ ] Push notifications work on Chrome, Firefox, Edge
- [ ] Database transactions for refund operations
- [ ] Stock updates are atomic
- [ ] Webhook handlers for shipping carrier callbacks

---

## Error Codes

Common error codes to use:

- `UNAUTHORIZED`: User not authenticated
- `FORBIDDEN`: User not authorized for this resource
- `NOT_FOUND`: Resource not found
- `VALIDATION_ERROR`: Invalid input data
- `INSUFFICIENT_BALANCE`: Not enough deposit/credit
- `CARRIER_ERROR`: Shipping carrier API error
- `FILE_TOO_LARGE`: Uploaded file exceeds limit
- `INVALID_FILE_FORMAT`: File format not supported
- `DUPLICATE_SUBSCRIPTION`: Push subscription already exists

---

Last updated: 2025-01-05
Version: 1.0
