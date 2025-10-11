'use client'

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Truck, Inbox } from "lucide-react";
import { PackageCard } from "@/ride-sharing/components/PackageCard";
import { PackageDetailsDialog } from "@/ride-sharing/components/PackageDetailsDialog";
import { mockPackages } from "@/ride-sharing/mockData";

export default function DriverPackages() {
  const [selectedPackage, setSelectedPackage] = useState<typeof mockPackages[0] | null>(null);

  const availablePackages = mockPackages.filter(pkg => 
    pkg.status === "pending" || pkg.status === "bidded"
  );

  const handleSubmitBid = (packageId: string, price: number) => {
    console.log("Submitting bid:", { packageId, price });
    alert(`Đã gửi báo giá ${price.toLocaleString('vi-VN')} ₫ cho đơn hàng ${packageId.toUpperCase()}`);
  };

  return (
    <div className="container mx-auto py-4 px-4 space-y-6">
      <div className="flex items-center gap-2">
        <Truck className="h-6 w-6 text-orange-600" />
        <div>
          <h1 className="text-xl font-bold">Đơn Hàng Cần Giao</h1>
          <p className="text-muted-foreground">Xem và báo giá cho các đơn hàng</p>
        </div>
      </div>

      {availablePackages.length > 0 ? (
        <div className="space-y-4">
          {availablePackages.map(pkg => (
            <PackageCard
              key={pkg.id}
              package={pkg}
              viewerType="driver"
              onClick={() => setSelectedPackage(pkg)}
            />
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center text-muted-foreground">
          <Inbox className="h-12 w-12 mx-auto mb-3 text-gray-400" />
          <p>Chưa có đơn hàng mới nào cần báo giá</p>
          <p className="text-sm mt-2">Kiểm tra lại sau</p>
        </Card>
      )}

      <PackageDetailsDialog
        package={selectedPackage}
        open={!!selectedPackage}
        onOpenChange={(open) => !open && setSelectedPackage(null)}
        onSubmitBid={handleSubmitBid}
        viewerType="driver"
      />
    </div>
  );
}
