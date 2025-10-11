import type { Request, Response, NextFunction } from 'express';

declare module 'express-session' {
  interface SessionData {
    adminId?: string;
    adminRole?: 'superadmin' | 'admin' | 'staff' | 'cashier';
  }
}

export const requirePOSAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
    return next();
  }
  
  if (!req.session || !req.session.adminId) {
    return res.status(401).json({ 
      error: "Authentication required", 
      message: "Please log in to access POS" 
    });
  }
  
  const allowedRoles = ['cashier', 'staff', 'admin', 'superadmin'];
  if (!req.session.adminRole || !allowedRoles.includes(req.session.adminRole)) {
    return res.status(403).json({ 
      error: "POS access denied", 
      message: "Only cashiers and staff can access POS" 
    });
  }
  
  next();
};
