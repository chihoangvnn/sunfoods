/**
 * 🎁 GIFT CAMPAIGNS API
 * 
 * API endpoints for managing gift campaigns and gift card products
 * Supports Vietnamese incense business e-commerce platform
 */

import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { giftCampaigns } from '@shared/schema';
import { eq, desc } from 'drizzle-orm';

const router = Router();

/**
 * GET /api/gift-campaigns - Get all gift campaigns
 */
router.get('/', async (req, res) => {
  try {
    const campaigns = await db.select().from(giftCampaigns).orderBy(desc(giftCampaigns.createdAt));
    
    res.json({
      success: true,
      data: campaigns
    });
  } catch (error) {
    console.error('Error fetching gift campaigns:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch campaigns'
    });
  }
});

/**
 * GET /api/gift-campaigns/:id - Get gift campaign by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [campaign] = await db.select()
      .from(giftCampaigns)
      .where(eq(giftCampaigns.id, id));
    
    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: 'Campaign not found'
      });
    }
    
    res.json({
      success: true,
      data: campaign
    });
  } catch (error) {
    console.error('Error fetching campaign:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch campaign'
    });
  }
});

/**
 * PUT /api/gift-campaigns/:id - Update gift campaign
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    
    // Check if campaign exists
    const [existingCampaign] = await db.select()
      .from(giftCampaigns)
      .where(eq(giftCampaigns.id, id));
    
    if (!existingCampaign) {
      return res.status(404).json({
        success: false,
        error: 'Campaign not found'
      });
    }
    
    // Update the campaign
    const [updatedCampaign] = await db.update(giftCampaigns)
      .set({
        name: name || existingCampaign.name,
        description: description || existingCampaign.description,
        updatedAt: new Date(),
      })
      .where(eq(giftCampaigns.id, id))
      .returning();
    
    res.json({
      success: true,
      data: updatedCampaign
    });
  } catch (error) {
    console.error('Error updating campaign:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update campaign'
    });
  }
});

/**
 * POST /api/gift-campaigns - Create new gift campaign
 */
router.post('/', async (req, res) => {
  try {
    const campaignData = req.body;
    
    const [newCampaign] = await db.insert(giftCampaigns)
      .values({
        ...campaignData,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    
    res.json({
      success: true,
      data: newCampaign
    });
  } catch (error) {
    console.error('Error creating campaign:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create campaign'
    });
  }
});

/**
 * GET /api/gift-campaigns/analytics/overview - Get campaign analytics
 */
router.get('/analytics/overview', async (req, res) => {
  try {
    const campaigns = await db.select().from(giftCampaigns);
    
    const analytics = {
      totalCampaigns: campaigns.length,
      activeCampaigns: campaigns.filter(c => c.status === 'active').length,
      totalValue: campaigns.reduce((sum, c) => sum + parseFloat(c.value || '0'), 0)
    };
    
    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics'
    });
  }
});

export default router;