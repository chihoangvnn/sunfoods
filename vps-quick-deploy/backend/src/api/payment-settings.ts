import { Express } from "express";
import { db } from "../db";
import { paymentGatewaySettings, type InsertPaymentGatewaySetting, type UpdatePaymentGatewaySetting } from "@shared/schema";
import { eq } from "drizzle-orm";

export function registerPaymentSettingsRoutes(app: Express) {
  
  // GET all payment gateway settings
  app.get("/api/payment-settings", async (req, res) => {
    try {
      const settings = await db.select().from(paymentGatewaySettings);
      res.json(settings);
    } catch (error: any) {
      console.error("Error fetching payment settings:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // GET payment gateway setting by gateway name
  app.get("/api/payment-settings/:gateway", async (req, res) => {
    try {
      const { gateway } = req.params;
      const setting = await db
        .select()
        .from(paymentGatewaySettings)
        .where(eq(paymentGatewaySettings.gateway, gateway as any))
        .limit(1);
      
      if (!setting.length) {
        return res.status(404).json({ error: "Payment gateway not found" });
      }
      
      res.json(setting[0]);
    } catch (error: any) {
      console.error("Error fetching payment setting:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // POST create/update payment gateway setting
  app.post("/api/payment-settings", async (req, res) => {
    try {
      const data = req.body as InsertPaymentGatewaySetting;
      
      // Check if gateway already exists
      const existing = await db
        .select()
        .from(paymentGatewaySettings)
        .where(eq(paymentGatewaySettings.gateway, data.gateway))
        .limit(1);

      let result;
      if (existing.length > 0) {
        // Update existing
        result = await db
          .update(paymentGatewaySettings)
          .set({
            ...data,
            updatedAt: new Date()
          })
          .where(eq(paymentGatewaySettings.gateway, data.gateway))
          .returning();
      } else {
        // Create new
        result = await db
          .insert(paymentGatewaySettings)
          .values(data)
          .returning();
      }

      res.json(result[0]);
    } catch (error: any) {
      console.error("Error saving payment setting:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // PUT update payment gateway setting by ID
  app.put("/api/payment-settings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = req.body as UpdatePaymentGatewaySetting;
      
      const result = await db
        .update(paymentGatewaySettings)
        .set({
          ...data,
          updatedAt: new Date()
        })
        .where(eq(paymentGatewaySettings.id, id))
        .returning();

      if (!result.length) {
        return res.status(404).json({ error: "Payment gateway not found" });
      }

      res.json(result[0]);
    } catch (error: any) {
      console.error("Error updating payment setting:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // DELETE payment gateway setting
  app.delete("/api/payment-settings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      const result = await db
        .delete(paymentGatewaySettings)
        .where(eq(paymentGatewaySettings.id, id))
        .returning();

      if (!result.length) {
        return res.status(404).json({ error: "Payment gateway not found" });
      }

      res.json({ success: true, deleted: result[0] });
    } catch (error: any) {
      console.error("Error deleting payment setting:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // PATCH toggle payment gateway enabled status
  app.patch("/api/payment-settings/:id/toggle", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      const current = await db
        .select()
        .from(paymentGatewaySettings)
        .where(eq(paymentGatewaySettings.id, id))
        .limit(1);

      if (!current.length) {
        return res.status(404).json({ error: "Payment gateway not found" });
      }

      const result = await db
        .update(paymentGatewaySettings)
        .set({
          enabled: !current[0].enabled,
          updatedAt: new Date()
        })
        .where(eq(paymentGatewaySettings.id, id))
        .returning();

      res.json(result[0]);
    } catch (error: any) {
      console.error("Error toggling payment setting:", error);
      res.status(500).json({ error: error.message });
    }
  });
}
