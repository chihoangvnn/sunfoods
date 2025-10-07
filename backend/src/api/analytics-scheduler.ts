import type { Express, Request, Response } from "express";
import { 
  getAnalyticsSchedulerStats, 
  manualAnalyticsCollection,
  startAnalyticsScheduler,
  stopAnalyticsScheduler 
} from "../services/analytics-scheduler";
import { fetchPostAnalytics } from "../services/analytics";

export function registerAnalyticsSchedulerRoutes(app: Express) {
  app.get("/api/analytics-scheduler/stats", async (req: Request, res: Response) => {
    try {
      if (!req.session || !req.session.adminId) {
        return res.status(401).json({ error: "Unauthorized. Admin access required." });
      }

      const stats = getAnalyticsSchedulerStats();
      res.json(stats);
    } catch (error: any) {
      console.error("Error getting analytics scheduler stats:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/analytics-scheduler/trigger", async (req: Request, res: Response) => {
    try {
      if (!req.session || !req.session.adminId) {
        return res.status(401).json({ error: "Unauthorized. Admin access required." });
      }

      const result = await manualAnalyticsCollection();
      res.json(result);
    } catch (error: any) {
      console.error("Error triggering analytics collection:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/analytics-scheduler/start", async (req: Request, res: Response) => {
    try {
      if (!req.session || !req.session.adminId) {
        return res.status(401).json({ error: "Unauthorized. Admin access required." });
      }

      const { intervalMs } = req.body;
      startAnalyticsScheduler(intervalMs);
      
      res.json({ 
        success: true, 
        message: "Analytics scheduler started",
        stats: getAnalyticsSchedulerStats()
      });
    } catch (error: any) {
      console.error("Error starting analytics scheduler:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/analytics-scheduler/stop", async (req: Request, res: Response) => {
    try {
      if (!req.session || !req.session.adminId) {
        return res.status(401).json({ error: "Unauthorized. Admin access required." });
      }

      stopAnalyticsScheduler();
      
      res.json({ 
        success: true, 
        message: "Analytics scheduler stopped",
        stats: getAnalyticsSchedulerStats()
      });
    } catch (error: any) {
      console.error("Error stopping analytics scheduler:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/analytics/:postId/fetch", async (req: Request, res: Response) => {
    try {
      if (!req.session || !req.session.adminId) {
        return res.status(401).json({ error: "Unauthorized. Admin access required." });
      }

      const { postId } = req.params;
      
      await fetchPostAnalytics(postId);
      
      res.json({ 
        success: true, 
        message: "Analytics fetched successfully",
        postId
      });
    } catch (error: any) {
      console.error(`Error fetching analytics for post ${req.params.postId}:`, error);
      res.status(500).json({ error: error.message });
    }
  });
}
