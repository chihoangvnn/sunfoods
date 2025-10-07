import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { storage } from '../storage';
import { 
  carGroups, vehicleGroupAssignments, vehicles, trips, orders, customers 
} from '@shared/schema';
import { eq, and, desc, count, sql, gte, or } from 'drizzle-orm';

const router = Router();

// 🔒 Authentication middleware (temporarily disabled for testing)
const requireAuth = (req: any, res: any, next: any) => {
  // Temporary: Allow access without login for testing
  next();
  
  // TODO: Re-enable auth after testing
  // if (!req.session || !(req.session as any).userId) {
  //   return res.status(401).json({ 
  //     error: "Unauthorized. Please log in.",
  //     code: "AUTH_REQUIRED"
  //   });
  // }
  // next();
};

/**
 * 📦🚗 DELIVERY MANAGEMENT API
 * Unified dashboard for vehicle management, car groups, and delivery tracking
 */

// ==========================================
// 📊 DASHBOARD STATS
// ==========================================

// GET /api/delivery-management/dashboard - Get delivery dashboard statistics
router.get('/dashboard', requireAuth, async (req, res) => {
  try {
    const stats = await storage.getDeliveryDashboardStats();
    res.json(stats);
  } catch (error) {
    console.error("Error fetching delivery dashboard stats:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ==========================================
// 📦 DELIVERY ORDERS
// ==========================================

// GET /api/delivery-management/delivery-orders - Get delivery orders with driver info
router.get('/delivery-orders', requireAuth, async (req, res) => {
  try {
    const status = req.query.status as string | undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;

    const orders = await storage.getDeliveryOrders({ status, limit });
    res.json(orders);
  } catch (error) {
    console.error("Error fetching delivery orders:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ==========================================
// 🚗 VEHICLES MANAGEMENT
// ==========================================

// GET /api/delivery-management/vehicles - Get all vehicles for delivery management
router.get('/vehicles', requireAuth, async (req, res) => {
  try {
    // Get all vehicles directly from database
    const allVehicles = await db.select().from(vehicles).orderBy(desc(vehicles.createdAt));
    
    // Enhance with group assignments
    const vehiclesWithGroups = await Promise.all(
      allVehicles.map(async (vehicle: any) => {
        const groups = await storage.getGroupsByVehicleId(vehicle.id);
        return {
          ...vehicle,
          groups: groups.map((g: any) => g.group)
        };
      })
    );

    res.json(vehiclesWithGroups);
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ==========================================
// 🏷️ CAR GROUPS MANAGEMENT
// ==========================================

// GET /api/delivery-management/car-groups - List all car groups
router.get('/car-groups', requireAuth, async (req, res) => {
  try {
    const groupType = req.query.groupType as string | undefined;
    const isActive = req.query.isActive ? req.query.isActive === 'true' : undefined;

    const groups = await storage.getCarGroups({ groupType, isActive });

    // Get vehicle count for each group
    const groupsWithCounts = await Promise.all(
      groups.map(async (group) => {
        const assignments = await storage.getVehicleGroupAssignments({ groupId: group.id });
        return {
          ...group,
          vehicleCount: assignments.length
        };
      })
    );

    res.json(groupsWithCounts);
  } catch (error) {
    console.error("Error fetching car groups:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/delivery-management/car-groups/:id - Get single car group
router.get('/car-groups/:id', requireAuth, async (req, res) => {
  try {
    const group = await storage.getCarGroupById(req.params.id);
    
    if (!group) {
      return res.status(404).json({ error: "Car group not found" });
    }

    // Get vehicles in this group
    const vehiclesInGroup = await storage.getVehiclesByGroupId(group.id);

    res.json({
      ...group,
      vehicles: vehiclesInGroup
    });
  } catch (error) {
    console.error("Error fetching car group:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/delivery-management/car-groups - Create new car group
router.post('/car-groups', requireAuth, async (req, res) => {
  try {
    const carGroupSchema = z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      color: z.string().default('#3b82f6'),
      icon: z.string().default('car'),
      groupType: z.enum(['region', 'vehicle_type', 'service', 'custom']).default('custom'),
      isActive: z.boolean().default(true),
      metadata: z.any().optional(),
    });

    const validatedData = carGroupSchema.parse(req.body);
    
    const newGroup = await storage.createCarGroup({
      ...validatedData,
      createdBy: (req.session as any)?.userId || undefined,
    });

    res.status(201).json(newGroup);
  } catch (error: any) {
    console.error("Error creating car group:", error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: "Invalid data", details: error.errors });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/delivery-management/car-groups/:id - Update car group
router.put('/car-groups/:id', requireAuth, async (req, res) => {
  try {
    const carGroupSchema = z.object({
      name: z.string().min(1).optional(),
      description: z.string().optional(),
      color: z.string().optional(),
      icon: z.string().optional(),
      groupType: z.enum(['region', 'vehicle_type', 'service', 'custom']).optional(),
      isActive: z.boolean().optional(),
      metadata: z.any().optional(),
    });

    const validatedData = carGroupSchema.parse(req.body);
    
    const updatedGroup = await storage.updateCarGroup(req.params.id, validatedData);

    if (!updatedGroup) {
      return res.status(404).json({ error: "Car group not found" });
    }

    res.json(updatedGroup);
  } catch (error: any) {
    console.error("Error updating car group:", error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: "Invalid data", details: error.errors });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/delivery-management/car-groups/:id - Delete car group
router.delete('/car-groups/:id', requireAuth, async (req, res) => {
  try {
    const success = await storage.deleteCarGroup(req.params.id);

    if (!success) {
      return res.status(404).json({ error: "Car group not found" });
    }

    res.json({ success: true, message: "Car group deleted successfully" });
  } catch (error) {
    console.error("Error deleting car group:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ==========================================
// 🔗 VEHICLE-GROUP ASSIGNMENTS
// ==========================================

// POST /api/delivery-management/car-groups/:groupId/vehicles - Assign vehicle to group
router.post('/car-groups/:groupId/vehicles', requireAuth, async (req, res) => {
  try {
    const assignmentSchema = z.object({
      vehicleId: z.string(),
      notes: z.string().optional(),
    });

    const { vehicleId, notes } = assignmentSchema.parse(req.body);

    const assignment = await storage.assignVehicleToGroup({
      vehicleId,
      groupId: req.params.groupId,
      assignedBy: (req.session as any)?.userId || undefined,
      notes,
    });

    res.status(201).json(assignment);
  } catch (error: any) {
    console.error("Error assigning vehicle to group:", error);
    if (error.code === '23505') { // Unique constraint violation
      return res.status(409).json({ error: "Vehicle already assigned to this group" });
    }
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: "Invalid data", details: error.errors });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/delivery-management/car-groups/:groupId/vehicles/:vehicleId - Remove vehicle from group
router.delete('/car-groups/:groupId/vehicles/:vehicleId', requireAuth, async (req, res) => {
  try {
    const success = await storage.removeVehicleFromGroup(
      req.params.vehicleId,
      req.params.groupId
    );

    if (!success) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    res.json({ success: true, message: "Vehicle removed from group" });
  } catch (error) {
    console.error("Error removing vehicle from group:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/delivery-management/vehicles/:vehicleId/groups - Get groups for a vehicle
router.get('/vehicles/:vehicleId/groups', requireAuth, async (req, res) => {
  try {
    const groups = await storage.getGroupsByVehicleId(req.params.vehicleId);
    res.json(groups);
  } catch (error) {
    console.error("Error fetching vehicle groups:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
