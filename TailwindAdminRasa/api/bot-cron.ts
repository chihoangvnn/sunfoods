import { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../server/storage';

/**
 * 🤖 BOT CRON JOBS API
 * Trigger bot intelligence tasks from external cron services
 * Usage: POST /api/bot-cron?action=daily_tier_check|weekly_cart_recovery
 */

async function sendFacebookMessage(customerId: string, message: string): Promise<boolean> {
  try {
    const customer = await storage.getCustomer(customerId);
    
    if (!customer?.socialData?.facebookId) {
      console.log(`⚠️ Customer ${customerId} has no Facebook ID`);
      return false;
    }
    
    console.log(`📱 Would send Facebook message to ${customer.name || customerId}: ${message.substring(0, 50)}...`);
    
    return true;
  } catch (error) {
    console.error(`❌ Error sending Facebook message:`, error);
    return false;
  }
}

async function executeDailyTierCheck(): Promise<{ notificationsSent: number; errors: number; details: any[] }> {
  console.log('🎯 Running daily tier upgrade check...');
  
  const customers = await storage.getCustomers(1000);
  let notificationsSent = 0;
  let errors = 0;
  const details: any[] = [];
  
  const baseUrl = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : (process.env.API_BASE_URL || 'http://localhost:5000');
  
  for (const customer of customers) {
    try {
      const response = await fetch(`${baseUrl}/api/bot/tier/check-upgrade/${customer.id}`);
      
      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.canUpgrade && data.shouldNotify) {
        const message = `🎉 Chào ${customer.name || 'bạn'}!\n\n` +
          `Bạn chỉ còn ${data.amountNeeded.toLocaleString('vi-VN')}đ nữa là đạt hạng ${data.nextTier}! ` +
          `Hiện tại bạn đã chi tiêu ở mức ${data.progressPercent}%.\n\n` +
          `Mua thêm ngay hôm nay để nhận:\n${data.benefits.map((b: string) => `✨ ${b}`).join('\n')}`;
        
        const sent = await sendFacebookMessage(customer.id, message);
        if (sent) {
          notificationsSent++;
          details.push({
            customerId: customer.id,
            customerName: customer.name,
            currentTier: data.currentTier,
            amountNeeded: data.amountNeeded,
            nextTier: data.nextTier,
            progressPercent: data.progressPercent,
            messageSent: true
          });
        }
      }
      
    } catch (error) {
      console.error(`Error checking tier for customer ${customer.id}:`, error);
      errors++;
    }
  }
  
  return { notificationsSent, errors, details };
}

async function executeWeeklyCartRecovery(): Promise<{ notificationsSent: number; errors: number; details: any[] }> {
  console.log('🛒 Running weekly cart recovery...');
  
  const customers = await storage.getCustomers(1000);
  let notificationsSent = 0;
  let errors = 0;
  const details: any[] = [];
  
  const baseUrl = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : (process.env.API_BASE_URL || 'http://localhost:5000');
  
  for (const customer of customers) {
    try {
      const response = await fetch(`${baseUrl}/api/bot/cart/recover/${customer.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.abandonedItems && data.abandonedItems.length > 0) {
        const productsList = data.abandonedItems
          .slice(0, 3)
          .map((p: any) => `• ${p.name} (${p.quantity} cái)`)
          .join('\n');
        
        const message = `🛒 Chào ${customer.name || 'bạn'}!\n\n` +
          `Bạn còn ${data.abandonedItems.length} sản phẩm trong giỏ hàng chưa thanh toán:\n\n${productsList}\n\n` +
          `Hoàn tất đơn hàng ngay hôm nay để không bỏ lỡ ưu đãi! 🎁`;
        
        const sent = await sendFacebookMessage(customer.id, message);
        if (sent) {
          notificationsSent++;
          details.push({
            customerId: customer.id,
            customerName: customer.name,
            abandonedCount: data.abandonedItems.length,
            messageSent: true
          });
        }
      }
      
    } catch (error) {
      console.error(`Error checking cart for customer ${customer.id}:`, error);
      errors++;
    }
  }
  
  return { notificationsSent, errors, details };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST' && req.method !== 'GET') {
      return res.status(405).json({
        status: 'error',
        message: 'Method not allowed'
      });
    }
    
    const { action } = req.query;
    
    if (!action) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing action parameter. Use: ?action=daily_tier_check|weekly_cart_recovery'
      });
    }
    
    const startTime = Date.now();
    
    if (action === 'daily_tier_check') {
      const result = await executeDailyTierCheck();
      const executionTime = Date.now() - startTime;
      
      return res.json({
        status: 'success',
        action: 'daily_tier_check',
        executionTime: `${executionTime}ms`,
        notificationsSent: result.notificationsSent,
        errors: result.errors,
        details: result.details
      });
      
    } else if (action === 'weekly_cart_recovery') {
      const result = await executeWeeklyCartRecovery();
      const executionTime = Date.now() - startTime;
      
      return res.json({
        status: 'success',
        action: 'weekly_cart_recovery',
        executionTime: `${executionTime}ms`,
        notificationsSent: result.notificationsSent,
        errors: result.errors,
        details: result.details
      });
      
    } else {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid action. Use: daily_tier_check or weekly_cart_recovery'
      });
    }
    
  } catch (error) {
    console.error('Bot cron job error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to execute bot cron job',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
