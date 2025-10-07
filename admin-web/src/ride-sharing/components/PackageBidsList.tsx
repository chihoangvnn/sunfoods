import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, User, CheckCircle2, XCircle } from "lucide-react";
import type { PackageBid } from "../mockData";

interface PackageBidsListProps {
  bids: PackageBid[];
  onAcceptBid?: (bidId: string) => void;
  onRejectBid?: (bidId: string) => void;
  isProcessing?: boolean;
}

export function PackageBidsList({ 
  bids, 
  onAcceptBid, 
  onRejectBid,
  isProcessing = false
}: PackageBidsListProps) {
  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN') + ' ₫';
  };

  const getBidStatusBadge = (status: PackageBid["status"]) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">Chờ xác nhận</Badge>;
      case "accepted":
        return <Badge variant="secondary" className="bg-green-100 text-green-700">Đã chấp nhận</Badge>;
      case "rejected":
        return <Badge variant="secondary" className="bg-gray-100 text-gray-700">Đã từ chối</Badge>;
    }
  };

  if (bids.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Chưa có tài xế nào báo giá cho đơn hàng này</p>
        <p className="text-sm mt-2">Vui lòng chờ tài xế xem và báo giá</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="text-sm text-gray-600 mb-3">
        Có <span className="font-semibold">{bids.length}</span> báo giá từ tài xế
      </div>

      {bids.map((bid) => (
        <Card key={bid.id} className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-600" />
                  <span className="font-semibold">{bid.driverName}</span>
                </div>
                {getBidStatusBadge(bid.status)}
              </div>

              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Phone className="h-3 w-3" />
                {bid.driverPhone}
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                <div>
                  <div className="text-xs text-gray-500">Giá báo:</div>
                  <div className="text-xl font-bold text-emerald-700">
                    {formatPrice(bid.price)}
                  </div>
                </div>
                <div className="text-xs text-gray-500 text-right">
                  {formatTime(bid.createdAt)}
                </div>
              </div>
            </div>

            {bid.status === "pending" && (
              <div className="flex flex-col gap-2">
                <Button
                  size="sm"
                  onClick={() => onAcceptBid?.(bid.id)}
                  disabled={isProcessing}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  Chấp nhận
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onRejectBid?.(bid.id)}
                  disabled={isProcessing}
                  className="hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Từ chối
                </Button>
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
