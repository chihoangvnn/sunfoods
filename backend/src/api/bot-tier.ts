import { Router } from "express";
import { DatabaseStorage } from "../storage";
import { calculateTier, MEMBERSHIP_TIERS } from "../services/membership-service";

const router = Router();
const storage = new DatabaseStorage();

/**
 * GET /api/bot/tier/status/:customerId
 * Lấy thông tin tier hiện tại + progress đến tier tiếp theo
 */
router.get("/status/:customerId", async (req, res) => {
  try {
    const { customerId } = req.params;

    const customer = await storage.getCustomer(customerId);
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    const totalSpent = parseFloat(customer.totalSpent || "0");
    const currentTier = calculateTier(totalSpent);
    
    // Tìm tier tiếp theo
    const currentTierIndex = MEMBERSHIP_TIERS.findIndex(t => t.key === currentTier.key);
    const nextTier = currentTierIndex < MEMBERSHIP_TIERS.length - 1 
      ? MEMBERSHIP_TIERS[currentTierIndex + 1] 
      : null;

    let progress = 100; // Default: đã đạt max tier
    let amountNeeded = 0;
    let progressPercent = 100;

    if (nextTier) {
      const currentThreshold = currentTier.requiredSpent;
      const nextThreshold = nextTier.requiredSpent;
      const rangeSpent = nextThreshold - currentThreshold;
      const customerProgress = totalSpent - currentThreshold;
      
      progressPercent = Math.floor((customerProgress / rangeSpent) * 100);
      amountNeeded = nextThreshold - totalSpent;
    }

    res.json({
      success: true,
      customer: {
        id: customer.id,
        name: customer.name,
        totalSpent,
        pointsBalance: customer.pointsBalance || 0
      },
      currentTier: {
        key: currentTier.key,
        name: currentTier.name,
        nameEn: currentTier.nameEn,
        color: currentTier.color,
        icon: currentTier.icon,
        benefits: currentTier.benefits,
        requiredSpent: currentTier.requiredSpent,
        pointsMultiplier: currentTier.pointsMultiplier
      },
      nextTier: nextTier ? {
        key: nextTier.key,
        name: nextTier.name,
        nameEn: nextTier.nameEn,
        requiredSpent: nextTier.requiredSpent,
        benefits: nextTier.benefits
      } : null,
      progress: {
        percent: progressPercent,
        amountNeeded,
        amountSpent: totalSpent,
        isMaxTier: !nextTier
      }
    });
  } catch (error) {
    console.error("Error in bot/tier/status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/bot/tier/check-upgrade/:customerId
 * Kiểm tra nếu customer gần đủ điều kiện lên tier (< 20% còn lại)
 */
router.get("/check-upgrade/:customerId", async (req, res) => {
  try {
    const { customerId } = req.params;

    const customer = await storage.getCustomer(customerId);
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    const totalSpent = parseFloat(customer.totalSpent || "0");
    const currentTier = calculateTier(totalSpent);
    
    const currentTierIndex = MEMBERSHIP_TIERS.findIndex(t => t.key === currentTier.key);
    const nextTier = currentTierIndex < MEMBERSHIP_TIERS.length - 1 
      ? MEMBERSHIP_TIERS[currentTierIndex + 1] 
      : null;

    if (!nextTier) {
      return res.json({
        canUpgrade: false,
        isMaxTier: true,
        message: `🎉 Bạn đã ở hạng ${currentTier.name} - Cao nhất rồi!`,
        currentTier: currentTier.name
      });
    }

    const amountNeeded = nextTier.requiredSpent - totalSpent;
    const threshold = nextTier.requiredSpent - currentTier.requiredSpent;
    const progressPercent = ((totalSpent - currentTier.requiredSpent) / threshold) * 100;

    // Nếu đã >= 80% thì bot sẽ nhắc
    const shouldNotify = progressPercent >= 80;

    if (shouldNotify) {
      // Format số tiền VND
      const amountText = new Intl.NumberFormat('vi-VN').format(amountNeeded);
      
      res.json({
        canUpgrade: true,
        shouldNotify: true,
        message: `🎯 Chỉ cần mua thêm ${amountText}đ là lên ${nextTier.name}! Nhận ngay ${nextTier.benefits[0]}`,
        currentTier: currentTier.name,
        nextTier: nextTier.name,
        amountNeeded,
        progressPercent: Math.floor(progressPercent),
        benefits: nextTier.benefits
      });
    } else {
      res.json({
        canUpgrade: false,
        shouldNotify: false,
        message: `Bạn đang ở hạng ${currentTier.name}`,
        currentTier: currentTier.name,
        nextTier: nextTier.name,
        amountNeeded,
        progressPercent: Math.floor(progressPercent)
      });
    }
  } catch (error) {
    console.error("Error in bot/tier/check-upgrade:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /api/bot/tier/upgrade/:customerId
 * Tự động nâng tier khi customer đạt ngưỡng
 * (Thường được gọi tự động sau khi order delivered)
 */
router.post("/upgrade/:customerId", async (req, res) => {
  try {
    const { customerId } = req.params;
    const { orderId, note } = req.body;

    const customer = await storage.getCustomer(customerId);
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    // Get stored tier from database
    const storedTierKey = customer.membershipTier || 'member';
    const previousTier = MEMBERSHIP_TIERS.find(t => t.key === storedTierKey) || MEMBERSHIP_TIERS[0];

    // Calculate new tier based on current totalSpent
    const totalSpent = parseFloat(customer.totalSpent || "0");
    const newTier = calculateTier(totalSpent);

    // Check nếu tier đã thay đổi
    if (previousTier.key === newTier.key) {
      return res.json({
        success: false,
        upgraded: false,
        message: "Customer chưa đủ điều kiện nâng tier",
        currentTier: previousTier.name
      });
    }

    // Update tier
    await storage.updateCustomerMembership({
      customerId,
      membershipTier: newTier.key,
      lastTierUpdate: new Date(),
      totalSpent: totalSpent.toString(),
      pointsBalance: customer.pointsBalance || 0,
      pointsEarned: customer.pointsEarned || 0,
      membershipData: {
        ...(customer.membershipData as any || {}),
        tierHistory: [
          ...((customer.membershipData as any)?.tierHistory || []),
          {
            tier: newTier.key,
            date: new Date().toISOString(),
            reason: note || `Upgrade from ${previousTier.name} to ${newTier.name}`,
            orderId
          }
        ]
      }
    });

    res.json({
      success: true,
      upgraded: true,
      message: `🎉 Chúc mừng! Bạn đã lên hạng ${newTier.name}!`,
      previousTier: previousTier.name,
      newTier: newTier.name,
      benefits: newTier.benefits
    });
  } catch (error) {
    console.error("Error in bot/tier/upgrade:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/bot/tier/benefits/:tier
 * Lấy danh sách quyền lợi của tier
 */
router.get("/benefits/:tier", async (req, res) => {
  try {
    const { tier } = req.params;

    const tierInfo = MEMBERSHIP_TIERS.find(t => t.key === tier);
    if (!tierInfo) {
      return res.status(404).json({ error: "Tier not found" });
    }

    res.json({
      success: true,
      tier: {
        key: tierInfo.key,
        name: tierInfo.name,
        nameEn: tierInfo.nameEn,
        color: tierInfo.color,
        icon: tierInfo.icon,
        requiredSpent: tierInfo.requiredSpent,
        pointsMultiplier: tierInfo.pointsMultiplier,
        benefits: tierInfo.benefits
      }
    });
  } catch (error) {
    console.error("Error in bot/tier/benefits:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
