import express, { Request, Response } from "express";
import { db } from "../db";
import { vendors, vendorOrders, vendorProducts, products } from "@shared/schema";
import { eq, and, or, sql, desc, asc } from "drizzle-orm";
import { requireVendorAuth } from "../middleware/vendor-auth";

const router = express.Router();

router.get("/stats", requireVendorAuth, async (req: Request, res: Response) => {
  try {
    const vendorId = req.vendor!.id;

    const [orderStats] = await db
      .select({
        newOrders: sql<number>`COUNT(*) FILTER (WHERE ${vendorOrders.status} IN ('pending', 'processing'))`,
        inTransit: sql<number>`COUNT(*) FILTER (WHERE ${vendorOrders.status} = 'shipped')`,
        delivered: sql<number>`COUNT(*) FILTER (WHERE ${vendorOrders.status} = 'delivered')`,
        totalOrders: sql<number>`COUNT(*)`,
      })
      .from(vendorOrders)
      .where(eq(vendorOrders.vendorId, vendorId));

    const [financialStats] = await db
      .select({
        revenue: sql<string>`COALESCE(SUM(${vendorOrders.commissionAmount}) FILTER (WHERE ${vendorOrders.status} = 'delivered'), 0)`,
        pendingDeductions: sql<string>`COALESCE(SUM(${vendorOrders.vendorCost}) FILTER (WHERE ${vendorOrders.status} = 'delivered' AND ${vendorOrders.depositDeducted} = 0), 0)`,
      })
      .from(vendorOrders)
      .where(eq(vendorOrders.vendorId, vendorId));

    const [vendorData] = await db
      .select({
        depositBalance: vendors.depositBalance,
      })
      .from(vendors)
      .where(eq(vendors.id, vendorId));

    const recentOrders = await db
      .select({
        id: vendorOrders.id,
        orderId: vendorOrders.orderId,
        maskedCustomerName: vendorOrders.maskedCustomerName,
        maskedCustomerPhone: vendorOrders.maskedCustomerPhone,
        codAmount: vendorOrders.codAmount,
        vendorCost: vendorOrders.vendorCost,
        commissionAmount: vendorOrders.commissionAmount,
        status: vendorOrders.status,
        shippedAt: vendorOrders.shippedAt,
        deliveredAt: vendorOrders.deliveredAt,
        createdAt: vendorOrders.createdAt,
      })
      .from(vendorOrders)
      .where(eq(vendorOrders.vendorId, vendorId))
      .orderBy(desc(vendorOrders.createdAt))
      .limit(10);

    const lowStockProducts = await db
      .select({
        productName: products.name,
        currentStock: sql<number>`${vendorProducts.quantityConsigned} - ${vendorProducts.quantitySold} - ${vendorProducts.quantityReturned}`,
        consignmentPrice: vendorProducts.consignmentPrice,
      })
      .from(vendorProducts)
      .innerJoin(products, eq(vendorProducts.productId, products.id))
      .where(
        and(
          eq(vendorProducts.vendorId, vendorId),
          eq(vendorProducts.status, 'active'),
          sql`(${vendorProducts.quantityConsigned} - ${vendorProducts.quantitySold} - ${vendorProducts.quantityReturned}) < 10`
        )
      )
      .orderBy(asc(sql`${vendorProducts.quantityConsigned} - ${vendorProducts.quantitySold} - ${vendorProducts.quantityReturned}`))
      .limit(5);

    res.json({
      newOrders: Number(orderStats.newOrders) || 0,
      inTransit: Number(orderStats.inTransit) || 0,
      delivered: Number(orderStats.delivered) || 0,
      totalOrders: Number(orderStats.totalOrders) || 0,
      revenue: financialStats.revenue || "0.00",
      depositBalance: vendorData.depositBalance || "0.00",
      pendingDeductions: financialStats.pendingDeductions || "0.00",
      recentOrders: recentOrders.map(order => ({
        id: order.id,
        orderId: order.orderId,
        maskedCustomerName: order.maskedCustomerName,
        maskedCustomerPhone: order.maskedCustomerPhone,
        codAmount: order.codAmount,
        vendorCost: order.vendorCost,
        commissionAmount: order.commissionAmount,
        status: order.status,
        shippedAt: order.shippedAt,
        deliveredAt: order.deliveredAt,
        createdAt: order.createdAt,
      })),
      lowStockProducts: lowStockProducts.map(product => ({
        productName: product.productName,
        currentStock: Number(product.currentStock),
        consignmentPrice: product.consignmentPrice,
      })),
    });
  } catch (error: any) {
    console.error("Error fetching vendor dashboard stats:", error);
    res.status(500).json({ error: "Failed to fetch dashboard statistics" });
  }
});

export default router;
