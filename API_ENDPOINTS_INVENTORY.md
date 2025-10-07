# API ENDPOINTS INVENTORY

**Generated:** October 07, 2025  
**Total Registered Routers:** 109  
**Total Direct Endpoints:** 171  
**Estimated Total Endpoints:** 360+

---

## SUMMARY BY CATEGORY

### Authentication & Authorization (40+ endpoints)
- Admin Authentication
- Affiliate Authentication
- Vendor Authentication
- VIP Customer Authentication
- Driver Authentication
- Customer Authentication (Facebook, Google, Zalo)
- Replit OAuth
- Unified Auth System

### Products & Catalog (50+ endpoints)
- Product Management
- Product FAQs
- Categories & Industries
- General Categories
- Books Management
- Price Filtering
- Smart Search
- Product Landing Pages

### Orders & Checkout (45+ endpoints)
- Order Management
- Order Details
- Checkout
- Book Orders
- TikTok Shop Orders
- Shopee Shop Orders
- Storefront Orders

### RASA Chatbot Integration (22 endpoints)
- Catalog & Product Discovery
- Customer Management
- Order Processing
- Personalization
- Product Descriptions
- Consultations
- Recommendations

### Vendor Management (35+ endpoints)
- Vendor Dashboard
- Vendor Products
- Vendor Orders
- Vendor Consignment
- Vendor Financial
- Vendor Returns
- Vendor Settings
- Vendor Notifications

### Affiliate System (25+ endpoints)
- Affiliate Portal
- Affiliate Management
- Affiliate Landing
- Affiliate Approval
- Affiliate Product Assignment
- Affiliate Product Requests

### VIP & Membership (20+ endpoints)
- VIP Portal
- VIP Management
- VIP Registration
- Membership Management
- Customer Vouchers
- Gift Campaigns
- Gift Vouchers

### Driver & Delivery (25+ endpoints)
- Driver Portal
- Driver Management
- Delivery Management
- Vehicle Management
- Delivery Orders

### Customer Management (30+ endpoints)
- Customer CRUD
- Customer Dashboard
- Customer Search
- Customer Vouchers
- Customer Local Assignment
- Customer Cleanup

### E-commerce Platforms Integration (40+ endpoints)
- Shopee Shop (20+ endpoints)
- TikTok Shop (15+ endpoints)
- Facebook Apps (15+ endpoints)

### Content & Media (35+ endpoints)
- Content Library
- Content Assets
- Content Queue
- Content Preview
- Media Upload
- Bulk Media Upload
- Scheduled Posts
- Post Scheduler

### Analytics & Insights (20+ endpoints)
- Analytics Dashboard
- Recommendations
- Seller Performance Analytics
- Bot Insights
- Post Performance Analytics
- Chatbot Analytics

### Automation & AI (25+ endpoints)
- Automation Rules
- Pricing Automation
- Sales Automation
- Advanced Automation
- AI Content Generation
- AI FAQ Generation
- Bot Recommendations

### FAQ Management (15+ endpoints)
- FAQ Library
- FAQ Assignments
- Category FAQ Templates
- Product FAQs
- AI FAQ Generation

### Social Media & Communication (30+ endpoints)
- Facebook Apps Management
- Facebook Webhooks
- Chatbot Management
- Chat Logs
- Push Notifications
- Fanpage Matching
- Duplicate Detection

### Infrastructure & System (25+ endpoints)
- System Health
- Orchestrator
- Workers Management
- Satellites
- Job Callbacks
- Queue Manager
- Ngrok Configuration
- Region Assignment
- IP Pool Management

### Shipping & Logistics (15+ endpoints)
- GHN Shipping Integration
- ViettelPost Integration
- ViettelPost Webhooks

### Reviews & Ratings (10+ endpoints)
- Review Management
- Review Seeding
- Admin Reviews
- Seller Ratings

### Settings & Configuration (20+ endpoints)
- Shop Settings
- Shop Info
- Payment Gateway Settings
- Cookie Management
- Theme Management
- Template Management
- Invoice Templates
- Lunar Calendar

### Books Ecosystem (20+ endpoints)
- Books Management
- Book Categories
- Book Orders
- Book Customers
- Book Sellers
- Book Inventory
- Book Transactions
- Book Checkout
- Book Payment Transactions

---

## DETAILED ENDPOINT LIST

### 1. AUTHENTICATION ROUTES

#### Admin Authentication (`/api/admin`)
- `[POST] /api/admin/login` - Admin login
- `[POST] /api/admin/logout` - Admin logout
- `[GET] /api/admin/me` - Get current admin user
- `[POST] /api/admin/create` - Create new admin
- `[GET] /api/admin/list` - List all admins
- `[PUT] /api/admin/:id` - Update admin
- `[DELETE] /api/admin/:id` - Delete admin

#### Affiliate Authentication (`/api/affiliate-auth`)
- `[POST] /api/affiliate-auth/login` - Affiliate login
- `[POST] /api/affiliate-auth/logout` - Affiliate logout
- `[GET] /api/affiliate-auth/session` - Get affiliate session

#### Vendor Authentication (`/api/vendor/auth`)
- `[POST] /api/vendor/auth/login` - Vendor login
- `[POST] /api/vendor/auth/logout` - Vendor logout
- `[GET] /api/vendor/auth/me` - Get vendor profile
- `[POST] /api/vendor/auth/register` - Vendor registration

#### Replit OAuth
- `[GET] /auth/replit` - Initiate Replit OAuth
- `[GET] /auth/replit/callback` - Replit OAuth callback
- `[GET] /api/auth/user` - Get current user
- `[POST] /api/auth/logout` - Logout

#### Customer Authentication
- `[GET] /api/auth/facebook` - Facebook OAuth initiation
- `[GET] /api/auth/facebook/callback` - Facebook OAuth callback
- `[GET] /api/auth/google` - Google OAuth initiation
- `[GET] /api/auth/google/callback` - Google OAuth callback
- `[GET] /api/auth/zalo` - Zalo OAuth initiation
- `[GET] /api/auth/zalo/callback` - Zalo OAuth callback
- `[GET] /api/auth/zalo/status` - Zalo connection status

---

### 2. PRODUCTS & CATALOG ROUTES

#### Products (`/api/products`)
- `[GET] /api/products` - List all products
- `[GET] /api/products/popular` - Get popular products
- `[GET] /api/products/:id` - Get product by ID
- `[POST] /api/products` - Create product
- `[PUT] /api/products/:id` - Update product
- `[DELETE] /api/products/:id` - Delete product
- `[POST] /api/products/bulk-upload` - Bulk upload products
- `[GET] /api/products/search` - Search products
- `[GET] /api/products/by-category/:categoryId` - Products by category

#### Product FAQs (`/api/product-faqs`)
- `[POST] /api/product-faqs` - Create FAQ
- `[PUT] /api/product-faqs/:id` - Update FAQ
- `[DELETE] /api/product-faqs/:id` - Delete FAQ
- `[PUT] /api/product-faqs/reorder/:productId` - Reorder FAQs
- `[GET] /api/product-faqs/all-for-rasa` - Get all FAQs for RASA
- `[GET] /api/product-faqs/:id` - Get FAQ by ID

#### Categories (`/api/categories`)
- `[GET] /api/categories` - List categories
- `[POST] /api/categories` - Create category
- `[PUT] /api/categories/:id` - Update category
- `[DELETE] /api/categories/:id` - Delete category

#### General Categories (`/api/general-categories`)
- `[GET] /api/general-categories` - List general categories
- `[POST] /api/general-categories` - Create general category
- `[PUT] /api/general-categories/:id` - Update general category
- `[DELETE] /api/general-categories/:id` - Delete general category

#### Industries
- `[GET] /api/industries` - List industries
- `[GET] /api/industries/:id` - Get industry by ID
- `[POST] /api/industries` - Create industry
- `[PUT] /api/industries/:id` - Update industry
- `[DELETE] /api/industries/:id` - Delete industry

#### Books (`/api/books`)
- `[GET] /api/books` - List books
- `[POST] /api/books` - Create book
- `[PUT] /api/books/:id` - Update book
- `[DELETE] /api/books/:id` - Delete book
- `[GET] /api/books/search` - Search books by ISBN
- `[POST] /api/books/bulk-import` - Bulk import books

#### Book Categories (`/api/book-categories`)
- `[GET] /api/book-categories` - List book categories
- `[POST] /api/book-categories` - Create book category
- `[PATCH] /api/book-categories/:id` - Update book category
- `[DELETE] /api/book-categories/:id` - Delete book category

#### Price Filtering (`/api/price-filtering`)
- `[GET] /api/price-filtering/books` - Get filtered books by price
- `[GET] /api/price-filtering/price-ranges/:categoryId?` - Get price ranges
- `[GET] /api/price-filtering/compare/:isbn` - Compare book prices
- `[GET] /api/price-filtering/rules/:categoryId?` - Get pricing rules
- `[POST] /api/price-filtering/rules` - Create pricing rule
- `[PUT] /api/price-filtering/rules/:ruleId` - Update pricing rule
- `[DELETE] /api/price-filtering/rules/:ruleId` - Delete pricing rule
- `[POST] /api/price-filtering/rules/:categoryId/apply` - Apply pricing rules
- `[GET] /api/price-filtering/analytics/:categoryId?` - Get pricing analytics

#### Smart Search (`/api/smart-search`)
- `[GET] /api/smart-search` - Smart product search
- `[GET] /api/smart-search/suggestions` - Get search suggestions

#### Product Landing Pages
- `[GET] /api/product-landing-pages` - List landing pages
- `[GET] /api/product-landing-pages/:id` - Get landing page
- `[POST] /api/product-landing-pages` - Create landing page
- `[PUT] /api/product-landing-pages/:id` - Update landing page
- `[DELETE] /api/product-landing-pages/:id` - Delete landing page
- `[GET] /api/public-landing/:slug` - Public landing page view

---

### 3. ORDERS & CHECKOUT ROUTES

#### Orders
- `[GET] /api/orders` - List orders
- `[GET] /api/orders/:id` - Get order by ID
- `[POST] /api/orders` - Create order
- `[PUT] /api/orders/:id` - Update order
- `[DELETE] /api/orders/:id` - Delete order
- `[GET] /api/orders/search` - Search orders
- `[PUT] /api/orders/:id/status` - Update order status
- `[POST] /api/landing-orders` - Create order from landing page

#### Checkout (`/api/checkout`)
- `[POST] /api/checkout/create-order` - Create checkout order
- `[POST] /api/checkout/validate` - Validate checkout
- `[GET] /api/checkout/payment-methods` - Get available payment methods

#### Book Orders (`/api/book-orders`)
- `[GET] /api/book-orders` - List book orders
- `[POST] /api/book-orders` - Create book order
- `[PUT] /api/book-orders/:id` - Update book order
- `[DELETE] /api/book-orders/:id` - Delete book order

#### Book Transactions (`/api/book-transactions`)
- `[GET] /api/book-transactions` - List book transactions
- `[POST] /api/book-transactions` - Create transaction

#### Book Checkout (`/api/book-checkout`)
- `[POST] /api/book-checkout/create-order` - Create book checkout order
- `[POST] /api/book-checkout/validate` - Validate book checkout

#### Storefront Orders
- `[GET] /api/storefront/orders` - List storefront orders
- `[POST] /api/storefront/orders` - Create storefront order

---

### 4. RASA CHATBOT INTEGRATION ROUTES (`/api/rasa`)

#### Catalog & Product Discovery
- `[GET] /api/rasa/catalogs` - Get all catalogs
- `[GET] /api/rasa/catalog-tree` - Get hierarchical catalog tree
- `[GET] /api/rasa/catalogs/:catalogId/subcatalogs` - Get subcatalogs
- `[GET] /api/rasa/products/by-catalog/:catalogId` - Get products by catalog
- `[GET] /api/rasa/products/search` - Search products
- `[GET] /api/rasa/products/:productId/details` - Get product details
- `[GET] /api/rasa/products/:productId/availability` - Check product availability

#### Customer Management
- `[GET] /api/rasa/customers/search` - Search customers
- `[GET] /api/rasa/customers/:customerId/profile` - Get customer profile
- `[POST] /api/rasa/customers` - Create customer
- `[GET] /api/rasa/customer/:phone/personalization` - Get customer personalization
- `[POST] /api/rasa/customers/link-facebook` - Link Facebook account
- `[GET] /api/rasa/customer-by-psid/:psid` - Get customer by Facebook PSID

#### Product Descriptions & Consultations
- `[GET] /api/rasa/products/:productId/description` - Get product description
- `[GET] /api/rasa/incense/:productId/consultation` - Get incense consultation
- `[GET] /api/rasa/products/:productId/description/:index` - Get specific description
- `[GET] /api/rasa/products/:productId/descriptions/all` - Get all descriptions
- `[POST] /api/rasa/products/:productId/description/analytics` - Track description analytics

#### Order Processing
- `[POST] /api/rasa/orders/calculate` - Calculate order total
- `[POST] /api/rasa/orders/create-from-bot` - Create order from bot
- `[POST] /api/rasa/orders` - Create order
- `[GET] /api/rasa/orders/:orderId/status` - Get order status
- `[GET] /api/rasa/orders/:orderId` - Get order details

#### Recommendations
- `[GET] /api/rasa/recommendations/trending` - Get trending products
- `[GET] /api/rasa/recommendations/customer/:customerId` - Get customer recommendations

#### Chat Interface
- `[POST] /api/rasa/chat` - Send chat message (rate-limited)

---

### 5. VENDOR MANAGEMENT ROUTES

#### Vendor Dashboard (`/api/vendor/dashboard`)
- `[GET] /api/vendor/dashboard/stats` - Get vendor dashboard statistics
- `[GET] /api/vendor/dashboard/sales` - Get sales analytics
- `[GET] /api/vendor/dashboard/products` - Get product performance

#### Vendor Products (`/api/vendor/products`)
- `[GET] /api/vendor/products` - List vendor products
- `[POST] /api/vendor/products` - Create vendor product
- `[PUT] /api/vendor/products/:id` - Update vendor product
- `[DELETE] /api/vendor/products/:id` - Delete vendor product
- `[PUT] /api/vendor/products/:id/stock` - Update product stock

#### Vendor Consignment (`/api/vendor/consignment`)
- `[GET] /api/vendor/consignment/requests` - List consignment requests
- `[POST] /api/vendor/consignment/requests` - Create consignment request
- `[GET] /api/vendor/consignment/requests/:id` - Get request details

#### Vendor Orders (`/api/vendor/orders`)
- `[GET] /api/vendor/orders` - List vendor orders
- `[GET] /api/vendor/orders/:id` - Get order details
- `[PUT] /api/vendor/orders/:id/status` - Update order status
- `[POST] /api/vendor/orders/:id/shipping-label` - Generate shipping label

#### Vendor Financial (`/api/vendor/financial`)
- `[GET] /api/vendor/financial/balance` - Get vendor balance
- `[GET] /api/vendor/financial/transactions` - List transactions
- `[POST] /api/vendor/financial/deposit` - Request deposit
- `[GET] /api/vendor/financial/statements` - Get financial statements

#### Vendor Returns (`/api/vendor/returns`)
- `[GET] /api/vendor/returns` - List return requests
- `[GET] /api/vendor/returns/:id` - Get return details
- `[PUT] /api/vendor/returns/:id/status` - Update return status

#### Vendor Settings (`/api/vendor`)
- `[GET] /api/vendor/settings` - Get vendor settings
- `[PUT] /api/vendor/settings` - Update vendor settings

#### Vendor Notifications (`/api/vendor/notifications`)
- `[GET] /api/vendor/notifications` - List notifications
- `[PUT] /api/vendor/notifications/:id/read` - Mark as read

#### Admin Vendor Management (`/api/admin`)
- `[GET] /api/admin/vendors` - List all vendors
- `[PUT] /api/admin/vendors/:id/status` - Update vendor status
- `[POST] /api/admin/consignment-requests/:id/approve` - Approve consignment
- `[POST] /api/admin/consignment-requests/:id/reject` - Reject consignment

---

### 6. AFFILIATE SYSTEM ROUTES

#### Affiliate Portal (`/api/affiliate-portal`)
- `[GET] /api/affiliate-portal/dashboard` - Affiliate dashboard
- `[GET] /api/affiliate-portal/products` - Available products
- `[GET] /api/affiliate-portal/orders` - Affiliate orders
- `[GET] /api/affiliate-portal/earnings` - Earnings summary
- `[POST] /api/affiliate-portal/request-product` - Request product access

#### Affiliate Management (`/api/affiliate-management`)
- `[GET] /api/affiliate-management/affiliates` - List affiliates
- `[GET] /api/affiliate-management/affiliates/:id` - Get affiliate details
- `[PUT] /api/affiliate-management/affiliates/:id/status` - Update affiliate status
- `[GET] /api/affiliate-management/product-requests` - List product requests
- `[PUT] /api/affiliate-management/product-requests/:id` - Approve/reject request

#### Affiliate Landing (`/api/affiliate`)
- `[POST] /api/affiliate/apply` - Apply to become affiliate
- `[GET] /api/affiliate/me` - Get affiliate profile

#### Affiliates CRUD (`/api/affiliates`)
- `[GET] /api/affiliates` - List affiliates
- `[POST] /api/affiliates` - Create affiliate
- `[PUT] /api/affiliates/:id` - Update affiliate
- `[DELETE] /api/affiliates/:id` - Delete affiliate

---

### 7. VIP & MEMBERSHIP ROUTES

#### VIP Portal (`/api/vip-portal`)
- `[GET] /api/vip-portal/dashboard` - VIP dashboard
- `[GET] /api/vip-portal/products` - VIP exclusive products
- `[GET] /api/vip-portal/orders` - VIP orders
- `[GET] /api/vip-portal/benefits` - VIP benefits

#### VIP Management (`/api/vip-management`)
- `[GET] /api/vip-management/customers` - List VIP customers
- `[PUT] /api/vip-management/customers/:id/tier` - Update VIP tier
- `[GET] /api/vip-management/tiers` - List VIP tiers

#### VIP Registration (`/api/vip-registration`)
- `[POST] /api/vip-registration/register` - Register as VIP
- `[GET] /api/vip-registration/qr/:code` - Get QR code details

#### Membership (`/api/membership`)
- `[GET] /api/membership/tiers` - List membership tiers
- `[GET] /api/membership/benefits` - Get membership benefits
- `[POST] /api/membership/upgrade` - Upgrade membership

#### Customer Vouchers (`/api/customer/vouchers`)
- `[GET] /api/customer/vouchers` - List customer vouchers
- `[POST] /api/customer/vouchers/claim` - Claim voucher
- `[GET] /api/customer/vouchers/available` - Available vouchers

#### Gift Campaigns (`/api/gift-campaigns`)
- `[GET] /api/gift-campaigns` - List gift campaigns
- `[POST] /api/gift-campaigns` - Create gift campaign
- `[PUT] /api/gift-campaigns/:id` - Update gift campaign
- `[DELETE] /api/gift-campaigns/:id` - Delete gift campaign

#### Gift Vouchers (`/api/gift-vouchers`)
- `[GET] /api/gift-vouchers` - List gift vouchers
- `[POST] /api/gift-vouchers` - Create gift voucher
- `[PUT] /api/gift-vouchers/:id` - Update gift voucher
- `[DELETE] /api/gift-vouchers/:id` - Delete gift voucher

---

### 8. DRIVER & DELIVERY ROUTES

#### Driver Portal (`/api/driver-portal`)
- `[GET] /api/driver-portal/dashboard` - Driver dashboard
- `[GET] /api/driver-portal/vehicles` - List driver vehicles
- `[POST] /api/driver-portal/vehicles` - Add vehicle
- `[GET] /api/driver-portal/trips` - List trips
- `[GET] /api/driver-portal/trips/:id` - Get trip details
- `[POST] /api/driver-portal/trips` - Create trip
- `[PUT] /api/driver-portal/trips/:id/status` - Update trip status
- `[PUT] /api/driver-portal/trips/:id` - Update trip

#### Driver Management (`/api/driver-management`)
- `[GET] /api/driver-management/drivers` - List drivers
- `[PUT] /api/driver-management/drivers/:id/status` - Update driver status
- `[GET] /api/driver-management/approvals` - Pending approvals
- `[POST] /api/driver-management/approvals/:id/approve` - Approve driver

#### Delivery Management (`/api/delivery-management`)
- `[GET] /api/delivery-management/dashboard` - Delivery dashboard
- `[GET] /api/delivery-management/delivery-orders` - List delivery orders
- `[PUT] /api/delivery-management/delivery-orders/:id` - Update delivery
- `[GET] /api/delivery-management/vehicles` - List vehicles
- `[POST] /api/delivery-management/vehicles` - Add vehicle

---

### 9. CUSTOMER MANAGEMENT ROUTES

#### Customers
- `[GET] /api/customers` - List customers
- `[GET] /api/customers/search` - Search customers
- `[GET] /api/customers/:id` - Get customer by ID
- `[POST] /api/customers` - Create customer
- `[PUT] /api/customers/:id` - Update customer
- `[DELETE] /api/customers/:id` - Delete customer
- `[POST] /api/admin/customers/cleanup-incomplete` - Cleanup incomplete customers
- `[GET] /api/customer-auth-status` - Get customer auth status

#### Customer Dashboard (`/api/customer-dashboard`)
- `[GET] /api/customer-dashboard/overview` - Dashboard overview
- `[GET] /api/customer-dashboard/orders` - Customer orders
- `[GET] /api/customer-dashboard/rewards` - Customer rewards

#### Customer Analytics
- `[GET] /api/customers/:id/affiliate-stats` - Get affiliate statistics
- `[GET] /api/customers/:id/driver-deliveries` - Get driver deliveries

#### Customer Local Assignment
- `[PATCH] /api/customers/:id/local-status` - Update local status
- `[PATCH] /api/customers/batch-local-status` - Batch update local status
- `[GET] /api/customers/local` - Get local customers

#### Customer Management (`/api/customer-management`)
- `[GET] /api/customer-management/customers` - List customers
- `[PUT] /api/customer-management/customers/:id` - Update customer
- `[GET] /api/customer-management/analytics` - Customer analytics

---

### 10. E-COMMERCE PLATFORMS INTEGRATION ROUTES

#### Shopee Shop Routes (`/api/shopee-shop`)
- `[POST] /api/shopee-shop/connect` - Connect Shopee account
- `[GET] /auth/shopee/callback` - Shopee OAuth callback
- `[DELETE] /api/shopee-shop/disconnect/:accountId` - Disconnect account
- `[GET] /api/shopee-shop/accounts` - List connected accounts
- `[GET] /api/shopee-shop/orders` - List Shopee orders
- `[GET] /api/shopee-shop/orders/analytics` - Order analytics
- `[GET] /api/shopee-shop/orders/:orderId` - Get order details
- `[PUT] /api/shopee-shop/orders/:orderId/status` - Update order status
- `[GET] /api/shopee-shop/seller/:businessAccountId/dashboard` - Seller dashboard
- `[GET] /api/shopee-shop/seller/:businessAccountId/analytics` - Seller analytics
- `[POST] /api/shopee-shop/seller/:businessAccountId/sync` - Sync seller data
- `[GET] /api/shopee-shop/sellers` - List all sellers
- `[GET] /api/shopee-shop/sellers/comparison` - Seller comparison
- `[GET] /api/shopee-shop/products` - List Shopee products
- `[GET] /api/shopee-shop/inventory/alerts` - Inventory alerts
- `[GET] /api/shopee-shop/fulfillment/queue` - Fulfillment queue
- `[GET] /api/shopee-shop/fulfillment/stats` - Fulfillment statistics
- `[PATCH] /api/shopee-shop/fulfillment/tasks/:taskId/status` - Update task status
- `[POST] /api/shopee-shop/fulfillment/tasks/:taskId/shipping-label` - Generate label
- `[POST] /api/shopee-shop/fulfillment/bulk-update` - Bulk update orders
- `[POST] /api/shopee-shop/sync/:businessAccountId` - Sync shop data
- `[GET] /api/shopee-shop/sync-status` - Check sync status
- `[POST] /api/shopee-shop/orders/:orderSn/ship` - Ship order
- `[POST] /api/shopee-shop/products/bulk-update` - Bulk update products
- `[POST] /api/shopee-shop/products/:id/sync-inventory` - Sync inventory
- `[PATCH] /api/shopee-shop/products/:id/status` - Update product status

#### TikTok Shop Routes (`/api/tiktok-shop`)
- `[GET] /api/tiktok-shop/orders` - List TikTok orders
- `[GET] /api/tiktok-shop/orders/:orderId` - Get order details
- `[PUT] /api/tiktok-shop/orders/:orderId/status` - Update order status
- `[PUT] /api/tiktok-shop/orders/bulk-update` - Bulk update orders
- `[GET] /api/tiktok-shop/analytics/orders` - Order analytics
- `[GET] /api/tiktok-shop/seller/:businessAccountId/dashboard` - Seller dashboard
- `[GET] /api/tiktok-shop/seller/:businessAccountId/analytics` - Seller analytics
- `[GET] /api/tiktok-shop/fulfillment/:businessAccountId/queue` - Fulfillment queue
- `[PUT] /api/tiktok-shop/fulfillment/orders/:orderId` - Update fulfillment
- `[POST] /api/tiktok-shop/fulfillment/shipping-labels` - Generate labels

#### Facebook Apps (`/api/facebook-apps`)
- `[GET] /api/facebook-apps/csrf-token` - Get CSRF token
- `[GET] /api/facebook-apps` - List Facebook apps
- `[POST] /api/facebook-apps` - Create Facebook app
- `[PUT] /api/facebook-apps/:id` - Update Facebook app
- `[DELETE] /api/facebook-apps/:id` - Delete Facebook app
- `[GET] /api/facebook-apps/:id/webhook-info` - Get webhook info
- `[POST] /api/facebook-apps/:id/test-webhook` - Test webhook
- `[POST] /api/facebook-apps/test-post` - Test Facebook post
- `[PATCH] /api/facebook-apps/:id/tags` - Update app tags
- `[POST] /api/facebook-apps/bulk-import` - Bulk import apps
- `[POST] /api/facebook-apps/bulk-delete` - Bulk delete apps
- `[POST] /api/facebook-apps/bulk-toggle` - Bulk toggle apps
- `[POST] /api/facebook-apps/bulk-update-tags` - Bulk update tags
- `[GET] /api/facebook-apps/:appId/connected-pages` - Get connected pages
- `[GET] /api/facebook-apps/unassigned-pages` - Get unassigned pages

---

### 11. CONTENT & MEDIA ROUTES

#### Content Library
- `[POST] /api/content/assets/upload` - Upload content asset
- `[GET] /api/content/assets` - List content assets

#### Content Queue
- `[GET] /api/content/queue` - Get queue items
- `[GET] /api/content/queue/:id` - Get queue item
- `[POST] /api/content/queue` - Create queue item
- `[PUT] /api/content/queue/:id` - Update queue item
- `[DELETE] /api/content/queue/:id` - Delete queue item
- `[PUT] /api/content/queue/reorder` - Reorder queue
- `[GET] /api/content/queue/settings` - Get queue settings
- `[PUT] /api/content/queue/settings` - Update queue settings
- `[GET] /api/content/queue/:id/history` - Get queue history

#### Content Preview (`/api/content-preview`)
- `[POST] /api/content-preview/generate` - Generate preview
- `[POST] /api/content-preview/multi-platform` - Multi-platform preview
- `[GET] /api/content-preview/limits/:platform` - Get platform limits
- `[GET] /api/content-preview/limits` - Get all limits

#### Media Upload
- `[POST] /api/media/upload` - Upload media files
- `[DELETE] /api/media/:publicId` - Delete media

#### Bulk Media Upload
- `[POST] /api/media/bulk-upload/parse` - Parse CSV for bulk upload
- `[GET] /api/media/bulk-upload/template` - Get CSV template
- `[POST] /api/media/bulk-upload/execute` - Execute bulk upload

#### Scheduled Posts (`/api/scheduled-posts`)
- `[GET] /api/scheduled-posts` - List scheduled posts
- `[POST] /api/scheduled-posts` - Create scheduled post
- `[PUT] /api/scheduled-posts/:id` - Update scheduled post
- `[DELETE] /api/scheduled-posts/:id` - Delete scheduled post

#### Post Scheduler (`/api/scheduler`)
- `[GET] /api/scheduler/status` - Get scheduler status
- `[POST] /api/scheduler/pause` - Pause scheduler
- `[POST] /api/scheduler/resume` - Resume scheduler

#### Posts (`/api/posts`)
- `[POST] /api/posts/schedule` - Schedule a post

---

### 12. ANALYTICS & INSIGHTS ROUTES

#### Analytics (`/api/analytics`)
- `[GET] /api/analytics/dashboard` - Analytics dashboard
- `[GET] /api/analytics/sales` - Sales analytics
- `[GET] /api/analytics/products` - Product analytics
- `[GET] /api/analytics/customers` - Customer analytics

#### Analytics Scheduler
- `[POST] /api/analytics/scheduler/start` - Start analytics scheduler
- `[POST] /api/analytics/scheduler/stop` - Stop analytics scheduler

#### Recommendations (`/api/recommendations`)
- `[GET] /api/recommendations/products` - Product recommendations
- `[GET] /api/recommendations/personalized` - Personalized recommendations

#### Seller Performance Analytics (`/api/seller-performance`)
- `[GET] /api/seller-performance/overview` - Performance overview
- `[GET] /api/seller-performance/metrics` - Performance metrics

#### Bot Insights (`/api/bot/insights`)
- `[GET] /api/bot/insights/rfm-analysis` - RFM analysis
- `[GET] /api/bot/insights/churn-prediction` - Churn prediction
- `[GET] /api/bot/insights/customer-segments` - Customer segments

---

### 13. AUTOMATION & AI ROUTES

#### Automation (`/api/automation`)
- `[GET] /api/automation/rules` - List automation rules
- `[POST] /api/automation/rules` - Create automation rule
- `[PUT] /api/automation/rules/:id` - Update automation rule
- `[DELETE] /api/automation/rules/:id` - Delete automation rule

#### Pricing Automation (`/api/pricing-automation`)
- `[GET] /api/pricing-automation/rules` - List pricing rules
- `[POST] /api/pricing-automation/rules` - Create pricing rule
- `[PATCH] /api/pricing-automation/rules/:id` - Update pricing rule
- `[DELETE] /api/pricing-automation/rules/:id` - Delete pricing rule
- `[POST] /api/pricing-automation/calculate/:productId` - Calculate price
- `[POST] /api/pricing-automation/update-pricing/:productId` - Update pricing
- `[GET] /api/pricing-automation/summary` - Get pricing summary
- `[POST] /api/pricing-automation/test-rules` - Test pricing rules
- `[GET] /api/pricing-automation/stats` - Get pricing statistics

#### Sales Automation
- `[GET] /api/sales-automation/campaigns` - List sales campaigns
- `[POST] /api/sales-automation/campaigns` - Create campaign
- `[PUT] /api/sales-automation/campaigns/:id` - Update campaign

#### Advanced Automation (`/api/advanced-automation`)
- `[GET] /api/advanced-automation/market-trends` - List market trends
- `[POST] /api/advanced-automation/market-trends` - Create trend
- `[GET] /api/advanced-automation/competitors` - List competitors
- `[POST] /api/advanced-automation/competitors` - Add competitor
- `[GET] /api/advanced-automation/seasonal-rules` - List seasonal rules
- `[POST] /api/advanced-automation/seasonal-rules` - Create seasonal rule
- `[POST] /api/advanced-automation/seasonal-rules/:id/apply` - Apply seasonal rule
- `[GET] /api/advanced-automation/pricing-strategies` - List pricing strategies
- `[POST] /api/advanced-automation/pricing-strategies` - Create pricing strategy

#### AI Content (`/api/ai`)
- `[POST] /api/ai/generate-description` - Generate product description
- `[POST] /api/ai/generate-faq` - Generate FAQ
- `[POST] /api/ai/generate-content` - Generate content

#### Bot Recommendations (`/api/bot/recommendations`)
- `[GET] /api/bot/recommendations/products/:customerId` - Get product recommendations
- `[GET] /api/bot/recommendations/trending` - Get trending products

#### Bot Cart (`/api/bot/cart`)
- `[GET] /api/bot/cart/abandoned` - Get abandoned carts
- `[POST] /api/bot/cart/recovery` - Send cart recovery message

---

### 14. FAQ MANAGEMENT ROUTES

#### FAQ Library (`/api/faq-library`)
- `[GET] /api/faq-library` - List FAQ library items
- `[POST] /api/faq-library` - Create FAQ library item
- `[PUT] /api/faq-library/:id` - Update FAQ library item
- `[DELETE] /api/faq-library/:id` - Delete FAQ library item

#### FAQ Assignments (`/api/faq-assignments`)
- `[GET] /api/faq-assignments` - List FAQ assignments
- `[POST] /api/faq-assignments` - Create FAQ assignment
- `[PUT] /api/faq-assignments/:id` - Update FAQ assignment
- `[DELETE] /api/faq-assignments/:id` - Delete FAQ assignment

#### Category FAQ Templates (`/api/category-faq-templates`)
- `[GET] /api/category-faq-templates` - List templates
- `[POST] /api/category-faq-templates` - Create template
- `[PUT] /api/category-faq-templates/:id` - Update template
- `[DELETE] /api/category-faq-templates/:id` - Delete template

#### AI FAQ Generation (`/api/ai-faq-generation`)
- `[POST] /api/ai-faq-generation/generate` - Generate FAQs with AI
- `[POST] /api/ai-faq-generation/bulk-generate` - Bulk generate FAQs

---

### 15. SOCIAL MEDIA & COMMUNICATION ROUTES

#### Chatbot Management
- `[GET] /api/chatbot/settings` - Get chatbot settings
- `[POST] /api/chatbot/settings` - Update chatbot settings
- `[POST] /api/chatbot/test-rasa` - Test RASA connection
- `[POST] /api/chatbot/message` - Send chatbot message

#### Facebook Webhooks
- `[GET] /api/webhooks/facebook/:appId?` - Facebook webhook verification
- `[POST] /api/webhooks/facebook/:appId?` - Facebook webhook events

#### Push Notifications (`/api/push-notifications`)
- `[POST] /api/push-notifications/subscribe` - Subscribe to notifications
- `[POST] /api/push-notifications/send` - Send push notification

#### Fanpage Matching (`/api/fanpage-matching`)
- `[GET] /api/fanpage-matching/matches` - Get fanpage matches
- `[POST] /api/fanpage-matching/create` - Create fanpage match

#### Duplicate Detection (`/api/duplicate-detection`)
- `[POST] /api/duplicate-detection/check` - Check for duplicates
- `[GET] /api/duplicate-detection/conflicts` - Get conflict list

---

### 16. INFRASTRUCTURE & SYSTEM ROUTES

#### System Health (`/api/health`)
- `[GET] /api/health` - Health check endpoint
- `[GET] /api/health/status` - Detailed health status
- `[GET] /api/health/check` - Run health checks
- `[GET] /api/health/metrics` - System metrics
- `[GET] /api/health/alerts` - System alerts
- `[GET] /api/health/component/:componentName` - Component status

#### Orchestrator (`/api/orchestrator`)
- `[GET] /api/orchestrator/overview` - Orchestrator overview
- `[GET] /api/orchestrator/campaigns` - List campaigns
- `[GET] /api/orchestrator/campaigns/:campaignId` - Get campaign
- `[POST] /api/orchestrator/plan-from-satellite` - Plan from satellite
- `[POST] /api/orchestrator/execute-plan` - Execute plan
- `[POST] /api/orchestrator/create-manual-campaign` - Create manual campaign
- `[POST] /api/orchestrator/quick-start` - Quick start campaign
- `[POST] /api/orchestrator/campaigns/:campaignId/pause` - Pause campaign
- `[POST] /api/orchestrator/campaigns/:campaignId/resume` - Resume campaign
- `[POST] /api/orchestrator/campaigns/:campaignId/cancel` - Cancel campaign
- `[GET] /api/orchestrator/worker-analysis` - Worker analysis
- `[POST] /api/orchestrator/update-progress` - Update progress

#### Workers (`/api/workers`)
- `[GET] /api/workers` - List workers
- `[POST] /api/workers` - Create worker
- `[PUT] /api/workers/:id` - Update worker
- `[DELETE] /api/workers/:id` - Delete worker

#### Satellites (`/api/satellites`)
- `[GET] /api/satellites/by-tag/:tagName` - Get satellites by tag
- `[GET] /api/satellites/by-group/:groupId` - Get satellites by group
- `[POST] /api/satellites/schedule-posts` - Schedule posts
- `[GET] /api/satellites/tags` - List satellite tags
- `[GET] /api/satellites/overview` - Satellites overview
- `[POST] /api/satellites/deploy` - Deploy satellite
- `[GET] /api/satellites/templates` - List templates

#### Job Callbacks (`/api/callbacks`)
- `[POST] /api/callbacks/job-completed` - Job completed callback
- `[POST] /api/callbacks/job-failed` - Job failed callback

#### Queue Manager
- `[GET] /api/queue/jobs` - List queue jobs
- `[POST] /api/queue/jobs` - Add queue job
- `[DELETE] /api/queue/jobs/:id` - Remove queue job

#### Ngrok Configuration (`/api/ngrok`)
- `[GET] /api/ngrok/status` - Get ngrok status
- `[POST] /api/ngrok/start` - Start ngrok tunnel
- `[POST] /api/ngrok/stop` - Stop ngrok tunnel
- `[POST] /api/ngrok/restart` - Restart ngrok tunnel
- `[GET] /api/ngrok/config` - Get ngrok configuration
- `[GET] /api/ngrok/tunnels` - List active tunnels

#### Region Assignment (`/api/regions`)
- `[GET] /api/regions/stats` - Get region statistics
- `[POST] /api/regions/assign` - Assign region
- `[POST] /api/regions/bulk-assign` - Bulk assign regions
- `[POST] /api/regions/rebalance` - Rebalance regions
- `[GET] /api/regions/assignment/:accountId` - Get account assignment
- `[GET] /api/regions/available` - Get available regions
- `[DELETE] /api/regions/assignment/:accountId` - Remove assignment

#### IP Pool Management
- `[GET] /api/ip-pools` - List IP pools
- `[GET] /api/ip-pools/:id` - Get IP pool
- `[POST] /api/ip-pools` - Create IP pool
- `[PUT] /api/ip-pools/:id` - Update IP pool
- `[DELETE] /api/ip-pools/:id` - Delete IP pool
- `[GET] /api/ip-pools/:id/sessions` - Get pool sessions
- `[GET] /api/ip-pools/:id/logs` - Get pool logs
- `[POST] /api/ip-pools/:id/health-check` - Run health check
- `[POST] /api/ip-pools/:id/rotate` - Rotate IP

---

### 17. SHIPPING & LOGISTICS ROUTES

#### GHN Shipping (`/api/shipping/ghn`)
- `[POST] /api/shipping/ghn/create-order` - Create GHN shipping order
- `[GET] /api/shipping/ghn/track/:orderCode` - Track shipment
- `[POST] /api/shipping/ghn/calculate-fee` - Calculate shipping fee

#### ViettelPost (`/api/viettelpost`)
- `[POST] /api/viettelpost/create-order` - Create ViettelPost order
- `[GET] /api/viettelpost/track/:orderCode` - Track shipment
- `[POST] /api/viettelpost/calculate-fee` - Calculate shipping fee

#### ViettelPost Webhooks (`/api/webhooks`)
- `[POST] /api/webhooks/viettelpost` - ViettelPost webhook endpoint

---

### 18. REVIEWS & RATINGS ROUTES

#### Review Management
- `[GET] /api/reviews` - List reviews
- `[POST] /api/reviews` - Create review
- `[PUT] /api/reviews/:id` - Update review
- `[DELETE] /api/reviews/:id` - Delete review

#### Review Seeding (`/api/review-seeding`)
- `[POST] /api/review-seeding/generate` - Generate seed reviews
- `[POST] /api/review-seeding/bulk-create` - Bulk create reviews

#### Admin Reviews (`/api/admin/reviews`)
- `[GET] /api/admin/reviews` - List all reviews
- `[PUT] /api/admin/reviews/:id` - Update review
- `[DELETE] /api/admin/reviews/:id` - Delete review
- `[POST] /api/admin/reviews/bulk-approve` - Bulk approve reviews
- `[POST] /api/admin/reviews/bulk-delete` - Bulk delete reviews

#### Seller Ratings (`/api/seller-ratings`)
- `[GET] /api/seller-ratings` - List seller ratings
- `[POST] /api/seller-ratings` - Create seller rating
- `[GET] /api/seller-ratings/:sellerId` - Get seller rating

---

### 19. SETTINGS & CONFIGURATION ROUTES

#### Shop Settings (`/api/admin/shop-settings`)
- `[GET] /api/admin/shop-settings` - Get shop settings
- `[PUT] /api/admin/shop-settings/:id` - Update shop settings
- `[POST] /api/admin/shop-settings` - Create shop settings
- `[POST] /api/admin/shop-settings/upload-image` - Upload shop image
- `[DELETE] /api/admin/shop-settings/delete-image` - Delete shop image

#### Shop Info (`/api/shop-info`)
- `[GET] /api/shop-info` - Get public shop information

#### Payment Gateway Settings
- `[GET] /api/payment-settings` - Get payment settings
- `[PUT] /api/payment-settings` - Update payment settings

#### Cookie Management (`/api/cookie-profiles`)
- `[GET] /api/cookie-profiles` - List cookie profiles
- `[POST] /api/cookie-profiles` - Create cookie profile
- `[PUT] /api/cookie-profiles/:id` - Update cookie profile
- `[DELETE] /api/cookie-profiles/:id` - Delete cookie profile

#### Theme Management (`/api/themes`)
- `[GET] /api/themes` - List themes
- `[POST] /api/themes` - Create theme
- `[PUT] /api/themes/:id` - Update theme
- `[DELETE] /api/themes/:id` - Delete theme

#### Template Management (`/api/templates`)
- `[GET] /api/templates` - List templates
- `[POST] /api/templates` - Create template
- `[PUT] /api/templates/:id` - Update template
- `[DELETE] /api/templates/:id` - Delete template

#### Invoice Templates (`/api/invoice-templates`)
- `[GET] /api/invoice-templates` - List invoice templates
- `[POST] /api/invoice-templates` - Create invoice template
- `[PUT] /api/invoice-templates/:id` - Update invoice template
- `[DELETE] /api/invoice-templates/:id` - Delete invoice template

#### Invoice (`/api/invoice`)
- `[POST] /api/invoice/generate` - Generate invoice
- `[GET] /api/invoice/:orderId` - Get invoice by order ID
- `[POST] /api/invoice/send` - Send invoice via email/messenger

#### Lunar Calendar
- `[GET] /api/lunar-calendar/date/:date` - Get lunar calendar for date
- `[GET] /api/lunar-calendar/month/:year/:month` - Get lunar month

---

### 20. BOT CONFIGURATION & MANAGEMENT ROUTES

#### Bot Config (`/api/bot-config`)
- `[GET] /api/bot-config/config/:pageId` - Get bot configuration
- `[POST] /api/bot-config/config/invalidate-cache` - Invalidate config cache

#### Bot Customer (`/api/bot/customer`)
- `[GET] /api/bot/customer/:customerId` - Get customer bot data
- `[PUT] /api/bot/customer/:customerId` - Update customer bot data

#### Bot Events
- `[POST] /api/bot/events/track` - Track bot event

#### Bot Cron
- `[POST] /api/bot/cron/run` - Run bot cron job

#### Bot Tier (`/api/bot/tier`)
- `[GET] /api/bot/tier/calculate/:customerId` - Calculate customer tier
- `[PUT] /api/bot/tier/:customerId` - Update customer tier

---

### 21. CAMPAIGN MANAGEMENT ROUTES

#### Campaigns (`/api/campaigns`)
- `[GET] /api/campaigns` - List customer campaigns
- `[GET] /api/campaigns/:id` - Get campaign details
- `[POST] /api/campaigns/:id/participate` - Participate in campaign

#### Admin Campaigns (`/api/admin`)
- `[GET] /api/admin/admin-campaigns` - List admin campaigns
- `[GET] /api/admin/admin-campaigns/:id` - Get campaign
- `[POST] /api/admin/admin-campaigns` - Create campaign
- `[PATCH] /api/admin/admin-campaigns/:id` - Update campaign
- `[DELETE] /api/admin/admin-campaigns/:id` - Delete campaign
- `[GET] /api/admin/admin-campaigns/:id/participations` - Get participations
- `[PATCH] /api/admin/admin-campaigns/:id/status` - Update campaign status

#### Admin OAuth (`/api/admin`)
- `[GET] /api/admin/oauth/status` - Get OAuth status
- `[GET] /api/admin/oauth/stats` - Get OAuth statistics

---

### 22. STOREFRONT ROUTES

#### Storefront Configuration
- `[GET] /api/storefront/config` - Get storefront configurations
- `[POST] /api/storefront/config` - Create storefront config
- `[GET] /api/storefront/config/:name` - Get specific config
- `[PUT] /api/storefront/config/:id` - Update config

#### Public Storefront
- `[GET] /api/storefront/public/:name` - Get public storefront

---

### 23. BOOKS ECOSYSTEM ROUTES

#### Book Sellers (`/api/book-sellers`)
- `[GET] /api/book-sellers` - List book sellers
- `[POST] /api/book-sellers` - Create book seller
- `[PATCH] /api/book-sellers/:id` - Update book seller
- `[DELETE] /api/book-sellers/:id` - Delete book seller

#### Book Customers (`/api/book-customers`)
- `[GET] /api/book-customers` - List book customers
- `[POST] /api/book-customers` - Create book customer
- `[PATCH] /api/book-customers/:id` - Update book customer
- `[DELETE] /api/book-customers/:id` - Delete book customer

#### Book Inventory (`/api/book-inventory`)
- `[GET] /api/book-inventory` - Get book inventory
- `[PUT] /api/book-inventory/:isbn` - Update book inventory

---

### 24. ADDITIONAL ROUTES

#### RASA Management (`/api/rasa-management`)
- `[GET] /api/rasa-management/models` - List RASA models
- `[POST] /api/rasa-management/train` - Train RASA model
- `[POST] /api/rasa-management/test` - Test RASA model

#### RASA Conversations (`/api/rasa`)
- `[GET] /api/rasa/conversations` - List conversations
- `[GET] /api/rasa/conversations/:id` - Get conversation

#### RASA Industry (`/api/rasa-industry`)
- `[GET] /api/rasa-industry/domains` - List industry domains
- `[POST] /api/rasa-industry/configure` - Configure industry

#### Limit Management (`/api/limits`)
- `[POST] /api/limits/check-capacity` - Check platform capacity
- `[POST] /api/limits/bulk-check` - Bulk capacity check
- `[GET] /api/limits/status` - Get limit status
- `[POST] /api/limits/clear-cache` - Clear limits cache
- `[GET] /api/limits/config` - Get limit configuration
- `[POST] /api/limits/config` - Update limit configuration
- `[GET] /api/limits/health` - Get limits health

#### Secure Addresses
- `[POST] /api/secure-addresses` - Add secure address
- `[GET] /api/secure-addresses/:affiliateId` - Get affiliate addresses
- `[POST] /api/secure-addresses/:id/hide` - Hide address
- `[GET] /api/secure-addresses/:id/decrypt` - Decrypt address
- `[GET] /api/secure-addresses/check-duplicate` - Check duplicate address

#### Discounts (`/api/discounts`)
- `[GET] /api/discounts` - List discounts
- `[POST] /api/discounts` - Create discount
- `[PUT] /api/discounts/:id` - Update discount
- `[DELETE] /api/discounts/:id` - Delete discount
- `[POST] /api/discounts/validate` - Validate discount code

#### Frontend Configuration
- `[GET] /api/frontend/:frontendId/categories` - Get frontend categories
- `[GET] /api/frontend/:frontendId/products` - Get frontend products

#### Users (`/api/users`)
- `[GET] /api/users` - List users
- `[POST] /api/users` - Create user
- `[PUT] /api/users/:id` - Update user
- `[DELETE] /api/users/:id` - Delete user

#### Dashboard
- `[GET] /api/dashboard/stats` - Get dashboard statistics

---

## NOTES

1. **Authentication Required**: Most endpoints require authentication (admin, affiliate, vendor, VIP, driver, or customer)
2. **CSRF Protection**: State-changing operations (POST, PUT, DELETE) require CSRF tokens in production
3. **Rate Limiting**: Chat endpoints have rate limiting to prevent spam
4. **OAuth Flows**: Multiple OAuth providers (Facebook, Google, Zalo, Replit, Shopee, TikTok)
5. **Real-time Features**: Webhooks for Facebook, ViettelPost, and other platforms
6. **Multi-tenant**: Support for multiple vendors, affiliates, VIP customers, and drivers
7. **E-commerce Integration**: Deep integration with Shopee and TikTok Shop platforms
8. **AI/ML Features**: RASA chatbot, AI content generation, product recommendations, RFM analysis
9. **Book Trading Platform**: Complete ISBN-based book marketplace
10. **Comprehensive Admin**: Full admin panel for managing all aspects of the platform

---

**End of API Endpoints Inventory**
