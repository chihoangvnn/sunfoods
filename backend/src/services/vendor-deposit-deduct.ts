// @ts-nocheck
import { db } from '../db';
import { vendors, vendorOrders, depositTransactions } from '@shared/schema';
import { eq, and, sql } from 'drizzle-orm';

export async function autoDeductDeposit(vendorOrderId: string): Promise<{
  success: boolean;
  transactionId?: string;
  error?: string;
}> {
  try {
    const result = await db.transaction(async (tx) => {
      // 1. Fetch vendor_orders inside transaction
      const [vendorOrder] = await tx
        .select()
        .from(vendorOrders)
        .where(eq(vendorOrders.id, vendorOrderId))
        .limit(1);

      if (!vendorOrder) {
        throw new Error('Vendor order not found');
      }

      if (vendorOrder.status !== 'delivered') {
        throw new Error(`Order status is '${vendorOrder.status}', not 'delivered'`);
      }

      // 2. Check for existing approved deduction inside transaction (prevents duplicates)
      const [existingDeduction] = await tx
        .select()
        .from(depositTransactions)
        .where(
          and(
            eq(depositTransactions.orderId, vendorOrder.orderId),
            eq(depositTransactions.type, 'deduction')
          )
        )
        .limit(1);

      if (existingDeduction) {
        return {
          success: true,
          transactionId: existingDeduction.id,
        };
      }

      // 3. Fetch vendor inside transaction
      const [vendor] = await tx
        .select()
        .from(vendors)
        .where(eq(vendors.id, vendorOrder.vendorId))
        .limit(1);

      if (!vendor) {
        throw new Error('Vendor not found');
      }

      const commissionAmount = parseFloat((vendorOrder.commissionAmount || 0).toString());
      const currentBalance = parseFloat(vendor.depositBalance.toString());

      // 4. Validate balance inside transaction
      if (currentBalance < commissionAmount) {
        console.warn(
          `⚠️ Vendor ${vendorOrder.vendorId} has insufficient balance for order ${vendorOrderId}. Balance: ${currentBalance}, Commission: ${commissionAmount}`
        );
        throw new Error('Số dư không đủ để trừ hoa hồng');
      }

      // 5. Update balance using SQL arithmetic with atomic balance check
      const [updatedVendor] = await tx
        .update(vendors)
        .set({
          depositBalance: sql`${vendors.depositBalance} - ${commissionAmount}`,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(vendors.id, vendorOrder.vendorId),
            sql`${vendors.depositBalance} >= ${commissionAmount}`
          )
        )
        .returning({
          depositBalanceBefore: sql<string>`(${vendors.depositBalance} + ${commissionAmount})::text`,
          depositBalanceAfter: vendors.depositBalance,
        });

      // Handle case where update didn't affect any rows (insufficient balance due to concurrent update)
      if (!updatedVendor) {
        throw new Error('Số dư không đủ để trừ hoa hồng (concurrent update detected)');
      }

      const newBalance = parseFloat(updatedVendor.depositBalanceAfter.toString());

      // 6. Create transaction record inside transaction
      const [deductionTx] = await tx
        .insert(depositTransactions)
        .values({
          vendorId: vendorOrder.vendorId,
          orderId: vendorOrder.orderId,
          type: 'deduction',
          amount: (-commissionAmount).toFixed(2),
          balanceBefore: parseFloat(updatedVendor.depositBalanceBefore).toFixed(2),
          balanceAfter: newBalance.toFixed(2),
          description: `Trừ hoa hồng đơn hàng ${vendorOrder.orderId}`,
        })
        .returning({ id: depositTransactions.id });

      console.log(`✅ Successfully deducted commission for vendor order ${vendorOrderId}:`, {
        vendorId: vendorOrder.vendorId,
        orderId: vendorOrder.orderId,
        commissionAmount,
        balanceBefore: parseFloat(updatedVendor.depositBalanceBefore).toFixed(2),
        balanceAfter: newBalance.toFixed(2),
        transactionId: deductionTx.id,
      });

      return {
        success: true,
        transactionId: deductionTx.id,
      };
    });

    return result;
  } catch (error) {
    console.error(`❌ Error auto-deducting deposit for vendor order ${vendorOrderId}:`, error);

    const errorMessage = error instanceof Error ? error.message : 'Lỗi khi trừ tiền deposit';

    return {
      success: false,
      error: errorMessage,
    };
  }
}
