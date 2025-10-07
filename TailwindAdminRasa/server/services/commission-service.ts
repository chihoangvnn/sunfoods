import { storage } from '../storage';
import { eq } from 'drizzle-orm';

export interface CommissionCalculationResult {
  success: boolean;
  message: string;
  commissionAmount?: number;
  affiliateId?: string;
  alreadyProcessed?: boolean;
}

export interface CommissionHistoryEntry {
  orderId: string;
  orderTotal: number;
  commissionAmount: number;
  commissionRate: number;
  processedAt: string;
  orderStatus: 'delivered' | 'shipped';
}

export class CommissionService {
  
  /**
   * Calculate and apply commission for a storefront order when it reaches delivered/shipped status
   */
  static async calculateCommissionForOrder(orderId: string, newStatus: string): Promise<CommissionCalculationResult> {
    try {
      // Only process commissions for delivered or shipped orders
      if (newStatus !== 'delivered' && newStatus !== 'shipped') {
        return {
          success: false,
          message: 'Commission only calculated for delivered or shipped orders'
        };
      }

      // Get the storefront order
      const order = await storage.getStorefrontOrder(orderId);
      if (!order) {
        return {
          success: false,
          message: 'Order not found'
        };
      }

      // Check if order has affiliate code
      if (!order.affiliateCode) {
        return {
          success: false,
          message: 'Order has no affiliate code'
        };
      }

      // Find the affiliate customer by affiliate code
      const affiliate = await storage.getCustomerByAffiliateCode(order.affiliateCode);
      if (!affiliate) {
        return {
          success: false,
          message: `Affiliate not found for code: ${order.affiliateCode}`
        };
      }

      // Check if affiliate is active
      if (!affiliate.isAffiliate || affiliate.affiliateStatus !== 'active') {
        return {
          success: false,
          message: `Affiliate ${order.affiliateCode} is not active`
        };
      }

      // Check if commission already processed for this order (idempotency)
      const affiliateData = affiliate.affiliateData as any || {};
      const commissionHistory = affiliateData.commissionHistory || [];
      
      const alreadyProcessed = commissionHistory.some((entry: CommissionHistoryEntry) => 
        entry.orderId === orderId
      );

      if (alreadyProcessed) {
        return {
          success: false,
          message: 'Commission already processed for this order',
          alreadyProcessed: true,
          affiliateId: affiliate.id
        };
      }

      // Calculate commission
      const orderTotal = parseFloat(order.total.toString());
      const commissionRate = parseFloat(affiliate.commissionRate?.toString() || '5.00');
      const commissionAmount = (orderTotal * commissionRate) / 100;

      // Update affiliate data with new commission
      const currentCommissionEarned = affiliateData.totalCommissionEarned || 0;
      const currentCommissionPending = affiliateData.totalCommissionPending || 0;
      const currentTotalReferrals = affiliateData.totalReferrals || 0;
      const currentTotalReferralRevenue = affiliateData.totalReferralRevenue || 0;

      // Add commission history entry
      const newHistoryEntry: CommissionHistoryEntry = {
        orderId: orderId,
        orderTotal: orderTotal,
        commissionAmount: commissionAmount,
        commissionRate: commissionRate,
        processedAt: new Date().toISOString(),
        orderStatus: newStatus as 'delivered' | 'shipped'
      };

      const updatedCommissionHistory = [...commissionHistory, newHistoryEntry];

      // Update affiliate data
      const updatedAffiliateData = {
        ...affiliateData,
        totalCommissionEarned: currentCommissionEarned + commissionAmount,
        totalCommissionPending: currentCommissionPending + commissionAmount,
        totalReferrals: currentTotalReferrals + 1,
        totalReferralRevenue: currentTotalReferralRevenue + orderTotal,
        commissionHistory: updatedCommissionHistory,
        lastReferralAt: new Date().toISOString()
      };

      // Update customer record
      await storage.updateCustomer(affiliate.id, {
        affiliateData: updatedAffiliateData
      });

      console.log(`✅ Commission calculated for order ${orderId}:`, {
        affiliateCode: order.affiliateCode,
        affiliateId: affiliate.id,
        orderTotal: orderTotal,
        commissionRate: commissionRate,
        commissionAmount: commissionAmount,
        newStatus: newStatus
      });

      return {
        success: true,
        message: 'Commission calculated and applied successfully',
        commissionAmount: commissionAmount,
        affiliateId: affiliate.id
      };

    } catch (error) {
      console.error('❌ Error calculating commission for order:', orderId, error);
      return {
        success: false,
        message: `Error calculating commission: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Get commission history for an affiliate
   */
  static async getCommissionHistory(affiliateId: string): Promise<CommissionHistoryEntry[]> {
    try {
      const affiliate = await storage.getCustomer(affiliateId);
      if (!affiliate || !affiliate.isAffiliate) {
        return [];
      }

      const affiliateData = affiliate.affiliateData as any || {};
      return affiliateData.commissionHistory || [];
    } catch (error) {
      console.error('Error getting commission history:', error);
      return [];
    }
  }

  /**
   * Get commission summary for an affiliate
   */
  static async getCommissionSummary(affiliateId: string) {
    try {
      const affiliate = await storage.getCustomer(affiliateId);
      if (!affiliate || !affiliate.isAffiliate) {
        return null;
      }

      const affiliateData = affiliate.affiliateData as any || {};
      return {
        totalCommissionEarned: affiliateData.totalCommissionEarned || 0,
        totalCommissionPaid: affiliateData.totalCommissionPaid || 0,
        totalCommissionPending: affiliateData.totalCommissionPending || 0,
        totalReferrals: affiliateData.totalReferrals || 0,
        totalReferralRevenue: affiliateData.totalReferralRevenue || 0,
        conversionRate: affiliateData.conversionRate || 0,
        commissionRate: parseFloat(affiliate.commissionRate?.toString() || '5.00'),
        affiliateCode: affiliate.affiliateCode,
        affiliateStatus: affiliate.affiliateStatus
      };
    } catch (error) {
      console.error('Error getting commission summary:', error);
      return null;
    }
  }

  /**
   * Mark commission as paid (for admin use)
   */
  static async markCommissionAsPaid(affiliateId: string, amount: number, paymentReference?: string) {
    try {
      const affiliate = await storage.getCustomer(affiliateId);
      if (!affiliate || !affiliate.isAffiliate) {
        return {
          success: false,
          message: 'Affiliate not found'
        };
      }

      const affiliateData = affiliate.affiliateData as any || {};
      const currentCommissionPaid = affiliateData.totalCommissionPaid || 0;
      const currentCommissionPending = affiliateData.totalCommissionPending || 0;

      const updatedAffiliateData = {
        ...affiliateData,
        totalCommissionPaid: currentCommissionPaid + amount,
        totalCommissionPending: Math.max(0, currentCommissionPending - amount),
        lastPaymentAt: new Date().toISOString(),
        lastPaymentAmount: amount,
        lastPaymentReference: paymentReference || ''
      };

      await storage.updateCustomer(affiliateId, {
        affiliateData: updatedAffiliateData
      });

      return {
        success: true,
        message: 'Commission payment recorded successfully'
      };
    } catch (error) {
      console.error('Error marking commission as paid:', error);
      return {
        success: false,
        message: `Error recording payment: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}