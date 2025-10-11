"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.discountScopeAssignments = exports.discountCodes = exports.discountCodeUsages = exports.depositTransactions = exports.customers = exports.customerVouchers = exports.customerReviews = exports.customerEvents = exports.cookieProfiles = exports.conversationSessions = exports.conversationMessages = exports.contentQueue = exports.contentLibrary = exports.contentFaqAssignments = exports.contentCategories = exports.contentAssets = exports.consignmentRequests = exports.competitorProfiles = exports.chatbotConversations = exports.categoryPriceRules = exports.categoryFaqTemplates = exports.categories = exports.carGroups = exports.campaigns = exports.campaignParticipations = exports.botSettings = exports.books = exports.bookSellers = exports.bookSellerInventory = exports.bookPricingRules = exports.bookPrices = exports.bookPaymentTransactions = exports.bookOrders = exports.bookOrderItems = exports.bookMarketingCampaigns = exports.bookCustomers = exports.bookCategoryAssignments = exports.bookCategories = exports.bookCampaignRecipients = exports.bookAnalytics = exports.authUsers = exports.apiConfigurations = exports.affiliateProductRequests = exports.affiliateProductAssignments = exports.affiliateLandingPages = exports.affiliateClicks = exports.admins = exports.accountGroups = exports.BOOK_PRICE_SOURCES = exports.BOOK_CONDITIONS = void 0;
exports.salesAutomationConfigs = exports.returnRequests = exports.registrationTokens = exports.queueHistory = exports.queueAutofillSettings = exports.pushSubscriptions = exports.projectTemplates = exports.products = exports.productReviews = exports.productPolicyAssociations = exports.productPolicies = exports.productLandingPages = exports.productLandingClicks = exports.productFaqs = exports.pricingStrategies = exports.priceSources = exports.performanceMetrics = exports.payments = exports.paymentGatewaySettings = exports.pageTags = exports.orders = exports.orderItems = exports.oauthConnections = exports.marketTrends = exports.ipRotationLogs = exports.ipPools = exports.ipPoolSessions = exports.invoiceTemplates = exports.intentAnalytics = exports.industryTemplates = exports.industryRules = exports.industryKeywords = exports.industries = exports.globalAutomationControl = exports.giftVouchers = exports.giftRedemptions = exports.giftCampaigns = exports.generalCategoryPriceRules = exports.generalCategoryAssignments = exports.generalCategoryAnalytics = exports.generalCategories = exports.frontendCategoryAssignments = exports.faqLibrary = exports.faqGenerationResults = exports.faqGenerationJobs = exports.facebookWebhookEvents = exports.facebookMessages = exports.facebookConversations = exports.facebookApps = exports.driverReports = void 0;
exports.selectApiConfigurationsSchema = exports.insertApiConfigurationsSchema = exports.selectAffiliateProductRequestsSchema = exports.insertAffiliateProductRequestsSchema = exports.selectAffiliateProductAssignmentsSchema = exports.insertAffiliateProductAssignmentsSchema = exports.selectAffiliateLandingPagesSchema = exports.insertAffiliateLandingPagesSchema = exports.selectAffiliateClicksSchema = exports.insertAffiliateClicksSchema = exports.selectAdminsSchema = exports.insertAdminsSchema = exports.selectAccountGroupsSchema = exports.insertAccountGroupsSchema = exports.workers = exports.vietnameseReviewTemplates = exports.vendors = exports.vendorProducts = exports.vendorOrders = exports.vehicles = exports.vehicleGroupAssignments = exports.users = exports.userTemplates = exports.userSessions = exports.userSatisfactionScores = exports.unifiedTags = exports.trips = exports.tiktokVideos = exports.tiktokShopProducts = exports.tiktokShopOrders = exports.tiktokBusinessAccounts = exports.themeConfigurations = exports.templateCompilations = exports.storefrontOrders = exports.storefrontConfig = exports.stockReservations = exports.socialAccounts = exports.shopeeShopProducts = exports.shopeeShopOrders = exports.shopeeBusinessAccounts = exports.shopSettings = exports.shippingZones = exports.shareVerifications = exports.sessions = exports.sellerRatings = exports.sellerPaymentConfigs = exports.seasonalRules = exports.scheduledPosts = exports.satisfactionSurveys = exports.salesAutomationHistory = void 0;
exports.selectCategoryFaqTemplatesSchema = exports.insertCategoryFaqTemplatesSchema = exports.selectCategoriesSchema = exports.insertCategoriesSchema = exports.selectCarGroupsSchema = exports.insertCarGroupsSchema = exports.selectCampaignsSchema = exports.insertCampaignsSchema = exports.selectCampaignParticipationsSchema = exports.insertCampaignParticipationsSchema = exports.selectBotSettingsSchema = exports.insertBotSettingsSchema = exports.selectBookSchema = exports.insertBookSchema = exports.selectBooksSchema = exports.insertBooksSchema = exports.selectBookSellersSchema = exports.insertBookSellersSchema = exports.selectBookSellerInventorySchema = exports.insertBookSellerInventorySchema = exports.selectBookPricingRulesSchema = exports.insertBookPricingRulesSchema = exports.selectBookPriceSchema = exports.insertBookPriceSchema = exports.selectBookPricesSchema = exports.insertBookPricesSchema = exports.selectBookPaymentTransactionsSchema = exports.insertBookPaymentTransactionsSchema = exports.selectBookOrderSchema = exports.insertBookOrderSchema = exports.selectBookOrdersSchema = exports.insertBookOrdersSchema = exports.selectBookOrderItemSchema = exports.insertBookOrderItemSchema = exports.selectBookOrderItemsSchema = exports.insertBookOrderItemsSchema = exports.selectBookMarketingCampaignsSchema = exports.insertBookMarketingCampaignsSchema = exports.selectBookCustomersSchema = exports.insertBookCustomersSchema = exports.selectBookCategoryAssignmentsSchema = exports.insertBookCategoryAssignmentsSchema = exports.selectBookCategoriesSchema = exports.insertBookCategoriesSchema = exports.selectBookCampaignRecipientsSchema = exports.insertBookCampaignRecipientsSchema = exports.selectBookAnalyticsSchema = exports.insertBookAnalyticsSchema = exports.selectAuthUsersSchema = exports.insertAuthUsersSchema = void 0;
exports.selectFacebookWebhookEventsSchema = exports.insertFacebookWebhookEventsSchema = exports.selectFacebookMessagesSchema = exports.insertFacebookMessagesSchema = exports.selectFacebookConversationsSchema = exports.insertFacebookConversationsSchema = exports.selectFacebookAppsSchema = exports.insertFacebookAppsSchema = exports.selectDriverReportsSchema = exports.insertDriverReportsSchema = exports.selectDiscountScopeAssignmentsSchema = exports.insertDiscountScopeAssignmentsSchema = exports.selectDiscountCodesSchema = exports.insertDiscountCodesSchema = exports.selectDiscountCodeUsagesSchema = exports.insertDiscountCodeUsagesSchema = exports.selectDepositTransactionsSchema = exports.insertDepositTransactionsSchema = exports.selectCustomersSchema = exports.insertCustomersSchema = exports.selectCustomerVouchersSchema = exports.insertCustomerVouchersSchema = exports.selectCustomerReviewsSchema = exports.insertCustomerReviewsSchema = exports.selectCustomerEventsSchema = exports.insertCustomerEventsSchema = exports.selectCookieProfilesSchema = exports.insertCookieProfilesSchema = exports.selectConversationSessionsSchema = exports.insertConversationSessionsSchema = exports.selectConversationMessagesSchema = exports.insertConversationMessagesSchema = exports.selectContentQueueSchema = exports.insertContentQueueSchema = exports.selectContentLibrarySchema = exports.insertContentLibrarySchema = exports.selectContentFaqAssignmentsSchema = exports.insertContentFaqAssignmentsSchema = exports.selectContentCategoriesSchema = exports.insertContentCategoriesSchema = exports.selectContentAssetsSchema = exports.insertContentAssetsSchema = exports.selectConsignmentRequestsSchema = exports.insertConsignmentRequestsSchema = exports.selectCompetitorProfilesSchema = exports.insertCompetitorProfilesSchema = exports.selectChatbotConversationsSchema = exports.insertChatbotConversationsSchema = exports.selectCategoryPriceRulesSchema = exports.insertCategoryPriceRulesSchema = void 0;
exports.selectOrdersSchema = exports.insertOrdersSchema = exports.selectOrderItemsSchema = exports.insertOrderItemsSchema = exports.selectOauthConnectionsSchema = exports.insertOauthConnectionsSchema = exports.selectMarketTrendsSchema = exports.insertMarketTrendsSchema = exports.selectIpRotationLogsSchema = exports.insertIpRotationLogsSchema = exports.selectIpPoolsSchema = exports.insertIpPoolsSchema = exports.selectIpPoolSessionsSchema = exports.insertIpPoolSessionsSchema = exports.selectInvoiceTemplatesSchema = exports.insertInvoiceTemplatesSchema = exports.selectIntentAnalyticsSchema = exports.insertIntentAnalyticsSchema = exports.selectIndustryTemplatesSchema = exports.insertIndustryTemplatesSchema = exports.selectIndustryRulesSchema = exports.insertIndustryRulesSchema = exports.selectIndustryKeywordsSchema = exports.insertIndustryKeywordsSchema = exports.selectIndustriesSchema = exports.insertIndustriesSchema = exports.selectGlobalAutomationControlSchema = exports.insertGlobalAutomationControlSchema = exports.selectGiftVouchersSchema = exports.insertGiftVouchersSchema = exports.selectGiftRedemptionsSchema = exports.insertGiftRedemptionsSchema = exports.selectGiftCampaignsSchema = exports.insertGiftCampaignsSchema = exports.selectGeneralCategoryPriceRulesSchema = exports.insertGeneralCategoryPriceRulesSchema = exports.selectGeneralCategoryAssignmentsSchema = exports.insertGeneralCategoryAssignmentsSchema = exports.selectGeneralCategoryAnalyticsSchema = exports.insertGeneralCategoryAnalyticsSchema = exports.selectGeneralCategoriesSchema = exports.insertGeneralCategoriesSchema = exports.selectFrontendCategoryAssignmentsSchema = exports.insertFrontendCategoryAssignmentsSchema = exports.selectFaqLibrarySchema = exports.insertFaqLibrarySchema = exports.selectFaqGenerationResultsSchema = exports.insertFaqGenerationResultsSchema = exports.selectFaqGenerationJobsSchema = exports.insertFaqGenerationJobsSchema = void 0;
exports.selectSellerPaymentConfigsSchema = exports.insertSellerPaymentConfigsSchema = exports.selectSeasonalRulesSchema = exports.insertSeasonalRulesSchema = exports.selectScheduledPostsSchema = exports.insertScheduledPostsSchema = exports.selectSatisfactionSurveysSchema = exports.insertSatisfactionSurveysSchema = exports.selectSalesAutomationHistorySchema = exports.insertSalesAutomationHistorySchema = exports.selectSalesAutomationConfigsSchema = exports.insertSalesAutomationConfigsSchema = exports.selectReturnRequestsSchema = exports.insertReturnRequestsSchema = exports.selectRegistrationTokensSchema = exports.insertRegistrationTokensSchema = exports.selectQueueHistorySchema = exports.insertQueueHistorySchema = exports.selectQueueAutofillSettingsSchema = exports.insertQueueAutofillSettingsSchema = exports.selectPushSubscriptionsSchema = exports.insertPushSubscriptionsSchema = exports.selectProjectTemplatesSchema = exports.insertProjectTemplatesSchema = exports.selectProductsSchema = exports.insertProductsSchema = exports.selectProductReviewsSchema = exports.insertProductReviewsSchema = exports.selectProductPolicyAssociationsSchema = exports.insertProductPolicyAssociationsSchema = exports.selectProductPoliciesSchema = exports.insertProductPoliciesSchema = exports.selectProductLandingPagesSchema = exports.insertProductLandingPagesSchema = exports.selectProductLandingClicksSchema = exports.insertProductLandingClicksSchema = exports.selectProductFaqsSchema = exports.insertProductFaqsSchema = exports.selectPricingStrategiesSchema = exports.insertPricingStrategiesSchema = exports.selectPriceSourcesSchema = exports.insertPriceSourcesSchema = exports.selectPerformanceMetricsSchema = exports.insertPerformanceMetricsSchema = exports.selectPaymentsSchema = exports.insertPaymentsSchema = exports.selectPaymentGatewaySettingsSchema = exports.insertPaymentGatewaySettingsSchema = exports.selectPageTagsSchema = exports.insertPageTagsSchema = void 0;
exports.selectVehicleGroupAssignmentsSchema = exports.insertVehicleGroupAssignmentsSchema = exports.selectUsersSchema = exports.insertUsersSchema = exports.selectUserTemplatesSchema = exports.insertUserTemplatesSchema = exports.selectUserSessionsSchema = exports.insertUserSessionsSchema = exports.selectUserSatisfactionScoresSchema = exports.insertUserSatisfactionScoresSchema = exports.selectUnifiedTagsSchema = exports.insertUnifiedTagsSchema = exports.selectTripsSchema = exports.insertTripsSchema = exports.selectTiktokVideosSchema = exports.insertTiktokVideosSchema = exports.selectTiktokShopProductsSchema = exports.insertTiktokShopProductsSchema = exports.selectTiktokShopOrdersSchema = exports.insertTiktokShopOrdersSchema = exports.selectTiktokBusinessAccountsSchema = exports.insertTiktokBusinessAccountsSchema = exports.selectThemeConfigurationsSchema = exports.insertThemeConfigurationsSchema = exports.selectTemplateCompilationsSchema = exports.insertTemplateCompilationsSchema = exports.selectStorefrontOrdersSchema = exports.insertStorefrontOrdersSchema = exports.selectStorefrontConfigSchema = exports.insertStorefrontConfigSchema = exports.selectStockReservationsSchema = exports.insertStockReservationsSchema = exports.selectSocialAccountsSchema = exports.insertSocialAccountsSchema = exports.selectShopeeShopProductsSchema = exports.insertShopeeShopProductsSchema = exports.selectShopeeShopOrdersSchema = exports.insertShopeeShopOrdersSchema = exports.selectShopeeBusinessAccountsSchema = exports.insertShopeeBusinessAccountsSchema = exports.selectShopSettingsSchema = exports.insertShopSettingsSchema = exports.selectShippingZonesSchema = exports.insertShippingZonesSchema = exports.selectShareVerificationsSchema = exports.insertShareVerificationsSchema = exports.selectSessionsSchema = exports.insertSessionsSchema = exports.selectSellerRatingsSchema = exports.insertSellerRatingsSchema = void 0;
exports.selectWorkersSchema = exports.insertWorkersSchema = exports.selectVietnameseReviewTemplatesSchema = exports.insertVietnameseReviewTemplatesSchema = exports.selectVendorsSchema = exports.insertVendorsSchema = exports.selectVendorProductsSchema = exports.insertVendorProductsSchema = exports.selectVendorOrdersSchema = exports.insertVendorOrdersSchema = exports.selectVehiclesSchema = exports.insertVehiclesSchema = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_zod_1 = require("drizzle-zod");
exports.BOOK_CONDITIONS = {
    new: { grade: 5, label: "New" },
    like_new: { grade: 4, label: "Like New" },
    very_good: { grade: 3, label: "Very Good" },
    good: { grade: 2, label: "Good" },
    acceptable: { grade: 1, label: "Acceptable" }
};
exports.BOOK_PRICE_SOURCES = {
    amazon: { name: "Amazon", priority: 1 },
    abebooks: { name: "AbeBooks", priority: 2 },
    ebay: { name: "eBay", priority: 3 },
    alibris: { name: "Alibris", priority: 4 },
    manual: { name: "Manual", priority: 5 }
};
exports.accountGroups = (0, pg_core_1.pgTable)("account_groups", {
    id: (0, pg_core_1.varchar)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    name: (0, pg_core_1.text)().notNull(),
    description: (0, pg_core_1.text)(),
    platform: (0, pg_core_1.text)().default('facebook').notNull(),
    priority: (0, pg_core_1.integer)().default(1),
    weight: (0, pg_core_1.numeric)({ precision: 5, scale: 2 }).default(1.0),
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
    formulaId: (0, pg_core_1.varchar)("formula_id"),
    totalPosts: (0, pg_core_1.integer)("total_posts").default(0),
    lastPostAt: (0, pg_core_1.timestamp)("last_post_at", { mode: 'string' }),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { mode: 'string' }).defaultNow(),
});
exports.admins = (0, pg_core_1.pgTable)("admins", {
    id: (0, pg_core_1.varchar)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    email: (0, pg_core_1.text)().notNull(),
    password: (0, pg_core_1.text)().notNull(),
    name: (0, pg_core_1.text)().notNull(),
    role: (0, pg_core_1.text)().default('staff').notNull(),
    isActive: (0, pg_core_1.boolean)("is_active").default(true).notNull(),
    lastLoginAt: (0, pg_core_1.timestamp)("last_login_at", { mode: 'string' }),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
    (0, pg_core_1.unique)("admins_email_key").on(table.email),
]);
exports.affiliateClicks = (0, pg_core_1.pgTable)("affiliate_clicks", {
    id: (0, pg_core_1.varchar)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    landingPageId: (0, pg_core_1.varchar)("landing_page_id").notNull(),
    affiliateId: (0, pg_core_1.varchar)("affiliate_id").notNull(),
    ip: (0, pg_core_1.varchar)(),
    userAgent: (0, pg_core_1.text)("user_agent"),
    device: (0, pg_core_1.varchar)(),
    browser: (0, pg_core_1.varchar)(),
    referrer: (0, pg_core_1.text)(),
    converted: (0, pg_core_1.boolean)().default(false).notNull(),
    orderId: (0, pg_core_1.varchar)("order_id"),
    conversionValue: (0, pg_core_1.numeric)("conversion_value", { precision: 15, scale: 2 }),
    clickedAt: (0, pg_core_1.timestamp)("clicked_at", { mode: 'string' }).defaultNow().notNull(),
    convertedAt: (0, pg_core_1.timestamp)("converted_at", { mode: 'string' }),
});
exports.affiliateLandingPages = (0, pg_core_1.pgTable)("affiliate_landing_pages", {
    id: (0, pg_core_1.varchar)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    affiliateId: (0, pg_core_1.varchar)("affiliate_id").notNull(),
    productId: (0, pg_core_1.varchar)("product_id").notNull(),
    slug: (0, pg_core_1.varchar)().notNull(),
    title: (0, pg_core_1.text)().notNull(),
    template: (0, pg_core_1.text)().default('modern').notNull(),
    colors: (0, pg_core_1.jsonb)().default({}),
    headline: (0, pg_core_1.text)(),
    description: (0, pg_core_1.text)(),
    features: (0, pg_core_1.jsonb)().default([]),
    customCta: (0, pg_core_1.text)("custom_cta"),
    seedingEnabled: (0, pg_core_1.boolean)("seeding_enabled").default(true).notNull(),
    fakeReviewsCount: (0, pg_core_1.integer)("fake_reviews_count").default(50),
    fakeViewersRange: (0, pg_core_1.varchar)("fake_viewers_range").default(100),
    showCountdown: (0, pg_core_1.boolean)("show_countdown").default(true).notNull(),
    countdownDuration: (0, pg_core_1.integer)("countdown_duration").default(3600),
    showSocialProof: (0, pg_core_1.boolean)("show_social_proof").default(true).notNull(),
    showUrgency: (0, pg_core_1.boolean)("show_urgency").default(true).notNull(),
    totalClicks: (0, pg_core_1.integer)("total_clicks").default(0).notNull(),
    totalOrders: (0, pg_core_1.integer)("total_orders").default(0).notNull(),
    totalRevenue: (0, pg_core_1.numeric)("total_revenue", { precision: 15, scale: 2 }).default(0.00),
    conversionRate: (0, pg_core_1.numeric)("conversion_rate", { precision: 5, scale: 2 }).default(0.00),
    isActive: (0, pg_core_1.boolean)("is_active").default(true).notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
    (0, pg_core_1.unique)("affiliate_landing_pages_slug_key").on(table.slug),
]);
exports.affiliateProductAssignments = (0, pg_core_1.pgTable)("affiliate_product_assignments", {
    id: (0, pg_core_1.varchar)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    affiliateId: (0, pg_core_1.varchar)("affiliate_id"),
    assignmentType: (0, pg_core_1.text)("assignment_type").notNull(),
    targetId: (0, pg_core_1.varchar)("target_id").notNull(),
    commissionRate: (0, pg_core_1.numeric)("commission_rate", { precision: 5, scale: 2 }).notNull(),
    commissionType: (0, pg_core_1.text)("commission_type").default('percentage').notNull(),
    isActive: (0, pg_core_1.boolean)("is_active").default(true).notNull(),
    isPremium: (0, pg_core_1.boolean)("is_premium").default(false).notNull(),
    maxCommissionPerOrder: (0, pg_core_1.numeric)("max_commission_per_order", { precision: 15, scale: 2 }),
    totalSales: (0, pg_core_1.integer)("total_sales").default(0).notNull(),
    totalCommission: (0, pg_core_1.numeric)("total_commission", { precision: 15, scale: 2 }).default(0).notNull(),
    assignedBy: (0, pg_core_1.varchar)("assigned_by"),
    assignedAt: (0, pg_core_1.timestamp)("assigned_at", { mode: 'string' }).defaultNow(),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { mode: 'string' }).defaultNow(),
    isDefaultAssignment: (0, pg_core_1.boolean)("is_default_assignment").default(false).notNull(),
});
exports.affiliateProductRequests = (0, pg_core_1.pgTable)("affiliate_product_requests", {
    id: (0, pg_core_1.varchar)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    affiliateId: (0, pg_core_1.varchar)("affiliate_id").notNull(),
    productName: (0, pg_core_1.text)("product_name").notNull(),
    productDescription: (0, pg_core_1.text)("product_description"),
    productLink: (0, pg_core_1.text)("product_link"),
    suggestedPrice: (0, pg_core_1.numeric)("suggested_price", { precision: 15, scale: 2 }),
    categoryId: (0, pg_core_1.varchar)("category_id"),
    status: (0, pg_core_1.text)().default('pending').notNull(),
    requestReason: (0, pg_core_1.text)("request_reason"),
    adminNotes: (0, pg_core_1.text)("admin_notes"),
    approvedProductId: (0, pg_core_1.varchar)("approved_product_id"),
    approvedCommissionRate: (0, pg_core_1.numeric)("approved_commission_rate", { precision: 5, scale: 2 }),
    reviewedBy: (0, pg_core_1.varchar)("reviewed_by"),
    reviewedAt: (0, pg_core_1.timestamp)("reviewed_at", { mode: 'string' }),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { mode: 'string' }).defaultNow(),
});
exports.apiConfigurations = (0, pg_core_1.pgTable)("api_configurations", {
    id: (0, pg_core_1.varchar)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    endpoint: (0, pg_core_1.text)().notNull(),
    method: (0, pg_core_1.text)().default('GET').notNull(),
    description: (0, pg_core_1.text)().notNull(),
    category: (0, pg_core_1.text)().notNull(),
    isEnabled: (0, pg_core_1.boolean)("is_enabled").default(true).notNull(),
    maintenanceMode: (0, pg_core_1.boolean)("maintenance_mode").default(false).notNull(),
    maintenanceMessage: (0, pg_core_1.text)("maintenance_message").default('API temporarily unavailable for maintenance'),
    rateLimitEnabled: (0, pg_core_1.boolean)("rate_limit_enabled").default(false).notNull(),
    rateLimitRequests: (0, pg_core_1.integer)("rate_limit_requests").default(100),
    rateLimitWindowSeconds: (0, pg_core_1.integer)("rate_limit_window_seconds").default(60),
    circuitBreakerEnabled: (0, pg_core_1.boolean)("circuit_breaker_enabled").default(false).notNull(),
    circuitBreakerThreshold: (0, pg_core_1.integer)("circuit_breaker_threshold").default(5),
    circuitBreakerTimeout: (0, pg_core_1.integer)("circuit_breaker_timeout").default(60),
    accessCount: (0, pg_core_1.integer)("access_count").default(0).notNull(),
    errorCount: (0, pg_core_1.integer)("error_count").default(0).notNull(),
    avgResponseTime: (0, pg_core_1.numeric)("avg_response_time", { precision: 10, scale: 3 }).default(0),
    lastAccessed: (0, pg_core_1.timestamp)("last_accessed", { mode: 'string' }),
    lastToggled: (0, pg_core_1.timestamp)("last_toggled", { mode: 'string' }),
    lastError: (0, pg_core_1.timestamp)("last_error", { mode: 'string' }),
    tags: (0, pg_core_1.jsonb)().default([]),
    priority: (0, pg_core_1.text)().default('normal').notNull(),
    owner: (0, pg_core_1.text)(),
    requiresAuth: (0, pg_core_1.boolean)("requires_auth").default(true).notNull(),
    adminOnly: (0, pg_core_1.boolean)("admin_only").default(false).notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
    (0, pg_core_1.unique)("api_configurations_endpoint_method_unique").on(table.endpoint, table.method),
]);
exports.authUsers = (0, pg_core_1.pgTable)("auth_users", {
    id: (0, pg_core_1.varchar)().primaryKey(),
    email: (0, pg_core_1.varchar)(),
    firstName: (0, pg_core_1.varchar)("first_name"),
    lastName: (0, pg_core_1.varchar)("last_name"),
    profileImageUrl: (0, pg_core_1.varchar)("profile_image_url"),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { mode: 'string' }).defaultNow(),
    provider: (0, pg_core_1.text)().default('replit'),
}, (table) => [
    (0, pg_core_1.unique)("auth_users_email_key").on(table.email),
]);
exports.bookAnalytics = (0, pg_core_1.pgTable)("book_analytics", {
    id: (0, pg_core_1.varchar)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    bookIsbn: (0, pg_core_1.varchar)("book_isbn", { length: 17 }).notNull(),
    totalViews: (0, pg_core_1.integer)("total_views").default(0),
    dailyViews: (0, pg_core_1.integer)("daily_views").default(0),
    weeklyViews: (0, pg_core_1.integer)("weekly_views").default(0),
    monthlyViews: (0, pg_core_1.integer)("monthly_views").default(0),
    cartAdds: (0, pg_core_1.integer)("cart_adds").default(0),
    purchases: (0, pg_core_1.integer)().default(0),
    wishlistAdds: (0, pg_core_1.integer)("wishlist_adds").default(0),
    priceChecks: (0, pg_core_1.integer)("price_checks").default(0),
    lowestPrice: (0, pg_core_1.numeric)("lowest_price", { precision: 10, scale: 2 }),
    highestPrice: (0, pg_core_1.numeric)("highest_price", { precision: 10, scale: 2 }),
    averagePrice: (0, pg_core_1.numeric)("average_price", { precision: 10, scale: 2 }),
    totalRatings: (0, pg_core_1.integer)("total_ratings").default(0),
    averageRating: (0, pg_core_1.numeric)("average_rating", { precision: 3, scale: 2 }),
    lastViewedAt: (0, pg_core_1.timestamp)("last_viewed_at", { mode: 'string' }),
    lastPurchasedAt: (0, pg_core_1.timestamp)("last_purchased_at", { mode: 'string' }),
    analyticsDate: (0, pg_core_1.timestamp)("analytics_date", { mode: 'string' }).defaultNow(),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { mode: 'string' }).defaultNow(),
});
exports.bookCampaignRecipients = (0, pg_core_1.pgTable)("book_campaign_recipients", {
    id: (0, pg_core_1.varchar)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    campaignId: (0, pg_core_1.varchar)("campaign_id").notNull(),
    customerId: (0, pg_core_1.varchar)("customer_id").notNull(),
    sentAt: (0, pg_core_1.timestamp)("sent_at", { mode: 'string' }),
    openedAt: (0, pg_core_1.timestamp)("opened_at", { mode: 'string' }),
    clickedAt: (0, pg_core_1.timestamp)("clicked_at", { mode: 'string' }),
    convertedAt: (0, pg_core_1.timestamp)("converted_at", { mode: 'string' }),
    emailAddress: (0, pg_core_1.text)("email_address").notNull(),
    deliveryStatus: (0, pg_core_1.text)("delivery_status").default('pending').notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
    (0, pg_core_1.unique)("book_campaign_recipients_campaign_id_customer_id_key").on(table.campaignId, table.customerId),
]);
exports.bookCategories = (0, pg_core_1.pgTable)("book_categories", {
    id: (0, pg_core_1.varchar)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    name: (0, pg_core_1.varchar)().notNull(),
    slug: (0, pg_core_1.varchar)().notNull(),
    parentId: (0, pg_core_1.varchar)("parent_id"),
    level: (0, pg_core_1.integer)().default(0),
    sortOrder: (0, pg_core_1.integer)("sort_order").default(0),
    description: (0, pg_core_1.text)(),
    icon: (0, pg_core_1.varchar)(),
    color: (0, pg_core_1.varchar)(),
    amazonCategoryId: (0, pg_core_1.varchar)("amazon_category_id"),
    amazonBestsellerUrl: (0, pg_core_1.text)("amazon_bestseller_url"),
    bookCount: (0, pg_core_1.integer)("book_count").default(0),
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
    isFeatured: (0, pg_core_1.boolean)("is_featured").default(false),
    metaTitle: (0, pg_core_1.varchar)("meta_title"),
    metaDescription: (0, pg_core_1.text)("meta_description"),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { mode: 'string' }).defaultNow(),
});
exports.bookCategoryAssignments = (0, pg_core_1.pgTable)("book_category_assignments", {
    id: (0, pg_core_1.varchar)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    bookIsbn: (0, pg_core_1.varchar)("book_isbn").notNull(),
    categoryId: (0, pg_core_1.varchar)("category_id").notNull(),
    isPrimary: (0, pg_core_1.boolean)("is_primary").default(false),
    assignedAt: (0, pg_core_1.timestamp)("assigned_at", { mode: 'string' }).defaultNow(),
    assignedBy: (0, pg_core_1.varchar)("assigned_by"),
    confidenceScore: (0, pg_core_1.numeric)("confidence_score"),
    isAutoAssigned: (0, pg_core_1.boolean)("is_auto_assigned").default(false),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
    (0, pg_core_1.unique)("book_category_assignments_book_isbn_category_id_key").on(table.bookIsbn, table.categoryId),
]);
exports.bookCustomers = (0, pg_core_1.pgTable)("book_customers", {
    id: (0, pg_core_1.varchar)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    name: (0, pg_core_1.text)().notNull(),
    email: (0, pg_core_1.text)().notNull(),
    phone: (0, pg_core_1.text)(),
    avatar: (0, pg_core_1.text)(),
    readingPreferences: (0, pg_core_1.jsonb)("reading_preferences").default({}),
    totalSpent: (0, pg_core_1.numeric)("total_spent", { precision: 15, scale: 2 }).default(0).notNull(),
    totalBooks: (0, pg_core_1.integer)("total_books").default(0).notNull(),
    avgOrderValue: (0, pg_core_1.numeric)("avg_order_value", { precision: 15, scale: 2 }).default(0).notNull(),
    lastPurchase: (0, pg_core_1.timestamp)("last_purchase", { mode: 'string' }),
    emailSubscribed: (0, pg_core_1.boolean)("email_subscribed").default(true).notNull(),
    smsSubscribed: (0, pg_core_1.boolean)("sms_subscribed").default(false).notNull(),
    marketingTags: (0, pg_core_1.jsonb)("marketing_tags").default([]),
    status: (0, pg_core_1.text)().default('active').notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
    (0, pg_core_1.unique)("book_customers_email_key").on(table.email),
]);
exports.bookMarketingCampaigns = (0, pg_core_1.pgTable)("book_marketing_campaigns", {
    id: (0, pg_core_1.varchar)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    campaignName: (0, pg_core_1.text)("campaign_name").notNull(),
    campaignType: (0, pg_core_1.text)("campaign_type").notNull(),
    targetCriteria: (0, pg_core_1.jsonb)("target_criteria").default({}),
    emailContent: (0, pg_core_1.jsonb)("email_content").notNull(),
    scheduleType: (0, pg_core_1.text)("schedule_type").default('immediate').notNull(),
    scheduledAt: (0, pg_core_1.timestamp)("scheduled_at", { mode: 'string' }),
    triggerEvents: (0, pg_core_1.jsonb)("trigger_events").default([]),
    status: (0, pg_core_1.text)().default('draft').notNull(),
    targetCount: (0, pg_core_1.integer)("target_count").default(0).notNull(),
    sentCount: (0, pg_core_1.integer)("sent_count").default(0).notNull(),
    openCount: (0, pg_core_1.integer)("open_count").default(0).notNull(),
    clickCount: (0, pg_core_1.integer)("click_count").default(0).notNull(),
    conversionCount: (0, pg_core_1.integer)("conversion_count").default(0).notNull(),
    isActive: (0, pg_core_1.boolean)("is_active").default(true).notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { mode: 'string' }).defaultNow(),
});
exports.bookOrderItems = (0, pg_core_1.pgTable)("book_order_items", {
    id: (0, pg_core_1.varchar)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    orderId: (0, pg_core_1.varchar)("order_id").notNull(),
    productId: (0, pg_core_1.varchar)("product_id").notNull(),
    quantity: (0, pg_core_1.numeric)({ precision: 10, scale: 3 }).notNull(),
    price: (0, pg_core_1.numeric)({ precision: 15, scale: 2 }).notNull(),
    isbn: (0, pg_core_1.text)(),
    condition: (0, pg_core_1.text)().default('new').notNull(),
    sellerPrice: (0, pg_core_1.numeric)("seller_price", { precision: 15, scale: 2 }).notNull(),
    marketPrice: (0, pg_core_1.numeric)("market_price", { precision: 15, scale: 2 }),
    sourceCost: (0, pg_core_1.numeric)("source_cost", { precision: 15, scale: 2 }),
});
exports.bookOrders = (0, pg_core_1.pgTable)("book_orders", {
    id: (0, pg_core_1.varchar)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    total: (0, pg_core_1.numeric)({ precision: 15, scale: 2 }).notNull(),
    status: (0, pg_core_1.text)().default('pending').notNull(),
    paymentMethod: (0, pg_core_1.text)("payment_method").default('cash').notNull(),
    items: (0, pg_core_1.integer)().notNull(),
    source: (0, pg_core_1.text)().default('admin').notNull(),
    sourceOrderId: (0, pg_core_1.text)("source_order_id"),
    sourceReference: (0, pg_core_1.text)("source_reference"),
    syncStatus: (0, pg_core_1.text)("sync_status").default('manual').notNull(),
    syncData: (0, pg_core_1.jsonb)("sync_data"),
    sourceCustomerInfo: (0, pg_core_1.jsonb)("source_customer_info"),
    vtpOrderSystemCode: (0, pg_core_1.text)("vtp_order_system_code"),
    vtpOrderNumber: (0, pg_core_1.text)("vtp_order_number"),
    vtpServiceCode: (0, pg_core_1.text)("vtp_service_code"),
    vtpStatus: (0, pg_core_1.text)("vtp_status").default('not_shipped'),
    vtpTrackingData: (0, pg_core_1.jsonb)("vtp_tracking_data"),
    vtpShippingInfo: (0, pg_core_1.jsonb)("vtp_shipping_info"),
    vtpCreatedAt: (0, pg_core_1.timestamp)("vtp_created_at", { mode: 'string' }),
    vtpUpdatedAt: (0, pg_core_1.timestamp)("vtp_updated_at", { mode: 'string' }),
    sellerId: (0, pg_core_1.varchar)("seller_id"),
    bookSource: (0, pg_core_1.text)("book_source").default('local_inventory').notNull(),
    isbn: (0, pg_core_1.text)(),
    condition: (0, pg_core_1.text)().default('new').notNull(),
    sellerCommission: (0, pg_core_1.numeric)("seller_commission", { precision: 15, scale: 2 }).default(0),
    bookMetadata: (0, pg_core_1.jsonb)("book_metadata"),
    inventoryStatus: (0, pg_core_1.text)("inventory_status").default('reserved').notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { mode: 'string' }).defaultNow(),
    customerNameBook: (0, pg_core_1.text)("customer_name_book").notNull(),
    customerEmailBook: (0, pg_core_1.text)("customer_email_book"),
    customerPhoneBook: (0, pg_core_1.text)("customer_phone_book").notNull(),
    customerAddressBook: (0, pg_core_1.text)("customer_address_book"),
}, (table) => [
    (0, pg_core_1.unique)("unique_source_order").on(table.source, table.sourceOrderId),
]);
exports.bookPaymentTransactions = (0, pg_core_1.pgTable)("book_payment_transactions", {
    id: (0, pg_core_1.integer)().default('nextval(book_payment_transactions_id_seq').primaryKey(),
    orderId: (0, pg_core_1.varchar)("order_id"),
    gateway: (0, pg_core_1.text)().notNull(),
    transactionId: (0, pg_core_1.varchar)("transaction_id").notNull(),
    amount: (0, pg_core_1.numeric)({ precision: 15, scale: 2 }).notNull(),
    currency: (0, pg_core_1.varchar)({ length: 3 }).default('USD').notNull(),
    status: (0, pg_core_1.text)().default('pending').notNull(),
    paymentMethod: (0, pg_core_1.varchar)("payment_method"),
    customerEmail: (0, pg_core_1.varchar)("customer_email"),
    metadata: (0, pg_core_1.jsonb)().default({}),
    errorMessage: (0, pg_core_1.text)("error_message"),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow(),
    completedAt: (0, pg_core_1.timestamp)("completed_at", { mode: 'string' }),
});
exports.bookPrices = (0, pg_core_1.pgTable)("book_prices", {
    id: (0, pg_core_1.varchar)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    bookIsbn: (0, pg_core_1.varchar)("book_isbn").notNull(),
    source: (0, pg_core_1.varchar)().notNull(),
    price: (0, pg_core_1.numeric)({ precision: 10, scale: 2 }).notNull(),
    status: (0, pg_core_1.varchar)().default('In Stock'),
    sourceUrl: (0, pg_core_1.varchar)("source_url"),
    productId: (0, pg_core_1.varchar)("product_id"),
    lastUpdatedAt: (0, pg_core_1.timestamp)("last_updated_at", { mode: 'string' }).defaultNow(),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow(),
    sourceId: (0, pg_core_1.varchar)("source_id"),
    currency: (0, pg_core_1.varchar)({ length: 3 }).default('USD'),
    stock: (0, pg_core_1.integer)().default(0),
    condition: (0, pg_core_1.varchar)({ length: 20 }).default('new'),
    sellerName: (0, pg_core_1.varchar)("seller_name", { length: 100 }),
    sellerRating: (0, pg_core_1.numeric)("seller_rating", { precision: 3, scale: 2 }),
    deliveryTime: (0, pg_core_1.varchar)("delivery_time", { length: 50 }),
    isCurrentPrice: (0, pg_core_1.boolean)("is_current_price").default(true),
    priceHistory: (0, pg_core_1.jsonb)("price_history"),
    lastChecked: (0, pg_core_1.timestamp)("last_checked", { mode: 'string' }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
    (0, pg_core_1.unique)("book_prices_book_isbn_source_key").on(table.bookIsbn, table.source),
]);
exports.bookPricingRules = (0, pg_core_1.pgTable)("book_pricing_rules", {
    id: (0, pg_core_1.varchar)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    ruleName: (0, pg_core_1.text)("rule_name").notNull(),
    categoryId: (0, pg_core_1.varchar)("category_id"),
    conditions: (0, pg_core_1.jsonb)().default({}),
    priceAdjustment: (0, pg_core_1.jsonb)("price_adjustment").notNull(),
    priority: (0, pg_core_1.integer)().default(0).notNull(),
    isActive: (0, pg_core_1.boolean)("is_active").default(true).notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { mode: 'string' }).defaultNow(),
});
exports.bookSellerInventory = (0, pg_core_1.pgTable)("book_seller_inventory", {
    id: (0, pg_core_1.varchar)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    sellerId: (0, pg_core_1.varchar)("seller_id").notNull(),
    productId: (0, pg_core_1.varchar)("product_id").notNull(),
    stock: (0, pg_core_1.integer)().default(0).notNull(),
    reservedStock: (0, pg_core_1.integer)("reserved_stock").default(0).notNull(),
    basePrice: (0, pg_core_1.numeric)("base_price", { precision: 15, scale: 2 }).notNull(),
    sellerPrice: (0, pg_core_1.numeric)("seller_price", { precision: 15, scale: 2 }).notNull(),
    calculatedPrice: (0, pg_core_1.numeric)("calculated_price", { precision: 15, scale: 2 }).notNull(),
    assignedAt: (0, pg_core_1.timestamp)("assigned_at", { mode: 'string' }).defaultNow(),
    assignmentType: (0, pg_core_1.text)("assignment_type").default('auto_random').notNull(),
    totalSold: (0, pg_core_1.integer)("total_sold").default(0).notNull(),
    totalRevenue: (0, pg_core_1.numeric)("total_revenue", { precision: 15, scale: 2 }).default(0).notNull(),
    lastSale: (0, pg_core_1.timestamp)("last_sale", { mode: 'string' }),
    isActive: (0, pg_core_1.boolean)("is_active").default(true).notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
    (0, pg_core_1.unique)("book_seller_inventory_seller_id_product_id_key").on(table.sellerId, table.productId),
]);
exports.bookSellers = (0, pg_core_1.pgTable)("book_sellers", {
    id: (0, pg_core_1.varchar)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    sellerId: (0, pg_core_1.text)("seller_id").notNull(),
    displayName: (0, pg_core_1.text)("display_name").notNull(),
    businessName: (0, pg_core_1.text)("business_name").notNull(),
    profile: (0, pg_core_1.jsonb)().notNull(),
    tier: (0, pg_core_1.text)().default('standard').notNull(),
    pricingTier: (0, pg_core_1.text)("pricing_tier").default('markup_price').notNull(),
    totalSales: (0, pg_core_1.numeric)("total_sales", { precision: 15, scale: 2 }).default(0).notNull(),
    totalOrders: (0, pg_core_1.integer)("total_orders").default(0).notNull(),
    avgRating: (0, pg_core_1.numeric)("avg_rating", { precision: 3, scale: 2 }).default(0).notNull(),
    responseTime: (0, pg_core_1.integer)("response_time").default(24).notNull(),
    maxBooks: (0, pg_core_1.integer)("max_books").default(10000).notNull(),
    currentBooks: (0, pg_core_1.integer)("current_books").default(0).notNull(),
    autoAssignBooks: (0, pg_core_1.boolean)("auto_assign_books").default(true).notNull(),
    isActive: (0, pg_core_1.boolean)("is_active").default(true).notNull(),
    isTopSeller: (0, pg_core_1.boolean)("is_top_seller").default(false).notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { mode: 'string' }).defaultNow(),
    config: (0, pg_core_1.jsonb)(),
}, (table) => [
    (0, pg_core_1.unique)("book_sellers_seller_id_key").on(table.sellerId),
]);
exports.books = (0, pg_core_1.pgTable)("books", {
    isbn: (0, pg_core_1.varchar)().primaryKey(),
    title: (0, pg_core_1.varchar)().notNull(),
    author: (0, pg_core_1.varchar)().notNull(),
    format: (0, pg_core_1.varchar)().default('Paperback'),
    coverImageUrl: (0, pg_core_1.varchar)("cover_image_url"),
    ranking: (0, pg_core_1.integer)().default(999999),
    averageRating: (0, pg_core_1.numeric)("average_rating", { precision: 3, scale: 2 }).default(0.0),
    reviewCount: (0, pg_core_1.integer)("review_count").default(0),
    isTopSeller: (0, pg_core_1.boolean)("is_top_seller").default(false),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { mode: 'string' }).defaultNow(),
    subtitle: (0, pg_core_1.text)(),
    publisher: (0, pg_core_1.varchar)({ length: 255 }),
    publicationYear: (0, pg_core_1.integer)("publication_year"),
    pages: (0, pg_core_1.integer)(),
    language: (0, pg_core_1.varchar)({ length: 50 }).default('English'),
    description: (0, pg_core_1.text)(),
    coverImage: (0, pg_core_1.varchar)("cover_image", { length: 500 }),
    genreId: (0, pg_core_1.varchar)("genre_id", { length: 50 }),
    status: (0, pg_core_1.varchar)({ length: 20 }).default('active'),
    isNew: (0, pg_core_1.boolean)("is_new").default(false),
    isBestseller: (0, pg_core_1.boolean)("is_bestseller").default(false),
    isRecommended: (0, pg_core_1.boolean)("is_recommended").default(false),
    isFeatured: (0, pg_core_1.boolean)("is_featured").default(false),
    seoTitle: (0, pg_core_1.text)("seo_title"),
    seoDescription: (0, pg_core_1.text)("seo_description"),
    seoKeywords: (0, pg_core_1.jsonb)("seo_keywords"),
    priceRegions: (0, pg_core_1.jsonb)("price_regions"),
    targetMarkets: (0, pg_core_1.jsonb)("target_markets"),
    lastPriceUpdate: (0, pg_core_1.timestamp)("last_price_update", { mode: 'string' }),
    sellerId: (0, pg_core_1.varchar)("seller_id", { length: 50 }),
});
exports.botSettings = (0, pg_core_1.pgTable)("bot_settings", {
    id: (0, pg_core_1.varchar)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    rasaUrl: (0, pg_core_1.text)("rasa_url").default('http://localhost:5005').notNull(),
    webhookUrl: (0, pg_core_1.text)("webhook_url"),
    isEnabled: (0, pg_core_1.boolean)("is_enabled").default(true).notNull(),
    autoReply: (0, pg_core_1.boolean)("auto_reply").default(false).notNull(),
    apiKey: (0, pg_core_1.text)("api_key"),
    connectionTimeout: (0, pg_core_1.integer)("connection_timeout").default(5000).notNull(),
    maxRetries: (0, pg_core_1.integer)("max_retries").default(3).notNull(),
    lastHealthCheck: (0, pg_core_1.timestamp)("last_health_check", { mode: 'string' }),
    healthStatus: (0, pg_core_1.text)("health_status").default('offline').notNull(),
    errorMessage: (0, pg_core_1.text)("error_message"),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { mode: 'string' }).defaultNow(),
});
exports.campaignParticipations = (0, pg_core_1.pgTable)("campaign_participations", {
    id: (0, pg_core_1.varchar)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    campaignId: (0, pg_core_1.varchar)("campaign_id").notNull(),
    customerId: (0, pg_core_1.varchar)("customer_id").notNull(),
    shareUrl: (0, pg_core_1.text)("share_url").notNull(),
    submittedAt: (0, pg_core_1.timestamp)("submitted_at", { mode: 'string' }).defaultNow().notNull(),
    status: (0, pg_core_1.text)().default('pending').notNull(),
    verificationScheduledAt: (0, pg_core_1.timestamp)("verification_scheduled_at", { mode: 'string' }),
    lastVerifiedAt: (0, pg_core_1.timestamp)("last_verified_at", { mode: 'string' }),
    rewardedAt: (0, pg_core_1.timestamp)("rewarded_at", { mode: 'string' }),
    voucherId: (0, pg_core_1.varchar)("voucher_id"),
    rejectionReason: (0, pg_core_1.text)("rejection_reason"),
    verificationAttempts: (0, pg_core_1.integer)("verification_attempts").default(0).notNull(),
    metadata: (0, pg_core_1.jsonb)().default({}),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
    (0, pg_core_1.unique)("campaign_participations_campaign_id_customer_id_key").on(table.campaignId, table.customerId),
]);
exports.campaigns = (0, pg_core_1.pgTable)("campaigns", {
    id: (0, pg_core_1.varchar)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    name: (0, pg_core_1.text)().notNull(),
    description: (0, pg_core_1.text)(),
    type: (0, pg_core_1.text)().default('share_to_earn').notNull(),
    rewardType: (0, pg_core_1.text)("reward_type").default('voucher').notNull(),
    rewardVoucherCodeId: (0, pg_core_1.varchar)("reward_voucher_code_id"),
    rewardPoints: (0, pg_core_1.integer)("reward_points").default(0),
    status: (0, pg_core_1.text)().default('draft').notNull(),
    startDate: (0, pg_core_1.timestamp)("start_date", { mode: 'string' }).notNull(),
    endDate: (0, pg_core_1.timestamp)("end_date", { mode: 'string' }),
    verificationDelayHours: (0, pg_core_1.integer)("verification_delay_hours").default(24).notNull(),
    minEngagementLikes: (0, pg_core_1.integer)("min_engagement_likes").default(0),
    minEngagementShares: (0, pg_core_1.integer)("min_engagement_shares").default(0),
    minEngagementComments: (0, pg_core_1.integer)("min_engagement_comments").default(0),
    requirePostStillExists: (0, pg_core_1.boolean)("require_post_still_exists").default(true).notNull(),
    maxParticipations: (0, pg_core_1.integer)("max_participations"),
    maxParticipationsPerCustomer: (0, pg_core_1.integer)("max_participations_per_customer").default(1),
    shareTemplate: (0, pg_core_1.text)("share_template"),
    requiredHashtags: (0, pg_core_1.jsonb)("required_hashtags").default([]),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { mode: 'string' }).defaultNow().notNull(),
    createdBy: (0, pg_core_1.varchar)("created_by"),
});
exports.carGroups = (0, pg_core_1.pgTable)("car_groups", {
    id: (0, pg_core_1.varchar)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    name: (0, pg_core_1.text)().notNull(),
    description: (0, pg_core_1.text)(),
    color: (0, pg_core_1.text)().default('#3b82f6').notNull(),
    icon: (0, pg_core_1.text)().default('car'),
    groupType: (0, pg_core_1.text)("group_type").default('custom').notNull(),
    isActive: (0, pg_core_1.boolean)("is_active").default(true).notNull(),
    metadata: (0, pg_core_1.jsonb)().default({}),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { mode: 'string' }).defaultNow(),
    createdBy: (0, pg_core_1.varchar)("created_by"),
});
exports.categories = (0, pg_core_1.pgTable)("categories", {
    id: (0, pg_core_1.varchar)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    name: (0, pg_core_1.text)().notNull(),
    description: (0, pg_core_1.text)(),
    isActive: (0, pg_core_1.boolean)("is_active").default(true).notNull(),
    sortOrder: (0, pg_core_1.integer)("sort_order").default(0).notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { mode: 'string' }).defaultNow(),
    industryId: (0, pg_core_1.varchar)("industry_id").notNull(),
    consultationConfig: (0, pg_core_1.jsonb)("consultation_config").default({}),
    consultationTemplates: (0, pg_core_1.jsonb)("consultation_templates").default({}),
    salesAdviceTemplate: (0, pg_core_1.jsonb)("sales_advice_template").default({}),
    isVipOnly: (0, pg_core_1.boolean)("is_vip_only").default(false).notNull(),
});
exports.categoryFaqTemplates = (0, pg_core_1.pgTable)("category_faq_templates", {
    id: (0, pg_core_1.varchar)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    categoryId: (0, pg_core_1.varchar)("category_id").notNull(),
    faqId: (0, pg_core_1.varchar)("faq_id").notNull(),
    sortOrder: (0, pg_core_1.integer)("sort_order").default(0).notNull(),
    isActive: (0, pg_core_1.boolean)("is_active").default(true).notNull(),
    autoInherit: (0, pg_core_1.boolean)("auto_inherit").default(true).notNull(),
    createdBy: (0, pg_core_1.varchar)("created_by"),
    templateNote: (0, pg_core_1.text)("template_note"),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
    (0, pg_core_1.unique)("category_faq_templates_category_id_faq_id_key").on(table.categoryId, table.faqId),
]);
exports.categoryPriceRules = (0, pg_core_1.pgTable)("category_price_rules", {
    id: (0, pg_core_1.varchar)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    categoryId: (0, pg_core_1.varchar)("category_id").notNull(),
    ruleName: (0, pg_core_1.varchar)("rule_name").notNull(),
    ruleType: (0, pg_core_1.varchar)("rule_type").notNull(),
    minPrice: (0, pg_core_1.numeric)("min_price"),
    maxPrice: (0, pg_core_1.numeric)("max_price"),
    discountPercentage: (0, pg_core_1.numeric)("discount_percentage"),
    markupPercentage: (0, pg_core_1.numeric)("markup_percentage"),
    conditions: (0, pg_core_1.jsonb)(),
    priority: (0, pg_core_1.integer)().default(0),
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
    startDate: (0, pg_core_1.text)("start_date"),
    endDate: (0, pg_core_1.text)("end_date"),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { mode: 'string' }).defaultNow(),
});
exports.chatbotConversations = (0, pg_core_1.pgTable)("chatbot_conversations", {
    id: (0, pg_core_1.varchar)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    customerId: (0, pg_core_1.varchar)("customer_id"),
    sessionId: (0, pg_core_1.text)("session_id").notNull(),
    messages: (0, pg_core_1.jsonb)().notNull(),
    status: (0, pg_core_1.text)().default('active').notNull(),
    satisfactionRating: (0, pg_core_1.integer)("satisfaction_rating"),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { mode: 'string' }).defaultNow(),
});
exports.competitorProfiles = (0, pg_core_1.pgTable)("competitor_profiles", {
    id: (0, pg_core_1.varchar)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    competitorName: (0, pg_core_1.text)("competitor_name").notNull(),
    competitorType: (0, pg_core_1.text)("competitor_type").notNull(),
    pricingStrategy: (0, pg_core_1.text)("pricing_strategy").notNull(),
    qualityLevel: (0, pg_core_1.text)("quality_level").default('standard').notNull(),
    responseSpeed: (0, pg_core_1.text)("response_speed").default('normal').notNull(),
    marketShare: (0, pg_core_1.numeric)("market_share", { precision: 5, scale: 4 }).default(0.0500).notNull(),
    avgRating: (0, pg_core_1.numeric)("avg_rating", { precision: 3, scale: 2 }).default(4.00).notNull(),
    totalReviews: (0, pg_core_1.integer)("total_reviews").default(500).notNull(),
    inventorySize: (0, pg_core_1.integer)("inventory_size").default(5000).notNull(),
    avgDiscountRate: (0, pg_core_1.numeric)("avg_discount_rate", { precision: 5, scale: 4 }).default(0.1000).notNull(),
    priceChangeFrequency: (0, pg_core_1.text)("price_change_frequency").default('weekly').notNull(),
    priceFlexibility: (0, pg_core_1.numeric)("price_flexibility", { precision: 5, scale: 2 }).default(15.00).notNull(),
    specializedCategories: (0, pg_core_1.jsonb)("specialized_categories").default([]),
    categoryPricing: (0, pg_core_1.jsonb)("category_pricing").default({}),
    activityLevel: (0, pg_core_1.text)("activity_level").default('moderate').notNull(),
    promotionFrequency: (0, pg_core_1.text)("promotion_frequency").default('occasional').notNull(),
    seasonalAggressiveness: (0, pg_core_1.numeric)("seasonal_aggressiveness", { precision: 3, scale: 2 }).default(1.50).notNull(),
    vietnameseBusinessPractices: (0, pg_core_1.jsonb)("vietnamese_business_practices").default((0, drizzle_orm_1.sql) `'{"acceptsDebt": false, "festivalDiscounts": true, "offersInstallment": false, "regionalPreferences": []}'::jsonb`),
    isActive: (0, pg_core_1.boolean)("is_active").default(true).notNull(),
    simulationWeight: (0, pg_core_1.numeric)("simulation_weight", { precision: 3, scale: 2 }).default(1.00).notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { mode: 'string' }).defaultNow(),
});
exports.consignmentRequests = (0, pg_core_1.pgTable)("consignment_requests", {
    id: (0, pg_core_1.varchar)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    vendorId: (0, pg_core_1.varchar)("vendor_id").notNull(),
    productId: (0, pg_core_1.varchar)("product_id"),
    productName: (0, pg_core_1.varchar)("product_name").notNull(),
    productDescription: (0, pg_core_1.text)("product_description"),
    quantity: (0, pg_core_1.integer)().notNull(),
    proposedPrice: (0, pg_core_1.numeric)("proposed_price", { precision: 15, scale: 2 }).notNull(),
    discountPercent: (0, pg_core_1.numeric)("discount_percent", { precision: 5, scale: 2 }).default(0),
    attachments: (0, pg_core_1.jsonb)().default([]),
    status: (0, pg_core_1.varchar)().default('pending'),
    reviewerId: (0, pg_core_1.varchar)("reviewer_id"),
    reviewerNotes: (0, pg_core_1.text)("reviewer_notes"),
    reviewedAt: (0, pg_core_1.timestamp)("reviewed_at", { mode: 'string' }),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { mode: 'string' }).defaultNow().notNull(),
});
exports.contentAssets = (0, pg_core_1.pgTable)("content_assets", {
    id: (0, pg_core_1.varchar)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    filename: (0, pg_core_1.varchar)({ length: 255 }).notNull(),
    originalFilename: (0, pg_core_1.varchar)("original_filename", { length: 255 }).notNull(),
    cloudinaryPublicId: (0, pg_core_1.varchar)("cloudinary_public_id", { length: 255 }).notNull(),
    cloudinaryUrl: (0, pg_core_1.text)("cloudinary_url").notNull(),
    cloudinarySecureUrl: (0, pg_core_1.text)("cloudinary_secure_url").notNull(),
    mimeType: (0, pg_core_1.varchar)("mime_type", { length: 100 }).notNull(),
    fileSize: (0, pg_core_1.integer)("file_size").notNull(),
    width: (0, pg_core_1.integer)(),
    height: (0, pg_core_1.integer)(),
    duration: (0, pg_core_1.numeric)({ precision: 8, scale: 3 }),
    categoryId: (0, pg_core_1.integer)("category_id"),
    altText: (0, pg_core_1.text)("alt_text"),
    caption: (0, pg_core_1.text)(),
    usageCount: (0, pg_core_1.integer)("usage_count").default(0),
    lastUsed: (0, pg_core_1.timestamp)("last_used", { mode: 'string' }),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { mode: 'string' }).defaultNow(),
    tagIds: (0, pg_core_1.jsonb)("tag_ids").default([]),
    resourceType: (0, pg_core_1.varchar)("resource_type", { length: 20 }).notNull(),
}, (table) => [
    (0, pg_core_1.unique)("content_assets_cloudinary_public_id_unique").on(table.cloudinaryPublicId),
]);
exports.contentCategories = (0, pg_core_1.pgTable)("content_categories", {
    id: (0, pg_core_1.integer)().default('nextval(content_categories_id_seq').primaryKey(),
    name: (0, pg_core_1.varchar)({ length: 255 }).notNull(),
    description: (0, pg_core_1.text)(),
    color: (0, pg_core_1.varchar)({ length: 7 }).default('#3B82F6').notNull(),
    icon: (0, pg_core_1.varchar)({ length: 50 }),
    sortOrder: (0, pg_core_1.integer)("sort_order").default(0),
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { mode: 'string' }).defaultNow(),
});
exports.contentFaqAssignments = (0, pg_core_1.pgTable)("content_faq_assignments", {
    id: (0, pg_core_1.varchar)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    faqId: (0, pg_core_1.varchar)("faq_id").notNull(),
    contentType: (0, pg_core_1.text)("content_type").default('product').notNull(),
    contentId: (0, pg_core_1.varchar)("content_id").notNull(),
    sortOrder: (0, pg_core_1.integer)("sort_order").default(0).notNull(),
    isVisible: (0, pg_core_1.boolean)("is_visible").default(true).notNull(),
    assignedBy: (0, pg_core_1.varchar)("assigned_by"),
    assignmentNote: (0, pg_core_1.text)("assignment_note"),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { mode: 'string' }).defaultNow(),
    isInherited: (0, pg_core_1.boolean)("is_inherited").default(false).notNull(),
    templateId: (0, pg_core_1.varchar)("template_id"),
    inheritedAt: (0, pg_core_1.timestamp)("inherited_at", { mode: 'string' }),
}, (table) => [
    (0, pg_core_1.unique)("unique_faq_content_assignment").on(table.faqId, table.contentType, table.contentId),
]);
exports.contentLibrary = (0, pg_core_1.pgTable)("content_library", {
    id: (0, pg_core_1.varchar)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    title: (0, pg_core_1.varchar)({ length: 255 }).notNull(),
    baseContent: (0, pg_core_1.text)("base_content").notNull(),
    contentType: (0, pg_core_1.text)("content_type").default('text').notNull(),
    assetIds: (0, pg_core_1.jsonb)("asset_ids").default([]),
    tagIds: (0, pg_core_1.jsonb)("tag_ids").default([]),
    aiVariations: (0, pg_core_1.jsonb)("ai_variations").default([]),
    priority: (0, pg_core_1.text)().default('normal').notNull(),
    usageCount: (0, pg_core_1.integer)("usage_count").default(0),
    lastUsed: (0, pg_core_1.timestamp)("last_used", { mode: 'string' }),
    status: (0, pg_core_1.text)().default('draft').notNull(),
    isTemplate: (0, pg_core_1.boolean)("is_template").default(false),
    platforms: (0, pg_core_1.jsonb)().default((0, drizzle_orm_1.sql) `'["facebook", "instagram", "tiktok"]'::jsonb`),
    bestTimeSlots: (0, pg_core_1.jsonb)("best_time_slots").default([]),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { mode: 'string' }).defaultNow(),
    contentFingerprint: (0, pg_core_1.text)("content_fingerprint"),
});
exports.contentQueue = (0, pg_core_1.pgTable)("content_queue", {
    id: (0, pg_core_1.varchar)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    contentLibraryId: (0, pg_core_1.varchar)("content_library_id"),
    caption: (0, pg_core_1.text)(),
    hashtags: (0, pg_core_1.jsonb)().default([]),
    assetIds: (0, pg_core_1.jsonb)("asset_ids").default([]),
    targetType: (0, pg_core_1.text)("target_type").default('all').notNull(),
    targetGroupId: (0, pg_core_1.varchar)("target_group_id"),
    targetAccountIds: (0, pg_core_1.jsonb)("target_account_ids").default([]),
    priority: (0, pg_core_1.integer)().default(5).notNull(),
    queuePosition: (0, pg_core_1.integer)("queue_position").notNull(),
    autoFill: (0, pg_core_1.boolean)("auto_fill").default(false),
    preferredTimeSlots: (0, pg_core_1.jsonb)("preferred_time_slots").default([]),
    useAiVariation: (0, pg_core_1.boolean)("use_ai_variation").default(false),
    variationTone: (0, pg_core_1.text)("variation_tone"),
    status: (0, pg_core_1.text)().default('pending').notNull(),
    timesUsed: (0, pg_core_1.integer)("times_used").default(0),
    lastScheduledAt: (0, pg_core_1.timestamp)("last_scheduled_at", { mode: 'string' }),
    errorMessage: (0, pg_core_1.text)("error_message"),
    retryCount: (0, pg_core_1.integer)("retry_count").default(0),
    metadata: (0, pg_core_1.jsonb)(),
    createdBy: (0, pg_core_1.varchar)("created_by"),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { mode: 'string' }).defaultNow(),
});
exports.conversationMessages = (0, pg_core_1.pgTable)("conversation_messages", {
    id: (0, pg_core_1.varchar)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    sessionId: (0, pg_core_1.varchar)("session_id").notNull(),
    message: (0, pg_core_1.text)().notNull(),
    messageType: (0, pg_core_1.text)("message_type").default('text').notNull(),
    sender: (0, pg_core_1.text)().default('user').notNull(),
    isBot: (0, pg_core_1.boolean)("is_bot").default(false).notNull(),
    intent: (0, pg_core_1.text)(),
    entities: (0, pg_core_1.jsonb)().default([]),
    confidence: (0, pg_core_1.numeric)({ precision: 4, scale: 3 }),
    responseTime: (0, pg_core_1.integer)("response_time"),
    context: (0, pg_core_1.jsonb)().default({}),
    metadata: (0, pg_core_1.jsonb)().default({}),
    timestamp: (0, pg_core_1.timestamp)({ mode: 'string' }).defaultNow(),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow(),
});
exports.conversationSessions = (0, pg_core_1.pgTable)("conversation_sessions", {
    id: (0, pg_core_1.varchar)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    userId: (0, pg_core_1.varchar)("user_id"),
    sessionId: (0, pg_core_1.text)("session_id").notNull(),
    channel: (0, pg_core_1.text)().default('web').notNull(),
    userAgent: (0, pg_core_1.text)("user_agent"),
    ipAddress: (0, pg_core_1.text)("ip_address"),
    messageCount: (0, pg_core_1.integer)("message_count").default(0).notNull(),
    totalResponseTime: (0, pg_core_1.integer)("total_response_time").default(0).notNull(),
    avgResponseTime: (0, pg_core_1.numeric)("avg_response_time", { precision: 8, scale: 2 }),
    status: (0, pg_core_1.text)().default('active').notNull(),
    resolutionStatus: (0, pg_core_1.text)("resolution_status"),
    escalatedToHuman: (0, pg_core_1.boolean)("escalated_to_human").default(false).notNull(),
    escalatedAt: (0, pg_core_1.timestamp)("escalated_at", { mode: 'string' }),
    escalationReason: (0, pg_core_1.text)("escalation_reason"),
    assignedAgentId: (0, pg_core_1.varchar)("assigned_agent_id"),
    startedAt: (0, pg_core_1.timestamp)("started_at", { mode: 'string' }).defaultNow(),
    endedAt: (0, pg_core_1.timestamp)("ended_at", { mode: 'string' }),
    lastActiveAt: (0, pg_core_1.timestamp)("last_active_at", { mode: 'string' }).defaultNow(),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
    (0, pg_core_1.unique)("conversation_sessions_session_id_key").on(table.sessionId),
]);
exports.cookieProfiles = (0, pg_core_1.pgTable)("cookie_profiles", {
    id: (0, pg_core_1.varchar)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    userId: (0, pg_core_1.varchar)("user_id").notNull(),
    socialNetwork: (0, pg_core_1.text)("social_network").notNull(),
    groupTag: (0, pg_core_1.text)("group_tag").notNull(),
    accountName: (0, pg_core_1.text)("account_name").notNull(),
    encryptedData: (0, pg_core_1.text)("encrypted_data").notNull(),
    lastUsed: (0, pg_core_1.timestamp)("last_used", { mode: 'string' }),
    isActive: (0, pg_core_1.boolean)("is_active").default(true).notNull(),
    metadata: (0, pg_core_1.jsonb)().default({}),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { mode: 'string' }).defaultNow(),
    version: (0, pg_core_1.integer)().default(1).notNull(),
    isVerified: (0, pg_core_1.boolean)("is_verified").default(false).notNull(),
    verificationStatus: (0, pg_core_1.text)("verification_status"),
    lastVerifiedAt: (0, pg_core_1.timestamp)("last_verified_at", { mode: 'string' }),
    adAccounts: (0, pg_core_1.jsonb)("ad_accounts").default([]),
    hasAdsAccess: (0, pg_core_1.boolean)("has_ads_access").default(false),
});
exports.customerEvents = (0, pg_core_1.pgTable)("customer_events", {
    id: (0, pg_core_1.varchar)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    customerId: (0, pg_core_1.varchar)("customer_id").notNull(),
    eventType: (0, pg_core_1.text)("event_type").notNull(),
    eventData: (0, pg_core_1.jsonb)("event_data").default({}),
    channel: (0, pg_core_1.text)().notNull(),
    sessionId: (0, pg_core_1.text)("session_id"),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow().notNull(),
});
exports.customerReviews = (0, pg_core_1.pgTable)("customer_reviews", {
    id: (0, pg_core_1.varchar)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    sellerId: (0, pg_core_1.varchar)("seller_id").notNull(),
    customerId: (0, pg_core_1.varchar)("customer_id"),
    orderId: (0, pg_core_1.varchar)("order_id"),
    overallRating: (0, pg_core_1.integer)("overall_rating").notNull(),
    deliverySpeedRating: (0, pg_core_1.integer)("delivery_speed_rating").notNull(),
    bookConditionRating: (0, pg_core_1.integer)("book_condition_rating").notNull(),
    customerServiceRating: (0, pg_core_1.integer)("customer_service_rating").notNull(),
    pricingRating: (0, pg_core_1.integer)("pricing_rating").notNull(),
    reviewTitle: (0, pg_core_1.text)("review_title").notNull(),
    reviewContent: (0, pg_core_1.text)("review_content").notNull(),
    reviewLanguage: (0, pg_core_1.varchar)("review_language", { length: 10 }).default('vi').notNull(),
    regionDialect: (0, pg_core_1.varchar)("region_dialect", { length: 20 }).default('miền-bắc'),
    isAutoGenerated: (0, pg_core_1.boolean)("is_auto_generated").default(false).notNull(),
    sentimentScore: (0, pg_core_1.numeric)("sentiment_score", { precision: 3, scale: 2 }).default(0),
    helpfulnessVotes: (0, pg_core_1.integer)("helpfulness_votes").default(0),
    isVerified: (0, pg_core_1.boolean)("is_verified").default(false),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { mode: 'string' }).defaultNow(),
});
exports.customerVouchers = (0, pg_core_1.pgTable)("customer_vouchers", {
    id: (0, pg_core_1.varchar)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    customerId: (0, pg_core_1.varchar)("customer_id").notNull(),
    discountCodeId: (0, pg_core_1.integer)("discount_code_id").notNull(),
    claimedAt: (0, pg_core_1.timestamp)("claimed_at", { mode: 'string' }).defaultNow().notNull(),
    claimedVia: (0, pg_core_1.text)("claimed_via").default('manual_input').notNull(),
    campaignId: (0, pg_core_1.varchar)("campaign_id"),
    shareVerificationId: (0, pg_core_1.varchar)("share_verification_id"),
    status: (0, pg_core_1.text)().default('active').notNull(),
    usedAt: (0, pg_core_1.timestamp)("used_at", { mode: 'string' }),
    revokedAt: (0, pg_core_1.timestamp)("revoked_at", { mode: 'string' }),
    revokedReason: (0, pg_core_1.text)("revoked_reason"),
    orderId: (0, pg_core_1.varchar)("order_id"),
    discountApplied: (0, pg_core_1.numeric)("discount_applied", { precision: 10, scale: 2 }),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { mode: 'string' }).defaultNow().notNull(),
});
exports.customers = (0, pg_core_1.pgTable)("customers", {
    id: (0, pg_core_1.varchar)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    name: (0, pg_core_1.text)().notNull(),
    email: (0, pg_core_1.text)(),
    phone: (0, pg_core_1.text)().notNull(),
    avatar: (0, pg_core_1.text)(),
    status: (0, pg_core_1.text)().default('active').notNull(),
    joinDate: (0, pg_core_1.timestamp)("join_date", { mode: 'string' }).defaultNow(),
    totalDebt: (0, pg_core_1.numeric)("total_debt", { precision: 15, scale: 2 }).default(0),
    creditLimit: (0, pg_core_1.numeric)("credit_limit", { precision: 15, scale: 2 }).default(0),
    membershipTier: (0, pg_core_1.text)("membership_tier").default('member'),
    totalSpent: (0, pg_core_1.numeric)("total_spent", { precision: 15, scale: 2 }).default(0),
    pointsBalance: (0, pg_core_1.integer)("points_balance").default(0),
    pointsEarned: (0, pg_core_1.integer)("points_earned").default(0),
    lastTierUpdate: (0, pg_core_1.timestamp)("last_tier_update", { mode: 'string' }).defaultNow(),
    authUserId: (0, pg_core_1.varchar)("auth_user_id"),
    membershipData: (0, pg_core_1.jsonb)("membership_data").default({}),
    socialAccountIds: (0, pg_core_1.jsonb)("social_account_ids").default({}),
    socialData: (0, pg_core_1.jsonb)("social_data").default({}),
    limitsData: (0, pg_core_1.jsonb)("limits_data").default({}),
    isLocalCustomer: (0, pg_core_1.boolean)("is_local_customer").default(false).notNull(),
    isAffiliate: (0, pg_core_1.boolean)("is_affiliate").default(false),
    affiliateCode: (0, pg_core_1.text)("affiliate_code"),
    affiliateStatus: (0, pg_core_1.text)("affiliate_status").default('pending'),
    commissionRate: (0, pg_core_1.numeric)("commission_rate", { precision: 5, scale: 2 }).default(5.00),
    affiliateData: (0, pg_core_1.jsonb)("affiliate_data").default({}),
    registrationSource: (0, pg_core_1.text)("registration_source").default('admin').notNull(),
    customerRole: (0, pg_core_1.text)("customer_role").default('customer').notNull(),
    profileStatus: (0, pg_core_1.text)("profile_status").default('incomplete').notNull(),
    address: (0, pg_core_1.text)(),
    latitude: (0, pg_core_1.numeric)({ precision: 10, scale: 8 }),
    longitude: (0, pg_core_1.numeric)({ precision: 11, scale: 8 }),
    distanceFromShop: (0, pg_core_1.numeric)("distance_from_shop", { precision: 10, scale: 3 }),
    geocodingStatus: (0, pg_core_1.text)("geocoding_status").default('not_geocoded'),
    lastGeocodedAt: (0, pg_core_1.timestamp)("last_geocoded_at", { mode: 'string' }),
    address2: (0, pg_core_1.text)(),
}, (table) => [
    (0, pg_core_1.unique)("customers_email_unique").on(table.email),
    (0, pg_core_1.unique)("customers_phone_unique").on(table.phone),
]);
exports.depositTransactions = (0, pg_core_1.pgTable)("deposit_transactions", {
    id: (0, pg_core_1.varchar)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    vendorId: (0, pg_core_1.varchar)("vendor_id").notNull(),
    orderId: (0, pg_core_1.varchar)("order_id"),
    type: (0, pg_core_1.varchar)().notNull(),
    amount: (0, pg_core_1.numeric)({ precision: 15, scale: 2 }).notNull(),
    balanceBefore: (0, pg_core_1.numeric)("balance_before", { precision: 15, scale: 2 }),
    balanceAfter: (0, pg_core_1.numeric)("balance_after", { precision: 15, scale: 2 }),
    proofUrl: (0, pg_core_1.text)("proof_url"),
    description: (0, pg_core_1.text)(),
    processedById: (0, pg_core_1.varchar)("processed_by_id"),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow().notNull(),
});
exports.discountCodeUsages = (0, pg_core_1.pgTable)("discount_code_usages", {
    id: (0, pg_core_1.integer)().default('nextval(discount_code_usages_id_seq').primaryKey(),
    discountCodeId: (0, pg_core_1.integer)("discount_code_id").notNull(),
    orderId: (0, pg_core_1.varchar)("order_id"),
    customerId: (0, pg_core_1.varchar)("customer_id"),
    usageAmount: (0, pg_core_1.numeric)("usage_amount", { precision: 10, scale: 2 }).notNull(),
    discountApplied: (0, pg_core_1.numeric)("discount_applied", { precision: 10, scale: 2 }).notNull(),
    channel: (0, pg_core_1.varchar)().default('online'),
    usedAt: (0, pg_core_1.timestamp)("used_at", { mode: 'string' }).defaultNow(),
    metadata: (0, pg_core_1.jsonb)(),
});
exports.discountCodes = (0, pg_core_1.pgTable)("discount_codes", {
    id: (0, pg_core_1.integer)().default('nextval(discount_codes_id_seq').primaryKey(),
    code: (0, pg_core_1.varchar)().notNull(),
    name: (0, pg_core_1.varchar)().notNull(),
    description: (0, pg_core_1.text)(),
    type: (0, pg_core_1.varchar)().notNull(),
    discountValue: (0, pg_core_1.numeric)("discount_value", { precision: 10, scale: 2 }).notNull(),
    maxDiscountAmount: (0, pg_core_1.numeric)("max_discount_amount", { precision: 10, scale: 2 }),
    tierRules: (0, pg_core_1.jsonb)("tier_rules"),
    maxUsage: (0, pg_core_1.integer)("max_usage"),
    maxUsagePerCustomer: (0, pg_core_1.integer)("max_usage_per_customer").default(1),
    minOrderAmount: (0, pg_core_1.numeric)("min_order_amount", { precision: 10, scale: 2 }).default(0),
    validFrom: (0, pg_core_1.timestamp)("valid_from", { mode: 'string' }).notNull(),
    validUntil: (0, pg_core_1.timestamp)("valid_until", { mode: 'string' }),
    channelRestrictions: (0, pg_core_1.jsonb)("channel_restrictions"),
    scheduleRules: (0, pg_core_1.jsonb)("schedule_rules"),
    status: (0, pg_core_1.varchar)().default('active').notNull(),
    usageCount: (0, pg_core_1.integer)("usage_count").default(0),
    localizedMessages: (0, pg_core_1.jsonb)("localized_messages"),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { mode: 'string' }).defaultNow(),
    createdBy: (0, pg_core_1.varchar)("created_by"),
}, (table) => [
    (0, pg_core_1.unique)("discount_codes_code_key").on(table.code),
]);
exports.discountScopeAssignments = (0, pg_core_1.pgTable)("discount_scope_assignments", {
    id: (0, pg_core_1.integer)().default('nextval(discount_scope_assignments_id_seq').primaryKey(),
    discountCodeId: (0, pg_core_1.integer)("discount_code_id").notNull(),
    productId: (0, pg_core_1.varchar)("product_id"),
    categoryId: (0, pg_core_1.varchar)("category_id"),
    customerId: (0, pg_core_1.varchar)("customer_id"),
    customerSegmentRules: (0, pg_core_1.jsonb)("customer_segment_rules"),
    assignmentType: (0, pg_core_1.varchar)("assignment_type").default('include').notNull(),
    isExclusion: (0, pg_core_1.boolean)("is_exclusion").default(false),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { mode: 'string' }).defaultNow(),
});
exports.driverReports = (0, pg_core_1.pgTable)("driver_reports", {
    id: (0, pg_core_1.varchar)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    tripId: (0, pg_core_1.varchar)("trip_id").notNull(),
    driverId: (0, pg_core_1.varchar)("driver_id").notNull(),
    customerId: (0, pg_core_1.varchar)("customer_id"),
    reportType: (0, pg_core_1.text)("report_type").notNull(),
    title: (0, pg_core_1.text)().notNull(),
    description: (0, pg_core_1.text)().notNull(),
    severity: (0, pg_core_1.text)().default('medium').notNull(),
    status: (0, pg_core_1.text)().default('pending').notNull(),
    resolution: (0, pg_core_1.text)(),
    reportedAt: (0, pg_core_1.timestamp)("reported_at", { mode: 'string' }).defaultNow(),
    reviewedAt: (0, pg_core_1.timestamp)("reviewed_at", { mode: 'string' }),
    resolvedAt: (0, pg_core_1.timestamp)("resolved_at", { mode: 'string' }),
    reviewedBy: (0, pg_core_1.varchar)("reviewed_by"),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { mode: 'string' }).defaultNow(),
});
exports.facebookApps = (0, pg_core_1.pgTable)("facebook_apps", {
    id: (0, pg_core_1.varchar)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    appName: (0, pg_core_1.text)("app_name").notNull(),
    appId: (0, pg_core_1.text)("app_id").notNull(),
    appSecret: (0, pg_core_1.text)("app_secret").notNull(),
    webhookUrl: (0, pg_core_1.text)("webhook_url"),
    verifyToken: (0, pg_core_1.text)("verify_token"),
    subscriptionFields: (0, pg_core_1.jsonb)("subscription_fields").default((0, drizzle_orm_1.sql) `'["messages", "messaging_postbacks", "feed"]'::jsonb`),
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
    environment: (0, pg_core_1.text)().default('development'),
    description: (0, pg_core_1.text)(),
    lastWebhookEvent: (0, pg_core_1.timestamp)("last_webhook_event", { mode: 'string' }),
    totalEvents: (0, pg_core_1.integer)("total_events").default(0),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { mode: 'string' }).defaultNow(),
    tagIds: (0, pg_core_1.jsonb)("tag_ids").default([]),
    groupId: (0, pg_core_1.varchar)("group_id"),
}, (table) => [
    (0, pg_core_1.unique)("facebook_apps_app_id_unique").on(table.appId),
]);
exports.facebookConversations = (0, pg_core_1.pgTable)("facebook_conversations", {
    id: (0, pg_core_1.varchar)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    pageId: (0, pg_core_1.text)("page_id").notNull(),
    pageName: (0, pg_core_1.text)("page_name").notNull(),
    participantId: (0, pg_core_1.text)("participant_id").notNull(),
    participantName: (0, pg_core_1.text)("participant_name").notNull(),
    participantAvatar: (0, pg_core_1.text)("participant_avatar"),
    status: (0, pg_core_1.text)().default('active').notNull(),
    priority: (0, pg_core_1.text)().default('normal').notNull(),
    assignedTo: (0, pg_core_1.varchar)("assigned_to"),
    messageCount: (0, pg_core_1.integer)("message_count").default(0).notNull(),
    lastMessageAt: (0, pg_core_1.timestamp)("last_message_at", { mode: 'string' }),
    lastMessagePreview: (0, pg_core_1.text)("last_message_preview"),
    isRead: (0, pg_core_1.boolean)("is_read").default(false),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { mode: 'string' }).defaultNow(),
    tagIds: (0, pg_core_1.jsonb)("tag_ids").default([]),
});
exports.facebookMessages = (0, pg_core_1.pgTable)("facebook_messages", {
    id: (0, pg_core_1.varchar)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    conversationId: (0, pg_core_1.varchar)("conversation_id").notNull(),
    facebookMessageId: (0, pg_core_1.text)("facebook_message_id").notNull(),
    senderId: (0, pg_core_1.text)("sender_id").notNull(),
    senderName: (0, pg_core_1.text)("sender_name").notNull(),
    senderType: (0, pg_core_1.text)("sender_type").notNull(),
    content: (0, pg_core_1.text)(),
    messageType: (0, pg_core_1.text)("message_type").default('text').notNull(),
    attachments: (0, pg_core_1.jsonb)().default([]),
    timestamp: (0, pg_core_1.timestamp)({ mode: 'string' }).notNull(),
    isEcho: (0, pg_core_1.boolean)("is_echo").default(false),
    replyToMessageId: (0, pg_core_1.text)("reply_to_message_id"),
    isRead: (0, pg_core_1.boolean)("is_read").default(false),
    isDelivered: (0, pg_core_1.boolean)("is_delivered").default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
    (0, pg_core_1.unique)("facebook_messages_facebook_message_id_unique").on(table.facebookMessageId),
]);
exports.facebookWebhookEvents = (0, pg_core_1.pgTable)("facebook_webhook_events", {
    id: (0, pg_core_1.varchar)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    appId: (0, pg_core_1.varchar)("app_id").notNull(),
    eventType: (0, pg_core_1.text)("event_type").notNull(),
    eventData: (0, pg_core_1.jsonb)("event_data").notNull(),
    processedAt: (0, pg_core_1.timestamp)("processed_at", { mode: 'string' }).defaultNow(),
    status: (0, pg_core_1.text)().default('pending'),
    errorMessage: (0, pg_core_1.text)("error_message"),
});
exports.faqGenerationJobs = (0, pg_core_1.pgTable)("faq_generation_jobs", {
    id: (0, pg_core_1.varchar)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    productId: (0, pg_core_1.varchar)("product_id").notNull(),
    categoryId: (0, pg_core_1.varchar)("category_id").notNull(),
    prompt: (0, pg_core_1.text)().notNull(),
    aiModel: (0, pg_core_1.varchar)("ai_model").default('gemini'),
    status: (0, pg_core_1.varchar)().default('pending'),
    rawResponse: (0, pg_core_1.jsonb)("raw_response"),
    error: (0, pg_core_1.text)(),
    processingStartedAt: (0, pg_core_1.timestamp)("processing_started_at", { mode: 'string' }),
    processingCompletedAt: (0, pg_core_1.timestamp)("processing_completed_at", { mode: 'string' }),
    requestedBy: (0, pg_core_1.varchar)("requested_by").default('anonymous'),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { mode: 'string' }).defaultNow(),
});
exports.faqGenerationResults = (0, pg_core_1.pgTable)("faq_generation_results", {
    id: (0, pg_core_1.varchar)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    jobId: (0, pg_core_1.varchar)("job_id").notNull(),
    question: (0, pg_core_1.text)().notNull(),
    answer: (0, pg_core_1.text)().notNull(),
    questionOrder: (0, pg_core_1.integer)("question_order").default(1),
    status: (0, pg_core_1.varchar)().default('generated'),
    finalFaqId: (0, pg_core_1.varchar)("final_faq_id"),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { mode: 'string' }).defaultNow(),
    confidenceScore: (0, pg_core_1.numeric)("confidence_score", { precision: 5, scale: 3 }).default(0.85),
    reviewedBy: (0, pg_core_1.varchar)("reviewed_by"),
    reviewedAt: (0, pg_core_1.timestamp)("reviewed_at", { mode: 'string' }),
    reviewNotes: (0, pg_core_1.text)("review_notes"),
});
exports.faqLibrary = (0, pg_core_1.pgTable)("faq_library", {
    id: (0, pg_core_1.varchar)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    question: (0, pg_core_1.text)().notNull(),
    answer: (0, pg_core_1.text)().notNull(),
    tagIds: (0, pg_core_1.jsonb)("tag_ids").default([]),
    priority: (0, pg_core_1.text)().default('medium').notNull(),
    category: (0, pg_core_1.text)().default('product').notNull(),
    isActive: (0, pg_core_1.boolean)("is_active").default(true).notNull(),
    sortOrder: (0, pg_core_1.integer)("sort_order").default(0).notNull(),
    usageCount: (0, pg_core_1.integer)("usage_count").default(0).notNull(),
    lastUsed: (0, pg_core_1.timestamp)("last_used", { mode: 'string' }),
    keywords: (0, pg_core_1.jsonb)().default([]),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { mode: 'string' }).defaultNow(),
});
exports.frontendCategoryAssignments = (0, pg_core_1.pgTable)("frontend_category_assignments", {
    id: (0, pg_core_1.varchar)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    frontendId: (0, pg_core_1.text)("frontend_id").notNull(),
    categoryId: (0, pg_core_1.varchar)("category_id").notNull(),
    isLocalOnly: (0, pg_core_1.boolean)("is_local_only").default(false).notNull(),
    sortOrder: (0, pg_core_1.integer)("sort_order").default(0).notNull(),
    isActive: (0, pg_core_1.boolean)("is_active").default(true).notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { mode: 'string' }).defaultNow(),
});
exports.generalCategories = (0, pg_core_1.pgTable)("general_categories", {
    id: (0, pg_core_1.varchar)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    name: (0, pg_core_1.varchar)().notNull(),
    slug: (0, pg_core_1.varchar)().notNull(),
    parentId: (0, pg_core_1.varchar)("parent_id"),
    level: (0, pg_core_1.integer)().default(0),
    sortOrder: (0, pg_core_1.integer)("sort_order").default(0),
    description: (0, pg_core_1.text)(),
    icon: (0, pg_core_1.varchar)(),
    color: (0, pg_core_1.varchar)().default('#3b82f6'),
    productCount: (0, pg_core_1.integer)("product_count").default(0),
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
    isFeatured: (0, pg_core_1.boolean)("is_featured").default(false),
    metaTitle: (0, pg_core_1.varchar)("meta_title"),
    metaDescription: (0, pg_core_1.text)("meta_description"),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
    (0, pg_core_1.unique)("general_categories_slug_key").on(table.slug),
]);
exports.generalCategoryAnalytics = (0, pg_core_1.pgTable)("general_category_analytics", {
    id: (0, pg_core_1.varchar)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    categoryId: (0, pg_core_1.varchar)("category_id").notNull(),
    analyticsDate: (0, pg_core_1.timestamp)("analytics_date", { mode: 'string' }).defaultNow().notNull(),
    pageViews: (0, pg_core_1.integer)("page_views").default(0),
    uniqueVisitors: (0, pg_core_1.integer)("unique_visitors").default(0),
    bounceRate: (0, pg_core_1.numeric)("bounce_rate", { precision: 5, scale: 2 }).default(0.00),
    avgTimeOnPage: (0, pg_core_1.integer)("avg_time_on_page").default(0),
    totalProducts: (0, pg_core_1.integer)("total_products").default(0),
    activeProducts: (0, pg_core_1.integer)("active_products").default(0),
    totalOrders: (0, pg_core_1.integer)("total_orders").default(0),
    totalRevenue: (0, pg_core_1.numeric)("total_revenue", { precision: 12, scale: 2 }).default(0.00),
    clickThroughRate: (0, pg_core_1.numeric)("click_through_rate", { precision: 5, scale: 2 }).default(0.00),
    conversionRate: (0, pg_core_1.numeric)("conversion_rate", { precision: 5, scale: 2 }).default(0.00),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { mode: 'string' }).defaultNow(),
});
exports.generalCategoryAssignments = (0, pg_core_1.pgTable)("general_category_assignments", {
    id: (0, pg_core_1.varchar)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    productId: (0, pg_core_1.varchar)("product_id").notNull(),
    categoryId: (0, pg_core_1.varchar)("category_id").notNull(),
    isPrimary: (0, pg_core_1.boolean)("is_primary").default(false),
    sortOrder: (0, pg_core_1.integer)("sort_order").default(0),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
    (0, pg_core_1.unique)("general_unique_product_category").on(table.productId, table.categoryId),
]);
exports.generalCategoryPriceRules = (0, pg_core_1.pgTable)("general_category_price_rules", {
    id: (0, pg_core_1.varchar)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    categoryId: (0, pg_core_1.varchar)("category_id").notNull(),
    ruleName: (0, pg_core_1.varchar)("rule_name").notNull(),
    ruleType: (0, pg_core_1.varchar)("rule_type").notNull(),
    minPrice: (0, pg_core_1.numeric)("min_price", { precision: 10, scale: 2 }),
    maxPrice: (0, pg_core_1.numeric)("max_price", { precision: 10, scale: 2 }),
    discountPercentage: (0, pg_core_1.numeric)("discount_percentage", { precision: 5, scale: 2 }),
    markupPercentage: (0, pg_core_1.numeric)("markup_percentage", { precision: 5, scale: 2 }),
    conditions: (0, pg_core_1.jsonb)().default({}),
    priority: (0, pg_core_1.integer)().default(0),
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
    startDate: (0, pg_core_1.timestamp)("start_date", { mode: 'string' }),
    endDate: (0, pg_core_1.timestamp)("end_date", { mode: 'string' }),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { mode: 'string' }).defaultNow(),
});
exports.giftCampaigns = (0, pg_core_1.pgTable)("gift_campaigns", {
    id: (0, pg_core_1.varchar)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    name: (0, pg_core_1.text)().notNull(),
    description: (0, pg_core_1.text)(),
    type: (0, pg_core_1.varchar)().notNull(),
    value: (0, pg_core_1.numeric)({ precision: 10, scale: 2 }).notNull(),
    includedProducts: (0, pg_core_1.jsonb)("included_products").default([]),
    digitalTemplate: (0, pg_core_1.jsonb)("digital_template").default({}),
    physicalTemplate: (0, pg_core_1.jsonb)("physical_template").default({}),
    maxQuantityPerOrder: (0, pg_core_1.integer)("max_quantity_per_order").default(10),
    validityDays: (0, pg_core_1.integer)("validity_days").default(365).notNull(),
    allowPartialRedemption: (0, pg_core_1.boolean)("allow_partial_redemption").default(false).notNull(),
    availableChannels: (0, pg_core_1.jsonb)("available_channels").default((0, drizzle_orm_1.sql) `'{"channels": ["online", "pos"]}'::jsonb`),
    vatIncluded: (0, pg_core_1.boolean)("vat_included").default(true).notNull(),
    invoiceRequired: (0, pg_core_1.boolean)("invoice_required").default(false).notNull(),
    complianceNotes: (0, pg_core_1.text)("compliance_notes"),
    status: (0, pg_core_1.varchar)().default('draft').notNull(),
    activeFrom: (0, pg_core_1.timestamp)("active_from", { mode: 'string' }).defaultNow(),
    activeUntil: (0, pg_core_1.timestamp)("active_until", { mode: 'string' }),
    totalSold: (0, pg_core_1.integer)("total_sold").default(0).notNull(),
    totalValue: (0, pg_core_1.numeric)("total_value", { precision: 12, scale: 2 }).default(0).notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { mode: 'string' }).defaultNow(),
    createdBy: (0, pg_core_1.varchar)("created_by"),
});
exports.giftRedemptions = (0, pg_core_1.pgTable)("gift_redemptions", {
    id: (0, pg_core_1.varchar)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    voucherId: (0, pg_core_1.varchar)("voucher_id").notNull(),
    orderId: (0, pg_core_1.varchar)("order_id"),
    redeemedAmount: (0, pg_core_1.numeric)("redeemed_amount", { precision: 10, scale: 2 }).notNull(),
    redeemedBy: (0, pg_core_1.varchar)("redeemed_by"),
    redemptionChannel: (0, pg_core_1.varchar)("redemption_channel").notNull(),
    generatedDiscountCodeId: (0, pg_core_1.varchar)("generated_discount_code_id"),
    discountApplicationResult: (0, pg_core_1.jsonb)("discount_application_result").default({}),
    transactionReference: (0, pg_core_1.text)("transaction_reference"),
    staffMemberId: (0, pg_core_1.varchar)("staff_member_id"),
    redemptionStatus: (0, pg_core_1.varchar)("redemption_status").default('successful').notNull(),
    validationResult: (0, pg_core_1.jsonb)("validation_result").default({}),
    redeemedAt: (0, pg_core_1.timestamp)("redeemed_at", { mode: 'string' }).defaultNow(),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { mode: 'string' }).defaultNow(),
});
exports.giftVouchers = (0, pg_core_1.pgTable)("gift_vouchers", {
    id: (0, pg_core_1.varchar)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    voucherCode: (0, pg_core_1.varchar)("voucher_code", { length: 20 }).notNull(),
    campaignId: (0, pg_core_1.varchar)("campaign_id").notNull(),
    purchaseOrderId: (0, pg_core_1.varchar)("purchase_order_id"),
    purchasedBy: (0, pg_core_1.varchar)("purchased_by"),
    purchaseAmount: (0, pg_core_1.numeric)("purchase_amount", { precision: 10, scale: 2 }).notNull(),
    purchaseChannel: (0, pg_core_1.varchar)("purchase_channel").notNull(),
    faceValue: (0, pg_core_1.numeric)("face_value", { precision: 10, scale: 2 }).notNull(),
    currentBalance: (0, pg_core_1.numeric)("current_balance", { precision: 10, scale: 2 }).notNull(),
    recipientName: (0, pg_core_1.text)("recipient_name"),
    recipientEmail: (0, pg_core_1.text)("recipient_email"),
    recipientPhone: (0, pg_core_1.text)("recipient_phone"),
    personalMessage: (0, pg_core_1.text)("personal_message"),
    deliveryMethod: (0, pg_core_1.varchar)("delivery_method").default('email').notNull(),
    deliveryStatus: (0, pg_core_1.varchar)("delivery_status").default('pending').notNull(),
    deliveryDetails: (0, pg_core_1.jsonb)("delivery_details").default({}),
    expiresAt: (0, pg_core_1.timestamp)("expires_at", { mode: 'string' }).notNull(),
    firstUsedAt: (0, pg_core_1.timestamp)("first_used_at", { mode: 'string' }),
    fullyRedeemedAt: (0, pg_core_1.timestamp)("fully_redeemed_at", { mode: 'string' }),
    status: (0, pg_core_1.varchar)().default('issued').notNull(),
    vatAmount: (0, pg_core_1.numeric)("vat_amount", { precision: 10, scale: 2 }),
    invoiceNumber: (0, pg_core_1.text)("invoice_number"),
    complianceData: (0, pg_core_1.jsonb)("compliance_data").default({}),
    issuedAt: (0, pg_core_1.timestamp)("issued_at", { mode: 'string' }).defaultNow(),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
    (0, pg_core_1.unique)("gift_vouchers_voucher_code_key").on(table.voucherCode),
]);
exports.globalAutomationControl = (0, pg_core_1.pgTable)("global_automation_control", {
    id: (0, pg_core_1.text)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    masterEnabled: (0, pg_core_1.boolean)("master_enabled").default(false),
    emergencyStop: (0, pg_core_1.boolean)("emergency_stop").default(false),
    maintenanceMode: (0, pg_core_1.boolean)("maintenance_mode").default(false),
    globalLimits: (0, pg_core_1.jsonb)("global_limits"),
    healthThresholds: (0, pg_core_1.jsonb)("health_thresholds"),
    schedulingConfig: (0, pg_core_1.jsonb)("scheduling_config"),
    statistics: (0, pg_core_1.jsonb)(),
    notes: (0, pg_core_1.text)(),
    lastUpdatedBy: (0, pg_core_1.text)("last_updated_by"),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { mode: 'string' }).defaultNow(),
    version: (0, pg_core_1.integer)().default(1),
});
exports.industries = (0, pg_core_1.pgTable)("industries", {
    id: (0, pg_core_1.varchar)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    name: (0, pg_core_1.text)().notNull(),
    description: (0, pg_core_1.text)(),
    isActive: (0, pg_core_1.boolean)("is_active").default(true).notNull(),
    sortOrder: (0, pg_core_1.integer)("sort_order").default(0).notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { mode: 'string' }).defaultNow(),
});
exports.industryKeywords = (0, pg_core_1.pgTable)("industry_keywords", {
    id: (0, pg_core_1.varchar)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    industryId: (0, pg_core_1.varchar)("industry_id").notNull(),
    keyword: (0, pg_core_1.text)().notNull(),
    weight: (0, pg_core_1.numeric)({ precision: 5, scale: 3 }).default(1.000).notNull(),
    isActive: (0, pg_core_1.boolean)("is_active").default(true).notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { mode: 'string' }).defaultNow(),
});
exports.industryRules = (0, pg_core_1.pgTable)("industry_rules", {
    id: (0, pg_core_1.varchar)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    industryId: (0, pg_core_1.varchar)("industry_id").notNull(),
    rulesJson: (0, pg_core_1.jsonb)("rules_json").default({}),
    isActive: (0, pg_core_1.boolean)("is_active").default(true).notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { mode: 'string' }).defaultNow(),
});
exports.industryTemplates = (0, pg_core_1.pgTable)("industry_templates", {
    id: (0, pg_core_1.varchar)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    industryId: (0, pg_core_1.varchar)("industry_id").notNull(),
    intent: (0, pg_core_1.text)().notNull(),
    template: (0, pg_core_1.text)().notNull(),
    language: (0, pg_core_1.text)().default('vi').notNull(),
    isActive: (0, pg_core_1.boolean)("is_active").default(true).notNull(),
    priority: (0, pg_core_1.integer)().default(0).notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { mode: 'string' }).defaultNow(),
});
exports.intentAnalytics = (0, pg_core_1.pgTable)("intent_analytics", {
    id: (0, pg_core_1.varchar)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    intentName: (0, pg_core_1.text)("intent_name").notNull(),
    displayName: (0, pg_core_1.text)("display_name"),
    category: (0, pg_core_1.text)().default('general').notNull(),
    totalCount: (0, pg_core_1.integer)("total_count").default(0).notNull(),
    successCount: (0, pg_core_1.integer)("success_count").default(0).notNull(),
    failureCount: (0, pg_core_1.integer)("failure_count").default(0).notNull(),
    successRate: (0, pg_core_1.numeric)("success_rate", { precision: 5, scale: 2 }).default(0.00),
    avgConfidence: (0, pg_core_1.numeric)("avg_confidence", { precision: 4, scale: 3 }),
    avgResponseTime: (0, pg_core_1.numeric)("avg_response_time", { precision: 8, scale: 2 }),
    lastTriggered: (0, pg_core_1.timestamp)("last_triggered", { mode: 'string' }),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
    (0, pg_core_1.unique)("intent_analytics_intent_name_key").on(table.intentName),
]);
exports.invoiceTemplates = (0, pg_core_1.pgTable)("invoice_templates", {
    id: (0, pg_core_1.varchar)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    name: (0, pg_core_1.varchar)({ length: 255 }).notNull(),
    config: (0, pg_core_1.jsonb)().default({}).notNull(),
    isDefault: (0, pg_core_1.boolean)("is_default").default(false).notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { mode: 'string' }).defaultNow(),
});
exports.ipPoolSessions = (0, pg_core_1.pgTable)("ip_pool_sessions", {
    id: (0, pg_core_1.integer)().default('nextval(ip_pool_sessions_id_seq').primaryKey(),
    ipPoolId: (0, pg_core_1.integer)("ip_pool_id").notNull(),
    sessionStart: (0, pg_core_1.timestamp)("session_start", { mode: 'string' }).defaultNow().notNull(),
    sessionEnd: (0, pg_core_1.timestamp)("session_end", { mode: 'string' }),
    ipAddress: (0, pg_core_1.varchar)("ip_address", { length: 100 }),
    postsCount: (0, pg_core_1.integer)("posts_count").default(0),
    successCount: (0, pg_core_1.integer)("success_count").default(0),
    failCount: (0, pg_core_1.integer)("fail_count").default(0),
    status: (0, pg_core_1.varchar)({ length: 50 }).default('active'),
    metadata: (0, pg_core_1.jsonb)().default({}),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow(),
});
exports.ipPools = (0, pg_core_1.pgTable)("ip_pools", {
    id: (0, pg_core_1.integer)().default('nextval(ip_pools_id_seq').primaryKey(),
    name: (0, pg_core_1.varchar)({ length: 255 }).notNull(),
    type: (0, pg_core_1.varchar)({ length: 50 }).notNull(),
    status: (0, pg_core_1.varchar)({ length: 50 }).default('inactive').notNull(),
    currentIp: (0, pg_core_1.varchar)("current_ip", { length: 100 }),
    config: (0, pg_core_1.jsonb)().default({}),
    healthScore: (0, pg_core_1.integer)("health_score").default(100),
    totalRotations: (0, pg_core_1.integer)("total_rotations").default(0),
    lastRotatedAt: (0, pg_core_1.timestamp)("last_rotated_at", { mode: 'string' }),
    isEnabled: (0, pg_core_1.boolean)("is_enabled").default(true),
    priority: (0, pg_core_1.integer)().default(0),
    costPerMonth: (0, pg_core_1.numeric)("cost_per_month", { precision: 10, scale: 2 }),
    notes: (0, pg_core_1.text)(),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { mode: 'string' }).defaultNow(),
});
exports.ipRotationLogs = (0, pg_core_1.pgTable)("ip_rotation_logs", {
    id: (0, pg_core_1.integer)().default('nextval(ip_rotation_logs_id_seq').primaryKey(),
    ipPoolId: (0, pg_core_1.integer)("ip_pool_id").notNull(),
    oldIp: (0, pg_core_1.varchar)("old_ip", { length: 100 }),
    newIp: (0, pg_core_1.varchar)("new_ip", { length: 100 }),
    rotationReason: (0, pg_core_1.varchar)("rotation_reason", { length: 255 }),
    rotationMethod: (0, pg_core_1.varchar)("rotation_method", { length: 50 }),
    success: (0, pg_core_1.boolean)().default(false),
    errorMessage: (0, pg_core_1.text)("error_message"),
    metadata: (0, pg_core_1.jsonb)().default({}),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow(),
});
exports.marketTrends = (0, pg_core_1.pgTable)("market_trends", {
    id: (0, pg_core_1.varchar)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    categoryId: (0, pg_core_1.varchar)("category_id").notNull(),
    categoryName: (0, pg_core_1.text)("category_name").notNull(),
    trendScore: (0, pg_core_1.numeric)("trend_score", { precision: 5, scale: 2 }).default(50.00).notNull(),
    trendDirection: (0, pg_core_1.text)("trend_direction").default('stable').notNull(),
    momentumScore: (0, pg_core_1.numeric)("momentum_score", { precision: 5, scale: 2 }).default(0).notNull(),
    searchVolume: (0, pg_core_1.integer)("search_volume").default(0).notNull(),
    searchVolumeChange: (0, pg_core_1.numeric)("search_volume_change", { precision: 7, scale: 2 }).default(0).notNull(),
    orderVolumeWeekly: (0, pg_core_1.integer)("order_volume_weekly").default(0).notNull(),
    averagePrice: (0, pg_core_1.numeric)("average_price", { precision: 15, scale: 2 }).default(0).notNull(),
    priceVolatility: (0, pg_core_1.numeric)("price_volatility", { precision: 5, scale: 2 }).default(0).notNull(),
    competitorCount: (0, pg_core_1.integer)("competitor_count").default(0).notNull(),
    marketSaturation: (0, pg_core_1.numeric)("market_saturation", { precision: 5, scale: 4 }).default(0.5000).notNull(),
    entryBarrier: (0, pg_core_1.text)("entry_barrier").default('medium').notNull(),
    seasonalityIndex: (0, pg_core_1.numeric)("seasonality_index", { precision: 5, scale: 2 }).default(1.00).notNull(),
    peakSeasons: (0, pg_core_1.jsonb)("peak_seasons").default([]),
    vietnamesePopularity: (0, pg_core_1.numeric)("vietnamese_popularity", { precision: 5, scale: 2 }).default(50.00).notNull(),
    regionalDemand: (0, pg_core_1.jsonb)("regional_demand").default((0, drizzle_orm_1.sql) `'{"Miền Nam": 34, "Miền Bắc": 33, "Miền Trung": 33}'::jsonb`),
    predictedTrendNext7Days: (0, pg_core_1.text)("predicted_trend_next_7_days"),
    predictedTrendNext30Days: (0, pg_core_1.text)("predicted_trend_next_30_days"),
    confidenceScore: (0, pg_core_1.numeric)("confidence_score", { precision: 3, scale: 2 }).default(0.50).notNull(),
    recommendedAction: (0, pg_core_1.text)("recommended_action").default('maintain'),
    automationEnabled: (0, pg_core_1.boolean)("automation_enabled").default(false).notNull(),
    lastCalculated: (0, pg_core_1.timestamp)("last_calculated", { mode: 'string' }).defaultNow(),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { mode: 'string' }).defaultNow(),
});
exports.oauthConnections = (0, pg_core_1.pgTable)("oauth_connections", {
    id: (0, pg_core_1.varchar)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    customerId: (0, pg_core_1.varchar)("customer_id").notNull(),
    provider: (0, pg_core_1.text)().notNull(),
    providerUserId: (0, pg_core_1.varchar)("provider_user_id").notNull(),
    email: (0, pg_core_1.varchar)(),
    accessToken: (0, pg_core_1.text)("access_token"),
    refreshToken: (0, pg_core_1.text)("refresh_token"),
    tokenExpiresAt: (0, pg_core_1.timestamp)("token_expires_at", { mode: 'string' }),
    profileData: (0, pg_core_1.jsonb)("profile_data"),
    isPrimary: (0, pg_core_1.boolean)("is_primary").default(false).notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
    (0, pg_core_1.unique)("unique_provider_user").on(table.provider, table.providerUserId),
]);
exports.orderItems = (0, pg_core_1.pgTable)("order_items", {
    id: (0, pg_core_1.varchar)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    orderId: (0, pg_core_1.varchar)("order_id").notNull(),
    productId: (0, pg_core_1.varchar)("product_id").notNull(),
    quantity: (0, pg_core_1.numeric)({ precision: 10, scale: 3 }).notNull(),
    price: (0, pg_core_1.numeric)({ precision: 15, scale: 2 }).notNull(),
});
exports.orders = (0, pg_core_1.pgTable)("orders", {
    id: (0, pg_core_1.varchar)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    userId: (0, pg_core_1.varchar)("user_id"),
    items: (0, pg_core_1.jsonb)().notNull(),
    subtotal: (0, pg_core_1.numeric)({ precision: 10, scale: 2 }).notNull(),
    shippingFee: (0, pg_core_1.numeric)("shipping_fee", { precision: 10, scale: 2 }).default(5.00),
    tax: (0, pg_core_1.numeric)({ precision: 10, scale: 2 }).default(0.00),
    total: (0, pg_core_1.numeric)({ precision: 10, scale: 2 }).notNull(),
    currency: (0, pg_core_1.varchar)({ length: 3 }).default('USD'),
    shippingInfo: (0, pg_core_1.jsonb)("shipping_info").notNull(),
    paymentIntentId: (0, pg_core_1.varchar)("payment_intent_id", { length: 255 }),
    paymentStatus: (0, pg_core_1.varchar)("payment_status", { length: 20 }).default('pending'),
    paymentMethod: (0, pg_core_1.varchar)("payment_method", { length: 50 }),
    status: (0, pg_core_1.varchar)({ length: 20 }).default('pending'),
    trackingNumber: (0, pg_core_1.varchar)("tracking_number", { length: 100 }),
    estimatedDelivery: (0, pg_core_1.timestamp)("estimated_delivery", { mode: 'string' }),
    deliveredAt: (0, pg_core_1.timestamp)("delivered_at", { mode: 'string' }),
    customerNotes: (0, pg_core_1.text)("customer_notes"),
    adminNotes: (0, pg_core_1.text)("admin_notes"),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { mode: 'string' }).defaultNow(),
    source: (0, pg_core_1.text)().default('admin'),
    sourceOrderId: (0, pg_core_1.text)("source_order_id"),
    sourceReference: (0, pg_core_1.text)("source_reference"),
    syncStatus: (0, pg_core_1.text)("sync_status").default('manual'),
    syncData: (0, pg_core_1.jsonb)("sync_data"),
    sourceCustomerInfo: (0, pg_core_1.jsonb)("source_customer_info"),
    vtpOrderSystemCode: (0, pg_core_1.text)("vtp_order_system_code"),
    vtpOrderNumber: (0, pg_core_1.text)("vtp_order_number"),
    vtpServiceCode: (0, pg_core_1.text)("vtp_service_code"),
    vtpStatus: (0, pg_core_1.text)("vtp_status"),
    vtpTrackingData: (0, pg_core_1.jsonb)("vtp_tracking_data"),
    vtpShippingInfo: (0, pg_core_1.jsonb)("vtp_shipping_info"),
    vtpCreatedAt: (0, pg_core_1.timestamp)("vtp_created_at", { mode: 'string' }),
    vtpUpdatedAt: (0, pg_core_1.timestamp)("vtp_updated_at", { mode: 'string' }),
    assignedDriverId: (0, pg_core_1.varchar)("assigned_driver_id"),
    affiliateId: (0, pg_core_1.varchar)("affiliate_id"),
    affiliateCommission: (0, pg_core_1.numeric)("affiliate_commission", { precision: 15, scale: 2 }).default(0.00),
    sendInvoiceToChat: (0, pg_core_1.boolean)("send_invoice_to_chat").default(false),
    invoiceSentAt: (0, pg_core_1.timestamp)("invoice_sent_at", { mode: 'string' }),
    invoiceSentVia: (0, pg_core_1.varchar)("invoice_sent_via"),
    tags: (0, pg_core_1.text)().default('ARRAY[]'),
});
exports.pageTags = (0, pg_core_1.pgTable)("page_tags", {
    id: (0, pg_core_1.varchar)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    name: (0, pg_core_1.text)().notNull(),
    color: (0, pg_core_1.text)().default('#3B82F6').notNull(),
    description: (0, pg_core_1.text)(),
    isDefault: (0, pg_core_1.boolean)("is_default").default(false),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { mode: 'string' }).defaultNow(),
});
exports.paymentGatewaySettings = (0, pg_core_1.pgTable)("payment_gateway_settings", {
    id: (0, pg_core_1.integer)().default('nextval(payment_gateway_settings_id_seq').primaryKey(),
    gateway: (0, pg_core_1.text)().notNull(),
    enabled: (0, pg_core_1.boolean)().default(false).notNull(),
    credentials: (0, pg_core_1.jsonb)().default({}).notNull(),
    testMode: (0, pg_core_1.boolean)("test_mode").default(true).notNull(),
    webhookSecret: (0, pg_core_1.text)("webhook_secret"),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
    (0, pg_core_1.unique)("payment_gateway_settings_gateway_key").on(table.gateway),
]);
exports.payments = (0, pg_core_1.pgTable)("payments", {
    id: (0, pg_core_1.varchar)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    orderId: (0, pg_core_1.varchar)("order_id").notNull(),
    method: (0, pg_core_1.text)().default('qr_code').notNull(),
    amount: (0, pg_core_1.numeric)({ precision: 15, scale: 2 }).notNull(),
    qrCode: (0, pg_core_1.text)("qr_code"),
    status: (0, pg_core_1.text)().default('pending').notNull(),
    transactionId: (0, pg_core_1.text)("transaction_id"),
    bankInfo: (0, pg_core_1.jsonb)("bank_info"),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { mode: 'string' }).defaultNow(),
});
exports.performanceMetrics = (0, pg_core_1.pgTable)("performance_metrics", {
    id: (0, pg_core_1.varchar)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    sellerId: (0, pg_core_1.varchar)("seller_id").notNull(),
    periodType: (0, pg_core_1.varchar)("period_type", { length: 20 }).notNull(),
    periodStart: (0, pg_core_1.timestamp)("period_start", { mode: 'string' }).notNull(),
    periodEnd: (0, pg_core_1.timestamp)("period_end", { mode: 'string' }).notNull(),
    totalOrders: (0, pg_core_1.integer)("total_orders").default(0),
    successfulOrders: (0, pg_core_1.integer)("successful_orders").default(0),
    cancelledOrders: (0, pg_core_1.integer)("cancelled_orders").default(0),
    returnedOrders: (0, pg_core_1.integer)("returned_orders").default(0),
    totalRevenue: (0, pg_core_1.numeric)("total_revenue", { precision: 15, scale: 2 }).default(0),
    averageOrderValue: (0, pg_core_1.numeric)("average_order_value", { precision: 10, scale: 2 }).default(0),
    averageResponseTimeHours: (0, pg_core_1.numeric)("average_response_time_hours", { precision: 5, scale: 2 }).default(0),
    fulfillmentAccuracyPercent: (0, pg_core_1.numeric)("fulfillment_accuracy_percent", { precision: 5, scale: 2 }).default(0),
    customerSatisfactionScore: (0, pg_core_1.numeric)("customer_satisfaction_score", { precision: 3, scale: 2 }).default(0),
    repeatCustomerRate: (0, pg_core_1.numeric)("repeat_customer_rate", { precision: 5, scale: 2 }).default(0),
    recommendationRate: (0, pg_core_1.numeric)("recommendation_rate", { precision: 5, scale: 2 }).default(0),
    culturalSensitivityScore: (0, pg_core_1.numeric)("cultural_sensitivity_score", { precision: 3, scale: 2 }).default(0),
    efficiencyScore: (0, pg_core_1.numeric)("efficiency_score", { precision: 3, scale: 2 }).default(0),
    qualityScore: (0, pg_core_1.numeric)("quality_score", { precision: 3, scale: 2 }).default(0),
    overallPerformanceScore: (0, pg_core_1.numeric)("overall_performance_score", { precision: 3, scale: 2 }).default(0),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { mode: 'string' }).defaultNow(),
});
exports.priceSources = (0, pg_core_1.pgTable)("price_sources", {
    id: (0, pg_core_1.varchar)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    name: (0, pg_core_1.varchar)({ length: 100 }).notNull(),
    displayName: (0, pg_core_1.varchar)("display_name", { length: 100 }).notNull(),
    baseUrl: (0, pg_core_1.varchar)("base_url", { length: 255 }),
    apiKey: (0, pg_core_1.varchar)("api_key", { length: 255 }),
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
    priority: (0, pg_core_1.integer)().default(100),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { mode: 'string' }).defaultNow(),
});
exports.pricingStrategies = (0, pg_core_1.pgTable)("pricing_strategies", {
    id: (0, pg_core_1.varchar)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    sellerId: (0, pg_core_1.varchar)("seller_id").notNull(),
    strategyName: (0, pg_core_1.text)("strategy_name").notNull(),
    strategyType: (0, pg_core_1.text)("strategy_type").notNull(),
    baseApproach: (0, pg_core_1.text)("base_approach").default('moderate').notNull(),
    baseProfitMargin: (0, pg_core_1.numeric)("base_profit_margin", { precision: 5, scale: 4 }).default(0.2000).notNull(),
    minProfitMargin: (0, pg_core_1.numeric)("min_profit_margin", { precision: 5, scale: 4 }).default(0.0500).notNull(),
    maxProfitMargin: (0, pg_core_1.numeric)("max_profit_margin", { precision: 5, scale: 4 }).default(0.5000).notNull(),
    competitorTrackingEnabled: (0, pg_core_1.boolean)("competitor_tracking_enabled").default(true).notNull(),
    priceMatchStrategy: (0, pg_core_1.text)("price_match_strategy").default('stay_within_range'),
    competitiveMargin: (0, pg_core_1.numeric)("competitive_margin", { precision: 5, scale: 4 }).default(0.0500).notNull(),
    demandElasticity: (0, pg_core_1.numeric)("demand_elasticity", { precision: 5, scale: 4 }).default(0.5000).notNull(),
    stockLevelPricing: (0, pg_core_1.boolean)("stock_level_pricing").default(true).notNull(),
    lowStockPremium: (0, pg_core_1.numeric)("low_stock_premium", { precision: 5, scale: 4 }).default(0.1000).notNull(),
    overStockDiscount: (0, pg_core_1.numeric)("over_stock_discount", { precision: 5, scale: 4 }).default(0.1500).notNull(),
    timeBasedAdjustments: (0, pg_core_1.jsonb)("time_based_adjustments").default({}),
    categoryPricingRules: (0, pg_core_1.jsonb)("category_pricing_rules").default({}),
    festivalPricingRules: (0, pg_core_1.jsonb)("festival_pricing_rules").default({}),
    regionalPricingEnabled: (0, pg_core_1.boolean)("regional_pricing_enabled").default(false).notNull(),
    autoAdjustmentEnabled: (0, pg_core_1.boolean)("auto_adjustment_enabled").default(false).notNull(),
    adjustmentFrequency: (0, pg_core_1.text)("adjustment_frequency").default('daily').notNull(),
    maxPriceChangePerDay: (0, pg_core_1.numeric)("max_price_change_per_day", { precision: 5, scale: 4 }).default(0.1000).notNull(),
    avgPriceChangePercent: (0, pg_core_1.numeric)("avg_price_change_percent", { precision: 7, scale: 4 }).default(0).notNull(),
    profitabilityScore: (0, pg_core_1.numeric)("profitability_score", { precision: 5, scale: 2 }).default(50.00).notNull(),
    competitivenessScore: (0, pg_core_1.numeric)("competitiveness_score", { precision: 5, scale: 2 }).default(50.00).notNull(),
    salesVelocityImpact: (0, pg_core_1.numeric)("sales_velocity_impact", { precision: 7, scale: 4 }).default(0).notNull(),
    isActive: (0, pg_core_1.boolean)("is_active").default(true).notNull(),
    lastAdjusted: (0, pg_core_1.timestamp)("last_adjusted", { mode: 'string' }),
    nextAdjustment: (0, pg_core_1.timestamp)("next_adjustment", { mode: 'string' }),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { mode: 'string' }).defaultNow(),
});
exports.productFaqs = (0, pg_core_1.pgTable)("product_faqs", {
    id: (0, pg_core_1.varchar)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    productId: (0, pg_core_1.varchar)("product_id").notNull(),
    question: (0, pg_core_1.text)().notNull(),
    answer: (0, pg_core_1.text)().notNull(),
    sortOrder: (0, pg_core_1.integer)("sort_order").default(0).notNull(),
    isActive: (0, pg_core_1.boolean)("is_active").default(true).notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { mode: 'string' }).defaultNow(),
    faqId: (0, pg_core_1.varchar)("faq_id"),
    isAutoGenerated: (0, pg_core_1.boolean)("is_auto_generated").default(false).notNull(),
    category: (0, pg_core_1.text)(),
    subcategory: (0, pg_core_1.text)(),
    questionVariations: (0, pg_core_1.jsonb)("question_variations").default({}),
    channels: (0, pg_core_1.jsonb)().default({}),
    multimediaContent: (0, pg_core_1.jsonb)("multimedia_content").default({}),
    keywordWeights: (0, pg_core_1.jsonb)("keyword_weights").default({}),
    automation: (0, pg_core_1.jsonb)().default({}),
    upsellSuggestions: (0, pg_core_1.jsonb)("upsell_suggestions").default({}),
    tags: (0, pg_core_1.jsonb)().default([]),
    relatedQuestionIds: (0, pg_core_1.jsonb)("related_question_ids").default([]),
});
exports.productLandingClicks = (0, pg_core_1.pgTable)("product_landing_clicks", {
    id: (0, pg_core_1.integer)().default('nextval(product_landing_clicks_id_seq').primaryKey(),
    landingPageId: (0, pg_core_1.varchar)("landing_page_id").notNull(),
    affiliateId: (0, pg_core_1.varchar)("affiliate_id"),
    trackingCookie: (0, pg_core_1.varchar)("tracking_cookie").notNull(),
    ip: (0, pg_core_1.varchar)(),
    userAgent: (0, pg_core_1.text)("user_agent"),
    device: (0, pg_core_1.varchar)(),
    referrer: (0, pg_core_1.text)(),
    converted: (0, pg_core_1.boolean)().default(false).notNull(),
    orderId: (0, pg_core_1.varchar)("order_id"),
    conversionValue: (0, pg_core_1.numeric)("conversion_value", { precision: 15, scale: 2 }),
    clickedAt: (0, pg_core_1.timestamp)("clicked_at", { mode: 'string' }).defaultNow().notNull(),
    convertedAt: (0, pg_core_1.timestamp)("converted_at", { mode: 'string' }),
});
exports.productLandingPages = (0, pg_core_1.pgTable)("product_landing_pages", {
    id: (0, pg_core_1.varchar)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    title: (0, pg_core_1.text)().notNull(),
    slug: (0, pg_core_1.text)().notNull(),
    description: (0, pg_core_1.text)(),
    productId: (0, pg_core_1.varchar)("product_id").notNull(),
    variantId: (0, pg_core_1.varchar)("variant_id"),
    customPrice: (0, pg_core_1.numeric)("custom_price", { precision: 15, scale: 2 }),
    originalPrice: (0, pg_core_1.numeric)("original_price", { precision: 15, scale: 2 }),
    heroTitle: (0, pg_core_1.text)("hero_title"),
    heroSubtitle: (0, pg_core_1.text)("hero_subtitle"),
    heroImage: (0, pg_core_1.text)("hero_image"),
    callToAction: (0, pg_core_1.text)("call_to_action").default('Đặt hàng ngay'),
    features: (0, pg_core_1.jsonb)().default([]).notNull(),
    testimonials: (0, pg_core_1.jsonb)().default([]),
    isActive: (0, pg_core_1.boolean)("is_active").default(true).notNull(),
    theme: (0, pg_core_1.text)().default('light').notNull(),
    primaryColor: (0, pg_core_1.text)("primary_color").default('#007bff').notNull(),
    contactInfo: (0, pg_core_1.jsonb)("contact_info").default((0, drizzle_orm_1.sql) `'{"email": "", "phone": "", "businessName": ""}'::jsonb`).notNull(),
    viewCount: (0, pg_core_1.integer)("view_count").default(0).notNull(),
    orderCount: (0, pg_core_1.integer)("order_count").default(0).notNull(),
    conversionRate: (0, pg_core_1.numeric)("conversion_rate", { precision: 5, scale: 2 }).default(0.00).notNull(),
    paymentMethods: (0, pg_core_1.jsonb)("payment_methods").default((0, drizzle_orm_1.sql) `'{"cod": true, "online": false, "bankTransfer": true}'::jsonb`).notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { mode: 'string' }).defaultNow(),
    themeConfigId: (0, pg_core_1.varchar)("theme_config_id"),
    advancedThemeConfig: (0, pg_core_1.jsonb)("advanced_theme_config"),
    affiliateId: (0, pg_core_1.varchar)("affiliate_id"),
    affiliateCode: (0, pg_core_1.text)("affiliate_code"),
    autoSeedingEnabled: (0, pg_core_1.boolean)("auto_seeding_enabled").default(false).notNull(),
}, (table) => [
    (0, pg_core_1.unique)("product_landing_pages_slug_unique").on(table.slug),
]);
exports.productPolicies = (0, pg_core_1.pgTable)("product_policies", {
    id: (0, pg_core_1.varchar)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    title: (0, pg_core_1.text)().notNull(),
    description: (0, pg_core_1.text)().notNull(),
    icon: (0, pg_core_1.text)(),
    type: (0, pg_core_1.text)().notNull(),
    isActive: (0, pg_core_1.boolean)("is_active").default(true).notNull(),
    sortOrder: (0, pg_core_1.integer)("sort_order").default(0).notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { mode: 'string' }).defaultNow(),
});
exports.productPolicyAssociations = (0, pg_core_1.pgTable)("product_policy_associations", {
    productId: (0, pg_core_1.varchar)("product_id").primaryKey(),
    policyId: (0, pg_core_1.varchar)("policy_id").primaryKey(),
    sortOrder: (0, pg_core_1.integer)("sort_order").default(0).notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow(),
});
exports.productReviews = (0, pg_core_1.pgTable)("product_reviews", {
    id: (0, pg_core_1.varchar)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    productId: (0, pg_core_1.varchar)("product_id").notNull(),
    customerId: (0, pg_core_1.varchar)("customer_id"),
    customerName: (0, pg_core_1.text)("customer_name").notNull(),
    customerAvatar: (0, pg_core_1.text)("customer_avatar"),
    rating: (0, pg_core_1.integer)().notNull(),
    title: (0, pg_core_1.text)(),
    content: (0, pg_core_1.text)().notNull(),
    isVerified: (0, pg_core_1.boolean)("is_verified").default(false).notNull(),
    isApproved: (0, pg_core_1.boolean)("is_approved").default(true).notNull(),
    helpfulCount: (0, pg_core_1.integer)("helpful_count").default(0).notNull(),
    images: (0, pg_core_1.jsonb)().default([]),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { mode: 'string' }).defaultNow(),
});
exports.products = (0, pg_core_1.pgTable)("products", {
    id: (0, pg_core_1.varchar)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    name: (0, pg_core_1.text)().notNull(),
    description: (0, pg_core_1.text)(),
    price: (0, pg_core_1.numeric)({ precision: 15, scale: 2 }).notNull(),
    stock: (0, pg_core_1.integer)().default(0).notNull(),
    categoryId: (0, pg_core_1.varchar)("category_id"),
    status: (0, pg_core_1.text)().default('active').notNull(),
    image: (0, pg_core_1.text)(),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { mode: 'string' }).defaultNow(),
    sku: (0, pg_core_1.text)(),
    images: (0, pg_core_1.jsonb)().default([]),
    videos: (0, pg_core_1.jsonb)().default([]),
    tagIds: (0, pg_core_1.jsonb)("tag_ids").default([]),
    descriptions: (0, pg_core_1.jsonb)().default({}),
    defaultImageIndex: (0, pg_core_1.integer)("default_image_index").default(0),
    itemCode: (0, pg_core_1.text)("item_code"),
    shortDescription: (0, pg_core_1.text)("short_description"),
    slug: (0, pg_core_1.text)(),
    ingredients: (0, pg_core_1.jsonb)().default([]),
    benefits: (0, pg_core_1.jsonb)().default([]),
    seoTitle: (0, pg_core_1.text)("seo_title"),
    seoDescription: (0, pg_core_1.text)("seo_description"),
    productStory: (0, pg_core_1.jsonb)("product_story").default({}),
    usageInstructions: (0, pg_core_1.text)("usage_instructions"),
    specifications: (0, pg_core_1.jsonb)().default({}),
    ogImageUrl: (0, pg_core_1.text)("og_image_url"),
    unitType: (0, pg_core_1.text)("unit_type").default('count'),
    unit: (0, pg_core_1.text)().default('cái'),
    allowDecimals: (0, pg_core_1.boolean)("allow_decimals").default(false),
    minQuantity: (0, pg_core_1.numeric)("min_quantity", { precision: 10, scale: 3 }).default(1.000),
    quantityStep: (0, pg_core_1.numeric)("quantity_step", { precision: 10, scale: 3 }).default(1.000),
    consultationData: (0, pg_core_1.jsonb)("consultation_data").default({}),
    urgencyData: (0, pg_core_1.jsonb)("urgency_data").default((0, drizzle_orm_1.sql) `'{"demand_level": "medium", "sales_velocity": 0, "urgency_messages": [], "is_limited_edition": false, "low_stock_threshold": 10}'::jsonb`),
    socialProofData: (0, pg_core_1.jsonb)("social_proof_data").default((0, drizzle_orm_1.sql) `'{"total_sold": 0, "total_reviews": 0, "average_rating": 0, "media_mentions": [], "celebrity_users": [], "repurchase_rate": 0, "featured_reviews": [], "trending_hashtags": [], "expert_endorsements": [], "awards_certifications": []}'::jsonb`),
    personalizationData: (0, pg_core_1.jsonb)("personalization_data").default((0, drizzle_orm_1.sql) `'{"skin_types": [], "income_bracket": "500k-1m", "lifestyle_tags": [], "profession_fit": [], "problem_solving": [], "usage_scenarios": [], "personality_match": [], "seasonal_relevance": [], "target_demographics": {"primary": {"gender": [], "location": [], "age_range": "", "lifestyle": [], "income_level": "middle"}}}'::jsonb`),
    leadingQuestionsData: (0, pg_core_1.jsonb)("leading_questions_data").default((0, drizzle_orm_1.sql) `'{"emotional_hooks": [], "desire_questions": [], "closing_questions": [], "discovery_prompts": [], "comparison_triggers": [], "pain_point_questions": [], "objection_anticipation": []}'::jsonb`),
    objectionHandlingData: (0, pg_core_1.jsonb)("objection_handling_data").default((0, drizzle_orm_1.sql) `'{"trust_builders": [], "risk_mitigation": [], "safety_assurance": [], "common_objections": [], "price_justification": {"daily_cost": "", "comparison_points": [], "value_proposition": ""}, "quality_proof_points": [], "competitor_advantages": [], "effectiveness_guarantee": {"timeline": "", "success_rate": "", "guarantee_text": ""}}'::jsonb`),
    isbn: (0, pg_core_1.text)(),
    smartFaq: (0, pg_core_1.jsonb)("smart_faq"),
    needsAssessment: (0, pg_core_1.jsonb)("needs_assessment"),
    botPersonality: (0, pg_core_1.jsonb)("bot_personality"),
    consultationScenarios: (0, pg_core_1.jsonb)("consultation_scenarios"),
    competitorComparison: (0, pg_core_1.jsonb)("competitor_comparison"),
    crossSellData: (0, pg_core_1.jsonb)("cross_sell_data"),
    consultationTracking: (0, pg_core_1.jsonb)("consultation_tracking"),
    customDescriptions: (0, pg_core_1.jsonb)("custom_descriptions"),
    originalPrice: (0, pg_core_1.numeric)("original_price", { precision: 10, scale: 2 }),
    fakeSalesCount: (0, pg_core_1.integer)("fake_sales_count").default(0),
    isNew: (0, pg_core_1.boolean)("is_new").default(false),
    isTopseller: (0, pg_core_1.boolean)("is_topseller").default(false),
    isFreeshipping: (0, pg_core_1.boolean)("is_freeshipping").default(false),
    isBestseller: (0, pg_core_1.boolean)("is_bestseller").default(false),
    isVipOnly: (0, pg_core_1.boolean)("is_vip_only").default(false).notNull(),
    requiredVipTier: (0, pg_core_1.text)("required_vip_tier"),
    localPrice: (0, pg_core_1.numeric)("local_price", { precision: 15, scale: 2 }),
    standardPrice: (0, pg_core_1.numeric)("standard_price", { precision: 15, scale: 2 }),
}, (table) => [
    (0, pg_core_1.unique)("products_sku_unique").on(table.sku),
    (0, pg_core_1.unique)("products_slug_key").on(table.slug),
]);
exports.projectTemplates = (0, pg_core_1.pgTable)("project_templates", {
    id: (0, pg_core_1.varchar)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    projectId: (0, pg_core_1.varchar)("project_id").notNull(),
    projectType: (0, pg_core_1.varchar)("project_type").notNull(),
    templateId: (0, pg_core_1.varchar)("template_id").notNull(),
    templateType: (0, pg_core_1.varchar)("template_type").notNull(),
    templateName: (0, pg_core_1.text)("template_name").notNull(),
    appliedCustomizations: (0, pg_core_1.jsonb)("applied_customizations").notNull(),
    appliedAt: (0, pg_core_1.timestamp)("applied_at", { mode: 'string' }).defaultNow(),
    isActive: (0, pg_core_1.boolean)("is_active").default(true).notNull(),
    platform: (0, pg_core_1.varchar)().notNull(),
    loadTime: (0, pg_core_1.integer)("load_time"),
    compilationTime: (0, pg_core_1.integer)("compilation_time"),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { mode: 'string' }).defaultNow(),
});
exports.pushSubscriptions = (0, pg_core_1.pgTable)("push_subscriptions", {
    id: (0, pg_core_1.varchar)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    customerId: (0, pg_core_1.varchar)("customer_id"),
    userId: (0, pg_core_1.varchar)("user_id"),
    endpoint: (0, pg_core_1.text)().notNull(),
    expirationTime: (0, pg_core_1.timestamp)("expiration_time", { mode: 'string' }),
    keys: (0, pg_core_1.jsonb)().notNull(),
    userAgent: (0, pg_core_1.text)("user_agent"),
    deviceType: (0, pg_core_1.text)("device_type").default('unknown'),
    browser: (0, pg_core_1.text)(),
    notificationTypes: (0, pg_core_1.jsonb)("notification_types").default((0, drizzle_orm_1.sql) `'["order_updates", "messages", "promotions"]'::jsonb`),
    isActive: (0, pg_core_1.boolean)("is_active").default(true).notNull(),
    isTestSubscription: (0, pg_core_1.boolean)("is_test_subscription").default(false),
    lastUsedAt: (0, pg_core_1.timestamp)("last_used_at", { mode: 'string' }),
    failureCount: (0, pg_core_1.integer)("failure_count").default(0),
    lastError: (0, pg_core_1.text)("last_error"),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
    (0, pg_core_1.unique)("push_subscriptions_endpoint_key").on(table.endpoint),
]);
exports.queueAutofillSettings = (0, pg_core_1.pgTable)("queue_autofill_settings", {
    id: (0, pg_core_1.varchar)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    enabled: (0, pg_core_1.boolean)().default(false),
    fillStrategy: (0, pg_core_1.text)("fill_strategy").default('priority'),
    defaultTimeSlots: (0, pg_core_1.jsonb)("default_time_slots").default([]),
    minGapHours: (0, pg_core_1.integer)("min_gap_hours").default(2),
    maxPostsPerDay: (0, pg_core_1.integer)("max_posts_per_day").default(5),
    maxPostsPerAccount: (0, pg_core_1.integer)("max_posts_per_account").default(3),
    checkDuplicateWindow: (0, pg_core_1.integer)("check_duplicate_window").default(7),
    similarityThreshold: (0, pg_core_1.numeric)("similarity_threshold", { precision: 3, scale: 2 }).default(0.8),
    forceVariation: (0, pg_core_1.boolean)("force_variation").default(true),
    variationModel: (0, pg_core_1.text)("variation_model").default('gemini-pro'),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { mode: 'string' }).defaultNow(),
});
exports.queueHistory = (0, pg_core_1.pgTable)("queue_history", {
    id: (0, pg_core_1.varchar)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    queueItemId: (0, pg_core_1.varchar)("queue_item_id").notNull(),
    action: (0, pg_core_1.text)().notNull(),
    scheduledPostId: (0, pg_core_1.varchar)("scheduled_post_id"),
    socialAccountId: (0, pg_core_1.varchar)("social_account_id"),
    success: (0, pg_core_1.boolean)(),
    errorMessage: (0, pg_core_1.text)("error_message"),
    metadata: (0, pg_core_1.jsonb)(),
    performedBy: (0, pg_core_1.varchar)("performed_by"),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow(),
});
exports.registrationTokens = (0, pg_core_1.pgTable)("registration_tokens", {
    id: (0, pg_core_1.varchar)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    token: (0, pg_core_1.varchar)().notNull(),
    tier: (0, pg_core_1.text)().default('gold').notNull(),
    maxUses: (0, pg_core_1.integer)("max_uses").default(100),
    usedCount: (0, pg_core_1.integer)("used_count").default(0).notNull(),
    expiresAt: (0, pg_core_1.timestamp)("expires_at", { mode: 'string' }).notNull(),
    createdBy: (0, pg_core_1.varchar)("created_by"),
    notes: (0, pg_core_1.text)(),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
    (0, pg_core_1.unique)("registration_tokens_token_key").on(table.token),
]);
exports.returnRequests = (0, pg_core_1.pgTable)("return_requests", {
    id: (0, pg_core_1.varchar)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    vendorOrderId: (0, pg_core_1.varchar)("vendor_order_id").notNull(),
    vendorId: (0, pg_core_1.varchar)("vendor_id").notNull(),
    orderId: (0, pg_core_1.varchar)("order_id").notNull(),
    reason: (0, pg_core_1.text)().notNull(),
    quantity: (0, pg_core_1.integer)().notNull(),
    refundAmount: (0, pg_core_1.text)("refund_amount").notNull(),
    status: (0, pg_core_1.varchar)().default('pending').notNull(),
    adminNotes: (0, pg_core_1.text)("admin_notes"),
    processedAt: (0, pg_core_1.timestamp)("processed_at", { mode: 'string' }),
    proofImages: (0, pg_core_1.jsonb)("proof_images").default([]),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { mode: 'string' }).defaultNow().notNull(),
});
exports.salesAutomationConfigs = (0, pg_core_1.pgTable)("sales_automation_configs", {
    id: (0, pg_core_1.text)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    sellerId: (0, pg_core_1.text)("seller_id").notNull(),
    isEnabled: (0, pg_core_1.boolean)("is_enabled").default(false),
    isGloballyEnabled: (0, pg_core_1.boolean)("is_globally_enabled").default(true),
    frequency: (0, pg_core_1.text)().default('weekly'),
    scheduleConfig: (0, pg_core_1.jsonb)("schedule_config"),
    targets: (0, pg_core_1.jsonb)(),
    bookPreferences: (0, pg_core_1.jsonb)("book_preferences"),
    customerSimulation: (0, pg_core_1.jsonb)("customer_simulation"),
    performanceParams: (0, pg_core_1.jsonb)("performance_params"),
    advancedSettings: (0, pg_core_1.jsonb)("advanced_settings"),
    lastRunAt: (0, pg_core_1.timestamp)("last_run_at", { mode: 'string' }),
    nextRunAt: (0, pg_core_1.timestamp)("next_run_at", { mode: 'string' }),
    totalAutomatedOrders: (0, pg_core_1.integer)("total_automated_orders").default(0),
    totalAutomatedRevenue: (0, pg_core_1.numeric)("total_automated_revenue", { precision: 15, scale: 2 }).default(0),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { mode: 'string' }).defaultNow(),
});
exports.salesAutomationHistory = (0, pg_core_1.pgTable)("sales_automation_history", {
    id: (0, pg_core_1.text)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    sellerId: (0, pg_core_1.text)("seller_id").notNull(),
    configId: (0, pg_core_1.text)("config_id"),
    executionType: (0, pg_core_1.text)("execution_type"),
    executionStatus: (0, pg_core_1.text)("execution_status"),
    runParameters: (0, pg_core_1.jsonb)("run_parameters"),
    results: (0, pg_core_1.jsonb)(),
    duration: (0, pg_core_1.integer)(),
    errorLog: (0, pg_core_1.jsonb)("error_log"),
    startedAt: (0, pg_core_1.timestamp)("started_at", { mode: 'string' }).defaultNow(),
    completedAt: (0, pg_core_1.timestamp)("completed_at", { mode: 'string' }),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow(),
    vietnameseSimulationData: (0, pg_core_1.jsonb)("vietnamese_simulation_data").default({}),
    performanceMetrics: (0, pg_core_1.jsonb)("performance_metrics").default({}),
});
exports.satisfactionSurveys = (0, pg_core_1.pgTable)("satisfaction_surveys", {
    id: (0, pg_core_1.varchar)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    sellerId: (0, pg_core_1.varchar)("seller_id").notNull(),
    customerId: (0, pg_core_1.varchar)("customer_id"),
    orderId: (0, pg_core_1.varchar)("order_id"),
    surveyType: (0, pg_core_1.varchar)("survey_type", { length: 50 }).default('post_purchase').notNull(),
    overallSatisfaction: (0, pg_core_1.integer)("overall_satisfaction"),
    recommendationLikelihood: (0, pg_core_1.integer)("recommendation_likelihood"),
    easeOfOrdering: (0, pg_core_1.integer)("ease_of_ordering"),
    websiteExperience: (0, pg_core_1.integer)("website_experience"),
    communicationQuality: (0, pg_core_1.integer)("communication_quality"),
    deliverySatisfaction: (0, pg_core_1.integer)("delivery_satisfaction"),
    productQuality: (0, pg_core_1.integer)("product_quality"),
    valueForMoney: (0, pg_core_1.integer)("value_for_money"),
    culturalAppropriateness: (0, pg_core_1.integer)("cultural_appropriateness"),
    openFeedback: (0, pg_core_1.text)("open_feedback"),
    improvementSuggestions: (0, pg_core_1.text)("improvement_suggestions"),
    surveyLanguage: (0, pg_core_1.varchar)("survey_language", { length: 10 }).default('vi'),
    isAutoGenerated: (0, pg_core_1.boolean)("is_auto_generated").default(false),
    completedAt: (0, pg_core_1.timestamp)("completed_at", { mode: 'string' }),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { mode: 'string' }).defaultNow(),
});
exports.scheduledPosts = (0, pg_core_1.pgTable)("scheduled_posts", {
    id: (0, pg_core_1.varchar)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    caption: (0, pg_core_1.text)().notNull(),
    hashtags: (0, pg_core_1.jsonb)().default([]),
    assetIds: (0, pg_core_1.jsonb)("asset_ids").default([]),
    socialAccountId: (0, pg_core_1.varchar)("social_account_id").notNull(),
    platform: (0, pg_core_1.text)().notNull(),
    scheduledTime: (0, pg_core_1.timestamp)("scheduled_time", { mode: 'string' }).notNull(),
    timezone: (0, pg_core_1.varchar)({ length: 50 }).default('Asia/Ho_Chi_Minh'),
    status: (0, pg_core_1.text)().default('draft').notNull(),
    publishedAt: (0, pg_core_1.timestamp)("published_at", { mode: 'string' }),
    platformPostId: (0, pg_core_1.varchar)("platform_post_id", { length: 255 }),
    platformUrl: (0, pg_core_1.text)("platform_url"),
    errorMessage: (0, pg_core_1.text)("error_message"),
    retryCount: (0, pg_core_1.integer)("retry_count").default(0),
    lastRetryAt: (0, pg_core_1.timestamp)("last_retry_at", { mode: 'string' }),
    analytics: (0, pg_core_1.jsonb)(),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { mode: 'string' }).defaultNow(),
    priority: (0, pg_core_1.integer)().default(5).notNull(),
    ipPoolId: (0, pg_core_1.integer)("ip_pool_id"),
    ipSnapshot: (0, pg_core_1.varchar)("ip_snapshot", { length: 100 }),
    batchId: (0, pg_core_1.varchar)("batch_id", { length: 100 }),
});
exports.seasonalRules = (0, pg_core_1.pgTable)("seasonal_rules", {
    id: (0, pg_core_1.varchar)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    ruleName: (0, pg_core_1.text)("rule_name").notNull(),
    ruleType: (0, pg_core_1.text)("rule_type").notNull(),
    seasonType: (0, pg_core_1.text)("season_type").notNull(),
    startDate: (0, pg_core_1.timestamp)("start_date", { mode: 'string' }),
    endDate: (0, pg_core_1.timestamp)("end_date", { mode: 'string' }),
    isRecurring: (0, pg_core_1.boolean)("is_recurring").default(true).notNull(),
    targetCategories: (0, pg_core_1.jsonb)("target_categories").default([]),
    targetSellerTiers: (0, pg_core_1.jsonb)("target_seller_tiers").default((0, drizzle_orm_1.sql) `'["standard", "professional", "top_seller", "premium"]'::jsonb`),
    priceMultiplier: (0, pg_core_1.numeric)("price_multiplier", { precision: 5, scale: 4 }).default(1.0000).notNull(),
    maxPriceIncrease: (0, pg_core_1.numeric)("max_price_increase", { precision: 5, scale: 4 }).default(0.2000).notNull(),
    maxPriceDecrease: (0, pg_core_1.numeric)("max_price_decrease", { precision: 5, scale: 4 }).default(0.3000).notNull(),
    dynamicPricingEnabled: (0, pg_core_1.boolean)("dynamic_pricing_enabled").default(false).notNull(),
    inventoryMultiplier: (0, pg_core_1.numeric)("inventory_multiplier", { precision: 5, scale: 4 }).default(1.0000).notNull(),
    minStockLevel: (0, pg_core_1.integer)("min_stock_level").default(10).notNull(),
    maxStockLevel: (0, pg_core_1.integer)("max_stock_level").default(1000).notNull(),
    restockTrigger: (0, pg_core_1.integer)("restock_trigger").default(20).notNull(),
    promotionIntensity: (0, pg_core_1.text)("promotion_intensity").default('moderate'),
    discountRange: (0, pg_core_1.jsonb)("discount_range").default((0, drizzle_orm_1.sql) `'{"max": 25, "min": 5}'::jsonb`),
    culturalSignificance: (0, pg_core_1.text)("cultural_significance").default('moderate').notNull(),
    giftRelevance: (0, pg_core_1.boolean)("gift_relevance").default(false).notNull(),
    festivalMentions: (0, pg_core_1.jsonb)("festival_mentions").default([]),
    regionalAdjustments: (0, pg_core_1.jsonb)("regional_adjustments").default({}),
    priority: (0, pg_core_1.integer)().default(50).notNull(),
    isActive: (0, pg_core_1.boolean)("is_active").default(true).notNull(),
    autoApply: (0, pg_core_1.boolean)("auto_apply").default(false).notNull(),
    lastApplied: (0, pg_core_1.timestamp)("last_applied", { mode: 'string' }),
    timesApplied: (0, pg_core_1.integer)("times_applied").default(0).notNull(),
    avgImpactScore: (0, pg_core_1.numeric)("avg_impact_score", { precision: 5, scale: 2 }).default(0).notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { mode: 'string' }).defaultNow(),
});
exports.sellerPaymentConfigs = (0, pg_core_1.pgTable)("seller_payment_configs", {
    id: (0, pg_core_1.integer)().default('nextval(seller_payment_configs_id_seq').primaryKey(),
    sellerId: (0, pg_core_1.varchar)("seller_id"),
    commissionRate: (0, pg_core_1.numeric)("commission_rate", { precision: 5, scale: 2 }).default(15.00).notNull(),
    minCommission: (0, pg_core_1.numeric)("min_commission", { precision: 15, scale: 2 }).default(0.00),
    preferredGateway: (0, pg_core_1.text)("preferred_gateway"),
    autoPayoutEnabled: (0, pg_core_1.boolean)("auto_payout_enabled").default(false).notNull(),
    payoutSchedule: (0, pg_core_1.text)("payout_schedule").default('weekly'),
    bankDetails: (0, pg_core_1.jsonb)("bank_details").default({}),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
    (0, pg_core_1.unique)("seller_payment_configs_seller_id_key").on(table.sellerId),
]);
exports.sellerRatings = (0, pg_core_1.pgTable)("seller_ratings", {
    id: (0, pg_core_1.varchar)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    sellerId: (0, pg_core_1.varchar)("seller_id").notNull(),
    overallRating: (0, pg_core_1.numeric)("overall_rating", { precision: 3, scale: 2 }).default(0).notNull(),
    totalReviews: (0, pg_core_1.integer)("total_reviews").default(0).notNull(),
    totalRatings: (0, pg_core_1.integer)("total_ratings").default(0).notNull(),
    deliverySpeedRating: (0, pg_core_1.numeric)("delivery_speed_rating", { precision: 3, scale: 2 }).default(0).notNull(),
    bookConditionRating: (0, pg_core_1.numeric)("book_condition_rating", { precision: 3, scale: 2 }).default(0).notNull(),
    customerServiceRating: (0, pg_core_1.numeric)("customer_service_rating", { precision: 3, scale: 2 }).default(0).notNull(),
    pricingRating: (0, pg_core_1.numeric)("pricing_rating", { precision: 3, scale: 2 }).default(0).notNull(),
    culturalSensitivityRating: (0, pg_core_1.numeric)("cultural_sensitivity_rating", { precision: 3, scale: 2 }).default(0).notNull(),
    responseTimeHours: (0, pg_core_1.numeric)("response_time_hours", { precision: 5, scale: 2 }).default(0).notNull(),
    fulfillmentAccuracyPercent: (0, pg_core_1.numeric)("fulfillment_accuracy_percent", { precision: 5, scale: 2 }).default(0).notNull(),
    lastUpdatedAt: (0, pg_core_1.timestamp)("last_updated_at", { mode: 'string' }).defaultNow(),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { mode: 'string' }).defaultNow(),
});
exports.sessions = (0, pg_core_1.pgTable)("sessions", {
    sid: (0, pg_core_1.varchar)().primaryKey(),
    sess: (0, pg_core_1.jsonb)().notNull(),
    expire: (0, pg_core_1.timestamp)({ mode: 'string' }).notNull(),
});
exports.shareVerifications = (0, pg_core_1.pgTable)("share_verifications", {
    id: (0, pg_core_1.varchar)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    participationId: (0, pg_core_1.varchar)("participation_id").notNull(),
    verifiedAt: (0, pg_core_1.timestamp)("verified_at", { mode: 'string' }).defaultNow().notNull(),
    attemptNumber: (0, pg_core_1.integer)("attempt_number").notNull(),
    postExists: (0, pg_core_1.boolean)("post_exists").notNull(),
    postId: (0, pg_core_1.text)("post_id"),
    postDeleted: (0, pg_core_1.boolean)("post_deleted").default(false).notNull(),
    likes: (0, pg_core_1.integer)().default(0),
    shares: (0, pg_core_1.integer)().default(0),
    comments: (0, pg_core_1.integer)().default(0),
    passed: (0, pg_core_1.boolean)().notNull(),
    failureReason: (0, pg_core_1.text)("failure_reason"),
    rawResponse: (0, pg_core_1.jsonb)("raw_response").default({}),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow().notNull(),
});
exports.shippingZones = (0, pg_core_1.pgTable)("shipping_zones", {
    id: (0, pg_core_1.varchar)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    name: (0, pg_core_1.text)().notNull(),
    description: (0, pg_core_1.text)(),
    minDistanceKm: (0, pg_core_1.numeric)("min_distance_km", { precision: 10, scale: 2 }).default(0).notNull(),
    maxDistanceKm: (0, pg_core_1.numeric)("max_distance_km", { precision: 10, scale: 2 }).notNull(),
    shippingFee: (0, pg_core_1.numeric)("shipping_fee", { precision: 15, scale: 2 }).default(0).notNull(),
    isFreeShipTimeWindow: (0, pg_core_1.boolean)("is_free_ship_time_window").default(false).notNull(),
    freeShipStartHour: (0, pg_core_1.integer)("free_ship_start_hour"),
    freeShipEndHour: (0, pg_core_1.integer)("free_ship_end_hour"),
    freeShipDays: (0, pg_core_1.jsonb)("free_ship_days").default((0, drizzle_orm_1.sql) `'[1, 2, 3, 4, 5, 6, 0]'::jsonb`),
    estimatedDeliveryDays: (0, pg_core_1.text)("estimated_delivery_days"),
    zoneType: (0, pg_core_1.text)("zone_type").default('standard').notNull(),
    isActive: (0, pg_core_1.boolean)("is_active").default(true).notNull(),
    sortOrder: (0, pg_core_1.integer)("sort_order").default(0).notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { mode: 'string' }).defaultNow(),
});
exports.shopSettings = (0, pg_core_1.pgTable)("shop_settings", {
    id: (0, pg_core_1.varchar)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    businessName: (0, pg_core_1.text)("business_name").notNull(),
    phone: (0, pg_core_1.text)().notNull(),
    email: (0, pg_core_1.text)().notNull(),
    address: (0, pg_core_1.text)().notNull(),
    description: (0, pg_core_1.text)(),
    website: (0, pg_core_1.text)(),
    logo: (0, pg_core_1.text)(),
    isDefault: (0, pg_core_1.boolean)("is_default").default(true).notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { mode: 'string' }).defaultNow(),
    tagline: (0, pg_core_1.text)(),
    logoUrl: (0, pg_core_1.text)("logo_url"),
    zaloNumber: (0, pg_core_1.text)("zalo_number"),
    rating: (0, pg_core_1.numeric)({ precision: 2, scale: 1 }),
    totalReviews: (0, pg_core_1.integer)("total_reviews"),
    workingHours: (0, pg_core_1.text)("working_hours"),
    workingDays: (0, pg_core_1.text)("working_days"),
    support247: (0, pg_core_1.boolean)("support_247").default(false),
    footerMenuProducts: (0, pg_core_1.jsonb)("footer_menu_products").default([]),
    footerMenuSupport: (0, pg_core_1.jsonb)("footer_menu_support").default([]),
    footerMenuConnect: (0, pg_core_1.jsonb)("footer_menu_connect").default([]),
    appStoreUrl: (0, pg_core_1.text)("app_store_url"),
    googlePlayUrl: (0, pg_core_1.text)("google_play_url"),
    copyrightMain: (0, pg_core_1.text)("copyright_main"),
    copyrightSub: (0, pg_core_1.text)("copyright_sub"),
    termsUrl: (0, pg_core_1.text)("terms_url"),
    privacyUrl: (0, pg_core_1.text)("privacy_url"),
    sitemapUrl: (0, pg_core_1.text)("sitemap_url"),
    featureBoxes: (0, pg_core_1.jsonb)("feature_boxes").default([]),
    quickLinks: (0, pg_core_1.jsonb)("quick_links").default([]),
    heroSlider: (0, pg_core_1.jsonb)("hero_slider").default([]),
    shopLatitude: (0, pg_core_1.numeric)("shop_latitude", { precision: 10, scale: 8 }),
    shopLongitude: (0, pg_core_1.numeric)("shop_longitude", { precision: 11, scale: 8 }),
    localRadiusKm: (0, pg_core_1.numeric)("local_radius_km", { precision: 6, scale: 2 }).default(20.00),
});
exports.shopeeBusinessAccounts = (0, pg_core_1.pgTable)("shopee_business_accounts", {
    id: (0, pg_core_1.varchar)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    partnerId: (0, pg_core_1.text)("partner_id").notNull(),
    shopId: (0, pg_core_1.text)("shop_id").notNull(),
    displayName: (0, pg_core_1.text)("display_name").notNull(),
    shopName: (0, pg_core_1.text)("shop_name").notNull(),
    shopLogo: (0, pg_core_1.text)("shop_logo"),
    accessToken: (0, pg_core_1.text)("access_token"),
    refreshToken: (0, pg_core_1.text)("refresh_token"),
    tokenExpiresAt: (0, pg_core_1.timestamp)("token_expires_at", { mode: 'string' }),
    partnerKey: (0, pg_core_1.text)("partner_key"),
    shopType: (0, pg_core_1.text)("shop_type"),
    shopStatus: (0, pg_core_1.text)("shop_status").default('normal'),
    region: (0, pg_core_1.text)().default('VN').notNull(),
    currency: (0, pg_core_1.text)().default('VND').notNull(),
    businessType: (0, pg_core_1.text)("business_type"),
    businessLicense: (0, pg_core_1.text)("business_license"),
    taxId: (0, pg_core_1.text)("tax_id"),
    contactEmail: (0, pg_core_1.text)("contact_email"),
    contactPhone: (0, pg_core_1.text)("contact_phone"),
    rating: (0, pg_core_1.numeric)({ precision: 3, scale: 2 }).default(0.00),
    responseRate: (0, pg_core_1.numeric)("response_rate", { precision: 5, scale: 2 }).default(0.00),
    responseTime: (0, pg_core_1.integer)("response_time").default(0),
    followerCount: (0, pg_core_1.integer)("follower_count").default(0),
    productCount: (0, pg_core_1.integer)("product_count").default(0),
    totalOrders: (0, pg_core_1.integer)("total_orders").default(0),
    totalRevenue: (0, pg_core_1.numeric)("total_revenue", { precision: 15, scale: 2 }).default(0),
    avgOrderValue: (0, pg_core_1.numeric)("avg_order_value", { precision: 15, scale: 2 }).default(0),
    lastOrderAt: (0, pg_core_1.timestamp)("last_order_at", { mode: 'string' }),
    lastSync: (0, pg_core_1.timestamp)("last_sync", { mode: 'string' }),
    tagIds: (0, pg_core_1.jsonb)("tag_ids").default([]),
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
    connected: (0, pg_core_1.boolean)().default(false),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
    (0, pg_core_1.unique)("shopee_business_accounts_shop_id_key").on(table.shopId),
]);
exports.shopeeShopOrders = (0, pg_core_1.pgTable)("shopee_shop_orders", {
    id: (0, pg_core_1.varchar)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    shopeeOrderId: (0, pg_core_1.text)("shopee_order_id").notNull(),
    orderSn: (0, pg_core_1.text)("order_sn").notNull(),
    shopId: (0, pg_core_1.text)("shop_id").notNull(),
    businessAccountId: (0, pg_core_1.varchar)("business_account_id"),
    orderNumber: (0, pg_core_1.text)("order_number").notNull(),
    orderStatus: (0, pg_core_1.text)("order_status").default('unpaid').notNull(),
    customerInfo: (0, pg_core_1.jsonb)("customer_info").notNull(),
    totalAmount: (0, pg_core_1.numeric)("total_amount", { precision: 15, scale: 2 }).notNull(),
    currency: (0, pg_core_1.text)().default('VND').notNull(),
    actualShippingFee: (0, pg_core_1.numeric)("actual_shipping_fee", { precision: 15, scale: 2 }).default(0),
    goodsToReceive: (0, pg_core_1.numeric)("goods_to_receive", { precision: 15, scale: 2 }).default(0),
    coinOffset: (0, pg_core_1.numeric)("coin_offset", { precision: 15, scale: 2 }).default(0),
    escrowAmount: (0, pg_core_1.numeric)("escrow_amount", { precision: 15, scale: 2 }).default(0),
    items: (0, pg_core_1.jsonb)().notNull(),
    shippingCarrier: (0, pg_core_1.text)("shipping_carrier"),
    trackingNumber: (0, pg_core_1.text)("tracking_number"),
    shipTime: (0, pg_core_1.timestamp)("ship_time", { mode: 'string' }),
    deliveryTime: (0, pg_core_1.timestamp)("delivery_time", { mode: 'string' }),
    actualShippingFeeConfirmed: (0, pg_core_1.boolean)("actual_shipping_fee_confirmed").default(false),
    paymentMethod: (0, pg_core_1.text)("payment_method"),
    creditCardNumber: (0, pg_core_1.text)("credit_card_number"),
    dropshipper: (0, pg_core_1.text)(),
    dropshipperPhone: (0, pg_core_1.text)("dropshipper_phone"),
    splitUp: (0, pg_core_1.boolean)("split_up").default(false),
    buyerCancelReason: (0, pg_core_1.text)("buyer_cancel_reason"),
    cancelBy: (0, pg_core_1.text)("cancel_by"),
    cancelReason: (0, pg_core_1.text)("cancel_reason"),
    actualShippingProvider: (0, pg_core_1.text)("actual_shipping_provider"),
    packageNumber: (0, pg_core_1.text)("package_number"),
    shopeeFee: (0, pg_core_1.numeric)("shopee_fee", { precision: 15, scale: 2 }).default(0),
    transactionFee: (0, pg_core_1.numeric)("transaction_fee", { precision: 15, scale: 2 }).default(0),
    commissionFee: (0, pg_core_1.numeric)("commission_fee", { precision: 15, scale: 2 }).default(0),
    serviceFee: (0, pg_core_1.numeric)("service_fee", { precision: 15, scale: 2 }).default(0),
    tagIds: (0, pg_core_1.jsonb)("tag_ids").default([]),
    notes: (0, pg_core_1.text)(),
    createTime: (0, pg_core_1.timestamp)("create_time", { mode: 'string' }).notNull(),
    updateTime: (0, pg_core_1.timestamp)("update_time", { mode: 'string' }),
    payTime: (0, pg_core_1.timestamp)("pay_time", { mode: 'string' }),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
    (0, pg_core_1.unique)("shopee_shop_orders_shopee_order_id_key").on(table.shopeeOrderId),
]);
exports.shopeeShopProducts = (0, pg_core_1.pgTable)("shopee_shop_products", {
    id: (0, pg_core_1.varchar)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    productId: (0, pg_core_1.varchar)("product_id"),
    shopeeItemId: (0, pg_core_1.text)("shopee_item_id").notNull(),
    shopId: (0, pg_core_1.text)("shop_id").notNull(),
    businessAccountId: (0, pg_core_1.varchar)("business_account_id"),
    syncEnabled: (0, pg_core_1.boolean)("sync_enabled").default(true),
    autoSync: (0, pg_core_1.boolean)("auto_sync").default(false),
    syncDirection: (0, pg_core_1.text)("sync_direction").default('to_shopee'),
    itemName: (0, pg_core_1.text)("item_name"),
    itemSku: (0, pg_core_1.text)("item_sku"),
    description: (0, pg_core_1.text)(),
    originalPrice: (0, pg_core_1.numeric)("original_price", { precision: 15, scale: 2 }),
    currentPrice: (0, pg_core_1.numeric)("current_price", { precision: 15, scale: 2 }),
    stock: (0, pg_core_1.integer)(),
    itemStatus: (0, pg_core_1.text)("item_status").default('normal'),
    categoryId: (0, pg_core_1.integer)("category_id"),
    categoryName: (0, pg_core_1.text)("category_name"),
    weight: (0, pg_core_1.numeric)({ precision: 8, scale: 3 }),
    dimension: (0, pg_core_1.jsonb)(),
    condition: (0, pg_core_1.text)().default('new'),
    wholesaleEnabled: (0, pg_core_1.boolean)("wholesale_enabled").default(false),
    sales: (0, pg_core_1.integer)().default(0),
    views: (0, pg_core_1.integer)().default(0),
    likes: (0, pg_core_1.integer)().default(0),
    rating: (0, pg_core_1.numeric)({ precision: 3, scale: 2 }).default(0.00),
    ratingCount: (0, pg_core_1.integer)("rating_count").default(0),
    logisticEnabled: (0, pg_core_1.boolean)("logistic_enabled").default(true),
    daysToShip: (0, pg_core_1.integer)("days_to_ship").default(3),
    lastSyncAt: (0, pg_core_1.timestamp)("last_sync_at", { mode: 'string' }),
    syncStatus: (0, pg_core_1.text)("sync_status").default('pending'),
    syncError: (0, pg_core_1.text)("sync_error"),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
    (0, pg_core_1.unique)("shopee_shop_products_shopee_item_id_shop_id_key").on(table.shopeeItemId, table.shopId),
]);
exports.socialAccounts = (0, pg_core_1.pgTable)("social_accounts", {
    id: (0, pg_core_1.varchar)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    platform: (0, pg_core_1.text)().notNull(),
    name: (0, pg_core_1.text)().notNull(),
    accountId: (0, pg_core_1.text)("account_id").notNull(),
    accessToken: (0, pg_core_1.text)("access_token"),
    followers: (0, pg_core_1.integer)().default(0),
    connected: (0, pg_core_1.boolean)().default(false),
    lastPost: (0, pg_core_1.timestamp)("last_post", { mode: 'string' }),
    engagement: (0, pg_core_1.numeric)({ precision: 5, scale: 2 }).default(0),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow(),
    refreshToken: (0, pg_core_1.text)("refresh_token"),
    tokenExpiresAt: (0, pg_core_1.timestamp)("token_expires_at", { mode: 'string' }),
    pageAccessTokens: (0, pg_core_1.jsonb)("page_access_tokens").default([]),
    webhookSubscriptions: (0, pg_core_1.jsonb)("webhook_subscriptions").default([]),
    lastSync: (0, pg_core_1.timestamp)("last_sync", { mode: 'string' }),
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { mode: 'string' }).defaultNow(),
    tagIds: (0, pg_core_1.jsonb)("tag_ids").default([]),
    contentPreferences: (0, pg_core_1.jsonb)("content_preferences").default((0, drizzle_orm_1.sql) `'{"brandVoice": "friendly", "mediaRatio": {"image": 70, "video": 25, "textOnly": 5}, "excludedTags": [], "hashtagCount": 5, "postingTimes": ["09:00", "14:00", "21:00"], "contentLength": "medium", "preferredTags": [], "topicCategories": []}'::jsonb`),
    schedulingRules: (0, pg_core_1.jsonb)("scheduling_rules").default((0, drizzle_orm_1.sql) `'{"enabled": true, "timeSpacing": 60, "maxPostsPerDay": 8, "distributionMode": "weighted", "respectPeakHours": true, "conflictResolution": "ask"}'::jsonb`),
    performanceScore: (0, pg_core_1.numeric)("performance_score", { precision: 5, scale: 2 }).default(0),
    lastOptimization: (0, pg_core_1.timestamp)("last_optimization", { mode: 'string' }),
    botConfig: (0, pg_core_1.jsonb)("bot_config").default({}),
    facebookAppId: (0, pg_core_1.varchar)("facebook_app_id"),
});
exports.stockReservations = (0, pg_core_1.pgTable)("stock_reservations", {
    id: (0, pg_core_1.varchar)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    productId: (0, pg_core_1.varchar)("product_id").notNull(),
    affiliateId: (0, pg_core_1.varchar)("affiliate_id").notNull(),
    orderId: (0, pg_core_1.varchar)("order_id"),
    quantity: (0, pg_core_1.integer)().notNull(),
    reservationType: (0, pg_core_1.text)("reservation_type").default('cart').notNull(),
    reservedAt: (0, pg_core_1.timestamp)("reserved_at", { mode: 'string' }).defaultNow().notNull(),
    expiresAt: (0, pg_core_1.timestamp)("expires_at", { mode: 'string' }).notNull(),
    releasedAt: (0, pg_core_1.timestamp)("released_at", { mode: 'string' }),
    status: (0, pg_core_1.text)().default('active').notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { mode: 'string' }).defaultNow(),
});
exports.storefrontConfig = (0, pg_core_1.pgTable)("storefront_config", {
    id: (0, pg_core_1.varchar)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    name: (0, pg_core_1.text)().notNull(),
    topProductsCount: (0, pg_core_1.integer)("top_products_count").default(10).notNull(),
    displayMode: (0, pg_core_1.text)("display_mode").default('auto').notNull(),
    selectedProductIds: (0, pg_core_1.jsonb)("selected_product_ids"),
    isActive: (0, pg_core_1.boolean)("is_active").default(true).notNull(),
    theme: (0, pg_core_1.text)().default('organic').notNull(),
    primaryColor: (0, pg_core_1.text)("primary_color").default('#4ade80').notNull(),
    contactInfo: (0, pg_core_1.jsonb)("contact_info").notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
    (0, pg_core_1.unique)("storefront_config_name_unique").on(table.name),
]);
exports.storefrontOrders = (0, pg_core_1.pgTable)("storefront_orders", {
    id: (0, pg_core_1.varchar)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    storefrontConfigId: (0, pg_core_1.varchar)("storefront_config_id").notNull(),
    customerName: (0, pg_core_1.text)("customer_name").notNull(),
    customerPhone: (0, pg_core_1.text)("customer_phone").notNull(),
    customerEmail: (0, pg_core_1.text)("customer_email"),
    customerAddress: (0, pg_core_1.text)("customer_address"),
    productId: (0, pg_core_1.varchar)("product_id").notNull(),
    productName: (0, pg_core_1.text)("product_name").notNull(),
    quantity: (0, pg_core_1.integer)().default(1).notNull(),
    price: (0, pg_core_1.numeric)({ precision: 15, scale: 2 }).notNull(),
    total: (0, pg_core_1.numeric)({ precision: 15, scale: 2 }).notNull(),
    deliveryType: (0, pg_core_1.text)("delivery_type").default('local_delivery').notNull(),
    status: (0, pg_core_1.text)().default('pending').notNull(),
    notes: (0, pg_core_1.text)(),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { mode: 'string' }).defaultNow(),
    affiliateCode: (0, pg_core_1.text)("affiliate_code"),
});
exports.templateCompilations = (0, pg_core_1.pgTable)("template_compilations", {
    id: (0, pg_core_1.varchar)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    templateId: (0, pg_core_1.varchar)("template_id").notNull(),
    templateType: (0, pg_core_1.varchar)("template_type").notNull(),
    framework: (0, pg_core_1.varchar)().default('react').notNull(),
    customizationHash: (0, pg_core_1.varchar)("customization_hash").notNull(),
    compiledCode: (0, pg_core_1.text)("compiled_code").notNull(),
    dependencies: (0, pg_core_1.jsonb)().default([]),
    devDependencies: (0, pg_core_1.jsonb)("dev_dependencies").default([]),
    appliedTheme: (0, pg_core_1.jsonb)("applied_theme"),
    version: (0, pg_core_1.varchar)().default(1.0).notNull(),
    isValid: (0, pg_core_1.boolean)("is_valid").default(true).notNull(),
    expiresAt: (0, pg_core_1.timestamp)("expires_at", { mode: 'string' }),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
    (0, pg_core_1.unique)("template_compilations_template_id_template_type_customizati_key").on(table.templateId, table.templateType, table.customizationHash, table.framework),
]);
exports.themeConfigurations = (0, pg_core_1.pgTable)("theme_configurations", {
    id: (0, pg_core_1.varchar)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    name: (0, pg_core_1.text)().notNull(),
    description: (0, pg_core_1.text)(),
    colorPalette: (0, pg_core_1.jsonb)("color_palette").default({}).notNull(),
    typography: (0, pg_core_1.jsonb)().default({}).notNull(),
    spacing: (0, pg_core_1.jsonb)().default({}).notNull(),
    componentStyles: (0, pg_core_1.jsonb)("component_styles").default({}).notNull(),
    brandGuidelines: (0, pg_core_1.jsonb)("brand_guidelines").default({}).notNull(),
    accessibility: (0, pg_core_1.jsonb)().default({}).notNull(),
    psychology: (0, pg_core_1.jsonb)().default({}).notNull(),
    isTemplate: (0, pg_core_1.boolean)("is_template").default(false).notNull(),
    industry: (0, pg_core_1.text)(),
    conversionRate: (0, pg_core_1.numeric)("conversion_rate", { precision: 5, scale: 2 }),
    createdBy: (0, pg_core_1.varchar)("created_by"),
    isPublic: (0, pg_core_1.boolean)("is_public").default(false).notNull(),
    usageCount: (0, pg_core_1.integer)("usage_count").default(0).notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { mode: 'string' }).defaultNow(),
});
exports.tiktokBusinessAccounts = (0, pg_core_1.pgTable)("tiktok_business_accounts", {
    id: (0, pg_core_1.varchar)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    businessId: (0, pg_core_1.text)("business_id").notNull(),
    displayName: (0, pg_core_1.text)("display_name").notNull(),
    username: (0, pg_core_1.text)().notNull(),
    avatarUrl: (0, pg_core_1.text)("avatar_url"),
    accessToken: (0, pg_core_1.text)("access_token"),
    refreshToken: (0, pg_core_1.text)("refresh_token"),
    tokenExpiresAt: (0, pg_core_1.timestamp)("token_expires_at", { mode: 'string' }),
    scope: (0, pg_core_1.jsonb)().default([]),
    businessType: (0, pg_core_1.text)("business_type"),
    industry: (0, pg_core_1.text)(),
    website: (0, pg_core_1.text)(),
    description: (0, pg_core_1.text)(),
    shopEnabled: (0, pg_core_1.boolean)("shop_enabled").default(false),
    shopId: (0, pg_core_1.text)("shop_id"),
    shopStatus: (0, pg_core_1.text)("shop_status").default('not_connected'),
    followerCount: (0, pg_core_1.integer)("follower_count").default(0),
    followingCount: (0, pg_core_1.integer)("following_count").default(0),
    videoCount: (0, pg_core_1.integer)("video_count").default(0),
    likeCount: (0, pg_core_1.integer)("like_count").default(0),
    engagement: (0, pg_core_1.numeric)({ precision: 5, scale: 2 }).default(0),
    avgViews: (0, pg_core_1.integer)("avg_views").default(0),
    lastPost: (0, pg_core_1.timestamp)("last_post", { mode: 'string' }),
    lastSync: (0, pg_core_1.timestamp)("last_sync", { mode: 'string' }),
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
    connected: (0, pg_core_1.boolean)().default(false),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { mode: 'string' }).defaultNow(),
    tagIds: (0, pg_core_1.jsonb)("tag_ids").default([]),
}, (table) => [
    (0, pg_core_1.unique)("tiktok_business_accounts_business_id_unique").on(table.businessId),
]);
exports.tiktokShopOrders = (0, pg_core_1.pgTable)("tiktok_shop_orders", {
    id: (0, pg_core_1.varchar)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    tiktokOrderId: (0, pg_core_1.text)("tiktok_order_id").notNull(),
    shopId: (0, pg_core_1.text)("shop_id").notNull(),
    businessAccountId: (0, pg_core_1.varchar)("business_account_id"),
    orderNumber: (0, pg_core_1.text)("order_number").notNull(),
    status: (0, pg_core_1.text)().default('pending').notNull(),
    customerInfo: (0, pg_core_1.jsonb)("customer_info").notNull(),
    totalAmount: (0, pg_core_1.numeric)("total_amount", { precision: 15, scale: 2 }).notNull(),
    currency: (0, pg_core_1.text)().default('VND').notNull(),
    taxAmount: (0, pg_core_1.numeric)("tax_amount", { precision: 15, scale: 2 }).default(0),
    shippingAmount: (0, pg_core_1.numeric)("shipping_amount", { precision: 15, scale: 2 }).default(0),
    discountAmount: (0, pg_core_1.numeric)("discount_amount", { precision: 15, scale: 2 }).default(0),
    items: (0, pg_core_1.jsonb)().notNull(),
    fulfillmentStatus: (0, pg_core_1.text)("fulfillment_status").default('pending'),
    trackingNumber: (0, pg_core_1.text)("tracking_number"),
    shippingCarrier: (0, pg_core_1.text)("shipping_carrier"),
    shippedAt: (0, pg_core_1.timestamp)("shipped_at", { mode: 'string' }),
    deliveredAt: (0, pg_core_1.timestamp)("delivered_at", { mode: 'string' }),
    paymentMethod: (0, pg_core_1.text)("payment_method"),
    paymentStatus: (0, pg_core_1.text)("payment_status"),
    tiktokFees: (0, pg_core_1.numeric)("tiktok_fees", { precision: 15, scale: 2 }).default(0),
    notes: (0, pg_core_1.text)(),
    orderDate: (0, pg_core_1.timestamp)("order_date", { mode: 'string' }).notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { mode: 'string' }).defaultNow(),
    tagIds: (0, pg_core_1.jsonb)("tag_ids").default([]),
}, (table) => [
    (0, pg_core_1.unique)("tiktok_shop_orders_tiktok_order_id_unique").on(table.tiktokOrderId),
]);
exports.tiktokShopProducts = (0, pg_core_1.pgTable)("tiktok_shop_products", {
    id: (0, pg_core_1.varchar)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    productId: (0, pg_core_1.varchar)("product_id"),
    tiktokProductId: (0, pg_core_1.text)("tiktok_product_id").notNull(),
    shopId: (0, pg_core_1.text)("shop_id").notNull(),
    businessAccountId: (0, pg_core_1.varchar)("business_account_id"),
    syncEnabled: (0, pg_core_1.boolean)("sync_enabled").default(true),
    autoSync: (0, pg_core_1.boolean)("auto_sync").default(false),
    syncDirection: (0, pg_core_1.text)("sync_direction").default('to_tiktok'),
    tiktokSku: (0, pg_core_1.text)("tiktok_sku"),
    tiktokTitle: (0, pg_core_1.text)("tiktok_title"),
    tiktokDescription: (0, pg_core_1.text)("tiktok_description"),
    tiktokPrice: (0, pg_core_1.numeric)("tiktok_price", { precision: 15, scale: 2 }),
    tiktokStock: (0, pg_core_1.integer)("tiktok_stock"),
    tiktokStatus: (0, pg_core_1.text)("tiktok_status").default('pending_review'),
    views: (0, pg_core_1.integer)().default(0),
    orders: (0, pg_core_1.integer)().default(0),
    revenue: (0, pg_core_1.numeric)({ precision: 15, scale: 2 }).default(0),
    conversionRate: (0, pg_core_1.numeric)("conversion_rate", { precision: 5, scale: 2 }).default(0),
    lastSyncAt: (0, pg_core_1.timestamp)("last_sync_at", { mode: 'string' }),
    syncStatus: (0, pg_core_1.text)("sync_status").default('pending'),
    syncError: (0, pg_core_1.text)("sync_error"),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { mode: 'string' }).defaultNow(),
    tagIds: (0, pg_core_1.jsonb)("tag_ids").default([]),
});
exports.tiktokVideos = (0, pg_core_1.pgTable)("tiktok_videos", {
    id: (0, pg_core_1.varchar)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    videoId: (0, pg_core_1.text)("video_id").notNull(),
    businessAccountId: (0, pg_core_1.varchar)("business_account_id").notNull(),
    caption: (0, pg_core_1.text)(),
    description: (0, pg_core_1.text)(),
    thumbnailUrl: (0, pg_core_1.text)("thumbnail_url"),
    videoUrl: (0, pg_core_1.text)("video_url"),
    duration: (0, pg_core_1.integer)(),
    views: (0, pg_core_1.integer)().default(0),
    likes: (0, pg_core_1.integer)().default(0),
    comments: (0, pg_core_1.integer)().default(0),
    shares: (0, pg_core_1.integer)().default(0),
    engagementRate: (0, pg_core_1.numeric)("engagement_rate", { precision: 5, scale: 2 }).default(0),
    shopProductsTagged: (0, pg_core_1.jsonb)("shop_products_tagged").default([]),
    salesFromVideo: (0, pg_core_1.numeric)("sales_from_video", { precision: 15, scale: 2 }).default(0),
    clickthroughRate: (0, pg_core_1.numeric)("clickthrough_rate", { precision: 5, scale: 2 }).default(0),
    status: (0, pg_core_1.text)().default('published'),
    publishedAt: (0, pg_core_1.timestamp)("published_at", { mode: 'string' }),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { mode: 'string' }).defaultNow(),
    tagIds: (0, pg_core_1.jsonb)("tag_ids").default([]),
}, (table) => [
    (0, pg_core_1.unique)("tiktok_videos_video_id_unique").on(table.videoId),
]);
exports.trips = (0, pg_core_1.pgTable)("trips", {
    id: (0, pg_core_1.varchar)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    driverId: (0, pg_core_1.varchar)("driver_id").notNull(),
    vehicleId: (0, pg_core_1.varchar)("vehicle_id").notNull(),
    routeName: (0, pg_core_1.text)("route_name").notNull(),
    departureLocation: (0, pg_core_1.text)("departure_location").notNull(),
    arrivalLocation: (0, pg_core_1.text)("arrival_location").notNull(),
    stops: (0, pg_core_1.jsonb)().default([]),
    distance: (0, pg_core_1.numeric)({ precision: 10, scale: 2 }),
    departureTime: (0, pg_core_1.timestamp)("departure_time", { mode: 'string' }).notNull(),
    arrivalTime: (0, pg_core_1.timestamp)("arrival_time", { mode: 'string' }).notNull(),
    actualArrivalTime: (0, pg_core_1.timestamp)("actual_arrival_time", { mode: 'string' }),
    ticketPrice: (0, pg_core_1.numeric)("ticket_price", { precision: 15, scale: 2 }).notNull(),
    currency: (0, pg_core_1.text)().default('VND').notNull(),
    totalSeats: (0, pg_core_1.integer)("total_seats").notNull(),
    bookedSeats: (0, pg_core_1.integer)("booked_seats").default(0).notNull(),
    availableSeats: (0, pg_core_1.integer)("available_seats").notNull(),
    passengerList: (0, pg_core_1.jsonb)("passenger_list").default([]),
    status: (0, pg_core_1.text)().default('scheduled').notNull(),
    totalRevenue: (0, pg_core_1.numeric)("total_revenue", { precision: 15, scale: 2 }).default(0),
    expenses: (0, pg_core_1.numeric)({ precision: 15, scale: 2 }).default(0),
    netProfit: (0, pg_core_1.numeric)("net_profit", { precision: 15, scale: 2 }).default(0),
    notes: (0, pg_core_1.text)(),
    cancellationReason: (0, pg_core_1.text)("cancellation_reason"),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { mode: 'string' }).defaultNow(),
    completedAt: (0, pg_core_1.timestamp)("completed_at", { mode: 'string' }),
});
exports.unifiedTags = (0, pg_core_1.pgTable)("unified_tags", {
    id: (0, pg_core_1.varchar)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    name: (0, pg_core_1.text)().notNull(),
    slug: (0, pg_core_1.varchar)({ length: 100 }).notNull(),
    category: (0, pg_core_1.text)().default('general').notNull(),
    platforms: (0, pg_core_1.jsonb)().default((0, drizzle_orm_1.sql) `'["facebook", "tiktok", "instagram"]'::jsonb`),
    color: (0, pg_core_1.varchar)({ length: 7 }).default('#3B82F6').notNull(),
    icon: (0, pg_core_1.varchar)({ length: 50 }),
    description: (0, pg_core_1.text)(),
    keywords: (0, pg_core_1.jsonb)().default([]),
    usageCount: (0, pg_core_1.integer)("usage_count").default(0),
    lastUsed: (0, pg_core_1.timestamp)("last_used", { mode: 'string' }),
    isSystemDefault: (0, pg_core_1.boolean)("is_system_default").default(false),
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
    sortOrder: (0, pg_core_1.integer)("sort_order").default(0),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
    (0, pg_core_1.unique)("unified_tags_slug_unique").on(table.slug),
]);
exports.userSatisfactionScores = (0, pg_core_1.pgTable)("user_satisfaction_scores", {
    id: (0, pg_core_1.varchar)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    sessionId: (0, pg_core_1.varchar)("session_id").notNull(),
    userId: (0, pg_core_1.varchar)("user_id"),
    rating: (0, pg_core_1.integer)().notNull(),
    feedbackText: (0, pg_core_1.text)("feedback_text"),
    feedbackCategory: (0, pg_core_1.text)("feedback_category"),
    resolutionAchieved: (0, pg_core_1.boolean)("resolution_achieved").default(false),
    responseQuality: (0, pg_core_1.integer)("response_quality"),
    speedSatisfaction: (0, pg_core_1.integer)("speed_satisfaction"),
    overallExperience: (0, pg_core_1.text)("overall_experience"),
    wouldRecommend: (0, pg_core_1.boolean)("would_recommend"),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow(),
});
exports.userSessions = (0, pg_core_1.pgTable)("user_sessions", {
    sid: (0, pg_core_1.varchar)().primaryKey(),
    sess: (0, pg_core_1.text)().notNull(),
    expire: (0, pg_core_1.timestamp)({ mode: 'string' }).notNull(),
});
exports.userTemplates = (0, pg_core_1.pgTable)("user_templates", {
    id: (0, pg_core_1.varchar)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    userId: (0, pg_core_1.varchar)("user_id"),
    name: (0, pg_core_1.text)().notNull(),
    description: (0, pg_core_1.text)(),
    baseTemplateId: (0, pg_core_1.varchar)("base_template_id").notNull(),
    customizations: (0, pg_core_1.jsonb)().notNull(),
    platforms: (0, pg_core_1.jsonb)().default((0, drizzle_orm_1.sql) `'["all"]'::jsonb`).notNull(),
    category: (0, pg_core_1.varchar)().default('custom').notNull(),
    isPublic: (0, pg_core_1.boolean)("is_public").default(false).notNull(),
    isActive: (0, pg_core_1.boolean)("is_active").default(true).notNull(),
    tags: (0, pg_core_1.jsonb)().default([]),
    usageCount: (0, pg_core_1.integer)("usage_count").default(0).notNull(),
    rating: (0, pg_core_1.numeric)({ precision: 3, scale: 2 }).default(0.00),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { mode: 'string' }).defaultNow(),
});
exports.users = (0, pg_core_1.pgTable)("users", {
    id: (0, pg_core_1.varchar)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    username: (0, pg_core_1.text)().notNull(),
    password: (0, pg_core_1.text)().notNull(),
}, (table) => [
    (0, pg_core_1.unique)("users_username_unique").on(table.username),
]);
exports.vehicleGroupAssignments = (0, pg_core_1.pgTable)("vehicle_group_assignments", {
    id: (0, pg_core_1.varchar)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    vehicleId: (0, pg_core_1.varchar)("vehicle_id").notNull(),
    groupId: (0, pg_core_1.varchar)("group_id").notNull(),
    assignedAt: (0, pg_core_1.timestamp)("assigned_at", { mode: 'string' }).defaultNow(),
    assignedBy: (0, pg_core_1.varchar)("assigned_by"),
    notes: (0, pg_core_1.text)(),
}, (table) => [
    (0, pg_core_1.unique)("vehicle_group_assignments_vehicle_id_group_id_key").on(table.vehicleId, table.groupId),
]);
exports.vehicles = (0, pg_core_1.pgTable)("vehicles", {
    id: (0, pg_core_1.varchar)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    driverId: (0, pg_core_1.varchar)("driver_id").notNull(),
    licensePlate: (0, pg_core_1.text)("license_plate").notNull(),
    vehicleType: (0, pg_core_1.text)("vehicle_type").notNull(),
    brand: (0, pg_core_1.text)(),
    model: (0, pg_core_1.text)(),
    color: (0, pg_core_1.text)(),
    year: (0, pg_core_1.integer)(),
    seatingCapacity: (0, pg_core_1.integer)("seating_capacity"),
    cargoCapacity: (0, pg_core_1.numeric)("cargo_capacity", { precision: 10, scale: 2 }),
    registrationNumber: (0, pg_core_1.text)("registration_number"),
    registrationExpiry: (0, pg_core_1.timestamp)("registration_expiry", { mode: 'string' }),
    insuranceNumber: (0, pg_core_1.text)("insurance_number"),
    insuranceExpiry: (0, pg_core_1.timestamp)("insurance_expiry", { mode: 'string' }),
    status: (0, pg_core_1.text)().default('active').notNull(),
    isVerified: (0, pg_core_1.boolean)("is_verified").default(false).notNull(),
    images: (0, pg_core_1.jsonb)().default([]),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { mode: 'string' }).defaultNow(),
    verifiedAt: (0, pg_core_1.timestamp)("verified_at", { mode: 'string' }),
    verifiedBy: (0, pg_core_1.varchar)("verified_by"),
}, (table) => [
    (0, pg_core_1.unique)("vehicles_license_plate_key").on(table.licensePlate),
]);
exports.vendorOrders = (0, pg_core_1.pgTable)("vendor_orders", {
    id: (0, pg_core_1.varchar)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    vendorId: (0, pg_core_1.varchar)("vendor_id").notNull(),
    orderId: (0, pg_core_1.varchar)("order_id").notNull(),
    maskedCustomerName: (0, pg_core_1.varchar)("masked_customer_name"),
    maskedCustomerPhone: (0, pg_core_1.varchar)("masked_customer_phone"),
    maskedCustomerAddress: (0, pg_core_1.text)("masked_customer_address"),
    shippingProvider: (0, pg_core_1.varchar)("shipping_provider"),
    shippingCode: (0, pg_core_1.varchar)("shipping_code"),
    shippingLabelUrl: (0, pg_core_1.text)("shipping_label_url"),
    codAmount: (0, pg_core_1.numeric)("cod_amount", { precision: 15, scale: 2 }),
    vendorCost: (0, pg_core_1.numeric)("vendor_cost", { precision: 15, scale: 2 }),
    commissionAmount: (0, pg_core_1.numeric)("commission_amount", { precision: 15, scale: 2 }),
    depositDeducted: (0, pg_core_1.boolean)("deposit_deducted").default(false),
    status: (0, pg_core_1.varchar)().default('pending'),
    processingAt: (0, pg_core_1.timestamp)("processing_at", { mode: 'string' }),
    shippedAt: (0, pg_core_1.timestamp)("shipped_at", { mode: 'string' }),
    deliveredAt: (0, pg_core_1.timestamp)("delivered_at", { mode: 'string' }),
    cancelledAt: (0, pg_core_1.timestamp)("cancelled_at", { mode: 'string' }),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { mode: 'string' }).defaultNow().notNull(),
});
exports.vendorProducts = (0, pg_core_1.pgTable)("vendor_products", {
    id: (0, pg_core_1.varchar)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    vendorId: (0, pg_core_1.varchar)("vendor_id").notNull(),
    productId: (0, pg_core_1.varchar)("product_id").notNull(),
    quantityConsigned: (0, pg_core_1.integer)("quantity_consigned").default(0).notNull(),
    quantitySold: (0, pg_core_1.integer)("quantity_sold").default(0).notNull(),
    quantityReturned: (0, pg_core_1.integer)("quantity_returned").default(0).notNull(),
    consignmentPrice: (0, pg_core_1.numeric)("consignment_price", { precision: 15, scale: 2 }).notNull(),
    discountPercent: (0, pg_core_1.numeric)("discount_percent", { precision: 5, scale: 2 }).default(0),
    consignmentDate: (0, pg_core_1.timestamp)("consignment_date", { mode: 'string' }).defaultNow().notNull(),
    expiryDate: (0, pg_core_1.timestamp)("expiry_date", { mode: 'string' }),
    status: (0, pg_core_1.varchar)().default('active'),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { mode: 'string' }).defaultNow().notNull(),
    commissionPerUnit: (0, pg_core_1.numeric)("commission_per_unit", { precision: 15, scale: 2 }).default(0.00),
}, (table) => [
    (0, pg_core_1.unique)("vendor_products_vendor_id_product_id_key").on(table.vendorId, table.productId),
]);
exports.vendors = (0, pg_core_1.pgTable)("vendors", {
    id: (0, pg_core_1.varchar)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    name: (0, pg_core_1.varchar)().notNull(),
    contactPerson: (0, pg_core_1.varchar)("contact_person"),
    email: (0, pg_core_1.varchar)().notNull(),
    phone: (0, pg_core_1.varchar)(),
    passwordHash: (0, pg_core_1.varchar)("password_hash").notNull(),
    warehouseAddress: (0, pg_core_1.text)("warehouse_address"),
    warehouseCity: (0, pg_core_1.varchar)("warehouse_city"),
    warehouseDistrict: (0, pg_core_1.varchar)("warehouse_district"),
    warehouseWard: (0, pg_core_1.varchar)("warehouse_ward"),
    depositBalance: (0, pg_core_1.numeric)("deposit_balance", { precision: 15, scale: 2 }).default(0).notNull(),
    depositTotal: (0, pg_core_1.numeric)("deposit_total", { precision: 15, scale: 2 }).default(0).notNull(),
    minimumDeposit: (0, pg_core_1.numeric)("minimum_deposit", { precision: 15, scale: 2 }).default(1000000).notNull(),
    paymentMethod: (0, pg_core_1.varchar)("payment_method").default('deposit'),
    bankInfo: (0, pg_core_1.jsonb)("bank_info").default({}),
    commissionRate: (0, pg_core_1.numeric)("commission_rate", { precision: 5, scale: 2 }).default(0.30).notNull(),
    notificationPreferences: (0, pg_core_1.jsonb)("notification_preferences").default({}),
    status: (0, pg_core_1.varchar)().default('pending'),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { mode: 'string' }).defaultNow().notNull(),
    password: (0, pg_core_1.text)().default('').notNull(),
    lastLoginAt: (0, pg_core_1.timestamp)("last_login_at", { mode: 'string' }),
    warehousePostalCode: (0, pg_core_1.text)("warehouse_postal_code"),
    warehousePhone: (0, pg_core_1.text)("warehouse_phone"),
    paymentModel: (0, pg_core_1.text)("payment_model").default('deposit').notNull(),
    monthlyDebt: (0, pg_core_1.numeric)("monthly_debt", { precision: 15, scale: 2 }).default(0.00).notNull(),
}, (table) => [
    (0, pg_core_1.unique)("vendors_email_key").on(table.email),
    (0, pg_core_1.unique)("vendors_email_unique").on(table.email),
]);
exports.vietnameseReviewTemplates = (0, pg_core_1.pgTable)("vietnamese_review_templates", {
    id: (0, pg_core_1.varchar)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    templateName: (0, pg_core_1.text)("template_name").notNull(),
    templateCategory: (0, pg_core_1.varchar)("template_category", { length: 20 }).notNull(),
    regionDialect: (0, pg_core_1.varchar)("region_dialect", { length: 20 }).default('miền-bắc').notNull(),
    bookCategory: (0, pg_core_1.varchar)("book_category", { length: 50 }),
    reviewTitleTemplate: (0, pg_core_1.text)("review_title_template").notNull(),
    reviewContentTemplate: (0, pg_core_1.text)("review_content_template").notNull(),
    sentimentScore: (0, pg_core_1.numeric)("sentiment_score", { precision: 3, scale: 2 }).default(0).notNull(),
    formalityLevel: (0, pg_core_1.varchar)("formality_level", { length: 20 }).default('casual'),
    ageGroup: (0, pg_core_1.varchar)("age_group", { length: 20 }).default('adult'),
    usageCount: (0, pg_core_1.integer)("usage_count").default(0),
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
    tags: (0, pg_core_1.text)().default('{}'),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { mode: 'string' }).defaultNow(),
});
exports.workers = (0, pg_core_1.pgTable)("workers", {
    id: (0, pg_core_1.varchar)().default((0, drizzle_orm_1.sql) `gen_random_uuid()`).primaryKey(),
    workerId: (0, pg_core_1.text)("worker_id").notNull(),
    name: (0, pg_core_1.text)().notNull(),
    description: (0, pg_core_1.text)(),
    platforms: (0, pg_core_1.jsonb)().notNull(),
    capabilities: (0, pg_core_1.jsonb)().notNull(),
    specialties: (0, pg_core_1.jsonb)(),
    maxConcurrentJobs: (0, pg_core_1.integer)("max_concurrent_jobs").default(3).notNull(),
    minJobInterval: (0, pg_core_1.integer)("min_job_interval").default(300).notNull(),
    maxJobsPerHour: (0, pg_core_1.integer)("max_jobs_per_hour").default(12).notNull(),
    avgExecutionTime: (0, pg_core_1.integer)("avg_execution_time").default(5000).notNull(),
    region: (0, pg_core_1.text)().notNull(),
    environment: (0, pg_core_1.text)().default('production').notNull(),
    deploymentPlatform: (0, pg_core_1.text)("deployment_platform").notNull(),
    endpointUrl: (0, pg_core_1.text)("endpoint_url").notNull(),
    status: (0, pg_core_1.text)().default('active').notNull(),
    isOnline: (0, pg_core_1.boolean)("is_online").default(false).notNull(),
    lastPingAt: (0, pg_core_1.timestamp)("last_ping_at", { mode: 'string' }),
    lastJobAt: (0, pg_core_1.timestamp)("last_job_at", { mode: 'string' }),
    currentLoad: (0, pg_core_1.integer)("current_load").default(0).notNull(),
    totalJobsCompleted: (0, pg_core_1.integer)("total_jobs_completed").default(0).notNull(),
    totalJobsFailed: (0, pg_core_1.integer)("total_jobs_failed").default(0).notNull(),
    successRate: (0, pg_core_1.numeric)("success_rate", { precision: 5, scale: 2 }).default(0.00).notNull(),
    avgResponseTime: (0, pg_core_1.integer)("avg_response_time").default(0).notNull(),
    registrationSecret: (0, pg_core_1.text)("registration_secret"),
    authToken: (0, pg_core_1.text)("auth_token"),
    tokenExpiresAt: (0, pg_core_1.timestamp)("token_expires_at", { mode: 'string' }),
    tags: (0, pg_core_1.jsonb)(),
    priority: (0, pg_core_1.integer)().default(1).notNull(),
    isEnabled: (0, pg_core_1.boolean)("is_enabled").default(true).notNull(),
    metadata: (0, pg_core_1.jsonb)(),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: 'string' }).defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { mode: 'string' }).defaultNow().notNull(),
    ipAddress: (0, pg_core_1.text)("ip_address"),
    ipCountry: (0, pg_core_1.text)("ip_country"),
    ipRegion: (0, pg_core_1.text)("ip_region"),
}, (table) => [
    (0, pg_core_1.unique)("workers_worker_id_key").on(table.workerId),
]);
// Zod Schemas
exports.insertAccountGroupsSchema = (0, drizzle_zod_1.createInsertSchema)(exports.accountGroups);
exports.selectAccountGroupsSchema = (0, drizzle_zod_1.createSelectSchema)(exports.accountGroups);
exports.insertAdminsSchema = (0, drizzle_zod_1.createInsertSchema)(exports.admins);
exports.selectAdminsSchema = (0, drizzle_zod_1.createSelectSchema)(exports.admins);
exports.insertAffiliateClicksSchema = (0, drizzle_zod_1.createInsertSchema)(exports.affiliateClicks);
exports.selectAffiliateClicksSchema = (0, drizzle_zod_1.createSelectSchema)(exports.affiliateClicks);
exports.insertAffiliateLandingPagesSchema = (0, drizzle_zod_1.createInsertSchema)(exports.affiliateLandingPages);
exports.selectAffiliateLandingPagesSchema = (0, drizzle_zod_1.createSelectSchema)(exports.affiliateLandingPages);
exports.insertAffiliateProductAssignmentsSchema = (0, drizzle_zod_1.createInsertSchema)(exports.affiliateProductAssignments);
exports.selectAffiliateProductAssignmentsSchema = (0, drizzle_zod_1.createSelectSchema)(exports.affiliateProductAssignments);
exports.insertAffiliateProductRequestsSchema = (0, drizzle_zod_1.createInsertSchema)(exports.affiliateProductRequests);
exports.selectAffiliateProductRequestsSchema = (0, drizzle_zod_1.createSelectSchema)(exports.affiliateProductRequests);
exports.insertApiConfigurationsSchema = (0, drizzle_zod_1.createInsertSchema)(exports.apiConfigurations);
exports.selectApiConfigurationsSchema = (0, drizzle_zod_1.createSelectSchema)(exports.apiConfigurations);
exports.insertAuthUsersSchema = (0, drizzle_zod_1.createInsertSchema)(exports.authUsers);
exports.selectAuthUsersSchema = (0, drizzle_zod_1.createSelectSchema)(exports.authUsers);
exports.insertBookAnalyticsSchema = (0, drizzle_zod_1.createInsertSchema)(exports.bookAnalytics);
exports.selectBookAnalyticsSchema = (0, drizzle_zod_1.createSelectSchema)(exports.bookAnalytics);
exports.insertBookCampaignRecipientsSchema = (0, drizzle_zod_1.createInsertSchema)(exports.bookCampaignRecipients);
exports.selectBookCampaignRecipientsSchema = (0, drizzle_zod_1.createSelectSchema)(exports.bookCampaignRecipients);
exports.insertBookCategoriesSchema = (0, drizzle_zod_1.createInsertSchema)(exports.bookCategories);
exports.selectBookCategoriesSchema = (0, drizzle_zod_1.createSelectSchema)(exports.bookCategories);
exports.insertBookCategoryAssignmentsSchema = (0, drizzle_zod_1.createInsertSchema)(exports.bookCategoryAssignments);
exports.selectBookCategoryAssignmentsSchema = (0, drizzle_zod_1.createSelectSchema)(exports.bookCategoryAssignments);
exports.insertBookCustomersSchema = (0, drizzle_zod_1.createInsertSchema)(exports.bookCustomers);
exports.selectBookCustomersSchema = (0, drizzle_zod_1.createSelectSchema)(exports.bookCustomers);
exports.insertBookMarketingCampaignsSchema = (0, drizzle_zod_1.createInsertSchema)(exports.bookMarketingCampaigns);
exports.selectBookMarketingCampaignsSchema = (0, drizzle_zod_1.createSelectSchema)(exports.bookMarketingCampaigns);
exports.insertBookOrderItemsSchema = (0, drizzle_zod_1.createInsertSchema)(exports.bookOrderItems);
exports.selectBookOrderItemsSchema = (0, drizzle_zod_1.createSelectSchema)(exports.bookOrderItems);
exports.insertBookOrderItemSchema = exports.insertBookOrderItemsSchema;
exports.selectBookOrderItemSchema = exports.selectBookOrderItemsSchema;
exports.insertBookOrdersSchema = (0, drizzle_zod_1.createInsertSchema)(exports.bookOrders);
exports.selectBookOrdersSchema = (0, drizzle_zod_1.createSelectSchema)(exports.bookOrders);
exports.insertBookOrderSchema = exports.insertBookOrdersSchema;
exports.selectBookOrderSchema = exports.selectBookOrdersSchema;
exports.insertBookPaymentTransactionsSchema = (0, drizzle_zod_1.createInsertSchema)(exports.bookPaymentTransactions);
exports.selectBookPaymentTransactionsSchema = (0, drizzle_zod_1.createSelectSchema)(exports.bookPaymentTransactions);
exports.insertBookPricesSchema = (0, drizzle_zod_1.createInsertSchema)(exports.bookPrices);
exports.selectBookPricesSchema = (0, drizzle_zod_1.createSelectSchema)(exports.bookPrices);
exports.insertBookPriceSchema = exports.insertBookPricesSchema;
exports.selectBookPriceSchema = exports.selectBookPricesSchema;
exports.insertBookPricingRulesSchema = (0, drizzle_zod_1.createInsertSchema)(exports.bookPricingRules);
exports.selectBookPricingRulesSchema = (0, drizzle_zod_1.createSelectSchema)(exports.bookPricingRules);
exports.insertBookSellerInventorySchema = (0, drizzle_zod_1.createInsertSchema)(exports.bookSellerInventory);
exports.selectBookSellerInventorySchema = (0, drizzle_zod_1.createSelectSchema)(exports.bookSellerInventory);
exports.insertBookSellersSchema = (0, drizzle_zod_1.createInsertSchema)(exports.bookSellers);
exports.selectBookSellersSchema = (0, drizzle_zod_1.createSelectSchema)(exports.bookSellers);
exports.insertBooksSchema = (0, drizzle_zod_1.createInsertSchema)(exports.books);
exports.selectBooksSchema = (0, drizzle_zod_1.createSelectSchema)(exports.books);
exports.insertBookSchema = exports.insertBooksSchema;
exports.selectBookSchema = exports.selectBooksSchema;
exports.insertBotSettingsSchema = (0, drizzle_zod_1.createInsertSchema)(exports.botSettings);
exports.selectBotSettingsSchema = (0, drizzle_zod_1.createSelectSchema)(exports.botSettings);
exports.insertCampaignParticipationsSchema = (0, drizzle_zod_1.createInsertSchema)(exports.campaignParticipations);
exports.selectCampaignParticipationsSchema = (0, drizzle_zod_1.createSelectSchema)(exports.campaignParticipations);
exports.insertCampaignsSchema = (0, drizzle_zod_1.createInsertSchema)(exports.campaigns);
exports.selectCampaignsSchema = (0, drizzle_zod_1.createSelectSchema)(exports.campaigns);
exports.insertCarGroupsSchema = (0, drizzle_zod_1.createInsertSchema)(exports.carGroups);
exports.selectCarGroupsSchema = (0, drizzle_zod_1.createSelectSchema)(exports.carGroups);
exports.insertCategoriesSchema = (0, drizzle_zod_1.createInsertSchema)(exports.categories);
exports.selectCategoriesSchema = (0, drizzle_zod_1.createSelectSchema)(exports.categories);
exports.insertCategoryFaqTemplatesSchema = (0, drizzle_zod_1.createInsertSchema)(exports.categoryFaqTemplates);
exports.selectCategoryFaqTemplatesSchema = (0, drizzle_zod_1.createSelectSchema)(exports.categoryFaqTemplates);
exports.insertCategoryPriceRulesSchema = (0, drizzle_zod_1.createInsertSchema)(exports.categoryPriceRules);
exports.selectCategoryPriceRulesSchema = (0, drizzle_zod_1.createSelectSchema)(exports.categoryPriceRules);
exports.insertChatbotConversationsSchema = (0, drizzle_zod_1.createInsertSchema)(exports.chatbotConversations);
exports.selectChatbotConversationsSchema = (0, drizzle_zod_1.createSelectSchema)(exports.chatbotConversations);
exports.insertCompetitorProfilesSchema = (0, drizzle_zod_1.createInsertSchema)(exports.competitorProfiles);
exports.selectCompetitorProfilesSchema = (0, drizzle_zod_1.createSelectSchema)(exports.competitorProfiles);
exports.insertConsignmentRequestsSchema = (0, drizzle_zod_1.createInsertSchema)(exports.consignmentRequests);
exports.selectConsignmentRequestsSchema = (0, drizzle_zod_1.createSelectSchema)(exports.consignmentRequests);
exports.insertContentAssetsSchema = (0, drizzle_zod_1.createInsertSchema)(exports.contentAssets);
exports.selectContentAssetsSchema = (0, drizzle_zod_1.createSelectSchema)(exports.contentAssets);
exports.insertContentCategoriesSchema = (0, drizzle_zod_1.createInsertSchema)(exports.contentCategories);
exports.selectContentCategoriesSchema = (0, drizzle_zod_1.createSelectSchema)(exports.contentCategories);
exports.insertContentFaqAssignmentsSchema = (0, drizzle_zod_1.createInsertSchema)(exports.contentFaqAssignments);
exports.selectContentFaqAssignmentsSchema = (0, drizzle_zod_1.createSelectSchema)(exports.contentFaqAssignments);
exports.insertContentLibrarySchema = (0, drizzle_zod_1.createInsertSchema)(exports.contentLibrary);
exports.selectContentLibrarySchema = (0, drizzle_zod_1.createSelectSchema)(exports.contentLibrary);
exports.insertContentQueueSchema = (0, drizzle_zod_1.createInsertSchema)(exports.contentQueue);
exports.selectContentQueueSchema = (0, drizzle_zod_1.createSelectSchema)(exports.contentQueue);
exports.insertConversationMessagesSchema = (0, drizzle_zod_1.createInsertSchema)(exports.conversationMessages);
exports.selectConversationMessagesSchema = (0, drizzle_zod_1.createSelectSchema)(exports.conversationMessages);
exports.insertConversationSessionsSchema = (0, drizzle_zod_1.createInsertSchema)(exports.conversationSessions);
exports.selectConversationSessionsSchema = (0, drizzle_zod_1.createSelectSchema)(exports.conversationSessions);
exports.insertCookieProfilesSchema = (0, drizzle_zod_1.createInsertSchema)(exports.cookieProfiles);
exports.selectCookieProfilesSchema = (0, drizzle_zod_1.createSelectSchema)(exports.cookieProfiles);
exports.insertCustomerEventsSchema = (0, drizzle_zod_1.createInsertSchema)(exports.customerEvents);
exports.selectCustomerEventsSchema = (0, drizzle_zod_1.createSelectSchema)(exports.customerEvents);
exports.insertCustomerReviewsSchema = (0, drizzle_zod_1.createInsertSchema)(exports.customerReviews);
exports.selectCustomerReviewsSchema = (0, drizzle_zod_1.createSelectSchema)(exports.customerReviews);
exports.insertCustomerVouchersSchema = (0, drizzle_zod_1.createInsertSchema)(exports.customerVouchers);
exports.selectCustomerVouchersSchema = (0, drizzle_zod_1.createSelectSchema)(exports.customerVouchers);
exports.insertCustomersSchema = (0, drizzle_zod_1.createInsertSchema)(exports.customers);
exports.selectCustomersSchema = (0, drizzle_zod_1.createSelectSchema)(exports.customers);
exports.insertDepositTransactionsSchema = (0, drizzle_zod_1.createInsertSchema)(exports.depositTransactions);
exports.selectDepositTransactionsSchema = (0, drizzle_zod_1.createSelectSchema)(exports.depositTransactions);
exports.insertDiscountCodeUsagesSchema = (0, drizzle_zod_1.createInsertSchema)(exports.discountCodeUsages);
exports.selectDiscountCodeUsagesSchema = (0, drizzle_zod_1.createSelectSchema)(exports.discountCodeUsages);
exports.insertDiscountCodesSchema = (0, drizzle_zod_1.createInsertSchema)(exports.discountCodes);
exports.selectDiscountCodesSchema = (0, drizzle_zod_1.createSelectSchema)(exports.discountCodes);
exports.insertDiscountScopeAssignmentsSchema = (0, drizzle_zod_1.createInsertSchema)(exports.discountScopeAssignments);
exports.selectDiscountScopeAssignmentsSchema = (0, drizzle_zod_1.createSelectSchema)(exports.discountScopeAssignments);
exports.insertDriverReportsSchema = (0, drizzle_zod_1.createInsertSchema)(exports.driverReports);
exports.selectDriverReportsSchema = (0, drizzle_zod_1.createSelectSchema)(exports.driverReports);
exports.insertFacebookAppsSchema = (0, drizzle_zod_1.createInsertSchema)(exports.facebookApps);
exports.selectFacebookAppsSchema = (0, drizzle_zod_1.createSelectSchema)(exports.facebookApps);
exports.insertFacebookConversationsSchema = (0, drizzle_zod_1.createInsertSchema)(exports.facebookConversations);
exports.selectFacebookConversationsSchema = (0, drizzle_zod_1.createSelectSchema)(exports.facebookConversations);
exports.insertFacebookMessagesSchema = (0, drizzle_zod_1.createInsertSchema)(exports.facebookMessages);
exports.selectFacebookMessagesSchema = (0, drizzle_zod_1.createSelectSchema)(exports.facebookMessages);
exports.insertFacebookWebhookEventsSchema = (0, drizzle_zod_1.createInsertSchema)(exports.facebookWebhookEvents);
exports.selectFacebookWebhookEventsSchema = (0, drizzle_zod_1.createSelectSchema)(exports.facebookWebhookEvents);
exports.insertFaqGenerationJobsSchema = (0, drizzle_zod_1.createInsertSchema)(exports.faqGenerationJobs);
exports.selectFaqGenerationJobsSchema = (0, drizzle_zod_1.createSelectSchema)(exports.faqGenerationJobs);
exports.insertFaqGenerationResultsSchema = (0, drizzle_zod_1.createInsertSchema)(exports.faqGenerationResults);
exports.selectFaqGenerationResultsSchema = (0, drizzle_zod_1.createSelectSchema)(exports.faqGenerationResults);
exports.insertFaqLibrarySchema = (0, drizzle_zod_1.createInsertSchema)(exports.faqLibrary);
exports.selectFaqLibrarySchema = (0, drizzle_zod_1.createSelectSchema)(exports.faqLibrary);
exports.insertFrontendCategoryAssignmentsSchema = (0, drizzle_zod_1.createInsertSchema)(exports.frontendCategoryAssignments);
exports.selectFrontendCategoryAssignmentsSchema = (0, drizzle_zod_1.createSelectSchema)(exports.frontendCategoryAssignments);
exports.insertGeneralCategoriesSchema = (0, drizzle_zod_1.createInsertSchema)(exports.generalCategories);
exports.selectGeneralCategoriesSchema = (0, drizzle_zod_1.createSelectSchema)(exports.generalCategories);
exports.insertGeneralCategoryAnalyticsSchema = (0, drizzle_zod_1.createInsertSchema)(exports.generalCategoryAnalytics);
exports.selectGeneralCategoryAnalyticsSchema = (0, drizzle_zod_1.createSelectSchema)(exports.generalCategoryAnalytics);
exports.insertGeneralCategoryAssignmentsSchema = (0, drizzle_zod_1.createInsertSchema)(exports.generalCategoryAssignments);
exports.selectGeneralCategoryAssignmentsSchema = (0, drizzle_zod_1.createSelectSchema)(exports.generalCategoryAssignments);
exports.insertGeneralCategoryPriceRulesSchema = (0, drizzle_zod_1.createInsertSchema)(exports.generalCategoryPriceRules);
exports.selectGeneralCategoryPriceRulesSchema = (0, drizzle_zod_1.createSelectSchema)(exports.generalCategoryPriceRules);
exports.insertGiftCampaignsSchema = (0, drizzle_zod_1.createInsertSchema)(exports.giftCampaigns);
exports.selectGiftCampaignsSchema = (0, drizzle_zod_1.createSelectSchema)(exports.giftCampaigns);
exports.insertGiftRedemptionsSchema = (0, drizzle_zod_1.createInsertSchema)(exports.giftRedemptions);
exports.selectGiftRedemptionsSchema = (0, drizzle_zod_1.createSelectSchema)(exports.giftRedemptions);
exports.insertGiftVouchersSchema = (0, drizzle_zod_1.createInsertSchema)(exports.giftVouchers);
exports.selectGiftVouchersSchema = (0, drizzle_zod_1.createSelectSchema)(exports.giftVouchers);
exports.insertGlobalAutomationControlSchema = (0, drizzle_zod_1.createInsertSchema)(exports.globalAutomationControl);
exports.selectGlobalAutomationControlSchema = (0, drizzle_zod_1.createSelectSchema)(exports.globalAutomationControl);
exports.insertIndustriesSchema = (0, drizzle_zod_1.createInsertSchema)(exports.industries);
exports.selectIndustriesSchema = (0, drizzle_zod_1.createSelectSchema)(exports.industries);
exports.insertIndustryKeywordsSchema = (0, drizzle_zod_1.createInsertSchema)(exports.industryKeywords);
exports.selectIndustryKeywordsSchema = (0, drizzle_zod_1.createSelectSchema)(exports.industryKeywords);
exports.insertIndustryRulesSchema = (0, drizzle_zod_1.createInsertSchema)(exports.industryRules);
exports.selectIndustryRulesSchema = (0, drizzle_zod_1.createSelectSchema)(exports.industryRules);
exports.insertIndustryTemplatesSchema = (0, drizzle_zod_1.createInsertSchema)(exports.industryTemplates);
exports.selectIndustryTemplatesSchema = (0, drizzle_zod_1.createSelectSchema)(exports.industryTemplates);
exports.insertIntentAnalyticsSchema = (0, drizzle_zod_1.createInsertSchema)(exports.intentAnalytics);
exports.selectIntentAnalyticsSchema = (0, drizzle_zod_1.createSelectSchema)(exports.intentAnalytics);
exports.insertInvoiceTemplatesSchema = (0, drizzle_zod_1.createInsertSchema)(exports.invoiceTemplates);
exports.selectInvoiceTemplatesSchema = (0, drizzle_zod_1.createSelectSchema)(exports.invoiceTemplates);
exports.insertIpPoolSessionsSchema = (0, drizzle_zod_1.createInsertSchema)(exports.ipPoolSessions);
exports.selectIpPoolSessionsSchema = (0, drizzle_zod_1.createSelectSchema)(exports.ipPoolSessions);
exports.insertIpPoolsSchema = (0, drizzle_zod_1.createInsertSchema)(exports.ipPools);
exports.selectIpPoolsSchema = (0, drizzle_zod_1.createSelectSchema)(exports.ipPools);
exports.insertIpRotationLogsSchema = (0, drizzle_zod_1.createInsertSchema)(exports.ipRotationLogs);
exports.selectIpRotationLogsSchema = (0, drizzle_zod_1.createSelectSchema)(exports.ipRotationLogs);
exports.insertMarketTrendsSchema = (0, drizzle_zod_1.createInsertSchema)(exports.marketTrends);
exports.selectMarketTrendsSchema = (0, drizzle_zod_1.createSelectSchema)(exports.marketTrends);
exports.insertOauthConnectionsSchema = (0, drizzle_zod_1.createInsertSchema)(exports.oauthConnections);
exports.selectOauthConnectionsSchema = (0, drizzle_zod_1.createSelectSchema)(exports.oauthConnections);
exports.insertOrderItemsSchema = (0, drizzle_zod_1.createInsertSchema)(exports.orderItems);
exports.selectOrderItemsSchema = (0, drizzle_zod_1.createSelectSchema)(exports.orderItems);
exports.insertOrdersSchema = (0, drizzle_zod_1.createInsertSchema)(exports.orders);
exports.selectOrdersSchema = (0, drizzle_zod_1.createSelectSchema)(exports.orders);
exports.insertPageTagsSchema = (0, drizzle_zod_1.createInsertSchema)(exports.pageTags);
exports.selectPageTagsSchema = (0, drizzle_zod_1.createSelectSchema)(exports.pageTags);
exports.insertPaymentGatewaySettingsSchema = (0, drizzle_zod_1.createInsertSchema)(exports.paymentGatewaySettings);
exports.selectPaymentGatewaySettingsSchema = (0, drizzle_zod_1.createSelectSchema)(exports.paymentGatewaySettings);
exports.insertPaymentsSchema = (0, drizzle_zod_1.createInsertSchema)(exports.payments);
exports.selectPaymentsSchema = (0, drizzle_zod_1.createSelectSchema)(exports.payments);
exports.insertPerformanceMetricsSchema = (0, drizzle_zod_1.createInsertSchema)(exports.performanceMetrics);
exports.selectPerformanceMetricsSchema = (0, drizzle_zod_1.createSelectSchema)(exports.performanceMetrics);
exports.insertPriceSourcesSchema = (0, drizzle_zod_1.createInsertSchema)(exports.priceSources);
exports.selectPriceSourcesSchema = (0, drizzle_zod_1.createSelectSchema)(exports.priceSources);
exports.insertPricingStrategiesSchema = (0, drizzle_zod_1.createInsertSchema)(exports.pricingStrategies);
exports.selectPricingStrategiesSchema = (0, drizzle_zod_1.createSelectSchema)(exports.pricingStrategies);
exports.insertProductFaqsSchema = (0, drizzle_zod_1.createInsertSchema)(exports.productFaqs);
exports.selectProductFaqsSchema = (0, drizzle_zod_1.createSelectSchema)(exports.productFaqs);
exports.insertProductLandingClicksSchema = (0, drizzle_zod_1.createInsertSchema)(exports.productLandingClicks);
exports.selectProductLandingClicksSchema = (0, drizzle_zod_1.createSelectSchema)(exports.productLandingClicks);
exports.insertProductLandingPagesSchema = (0, drizzle_zod_1.createInsertSchema)(exports.productLandingPages);
exports.selectProductLandingPagesSchema = (0, drizzle_zod_1.createSelectSchema)(exports.productLandingPages);
exports.insertProductPoliciesSchema = (0, drizzle_zod_1.createInsertSchema)(exports.productPolicies);
exports.selectProductPoliciesSchema = (0, drizzle_zod_1.createSelectSchema)(exports.productPolicies);
exports.insertProductPolicyAssociationsSchema = (0, drizzle_zod_1.createInsertSchema)(exports.productPolicyAssociations);
exports.selectProductPolicyAssociationsSchema = (0, drizzle_zod_1.createSelectSchema)(exports.productPolicyAssociations);
exports.insertProductReviewsSchema = (0, drizzle_zod_1.createInsertSchema)(exports.productReviews);
exports.selectProductReviewsSchema = (0, drizzle_zod_1.createSelectSchema)(exports.productReviews);
exports.insertProductsSchema = (0, drizzle_zod_1.createInsertSchema)(exports.products);
exports.selectProductsSchema = (0, drizzle_zod_1.createSelectSchema)(exports.products);
exports.insertProjectTemplatesSchema = (0, drizzle_zod_1.createInsertSchema)(exports.projectTemplates);
exports.selectProjectTemplatesSchema = (0, drizzle_zod_1.createSelectSchema)(exports.projectTemplates);
exports.insertPushSubscriptionsSchema = (0, drizzle_zod_1.createInsertSchema)(exports.pushSubscriptions);
exports.selectPushSubscriptionsSchema = (0, drizzle_zod_1.createSelectSchema)(exports.pushSubscriptions);
exports.insertQueueAutofillSettingsSchema = (0, drizzle_zod_1.createInsertSchema)(exports.queueAutofillSettings);
exports.selectQueueAutofillSettingsSchema = (0, drizzle_zod_1.createSelectSchema)(exports.queueAutofillSettings);
exports.insertQueueHistorySchema = (0, drizzle_zod_1.createInsertSchema)(exports.queueHistory);
exports.selectQueueHistorySchema = (0, drizzle_zod_1.createSelectSchema)(exports.queueHistory);
exports.insertRegistrationTokensSchema = (0, drizzle_zod_1.createInsertSchema)(exports.registrationTokens);
exports.selectRegistrationTokensSchema = (0, drizzle_zod_1.createSelectSchema)(exports.registrationTokens);
exports.insertReturnRequestsSchema = (0, drizzle_zod_1.createInsertSchema)(exports.returnRequests);
exports.selectReturnRequestsSchema = (0, drizzle_zod_1.createSelectSchema)(exports.returnRequests);
exports.insertSalesAutomationConfigsSchema = (0, drizzle_zod_1.createInsertSchema)(exports.salesAutomationConfigs);
exports.selectSalesAutomationConfigsSchema = (0, drizzle_zod_1.createSelectSchema)(exports.salesAutomationConfigs);
exports.insertSalesAutomationHistorySchema = (0, drizzle_zod_1.createInsertSchema)(exports.salesAutomationHistory);
exports.selectSalesAutomationHistorySchema = (0, drizzle_zod_1.createSelectSchema)(exports.salesAutomationHistory);
exports.insertSatisfactionSurveysSchema = (0, drizzle_zod_1.createInsertSchema)(exports.satisfactionSurveys);
exports.selectSatisfactionSurveysSchema = (0, drizzle_zod_1.createSelectSchema)(exports.satisfactionSurveys);
exports.insertScheduledPostsSchema = (0, drizzle_zod_1.createInsertSchema)(exports.scheduledPosts);
exports.selectScheduledPostsSchema = (0, drizzle_zod_1.createSelectSchema)(exports.scheduledPosts);
exports.insertSeasonalRulesSchema = (0, drizzle_zod_1.createInsertSchema)(exports.seasonalRules);
exports.selectSeasonalRulesSchema = (0, drizzle_zod_1.createSelectSchema)(exports.seasonalRules);
exports.insertSellerPaymentConfigsSchema = (0, drizzle_zod_1.createInsertSchema)(exports.sellerPaymentConfigs);
exports.selectSellerPaymentConfigsSchema = (0, drizzle_zod_1.createSelectSchema)(exports.sellerPaymentConfigs);
exports.insertSellerRatingsSchema = (0, drizzle_zod_1.createInsertSchema)(exports.sellerRatings);
exports.selectSellerRatingsSchema = (0, drizzle_zod_1.createSelectSchema)(exports.sellerRatings);
exports.insertSessionsSchema = (0, drizzle_zod_1.createInsertSchema)(exports.sessions);
exports.selectSessionsSchema = (0, drizzle_zod_1.createSelectSchema)(exports.sessions);
exports.insertShareVerificationsSchema = (0, drizzle_zod_1.createInsertSchema)(exports.shareVerifications);
exports.selectShareVerificationsSchema = (0, drizzle_zod_1.createSelectSchema)(exports.shareVerifications);
exports.insertShippingZonesSchema = (0, drizzle_zod_1.createInsertSchema)(exports.shippingZones);
exports.selectShippingZonesSchema = (0, drizzle_zod_1.createSelectSchema)(exports.shippingZones);
exports.insertShopSettingsSchema = (0, drizzle_zod_1.createInsertSchema)(exports.shopSettings);
exports.selectShopSettingsSchema = (0, drizzle_zod_1.createSelectSchema)(exports.shopSettings);
exports.insertShopeeBusinessAccountsSchema = (0, drizzle_zod_1.createInsertSchema)(exports.shopeeBusinessAccounts);
exports.selectShopeeBusinessAccountsSchema = (0, drizzle_zod_1.createSelectSchema)(exports.shopeeBusinessAccounts);
exports.insertShopeeShopOrdersSchema = (0, drizzle_zod_1.createInsertSchema)(exports.shopeeShopOrders);
exports.selectShopeeShopOrdersSchema = (0, drizzle_zod_1.createSelectSchema)(exports.shopeeShopOrders);
exports.insertShopeeShopProductsSchema = (0, drizzle_zod_1.createInsertSchema)(exports.shopeeShopProducts);
exports.selectShopeeShopProductsSchema = (0, drizzle_zod_1.createSelectSchema)(exports.shopeeShopProducts);
exports.insertSocialAccountsSchema = (0, drizzle_zod_1.createInsertSchema)(exports.socialAccounts);
exports.selectSocialAccountsSchema = (0, drizzle_zod_1.createSelectSchema)(exports.socialAccounts);
exports.insertStockReservationsSchema = (0, drizzle_zod_1.createInsertSchema)(exports.stockReservations);
exports.selectStockReservationsSchema = (0, drizzle_zod_1.createSelectSchema)(exports.stockReservations);
exports.insertStorefrontConfigSchema = (0, drizzle_zod_1.createInsertSchema)(exports.storefrontConfig);
exports.selectStorefrontConfigSchema = (0, drizzle_zod_1.createSelectSchema)(exports.storefrontConfig);
exports.insertStorefrontOrdersSchema = (0, drizzle_zod_1.createInsertSchema)(exports.storefrontOrders);
exports.selectStorefrontOrdersSchema = (0, drizzle_zod_1.createSelectSchema)(exports.storefrontOrders);
exports.insertTemplateCompilationsSchema = (0, drizzle_zod_1.createInsertSchema)(exports.templateCompilations);
exports.selectTemplateCompilationsSchema = (0, drizzle_zod_1.createSelectSchema)(exports.templateCompilations);
exports.insertThemeConfigurationsSchema = (0, drizzle_zod_1.createInsertSchema)(exports.themeConfigurations);
exports.selectThemeConfigurationsSchema = (0, drizzle_zod_1.createSelectSchema)(exports.themeConfigurations);
exports.insertTiktokBusinessAccountsSchema = (0, drizzle_zod_1.createInsertSchema)(exports.tiktokBusinessAccounts);
exports.selectTiktokBusinessAccountsSchema = (0, drizzle_zod_1.createSelectSchema)(exports.tiktokBusinessAccounts);
exports.insertTiktokShopOrdersSchema = (0, drizzle_zod_1.createInsertSchema)(exports.tiktokShopOrders);
exports.selectTiktokShopOrdersSchema = (0, drizzle_zod_1.createSelectSchema)(exports.tiktokShopOrders);
exports.insertTiktokShopProductsSchema = (0, drizzle_zod_1.createInsertSchema)(exports.tiktokShopProducts);
exports.selectTiktokShopProductsSchema = (0, drizzle_zod_1.createSelectSchema)(exports.tiktokShopProducts);
exports.insertTiktokVideosSchema = (0, drizzle_zod_1.createInsertSchema)(exports.tiktokVideos);
exports.selectTiktokVideosSchema = (0, drizzle_zod_1.createSelectSchema)(exports.tiktokVideos);
exports.insertTripsSchema = (0, drizzle_zod_1.createInsertSchema)(exports.trips);
exports.selectTripsSchema = (0, drizzle_zod_1.createSelectSchema)(exports.trips);
exports.insertUnifiedTagsSchema = (0, drizzle_zod_1.createInsertSchema)(exports.unifiedTags);
exports.selectUnifiedTagsSchema = (0, drizzle_zod_1.createSelectSchema)(exports.unifiedTags);
exports.insertUserSatisfactionScoresSchema = (0, drizzle_zod_1.createInsertSchema)(exports.userSatisfactionScores);
exports.selectUserSatisfactionScoresSchema = (0, drizzle_zod_1.createSelectSchema)(exports.userSatisfactionScores);
exports.insertUserSessionsSchema = (0, drizzle_zod_1.createInsertSchema)(exports.userSessions);
exports.selectUserSessionsSchema = (0, drizzle_zod_1.createSelectSchema)(exports.userSessions);
exports.insertUserTemplatesSchema = (0, drizzle_zod_1.createInsertSchema)(exports.userTemplates);
exports.selectUserTemplatesSchema = (0, drizzle_zod_1.createSelectSchema)(exports.userTemplates);
exports.insertUsersSchema = (0, drizzle_zod_1.createInsertSchema)(exports.users);
exports.selectUsersSchema = (0, drizzle_zod_1.createSelectSchema)(exports.users);
exports.insertVehicleGroupAssignmentsSchema = (0, drizzle_zod_1.createInsertSchema)(exports.vehicleGroupAssignments);
exports.selectVehicleGroupAssignmentsSchema = (0, drizzle_zod_1.createSelectSchema)(exports.vehicleGroupAssignments);
exports.insertVehiclesSchema = (0, drizzle_zod_1.createInsertSchema)(exports.vehicles);
exports.selectVehiclesSchema = (0, drizzle_zod_1.createSelectSchema)(exports.vehicles);
exports.insertVendorOrdersSchema = (0, drizzle_zod_1.createInsertSchema)(exports.vendorOrders);
exports.selectVendorOrdersSchema = (0, drizzle_zod_1.createSelectSchema)(exports.vendorOrders);
exports.insertVendorProductsSchema = (0, drizzle_zod_1.createInsertSchema)(exports.vendorProducts);
exports.selectVendorProductsSchema = (0, drizzle_zod_1.createSelectSchema)(exports.vendorProducts);
exports.insertVendorsSchema = (0, drizzle_zod_1.createInsertSchema)(exports.vendors);
exports.selectVendorsSchema = (0, drizzle_zod_1.createSelectSchema)(exports.vendors);
exports.insertVietnameseReviewTemplatesSchema = (0, drizzle_zod_1.createInsertSchema)(exports.vietnameseReviewTemplates);
exports.selectVietnameseReviewTemplatesSchema = (0, drizzle_zod_1.createSelectSchema)(exports.vietnameseReviewTemplates);
exports.insertWorkersSchema = (0, drizzle_zod_1.createInsertSchema)(exports.workers);
exports.selectWorkersSchema = (0, drizzle_zod_1.createSelectSchema)(exports.workers);
