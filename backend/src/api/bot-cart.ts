import { Router } from "express";
import { DatabaseStorage } from "../storage";

const router = Router();
const storage = new DatabaseStorage();

/**
 * POST /api/bot/cart/recover/:customerId
 * Detect abandoned cart from customer_events
 * Logic: cart_add events > 24h ago WITHOUT checkout
 */
router.post("/recover/:customerId", async (req, res) => {
  try {
    const { customerId } = req.params;
    const hoursAgo = parseInt(req.body.hoursAgo as string) || 24;

    const customer = await storage.getCustomer(customerId);
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    // Get all cart_add events older than X hours
    const since = new Date();
    since.setHours(since.getHours() - hoursAgo);

    const events = await storage.getCustomerEvents(customerId);
    const cartAddEvents = events.filter(e => 
      e.eventType === 'add_to_cart' && 
      new Date(e.createdAt) < since
    );

    if (cartAddEvents.length === 0) {
      return res.json({
        success: true,
        customerId,
        abandonedItems: [],
        message: "Không có giỏ hàng bị bỏ quên"
      });
    }

    // Build map of productId -> latest cart_add event for that product
    const productCartEvents = new Map<string, { eventTime: Date, quantity: number }>();

    for (const event of cartAddEvents) {
      const data = event.eventData as any;
      if (data?.productId) {
        const eventTime = new Date(event.createdAt);
        const existing = productCartEvents.get(data.productId);
        
        // Keep the latest cart_add event for each product
        if (!existing || eventTime > existing.eventTime) {
          productCartEvents.set(data.productId, {
            eventTime,
            quantity: data.quantity || 1
          });
        } else if (eventTime.getTime() === existing.eventTime.getTime()) {
          // Same timestamp, accumulate quantity
          existing.quantity += (data.quantity || 1);
        }
      }
    }

    // Get all customer orders
    const orders = await storage.getOrdersByCustomerId(customerId);

    // For each product in cart, check if it was purchased AFTER the cart_add event
    const abandonedProductIds: string[] = [];
    const productQuantities = new Map<string, number>();

    for (const [productId, cartInfo] of Array.from(productCartEvents.entries())) {
      let wasPurchasedAfterCart = false;

      for (const order of orders) {
        if (!order.createdAt) continue;
        const orderTime = new Date(order.createdAt);
        
        // Only consider orders placed AFTER the cart_add event
        if (orderTime > cartInfo.eventTime) {
          const items = (typeof order.items === 'object' && Array.isArray(order.items)) 
            ? order.items as any[] 
            : [];
          
          const hasProduct = items.some(item => item.productId === productId);
          if (hasProduct) {
            wasPurchasedAfterCart = true;
            break;
          }
        }
      }

      if (!wasPurchasedAfterCart) {
        abandonedProductIds.push(productId);
        productQuantities.set(productId, cartInfo.quantity);
      }
    }

    if (abandonedProductIds.length === 0) {
      return res.json({
        success: true,
        customerId,
        abandonedItems: [],
        message: "Khách hàng đã mua hết sản phẩm trong giỏ!"
      });
    }

    // Get product details
    const allProducts = await storage.getProducts();
    const abandonedItems = abandonedProductIds
      .map(productId => {
        const product = allProducts.find(p => p.id === productId);
        return product ? {
          productId: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          slug: product.slug,
          quantity: productQuantities.get(productId) || 1,
          description: product.shortDescription || product.description
        } : null;
      })
      .filter((p): p is NonNullable<typeof p> => p !== null);

    // Calculate cart value
    const cartValue = abandonedItems.reduce((sum, item) => 
      sum + (Number(item.price) * item.quantity), 0
    );

    res.json({
      success: true,
      customerId,
      abandonedItems,
      cartValue,
      itemCount: abandonedItems.length,
      hoursAgo,
      message: `Phát hiện ${abandonedItems.length} sản phẩm trong giỏ hàng bỏ quên!`
    });

  } catch (error) {
    console.error("Error in bot/cart/recover:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
