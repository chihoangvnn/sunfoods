// @ts-nocheck
import { Router } from 'express';
import { storage } from '../storage';
import { z } from 'zod';

const router = Router();

const createContentLibrarySchema = z.object({
  title: z.string().min(1, 'Title is required'),
  baseContent: z.string().min(1, 'Content is required'),
  contentType: z.string().default('text'),
  assetIds: z.array(z.string()).default([]),
  tagIds: z.array(z.string()).default([]),
  aiVariations: z.array(z.any()).default([]),
  priority: z.enum(['low', 'normal', 'high']).default('normal'),
  status: z.enum(['draft', 'active', 'archived']).default('draft'),
  isTemplate: z.boolean().default(false),
  platforms: z.array(z.string()).default(['facebook', 'instagram', 'tiktok']),
  bestTimeSlots: z.array(z.any()).default([]),
  contentFingerprint: z.string().optional()
});

const updateContentLibrarySchema = createContentLibrarySchema.partial();

router.get('/', async (req, res) => {
  try {
    const { tags, status, contentType, priority } = req.query;
    
    const filters: any = {};
    if (tags) filters.tags = (tags as string).split(',');
    if (status) filters.status = status as string;
    if (contentType) filters.contentType = contentType as string;
    if (priority) filters.priority = priority as string;

    const items = await storage.getContentLibraryItems(filters);
    res.json(items);
  } catch (error) {
    console.error('Error fetching content library items:', error);
    res.status(500).json({ error: 'Failed to fetch content library items' });
  }
});

router.get('/by-priority/:priority', async (req, res) => {
  try {
    const items = await storage.getContentLibraryByPriority(req.params.priority);
    res.json(items);
  } catch (error) {
    console.error('Error fetching content by priority:', error);
    res.status(500).json({ error: 'Failed to fetch content by priority' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const item = await storage.getContentLibraryItem(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Content library item not found' });
    }
    res.json(item);
  } catch (error) {
    console.error('Error fetching content library item:', error);
    res.status(500).json({ error: 'Failed to fetch content library item' });
  }
});

router.post('/', async (req, res) => {
  try {
    const validated = createContentLibrarySchema.parse(req.body);
    const newItem = await storage.createContentLibraryItem(validated as any);
    res.status(201).json(newItem);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    console.error('Error creating content library item:', error);
    res.status(500).json({ error: 'Failed to create content library item' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const validated = updateContentLibrarySchema.parse(req.body);
    const updated = await storage.updateContentLibraryItem(req.params.id, validated as any);
    
    if (!updated) {
      return res.status(404).json({ error: 'Content library item not found' });
    }
    
    res.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    console.error('Error updating content library item:', error);
    res.status(500).json({ error: 'Failed to update content library item' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await storage.deleteContentLibraryItem(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Content library item not found' });
    }
    
    res.json({ message: 'Content library item deleted successfully' });
  } catch (error) {
    console.error('Error deleting content library item:', error);
    res.status(500).json({ error: 'Failed to delete content library item' });
  }
});

router.post('/:id/increment-usage', async (req, res) => {
  try {
    await storage.incrementContentLibraryUsage(req.params.id);
    const item = await storage.getContentLibraryItem(req.params.id);
    res.json(item);
  } catch (error) {
    console.error('Error incrementing usage:', error);
    res.status(500).json({ error: 'Failed to increment usage count' });
  }
});

export default router;
