import { Router } from "express";
import { DatabaseStorage } from "../storage";
import { normalizePhone, isValidVietnamesePhone } from "../../shared/phoneUtils";

const router = Router();
const storage = new DatabaseStorage();

/**
 * POST /api/bot/customer/find-or-create
 * Tìm hoặc tạo customer từ số điện thoại
 * Bot sử dụng API này để tạo/tìm customer khi có phone number
 */
router.post("/find-or-create", async (req, res) => {
  try {
    const { phone, name } = req.body;

    if (!phone) {
      return res.status(400).json({ error: "Phone number is required" });
    }

    // Normalize phone number - loại bỏ mọi ký tự đặc biệt
    const normalizedPhone = normalizePhone(phone);

    if (!normalizedPhone || !isValidVietnamesePhone(normalizedPhone)) {
      return res.status(400).json({ 
        error: "Invalid Vietnamese phone number format",
        originalPhone: phone,
        normalizedPhone 
      });
    }

    // Tìm customer theo normalized phone
    const existingCustomer = await storage.getCustomerByPhone(normalizedPhone);

    if (existingCustomer) {
      return res.json({
        success: true,
        action: "found",
        customer: existingCustomer,
        normalizedPhone
      });
    }

    // Tạo mới customer với phone và name (nếu có)
    const customerName = name || `Khách ${normalizedPhone.slice(-4)}`; // Default: "Khách 3123"

    const newCustomer = await storage.createCustomer({
      phone: normalizedPhone,
      name: customerName,
      registrationSource: "bot",
      profileStatus: "incomplete", // Bot-created profiles start as incomplete
      email: null, // Bot sẽ update sau khi hỏi được
    });

    res.status(201).json({
      success: true,
      action: "created",
      customer: newCustomer,
      normalizedPhone
    });
  } catch (error) {
    console.error("Error in bot/customer/find-or-create:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * PUT /api/bot/customer/auto-update/:phone
 * Bot tự động update customer khi hỏi được thông tin mới
 * Mỗi field bot hỏi được sẽ tự động cập nhật vào customer
 */
router.put("/auto-update/:phone", async (req, res) => {
  try {
    const { phone } = req.params;
    const updates = req.body;

    // Normalize phone
    const normalizedPhone = normalizePhone(phone);

    if (!normalizedPhone || !isValidVietnamesePhone(normalizedPhone)) {
      return res.status(400).json({ 
        error: "Invalid Vietnamese phone number format",
        originalPhone: phone,
        normalizedPhone 
      });
    }

    // Tìm customer
    const existingCustomer = await storage.getCustomerByPhone(normalizedPhone);

    if (!existingCustomer) {
      return res.status(404).json({ 
        error: "Customer not found",
        phone: normalizedPhone 
      });
    }

    // Build update object - chỉ update các field được gửi lên
    const updateData: Record<string, any> = {};

    // Các field cơ bản
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.email !== undefined) updateData.email = updates.email;
    if (updates.avatar !== undefined) updateData.avatar = updates.avatar;
    if (updates.status !== undefined) updateData.status = updates.status;

    // Membership data
    if (updates.birthdayMonth !== undefined) {
      updateData.membershipData = {
        ...existingCustomer.membershipData as any,
        birthdayMonth: updates.birthdayMonth
      };
    }

    if (updates.allowMarketing !== undefined) {
      updateData.limitsData = {
        ...existingCustomer.limitsData as any,
        allowMarketing: updates.allowMarketing
      };
    }

    // Preferences
    if (updates.preferredDiscountType !== undefined) {
      updateData.membershipData = {
        ...updateData.membershipData || existingCustomer.membershipData as any,
        preferredDiscountType: updates.preferredDiscountType
      };
    }

    // Social data
    if (updates.facebookId || updates.instagramId || updates.tiktokId) {
      updateData.socialData = {
        ...existingCustomer.socialData as any,
        ...(updates.facebookId && { facebookId: updates.facebookId }),
        ...(updates.instagramId && { instagramId: updates.instagramId }),
        ...(updates.tiktokId && { tiktokId: updates.tiktokId })
      };
    }

    // Nếu không có gì để update
    if (Object.keys(updateData).length === 0) {
      return res.json({
        success: true,
        message: "No updates provided",
        customer: existingCustomer
      });
    }

    // Update customer
    const updatedCustomer = await storage.updateCustomer(existingCustomer.id, updateData);

    res.json({
      success: true,
      action: "updated",
      customer: updatedCustomer,
      updatedFields: Object.keys(updateData)
    });
  } catch (error) {
    console.error("Error in bot/customer/auto-update:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/bot/customer/:phone
 * Lấy thông tin customer theo phone (sau khi normalize)
 */
router.get("/:phone", async (req, res) => {
  try {
    const { phone } = req.params;

    const normalizedPhone = normalizePhone(phone);

    if (!normalizedPhone || !isValidVietnamesePhone(normalizedPhone)) {
      return res.status(400).json({ 
        error: "Invalid Vietnamese phone number format",
        originalPhone: phone,
        normalizedPhone 
      });
    }

    const customer = await storage.getCustomerByPhone(normalizedPhone);

    if (!customer) {
      return res.status(404).json({ 
        error: "Customer not found",
        phone: normalizedPhone 
      });
    }

    res.json({
      success: true,
      customer,
      normalizedPhone
    });
  } catch (error) {
    console.error("Error in bot/customer/:phone:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
