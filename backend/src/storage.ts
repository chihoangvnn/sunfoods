// @ts-nocheck
import { 
  users, products, customers, orders, orderItems, socialAccounts, chatbotConversations,
  storefrontConfig, storefrontOrders, categories, industries, payments, shopSettings,
  frontendCategoryAssignments,
  productLandingPages, productLandingClicks, productReviews, facebookConversations, facebookMessages, pageTags,
  tiktokBusinessAccounts, tiktokShopOrders, tiktokShopProducts, tiktokVideos,
  contentCategories, contentAssets, scheduledPosts, unifiedTags, contentLibrary,
  contentQueue, queueAutofillSettings, queueHistory,
  facebookApps, facebookWebhookEvents, botSettings, apiConfigurations,
  accountGroups, workers,
  productFaqs, productPolicies, productPolicyAssociations,
  bookCustomers, bookSellers, bookPricingRules, bookSellerInventory, bookMarketingCampaigns, bookCampaignRecipients,
  bookOrders, bookOrderItems,
  marketTrends, competitorProfiles, seasonalRules, pricingStrategies,
  sessions, authUsers, admins, vendors, cookieProfiles,
  customerEvents,
  paymentGatewaySettings, bookPaymentTransactions, sellerPaymentConfigs,
  pushSubscriptions,
  vehicles, trips, driverReports,
  carGroups, vehicleGroupAssignments,
  affiliateProductRequests, affiliateProductAssignments, affiliateOrders, affiliateShareLogs, abebooksSearchHistory, abebooksAccounts, abebooksListings, queueAutoFillSettings, groupAccounts, productFAQs, vendorPushSubscriptions, stockReservations,
  ipPools, ipPoolSessions, ipRotationLogs,
  notifications,
  flashSales,
  preorderProducts,
  type Users, type InsertUsers, type Products, type InsertProducts, 
  type Customers, type InsertCustomers, type Orders, type InsertOrders,
  type OrderItems, type InsertOrderItems, type SocialAccounts, type InsertSocialAccounts,
  type ChatbotConversations, type InsertChatbotConversations,
  type StorefrontConfig, type InsertStorefrontConfig,
  type StorefrontOrders, type InsertStorefrontOrders,
  type Categories, type InsertCategories, type Industries, type InsertIndustries,
  type FrontendCategoryAssignments, type InsertFrontendCategoryAssignments,
  type Payments, type InsertPayments, type ShopSettings, type InsertShopSettings,
  type ProductLandingPages, type InsertProductLandingPages,
  type ProductLandingClicks, type InsertProductLandingClicks,
  type ProductReviews, type InsertProductReviews,
  type ProductPolicies, type InsertProductPolicies,
  type ProductPolicyAssociations, type InsertProductPolicyAssociations,
  type FacebookConversations, type InsertFacebookConversations,
  type FacebookMessages, type InsertFacebookMessages,
  type PageTags, type InsertPageTags, type UnifiedTags, type InsertUnifiedTags,
  type TiktokBusinessAccounts, type InsertTiktokBusinessAccounts,
  type TiktokShopOrders, type InsertTiktokShopOrders,
  type TiktokShopProducts, type InsertTiktokShopProducts,
  type TiktokVideos, type InsertTiktokVideos,
  type ContentCategories, type InsertContentCategories,
  type ContentAssets, type InsertContentAssets,
  type ScheduledPosts, type InsertScheduledPosts,
  type ContentLibraries, type InsertContentLibraries,
  type ContentQueue, type InsertContentQueue,
  type QueueAutofillSettings, type InsertQueueAutofillSettings,
  type QueueHistory, type InsertQueueHistory,
  type FacebookApps, type InsertFacebookApps,
  type FacebookWebhookEvents, type InsertFacebookWebhookEvents,
  type BotSettings, type InsertBotSettings,
  type ApiConfigurations, type InsertApiConfigurations,
  type AccountGroups, type InsertAccountGroups,
  type Worker, type InsertWorker,
  type BookCustomers, type InsertBookCustomers, type BookSellers, type InsertBookSellers,
  type BookPricingRules, type InsertBookPricingRules,
  type BookSellerInventories, type InsertBookSellerInventories,
  type BookMarketingCampaigns, type InsertBookMarketingCampaigns,
  type BookOrders, type InsertBookOrders, type BookOrderItems, type InsertBookOrderItems,
  type MarketTrends, type InsertMarketTrends,
  type CompetitorProfiles, type InsertCompetitorProfiles,
  type SeasonalRules, type InsertSeasonalRules,
  type PricingStrategies, type InsertPricingStrategies,
  type AuthUsers, type InsertAuthUsers,
  type Admins, type InsertAdmins,
  type Vendors, type InsertVendors,
  type CookieProfiles, type InsertCookieProfiles,
  type CustomerEvents, type InsertCustomerEvents,
  type PaymentGatewaySettings, type InsertPaymentGatewaySettings,
  type BookPaymentTransactions, type InsertBookPaymentTransactions,
  type SellerPaymentConfigs, type InsertSellerPaymentConfigs,
  type PushSubscriptions, type InsertPushSubscriptions,
  type CarGroups, type InsertCarGroups,
  type VehicleGroupAssignments, type InsertVehicleGroupAssignments,
  type AffiliateProductRequests, type InsertAffiliateProductRequests,
  type StockReservations, type InsertStockReservations,
  type AffiliateProductAssignments, type InsertAffiliateProductAssignments,
  type AffiliateOrders, type InsertAffiliateOrders,
  type AffiliateShareLogs, type InsertAffiliateShareLogs,
  type AbebooksSearchHistory, type InsertAbebooksSearchHistory,
  type AbebooksAccounts, type InsertAbebooksAccounts,
  type AbebooksListings, type InsertAbebooksListings,
  type AbebooksAccount, type InsertAbebooksAccount,
  type AbebooksListing, type InsertAbebooksListing,
  type QueueAutoFillSettings, type InsertQueueAutoFillSettings,
  type GroupAccounts, type InsertGroupAccounts,
  type ProductFAQ, type InsertProductFAQ,
  type VendorPushSubscriptions, type InsertVendorPushSubscriptions,
  type IpPools, type InsertIpPools,
  type IpPoolSessions, type InsertIpPoolSessions,
  type IpRotationLogs, type InsertIpRotationLogs,
  type Notifications, type InsertNotifications,
  type FlashSales, type InsertFlashSales,
  type PreorderProducts, type InsertPreorderProducts
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, and, count, sum, sql, ilike, or, gte, lte, isNull, isNotNull, inArray } from "drizzle-orm";
import { assignOrderToVendors } from './services/vendor-order-assignment';

export interface IStorage {
  // User methods
  getUser(id: string): Promise<Users | undefined>;
  getUserById(id: string): Promise<Users | undefined>;
  getUserByUsername(username: string): Promise<Users | undefined>;
  createUser(user: InsertUsers): Promise<Users>;

  // Cookie Profile methods
  getCookieProfiles(filters?: {
    userId?: string;
    socialNetwork?: string;
    groupTag?: string;
    isActive?: boolean;
  }, pagination?: {
    limit?: number;
    offset?: number;
  }): Promise<CookieProfiles[]>;
  getCookieProfileById(id: string): Promise<CookieProfiles | undefined>;
  createCookieProfile(profile: InsertCookieProfiles): Promise<CookieProfiles>;
  updateCookieProfile(id: string, profile: Partial<CookieProfiles>): Promise<CookieProfiles | undefined>;
  deleteCookieProfile(id: string): Promise<boolean>;
  getCookieProfileStats(): Promise<{
    totalProfiles: number;
    totalUsers: number;
    profilesByPlatform: { platform: string; count: number }[];
    profilesByGroup: { group: string; count: number }[];
    activeProfiles: number;
    inactiveProfiles: number;
  }>;
  getCookieProfilesCount(filters?: {
    search?: string;
    userId?: string;
    socialNetwork?: string;
    groupTag?: string;
    isActive?: boolean;
  }): Promise<number>;
  getCookieProfilesModifiedAfter(timestamp: string, filters?: {
    userId?: string;
    socialNetwork?: string;
    modifiedAfter?: Date;
  }, pagination?: {
    limit?: number;
    offset?: number;
  }): Promise<CookieProfiles[]>;
  getLastSyncTimestamp(userId?: string): Promise<string | null>;
  getAuthUsers(): Promise<AuthUsers[]>;
  validateUsersBatch(userIds: string[]): Promise<Set<string>>;
  getCookieProfilesByCompositeKeys(keys: Array<{
    userId: string;
    socialNetwork: string;
    groupTag: string;
    accountName: string;
  }>): Promise<Map<string, CookieProfiles>>;

  // 🔐 Auth methods (Replit Auth integration)
  getAuthUser(id: string): Promise<AuthUsers | undefined>;
  getAuthUserByEmail(email: string): Promise<AuthUsers | undefined>;
  createAuthUser(user: InsertAuthUsers): Promise<AuthUsers>;
  updateAuthUser(id: string, user: Partial<InsertAuthUsers>): Promise<AuthUsers | undefined>;
  deleteAuthUser(id: string): Promise<boolean>;
  linkCustomerToAuthUser(customerId: string, authUserId: string): Promise<Customers | undefined>;
  getCustomerByAuthUser(authUserId: string): Promise<Customers | undefined>;
  getCustomerByFacebookId(facebookId: string): Promise<Customers | undefined>;
  getCustomerByPhone(phone: string): Promise<Customers | undefined>;
  getCustomerByPSID(psid: string): Promise<Customers | null>;
  getCustomerByAffiliateCode(affiliateCode: string): Promise<Customers | undefined>;
  getOrdersByCustomerId(customerId: string, limit?: number): Promise<Orders[]>;
  getOrderItemsByOrderIds(orderIds: string[]): Promise<OrderItems[]>;
  getProductsByIds(productIds: string[]): Promise<Products[]>;
  getCategoriesByIds(categoryIds: string[]): Promise<Categories[]>;

  // 🔐 Admin Authentication methods (Role-based access control)
  getAdmins(): Promise<Admins[]>;
  getAdminById(id: string): Promise<Admins | undefined>;
  getAdminByEmail(email: string): Promise<Admins | undefined>;
  createAdmin(admin: InsertAdmins): Promise<Admins>;
  updateAdmin(id: string, admin: Partial<Admins>): Promise<Admins | undefined>;
  deleteAdmin(id: string): Promise<boolean>;
  updateAdminLastLogin(id: string): Promise<Admins | undefined>;

  // 🔐 Vendor Authentication methods
  getVendors(): Promise<Vendors[]>;
  getVendorById(id: string): Promise<Vendors | undefined>;
  getVendorByEmail(email: string): Promise<Vendors | undefined>;
  createVendor(vendor: InsertVendors): Promise<Vendors>;
  updateVendor(id: string, vendor: Partial<InsertVendors>): Promise<Vendors | undefined>;
  updateVendorLastLogin(id: string): Promise<Vendors | undefined>;

  // 📱 Vendor Push Subscriptions methods
  getVendorPushSubscriptions(vendorId: string): Promise<VendorPushSubscriptions[]>;
  getVendorPushSubscriptionById(id: string): Promise<VendorPushSubscriptions | undefined>;
  createVendorPushSubscription(subscription: InsertVendorPushSubscriptions): Promise<VendorPushSubscriptions>;
  deleteVendorPushSubscription(id: string): Promise<boolean>;
  markVendorPushSubscriptionInactive(id: string): Promise<void>;
  updateVendorLastNotifiedAt(vendorId: string): Promise<void>;

  // Industry methods
  getIndustries(): Promise<Industries[]>;
  getIndustry(id: string): Promise<Industries | undefined>;
  createIndustry(industry: InsertIndustries): Promise<Industries>;
  updateIndustry(id: string, industry: Partial<InsertIndustries>): Promise<Industries | undefined>;
  deleteIndustry(id: string): Promise<boolean>;

  // Category methods
  getCategories(industryId?: string): Promise<Categories[]>;
  getCategory(id: string): Promise<Categories | undefined>;
  createCategory(category: InsertCategories): Promise<Categories>;
  updateCategory(id: string, category: Partial<InsertCategories>): Promise<Categories | undefined>;
  deleteCategory(id: string): Promise<boolean>;

  // Frontend Category Assignment methods
  getFrontendCategoryAssignments(): Promise<FrontendCategoryAssignments[]>;
  getFrontendCategoryAssignmentsByFrontend(frontendId: string): Promise<FrontendCategoryAssignments[]>;
  createFrontendCategoryAssignment(assignment: InsertFrontendCategoryAssignments): Promise<FrontendCategoryAssignments>;
  updateFrontendCategoryAssignment(id: string, assignment: Partial<InsertFrontendCategoryAssignments>): Promise<FrontendCategoryAssignments | undefined>;
  deleteFrontendCategoryAssignment(id: string): Promise<boolean>;

  // Dynamic Category Filtering methods
  getCategoriesForFrontend(frontendId: string, isLocalCustomer?: boolean): Promise<Categories[]>;
  getProductsForFrontend(frontendId: string, isLocalCustomer?: boolean, limit?: number, search?: string, offset?: number): Promise<Products[]>;

  // Product methods
  getProducts(limit?: number, categoryId?: string, search?: string, offset?: number, sortBy?: string, sortOrder?: string): Promise<Products[]>;
  getProduct(id: string): Promise<Products | undefined>;
  getProductBySKU(sku: string): Promise<Products | undefined>;
  getProductBySlug(slug: string): Promise<Products | undefined>;
  getProductsWithoutSKU(): Promise<Products[]>;
  createProduct(product: InsertProducts): Promise<Products>;
  updateProduct(id: string, product: Partial<InsertProducts>): Promise<Products | undefined>;
  deleteProduct(id: string): Promise<boolean>;
  getProductsWithCategory(limit?: number, categoryId?: string, search?: string, offset?: number): Promise<(Products & { categoryName?: string })[]>;

  // 💎 VIP System methods
  getVipProducts(limit?: number, search?: string, offset?: number): Promise<Products[]>;
  getVipCategories(): Promise<Categories[]>;
  updateProductVipStatus(id: string, isVipOnly: boolean): Promise<Products | undefined>;
  updateCategoryVipStatus(id: string, isVipOnly: boolean): Promise<Categories | undefined>;

  // 🚗 Driver System methods
  getDriverVehicles(driverId: string): Promise<any[]>;
  getDriverTrips(driverId: string, status?: string, limit?: number): Promise<any[]>;
  getDriverTripById(tripId: string): Promise<any | undefined>;
  createVehicle(vehicle: any): Promise<any>;
  createTrip(trip: any): Promise<any>;
  updateTripStatus(tripId: string, status: string, actualArrivalTime?: Date): Promise<any | undefined>;
  updateTrip(tripId: string, trip: Partial<any>): Promise<any | undefined>;

  // 🚙 Vehicle CRUD methods
  getVehicles(filters?: { driverId?: string; status?: string; isVerified?: boolean }, pagination?: { limit?: number; offset?: number }): Promise<any[]>;
  getVehicle(id: string): Promise<any | undefined>;
  updateVehicle(id: string, vehicle: Partial<any>): Promise<any | undefined>;
  deleteVehicle(id: string): Promise<boolean>;

  // Customer methods
  getCustomers(limit?: number): Promise<(Customers & { totalOrders: number; totalSpent: number; lastOrderDate: string; totalDebt: string; creditLimit: string })[]>;
  getLocalCustomers(limit?: number): Promise<(Customers & { totalOrders: number; totalSpent: number; lastOrderDate: string; totalDebt: string; creditLimit: string })[]>;
  getCustomer(id: string): Promise<(Customers & { totalDebt: string; creditLimit: string }) | undefined>;
  createCustomer(customer: InsertCustomers): Promise<Customers>;
  updateCustomer(id: string, customer: Partial<InsertCustomers>): Promise<Customers | undefined>;
  updateCustomerMembership(params: {
    customerId: string;
    totalSpent: string;
    pointsBalance: number;
    pointsEarned: number;
    membershipTier: string;
    lastTierUpdate?: Date | null;
    membershipData?: any;
  }): Promise<Customers | undefined>;
  deleteCustomer(id: string): Promise<boolean>;
  getCustomerRecentAddress(customerId: string): Promise<string | null>;
  
  // Customer analytics methods for POS suggestions
  searchCustomers(searchTerm: string, limit?: number): Promise<(Customers & { totalOrders: number; totalSpent: number; lastOrderDate: string; totalDebt: string; creditLimit: string })[]>;
  getRecentCustomers(limit?: number): Promise<(Customers & { totalOrders: number; totalSpent: number; lastOrderDate: string; totalDebt: string; creditLimit: string })[]>;
  getVipCustomers(limit?: number): Promise<(Customers & { totalOrders: number; totalSpent: number; lastOrderDate: string; totalDebt: string; creditLimit: string })[]>;
  getFrequentCustomers(limit?: number): Promise<(Customers & { totalOrders: number; totalSpent: number; lastOrderDate: string; totalDebt: string; creditLimit: string })[]>;

  // 📊 Customer Events Tracking
  trackCustomerEvent(event: InsertCustomerEvents): Promise<CustomerEvents>;
  getCustomerEvents(customerId: string, limit?: number): Promise<CustomerEvents[]>;
  getCustomerEventsByType(customerId: string, eventType: string, limit?: number): Promise<CustomerEvents[]>;
  updateCustomerSummary(customerId: string): Promise<Customers | undefined>;

  // 🔔 Notifications methods
  getNotifications(customerId: string): Promise<Notifications[]>;
  createNotification(notification: InsertNotifications): Promise<Notifications>;
  markNotificationsAsRead(notificationIds: string[], customerId: string): Promise<void>;
  deleteNotification(id: string, customerId: string): Promise<boolean>;

  // 🔥 Flash Sales methods
  getFlashSales(limit?: number, offset?: number): Promise<FlashSales[]>;
  getFlashSaleById(id: string): Promise<FlashSales | undefined>;
  getFlashSaleBySlug(slug: string): Promise<(FlashSales & { product: Products }) | undefined>;
  getActiveFlashSales(): Promise<(FlashSales & { product: Products })[]>;
  createFlashSale(data: InsertFlashSales): Promise<FlashSales>;
  updateFlashSale(id: string, data: Partial<InsertFlashSales>): Promise<FlashSales | undefined>;
  deleteFlashSale(id: string): Promise<boolean>;

  // 📦 Pre-orders methods
  getPreorders(limit?: number, offset?: number): Promise<PreorderProducts[]>;
  getPreorderById(id: string): Promise<PreorderProducts | undefined>;
  getPreorderBySlug(slug: string): Promise<PreorderProducts & { product?: Products }>;
  getActivePreorders(): Promise<(PreorderProducts & { product?: Products })[]>;
  createPreorder(data: InsertPreorderProducts): Promise<PreorderProducts>;
  updatePreorder(id: string, data: Partial<InsertPreorderProducts>): Promise<PreorderProducts | undefined>;
  deletePreorder(id: string): Promise<boolean>;

  // Order methods
  getOrders(limit?: number): Promise<(Orders & { customerName: string; customerEmail: string })[]>;
  getOrder(id: string): Promise<Orders | undefined>;
  getOrderWithDetails(id: string): Promise<(Orders & { customerName: string; customerEmail: string; orderItems: (OrderItems & { productName: string })[] }) | undefined>;
  createOrder(order: InsertOrders): Promise<Orders>;
  updateOrder(id: string, order: Partial<InsertOrders>): Promise<Orders | undefined>;
  updateOrderStatus(id: string, status: string): Promise<Orders | undefined>;
  deleteOrder(id: string): Promise<boolean>;

  // Order items methods
  getOrderItems(orderId: string): Promise<OrderItems[]>;
  createOrderItem(orderItem: InsertOrderItems): Promise<OrderItems>;
  deleteOrderItem(id: string): Promise<boolean>;

  // Debt management methods
  updateCustomerDebt(customerId: string, paymentAmount: number): Promise<Customers | undefined>;
  getCustomerDebtInfo(customerId: string): Promise<{ totalDebt: number; creditLimit: number } | undefined>;

  // Social account methods
  getSocialAccounts(): Promise<SocialAccounts[]>;
  getSocialAccount(id: string): Promise<SocialAccounts | undefined>;
  getSocialAccountById(id: string): Promise<SocialAccounts | undefined>;
  getSocialAccountByPlatform(platform: string): Promise<SocialAccounts | undefined>;
  getSocialAccountsByPlatform(platform: string): Promise<SocialAccounts[]>;
  createSocialAccount(account: InsertSocialAccounts): Promise<SocialAccounts>;
  
  // Account Groups methods
  getAccountGroups(): Promise<any[]>;
  getGroupAccounts(groupId: string): Promise<SocialAccounts[]>;

  // Page tag methods
  getPageTags(): Promise<PageTags[]>;
  getPageTag(id: string): Promise<PageTags | undefined>;
  createPageTag(tag: InsertPageTags): Promise<PageTags>;
  updatePageTag(id: string, tag: Partial<InsertPageTags>): Promise<PageTags | undefined>;
  deletePageTag(id: string): Promise<boolean>;
  
  // Unified tag methods (Cross-platform tag system)
  getUnifiedTags(): Promise<UnifiedTags[]>;
  getUnifiedTag(id: string): Promise<UnifiedTags | undefined>;
  createUnifiedTag(tag: InsertUnifiedTags): Promise<UnifiedTags>;
  updateUnifiedTag(id: string, tag: Partial<InsertUnifiedTags>): Promise<UnifiedTags | undefined>;
  deleteUnifiedTag(id: string): Promise<boolean>;

  // TikTok Business Account methods
  getTikTokBusinessAccounts(): Promise<TiktokBusinessAccounts[]>;
  getTikTokBusinessAccount(id: string): Promise<TiktokBusinessAccounts | undefined>;
  getTikTokBusinessAccountByBusinessId(businessId: string): Promise<TiktokBusinessAccounts | undefined>;
  createTikTokBusinessAccount(account: InsertTiktokBusinessAccounts): Promise<TiktokBusinessAccounts>;
  updateTikTokBusinessAccount(id: string, account: Partial<InsertTiktokBusinessAccounts>): Promise<TiktokBusinessAccounts | undefined>;
  deleteTikTokBusinessAccount(id: string): Promise<boolean>;

  // Facebook Apps methods
  getAllFacebookApps(): Promise<FacebookApps[]>;
  getFacebookAppById(id: string): Promise<FacebookApps | undefined>;
  getFacebookAppByAppId(appId: string): Promise<FacebookApps | undefined>;
  createFacebookApp(app: InsertFacebookApps): Promise<FacebookApps>;
  updateFacebookApp(id: string, app: Partial<InsertFacebookApps>): Promise<FacebookApps | undefined>;
  deleteFacebookApp(id: string): Promise<boolean>;

  // TikTok Shop Order methods
  getTikTokShopOrders(limit?: number): Promise<TiktokShopOrders[]>;
  getTikTokShopOrder(id: string): Promise<TiktokShopOrders | undefined>;
  getTikTokShopOrderByTikTokId(tiktokOrderId: string): Promise<TiktokShopOrders | undefined>;
  createTikTokShopOrder(order: InsertTiktokShopOrders): Promise<TiktokShopOrders>;
  updateTikTokShopOrder(id: string, order: Partial<InsertTiktokShopOrders>): Promise<TiktokShopOrders | undefined>;
  deleteTikTokShopOrder(id: string): Promise<boolean>;

  // TikTok Shop Product methods
  getTikTokShopProducts(): Promise<TiktokShopProducts[]>;
  getTikTokShopProduct(id: string): Promise<TiktokShopProducts | undefined>;
  getTikTokShopProductByTikTokId(tiktokProductId: string): Promise<TiktokShopProducts | undefined>;
  createTikTokShopProduct(product: InsertTiktokShopProducts): Promise<TiktokShopProducts>;
  updateTikTokShopProduct(id: string, product: Partial<InsertTiktokShopProducts>): Promise<TiktokShopProducts | undefined>;
  deleteTikTokShopProduct(id: string): Promise<boolean>;

  // TikTok Video methods
  getTikTokVideos(businessAccountId?: string): Promise<TiktokVideos[]>;
  getTikTokVideo(id: string): Promise<TiktokVideos | undefined>;
  getTikTokVideoByVideoId(videoId: string): Promise<TiktokVideos | undefined>;
  createTikTokVideo(video: InsertTiktokVideos): Promise<TiktokVideos>;
  updateTikTokVideo(id: string, video: Partial<InsertTiktokVideos>): Promise<TiktokVideos | undefined>;
  deleteTikTokVideo(id: string): Promise<boolean>;
  updateSocialAccount(id: string, account: Partial<InsertSocialAccounts>): Promise<SocialAccounts | undefined>;
  getSocialAccountByPageId(pageId: string): Promise<SocialAccounts | undefined>;
  
  // 🤖 Bot Config methods
  getSocialAccountBotConfig(id: string): Promise<any | null>;
  updateSocialAccountBotConfig(id: string, botConfig: any): Promise<SocialAccounts | undefined>;

  // Facebook Management methods
  getPageTags(): Promise<PageTags[]>;
  getPageTag(id: string): Promise<PageTags | undefined>;
  createPageTag(tag: InsertPageTags): Promise<PageTags>;
  updatePageTag(id: string, tag: Partial<InsertPageTags>): Promise<PageTags | undefined>;
  deletePageTag(id: string): Promise<boolean>;

  // Facebook Conversations
  getFacebookConversations(pageId?: string, limit?: number): Promise<FacebookConversations[]>;
  getFacebookConversation(id: string): Promise<FacebookConversations | undefined>;
  getFacebookConversationByParticipant(pageId: string, participantId: string): Promise<FacebookConversations | undefined>;
  createFacebookConversation(conversation: InsertFacebookConversations): Promise<FacebookConversations>;
  updateFacebookConversation(id: string, conversation: Partial<InsertFacebookConversations>): Promise<FacebookConversations | undefined>;

  // Facebook Messages
  getFacebookMessages(conversationId: string, limit?: number): Promise<FacebookMessages[]>;
  createFacebookMessage(message: InsertFacebookMessages): Promise<FacebookMessages>;
  markConversationAsRead(conversationId: string): Promise<boolean>;

  // Chatbot methods
  getChatbotConversations(limit?: number): Promise<ChatbotConversations[]>;
  getChatbotConversation(id: string): Promise<ChatbotConversations | undefined>;
  getChatbotConversationBySession(sessionId: string): Promise<ChatbotConversations | undefined>;
  getChatbotConversationByCustomer(customerId: string): Promise<ChatbotConversations | undefined>;
  createChatbotConversation(conversation: InsertChatbotConversations): Promise<ChatbotConversations>;
  updateChatbotConversation(id: string, conversation: Partial<InsertChatbotConversations>): Promise<ChatbotConversations | undefined>;
  addMessageToChatbotConversation(conversationId: string, message: any): Promise<ChatbotConversations | undefined>;
  getChatbotMessages(conversationId: string): Promise<any[]>;

  // Bot Settings methods
  getBotSettings(): Promise<BotSettings | undefined>;
  createBotSettings(settings: InsertBotSettings): Promise<BotSettings>;
  updateBotSettings(id: string, settings: Partial<InsertBotSettings>): Promise<BotSettings | undefined>;
  getBotSettingsOrDefault(): Promise<BotSettings>;

  // API Management methods
  getApiConfigurations(): Promise<ApiConfigurations[]>;
  getApiConfiguration(id: string): Promise<ApiConfigurations | undefined>;
  getApiConfigurationByEndpoint(endpoint: string, method?: string): Promise<ApiConfigurations | undefined>;
  getApiConfigurationsByCategory(category: string): Promise<ApiConfigurations[]>;
  createApiConfiguration(config: InsertApiConfigurations): Promise<ApiConfigurations>;
  updateApiConfiguration(id: string, config: Partial<ApiConfigurations>): Promise<ApiConfigurations | undefined>;
  deleteApiConfiguration(id: string): Promise<boolean>;
  toggleApiEnabled(id: string, enabled: boolean): Promise<ApiConfigurations | undefined>;
  incrementApiAccess(id: string, responseTime?: number): Promise<void>;
  incrementApiError(id: string): Promise<void>;
  getEnabledApiConfigurations(): Promise<ApiConfigurations[]>;
  updateApiStats(id: string, stats: { accessCount?: number; errorCount?: number; avgResponseTime?: number }): Promise<void>;

  // Dashboard stats
  getDashboardStats(): Promise<{
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    totalProducts: number;
  }>;

  // Storefront methods
  getStorefrontConfigs(): Promise<StorefrontConfig[]>;
  getStorefrontConfig(id: string): Promise<StorefrontConfig | undefined>;
  getStorefrontConfigByName(name: string): Promise<StorefrontConfig | undefined>;
  createStorefrontConfig(config: InsertStorefrontConfig): Promise<StorefrontConfig>;
  updateStorefrontConfig(id: string, config: Partial<InsertStorefrontConfig>): Promise<StorefrontConfig | undefined>;
  getTopProductsForStorefront(configId: string): Promise<Products[]>;
  getStorefrontOrders(configId?: string, limit?: number): Promise<StorefrontOrders[]>;
  getStorefrontOrder(id: string): Promise<StorefrontOrders | undefined>;
  createStorefrontOrder(order: InsertStorefrontOrders): Promise<StorefrontOrders>;
  updateStorefrontOrderStatus(id: string, status: string): Promise<StorefrontOrders | undefined>;
  
  // Affiliate-specific storefront order methods
  getStorefrontOrdersByAffiliateCode(affiliateCode: string, limit?: number): Promise<StorefrontOrders[]>;
  getStorefrontOrdersByAffiliateCodeAndDateRange(affiliateCode: string, startDate: Date, endDate: Date): Promise<StorefrontOrders[]>;
  getStorefrontOrdersByAffiliateCodeWithFilters(filters: any, limit?: number, offset?: number): Promise<StorefrontOrders[]>;
  getStorefrontOrdersCountByAffiliateCode(affiliateCode: string, filters?: any): Promise<number>;
  getCustomerByEmail(email: string): Promise<Customers | undefined>;

  // Inventory methods for RASA API
  getProductStock(productId: string): Promise<number>;
  updateProductStock(productId: string, newStock: number): Promise<void>;

  // Payment methods
  getPayment(orderId: string): Promise<Payments | undefined>;
  createPayment(payment: InsertPayments): Promise<Payments>;
  updatePaymentStatus(id: string, status: string, transactionId?: string): Promise<Payments | undefined>;

  // Shop settings methods
  getShopSettings(): Promise<ShopSettings | undefined>; // Get default shop settings
  getAllShopSettings(): Promise<ShopSettings[]>; // Get all shop settings
  getShopSettingsById(id: string): Promise<ShopSettings | undefined>;
  getDefaultShopSettings(): Promise<ShopSettings | undefined>;
  createShopSettings(settings: InsertShopSettings): Promise<ShopSettings>;
  updateShopSettings(id: string, settings: Partial<InsertShopSettings>): Promise<ShopSettings | undefined>;
  deleteShopSettings(id: string): Promise<boolean>;
  setDefaultShopSettings(id: string): Promise<ShopSettings | undefined>;

  // Product Landing Page methods
  getAllProductLandingPages(): Promise<ProductLandingPages[]>;
  getProductLandingPageById(id: string): Promise<ProductLandingPages | undefined>;
  getProductLandingPageBySlug(slug: string): Promise<ProductLandingPages | undefined>;
  createProductLandingPage(data: InsertProductLandingPages): Promise<ProductLandingPages>;
  updateProductLandingPage(id: string, data: Partial<InsertProductLandingPages>): Promise<ProductLandingPages | undefined>;
  deleteProductLandingPage(id: string): Promise<boolean>;
  incrementLandingPageView(id: string): Promise<void>;
  incrementLandingPageOrder(id: string): Promise<void>;
  getProductLandingPageWithDetails(idOrSlug: string): Promise<any>;

  // Product Landing Click Tracking methods
  createProductLandingClick(data: InsertProductLandingClicks): Promise<ProductLandingClicks>;
  getProductLandingClickByCookie(trackingCookie: string): Promise<ProductLandingClicks | undefined>;
  updateProductLandingClickConversion(clickId: number, orderId: string, conversionValue: string): Promise<void>;

  // Product Review methods
  getProductReviews(productId: string, limit?: number): Promise<ProductReviews[]>;
  getProductReviewsWithStats(productId: string): Promise<{ reviews: ProductReviews[]; averageRating: number; totalReviews: number; ratingCounts: { [key: number]: number } }>;
  createProductReview(review: InsertProductReviews): Promise<ProductReviews>;
  updateProductReview(id: string, review: Partial<InsertProductReviews>): Promise<ProductReviews | undefined>;
  deleteProductReview(id: string): Promise<boolean>;
  incrementHelpfulCount(id: string): Promise<boolean>;

  // Product FAQ methods
  getProductFAQs(productId: string, includeInactive?: boolean): Promise<ProductFAQ[]>;
  getProductFAQ(id: string): Promise<ProductFAQ | undefined>;
  createProductFAQ(faq: InsertProductFAQ): Promise<ProductFAQ>;
  updateProductFAQ(id: string, faq: Partial<InsertProductFAQ>): Promise<ProductFAQ | undefined>;
  deleteProductFAQ(id: string): Promise<boolean>;
  updateProductFAQOrder(productId: string, faqIds: string[]): Promise<boolean>;

  // Product Policy methods
  getProductPolicies(): Promise<ProductPolicies[]>;
  getProductPolicy(id: string): Promise<ProductPolicies | undefined>;
  createProductPolicy(policy: InsertProductPolicies): Promise<ProductPolicies>;
  updateProductPolicy(id: string, policy: Partial<InsertProductPolicies>): Promise<ProductPolicies | undefined>;
  deleteProductPolicy(id: string): Promise<boolean>;

  // Product Policy Association methods
  getProductPolicyAssociations(productId: string): Promise<(ProductPolicyAssociations & { policy: ProductPolicies })[]>;
  addProductPolicyAssociation(productId: string, policyId: string, sortOrder?: number): Promise<ProductPolicyAssociations>;
  removeProductPolicyAssociation(productId: string, policyId: string): Promise<boolean>;
  updateProductPolicyAssociationOrder(productId: string, policyIds: string[]): Promise<boolean>;

  // Content Library methods
  getContentLibraryItems(filters?: { tags?: string[]; status?: string; contentType?: string; priority?: string }): Promise<ContentLibraries[]>;
  getContentLibraryItem(id: string): Promise<ContentLibraries | undefined>;
  createContentLibraryItem(item: InsertContentLibraries): Promise<ContentLibraries>;
  updateContentLibraryItem(id: string, item: Partial<ContentLibraries>): Promise<ContentLibraries | undefined>;
  deleteContentLibraryItem(id: string): Promise<boolean>;
  incrementContentUsage(id: string): Promise<void>;
  addAIVariation(id: string, variation: { content: string; tone: string; style: string }): Promise<ContentLibraries | undefined>;
  getContentLibraryByTags(tagIds: string[]): Promise<ContentLibraries[]>;
  getContentLibraryByPriority(priority: string): Promise<ContentLibraries[]>;

  // Content Queue methods
  getQueueItems(filters?: { status?: string; targetGroupId?: string; autoFill?: boolean; priority?: number }): Promise<ContentQueue[]>;
  getQueueItem(id: string): Promise<ContentQueue | undefined>;
  createQueueItem(item: InsertContentQueue): Promise<ContentQueue>;
  updateQueueItem(id: string, item: Partial<InsertContentQueue>): Promise<ContentQueue | undefined>;
  deleteQueueItem(id: string): Promise<boolean>;
  updateQueuePosition(id: string, newPosition: number): Promise<ContentQueue | undefined>;
  reorderQueue(itemIds: string[]): Promise<boolean>;
  getNextQueueItems(limit: number, targetType?: string): Promise<ContentQueue[]>;
  
  // Queue Auto-fill Settings methods
  getQueueAutoFillSettings(): Promise<QueueAutoFillSettings | undefined>;
  updateQueueAutoFillSettings(settings: Partial<InsertQueueAutoFillSettings>): Promise<QueueAutoFillSettings>;
  
  // Queue History methods
  getQueueHistory(queueItemId?: string, limit?: number): Promise<QueueHistory[]>;
  createQueueHistory(history: InsertQueueHistory): Promise<QueueHistory>;

  // Worker methods
  getWorkers(): Promise<Worker[]>;
  getWorker(id: string): Promise<Worker | undefined>;
  getWorkerByWorkerId(workerId: string): Promise<Worker | undefined>;
  createWorker(worker: InsertWorker): Promise<Worker>;
  updateWorker(id: string, worker: Partial<InsertWorker>): Promise<Worker | undefined>;
  deleteWorker(id: string): Promise<boolean>;
  updateWorkerStatus(workerId: string, isOnline: boolean, lastPingAt?: Date): Promise<Worker | undefined>;

  // AbeBooks methods
  getAbebooksAccounts(): Promise<AbebooksAccount[]>;
  getAbebooksAccount(id: string): Promise<AbebooksAccount | undefined>;
  getDefaultAbebooksAccount(): Promise<AbebooksAccount | undefined>;
  createAbebooksAccount(account: InsertAbebooksAccount): Promise<AbebooksAccount>;
  updateAbebooksAccount(id: string, account: Partial<InsertAbebooksAccount>): Promise<AbebooksAccount | undefined>;
  trackAbebooksAccountUsage(accountId: string): Promise<AbebooksAccount | undefined>;
  
  getAbebooksListings(bookIsbn?: string, accountId?: string): Promise<AbebooksListing[]>;
  getAbebooksListing(id: string): Promise<AbebooksListing | undefined>;
  createAbebooksListing(listing: InsertAbebooksListing): Promise<AbebooksListing>;
  updateAbebooksListing(id: string, listing: Partial<InsertAbebooksListing>): Promise<AbebooksListing | undefined>;
  deleteAbebooksListing(id: string): Promise<boolean>;
  
  getAbebooksSearchHistory(accountId?: string, limit?: number): Promise<AbebooksSearchHistory[]>;
  createAbebooksSearchHistory(history: InsertAbebooksSearchHistory): Promise<AbebooksSearchHistory>;

  // 📚 Book Orders & Sellers Integration methods
  getBookOrders(filters?: { status?: string; sellerId?: string; limit?: number; offset?: number }): Promise<BookOrders[]>;
  getBookOrder(id: string): Promise<BookOrders | undefined>;
  createBookOrder(order: InsertBookOrders): Promise<BookOrders>;
  updateBookOrder(id: string, order: Partial<InsertBookOrders>): Promise<BookOrders | undefined>;
  updateBookOrderStatus(id: string, status: string): Promise<BookOrders | undefined>;
  getBookOrdersBySellerId(sellerId: string, limit?: number): Promise<BookOrders[]>;
  updateSellerInventoryFromOrder(orderId: string, action: 'reserve' | 'allocate' | 'release' | 'ship'): Promise<boolean>;
  calculateSellerCommission(orderId: string): Promise<{ success: boolean; commission: number; message: string }>;
  getSellerPerformanceMetrics(sellerId: string): Promise<{
    totalSales: number;
    totalOrders: number;
    avgCommission: number;
    totalCommissionEarned: number;
    avgRating: number;
    totalBooks: number;
    topSellingBooks: Array<{ productId: string; productName: string; totalSold: number; revenue: number }>;
    monthlyStats: Array<{ month: string; orders: number; sales: number; commission: number }>;
  }>;
  updateSellerRating(sellerId: string, rating: number, feedback?: string): Promise<BookSellers | undefined>;
  getBookOrdersBySellerAndStatus(sellerId: string, status: string): Promise<BookOrders[]>;
  allocateInventoryForOrder(orderId: string): Promise<boolean>;
  releaseInventoryForOrder(orderId: string): Promise<boolean>;
  getSellerInventoryBySellerId(sellerId: string): Promise<BookSellerInventories[]>;
  updateSellerPerformanceStats(sellerId: string, orderTotal: number, commission: number): Promise<BookSellers | undefined>;
  
  // 🔔 Push Notification Subscription methods
  getPushSubscriptionsByCustomer(customerId: string): Promise<PushSubscriptions[]>;
  getPushSubscription(id: string): Promise<PushSubscriptions | undefined>;
  getPushSubscriptionByEndpoint(endpoint: string): Promise<PushSubscriptions | undefined>;
  createPushSubscription(subscription: InsertPushSubscriptions): Promise<PushSubscriptions>;
  updatePushSubscription(id: string, subscription: Partial<InsertPushSubscriptions>): Promise<PushSubscriptions | undefined>;
  deletePushSubscription(id: string): Promise<boolean>;

  // 💎 VIP Management methods (Admin)
  getVIPMembers(filters?: { status?: string; membershipTier?: string; limit?: number; offset?: number }): Promise<Customers[]>;
  getVIPDashboardStats(): Promise<{
    totalVIPs: number;
    pendingVIPs: number;
    activeVIPs: number;
    suspendedVIPs: number;
    tierBreakdown: Array<{ tier: string; count: number }>;
    totalRevenue: number;
    monthlyGrowth: number;
  }>;
  approvePendingVIP(customerId: string, membershipTier?: string): Promise<Customers | undefined>;
  toggleVIPStatus(customerId: string, status: 'active' | 'suspended'): Promise<Customers | undefined>;
  rejectVIPApplication(customerId: string, reason?: string): Promise<Customers | undefined>;
  getVIPProducts(): Promise<Products[]>;
  bulkAssignVIPByCategory(categoryId: string, isVipOnly: boolean, requiredVipTier?: string | null): Promise<{ updatedCount: number }>;

  // 🚗 Driver Management methods (Admin)
  getDriverMembers(filters?: { status?: string; limit?: number; offset?: number }): Promise<Customers[]>;
  getDriverDashboardStats(): Promise<{
    totalDrivers: number;
    pendingDrivers: number;
    activeDrivers: number;
    suspendedDrivers: number;
    totalDeliveries: number;
    totalRevenue: number;
  }>;
  approvePendingDriver(customerId: string): Promise<Customers | undefined>;
  toggleDriverStatus(customerId: string, status: 'active' | 'suspended'): Promise<Customers | undefined>;
  rejectDriverApplication(customerId: string, reason?: string): Promise<Customers | undefined>;

  // 🏪 Shop Settings methods
  getShopSettings(): Promise<ShopSettings | undefined>; // Get default shop settings (isDefault=true)
  getShopSettingsById(id: string): Promise<ShopSettings | undefined>;
  createShopSettings(data: InsertShopSettings): Promise<ShopSettings>;
  updateShopSettings(id: string, data: Partial<InsertShopSettings>): Promise<ShopSettings | undefined>;

  // IP Pool Management Methods
  createIpPool(data: InsertIpPools): Promise<IpPools>;
  getIpPool(id: string): Promise<IpPools | undefined>;
  getIpPools(filters?: { type?: string; status?: string; isEnabled?: boolean }): Promise<IpPools[]>;
  updateIpPool(id: string, data: Partial<IpPools>): Promise<IpPools | undefined>;
  deleteIpPool(id: string): Promise<boolean>;
  
  // IP Pool Session Methods
  createIpPoolSession(data: InsertIpPoolSessions): Promise<IpPoolSessions>;
  getIpPoolSession(id: string): Promise<IpPoolSessions | undefined>;
  getIpPoolSessionsByPoolId(poolId: string): Promise<IpPoolSessions[]>;
  updateIpPoolSession(id: string, data: Partial<IpPoolSessions>): Promise<IpPoolSessions | undefined>;
  
  // IP Rotation Log Methods
  createIpRotationLog(data: InsertIpRotationLogs): Promise<IpRotationLogs>;
  getIpRotationLogs(poolId?: string, limit?: number): Promise<IpRotationLogs[]>;
  
  // Missing methods
  getUserById(id: string): Promise<Users | undefined>;
  getPageTag(id: string): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<Users | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<Users | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUsers): Promise<Users> {
    const [user] = await db.insert(users).values(insertUser as any).returning();
    return user;
  }

  // 🔐 Auth methods implementation (Replit Auth integration)
  async getAuthUser(id: string): Promise<AuthUsers | undefined> {
    const [authUser] = await db.select().from(authUsers).where(eq(authUsers.id, id));
    return authUser || undefined;
  }

  async getAuthUserByEmail(email: string): Promise<AuthUsers | undefined> {
    if (!email) return undefined;
    const [authUser] = await db.select().from(authUsers).where(eq(authUsers.email, email));
    return authUser || undefined;
  }

  async createAuthUser(user: InsertAuthUsers): Promise<AuthUsers> {
    const [authUser] = await db.insert(authUsers).values(user as any).returning();
    return authUser;
  }

  async updateAuthUser(id: string, user: Partial<InsertAuthUsers>): Promise<AuthUsers | undefined> {
    const [updatedUser] = await db
      .update(authUsers)
      .set({ ...user, updatedAt: new Date() })
      .where(eq(authUsers.id, id))
      .returning();
    return updatedUser || undefined;
  }

  async deleteAuthUser(id: string): Promise<boolean> {
    const result = await db.delete(authUsers).where(eq(authUsers.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async linkCustomerToAuthUser(customerId: string, authUserId: string): Promise<Customers | undefined> {
    const [updatedCustomer] = await db
      .update(customers)
      .set({ authUserId: authUserId })
      .where(eq(customers.id, customerId))
      .returning();
    return updatedCustomer || undefined;
  }

  async getCustomerByAuthUser(authUserId: string): Promise<Customers | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.authUserId, authUserId));
    return customer || undefined;
  }

  async getCustomerByFacebookId(facebookId: string): Promise<Customers | undefined> {
    const [customer] = await db
      .select()
      .from(customers)
      .where(sql`${customers.socialData}->>'facebookId' = ${facebookId}`);
    return customer || undefined;
  }

  async getCustomerByPhone(phone: string): Promise<Customers | undefined> {
    // Import phone normalizer
    const { normalizePhoneToE164 } = await import('./utils/phone-normalizer');
    
    // Normalize incoming phone to Vietnam local format (0xxxxxxxxx)
    const normalizedPhone = normalizePhoneToE164(phone);
    
    if (!normalizedPhone) return undefined;
    
    // SQL: Normalize stored phone to same Vietnam local format for comparison
    // Handles: 0905608298, 84905608298, +84905608298, 0084905608298, 084905608298, with spaces/dashes
    // Strategy: Remove all non-digits, then convert to 0xxxxxxxxx format
    const [customer] = await db
      .select()
      .from(customers)
      .where(sql`
        CASE
          WHEN regexp_replace(${customers.phone}, '[^0-9]', '', 'g') LIKE '0084%' 
            THEN '0' || substring(regexp_replace(${customers.phone}, '[^0-9]', '', 'g') from 5)
          WHEN regexp_replace(${customers.phone}, '[^0-9]', '', 'g') LIKE '084%' AND length(regexp_replace(${customers.phone}, '[^0-9]', '', 'g')) = 12
            THEN '0' || substring(regexp_replace(${customers.phone}, '[^0-9]', '', 'g') from 4)
          WHEN regexp_replace(${customers.phone}, '[^0-9]', '', 'g') LIKE '84%' 
            THEN '0' || substring(regexp_replace(${customers.phone}, '[^0-9]', '', 'g') from 3)
          WHEN regexp_replace(${customers.phone}, '[^0-9]', '', 'g') LIKE '0%' 
            THEN regexp_replace(${customers.phone}, '[^0-9]', '', 'g')
          ELSE '0' || regexp_replace(${customers.phone}, '[^0-9]', '', 'g')
        END = ${normalizedPhone}
      `)
      .limit(1);
    
    return customer || undefined;
  }

  async getCustomerByAffiliateCode(affiliateCode: string): Promise<Customers | undefined> {
    const [customer] = await db
      .select()
      .from(customers)
      .where(eq(customers.affiliateCode, affiliateCode));
    return customer || undefined;
  }

  async getOrdersByCustomerId(customerId: string, limit = 50): Promise<Orders[]> {
    return await db
      .select()
      .from(orders)
      .where(eq(orders.userId, customerId))
      .orderBy(desc(orders.createdAt))
      .limit(limit);
  }

  async getOrderItemsByOrderIds(orderIds: string[]): Promise<OrderItems[]> {
    if (orderIds.length === 0) return [];
    return await db
      .select()
      .from(orderItems)
      .where(inArray(orderItems.orderId, orderIds));
  }

  async getProductsByIds(productIds: string[]): Promise<Products[]> {
    if (productIds.length === 0) return [];
    return await db
      .select()
      .from(products)
      .where(inArray(products.id, productIds));
  }

  async getCategoriesByIds(categoryIds: string[]): Promise<Categories[]> {
    if (categoryIds.length === 0) return [];
    return await db
      .select()
      .from(categories)
      .where(inArray(categories.id, categoryIds));
  }

  // 🔐 Admin Authentication methods implementation (Role-based access control)
  async getAdmins(): Promise<Admins[]> {
    return await db.select().from(admins).orderBy(desc(admins.createdAt));
  }

  async getAdminById(id: string): Promise<Admins | undefined> {
    const [admin] = await db.select().from(admins).where(eq(admins.id, id));
    return admin || undefined;
  }

  async getAdminByEmail(email: string): Promise<Admins | undefined> {
    if (!email) return undefined;
    const [admin] = await db.select().from(admins).where(eq(admins.email, email));
    return admin || undefined;
  }

  async createAdmin(insertAdmin: InsertAdmins): Promise<Admins> {
    const [admin] = await db.insert(admins).values(insertAdmin as any).returning();
    return admin;
  }

  async updateAdmin(id: string, updateData: Partial<Admins>): Promise<Admins | undefined> {
    const [admin] = await db
      .update(admins)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(admins.id, id))
      .returning();
    return admin || undefined;
  }

  async deleteAdmin(id: string): Promise<boolean> {
    const result = await db.delete(admins).where(eq(admins.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async updateAdminLastLogin(id: string): Promise<Admins | undefined> {
    const [admin] = await db
      .update(admins)
      .set({ lastLoginAt: new Date() })
      .where(eq(admins.id, id))
      .returning();
    return admin || undefined;
  }

  // 🔐 Vendor Authentication methods
  async getVendors(): Promise<Vendors[]> {
    return await db.select().from(vendors).orderBy(desc(vendors.createdAt));
  }

  async getVendorById(id: string): Promise<Vendors | undefined> {
    const [vendor] = await db.select().from(vendors).where(eq(vendors.id, id));
    return vendor || undefined;
  }

  async getVendorByEmail(email: string): Promise<Vendors | undefined> {
    const [vendor] = await db.select().from(vendors).where(eq(vendors.email, email));
    return vendor || undefined;
  }

  async createVendor(vendor: InsertVendors): Promise<Vendors> {
    const [newVendor] = await db.insert(vendors).values(vendor as any).returning();
    return newVendor;
  }

  async updateVendor(id: string, vendor: Partial<InsertVendors>): Promise<Vendors | undefined> {
    const [updatedVendor] = await db
      .update(vendors)
      .set({ ...vendor, updatedAt: new Date() })
      .where(eq(vendors.id, id))
      .returning();
    return updatedVendor || undefined;
  }

  async updateVendorLastLogin(id: string): Promise<Vendors | undefined> {
    const [vendor] = await db
      .update(vendors)
      .set({ lastLoginAt: new Date() })
      .where(eq(vendors.id, id))
      .returning();
    return vendor || undefined;
  }

  // 📱 Vendor Push Subscriptions methods
  async getVendorPushSubscriptions(vendorId: string): Promise<VendorPushSubscriptions[]> {
    return await db
      .select()
      .from(vendorPushSubscriptions)
      .where(and(
        eq(vendorPushSubscriptions.vendorId, vendorId),
        eq(vendorPushSubscriptions.isActive, true)
      ))
      .orderBy(desc(vendorPushSubscriptions.createdAt));
  }

  async getVendorPushSubscriptionById(id: string): Promise<VendorPushSubscriptions | undefined> {
    const [subscription] = await db
      .select()
      .from(vendorPushSubscriptions)
      .where(eq(vendorPushSubscriptions.id, id));
    return subscription || undefined;
  }

  async createVendorPushSubscription(subscription: InsertVendorPushSubscriptions): Promise<VendorPushSubscriptions> {
    const [newSubscription] = await db
      .insert(vendorPushSubscriptions)
      .values(subscription as any)
      .returning();
    return newSubscription;
  }

  async deleteVendorPushSubscription(id: string): Promise<boolean> {
    const result = await db
      .delete(vendorPushSubscriptions)
      .where(eq(vendorPushSubscriptions.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async markVendorPushSubscriptionInactive(id: string): Promise<void> {
    await db
      .update(vendorPushSubscriptions)
      .set({ isActive: false })
      .where(eq(vendorPushSubscriptions.id, id));
  }

  async updateVendorLastNotifiedAt(vendorId: string): Promise<void> {
    await db
      .update(vendorPushSubscriptions)
      .set({ lastNotifiedAt: new Date() })
      .where(eq(vendorPushSubscriptions.vendorId, vendorId));
  }

  // Industry methods
  async getIndustries(): Promise<Industries[]> {
    return await db.select().from(industries).orderBy(industries.sortOrder, industries.name);
  }

  async getIndustry(id: string): Promise<Industries | undefined> {
    const [industry] = await db.select().from(industries).where(eq(industries.id, id));
    return industry || undefined;
  }

  async createIndustry(industry: InsertIndustries): Promise<Industries> {
    const [newIndustry] = await db.insert(industries).values(industry as any).returning();
    return newIndustry;
  }

  async updateIndustry(id: string, industry: Partial<InsertIndustries>): Promise<Industries | undefined> {
    const [updatedIndustry] = await db
      .update(industries)
      .set({ ...industry, updatedAt: new Date() })
      .where(eq(industries.id, id))
      .returning();
    return updatedIndustry || undefined;
  }

  async deleteIndustry(id: string): Promise<boolean> {
    const result = await db.delete(industries).where(eq(industries.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Category methods
  async getCategories(industryId?: string): Promise<Categories[]> {
    if (industryId) {
      return await db
        .select()
        .from(categories)
        .where(eq(categories.industryId, industryId))
        .orderBy(categories.sortOrder, categories.name);
    }
    return await db.select().from(categories).orderBy(categories.sortOrder, categories.name);
  }

  async getCategory(id: string): Promise<Categories | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category || undefined;
  }

  async createCategory(category: InsertCategories): Promise<Categories> {
    const [newCategory] = await db.insert(categories).values(category as any).returning();
    return newCategory;
  }

  async updateCategory(id: string, category: Partial<InsertCategories>): Promise<Categories | undefined> {
    const [updatedCategory] = await db
      .update(categories)
      .set({ ...category, updatedAt: new Date() })
      .where(eq(categories.id, id))
      .returning();
    return updatedCategory || undefined;
  }

  async deleteCategory(id: string): Promise<boolean> {
    const result = await db.delete(categories).where(eq(categories.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Frontend Category Assignment methods
  async getFrontendCategoryAssignments(): Promise<FrontendCategoryAssignments[]> {
    return await db
      .select()
      .from(frontendCategoryAssignments)
      .orderBy(frontendCategoryAssignments.frontendId, frontendCategoryAssignments.sortOrder);
  }

  async getFrontendCategoryAssignmentsByFrontend(frontendId: string): Promise<FrontendCategoryAssignments[]> {
    return await db
      .select()
      .from(frontendCategoryAssignments)
      .where(eq(frontendCategoryAssignments.frontendId, frontendId))
      .orderBy(frontendCategoryAssignments.sortOrder);
  }

  async createFrontendCategoryAssignment(assignment: InsertFrontendCategoryAssignments): Promise<FrontendCategoryAssignments> {
    const [newAssignment] = await db.insert(frontendCategoryAssignments).values(assignment as any).returning();
    return newAssignment;
  }

  async updateFrontendCategoryAssignment(id: string, assignment: Partial<InsertFrontendCategoryAssignments>): Promise<FrontendCategoryAssignments | undefined> {
    const [updatedAssignment] = await db
      .update(frontendCategoryAssignments)
      .set({ ...assignment, updatedAt: new Date() })
      .where(eq(frontendCategoryAssignments.id, id))
      .returning();
    return updatedAssignment || undefined;
  }

  async deleteFrontendCategoryAssignment(id: string): Promise<boolean> {
    const result = await db.delete(frontendCategoryAssignments).where(eq(frontendCategoryAssignments.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Dynamic Category Filtering methods
  async getCategoriesForFrontend(frontendId: string, isLocalCustomer = false): Promise<Categories[]> {
    // Step 1: Get category IDs assigned to this frontend
    const assignments = await db
      .select({ categoryId: frontendCategoryAssignments.categoryId })
      .from(frontendCategoryAssignments)
      .where(eq(frontendCategoryAssignments.frontendId, frontendId))
      .orderBy(frontendCategoryAssignments.sortOrder);

    if (assignments.length === 0) {
      // No assignments = show no categories
      return [];
    }

    const categoryIds = assignments.map(a => a.categoryId);

    // Step 2: Get the actual category records
    let baseCategories = await db
      .select()
      .from(categories)
      .where(inArray(categories.id, categoryIds))
      .orderBy(categories.sortOrder, categories.name);

    // Step 3: For local customers, potentially add local-only categories
    if (isLocalCustomer) {
      // Get local-only categories (bánh kẹo, đồ ăn dặm) by name matching
      const localOnlyCategories = await db
        .select()
        .from(categories)
        .where(
          or(
            ilike(categories.name, '%bánh kẹo%'),
            ilike(categories.name, '%đồ ăn dặm%'),
            ilike(categories.name, '%local%')
          )
        )
        .orderBy(categories.sortOrder, categories.name);

      // Merge with base categories (avoid duplicates)
      const existingIds = new Set(baseCategories.map(c => c.id));
      const newLocalCategories = localOnlyCategories.filter(c => !existingIds.has(c.id));
      baseCategories = [...baseCategories, ...newLocalCategories];
    }

    return baseCategories;
  }

  async getProductsForFrontend(
    frontendId: string, 
    isLocalCustomer = false, 
    limit = 50, 
    search?: string, 
    offset = 0
  ): Promise<Products[]> {
    // Step 1: Get allowed categories for this frontend + customer type
    const allowedCategories = await this.getCategoriesForFrontend(frontendId, isLocalCustomer);
    
    if (allowedCategories.length === 0) {
      // No categories = no products
      return [];
    }

    const categoryIds = allowedCategories.map(c => c.id);

    // Step 2: Build product query with category filtering
    const conditions = [
      inArray(products.categoryId, categoryIds),
      eq(products.status, 'active')
    ];

    // Add search condition if provided
    if (search && search.trim()) {
      conditions.push(
        or(
          ilike(products.name, `%${search.trim()}%`),
          ilike(products.description, `%${search.trim()}%`),
          ilike(products.sku, `%${search.trim()}%`)
        )!
      );
    }

    // Step 3: Execute query with filtering
    const filteredProducts = await db
      .select()
      .from(products)
      .where(and(...conditions))
      .orderBy(desc(products.createdAt))
      .limit(limit)
      .offset(offset);

    return filteredProducts;
  }

  // Product methods
  async getProducts(limit = 50, categoryId?: string, search?: string, offsetNum = 0, sortBy = 'newest', sortOrder = 'desc'): Promise<Products[]> {
    // 🚀 OPTIMIZED: Select only 28 required fields (instead of 63 fields)
    // This reduces response size by 50-60% and speeds up page load 2-3x
    const lightweightSelect = {
      // Core fields (7)
      id: products.id,
      name: products.name,
      description: products.description,
      price: products.price,
      stock: products.stock,
      categoryId: products.categoryId,
      status: products.status,
      // Media (2)
      image: products.image,
      images: products.images,
      // Product Info (4)
      sku: products.sku,
      itemCode: products.itemCode,
      slug: products.slug,
      // Marketing Badges (6)
      isNew: products.isNew,
      isBestseller: products.isBestseller,
      isTopseller: products.isTopseller,
      isFreeshipping: products.isFreeshipping,
      originalPrice: products.originalPrice,
      fakeSalesCount: products.fakeSalesCount,
      // Unit fields (2)
      unitType: products.unitType,
      unit: products.unit,
      // SEO (5)
      seoTitle: products.seoTitle,
      seoDescription: products.seoDescription,
      ogImageUrl: products.ogImageUrl,
      tagIds: products.tagIds,
      productStory: products.productStory,
      // AI FAQ (1)
      smartFaq: products.smartFaq,
      // Timestamps (2)
      createdAt: products.createdAt,
      updatedAt: products.updatedAt,
      // VIP system fields
      isVipOnly: products.isVipOnly,
      requiredVipTier: products.requiredVipTier
    };
    
    // Build where conditions
    const conditions = [];
    
    if (categoryId) {
      conditions.push(eq(products.categoryId, categoryId));
    }
    
    if (search) {
      conditions.push(
        or(
          ilike(products.name, `%${search}%`),
          ilike(products.description, `%${search}%`),
          ilike(products.sku, `%${search}%`),
          ilike(products.itemCode, `%${search}%`)
        )
      );
    }
    
    // Build order by clause based on sortBy and sortOrder
    let orderByClause;
    const isDesc = sortOrder === 'desc';
    
    switch (sortBy) {
      case 'price':
        orderByClause = isDesc ? desc(products.price) : products.price;
        break;
      case 'name':
        orderByClause = isDesc ? desc(products.name) : products.name;
        break;
      case 'newest':
      default:
        orderByClause = isDesc ? desc(products.createdAt) : products.createdAt;
        break;
    }
    
    // Build query with or without conditions
    if (conditions.length > 0) {
      return await db
        .select(lightweightSelect)
        .from(products)
        .where(conditions.length === 1 ? conditions[0] : and(...conditions))
        .orderBy(orderByClause)
        .limit(limit)
        .offset(offsetNum) as Products[];
    } else {
      return await db
        .select(lightweightSelect)
        .from(products)
        .orderBy(orderByClause)
        .limit(limit)
        .offset(offsetNum) as Products[];
    }
  }

  async getProductsWithCategory(limit = 50, categoryId?: string, search?: string, offsetNum = 0): Promise<(Products & { categoryName?: string })[]> {
    const baseQuery = {
      id: products.id,
      name: products.name,
      description: products.description,
      sku: products.sku,
      itemCode: products.itemCode,
      price: products.price,
      stock: products.stock,
      categoryId: products.categoryId,
      status: products.status,
      image: products.image,
      images: products.images,
      videos: products.videos,
      // 🤖 Include AI-generated descriptions for RASA
      descriptions: products.descriptions,
      defaultImageIndex: products.defaultImageIndex,
      tagIds: products.tagIds,
      // 🎯 SEO & Product Page Enhancement fields
      shortDescription: products.shortDescription,
      slug: products.slug,
      productStory: products.productStory,
      ingredients: products.ingredients,
      benefits: products.benefits,
      usageInstructions: products.usageInstructions,
      specifications: products.specifications,
      seoTitle: products.seoTitle,
      seoDescription: products.seoDescription,
      ogImageUrl: products.ogImageUrl,
      // 📦 Unit fields for POS system
      unitType: products.unitType,
      unit: products.unit,
      allowDecimals: products.allowDecimals,
      minQuantity: products.minQuantity,
      quantityStep: products.quantityStep,
      createdAt: products.createdAt,
      updatedAt: products.updatedAt,
      categoryName: categories.name
    };
    
    // Build where conditions
    const conditions = [];
    
    if (categoryId) {
      conditions.push(eq(products.categoryId, categoryId));
    }
    
    if (search) {
      conditions.push(
        or(
          ilike(products.name, `%${search}%`),
          ilike(products.description, `%${search}%`)
        )
      );
    }
    
    // Build query with or without conditions
    let results;
    if (conditions.length > 0) {
      results = await db
        .select(baseQuery)
        .from(products)
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .where(conditions.length === 1 ? conditions[0] : and(...conditions))
        .orderBy(desc(products.createdAt))
        .limit(limit)
        .offset(offsetNum);
    } else {
      results = await db
        .select(baseQuery)
        .from(products)
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .orderBy(desc(products.createdAt))
        .limit(limit)
        .offset(offsetNum);
    }
      
    return results.map(row => ({
      ...row,
      categoryName: row.categoryName || undefined
    })) as any[];
  }

  // Get popular products based on order items count
  async getPopularProducts(limit = 10): Promise<Products[]> {
    try {
      // Get products ordered most frequently today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const popularProducts = await db
        .select({
          id: products.id,
          name: products.name,
          description: products.description,
          sku: products.sku,
          itemCode: products.itemCode,
          price: products.price,
          stock: products.stock,
          image: products.image,
          images: products.images,
          videos: products.videos,
          descriptions: products.descriptions,
          defaultImageIndex: products.defaultImageIndex,
          tagIds: products.tagIds,
          // 🎯 SEO & Product Page Enhancement fields
          shortDescription: products.shortDescription,
          slug: products.slug,
          productStory: products.productStory,
          ingredients: products.ingredients,
          benefits: products.benefits,
          usageInstructions: products.usageInstructions,
          specifications: products.specifications,
          seoTitle: products.seoTitle,
          seoDescription: products.seoDescription,
          ogImageUrl: products.ogImageUrl,
          categoryId: products.categoryId,
          status: products.status,
          createdAt: products.createdAt,
          updatedAt: products.updatedAt,
          orderCount: sql<number>`COUNT(${orderItems.productId})::int`,
        })
        .from(products)
        .leftJoin(orderItems, eq(products.id, orderItems.productId))
        .leftJoin(orders, eq(orderItems.orderId, orders.id))
        .where(
          and(
            eq(products.status, 'active'),
            or(
              gte(orders.createdAt, today),
              isNull(orders.createdAt) // Include products with no orders
            )
          )
        )
        .groupBy(products.id)
        .orderBy(desc(sql`COUNT(${orderItems.productId})`), desc(products.createdAt))
        .limit(limit);

      return popularProducts.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        sku: p.sku,
        itemCode: p.itemCode,
        price: p.price,
        image: p.image,
        images: p.images,
        videos: p.videos,
        descriptions: p.descriptions,
        defaultImageIndex: p.defaultImageIndex,
        tagIds: p.tagIds,
        // 🎯 SEO & Product Page Enhancement fields
        shortDescription: p.shortDescription,
        slug: p.slug,
        productStory: p.productStory,
        ingredients: p.ingredients,
        benefits: p.benefits,
        usageInstructions: p.usageInstructions,
        specifications: p.specifications,
        seoTitle: p.seoTitle,
        seoDescription: p.seoDescription,
        ogImageUrl: p.ogImageUrl,
        categoryId: p.categoryId,
        status: p.status,
        stock: p.stock,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      })) as any[];
    } catch (error) {
      console.error("Error fetching popular products:", error);
      // Fallback to latest products if query fails
      return await this.getProducts(limit);
    }
  }

  async getProduct(id: string): Promise<Products | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async getProductBySKU(sku: string): Promise<Products | undefined> {
    const [product] = await db.select().from(products).where(eq(products.sku, sku));
    return product || undefined;
  }

  async getProductBySlug(slug: string): Promise<Products | undefined> {
    const [product] = await db.select().from(products).where(eq(products.slug, slug));
    return product || undefined;
  }

  async getProductsWithoutSKU(): Promise<Products[]> {
    return await db.select().from(products).where(isNull(products.sku));
  }

  async createProduct(product: InsertProducts): Promise<Products> {
    const [newProduct] = await db.insert(products).values(product as any).returning();
    return newProduct;
  }

  async updateProduct(id: string, product: Partial<InsertProducts>): Promise<Products | undefined> {
    const [updatedProduct] = await db
      .update(products)
      .set({ ...product, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return updatedProduct || undefined;
  }

  async deleteProduct(id: string): Promise<boolean> {
    try {
      console.log('🗑️ Starting cascade delete for product:', id);
      
      // Delete all references to avoid foreign key constraints
      
      // 1. Delete product landing pages
      const landingPages = await db.delete(productLandingPages).where(eq(productLandingPages.productId, id));
      console.log('🗑️ Deleted landing pages:', landingPages.rowCount);
      
      // 2. Delete order items (this will break foreign key with orders, but we need to handle this carefully)
      // Instead of deleting order items, we'll just prevent deletion if product has orders
      const existingOrders = await db.select({ count: sql<number>`count(*)` })
        .from(orderItems)
        .where(eq(orderItems.productId, id));
      
      if (existingOrders[0]?.count > 0) {
        return false; // Don't delete products that have been ordered
      }
      
      // 3. Delete the product itself
      const result = await db.delete(products).where(eq(products.id, id));
      console.log('🗑️ Deleted product:', result.rowCount);
      
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      console.error('Error in deleteProduct:', error);
      throw error;
    }
  }

  // 💎 VIP System methods
  async getVipProducts(limit = 50, search?: string, offsetNum = 0): Promise<Products[]> {
    const conditions = [eq(products.isVipOnly, true)];

    if (search) {
      conditions.push(
        or(
          ilike(products.name, `%${search}%`),
          ilike(products.description, `%${search}%`),
          ilike(products.sku, `%${search}%`)
        )!
      );
    }

    return await db
      .select()
      .from(products)
      .where(and(...conditions))
      .limit(limit)
      .offset(offsetNum);
  }

  async getVipCategories(): Promise<Categories[]> {
    return await db.select().from(categories).where(eq(categories.isVipOnly, true));
  }

  async updateProductVipStatus(id: string, isVipOnly: boolean): Promise<Products | undefined> {
    const [updatedProduct] = await db
      .update(products)
      .set({ isVipOnly, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return updatedProduct || undefined;
  }

  async updateCategoryVipStatus(id: string, isVipOnly: boolean): Promise<Categories | undefined> {
    const [updatedCategory] = await db
      .update(categories)
      .set({ isVipOnly, updatedAt: new Date() })
      .where(eq(categories.id, id))
      .returning();
    return updatedCategory || undefined;
  }

  // 🚗 Driver System methods
  async getDriverVehicles(driverId: string): Promise<any[]> {
    return await db
      .select()
      .from(vehicles)
      .where(eq(vehicles.driverId, driverId))
      .orderBy(desc(vehicles.createdAt));
  }

  async getDriverTrips(driverId: string, status?: string, limit = 50): Promise<any[]> {
    const conditions = [eq(trips.driverId, driverId)];
    
    if (status) {
      conditions.push(eq(trips.status, status));
    }

    return await db
      .select()
      .from(trips)
      .where(and(...conditions))
      .orderBy(desc(trips.departureTime))
      .limit(limit);
  }

  async getDriverTripById(tripId: string): Promise<any | undefined> {
    const [trip] = await db
      .select()
      .from(trips)
      .where(eq(trips.id, tripId));
    return trip || undefined;
  }

  async createVehicle(vehicle: any): Promise<any> {
    const [newVehicle] = await db.insert(vehicles).values(vehicle).returning();
    return newVehicle;
  }

  async createTrip(trip: any): Promise<any> {
    const [newTrip] = await db.insert(trips).values(trip).returning();
    return newTrip;
  }

  async updateTripStatus(
    tripId: string, 
    status: string, 
    actualArrivalTime?: Date
  ): Promise<any | undefined> {
    const updateData: any = { 
      status, 
      updatedAt: new Date() 
    };
    
    if (actualArrivalTime) {
      updateData.actualArrivalTime = actualArrivalTime;
    }
    
    if (status === 'completed') {
      updateData.completedAt = new Date();
    }

    const [updatedTrip] = await db
      .update(trips)
      .set(updateData)
      .where(eq(trips.id, tripId))
      .returning();
    return updatedTrip || undefined;
  }

  async updateTrip(tripId: string, trip: Partial<any>): Promise<any | undefined> {
    const [updatedTrip] = await db
      .update(trips)
      .set({ ...trip, updatedAt: new Date() })
      .where(eq(trips.id, tripId))
      .returning();
    return updatedTrip || undefined;
  }

  // 🚙 Vehicle CRUD methods
  async getVehicles(filters?: { driverId?: string; status?: string; isVerified?: boolean }, pagination?: { limit?: number; offset?: number }): Promise<any[]> {
    const conditions: any[] = [];
    
    if (filters?.driverId) {
      conditions.push(eq(vehicles.driverId, filters.driverId));
    }
    if (filters?.status) {
      conditions.push(eq(vehicles.status, filters.status));
    }
    if (filters?.isVerified !== undefined) {
      conditions.push(eq(vehicles.isVerified, filters.isVerified));
    }

    let query = db.select().from(vehicles);

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    query = query.orderBy(desc(vehicles.createdAt)) as any;

    if (pagination?.limit) {
      query = query.limit(pagination.limit) as any;
    }
    if (pagination?.offset) {
      query = query.offset(pagination.offset) as any;
    }

    return await query;
  }

  async getVehicle(id: string): Promise<any | undefined> {
    const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.id, id));
    return vehicle || undefined;
  }

  async updateVehicle(id: string, vehicle: Partial<any>): Promise<any | undefined> {
    const [updated] = await db
      .update(vehicles)
      .set({ ...vehicle, updatedAt: new Date() })
      .where(eq(vehicles.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteVehicle(id: string): Promise<boolean> {
    const result = await db.delete(vehicles).where(eq(vehicles.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Customer methods
  async getCustomers(limit = 50, profileStatus: 'complete' | 'incomplete' | 'all' = 'complete'): Promise<any[]> {
    // 🚀 Optimized: Single query with LEFT JOIN instead of N+1 queries
    const subquery = db
      .select({
        customerId: orders.userId,
        totalOrders: count(orders.id).as('total_orders'),
        totalSpent: sum(orders.total).as('total_spent'),
        lastOrderDate: sql<string>`MAX(${orders.createdAt})::text`.as('last_order_date')
      })
      .from(orders)
      .where(inArray(orders.status, ['delivered', 'shipped']))
      .groupBy(orders.userId)
      .as('order_stats');

    let query = db
      .select({
        id: customers.id,
        name: customers.name,
        email: customers.email,
        phone: customers.phone,
        avatar: customers.avatar,
        status: customers.status,
        totalDebt: customers.totalDebt,
        creditLimit: customers.creditLimit,
        joinDate: customers.joinDate,
        registrationSource: customers.registrationSource,
        profileStatus: customers.profileStatus,
        membershipTier: customers.membershipTier,
        pointsBalance: customers.pointsBalance,
        pointsEarned: customers.pointsEarned,
        lastTierUpdate: customers.lastTierUpdate,
        authUserId: customers.authUserId,
        membershipData: customers.membershipData,
        socialAccountIds: customers.socialAccountIds,
        socialData: customers.socialData,
        customerRole: customers.customerRole,
        limitsData: customers.limitsData,
        isLocalCustomer: customers.isLocalCustomer,
        isAffiliate: customers.isAffiliate,
        affiliateCode: customers.affiliateCode,
        affiliateStatus: customers.affiliateStatus,
        commissionRate: customers.commissionRate,
        affiliateData: customers.affiliateData,
        totalOrders: sql<number>`COALESCE("order_stats"."total_orders", 0)`.as('total_orders'),
        orderTotalSpent: sql<number>`COALESCE("order_stats"."total_spent", 0)`.as('order_total_spent'),
        lastOrderDate: sql<string>`COALESCE("order_stats"."last_order_date", ${customers.joinDate}::text)`.as('last_order_date')
      })
      .from(customers)
      .leftJoin(subquery, eq(customers.id, subquery.customerId));

    // 🎯 Filter by profileStatus (default: only 'complete' profiles)
    if (profileStatus !== 'all') {
      query = (query as any).where(eq(customers.profileStatus, profileStatus));
    }

    const results = await query
      .orderBy(desc(customers.joinDate))
      .limit(limit);

    return results.map(row => ({
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      avatar: row.avatar,
      status: row.status,
      totalDebt: row.totalDebt || '0',
      creditLimit: row.creditLimit || '0',
      joinDate: row.joinDate,
      registrationSource: row.registrationSource,
      profileStatus: row.profileStatus,
      membershipTier: row.membershipTier,
      pointsBalance: row.pointsBalance,
      pointsEarned: row.pointsEarned,
      lastTierUpdate: row.lastTierUpdate,
      authUserId: row.authUserId,
      membershipData: row.membershipData,
      socialAccountIds: row.socialAccountIds,
      socialData: row.socialData,
      customerRole: row.customerRole,
      limitsData: row.limitsData,
      isLocalCustomer: row.isLocalCustomer,
      isAffiliate: row.isAffiliate,
      affiliateCode: row.affiliateCode,
      affiliateStatus: row.affiliateStatus,
      commissionRate: row.commissionRate,
      affiliateData: row.affiliateData,
      totalOrders: Number(row.totalOrders) || 0,
      totalSpent: String(row.orderTotalSpent || 0),
      lastOrderDate: row.lastOrderDate || row.joinDate?.toISOString() || new Date().toISOString()
    })) as any[];
  }

  // 🔍 Optimized search for customers by name or phone
  async searchCustomers(searchTerm: string, limit = 20, profileStatus: 'complete' | 'incomplete' | 'all' = 'complete'): Promise<any[]> {
    if (!searchTerm || searchTerm.length < 2) {
      return [];
    }

    // 🚀 Optimized: Single query with LEFT JOIN and direct ILIKE search
    const subquery = db
      .select({
        customerId: orders.userId,
        totalOrders: count(orders.id).as('total_orders'),
        totalSpent: sum(orders.total).as('total_spent'),
        lastOrderDate: sql<string>`MAX(${orders.createdAt})::text`.as('last_order_date')
      })
      .from(orders)
      .where(inArray(orders.status, ['delivered', 'shipped']))
      .groupBy(orders.userId)
      .as('order_stats');

    const searchPattern = `%${searchTerm}%`;
    const phoneDigits = searchTerm.replace(/\D/g, '');

    let query = db
      .select({
        id: customers.id,
        name: customers.name,
        email: customers.email,
        phone: customers.phone,
        avatar: customers.avatar,
        status: customers.status,
        totalDebt: customers.totalDebt,
        creditLimit: customers.creditLimit,
        joinDate: customers.joinDate,
        registrationSource: customers.registrationSource,
        profileStatus: customers.profileStatus,
        membershipTier: customers.membershipTier,
        pointsBalance: customers.pointsBalance,
        pointsEarned: customers.pointsEarned,
        lastTierUpdate: customers.lastTierUpdate,
        authUserId: customers.authUserId,
        membershipData: customers.membershipData,
        socialAccountIds: customers.socialAccountIds,
        socialData: customers.socialData,
        customerRole: customers.customerRole,
        limitsData: customers.limitsData,
        isLocalCustomer: customers.isLocalCustomer,
        isAffiliate: customers.isAffiliate,
        affiliateCode: customers.affiliateCode,
        affiliateStatus: customers.affiliateStatus,
        commissionRate: customers.commissionRate,
        affiliateData: customers.affiliateData,
        totalOrders: sql<number>`COALESCE("order_stats"."total_orders", 0)`.as('total_orders'),
        orderTotalSpent: sql<number>`COALESCE("order_stats"."total_spent", 0)`.as('order_total_spent'),
        lastOrderDate: sql<string>`COALESCE("order_stats"."last_order_date", ${customers.joinDate}::text)`.as('last_order_date')
      })
      .from(customers)
      .leftJoin(subquery, eq(customers.id, subquery.customerId));

    // Build WHERE conditions
    const conditions = [];
    
    // Profile status filter
    if (profileStatus !== 'all') {
      conditions.push(eq(customers.profileStatus, profileStatus));
    }

    // Search by name, email, or phone
    if (phoneDigits.length >= 3) {
      // Phone search
      conditions.push(sql`${customers.phone} LIKE '%${sql.raw(phoneDigits)}'`);
    } else {
      // Name or email search
      conditions.push(
        or(
          sql`${customers.name} ILIKE ${searchPattern}`,
          sql`${customers.email} ILIKE ${searchPattern}`
        )!
      );
    }

    if (conditions.length > 0) {
      query = (query as any).where(and(...conditions));
    }

    const results = await query
      .orderBy(desc(customers.joinDate))
      .limit(limit);

    return results.map(row => ({
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      avatar: row.avatar,
      status: row.status,
      totalDebt: row.totalDebt || '0',
      creditLimit: row.creditLimit || '0',
      joinDate: row.joinDate,
      registrationSource: row.registrationSource,
      profileStatus: row.profileStatus,
      membershipTier: row.membershipTier,
      pointsBalance: row.pointsBalance,
      pointsEarned: row.pointsEarned,
      lastTierUpdate: row.lastTierUpdate,
      authUserId: row.authUserId,
      membershipData: row.membershipData,
      socialAccountIds: row.socialAccountIds,
      socialData: row.socialData,
      customerRole: row.customerRole,
      limitsData: row.limitsData,
      isLocalCustomer: row.isLocalCustomer,
      isAffiliate: row.isAffiliate,
      affiliateCode: row.affiliateCode,
      affiliateStatus: row.affiliateStatus,
      commissionRate: row.commissionRate,
      affiliateData: row.affiliateData,
      totalOrders: Number(row.totalOrders) || 0,
      totalSpent: String(row.orderTotalSpent || 0),
      lastOrderDate: row.lastOrderDate || row.joinDate?.toISOString() || new Date().toISOString()
    })) as any[];
  }

  async getLocalCustomers(limit = 50): Promise<any[]> {
    const baseCustomers = await db
      .select()
      .from(customers)
      .where(eq(customers.isLocalCustomer, true))
      .orderBy(desc(customers.joinDate))
      .limit(limit);
    
    // Calculate enriched data for each customer (same as getCustomers)
    const enrichedCustomers = await Promise.all(
      baseCustomers.map(async (customer) => {
        const customerStats = await db
          .select({
            totalOrders: count(orders.id),
            totalSpent: sum(orders.total),
            lastOrderDate: sql<string>`MAX(${orders.createdAt})::text`
          })
          .from(orders)
          .where(and(
            eq(orders.userId, customer.id),
            inArray(orders.status, ['delivered', 'shipped'])
          ));

        const stats = customerStats[0] || { totalOrders: 0, totalSpent: 0, lastOrderDate: '' };

        return {
          ...customer,
          totalOrders: Number(stats.totalOrders),
          totalSpent: String(stats.totalSpent || 0),
          lastOrderDate: stats.lastOrderDate || '',
          totalDebt: customer.totalDebt || '0',
          creditLimit: customer.creditLimit || '0'
        };
      })
    );

    return enrichedCustomers as any[];
  }

  async getCustomer(id: string): Promise<(Customers & { totalDebt: string; creditLimit: string }) | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    if (!customer) return undefined;
    
    return {
      ...customer,
      totalDebt: customer.totalDebt || '0',
      creditLimit: customer.creditLimit || '0'
    };
  }

  async createCustomer(customer: InsertCustomers): Promise<Customers> {
    // Import phone normalizer
    const { normalizePhoneToE164 } = await import('./utils/phone-normalizer');
    
    // Normalize phone to Vietnam local format (0xxxxxxxxx) before storing
    const customerData = {
      ...customer,
      phone: customer.phone ? normalizePhoneToE164(customer.phone) : customer.phone
    };
    
    const [newCustomer] = await db.insert(customers).values(customerData as any).returning();
    return newCustomer;
  }

  async updateCustomer(id: string, customer: Partial<InsertCustomers>): Promise<Customers | undefined> {
    // If socialData is being updated, merge it with existing data
    if (customer.socialData) {
      const existingCustomer = await this.getCustomer(id);
      if (existingCustomer) {
        customer.socialData = {
          ...(existingCustomer.socialData || {}),
          ...customer.socialData
        };
      }
    }
    
    const [updatedCustomer] = await db
      .update(customers)
      .set(customer)
      .where(eq(customers.id, id))
      .returning();
    return updatedCustomer || undefined;
  }

  async getCustomerByPSID(psid: string): Promise<Customers | null> {
    try {
      const allCustomers = await db.select().from(customers);
      
      // Search for PSID in socialData
      const customer = allCustomers.find((c) => {
        const socialData = c.socialData as any;
        if (!socialData) return false;
        
        // Check legacy facebookId field
        if (socialData.facebookId === psid) return true;
        
        // Check facebookPages object
        if (socialData.facebookPages) {
          return Object.values(socialData.facebookPages).some(
            (page: any) => page.psid === psid
          );
        }
        
        return false;
      });
      
      return customer || null;
    } catch (error) {
      console.error('Error getting customer by PSID:', error);
      return null;
    }
  }

  async updateCustomerMembership(params: {
    customerId: string;
    totalSpent: string;
    pointsBalance: number;
    pointsEarned: number;
    membershipTier: string;
    lastTierUpdate?: Date | null;
    membershipData?: any;
  }): Promise<Customers | undefined> {
    const updateData: any = {
      totalSpent: params.totalSpent,
      pointsBalance: params.pointsBalance,
      pointsEarned: params.pointsEarned,
      membershipTier: params.membershipTier,
    };

    if (params.lastTierUpdate) {
      updateData.lastTierUpdate = params.lastTierUpdate;
    }

    // CRITICAL: Persist membershipData for idempotency tracking
    if (params.membershipData) {
      updateData.membershipData = params.membershipData;
    }

    const [updatedCustomer] = await db
      .update(customers)
      .set(updateData)
      .where(eq(customers.id, params.customerId))
      .returning();
    return updatedCustomer || undefined;
  }

  async deleteCustomer(id: string): Promise<boolean> {
    // First delete all orders associated with this customer
    const customerOrders = await db.select({ id: orders.id }).from(orders).where(eq(orders.userId, id));
    
    // Delete payments, order items, then orders for each order
    for (const order of customerOrders) {
      // Delete payments first (foreign key constraint)
      await db.delete(payments).where(eq(payments.orderId, order.id));
      // Then delete order items
      await db.delete(orderItems).where(eq(orderItems.orderId, order.id));
    }
    
    // Delete orders
    await db.delete(orders).where(eq(orders.userId, id));
    
    // Finally delete the customer
    const result = await db.delete(customers).where(eq(customers.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getCustomerRecentAddress(customerId: string): Promise<string | null> {
    try {
      // First get the customer's phone number
      const customer = await this.getCustomer(customerId);
      if (!customer || !customer.phone) {
        return null;
      }
      
      // Get the most recent storefront order for this customer by phone
      const [recentOrder] = await db
        .select({ customerAddress: storefrontOrders.customerAddress })
        .from(storefrontOrders)
        .where(eq(storefrontOrders.customerPhone, customer.phone))
        .orderBy(desc(storefrontOrders.createdAt))
        .limit(1);
      
      return recentOrder?.customerAddress || null;
    } catch (error) {
      console.error('Error getting customer recent address:', error);
      return null;
    }
  }

  // Customer analytics methods for POS suggestions (Legacy - N+1 query)
  async searchCustomersLegacy(searchTerm: string, limit = 10): Promise<(Customers & { totalOrders: number; totalSpent: number; lastOrderDate: string; totalDebt: string; creditLimit: string })[]> {
    try {
      // Search customers by name, phone, or email
      const baseCustomers = await db
        .select()
        .from(customers)
        .where(
          or(
            ilike(customers.name, `%${searchTerm}%`),
            ilike(customers.phone, `%${searchTerm}%`),
            ilike(customers.email, `%${searchTerm}%`)
          )
        )
        .orderBy(desc(customers.joinDate))
        .limit(limit);

      // Calculate enriched data for each customer
      const enrichedCustomers = await Promise.all(
        baseCustomers.map(async (customer) => {
          const customerStats = await db
            .select({
              totalOrders: count(orders.id),
              totalSpent: sum(orders.total),
              lastOrderDate: sql<string>`MAX(${orders.createdAt})::text`
            })
            .from(orders)
            .where(and(
              eq(orders.userId, customer.id),
              inArray(orders.status, ['delivered', 'shipped'])
            ));

          const stats = customerStats[0];
          
          return {
            ...customer,
            totalOrders: Number(stats.totalOrders) || 0,
            totalSpent: Number(stats.totalSpent) || 0,
            lastOrderDate: stats.lastOrderDate || customer.joinDate?.toISOString() || new Date().toISOString(),
            totalDebt: customer.totalDebt || '0',
            creditLimit: customer.creditLimit || '0'
          };
        })
      );
      
      return enrichedCustomers as any[];
    } catch (error) {
      console.error('Error searching customers:', error);
      return [];
    }
  }

  async getRecentCustomers(limit = 10): Promise<(Customers & { totalOrders: number; totalSpent: number; lastOrderDate: string; totalDebt: string; creditLimit: string })[]> {
    try {
      // Get customers with orders in the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentCustomerIds = await db
        .selectDistinct({ customerId: orders.userId })
        .from(orders)
        .where(gte(orders.createdAt, thirtyDaysAgo));

      if (recentCustomerIds.length === 0) {
        return [];
      }

      const customerIds = recentCustomerIds.map(r => r.customerId);
      const baseCustomers = await db
        .select()
        .from(customers)
        .where(inArray(customers.id, customerIds.filter(id => id !== null) as string[]))
        .orderBy(desc(customers.joinDate))
        .limit(limit);

      // Calculate enriched data for each customer
      const enrichedCustomers = await Promise.all(
        baseCustomers.map(async (customer) => {
          const customerStats = await db
            .select({
              totalOrders: count(orders.id),
              totalSpent: sum(orders.total),
              lastOrderDate: sql<string>`MAX(${orders.createdAt})::text`
            })
            .from(orders)
            .where(and(
              eq(orders.userId, customer.id),
              inArray(orders.status, ['delivered', 'shipped'])
            ));

          const stats = customerStats[0];
          
          return {
            ...customer,
            totalOrders: Number(stats.totalOrders) || 0,
            totalSpent: Number(stats.totalSpent) || 0,
            lastOrderDate: stats.lastOrderDate || customer.joinDate?.toISOString() || new Date().toISOString(),
            totalDebt: customer.totalDebt || '0',
            creditLimit: customer.creditLimit || '0'
          };
        })
      );
      
      // Sort by most recent order first
      return enrichedCustomers.sort((a, b) => 
        new Date(b.lastOrderDate).getTime() - new Date(a.lastOrderDate).getTime()
      ) as any[];
    } catch (error) {
      console.error('Error getting recent customers:', error);
      return [];
    }
  }

  async getVipCustomers(limit = 10): Promise<(Customers & { totalOrders: number; totalSpent: number; lastOrderDate: string; totalDebt: string; creditLimit: string })[]> {
    try {
      const baseCustomers = await db
        .select()
        .from(customers)
        .where(eq(customers.status, 'vip'))
        .orderBy(desc(customers.joinDate))
        .limit(limit);

      // Calculate enriched data for each customer
      const enrichedCustomers = await Promise.all(
        baseCustomers.map(async (customer) => {
          const customerStats = await db
            .select({
              totalOrders: count(orders.id),
              totalSpent: sum(orders.total),
              lastOrderDate: sql<string>`MAX(${orders.createdAt})::text`
            })
            .from(orders)
            .where(and(
              eq(orders.userId, customer.id),
              inArray(orders.status, ['delivered', 'shipped'])
            ));

          const stats = customerStats[0];
          
          return {
            ...customer,
            totalOrders: Number(stats.totalOrders) || 0,
            totalSpent: Number(stats.totalSpent) || 0,
            lastOrderDate: stats.lastOrderDate || customer.joinDate?.toISOString() || new Date().toISOString(),
            totalDebt: customer.totalDebt || '0',
            creditLimit: customer.creditLimit || '0'
          };
        })
      );
      
      // Sort VIP customers by total spent (high value customers first)
      return enrichedCustomers.sort((a, b) => b.totalSpent - a.totalSpent) as any[];
    } catch (error) {
      console.error('Error getting VIP customers:', error);
      return [];
    }
  }

  async getFrequentCustomers(limit = 10): Promise<(Customers & { totalOrders: number; totalSpent: number; lastOrderDate: string; totalDebt: string; creditLimit: string })[]> {
    try {
      // Get customers with their order counts
      const customerOrderCounts = await db
        .select({
          customerId: orders.userId,
          totalOrders: count(orders.id),
          totalSpent: sum(orders.total),
          lastOrderDate: sql<string>`MAX(${orders.createdAt})::text`
        })
        .from(orders)
        .where(inArray(orders.status, ['delivered', 'shipped']))
        .groupBy(orders.userId)
        .having(sql`COUNT(${orders.id}) > 0`)
        .orderBy(sql`COUNT(${orders.id}) DESC`)
        .limit(limit);

      if (customerOrderCounts.length === 0) {
        return [];
      }

      // Get customer details
      const customerIds = customerOrderCounts.map(c => c.customerId);
      const baseCustomers = await db
        .select()
        .from(customers)
        .where(inArray(customers.id, customerIds.filter(id => id !== null) as string[]));

      // Combine customer data with order statistics
      const enrichedCustomers = baseCustomers.map(customer => {
        const stats = customerOrderCounts.find(c => c.customerId === customer.id);
        return {
          ...customer,
          totalOrders: Number(stats?.totalOrders) || 0,
          totalSpent: Number(stats?.totalSpent) || 0,
          lastOrderDate: stats?.lastOrderDate || customer.joinDate?.toISOString() || new Date().toISOString(),
          totalDebt: customer.totalDebt || '0',
          creditLimit: customer.creditLimit || '0'
        };
      });

      // Sort by total orders descending (most frequent first)
      return enrichedCustomers.sort((a, b) => b.totalOrders - a.totalOrders) as any[];
    } catch (error) {
      console.error('Error getting frequent customers:', error);
      return [];
    }
  }

  // 📊 Customer Events Tracking Methods
  async trackCustomerEvent(event: InsertCustomerEvents): Promise<CustomerEvents> {
    const [newEvent] = await db.insert(customerEvents).values(event as any).returning();
    
    // Auto-update customer summary after tracking
    if (event.customerId) {
      await this.updateCustomerSummary(event.customerId);
    }
    
    return newEvent;
  }

  async getCustomerEvents(customerId: string, limit = 100): Promise<CustomerEvents[]> {
    return await db
      .select()
      .from(customerEvents)
      .where(eq(customerEvents.customerId, customerId))
      .orderBy(desc(customerEvents.createdAt))
      .limit(limit);
  }

  async getCustomerEventsByType(customerId: string, eventType: string, limit = 50): Promise<CustomerEvents[]> {
    return await db
      .select()
      .from(customerEvents)
      .where(
        and(
          eq(customerEvents.customerId, customerId),
          eq(customerEvents.eventType, eventType)
        )
      )
      .orderBy(desc(customerEvents.createdAt))
      .limit(limit);
  }

  async updateCustomerSummary(customerId: string): Promise<Customers | undefined> {
    try {
      const customer = await this.getCustomer(customerId);
      if (!customer) return undefined;

      // Get recent events for analysis
      const recentEvents = await this.getCustomerEvents(customerId, 1000);
      
      // Extract Facebook profile data
      const fbProfileEvents = recentEvents.filter(e => 
        ['locale_detected', 'timezone_detected', 'gender_detected'].includes(e.eventType)
      );
      
      const fbLocale = (fbProfileEvents.find(e => e.eventType === 'locale_detected')?.eventData as any)?.locale;
      const fbTimezone = (fbProfileEvents.find(e => e.eventType === 'timezone_detected')?.eventData as any)?.timezone;
      const fbGender = (fbProfileEvents.find(e => e.eventType === 'gender_detected')?.eventData as any)?.gender;

      // Extract web analytics
      const utmEvents = recentEvents.filter(e => e.eventType === 'utm_tracked');
      const lastUtm = utmEvents[0]?.eventData;
      
      const referrerEvents = recentEvents.filter(e => e.eventType === 'referrer_tracked');
      const lastReferrer = (referrerEvents[0]?.eventData as any)?.referrerUrl;

      const devicePreference = this.calculateDevicePreference(recentEvents);
      const channelPreference = this.calculateChannelPreference(recentEvents);

      // Calculate behavioral stats
      const productViews = recentEvents.filter(e => e.eventType === 'product_view').length;
      const cartAbandons = recentEvents.filter(e => e.eventType === 'cart_abandon').length;
      const sessionEvents = recentEvents.filter(e => ['session_start', 'session_end'].includes(e.eventType));
      const avgSessionTime = this.calculateAvgSessionTime(sessionEvents);

      // Update customer JSONB fields (preserve existing fields like facebookId)
      const [updatedCustomer] = await db
        .update(customers)
        .set({
          socialData: {
            ...(customer.socialData || {}),
            ...(fbLocale && { fbLocale }),
            ...(fbTimezone !== undefined && { fbTimezone }),
            ...(fbGender && { fbGender }),
          },
          membershipData: {
            ...(customer.membershipData || {}),
            webAnalytics: {
              lastUtmSource: (lastUtm as any)?.utmSource,
              lastUtmMedium: (lastUtm as any)?.utmMedium,
              lastUtmCampaign: (lastUtm as any)?.utmCampaign,
              lastReferrer,
              devicePreference,
              totalPageViews: recentEvents.filter(e => e.eventType === 'page_view').length,
              avgSessionDuration: avgSessionTime,
            }
          },
          limitsData: {
            ...(customer.limitsData || {}),
            behaviorStats: {
              productViewCount: productViews,
              cartAbandonCount: cartAbandons,
              avgSessionTime,
              channelPreference,
              lastProductViewed: (recentEvents.find(e => e.eventType === 'product_view')?.eventData as any)?.productId,
              lastChannelUsed: recentEvents[0]?.channel,
              totalSessions: sessionEvents.length / 2, // Pairs of start/end
              lastSessionAt: recentEvents[0]?.createdAt?.toISOString(),
            }
          }
        })
        .where(eq(customers.id, customerId))
        .returning();

      return updatedCustomer;
    } catch (error) {
      console.error('Error updating customer summary:', error);
      return undefined;
    }
  }

  private calculateDevicePreference(events: CustomerEvents[]): "mobile" | "desktop" | "tablet" | undefined {
    const deviceCounts: Record<string, number> = {};
    events.forEach(e => {
      const device = (e.eventData as any)?.deviceType;
      if (device) deviceCounts[device] = (deviceCounts[device] || 0) + 1;
    });
    
    const sorted = Object.entries(deviceCounts).sort((a, b) => b[1] - a[1]);
    return sorted[0]?.[0] as any;
  }

  private calculateChannelPreference(events: CustomerEvents[]): "web" | "facebook" | "instagram" | "app" | undefined {
    const channelCounts: Record<string, number> = {};
    events.forEach(e => {
      if (e.channel) channelCounts[e.channel] = (channelCounts[e.channel] || 0) + 1;
    });
    
    const sorted = Object.entries(channelCounts).sort((a, b) => b[1] - a[1]);
    return sorted[0]?.[0] as any;
  }

  private calculateAvgSessionTime(sessionEvents: CustomerEvents[]): number {
    const sessions: { start?: Date; end?: Date }[] = [];
    let currentSession: { start?: Date; end?: Date } = {};
    
    sessionEvents.forEach(e => {
      if (e.eventType === 'session_start') {
        currentSession = { start: e.createdAt };
      } else if (e.eventType === 'session_end' && currentSession.start) {
        currentSession.end = e.createdAt;
        sessions.push(currentSession);
        currentSession = {};
      }
    });

    if (sessions.length === 0) return 0;

    const totalDuration = sessions.reduce((sum, s) => {
      if (s.start && s.end) {
        return sum + (s.end.getTime() - s.start.getTime()) / 1000; // seconds
      }
      return sum;
    }, 0);

    return Math.round(totalDuration / sessions.length);
  }

  // 🔔 Notifications methods
  async getNotifications(customerId: string): Promise<Notifications[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.customerId, customerId))
      .orderBy(desc(notifications.createdAt));
  }

  async createNotification(notification: InsertNotifications): Promise<Notifications> {
    const [newNotification] = await db
      .insert(notifications)
      .values(notification as any)
      .returning();
    return newNotification;
  }

  async markNotificationsAsRead(notificationIds: string[], customerId: string): Promise<void> {
    if (notificationIds.length === 0) return;

    await db
      .update(notifications)
      .set({ 
        isRead: true,
        readAt: new Date()
      })
      .where(
        and(
          inArray(notifications.id, notificationIds),
          eq(notifications.customerId, customerId)
        )
      );
  }

  async deleteNotification(id: string, customerId: string): Promise<boolean> {
    const result = await db
      .delete(notifications)
      .where(
        and(
          eq(notifications.id, id),
          eq(notifications.customerId, customerId)
        )
      )
      .returning();

    return result.length > 0;
  }

  // 🔥 Flash Sales methods implementation
  async getFlashSales(limit = 50, offset = 0): Promise<FlashSales[]> {
    return await db
      .select()
      .from(flashSales)
      .orderBy(desc(flashSales.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getFlashSaleById(id: string): Promise<FlashSales | undefined> {
    const [flashSale] = await db
      .select()
      .from(flashSales)
      .where(eq(flashSales.id, id));
    return flashSale || undefined;
  }

  async getFlashSaleBySlug(slug: string): Promise<(FlashSales & { product: Products }) | undefined> {
    const result = await db
      .select({
        id: flashSales.id,
        productId: flashSales.productId,
        slug: flashSales.slug,
        title: flashSales.title,
        originalPrice: flashSales.originalPrice,
        salePrice: flashSales.salePrice,
        discountPercent: flashSales.discountPercent,
        startTime: flashSales.startTime,
        endTime: flashSales.endTime,
        bannerImage: flashSales.bannerImage,
        description: flashSales.description,
        unit: flashSales.unit,
        isActive: flashSales.isActive,
        createdAt: flashSales.createdAt,
        updatedAt: flashSales.updatedAt,
        product: products
      })
      .from(flashSales)
      .innerJoin(products, eq(flashSales.productId, products.id))
      .where(eq(flashSales.slug, slug));

    if (result.length === 0) return undefined;

    const row = result[0];
    return {
      ...row,
      product: row.product as Products
    } as FlashSales & { product: Products };
  }

  async getActiveFlashSales(): Promise<(FlashSales & { product: Products })[]> {
    const now = new Date();
    
    const results = await db
      .select({
        id: flashSales.id,
        productId: flashSales.productId,
        slug: flashSales.slug,
        title: flashSales.title,
        originalPrice: flashSales.originalPrice,
        salePrice: flashSales.salePrice,
        discountPercent: flashSales.discountPercent,
        startTime: flashSales.startTime,
        endTime: flashSales.endTime,
        bannerImage: flashSales.bannerImage,
        description: flashSales.description,
        unit: flashSales.unit,
        isActive: flashSales.isActive,
        createdAt: flashSales.createdAt,
        updatedAt: flashSales.updatedAt,
        product: products
      })
      .from(flashSales)
      .innerJoin(products, eq(flashSales.productId, products.id))
      .where(
        and(
          eq(flashSales.isActive, true),
          lte(flashSales.startTime, now),
          gte(flashSales.endTime, now)
        )
      )
      .orderBy(desc(flashSales.startTime));

    return results.map(row => ({
      ...row,
      product: row.product as Products
    })) as (FlashSales & { product: Products })[];
  }

  async createFlashSale(data: InsertFlashSales): Promise<FlashSales> {
    const [flashSale] = await db
      .insert(flashSales)
      .values({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      } as any)
      .returning();
    return flashSale;
  }

  async updateFlashSale(id: string, data: Partial<InsertFlashSales>): Promise<FlashSales | undefined> {
    const [flashSale] = await db
      .update(flashSales)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(flashSales.id, id))
      .returning();
    return flashSale || undefined;
  }

  async deleteFlashSale(id: string): Promise<boolean> {
    const result = await db
      .delete(flashSales)
      .where(eq(flashSales.id, id))
      .returning();
    return result.length > 0;
  }

  // 📦 Pre-orders methods implementation
  async getPreorders(limit = 50, offset = 0): Promise<PreorderProducts[]> {
    return await db
      .select()
      .from(preorderProducts)
      .orderBy(desc(preorderProducts.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getPreorderById(id: string): Promise<PreorderProducts | undefined> {
    const [preorder] = await db
      .select()
      .from(preorderProducts)
      .where(eq(preorderProducts.id, id));
    return preorder || undefined;
  }

  async getPreorderBySlug(slug: string): Promise<PreorderProducts & { product?: Products }> {
    const result = await db
      .select({
        id: preorderProducts.id,
        productId: preorderProducts.productId,
        slug: preorderProducts.slug,
        title: preorderProducts.title,
        description: preorderProducts.description,
        price: preorderProducts.price,
        estimatedDate: preorderProducts.estimatedDate,
        bannerImage: preorderProducts.bannerImage,
        unit: preorderProducts.unit,
        isActive: preorderProducts.isActive,
        createdAt: preorderProducts.createdAt,
        updatedAt: preorderProducts.updatedAt,
        product: products
      })
      .from(preorderProducts)
      .leftJoin(products, eq(preorderProducts.productId, products.id))
      .where(eq(preorderProducts.slug, slug));

    if (result.length === 0) {
      throw new Error('Preorder not found');
    }

    const row = result[0];
    return {
      ...row,
      product: row.product ? (row.product as Products) : undefined
    } as PreorderProducts & { product?: Products };
  }

  async getActivePreorders(): Promise<(PreorderProducts & { product?: Products })[]> {
    const results = await db
      .select({
        id: preorderProducts.id,
        productId: preorderProducts.productId,
        slug: preorderProducts.slug,
        title: preorderProducts.title,
        description: preorderProducts.description,
        price: preorderProducts.price,
        estimatedDate: preorderProducts.estimatedDate,
        bannerImage: preorderProducts.bannerImage,
        unit: preorderProducts.unit,
        isActive: preorderProducts.isActive,
        createdAt: preorderProducts.createdAt,
        updatedAt: preorderProducts.updatedAt,
        product: products
      })
      .from(preorderProducts)
      .leftJoin(products, eq(preorderProducts.productId, products.id))
      .where(eq(preorderProducts.isActive, true))
      .orderBy(desc(preorderProducts.createdAt));

    return results.map(row => ({
      ...row,
      product: row.product ? (row.product as Products) : undefined
    })) as (PreorderProducts & { product?: Products })[];
  }

  async createPreorder(data: InsertPreorderProducts): Promise<PreorderProducts> {
    const [preorder] = await db
      .insert(preorderProducts)
      .values({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      } as any)
      .returning();
    return preorder;
  }

  async updatePreorder(id: string, data: Partial<InsertPreorderProducts>): Promise<PreorderProducts | undefined> {
    const [preorder] = await db
      .update(preorderProducts)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(preorderProducts.id, id))
      .returning();
    return preorder || undefined;
  }

  async deletePreorder(id: string): Promise<boolean> {
    const result = await db
      .delete(preorderProducts)
      .where(eq(preorderProducts.id, id))
      .returning();
    return result.length > 0;
  }

  // Order methods
  async getOrders(limit = 50): Promise<(Orders & { customerName: string; customerEmail: string })[]> {
    const result = await db
      .select({
        id: orders.id,
        userId: orders.userId,
        total: orders.total,
        status: orders.status,
        items: orders.items,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
        customerName: customers.name,
        customerEmail: customers.email,
        // 🚀 Source tracking fields
        source: orders.source,
        sourceOrderId: orders.sourceOrderId,
        sourceReference: orders.sourceReference,
        syncStatus: orders.syncStatus,
      })
      .from(orders)
      .leftJoin(customers, eq(orders.userId, customers.id))
      .orderBy(desc(orders.createdAt))
      .limit(limit);
    
    return result as (Orders & { customerName: string; customerEmail: string })[];
  }

  async getOrder(id: string): Promise<Orders | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order || undefined;
  }

  async createOrder(order: InsertOrders): Promise<Orders> {
    // Parse total to calculate subtotal
    const totalAmount = parseFloat(order.total);
    const shippingFee = order.shippingFee ? parseFloat(order.shippingFee) : 30000; // Default 30k VND shipping
    const taxAmount = order.tax ? parseFloat(order.tax) : 0;
    const subtotal = order.subtotal ? parseFloat(order.subtotal) : totalAmount - shippingFee - taxAmount;
    
    // Set defaults for new fields if not provided
    const orderData = {
      ...order,
      subtotal: subtotal.toString(),
      shippingFee: shippingFee.toString(),
      tax: taxAmount.toString(),
      shippingInfo: order.shippingInfo || {},
      items: order.items || [],
      source: order.source || 'admin',
      syncStatus: order.syncStatus || 'manual',
      paymentMethod: order.paymentMethod || 'cash'
    };
    
    const [newOrder] = await db.insert(orders).values(orderData as any).returning();
    
    // 🎯 AUTO-COMPLETE PROFILE: Mark profile as complete when first order is created
    if ((orderData as any).customerId) {
      try {
        await db
          .update(customers)
          .set({ profileStatus: 'complete' })
          .where(
            and(
              eq(customers.id, (orderData as any).customerId),
              eq(customers.profileStatus, 'incomplete')
            )
          );
      } catch (error) {
        console.warn('Failed to auto-complete customer profile:', error);
        // Non-critical, don't fail order creation
      }
    }
    
    // Handle debt payment: update customer's total debt
    if ((orderData as any).paymentMethod === 'debt' && (orderData as any).customerId) {
      const orderTotal = parseFloat((orderData as any).total);
      
      await db
        .update(customers)
        .set({
          totalDebt: sql`COALESCE(total_debt, 0) + ${orderTotal}`
        })
        .where(eq(customers.id, (orderData as any).customerId));
    }
    
    // 🏭 AUTO-ASSIGN TO VENDORS: Create vendor_orders for consignment products
    if ((orderData as any).items && (orderData as any).items.length > 0 && (orderData as any).customerId) {
      try {
        const vendorAssignment = await assignOrderToVendors({
          orderId: newOrder.id,
          customerId: (orderData as any).customerId,
          orderItems: (orderData as any).items.map((item: any) => ({
            productId: item.productId || item.id,
            quantity: item.quantity,
            price: item.price
          })),
          paymentMethod: (orderData as any).paymentMethod,
          shippingInfo: (orderData as any).shippingInfo
        });

        if (vendorAssignment.success && vendorAssignment.vendorOrderIds.length > 0) {
          console.log(`✅ Assigned order ${newOrder.id} to ${vendorAssignment.vendorOrderIds.length} vendors`);
        }
      } catch (error) {
        console.error('❌ Failed to auto-assign order to vendors (non-critical):', error);
        // Non-critical error: Don't fail order creation if vendor assignment fails
      }
    }
    
    return newOrder;
  }

  async updateOrderStatus(id: string, status: string): Promise<Orders | undefined> {
    const [updatedOrder] = await db
      .update(orders)
      .set({ status: status as any, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return updatedOrder || undefined;
  }

  async updateOrder(id: string, order: Partial<InsertOrders>): Promise<Orders | undefined> {
    const [updatedOrder] = await db
      .update(orders)
      .set({ ...order, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return updatedOrder || undefined;
  }

  async deleteOrder(id: string): Promise<boolean> {
    // First delete order items
    await db.delete(orderItems).where(eq(orderItems.orderId, id));
    // Then delete the order
    const result = await db.delete(orders).where(eq(orders.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getOrderWithDetails(id: string): Promise<(Orders & { customerName: string; customerEmail: string; orderItems: (OrderItems & { productName: string })[] }) | undefined> {
    // Get order with customer info
    const orderResult = await db
      .select({
        id: orders.id,
        userId: orders.userId,
        total: orders.total,
        status: orders.status,
        items: orders.items,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
        customerName: customers.name,
        customerEmail: customers.email,
      })
      .from(orders)
      .leftJoin(customers, eq(orders.userId, customers.id))
      .where(eq(orders.id, id));

    if (!orderResult[0]) return undefined;
    
    const order = orderResult[0];

    // Get order items with product info
    const itemsResult = await db
      .select({
        id: orderItems.id,
        orderId: orderItems.orderId,
        productId: orderItems.productId,
        quantity: orderItems.quantity,
        price: orderItems.price,
        productName: products.name,
      })
      .from(orderItems)
      .leftJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orderItems.orderId, id));

    return {
      ...order,
      customerName: order.customerName || 'Unknown Customer',
      customerEmail: order.customerEmail || 'unknown@example.com',
      orderItems: itemsResult.map(item => ({
        ...item,
        productName: item.productName || 'Unknown Product'
      })),
    } as any;
  }

  // Order items methods
  async getOrderItems(orderId: string): Promise<OrderItems[]> {
    return await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  }

  async createOrderItem(orderItem: InsertOrderItems): Promise<OrderItems> {
    const [newOrderItem] = await db.insert(orderItems).values(orderItem as any).returning();
    return newOrderItem;
  }

  async deleteOrderItem(id: string): Promise<boolean> {
    const result = await db.delete(orderItems).where(eq(orderItems.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Debt management methods
  async updateCustomerDebt(customerId: string, paymentAmount: number): Promise<Customers | undefined> {
    const [updatedCustomer] = await db
      .update(customers)
      .set({
        totalDebt: sql`GREATEST(0, COALESCE(total_debt, 0) - ${paymentAmount})`
      })
      .where(eq(customers.id, customerId))
      .returning();
    return updatedCustomer || undefined;
  }

  async getCustomerDebtInfo(customerId: string): Promise<{ totalDebt: number; creditLimit: number } | undefined> {
    const [customer] = await db
      .select({
        totalDebt: customers.totalDebt,
        creditLimit: customers.creditLimit
      })
      .from(customers)
      .where(eq(customers.id, customerId));
    
    if (!customer) return undefined;
    
    return {
      totalDebt: parseFloat(customer.totalDebt || '0'),
      creditLimit: parseFloat(customer.creditLimit || '0')
    };
  }

  // Social account methods
  async getSocialAccounts(): Promise<SocialAccounts[]> {
    return await db.select().from(socialAccounts).orderBy(desc(socialAccounts.createdAt));
  }

  async getSocialAccount(id: string): Promise<SocialAccounts | undefined> {
    const [account] = await db.select().from(socialAccounts).where(eq(socialAccounts.id, id));
    return account || undefined;
  }

  async getSocialAccountById(id: string): Promise<SocialAccounts | undefined> {
    const [account] = await db.select().from(socialAccounts).where(eq(socialAccounts.id, id));
    return account || undefined;
  }

  async getSocialAccountByPlatform(platform: string): Promise<SocialAccounts | undefined> {
    const [account] = await db.select().from(socialAccounts).where(eq(socialAccounts.platform, platform as any));
    return account || undefined;
  }

  async getSocialAccountsByPlatform(platform: string): Promise<SocialAccounts[]> {
    return await db.select().from(socialAccounts).where(eq(socialAccounts.platform, platform as any));
  }


  async createSocialAccount(account: InsertSocialAccounts): Promise<SocialAccounts> {
    const [newAccount] = await db.insert(socialAccounts).values([account as any]).returning();
    return newAccount;
  }

  async updateSocialAccount(id: string, account: Partial<InsertSocialAccounts>): Promise<SocialAccounts | undefined> {
    const [updatedAccount] = await db
      .update(socialAccounts)
      .set({ ...account, updatedAt: new Date() } as any)
      .where(eq(socialAccounts.id, id))
      .returning();
    return updatedAccount || undefined;
  }

  // 🤖 Bot Config methods for per-fanpage RASA configuration
  async getSocialAccountBotConfig(id: string): Promise<any | null> {
    const account = await this.getSocialAccount(id);
    if (!account) return null; // Account doesn't exist
    // Return stored config or empty object (all fields optional) for existing accounts
    const config = account.botConfig as any | null | undefined;
    return config || {}; // Guarantee {} for existing accounts without config
  }

  async updateSocialAccountBotConfig(id: string, botConfig: any): Promise<SocialAccounts | undefined> {
    const [updatedAccount] = await db
      .update(socialAccounts)
      .set({ botConfig: botConfig as any, updatedAt: new Date() })
      .where(eq(socialAccounts.id, id))
      .returning();
    return updatedAccount || undefined;
  }

  // Chatbot methods
  async getChatbotConversations(limit = 50): Promise<ChatbotConversations[]> {
    return await db
      .select()
      .from(chatbotConversations)
      .orderBy(desc(chatbotConversations.createdAt))
      .limit(limit);
  }

  async createChatbotConversation(conversation: InsertChatbotConversations): Promise<ChatbotConversations> {
    const [newConversation] = await db.insert(chatbotConversations).values(conversation as any).returning();
    return newConversation;
  }

  async getChatbotConversation(id: string): Promise<ChatbotConversations | undefined> {
    const [conversation] = await db.select().from(chatbotConversations).where(eq(chatbotConversations.id, id));
    return conversation || undefined;
  }

  async getChatbotConversationBySession(sessionId: string): Promise<ChatbotConversations | undefined> {
    const [conversation] = await db.select().from(chatbotConversations).where(eq(chatbotConversations.sessionId, sessionId));
    return conversation || undefined;
  }

  async getChatbotConversationByCustomer(customerId: string): Promise<ChatbotConversations | undefined> {
    const [conversation] = await db
      .select()
      .from(chatbotConversations)
      .where(and(
        eq(chatbotConversations.customerId, customerId),
        eq(chatbotConversations.status, 'active')
      ))
      .orderBy(desc(chatbotConversations.createdAt))
      .limit(1);
    return conversation || undefined;
  }

  async updateChatbotConversation(id: string, conversation: Partial<InsertChatbotConversations>): Promise<ChatbotConversations | undefined> {
    const [updatedConversation] = await db
      .update(chatbotConversations)
      .set({ ...conversation, updatedAt: new Date() })
      .where(eq(chatbotConversations.id, id))
      .returning();
    return updatedConversation || undefined;
  }

  async addMessageToChatbotConversation(conversationId: string, message: any): Promise<ChatbotConversations | undefined> {
    // Get current conversation to access existing messages
    const conversation = await this.getChatbotConversation(conversationId);
    if (!conversation) {
      return undefined;
    }

    // Add new message to existing messages array
    const currentMessages = Array.isArray(conversation.messages) ? conversation.messages : [];
    const updatedMessages = [...currentMessages, {
      ...message,
      timestamp: new Date().toISOString(),
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }];

    // Update conversation with new messages and metadata
    const [updatedConversation] = await db
      .update(chatbotConversations)
      .set({
        messages: updatedMessages,
        updatedAt: new Date(),
        status: 'active'
      })
      .where(eq(chatbotConversations.id, conversationId))
      .returning();

    return updatedConversation || undefined;
  }

  async getChatbotMessages(conversationId: string): Promise<any[]> {
    const conversation = await this.getChatbotConversation(conversationId);
    if (!conversation) {
      return [];
    }
    
    // Return messages from JSONB field, ensuring it's an array
    const messages = conversation.messages;
    return Array.isArray(messages) ? messages : [];
  }

  // Bot Settings methods
  async getBotSettings(): Promise<BotSettings | undefined> {
    const [settings] = await db.select().from(botSettings).limit(1);
    return settings || undefined;
  }

  async createBotSettings(settings: InsertBotSettings): Promise<BotSettings> {
    const [newSettings] = await db.insert(botSettings).values(settings).returning();
    return newSettings;
  }

  async updateBotSettings(id: string, settings: Partial<InsertBotSettings>): Promise<BotSettings | undefined> {
    const [updatedSettings] = await db
      .update(botSettings)
      .set({ ...settings, updatedAt: new Date() })
      .where(eq(botSettings.id, id))
      .returning();
    return updatedSettings || undefined;
  }

  async getBotSettingsOrDefault(): Promise<BotSettings> {
    const settings = await this.getBotSettings();
    if (settings) {
      return settings;
    }
    
    // Create default settings if none exist
    const defaultSettings: InsertBotSettings = {
      rasaUrl: "http://localhost:5005",
      webhookUrl: "",
      isEnabled: true,
      autoReply: false,
      connectionTimeout: 5000,
      maxRetries: 3,
      healthStatus: "offline"
    };
    
    return await this.createBotSettings(defaultSettings);
  }

  // Centralized serializer to prevent secret leakage
  toPublicBotSettings(settings: BotSettings | undefined | null): any {
    if (!settings) return null;
    const { apiKey, ...publicSettings } = settings;
    return publicSettings;
  }

  // API Management methods
  async getApiConfigurations(): Promise<ApiConfigurations[]> {
    return await db.select().from(apiConfigurations).orderBy(desc(apiConfigurations.createdAt));
  }

  async getApiConfiguration(id: string): Promise<ApiConfigurations | undefined> {
    const [config] = await db.select().from(apiConfigurations).where(eq(apiConfigurations.id, id));
    return config || undefined;
  }

  async getApiConfigurationByEndpoint(endpoint: string, method?: string): Promise<ApiConfigurations | undefined> {
    const conditions = [eq(apiConfigurations.endpoint, endpoint)];
    if (method) {
      conditions.push(eq(apiConfigurations.method, method));
    }
    
    const [config] = await db.select().from(apiConfigurations).where(and(...conditions));
    return config || undefined;
  }

  async getApiConfigurationsByCategory(category: string): Promise<ApiConfigurations[]> {
    return await db.select().from(apiConfigurations)
      .where(eq(apiConfigurations.category, category))
      .orderBy(desc(apiConfigurations.createdAt));
  }

  async createApiConfiguration(config: InsertApiConfigurations): Promise<ApiConfigurations> {
    const [newConfig] = await db.insert(apiConfigurations).values(config as any).returning();
    return newConfig;
  }

  async updateApiConfiguration(id: string, config: Partial<ApiConfigurations>): Promise<ApiConfigurations | undefined> {
    const [updatedConfig] = await db
      .update(apiConfigurations)
      .set({ ...config, updatedAt: new Date() })
      .where(eq(apiConfigurations.id, id))
      .returning();
    return updatedConfig || undefined;
  }

  async deleteApiConfiguration(id: string): Promise<boolean> {
    const result = await db.delete(apiConfigurations).where(eq(apiConfigurations.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async toggleApiEnabled(id: string, enabled: boolean): Promise<ApiConfigurations | undefined> {
    const [updatedConfig] = await db
      .update(apiConfigurations)
      .set({ 
        isEnabled: enabled, 
        lastToggled: new Date(),
        updatedAt: new Date() 
      })
      .where(eq(apiConfigurations.id, id))
      .returning();
    return updatedConfig || undefined;
  }

  async incrementApiAccess(id: string, responseTime?: number): Promise<void> {
    if (responseTime !== undefined) {
      // Atomic update with response time averaging
      await db
        .update(apiConfigurations)
        .set({
          accessCount: sql`${apiConfigurations.accessCount} + 1`,
          avgResponseTime: sql`((${apiConfigurations.avgResponseTime}::numeric * ${apiConfigurations.accessCount}) + ${responseTime}) / (${apiConfigurations.accessCount} + 1)`,
          lastAccessed: new Date(),
          updatedAt: new Date()
        })
        .where(eq(apiConfigurations.id, id));
    } else {
      // Atomic update without response time
      await db
        .update(apiConfigurations)
        .set({
          accessCount: sql`${apiConfigurations.accessCount} + 1`,
          lastAccessed: new Date(),
          updatedAt: new Date()
        })
        .where(eq(apiConfigurations.id, id));
    }
  }

  async incrementApiError(id: string): Promise<void> {
    await db
      .update(apiConfigurations)
      .set({ 
        errorCount: sql`${apiConfigurations.errorCount} + 1`,
        lastError: new Date(),
        updatedAt: new Date()
      })
      .where(eq(apiConfigurations.id, id));
  }

  async getEnabledApiConfigurations(): Promise<ApiConfigurations[]> {
    return await db.select().from(apiConfigurations)
      .where(and(
        eq(apiConfigurations.isEnabled, true),
        eq(apiConfigurations.maintenanceMode, false)
      ))
      .orderBy(apiConfigurations.priority, apiConfigurations.category);
  }

  async updateApiStats(id: string, stats: { accessCount?: number; errorCount?: number; avgResponseTime?: number }): Promise<void> {
    const updates: any = { updatedAt: new Date() };
    
    if (stats.accessCount !== undefined) updates.accessCount = stats.accessCount;
    if (stats.errorCount !== undefined) updates.errorCount = stats.errorCount;
    if (stats.avgResponseTime !== undefined) updates.avgResponseTime = stats.avgResponseTime;

    await db
      .update(apiConfigurations)
      .set(updates)
      .where(eq(apiConfigurations.id, id));
  }

  // Dashboard stats
  async getDashboardStats(): Promise<{
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    totalProducts: number;
  }> {
    const [revenueResult] = await db
      .select({ 
        total: sql<number>`COALESCE(SUM(${orders.total}::numeric), 0)` 
      })
      .from(orders)
      .where(eq(orders.status, 'delivered'));

    const [orderCountResult] = await db
      .select({ count: count() })
      .from(orders);

    const [customerCountResult] = await db
      .select({ count: count() })
      .from(customers);

    const [productCountResult] = await db
      .select({ count: count() })
      .from(products);

    return {
      totalRevenue: Number(revenueResult?.total || 0),
      totalOrders: orderCountResult?.count || 0,
      totalCustomers: customerCountResult?.count || 0,
      totalProducts: productCountResult?.count || 0,
    };
  }

  // Storefront methods
  async getStorefrontConfigs(): Promise<StorefrontConfig[]> {
    return await db.select().from(storefrontConfig).orderBy(desc(storefrontConfig.updatedAt));
  }

  async getStorefrontConfig(id: string): Promise<StorefrontConfig | undefined> {
    const [config] = await db.select().from(storefrontConfig).where(eq(storefrontConfig.id, id));
    return config || undefined;
  }

  async getStorefrontConfigByName(name: string): Promise<StorefrontConfig | undefined> {
    const [config] = await db.select().from(storefrontConfig).where(eq(storefrontConfig.name, name));
    return config || undefined;
  }

  async createStorefrontConfig(insertConfig: InsertStorefrontConfig): Promise<StorefrontConfig> {
    const [config] = await db.insert(storefrontConfig).values(insertConfig as any).returning();
    return config;
  }

  async updateStorefrontConfig(id: string, updateConfig: Partial<InsertStorefrontConfig>): Promise<StorefrontConfig | undefined> {
    const [config] = await db
      .update(storefrontConfig)
      .set({ ...updateConfig, updatedAt: new Date() })
      .where(eq(storefrontConfig.id, id))
      .returning();
    return config || undefined;
  }

  async getTopProductsForStorefront(configId: string): Promise<Products[]> {
    const config = await this.getStorefrontConfig(configId);
    if (!config) return [];

    if (config.displayMode === 'manual' && config.selectedProductIds) {
      // Get manually selected products
      const productIds = (config.selectedProductIds as string[]) || [];
      if (productIds.length === 0) return [];
      
      const selectedProducts = await Promise.all(
        productIds.map(async (id) => {
          const [product] = await db.select().from(products).where(eq(products.id, id));
          return product;
        })
      );
      
      return selectedProducts.filter(Boolean).slice(0, config.topProductsCount);
    } else {
      // Auto mode - get top products by stock or created date
      return await db
        .select()
        .from(products)
        .where(eq(products.status, 'active'))
        .orderBy(desc(products.stock), desc(products.createdAt))
        .limit(config.topProductsCount);
    }
  }

  async getStorefrontOrders(configId?: string, limit: number = 50): Promise<StorefrontOrders[]> {
    if (configId) {
      return await db
        .select()
        .from(storefrontOrders)
        .where(eq(storefrontOrders.storefrontConfigId, configId))
        .orderBy(desc(storefrontOrders.createdAt))
        .limit(limit);
    } else {
      return await db
        .select()
        .from(storefrontOrders)
        .orderBy(desc(storefrontOrders.createdAt))
        .limit(limit);
    }
  }

  async getStorefrontOrder(id: string): Promise<StorefrontOrders | undefined> {
    const [order] = await db
      .select()
      .from(storefrontOrders)
      .where(eq(storefrontOrders.id, id));
    return order || undefined;
  }

  async createStorefrontOrder(order: InsertStorefrontOrders): Promise<StorefrontOrders> {
    const [newOrder] = await db.insert(storefrontOrders).values(order as any).returning();
    return newOrder;
  }

  async updateStorefrontOrderStatus(id: string, status: string): Promise<StorefrontOrders | undefined> {
    const [order] = await db
      .update(storefrontOrders)
      .set({ status: status as any, updatedAt: new Date() })
      .where(eq(storefrontOrders.id, id))
      .returning();
    
    // Trigger commission calculation for delivered/shipped orders
    if (order && (status === 'delivered' || status === 'shipped')) {
      // Import commission service dynamically to avoid circular dependency
      try {
        const { CommissionService } = await import('./services/commission-service');
        const result = await CommissionService.calculateCommissionForOrder(id, status);
        
        if (result.success) {
          console.log(`✅ Commission processed for order ${id}:`, result);
        } else if (!result.alreadyProcessed) {
          console.log(`⚠️ Commission not processed for order ${id}:`, result.message);
        }
      } catch (error) {
        console.error('❌ Error calculating commission for order:', id, error);
      }
    }
    
    return order || undefined;
  }

  // Affiliate-specific storefront order methods
  async getStorefrontOrdersByAffiliateCode(affiliateCode: string, limit: number = 50): Promise<StorefrontOrders[]> {
    return await db
      .select()
      .from(storefrontOrders)
      .where(eq(storefrontOrders.affiliateCode, affiliateCode))
      .orderBy(desc(storefrontOrders.createdAt))
      .limit(limit);
  }

  async getStorefrontOrdersByAffiliateCodeAndDateRange(affiliateCode: string, startDate: Date, endDate: Date): Promise<StorefrontOrders[]> {
    return await db
      .select()
      .from(storefrontOrders)
      .where(
        and(
          eq(storefrontOrders.affiliateCode, affiliateCode),
          gte(storefrontOrders.createdAt, startDate),
          lte(storefrontOrders.createdAt, endDate)
        )
      )
      .orderBy(desc(storefrontOrders.createdAt));
  }

  async getStorefrontOrdersByAffiliateCodeWithFilters(filters: any, limit: number = 50, offset: number = 0): Promise<StorefrontOrders[]> {
    const { affiliateCode, status, startDate, endDate, search } = filters;
    
    let query = db
      .select()
      .from(storefrontOrders)
      .where(eq(storefrontOrders.affiliateCode, affiliateCode));
    
    const conditions = [eq(storefrontOrders.affiliateCode, affiliateCode)];
    
    if (status) {
      conditions.push(eq(storefrontOrders.status, status));
    }
    
    if (startDate) {
      conditions.push(gte(storefrontOrders.createdAt, startDate));
    }
    
    if (endDate) {
      conditions.push(lte(storefrontOrders.createdAt, endDate));
    }
    
    if (search) {
      conditions.push(
        or(
          ilike(storefrontOrders.customerName, `%${search}%`),
          ilike(storefrontOrders.customerPhone, `%${search}%`),
          ilike(storefrontOrders.productName, `%${search}%`)
        )!
      );
    }
    
    return await db
      .select()
      .from(storefrontOrders)
      .where(and(...conditions))
      .orderBy(desc(storefrontOrders.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getStorefrontOrdersCountByAffiliateCode(affiliateCode: string, filters?: any): Promise<number> {
    let query = db
      .select({ count: count() })
      .from(storefrontOrders)
      .where(eq(storefrontOrders.affiliateCode, affiliateCode));
    
    if (filters) {
      const { status, startDate, endDate, search } = filters;
      const conditions = [eq(storefrontOrders.affiliateCode, affiliateCode)];
      
      if (status) {
        conditions.push(eq(storefrontOrders.status, status));
      }
      
      if (startDate) {
        conditions.push(gte(storefrontOrders.createdAt, startDate));
      }
      
      if (endDate) {
        conditions.push(lte(storefrontOrders.createdAt, endDate));
      }
      
      if (search) {
        conditions.push(
          or(
            ilike(storefrontOrders.customerName, `%${search}%`),
            ilike(storefrontOrders.customerPhone, `%${search}%`),
            ilike(storefrontOrders.productName, `%${search}%`)
          )!
        );
      }
      
      query = db
        .select({ count: count() })
        .from(storefrontOrders)
        .where(and(...conditions));
    }
    
    const [result] = await query;
    return result.count;
  }

  async getCustomerByEmail(email: string): Promise<Customers | undefined> {
    const [customer] = await db
      .select()
      .from(customers)
      .where(eq(customers.email, email));
    return customer || undefined;
  }

  // Payment methods
  async getPayment(orderId: string): Promise<Payments | undefined> {
    const [payment] = await db.select().from(payments).where(eq(payments.orderId, orderId));
    return payment || undefined;
  }

  async createPayment(payment: InsertPayments): Promise<Payments> {
    const [newPayment] = await db.insert(payments).values(payment as any).returning();
    return newPayment;
  }

  /**
   * 🚀 Create Payment with Automatic QR Generation
   * Enhanced method that auto-generates VietQR codes for SHB bank
   */
  async createPaymentWithQR(orderId: string, amount: number, description?: string): Promise<Payments> {
    // Import VietQRService dynamically để avoid circular dependencies
    const { VietQRService } = await import('./services/vietqr-service');
    
    // 🎯 Generate logical order number for QR reference
    const order = await this.getOrder(orderId);
    const orderDate = order?.createdAt ? new Date(order.createdAt) : new Date();
    const dateStr = orderDate.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
    const logicOrderId = `${dateStr}-${orderId.slice(-3).toUpperCase()}`; // Short reference
    
    // 🏦 Generate VietQR code automatically
    const qrResult = VietQRService.generateMobileQR(
      amount,
      logicOrderId,
      description || `Thanh toán đơn hàng ${logicOrderId}`
    );
    
    // 💾 Create payment record với auto-generated QR
    const paymentData: InsertPayments = {
      orderId,
      method: 'bank_transfer',
      amount: amount.toString(),
      qrCode: qrResult.qrCodeUrl,
      status: 'pending',
      bankInfo: qrResult.bankInfo,
    };
    
    const [newPayment] = await db.insert(payments).values(paymentData as any).returning();
    return newPayment;
  }

  async updatePaymentStatus(id: string, status: string, transactionId?: string): Promise<Payments | undefined> {
    const updateData: any = { status, updatedAt: new Date() };
    if (transactionId) {
      updateData.transactionId = transactionId;
    }
    
    const [payment] = await db
      .update(payments)
      .set(updateData)
      .where(eq(payments.id, id))
      .returning();
    return payment || undefined;
  }

  // Inventory methods for RASA API
  async getProductStock(productId: string): Promise<number> {
    const product = await this.getProduct(productId);
    return product?.stock || 0;
  }

  async updateProductStock(productId: string, newStock: number): Promise<void> {
    await db
      .update(products)
      .set({ stock: newStock, updatedAt: new Date() })
      .where(eq(products.id, productId));
  }

  // Shop settings methods
  async getShopSettings(): Promise<ShopSettings | undefined> {
    // Get the default shop settings (isDefault=true)
    const [settings] = await db.select().from(shopSettings).where(eq(shopSettings.isDefault, true)).limit(1);
    return settings || undefined;
  }

  async getAllShopSettings(): Promise<ShopSettings[]> {
    return await db.select().from(shopSettings).orderBy(desc(shopSettings.isDefault), desc(shopSettings.updatedAt));
  }

  async getShopSettingsById(id: string): Promise<ShopSettings | undefined> {
    const [settings] = await db.select().from(shopSettings).where(eq(shopSettings.id, id));
    return settings || undefined;
  }

  async getDefaultShopSettings(): Promise<ShopSettings | undefined> {
    const [settings] = await db.select().from(shopSettings).where(eq(shopSettings.isDefault, true));
    return settings || undefined;
  }

  async createShopSettings(insertSettings: InsertShopSettings): Promise<ShopSettings> {
    // If this is set as default, use transaction to ensure atomicity
    if (insertSettings.isDefault) {
      return await db.transaction(async (tx) => {
        // Unset all other defaults first
        await tx.update(shopSettings).set({ isDefault: false, updatedAt: new Date() });
        
        // Then create the new default settings
        const [settings] = await tx.insert(shopSettings).values(insertSettings as any).returning();
        return settings;
      });
    }
    
    const [settings] = await db.insert(shopSettings).values(insertSettings as any).returning();
    return settings;
  }

  async updateShopSettings(id: string, updateSettings: Partial<InsertShopSettings>): Promise<ShopSettings | undefined> {
    // If this is being set as default, use transaction to ensure atomicity
    if (updateSettings.isDefault) {
      return await db.transaction(async (tx) => {
        // Unset all other defaults first
        await tx.update(shopSettings).set({ isDefault: false, updatedAt: new Date() });
        
        // Then update the specified settings as default
        const [settings] = await tx
          .update(shopSettings)
          .set({ ...updateSettings, updatedAt: new Date() })
          .where(eq(shopSettings.id, id))
          .returning();
        return settings || undefined;
      });
    }
    
    const [settings] = await db
      .update(shopSettings)
      .set({ ...updateSettings, updatedAt: new Date() })
      .where(eq(shopSettings.id, id))
      .returning();
    return settings || undefined;
  }

  async deleteShopSettings(id: string): Promise<boolean> {
    const result = await db.delete(shopSettings).where(eq(shopSettings.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async setDefaultShopSettings(id: string): Promise<ShopSettings | undefined> {
    // Use transaction to ensure atomic operation
    return await db.transaction(async (tx) => {
      // First, unset all defaults
      await tx.update(shopSettings).set({ isDefault: false, updatedAt: new Date() });
      
      // Then set the specified one as default
      const [settings] = await tx
        .update(shopSettings)
        .set({ isDefault: true, updatedAt: new Date() })
        .where(eq(shopSettings.id, id))
        .returning();
      return settings || undefined;
    });
  }

  // Product Landing Page methods
  async getAllProductLandingPages(): Promise<ProductLandingPages[]> {
    const result = await db
      .select()
      .from(productLandingPages)
      .orderBy(desc(productLandingPages.createdAt));
    return result;
  }

  async getProductLandingPageById(id: string): Promise<ProductLandingPages | undefined> {
    const [landingPage] = await db
      .select()
      .from(productLandingPages)
      .where(eq(productLandingPages.id, id));
    return landingPage || undefined;
  }

  async getProductLandingPageBySlug(slug: string): Promise<ProductLandingPages | undefined> {
    // Normalize input to handle case/whitespace/encoding issues
    const normalizedSlug = decodeURIComponent(slug).trim().toLowerCase();
    
    // Query with case-insensitive comparison
    const [landingPage] = await db
      .select()
      .from(productLandingPages)
      .where(sql`lower(${productLandingPages.slug}) = ${normalizedSlug}`);
    
    // Fallback: try exact match if normalized didn't work
    if (!landingPage) {
      const [exactMatch] = await db
        .select()
        .from(productLandingPages)
        .where(eq(productLandingPages.slug, slug));
      return exactMatch || undefined;
    }
    
    return landingPage || undefined;
  }

  async createProductLandingPage(data: InsertProductLandingPages): Promise<ProductLandingPages> {
    // Check if slug already exists
    const existing = await this.getProductLandingPageBySlug(data.slug);
    if (existing) {
      throw new Error('Slug already exists');
    }

    const [landingPage] = await db
      .insert(productLandingPages)
      .values({
        ...data,
        viewCount: 0,
        orderCount: 0,
        conversionRate: "0.00"
      } as any)
      .returning();
    return landingPage;
  }

  async updateProductLandingPage(id: string, data: Partial<InsertProductLandingPages>): Promise<ProductLandingPages | undefined> {
    const [landingPage] = await db
      .update(productLandingPages)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(productLandingPages.id, id))
      .returning();
    return landingPage || undefined;
  }

  async deleteProductLandingPage(id: string): Promise<boolean> {
    const result = await db.delete(productLandingPages).where(eq(productLandingPages.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async incrementLandingPageView(id: string): Promise<void> {
    await db
      .update(productLandingPages)
      .set({
        viewCount: sql`${productLandingPages.viewCount} + 1`,
        updatedAt: new Date()
      })
      .where(eq(productLandingPages.id, id));
  }

  async incrementLandingPageOrder(id: string): Promise<void> {
    await db
      .update(productLandingPages)
      .set({
        orderCount: sql`${productLandingPages.orderCount} + 1`,
        updatedAt: new Date()
      })
      .where(eq(productLandingPages.id, id));
  }

  async getProductLandingPageWithDetails(idOrSlug: string): Promise<any> {
    let landingPage: ProductLandingPages | undefined;
    
    // Try to get by slug first, then by ID
    // UUIDs are exactly 36 characters with dashes at positions 8,13,18,23
    const isUUID = idOrSlug.length === 36 && 
                   idOrSlug[8] === '-' && 
                   idOrSlug[13] === '-' && 
                   idOrSlug[18] === '-' && 
                   idOrSlug[23] === '-';
    
    if (isUUID) {
      // This looks like a UUID
      landingPage = await this.getProductLandingPageById(idOrSlug);
    } else {
      // This looks like a slug
      landingPage = await this.getProductLandingPageBySlug(idOrSlug);
    }
    if (!landingPage) return null;

    // Get product details
    const product = await this.getProduct(landingPage.productId);
    if (!product) return null;

    return {
      ...landingPage,
      product,
      finalPrice: landingPage.customPrice || parseFloat(product.price),
      displayName: landingPage.title || product.name,
      displayDescription: landingPage.description || product.description,
      availableStock: product.stock || 0
    };
  }

  // Product Landing Click Tracking methods
  async createProductLandingClick(data: InsertProductLandingClicks): Promise<ProductLandingClicks> {
    const [click] = await db.insert(productLandingClicks).values(data as any).returning();
    return click;
  }

  async getProductLandingClickByCookie(trackingCookie: string): Promise<ProductLandingClicks | undefined> {
    const clicks = await db
      .select()
      .from(productLandingClicks)
      .where(and(
        eq(productLandingClicks.trackingCookie, trackingCookie),
        eq(productLandingClicks.converted, false)
      ))
      .orderBy(desc(productLandingClicks.clickedAt))
      .limit(1);
    
    return clicks[0];
  }

  async updateProductLandingClickConversion(clickId: number, orderId: string, conversionValue: string): Promise<void> {
    await db.update(productLandingClicks)
      .set({
        converted: true,
        orderId,
        conversionValue,
        convertedAt: new Date()
      })
      .where(eq(productLandingClicks.id, clickId));
  }

  // Product Review methods
  async getProductReviews(productId: string, limit = 20): Promise<ProductReviews[]> {
    return await db
      .select()
      .from(productReviews)
      .where(and(
        eq(productReviews.productId, productId),
        eq(productReviews.status, 'approved')
      ))
      .orderBy(desc(productReviews.createdAt))
      .limit(limit);
  }

  async getProductReviewsWithStats(productId: string): Promise<{ 
    reviews: ProductReviews[]; 
    averageRating: number; 
    totalReviews: number; 
    ratingCounts: { [key: number]: number } 
  }> {
    // Get reviews
    const reviews = await this.getProductReviews(productId);
    
    // Get rating statistics
    const stats = await db
      .select({
        rating: productReviews.rating,
        count: count()
      })
      .from(productReviews)
      .where(and(
        eq(productReviews.productId, productId),
        eq(productReviews.status, 'approved')
      ))
      .groupBy(productReviews.rating);

    // Calculate averages and counts
    let totalReviews = 0;
    let totalRating = 0;
    const ratingCounts: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    stats.forEach(stat => {
      const rating = stat.rating;
      const count = stat.count;
      totalReviews += count;
      totalRating += rating * count;
      ratingCounts[rating] = count;
    });

    const averageRating = totalReviews > 0 ? Math.round((totalRating / totalReviews) * 10) / 10 : 0;

    return {
      reviews,
      averageRating,
      totalReviews,
      ratingCounts
    };
  }

  async createProductReview(review: InsertProductReviews): Promise<ProductReviews> {
    const [newReview] = await db.insert(productReviews).values(review as any).returning();
    return newReview;
  }

  async updateProductReview(id: string, review: Partial<InsertProductReviews>): Promise<ProductReviews | undefined> {
    const [updatedReview] = await db
      .update(productReviews)
      .set({ ...review, updatedAt: new Date() })
      .where(eq(productReviews.id, id))
      .returning();
    return updatedReview || undefined;
  }

  async deleteProductReview(id: string): Promise<boolean> {
    const result = await db.delete(productReviews).where(eq(productReviews.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async incrementHelpfulCount(id: string): Promise<boolean> {
    try {
      await db
        .update(productReviews)
        .set({
          helpfulCount: sql`${productReviews.helpfulCount} + 1`,
          updatedAt: new Date()
        })
        .where(eq(productReviews.id, id));
      return true;
    } catch {
      return false;
    }
  }

  // Product FAQ methods
  async getProductFAQs(productId: string, includeInactive = false): Promise<ProductFAQ[]> {
    const whereClause = includeInactive 
      ? eq(productFAQs.productId, productId)
      : and(
          eq(productFAQs.productId, productId),
          eq(productFAQs.isActive, true)
        );
    
    return await db
      .select()
      .from(productFAQs)
      .where(whereClause)
      .orderBy(productFAQs.sortOrder, productFAQs.createdAt);
  }

  async getProductFAQ(id: string): Promise<ProductFAQ | undefined> {
    const [faq] = await db.select().from(productFAQs).where(eq(productFAQs.id, id));
    return faq || undefined;
  }

  async createProductFAQ(faq: InsertProductFAQ): Promise<ProductFAQ> {
    const [newFAQ] = await db.insert(productFAQs).values(faq as any).returning();
    return newFAQ;
  }

  async updateProductFAQ(id: string, faq: Partial<InsertProductFAQ>): Promise<ProductFAQ | undefined> {
    const [updatedFAQ] = await db
      .update(productFAQs)
      .set({ ...faq, updatedAt: new Date() })
      .where(eq(productFAQs.id, id))
      .returning();
    return updatedFAQ || undefined;
  }

  async getMaxProductFAQSortOrder(productId: string): Promise<number> {
    const result = await db
      .select({ maxSortOrder: sql<number>`COALESCE(MAX(${productFAQs.sortOrder}), -1)` })
      .from(productFAQs)
      .where(eq(productFAQs.productId, productId));
    
    return result[0]?.maxSortOrder ?? -1;
  }

  async deleteProductFAQ(id: string): Promise<boolean> {
    const result = await db.delete(productFAQs).where(eq(productFAQs.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async updateProductFAQOrder(productId: string, faqIds: string[]): Promise<boolean> {
    try {
      // Update sort order for each FAQ
      for (let i = 0; i < faqIds.length; i++) {
        await db
          .update(productFAQs)
          .set({ sortOrder: i, updatedAt: new Date() })
          .where(and(
            eq(productFAQs.id, faqIds[i]),
            eq(productFAQs.productId, productId)
          ));
      }
      return true;
    } catch {
      return false;
    }
  }

  // Product Policy methods
  async getProductPolicies(): Promise<ProductPolicies[]> {
    return await db
      .select()
      .from(productPolicies)
      .where(eq(productPolicies.isActive, true))
      .orderBy(productPolicies.sortOrder, productPolicies.createdAt);
  }

  async getProductPolicy(id: string): Promise<ProductPolicies | undefined> {
    const [policy] = await db.select().from(productPolicies).where(eq(productPolicies.id, id));
    return policy || undefined;
  }

  async createProductPolicy(policy: InsertProductPolicies): Promise<ProductPolicies> {
    const [newPolicy] = await db.insert(productPolicies).values(policy as any).returning();
    return newPolicy;
  }

  async updateProductPolicy(id: string, policy: Partial<InsertProductPolicies>): Promise<ProductPolicies | undefined> {
    const [updatedPolicy] = await db
      .update(productPolicies)
      .set({ ...policy, updatedAt: new Date() })
      .where(eq(productPolicies.id, id))
      .returning();
    return updatedPolicy || undefined;
  }

  async deleteProductPolicy(id: string): Promise<boolean> {
    const result = await db.delete(productPolicies).where(eq(productPolicies.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Product Policy Association methods
  async getProductPolicyAssociations(productId: string): Promise<(ProductPolicyAssociations & { policy: ProductPolicies })[]> {
    const results = await db
      .select({
        productId: productPolicyAssociations.productId,
        policyId: productPolicyAssociations.policyId,
        sortOrder: productPolicyAssociations.sortOrder,
        createdAt: productPolicyAssociations.createdAt,
        policy: {
          id: productPolicies.id,
          title: productPolicies.title,
          description: productPolicies.description,
          icon: productPolicies.icon,
          type: productPolicies.type,
          isActive: productPolicies.isActive,
          sortOrder: productPolicies.sortOrder,
          createdAt: productPolicies.createdAt,
          updatedAt: productPolicies.updatedAt,
        }
      })
      .from(productPolicyAssociations)
      .leftJoin(productPolicies, eq(productPolicyAssociations.policyId, productPolicies.id))
      .where(eq(productPolicyAssociations.productId, productId))
      .orderBy(productPolicyAssociations.sortOrder);

    return results.map(row => ({
      productId: row.productId,
      policyId: row.policyId,
      sortOrder: row.sortOrder,
      createdAt: row.createdAt,
      policy: row.policy as ProductPolicies
    }));
  }

  async addProductPolicyAssociation(productId: string, policyId: string, sortOrder = 0): Promise<ProductPolicyAssociations> {
    const [association] = await db
      .insert(productPolicyAssociations)
      .values({ productId, policyId, sortOrder })
      .returning();
    return association;
  }

  async removeProductPolicyAssociation(productId: string, policyId: string): Promise<boolean> {
    const result = await db
      .delete(productPolicyAssociations)
      .where(and(
        eq(productPolicyAssociations.productId, productId),
        eq(productPolicyAssociations.policyId, policyId)
      ));
    return (result.rowCount ?? 0) > 0;
  }

  async updateProductPolicyAssociationOrder(productId: string, policyIds: string[]): Promise<boolean> {
    try {
      // Update sort order for each policy association
      for (let i = 0; i < policyIds.length; i++) {
        await db
          .update(productPolicyAssociations)
          .set({ sortOrder: i })
          .where(and(
            eq(productPolicyAssociations.productId, productId),
            eq(productPolicyAssociations.policyId, policyIds[i])
          ));
      }
      return true;
    } catch {
      return false;
    }
  }

  // Facebook Management Methods
  async getPageTags(): Promise<PageTags[]> {
    return await db.select().from(pageTags).orderBy(desc(pageTags.createdAt));
  }

  async createPageTag(tag: InsertPageTags): Promise<PageTags> {
    const [newTag] = await db.insert(pageTags).values(tag as any).returning();
    return newTag;
  }

  async updatePageTag(id: string, tag: Partial<InsertPageTags>): Promise<PageTags | undefined> {
    const [updatedTag] = await db
      .update(pageTags)
      .set({ ...tag, updatedAt: new Date() })
      .where(eq(pageTags.id, id))
      .returning();
    return updatedTag || undefined;
  }

  async deletePageTag(id: string): Promise<boolean> {
    const result = await db.delete(pageTags).where(eq(pageTags.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Unified tag methods implementation
  async getUnifiedTags(): Promise<UnifiedTags[]> {
    return await db.select().from(unifiedTags).orderBy(desc(unifiedTags.createdAt));
  }

  async getUnifiedTag(id: string): Promise<UnifiedTags | undefined> {
    const [tag] = await db.select().from(unifiedTags).where(eq(unifiedTags.id, id));
    return tag || undefined;
  }

  async createUnifiedTag(tag: InsertUnifiedTags): Promise<UnifiedTags> {
    const [newTag] = await db.insert(unifiedTags).values(tag as any).returning();
    return newTag;
  }

  async updateUnifiedTag(id: string, tag: Partial<InsertUnifiedTags>): Promise<UnifiedTags | undefined> {
    const [updatedTag] = await db
      .update(unifiedTags)
      .set({ ...tag, updatedAt: new Date() })
      .where(eq(unifiedTags.id, id))
      .returning();
    return updatedTag || undefined;
  }

  async deleteUnifiedTag(id: string): Promise<boolean> {
    const result = await db.delete(unifiedTags).where(eq(unifiedTags.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Facebook Conversations
  async getFacebookConversations(pageId?: string, limit = 50): Promise<FacebookConversations[]> {
    const query = db.select().from(facebookConversations);
    
    if (pageId) {
      return await query
        .where(eq(facebookConversations.pageId, pageId))
        .orderBy(desc(facebookConversations.lastMessageAt))
        .limit(limit);
    }
    
    return await query
      .orderBy(desc(facebookConversations.lastMessageAt))
      .limit(limit);
  }

  async getFacebookConversation(id: string): Promise<FacebookConversations | undefined> {
    const [conversation] = await db.select().from(facebookConversations).where(eq(facebookConversations.id, id));
    return conversation || undefined;
  }

  async getFacebookConversationByParticipant(pageId: string, participantId: string): Promise<FacebookConversations | undefined> {
    const [conversation] = await db
      .select()
      .from(facebookConversations)
      .where(and(
        eq(facebookConversations.pageId, pageId),
        eq(facebookConversations.participantId, participantId)
      ));
    return conversation || undefined;
  }

  async createFacebookConversation(conversation: InsertFacebookConversations): Promise<FacebookConversations> {
    const [newConversation] = await db.insert(facebookConversations).values([conversation as any]).returning();
    return newConversation;
  }

  async updateFacebookConversation(id: string, conversation: Partial<InsertFacebookConversations>): Promise<FacebookConversations | undefined> {
    const [updatedConversation] = await db
      .update(facebookConversations)
      .set({ ...conversation, updatedAt: new Date() } as any)
      .where(eq(facebookConversations.id, id))
      .returning();
    return updatedConversation || undefined;
  }

  // Facebook Messages
  async getFacebookMessages(conversationId: string, limit = 50): Promise<FacebookMessages[]> {
    return await db
      .select()
      .from(facebookMessages)
      .where(eq(facebookMessages.conversationId, conversationId))
      .orderBy(asc(facebookMessages.timestamp))
      .limit(limit);
  }

  async createFacebookMessage(message: InsertFacebookMessages): Promise<FacebookMessages> {
    // Update conversation's last message info
    await db
      .update(facebookConversations)
      .set({
        lastMessageAt: new Date(message.timestamp),
        lastMessagePreview: message.content?.substring(0, 100) || '[Media]',
        messageCount: sql`${facebookConversations.messageCount} + 1`,
        isRead: message.senderType === 'page' ? true : false,
        updatedAt: new Date()
      })
      .where(eq(facebookConversations.id, message.conversationId));

    const [newMessage] = await db.insert(facebookMessages).values([message as any]).returning();
    return newMessage;
  }

  async markConversationAsRead(conversationId: string): Promise<boolean> {
    const result = await db
      .update(facebookConversations)
      .set({ 
        isRead: true,
        updatedAt: new Date()
      })
      .where(eq(facebookConversations.id, conversationId));
    return (result.rowCount ?? 0) > 0;
  }

  async getSocialAccountByPageId(pageId: string): Promise<SocialAccounts | undefined> {
    const accounts = await db.select().from(socialAccounts).where(eq(socialAccounts.platform, "facebook"));
    
    // Search through pageAccessTokens jsonb field
    for (const account of accounts) {
      const pageTokens = account.pageAccessTokens as any[];
      if (pageTokens?.some((token: any) => token.pageId === pageId)) {
        return account;
      }
    }
    return undefined;
  }

  // TikTok Business Account methods
  async getTikTokBusinessAccounts(): Promise<TiktokBusinessAccounts[]> {
    return await db.select().from(tiktokBusinessAccounts).orderBy(desc(tiktokBusinessAccounts.createdAt));
  }

  async getTikTokBusinessAccount(id: string): Promise<TiktokBusinessAccounts | undefined> {
    const [account] = await db.select().from(tiktokBusinessAccounts).where(eq(tiktokBusinessAccounts.id, id));
    return account;
  }

  async getTikTokBusinessAccountByBusinessId(businessId: string): Promise<TiktokBusinessAccounts | undefined> {
    const [account] = await db.select().from(tiktokBusinessAccounts).where(eq(tiktokBusinessAccounts.businessId, businessId));
    return account;
  }

  async createTikTokBusinessAccount(account: InsertTiktokBusinessAccounts): Promise<TiktokBusinessAccounts> {
    const [newAccount] = await db.insert(tiktokBusinessAccounts).values(account as any).returning();
    return newAccount;
  }

  async updateTikTokBusinessAccount(id: string, account: Partial<InsertTiktokBusinessAccounts>): Promise<TiktokBusinessAccounts | undefined> {
    const [updatedAccount] = await db.update(tiktokBusinessAccounts)
      .set({ ...account, updatedAt: new Date() })
      .where(eq(tiktokBusinessAccounts.id, id))
      .returning();
    return updatedAccount;
  }

  async deleteTikTokBusinessAccount(id: string): Promise<boolean> {
    const result = await db.delete(tiktokBusinessAccounts).where(eq(tiktokBusinessAccounts.id, id));
    return result.rowCount! > 0;
  }

  // Facebook Apps methods
  async getAllFacebookApps(): Promise<FacebookApps[]> {
    return await db.select().from(facebookApps).orderBy(desc(facebookApps.createdAt));
  }

  async getFacebookAppById(id: string): Promise<FacebookApps | undefined> {
    const [app] = await db.select().from(facebookApps).where(eq(facebookApps.id, id));
    return app;
  }

  async getFacebookAppByAppId(appId: string): Promise<FacebookApps | undefined> {
    const [app] = await db.select().from(facebookApps).where(eq(facebookApps.appId, appId));
    return app;
  }

  async createFacebookApp(app: InsertFacebookApps): Promise<FacebookApps> {
    const [newApp] = await db.insert(facebookApps).values(app as any).returning();
    return newApp;
  }

  async updateFacebookApp(id: string, app: Partial<InsertFacebookApps>): Promise<FacebookApps | undefined> {
    const [updatedApp] = await db
      .update(facebookApps)
      .set({ ...app, updatedAt: new Date() })
      .where(eq(facebookApps.id, id))
      .returning();
    return updatedApp;
  }

  async deleteFacebookApp(id: string): Promise<boolean> {
    const result = await db.delete(facebookApps).where(eq(facebookApps.id, id));
    return result.rowCount! > 0;
  }

  // TikTok Shop Order methods
  async getTikTokShopOrders(limit?: number): Promise<TiktokShopOrders[]> {
    let query = db.select().from(tiktokShopOrders).orderBy(desc(tiktokShopOrders.createdAt));
    if (limit) {
      query = (query as any).limit(limit);
    }
    return await query;
  }

  async getTikTokShopOrder(id: string): Promise<TiktokShopOrders | undefined> {
    const [order] = await db.select().from(tiktokShopOrders).where(eq(tiktokShopOrders.id, id));
    return order;
  }

  async getTikTokShopOrderByTikTokId(tiktokOrderId: string): Promise<TiktokShopOrders | undefined> {
    const [order] = await db.select().from(tiktokShopOrders).where(eq(tiktokShopOrders.tiktokOrderId, tiktokOrderId));
    return order;
  }

  async createTikTokShopOrder(order: InsertTiktokShopOrders): Promise<TiktokShopOrders> {
    const [newOrder] = await db.insert(tiktokShopOrders).values(order as any).returning();
    return newOrder;
  }

  async updateTikTokShopOrder(id: string, order: Partial<InsertTiktokShopOrders>): Promise<TiktokShopOrders | undefined> {
    const [updatedOrder] = await db.update(tiktokShopOrders)
      .set({ ...order, updatedAt: new Date() })
      .where(eq(tiktokShopOrders.id, id))
      .returning();
    return updatedOrder;
  }

  async deleteTikTokShopOrder(id: string): Promise<boolean> {
    const result = await db.delete(tiktokShopOrders).where(eq(tiktokShopOrders.id, id));
    return result.rowCount! > 0;
  }

  // TikTok Shop Product methods
  async getTikTokShopProducts(): Promise<TiktokShopProducts[]> {
    return await db.select().from(tiktokShopProducts).orderBy(desc(tiktokShopProducts.createdAt));
  }

  async getTikTokShopProduct(id: string): Promise<TiktokShopProducts | undefined> {
    const [product] = await db.select().from(tiktokShopProducts).where(eq(tiktokShopProducts.id, id));
    return product;
  }

  async getTikTokShopProductByTikTokId(tiktokProductId: string): Promise<TiktokShopProducts | undefined> {
    const [product] = await db.select().from(tiktokShopProducts).where(eq(tiktokShopProducts.tiktokProductId, tiktokProductId));
    return product;
  }

  async createTikTokShopProduct(product: InsertTiktokShopProducts): Promise<TiktokShopProducts> {
    const [newProduct] = await db.insert(tiktokShopProducts).values(product as any).returning();
    return newProduct;
  }

  async updateTikTokShopProduct(id: string, product: Partial<InsertTiktokShopProducts>): Promise<TiktokShopProducts | undefined> {
    const [updatedProduct] = await db.update(tiktokShopProducts)
      .set({ ...product, updatedAt: new Date() })
      .where(eq(tiktokShopProducts.id, id))
      .returning();
    return updatedProduct;
  }

  async deleteTikTokShopProduct(id: string): Promise<boolean> {
    const result = await db.delete(tiktokShopProducts).where(eq(tiktokShopProducts.id, id));
    return result.rowCount! > 0;
  }

  // TikTok Video methods
  async getTikTokVideos(businessAccountId?: string): Promise<TiktokVideos[]> {
    let query = db.select().from(tiktokVideos).orderBy(desc(tiktokVideos.createdAt));
    if (businessAccountId) {
      query = (query as any).where(eq(tiktokVideos.businessAccountId, businessAccountId));
    }
    return await query;
  }

  async getTikTokVideo(id: string): Promise<TiktokVideos | undefined> {
    const [video] = await db.select().from(tiktokVideos).where(eq(tiktokVideos.id, id));
    return video;
  }

  async getTikTokVideoByVideoId(videoId: string): Promise<TiktokVideos | undefined> {
    const [video] = await db.select().from(tiktokVideos).where(eq(tiktokVideos.videoId, videoId));
    return video;
  }

  async createTikTokVideo(video: InsertTiktokVideos): Promise<TiktokVideos> {
    const [newVideo] = await db.insert(tiktokVideos).values(video as any).returning();
    return newVideo;
  }

  async updateTikTokVideo(id: string, video: Partial<InsertTiktokVideos>): Promise<TiktokVideos | undefined> {
    const [updatedVideo] = await db.update(tiktokVideos)
      .set({ ...video, updatedAt: new Date() })
      .where(eq(tiktokVideos.id, id))
      .returning();
    return updatedVideo;
  }

  async deleteTikTokVideo(id: string): Promise<boolean> {
    const result = await db.delete(tiktokVideos).where(eq(tiktokVideos.id, id));
    return result.rowCount! > 0;
  }

  // ===========================================
  // CONTENT MANAGEMENT METHODS
  // ===========================================

  // Content Categories
  async getContentCategories(): Promise<ContentCategories[]> {
    return await db.select().from(contentCategories)
      .where(eq(contentCategories.isActive, true))
      .orderBy(contentCategories.sortOrder, contentCategories.name);
  }

  async createContentCategory(category: InsertContentCategories): Promise<ContentCategories> {
    const [newCategory] = await db.insert(contentCategories).values(category as any).returning();
    return newCategory;
  }

  async updateContentCategory(id: number, category: Partial<InsertContentCategories>): Promise<ContentCategories | undefined> {
    const [updated] = await db.update(contentCategories)
      .set({ ...category, updatedAt: new Date() })
      .where(eq(contentCategories.id, id))
      .returning();
    return updated;
  }

  async deleteContentCategory(id: number): Promise<boolean> {
    const result = await db.delete(contentCategories).where(eq(contentCategories.id, id));
    return result.rowCount! > 0;
  }

  // Content Assets
  async getContentAssets(): Promise<ContentAssets[]> {
    return await db.select().from(contentAssets)
      .orderBy(desc(contentAssets.createdAt));
  }

  async getContentAsset(id: string): Promise<ContentAssets | undefined> {
    const [asset] = await db.select().from(contentAssets).where(eq(contentAssets.id, id));
    return asset;
  }

  async getContentAssetsByCategory(categoryId: number): Promise<ContentAssets[]> {
    return await db.select().from(contentAssets)
      .where(eq(contentAssets.categoryId, categoryId))
      .orderBy(desc(contentAssets.createdAt));
  }

  async createContentAsset(asset: InsertContentAssets): Promise<ContentAssets> {
    const [newAsset] = await db.insert(contentAssets).values(asset as any).returning();
    return newAsset;
  }

  async updateContentAsset(id: string, asset: Partial<InsertContentAssets>): Promise<ContentAssets | undefined> {
    const [updated] = await db.update(contentAssets)
      .set({ ...asset, updatedAt: new Date() })
      .where(eq(contentAssets.id, id))
      .returning();
    return updated;
  }

  async deleteContentAsset(id: string): Promise<boolean> {
    const result = await db.delete(contentAssets).where(eq(contentAssets.id, id));
    return result.rowCount! > 0;
  }

  async incrementAssetUsage(id: string): Promise<void> {
    await db.update(contentAssets)
      .set({ 
        usageCount: sql`${contentAssets.usageCount} + 1`,
        lastUsed: new Date(),
        updatedAt: new Date()
      })
      .where(eq(contentAssets.id, id));
  }

  async findUnusedAssetsByTags(
    tags: string[], 
    resourceType?: 'image' | 'video',
    limit: number = 1
  ): Promise<ContentAssets[]> {
    const conditions = [
      sql`${contentAssets.lastUsed} IS NULL`,
      sql`${contentAssets.tags} && ARRAY[${sql.join(tags.map(tag => sql`${tag}`), sql`, `)}]::text[]`
    ];

    if (resourceType) {
      conditions.push(eq(contentAssets.resourceType, resourceType));
    }

    return await db
      .select()
      .from(contentAssets)
      .where(and(...conditions))
      .orderBy(sql`RANDOM()`)
      .limit(limit);
  }

  // Scheduled Posts
  async getScheduledPosts(): Promise<ScheduledPosts[]> {
    return await db.select().from(scheduledPosts)
      .orderBy(desc(scheduledPosts.scheduledTime));
  }

  async getScheduledPost(id: string): Promise<ScheduledPosts | undefined> {
    const [post] = await db.select().from(scheduledPosts).where(eq(scheduledPosts.id, id));
    return post;
  }

  async getScheduledPostsToProcess(now: Date): Promise<ScheduledPosts[]> {
    return await db.select().from(scheduledPosts)
      .where(
        and(
          eq(scheduledPosts.status, 'scheduled'),
          lte(scheduledPosts.scheduledTime, now)
        )
      )
      .orderBy(scheduledPosts.scheduledTime);
  }

  async getUpcomingScheduledPosts(limit: number = 50): Promise<ScheduledPosts[]> {
    const now = new Date();
    return await db.select().from(scheduledPosts)
      .where(
        and(
          inArray(scheduledPosts.status, ['scheduled', 'draft']),
          gte(scheduledPosts.scheduledTime, now)
        )
      )
      .orderBy(scheduledPosts.scheduledTime)
      .limit(limit);
  }

  async createScheduledPost(post: InsertScheduledPosts): Promise<ScheduledPosts> {
    const [newPost] = await db.insert(scheduledPosts).values(post as any).returning();
    return newPost;
  }

  async updateScheduledPost(id: string, post: Partial<InsertScheduledPosts>): Promise<ScheduledPosts | undefined> {
    const [updated] = await db.update(scheduledPosts)
      .set({ ...post, updatedAt: new Date() })
      .where(eq(scheduledPosts.id, id))
      .returning();
    return updated;
  }

  async updateScheduledPostStatus(id: string, status: ScheduledPosts['status']): Promise<void> {
    await db.update(scheduledPosts)
      .set({ status, updatedAt: new Date() })
      .where(eq(scheduledPosts.id, id));
  }

  async deleteScheduledPost(id: string): Promise<boolean> {
    const result = await db.delete(scheduledPosts).where(eq(scheduledPosts.id, id));
    return result.rowCount! > 0;
  }

  async getScheduledPostsByAccount(socialAccountId: string): Promise<ScheduledPosts[]> {
    return await db.select().from(scheduledPosts)
      .where(eq(scheduledPosts.socialAccountId, socialAccountId))
      .orderBy(desc(scheduledPosts.scheduledTime));
  }

  // Content Library methods
  async getContentLibraryItems(filters?: { tags?: string[]; status?: string; contentType?: string; priority?: string }): Promise<ContentLibraries[]> {
    // Build conditions array to properly combine multiple WHERE clauses
    const conditions = [];
    
    if (filters?.status) {
      conditions.push(eq(contentLibrary.status, filters.status as any));
    }
    if (filters?.contentType) {
      conditions.push(eq(contentLibrary.contentType, filters.contentType as any));
    }
    if (filters?.priority) {
      conditions.push(eq(contentLibrary.priority, filters.priority as any));
    }
    if (filters?.tags && filters.tags.length > 0) {
      // Use JSONB "contains any" logic with @> operator for "any tag" match
      // Create OR conditions for each tag to use GIN index efficiently
      const tagConditions = filters.tags.map(tag => 
        sql`${contentLibrary.tagIds} @> ${JSON.stringify([tag])}`
      );
      conditions.push(or(...tagConditions));
    }
    
    let query = db.select().from(contentLibrary);
    
    // Apply all conditions using AND logic
    if (conditions.length > 0) {
      query = (query as any).where(and(...conditions));
    }
    
    return await query.orderBy(desc(contentLibrary.createdAt));
  }

  async getContentLibraryItem(id: string): Promise<ContentLibraries | undefined> {
    const [item] = await db.select().from(contentLibrary).where(eq(contentLibrary.id, id));
    return item;
  }

  async createContentLibraryItem(item: InsertContentLibraries): Promise<ContentLibraries> {
    const { duplicateDetectionService } = await import('./services/duplicate-detection');
    const fingerprint = duplicateDetectionService.generateFingerprint(item.baseContent);
    
    const [newItem] = await db.insert(contentLibrary)
      .values({ ...item, contentFingerprint: fingerprint } as any)
      .returning();
    return newItem;
  }

  async updateContentLibraryItem(id: string, item: Partial<ContentLibraries>): Promise<ContentLibraries | undefined> {
    const updateData: any = { ...item, updatedAt: new Date() };
    
    if (item.baseContent) {
      const { duplicateDetectionService } = await import('./services/duplicate-detection');
      updateData.contentFingerprint = duplicateDetectionService.generateFingerprint(item.baseContent);
    }
    
    const [updated] = await db.update(contentLibrary)
      .set(updateData)
      .where(eq(contentLibrary.id, id))
      .returning();
    return updated;
  }

  async deleteContentLibraryItem(id: string): Promise<boolean> {
    const result = await db.delete(contentLibrary).where(eq(contentLibrary.id, id));
    return result.rowCount! > 0;
  }

  async incrementContentUsage(id: string): Promise<void> {
    await db.update(contentLibrary)
      .set({ 
        usageCount: sql`${contentLibrary.usageCount} + 1`,
        lastUsed: new Date(),
        updatedAt: new Date()
      })
      .where(eq(contentLibrary.id, id));
  }

  async addAIVariation(id: string, variation: { content: string; tone: string; style: string }): Promise<ContentLibraries | undefined> {
    const [item] = await db.select().from(contentLibrary).where(eq(contentLibrary.id, id));
    if (!item) return undefined;

    const newVariation = {
      id: Date.now().toString(), // Simple ID for variation
      content: variation.content,
      tone: variation.tone,
      style: variation.style,
      generatedAt: new Date().toISOString()
    };

    const updatedVariations = [...(item.aiVariations as any[] || []), newVariation];

    const [updated] = await db.update(contentLibrary)
      .set({ 
        aiVariations: updatedVariations,
        updatedAt: new Date()
      })
      .where(eq(contentLibrary.id, id))
      .returning();
    return updated;
  }

  async getContentLibraryByTags(tagIds: string[]): Promise<ContentLibraries[]> {
    if (tagIds.length === 0) return [];
    
    return await db.select().from(contentLibrary)
      .where(sql`${contentLibrary.tagIds} && ${JSON.stringify(tagIds)}`)
      .orderBy(desc(contentLibrary.lastUsed), desc(contentLibrary.createdAt));
  }

  async getContentLibraryByPriority(priority: string): Promise<ContentLibraries[]> {
    return await db.select().from(contentLibrary)
      .where(eq(contentLibrary.priority, priority as any))
      .orderBy(desc(contentLibrary.createdAt));
  }

  // Content Queue methods
  async getQueueItems(filters?: { status?: string; targetGroupId?: string; autoFill?: boolean; priority?: number }): Promise<ContentQueue[]> {
    let query = db.select().from(contentQueue);
    
    const conditions = [];
    if (filters?.status) {
      conditions.push(eq(contentQueue.status, filters.status as any));
    }
    if (filters?.targetGroupId) {
      conditions.push(eq(contentQueue.targetGroupId, filters.targetGroupId));
    }
    if (filters?.autoFill !== undefined) {
      conditions.push(eq(contentQueue.autoFill, filters.autoFill));
    }
    if (filters?.priority) {
      conditions.push(eq(contentQueue.priority, filters.priority));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }
    
    return await query.orderBy(desc(contentQueue.priority), asc(contentQueue.queuePosition));
  }

  async getQueueItem(id: string): Promise<ContentQueue | undefined> {
    const [item] = await db.select().from(contentQueue).where(eq(contentQueue.id, id));
    return item;
  }

  async createQueueItem(item: InsertContentQueue): Promise<ContentQueue> {
    const [created] = await db.insert(contentQueue).values(item as any).returning();
    return created;
  }

  async updateQueueItem(id: string, item: Partial<InsertContentQueue>): Promise<ContentQueue | undefined> {
    const [updated] = await db.update(contentQueue)
      .set({ ...item, updatedAt: new Date() })
      .where(eq(contentQueue.id, id))
      .returning();
    return updated;
  }

  async deleteQueueItem(id: string): Promise<boolean> {
    const result = await db.delete(contentQueue).where(eq(contentQueue.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async updateQueuePosition(id: string, newPosition: number): Promise<ContentQueue | undefined> {
    const [updated] = await db.update(contentQueue)
      .set({ queuePosition: newPosition, updatedAt: new Date() })
      .where(eq(contentQueue.id, id))
      .returning();
    return updated;
  }

  async reorderQueue(itemIds: string[]): Promise<boolean> {
    // Update positions based on array order
    for (let i = 0; i < itemIds.length; i++) {
      await db.update(contentQueue)
        .set({ queuePosition: i, updatedAt: new Date() })
        .where(eq(contentQueue.id, itemIds[i]));
    }
    return true;
  }

  async getNextQueueItems(limit: number, targetType?: string): Promise<ContentQueue[]> {
    let query = db.select().from(contentQueue)
      .where(and(
        eq(contentQueue.status, 'ready'),
        eq(contentQueue.autoFill, true)
      ));
    
    if (targetType) {
      query = (query as any).where(eq(contentQueue.targetType, targetType as any));
    }
    
    return await query
      .orderBy(desc(contentQueue.priority), asc(contentQueue.queuePosition))
      .limit(limit);
  }

  // Queue Auto-fill Settings methods
  async getQueueAutoFillSettings(): Promise<QueueAutoFillSettings | undefined> {
    const [settings] = await db.select().from(queueAutoFillSettings).limit(1);
    return settings;
  }

  async updateQueueAutoFillSettings(settings: Partial<InsertQueueAutoFillSettings>): Promise<QueueAutoFillSettings> {
    const existing = await this.getQueueAutoFillSettings();
    
    if (existing) {
      const [updated] = await db.update(queueAutoFillSettings)
        .set({ ...settings, updatedAt: new Date() })
        .where(eq(queueAutoFillSettings.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(queueAutoFillSettings)
        .values(settings as any)
        .returning();
      return created;
    }
  }

  // Queue History methods
  async getQueueHistory(queueItemId?: string, limit: number = 100): Promise<QueueHistory[]> {
    let query = db.select().from(queueHistory);
    
    if (queueItemId) {
      query = query.where(eq(queueHistory.queueItemId, queueItemId)) as any;
    }
    
    return await query.orderBy(desc(queueHistory.createdAt)).limit(limit);
  }

  async createQueueHistory(history: InsertQueueHistory): Promise<QueueHistory> {
    const [created] = await db.insert(queueHistory).values(history as any).returning();
    return created;
  }

  // Account Groups methods
  async getAccountGroups(): Promise<any[]> {
    return await db.select().from(accountGroups).orderBy(desc(accountGroups.createdAt));
  }

  async getGroupAccounts(groupId: string): Promise<SocialAccounts[]> {
    return await db
      .select({
        id: socialAccounts.id,
        platform: socialAccounts.platform,
        name: socialAccounts.name,
        accountId: socialAccounts.accountId,
        accessToken: socialAccounts.accessToken,
        refreshToken: socialAccounts.refreshToken,
        tokenExpiresAt: socialAccounts.tokenExpiresAt,
        pageAccessTokens: socialAccounts.pageAccessTokens,
        webhookSubscriptions: socialAccounts.webhookSubscriptions,
        tagIds: socialAccounts.tagIds,
        contentPreferences: socialAccounts.contentPreferences,
        schedulingRules: socialAccounts.schedulingRules,
        performanceScore: socialAccounts.performanceScore,
        lastOptimization: socialAccounts.lastOptimization,
        followers: socialAccounts.followers,
        connected: socialAccounts.connected,
        lastPost: socialAccounts.lastPost,
        engagement: socialAccounts.engagement,
        lastSync: socialAccounts.lastSync,
        isActive: socialAccounts.isActive,
        createdAt: socialAccounts.createdAt,
        updatedAt: socialAccounts.updatedAt
      })
      .from(socialAccounts)
      .leftJoin(groupAccounts, eq(groupAccounts.socialAccountId, socialAccounts.id))
      .where(and(eq(groupAccounts.groupId, groupId), eq(groupAccounts.isActive, true)))
      .orderBy(desc(socialAccounts.createdAt)) as any;
  }

  // Worker methods
  async getWorkers(): Promise<Worker[]> {
    return await db.select({
      id: workers.id,
      workerId: workers.workerId,
      name: workers.name,
      description: workers.description,
      platforms: workers.platforms,
      capabilities: workers.capabilities,
      specialties: workers.specialties,
      maxConcurrentJobs: workers.maxConcurrentJobs,
      minJobInterval: workers.minJobInterval,
      maxJobsPerHour: workers.maxJobsPerHour,
      avgExecutionTime: workers.avgExecutionTime,
      region: workers.region,
      environment: workers.environment,
      deploymentPlatform: workers.deploymentPlatform,
      endpointUrl: workers.endpointUrl,
      ipAddress: workers.ipAddress,
      ipCountry: workers.ipCountry,
      ipRegion: workers.ipRegion,
      status: workers.status,
      isOnline: workers.isOnline,
      lastPingAt: workers.lastPingAt,
      lastJobAt: workers.lastJobAt,
      currentLoad: workers.currentLoad,
      totalJobsCompleted: workers.totalJobsCompleted,
      totalJobsFailed: workers.totalJobsFailed,
      successRate: workers.successRate,
      avgResponseTime: workers.avgResponseTime,
      registrationSecret: workers.registrationSecret,
      authToken: workers.authToken,
      tokenExpiresAt: workers.tokenExpiresAt,
      tags: workers.tags,
      priority: workers.priority,
      isEnabled: workers.isEnabled,
      metadata: workers.metadata,
      createdAt: workers.createdAt,
      updatedAt: workers.updatedAt
    }).from(workers).orderBy(desc(workers.createdAt));
  }

  async getWorker(id: string): Promise<Worker | undefined> {
    const [worker] = await db.select().from(workers).where(eq(workers.id, id));
    return worker || undefined;
  }

  async getWorkerByWorkerId(workerId: string): Promise<Worker | undefined> {
    const [worker] = await db.select().from(workers).where(eq(workers.workerId, workerId));
    return worker || undefined;
  }

  async createWorker(worker: InsertWorker): Promise<Worker> {
    const [created] = await db.insert(workers).values(worker).returning();
    return created;
  }

  async updateWorker(id: string, worker: Partial<InsertWorker>): Promise<Worker | undefined> {
    const [updated] = await db.update(workers)
      .set({ ...worker, updatedAt: new Date() })
      .where(eq(workers.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteWorker(id: string): Promise<boolean> {
    const result = await db.delete(workers).where(eq(workers.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async updateWorkerStatus(workerId: string, isOnline: boolean, lastPingAt?: Date): Promise<Worker | undefined> {
    const [updated] = await db.update(workers)
      .set({ 
        isOnline, 
        lastPingAt: lastPingAt || new Date(), 
        updatedAt: new Date() 
      })
      .where(eq(workers.workerId, workerId))
      .returning();
    return updated || undefined;
  }

  // AbeBooks methods
  async getAbebooksAccounts(): Promise<AbebooksAccount[]> {
    return await db.select().from(abebooksAccounts).orderBy(abebooksAccounts.createdAt);
  }

  async getAbebooksAccount(id: string): Promise<AbebooksAccount | undefined> {
    const [account] = await db.select().from(abebooksAccounts).where(eq(abebooksAccounts.id, id));
    return account || undefined;
  }

  async getDefaultAbebooksAccount(): Promise<AbebooksAccount | undefined> {
    const [account] = await db.select().from(abebooksAccounts)
      .where(eq(abebooksAccounts.isDefault, true))
      .limit(1);
    return account || undefined;
  }

  async createAbebooksAccount(account: InsertAbebooksAccount): Promise<AbebooksAccount> {
    const [created] = await db.insert(abebooksAccounts).values(account as any).returning();
    return created;
  }

  async updateAbebooksAccount(id: string, account: Partial<InsertAbebooksAccount>): Promise<AbebooksAccount | undefined> {
    const [updated] = await db.update(abebooksAccounts)
      .set({ ...account, updatedAt: new Date() })
      .where(eq(abebooksAccounts.id, id))
      .returning();
    return updated || undefined;
  }

  async trackAbebooksAccountUsage(accountId: string): Promise<AbebooksAccount | undefined> {
    const [updated] = await db.update(abebooksAccounts)
      .set({ 
        requestsUsed: sql`${abebooksAccounts.requestsUsed} + 1`,
        lastUsedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(abebooksAccounts.id, accountId))
      .returning();
    return updated || undefined;
  }

  async getAbebooksListings(bookIsbn?: string, accountId?: string): Promise<AbebooksListing[]> {
    const query = db.select().from(abebooksListings);
    const conditions = [];
    
    if (bookIsbn) {
      conditions.push(eq(abebooksListings.bookIsbn, bookIsbn));
    }
    if (accountId) {
      conditions.push(eq(abebooksListings.accountId, accountId));
    }
    
    if (conditions.length > 0) {
      query.where(and(...conditions));
    }
    
    return await query.orderBy(desc(abebooksListings.createdAt));
  }

  async getAbebooksListing(id: string): Promise<AbebooksListing | undefined> {
    const [listing] = await db.select().from(abebooksListings).where(eq(abebooksListings.id, id));
    return listing || undefined;
  }

  async createAbebooksListing(listing: InsertAbebooksListing): Promise<AbebooksListing> {
    const [created] = await db.insert(abebooksListings).values(listing as any).returning();
    return created;
  }

  async updateAbebooksListing(id: string, listing: Partial<InsertAbebooksListing>): Promise<AbebooksListing | undefined> {
    const [updated] = await db.update(abebooksListings)
      .set({ ...listing, updatedAt: new Date() })
      .where(eq(abebooksListings.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteAbebooksListing(id: string): Promise<boolean> {
    const result = await db.delete(abebooksListings).where(eq(abebooksListings.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async getAbebooksSearchHistory(accountId?: string, limit: number = 50): Promise<AbebooksSearchHistory[]> {
    const query = db.select().from(abebooksSearchHistory);
    
    if (accountId) {
      query.where(eq(abebooksSearchHistory.accountId, accountId));
    }
    
    return await query.orderBy(desc(abebooksSearchHistory.createdAt)).limit(limit);
  }

  async createAbebooksSearchHistory(history: InsertAbebooksSearchHistory): Promise<AbebooksSearchHistory> {
    const [created] = await db.insert(abebooksSearchHistory).values(history as any).returning();
    return created;
  }

  // Cookie Profile methods
  async getCookieProfiles(filters?: {
    search?: string;
    userId?: string;
    socialNetwork?: string;
    groupTag?: string;
    isActive?: boolean;
  }, pagination?: {
    limit?: number;
    offset?: number;
  }): Promise<CookieProfiles[]> {
    const query = db.select().from(cookieProfiles);
    const conditions = [];

    if (filters?.search) {
      const searchTerm = `%${filters.search.toLowerCase()}%`;
      conditions.push(
        or(
          ilike(cookieProfiles.accountName, searchTerm),
          ilike(cookieProfiles.socialNetwork, searchTerm),
          ilike(cookieProfiles.groupTag, searchTerm),
          ilike(cookieProfiles.userId, searchTerm)
        )
      );
    }
    if (filters?.userId) {
      conditions.push(eq(cookieProfiles.userId, filters.userId));
    }
    if (filters?.socialNetwork) {
      conditions.push(eq(cookieProfiles.socialNetwork, filters.socialNetwork));
    }
    if (filters?.groupTag) {
      conditions.push(eq(cookieProfiles.groupTag, filters.groupTag));
    }
    if (filters?.isActive !== undefined) {
      conditions.push(eq(cookieProfiles.isActive, filters.isActive));
    }

    if (conditions.length > 0) {
      query.where(and(...conditions));
    }

    const limit = pagination?.limit || 50;
    const offset = pagination?.offset || 0;

    return await query
      .orderBy(desc(cookieProfiles.updatedAt))
      .limit(limit)
      .offset(offset);
  }

  async getCookieProfileById(id: string): Promise<CookieProfiles | undefined> {
    const [profile] = await db.select().from(cookieProfiles).where(eq(cookieProfiles.id, id));
    return profile || undefined;
  }

  async createCookieProfile(profile: InsertCookieProfiles): Promise<CookieProfiles> {
    const [created] = await db.insert(cookieProfiles).values(profile as any).returning();
    return created;
  }

  async updateCookieProfile(id: string, profile: Partial<CookieProfiles>): Promise<CookieProfiles | undefined> {
    const [updated] = await db.update(cookieProfiles)
      .set({ ...profile, updatedAt: new Date() })
      .where(eq(cookieProfiles.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteCookieProfile(id: string): Promise<boolean> {
    const result = await db.delete(cookieProfiles).where(eq(cookieProfiles.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Get cookie profile by identity (userId + socialNetwork + accountName) - NO LIMIT
  async getCookieProfileByIdentity(
    userId: string, 
    socialNetwork: string, 
    accountName: string
  ): Promise<CookieProfiles | undefined> {
    const [profile] = await db.select().from(cookieProfiles).where(
      and(
        eq(cookieProfiles.userId, userId),
        eq(cookieProfiles.socialNetwork, socialNetwork),
        eq(cookieProfiles.accountName, accountName)
      )
    );
    return profile || undefined;
  }

  // Update cookie profile with atomic version check
  async updateCookieProfileWithVersion(
    id: string, 
    expectedVersion: number,
    profile: Partial<CookieProfiles>
  ): Promise<{ success: boolean; profile?: CookieProfiles; currentVersion?: number }> {
    // Atomic update: only update if version matches
    const [updated] = await db.update(cookieProfiles)
      .set({ ...profile, updatedAt: new Date() })
      .where(
        and(
          eq(cookieProfiles.id, id),
          eq(cookieProfiles.version, expectedVersion)
        )
      )
      .returning();
    
    if (updated) {
      return { success: true, profile: updated };
    }
    
    // Version mismatch - fetch current version
    const [current] = await db.select().from(cookieProfiles).where(eq(cookieProfiles.id, id));
    return { 
      success: false, 
      currentVersion: current?.version 
    };
  }

  async getAuthUsers(): Promise<AuthUsers[]> {
    return await db.select().from(authUsers).orderBy(desc(authUsers.createdAt));
  }

  async getCookieProfileStats(): Promise<{
    totalProfiles: number;
    totalUsers: number;
    profilesByPlatform: { platform: string; count: number }[];
    profilesByGroup: { group: string; count: number }[];
    activeProfiles: number;
    inactiveProfiles: number;
  }> {
    // Get total profiles
    const [totalProfilesResult] = await db.select({ 
      count: count() 
    }).from(cookieProfiles);

    // Get total unique users
    const [totalUsersResult] = await db.select({ 
      count: sql<number>`COUNT(DISTINCT ${cookieProfiles.userId})` 
    }).from(cookieProfiles);

    // Get active/inactive counts
    const [activeResult] = await db.select({ 
      count: count() 
    }).from(cookieProfiles).where(eq(cookieProfiles.isActive, true));

    const [inactiveResult] = await db.select({ 
      count: count() 
    }).from(cookieProfiles).where(eq(cookieProfiles.isActive, false));

    // Get profiles by platform
    const platformStats = await db.select({
      platform: cookieProfiles.socialNetwork,
      count: count()
    })
      .from(cookieProfiles)
      .groupBy(cookieProfiles.socialNetwork)
      .orderBy(desc(count()));

    // Get profiles by group
    const groupStats = await db.select({
      group: cookieProfiles.groupTag,
      count: count()
    })
      .from(cookieProfiles)
      .groupBy(cookieProfiles.groupTag)
      .orderBy(desc(count()));

    return {
      totalProfiles: totalProfilesResult.count,
      totalUsers: totalUsersResult.count,
      profilesByPlatform: platformStats.map(stat => ({
        platform: stat.platform,
        count: stat.count
      })),
      profilesByGroup: groupStats.map(stat => ({
        group: stat.group,
        count: stat.count
      })),
      activeProfiles: activeResult.count,
      inactiveProfiles: inactiveResult.count
    };
  }

  async getCookieProfilesCount(filters?: {
    search?: string;
    userId?: string;
    socialNetwork?: string;
    groupTag?: string;
    isActive?: boolean;
  }): Promise<number> {
    const query = db.select({ count: count() }).from(cookieProfiles);
    const conditions = [];

    if (filters?.search) {
      const searchTerm = `%${filters.search.toLowerCase()}%`;
      conditions.push(
        or(
          ilike(cookieProfiles.accountName, searchTerm),
          ilike(cookieProfiles.socialNetwork, searchTerm),
          ilike(cookieProfiles.groupTag, searchTerm),
          ilike(cookieProfiles.userId, searchTerm)
        )
      );
    }
    if (filters?.userId) {
      conditions.push(eq(cookieProfiles.userId, filters.userId));
    }
    if (filters?.socialNetwork) {
      conditions.push(eq(cookieProfiles.socialNetwork, filters.socialNetwork));
    }
    if (filters?.groupTag) {
      conditions.push(eq(cookieProfiles.groupTag, filters.groupTag));
    }
    if (filters?.isActive !== undefined) {
      conditions.push(eq(cookieProfiles.isActive, filters.isActive));
    }

    if (conditions.length > 0) {
      query.where(and(...conditions));
    }

    const [result] = await query;
    return result.count;
  }

  async getCookieProfilesModifiedAfter(timestamp: string, filters?: {
    userId?: string;
    socialNetwork?: string;
    modifiedAfter?: Date;
    cursorTimestamp?: Date;
    cursorId?: string;
  }, pagination?: {
    limit?: number;
    offset?: number;
  }): Promise<CookieProfiles[]> {
    const query = db.select().from(cookieProfiles);
    const conditions = [gte(cookieProfiles.updatedAt, new Date(timestamp))];

    if (filters?.userId) {
      conditions.push(eq(cookieProfiles.userId, filters.userId));
    }
    if (filters?.socialNetwork) {
      conditions.push(eq(cookieProfiles.socialNetwork, filters.socialNetwork));
    }
    
    // Support cursor-based pagination for delta sync with exclusive cursor and tie-breaker
    if (filters?.cursorTimestamp) {
      if (filters?.cursorId) {
        // Use composite cursor: (updatedAt > cursor_time) OR (updatedAt = cursor_time AND id > cursor_id)
        conditions.push(
          or(
            sql`${cookieProfiles.updatedAt} > ${filters.cursorTimestamp}`,
            and(
              eq(cookieProfiles.updatedAt, filters.cursorTimestamp),
              sql`${cookieProfiles.id} > ${filters.cursorId}`
            )
          )!
        );
      } else {
        // Fallback to simple exclusive cursor
        conditions.push(sql`${cookieProfiles.updatedAt} > ${filters.cursorTimestamp}`);
      }
    }

    query.where(and(...conditions));

    const limit = pagination?.limit || 100;
    const offset = pagination?.offset || 0;

    return await query
      .orderBy(cookieProfiles.updatedAt, cookieProfiles.id) // Deterministic ordering with tie-breaker
      .limit(limit)
      .offset(offset);
  }

  async getLastSyncTimestamp(userId?: string): Promise<string | null> {
    // Get the most recent updatedAt timestamp for the user's profiles
    const query = db.select({
      lastSync: sql<string>`MAX(${cookieProfiles.updatedAt})`
    }).from(cookieProfiles);

    if (userId) {
      query.where(eq(cookieProfiles.userId, userId));
    }

    const [result] = await query;
    return result.lastSync || null;
  }

  async validateUsersBatch(userIds: string[]): Promise<Set<string>> {
    if (userIds.length === 0) return new Set();
    
    const existingUsers = await db.select({ id: authUsers.id })
      .from(authUsers)
      .where(inArray(authUsers.id, userIds));
    
    return new Set(existingUsers.map(user => user.id));
  }

  async getCookieProfilesByCompositeKeys(keys: Array<{
    userId: string;
    socialNetwork: string;
    groupTag: string;
    accountName: string;
  }>): Promise<Map<string, CookieProfiles>> {
    if (keys.length === 0) return new Map();
    
    // Build OR conditions for each composite key
    const conditions = keys.map(key => 
      and(
        eq(cookieProfiles.userId, key.userId),
        eq(cookieProfiles.socialNetwork, key.socialNetwork),
        eq(cookieProfiles.groupTag, key.groupTag),
        eq(cookieProfiles.accountName, key.accountName)
      )
    );
    
    const existingProfiles = await db.select()
      .from(cookieProfiles)
      .where(or(...conditions));
    
    // Create a map keyed by composite key string
    const profileMap = new Map<string, CookieProfiles>();
    existingProfiles.forEach(profile => {
      const compositeKey = `${profile.userId}:${profile.socialNetwork}:${profile.groupTag}:${profile.accountName}`;
      profileMap.set(compositeKey, profile);
    });
    
    return profileMap;
  }

  // 📚 Book Orders & Sellers Integration implementation
  async getBookSellers(filters?: { isActive?: boolean; tier?: string }): Promise<BookSellers[]> {
    let query = db.select().from(bookSellers);
    
    const conditions = [];
    if (filters?.isActive !== undefined) conditions.push(eq(bookSellers.isActive, filters.isActive));
    if (filters?.tier) conditions.push(eq(bookSellers.tier, filters.tier as any));
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }
    
    return await (query.orderBy(desc(bookSellers.createdAt)) as any);
  }

  async createBookSeller(data: InsertBookSellers): Promise<BookSellers> {
    const [seller] = await db.insert(bookSellers).values(data as any).returning();
    return seller;
  }

  // 📚 Book Orders CRUD methods
  async getBookOrders(filters?: { status?: string; sellerId?: string; limit?: number; offset?: number }): Promise<BookOrders[]> {
    let query = db.select().from(bookOrders);
    
    const conditions = [];
    if (filters?.status) conditions.push(eq(bookOrders.status, filters.status as any));
    if (filters?.sellerId) conditions.push(eq(bookOrders.sellerId, filters.sellerId));
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }
    
    const limit = filters?.limit || 50;
    const offset = filters?.offset || 0;
    
    return await (query.orderBy(desc(bookOrders.createdAt)).limit(limit).offset(offset) as any);
  }

  async getBookOrder(id: string): Promise<BookOrders | undefined> {
    const [order] = await db.select().from(bookOrders).where(eq(bookOrders.id, id));
    return order || undefined;
  }

  async createBookOrder(order: InsertBookOrders): Promise<BookOrders> {
    const [newOrder] = await db.insert(bookOrders).values(order as any).returning();
    return newOrder;
  }

  async updateBookOrder(id: string, order: Partial<InsertBookOrders>): Promise<BookOrders | undefined> {
    const [updated] = await db.update(bookOrders)
      .set({ ...order, updatedAt: new Date() })
      .where(eq(bookOrders.id, id))
      .returning();
    return updated || undefined;
  }

  async updateBookOrderStatus(id: string, status: string): Promise<BookOrders | undefined> {
    const [updated] = await db.update(bookOrders)
      .set({ status: status as any, updatedAt: new Date() })
      .where(eq(bookOrders.id, id))
      .returning();
    return updated || undefined;
  }

  async getBookOrdersBySellerId(sellerId: string, limit: number = 50): Promise<BookOrders[]> {
    return await db
      .select()
      .from(bookOrders)
      .where(eq(bookOrders.sellerId, sellerId))
      .orderBy(desc(bookOrders.createdAt))
      .limit(limit);
  }

  async updateSellerInventoryFromOrder(orderId: string, action: 'reserve' | 'allocate' | 'release' | 'ship'): Promise<boolean> {
    try {
      // Get the book order with items
      const order = await db
        .select()
        .from(bookOrders)
        .where(eq(bookOrders.id, orderId))
        .limit(1);

      if (!order.length || !order[0].sellerId) {
        console.error('Order not found or has no seller:', orderId);
        return false;
      }

      const bookOrder = order[0];

      // Get order items
      const orderItems = await db
        .select()
        .from(bookOrderItems)
        .where(eq(bookOrderItems.orderId, orderId));

      if (!orderItems.length) {
        console.error('No order items found for order:', orderId);
        return false;
      }

      // Update inventory for each item
      for (const item of orderItems) {
        const quantity = parseInt(item.quantity.toString());

        switch (action) {
          case 'reserve':
            // Reserve stock (decrease available, increase reserved)
            await db
              .update(bookSellerInventory)
              .set({
                reservedStock: sql`${bookSellerInventory.reservedStock} + ${quantity}`,
                updatedAt: new Date()
              })
              .where(
                and(
                  eq(bookSellerInventory.sellerId, bookOrder.sellerId!),
                  eq(bookSellerInventory.productId, item.productId)
                )
              );
            break;

          case 'allocate':
            // Allocate stock (move from reserved to allocated by reducing actual stock)
            await db
              .update(bookSellerInventory)
              .set({
                stock: sql`${bookSellerInventory.stock} - ${quantity}`,
                reservedStock: sql`${bookSellerInventory.reservedStock} - ${quantity}`,
                updatedAt: new Date()
              })
              .where(
                and(
                  eq(bookSellerInventory.sellerId, bookOrder.sellerId!),
                  eq(bookSellerInventory.productId, item.productId)
                )
              );
            break;

          case 'release':
            // Release reserved stock (increase available, decrease reserved)
            await db
              .update(bookSellerInventory)
              .set({
                reservedStock: sql`${bookSellerInventory.reservedStock} - ${quantity}`,
                updatedAt: new Date()
              })
              .where(
                and(
                  eq(bookSellerInventory.sellerId, bookOrder.sellerId!),
                  eq(bookSellerInventory.productId, item.productId)
                )
              );
            break;

          case 'ship':
            // Update sales stats
            await db
              .update(bookSellerInventory)
              .set({
                totalSold: sql`${bookSellerInventory.totalSold} + ${quantity}`,
                totalRevenue: sql`${bookSellerInventory.totalRevenue} + ${item.price}`,
                lastSale: new Date(),
                updatedAt: new Date()
              })
              .where(
                and(
                  eq(bookSellerInventory.sellerId, bookOrder.sellerId!),
                  eq(bookSellerInventory.productId, item.productId)
                )
              );
            break;
        }
      }

      // Update inventory status on the order
      let inventoryStatus: string;
      switch (action) {
        case 'reserve':
          inventoryStatus = 'reserved';
          break;
        case 'allocate':
          inventoryStatus = 'allocated';
          break;
        case 'ship':
          inventoryStatus = 'shipped';
          break;
        default:
          inventoryStatus = bookOrder.inventoryStatus || 'reserved';
      }

      await db
        .update(bookOrders)
        .set({
          inventoryStatus: inventoryStatus as any,
          updatedAt: new Date()
        })
        .where(eq(bookOrders.id, orderId));

      console.log(`✅ Inventory ${action} completed for order ${orderId}`);
      return true;
    } catch (error) {
      console.error(`❌ Error during inventory ${action} for order ${orderId}:`, error);
      return false;
    }
  }

  async calculateSellerCommission(orderId: string): Promise<{ success: boolean; commission: number; message: string }> {
    try {
      // Get the book order
      const [order] = await db
        .select()
        .from(bookOrders)
        .where(eq(bookOrders.id, orderId));

      if (!order) {
        return { success: false, commission: 0, message: 'Order not found' };
      }

      if (!order.sellerId) {
        return { success: false, commission: 0, message: 'Order has no seller assigned' };
      }

      // Get the seller
      const [seller] = await db
        .select()
        .from(bookSellers)
        .where(eq(bookSellers.id, order.sellerId));

      if (!seller) {
        return { success: false, commission: 0, message: 'Seller not found' };
      }

      // Calculate commission based on seller tier and pricing tier
      let commissionRate = 0.10; // Default 10%
      
      if (seller.pricingTier === 'standard_price') {
        // Standard price sellers get lower commission (2-5 sellers only)
        commissionRate = 0.05; // 5%
      } else if (seller.tier === 'top_seller') {
        // Top sellers get higher commission
        commissionRate = 0.15; // 15%
      } else if (seller.tier === 'premium') {
        // Premium sellers get better commission
        commissionRate = 0.12; // 12%
      }

      const orderTotal = parseFloat(order.total.toString());
      const commission = orderTotal * commissionRate;

      // Update the order with calculated commission
      await db
        .update(bookOrders)
        .set({
          sellerCommission: commission.toString(),
          updatedAt: new Date()
        })
        .where(eq(bookOrders.id, orderId));

      // Update seller performance stats
      await this.updateSellerPerformanceStats(order.sellerId, orderTotal, commission);

      console.log(`✅ Commission calculated for order ${orderId}: $${commission.toFixed(2)} (${(commissionRate * 100)}%)`);
      
      return {
        success: true,
        commission: commission,
        message: `Commission calculated: $${commission.toFixed(2)} at ${(commissionRate * 100)}% rate`
      };
    } catch (error) {
      console.error('❌ Error calculating seller commission:', error);
      return {
        success: false,
        commission: 0,
        message: `Error calculating commission: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  async getSellerPerformanceMetrics(sellerId: string): Promise<{
    totalSales: number;
    totalOrders: number;
    avgCommission: number;
    totalCommissionEarned: number;
    avgRating: number;
    totalBooks: number;
    topSellingBooks: Array<{ productId: string; productName: string; totalSold: number; revenue: number }>;
    monthlyStats: Array<{ month: string; orders: number; sales: number; commission: number }>;
  }> {
    try {
      // Get seller basic info
      const [seller] = await db
        .select()
        .from(bookSellers)
        .where(eq(bookSellers.id, sellerId));

      if (!seller) {
        throw new Error('Seller not found');
      }

      // Get order statistics
      const orderStats = await db
        .select({
          totalOrders: count(bookOrders.id),
          totalSales: sum(bookOrders.total),
          totalCommission: sum(bookOrders.sellerCommission)
        })
        .from(bookOrders)
        .where(
          and(
            eq(bookOrders.sellerId, sellerId),
            or(
              eq(bookOrders.status, 'delivered'),
              eq(bookOrders.status, 'shipped')
            )
          )
        );

      const stats = orderStats[0];
      const totalSales = parseFloat(stats.totalSales?.toString() || '0');
      const totalOrders = stats.totalOrders || 0;
      const totalCommissionEarned = parseFloat(stats.totalCommission?.toString() || '0');
      const avgCommission = totalOrders > 0 ? totalCommissionEarned / totalOrders : 0;

      // Get inventory count
      const inventoryCount = await db
        .select({ count: count(bookSellerInventory.id) })
        .from(bookSellerInventory)
        .where(
          and(
            eq(bookSellerInventory.sellerId, sellerId),
            eq(bookSellerInventory.isActive, true)
          )
        );

      const totalBooks = inventoryCount[0]?.count || 0;

      // Get top selling books
      const topSellingBooks = await db
        .select({
          productId: bookSellerInventory.productId,
          productName: products.name,
          totalSold: bookSellerInventory.totalSold,
          revenue: bookSellerInventory.totalRevenue
        })
        .from(bookSellerInventory)
        .leftJoin(products, eq(bookSellerInventory.productId, products.id))
        .where(
          and(
            eq(bookSellerInventory.sellerId, sellerId),
            eq(bookSellerInventory.isActive, true)
          )
        )
        .orderBy(desc(bookSellerInventory.totalSold))
        .limit(5);

      // Get monthly stats (last 12 months)
      const monthlyStats = await db
        .select({
          month: sql<string>`TO_CHAR(${bookOrders.createdAt}, 'YYYY-MM')`,
          orders: count(bookOrders.id),
          sales: sum(bookOrders.total),
          commission: sum(bookOrders.sellerCommission)
        })
        .from(bookOrders)
        .where(
          and(
            eq(bookOrders.sellerId, sellerId),
            gte(bookOrders.createdAt, sql`NOW() - INTERVAL '12 months'`)
          )
        )
        .groupBy(sql`TO_CHAR(${bookOrders.createdAt}, 'YYYY-MM')`)
        .orderBy(sql`TO_CHAR(${bookOrders.createdAt}, 'YYYY-MM') DESC`)
        .limit(12);

      return {
        totalSales,
        totalOrders,
        avgCommission,
        totalCommissionEarned,
        avgRating: parseFloat(seller.avgRating?.toString() || '0'),
        totalBooks,
        topSellingBooks: topSellingBooks.map(book => ({
          productId: book.productId,
          productName: book.productName || 'Unknown Product',
          totalSold: book.totalSold || 0,
          revenue: parseFloat(book.revenue?.toString() || '0')
        })),
        monthlyStats: monthlyStats.map(stat => ({
          month: stat.month,
          orders: stat.orders || 0,
          sales: parseFloat(stat.sales?.toString() || '0'),
          commission: parseFloat(stat.commission?.toString() || '0')
        }))
      };
    } catch (error) {
      console.error('❌ Error getting seller performance metrics:', error);
      // Return empty stats on error
      return {
        totalSales: 0,
        totalOrders: 0,
        avgCommission: 0,
        totalCommissionEarned: 0,
        avgRating: 0,
        totalBooks: 0,
        topSellingBooks: [],
        monthlyStats: []
      };
    }
  }

  async updateSellerRating(sellerId: string, rating: number, feedback?: string): Promise<BookSellers | undefined> {
    try {
      // Get current seller data
      const [seller] = await db
        .select()
        .from(bookSellers)
        .where(eq(bookSellers.id, sellerId));

      if (!seller) {
        return undefined;
      }

      // Calculate new average rating (simple approach - can be enhanced with weighted averages)
      const currentRating = parseFloat(seller.avgRating?.toString() || '0');
      const totalOrders = seller.totalOrders || 0;
      
      // Simple average calculation (can be improved with proper rating tracking)
      const newAvgRating = totalOrders > 0 
        ? ((currentRating * totalOrders) + rating) / (totalOrders + 1)
        : rating;

      const [updatedSeller] = await db
        .update(bookSellers)
        .set({
          avgRating: newAvgRating.toString(),
          updatedAt: new Date()
        })
        .where(eq(bookSellers.id, sellerId))
        .returning();

      return updatedSeller;
    } catch (error) {
      console.error('❌ Error updating seller rating:', error);
      return undefined;
    }
  }

  async getBookOrdersBySellerAndStatus(sellerId: string, status: string): Promise<BookOrders[]> {
    return await db
      .select()
      .from(bookOrders)
      .where(
        and(
          eq(bookOrders.sellerId, sellerId),
          eq(bookOrders.status, status as any)
        )
      )
      .orderBy(desc(bookOrders.createdAt));
  }

  async allocateInventoryForOrder(orderId: string): Promise<boolean> {
    return await this.updateSellerInventoryFromOrder(orderId, 'allocate');
  }

  async releaseInventoryForOrder(orderId: string): Promise<boolean> {
    return await this.updateSellerInventoryFromOrder(orderId, 'release');
  }

  async getSellerInventoryBySellerId(sellerId: string): Promise<BookSellerInventories[]> {
    return await db
      .select()
      .from(bookSellerInventory)
      .where(
        and(
          eq(bookSellerInventory.sellerId, sellerId),
          eq(bookSellerInventory.isActive, true)
        )
      )
      .orderBy(desc(bookSellerInventory.updatedAt));
  }

  async updateSellerPerformanceStats(sellerId: string, orderTotal: number, commission: number): Promise<BookSellers | undefined> {
    try {
      const [updatedSeller] = await db
        .update(bookSellers)
        .set({
          totalSales: sql`${bookSellers.totalSales} + ${orderTotal}`,
          totalOrders: sql`${bookSellers.totalOrders} + 1`,
          updatedAt: new Date()
        })
        .where(eq(bookSellers.id, sellerId))
        .returning();

      return updatedSeller;
    } catch (error) {
      console.error('❌ Error updating seller performance stats:', error);
      return undefined;
    }
  }

  // 📈 ADVANCED AUTOMATION FEATURES - Market Trends
  async getMarketTrends(filters?: {
    categoryId?: string;
    trendDirection?: string;
    automationEnabled?: boolean;
  }): Promise<MarketTrends[]> {
    let query = db.select().from(marketTrends);
    
    const conditions = [];
    if (filters?.categoryId) conditions.push(eq(marketTrends.categoryId, filters.categoryId));
    if (filters?.trendDirection) conditions.push(eq(marketTrends.trendDirection, filters.trendDirection as any));
    if (filters?.automationEnabled !== undefined) conditions.push(eq(marketTrends.automationEnabled, filters.automationEnabled));
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }
    
    return await (query.orderBy(desc(marketTrends.trendScore)) as any);
  }

  async getMarketTrendById(id: string): Promise<MarketTrends | undefined> {
    const [trend] = await db.select().from(marketTrends).where(eq(marketTrends.id, id));
    return trend;
  }

  async createMarketTrend(data: InsertMarketTrends): Promise<MarketTrends> {
    const [trend] = await db.insert(marketTrends).values(data as any).returning();
    return trend;
  }

  async updateMarketTrend(id: string, data: Partial<MarketTrends>): Promise<MarketTrends | undefined> {
    const [trend] = await db.update(marketTrends).set({ ...data, updatedAt: new Date() }).where(eq(marketTrends.id, id)).returning();
    return trend;
  }

  async deleteMarketTrend(id: string): Promise<boolean> {
    const result = await db.delete(marketTrends).where(eq(marketTrends.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // 📈 ADVANCED AUTOMATION FEATURES - Competitor Profiles
  async getCompetitorProfiles(filters?: {
    competitorType?: string;
    pricingStrategy?: string;
    isActive?: boolean;
  }): Promise<CompetitorProfiles[]> {
    let query = db.select().from(competitorProfiles);
    
    const conditions = [];
    if (filters?.competitorType) conditions.push(eq(competitorProfiles.competitorType, filters.competitorType as any));
    if (filters?.pricingStrategy) conditions.push(eq(competitorProfiles.pricingStrategy, filters.pricingStrategy as any));
    if (filters?.isActive !== undefined) conditions.push(eq(competitorProfiles.isActive, filters.isActive));
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }
    
    return await (query.orderBy(desc(competitorProfiles.marketShare)) as any);
  }

  async getCompetitorProfileById(id: string): Promise<CompetitorProfiles | undefined> {
    const [profile] = await db.select().from(competitorProfiles).where(eq(competitorProfiles.id, id));
    return profile;
  }

  async createCompetitorProfile(data: InsertCompetitorProfiles): Promise<CompetitorProfiles> {
    const [profile] = await db.insert(competitorProfiles).values(data as any).returning();
    return profile;
  }

  async updateCompetitorProfile(id: string, data: Partial<CompetitorProfiles>): Promise<CompetitorProfiles | undefined> {
    const [profile] = await db.update(competitorProfiles).set({ ...data, updatedAt: new Date() }).where(eq(competitorProfiles.id, id)).returning();
    return profile;
  }

  async deleteCompetitorProfile(id: string): Promise<boolean> {
    const result = await db.delete(competitorProfiles).where(eq(competitorProfiles.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // 📈 ADVANCED AUTOMATION FEATURES - Seasonal Rules
  async getSeasonalRules(filters?: {
    seasonType?: string;
    ruleType?: string;
    isActive?: boolean;
    autoApply?: boolean;
  }): Promise<SeasonalRules[]> {
    let query = db.select().from(seasonalRules);
    
    const conditions = [];
    if (filters?.seasonType) conditions.push(eq(seasonalRules.seasonType, filters.seasonType as any));
    if (filters?.ruleType) conditions.push(eq(seasonalRules.ruleType, filters.ruleType as any));
    if (filters?.isActive !== undefined) conditions.push(eq(seasonalRules.isActive, filters.isActive));
    if (filters?.autoApply !== undefined) conditions.push(eq(seasonalRules.autoApply, filters.autoApply));
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }
    
    return await (query.orderBy(desc(seasonalRules.priority)) as any);
  }

  async getSeasonalRuleById(id: string): Promise<SeasonalRules | undefined> {
    const [rule] = await db.select().from(seasonalRules).where(eq(seasonalRules.id, id));
    return rule;
  }

  async createSeasonalRule(data: InsertSeasonalRules): Promise<SeasonalRules> {
    const [rule] = await db.insert(seasonalRules).values(data as any).returning();
    return rule;
  }

  async updateSeasonalRule(id: string, data: Partial<SeasonalRules>): Promise<SeasonalRules | undefined> {
    const [rule] = await db.update(seasonalRules).set({ ...data, updatedAt: new Date() }).where(eq(seasonalRules.id, id)).returning();
    return rule;
  }

  async deleteSeasonalRule(id: string): Promise<boolean> {
    const result = await db.delete(seasonalRules).where(eq(seasonalRules.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async applySeasonalRule(id: string): Promise<SeasonalRules | undefined> {
    const [rule] = await db.update(seasonalRules).set({
      lastApplied: new Date(),
      timesApplied: sql`${seasonalRules.timesApplied} + 1`,
      updatedAt: new Date()
    }).where(eq(seasonalRules.id, id)).returning();
    return rule;
  }

  // 📈 ADVANCED AUTOMATION FEATURES - Pricing Strategies
  async getPricingStrategies(filters?: {
    sellerId?: string;
    strategyType?: string;
    isActive?: boolean;
    autoAdjustmentEnabled?: boolean;
  }): Promise<PricingStrategies[]> {
    let query = db.select().from(pricingStrategies);
    
    const conditions = [];
    if (filters?.sellerId) conditions.push(eq(pricingStrategies.sellerId, filters.sellerId));
    if (filters?.strategyType) conditions.push(eq(pricingStrategies.strategyType, filters.strategyType as any));
    if (filters?.isActive !== undefined) conditions.push(eq(pricingStrategies.isActive, filters.isActive));
    if (filters?.autoAdjustmentEnabled !== undefined) conditions.push(eq(pricingStrategies.autoAdjustmentEnabled, filters.autoAdjustmentEnabled));
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }
    
    return await (query.orderBy(desc(pricingStrategies.profitabilityScore)) as any);
  }

  async getPricingStrategyById(id: string): Promise<PricingStrategies | undefined> {
    const [strategy] = await db.select().from(pricingStrategies).where(eq(pricingStrategies.id, id));
    return strategy;
  }

  async getPricingStrategyBySellerId(sellerId: string): Promise<PricingStrategies | undefined> {
    const [strategy] = await db.select().from(pricingStrategies).where(
      and(
        eq(pricingStrategies.sellerId, sellerId),
        eq(pricingStrategies.isActive, true)
      )
    );
    return strategy;
  }

  async createPricingStrategy(data: InsertPricingStrategies): Promise<PricingStrategies> {
    const [strategy] = await db.insert(pricingStrategies).values(data as any).returning();
    return strategy;
  }

  async updatePricingStrategy(id: string, data: Partial<PricingStrategies>): Promise<PricingStrategies | undefined> {
    const [strategy] = await db.update(pricingStrategies).set({ ...data, updatedAt: new Date() }).where(eq(pricingStrategies.id, id)).returning();
    return strategy;
  }

  async deletePricingStrategy(id: string): Promise<boolean> {
    const result = await db.delete(pricingStrategies).where(eq(pricingStrategies.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async recordPricingAdjustment(id: string, priceChangePercent: number): Promise<PricingStrategies | undefined> {
    const [strategy] = await db.update(pricingStrategies).set({
      lastAdjusted: new Date(),
      avgPriceChangePercent: sql`(${pricingStrategies.avgPriceChangePercent} + ${priceChangePercent}) / 2`,
      updatedAt: new Date()
    }).where(eq(pricingStrategies.id, id)).returning();
    return strategy;
  }

  // 🔔 Push Notification Subscription implementations
  async getPushSubscriptionsByCustomer(customerId: string): Promise<PushSubscriptions[]> {
    return await db
      .select()
      .from(pushSubscriptions)
      .where(
        and(
          eq(pushSubscriptions.customerId, customerId),
          eq(pushSubscriptions.isActive, true)
        )
      );
  }

  async getPushSubscription(id: string): Promise<PushSubscriptions | undefined> {
    const [subscription] = await db
      .select()
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.id, id));
    return subscription || undefined;
  }

  async getPushSubscriptionByEndpoint(endpoint: string): Promise<PushSubscriptions | undefined> {
    const [subscription] = await db
      .select()
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.endpoint, endpoint));
    return subscription || undefined;
  }

  async createPushSubscription(subscription: InsertPushSubscriptions): Promise<PushSubscriptions> {
    const [newSubscription] = await db
      .insert(pushSubscriptions)
      .values(subscription as any)
      .returning();
    return newSubscription;
  }

  async updatePushSubscription(id: string, subscription: Partial<InsertPushSubscriptions>): Promise<PushSubscriptions | undefined> {
    const [updated] = await db
      .update(pushSubscriptions)
      .set({ ...subscription, updatedAt: new Date() })
      .where(eq(pushSubscriptions.id, id))
      .returning();
    return updated || undefined;
  }

  async deletePushSubscription(id: string): Promise<boolean> {
    const result = await db
      .delete(pushSubscriptions)
      .where(eq(pushSubscriptions.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // 🚙 CAR GROUPS - Vehicle Organization System
  async getCarGroups(filters?: {
    groupType?: string;
    isActive?: boolean;
  }): Promise<CarGroups[]> {
    let query = db.select().from(carGroups);
    
    const conditions = [];
    if (filters?.groupType) conditions.push(eq(carGroups.groupType, filters.groupType as any));
    if (filters?.isActive !== undefined) conditions.push(eq(carGroups.isActive, filters.isActive));
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }
    
    return await (query.orderBy(desc(carGroups.createdAt)) as any);
  }

  async getCarGroupById(id: string): Promise<CarGroups | undefined> {
    const [group] = await db.select().from(carGroups).where(eq(carGroups.id, id));
    return group;
  }

  async createCarGroup(data: InsertCarGroups): Promise<CarGroups> {
    const [group] = await db.insert(carGroups).values(data as any).returning();
    return group;
  }

  async updateCarGroup(id: string, data: Partial<InsertCarGroups>): Promise<CarGroups | undefined> {
    const [group] = await db.update(carGroups)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(carGroups.id, id))
      .returning();
    return group;
  }

  async deleteCarGroup(id: string): Promise<boolean> {
    const result = await db.delete(carGroups).where(eq(carGroups.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // 🔗 VEHICLE GROUP ASSIGNMENTS
  async getVehicleGroupAssignments(filters?: {
    vehicleId?: string;
    groupId?: string;
  }): Promise<VehicleGroupAssignments[]> {
    let query = db.select().from(vehicleGroupAssignments);
    
    const conditions = [];
    if (filters?.vehicleId) conditions.push(eq(vehicleGroupAssignments.vehicleId, filters.vehicleId));
    if (filters?.groupId) conditions.push(eq(vehicleGroupAssignments.groupId, filters.groupId));
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }
    
    return await (query.orderBy(desc(vehicleGroupAssignments.assignedAt)) as any);
  }

  async assignVehicleToGroup(data: InsertVehicleGroupAssignments): Promise<VehicleGroupAssignments> {
    const [assignment] = await db.insert(vehicleGroupAssignments).values(data as any).returning();
    return assignment;
  }

  async removeVehicleFromGroup(vehicleId: string, groupId: string): Promise<boolean> {
    const result = await db.delete(vehicleGroupAssignments)
      .where(
        and(
          eq(vehicleGroupAssignments.vehicleId, vehicleId),
          eq(vehicleGroupAssignments.groupId, groupId)
        )
      );
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Get vehicles in a specific group with full vehicle details
  async getVehiclesByGroupId(groupId: string): Promise<any[]> {
    return await db
      .select({
        vehicle: vehicles,
        assignment: vehicleGroupAssignments
      })
      .from(vehicleGroupAssignments)
      .innerJoin(vehicles, eq(vehicleGroupAssignments.vehicleId, vehicles.id))
      .where(eq(vehicleGroupAssignments.groupId, groupId))
      .orderBy(desc(vehicleGroupAssignments.assignedAt));
  }

  // Get all groups for a specific vehicle
  async getGroupsByVehicleId(vehicleId: string): Promise<any[]> {
    return await db
      .select({
        group: carGroups,
        assignment: vehicleGroupAssignments
      })
      .from(vehicleGroupAssignments)
      .innerJoin(carGroups, eq(vehicleGroupAssignments.groupId, carGroups.id))
      .where(eq(vehicleGroupAssignments.vehicleId, vehicleId))
      .orderBy(desc(vehicleGroupAssignments.assignedAt));
  }

  // 📊 DELIVERY MANAGEMENT - Dashboard & Orders
  async getDeliveryDashboardStats(): Promise<any> {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Get all orders count
    const [totalOrdersResult] = await db
      .select({ count: sql`count(*)::int` })
      .from(orders);

    // Get active deliveries (orders with status 'processing', 'confirmed', 'delivering')
    const [activeDeliveriesResult] = await db
      .select({ count: sql`count(*)::int` })
      .from(orders)
      .where(sql`${orders.status} IN ('processing', 'confirmed', 'delivering')`);

    // Get completed deliveries today
    const [completedTodayResult] = await db
      .select({ count: sql`count(*)::int` })
      .from(orders)
      .where(
        and(
          eq(orders.status, 'delivered'),
          sql`${orders.createdAt} >= ${todayStart}`
        )
      );

    // Get pending orders
    const [pendingOrdersResult] = await db
      .select({ count: sql`count(*)::int` })
      .from(orders)
      .where(eq(orders.status, 'pending'));

    // Get total vehicles
    const [totalVehiclesResult] = await db
      .select({ count: sql`count(*)::int` })
      .from(vehicles);

    // Get active drivers (vehicles with status 'active' or 'on_trip')
    const [activeDriversResult] = await db
      .select({ count: sql`count(*)::int` })
      .from(vehicles)
      .where(sql`${vehicles.status} IN ('active', 'on_trip')`);

    // Get total car groups
    const [totalGroupsResult] = await db
      .select({ count: sql`count(*)::int` })
      .from(carGroups)
      .where(eq(carGroups.isActive, true));

    // Get revenue today
    const [revenueTodayResult] = await db
      .select({ total: sql`COALESCE(sum(${orders.total}), 0)::numeric` })
      .from(orders)
      .where(
        and(
          eq(orders.status, 'delivered'),
          sql`${orders.createdAt} >= ${todayStart}`
        )
      );

    return {
      totalOrders: totalOrdersResult?.count || 0,
      activeDeliveries: activeDeliveriesResult?.count || 0,
      completedToday: completedTodayResult?.count || 0,
      pendingOrders: pendingOrdersResult?.count || 0,
      totalVehicles: totalVehiclesResult?.count || 0,
      activeDrivers: activeDriversResult?.count || 0,
      totalGroups: totalGroupsResult?.count || 0,
      revenueToday: Number(revenueTodayResult?.total || 0)
    };
  }

  async getDeliveryOrders(filters?: {
    status?: string;
    limit?: number;
  }): Promise<any[]> {
    let query = db
      .select({
        order: orders,
        driver: vehicles
      })
      .from(orders)
      .leftJoin(vehicles, eq(orders.assignedDriverId, vehicles.id));

    if (filters?.status) {
      query = query.where(eq(orders.status, filters.status as any)) as any;
    }

    const limit = filters?.limit || 100;
    return await (query.orderBy(desc(orders.createdAt)).limit(limit) as any);
  }

  // 💎 VIP MANAGEMENT IMPLEMENTATION
  async getVIPMembers(filters?: { 
    status?: string; 
    membershipTier?: string; 
    limit?: number; 
    offset?: number 
  }): Promise<Customers[]> {
    const conditions = [eq(customers.customerRole, 'vip')];

    if (filters?.status) {
      if (filters.status === 'suspended') {
        conditions.push(sql`${customers.limitsData}->>'suspended' = 'true'`);
      } else if (filters.status === 'pending') {
        conditions.push(eq(customers.status, 'inactive'));
      } else if (filters.status === 'active') {
        conditions.push(
          and(
            eq(customers.status, 'active'),
            sql`(${customers.limitsData}->>'suspended' IS NULL OR ${customers.limitsData}->>'suspended' != 'true')`
          )!
        );
      } else {
        conditions.push(eq(customers.status, filters.status as any));
      }
    }

    if (filters?.membershipTier) {
      conditions.push(eq(customers.membershipTier, filters.membershipTier as any));
    }

    const limit = filters?.limit || 50;
    const offset = filters?.offset || 0;

    return await db
      .select()
      .from(customers)
      .where(and(...conditions))
      .orderBy(desc(customers.joinDate))
      .limit(limit)
      .offset(offset);
  }

  async getVIPDashboardStats(): Promise<{
    totalVIPs: number;
    pendingVIPs: number;
    activeVIPs: number;
    suspendedVIPs: number;
    tierBreakdown: Array<{ tier: string; count: number }>;
    totalRevenue: number;
    monthlyGrowth: number;
  }> {
    const [totalVIPsResult] = await db
      .select({ count: sql`count(*)::int` })
      .from(customers)
      .where(eq(customers.customerRole, 'vip'));

    const [pendingVIPsResult] = await db
      .select({ count: sql`count(*)::int` })
      .from(customers)
      .where(
        and(
          eq(customers.customerRole, 'vip'),
          eq(customers.status, 'inactive')
        )
      );

    const [activeVIPsResult] = await db
      .select({ count: sql`count(*)::int` })
      .from(customers)
      .where(
        and(
          eq(customers.customerRole, 'vip'),
          eq(customers.status, 'active'),
          sql`(${customers.limitsData}->>'suspended' IS NULL OR ${customers.limitsData}->>'suspended' != 'true')`
        )
      );

    const [suspendedVIPsResult] = await db
      .select({ count: sql`count(*)::int` })
      .from(customers)
      .where(
        and(
          eq(customers.customerRole, 'vip'),
          sql`${customers.limitsData}->>'suspended' = 'true'`
        )
      );

    const tierBreakdown = await db
      .select({
        tier: customers.membershipTier,
        count: sql<number>`count(*)::int`
      })
      .from(customers)
      .where(
        and(
          eq(customers.customerRole, 'vip'),
          isNotNull(customers.membershipTier)
        )
      )
      .groupBy(customers.membershipTier);

    const [totalRevenueResult] = await db
      .select({ total: sql`COALESCE(sum(${customers.totalSpent}), 0)::numeric` })
      .from(customers)
      .where(eq(customers.customerRole, 'vip'));

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [monthlyGrowthResult] = await db
      .select({ count: sql`count(*)::int` })
      .from(customers)
      .where(
        and(
          eq(customers.customerRole, 'vip'),
          gte(customers.joinDate, thirtyDaysAgo)
        )
      );

    return {
      totalVIPs: Number(totalVIPsResult?.count) || 0,
      pendingVIPs: Number(pendingVIPsResult?.count) || 0,
      activeVIPs: Number(activeVIPsResult?.count) || 0,
      suspendedVIPs: Number(suspendedVIPsResult?.count) || 0,
      tierBreakdown: tierBreakdown.filter(t => t.tier !== null).map(t => ({ tier: t.tier!, count: t.count })) || [],
      totalRevenue: Number(totalRevenueResult?.total || 0),
      monthlyGrowth: Number(monthlyGrowthResult?.count) || 0
    };
  }

  async approvePendingVIP(customerId: string, membershipTier?: string): Promise<Customers | undefined> {
    const [updated] = await db
      .update(customers)
      .set({
        customerRole: 'vip',
        status: 'active',
        membershipTier: membershipTier || 'member'
      })
      .where(eq(customers.id, customerId))
      .returning();
    return updated || undefined;
  }

  async toggleVIPStatus(customerId: string, status: 'active' | 'suspended'): Promise<Customers | undefined> {
    const [updated] = await db
      .update(customers)
      .set({
        limitsData: status === 'suspended' 
          ? sql`jsonb_set(COALESCE(${customers.limitsData}, '{}'::jsonb), '{suspended}', 'true'::jsonb)`
          : sql`jsonb_set(COALESCE(${customers.limitsData}, '{}'::jsonb), '{suspended}', 'false'::jsonb)`
      })
      .where(eq(customers.id, customerId))
      .returning();
    return updated || undefined;
  }

  async rejectVIPApplication(customerId: string, reason?: string): Promise<Customers | undefined> {
    const [updated] = await db
      .update(customers)
      .set({
        status: 'inactive',
        membershipData: sql`jsonb_set(COALESCE(${customers.membershipData}, '{}'::jsonb), '{rejectionReason}', ${JSON.stringify(reason || 'Không đủ điều kiện')}::jsonb)`
      })
      .where(eq(customers.id, customerId))
      .returning();
    return updated || undefined;
  }

  async getVIPProducts(): Promise<Products[]> {
    return await db
      .select()
      .from(products)
      .where(eq(products.isVipOnly, true))
      .orderBy(products.createdAt);
  }

  async bulkAssignVIPByCategory(categoryId: string, isVipOnly: boolean, requiredVipTier?: string | null): Promise<{ updatedCount: number }> {
    const result = await db
      .update(products)
      .set({
        isVipOnly,
        requiredVipTier: requiredVipTier || null
      })
      .where(eq(products.categoryId, categoryId))
      .returning({ id: products.id });
    
    return { updatedCount: result.length };
  }

  // 🚗 DRIVER MANAGEMENT IMPLEMENTATION
  async getDriverMembers(filters?: { 
    status?: string; 
    limit?: number; 
    offset?: number 
  }): Promise<Customers[]> {
    const conditions = [eq(customers.customerRole, 'driver')];

    if (filters?.status) {
      if (filters.status === 'suspended') {
        conditions.push(sql`${customers.limitsData}->>'suspended' = 'true'`);
      } else if (filters.status === 'pending') {
        conditions.push(eq(customers.status, 'inactive'));
      } else if (filters.status === 'active') {
        conditions.push(
          and(
            eq(customers.status, 'active'),
            sql`(${customers.limitsData}->>'suspended' IS NULL OR ${customers.limitsData}->>'suspended' != 'true')`
          )!
        );
      } else {
        conditions.push(eq(customers.status, filters.status as any));
      }
    }

    const limit = filters?.limit || 50;
    const offset = filters?.offset || 0;

    return await db
      .select()
      .from(customers)
      .where(and(...conditions))
      .orderBy(desc(customers.joinDate))
      .limit(limit)
      .offset(offset);
  }

  async getDriverDashboardStats(): Promise<{
    totalDrivers: number;
    pendingDrivers: number;
    activeDrivers: number;
    suspendedDrivers: number;
    totalDeliveries: number;
    totalRevenue: number;
  }> {
    const [totalDriversResult] = await db
      .select({ count: sql`count(*)::int` })
      .from(customers)
      .where(eq(customers.customerRole, 'driver'));

    const [pendingDriversResult] = await db
      .select({ count: sql`count(*)::int` })
      .from(customers)
      .where(
        and(
          eq(customers.customerRole, 'driver'),
          eq(customers.status, 'inactive')
        )
      );

    const [activeDriversResult] = await db
      .select({ count: sql`count(*)::int` })
      .from(customers)
      .where(
        and(
          eq(customers.customerRole, 'driver'),
          eq(customers.status, 'active'),
          sql`(${customers.limitsData}->>'suspended' IS NULL OR ${customers.limitsData}->>'suspended' != 'true')`
        )
      );

    const [suspendedDriversResult] = await db
      .select({ count: sql`count(*)::int` })
      .from(customers)
      .where(
        and(
          eq(customers.customerRole, 'driver'),
          sql`${customers.limitsData}->>'suspended' = 'true'`
        )
      );

    const [totalDeliveriesResult] = await db
      .select({ count: sql`count(*)::int` })
      .from(trips);

    const [totalRevenueResult] = await db
      .select({ total: sql`COALESCE(sum(${trips.expenses}), 0)::numeric` })
      .from(trips);

    return {
      totalDrivers: Number(totalDriversResult?.count) || 0,
      pendingDrivers: Number(pendingDriversResult?.count) || 0,
      activeDrivers: Number(activeDriversResult?.count) || 0,
      suspendedDrivers: Number(suspendedDriversResult?.count) || 0,
      totalDeliveries: Number(totalDeliveriesResult?.count) || 0,
      totalRevenue: Number(totalRevenueResult?.total || 0)
    };
  }

  async approvePendingDriver(customerId: string): Promise<Customers | undefined> {
    const [updated] = await db
      .update(customers)
      .set({
        customerRole: 'driver',
        status: 'active'
      })
      .where(eq(customers.id, customerId))
      .returning();
    return updated || undefined;
  }

  async toggleDriverStatus(customerId: string, status: 'active' | 'suspended'): Promise<Customers | undefined> {
    const [updated] = await db
      .update(customers)
      .set({
        limitsData: status === 'suspended' 
          ? sql`jsonb_set(COALESCE(${customers.limitsData}, '{}'::jsonb), '{suspended}', 'true'::jsonb)`
          : sql`jsonb_set(COALESCE(${customers.limitsData}, '{}'::jsonb), '{suspended}', 'false'::jsonb)`
      })
      .where(eq(customers.id, customerId))
      .returning();
    return updated || undefined;
  }

  async rejectDriverApplication(customerId: string, reason?: string): Promise<Customers | undefined> {
    const [updated] = await db
      .update(customers)
      .set({
        status: 'inactive',
        limitsData: sql`jsonb_set(COALESCE(${customers.limitsData}, '{}'::jsonb), '{rejectionReason}', ${JSON.stringify(reason || 'Không đủ điều kiện')}::jsonb)`
      })
      .where(eq(customers.id, customerId))
      .returning();
    return updated || undefined;
  }

  // 🤝 AFFILIATE MANAGEMENT IMPLEMENTATION
  async getAffiliateMembers(filters?: { 
    status?: string; 
    limit?: number; 
    offset?: number 
  }): Promise<Customers[]> {
    const conditions = [eq(customers.isAffiliate, true)];

    if (filters?.status) {
      conditions.push(eq(customers.affiliateStatus, filters.status as any));
    }

    const limit = filters?.limit || 50;
    const offset = filters?.offset || 0;

    return await db
      .select()
      .from(customers)
      .where(and(...conditions))
      .orderBy(desc(customers.joinDate))
      .limit(limit)
      .offset(offset);
  }

  async getAffiliateDashboardStats(): Promise<{
    totalAffiliates: number;
    pendingAffiliates: number;
    activeAffiliates: number;
    suspendedAffiliates: number;
  }> {
    const [totalAffiliatesResult] = await db
      .select({ count: sql`count(*)::int` })
      .from(customers)
      .where(eq(customers.isAffiliate, true));

    const [pendingAffiliatesResult] = await db
      .select({ count: sql`count(*)::int` })
      .from(customers)
      .where(
        and(
          eq(customers.isAffiliate, true),
          eq(customers.affiliateStatus, 'pending')
        )
      );

    const [activeAffiliatesResult] = await db
      .select({ count: sql`count(*)::int` })
      .from(customers)
      .where(
        and(
          eq(customers.isAffiliate, true),
          eq(customers.affiliateStatus, 'active')
        )
      );

    const [suspendedAffiliatesResult] = await db
      .select({ count: sql`count(*)::int` })
      .from(customers)
      .where(
        and(
          eq(customers.isAffiliate, true),
          eq(customers.affiliateStatus, 'suspended')
        )
      );

    return {
      totalAffiliates: Number(totalAffiliatesResult?.count) || 0,
      pendingAffiliates: Number(pendingAffiliatesResult?.count) || 0,
      activeAffiliates: Number(activeAffiliatesResult?.count) || 0,
      suspendedAffiliates: Number(suspendedAffiliatesResult?.count) || 0
    };
  }

  async approvePendingAffiliate(customerId: string, commissionRate?: string): Promise<Customers | undefined> {
    const [updated] = await db
      .update(customers)
      .set({
        isAffiliate: true,
        affiliateStatus: 'active',
        commissionRate: commissionRate || '10'
      })
      .where(eq(customers.id, customerId))
      .returning();
    return updated || undefined;
  }

  async toggleAffiliateStatus(customerId: string, status: 'active' | 'suspended'): Promise<Customers | undefined> {
    const [updated] = await db
      .update(customers)
      .set({
        affiliateStatus: status
      })
      .where(eq(customers.id, customerId))
      .returning();
    return updated || undefined;
  }

  async rejectAffiliateApplication(customerId: string, reason?: string): Promise<Customers | undefined> {
    const [updated] = await db
      .update(customers)
      .set({
        affiliateStatus: 'inactive',
        limitsData: sql`jsonb_set(COALESCE(${customers.limitsData}, '{}'::jsonb), '{rejectionReason}', ${JSON.stringify(reason || 'Không đủ điều kiện')}::jsonb)`
      })
      .where(eq(customers.id, customerId))
      .returning();
    return updated || undefined;
  }


  // 📦 Affiliate Product Request Methods
  async createAffiliateProductRequest(data: InsertAffiliateProductRequests): Promise<AffiliateProductRequests> {
    const [request] = await db
      .insert(affiliateProductRequests)
      .values(data as any)
      .returning();
    return request;
  }

  async getAffiliateProductRequests(affiliateId: string, options?: {
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<AffiliateProductRequests[]> {
    let query = db
      .select()
      .from(affiliateProductRequests)
      .where(eq(affiliateProductRequests.affiliateId, affiliateId))
      .$dynamic();

    if (options?.status) {
      query = query.where(eq(affiliateProductRequests.status, options.status));
    }

    query = query
      .orderBy(desc(affiliateProductRequests.createdAt))
      .limit(options?.limit || 20)
      .offset(options?.offset || 0);

    return await query;
  }

  async getAllAffiliateProductRequests(filters?: {
    status?: string;
    affiliateId?: string;
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
    const conditions = [];
    if (filters?.status) {
      conditions.push(eq(affiliateProductRequests.status, filters.status));
    }
    if (filters?.affiliateId) {
      conditions.push(eq(affiliateProductRequests.affiliateId, filters.affiliateId));
    }

    const limit = filters?.limit ?? 50;
    const offset = filters?.offset ?? 0;

    let query = db
      .select({
        id: affiliateProductRequests.id,
        affiliateId: affiliateProductRequests.affiliateId,
        productName: affiliateProductRequests.productName,
        productDescription: affiliateProductRequests.productDescription,
        productLink: affiliateProductRequests.productLink,
        suggestedPrice: affiliateProductRequests.suggestedPrice,
        categoryId: affiliateProductRequests.categoryId,
        status: affiliateProductRequests.status,
        requestReason: affiliateProductRequests.requestReason,
        adminNotes: affiliateProductRequests.adminNotes,
        approvedProductId: affiliateProductRequests.approvedProductId,
        approvedCommissionRate: affiliateProductRequests.approvedCommissionRate,
        reviewedBy: affiliateProductRequests.reviewedBy,
        reviewedAt: affiliateProductRequests.reviewedAt,
        createdAt: affiliateProductRequests.createdAt,
        updatedAt: affiliateProductRequests.updatedAt,
        affiliate: {
          name: customers.name,
          email: customers.email,
          affiliateCode: customers.affiliateCode,
        },
      })
      .from(affiliateProductRequests)
      .leftJoin(customers, eq(affiliateProductRequests.affiliateId, customers.id))
      .$dynamic();

    if (conditions.length > 0) {
      query = (query as any).where(and(...conditions));
    }

    query = query
      .orderBy(desc(affiliateProductRequests.createdAt))
      .limit(limit)
      .offset(offset);

    return await query;
  }

  async getAffiliateProductRequest(id: string): Promise<AffiliateProductRequests | undefined> {
    const [request] = await db
      .select()
      .from(affiliateProductRequests)
      .where(eq(affiliateProductRequests.id, id))
      .limit(1);
    return request || undefined;
  }

  async updateAffiliateProductRequest(
    id: string, 
    data: Partial<AffiliateProductRequests>
  ): Promise<AffiliateProductRequests | undefined> {
    const [request] = await db
      .update(affiliateProductRequests)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(affiliateProductRequests.id, id))
      .returning();
    return request || undefined;
  }

  // 📦 Affiliate Product Assignment Methods
  async createAffiliateProductAssignment(data: InsertAffiliateProductAssignments): Promise<AffiliateProductAssignments> {
    const [assignment] = await db
      .insert(affiliateProductAssignments)
      .values(data as any)
      .returning();
    return assignment;
  }

  async getAffiliateProductAssignments(filters?: {
    affiliateId?: string;
    productId?: string;
    assignmentType?: string;
    status?: string;
    isPremium?: boolean;
  }): Promise<any[]> {
    let query = db
      .select({
        id: affiliateProductAssignments.id,
        affiliateId: affiliateProductAssignments.affiliateId,
        targetId: affiliateProductAssignments.targetId,
        assignmentType: affiliateProductAssignments.assignmentType,
        commissionRate: affiliateProductAssignments.commissionRate,
        commissionType: affiliateProductAssignments.commissionType,
        isPremium: affiliateProductAssignments.isPremium,
        isActive: affiliateProductAssignments.isActive,
        createdAt: affiliateProductAssignments.createdAt,
        updatedAt: affiliateProductAssignments.updatedAt,
        affiliateName: customers.name,
        affiliateEmail: customers.email,
        productName: products.name,
        productPrice: products.price,
        productStock: products.stock,
      })
      .from(affiliateProductAssignments)
      .leftJoin(customers, eq(affiliateProductAssignments.affiliateId, customers.id))
      .leftJoin(products, eq(affiliateProductAssignments.targetId, products.id))
      .$dynamic();

    if (filters?.affiliateId) {
      query = query.where(eq(affiliateProductAssignments.affiliateId, filters.affiliateId));
    }
    if (filters?.productId) {
      query = query.where(eq(affiliateProductAssignments.targetId, filters.productId));
    }
    if (filters?.assignmentType) {
      query = query.where(eq(affiliateProductAssignments.assignmentType, filters.assignmentType));
    }
    if (filters?.isPremium !== undefined) {
      query = query.where(eq(affiliateProductAssignments.isPremium, filters.isPremium));
    }

    return await query;
  }

  async deleteAffiliateProductAssignment(id: string): Promise<boolean> {
    const result = await db
      .delete(affiliateProductAssignments)
      .where(eq(affiliateProductAssignments.id, id))
      .returning();
    return result.length > 0;
  }

  async getDefaultAffiliateAssignments(): Promise<AffiliateProductAssignments[]> {
    return await db
      .select()
      .from(affiliateProductAssignments)
      .where(eq(affiliateProductAssignments.isDefaultAssignment, true));
  }

  async getBulkAffiliateAssignments(affiliateIds: string[], productIds: string[]): Promise<AffiliateProductAssignments[]> {
    if (affiliateIds.length === 0 || productIds.length === 0) {
      return [];
    }
    
    return await db
      .select()
      .from(affiliateProductAssignments)
      .where(
        and(
          inArray(affiliateProductAssignments.affiliateId, affiliateIds),
          inArray(affiliateProductAssignments.targetId, productIds)
        )
      );
  }

  // 🌐 IP Pool Management Methods
  async createIpPool(data: InsertIpPools): Promise<IpPools> {
    const [pool] = await db.insert(ipPools).values(data as any).returning();
    return pool;
  }

  async getIpPool(id: string): Promise<IpPools | undefined> {
    const [pool] = await db.select().from(ipPools).where(eq(ipPools.id, parseInt(id)));
    return pool;
  }

  async getIpPools(filters?: { type?: string; status?: string; isEnabled?: boolean }): Promise<IpPools[]> {
    let query = db.select().from(ipPools).$dynamic();
    
    const conditions = [];
    if (filters?.type) conditions.push(eq(ipPools.type, filters.type));
    if (filters?.status) conditions.push(eq(ipPools.status, filters.status));
    if (filters?.isEnabled !== undefined) conditions.push(eq(ipPools.isEnabled, filters.isEnabled));
    
    if (conditions.length > 0) {
      query = (query as any).where(and(...conditions));
    }
    
    return await query.orderBy(desc(ipPools.priority), desc(ipPools.createdAt));
  }

  async updateIpPool(id: string, data: Partial<IpPools>): Promise<IpPools | undefined> {
    const [updated] = await db
      .update(ipPools)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(ipPools.id, parseInt(id)))
      .returning();
    return updated;
  }

  async deleteIpPool(id: string): Promise<boolean> {
    const result = await db.delete(ipPools).where(eq(ipPools.id, parseInt(id))).returning();
    return result.length > 0;
  }

  // IP Pool Session Methods
  async createIpPoolSession(data: InsertIpPoolSessions): Promise<IpPoolSessions> {
    const [session] = await db.insert(ipPoolSessions).values(data as any).returning();
    return session;
  }

  async getIpPoolSession(id: string): Promise<IpPoolSessions | undefined> {
    const [session] = await db.select().from(ipPoolSessions).where(eq(ipPoolSessions.id, parseInt(id)));
    return session;
  }

  async getIpPoolSessionsByPoolId(poolId: string): Promise<IpPoolSessions[]> {
    return await db
      .select()
      .from(ipPoolSessions)
      .where(eq(ipPoolSessions.ipPoolId, parseInt(poolId)))
      .orderBy(desc(ipPoolSessions.sessionStart));
  }

  async updateIpPoolSession(id: string, data: Partial<IpPoolSessions>): Promise<IpPoolSessions | undefined> {
    const [updated] = await db
      .update(ipPoolSessions)
      .set(data)
      .where(eq(ipPoolSessions.id, parseInt(id)))
      .returning();
    return updated;
  }

  // IP Rotation Log Methods
  async createIpRotationLog(data: InsertIpRotationLogs): Promise<IpRotationLogs> {
    const [log] = await db.insert(ipRotationLogs).values(data as any).returning();
    return log;
  }

  async getIpRotationLogs(poolId?: string, limit: number = 100): Promise<IpRotationLogs[]> {
    let query = db.select().from(ipRotationLogs).$dynamic();
    
    if (poolId) {
      query = query.where(eq(ipRotationLogs.ipPoolId, parseInt(poolId)));
    }
    
    return await query.orderBy(desc(ipRotationLogs.createdAt)).limit(limit);
  }

  // Missing methods
  async getUserById(id: string): Promise<Users | undefined> {
    return await this.getUser(id);
  }

  async getPageTag(id: string): Promise<any> {
    // Placeholder implementation
    return null;
  }

  // Affiliate Order Methods
  async createAffiliateOrder(data: InsertAffiliateOrders): Promise<AffiliateOrders> {
    const [order] = await db.insert(affiliateOrders).values(data as any).returning();
    return order;
  }

  async getAffiliateOrdersByAffiliateId(affiliateId: string): Promise<AffiliateOrders[]> {
    return await db
      .select()
      .from(affiliateOrders)
      .where(eq(affiliateOrders.affiliateId, affiliateId))
      .orderBy(desc(affiliateOrders.createdAt));
  }

  async getAffiliateOrderByOrderId(orderId: string): Promise<AffiliateOrders | undefined> {
    const [order] = await db
      .select()
      .from(affiliateOrders)
      .where(eq(affiliateOrders.orderId, orderId))
      .limit(1);
    return order;
  }

  // Affiliate Share Log Methods
  async createAffiliateShareLog(data: InsertAffiliateShareLogs): Promise<AffiliateShareLogs> {
    const [log] = await db.insert(affiliateShareLogs).values(data as any).returning();
    return log;
  }

  async getAffiliateShareLogsByDate(
    affiliateId: string,
    startDate: Date,
    endDate: Date
  ): Promise<AffiliateShareLogs[]> {
    return await db
      .select()
      .from(affiliateShareLogs)
      .where(
        and(
          eq(affiliateShareLogs.affiliateId, affiliateId),
          gte(affiliateShareLogs.sharedAt, startDate),
          lte(affiliateShareLogs.sharedAt, endDate)
        )
      )
      .orderBy(desc(affiliateShareLogs.sharedAt));
  }

  async getAffiliateShareLogsByAffiliateId(affiliateId: string): Promise<AffiliateShareLogs[]> {
    return await db
      .select()
      .from(affiliateShareLogs)
      .where(eq(affiliateShareLogs.affiliateId, affiliateId))
      .orderBy(desc(affiliateShareLogs.sharedAt));
  }
}

export const storage = new DatabaseStorage();
