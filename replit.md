# E-Commerce Admin Dashboard & Storefront

## Overview
This project is a comprehensive e-commerce management system designed to streamline retail operations, enhance customer engagement, and automate social media presence. It features product, order, and customer management, dynamic storefront and landing page generation, and chatbot integration. A core innovation is the "Bộ Não - Cánh Tay - Vệ Tinh" (Brain-Arms-Satellites) architecture for automated Facebook content distribution. The system aims to provide a robust solution for e-commerce management and customer engagement, focusing on practical retail functionality and Vietnamese business compliance, with significant market potential in Vietnam.

## User Preferences
Preferred communication style: Simple, everyday language.

## Recent Changes

### October 11, 2025 - Multi-Repl GitHub Integration (Phase 4)
- **GitHub Repository**: Created chihoangvnn/sun-foods-multi-store for multi-app import
- **CORS Security Fix**: Removed wildcard regex patterns, enforced explicit whitelist-only (prevents CSRF attacks)
- **Multi-Repl Setup**: 4 separate Replit Apps (1 backend + 3 frontends) from single GitHub repo
- **Import Guide**: REPLIT_MULTI_APP_SETUP.md with step-by-step Repl setup instructions
- **Workflow Configs**: .replit.backend, .replit.sunfoods, .replit.tramhuong, .replit.nhangsach
- **Git Sync Guide**: GIT_SYNC_MULTI_REPL.md with best practices to avoid conflicts
- **Environment Security**: FRONTEND_ORIGINS required for CORS, documented in backend/.env.example
- **Development Flow**: 1 repo → 4 Repls, each Repl focuses on 1 folder (backend/, customer-mobile/, customer-tramhuong/, customer-nhangsach/)

## System Architecture

### UI/UX Decisions
The admin dashboard is a React-based SPA (TypeScript, Vite, Wouter, TanStack Query, Shadcn/UI) with a custom design system using Tailwind CSS, a natural organic color palette, Nunito Sans font, and mobile-first responsive design. The customer-facing storefront is built with Next.js for Server-Side Rendering (SSR). The project now supports a multi-store e-commerce platform with 3 independent stores, each with unique themes and branding, all sharing a single backend API and database.

### Technical Implementations
The backend is an Express.js-based REST API in TypeScript, using session-based authentication with PostgreSQL session storage. The data layer uses Neon serverless PostgreSQL with Drizzle ORM, with optional Firebase Firestore. The system is configured for an all-in-one VPS deployment on a single Ubuntu server, using PM2 to manage the Express backend and Next.js SSR mobile storefronts, with Nginx as a reverse proxy.

### Deployment Architecture
**Multi-Store VPS Deployment (Production-Ready)**:
- **4 PM2 Processes**: Backend API (port 5000) + 3 Next.js storefronts (ports 3001, 3002, 3003)
- **3 Domain Configuration**: 
  - sunfoods.vn → customer-mobile (SunFoods healthy food store)
  - tramhuonghoangngan.com → customer-tramhuong (Luxury incense store)
  - nhangsach.net → customer-nhangsach (Clean incense store)
- **Nginx Reverse Proxy**: SSL/HTTPS termination, domain routing, API proxying (/api/ → backend:5000)
- **Deployment Package**: Pre-built vps-deployment.tar.gz with backend dist/, all 3 storefront .next builds, ecosystem.config.js, nginx.conf, and .env.production.example
- **Build Process**: Backend TypeScript compilation (tsc → dist/), Next.js SSR builds for all storefronts
- **Installation**: Automated via deploy.sh or INSTALL_ON_VPS.sh with dependency installation for all 4 processes

### Feature Specifications
- **Admin & Customer Authentication**: Role-based access control with Multi-OAuth 2.0 and CSRF protection.
- **Storefront & Landing Page Generation**: Dynamic storefronts and customizable product landing pages, including public landing pages for marketing campaigns with guest checkout and affiliate tracking.
- **Social Media Integration**: Multi-platform management, including automated Facebook content distribution.
- **Chatbot Integration**: RASA chatbot optimized for Vietnamese, with automatic Facebook Messenger integration.
- **Intelligent Customer Profile Management**: Two-tier profile status with admin-editable fields.
- **Automated Notifications**: Facebook Messenger order notifications, invoice generation, and web push notifications.
- **Vietnamese Books Management System**: ISBN-based tracking, price comparison, and hierarchical category management.
- **International Payment Gateway System**: Comprehensive multi-provider payment processing.
- **POS Enhancement System**: Vietnamese retail POS features including keyboard shortcuts, barcode scanner, decimal quantity, and receipt printing.
- **Driver & Delivery Management System**: Complete driver and delivery operations platform.
- **Shop Settings Management System**: Centralized configuration management with admin UI.
- **Order Management**: Order tagging, source tracking, and vendor/consignment management.
- **Customer Engagement**: Voucher & discount system, viral marketing campaigns, and an affiliate portal.
- **Returns Management System**: Complete returns processing with financial refund logic.
- **Utility Systems**: Phone number normalization, IP pool management, and address map picker with hybrid distance calculation.

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

### Third-party Services
- **RASA Framework**: Open-source chatbot framework.
- **ZXing library**: Barcode scanning.
- **Cloudinary**: Image upload and management.
- **BullMQ**: Job queue for background processing.
- **web-push**: Library for sending web push notifications.
- **Giao Hàng Nhanh (GHN)**: Vietnamese shipping provider.
- **pigeon-maps**: Lightweight React map library for OpenStreetMap.
- **Nominatim API**: OpenStreetMap reverse geocoding.
- **OpenRouteService API**: Route-based distance calculations.