import express, { Request, Response } from "express";
import { storage } from "../storage";

const router = express.Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    if (!req.session || !req.session.customerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const customerId = req.session.customerId;
    const notifications = await storage.getNotifications(customerId);

    res.json(notifications);
  } catch (error: any) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

router.post("/read", async (req: Request, res: Response) => {
  try {
    const customerId = req.session?.customerId;
    if (!customerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { notificationIds } = req.body;

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return res.status(400).json({ error: "Invalid notification IDs" });
    }

    await storage.markNotificationsAsRead(notificationIds, customerId);

    res.json({ success: true });
  } catch (error: any) {
    console.error("Error marking notifications as read:", error);
    res.status(500).json({ error: "Failed to mark notifications as read" });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  try {
    if (!req.session || !req.session.customerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const customerId = req.session.customerId;
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Notification ID is required" });
    }

    const deleted = await storage.deleteNotification(id, customerId);

    if (!deleted) {
      return res.status(404).json({ error: "Notification not found or unauthorized" });
    }

    res.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ error: "Failed to delete notification" });
  }
});

export default router;
