import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { vendorShipments, vendorOrders, vendorPushSubscriptions } from '@shared/schema';
import { requireVendorAuth } from '../middleware/vendor-auth';
import { eq, and, sql } from 'drizzle-orm';
import { ghnClient } from '../services/ghn-client';
import webpush from 'web-push';

const router = Router();

const createShipmentSchema = z.object({
  vendorOrderId: z.string().uuid(),
  pickupAddress: z.object({
    name: z.string(),
    phone: z.string(),
    address: z.string(),
    wardCode: z.string(),
    districtId: z.number(),
  }),
  deliveryAddress: z.object({
    name: z.string(),
    phone: z.string(),
    address: z.string(),
    wardCode: z.string(),
    districtId: z.number(),
  }),
  weight: z.number().positive(),
  length: z.number().positive().optional(),
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
  codAmount: z.number().nonnegative().default(0),
  note: z.string().max(500).optional(),
  serviceTypeId: z.number().optional().default(2),
  paymentTypeId: z.number().optional().default(1),
  requiredNote: z.enum(['KHONGCHOXEMHANG', 'CHOXEMHANGKHONGTHU', 'CHOTHUHANG']).optional().default('KHONGCHOXEMHANG'),
  items: z.array(z.object({
    name: z.string(),
    quantity: z.number().positive(),
    price: z.number().nonnegative(),
  })).optional(),
});

const calculateFeeSchema = z.object({
  fromDistrictId: z.number(),
  toDistrictId: z.number(),
  toWardCode: z.string().optional(),
  weight: z.number().positive(),
  length: z.number().positive().optional(),
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
  serviceTypeId: z.number().optional().default(2),
  insuranceValue: z.number().optional(),
});

router.post('/create-shipment', requireVendorAuth, async (req, res) => {
  try {
    const vendorId = req.vendor!.id;
    const validationResult = createShipmentSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Dữ liệu không hợp lệ',
        details: validationResult.error.errors,
      });
    }

    const data = validationResult.data;

    const [vendorOrder] = await db
      .select()
      .from(vendorOrders)
      .where(and(
        eq(vendorOrders.id, data.vendorOrderId),
        eq(vendorOrders.vendorId, vendorId)
      ))
      .limit(1);

    if (!vendorOrder) {
      return res.status(404).json({ error: 'Không tìm thấy đơn hàng' });
    }

    const [existingShipment] = await db
      .select()
      .from(vendorShipments)
      .where(eq(vendorShipments.vendorOrderId, data.vendorOrderId))
      .limit(1);

    if (existingShipment) {
      return res.status(400).json({ error: 'Đơn hàng đã có mã vận đơn' });
    }

    const ghnResponse = await ghnClient.createOrder({
      to_name: data.deliveryAddress.name,
      to_phone: data.deliveryAddress.phone,
      to_address: data.deliveryAddress.address,
      to_ward_code: data.deliveryAddress.wardCode,
      to_district_id: data.deliveryAddress.districtId,
      cod_amount: data.codAmount,
      content: data.note || 'Đơn hàng từ vendor',
      weight: data.weight,
      length: data.length || 10,
      width: data.width || 10,
      height: data.height || 10,
      service_type_id: data.serviceTypeId,
      payment_type_id: data.paymentTypeId,
      required_note: data.requiredNote,
      items: data.items || [{
        name: 'Sản phẩm',
        quantity: 1,
        price: Number(vendorOrder.codAmount) || 0
      }],
    });

    const trackingCode = ghnResponse.data.order_code;
    const trackingUrl = `https://donhang.ghn.vn/?order_code=${trackingCode}`;

    const [newShipment] = await db
      .insert(vendorShipments)
      .values({
        vendorOrderId: data.vendorOrderId,
        carrier: 'ghn',
        trackingCode,
        trackingUrl,
        labelUrl: null,
        shippingCost: ghnResponse.data.total_fee.toString(),
        codAmount: data.codAmount.toString(),
        status: 'pending',
        statusHistory: [{
          status: 'pending',
          timestamp: new Date().toISOString(),
          note: 'Đã tạo đơn vận chuyển'
        }],
        estimatedDeliveryDate: ghnResponse.data.expected_delivery_time ? new Date(ghnResponse.data.expected_delivery_time) : null,
        metadata: {
          carrierOrderId: trackingCode,
          packageWeight: data.weight,
          packageDimensions: {
            length: data.length || 10,
            width: data.width || 10,
            height: data.height || 10,
          },
          ghnResponse: {
            sort_code: ghnResponse.data.sort_code,
            trans_type: ghnResponse.data.trans_type,
            fee: ghnResponse.data.fee,
          }
        },
      })
      .returning();

    await db
      .update(vendorOrders)
      .set({
        shippingProvider: 'ghn',
        shippingCode: trackingCode,
        status: 'processing',
        processingAt: new Date(),
      })
      .where(eq(vendorOrders.id, data.vendorOrderId));

    res.json({
      success: true,
      shipmentId: newShipment.id,
      trackingCode,
      trackingUrl,
      expectedDeliveryDate: ghnResponse.data.expected_delivery_time,
      shippingCost: ghnResponse.data.total_fee,
    });
  } catch (error) {
    console.error('Error creating GHN shipment:', error);
    const errorMessage = error instanceof Error ? error.message : 'Lỗi khi tạo đơn vận chuyển';
    res.status(500).json({ error: errorMessage });
  }
});

router.get('/tracking/:trackingCode', requireVendorAuth, async (req, res) => {
  try {
    const vendorId = req.vendor!.id;
    const { trackingCode } = req.params;

    const [shipment] = await db
      .select({
        shipment: vendorShipments,
        vendorOrder: vendorOrders,
      })
      .from(vendorShipments)
      .innerJoin(vendorOrders, eq(vendorShipments.vendorOrderId, vendorOrders.id))
      .where(and(
        eq(vendorShipments.trackingCode, trackingCode),
        eq(vendorOrders.vendorId, vendorId)
      ))
      .limit(1);

    if (!shipment) {
      return res.status(404).json({ error: 'Không tìm thấy vận đơn' });
    }

    const ghnDetail = await ghnClient.getOrderDetail(trackingCode);
    
    const newStatus = ghnClient.mapGHNStatusToVendorStatus(ghnDetail.data.status);
    
    const statusHistory = Array.isArray(shipment.shipment.statusHistory) 
      ? shipment.shipment.statusHistory 
      : [];
    
    const updatedHistory = [
      ...statusHistory,
      ...ghnDetail.data.log.map(log => ({
        status: ghnClient.mapGHNStatusToVendorStatus(log.status),
        timestamp: log.updated_date,
        location: log.location,
        note: log.message,
      }))
    ];

    await db
      .update(vendorShipments)
      .set({
        status: newStatus,
        statusHistory: updatedHistory,
        deliveredAt: newStatus === 'delivered' ? new Date() : shipment.shipment.deliveredAt,
      })
      .where(eq(vendorShipments.id, shipment.shipment.id));

    let vendorOrderStatus = shipment.vendorOrder.status;
    if (newStatus === 'picked_up' && vendorOrderStatus === 'processing') {
      vendorOrderStatus = 'shipped';
      await db
        .update(vendorOrders)
        .set({
          status: 'shipped',
          shippedAt: new Date(),
        })
        .where(eq(vendorOrders.id, shipment.vendorOrder.id));
    } else if (newStatus === 'delivered') {
      vendorOrderStatus = 'delivered';
      await db
        .update(vendorOrders)
        .set({
          status: 'delivered',
          deliveredAt: new Date(),
        })
        .where(eq(vendorOrders.id, shipment.vendorOrder.id));
    } else if (newStatus === 'cancelled') {
      vendorOrderStatus = 'cancelled';
      await db
        .update(vendorOrders)
        .set({
          status: 'cancelled',
          cancelledAt: new Date(),
        })
        .where(eq(vendorOrders.id, shipment.vendorOrder.id));
    } else if (newStatus === 'returned') {
      vendorOrderStatus = 'returned';
      await db
        .update(vendorOrders)
        .set({
          status: 'returned',
        })
        .where(eq(vendorOrders.id, shipment.vendorOrder.id));
    }

    res.json({
      trackingCode,
      status: newStatus,
      statusHistory: updatedHistory,
      ghnStatus: ghnDetail.data.status,
      ghnLog: ghnDetail.data.log,
      expectedDeliveryTime: ghnDetail.data.expected_delivery_time,
    });
  } catch (error) {
    console.error('Error tracking GHN shipment:', error);
    const errorMessage = error instanceof Error ? error.message : 'Lỗi khi tra cứu vận đơn';
    res.status(500).json({ error: errorMessage });
  }
});

router.post('/webhook', async (req, res) => {
  try {
    const { OrderCode, Status, COD, Time } = req.body;

    if (!OrderCode) {
      return res.status(400).json({ error: 'Missing OrderCode' });
    }

    const [shipment] = await db
      .select({
        shipment: vendorShipments,
        vendorOrder: vendorOrders,
      })
      .from(vendorShipments)
      .innerJoin(vendorOrders, eq(vendorShipments.vendorOrderId, vendorOrders.id))
      .where(eq(vendorShipments.trackingCode, OrderCode))
      .limit(1);

    if (!shipment) {
      return res.status(404).json({ error: 'Shipment not found' });
    }

    const newStatus = ghnClient.mapGHNStatusToVendorStatus(Status);
    
    const statusHistory = Array.isArray(shipment.shipment.statusHistory)
      ? shipment.shipment.statusHistory
      : [];

    const updatedHistory = [
      ...statusHistory,
      {
        status: newStatus,
        timestamp: Time || new Date().toISOString(),
        note: `Webhook update: ${Status}`,
      }
    ];

    await db
      .update(vendorShipments)
      .set({
        status: newStatus,
        statusHistory: updatedHistory,
        deliveredAt: newStatus === 'delivered' ? new Date() : shipment.shipment.deliveredAt,
      })
      .where(eq(vendorShipments.id, shipment.shipment.id));

    let vendorOrderStatus = shipment.vendorOrder.status;
    if (newStatus === 'picked_up' && vendorOrderStatus === 'processing') {
      await db
        .update(vendorOrders)
        .set({
          status: 'shipped',
          shippedAt: new Date(),
        })
        .where(eq(vendorOrders.id, shipment.vendorOrder.id));
    } else if (newStatus === 'delivered') {
      await db
        .update(vendorOrders)
        .set({
          status: 'delivered',
          deliveredAt: new Date(),
        })
        .where(eq(vendorOrders.id, shipment.vendorOrder.id));
    } else if (newStatus === 'cancelled' || newStatus === 'returned') {
      await db
        .update(vendorOrders)
        .set({
          status: newStatus,
          cancelledAt: newStatus === 'cancelled' ? new Date() : shipment.vendorOrder.cancelledAt,
        })
        .where(eq(vendorOrders.id, shipment.vendorOrder.id));
    }

    const pushSubscriptions = await db
      .select()
      .from(vendorPushSubscriptions)
      .where(and(
        eq(vendorPushSubscriptions.vendorId, shipment.vendorOrder.vendorId),
        eq(vendorPushSubscriptions.isActive, true)
      ));

    for (const subscription of pushSubscriptions) {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.p256dh,
              auth: subscription.auth,
            },
          },
          JSON.stringify({
            title: 'Cập nhật đơn hàng',
            body: `Mã vận đơn ${OrderCode}: ${newStatus}`,
            data: {
              trackingCode: OrderCode,
              status: newStatus,
            },
          })
        );

        await db
          .update(vendorPushSubscriptions)
          .set({ lastNotifiedAt: new Date() })
          .where(eq(vendorPushSubscriptions.id, subscription.id));
      } catch (pushError) {
        console.error('Error sending push notification:', pushError);
      }
    }

    res.json({ success: true, message: 'Webhook processed' });
  } catch (error) {
    console.error('Error processing GHN webhook:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

router.post('/cancel/:shipmentId', requireVendorAuth, async (req, res) => {
  try {
    const vendorId = req.vendor!.id;
    const { shipmentId } = req.params;

    const [shipment] = await db
      .select({
        shipment: vendorShipments,
        vendorOrder: vendorOrders,
      })
      .from(vendorShipments)
      .innerJoin(vendorOrders, eq(vendorShipments.vendorOrderId, vendorOrders.id))
      .where(and(
        eq(vendorShipments.id, shipmentId),
        eq(vendorOrders.vendorId, vendorId)
      ))
      .limit(1);

    if (!shipment) {
      return res.status(404).json({ error: 'Không tìm thấy vận đơn' });
    }

    if (shipment.shipment.status === 'cancelled') {
      return res.status(400).json({ error: 'Vận đơn đã được hủy trước đó' });
    }

    if (shipment.shipment.status === 'delivered') {
      return res.status(400).json({ error: 'Không thể hủy vận đơn đã giao thành công' });
    }

    const ghnResponse = await ghnClient.cancelOrder([shipment.shipment.trackingCode]);

    if (!ghnResponse.data.result) {
      return res.status(400).json({ 
        error: 'Không thể hủy vận đơn',
        ghnMessage: ghnResponse.data.message 
      });
    }

    const statusHistory = Array.isArray(shipment.shipment.statusHistory)
      ? shipment.shipment.statusHistory
      : [];

    await db
      .update(vendorShipments)
      .set({
        status: 'cancelled',
        statusHistory: [
          ...statusHistory,
          {
            status: 'cancelled',
            timestamp: new Date().toISOString(),
            note: 'Đã hủy vận đơn',
          }
        ],
      })
      .where(eq(vendorShipments.id, shipmentId));

    await db
      .update(vendorOrders)
      .set({
        status: 'cancelled',
        cancelledAt: new Date(),
      })
      .where(eq(vendorOrders.id, shipment.vendorOrder.id));

    res.json({
      success: true,
      message: 'Đã hủy vận đơn thành công',
    });
  } catch (error) {
    console.error('Error cancelling GHN shipment:', error);
    const errorMessage = error instanceof Error ? error.message : 'Lỗi khi hủy vận đơn';
    res.status(500).json({ error: errorMessage });
  }
});

router.get('/calculate-fee', requireVendorAuth, async (req, res) => {
  try {
    const validationResult = calculateFeeSchema.safeParse({
      fromDistrictId: req.query.fromDistrictId ? Number(req.query.fromDistrictId) : undefined,
      toDistrictId: req.query.toDistrictId ? Number(req.query.toDistrictId) : undefined,
      toWardCode: req.query.toWardCode,
      weight: req.query.weight ? Number(req.query.weight) : undefined,
      length: req.query.length ? Number(req.query.length) : undefined,
      width: req.query.width ? Number(req.query.width) : undefined,
      height: req.query.height ? Number(req.query.height) : undefined,
      serviceTypeId: req.query.serviceTypeId ? Number(req.query.serviceTypeId) : undefined,
      insuranceValue: req.query.insuranceValue ? Number(req.query.insuranceValue) : undefined,
    });

    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Dữ liệu không hợp lệ',
        details: validationResult.error.errors,
      });
    }

    const data = validationResult.data;

    const ghnResponse = await ghnClient.calculateFee({
      from_district_id: data.fromDistrictId,
      to_district_id: data.toDistrictId,
      to_ward_code: data.toWardCode,
      weight: data.weight,
      length: data.length,
      width: data.width,
      height: data.height,
      service_type_id: data.serviceTypeId,
      insurance_value: data.insuranceValue,
    });

    res.json({
      serviceFee: ghnResponse.data.service_fee,
      totalFee: ghnResponse.data.total,
      insuranceFee: ghnResponse.data.insurance_fee,
      pickStationFee: ghnResponse.data.pick_station_fee,
      r2sFee: ghnResponse.data.r2s_fee,
      couponValue: ghnResponse.data.coupon_value,
    });
  } catch (error) {
    console.error('Error calculating GHN fee:', error);
    const errorMessage = error instanceof Error ? error.message : 'Lỗi khi tính phí vận chuyển';
    res.status(500).json({ error: errorMessage });
  }
});

router.get('/label/:trackingCode', requireVendorAuth, async (req, res) => {
  try {
    const vendorId = req.vendor!.id;
    const { trackingCode } = req.params;

    const [shipment] = await db
      .select({
        shipment: vendorShipments,
        vendorOrder: vendorOrders,
      })
      .from(vendorShipments)
      .innerJoin(vendorOrders, eq(vendorShipments.vendorOrderId, vendorOrders.id))
      .where(and(
        eq(vendorShipments.trackingCode, trackingCode),
        eq(vendorOrders.vendorId, vendorId)
      ))
      .limit(1);

    if (!shipment) {
      return res.status(404).json({ error: 'Không tìm thấy đơn vận chuyển' });
    }

    if (shipment.shipment.labelUrl) {
      return res.json({ labelUrl: shipment.shipment.labelUrl });
    }

    const labelData = await ghnClient.getShippingLabel(trackingCode);

    const labelUrl = `https://dev-online-gateway.ghn.vn/a5/public-api/printA5?token=${labelData.data.token}`;

    await db
      .update(vendorShipments)
      .set({ 
        labelUrl,
        updatedAt: new Date()
      })
      .where(eq(vendorShipments.id, shipment.shipment.id));

    res.json({ labelUrl });
  } catch (error) {
    console.error('Error generating GHN label:', error);
    const errorMessage = error instanceof Error ? error.message : 'Không thể tạo nhãn vận chuyển';
    res.status(500).json({ error: errorMessage });
  }
});

export default router;
