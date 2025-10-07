import { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../server/storage';
import { insertStorefrontOrderSchema } from '../../shared/schema';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === 'GET') {
      // GET /api/storefront/orders - Get storefront orders (for admin)
      const { configId, limit } = req.query;
      const limitNum = limit ? parseInt(limit as string) : 50;
      
      const orders = await storage.getStorefrontOrders(
        configId as string, 
        limitNum
      );
      
      res.json(orders);
      
    } else if (req.method === 'PATCH') {
      // PATCH /api/storefront/orders - Update order status (for admin)
      const { orderId, status } = req.body;
      
      if (!orderId || !status) {
        return res.status(400).json({ 
          error: 'Order ID and status are required' 
        });
      }

      // Validate status
      const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ 
          error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
        });
      }

      const updatedOrder = await storage.updateStorefrontOrderStatus(orderId, status);
      
      if (!updatedOrder) {
        return res.status(404).json({ 
          error: 'Order not found' 
        });
      }

      res.json({
        success: true,
        message: 'Order status updated successfully',
        order: updatedOrder
      });
      
    } else if (req.method === 'POST') {
      // POST /api/storefront/orders - Create new customer order with cart items
      const { 
        storefrontConfigId, 
        customerName, 
        customerPhone, 
        customerEmail, 
        customerAddress, 
        deliveryType, 
        notes, 
        items, 
        total, 
        affiliateCode 
      } = req.body;

      // Validate required fields
      if (!storefrontConfigId || !customerName || !customerPhone || !items || items.length === 0) {
        return res.status(400).json({ 
          error: 'Thông tin đơn hàng không đầy đủ' 
        });
      }

      // Verify storefront config exists and is active
      const config = await storage.getStorefrontConfig(storefrontConfigId);
      if (!config || !config.isActive) {
        return res.status(400).json({ 
          error: 'Storefront không tồn tại hoặc đã bị tắt' 
        });
      }

      // Create multiple orders for each cart item
      const createdOrders = [];
      
      for (const item of items) {
        // Verify product exists
        const product = await storage.getProduct(item.productId);
        if (!product) {
          return res.status(400).json({ 
            error: `Sản phẩm ${item.name} không tồn tại` 
          });
        }

        const orderData = {
          storefrontConfigId,
          customerName,
          customerPhone,
          customerEmail,
          customerAddress,
          productId: item.productId,
          productName: item.name,
          quantity: Math.round(item.quantity * 100) / 100, // Ensure proper decimal handling
          price: item.price.toString(),
          total: (item.price * item.quantity).toString(),
          deliveryType: deliveryType || 'local_delivery',
          status: 'pending' as const,
          notes,
          affiliateCode // Add affiliate code to each order
        };

        const order = await storage.createStorefrontOrder(orderData);
        createdOrders.push(order);
      }
      
      res.json({ 
        success: true,
        orderIds: createdOrders.map(o => o.id),
        message: 'Đơn hàng đã được tạo thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất.',
        orderDetails: {
          customerName,
          phone: customerPhone,
          itemCount: items.length,
          total,
          deliveryType,
          affiliateCode: affiliateCode || null
        }
      });
      
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
    
  } catch (error) {
    console.error('Storefront orders API error:', error);
    res.status(500).json({ 
      error: 'Có lỗi xảy ra khi xử lý đơn hàng. Vui lòng thử lại sau.',
      success: false 
    });
  }
}