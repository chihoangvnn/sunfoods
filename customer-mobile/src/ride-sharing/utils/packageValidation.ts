import type { Package } from "../mockData";

export type PackageStatus = "pending" | "bidded" | "price_confirmed" | "in_transit" | "delivered" | "cancelled";

export type UserRole = "sender" | "driver";

export interface ValidationResult {
  canCancel?: boolean;
  canAccept?: boolean;
  canStart?: boolean;
  canMarkDelivered?: boolean;
  canRate?: boolean;
  reason?: string;
}

const STATUS_TRANSITIONS: Record<PackageStatus, PackageStatus[]> = {
  pending: ["bidded", "cancelled"],
  bidded: ["price_confirmed", "cancelled"],
  price_confirmed: ["in_transit", "cancelled"],
  in_transit: ["delivered", "cancelled"],
  delivered: [],
  cancelled: []
};

export function canTransitionTo(currentStatus: PackageStatus, nextStatus: PackageStatus): boolean {
  const validTransitions = STATUS_TRANSITIONS[currentStatus];
  return validTransitions.includes(nextStatus);
}

export function canCancelPackage(pkg: Package, userRole: UserRole): ValidationResult {
  if (pkg.status === "delivered") {
    return {
      canCancel: false,
      reason: "Không thể hủy đơn hàng đã giao"
    };
  }

  if (pkg.status === "cancelled") {
    return {
      canCancel: false,
      reason: "Đơn hàng đã được hủy trước đó"
    };
  }

  if (userRole === "sender") {
    if (pkg.status === "pending" || pkg.status === "bidded") {
      return { canCancel: true };
    }
    return {
      canCancel: false,
      reason: "Chỉ có thể hủy đơn khi chưa xác nhận giá"
    };
  }

  if (userRole === "driver") {
    if (pkg.status === "price_confirmed" || pkg.status === "in_transit") {
      return { canCancel: true };
    }
    return {
      canCancel: false,
      reason: "Chỉ có thể hủy đơn đã xác nhận hoặc đang giao"
    };
  }

  return {
    canCancel: false,
    reason: "Vai trò không hợp lệ"
  };
}

export function canAcceptBid(pkg: Package): ValidationResult {
  if (pkg.status === "cancelled") {
    return {
      canAccept: false,
      reason: "Không thể chấp nhận báo giá cho đơn hàng đã hủy"
    };
  }

  if (pkg.status === "pending" || pkg.status === "bidded") {
    return { canAccept: true };
  }

  if (pkg.status === "price_confirmed") {
    return {
      canAccept: false,
      reason: "Đơn hàng đã có giá xác nhận"
    };
  }

  if (pkg.status === "in_transit") {
    return {
      canAccept: false,
      reason: "Đơn hàng đang được giao"
    };
  }

  if (pkg.status === "delivered") {
    return {
      canAccept: false,
      reason: "Đơn hàng đã được giao"
    };
  }

  return {
    canAccept: false,
    reason: "Trạng thái đơn hàng không hợp lệ"
  };
}

export function canStartDelivery(pkg: Package, driverId: string): ValidationResult {
  if (pkg.status === "cancelled") {
    return {
      canStart: false,
      reason: "Không thể bắt đầu giao đơn hàng đã hủy"
    };
  }

  if (pkg.status !== "price_confirmed") {
    return {
      canStart: false,
      reason: "Chỉ có thể bắt đầu giao khi đã xác nhận giá"
    };
  }

  if (pkg.confirmedDriverId !== driverId) {
    return {
      canStart: false,
      reason: "Bạn không phải là tài xế được chỉ định"
    };
  }

  return { canStart: true };
}

export function canMarkDelivered(pkg: Package, driverId: string): ValidationResult {
  if (pkg.status === "cancelled") {
    return {
      canMarkDelivered: false,
      reason: "Không thể đánh dấu đã giao cho đơn hàng đã hủy"
    };
  }

  if (pkg.status !== "in_transit") {
    return {
      canMarkDelivered: false,
      reason: "Chỉ có thể đánh dấu đã giao khi đơn hàng đang vận chuyển"
    };
  }

  if (pkg.confirmedDriverId !== driverId) {
    return {
      canMarkDelivered: false,
      reason: "Bạn không phải là tài xế được chỉ định"
    };
  }

  return { canMarkDelivered: true };
}

export function canRatePackage(pkg: Package, senderId: string): ValidationResult {
  if (pkg.status === "cancelled") {
    return {
      canRate: false,
      reason: "Không thể đánh giá đơn hàng đã hủy"
    };
  }

  if (pkg.status !== "delivered") {
    return {
      canRate: false,
      reason: "Chỉ có thể đánh giá đơn hàng đã giao"
    };
  }

  if (pkg.senderId !== senderId) {
    return {
      canRate: false,
      reason: "Bạn không phải là người gửi đơn hàng này"
    };
  }

  if (pkg.rating !== undefined && pkg.rating > 0) {
    return {
      canRate: false,
      reason: "Đơn hàng đã được đánh giá"
    };
  }

  return { canRate: true };
}

export function getStatusBadgeVariant(status: PackageStatus): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "pending":
      return "secondary";
    case "bidded":
      return "outline";
    case "price_confirmed":
      return "default";
    case "in_transit":
      return "default";
    case "delivered":
      return "default";
    case "cancelled":
      return "destructive";
    default:
      return "secondary";
  }
}

export function getStatusLabel(status: PackageStatus): string {
  switch (status) {
    case "pending":
      return "Chờ báo giá";
    case "bidded":
      return "Có báo giá";
    case "price_confirmed":
      return "Đã xác nhận giá";
    case "in_transit":
      return "Đang giao";
    case "delivered":
      return "Đã giao";
    case "cancelled":
      return "Đã hủy";
    default:
      return status;
  }
}

export function isTerminalStatus(status: PackageStatus): boolean {
  return status === "delivered" || status === "cancelled";
}
