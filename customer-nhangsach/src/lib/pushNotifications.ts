import webpush from 'web-push';

// Configure VAPID details
const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:admin@example.com';

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(
    vapidSubject,
    vapidPublicKey,
    vapidPrivateKey
  );
}

export interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: any;
  tag?: string;
  requireInteraction?: boolean;
}

/**
 * Send push notification to a specific subscription
 */
export async function sendPushToSubscription(
  subscription: {
    endpoint: string;
    keys: { p256dh: string; auth: string };
  },
  payload: PushPayload
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!vapidPublicKey || !vapidPrivateKey) {
      console.error('VAPID keys not configured');
      return { success: false, error: 'VAPID keys not configured' };
    }

    const pushSubscription = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
    };

    await webpush.sendNotification(
      pushSubscription,
      JSON.stringify(payload)
    );

    return { success: true };
  } catch (error: any) {
    console.error('Error sending push notification:', error);
    
    // Handle expired/invalid subscriptions
    if (error.statusCode === 410 || error.statusCode === 404) {
      return { success: false, error: 'subscription_expired' };
    }
    
    return { success: false, error: error.message };
  }
}

/**
 * Send push notification to all active subscriptions for a user
 */
export async function sendPushToUser(
  userId: string,
  payload: PushPayload
): Promise<{
  sent: number;
  failed: number;
  expiredSubscriptions: string[];
}> {
  try {
    // Get all active subscriptions for the user via API
    const response = await fetch(`/api/push-subscriptions?userId=${userId}&active=true`);
    if (!response.ok) {
      throw new Error('Failed to fetch subscriptions');
    }
    
    const subscriptions = await response.json();

    if (subscriptions.length === 0) {
      return { sent: 0, failed: 0, expiredSubscriptions: [] };
    }

    const results = await Promise.allSettled(
      subscriptions.map(async (sub: any) => {
        const keys = sub.keys as { p256dh: string; auth: string };
        const result = await sendPushToSubscription(
          { endpoint: sub.endpoint, keys },
          payload
        );
        return { subscriptionId: sub.id, result };
      })
    );

    let sent = 0;
    let failed = 0;
    const expiredSubscriptions: string[] = [];

    for (const result of results) {
      if (result.status === 'fulfilled') {
        const { subscriptionId, result: sendResult } = result.value;
        if (sendResult.success) {
          sent++;
        } else {
          failed++;
          if (sendResult.error === 'subscription_expired') {
            expiredSubscriptions.push(subscriptionId);
          }
        }
      } else {
        failed++;
      }
    }

    // Deactivate expired subscriptions via API
    if (expiredSubscriptions.length > 0) {
      await Promise.all(
        expiredSubscriptions.map(async (id) => {
          await fetch(`/api/push-subscriptions/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isActive: false })
          });
        })
      );
    }

    return { sent, failed, expiredSubscriptions };
  } catch (error) {
    console.error('Error sending push notifications to user:', error);
    return { sent: 0, failed: 0, expiredSubscriptions: [] };
  }
}

/**
 * Send new order notification to shop owner
 */
export async function notifyNewOrder(
  shopOwnerId: string,
  orderData: {
    orderId: string;
    customerName: string;
    totalAmount: number;
  }
): Promise<void> {
  const payload: PushPayload = {
    title: '🛒 Đơn hàng mới!',
    body: `${orderData.customerName} vừa đặt đơn hàng ${new Intl.NumberFormat('vi-VN').format(orderData.totalAmount)}đ`,
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    data: {
      url: `/orders/${orderData.orderId}`,
      orderId: orderData.orderId,
      type: 'new_order',
    },
    tag: `order-${orderData.orderId}`,
    requireInteraction: true,
  };

  await sendPushToUser(shopOwnerId, payload);
}

/**
 * Notify sender when a new bid is received on their package
 */
export async function notifyNewPackageBid(
  senderId: string,
  bidData: {
    packageId: string;
    driverName: string;
    bidAmount: number;
  }
): Promise<void> {
  const payload: PushPayload = {
    title: '📦 Báo giá mới!',
    body: `${bidData.driverName} đã báo giá ${new Intl.NumberFormat('vi-VN').format(bidData.bidAmount)}đ cho đơn hàng ${bidData.packageId.toUpperCase()}`,
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    data: {
      url: `/datxe/packages`,
      packageId: bidData.packageId,
      type: 'new_package_bid',
    },
    tag: `package-bid-${bidData.packageId}`,
    requireInteraction: false,
  };

  await sendPushToUser(senderId, payload);
}

/**
 * Notify driver when their bid is accepted
 */
export async function notifyBidAccepted(
  driverId: string,
  packageData: {
    packageId: string;
    senderName: string;
    pickupAddress: string;
  }
): Promise<void> {
  const payload: PushPayload = {
    title: '✅ Báo giá được chấp nhận!',
    body: `${packageData.senderName} đã chấp nhận báo giá của bạn. Lấy hàng tại: ${packageData.pickupAddress}`,
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    data: {
      url: `/datxe/driver/deliveries`,
      packageId: packageData.packageId,
      pickupAddress: packageData.pickupAddress,
      type: 'bid_accepted',
    },
    tag: `package-accepted-${packageData.packageId}`,
    requireInteraction: true,
  };

  await sendPushToUser(driverId, payload);
}

/**
 * Notify sender when delivery has started
 */
export async function notifyDeliveryStarted(
  senderId: string,
  deliveryData: {
    packageId: string;
    driverName: string;
    driverPhone: string;
  }
): Promise<void> {
  const payload: PushPayload = {
    title: '🚚 Bắt đầu giao hàng!',
    body: `${deliveryData.driverName} (${deliveryData.driverPhone}) đang giao đơn hàng ${deliveryData.packageId.toUpperCase()}`,
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    data: {
      url: `/datxe/packages`,
      packageId: deliveryData.packageId,
      driverPhone: deliveryData.driverPhone,
      type: 'delivery_started',
    },
    tag: `package-transit-${deliveryData.packageId}`,
    requireInteraction: false,
  };

  await sendPushToUser(senderId, payload);
}

/**
 * Notify sender when package is delivered
 */
export async function notifyPackageDelivered(
  senderId: string,
  deliveryData: {
    packageId: string;
    driverName: string;
    deliveredAt: string;
  }
): Promise<void> {
  const deliveredTime = new Date(deliveryData.deliveredAt).toLocaleString('vi-VN');
  const payload: PushPayload = {
    title: '🎉 Đã giao hàng thành công!',
    body: `Đơn hàng ${deliveryData.packageId.toUpperCase()} đã được giao lúc ${deliveredTime}`,
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    data: {
      url: `/datxe/packages`,
      packageId: deliveryData.packageId,
      deliveredAt: deliveryData.deliveredAt,
      type: 'package_delivered',
    },
    tag: `package-delivered-${deliveryData.packageId}`,
    requireInteraction: true,
  };

  await sendPushToUser(senderId, payload);
}

/**
 * Notify relevant party when package is cancelled
 */
export async function notifyPackageCancelled(
  userId: string,
  cancellationData: {
    packageId: string;
    cancelledBy: 'sender' | 'driver';
    cancellerName: string;
    reason: string;
  }
): Promise<void> {
  const isSenderCancellation = cancellationData.cancelledBy === 'sender';
  
  const payload: PushPayload = {
    title: '❌ Đơn hàng đã bị hủy',
    body: `Đơn hàng ${cancellationData.packageId.toUpperCase()} đã bị hủy bởi ${isSenderCancellation ? 'người gửi' : 'tài xế'}. Lý do: ${cancellationData.reason.substring(0, 50)}`,
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    data: {
      url: `/datxe/packages`,
      packageId: cancellationData.packageId,
      type: 'package_cancelled',
    },
    tag: `package-cancelled-${cancellationData.packageId}`,
    requireInteraction: false,
  };

  await sendPushToUser(userId, payload);
}

// ==================== RIDE-SHARING NOTIFICATIONS ====================

/**
 * Notify driver when they receive a new booking
 */
export async function notifyNewBooking(
  driverId: string,
  bookingData: {
    tripId: string;
    passengerName: string;
    seatsBooked: number;
    pickupLocation: string;
    totalAmount: number;
  }
): Promise<void> {
  const payload: PushPayload = {
    title: '🚗 Đặt chỗ mới!',
    body: `${bookingData.passengerName} đã đặt ${bookingData.seatsBooked} chỗ (${new Intl.NumberFormat('vi-VN').format(bookingData.totalAmount)}đ). Điểm đón: ${bookingData.pickupLocation}`,
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    data: {
      url: `/datxe/trips/${bookingData.tripId}`,
      tripId: bookingData.tripId,
      type: 'new_booking',
    },
    tag: `trip-booking-${bookingData.tripId}`,
    requireInteraction: true,
  };

  await sendPushToUser(driverId, payload);
}

/**
 * Notify passenger when their booking is confirmed by driver
 */
export async function notifyBookingConfirmed(
  passengerId: string,
  bookingData: {
    tripId: string;
    driverName: string;
    vehicleModel: string;
    departureTime: string;
    pickupLocation: string;
  }
): Promise<void> {
  const departureFormatted = new Date(bookingData.departureTime).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  const payload: PushPayload = {
    title: '✅ Đặt chỗ được xác nhận!',
    body: `${bookingData.driverName} (${bookingData.vehicleModel}) đã xác nhận chuyến đi lúc ${departureFormatted}. Điểm đón: ${bookingData.pickupLocation}`,
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    data: {
      url: `/datxe/bookings`,
      tripId: bookingData.tripId,
      type: 'booking_confirmed',
    },
    tag: `booking-confirmed-${bookingData.tripId}`,
    requireInteraction: true,
  };

  await sendPushToUser(passengerId, payload);
}

/**
 * Notify relevant party when trip is cancelled
 */
export async function notifyTripCancelled(
  userId: string,
  cancellationData: {
    tripId: string;
    cancelledBy: 'driver' | 'passenger' | 'system';
    cancellerName: string;
    reason: string;
    refundAmount?: number;
  }
): Promise<void> {
  let cancelledByText = 'hệ thống';
  if (cancellationData.cancelledBy === 'driver') {
    cancelledByText = 'tài xế';
  } else if (cancellationData.cancelledBy === 'passenger') {
    cancelledByText = 'hành khách';
  }

  let bodyText = `Chuyến đi đã bị hủy bởi ${cancelledByText}. Lý do: ${cancellationData.reason.substring(0, 50)}`;
  if (cancellationData.refundAmount) {
    bodyText += `. Hoàn ${new Intl.NumberFormat('vi-VN').format(cancellationData.refundAmount)}đ`;
  }

  const payload: PushPayload = {
    title: '❌ Chuyến đi đã bị hủy',
    body: bodyText,
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    data: {
      url: `/datxe/bookings`,
      tripId: cancellationData.tripId,
      type: 'trip_cancelled',
    },
    tag: `trip-cancelled-${cancellationData.tripId}`,
    requireInteraction: true,
  };

  await sendPushToUser(userId, payload);
}

/**
 * Notify passengers and driver when trip departure is soon (15-30 min before)
 */
export async function notifyDepartureSoon(
  userId: string,
  tripData: {
    tripId: string;
    startLocation: string;
    endLocation: string;
    departureTime: string;
    minutesUntilDeparture: number;
    pickupLocation?: string;
  }
): Promise<void> {
  const isDriver = !tripData.pickupLocation;
  
  let bodyText;
  if (isDriver) {
    bodyText = `Chuyến ${tripData.startLocation} → ${tripData.endLocation} sẽ khởi hành trong ${tripData.minutesUntilDeparture} phút. Chuẩn bị sẵn sàng!`;
  } else {
    bodyText = `Chuyến ${tripData.startLocation} → ${tripData.endLocation} sẽ khởi hành trong ${tripData.minutesUntilDeparture} phút. Điểm đón: ${tripData.pickupLocation}`;
  }

  const payload: PushPayload = {
    title: '⏰ Xe sắp khởi hành!',
    body: bodyText,
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    data: {
      url: isDriver ? `/datxe/trips/${tripData.tripId}` : `/datxe/bookings`,
      tripId: tripData.tripId,
      type: 'departure_soon',
    },
    tag: `departure-soon-${tripData.tripId}`,
    requireInteraction: true,
  };

  await sendPushToUser(userId, payload);
}
