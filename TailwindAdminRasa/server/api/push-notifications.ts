import { Router } from 'express';
import { storage } from '../storage';
import { z } from 'zod';
import type { InsertPushSubscription } from '@shared/schema';

const router = Router();

const pushSubscriptionSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string(),
  }),
  customerId: z.string().optional(),
  userId: z.string().optional(),
  deviceInfo: z.object({
    userAgent: z.string(),
    platform: z.string(),
    language: z.string(),
  }).optional(),
  notificationTypes: z.array(z.enum(['order_updates', 'messages', 'promotions', 'system'])).optional(),
});

router.post('/subscribe', async (req, res) => {
  try {
    const data = pushSubscriptionSchema.parse(req.body);
    
    const existingSubscription = await storage.getPushSubscriptionByEndpoint(data.endpoint);
    
    if (existingSubscription) {
      const updated = await storage.updatePushSubscription(existingSubscription.id, {
        keys: data.keys,
        customerId: data.customerId || existingSubscription.customerId,
        userId: data.userId || existingSubscription.userId,
        userAgent: data.deviceInfo?.userAgent || existingSubscription.userAgent,
        notificationTypes: data.notificationTypes || existingSubscription.notificationTypes,
        isActive: true,
      });
      
      return res.json({ 
        success: true, 
        subscription: updated,
        message: 'Subscription updated successfully'
      });
    }
    
    const subscription: InsertPushSubscription = {
      endpoint: data.endpoint,
      keys: data.keys,
      customerId: data.customerId || null,
      userId: data.userId || null,
      userAgent: data.deviceInfo?.userAgent || null,
      notificationTypes: data.notificationTypes || ['order_updates', 'messages', 'promotions'],
      isActive: true,
    };
    
    const created = await storage.createPushSubscription(subscription);
    
    res.json({ 
      success: true, 
      subscription: created,
      message: 'Subscription created successfully'
    });
  } catch (error) {
    console.error('Error creating push subscription:', error);
    res.status(400).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create subscription' 
    });
  }
});

router.post('/unsubscribe', async (req, res) => {
  try {
    const { endpoint } = req.body;
    
    if (!endpoint) {
      return res.status(400).json({ 
        success: false, 
        error: 'Endpoint is required' 
      });
    }
    
    const subscription = await storage.getPushSubscriptionByEndpoint(endpoint);
    
    if (!subscription) {
      return res.status(404).json({ 
        success: false, 
        error: 'Subscription not found' 
      });
    }
    
    await storage.deletePushSubscription(subscription.id);
    
    res.json({ 
      success: true, 
      message: 'Unsubscribed successfully' 
    });
  } catch (error) {
    console.error('Error unsubscribing:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to unsubscribe' 
    });
  }
});

router.get('/customer/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;
    const subscriptions = await storage.getPushSubscriptionsByCustomer(customerId);
    
    res.json({ 
      success: true, 
      subscriptions 
    });
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch subscriptions' 
    });
  }
});

router.patch('/:id/settings', async (req, res) => {
  try {
    const { id } = req.params;
    const { notificationTypes, isActive } = req.body;
    
    const updated = await storage.updatePushSubscription(id, {
      notificationTypes,
      isActive,
    });
    
    if (!updated) {
      return res.status(404).json({ 
        success: false, 
        error: 'Subscription not found' 
      });
    }
    
    res.json({ 
      success: true, 
      subscription: updated 
    });
  } catch (error) {
    console.error('Error updating subscription settings:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update settings' 
    });
  }
});

export default router;
