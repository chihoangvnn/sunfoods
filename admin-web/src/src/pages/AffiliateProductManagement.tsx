import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Trash2, Search, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProductAssignment {
  id: string;
  affiliateId: string;
  productId: string;
  commissionRate: number | null;
  isPremium: boolean;
  isActive: boolean;
  status: string;
  createdAt: string;
  affiliate?: {
    name: string;
    email: string;
  };
  product?: {
    name: string;
    price: number;
    stock: number;
  };
}

export default function AffiliateProductManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPremium, setFilterPremium] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: assignmentsData, isLoading } = useQuery<{ success: boolean; data: ProductAssignment[]; total: number }>({
    queryKey: ['/api/affiliate-management/product-assignments', { filterPremium, filterStatus }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filterPremium !== 'all') {
        params.append('isPremium', filterPremium === 'premium' ? 'true' : 'false');
      }
      if (filterStatus !== 'all') {
        params.append('status', filterStatus);
      }
      
      const res = await fetch(`/api/affiliate-management/product-assignments?${params}`, {
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to fetch product assignments');
      return res.json();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (assignmentId: string) => {
      const res = await fetch(`/api/affiliate-management/product-assignments/${assignmentId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to delete assignment');
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Đã xóa gán sản phẩm',
        description: 'Affiliate không còn quyền bán sản phẩm này'
      });
      queryClient.invalidateQueries({ queryKey: ['/api/affiliate-management/product-assignments'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Lỗi',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const assignments = assignmentsData?.data || [];

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = !searchQuery || 
      (assignment.affiliate?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (assignment.product?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPremium = filterPremium === 'all' || 
      (filterPremium === 'premium' && assignment.isPremium) ||
      (filterPremium === 'regular' && !assignment.isPremium);
    
    const matchesStatus = filterStatus === 'all' || assignment.status === filterStatus;
    
    return matchesSearch && matchesPremium && matchesStatus;
  });

  const handleDelete = (assignmentId: string) => {
    if (confirm('Xác nhận xóa gán sản phẩm này?')) {
      deleteMutation.mutate(assignmentId);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Quản lý Sản phẩm Affiliate</h1>
        <p className="text-muted-foreground mt-1">
          Xem và quản lý sản phẩm đã gán cho affiliates
        </p>
      </div>

      <Card className="p-4">
        <div className="flex gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm theo tên affiliate hoặc sản phẩm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={filterPremium} onValueChange={setFilterPremium}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Loại" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="premium">Premium</SelectItem>
              <SelectItem value="regular">Thường</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="active">Hoạt động</SelectItem>
              <SelectItem value="inactive">Tạm ngưng</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="text-sm text-muted-foreground mb-4">
          Hiển thị {filteredAssignments.length} / {assignments.length} gán sản phẩm
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Affiliate</TableHead>
                <TableHead>Sản phẩm</TableHead>
                <TableHead>Giá</TableHead>
                <TableHead>Tồn kho</TableHead>
                <TableHead>Hoa hồng</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ngày gán</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    Đang tải...
                  </TableCell>
                </TableRow>
              ) : filteredAssignments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    Không tìm thấy gán sản phẩm nào
                  </TableCell>
                </TableRow>
              ) : (
                filteredAssignments.map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{assignment.affiliate?.name || 'N/A'}</div>
                        <div className="text-sm text-muted-foreground">{assignment.affiliate?.email || 'N/A'}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {assignment.product?.name || `Product ${assignment.productId}`}
                    </TableCell>
                    <TableCell>
                      {assignment.product?.price?.toLocaleString('vi-VN')}đ
                    </TableCell>
                    <TableCell>
                      {assignment.product?.stock || 0}
                    </TableCell>
                    <TableCell>
                      {assignment.commissionRate ? `${assignment.commissionRate}%` : 'Mặc định'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={assignment.isPremium ? 'default' : 'secondary'}>
                        {assignment.isPremium ? 'Premium' : 'Thường'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={assignment.isActive ? 'default' : 'secondary'}>
                        {assignment.isActive ? 'Hoạt động' : 'Tạm ngưng'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(assignment.createdAt).toLocaleDateString('vi-VN')}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(assignment.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
