import { Router } from 'express';
import { storage } from '../storage';
import { PushNotificationService } from '../services/push-notification-service';
import type { InsertVendorPushSubscription } from '../../shared/schema';

const router = Router();

router.post('/subscribe', async (req, res) => {
  try {
    const vendorId = req.session.vendorId;
    
    if (!vendorId) {
      return res.status(401).json({ error: 'Vendor not authenticated' });
    }

    const { endpoint, keys, platform } = req.body;

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return res.status(400).json({ error: 'Missing required subscription data' });
    }

    const subscription: InsertVendorPushSubscription = {
      vendorId,
      endpoint,
      p256dh: keys.p256dh,
      auth: keys.auth,
      platform: platform || 'web',
      isActive: true
    };

    const created = await storage.createVendorPushSubscription(subscription);

    console.log(`📱 Created vendor push subscription: ${created.id} for vendor: ${vendorId}`);

    res.json({
      success: true,
      subscriptionId: created.id,
      vapidPublicKey: PushNotificationService.getVapidPublicKey()
    });
  } catch (error) {
    console.error('Error creating vendor push subscription:', error);
    res.status(500).json({ error: 'Failed to create subscription' });
  }
});

router.delete('/unsubscribe/:id', async (req, res) => {
  try {
    const vendorId = req.session.vendorId;
    
    if (!vendorId) {
      return res.status(401).json({ error: 'Vendor not authenticated' });
    }

    const { id } = req.params;

    const subscription = await storage.getVendorPushSubscriptionById(id);

    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    if (subscription.vendorId !== vendorId) {
      return res.status(403).json({ error: 'Unauthorized to delete this subscription' });
    }

    await storage.deleteVendorPushSubscription(id);

    console.log(`🗑️ Deleted vendor push subscription: ${id} for vendor: ${vendorId}`);

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting vendor push subscription:', error);
    res.status(500).json({ error: 'Failed to delete subscription' });
  }
});

router.get('/subscriptions', async (req, res) => {
  try {
    const vendorId = req.session.vendorId;
    
    if (!vendorId) {
      return res.status(401).json({ error: 'Vendor not authenticated' });
    }

    const subscriptions = await storage.getVendorPushSubscriptions(vendorId);

    const formatted = subscriptions.map(sub => ({
      id: sub.id,
      platform: sub.platform,
      isActive: sub.isActive,
      createdAt: sub.createdAt
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Error fetching vendor subscriptions:', error);
    res.status(500).json({ error: 'Failed to fetch subscriptions' });
  }
});

router.get('/vapid-public-key', (req, res) => {
  const publicKey = PushNotificationService.getVapidPublicKey();
  
  if (!publicKey) {
    return res.status(503).json({ error: 'VAPID keys not configured' });
  }

  res.json({ publicKey });
});

router.post('/check-low-stock', async (req, res) => {
  try {
    const { db } = await import('../db');
    const { products, vendors } = await import('../../shared/schema');
    const { eq, lt, and } = await import('drizzle-orm');

    const lowStockThreshold = 10;

    const lowStockProducts = await db
      .select({
        id: products.id,
        name: products.name,
        stock: products.stock,
        vendorId: products.vendorId
      })
      .from(products)
      .where(and(
        lt(products.stock, lowStockThreshold),
        eq(products.isActive, true)
      ));

    let notificationsSent = 0;

    for (const product of lowStockProducts) {
      if (!product.vendorId) continue;

      try {
        await PushNotificationService.sendLowStockNotification(
          product.vendorId,
          product.name,
          product.id,
          product.stock
        );
        notificationsSent++;
      } catch (error) {
        console.error(`Failed to send low stock notification for product ${product.id}:`, error);
      }
    }

    console.log(`⚠️ Sent ${notificationsSent} low stock notifications for ${lowStockProducts.length} products`);

    res.json({
      success: true,
      productsChecked: lowStockProducts.length,
      notificationsSent
    });
  } catch (error) {
    console.error('Error checking low stock:', error);
    res.status(500).json({ error: 'Failed to check low stock' });
  }
});

router.post('/check-payment-reminders', async (req, res) => {
  try {
    const { db } = await import('../db');
    const { vendors } = await import('../../shared/schema');
    const { gt } = await import('drizzle-orm');

    const vendorsWithDebt = await db
      .select({
        id: vendors.id,
        name: vendors.name,
        monthlyDebt: vendors.monthlyDebt
      })
      .from(vendors)
      .where(gt(vendors.monthlyDebt, 0));

    const daysUntilDue = 3;
    let notificationsSent = 0;

    for (const vendor of vendorsWithDebt) {
      try {
        await PushNotificationService.sendPaymentReminderNotification(
          vendor.id,
          vendor.monthlyDebt,
          daysUntilDue
        );
        notificationsSent++;
      } catch (error) {
        console.error(`Failed to send payment reminder for vendor ${vendor.id}:`, error);
      }
    }

    console.log(`💰 Sent ${notificationsSent} payment reminders to ${vendorsWithDebt.length} vendors with debt`);

    res.json({
      success: true,
      vendorsChecked: vendorsWithDebt.length,
      notificationsSent
    });
  } catch (error) {
    console.error('Error checking payment reminders:', error);
    res.status(500).json({ error: 'Failed to check payment reminders' });
  }
});

export default router;
