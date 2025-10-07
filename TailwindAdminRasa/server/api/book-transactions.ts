import { Express } from "express";
import { db } from "../db";
import { bookPaymentTransactions, type InsertBookPaymentTransaction } from "@shared/schema";
import { eq, desc, and, gte, lte, sql } from "drizzle-orm";

export function registerBookTransactionsRoutes(app: Express) {
  
  // GET all payment transactions with filters
  app.get("/api/book-transactions", async (req, res) => {
    try {
      const { gateway, status, startDate, endDate, limit = 100, offset = 0 } = req.query;
      
      let query = db.select().from(bookPaymentTransactions);
      
      const conditions: any[] = [];
      
      if (gateway) {
        conditions.push(eq(bookPaymentTransactions.gateway, gateway as string));
      }
      
      if (status) {
        conditions.push(eq(bookPaymentTransactions.status, status as any));
      }
      
      if (startDate) {
        conditions.push(gte(bookPaymentTransactions.createdAt, new Date(startDate as string)));
      }
      
      if (endDate) {
        conditions.push(lte(bookPaymentTransactions.createdAt, new Date(endDate as string)));
      }
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as any;
      }
      
      const transactions = await query
        .orderBy(desc(bookPaymentTransactions.createdAt))
        .limit(Number(limit))
        .offset(Number(offset));
      
      res.json(transactions);
    } catch (error: any) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // GET transaction by ID
  app.get("/api/book-transactions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const transaction = await db
        .select()
        .from(bookPaymentTransactions)
        .where(eq(bookPaymentTransactions.id, id))
        .limit(1);
      
      if (!transaction.length) {
        return res.status(404).json({ error: "Transaction not found" });
      }
      
      res.json(transaction[0]);
    } catch (error: any) {
      console.error("Error fetching transaction:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // GET transactions by order ID
  app.get("/api/book-transactions/order/:orderId", async (req, res) => {
    try {
      const { orderId } = req.params;
      const transactions = await db
        .select()
        .from(bookPaymentTransactions)
        .where(eq(bookPaymentTransactions.orderId, orderId))
        .orderBy(desc(bookPaymentTransactions.createdAt));
      
      res.json(transactions);
    } catch (error: any) {
      console.error("Error fetching order transactions:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // POST create new transaction
  app.post("/api/book-transactions", async (req, res) => {
    try {
      const data = req.body as InsertBookPaymentTransaction;
      
      const result = await db
        .insert(bookPaymentTransactions)
        .values(data)
        .returning();

      res.json(result[0]);
    } catch (error: any) {
      console.error("Error creating transaction:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // PUT update transaction status
  app.put("/api/book-transactions/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status, errorMessage } = req.body;
      
      const updateData: any = { status };
      
      if (status === "completed") {
        updateData.completedAt = new Date();
      }
      
      if (errorMessage) {
        updateData.errorMessage = errorMessage;
      }
      
      const result = await db
        .update(bookPaymentTransactions)
        .set(updateData)
        .where(eq(bookPaymentTransactions.id, id))
        .returning();

      if (!result.length) {
        return res.status(404).json({ error: "Transaction not found" });
      }

      res.json(result[0]);
    } catch (error: any) {
      console.error("Error updating transaction status:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // GET transaction statistics
  app.get("/api/book-transactions/stats/summary", async (req, res) => {
    try {
      const { startDate, endDate, gateway } = req.query;
      
      const conditions: any[] = [];
      
      if (startDate) {
        conditions.push(gte(bookPaymentTransactions.createdAt, new Date(startDate as string)));
      }
      
      if (endDate) {
        conditions.push(lte(bookPaymentTransactions.createdAt, new Date(endDate as string)));
      }
      
      if (gateway) {
        conditions.push(eq(bookPaymentTransactions.gateway, gateway as string));
      }
      
      let query = db
        .select({
          totalTransactions: sql<number>`COUNT(*)::int`,
          totalAmount: sql<number>`SUM(CAST(${bookPaymentTransactions.amount} AS DECIMAL))`,
          completedCount: sql<number>`COUNT(CASE WHEN ${bookPaymentTransactions.status} = 'completed' THEN 1 END)::int`,
          failedCount: sql<number>`COUNT(CASE WHEN ${bookPaymentTransactions.status} = 'failed' THEN 1 END)::int`,
          pendingCount: sql<number>`COUNT(CASE WHEN ${bookPaymentTransactions.status} = 'pending' THEN 1 END)::int`
        })
        .from(bookPaymentTransactions);
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as any;
      }
      
      const stats = await query;
      
      res.json(stats[0]);
    } catch (error: any) {
      console.error("Error fetching transaction stats:", error);
      res.status(500).json({ error: error.message });
    }
  });
}
