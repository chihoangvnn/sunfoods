import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Truck, CheckCircle2, Inbox } from "lucide-react";
import { PackageCard } from "@/ride-sharing/components/PackageCard";
import { PackageDetailsDialog } from "@/ride-sharing/components/PackageDetailsDialog";
import { mockPackages } from "@/ride-sharing/mockData";

export default function DriverDeliveries() {
  const [selectedPackage, setSelectedPackage] = useState<typeof mockPackages[0] | null>(null);

  const currentDriverId = "d1";

  const deliveryPackages = mockPackages.filter(pkg => 
    (pkg.status === "price_confirmed" || pkg.status === "in_transit") &&
    pkg.confirmedDriverId === currentDriverId
  );

  const handleMarkAsDelivered = (packageId: string) => {
    if (confirm("Xác nhận đã giao hàng thành công?")) {
      console.log("Marking as delivered:", packageId);
      alert(`Đơn hàng ${packageId.toUpperCase()} đã được đánh dấu đã giao!`);
    }
  };

  const handleStartDelivery = (packageId: string) => {
    console.log("Starting delivery:", packageId);
    alert(`Đã bắt đầu giao đơn hàng ${packageId.toUpperCase()}`);
  };

  return (
    <div className="container mx-auto py-4 px-4 space-y-6">
      <div className="flex items-center gap-2">
        <Truck className="h-6 w-6 text-orange-600" />
        <div>
          <h1 className="text-xl font-bold">Đơn Đang Giao</h1>
          <p className="text-muted-foreground">Quản lý các đơn hàng bạn đang giao</p>
        </div>
      </div>

      {deliveryPackages.length > 0 ? (
        <div className="space-y-4">
          {deliveryPackages.map(pkg => (
            <div key={pkg.id} className="space-y-2">
              <PackageCard
                package={pkg}
                viewerType="driver"
                onClick={() => setSelectedPackage(pkg)}
              />
              <div className="flex gap-2 pl-4">
                {pkg.status === "price_confirmed" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStartDelivery(pkg.id)}
                    className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-300"
                  >
                    Bắt đầu giao hàng
                  </Button>
                )}
                {pkg.status === "in_transit" && (
                  <Button
                    size="sm"
                    onClick={() => handleMarkAsDelivered(pkg.id)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    Đã giao hàng
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center text-muted-foreground">
          <Inbox className="h-12 w-12 mx-auto mb-3 text-gray-400" />
          <p>Bạn chưa có đơn hàng nào đang giao</p>
          <p className="text-sm mt-2">Báo giá cho các đơn hàng mới để bắt đầu</p>
        </Card>
      )}

      <PackageDetailsDialog
        package={selectedPackage}
        open={!!selectedPackage}
        onOpenChange={(open) => !open && setSelectedPackage(null)}
        viewerType="driver"
      />
    </div>
  );
}
