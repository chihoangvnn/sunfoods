import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Edit, Trash2, Eye, Copy, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface DiscountCode {
  id: number;
  code: string;
  name: string;
  description: string;
  type: "percentage" | "fixed" | "hybrid";
  discountValue: string;
  maxDiscountAmount?: string;
  maxUsage: number;
  maxUsagePerCustomer: number;
  minOrderAmount: string;
  validFrom: string;
  validUntil: string;
  channelRestrictions: {
    allowedChannels: string[];
  };
  status: "draft" | "active" | "inactive" | "expired" | "used_up";
  usageCount: number;
  usagePercentage: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

interface DiscountListResponse {
  success: boolean;
  data: DiscountCode[];
  pagination: {
    page: number;
    limit: number;
    total: string;
    totalPages: number;
  };
}

export function DiscountList() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);

  const { data: discountsResponse, isLoading, error } = useQuery<DiscountListResponse>({
    queryKey: ["discounts", searchTerm, statusFilter, currentPage],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== "all" && { status: statusFilter })
      });
      
      const response = await fetch(`/api/discounts?${params}`);
      if (!response.ok) {
        throw new Error("Không thể tải danh sách mã giảm giá");
      }
      return response.json();
    }
  });

  const deleteDiscountMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/discounts/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Không thể xóa mã giảm giá");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Thành công!",
        description: "Mã giảm giá đã được xóa",
      });
      queryClient.invalidateQueries({ queryKey: ["discounts"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi!",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await fetch(`/api/discounts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (!response.ok) {
        throw new Error("Không thể cập nhật trạng thái");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Thành công!",
        description: "Trạng thái mã giảm giá đã được cập nhật",
      });
      queryClient.invalidateQueries({ queryKey: ["discounts"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi!",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Đã sao chép!",
      description: `Mã giảm giá "${code}" đã được sao chép`,
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: "Nháp", variant: "secondary" as const },
      active: { label: "Hoạt động", variant: "default" as const },
      inactive: { label: "Tạm ngưng", variant: "outline" as const },
      expired: { label: "Hết hạn", variant: "destructive" as const },
      used_up: { label: "Hết lượt", variant: "destructive" as const },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getDiscountDisplay = (discount: DiscountCode) => {
    if (discount.type === "percentage") {
      return `${discount.discountValue}%${discount.maxDiscountAmount ? ` (tối đa ${parseInt(discount.maxDiscountAmount).toLocaleString('vi-VN')}đ)` : ''}`;
    } else if (discount.type === "fixed") {
      return `${parseInt(discount.discountValue).toLocaleString('vi-VN')}đ`;
    } else {
      return `${discount.discountValue}% (tối đa ${parseInt(discount.maxDiscountAmount || '0').toLocaleString('vi-VN')}đ)`;
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Đang tải...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-4">Lỗi: {error.message}</div>;
  }

  const discounts = discountsResponse?.data || [];
  const pagination = discountsResponse?.pagination;

  return (
    <div className="space-y-4">
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Tìm kiếm theo mã hoặc tên..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Lọc theo trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="draft">Nháp</SelectItem>
            <SelectItem value="active">Hoạt động</SelectItem>
            <SelectItem value="inactive">Tạm ngưng</SelectItem>
            <SelectItem value="expired">Hết hạn</SelectItem>
            <SelectItem value="used_up">Hết lượt</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Discounts Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã giảm giá</TableHead>
              <TableHead>Tên</TableHead>
              <TableHead>Loại giảm giá</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Sử dụng</TableHead>
              <TableHead>Thời hạn</TableHead>
              <TableHead>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {discounts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Không có mã giảm giá nào
                </TableCell>
              </TableRow>
            ) : (
              discounts.map((discount) => (
                <TableRow key={discount.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <code className="font-mono font-bold">{discount.code}</code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(discount.code)}
                        className="h-6 w-6 p-0"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{discount.name}</div>
                      {discount.description && (
                        <div className="text-sm text-muted-foreground">{discount.description}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{getDiscountDisplay(discount)}</div>
                      <div className="text-sm text-muted-foreground">
                        Tối thiểu: {parseInt(discount.minOrderAmount).toLocaleString('vi-VN')}đ
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(discount.status)}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{discount.usageCount} / {discount.maxUsage}</div>
                      <div className="text-muted-foreground">
                        {discount.usagePercentage}% đã sử dụng
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>Từ: {format(new Date(discount.validFrom), "dd/MM/yyyy", { locale: vi })}</div>
                      <div>Đến: {format(new Date(discount.validUntil), "dd/MM/yyyy", { locale: vi })}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => copyToClipboard(discount.code)}>
                          <Copy className="mr-2 h-4 w-4" />
                          Sao chép mã
                        </DropdownMenuItem>
                        
                        {discount.status === "draft" && (
                          <DropdownMenuItem 
                            onClick={() => updateStatusMutation.mutate({ id: discount.id, status: "active" })}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Kích hoạt
                          </DropdownMenuItem>
                        )}
                        
                        {discount.status === "active" && (
                          <DropdownMenuItem 
                            onClick={() => updateStatusMutation.mutate({ id: discount.id, status: "inactive" })}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Tạm ngưng
                          </DropdownMenuItem>
                        )}
                        
                        <DropdownMenuItem onClick={() => {}}>
                          <Edit className="mr-2 h-4 w-4" />
                          Chỉnh sửa
                        </DropdownMenuItem>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <Trash2 className="mr-2 h-4 w-4" />
                              Xóa
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                              <AlertDialogDescription>
                                Bạn có chắc chắn muốn xóa mã giảm giá "{discount.code}"? 
                                Hành động này không thể hoàn tác.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Hủy</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteDiscountMutation.mutate(discount.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Xóa
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Trang {pagination.page} / {pagination.totalPages} 
            (Tổng {pagination.total} mã giảm giá)
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage <= 1}
            >
              Trước
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(pagination.totalPages, currentPage + 1))}
              disabled={currentPage >= pagination.totalPages}
            >
              Sau
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}