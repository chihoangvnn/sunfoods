import express, { Request, Response } from "express";
import { db } from "../db";
import { consignmentRequests, products } from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";
import { requireVendorAuth } from "../middleware/vendor-auth";
import { z } from "zod";

const router = express.Router();

const createConsignmentSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().min(1).max(10000),
  consignmentPrice: z.string().regex(/^\d+(\.\d{1,2})?$/, "Must be a valid numeric price"),
  notes: z.string().max(500).optional(),
});

router.post("/", requireVendorAuth, async (req: Request, res: Response) => {
  try {
    const vendorId = req.vendor!.id;

    const validation = createConsignmentSchema.safeParse(req.body);
    
    if (!validation.success) {
      res.status(400).json({ 
        error: "Invalid request body", 
        details: validation.error.errors 
      });
      return;
    }

    const { productId, quantity, consignmentPrice, notes } = validation.data;

    const [product] = await db
      .select({
        id: products.id,
        name: products.name,
        image: products.image,
      })
      .from(products)
      .where(eq(products.id, productId));

    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    const [created] = await db
      .insert(consignmentRequests)
      .values({
        vendorId: vendorId,
        productId: productId,
        productName: product.name,
        quantity: quantity,
        proposedPrice: consignmentPrice,
        notes: notes || null,
        status: "pending",
      })
      .returning({
        id: consignmentRequests.id,
        vendorId: consignmentRequests.vendorId,
        productId: consignmentRequests.productId,
        quantity: consignmentRequests.quantity,
        proposedPrice: consignmentRequests.proposedPrice,
        status: consignmentRequests.status,
        notes: consignmentRequests.notes,
        createdAt: consignmentRequests.createdAt,
      });

    res.status(201).json({
      id: created.id,
      productId: created.productId,
      productName: product.name,
      productImage: product.image,
      quantity: created.quantity,
      consignmentPrice: created.proposedPrice,
      status: created.status,
      notes: created.notes,
      createdAt: created.createdAt,
    });
  } catch (error: any) {
    console.error("Error creating consignment request:", error);
    res.status(500).json({ error: "Failed to create consignment request" });
  }
});

router.get("/requests", requireVendorAuth, async (req: Request, res: Response) => {
  try {
    const vendorId = req.vendor!.id;
    const statusFilter = req.query.status as string | undefined;

    let query = db
      .select({
        id: consignmentRequests.id,
        productId: consignmentRequests.productId,
        productName: products.name,
        productImage: products.image,
        quantity: consignmentRequests.quantity,
        proposedPrice: consignmentRequests.proposedPrice,
        status: consignmentRequests.status,
        notes: consignmentRequests.notes,
        reviewerNotes: consignmentRequests.reviewerNotes,
        reviewedAt: consignmentRequests.reviewedAt,
        createdAt: consignmentRequests.createdAt,
      })
      .from(consignmentRequests)
      .leftJoin(products, eq(consignmentRequests.productId, products.id))
      .where(eq(consignmentRequests.vendorId, vendorId))
      .$dynamic();

    if (statusFilter && ["pending", "approved", "rejected"].includes(statusFilter)) {
      query = query.where(
        and(
          eq(consignmentRequests.vendorId, vendorId),
          eq(consignmentRequests.status, statusFilter as "pending" | "approved" | "rejected")
        )
      );
    }

    const requests = await query.orderBy(desc(consignmentRequests.createdAt));

    const formattedRequests = requests.map(request => ({
      id: request.id,
      productId: request.productId,
      productName: request.productName,
      productImage: request.productImage,
      quantity: request.quantity,
      consignmentPrice: request.proposedPrice,
      status: request.status,
      notes: request.notes,
      createdAt: request.createdAt,
      approvedAt: request.status === "approved" ? request.reviewedAt : null,
      rejectedAt: request.status === "rejected" ? request.reviewedAt : null,
      adminNotes: request.reviewerNotes,
    }));

    res.json(formattedRequests);
  } catch (error: any) {
    console.error("Error fetching consignment requests:", error);
    res.status(500).json({ error: "Failed to fetch consignment requests" });
  }
});

router.delete("/:id", requireVendorAuth, async (req: Request, res: Response) => {
  try {
    const vendorId = req.vendor!.id;
    const requestId = req.params.id;

    const [existingRequest] = await db
      .select({
        id: consignmentRequests.id,
        status: consignmentRequests.status,
      })
      .from(consignmentRequests)
      .where(
        and(
          eq(consignmentRequests.id, requestId),
          eq(consignmentRequests.vendorId, vendorId)
        )
      );

    if (!existingRequest) {
      res.status(404).json({ error: "Consignment request not found or does not belong to this vendor" });
      return;
    }

    if (existingRequest.status !== "pending") {
      res.status(400).json({ error: "Only pending requests can be cancelled" });
      return;
    }

    await db
      .delete(consignmentRequests)
      .where(
        and(
          eq(consignmentRequests.id, requestId),
          eq(consignmentRequests.vendorId, vendorId)
        )
      );

    res.status(204).send();
  } catch (error: any) {
    console.error("Error cancelling consignment request:", error);
    res.status(500).json({ error: "Failed to cancel consignment request" });
  }
});

export default router;
