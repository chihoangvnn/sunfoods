import express, { Request, Response } from "express";
import { db } from "../db";
import { customers } from "../../shared/schema";
import { eq } from "drizzle-orm";

const router = express.Router();

// GET /api/customer-dashboard/:customerId - Get customer profile with activated roles
router.get("/:customerId", async (req: Request, res: Response) => {
  try {
    const { customerId } = req.params;

    if (!customerId) {
      return res.status(400).json({ error: "Customer ID is required" });
    }

    // Fetch customer profile
    const customer = await db
      .select()
      .from(customers)
      .where(eq(customers.id, customerId))
      .limit(1);

    if (!customer || customer.length === 0) {
      return res.status(404).json({ error: "Customer not found" });
    }

    const customerData = customer[0];

    // Build role activation status
    const activatedRoles = {
      isCustomer: true, // Always true
      isAffiliate: customerData.isAffiliate,
      isDriver: customerData.customerRole === "driver",
      isVip: customerData.customerRole === "vip",
      isCorporate: customerData.customerRole === "corporate",
    };

    // Return customer profile with role flags
    res.json({
      customer: {
        id: customerData.id,
        name: customerData.name,
        email: customerData.email,
        phone: customerData.phone,
        avatar: customerData.avatar,
        status: customerData.status,
        membershipTier: customerData.membershipTier,
        customerRole: customerData.customerRole,
        isAffiliate: customerData.isAffiliate,
        affiliateCode: customerData.affiliateCode,
        affiliateStatus: customerData.affiliateStatus,
        totalSpent: customerData.totalSpent,
        pointsBalance: customerData.pointsBalance,
        joinDate: customerData.joinDate,
      },
      activatedRoles,
    });
  } catch (error: any) {
    console.error("Error fetching customer dashboard:", error);
    res.status(500).json({ error: "Failed to fetch customer dashboard" });
  }
});

export default router;
