'use client'

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Truck, CheckCircle2, Inbox, Ban } from "lucide-react";
import { PackageCard } from "@/ride-sharing/components/PackageCard";
import { PackageDetailsDialog } from "@/ride-sharing/components/PackageDetailsDialog";
import { PODUploadDialog } from "@/ride-sharing/components/PODUploadDialog";
import { CancelPackageDialog } from "@/ride-sharing/components/CancelPackageDialog";
import { mockPackages, type Package } from "@/ride-sharing/mockData";
import { useToast } from "@/hooks/use-toast";
import { canStartDelivery, canMarkDelivered, canCancelPackage } from "@/ride-sharing/utils/packageValidation";

/**
 * NOTIFICATION SYSTEM - Mock Mode
 * 
 * Notification functions are called directly for demonstration in mock mode.
 * In production with backend, these calls should be made server-side via API routes.
 * Functions will attempt to send push notifications; if no subscriptions exist, they return gracefully.
 */

// Helper function to trigger package notifications (simulates backend API call)
async function triggerPackageNotification(eventType: string, data: any) {
  try {
    // In mock mode, we simulate an API call that would trigger notifications server-side
    // For production, this would be: await fetch('/api/packages/notify', { method: 'POST', body: JSON.stringify({ eventType, data }) })
    
    console.log('📧 Package notification triggered:', {
      eventType,
      data,
      note: 'In production, server would call push notification functions and send Web Push to subscribed devices'
    });
  } catch (error) {
    console.error('Notification trigger failed:', error);
  }
}

export default function DriverDeliveries() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [podPackage, setPodPackage] = useState<Package | null>(null);
  const [cancelPackage, setCancelPackage] = useState<Package | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const currentDriverId = "d1";

  useEffect(() => {
    setPackages([...mockPackages]);
  }, []);

  const deliveryPackages = packages.filter(pkg => 
    (pkg.status === "price_confirmed" || pkg.status === "in_transit") &&
    pkg.confirmedDriverId === currentDriverId
  );

  const handleMarkAsDelivered = (pkg: Package) => {
    const validation = canMarkDelivered(pkg, currentDriverId);
    if (!validation.canMarkDelivered) {
      toast({
        title: "Không thể đánh dấu đã giao",
        description: validation.reason,
        variant: "destructive",
      });
      return;
    }
    setPodPackage(pkg);
  };

  const handlePODConfirm = async (podData: {
    podImages: string[];
    podOtp: string;
    podTimestamp: string;
  }) => {
    if (!podPackage || isProcessing) return;

    setIsProcessing(true);
    console.log("POD Confirmation for package:", podPackage.id);
    console.log("POD Data:", podData);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setPackages(prevPackages => 
      prevPackages.map(pkg => 
        pkg.id === podPackage.id
          ? {
              ...pkg,
              status: "delivered" as const,
              podImages: podData.podImages,
              podOtp: podData.podOtp,
              podTimestamp: podData.podTimestamp,
              deliveredAt: podData.podTimestamp
            }
          : pkg
      )
    );
    
    toast({
      title: "Đã xác nhận giao hàng thành công!",
      description: `Đơn hàng ${podPackage.id.toUpperCase()} đã được đánh dấu đã giao với POD`,
      duration: 3000,
    });

    // Trigger notification to sender about delivery
    const deliveredAt = new Date().toISOString();
    await triggerPackageNotification('package_delivered', {
      senderId: podPackage.senderId,
      packageId: podPackage.id,
      driverName: 'Tài xế hiện tại',
      deliveredAt,
    });
    
    setPodPackage(null);
    setIsProcessing(false);
  };

  const handleStartDelivery = async (packageId: string) => {
    const pkg = packages.find(p => p.id === packageId);
    if (!pkg) return;

    const validation = canStartDelivery(pkg, currentDriverId);
    if (!validation.canStart) {
      toast({
        title: "Không thể bắt đầu giao hàng",
        description: validation.reason,
        variant: "destructive",
      });
      return;
    }

    setPackages(prevPackages =>
      prevPackages.map(pkg =>
        pkg.id === packageId
          ? { ...pkg, status: "in_transit" as const }
          : pkg
      )
    );
    
    toast({
      title: "Đã bắt đầu giao hàng",
      description: `Đơn hàng ${packageId.toUpperCase()} đang trên đường giao`,
    });

    // Trigger notification to sender
    await triggerPackageNotification('delivery_started', {
      senderId: pkg.senderId,
      packageId: pkg.id,
      driverName: 'Tài xế hiện tại',
      driverPhone: '0901234567',
    });
  };

  const handleCancelDelivery = async (reason: string) => {
    if (!cancelPackage) return;

    const validation = canCancelPackage(cancelPackage, "driver");
    if (!validation.canCancel) {
      toast({
        title: "Không thể hủy đơn hàng",
        description: validation.reason,
        variant: "destructive",
      });
      setCancelPackage(null);
      return;
    }

    console.log("Driver cancelling delivery:", {
      packageId: cancelPackage.id,
      reason,
      cancelledBy: "driver",
      cancelledAt: new Date().toISOString(),
    });

    setPackages(prevPackages =>
      prevPackages.map(pkg =>
        pkg.id === cancelPackage.id
          ? {
              ...pkg,
              status: "cancelled" as const,
              cancelReason: reason,
              cancelledBy: "driver" as const,
              cancelledAt: new Date().toISOString(),
            }
          : pkg
      )
    );

    // Trigger notification to sender about cancellation
    await triggerPackageNotification('package_cancelled', {
      userId: cancelPackage.senderId,
      packageId: cancelPackage.id,
      cancelledBy: 'driver',
      cancellerName: 'Tài xế hiện tại',
      reason,
    });

    toast({
      title: "Đã hủy nhận đơn",
      description: `Đơn hàng ${cancelPackage.id.toUpperCase()} đã được hủy`,
      duration: 3000,
    });

    setCancelPackage(null);
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
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStartDelivery(pkg.id)}
                      disabled={!canStartDelivery(pkg, currentDriverId).canStart}
                      className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-300"
                    >
                      Bắt đầu giao hàng
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setCancelPackage(pkg)}
                      disabled={!canCancelPackage(pkg, "driver").canCancel}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300"
                    >
                      <Ban className="h-4 w-4 mr-1" />
                      Hủy nhận đơn
                    </Button>
                  </>
                )}
                {pkg.status === "in_transit" && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => handleMarkAsDelivered(pkg)}
                      disabled={!canMarkDelivered(pkg, currentDriverId).canMarkDelivered}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Đã giao hàng
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setCancelPackage(pkg)}
                      disabled={!canCancelPackage(pkg, "driver").canCancel}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300"
                    >
                      <Ban className="h-4 w-4 mr-1" />
                      Hủy nhận đơn
                    </Button>
                  </>
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

      <PODUploadDialog
        open={!!podPackage}
        onOpenChange={() => setPodPackage(null)}
        packageId={podPackage?.id || ""}
        receiverName={podPackage?.receiverName || ""}
        receiverPhone={podPackage?.receiverPhone || ""}
        onConfirm={handlePODConfirm}
      />

      {cancelPackage && (
        <CancelPackageDialog
          open={!!cancelPackage}
          onOpenChange={(open) => !open && setCancelPackage(null)}
          package={cancelPackage}
          cancellerRole="driver"
          onConfirmCancel={handleCancelDelivery}
        />
      )}
    </div>
  );
}
