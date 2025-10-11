import { Router } from 'express';
import { DatabaseStorage } from '../storage';
import { z } from 'zod';

const router = Router();
const storage = new DatabaseStorage();

interface UnifiedMessage {
  id: string;
  content: string;
  senderType: 'user' | 'bot';
  timestamp: string;
}

interface UnifiedConversation {
  id: string;
  sessionId: string;
  customerName: string;
  customerAvatar: string | null;
  isVIP: boolean;
  status: string;
  messages: UnifiedMessage[];
  createdAt: string;
  updatedAt: string;
  lastMessage: string | null;
  source: 'facebook' | 'webchat';
}

router.get('/merged', async (req, res) => {
  try {
    const { limit = '50' } = req.query;
    const limitNum = parseInt(limit as string, 10);
    
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({
        error: 'Invalid limit parameter',
        details: 'Limit must be a number between 1 and 100'
      });
    }

    const unifiedConversations: UnifiedConversation[] = [];

    const halfLimit = Math.floor(limitNum / 2);

    const [facebookConvos, chatbotConvos] = await Promise.all([
      storage.getFacebookConversations(undefined, halfLimit),
      storage.getChatbotConversations(halfLimit)
    ]);

    for (const fbConvo of facebookConvos) {
      const fbMessages = await storage.getFacebookMessages(fbConvo.id);
      
      const messages: UnifiedMessage[] = fbMessages.map(msg => ({
        id: msg.id,
        content: msg.content || '',
        senderType: msg.senderType === 'page' ? 'bot' : 'user',
        timestamp: msg.timestamp
      }));

      const lastMessage = fbMessages.length > 0 
        ? fbMessages[fbMessages.length - 1].content || null
        : null;

      unifiedConversations.push({
        id: fbConvo.id,
        sessionId: fbConvo.participantId,
        customerName: fbConvo.participantName,
        customerAvatar: fbConvo.participantAvatar || null,
        isVIP: false,
        status: fbConvo.status,
        messages,
        createdAt: fbConvo.createdAt || new Date().toISOString(),
        updatedAt: fbConvo.updatedAt || new Date().toISOString(),
        lastMessage,
        source: 'facebook'
      });
    }

    for (const chatConvo of chatbotConvos) {
      let customerName = 'Guest';
      let customerAvatar: string | null = null;
      let isVIP = false;

      if (chatConvo.customerId) {
        try {
          const customer = await storage.getCustomer(chatConvo.customerId);
          if (customer) {
            customerName = customer.name || 'Guest';
            customerAvatar = customer.avatar || null;
            isVIP = customer.membershipTier === 'vip' || customer.membershipTier === 'platinum';
          }
        } catch (error) {
          console.error(`Error fetching customer ${chatConvo.customerId}:`, error);
        }
      }

      const messagesArray = Array.isArray(chatConvo.messages) ? chatConvo.messages : [];
      const messages: UnifiedMessage[] = messagesArray.map((msg: any, index: number) => ({
        id: msg.id || `${chatConvo.id}-${index}`,
        content: msg.content || msg.text || '',
        senderType: msg.senderType === 'bot' ? 'bot' : 'user',
        timestamp: msg.timestamp || msg.createdAt || new Date().toISOString()
      }));

      const lastMessage = messages.length > 0 
        ? messages[messages.length - 1].content 
        : null;

      unifiedConversations.push({
        id: chatConvo.id,
        sessionId: chatConvo.sessionId,
        customerName,
        customerAvatar,
        isVIP,
        status: chatConvo.status,
        messages,
        createdAt: chatConvo.createdAt || new Date().toISOString(),
        updatedAt: chatConvo.updatedAt || new Date().toISOString(),
        lastMessage,
        source: 'webchat'
      });
    }

    unifiedConversations.sort((a, b) => {
      const dateA = new Date(a.updatedAt).getTime();
      const dateB = new Date(b.updatedAt).getTime();
      return dateB - dateA;
    });

    res.json({
      success: true,
      data: unifiedConversations,
      count: unifiedConversations.length,
      total: unifiedConversations.length,
      limit: limitNum,
      facebook: facebookConvos.length,
      webchat: chatbotConvos.length
    });
  } catch (error) {
    console.error('Error fetching merged chat logs:', error);
    res.status(500).json({
      error: 'Failed to fetch merged chat logs',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
