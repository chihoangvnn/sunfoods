'use client'

import { Badge } from "@/components/ui/badge";
import type { Package } from "../mockData";
import { getStatusBadgeVariant, getStatusLabel } from "../utils/packageValidation";

interface PackageStatusBadgeProps {
  status: Package["status"];
}

const statusClassNames = {
  pending: "bg-gray-100 text-gray-700 hover:bg-gray-200",
  bidded: "bg-yellow-100 text-yellow-700 hover:bg-yellow-200",
  price_confirmed: "bg-blue-100 text-blue-700 hover:bg-blue-200",
  in_transit: "bg-green-100 text-green-700 hover:bg-green-200",
  delivered: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200",
  cancelled: "bg-red-100 text-red-700 hover:bg-red-200"
};

export function PackageStatusBadge({ status }: PackageStatusBadgeProps) {
  const variant = getStatusBadgeVariant(status);
  const label = getStatusLabel(status);
  const className = statusClassNames[status] || statusClassNames.pending;
  
  return (
    <Badge variant={variant} className={className}>
      {label}
    </Badge>
  );
}
