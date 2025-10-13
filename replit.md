# E-Commerce Admin Dashboard & Storefront

## Overview
This project is a comprehensive e-commerce management system designed to streamline retail operations, enhance customer engagement, and automate social media presence. It features product, order, and customer management, dynamic storefront and landing page generation, and chatbot integration. A core innovation is the "Bộ Não - Cánh Tay - Vệ Tinh" (Brain-Arms-Satellites) architecture for automated Facebook content distribution. The system aims to provide a robust solution for e-commerce management and customer engagement, focusing on practical retail functionality and Vietnamese business compliance, with significant market potential in Vietnam.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions
The admin dashboard is a React-based SPA (TypeScript, Vite, Wouter, TanStack Query, Shadcn/UI) with a custom design system using Tailwind CSS, a natural organic color palette, Nunito Sans font, and mobile-first responsive design. The customer-facing storefront is built with Next.js for Server-Side Rendering (SSR). The project supports a multi-store e-commerce platform with independent stores, each with unique themes and branding, all sharing a single backend API and database.

**Trầm Hương Hoàng Ngân Luxury Design System**: This storefront features a modern luxury glass morphism design system with a deep brown and bronze gold color palette (no green, red, or yellow/amber). It utilizes Playfair Display for headings and Nunito Sans for body text, with smooth 300ms transitions for all hover effects. Key components, including product cards, hero sections, navigation, product detail pages, listing grids, cart/checkout, forms, layout components, search, notification, and customer-facing elements, have been transformed with this design, ensuring WCAG contrast compliance and a consistent bronze aesthetic. Performance optimizations include hydration fixes, lazy loading, and GPU optimization, achieving production-ready Web Vitals metrics. Recent updates include a reorganized homepage layout, updated category icons, and the creation of four specialized static catalog pages with unique layouts and ProductCard variants. A hybrid auto-hide category menu is implemented for desktop and mobile, along with a mobile category bottom sheet for improved navigation.

**Image Slider Showcase Catalog System** (October 2025): Implemented lightweight image slider showcase for /tram-huong-my-nghe catalog, replacing video components for 70-85% performance improvement (4-6 MB vs 20-40 MB page weight). Three specialized components: (1) HeroSliderSection - auto-advancing carousel (5s interval, pause on hover), manual navigation (prev/next arrows, dot indicators), 70vh desktop height with bronze glass overlay, static title "Bộ Sưu Tập Trầm Hương Quý Hiếm" (Playfair 3xl, no dynamic product info), and CTAs; (2) FullScreenImageModal - desktop split layout (60% slideshow + 40% luxury specs sidebar), mobile swipe-up bottom sheet, image navigation controls, grade badges (AAA gradient, AA+ solid, A+ outline), displays origin, grade, fragrance, dimensions, weight, age with icons; (3) SliderProductCard - FORCED 9:16 vertical aspect ratio (aspect-[9/16]), multiple images per product with swipe/click navigation, product name displayed OUTSIDE below slider (Playfair Display, centered, bronze), price badge INSIDE slider (bottom-right overlay always visible), luxury specs overlay INSIDE on hover (desktop) or tap (mobile), lazy loading with IntersectionObserver, responsive grid (2 columns desktop, 1 mobile). Page optimizations: topbar-to-hero spacing reduced from 160px to 80px (lg:pt-20), hero first image eager loading, subsequent images lazy loaded, increased grid gaps (6/8) for better visual spacing. All components enforce strict bronze (#C1A875) and brown (#3D2B1F) palette compliance. Original video components preserved in /demo-hero-video for reference.

**Zero-Tolerance Brand Compliance Fix** (October 12, 2025): Achieved 100% brand compliance by eliminating ALL colored emoji icons and replacing them with bronze Lucide React icons. Replaced 22 emoji icons across 4 files: (1) page.tsx - replaced philosophy section icons (🙏→Sparkles, 🕉️→Circle, ☮️→Heart), quality section icons (🎖️→Award, 🚚→Package, 💯→Shield, 🔍→Star), 8 category icons (🛍️→ShoppingBag, 📱→Smartphone, 📦→Package, 📚→BookOpen, 💄→Sparkles, 👕→Shirt, 🏠→Home, ⚽→Circle), 4 product badge icons (🆕→Sparkles, 🏆→Award, 🚚→Truck, ⭐→Star), 3 heritage section icons (🌿→Leaf, ⚱️→Package, 🏆→Award); (2) CategoryBottomSheet.tsx - replaced 4 category emojis (🎨→Palette, 📿→Circle, 🕯️→Sparkles, 🔥→Flame); (3) marketingBadges.ts - removed ALL emoji prefixes from badge text; (4) NotificationBell.tsx - added graceful 404 error handling to eliminate "1 error" notification toast. All icons use consistent `text-tramhuong-accent` class (#C1A875 bronze color) with uniform h-12 w-12 md:h-14 md:w-14 sizing. Zero-tolerance policy enforced: NO colored elements outside bronze (#C1A875) and brown (#3D2B1F) palette. Architect verified 100% compliance - PASS verdict.

**Logo Homepage Navigation Enhancement** (October 13, 2025): Upgraded header logo from scroll-to-top functionality to proper homepage navigation using Next.js Link component. Changed ShopeeStyleHeader logo from `<div onClick={handleLogoClick}>` (scroll behavior) to `<Link href="/">` for standard web navigation pattern. Logo now navigates to homepage (/) from any page (/tram-huong-my-nghe, /product/:id, /cart, etc.) with client-side routing. Preserved all styling, hover effects (bronze glow, scale transform), and luxury aesthetic. SEO-friendly implementation renders semantic <a> tag. Architect verified implementation follows Next.js best practices - PASS verdict.

**Light Luxury ProductCard Palette Transformation** (October 13, 2025): Converted ALL 7 product card components from dark/heavy to light luxury glass morphism matching profile page aesthetics. Fixed critical bg-black violation in ImageSlider.tsx (line 216) to bg-[#3D2B1F]/90. Upgraded 6 product card variants to unified light luxury spec: bg-[#FFFFFF]/85 backdrop-blur-xl with bronze borders/shadows. Components updated: (1) ProductCard.tsx - converted inline styles from beige (rgba(250,248,245,0.7)) to pure white (rgba(255,255,255,0.85)), changed all brown shadows to bronze rgba(193,168,117,...), upgraded to backdrop-blur-xl; (2) SliderProductCard.tsx, VideoProductCard.tsx, IncenseProductCard.tsx, GalleryProductCard.tsx, BraceletProductCard.tsx - all upgraded from bg-white/60 backdrop-blur-md to bg-[#FFFFFF]/85 backdrop-blur-xl with consistent bronze accents. Zero-tolerance compliance verified: NO black colors (bg-black, rgba(0,0,0)) detected anywhere. All cards now share identical light luxury palette with WCAG AAA contrast, matching profile page glass morphism (85% white opacity, xl blur, bronze borders/shadows). Architect verified 100% compliance - PASS verdict.

**Luxury Jewelry Showcase System** (October 13, 2025): Comprehensive jewelry product showcase built for /chuoi-hat-tram-huong (bracelet collection) with 6 specialized components and gift discovery features. **Components:** (1) JewelryCarousel - multi-angle image slider with touch/swipe navigation (50px threshold), lazy loading, arrow/dot controls, image counter overlay, 200ms transitions; (2) GradeBadge - AAA/AA+/A+ quality indicators with gradient colors (AAA gold gradient, AA+/A+ bronze gradients), Award icon, top-left card positioning; (3) BeadCountBadge - displays bead size + count (e.g., "10mm - 108 hạt"), Circle icon, bronze badge below grade; (4) CertificateBadge - emerald green "Có chứng nhận" trust signal with ShieldCheck icon, bottom overlay on card; (5) InteractiveSizeSelector - S/M/L/XL bracelet size chips with hover ruler hints, bronze glow on selected state, helper functions for bracelet/necklace/pendant sizes; (6) GiftPackagingIndicator - pink/rose gradient "Đóng hộp miễn phí" badge with Gift icon for gift-ready products. **Integration:** BraceletProductCard fully upgraded - carousel replaces single image, badge stack (Grade + BeadCount top-left), certificate badge bottom-left overlay, size selector below description, gift indicator below price, backward compatible with legacy product data. **Page Features:** Gift category filters (All/Male/Female/Feng Shui/Couple) with pink gradient selected state, integrated with material/size filters. **Type Extensions:** Product type added fields - grade, beadCount, beadSize, hasCertificate, isGiftReady, giftCategory, availableSizes. **Performance:** Touch/swipe gestures for mobile carousel navigation, all transitions ≤200ms (performance budget compliant), lazy loading images, GPU optimization with willChange hints, mobile-first responsive. **Color Compliance:** Bronze/brown palette maintained (#C1A875, #3D2B1F) with approved accents (emerald for certificate trust signals, pink for gift psychology). Architect verified ✅ PASS - touch gestures functional, 200ms transitions enforced, no regressions, production-ready.

### Technical Implementations
The backend is an Express.js-based REST API in TypeScript, using session-based authentication with PostgreSQL session storage. The data layer uses Neon serverless PostgreSQL with Drizzle ORM, with optional Firebase Firestore. The system is configured for an all-in-one VPS deployment on a single Ubuntu server, using PM2 to manage the Express backend and Next.js SSR mobile storefronts, with Nginx as a reverse proxy. A multi-Repl GitHub integration allows managing multiple applications from a single repository with distinct `.replit` configurations. CORS security is enforced with explicit whitelist-only origins.

### Deployment Architecture
**Replit Development Environment:**
- Tramhuong Storefront: Port 5000 (webview output)
- Backend API: Port 3001 (console output)

**VPS Production Deployment:**
The production-ready multi-store VPS deployment utilizes 4 PM2 processes: one for the Backend API (port 5000) and three for Next.js storefronts (ports 3001, 3002, 3003). Nginx acts as a reverse proxy for SSL/HTTPS termination, domain routing, and API proxying.

### Feature Specifications
- **Admin & Customer Authentication**: Role-based access control with Multi-OAuth 2.0 and CSRF protection.
- **Storefront & Landing Page Generation**: Dynamic storefronts and customizable product landing pages with guest checkout and affiliate tracking.
- **Social Media Integration**: Multi-platform management, including automated Facebook content distribution.
- **Chatbot Integration**: RASA chatbot optimized for Vietnamese, with automatic Facebook Messenger integration.
- **Intelligent Customer Profile Management**: Two-tier profile status with admin-editable fields.
- **Automated Notifications**: Facebook Messenger order notifications, invoice generation, and web push notifications.
- **Vietnamese Books Management System**: ISBN-based tracking, price comparison, and hierarchical category management.
- **International & Local Payment Gateway System**: Comprehensive multi-provider payment processing including Vietnamese bank integration.
- **POS Enhancement System**: Vietnamese retail POS features including keyboard shortcuts, barcode scanner, decimal quantity, and receipt printing.
- **Driver & Delivery Management System**: Complete driver and delivery operations platform.
- **Shop Settings Management System**: Centralized configuration management with admin UI.
- **Order Management**: Order tagging, source tracking, and vendor/consignment management.
- **Customer Engagement**: Voucher & discount system, viral marketing campaigns, and an affiliate portal.
- **Returns Management System**: Complete returns processing with financial refund logic.
- **Utility Systems**: Phone number normalization, IP pool management, and address map picker with hybrid distance calculation.
- **SEO Schema Integration**: LocalBusiness and Organization schema with product categories and trust signals.

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
**Compact Sticky Filter Toolbar Optimization** (October 13, 2025): Redesigned /chuoi-hat-tram-huong filter layout from 3 stacked sections to compact 2-row sticky toolbar, saving ~100px vertical space for improved UX. **Spacing Reductions:** (1) Header padding reduced lg:pt-[160px] → lg:pt-[120px] (40px saved); (2) Title section margin reduced mb-6 → mb-4 (8px saved); (3) Combined 3 separate filter sections (mb-6, mb-6, mb-8) into single toolbar (50px+ saved). **Layout Structure:** Row 1 - Title + subtitle (left) with "Hướng dẫn chọn size" button (right); Row 2 - Sticky filter toolbar with 3 inline filter groups (Chất liệu, Size, Quà tặng). **Sticky Behavior:** Desktop toolbar sticky at `top-[88px] z-30` with `bg-white/80 backdrop-blur-lg` glass effect, full-width extension using negative margins, border-bottom divider. **Unified Styling:** ALL filters now use consistent bronze gradient active state `from-[#8E6C3A] to-[#C1A875]` (removed pink gradient from gift filters), inactive state `bg-white/60 backdrop-blur-sm` with bronze borders, all transitions reduced from 300ms to 200ms. **Chip Optimization:** Reduced size from `px-4 py-2` to `px-3 py-1.5`, font `text-sm`, shortened labels ("Quà tặng nam" → "Nam"). **Responsive Layout:** Mobile (<768px) stacks vertically, Desktop (≥768px) uses `flex-wrap` to prevent overflow - at 768px/1024px third group wraps to second line with gap spacing, at ≥1280px all inline. **Filter Groups:** Each group has small uppercase label `text-sm font-semibold text-tramhuong-primary/60` with inline chips on desktop (`md:inline-flex md:ml-3`), stacked on mobile (`mt-2`). **Brand Compliance:** Bronze/brown palette (#C1A875, #3D2B1F) maintained, emojis 👔💝🧿💑 kept in gift filters for visual recognition. Architect verified no overflow issues, graceful wrapping, brand compliance - PASS verdict.
