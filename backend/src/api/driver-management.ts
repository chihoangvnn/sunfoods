import { Request, Response, Router } from 'express';
import { storage } from '../storage';

const router = Router();

router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const stats = await storage.getDriverDashboardStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('❌ Driver Dashboard Error:', error);
    res.status(500).json({
      error: 'Failed to fetch driver dashboard stats',
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
    
    const members = await storage.getDriverMembers(filters);
    
    res.json({
      success: true,
      data: members
    });
  } catch (error) {
    console.error('❌ Get Driver Members Error:', error);
    res.status(500).json({
      error: 'Failed to fetch driver members',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.post('/approve/:customerId', async (req: Request, res: Response) => {
  try {
    const { customerId } = req.params;
    
    const updated = await storage.approvePendingDriver(customerId);
    
    if (!updated) {
      return res.status(404).json({
        error: 'Customer not found'
      });
    }
    
    res.json({
      success: true,
      data: updated,
      message: 'Tài xế đã được duyệt thành công'
    });
  } catch (error) {
    console.error('❌ Approve Driver Error:', error);
    res.status(500).json({
      error: 'Failed to approve driver',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.post('/reject/:customerId', async (req: Request, res: Response) => {
  try {
    const { customerId } = req.params;
    const { reason } = req.body;
    
    const updated = await storage.rejectDriverApplication(customerId, reason);
    
    if (!updated) {
      return res.status(404).json({
        error: 'Customer not found'
      });
    }
    
    res.json({
      success: true,
      data: updated,
      message: 'Đơn tài xế đã bị từ chối'
    });
  } catch (error) {
    console.error('❌ Reject Driver Error:', error);
    res.status(500).json({
      error: 'Failed to reject driver application',
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
    
    const updated = await storage.toggleDriverStatus(customerId, status);
    
    if (!updated) {
      return res.status(404).json({
        error: 'Driver not found'
      });
    }
    
    res.json({
      success: true,
      data: updated,
      message: status === 'active' ? 'Tài xế đã được kích hoạt' : 'Tài xế đã bị tạm ngưng'
    });
  } catch (error) {
    console.error('❌ Toggle Driver Status Error:', error);
    res.status(500).json({
      error: 'Failed to toggle driver status',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export { router as driverManagementRouter };
