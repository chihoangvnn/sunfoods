import { Router, type RequestHandler } from "express";
import { scheduler } from "../services/scheduler";

const router = Router();

// 🔐 Admin Auth Middleware
const requireAdminAuth: RequestHandler = (req, res, next) => {
  if (!req.session || !req.session.adminId) {
    return res.status(401).json({ error: 'Unauthorized. Admin access required.' });
  }
  
  next();
};

// Get scheduler health and stats
router.get("/health", requireAdminAuth, (req, res) => {
  try {
    const stats = scheduler.getStats();
    
    // Calculate health status
    const isHealthy = stats.isRunning;
    const status = isHealthy ? "healthy" : "stopped";
    
    // Calculate success rate (0-100 as number)
    const totalProcessed = stats.postsProcessed;
    const successRate = totalProcessed > 0 
      ? parseFloat(((stats.postsSucceeded / totalProcessed) * 100).toFixed(2))
      : 0;
    
    res.json({
      status,
      scheduler: {
        isRunning: stats.isRunning,
        lastRun: stats.lastRun,
        uptime: stats.uptime,
      },
      stats: {
        postsProcessed: stats.postsProcessed,
        postsSucceeded: stats.postsSucceeded,
        postsFailed: stats.postsFailed,
        successRate, // 0-100 as number for monitoring clients
      },
      timestamp: new Date(),
    });
  } catch (error) {
    console.error("Error fetching scheduler health:", error);
    res.status(500).json({ 
      error: "Failed to fetch scheduler health",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// Manual trigger endpoint (admin only, for testing)
router.post("/trigger", requireAdminAuth, async (req, res) => {
  try {
    await scheduler.triggerNow();
    res.json({ 
      success: true, 
      message: "Scheduler triggered manually" 
    });
  } catch (error) {
    console.error("Error triggering scheduler:", error);
    res.status(500).json({ 
      error: "Failed to trigger scheduler",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

export default router;
