import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';

declare module 'express-session' {
  interface SessionData {
    userId?: string;
  }
}

declare global {
  namespace Express {
    interface Request {
      customer?: {
        id: string;
        name: string;
        email: string | null;
        phone: string | null;
      };
    }
  }
}

export async function requireCustomerAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const customerId = req.session.userId;

    if (!customerId) {
      res.status(401).json({ error: 'Chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.' });
      return;
    }

    const customer = await storage.getCustomer(customerId);

    if (!customer) {
      req.session.destroy(() => {});
      res.status(401).json({ error: 'Session không hợp lệ' });
      return;
    }

    if (customer.status !== 'active') {
      res.status(403).json({ error: 'Tài khoản đã bị vô hiệu hóa' });
      return;
    }

    req.customer = {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
    };
    
    next();
  } catch (error) {
    console.error('Customer auth middleware error:', error);
    res.status(500).json({ error: 'Lỗi xác thực' });
  }
}
