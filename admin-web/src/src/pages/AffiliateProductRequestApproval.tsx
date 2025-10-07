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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Search, Eye, Package } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface ProductRequest {
  id: string;
  affiliateId: string;
  productName: string;
  productDescription?: string;
  productLink?: string;
  suggestedPrice?: string;
  categoryId?: string;
  status: 'pending' | 'approved' | 'rejected' | 'in_review';
  requestReason?: string;
  adminNotes?: string;
  approvedProductId?: string;
  approvedCommissionRate?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt?: Date;
  affiliate: {
    name?: string;
    email?: string;
    affiliateCode?: string;
  };
}

interface Product {
  id: string;
  name: string;
  price: string;
  stock: number;
}

export default function AffiliateProductRequestApproval() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<ProductRequest | null>(null);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [commissionRate, setCommissionRate] = useState('10');
  const [isPremium, setIsPremium] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: requestsData, isLoading } = useQuery<{ success: boolean; data: ProductRequest[]; total: number }>({
    queryKey: ['/api/affiliate-management/product-requests', { filterStatus }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filterStatus !== 'all') {
        params.append('status', filterStatus);
      }
      
      const res = await fetch(`/api/affiliate-management/product-requests?${params}`, {
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to fetch product requests');
      return res.json();
    }
  });

  const { data: productsData } = useQuery<{ success: boolean; data: Product[] }>({
    queryKey: ['/api/products'],
    queryFn: async () => {
      const res = await fetch('/api/products', {
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to fetch products');
      return res.json();
    }
  });

  const approveMutation = useMutation({
    mutationFn: async ({ requestId, productId, commissionRate, isPremium }: { requestId: string; productId: string; commissionRate: string; isPremium: boolean }) => {
      const res = await fetch(`/api/affiliate-management/product-requests/${requestId}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ productId, commissionRate, isPremium })
      });
      if (!res.ok) throw new Error('Failed to approve request');
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Đã duyệt yêu cầu',
        description: 'Sản phẩm đã được gán cho affiliate',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/affiliate-management/product-requests'] });
      setApprovalDialogOpen(false);
      setSelectedRequest(null);
      setSelectedProductId('');
      setCommissionRate('10');
      setIsPremium(false);
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Lỗi duyệt yêu cầu',
        description: error.message,
      });
    }
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ requestId, rejectionReason }: { requestId: string; rejectionReason: string }) => {
      const res = await fetch(`/api/affiliate-management/product-requests/${requestId}/reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ rejectionReason })
      });
      if (!res.ok) throw new Error('Failed to reject request');
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Đã từ chối yêu cầu',
        description: 'Yêu cầu sản phẩm đã bị từ chối',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/affiliate-management/product-requests'] });
      setRejectionDialogOpen(false);
      setSelectedRequest(null);
      setRejectionReason('');
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Lỗi từ chối yêu cầu',
        description: error.message,
      });
    }
  });

  const requests = requestsData?.data || [];
  const products = productsData?.data || [];

  const filteredRequests = requests.filter(request =>
    (request.productName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     (request.affiliate?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
     (request.affiliate?.email || '').toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Đang chờ</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Đã duyệt</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Từ chối</Badge>;
      case 'in_review':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Đang xem xét</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Duyệt Yêu Cầu Sản Phẩm Affiliate</h1>
        <p className="text-gray-600">Quản lý yêu cầu sản phẩm từ affiliates</p>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Tìm kiếm theo tên sản phẩm, affiliate..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="pending">Đang chờ</SelectItem>
            <SelectItem value="in_review">Đang xem xét</SelectItem>
            <SelectItem value="approved">Đã duyệt</SelectItem>
            <SelectItem value="rejected">Từ chối</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Affiliate</TableHead>
              <TableHead>Tên Sản Phẩm</TableHead>
              <TableHead>Giá Đề Xuất</TableHead>
              <TableHead>Lý Do</TableHead>
              <TableHead>Trạng Thái</TableHead>
              <TableHead>Ngày Tạo</TableHead>
              <TableHead className="text-right">Hành Động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  Đang tải...
                </TableCell>
              </TableRow>
            ) : filteredRequests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  Không có yêu cầu nào
                </TableCell>
              </TableRow>
            ) : (
              filteredRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{request.affiliate?.name || 'N/A'}</div>
                      <div className="text-sm text-gray-500">{request.affiliate?.email || ''}</div>
                      <div className="text-xs text-gray-400">{request.affiliate?.affiliateCode || ''}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{request.productName}</div>
                    {request.productLink && (
                      <a href={request.productLink} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">
                        Xem link
                      </a>
                    )}
                  </TableCell>
                  <TableCell>
                    {request.suggestedPrice ? `${parseFloat(request.suggestedPrice).toLocaleString()}đ` : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm max-w-xs truncate" title={request.requestReason || ''}>
                      {request.requestReason || 'N/A'}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(request.status)}</TableCell>
                  <TableCell>{new Date(request.createdAt).toLocaleDateString('vi-VN')}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      {request.status === 'pending' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedRequest(request);
                              setApprovalDialogOpen(true);
                            }}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Duyệt
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedRequest(request);
                              setRejectionDialogOpen(true);
                            }}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Từ chối
                          </Button>
                        </>
                      )}
                      {request.status === 'approved' && request.approvedProductId && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          <Package className="w-3 h-3 mr-1" />
                          Đã gán
                        </Badge>
                      )}
                      {request.status === 'rejected' && request.adminNotes && (
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200" title={request.adminNotes}>
                          <Eye className="w-3 h-3 mr-1" />
                          Lý do
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={approvalDialogOpen} onOpenChange={setApprovalDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Duyệt Yêu Cầu Sản Phẩm</DialogTitle>
            <DialogDescription>
              Chọn sản phẩm để gán cho affiliate và cài đặt hoa hồng
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Affiliate: {selectedRequest?.affiliate?.name}</Label>
              <p className="text-sm text-gray-500">Yêu cầu: {selectedRequest?.productName}</p>
            </div>
            <div>
              <Label htmlFor="product">Chọn Sản Phẩm</Label>
              <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                <SelectTrigger id="product">
                  <SelectValue placeholder="Chọn sản phẩm" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} - {parseFloat(product.price).toLocaleString()}đ (Stock: {product.stock})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="commission">Hoa Hồng (%)</Label>
              <Input
                id="commission"
                type="number"
                min="0"
                max="100"
                value={commissionRate}
                onChange={(e) => setCommissionRate(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isPremium"
                checked={isPremium}
                onChange={(e) => setIsPremium(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="isPremium">Sản phẩm Premium (VIP only)</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApprovalDialogOpen(false)}>
              Hủy
            </Button>
            <Button
              onClick={() => {
                if (!selectedProductId) {
                  toast({
                    variant: 'destructive',
                    title: 'Vui lòng chọn sản phẩm',
                  });
                  return;
                }
                if (selectedRequest) {
                  approveMutation.mutate({
                    requestId: selectedRequest.id,
                    productId: selectedProductId,
                    commissionRate,
                    isPremium
                  });
                }
              }}
              disabled={approveMutation.isPending}
            >
              {approveMutation.isPending ? 'Đang xử lý...' : 'Duyệt & Gán Sản Phẩm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={rejectionDialogOpen} onOpenChange={setRejectionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Từ Chối Yêu Cầu</DialogTitle>
            <DialogDescription>
              Nhập lý do từ chối yêu cầu sản phẩm này
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Affiliate: {selectedRequest?.affiliate?.name}</Label>
              <p className="text-sm text-gray-500">Yêu cầu: {selectedRequest?.productName}</p>
            </div>
            <div>
              <Label htmlFor="reason">Lý Do Từ Chối</Label>
              <Input
                id="reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="VD: Sản phẩm không phù hợp, tồn kho không đủ..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectionDialogOpen(false)}>
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (selectedRequest) {
                  rejectMutation.mutate({
                    requestId: selectedRequest.id,
                    rejectionReason
                  });
                }
              }}
              disabled={rejectMutation.isPending}
            >
              {rejectMutation.isPending ? 'Đang xử lý...' : 'Từ Chối'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
