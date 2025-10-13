import type { TripStatus, PassengerCheckIn } from "../mockData";

export type UserRole = "driver" | "passenger";

export interface ValidationResult {
  canCheckIn?: boolean;
  canStartTrip?: boolean;
  canCompleteTrip?: boolean;
  canCancelTrip?: boolean;
  canConfirmBooking?: boolean;
  canPassengerCheckIn?: boolean;
  reason?: string;
}

const STATUS_TRANSITIONS: Record<TripStatus, TripStatus[]> = {
  pending: ["checked_in", "cancelled"],
  checked_in: ["in_progress", "cancelled"],
  in_progress: ["completed", "cancelled"],
  completed: [],
  cancelled: []
};

export function canTransitionTo(currentStatus: TripStatus, nextStatus: TripStatus): boolean {
  const validTransitions = STATUS_TRANSITIONS[currentStatus];
  return validTransitions.includes(nextStatus);
}

export function canDriverCheckIn(
  status: TripStatus,
  departureWindowStart: string,
  checkInTime: string | null
): ValidationResult {
  if (checkInTime) {
    return {
      canCheckIn: false,
      reason: "Tài xế đã check-in rồi"
    };
  }

  if (status === "cancelled") {
    return {
      canCheckIn: false,
      reason: "Không thể check-in cho chuyến đi đã hủy"
    };
  }

  if (status !== "pending") {
    return {
      canCheckIn: false,
      reason: "Chỉ có thể check-in khi chuyến ở trạng thái chờ"
    };
  }

  const now = new Date().getTime();
  const departureTime = new Date(departureWindowStart).getTime();
  const minutesUntilDeparture = (departureTime - now) / 60000;

  if (minutesUntilDeparture > 60) {
    return {
      canCheckIn: false,
      reason: "Chỉ có thể check-in trong vòng 60 phút trước giờ khởi hành"
    };
  }

  if (minutesUntilDeparture < -30) {
    return {
      canCheckIn: false,
      reason: "Đã quá giờ khởi hành"
    };
  }

  return { canCheckIn: true };
}

export function canStartTrip(
  status: TripStatus,
  checkInTime: string | null
): ValidationResult {
  if (status === "cancelled") {
    return {
      canStartTrip: false,
      reason: "Không thể khởi hành chuyến đi đã hủy"
    };
  }

  if (status !== "checked_in") {
    return {
      canStartTrip: false,
      reason: "Phải check-in trước khi khởi hành"
    };
  }

  if (!checkInTime) {
    return {
      canStartTrip: false,
      reason: "Tài xế chưa check-in"
    };
  }

  return { canStartTrip: true };
}

export function canCompleteTrip(status: TripStatus): ValidationResult {
  if (status === "cancelled") {
    return {
      canCompleteTrip: false,
      reason: "Không thể hoàn thành chuyến đi đã hủy"
    };
  }

  if (status !== "in_progress") {
    return {
      canCompleteTrip: false,
      reason: "Chỉ có thể hoàn thành chuyến đang diễn ra"
    };
  }

  return { canCompleteTrip: true };
}

export function canCancelTrip(
  status: TripStatus,
  userRole: UserRole
): ValidationResult {
  if (status === "completed") {
    return {
      canCancelTrip: false,
      reason: "Không thể hủy chuyến đi đã hoàn thành"
    };
  }

  if (status === "cancelled") {
    return {
      canCancelTrip: false,
      reason: "Chuyến đi đã được hủy trước đó"
    };
  }

  if (userRole === "driver") {
    if (status === "pending" || status === "checked_in") {
      return { canCancelTrip: true };
    }
    return {
      canCancelTrip: false,
      reason: "Tài xế chỉ có thể hủy trước khi khởi hành"
    };
  }

  if (userRole === "passenger") {
    if (status === "pending") {
      return { canCancelTrip: true };
    }
    return {
      canCancelTrip: false,
      reason: "Hành khách chỉ có thể hủy trước khi tài xế check-in"
    };
  }

  return {
    canCancelTrip: false,
    reason: "Vai trò không hợp lệ"
  };
}

export function canConfirmBooking(
  status: TripStatus,
  hasAvailableSeats: boolean
): ValidationResult {
  if (status === "cancelled") {
    return {
      canConfirmBooking: false,
      reason: "Không thể xác nhận booking cho chuyến đi đã hủy"
    };
  }

  if (status !== "pending") {
    return {
      canConfirmBooking: false,
      reason: "Chỉ có thể xác nhận booking khi chuyến ở trạng thái chờ"
    };
  }

  if (!hasAvailableSeats) {
    return {
      canConfirmBooking: false,
      reason: "Chuyến đi đã hết chỗ"
    };
  }

  return { canConfirmBooking: true };
}

export function canPassengerCheckIn(
  status: TripStatus,
  checkInTime: string | null,
  passengerCheckIns: PassengerCheckIn[],
  passengerId: string,
  departureWindowStart: string
): ValidationResult {
  if (status === "cancelled") {
    return {
      canPassengerCheckIn: false,
      reason: "Không thể check-in cho chuyến đi đã hủy"
    };
  }

  if (!checkInTime) {
    return {
      canPassengerCheckIn: false,
      reason: "Tài xế chưa check-in"
    };
  }

  if (status !== "checked_in" && status !== "in_progress") {
    return {
      canPassengerCheckIn: false,
      reason: "Chỉ có thể check-in khi tài xế đã check-in hoặc đang di chuyển"
    };
  }

  const alreadyCheckedIn = passengerCheckIns.some(
    (checkIn) => checkIn.passengerId === passengerId
  );

  if (alreadyCheckedIn) {
    return {
      canPassengerCheckIn: false,
      reason: "Bạn đã check-in rồi"
    };
  }

  const now = new Date().getTime();
  const departureTime = new Date(departureWindowStart).getTime();
  const minutesUntilDeparture = (departureTime - now) / 60000;

  if (minutesUntilDeparture < -60) {
    return {
      canPassengerCheckIn: false,
      reason: "Đã quá muộn để check-in"
    };
  }

  return { canPassengerCheckIn: true };
}

export function getStatusBadgeVariant(status: TripStatus): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "pending":
      return "secondary";
    case "checked_in":
      return "outline";
    case "in_progress":
      return "default";
    case "completed":
      return "default";
    case "cancelled":
      return "destructive";
    default:
      return "secondary";
  }
}

export function getStatusLabel(status: TripStatus): string {
  switch (status) {
    case "pending":
      return "Chờ khởi hành";
    case "checked_in":
      return "Đã check-in";
    case "in_progress":
      return "Đang di chuyển";
    case "completed":
      return "Đã hoàn thành";
    case "cancelled":
      return "Đã hủy";
    default:
      return status;
  }
}

export function isTerminalStatus(status: TripStatus): boolean {
  return status === "completed" || status === "cancelled";
}

export function shouldSendDepartureReminder(
  status: TripStatus,
  departureWindowStart: string
): boolean {
  if (status !== "pending" && status !== "checked_in") {
    return false;
  }

  const now = new Date().getTime();
  const departureTime = new Date(departureWindowStart).getTime();
  const minutesUntilDeparture = (departureTime - now) / 60000;

  return minutesUntilDeparture >= 15 && minutesUntilDeparture <= 30;
}

export function getMinutesUntilDeparture(departureWindowStart: string): number {
  const now = new Date().getTime();
  const departureTime = new Date(departureWindowStart).getTime();
  return Math.round((departureTime - now) / 60000);
}
