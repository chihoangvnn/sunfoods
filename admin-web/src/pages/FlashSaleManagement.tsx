import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit3, Trash2, Copy, Clock, ExternalLink, Calendar as CalendarIcon } from "lucide-react";
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

interface FlashSale {
  id: string;
  productId: string;
  productName?: string;
  slug: string;
  title: string;
  originalPrice: string;
  salePrice: string;
  discountPercent: number;
  startTime: string;
  endTime: string;
  bannerImage?: string;
  description?: string;
  unit?: string;
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
];

function generateSlug(title: string): string {
  if (!title || title.trim().length === 0) {
    return 'flash-sale';
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

  return slug || 'flash-sale';
}

function getFlashSaleStatus(startTime: string, endTime: string, isActive: boolean): {
  status: 'active' | 'expired' | 'upcoming';
  label: string;
  variant: 'default' | 'secondary' | 'destructive';
} {
  const now = new Date();
  const start = new Date(startTime);
  const end = new Date(endTime);

  if (!isActive) {
    return { status: 'expired', label: 'Đã tắt', variant: 'secondary' };
  }

  if (now < start) {
    return { status: 'upcoming', label: 'Sắp diễn ra', variant: 'secondary' };
  }

  if (now >= start && now <= end) {
    return { status: 'active', label: 'Đang diễn ra', variant: 'default' };
  }

  return { status: 'expired', label: 'Đã kết thúc', variant: 'destructive' };
}

function getTimeRemaining(endTime: string): string {
  const now = new Date();
  const end = new Date(endTime);
  const diff = end.getTime() - now.getTime();

  if (diff <= 0) return 'Đã kết thúc';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `${days} ngày ${hours} giờ`;
  if (hours > 0) return `${hours} giờ ${minutes} phút`;
  return `${minutes} phút`;
}

export default function FlashSaleManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [editingFlashSale, setEditingFlashSale] = useState<FlashSale | null>(null);
  const [formData, setFormData] = useState({
    productId: '',
    title: '',
    slug: '',
    originalPrice: '',
    salePrice: '',
    discountPercent: 0,
    startTime: '',
    endTime: '',
    bannerImage: '',
    description: '',
    unit: 'cái',
    isActive: true,
  });
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
  const [startTime, setStartTime] = useState('00:00');
  const [endTime, setEndTime] = useState('23:59');

  // Fetch flash sales
  const { data: flashSales = [], isLoading: flashSalesLoading } = useQuery<FlashSale[]>({
    queryKey: ['/api/flash-sales'],
    queryFn: async () => {
      const res = await fetch('/api/flash-sales', {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch flash sales');
      const data = await res.json();
      return data.data || data;
    },
  });

  // Fetch products
  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ['/api/products'],
    queryFn: async () => {
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error('Failed to fetch products');
      return res.json();
    },
  });

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const url = editingFlashSale 
        ? `/api/flash-sales/${editingFlashSale.id}`
        : '/api/flash-sales';
      
      const response = await fetch(url, {
        method: editingFlashSale ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...data,
          originalPrice: parseFloat(data.originalPrice),
          salePrice: parseFloat(data.salePrice),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save flash sale');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: editingFlashSale ? "Flash sale đã được cập nhật" : "Flash sale đã được tạo",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/flash-sales'] });
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

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/flash-sales/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete flash sale');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Flash sale đã được xóa",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/flash-sales'] });
    },
    onError: () => {
      toast({
        title: "Lỗi",
        description: "Không thể xóa flash sale",
        variant: "destructive",
      });
    },
  });

  const handleOpenDialog = (flashSale?: FlashSale) => {
    if (flashSale) {
      setEditingFlashSale(flashSale);
      
      const start = new Date(flashSale.startTime);
      const end = new Date(flashSale.endTime);
      
      setStartDate(start);
      setEndDate(end);
      setStartTime(format(start, 'HH:mm'));
      setEndTime(format(end, 'HH:mm'));
      
      setFormData({
        productId: flashSale.productId,
        title: flashSale.title,
        slug: flashSale.slug,
        originalPrice: flashSale.originalPrice,
        salePrice: flashSale.salePrice,
        discountPercent: flashSale.discountPercent,
        startTime: flashSale.startTime,
        endTime: flashSale.endTime,
        bannerImage: flashSale.bannerImage || '',
        description: flashSale.description || '',
        unit: flashSale.unit || 'cái',
        isActive: flashSale.isActive,
      });
    } else {
      setEditingFlashSale(null);
      setStartDate(new Date());
      setEndDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
      setStartTime('00:00');
      setEndTime('23:59');
      setFormData({
        productId: '',
        title: '',
        slug: '',
        originalPrice: '',
        salePrice: '',
        discountPercent: 0,
        startTime: '',
        endTime: '',
        bannerImage: '',
        description: '',
        unit: 'cái',
        isActive: true,
      });
    }
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setEditingFlashSale(null);
  };

  const handleProductChange = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      const generatedSlug = generateSlug(product.name);
      setFormData({
        ...formData,
        productId,
        title: product.name,
        slug: generatedSlug,
        originalPrice: product.price,
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

  const handlePriceChange = () => {
    const original = parseFloat(formData.originalPrice) || 0;
    const sale = parseFloat(formData.salePrice) || 0;
    
    if (original > 0 && sale > 0) {
      const discount = Math.round(((original - sale) / original) * 100);
      setFormData({
        ...formData,
        discountPercent: discount,
      });
    }
  };

  const handleSubmit = () => {
    if (!formData.productId || !formData.title || !formData.slug) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin bắt buộc",
        variant: "destructive",
      });
      return;
    }

    const original = parseFloat(formData.originalPrice);
    const sale = parseFloat(formData.salePrice);

    if (sale >= original) {
      toast({
        title: "Lỗi",
        description: "Giá sale phải nhỏ hơn giá gốc",
        variant: "destructive",
      });
      return;
    }

    if (!startDate || !endDate) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn thời gian bắt đầu và kết thúc",
        variant: "destructive",
      });
      return;
    }

    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);

    const startDateTime = new Date(startDate);
    startDateTime.setHours(startHours, startMinutes, 0, 0);

    const endDateTime = new Date(endDate);
    endDateTime.setHours(endHours, endMinutes, 0, 0);

    if (endDateTime <= startDateTime) {
      toast({
        title: "Lỗi",
        description: "Thời gian kết thúc phải sau thời gian bắt đầu",
        variant: "destructive",
      });
      return;
    }

    saveMutation.mutate({
      ...formData,
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
    });
  };

  const handleDelete = (flashSale: FlashSale) => {
    if (window.confirm(`Bạn có chắc muốn xóa flash sale "${flashSale.title}"?`)) {
      deleteMutation.mutate(flashSale.id);
    }
  };

  const handleCopyLink = (slug: string) => {
    const link = `${window.location.origin}/flash-sale/${slug}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Đã sao chép",
      description: "Link flash sale đã được sao chép vào clipboard",
    });
  };

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(parseFloat(price));
  };

  if (flashSalesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Đang tải flash sales...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Flash Sale Management</h1>
          <p className="text-muted-foreground">
            Quản lý các chương trình flash sale
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Tạo Flash Sale
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sản phẩm</TableHead>
              <TableHead>Tiêu đề</TableHead>
              <TableHead>Giá gốc</TableHead>
              <TableHead>Giá sale</TableHead>
              <TableHead>Giảm giá</TableHead>
              <TableHead>Thời gian bắt đầu</TableHead>
              <TableHead>Thời gian kết thúc</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {flashSales.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                  Chưa có flash sale nào. Nhấn "Tạo Flash Sale" để bắt đầu.
                </TableCell>
              </TableRow>
            ) : (
              flashSales.map((flashSale) => {
                const statusInfo = getFlashSaleStatus(flashSale.startTime, flashSale.endTime, flashSale.isActive);
                const timeRemaining = statusInfo.status === 'active' ? getTimeRemaining(flashSale.endTime) : null;

                return (
                  <TableRow key={flashSale.id}>
                    <TableCell className="font-medium">{flashSale.productName || flashSale.productId}</TableCell>
                    <TableCell>{flashSale.title}</TableCell>
                    <TableCell>{formatPrice(flashSale.originalPrice)}</TableCell>
                    <TableCell className="font-semibold text-red-600">{formatPrice(flashSale.salePrice)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                        -{flashSale.discountPercent}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {format(new Date(flashSale.startTime), 'dd/MM/yyyy HH:mm', { locale: vi })}
                    </TableCell>
                    <TableCell className="text-sm">
                      {format(new Date(flashSale.endTime), 'dd/MM/yyyy HH:mm', { locale: vi })}
                      {timeRemaining && (
                        <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <Clock className="h-3 w-3" />
                          {timeRemaining}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDialog(flashSale)}
                          title="Sửa"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(flashSale)}
                          title="Xóa"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyLink(flashSale.slug)}
                          title="Sao chép link"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(`/flash-sale/${flashSale.slug}`, '_blank')}
                          title="Xem trước"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingFlashSale ? 'Chỉnh sửa Flash Sale' : 'Tạo Flash Sale mới'}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="product">Sản phẩm *</Label>
              <Select value={formData.productId} onValueChange={handleProductChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn sản phẩm" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} - {formatPrice(product.price)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="title">Tiêu đề *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Nhập tiêu đề flash sale"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="slug">Slug (URL) *</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="flash-sale-slug"
              />
              <p className="text-sm text-muted-foreground">
                Preview: {window.location.origin}/flash-sale/{formData.slug || 'your-slug'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="originalPrice">Giá gốc (VNĐ) *</Label>
                <Input
                  id="originalPrice"
                  type="number"
                  value={formData.originalPrice}
                  onChange={(e) => {
                    setFormData({ ...formData, originalPrice: e.target.value });
                    setTimeout(handlePriceChange, 100);
                  }}
                  placeholder="500000"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="salePrice">Giá sale (VNĐ) *</Label>
                <Input
                  id="salePrice"
                  type="number"
                  value={formData.salePrice}
                  onChange={(e) => {
                    setFormData({ ...formData, salePrice: e.target.value });
                    setTimeout(handlePriceChange, 100);
                  }}
                  placeholder="300000"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="discountPercent">Phần trăm giảm giá (%)</Label>
              <Input
                id="discountPercent"
                type="number"
                value={formData.discountPercent}
                onChange={(e) => setFormData({ ...formData, discountPercent: parseInt(e.target.value) || 0 })}
                placeholder="Tự động tính hoặc nhập thủ công"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="unit">Đơn vị</Label>
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

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Thời gian bắt đầu *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, 'dd/MM/yyyy', { locale: vi }) : 'Chọn ngày'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label>Thời gian kết thúc *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, 'dd/MM/yyyy', { locale: vi }) : 'Chọn ngày'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
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

            <div className="grid gap-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Mô tả chi tiết về flash sale..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Hủy
            </Button>
            <Button onClick={handleSubmit} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Đang lưu...' : editingFlashSale ? 'Cập nhật' : 'Tạo Flash Sale'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
