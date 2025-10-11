import { Badge } from "@/components/ui/badge";
import { getStatusLabel, getStatusBadgeVariant } from "../utils/tripValidation";
import type { TripStatus } from "../mockData";

interface TripStatusBadgeProps {
  status: TripStatus;
  className?: string;
}

export function TripStatusBadge({ status, className }: TripStatusBadgeProps) {
  return (
    <Badge variant={getStatusBadgeVariant(status)} className={className}>
      {getStatusLabel(status)}
    </Badge>
  );
}
