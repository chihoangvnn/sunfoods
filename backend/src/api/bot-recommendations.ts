import { Router } from "express";
import { DatabaseStorage } from "../storage";

const router = Router();
const storage = new DatabaseStorage();

/**
 * GET /api/bot/recommendations/trending
 * Top trending products - most purchased trong 30 ngày
 */
router.get("/trending", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const days = parseInt(req.query.days as string) || 30;

    const trendingProducts = await getTrendingProducts(limit, days);

    res.json({
      success: true,
      trending: trendingProducts,
      period: `${days} ngày qua`,
      message: `Top ${trendingProducts.length} sản phẩm bán chạy nhất!`
    });
  } catch (error) {
    console.error("Error in bot/recommendations/trending:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/bot/recommendations/seasonal
 * Seasonal product recommendations cho Vietnamese festivals
 * Tết, Rằm, Vu Lan, Trung Thu, etc.
 */
router.get("/seasonal", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 5;
    
    // Get current Gregorian date
    const now = new Date();
    const month = now.getMonth() + 1; // 1-12
    const day = now.getDate();

    // Determine current festival/season based on Gregorian calendar
    const festival = detectVietnameseFestival(month, day);
    
    if (!festival) {
      // No specific festival, return trending products
      const trendingProducts = await getTrendingProducts(limit);
      return res.json({
        success: true,
        seasonal: trendingProducts,
        festival: null,
        message: "Không phải mùa lễ hội, đây là sản phẩm bán chạy!"
      });
    }

    // Get products tagged for this festival
    const allProducts = await storage.getProducts();
    const seasonalProducts = allProducts
      .filter(p => {
        const tags = (p.tags as string[] || []);
        return festival.tags.some(tag => tags.includes(tag));
      })
      .slice(0, limit)
      .map(p => ({
        productId: p.id,
        name: p.name,
        price: p.price,
        image: p.image,
        slug: p.slug,
        description: p.shortDescription || p.description,
        festivalTag: festival.name
      }));

    res.json({
      success: true,
      seasonal: seasonalProducts,
      festival: festival.name,
      currentDate: `${day}/${month}`,
      message: `Gợi ý sản phẩm cho ${festival.name}!`,
      festivalInfo: festival.description
    });

  } catch (error) {
    console.error("Error in bot/recommendations/seasonal:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/bot/recommendations/:customerId
 * Collaborative filtering: "Khách mua X cũng mua Y"
 * Logic: Users who bought same products also bought...
 */
router.get("/:customerId", async (req, res) => {
  try {
    const { customerId } = req.params;
    const limit = parseInt(req.query.limit as string) || 5;

    const customer = await storage.getCustomer(customerId);
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    // Step 1: Lấy tất cả products customer đã mua
    const customerOrders = await storage.getOrdersByCustomerId(customerId);
    const deliveredOrders = customerOrders.filter(o => o.status === 'delivered');
    
    if (deliveredOrders.length === 0) {
      // Nếu chưa có order nào, recommend trending products
      const trendingProducts = await getTrendingProducts(limit);
      return res.json({
        success: true,
        customerId,
        recommendations: trendingProducts,
        reason: "trending",
        message: "Chưa có lịch sử mua hàng, đây là sản phẩm bán chạy nhất!"
      });
    }

    // Extract product IDs từ order items
    const purchasedProductIds = new Set<string>();
    for (const order of deliveredOrders) {
      const items = (typeof order.items === 'object' && Array.isArray(order.items)) 
        ? order.items as any[] 
        : [];
      items.forEach(item => {
        if (item.productId) {
          purchasedProductIds.add(item.productId);
        }
      });
    }

    if (purchasedProductIds.size === 0) {
      const trendingProducts = await getTrendingProducts(limit);
      return res.json({
        success: true,
        customerId,
        recommendations: trendingProducts,
        reason: "trending",
        message: "Sản phẩm bán chạy nhất dành cho bạn!"
      });
    }

    // Step 2: Tìm customers khác cũng mua những products này
    const allOrders = await storage.getOrders();
    const similarCustomers = new Set<string>();
    
    for (const order of allOrders) {
      if (order.customerId === customerId || order.status !== 'delivered') continue;
      
      const items = (typeof order.items === 'object' && Array.isArray(order.items)) 
        ? order.items as any[] 
        : [];
      const hasCommonProduct = items.some(item => 
        item.productId && purchasedProductIds.has(item.productId)
      );
      
      if (hasCommonProduct && order.customerId) {
        similarCustomers.add(order.customerId);
      }
    }

    // Step 3: Tìm products mà similar customers đã mua (nhưng customer này chưa mua)
    const recommendedProductMap = new Map<string, number>(); // productId -> count
    
    for (const order of allOrders) {
      if (!order.customerId || !similarCustomers.has(order.customerId) || order.status !== 'delivered') continue;
      
      const items = (typeof order.items === 'object' && Array.isArray(order.items)) 
        ? order.items as any[] 
        : [];
      for (const item of items) {
        if (item.productId && !purchasedProductIds.has(item.productId)) {
          const count = recommendedProductMap.get(item.productId) || 0;
          recommendedProductMap.set(item.productId, count + 1);
        }
      }
    }

    // Step 4: Sort by frequency và lấy top N
    const sortedRecommendations = Array.from(recommendedProductMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit);

    if (sortedRecommendations.length === 0) {
      const trendingProducts = await getTrendingProducts(limit);
      return res.json({
        success: true,
        customerId,
        recommendations: trendingProducts,
        reason: "trending",
        message: "Sản phẩm bán chạy dành cho bạn!"
      });
    }

    // Step 5: Lấy product details
    const allProducts = await storage.getProducts();
    const recommendations = sortedRecommendations
      .map(([productId, frequency]) => {
        const product = allProducts.find(p => p.id === productId);
        return product ? {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          slug: product.slug,
          frequency, // Số lần được mua bởi similar customers
          description: product.shortDescription || product.description
        } : null;
      })
      .filter(p => p !== null);

    res.json({
      success: true,
      customerId,
      recommendations,
      reason: "collaborative_filtering",
      message: `Khách hàng mua sản phẩm tương tự cũng thích ${recommendations.length} sản phẩm này!`,
      similarCustomersCount: similarCustomers.size
    });

  } catch (error) {
    console.error("Error in bot/recommendations:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * Helper: Get trending products
 */
async function getTrendingProducts(limit: number = 10, days: number = 30) {
  const orders = await storage.getOrders();
  const since = new Date();
  since.setDate(since.getDate() - days);

  const productFrequency = new Map<string, number>();
  
  for (const order of orders) {
    if (order.status !== 'delivered') continue;
    if (!order.createdAt || new Date(order.createdAt) < since) continue;
    
    const items = (typeof order.items === 'object' && Array.isArray(order.items)) 
      ? order.items as any[] 
      : [];
    for (const item of items) {
      if (item.productId) {
        const count = productFrequency.get(item.productId) || 0;
        productFrequency.set(item.productId, count + item.quantity);
      }
    }
  }

  const sortedProducts = Array.from(productFrequency.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);

  const allProducts = await storage.getProducts();
  
  return sortedProducts
    .map(([productId, soldCount]) => {
      const product = allProducts.find(p => p.id === productId);
      return product ? {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        slug: product.slug,
        soldCount,
        description: product.shortDescription || product.description
      } : null;
    })
    .filter(p => p !== null);
}

/**
 * Helper: Detect Vietnamese festival based on Gregorian calendar
 * Uses approximate date ranges for Vietnamese festivals
 */
function detectVietnameseFestival(month: number, day: number): {
  name: string;
  description: string;
  tags: string[];
} | null {
  // Tết Nguyên Đán (Jan 20 - Feb 20, approximate lunar new year period)
  if ((month === 1 && day >= 20) || (month === 2 && day <= 20)) {
    return {
      name: "Tết Nguyên Đán",
      description: "Tết Âm lịch - lễ hội quan trọng nhất năm",
      tags: ["tet", "tết", "lunar-new-year", "hương-tết", "spring"]
    };
  }

  // Giỗ Tổ Hùng Vương (April 10, National Holiday)
  if (month === 4 && day >= 1 && day <= 15) {
    return {
      name: "Giỗ Tổ Hùng Vương",
      description: "Lễ giỗ Tổ - tưởng nhớ vua Hùng",
      tags: ["hung-vuong", "giỗ-tổ", "hương-cúng", "national-day"]
    };
  }

  // Tết Đoan Ngọ (June 1-10, approximate)
  if (month === 6 && day >= 1 && day <= 10) {
    return {
      name: "Tết Đoan Ngọ",
      description: "Tết giết sâu bọ - diệt trừ côn trùng",
      tags: ["doan-ngo", "tết-đoan-ngọ", "summer"]
    };
  }

  // Vu Lan (August 15-25, approximate)
  if (month === 8 && day >= 15 && day <= 25) {
    return {
      name: "Vu Lan",
      description: "Lễ Vu Lan báo hiếu - tưởng nhớ cha mẹ",
      tags: ["vu-lan", "vu-lan-bon", "hương-hoa-hồng", "báo-hiếu"]
    };
  }

  // Trung Thu (Sep 10-20, approximate mid-autumn)
  if (month === 9 && day >= 10 && day <= 20) {
    return {
      name: "Trung Thu",
      description: "Tết Trung Thu - lễ hội trẻ em",
      tags: ["trung-thu", "mid-autumn", "moon-cake", "đèn-lồng"]
    };
  }

  // Tết Dương Lịch (Dec 20 - Jan 5, Christmas & New Year season)
  if ((month === 12 && day >= 20) || (month === 1 && day <= 5)) {
    return {
      name: "Tết Dương Lịch",
      description: "Giáng Sinh & Năm Mới - mùa lễ hội cuối năm",
      tags: ["christmas", "new-year", "winter", "holiday-season"]
    };
  }

  return null;
}

export default router;
