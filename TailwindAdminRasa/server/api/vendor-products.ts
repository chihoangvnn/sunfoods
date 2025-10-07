import express, { Request, Response } from "express";
import { db } from "../db";
import { vendors, vendorProducts, products } from "@shared/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { requireVendorAuth } from "../middleware/vendor-auth";
import { z } from "zod";

const router = express.Router();

router.get("/", requireVendorAuth, async (req: Request, res: Response) => {
  try {
    const vendorId = req.vendor!.id;

    const productsList = await db
      .select({
        id: vendorProducts.id,
        productId: vendorProducts.productId,
        productName: products.name,
        productImage: products.image,
        consignmentPrice: vendorProducts.consignmentPrice,
        quantityConsigned: vendorProducts.quantityConsigned,
        quantitySold: vendorProducts.quantitySold,
        quantityReturned: vendorProducts.quantityReturned,
        currentStock: sql<number>`${vendorProducts.quantityConsigned} - ${vendorProducts.quantitySold} - ${vendorProducts.quantityReturned}`,
        totalEarnings: sql<string>`${vendorProducts.quantitySold} * ${vendorProducts.commissionPerUnit}`,
        status: vendorProducts.status,
        createdAt: vendorProducts.createdAt,
      })
      .from(vendorProducts)
      .innerJoin(products, eq(vendorProducts.productId, products.id))
      .where(eq(vendorProducts.vendorId, vendorId))
      .orderBy(desc(vendorProducts.createdAt));

    const formattedProducts = productsList.map(product => ({
      id: product.id,
      productId: product.productId,
      productName: product.productName,
      productImage: product.productImage,
      consignmentPrice: product.consignmentPrice,
      quantityConsigned: product.quantityConsigned,
      quantitySold: product.quantitySold,
      quantityReturned: product.quantityReturned,
      currentStock: Number(product.currentStock) || 0,
      totalEarnings: product.totalEarnings || "0.00",
      status: product.status,
      createdAt: product.createdAt,
    }));

    res.json(formattedProducts);
  } catch (error: any) {
    console.error("Error fetching vendor products:", error);
    res.status(500).json({ error: "Failed to fetch vendor products" });
  }
});

router.get("/:id", requireVendorAuth, async (req: Request, res: Response) => {
  try {
    const vendorId = req.vendor!.id;
    const productId = req.params.id;

    const [productData] = await db
      .select({
        id: vendorProducts.id,
        productId: vendorProducts.productId,
        productName: products.name,
        productImage: products.image,
        consignmentPrice: vendorProducts.consignmentPrice,
        quantityConsigned: vendorProducts.quantityConsigned,
        quantitySold: vendorProducts.quantitySold,
        quantityReturned: vendorProducts.quantityReturned,
        currentStock: sql<number>`${vendorProducts.quantityConsigned} - ${vendorProducts.quantitySold} - ${vendorProducts.quantityReturned}`,
        totalEarnings: sql<string>`${vendorProducts.quantitySold} * ${vendorProducts.commissionPerUnit}`,
        status: vendorProducts.status,
        createdAt: vendorProducts.createdAt,
        productDescription: products.description,
        productPrice: products.price,
        productStock: products.stock,
        productStatus: products.status,
      })
      .from(vendorProducts)
      .innerJoin(products, eq(vendorProducts.productId, products.id))
      .where(
        and(
          eq(vendorProducts.id, productId),
          eq(vendorProducts.vendorId, vendorId)
        )
      );

    if (!productData) {
      res.status(404).json({ error: "Product not found or does not belong to this vendor" });
      return;
    }

    const formattedProduct = {
      id: productData.id,
      productId: productData.productId,
      productName: productData.productName,
      productImage: productData.productImage,
      consignmentPrice: productData.consignmentPrice,
      quantityConsigned: productData.quantityConsigned,
      quantitySold: productData.quantitySold,
      quantityReturned: productData.quantityReturned,
      currentStock: Number(productData.currentStock) || 0,
      totalEarnings: productData.totalEarnings || "0.00",
      status: productData.status,
      createdAt: productData.createdAt,
      productDescription: productData.productDescription,
      productPrice: productData.productPrice,
      productStock: productData.productStock,
      productStatus: productData.productStatus,
    };

    res.json(formattedProduct);
  } catch (error: any) {
    console.error("Error fetching vendor product details:", error);
    res.status(500).json({ error: "Failed to fetch vendor product details" });
  }
});

const updateQuantitySchema = z.object({
  additionalQuantity: z.number().min(1).max(10000),
});

router.put("/:id/quantity", requireVendorAuth, async (req: Request, res: Response) => {
  try {
    const vendorId = req.vendor!.id;
    const productId = req.params.id;

    const validation = updateQuantitySchema.safeParse(req.body);
    
    if (!validation.success) {
      res.status(400).json({ 
        error: "Invalid request body", 
        details: validation.error.errors 
      });
      return;
    }

    const { additionalQuantity } = validation.data;

    const [existingProduct] = await db
      .select({
        id: vendorProducts.id,
        quantityConsigned: vendorProducts.quantityConsigned,
      })
      .from(vendorProducts)
      .where(
        and(
          eq(vendorProducts.id, productId),
          eq(vendorProducts.vendorId, vendorId)
        )
      );

    if (!existingProduct) {
      res.status(404).json({ error: "Product not found or does not belong to this vendor" });
      return;
    }

    const currentQty = existingProduct.quantityConsigned ?? 0;
    const newQuantity = currentQty + additionalQuantity;

    const [updatedProduct] = await db
      .update(vendorProducts)
      .set({ 
        quantityConsigned: newQuantity,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(vendorProducts.id, productId),
          eq(vendorProducts.vendorId, vendorId)
        )
      )
      .returning({
        id: vendorProducts.id,
        productId: vendorProducts.productId,
        quantityConsigned: vendorProducts.quantityConsigned,
        quantitySold: vendorProducts.quantitySold,
        quantityReturned: vendorProducts.quantityReturned,
        currentStock: sql<number>`${vendorProducts.quantityConsigned} - ${vendorProducts.quantitySold} - ${vendorProducts.quantityReturned}`,
      });

    const [productInfo] = await db
      .select({
        productName: products.name,
      })
      .from(products)
      .where(eq(products.id, updatedProduct.productId));

    res.json({
      id: updatedProduct.id,
      productId: updatedProduct.productId,
      productName: productInfo.productName,
      quantityConsigned: updatedProduct.quantityConsigned,
      quantitySold: updatedProduct.quantitySold,
      quantityReturned: updatedProduct.quantityReturned,
      currentStock: Number(updatedProduct.currentStock) || 0,
    });
  } catch (error: any) {
    console.error("Error updating vendor product quantity:", error);
    res.status(500).json({ error: "Failed to update vendor product quantity" });
  }
});

export default router;
