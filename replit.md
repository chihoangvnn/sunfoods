# E-Commerce Admin Dashboard & Storefront

## Overview
This project is a comprehensive e-commerce management system designed to streamline operations, enhance customer engagement, and automate social media presence. It includes features for managing products, orders, and customers, generating product landing pages and public storefronts, and integrating with chatbots. A key innovation is the "Bộ Não - Cánh Tay - Vệ Tinh" (Brain-Arms-Satellites) architecture for automated social media content distribution, particularly across Facebook. The system focuses on practical retail functionality with professional Vietnamese business compliance, aiming to be a robust solution for e-commerce management and customer engagement with market potential in Vietnam.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions
The frontend is a React-based Single Page Application (SPA) utilizing TypeScript, Vite, Wouter for routing, TanStack Query for server state management, and Shadcn/UI for components. It features a custom design system with Tailwind CSS, a natural organic color palette, Nunito Sans font, and adheres to a mobile-first responsive design approach.

### Technical Implementations
The backend is an Express.js-based REST API written in TypeScript. It employs session-based authentication with PostgreSQL session storage. The data layer uses a multi-database approach, primarily Neon serverless PostgreSQL with Drizzle ORM, and optionally Firebase Firestore.

### Deployment Architecture
The project is configured for an all-in-one VPS deployment on a single Ubuntu server. It runs both the Express backend (port 3000) for admin interface, APIs, RASA chatbot, and background jobs, and a Next.js SSR mobile frontend (port 3001) for the customer-facing storefront. PM2 manages both processes, and Nginx acts as a reverse proxy to route traffic appropriately.

### Development Workflow (Replit)
The admin interface is a separate React app (`admin-web`). For development, `admin-web` runs a Vite dev server on port 5173, proxying API requests to the Express backend running on port 3000. Production builds of the admin-web are served statically by the backend.

### Feature Specifications
- **Admin & Customer Authentication**: Role-based access control with Multi-OAuth 2.0 and CSRF protection.
- **Storefront & Landing Page Generation**: Dynamic storefronts and customizable product landing pages.
- **Social Media Integration**: Multi-platform management, including the "Bộ Não - Cánh Tay - Vệ Tinh" architecture for automated Facebook content distribution.
- **Chatbot Integration**: RASA chatbot optimized for Vietnamese, with automatic Facebook Messenger integration.
- **Intelligent Customer Profile Management**: Two-tier profile status with admin-editable fields.
- **Automatic Facebook Messenger Order Notifications**: Automated order status change notifications.
- **Vietnamese Books Management System**: ISBN-based tracking, price comparison, and hierarchical category management.
- **International Payment Gateway System**: Comprehensive multi-provider payment processing.
- **POS Enhancement System**: Vietnamese retail POS features including keyboard shortcuts, barcode scanner, decimal quantity, and receipt printing.
- **Driver & Delivery Management System**: Complete driver and delivery operations platform.
- **Shop Settings Management System**: Centralized configuration management with admin UI.
- **Invoice Generation & Auto-Send System**: Automated invoice generation and delivery via Facebook Messenger, including QR banking codes.
- **Invoice Designer System**: Visual invoice design interface for admins with customization options and Cloudinary integration.
- **Order Tagging & Source Tracking System**: Comprehensive order tagging with automatic source identification.
- **Phone Number Normalization System**: Unified phone number normalization for Vietnamese formats.
- **IP Pool Management System**: Manages multiple IP sources for the "Brain-Arms-Satellites" architecture.
- **Vendor/Consignment Management System**: Platform for consignment sales, including automated order assignment and financial management.
- **Customer Voucher & Discount System**: Comprehensive voucher management and a Viral Marketing Campaign system.
- **Vendor Returns Management System**: Complete returns processing with financial refund logic.
- **Affiliate Portal System**: Tier-based commission platform with affiliate APIs.
- **GHN Shipping Integration**: Complete integration with Giao Hàng Nhanh (GHN) for Vietnamese shipping.
- **Web Push Notifications System**: Real-time browser notifications for vendor alerts.

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
- **Cloudinary**: Image upload and management.
- **BullMQ**: Job queue for background processing.
- **web-push**: Library for sending web push notifications.
- **Giao Hàng Nhanh (GHN)**: Vietnamese shipping provider.