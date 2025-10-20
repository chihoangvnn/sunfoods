// @ts-nocheck
import express, { Request, Response } from "express";
import { db } from "../db";
import { vendors, depositTransactions, vendorOrders } from "@shared/schema";
import { requireVendorAuth } from "../middleware/vendor-auth";
import { eq, and, gte, lte, desc, sum, sql } from "drizzle-orm";
import { z } from "zod";

const router = express.Router();

router.get("/balance", requireVendorAuth, async (req: Request, res: Response) => {
  try {
    const vendorId = req.vendor!.id;

    const [vendorData] = await db
      .select({
        depositBalance: vendors.depositBalance,
        depositTotal: vendors.depositTotal,
        minimumDeposit: vendors.minimumDeposit,
        lastDepositAt: vendors.lastDepositAt,
      })
      .from(vendors)
      .where(eq(vendors.id, vendorId));

    if (!vendorData) {
      res.status(404).json({ error: "Không tìm thấy thông tin nhà cung cấp" });
      return;
    }

    const [pendingDeductionsData] = await db
      .select({
        pendingDeductions: sql<string>`COALESCE(SUM(${vendorOrders.vendorCost}), 0)`,
      })
      .from(vendorOrders)
      .where(
        and(
          eq(vendorOrders.vendorId, vendorId),
          eq(vendorOrders.status, "delivered"),
          sql`NOT EXISTS (
            SELECT 1 FROM ${depositTransactions}
            WHERE ${depositTransactions.orderId} = ${vendorOrders.orderId}
            AND ${depositTransactions.type} = 'deduction'
            AND ${depositTransactions.status} = 'approved'
          )`
        )
      );

    res.json({
      depositBalance: vendorData.depositBalance,
      depositTotal: vendorData.depositTotal,
      minimumDeposit: vendorData.minimumDeposit,
      lastDepositAt: vendorData.lastDepositAt,
      pendingDeductions: pendingDeductionsData?.pendingDeductions || "0.00",
    });
  } catch (error: any) {
    console.error("Error fetching vendor balance:", error);
    res.status(500).json({ error: "Lỗi khi tải thông tin số dư" });
  }
});

const transactionQuerySchema = z.object({
  type: z.enum(["deposit", "deduction", "refund"]).optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  limit: z.coerce.number().min(1).max(200).default(50),
});

router.get("/transactions", requireVendorAuth, async (req: Request, res: Response) => {
  try {
    const vendorId = req.vendor!.id;

    const validation = transactionQuerySchema.safeParse(req.query);
    if (!validation.success) {
      res.status(400).json({ 
        error: "Tham số truy vấn không hợp lệ", 
        details: validation.error.errors 
      });
      return;
    }

    const { type, startDate, endDate, limit } = validation.data;

    const conditions = [eq(depositTransactions.vendorId, vendorId)];

    if (type) {
      conditions.push(eq(depositTransactions.type, type));
    }

    if (startDate) {
      conditions.push(gte(depositTransactions.createdAt, new Date(startDate)));
    }

    if (endDate) {
      const endDateTime = new Date(endDate);
      endDateTime.setHours(23, 59, 59, 999);
      conditions.push(lte(depositTransactions.createdAt, endDateTime));
    }

    const transactions = await db
      .select({
        id: depositTransactions.id,
        type: depositTransactions.type,
        amount: depositTransactions.amount,
        balanceBefore: depositTransactions.balanceBefore,
        balanceAfter: depositTransactions.balanceAfter,
        description: depositTransactions.description,
        orderId: depositTransactions.orderId,
        status: depositTransactions.status,
        createdAt: depositTransactions.createdAt,
        processedAt: depositTransactions.processedAt,
      })
      .from(depositTransactions)
      .where(and(...conditions))
      .orderBy(desc(depositTransactions.createdAt))
      .limit(limit);

    res.json(transactions);
  } catch (error: any) {
    console.error("Error fetching vendor transactions:", error);
    res.status(500).json({ error: "Lỗi khi tải danh sách giao dịch" });
  }
});

const depositRequestSchema = z.object({
  amount: z.number()
    .min(100000, "Số tiền nạp tối thiểu là 100,000 VNĐ")
    .max(100000000, "Số tiền nạp tối đa là 100,000,000 VNĐ"),
  paymentMethod: z.enum(["bank_transfer", "cash", "momo"], {
    errorMap: () => ({ message: "Phương thức thanh toán không hợp lệ" })
  }),
  notes: z.string().max(300, "Ghi chú không được vượt quá 300 ký tự").optional(),
});

router.post("/deposit", requireVendorAuth, async (req: Request, res: Response) => {
  try {
    const vendorId = req.vendor!.id;

    const validation = depositRequestSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({ 
        error: "Dữ liệu không hợp lệ", 
        details: validation.error.errors 
      });
      return;
    }

    const { amount, paymentMethod, notes } = validation.data;

    const [vendorData] = await db
      .select({
        depositBalance: vendors.depositBalance,
      })
      .from(vendors)
      .where(eq(vendors.id, vendorId));

    if (!vendorData) {
      res.status(404).json({ error: "Không tìm thấy thông tin nhà cung cấp" });
      return;
    }

    const [transaction] = await db
      .insert(depositTransactions)
      .values({
        vendorId: vendorId,
        type: "deposit",
        status: "pending",
        amount: amount.toString(),
        balanceBefore: vendorData.depositBalance,
        balanceAfter: vendorData.depositBalance,
        description: notes || "Yêu cầu nạp tiền",
        paymentMethod: paymentMethod,
      })
      .returning();

    res.status(201).json(transaction);
  } catch (error: any) {
    console.error("Error creating deposit request:", error);
    res.status(500).json({ error: "Lỗi khi tạo yêu cầu nạp tiền" });
  }
});

export default router;
