import { Router, Request, Response } from 'express';
import { DatabaseStorage } from '../storage';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { normalizePhone } from '../../shared/phoneUtils';

const router = Router();
const storage = new DatabaseStorage();

// TODO: Add rate limiting back later - temporarily disabled for development
// const chatRateLimit = rateLimit({
//   windowMs: 60 * 1000, // 1 minute
//   max: 60, // 60 requests per minute
//   message: {
//     error: 'Too many chat requests',
//     details: 'Rate limit exceeded. Please wait before sending more messages.'
//   }
// });

// Schema validation
const messageSchema = z.object({
  content: z.string().min(1).max(4000),
  senderType: z.enum(['user', 'bot']),
  senderName: z.string().optional(),
  messageType: z.enum(['text', 'image', 'audio', 'video', 'file']).default('text'),
  attachments: z.array(z.any()).optional().default([]),
  metadata: z.any().optional()
});

const conversationSchema = z.object({
  sessionId: z.string().min(1),
  customerId: z.string().optional(),
  status: z.enum(['active', 'closed']).default('active'),
  satisfactionRating: z.number().min(1).max(5).optional()
});

const conversationUpdateSchema = z.object({
  status: z.enum(['active', 'closed']).optional(),
  satisfactionRating: z.number().min(1).max(5).optional()
});

/**
 * GET /api/rasa/conversations
 * List all chatbot conversations
 */
router.get('/conversations', async (req, res) => {
  try {
    const { limit = '50' } = req.query;
    const limitNum = parseInt(limit as string, 10);
    
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({
        error: 'Invalid limit parameter',
        details: 'Limit must be a number between 1 and 100'
      });
    }

    const conversations = await storage.getChatbotConversations(limitNum);
    res.json({
      success: true,
      data: conversations,
      count: conversations.length,
      limit: limitNum
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({
      error: 'Failed to fetch conversations',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/rasa/conversations
 * Create a new chatbot conversation
 */
router.post('/conversations', async (req, res) => {
  try {
    const validatedData = conversationSchema.parse(req.body);
    
    // Check if conversation already exists for this session
    const existingConversation = await storage.getChatbotConversationBySession(validatedData.sessionId);
    if (existingConversation) {
      return res.status(409).json({
        error: 'Conversation already exists',
        details: `Conversation with sessionId '${validatedData.sessionId}' already exists`,
        data: existingConversation
      });
    }

    // Create new conversation
    const newConversation = await storage.createChatbotConversation({
      ...validatedData,
      messages: []
    });

    // 📊 AUTO-TRACK: Web analytics when conversation is created
    if (validatedData.customerId) {
      try {
        // Extract UTM params from request query (if frontend sends them)
        const utmSource = req.query.utm_source as string;
        const utmMedium = req.query.utm_medium as string;
        const utmCampaign = req.query.utm_campaign as string;
        
        // Track session start
        await storage.trackCustomerEvent({
          customerId: validatedData.customerId,
          eventType: "session_start",
          eventData: {
            deviceType: req.headers['user-agent']?.includes('Mobile') ? 'mobile' : 'desktop',
            userAgent: req.headers['user-agent'],
          },
          channel: "web",
          sessionId: validatedData.sessionId,
        });

        // Track UTM if present
        if (utmSource) {
          await storage.trackCustomerEvent({
            customerId: validatedData.customerId,
            eventType: "utm_tracked",
            eventData: {
              utmSource,
              utmMedium,
              utmCampaign,
            },
            channel: "web",
            sessionId: validatedData.sessionId,
          });
        }
      } catch (trackError) {
        console.error('Auto-tracking failed:', trackError);
      }
    }

    res.status(201).json({
      success: true,
      data: newConversation,
      message: 'Conversation created successfully'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors
      });
    }
    
    console.error('Error creating conversation:', error);
    res.status(500).json({
      error: 'Failed to create conversation',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/rasa/conversations/:sessionId
 * Get a specific conversation by session ID
 */
router.get('/conversations/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const conversation = await storage.getChatbotConversationBySession(sessionId);
    if (!conversation) {
      return res.status(404).json({
        error: 'Conversation not found',
        details: `No conversation found with sessionId '${sessionId}'`
      });
    }

    res.json({
      success: true,
      data: conversation
    });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({
      error: 'Failed to fetch conversation',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * PUT /api/rasa/conversations/:sessionId
 * Update conversation status or rating
 */
router.put('/conversations/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const validatedData = conversationUpdateSchema.parse(req.body);
    
    // Find conversation by sessionId first
    const conversation = await storage.getChatbotConversationBySession(sessionId);
    if (!conversation) {
      return res.status(404).json({
        error: 'Conversation not found',
        details: `No conversation found with sessionId '${sessionId}'`
      });
    }

    // Update the conversation
    const updatedConversation = await storage.updateChatbotConversation(conversation.id, validatedData);
    
    if (!updatedConversation) {
      return res.status(500).json({
        error: 'Failed to update conversation',
        details: 'Conversation update returned null'
      });
    }

    res.json({
      success: true,
      data: updatedConversation,
      message: 'Conversation updated successfully'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors
      });
    }
    
    console.error('Error updating conversation:', error);
    res.status(500).json({
      error: 'Failed to update conversation',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/rasa/conversations/:sessionId/messages
 * Get messages for a specific conversation
 */
router.get('/conversations/:sessionId/messages', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    // Find conversation by sessionId
    const conversation = await storage.getChatbotConversationBySession(sessionId);
    if (!conversation) {
      return res.status(404).json({
        error: 'Conversation not found',
        details: `No conversation found with sessionId '${sessionId}'`
      });
    }

    // Get messages from the conversation
    const messages = await storage.getChatbotMessages(conversation.id);
    
    res.json({
      success: true,
      data: messages,
      count: messages.length,
      conversationId: conversation.id,
      sessionId: sessionId
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      error: 'Failed to fetch messages',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/rasa/conversations/:sessionId/messages
 * Add a new message to a conversation
 */
router.post('/conversations/:sessionId/messages', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const validatedMessage = messageSchema.parse(req.body);
    
    // Find or create conversation
    let conversation = await storage.getChatbotConversationBySession(sessionId);
    
    if (!conversation) {
      // 🔥 AUTO-DETECT CUSTOMER: Check if sessionId contains Facebook ID, phone number, or session data
      let detectedCustomerId = null;
      
      try {
        // Method 1: Check if sessionId is a Facebook sender ID (starts with fb_ or is numeric)
        if (sessionId.startsWith('fb_') || /^\d+$/.test(sessionId)) {
          const facebookId = sessionId.replace('fb_', '');
          const customer = await storage.getCustomerByFacebookId(facebookId);
          if (customer) {
            detectedCustomerId = customer.id;
            console.log(`✅ Auto-detected customer ${customer.name} from Facebook ID: ${facebookId}`);
          }
        }
        
        // Method 2: Check if sessionId contains a phone number (Vietnamese format)
        // Supports formats: phone_0905123123, tel_0905.123.123, +84905123123, etc.
        if (!detectedCustomerId) {
          const phoneMatch = sessionId.match(/(?:phone_|tel_|)?([\d\s\.\-+]+)/);
          if (phoneMatch) {
            const rawPhone = phoneMatch[1];
            const normalizedPhone = normalizePhone(rawPhone);
            
            if (normalizedPhone) {
              const customer = await storage.getCustomerByPhone(normalizedPhone);
              if (customer) {
                detectedCustomerId = customer.id;
                console.log(`✅ Auto-detected customer ${customer.name} from phone: ${normalizedPhone}`);
              }
            }
          }
        }
        
        // TODO: Add session-based customer detection for web users
        // Future: Check session store for authenticated user
      } catch (error) {
        console.warn('Customer auto-detection failed:', error);
        // Continue with null customerId if detection fails
      }

      // Auto-create conversation with detected customer
      conversation = await storage.createChatbotConversation({
        sessionId,
        customerId: detectedCustomerId,
        status: 'active',
        messages: []
      });
    } else if (!conversation.customerId) {
      // 🔄 BACKFILL: Update existing conversation with null customerId
      try {
        let detectedCustomerId = null;
        
        // Try Facebook ID
        if (sessionId.startsWith('fb_') || /^\d+$/.test(sessionId)) {
          const facebookId = sessionId.replace('fb_', '');
          const customer = await storage.getCustomerByFacebookId(facebookId);
          if (customer) {
            detectedCustomerId = customer.id;
            console.log(`✅ Backfilled customer ${customer.name} from Facebook ID: ${facebookId}`);
          }
        }
        
        // Try phone number
        if (!detectedCustomerId) {
          const phoneMatch = sessionId.match(/(?:phone_|tel_|)?([\d\s\.\-+]+)/);
          if (phoneMatch) {
            const rawPhone = phoneMatch[1];
            const normalizedPhone = normalizePhone(rawPhone);
            
            if (normalizedPhone) {
              const customer = await storage.getCustomerByPhone(normalizedPhone);
              if (customer) {
                detectedCustomerId = customer.id;
                console.log(`✅ Backfilled customer ${customer.name} from phone: ${normalizedPhone}`);
              }
            }
          }
        }
        
        if (detectedCustomerId) {
          conversation = await storage.updateChatbotConversation(conversation.id, { 
            customerId: detectedCustomerId 
          }) || conversation;
        }
      } catch (error) {
        console.warn('Customer backfill failed:', error);
      }
    }

    // Add message to conversation
    const updatedConversation = await storage.addMessageToChatbotConversation(conversation.id, validatedMessage);
    
    if (!updatedConversation) {
      return res.status(500).json({
        error: 'Failed to add message',
        details: 'Message addition returned null'
      });
    }

    // Get the newly added message (last in array)
    const messages = await storage.getChatbotMessages(conversation.id);
    const newMessage = messages[messages.length - 1];

    res.status(201).json({
      success: true,
      data: newMessage,
      conversationId: conversation.id,
      sessionId: sessionId,
      message: 'Message added successfully'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors
      });
    }
    
    console.error('Error adding message:', error);
    res.status(500).json({
      error: 'Failed to add message',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/rasa/conversations/backend/chat-logs
 * Backend Chat Logs Viewer - Raw format for backend access
 */
router.get('/conversations/backend/chat-logs', async (req, res) => {
  try {
    const { limit = '10', format = 'json' } = req.query;
    const limitNum = parseInt(limit as string, 10);
    
    // Get recent conversations
    const conversations = await storage.getChatbotConversations(limitNum);

    if (format === 'text') {
      // Format as readable text for backend viewing
      let output = `=== BACKEND CHAT LOGS (Latest ${limitNum}) ===\n\n`;
      
      for (let i = 0; i < conversations.length; i++) {
        const conv = conversations[i];
        output += `--- Conversation ${i + 1} ---\n`;
        output += `🆔 ID: ${conv.id}\n`;
        output += `👤 Session: ${conv.sessionId}\n`;
        output += `📊 Status: ${conv.status}\n`;
        output += `⏰ Created: ${conv.createdAt}\n`;
        output += `💬 Message Count: ${conv.messages ? JSON.parse(conv.messages as string).length : 0}\n\n`;
        
        try {
          const messages = conv.messages ? JSON.parse(conv.messages as string) : [];
          messages.forEach((msg: any, msgIndex: number) => {
            const timestamp = new Date(msg.timestamp).toLocaleString('vi-VN');
            output += `  [${msgIndex + 1}] ${timestamp}\n`;
            output += `  ${msg.senderType === 'user' ? '👤 USER' : '🤖 BOT'}: ${msg.content}\n`;
            
            if (msg.metadata?.buttons && msg.metadata.buttons.length > 0) {
              output += `      🔘 Buttons: ${msg.metadata.buttons.map((b: any) => b.title).join(', ')}\n`;
            }
            
            if (msg.metadata?.custom) {
              output += `      ℹ️  Custom: ${JSON.stringify(msg.metadata.custom)}\n`;
            }
            output += `\n`;
          });
        } catch (e) {
          output += `  ❌ [Error parsing messages: ${e instanceof Error ? e.message : String(e)}]\n`;
        }
        
        output += `${'='.repeat(60)}\n\n`;
      }

      // Add summary
      output += `\n📈 SUMMARY:\n`;
      output += `Total Conversations: ${conversations.length}\n`;
      output += `Active Conversations: ${conversations.filter(c => c.status === 'active').length}\n`;
      output += `Generated: ${new Date().toLocaleString('vi-VN')}\n`;

      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      return res.send(output);
    }

    // Default JSON format - detailed for backend use
    const detailedConversations = conversations.map(conv => {
      try {
        const messages = conv.messages ? JSON.parse(conv.messages as string) : [];
        return {
          id: conv.id,
          sessionId: conv.sessionId,
          status: conv.status,
          messageCount: messages.length,
          createdAt: conv.createdAt,
          messages: messages.map((msg: any) => ({
            id: msg.id,
            senderType: msg.senderType,
            senderName: msg.senderName,
            content: msg.content,
            messageType: msg.messageType,
            timestamp: msg.timestamp,
            hasButtons: msg.metadata?.hasButtons || false,
            buttons: msg.metadata?.buttons || [],
            metadata: msg.metadata
          })),
          latestMessage: messages.length > 0 ? messages[messages.length - 1].content : null,
          latestMessageTime: messages.length > 0 ? messages[messages.length - 1].timestamp : null
        };
      } catch (e) {
        return {
          id: conv.id,
          sessionId: conv.sessionId,
          status: conv.status,
          messageCount: 0,
          createdAt: conv.createdAt,
          messages: [],
          error: `Failed to parse messages: ${e instanceof Error ? e.message : String(e)}`
        };
      }
    });

    res.json({
      status: 'success',
      message: 'Backend chat logs retrieved successfully',
      timestamp: new Date().toISOString(),
      totalConversations: conversations.length,
      activeConversations: conversations.filter(c => c.status === 'active').length,
      conversations: detailedConversations
    });

  } catch (error) {
    console.error('🚨 Backend chat logs error:', error);
    res.status(500).json({ 
      status: 'error',
      error: 'Failed to fetch backend chat logs', 
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/rasa/customer-context/:customerId
 * Get customer intelligence data for RASA personalization
 */
router.get('/customer-context/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;
    
    // Get customer basic info
    const customer = await storage.getCustomer(customerId);
    if (!customer) {
      return res.status(404).json({
        error: 'Customer not found',
        details: `No customer found with ID '${customerId}'`
      });
    }

    // Get complete purchase history - no limit for accurate VIP/analytics data
    const customerOrders = await storage.getOrdersByCustomerId(customerId, 200); // High limit for full history
    
    // Calculate customer insights from actual order data
    const recentOrdersTotal = customerOrders.reduce((sum, order) => sum + parseFloat(order.total || '0'), 0);
    const totalSpent = parseFloat(customer.totalSpent || '0'); // Lifetime total
    const isVip = customer.status === 'vip' || totalSpent > 5000000; // 5M VND = VIP
    const averageOrderValue = customerOrders.length > 0 ? recentOrdersTotal / customerOrders.length : 0;
    
    // Batch-load all order items in one query to avoid N+1 queries
    const orderIds = customerOrders.map(order => order.id);
    const allOrderItems = await storage.getOrderItemsByOrderIds(orderIds);

    // Get unique product IDs and batch-load all products in one query
    const uniqueProductIds = Array.from(new Set(allOrderItems.map(item => item.productId)));
    const products = await storage.getProductsByIds(uniqueProductIds);
    const productsMap = new Map(products.map(p => [p.id, p]));

    // Calculate frequencies using batch-loaded data
    const categoryFrequency: Record<string, number> = {};
    const productFrequency: Record<string, number> = {};
    
    for (const item of allOrderItems) {
      const product = productsMap.get(item.productId);
      if (product) {
        const qty = parseInt(item.quantity.toString());
        
        // Count products
        productFrequency[product.id] = (productFrequency[product.id] || 0) + qty;
        
        // Count categories
        if (product.categoryId) {
          categoryFrequency[product.categoryId] = (categoryFrequency[product.categoryId] || 0) + qty;
        }
      }
    }
    
    // Get top 3 favorite categories with names - batch load all categories
    const topCategoryIds = Object.entries(categoryFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([categoryId]) => categoryId);
      
    const categories = await storage.getCategoriesByIds(topCategoryIds);
    const categoriesMap = new Map(categories.map(c => [c.id, c]));
    
    const favoriteCategories = topCategoryIds.map(categoryId => {
      const category = categoriesMap.get(categoryId);
      return category ? {
        id: category.id,
        name: category.name,
        purchaseCount: categoryFrequency[categoryId]
      } : null;
    }).filter(Boolean);
    
    // Get top 3 favorite products with details - using already loaded products
    const topProductIds = Object.entries(productFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([productId]) => productId);
      
    const favoriteProducts = topProductIds.map(productId => {
      const product = productsMap.get(productId);
      return product ? {
        id: product.id,
        name: product.name,
        price: product.price,
        purchaseCount: productFrequency[productId]
      } : null;
    }).filter(Boolean);

    // Build context for RASA
    const customerContext = {
      // Basic Info
      customerId: customer.id,
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      
      // Status & Loyalty
      isVip,
      status: customer.status,
      joinDate: customer.joinDate,
      totalOrders: customerOrders.length,
      
      // Financial Intelligence  
      totalSpent,
      averageOrderValue,
      creditLimit: parseFloat(customer.creditLimit || '0'),
      totalDebt: parseFloat(customer.totalDebt || '0'),
      
      // Behavioral Intelligence  
      favoriteCategories,
      favoriteProducts,
      recentOrders: customerOrders.slice(0, 3).map(order => ({
        id: order.id,
        date: order.createdAt,
        total: parseFloat(order.total || '0'),
        status: order.status
      })),
      
      // Social Media Integration
      hasFacebook: !!customer.socialData?.facebookId,
      facebookId: customer.socialData?.facebookId,
      
      // Conversation History  
      previousInteractions: 0, // TODO: Add conversation count when available
      lastContactDate: new Date().toISOString()
    };

    res.json({
      success: true,
      data: customerContext,
      message: 'Customer context retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching customer context:', error);
    res.status(500).json({
      error: 'Failed to fetch customer context',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;