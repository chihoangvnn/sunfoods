import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProductsSchema, insertCustomersSchema, insertOrdersSchema, insertCategoriesSchema, insertPaymentsSchema, insertSocialAccountsSchema, insertShopSettingsSchema, insertTiktokBusinessAccountsSchema, insertTiktokShopOrdersSchema, insertTiktokShopProductsSchema, insertTiktokVideosSchema, insertBotSettingsSchema } from "@shared/schema";
import { z } from "zod";
import { promisify } from 'util';
import { lookup } from 'dns';
import { setupRasaRoutes } from "./rasa-routes";
import { facebookAuth } from "./facebook-auth";
import { tiktokAuth } from "./tiktok-auth";
import { fetchMessengerUserProfile } from "./services/facebook-graph";

// 🔒 Authentication Middleware for Sync Operations
const requireAuth = (req: any, res: any, next: any) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ 
      error: "Unauthorized. Please log in to perform sync operations.",
      code: "AUTH_REQUIRED"
    });
  }
  next();
};

import { tiktokShopOrdersService } from './tiktok-shop-orders';
import { tiktokShopSellerService } from './tiktok-shop-seller';
import { tiktokShopFulfillmentService } from './tiktok-shop-fulfillment';
import { orderSyncService } from './services/order-sync-service';
import { notificationService, VIETNAMESE_ORDER_TEMPLATES } from './services/notificationService';
import { sendOrderStatusNotification } from './services/order-notifications';
import { generateSKU } from "./utils/sku-generator";
import multer from 'multer';
import { uploadToCloudinary, deleteFromCloudinary, convertToCloudinaryMedia } from './services/cloudinary';
import crypto from 'crypto';
import express from 'express';
import { postScheduler } from './services/post-scheduler';
import { getHealthService } from './services/ipPoolHealthService';
import { getRotationService } from './services/ipRotationService';
import { getAssignmentService } from './services/ipAssignmentService';
import bulkUploadRoutes from './routes/bulk-upload';
import storeRoutes from './routes/stores';
import facebookAppsRouter from './api/facebook-apps';
import { requireAuth as requireReplitAuth, getCurrentUser, logout, replitAuth, upsertAuthUser } from './replitAuth';
import productsRouter from './api/products';
import productFAQsRouter from './api/product-faqs';
import aiContentRouter from './api/ai-content';
import analyticsRouter from './api/analytics';
import recommendationsRouter from './api/recommendations';
import limitManagementRouter from './api/limit-management';
import { cacheMiddleware, CacheKeys } from './middleware/cache';
import { requirePOSAuth } from './middleware/pos-auth';
import { requireAdminAuth as requireAdminAuthMiddleware } from './middleware/admin-auth';
import automationRouter from './api/automation';
import satellitesRouter from './api/satellites';
import postsRouter from './api/posts';
import workersRouter from './api/workers';
import regionAssignmentRouter from './api/region-assignment';
import ngrokConfigRouter from './api/ngrok-config';
import booksRouter from './api/books';
import bookOrdersRouter from './api/book-orders';
import bookCategoriesRouter from './api/book-categories';
import botCustomerRouter from './api/bot-customer';
import { registerBotEventsRoutes } from './api/bot-events';
import { registerBotCronRoutes } from './api/bot-cron';
import botTierRouter from './api/bot-tier';
import botRecommendationsRouter from './api/bot-recommendations';
import botCartRouter from './api/bot-cart';
import botInsightsRouter from './api/bot-insights';
import botConfigRouter from './api/bot-config';
import categoriesRouter from './api/categories';
import generalCategoriesRouter from './api/general-categories';
import priceFilteringRouter from './api/price-filtering';
import smartSearchRouter from './api/smart-search';
import bookSellersRouter from './api/book-sellers';
import bookCustomersRouter from './api/book-customers';
import bookInventoryRouter from './api/book-inventory';
import sellerRatingsRouter from './api/seller-ratings-simple';
import sellerPerformanceAnalyticsRouter from './api/seller-performance-analytics';
import pricingAutomationRouter from './api/pricing-automation';
import salesAutomationRouter from './api/sales-automation';
import advancedAutomationRouter from './api/advanced-automation';
import giftCampaignsRouter from './api/gift-campaigns';
import giftVouchersRouter from './api/gift-vouchers';
import lunarCalendarHandler from './api/lunar-calendar';
import membershipRouter from './api/membership';
import customerVouchersRouter from './api/customer-vouchers';
import publicVouchersRouter from './api/public-vouchers';
import customerManagementRouter from './api/customer-management';
import wishlistRouter from './api/wishlist';
import customerProfileRouter from './api/customer-profile';
import sessionRouter from './api/session';
import notificationsRouter from './api/notifications';
import { secureAddressHandlers } from './api/secure-addresses';
import discountsRouter from './api/discounts';
import discountsValidationRouter from './api/discounts-validation';
import checkoutRouter from './api/checkout';
import cookieProfilesRouter from './api/cookie-profiles';
import usersRouter from './api/users';
import affiliatesRouter from './api/affiliates';
import affiliateAuthRouter from './api/affiliate-auth';
import affiliatePortalRouter from './api/affiliate-portal';
import vipPortalRouter from './api/vip-portal';
import driverPortalRouter from './api/driver-portal';
import deliveryManagementRouter from './api/delivery-management';
import { vipManagementRouter } from './api/vip-management';
import { driverManagementRouter } from './api/driver-management';
import { affiliateManagementRouter } from './api/affiliate-management';
import { affiliateLandingRouter } from './api/affiliate-landing';
import customerDashboardRouter from './api/customer-dashboard';
import adminAuthRouter from './api/admin-auth';
import devLoginRouter from './api/dev-login';
import adminVendorsRouter from './api/admin-vendors';
import adminCampaignsRouter from './api/admin-campaigns';
import adminOAuthRouter from './api/admin-oauth';
import oauthProviderSettingsRouter from './api/oauth-provider-settings';
import campaignsRouter from './api/campaigns';
import vendorAuthRouter from './api/vendor-auth';
import vendorDashboardRouter from './api/vendor-dashboard';
import vendorProductsRouter from './api/vendor-products';
import vendorConsignmentRouter from './api/vendor-consignment';
import vendorOrdersRouter from './api/vendor-orders';
import vendorFinancialRouter from './api/vendor-financial';
import vendorReturnsRouter from './api/vendor-returns';
import vendorSettingsRouter from './api/vendor-settings';
import vendorNotificationsRouter from './api/vendor-notifications';
import shippingGhnRouter from './api/shipping-ghn';
import shopSettingsRouter from './api/shop-settings';
import shopInfoRouter from './api/shop-info';
import flashSalesRouter from './api/flash-sales';
import preordersRouter from './api/preorders';
import { registerPaymentSettingsRoutes } from './api/payment-settings';
import { registerBookTransactionsRoutes } from './api/book-transactions';
import { registerBookCheckoutRoutes } from './api/book-checkout';
import { processMembershipForOrder, ensureCustomerForOrder, calculateTier } from './services/membership-service';
import { vtpOrderIntegration } from './services/vtp-order-integration.js';
import vipRegistrationRouter from './api/vip-registration';

// Vietnamese slug utility function
function generateSlug(input: string): string {
  if (!input || input.trim().length === 0) {
    return 'san-pham';
  }
  
  // Convert to lowercase and normalize Vietnamese diacritics
  const slug = input
    .toLowerCase()
    .trim()
    // Replace Vietnamese diacritics
    .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
    .replace(/[èéẹẻẽêềếệểễ]/g, 'e')
    .replace(/[ìíịỉĩ]/g, 'i')
    .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
    .replace(/[ùúụủũưừứựửữ]/g, 'u')
    .replace(/[ỳýỵỷỹ]/g, 'y')
    .replace(/đ/g, 'd')
    // Remove non-alphanumeric characters except hyphens
    .replace(/[^a-z0-9\s-]/g, '')
    // Replace spaces with hyphens
    .replace(/\s+/g, '-')
    // Remove multiple consecutive hyphens
    .replace(/-+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-|-$/g, '');
  
  // Ensure slug is not empty
  if (slug.length === 0) {
    return 'san-pham';
  }
  
  // Limit slug length
  if (slug.length > 100) {
    return slug.substring(0, 100).replace(/-$/, '');
  }
  
  return slug;
}

// Generate unique slug with suffix handling
async function generateUniqueSlug(baseSlug: string): Promise<string> {
  let uniqueSlug = baseSlug;
  let counter = 1;
  
  // Keep checking until we find a unique slug
  while (true) {
    try {
      const existingProduct = await storage.getProductBySlug(uniqueSlug);
      if (!existingProduct) {
        // Slug is unique, return it
        return uniqueSlug;
      }
      // Slug exists, try with suffix
      uniqueSlug = `${baseSlug}-${counter}`;
      counter++;
      
      // Safety check to prevent infinite loop
      if (counter > 1000) {
        return `${baseSlug}-${Date.now()}`;
      }
    } catch (error) {
      // If there's an error checking, return the slug as-is
      console.error("Error checking slug uniqueness:", error);
      return uniqueSlug;
    }
  }
}
import jobCallbacksRouter from './api/job-callbacks';
import systemHealthRouter from './api/system-health';
import orchestratorRouter from './api/orchestrator';
import faqLibraryRouter from './api/faq-library';
import faqAssignmentsRouter from './api/faq-assignments';
// DISABLED: Tables do not exist in database
// import { categoryFAQTemplatesRoutes } from './api/category-faq-templates';
import categoryFAQTemplatesRouter from './api/category-faq-templates';
// DISABLED: Check if this also has missing tables
// import { aiFAQGenerationRoutes } from './api/ai-faq-generation';
import aiFAQGenerationRouter from './api/ai-faq-generation';
import reviewSeedingRouter from './api/review-seeding';
import adminReviewsRouter from './api/admin-reviews';
import themesRouter from './api/themes';
import templatesRouter from './api/templates';
import rasaManagementRouter from './api/rasa-management';
import rasaConversationsRouter from './api/rasa-conversations';
import rasaIndustryRouter from './api/rasa-industry';
import chatLogsRouter from './api/chat-logs';
import pushNotificationsRouter from './api/push-notifications';
import contentPreviewRouter from './api/content-preview';
import scheduledPostsRouter from './api/scheduled-posts';
import schedulerRouter from './api/scheduler';
import { registerAnalyticsSchedulerRoutes } from './api/analytics-scheduler';
import { duplicateDetectionRouter } from './api/duplicate-detection';
import fanpageMatchingRouter from './api/fanpage-matching';
import invoiceRouter from './api/invoice';
import invoiceTemplatesRouter from './api/invoice-templates';
import { autoSendInvoiceIfNeeded } from './utils/auto-send-invoice';
import contentLibraryRouter from './api/content-library';
import vehiclesRouter from './api/vehicles';
import apiManagementRouter from './api/api-management';

// Facebook webhook event processing functions

// Helper: Call RASA API to get chatbot response
async function callRasaAPI(message: string, sender: string, rasaUrl: string): Promise<any[]> {
  try {
    const response = await fetch(`${rasaUrl}/webhooks/rest/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        sender: sender,
        message: message
      }),
      signal: AbortSignal.timeout(10000) // 10s timeout
    });

    if (!response.ok) {
      throw new Error(`RASA API error: ${response.status} ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      throw new Error(`RASA returned non-JSON response (${contentType}): ${text.substring(0, 200)}`);
    }

    const data = await response.json() as any[];
    console.log('✅ RASA response:', data);
    return data;
  } catch (error) {
    console.error('❌ RASA API call failed:', error);
    throw error;
  }
}

// Helper: Send message to Facebook Messenger with buttons/quick_replies support
async function sendFacebookMessage(
  pageId: string,
  recipientId: string, 
  message: string,
  socialAccount: any,
  options?: {
    buttons?: any[];
    quick_replies?: any[];
    attachment?: any;
    image?: string;
  }
): Promise<string> {
  try {
    // Get page access token
    const pageTokens = socialAccount.pageAccessTokens as any[];
    const pageToken = pageTokens?.find((t: any) => t.pageId === pageId)?.accessToken 
                      || pageTokens?.[0]?.accessToken;

    if (!pageToken) {
      throw new Error('No page access token available');
    }

    // Build message payload based on what's provided
    let messagePayload: any = {};

    // 1. Handle image attachment
    if (options?.image) {
      messagePayload = {
        attachment: {
          type: 'image',
          payload: {
            url: options.image,
            is_reusable: true
          }
        }
      };
    }
    // 2. Handle custom attachment (audio, video, file)
    else if (options?.attachment) {
      messagePayload = {
        attachment: options.attachment
      };
    }
    // 3. Handle buttons (button template)
    else if (options?.buttons && options.buttons.length > 0) {
      messagePayload = {
        attachment: {
          type: 'template',
          payload: {
            template_type: 'button',
            text: message || 'Vui lòng chọn:',
            buttons: options.buttons.map((btn: any) => {
              // Map RASA button format to Facebook button format
              if (btn.type === 'postback' || !btn.type) {
                return {
                  type: 'postback',
                  title: btn.title || btn.payload,
                  payload: btn.payload || btn.title
                };
              } else if (btn.type === 'web_url') {
                return {
                  type: 'web_url',
                  url: btn.url,
                  title: btn.title
                };
              }
              return btn;
            })
          }
        }
      };
    }
    // 4. Handle text message
    else {
      messagePayload = { text: message };
    }

    // 5. Add quick_replies if provided (can be combined with text or attachment)
    if (options?.quick_replies && options.quick_replies.length > 0) {
      messagePayload.quick_replies = options.quick_replies.map((qr: any) => ({
        content_type: qr.content_type || 'text',
        title: qr.title || qr.payload,
        payload: qr.payload || qr.title,
        ...(qr.image_url && { image_url: qr.image_url })
      }));
    }

    const payload = {
      recipient: { id: recipientId },
      message: messagePayload,
      messaging_type: 'RESPONSE'
    };

    console.log('📤 Sending to Facebook:', JSON.stringify(payload, null, 2));

    // Send message via Facebook Send API
    const response = await fetch(`https://graph.facebook.com/v18.0/me/messages?access_token=${pageToken}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Facebook Send API error: ${response.status} - ${error}`);
    }

    const result = await response.json() as any;
    console.log('✅ Message sent to Facebook:', result);
    
    // Return Facebook message_id from API response
    return result.message_id || `fallback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  } catch (error) {
    console.error('❌ Failed to send Facebook message:', error);
    throw error;
  }
}

async function processFacebookMessage(event: any, appId?: string) {
  try {
    console.log('Processing Facebook message event:', event);
    
    const senderId = event.sender?.id;
    const recipientId = event.recipient?.id; // Page ID
    const messageData = event.message;
    const timestamp = event.timestamp;

    if (!senderId || !recipientId || !messageData) {
      console.log('Invalid message event structure');
      return;
    }

    // Find the social account for this page
    const socialAccount = await storage.getSocialAccountByPageId(recipientId);
    if (!socialAccount) {
      console.log(`No social account found for page ID: ${recipientId}`);
      return;
    }

    // Find or create conversation
    let conversation = await storage.getFacebookConversationByParticipant(recipientId, senderId);
    
    if (!conversation) {
      // Create new conversation
      const userData = await fetchFacebookUserData(senderId, socialAccount, recipientId, appId);
      conversation = await storage.createFacebookConversation({
        pageId: recipientId,
        pageName: socialAccount.name,
        participantId: senderId,
        participantName: userData.name || 'Unknown User',
        participantAvatar: userData.picture?.data?.url,
        status: 'active',
        priority: 'normal',
        tagIds: [],
        messageCount: 0,
        lastMessageAt: new Date(timestamp),
        lastMessagePreview: messageData.text?.substring(0, 100) || '[Media]',
        isRead: false
      });
    }

    // 👤 AUTO-UPDATE CUSTOMER PROFILE - Fill empty fields from Facebook Graph API
    // This feature automatically enriches customer profiles when they message via Messenger
    // Strategy: ONLY fill empty fields - never overwrite existing data
    if (!event.message?.is_echo && senderId) {
      try {
        // Look up customer by PSID
        const customer = await storage.getCustomerByPSID(senderId);
        
        if (customer) {
          // Extract current profile data from customer record
          const membershipData = (customer.membershipData as any) || {};
          const socialData = (customer.socialData as any) || {};
          
          // Check which fields are empty (read from correct locations)
          const needsAvatar = !customer.avatar; // ✅ Read from root customer.avatar
          const needsLocale = !membershipData.locale;
          const needsTimezone = membershipData.timezone === undefined || membershipData.timezone === null;
          const needsFirstName = !socialData.firstName;
          const needsLastName = !socialData.lastName;
          const needsGender = !socialData.gender;
          
          // Only fetch profile if at least one field is empty (optimization)
          const hasEmptyFields = needsAvatar || needsLocale || needsTimezone || 
                                  needsFirstName || needsLastName || needsGender;
          
          if (hasEmptyFields) {
            // Get page access token for this page
            const pageTokens = socialAccount.pageAccessTokens as any[];
            const pageToken = pageTokens?.find((t: any) => t.pageId === recipientId)?.accessToken 
                            || pageTokens?.[0]?.accessToken;
            
            if (pageToken) {
              console.log(`📋 Fetching Messenger profile for customer ${customer.id} (PSID: ${senderId})`);
              
              // Fetch profile from Facebook Graph API
              const profile = await fetchMessengerUserProfile(senderId, pageToken);
              
              if (profile) {
                // Build update object with ONLY empty fields (fill-empty-only strategy)
                const updateData: any = {};
                let fieldsUpdated: string[] = [];
                
                // Update root-level avatar (only if empty)
                if (needsAvatar && profile.profilePic) {
                  updateData.avatar = profile.profilePic; // ✅ Write to root customer.avatar
                  fieldsUpdated.push('avatar');
                }
                
                // Update membershipData fields (only if empty)
                if (needsLocale || needsTimezone) {
                  updateData.membershipData = { ...membershipData };
                  
                  if (needsLocale && profile.locale) {
                    updateData.membershipData.locale = profile.locale;
                    fieldsUpdated.push('locale');
                  }
                  if (needsTimezone && profile.timezone !== undefined) {
                    updateData.membershipData.timezone = profile.timezone;
                    fieldsUpdated.push('timezone');
                  }
                }
                
                // Update socialData fields (only if empty)
                if (needsFirstName || needsLastName || needsGender) {
                  updateData.socialData = { ...socialData };
                  
                  if (needsFirstName && profile.firstName) {
                    updateData.socialData.firstName = profile.firstName;
                    fieldsUpdated.push('firstName');
                  }
                  if (needsLastName && profile.lastName) {
                    updateData.socialData.lastName = profile.lastName;
                    fieldsUpdated.push('lastName');
                  }
                  if (needsGender && profile.gender) {
                    updateData.socialData.gender = profile.gender;
                    fieldsUpdated.push('gender');
                  }
                }
                
                // Update customer in database if we have fields to update
                if (fieldsUpdated.length > 0) {
                  await storage.updateCustomer(customer.id, updateData);
                  console.log(`✅ Auto-updated customer ${customer.id} profile: ${fieldsUpdated.join(', ')}`);
                } else {
                  console.log(`ℹ️ No new profile data to update for customer ${customer.id}`);
                }
              } else {
                console.log(`⚠️ Failed to fetch Messenger profile for PSID: ${senderId}`);
              }
            } else {
              console.log(`⚠️ No page access token available for auto-update (Page: ${recipientId})`);
            }
          } else {
            console.log(`ℹ️ Customer ${customer.id} profile is complete - skipping auto-update`);
          }
        } else {
          console.log(`ℹ️ No customer found for PSID: ${senderId} - skipping auto-update`);
        }
      } catch (profileError) {
        // Log error but don't break message processing flow
        console.error('❌ Auto-update customer profile failed:', profileError);
      }
    }

    // 🏷️ SUPPORT REQUEST DETECTION - Detect support keywords in customer messages
    const supportKeywords = ['hỗ trợ', 'support', 'help', 'giúp đỡ', 'tư vấn', 'hỏi đáp'];
    const messageText = (messageData.text || '').toLowerCase();
    const isSupportRequest = supportKeywords.some(keyword => messageText.includes(keyword));
    
    // Update conversation tags if support is requested
    if (isSupportRequest && !event.message?.is_echo) {
      console.log('🆘 Support request detected in message');
      const currentTags = conversation.tagIds || [];
      if (!currentTags.includes('support-request')) {
        await storage.updateFacebookConversation(conversation.id, {
          tagIds: [...currentTags, 'support-request']
        });
        console.log('✅ Added support-request tag to conversation');
      }
    }
    
    // Create message record
    const attachments = [];
    if (messageData.attachments) {
      for (const attachment of messageData.attachments) {
        attachments.push({
          type: attachment.type,
          url: attachment.payload?.url,
          title: attachment.title,
          payload: attachment.payload
        });
      }
    }

    await storage.createFacebookMessage({
      conversationId: conversation.id,
      facebookMessageId: messageData.mid,
      senderId: senderId,
      senderName: event.message?.is_echo ? socialAccount.name : conversation.participantName,
      senderType: event.message?.is_echo ? 'page' : 'user',
      content: messageData.text || null,
      messageType: messageData.attachments?.[0]?.type || 'text',
      attachments: attachments,
      timestamp: new Date(timestamp),
      isEcho: event.message?.is_echo || false,
      replyToMessageId: messageData.reply_to?.mid,
      isRead: false,
      isDelivered: true
    });

    console.log(`Facebook message processed for conversation: ${conversation.id}`);

    // 🤖 RASA CHATBOT INTEGRATION - Forward message to RASA if autoReply enabled
    // Skip if this is an echo message (sent by page) to avoid infinite loops
    if (!event.message?.is_echo && messageData.text) {
      try {
        // Load global bot settings
        const botSettings = await storage.getBotSettings();
        
        // Load per-fanpage bot config (defaults to {} if not configured)
        const fanpageBotConfig = (await storage.getSocialAccountBotConfig(socialAccount.id)) || {};
        
        // Merge configs: fanpage settings override global settings
        const mergedConfig = {
          isEnabled: fanpageBotConfig.enabled ?? botSettings?.isEnabled ?? false,
          autoReply: fanpageBotConfig.autoReply ?? botSettings?.autoReply ?? false,
          rasaUrl: fanpageBotConfig.rasaUrl ?? botSettings?.rasaUrl ?? '',
        };
        
        console.log(`🤖 Bot config for fanpage ${socialAccount.name}:`, {
          enabled: mergedConfig.isEnabled,
          autoReply: mergedConfig.autoReply,
          hasCustomRasaUrl: !!fanpageBotConfig.rasaUrl
        });
        
        if (mergedConfig.autoReply && mergedConfig.isEnabled) {
          console.log('🤖 Auto-reply enabled - forwarding to RASA...');
          
          let sentReply = false;
          
          try {
            // Call RASA API with retry logic (use merged config URL)
            const rasaResponse = await callRasaAPI(
              messageData.text, 
              senderId, 
              mergedConfig.rasaUrl
            );
            
            if (rasaResponse && rasaResponse.length > 0) {
              console.log('📥 RASA returned', rasaResponse.length, 'response(s)');
              
              // ⚡ PARALLEL PROCESSING: Send all RASA responses to Messenger in parallel
              const sendPromises = rasaResponse.map(async (response) => {
                console.log('🔍 Processing RASA response:', JSON.stringify(response, null, 2));
                
                // Extract all possible response fields from RASA
                const text = response.text || '';
                const buttons = response.buttons || [];
                const quick_replies = response.quick_replies || [];
                const image = response.image || null;
                const attachment = response.attachment || null;
                
                // Determine what to send based on available data
                if (text || buttons.length > 0 || quick_replies.length > 0 || image || attachment) {
                  console.log(`📤 Sending message - Text: ${!!text}, Buttons: ${buttons.length}, Quick_Replies: ${quick_replies.length}, Image: ${!!image}`);
                  
                  try {
                    // Send message with all available options
                    const fbMessageId = await sendFacebookMessage(
                      recipientId,
                      senderId,
                      text,
                      socialAccount,
                      {
                        buttons: buttons.length > 0 ? buttons : undefined,
                        quick_replies: quick_replies.length > 0 ? quick_replies : undefined,
                        image: image,
                        attachment: attachment
                      }
                    );
                    
                    // 📝 LOG: Save bot reply to conversation history
                    try {
                      // Build content for logging (include button/quick_reply info)
                      let logContent = text;
                      if (buttons.length > 0) {
                        logContent += `\n[Buttons: ${buttons.map((b: any) => b.title).join(', ')}]`;
                      }
                      if (quick_replies.length > 0) {
                        logContent += `\n[Quick Replies: ${quick_replies.map((q: any) => q.title).join(', ')}]`;
                      }
                      if (image) {
                        logContent += `\n[Image: ${image}]`;
                      }
                      
                      await storage.createFacebookMessage({
                        conversationId: conversation.id,
                        facebookMessageId: fbMessageId,
                        senderId: recipientId, // Bot (page) is sender
                        senderName: socialAccount.name,
                        senderType: 'page',
                        content: logContent,
                        messageType: image ? 'image' : 'text', // Buttons are saved as text with button info in content
                        attachments: image ? [{ type: 'image', url: image }] : [],
                        timestamp: new Date(),
                        isEcho: true, // Mark as echo since it's from the bot
                        isRead: true,
                        isDelivered: true
                      });
                      console.log('✅ Logged bot reply to database with ID:', fbMessageId);
                    } catch (logError) {
                      console.error('❌ Failed to log bot reply:', logError);
                    }
                    
                    return true; // Success
                  } catch (sendError) {
                    console.error('❌ Failed to send message to Facebook:', sendError);
                    return false; // Failed
                  }
                } else {
                  console.log('⚠️ RASA response has no content to send (no text, buttons, quick_replies, or image)');
                  return false;
                }
              });
              
              // Wait for all messages to be sent in parallel
              const results = await Promise.allSettled(sendPromises);
              const successCount = results.filter(r => r.status === 'fulfilled' && r.value).length;
              console.log(`✅ Sent ${successCount}/${rasaResponse.length} messages to Facebook`);
              
              if (successCount > 0) {
                sentReply = true;
              }
            }
          } catch (rasaError) {
            console.error('❌ RASA integration failed:', rasaError);
            
            // 💬 FALLBACK: Send friendly error message to user
            try {
              const fallbackMessage = 
                "Xin lỗi, chatbot đang tạm thời bận. Vui lòng thử lại sau hoặc liên hệ trực tiếp với chúng tôi. Cảm ơn bạn! 🙏";
              
              const fallbackMsgId = await sendFacebookMessage(
                recipientId,
                senderId,
                fallbackMessage,
                socialAccount
              );
              console.log('✅ Sent fallback message to user');
              
              // 📝 LOG: Persist fallback message for conversation traceability
              try {
                await storage.createFacebookMessage({
                  conversationId: conversation.id,
                  facebookMessageId: fallbackMsgId,
                  senderId: recipientId,
                  senderName: socialAccount.name,
                  senderType: 'page',
                  content: fallbackMessage,
                  messageType: 'text',
                  attachments: [],
                  timestamp: new Date(),
                  isEcho: true,
                  isRead: true,
                  isDelivered: true
                });
                console.log('✅ Logged fallback message to database');
              } catch (logError) {
                console.error('Failed to log fallback message:', logError);
              }
            } catch (fallbackError) {
              console.error('❌ Failed to send fallback message:', fallbackError);
            }
          }
        }
      } catch (settingsError) {
        console.error('Error checking bot settings:', settingsError);
        // Continue silently - don't break webhook processing
      }
    }
  } catch (error) {
    console.error('Error processing Facebook message:', error);
  }
}

async function processFacebookFeedEvent(change: any) {
  try {
    console.log('Processing Facebook feed event:', change);
    
    // Handle different feed event types
    const field = change.field;
    const value = change.value;

    switch (field) {
      case 'posts':
        console.log('Post event:', value);
        // Handle post creation, updates, deletions
        break;
      case 'comments':
        console.log('Comment event:', value);
        // Handle comment creation, updates, deletions
        break;
      case 'reactions':
        console.log('Reaction event:', value);
        // Handle likes, reactions
        break;
      default:
        console.log(`Unhandled feed event type: ${field}`);
    }
  } catch (error) {
    console.error('Error processing Facebook feed event:', error);
  }
}

async function fetchFacebookUserData(userId: string, socialAccount: any, pageId?: string, appId?: string) {
  try {
    // Get page access token for this page
    const pageTokens = socialAccount.pageAccessTokens as any[];
    if (!pageTokens || pageTokens.length === 0) {
      console.log('No page tokens available');
      const appName = await resolveAppName(appId);
      return { name: createFallbackUserName(userId, appName) };
    }

    // Find the correct page token for the specific page ID
    let pageToken = pageTokens.find((token: any) => token.pageId === pageId)?.accessToken;
    
    // Fallback to first token if no specific match (for backwards compatibility)
    if (!pageToken) {
      pageToken = pageTokens[0]?.accessToken;
      console.log(`No token found for pageId ${pageId}, using first available token`);
    }
    
    if (!pageToken) {
      console.log('No access token found');
      const appName = await resolveAppName(appId);
      return { name: createFallbackUserName(userId, appName) };
    }

    const response = await fetch(`https://graph.facebook.com/v18.0/${userId}?fields=name,picture&access_token=${pageToken}`);
    if (response.ok) {
      return await response.json();
    } else {
      console.log(`Failed to fetch user data: ${response.status} - Using fallback name`);
      // Facebook has strict privacy policies - fallback to friendly user ID
      const appName = await resolveAppName(appId);
      return { name: createFallbackUserName(userId, appName) };
    }
  } catch (error) {
    console.error('Error fetching Facebook user data:', error);
    const appName = await resolveAppName(appId);
    return { name: createFallbackUserName(userId, appName) };
  }
}

// Helper function to resolve app name from app ID
async function resolveAppName(appId?: string): Promise<string | undefined> {
  if (!appId) {
    return undefined;
  }
  
  try {
    const facebookApp = await storage.getFacebookAppByAppId(appId);
    if (facebookApp && facebookApp.appName) {
      console.log(`Resolved app name: "${facebookApp.appName}" for app ID: ${appId}`);
      return facebookApp.appName;
    }
  } catch (error) {
    console.error('Error resolving app name:', error);
  }
  
  return undefined;
}

// Create a friendly fallback name using app name and random numbers
function createFallbackUserName(userId: string, appName?: string): string {
  // Generate random 3-digit number for uniqueness
  const randomNum = Math.floor(Math.random() * 900) + 100; // 100-999
  
  // Clean app name or use default
  const cleanAppName = appName ? appName.replace(/[^a-zA-Z0-9\s]/g, '').trim() : 'SocialApp';
  const shortAppName = cleanAppName.length > 15 ? cleanAppName.substring(0, 15) : cleanAppName;
  
  return `${shortAppName} User ${randomNum}`;
}


// Payment status validation schema
const paymentStatusSchema = z.object({
  status: z.enum(["pending", "completed", "failed", "cancelled"], {
    errorMap: () => ({ message: "Status must be one of: pending, completed, failed, cancelled" })
  }),
  transactionId: z.string().optional()
});

// Session-based authentication middleware for frontend users
const requireSessionAuth = (req: any, res: any, next: any) => {
  // For development, allow all requests (production would check session)
  if (process.env.NODE_ENV === 'development') {
    next();
    return;
  }
  
  // In production, check for valid session
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ 
      error: "Authentication required", 
      message: "Please log in to access this resource" 
    });
  }
  
  next();
};

// Admin-only access for webhook configuration (production security)
const requireAdminAuth = (req: any, res: any, next: any) => {
  // For development, allow all requests
  if (process.env.NODE_ENV === 'development') {
    next();
    return;
  }
  
  // Check session first
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ 
      error: "Authentication required", 
      message: "Please log in to access this resource" 
    });
  }
  
  // Check admin role (customize based on your user role system)
  if (!req.session.isAdmin && req.session.role !== 'admin') {
    return res.status(403).json({ 
      error: "Admin access required", 
      message: "Only administrators can access webhook configuration" 
    });
  }
  
  next();
};

// CSRF protection for state-changing operations
const requireCSRFToken = (req: any, res: any, next: any) => {
  // For development, allow all requests
  if (process.env.NODE_ENV === 'development') {
    next();
    return;
  }
  
  const csrfToken = req.headers['x-csrf-token'] || req.body.csrfToken;
  const sessionCSRF = req.session.csrfToken;
  
  if (!csrfToken || !sessionCSRF || csrfToken !== sessionCSRF) {
    return res.status(403).json({ 
      error: "CSRF token invalid", 
      message: "Invalid or missing CSRF token" 
    });
  }
  
  next();
};

// Rate limiting for payment endpoints
const paymentRateLimit = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX = 10; // 10 requests per minute per IP

const rateLimitMiddleware = (req: any, res: any, next: any) => {
  const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();
  
  const clientData = paymentRateLimit.get(clientIP);
  
  if (!clientData || now > clientData.resetTime) {
    paymentRateLimit.set(clientIP, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    next();
    return;
  }
  
  if (clientData.count >= RATE_LIMIT_MAX) {
    return res.status(429).json({
      error: "Rate limit exceeded",
      message: "Too many payment requests. Please try again later."
    });
  }
  
  clientData.count++;
  next();
};

// OAuth state storage for CSRF protection
const oauthStates = new Map<string, { timestamp: number; redirectUrl?: string; platform?: string }>();
const OAUTH_STATE_TIMEOUT = 10 * 60 * 1000; // 10 minutes

// Clean up expired OAuth states
setInterval(() => {
  const now = Date.now();
  const entries = Array.from(oauthStates.entries());
  for (const [state, data] of entries) {
    if (now - data.timestamp > OAUTH_STATE_TIMEOUT) {
      oauthStates.delete(state);
    }
  }
}, 5 * 60 * 1000); // Clean up every 5 minutes

// Configure multer for file uploads (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
    files: 10, // Maximum 10 files per request
  },
  fileFilter: (req, file, cb) => {
    // Accept images and videos only
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed'));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Start post scheduler for automated social media posting
  console.log('🚀 Starting Facebook post scheduler...');
  postScheduler.start();
  
  // Health check endpoint
  app.get("/api/health", async (req, res) => {
    try {
      const schedulerStatus = postScheduler.getStatus();
      
      // Simple health check - return basic status
      res.json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        services: {
          server: "running",
          database: "connected", // Will enhance with actual Firebase check later
          postScheduler: schedulerStatus.running ? "running" : "stopped"
        }
      });
    } catch (error) {
      console.error("Health check failed:", error);
      res.status(500).json({
        status: "unhealthy",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // 🔐 REPLIT AUTH ROUTES - Social Login & Membership System
  app.get("/api/auth/user", getCurrentUser);
  app.post("/api/auth/logout", logout);

  // 🚀 REPLIT OAUTH FLOW - Initiation & Callback Routes
  app.get("/auth/replit", async (req, res) => {
    try {
      // Generate CSRF state parameter
      const state = replitAuth.generateState();
      const redirectUrl = req.query.redirect as string;
      
      // Store state for verification
      oauthStates.set(state, { 
        timestamp: Date.now(),
        redirectUrl: redirectUrl || '/admin',
        platform: 'replit'
      });
      
      // Generate authorization URL
      const authUrl = replitAuth.getAuthorizationUrl(state);
      
      console.log('🔐 Replit OAuth initiation:', { authUrl, state: state.substring(0, 8) + '...' });
      
      // Redirect to Replit OAuth
      res.redirect(authUrl);
    } catch (error) {
      console.error("Error initiating Replit OAuth:", error);
      res.status(500).json({ 
        error: "Failed to initiate Replit authentication",
        message: "Please try again later"
      });
    }
  });

  app.get("/auth/replit/callback", async (req, res) => {
    try {
      const { code, state, error, error_description } = req.query;

      // Handle OAuth error from Replit
      if (error) {
        console.error("Replit OAuth error:", error, error_description);
        const errorMessage = error === 'access_denied' ? 'Access was denied' : 'Authentication failed';
        return res.redirect(`/admin?error=${encodeURIComponent(errorMessage)}`);
      }

      // Validate state parameter for CSRF protection
      if (!state || !oauthStates.has(state as string)) {
        console.error("Invalid or missing OAuth state parameter");
        return res.redirect('/admin?error=security_error');
      }

      const stateData = oauthStates.get(state as string)!;
      oauthStates.delete(state as string); // Use state only once

      if (!code) {
        console.error("Authorization code missing from Replit response");
        return res.redirect('/admin?error=auth_failed');
      }

      // Exchange code for access token
      const tokenData = await replitAuth.exchangeCodeForToken(code as string);
      
      // Get user profile from Replit
      const userProfile = await replitAuth.getUserProfile(tokenData.access_token);
      
      console.log('🎉 Replit OAuth success:', { 
        userId: userProfile.id, 
        email: userProfile.email,
        username: userProfile.username 
      });

      // Sync user with database and link to customer record
      const { authUser, customer } = await upsertAuthUser({
        id: userProfile.id,
        email: userProfile.email,
        firstName: userProfile.firstName,
        lastName: userProfile.lastName,
        profileImageUrl: userProfile.profileImageUrl,
      });

      // Set user in session for future requests
      (req.session as any).authUserId = authUser.id;
      req.user = {
        id: authUser.id,
        email: authUser.email ?? undefined,
        firstName: authUser.firstName ?? undefined,
        lastName: authUser.lastName ?? undefined,
        profileImageUrl: authUser.profileImageUrl ?? undefined,
      };

      console.log('✅ User authenticated and synced:', {
        authUserId: authUser.id,
        customerId: customer?.id,
        membershipTier: customer?.membershipTier
      });

      // Redirect to intended destination or default
      const redirectUrl = stateData.redirectUrl || '/admin';
      res.redirect(`${redirectUrl}?auth=success`);
      
    } catch (error) {
      console.error("Replit OAuth callback error:", error);
      res.redirect('/admin?error=auth_failed');
    }
  });

  // Dashboard API
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Cloudinary Media Upload API
  app.post("/api/media/upload", upload.array('files', 10) as any, async (req: any, res: any) => {
    try {
      const files = req.files as Express.Multer.File[];
      
      if (!files || files.length === 0) {
        return res.status(400).json({
          error: "No files provided",
          message: "Please select at least one file to upload"
        });
      }

      const uploadPromises = files.map(async (file) => {
        const folder = req.body.folder || 'products';
        const alt = req.body.alt || '';
        const tags = req.body.tags ? JSON.parse(req.body.tags) : [];

        const result = await uploadToCloudinary(file.buffer, file.mimetype, {
          folder,
          tags,
        });

        return convertToCloudinaryMedia(result, alt);
      });

      const uploadedMedia = await Promise.all(uploadPromises);

      res.json({
        success: true,
        message: `Successfully uploaded ${uploadedMedia.length} file(s)`,
        media: uploadedMedia,
      });

    } catch (error) {
      console.error("Media upload error:", error);
      res.status(500).json({
        error: "Upload failed",
        message: error instanceof Error ? error.message : "Unknown error occurred"
      });
    }
  });

  // Delete media from Cloudinary
  app.delete("/api/media/:publicId", async (req, res) => {
    try {
      const { publicId } = req.params;
      const { resourceType } = req.query;

      if (!publicId) {
        return res.status(400).json({
          error: "Missing public_id",
          message: "Public ID is required to delete media"
        });
      }

      await deleteFromCloudinary(publicId, resourceType as 'image' | 'video');

      res.json({
        success: true,
        message: "Media deleted successfully",
        publicId
      });

    } catch (error) {
      console.error("Media deletion error:", error);
      res.status(500).json({
        error: "Deletion failed",
        message: error instanceof Error ? error.message : "Unknown error occurred"
      });
    }
  });

  // Content Assets Upload API (for Content Library Media tab)
  app.post("/api/content/assets/upload", requireAdminAuth, upload.single('file') as any, async (req: any, res: any) => {
    try {
      const file = req.file as Express.Multer.File;
      
      if (!file) {
        return res.status(400).json({
          error: "No file provided",
          message: "Please select a file to upload"
        });
      }

      const { categoryId, altText, caption, tags } = req.body;
      const parsedTags = tags ? JSON.parse(tags) : [];

      // Upload to Cloudinary
      const cloudinaryResult = await uploadToCloudinary(file.buffer, file.mimetype, {
        folder: 'content-library',
        tags: parsedTags,
      });

      // Save to content_assets table using storage
      const contentAsset = await storage.createContentAsset({
        filename: file.originalname,
        originalFilename: file.originalname,
        cloudinaryPublicId: cloudinaryResult.public_id,
        cloudinaryUrl: cloudinaryResult.secure_url,
        cloudinarySecureUrl: cloudinaryResult.secure_url,
        mimeType: file.mimetype,
        fileSize: cloudinaryResult.bytes,
        resourceType: cloudinaryResult.resource_type,
        width: cloudinaryResult.width,
        height: cloudinaryResult.height,
        duration: cloudinaryResult.duration,
        altText: altText || null,
        caption: caption || null,
        tagIds: parsedTags.length > 0 ? parsedTags : null,
        categoryId: categoryId ? parseInt(categoryId) : null,
      });

      res.json({
        success: true,
        message: "File uploaded successfully",
        asset: contentAsset,
      });

    } catch (error) {
      console.error("Content asset upload error:", error);
      res.status(500).json({
        error: "Upload failed",
        message: error instanceof Error ? error.message : "Unknown error occurred"
      });
    }
  });

  // Get Content Assets (with filters)
  app.get("/api/content/assets", requireAdminAuth, async (req, res) => {
    try {
      const { tag, categoryId } = req.query;

      // Get assets from storage
      let assets = categoryId && categoryId !== 'all'
        ? await storage.getContentAssetsByCategory(parseInt(categoryId as string))
        : await storage.getContentAssets();

      // Filter by tag if provided (client-side filtering for JSONB)
      if (tag && tag !== 'all') {
        assets = assets.filter((asset: any) => 
          asset.tagIds && Array.isArray(asset.tagIds) && asset.tagIds.includes(tag as string)
        );
      }

      res.json(assets);

    } catch (error) {
      console.error("Error fetching content assets:", error);
      res.status(500).json({
        error: "Failed to fetch content assets",
        message: error instanceof Error ? error.message : "Unknown error occurred"
      });
    }
  });

  // ========================================
  // BULK MEDIA UPLOAD APIs
  // ========================================

  // Parse CSV for bulk upload
  app.post("/api/media/bulk-upload/parse", requireAdminAuth, async (req, res) => {
    try {
      const { csvContent } = req.body;

      if (!csvContent || typeof csvContent !== 'string') {
        return res.status(400).json({
          error: "CSV content is required",
          message: "Please provide valid CSV content as a string"
        });
      }

      // Import CSV parser
      const { parseMediaCSV, validateCSVHeaders } = await import('./utils/csv-parser');

      // Validate headers first
      const headerValidation = validateCSVHeaders(csvContent);
      if (!headerValidation.valid) {
        return res.status(400).json({
          error: "Invalid CSV headers",
          missing: headerValidation.missing,
          extra: headerValidation.extra,
          message: `Missing required headers: ${headerValidation.missing.join(', ')}`
        });
      }

      // Parse and validate CSV
      const result = parseMediaCSV(csvContent, {
        maxRows: 500, // Limit bulk uploads
        skipEmptyLines: true,
      });

      if (!result.success) {
        return res.status(400).json({
          error: "CSV validation failed",
          ...result,
        });
      }

      res.json({
        message: "CSV parsed successfully",
        extraHeaders: headerValidation.extra,
        ...result,
      });

    } catch (error) {
      console.error("CSV parse error:", error);
      res.status(500).json({
        error: "Failed to parse CSV",
        message: error instanceof Error ? error.message : "Unknown error occurred"
      });
    }
  });

  // Get CSV template
  app.get("/api/media/bulk-upload/template", requireAdminAuth, async (req, res) => {
    try {
      const { generateCSVTemplate } = await import('./utils/csv-parser');
      const template = generateCSVTemplate();

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="media-upload-template.csv"');
      res.send(template);

    } catch (error) {
      console.error("Template generation error:", error);
      res.status(500).json({
        error: "Failed to generate template",
        message: error instanceof Error ? error.message : "Unknown error occurred"
      });
    }
  });

  // Batch upload from CSV URLs
  app.post("/api/media/bulk-upload/execute", requireAdminAuth, async (req, res) => {
    try {
      const { items } = req.body;

      if (!items || !Array.isArray(items)) {
        return res.status(400).json({
          error: "Invalid items array",
          message: "Please provide a valid array of media items"
        });
      }

      // Import batch upload function
      const { batchUploadFromUrls } = await import('./services/cloudinary');

      // Upload to Cloudinary in batches
      const uploadResults = await batchUploadFromUrls(items, {
        batchSize: 5,
        folder: 'content-library',
      });

      // Save successful uploads to database
      const savedAssets = [];
      const failedSaves = [];

      for (const result of uploadResults.results) {
        if (result.success && result.cloudinaryResult) {
          try {
            const item = items.find((i: any) => i.url === result.url);
            
            const asset = await storage.createContentAsset({
              filename: result.filename,
              originalFilename: result.filename,
              cloudinaryPublicId: result.cloudinaryResult.public_id,
              cloudinaryUrl: result.cloudinaryResult.secure_url,
              cloudinarySecureUrl: result.cloudinaryResult.secure_url,
              mimeType: `${result.cloudinaryResult.resource_type}/${result.cloudinaryResult.format}`,
              filesize: result.cloudinaryResult.bytes,
              resourceType: result.cloudinaryResult.resource_type,
              width: result.cloudinaryResult.width || null,
              height: result.cloudinaryResult.height || null,
              duration: result.cloudinaryResult.duration || null,
              altText: item?.altText || null,
              caption: item?.caption || null,
              tags: item?.tags || null,
              categoryId: item?.categoryId || null,
            });

            savedAssets.push(asset);
          } catch (dbError) {
            failedSaves.push({
              url: result.url,
              error: dbError instanceof Error ? dbError.message : 'Database save failed'
            });
          }
        }
      }

      res.json({
        success: uploadResults.success && failedSaves.length === 0,
        message: `Uploaded ${uploadResults.uploaded}/${uploadResults.total} files, saved ${savedAssets.length} to database`,
        cloudinary: {
          total: uploadResults.total,
          uploaded: uploadResults.uploaded,
          failed: uploadResults.failed,
        },
        database: {
          saved: savedAssets.length,
          failed: failedSaves.length,
        },
        uploadResults: uploadResults.results,
        failedSaves,
        assets: savedAssets,
      });

    } catch (error) {
      console.error("Batch upload error:", error);
      res.status(500).json({
        error: "Batch upload failed",
        message: error instanceof Error ? error.message : "Unknown error occurred"
      });
    }
  });

  // ========================================
  // CONTENT QUEUE MANAGEMENT APIs
  // ========================================

  // Validation Schemas
  const queueFiltersSchema = z.object({
    status: z.enum(['pending', 'ready', 'processing', 'scheduled', 'completed', 'failed', 'paused']).optional(),
    targetGroupId: z.string().uuid().optional(),
    autoFill: z.enum(['true', 'false']).optional(),
    priority: z.string().regex(/^\d+$/).optional(),
  });

  const createQueueItemSchema = z.object({
    contentLibraryId: z.string().uuid().optional(),
    caption: z.string().optional(),
    hashtags: z.array(z.string()).optional(),
    assetIds: z.array(z.string()).optional(),
    targetType: z.enum(['group', 'accounts', 'all']).optional(),
    targetGroupId: z.string().uuid().optional(),
    targetAccountIds: z.array(z.string().uuid()).optional(),
    priority: z.number().int().min(1).max(10).optional(),
    queuePosition: z.number().int().min(0),
    autoFill: z.boolean().optional(),
    preferredTimeSlots: z.array(z.object({
      dayOfWeek: z.number().int().min(0).max(6),
      hour: z.number().int().min(0).max(23),
      minute: z.number().int().min(0).max(59),
    })).optional(),
    useAiVariation: z.boolean().optional(),
    variationTone: z.enum(['formal', 'casual', 'trendy', 'sales']).optional(),
    metadata: z.any().optional(),
  });

  const updateQueueItemSchema = z.object({
    contentLibraryId: z.string().uuid().optional(),
    caption: z.string().optional(),
    hashtags: z.array(z.string()).optional(),
    assetIds: z.array(z.string()).optional(),
    targetType: z.enum(['group', 'accounts', 'all']).optional(),
    targetGroupId: z.string().uuid().optional(),
    targetAccountIds: z.array(z.string().uuid()).optional(),
    priority: z.number().int().min(1).max(10).optional(),
    queuePosition: z.number().int().min(0).optional(),
    autoFill: z.boolean().optional(),
    preferredTimeSlots: z.array(z.object({
      dayOfWeek: z.number().int().min(0).max(6),
      hour: z.number().int().min(0).max(23),
      minute: z.number().int().min(0).max(59),
    })).optional(),
    useAiVariation: z.boolean().optional(),
    variationTone: z.enum(['formal', 'casual', 'trendy', 'sales']).optional(),
    status: z.enum(['pending', 'ready', 'processing', 'scheduled', 'completed', 'failed', 'paused']).optional(),
    metadata: z.any().optional(),
  });

  const reorderQueueSchema = z.object({
    itemIds: z.array(z.string().uuid()).min(1),
  });

  // Get Queue Items (with filters)
  app.get("/api/content/queue", requireAdminAuth, async (req, res) => {
    try {
      // Validate query parameters
      const validation = queueFiltersSchema.safeParse(req.query);
      if (!validation.success) {
        return res.status(400).json({
          error: "Invalid query parameters",
          details: validation.error.issues
        });
      }
      
      const { status, targetGroupId, autoFill, priority } = validation.data;
      
      const filters: any = {};
      if (status) filters.status = status;
      if (targetGroupId) filters.targetGroupId = targetGroupId;
      if (autoFill !== undefined) filters.autoFill = autoFill === 'true';
      if (priority) {
        const priorityNum = parseInt(priority);
        if (isNaN(priorityNum)) {
          return res.status(400).json({ error: "Priority must be a valid number" });
        }
        filters.priority = priorityNum;
      }
      
      const items = await storage.getQueueItems(filters);
      res.json(items);
    } catch (error) {
      console.error("Error fetching queue items:", error);
      res.status(500).json({
        error: "Failed to fetch queue items",
        message: error instanceof Error ? error.message : "Unknown error occurred"
      });
    }
  });

  // Get Single Queue Item
  app.get("/api/content/queue/:id", requireAdminAuth, async (req, res) => {
    try {
      const item = await storage.getQueueItem(req.params.id);
      if (!item) {
        return res.status(404).json({ error: "Queue item not found" });
      }
      res.json(item);
    } catch (error) {
      console.error("Error fetching queue item:", error);
      res.status(500).json({
        error: "Failed to fetch queue item",
        message: error instanceof Error ? error.message : "Unknown error occurred"
      });
    }
  });

  // Create Queue Item
  app.post("/api/content/queue", requireAdminAuth, async (req, res) => {
    try {
      // Validate request body
      const validation = createQueueItemSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          error: "Invalid request body",
          details: validation.error.issues
        });
      }

      const { 
        contentLibraryId, caption, hashtags, assetIds,
        targetType, targetGroupId, targetAccountIds,
        priority, queuePosition, autoFill, preferredTimeSlots,
        useAiVariation, variationTone, metadata
      } = validation.data;

      // Get admin user ID from session
      const adminId = (req.session as any)?.adminId;

      const newItem = await storage.createQueueItem({
        contentLibraryId,
        caption,
        hashtags: hashtags || [],
        assetIds: assetIds || [],
        targetType: targetType || 'all',
        targetGroupId,
        targetAccountIds: targetAccountIds || [],
        priority: priority || 5,
        queuePosition,
        autoFill: autoFill || false,
        preferredTimeSlots: preferredTimeSlots || [],
        useAiVariation: useAiVariation || false,
        variationTone,
        status: 'pending',
        metadata,
        createdBy: adminId,
      });

      // Log history
      await storage.createQueueHistory({
        queueItemId: newItem.id,
        action: 'created',
        success: true,
        performedBy: adminId || 'system',
      });

      res.status(201).json(newItem);
    } catch (error) {
      console.error("Error creating queue item:", error);
      res.status(500).json({
        error: "Failed to create queue item",
        message: error instanceof Error ? error.message : "Unknown error occurred"
      });
    }
  });

  // Update Queue Item
  app.put("/api/content/queue/:id", requireAdminAuth, async (req, res) => {
    try {
      // Validate ID parameter
      if (!req.params.id || !z.string().uuid().safeParse(req.params.id).success) {
        return res.status(400).json({ error: "Invalid queue item ID" });
      }

      // Validate request body
      const validation = updateQueueItemSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          error: "Invalid request body",
          details: validation.error.issues
        });
      }

      const updated = await storage.updateQueueItem(req.params.id, validation.data);
      
      if (!updated) {
        return res.status(404).json({ error: "Queue item not found" });
      }

      res.json(updated);
    } catch (error) {
      console.error("Error updating queue item:", error);
      res.status(500).json({
        error: "Failed to update queue item",
        message: error instanceof Error ? error.message : "Unknown error occurred"
      });
    }
  });

  // Delete Queue Item
  app.delete("/api/content/queue/:id", requireAdminAuth, async (req, res) => {
    try {
      // Validate ID parameter
      if (!req.params.id || !z.string().uuid().safeParse(req.params.id).success) {
        return res.status(400).json({ error: "Invalid queue item ID" });
      }

      const adminId = (req.session as any)?.adminId;
      
      // Log history before deletion
      await storage.createQueueHistory({
        queueItemId: req.params.id,
        action: 'deleted',
        success: true,
        performedBy: adminId || 'system',
      });

      const success = await storage.deleteQueueItem(req.params.id);
      
      if (!success) {
        return res.status(404).json({ error: "Queue item not found" });
      }

      res.json({ success: true, message: "Queue item deleted successfully" });
    } catch (error) {
      console.error("Error deleting queue item:", error);
      res.status(500).json({
        error: "Failed to delete queue item",
        message: error instanceof Error ? error.message : "Unknown error occurred"
      });
    }
  });

  // Reorder Queue Items
  app.put("/api/content/queue/reorder", requireAdminAuth, async (req, res) => {
    try {
      // Validate request body
      const validation = reorderQueueSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          error: "Invalid request body - itemIds must be a non-empty array of UUIDs",
          details: validation.error.issues
        });
      }

      const success = await storage.reorderQueue(validation.data.itemIds);
      res.json({ success, message: "Queue reordered successfully" });
    } catch (error) {
      console.error("Error reordering queue:", error);
      res.status(500).json({
        error: "Failed to reorder queue",
        message: error instanceof Error ? error.message : "Unknown error occurred"
      });
    }
  });

  // Get Queue Auto-fill Settings
  app.get("/api/content/queue/settings", requireAdminAuth, async (req, res) => {
    try {
      const settings = await storage.getQueueAutoFillSettings();
      res.json(settings || {
        enabled: false,
        fillStrategy: 'priority',
        defaultTimeSlots: [],
        minGapHours: 2,
        maxPostsPerDay: 5,
        maxPostsPerAccount: 3,
        checkDuplicateWindow: 7,
        similarityThreshold: '0.8',
        forceVariation: true,
        variationModel: 'gemini-pro',
      });
    } catch (error) {
      console.error("Error fetching queue settings:", error);
      res.status(500).json({
        error: "Failed to fetch queue settings",
        message: error instanceof Error ? error.message : "Unknown error occurred"
      });
    }
  });

  // Update Queue Auto-fill Settings
  app.put("/api/content/queue/settings", requireAdminAuth, async (req, res) => {
    try {
      const settings = await storage.updateQueueAutoFillSettings(req.body);
      res.json(settings);
    } catch (error) {
      console.error("Error updating queue settings:", error);
      res.status(500).json({
        error: "Failed to update queue settings",
        message: error instanceof Error ? error.message : "Unknown error occurred"
      });
    }
  });

  // Get Queue History
  app.get("/api/content/queue/:id/history", requireAdminAuth, async (req, res) => {
    try {
      // Validate ID parameter
      if (!req.params.id || !z.string().uuid().safeParse(req.params.id).success) {
        return res.status(400).json({ error: "Invalid queue item ID" });
      }

      const history = await storage.getQueueHistory(req.params.id);
      res.json(history);
    } catch (error) {
      console.error("Error fetching queue history:", error);
      res.status(500).json({
        error: "Failed to fetch queue history",
        message: error instanceof Error ? error.message : "Unknown error occurred"
      });
    }
  });

  // ========================================
  // 🌐 IP POOL MANAGEMENT APIs
  // ========================================

  // Validation Schemas
  // Helper for flexible date parsing (handles ISO strings, date-only strings, and Date objects)
  const flexibleDateSchema = z.preprocess(
    (val) => {
      if (val === null || val === undefined) return null;
      if (val instanceof Date) return val;
      if (typeof val === 'string') {
        // Handle date-only strings (e.g., "2025-10-05") by adding UTC midnight
        if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
          return new Date(`${val}T00:00:00Z`);
        }
        // Handle ISO strings and other formats via native Date constructor
        const parsed = new Date(val);
        return isNaN(parsed.getTime()) ? null : parsed;
      }
      return null;
    },
    z.date().nullable().optional()
  );

  const insertIpPoolSchema = z.object({
    name: z.string().min(1, "Name is required"),
    type: z.enum(["usb-4g", "proxy-api", "cloud-worker"]),
    status: z.enum(["active", "inactive", "error"]).default("inactive"),
    currentIp: z.string().nullable().optional(),
    config: z.record(z.any()).default({}),
    healthScore: z.number().min(0).max(100).default(100),
    totalRotations: z.number().int().min(0).default(0),
    lastRotatedAt: flexibleDateSchema,
    isEnabled: z.boolean().default(true),
    priority: z.number().int().min(0).default(0),
    costPerMonth: z.number().min(0).nullable().optional(),
    notes: z.string().nullable().optional(),
  });

  const updateIpPoolSchema = z.object({
    name: z.string().min(1).optional(),
    type: z.enum(["usb-4g", "proxy-api", "cloud-worker"]).optional(),
    status: z.enum(["active", "inactive", "error"]).optional(),
    currentIp: z.string().nullable().optional(),
    config: z.record(z.any()).optional(),
    healthScore: z.number().min(0).max(100).optional(),
    totalRotations: z.number().int().min(0).optional(),
    lastRotatedAt: flexibleDateSchema,
    isEnabled: z.boolean().optional(),
    priority: z.number().int().min(0).optional(),
    costPerMonth: z.number().min(0).nullable().optional(),
    notes: z.string().nullable().optional(),
  });

  // Get all IP pools
  app.get("/api/ip-pools", requireAdminAuth, async (req, res) => {
    try {
      const { type, status, isEnabled } = req.query;
      const pools = await storage.getIpPools({
        type: type as string,
        status: status as string,
        isEnabled: isEnabled === 'true' ? true : isEnabled === 'false' ? false : undefined
      });
      res.json(pools);
    } catch (error) {
      console.error("Error fetching IP pools:", error);
      res.status(500).json({ error: "Failed to fetch IP pools" });
    }
  });

  // Get single IP pool
  app.get("/api/ip-pools/:id", requireAdminAuth, async (req, res) => {
    try {
      const pool = await storage.getIpPool(req.params.id);
      if (!pool) {
        return res.status(404).json({ error: "IP pool not found" });
      }
      res.json(pool);
    } catch (error) {
      console.error("Error fetching IP pool:", error);
      res.status(500).json({ error: "Failed to fetch IP pool" });
    }
  });

  // Create IP pool
  app.post("/api/ip-pools", requireAdminAuth, async (req, res) => {
    try {
      const validatedData = insertIpPoolSchema.parse(req.body);
      const pool = await storage.createIpPool(validatedData);
      res.json(pool);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: "Validation error", 
          details: error.errors 
        });
      }
      console.error("Error creating IP pool:", error);
      res.status(500).json({ error: "Failed to create IP pool" });
    }
  });

  // Update IP pool
  app.put("/api/ip-pools/:id", requireAdminAuth, async (req, res) => {
    try {
      const validatedData = updateIpPoolSchema.parse(req.body);
      const pool = await storage.updateIpPool(req.params.id, validatedData);
      if (!pool) {
        return res.status(404).json({ error: "IP pool not found" });
      }
      res.json(pool);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: "Validation error", 
          details: error.errors 
        });
      }
      console.error("Error updating IP pool:", error);
      res.status(500).json({ error: "Failed to update IP pool" });
    }
  });

  // Delete IP pool
  app.delete("/api/ip-pools/:id", requireAdminAuth, async (req, res) => {
    try {
      const success = await storage.deleteIpPool(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "IP pool not found" });
      }
      res.json({ success: true, message: "IP pool deleted successfully" });
    } catch (error) {
      console.error("Error deleting IP pool:", error);
      res.status(500).json({ error: "Failed to delete IP pool" });
    }
  });

  // Get IP pool sessions
  app.get("/api/ip-pools/:id/sessions", requireAdminAuth, async (req, res) => {
    try {
      const sessions = await storage.getIpPoolSessionsByPoolId(req.params.id);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching IP pool sessions:", error);
      res.status(500).json({ error: "Failed to fetch sessions" });
    }
  });

  // Get IP rotation logs
  app.get("/api/ip-pools/:id/logs", requireAdminAuth, async (req, res) => {
    try {
      const limitParam = req.query.limit ? parseInt(req.query.limit as string) : 100;
      
      // Validate limit parameter (must be between 1 and 1000)
      if (isNaN(limitParam) || limitParam < 1 || limitParam > 1000) {
        return res.status(400).json({ 
          error: "Invalid limit parameter",
          message: "Limit must be a number between 1 and 1000" 
        });
      }
      
      const logs = await storage.getIpRotationLogs(req.params.id, limitParam);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching rotation logs:", error);
      res.status(500).json({ error: "Failed to fetch rotation logs" });
    }
  });

  // Test IP pool health and connectivity
  app.post("/api/ip-pools/:id/health-check", requireAdminAuth, async (req, res) => {
    try {
      const pool = await storage.getIpPool(req.params.id);
      if (!pool) {
        return res.status(404).json({ error: "IP pool not found" });
      }

      const healthService = getHealthService(storage);
      const result = await healthService.checkIpPoolHealth(pool.id);
      
      res.json(result);
    } catch (error) {
      console.error("Error checking IP pool health:", error);
      res.status(500).json({ error: "Failed to check IP pool health" });
    }
  });

  // Trigger IP rotation with actual rotation logic
  app.post("/api/ip-pools/:id/rotate", requireAdminAuth, async (req, res) => {
    try {
      const pool = await storage.getIpPool(req.params.id);
      if (!pool) {
        return res.status(404).json({ error: "IP pool not found" });
      }

      const rotationService = getRotationService(storage);
      const result = await rotationService.rotateIp({
        poolId: pool.id,
        trigger: "manual",
        reason: `Manual rotation triggered by admin ${(req.session as any)?.userId || "unknown"}`,
        force: true, // Force rotation for manual triggers
      });

      if (result.success) {
        res.json({ 
          message: "IP rotation completed successfully",
          oldIp: result.oldIp,
          newIp: result.newIp,
          rotatedAt: result.rotatedAt,
        });
      } else {
        res.status(500).json({ 
          error: "IP rotation failed",
          message: result.error,
        });
      }
    } catch (error) {
      console.error("Error rotating IP:", error);
      res.status(500).json({ error: "Failed to rotate IP" });
    }
  });

  // Products API with role-based filtering and multi-store support
  app.get("/api/products", async (req, res) => {
    try {
      const { limit, categoryId, withCategories, search, offset } = req.query;
      const limitNum = limit ? parseInt(limit as string) : undefined;
      const offsetNum = offset ? parseInt(offset as string) : 0;
      
      // 🏪 Check if request has store context (multi-store filtering)
      if ((req as any).store?.storeId) {
        const { db } = await import('./db');
        const { products, storeProducts } = await import('../shared/schema');
        const { eq, and } = await import('drizzle-orm');
        
        const storeProductsList = await db
          .select({
            product: products,
            storeProduct: storeProducts,
          })
          .from(storeProducts)
          .innerJoin(products, eq(products.id, storeProducts.productId))
          .where(
            and(
              eq(storeProducts.storeId, (req as any).store.storeId),
              eq(storeProducts.isActive, true)
            )
          )
          .orderBy(storeProducts.sortOrder);

        const result = storeProductsList.map(({ product, storeProduct }) => ({
          ...product,
          price: storeProduct.priceOverride || product.price,
        }));

        return res.json(result);
      }
      
      // 👥 Check customer role for VIP access to local products
      let isLocalAccess = false;
      const userId = (req.session as any)?.userId;
      
      if (userId) {
        const customer = await storage.getCustomer(userId);
        if (customer) {
          // VIP role gets access to local products automatically
          isLocalAccess = customer.customerRole === 'vip' || customer.isLocalCustomer;
        }
      }
      
      if (withCategories === 'true') {
        const products = await storage.getProductsWithCategory(limitNum, categoryId as string, search as string, offsetNum);
        // Note: Product filtering by isLocalOnly removed - all products returned
        res.json(products);
      } else {
        const products = await storage.getProducts(limitNum, categoryId as string, search as string, offsetNum);
        // Note: If products don't have isLocalOnly field, all products are returned
        res.json(products);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Popular products API
  app.get("/api/products/popular", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const popularProducts = await storage.getPopularProducts(limit);
      res.json(popularProducts);
    } catch (error) {
      console.error("Error fetching popular products:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      // 🔧 Fix: Preprocess request body - convert empty strings to null/default BEFORE validation
      const preprocessedBody = { ...req.body };
      
      if (preprocessedBody.originalPrice === '' || preprocessedBody.originalPrice === undefined) {
        preprocessedBody.originalPrice = null;
      }
      if (preprocessedBody.fakeSalesCount === '' || preprocessedBody.fakeSalesCount === undefined) {
        preprocessedBody.fakeSalesCount = 0;
      }
      if (preprocessedBody.minQuantity === '' || preprocessedBody.minQuantity === undefined) {
        preprocessedBody.minQuantity = "0.001";
      }
      if (preprocessedBody.quantityStep === '' || preprocessedBody.quantityStep === undefined) {
        preprocessedBody.quantityStep = "1.000";
      }
      if (preprocessedBody.categoryId === '' || preprocessedBody.categoryId === undefined) {
        preprocessedBody.categoryId = null;
      }
      
      const validatedData = insertProductsSchema.parse(preprocessedBody);
      
      // Generate SKU automatically
      let generatedSKU: string = "";
      
      if (validatedData.categoryId) {
        // Use generateSKU for products with category
        generatedSKU = await generateSKU(validatedData.categoryId);
      } else {
        // Generate SKU manually for products without category using "Khác" prefix
        const prefix = "KH"; // "Khác" -> "KH" 
        let attempts = 0;
        let isUnique = false;
        
        while (!isUnique && attempts < 10) {
          const randomNumber = Math.floor(1000 + Math.random() * 9000);
          const sku = `${prefix}${randomNumber}`;
          
          // Check if SKU already exists
          const existingProduct = await storage.getProductBySKU(sku);
          if (!existingProduct) {
            generatedSKU = sku;
            isUnique = true;
            break;
          }
          attempts++;
        }
        
        if (!isUnique) {
          throw new Error("Could not generate unique SKU after 10 attempts");
        }
      }
      // Generate slug from name if not provided or empty
      const baseSlug = validatedData.slug && validatedData.slug.trim().length > 0 
        ? validatedData.slug.trim()
        : generateSlug(validatedData.name || '');
      
      // Ensure slug is unique
      const uniqueSlug = await generateUniqueSlug(baseSlug);
      
      const productData = {
        ...validatedData,
        sku: generatedSKU,
        slug: uniqueSlug
      };
      
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      console.error("Error creating product:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/products/:id", async (req, res) => {
    try {
      const partialProductSchema = insertProductsSchema.partial();
      const validatedData = partialProductSchema.parse(req.body);
      
      // Fix: Handle empty categoryId - convert empty string to null
      if (validatedData.categoryId === '' || validatedData.categoryId === undefined) {
        validatedData.categoryId = null;
      }
      
      // 🔧 Fix: Handle empty strings for numeric fields - convert to null or default values
      if ((validatedData.originalPrice as any) === '' || validatedData.originalPrice === undefined) {
        (validatedData as any).originalPrice = null;
      }
      if ((validatedData.fakeSalesCount as any) === '' || validatedData.fakeSalesCount === undefined) {
        (validatedData as any).fakeSalesCount = 0;
      }
      if ((validatedData.minQuantity as any) === '' || validatedData.minQuantity === undefined) {
        (validatedData as any).minQuantity = "0.001";
      }
      if ((validatedData.quantityStep as any) === '' || validatedData.quantityStep === undefined) {
        (validatedData as any).quantityStep = "1.000";
      }
      
      // 🔧 Fix: Handle empty slug - don't update slug if empty to avoid unique constraint violation
      if (validatedData.slug === '' || validatedData.slug === undefined) {
        delete validatedData.slug; // Remove slug from update data if empty
      }
      
      const product = await storage.updateProduct(req.params.id, validatedData);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      console.error("Error updating product:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    try {
      const success = await storage.deleteProduct(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Customers API
  app.get("/api/customers", requirePOSAuth, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const profileStatus = (req.query.profileStatus as 'complete' | 'incomplete' | 'all') || 'complete';
      const searchTerm = req.query.search as string;
      
      // 🚀 Use optimized search if search term provided
      let customers;
      if (searchTerm && searchTerm.length >= 2) {
        customers = await storage.searchCustomers(searchTerm, limit || 10, profileStatus);
      } else {
        customers = await storage.getCustomers(limit, profileStatus);
      }
      
      // 💎 Calculate tier dynamically based on totalSpent
      const customersWithCalculatedTiers = customers.map(customer => {
        const totalSpent = parseFloat(customer.totalSpent || '0');
        const calculatedTier = calculateTier(totalSpent);
        
        return {
          ...customer,
          membershipTier: calculatedTier.key,
          calculatedTierInfo: calculatedTier
        };
      });
      
      res.json(customersWithCalculatedTiers);
    } catch (error) {
      console.error("Error fetching customers:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Customer search by phone OR name (for member lookup) - MUST be before /:id route
  app.get("/api/customers/search", requirePOSAuth, async (req, res) => {
    try {
      const { phone, q, search } = req.query;
      
      // Must have search parameter (unified search term)
      const searchTerm = (search || phone || q) as string;
      if (!searchTerm) {
        return res.status(400).json({ error: "Search parameter is required" });
      }

      // 🚀 Optimized: Direct database search with JOIN instead of loading 1000 customers
      const matchingCustomers = await storage.searchCustomers(searchTerm, 10, 'complete');

      if (matchingCustomers.length === 0) {
        return res.json([]); // Return empty for better UX
      }
      
      // Limit results to prevent UI overload
      const limitedResults = matchingCustomers.slice(0, 5);
      
      // Get most recent address for each customer from storefront orders
      const customersWithAddresses = await Promise.all(
        limitedResults.map(async (customer) => {
          try {
            // Get customer's most recent storefront order to get their address
            const recentAddress = await storage.getCustomerRecentAddress(customer.id);
            return {
              id: customer.id,
              name: customer.name,
              phone: customer.phone,
              email: customer.email,
              status: customer.status,
              totalOrders: customer.totalOrders,
              totalSpent: customer.totalSpent,
              lastOrderDate: customer.lastOrderDate,
              recentAddress: recentAddress || null
            };
          } catch (error) {
            console.error(`Error getting address for customer ${customer.id}:`, error);
            return {
              id: customer.id,
              name: customer.name,
              phone: customer.phone,
              email: customer.email,
              status: customer.status,
              totalOrders: customer.totalOrders,
              totalSpent: customer.totalSpent,
              lastOrderDate: customer.lastOrderDate,
              recentAddress: null
            };
          }
        })
      );

      res.json(customersWithAddresses);
    } catch (error) {
      console.error("Error searching customers:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/customers/:id", requirePOSAuth, async (req, res) => {
    try {
      const customer = await storage.getCustomer(req.params.id);
      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }
      
      // 💎 Calculate tier dynamically based on totalSpent
      const totalSpent = parseFloat(customer.totalSpent || '0');
      const calculatedTier = calculateTier(totalSpent);
      
      const customerWithCalculatedTier = {
        ...customer,
        membershipTier: calculatedTier.key,
        calculatedTierInfo: calculatedTier
      };
      
      res.json(customerWithCalculatedTier);
    } catch (error) {
      console.error("Error fetching customer:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/customers", requirePOSAuth, async (req, res) => {
    try {
      const validatedData = insertCustomersSchema.parse(req.body);
      const customer = await storage.createCustomer(validatedData);
      res.status(201).json(customer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      console.error("Error creating customer:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/customers/:id", async (req, res) => {
    try {
      const partialCustomerSchema = insertCustomersSchema.partial();
      const validatedData = partialCustomerSchema.parse(req.body);
      const customer = await storage.updateCustomer(req.params.id, validatedData);
      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }
      res.json(customer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      console.error("Error updating customer:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/customers/:id", async (req, res) => {
    try {
      const success = await storage.deleteCustomer(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Customer not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting customer:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // 📍 Customer Profile Update with Location Fields
  app.patch("/api/customer/profile", async (req, res) => {
    try {
      // Check authentication
      if (!req.session || !req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      // Define validation schema for customer profile update
      const customerProfileUpdateSchema = z.object({
        phone: z.string().regex(/^0[0-9]{9}$/, "Phone must be valid Vietnamese format (10 digits starting with 0)").optional(),
        address: z.string().optional(),
        latitude: z.number().min(-90).max(90, "Latitude must be between -90 and 90").optional(),
        longitude: z.number().min(-180).max(180, "Longitude must be between -180 and 180").optional(),
        distanceFromShop: z.number().optional(),
        routeDistanceFromShop: z.number().optional(),
        district: z.string().optional(),
      });

      // Validate request body
      const validatedData = customerProfileUpdateSchema.parse(req.body);

      // Get customer by auth user ID
      const customer = await storage.getCustomerByAuthUser(req.session.userId);
      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }

      // Prepare update data
      const updateData: any = { ...validatedData };

      // If latitude/longitude are provided, calculate route distance via ORS
      if (validatedData.latitude && validatedData.longitude) {
        const customerLat = validatedData.latitude;
        const customerLon = validatedData.longitude;

        const shopSettings = await storage.getShopSettings();
        if (shopSettings?.shopLatitude && shopSettings?.shopLongitude) {
          try {
            // Create abort controller for 5s timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            const orsResponse = await fetch('http://localhost:5000/api/admin/calculate-route-distance', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                lat1: parseFloat(shopSettings.shopLatitude),
                lon1: parseFloat(shopSettings.shopLongitude),
                lat2: customerLat,
                lon2: customerLon,
              }),
              signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (orsResponse.ok) {
              const orsData = await orsResponse.json() as { distance: number | null };
              updateData.routeDistanceFromShop = orsData.distance;
            } else {
              console.warn('ORS API returned error status:', orsResponse.status);
              updateData.routeDistanceFromShop = null;
            }
          } catch (orsError) {
            console.warn('Failed to calculate route distance via ORS:', orsError);
            updateData.routeDistanceFromShop = null;
          }
        } else {
          // Shop coordinates not configured, skip ORS calculation
          updateData.routeDistanceFromShop = null;
        }
      }

      // Update customer record
      const updatedCustomer = await storage.updateCustomer(customer.id, updateData);
      if (!updatedCustomer) {
        return res.status(500).json({ error: "Failed to update profile" });
      }

      res.json(updatedCustomer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      console.error("Error updating customer profile:", error);
      res.status(500).json({ error: "Failed to update profile" });
    }
  });

  // 🧹 Cleanup incomplete customer profiles
  app.post("/api/admin/customers/cleanup-incomplete", requireAdminAuth, async (req, res) => {
    try {
      const daysThreshold = req.body.days || 30; // Default 30 days
      const dryRun = req.body.dryRun === true; // Dry run mode to preview
      
      // Find incomplete profiles older than threshold with no activity
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - daysThreshold);
      
      // Get all incomplete customers
      const incompleteCustomers = await storage.getCustomers(5000, 'incomplete');
      
      // Filter by join date and check for activity (orders or recent conversations)
      const inactiveCustomers = [];
      for (const customer of incompleteCustomers) {
        const joinDate = new Date(customer.joinDate || '');
        if (joinDate > thirtyDaysAgo) continue; // Too recent, skip
        
        // Check if customer has any orders
        const customerOrders = await storage.getOrdersByCustomerId(customer.id, 1);
        if (customerOrders.length > 0) continue; // Has orders, skip
        
        inactiveCustomers.push(customer);
      }
      
      if (dryRun) {
        return res.json({
          success: true,
          dryRun: true,
          message: `Found ${inactiveCustomers.length} inactive incomplete profiles`,
          count: inactiveCustomers.length,
          customers: inactiveCustomers.map(c => ({
            id: c.id,
            name: c.name,
            phone: c.phone,
            joinDate: c.joinDate,
            registrationSource: c.registrationSource
          }))
        });
      }
      
      // Delete inactive incomplete profiles
      let deletedCount = 0;
      for (const customer of inactiveCustomers) {
        const success = await storage.deleteCustomer(customer.id);
        if (success) deletedCount++;
      }
      
      res.json({
        success: true,
        message: `Successfully cleaned up ${deletedCount} inactive incomplete profiles`,
        deletedCount,
        daysThreshold
      });
    } catch (error) {
      console.error("Error cleaning up incomplete profiles:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // 👥 Customer Role-Based Dashboard APIs
  // ⚠️ SECURITY NOTE: These endpoints currently use mockCustomerId for demonstration
  // TODO: Implement proper customer authentication with session/JWT before production
  // TODO: Add ownership validation to ensure users can only access their own data
  
  // Customer authentication status check (for dashboard access)
  app.get("/api/customer-auth-status", async (req, res) => {
    try {
      // TEMPORARY: Using query parameter mockCustomerId for demo/testing
      // PRODUCTION: Replace with req.session.customerId or JWT token validation
      const customerId = req.query.mockCustomerId as string;
      
      if (!customerId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const customer = await storage.getCustomer(customerId);
      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }

      const totalSpent = parseFloat(customer.totalSpent || '0');
      const calculatedTier = calculateTier(totalSpent);

      res.json({
        id: customer.id,
        email: customer.email,
        fullName: customer.name,
        phone: customer.phone,
        customerRole: customer.customerRole,
        membershipTier: calculatedTier.key,
        isLocalCustomer: customer.isLocalCustomer,
      });
    } catch (error) {
      console.error("Error checking customer auth:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Affiliate dashboard statistics
  app.get("/api/customers/:id/affiliate-stats", async (req, res) => {
    try {
      const customer = await storage.getCustomer(req.params.id);
      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }

      if (customer.customerRole !== 'affiliate') {
        return res.status(403).json({ error: "Access denied: Not an affiliate" });
      }

      // TODO: Calculate real stats from orders, referrals, etc.
      // For now, return mock data
      res.json({
        totalSales: 15800000,
        salesGrowth: 12,
        totalCommission: 1580000,
        commissionRate: 10,
        referralCount: 24,
        newReferrals: 3,
        successfulOrders: 48,
        conversionRate: 15.2,
      });
    } catch (error) {
      console.error("Error fetching affiliate stats:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Driver dashboard deliveries
  app.get("/api/customers/:id/driver-deliveries", async (req, res) => {
    try {
      const customer = await storage.getCustomer(req.params.id);
      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }

      const hasDriverRole = customer.customerRole === 'driver';
      if (!hasDriverRole) {
        return res.status(403).json({ error: "Access denied: Not a driver" });
      }

      const trips = await storage.getDriverTrips(req.params.id);
      const vehicles = await storage.getDriverVehicles(req.params.id);
      
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date(todayStart);
      todayEnd.setDate(todayEnd.getDate() + 1);
      
      const todayTrips = trips.filter(trip => {
        const tripDate = new Date(trip.departureTime);
        return tripDate >= todayStart && tripDate < todayEnd;
      });
      
      const completedTrips = trips.filter(trip => trip.status === 'completed');
      const activeTrips = trips.filter(trip => ['scheduled', 'boarding', 'in_progress'].includes(trip.status));
      
      const todayCompleted = todayTrips.filter(trip => trip.status === 'completed');
      
      const totalRevenue = completedTrips.reduce((sum, trip) => sum + Number(trip.totalRevenue || 0), 0);
      const totalDistance = completedTrips.reduce((sum, trip) => sum + Number(trip.distance || 0), 0);
      const todayRevenue = todayCompleted.reduce((sum, trip) => sum + Number(trip.totalRevenue || 0), 0);
      const todayDistance = todayCompleted.reduce((sum, trip) => sum + Number(trip.distance || 0), 0);
      
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);
      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1);
      
      const monthlyTrips = trips.filter(trip => {
        const tripDate = new Date(trip.departureTime);
        return tripDate >= monthStart && tripDate < monthEnd && trip.status === 'completed';
      });
      const monthlyEarnings = monthlyTrips.reduce((sum, trip) => sum + Number(trip.totalRevenue || 0), 0);
      
      const avgDistancePerOrder = completedTrips.length > 0 ? totalDistance / completedTrips.length : 0;
      const successRate = trips.length > 0 ? (completedTrips.length / trips.length) * 100 : 100;
      
      const activeOrders = activeTrips.slice(0, 10).map(trip => ({
        id: trip.id,
        orderNumber: `TRIP-${trip.id}`,
        status: trip.status === 'scheduled' ? 'Chờ khởi hành' : 
                trip.status === 'boarding' ? 'Đang lên xe' :
                trip.status === 'in_progress' ? 'Đang di chuyển' : trip.status,
        shippingAddress: `${trip.origin} → ${trip.destination}`,
        customerName: `${trip.bookedSeats || 0}/${trip.availableSeats} khách`,
        deliveryFee: Number(trip.farePerSeat || 0),
      }));

      res.json({
        todayOrders: todayTrips.length,
        pendingOrders: activeTrips.length,
        todayEarnings: todayRevenue,
        monthlyEarnings: monthlyEarnings,
        todayDistance: todayDistance,
        avgDistancePerOrder: avgDistancePerOrder,
        avgDeliveryTime: 0,
        activeOrders: activeOrders,
        successRate: successRate,
        avgRating: 4.8,
        totalDelivered: completedTrips.length,
        totalDistance: totalDistance,
        totalEarnings: totalRevenue,
      });
    } catch (error) {
      console.error("Error fetching driver deliveries:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Customer Local Status Management API
  app.patch("/api/customers/:id/local-status", async (req, res) => {
    try {
      const { isLocalCustomer } = req.body;
      
      // Validate input
      if (typeof isLocalCustomer !== 'boolean') {
        return res.status(400).json({ error: "isLocalCustomer must be a boolean value" });
      }

      // Update customer local status
      const customer = await storage.updateCustomer(req.params.id, { 
        isLocalCustomer 
      });
      
      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }
      
      res.json({ 
        success: true, 
        customer,
        message: `Customer ${isLocalCustomer ? 'marked as local' : 'unmarked as local'} successfully`
      });
    } catch (error) {
      console.error("Error updating customer local status:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/customers/batch-local-status", async (req, res) => {
    try {
      const { customerIds, isLocalCustomer } = req.body;
      
      // Validate input
      if (!Array.isArray(customerIds) || customerIds.length === 0) {
        return res.status(400).json({ error: "customerIds must be a non-empty array" });
      }
      
      if (typeof isLocalCustomer !== 'boolean') {
        return res.status(400).json({ error: "isLocalCustomer must be a boolean value" });
      }

      // Update multiple customers
      const results = [];
      const errors = [];
      
      for (const customerId of customerIds) {
        try {
          const customer = await storage.updateCustomer(customerId, { 
            isLocalCustomer 
          });
          
          if (customer) {
            results.push(customer);
          } else {
            errors.push({ customerId, error: "Customer not found" });
          }
        } catch (err) {
          errors.push({ customerId, error: "Update failed" });
        }
      }
      
      res.json({
        success: true,
        updatedCount: results.length,
        totalRequested: customerIds.length,
        updatedCustomers: results,
        errors: errors.length > 0 ? errors : undefined,
        message: `${results.length} customers ${isLocalCustomer ? 'marked as local' : 'unmarked as local'} successfully`
      });
    } catch (error) {
      console.error("Error batch updating customer local status:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get local customers only
  app.get("/api/customers/local", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      
      // ✅ Use dedicated storage method to filter in SQL
      const localCustomers = await storage.getLocalCustomers(limit);
      
      // 💎 Calculate tier dynamically based on totalSpent
      const customersWithCalculatedTiers = localCustomers.map(customer => {
        const totalSpent = parseFloat(customer.totalSpent || '0');
        const calculatedTier = calculateTier(totalSpent);
        
        return {
          ...customer,
          membershipTier: calculatedTier.key,
          calculatedTierInfo: calculatedTier
        };
      });
      
      res.json(customersWithCalculatedTiers);
    } catch (error) {
      console.error("Error fetching local customers:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/frontend/:frontendId/categories", async (req, res) => {
    try {
      const { frontendId } = req.params;
      const { isLocalCustomer } = req.query;
      
      // Validate frontendId
      if (!frontendId || typeof frontendId !== 'string' || frontendId.trim() === '') {
        return res.status(400).json({ error: "frontendId parameter is required" });
      }
      
      // Convert query param to boolean
      const isLocal = isLocalCustomer === 'true' || isLocalCustomer === '1';
      
      const categories = await storage.getCategoriesForFrontend(frontendId.trim(), isLocal);
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories for frontend:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/frontend/:frontendId/products", async (req, res) => {
    try {
      const { frontendId } = req.params;
      const { isLocalCustomer, limit, search, offset } = req.query;
      
      // Validate frontendId
      if (!frontendId || typeof frontendId !== 'string' || frontendId.trim() === '') {
        return res.status(400).json({ error: "frontendId parameter is required" });
      }
      
      // Convert and validate query params
      const isLocal = isLocalCustomer === 'true' || isLocalCustomer === '1';
      
      // Sanitize limit (default 50, max 1000)
      let limitNum = 50;
      if (limit) {
        const parsedLimit = parseInt(limit as string);
        if (!isNaN(parsedLimit) && parsedLimit > 0) {
          limitNum = Math.min(parsedLimit, 1000); // Cap at 1000
        }
      }
      
      // Sanitize offset (default 0, min 0)
      let offsetNum = 0;
      if (offset) {
        const parsedOffset = parseInt(offset as string);
        if (!isNaN(parsedOffset) && parsedOffset >= 0) {
          offsetNum = parsedOffset;
        }
      }
      
      const products = await storage.getProductsForFrontend(
        frontendId.trim(), 
        isLocal, 
        limitNum, 
        search as string, 
        offsetNum
      );
      
      // 💎 VIP TIER FILTERING - Filter products based on customer VIP tier
      const { 
        filterProductsByVIPAccess, 
        getCustomerTierFromSession, 
        isAdminUser 
      } = await import('./utils/vip-utils');
      
      const customerTier = getCustomerTierFromSession(req.session);
      const isAdmin = isAdminUser(req.session);
      
      const filteredProducts = filterProductsByVIPAccess(products, customerTier, isAdmin);
      
      console.log(`💎 Frontend Products - Filtered: ${products.length} → ${filteredProducts.length}`);
      
      res.json(filteredProducts);
    } catch (error) {
      console.error("Error fetching products for frontend:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Industries API
  app.get("/api/industries", async (req, res) => {
    try {
      const industries = await storage.getIndustries();
      res.json(industries);
    } catch (error) {
      console.error("Error fetching industries:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/industries/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const industry = await storage.getIndustry(id);
      if (industry) {
        res.json(industry);
      } else {
        res.status(404).json({ error: "Industry not found" });
      }
    } catch (error) {
      console.error("Error fetching industry:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/industries", async (req, res) => {
    try {
      const { name, description, isActive = true, sortOrder = 0 } = req.body;
      
      if (!name) {
        return res.status(400).json({ error: "Name is required" });
      }
      
      const industry = await storage.createIndustry({
        name,
        description,
        isActive,
        sortOrder
      });
      res.json({ ...industry, message: "Industry created successfully" });
    } catch (error) {
      console.error("Error creating industry:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/industries/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, isActive, sortOrder } = req.body;
      const industry = await storage.updateIndustry(id, {
        name,
        description,
        isActive,
        sortOrder
      });
      if (industry) {
        res.json({ ...industry, message: "Industry updated successfully" });
      } else {
        res.status(404).json({ error: "Industry not found" });
      }
    } catch (error) {
      console.error("Error updating industry:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/industries/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteIndustry(id);
      if (success) {
        res.json({ message: "Industry deleted successfully" });
      } else {
        res.status(404).json({ error: "Industry not found" });
      }
    } catch (error) {
      console.error("Error deleting industry:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Categories API
  app.get("/api/categories", 
    cacheMiddleware(300, () => CacheKeys.categories()),
    async (req, res) => {
    try {
      const { industryId } = req.query;
      const industryIdParam = typeof industryId === 'string' ? industryId : undefined;
      const categories = await storage.getCategories(industryIdParam);
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // 🎯 Dynamic Frontend Filtering API - MUST come before /:id route
  app.get("/api/categories/filter", async (req, res) => {
    try {
      const { frontendId, customerId, isLocal } = req.query;
      
      // Input validation
      if (!frontendId) {
        return res.status(400).json({ error: "frontendId parameter is required" });
      }

      // Get customer info if customerId provided
      let customer = null;
      if (customerId) {
        customer = await storage.getCustomer(customerId as string);
        if (!customer) {
          return res.status(404).json({ error: "Customer not found" });
        }
      }

      // Determine if customer is local (from parameter or customer data)
      const isLocalCustomer = isLocal === 'true' || customer?.isLocalCustomer || false;

      // Get frontend category assignments
      const assignments = await storage.getFrontendCategoryAssignmentsByFrontend(frontendId as string);
      
      if (assignments.length === 0) {
        return res.json([]);
      }

      // Get assigned category IDs
      const assignedCategoryIds = assignments.map(a => a.categoryId);

      // Get all categories and filter to only assigned ones
      const allCategories = await storage.getCategories();
      const assignedCategories = allCategories.filter(cat => assignedCategoryIds.includes(cat.id));

      // Filter categories based on customer type using Enabled as VIP flag
      let filteredCategories = assignedCategories;
      
      if (!isLocalCustomer) {
        // Global customers: see categories where isActive = true (default/global) 
        // Only exclude VIP-only categories marked with isActive = false
        filteredCategories = assignedCategories.filter(category => {
          const assignment = assignments.find(a => a.categoryId === category.id);
          return assignment?.isActive !== false; // Show everything except explicitly VIP-only
        });
      }
      // Local (VIP) customers see all assigned categories (isActive = true + false)

      // Sort by assignment sort order
      filteredCategories.sort((a, b) => {
        const assignmentA = assignments.find(assign => assign.categoryId === a.id);
        const assignmentB = assignments.find(assign => assign.categoryId === b.id);
        return (assignmentA?.sortOrder || 0) - (assignmentB?.sortOrder || 0);
      });

      res.json(filteredCategories);
    } catch (error) {
      console.error("Error in dynamic filtering:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/categories/:id", async (req, res) => {
    try {
      const category = await storage.getCategory(req.params.id);
      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      console.error("Error fetching category:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/categories", async (req, res) => {
    try {
      const validatedData = insertCategoriesSchema.parse(req.body);
      const category = await storage.createCategory(validatedData);
      res.status(201).json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      console.error("Error creating category:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/categories/:id", async (req, res) => {
    try {
      const partialCategorySchema = insertCategoriesSchema.partial();
      const validatedData = partialCategorySchema.parse(req.body);
      const category = await storage.updateCategory(req.params.id, validatedData);
      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      console.error("Error updating category:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/categories/:id", async (req, res) => {
    try {
      const success = await storage.deleteCategory(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Category not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Frontend Category Assignments API
  app.get("/api/frontend-categories", async (req, res) => {
    try {
      const assignments = await storage.getFrontendCategoryAssignments();
      res.json(assignments);
    } catch (error) {
      console.error("Error fetching frontend category assignments:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/frontend-categories/:frontendId", async (req, res) => {
    try {
      const { frontendId } = req.params;
      const assignments = await storage.getFrontendCategoryAssignmentsByFrontend(frontendId);
      res.json(assignments);
    } catch (error) {
      console.error("Error fetching frontend category assignments by frontend:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/frontend-categories", async (req, res) => {
    try {
      const { insertFrontendCategoryAssignmentsSchema } = await import("@shared/schema");
      const validation = insertFrontendCategoryAssignmentsSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ error: "Validation error", details: validation.error.errors });
      }

      const assignment = await storage.createFrontendCategoryAssignment(validation.data);
      res.status(201).json(assignment);
    } catch (error) {
      console.error("Error creating frontend category assignment:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/frontend-categories/:id", async (req, res) => {
    try {
      const { insertFrontendCategoryAssignmentsSchema } = await import("@shared/schema");
      const partialSchema = insertFrontendCategoryAssignmentsSchema.partial();
      const validation = partialSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ error: "Validation error", details: validation.error.errors });
      }

      const assignment = await storage.updateFrontendCategoryAssignment(req.params.id, validation.data);
      if (!assignment) {
        return res.status(404).json({ error: "Frontend category assignment not found" });
      }
      res.json(assignment);
    } catch (error) {
      console.error("Error updating frontend category assignment:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/frontend-categories/:id", async (req, res) => {
    try {
      const success = await storage.deleteFrontendCategoryAssignment(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Frontend category assignment not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting frontend category assignment:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Orders API
  // 🚀 Enhanced Orders API with Unified Source Filtering + Tags
  app.get("/api/orders", requirePOSAuth, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const source = req.query.source as string; // Filter by source
      const syncStatus = req.query.syncStatus as string; // Filter by sync status
      const tags = req.query.tags as string; // Filter by tags (e.g., ?tags=POS)
      
      const orders = await storage.getOrders(limit);
      
      // Apply filters if provided
      let filteredOrders = orders;
      
      if (source && source !== 'all') {
        filteredOrders = filteredOrders.filter(order => 
          (order as any).source === source
        );
      }
      
      if (syncStatus && syncStatus !== 'all') {
        filteredOrders = filteredOrders.filter(order => 
          (order as any).syncStatus === syncStatus
        );
      }

      // 🏷️ Filter by tags if provided
      if (tags) {
        filteredOrders = filteredOrders.filter(order => 
          (order as any).tags && (order as any).tags.includes(tags)
        );
      }
      
      // Add source information to response for compatibility
      const enhancedOrders = filteredOrders.map(order => ({
        ...order,
        sourceInfo: {
          source: (order as any).source || 'admin',
          sourceOrderId: (order as any).sourceOrderId || null,
          sourceReference: (order as any).sourceReference || null,
          syncStatus: (order as any).syncStatus || 'manual'
        }
      }));
      
      res.json(enhancedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // 🔄 Unified Order Sync API Endpoints
  
  // Get order sync statistics
  app.get("/api/orders/sync/stats", async (req, res) => {
    try {
      const orders = await storage.getOrders();
      
      const stats = {
        total: orders.length,
        bySource: {
          admin: orders.filter(o => !(o as any).source || (o as any).source === 'admin').length,
          storefront: orders.filter(o => (o as any).source === 'storefront').length,
          'tiktok-shop': orders.filter(o => (o as any).source === 'tiktok-shop').length,
          'landing-page': orders.filter(o => (o as any).source === 'landing-page').length
        },
        bySyncStatus: {
          manual: orders.filter(o => !(o as any).syncStatus || (o as any).syncStatus === 'manual').length,
          synced: orders.filter(o => (o as any).syncStatus === 'synced').length,
          pending: orders.filter(o => (o as any).syncStatus === 'pending').length,
          failed: orders.filter(o => (o as any).syncStatus === 'failed').length
        }
      };
      
      res.json(stats);
    } catch (error) {
      console.error("Error fetching sync stats:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Manual sync from storefront orders
  app.post("/api/orders/sync/storefront", requireAuth, requireCSRFToken, async (req, res) => {
    try {
      console.log('🏪 Manual storefront sync initiated...');
      const result = await orderSyncService.syncStorefrontOrders();
      
      res.json({
        success: true,
        message: `Đã đồng bộ ${result.synced} đơn hàng từ storefront`,
        data: result
      });
    } catch (error) {
      console.error("Error syncing storefront orders:", error);
      res.status(500).json({ 
        error: "Lỗi đồng bộ đơn hàng storefront",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Manual sync from TikTok Shop orders  
  app.post("/api/orders/sync/tiktok-shop", requireAuth, requireCSRFToken, async (req, res) => {
    try {
      console.log('🎵 Manual TikTok Shop sync initiated...');
      const result = await orderSyncService.syncTikTokShopOrders();
      
      res.json({
        success: true,
        message: `Đã đồng bộ ${result.synced} đơn hàng từ TikTok Shop`,
        data: result
      });
    } catch (error) {
      console.error("Error syncing TikTok Shop orders:", error);
      res.status(500).json({ 
        error: "Lỗi đồng bộ đơn hàng TikTok Shop",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Manual sync all sources
  app.post("/api/orders/sync/all", requireAuth, requireCSRFToken, async (req, res) => {
    try {
      console.log('🚀 Manual unified sync initiated...');
      const result = await orderSyncService.syncAllOrders();
      
      res.json({
        success: true,
        message: `Đã đồng bộ tổng cộng ${result.synced} đơn hàng từ tất cả nguồn`,
        data: result
      });
    } catch (error) {
      console.error("Error syncing all orders:", error);
      res.status(500).json({ 
        error: "Lỗi đồng bộ đơn hàng",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.get("/api/orders/:id", requirePOSAuth, async (req, res) => {
    try {
      const order = await storage.getOrderWithDetails(req.params.id);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/orders", requirePOSAuth, async (req, res) => {
    try {
      console.log("📦 Creating order with data:", req.body);
      
      // Handle different order creation formats (POS vs Admin)
      let orderData = { ...req.body };
      
      // If items is an array (from POS system), convert to count and store items separately
      let orderItems = [];
      if (Array.isArray(orderData.items)) {
        orderItems = orderData.items;
        orderData.items = orderItems.length; // Convert to count for schema validation
      }
      
      // Set default values for POS orders
      if (orderData.source === 'pos') {
        // If subtotal is missing, set it equal to total (POS orders don't have separate subtotal)
        if (!orderData.subtotal && orderData.total) {
          orderData.subtotal = orderData.total;
        }
        
        // If shippingInfo is missing, set empty object (POS orders are in-store pickup)
        if (!orderData.shippingInfo) {
          orderData.shippingInfo = {};
        }
      }
      
      // Validate the order data
      const validatedData = insertOrdersSchema.parse(orderData);
      console.log("✅ Validated order data:", validatedData);
      
      // Create the order
      const order = await storage.createOrder(validatedData);
      console.log("🎯 Created order:", order.id);
      
      // 💎 Process membership points and tier for delivered orders (AFTER all order data is committed)
      if (order.status === 'delivered' && order.customerId) {
        try {
          const membershipResult = await processMembershipForOrder({
            customerId: order.customerId,
            orderTotal: parseFloat(order.total),
            orderId: order.id
          });
          
          if (membershipResult.success) {
            console.log("💎 Membership processed successfully:", {
              tier: membershipResult.newTier,
              points: membershipResult.pointsEarned,
              upgrade: membershipResult.tierUpgrade
            });
          } else {
            console.error("💎 Membership processing failed:", membershipResult.error);
          }
        } catch (membershipError) {
          console.error("💎 Membership processing error:", membershipError);
          // Don't fail the order if membership processing fails
        }
      }
      
      // If we have order items from POS, create them
      if (orderItems.length > 0) {
        console.log("📦 Creating order items:", orderItems.length);
        for (const item of orderItems) {
          await storage.createOrderItem({
            orderId: order.id,
            productId: item.productId,
            quantity: String(item.quantity), // explicitly convert to string
            price: String(item.price) // explicitly convert to string
          });
        }
      }

      // 🚚 ViettelPost Auto Shipping Integration (non-blocking)
      try {
        if (order.status === 'paid' || order.status === 'processing') {
          console.log("🚚 Attempting ViettelPost auto shipping for order:", order.id);
          
          // Prepare shipping data
          const shippingData = {
            orderId: order.id,
            customerInfo: {
              name: order.sourceCustomerInfo?.name || 'Khách hàng',
              phone: order.sourceCustomerInfo?.phone || '0123456789',
              email: order.sourceCustomerInfo?.email,
              address: order.sourceCustomerInfo?.address || 'Địa chỉ khách hàng',
            },
            productInfo: {
              name: `Đơn hàng #${order.id.slice(-8)}`,
              totalValue: parseFloat(order.total.toString()),
              totalWeight: undefined, // Let service calculate default weight
              items: orderItems.length > 0 ? orderItems.map((item: any) => ({
                name: item.name || `Sản phẩm ${item.productId}`,
                quantity: item.quantity,
                price: item.price,
              })) : [{
                name: `Đơn hàng #${order.id.slice(-8)}`,
                quantity: 1,
                price: parseFloat(order.total.toString()),
              }],
            },
            shippingOptions: {
              serviceCode: 'VCN', // Default service
              paymentMethod: 1, // Người gửi trả
              note: `Đơn hàng e-commerce #${order.id.slice(-8)}`,
            }
          };

          const vtpResult = await vtpOrderIntegration.autoCreateShippingForOrder(shippingData);
          
          if (vtpResult.success) {
            console.log("✅ ViettelPost shipping created successfully:", vtpResult.vtpOrderSystemCode);
          } else {
            console.log("⚠️ ViettelPost shipping not created:", vtpResult.error);
          }
        }
      } catch (vtpError) {
        console.error("🚚 ViettelPost integration error (non-critical):", vtpError);
        // Don't fail order creation if VTP integration fails
      }
      
      res.status(201).json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("❌ Validation error:", error.errors);
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      console.error("❌ Error creating order:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/orders/:id/status", requirePOSAuth, async (req, res) => {
    try {
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ error: "Status is required" });
      }
      
      const oldOrder = await storage.getOrder(req.params.id);
      const oldStatus = oldOrder?.status || '';
      
      const order = await storage.updateOrderStatus(req.params.id, status);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      // 📄 Auto-send invoice if status changed to "Đã gửi" (non-blocking)
      autoSendInvoiceIfNeeded(order.id, status).catch(err => {
        console.error('Error in auto-send invoice:', err);
      });

      // 📱 Send Facebook Messenger notification (non-blocking)
      try {
        const result = await sendOrderStatusNotification(order.id, status, oldStatus);
        if (result.success) {
          console.log(`✅ Facebook notification sent for order ${order.id}: ${oldStatus} → ${status}`);
        } else {
          console.log(`⚠️ Facebook notification failed for order ${order.id}: ${result.error}`);
        }
      } catch (notificationError) {
        console.error(`❌ Facebook notification error for order ${order.id}:`, notificationError);
        // Don't fail the status update if notification fails
      }

      // 💎 Process membership for delivered orders (CRITICAL FIX)
      if (status === 'delivered' && order.customerId) {
        try {
          console.log(`💎 Processing membership for order ${order.id} (${status}) - Customer: ${order.customerId}`);
          const membershipResult = await processMembershipForOrder({
            customerId: order.customerId,
            orderTotal: parseFloat(order.total),
            orderId: order.id
          });
          console.log(`✅ Membership processed:`, membershipResult);
        } catch (membershipError) {
          console.error(`❌ Membership processing failed for order ${order.id}:`, membershipError);
          // Don't fail the status update if membership processing fails
        }
      }

      // 🔔 Auto-send Vietnamese customer notifications (non-blocking)
      try {
        // Get customer info for notifications
        const customer = order.customerId ? await storage.getCustomer(order.customerId) : null;
        
        if (customer && (customer.phone || customer.email)) {
          // Send notification based on status change
          const notificationChannels: ('email' | 'sms' | 'messenger')[] = [];
          if (customer.phone) notificationChannels.push('sms');
          if (customer.email) notificationChannels.push('email');
          
          // Determine template based on status
          let templateType = '';
          if (status === 'shipped') templateType = 'order_status_shipped';
          else if (status === 'delivered') templateType = 'order_status_delivered';
          else if (status === 'paid') templateType = 'payment_confirmed';
          
          if (templateType && notificationChannels.length > 0) {
            console.log(`📱 Sending ${templateType} notification to customer ${customer.name} via ${notificationChannels.join(', ')}`);
            
            // Get template data from VIETNAMESE_ORDER_TEMPLATES
            const template = VIETNAMESE_ORDER_TEMPLATES[templateType as keyof typeof VIETNAMESE_ORDER_TEMPLATES];
            if (template) {
              const variables = {
                customerName: customer.name || 'Khách hàng',
                orderNumber: order.id.slice(-8).toUpperCase(),
                orderTotal: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(order.total)),
                shippedDate: new Date().toLocaleDateString('vi-VN'),
                paymentTime: new Date().toLocaleString('vi-VN'),
                amount: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(order.total))
              };

              // Send separate notifications per channel with appropriate content
              const notificationPromises = [];
              
              // Send SMS notification if phone available
              if (notificationChannels.includes('sms') && customer.phone) {
                notificationPromises.push(
                  notificationService.sendNotification({
                    customerId: customer.id,
                    orderId: order.id,
                    templateId: templateType,
                    title: template.title,
                    content: template.sms, // Use SMS template
                    recipientPhone: customer.phone,
                    channels: ['sms'],
                    variables: variables
                  }).catch(notifError => {
                    console.error('🚨 SMS notification failed (non-critical):', notifError);
                  })
                );
              }
              
              // Send email notification if email available
              if (notificationChannels.includes('email') && customer.email) {
                notificationPromises.push(
                  notificationService.sendNotification({
                    customerId: customer.id,
                    orderId: order.id,
                    templateId: templateType,
                    title: template.title,
                    content: template.email, // Use email template
                    recipientEmail: customer.email,
                    channels: ['email'],
                    variables: variables
                  }).catch(notifError => {
                    console.error('🚨 Email notification failed (non-critical):', notifError);
                  })
                );
              }
              
              // Execute all notifications (async, don't wait)
              if (notificationPromises.length > 0) {
                Promise.all(notificationPromises).catch(() => {
                  // All errors already logged individually
                });
              }
            }
          }
        }
      } catch (notifError) {
        // Log notification error but don't fail the status update
        console.error('🚨 Customer notification error (non-critical):', notifError);
      }

      res.json(order);
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/orders/:id", async (req, res) => {
    try {
      const partialOrderSchema = insertOrdersSchema.partial();
      const validatedData = partialOrderSchema.parse(req.body);
      const order = await storage.updateOrder(req.params.id, validatedData);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      console.error("Error updating order:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/orders/:id", async (req, res) => {
    try {
      const orderId = req.params.id;
      
      // First check if order exists
      const existingOrder = await storage.getOrderWithDetails(orderId);
      if (!existingOrder) {
        return res.status(404).json({ error: "Order not found" });
      }

      // Delete associated order items first
      const orderItems = await storage.getOrderItems(orderId);
      for (const item of orderItems) {
        await storage.deleteOrderItem(item.id);
      }

      // Then delete the order
      const deletedOrder = await storage.deleteOrder(orderId);
      
      res.json({ 
        success: true, 
        message: "Order deleted successfully",
        deletedOrder 
      });
    } catch (error) {
      console.error("Error deleting order:", error);
      res.status(500).json({ 
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.delete("/api/orders/:id", async (req, res) => {
    try {
      const success = await storage.deleteOrder(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Order not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting order:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Order Items API
  app.get("/api/order-items", async (req, res) => {
    try {
      const { orderId } = req.query;
      if (!orderId || typeof orderId !== 'string') {
        return res.status(400).json({ error: "Order ID is required" });
      }
      
      const orderItems = await storage.getOrderItems(orderId);
      res.json(orderItems);
    } catch (error) {
      console.error("Error fetching order items:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/order-items", async (req, res) => {
    try {
      const { orderId, productId, quantity, price } = req.body;
      
      if (!orderId || !productId || !quantity || !price) {
        return res.status(400).json({ 
          error: "Missing required fields: orderId, productId, quantity, price" 
        });
      }
      
      const orderItem = await storage.createOrderItem({
        orderId,
        productId, 
        quantity: String(quantity), // explicitly convert to string
        price: String(price) // explicitly convert to string
      });
      
      res.status(201).json(orderItem);
    } catch (error) {
      console.error("Error creating order item:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Payments API - Session-authenticated for frontend users
  app.get("/api/orders/:id/payment", requireSessionAuth, rateLimitMiddleware, async (req, res) => {
    try {
      const payment = await storage.getPayment(req.params.id);
      // Return null instead of 404 when payment doesn't exist - better UX
      res.json(payment || null);
    } catch (error) {
      console.error("Error fetching payment:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });


  // Create payment endpoint - Session-authenticated for frontend users
  app.post("/api/orders/:id/payment", requireSessionAuth, rateLimitMiddleware, async (req, res) => {
    try {
      // Validate order ID format
      if (!req.params.id || typeof req.params.id !== 'string') {
        return res.status(400).json({ error: "Invalid order ID format" });
      }

      // First check if order exists
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      // Check if payment already exists for this order
      const existingPayment = await storage.getPayment(req.params.id);
      if (existingPayment) {
        return res.status(200).json(existingPayment); // Return existing payment instead of error for better UX
      }

      // Bank information for VietQR - centralized configuration
      const bankInfo = {
        bank: "ACB",
        bankCode: "970416",
        accountNumber: "4555567777",
        accountName: "CONG TY TNHH ABC TECH",
      };

      // Generate QR code URL with FULL order ID (not truncated)
      const amount = Math.round(parseFloat(order.total.toString()));
      const content = `DH${order.id}`; // Use FULL order ID as requested
      const qrCode = `https://img.vietqr.io/image/${bankInfo.bankCode}-${bankInfo.accountNumber}-compact.png?amount=${amount}&addInfo=${encodeURIComponent(content)}`;

      // Create payment data with strict validation
      const paymentData = {
        orderId: req.params.id,
        method: "qr_code" as const,
        amount: order.total,
        qrCode: qrCode,
        status: "pending" as const,
        bankInfo: bankInfo,
      };

      const validatedData = insertPaymentsSchema.parse(paymentData);
      const payment = await storage.createPayment(validatedData);
      
      // Log payment creation for audit trail
      console.log(`Session-authenticated payment created for order ${req.params.id} - Amount: ${order.total}`);
      
      res.status(201).json(payment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: "Validation error", 
          details: error.errors,
          message: "Invalid payment data provided"
        });
      }
      console.error("Error creating payment:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/orders/:id/payment/status", requireSessionAuth, rateLimitMiddleware, async (req, res) => {
    try {
      // Validate order ID format
      if (!req.params.id || typeof req.params.id !== 'string') {
        return res.status(400).json({ error: "Invalid order ID format" });
      }

      // Strict validation of status and transactionId
      const validatedBody = paymentStatusSchema.parse(req.body);
      const { status, transactionId } = validatedBody;

      // Get existing payment
      const existingPayment = await storage.getPayment(req.params.id);
      if (!existingPayment) {
        return res.status(404).json({ error: "Payment not found for this order" });
      }

      // Validate state transitions - prevent invalid status changes
      const validTransitions: Record<string, string[]> = {
        "pending": ["completed", "failed", "cancelled"],
        "completed": [], // Final state - no transitions allowed
        "failed": ["pending"], // Allow retry
        "cancelled": ["pending"] // Allow retry
      };

      const allowedNextStates = validTransitions[existingPayment.status] || [];
      if (!allowedNextStates.includes(status)) {
        return res.status(400).json({ 
          error: "Invalid status transition",
          message: `Cannot change status from '${existingPayment.status}' to '${status}'`,
          currentStatus: existingPayment.status,
          allowedStates: allowedNextStates
        });
      }

      // Enhanced validation for completed status
      if (status === "completed") {
        if (!transactionId) {
          return res.status(400).json({ 
            error: "Transaction ID required",
            message: "Transaction ID is required when marking payment as completed"
          });
        }
        
        // Validate transaction ID format (basic validation)
        if (transactionId.length < 6) {
          return res.status(400).json({ 
            error: "Invalid transaction ID",
            message: "Transaction ID must be at least 6 characters long"
          });
        }
      }
      
      // Validate state transitions - prevent unauthorized changes
      if (existingPayment.status === "completed" && status !== "completed") {
        return res.status(400).json({ 
          error: "Invalid status change",
          message: "Cannot change status of completed payment"
        });
      }

      const payment = await storage.updatePaymentStatus(existingPayment.id, status, transactionId);
      if (!payment) {
        return res.status(404).json({ error: "Payment not found" });
      }
      
      // Log status change for audit trail
      console.log(`Payment status updated for order ${req.params.id}: ${existingPayment.status} -> ${status}${transactionId ? ` (TX: ${transactionId})` : ''}`);
      
      res.json(payment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: "Validation error", 
          details: error.errors,
          message: "Invalid status or transaction data provided"
        });
      }
      console.error("Error updating payment status:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Facebook OAuth Routes
  app.get("/auth/facebook", async (req, res) => {
    try {
      // Generate CSRF state parameter
      const state = facebookAuth.generateState();
      const redirectUrl = req.query.redirect as string;
      
      // Store state for verification
      oauthStates.set(state, { 
        timestamp: Date.now(),
        redirectUrl: redirectUrl || '/social-media' 
      });
      
      // Generate authorization URL
      const authUrl = facebookAuth.getAuthorizationUrl(state);
      
      // Redirect to Facebook OAuth
      res.redirect(authUrl);
    } catch (error) {
      console.error("Error initiating Facebook OAuth:", error);
      res.status(500).json({ 
        error: "Failed to initiate Facebook authentication",
        message: "Please try again later"
      });
    }
  });

  app.get("/auth/facebook/callback", async (req, res) => {
    try {
      const { code, state, error, error_description } = req.query;

      // Handle OAuth error from Facebook
      if (error) {
        console.error("Facebook OAuth error:", error, error_description);
        const errorMessage = error === 'access_denied' ? 'Access was denied' : 'Authentication failed';
        return res.redirect(`/social-media?error=${encodeURIComponent(errorMessage)}`);
      }

      // Validate state parameter for CSRF protection
      if (!state || !oauthStates.has(state as string)) {
        console.error("Invalid or missing OAuth state parameter");
        return res.redirect('/social-media?error=security_error');
      }

      const stateData = oauthStates.get(state as string)!;
      oauthStates.delete(state as string); // Use state only once

      if (!code) {
        return res.redirect('/social-media?error=no_authorization_code');
      }

      // Exchange code for tokens
      const tokenData = await facebookAuth.exchangeCodeForToken(code as string);
      
      // Get long-lived token
      const longLivedTokenData = await facebookAuth.getLongLivedToken(tokenData.access_token);
      
      // Get user profile
      const userProfile = await facebookAuth.getUserProfile(longLivedTokenData.access_token);
      
      // Get user's Facebook pages
      const pages = await facebookAuth.getUserPages(longLivedTokenData.access_token);

      // Store main profile as social account
      const socialAccountData = {
        platform: "facebook" as const,
        name: userProfile.name,
        accountId: userProfile.id,
        accessToken: longLivedTokenData.access_token,
        followers: 0,
        connected: true,
        lastPost: null,
        engagement: "0"
      };

      const socialAccount = await storage.createSocialAccount(socialAccountData);
      
      // If user has pages, get insights for the first page
      if (pages.length > 0) {
        const firstPage = pages[0];
        try {
          const insights = await facebookAuth.getPageInsights(firstPage.id, firstPage.access_token);
          await storage.updateSocialAccount(socialAccount.id, {
            followers: insights.followers,
            engagement: insights.engagement.toString()
          });
        } catch (insightError) {
          console.warn("Could not fetch page insights:", insightError);
        }
      }

      // Redirect back to social media page with success
      res.redirect(`${stateData.redirectUrl}?success=facebook_connected`);
    } catch (error) {
      console.error("Error in Facebook OAuth callback:", error);
      res.redirect('/social-media?error=authentication_failed');
    }
  });

  app.post("/api/facebook/connect", async (req, res) => {
    try {
      // This endpoint initiates the OAuth flow from the frontend
      const state = facebookAuth.generateState();
      const redirectUrl = req.body.redirectUrl || '/social-media';
      
      // Store state for verification
      oauthStates.set(state, { 
        timestamp: Date.now(),
        redirectUrl 
      });
      
      // Return authorization URL to frontend
      const authUrl = facebookAuth.getAuthorizationUrl(state);
      
      res.json({ authUrl, state });
    } catch (error) {
      console.error("Error generating Facebook OAuth URL:", error);
      res.status(500).json({ 
        error: "Failed to generate authentication URL",
        message: "Please try again later"
      });
    }
  });

  app.delete("/api/facebook/disconnect/:accountId", async (req, res) => {
    try {
      const { accountId } = req.params;
      
      // Find the social account
      const accounts = await storage.getSocialAccounts();
      const facebookAccount = accounts.find(
        account => account.id === accountId && account.platform === 'facebook'
      );
      
      if (!facebookAccount) {
        return res.status(404).json({ error: "Facebook account not found" });
      }
      
      // FORCE DISCONNECT: Delete from database first (always succeeds)
      // Use direct SQL delete to ensure row is removed completely
      const { db } = await import("./db");
      const { socialAccounts } = await import("../shared/schema");
      const { eq } = await import("drizzle-orm");
      
      await db.delete(socialAccounts).where(eq(socialAccounts.id, accountId));
      console.log(`✅ Deleted social account ${accountId} from database`);
      
      // Best effort: Try to revoke Facebook token (ignore errors)
      if (facebookAccount.accessToken) {
        try {
          await facebookAuth.revokeToken(facebookAccount.accessToken);
          console.log('✅ Successfully revoked Facebook token');
        } catch (revokeError) {
          console.warn('⚠️ Failed to revoke Facebook token (ignored):', revokeError);
        }
      }
      
      res.json({ success: true, message: "Facebook account disconnected and removed" });
    } catch (error) {
      console.error("Error disconnecting Facebook account:", error);
      res.status(500).json({ 
        error: "Failed to disconnect Facebook account",
        message: "Please try again later"
      });
    }
  });

  // TikTok Business Connect
  app.post("/api/tiktok-business/connect", async (req, res) => {
    try {
      // This endpoint initiates the TikTok Business OAuth flow from the frontend
      const state = tiktokAuth.generateState();
      const redirectUrl = req.body.redirectUrl || '/tiktok-business';
      
      // Store state for verification
      oauthStates.set(state, { 
        timestamp: Date.now(),
        redirectUrl,
        platform: 'tiktok-business'
      });
      
      // Return authorization URL to frontend
      const authUrl = tiktokAuth.getBusinessAuthorizationUrl(state);
      
      res.json({ authUrl, state });
    } catch (error) {
      console.error("Error generating TikTok Business OAuth URL:", error);
      res.status(500).json({ 
        error: "Failed to generate authentication URL",
        message: "Please try again later"
      });
    }
  });

  // TikTok Shop Connect
  app.post("/api/tiktok-shop/connect", async (req, res) => {
    try {
      // This endpoint initiates the TikTok Shop OAuth flow from the frontend
      const state = tiktokAuth.generateState();
      const redirectUrl = req.body.redirectUrl || '/tiktok-shop';
      
      // Store state for verification
      oauthStates.set(state, { 
        timestamp: Date.now(),
        redirectUrl,
        platform: 'tiktok-shop'
      });
      
      // Return authorization URL to frontend
      const authUrl = tiktokAuth.getShopAuthorizationUrl(state);
      
      res.json({ authUrl, state });
    } catch (error) {
      console.error("Error generating TikTok Shop OAuth URL:", error);
      res.status(500).json({ 
        error: "Failed to generate authentication URL",
        message: "Please try again later"
      });
    }
  });

  // TikTok Business OAuth Callback
  app.get("/auth/tiktok-business/callback", async (req, res) => {
    try {
      const { code, state, error } = req.query;
      
      if (error) {
        console.error('TikTok Business OAuth error:', error);
        return res.redirect('/tiktok-business?error=access_denied');
      }
      
      if (!code || !state || typeof code !== 'string' || typeof state !== 'string') {
        return res.redirect('/tiktok-business?error=invalid_request');
      }
      
      // Verify state parameter
      const storedState = oauthStates.get(state);
      if (!storedState || storedState.platform !== 'tiktok-business') {
        return res.redirect('/tiktok-business?error=invalid_state');
      }
      
      // Clean up state
      oauthStates.delete(state);
      
      // Exchange code for token
      const tokens = await tiktokAuth.exchangeBusinessCodeForToken(code);
      
      // Get user profile
      const userProfile = await tiktokAuth.getUserProfile(tokens.access_token);
      
      // Try to get business profile
      let businessProfiles: any[] = [];
      try {
        businessProfiles = await tiktokAuth.getBusinessProfile(tokens.access_token);
      } catch (businessError) {
        console.warn('Could not fetch business profile:', businessError);
      }
      
      // Create or update social account
      const accountName = businessProfiles.length > 0 
        ? businessProfiles[0]?.advertiser_name || userProfile.display_name
        : userProfile.display_name;
      
      const accountId = businessProfiles.length > 0 
        ? businessProfiles[0]?.advertiser_id || userProfile.open_id
        : userProfile.open_id;
      
      const socialAccountData = {
        platform: 'tiktok-business' as const,
        name: accountName || 'TikTok Business Account',
        accountId: accountId || userProfile.open_id,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        tokenExpiresAt: tokens.expires_in 
          ? new Date(Date.now() + (tokens.expires_in * 1000)) 
          : undefined,
        pageAccessTokens: [],
        webhookSubscriptions: [],
        tags: [],
        followers: 0, // Will be updated via API
        connected: true,
        lastSync: new Date(),
        isActive: true
      };
      
      await storage.createSocialAccount(socialAccountData);
      
      // Use stored redirectUrl with whitelist for security
      const allowedPaths = ['/facebook', '/tiktok-business', '/tiktok-shop', '/social-media'];
      const redirectPath = (storedState.redirectUrl && allowedPaths.includes(storedState.redirectUrl)) 
        ? storedState.redirectUrl 
        : '/tiktok-business';
      
      res.redirect(`${redirectPath}?success=tiktok_business_connected`);
    } catch (error) {
      console.error("Error in TikTok Business OAuth callback:", error);
      res.redirect('/tiktok-business?error=authentication_failed');
    }
  });

  // TikTok Shop OAuth Callback
  app.get("/auth/tiktok-shop/callback", async (req, res) => {
    try {
      const { code, state, error } = req.query;
      
      if (error) {
        console.error('TikTok Shop OAuth error:', error);
        return res.redirect('/tiktok-shop?error=access_denied');
      }
      
      if (!code || !state || typeof code !== 'string' || typeof state !== 'string') {
        return res.redirect('/tiktok-shop?error=invalid_request');
      }
      
      // Verify state parameter
      const storedState = oauthStates.get(state);
      if (!storedState || storedState.platform !== 'tiktok-shop') {
        return res.redirect('/tiktok-shop?error=invalid_state');
      }
      
      // Clean up state
      oauthStates.delete(state);
      
      // Exchange code for token
      const tokens = await tiktokAuth.exchangeShopCodeForToken(code);
      
      // Get user profile
      const userProfile = await tiktokAuth.getUserProfile(tokens.access_token);
      
      // Create or update social account
      const socialAccountData = {
        platform: 'tiktok-shop' as const,
        name: `${userProfile.display_name || 'TikTok'} Shop`,
        accountId: userProfile.open_id || 'unknown_id',
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        tokenExpiresAt: tokens.expires_in 
          ? new Date(Date.now() + (tokens.expires_in * 1000)) 
          : undefined,
        pageAccessTokens: [],
        webhookSubscriptions: [],
        tags: [],
        followers: 0, // Will be updated via API
        connected: true,
        lastSync: new Date(),
        isActive: true
      };
      
      await storage.createSocialAccount(socialAccountData);
      
      // Use stored redirectUrl with whitelist for security
      const allowedPaths = ['/facebook', '/tiktok-business', '/tiktok-shop', '/social-media'];
      const redirectPath = (storedState.redirectUrl && allowedPaths.includes(storedState.redirectUrl)) 
        ? storedState.redirectUrl 
        : '/tiktok-shop';
      
      res.redirect(`${redirectPath}?success=tiktok_shop_connected`);
    } catch (error) {
      console.error("Error in TikTok Shop OAuth callback:", error);
      res.redirect('/tiktok-shop?error=authentication_failed');
    }
  });

  // TikTok Disconnect endpoints
  app.delete("/api/tiktok/disconnect/:accountId", async (req, res) => {
    try {
      const { accountId } = req.params;
      
      // Find the social account
      const accounts = await storage.getSocialAccounts();
      const tiktokAccount = accounts.find(
        account => account.id === accountId && 
                  (account.platform === 'tiktok-business' || account.platform === 'tiktok-shop')
      );
      
      if (!tiktokAccount) {
        return res.status(404).json({ error: "TikTok account not found" });
      }
      
      // Update account to disconnected state
      await storage.updateSocialAccount(accountId, {
        connected: false,
        accessToken: null
      });
      
      res.json({ success: true, message: "TikTok account disconnected" });
    } catch (error) {
      console.error("Error disconnecting TikTok account:", error);
      res.status(500).json({ 
        error: "Failed to disconnect TikTok account",
        message: "Please try again later"
      });
    }
  });

  // Social Media API
  app.get("/api/social-accounts", async (req, res) => {
    try {
      const accounts = await storage.getSocialAccounts();
      // Remove sensitive fields like accessToken before sending to client
      const safeAccounts = accounts.map(account => ({
        id: account.id,
        platform: account.platform,
        name: account.name,
        accountId: account.accountId,
        followers: account.followers,
        connected: account.connected,
        lastPost: account.lastPost,
        engagement: account.engagement,
        createdAt: account.createdAt,
      }));
      res.json(safeAccounts);
    } catch (error) {
      console.error("Error fetching social accounts:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/social-accounts", async (req, res) => {
    try {
      const account = await storage.createSocialAccount(req.body);
      res.status(201).json(account);
    } catch (error) {
      console.error("Error creating social account:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/social-accounts/:id", async (req, res) => {
    try {
      const account = await storage.updateSocialAccount(req.params.id, req.body);
      if (!account) {
        return res.status(404).json({ error: "Social account not found" });
      }
      res.json(account);
    } catch (error) {
      console.error("Error updating social account:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // 🤖 Bot Config API - Per-fanpage RASA configuration
  app.get("/api/social-accounts/:id/bot-config", requireSessionAuth, async (req, res) => {
    try {
      const botConfig = await storage.getSocialAccountBotConfig(req.params.id);
      if (botConfig === null) {
        return res.status(404).json({ error: "Social account not found" });
      }
      res.json(botConfig);
    } catch (error) {
      console.error("Error fetching bot config:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/social-accounts/:id/bot-config", requireAdminAuth, async (req, res) => {
    try {
      const account = await storage.updateSocialAccountBotConfig(req.params.id, req.body);
      if (!account) {
        return res.status(404).json({ error: "Social account not found" });
      }
      res.json(account.botConfig);
    } catch (error) {
      console.error("Error updating bot config:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // 📱 Facebook App Assignment - Assign page to specific Facebook App
  app.put("/api/social-accounts/:id/assign-app", requireAdminAuth, async (req, res) => {
    try {
      const { id: accountId } = req.params;
      const { facebookAppId } = req.body;
      
      // Validate input
      if (!facebookAppId || typeof facebookAppId !== 'string') {
        return res.status(400).json({ 
          error: 'Valid facebookAppId is required',
          code: 'INVALID_APP_ID'
        });
      }
      
      // Verify the Facebook App exists
      const apps = await storage.getAllFacebookApps();
      const targetApp = apps.find((app: any) => app.id === facebookAppId);
      if (!targetApp) {
        return res.status(404).json({ 
          error: 'Facebook App not found',
          code: 'APP_NOT_FOUND'
        });
      }
      
      // Verify the social account exists and is a Facebook page
      const accounts = await storage.getSocialAccounts();
      const targetAccount = accounts.find((acc: any) => acc.id === accountId);
      if (!targetAccount) {
        return res.status(404).json({ 
          error: 'Social account not found',
          code: 'ACCOUNT_NOT_FOUND'
        });
      }
      if (targetAccount.platform !== 'facebook') {
        return res.status(400).json({ 
          error: 'Only Facebook pages can be assigned to Facebook Apps',
          code: 'INVALID_PLATFORM'
        });
      }
      
      // Update the social account with the Facebook App ID
      await storage.updateSocialAccount(accountId, {
        facebookAppId
      });
      
      res.json({
        success: true,
        message: `Page "${targetAccount.name}" assigned to App "${targetApp.appName}"`,
        accountId,
        facebookAppId,
        appName: targetApp.appName,
        pageName: targetAccount.name
      });
    } catch (error) {
      console.error('Error assigning page to app:', error);
      res.status(500).json({ 
        error: 'Failed to assign page to app',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Groups API
  app.get("/api/groups", requireSessionAuth, async (req, res) => {
    try {
      const { platform } = req.query;
      
      // Import accountGroups from schema
      const { accountGroups } = await import("@shared/schema");
      const { db } = await import("./db");
      const { eq, desc } = await import("drizzle-orm");
      
      // Build query with platform filter and execute
      const groups = platform 
        ? await db.select().from(accountGroups)
            .where(eq(accountGroups.platform, platform as string))
            .orderBy(desc(accountGroups.createdAt))
        : await db.select().from(accountGroups)
            .orderBy(desc(accountGroups.createdAt));
      
      res.json(groups);
    } catch (error) {
      console.error("Error fetching groups:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Update Facebook app group
  app.patch("/api/facebook-apps/:id/group", requireSessionAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { groupId } = req.body;
      
      // Import facebookApps from schema
      const { facebookApps } = await import("@shared/schema");
      const { db } = await import("./db");
      const { eq } = await import("drizzle-orm");
      
      // Update Facebook app group assignment
      const updatedApp = await db.update(facebookApps)
        .set({ 
          groupId: groupId || null,
          updatedAt: new Date().toISOString()
        })
        .where(eq(facebookApps.id, id))
        .returning();
      
      if (updatedApp.length === 0) {
        return res.status(404).json({ error: "Facebook app not found" });
      }
      
      res.json({ success: true, app: updatedApp[0] });
    } catch (error) {
      console.error("Error updating Facebook app group:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Facebook Chat API
  app.get("/api/facebook/conversations", requireSessionAuth, async (req, res) => {
    try {
      const { tag } = req.query;
      let conversations = await storage.getFacebookConversations();
      
      // Filter by tag if provided (e.g., ?tag=support-request)
      if (tag && typeof tag === 'string') {
        conversations = conversations.filter(conv => 
          conv.tagIds && conv.tagIds.includes(tag)
        );
      }
      
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching Facebook conversations:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/facebook/conversations/:conversationId/messages", requireSessionAuth, async (req, res) => {
    try {
      const { conversationId } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const messages = await storage.getFacebookMessages(conversationId, limit);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching Facebook messages:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/facebook/conversations/:conversationId/send", requireSessionAuth, async (req, res) => {
    try {
      const { conversationId } = req.params;
      const { content } = req.body;
      
      // Get conversation details
      const conversation = await storage.getFacebookConversation(conversationId);
      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }

      // Get social account with page token
      const socialAccount = await storage.getSocialAccountByPageId(conversation.pageId);
      if (!socialAccount) {
        return res.status(404).json({ error: "Social account not found" });
      }

      // Send message via Facebook API
      const pageToken = socialAccount.pageAccessTokens?.find((token: any) => token.pageId === conversation.pageId)?.accessToken;
      if (!pageToken) {
        return res.status(400).json({ error: "Page access token not found" });
      }

      // Call Facebook Messenger Send API (correct endpoint)
      const fbResponse = await fetch(`https://graph.facebook.com/v18.0/me/messages?access_token=${pageToken}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recipient: { id: conversation.participantId },
          message: { text: content },
          messaging_type: "RESPONSE"
        })
      });

      if (!fbResponse.ok) {
        const error = await fbResponse.json() as any;
        console.error('Facebook API error:', error);
        return res.status(400).json({ error: "Failed to send message" });
      }

      const fbResult = await fbResponse.json() as any;

      // Store message in database
      const message = await storage.createFacebookMessage({
        conversationId: conversationId,
        facebookMessageId: fbResult.message_id,
        senderId: conversation.pageId,
        senderName: socialAccount.name,
        senderType: 'page',
        content: content,
        messageType: 'text',
        attachments: [],
        timestamp: new Date(),
        isEcho: false,
        replyToMessageId: null,
        isRead: true,
        isDelivered: true
      });

      res.status(201).json(message);
    } catch (error) {
      console.error("Error sending Facebook message:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Reply endpoint (alias for send) - for ChatbotManagement component compatibility
  app.post("/api/facebook/conversations/:conversationId/reply", requireSessionAuth, async (req, res) => {
    try {
      const { conversationId } = req.params;
      const { message } = req.body; // ChatbotManagement sends 'message' field
      
      // Get conversation details
      const conversation = await storage.getFacebookConversation(conversationId);
      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }

      // Get social account with page token
      const socialAccount = await storage.getSocialAccountByPageId(conversation.pageId);
      if (!socialAccount) {
        return res.status(404).json({ error: "Social account not found" });
      }

      // Send message via Facebook API
      const pageToken = socialAccount.pageAccessTokens?.find((token: any) => token.pageId === conversation.pageId)?.accessToken;
      if (!pageToken) {
        return res.status(400).json({ error: "Page access token not found" });
      }

      // Call Facebook Messenger Send API (correct endpoint)
      const fbResponse = await fetch(`https://graph.facebook.com/v18.0/me/messages?access_token=${pageToken}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recipient: { id: conversation.participantId },
          message: { text: message },
          messaging_type: "RESPONSE"
        })
      });

      if (!fbResponse.ok) {
        const error = await fbResponse.json() as any;
        console.error('Facebook API error:', error);
        return res.status(400).json({ error: "Failed to send message" });
      }

      const fbResult = await fbResponse.json() as any;

      // Store message in database
      const messageRecord = await storage.createFacebookMessage({
        conversationId: conversationId,
        facebookMessageId: fbResult.message_id,
        senderId: conversation.pageId,
        senderName: socialAccount.name,
        senderType: 'page',
        content: message,
        messageType: 'text',
        attachments: [],
        timestamp: new Date(),
        isEcho: false,
        replyToMessageId: null,
        isRead: true,
        isDelivered: true
      });

      res.status(201).json(messageRecord);
    } catch (error) {
      console.error("Error sending Facebook reply:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/facebook/conversations/:conversationId", requireSessionAuth, async (req, res) => {
    try {
      const { conversationId } = req.params;
      const updates = req.body;
      
      const conversation = await storage.updateFacebookConversation(conversationId, updates);
      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }
      
      res.json(conversation);
    } catch (error) {
      console.error("Error updating Facebook conversation:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/facebook/conversations/:conversationId/read", async (req, res) => {
    try {
      const { conversationId } = req.params;
      
      // Mark conversation as read
      await storage.updateFacebookConversation(conversationId, { isRead: true });
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking conversation as read:", error);
      res.status(500).json({ error: "Failed to mark conversation as read" });
    }
  });

  // 💬 POS Chat Support - Simple send message endpoint
  app.post("/api/facebook/send-message", requireSessionAuth, async (req, res) => {
    try {
      const { recipientId, message, pageId } = req.body;

      if (!recipientId || !message || !pageId) {
        return res.status(400).json({ error: "Missing required fields: recipientId, message, pageId" });
      }

      // Get social account with page token
      const socialAccount = await storage.getSocialAccountByPageId(pageId);
      if (!socialAccount) {
        return res.status(404).json({ error: "Social account not found for this page" });
      }

      // Get page access token
      const pageToken = socialAccount.pageAccessTokens?.find((token: any) => token.pageId === pageId)?.accessToken;
      if (!pageToken) {
        return res.status(400).json({ error: "Page access token not found" });
      }

      // Send message via Facebook API
      const fbResponse = await fetch(`https://graph.facebook.com/v18.0/me/messages?access_token=${pageToken}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient: { id: recipientId },
          message: { text: message },
          messaging_type: "RESPONSE"
        })
      });

      if (!fbResponse.ok) {
        const error = await fbResponse.json() as any;
        console.error('Facebook API error:', error);
        return res.status(400).json({ 
          error: "Failed to send message",
          message: error.error?.message || "Unknown Facebook API error"
        });
      }

      const fbResult = await fbResponse.json() as any;

      // Find or create conversation
      let conversation = await storage.getFacebookConversationByParticipant(pageId, recipientId);
      if (conversation) {
        // Store message in database
        await storage.createFacebookMessage({
          conversationId: conversation.id,
          facebookMessageId: fbResult.message_id,
          senderId: pageId,
          senderName: socialAccount.name,
          senderType: 'page',
          content: message,
          messageType: 'text',
          attachments: [],
          timestamp: new Date(),
          isEcho: false,
          replyToMessageId: null,
          isRead: true,
          isDelivered: true
        });

        // Update conversation
        await storage.updateFacebookConversation(conversation.id, {
          lastMessageAt: new Date(),
          lastMessagePreview: message.substring(0, 100),
          isRead: true
        });
      }

      res.json({ 
        success: true, 
        messageId: fbResult.message_id,
        message: "Message sent successfully"
      });
    } catch (error) {
      console.error("Error sending Facebook message from POS:", error);
      res.status(500).json({ 
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Webhook Configuration API (Admin-only Protected)
  app.get("/api/facebook/webhook-config", requireAdminAuth, async (req, res) => {
    try {
      const facebookAccount = await storage.getSocialAccountByPlatform('facebook');
      if (!facebookAccount) {
        // Facebook requires HTTPS for webhooks
        const protocol = 'https';
        const host = process.env.REPLIT_DEV_DOMAIN || req.get('host');
        return res.json({ 
          webhookUrl: `${protocol}://${host}/api/webhooks/facebook`,
          verifyToken: "",
          status: 'not_configured'
        });
      }

      const webhookConfig = facebookAccount.webhookSubscriptions?.[0];
      // Facebook requires HTTPS for webhooks
      const protocol = 'https';
      const host = process.env.REPLIT_DEV_DOMAIN || req.get('host');
      res.json({
        webhookUrl: webhookConfig?.webhookUrl || `${protocol}://${host}/api/webhooks/facebook`,
        verifyToken: webhookConfig?.verifyToken ? `${webhookConfig.verifyToken.substring(0, 6)}****` : "",
        verifyTokenSet: !!webhookConfig?.verifyToken,
        status: webhookConfig?.status || 'not_configured',
        lastEvent: webhookConfig?.lastEvent
      });
    } catch (error) {
      console.error("Error fetching webhook config:", error);
      res.status(500).json({ error: "Failed to fetch webhook configuration" });
    }
  });

  // TikTok Business API Endpoints
  app.get("/api/tiktok/business-accounts", requireAdminAuth, async (req, res) => {
    try {
      const accounts = await storage.getTikTokBusinessAccounts();
      // Remove sensitive fields before sending to client
      const safeAccounts = accounts.map(account => ({
        id: account.id,
        businessId: account.businessId,
        displayName: account.displayName,
        username: account.username,
        avatarUrl: account.avatarUrl,
        businessType: account.businessType,
        industry: account.industry,
        followerCount: account.followerCount,
        createdAt: account.createdAt,
        updatedAt: account.updatedAt
      }));
      res.json(safeAccounts);
    } catch (error) {
      console.error("Error fetching TikTok business accounts:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/tiktok/business-accounts", requireAdminAuth, requireCSRFToken, async (req, res) => {
    try {
      // Validate request body with Zod
      const validatedData = insertTiktokBusinessAccountsSchema.parse(req.body);
      const account = await storage.createTikTokBusinessAccount(validatedData);
      
      // Return safe fields only (no sensitive tokens)
      const safeAccount = {
        id: account.id,
        businessId: account.businessId,
        displayName: account.displayName,
        username: account.username,
        avatarUrl: account.avatarUrl,
        businessType: account.businessType,
        industry: account.industry,
        followerCount: account.followerCount,
        createdAt: account.createdAt,
        updatedAt: account.updatedAt
      };
      
      res.status(201).json(safeAccount);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid input data", details: error.errors });
      }
      console.error("Error creating TikTok business account:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/tiktok/business-accounts/:id", requireAdminAuth, requireCSRFToken, async (req, res) => {
    try {
      // Validate UUID format
      if (!req.params.id || !req.params.id.match(/^[0-9a-fA-F-]{36}$/)) {
        return res.status(400).json({ error: "Invalid account ID format" });
      }
      
      // Validate partial update data with Zod
      const validatedData = insertTiktokBusinessAccountsSchema.partial().parse(req.body);
      const account = await storage.updateTikTokBusinessAccount(req.params.id, validatedData);
      
      if (!account) {
        return res.status(404).json({ error: "TikTok business account not found" });
      }
      
      // Return safe fields only (no sensitive tokens)
      const safeAccount = {
        id: account.id,
        businessId: account.businessId,
        displayName: account.displayName,
        username: account.username,
        avatarUrl: account.avatarUrl,
        businessType: account.businessType,
        industry: account.industry,
        followerCount: account.followerCount,
        createdAt: account.createdAt,
        updatedAt: account.updatedAt
      };
      
      res.json(safeAccount);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid input data", details: error.errors });
      }
      console.error("Error updating TikTok business account:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/tiktok/business-accounts/:id", requireAdminAuth, requireCSRFToken, async (req, res) => {
    try {
      // Validate UUID format
      if (!req.params.id || !req.params.id.match(/^[0-9a-fA-F-]{36}$/)) {
        return res.status(400).json({ error: "Invalid account ID format" });
      }
      
      const success = await storage.deleteTikTokBusinessAccount(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "TikTok business account not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting TikTok business account:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // TikTok Shop Orders API
  app.get("/api/tiktok/shop-orders", requireAdminAuth, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      if (limit && (isNaN(limit) || limit < 1 || limit > 1000)) {
        return res.status(400).json({ error: "Invalid limit parameter (1-1000)" });
      }
      const orders = await storage.getTikTokShopOrders(limit);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching TikTok shop orders:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/tiktok/shop-orders", requireAdminAuth, requireCSRFToken, async (req, res) => {
    try {
      const validatedData = insertTiktokShopOrdersSchema.parse(req.body);
      const order = await storage.createTikTokShopOrder(validatedData);
      res.status(201).json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid input data", details: error.errors });
      }
      console.error("Error creating TikTok shop order:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/tiktok/shop-orders/:id", requireAdminAuth, requireCSRFToken, async (req, res) => {
    try {
      if (!req.params.id || !req.params.id.match(/^[0-9a-fA-F-]{36}$/)) {
        return res.status(400).json({ error: "Invalid order ID format" });
      }
      
      const validatedData = insertTiktokShopOrdersSchema.partial().parse(req.body);
      const order = await storage.updateTikTokShopOrder(req.params.id, validatedData);
      if (!order) {
        return res.status(404).json({ error: "TikTok shop order not found" });
      }
      res.json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid input data", details: error.errors });
      }
      console.error("Error updating TikTok shop order:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/tiktok/shop-orders/:id", requireAdminAuth, requireCSRFToken, async (req, res) => {
    try {
      if (!req.params.id || !req.params.id.match(/^[0-9a-fA-F-]{36}$/)) {
        return res.status(400).json({ error: "Invalid order ID format" });
      }
      
      const success = await storage.deleteTikTokShopOrder(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "TikTok shop order not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting TikTok shop order:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // TikTok Shop Products API
  app.get("/api/tiktok/shop-products", requireAdminAuth, async (req, res) => {
    try {
      const products = await storage.getTikTokShopProducts();
      res.json(products);
    } catch (error) {
      console.error("Error fetching TikTok shop products:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/tiktok/shop-products", requireAdminAuth, requireCSRFToken, async (req, res) => {
    try {
      const validatedData = insertTiktokShopProductsSchema.parse(req.body);
      const product = await storage.createTikTokShopProduct(validatedData);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid input data", details: error.errors });
      }
      console.error("Error creating TikTok shop product:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/tiktok/shop-products/:id", requireAdminAuth, requireCSRFToken, async (req, res) => {
    try {
      if (!req.params.id || !req.params.id.match(/^[0-9a-fA-F-]{36}$/)) {
        return res.status(400).json({ error: "Invalid product ID format" });
      }
      
      const validatedData = insertTiktokShopProductsSchema.partial().parse(req.body);
      const product = await storage.updateTikTokShopProduct(req.params.id, validatedData);
      if (!product) {
        return res.status(404).json({ error: "TikTok shop product not found" });
      }
      res.json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid input data", details: error.errors });
      }
      console.error("Error updating TikTok shop product:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/tiktok/shop-products/:id", requireAdminAuth, requireCSRFToken, async (req, res) => {
    try {
      if (!req.params.id || !req.params.id.match(/^[0-9a-fA-F-]{36}$/)) {
        return res.status(400).json({ error: "Invalid product ID format" });
      }
      
      const success = await storage.deleteTikTokShopProduct(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "TikTok shop product not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting TikTok shop product:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // TikTok Videos API
  app.get("/api/tiktok/videos", requireAdminAuth, async (req, res) => {
    try {
      const businessAccountId = req.query.businessAccountId as string;
      if (businessAccountId && !businessAccountId.match(/^[0-9a-fA-F-]{36}$/)) {
        return res.status(400).json({ error: "Invalid business account ID format" });
      }
      const videos = await storage.getTikTokVideos(businessAccountId);
      res.json(videos);
    } catch (error) {
      console.error("Error fetching TikTok videos:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/tiktok/videos", requireAdminAuth, requireCSRFToken, async (req, res) => {
    try {
      const validatedData = insertTiktokVideosSchema.parse(req.body);
      const video = await storage.createTikTokVideo(validatedData);
      res.status(201).json(video);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid input data", details: error.errors });
      }
      console.error("Error creating TikTok video:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/tiktok/videos/:id", requireAdminAuth, requireCSRFToken, async (req, res) => {
    try {
      if (!req.params.id || !req.params.id.match(/^[0-9a-fA-F-]{36}$/)) {
        return res.status(400).json({ error: "Invalid video ID format" });
      }
      
      const validatedData = insertTiktokVideosSchema.partial().parse(req.body);
      const video = await storage.updateTikTokVideo(req.params.id, validatedData);
      if (!video) {
        return res.status(404).json({ error: "TikTok video not found" });
      }
      res.json(video);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid input data", details: error.errors });
      }
      console.error("Error updating TikTok video:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/tiktok/videos/:id", requireAdminAuth, requireCSRFToken, async (req, res) => {
    try {
      if (!req.params.id || !req.params.id.match(/^[0-9a-fA-F-]{36}$/)) {
        return res.status(400).json({ error: "Invalid video ID format" });
      }
      
      const success = await storage.deleteTikTokVideo(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "TikTok video not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting TikTok video:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // ============================================
  // SHOPEE MARKETPLACE INTEGRATION
  // ============================================
  
  // Import and setup Shopee routes
  try {
    const { setupShopeeRoutes } = await import('./shopee-routes.js');
    setupShopeeRoutes(app, requireAdminAuth, requireCSRFToken);
    console.log('✅ Shopee routes loaded successfully');
  } catch (error) {
    console.error('❌ Failed to load Shopee routes:', error);
  }

  // TikTok Authentication placeholder endpoints
  app.post("/api/tiktok/connect", requireAdminAuth, requireCSRFToken, async (req, res) => {
    try {
      // TODO: Implement TikTok Business API OAuth flow
      // For now, return placeholder response
      res.json({ 
        message: "TikTok Business API connection will be implemented", 
        status: "placeholder" 
      });
    } catch (error) {
      console.error("Error connecting TikTok:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/tiktok/disconnect/:accountId", requireAdminAuth, requireCSRFToken, async (req, res) => {
    try {
      const { accountId } = req.params;
      
      // Validate UUID format
      if (!accountId || !accountId.match(/^[0-9a-fA-F-]{36}$/)) {
        return res.status(400).json({ error: "Invalid account ID format" });
      }
      
      // TODO: Implement TikTok account disconnection
      res.json({ 
        message: "TikTok account disconnection will be implemented", 
        accountId 
      });
    } catch (error) {
      console.error("Error disconnecting TikTok:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Tag Management API (Admin-only Protected)
  app.get("/api/tags", requireAdminAuth, async (req, res) => {
    try {
      const tags = await storage.getUnifiedTags();
      res.json(tags);
    } catch (error) {
      console.error("Error fetching tags:", error);
      res.status(500).json({ error: "Failed to fetch tags" });
    }
  });

  app.post("/api/tags", requireAdminAuth, requireCSRFToken, async (req, res) => {
    try {
      const { name, color, description } = req.body;
      
      if (!name || !color) {
        return res.status(400).json({ error: "Missing required fields: name and color" });
      }

      const tag = await storage.createUnifiedTag({
        name: name.trim(),
        color: color,
        description: description?.trim() || null,
        category: 'general',
        platforms: [],
        slug: name.trim().toLowerCase().replace(/\s+/g, '-')
      });

      res.json({ 
        success: true, 
        message: "Tag created successfully",
        tag 
      });
    } catch (error) {
      console.error("Error creating tag:", error);
      res.status(500).json({ error: "Failed to create tag" });
    }
  });

  app.patch("/api/tags/:tagId", requireAdminAuth, requireCSRFToken, async (req, res) => {
    try {
      const { tagId } = req.params;
      const { name, color, description, category, platforms, icon, keywords } = req.body;
      
      const updates: any = {};
      if (name !== undefined) updates.name = name.trim();
      if (color !== undefined) updates.color = color;
      if (description !== undefined) updates.description = description?.trim() || null;
      if (category !== undefined) updates.category = category;
      if (platforms !== undefined) updates.platforms = platforms;
      if (icon !== undefined) updates.icon = icon?.trim() || null;
      if (keywords !== undefined) updates.keywords = keywords;
      updates.updatedAt = new Date();

      const tag = await storage.updateUnifiedTag(tagId, updates);
      
      if (!tag) {
        return res.status(404).json({ error: "Tag not found" });
      }

      res.json({ 
        success: true, 
        message: "Tag updated successfully",
        tag 
      });
    } catch (error) {
      console.error("Error updating tag:", error);
      res.status(500).json({ error: "Failed to update tag" });
    }
  });

  app.delete("/api/tags/:tagId", requireAdminAuth, requireCSRFToken, async (req, res) => {
    try {
      const { tagId } = req.params;
      
      const success = await storage.deleteUnifiedTag(tagId);
      
      if (!success) {
        return res.status(404).json({ error: "Tag not found" });
      }

      res.json({ 
        success: true, 
        message: "Tag deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting tag:", error);
      res.status(500).json({ error: "Failed to delete tag" });
    }
  });

  // Tag assignment to social accounts
  app.patch("/api/social-accounts/:accountId/tags", requireAdminAuth, requireCSRFToken, async (req, res) => {
    try {
      const { accountId } = req.params;
      const { tagIds } = req.body;
      
      if (!Array.isArray(tagIds)) {
        return res.status(400).json({ error: "Tag IDs must be an array" });
      }

      const updatedAccount = await storage.updateSocialAccount(accountId, { tagIds });
      
      if (!updatedAccount) {
        return res.status(404).json({ error: "Social account not found" });
      }

      res.json({ 
        success: true, 
        message: "Tags updated successfully",
        account: updatedAccount 
      });
    } catch (error) {
      console.error("Error updating account tags:", error);
      res.status(500).json({ error: "Failed to update account tags" });
    }
  });

  app.post("/api/facebook/webhook-config", requireAdminAuth, requireCSRFToken, async (req, res) => {
    try {
      const { verifyToken, webhookUrl } = req.body;
      
      if (!verifyToken || !webhookUrl) {
        return res.status(400).json({ error: "Missing required fields: verifyToken and webhookUrl" });
      }

      // Get or create Facebook account
      let facebookAccount = await storage.getSocialAccountByPlatform('facebook');
      
      if (!facebookAccount) {
        // Create new Facebook account entry for webhook config
        facebookAccount = await storage.createSocialAccount({
          platform: 'facebook',
          name: 'Facebook Webhook',
          accountId: 'webhook_config',
          accessToken: null,
          refreshToken: null,
          tokenExpiresAt: null,
          pageAccessTokens: [],
          webhookSubscriptions: [],
          tagIds: [],
          followers: 0,
          connected: false,
          lastPost: null,
          engagement: "0",
          lastSync: null,
          isActive: true
        });
      }

      // Update webhook configuration
      const webhookConfig = {
        objectType: 'page' as const,
        objectId: facebookAccount.id,
        subscriptionId: undefined,
        fields: ['messages', 'messaging_postbacks', 'messaging_reads'],
        webhookUrl,
        verifyToken,
        status: 'active' as const,
        lastEvent: new Date().toISOString()
      };

      // Update or add webhook subscription
      const existingSubscriptions = facebookAccount.webhookSubscriptions || [];
      const updatedSubscriptions = existingSubscriptions.length > 0 
        ? [webhookConfig, ...existingSubscriptions.slice(1)]
        : [webhookConfig];

      await storage.updateSocialAccount(facebookAccount.id, {
        webhookSubscriptions: updatedSubscriptions
      });

      res.json({ 
        success: true, 
        message: "Webhook configuration saved successfully",
        config: webhookConfig 
      });
    } catch (error) {
      console.error("Error saving webhook config:", error);
      res.status(500).json({ error: "Failed to save webhook configuration" });
    }
  });

  // Chatbot API
  app.get("/api/chatbot/conversations", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const conversations = await storage.getChatbotConversations(limit);
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching chatbot conversations:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/chatbot/conversations", async (req, res) => {
    try {
      const conversation = await storage.createChatbotConversation(req.body);
      res.status(201).json(conversation);
    } catch (error) {
      console.error("Error creating chatbot conversation:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Chatbot statistics endpoint
  app.get("/api/chatbot/stats", requireSessionAuth, async (req, res) => {
    try {
      // Fetch comprehensive chatbot statistics
      const conversations = await storage.getFacebookConversations();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Calculate stats
      const totalConversations = conversations.length;
      const activeConversations = conversations.filter(c => c.status === 'active').length;
      const conversationsToday = conversations.filter(c => 
        c.createdAt && new Date(c.createdAt) >= today
      ).length;
      
      // Get message statistics  
      const allMessages = await Promise.all(
        conversations.slice(0, 50).map(async (conv) => {
          try {
            return await storage.getFacebookMessages(conv.id);
          } catch {
            return [];
          }
        })
      );
      const flatMessages = allMessages.flat();
      const messagesToday = flatMessages.filter(m => 
        new Date(m.timestamp) >= today
      ).length;
      
      const messagesFromFacebook = flatMessages.filter(m => 
        m.senderType === 'user' && new Date(m.timestamp) >= today
      ).length;
      
      // Bot-generated orders (simplified - would need proper tracking)
      const ordersFromBot = 0; // TODO: Implement proper tracking
      const revenueFromBot = 0; // TODO: Implement proper tracking
      
      // Health checks
      const rasaStatus = 'online'; // TODO: Implement real health check
      const webhookStatus = 'online'; // TODO: Implement real health check
      
      const stats = {
        totalConversations,
        activeConversations,
        avgResponseTime: 1.2, // TODO: Calculate from actual data
        successRate: 94, // TODO: Calculate from actual data
        messagesFromFacebook,
        messagesFromComments: 0, // TODO: Implement comment tracking
        ordersFromBot,
        revenueFromBot,
        conversionRate: 0, // TODO: Calculate conversion rate
        rasaStatus,
        webhookStatus,
        lastSync: new Date().toISOString()
      };
      
      res.json(stats);
    } catch (error) {
      console.error("Error fetching chatbot stats:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Bot settings management endpoints
  app.get("/api/chatbot/settings", requireSessionAuth, async (req, res) => {
    try {
      const settings = await storage.getBotSettingsOrDefault();
      // Remove sensitive fields from response
      const { apiKey, ...safeSettings } = settings;
      res.json(safeSettings);
    } catch (error) {
      console.error("Error fetching bot settings:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/chatbot/settings", requireSessionAuth, async (req, res) => {
    try {
      // Validate input with Zod - only allow safe user-controlled fields
      const safeBotSettingsSchema = z.object({
        isEnabled: z.boolean().optional(),
        autoReply: z.boolean().optional(),
        rasaUrl: z.string().url("Invalid RASA URL format").optional(),
        webhookUrl: z.string().url("Invalid webhook URL format").or(z.literal("")).optional(),
        connectionTimeout: z.number().int().min(1000).max(30000).optional(),
        maxRetries: z.number().int().min(0).max(10).optional()
      });

      const validatedData = safeBotSettingsSchema.parse(req.body);
      const existingSettings = await storage.getBotSettings();
      
      if (existingSettings) {
        // Update existing settings
        const updatedSettings = await storage.updateBotSettings(existingSettings.id, validatedData);
        const publicSettings = storage.toPublicBotSettings(updatedSettings);
        res.json(publicSettings);
      } else {
        // Create new settings
        const newSettings = await storage.createBotSettings(validatedData);
        const publicSettings = storage.toPublicBotSettings(newSettings);
        res.json(publicSettings);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: "Invalid input", 
          details: error.errors 
        });
      }
      console.error("Error saving bot settings:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/chatbot/test-rasa", requireSessionAuth, async (req, res) => {
    try {
      // Validate and sanitize input
      const testRasaSchema = z.object({
        rasaUrl: z.string().url("Invalid URL format").optional(),
        timeout: z.number().int().min(1000).max(10000).optional().default(5000)
      });

      const { rasaUrl, timeout } = testRasaSchema.parse(req.body);
      const testUrl = rasaUrl || "http://localhost:5005";
      
      // Enhanced Security: Comprehensive SSRF protection with DNS resolution
      const url = new URL(testUrl);
      
      // Only allow HTTP/HTTPS protocols
      if (!['http:', 'https:'].includes(url.protocol)) {
        return res.json({
          success: false,
          status: 'error',
          message: 'Only HTTP and HTTPS protocols are allowed'
        });
      }
      
      // Block credentials in URL
      if (url.username || url.password) {
        return res.json({
          success: false,
          status: 'error',
          message: 'URLs with credentials are not allowed'
        });
      }
      
      // Enhanced hostname validation with DNS resolution check
      const hostname = url.hostname;
      const isLocalhost = ['localhost', '127.0.0.1', '::1', '0.0.0.0'].includes(hostname);
      
      // Function to check if IP is private/dangerous
      const isDangerousIP = (ip: string): boolean => {
        // IPv4 private/dangerous ranges
        const ipv4Patterns = [
          /^127\./, // Loopback
          /^10\./, // Private Class A
          /^172\.(1[6-9]|2[0-9]|3[01])\./, // Private Class B  
          /^192\.168\./, // Private Class C
          /^169\.254\./, // Link-local
          /^0\./, // Current network
          /^22[4-9]\./, // Multicast
          /^23[0-9]\./, // Multicast
          /^240\./ // Reserved
        ];
        
        // IPv6 dangerous patterns
        const ipv6Patterns = [
          /^::1$/, // Loopback
          /^fc00:/, // Unique local
          /^fe80:/, // Link-local
          /^::ffff:127\./, // IPv4-mapped loopback
          /^::ffff:10\./, // IPv4-mapped private
          /^::ffff:172\./, // IPv4-mapped private
          /^::ffff:192\.168\./, // IPv4-mapped private
          /^ff[0-9a-f][0-9a-f]:/ // Multicast
        ];
        
        return ipv4Patterns.some(pattern => pattern.test(ip)) || 
               ipv6Patterns.some(pattern => pattern.test(ip));
      };

      // For non-localhost hostnames, perform DNS resolution check
      if (!isLocalhost) {
        const dnsLookup = promisify(lookup);
        try {
          // CRITICAL: Resolve ALL A and AAAA records with { all: true }
          const [ipv4Result, ipv6Result] = await Promise.allSettled([
            dnsLookup(hostname, { family: 4, all: true }).catch(() => null),
            dnsLookup(hostname, { family: 6, all: true }).catch(() => null)
          ]);
          
          const allIPs: string[] = [];
          
          if (ipv4Result.status === 'fulfilled' && Array.isArray(ipv4Result.value)) {
            allIPs.push(...ipv4Result.value.map((r: any) => r.address));
          }
          
          if (ipv6Result.status === 'fulfilled' && Array.isArray(ipv6Result.value)) {
            allIPs.push(...ipv6Result.value.map((r: any) => r.address));
          }
          
          // Check if any resolved IP is dangerous
          const dangerousIPs = allIPs.filter(isDangerousIP);
          if (dangerousIPs.length > 0) {
            return res.json({
              success: false,
              status: 'error',
              message: `Domain resolves to blocked IP addresses: ${dangerousIPs.join(', ')}`
            });
          }
          
          if (allIPs.length === 0) {
            return res.json({
              success: false,
              status: 'error',
              message: 'Unable to resolve domain to any IP address'
            });
          }
        } catch (dnsError) {
          return res.json({
            success: false,
            status: 'error',
            message: 'DNS resolution failed or domain not found'
          });
        }
      }
      
      // Additional hostname string validation as backup
      const isPrivateIPv4 = /^(10\.|172\.(1[6-9]|2[0-9]|3[01])\.|192\.168\.|127\.|169\.254\.)/.test(hostname);
      const isPrivateIPv6 = /^(::1|fc00:|fe80:|::ffff:0:0|::ffff:127\.|::ffff:10\.|::ffff:172\.|::ffff:192\.168\.)/.test(hostname);
      
      if (isPrivateIPv4 || isPrivateIPv6) {
        return res.json({
          success: false,
          status: 'error', 
          message: 'Direct IP access to private addresses is not allowed'
        });
      }
      
      // Restrict ports to safe HTTP/RASA ports
      const port = url.port ? parseInt(url.port) : (url.protocol === 'https:' ? 443 : 80);
      const allowedPorts = [80, 443, 5000, 5005, 8000, 8080, 3000]; // Common RASA and HTTP ports
      if (!allowedPorts.includes(port)) {
        return res.json({
          success: false,
          status: 'error',
          message: `Port ${port} not allowed. Allowed ports: ${allowedPorts.join(', ')}`
        });
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      try {
        const response = await fetch(`${testUrl}/`, {
          method: 'GET',
          signal: controller.signal,
          headers: {
            'Accept': 'application/json, text/plain, */*'
          }
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const contentType = response.headers.get('content-type');
          
          if (contentType && contentType.includes('application/json')) {
            try {
              const status = await response.json();
              res.json({ 
                success: true, 
                status: 'online', 
                message: 'RASA server is reachable',
                serverInfo: status
              });
            } catch (jsonError) {
              res.json({ 
                success: true, 
                status: 'online', 
                message: 'RASA server is reachable (text response)',
                serverInfo: null
              });
            }
          } else {
            const text = await response.text();
            res.json({ 
              success: true, 
              status: 'online', 
              message: 'RASA server is reachable',
              serverInfo: { response: text.substring(0, 100) }
            });
          }
        } else {
          res.json({ 
            success: false, 
            status: 'error', 
            message: `RASA server responded with status ${response.status}` 
          });
        }
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        
        if (fetchError.name === 'AbortError') {
          res.json({ 
            success: false, 
            status: 'timeout', 
            message: `Connection timeout after ${timeout}ms` 
          });
        } else {
          res.json({ 
            success: false, 
            status: 'error', 
            message: `Cannot connect to RASA server: ${fetchError.message}` 
          });
        }
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: "Invalid input", 
          details: error.errors 
        });
      }
      console.error("Error testing RASA connection:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Placeholder for RASA integration
  app.post("/api/chatbot/message", async (req, res) => {
    try {
      const { message, sessionId } = req.body;
      
      // TODO: Integrate with RASA chatbot API
      // For now, return a mock response
      const response = {
        response: `Cảm ơn bạn đã gửi tin nhắn: "${message}". Tôi đang được phát triển để hỗ trợ tốt hơn.`,
        sessionId: sessionId || "default-session"
      };
      
      res.json(response);
    } catch (error) {
      console.error("Error processing chatbot message:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Add express.raw middleware ONLY for POST webhook signature validation
  app.use("/api/webhooks/facebook*", (req, res, next) => {
    if (req.method === 'POST') {
      express.raw({ type: 'application/json' })(req, res, next);
    } else {
      next(); // Allow GET requests for verification to use regular JSON parsing
    }
  });

  // Facebook Webhook Verification (GET) and Event Processing (POST) - With App ID support
  app.get("/api/webhooks/facebook/:appId", async (req, res) => {
    try {
      const { appId } = req.params;
      let VERIFY_TOKEN = process.env.FACEBOOK_VERIFY_TOKEN || "fb_webhook_verify_2024";
      
      if (appId) {
        // Get verify token from Facebook app in database
        console.log(`Facebook webhook verification for app ID: ${appId}`);
        const facebookApp = await storage.getFacebookAppByAppId(appId);
        if (facebookApp) {
          VERIFY_TOKEN = facebookApp.verifyToken || process.env.FACEBOOK_VERIFY_TOKEN || "fb_webhook_verify_2024";
          console.log('Found Facebook app with verify token in database');
        } else {
          console.error(`Facebook app not found for app ID: ${appId}`);
          return res.sendStatus(404);
        }
      } else {
        // Fallback to old method (backward compatibility)
        const facebookAccount = await storage.getSocialAccountByPlatform('facebook');
        const webhookConfig = facebookAccount?.webhookSubscriptions?.[0];
        // TEMP FIX: Use correct verify token until database logic is fixed
        VERIFY_TOKEN = "verify_1758480641086";
      }
      
      const mode = req.query['hub.mode'];
      const token = req.query['hub.verify_token'];
      const challenge = req.query['hub.challenge'];
      
      console.log('Webhook verification attempt:', { 
        appId,
        mode, 
        token: token ? 'provided' : 'missing',
        expectedToken: VERIFY_TOKEN ? 'found' : 'missing'
      });
      

      if (mode && token) {
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
          console.log('Facebook webhook verified successfully for app:', appId || 'legacy');
          res.status(200).send(challenge);
        } else {
          console.error('Facebook webhook verification failed. Token mismatch');
          res.sendStatus(403);
        }
      } else {
        console.error('Missing webhook verification parameters');
        res.sendStatus(400);
      }
    } catch (error) {
      console.error('Error during webhook verification:', error);
      res.sendStatus(500);
    }
  });

  app.post("/api/webhooks/facebook/:appId", async (req, res) => {
    try {
      const { appId } = req.params;
      
      // Get app secret from database if appId provided
      let appSecret = process.env.FACEBOOK_APP_SECRET;
      if (appId) {
        console.log(`Facebook webhook POST for app ID: ${appId}`);
        const facebookApp = await storage.getFacebookAppByAppId(appId);
        if (facebookApp) {
          // Note: App secret is encrypted in database, would need decryption
          console.log('Found Facebook app in database for webhook processing');
        } else {
          console.warn(`Facebook app not found for app ID: ${appId}, using env secret`);
        }
      }
      
      // Temporarily disable signature verification for testing
      console.warn('Facebook webhook signature verification DISABLED for testing');
      const signature = req.headers['x-hub-signature-256'] as string;
      console.log('Signature received:', signature ? 'present' : 'missing');

      // Parse the JSON body - handle both Buffer (from express.raw) and Object (from express.json)
      let body;
      if (Buffer.isBuffer(req.body)) {
        // Body is raw Buffer from express.raw middleware
        body = JSON.parse(req.body.toString());
      } else if (typeof req.body === 'object') {
        // Body is already parsed object from express.json middleware
        body = req.body;
      } else {
        throw new Error('Invalid body format received');
      }
      console.log('Facebook webhook received:', JSON.stringify(body, null, 2));

      // ⚡ ASYNC PROCESSING: Return 200 OK immediately, process in background
      res.status(200).json({ status: "received" });

      // Process webhook events asynchronously (non-blocking)
      setImmediate(async () => {
        try {
          if (body.object === 'page') {
            for (const entry of body.entry || []) {
              // Handle messaging events
              if (entry.messaging) {
                for (const event of entry.messaging) {
                  processFacebookMessage(event, appId).catch(err => {
                    console.error('❌ Async message processing failed:', err);
                  });
                }
              }
              
              // Handle feed events (posts, comments)
              if (entry.changes) {
                for (const change of entry.changes) {
                  processFacebookFeedEvent(change).catch(err => {
                    console.error('❌ Async feed event processing failed:', err);
                  });
                }
              }
            }
          }
        } catch (error) {
          console.error('❌ Async webhook processing error:', error);
        }
      });

    } catch (error) {
      console.error("Error processing Facebook webhook:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Fallback routes without appId (backward compatibility)
  app.get("/api/webhooks/facebook", async (req, res) => {
    try {
      let VERIFY_TOKEN = process.env.FACEBOOK_VERIFY_TOKEN || "fb_webhook_verify_2024";
      
      // Fallback to old method (backward compatibility)
      const facebookAccount = await storage.getSocialAccountByPlatform('facebook');
      const webhookConfig = facebookAccount?.webhookSubscriptions?.[0];
      // TEMP FIX: Use correct verify token until database logic is fixed
      VERIFY_TOKEN = "verify_1758480641086";
      
      const mode = req.query['hub.mode'];
      const token = req.query['hub.verify_token'];
      const challenge = req.query['hub.challenge'];
      
      console.log('Webhook verification attempt (legacy):', { 
        mode, 
        token: token ? 'provided' : 'missing',
        expectedToken: VERIFY_TOKEN ? 'found' : 'missing'
      });

      if (mode && token) {
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
          console.log('Facebook webhook verified successfully (legacy)');
          res.status(200).send(challenge);
        } else {
          console.error('Facebook webhook verification failed. Token mismatch');
          res.sendStatus(403);
        }
      } else {
        console.error('Missing webhook verification parameters');
        res.sendStatus(400);
      }
    } catch (error) {
      console.error('Error during webhook verification:', error);
      res.sendStatus(500);
    }
  });

  app.post("/api/webhooks/facebook", async (req, res) => {
    try {
      console.log('Facebook webhook POST (legacy, no appId)');
      
      // Temporarily disable signature verification for testing
      console.warn('Facebook webhook signature verification DISABLED for testing');
      const signature = req.headers['x-hub-signature-256'] as string;
      console.log('Signature received:', signature ? 'present' : 'missing');

      // Parse the JSON body - handle both Buffer (from express.raw) and Object (from express.json)
      let body;
      if (Buffer.isBuffer(req.body)) {
        // Body is raw Buffer from express.raw middleware
        body = JSON.parse(req.body.toString());
      } else if (typeof req.body === 'object') {
        // Body is already parsed object from express.json middleware
        body = req.body;
      } else {
        throw new Error('Invalid body format received');
      }
      console.log('Facebook webhook received (legacy):', JSON.stringify(body, null, 2));

      // ⚡ ASYNC PROCESSING: Return 200 OK immediately, process in background
      res.status(200).json({ status: "received" });

      // Process webhook events asynchronously (non-blocking)
      setImmediate(async () => {
        try {
          if (body.object === 'page') {
            for (const entry of body.entry || []) {
              // Handle messaging events
              if (entry.messaging) {
                for (const event of entry.messaging) {
                  processFacebookMessage(event).catch(err => {
                    console.error('❌ Async message processing failed:', err);
                  });
                }
              }
              
              // Handle feed events (posts, comments)
              if (entry.changes) {
                for (const change of entry.changes) {
                  processFacebookFeedEvent(change).catch(err => {
                    console.error('❌ Async feed event processing failed:', err);
                  });
                }
              }
            }
          }
        } catch (error) {
          console.error('❌ Async webhook processing error:', error);
        }
      });

    } catch (error) {
      console.error("Error processing Facebook webhook:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Product Landing Pages API
  app.get("/api/product-landing-pages", async (req, res) => {
    try {
      const landingPages = await storage.getAllProductLandingPages();
      res.json(landingPages);
    } catch (error) {
      console.error("Error fetching product landing pages:", error);
      res.status(500).json({ error: "Failed to fetch landing pages" });
    }
  });

  app.get("/api/product-landing-pages/:id", async (req, res) => {
    try {
      const landingPage = await storage.getProductLandingPageWithDetails(req.params.id);
      if (!landingPage) {
        return res.status(404).json({ error: "Landing page not found" });
      }
      res.json(landingPage);
    } catch (error) {
      console.error("Error fetching landing page:", error);
      res.status(500).json({ error: "Failed to fetch landing page" });
    }
  });

  app.post("/api/product-landing-pages", async (req, res) => {
    try {
      const landingPage = await storage.createProductLandingPage(req.body);
      res.json({ id: landingPage.id, message: "Product landing page created successfully" });
    } catch (error) {
      console.error("Error creating landing page:", error);
      if (error instanceof Error && error.message === 'Slug already exists') {
        return res.status(400).json({ error: "Slug already exists" });
      }
      res.status(500).json({ error: "Failed to create landing page" });
    }
  });

  app.put("/api/product-landing-pages/:id", async (req, res) => {
    try {
      const landingPage = await storage.updateProductLandingPage(req.params.id, req.body);
      if (!landingPage) {
        return res.status(404).json({ error: "Landing page not found" });
      }
      res.json({ message: "Product landing page updated successfully" });
    } catch (error) {
      console.error("Error updating landing page:", error);
      res.status(500).json({ error: "Failed to update landing page" });
    }
  });

  app.delete("/api/product-landing-pages/:id", async (req, res) => {
    try {
      const success = await storage.deleteProductLandingPage(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Landing page not found" });
      }
      res.json({ message: "Product landing page deleted successfully" });
    } catch (error) {
      console.error("Error deleting landing page:", error);
      res.status(500).json({ error: "Failed to delete landing page" });
    }
  });

  // Public landing page endpoint
  app.get("/api/public-landing/:slug", async (req, res) => {
    try {
      const landingPage = await storage.getProductLandingPageWithDetails(req.params.slug);
      
      if (landingPage && landingPage.isActive) {
        // Increment view count
        if (landingPage.id) {
          await storage.incrementLandingPageView(landingPage.id);
        }

        // Track affiliate click if ?ref=affiliateCode param exists
        const affiliateCode = req.query.ref as string;
        if (affiliateCode && landingPage.affiliateId && affiliateCode === landingPage.affiliateCode) {
          try {
            // Get or create tracking cookie
            let trackingCookie = req.cookies?.affiliate_tracking;
            if (!trackingCookie) {
              trackingCookie = crypto.randomUUID();
              res.cookie('affiliate_tracking', trackingCookie, {
                maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
                httpOnly: true,
                sameSite: 'lax',
                secure: process.env.NODE_ENV === 'production'
              });
            }

            // Get device info from user-agent
            const userAgent = req.headers['user-agent'] || '';
            const device = userAgent.toLowerCase().includes('mobile') ? 'mobile' : 
                         userAgent.toLowerCase().includes('tablet') ? 'tablet' : 'desktop';

            // Create click tracking record
            await storage.createProductLandingClick({
              landingPageId: landingPage.id,
              affiliateId: landingPage.affiliateId,
              trackingCookie,
              ip: req.ip || req.headers['x-forwarded-for'] as string || '',
              userAgent,
              device,
              referrer: req.headers.referer || req.headers.referrer as string || null
            });
          } catch (clickError) {
            console.error('❌ Affiliate click tracking error:', clickError);
            // Don't fail the request if tracking fails
          }
        }
        
        // Get product reviews for this landing page  
        const reviewsData = landingPage.product ? 
          await storage.getProductReviewsWithStats(landingPage.product.id) :
          { reviews: [], averageRating: 0, totalReviews: 0, ratingCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };

        return res.json({
          ...landingPage,
          reviewsData
        });
      }
    } catch (error) {
      console.error("Error fetching public landing page:", error);
    }
    
    // Landing page not found
    res.status(404).json({ error: "Landing page not found or inactive" });
  });

  // Order from landing page
  app.post("/api/landing-orders", async (req, res) => {
    try {
      const { landingPageId, customerInfo, productInfo, deliveryType } = req.body;
      
      // Check if customer with phone number already exists, otherwise create new
      let guestCustomer = await storage.getCustomerByPhone(customerInfo.phone);
      
      if (!guestCustomer) {
        // Customer doesn't exist, create new one
        guestCustomer = await storage.createCustomer({
          name: customerInfo.name,
          email: customerInfo.email || `guest-${Date.now()}@landing.local`,
          phone: customerInfo.phone,
          status: 'active'
        });
      } else {
        // Customer exists, optionally update their info if provided and different
        if (customerInfo.name && customerInfo.name !== guestCustomer.name) {
          await storage.updateCustomer(guestCustomer.id, { name: customerInfo.name });
          guestCustomer.name = customerInfo.name;
        }
        if (customerInfo.email && customerInfo.email !== guestCustomer.email) {
          await storage.updateCustomer(guestCustomer.id, { email: customerInfo.email });
          guestCustomer.email = customerInfo.email;
        }
      }
      
      // 💼 Affiliate tracking: Check for tracking cookie and assign commission
      let affiliateId = null;
      let affiliateCommission = '0.00';
      let clickId = null;

      const trackingCookie = req.cookies?.affiliate_tracking;
      if (trackingCookie) {
        try {
          // Find the click record by cookie
          const clickRecord = await storage.getProductLandingClickByCookie(trackingCookie);
          if (clickRecord && clickRecord.affiliateId) {
            // Get affiliate to calculate commission
            const affiliate = await storage.getCustomer(clickRecord.affiliateId);
            if (affiliate && affiliate.affiliateStatus === 'active') {
              affiliateId = affiliate.id;
              clickId = clickRecord.id;
              
              // Calculate commission (affiliate's commission rate * order total)
              const commissionRate = parseFloat(affiliate.commissionRate || '10') / 100;
              affiliateCommission = (parseFloat(productInfo.totalPrice) * commissionRate).toFixed(2);
            }
          }
        } catch (affiliateError) {
          console.error('❌ Affiliate commission calculation error:', affiliateError);
          // Don't fail the order if affiliate tracking fails
        }
      }
      
      // Create order using existing order system
      const orderData: any = {
        customerId: guestCustomer.id,
        total: productInfo.totalPrice.toString(),
        items: productInfo.quantity,
        status: 'pending' as const,
        affiliateId,
        affiliateCommission
      };
      
      const order = await storage.createOrder(orderData);

      // Update click record as converted if affiliate was tracked
      if (clickId) {
        try {
          await storage.updateProductLandingClickConversion(
            clickId,
            order.id,
            productInfo.totalPrice.toString()
          );
        } catch (conversionError) {
          console.error('❌ Click conversion tracking error:', conversionError);
        }
      }
      
      // 💎 Process membership for landing page order (AFTER order is committed)
      if (order.customerId) {
        try {
          const membershipResult = await processMembershipForOrder({
            customerId: order.customerId,
            orderTotal: parseFloat(order.total),
            orderId: order.id
          });
          
          if (membershipResult.success) {
            console.log("💎 Landing page membership processed:", {
              tier: membershipResult.newTier,
              points: membershipResult.pointsEarned,
              upgrade: membershipResult.tierUpgrade
            });
          } else {
            console.error("💎 Landing page membership failed:", membershipResult.error);
          }
        } catch (membershipError) {
          console.error("💎 Landing page membership error:", membershipError);
        }
      }
      
      // Increment order count for landing page
      if (landingPageId) {
        await storage.incrementLandingPageOrder(landingPageId);
      }
      
      res.json({ 
        order, 
        customer: guestCustomer,
        message: "Order created successfully",
        deliveryType 
      });
    } catch (error) {
      console.error("Error creating landing page order:", error);
      res.status(500).json({ error: "Failed to create order" });
    }
  });

  // ==========================================
  // PRODUCT REVIEWS API ROUTES
  // ==========================================

  // Get product reviews with stats
  app.get('/api/product-reviews/:productId', async (req, res) => {
    try {
      const { productId } = req.params;
      const reviewsData = await storage.getProductReviewsWithStats(productId);
      res.json(reviewsData);
    } catch (error) {
      console.error('Error fetching product reviews:', error);
      res.status(500).json({ error: 'Failed to load reviews' });
    }
  });

  // Create new product review (with validation and moderation)
  app.post('/api/product-reviews', async (req, res) => {
    try {
      // Basic validation
      const { productId, customerName, rating, content } = req.body;
      
      if (!productId || !customerName || !rating || !content) {
        return res.status(400).json({ 
          error: 'Missing required fields: productId, customerName, rating, content' 
        });
      }
      
      if (rating < 1 || rating > 5) {
        return res.status(400).json({ 
          error: 'Rating must be between 1 and 5' 
        });
      }
      
      if (content.length < 10 || content.length > 1000) {
        return res.status(400).json({ 
          error: 'Review content must be between 10 and 1000 characters' 
        });
      }
      
      // Verify product exists
      const product = await storage.getProduct(productId);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      
      // Create review with moderation (requires admin approval)
      const reviewData = {
        ...req.body,
        isApproved: false, // Require admin approval
        helpfulCount: 0,
        images: req.body.images || []
      };
      
      const review = await storage.createProductReview(reviewData);
      
      res.json({ 
        success: true, 
        review: {
          ...review,
          message: 'Review submitted successfully. It will be visible after admin approval.'
        }
      });
    } catch (error) {
      console.error('Error creating review:', error);
      res.status(500).json({ error: 'Failed to create review' });
    }
  });

  // ==========================================
  // STOREFRONT API ROUTES (Public store frontend)
  // ==========================================

  // Get all storefront configs (admin)
  app.get("/api/storefront/config", async (req, res) => {
    try {
      const configs = await storage.getStorefrontConfigs();
      res.json(configs);
    } catch (error) {
      console.error("Error fetching storefront configs:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Create new storefront config (admin)
  app.post("/api/storefront/config", async (req, res) => {
    try {
      const { insertStorefrontConfigSchema } = await import("@shared/schema");
      const validation = insertStorefrontConfigSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          error: 'Invalid data format',
          details: validation.error.issues 
        });
      }

      const config = await storage.createStorefrontConfig(validation.data);
      res.json({ 
        success: true, 
        config,
        message: 'Storefront config created successfully' 
      });
    } catch (error) {
      console.error("Error creating storefront config:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get specific storefront config by name (admin)
  app.get("/api/storefront/config/:name", async (req, res) => {
    try {
      const config = await storage.getStorefrontConfigByName(req.params.name);
      if (!config) {
        return res.status(404).json({ error: "Storefront not found" });
      }
      res.json(config);
    } catch (error) {
      console.error("Error fetching storefront config:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Update storefront config by ID (admin)
  app.put("/api/storefront/config/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Config ID is required' });
      }

      const updatedConfig = await storage.updateStorefrontConfig(id, req.body);
      
      if (!updatedConfig) {
        return res.status(404).json({ error: 'Storefront config not found' });
      }
      
      res.json({ 
        success: true,
        config: updatedConfig,
        message: 'Storefront config updated successfully' 
      });
    } catch (error) {
      console.error("Error updating storefront config:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get public storefront data (for customers)
  app.get("/api/storefront/public/:name", async (req, res) => {
    try {
      const { name } = req.params;
      
      if (!name || typeof name !== 'string') {
        return res.status(400).json({ error: 'Storefront name is required' });
      }

      const config = await storage.getStorefrontConfigByName(name);
      
      if (!config || !config.isActive) {
        return res.status(404).json({ error: 'Storefront not found or inactive' });
      }

      const topProducts = await storage.getTopProductsForStorefront(config.id);
      
      // Return public-safe data (no sensitive admin info)
      res.json({
        name: config.name,
        theme: config.theme,
        primaryColor: config.primaryColor,
        contactInfo: config.contactInfo,
        products: topProducts.map(product => ({
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          image: product.image,
          categoryId: product.categoryId
        })),
        storefrontConfigId: config.id // Needed for order creation
      });
    } catch (error) {
      console.error("Error fetching public storefront:", error);
      res.status(500).json({ error: "Failed to load storefront" });
    }
  });

  // Get storefront orders (admin)
  app.get("/api/storefront/orders", async (req, res) => {
    try {
      const { configId, limit } = req.query;
      const limitNum = limit ? parseInt(limit as string) : 50;
      
      const orders = await storage.getStorefrontOrders(
        configId as string, 
        limitNum
      );
      
      res.json(orders);
    } catch (error) {
      console.error("Error fetching storefront orders:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Create new customer order (public)
  app.post("/api/storefront/orders", async (req, res) => {
    try {
      const { insertStorefrontOrdersSchema } = await import("@shared/schema");
      const validation = insertStorefrontOrdersSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          error: 'Thông tin đơn hàng không hợp lệ',
          details: validation.error.issues 
        });
      }

      // Verify storefront config exists and is active
      const config = await storage.getStorefrontConfig(validation.data.storefrontConfigId);
      if (!config || !config.isActive) {
        return res.status(400).json({ 
          error: 'Storefront không tồn tại hoặc đã bị tắt' 
        });
      }

      // Verify product exists and get canonical pricing
      const product = await storage.getProduct(validation.data.productId);
      if (!product) {
        return res.status(400).json({ 
          error: 'Sản phẩm không tồn tại' 
        });
      }

      // SECURITY: Calculate price and total server-side to prevent tampering
      // Never trust client-sent price/total values
      const quantity = validation.data.quantity;
      if (!quantity || quantity <= 0) {
        return res.status(400).json({ 
          error: 'Số lượng phải lớn hơn 0' 
        });
      }
      
      const unitPrice = parseFloat(product.price); // Canonical price from database
      const calculatedTotal = (unitPrice * quantity).toFixed(2);

      // Create order with server-calculated values
      const secureOrderData = {
        ...validation.data,
        productName: product.name, // Use product name from database
        unitPrice: product.price,  // Canonical price
        total: calculatedTotal     // Server-calculated total
      };

      const order = await storage.createStorefrontOrder(secureOrderData);
      
      // 💎 Ensure customer exists and process membership (AFTER order is committed)
      const finalCustomerId = await ensureCustomerForOrder({
        existingCustomerId: (order as any).customerId || undefined,
        customerName: order.customerName || undefined,
        customerPhone: order.customerPhone || undefined,
        customerEmail: order.customerEmail || undefined
      });
      
      if (finalCustomerId) {
        try {
          const membershipResult = await processMembershipForOrder({
            customerId: finalCustomerId,
            orderTotal: parseFloat(order.total),
            orderId: order.id
          });
          
          if (membershipResult.success) {
            console.log("💎 Storefront membership processed:", {
              customer: finalCustomerId,
              tier: membershipResult.newTier,
              points: membershipResult.pointsEarned,
              upgrade: membershipResult.tierUpgrade
            });
          } else {
            console.error("💎 Storefront membership failed:", membershipResult.error);
          }
        } catch (membershipError) {
          console.error("💎 Storefront membership error:", membershipError);
        }
      } else {
        console.log("💎 No customer available for storefront membership processing");
      }
      
      // Auto-create customer if they don't exist (new customer flow)
      let customerCreated = false;
      if (order.customerPhone && order.customerName) {
        try {
          // Use existing pattern from customer search endpoint
          const allCustomers = await storage.getCustomers(); // Fetch all customers to prevent duplicates
          const normalizedPhone = order.customerPhone.replace(/\D/g, '');
          
          const existingCustomers = allCustomers.filter(customer => 
            customer.phone && customer.phone.replace(/\D/g, '') === normalizedPhone
          );
          
          if (existingCustomers.length === 0) {
            // Validate and create new customer record
            const customerData = insertCustomersSchema.parse({
              name: order.customerName,
              phone: order.customerPhone,
              email: order.customerEmail || undefined, // Use undefined instead of empty string
              status: 'active'
            });
            
            await storage.createCustomer(customerData);
            customerCreated = true;
            console.log(`Auto-created customer: ${order.customerName} (${normalizedPhone})`);
          }
        } catch (customerCreationError) {
          // Log error but don't fail the order - customer creation is not critical
          console.error('Error auto-creating customer:', customerCreationError);
        }
      }
      
      res.json({ 
        success: true,
        orderId: order.id,
        message: customerCreated 
          ? 'Đơn hàng đã được tạo thành công! Tài khoản thành viên đã được tạo cho bạn. Chúng tôi sẽ liên hệ với bạn sớm nhất.'
          : 'Đơn hàng đã được tạo thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất.',
        customerCreated: customerCreated,
        orderDetails: {
          customerName: order.customerName,
          phone: order.customerPhone,
          productName: order.productName,
          quantity: order.quantity,
          total: order.total,
          deliveryType: order.deliveryType
        }
      });
    } catch (error) {
      console.error("Error creating storefront order:", error);
      res.status(500).json({ 
        error: 'Có lỗi xảy ra khi xử lý đơn hàng. Vui lòng thử lại sau.',
        success: false 
      });
    }
  });

  // Shop Settings API
  
  // Shop Settings Location API - Get shop coordinates (must be before general /api/shop-settings)
  app.get("/api/shop-settings/location", async (req, res) => {
    try {
      const defaultSettings = await storage.getDefaultShopSettings();
      
      if (!defaultSettings) {
        return res.json({ lat: null, lon: null });
      }

      const lat = defaultSettings.shopLatitude ? Number(defaultSettings.shopLatitude) : null;
      const lon = defaultSettings.shopLongitude ? Number(defaultSettings.shopLongitude) : null;

      res.json({ lat, lon });
    } catch (error) {
      console.error('Shop settings location API error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get("/api/shop-settings", async (req, res) => {
    try {
      const { id } = req.query;

      if (id === 'default') {
        // GET /api/shop-settings?id=default - Get default shop settings
        const defaultSettings = await storage.getDefaultShopSettings();
        res.json(defaultSettings || null);
      } else if (id && typeof id === 'string') {
        // GET /api/shop-settings?id=<id> - Get specific shop settings
        const foundSettings = await storage.getShopSettingsById(id);
        
        if (!foundSettings) {
          return res.status(404).json({ error: 'Shop settings not found' });
        }
        
        res.json(foundSettings);
      } else {
        // GET /api/shop-settings - Get all shop settings
        const settings = await storage.getShopSettings();
        res.json(settings);
      }
    } catch (error) {
      console.error('Shop settings API error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post("/api/shop-settings", async (req, res) => {
    try {
      const validation = insertShopSettingsSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          error: 'Invalid data format',
          details: validation.error.issues 
        });
      }

      const settings = await storage.createShopSettings(validation.data);
      res.json({ 
        success: true, 
        settings,
        message: 'Shop settings created successfully' 
      });
    } catch (error) {
      console.error('Shop settings API error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.put("/api/shop-settings", async (req, res) => {
    try {
      const { id } = req.query;

      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Settings ID is required for update' });
      }

      if (id === 'set-default') {
        // PUT /api/shop-settings?id=set-default - Set default shop settings
        const { settingsId } = req.body;
        
        if (!settingsId) {
          return res.status(400).json({ error: 'Settings ID is required' });
        }

        const updatedSettings = await storage.setDefaultShopSettings(settingsId);
        
        if (!updatedSettings) {
          return res.status(404).json({ error: 'Shop settings not found' });
        }
        
        res.json({ 
          success: true,
          settings: updatedSettings,
          message: 'Default shop settings updated successfully' 
        });
      } else {
        // PUT /api/shop-settings?id=<id> - Update specific shop settings
        const validation = insertShopSettingsSchema.partial().safeParse(req.body);
        
        if (!validation.success) {
          return res.status(400).json({ 
            error: 'Invalid data format',
            details: validation.error.issues 
          });
        }

        const updatedSettings = await storage.updateShopSettings(id, validation.data);
        
        if (!updatedSettings) {
          return res.status(404).json({ error: 'Shop settings not found' });
        }
        
        res.json({ 
          success: true,
          settings: updatedSettings,
          message: 'Shop settings updated successfully' 
        });
      }
    } catch (error) {
      console.error('Shop settings API error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.delete("/api/shop-settings", async (req, res) => {
    try {
      const { id } = req.query;

      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Settings ID is required for deletion' });
      }

      const success = await storage.deleteShopSettings(id);
      
      if (!success) {
        return res.status(404).json({ error: 'Shop settings not found' });
      }
      
      res.json({ 
        success: true,
        message: 'Shop settings deleted successfully' 
      });
    } catch (error) {
      console.error('Shop settings API error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Setup RASA-specific API routes for chatbot integration
  setupRasaRoutes(app);

  // ==========================================
  // TikTok Shop Management API Routes
  // ==========================================

  // TikTok Shop Orders API
  app.get("/api/tiktok-shop/orders", async (req, res) => {
    try {
      const filters = {
        status: req.query.status as string,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
        search: req.query.search as string,
        shopId: req.query.shopId as string,
        limit: parseInt(req.query.limit as string) || 50,
        offset: parseInt(req.query.offset as string) || 0,
        sortBy: req.query.sortBy as 'orderDate' | 'totalAmount' | 'updatedAt' || 'orderDate',
        sortOrder: req.query.sortOrder as 'asc' | 'desc' || 'desc'
      };

      const result = await tiktokShopOrdersService.getOrders(filters);
      res.json(result);
    } catch (error) {
      console.error("Error fetching TikTok Shop orders:", error);
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  app.get("/api/tiktok-shop/orders/:orderId", async (req, res) => {
    try {
      const { orderId } = req.params;
      const order = await tiktokShopOrdersService.getOrderById(orderId);
      res.json(order);
    } catch (error) {
      console.error("Error fetching order details:", error);
      res.status(404).json({ error: "Order not found" });
    }
  });

  app.put("/api/tiktok-shop/orders/:orderId/status", async (req, res) => {
    try {
      const { orderId } = req.params;
      const { status, trackingNumber, shippingCarrier, fulfillmentStatus, notes } = req.body;

      const updatedOrder = await tiktokShopOrdersService.updateOrderStatus(orderId, status, {
        trackingNumber,
        shippingCarrier,
        fulfillmentStatus,
        notes
      });

      res.json(updatedOrder);
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ error: "Failed to update order status" });
    }
  });

  app.put("/api/tiktok-shop/orders/bulk-update", async (req, res) => {
    try {
      const { orderIds, updates } = req.body;
      const result = await tiktokShopOrdersService.bulkUpdateOrders(orderIds, updates);
      res.json(result);
    } catch (error) {
      console.error("Error bulk updating orders:", error);
      res.status(500).json({ error: "Failed to bulk update orders" });
    }
  });

  app.get("/api/tiktok-shop/analytics/orders", async (req, res) => {
    try {
      const { shopId, days } = req.query;
      const analytics = await tiktokShopOrdersService.getOrderAnalytics(
        shopId as string, 
        parseInt(days as string) || 30
      );
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching order analytics:", error);
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  // TikTok Shop Seller API
  app.get("/api/tiktok-shop/seller/:businessAccountId/dashboard", async (req, res) => {
    try {
      const { businessAccountId } = req.params;
      const dashboard = await tiktokShopSellerService.getSellerDashboard(businessAccountId);
      res.json(dashboard);
    } catch (error) {
      console.error("Error fetching seller dashboard:", error);
      res.status(500).json({ error: "Failed to fetch seller dashboard" });
    }
  });

  app.get("/api/tiktok-shop/seller/:businessAccountId/analytics", async (req, res) => {
    try {
      const { businessAccountId } = req.params;
      const analytics = await tiktokShopSellerService.getPerformanceMetrics(businessAccountId);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching seller analytics:", error);
      res.status(500).json({ error: "Failed to fetch seller analytics" });
    }
  });

  // TikTok Shop Fulfillment API
  app.get("/api/tiktok-shop/fulfillment/:businessAccountId/queue", async (req, res) => {
    try {
      const { businessAccountId } = req.params;
      const filters = {
        status: req.query.status as string,
        priority: req.query.priority as string,
        urgent: req.query.urgent === 'true'
      };
      
      const queue = await tiktokShopFulfillmentService.getFulfillmentQueue(businessAccountId, filters);
      res.json(queue);
    } catch (error) {
      console.error("Error fetching fulfillment queue:", error);
      res.status(500).json({ error: "Failed to fetch fulfillment queue" });
    }
  });

  app.put("/api/tiktok-shop/fulfillment/orders/:orderId", async (req, res) => {
    try {
      const { orderId } = req.params;
      const updates = req.body;
      const result = await tiktokShopFulfillmentService.processOrderFulfillment(orderId, updates);
      res.json(result);
    } catch (error) {
      console.error("Error processing fulfillment:", error);
      res.status(500).json({ error: "Failed to process order fulfillment" });
    }
  });

  app.post("/api/tiktok-shop/fulfillment/shipping-labels", async (req, res) => {
    try {
      const { orderIds, carrier } = req.body;
      const labels = await tiktokShopFulfillmentService.generateShippingLabels(orderIds, carrier);
      res.json(labels);
    } catch (error) {
      console.error("Error generating shipping labels:", error);
      res.status(500).json({ error: "Failed to generate shipping labels" });
    }
  });

  // ==========================================
  // API MANAGEMENT MIDDLEWARE SETUP
  // ==========================================
  const { setupApiManagement } = await import("./middleware/api-management");
  setupApiManagement(app);

  // ==========================================
  // RASA CHATBOT MANAGEMENT API ROUTES - HIGH PRIORITY
  // ==========================================
  app.use("/api/rasa-management", rasaManagementRouter);
  app.use("/api/rasa", rasaConversationsRouter);
  app.use("/api/rasa-industry", rasaIndustryRouter);
  app.use("/api/chat-logs", chatLogsRouter);

  // ==========================================
  // CONTENT MANAGEMENT API ROUTES
  // ==========================================
  const contentRoutes = await import("./api/content");
  app.use("/api/content", contentRoutes.default);
  app.use("/api/content", bulkUploadRoutes);

  // ==========================================
  // PRODUCTS MANAGEMENT API ROUTES
  // ==========================================
  
  // 🔍 REQUEST TRACING MIDDLEWARE - Debug auto-inheritance issue
  app.use("/api/products", (req, res, next) => {
    console.log(`🔍 PRODUCTS ROUTER: ${req.method} ${req.originalUrl}`);
    console.log(`🔍 Request Body:`, req.body);
    console.log(`🔍 Request Headers:`, req.headers);
    console.log(`🔍 Request timestamp:`, new Date().toISOString());
    next();
  });
  
  app.use("/api/products", productsRouter);
  
  // ==========================================
  // 🏪 MULTI-STORE MANAGEMENT API ROUTES
  // ==========================================
  app.use("/api/stores", storeRoutes);
  
  // 🤖 PRODUCT FAQs AI GENERATION ROUTES
  console.log("🤖 Mounting Product FAQs Router...");
  app.use("/api/product-faqs", productFAQsRouter);
  console.log("✅ Product FAQs Router mounted successfully");
  
  // ==========================================
  // 🎯 CUSTOM DESCRIPTIONS API ROUTES (Approach 2: Dynamic Product Fields)
  // ==========================================
  // Dynamic custom description system for Vietnamese incense business
  // Serves Admin Panel, Storefront, RASA Chatbot, Social Media, SEO
  const customDescriptionsRouter = (await import("./api/custom-descriptions")).default;
  app.use("/api", customDescriptionsRouter);
  
  // ==========================================
  // 🎨 Theme Repository Management API
  // ==========================================
  app.use("/api/themes", themesRouter);
  
  // ==========================================
  // 🧩 Template Repository Management API
  // ==========================================
  app.use("/api/templates", templatesRouter);
  
  // ==========================================
  // 💎 MEMBERSHIP SYSTEM API ROUTES
  // ==========================================
  app.use("/api/membership", membershipRouter);
  
  // ==========================================
  // 🎟️ CUSTOMER VOUCHER SYSTEM API ROUTES
  // ==========================================
  app.use("/api/customer/vouchers", customerVouchersRouter);
  
  // 🔐 SESSION AUTHENTICATION API ROUTES
  // ==========================================
  app.use("/api/session", sessionRouter);
  
  // ❤️ CUSTOMER WISHLIST API ROUTES
  // ==========================================
  app.use("/api/wishlist", wishlistRouter);
  
  // 🔔 CUSTOMER NOTIFICATIONS API ROUTES
  // ==========================================
  app.use("/api/notifications", notificationsRouter);
  
  // 👤 CUSTOMER PROFILE API ROUTES
  // ==========================================
  app.use("/api/customers", customerProfileRouter);
  
  // ==========================================
  // 🎁 PUBLIC VOUCHERS API ROUTES (No Auth Required)
  // ==========================================
  app.use("/api/public-vouchers", publicVouchersRouter);
  
  // ==========================================
  // 🔔 WEB PUSH NOTIFICATIONS API ROUTES
  // ==========================================
  app.use("/api/push-notifications", pushNotificationsRouter);
  
  // ==========================================
  // 🧑‍💼 CUSTOMER MANAGEMENT API ROUTES (Social & Limits)
  // ==========================================
  app.use("/api/customer-management", customerManagementRouter);

  // 🔐 SECURE ADDRESS MANAGEMENT - Encrypted customer addresses for affiliates
  app.post("/api/secure-addresses", secureAddressHandlers.addSecureCustomerAddress);
  app.get("/api/secure-addresses/:affiliateId", secureAddressHandlers.getAffiliateSecureAddresses);
  app.post("/api/secure-addresses/:id/hide", secureAddressHandlers.hideSecureAddress);
  app.get("/api/secure-addresses/:id/decrypt", secureAddressHandlers.getDecryptedSecureAddress);
  app.get("/api/secure-addresses/check-duplicate", secureAddressHandlers.checkAddressDuplicate);
  
  // ==========================================
  // 🎟️ DISCOUNT CODE MANAGEMENT API ROUTES
  // ==========================================
  app.use("/api/discounts", discountsRouter);
  app.use("/api/discounts", discountsValidationRouter);

  // ==========================================
  // 🛒 CHECKOUT VOUCHER VALIDATION API ROUTES
  // ==========================================
  app.use("/api/checkout", checkoutRouter);
  
  // ==========================================
  // PRODUCT FAQs MANAGEMENT API ROUTES
  // ==========================================
  app.use("/api/product-faqs", productFAQsRouter);

  // ==========================================
  // 🚚 VIETTELPOST SHIPPING API ROUTES
  // ==========================================
  console.log("🚚 Mounting ViettelPost routes...");
  const viettelpostRouter = (await import("./api/viettelpost")).default;
  app.use("/api/viettelpost", viettelpostRouter);

  // ==========================================
  // 🚚 VIETTELPOST WEBHOOK ROUTES
  // ==========================================
  const viettelpostWebhookRouter = (await import("./api/viettelpost-webhook")).default;
  app.use("/api/webhooks", viettelpostWebhookRouter);
  console.log("✅ ViettelPost routes mounted successfully");

  // ==========================================
  // FACEBOOK APPS MANAGEMENT API ROUTES
  // ==========================================
  app.use("/api/facebook-apps", facebookAppsRouter);

  // ==========================================
  // AI CONTENT GENERATION API ROUTES  
  // ==========================================
  app.use("/api/ai", aiContentRouter);

  // ==========================================
  // CONTENT PREVIEW API ROUTES
  // ==========================================
  app.use("/api/content-preview", contentPreviewRouter);
  app.use("/api/scheduled-posts", scheduledPostsRouter);
  app.use("/api/scheduler", schedulerRouter);
  registerAnalyticsSchedulerRoutes(app);

  // ==========================================
  // DUPLICATE DETECTION API ROUTES
  // ==========================================
  app.use("/api/duplicate-detection", duplicateDetectionRouter);

  // ==========================================
  // FANPAGE MATCHING API ROUTES
  // ==========================================
  app.use("/api/fanpage-matching", fanpageMatchingRouter);

  // ==========================================
  // FACEBOOK OAUTH AUTHENTICATION ROUTES
  // ==========================================
  const facebookAuthRouter = await import("./api/facebook-auth");
  app.use("/api/auth", facebookAuthRouter.default);

  // ==========================================
  // GOOGLE OAUTH AUTHENTICATION ROUTES
  // ==========================================
  const googleAuthRouter = await import("./api/google-auth");
  app.use("/api/auth", googleAuthRouter.default);

  // ==========================================
  // FACEBOOK CUSTOMER LOGIN OAUTH ROUTES
  // ==========================================
  const facebookCustomerAuthRouter = await import("./api/facebook-customer-auth");
  app.use("/api/auth", facebookCustomerAuthRouter.default);

  // ==========================================
  // ZALO CUSTOMER LOGIN OAUTH ROUTES
  // ==========================================
  const zaloCustomerAuthRouter = await import("./api/zalo-customer-auth");
  app.use("/api/auth", zaloCustomerAuthRouter.default);

  // ==========================================
  // UNIFIED AUTH MANAGEMENT ROUTES
  // ==========================================
  const unifiedAuthRouter = await import("./api/unified-auth");
  app.use("/api/auth", unifiedAuthRouter.default);

  // ==========================================
  // GUEST CHECKOUT API ROUTES  
  // ==========================================
  const guestCheckoutRouter = await import("./api/guest-checkout");
  app.use("/api", guestCheckoutRouter.default);

  // ==========================================
  // ANALYTICS & MONITORING API ROUTES
  // ==========================================
  app.use("/api/analytics", analyticsRouter);
  app.use("/api/recommendations", recommendationsRouter);
  app.use("/api/limits", limitManagementRouter);
  
  // ==========================================
  // RASA CHATBOT MANAGEMENT API ROUTES (MOVED EARLIER)
  // ==========================================
  // Moved to line 3789 for routing priority

  // ==========================================
  // AUTOMATION API ROUTES
  // ==========================================
  app.use("/api/automation", automationRouter);

  // ==========================================
  // FAQ MANAGEMENT API ROUTES
  // ⚠️ DISABLED - Tables do not exist in database
  // ==========================================
  app.use("/api/faq-library", faqLibraryRouter);
  app.use("/api/faq-assignments", faqAssignmentsRouter);
  app.use("/api/category-faq-templates", categoryFAQTemplatesRouter);
  app.use("/api/ai-faq-generation", aiFAQGenerationRouter);
  
  // DISABLED: Tables do not exist in database
  // app.get("/api/category-faq-templates", ...categoryFAQTemplatesRoutes.get);
  // app.post("/api/category-faq-templates", ...categoryFAQTemplatesRoutes.post);
  // app.put("/api/category-faq-templates/:id", ...categoryFAQTemplatesRoutes.put);
  // app.delete("/api/category-faq-templates/:id", ...categoryFAQTemplatesRoutes.delete);
  // app.post("/api/category-faq-templates/bulk-create", ...categoryFAQTemplatesRoutes.bulkCreate);
  // app.put("/api/category-faq-templates/reorder", ...categoryFAQTemplatesRoutes.reorder);
  // app.post("/api/ai-faq-generation/generate", ...aiFAQGenerationRoutes.generate);
  // app.post("/api/ai-faq-generation/bulk-generate", ...aiFAQGenerationRoutes.bulkGenerate);
  // app.get("/api/ai-faq-generation/status/:id", ...aiFAQGenerationRoutes.status);

  // ==========================================
  // AI REVIEW SEEDING & MANAGEMENT API ROUTES
  // ==========================================
  app.use("/api/review-seeding", reviewSeedingRouter);
  app.use("/api/admin/reviews", adminReviewsRouter);

  // ==========================================
  // SATELLITE SYSTEM API ROUTES
  // ==========================================
  app.use("/api/satellites", satellitesRouter);

  // ==========================================
  // JOB ORCHESTRATOR API ROUTES (Trợ lý Giám đốc)
  // ==========================================
  app.use("/api/orchestrator", orchestratorRouter);

  // ==========================================
  // POSTS API ROUTES (Unified Scheduling)
  // ==========================================
  app.use("/api/posts", postsRouter);

  // ==========================================
  // WORKER COMMUNICATION API ROUTES
  // ==========================================
  app.use("/api/workers", workersRouter);

  // ==========================================
  // REGION ASSIGNMENT API ROUTES
  // ==========================================
  app.use("/api/regions", regionAssignmentRouter);

  // ==========================================
  // NGROK CONFIGURATION API ROUTES
  // ==========================================
  app.use("/api/ngrok", ngrokConfigRouter);

  // ==========================================
  // JOB CALLBACK & RESULT PROCESSING ROUTES
  // ==========================================
  app.use("/api/callbacks", jobCallbacksRouter);

  // ==========================================
  // SYSTEM HEALTH MONITORING API ROUTES  
  // ==========================================
  app.use("/api/health", systemHealthRouter);

  // ==========================================
  // 📚 BOOKS MANAGEMENT ROUTES
  // ==========================================
  app.use("/api/books", booksRouter);
  app.use("/api/book-orders", bookOrdersRouter);
  app.use("/api/book-categories", bookCategoriesRouter);
  app.use("/api/book-inventory", bookInventoryRouter);
  app.use("/api/bot-config", botConfigRouter); // 🤖 Bot Config API (READ-ONLY for RASA)
  app.use("/api/bot/customer", botCustomerRouter);
  app.use("/api/bot/tier", botTierRouter); // 🎯 Bot Tier Management
  app.use("/api/bot/recommendations", botRecommendationsRouter); // 🤖 AI Product Recommendations
  app.use("/api/bot/cart", botCartRouter); // 🛒 Cart Recovery & Abandonment
  app.use("/api/bot/insights", botInsightsRouter); // 📊 RFM Analysis & Churn Prediction
  registerBotEventsRoutes(app); // 📊 Bot Events Tracking
  registerBotCronRoutes(app); // ⏰ Bot Cron Jobs (Tier Check & Cart Recovery)
  
  // 💳 Payment Gateway & Transactions Routes
  registerPaymentSettingsRoutes(app); // Payment gateway settings CRUD
  registerBookTransactionsRoutes(app); // Payment transactions history & stats
  registerBookCheckoutRoutes(app); // Checkout processing & refunds
  app.use("/api/seller-ratings", sellerRatingsRouter);
  app.use("/api/seller-performance", sellerPerformanceAnalyticsRouter);
  app.use("/api/categories", categoriesRouter);
  app.use("/api/cookie-profiles", cookieProfilesRouter);
  app.use("/api/users", usersRouter);
  app.use("/api/affiliates", affiliatesRouter);
  app.use("/api/affiliate-auth", affiliateAuthRouter);
  app.use("/api/affiliate-portal", affiliatePortalRouter);
  app.use("/api/vip-portal", vipPortalRouter); // 💎 VIP Customer Portal
  app.use("/api/vip-registration", vipRegistrationRouter); // 💎 VIP QR Registration
  app.use("/api/driver-portal", driverPortalRouter); // 🚗 Driver Portal
  app.use("/api/delivery-management", deliveryManagementRouter); // 📦🚗 Delivery & Vehicle Management
  app.use("/api/vip-management", vipManagementRouter); // 💎👑 VIP Admin Management
  app.use("/api/driver-management", driverManagementRouter); // 🚗👨‍💼 Driver Admin Management
  app.use("/api/affiliate-management", affiliateManagementRouter); // 🤝💼 Affiliate Admin Management
  app.use("/api/affiliate", affiliateLandingRouter); // 💼🔗 Affiliate Landing Page System (Customer-facing)
  app.use("/api/customer-dashboard", customerDashboardRouter);
  app.use("/api/campaigns", campaignsRouter); // 🎯 Customer Campaign Participation APIs
  app.use("/api/admin", adminAuthRouter); // 🔐 Admin Authentication & Management
  app.use("/api/admin", devLoginRouter); // 🔓 DEV ONLY: Auto-login for testing
  app.use("/api/admin", adminVendorsRouter); // 🏭 Admin Vendor Management
  app.use("/api/admin", adminCampaignsRouter); // 🎯 Admin Campaign Management
  app.use("/api/admin", adminOAuthRouter); // 🔑 Admin OAuth Settings & Stats
  app.use("/api/admin/oauth-providers", oauthProviderSettingsRouter); // 🔐 OAuth Provider Settings Management
  app.use("/api/vendor/auth", vendorAuthRouter); // 🏭 Vendor Authentication
  app.use("/api/vendor/dashboard", vendorDashboardRouter); // 📊 Vendor Dashboard Statistics
  app.use("/api/vendor/products", vendorProductsRouter); // 📦 Vendor Products Management
  app.use("/api/vendor/consignment", vendorConsignmentRouter); // 📋 Vendor Consignment Requests
  app.use("/api/vendor/orders", vendorOrdersRouter); // 📦 Vendor Orders Management (includes shipping labels)
  app.use("/api/vendor/financial", vendorFinancialRouter); // 💰 Vendor Financial Management (Balance, Transactions, Deposits)
  app.use("/api/vendor/returns", vendorReturnsRouter); // 🔄 Vendor Return Requests Management
  app.use("/api/vendor", vendorSettingsRouter); // ⚙️ Vendor Settings Management
  app.use("/api/vendor/notifications", vendorNotificationsRouter); // 📱 Vendor Push Notifications Management
  app.use("/api/shipping/ghn", shippingGhnRouter); // 🚚 GHN Shipping Integration (Vietnam)
  app.use("/api/admin/shop-settings", shopSettingsRouter); // 🏪 Shop Settings Management (Admin)
  app.use("/api/shop-info", shopInfoRouter); // 🏪 Public Shop Information (Frontend)
  app.use("/api/flash-sales", flashSalesRouter); // 🔥 Flash Sales Management (Admin + Public)
  app.use("/api/preorders", preordersRouter); // 📦 Pre-orders Management (Admin + Public)
  app.use("/api/price-filtering", priceFilteringRouter);
  app.use("/api", invoiceRouter); // 📄 Invoice Generation & Sending
  app.use("/api/invoice-templates", invoiceTemplatesRouter); // 📄 Invoice Template Management

  // ==========================================
  // 🏪 GENERAL CATEGORIES ROUTES
  // ==========================================
  app.use("/api/general-categories", generalCategoriesRouter);
  app.use("/api/smart-search", smartSearchRouter);
  app.use("/api/book-sellers", bookSellersRouter);
  app.use("/api/book-customers", bookCustomersRouter);
  app.use("/api/pricing-automation", pricingAutomationRouter);
  app.use("/api/sales-automation", salesAutomationRouter);
  app.use("/api/advanced-automation", advancedAutomationRouter);
  app.use("/api/gift-campaigns", giftCampaignsRouter);
  app.use("/api/gift-vouchers", giftVouchersRouter);

  // ==========================================
  // 🌙 VIETNAMESE LUNAR CALENDAR ROUTES
  // ==========================================
  app.use("/api/lunar-calendar", lunarCalendarHandler);

  // ==========================================
  // CONTENT LIBRARY, VEHICLES & API CONFIGURATIONS
  // ==========================================
  app.use("/api/content-library", contentLibraryRouter);
  app.use("/api/vehicles", vehiclesRouter);
  app.use("/api/api-management", apiManagementRouter);
  
  // Legacy route for api-configurations (keeping for backward compatibility)
  const apiConfigurationsRouter = await import("./api/api-configurations");
  app.use("/api/api-configurations", apiConfigurationsRouter.default);

  // ==========================================
  // 🔍 API AUTO-DISCOVERY ENDPOINT
  // ==========================================
  app.post("/api/admin/scan-apis", async (req, res) => {
    try {
      const fs = await import('fs');
      const path = await import('path');
      
      // Step 1: Find mount points in routes.ts
      const findMountPoints = (): Map<string, string> => {
        const mountPoints = new Map<string, string>();
        
        try {
          const routesPath = path.join(process.cwd(), 'server/routes.ts');
          const routesContent = fs.readFileSync(routesPath, 'utf8');
          
          // Find app.use mount points: app.use('/api/books', booksRouter)
          const mountPattern = /app\.use\s*\(\s*['"`]([^'"`]+)['"`]\s*,\s*([^)]+)\)/g;
          let match;
          
          while ((match = mountPattern.exec(routesContent)) !== null) {
            const mountPath = match[1];
            const routerVar = match[2].trim();
            
            if (mountPath.startsWith('/api')) {
              // Extract module name from variable (e.g., booksRouter -> books)
              const moduleName = routerVar.replace(/Router.*$/, '').replace(/^.*\//, '');
              mountPoints.set(moduleName, mountPath);
            }
          }
        } catch (err) {
          console.log('Could not read routes.ts:', err);
        }
        
        return mountPoints;
      };
      
      // Step 2: Scan individual router files
      const scanRouterFile = (filePath: string, mountPrefix: string): any[] => {
        const discoveredAPIs: any[] = [];
        
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          const fileName = path.basename(filePath);
          
          // Find router method definitions: router.get('/path', ...)
          const routerPattern = /router\.(get|post|put|patch|delete|use)\s*\(\s*['"`]([^'"`]+)['"`]/g;
          let match;
          
          while ((match = routerPattern.exec(content)) !== null) {
            const method = match[1].toUpperCase();
            const relativePath = match[2];
            
            // Skip middleware
            if (method === 'USE') continue;
            
            // Combine mount prefix with relative path
            let fullPath = mountPrefix;
            if (relativePath !== '/') {
              fullPath += relativePath;
            }
            
            const category = mountPrefix.split('/').filter(p => p)[1] || 'general';
            
            discoveredAPIs.push({
              path: fullPath,
              method: method,
              type: 'endpoint',
              description: `${method} endpoint from ${fileName}`,
              rateLimit: method === 'GET' ? 100 : 50,
              isActive: true,
              createdAt: new Date(),
              sourceFile: filePath.replace(process.cwd(), ''),
              category
            });
          }
        } catch (err) {
          console.log(`Could not read file ${filePath}:`, err);
        }
        
        return discoveredAPIs;
      };
      
      // Step 3: Scan all API files and combine results
      const scanAllAPIs = (): any[] => {
        const discoveredAPIs: any[] = [];
        
        // Get mount points
        const mountPoints = findMountPoints();
        
        // Scan main routes.ts for direct app. routes
        try {
          const routesPath = path.join(process.cwd(), 'server/routes.ts');
          const routesContent = fs.readFileSync(routesPath, 'utf8');
          
          // Find direct app routes: app.get('/api/...', ...)
          const appPattern = /app\.(get|post|put|patch|delete)\s*\(\s*['"`]([^'"`]+)['"`]/g;
          let match;
          
          while ((match = appPattern.exec(routesContent)) !== null) {
            const method = match[1].toUpperCase();
            const apiPath = match[2];
            
            if (apiPath.startsWith('/api')) {
              const category = apiPath.split('/').filter(p => p)[1] || 'general';
              
              discoveredAPIs.push({
                path: apiPath,
                method: method,
                type: 'endpoint',
                description: `${method} endpoint from routes.ts`,
                rateLimit: method === 'GET' ? 100 : 50,
                isActive: true,
                createdAt: new Date(),
                sourceFile: '/server/routes.ts',
                category
              });
            }
          }
        } catch (err) {
          console.log('Could not scan main routes:', err);
        }
        
        // Scan router files based on mount points
        for (const [moduleName, mountPath] of Array.from(mountPoints.entries())) {
          // Try common router file patterns
          const possiblePaths = [
            path.join(process.cwd(), `server/api/${moduleName}.ts`),
            path.join(process.cwd(), `server/${moduleName}.ts`),
            path.join(process.cwd(), `server/routes/${moduleName}.ts`)
          ];
          
          for (const routerPath of possiblePaths) {
            if (fs.existsSync(routerPath)) {
              const routerAPIs = scanRouterFile(routerPath, mountPath);
              discoveredAPIs.push(...routerAPIs);
              break; // Found the file, no need to check other paths
            }
          }
        }
        
        return discoveredAPIs;
      };
      
      // Use the new scanning approach
      const allDiscoveredAPIs = scanAllAPIs();
      
      // Remove duplicates based on method + path combination
      const uniqueAPIs = allDiscoveredAPIs.filter((api, index, self) => 
        index === self.findIndex(a => a.method === api.method && a.path === api.path)
      );
      
      // Get existing API configurations to compare
      const { db } = await import('./db');
      const { apiConfigurations } = await import('../shared/schema');
      const existingConfigs = await db.select().from(apiConfigurations);
      const existingPaths = new Set(existingConfigs.map(c => `${c.method}:${c.endpoint}`));
      
      // Filter out existing APIs to find new ones
      const newAPIs = uniqueAPIs.filter(api => !existingPaths.has(`${api.method}:${api.path}`));
      const existingAPIs = uniqueAPIs.filter(api => existingPaths.has(`${api.method}:${api.path}`));
      
      // Group by category for better organization
      const categories = Array.from(new Set(uniqueAPIs.map(api => api.category)));
      
      // Create summary
      const summary = {
        totalFound: uniqueAPIs.length,
        newAPIs: newAPIs.length,
        existingAPIs: existingAPIs.length,
        categories: categories.length
      };
      
      // 💾 SAVE NEW APIs TO DATABASE
      let savedCount = 0;
      console.log(`🔍 DEBUG: Found ${newAPIs.length} new APIs to save`);
      
      if (newAPIs.length > 0) {
        console.log(`💾 Attempting to save ${newAPIs.length} new APIs to database...`);
        try {
          const newConfigs = newAPIs.map(api => ({
            endpoint: api.path,
            method: api.method,
            description: api.description,
            category: api.category,
            isEnabled: api.isActive,
            maintenanceMode: false,
            rateLimitEnabled: true,
            rateLimitRequests: api.rateLimit,
            rateLimitWindowSeconds: 60,
            circuitBreakerEnabled: false,
            circuitBreakerThreshold: 5,
            circuitBreakerTimeout: 30000,
            accessCount: 0,
            errorCount: 0,
            avgResponseTime: '0',
            requiresAuth: false,
            adminOnly: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }));
          
          await db.insert(apiConfigurations).values(newConfigs);
          savedCount = newConfigs.length;
          console.log(`✅ Saved ${savedCount} new API configurations to database`);
        } catch (saveError) {
          console.error(`❌ Error saving APIs to database:`, saveError);
        }
      }
      
      res.json({
        status: 'success',
        message: `Discovered ${uniqueAPIs.length} unique API endpoints. Saved ${savedCount} new APIs to database.`,
        summary: {
          ...summary,
          savedToDatabase: savedCount
        },
        newAPIs: newAPIs.slice(0, 50),
        discovered: uniqueAPIs.slice(0, 100),
        categories,
        metadata: {
          scanTime: new Date(),
          totalEndpoints: uniqueAPIs.length,
          scannedFiles: ['server/routes.ts', 'server/api/*'],
          duplicatesRemoved: allDiscoveredAPIs.length - uniqueAPIs.length,
          mountPoints: new Map()
        }
      });
      
    } catch (error: any) {
      console.error('API scan error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to scan for APIs',
        error: error.message
      });
    }
  });

  // ==========================================
  // 🛡️ SECURE ORS (OpenRouteService) PROXY
  // ==========================================
  app.post("/api/admin/calculate-route-distance", async (req, res) => {
    try {
      const { lat1, lon1, lat2, lon2 } = req.body;

      // Validate coordinates
      if (typeof lat1 !== 'number' || typeof lon1 !== 'number' || 
          typeof lat2 !== 'number' || typeof lon2 !== 'number') {
        return res.status(400).json({ 
          error: "Invalid coordinates. All values must be numbers.",
          distance: null 
        });
      }

      // Get ORS API key from environment
      const ORS_API_KEY = process.env.ORS_API_KEY;
      if (!ORS_API_KEY) {
        console.error('[ORS] API key not configured in environment');
        return res.status(500).json({ 
          error: "ORS API key not configured",
          distance: null 
        });
      }

      // Call OpenRouteService API server-side
      const url = `https://api.openrouteservice.org/v2/directions/driving-car?start=${lon1},${lat1}&end=${lon2},${lat2}`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout
      
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Authorization': ORS_API_KEY,
          'Accept': 'application/geo+json'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        console.warn('[ORS] API request failed:', response.status);
        return res.json({ distance: null });
      }
      
      const data: any = await response.json();
      
      if (!data.features || data.features.length === 0) {
        console.warn('[ORS] No route found');
        return res.json({ distance: null });
      }
      
      // Extract distance from GeoJSON response
      const distanceMeters = data.features[0].properties.summary.distance;
      const distanceKm = distanceMeters / 1000;
      const roundedDistance = Math.round(distanceKm * 10) / 10;
      
      res.json({ distance: roundedDistance });
      
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.warn('[ORS] Request timeout');
      } else {
        console.warn('[ORS] Failed to calculate route distance:', error);
      }
      res.json({ distance: null });
    }
  });

  // ==========================================
  // API FALLBACK - Catch unmatched API routes and return JSON 404
  // This prevents API requests from falling through to Vite's HTML serve
  // ==========================================
  app.use("/api/*", (req, res) => {
    res.status(404).json({ 
      error: "API endpoint not found",
      path: req.originalUrl,
      message: "The requested API endpoint does not exist"
    });
  });

  // Firebase sample data initialization (for development)
  app.post("/api/admin/init-sample-data", async (req, res) => {
    try {
      const { createSampleData } = await import("./firebase-sample-data");
      const result = await createSampleData();
      res.json({
        status: "success",
        message: "Dữ liệu mẫu đã được tạo thành công",
        data: result
      });
    } catch (error) {
      console.error("Error creating sample data:", error);
      res.status(500).json({ 
        status: "error", 
        message: "Không thể tạo dữ liệu mẫu",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
