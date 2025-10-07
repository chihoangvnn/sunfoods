# E-Commerce Admin Dashboard & Storefront

## Overview
This project is a comprehensive e-commerce management system designed to streamline operations, enhance customer engagement, and automate social media presence. It includes features for managing products, orders, and customers, generating product landing pages and public storefronts, and integrating with chatbots. A key innovation is the "Bộ Não - Cánh Tay - Vệ Tinh" (Brain-Arms-Satellites) architecture for automated social media content distribution, particularly across Facebook. The system focuses on practical retail functionality with professional Vietnamese business compliance, aiming to be a robust solution for e-commerce management and customer engagement.

## User Preferences
Preferred communication style: Simple, everyday language.

## Recent Changes (October 2025)
### Production Build Fixes for VPS Deployment (Latest - October 7, 2025)
- **Backend Build Fixed**: 
  - Replaced `tsc` with `esbuild` for faster, more reliable builds (6s vs 30s+ timeout)
  - Changed esbuild output from ESM to **CommonJS format** (`--format=cjs`) for Express compatibility
  - Removed `"type": "module"` from package.json (source uses ESM, build outputs CommonJS)
  - Updated @types/node from 20.16.11 to ^20.19.0 to fix peer dependency conflict with vite@7.1.9
  - **CRITICAL**: Moved esbuild from devDependencies to dependencies for production install compatibility
- **Monorepo Package Management**:
  - Created `pnpm-workspace.yaml` for proper pnpm workspace support
  - Added explicit port configuration: backend (3000), mobile (3001)
- **PM2 Production Config**: ecosystem.config.js uses `npm start` (production builds) for both apps
- **Status**: ✅ Backend builds successfully to dist/index.js (CommonJS), ready for VPS deployment

### Modified API-First Monorepo Restructuring
- **Architecture Change**: Migrated from single-app structure to Modified API-First monorepo for VPS 2GB RAM compatibility
- **New Structure**:
  - `backend/` - Express.js API server (port 3000) + serves admin static files from `/adminhoang`
  - `admin-web/` - React dashboard (Vite build → backend/public/admin/)
  - `customer-mobile/` - Next.js SSR storefront (port 3001)
- **Package Management**: Used pnpm for dependency installation (npm crashed with esbuild SIGSEGV error)
- **ESM Compatibility**: Fixed `__dirname` usage with `fileURLToPath(import.meta.url)` for ES modules
- **path-to-regexp v8**: Updated to named imports `import { pathToRegexp }` for API pattern matching
- **Deployment Configs**: Updated ecosystem.config.js, DEPLOY.md, QUICK_DEPLOY.md for new structure
- **Workflow**: Backend API running on port 3000, all health checks passing
- **Status**: ✅ Monorepo restructuring complete, backend operational, all APIs working

### Complete Schema Generation & Database Fixes
- **134 Tables Schema**: Automatically generated complete Drizzle schema from database introspection using information_schema
- **Column Naming Fixed**: Corrected all camelCase/snake_case mismatches (avgResponseTime → avg_response_time, scheduledTime → scheduled_time, etc.)
- **Orders API Fixed**: Corrected `orders.userId` field references (was incorrectly using `customerId`) in 16 locations across storage.ts
- **Redis Graceful Degradation**: Implemented graceful error handling for Redis connections; system degrades gracefully without cache/queue functionality
- **Frontend Import Fixes**: Fixed schema import naming (insertCustomerSchema → insertCustomersSchema)
- **Production Status**: All critical APIs verified working (GET /api/orders returns HTTP 200 with valid data, GET /api/books, /api/admin/me, /api/dashboard/stats all functional)
- **Dead Code Cleanup**: Commented out services referencing non-existent tables (secure-address-service, smart-search, viettelpost-shipping, abebooks, vendor-returns, faq-library)

## System Architecture

### UI/UX Decisions
The frontend is a React-based Single Page Application (SPA) utilizing TypeScript, Vite, Wouter for routing, TanStack Query for server state management, and Shadcn/UI for components. It features a custom design system with Tailwind CSS, a natural organic color palette, Nunito Sans font, and adheres to a mobile-first responsive design approach.

### Technical Implementations
The backend is an Express.js-based REST API written in TypeScript. It employs session-based authentication with PostgreSQL session storage. The data layer uses a multi-database approach, primarily Neon serverless PostgreSQL with Drizzle ORM, and optionally Firebase Firestore.

### Deployment Architecture
**All-in-One VPS Deployment:** The project is configured for deployment on a single VPS server (Ubuntu, 2+ cores, 2GB+ RAM) with both backend and mobile frontend running on the same machine:
- **Backend Express** (port 3000): Admin interface at `/adminhoang`, REST APIs at `/api/*`, RASA chatbot, background jobs
- **Mobile Next.js SSR** (port 3001): Customer-facing storefront with server-side rendering
- **PM2 Process Manager**: Manages both processes with auto-restart and clustering
- **Nginx Reverse Proxy**: Routes traffic - `/adminhoang` and `/api/*` to backend (3000), all other routes to mobile (3001)
- **Deployment Files**: `ecosystem.config.js` (PM2 config), `nginx.conf.template` (Nginx config), `.env.example` (environment variables), `DEPLOY.md` (step-by-step deployment guide)
- **Build Commands**: `npm run build:all` builds both apps, `npm run start:prod` starts PM2 processes

### Feature Specifications
- **Admin & Customer Authentication**: Role-based access control (RBAC) for various admin and customer roles. Includes a robust Multi-OAuth 2.0 system integrating Google, Facebook, Zalo, and Replit, with features like automatic profile enrichment, unified API endpoints, and CSRF protection.
- **Storefront & Landing Page Generation**: Dynamic storefronts and customizable product landing pages.
- **Social Media Integration**: Multi-platform social media management, notably Facebook integration with the "Bộ Não - Cánh Tay - Vệ Tinh" architecture for automated content distribution to over 1000 Facebook pages, including a Facebook Apps Manager and an Auto-Posting System.
- **Chatbot Integration**: RASA chatbot for customer support and product recommendations, optimized for Vietnamese, with automatic Facebook Messenger integration, multi-fanpage configuration, and automatic tagging of bot-created orders. Includes auto-profile enrichment and personalized Vietnamese greetings.
- **Intelligent Customer Profile Management**: Two-tier profile status ('incomplete'/'complete'), with admin-editable fields for gender, addresses, and credit limits.
- **Automatic Facebook Messenger Order Notifications**: Automated order status change notifications.
- **Vietnamese Books Management System**: ISBN-based book tracking, price comparison, AbeBooks integration, and hierarchical category management.
- **International Payment Gateway System**: Comprehensive multi-provider payment processing (Stripe, PayPal, Apple Pay, Google Pay, Klarna, Braintree/Venmo, Shopify Pay) with encrypted credential storage.
- **POS Enhancement System**: Vietnamese retail POS features including keyboard shortcuts, barcode scanner integration, decimal quantity support, KPOS ZY307 receipt printing, and a 3-tab navigation for sales, POS orders, and real-time Facebook Messenger support chat.
- **Driver & Delivery Management System**: Complete driver and delivery operations platform.
- **Shop Settings Management System**: Centralized configuration management with admin UI.
- **Invoice Generation & Auto-Send System**: Automated invoice generation and delivery via Facebook Messenger, including QR banking codes.
- **Invoice Designer System (Self-Service Customization)**: Visual invoice design interface for admins, allowing customization of appearance, including color schemes, fonts, layout, QR code settings, and logo upload with Cloudinary integration.
- **Order Tagging & Source Tracking System**: Comprehensive order tagging with automatic source identification and universal decimal quantity support.
- **Phone Number Normalization System**: Unified phone number normalization for Vietnamese formats.
- **IP Pool Management System**: Manages multiple IP sources for the "Brain-Arms-Satellites" architecture, including health scoring and rotation.
- **Vendor/Consignment Management System**: Platform for consignment sales, including automated order assignment, financial management, and masked customer data for privacy.
- **Customer Voucher & Discount System**: Comprehensive voucher management (claim, view, redeem) and a Viral Marketing Campaign system with share-to-earn mechanics, Facebook Graph API verification, and an auto-reward system.
- **Vendor Returns Management System**: Complete returns processing with financial refund logic for different payment models and an admin approval workflow.
- **Affiliate Portal System**: Tier-based commission platform with affiliate APIs, commission tiers, share rate limiting, and privacy protection for customer data.
- **GHN Shipping Integration**: Complete integration with Giao Hàng Nhanh (GHN) for Vietnamese shipping, including API wrapper, webhook status updates, and label generation.
- **Web Push Notifications System**: Real-time browser notifications for vendor alerts (new order, return request, low stock, payment reminder) with VAPID authentication and subscription management.

## External Dependencies

### Database Services
- **Neon Database**: Serverless PostgreSQL hosting.
- **Firebase**: Alternative NoSQL database.

### Payment Integration
- **Bank Transfer Support**: Vietnamese bank integration.
- **Stripe, PayPal, Apple Pay, Google Pay, Klarna, Braintree/Venmo, Shopify Pay**: International payment gateways.

### Social Media APIs
- **Facebook Graph API**: Page management, posting, analytics.
- **Instagram Basic Display API**: Account connection and metrics.
- **Twitter API**: Account management and posting.

### Development & Deployment
- **Vercel**: Serverless deployment.
- **Vite**: Development server and build optimization.
- **TypeScript**: Compile-time type checking.

### UI & Component Libraries
- **Radix UI**: Accessible component primitives.
- **Lucide React**: Icon library.
- **Recharts**: Data visualization.
- **React Hook Form**: Form state management.
- **Shadcn/UI**: Reusable UI components.
- **Tailwind CSS**: Utility-first CSS framework.

### Third-party Services
- **Google Fonts**: Typography loading.
- **RASA Framework**: Open-source chatbot framework.
- **ZXing library**: Barcode scanning.
- **Cloudinary**: Image upload and management (for Invoice Designer).
- **BullMQ**: Job queue for background processing (for Viral Marketing Campaign system).
- **web-push**: Library for sending web push notifications.
- **Giao Hàng Nhanh (GHN)**: Vietnamese shipping provider.