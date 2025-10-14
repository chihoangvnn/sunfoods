import express, { Request, Response } from "express";
import { db } from "../db";
import { wishlists, products } from "../../shared/schema";
import { eq, and } from "drizzle-orm";

const router = express.Router();

// GET /api/wishlist - Get customer's wishlist with product details
router.get("/", async (req: Request, res: Response) => {
  try {
    const customerId = req.session?.customerId;

    if (!customerId) {
      return res.status(401).json({ error: "Unauthorized - please log in" });
    }

    // Fetch wishlist items with product details
    const wishlistItems = await db
      .select({
        id: wishlists.id,
        productId: wishlists.productId,
        addedAt: wishlists.addedAt,
        productName: products.name,
        productPrice: products.price,
        productImage: products.image,
        productSlug: products.slug,
        productStock: products.stock,
        productStatus: products.status,
      })
      .from(wishlists)
      .leftJoin(products, eq(wishlists.productId, products.id))
      .where(eq(wishlists.customerId, customerId));

    res.json({ 
      success: true, 
      wishlist: wishlistItems,
      count: wishlistItems.length
    });
  } catch (error: any) {
    console.error("Error fetching wishlist:", error);
    res.status(500).json({ error: "Failed to fetch wishlist" });
  }
});

// POST /api/wishlist - Add product to wishlist
router.post("/", async (req: Request, res: Response) => {
  try {
    const customerId = req.session?.customerId;
    const { productId } = req.body;

    if (!customerId) {
      return res.status(401).json({ error: "Unauthorized - please log in" });
    }

    if (!productId) {
      return res.status(400).json({ error: "Product ID is required" });
    }

    // Check if already in wishlist
    const existing = await db
      .select()
      .from(wishlists)
      .where(and(
        eq(wishlists.customerId, customerId),
        eq(wishlists.productId, productId)
      ))
      .limit(1);

    if (existing.length > 0) {
      return res.status(409).json({ 
        error: "Product already in wishlist",
        wishlistItem: existing[0]
      });
    }

    // Add to wishlist
    const [newWishlistItem] = await db
      .insert(wishlists)
      .values({
        customerId,
        productId,
      })
      .returning();

    res.status(201).json({ 
      success: true, 
      message: "Product added to wishlist",
      wishlistItem: newWishlistItem 
    });
  } catch (error: any) {
    console.error("Error adding to wishlist:", error);
    res.status(500).json({ error: "Failed to add product to wishlist" });
  }
});

// DELETE /api/wishlist/:productId - Remove product from wishlist
router.delete("/:productId", async (req: Request, res: Response) => {
  try {
    const customerId = req.session?.customerId;
    const { productId } = req.params;

    if (!customerId) {
      return res.status(401).json({ error: "Unauthorized - please log in" });
    }

    if (!productId) {
      return res.status(400).json({ error: "Product ID is required" });
    }

    // Delete from wishlist
    const deleted = await db
      .delete(wishlists)
      .where(and(
        eq(wishlists.customerId, customerId),
        eq(wishlists.productId, productId)
      ))
      .returning();

    if (deleted.length === 0) {
      return res.status(404).json({ error: "Wishlist item not found" });
    }

    res.json({ 
      success: true, 
      message: "Product removed from wishlist",
      deletedItem: deleted[0]
    });
  } catch (error: any) {
    console.error("Error removing from wishlist:", error);
    res.status(500).json({ error: "Failed to remove product from wishlist" });
  }
});

export default router;
