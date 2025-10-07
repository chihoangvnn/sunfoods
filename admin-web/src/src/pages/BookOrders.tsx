import { BookOrderTable } from "@/components/BookOrderTable";

export default function BookOrders() {
  return (
    <div className="p-6" data-testid="page-book-orders">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Quản lý đơn hàng sách</h1>
        <p className="text-muted-foreground">
          Theo dõi và xử lý các đơn hàng sách từ khách hàng với tính năng chuyên biệt cho sách
        </p>
      </div>
      <BookOrderTable />
    </div>
  );
}