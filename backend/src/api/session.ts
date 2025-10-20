// @ts-nocheck
import express, { Request, Response } from "express";
import { db } from "../db";
import { customers } from "../../shared/schema";
import { eq, or } from "drizzle-orm";

const router = express.Router();

// Mock user credentials for testing
const MOCK_USER = {
  email: 'test@sunfoods.vn',
  password: 'password123'
};

// POST /api/session/login - Create session and return customer data
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        error: "Email và mật khẩu là bắt buộc",
        code: "MISSING_CREDENTIALS"
      });
    }

    // Validate credentials (mock authentication)
    if (email !== MOCK_USER.email || password !== MOCK_USER.password) {
      return res.status(401).json({ 
        error: "Email hoặc mật khẩu không đúng",
        code: "INVALID_CREDENTIALS"
      });
    }

    // Find or create customer for this email
    let customer = await db
      .select()
      .from(customers)
      .where(eq(customers.email, email))
      .limit(1);

    if (!customer || customer.length === 0) {
      // Create new customer if doesn't exist
      const [newCustomer] = await db
        .insert(customers)
        .values({
          email: email,
          name: 'Nguyễn Văn Test',
          phone: '0912345678',
          avatar: 'https://ui-avatars.com/api/?name=Nguyen+Van+Test&background=1F7A4D&color=fff&size=200',
          membershipTier: 'gold',
          pointsBalance: 2500,
          status: 'active',
          profileStatus: 'complete',
          registrationSource: 'web'
        })
        .returning();
      
      customer = [newCustomer];
    }

    const customerData = customer[0];

    // Set session
    req.session.customerId = customerData.id;

    // Return customer data (without password)
    res.json({
      success: true,
      customer: {
        id: customerData.id,
        email: customerData.email,
        name: customerData.name,
        phone: customerData.phone,
        avatar: customerData.avatar,
        membershipTier: customerData.membershipTier || 'bronze',
        points: customerData.pointsBalance || 0,
        joinDate: customerData.joinDate,
        status: customerData.status,
        address: customerData.address,
        address2: customerData.address2,
      }
    });
  } catch (error: any) {
    console.error("Login error:", error);
    res.status(500).json({ 
      error: "Đăng nhập thất bại. Vui lòng thử lại.",
      code: "LOGIN_FAILED"
    });
  }
});

// POST /api/session/logout - Destroy session
router.post("/logout", async (req: Request, res: Response) => {
  try {
    if (req.session) {
      // Clear customerId first
      delete req.session.customerId;
      
      // Destroy session
      req.session.destroy((err) => {
        if (err) {
          console.error("Session destruction error:", err);
          return res.status(500).json({ 
            error: "Đăng xuất thất bại",
            code: "LOGOUT_FAILED"
          });
        }
        
        res.json({ 
          success: true,
          message: "Đăng xuất thành công"
        });
      });
    } else {
      res.json({ 
        success: true,
        message: "Đã đăng xuất"
      });
    }
  } catch (error: any) {
    console.error("Logout error:", error);
    res.status(500).json({ 
      error: "Đăng xuất thất bại",
      code: "LOGOUT_FAILED"
    });
  }
});

// GET /api/session/status - Check session and return customer data
router.get("/status", async (req: Request, res: Response) => {
  try {
    const customerId = req.session?.customerId;

    if (!customerId) {
      return res.json({ 
        authenticated: false,
        customer: null
      });
    }

    // Fetch customer from database
    const customer = await db
      .select()
      .from(customers)
      .where(eq(customers.id, customerId))
      .limit(1);

    if (!customer || customer.length === 0) {
      // Session exists but customer not found - clear session
      delete req.session.customerId;
      return res.json({ 
        authenticated: false,
        customer: null
      });
    }

    const customerData = customer[0];

    res.json({
      authenticated: true,
      customer: {
        id: customerData.id,
        email: customerData.email,
        name: customerData.name,
        phone: customerData.phone,
        avatar: customerData.avatar,
        membershipTier: customerData.membershipTier || 'bronze',
        points: customerData.pointsBalance || 0,
        joinDate: customerData.joinDate,
        status: customerData.status,
        address: customerData.address,
        address2: customerData.address2,
      }
    });
  } catch (error: any) {
    console.error("Session status error:", error);
    res.status(500).json({ 
      error: "Không thể kiểm tra trạng thái đăng nhập",
      code: "STATUS_CHECK_FAILED"
    });
  }
});

export default router;
