import { Request, Response, Router } from 'express';
import { storage } from '../storage';

const router = Router();

router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const stats = await storage.getAffiliateDashboardStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('❌ Affiliate Dashboard Error:', error);
    res.status(500).json({
      error: 'Failed to fetch affiliate dashboard stats',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.get('/members', async (req: Request, res: Response) => {
  try {
    const { status, limit, offset } = req.query;
    
    const filters: any = {};
    if (status) filters.status = status as string;
    if (limit) filters.limit = parseInt(limit as string);
    if (offset) filters.offset = parseInt(offset as string);
    
    const members = await storage.getAffiliateMembers(filters);
    
    res.json({
      success: true,
      data: members
    });
  } catch (error) {
    console.error('❌ Get Affiliate Members Error:', error);
    res.status(500).json({
      error: 'Failed to fetch affiliate members',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.post('/approve/:customerId', async (req: Request, res: Response) => {
  try {
    const { customerId } = req.params;
    const { commissionRate } = req.body;
    
    const updated = await storage.approvePendingAffiliate(customerId, commissionRate || '10');
    
    if (!updated) {
      return res.status(404).json({
        error: 'Customer not found'
      });
    }
    
    res.json({
      success: true,
      data: updated,
      message: 'Affiliate đã được duyệt thành công'
    });
  } catch (error) {
    console.error('❌ Approve Affiliate Error:', error);
    res.status(500).json({
      error: 'Failed to approve affiliate',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.post('/reject/:customerId', async (req: Request, res: Response) => {
  try {
    const { customerId } = req.params;
    const { reason } = req.body;
    
    const updated = await storage.rejectAffiliateApplication(customerId, reason);
    
    if (!updated) {
      return res.status(404).json({
        error: 'Customer not found'
      });
    }
    
    res.json({
      success: true,
      data: updated,
      message: 'Đơn affiliate đã bị từ chối'
    });
  } catch (error) {
    console.error('❌ Reject Affiliate Error:', error);
    res.status(500).json({
      error: 'Failed to reject affiliate application',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.put('/toggle-status/:customerId', async (req: Request, res: Response) => {
  try {
    const { customerId } = req.params;
    const { status } = req.body;
    
    if (!['active', 'suspended'].includes(status)) {
      return res.status(400).json({
        error: 'Invalid status',
        message: 'Status must be "active" or "suspended"'
      });
    }
    
    const updated = await storage.toggleAffiliateStatus(customerId, status);
    
    if (!updated) {
      return res.status(404).json({
        error: 'Affiliate member not found'
      });
    }
    
    res.json({
      success: true,
      data: updated,
      message: status === 'active' ? 'Affiliate đã được kích hoạt' : 'Affiliate đã bị tạm ngưng'
    });
  } catch (error) {
    console.error('❌ Toggle Affiliate Status Error:', error);
    res.status(500).json({
      error: 'Failed to toggle affiliate status',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 📦 Bulk Product Assignment
router.post('/bulk-assign-products', async (req: Request, res: Response) => {
  try {
    const { productIds, affiliateIds, commissionRate, isPremium, isDefaultAssignment } = req.body;
    
    // Validation
    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({
        error: 'Danh sách sản phẩm không hợp lệ',
        message: 'Vui lòng chọn ít nhất 1 sản phẩm'
      });
    }
    
    const assignments = [];
    const errors = [];
    
    // Handle DEFAULT ASSIGNMENTS (apply to all current + future affiliates)
    if (isDefaultAssignment) {
      // Step 1: Fetch existing default templates once (cache)
      const existingTemplates = await storage.getDefaultAffiliateAssignments();
      const existingTemplateSet = new Set(
        existingTemplates
          .filter(t => t.assignmentType === 'product')
          .map(t => t.targetId)
      );
      
      // Step 2: Create default assignment templates (affiliateId = null) with idempotency
      for (const productId of productIds) {
        try {
          // Check if default template already exists (using cached data)
          if (existingTemplateSet.has(productId)) {
            // Skip - template already exists
            continue;
          }
          
          const defaultAssignment = await storage.createAffiliateProductAssignment({
            affiliateId: null,
            assignmentType: 'product',
            targetId: productId,
            commissionRate: commissionRate || '10',
            isPremium: isPremium || false,
            isDefaultAssignment: true,
            isActive: true
          });
          assignments.push(defaultAssignment);
        } catch (err) {
          errors.push({
            productId,
            affiliateId: 'DEFAULT_TEMPLATE',
            error: err instanceof Error ? err.message : 'Unknown error'
          });
        }
      }
      
      // Step 2: Get ALL existing affiliates and assign products to them (with pagination)
      let allAffiliates: any[] = [];
      let offset = 0;
      const pageSize = 100;
      let hasMore = true;
      
      // Paginate through all affiliates
      while (hasMore) {
        const page = await storage.getAffiliateMembers({ limit: pageSize, offset });
        allAffiliates = allAffiliates.concat(page);
        offset += pageSize;
        hasMore = page.length === pageSize;
      }
      
      // Step 3: Bulk fetch existing assignments for all affiliates
      const affiliateIds = allAffiliates.map(a => a.id);
      const existingAssignments = await storage.getBulkAffiliateAssignments(affiliateIds, productIds);
      
      // Create a Set for O(1) lookup of existing assignments
      const existingSet = new Set(
        existingAssignments.map((a: any) => `${a.affiliateId}:${a.targetId}`)
      );
      
      // Assign products to all affiliates (skip if already exists)
      for (const productId of productIds) {
        for (const affiliate of allAffiliates) {
          const key = `${affiliate.id}:${productId}`;
          
          if (existingSet.has(key)) {
            // Skip - already assigned
            continue;
          }
          
          try {
            const assignment = await storage.createAffiliateProductAssignment({
              affiliateId: affiliate.id,
              assignmentType: 'product',
              targetId: productId,
              commissionRate: commissionRate || '10',
              isPremium: isPremium || false,
              isDefaultAssignment: false,
              isActive: true
            });
            assignments.push(assignment);
          } catch (err) {
            errors.push({
              productId,
              affiliateId: affiliate.id,
              error: err instanceof Error ? err.message : 'Unknown error'
            });
          }
        }
      }
      
      res.json({
        success: true,
        data: {
          totalAssignments: assignments.length,
          assignments,
          errors: errors.length > 0 ? errors : null
        },
        message: `Đã gán ${productIds.length} sản phẩm cho TẤT CẢ affiliate (${allAffiliates.length} members + tự động cho member mới)${errors.length > 0 ? ` (${errors.length} lỗi)` : ''}`
      });
      return;
    }
    
    // Handle SPECIFIC ASSIGNMENTS (assign to selected affiliates only)
    if (!affiliateIds || !Array.isArray(affiliateIds) || affiliateIds.length === 0) {
      return res.status(400).json({
        error: 'Danh sách affiliate không hợp lệ',
        message: 'Vui lòng chọn ít nhất 1 affiliate'
      });
    }
    
    for (const productId of productIds) {
      for (const affiliateId of affiliateIds) {
        try {
          const assignment = await storage.createAffiliateProductAssignment({
            affiliateId,
            assignmentType: 'product',
            targetId: productId,
            commissionRate: commissionRate || '10',
            isPremium: isPremium || false,
            isDefaultAssignment: false,
            isActive: true
          });
          assignments.push(assignment);
        } catch (err) {
          errors.push({
            productId,
            affiliateId,
            error: err instanceof Error ? err.message : 'Unknown error'
          });
        }
      }
    }
    
    res.json({
      success: true,
      data: {
        totalAssignments: assignments.length,
        assignments,
        errors: errors.length > 0 ? errors : null
      },
      message: `Đã gán ${assignments.length} sản phẩm thành công${errors.length > 0 ? ` (${errors.length} lỗi)` : ''}`
    });
  } catch (error) {
    console.error('❌ Bulk Assign Products Error:', error);
    res.status(500).json({
      error: 'Failed to bulk assign products',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 📋 Get Product Assignments
router.get('/product-assignments', async (req: Request, res: Response) => {
  try {
    const { affiliateId, productId, isPremium, status } = req.query;
    
    const filters: any = {};
    if (affiliateId) filters.affiliateId = affiliateId as string;
    if (productId) filters.productId = productId as string;
    if (isPremium !== undefined) filters.isPremium = isPremium === 'true';
    if (status) filters.status = status as string;
    
    const assignments = await storage.getAffiliateProductAssignments(filters);
    
    res.json({
      success: true,
      data: assignments,
      total: assignments.length
    });
  } catch (error) {
    console.error('❌ Get Product Assignments Error:', error);
    res.status(500).json({
      error: 'Failed to fetch product assignments',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 🗑️ Delete Product Assignment
router.delete('/product-assignments/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const deleted = await storage.deleteAffiliateProductAssignment(id);
    
    if (!deleted) {
      return res.status(404).json({
        error: 'Assignment not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Đã xóa gán sản phẩm'
    });
  } catch (error) {
    console.error('❌ Delete Product Assignment Error:', error);
    res.status(500).json({
      error: 'Failed to delete product assignment',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 📋 Get All Product Requests (Admin)
router.get('/product-requests', async (req: Request, res: Response) => {
  try {
    const { status, affiliateId, limit, offset } = req.query;
    
    const filters: any = {};
    if (status) filters.status = status as string;
    if (affiliateId) filters.affiliateId = affiliateId as string;
    if (limit) filters.limit = parseInt(limit as string);
    if (offset) filters.offset = parseInt(offset as string);
    
    const requests = await storage.getAllAffiliateProductRequests(filters);
    
    res.json({
      success: true,
      data: requests,
      total: requests.length
    });
  } catch (error) {
    console.error('❌ Get Product Requests Error:', error);
    res.status(500).json({
      error: 'Failed to fetch product requests',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ✅ Approve Product Request
router.put('/product-requests/:id/approve', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { productId, commissionRate, isPremium } = req.body;
    
    const request = await storage.getAffiliateProductRequest(id);
    if (!request) {
      return res.status(404).json({
        error: 'Product request not found'
      });
    }
    
    if (!productId) {
      return res.status(400).json({
        error: 'productId is required to approve request'
      });
    }
    
    await storage.updateAffiliateProductRequest(id, {
      status: 'approved'
    });
    
    const assignment = await storage.createAffiliateProductAssignment({
      affiliateId: request.affiliateId,
      productId,
      assignmentType: 'admin_approval',
      commissionRate: commissionRate || '10',
      isPremium: isPremium || false,
      status: 'active'
    });
    
    res.json({
      success: true,
      data: {
        request: { ...request, status: 'approved' },
        assignment
      },
      message: 'Đã duyệt yêu cầu và gán sản phẩm cho affiliate'
    });
  } catch (error) {
    console.error('❌ Approve Product Request Error:', error);
    res.status(500).json({
      error: 'Failed to approve product request',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ❌ Reject Product Request
router.put('/product-requests/:id/reject', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;
    
    const request = await storage.getAffiliateProductRequest(id);
    if (!request) {
      return res.status(404).json({
        error: 'Product request not found'
      });
    }
    
    const updated = await storage.updateAffiliateProductRequest(id, {
      status: 'rejected',
      adminNotes: rejectionReason || 'Không đủ điều kiện'
    });
    
    res.json({
      success: true,
      data: updated,
      message: 'Đã từ chối yêu cầu sản phẩm'
    });
  } catch (error) {
    console.error('❌ Reject Product Request Error:', error);
    res.status(500).json({
      error: 'Failed to reject product request',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export { router as affiliateManagementRouter };
