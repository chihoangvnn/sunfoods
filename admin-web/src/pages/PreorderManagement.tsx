import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit3, Trash2, Copy, ExternalLink, Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface Product {
  id: string;
  name: string;
  price: string;
  image?: string;
}

interface Preorder {
  id: string;
  productId?: string;
  productName?: string;
  slug: string;
  title: string;
  description?: string;
  price: string;
  unit: string;
  estimatedDate: string;
  bannerImage?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const UNITS = [
  { value: 'cái', label: 'Cái' },
  { value: 'kg', label: 'Kg' },
  { value: 'bó', label: 'Bó' },
  { value: 'gói', label: 'Gói' },
  { value: 'túi', label: 'Túi' },
  { value: 'hộp', label: 'Hộp' },
];

function generateSlug(title: string): string {
  if (!title || title.trim().length === 0) {
    return 'preorder';
  }
  
  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
    .replace(/[èéẹẻẽêềếệểễ]/g, 'e')
    .replace(/[ìíịỉĩ]/g, 'i')
    .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
    .replace(/[ùúụủũưừứựửữ]/g, 'u')
    .replace(/[ỳýỵỷỹ]/g, 'y')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

  return slug || 'preorder';
}

export default function PreorderManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [editingPreorder, setEditingPreorder] = useState<Preorder | null>(null);
  const [formData, setFormData] = useState({
    productId: '',
    title: '',
    slug: '',
    description: '',
    price: '',
    unit: 'cái',
    estimatedDate: '',
    bannerImage: '',
    isActive: true,
  });
  const [estimatedDate, setEstimatedDate] = useState<Date | undefined>(undefined);

  const { data: preorders = [], isLoading: preordersLoading } = useQuery<Preorder[]>({
    queryKey: ['/api/preorders'],
    queryFn: async () => {
      const res = await fetch('/api/preorders', {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch preorders');
      const data = await res.json();
      return data.data || data;
    },
  });

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ['/api/products'],
    queryFn: async () => {
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error('Failed to fetch products');
      return res.json();
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const url = editingPreorder 
        ? `/api/preorders/${editingPreorder.id}`
        : '/api/preorders';
      
      const response = await fetch(url, {
        method: editingPreorder ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...data,
          productId: data.productId || undefined,
          price: parseFloat(data.price),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save preorder');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: editingPreorder ? "Pre-order đã được cập nhật" : "Pre-order đã được tạo",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/preorders'] });
      handleCloseDialog();
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/preorders/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete preorder');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Pre-order đã được xóa",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/preorders'] });
    },
    onError: () => {
      toast({
        title: "Lỗi",
        description: "Không thể xóa pre-order",
        variant: "destructive",
      });
    },
  });

  const handleOpenDialog = (preorder?: Preorder) => {
    if (preorder) {
      setEditingPreorder(preorder);
      const date = new Date(preorder.estimatedDate);
      setEstimatedDate(date);
      
      setFormData({
        productId: preorder.productId || '',
        title: preorder.title,
        slug: preorder.slug,
        description: preorder.description || '',
        price: preorder.price,
        unit: preorder.unit,
        estimatedDate: preorder.estimatedDate,
        bannerImage: preorder.bannerImage || '',
        isActive: preorder.isActive,
      });
    } else {
      setEditingPreorder(null);
      setEstimatedDate(undefined);
      setFormData({
        productId: '',
        title: '',
        slug: '',
        description: '',
        price: '',
        unit: 'cái',
        estimatedDate: '',
        bannerImage: '',
        isActive: true,
      });
    }
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setEditingPreorder(null);
  };

  const handleProductChange = (productId: string) => {
    if (!productId) {
      setFormData({
        ...formData,
        productId: '',
        title: '',
        slug: '',
        price: '',
      });
      return;
    }

    const product = products.find(p => p.id === productId);
    if (product) {
      const generatedSlug = generateSlug(product.name);
      setFormData({
        ...formData,
        productId,
        title: product.name,
        slug: generatedSlug,
        price: product.price,
      });
    }
  };

  const handleTitleChange = (title: string) => {
    const generatedSlug = generateSlug(title);
    setFormData({
      ...formData,
      title,
      slug: generatedSlug,
    });
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.slug) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền tiêu đề",
        variant: "destructive",
      });
      return;
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập giá hợp lệ",
        variant: "destructive",
      });
      return;
    }

    if (!estimatedDate) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn ngày dự kiến về hàng",
        variant: "destructive",
      });
      return;
    }

    saveMutation.mutate({
      ...formData,
      estimatedDate: estimatedDate.toISOString(),
    });
  };

  const handleDelete = (preorder: Preorder) => {
    if (window.confirm(`Bạn có chắc muốn xóa pre-order "${preorder.title}"?`)) {
      deleteMutation.mutate(preorder.id);
    }
  };

  const handleCopyLink = (slug: string) => {
    const link = `${window.location.origin}/orders/${slug}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Đã sao chép",
      description: "Link pre-order đã được sao chép vào clipboard",
    });
  };

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(parseFloat(price));
  };

  if (preordersLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Đang tải pre-orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Pre-order Management</h1>
          <p className="text-muted-foreground">
            Quản lý các sản phẩm đặt trước
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Tạo Pre-order
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sản phẩm/Tiêu đề</TableHead>
              <TableHead>Giá</TableHead>
              <TableHead>Dự kiến về</TableHead>
              <TableHead>Đơn vị</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {preorders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  Chưa có pre-order nào. Nhấn "Tạo Pre-order" để bắt đầu.
                </TableCell>
              </TableRow>
            ) : (
              preorders.map((preorder) => (
                <TableRow key={preorder.id}>
                  <TableCell className="font-medium">
                    {preorder.productName || preorder.title}
                  </TableCell>
                  <TableCell className="font-semibold">
                    {formatPrice(preorder.price)}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      Dự kiến về: {format(new Date(preorder.estimatedDate), 'dd/MM/yyyy', { locale: vi })}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{preorder.unit}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={preorder.isActive ? "default" : "secondary"}>
                      {preorder.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDialog(preorder)}
                        title="Sửa"
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(preorder)}
                        title="Xóa"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyLink(preorder.slug)}
                        title="Sao chép link"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(`/orders/${preorder.slug}`, '_blank')}
                        title="Xem trước"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPreorder ? 'Chỉnh sửa Pre-order' : 'Tạo Pre-order mới'}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="product">Sản phẩm (Tùy chọn)</Label>
              <Select value={formData.productId} onValueChange={handleProductChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn sản phẩm hoặc để trống cho standalone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">-- Không liên kết sản phẩm --</SelectItem>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} - {formatPrice(product.price)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Chọn sản phẩm để tự động điền thông tin, hoặc để trống để tạo pre-order độc lập
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="title">Tiêu đề *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Nhập tiêu đề pre-order"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="slug-tu-dong-tao"
              />
              <p className="text-xs text-muted-foreground">
                Preview link: <code className="bg-muted px-1 rounded">/orders/{formData.slug || 'slug'}</code>
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Nhập mô tả pre-order"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="price">Giá *</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0"
                  min="0"
                  step="1000"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="unit">Đơn vị *</Label>
                <Select value={formData.unit} onValueChange={(value) => setFormData({ ...formData, unit: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {UNITS.map((unit) => (
                      <SelectItem key={unit.value} value={unit.value}>
                        {unit.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Ngày dự kiến về hàng *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`justify-start text-left font-normal ${!estimatedDate && "text-muted-foreground"}`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {estimatedDate ? (
                      `Dự kiến về ngày ${format(estimatedDate, 'dd/MM/yyyy', { locale: vi })}`
                    ) : (
                      <span>Chọn ngày</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={estimatedDate}
                    onSelect={setEstimatedDate}
                    initialFocus
                    locale={vi}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="bannerImage">Banner Image URL</Label>
              <Input
                id="bannerImage"
                value={formData.bannerImage}
                onChange={(e) => setFormData({ ...formData, bannerImage: e.target.value })}
                placeholder="https://example.com/banner.jpg"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="h-4 w-4"
              />
              <Label htmlFor="isActive" className="cursor-pointer">
                Kích hoạt pre-order
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Hủy
            </Button>
            <Button onClick={handleSubmit} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? "Đang lưu..." : editingPreorder ? "Cập nhật" : "Tạo mới"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
