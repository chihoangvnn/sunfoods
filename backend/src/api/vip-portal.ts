// @ts-nocheck
import { Request, Response, Router, NextFunction } from 'express';
import { storage } from '../storage';
import { z } from 'zod';

const router = Router();

const querySchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
  search: z.string().max(255).optional(),
  status: z.string().optional()
});

interface VIPRequest extends Request {
  vip?: {
    id: string;
    name: string;
    email: string | null;
    phone: string;
    membershipTier: string;
    totalSpent: number;
  };
}

/**
 * 🔐 VIP Access Middleware
 * Checks if customer has VIP membership tier (silver, gold, diamond)
 */
const checkVIPAccess = async (req: VIPRequest, res: Response, next: NextFunction) => {
  try {
    const customerId = (req.session as any)?.userId;
    
    if (!customerId) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'Vui lòng đăng nhập để truy cập VIP Portal'
      });
    }

    const customer = await storage.getCustomer(customerId);
    
    if (!customer) {
      return res.status(404).json({
        error: 'Customer not found',
        message: 'Không tìm thấy thông tin khách hàng'
      });
    }

    // Check if customer has VIP membership tier (not default "member")
    const vipTiers = ['silver', 'gold', 'diamond'];
    const hasVIPTier = vipTiers.includes(customer.membershipTier);

    if (!hasVIPTier) {
      return res.status(403).json({
        error: 'VIP access required',
        message: 'Bạn cần có hạng VIP (Silver/Gold/Diamond) để truy cập nội dung này.',
        currentTier: customer.membershipTier,
        upgradeUrl: '/upgrade-vip'
      });
    }

    req.vip = {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      membershipTier: customer.membershipTier,
      totalSpent: parseFloat(customer.totalSpent?.toString() || '0')
    };

    next();
  } catch (error) {
    console.error('❌ VIP Access Check Error:', error);
    return res.status(500).json({
      error: 'Server error',
      message: 'Lỗi kiểm tra quyền truy cập VIP'
    });
  }
};

router.use(checkVIPAccess);

// Vietnamese currency formatter
function formatVietnameseCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
}

/**
 * 📊 GET /api/vip-portal/dashboard
 * VIP Dashboard with tier info, benefits, and savings
 */
router.get('/dashboard', async (req: VIPRequest, res: Response) => {
  try {
    const vip = req.vip!;
    
    // Get VIP customer details
    const customer = await storage.getCustomer(vip.id);
    if (!customer) {
      return res.status(404).json({ error: 'VIP customer not found' });
    }

    // Get order statistics
    const orders = await storage.getOrdersByCustomerId(vip.id);
    const completedOrders = orders.filter(o => o.status === 'delivered' || o.status === 'completed');
    
    // Calculate tier benefits
    const tierBenefits = {
      silver: {
        name: 'Bạc',
        discount: 5,
        color: '#C0C0C0',
        minSpend: 5000000, // 5M VND
        nextTier: 'gold',
        nextTierSpend: 15000000
      },
      gold: {
        name: 'Vàng',
        discount: 10,
        color: '#FFD700',
        minSpend: 15000000, // 15M VND
        nextTier: 'diamond',
        nextTierSpend: 50000000
      },
      diamond: {
        name: 'Kim Cương',
        discount: 15,
        color: '#B9F2FF',
        minSpend: 50000000, // 50M VND
        nextTier: null,
        nextTierSpend: null
      }
    };

    const currentTierInfo = tierBenefits[vip.membershipTier as keyof typeof tierBenefits] || tierBenefits.silver;
    
    // Calculate total savings from VIP discounts
    const totalSavings = completedOrders.reduce((sum, order) => {
      const orderTotal = parseFloat(order.total?.toString() || '0');
      const discount = (orderTotal * currentTierInfo.discount) / 100;
      return sum + discount;
    }, 0);

    // Calculate progress to next tier
    let progressToNextTier = 0;
    let remainingToNextTier = 0;
    if (currentTierInfo.nextTier && currentTierInfo.nextTierSpend) {
      progressToNextTier = Math.min((vip.totalSpent / currentTierInfo.nextTierSpend) * 100, 100);
      remainingToNextTier = Math.max(currentTierInfo.nextTierSpend - vip.totalSpent, 0);
    }

    // Recent VIP orders
    const recentOrders = orders
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map(order => ({
        id: order.id,
        orderNumber: order.orderNumber,
        total: parseFloat(order.total?.toString() || '0'),
        totalFormatted: formatVietnameseCurrency(parseFloat(order.total?.toString() || '0')),
        status: order.status,
        createdAt: order.createdAt,
        vipDiscount: (parseFloat(order.total?.toString() || '0') * currentTierInfo.discount) / 100,
        vipDiscountFormatted: formatVietnameseCurrency((parseFloat(order.total?.toString() || '0') * currentTierInfo.discount) / 100)
      }));

    const stats = {
      profile: {
        id: vip.id,
        name: vip.name,
        email: vip.email,
        phone: vip.phone,
        membershipTier: vip.membershipTier,
        totalSpent: vip.totalSpent,
        totalSpentFormatted: formatVietnameseCurrency(vip.totalSpent),
        joinDate: customer.joinDate
      },
      tierInfo: {
        current: {
          tier: vip.membershipTier,
          name: currentTierInfo.name,
          discount: currentTierInfo.discount,
          color: currentTierInfo.color,
          minSpend: currentTierInfo.minSpend,
          minSpendFormatted: formatVietnameseCurrency(currentTierInfo.minSpend)
        },
        nextTier: currentTierInfo.nextTier ? {
          tier: currentTierInfo.nextTier,
          name: tierBenefits[currentTierInfo.nextTier as keyof typeof tierBenefits].name,
          discount: tierBenefits[currentTierInfo.nextTier as keyof typeof tierBenefits].discount,
          minSpend: currentTierInfo.nextTierSpend!,
          minSpendFormatted: formatVietnameseCurrency(currentTierInfo.nextTierSpend!)
        } : null,
        progress: {
          percentage: progressToNextTier,
          remaining: remainingToNextTier,
          remainingFormatted: formatVietnameseCurrency(remainingToNextTier)
        }
      },
      statistics: {
        totalOrders: orders.length,
        completedOrders: completedOrders.length,
        totalSavings: totalSavings,
        totalSavingsFormatted: formatVietnameseCurrency(totalSavings),
        averageOrderValue: completedOrders.length > 0 ? vip.totalSpent / completedOrders.length : 0,
        averageOrderValueFormatted: completedOrders.length > 0 
          ? formatVietnameseCurrency(vip.totalSpent / completedOrders.length)
          : formatVietnameseCurrency(0)
      },
      recentOrders: recentOrders
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('❌ Error fetching VIP dashboard:', error);
    res.status(500).json({
      error: 'Failed to fetch VIP dashboard',
      message: 'Không thể tải dashboard VIP'
    });
  }
});

/**
 * 🛍️ GET /api/vip-portal/products
 * VIP exclusive products with tier-based filtering
 */
router.get('/products', async (req: VIPRequest, res: Response) => {
  try {
    const vip = req.vip!;
    const query = querySchema.parse(req.query);
    
    // Get all VIP-only products
    const allProducts = await storage.getVipProducts(10000);
    
    // Filter products based on customer's VIP tier
    const tierHierarchy = {
      silver: ['silver'],
      gold: ['silver', 'gold'],
      diamond: ['silver', 'gold', 'diamond']
    };
    
    const accessibleTiers = tierHierarchy[vip.membershipTier as keyof typeof tierHierarchy] || ['silver'];
    
    let products = allProducts.filter((p: any) => {
      // If product has no required tier, all VIPs can access
      if (!p.requiredVipTier) return true;
      // Otherwise check if customer's tier is high enough
      return accessibleTiers.includes(p.requiredVipTier);
    });
    
    // Apply search filter
    if (query.search) {
      const searchLower = query.search.toLowerCase();
      products = products.filter((p: any) => 
        p.name?.toLowerCase().includes(searchLower) ||
        p.description?.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply pagination
    const total = products.length;
    products = products.slice(query.offset, query.offset + query.limit);
    
    // Format products with VIP discount
    const tierDiscounts = { silver: 5, gold: 10, diamond: 15 };
    const vipDiscount = tierDiscounts[vip.membershipTier as keyof typeof tierDiscounts] || 5;
    
    const formattedProducts = products.map((product: any) => {
      const regularPrice = parseFloat(product.price?.toString() || '0');
      const vipPrice = regularPrice * (1 - vipDiscount / 100);
      const savings = regularPrice - vipPrice;
      
      return {
        id: product.id,
        name: product.name,
        description: product.description,
        imageUrl: product.imageUrl,
        regularPrice: regularPrice,
        regularPriceFormatted: formatVietnameseCurrency(regularPrice),
        vipPrice: vipPrice,
        vipPriceFormatted: formatVietnameseCurrency(vipPrice),
        savings: savings,
        savingsFormatted: formatVietnameseCurrency(savings),
        discountPercentage: vipDiscount,
        requiredVipTier: product.requiredVipTier,
        isAccessible: accessibleTiers.includes(product.requiredVipTier || 'silver'),
        stock: product.stock,
        status: product.status,
        categoryId: product.categoryId
      };
    });
    
    res.json({
      success: true,
      data: {
        products: formattedProducts,
        pagination: {
          total: total,
          limit: query.limit,
          offset: query.offset,
          hasMore: query.offset + query.limit < total
        },
        tierInfo: {
          current: vip.membershipTier,
          discount: vipDiscount,
          accessibleTiers: accessibleTiers
        }
      }
    });

  } catch (error) {
    console.error('❌ Error fetching VIP products:', error);
    res.status(500).json({
      error: 'Failed to fetch VIP products',
      message: 'Không thể tải sản phẩm VIP'
    });
  }
});

/**
 * 📦 GET /api/vip-portal/orders
 * VIP order history with discounts applied
 */
router.get('/orders', async (req: VIPRequest, res: Response) => {
  try {
    const vip = req.vip!;
    const query = querySchema.parse(req.query);
    
    // Get all orders for this VIP customer
    let orders = await storage.getOrdersByCustomerId(vip.id);
    
    // Apply status filter
    if (query.status) {
      orders = orders.filter(o => o.status === query.status);
    }
    
    // Calculate VIP discount for each order
    const tierDiscounts = { silver: 5, gold: 10, diamond: 15 };
    const vipDiscount = tierDiscounts[vip.membershipTier as keyof typeof tierDiscounts] || 5;
    
    // Format orders
    const formattedOrders = orders.map((order: any) => {
      const total = parseFloat(order.total?.toString() || '0');
      const discountAmount = (total * vipDiscount) / 100;
      
      return {
        id: order.id,
        orderNumber: order.orderNumber,
        total: total,
        totalFormatted: formatVietnameseCurrency(total),
        vipDiscount: vipDiscount,
        discountAmount: discountAmount,
        discountAmountFormatted: formatVietnameseCurrency(discountAmount),
        finalAmount: total - discountAmount,
        finalAmountFormatted: formatVietnameseCurrency(total - discountAmount),
        status: order.status,
        deliveryAddress: order.deliveryAddress,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        items: order.items || []
      };
    });
    
    // Sort by creation date (newest first)
    formattedOrders.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    // Apply pagination
    const total = formattedOrders.length;
    const paginatedOrders = formattedOrders.slice(query.offset, query.offset + query.limit);
    
    // Calculate summary
    const totalSpent = formattedOrders.reduce((sum, order) => sum + order.finalAmount, 0);
    const totalSaved = formattedOrders.reduce((sum, order) => sum + order.discountAmount, 0);
    
    res.json({
      success: true,
      data: {
        orders: paginatedOrders,
        summary: {
          totalOrders: total,
          totalSpent: totalSpent,
          totalSpentFormatted: formatVietnameseCurrency(totalSpent),
          totalSaved: totalSaved,
          totalSavedFormatted: formatVietnameseCurrency(totalSaved),
          averageOrderValue: total > 0 ? totalSpent / total : 0,
          averageOrderValueFormatted: total > 0 
            ? formatVietnameseCurrency(totalSpent / total)
            : formatVietnameseCurrency(0)
        },
        pagination: {
          total: total,
          limit: query.limit,
          offset: query.offset,
          hasMore: query.offset + query.limit < total
        }
      }
    });

  } catch (error) {
    console.error('❌ Error fetching VIP orders:', error);
    res.status(500).json({
      error: 'Failed to fetch VIP orders',
      message: 'Không thể tải lịch sử đơn hàng'
    });
  }
});

/**
 * 🎁 GET /api/vip-portal/benefits
 * VIP tier benefits and privileges
 */
router.get('/benefits', async (req: VIPRequest, res: Response) => {
  try {
    const vip = req.vip!;
    
    // Define all tier benefits
    const tierBenefits = {
      silver: {
        tier: 'silver',
        name: 'Hạng Bạc',
        color: '#C0C0C0',
        icon: '🥈',
        discount: 5,
        minSpend: 5000000,
        benefits: [
          { id: 1, title: 'Giảm giá 5%', description: 'Tất cả sản phẩm VIP', icon: '💰', active: true },
          { id: 2, title: 'Miễn phí vận chuyển', description: 'Đơn hàng trên 500.000đ', icon: '🚚', active: true },
          { id: 3, title: 'Ưu tiên hỗ trợ', description: 'Phản hồi trong 24h', icon: '💬', active: true },
          { id: 4, title: 'Truy cập sản phẩm độc quyền', description: 'Sản phẩm hạng Bạc', icon: '⭐', active: true }
        ]
      },
      gold: {
        tier: 'gold',
        name: 'Hạng Vàng',
        color: '#FFD700',
        icon: '🥇',
        discount: 10,
        minSpend: 15000000,
        benefits: [
          { id: 1, title: 'Giảm giá 10%', description: 'Tất cả sản phẩm VIP', icon: '💰', active: true },
          { id: 2, title: 'Miễn phí vận chuyển', description: 'Tất cả đơn hàng', icon: '🚚', active: true },
          { id: 3, title: 'Ưu tiên hỗ trợ VIP', description: 'Phản hồi trong 12h', icon: '💬', active: true },
          { id: 4, title: 'Truy cập sản phẩm độc quyền', description: 'Sản phẩm hạng Vàng', icon: '⭐', active: true },
          { id: 5, title: 'Quà tặng sinh nhật', description: 'Voucher đặc biệt', icon: '🎁', active: true },
          { id: 6, title: 'Ưu tiên đặt hàng trước', description: 'Sản phẩm mới', icon: '🔔', active: true }
        ]
      },
      diamond: {
        tier: 'diamond',
        name: 'Hạng Kim Cương',
        color: '#B9F2FF',
        icon: '💎',
        discount: 15,
        minSpend: 50000000,
        benefits: [
          { id: 1, title: 'Giảm giá 15%', description: 'Tất cả sản phẩm VIP', icon: '💰', active: true },
          { id: 2, title: 'Miễn phí vận chuyển', description: 'Toàn quốc + Giao hàng nhanh', icon: '🚚', active: true },
          { id: 3, title: 'Hỗ trợ VIP 24/7', description: 'Hotline riêng', icon: '💬', active: true },
          { id: 4, title: 'Truy cập sản phẩm độc quyền', description: 'Tất cả sản phẩm VIP', icon: '⭐', active: true },
          { id: 5, title: 'Quà tặng sinh nhật cao cấp', description: 'Voucher + Quà tặng', icon: '🎁', active: true },
          { id: 6, title: 'Ưu tiên đặt hàng trước', description: 'Sản phẩm mới + Limited Edition', icon: '🔔', active: true },
          { id: 7, title: 'Tư vấn cá nhân hóa', description: 'Chuyên gia riêng', icon: '👨‍💼', active: true },
          { id: 8, title: 'Chương trình tri ân đặc biệt', description: 'Sự kiện VIP', icon: '🎉', active: true }
        ]
      }
    };
    
    const currentTier = tierBenefits[vip.membershipTier as keyof typeof tierBenefits] || tierBenefits.silver;
    
    // All tiers info for comparison
    const allTiers = [
      { ...tierBenefits.silver, minSpendFormatted: formatVietnameseCurrency(tierBenefits.silver.minSpend), isCurrent: vip.membershipTier === 'silver' },
      { ...tierBenefits.gold, minSpendFormatted: formatVietnameseCurrency(tierBenefits.gold.minSpend), isCurrent: vip.membershipTier === 'gold' },
      { ...tierBenefits.diamond, minSpendFormatted: formatVietnameseCurrency(tierBenefits.diamond.minSpend), isCurrent: vip.membershipTier === 'diamond' }
    ];
    
    res.json({
      success: true,
      data: {
        currentTier: {
          ...currentTier,
          minSpendFormatted: formatVietnameseCurrency(currentTier.minSpend)
        },
        allTiers: allTiers,
        upgradeInfo: {
          canUpgrade: vip.membershipTier !== 'diamond',
          nextTier: vip.membershipTier === 'silver' ? 'gold' : vip.membershipTier === 'gold' ? 'diamond' : null,
          upgradeUrl: '/upgrade-vip'
        }
      }
    });

  } catch (error) {
    console.error('❌ Error fetching VIP benefits:', error);
    res.status(500).json({
      error: 'Failed to fetch VIP benefits',
      message: 'Không thể tải thông tin ưu đãi VIP'
    });
  }
});

export default router;
