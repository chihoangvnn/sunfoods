import { Badge } from "@/components/ui/badge";
import type { Package } from "../mockData";

interface PackageStatusBadgeProps {
  status: Package["status"];
}

const statusConfig = {
  pending: {
    label: "Chờ báo giá",
    variant: "secondary" as const,
    className: "bg-gray-100 text-gray-700 hover:bg-gray-200"
  },
  bidded: {
    label: "Có báo giá",
    variant: "secondary" as const,
    className: "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
  },
  price_confirmed: {
    label: "Đã xác nhận giá",
    variant: "secondary" as const,
    className: "bg-blue-100 text-blue-700 hover:bg-blue-200"
  },
  in_transit: {
    label: "Đang giao",
    variant: "secondary" as const,
    className: "bg-green-100 text-green-700 hover:bg-green-200"
  },
  delivered: {
    label: "Đã giao",
    variant: "secondary" as const,
    className: "bg-gray-100 text-gray-700 hover:bg-gray-200"
  }
};

export function PackageStatusBadge({ status }: PackageStatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  );
}
