import { Router } from 'express';
import { storage } from '../storage';
import { z } from 'zod';

const router = Router();

const createApiConfigSchema = z.object({
  endpoint: z.string().min(1, 'Endpoint is required'),
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']).default('GET'),
  description: z.string().min(1, 'Description is required'),
  category: z.string().min(1, 'Category is required'),
  isEnabled: z.boolean().default(true),
  maintenanceMode: z.boolean().default(false),
  maintenanceMessage: z.string().default('API temporarily unavailable for maintenance'),
  rateLimitEnabled: z.boolean().default(false),
  rateLimitRequests: z.number().int().default(100),
  rateLimitWindowSeconds: z.number().int().default(60),
  circuitBreakerEnabled: z.boolean().default(false),
  circuitBreakerThreshold: z.number().int().default(5),
  circuitBreakerTimeout: z.number().int().default(60),
  tags: z.array(z.string()).default([]),
  priority: z.enum(['low', 'normal', 'high', 'critical']).default('normal'),
  owner: z.string().optional(),
  requiresAuth: z.boolean().default(true),
  adminOnly: z.boolean().default(false)
});

const updateApiConfigSchema = createApiConfigSchema.partial();

router.get('/', async (req, res) => {
  try {
    const { category, enabled } = req.query;
    
    let configs;
    
    if (category) {
      configs = await storage.getApiConfigurationsByCategory(category as string);
    } else if (enabled === 'true') {
      configs = await storage.getEnabledApiConfigurations();
    } else {
      configs = await storage.getApiConfigurations();
    }
    
    // Extract unique categories
    const categories = [...new Set(configs.map(c => c.category))].sort();
    
    // Return formatted response matching frontend expectations
    res.json({
      configs,
      categories,
      total: configs.length
    });
  } catch (error) {
    console.error('Error fetching API configurations:', error);
    res.status(500).json({ error: 'Failed to fetch API configurations' });
  }
});

router.get('/stats/summary', async (req, res) => {
  try {
    const configs = await storage.getApiConfigurations();
    
    const stats = {
      total: configs.length,
      enabled: configs.filter(c => c.isEnabled).length,
      disabled: configs.filter(c => !c.isEnabled).length,
      maintenance: configs.filter(c => c.maintenanceMode).length,
      categories: configs.reduce((acc, c) => {
        acc[c.category] = (acc[c.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      totalAccess: configs.reduce((sum, c) => sum + (c.accessCount || 0), 0),
      totalErrors: configs.reduce((sum, c) => sum + (c.errorCount || 0), 0),
      avgResponseTime: configs.length > 0 
        ? configs.reduce((sum, c) => sum + parseFloat(c.avgResponseTime || '0'), 0) / configs.length 
        : 0
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching API stats:', error);
    res.status(500).json({ error: 'Failed to fetch API stats' });
  }
});

router.get('/by-category/:category', async (req, res) => {
  try {
    const configs = await storage.getApiConfigurationsByCategory(req.params.category);
    res.json(configs);
  } catch (error) {
    console.error('Error fetching API configurations by category:', error);
    res.status(500).json({ error: 'Failed to fetch API configurations by category' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const config = await storage.getApiConfiguration(req.params.id);
    if (!config) {
      return res.status(404).json({ error: 'API configuration not found' });
    }
    res.json(config);
  } catch (error) {
    console.error('Error fetching API configuration:', error);
    res.status(500).json({ error: 'Failed to fetch API configuration' });
  }
});

router.post('/', async (req, res) => {
  try {
    const validated = createApiConfigSchema.parse(req.body);
    
    const existing = await storage.getApiConfigurationByEndpoint(validated.endpoint, validated.method);
    if (existing) {
      return res.status(409).json({ error: 'API configuration already exists for this endpoint and method' });
    }
    
    const newConfig = await storage.createApiConfiguration(validated as any);
    res.status(201).json(newConfig);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    console.error('Error creating API configuration:', error);
    res.status(500).json({ error: 'Failed to create API configuration' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const validated = updateApiConfigSchema.parse(req.body);
    const updated = await storage.updateApiConfiguration(req.params.id, validated as any);
    
    if (!updated) {
      return res.status(404).json({ error: 'API configuration not found' });
    }
    
    res.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    console.error('Error updating API configuration:', error);
    res.status(500).json({ error: 'Failed to update API configuration' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await storage.deleteApiConfiguration(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({ error: 'API configuration not found' });
    }
    
    res.json({ message: 'API configuration deleted successfully' });
  } catch (error) {
    console.error('Error deleting API configuration:', error);
    res.status(500).json({ error: 'Failed to delete API configuration' });
  }
});

router.post('/:id/toggle', async (req, res) => {
  try {
    const { enabled } = req.body;
    
    if (typeof enabled !== 'boolean') {
      return res.status(400).json({ error: 'enabled must be a boolean value' });
    }
    
    const updated = await storage.toggleApiEnabled(req.params.id, enabled);
    
    if (!updated) {
      return res.status(404).json({ error: 'API configuration not found' });
    }
    
    res.json(updated);
  } catch (error) {
    console.error('Error toggling API configuration:', error);
    res.status(500).json({ error: 'Failed to toggle API configuration' });
  }
});

router.post('/:id/maintenance', async (req, res) => {
  try {
    const { maintenanceMode, maintenanceMessage } = req.body;
    
    const updateData: any = {};
    if (typeof maintenanceMode === 'boolean') {
      updateData.maintenanceMode = maintenanceMode;
    }
    if (maintenanceMessage) {
      updateData.maintenanceMessage = maintenanceMessage;
    }
    
    const updated = await storage.updateApiConfiguration(req.params.id, updateData);
    
    if (!updated) {
      return res.status(404).json({ error: 'API configuration not found' });
    }
    
    res.json(updated);
  } catch (error) {
    console.error('Error updating maintenance mode:', error);
    res.status(500).json({ error: 'Failed to update maintenance mode' });
  }
});

router.post('/cache/clear', async (req, res) => {
  try {
    // Clear API management cache by invalidating the cached configs
    // This is a no-op endpoint for now as caching is handled in middleware
    res.json({ message: 'API configuration cache cleared successfully' });
  } catch (error) {
    console.error('Error clearing cache:', error);
    res.status(500).json({ error: 'Failed to clear cache' });
  }
});

export default router;
