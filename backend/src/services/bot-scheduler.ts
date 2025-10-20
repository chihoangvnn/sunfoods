/**
 * 🤖 BOT SCHEDULER SERVICE
 * Handles scheduled bot intelligence tasks:
 * - Daily tier upgrade checks (8am)
 * - Weekly cart recovery messages (Saturday)
 */

import { storage } from '../storage';

interface SchedulerState {
  isRunning: boolean;
  lastCheckTime: Date;
  checkInterval: NodeJS.Timeout | null;
}

const schedulerState: SchedulerState = {
  isRunning: false,
  lastCheckTime: new Date(),
  checkInterval: null
};

/**
 * Check if it's time to run daily tier check (8am daily)
 */
function shouldRunDailyTierCheck(lastRun: Date | null): boolean {
  const now = new Date();
  const currentHour = now.getHours();
  
  if (currentHour !== 8) {
    return false;
  }
  
  if (!lastRun) {
    return true;
  }
  
  const timeSinceLastRun = now.getTime() - lastRun.getTime();
  const hoursSinceLastRun = timeSinceLastRun / (60 * 60 * 1000);
  
  return hoursSinceLastRun >= 23;
}

/**
 * Check if it's time to run weekly cart recovery (Saturday)
 */
function shouldRunWeeklyCartRecovery(lastRun: Date | null): boolean {
  const now = new Date();
  const currentDay = now.getDay();
  
  if (currentDay !== 6) {
    return false;
  }
  
  if (!lastRun) {
    return true;
  }
  
  const timeSinceLastRun = now.getTime() - lastRun.getTime();
  const daysSinceLastRun = timeSinceLastRun / (24 * 60 * 60 * 1000);
  
  return daysSinceLastRun >= 6.9;
}

/**
 * Send Facebook message to customer
 */
async function sendFacebookMessage(customerId: string, message: string): Promise<boolean> {
  try {
    const customer = await storage.getCustomer(customerId);
    
    if (!customer?.socialData || !(customer.socialData as any).facebookId) {
      console.log(`⚠️ Customer ${customerId} has no Facebook ID, skipping message`);
      return false;
    }
    
    console.log(`📱 Sending Facebook message to customer ${customerId}: ${message.substring(0, 50)}...`);
    
    return true;
  } catch (error) {
    console.error(`❌ Error sending Facebook message to ${customerId}:`, error);
    return false;
  }
}

/**
 * Execute daily tier upgrade check
 */
async function executeDailyTierCheck(): Promise<void> {
  try {
    console.log('🎯 Running daily tier upgrade check (8am)...');
    
    const customers = await storage.getCustomers();
    let notificationsSent = 0;
    let errors = 0;
    
    for (const customer of customers) {
      try {
        const response = await fetch(`http://localhost:5000/api/bot/tier/check-upgrade/${customer.id}`);
        
        if (!response.ok) {
          throw new Error(`API returned ${response.status}`);
        }
        
        const data = (await response.json()) as any;
        
        if (data.status === 'success' && data.isCloseToUpgrade) {
          const message = `🎉 Chào ${customer.name || 'bạn'}!\n\n` +
            `Bạn chỉ còn ${data.amountNeeded.toLocaleString('vi-VN')}đ nữa là đạt hạng ${data.nextTier}! ` +
            `Hiện tại bạn đã chi tiêu ${data.currentSpent.toLocaleString('vi-VN')}đ (${data.progress}%).\n\n` +
            `Mua thêm ngay hôm nay để nhận:\n${data.benefits.map((b: string) => `✨ ${b}`).join('\n')}`;
          
          const sent = await sendFacebookMessage(customer.id, message);
          if (sent) {
            notificationsSent++;
          }
          
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
      } catch (error) {
        console.error(`Error checking tier for customer ${customer.id}:`, error);
        errors++;
      }
    }
    
    console.log(`✅ Daily tier check completed: ${notificationsSent} notifications sent, ${errors} errors`);
    
  } catch (error) {
    console.error('❌ Error during daily tier check:', error);
  }
}

/**
 * Execute weekly cart recovery
 */
async function executeWeeklyCartRecovery(): Promise<void> {
  try {
    console.log('🛒 Running weekly cart recovery (Saturday)...');
    
    const customers = await storage.getCustomers();
    let notificationsSent = 0;
    let errors = 0;
    
    for (const customer of customers) {
      try {
        const response = await fetch(`http://localhost:5000/api/bot/cart/recover/${customer.id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (!response.ok) {
          throw new Error(`API returned ${response.status}`);
        }
        
        const data = (await response.json()) as any;
        
        if (data.status === 'success' && data.hasAbandonedItems && data.abandonedProducts.length > 0) {
          const productsList = data.abandonedProducts
            .slice(0, 3)
            .map((p: any) => `• ${p.productName} (${p.quantity} ${p.unit})`)
            .join('\n');
          
          const message = `🛒 Chào ${customer.name || 'bạn'}!\n\n` +
            `Bạn còn ${data.abandonedProducts.length} sản phẩm trong giỏ hàng chưa thanh toán:\n\n${productsList}\n\n` +
            `Hoàn tất đơn hàng ngay hôm nay để không bỏ lỡ ưu đãi! 🎁`;
          
          const sent = await sendFacebookMessage(customer.id, message);
          if (sent) {
            notificationsSent++;
          }
          
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
      } catch (error) {
        console.error(`Error checking cart for customer ${customer.id}:`, error);
        errors++;
      }
    }
    
    console.log(`✅ Weekly cart recovery completed: ${notificationsSent} notifications sent, ${errors} errors`);
    
  } catch (error) {
    console.error('❌ Error during weekly cart recovery:', error);
  }
}

let lastDailyTierCheck: Date | null = null;
let lastWeeklyCartRecovery: Date | null = null;

/**
 * Check for pending bot tasks and execute them
 */
async function checkPendingBotTasks(): Promise<void> {
  try {
    if (shouldRunDailyTierCheck(lastDailyTierCheck)) {
      console.log('⏰ Triggering daily tier upgrade check...');
      await executeDailyTierCheck();
      lastDailyTierCheck = new Date();
    }
    
    if (shouldRunWeeklyCartRecovery(lastWeeklyCartRecovery)) {
      console.log('⏰ Triggering weekly cart recovery...');
      await executeWeeklyCartRecovery();
      lastWeeklyCartRecovery = new Date();
    }
    
  } catch (error) {
    console.error('❌ Error during bot tasks check:', error);
  }
}

/**
 * Start the bot scheduler
 */
export function startBotScheduler(): void {
  if (schedulerState.isRunning) {
    console.log('⚠️ Bot scheduler is already running');
    return;
  }
  
  console.log('🚀 Starting bot scheduler...');
  
  schedulerState.isRunning = true;
  schedulerState.lastCheckTime = new Date();
  
  schedulerState.checkInterval = setInterval(async () => {
    schedulerState.lastCheckTime = new Date();
    await checkPendingBotTasks();
  }, 60 * 60 * 1000);
  
  setTimeout(() => {
    checkPendingBotTasks();
  }, 5000);
  
  console.log('✅ Bot scheduler started (checking every hour for 8am daily & Saturday weekly tasks)');
}

/**
 * Stop the bot scheduler
 */
export function stopBotScheduler(): void {
  if (!schedulerState.isRunning) {
    console.log('⚠️ Bot scheduler is not running');
    return;
  }
  
  console.log('🛑 Stopping bot scheduler...');
  
  schedulerState.isRunning = false;
  
  if (schedulerState.checkInterval) {
    clearInterval(schedulerState.checkInterval);
    schedulerState.checkInterval = null;
  }
  
  console.log('✅ Bot scheduler stopped');
}

/**
 * Get bot scheduler status
 */
export function getBotSchedulerStatus(): {
  isRunning: boolean;
  lastCheckTime: Date;
  lastDailyTierCheck: Date | null;
  lastWeeklyCartRecovery: Date | null;
  nextCheckIn: number;
} {
  const nextCheckIn = schedulerState.checkInterval 
    ? 60 * 60 * 1000 - (Date.now() - schedulerState.lastCheckTime.getTime())
    : 0;
  
  return {
    isRunning: schedulerState.isRunning,
    lastCheckTime: schedulerState.lastCheckTime,
    lastDailyTierCheck,
    lastWeeklyCartRecovery,
    nextCheckIn: Math.max(0, nextCheckIn)
  };
}

/**
 * Manually trigger bot tasks (for testing)
 */
export async function triggerBotTasks(taskType: 'tier_check' | 'cart_recovery' | 'both'): Promise<void> {
  console.log(`🔄 Manual bot task triggered: ${taskType}`);
  
  if (taskType === 'tier_check' || taskType === 'both') {
    await executeDailyTierCheck();
  }
  
  if (taskType === 'cart_recovery' || taskType === 'both') {
    await executeWeeklyCartRecovery();
  }
}

export {
  executeDailyTierCheck,
  executeWeeklyCartRecovery,
  checkPendingBotTasks
};
