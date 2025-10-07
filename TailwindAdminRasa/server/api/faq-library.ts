/**
 * ⚠️ FAQ LIBRARY API - CURRENTLY DISABLED
 * contentFAQAssignments table does not exist in database
 * All routes return 503 Service Unavailable
 */
import { Router } from 'express';

const router = Router();

// Middleware to disable all routes - required table does not exist
router.use((req, res) => {
  res.status(503).json({ 
    error: 'FAQ library feature is currently unavailable - contentFAQAssignments table not in database' 
  });
});

export default router;
