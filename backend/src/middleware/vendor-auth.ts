import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';
import type { Vendor } from '../../shared/schema';

declare global {
  namespace Express {
    interface Request {
      vendor?: Vendor;
    }
  }
}

export async function requireVendorAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const vendorId = req.session.vendorId;

    if (!vendorId) {
      res.status(401).json({ error: 'Chưa đăng nhập' });
      return;
    }

    const vendor = await storage.getVendorById(vendorId);

    if (!vendor) {
      req.session.destroy(() => {});
      res.status(401).json({ error: 'Session không hợp lệ' });
      return;
    }

    if (vendor.status !== 'active') {
      const statusMessages = {
        pending: 'Tài khoản đang chờ phê duyệt',
        inactive: 'Tài khoản đã bị vô hiệu hóa',
        suspended: 'Tài khoản đã bị tạm ngưng'
      };
      res.status(403).json({ 
        error: statusMessages[vendor.status as keyof typeof statusMessages] || 'Tài khoản không khả dụng' 
      });
      return;
    }

    req.vendor = vendor;
    next();
  } catch (error) {
    console.error('Vendor auth middleware error:', error);
    res.status(500).json({ error: 'Lỗi xác thực' });
  }
}
