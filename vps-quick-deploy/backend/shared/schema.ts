import { pgTable, varchar, text, integer, jsonb, boolean, timestamp, numeric, serial, unique, index, uniqueIndex, bigint } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const BOOK_CONDITIONS = {
  new: { grade: 5, label: "New" },
  like_new: { grade: 4, label: "Like New" },
  very_good: { grade: 3, label: "Very Good" },
  good: { grade: 2, label: "Good" },
  acceptable: { grade: 1, label: "Acceptable" }
} as const;

export type BookCondition = keyof typeof BOOK_CONDITIONS;

export const BOOK_PRICE_SOURCES = {
  amazon: { name: "Amazon", priority: 1 },
  abebooks: { name: "AbeBooks", priority: 2 },
  ebay: { name: "eBay", priority: 3 },
  alibris: { name: "Alibris", priority: 4 },
  manual: { name: "Manual", priority: 5 }
} as const;

export type BookPriceSource = keyof typeof BOOK_PRICE_SOURCES;

export const accountGroups = pgTable("account_groups", {
  id: varchar().default(sql`gen_random_uuid()`).primaryKey(),
  name: text().notNull(),
  description: text(),
  platform: text().default('facebook').notNull(),
  priority: integer().default(1),
  weight: numeric({ precision: 5, scale: 2 }).default(1.0),
  isActive: boolean("is_active").default(true),
  formulaId: varchar("formula_id"),
  totalPosts: integer("total_posts").default(0),
  lastPostAt: timestamp("last_post_at", { mode: 'string' }),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const admins = pgTable("admins", {
  id: varchar().default(sql`gen_random_uuid()`).primaryKey(),
  email: text().notNull(),
  password: text().notNull(),
  name: text().notNull(),
  role: text().default('staff').notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  lastLoginAt: timestamp("last_login_at", { mode: 'string' }),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
  unique("admins_email_key").on(table.email),
]);

export const affiliateClicks = pgTable("affiliate_clicks", {
  id: varchar().default(sql`gen_random_uuid()`).primaryKey(),
  landingPageId: varchar("landing_page_id").notNull(),
  affiliateId: varchar("affiliate_id").notNull(),
  ip: varchar(),
  userAgent: text("user_agent"),
  device: varchar(),
  browser: varchar(),
  referrer: text(),
  converted: boolean().default(false).notNull(),
  orderId: varchar("order_id"),
  conversionValue: numeric("conversion_value", { precision: 15, scale: 2 }),
  clickedAt: timestamp("clicked_at", { mode: 'string' }).defaultNow().notNull(),
  convertedAt: timestamp("converted_at", { mode: 'string' }),
});

export const affiliateLandingPages = pgTable("affiliate_landing_pages", {
  id: varchar().default(sql`gen_random_uuid()`).primaryKey(),
  affiliateId: varchar("affiliate_id").notNull(),
  productId: varchar("product_id").notNull(),
  slug: varchar().notNull(),
  title: text().notNull(),
  template: text().default('modern').notNull(),
  colors: jsonb().default({}),
  headline: text(),
  description: text(),
  features: jsonb().default([]),
  customCta: text("custom_cta"),
  seedingEnabled: boolean("seeding_enabled").default(true).notNull(),
  fakeReviewsCount: integer("fake_reviews_count").default(50),
  fakeViewersRange: varchar("fake_viewers_range").default(100),
  showCountdown: boolean("show_countdown").default(true).notNull(),
  countdownDuration: integer("countdown_duration").default(3600),
  showSocialProof: boolean("show_social_proof").default(true).notNull(),
  showUrgency: boolean("show_urgency").default(true).notNull(),
  totalClicks: integer("total_clicks").default(0).notNull(),
  totalOrders: integer("total_orders").default(0).notNull(),
  totalRevenue: numeric("total_revenue", { precision: 15, scale: 2 }).default(0.00),
  conversionRate: numeric("conversion_rate", { precision: 5, scale: 2 }).default(0.00),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
  unique("affiliate_landing_pages_slug_key").on(table.slug),
]);

export const affiliateProductAssignments = pgTable("affiliate_product_assignments", {
  id: varchar().default(sql`gen_random_uuid()`).primaryKey(),
  affiliateId: varchar("affiliate_id"),
  assignmentType: text("assignment_type").notNull(),
  targetId: varchar("target_id").notNull(),
  commissionRate: numeric("commission_rate", { precision: 5, scale: 2 }).notNull(),
  commissionType: text("commission_type").default('percentage').notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  isPremium: boolean("is_premium").default(false).notNull(),
  maxCommissionPerOrder: numeric("max_commission_per_order", { precision: 15, scale: 2 }),
  totalSales: integer("total_sales").default(0).notNull(),
  totalCommission: numeric("total_commission", { precision: 15, scale: 2 }).default(0).notNull(),
  assignedBy: varchar("assigned_by"),
  assignedAt: timestamp("assigned_at", { mode: 'string' }).defaultNow(),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
  isDefaultAssignment: boolean("is_default_assignment").default(false).notNull(),
});

export const affiliateProductRequests = pgTable("affiliate_product_requests", {
  id: varchar().default(sql`gen_random_uuid()`).primaryKey(),
  affiliateId: varchar("affiliate_id").notNull(),
  productName: text("product_name").notNull(),
  productDescription: text("product_description"),
  productLink: text("product_link"),
  suggestedPrice: numeric("suggested_price", { precision: 15, scale: 2 }),
  categoryId: varchar("category_id"),
  status: text().default('pending').notNull(),
  requestReason: text("request_reason"),
  adminNotes: text("admin_notes"),
  approvedProductId: varchar("approved_product_id"),
  approvedCommissionRate: numeric("approved_commission_rate", { precision: 5, scale: 2 }),
  reviewedBy: varchar("reviewed_by"),
  reviewedAt: timestamp("reviewed_at", { mode: 'string' }),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const apiConfigurations = pgTable("api_configurations", {
  id: varchar().default(sql`gen_random_uuid()`).primaryKey(),
  endpoint: text().notNull(),
  method: text().default('GET').notNull(),
  description: text().notNull(),
  category: text().notNull(),
  isEnabled: boolean("is_enabled").default(true).notNull(),
  maintenanceMode: boolean("maintenance_mode").default(false).notNull(),
  maintenanceMessage: text("maintenance_message").default('API temporarily unavailable for maintenance'),
  rateLimitEnabled: boolean("rate_limit_enabled").default(false).notNull(),
  rateLimitRequests: integer("rate_limit_requests").default(100),
  rateLimitWindowSeconds: integer("rate_limit_window_seconds").default(60),
  circuitBreakerEnabled: boolean("circuit_breaker_enabled").default(false).notNull(),
  circuitBreakerThreshold: integer("circuit_breaker_threshold").default(5),
  circuitBreakerTimeout: integer("circuit_breaker_timeout").default(60),
  accessCount: integer("access_count").default(0).notNull(),
  errorCount: integer("error_count").default(0).notNull(),
  avgResponseTime: numeric("avg_response_time", { precision: 10, scale: 3 }).default(0),
  lastAccessed: timestamp("last_accessed", { mode: 'string' }),
  lastToggled: timestamp("last_toggled", { mode: 'string' }),
  lastError: timestamp("last_error", { mode: 'string' }),
  tags: jsonb().default([]),
  priority: text().default('normal').notNull(),
  owner: text(),
  requiresAuth: boolean("requires_auth").default(true).notNull(),
  adminOnly: boolean("admin_only").default(false).notNull(),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
  unique("api_configurations_endpoint_method_unique").on(table.endpoint, table.method),
]);

export const authUsers = pgTable("auth_users", {
  id: varchar().primaryKey(),
  email: varchar(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
  provider: text().default('replit'),
}, (table) => [
  unique("auth_users_email_key").on(table.email),
]);

export const bookAnalytics = pgTable("book_analytics", {
  id: varchar().default(sql`gen_random_uuid()`).primaryKey(),
  bookIsbn: varchar("book_isbn", { length: 17 }).notNull(),
  totalViews: integer("total_views").default(0),
  dailyViews: integer("daily_views").default(0),
  weeklyViews: integer("weekly_views").default(0),
  monthlyViews: integer("monthly_views").default(0),
  cartAdds: integer("cart_adds").default(0),
  purchases: integer().default(0),
  wishlistAdds: integer("wishlist_adds").default(0),
  priceChecks: integer("price_checks").default(0),
  lowestPrice: numeric("lowest_price", { precision: 10, scale: 2 }),
  highestPrice: numeric("highest_price", { precision: 10, scale: 2 }),
  averagePrice: numeric("average_price", { precision: 10, scale: 2 }),
  totalRatings: integer("total_ratings").default(0),
  averageRating: numeric("average_rating", { precision: 3, scale: 2 }),
  lastViewedAt: timestamp("last_viewed_at", { mode: 'string' }),
  lastPurchasedAt: timestamp("last_purchased_at", { mode: 'string' }),
  analyticsDate: timestamp("analytics_date", { mode: 'string' }).defaultNow(),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const bookCampaignRecipients = pgTable("book_campaign_recipients", {
  id: varchar().default(sql`gen_random_uuid()`).primaryKey(),
  campaignId: varchar("campaign_id").notNull(),
  customerId: varchar("customer_id").notNull(),
  sentAt: timestamp("sent_at", { mode: 'string' }),
  openedAt: timestamp("opened_at", { mode: 'string' }),
  clickedAt: timestamp("clicked_at", { mode: 'string' }),
  convertedAt: timestamp("converted_at", { mode: 'string' }),
  emailAddress: text("email_address").notNull(),
  deliveryStatus: text("delivery_status").default('pending').notNull(),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
  unique("book_campaign_recipients_campaign_id_customer_id_key").on(table.campaignId, table.customerId),
]);

export const bookCategories = pgTable("book_categories", {
  id: varchar().default(sql`gen_random_uuid()`).primaryKey(),
  name: varchar().notNull(),
  slug: varchar().notNull(),
  parentId: varchar("parent_id"),
  level: integer().default(0),
  sortOrder: integer("sort_order").default(0),
  description: text(),
  icon: varchar(),
  color: varchar(),
  amazonCategoryId: varchar("amazon_category_id"),
  amazonBestsellerUrl: text("amazon_bestseller_url"),
  bookCount: integer("book_count").default(0),
  isActive: boolean("is_active").default(true),
  isFeatured: boolean("is_featured").default(false),
  metaTitle: varchar("meta_title"),
  metaDescription: text("meta_description"),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const bookCategoryAssignments = pgTable("book_category_assignments", {
  id: varchar().default(sql`gen_random_uuid()`).primaryKey(),
  bookIsbn: varchar("book_isbn").notNull(),
  categoryId: varchar("category_id").notNull(),
  isPrimary: boolean("is_primary").default(false),
  assignedAt: timestamp("assigned_at", { mode: 'string' }).defaultNow(),
  assignedBy: varchar("assigned_by"),
  confidenceScore: numeric("confidence_score"),
  isAutoAssigned: boolean("is_auto_assigned").default(false),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
  unique("book_category_assignments_book_isbn_category_id_key").on(table.bookIsbn, table.categoryId),
]);

export const bookCustomers = pgTable("book_customers", {
  id: varchar().default(sql`gen_random_uuid()`).primaryKey(),
  name: text().notNull(),
  email: text().notNull(),
  phone: text(),
  avatar: text(),
  readingPreferences: jsonb("reading_preferences").default({}),
  totalSpent: numeric("total_spent", { precision: 15, scale: 2 }).default(0).notNull(),
  totalBooks: integer("total_books").default(0).notNull(),
  avgOrderValue: numeric("avg_order_value", { precision: 15, scale: 2 }).default(0).notNull(),
  lastPurchase: timestamp("last_purchase", { mode: 'string' }),
  emailSubscribed: boolean("email_subscribed").default(true).notNull(),
  smsSubscribed: boolean("sms_subscribed").default(false).notNull(),
  marketingTags: jsonb("marketing_tags").default([]),
  status: text().default('active').notNull(),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
  unique("book_customers_email_key").on(table.email),
]);

export const bookMarketingCampaigns = pgTable("book_marketing_campaigns", {
  id: varchar().default(sql`gen_random_uuid()`).primaryKey(),
  campaignName: text("campaign_name").notNull(),
  campaignType: text("campaign_type").notNull(),
  targetCriteria: jsonb("target_criteria").default({}),
  emailContent: jsonb("email_content").notNull(),
  scheduleType: text("schedule_type").default('immediate').notNull(),
  scheduledAt: timestamp("scheduled_at", { mode: 'string' }),
  triggerEvents: jsonb("trigger_events").default([]),
  status: text().default('draft').notNull(),
  targetCount: integer("target_count").default(0).notNull(),
  sentCount: integer("sent_count").default(0).notNull(),
  openCount: integer("open_count").default(0).notNull(),
  clickCount: integer("click_count").default(0).notNull(),
  conversionCount: integer("conversion_count").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const bookOrderItems = pgTable("book_order_items", {
  id: varchar().default(sql`gen_random_uuid()`).primaryKey(),
  orderId: varchar("order_id").notNull(),
  productId: varchar("product_id").notNull(),
  quantity: numeric({ precision: 10, scale: 3 }).notNull(),
  price: numeric({ precision: 15, scale: 2 }).notNull(),
  isbn: text(),
  condition: text().default('new').notNull(),
  sellerPrice: numeric("seller_price", { precision: 15, scale: 2 }).notNull(),
  marketPrice: numeric("market_price", { precision: 15, scale: 2 }),
  sourceCost: numeric("source_cost", { precision: 15, scale: 2 }),
});

export const bookOrders = pgTable("book_orders", {
  id: varchar().default(sql`gen_random_uuid()`).primaryKey(),
  total: numeric({ precision: 15, scale: 2 }).notNull(),
  status: text().default('pending').notNull(),
  paymentMethod: text("payment_method").default('cash').notNull(),
  items: integer().notNull(),
  source: text().default('admin').notNull(),
  sourceOrderId: text("source_order_id"),
  sourceReference: text("source_reference"),
  syncStatus: text("sync_status").default('manual').notNull(),
  syncData: jsonb("sync_data"),
  sourceCustomerInfo: jsonb("source_customer_info"),
  vtpOrderSystemCode: text("vtp_order_system_code"),
  vtpOrderNumber: text("vtp_order_number"),
  vtpServiceCode: text("vtp_service_code"),
  vtpStatus: text("vtp_status").default('not_shipped'),
  vtpTrackingData: jsonb("vtp_tracking_data"),
  vtpShippingInfo: jsonb("vtp_shipping_info"),
  vtpCreatedAt: timestamp("vtp_created_at", { mode: 'string' }),
  vtpUpdatedAt: timestamp("vtp_updated_at", { mode: 'string' }),
  sellerId: varchar("seller_id"),
  bookSource: text("book_source").default('local_inventory').notNull(),
  isbn: text(),
  condition: text().default('new').notNull(),
  sellerCommission: numeric("seller_commission", { precision: 15, scale: 2 }).default(0),
  bookMetadata: jsonb("book_metadata"),
  inventoryStatus: text("inventory_status").default('reserved').notNull(),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
  customerNameBook: text("customer_name_book").notNull(),
  customerEmailBook: text("customer_email_book"),
  customerPhoneBook: text("customer_phone_book").notNull(),
  customerAddressBook: text("customer_address_book"),
}, (table) => [
  unique("unique_source_order").on(table.source, table.sourceOrderId),
]);

export const bookPaymentTransactions = pgTable("book_payment_transactions", {
  id: integer().default('nextval(book_payment_transactions_id_seq').primaryKey(),
  orderId: varchar("order_id"),
  gateway: text().notNull(),
  transactionId: varchar("transaction_id").notNull(),
  amount: numeric({ precision: 15, scale: 2 }).notNull(),
  currency: varchar({ length: 3 }).default('USD').notNull(),
  status: text().default('pending').notNull(),
  paymentMethod: varchar("payment_method"),
  customerEmail: varchar("customer_email"),
  metadata: jsonb().default({}),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  completedAt: timestamp("completed_at", { mode: 'string' }),
});

export const bookPrices = pgTable("book_prices", {
  id: varchar().default(sql`gen_random_uuid()`).primaryKey(),
  bookIsbn: varchar("book_isbn").notNull(),
  source: varchar().notNull(),
  price: numeric({ precision: 10, scale: 2 }).notNull(),
  status: varchar().default('In Stock'),
  sourceUrl: varchar("source_url"),
  productId: varchar("product_id"),
  lastUpdatedAt: timestamp("last_updated_at", { mode: 'string' }).defaultNow(),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  sourceId: varchar("source_id"),
  currency: varchar({ length: 3 }).default('USD'),
  stock: integer().default(0),
  condition: varchar({ length: 20 }).default('new'),
  sellerName: varchar("seller_name", { length: 100 }),
  sellerRating: numeric("seller_rating", { precision: 3, scale: 2 }),
  deliveryTime: varchar("delivery_time", { length: 50 }),
  isCurrentPrice: boolean("is_current_price").default(true),
  priceHistory: jsonb("price_history"),
  lastChecked: timestamp("last_checked", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
  unique("book_prices_book_isbn_source_key").on(table.bookIsbn, table.source),
]);

export const bookPricingRules = pgTable("book_pricing_rules", {
  id: varchar().default(sql`gen_random_uuid()`).primaryKey(),
  ruleName: text("rule_name").notNull(),
  categoryId: varchar("category_id"),
  conditions: jsonb().default({}),
  priceAdjustment: jsonb("price_adjustment").notNull(),
  priority: integer().default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const bookSellerInventory = pgTable("book_seller_inventory", {
  id: varchar().default(sql`gen_random_uuid()`).primaryKey(),
  sellerId: varchar("seller_id").notNull(),
  productId: varchar("product_id").notNull(),
  stock: integer().default(0).notNull(),
  reservedStock: integer("reserved_stock").default(0).notNull(),
  basePrice: numeric("base_price", { precision: 15, scale: 2 }).notNull(),
  sellerPrice: numeric("seller_price", { precision: 15, scale: 2 }).notNull(),
  calculatedPrice: numeric("calculated_price", { precision: 15, scale: 2 }).notNull(),
  assignedAt: timestamp("assigned_at", { mode: 'string' }).defaultNow(),
  assignmentType: text("assignment_type").default('auto_random').notNull(),
  totalSold: integer("total_sold").default(0).notNull(),
  totalRevenue: numeric("total_revenue", { precision: 15, scale: 2 }).default(0).notNull(),
  lastSale: timestamp("last_sale", { mode: 'string' }),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
  unique("book_seller_inventory_seller_id_product_id_key").on(table.sellerId, table.productId),
]);

export const bookSellers = pgTable("book_sellers", {
  id: varchar().default(sql`gen_random_uuid()`).primaryKey(),
  sellerId: text("seller_id").notNull(),
  displayName: text("display_name").notNull(),
  businessName: text("business_name").notNull(),
  profile: jsonb().notNull(),
  tier: text().default('standard').notNull(),
  pricingTier: text("pricing_tier").default('markup_price').notNull(),
  totalSales: numeric("total_sales", { precision: 15, scale: 2 }).default(0).notNull(),
  totalOrders: integer("total_orders").default(0).notNull(),
  avgRating: numeric("avg_rating", { precision: 3, scale: 2 }).default(0).notNull(),
  responseTime: integer("response_time").default(24).notNull(),
  maxBooks: integer("max_books").default(10000).notNull(),
  currentBooks: integer("current_books").default(0).notNull(),
  autoAssignBooks: boolean("auto_assign_books").default(true).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  isTopSeller: boolean("is_top_seller").default(false).notNull(),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
  config: jsonb(),
}, (table) => [
  unique("book_sellers_seller_id_key").on(table.sellerId),
]);

export const books = pgTable("books", {
  isbn: varchar().primaryKey(),
  title: varchar().notNull(),
  author: varchar().notNull(),
  format: varchar().default('Paperback'),
  coverImageUrl: varchar("cover_image_url"),
  ranking: integer().default(999999),
  averageRating: numeric("average_rating", { precision: 3, scale: 2 }).default(0.0),
  reviewCount: integer("review_count").default(0),
  isTopSeller: boolean("is_top_seller").default(false),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
  subtitle: text(),
  publisher: varchar({ length: 255 }),
  publicationYear: integer("publication_year"),
  pages: integer(),
  language: varchar({ length: 50 }).default('English'),
  description: text(),
  coverImage: varchar("cover_image", { length: 500 }),
  genreId: varchar("genre_id", { length: 50 }),
  status: varchar({ length: 20 }).default('active'),
  isNew: boolean("is_new").default(false),
  isBestseller: boolean("is_bestseller").default(false),
  isRecommended: boolean("is_recommended").default(false),
  isFeatured: boolean("is_featured").default(false),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  seoKeywords: jsonb("seo_keywords"),
  priceRegions: jsonb("price_regions"),
  targetMarkets: jsonb("target_markets"),
  lastPriceUpdate: timestamp("last_price_update", { mode: 'string' }),
  sellerId: varchar("seller_id", { length: 50 }),
});

export const botSettings = pgTable("bot_settings", {
  id: varchar().default(sql`gen_random_uuid()`).primaryKey(),
  rasaUrl: text("rasa_url").default('http://localhost:5005').notNull(),
  webhookUrl: text("webhook_url"),
  isEnabled: boolean("is_enabled").default(true).notNull(),
  autoReply: boolean("auto_reply").default(false).notNull(),
  apiKey: text("api_key"),
  connectionTimeout: integer("connection_timeout").default(5000).notNull(),
  maxRetries: integer("max_retries").default(3).notNull(),
  lastHealthCheck: timestamp("last_health_check", { mode: 'string' }),
  healthStatus: text("health_status").default('offline').notNull(),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const campaignParticipations = pgTable("campaign_participations", {
  id: varchar().default(sql`gen_random_uuid()`).primaryKey(),
  campaignId: varchar("campaign_id").notNull(),
  customerId: varchar("customer_id").notNull(),
  shareUrl: text("share_url").notNull(),
  submittedAt: timestamp("submitted_at", { mode: 'string' }).defaultNow().notNull(),
  status: text().default('pending').notNull(),
  verificationScheduledAt: timestamp("verification_scheduled_at", { mode: 'string' }),
  lastVerifiedAt: timestamp("last_verified_at", { mode: 'string' }),
  rewardedAt: timestamp("rewarded_at", { mode: 'string' }),
  voucherId: varchar("voucher_id"),
  rejectionReason: text("rejection_reason"),
  verificationAttempts: integer("verification_attempts").default(0).notNull(),
  metadata: jsonb().default({}),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
  unique("campaign_participations_campaign_id_customer_id_key").on(table.campaignId, table.customerId),
]);

export const campaigns = pgTable("campaigns", {
  id: varchar().default(sql`gen_random_uuid()`).primaryKey(),
  name: text().notNull(),
  description: text(),
  type: text().default('share_to_earn').notNull(),
  rewardType: text("reward_type").default('voucher').notNull(),
  rewardVoucherCodeId: varchar("reward_voucher_code_id"),
  rewardPoints: integer("reward_points").default(0),
  status: text().default('draft').notNull(),
  startDate: timestamp("start_date", { mode: 'string' }).notNull(),
  endDate: timestamp("end_date", { mode: 'string' }),
  verificationDelayHours: integer("verification_delay_hours").default(24).notNull(),
  minEngagementLikes: integer("min_engagement_likes").default(0),
  minEngagementShares: integer("min_engagement_shares").default(0),
  minEngagementComments: integer("min_engagement_comments").default(0),
  requirePostStillExists: boolean("require_post_still_exists").default(true).notNull(),
  maxParticipations: integer("max_participations"),
  maxParticipationsPerCustomer: integer("max_participations_per_customer").default(1),
  shareTemplate: text("share_template"),
  requiredHashtags: jsonb("required_hashtags").default([]),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
  createdBy: varchar("created_by"),
});

export const carGroups = pgTable("car_groups", {
  id: varchar().default(sql`gen_random_uuid()`).primaryKey(),
  name: text().notNull(),
  description: text(),
  color: text().default('#3b82f6').notNull(),
  icon: text().default('car'),
  groupType: text("group_type").default('custom').notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  metadata: jsonb().default({}),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
  createdBy: varchar("created_by"),
});

export const categories = pgTable("categories", {
  id: varchar().default(sql`gen_random_uuid()`).primaryKey(),
  name: text().notNull(),
  description: text(),
  isActive: boolean("is_active").default(true).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
  industryId: varchar("industry_id").notNull(),
  consultationConfig: jsonb("consultation_config").default({}),
  consultationTemplates: jsonb("consultation_templates").default({}),
  salesAdviceTemplate: jsonb("sales_advice_template").default({}),
  isVipOnly: boolean("is_vip_only").default(false).notNull(),
});

export const categoryFaqTemplates = pgTable("category_faq_templates", {
  id: varchar().default(sql`gen_random_uuid()`).primaryKey(),
  categoryId: varchar("category_id").notNull(),
  faqId: varchar("faq_id").notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  autoInherit: boolean("auto_inherit").default(true).notNull(),
  createdBy: varchar("created_by"),
  templateNote: text("template_note"),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
  unique("category_faq_templates_category_id_faq_id_key").on(table.categoryId, table.faqId),
]);

export const categoryPriceRules = pgTable("category_price_rules", {
  id: varchar().default(sql`gen_random_uuid()`).primaryKey(),
  categoryId: varchar("category_id").notNull(),
  ruleName: varchar("rule_name").notNull(),
  ruleType: varchar("rule_type").notNull(),
  minPrice: numeric("min_price"),
  maxPrice: numeric("max_price"),
  discountPercentage: numeric("discount_percentage"),
  markupPercentage: numeric("markup_percentage"),
  conditions: jsonb(),
  priority: integer().default(0),
  isActive: boolean("is_active").default(true),
  startDate: text("start_date"),
  endDate: text("end_date"),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const chatbotConversations = pgTable("chatbot_conversations", {
  id: varchar().default(sql`gen_random_uuid()`).primaryKey(),
  customerId: varchar("customer_id"),
  sessionId: text("session_id").notNull(),
  messages: jsonb().notNull(),
  status: text().default('active').notNull(),
  satisfactionRating: integer("satisfaction_rating"),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const competitorProfiles = pgTable("competitor_profiles", {
  id: varchar().default(sql`gen_random_uuid()`).primaryKey(),
  competitorName: text("competitor_name").notNull(),
  competitorType: text("competitor_type").notNull(),
  pricingStrategy: text("pricing_strategy").notNull(),
  qualityLevel: text("quality_level").default('standard').notNull(),
  responseSpeed: text("response_speed").default('normal').notNull(),
  marketShare: numeric("market_share", { precision: 5, scale: 4 }).default(0.0500).notNull(),
  avgRating: numeric("avg_rating", { precision: 3, scale: 2 }).default(4.00).notNull(),
  totalReviews: integer("total_reviews").default(500).notNull(),
  inventorySize: integer("inventory_size").default(5000).notNull(),
  avgDiscountRate: numeric("avg_discount_rate", { precision: 5, scale: 4 }).default(0.1000).notNull(),
  priceChangeFrequency: text("price_change_frequency").default('weekly').notNull(),
  priceFlexibility: numeric("price_flexibility", { precision: 5, scale: 2 }).default(15.00).notNull(),
  specializedCategories: jsonb("specialized_categories").default([]),
  categoryPricing: jsonb("category_pricing").default({}),
  activityLevel: text("activity_level").default('moderate').notNull(),
  promotionFrequency: text("promotion_frequency").default('occasional').notNull(),
  seasonalAggressiveness: numeric("seasonal_aggressiveness", { precision: 3, scale: 2 }).default(1.50).notNull(),
  vietnameseBusinessPractices: jsonb("vietnamese_business_practices").default(sql`'{"acceptsDebt": false, "festivalDiscounts": true, "offersInstallment": false, "regionalPreferences": []}'::jsonb`),
  isActive: boolean("is_active").default(true).notNull(),
  simulationWeight: numeric("simulation_weight", { precision: 3, scale: 2 }).default(1.00).notNull(),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const consignmentRequests = pgTable("consignment_requests", {
  id: varchar().default(sql`gen_random_uuid()`).primaryKey(),
  vendorId: varchar("vendor_id").notNull(),
  productId: varchar("product_id"),
  productName: varchar("product_name").notNull(),
  productDescription: text("product_description"),
  quantity: integer().notNull(),
  proposedPrice: numeric("proposed_price", { precision: 15, scale: 2 }).notNull(),
  discountPercent: numeric("discount_percent", { precision: 5, scale: 2 }).default(0),
  attachments: jsonb().default([]),
  status: varchar().default('pending'),
  reviewerId: varchar("reviewer_id"),
  reviewerNotes: text("reviewer_notes"),
  reviewedAt: timestamp("reviewed_at", { mode: 'string' }),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const contentAssets = pgTable("content_assets", {
  id: varchar().default(sql`gen_random_uuid()`).primaryKey(),
  filename: varchar({ length: 255 }).notNull(),
  originalFilename: varchar("original_filename", { length: 255 }).notNull(),
  cloudinaryPublicId: varchar("cloudinary_public_id", { length: 255 }).notNull(),
  cloudinaryUrl: text("cloudinary_url").notNull(),
  cloudinarySecureUrl: text("cloudinary_secure_url").notNull(),
  mimeType: varchar("mime_type", { length: 100 }).notNull(),
  fileSize: integer("file_size").notNull(),
  width: integer(),
  height: integer(),
  duration: numeric({ precision: 8, scale: 3 }),
  categoryId: integer("category_id"),
  altText: text("alt_text"),
  caption: text(),
  usageCount: integer("usage_count").default(0),
  lastUsed: timestamp("last_used", { mode: 'string' }),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
  tagIds: jsonb("tag_ids").default([]),
  resourceType: varchar("resource_type", { length: 20 }).notNull(),
}, (table) => [
  unique("content_assets_cloudinary_public_id_unique").on(table.cloudinaryPublicId),
]);

export const contentCategories = pgTable("content_categories", {
  id: integer().default('nextval(content_categories_id_seq').primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  description: text(),
  color: varchar({ length: 7 }).default('#3B82F6').notNull(),
  icon: varchar({ length: 50 }),
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const contentFaqAssignments = pgTable("content_faq_assignments", {
  id: varchar().default(sql`gen_random_uuid()`).primaryKey(),
  faqId: varchar("faq_id").notNull(),
  contentType: text("content_type").default('product').notNull(),
  contentId: varchar("content_id").notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  isVisible: boolean("is_visible").default(true).notNull(),
  assignedBy: varchar("assigned_by"),
  assignmentNote: text("assignment_note"),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
  isInherited: boolean("is_inherited").default(false).notNull(),
  templateId: varchar("template_id"),
  inheritedAt: timestamp("inherited_at", { mode: 'string' }),
}, (table) => [
  unique("unique_faq_content_assignment").on(table.faqId, table.contentType, table.contentId),
]);

export const contentLibrary = pgTable("content_library", {
  id: varchar().default(sql`gen_random_uuid()`).primaryKey(),
  title: varchar({ length: 255 }).notNull(),
  baseContent: text("base_content").notNull(),
  contentType: text("content_type").default('text').notNull(),
  assetIds: jsonb("asset_ids").default([]),
  tagIds: jsonb("tag_ids").default([]),
  aiVariations: jsonb("ai_variations").default([]),
  priority: text().default('normal').notNull(),
  usageCount: integer("usage_count").default(0),
  lastUsed: timestamp("last_used", { mode: 'string' }),
  status: text().default('draft').notNull(),
  isTemplate: boolean("is_template").default(false),
  platforms: jsonb().default(sql`'["facebook", "instagram", "tiktok"]'::jsonb`),
  bestTimeSlots: jsonb("best_time_slots").default([]),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
  contentFingerprint: text("content_fingerprint"),
});

export const contentQueue = pgTable("content_queue", {
  id: varchar().default(sql`gen_random_uuid()`).primaryKey(),
  contentLibraryId: varchar("content_library_id"),
  caption: text(),
  hashtags: jsonb().default([]),
  assetIds: jsonb("asset_ids").default([]),
  targetType: text("target_type").default('all').notNull(),
  targetGroupId: varchar("target_group_id"),
  targetAccountIds: jsonb("target_account_ids").default([]),
  priority: integer().default(5).notNull(),
  queuePosition: integer("queue_position").notNull(),
  autoFill: boolean("auto_fill").default(false),
  preferredTimeSlots: jsonb("preferred_time_slots").default([]),
  useAiVariation: boolean("use_ai_variation").default(false),
  variationTone: text("variation_tone"),
  status: text().default('pending').notNull(),
  timesUsed: integer("times_used").default(0),
  lastScheduledAt: timestamp("last_scheduled_at", { mode: 'string' }),
  errorMessage: text("error_message"),
  retryCount: integer("retry_count").default(0),
  metadata: jsonb(),
  createdBy: varchar("created_by"),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const conversationMessages = pgTable("conversation_messages", {
  id: varchar().default(sql`gen_random_uuid()`).primaryKey(),
  sessionId: varchar("session_id").notNull(),
  message: text().notNull(),
  messageType: text("message_type").default('text').notNull(),
  sender: text().default('user').notNull(),
  isBot: boolean("is_bot").default(false).notNull(),
  intent: text(),
  entities: jsonb().default([]),
  confidence: numeric({ precision: 4, scale: 3 }),
  responseTime: integer("response_time"),
  context: jsonb().default({}),
  metadata: jsonb().default({}),
  timestamp: timestamp({ mode: 'string' }).defaultNow(),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const conversationSessions = pgTable("conversation_sessions", {
  id: varchar().default(sql`gen_random_uuid()`).primaryKey(),
  userId: varchar("user_id"),
  sessionId: text("session_id").notNull(),
  channel: text().default('web').notNull(),
  userAgent: text("user_agent"),
  ipAddress: text("ip_address"),
  messageCount: integer("message_count").default(0).notNull(),
  totalResponseTime: integer("total_response_time").default(0).notNull(),
  avgResponseTime: numeric("avg_response_time", { precision: 8, scale: 2 }),
  status: text().default('active').notNull(),
  resolutionStatus: text("resolution_status"),
  escalatedToHuman: boolean("escalated_to_human").default(false).notNull(),
  escalatedAt: timestamp("escalated_at", { mode: 'string' }),
  escalationReason: text("escalation_reason"),
  assignedAgentId: varchar("assigned_agent_id"),
  startedAt: timestamp("started_at", { mode: 'string' }).defaultNow(),
  endedAt: timestamp("ended_at", { mode: 'string' }),
  lastActiveAt: timestamp("last_active_at", { mode: 'string' }).defaultNow(),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
  unique("conversation_sessions_session_id_key").on(table.sessionId),
]);

export const cookieProfiles = pgTable("cookie_profiles", {
  id: varchar().default(sql`gen_random_uuid()`).primaryKey(),
  userId: varchar("user_id").notNull(),
  socialNetwork: text("social_network").notNull(),
  groupTag: text("group_tag").notNull(),
  accountName: text("account_name").notNull(),
  encryptedData: text("encrypted_data").notNull(),
  lastUsed: timestamp("last_used", { mode: 'string' }),
  isActive: boolean("is_active").default(true).notNull(),
  metadata: jsonb().default({}),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
  version: integer().default(1).notNull(),
  isVerified: boolean("is_verified").default(false).notNull(),
  verificationStatus: text("verification_status"),
  lastVerifiedAt: timestamp("last_verified_at", { mode: 'string' }),
  adAccounts: jsonb("ad_accounts").default([]),
  hasAdsAccess: boolean("has_ads_access").default(false),
});

export const customerEvents = pgTable("customer_events", {
  id: varchar().default(sql`gen_random_uuid()`).primaryKey(),
  customerId: varchar("customer_id").notNull(),
  eventType: text("event_type").notNull(),
  eventData: jsonb("event_data").default({}),
  channel: text().notNull(),
  sessionId: text("session_id"),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
});

export const customerReviews = pgTable("customer_reviews", {
  id: varchar().default(sql`gen_random_uuid()`).primaryKey(),
  sellerId: varchar("seller_id").notNull(),
  customerId: varchar("customer_id"),
  orderId: varchar("order_id"),
  overallRating: integer("overall_rating").notNull(),
  deliverySpeedRating: integer("delivery_speed_rating").notNull(),
  bookConditionRating: integer("book_condition_rating").notNull(),
  customerServiceRating: integer("customer_service_rating").notNull(),
  pricingRating: integer("pricing_rating").notNull(),
  reviewTitle: text("review_title").notNull(),
  reviewContent: text("review_content").notNull(),
  reviewLanguage: varchar("review_language", { length: 10 }).default('vi').notNull(),
  regionDialect: varchar("region_dialect", { length: 20 }).default('miền-bắc'),
  isAutoGenerated: boolean("is_auto_generated").default(false).notNull(),
  sentimentScore: numeric("sentiment_score", { precision: 3, scale: 2 }).default(0),
  helpfulnessVotes: integer("helpfulness_votes").default(0),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const customerVouchers = pgTable("customer_vouchers", {
  id: varchar().default(sql`gen_random_uuid()`).primaryKey(),
  customerId: varchar("customer_id").notNull(),
  discountCodeId: integer("discount_code_id").notNull(),
  claimedAt: timestamp("claimed_at", { mode: 'string' }).defaultNow().notNull(),
  claimedVia: text("claimed_via").default('manual_input').notNull(),
  campaignId: varchar("campaign_id"),
  shareVerificationId: varchar("share_verification_id"),
  status: text().default('active').notNull(),
  usedAt: timestamp("used_at", { mode: 'string' }),
  revokedAt: timestamp("revoked_at", { mode: 'string' }),
  revokedReason: text("revoked_reason"),
  orderId: varchar("order_id"),
  discountApplied: numeric("discount_applied", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const customers = pgTable("customers", {
  id: varchar().default(sql`gen_random_uuid()`).primaryKey(),
  name: text().notNull(),
  email: text(),
  phone: text().notNull(),
  avatar: text(),
  status: text().default('active').notNull(),
  joinDate: timestamp("join_date", { mode: 'string' }).defaultNow(),
  totalDebt: numeric("total_debt", { precision: 15, scale: 2 }).default(0),
  creditLimit: numeric("credit_limit", { precision: 15, scale: 2 }).default(0),
  membershipTier: text("membership_tier").default('member'),
  totalSpent: numeric("total_spent", { precision: 15, scale: 2 }).default(0),
  pointsBalance: integer("points_balance").default(0),
  pointsEarned: integer("points_earned").default(0),
  lastTierUpdate: timestamp("last_tier_update", { mode: 'string' }).defaultNow(),
  authUserId: varchar("auth_user_id"),
  membershipData: jsonb("membership_data").default({}),
  socialAccountIds: jsonb("social_account_ids").default({}),
  socialData: jsonb("social_data").default({}),
  limitsData: jsonb("limits_data").default({}),
  isLocalCustomer: boolean("is_local_customer").default(false).notNull(),
  isAffiliate: boolean("is_affiliate").default(false),
  affiliateCode: text("affiliate_code"),
  affiliateStatus: text("affiliate_status").default('pending'),
  commissionRate: numeric("commission_rate", { precision: 5, scale: 2 }).default(5.00),
  affiliateData: jsonb("affiliate_data").default({}),
  registrationSource: text("registration_source").default('admin').notNull(),
  customerRole: text("customer_role").default('customer').notNull(),
  profileStatus: text("profile_status").default('incomplete').notNull(),
  address: text(),
  latitude: numeric({ precision: 10, scale: 8 }),
  longitude: numeric({ precision: 11, scale: 8 }),
  distanceFromShop: numeric("distance_from_shop", { precision: 10, scale: 3 }),
  routeDistanceFromShop: numeric("route_distance_from_shop", { precision: 10, scale: 3 }),
  geocodingStatus: text("geocoding_status").default('not_geocoded'),
  lastGeocodedAt: timestamp("last_geocoded_at", { mode: 'string' }),
  address2: text(),
  district: text(),
}, (table) => [
  unique("customers_email_unique").on(table.email),
  unique("customers_phone_unique").on(table.phone),
]);

export const depositTransactions = pgTable("deposit_transactions", {
  id: varchar().default(sql`gen_random_uuid()`).primaryKey(),
  vendorId: varchar("vendor_id").notNull(),
  orderId: varchar("order_id"),
  type: varchar().notNull(),
  amount: numeric({ precision: 15, scale: 2 }).notNull(),
  balanceBefore: numeric("balance_before", { precision: 15, scale: 2 }),
  balanceAfter: numeric("balance_after", { precision: 15, scale: 2 }),
  proofUrl: text("proof_url"),
  description: text(),
  processedById: varchar("processed_by_id"),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
});

export const discountCodeUsages = pgTable("discount_code_usages", {
  id: integer().default('nextval(discount_code_usages_id_seq').primaryKey(),
  discountCodeId: integer("discount_code_id").notNull(),
  orderId: varchar("order_id"),
  customerId: varchar("customer_id"),
  usageAmount: numeric("usage_amount", { precision: 10, scale: 2 }).notNull(),
  discountApplied: numeric("discount_applied", { precision: 10, scale: 2 }).notNull(),
  channel: varchar().default('online'),
  usedAt: timestamp("used_at", { mode: 'string' }).defaultNow(),
  metadata: jsonb(),
});

export const discountCodes = pgTable("discount_codes", {
  id: integer().default('nextval(discount_codes_id_seq').primaryKey(),
  code: varchar().notNull(),
  name: varchar().notNull(),
  description: text(),
  type: varchar().notNull(),
  discountValue: numeric("discount_value", { precision: 10, scale: 2 }).notNull(),
  maxDiscountAmount: numeric("max_discount_amount", { precision: 10, scale: 2 }),
  tierRules: jsonb("tier_rules"),
  maxUsage: integer("max_usage"),
  maxUsagePerCustomer: integer("max_usage_per_customer").default(1),
  minOrderAmount: numeric("min_order_amount", { precision: 10, scale: 2 }).default(0),
  validFrom: timestamp("valid_from", { mode: 'string' }).notNull(),
  validUntil: timestamp("valid_until", { mode: 'string' }),
  channelRestrictions: jsonb("channel_restrictions"),
  scheduleRules: jsonb("schedule_rules"),
  status: varchar().default('active').notNull(),
  usageCount: integer("usage_count").default(0),
  localizedMessages: jsonb("localized_messages"),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
  createdBy: varchar("created_by"),
}, (table) => [
  unique("discount_codes_code_key").on(table.code),
]);

export const discountScopeAssignments = pgTable("discount_scope_assignments", {
  id: integer().default('nextval(discount_scope_assignments_id_seq').primaryKey(),
  discountCodeId: integer("discount_code_id").notNull(),
  productId: varchar("product_id"),
  categoryId: varchar("category_id"),
  customerId: varchar("customer_id"),
  customerSegmentRules: jsonb("customer_segment_rules"),
  assignmentType: varchar("assignment_type").default('include').notNull(),
  isExclusion: boolean("is_exclusion").default(false),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const driverReports = pgTable("driver_reports", {
  id: varchar().default(sql`gen_random_uuid()`).primaryKey(),
  tripId: varchar("trip_id").notNull(),
  driverId: varchar("driver_id").notNull(),
  customerId: varchar("customer_id"),
  reportType: text("report_type").notNull(),
  title: text().notNull(),
  description: text().notNull(),
  severity: text().default('medium').notNull(),
  status: text().default('pending').notNull(),
  resolution: text(),
  reportedAt: timestamp("reported_at", { mode: 'string' }).defaultNow(),
  reviewedAt: timestamp("reviewed_at", { mode: 'string' }),
  resolvedAt: timestamp("resolved_at", { mode: 'string' }),
  reviewedBy: varchar("reviewed_by"),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const facebookApps = pgTable("facebook_apps", {
  id: varchar().default(sql`gen_random_uuid()`).primaryKey(),
  appName: text("app_name").notNull(),
  appId: text("app_id").notNull(),
  appSecret: text("app_secret").notNull(),
  webhookUrl: text("webhook_url"),
  verifyToken: text("verify_token"),
  subscriptionFields: jsonb("subscription_fields").default(sql`'["messages", "messaging_postbacks", "feed"]'::jsonb`),
  isActive: boolean("is_active").default(true),
  environment: text().default('development'),
  description: text(),
  lastWebhookEvent: timestamp("last_webhook_event", { mode: 'string' }),
  totalEvents: integer("total_events").default(0),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
  tagIds: jsonb("tag_ids").default([]),
  groupId: varchar("group_id"),
}, (table) => [
  unique("facebook_apps_app_id_unique").on(table.appId),
]);

export const facebookConversations = pgTable("facebook_conversations", {
  id: varchar().default(sql`gen_random_uuid()`).primaryKey(),
  pageId: text("page_id").notNull(),
  pageName: text("page_name").notNull(),
  participantId: text("participant_id").notNull(),
  participantName: text("participant_name").notNull(),
  participantAvatar: text("participant_avatar"),
  status: text().default('active').notNull(),
  priority: text().default('normal').notNull(),
  assignedTo: varchar("assigned_to"),
  messageCount: integer("message_count").default(0).notNull(),
  lastMessageAt: timestamp("last_message_at", { mode: 'string' }),
  lastMessagePreview: text("last_message_preview"),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
  tagIds: jsonb("tag_ids").default([]),
});

export const facebookMessages = pgTable("facebook_messages", {
  id: varchar().default(sql`gen_random_uuid()`).primaryKey(),
  conversationId: varchar("conversation_id").notNull(),
  facebookMessageId: text("facebook_message_id").notNull(),
  senderId: text("sender_id").notNull(),
  senderName: text("sender_name").notNull(),
  senderType: text("sender_type").notNull(),
  content: text(),
  messageType: text("message_type").default('text').notNull(),
  attachments: jsonb().default([]),
  timestamp: timestamp({ mode: 'string' }).notNull(),
  isEcho: boolean("is_echo").default(false),
  replyToMessageId: text("reply_to_message_id"),
  isRead: boolean("is_read").default(false),
  isDelivered: boolean("is_delivered").default(true),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
  unique("facebook_messages_facebook_message_id_unique").on(table.facebookMessageId),
]);

export const facebookWebhookEvents = pgTable("facebook_webhook_events", {
  id: varchar().default(sql`gen_random_uuid()`).primaryKey(),
  appId: varchar("app_id").notNull(),
  eventType: text("event_type").notNull(),
  eventData: jsonb("event_data").notNull(),
  processedAt: timestamp("processed_at", { mode: 'string' }).defaultNow(),
  status: text().default('pending'),
  errorMessage: text("error_message"),
});

export const faqGenerationJobs = pgTable("faq_generation_jobs", {
  id: varchar().default(sql`gen_random_uuid()`).primaryKey(),
  productId: varchar("product_id").notNull(),
  categoryId: varchar("category_id").notNull(),
  prompt: text().notNull(),
  aiModel: varchar("ai_model").default('gemini'),
  status: varchar().default('pending'),
  rawResponse: jsonb("raw_response"),
  error: text(),
  processingStartedAt: timestamp("processing_started_at", { mode: 'string' }),
  processingCompletedAt: timestamp("processing_completed_at", { mode: 'string' }),
  requestedBy: varchar("requested_by").default('anonymous'),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const faqGenerationResults = pgTable("faq_generation_results", {
  id: varchar().default(sql`gen_random_uuid()`).primaryKey(),
  jobId: varchar("job_id").notNull(),
  question: text().notNull(),
  answer: text().notNull(),
  questionOrder: integer("question_order").default(1),
  status: varchar().default('generated'),
  finalFaqId: varchar("final_faq_id"),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
  confidenceScore: numeric("confidence_score", { precision: 5, scale: 3 }).default(0.85),
  reviewedBy: varchar("reviewed_by"),
  reviewedAt: timestamp("reviewed_at", { mode: 'string' }),
  reviewNotes: text("review_notes"),
});

export const faqLibrary = pgTable("faq_library", {
  id: varchar().default(sql`gen_random_uuid()`).primaryKey(),
  question: text().notNull(),
  answer: text().notNull(),
  tagIds: jsonb("tag_ids").default([]),
  priority: text().default('medium').notNull(),
  category: text().default('product').notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  usageCount: integer("usage_count").default(0).notNull(),
  lastUsed: timestamp("last_used", { mode: 'string' }),
  keywords: jsonb().default([]),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const frontendCategoryAssignments = pgTable("frontend_category_assignments", {
  id: varchar().default(sql`gen_random_uuid()`).primaryKey(),
  frontendId: text("frontend_id").notNull(),
  categoryId: varchar("category_id").notNull(),
  isLocalOnly: boolean("is_local_only").default(false).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const generalCategories = pgTable("general_categories", {
  id: varchar().default(sql`gen_random_uuid()`).primaryKey(),
  name: varchar().notNull(),
  slug: varchar().notNull(),
  parentId: varchar("parent_id"),
  level: integer().default(0),
  sortOrder: integer("sort_order").default(0),
  description: text(),
  icon: varchar(),
  color: varchar().default('#3b82f6'),
  productCount: integer("product_count").default(0),
  isActive: boolean("is_active").default(true),
  isFeatured: boolean("is_featured").default(false),
  metaTitle: varchar("meta_title"),
  metaDescription: text("meta_description"),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
  unique("general_categories_slug_key").on(table.slug),
]);

export const generalCategoryAnalytics = pgTable("general_category_analytics", {
  id: varchar().default(sql`gen_random_uuid()`).primaryKey(),
  categoryId: varchar("category_id").notNull(),
  analyticsDate: timestamp("analytics_date", { mode: 'string' }).defaultNow().notNull(),
  pageViews: integer("page_views").default(0),
  uniqueVisitors: integer("unique_visitors").default(0),
  bounceRate: numeric("bounce_rate", { precision: 5, scale: 2 }).default(0.00),
  avgTimeOnPage: integer("avg_time_on_page").default(0),
  totalProducts: integer("total_products").default(0),
  activeProducts: integer("active_products").default(0),
  totalOrders: integer("total_orders").default(0),
  totalRevenue: numeric("total_revenue", { precision: 12, scale: 2 }).default(0.00),
  clickThroughRate: numeric("click_through_rate", { precision: 5, scale: 2 }).default(0.00),
  conversionRate: numeric("conversion_rate", { precision: 5, scale: 2 }).default(0.00),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const generalCategoryAssignments = pgTable("general_category_assignments", {
  id: varchar().default(sql`gen_random_uuid()`).primaryKey(),
  productId: varchar("product_id").notNull(),
  categoryId: varchar("category_id").notNull(),
  isPrimary: boolean("is_primary").default(false),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
  unique("general_unique_product_category").on(table.productId, table.categoryId),
]);

export const generalCategoryPriceRules = pgTable("general_category_price_rules", {
  id: varchar().default(sql`gen_random_uuid()`).primaryKey(),
  categoryId: varchar("category_id").notNull(),
  ruleName: varchar("rule_name").notNull(),
  ruleType: varchar("rule_type").notNull(),
  minPrice: numeric("min_price", { precision: 10, scale: 2 }),
  maxPrice: numeric("max_price", { precision: 10, scale: 2 }),
  discountPercentage: numeric("discount_percentage", { precision: 5, scale: 2 }),
  markupPercentage: numeric("markup_percentage", { precision: 5, scale: 2 }),
  conditions: jsonb().default({}),
  priority: integer().default(0),
  isActive: boolean("is_active").default(true),
  startDate: timestamp("start_date", { mode: 'string' }),
  endDate: timestamp("end_date", { mode: 'string' }),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const giftCampaigns = pgTable("gift_campaigns", {
  id: varchar().default(sql`gen_random_uuid()`).primaryKey(),
  name: text().notNull(),
  description: text(),
  type: varchar().notNull(),
  value: numeric({ precision: 10, scale: 2 }).notNull(),
  includedProducts: jsonb("included_products").default([]),
  digitalTemplate: jsonb("digital_template").default({}),
  physicalTemplate: jsonb("physical_template").default({}),
  maxQuantityPerOrder: integer("max_quantity_per_order").default(10),
  validityDays: integer("validity_days").default(365).notNull(),
  allowPartialRedemption: boolean("allow_partial_redemption").default(false).notNull(),
  availableChannels: jsonb("available_channels").default(sql`'{"channels": ["online", "pos"]}'::jsonb`),
  vatIncluded: boolean("vat_included").default(true).notNull(),
  invoiceRequired: boolean("invoice_required").default(false).notNull(),
  complianceNotes: text("compliance_notes"),
  status: varchar().default('draft').notNull(),
  activeFrom: timestamp("active_from", { mode: 'string' }).defaultNow(),
  activeUntil: timestamp("active_until", { mode: 'string' }),
  totalSold: integer("total_sold").default(0).notNull(),
  totalValue: numeric("total_value", { precision: 12, scale: 2 }).default(0).notNull(),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
  createdBy: varchar("created_by"),
});

export const giftRedemptions = pgTable("gift_redemptions", {
  id: varchar().default(sql`gen_random_uuid()`).primaryKey(),
  voucherId: varchar("voucher_id").notNull(),
  orderId: varchar("order_id"),
  redeemedAmount: numeric("redeemed_amount", { precision: 10, scale: 2 }).notNull(),
  redeemedBy: varchar("redeemed_by"),
  redemptionChannel: varchar("redemption_channel").notNull(),
  generatedDiscountCodeId: varchar("generated_discount_code_id"),
  discountApplicationResult: jsonb("discount_application_result").default({}),
  transactionReference: text("transaction_reference"),
  staffMemberId: varchar("staff_member_id"),
  redemptionStatus: varchar("redemption_status").default('successful').notNull(),
  validationResult: jsonb("validation_result").default({}),
  redeemedAt: timestamp("redeemed_at", { mode: 'string' }).defaultNow(),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const giftVouchers = pgTable("gift_vouchers", {
  id: varchar().default(sql`gen_random_uuid()`).primaryKey(),
  voucherCode: varchar("voucher_code", { length: 20 }).notNull(),
  campaignId: varchar("campaign_id").notNull(),
  purchaseOrderId: varchar("purchase_order_id"),
  purchasedBy: varchar("purchased_by"),
  purchaseAmount: numeric("purchase_amount", { precision: 10, scale: 2 }).notNull(),
  purchaseChannel: varchar("purchase_channel").notNull(),
  faceValue: numeric("face_value", { precision: 10, scale: 2 }).notNull(),
  currentBalance: numeric("current_balance", { precision: 10, scale: 2 }).notNull(),
  recipientName: text("recipient_name"),
  recipientEmail: text("recipient_email"),
  recipientPhone: text("recipient_phone"),
  personalMessage: text("personal_message"),
  deliveryMethod: varchar("delivery_method").default('email').notNull(),
  deliveryStatus: varchar("delivery_status").default('pending').notNull(),
  deliveryDetails: jsonb("delivery_details").default({}),
  expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
  firstUsedAt: timestamp("first_used_at", { mode: 'string' }),
  fullyRedeemedAt: timestamp("fully_redeemed_at", { mode: 'string' }),
  status: varchar().default('issued').notNull(),
  vatAmount: numeric("vat_amount", { precision: 10, scale: 2 }),
  invoiceNumber: text("invoice_number"),
  complianceData: jsonb("compliance_data").default({}),
  issuedAt: timestamp("issued_at", { mode: 'string' }).defaultNow(),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
  unique("gift_vouchers_voucher_code_key").on(table.voucherCode),
]);

export const globalAutomationControl = pgTable("global_automation_control", {
  id: text().default(sql`gen_random_uuid()`).primaryKey(),
  masterEnabled: boolean("master_enabled").default(false),
  emergencyStop: boolean("emergency_stop").default(false),
  maintenanceMode: boolean("maintenance_mode").default(false),
  globalLimits: jsonb("global_limits"),
  healthThresholds: jsonb("health_thresholds"),
  schedulingConfig: jsonb("scheduling_config"),
  statistics: jsonb(),
  notes: text(),
  lastUpdatedBy: text("last_updated_by"),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
  version: integer().default(1),
});

export const industries = pgTable("industries", {
  id: varchar().default(sql`gen_random_uuid()`).primaryKey(),
  name: text().notNull(),
  description: text(),
  isActive: boolean("is_active").default(true).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const industryKeywords = pgTable("industry_keywords", {
  id: varchar().default(sql`gen_random_uuid()`).primaryKey(),
  industryId: varchar("industry_id").notNull(),
  keyword: text().notNull(),
  weight: numeric({ precision: 5, scale: 3 }).default(1.000).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const industryRules = pgTable("industry_rules", {
  id: varchar().default(sql`gen_random_uuid()`).primaryKey(),
  industryId: varchar("industry_id").notNull(),
  rulesJson: jsonb("rules_json").default({}),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const industryTemplates = pgTable("industry_templates", {
  id: varchar().default(sql`gen_random_uuid()`).primaryKey(),
  industryId: varchar("industry_id").notNull(),
  intent: text().notNull(),
  template: text().notNull(),
  language: text().default('vi').notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  priority: integer().default(0).notNull(),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const intentAnalytics = pgTable("intent_analytics", {
  id: varchar().default(sql`gen_random_uuid()`).primaryKey(),
  intentName: text("intent_name").notNull(),
  displayName: text("display_name"),
  category: text().default('general').notNull(),
  totalCount: integer("total_count").default(0).notNull(),
  successCount: integer("success_count").default(0).notNull(),
  failureCount: integer("failure_count").default(0).notNull(),
  successRate: numeric("success_rate", { precision: 5, scale: 2 }).default(0.00),
  avgConfidence: numeric("avg_confidence", { precision: 4, scale: 3 }),
  avgResponseTime: numeric("avg_response_time", { precision: 8, scale: 2 }),
  lastTriggered: timestamp("last_triggered", { mode: 'string' }),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
  unique("intent_analytics_intent_name_key").on(table.intentName),
]);

export const invoiceTemplates = pgTable("invoice_templates", {
  id: varchar().default(sql`gen_random_uuid()`).primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  config: jsonb().default({}).notNull(),
  isDefault: boolean("is_default").default(false).notNull(),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const ipPoolSessions = pgTable("ip_pool_sessions", {
  id: integer().default('nextval(ip_pool_sessions_id_seq').primaryKey(),
  ipPoolId: integer("ip_pool_id").notNull(),
  sessionStart: timestamp("session_start", { mode: 'string' }).defaultNow().notNull(),
  sessionEnd: timestamp("session_end", { mode: 'string' }),
  ipAddress: varchar("ip_address", { length: 100 }),
  postsCount: integer("posts_count").default(0),
  successCount: integer("success_count").default(0),
  failCount: integer("fail_count").default(0),
  status: varchar({ length: 50 }).default('active'),
  metadata: jsonb().default({}),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const ipPools = pgTable("ip_pools", {
  id: integer().default('nextval(ip_pools_id_seq').primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  type: varchar({ length: 50 }).notNull(),
  status: varchar({ length: 50 }).default('inactive').notNull(),
  currentIp: varchar("current_ip", { length: 100 }),
  config: jsonb().default({}),
  healthScore: integer("health_score").default(100),
  totalRotations: integer("total_rotations").default(0),
  lastRotatedAt: timestamp("last_rotated_at", { mode: 'string' }),
  isEnabled: boolean("is_enabled").default(true),
  priority: integer().default(0),
  costPerMonth: numeric("cost_per_month", { precision: 10, scale: 2 }),
  notes: text(),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const ipRotationLogs = pgTable("ip_rotation_logs", {
  id: integer().default('nextval(ip_rotation_logs_id_seq').primaryKey(),
  ipPoolId: integer("ip_pool_id").notNull(),
  oldIp: varchar("old_ip", { length: 100 }),
  newIp: varchar("new_ip", { length: 100 }),
  rotationReason: varchar("rotation_reason", { length: 255 }),
  rotationMethod: varchar("rotation_method", { length: 50 }),
  success: boolean().default(false),
  errorMessage: text("error_message"),
  metadata: jsonb().default({}),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const marketTrends = pgTable("market_trends", {
  id: varchar().default(sql`gen_random_uuid()`).primaryKey(),
  categoryId: varchar("category_id").notNull(),
  categoryName: text("category_name").notNull(),
  trendScore: numeric("trend_score", { precision: 5, scale: 2 }).default(50.00).notNull(),
  trendDirection: text("trend_direction").default('stable').notNull(),
  momentumScore: numeric("momentum_score", { precision: 5, scale: 2 }).default(0).notNull(),
  searchVolume: integer("search_volume").default(0).notNull(),
  searchVolumeChange: numeric("search_volume_change", { precision: 7, scale: 2 }).default(0).notNull(),
  orderVolumeWeekly: integer("order_volume_weekly").default(0).notNull(),
  averagePrice: numeric("average_price", { precision: 15, scale: 2 }).default(0).notNull(),
  priceVolatility: numeric("price_volatility", { precision: 5, scale: 2 }).default(0).notNull(),
  competitorCount: integer("competitor_count").default(0).notNull(),
  marketSaturation: numeric("market_saturation", { precision: 5, scale: 4 }).default(0.5000).notNull(),
  entryBarrier: text("entry_barrier").default('medium').notNull(),
  seasonalityIndex: numeric("seasonality_index", { precision: 5, scale: 2 }).default(1.00).notNull(),
  peakSeasons: jsonb("peak_seasons").default([]),
  vietnamesePopularity: numeric("vietnamese_popularity", { precision: 5, scale: 2 }).default(50.00).notNull(),
  regionalDemand: jsonb("regional_demand").default(sql`'{"Miền Nam": 34, "Miền Bắc": 33, "Miền Trung": 33}'::jsonb`),
  predictedTrendNext7Days: text("predicted_trend_next_7_days"),
  predictedTrendNext30Days: text("predicted_trend_next_30_days"),
  confidenceScore: numeric("confidence_score", { precision: 3, scale: 2 }).default(0.50).notNull(),
  recommendedAction: text("recommended_action").default('maintain'),
  automationEnabled: boolean("automation_enabled").default(false).notNull(),
  lastCalculated: timestamp("last_calculated", { mode: 'string' }).defaultNow(),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const oauthConnections = pgTable("oauth_connections", {
  id: varchar().default(sql`gen_random_uuid()`).primaryKey(),
  customerId: varchar("customer_id").notNull(),
  provider: text().notNull(),
  providerUserId: varchar("provider_user_id").notNull(),
  email: varchar(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  tokenExpiresAt: timestamp("token_expires_at", { mode: 'string' }),
  profileData: jsonb("profile_data"),
  isPrimary: boolean("is_primary").default(false).notNull(),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
  unique("unique_provider_user").on(table.provider, table.providerUserId),
]);

export const orderItems = pgTable("order_items", {
  id: varchar().default(sql`gen_random_uuid()`).primaryKey(),
  orderId: varchar("order_id").notNull(),
  productId: varchar("product_id").notNull(),
  quantity: numeric({ precision: 10, scale: 3 }).notNull(),
  price: numeric({ precision: 15, scale: 2 }).notNull(),
});

export const orders = pgTable("orders", {
  id: varchar().default(sql`gen_random_uuid()`).primaryKey(),
  userId: varchar("user_id"),
  items: jsonb().notNull(),
  subtotal: numeric({ precision: 10, scale: 2 }).notNull(),
  shippingFee: numeric("shipping_fee", { precision: 10, scale: 2 }).default(5.00),
  tax: numeric({ precision: 10, scale: 2 }).default(0.00),
  total: numeric({ precision: 10, scale: 2 }).notNull(),
  currency: varchar({ length: 3 }).default('USD'),
  shippingInfo: jsonb("shipping_info").notNull(),
  paymentIntentId: varchar("payment_intent_id", { length: 255 }),
  paymentStatus: varchar("payment_status", { length: 20 }).default('pending'),
  paymentMethod: varchar("payment_method", { length: 50 }),
  status: varchar({ length: 20 }).default('pending'),
  trackingNumber: varchar("tracking_number", { length: 100 }),
  estimatedDelivery: timestamp("estimated_delivery", { mode: 'string' }),
  deliveredAt: timestamp("delivered_at", { mode: 'string' }),
  customerNotes: text("customer_notes"),
  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
  source: text().default('admin'),
  sourceOrderId: text("source_order_id"),
  sourceReference: text("source_reference"),
  syncStatus: text("sync_status").default('manual'),
  syncData: jsonb("sync_data"),
  sourceCustomerInfo: jsonb("source_customer_info"),
  vtpOrderSystemCode: text("vtp_order_system_code"),
  vtpOrderNumber: text("vtp_order_number"),
  vtpServiceCode: text("vtp_service_code"),
  vtpStatus: text("vtp_status"),
  vtpTrackingData: jsonb("vtp_tracking_data"),
  vtpShippingInfo: jsonb("vtp_shipping_info"),
  vtpCreatedAt: timestamp("vtp_created_at", { mode: 'string' }),
  vtpUpdatedAt: timestamp("vtp_updated_at", { mode: 'string' }),
  assignedDriverId: varchar("assigned_driver_id"),
  affiliateId: varchar("affiliate_id"),
  affiliateCommission: numeric("affiliate_commission", { precision: 15, scale: 2 }).default(0.00),
  sendInvoiceToChat: boolean("send_invoice_to_chat").default(false),
  invoiceSentAt: timestamp("invoice_sent_at", { mode: 'string' }),
  invoiceSentVia: varchar("invoice_sent_via"),
  tags: text().default('ARRAY[]'),
});

export const pageTags = pgTable("page_tags", {
  id: varchar().default(sql`gen_random_uuid()`).primaryKey(),
  name: text().notNull(),
  color: text().default('#3B82F6').notNull(),
  description: text(),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const paymentGatewaySettings = pgTable("payment_gateway_settings", {
  id: integer().default('nextval(payment_gateway_settings_id_seq').primaryKey(),
  gateway: text().notNull(),
  enabled: boolean().default(false).notNull(),
  credentials: jsonb().default({}).notNull(),
  testMode: boolean("test_mode").default(true).notNull(),
  webhookSecret: text("webhook_secret"),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
  unique("payment_gateway_settings_gateway_key").on(table.gateway),
]);

export const payments = pgTable("payments", {
  id: varchar().default(sql`gen_random_uuid()`).primaryKey(),
  orderId: varchar("order_id").notNull(),
  method: text().default('qr_code').notNull(),
  amount: numeric({ precision: 15, scale: 2 }).notNull(),
  qrCode: text("qr_code"),
  status: text().default('pending').notNull(),
  transactionId: text("transaction_id"),
  bankInfo: jsonb("bank_info"),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const performanceMetrics = pgTable("performance_metrics", {
  id: varchar().default(sql`gen_random_uuid()`).primaryKey(),
  sellerId: varchar("seller_id").notNull(),
  periodType: varchar("period_type", { length: 20 }).notNull(),
  periodStart: timestamp("period_start", { mode: 'string' }).notNull(),
  periodEnd: timestamp("period_end", { mode: 'string' }).notNull(),
  totalOrders: integer("total_orders").default(0),
  successfulOrders: integer("successful_orders").default(0),
  cancelledOrders: integer("cancelled_orders").default(0),
  returnedOrders: integer("returned_orders").default(0),
  totalRevenue: numeric("total_revenue", { precision: 15, scale: 2 }).default(0),
  averageOrderValue: numeric("average_order_value", { precision: 10, scale: 2 }).default(0),
  averageResponseTimeHours: numeric("average_response_time_hours", { precision: 5, scale: 2 }).default(0),
  fulfillmentAccuracyPercent: numeric("fulfillment_accuracy_percent", { precision: 5, scale: 2 }).default(0),
  customerSatisfactionScore: numeric("customer_satisfaction_score", { precision: 3, scale: 2 }).default(0),
  repeatCustomerRate: numeric("repeat_customer_rate", { precision: 5, scale: 2 }).default(0),
  recommendationRate: numeric("recommendation_rate", { precision: 5, scale: 2 }).default(0),
  culturalSensitivityScore: numeric("cultural_sensitivity_score", { precision: 3, scale: 2 }).default(0),
  efficiencyScore: numeric("efficiency_score", { precision: 3, scale: 2 }).default(0),
  qualityScore: numeric("quality_score", { precision: 3, scale: 2 }).default(0),
  overallPerformanceScore: numeric("overall_performance_score", { precision: 3, scale: 2 }).default(0),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const priceSources = pgTable("price_sources", {
  id: varchar().default(sql`gen_random_uuid()`).primaryKey(),
  name: varchar({ length: 100 }).notNull(),
  displayName: varchar("display_name", { length: 100 }).notNull(),
  baseUrl: varchar("base_url", { length: 255 }),
  apiKey: varchar("api_key", { length: 255 }),
  isActive: boolean("is_active").default(true),
  priority: integer().default(100),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const pricingStrategies = pgTable("pricing_strategies", {
  id: varchar().default(sql`gen_random_uuid()`).primaryKey(),
  sellerId: varchar("seller_id").notNull(),
  strategyName: text("strategy_name").notNull(),
  strategyType: text("strategy_type").notNull(),
  baseApproach: text("base_approach").default('moderate').notNull(),
  baseProfitMargin: numeric("base_profit_margin", { precision: 5, scale: 4 }).default(0.2000).notNull(),
  minProfitMargin: numeric("min_profit_margin", { precision: 5, scale: 4 }).default(0.0500).notNull(),
  maxProfitMargin: numeric("max_profit_margin", { precision: 5, scale: 4 }).default(0.5000).notNull(),
  competitorTrackingEnabled: boolean("competitor_tracking_enabled").default(true).notNull(),
  priceMatchStrategy: text("price_match_strategy").default('stay_within_range'),
  competitiveMargin: numeric("competitive_margin", { precision: 5, scale: 4 }).default(0.0500).notNull(),
  demandElasticity: numeric("demand_elasticity", { precision: 5, scale: 4 }).default(0.5000).notNull(),
  stockLevelPricing: boolean("stock_level_pricing").default(true).notNull(),
  lowStockPremium: numeric("low_stock_premium", { precision: 5, scale: 4 }).default(0.1000).notNull(),
  overStockDiscount: numeric("over_stock_discount", { precision: 5, scale: 4 }).default(0.1500).notNull(),
  timeBasedAdjustments: jsonb("time_based_adjustments").default({}),
  categoryPricingRules: jsonb("category_pricing_rules").default({}),
  festivalPricingRules: jsonb("festival_pricing_rules").default({}),
  regionalPricingEnabled: boolean("regional_pricing_enabled").default(false).notNull(),
  autoAdjustmentEnabled: boolean("auto_adjustment_enabled").default(false).notNull(),
  adjustmentFrequency: text("adjustment_frequency").default('daily').notNull(),
  maxPriceChangePerDay: numeric("max_price_change_per_day", { precision: 5, scale: 4 }).default(0.1000).notNull(),
  avgPriceChangePercent: numeric("avg_price_change_percent", { precision: 7, scale: 4 }).default(0).notNull(),
  profitabilityScore: numeric("profitability_score", { precision: 5, scale: 2 }).default(50.00).notNull(),
  competitivenessScore: numeric("competitiveness_score", { precision: 5, scale: 2 }).default(50.00).notNull(),
  salesVelocityImpact: numeric("sales_velocity_impact", { precision: 7, scale: 4 }).default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  lastAdjusted: timestamp("last_adjusted", { mode: 'string' }),
  nextAdjustment: timestamp("next_adjustment", { mode: 'string' }),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const productFaqs = pgTable("product_faqs", {
  id: varchar().default(sql`gen_random_uuid()`).primaryKey(),
  productId: varchar("product_id").notNull(),
  question: text().notNull(),
  answer: text().notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
  faqId: varchar("faq_id"),
  isAutoGenerated: boolean("is_auto_generated").default(false).notNull(),
  category: text(),
  subcategory: text(),
  questionVariations: jsonb("question_variations").default({}),
  channels: jsonb().default({}),
  multimediaContent: jsonb("multimedia_content").default({}),
  keywordWeights: jsonb("keyword_weights").default({}),
  automation: jsonb().default({}),
  upsellSuggestions: jsonb("upsell_suggestions").default({}),
  tags: jsonb().default([]),
  relatedQuestionIds: jsonb("related_question_ids").default([]),
});

export const productLandingClicks = pgTable("product_landing_clicks", {
  id: integer().default('nextval(product_landing_clicks_id_seq').primaryKey(),
  landingPageId: varchar("landing_page_id").notNull(),
  affiliateId: varchar("affiliate_id"),
  trackingCookie: varchar("tracking_cookie").notNull(),
  ip: varchar(),
  userAgent: text("user_agent"),
  device: varchar(),
  referrer: text(),
  converted: boolean().default(false).notNull(),
  orderId: varchar("order_id"),
  conversionValue: numeric("conversion_value", { precision: 15, scale: 2 }),
  clickedAt: timestamp("clicked_at", { mode: 'string' }).defaultNow().notNull(),
  convertedAt: timestamp("converted_at", { mode: 'string' }),
});

export const productLandingPages = pgTable("product_landing_pages", {
  id: varchar().default(sql`gen_random_uuid()`).primaryKey(),
  title: text().notNull(),
  slug: text().notNull(),
  description: text(),
  productId: varchar("product_id").notNull(),
  variantId: varchar("variant_id"),
  customPrice: numeric("custom_price", { precision: 15, scale: 2 }),
  originalPrice: numeric("original_price", { precision: 15, scale: 2 }),
  heroTitle: text("hero_title"),
  heroSubtitle: text("hero_subtitle"),
  heroImage: text("hero_image"),
  callToAction: text("call_to_action").default('Đặt hàng ngay'),
  features: jsonb().default([]).notNull(),
  testimonials: jsonb().default([]),
  isActive: boolean("is_active").default(true).notNull(),
  theme: text().default('light').notNull(),
  primaryColor: text("primary_color").default('#007bff').notNull(),
  contactInfo: jsonb("contact_info").default(sql`'{"email": "", "phone": "", "businessName": ""}'::jsonb`).notNull(),
  viewCount: integer("view_count").default(0).notNull(),
  orderCount: integer("order_count").default(0).notNull(),
  conversionRate: numeric("conversion_rate", { precision: 5, scale: 2 }).default(0.00).notNull(),
  paymentMethods: jsonb("payment_methods").default(sql`'{"cod": true, "online": false, "bankTransfer": true}'::jsonb`).notNull(),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
  themeConfigId: varchar("theme_config_id"),
  advancedThemeConfig: jsonb("advanced_theme_config"),
  affiliateId: varchar("affiliate_id"),
  affiliateCode: text("affiliate_code"),
  autoSeedingEnabled: boolean("auto_seeding_enabled").default(false).notNull(),
}, (table) => [
  unique("product_landing_pages_slug_unique").on(table.slug),
]);

export const productPolicies = pgTable("product_policies", {
  id: varchar().default(sql`gen_random_uuid()`).primaryKey(),
  title: text().notNull(),
  description: text().notNull(),
  icon: text(),
  type: text().notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const productPolicyAssociations = pgTable("product_policy_associations", {
  productId: varchar("product_id").primaryKey(),
  policyId: varchar("policy_id").primaryKey(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const productReviews = pgTable("product_reviews", {
  id: varchar().default(sql`gen_random_uuid()`).primaryKey(),
  productId: varchar("product_id").notNull(),
  customerId: varchar("customer_id"),
  customerName: text("customer_name").notNull(),
  customerAvatar: text("customer_avatar"),
  rating: integer().notNull(),
  title: text(),
  content: text().notNull(),
  isVerified: boolean("is_verified").default(false).notNull(),
  isApproved: boolean("is_approved").default(true).notNull(),
  helpfulCount: integer("helpful_count").default(0).notNull(),
  images: jsonb().default([]),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const products = pgTable("products", {
  id: varchar().default(sql`gen_random_uuid()`).primaryKey(),
  name: text().notNull(),
  description: text(),
  price: numeric({ precision: 15, scale: 2 }).notNull(),
  stock: integer().default(0).notNull(),
  categoryId: varchar("category_id"),
  status: text().default('active').notNull(),
  image: text(),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
  sku: text(),
  images: jsonb().default([]),
  videos: jsonb().default([]),
  tagIds: jsonb("tag_ids").default([]),
  descriptions: jsonb().default({}),
  defaultImageIndex: integer("default_image_index").default(0),
  itemCode: text("item_code"),
  shortDescription: text("short_description"),
  slug: text(),
  ingredients: jsonb().default([]),
  benefits: jsonb().default([]),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  productStory: jsonb("product_story").default({}),
  usageInstructions: text("usage_instructions"),
  specifications: jsonb().default({}),
  ogImageUrl: text("og_image_url"),
  unitType: text("unit_type").default('count'),
  unit: text().default('cái'),
  allowDecimals: boolean("allow_decimals").default(false),
  minQuantity: numeric("min_quantity", { precision: 10, scale: 3 }).default(1.000),
  quantityStep: numeric("quantity_step", { precision: 10, scale: 3 }).default(1.000),
  consultationData: jsonb("consultation_data").default({}),
  urgencyData: jsonb("urgency_data").default(sql`'{"demand_level": "medium", "sales_velocity": 0, "urgency_messages": [], "is_limited_edition": false, "low_stock_threshold": 10}'::jsonb`),
  socialProofData: jsonb("social_proof_data").default(sql`'{"total_sold": 0, "total_reviews": 0, "average_rating": 0, "media_mentions": [], "celebrity_users": [], "repurchase_rate": 0, "featured_reviews": [], "trending_hashtags": [], "expert_endorsements": [], "awards_certifications": []}'::jsonb`),
  personalizationData: jsonb("personalization_data").default(sql`'{"skin_types": [], "income_bracket": "500k-1m", "lifestyle_tags": [], "profession_fit": [], "problem_solving": [], "usage_scenarios": [], "personality_match": [], "seasonal_relevance": [], "target_demographics": {"primary": {"gender": [], "location": [], "age_range": "", "lifestyle": [], "income_level": "middle"}}}'::jsonb`),
  leadingQuestionsData: jsonb("leading_questions_data").default(sql`'{"emotional_hooks": [], "desire_questions": [], "closing_questions": [], "discovery_prompts": [], "comparison_triggers": [], "pain_point_questions": [], "objection_anticipation": []}'::jsonb`),
  objectionHandlingData: jsonb("objection_handling_data").default(sql`'{"trust_builders": [], "risk_mitigation": [], "safety_assurance": [], "common_objections": [], "price_justification": {"daily_cost": "", "comparison_points": [], "value_proposition": ""}, "quality_proof_points": [], "competitor_advantages": [], "effectiveness_guarantee": {"timeline": "", "success_rate": "", "guarantee_text": ""}}'::jsonb`),
  isbn: text(),
  smartFaq: jsonb("smart_faq"),
  needsAssessment: jsonb("needs_assessment"),
  botPersonality: jsonb("bot_personality"),
  consultationScenarios: jsonb("consultation_scenarios"),
  competitorComparison: jsonb("competitor_comparison"),
  crossSellData: jsonb("cross_sell_data"),
  consultationTracking: jsonb("consultation_tracking"),
  customDescriptions: jsonb("custom_descriptions"),
  originalPrice: numeric("original_price", { precision: 10, scale: 2 }),
  fakeSalesCount: integer("fake_sales_count").default(0),
  isNew: boolean("is_new").default(false),
  isTopseller: boolean("is_topseller").default(false),
  isFreeshipping: boolean("is_freeshipping").default(false),
  isBestseller: boolean("is_bestseller").default(false),
  isVipOnly: boolean("is_vip_only").default(false).notNull(),
  requiredVipTier: text("required_vip_tier"),
  localPrice: numeric("local_price", { precision: 15, scale: 2 }),
  standardPrice: numeric("standard_price", { precision: 15, scale: 2 }),
}, (table) => [
  unique("products_sku_unique").on(table.sku),
  unique("products_slug_key").on(table.slug),
]);

export const projectTemplates = pgTable("project_templates", {
  id: varchar().default(sql`gen_random_uuid()`).primaryKey(),
  projectId: varchar("project_id").notNull(),
  projectType: varchar("project_type").notNull(),
  templateId: varchar("template_id").notNull(),
  templateType: varchar("template_type").notNull(),
  templateName: text("template_name").notNull(),
  appliedCustomizations: jsonb("applied_customizations").notNull(),
  appliedAt: timestamp("applied_at", { mode: 'string' }).defaultNow(),
  isActive: boolean("is_active").default(true).notNull(),
  platform: varchar().notNull(),
  loadTime: integer("load_time"),
  compilationTime: integer("compilation_time"),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const pushSubscriptions = pgTable("push_subscriptions", {
  id: varchar().default(sql`gen_random_uuid()`).primaryKey(),
  customerId: varchar("customer_id"),
  userId: varchar("user_id"),
  endpoint: text().notNull(),
  expirationTime: timestamp("expiration_time", { mode: 'string' }),
  keys: jsonb().notNull(),
  userAgent: text("user_agent"),
  deviceType: text("device_type").default('unknown'),
  browser: text(),
  notificationTypes: jsonb("notification_types").default(sql`'["order_updates", "messages", "promotions"]'::jsonb`),
  isActive: boolean("is_active").default(true).notNull(),
  isTestSubscription: boolean("is_test_subscription").default(false),
  lastUsedAt: timestamp("last_used_at", { mode: 'string' }),
  failureCount: integer("failure_count").default(0),
  lastError: text("last_error"),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
  unique("push_subscriptions_endpoint_key").on(table.endpoint),
]);

export const queueAutofillSettings = pgTable("queue_autofill_settings", {
  id: varchar().default(sql`gen_random_uuid()`).primaryKey(),
  enabled: boolean().default(false),
  fillStrategy: text("fill_strategy").default('priority'),
  defaultTimeSlots: jsonb("default_time_slots").default([]),
  minGapHours: integer("min_gap_hours").default(2),
  maxPostsPerDay: integer("max_posts_per_day").default(5),
  maxPostsPerAccount: integer("max_posts_per_account").default(3),
  checkDuplicateWindow: integer("check_duplicate_window").default(7),
  similarityThreshold: numeric("similarity_threshold", { precision: 3, scale: 2 }).default(0.8),
  forceVariation: boolean("force_variation").default(true),
  variationModel: text("variation_model").default('gemini-pro'),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const queueHistory = pgTable("queue_history", {
  id: varchar().default(sql`gen_random_uuid()`).primaryKey(),
  queueItemId: varchar("queue_item_id").notNull(),
  action: text().notNull(),
  scheduledPostId: varchar("scheduled_post_id"),
  socialAccountId: varchar("social_account_id"),
  success: boolean(),
  errorMessage: text("error_message"),
  metadata: jsonb(),
  performedBy: varchar("performed_by"),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const registrationTokens = pgTable("registration_tokens", {
  id: varchar().default(sql`gen_random_uuid()`).primaryKey(),
  token: varchar().notNull(),
  tier: text().default('gold').notNull(),
  maxUses: integer("max_uses").default(100),
  usedCount: integer("used_count").default(0).notNull(),
  expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
  createdBy: varchar("created_by"),
  notes: text(),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
  unique("registration_tokens_token_key").on(table.token),
]);

export const returnRequests = pgTable("return_requests", {
  id: varchar().default(sql`gen_random_uuid()`).primaryKey(),
  vendorOrderId: varchar("vendor_order_id").notNull(),
  vendorId: varchar("vendor_id").notNull(),
  orderId: varchar("order_id").notNull(),
  reason: text().notNull(),
  quantity: integer().notNull(),
  refundAmount: text("refund_amount").notNull(),
  status: varchar().default('pending').notNull(),
  adminNotes: text("admin_notes"),
  processedAt: timestamp("processed_at", { mode: 'string' }),
  proofImages: jsonb("proof_images").default([]),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const salesAutomationConfigs = pgTable("sales_automation_configs", {
  id: text().default(sql`gen_random_uuid()`).primaryKey(),
  sellerId: text("seller_id").notNull(),
  isEnabled: boolean("is_enabled").default(false),
  isGloballyEnabled: boolean("is_globally_enabled").default(true),
  frequency: text().default('weekly'),
  scheduleConfig: jsonb("schedule_config"),
  targets: jsonb(),
  bookPreferences: jsonb("book_preferences"),
  customerSimulation: jsonb("customer_simulation"),
  performanceParams: jsonb("performance_params"),
  advancedSettings: jsonb("advanced_settings"),
  lastRunAt: timestamp("last_run_at", { mode: 'string' }),
  nextRunAt: timestamp("next_run_at", { mode: 'string' }),
  totalAutomatedOrders: integer("total_automated_orders").default(0),
  totalAutomatedRevenue: numeric("total_automated_revenue", { precision: 15, scale: 2 }).default(0),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const salesAutomationHistory = pgTable("sales_automation_history", {
  id: text().default(sql`gen_random_uuid()`).primaryKey(),
  sellerId: text("seller_id").notNull(),
  configId: text("config_id"),
  executionType: text("execution_type"),
  executionStatus: text("execution_status"),
  runParameters: jsonb("run_parameters"),
  results: jsonb(),
  duration: integer(),
  errorLog: jsonb("error_log"),
  startedAt: timestamp("started_at", { mode: 'string' }).defaultNow(),
  completedAt: timestamp("completed_at", { mode: 'string' }),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  vietnameseSimulationData: jsonb("vietnamese_simulation_data").default({}),
  performanceMetrics: jsonb("performance_metrics").default({}),
});

export const satisfactionSurveys = pgTable("satisfaction_surveys", {
  id: varchar().default(sql`gen_random_uuid()`).primaryKey(),
  sellerId: varchar("seller_id").notNull(),
  customerId: varchar("customer_id"),
  orderId: varchar("order_id"),
  surveyType: varchar("survey_type", { length: 50 }).default('post_purchase').notNull(),
  overallSatisfaction: integer("overall_satisfaction"),
  recommendationLikelihood: integer("recommendation_likelihood"),
  easeOfOrdering: integer("ease_of_ordering"),
  websiteExperience: integer("website_experience"),
  communicationQuality: integer("communication_quality"),
  deliverySatisfaction: integer("delivery_satisfaction"),
  productQuality: integer("product_quality"),
  valueForMoney: integer("value_for_money"),
  culturalAppropriateness: integer("cultural_appropriateness"),
  openFeedback: text("open_feedback"),
  improvementSuggestions: text("improvement_suggestions"),
  surveyLanguage: varchar("survey_language", { length: 10 }).default('vi'),
  isAutoGenerated: boolean("is_auto_generated").default(false),
  completedAt: timestamp("completed_at", { mode: 'string' }),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const scheduledPosts = pgTable("scheduled_posts", {
  id: varchar().default(sql`gen_random_uuid()`).primaryKey(),
  caption: text().notNull(),
  hashtags: jsonb().default([]),
  assetIds: jsonb("asset_ids").default([]),
  socialAccountId: varchar("social_account_id").notNull(),
  platform: text().notNull(),
  scheduledTime: timestamp("scheduled_time", { mode: 'string' }).notNull(),
  timezone: varchar({ length: 50 }).default('Asia/Ho_Chi_Minh'),
  status: text().default('draft').notNull(),
  publishedAt: timestamp("published_at", { mode: 'string' }),
  platformPostId: varchar("platform_post_id", { length: 255 }),
  platformUrl: text("platform_url"),
  errorMessage: text("error_message"),
  retryCount: integer("retry_count").default(0),
  lastRetryAt: timestamp("last_retry_at", { mode: 'string' }),
  analytics: jsonb(),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
  priority: integer().default(5).notNull(),
  ipPoolId: integer("ip_pool_id"),
  ipSnapshot: varchar("ip_snapshot", { length: 100 }),
  batchId: varchar("batch_id", { length: 100 }),
});

export const seasonalRules = pgTable("seasonal_rules", {
  id: varchar().default(sql`gen_random_uuid()`).primaryKey(),
  ruleName: text("rule_name").notNull(),
  ruleType: text("rule_type").notNull(),
  seasonType: text("season_type").notNull(),
  startDate: timestamp("start_date", { mode: 'string' }),
  endDate: timestamp("end_date", { mode: 'string' }),
  isRecurring: boolean("is_recurring").default(true).notNull(),
  targetCategories: jsonb("target_categories").default([]),
  targetSellerTiers: jsonb("target_seller_tiers").default(sql`'["standard", "professional", "top_seller", "premium"]'::jsonb`),
  priceMultiplier: numeric("price_multiplier", { precision: 5, scale: 4 }).default(1.0000).notNull(),
  maxPriceIncrease: numeric("max_price_increase", { precision: 5, scale: 4 }).default(0.2000).notNull(),
  maxPriceDecrease: numeric("max_price_decrease", { precision: 5, scale: 4 }).default(0.3000).notNull(),
  dynamicPricingEnabled: boolean("dynamic_pricing_enabled").default(false).notNull(),
  inventoryMultiplier: numeric("inventory_multiplier", { precision: 5, scale: 4 }).default(1.0000).notNull(),
  minStockLevel: integer("min_stock_level").default(10).notNull(),
  maxStockLevel: integer("max_stock_level").default(1000).notNull(),
  restockTrigger: integer("restock_trigger").default(20).notNull(),
  promotionIntensity: text("promotion_intensity").default('moderate'),
  discountRange: jsonb("discount_range").default(sql`'{"max": 25, "min": 5}'::jsonb`),
  culturalSignificance: text("cultural_significance").default('moderate').notNull(),
  giftRelevance: boolean("gift_relevance").default(false).notNull(),
  festivalMentions: jsonb("festival_mentions").default([]),
  regionalAdjustments: jsonb("regional_adjustments").default({}),
  priority: integer().default(50).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  autoApply: boolean("auto_apply").default(false).notNull(),
  lastApplied: timestamp("last_applied", { mode: 'string' }),
  timesApplied: integer("times_applied").default(0).notNull(),
  avgImpactScore: numeric("avg_impact_score", { precision: 5, scale: 2 }).default(0).notNull(),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const sellerPaymentConfigs = pgTable("seller_payment_configs", {
  id: integer().default('nextval(seller_payment_configs_id_seq').primaryKey(),
  sellerId: varchar("seller_id"),
  commissionRate: numeric("commission_rate", { precision: 5, scale: 2 }).default(15.00).notNull(),
  minCommission: numeric("min_commission", { precision: 15, scale: 2 }).default(0.00),
  preferredGateway: text("preferred_gateway"),
  autoPayoutEnabled: boolean("auto_payout_enabled").default(false).notNull(),
  payoutSchedule: text("payout_schedule").default('weekly'),
  bankDetails: jsonb("bank_details").default({}),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
  unique("seller_payment_configs_seller_id_key").on(table.sellerId),
]);

export const sellerRatings = pgTable("seller_ratings", {
  id: varchar().default(sql`gen_random_uuid()`).primaryKey(),
  sellerId: varchar("seller_id").notNull(),
  overallRating: numeric("overall_rating", { precision: 3, scale: 2 }).default(0).notNull(),
  totalReviews: integer("total_reviews").default(0).notNull(),
  totalRatings: integer("total_ratings").default(0).notNull(),
  deliverySpeedRating: numeric("delivery_speed_rating", { precision: 3, scale: 2 }).default(0).notNull(),
  bookConditionRating: numeric("book_condition_rating", { precision: 3, scale: 2 }).default(0).notNull(),
  customerServiceRating: numeric("customer_service_rating", { precision: 3, scale: 2 }).default(0).notNull(),
  pricingRating: numeric("pricing_rating", { precision: 3, scale: 2 }).default(0).notNull(),
  culturalSensitivityRating: numeric("cultural_sensitivity_rating", { precision: 3, scale: 2 }).default(0).notNull(),
  responseTimeHours: numeric("response_time_hours", { precision: 5, scale: 2 }).default(0).notNull(),
  fulfillmentAccuracyPercent: numeric("fulfillment_accuracy_percent", { precision: 5, scale: 2 }).default(0).notNull(),
  lastUpdatedAt: timestamp("last_updated_at", { mode: 'string' }).defaultNow(),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const sessions = pgTable("sessions", {
  sid: varchar().primaryKey(),
  sess: jsonb().notNull(),
  expire: timestamp({ mode: 'string' }).notNull(),
});

export const shareVerifications = pgTable("share_verifications", {
  id: varchar().default(sql`gen_random_uuid()`).primaryKey(),
  participationId: varchar("participation_id").notNull(),
  verifiedAt: timestamp("verified_at", { mode: 'string' }).defaultNow().notNull(),
  attemptNumber: integer("attempt_number").notNull(),
  postExists: boolean("post_exists").notNull(),
  postId: text("post_id"),
  postDeleted: boolean("post_deleted").default(false).notNull(),
  likes: integer().default(0),
  shares: integer().default(0),
  comments: integer().default(0),
  passed: boolean().notNull(),
  failureReason: text("failure_reason"),
  rawResponse: jsonb("raw_response").default({}),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
});

export const shippingZones = pgTable("shipping_zones", {
  id: varchar().default(sql`gen_random_uuid()`).primaryKey(),
  name: text().notNull(),
  description: text(),
  minDistanceKm: numeric("min_distance_km", { precision: 10, scale: 2 }).default(0).notNull(),
  maxDistanceKm: numeric("max_distance_km", { precision: 10, scale: 2 }).notNull(),
  shippingFee: numeric("shipping_fee", { precision: 15, scale: 2 }).default(0).notNull(),
  isFreeShipTimeWindow: boolean("is_free_ship_time_window").default(false).notNull(),
  freeShipStartHour: integer("free_ship_start_hour"),
  freeShipEndHour: integer("free_ship_end_hour"),
  freeShipDays: jsonb("free_ship_days").default(sql`'[1, 2, 3, 4, 5, 6, 0]'::jsonb`),
  estimatedDeliveryDays: text("estimated_delivery_days"),
  zoneType: text("zone_type").default('standard').notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const shopSettings = pgTable("shop_settings", {
  id: varchar().default(sql`gen_random_uuid()`).primaryKey(),
  businessName: text("business_name").notNull(),
  phone: text().notNull(),
  email: text().notNull(),
  address: text().notNull(),
  description: text(),
  website: text(),
  logo: text(),
  isDefault: boolean("is_default").default(true).notNull(),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
  tagline: text(),
  logoUrl: text("logo_url"),
  zaloNumber: text("zalo_number"),
  rating: numeric({ precision: 2, scale: 1 }),
  totalReviews: integer("total_reviews"),
  workingHours: text("working_hours"),
  workingDays: text("working_days"),
  support247: boolean("support_247").default(false),
  footerMenuProducts: jsonb("footer_menu_products").default([]),
  footerMenuSupport: jsonb("footer_menu_support").default([]),
  footerMenuConnect: jsonb("footer_menu_connect").default([]),
  appStoreUrl: text("app_store_url"),
  googlePlayUrl: text("google_play_url"),
  copyrightMain: text("copyright_main"),
  copyrightSub: text("copyright_sub"),
  termsUrl: text("terms_url"),
  privacyUrl: text("privacy_url"),
  sitemapUrl: text("sitemap_url"),
  featureBoxes: jsonb("feature_boxes").default([]),
  quickLinks: jsonb("quick_links").default([]),
  heroSlider: jsonb("hero_slider").default([]),
  shopLatitude: numeric("shop_latitude", { precision: 10, scale: 8 }),
  shopLongitude: numeric("shop_longitude", { precision: 11, scale: 8 }),
  localRadiusKm: numeric("local_radius_km", { precision: 6, scale: 2 }).default(20.00),
});

export const shopeeBusinessAccounts = pgTable("shopee_business_accounts", {
  id: varchar().default(sql`gen_random_uuid()`).primaryKey(),
  partnerId: text("partner_id").notNull(),
  shopId: text("shop_id").notNull(),
  displayName: text("display_name").notNull(),
  shopName: text("shop_name").notNull(),
  shopLogo: text("shop_logo"),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  tokenExpiresAt: timestamp("token_expires_at", { mode: 'string' }),
  partnerKey: text("partner_key"),
  shopType: text("shop_type"),
  shopStatus: text("shop_status").default('normal'),
  region: text().default('VN').notNull(),
  currency: text().default('VND').notNull(),
  businessType: text("business_type"),
  businessLicense: text("business_license"),
  taxId: text("tax_id"),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  rating: numeric({ precision: 3, scale: 2 }).default(0.00),
  responseRate: numeric("response_rate", { precision: 5, scale: 2 }).default(0.00),
  responseTime: integer("response_time").default(0),
  followerCount: integer("follower_count").default(0),
  productCount: integer("product_count").default(0),
  totalOrders: integer("total_orders").default(0),
  totalRevenue: numeric("total_revenue", { precision: 15, scale: 2 }).default(0),
  avgOrderValue: numeric("avg_order_value", { precision: 15, scale: 2 }).default(0),
  lastOrderAt: timestamp("last_order_at", { mode: 'string' }),
  lastSync: timestamp("last_sync", { mode: 'string' }),
  tagIds: jsonb("tag_ids").default([]),
  isActive: boolean("is_active").default(true),
  connected: boolean().default(false),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
  unique("shopee_business_accounts_shop_id_key").on(table.shopId),
]);

export const shopeeShopOrders = pgTable("shopee_shop_orders", {
  id: varchar().default(sql`gen_random_uuid()`).primaryKey(),
  shopeeOrderId: text("shopee_order_id").notNull(),
  orderSn: text("order_sn").notNull(),
  shopId: text("shop_id").notNull(),
  businessAccountId: varchar("business_account_id"),
  orderNumber: text("order_number").notNull(),
  orderStatus: text("order_status").default('unpaid').notNull(),
  customerInfo: jsonb("customer_info").notNull(),
  totalAmount: numeric("total_amount", { precision: 15, scale: 2 }).notNull(),
  currency: text().default('VND').notNull(),
  actualShippingFee: numeric("actual_shipping_fee", { precision: 15, scale: 2 }).default(0),
  goodsToReceive: numeric("goods_to_receive", { precision: 15, scale: 2 }).default(0),
  coinOffset: numeric("coin_offset", { precision: 15, scale: 2 }).default(0),
  escrowAmount: numeric("escrow_amount", { precision: 15, scale: 2 }).default(0),
  items: jsonb().notNull(),
  shippingCarrier: text("shipping_carrier"),
  trackingNumber: text("tracking_number"),
  shipTime: timestamp("ship_time", { mode: 'string' }),
  deliveryTime: timestamp("delivery_time", { mode: 'string' }),
  actualShippingFeeConfirmed: boolean("actual_shipping_fee_confirmed").default(false),
  paymentMethod: text("payment_method"),
  creditCardNumber: text("credit_card_number"),
  dropshipper: text(),
  dropshipperPhone: text("dropshipper_phone"),
  splitUp: boolean("split_up").default(false),
  buyerCancelReason: text("buyer_cancel_reason"),
  cancelBy: text("cancel_by"),
  cancelReason: text("cancel_reason"),
  actualShippingProvider: text("actual_shipping_provider"),
  packageNumber: text("package_number"),
  shopeeFee: numeric("shopee_fee", { precision: 15, scale: 2 }).default(0),
  transactionFee: numeric("transaction_fee", { precision: 15, scale: 2 }).default(0),
  commissionFee: numeric("commission_fee", { precision: 15, scale: 2 }).default(0),
  serviceFee: numeric("service_fee", { precision: 15, scale: 2 }).default(0),
  tagIds: jsonb("tag_ids").default([]),
  notes: text(),
  createTime: timestamp("create_time", { mode: 'string' }).notNull(),
  updateTime: timestamp("update_time", { mode: 'string' }),
  payTime: timestamp("pay_time", { mode: 'string' }),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
  unique("shopee_shop_orders_shopee_order_id_key").on(table.shopeeOrderId),
]);

export const shopeeShopProducts = pgTable("shopee_shop_products", {
  id: varchar().default(sql`gen_random_uuid()`).primaryKey(),
  productId: varchar("product_id"),
  shopeeItemId: text("shopee_item_id").notNull(),
  shopId: text("shop_id").notNull(),
  businessAccountId: varchar("business_account_id"),
  syncEnabled: boolean("sync_enabled").default(true),
  autoSync: boolean("auto_sync").default(false),
  syncDirection: text("sync_direction").default('to_shopee'),
  itemName: text("item_name"),
  itemSku: text("item_sku"),
  description: text(),
  originalPrice: numeric("original_price", { precision: 15, scale: 2 }),
  currentPrice: numeric("current_price", { precision: 15, scale: 2 }),
  stock: integer(),
  itemStatus: text("item_status").default('normal'),
  categoryId: integer("category_id"),
  categoryName: text("category_name"),
  weight: numeric({ precision: 8, scale: 3 }),
  dimension: jsonb(),
  condition: text().default('new'),
  wholesaleEnabled: boolean("wholesale_enabled").default(false),
  sales: integer().default(0),
  views: integer().default(0),
  likes: integer().default(0),
  rating: numeric({ precision: 3, scale: 2 }).default(0.00),
  ratingCount: integer("rating_count").default(0),
  logisticEnabled: boolean("logistic_enabled").default(true),
  daysToShip: integer("days_to_ship").default(3),
  lastSyncAt: timestamp("last_sync_at", { mode: 'string' }),
  syncStatus: text("sync_status").default('pending'),
  syncError: text("sync_error"),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
  unique("shopee_shop_products_shopee_item_id_shop_id_key").on(table.shopeeItemId, table.shopId),
]);

export const socialAccounts = pgTable("social_accounts", {
  id: varchar().default(sql`gen_random_uuid()`).primaryKey(),
  platform: text().notNull(),
  name: text().notNull(),
  accountId: text("account_id").notNull(),
  accessToken: text("access_token"),
  followers: integer().default(0),
  connected: boolean().default(false),
  lastPost: timestamp("last_post", { mode: 'string' }),
  engagement: numeric({ precision: 5, scale: 2 }).default(0),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  refreshToken: text("refresh_token"),
  tokenExpiresAt: timestamp("token_expires_at", { mode: 'string' }),
  pageAccessTokens: jsonb("page_access_tokens").default([]),
  webhookSubscriptions: jsonb("webhook_subscriptions").default([]),
  lastSync: timestamp("last_sync", { mode: 'string' }),
  isActive: boolean("is_active").default(true),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
  tagIds: jsonb("tag_ids").default([]),
  contentPreferences: jsonb("content_preferences").default(sql`'{"brandVoice": "friendly", "mediaRatio": {"image": 70, "video": 25, "textOnly": 5}, "excludedTags": [], "hashtagCount": 5, "postingTimes": ["09:00", "14:00", "21:00"], "contentLength": "medium", "preferredTags": [], "topicCategories": []}'::jsonb`),
  schedulingRules: jsonb("scheduling_rules").default(sql`'{"enabled": true, "timeSpacing": 60, "maxPostsPerDay": 8, "distributionMode": "weighted", "respectPeakHours": true, "conflictResolution": "ask"}'::jsonb`),
  performanceScore: numeric("performance_score", { precision: 5, scale: 2 }).default(0),
  lastOptimization: timestamp("last_optimization", { mode: 'string' }),
  botConfig: jsonb("bot_config").default({}),
  facebookAppId: varchar("facebook_app_id"),
});

export const stockReservations = pgTable("stock_reservations", {
  id: varchar().default(sql`gen_random_uuid()`).primaryKey(),
  productId: varchar("product_id").notNull(),
  affiliateId: varchar("affiliate_id").notNull(),
  orderId: varchar("order_id"),
  quantity: integer().notNull(),
  reservationType: text("reservation_type").default('cart').notNull(),
  reservedAt: timestamp("reserved_at", { mode: 'string' }).defaultNow().notNull(),
  expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
  releasedAt: timestamp("released_at", { mode: 'string' }),
  status: text().default('active').notNull(),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const storefrontConfig = pgTable("storefront_config", {
  id: varchar().default(sql`gen_random_uuid()`).primaryKey(),
  name: text().notNull(),
  topProductsCount: integer("top_products_count").default(10).notNull(),
  displayMode: text("display_mode").default('auto').notNull(),
  selectedProductIds: jsonb("selected_product_ids"),
  isActive: boolean("is_active").default(true).notNull(),
  theme: text().default('organic').notNull(),
  primaryColor: text("primary_color").default('#4ade80').notNull(),
  contactInfo: jsonb("contact_info").notNull(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
  unique("storefront_config_name_unique").on(table.name),
]);

export const storefrontOrders = pgTable("storefront_orders", {
  id: varchar().default(sql`gen_random_uuid()`).primaryKey(),
  storefrontConfigId: varchar("storefront_config_id").notNull(),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  customerEmail: text("customer_email"),
  customerAddress: text("customer_address"),
  productId: varchar("product_id").notNull(),
  productName: text("product_name").notNull(),
  quantity: integer().default(1).notNull(),
  price: numeric({ precision: 15, scale: 2 }).notNull(),
  total: numeric({ precision: 15, scale: 2 }).notNull(),
  deliveryType: text("delivery_type").default('local_delivery').notNull(),
  status: text().default('pending').notNull(),
  notes: text(),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
  affiliateCode: text("affiliate_code"),
});

export const templateCompilations = pgTable("template_compilations", {
  id: varchar().default(sql`gen_random_uuid()`).primaryKey(),
  templateId: varchar("template_id").notNull(),
  templateType: varchar("template_type").notNull(),
  framework: varchar().default('react').notNull(),
  customizationHash: varchar("customization_hash").notNull(),
  compiledCode: text("compiled_code").notNull(),
  dependencies: jsonb().default([]),
  devDependencies: jsonb("dev_dependencies").default([]),
  appliedTheme: jsonb("applied_theme"),
  version: varchar().default(1.0).notNull(),
  isValid: boolean("is_valid").default(true).notNull(),
  expiresAt: timestamp("expires_at", { mode: 'string' }),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
  unique("template_compilations_template_id_template_type_customizati_key").on(table.templateId, table.templateType, table.customizationHash, table.framework),
]);

export const themeConfigurations = pgTable("theme_configurations", {
  id: varchar().default(sql`gen_random_uuid()`).primaryKey(),
  name: text().notNull(),
  description: text(),
  colorPalette: jsonb("color_palette").default({}).notNull(),
  typography: jsonb().default({}).notNull(),
  spacing: jsonb().default({}).notNull(),
  componentStyles: jsonb("component_styles").default({}).notNull(),
  brandGuidelines: jsonb("brand_guidelines").default({}).notNull(),
  accessibility: jsonb().default({}).notNull(),
  psychology: jsonb().default({}).notNull(),
  isTemplate: boolean("is_template").default(false).notNull(),
  industry: text(),
  conversionRate: numeric("conversion_rate", { precision: 5, scale: 2 }),
  createdBy: varchar("created_by"),
  isPublic: boolean("is_public").default(false).notNull(),
  usageCount: integer("usage_count").default(0).notNull(),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const tiktokBusinessAccounts = pgTable("tiktok_business_accounts", {
  id: varchar().default(sql`gen_random_uuid()`).primaryKey(),
  businessId: text("business_id").notNull(),
  displayName: text("display_name").notNull(),
  username: text().notNull(),
  avatarUrl: text("avatar_url"),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  tokenExpiresAt: timestamp("token_expires_at", { mode: 'string' }),
  scope: jsonb().default([]),
  businessType: text("business_type"),
  industry: text(),
  website: text(),
  description: text(),
  shopEnabled: boolean("shop_enabled").default(false),
  shopId: text("shop_id"),
  shopStatus: text("shop_status").default('not_connected'),
  followerCount: integer("follower_count").default(0),
  followingCount: integer("following_count").default(0),
  videoCount: integer("video_count").default(0),
  likeCount: integer("like_count").default(0),
  engagement: numeric({ precision: 5, scale: 2 }).default(0),
  avgViews: integer("avg_views").default(0),
  lastPost: timestamp("last_post", { mode: 'string' }),
  lastSync: timestamp("last_sync", { mode: 'string' }),
  isActive: boolean("is_active").default(true),
  connected: boolean().default(false),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
  tagIds: jsonb("tag_ids").default([]),
}, (table) => [
  unique("tiktok_business_accounts_business_id_unique").on(table.businessId),
]);

export const tiktokShopOrders = pgTable("tiktok_shop_orders", {
  id: varchar().default(sql`gen_random_uuid()`).primaryKey(),
  tiktokOrderId: text("tiktok_order_id").notNull(),
  shopId: text("shop_id").notNull(),
  businessAccountId: varchar("business_account_id"),
  orderNumber: text("order_number").notNull(),
  status: text().default('pending').notNull(),
  customerInfo: jsonb("customer_info").notNull(),
  totalAmount: numeric("total_amount", { precision: 15, scale: 2 }).notNull(),
  currency: text().default('VND').notNull(),
  taxAmount: numeric("tax_amount", { precision: 15, scale: 2 }).default(0),
  shippingAmount: numeric("shipping_amount", { precision: 15, scale: 2 }).default(0),
  discountAmount: numeric("discount_amount", { precision: 15, scale: 2 }).default(0),
  items: jsonb().notNull(),
  fulfillmentStatus: text("fulfillment_status").default('pending'),
  trackingNumber: text("tracking_number"),
  shippingCarrier: text("shipping_carrier"),
  shippedAt: timestamp("shipped_at", { mode: 'string' }),
  deliveredAt: timestamp("delivered_at", { mode: 'string' }),
  paymentMethod: text("payment_method"),
  paymentStatus: text("payment_status"),
  tiktokFees: numeric("tiktok_fees", { precision: 15, scale: 2 }).default(0),
  notes: text(),
  orderDate: timestamp("order_date", { mode: 'string' }).notNull(),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
  tagIds: jsonb("tag_ids").default([]),
}, (table) => [
  unique("tiktok_shop_orders_tiktok_order_id_unique").on(table.tiktokOrderId),
]);

export const tiktokShopProducts = pgTable("tiktok_shop_products", {
  id: varchar().default(sql`gen_random_uuid()`).primaryKey(),
  productId: varchar("product_id"),
  tiktokProductId: text("tiktok_product_id").notNull(),
  shopId: text("shop_id").notNull(),
  businessAccountId: varchar("business_account_id"),
  syncEnabled: boolean("sync_enabled").default(true),
  autoSync: boolean("auto_sync").default(false),
  syncDirection: text("sync_direction").default('to_tiktok'),
  tiktokSku: text("tiktok_sku"),
  tiktokTitle: text("tiktok_title"),
  tiktokDescription: text("tiktok_description"),
  tiktokPrice: numeric("tiktok_price", { precision: 15, scale: 2 }),
  tiktokStock: integer("tiktok_stock"),
  tiktokStatus: text("tiktok_status").default('pending_review'),
  views: integer().default(0),
  orders: integer().default(0),
  revenue: numeric({ precision: 15, scale: 2 }).default(0),
  conversionRate: numeric("conversion_rate", { precision: 5, scale: 2 }).default(0),
  lastSyncAt: timestamp("last_sync_at", { mode: 'string' }),
  syncStatus: text("sync_status").default('pending'),
  syncError: text("sync_error"),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
  tagIds: jsonb("tag_ids").default([]),
});

export const tiktokVideos = pgTable("tiktok_videos", {
  id: varchar().default(sql`gen_random_uuid()`).primaryKey(),
  videoId: text("video_id").notNull(),
  businessAccountId: varchar("business_account_id").notNull(),
  caption: text(),
  description: text(),
  thumbnailUrl: text("thumbnail_url"),
  videoUrl: text("video_url"),
  duration: integer(),
  views: integer().default(0),
  likes: integer().default(0),
  comments: integer().default(0),
  shares: integer().default(0),
  engagementRate: numeric("engagement_rate", { precision: 5, scale: 2 }).default(0),
  shopProductsTagged: jsonb("shop_products_tagged").default([]),
  salesFromVideo: numeric("sales_from_video", { precision: 15, scale: 2 }).default(0),
  clickthroughRate: numeric("clickthrough_rate", { precision: 5, scale: 2 }).default(0),
  status: text().default('published'),
  publishedAt: timestamp("published_at", { mode: 'string' }),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
  tagIds: jsonb("tag_ids").default([]),
}, (table) => [
  unique("tiktok_videos_video_id_unique").on(table.videoId),
]);

export const trips = pgTable("trips", {
  id: varchar().default(sql`gen_random_uuid()`).primaryKey(),
  driverId: varchar("driver_id").notNull(),
  vehicleId: varchar("vehicle_id").notNull(),
  routeName: text("route_name").notNull(),
  departureLocation: text("departure_location").notNull(),
  arrivalLocation: text("arrival_location").notNull(),
  stops: jsonb().default([]),
  distance: numeric({ precision: 10, scale: 2 }),
  departureTime: timestamp("departure_time", { mode: 'string' }).notNull(),
  arrivalTime: timestamp("arrival_time", { mode: 'string' }).notNull(),
  actualArrivalTime: timestamp("actual_arrival_time", { mode: 'string' }),
  ticketPrice: numeric("ticket_price", { precision: 15, scale: 2 }).notNull(),
  currency: text().default('VND').notNull(),
  totalSeats: integer("total_seats").notNull(),
  bookedSeats: integer("booked_seats").default(0).notNull(),
  availableSeats: integer("available_seats").notNull(),
  passengerList: jsonb("passenger_list").default([]),
  status: text().default('scheduled').notNull(),
  totalRevenue: numeric("total_revenue", { precision: 15, scale: 2 }).default(0),
  expenses: numeric({ precision: 15, scale: 2 }).default(0),
  netProfit: numeric("net_profit", { precision: 15, scale: 2 }).default(0),
  notes: text(),
  cancellationReason: text("cancellation_reason"),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
  completedAt: timestamp("completed_at", { mode: 'string' }),
});

export const unifiedTags = pgTable("unified_tags", {
  id: varchar().default(sql`gen_random_uuid()`).primaryKey(),
  name: text().notNull(),
  slug: varchar({ length: 100 }).notNull(),
  category: text().default('general').notNull(),
  platforms: jsonb().default(sql`'["facebook", "tiktok", "instagram"]'::jsonb`),
  color: varchar({ length: 7 }).default('#3B82F6').notNull(),
  icon: varchar({ length: 50 }),
  description: text(),
  keywords: jsonb().default([]),
  usageCount: integer("usage_count").default(0),
  lastUsed: timestamp("last_used", { mode: 'string' }),
  isSystemDefault: boolean("is_system_default").default(false),
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
  unique("unified_tags_slug_unique").on(table.slug),
]);

export const userSatisfactionScores = pgTable("user_satisfaction_scores", {
  id: varchar().default(sql`gen_random_uuid()`).primaryKey(),
  sessionId: varchar("session_id").notNull(),
  userId: varchar("user_id"),
  rating: integer().notNull(),
  feedbackText: text("feedback_text"),
  feedbackCategory: text("feedback_category"),
  resolutionAchieved: boolean("resolution_achieved").default(false),
  responseQuality: integer("response_quality"),
  speedSatisfaction: integer("speed_satisfaction"),
  overallExperience: text("overall_experience"),
  wouldRecommend: boolean("would_recommend"),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const userSessions = pgTable("user_sessions", {
  sid: varchar().primaryKey(),
  sess: text().notNull(),
  expire: timestamp({ mode: 'string' }).notNull(),
});

export const userTemplates = pgTable("user_templates", {
  id: varchar().default(sql`gen_random_uuid()`).primaryKey(),
  userId: varchar("user_id"),
  name: text().notNull(),
  description: text(),
  baseTemplateId: varchar("base_template_id").notNull(),
  customizations: jsonb().notNull(),
  platforms: jsonb().default(sql`'["all"]'::jsonb`).notNull(),
  category: varchar().default('custom').notNull(),
  isPublic: boolean("is_public").default(false).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  tags: jsonb().default([]),
  usageCount: integer("usage_count").default(0).notNull(),
  rating: numeric({ precision: 3, scale: 2 }).default(0.00),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const users = pgTable("users", {
  id: varchar().default(sql`gen_random_uuid()`).primaryKey(),
  username: text().notNull(),
  password: text().notNull(),
}, (table) => [
  unique("users_username_unique").on(table.username),
]);

export const vehicleGroupAssignments = pgTable("vehicle_group_assignments", {
  id: varchar().default(sql`gen_random_uuid()`).primaryKey(),
  vehicleId: varchar("vehicle_id").notNull(),
  groupId: varchar("group_id").notNull(),
  assignedAt: timestamp("assigned_at", { mode: 'string' }).defaultNow(),
  assignedBy: varchar("assigned_by"),
  notes: text(),
}, (table) => [
  unique("vehicle_group_assignments_vehicle_id_group_id_key").on(table.vehicleId, table.groupId),
]);

export const vehicles = pgTable("vehicles", {
  id: varchar().default(sql`gen_random_uuid()`).primaryKey(),
  driverId: varchar("driver_id").notNull(),
  licensePlate: text("license_plate").notNull(),
  vehicleType: text("vehicle_type").notNull(),
  brand: text(),
  model: text(),
  color: text(),
  year: integer(),
  seatingCapacity: integer("seating_capacity"),
  cargoCapacity: numeric("cargo_capacity", { precision: 10, scale: 2 }),
  registrationNumber: text("registration_number"),
  registrationExpiry: timestamp("registration_expiry", { mode: 'string' }),
  insuranceNumber: text("insurance_number"),
  insuranceExpiry: timestamp("insurance_expiry", { mode: 'string' }),
  status: text().default('active').notNull(),
  isVerified: boolean("is_verified").default(false).notNull(),
  images: jsonb().default([]),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
  verifiedAt: timestamp("verified_at", { mode: 'string' }),
  verifiedBy: varchar("verified_by"),
}, (table) => [
  unique("vehicles_license_plate_key").on(table.licensePlate),
]);

export const vendorOrders = pgTable("vendor_orders", {
  id: varchar().default(sql`gen_random_uuid()`).primaryKey(),
  vendorId: varchar("vendor_id").notNull(),
  orderId: varchar("order_id").notNull(),
  maskedCustomerName: varchar("masked_customer_name"),
  maskedCustomerPhone: varchar("masked_customer_phone"),
  maskedCustomerAddress: text("masked_customer_address"),
  shippingProvider: varchar("shipping_provider"),
  shippingCode: varchar("shipping_code"),
  shippingLabelUrl: text("shipping_label_url"),
  codAmount: numeric("cod_amount", { precision: 15, scale: 2 }),
  vendorCost: numeric("vendor_cost", { precision: 15, scale: 2 }),
  commissionAmount: numeric("commission_amount", { precision: 15, scale: 2 }),
  depositDeducted: boolean("deposit_deducted").default(false),
  status: varchar().default('pending'),
  processingAt: timestamp("processing_at", { mode: 'string' }),
  shippedAt: timestamp("shipped_at", { mode: 'string' }),
  deliveredAt: timestamp("delivered_at", { mode: 'string' }),
  cancelledAt: timestamp("cancelled_at", { mode: 'string' }),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const vendorProducts = pgTable("vendor_products", {
  id: varchar().default(sql`gen_random_uuid()`).primaryKey(),
  vendorId: varchar("vendor_id").notNull(),
  productId: varchar("product_id").notNull(),
  quantityConsigned: integer("quantity_consigned").default(0).notNull(),
  quantitySold: integer("quantity_sold").default(0).notNull(),
  quantityReturned: integer("quantity_returned").default(0).notNull(),
  consignmentPrice: numeric("consignment_price", { precision: 15, scale: 2 }).notNull(),
  discountPercent: numeric("discount_percent", { precision: 5, scale: 2 }).default(0),
  consignmentDate: timestamp("consignment_date", { mode: 'string' }).defaultNow().notNull(),
  expiryDate: timestamp("expiry_date", { mode: 'string' }),
  status: varchar().default('active'),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
  commissionPerUnit: numeric("commission_per_unit", { precision: 15, scale: 2 }).default(0.00),
}, (table) => [
  unique("vendor_products_vendor_id_product_id_key").on(table.vendorId, table.productId),
]);

export const vendors = pgTable("vendors", {
  id: varchar().default(sql`gen_random_uuid()`).primaryKey(),
  name: varchar().notNull(),
  contactPerson: varchar("contact_person"),
  email: varchar().notNull(),
  phone: varchar(),
  passwordHash: varchar("password_hash").notNull(),
  warehouseAddress: text("warehouse_address"),
  warehouseCity: varchar("warehouse_city"),
  warehouseDistrict: varchar("warehouse_district"),
  warehouseWard: varchar("warehouse_ward"),
  depositBalance: numeric("deposit_balance", { precision: 15, scale: 2 }).default(0).notNull(),
  depositTotal: numeric("deposit_total", { precision: 15, scale: 2 }).default(0).notNull(),
  minimumDeposit: numeric("minimum_deposit", { precision: 15, scale: 2 }).default(1000000).notNull(),
  paymentMethod: varchar("payment_method").default('deposit'),
  bankInfo: jsonb("bank_info").default({}),
  commissionRate: numeric("commission_rate", { precision: 5, scale: 2 }).default(0.30).notNull(),
  notificationPreferences: jsonb("notification_preferences").default({}),
  status: varchar().default('pending'),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
  password: text().default('').notNull(),
  lastLoginAt: timestamp("last_login_at", { mode: 'string' }),
  warehousePostalCode: text("warehouse_postal_code"),
  warehousePhone: text("warehouse_phone"),
  paymentModel: text("payment_model").default('deposit').notNull(),
  monthlyDebt: numeric("monthly_debt", { precision: 15, scale: 2 }).default(0.00).notNull(),
}, (table) => [
  unique("vendors_email_key").on(table.email),
  unique("vendors_email_unique").on(table.email),
]);

export const vietnameseReviewTemplates = pgTable("vietnamese_review_templates", {
  id: varchar().default(sql`gen_random_uuid()`).primaryKey(),
  templateName: text("template_name").notNull(),
  templateCategory: varchar("template_category", { length: 20 }).notNull(),
  regionDialect: varchar("region_dialect", { length: 20 }).default('miền-bắc').notNull(),
  bookCategory: varchar("book_category", { length: 50 }),
  reviewTitleTemplate: text("review_title_template").notNull(),
  reviewContentTemplate: text("review_content_template").notNull(),
  sentimentScore: numeric("sentiment_score", { precision: 3, scale: 2 }).default(0).notNull(),
  formalityLevel: varchar("formality_level", { length: 20 }).default('casual'),
  ageGroup: varchar("age_group", { length: 20 }).default('adult'),
  usageCount: integer("usage_count").default(0),
  isActive: boolean("is_active").default(true),
  tags: text().default('{}'),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const workers = pgTable("workers", {
  id: varchar().default(sql`gen_random_uuid()`).primaryKey(),
  workerId: text("worker_id").notNull(),
  name: text().notNull(),
  description: text(),
  platforms: jsonb().notNull(),
  capabilities: jsonb().notNull(),
  specialties: jsonb(),
  maxConcurrentJobs: integer("max_concurrent_jobs").default(3).notNull(),
  minJobInterval: integer("min_job_interval").default(300).notNull(),
  maxJobsPerHour: integer("max_jobs_per_hour").default(12).notNull(),
  avgExecutionTime: integer("avg_execution_time").default(5000).notNull(),
  region: text().notNull(),
  environment: text().default('production').notNull(),
  deploymentPlatform: text("deployment_platform").notNull(),
  endpointUrl: text("endpoint_url").notNull(),
  status: text().default('active').notNull(),
  isOnline: boolean("is_online").default(false).notNull(),
  lastPingAt: timestamp("last_ping_at", { mode: 'string' }),
  lastJobAt: timestamp("last_job_at", { mode: 'string' }),
  currentLoad: integer("current_load").default(0).notNull(),
  totalJobsCompleted: integer("total_jobs_completed").default(0).notNull(),
  totalJobsFailed: integer("total_jobs_failed").default(0).notNull(),
  successRate: numeric("success_rate", { precision: 5, scale: 2 }).default(0.00).notNull(),
  avgResponseTime: integer("avg_response_time").default(0).notNull(),
  registrationSecret: text("registration_secret"),
  authToken: text("auth_token"),
  tokenExpiresAt: timestamp("token_expires_at", { mode: 'string' }),
  tags: jsonb(),
  priority: integer().default(1).notNull(),
  isEnabled: boolean("is_enabled").default(true).notNull(),
  metadata: jsonb(),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
  ipAddress: text("ip_address"),
  ipCountry: text("ip_country"),
  ipRegion: text("ip_region"),
}, (table) => [
  unique("workers_worker_id_key").on(table.workerId),
]);

// Zod Schemas
export const insertAccountGroupsSchema = createInsertSchema(accountGroups);
export const selectAccountGroupsSchema = createSelectSchema(accountGroups);
export const insertAdminsSchema = createInsertSchema(admins);
export const selectAdminsSchema = createSelectSchema(admins);
export const insertAffiliateClicksSchema = createInsertSchema(affiliateClicks);
export const selectAffiliateClicksSchema = createSelectSchema(affiliateClicks);
export const insertAffiliateLandingPagesSchema = createInsertSchema(affiliateLandingPages);
export const selectAffiliateLandingPagesSchema = createSelectSchema(affiliateLandingPages);
export const insertAffiliateProductAssignmentsSchema = createInsertSchema(affiliateProductAssignments);
export const selectAffiliateProductAssignmentsSchema = createSelectSchema(affiliateProductAssignments);
export const insertAffiliateProductRequestsSchema = createInsertSchema(affiliateProductRequests);
export const selectAffiliateProductRequestsSchema = createSelectSchema(affiliateProductRequests);
export const insertApiConfigurationsSchema = createInsertSchema(apiConfigurations);
export const selectApiConfigurationsSchema = createSelectSchema(apiConfigurations);
export const insertAuthUsersSchema = createInsertSchema(authUsers);
export const selectAuthUsersSchema = createSelectSchema(authUsers);
export const insertBookAnalyticsSchema = createInsertSchema(bookAnalytics);
export const selectBookAnalyticsSchema = createSelectSchema(bookAnalytics);
export const insertBookCampaignRecipientsSchema = createInsertSchema(bookCampaignRecipients);
export const selectBookCampaignRecipientsSchema = createSelectSchema(bookCampaignRecipients);
export const insertBookCategoriesSchema = createInsertSchema(bookCategories);
export const selectBookCategoriesSchema = createSelectSchema(bookCategories);
export const insertBookCategoryAssignmentsSchema = createInsertSchema(bookCategoryAssignments);
export const selectBookCategoryAssignmentsSchema = createSelectSchema(bookCategoryAssignments);
export const insertBookCustomersSchema = createInsertSchema(bookCustomers);
export const selectBookCustomersSchema = createSelectSchema(bookCustomers);
export const insertBookMarketingCampaignsSchema = createInsertSchema(bookMarketingCampaigns);
export const selectBookMarketingCampaignsSchema = createSelectSchema(bookMarketingCampaigns);
export const insertBookOrderItemsSchema = createInsertSchema(bookOrderItems);
export const selectBookOrderItemsSchema = createSelectSchema(bookOrderItems);
export const insertBookOrderItemSchema = insertBookOrderItemsSchema;
export const selectBookOrderItemSchema = selectBookOrderItemsSchema;
export const insertBookOrdersSchema = createInsertSchema(bookOrders);
export const selectBookOrdersSchema = createSelectSchema(bookOrders);
export const insertBookOrderSchema = insertBookOrdersSchema;
export const selectBookOrderSchema = selectBookOrdersSchema;
export const insertBookPaymentTransactionsSchema = createInsertSchema(bookPaymentTransactions);
export const selectBookPaymentTransactionsSchema = createSelectSchema(bookPaymentTransactions);
export const insertBookPricesSchema = createInsertSchema(bookPrices);
export const selectBookPricesSchema = createSelectSchema(bookPrices);
export const insertBookPriceSchema = insertBookPricesSchema;
export const selectBookPriceSchema = selectBookPricesSchema;
export const insertBookPricingRulesSchema = createInsertSchema(bookPricingRules);
export const selectBookPricingRulesSchema = createSelectSchema(bookPricingRules);
export const insertBookSellerInventorySchema = createInsertSchema(bookSellerInventory);
export const selectBookSellerInventorySchema = createSelectSchema(bookSellerInventory);
export const insertBookSellersSchema = createInsertSchema(bookSellers);
export const selectBookSellersSchema = createSelectSchema(bookSellers);
export const insertBooksSchema = createInsertSchema(books);
export const selectBooksSchema = createSelectSchema(books);
export const insertBookSchema = insertBooksSchema;
export const selectBookSchema = selectBooksSchema;
export const insertBotSettingsSchema = createInsertSchema(botSettings);
export const selectBotSettingsSchema = createSelectSchema(botSettings);
export const insertCampaignParticipationsSchema = createInsertSchema(campaignParticipations);
export const selectCampaignParticipationsSchema = createSelectSchema(campaignParticipations);
export const insertCampaignsSchema = createInsertSchema(campaigns);
export const selectCampaignsSchema = createSelectSchema(campaigns);
export const insertCarGroupsSchema = createInsertSchema(carGroups);
export const selectCarGroupsSchema = createSelectSchema(carGroups);
export const insertCategoriesSchema = createInsertSchema(categories);
export const selectCategoriesSchema = createSelectSchema(categories);
export const insertCategoryFaqTemplatesSchema = createInsertSchema(categoryFaqTemplates);
export const selectCategoryFaqTemplatesSchema = createSelectSchema(categoryFaqTemplates);
export const insertCategoryPriceRulesSchema = createInsertSchema(categoryPriceRules);
export const selectCategoryPriceRulesSchema = createSelectSchema(categoryPriceRules);
export const insertChatbotConversationsSchema = createInsertSchema(chatbotConversations);
export const selectChatbotConversationsSchema = createSelectSchema(chatbotConversations);
export const insertCompetitorProfilesSchema = createInsertSchema(competitorProfiles);
export const selectCompetitorProfilesSchema = createSelectSchema(competitorProfiles);
export const insertConsignmentRequestsSchema = createInsertSchema(consignmentRequests);
export const selectConsignmentRequestsSchema = createSelectSchema(consignmentRequests);
export const insertContentAssetsSchema = createInsertSchema(contentAssets);
export const selectContentAssetsSchema = createSelectSchema(contentAssets);
export const insertContentCategoriesSchema = createInsertSchema(contentCategories);
export const selectContentCategoriesSchema = createSelectSchema(contentCategories);
export const insertContentFaqAssignmentsSchema = createInsertSchema(contentFaqAssignments);
export const selectContentFaqAssignmentsSchema = createSelectSchema(contentFaqAssignments);
export const insertContentLibrarySchema = createInsertSchema(contentLibrary);
export const selectContentLibrarySchema = createSelectSchema(contentLibrary);
export const insertContentQueueSchema = createInsertSchema(contentQueue);
export const selectContentQueueSchema = createSelectSchema(contentQueue);
export const insertConversationMessagesSchema = createInsertSchema(conversationMessages);
export const selectConversationMessagesSchema = createSelectSchema(conversationMessages);
export const insertConversationSessionsSchema = createInsertSchema(conversationSessions);
export const selectConversationSessionsSchema = createSelectSchema(conversationSessions);
export const insertCookieProfilesSchema = createInsertSchema(cookieProfiles);
export const selectCookieProfilesSchema = createSelectSchema(cookieProfiles);
export const insertCustomerEventsSchema = createInsertSchema(customerEvents);
export const selectCustomerEventsSchema = createSelectSchema(customerEvents);
export const insertCustomerReviewsSchema = createInsertSchema(customerReviews);
export const selectCustomerReviewsSchema = createSelectSchema(customerReviews);
export const insertCustomerVouchersSchema = createInsertSchema(customerVouchers);
export const selectCustomerVouchersSchema = createSelectSchema(customerVouchers);
export const insertCustomersSchema = createInsertSchema(customers);
export const selectCustomersSchema = createSelectSchema(customers);
export const insertDepositTransactionsSchema = createInsertSchema(depositTransactions);
export const selectDepositTransactionsSchema = createSelectSchema(depositTransactions);
export const insertDiscountCodeUsagesSchema = createInsertSchema(discountCodeUsages);
export const selectDiscountCodeUsagesSchema = createSelectSchema(discountCodeUsages);
export const insertDiscountCodesSchema = createInsertSchema(discountCodes);
export const selectDiscountCodesSchema = createSelectSchema(discountCodes);
export const insertDiscountScopeAssignmentsSchema = createInsertSchema(discountScopeAssignments);
export const selectDiscountScopeAssignmentsSchema = createSelectSchema(discountScopeAssignments);
export const insertDriverReportsSchema = createInsertSchema(driverReports);
export const selectDriverReportsSchema = createSelectSchema(driverReports);
export const insertFacebookAppsSchema = createInsertSchema(facebookApps);
export const selectFacebookAppsSchema = createSelectSchema(facebookApps);
export const insertFacebookConversationsSchema = createInsertSchema(facebookConversations);
export const selectFacebookConversationsSchema = createSelectSchema(facebookConversations);
export const insertFacebookMessagesSchema = createInsertSchema(facebookMessages);
export const selectFacebookMessagesSchema = createSelectSchema(facebookMessages);
export const insertFacebookWebhookEventsSchema = createInsertSchema(facebookWebhookEvents);
export const selectFacebookWebhookEventsSchema = createSelectSchema(facebookWebhookEvents);
export const insertFaqGenerationJobsSchema = createInsertSchema(faqGenerationJobs);
export const selectFaqGenerationJobsSchema = createSelectSchema(faqGenerationJobs);
export const insertFaqGenerationResultsSchema = createInsertSchema(faqGenerationResults);
export const selectFaqGenerationResultsSchema = createSelectSchema(faqGenerationResults);
export const insertFaqLibrarySchema = createInsertSchema(faqLibrary);
export const selectFaqLibrarySchema = createSelectSchema(faqLibrary);
export const updateFaqLibrarySchema = createInsertSchema(faqLibrary).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  usageCount: true,
  lastUsed: true,
}).partial();
export const insertFrontendCategoryAssignmentsSchema = createInsertSchema(frontendCategoryAssignments);
export const selectFrontendCategoryAssignmentsSchema = createSelectSchema(frontendCategoryAssignments);
export const insertGeneralCategoriesSchema = createInsertSchema(generalCategories);
export const selectGeneralCategoriesSchema = createSelectSchema(generalCategories);
export const insertGeneralCategoryAnalyticsSchema = createInsertSchema(generalCategoryAnalytics);
export const selectGeneralCategoryAnalyticsSchema = createSelectSchema(generalCategoryAnalytics);
export const insertGeneralCategoryAssignmentsSchema = createInsertSchema(generalCategoryAssignments);
export const selectGeneralCategoryAssignmentsSchema = createSelectSchema(generalCategoryAssignments);
export const insertGeneralCategoryPriceRulesSchema = createInsertSchema(generalCategoryPriceRules);
export const selectGeneralCategoryPriceRulesSchema = createSelectSchema(generalCategoryPriceRules);
export const insertGiftCampaignsSchema = createInsertSchema(giftCampaigns);
export const selectGiftCampaignsSchema = createSelectSchema(giftCampaigns);
export const insertGiftRedemptionsSchema = createInsertSchema(giftRedemptions);
export const selectGiftRedemptionsSchema = createSelectSchema(giftRedemptions);
export const insertGiftVouchersSchema = createInsertSchema(giftVouchers);
export const selectGiftVouchersSchema = createSelectSchema(giftVouchers);
export const insertGlobalAutomationControlSchema = createInsertSchema(globalAutomationControl);
export const selectGlobalAutomationControlSchema = createSelectSchema(globalAutomationControl);
export const insertIndustriesSchema = createInsertSchema(industries);
export const selectIndustriesSchema = createSelectSchema(industries);
export const insertIndustryKeywordsSchema = createInsertSchema(industryKeywords);
export const selectIndustryKeywordsSchema = createSelectSchema(industryKeywords);
export const insertIndustryRulesSchema = createInsertSchema(industryRules);
export const selectIndustryRulesSchema = createSelectSchema(industryRules);
export const insertIndustryTemplatesSchema = createInsertSchema(industryTemplates);
export const selectIndustryTemplatesSchema = createSelectSchema(industryTemplates);
export const insertIntentAnalyticsSchema = createInsertSchema(intentAnalytics);
export const selectIntentAnalyticsSchema = createSelectSchema(intentAnalytics);
export const insertInvoiceTemplatesSchema = createInsertSchema(invoiceTemplates);
export const selectInvoiceTemplatesSchema = createSelectSchema(invoiceTemplates);
export const insertIpPoolSessionsSchema = createInsertSchema(ipPoolSessions);
export const selectIpPoolSessionsSchema = createSelectSchema(ipPoolSessions);
export const insertIpPoolsSchema = createInsertSchema(ipPools);
export const selectIpPoolsSchema = createSelectSchema(ipPools);
export const insertIpRotationLogsSchema = createInsertSchema(ipRotationLogs);
export const selectIpRotationLogsSchema = createSelectSchema(ipRotationLogs);
export const insertMarketTrendsSchema = createInsertSchema(marketTrends);
export const selectMarketTrendsSchema = createSelectSchema(marketTrends);
export const insertOauthConnectionsSchema = createInsertSchema(oauthConnections);
export const selectOauthConnectionsSchema = createSelectSchema(oauthConnections);
export const insertOrderItemsSchema = createInsertSchema(orderItems);
export const selectOrderItemsSchema = createSelectSchema(orderItems);
export const insertOrdersSchema = createInsertSchema(orders);
export const selectOrdersSchema = createSelectSchema(orders);
export const insertPageTagsSchema = createInsertSchema(pageTags);
export const selectPageTagsSchema = createSelectSchema(pageTags);
export const insertPaymentGatewaySettingsSchema = createInsertSchema(paymentGatewaySettings);
export const selectPaymentGatewaySettingsSchema = createSelectSchema(paymentGatewaySettings);
export const insertPaymentsSchema = createInsertSchema(payments);
export const selectPaymentsSchema = createSelectSchema(payments);
export const insertPerformanceMetricsSchema = createInsertSchema(performanceMetrics);
export const selectPerformanceMetricsSchema = createSelectSchema(performanceMetrics);
export const insertPriceSourcesSchema = createInsertSchema(priceSources);
export const selectPriceSourcesSchema = createSelectSchema(priceSources);
export const insertPricingStrategiesSchema = createInsertSchema(pricingStrategies);
export const selectPricingStrategiesSchema = createSelectSchema(pricingStrategies);
export const insertProductFaqsSchema = createInsertSchema(productFaqs);
export const selectProductFaqsSchema = createSelectSchema(productFaqs);
export const insertProductLandingClicksSchema = createInsertSchema(productLandingClicks);
export const selectProductLandingClicksSchema = createSelectSchema(productLandingClicks);
export const insertProductLandingPagesSchema = createInsertSchema(productLandingPages);
export const selectProductLandingPagesSchema = createSelectSchema(productLandingPages);
export const insertProductPoliciesSchema = createInsertSchema(productPolicies);
export const selectProductPoliciesSchema = createSelectSchema(productPolicies);
export const insertProductPolicyAssociationsSchema = createInsertSchema(productPolicyAssociations);
export const selectProductPolicyAssociationsSchema = createSelectSchema(productPolicyAssociations);
export const insertProductReviewsSchema = createInsertSchema(productReviews);
export const selectProductReviewsSchema = createSelectSchema(productReviews);
export const insertProductsSchema = createInsertSchema(products);
export const selectProductsSchema = createSelectSchema(products);
export const insertProjectTemplatesSchema = createInsertSchema(projectTemplates);
export const selectProjectTemplatesSchema = createSelectSchema(projectTemplates);
export const insertPushSubscriptionsSchema = createInsertSchema(pushSubscriptions);
export const selectPushSubscriptionsSchema = createSelectSchema(pushSubscriptions);
export const insertQueueAutofillSettingsSchema = createInsertSchema(queueAutofillSettings);
export const selectQueueAutofillSettingsSchema = createSelectSchema(queueAutofillSettings);
export const insertQueueHistorySchema = createInsertSchema(queueHistory);
export const selectQueueHistorySchema = createSelectSchema(queueHistory);
export const insertRegistrationTokensSchema = createInsertSchema(registrationTokens);
export const selectRegistrationTokensSchema = createSelectSchema(registrationTokens);
export const insertReturnRequestsSchema = createInsertSchema(returnRequests);
export const selectReturnRequestsSchema = createSelectSchema(returnRequests);
export const insertSalesAutomationConfigsSchema = createInsertSchema(salesAutomationConfigs);
export const selectSalesAutomationConfigsSchema = createSelectSchema(salesAutomationConfigs);
export const insertSalesAutomationHistorySchema = createInsertSchema(salesAutomationHistory);
export const selectSalesAutomationHistorySchema = createSelectSchema(salesAutomationHistory);
export const insertSatisfactionSurveysSchema = createInsertSchema(satisfactionSurveys);
export const selectSatisfactionSurveysSchema = createSelectSchema(satisfactionSurveys);
export const insertScheduledPostsSchema = createInsertSchema(scheduledPosts);
export const selectScheduledPostsSchema = createSelectSchema(scheduledPosts);
export const insertSeasonalRulesSchema = createInsertSchema(seasonalRules);
export const selectSeasonalRulesSchema = createSelectSchema(seasonalRules);
export const insertSellerPaymentConfigsSchema = createInsertSchema(sellerPaymentConfigs);
export const selectSellerPaymentConfigsSchema = createSelectSchema(sellerPaymentConfigs);
export const insertSellerRatingsSchema = createInsertSchema(sellerRatings);
export const selectSellerRatingsSchema = createSelectSchema(sellerRatings);
export const insertSessionsSchema = createInsertSchema(sessions);
export const selectSessionsSchema = createSelectSchema(sessions);
export const insertShareVerificationsSchema = createInsertSchema(shareVerifications);
export const selectShareVerificationsSchema = createSelectSchema(shareVerifications);
export const insertShippingZonesSchema = createInsertSchema(shippingZones);
export const selectShippingZonesSchema = createSelectSchema(shippingZones);
export const insertShopSettingsSchema = createInsertSchema(shopSettings);
export const selectShopSettingsSchema = createSelectSchema(shopSettings);
export const insertShopeeBusinessAccountsSchema = createInsertSchema(shopeeBusinessAccounts);
export const selectShopeeBusinessAccountsSchema = createSelectSchema(shopeeBusinessAccounts);
export const insertShopeeShopOrdersSchema = createInsertSchema(shopeeShopOrders);
export const selectShopeeShopOrdersSchema = createSelectSchema(shopeeShopOrders);
export const insertShopeeShopProductsSchema = createInsertSchema(shopeeShopProducts);
export const selectShopeeShopProductsSchema = createSelectSchema(shopeeShopProducts);
export const insertSocialAccountsSchema = createInsertSchema(socialAccounts);
export const selectSocialAccountsSchema = createSelectSchema(socialAccounts);
export const insertStockReservationsSchema = createInsertSchema(stockReservations);
export const selectStockReservationsSchema = createSelectSchema(stockReservations);
export const insertStorefrontConfigSchema = createInsertSchema(storefrontConfig);
export const selectStorefrontConfigSchema = createSelectSchema(storefrontConfig);
export const insertStorefrontOrdersSchema = createInsertSchema(storefrontOrders);
export const selectStorefrontOrdersSchema = createSelectSchema(storefrontOrders);
export const insertTemplateCompilationsSchema = createInsertSchema(templateCompilations);
export const selectTemplateCompilationsSchema = createSelectSchema(templateCompilations);
export const insertThemeConfigurationsSchema = createInsertSchema(themeConfigurations);
export const selectThemeConfigurationsSchema = createSelectSchema(themeConfigurations);
export const insertTiktokBusinessAccountsSchema = createInsertSchema(tiktokBusinessAccounts);
export const selectTiktokBusinessAccountsSchema = createSelectSchema(tiktokBusinessAccounts);
export const insertTiktokShopOrdersSchema = createInsertSchema(tiktokShopOrders);
export const selectTiktokShopOrdersSchema = createSelectSchema(tiktokShopOrders);
export const insertTiktokShopProductsSchema = createInsertSchema(tiktokShopProducts);
export const selectTiktokShopProductsSchema = createSelectSchema(tiktokShopProducts);
export const insertTiktokVideosSchema = createInsertSchema(tiktokVideos);
export const selectTiktokVideosSchema = createSelectSchema(tiktokVideos);
export const insertTripsSchema = createInsertSchema(trips);
export const selectTripsSchema = createSelectSchema(trips);
export const insertUnifiedTagsSchema = createInsertSchema(unifiedTags);
export const selectUnifiedTagsSchema = createSelectSchema(unifiedTags);
export const insertUserSatisfactionScoresSchema = createInsertSchema(userSatisfactionScores);
export const selectUserSatisfactionScoresSchema = createSelectSchema(userSatisfactionScores);
export const insertUserSessionsSchema = createInsertSchema(userSessions);
export const selectUserSessionsSchema = createSelectSchema(userSessions);
export const insertUserTemplatesSchema = createInsertSchema(userTemplates);
export const selectUserTemplatesSchema = createSelectSchema(userTemplates);
export const insertUsersSchema = createInsertSchema(users);
export const selectUsersSchema = createSelectSchema(users);
export const insertVehicleGroupAssignmentsSchema = createInsertSchema(vehicleGroupAssignments);
export const selectVehicleGroupAssignmentsSchema = createSelectSchema(vehicleGroupAssignments);
export const insertVehiclesSchema = createInsertSchema(vehicles);
export const selectVehiclesSchema = createSelectSchema(vehicles);
export const insertVendorOrdersSchema = createInsertSchema(vendorOrders);
export const selectVendorOrdersSchema = createSelectSchema(vendorOrders);
export const insertVendorProductsSchema = createInsertSchema(vendorProducts);
export const selectVendorProductsSchema = createSelectSchema(vendorProducts);
export const insertVendorsSchema = createInsertSchema(vendors);
export const selectVendorsSchema = createSelectSchema(vendors);
export const insertVietnameseReviewTemplatesSchema = createInsertSchema(vietnameseReviewTemplates);
export const selectVietnameseReviewTemplatesSchema = createSelectSchema(vietnameseReviewTemplates);
export const insertWorkersSchema = createInsertSchema(workers);
export const selectWorkersSchema = createSelectSchema(workers);

// TypeScript Types
export type InsertAccountGroups = z.infer<typeof insertAccountGroupsSchema>;
export type AccountGroups = typeof accountGroups.$inferSelect;
export type InsertAdmins = z.infer<typeof insertAdminsSchema>;
export type Admins = typeof admins.$inferSelect;
export type InsertAffiliateClicks = z.infer<typeof insertAffiliateClicksSchema>;
export type AffiliateClicks = typeof affiliateClicks.$inferSelect;
export type InsertAffiliateLandingPages = z.infer<typeof insertAffiliateLandingPagesSchema>;
export type AffiliateLandingPages = typeof affiliateLandingPages.$inferSelect;
export type InsertAffiliateProductAssignments = z.infer<typeof insertAffiliateProductAssignmentsSchema>;
export type AffiliateProductAssignments = typeof affiliateProductAssignments.$inferSelect;
export type InsertAffiliateProductRequests = z.infer<typeof insertAffiliateProductRequestsSchema>;
export type AffiliateProductRequests = typeof affiliateProductRequests.$inferSelect;
export type InsertApiConfigurations = z.infer<typeof insertApiConfigurationsSchema>;
export type ApiConfigurations = typeof apiConfigurations.$inferSelect;
export type InsertAuthUsers = z.infer<typeof insertAuthUsersSchema>;
export type AuthUsers = typeof authUsers.$inferSelect;
export type InsertBookAnalytics = z.infer<typeof insertBookAnalyticsSchema>;
export type BookAnalytics = typeof bookAnalytics.$inferSelect;
export type InsertBookCampaignRecipients = z.infer<typeof insertBookCampaignRecipientsSchema>;
export type BookCampaignRecipients = typeof bookCampaignRecipients.$inferSelect;
export type InsertBookCategories = z.infer<typeof insertBookCategoriesSchema>;
export type BookCategories = typeof bookCategories.$inferSelect;
export type InsertBookCategoryAssignments = z.infer<typeof insertBookCategoryAssignmentsSchema>;
export type BookCategoryAssignments = typeof bookCategoryAssignments.$inferSelect;
export type InsertBookCustomers = z.infer<typeof insertBookCustomersSchema>;
export type BookCustomers = typeof bookCustomers.$inferSelect;
export type InsertBookMarketingCampaigns = z.infer<typeof insertBookMarketingCampaignsSchema>;
export type BookMarketingCampaigns = typeof bookMarketingCampaigns.$inferSelect;
export type InsertBookOrderItems = z.infer<typeof insertBookOrderItemsSchema>;
export type BookOrderItems = typeof bookOrderItems.$inferSelect;
export type InsertBookOrders = z.infer<typeof insertBookOrdersSchema>;
export type BookOrders = typeof bookOrders.$inferSelect;
export type InsertBookPaymentTransactions = z.infer<typeof insertBookPaymentTransactionsSchema>;
export type BookPaymentTransactions = typeof bookPaymentTransactions.$inferSelect;
export type InsertBookPrices = z.infer<typeof insertBookPricesSchema>;
export type BookPrices = typeof bookPrices.$inferSelect;
export type InsertBookPricingRules = z.infer<typeof insertBookPricingRulesSchema>;
export type BookPricingRules = typeof bookPricingRules.$inferSelect;
export type InsertBookSellerInventory = z.infer<typeof insertBookSellerInventorySchema>;
export type BookSellerInventory = typeof bookSellerInventory.$inferSelect;
export type InsertBookSellers = z.infer<typeof insertBookSellersSchema>;
export type BookSellers = typeof bookSellers.$inferSelect;
export type InsertBooks = z.infer<typeof insertBooksSchema>;
export type Books = typeof books.$inferSelect;
export type InsertBotSettings = z.infer<typeof insertBotSettingsSchema>;
export type BotSettings = typeof botSettings.$inferSelect;
export type InsertCampaignParticipations = z.infer<typeof insertCampaignParticipationsSchema>;
export type CampaignParticipations = typeof campaignParticipations.$inferSelect;
export type InsertCampaigns = z.infer<typeof insertCampaignsSchema>;
export type Campaigns = typeof campaigns.$inferSelect;
export type InsertCarGroups = z.infer<typeof insertCarGroupsSchema>;
export type CarGroups = typeof carGroups.$inferSelect;
export type InsertCategories = z.infer<typeof insertCategoriesSchema>;
export type Categories = typeof categories.$inferSelect;
export type InsertCategoryFaqTemplates = z.infer<typeof insertCategoryFaqTemplatesSchema>;
export type CategoryFaqTemplates = typeof categoryFaqTemplates.$inferSelect;
export type InsertCategoryPriceRules = z.infer<typeof insertCategoryPriceRulesSchema>;
export type CategoryPriceRules = typeof categoryPriceRules.$inferSelect;
export type InsertChatbotConversations = z.infer<typeof insertChatbotConversationsSchema>;
export type ChatbotConversations = typeof chatbotConversations.$inferSelect;
export type InsertCompetitorProfiles = z.infer<typeof insertCompetitorProfilesSchema>;
export type CompetitorProfiles = typeof competitorProfiles.$inferSelect;
export type InsertConsignmentRequests = z.infer<typeof insertConsignmentRequestsSchema>;
export type ConsignmentRequests = typeof consignmentRequests.$inferSelect;
export type InsertContentAssets = z.infer<typeof insertContentAssetsSchema>;
export type ContentAssets = typeof contentAssets.$inferSelect;
export type InsertContentCategories = z.infer<typeof insertContentCategoriesSchema>;
export type ContentCategories = typeof contentCategories.$inferSelect;
export type InsertContentFaqAssignments = z.infer<typeof insertContentFaqAssignmentsSchema>;
export type ContentFaqAssignments = typeof contentFaqAssignments.$inferSelect;
export type InsertContentLibrary = z.infer<typeof insertContentLibrarySchema>;
export type ContentLibrary = typeof contentLibrary.$inferSelect;
export type InsertContentQueue = z.infer<typeof insertContentQueueSchema>;
export type ContentQueue = typeof contentQueue.$inferSelect;
export type InsertConversationMessages = z.infer<typeof insertConversationMessagesSchema>;
export type ConversationMessages = typeof conversationMessages.$inferSelect;
export type InsertConversationSessions = z.infer<typeof insertConversationSessionsSchema>;
export type ConversationSessions = typeof conversationSessions.$inferSelect;
export type InsertCookieProfiles = z.infer<typeof insertCookieProfilesSchema>;
export type CookieProfiles = typeof cookieProfiles.$inferSelect;
export type InsertCustomerEvents = z.infer<typeof insertCustomerEventsSchema>;
export type CustomerEvents = typeof customerEvents.$inferSelect;
export type InsertCustomerReviews = z.infer<typeof insertCustomerReviewsSchema>;
export type CustomerReviews = typeof customerReviews.$inferSelect;
export type InsertCustomerVouchers = z.infer<typeof insertCustomerVouchersSchema>;
export type CustomerVouchers = typeof customerVouchers.$inferSelect;
export type InsertCustomers = z.infer<typeof insertCustomersSchema>;
export type Customers = typeof customers.$inferSelect;
export type InsertDepositTransactions = z.infer<typeof insertDepositTransactionsSchema>;
export type DepositTransactions = typeof depositTransactions.$inferSelect;
export type InsertDiscountCodeUsages = z.infer<typeof insertDiscountCodeUsagesSchema>;
export type DiscountCodeUsages = typeof discountCodeUsages.$inferSelect;
export type InsertDiscountCodes = z.infer<typeof insertDiscountCodesSchema>;
export type DiscountCodes = typeof discountCodes.$inferSelect;
export type InsertDiscountScopeAssignments = z.infer<typeof insertDiscountScopeAssignmentsSchema>;
export type DiscountScopeAssignments = typeof discountScopeAssignments.$inferSelect;
export type InsertDriverReports = z.infer<typeof insertDriverReportsSchema>;
export type DriverReports = typeof driverReports.$inferSelect;
export type InsertFacebookApps = z.infer<typeof insertFacebookAppsSchema>;
export type FacebookApps = typeof facebookApps.$inferSelect;
export type InsertFacebookConversations = z.infer<typeof insertFacebookConversationsSchema>;
export type FacebookConversations = typeof facebookConversations.$inferSelect;
export type InsertFacebookMessages = z.infer<typeof insertFacebookMessagesSchema>;
export type FacebookMessages = typeof facebookMessages.$inferSelect;
export type InsertFacebookWebhookEvents = z.infer<typeof insertFacebookWebhookEventsSchema>;
export type FacebookWebhookEvents = typeof facebookWebhookEvents.$inferSelect;
export type InsertFaqGenerationJobs = z.infer<typeof insertFaqGenerationJobsSchema>;
export type FaqGenerationJobs = typeof faqGenerationJobs.$inferSelect;
export type InsertFaqGenerationResults = z.infer<typeof insertFaqGenerationResultsSchema>;
export type FaqGenerationResults = typeof faqGenerationResults.$inferSelect;
export type InsertFaqLibrary = z.infer<typeof insertFaqLibrarySchema>;
export type FaqLibrary = typeof faqLibrary.$inferSelect;
export type InsertFrontendCategoryAssignments = z.infer<typeof insertFrontendCategoryAssignmentsSchema>;
export type FrontendCategoryAssignments = typeof frontendCategoryAssignments.$inferSelect;
export type InsertGeneralCategories = z.infer<typeof insertGeneralCategoriesSchema>;
export type GeneralCategories = typeof generalCategories.$inferSelect;
export type InsertGeneralCategoryAnalytics = z.infer<typeof insertGeneralCategoryAnalyticsSchema>;
export type GeneralCategoryAnalytics = typeof generalCategoryAnalytics.$inferSelect;
export type InsertGeneralCategoryAssignments = z.infer<typeof insertGeneralCategoryAssignmentsSchema>;
export type GeneralCategoryAssignments = typeof generalCategoryAssignments.$inferSelect;
export type InsertGeneralCategoryPriceRules = z.infer<typeof insertGeneralCategoryPriceRulesSchema>;
export type GeneralCategoryPriceRules = typeof generalCategoryPriceRules.$inferSelect;
export type InsertGiftCampaigns = z.infer<typeof insertGiftCampaignsSchema>;
export type GiftCampaigns = typeof giftCampaigns.$inferSelect;
export type InsertGiftRedemptions = z.infer<typeof insertGiftRedemptionsSchema>;
export type GiftRedemptions = typeof giftRedemptions.$inferSelect;
export type InsertGiftVouchers = z.infer<typeof insertGiftVouchersSchema>;
export type GiftVouchers = typeof giftVouchers.$inferSelect;
export type InsertGlobalAutomationControl = z.infer<typeof insertGlobalAutomationControlSchema>;
export type GlobalAutomationControl = typeof globalAutomationControl.$inferSelect;
export type InsertIndustries = z.infer<typeof insertIndustriesSchema>;
export type Industries = typeof industries.$inferSelect;
export type InsertIndustryKeywords = z.infer<typeof insertIndustryKeywordsSchema>;
export type IndustryKeywords = typeof industryKeywords.$inferSelect;
export type InsertIndustryRules = z.infer<typeof insertIndustryRulesSchema>;
export type IndustryRules = typeof industryRules.$inferSelect;
export type InsertIndustryTemplates = z.infer<typeof insertIndustryTemplatesSchema>;
export type IndustryTemplates = typeof industryTemplates.$inferSelect;
export type InsertIntentAnalytics = z.infer<typeof insertIntentAnalyticsSchema>;
export type IntentAnalytics = typeof intentAnalytics.$inferSelect;
export type InsertInvoiceTemplates = z.infer<typeof insertInvoiceTemplatesSchema>;
export type InvoiceTemplates = typeof invoiceTemplates.$inferSelect;
export type InsertIpPoolSessions = z.infer<typeof insertIpPoolSessionsSchema>;
export type IpPoolSessions = typeof ipPoolSessions.$inferSelect;
export type InsertIpPools = z.infer<typeof insertIpPoolsSchema>;
export type IpPools = typeof ipPools.$inferSelect;
export type InsertIpRotationLogs = z.infer<typeof insertIpRotationLogsSchema>;
export type IpRotationLogs = typeof ipRotationLogs.$inferSelect;
export type InsertMarketTrends = z.infer<typeof insertMarketTrendsSchema>;
export type MarketTrends = typeof marketTrends.$inferSelect;
export type InsertOauthConnections = z.infer<typeof insertOauthConnectionsSchema>;
export type OauthConnections = typeof oauthConnections.$inferSelect;
export type InsertOrderItems = z.infer<typeof insertOrderItemsSchema>;
export type OrderItems = typeof orderItems.$inferSelect;
export type InsertOrders = z.infer<typeof insertOrdersSchema>;
export type Orders = typeof orders.$inferSelect;
export type InsertPageTags = z.infer<typeof insertPageTagsSchema>;
export type PageTags = typeof pageTags.$inferSelect;
export type InsertPaymentGatewaySettings = z.infer<typeof insertPaymentGatewaySettingsSchema>;
export type PaymentGatewaySettings = typeof paymentGatewaySettings.$inferSelect;
export type InsertPayments = z.infer<typeof insertPaymentsSchema>;
export type Payments = typeof payments.$inferSelect;
export type InsertPerformanceMetrics = z.infer<typeof insertPerformanceMetricsSchema>;
export type PerformanceMetrics = typeof performanceMetrics.$inferSelect;
export type InsertPriceSources = z.infer<typeof insertPriceSourcesSchema>;
export type PriceSources = typeof priceSources.$inferSelect;
export type InsertPricingStrategies = z.infer<typeof insertPricingStrategiesSchema>;
export type PricingStrategies = typeof pricingStrategies.$inferSelect;
export type InsertProductFaqs = z.infer<typeof insertProductFaqsSchema>;
export type ProductFaqs = typeof productFaqs.$inferSelect;
export type InsertProductLandingClicks = z.infer<typeof insertProductLandingClicksSchema>;
export type ProductLandingClicks = typeof productLandingClicks.$inferSelect;
export type InsertProductLandingPages = z.infer<typeof insertProductLandingPagesSchema>;
export type ProductLandingPages = typeof productLandingPages.$inferSelect;
export type InsertProductPolicies = z.infer<typeof insertProductPoliciesSchema>;
export type ProductPolicies = typeof productPolicies.$inferSelect;
export type InsertProductPolicyAssociations = z.infer<typeof insertProductPolicyAssociationsSchema>;
export type ProductPolicyAssociations = typeof productPolicyAssociations.$inferSelect;
export type InsertProductReviews = z.infer<typeof insertProductReviewsSchema>;
export type ProductReviews = typeof productReviews.$inferSelect;
export type InsertProducts = z.infer<typeof insertProductsSchema>;
export type Products = typeof products.$inferSelect;
export type InsertProjectTemplates = z.infer<typeof insertProjectTemplatesSchema>;
export type ProjectTemplates = typeof projectTemplates.$inferSelect;
export type InsertPushSubscriptions = z.infer<typeof insertPushSubscriptionsSchema>;
export type PushSubscriptions = typeof pushSubscriptions.$inferSelect;
export type InsertQueueAutofillSettings = z.infer<typeof insertQueueAutofillSettingsSchema>;
export type QueueAutofillSettings = typeof queueAutofillSettings.$inferSelect;
export type InsertQueueHistory = z.infer<typeof insertQueueHistorySchema>;
export type QueueHistory = typeof queueHistory.$inferSelect;
export type InsertRegistrationTokens = z.infer<typeof insertRegistrationTokensSchema>;
export type RegistrationTokens = typeof registrationTokens.$inferSelect;
export type InsertReturnRequests = z.infer<typeof insertReturnRequestsSchema>;
export type ReturnRequests = typeof returnRequests.$inferSelect;
export type InsertSalesAutomationConfigs = z.infer<typeof insertSalesAutomationConfigsSchema>;
export type SalesAutomationConfigs = typeof salesAutomationConfigs.$inferSelect;
export type InsertSalesAutomationHistory = z.infer<typeof insertSalesAutomationHistorySchema>;
export type SalesAutomationHistory = typeof salesAutomationHistory.$inferSelect;
export type InsertSatisfactionSurveys = z.infer<typeof insertSatisfactionSurveysSchema>;
export type SatisfactionSurveys = typeof satisfactionSurveys.$inferSelect;
export type InsertScheduledPosts = z.infer<typeof insertScheduledPostsSchema>;
export type ScheduledPosts = typeof scheduledPosts.$inferSelect;
export type InsertSeasonalRules = z.infer<typeof insertSeasonalRulesSchema>;
export type SeasonalRules = typeof seasonalRules.$inferSelect;
export type InsertSellerPaymentConfigs = z.infer<typeof insertSellerPaymentConfigsSchema>;
export type SellerPaymentConfigs = typeof sellerPaymentConfigs.$inferSelect;
export type InsertSellerRatings = z.infer<typeof insertSellerRatingsSchema>;
export type SellerRatings = typeof sellerRatings.$inferSelect;
export type InsertSessions = z.infer<typeof insertSessionsSchema>;
export type Sessions = typeof sessions.$inferSelect;
export type InsertShareVerifications = z.infer<typeof insertShareVerificationsSchema>;
export type ShareVerifications = typeof shareVerifications.$inferSelect;
export type InsertShippingZones = z.infer<typeof insertShippingZonesSchema>;
export type ShippingZones = typeof shippingZones.$inferSelect;
export type InsertShopSettings = z.infer<typeof insertShopSettingsSchema>;
export type ShopSettings = typeof shopSettings.$inferSelect;
export type InsertShopeeBusinessAccounts = z.infer<typeof insertShopeeBusinessAccountsSchema>;
export type ShopeeBusinessAccounts = typeof shopeeBusinessAccounts.$inferSelect;
export type InsertShopeeShopOrders = z.infer<typeof insertShopeeShopOrdersSchema>;
export type ShopeeShopOrders = typeof shopeeShopOrders.$inferSelect;
export type InsertShopeeShopProducts = z.infer<typeof insertShopeeShopProductsSchema>;
export type ShopeeShopProducts = typeof shopeeShopProducts.$inferSelect;
export type InsertSocialAccounts = z.infer<typeof insertSocialAccountsSchema>;
export type SocialAccounts = typeof socialAccounts.$inferSelect;
export type InsertStockReservations = z.infer<typeof insertStockReservationsSchema>;
export type StockReservations = typeof stockReservations.$inferSelect;
export type InsertStorefrontConfig = z.infer<typeof insertStorefrontConfigSchema>;
export type StorefrontConfig = typeof storefrontConfig.$inferSelect;
export type InsertStorefrontOrders = z.infer<typeof insertStorefrontOrdersSchema>;
export type StorefrontOrders = typeof storefrontOrders.$inferSelect;
export type InsertTemplateCompilations = z.infer<typeof insertTemplateCompilationsSchema>;
export type TemplateCompilations = typeof templateCompilations.$inferSelect;
export type InsertThemeConfigurations = z.infer<typeof insertThemeConfigurationsSchema>;
export type ThemeConfigurations = typeof themeConfigurations.$inferSelect;
export type InsertTiktokBusinessAccounts = z.infer<typeof insertTiktokBusinessAccountsSchema>;
export type TiktokBusinessAccounts = typeof tiktokBusinessAccounts.$inferSelect;
export type InsertTiktokShopOrders = z.infer<typeof insertTiktokShopOrdersSchema>;
export type TiktokShopOrders = typeof tiktokShopOrders.$inferSelect;
export type InsertTiktokShopProducts = z.infer<typeof insertTiktokShopProductsSchema>;
export type TiktokShopProducts = typeof tiktokShopProducts.$inferSelect;
export type InsertTiktokVideos = z.infer<typeof insertTiktokVideosSchema>;
export type TiktokVideos = typeof tiktokVideos.$inferSelect;
export type InsertTrips = z.infer<typeof insertTripsSchema>;
export type Trips = typeof trips.$inferSelect;
export type InsertUnifiedTags = z.infer<typeof insertUnifiedTagsSchema>;
export type UnifiedTags = typeof unifiedTags.$inferSelect;
export type InsertUserSatisfactionScores = z.infer<typeof insertUserSatisfactionScoresSchema>;
export type UserSatisfactionScores = typeof userSatisfactionScores.$inferSelect;
export type InsertUserSessions = z.infer<typeof insertUserSessionsSchema>;
export type UserSessions = typeof userSessions.$inferSelect;
export type InsertUserTemplates = z.infer<typeof insertUserTemplatesSchema>;
export type UserTemplates = typeof userTemplates.$inferSelect;
export type InsertUsers = z.infer<typeof insertUsersSchema>;
export type Users = typeof users.$inferSelect;
export type InsertVehicleGroupAssignments = z.infer<typeof insertVehicleGroupAssignmentsSchema>;
export type VehicleGroupAssignments = typeof vehicleGroupAssignments.$inferSelect;
export type InsertVehicles = z.infer<typeof insertVehiclesSchema>;
export type Vehicles = typeof vehicles.$inferSelect;
export type InsertVendorOrders = z.infer<typeof insertVendorOrdersSchema>;
export type VendorOrders = typeof vendorOrders.$inferSelect;
export type InsertVendorProducts = z.infer<typeof insertVendorProductsSchema>;
export type VendorProducts = typeof vendorProducts.$inferSelect;
export type InsertVendors = z.infer<typeof insertVendorsSchema>;
export type Vendors = typeof vendors.$inferSelect;
export type InsertVietnameseReviewTemplates = z.infer<typeof insertVietnameseReviewTemplatesSchema>;
export type VietnameseReviewTemplates = typeof vietnameseReviewTemplates.$inferSelect;
export type InsertWorkers = z.infer<typeof insertWorkersSchema>;
export type Workers = typeof workers.$inferSelect;

// Worker-specific types
export type WorkerPlatform = 'facebook' | 'instagram' | 'twitter' | 'tiktok' | 'youtube' | 'linkedin';

export const SUPPORTED_WORKER_PLATFORMS: WorkerPlatform[] = [
  'facebook',
  'instagram', 
  'twitter',
  'tiktok',
  'youtube',
  'linkedin'
];

export interface WorkerCapability {
  platform: WorkerPlatform;
  actions: string[];
}

export type BookWithPrices = Books & {
  prices?: BookPrices[];
};
