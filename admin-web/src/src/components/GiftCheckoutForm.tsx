import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { X, Gift, Send, Printer, Mail, MessageCircle, Download } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { CustomerSearchInput } from "./CustomerSearchInput";
import type { Customer, GiftCampaign } from "@shared/schema";

interface GiftCheckoutProps {
  onClose: () => void;
  onSuccess?: (voucher: any) => void;
  preSelectedCampaign?: string; // Pre-select a gift campaign
}

interface GiftFormData {
  // Purchaser Info (existing customer or new)
  purchaserId: string;
  purchaserName: string;
  purchaserEmail: string;
  purchaserPhone: string;

  // Gift Campaign
  campaignId: string;
  quantity: number;

  // Recipient Info
  recipientName: string;
  recipientEmail: string;
  recipientPhone: string;

  // Gift Details
  giftMessage: string;
  deliveryMethod: "email" | "sms" | "physical" | "print_at_home";
  
  // Scheduling
  deliveryDate: string; // ISO date string, empty = immediate
  
  // Payment
  paymentMethod: "cash" | "bank_transfer" | "debt";
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price);
};

const deliveryMethods = [
  { value: "email", label: "📧 Gửi qua Email", icon: Mail, desc: "Gửi voucher điện tử qua email" },
  { value: "sms", label: "📱 Gửi qua SMS", icon: MessageCircle, desc: "Gửi mã voucher qua tin nhắn" },
  { value: "print_at_home", label: "🖨️ In tại nhà", icon: Download, desc: "Tải PDF để tự in gift card" },
  { value: "physical", label: "🎁 Nhận tại cửa hàng", icon: Gift, desc: "Nhận thẻ quà vật lý tại cửa hàng" }
];

export function GiftCheckoutForm({ onClose, onSuccess, preSelectedCampaign }: GiftCheckoutProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form state
  const [formData, setFormData] = useState<GiftFormData>({
    purchaserId: "",
    purchaserName: "",
    purchaserEmail: "",
    purchaserPhone: "",
    campaignId: preSelectedCampaign || "",
    quantity: 1,
    recipientName: "",
    recipientEmail: "",
    recipientPhone: "",
    giftMessage: "",
    deliveryMethod: "email",
    deliveryDate: "",
    paymentMethod: "cash",
  });

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load gift campaigns
  const { data: giftCampaigns = [] } = useQuery<GiftCampaign[]>({
    queryKey: ['/api/gift-campaigns'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/gift-campaigns');
      const result = await response.json();
      return result.data; // Extract just the data array
    }
  });

  // Load customers
  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ['/api/customers'],
  });

  // Get selected campaign details
  const selectedCampaign = giftCampaigns.find(c => c.id === formData.campaignId);

  // Calculate total
  const totalAmount = selectedCampaign ? (Number(selectedCampaign.value) * formData.quantity) : 0;

  // Create gift voucher mutation
  const createGiftMutation = useMutation({
    mutationFn: async (data: GiftFormData) => {
      let customerId = data.purchaserId;
      
      // If no customer selected, create a new customer record
      if (!customerId && data.purchaserName && data.purchaserEmail) {
        const customerData = {
          name: data.purchaserName,
          email: data.purchaserEmail,
          phone: data.purchaserPhone || null,
          status: 'active' as const,
        };
        
        const customerResponse = await apiRequest('POST', '/api/customers', customerData);
        const newCustomer = await customerResponse.json();
        customerId = newCustomer.id;
      }
      
      // Create order first
      const orderData = {
        customerId: customerId,
        total: totalAmount.toString(),
        status: "completed",
        paymentMethod: data.paymentMethod,
        orderType: "gift_purchase",
        giftMetadata: {
          campaignId: data.campaignId,
          quantity: data.quantity,
          recipientInfo: {
            name: data.recipientName,
            email: data.recipientEmail,
            phone: data.recipientPhone,
          },
          giftMessage: data.giftMessage,
          deliveryMethod: data.deliveryMethod,
          deliveryDate: data.deliveryDate || null,
        }
      };

      // Create order
      const orderResponse = await apiRequest('POST', '/api/orders', orderData);
      const order = await orderResponse.json();

      // Create gift vouchers for this order
      const voucherPromises = [];
      for (let i = 0; i < data.quantity; i++) {
        const voucherData = {
          campaignId: data.campaignId,
          purchaserOrderId: order.id,
          purchaserCustomerId: customerId, // Use resolved customerId (from selection or creation)
          recipientName: data.recipientName,
          recipientEmail: data.recipientEmail,
          recipientPhone: data.recipientPhone,
          giftMessage: data.giftMessage,
          deliveryMethod: data.deliveryMethod,
          scheduledDeliveryAt: data.deliveryDate || null,
          status: "issued",
        };
        
        voucherPromises.push(
          apiRequest('POST', '/api/gift-vouchers', voucherData).then(r => r.json())
        );
      }

      const vouchers = await Promise.all(voucherPromises);
      return { order, vouchers };
    },
    onSuccess: ({ order, vouchers }) => {
      toast({
        title: "🎉 Thành công!",
        description: `Đã tạo ${vouchers.length} gift voucher thành công!`,
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/gift-vouchers'] });
      
      onSuccess?.({ order, vouchers });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Validation function
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Campaign selection
    if (!formData.campaignId) {
      newErrors.campaignId = "Vui lòng chọn loại gift card";
    }

    // Purchaser info
    if (!formData.purchaserId && (!formData.purchaserName || !formData.purchaserEmail)) {
      newErrors.purchaser = "Vui lòng chọn khách hàng hoặc nhập thông tin người mua";
    }

    // Recipient info
    if (!formData.recipientName) {
      newErrors.recipientName = "Vui lòng nhập tên người nhận";
    }

    // Email/SMS delivery requires contact info
    if (formData.deliveryMethod === "email" && !formData.recipientEmail) {
      newErrors.recipientEmail = "Email người nhận bắt buộc khi gửi qua email";
    }
    if (formData.deliveryMethod === "sms" && !formData.recipientPhone) {
      newErrors.recipientPhone = "Số điện thoại bắt buộc khi gửi qua SMS";
    }

    // Quantity
    if (formData.quantity < 1) {
      newErrors.quantity = "Số lượng phải lớn hơn 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng kiểm tra lại thông tin",
        variant: "destructive",
      });
      return;
    }

    createGiftMutation.mutate(formData);
  };

  // Handle customer selection  
  const handleCustomerSelect = (customer: any) => {
    if (customer) {
      setFormData({
        ...formData,
        purchaserId: customer.id,
        purchaserName: customer.name,
        purchaserEmail: customer.email || "",
        purchaserPhone: customer.phone || "",
      });
    } else {
      setFormData({
        ...formData,
        purchaserId: "",
        purchaserName: "",
        purchaserEmail: "",
        purchaserPhone: "",
      });
    }
  };

  // Get delivery method details
  const getDeliveryMethodDetails = (method: string) => {
    return deliveryMethods.find(m => m.value === method) || deliveryMethods[0];
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[95vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" />
            Mua Gift Card & Voucher Quà Tặng
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="overflow-y-auto max-h-[calc(95vh-120px)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Gift Campaign Selection */}
            <Card className="bg-gradient-to-r from-emerald-50 to-blue-50 border-emerald-200">
              <CardHeader>
                <CardTitle className="text-lg">🎁 Chọn Loại Gift Card</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select
                  value={formData.campaignId}
                  onValueChange={(value) => setFormData({ ...formData, campaignId: value })}
                >
                  <SelectTrigger className={errors.campaignId ? "border-red-500" : ""}>
                    <SelectValue placeholder="Chọn loại gift card" />
                  </SelectTrigger>
                  <SelectContent>
                    {giftCampaigns.map((campaign) => (
                      <SelectItem key={campaign.id} value={campaign.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{campaign.name}</span>
                          <Badge variant="secondary" className="ml-2">
                            {formatPrice(Number(campaign.value))}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.campaignId && <p className="text-red-500 text-sm">{errors.campaignId}</p>}
                
                {/* Campaign Details */}
                {selectedCampaign && (
                  <div className="p-4 bg-white rounded-lg border border-emerald-200">
                    <h4 className="font-medium text-emerald-800 mb-2">{selectedCampaign.name}</h4>
                    <p className="text-sm text-gray-600 mb-3">{selectedCampaign.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Badge variant="default">{formatPrice(Number(selectedCampaign.value))}</Badge>
                        <Badge variant={selectedCampaign.allowPartialRedemption ? "default" : "secondary"}>
                          {selectedCampaign.allowPartialRedemption ? "Dùng từng phần" : "Một lần"}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-500">
                        Có hiệu lực {selectedCampaign.validityDays} ngày
                      </div>
                    </div>
                  </div>
                )}

                {/* Quantity */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Số lượng</Label>
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                      className={errors.quantity ? "border-red-500" : ""}
                    />
                    {errors.quantity && <p className="text-red-500 text-sm">{errors.quantity}</p>}
                  </div>
                  
                  {/* Total Amount */}
                  <div className="space-y-2">
                    <Label>Tổng tiền</Label>
                    <div className="text-2xl font-bold text-primary">
                      {formatPrice(totalAmount)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Separator />

            {/* Purchaser Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">👤 Thông Tin Người Mua</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Khách hàng</Label>
                  <CustomerSearchInput
                    value={formData.purchaserId}
                    onSelect={handleCustomerSelect}
                    placeholder="Tìm khách hàng hoặc nhập thông tin mới..."
                  />
                  {errors.purchaser && <p className="text-red-500 text-sm">{errors.purchaser}</p>}
                </div>

                {/* Manual purchaser info if no customer selected */}
                {!formData.purchaserId && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border border-dashed border-gray-300 rounded-lg">
                    <div className="space-y-2">
                      <Label>Tên người mua *</Label>
                      <Input
                        value={formData.purchaserName}
                        onChange={(e) => setFormData({ ...formData, purchaserName: e.target.value })}
                        placeholder="Nhập tên đầy đủ"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email *</Label>
                      <Input
                        type="email"
                        value={formData.purchaserEmail}
                        onChange={(e) => setFormData({ ...formData, purchaserEmail: e.target.value })}
                        placeholder="email@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Số điện thoại</Label>
                      <Input
                        value={formData.purchaserPhone}
                        onChange={(e) => setFormData({ ...formData, purchaserPhone: e.target.value })}
                        placeholder="0901234567"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Separator />

            {/* Recipient Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">🎁 Thông Tin Người Nhận Quà</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Tên người nhận *</Label>
                    <Input
                      value={formData.recipientName}
                      onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                      placeholder="Tên người sẽ nhận quà"
                      className={errors.recipientName ? "border-red-500" : ""}
                    />
                    {errors.recipientName && <p className="text-red-500 text-sm">{errors.recipientName}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Email người nhận</Label>
                    <Input
                      type="email"
                      value={formData.recipientEmail}
                      onChange={(e) => setFormData({ ...formData, recipientEmail: e.target.value })}
                      placeholder="email@example.com"
                      className={errors.recipientEmail ? "border-red-500" : ""}
                    />
                    {errors.recipientEmail && <p className="text-red-500 text-sm">{errors.recipientEmail}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label>SĐT người nhận</Label>
                    <Input
                      value={formData.recipientPhone}
                      onChange={(e) => setFormData({ ...formData, recipientPhone: e.target.value })}
                      placeholder="0901234567"
                      className={errors.recipientPhone ? "border-red-500" : ""}
                    />
                    {errors.recipientPhone && <p className="text-red-500 text-sm">{errors.recipientPhone}</p>}
                  </div>
                </div>

                {/* Gift Message */}
                <div className="space-y-2">
                  <Label>Lời nhắn tặng kèm</Label>
                  <Textarea
                    value={formData.giftMessage}
                    onChange={(e) => setFormData({ ...formData, giftMessage: e.target.value })}
                    placeholder="Viết lời chúc hoặc tin nhắn tặng kèm gift card..."
                    rows={3}
                  />
                  <p className="text-xs text-gray-500">
                    {formData.giftMessage.length}/300 ký tự
                  </p>
                </div>
              </CardContent>
            </Card>

            <Separator />

            {/* Delivery & Payment */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Delivery Method */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">🚚 Cách Thức Giao Tặng</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Select
                    value={formData.deliveryMethod}
                    onValueChange={(value: any) => setFormData({ ...formData, deliveryMethod: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {deliveryMethods.map((method) => (
                        <SelectItem key={method.value} value={method.value}>
                          <div className="flex items-center gap-2">
                            <method.icon className="h-4 w-4" />
                            <div>
                              <div className="font-medium">{method.label}</div>
                              <div className="text-xs text-muted-foreground">{method.desc}</div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Delivery Date */}
                  <div className="space-y-2">
                    <Label>Ngày giao (tùy chọn)</Label>
                    <Input
                      type="datetime-local"
                      value={formData.deliveryDate}
                      onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                    />
                    <p className="text-xs text-gray-500">
                      Để trống sẽ giao ngay sau khi thanh toán
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">💳 Thanh Toán</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Select
                    value={formData.paymentMethod}
                    onValueChange={(value: any) => setFormData({ ...formData, paymentMethod: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">💵 Tiền mặt</SelectItem>
                      <SelectItem value="bank_transfer">🏦 Chuyển khoản</SelectItem>
                      <SelectItem value="debt">📋 Ghi nợ</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Order Summary */}
                  <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Gift card ({formData.quantity}x):</span>
                      <span>{formatPrice(totalAmount)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Tổng cộng:</span>
                      <span className="text-primary">{formatPrice(totalAmount)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end gap-4 pt-6">
              <Button type="button" variant="outline" onClick={onClose}>
                Hủy bỏ
              </Button>
              <Button 
                type="submit" 
                className="px-8"
                disabled={createGiftMutation.isPending}
              >
                {createGiftMutation.isPending ? (
                  "Đang tạo gift..."
                ) : (
                  <>
                    <Gift className="h-4 w-4 mr-2" />
                    Tạo Gift Voucher - {formatPrice(totalAmount)}
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}