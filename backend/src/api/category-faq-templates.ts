/**
 * ⚠️ CATEGORY FAQ TEMPLATES API - CURRENTLY DISABLED
 * categoryFAQTemplates and contentFAQAssignments tables do not exist in database
 * All routes return 503 Service Unavailable
 */
import { Router } from 'express';

const router = Router();

// Middleware to disable all routes - required tables do not exist
router.use((req, res) => {
  res.status(503).json({ 
    error: 'Category FAQ templates feature is currently unavailable - categoryFAQTemplates and contentFAQAssignments tables not in database' 
  });
});

export default router;
