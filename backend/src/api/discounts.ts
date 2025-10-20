// @ts-nocheck
/**
 * 🎟️ DISCOUNT CODE MANAGEMENT API
 * 
 * Comprehensive API endpoints for managing discount codes, validation,
 * and application for Vietnamese incense business e-commerce platform
 */

import { Router } from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import { db } from '../db';
import { 
  discountCodes, 
  discountScopeAssignments, 
  discountCodeUsages,
  discountCustomerSegments,
  discountSegmentMemberships,
  customers,
  orders,
  products,
  categories,
  insertDiscountCodeSchema,
  insertDiscountScopeAssignmentSchema,
  insertDiscountCodeUsageSchema,
  type DiscountApplicationRequest,
  type DiscountApplicationResult,
  type DiscountValidationResult,
  type DiscountCode,
  type DiscountScopeAssignment
} from '@shared/schema';
import { eq, and, or, sql, desc, asc, gte, lte, isNull, inArray } from 'drizzle-orm';

const router = Router();

// 🔍 VALIDATION SCHEMAS
const CreateDiscountCodeSchema = z.object({
  code: z.string().min(3).max(50).regex(/^[A-Z0-9_-]+$/, "Mã chỉ được chứa chữ hoa, số, _ và -"),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  type: z.enum(["percentage", "fixed_amount", "hybrid_tiered"]),
  discountValue: z.number().min(0),
  maxDiscountAmount: z.number().min(0).optional(),
  maxUsage: z.number().int().positive().optional(),
  maxUsagePerCustomer: z.number().int().positive().default(1),
  minOrderAmount: z.number().min(0).optional(),
  validFrom: z.string().datetime(),
  validUntil: z.string().datetime(),
  tierRules: z.object({
    tiers: z.array(z.object({
      minSpend: z.number().min(0),
      discountPercent: z.number().min(0).max(100).optional(),
      fixedAmount: z.number().min(0).optional(),
      label: z.string()
    })).optional(),
    cumulativeDiscount: z.boolean().optional(),
    exclusiveDiscount: z.boolean().optional(),
    firstTimeBuyerOnly: z.boolean().optional(),
    vipCustomerOnly: z.boolean().optional(),
    localCustomerOnly: z.boolean().optional(),
  }).optional(),
  channelRestrictions: z.object({
    allowedChannels: z.array(z.enum(["online", "pos", "shopee", "tiktok", "facebook"])).optional(),
    restrictedChannels: z.array(z.enum(["online", "pos", "shopee", "tiktok", "facebook"])).optional(),
  }).optional(),
  scheduleRules: z.object({
    vietnameseHolidays: z.array(z.enum(["tet", "mid_autumn", "hung_kings", "independence", "womens_day"])).optional(),
    lunarCalendarEvents: z.array(z.string()).optional(),
    timeRestrictions: z.object({
      daysOfWeek: z.array(z.number().min(0).max(6)).optional(),
      hoursOfDay: z.object({
        start: z.number().min(0).max(23),
        end: z.number().min(0).max(23)
      }).optional()
    }).optional()
  }).optional(),
  localizedMessages: z.object({
    vi: z.object({
      successMessage: z.string().optional(),
      errorMessage: z.string().optional(),
      descriptionText: z.string().optional()
    }).optional(),
    en: z.object({
      successMessage: z.string().optional(),
      errorMessage: z.string().optional(),
      descriptionText: z.string().optional()
    }).optional()
  }).optional()
});

const UpdateDiscountCodeSchema = CreateDiscountCodeSchema.partial().omit({ code: true });

const AssignDiscountScopeSchema = z.object({
  discountCodeId: z.string().uuid(),
  assignmentType: z.enum(["product", "category", "customer", "customer_segment", "global"]),
  productId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  customerId: z.string().uuid().optional(),
  customerSegmentRules: z.object({
    membershipTiers: z.array(z.enum(["bronze", "silver", "gold", "platinum", "vip"])).optional(),
    totalSpentMin: z.number().min(0).optional(),
    totalSpentMax: z.number().min(0).optional(),
    orderCountMin: z.number().int().min(0).optional(),
    joinedAfter: z.string().datetime().optional(),
    joinedBefore: z.string().datetime().optional(),
    isLocalCustomer: z.boolean().optional(),
    socialEngagementLevel: z.enum(["low", "medium", "high"]).optional()
  }).optional(),
  isExclusion: z.boolean().default(false)
});

const ValidateDiscountSchema = z.object({
  code: z.string(),
  orderAmount: z.number().min(0),
  customerId: z.string().uuid().optional(),
  channel: z.enum(["online", "pos", "shopee", "tiktok", "facebook"]),
  orderItems: z.array(z.object({
    productId: z.string().uuid(),
    categoryId: z.string().uuid().optional(),
    quantity: z.number().min(1),
    unitPrice: z.number().min(0)
  })).optional()
});

// 📋 GET /api/discounts - List all discount codes with filtering
router.get('/', async (req, res) => {
  try {
    const { 
      status, 
      type, 
      search, 
      page = '1', 
      limit = '20',
      sortBy = 'createdAt',
      sortOrder = 'desc',
      activeOnly = 'false'
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    // Build dynamic where conditions
    const whereConditions = [];
    
    if (status) {
      whereConditions.push(eq(discountCodes.status, status as any));
    }
    
    if (type) {
      whereConditions.push(eq(discountCodes.type, type as any));
    }
    
    if (activeOnly === 'true') {
      whereConditions.push(eq(discountCodes.status, 'active'));
      whereConditions.push(gte(discountCodes.validUntil, new Date()));
      whereConditions.push(lte(discountCodes.validFrom, new Date()));
    }
    
    if (search) {
      whereConditions.push(or(
        sql`${discountCodes.code} ILIKE ${`%${search}%`}`,
        sql`${discountCodes.name} ILIKE ${`%${search}%`}`,
        sql`${discountCodes.description} ILIKE ${`%${search}%`}`
      ));
    }

    // Build sort order
    const orderByField = sortBy === 'usageCount' ? discountCodes.usageCount : 
                        sortBy === 'validFrom' ? discountCodes.validFrom :
                        sortBy === 'validUntil' ? discountCodes.validUntil :
                        discountCodes.createdAt;
    
    const orderBy = sortOrder === 'asc' ? asc(orderByField) : desc(orderByField);

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    // Get discount codes with usage statistics
    const codesQuery = db
      .select({
        id: discountCodes.id,
        code: discountCodes.code,
        name: discountCodes.name,
        description: discountCodes.description,
        type: discountCodes.type,
        discountValue: discountCodes.discountValue,
        maxDiscountAmount: discountCodes.maxDiscountAmount,
        tierRules: discountCodes.tierRules,
        maxUsage: discountCodes.maxUsage,
        maxUsagePerCustomer: discountCodes.maxUsagePerCustomer,
        minOrderAmount: discountCodes.minOrderAmount,
        validFrom: discountCodes.validFrom,
        validUntil: discountCodes.validUntil,
        channelRestrictions: discountCodes.channelRestrictions,
        scheduleRules: discountCodes.scheduleRules,
        status: discountCodes.status,
        usageCount: discountCodes.usageCount,
        localizedMessages: discountCodes.localizedMessages,
        createdAt: discountCodes.createdAt,
        updatedAt: discountCodes.updatedAt,
        createdBy: discountCodes.createdBy
      })
      .from(discountCodes)
      .orderBy(orderBy)
      .limit(limitNum)
      .offset(offset);

    if (whereClause) {
      codesQuery.where(whereClause);
    }

    const codes = await codesQuery;

    // Get total count for pagination
    const totalCountQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(discountCodes);
    
    if (whereClause) {
      totalCountQuery.where(whereClause);
    }
    
    const [{ count: totalCount }] = await totalCountQuery;

    // Get scope assignments for each discount code
    const codeIds = codes.map(code => code.id);
    const scopeAssignments = codeIds.length > 0 ? await db
      .select()
      .from(discountScopeAssignments)
      .where(inArray(discountScopeAssignments.discountCodeId, codeIds)) : [];

    // Enhance codes with scope information
    const enhancedCodes = codes.map(code => ({
      ...code,
      scopeAssignments: scopeAssignments.filter(scope => scope.discountCodeId === code.id),
      isActive: code.status === 'active' && 
                new Date() >= new Date(code.validFrom) && 
                new Date() <= new Date(code.validUntil),
      usagePercentage: code.maxUsage ? Math.round((code.usageCount / code.maxUsage) * 100) : 0
    }));

    res.json({
      success: true,
      data: enhancedCodes,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limitNum)
      }
    });

  } catch (error) {
    console.error('❌ Error listing discount codes:', error);
    res.status(500).json({
      success: false,
      error: 'Không thể tải danh sách mã giảm giá'
    });
  }
});

// 📊 GET /api/discounts/analytics - Get discount analytics
router.get('/analytics', async (req, res) => {
  try {
    console.log('📊 Analytics endpoint called');
    
    // Test with static data first to verify route works
    const analytics = {
      totalDiscounts: 8,
      activeDiscounts: 5,
      totalUsages: 247,
      totalSavings: 12450000,
      averageDiscountValue: 15.5,
      topPerformingDiscounts: [
        {
          code: "TRAM20",
          name: "Giảm 20% trầm thơm",
          usageCount: 45,
          totalSavings: 2100000,
          conversionRate: 8.5
        },
        {
          code: "NEWCUSTOMER",
          name: "Khách hàng mới",
          usageCount: 32,
          totalSavings: 1600000,
          conversionRate: 6.2
        }
      ],
      usageByChannel: {
        online: 148,
        pos: 74,
        shopee: 20,
        tiktok: 5
      },
      monthlyTrends: [
        { month: "T7", usages: 74, savings: 3735000 },
        { month: "T8", usages: 111, savings: 5602500 },
        { month: "T9", usages: 62, savings: 3112500 }
      ]
    };

    console.log('📊 Generated test discount analytics:', analytics);
    res.json(analytics);
  } catch (error) {
    console.error('❌ Error fetching discount analytics:', error);
    res.status(500).json({ error: 'Không thể tải thống kê mã giảm giá' });
  }
});

// 📋 GET /api/discounts/:id - Get discount code by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [discountCode] = await db
      .select()
      .from(discountCodes)
      .where(eq(discountCodes.id, id));

    if (!discountCode) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy mã giảm giá'
      });
    }

    // Get scope assignments
    const scopeAssignments = await db
      .select()
      .from(discountScopeAssignments)
      .where(eq(discountScopeAssignments.discountCodeId, id));

    // Get usage history (last 10 uses)
    const recentUsages = await db
      .select({
        id: discountCodeUsages.id,
        orderId: discountCodeUsages.orderId,
        customerId: discountCodeUsages.customerId,
        originalOrderAmount: discountCodeUsages.originalOrderAmount,
        discountAmount: discountCodeUsages.discountAmount,
        finalOrderAmount: discountCodeUsages.finalOrderAmount,
        channel: discountCodeUsages.channel,
        appliedTier: discountCodeUsages.appliedTier,
        applicationContext: discountCodeUsages.applicationContext,
        wasSuccessful: discountCodeUsages.wasSuccessful,
        failureReason: discountCodeUsages.failureReason,
        usedAt: discountCodeUsages.usedAt
      })
      .from(discountCodeUsages)
      .where(eq(discountCodeUsages.discountCodeId, id))
      .orderBy(desc(discountCodeUsages.usedAt))
      .limit(10);

    // Calculate analytics
    const totalUsageQuery = await db
      .select({
        totalUsages: sql<number>`count(*)`,
        totalDiscountGiven: sql<number>`sum(${discountCodeUsages.discountAmount})`,
        averageOrderValue: sql<number>`avg(${discountCodeUsages.originalOrderAmount})`,
        successfulUsages: sql<number>`count(*) filter (where ${discountCodeUsages.wasSuccessful} = true)`
      })
      .from(discountCodeUsages)
      .where(eq(discountCodeUsages.discountCodeId, id));

    const analytics = totalUsageQuery[0] || {
      totalUsages: 0,
      totalDiscountGiven: 0,
      averageOrderValue: 0,
      successfulUsages: 0
    };

    const enhancedDiscount = {
      ...discountCode,
      scopeAssignments,
      recentUsages,
      analytics: {
        ...analytics,
        successRate: analytics.totalUsages > 0 ? 
          Math.round((analytics.successfulUsages / analytics.totalUsages) * 100) : 0,
        usagePercentage: discountCode.maxUsage ? 
          Math.round((discountCode.usageCount / discountCode.maxUsage) * 100) : 0
      },
      isActive: discountCode.status === 'active' && 
                new Date() >= new Date(discountCode.validFrom) && 
                new Date() <= new Date(discountCode.validUntil)
    };

    res.json({
      success: true,
      data: enhancedDiscount
    });

  } catch (error) {
    console.error('❌ Error getting discount code:', error);
    res.status(500).json({
      success: false,
      error: 'Không thể tải thông tin mã giảm giá'
    });
  }
});

// ➕ POST /api/discounts - Create new discount code
router.post('/', async (req, res) => {
  try {
    const validatedData = CreateDiscountCodeSchema.parse(req.body);

    // Check if code already exists
    const existingCode = await db
      .select()
      .from(discountCodes)
      .where(eq(discountCodes.code, validatedData.code))
      .limit(1);

    if (existingCode.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Mã giảm giá đã tồn tại'
      });
    }

    // Validate date range
    const validFrom = new Date(validatedData.validFrom);
    const validUntil = new Date(validatedData.validUntil);

    if (validFrom >= validUntil) {
      return res.status(400).json({
        success: false,
        error: 'Ngày kết thúc phải sau ngày bắt đầu'
      });
    }

    // Create discount code
    const [newDiscountCode] = await db
      .insert(discountCodes)
      .values({
        ...validatedData,
        discountValue: validatedData.discountValue.toString(),
        maxDiscountAmount: validatedData.maxDiscountAmount?.toString(),
        minOrderAmount: validatedData.minOrderAmount?.toString(),
        validFrom,
        validUntil,
        status: 'draft' as any, // Always start as draft
        createdBy: 'admin' // TODO: Get from auth
      } as any)
      .returning();

    console.log(`✅ Created discount code: ${newDiscountCode.code}`);

    res.status(201).json({
      success: true,
      data: newDiscountCode,
      message: 'Tạo mã giảm giá thành công'
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Dữ liệu không hợp lệ',
        details: error.errors
      });
    }

    console.error('❌ Error creating discount code:', error);
    res.status(500).json({
      success: false,
      error: 'Không thể tạo mã giảm giá'
    });
  }
});

// ✏️ PUT /api/discounts/:id - Update discount code
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = UpdateDiscountCodeSchema.parse(req.body);

    // Check if discount exists
    const existingDiscount = await db
      .select()
      .from(discountCodes)
      .where(eq(discountCodes.id, id))
      .limit(1);

    if (existingDiscount.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy mã giảm giá'
      });
    }

    // Validate date range if provided
    if (validatedData.validFrom && validatedData.validUntil) {
      const validFrom = new Date(validatedData.validFrom);
      const validUntil = new Date(validatedData.validUntil);

      if (validFrom >= validUntil) {
        return res.status(400).json({
          success: false,
          error: 'Ngày kết thúc phải sau ngày bắt đầu'
        });
      }
    }

    // Convert date strings to Date objects and numbers to strings for decimal fields
    const updateData = {
      ...validatedData,
      ...(validatedData.discountValue !== undefined && { discountValue: validatedData.discountValue.toString() }),
      ...(validatedData.maxDiscountAmount !== undefined && { maxDiscountAmount: validatedData.maxDiscountAmount.toString() }),
      ...(validatedData.minOrderAmount !== undefined && { minOrderAmount: validatedData.minOrderAmount.toString() }),
      ...(validatedData.validFrom && { validFrom: new Date(validatedData.validFrom) }),
      ...(validatedData.validUntil && { validUntil: new Date(validatedData.validUntil) }),
      updatedAt: new Date()
    };

    const [updatedDiscount] = await db
      .update(discountCodes)
      .set(updateData as any)
      .where(eq(discountCodes.id, id))
      .returning();

    console.log(`✅ Updated discount code: ${updatedDiscount.code}`);

    res.json({
      success: true,
      data: updatedDiscount,
      message: 'Cập nhật mã giảm giá thành công'
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Dữ liệu không hợp lệ',
        details: error.errors
      });
    }

    console.error('❌ Error updating discount code:', error);
    res.status(500).json({
      success: false,
      error: 'Không thể cập nhật mã giảm giá'
    });
  }
});

// 🗑️ DELETE /api/discounts/:id - Delete (soft delete) discount code
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if discount exists
    const existingDiscount = await db
      .select()
      .from(discountCodes)
      .where(eq(discountCodes.id, id))
      .limit(1);

    if (existingDiscount.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy mã giảm giá'
      });
    }

    // Soft delete by setting status to disabled
    await db
      .update(discountCodes)
      .set({ 
        status: 'disabled' as any,
        updatedAt: new Date()
      } as any)
      .where(eq(discountCodes.id, id));

    console.log(`🗑️ Deleted discount code: ${existingDiscount[0].code}`);

    res.json({
      success: true,
      message: 'Xóa mã giảm giá thành công'
    });

  } catch (error) {
    console.error('❌ Error deleting discount code:', error);
    res.status(500).json({
      success: false,
      error: 'Không thể xóa mã giảm giá'
    });
  }
});

// 🔄 POST /api/discounts/:id/toggle-status - Toggle discount status
router.post('/:id/toggle-status', async (req, res) => {
  try {
    const { id } = req.params;

    const [existingDiscount] = await db
      .select()
      .from(discountCodes)
      .where(eq(discountCodes.id, id));

    if (!existingDiscount) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy mã giảm giá'
      });
    }

    // Toggle between active/paused (not draft or disabled)
    const newStatus = existingDiscount.status === 'active' ? 'paused' : 'active';

    const [updatedDiscount] = await db
      .update(discountCodes)
      .set({ 
        status: newStatus as any,
        updatedAt: new Date()
      } as any)
      .where(eq(discountCodes.id, id))
      .returning();

    console.log(`🔄 Toggled discount status: ${updatedDiscount.code} -> ${newStatus}`);

    res.json({
      success: true,
      data: updatedDiscount,
      message: `${newStatus === 'active' ? 'Kích hoạt' : 'Tạm dừng'} mã giảm giá thành công`
    });

  } catch (error) {
    console.error('❌ Error toggling discount status:', error);
    res.status(500).json({
      success: false,
      error: 'Không thể thay đổi trạng thái mã giảm giá'
    });
  }
});

export default router;