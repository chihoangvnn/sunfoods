import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';
import type { Admins } from '../../shared/schema';

declare global {
  namespace Express {
    interface Request {
      admin?: Admins;
    }
  }
}

export async function requireAdminAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const adminId = req.session.adminId;

    if (!adminId) {
      res.status(401).json({ error: 'Chưa đăng nhập' });
      return;
    }

    const admin = await storage.getAdminById(adminId);

    if (!admin) {
      req.session.destroy(() => {});
      res.status(401).json({ error: 'Session không hợp lệ' });
      return;
    }

    if (!admin.isActive) {
      res.status(403).json({ error: 'Tài khoản đã bị vô hiệu hóa' });
      return;
    }

    req.admin = admin;
    next();
  } catch (error) {
    console.error('Admin auth middleware error:', error);
    res.status(500).json({ error: 'Lỗi xác thực' });
  }
}
