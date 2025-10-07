import { CategoryFAQTemplatesManagement } from "@/components/CategoryFAQTemplatesManagement";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function FaqTemplatesPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">FAQ Template</h1>
        <p className="text-muted-foreground">
          Quản lý FAQ mẫu cho từng danh mục. Sản phẩm sẽ tự động kế thừa FAQ từ danh mục của mình.
        </p>
      </div>

      {/* FAQ Templates Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📋 Quản lý FAQ Template cho Danh mục
          </CardTitle>
          <CardDescription>
            Thiết lập FAQ mẫu cho từng danh mục. Khi bật "Auto Inherit", tất cả sản phẩm trong danh mục sẽ tự động có FAQ này. 
            Bot RASA sẽ sử dụng FAQ để trả lời khách hàng khi được hỏi về sản phẩm.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CategoryFAQTemplatesManagement />
        </CardContent>
      </Card>
    </div>
  );
}