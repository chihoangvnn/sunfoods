import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Package as PackageIcon, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PackageCard } from "@/ride-sharing/components/PackageCard";
import { PackageBidsList } from "@/ride-sharing/components/PackageBidsList";
import { mockPackages, mockPackageBids } from "@/ride-sharing/mockData";

export default function MyPackages() {
  const [activeTab, setActiveTab] = useState("active");
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);

  const currentUserId = "sender1";

  const userPackages = mockPackages.filter(pkg => pkg.senderId === currentUserId);
  
  const activePackages = userPackages.filter(pkg => 
    pkg.status === "pending" || 
    pkg.status === "bidded" || 
    pkg.status === "price_confirmed" || 
    pkg.status === "in_transit"
  );

  const deliveredPackages = userPackages.filter(pkg => pkg.status === "delivered");

  const handleAcceptBid = (bidId: string) => {
    console.log("Accepting bid:", bidId);
    alert(`Đã chấp nhận báo giá ${bidId}. Tài xế sẽ liên hệ bạn sớm!`);
  };

  const handleRejectBid = (bidId: string) => {
    console.log("Rejecting bid:", bidId);
    alert(`Đã từ chối báo giá ${bidId}`);
  };

  const selectedPackage = selectedPackageId 
    ? mockPackages.find(pkg => pkg.id === selectedPackageId)
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
              <PackageCard 
                key={pkg.id}
                package={pkg}
                viewerType="sender"
              />
            ))
          ) : (
            <Card className="p-8 text-center text-muted-foreground">
              <Inbox className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p>Chưa có đơn hàng nào được giao</p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
