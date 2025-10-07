'use client'

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Package as PackageIcon, Inbox, Star, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PackageCard } from "@/ride-sharing/components/PackageCard";
import { PackageBidsList } from "@/ride-sharing/components/PackageBidsList";
import { EstimatedTimeDialog } from "@/ride-sharing/components/EstimatedTimeDialog";
import { DeliveryTimeline } from "@/ride-sharing/components/DeliveryTimeline";
import { PackageRatingDialog } from "@/ride-sharing/components/PackageRatingDialog";
import { CancelPackageDialog } from "@/ride-sharing/components/CancelPackageDialog";
import { mockPackages, mockPackageBids, type Package } from "@/ride-sharing/mockData";
import { useToast } from "@/hooks/use-toast";
import { canAcceptBid, canCancelPackage, canRatePackage } from "@/ride-sharing/utils/packageValidation";

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

export default function MyPackages() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [activeTab, setActiveTab] = useState("active");
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
  const [ratingPackage, setRatingPackage] = useState<Package | null>(null);
  const [cancelPackage, setCancelPackage] = useState<Package | null>(null);
  const [estimatedTimeDialogState, setEstimatedTimeDialogState] = useState<{
    open: boolean;
    bidId: string;
    driverId: string;
    driverName: string;
    driverPhone: string;
    packageId: string;
    bidPrice: number;
  }>({
    open: false,
    bidId: "",
    driverId: "",
    driverName: "",
    driverPhone: "",
    packageId: "",
    bidPrice: 0,
  });

  const { toast } = useToast();
  const currentUserId = "sender1";

  useEffect(() => {
    setPackages([...mockPackages]);
  }, []);

  const userPackages = packages.filter(pkg => pkg.senderId === currentUserId);
  
  const activePackages = userPackages.filter(pkg => 
    pkg.status === "pending" || 
    pkg.status === "bidded" || 
    pkg.status === "price_confirmed" || 
    pkg.status === "in_transit"
  );

  const deliveredPackages = userPackages.filter(pkg => pkg.status === "delivered");

  const handleAcceptBid = (bidId: string) => {
    console.log("Accepting bid:", bidId);
    
    const bid = Object.values(mockPackageBids)
      .flat()
      .find(b => b.id === bidId);
    
    if (bid) {
      const pkg = packages.find(p => p.id === bid.packageId);
      if (!pkg) return;

      const validation = canAcceptBid(pkg);
      if (!validation.canAccept) {
        toast({
          title: "Không thể chấp nhận báo giá",
          description: validation.reason,
          variant: "destructive",
        });
        return;
      }

      setEstimatedTimeDialogState({
        open: true,
        bidId: bid.id,
        driverId: bid.driverId,
        driverName: bid.driverName,
        driverPhone: bid.driverPhone,
        packageId: bid.packageId,
        bidPrice: bid.price,
      });
    }
  };

  const handleRejectBid = (bidId: string) => {
    console.log("Rejecting bid:", bidId);
    toast({
      title: "Đã từ chối báo giá",
      description: `Báo giá ${bidId} đã được từ chối`,
    });
  };

  const handleConfirmEstimatedTime = async (estimatedTime: string) => {
    const { bidId, driverId, packageId, driverName, driverPhone, bidPrice } = estimatedTimeDialogState;
    
    // Get current package data for notification
    const currentPackage = packages.find(pkg => pkg.id === packageId);
    
    console.log("Confirmed bid with estimated time:", {
      bidId,
      driverId,
      packageId,
      driverName,
      estimatedTime,
    });

    setPackages(prevPackages =>
      prevPackages.map(pkg =>
        pkg.id === packageId
          ? {
              ...pkg,
              status: "price_confirmed" as const,
              estimatedDeliveryTime: estimatedTime,
              confirmedPrice: bidPrice,
              confirmedDriverId: driverId,
              confirmedDriverName: driverName,
              confirmedDriverPhone: driverPhone,
              priceConfirmedAt: new Date().toISOString(),
            }
          : pkg
      )
    );

    toast({
      title: "Đã chấp nhận báo giá",
      description: `Tài xế ${driverName} sẽ giao hàng vào ${new Date(estimatedTime).toLocaleString('vi-VN')}`,
      duration: 5000,
    });

    // Trigger notification to driver
    if (currentPackage) {
      await triggerPackageNotification('bid_accepted', {
        driverId,
        packageId,
        senderName: currentPackage.senderName,
        pickupAddress: currentPackage.senderAddress,
      });
    }

    setEstimatedTimeDialogState({
      open: false,
      bidId: "",
      driverId: "",
      driverName: "",
      driverPhone: "",
      packageId: "",
      bidPrice: 0,
    });
  };

  const handleSubmitRating = (rating: number, comment: string) => {
    if (!ratingPackage) return;

    const validation = canRatePackage(ratingPackage, currentUserId);
    if (!validation.canRate) {
      toast({
        title: "Không thể đánh giá",
        description: validation.reason,
        variant: "destructive",
      });
      setRatingPackage(null);
      return;
    }

    console.log("Submitting rating:", {
      packageId: ratingPackage.id,
      driverId: ratingPackage.confirmedDriverId,
      driverName: ratingPackage.confirmedDriverName,
      rating,
      comment,
      ratedAt: new Date().toISOString(),
    });

    setPackages(prevPackages =>
      prevPackages.map(pkg =>
        pkg.id === ratingPackage.id
          ? {
              ...pkg,
              rating,
              ratingComment: comment,
              ratedAt: new Date().toISOString(),
            }
          : pkg
      )
    );

    // Rating submitted - no notification needed (confirmation only)
    console.log('⭐ Package rated:', {
      packageId: ratingPackage.id,
      rating,
      comment,
    });

    toast({
      title: "Đánh giá thành công",
      description: `Cảm ơn bạn đã đánh giá ${rating} sao cho tài xế ${ratingPackage.confirmedDriverName}`,
      duration: 5000,
    });

    setRatingPackage(null);
  };

  const handleCancelPackage = async (reason: string) => {
    if (!cancelPackage) return;

    const validation = canCancelPackage(cancelPackage, "sender");
    if (!validation.canCancel) {
      toast({
        title: "Không thể hủy đơn hàng",
        description: validation.reason,
        variant: "destructive",
      });
      setCancelPackage(null);
      return;
    }

    console.log("Cancelling package:", {
      packageId: cancelPackage.id,
      reason,
      cancelledBy: "sender",
      cancelledAt: new Date().toISOString(),
    });

    setPackages(prevPackages =>
      prevPackages.map(pkg =>
        pkg.id === cancelPackage.id
          ? {
              ...pkg,
              status: "cancelled" as const,
              cancelReason: reason,
              cancelledBy: "sender" as const,
              cancelledAt: new Date().toISOString(),
            }
          : pkg
      )
    );

    // Trigger notification to driver if package was already confirmed
    if (cancelPackage.status === 'price_confirmed' && cancelPackage.confirmedDriverId) {
      await triggerPackageNotification('package_cancelled', {
        userId: cancelPackage.confirmedDriverId,
        packageId: cancelPackage.id,
        cancelledBy: 'sender',
        cancellerName: cancelPackage.senderName,
        reason,
      });
    }

    toast({
      title: "Đã hủy đơn hàng",
      description: `Đơn hàng ${cancelPackage.id.toUpperCase()} đã được hủy`,
      duration: 3000,
    });

    setCancelPackage(null);
  };

  const selectedPackage = selectedPackageId 
    ? packages.find(pkg => pkg.id === selectedPackageId)
    : null;

  return (
    <div className="container mx-auto py-4 px-4 space-y-6">
      <div className="flex items-center gap-2">
        <PackageIcon className="h-6 w-6 text-orange-600" />
        <div>
          <h1 className="text-xl font-bold">Đơn Hàng Của Tôi</h1>
          <p className="text-muted-foreground">Quản lý các đơn hàng bạn đã gửi</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active">
            Đang gửi ({activePackages.length})
          </TabsTrigger>
          <TabsTrigger value="delivered">
            Đã giao ({deliveredPackages.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4 mt-6">
          {activePackages.length > 0 ? (
            <div className="space-y-6">
              {activePackages.map(pkg => (
                <div key={pkg.id} className="space-y-3">
                  <PackageCard 
                    package={pkg}
                    viewerType="sender"
                    onClick={() => setSelectedPackageId(selectedPackageId === pkg.id ? null : pkg.id)}
                  />
                  
                  {canCancelPackage(pkg, "sender").canCancel && (
                    <div className="pl-4">
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => setCancelPackage(pkg)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Hủy đơn
                      </Button>
                    </div>
                  )}
                  
                  {pkg.estimatedDeliveryTime && (pkg.status === "price_confirmed" || pkg.status === "in_transit") && (
                    <DeliveryTimeline package={pkg} />
                  )}
                  
                  {selectedPackageId === pkg.id && (
                    <Card className="p-4 bg-gray-50 border-l-4 border-orange-500">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold">Báo giá từ tài xế</h3>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setSelectedPackageId(null)}
                        >
                          Đóng
                        </Button>
                      </div>
                      <PackageBidsList
                        bids={mockPackageBids[pkg.id] || []}
                        onAcceptBid={handleAcceptBid}
                        onRejectBid={handleRejectBid}
                      />
                    </Card>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center text-muted-foreground">
              <Inbox className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p>Bạn chưa có đơn hàng nào đang gửi</p>
              <p className="text-sm mt-2">Tạo đơn hàng mới để bắt đầu</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="delivered" className="space-y-4 mt-6">
          {deliveredPackages.length > 0 ? (
            deliveredPackages.map(pkg => (
              <div key={pkg.id} className="space-y-3">
                <PackageCard 
                  package={pkg}
                  viewerType="sender"
                />
                
                {pkg.rating ? (
                  <Card className="p-4 bg-green-50 border-l-4 border-green-500">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                          Đã đánh giá
                        </Badge>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${
                                star <= pkg.rating!
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    {pkg.ratingComment && (
                      <p className="text-sm text-muted-foreground mt-2">
                        "{pkg.ratingComment}"
                      </p>
                    )}
                  </Card>
                ) : (
                  <Button 
                    className="w-full" 
                    onClick={() => setRatingPackage(pkg)}
                    disabled={!canRatePackage(pkg, currentUserId).canRate}
                  >
                    <Star className="h-4 w-4 mr-2" />
                    Đánh giá tài xế
                  </Button>
                )}
              </div>
            ))
          ) : (
            <Card className="p-8 text-center text-muted-foreground">
              <Inbox className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p>Chưa có đơn hàng nào được giao</p>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <EstimatedTimeDialog
        open={estimatedTimeDialogState.open}
        onOpenChange={(open) =>
          setEstimatedTimeDialogState((prev) => ({ ...prev, open }))
        }
        bidId={estimatedTimeDialogState.bidId}
        driverName={estimatedTimeDialogState.driverName}
        packageId={estimatedTimeDialogState.packageId}
        onConfirm={handleConfirmEstimatedTime}
      />

      {ratingPackage && (
        <PackageRatingDialog
          open={!!ratingPackage}
          onOpenChange={(open) => !open && setRatingPackage(null)}
          package={ratingPackage}
          onSubmitRating={handleSubmitRating}
        />
      )}

      {cancelPackage && (
        <CancelPackageDialog
          open={!!cancelPackage}
          onOpenChange={(open) => !open && setCancelPackage(null)}
          package={cancelPackage}
          cancellerRole="sender"
          onConfirmCancel={handleCancelPackage}
        />
      )}
    </div>
  );
}
