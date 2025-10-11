/**
 * 🤖 SALES AUTOMATION ENGINE API
 * Comprehensive API for managing automated book sales in Vietnamese marketplace
 * Handles seller configs, order generation, scheduling, and analytics
 */

import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { 
  salesAutomationConfigs, 
  salesAutomationHistory, 
  globalAutomationControl,
  bookOrders,
  bookOrderItems,
  bookSellers,
  bookCustomers,
  products,
  categories
} from '../../shared/schema';
import type { 
  SalesAutomationConfig, 
  InsertSalesAutomationConfig,
  UpdateSalesAutomationConfig,
  SalesAutomationHistory,
  InsertSalesAutomationHistory,
  GlobalAutomationControl,
  BookOrder,
  BookOrderItem,
  BookCustomer
} from '../../shared/schema';
import { eq, and, desc, like, or, sql, gte, lte, between } from 'drizzle-orm';
import { 
  generateVietnameseCustomer, 
  generateVietnameseCustomers,
  type VietnameseCustomerData 
} from '../utils/vietnamese-data-generator';

const router = Router();

// 🔒 Authentication middleware
const requireAuth = (req: any, res: any, next: any) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ 
      error: "Unauthorized. Please log in to access automation controls.",
      code: "AUTH_REQUIRED"
    });
  }
  next();
};

const requireCSRFToken = (req: any, res: any, next: any) => {
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

// =====================================================
// 🎛️ GLOBAL AUTOMATION CONTROL ENDPOINTS
// =====================================================

// GET /api/sales-automation/global/status - Get global automation status
router.get('/global/status', async (req, res) => {
  try {
    const [globalControl] = await db
      .select()
      .from(globalAutomationControl)
      .limit(1);

    if (!globalControl) {
      // Create default global control if none exists
      const [newControl] = await db
        .insert(globalAutomationControl)
        .values({
          masterEnabled: false,
          emergencyStop: false,
          maintenanceMode: false,
          globalLimits: {
            maxOrdersPerHour: 50,
            maxOrdersPerDay: 500,
            maxRevenuePerDay: 100000000, // 100M VND
            maxConcurrentExecutions: 5,
            maxCustomersPerDay: 200
          },
          healthThresholds: {
            maxErrorRate: 0.05,
            maxExecutionTime: 30,
            minSuccessRate: 0.95,
            maxMemoryUsage: 2048,
            maxCpuUsage: 80
          },
          schedulingConfig: {
            allowedTimeWindows: [
              { start: "09:00", end: "17:00", timezone: "Asia/Ho_Chi_Minh" }
            ],
            blackoutDates: [],
            maintenanceSchedule: []
          },
          statistics: {
            totalAutomationRuns: 0,
            totalOrdersGenerated: 0,
            totalRevenueGenerated: 0,
            totalCustomersCreated: 0,
            averageSuccessRate: 0,
            lastHealthCheck: new Date().toISOString(),
            uptime: 0
          }
        })
        .returning();
      
      return res.json(newControl);
    }

    res.json(globalControl);
  } catch (error) {
    console.error("Error fetching global automation status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/sales-automation/global/toggle - Toggle master automation
router.post('/global/toggle', requireAuth, requireCSRFToken, async (req, res) => {
  try {
    const { enabled } = req.body;
    
    if (typeof enabled !== 'boolean') {
      return res.status(400).json({ error: "enabled must be a boolean" });
    }

    const [updated] = await db
      .update(globalAutomationControl)
      .set({ 
        masterEnabled: enabled,
        updatedAt: new Date(),
        lastUpdatedBy: req.session.userId
      })
      .returning();

    if (!updated) {
      return res.status(404).json({ error: "Global control record not found" });
    }

    console.log(`🤖 Global automation ${enabled ? 'ENABLED' : 'DISABLED'} by user ${req.session.userId}`);
    
    res.json({ 
      success: true, 
      masterEnabled: enabled,
      message: `Global automation ${enabled ? 'enabled' : 'disabled'} successfully`
    });
  } catch (error) {
    console.error("Error toggling global automation:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/sales-automation/global/emergency-stop - Emergency stop all automation
router.post('/global/emergency-stop', requireAuth, requireCSRFToken, async (req, res) => {
  try {
    const [updated] = await db
      .update(globalAutomationControl)
      .set({ 
        emergencyStop: true,
        masterEnabled: false,
        updatedAt: new Date(),
        lastUpdatedBy: req.session.userId,
        notes: `Emergency stop triggered by ${req.session.userId} at ${new Date().toISOString()}`
      })
      .returning();

    // Also disable all seller configs
    await db
      .update(salesAutomationConfigs)
      .set({ 
        isEnabled: false,
        updatedAt: new Date()
      });

    console.log(`🚨 EMERGENCY STOP triggered by user ${req.session.userId}`);
    
    res.json({ 
      success: true, 
      message: "Emergency stop activated. All automation disabled." 
    });
  } catch (error) {
    console.error("Error executing emergency stop:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// =====================================================
// 🏪 SELLER AUTOMATION CONFIG ENDPOINTS
// =====================================================

// GET /api/sales-automation/configs - List all seller automation configs
router.get('/configs', async (req, res) => {
  try {
    const configs = await db
      .select({
        config: salesAutomationConfigs,
        seller: {
          id: bookSellers.id,
          sellerId: bookSellers.sellerId,
          displayName: bookSellers.displayName,
          businessName: bookSellers.businessName,
          tier: bookSellers.tier,
          isActive: bookSellers.isActive
        }
      })
      .from(salesAutomationConfigs)
      .leftJoin(bookSellers, eq(salesAutomationConfigs.sellerId, bookSellers.id))
      .orderBy(desc(salesAutomationConfigs.updatedAt));

    res.json(configs);
  } catch (error) {
    console.error("Error fetching automation configs:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/sales-automation/configs/:sellerId - Get automation config for specific seller
router.get('/configs/:sellerId', async (req, res) => {
  try {
    const [config] = await db
      .select({
        config: salesAutomationConfigs,
        seller: {
          id: bookSellers.id,
          sellerId: bookSellers.sellerId,
          displayName: bookSellers.displayName,
          businessName: bookSellers.businessName,
          tier: bookSellers.tier,
          isActive: bookSellers.isActive
        }
      })
      .from(salesAutomationConfigs)
      .leftJoin(bookSellers, eq(salesAutomationConfigs.sellerId, bookSellers.id))
      .where(eq(salesAutomationConfigs.sellerId, req.params.sellerId));

    if (!config) {
      return res.status(404).json({ error: "Automation config not found for this seller" });
    }

    res.json(config);
  } catch (error) {
    console.error("Error fetching seller automation config:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/sales-automation/configs - Create or update automation config for seller
router.post('/configs', requireAuth, requireCSRFToken, async (req, res) => {
  try {
    const configSchema = z.object({
      sellerId: z.string(),
      isEnabled: z.boolean().default(false),
      frequency: z.enum(["daily", "weekly", "bi_weekly", "monthly"]).default("weekly"),
      scheduleConfig: z.object({
        timeOfDay: z.string().optional(),
        daysOfWeek: z.array(z.number()).optional(),
        datesOfMonth: z.array(z.number()).optional(),
        timezone: z.string().default("Asia/Ho_Chi_Minh"),
        maxExecutionsPerDay: z.number().optional()
      }).optional(),
      targets: z.object({
        monthlyRevenue: z.object({ min: z.number(), max: z.number() }).optional(),
        weeklyOrders: z.object({ min: z.number(), max: z.number() }).optional(),
        dailyOrders: z.object({ min: z.number(), max: z.number() }).optional(),
        averageOrderValue: z.object({ min: z.number(), max: z.number() }).optional(),
        booksPerOrder: z.object({ min: z.number(), max: z.number() }).optional()
      }).optional(),
      bookPreferences: z.object({
        priorityCategories: z.array(z.string()).optional(),
        excludeCategories: z.array(z.string()).optional(),
        priceRanges: z.array(z.object({
          min: z.number(),
          max: z.number(),
          weight: z.number()
        })).optional(),
        conditionPreferences: z.record(z.number()).optional(),
        isbnPatterns: z.array(z.string()).optional(),
        publisherPreferences: z.array(z.string()).optional()
      }).optional(),
      customerSimulation: z.object({
        vipCustomerRatio: z.number().optional(),
        repeatCustomerRatio: z.number().optional(),
        newCustomerRatio: z.number().optional(),
        customerLifetimeSimulation: z.boolean().optional(),
        geographicDistribution: z.record(z.number()).optional(),
        ageGroupDistribution: z.record(z.number()).optional()
      }).optional(),
      performanceParams: z.object({
        responseTimeMin: z.number().optional(),
        responseTimeMax: z.number().optional(),
        qualityScore: z.number().optional(),
        cancellationRate: z.number().optional(),
        delayProbability: z.number().optional(),
        customerSatisfactionRange: z.object({ min: z.number(), max: z.number() }).optional()
      }).optional(),
      advancedSettings: z.object({
        dryRunMode: z.boolean().optional(),
        emergencyStop: z.boolean().optional(),
        seasonalAdjustments: z.object({
          backToSchool: z.object({ multiplier: z.number(), months: z.array(z.number()) }).optional(),
          tetHoliday: z.object({ multiplier: z.number(), months: z.array(z.number()) }).optional(),
          summerSlow: z.object({ multiplier: z.number(), months: z.array(z.number()) }).optional()
        }).optional(),
        automaticPricing: z.object({
          enabled: z.boolean(),
          discountRules: z.array(z.object({
            condition: z.string(),
            discountPercent: z.number()
          })).optional()
        }).optional()
      }).optional()
    });

    const validatedData = configSchema.parse(req.body);

    // Check if seller exists
    const [seller] = await db
      .select()
      .from(bookSellers)
      .where(eq(bookSellers.id, validatedData.sellerId));

    if (!seller) {
      return res.status(404).json({ error: "Seller not found" });
    }

    // Check if config already exists
    const [existingConfig] = await db
      .select()
      .from(salesAutomationConfigs)
      .where(eq(salesAutomationConfigs.sellerId, validatedData.sellerId));

    let config;
    if (existingConfig) {
      // Update existing config
      [config] = await db
        .update(salesAutomationConfigs)
        .set({
          ...validatedData,
          updatedAt: new Date()
        })
        .where(eq(salesAutomationConfigs.sellerId, validatedData.sellerId))
        .returning();
    } else {
      // Create new config
      [config] = await db
        .insert(salesAutomationConfigs)
        .values(validatedData)
        .returning();
    }

    console.log(`🤖 Automation config ${existingConfig ? 'updated' : 'created'} for seller ${seller.displayName}`);
    
    res.json({ 
      success: true, 
      config,
      message: `Automation config ${existingConfig ? 'updated' : 'created'} successfully`
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: "Validation error", 
        details: error.errors 
      });
    }
    console.error("Error creating/updating automation config:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/sales-automation/configs/:sellerId - Delete automation config
router.delete('/configs/:sellerId', requireAuth, requireCSRFToken, async (req, res) => {
  try {
    const [deleted] = await db
      .delete(salesAutomationConfigs)
      .where(eq(salesAutomationConfigs.sellerId, req.params.sellerId))
      .returning();

    if (!deleted) {
      return res.status(404).json({ error: "Automation config not found" });
    }

    console.log(`🗑️ Automation config deleted for seller ${req.params.sellerId}`);
    
    res.json({ 
      success: true, 
      message: "Automation config deleted successfully" 
    });
  } catch (error) {
    console.error("Error deleting automation config:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// =====================================================
// 🎯 ORDER GENERATION AND EXECUTION ENDPOINTS
// =====================================================

// Helper function to generate realistic book orders
async function generateAutomatedOrders(
  sellerId: string, 
  config: SalesAutomationConfig,
  isDryRun: boolean = false
): Promise<{
  success: boolean;
  ordersGenerated: number;
  customersCreated: number;
  customersReused: number;
  totalRevenue: number;
  generatedOrderIds: string[];
  generatedCustomerIds: string[];
  errors: string[];
  warnings: string[];
}> {
  const results = {
    success: true,
    ordersGenerated: 0,
    customersCreated: 0,
    customersReused: 0,
    totalRevenue: 0,
    generatedOrderIds: [] as string[],
    generatedCustomerIds: [] as string[],
    errors: [] as string[],
    warnings: [] as string[]
  };

  try {
    // Get seller data
    const [seller] = await db
      .select()
      .from(bookSellers)
      .where(eq(bookSellers.id, sellerId));

    if (!seller) {
      results.errors.push("Seller not found");
      results.success = false;
      return results;
    }

    // Calculate target orders for this execution
    const targets = config.targets || {};
    let targetOrders = 1;

    if (config.frequency === 'daily' && targets.dailyOrders) {
      targetOrders = Math.floor(Math.random() * (targets.dailyOrders.max - targets.dailyOrders.min + 1)) + targets.dailyOrders.min;
    } else if (config.frequency === 'weekly' && targets.weeklyOrders) {
      // For weekly, generate 1-3 orders per execution
      targetOrders = Math.floor(Math.random() * 3) + 1;
    } else {
      // Default: 1-2 orders per execution
      targetOrders = Math.floor(Math.random() * 2) + 1;
    }

    // Get available products for this seller (simplified - in real system would check seller inventory)
    const availableProducts = await db
      .select()
      .from(products)
      .limit(100); // Get sample products

    if (availableProducts.length === 0) {
      results.errors.push("No products available for order generation");
      results.success = false;
      return results;
    }

    // Generate customers and orders
    for (let i = 0; i < targetOrders; i++) {
      try {
        // Generate Vietnamese customer data
        const customerSimulation = config.customerSimulation || {};
        const vietnameseCustomer = generateVietnameseCustomer({
          customerType: Math.random() < (customerSimulation.vipCustomerRatio || 0.1) ? 'vip' :
                       Math.random() < (customerSimulation.repeatCustomerRatio || 0.3) ? 'repeat' : 'new'
        });

        // Check if we should reuse existing customer (for repeat customers)
        let customerId = null;
        if (vietnameseCustomer.customerType === 'repeat' && !isDryRun) {
          // Try to find existing customer with similar name/email
          const [existingCustomer] = await db
            .select()
            .from(bookCustomers)
            .where(like(bookCustomers.email, `%${vietnameseCustomer.email.split('@')[1]}`))
            .limit(1);

          if (existingCustomer) {
            customerId = existingCustomer.id;
            results.customersReused++;
          }
        }

        // Create new customer if not reusing
        if (!customerId && !isDryRun) {
          const [newCustomer] = await db
            .insert(bookCustomers)
            .values({
              name: vietnameseCustomer.name.fullName,
              email: vietnameseCustomer.email,
              phone: vietnameseCustomer.phone.formatted,
              readingPreferences: {
                favoriteGenres: ["văn học", "kinh tế"],
                languagePreference: ["Vietnamese"],
                priceRange: { min: 50000, max: 500000 },
                bookFormats: ["paperback", "hardcover"]
              },
              status: vietnameseCustomer.customerType === 'vip' ? 'vip' : 'active'
            })
            .returning();

          customerId = newCustomer.id;
          results.customersCreated++;
          results.generatedCustomerIds.push(customerId);
        }

        // Generate order composition (1-10 books)
        const booksPerOrder = targets.booksPerOrder || { min: 1, max: 3 };
        const numBooks = Math.floor(Math.random() * (booksPerOrder.max - booksPerOrder.min + 1)) + booksPerOrder.min;
        
        const selectedProducts = [];
        const usedProductIds = new Set();
        
        for (let j = 0; j < numBooks; j++) {
          let product;
          do {
            product = availableProducts[Math.floor(Math.random() * availableProducts.length)];
          } while (usedProductIds.has(product.id) && usedProductIds.size < availableProducts.length);
          
          usedProductIds.add(product.id);
          selectedProducts.push({
            product,
            quantity: Math.random() > 0.8 ? 2 : 1 // 20% chance of ordering 2 copies
          });
        }

        // Calculate order total
        let orderTotal = 0;
        const orderItems: any[] = [];

        selectedProducts.forEach(({ product, quantity }) => {
          const basePrice = parseFloat(product.price);
          // Apply random seller markup (Vietnamese book market)
          const sellerPrice = basePrice * (1 + Math.random() * 0.3); // 0-30% markup
          const itemTotal = sellerPrice * quantity;
          
          orderTotal += itemTotal;
          
          orderItems.push({
            productId: product.id,
            quantity: quantity.toString(),
            price: sellerPrice.toFixed(2),
            isbn: product.sku || undefined,
            condition: 'new',
            sellerPrice: sellerPrice.toFixed(2),
            marketPrice: basePrice.toFixed(2),
            sourceCost: (basePrice * 0.8).toFixed(2) // Assume 20% margin
          });
        });

        // Apply bulk order discount if applicable
        if (numBooks >= 3) {
          orderTotal *= 0.95; // 5% bulk discount
        }

        // Create book order if not dry run
        if (!isDryRun) {
          const [newOrder] = await db
            .insert(bookOrders)
            .values({
              customerId,
              total: orderTotal.toFixed(2),
              status: 'pending',
              paymentMethod: vietnameseCustomer.paymentMethod.method as any,
              items: orderItems.length,
              source: 'admin', // Mark as admin-generated
              sourceReference: `automation_${sellerId}`,
              sellerId,
              bookSource: 'local_inventory',
              condition: 'new',
              sellerCommission: (orderTotal * 0.1).toFixed(2), // 10% commission
              bookMetadata: {
                generatedBy: 'automation',
                automationSellerId: sellerId,
                automationConfigId: config.id,
                vietnameseCustomerData: vietnameseCustomer
              },
              inventoryStatus: 'reserved'
            })
            .returning();

          // Create order items
          for (const item of orderItems) {
            await db
              .insert(bookOrderItems)
              .values({
                orderId: newOrder.id,
                ...item
              });
          }

          results.generatedOrderIds.push(newOrder.id);
        }

        results.ordersGenerated++;
        results.totalRevenue += orderTotal;

      } catch (orderError) {
        console.error("Error generating individual order:", orderError);
        results.errors.push(`Failed to generate order ${i + 1}: ${orderError.message}`);
      }
    }

    // Apply seasonal adjustments if configured
    const seasonalSettings = config.advancedSettings?.seasonalAdjustments;
    const currentMonth = new Date().getMonth() + 1;
    
    if (seasonalSettings) {
      if (seasonalSettings.backToSchool?.months?.includes(currentMonth)) {
        results.totalRevenue *= seasonalSettings.backToSchool.multiplier;
        results.warnings.push(`Applied back-to-school multiplier: ${seasonalSettings.backToSchool.multiplier}x`);
      }
      if (seasonalSettings.tetHoliday?.months?.includes(currentMonth)) {
        results.totalRevenue *= seasonalSettings.tetHoliday.multiplier;
        results.warnings.push(`Applied Tết holiday multiplier: ${seasonalSettings.tetHoliday.multiplier}x`);
      }
    }

  } catch (error) {
    console.error("Error in generateAutomatedOrders:", error);
    results.errors.push(`Generation failed: ${error.message}`);
    results.success = false;
  }

  return results;
}

// POST /api/sales-automation/execute/:sellerId - Manually trigger automation for seller
router.post('/execute/:sellerId', requireAuth, requireCSRFToken, async (req, res) => {
  try {
    const { isDryRun = false } = req.body;
    const sellerId = req.params.sellerId;

    // Check global automation status
    const [globalControl] = await db
      .select()
      .from(globalAutomationControl)
      .limit(1);

    if (globalControl?.emergencyStop) {
      return res.status(423).json({ 
        error: "Automation is under emergency stop. Cannot execute." 
      });
    }

    if (!globalControl?.masterEnabled && !isDryRun) {
      return res.status(403).json({ 
        error: "Global automation is disabled. Enable it first or use dry run mode." 
      });
    }

    // Get seller automation config
    const [config] = await db
      .select()
      .from(salesAutomationConfigs)
      .where(eq(salesAutomationConfigs.sellerId, sellerId));

    if (!config) {
      return res.status(404).json({ 
        error: "Automation config not found for this seller" 
      });
    }

    if (!config.isEnabled && !isDryRun) {
      return res.status(403).json({ 
        error: "Automation is disabled for this seller" 
      });
    }

    console.log(`🤖 ${isDryRun ? 'DRY RUN' : 'EXECUTING'} automation for seller ${sellerId}`);

    const startTime = Date.now();
    
    // Create automation history record
    const [historyRecord] = await db
      .insert(salesAutomationHistory)
      .values({
        sellerId,
        configId: config.id,
        executionType: 'manual',
        executionStatus: 'started',
        runParameters: {
          frequency: config.frequency,
          targets: config.targets,
          bookPreferences: config.bookPreferences,
          customerSimulation: config.customerSimulation,
          performanceParams: config.performanceParams,
          isDryRun
        },
        startedAt: new Date()
      })
      .returning();

    // Generate orders
    const results = await generateAutomatedOrders(sellerId, config, isDryRun);
    const executionTime = Date.now() - startTime;

    // Update history record with results
    await db
      .update(salesAutomationHistory)
      .set({
        executionStatus: results.success ? 'completed' : 'failed',
        results,
        duration: executionTime,
        completedAt: new Date(),
        errorLog: results.errors.map(error => ({
          timestamp: new Date().toISOString(),
          errorType: 'generation_error',
          errorMessage: error,
          context: { sellerId, isDryRun }
        }))
      })
      .where(eq(salesAutomationHistory.id, historyRecord.id));

    // Update seller config with last run info if not dry run
    if (!isDryRun && results.success) {
      await db
        .update(salesAutomationConfigs)
        .set({
          lastRunAt: new Date(),
          totalAutomatedOrders: sql`${salesAutomationConfigs.totalAutomatedOrders} + ${results.ordersGenerated}`,
          totalAutomatedRevenue: sql`${salesAutomationConfigs.totalAutomatedRevenue} + ${results.totalRevenue}`,
          updatedAt: new Date()
        })
        .where(eq(salesAutomationConfigs.sellerId, sellerId));
    }

    console.log(`✅ Automation ${isDryRun ? 'dry run' : 'execution'} completed for seller ${sellerId}: ${results.ordersGenerated} orders, ${results.totalRevenue.toFixed(2)} VND`);

    res.json({
      success: results.success,
      isDryRun,
      executionTime,
      historyId: historyRecord.id,
      results: {
        ordersGenerated: results.ordersGenerated,
        customersCreated: results.customersCreated,
        customersReused: results.customersReused,
        totalRevenue: results.totalRevenue,
        averageOrderValue: results.ordersGenerated > 0 ? results.totalRevenue / results.ordersGenerated : 0,
        errors: results.errors,
        warnings: results.warnings
      },
      generatedData: isDryRun ? {
        orderIds: results.generatedOrderIds,
        customerIds: results.generatedCustomerIds
      } : undefined
    });

  } catch (error) {
    console.error("Error executing automation:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/sales-automation/execute-all - Execute automation for all enabled sellers
router.post('/execute-all', requireAuth, requireCSRFToken, async (req, res) => {
  try {
    const { isDryRun = false } = req.body;

    // Check global automation status
    const [globalControl] = await db
      .select()
      .from(globalAutomationControl)
      .limit(1);

    if (globalControl?.emergencyStop) {
      return res.status(423).json({ 
        error: "Automation is under emergency stop. Cannot execute." 
      });
    }

    if (!globalControl?.masterEnabled && !isDryRun) {
      return res.status(403).json({ 
        error: "Global automation is disabled." 
      });
    }

    // Get all enabled seller configs
    const enabledConfigs = await db
      .select()
      .from(salesAutomationConfigs)
      .where(eq(salesAutomationConfigs.isEnabled, true));

    if (enabledConfigs.length === 0) {
      return res.json({
        success: true,
        message: "No enabled automation configs found",
        results: []
      });
    }

    console.log(`🤖 ${isDryRun ? 'DRY RUN' : 'EXECUTING'} automation for ${enabledConfigs.length} sellers`);

    const executionResults = [];
    let totalOrders = 0;
    let totalRevenue = 0;

    // Execute automation for each seller
    for (const config of enabledConfigs) {
      try {
        const startTime = Date.now();
        const results = await generateAutomatedOrders(config.sellerId, config, isDryRun);
        const executionTime = Date.now() - startTime;

        // Create history record for each execution
        await db
          .insert(salesAutomationHistory)
          .values({
            sellerId: config.sellerId,
            configId: config.id,
            executionType: 'scheduled',
            executionStatus: results.success ? 'completed' : 'failed',
            runParameters: {
              frequency: config.frequency,
              targets: config.targets,
              bookPreferences: config.bookPreferences,
              customerSimulation: config.customerSimulation,
              performanceParams: config.performanceParams,
              isDryRun
            },
            results,
            duration: executionTime,
            startedAt: new Date(),
            completedAt: new Date()
          });

        totalOrders += results.ordersGenerated;
        totalRevenue += results.totalRevenue;

        executionResults.push({
          sellerId: config.sellerId,
          success: results.success,
          ordersGenerated: results.ordersGenerated,
          revenue: results.totalRevenue,
          executionTime,
          errors: results.errors
        });

      } catch (error) {
        console.error(`Error executing automation for seller ${config.sellerId}:`, error);
        executionResults.push({
          sellerId: config.sellerId,
          success: false,
          ordersGenerated: 0,
          revenue: 0,
          executionTime: 0,
          errors: [error.message]
        });
      }
    }

    console.log(`✅ Batch automation ${isDryRun ? 'dry run' : 'execution'} completed: ${totalOrders} orders, ${totalRevenue.toFixed(2)} VND across ${enabledConfigs.length} sellers`);

    res.json({
      success: true,
      isDryRun,
      totalSellers: enabledConfigs.length,
      totalOrders,
      totalRevenue,
      averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
      results: executionResults
    });

  } catch (error) {
    console.error("Error executing batch automation:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// =====================================================
// 📊 AUTOMATION ANALYTICS ENDPOINTS
// =====================================================

// GET /api/sales-automation/analytics/overview - Get automation overview analytics
router.get('/analytics/overview', async (req, res) => {
  try {
    const { timeframe = '30d', sellerId } = req.query;

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    
    switch (timeframe) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }

    // Build query conditions
    const conditions = [
      gte(salesAutomationHistory.startedAt, startDate),
      lte(salesAutomationHistory.startedAt, endDate)
    ];

    if (sellerId) {
      conditions.push(eq(salesAutomationHistory.sellerId, sellerId as string));
    }

    // Get automation history data
    const historyData = await db
      .select()
      .from(salesAutomationHistory)
      .where(and(...conditions))
      .orderBy(desc(salesAutomationHistory.startedAt));

    // Calculate analytics
    const analytics = {
      totalRuns: historyData.length,
      successfulRuns: historyData.filter(h => h.executionStatus === 'completed').length,
      failedRuns: historyData.filter(h => h.executionStatus === 'failed').length,
      totalOrdersGenerated: historyData.reduce((sum, h) => sum + (h.results?.ordersGenerated || 0), 0),
      totalRevenueGenerated: historyData.reduce((sum, h) => sum + (h.results?.totalRevenue || 0), 0),
      totalCustomersCreated: historyData.reduce((sum, h) => sum + (h.results?.customersCreated || 0), 0),
      averageExecutionTime: historyData.length > 0 
        ? historyData.reduce((sum, h) => sum + (h.duration || 0), 0) / historyData.length 
        : 0,
      successRate: historyData.length > 0 
        ? historyData.filter(h => h.executionStatus === 'completed').length / historyData.length 
        : 0,
      averageOrderValue: 0,
      topPerformingSellers: {},
      recentExecutions: historyData.slice(0, 10)
    };

    analytics.averageOrderValue = analytics.totalOrdersGenerated > 0 
      ? analytics.totalRevenueGenerated / analytics.totalOrdersGenerated 
      : 0;

    // Calculate top performing sellers
    const sellerPerformance = {};
    historyData.forEach(h => {
      if (!sellerPerformance[h.sellerId]) {
        sellerPerformance[h.sellerId] = {
          runs: 0,
          orders: 0,
          revenue: 0
        };
      }
      sellerPerformance[h.sellerId].runs++;
      sellerPerformance[h.sellerId].orders += h.results?.ordersGenerated || 0;
      sellerPerformance[h.sellerId].revenue += h.results?.totalRevenue || 0;
    });

    analytics.topPerformingSellers = Object.entries(sellerPerformance)
      .sort(([,a], [,b]) => (b as any).revenue - (a as any).revenue)
      .slice(0, 5)
      .reduce((obj, [sellerId, data]) => {
        obj[sellerId] = data;
        return obj;
      }, {});

    res.json(analytics);
  } catch (error) {
    console.error("Error fetching automation analytics:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/sales-automation/analytics/seller/:sellerId - Get seller-specific analytics
router.get('/analytics/seller/:sellerId', async (req, res) => {
  try {
    const { sellerId } = req.params;
    const { timeframe = '30d' } = req.query;

    // Get seller automation config
    const [config] = await db
      .select()
      .from(salesAutomationConfigs)
      .where(eq(salesAutomationConfigs.sellerId, sellerId));

    if (!config) {
      return res.status(404).json({ error: "Automation config not found for this seller" });
    }

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - parseInt(timeframe as string || '30'));

    // Get automation history for this seller
    const historyData = await db
      .select()
      .from(salesAutomationHistory)
      .where(and(
        eq(salesAutomationHistory.sellerId, sellerId),
        gte(salesAutomationHistory.startedAt, startDate),
        lte(salesAutomationHistory.startedAt, endDate)
      ))
      .orderBy(desc(salesAutomationHistory.startedAt));

    // Calculate seller-specific analytics
    const analytics = {
      sellerId,
      config: {
        isEnabled: config.isEnabled,
        frequency: config.frequency,
        lastRunAt: config.lastRunAt,
        totalAutomatedOrders: config.totalAutomatedOrders,
        totalAutomatedRevenue: config.totalAutomatedRevenue
      },
      performance: {
        totalRuns: historyData.length,
        successfulRuns: historyData.filter(h => h.executionStatus === 'completed').length,
        failedRuns: historyData.filter(h => h.executionStatus === 'failed').length,
        totalOrdersGenerated: historyData.reduce((sum, h) => sum + (h.results?.ordersGenerated || 0), 0),
        totalRevenueGenerated: historyData.reduce((sum, h) => sum + (h.results?.totalRevenue || 0), 0),
        averageOrdersPerRun: 0,
        averageRevenuePerRun: 0,
        successRate: 0
      },
      trends: {
        dailyOrders: {},
        dailyRevenue: {},
        customerTypes: {
          new: 0,
          repeat: 0,
          vip: 0
        }
      },
      recentExecutions: historyData.slice(0, 10)
    };

    // Calculate averages
    if (analytics.performance.totalRuns > 0) {
      analytics.performance.averageOrdersPerRun = analytics.performance.totalOrdersGenerated / analytics.performance.totalRuns;
      analytics.performance.averageRevenuePerRun = analytics.performance.totalRevenueGenerated / analytics.performance.totalRuns;
      analytics.performance.successRate = analytics.performance.successfulRuns / analytics.performance.totalRuns;
    }

    // Calculate daily trends
    historyData.forEach(h => {
      const date = h.startedAt.toISOString().split('T')[0];
      analytics.trends.dailyOrders[date] = (analytics.trends.dailyOrders[date] || 0) + (h.results?.ordersGenerated || 0);
      analytics.trends.dailyRevenue[date] = (analytics.trends.dailyRevenue[date] || 0) + (h.results?.totalRevenue || 0);
    });

    res.json(analytics);
  } catch (error) {
    console.error("Error fetching seller automation analytics:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/sales-automation/history - Get automation execution history
router.get('/history', async (req, res) => {
  try {
    const { 
      sellerId, 
      status, 
      limit = 50, 
      offset = 0 
    } = req.query;

    const conditions = [];
    
    if (sellerId) {
      conditions.push(eq(salesAutomationHistory.sellerId, sellerId as string));
    }
    
    if (status) {
      conditions.push(eq(salesAutomationHistory.executionStatus, status as string));
    }

    const history = await db
      .select({
        history: salesAutomationHistory,
        seller: {
          sellerId: bookSellers.sellerId,
          displayName: bookSellers.displayName
        }
      })
      .from(salesAutomationHistory)
      .leftJoin(bookSellers, eq(salesAutomationHistory.sellerId, bookSellers.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(salesAutomationHistory.startedAt))
      .limit(parseInt(limit as string))
      .offset(parseInt(offset as string));

    res.json(history);
  } catch (error) {
    console.error("Error fetching automation history:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;