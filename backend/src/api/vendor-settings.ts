import { Router } from 'express';
import { requireVendorAuth } from '../middleware/vendor-auth';
import { db } from '../db';
import { vendors } from '@shared/schema';
import { z } from 'zod';
import { eq } from 'drizzle-orm';

const router = Router();

// Vietnamese phone validation regex
const vietnamesePhoneRegex = /^(0|\+84|84)[0-9]{9,10}$/;

// Zod schema for profile update
const profileUpdateSchema = z.object({
  name: z.string().min(2, 'Tên công ty phải có ít nhất 2 ký tự').max(100, 'Tên công ty không được vượt quá 100 ký tự').optional(),
  contactPerson: z.string().min(2, 'Tên người liên hệ phải có ít nhất 2 ký tự').max(100, 'Tên người liên hệ không được vượt quá 100 ký tự').optional(),
  email: z.string().email('Email không hợp lệ').optional(),
  phone: z.string().regex(vietnamesePhoneRegex, 'Số điện thoại không hợp lệ (10-11 số)').optional(),
  notes: z.string().max(500, 'Mô tả không được vượt quá 500 ký tự').optional(),
});

// Zod schema for warehouse update
const warehouseUpdateSchema = z.object({
  warehouseAddress: z.string().min(10, 'Địa chỉ phải có ít nhất 10 ký tự').max(200, 'Địa chỉ không được vượt quá 200 ký tự').optional(),
  warehouseCity: z.string().min(2, 'Tên thành phố phải có ít nhất 2 ký tự').max(100, 'Tên thành phố không được vượt quá 100 ký tự').optional(),
  warehouseDistrict: z.string().min(2, 'Tên quận/huyện phải có ít nhất 2 ký tự').max(100, 'Tên quận/huyện không được vượt quá 100 ký tự').optional(),
  warehouseWard: z.string().min(2, 'Tên phường/xã phải có ít nhất 2 ký tự').max(100, 'Tên phường/xã không được vượt quá 100 ký tự').optional(),
  warehousePostalCode: z.string().min(5, 'Mã bưu điện phải có ít nhất 5 ký tự').max(10, 'Mã bưu điện không được vượt quá 10 ký tự').optional(),
  warehousePhone: z.string().regex(vietnamesePhoneRegex, 'Số điện thoại không hợp lệ (10-11 số)').optional(),
});

// Zod schema for payment settings update
const paymentSettingsUpdateSchema = z.object({
  bankName: z.string().min(2, 'Tên ngân hàng phải có ít nhất 2 ký tự').max(100, 'Tên ngân hàng không được vượt quá 100 ký tự').optional(),
  bankAccountNumber: z.string().min(6, 'Số tài khoản phải có ít nhất 6 số').max(20, 'Số tài khoản không được vượt quá 20 số').optional(),
  bankAccountName: z.string().min(2, 'Tên chủ tài khoản phải có ít nhất 2 ký tự').max(100, 'Tên chủ tài khoản không được vượt quá 100 ký tự').optional(),
  paypalEmail: z.string().email('Email PayPal không hợp lệ').optional(),
});

// Zod schema for notification settings update
const notificationSettingsUpdateSchema = z.object({
  emailNotifications: z.boolean().optional(),
  smsNotifications: z.boolean().optional(),
  orderAlerts: z.boolean().optional(),
  lowStockAlerts: z.boolean().optional(),
  newConsignmentAlerts: z.boolean().optional(),
  paymentAlerts: z.boolean().optional(),
});

// GET /api/vendor/settings - Get all vendor settings
router.get('/settings', requireVendorAuth, async (req, res) => {
  try {
    const vendorId = req.vendor!.id;

    const [vendor] = await db
      .select()
      .from(vendors)
      .where(eq(vendors.id, vendorId))
      .limit(1);

    if (!vendor) {
      return res.status(404).json({ error: 'Không tìm thấy nhà cung cấp' });
    }

    // Parse notification preferences
    const notificationPrefs = vendor.notificationPreferences || {};

    return res.json({
      profile: {
        id: vendor.id,
        companyName: vendor.name,
        contactName: vendor.contactPerson,
        contactEmail: vendor.email,
        contactPhone: vendor.phone,
        description: vendor.notes,
        status: vendor.status,
      },
      warehouse: {
        address: vendor.warehouseAddress,
        city: vendor.warehouseCity,
        district: vendor.warehouseDistrict,
        ward: vendor.warehouseWard,
        postalCode: vendor.warehousePostalCode,
        phone: vendor.warehousePhone,
      },
      paymentSettings: {
        bankName: vendor.bankInfo?.bankName,
        bankAccountNumber: vendor.bankInfo?.bankAccountNumber,
        bankAccountName: vendor.bankInfo?.bankAccountName,
        paypalEmail: vendor.bankInfo?.paypalEmail,
      },
      notificationSettings: {
        emailNotifications: notificationPrefs.emailNotifications || false,
        smsNotifications: notificationPrefs.smsNotifications || false,
        orderAlerts: notificationPrefs.orderAlerts || false,
        lowStockAlerts: notificationPrefs.lowStockAlerts || false,
        newConsignmentAlerts: notificationPrefs.newConsignmentAlerts || false,
        paymentAlerts: notificationPrefs.paymentAlerts || false,
      },
    });
  } catch (error) {
    console.error('Error fetching vendor settings:', error);
    return res.status(500).json({ error: 'Lỗi khi lấy thông tin cài đặt' });
  }
});

// PUT /api/vendor/profile - Update vendor profile
router.put('/profile', requireVendorAuth, async (req, res) => {
  try {
    const vendorId = req.vendor!.id;

    // Validate request body
    const validation = profileUpdateSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        error: 'Dữ liệu không hợp lệ', 
        details: validation.error.errors.map(e => e.message).join(', ') 
      });
    }

    const updateData = validation.data;

    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'Không có dữ liệu để cập nhật' });
    }

    // Update vendor profile
    const [updatedVendor] = await db
      .update(vendors)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(vendors.id, vendorId))
      .returning();

    if (!updatedVendor) {
      return res.status(404).json({ error: 'Không tìm thấy nhà cung cấp' });
    }

    return res.json({
      profile: {
        id: updatedVendor.id,
        companyName: updatedVendor.name,
        contactName: updatedVendor.contactPerson,
        contactEmail: updatedVendor.email,
        contactPhone: updatedVendor.phone,
        description: updatedVendor.notes,
        status: updatedVendor.status,
      },
    });
  } catch (error: any) {
    console.error('Error updating vendor profile:', error);
    
    // Check for unique constraint violation
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Email đã được sử dụng' });
    }
    
    return res.status(500).json({ error: 'Lỗi khi cập nhật thông tin' });
  }
});

// PUT /api/vendor/warehouse - Update warehouse info
router.put('/warehouse', requireVendorAuth, async (req, res) => {
  try {
    const vendorId = req.vendor!.id;

    // Validate request body
    const validation = warehouseUpdateSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        error: 'Dữ liệu không hợp lệ', 
        details: validation.error.errors.map(e => e.message).join(', ') 
      });
    }

    const updateData = validation.data;

    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'Không có dữ liệu để cập nhật' });
    }

    // Update warehouse info
    const [updatedVendor] = await db
      .update(vendors)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(vendors.id, vendorId))
      .returning();

    if (!updatedVendor) {
      return res.status(404).json({ error: 'Không tìm thấy nhà cung cấp' });
    }

    return res.json({
      warehouse: {
        address: updatedVendor.warehouseAddress,
        city: updatedVendor.warehouseCity,
        district: updatedVendor.warehouseDistrict,
        ward: updatedVendor.warehouseWard,
        postalCode: updatedVendor.warehousePostalCode,
        phone: updatedVendor.warehousePhone,
      },
    });
  } catch (error) {
    console.error('Error updating warehouse info:', error);
    return res.status(500).json({ error: 'Lỗi khi cập nhật thông tin kho' });
  }
});

// PUT /api/vendor/payment-settings - Update payment settings
router.put('/payment-settings', requireVendorAuth, async (req, res) => {
  try {
    const vendorId = req.vendor!.id;

    // Validate request body
    const validation = paymentSettingsUpdateSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        error: 'Dữ liệu không hợp lệ', 
        details: validation.error.errors.map(e => e.message).join(', ') 
      });
    }

    const { bankName, bankAccountNumber, bankAccountName, paypalEmail } = validation.data;

    // Check if there's anything to update
    if (!bankName && !bankAccountNumber && !bankAccountName && !paypalEmail) {
      return res.status(400).json({ error: 'Không có dữ liệu để cập nhật' });
    }

    // Get current vendor to merge bankInfo
    const [currentVendor] = await db
      .select()
      .from(vendors)
      .where(eq(vendors.id, vendorId))
      .limit(1);

    if (!currentVendor) {
      return res.status(404).json({ error: 'Không tìm thấy nhà cung cấp' });
    }

    // Merge new bank info with existing
    const updatedBankInfo = {
      ...(currentVendor.bankInfo || {}),
      ...(bankName && { bankName }),
      ...(bankAccountNumber && { bankAccountNumber }),
      ...(bankAccountName && { bankAccountName }),
      ...(paypalEmail && { paypalEmail }),
    };

    // Update payment settings
    const [updatedVendor] = await db
      .update(vendors)
      .set({
        bankInfo: updatedBankInfo,
        updatedAt: new Date(),
      })
      .where(eq(vendors.id, vendorId))
      .returning();

    if (!updatedVendor) {
      return res.status(404).json({ error: 'Không tìm thấy nhà cung cấp' });
    }

    return res.json({
      paymentSettings: {
        bankName: updatedVendor.bankInfo?.bankName,
        bankAccountNumber: updatedVendor.bankInfo?.bankAccountNumber,
        bankAccountName: updatedVendor.bankInfo?.bankAccountName,
        paypalEmail: updatedVendor.bankInfo?.paypalEmail,
      },
    });
  } catch (error) {
    console.error('Error updating payment settings:', error);
    return res.status(500).json({ error: 'Lỗi khi cập nhật thông tin thanh toán' });
  }
});

// PUT /api/vendor/notifications - Update notification settings
router.put('/notifications', requireVendorAuth, async (req, res) => {
  try {
    const vendorId = req.vendor!.id;

    // Validate request body
    const validation = notificationSettingsUpdateSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        error: 'Dữ liệu không hợp lệ', 
        details: validation.error.errors.map(e => e.message).join(', ') 
      });
    }

    const updateData = validation.data;

    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'Không có dữ liệu để cập nhật' });
    }

    // Get current vendor to merge notification preferences
    const [currentVendor] = await db
      .select()
      .from(vendors)
      .where(eq(vendors.id, vendorId))
      .limit(1);

    if (!currentVendor) {
      return res.status(404).json({ error: 'Không tìm thấy nhà cung cấp' });
    }

    // Merge new notification preferences with existing
    const updatedNotificationPrefs = {
      ...(currentVendor.notificationPreferences || {}),
      ...updateData,
    };

    // Update notification settings
    const [updatedVendor] = await db
      .update(vendors)
      .set({
        notificationPreferences: updatedNotificationPrefs,
        updatedAt: new Date(),
      })
      .where(eq(vendors.id, vendorId))
      .returning();

    if (!updatedVendor) {
      return res.status(404).json({ error: 'Không tìm thấy nhà cung cấp' });
    }

    const notificationPrefs = updatedVendor.notificationPreferences || {};

    return res.json({
      notificationSettings: {
        emailNotifications: notificationPrefs.emailNotifications || false,
        smsNotifications: notificationPrefs.smsNotifications || false,
        orderAlerts: notificationPrefs.orderAlerts || false,
        lowStockAlerts: notificationPrefs.lowStockAlerts || false,
        newConsignmentAlerts: notificationPrefs.newConsignmentAlerts || false,
        paymentAlerts: notificationPrefs.paymentAlerts || false,
      },
    });
  } catch (error) {
    console.error('Error updating notification settings:', error);
    return res.status(500).json({ error: 'Lỗi khi cập nhật cài đặt thông báo' });
  }
});

export default router;
