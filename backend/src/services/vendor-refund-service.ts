/**
 * ⚠️ VENDOR REFUND SERVICE - PARTIALLY DISABLED
 * vendorTransactions table does not exist in database
 * Refund tracking disabled, but service structure preserved
 */
import { db } from '../db';
import { vendors, /* vendorTransactions - DISABLED: table not in database */ vendorOrders } from '@shared/schema';
import { eq, sql } from 'drizzle-orm';

export interface RefundResult {
  success: boolean;
  transactionId?: string;
  balanceAfter?: string;
  message?: string;
}

export class VendorRefundService {
  async processRefund(
    vendorId: string,
    returnId: string,
    refundAmount: number,
    vendorOrderId: string,
    adminId?: string
  ): Promise<RefundResult> {
    const [vendor] = await db.select().from(vendors).where(eq(vendors.id, vendorId));
    
    if (!vendor) {
      throw new Error('Vendor not found');
    }

    const [vendorOrder] = await db.select().from(vendorOrders).where(eq(vendorOrders.id, vendorOrderId));
    
    if (!vendorOrder) {
      throw new Error('Vendor order not found');
    }

    const vendorCost = parseFloat(vendorOrder.vendorCost);
    if (refundAmount > vendorCost) {
      throw new Error('Refund amount cannot exceed original order vendor cost');
    }

    switch (vendor.paymentModel) {
      case 'deposit':
        return await this.processDepositRefund(vendor, returnId, refundAmount, adminId);
        
      case 'monthly':
        return await this.processMonthlyRefund(vendor, returnId, refundAmount, adminId);
        
      case 'upfront':
        throw new Error('Returns not allowed for upfront payment model');
        
      case 'revenue_share':
        return await this.processRevenueShareRefund(vendor, returnId, refundAmount, vendorOrder, adminId);
        
      default:
        throw new Error(`Unknown payment model: ${vendor.paymentModel}`);
    }
  }

  private async processDepositRefund(
    vendor: any,
    returnId: string,
    refundAmount: number,
    adminId?: string
  ): Promise<RefundResult> {
    const balanceBefore = parseFloat(vendor.depositBalance);
    const balanceAfter = balanceBefore + refundAmount;

    await db.update(vendors)
      .set({ 
        depositBalance: sql`${vendors.depositBalance} + ${refundAmount}`,
        updatedAt: new Date()
      })
      .where(eq(vendors.id, vendor.id));

    // DISABLED: vendorTransactions table not in database
    // Transaction logging disabled
    /* const [transaction] = await db.insert(vendorTransactions)
      .values({
        vendorId: vendor.id,
        type: 'refund',
        amount: refundAmount.toFixed(2),
        balanceBefore: balanceBefore.toFixed(2),
        balanceAfter: balanceAfter.toFixed(2),
        referenceReturnId: returnId,
        description: `Refund for return #${returnId}`,
        createdBy: adminId || 'system',
        metadata: {
          paymentModel: 'deposit',
          refundType: 'deposit_credit'
        }
      })
      .returning(); */

    return {
      success: true,
      transactionId: undefined, // transaction?.id
      balanceAfter: balanceAfter.toFixed(2),
      message: 'Deposit balance credited successfully (transaction logging disabled)'
    };
  }

  private async processMonthlyRefund(
    vendor: any,
    returnId: string,
    refundAmount: number,
    adminId?: string
  ): Promise<RefundResult> {
    const currentDebt = parseFloat(vendor.monthlyDebt);
    const depositBalanceBefore = parseFloat(vendor.depositBalance);
    
    let newDebt = currentDebt;
    let newDepositBalance = depositBalanceBefore;
    let description = '';

    if (currentDebt > 0) {
      const debtReduction = Math.min(currentDebt, refundAmount);
      newDebt = currentDebt - debtReduction;
      
      const remainingRefund = refundAmount - debtReduction;
      if (remainingRefund > 0) {
        newDepositBalance = depositBalanceBefore + remainingRefund;
        description = `Refund for return #${returnId}: Reduced debt by ${debtReduction.toFixed(2)}, credited ${remainingRefund.toFixed(2)} to deposit`;
      } else {
        description = `Refund for return #${returnId}: Reduced monthly debt by ${debtReduction.toFixed(2)}`;
      }
    } else {
      newDepositBalance = depositBalanceBefore + refundAmount;
      description = `Refund for return #${returnId}: Credited to deposit balance`;
    }

    await db.update(vendors)
      .set({ 
        monthlyDebt: newDebt.toFixed(2),
        depositBalance: newDepositBalance.toFixed(2),
        updatedAt: new Date()
      })
      .where(eq(vendors.id, vendor.id));

    // DISABLED: vendorTransactions table not in database
    /* const [transaction] = await db.insert(vendorTransactions)
      .values({
        vendorId: vendor.id,
        type: 'refund',
        amount: refundAmount.toFixed(2),
        balanceBefore: depositBalanceBefore.toFixed(2),
        balanceAfter: newDepositBalance.toFixed(2),
        referenceReturnId: returnId,
        description,
        createdBy: adminId || 'system',
        metadata: {
          paymentModel: 'monthly',
          debtBefore: currentDebt.toFixed(2),
          debtAfter: newDebt.toFixed(2),
          refundType: 'debt_reduction_and_credit'
        }
      })
      .returning(); */

    return {
      success: true,
      transactionId: undefined, // transaction?.id
      balanceAfter: newDepositBalance.toFixed(2),
      message: description + ' (transaction logging disabled)'
    };
  }

  private async processRevenueShareRefund(
    vendor: any,
    returnId: string,
    refundAmount: number,
    vendorOrder: any,
    adminId?: string
  ): Promise<RefundResult> {
    const commissionRate = parseFloat(vendor.commissionRate);
    const orderTotal = parseFloat(vendorOrder.vendorCost);
    
    const vendorShare = (orderTotal * commissionRate) / 100;
    const platformShare = orderTotal - vendorShare;

    const vendorRefund = (refundAmount * commissionRate) / 100;
    
    const balanceBefore = parseFloat(vendor.depositBalance);
    const balanceAfter = balanceBefore - vendorRefund;

    await db.update(vendors)
      .set({ 
        depositBalance: sql`${vendors.depositBalance} - ${vendorRefund}`,
        updatedAt: new Date()
      })
      .where(eq(vendors.id, vendor.id));

    // DISABLED: vendorTransactions table not in database
    /* const [transaction] = await db.insert(vendorTransactions)
      .values({
        vendorId: vendor.id,
        type: 'refund',
        amount: `-${vendorRefund.toFixed(2)}`,
        balanceBefore: balanceBefore.toFixed(2),
        balanceAfter: balanceAfter.toFixed(2),
        referenceReturnId: returnId,
        description: `Refund for return #${returnId}: Deducted vendor share (${commissionRate}% of ${refundAmount.toFixed(2)})`,
        createdBy: adminId || 'system',
        metadata: {
          paymentModel: 'revenue_share',
          commissionRate: commissionRate.toFixed(2),
          totalRefund: refundAmount.toFixed(2),
          vendorRefund: vendorRefund.toFixed(2),
          platformRefund: (refundAmount - vendorRefund).toFixed(2),
          refundType: 'revenue_share_deduction'
        }
      })
      .returning(); */

    return {
      success: true,
      transactionId: undefined, // transaction?.id
      balanceAfter: balanceAfter.toFixed(2),
      message: `Vendor share deducted: ${vendorRefund.toFixed(2)} (${commissionRate}% of total refund) (transaction logging disabled)`
    };
  }
}

export const vendorRefundService = new VendorRefundService();
