import express from 'express';
import { db } from '../db.js';
import { orders } from '../../shared/schema.js';
import { eq, and, desc, like, sql } from 'drizzle-orm';
import ViettelPostShippingService from '../services/viettelpost-shipping-service.js';
import ViettelPostAPI from '../services/viettelpost-api.js';
import crypto from 'crypto';

const router = express.Router();

// Authentication middleware (simplified for development)
const requireAdminAuth = (req: any, res: any, next: any) => {
  // For development, allow all requests (production would check session)
  if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
    next();
    return;
  }

  if (!req.session || !req.session.userId) {
    return res.status(401).json({ 
      error: "Unauthorized. Please log in as an administrator.",
      code: "AUTH_REQUIRED"
    });
  }
  next();
};

const vtpService = new ViettelPostShippingService();

/**
 * GET /api/viettelpost/configs
 * Lấy danh sách cấu hình ViettelPost
 */
router.get('/configs', requireAdminAuth, async (req, res) => {
  try {
    const configs = await db
      .select({
        id: viettelpostConfigs.id,
        configName: viettelpostConfigs.configName,
        username: viettelpostConfigs.username,
        groupAddressId: viettelpostConfigs.groupAddressId,
        defaultSenderInfo: viettelpostConfigs.defaultSenderInfo,
        defaultServiceCode: viettelpostConfigs.defaultServiceCode,
        autoCreateOrder: viettelpostConfigs.autoCreateOrder,
        autoUpdateStatus: viettelpostConfigs.autoUpdateStatus,
        webhookUrl: viettelpostConfigs.webhookUrl,
        isActive: viettelpostConfigs.isActive,
        isDefault: viettelpostConfigs.isDefault,
        lastTokenRefresh: viettelpostConfigs.lastTokenRefresh,
        apiCallCount: viettelpostConfigs.apiCallCount,
        errorCount: viettelpostConfigs.errorCount,
        lastError: viettelpostConfigs.lastError,
        createdAt: viettelpostConfigs.createdAt,
        updatedAt: viettelpostConfigs.updatedAt,
      })
      .from(viettelpostConfigs)
      .orderBy(desc(viettelpostConfigs.isDefault), desc(viettelpostConfigs.createdAt));

    res.json(configs);
  } catch (error) {
    console.error('Get VTP configs error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch ViettelPost configurations',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/viettelpost/configs
 * Tạo cấu hình ViettelPost mới
 */
router.post('/configs', requireAdminAuth, async (req, res) => {
  try {
    const {
      configName,
      username,
      password,
      groupAddressId,
      defaultSenderInfo,
      defaultServiceCode = 'VCN',
      autoCreateOrder = false,
      autoUpdateStatus = true,
      webhookUrl,
      isDefault = false
    } = req.body;

    // Validate required fields
    if (!configName || !username || !password || !defaultSenderInfo) {
      return res.status(400).json({
        error: 'Missing required fields',
        details: 'configName, username, password, and defaultSenderInfo are required'
      });
    }

    // Test API connection
    try {
      const testApi = new ViettelPostAPI({
        username,
        password,
        baseUrl: 'https://partner.viettelpost.vn/v2'
      });
      
      await testApi.authenticate();
      console.log('✅ ViettelPost API authentication successful');
    } catch (apiError) {
      return res.status(400).json({
        error: 'ViettelPost API authentication failed',
        details: apiError instanceof Error ? apiError.message : 'Invalid credentials'
      });
    }

    // Encrypt password
    const encryptedPassword = encryptPassword(password);

    // If this is set as default, unset other defaults
    if (isDefault) {
      await db
        .update(viettelpostConfigs)
        .set({ isDefault: false })
        .where(eq(viettelpostConfigs.isDefault, true));
    }

    // Create webhook secret
    const webhookSecret = crypto.randomBytes(32).toString('hex');

    const newConfig = await db
      .insert(viettelpostConfigs)
      .values({
        configName,
        username,
        password: encryptedPassword,
        groupAddressId,
        defaultSenderInfo,
        defaultServiceCode,
        autoCreateOrder,
        autoUpdateStatus,
        webhookUrl,
        webhookSecret,
        isDefault,
        isActive: true,
      })
      .returning();

    // Return without exposing password
    res.status(201).json({
      ...newConfig[0],
      password: undefined,
      webhookSecret: undefined,
      passwordSet: true,
      webhookSecretSet: true
    });

  } catch (error) {
    console.error('Create VTP config error:', error);
    
    if (error instanceof Error && error.message.includes('unique')) {
      return res.status(409).json({
        error: 'Configuration name already exists',
        details: 'A ViettelPost configuration with this name already exists'
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to create ViettelPost configuration',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * PUT /api/viettelpost/configs/:id
 * Cập nhật cấu hình ViettelPost
 */
router.put('/configs/:id', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    
    // Encrypt password if provided
    if (updateData.password && updateData.password !== '') {
      updateData.password = encryptPassword(updateData.password);
    } else {
      delete updateData.password;
    }

    // If setting as default, unset other defaults
    if (updateData.isDefault) {
      await db
        .update(viettelpostConfigs)
        .set({ isDefault: false })
        .where(eq(viettelpostConfigs.isDefault, true));
    }

    updateData.updatedAt = new Date();

    const updatedConfig = await db
      .update(viettelpostConfigs)
      .set(updateData)
      .where(eq(viettelpostConfigs.id, id))
      .returning();
    
    if (updatedConfig.length === 0) {
      return res.status(404).json({ error: 'ViettelPost configuration not found' });
    }

    res.json({
      ...updatedConfig[0],
      password: undefined,
      webhookSecret: undefined,
      passwordSet: !!updatedConfig[0].password,
      webhookSecretSet: !!updatedConfig[0].webhookSecret
    });

  } catch (error) {
    console.error('Update VTP config error:', error);
    res.status(500).json({ 
      error: 'Failed to update ViettelPost configuration',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * DELETE /api/viettelpost/configs/:id
 * Xóa cấu hình ViettelPost
 */
router.delete('/configs/:id', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const deleted = await db
      .delete(viettelpostConfigs)
      .where(eq(viettelpostConfigs.id, id))
      .returning();
    
    if (deleted.length === 0) {
      return res.status(404).json({ error: 'ViettelPost configuration not found' });
    }

    res.json({ 
      success: true, 
      message: 'ViettelPost configuration deleted successfully' 
    });

  } catch (error) {
    console.error('Delete VTP config error:', error);
    res.status(500).json({ 
      error: 'Failed to delete ViettelPost configuration',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/viettelpost/create-shipping/:orderId
 * Tạo đơn vận chuyển ViettelPost cho đơn hàng
 */
router.post('/create-shipping/:orderId', requireAdminAuth, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { serviceCode, paymentMethod = 1, moneyCollection = 0, note, configId } = req.body;

    // Get order details
    const order = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (!order || order.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check if VTP shipping already created
    if (order[0].vtpOrderSystemCode) {
      return res.status(400).json({ 
        error: 'ViettelPost shipping already created for this order',
        vtpOrderSystemCode: order[0].vtpOrderSystemCode
      });
    }

    // Initialize service with specific config if provided
    if (configId) {
      await vtpService.initialize(configId);
    }

    // Prepare shipping data
    const shippingData = {
      orderId: orderId,
      orderNumber: `ORDER-${orderId.slice(-8)}`,
      customerInfo: {
        fullName: order[0].sourceCustomerInfo?.name || 'Khách hàng',
        phone: order[0].sourceCustomerInfo?.phone || '0123456789',
        email: order[0].sourceCustomerInfo?.email,
        address: order[0].sourceCustomerInfo?.address || 'Địa chỉ khách hàng',
        wardId: 1, // Default ward - should be selected by user
        districtId: 1, // Default district
        provinceId: 1, // Default province
      },
      productInfo: {
        name: `Đơn hàng #${orderId.slice(-8)}`,
        description: `Đơn hàng từ hệ thống e-commerce`,
        quantity: order[0].items || 1,
        price: parseFloat(order[0].total.toString()) || 0,
        weight: 500, // Default 500g - should be calculated from products
      },
      serviceOptions: {
        serviceCode: serviceCode || 'VCN',
        paymentMethod: paymentMethod,
        moneyCollection: moneyCollection,
        note: note,
      }
    };

    const result = await vtpService.createShippingOrder(shippingData);

    if (result.success) {
      res.json({
        success: true,
        message: 'ViettelPost shipping created successfully',
        vtpOrderSystemCode: result.vtpOrderSystemCode,
        trackingNumber: result.trackingNumber,
        totalFee: result.totalFee,
      });
    } else {
      res.status(400).json({
        error: 'Failed to create ViettelPost shipping',
        details: result.error
      });
    }

  } catch (error) {
    console.error('Create VTP shipping error:', error);
    res.status(500).json({ 
      error: 'Failed to create ViettelPost shipping',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/viettelpost/track/:orderId
 * Theo dõi đơn hàng ViettelPost
 */
router.get('/track/:orderId', requireAdminAuth, async (req, res) => {
  try {
    const { orderId } = req.params;

    const result = await vtpService.trackOrder(orderId);

    if (result.success) {
      res.json({
        success: true,
        tracking: {
          status: result.status,
          statusName: result.statusName,
          currentLocation: result.currentLocation,
          lastUpdate: result.lastUpdate,
          estimatedDelivery: result.estimatedDelivery,
          history: result.history,
        }
      });
    } else {
      res.status(400).json({
        error: 'Failed to track ViettelPost order',
        details: result.error
      });
    }

  } catch (error) {
    console.error('Track VTP order error:', error);
    res.status(500).json({ 
      error: 'Failed to track ViettelPost order',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/viettelpost/cancel/:orderId
 * Hủy đơn hàng ViettelPost
 */
router.post('/cancel/:orderId', requireAdminAuth, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;

    const result = await vtpService.cancelOrder(orderId, reason);

    if (result.success) {
      res.json({
        success: true,
        message: 'ViettelPost order cancelled successfully'
      });
    } else {
      res.status(400).json({
        error: 'Failed to cancel ViettelPost order',
        details: result.error
      });
    }

  } catch (error) {
    console.error('Cancel VTP order error:', error);
    res.status(500).json({ 
      error: 'Failed to cancel ViettelPost order',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/viettelpost/calculate-fee
 * Tính phí vận chuyển
 */
router.post('/calculate-fee', requireAdminAuth, async (req, res) => {
  try {
    const {
      senderProvinceId,
      senderDistrictId,
      receiverProvinceId,
      receiverDistrictId,
      weight,
      value,
      serviceCode = 'VCN'
    } = req.body;

    if (!senderProvinceId || !senderDistrictId || !receiverProvinceId || !receiverDistrictId || !weight || !value) {
      return res.status(400).json({
        error: 'Missing required parameters',
        details: 'senderProvinceId, senderDistrictId, receiverProvinceId, receiverDistrictId, weight, and value are required'
      });
    }

    const result = await vtpService.calculateShippingFee({
      senderProvinceId,
      senderDistrictId,
      receiverProvinceId,
      receiverDistrictId,
      weight,
      value,
      serviceCode
    });

    if (result.success) {
      res.json({
        success: true,
        shippingFee: result.fee,
        estimatedDays: result.estimatedDays,
        serviceCode: serviceCode
      });
    } else {
      res.status(400).json({
        error: 'Failed to calculate shipping fee',
        details: result.error
      });
    }

  } catch (error) {
    console.error('Calculate VTP fee error:', error);
    res.status(500).json({ 
      error: 'Failed to calculate shipping fee',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/viettelpost/services
 * Lấy danh sách dịch vụ ViettelPost
 */
router.get('/services', requireAdminAuth, async (req, res) => {
  try {
    const services = await vtpService.getAvailableServices();
    res.json({ success: true, services });
  } catch (error) {
    console.error('Get VTP services error:', error);
    res.status(500).json({ 
      error: 'Failed to get ViettelPost services',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/viettelpost/locations/provinces
 * Lấy danh sách tỉnh/thành phố
 */
router.get('/locations/provinces', requireAdminAuth, async (req, res) => {
  try {
    const vtpApi = new ViettelPostAPI({
      username: 'dummy',
      password: 'dummy',
      baseUrl: 'https://partner.viettelpost.vn/v2'
    });
    
    // Try to initialize from default config
    try {
      await vtpService.initialize();
      const provinces = await vtpApi.getProvinces();
      
      if (provinces.status === 200 && provinces.data) {
        res.json({ success: true, provinces: provinces.data });
      } else {
        res.status(400).json({ error: 'Failed to fetch provinces from ViettelPost' });
      }
    } catch (initError) {
      res.status(400).json({ 
        error: 'ViettelPost not configured',
        details: 'Please configure ViettelPost settings first'
      });
    }

  } catch (error) {
    console.error('Get VTP provinces error:', error);
    res.status(500).json({ 
      error: 'Failed to get provinces',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/viettelpost/locations/districts/:provinceId
 * Lấy danh sách quận/huyện theo tỉnh
 */
router.get('/locations/districts/:provinceId', requireAdminAuth, async (req, res) => {
  try {
    const { provinceId } = req.params;
    
    await vtpService.initialize();
    const vtpApi = new ViettelPostAPI({
      username: 'dummy',
      password: 'dummy',
      baseUrl: 'https://partner.viettelpost.vn/v2'
    });
    
    const districts = await vtpApi.getDistricts(parseInt(provinceId));
    
    if (districts.status === 200 && districts.data) {
      res.json({ success: true, districts: districts.data });
    } else {
      res.status(400).json({ error: 'Failed to fetch districts from ViettelPost' });
    }

  } catch (error) {
    console.error('Get VTP districts error:', error);
    res.status(500).json({ 
      error: 'Failed to get districts',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/viettelpost/locations/wards/:districtId
 * Lấy danh sách phường/xã theo quận/huyện
 */
router.get('/locations/wards/:districtId', requireAdminAuth, async (req, res) => {
  try {
    const { districtId } = req.params;
    
    await vtpService.initialize();
    const vtpApi = new ViettelPostAPI({
      username: 'dummy',
      password: 'dummy',
      baseUrl: 'https://partner.viettelpost.vn/v2'
    });
    
    const wards = await vtpApi.getWards(parseInt(districtId));
    
    if (wards.status === 200 && wards.data) {
      res.json({ success: true, wards: wards.data });
    } else {
      res.status(400).json({ error: 'Failed to fetch wards from ViettelPost' });
    }

  } catch (error) {
    console.error('Get VTP wards error:', error);
    res.status(500).json({ 
      error: 'Failed to get wards',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Helper function
function encryptPassword(password: string): string {
  const algorithm = 'aes-256-cbc';
  const key = crypto.scryptSync(process.env.ENCRYPTION_KEY || 'default-key', 'salt', 32);
  const iv = crypto.randomBytes(16);
  
  const cipher = crypto.createCipher(algorithm, key);
  let encrypted = cipher.update(password, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return `${iv.toString('hex')}:${encrypted}`;
}

export default router;