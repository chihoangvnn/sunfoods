import { Router } from 'express';
import { storage } from '../storage';
import { z } from 'zod';

const router = Router();

const createVehicleSchema = z.object({
  driverId: z.string().min(1, 'Driver ID is required'),
  licensePlate: z.string().min(1, 'License plate is required'),
  vehicleType: z.string().min(1, 'Vehicle type is required'),
  brand: z.string().optional(),
  model: z.string().optional(),
  color: z.string().optional(),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 1).optional(),
  seatingCapacity: z.number().int().min(1).optional(),
  cargoCapacity: z.number().optional(),
  registrationNumber: z.string().optional(),
  registrationExpiry: z.string().optional(),
  insuranceNumber: z.string().optional(),
  insuranceExpiry: z.string().optional(),
  status: z.enum(['active', 'inactive', 'maintenance']).default('active'),
  isVerified: z.boolean().default(false),
  images: z.array(z.string()).default([]),
  verifiedAt: z.string().optional(),
  verifiedBy: z.string().optional()
});

const updateVehicleSchema = createVehicleSchema.partial();

router.get('/', async (req, res) => {
  try {
    const { driverId, status, isVerified, limit = '50', offset = '0' } = req.query;
    
    const filters: any = {};
    if (driverId) filters.driverId = driverId as string;
    if (status) filters.status = status as string;
    if (isVerified !== undefined) filters.isVerified = isVerified === 'true';

    const pagination = {
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    };

    const vehicles = await storage.getVehicles(filters, pagination);
    res.json(vehicles);
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    res.status(500).json({ error: 'Failed to fetch vehicles' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const vehicle = await storage.getVehicle(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    res.json(vehicle);
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    res.status(500).json({ error: 'Failed to fetch vehicle' });
  }
});

router.post('/', async (req, res) => {
  try {
    const validated = createVehicleSchema.parse(req.body);
    const newVehicle = await storage.createVehicle(validated);
    res.status(201).json(newVehicle);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    console.error('Error creating vehicle:', error);
    res.status(500).json({ error: 'Failed to create vehicle' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const validated = updateVehicleSchema.parse(req.body);
    const updated = await storage.updateVehicle(req.params.id, validated);
    
    if (!updated) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    
    res.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    console.error('Error updating vehicle:', error);
    res.status(500).json({ error: 'Failed to update vehicle' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await storage.deleteVehicle(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    
    res.json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    res.status(500).json({ error: 'Failed to delete vehicle' });
  }
});

router.post('/:id/verify', async (req, res) => {
  try {
    const { verifiedBy } = req.body;
    const updated = await storage.updateVehicle(req.params.id, {
      isVerified: true,
      verifiedAt: new Date().toISOString(),
      verifiedBy
    });
    
    if (!updated) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    
    res.json(updated);
  } catch (error) {
    console.error('Error verifying vehicle:', error);
    res.status(500).json({ error: 'Failed to verify vehicle' });
  }
});

export default router;
