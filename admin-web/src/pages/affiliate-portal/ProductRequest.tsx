import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ProductRequest {
  id: string;
  productName: string;
  productDescription: string | null;
  productLink: string | null;
  suggestedPrice: string | null;
  categoryId: string | null;
  requestReason: string | null;
  status: 'pending' | 'approved' | 'rejected';
  approvedProductId: string | null;
  approvedCommissionRate: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  adminNotes: string | null;
  createdAt: string;
}

interface Category {
  id: string;
  name: string;
}

export default function ProductRequest() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    productName: "",
    productDescription: "",
    productLink: "",
    suggestedPrice: "",
    categoryId: "",
    requestReason: ""
  });

  const { data: requestsData, isLoading } = useQuery<{ success: boolean; data: ProductRequest[] }>({
    queryKey: ["/api/affiliate-portal/products/requests"],
  });

  const { data: categoriesData } = useQuery<{ success: boolean; data: Category[] }>({
    queryKey: ["/api/categories"],
  });

  const createRequestMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await fetch("/api/affiliate-portal/products/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data)
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Không thể gửi yêu cầu");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "✅ Gửi yêu cầu thành công",
        description: "Admin sẽ xem xét và phản hồi sớm nhất có thể"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/affiliate-portal/products/requests"] });
      setIsDialogOpen(false);
      setFormData({
        productName: "",
        productDescription: "",
        productLink: "",
        suggestedPrice: "",
        categoryId: "",
        requestReason: ""
      });
    },
    onError: (error: Error) => {
      toast({
        title: "❌ Lỗi",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.productName.trim()) {
      toast({
        title: "⚠️ Thiếu thông tin",
        description: "Vui lòng nhập tên sản phẩm",
        variant: "destructive"
      });
      return;
    }
    createRequestMutation.mutate(formData);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="gap-1 border-yellow-500 text-yellow-600"><Clock className="w-3 h-3" /> Chờ duyệt</Badge>;
      case 'approved':
        return <Badge variant="outline" className="gap-1 border-green-500 text-green-600"><CheckCircle className="w-3 h-3" /> Đã duyệt</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="gap-1"><XCircle className="w-3 h-3" /> Từ chối</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const requests = requestsData?.data || [];
  const categories = categoriesData?.data || [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">📝 Yêu Cầu Sản Phẩm</h1>
          <p className="text-muted-foreground mt-1">
            Đề xuất sản phẩm mới để bán
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Yêu cầu sản phẩm mới
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Yêu cầu sản phẩm mới</DialogTitle>
              <DialogDescription>
                Điền thông tin sản phẩm bạn muốn bán. Admin sẽ xem xét và phản hồi sớm.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="productName">Tên sản phẩm *</Label>
                <Input
                  id="productName"
                  value={formData.productName}
                  onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                  placeholder="Nhập tên sản phẩm..."
                  required
                />
              </div>

              <div>
                <Label htmlFor="productDescription">Mô tả sản phẩm</Label>
                <Textarea
                  id="productDescription"
                  value={formData.productDescription}
                  onChange={(e) => setFormData({ ...formData, productDescription: e.target.value })}
                  placeholder="Mô tả chi tiết về sản phẩm..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="productLink">Link sản phẩm</Label>
                  <Input
                    id="productLink"
                    type="url"
                    value={formData.productLink}
                    onChange={(e) => setFormData({ ...formData, productLink: e.target.value })}
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <Label htmlFor="suggestedPrice">Giá đề xuất (₫)</Label>
                  <Input
                    id="suggestedPrice"
                    type="number"
                    value={formData.suggestedPrice}
                    onChange={(e) => setFormData({ ...formData, suggestedPrice: e.target.value })}
                    placeholder="100000"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="categoryId">Danh mục</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="requestReason">Lý do yêu cầu</Label>
                <Textarea
                  id="requestReason"
                  value={formData.requestReason}
                  onChange={(e) => setFormData({ ...formData, requestReason: e.target.value })}
                  placeholder="Tại sao bạn muốn bán sản phẩm này?"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Hủy
                </Button>
                <Button type="submit" disabled={createRequestMutation.isPending}>
                  {createRequestMutation.isPending ? "Đang gửi..." : "Gửi yêu cầu"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tổng yêu cầu</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{requests.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Chờ duyệt</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-600">
              {requests.filter(r => r.status === 'pending').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Đã duyệt</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              {requests.filter(r => r.status === 'approved').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Từ chối</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">
              {requests.filter(r => r.status === 'rejected').length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách yêu cầu</CardTitle>
          <CardDescription>Theo dõi trạng thái các yêu cầu sản phẩm của bạn</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center py-8 text-muted-foreground">Đang tải...</p>
          ) : requests.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Chưa có yêu cầu nào</p>
              <Button
                variant="outline"
                className="mt-4 gap-2"
                onClick={() => setIsDialogOpen(true)}
              >
                <Plus className="w-4 h-4" />
                Tạo yêu cầu đầu tiên
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sản phẩm</TableHead>
                  <TableHead>Giá đề xuất</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>HH được duyệt</TableHead>
                  <TableHead>Ghi chú Admin</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{request.productName}</p>
                        {request.productDescription && (
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {request.productDescription}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {request.suggestedPrice 
                        ? `${parseInt(request.suggestedPrice).toLocaleString('vi-VN')}₫`
                        : "-"
                      }
                    </TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell>
                      {request.approvedCommissionRate 
                        ? <Badge variant="secondary">{request.approvedCommissionRate}</Badge>
                        : "-"
                      }
                    </TableCell>
                    <TableCell>
                      {request.adminNotes || "-"}
                    </TableCell>
                    <TableCell>
                      {new Date(request.createdAt).toLocaleDateString('vi-VN')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
