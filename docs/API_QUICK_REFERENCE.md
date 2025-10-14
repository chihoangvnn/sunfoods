# API Quick Reference
## Bảng tra cứu nhanh tất cả API Endpoints

> **Quick lookup table for all backend API endpoints**

## Authentication & Session

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/session/login` | None | Customer login - creates session |
| GET | `/api/session/status` | Session | Check session status |
| POST | `/api/session/logout` | Session | Destroy session |
| POST | `/api/admin/login` | None | Admin login |
| POST | `/api/vendor/auth/login` | None | Vendor login |

## Products

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/products` | POS | List products (VIP-filtered) |
| GET | `/api/products/admin/all` | Admin | List ALL products (no VIP filter) |
| GET | `/api/products/slug/:slug` | Optional | Get product by slug |
| GET | `/api/products/by-barcode` | POS | Get product by barcode (POS scanning) |
| GET | `/api/products/:id/faqs` | None | Get product FAQs |
| GET | `/api/products/:id/policies` | None | Get product policies |
| POST | `/api/products` | Admin | Create new product |
| PUT | `/api/products/:id` | Admin | Update product |
| DELETE | `/api/products/:id` | Admin | Delete product |

## Categories

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/categories` | None | List all categories |
| GET | `/api/categories/:id` | None | Get category by ID |
| POST | `/api/categories` | Admin | Create category |
| PUT | `/api/categories/:id` | Admin | Update category |
| DELETE | `/api/categories/:id` | Admin | Delete category |

## Flash Sales

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/flash-sales` | Admin | List all flash sales (admin) |
| GET | `/api/flash-sales/public/slug/:slug` | None | Get flash sale by slug (public) |
| POST | `/api/flash-sales` | Admin | Create flash sale |
| PUT | `/api/flash-sales/:id` | Admin | Update flash sale |
| DELETE | `/api/flash-sales/:id` | Admin | Delete flash sale |

## Pre-orders

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/preorders` | Admin | List all preorders (admin) |
| GET | `/api/preorders/public/slug/:slug` | None | Get preorder by slug (public) |
| POST | `/api/preorders` | Admin | Create preorder |
| PUT | `/api/preorders/:id` | Admin | Update preorder |
| DELETE | `/api/preorders/:id` | Admin | Delete preorder |

## Wishlist

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/wishlist` | Customer | Get customer's wishlist |
| POST | `/api/wishlist` | Customer | Add product to wishlist |
| DELETE | `/api/wishlist/:productId` | Customer | Remove from wishlist |

## Notifications

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/notifications` | Customer | Get customer notifications |
| POST | `/api/notifications/read` | Customer | Mark notifications as read |
| DELETE | `/api/notifications/:id` | Customer | Delete notification |

## Customer Profile

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/customers` | Customer | Get customer profile |
| PUT | `/api/customers` | Customer | Update customer profile |
| GET | `/api/customers/:id/orders` | Customer | Get customer orders |

## Shop Settings

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/shop-info` | None | Get public shop info |
| GET | `/api/admin/shop-settings` | Admin | Get shop settings (admin) |
| PUT | `/api/admin/shop-settings` | Admin | Update shop settings |

## Shipping & Delivery

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/shipping/ghn/provinces` | Admin | Get GHN provinces list |
| GET | `/api/shipping/ghn/districts` | Admin | Get GHN districts by province |
| GET | `/api/shipping/ghn/wards` | Admin | Get GHN wards by district |
| POST | `/api/shipping/ghn/calculate-fee` | Admin | Calculate shipping fee |
| POST | `/api/shipping/ghn/create-order` | Admin | Create GHN shipping order |
| GET | `/api/viettelpost/provinces` | Admin | Get VTP provinces |
| POST | `/api/viettelpost/calculate-fee` | Admin | Calculate VTP fee |

## Vouchers & Discounts

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/public-vouchers` | None | Get public vouchers |
| GET | `/api/customer/vouchers` | Customer | Get customer vouchers |
| POST | `/api/discounts/validate` | Customer | Validate discount code |
| POST | `/api/checkout/apply-voucher` | Customer | Apply voucher to order |

## Membership & VIP

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/membership` | Customer | Get membership info |
| POST | `/api/vip-registration` | None | VIP QR registration |
| GET | `/api/vip-portal` | VIP | VIP portal dashboard |
| GET | `/api/vip-management` | Admin | Admin VIP management |

## Affiliates

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/affiliate-auth/login` | None | Affiliate login |
| GET | `/api/affiliate-portal` | Affiliate | Affiliate portal dashboard |
| GET | `/api/affiliate/:slug` | None | Affiliate landing page |
| GET | `/api/affiliate-management` | Admin | Admin affiliate management |

## Vendors

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/vendor/auth/login` | None | Vendor login |
| GET | `/api/vendor/dashboard` | Vendor | Vendor dashboard stats |
| GET | `/api/vendor/products` | Vendor | Vendor products list |
| POST | `/api/vendor/products` | Vendor | Add vendor product |
| GET | `/api/vendor/orders` | Vendor | Vendor orders list |
| GET | `/api/vendor/financial` | Vendor | Vendor financial data |

## Analytics

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/analytics/overview` | Admin | Analytics overview |
| GET | `/api/analytics/sales` | Admin | Sales analytics |
| GET | `/api/analytics/customers` | Admin | Customer analytics |
| GET | `/api/recommendations` | Admin | Product recommendations |

## Chatbot (RASA)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/rasa/webhook` | None | RASA webhook endpoint |
| GET | `/api/rasa-conversations` | Admin | Get chat conversations |
| GET | `/api/chat-logs` | Admin | Get chat logs |
| POST | `/api/rasa-management/train` | Admin | Train RASA model |

## Social Media

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/facebook-apps` | Admin | List Facebook apps |
| POST | `/api/auth/facebook` | None | Facebook OAuth login |
| GET | `/api/satellites` | Admin | Get satellite accounts |
| GET | `/api/posts` | Admin | Get scheduled posts |
| POST | `/api/posts` | Admin | Create scheduled post |

## Books (Nhà sách)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/books` | None | List books |
| POST | `/api/books` | Admin | Create book |
| GET | `/api/book-orders` | Customer | Get book orders |
| POST | `/api/book-checkout` | Customer | Book checkout |
| GET | `/api/book-categories` | None | Get book categories |

## System & Admin

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/health` | None | System health check |
| POST | `/api/admin/scan-apis` | Admin | Auto-discover APIs |
| GET | `/api/api-management` | Admin | API management dashboard |
| POST | `/api/admin/calculate-route-distance` | Admin | ORS distance calculation |

## Webhooks

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/webhooks/viettelpost` | None | ViettelPost webhook |
| POST | `/api/webhooks/facebook` | None | Facebook webhook |
| POST | `/api/callbacks/:jobId` | None | Job callback endpoint |

---

## Auth Types

- **None**: Public endpoint, no authentication required
- **Session**: Requires customer session cookie
- **Customer**: Requires customer session (same as Session)
- **Admin**: Requires admin session
- **POS**: Requires POS authentication
- **Vendor**: Requires vendor session
- **Affiliate**: Requires affiliate session
- **VIP**: Requires VIP customer session

---

## Base URL

```
Development: http://localhost:3001
Production: https://api.sunfoods.vn
```

---

## Common Headers

### For Session-based Requests:
```
Cookie: connect.sid=s%3A...
Content-Type: application/json
```

### For Admin Requests:
```
Cookie: connect.sid=s%3A... (admin session)
Content-Type: application/json
```

---

## Quick cURL Examples

### Login
```bash
curl -X POST http://localhost:3001/api/session/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@sunfoods.vn","password":"password123"}' \
  -c cookies.txt
```

### Get Products (with session)
```bash
curl -X GET http://localhost:3001/api/products?limit=10 \
  -b cookies.txt
```

### Create Flash Sale (admin)
```bash
curl -X POST http://localhost:3001/api/flash-sales \
  -H "Content-Type: application/json" \
  -b admin-cookies.txt \
  -d '{
    "productId":"prod_123",
    "title":"Flash Sale",
    "originalPrice":100000,
    "salePrice":80000,
    "startTime":"2025-10-15T00:00:00Z",
    "endTime":"2025-10-20T23:59:59Z"
  }'
```

---

## Notes

1. **Session Cookies**: Tất cả session-based endpoints yêu cầu cookie `connect.sid` từ login response
2. **VIP Access**: Một số products có `requiredVipTier`, chỉ VIP members mới access được
3. **Rate Limits**: GET (100/min), POST/PUT/DELETE (50/min)
4. **Pagination**: Sử dụng `limit` và `offset` query params
5. **Timestamps**: Tất cả timestamps theo ISO 8601 format (UTC)
