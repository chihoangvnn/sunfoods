// @ts-nocheck
import express, { Router } from "express";
import { db } from "../db";
import { customers, registrationTokens } from "../../shared/schema";
import { eq, and, lt, lte, gte, sql } from "drizzle-orm";
import QRCode from "qrcode";
import crypto from "crypto";

const router: Router = express.Router();

const requireAdminAuth = (req: any, res: any, next: any) => {
  if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
    next();
    return;
  }

  if (!req.session || !req.session.userId) {
    return res.status(401).json({ 
      error: "Unauthorized. Admin access required.",
      code: "AUTH_REQUIRED"
    });
  }
  next();
};

router.post("/generate-qr", requireAdminAuth, async (req, res) => {
  try {
    const { tier = "gold", maxUses = 100, validityDays = 30, notes = "" } = req.body;

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + validityDays);

    const [createdToken] = await db
      .insert(registrationTokens)
      .values({
        token,
        tier,
        maxUses,
        usedCount: 0,
        expiresAt,
        createdBy: (req.session as any)?.userId || null,
        notes
      })
      .returning();

    const registrationUrl = `${process.env.REPLIT_DOMAINS ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}` : 'http://localhost:5000'}/vip-register/${token}`;

    const qrCodeDataUrl = await QRCode.toDataURL(registrationUrl, {
      errorCorrectionLevel: "H",
      width: 400,
      margin: 2
    });

    res.json({
      success: true,
      token: createdToken.token,
      qrCode: qrCodeDataUrl,
      registrationUrl,
      tier: createdToken.tier,
      expiresAt: createdToken.expiresAt?.toISOString(),
      maxUses: createdToken.maxUses
    });

  } catch (error) {
    console.error("QR generation error:", error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to generate QR code" 
    });
  }
});

router.get("/verify/:token", async (req, res) => {
  try {
    const { token } = req.params;

    const [registrationToken] = await db
      .select()
      .from(registrationTokens)
      .where(eq(registrationTokens.token, token))
      .limit(1);

    if (!registrationToken) {
      return res.status(404).json({ 
        success: false, 
        error: "Invalid or expired token" 
      });
    }

    if (new Date(registrationToken.expiresAt) < new Date()) {
      return res.status(400).json({ 
        success: false, 
        error: "Token has expired" 
      });
    }

    if (registrationToken.maxUses && registrationToken.usedCount >= registrationToken.maxUses) {
      return res.status(400).json({ 
        success: false, 
        error: "Token usage limit reached" 
      });
    }

    res.json({
      success: true,
      tier: registrationToken.tier,
      expiresAt: registrationToken.expiresAt.toISOString(),
      remainingUses: registrationToken.maxUses ? registrationToken.maxUses - registrationToken.usedCount : null
    });

  } catch (error) {
    console.error("Token verification error:", error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Token verification failed" 
    });
  }
});

router.get("/tokens", requireAdminAuth, async (req, res) => {
  try {
    const tokens = await db
      .select()
      .from(registrationTokens)
      .orderBy(sql`${registrationTokens.createdAt} DESC`);

    res.json({
      success: true,
      data: tokens.map(t => {
        const expiresAt = new Date(t.expiresAt);
        const now = new Date();
        const isExpired = expiresAt < now;
        const isMaxedOut = t.maxUses !== null && t.usedCount >= t.maxUses;
        
        return {
          id: t.id,
          token: t.token,
          tier: t.tier,
          maxUses: t.maxUses,
          usedCount: t.usedCount,
          expiresAt: t.expiresAt?.toISOString(),
          createdAt: t.createdAt?.toISOString(),
          notes: t.notes,
          isActive: !isExpired && !isMaxedOut
        };
      })
    });
  } catch (error) {
    console.error("Fetch tokens error:", error);
    res.status(500).json({ 
      success: false,
      data: [],
      error: error instanceof Error ? error.message : "Failed to fetch tokens" 
    });
  }
});

router.post("/register", async (req, res) => {
  try {
    const { token, phone, name, address } = req.body;

    if (!token || !phone || !name) {
      return res.status(400).json({
        success: false,
        error: "Token, phone, and name are required"
      });
    }

    const [registrationToken] = await db
      .select()
      .from(registrationTokens)
      .where(eq(registrationTokens.token, token))
      .limit(1);

    if (!registrationToken) {
      return res.status(404).json({ 
        success: false, 
        error: "Invalid or expired token" 
      });
    }

    if (new Date(registrationToken.expiresAt) < new Date()) {
      return res.status(400).json({ 
        success: false, 
        error: "Token has expired" 
      });
    }

    if (registrationToken.maxUses && registrationToken.usedCount >= registrationToken.maxUses) {
      return res.status(400).json({ 
        success: false, 
        error: "Token usage limit reached" 
      });
    }

    let customer;

    try {
      customer = await db.transaction(async (tx) => {
        const existingCustomer = await tx
          .select()
          .from(customers)
          .where(eq(customers.phone, phone))
          .limit(1);

        let cust;

        if (existingCustomer.length > 0) {
          [cust] = await tx
            .update(customers)
            .set({
              customerRole: "vip",
              membershipTier: registrationToken.tier,
              profileStatus: "complete",
              address: address || existingCustomer[0].address,
              geocodingStatus: "pending"
            })
            .where(eq(customers.id, existingCustomer[0].id))
            .returning();
        } else {
          [cust] = await tx
            .insert(customers)
            .values({
              name,
              phone,
              address: address || "",
              customerRole: "vip",
              membershipTier: registrationToken.tier,
              registrationSource: "web",
              profileStatus: "complete",
              geocodingStatus: "pending"
            })
            .returning();
        }

        const maxUsesCheck = registrationToken.maxUses 
          ? and(
              eq(registrationTokens.id, registrationToken.id),
              lt(registrationTokens.usedCount, registrationToken.maxUses)
            )
          : eq(registrationTokens.id, registrationToken.id);

        const [updatedToken] = await tx
          .update(registrationTokens)
          .set({ 
            usedCount: sql`${registrationTokens.usedCount} + 1`,
            updatedAt: new Date()
          })
          .where(maxUsesCheck)
          .returning();

        if (!updatedToken) {
          throw new Error("CONCURRENT_LIMIT_REACHED");
        }

        return cust;
      });
    } catch (error) {
      if (error instanceof Error && error.message === "CONCURRENT_LIMIT_REACHED") {
        return res.status(400).json({ 
          success: false, 
          error: "Token usage limit reached (concurrent request)" 
        });
      }
      throw error;
    }

    res.json({
      success: true,
      customer: {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        tier: customer.membershipTier,
        role: customer.customerRole
      },
      message: "VIP registration successful"
    });

  } catch (error) {
    console.error("VIP registration error:", error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Registration failed" 
    });
  }
});

router.get("/tokens", requireAdminAuth, async (req, res) => {
  try {
    const allTokens = await db
      .select()
      .from(registrationTokens)
      .orderBy(registrationTokens.createdAt);

    const now = new Date();
    const tokens = allTokens.map(data => ({
      id: data.id,
      token: data.token,
      tier: data.tier,
      maxUses: data.maxUses,
      usedCount: data.usedCount,
      expiresAt: data.expiresAt.toISOString(),
      notes: data.notes,
      createdBy: data.createdBy,
      createdAt: data.createdAt?.toISOString(),
      isExpired: new Date(data.expiresAt) < now,
      isMaxedOut: data.maxUses ? data.usedCount >= data.maxUses : false
    }));

    res.json({
      success: true,
      tokens
    });

  } catch (error) {
    console.error("Token list error:", error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to fetch tokens" 
    });
  }
});

export default router;
