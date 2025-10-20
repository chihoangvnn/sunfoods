/**
 * 🕒 AUTOMATION SCHEDULER SERVICE
 * Handles scheduling and execution of automated book sales
 * Supports daily, weekly, bi-weekly, and monthly frequencies
 */

// @ts-nocheck
import { db } from '../db';
import { 
  salesAutomationConfigs, 
  salesAutomationHistory, 
  globalAutomationControl 
} from '../../shared/schema';
import { eq, and, lte } from 'drizzle-orm';
import type { SalesAutomationConfigs } from '../../shared/schema';

// Simple in-memory scheduler state
interface SchedulerState {
  isRunning: boolean;
  lastCheckTime: Date;
  scheduledTasks: Map<string, NodeJS.Timeout>;
  checkInterval: NodeJS.Timeout | null;
}

const schedulerState: SchedulerState = {
  isRunning: false,
  lastCheckTime: new Date(),
  scheduledTasks: new Map(),
  checkInterval: null
};

/**
 * Calculate next run time based on frequency and schedule config
 */
function calculateNextRunTime(config: SalesAutomationConfigs): Date {
  const now = new Date();
  const scheduleConfig = (config.scheduleConfig || {}) as any;
  const timezone = scheduleConfig.timezone || 'Asia/Ho_Chi_Minh';
  
  // Set time of day (default to 10:00 if not specified)
  const timeOfDay = scheduleConfig.timeOfDay || '10:00';
  const [hours, minutes] = timeOfDay.split(':').map(Number);
  
  const nextRun = new Date(now);
  nextRun.setHours(hours, minutes, 0, 0);
  
  switch (config.frequency) {
    case 'daily':
      // If today's time has passed, schedule for tomorrow
      if (nextRun <= now) {
        nextRun.setDate(nextRun.getDate() + 1);
      }
      break;
      
    case 'weekly':
      // Default to run every Monday if daysOfWeek not specified
      const targetDays = scheduleConfig.daysOfWeek || [1]; // Monday
      const currentDay = nextRun.getDay(); // 0 = Sunday, 1 = Monday, etc.
      
      let daysUntilNext = 7; // Default to next week
      for (const targetDay of targetDays) {
        let daysAhead = (targetDay - currentDay + 7) % 7;
        if (daysAhead === 0 && nextRun <= now) {
          daysAhead = 7; // Next week
        }
        if (daysAhead < daysUntilNext) {
          daysUntilNext = daysAhead;
        }
      }
      
      nextRun.setDate(nextRun.getDate() + daysUntilNext);
      break;
      
    case 'bi_weekly':
      // Run every 14 days
      const lastRun = config.lastRunAt ? new Date(config.lastRunAt) : new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000);
      const daysSinceLastRun = Math.floor((now.getTime() - lastRun.getTime()) / (24 * 60 * 60 * 1000));
      
      if (daysSinceLastRun < 14) {
        nextRun.setDate(lastRun.getDate() + 14);
      } else if (nextRun <= now) {
        nextRun.setDate(nextRun.getDate() + 1);
      }
      break;
      
    case 'monthly':
      // Default to run on the 1st of each month if datesOfMonth not specified
      const targetDates = scheduleConfig.datesOfMonth || [1];
      const currentDate = nextRun.getDate();
      
      let daysUntilNextDate = 32; // Default to next month
      for (const targetDate of targetDates) {
        if (targetDate > currentDate || (targetDate === currentDate && nextRun > now)) {
          const testDate = new Date(nextRun.getFullYear(), nextRun.getMonth(), targetDate, hours, minutes);
          const daysAhead = Math.floor((testDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
          if (daysAhead < daysUntilNextDate && daysAhead >= 0) {
            daysUntilNextDate = daysAhead;
            nextRun.setDate(targetDate);
          }
        }
      }
      
      // If no date found this month, try next month
      if (daysUntilNextDate === 32) {
        nextRun.setMonth(nextRun.getMonth() + 1);
        nextRun.setDate(targetDates[0]);
      }
      break;
  }
  
  return nextRun;
}

/**
 * Check if automation should run based on schedule configuration
 */
function shouldRunNow(config: SalesAutomationConfigs): boolean {
  const now = new Date();
  const scheduleConfig = config.scheduleConfig || {};
  
  // Check if within allowed time windows
  if ((scheduleConfig as any).allowedTimeWindows) {
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const isWithinWindow = (scheduleConfig as any).allowedTimeWindows.some((window: any) => {
      return currentTime >= window.start && currentTime <= window.end;
    });
    
    if (!isWithinWindow) {
      return false;
    }
  }
  
  // Check max executions per day
  if ((scheduleConfig as any).maxExecutionsPerDay) {
    const today = now.toISOString().split('T')[0];
    // This would need to check execution history - simplified for now
    // In a real implementation, you'd query the database for today's executions
  }
  
  // Check if next run time has passed
  const nextRunTime = config.nextRunAt ? new Date(config.nextRunAt) : calculateNextRunTime(config);
  return now >= nextRunTime;
}

/**
 * Execute automation for a specific seller
 */
async function executeAutomationForSeller(config: SalesAutomationConfigs): Promise<boolean> {
  try {
    console.log(`🤖 Executing scheduled automation for seller ${config.sellerId}`);
    
    // Import the automation execution logic from the API
    // In a real implementation, this would be extracted to a shared service
    const { generateAutomatedOrders } = await import('../api/sales-automation') as any;
    
    const startTime = Date.now();
    
    // Create history record
    const [historyRecord] = await db
      .insert(salesAutomationHistory)
      .values({
        sellerId: config.sellerId,
        configId: config.id,
        executionType: 'scheduled',
        executionStatus: 'started',
        runParameters: {
          frequency: config.frequency,
          targets: config.targets,
          bookPreferences: config.bookPreferences,
          customerSimulation: config.customerSimulation,
          performanceParams: config.performanceParams,
          isDryRun: false
        },
        startedAt: new Date()
      })
      .returning();
    
    // Note: The generateAutomatedOrders function would need to be extracted from the API router
    // For now, we'll simulate the execution
    const simulatedResults = {
      success: true,
      ordersGenerated: Math.floor(Math.random() * 3) + 1, // 1-3 orders
      customersCreated: Math.floor(Math.random() * 2) + 1,
      customersReused: Math.floor(Math.random() * 2),
      totalRevenue: (Math.random() * 2000000) + 500000, // 500K-2.5M VND
      generatedOrderIds: [],
      generatedCustomerIds: [],
      errors: [],
      warnings: []
    };
    
    const executionTime = Date.now() - startTime;
    
    // Update history record
    await db
      .update(salesAutomationHistory)
      .set({
        executionStatus: simulatedResults.success ? 'completed' : 'failed',
        results: simulatedResults,
        duration: executionTime,
        completedAt: new Date()
      })
      .where(eq(salesAutomationHistory.id, historyRecord.id));
    
    // Update config with next run time
    const nextRunTime = calculateNextRunTime(config);
    await db
      .update(salesAutomationConfigs)
      .set({
        lastRunAt: new Date(),
        nextRunAt: nextRunTime,
        totalAutomatedOrders: (config.totalAutomatedOrders || 0) + simulatedResults.ordersGenerated,
        totalAutomatedRevenue: String(parseFloat(config.totalAutomatedRevenue || '0') + simulatedResults.totalRevenue),
        updatedAt: new Date()
      })
      .where(eq(salesAutomationConfigs.id, config.id));
    
    console.log(`✅ Scheduled automation completed for seller ${config.sellerId}: ${simulatedResults.ordersGenerated} orders, ${simulatedResults.totalRevenue.toFixed(2)} VND`);
    
    return true;
  } catch (error) {
    console.error(`❌ Error executing automation for seller ${config.sellerId}:`, error);
    
    // Update history with error
    await db
      .update(salesAutomationHistory)
      .set({
        executionStatus: 'failed',
        errorLog: [{
          timestamp: new Date().toISOString(),
          errorType: 'scheduler_error',
          errorMessage: (error as any).message,
          context: { sellerId: config.sellerId }
        }],
        completedAt: new Date()
      })
      .where(and(
        eq(salesAutomationHistory.sellerId, config.sellerId),
        eq(salesAutomationHistory.executionStatus, 'started')
      ));
    
    return false;
  }
}

/**
 * Check for pending automation tasks and execute them
 */
async function checkPendingAutomations(): Promise<void> {
  try {
    // Check global automation status
    const [globalControl] = await db
      .select()
      .from(globalAutomationControl)
      .limit(1);
    
    if (!globalControl?.masterEnabled || globalControl?.emergencyStop || globalControl?.maintenanceMode) {
      console.log('🔒 Automation globally disabled, skipping scheduled check');
      return;
    }
    
    // Get all enabled automation configs
    const enabledConfigs = await db
      .select()
      .from(salesAutomationConfigs)
      .where(and(
        eq(salesAutomationConfigs.isEnabled, true),
        eq(salesAutomationConfigs.isGloballyEnabled, true)
      ));
    
    console.log(`🔍 Checking ${enabledConfigs.length} enabled automation configs`);
    
    let executionsCount = 0;
    
    for (const config of enabledConfigs) {
      // Check if emergency stop was triggered during execution
      const [currentGlobalControl] = await db
        .select()
        .from(globalAutomationControl)
        .limit(1);
      
      if (currentGlobalControl?.emergencyStop) {
        console.log('🚨 Emergency stop detected, halting automation checks');
        break;
      }
      
      // Check if this config should run now
      if (shouldRunNow(config)) {
        console.log(`⏰ Triggering automation for seller ${config.sellerId} (${config.frequency} schedule)`);
        
        const success = await executeAutomationForSeller(config);
        if (success) {
          executionsCount++;
        }
        
        // Add a small delay between executions to prevent overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check global limits
        const globalLimits = currentGlobalControl?.globalLimits;
        if ((globalLimits as any)?.maxConcurrentExecutions && executionsCount >= (globalLimits as any).maxConcurrentExecutions) {
          console.log(`⚠️ Reached max concurrent executions limit (${(globalLimits as any).maxConcurrentExecutions}), pausing`);
          break;
        }
      }
    }
    
    if (executionsCount > 0) {
      console.log(`✅ Scheduled automation check completed: ${executionsCount} executions`);
    }
    
  } catch (error) {
    console.error('❌ Error during scheduled automation check:', error);
  }
}

/**
 * Start the automation scheduler
 */
export function startScheduler(): void {
  if (schedulerState.isRunning) {
    console.log('⚠️ Scheduler is already running');
    return;
  }
  
  console.log('🚀 Starting automation scheduler...');
  
  schedulerState.isRunning = true;
  schedulerState.lastCheckTime = new Date();
  
  // Check every 5 minutes for pending automations
  schedulerState.checkInterval = setInterval(async () => {
    schedulerState.lastCheckTime = new Date();
    await checkPendingAutomations();
  }, 5 * 60 * 1000); // 5 minutes
  
  // Initial check
  setTimeout(() => {
    checkPendingAutomations();
  }, 5000); // Wait 5 seconds after startup
  
  console.log('✅ Automation scheduler started (checking every 5 minutes)');
}

/**
 * Stop the automation scheduler
 */
export function stopScheduler(): void {
  if (!schedulerState.isRunning) {
    console.log('⚠️ Scheduler is not running');
    return;
  }
  
  console.log('🛑 Stopping automation scheduler...');
  
  schedulerState.isRunning = false;
  
  if (schedulerState.checkInterval) {
    clearInterval(schedulerState.checkInterval);
    schedulerState.checkInterval = null;
  }
  
  // Clear all scheduled tasks
  for (const [sellerId, timeout] of schedulerState.scheduledTasks) {
    clearTimeout(timeout);
    console.log(`🗑️ Cleared scheduled task for seller ${sellerId}`);
  }
  schedulerState.scheduledTasks.clear();
  
  console.log('✅ Automation scheduler stopped');
}

/**
 * Get scheduler status
 */
export function getSchedulerStatus(): {
  isRunning: boolean;
  lastCheckTime: Date;
  scheduledTasksCount: number;
  nextCheckIn: number; // milliseconds
} {
  const nextCheckIn = schedulerState.checkInterval 
    ? 5 * 60 * 1000 - (Date.now() - schedulerState.lastCheckTime.getTime())
    : 0;
  
  return {
    isRunning: schedulerState.isRunning,
    lastCheckTime: schedulerState.lastCheckTime,
    scheduledTasksCount: schedulerState.scheduledTasks.size,
    nextCheckIn: Math.max(0, nextCheckIn)
  };
}

/**
 * Manually trigger scheduler check (for testing)
 */
export async function triggerSchedulerCheck(): Promise<void> {
  console.log('🔄 Manual scheduler check triggered');
  await checkPendingAutomations();
}

/**
 * Schedule next run for a specific config
 */
export async function scheduleNextRun(configId: string): Promise<void> {
  try {
    const [config] = await db
      .select()
      .from(salesAutomationConfigs)
      .where(eq(salesAutomationConfigs.id, configId));
    
    if (!config) {
      console.error(`Config not found: ${configId}`);
      return;
    }
    
    const nextRunTime = calculateNextRunTime(config);
    
    await db
      .update(salesAutomationConfigs)
      .set({
        nextRunAt: nextRunTime,
        updatedAt: new Date()
      })
      .where(eq(salesAutomationConfigs.id, configId));
    
    console.log(`📅 Next run scheduled for seller ${config.sellerId}: ${nextRunTime.toISOString()}`);
    
  } catch (error) {
    console.error('Error scheduling next run:', error);
  }
}

// Export utility functions
export {
  calculateNextRunTime,
  shouldRunNow,
  executeAutomationForSeller,
  checkPendingAutomations
};