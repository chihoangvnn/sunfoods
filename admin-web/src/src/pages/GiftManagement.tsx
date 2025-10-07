import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Gift, Plus, CreditCard, Users, BarChart3, Edit, Save, X } from "lucide-react";
import { GiftCheckoutForm } from "@/components/GiftCheckoutForm";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface GiftCampaign {
  id: string;
  name: string;
  description: string;
  value: number;
  type: 'fixed_amount' | 'percentage' | 'combo_package';
  status: 'active' | 'inactive' | 'disabled';
  validFrom: string;
  validUntil: string;
}

interface GiftVoucher {
  id: string;
  code: string;
  campaignId: string;
  status: 'issued' | 'redeemed' | 'expired' | 'cancelled';
  purchaserCustomerId: string;
  recipientName: string;
  recipientEmail: string;
  giftMessage: string;
  deliveryMethod: 'email' | 'sms' | 'print_at_home' | 'physical_pickup';
  createdAt: string;
}

export default function GiftManagement() {
  const [activeTab, setActiveTab] = useState("new-gift");
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", description: "" });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch gift campaigns
  const { data: campaigns = [], isLoading: campaignsLoading } = useQuery({
    queryKey: ['gift-campaigns'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/gift-campaigns');
      const result = await response.json();
      return result.data || [];
    },
  });

  // Fetch recent gift vouchers 
  const { data: vouchers = [], isLoading: vouchersLoading } = useQuery({
    queryKey: ['gift-vouchers'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/gift-vouchers?limit=10');
      const data = await response.json();
      return data.data || [];
    },
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': 
      case 'issued':
        return 'bg-green-100 text-green-800';
      case 'redeemed':
        return 'bg-blue-100 text-blue-800';
      case 'expired':
      case 'disabled':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Update campaign mutation
  const updateCampaignMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { name: string; description: string } }) => {
      const response = await apiRequest('PUT', `/api/gift-campaigns/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gift-campaigns'] });
      toast({
        title: "Thành công",
        description: "Đã cập nhật gift campaign",
      });
      setEditingCampaign(null);
    },
    onError: () => {
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật gift campaign",
        variant: "destructive",
      });
    },
  });

  const handleEditClick = (campaign: GiftCampaign) => {
    setEditingCampaign(campaign.id);
    setEditForm({ name: campaign.name, description: campaign.description });
  };

  const handleSaveEdit = () => {
    if (editingCampaign) {
      updateCampaignMutation.mutate({
        id: editingCampaign,
        data: editForm,
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingCampaign(null);
    setEditForm({ name: "", description: "" });
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 shadow-lg">
          <Gift className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Quản Lý Quà Tặng
          </h1>
          <p className="text-muted-foreground">Hệ thống quà tặng nhang sạch Việt Nam</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="new-gift" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Tạo Quà Tặng
          </TabsTrigger>
          <TabsTrigger value="campaigns" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Chiến Dịch
          </TabsTrigger>
          <TabsTrigger value="vouchers" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Phiếu Quà Tặng
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Thống Kê
          </TabsTrigger>
        </TabsList>

        <TabsContent value="new-gift" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-pink-600" />
                Tạo Quà Tặng Mới
              </CardTitle>
            </CardHeader>
            <CardContent>
              {showCheckoutForm ? (
                <GiftCheckoutForm onClose={() => setShowCheckoutForm(false)} />
              ) : (
                <div className="text-center py-8">
                  <Gift className="h-16 w-16 text-pink-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Bắt Đầu Tạo Quà Tặng</h3>
                  <p className="text-muted-foreground mb-6">
                    Chọn sản phẩm quà tặng và điền thông tin người nhận
                  </p>
                  <Button 
                    onClick={() => setShowCheckoutForm(true)}
                    className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Tạo Quà Tặng
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Chiến Dịch Quà Tặng</CardTitle>
            </CardHeader>
            <CardContent>
              {campaignsLoading ? (
                <div className="text-center py-8">Đang tải...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {campaigns.map((campaign: GiftCampaign) => (
                    <Card key={campaign.id} className="border-2">
                      <CardContent className="p-4">
                        {editingCampaign === campaign.id ? (
                          // Edit Mode
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <h4 className="font-medium">Chỉnh sửa Gift Card</h4>
                              <div className="flex gap-2">
                                <Button size="sm" onClick={handleSaveEdit} disabled={updateCampaignMutation.isPending}>
                                  <Save className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            <div className="space-y-3">
                              <div>
                                <label className="text-sm font-medium">Tên Gift Card</label>
                                <Input
                                  value={editForm.name}
                                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                  placeholder="Tên gift card cho sự kiện..."
                                />
                              </div>
                              <div>
                                <label className="text-sm font-medium">Mô tả</label>
                                <Textarea
                                  value={editForm.description}
                                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                  placeholder="Mô tả chi tiết cho sự kiện..."
                                  rows={3}
                                />
                              </div>
                            </div>
                          </div>
                        ) : (
                          // View Mode
                          <>
                            <div className="flex justify-between items-start mb-3">
                              <h3 className="font-semibold text-lg">{campaign.name}</h3>
                              <div className="flex items-center gap-2">
                                <Button size="sm" variant="ghost" onClick={() => handleEditClick(campaign)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Badge className={getStatusColor(campaign.status)}>
                                  {campaign.status === 'active' ? 'Hoạt động' : 
                                   campaign.status === 'inactive' ? 'Tạm dừng' : 'Vô hiệu'}
                                </Badge>
                              </div>
                            </div>
                            <p className="text-muted-foreground text-sm mb-3">{campaign.description}</p>
                            <div className="flex justify-between items-center">
                              <span className="text-2xl font-bold text-pink-600">
                                {formatPrice(Number(campaign.value))}
                              </span>
                              <Badge variant="outline">
                                {campaign.type === 'fixed_amount' ? 'Số tiền cố định' :
                                 campaign.type === 'percentage' ? 'Phần trăm' : 'Gói combo'}
                              </Badge>
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vouchers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Phiếu Quà Tặng Gần Đây</CardTitle>
            </CardHeader>
            <CardContent>
              {vouchersLoading ? (
                <div className="text-center py-8">Đang tải...</div>
              ) : (
                <div className="space-y-4">
                  {vouchers.map((voucher: GiftVoucher) => (
                    <div key={voucher.id} className="border rounded-lg p-4 flex justify-between items-center">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                            {voucher.code}
                          </code>
                          <Badge className={getStatusColor(voucher.status)}>
                            {voucher.status === 'issued' ? 'Đã phát hành' :
                             voucher.status === 'redeemed' ? 'Đã sử dụng' :
                             voucher.status === 'expired' ? 'Hết hạn' : 'Đã hủy'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Người nhận: <strong>{voucher.recipientName}</strong> - {voucher.recipientEmail}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Giao hàng: {voucher.deliveryMethod === 'email' ? 'Email' :
                                     voucher.deliveryMethod === 'sms' ? 'SMS' :
                                     voucher.deliveryMethod === 'print_at_home' ? 'In tại nhà' : 'Nhận trực tiếp'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          {new Date(voucher.createdAt).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                    </div>
                  ))}
                  {vouchers.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      Chưa có phiếu quà tặng nào
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Tổng Phiếu QT</p>
                    <p className="text-2xl font-bold">0</p>
                  </div>
                  <CreditCard className="h-8 w-8 text-pink-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Đã Sử Dụng</p>
                    <p className="text-2xl font-bold">0</p>
                  </div>
                  <Users className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div>
                  <p className="text-muted-foreground text-sm">Doanh Thu QT</p>
                  <p className="text-2xl font-bold">{formatPrice(0)}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div>
                  <p className="text-muted-foreground text-sm">Tỷ Lệ Sử Dụng</p>
                  <p className="text-2xl font-bold">0%</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}