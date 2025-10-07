'use client'

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { AlertCircle, CheckCircle, XCircle, Download, Truck, Package, Printer, BarChart3, ChevronDown, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { returnReasonLabels, mockVendor, mockProductSales } from '@/data/mockVendorData';
import { 
  fetchVendorReturns, 
  approveReturn as approveReturnAPI, 
  rejectReturn as rejectReturnAPI,
  type VendorReturnRequest 
} from '@/services/vendorReturnsService';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'approved':
      return 'bg-green-100 text-green-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    case 'completed':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'pending': return 'Chờ xử lý';
    case 'approved': return 'Đã chấp nhận';
    case 'rejected': return 'Từ chối';
    case 'completed': return 'Hoàn tất';
    default: return status;
  }
};

const getShippingProviderLabel = (provider: string) => {
  switch (provider) {
    case 'ghn': return 'Giao Hàng Nhanh';
    case 'ghtk': return 'Giao Hàng Tiết Kiệm';
    case 'viettel': return 'Viettel Post';
    default: return provider;
  }
};

const getReasonColor = (index: number) => {
  const colors = [
    'bg-red-500',
    'bg-orange-500',
    'bg-yellow-500',
    'bg-blue-500',
    'bg-purple-500'
  ];
  return colors[index] || 'bg-gray-500';
};

export default function VendorReturnsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('all');
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState<VendorReturnRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectionNote, setRejectionNote] = useState('');
  const [shippingProvider, setShippingProvider] = useState('ghn');
  const [shippingNote, setShippingNote] = useState('');
  const [shippingFeePayer, setShippingFeePayer] = useState('vendor');
  const [generatedLabel, setGeneratedLabel] = useState<{
    trackingNumber: string;
    labelUrl: string;
    provider: string;
  } | null>(null);

  // Fetch returns using React Query
  const { data: returns = [], isLoading, isError, error } = useQuery({
    queryKey: ['vendorReturns', activeTab],
    queryFn: () => fetchVendorReturns(activeTab === 'all' ? undefined : activeTab),
    staleTime: 30000, // 30 seconds
  });

  // Approve return mutation
  const approveMutation = useMutation({
    mutationFn: approveReturnAPI,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['vendorReturns'] });
      
      setGeneratedLabel({
        trackingNumber: data.trackingNumber,
        labelUrl: data.labelUrl,
        provider: shippingProvider
      });
      
      toast({
        title: '✅ Đã chấp nhận trả hàng',
        description: `Mã vận đơn: ${data.trackingNumber}`,
      });
      
      setShowApproveModal(false);
    },
    onError: (error: Error) => {
      toast({
        title: '❌ Lỗi',
        description: error.message || 'Không thể chấp nhận trả hàng',
        variant: 'destructive',
      });
    },
  });

  // Reject return mutation
  const rejectMutation = useMutation({
    mutationFn: rejectReturnAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendorReturns'] });
      
      toast({
        title: '❌ Đã từ chối trả hàng',
        description: `Lý do: ${rejectionReason}`,
      });
      
      setShowRejectModal(false);
      setRejectionReason('');
      setRejectionNote('');
    },
    onError: (error: Error) => {
      toast({
        title: '❌ Lỗi',
        description: error.message || 'Không thể từ chối trả hàng',
        variant: 'destructive',
      });
    },
  });

  const stats = useMemo(() => {
    const pending = returns.filter(r => r.status === 'pending').length;
    const approved = returns.filter(r => r.status === 'approved').length;
    const rejected = returns.filter(r => r.status === 'rejected').length;
    const completed = returns.filter(r => r.status === 'completed').length;
    
    return { pending, approved, rejected, completed, total: returns.length };
  }, [returns]);

  const filteredReturns = useMemo(() => {
    if (activeTab === 'all') return returns;
    return returns.filter(r => r.status === activeTab);
  }, [activeTab, returns]);

  const topReturnReasons = useMemo(() => {
    if (returns.length === 0) {
      return [];
    }
    
    const reasonCounts: Record<string, number> = {};
    
    returns.forEach(r => {
      reasonCounts[r.reason] = (reasonCounts[r.reason] || 0) + 1;
    });
    
    const total = returns.length;
    
    return Object.entries(reasonCounts)
      .map(([reason, count]) => ({
        reason,
        count,
        percentage: Math.round((count / total) * 100)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [returns]);

  const topReturnProducts = useMemo(() => {
    const productReturns: Record<string, {
      productName: string;
      returnCount: number;
      totalSold: number;
    }> = {};
    
    returns.forEach(r => {
      if (!productReturns[r.productName]) {
        productReturns[r.productName] = {
          productName: r.productName,
          returnCount: 0,
          totalSold: 100 // Default value since we don't have product ID
        };
      }
      productReturns[r.productName].returnCount++;
    });
    
    return Object.values(productReturns)
      .map(p => ({
        ...p,
        returnRate: p.totalSold > 0 
          ? Math.round((p.returnCount / p.totalSold) * 100) 
          : 0
      }))
      .sort((a, b) => b.returnCount - a.returnCount)
      .slice(0, 5);
  }, [returns]);

  const monthlyTrend = useMemo(() => {
    const getMonthYear = (dateStr: string) => {
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        return `${parts[1]}/${parts[2]}`;
      }
      return null;
    };
    
    const now = new Date();
    const months = [];
    for (let i = 0; i < 3; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthNum = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      months.push({
        label: `Tháng ${date.getMonth() + 1}`,
        key: `${monthNum}/${year}`
      });
    }
    
    const counts = months.map(month => 
      returns.filter(r => {
        const returnMonthYear = getMonthYear(r.requestDate);
        return returnMonthYear === month.key;
      }).length
    );
    
    return months.map((month, index) => {
      const prevCount = index < months.length - 1 ? counts[index + 1] : counts[index];
      const change = prevCount > 0 
        ? Math.round(((counts[index] - prevCount) / prevCount) * 100)
        : 0;
      
      return {
        month: month.label,
        count: counts[index],
        change
      };
    });
  }, [returns]);

  const refundAmount = selectedReturn?.refundAmount || 0;

  const handleApprove = (returnItem: VendorReturnRequest) => {
    setSelectedReturn(returnItem);
    setShowApproveModal(true);
  };

  const handleReject = (returnItem: VendorReturnRequest) => {
    setSelectedReturn(returnItem);
    setShowRejectModal(true);
  };

  const handleConfirmApprove = () => {
    if (!selectedReturn) return;
    
    approveMutation.mutate({
      returnId: selectedReturn.id,
      shippingProvider: shippingProvider as 'ghn' | 'ghtk' | 'viettel',
      shippingNote,
      shippingFeePayer: shippingFeePayer as 'vendor' | 'customer',
    });
  };

  const handleConfirmReject = () => {
    if (!selectedReturn) return;
    
    rejectMutation.mutate({
      returnId: selectedReturn.id,
      reason: rejectionReason,
      note: rejectionNote,
    });
  };

  const handleDownloadReport = () => {
    alert('Tải báo cáo trả hàng');
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý trả hàng</h1>
            <p className="text-gray-600 mt-1">Xử lý yêu cầu trả hàng từ khách hàng</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải dữ liệu...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (isError) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý trả hàng</h1>
            <p className="text-gray-600 mt-1">Xử lý yêu cầu trả hàng từ khách hàng</p>
          </div>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Có lỗi xảy ra khi tải dữ liệu: {error?.message || 'Vui lòng thử lại sau'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý trả hàng</h1>
          <p className="text-gray-600 mt-1">Xử lý yêu cầu trả hàng từ khách hàng</p>
        </div>
        <Button onClick={handleDownloadReport} className="bg-orange-600 hover:bg-orange-700">
          <Download className="w-4 h-4 mr-2" />
          Tải báo cáo
        </Button>
      </div>

      {/* Return Analytics - Collapsible Section */}
      <Collapsible>
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="w-full mb-4">
            <BarChart3 className="w-4 h-4 mr-2" />
            Phân tích trả hàng
            <ChevronDown className="w-4 h-4 ml-auto" />
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="space-y-4 mb-6">
          {/* Analytics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Top Return Reasons */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Lý do trả hàng phổ biến</CardTitle>
              </CardHeader>
              <CardContent>
                {topReturnReasons.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Chưa có dữ liệu trả hàng
                  </p>
                ) : (
                  <div className="space-y-2">
                    {topReturnReasons.map((reason, index) => (
                      <div key={reason.reason} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${getReasonColor(index)}`} />
                          <span className="text-sm">{returnReasonLabels[reason.reason as keyof typeof returnReasonLabels]}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">{reason.count}</span>
                          <span className="text-xs text-gray-500">
                            ({reason.percentage}%)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Return Rate by Product */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Sản phẩm trả nhiều nhất</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {topReturnProducts.map((product) => (
                    <div key={product.productName} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="truncate max-w-[200px]">
                          {product.productName}
                        </span>
                        <span className="font-semibold">{product.returnCount}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-red-500 h-2 rounded-full"
                            style={{ width: `${product.returnRate}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-600 w-12 text-right">
                          {product.returnRate}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Monthly Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Xu hướng theo tháng</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {monthlyTrend.map((month) => (
                    <div key={month.month} className="flex items-center justify-between">
                      <span className="text-sm">{month.month}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{month.count}</span>
                        {month.change > 0 ? (
                          <TrendingUp className="w-4 h-4 text-red-500" />
                        ) : month.change < 0 ? (
                          <TrendingDown className="w-4 h-4 text-green-500" />
                        ) : (
                          <Minus className="w-4 h-4 text-gray-400" />
                        )}
                        <span className={`text-xs ${
                          month.change > 0 ? 'text-red-500' : 
                          month.change < 0 ? 'text-green-500' : 
                          'text-gray-500'
                        }`}>
                          {month.change > 0 ? '+' : ''}{month.change}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chờ xử lý</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đã chấp nhận</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Từ chối</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">{stats.rejected}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">Tất cả ({stats.total})</TabsTrigger>
          <TabsTrigger value="pending">Chờ xử lý ({stats.pending})</TabsTrigger>
          <TabsTrigger value="approved">Đã chấp nhận ({stats.approved})</TabsTrigger>
          <TabsTrigger value="rejected">Từ chối ({stats.rejected})</TabsTrigger>
          <TabsTrigger value="completed">Hoàn tất ({stats.completed})</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-6">
          <Card>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã trả hàng</TableHead>
                    <TableHead>Đơn hàng</TableHead>
                    <TableHead>Sản phẩm</TableHead>
                    <TableHead className="hidden md:table-cell">Khách hàng</TableHead>
                    <TableHead className="hidden lg:table-cell">Lý do</TableHead>
                    <TableHead className="hidden sm:table-cell">SL</TableHead>
                    <TableHead className="hidden sm:table-cell">Hoàn tiền</TableHead>
                    <TableHead className="hidden lg:table-cell">Ngày yêu cầu</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReturns.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                        Không có yêu cầu trả hàng nào
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredReturns.map((returnItem) => (
                      <TableRow key={returnItem.id}>
                        <TableCell className="font-medium">{returnItem.id}</TableCell>
                        <TableCell>
                          <Link 
                            href={`/vendor/orders/${returnItem.orderId}`}
                            className="text-orange-600 hover:text-orange-700 hover:underline"
                          >
                            {returnItem.orderId}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Package className="w-10 h-10 text-gray-400" />
                            <span className="text-sm">{returnItem.productName}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{returnItem.customerName}</TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <Badge variant="outline">
                            {returnReasonLabels[returnItem.reason as keyof typeof returnReasonLabels] || returnItem.reason}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">{returnItem.quantity}</TableCell>
                        <TableCell className="hidden sm:table-cell font-semibold">
                          {returnItem.refundAmount.toLocaleString('vi-VN')} ₫
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">{returnItem.requestDate}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(returnItem.status)}>
                            {getStatusLabel(returnItem.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {returnItem.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => handleApprove(returnItem)}
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              >
                                <CheckCircle className="w-4 h-4" />
                                <span className="hidden xl:inline ml-1">Chấp nhận</span>
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => handleReject(returnItem)}
                              >
                                <XCircle className="w-4 h-4" />
                                <span className="hidden xl:inline ml-1">Từ chối</span>
                              </Button>
                            </div>
                          )}
                          
                          {returnItem.status === 'approved' && returnItem.trackingNumber && (
                            <div className="text-sm">
                              <div className="flex items-center gap-1 text-blue-600 font-medium">
                                <Truck className="w-4 h-4" />
                                {returnItem.trackingNumber}
                              </div>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="p-0 h-auto text-xs"
                                onClick={() => window.open(`/shipping/track/${returnItem.trackingNumber}`, '_blank')}
                              >
                                Theo dõi →
                              </Button>
                            </div>
                          )}
                          
                          {returnItem.status === 'rejected' && (
                            <div className="text-sm text-red-600">
                              {returnItem.rejectionReason}
                            </div>
                          )}
                          
                          {(returnItem.status === 'completed' || (returnItem.status === 'approved' && !returnItem.trackingNumber)) && (
                            <span className="text-sm text-gray-500">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showApproveModal} onOpenChange={(open) => {
        setShowApproveModal(open);
        if (!open) {
          setSelectedReturn(null);
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chấp nhận trả hàng {selectedReturn?.id}</DialogTitle>
            <DialogDescription>
              Xác nhận chấp nhận yêu cầu trả hàng và xử lý hoàn tiền
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Thông tin trả hàng</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                <div>Sản phẩm:</div>
                <div className="font-medium">{selectedReturn?.productName}</div>
                
                <div>Số lượng:</div>
                <div className="font-medium">{selectedReturn?.quantity}</div>
                
                <div>Lý do:</div>
                <div className="font-medium">
                  {selectedReturn?.reason && (returnReasonLabels[selectedReturn.reason as keyof typeof returnReasonLabels] || selectedReturn.reason)}
                </div>
                
                <div>Chi tiết:</div>
                <div className="font-medium">{selectedReturn?.reasonDetails || '-'}</div>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <h3 className="font-semibold mb-3">Xử lý hoàn tiền</h3>
              
              {mockVendor.paymentModel === 'deposit' && (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Số tiền hoàn:</span>
                    <span className="font-bold text-lg">
                      {refundAmount.toLocaleString('vi-VN')} ₫
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    ↪ Tiền sẽ được cộng lại vào số dư ký quỹ
                  </p>
                  <div className="flex justify-between text-sm">
                    <span>Số dư hiện tại:</span>
                    <span>{mockVendor.depositBalance.toLocaleString('vi-VN')} ₫</span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold text-green-600">
                    <span>Số dư sau hoàn tiền:</span>
                    <span>
                      {(mockVendor.depositBalance + refundAmount).toLocaleString('vi-VN')} ₫
                    </span>
                  </div>
                </div>
              )}
              
              {mockVendor.paymentModel === 'monthly' && (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Số tiền hoàn:</span>
                    <span className="font-bold text-lg">
                      {refundAmount.toLocaleString('vi-VN')} ₫
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    ↪ Trừ vào công nợ tháng sau
                  </p>
                  <div className="flex justify-between text-sm">
                    <span>Công nợ hiện tại:</span>
                    <span>{mockVendor.creditUsed?.toLocaleString('vi-VN')} ₫</span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold text-green-600">
                    <span>Công nợ sau giảm trừ:</span>
                    <span>
                      {((mockVendor.creditUsed || 0) - refundAmount).toLocaleString('vi-VN')} ₫
                    </span>
                  </div>
                </div>
              )}
              
              {mockVendor.paymentModel === 'upfront' && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Không thể trả hàng cho mô hình mua đứt. 
                    Shop đã sở hữu hàng này.
                  </AlertDescription>
                </Alert>
              )}
              
              {mockVendor.paymentModel === 'revenue_share' && (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Phần bạn đã nhận (70%):</span>
                    <span className="font-bold text-lg">
                      {(refundAmount * 0.7).toLocaleString('vi-VN')} ₫
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    ↪ Số tiền này sẽ bị trừ vào doanh thu kỳ tới
                  </p>
                  <div className="text-sm text-orange-600">
                    Shop hoàn lại toàn bộ cho khách: {refundAmount.toLocaleString('vi-VN')} ₫
                  </div>
                </div>
              )}
            </div>
            
            {selectedReturn && selectedReturn.status === 'pending' && (
              <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  Vận chuyển trả hàng
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Đơn vị vận chuyển
                    </label>
                    <Select value={shippingProvider} onValueChange={setShippingProvider}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn đơn vị vận chuyển" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ghn">
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4" />
                            Giao Hàng Nhanh (GHN)
                          </div>
                        </SelectItem>
                        <SelectItem value="ghtk">
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4" />
                            Giao Hàng Tiết Kiệm (GHTK)
                          </div>
                        </SelectItem>
                        <SelectItem value="viettel">
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4" />
                            Viettel Post
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="bg-white p-3 rounded border text-sm">
                    <div className="font-medium mb-1">Địa chỉ lấy hàng trả:</div>
                    <div className="text-gray-600">
                      {mockVendor.warehouseAddress || 'Kho hàng chính - 123 Đường ABC, Q.1, TP.HCM'}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Ghi chú cho shipper (tùy chọn)
                    </label>
                    <Textarea
                      value={shippingNote}
                      onChange={(e) => setShippingNote(e.target.value)}
                      placeholder="VD: Liên hệ trước 30 phút, gọi chuông 2 lần..."
                      rows={2}
                      className="text-sm"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between bg-white p-3 rounded border">
                    <div>
                      <div className="font-medium text-sm">Phí ship trả hàng</div>
                      <div className="text-xs text-gray-500">Ai thanh toán phí vận chuyển?</div>
                    </div>
                    <Select value={shippingFeePayer} onValueChange={setShippingFeePayer}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vendor">Vendor trả</SelectItem>
                        <SelectItem value="customer">Khách trả</SelectItem>
                        <SelectItem value="shop">Shop trả</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
            
            {selectedReturn?.images && selectedReturn.images.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Hình ảnh từ khách hàng</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedReturn.images.map((img, idx) => (
                    <img key={idx} src={img} alt="Return" 
                      className="w-24 h-24 object-cover rounded border" />
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            {generatedLabel && (
              <Button 
                variant="outline"
                onClick={() => window.open(generatedLabel.labelUrl, '_blank')}
              >
                <Printer className="w-4 h-4 mr-2" />
                In vận đơn
              </Button>
            )}
            <Button variant="outline" onClick={() => setShowApproveModal(false)}>
              Hủy
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700"
              onClick={handleConfirmApprove}
              disabled={mockVendor.paymentModel === 'upfront'}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Xác nhận chấp nhận
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showRejectModal} onOpenChange={(open) => {
        setShowRejectModal(open);
        if (!open) {
          setSelectedReturn(null);
          setRejectionReason('');
          setRejectionNote('');
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Từ chối trả hàng {selectedReturn?.id}</DialogTitle>
            <DialogDescription>
              Vui lòng cho biết lý do từ chối để thông báo khách hàng
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-gray-50 p-3 rounded text-sm">
              <div><strong>Sản phẩm:</strong> {selectedReturn?.productName}</div>
              <div><strong>Lý do trả:</strong> {selectedReturn?.reason && (returnReasonLabels[selectedReturn.reason as keyof typeof returnReasonLabels] || selectedReturn.reason)}</div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Lý do từ chối <span className="text-red-500">*</span>
              </label>
              <Select value={rejectionReason} onValueChange={setRejectionReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn lý do từ chối" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expired_return_window">
                    Quá thời gian đổi trả ({'>'}7 ngày)
                  </SelectItem>
                  <SelectItem value="product_used">
                    Sản phẩm đã qua sử dụng
                  </SelectItem>
                  <SelectItem value="incomplete_packaging">
                    Thiếu bao bì/phụ kiện
                  </SelectItem>
                  <SelectItem value="no_defect_found">
                    Không phát hiện lỗi
                  </SelectItem>
                  <SelectItem value="customer_fault">
                    Lỗi do khách hàng
                  </SelectItem>
                  <SelectItem value="other">
                    Lý do khác
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Ghi chú thêm
              </label>
              <Textarea
                value={rejectionNote}
                onChange={(e) => setRejectionNote(e.target.value)}
                placeholder="Giải thích chi tiết lý do từ chối..."
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectModal(false)}>
              Hủy
            </Button>
            <Button 
              variant="destructive"
              onClick={handleConfirmReject}
              disabled={!rejectionReason}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Xác nhận từ chối
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
