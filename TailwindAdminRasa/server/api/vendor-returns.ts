/**
 * ⚠️ VENDOR RETURNS API - CURRENTLY DISABLED
 * vendorReturns table does not exist in database
 * All routes return 503 Service Unavailable
 */
import { Router } from 'express';

const router = Router();

// Middleware to disable all routes - vendorReturns table does not exist
router.use((req, res) => {
  res.status(503).json({ 
    error: 'Vendor returns feature is currently unavailable - vendorReturns table not in database' 
  });
});

export default router;
