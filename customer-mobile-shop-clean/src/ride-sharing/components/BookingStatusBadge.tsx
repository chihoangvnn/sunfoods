'use client'

import { Badge } from "@/components/ui/badge";

type BookingStatus = 'pending_confirmation' | 'confirmed' | 'cancelled_by_passenger' | 'cancelled_by_driver' | 'completed';

interface BookingStatusBadgeProps {
  status: BookingStatus;
}

export function BookingStatusBadge({ status }: BookingStatusBadgeProps) {
  const statusConfig: Record<BookingStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    pending_confirmation: { label: "Chờ xác nhận", variant: "outline" },
    confirmed: { label: "Đã xác nhận", variant: "default" },
    cancelled_by_passenger: { label: "Khách hủy", variant: "secondary" },
    cancelled_by_driver: { label: "Tài xế hủy", variant: "destructive" },
    completed: { label: "Đã hoàn thành", variant: "secondary" }
  };

  const config = statusConfig[status];

  return (
    <Badge variant={config.variant}>
      {config.label}
    </Badge>
  );
}
