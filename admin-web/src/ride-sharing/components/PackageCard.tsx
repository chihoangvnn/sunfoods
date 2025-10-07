import { Card } from "@/components/ui/card";
import { Package as PackageIcon, MapPin, Phone, Clock } from "lucide-react";
import { PackageStatusBadge } from "./PackageStatusBadge";
import type { Package } from "../mockData";

interface PackageCardProps {
  package: Package;
  viewerType: "sender" | "driver";
  onClick?: () => void;
}

export function PackageCard({ package: pkg, viewerType, onClick }: PackageCardProps) {
  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('vi-VN', { 
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1).replace(/\.0$/, '')}tr`;
    } else if (price >= 1000) {
      return `${(price / 1000).toFixed(0)}k`;
    }
    return `${price}`;
  };

  const canSeeReceiverPhone = pkg.status === "price_confirmed" || pkg.status === "in_transit" || pkg.status === "delivered";

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <Card 
      className={`p-4 hover:shadow-md transition-shadow ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={handleKeyDown}
    >
      <div className="flex gap-4">
        {pkg.images.length > 0 && (
          <div className="w-20 h-20 flex-shrink-0 rounded overflow-hidden bg-gray-100 relative">
            <img 
              src={pkg.images[0]} 
              alt="Package" 
              className="w-full h-full object-cover"
            />
            {pkg.images.length > 1 && (
              <div className="absolute inset-0 flex items-end justify-end p-1">
                <span className="bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                  +{pkg.images.length - 1}
                </span>
              </div>
            )}
          </div>
        )}

        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <PackageIcon className="h-4 w-4 text-orange-600" />
              <span className="font-semibold">Mã: {pkg.id.toUpperCase()}</span>
            </div>
            <PackageStatusBadge status={pkg.status} />
          </div>

          <div className="space-y-1 text-sm">
            {viewerType === "driver" && (
              <>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-green-600" />
                  <div>
                    <div className="font-medium">Người gửi: {pkg.senderName}</div>
                    <div className="text-muted-foreground">{pkg.senderAddress}</div>
                    <div className="text-muted-foreground flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {pkg.senderPhone}
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-red-600" />
              <div>
                <div className="font-medium">
                  {viewerType === "sender" ? "Người nhận" : "Giao đến"}: {pkg.receiverName}
                </div>
                <div className="text-muted-foreground">{pkg.receiverAddress}</div>
                {canSeeReceiverPhone && (
                  <div className="text-muted-foreground flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {pkg.receiverPhone}
                  </div>
                )}
                {!canSeeReceiverPhone && viewerType === "driver" && (
                  <div className="text-xs text-gray-400 italic">
                    SĐT hiển thị sau khi xác nhận giá
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatTime(pkg.createdAt)}
            </div>
            {pkg.confirmedPrice && (
              <div className="font-semibold text-emerald-700">
                💰 {formatPrice(pkg.confirmedPrice)}
              </div>
            )}
            {pkg.confirmedDriverName && viewerType === "sender" && (
              <div>
                Tài xế: {pkg.confirmedDriverName}
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
