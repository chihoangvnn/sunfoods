import { Router } from 'express';
import bcrypt from 'bcrypt';
import { storage } from '../storage';
import type { InsertVendor } from '../../shared/schema';

const router = Router();

declare module 'express-session' {
  interface SessionData {
    vendorId?: string;
  }
}

// 📝 POST /api/vendor/auth/register - Vendor registration
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password, warehouseAddress, warehouseCity, warehouseDistrict, warehouseWard, bankInfo } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ error: 'Name, email, phone và password là bắt buộc' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password phải có ít nhất 8 ký tự' });
    }

    const existingVendor = await storage.getVendorByEmail(email);
    if (existingVendor) {
      return res.status(409).json({ error: 'Email đã được đăng ký' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newVendor: InsertVendor = {
      name,
      email,
      phone,
      password: hashedPassword,
      warehouseAddress,
      warehouseCity,
      warehouseDistrict,
      warehouseWard,
      bankInfo,
      status: 'pending'
    };

    const createdVendor = await storage.createVendor(newVendor);

    const { password: _, ...vendorInfo } = createdVendor;
    res.status(201).json(vendorInfo);
  } catch (error) {
    console.error('Vendor registration error:', error);
    res.status(500).json({ error: 'Lỗi đăng ký' });
  }
});

// 🔐 POST /api/vendor/auth/login - Vendor login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email và password là bắt buộc' });
    }

    const vendor = await storage.getVendorByEmail(email);

    if (!vendor) {
      return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng' });
    }

    if (vendor.status !== 'active') {
      const statusMessages = {
        pending: 'Tài khoản đang chờ phê duyệt từ quản trị viên',
        inactive: 'Tài khoản đã bị vô hiệu hóa',
        suspended: 'Tài khoản đã bị tạm ngưng'
      };
      return res.status(403).json({ 
        error: statusMessages[vendor.status as keyof typeof statusMessages] || 'Tài khoản không khả dụng' 
      });
    }

    const isPasswordValid = await bcrypt.compare(password, vendor.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng' });
    }

    await storage.updateVendorLastLogin(vendor.id);

    req.session.vendorId = vendor.id;

    const { password: _, ...vendorInfo } = vendor;
    res.json({
      success: true,
      vendor: {
        ...vendorInfo,
        lastLoginAt: new Date()
      }
    });
  } catch (error) {
    console.error('Vendor login error:', error);
    res.status(500).json({ error: 'Lỗi đăng nhập' });
  }
});

// 👤 GET /api/vendor/auth/me - Get current vendor info
router.get('/me', async (req, res) => {
  try {
    const vendorId = req.session.vendorId;

    if (!vendorId) {
      return res.status(401).json({ error: 'Chưa đăng nhập' });
    }

    const vendor = await storage.getVendorById(vendorId);

    if (!vendor) {
      req.session.destroy(() => {});
      return res.status(401).json({ error: 'Session không hợp lệ' });
    }

    if (vendor.status !== 'active') {
      req.session.destroy(() => {});
      return res.status(403).json({ error: 'Tài khoản không khả dụng' });
    }

    const { password: _, ...vendorInfo } = vendor;
    res.json(vendorInfo);
  } catch (error) {
    console.error('Get vendor info error:', error);
    res.status(500).json({ error: 'Lỗi lấy thông tin vendor' });
  }
});

// 🚪 POST /api/vendor/auth/logout - Vendor logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ error: 'Lỗi đăng xuất' });
    }
    res.clearCookie('vendor.session');
    res.json({ success: true, message: 'Đăng xuất thành công' });
  });
});

export default router;
