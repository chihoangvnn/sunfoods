import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DiscountForm } from "./DiscountForm";
import { DiscountList } from "./DiscountList";
import { DiscountAnalytics } from "./DiscountAnalytics";
import { Plus, List, BarChart } from "lucide-react";

export function DiscountManagementDashboard() {
  const [activeTab, setActiveTab] = useState("list");

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            Danh sách mã giảm giá
          </TabsTrigger>
          <TabsTrigger value="create" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Tạo mã mới
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            Thống kê
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tất cả mã giảm giá</CardTitle>
              <CardDescription>
                Quản lý và theo dõi hiệu suất các mã giảm giá hiện có
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DiscountList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tạo mã giảm giá mới</CardTitle>
              <CardDescription>
                Thiết lập mã giảm giá cho chiến dịch marketing của bạn
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DiscountForm onSuccess={() => setActiveTab("list")} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Phân tích hiệu suất</CardTitle>
              <CardDescription>
                Thống kê chi tiết về hiệu quả các mã giảm giá
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DiscountAnalytics />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}