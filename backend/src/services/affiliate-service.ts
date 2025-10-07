import { storage } from '../storage';
import { eq, and, gte, sql } from 'drizzle-orm';

export interface AffiliateTier {
  name: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  minOrders: number;
  maxOrders: number | null;
  commissionRate: number;
}

export interface TierInfo {
  currentTier: string;
  orderCount: number;
  nextTier: string | null;
  ordersToNextTier: number | null;
  commissionRate: number;
}

export interface RateLimitResult {
  allowed: boolean;
  reason?: string;
  nextAllowedTime?: Date;
}

export class AffiliateService {
  
  /**
   * Commission Tier Structure (Auto-upgrade based on total orders)
   * - Bronze: 0-49 orders, 5% commission
   * - Silver: 50-199 orders, 7% commission
   * - Gold: 200-499 orders, 10% commission
   * - Platinum: 500+ orders, 12% commission
   */
  static readonly COMMISSION_TIERS: AffiliateTier[] = [
    { name: 'Bronze', minOrders: 0, maxOrders: 49, commissionRate: 5 },
    { name: 'Silver', minOrders: 50, maxOrders: 199, commissionRate: 7 },
    { name: 'Gold', minOrders: 200, maxOrders: 499, commissionRate: 10 },
    { name: 'Platinum', minOrders: 500, maxOrders: null, commissionRate: 12 }
  ];

  /**
   * Calculate affiliate tier based on total orders
   */
  static calculateTier(totalOrders: number): TierInfo {
    let currentTier: AffiliateTier = this.COMMISSION_TIERS[0];
    let nextTier: AffiliateTier | null = null;
    
    for (let i = 0; i < this.COMMISSION_TIERS.length; i++) {
      const tier = this.COMMISSION_TIERS[i];
      
      if (tier.maxOrders === null) {
        if (totalOrders >= tier.minOrders) {
          currentTier = tier;
          nextTier = null;
        }
      } else {
        if (totalOrders >= tier.minOrders && totalOrders <= tier.maxOrders) {
          currentTier = tier;
          nextTier = this.COMMISSION_TIERS[i + 1] || null;
          break;
        }
      }
    }
    
    const ordersToNextTier = nextTier 
      ? nextTier.minOrders - totalOrders
      : null;
    
    return {
      currentTier: currentTier.name,
      orderCount: totalOrders,
      nextTier: nextTier?.name || null,
      ordersToNextTier: ordersToNextTier,
      commissionRate: currentTier.commissionRate
    };
  }

  /**
   * Get commission rate for affiliate based on their order count
   */
  static getCommissionRate(totalOrders: number): number {
    const tierInfo = this.calculateTier(totalOrders);
    return tierInfo.commissionRate;
  }

  /**
   * Calculate commission amount
   */
  static calculateCommission(orderTotal: number, totalOrders: number): {
    amount: number;
    rate: number;
  } {
    const rate = this.getCommissionRate(totalOrders);
    const amount = (orderTotal * rate) / 100;
    
    return { amount, rate };
  }

  /**
   * Rate Limiting for Share Logs
   * - Max 4 shares per day per affiliate
   * - Minimum 2 hour gap between shares
   */
  static async checkShareRateLimit(affiliateId: string): Promise<RateLimitResult> {
    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const twoHoursAgo = new Date(now.getTime() - (2 * 60 * 60 * 1000));

      // Get today's share logs
      const todayLogs = await storage.getAffiliateShareLogsByDate(affiliateId, today, now);
      
      // Check daily limit (max 4 shares per day)
      if (todayLogs.length >= 4) {
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        return {
          allowed: false,
          reason: 'Daily share limit reached (4 shares per day)',
          nextAllowedTime: tomorrow
        };
      }

      // Check time gap (minimum 2 hours between shares)
      if (todayLogs.length > 0) {
        const lastShare = todayLogs[todayLogs.length - 1];
        const lastShareTime = new Date(lastShare.sharedAt);
        
        if (lastShareTime > twoHoursAgo) {
          const nextAllowedTime = new Date(lastShareTime.getTime() + (2 * 60 * 60 * 1000));
          
          return {
            allowed: false,
            reason: 'Minimum 2 hour gap required between shares',
            nextAllowedTime: nextAllowedTime
          };
        }
      }

      return { allowed: true };
    } catch (error) {
      console.error('Error checking share rate limit:', error);
      return {
        allowed: false,
        reason: 'Error checking rate limit'
      };
    }
  }

  /**
   * Record a share log
   */
  static async recordShare(
    affiliateId: string, 
    productId: string | null,
    channel: 'facebook' | 'instagram' | 'twitter' | 'zalo' | 'other',
    shareUrl: string,
    deviceInfo?: string,
    ipAddress?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Check rate limit first
      const rateLimitCheck = await this.checkShareRateLimit(affiliateId);
      
      if (!rateLimitCheck.allowed) {
        return {
          success: false,
          error: rateLimitCheck.reason
        };
      }

      // Create share log
      await storage.createAffiliateShareLog({
        affiliateId,
        productId,
        channel,
        shareUrl,
        deviceInfo,
        ipAddress
      });

      return { success: true };
    } catch (error) {
      console.error('Error recording share:', error);
      return {
        success: false,
        error: 'Failed to record share'
      };
    }
  }

  /**
   * Get affiliate product assignments with tier-based commission
   */
  static async getAffiliateProducts(
    affiliateId: string,
    filters?: {
      search?: string;
      categoryId?: string;
      limit?: number;
      offset?: number;
    }
  ) {
    try {
      // Get affiliate to determine tier
      const affiliate = await storage.getCustomer(affiliateId);
      if (!affiliate || !affiliate.isAffiliate) {
        return null;
      }

      const affiliateData = affiliate.affiliateData as any || {};
      const totalOrders = affiliateData.totalReferrals || 0;
      
      // Get tier info
      const tierInfo = this.calculateTier(totalOrders);

      // Get product assignments
      const assignments = await storage.getAffiliateProductAssignments(affiliateId);
      
      // Get all products
      const allProducts = await storage.getProducts();
      
      // Filter active products with stock
      let products = allProducts.filter((p: any) => 
        p.status === 'active' && parseInt(p.stock?.toString() || '0') > 0
      );

      // Apply search filter
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        products = products.filter((p: any) => 
          p.name?.toLowerCase().includes(searchLower) ||
          p.description?.toLowerCase().includes(searchLower) ||
          p.sku?.toLowerCase().includes(searchLower)
        );
      }

      // Apply category filter
      if (filters?.categoryId) {
        products = products.filter((p: any) => p.categoryId === filters.categoryId);
      }

      // Check if specific products are assigned or use all products
      let assignedProducts = products;
      const hasSpecificAssignments = assignments.some((a: any) => 
        a.assignmentType === 'product' && a.isActive
      );

      if (hasSpecificAssignments) {
        const assignedProductIds = assignments
          .filter((a: any) => a.assignmentType === 'product' && a.isActive)
          .map((a: any) => a.targetId);
        
        assignedProducts = products.filter((p: any) => 
          assignedProductIds.includes(p.id)
        );
      }

      // Pagination
      const total = assignedProducts.length;
      const limit = filters?.limit || 50;
      const offset = filters?.offset || 0;
      assignedProducts = assignedProducts.slice(offset, offset + limit);

      // Format products with commission info
      const formattedProducts = assignedProducts.map((product: any) => {
        const price = parseFloat(product.price.toString());
        const stock = parseInt(product.stock?.toString() || '0');
        
        // Check if product has custom commission assignment
        const productAssignment = assignments.find((a: any) => 
          a.assignmentType === 'product' && 
          a.targetId === product.id && 
          a.isActive
        );
        
        const commissionRate = productAssignment 
          ? parseFloat(productAssignment.commissionRate.toString())
          : tierInfo.commissionRate;
        
        const commissionType = productAssignment?.commissionType || 'percentage';
        const isPremium = productAssignment?.isPremium || false;
        const assignmentType = productAssignment ? 'specific' : 'default';

        const commission = (price * commissionRate) / 100;

        return {
          productId: product.id,
          productName: product.name,
          productSku: product.sku,
          productDescription: product.description,
          productPrice: price,
          productStock: stock,
          productImage: product.image || (product.images?.[0]?.url),
          productCategory: product.categoryId,
          commissionRate: commissionRate,
          commissionType: commissionType,
          commissionAmount: commission,
          assignmentType: assignmentType,
          isPremium: isPremium
        };
      });

      return {
        products: formattedProducts,
        tierInfo: tierInfo,
        stats: {
          totalProducts: total,
          averageCommissionRate: tierInfo.commissionRate
        },
        pagination: {
          total: total,
          limit: limit,
          offset: offset,
          hasMore: offset + limit < total
        }
      };

    } catch (error) {
      console.error('Error getting affiliate products:', error);
      return null;
    }
  }

  /**
   * Create order for affiliate (affiliate creates order on behalf of customer)
   */
  static async createAffiliateOrder(
    affiliateId: string,
    orderData: {
      phone: string;
      productId: string;
      quantity: number;
      shippingAddress: string;
      customerName: string;
      note?: string;
    }
  ) {
    try {
      // Get affiliate
      const affiliate = await storage.getCustomer(affiliateId);
      if (!affiliate || !affiliate.isAffiliate) {
        return {
          success: false,
          error: 'Affiliate not found or not active'
        };
      }

      // Get product
      const product = await storage.getProduct(orderData.productId);
      if (!product) {
        return {
          success: false,
          error: 'Product not found'
        };
      }

      // Check stock
      const availableStock = parseInt(product.stock?.toString() || '0');
      if (availableStock < orderData.quantity) {
        return {
          success: false,
          error: 'Insufficient stock'
        };
      }

      // Get affiliate data for tier calculation
      const affiliateData = affiliate.affiliateData as any || {};
      const totalOrders = affiliateData.totalReferrals || 0;

      // Calculate order total
      const productPrice = parseFloat(product.price.toString());
      const orderTotal = productPrice * orderData.quantity;

      // Calculate commission based on tier
      const commission = this.calculateCommission(orderTotal, totalOrders);

      // Get storefront config
      const storefronts = await storage.getStorefrontConfigs();
      const defaultStorefront = storefronts.find((s: any) => s.isActive) || storefronts[0];
      
      if (!defaultStorefront) {
        return {
          success: false,
          error: 'No storefront configured'
        };
      }

      // Create main order
      const order = await storage.createOrder({
        customerId: null,
        status: 'pending',
        total: orderTotal.toString(),
        customerName: orderData.customerName,
        customerPhone: orderData.phone,
        customerAddress: orderData.shippingAddress,
        notes: orderData.note || '',
        source: 'affiliate_portal'
      });

      // Create order item
      await storage.createOrderItem({
        orderId: order.id,
        productId: product.id,
        productName: product.name,
        quantity: orderData.quantity,
        price: productPrice.toString(),
        subtotal: orderTotal.toString()
      });

      // Create affiliate order tracking
      await storage.createAffiliateOrder({
        orderId: order.id,
        affiliateId: affiliateId,
        orderType: 'created',
        commissionAmount: commission.amount.toString(),
        commissionRate: commission.rate.toString(),
        commissionStatus: 'pending'
      });

      // Update product stock
      await storage.updateProduct(product.id, {
        stock: (availableStock - orderData.quantity).toString()
      });

      return {
        success: true,
        orderId: order.id,
        commission: {
          amount: commission.amount,
          rate: commission.rate
        },
        order: {
          id: order.id,
          customerName: orderData.customerName,
          productName: product.name,
          quantity: orderData.quantity,
          total: orderTotal
        }
      };

    } catch (error) {
      console.error('Error creating affiliate order:', error);
      return {
        success: false,
        error: 'Failed to create order'
      };
    }
  }
}
