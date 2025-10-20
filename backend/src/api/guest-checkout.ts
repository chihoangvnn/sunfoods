// @ts-nocheck
/**
 * 🛒 GUEST CHECKOUT API với AUTO CUSTOMER CREATION
 * 
 * Handles guest checkout flow with automatic customer record creation
 * for Vietnamese incense business. Integrates with VietQR payment system.
 */

import { Router } from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import VietQRService from '../services/vietqr-service';
import { db } from '../db';
import { customerVouchers, discountCodes, discountScopeAssignments } from '@shared/schema';
import { eq, and, sql } from 'drizzle-orm';
import { validateVoucherForOrder } from '../services/voucher-validation';

const router = Router();

// ✅ Guest Checkout Schema - Vietnamese customer validation
const GuestCheckoutSchema = z.object({
  // 👤 Customer Information
  customerName: z.string().min(2, "Tên khách hàng phải có ít nhất 2 ký tự"),
  customerEmail: z.string().email("Email không hợp lệ"),
  customerPhone: z.string().min(10, "Số điện thoại phải có ít nhất 10 số").max(15, "Số điện thoại không được quá 15 số"),
  customerAddress: z.string().min(10, "Địa chỉ phải có ít nhất 10 ký tự"),
  
  // 🛍️ Order Information
  items: z.array(z.object({
    productId: z.string(),
    productName: z.string(),
    quantity: z.number().min(1),
    price: z.number().min(0)
  })).min(1, "Đơn hàng phải có ít nhất 1 sản phẩm"),
  
  total: z.number().min(1000, "Tổng đơn hàng phải ít nhất 1,000 VND"),
  
  // 📦 Delivery Information
  deliveryType: z.enum(["local_delivery", "cod_shipping"]).default("local_delivery"),
  notes: z.string().optional(),
  
  // 💳 Payment Method
  paymentMethod: z.enum(["qr_code", "bank_transfer", "cash"]).default("qr_code"),
  
  // 🎟️ Voucher Information
  voucherCode: z.string().optional().nullable(),
  discountAmount: z.number().optional().default(0)
});

type GuestCheckoutData = z.infer<typeof GuestCheckoutSchema>;

/**
 * 👤 AUTO CUSTOMER CREATION - Find or create customer by email
 */
async function findOrCreateCustomer(customerData: {
  name: string;
  email: string;
  phone: string;
  address?: string;
}) {
  try {
    // 🔍 Try to find existing customer by email using search
    const searchResults = await storage.searchCustomers(customerData.email, 1);
    const existingCustomer = searchResults.find(customer => 
      customer.email?.toLowerCase() === customerData.email.toLowerCase()
    );
    
    if (existingCustomer) {
      // ✅ Customer exists - update phone if provided and different
      if (customerData.phone && customerData.phone !== existingCustomer.phone) {
        const updatedCustomer = await storage.updateCustomer(existingCustomer.id, {
          phone: customerData.phone,
          // Keep existing data
          name: existingCustomer.name,
          email: existingCustomer.email
        });
        return updatedCustomer || existingCustomer;
      }
      return existingCustomer;
    }
    
    // 🆕 Create new customer with membership defaults
    const newCustomer = await storage.createCustomer({
      name: customerData.name,
      email: customerData.email,
      phone: customerData.phone,
      status: "active",
      membershipTier: "member", // Start as basic member
      totalSpent: "0",
      pointsBalance: 0,
      pointsEarned: 0,
      membershipData: {
        tierProgressPercent: 0,
        nextTierThreshold: 3000000, // 3M VND for Silver tier
        specialOffers: [],
        tierHistory: [{
          tier: 'member',
          date: new Date().toISOString(),
          reason: 'Đăng ký qua guest checkout'
        }]
      },
      // No authUserId - this is a guest-created customer
      authUserId: null
    });
    
    return newCustomer;
    
  } catch (error) {
    console.error('❌ Error in findOrCreateCustomer:', error);
    throw new Error('Không thể tạo hoặc tìm khách hàng');
  }
}

/**
 * 💰 CALCULATE POINTS from order total (VND)
 */
function calculatePointsEarned(total: number): number {
  // 1 điểm cho mỗi 1000 VND chi tiêu
  return Math.floor(total / 1000);
}

/**
 * 🛒 GUEST CHECKOUT ENDPOINT
 */
router.post('/guest-checkout', async (req, res) => {
  try {
    // ✅ Validate input data
    const validation = GuestCheckoutSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Thông tin đơn hàng không hợp lệ',
        details: validation.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }
    
    const data: GuestCheckoutData = validation.data;
    
    // 🔒 Step 1: CRITICAL SECURITY - Validate products and recompute totals
    console.log('🔒 Starting server-side product validation...');
    const validatedItems: Array<{
      productId: string;
      product: any;
      quantity: number;
      unitPrice: number;
      lineTotal: number;
    }> = [];
    
    let serverTotal = 0;

    for (const clientItem of data.items) {
      // Load product from database (authoritative source)
      const product = await storage.getProduct(clientItem.productId);
      if (!product) {
        throw new Error(`Sản phẩm với ID ${clientItem.productId} không tồn tại hoặc đã ngừng bán`);
      }

      // Use authoritative price from database (NEVER trust client)
      const unitPrice = product.price ? parseFloat(product.price.toString()) : 0;
      const lineTotal = unitPrice * clientItem.quantity;
      
      // Log price validation
      console.log(`💰 Product ${product.name}: DB price ${unitPrice}, client sent ${clientItem.price}`);
      
      validatedItems.push({
        productId: clientItem.productId,
        product,
        quantity: clientItem.quantity,
        unitPrice,
        lineTotal
      });
      
      serverTotal += lineTotal;
    }

    // 👤 Step 1.5: Find or create customer FIRST (to enable customer-specific voucher restrictions)
    const customer = await findOrCreateCustomer({
      name: data.customerName,
      email: data.customerEmail,
      phone: data.customerPhone,
      address: data.customerAddress
    });

    // 🎟️ Step 1.6: Validate voucher server-side if provided (using shared service, not HTTP fetch)
    let serverDiscountAmount = 0;
    let validatedVoucherCode: string | null = null;

    if (data.voucherCode) {
      try {
        const voucherResult = await validateVoucherForOrder(
          data.voucherCode,
          serverTotal,
          customer.id,
          validatedItems.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.unitPrice
          }))
        );
        
        if (voucherResult.valid && voucherResult.discount) {
          serverDiscountAmount = voucherResult.discount.discountAmount;
          validatedVoucherCode = data.voucherCode;
          console.log(`✅ Voucher validated - Discount: ${serverDiscountAmount}`);
        } else {
          console.warn(`⚠️ Voucher invalid: ${voucherResult.error}`);
        }
      } catch (error) {
        console.error('Error validating voucher:', error);
      }
    }

    // Calculate final total with discount
    const serverFinalTotal = serverTotal - serverDiscountAmount;

    // 🚨 CRITICAL: Reject if client total doesn't match server calculation (WITH discount)
    const totalMismatch = Math.abs(serverFinalTotal - data.total) > 0.01;
    if (totalMismatch) {
      console.error(`🚨 SECURITY ALERT: Total mismatch - Server: ${serverFinalTotal}, Client: ${data.total}`);
      throw new Error(`Tổng tiền không hợp lệ. Vui lòng tải lại trang và thử lại.`);
    }

    console.log(`✅ Security validation passed - Subtotal: ${serverTotal}, Discount: ${serverDiscountAmount}, Final: ${serverFinalTotal}`);
    
    // 🛍️ Step 3: Create order with validated data
    const order = await storage.createOrder({
      customerId: customer.id,
      total: serverFinalTotal.toString(), // Use discounted total (VOUCHER FIX)
      items: validatedItems.map(item => ({
        productId: item.productId,
        productName: item.product.name,
        quantity: item.quantity,
        price: item.unitPrice
      })),
      status: 'pending',
      paymentMethod: data.paymentMethod === 'qr_code' ? 'bank_transfer' : data.paymentMethod,
      source: 'storefront', // Mark as storefront order for tracking
      sourceReference: 'guest-checkout',
      // 📦 CRITICAL: Save complete guest checkout details
      sourceCustomerInfo: {
        name: data.customerName,
        email: data.customerEmail,
        phone: data.customerPhone,
        address: data.customerAddress,
        originalCustomerId: `guest-${Date.now()}` // Unique ID for guest orders
      }
    });

    // 🛒 Step 3.1: Create order items with validated data
    for (const validatedItem of validatedItems) {
      await storage.createOrderItem({
        orderId: order.id,
        productId: validatedItem.productId,
        quantity: validatedItem.quantity.toString(),
        price: validatedItem.unitPrice.toString() // Use validated price (SECURITY FIX)
      });
    }
    
    // 🎟️ Step 3.2: Mark voucher as used if validated
    if (validatedVoucherCode && customer.id) {
      try {
        // First, get the discount code to find its ID
        const discountCodeResult = await db
          .select()
          .from(discountCodes)
          .where(eq(discountCodes.code, validatedVoucherCode))
          .limit(1);
        
        if (discountCodeResult.length > 0) {
          const discountCode = discountCodeResult[0];
          
          // Update customer_voucher to mark as used
          await db
            .update(customerVouchers)
            .set({
              status: 'used',
              usedAt: new Date(),
              orderId: order.id,
              discountApplied: serverDiscountAmount.toString() // Use server-calculated discount
            })
            .where(
              and(
                eq(customerVouchers.customerId, customer.id),
                eq(customerVouchers.discountCodeId, discountCode.id),
                eq(customerVouchers.status, 'active')
              )
            );
          
          // Increment usage count on discount code
          await db
            .update(discountCodes)
            .set({
              usageCount: sql`${discountCodes.usageCount} + 1`
            })
            .where(eq(discountCodes.id, discountCode.id));
          
          console.log(`✅ Voucher ${validatedVoucherCode} marked as used for order ${order.id} with discount ${serverDiscountAmount}`);
        } else {
          console.warn(`⚠️ Voucher code ${validatedVoucherCode} not found in database`);
        }
        
      } catch (voucherError) {
        console.error('⚠️ Error marking voucher as used:', voucherError);
        // Don't fail the order if voucher marking fails
      }
    }
    
    // 💰 Step 4: Calculate and award points (using final discounted total)
    const pointsEarned = calculatePointsEarned(serverFinalTotal);
    
    if (pointsEarned > 0) {
      await storage.updateCustomer(customer.id, {
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        pointsBalance: customer.pointsBalance + pointsEarned,
        pointsEarned: customer.pointsEarned + pointsEarned,
        totalSpent: (parseFloat(customer.totalSpent) + serverFinalTotal).toString() // Use discounted total (VOUCHER FIX)
      });
    }
    
    // 💳 Step 5: Generate VietQR payment if requested
    let paymentData = null;
    if (data.paymentMethod === 'qr_code') {
      try {
        const qrResult = VietQRService.generateMobileQR(
          serverFinalTotal, // Use discounted total (VOUCHER FIX)
          order.id,
          `Đơn hàng nhang sạch - ${data.customerName}`
        );
        
        // Create payment record
        const payment = await storage.createPayment({
          orderId: order.id,
          method: 'qr_code',
          amount: serverFinalTotal.toString(), // Use discounted total (VOUCHER FIX)
          qrCode: qrResult.qrCodeUrl,
          status: 'pending',
          bankInfo: qrResult.bankInfo
        });
        
        paymentData = {
          id: payment.id,
          qrCodeUrl: qrResult.qrCodeUrl,
          bankInfo: qrResult.bankInfo,
          amount: qrResult.amount,
          standardReference: qrResult.standardReference,
          expiresAt: qrResult.expiresAt
        };
        
      } catch (qrError) {
        console.error('⚠️ VietQR generation failed:', qrError);
        // Continue without QR - order still created successfully
      }
    }
    
    // ✅ Return success response
    res.json({
      success: true,
      message: '🎉 Đơn hàng đã được tạo thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất.',
      data: {
        // Order information
        orderId: order.id,
        orderStatus: order.status,
        orderTotal: serverFinalTotal, // Use server-calculated discounted total
        
        // Customer information
        customer: {
          id: customer.id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          membershipTier: customer.membershipTier,
          pointsEarned: pointsEarned,
          newTotalPoints: customer.pointsBalance + pointsEarned
        },
        
        // Items summary
        items: data.items,
        
        // Payment information
        payment: paymentData,
        
        // Voucher information (if validated and applied)
        voucher: validatedVoucherCode ? {
          code: validatedVoucherCode,
          discountAmount: serverDiscountAmount // Use server-calculated discount
        } : null,
        
        // Delivery information
        delivery: {
          type: data.deliveryType,
          address: data.customerAddress,
          notes: data.notes
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Guest checkout error:', error);
    res.status(500).json({
      success: false,
      error: 'Có lỗi xảy ra khi xử lý đơn hàng. Vui lòng thử lại sau.',
      message: 'Xin lỗi quý khách, hệ thống đang bảo trì. Vui lòng liên hệ hotline để được hỗ trợ.'
    });
  }
});

/**
 * 📋 GET ORDER STATUS - For guest order tracking
 */
router.get('/order-status/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    
    // Get order with customer info
    const order = await storage.getOrder(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy đơn hàng'
      });
    }
    
    // Get customer info
    const customer = order.customerId ? await storage.getCustomer(order.customerId) : null;
    
    // Get payment info if exists
    const latestPayment = await storage.getPayment(orderId);
    
    res.json({
      success: true,
      data: {
        order: {
          id: order.id,
          status: order.status,
          total: order.total,
          items: order.items,
          createdAt: order.createdAt
        },
        customer: customer ? {
          name: customer.name,
          email: customer.email,
          phone: customer.phone
        } : null,
        payment: latestPayment ? {
          method: latestPayment.method,
          status: latestPayment.status,
          qrCode: latestPayment.qrCode
        } : null
      }
    });
    
  } catch (error) {
    console.error('❌ Order status error:', error);
    res.status(500).json({
      success: false,
      error: 'Không thể kiểm tra trạng thái đơn hàng'
    });
  }
});

export default router;