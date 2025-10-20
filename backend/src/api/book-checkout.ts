// @ts-nocheck
import { Express } from "express";
import { db } from "../db";
import { bookPaymentTransactions, paymentGatewaySettings, type InsertBookPaymentTransaction } from "@shared/schema";
import { eq } from "drizzle-orm";

export function registerBookCheckoutRoutes(app: Express) {
  
  // POST initialize checkout session
  app.post("/api/book-checkout/init", async (req, res) => {
    try {
      const { orderId, gateway, amount, currency = "USD", customerEmail, metadata } = req.body;

      // Validate gateway is enabled
      const gatewaySetting = await db
        .select()
        .from(paymentGatewaySettings)
        .where(eq(paymentGatewaySettings.gateway, gateway))
        .limit(1);

      if (!gatewaySetting.length) {
        return res.status(400).json({ error: `Payment gateway '${gateway}' not configured` });
      }

      if (!gatewaySetting[0].enabled) {
        return res.status(400).json({ error: `Payment gateway '${gateway}' is disabled` });
      }

      // Generate transaction ID (in production, this would come from payment provider)
      const transactionId = `${gateway.toUpperCase()}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Create transaction record
      const transaction = await db
        .insert(bookPaymentTransactions)
        .values({
          orderId,
          gateway,
          transactionId,
          amount: amount.toString(),
          currency,
          status: "pending",
          customerEmail,
          metadata: metadata || {}
        })
        .returning();

      // Return checkout session details
      res.json({
        success: true,
        transaction: transaction[0],
        checkoutUrl: `/book-checkout?transactionId=${transactionId}`, // Frontend checkout URL
        testMode: gatewaySetting[0].testMode
      });
    } catch (error: any) {
      console.error("Error initializing checkout:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // POST process payment (demo - actual processing would be with payment gateway SDKs)
  app.post("/api/book-checkout/process", async (req, res) => {
    try {
      const { transactionId, paymentMethod, paymentDetails } = req.body;

      // Find transaction
      const transactions = await db
        .select()
        .from(bookPaymentTransactions)
        .where(eq(bookPaymentTransactions.transactionId, transactionId))
        .limit(1);

      if (!transactions.length) {
        return res.status(404).json({ error: "Transaction not found" });
      }

      const transaction = transactions[0];

      if (transaction.status !== "pending") {
        return res.status(400).json({ error: "Transaction already processed" });
      }

      // Update to processing
      await db
        .update(bookPaymentTransactions)
        .set({ status: "processing", paymentMethod })
        .where(eq(bookPaymentTransactions.id, transaction.id));

      // Simulate payment processing (in production, call actual gateway API)
      const success = Math.random() > 0.1; // 90% success rate for demo

      if (success) {
        // Mark as completed
        const completed = await db
          .update(bookPaymentTransactions)
          .set({ 
            status: "completed", 
            completedAt: new Date(),
            metadata: { ...transaction.metadata, paymentDetails }
          })
          .where(eq(bookPaymentTransactions.id, transaction.id))
          .returning();

        res.json({
          success: true,
          transaction: completed[0],
          message: "Payment processed successfully"
        });
      } else {
        // Mark as failed
        const failed = await db
          .update(bookPaymentTransactions)
          .set({ 
            status: "failed",
            errorMessage: "Payment gateway declined the transaction"
          })
          .where(eq(bookPaymentTransactions.id, transaction.id))
          .returning();

        res.status(400).json({
          success: false,
          transaction: failed[0],
          message: "Payment failed"
        });
      }
    } catch (error: any) {
      console.error("Error processing payment:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // GET checkout status by transaction ID
  app.get("/api/book-checkout/status/:transactionId", async (req, res) => {
    try {
      const { transactionId } = req.params;

      const transactions = await db
        .select()
        .from(bookPaymentTransactions)
        .where(eq(bookPaymentTransactions.transactionId, transactionId))
        .limit(1);

      if (!transactions.length) {
        return res.status(404).json({ error: "Transaction not found" });
      }

      res.json(transactions[0]);
    } catch (error: any) {
      console.error("Error fetching checkout status:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // POST refund payment
  app.post("/api/book-checkout/refund/:transactionId", async (req, res) => {
    try {
      const { transactionId } = req.params;
      const { reason } = req.body;

      const transactions = await db
        .select()
        .from(bookPaymentTransactions)
        .where(eq(bookPaymentTransactions.transactionId, transactionId))
        .limit(1);

      if (!transactions.length) {
        return res.status(404).json({ error: "Transaction not found" });
      }

      const transaction = transactions[0];

      if (transaction.status !== "completed") {
        return res.status(400).json({ error: "Can only refund completed transactions" });
      }

      // In production, call payment gateway refund API here

      const refunded = await db
        .update(bookPaymentTransactions)
        .set({ 
          status: "refunded",
          errorMessage: reason || "Refunded by admin"
        })
        .where(eq(bookPaymentTransactions.id, transaction.id))
        .returning();

      res.json({
        success: true,
        transaction: refunded[0],
        message: "Payment refunded successfully"
      });
    } catch (error: any) {
      console.error("Error processing refund:", error);
      res.status(500).json({ error: error.message });
    }
  });
}
