/**
 * ⚠️ GHN SHIPPING API - CURRENTLY DISABLED
 * vendorShipments and vendorPushSubscriptions tables do not exist in database
 * All routes return 503 Service Unavailable
 */
import { Router } from 'express';

const router = Router();

// Middleware to disable all routes - required tables do not exist
router.use((req, res) => {
  res.status(503).json({ 
    error: 'GHN shipping feature is currently unavailable - vendorShipments and vendorPushSubscriptions tables not in database' 
  });
});

export default router;
