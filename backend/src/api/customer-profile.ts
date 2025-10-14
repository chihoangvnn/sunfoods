import express, { Request, Response } from "express";
import { db } from "../db";
import { customers } from "../../shared/schema";
import { eq } from "drizzle-orm";

const router = express.Router();

// GET /api/customers/me - Get current customer profile
router.get("/me", async (req: Request, res: Response) => {
  try {
    const customerId = req.session?.customerId;

    if (!customerId) {
      return res.status(401).json({ 
        error: "Unauthorized - please log in",
        code: "AUTH_REQUIRED"
      });
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

    // Return customer profile with role flags
    res.json({
      success: true,
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
        address: customerData.address,
        address2: customerData.address2,
      }
    });
  } catch (error: any) {
    console.error("Error fetching customer profile:", error);
    res.status(500).json({ error: "Failed to fetch customer profile" });
  }
});

// PUT /api/customers/me - Update current customer profile
router.put("/me", async (req: Request, res: Response) => {
  try {
    const customerId = req.session?.customerId;

    if (!customerId) {
      return res.status(401).json({ 
        error: "Unauthorized - please log in",
        code: "AUTH_REQUIRED"
      });
    }

    const { name, email, avatar, address, address2 } = req.body;

    // Build update object (only include provided fields)
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (address !== undefined) updateData.address = address;
    if (address2 !== undefined) updateData.address2 = address2;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    // Update customer profile
    const [updatedCustomer] = await db
      .update(customers)
      .set(updateData)
      .where(eq(customers.id, customerId))
      .returning();

    if (!updatedCustomer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    res.json({ 
      success: true,
      message: "Profile updated successfully",
      customer: {
        id: updatedCustomer.id,
        name: updatedCustomer.name,
        email: updatedCustomer.email,
        phone: updatedCustomer.phone,
        avatar: updatedCustomer.avatar,
        address: updatedCustomer.address,
        address2: updatedCustomer.address2,
      }
    });
  } catch (error: any) {
    console.error("Error updating customer profile:", error);
    res.status(500).json({ error: "Failed to update customer profile" });
  }
});

export default router;
