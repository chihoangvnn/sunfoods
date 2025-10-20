// @ts-nocheck
import express from 'express';
import { db } from '../db';
import { bookSellers, bookCustomers } from '../../shared/schema';
import { eq, desc, and } from 'drizzle-orm';
import type { BookSeller, InsertBookSeller, BookCustomer } from '../../shared/schema';

const router = express.Router();

// Get all book sellers
router.get('/', async (req, res) => {
  try {
    const sellers = await db
      .select()
      .from(bookSellers)
      .orderBy(desc(bookSellers.createdAt));

    res.json(sellers);
  } catch (error) {
    console.error('Error fetching book sellers:', error);
    res.status(500).json({ error: 'Failed to fetch book sellers' });
  }
});

// Get seller configuration (MUST come before /:id route)
router.get('/:id/config', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [seller] = await db
      .select()
      .from(bookSellers)
      .where(eq(bookSellers.id, id));

    if (!seller) {
      return res.status(404).json({ error: 'Book seller not found' });
    }

    // If config exists in database, return it; otherwise return defaults
    if (seller.config) {
      const config = {
        id: seller.id,
        sellerId: seller.sellerId,
        displayName: seller.displayName,
        businessName: seller.businessName,
        ...seller.config
      };
      
      res.json(config);
      return;
    }

    // Return default configuration if not saved yet
    const defaultConfig = {
      id: seller.id,
      sellerId: seller.sellerId,
      displayName: seller.displayName,
      businessName: seller.businessName,
      sellingStyle: {
        automationLevel: "full",
        sellerType: "automated",
        operatingHours: {
          start: "09:00",
          end: "18:00",
          timezone: "Asia/Ho_Chi_Minh"
        },
        holidayMode: false,
        aiAssistance: true
      },
      responseTime: {
        targetHours: seller.responseTime || 24,
        autoReplyEnabled: true,
        urgentThresholdHours: 4,
        weekendDelay: false
      },
      qualityLevel: {
        serviceStandard: seller.tier === "premium" ? "premium" : "standard",
        bookConditionStandards: {
          minimumCondition: "good",
          qualityCheckEnabled: true,
          returnPolicyFlexibility: "standard"
        },
        customerSatisfactionTarget: 85,
        ratingThreshold: parseFloat(seller.avgRating?.toString() || "4.0")
      },
      marketingBudget: {
        monthlyBudgetVnd: 5000000,
        budgetDistribution: {
          socialMedia: 40,
          emailMarketing: 25,
          promotionalDiscounts: 25,
          advertisingSpend: 10
        },
        campaignPreferences: {
          targetAudience: ["students", "book_lovers", "professionals"],
          preferredChannels: ["facebook", "email", "website"],
          seasonalCampaigns: true
        }
      },
      performanceTargets: {
        monthlySalesTarget: parseInt(seller.totalSales?.toString() || "50000000"),
        conversionRateTarget: 12,
        customerRetentionTarget: 70,
        inventoryTurnoverTarget: 6
      },
      automationRules: {
        autoPricing: seller.autoAssignBooks || true,
        autoRestock: seller.autoAssignBooks || true,
        autoPromotions: true,
        autoCustomerMessages: true
      }
    };

    res.json(defaultConfig);
  } catch (error) {
    console.error('Error fetching seller configuration:', error);
    res.status(500).json({ error: 'Failed to fetch seller configuration' });
  }
});

// Update seller configuration (MUST come before /:id route)
router.put('/:id/config', async (req, res) => {
  try {
    const { id } = req.params;
    const configData = req.body;

    // Check if seller exists
    const [existingSeller] = await db
      .select()
      .from(bookSellers)
      .where(eq(bookSellers.id, id));

    if (!existingSeller) {
      return res.status(404).json({ error: 'Book seller not found' });
    }

    // Extract core seller fields from configData
    const { id: configId, sellerId, displayName, businessName, ...pureConfig } = configData;

    // Update seller record with both config data and individual fields for backwards compatibility
    const updateData: any = {
      updatedAt: new Date(),
      config: pureConfig // Save complete configuration as JSON
    };

    // Update core seller fields if provided
    if (displayName) {
      updateData.displayName = displayName;
    }
    if (businessName) {
      updateData.businessName = businessName;
    }

    // Also update individual legacy fields for backwards compatibility
    if (configData.responseTime?.targetHours) {
      updateData.responseTime = configData.responseTime.targetHours;
    }
    
    if (configData.qualityLevel?.serviceStandard) {
      const tierMapping: any = {
        "basic": "standard",
        "standard": "standard", 
        "premium": "premium",
        "luxury": "top_seller"
      };
      updateData.tier = tierMapping[configData.qualityLevel.serviceStandard] || "standard";
    }

    if (configData.automationRules?.autoPricing !== undefined) {
      updateData.autoAssignBooks = configData.automationRules.autoPricing;
    }

    // Update the seller record
    const [updatedSeller] = await db
      .update(bookSellers)
      .set(updateData)
      .where(eq(bookSellers.id, id))
      .returning();

    res.json({
      success: true,
      message: 'Seller configuration updated successfully',
      config: {
        id: updatedSeller.id,
        sellerId: updatedSeller.sellerId,
        displayName: updatedSeller.displayName,
        businessName: updatedSeller.businessName,
        ...updatedSeller.config
      }
    });
  } catch (error) {
    console.error('Error updating seller configuration:', error);
    res.status(500).json({ error: 'Failed to update seller configuration' });
  }
});

// Get single book seller by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [seller] = await db
      .select()
      .from(bookSellers)
      .where(eq(bookSellers.id, id));

    if (!seller) {
      return res.status(404).json({ error: 'Book seller not found' });
    }

    res.json(seller);
  } catch (error) {
    console.error('Error fetching book seller:', error);
    res.status(500).json({ error: 'Failed to fetch book seller' });
  }
});

// Create new book seller
router.post('/', async (req, res) => {
  try {
    const sellerData: InsertBookSeller = req.body;
    
    const [newSeller] = await db
      .insert(bookSellers)
      .values(sellerData)
      .returning();

    res.status(201).json(newSeller);
  } catch (error) {
    console.error('Error creating book seller:', error);
    res.status(500).json({ error: 'Failed to create book seller' });
  }
});

// Update book seller
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const [updatedSeller] = await db
      .update(bookSellers)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(bookSellers.id, id))
      .returning();

    if (!updatedSeller) {
      return res.status(404).json({ error: 'Book seller not found' });
    }

    res.json(updatedSeller);
  } catch (error) {
    console.error('Error updating book seller:', error);
    res.status(500).json({ error: 'Failed to update book seller' });
  }
});

// Delete book seller
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [deletedSeller] = await db
      .delete(bookSellers)
      .where(eq(bookSellers.id, id))
      .returning();

    if (!deletedSeller) {
      return res.status(404).json({ error: 'Book seller not found' });
    }

    res.json({ success: true, message: 'Book seller deleted successfully' });
  } catch (error) {
    console.error('Error deleting book seller:', error);
    res.status(500).json({ error: 'Failed to delete book seller' });
  }
});

// Get all book customers
router.get('/customers', async (req, res) => {
  try {
    const customers = await db
      .select()
      .from(bookCustomers)
      .orderBy(desc(bookCustomers.createdAt));

    res.json(customers);
  } catch (error) {
    console.error('Error fetching book customers:', error);
    res.status(500).json({ error: 'Failed to fetch book customers' });
  }
});


export default router;