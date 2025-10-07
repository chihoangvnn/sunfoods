import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Badge,
} from '@/components/ui/badge';
import {
  Button,
} from '@/components/ui/button';
import {
  Input,
} from '@/components/ui/input';
import {
  Label,
} from '@/components/ui/label';
import {
  Textarea,
} from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  Shield, 
  ShieldCheck, 
  Plus, 
  Eye, 
  EyeOff, 
  MapPin, 
  User, 
  Phone, 
  Mail,
  AlertTriangle,
  Lock,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface SecureAddress {
  id: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  address: string; // Will be '[HIDDEN]' if hidden from affiliate
  notes?: string;
  totalOrders: number;
  totalRevenue: string;
  isActive: boolean;
  isHidden: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SecureAddressManagementProps {
  affiliateId: string;
  affiliateName: string;
}

export const SecureAddressManagement: React.FC<SecureAddressManagementProps> = ({ 
  affiliateId, 
  affiliateName 
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Form state
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newAddress, setNewAddress] = useState({
    customerName: '',
    address: '',
    customerPhone: '',
    customerEmail: '',
    notes: ''
  });
  // REMOVED: showHidden toggle for security - affiliates never see hidden addresses

  // Vietnamese VND formatter
  const formatPrice = (value: string | number): string => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numValue);
  };

  // Fetch affiliate's secure addresses (SECURITY: NO PARAMETERS - always protected)
  const { data: addresses, isLoading } = useQuery({
    queryKey: ['secure-addresses', affiliateId],
    queryFn: async () => {
      // SECURITY: No includeHidden parameter - affiliates get protected addresses only
      const response = await apiRequest('GET', `/api/secure-addresses/${affiliateId}`);
      const data = await response.json();
      return data.data.addresses as SecureAddress[];
    },
    refetchInterval: 30000,
  });

  // Add new secure address mutation
  const addAddressMutation = useMutation({
    mutationFn: async (addressData: typeof newAddress) => {
      const response = await apiRequest('POST', '/api/secure-addresses', {
        affiliateId,
        ...addressData,
      });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['secure-addresses'] });
      setIsAddDialogOpen(false);
      setNewAddress({
        customerName: '',
        address: '',
        customerPhone: '',
        customerEmail: '',
        notes: ''
      });
      
      if (data.data?.isDuplicate) {
        toast({
          title: "⚠️ Địa chỉ trùng lặp",
          description: "Địa chỉ này đã tồn tại trong hệ thống",
          variant: "destructive",
        });
      } else {
        toast({
          title: "✅ Thêm địa chỉ thành công",
          description: "Địa chỉ khách hàng đã được mã hóa và lưu trữ an toàn",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "❌ Lỗi thêm địa chỉ",
        description: error.message || "Không thể thêm địa chỉ. Vui lòng thử lại.",
        variant: "destructive",
      });
    },
  });

  // Hide address from affiliate mutation
  const hideAddressMutation = useMutation({
    mutationFn: async (addressId: string) => {
      const response = await apiRequest('POST', `/api/secure-addresses/${addressId}/hide`, {
        affiliateId,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['secure-addresses'] });
      toast({
        title: "🔒 Địa chỉ đã được ẩn",
        description: "Địa chỉ này sẽ không còn hiển thị với affiliate",
      });
    },
    onError: (error: any) => {
      toast({
        title: "❌ Lỗi ẩn địa chỉ",
        description: error.message || "Không thể ẩn địa chỉ. Vui lòng thử lại.",
        variant: "destructive",
      });
    },
  });

  const handleAddAddress = () => {
    if (!newAddress.customerName.trim() || !newAddress.address.trim()) {
      toast({
        title: "⚠️ Thiếu thông tin",
        description: "Vui lòng nhập tên khách hàng và địa chỉ",
        variant: "destructive",
      });
      return;
    }

    addAddressMutation.mutate(newAddress);
  };

  const handleHideAddress = (addressId: string) => {
    hideAddressMutation.mutate(addressId);
  };

  const visibleAddresses = addresses?.filter(addr => !addr.isHidden) || [];
  const hiddenAddresses = addresses?.filter(addr => addr.isHidden) || [];
  const totalRevenue = addresses?.reduce((sum, addr) => sum + parseFloat(addr.totalRevenue || '0'), 0) || 0;
  const totalOrders = addresses?.reduce((sum, addr) => sum + addr.totalOrders, 0) || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Địa Chỉ Khách Hàng Bảo Mật</h2>
            <p className="text-sm text-gray-600">Affiliate: {affiliateName}</p>
          </div>
        </div>
        
        {/* Add Address Button */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Thêm Địa Chỉ Mới
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                Thêm Địa Chỉ Khách Hàng Bảo Mật
              </DialogTitle>
              <DialogDescription>
                Địa chỉ sẽ được mã hóa AES-256 và lưu trữ an toàn
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="customerName" className="text-sm font-medium text-gray-700">
                  Tên khách hàng *
                </Label>
                <Input
                  id="customerName"
                  value={newAddress.customerName}
                  onChange={(e) => setNewAddress(prev => ({ ...prev, customerName: e.target.value }))}
                  placeholder="Nguyễn Văn A"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="address" className="text-sm font-medium text-gray-700">
                  Địa chỉ *
                </Label>
                <Textarea
                  id="address"
                  value={newAddress.address}
                  onChange={(e) => setNewAddress(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="123 Nguyễn Trãi, Phường 1, Quận 1, TP.HCM"
                  className="mt-1"
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="customerPhone" className="text-sm font-medium text-gray-700">
                  Số điện thoại
                </Label>
                <Input
                  id="customerPhone"
                  value={newAddress.customerPhone}
                  onChange={(e) => setNewAddress(prev => ({ ...prev, customerPhone: e.target.value }))}
                  placeholder="0901234567"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="customerEmail" className="text-sm font-medium text-gray-700">
                  Email
                </Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={newAddress.customerEmail}
                  onChange={(e) => setNewAddress(prev => ({ ...prev, customerEmail: e.target.value }))}
                  placeholder="customer@example.com"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="notes" className="text-sm font-medium text-gray-700">
                  Ghi chú
                </Label>
                <Textarea
                  id="notes"
                  value={newAddress.notes}
                  onChange={(e) => setNewAddress(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Ghi chú về khách hàng hoặc địa chỉ..."
                  className="mt-1"
                  rows={2}
                />
              </div>
            </div>
            
            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
                disabled={addAddressMutation.isPending}
              >
                Hủy
              </Button>
              <Button
                onClick={handleAddAddress}
                disabled={addAddressMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {addAddressMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Đang thêm...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4 mr-2" />
                    Thêm Địa Chỉ
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng Địa Chỉ</p>
                <p className="text-2xl font-bold text-gray-900">{addresses?.length || 0}</p>
              </div>
              <MapPin className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Đang Hiển Thị</p>
                <p className="text-2xl font-bold text-green-600">{visibleAddresses.length}</p>
              </div>
              <Eye className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Đã Ẩn</p>
                <p className="text-2xl font-bold text-orange-600">{hiddenAddresses.length}</p>
              </div>
              <EyeOff className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng Doanh Thu</p>
                <p className="text-2xl font-bold text-blue-600">{formatPrice(totalRevenue)}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SECURITY NOTICE - REMOVED TOGGLE FOR PRIVACY PROTECTION */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
          <Lock className="h-4 w-4 text-red-600" />
          <span className="text-sm font-medium text-red-800">🔒 Tất cả địa chỉ được bảo vệ tự động</span>
        </div>
      </div>

      {/* Address Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-blue-600" />
            Danh Sách Địa Chỉ Khách Hàng
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span className="ml-2 text-gray-600">Đang tải...</span>
            </div>
          ) : !addresses || addresses.length === 0 ? (
            <div className="text-center py-8">
              <MapPin className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có địa chỉ nào</h3>
              <p className="text-gray-600 mb-4">Thêm địa chỉ khách hàng đầu tiên để bắt đầu</p>
              <Button onClick={() => setIsAddDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Thêm Địa Chỉ Đầu Tiên
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Khách Hàng</TableHead>
                    <TableHead>Địa Chỉ</TableHead>
                    <TableHead>Liên Hệ</TableHead>
                    <TableHead>Đơn Hàng</TableHead>
                    <TableHead>Doanh Thu</TableHead>
                    <TableHead>Trạng Thái</TableHead>
                    <TableHead>Thao Tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {addresses.map((address) => (
                    <TableRow key={address.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900">{address.customerName}</p>
                            {address.notes && (
                              <p className="text-xs text-gray-500">{address.notes}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {address.isHidden ? (
                            <>
                              <EyeOff className="h-4 w-4 text-orange-500" />
                              <span className="text-orange-600 font-mono text-sm">[ĐÃ ẨN]</span>
                            </>
                          ) : (
                            <>
                              <MapPin className="h-4 w-4 text-blue-500" />
                              <span className="text-gray-900 text-sm max-w-xs truncate">
                                {address.address}
                              </span>
                            </>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-1">
                          {address.customerPhone && (
                            <div className="flex items-center gap-1 text-xs text-gray-600">
                              <Phone className="h-3 w-3" />
                              {address.customerPhone}
                            </div>
                          )}
                          {address.customerEmail && (
                            <div className="flex items-center gap-1 text-xs text-gray-600">
                              <Mail className="h-3 w-3" />
                              {address.customerEmail}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <span className="font-semibold text-gray-900">{address.totalOrders}</span>
                      </TableCell>
                      
                      <TableCell>
                        <span className="font-semibold text-blue-600">
                          {formatPrice(address.totalRevenue)}
                        </span>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge variant={address.isActive ? "default" : "secondary"}>
                            {address.isActive ? "Hoạt động" : "Tạm dừng"}
                          </Badge>
                          {address.isHidden && (
                            <Badge variant="outline" className="text-orange-600 border-orange-600">
                              <EyeOff className="h-3 w-3 mr-1" />
                              Đã ẩn
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        {!address.isHidden && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleHideAddress(address.id)}
                            disabled={hideAddressMutation.isPending}
                            className="text-orange-600 border-orange-600 hover:bg-orange-50"
                          >
                            <EyeOff className="h-3 w-3 mr-1" />
                            Ẩn
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Notice */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 mb-2">🔐 Bảo Mật Thông Tin (CẬP NHẬT MỚI)</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Tất cả địa chỉ được mã hóa AES-256 trước khi lưu trữ</li>
                <li>• Hệ thống tự động phát hiện và ngăn chặn địa chỉ trùng lặp</li>
                <li>• <strong>🔒 MỚI:</strong> Địa chỉ được TỰ ĐỘNG ẨN ngay sau khi tạo để bảo vệ quyền riêng tư khách hàng</li>
                <li>• Chỉ admin mới có thể giải mã địa chỉ khi cần thiết cho việc giao hàng</li>
                <li>• <strong>✅ BẢO MẬT TỐT HƠN:</strong> Affiliate không thể xem địa chỉ thực sau khi tạo</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};