import { Request, Response, Router } from 'express';
import { storage } from '../storage';

const router = Router();

const requireAdminAuth = (req: any, res: any, next: any) => {
  if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
    next();
    return;
  }

  if (!req.session || !(req.session as any).userId) {
    return res.status(401).json({ 
      error: "Unauthorized. Admin access required.",
      code: "AUTH_REQUIRED"
    });
  }
  next();
};

router.get('/dashboard', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const stats = await storage.getVIPDashboardStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('❌ VIP Dashboard Error:', error);
    res.status(500).json({
      error: 'Failed to fetch VIP dashboard stats',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.get('/members', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const { status, membershipTier, limit, offset } = req.query;
    
    const filters: any = {};
    if (status) filters.status = status as string;
    if (membershipTier) filters.membershipTier = membershipTier as string;
    if (limit) filters.limit = parseInt(limit as string);
    if (offset) filters.offset = parseInt(offset as string);
    
    const members = await storage.getVIPMembers(filters);
    
    res.json({
      success: true,
      data: members
    });
  } catch (error) {
    console.error('❌ Get VIP Members Error:', error);
    res.status(500).json({
      error: 'Failed to fetch VIP members',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.get('/vip-products', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const products = await storage.getVIPProducts();
    
    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('❌ Get VIP Products Error:', error);
    res.status(500).json({
      error: 'Failed to fetch VIP products',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.post('/approve/:customerId', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const { customerId } = req.params;
    const { membershipTier } = req.body;
    
    const updated = await storage.approvePendingVIP(customerId, membershipTier);
    
    if (!updated) {
      return res.status(404).json({
        error: 'Customer not found'
      });
    }
    
    res.json({
      success: true,
      data: updated,
      message: 'VIP đã được duyệt thành công'
    });
  } catch (error) {
    console.error('❌ Approve VIP Error:', error);
    res.status(500).json({
      error: 'Failed to approve VIP',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.post('/reject/:customerId', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const { customerId } = req.params;
    const { reason } = req.body;
    
    const updated = await storage.rejectVIPApplication(customerId, reason);
    
    if (!updated) {
      return res.status(404).json({
        error: 'Customer not found'
      });
    }
    
    res.json({
      success: true,
      data: updated,
      message: 'Đơn VIP đã bị từ chối'
    });
  } catch (error) {
    console.error('❌ Reject VIP Error:', error);
    res.status(500).json({
      error: 'Failed to reject VIP application',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.put('/toggle-status/:customerId', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const { customerId } = req.params;
    const { status } = req.body;
    
    if (!['active', 'suspended'].includes(status)) {
      return res.status(400).json({
        error: 'Invalid status',
        message: 'Status must be "active" or "suspended"'
      });
    }
    
    const updated = await storage.toggleVIPStatus(customerId, status);
    
    if (!updated) {
      return res.status(404).json({
        error: 'VIP member not found'
      });
    }
    
    res.json({
      success: true,
      data: updated,
      message: status === 'active' ? 'VIP đã được kích hoạt' : 'VIP đã bị tạm ngưng'
    });
  } catch (error) {
    console.error('❌ Toggle VIP Status Error:', error);
    res.status(500).json({
      error: 'Failed to toggle VIP status',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.post('/bulk-assign-category', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const { categoryId, isVipOnly, requiredVipTier } = req.body;
    
    if (!categoryId) {
      return res.status(400).json({
        error: 'Category ID is required'
      });
    }
    
    const result = await storage.bulkAssignVIPByCategory(categoryId, isVipOnly, requiredVipTier);
    
    res.json({
      success: true,
      data: result,
      message: `Đã cập nhật ${result.updatedCount} sản phẩm VIP`
    });
  } catch (error) {
    console.error('❌ Bulk Assign VIP Category Error:', error);
    res.status(500).json({
      error: 'Failed to bulk assign VIP settings',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export { router as vipManagementRouter };
