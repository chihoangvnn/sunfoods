import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useState } from 'react';
import { Copy, Ticket, Gift, Clock, CheckCircle2, XCircle, ShoppingBag } from 'lucide-react';

const toast = {
  success: (message: string) => alert(`✅ ${message}`),
  error: (message: string) => alert(`❌ ${message}`)
};

interface DiscountCode {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed_amount' | 'hybrid_tiered';
  discountValue: string;
  minOrderAmount: string | null;
  maxDiscountAmount: string | null;
  maxUsage: number | null;
  usageCount: number;
  validFrom: string | null;
  validUntil: string | null;
  isActive: boolean;
  description?: string;
}

interface CustomerVoucher {
  id: string;
  customerId: string;
  discountCodeId: string;
  claimedAt: string;
  usedAt: string | null;
  status: 'active' | 'used' | 'expired';
  campaignId?: string;
  discountCode: DiscountCode;
}

interface VouchersResponse {
  active: CustomerVoucher[];
  used: CustomerVoucher[];
  expired: CustomerVoucher[];
}

const formatVND = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export default function MyVouchers() {
  const queryClient = useQueryClient();
  const [claimCode, setClaimCode] = useState('');
  const [isClaimDialogOpen, setIsClaimDialogOpen] = useState(false);

  const { data: vouchers, isLoading } = useQuery<VouchersResponse>({
    queryKey: ['customer', 'vouchers'],
    queryFn: async () => {
      const response = await fetch('/api/customer/vouchers', {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch vouchers');
      }
      return response.json();
    }
  });

  const claimMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await fetch('/api/customer/vouchers/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ code })
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Không thể lưu mã giảm giá');
      }
      return response.json();
    },
    onSuccess: () => {
      toast.success('Đã lưu mã giảm giá thành công!');
      queryClient.invalidateQueries({ queryKey: ['customer', 'vouchers'] });
      setClaimCode('');
      setIsClaimDialogOpen(false);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Đã sao chép mã giảm giá!');
  };

  const handleClaimVoucher = () => {
    if (!claimCode.trim()) {
      toast.error('Vui lòng nhập mã giảm giá');
      return;
    }
    claimMutation.mutate(claimCode);
  };

  const getDiscountText = (voucher: CustomerVoucher) => {
    if (voucher.discountCode.discountType === 'percentage') {
      return `Giảm ${voucher.discountCode.discountValue}%`;
    }
    return `Giảm ${formatVND(parseFloat(voucher.discountCode.discountValue))}`;
  };

  const activeVouchers = vouchers?.active || [];
  const usedVouchers = vouchers?.used || [];
  const expiredVouchers = vouchers?.expired || [];

  const VoucherCard = ({ voucher }: { voucher: CustomerVoucher }) => {
    const isActive = voucher.status === 'active';
    const isUsed = voucher.status === 'used';
    const isExpired = voucher.status === 'expired';

    return (
      <Card className={`border-0 shadow-lg transition-all hover:shadow-xl ${
        isActive ? 'bg-gradient-to-br from-orange-50 to-red-50' : 
        isUsed ? 'bg-gray-50' : 'bg-gray-100 opacity-75'
      }`}>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-3 rounded-full ${
                  isActive ? 'bg-gradient-to-br from-orange-500 to-red-500' : 'bg-gray-400'
                }`}>
                  <Ticket className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <code className="text-2xl font-bold bg-white/80 px-3 py-1 rounded-lg border-2 border-dashed border-orange-300">
                      {voucher.discountCode.code}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(voucher.discountCode.code)}
                      className="hover:bg-orange-100"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="mt-2">
                    {isActive && (
                      <Badge className="bg-green-500 text-white">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Có thể dùng
                      </Badge>
                    )}
                    {isUsed && (
                      <Badge className="bg-gray-500 text-white">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Đã sử dụng
                      </Badge>
                    )}
                    {isExpired && (
                      <Badge className="bg-red-500 text-white">
                        <XCircle className="w-3 h-3 mr-1" />
                        Đã hết hạn
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-3xl font-bold text-orange-600">
                  {getDiscountText(voucher)}
                </div>
                {voucher.discountCode.description && (
                  <p className="text-gray-600 text-sm">{voucher.discountCode.description}</p>
                )}
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  {voucher.discountCode.validUntil && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>Hết hạn: {formatDate(voucher.discountCode.validUntil)}</span>
                    </div>
                  )}
                  {voucher.discountCode.minOrderAmount && (
                    <div className="flex items-center gap-1">
                      <ShoppingBag className="w-4 h-4" />
                      <span>Đơn tối thiểu: {formatVND(parseFloat(voucher.discountCode.minOrderAmount))}</span>
                    </div>
                  )}
                </div>
                {isUsed && voucher.usedAt && (
                  <div className="text-sm text-gray-500">
                    Đã dùng ngày: {formatDate(voucher.usedAt)}
                  </div>
                )}
              </div>
            </div>

            {isActive && (
              <div className="md:ml-4">
                <Button
                  className="w-full md:w-auto bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                  onClick={() => {
                    copyToClipboard(voucher.discountCode.code);
                  }}
                >
                  <Gift className="w-4 h-4 mr-2" />
                  Sử dụng ngay
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-40 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6 bg-gradient-to-br from-orange-50 via-red-50 to-amber-50 min-h-screen">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-full">
            <Ticket className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Mã Giảm Giá Của Tôi
          </h1>
        </div>
        <p className="text-gray-600">Quản lý và sử dụng mã giảm giá của bạn</p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-orange-200">
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{activeVouchers.length}</div>
            <div className="text-sm text-gray-600">Có thể dùng</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">{usedVouchers.length}</div>
            <div className="text-sm text-gray-600">Đã sử dụng</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{expiredVouchers.length}</div>
            <div className="text-sm text-gray-600">Đã hết hạn</div>
          </div>
        </div>

        <Dialog open={isClaimDialogOpen} onOpenChange={setIsClaimDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white">
              <Gift className="w-4 h-4 mr-2" />
              Lưu mã giảm giá
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Lưu mã giảm giá
              </DialogTitle>
              <DialogDescription>
                Nhập mã giảm giá để lưu vào tài khoản của bạn
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="voucher-code">Mã giảm giá</Label>
                <Input
                  id="voucher-code"
                  placeholder="Nhập mã giảm giá"
                  value={claimCode}
                  onChange={(e) => setClaimCode(e.target.value.toUpperCase())}
                  className="uppercase"
                />
              </div>
              <Button
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                onClick={handleClaimVoucher}
                disabled={claimMutation.isPending}
              >
                {claimMutation.isPending ? 'Đang lưu...' : 'Lưu mã'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur-sm">
          <TabsTrigger value="active" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white">
            Có thể dùng ({activeVouchers.length})
          </TabsTrigger>
          <TabsTrigger value="used" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white">
            Đã sử dụng ({usedVouchers.length})
          </TabsTrigger>
          <TabsTrigger value="expired" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white">
            Đã hết hạn ({expiredVouchers.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4 mt-6">
          {activeVouchers.length === 0 ? (
            <Alert className="bg-white/80 backdrop-blur-sm border-orange-200">
              <Gift className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-gray-600">
                Bạn chưa có mã giảm giá nào. Nhấn "Lưu mã giảm giá" để thêm mã mới!
              </AlertDescription>
            </Alert>
          ) : (
            activeVouchers.map(voucher => (
              <VoucherCard key={voucher.id} voucher={voucher} />
            ))
          )}
        </TabsContent>

        <TabsContent value="used" className="space-y-4 mt-6">
          {usedVouchers.length === 0 ? (
            <Alert className="bg-white/80 backdrop-blur-sm border-gray-200">
              <CheckCircle2 className="h-4 w-4 text-gray-600" />
              <AlertDescription className="text-gray-600">
                Chưa có mã giảm giá nào được sử dụng
              </AlertDescription>
            </Alert>
          ) : (
            usedVouchers.map(voucher => (
              <VoucherCard key={voucher.id} voucher={voucher} />
            ))
          )}
        </TabsContent>

        <TabsContent value="expired" className="space-y-4 mt-6">
          {expiredVouchers.length === 0 ? (
            <Alert className="bg-white/80 backdrop-blur-sm border-gray-200">
              <Clock className="h-4 w-4 text-gray-600" />
              <AlertDescription className="text-gray-600">
                Không có mã giảm giá nào hết hạn
              </AlertDescription>
            </Alert>
          ) : (
            expiredVouchers.map(voucher => (
              <VoucherCard key={voucher.id} voucher={voucher} />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
