// @ts-nocheck
import { Router } from 'express';
import bcrypt from 'bcrypt';
import { storage } from '../storage';
import type { InsertAdmin } from '../../shared/schema';

const router = Router();

// Extend Express Request type to include admin session
declare module 'express-session' {
  interface SessionData {
    adminId?: string;
    adminRole?: 'superadmin' | 'admin' | 'staff' | 'cashier';
  }
}

// 🔐 POST /api/admin/login - Admin login with email + password
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email và password là bắt buộc' });
    }

    // Get admin by email
    const admin = await storage.getAdminByEmail(email);

    if (!admin) {
      return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng' });
    }

    // Check if admin is active
    if (!admin.isActive) {
      return res.status(403).json({ error: 'Tài khoản đã bị vô hiệu hóa' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng' });
    }

    // Update last login time
    await storage.updateAdminLastLogin(admin.id);

    // Store admin info in session
    req.session.adminId = admin.id;
    req.session.adminRole = admin.role;

    // Return admin info (without password)
    const { password: _, ...adminInfo } = admin;
    res.json({
      success: true,
      admin: {
        ...adminInfo,
        lastLoginAt: new Date()
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Lỗi đăng nhập' });
  }
});

// 🚪 POST /api/admin/logout - Admin logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ error: 'Lỗi đăng xuất' });
    }
    res.clearCookie('admin.session');
    res.json({ success: true, message: 'Đăng xuất thành công' });
  });
});

// 👤 GET /api/admin/me - Get current admin info
router.get('/me', async (req, res) => {
  try {
    const adminId = req.session.adminId;

    if (!adminId) {
      return res.status(401).json({ error: 'Chưa đăng nhập' });
    }

    const admin = await storage.getAdminById(adminId);

    if (!admin) {
      // Clear invalid session
      req.session.destroy(() => {});
      return res.status(401).json({ error: 'Session không hợp lệ' });
    }

    if (!admin.isActive) {
      req.session.destroy(() => {});
      return res.status(403).json({ error: 'Tài khoản đã bị vô hiệu hóa' });
    }

    // Return admin info (without password)
    const { password: _, ...adminInfo } = admin;
    res.json(adminInfo);
  } catch (error) {
    console.error('Get admin info error:', error);
    res.status(500).json({ error: 'Lỗi lấy thông tin admin' });
  }
});

// ➕ POST /api/admin/create - Create new admin (SuperAdmin only)
router.post('/create', async (req, res) => {
  try {
    const currentAdminId = req.session.adminId;
    const currentAdminRole = req.session.adminRole;

    // Check authentication
    if (!currentAdminId || !currentAdminRole) {
      return res.status(401).json({ error: 'Chưa đăng nhập' });
    }

    // Only superadmin can create new admins
    if (currentAdminRole !== 'superadmin') {
      return res.status(403).json({ error: 'Chỉ Super Admin mới có quyền tạo tài khoản' });
    }

    const { email, password, name, role } = req.body;

    // Validate input
    if (!email || !password || !name || !role) {
      return res.status(400).json({ error: 'Email, password, name và role là bắt buộc' });
    }

    if (!['superadmin', 'admin', 'staff'].includes(role)) {
      return res.status(400).json({ error: 'Role không hợp lệ' });
    }

    // Check if email already exists
    const existingAdmin = await storage.getAdminByEmail(email);
    if (existingAdmin) {
      return res.status(409).json({ error: 'Email đã tồn tại' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin
    const newAdmin: InsertAdmin = {
      email,
      password: hashedPassword,
      name,
      role,
      isActive: true
    };

    const createdAdmin = await storage.createAdmin(newAdmin);

    // Return created admin (without password)
    const { password: _, ...adminInfo } = createdAdmin;
    res.status(201).json(adminInfo);
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({ error: 'Lỗi tạo admin' });
  }
});

// 📋 GET /api/admin/list - Get all admins (SuperAdmin only)
router.get('/list', async (req, res) => {
  try {
    const currentAdminRole = req.session.adminRole;

    if (!currentAdminRole) {
      return res.status(401).json({ error: 'Chưa đăng nhập' });
    }

    // Only superadmin can list all admins
    if (currentAdminRole !== 'superadmin') {
      return res.status(403).json({ error: 'Chỉ Super Admin mới có quyền xem danh sách admin' });
    }

    const admins = await storage.getAdmins();

    // Remove passwords from response
    const adminsWithoutPasswords = admins.map(({ password: _, ...admin }) => admin);

    res.json(adminsWithoutPasswords);
  } catch (error) {
    console.error('List admins error:', error);
    res.status(500).json({ error: 'Lỗi lấy danh sách admin' });
  }
});

// 🔄 PUT /api/admin/:id - Update admin (SuperAdmin only)
router.put('/:id', async (req, res) => {
  try {
    const currentAdminRole = req.session.adminRole;

    if (!currentAdminRole) {
      return res.status(401).json({ error: 'Chưa đăng nhập' });
    }

    if (currentAdminRole !== 'superadmin') {
      return res.status(403).json({ error: 'Chỉ Super Admin mới có quyền cập nhật admin' });
    }

    const { id } = req.params;
    const { email, name, role, isActive, password } = req.body;

    const updateData: any = {};

    if (email) updateData.email = email;
    if (name) updateData.name = name;
    
    // Validate role if provided
    if (role) {
      if (!['superadmin', 'admin', 'staff'].includes(role)) {
        return res.status(400).json({ error: 'Role không hợp lệ. Chỉ được dùng: superadmin, admin, staff' });
      }
      updateData.role = role;
    }
    
    if (typeof isActive === 'boolean') updateData.isActive = isActive;
    
    // Hash new password if provided
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedAdmin = await storage.updateAdmin(id, updateData);

    if (!updatedAdmin) {
      return res.status(404).json({ error: 'Admin không tồn tại' });
    }

    const { password: _, ...adminInfo } = updatedAdmin;
    res.json(adminInfo);
  } catch (error) {
    console.error('Update admin error:', error);
    res.status(500).json({ error: 'Lỗi cập nhật admin' });
  }
});

// 🗑️ DELETE /api/admin/:id - Delete admin (SuperAdmin only)
router.delete('/:id', async (req, res) => {
  try {
    const currentAdminId = req.session.adminId;
    const currentAdminRole = req.session.adminRole;

    if (!currentAdminRole) {
      return res.status(401).json({ error: 'Chưa đăng nhập' });
    }

    if (currentAdminRole !== 'superadmin') {
      return res.status(403).json({ error: 'Chỉ Super Admin mới có quyền xóa admin' });
    }

    const { id } = req.params;

    // Prevent deleting yourself
    if (id === currentAdminId) {
      return res.status(400).json({ error: 'Không thể xóa tài khoản của chính bạn' });
    }

    const success = await storage.deleteAdmin(id);

    if (!success) {
      return res.status(404).json({ error: 'Admin không tồn tại' });
    }

    res.json({ success: true, message: 'Xóa admin thành công' });
  } catch (error) {
    console.error('Delete admin error:', error);
    res.status(500).json({ error: 'Lỗi xóa admin' });
  }
});

export default router;
