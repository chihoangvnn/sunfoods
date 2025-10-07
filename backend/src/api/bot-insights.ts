import { Router } from "express";
import { storage } from "../storage";

const router = Router();

router.get('/:customerId/insights', async (req, res) => {
    try {
      const { customerId } = req.params;

      const customer = await storage.getCustomer(customerId);
      if (!customer) {
        return res.status(404).json({ error: 'Customer not found' });
      }

      const orders = await storage.getOrdersByCustomerId(customerId);
      const completedOrders = orders.filter(o => o.status === 'delivered' || o.status === 'shipped');

      if (completedOrders.length === 0) {
        return res.json({
          success: true,
          customerId,
          rfm: {
            recency: null,
            frequency: 0,
            monetary: 0,
            recencyScore: 1,
            frequencyScore: 1,
            monetaryScore: 1,
            rfmScore: '111',
            segment: 'new_customer'
          },
          churnRisk: {
            level: 'low',
            probability: 0,
            message: 'Khách hàng mới, chưa có đơn hàng hoàn thành'
          },
          insights: [
            'Khách hàng mới chưa có lịch sử mua hàng',
            'Cần chăm sóc để tạo đơn hàng đầu tiên'
          ]
        });
      }

      const now = new Date();
      const sortedOrders = completedOrders.sort((a, b) => 
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
      
      const lastOrderDate = new Date(sortedOrders[0].createdAt || now);
      const daysSinceLastOrder = Math.floor((now.getTime() - lastOrderDate.getTime()) / (1000 * 60 * 60 * 24));

      const frequency = completedOrders.length;
      
      const monetary = completedOrders.reduce((sum, order) => {
        const total = typeof order.total === 'string' ? parseFloat(order.total) : (order.total || 0);
        return sum + total;
      }, 0);

      const recencyScore = daysSinceLastOrder <= 30 ? 5 : 
                          daysSinceLastOrder <= 60 ? 4 :
                          daysSinceLastOrder <= 90 ? 3 :
                          daysSinceLastOrder <= 180 ? 2 : 1;

      const frequencyScore = frequency >= 20 ? 5 :
                            frequency >= 10 ? 4 :
                            frequency >= 5 ? 3 :
                            frequency >= 2 ? 2 : 1;

      const monetaryScore = monetary >= 10000000 ? 5 :
                           monetary >= 5000000 ? 4 :
                           monetary >= 2000000 ? 3 :
                           monetary >= 500000 ? 2 : 1;

      const rfmScore = `${recencyScore}${frequencyScore}${monetaryScore}`;

      let segment = 'unknown';
      if (recencyScore >= 4 && frequencyScore >= 4) segment = 'champions';
      else if (recencyScore >= 3 && frequencyScore >= 3) segment = 'loyal_customers';
      else if (recencyScore >= 4 && frequencyScore <= 2) segment = 'promising';
      else if (recencyScore <= 2 && frequencyScore >= 4) segment = 'at_risk';
      else if (recencyScore <= 2 && frequencyScore <= 2) segment = 'lost';
      else segment = 'needs_attention';

      const churnProbability = daysSinceLastOrder > 180 ? 0.9 :
                              daysSinceLastOrder > 90 ? 0.7 :
                              daysSinceLastOrder > 60 ? 0.4 :
                              daysSinceLastOrder > 30 ? 0.2 : 0.05;

      const churnLevel = churnProbability >= 0.7 ? 'high' :
                        churnProbability >= 0.4 ? 'medium' : 'low';

      const churnMessage = churnLevel === 'high' 
        ? `Nguy cơ rời bỏ CAO - ${daysSinceLastOrder} ngày không mua hàng`
        : churnLevel === 'medium'
        ? `Nguy cơ rời bỏ TRUNG BÌNH - ${daysSinceLastOrder} ngày không mua hàng`
        : `Nguy cơ rời bỏ THẤP - Khách hàng hoạt động tốt`;

      const insights: string[] = [];
      
      if (segment === 'champions') {
        insights.push('🏆 Khách hàng VIP - Mua thường xuyên và gần đây');
        insights.push('Nên tặng quà/ưu đãi đặc biệt để giữ chân');
      } else if (segment === 'loyal_customers') {
        insights.push('💎 Khách hàng trung thành');
        insights.push('Tiềm năng trở thành Champions');
      } else if (segment === 'at_risk') {
        insights.push('⚠️ Khách hàng có nguy cơ rời bỏ');
        insights.push(`${daysSinceLastOrder} ngày không mua - Cần chiến dịch win-back`);
      } else if (segment === 'lost') {
        insights.push('❌ Khách hàng đã rời bỏ');
        insights.push('Cần chiến dịch phục hồi mạnh mẽ');
      } else if (segment === 'promising') {
        insights.push('🌱 Khách hàng tiềm năng - Mua gần đây nhưng ít lần');
        insights.push('Khuyến khích mua thêm để tăng tần suất');
      }

      const avgOrderValue = monetary / frequency;
      insights.push(`Giá trị đơn trung bình: ${avgOrderValue.toLocaleString('vi-VN')}₫`);

      if (frequency === 1) {
        insights.push('Chưa có đơn hàng lặp lại - Cần chiến lược retention');
      }

      return res.json({
        success: true,
        customerId,
        rfm: {
          recency: daysSinceLastOrder,
          frequency,
          monetary,
          recencyScore,
          frequencyScore,
          monetaryScore,
          rfmScore,
          segment
        },
        churnRisk: {
          level: churnLevel,
          probability: Math.round(churnProbability * 100),
          message: churnMessage
        },
        insights,
        stats: {
          totalOrders: frequency,
          totalSpent: monetary,
          avgOrderValue: Math.round(avgOrderValue),
          lastOrderDate: lastOrderDate.toISOString(),
          daysSinceLastOrder
        }
      });

    } catch (error) {
      console.error('Error getting customer insights:', error);
      return res.status(500).json({ error: 'Failed to get customer insights' });
    }
});

export default router;
