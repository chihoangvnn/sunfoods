import { DiscountManagementDashboard } from "@/components/admin/DiscountManagementDashboard";

export default function DiscountManagement() {
  return (
    <div className="p-6" data-testid="page-discount-management">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Quản lý mã giảm giá</h1>
        <p className="text-muted-foreground">
          Tạo và quản lý các mã giảm giá cho nhang sạch của bạn
        </p>
      </div>
      <DiscountManagementDashboard />
    </div>
  );
}