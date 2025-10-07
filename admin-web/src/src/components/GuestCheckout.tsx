import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, User, MapPin, CreditCard, CheckCircle, Ticket } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface GuestCheckoutProps {
  products?: Product[];
  onSuccess?: (orderId: string) => void;
}

export function GuestCheckout({ products = [], onSuccess }: GuestCheckoutProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'info' | 'payment' | 'success'>('info');
  const [orderResult, setOrderResult] = useState<any>(null);

  // Voucher state
  const [voucherCode, setVoucherCode] = useState('');
  const [validatingVoucher, setValidatingVoucher] = useState(false);
  const [appliedVoucher, setAppliedVoucher] = useState<any>(null);
  const [voucherError, setVoucherError] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);

  // Form state
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerAddress: '',
    deliveryType: 'local_delivery' as 'local_delivery' | 'cod_shipping',
    paymentMethod: 'qr_code' as 'qr_code' | 'bank_transfer' | 'cash',
    notes: ''
  });

  // Demo products if none provided
  const defaultProducts: Product[] = [
    { id: '1', name: 'Nhang Trầm Hương Cao Cấp', price: 120000, quantity: 2 },
    { id: '2', name: 'Nhang Quế Thơm', price: 85000, quantity: 1 }
  ];

  const checkoutProducts = products.length > 0 ? products : defaultProducts;
  const subtotal = checkoutProducts.reduce((sum, p) => sum + (p.price * p.quantity), 0);
  const finalTotal = subtotal - discountAmount;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateVoucher = async () => {
    if (!voucherCode.trim()) {
      setVoucherError('Vui lòng nhập mã giảm giá');
      return;
    }
    
    setValidatingVoucher(true);
    setVoucherError('');
    
    try {
      const response = await fetch('/api/checkout/validate-voucher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          voucherCode: voucherCode.trim(),
          orderAmount: subtotal,
          items: checkoutProducts.map(p => ({
            productId: p.id,
            quantity: p.quantity,
            price: p.price
          }))
        })
      });
      
      const result = await response.json();
      
      if (result.valid) {
        setAppliedVoucher(result.voucher);
        setDiscountAmount(result.discount.discountAmount);
        toast({
          title: '✅ Áp dụng mã thành công!',
          description: result.discount.message
        });
      } else {
        setVoucherError(result.error);
        setAppliedVoucher(null);
        setDiscountAmount(0);
      }
    } catch (error) {
      setVoucherError('Không thể kiểm tra mã giảm giá');
    } finally {
      setValidatingVoucher(false);
    }
  };

  const removeVoucher = () => {
    setVoucherCode('');
    setAppliedVoucher(null);
    setDiscountAmount(0);
    setVoucherError('');
  };

  const handleSubmitOrder = async () => {
    // Validation
    if (!formData.customerName.trim()) {
      toast({ title: 'Lỗi', description: 'Vui lòng nhập tên khách hàng', variant: 'destructive' });
      return;
    }
    if (!formData.customerEmail.trim()) {
      toast({ title: 'Lỗi', description: 'Vui lòng nhập email', variant: 'destructive' });
      return;
    }
    if (!formData.customerPhone.trim()) {
      toast({ title: 'Lỗi', description: 'Vui lòng nhập số điện thoại', variant: 'destructive' });
      return;
    }
    if (!formData.customerAddress.trim()) {
      toast({ title: 'Lỗi', description: 'Vui lòng nhập địa chỉ giao hàng', variant: 'destructive' });
      return;
    }

    setLoading(true);
    
    try {
      const guestCheckoutData = {
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        customerAddress: formData.customerAddress,
        items: checkoutProducts.map(p => ({
          productId: p.id,
          productName: p.name,
          quantity: p.quantity,
          price: p.price
        })),
        total: finalTotal,
        deliveryType: formData.deliveryType,
        paymentMethod: formData.paymentMethod,
        notes: formData.notes,
        voucherCode: appliedVoucher?.code || null,
        discountAmount: discountAmount
      };

      const response = await apiRequest('POST', '/api/guest-checkout', guestCheckoutData);
      const result = await response.json();
      
      if (result.success) {
        setOrderResult(result.data);
        setStep(formData.paymentMethod === 'qr_code' ? 'payment' : 'success');
        
        toast({
          title: '🎉 Đặt hàng thành công!',
          description: `Đơn hàng ${result.data.orderId} đã được tạo. Cảm ơn ${formData.customerName}!`
        });
        
        onSuccess?.(result.data.orderId);
      } else {
        throw new Error(result.error || 'Có lỗi xảy ra');
      }
      
    } catch (error: any) {
      console.error('Guest checkout error:', error);
      toast({
        title: 'Lỗi đặt hàng',
        description: error.message || 'Không thể tạo đơn hàng. Vui lòng thử lại.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const renderCustomerInfo = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Thông tin khách hàng
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Họ và tên *</label>
            <Input
              value={formData.customerName}
              onChange={(e) => handleInputChange('customerName', e.target.value)}
              placeholder="Nguyễn Văn A"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Email *</label>
            <Input
              type="email"
              value={formData.customerEmail}
              onChange={(e) => handleInputChange('customerEmail', e.target.value)}
              placeholder="email@example.com"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Số điện thoại *</label>
            <Input
              value={formData.customerPhone}
              onChange={(e) => handleInputChange('customerPhone', e.target.value)}
              placeholder="0901234567"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Phương thức giao hàng</label>
            <select
              value={formData.deliveryType}
              onChange={(e) => handleInputChange('deliveryType', e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="local_delivery">Giao hàng nội thành</option>
              <option value="cod_shipping">COD toàn quốc</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Địa chỉ giao hàng *</label>
          <Textarea
            value={formData.customerAddress}
            onChange={(e) => handleInputChange('customerAddress', e.target.value)}
            placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
            rows={3}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Ghi chú (tùy chọn)</label>
          <Textarea
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            placeholder="Ghi chú thêm về đơn hàng..."
            rows={2}
          />
        </div>
      </CardContent>
    </Card>
  );

  const renderVoucherCard = () => (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Ticket className="w-5 h-5" />
          Mã giảm giá
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!appliedVoucher ? (
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                placeholder="Nhập mã giảm giá"
                disabled={validatingVoucher}
              />
              <Button
                onClick={validateVoucher}
                disabled={validatingVoucher || !voucherCode.trim()}
              >
                {validatingVoucher ? 'Đang kiểm tra...' : 'Áp dụng'}
              </Button>
            </div>
            {voucherError && (
              <p className="text-sm text-red-600">{voucherError}</p>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between bg-green-50 p-3 rounded">
            <div>
              <p className="font-medium text-green-700">{appliedVoucher.code}</p>
              <p className="text-sm text-green-600">
                Giảm {formatPrice(discountAmount)}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={removeVoucher}>
              Xóa
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderOrderSummary = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="w-5 h-5" />
          Đơn hàng của bạn
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {checkoutProducts.map((product, index) => (
            <div key={index} className="flex justify-between items-center">
              <div className="flex-1">
                <p className="font-medium">{product.name}</p>
                <p className="text-sm text-gray-600">SL: {product.quantity}</p>
              </div>
              <p className="font-medium">{formatPrice(product.price * product.quantity)}</p>
            </div>
          ))}
          
          <Separator />
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Tạm tính:</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Giảm giá:</span>
                <span>-{formatPrice(discountAmount)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>Tổng cộng:</span>
              <span className="text-green-600">{formatPrice(finalTotal)}</span>
            </div>
          </div>

          <div className="mt-4">
            <label className="text-sm font-medium">Phương thức thanh toán</label>
            <select
              value={formData.paymentMethod}
              onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
              className="w-full px-3 py-2 border rounded-md mt-1"
            >
              <option value="qr_code">🏦 Chuyển khoản QR</option>
              <option value="bank_transfer">💳 Chuyển khoản ngân hàng</option>
              <option value="cash">💵 Thanh toán khi nhận hàng</option>
            </select>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderPaymentStep = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Thanh toán QR Code
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        {orderResult?.payment && (
          <div className="space-y-4">
            <img
              src={orderResult.payment.qrCodeUrl}
              alt="QR Code Payment"
              className="mx-auto border rounded-lg"
              style={{ maxWidth: '300px' }}
            />
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold">Thông tin chuyển khoản:</h3>
              <p><strong>Ngân hàng:</strong> {orderResult.payment.bankInfo.bankName}</p>
              <p><strong>Số tài khoản:</strong> {orderResult.payment.bankInfo.accountNumber}</p>
              <p><strong>Chủ tài khoản:</strong> {orderResult.payment.bankInfo.accountName}</p>
              <p><strong>Số tiền:</strong> {formatPrice(orderResult.payment.amount)}</p>
              <p><strong>Nội dung:</strong> {orderResult.payment.standardReference}</p>
            </div>
            
            <Badge variant="outline" className="text-orange-600">
              ⏰ QR Code có hiệu lực trong 15 phút
            </Badge>
          </div>
        )}
        
        <Button 
          onClick={() => setStep('success')} 
          className="mt-4 w-full"
          variant="outline"
        >
          Đã chuyển khoản xong
        </Button>
      </CardContent>
    </Card>
  );

  const renderSuccessStep = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-600">
          <CheckCircle className="w-5 h-5" />
          Đặt hàng thành công!
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <div className="text-2xl">🎉</div>
        <p className="text-lg font-semibold">
          Cảm ơn {formData.customerName}!
        </p>
        <p>Đơn hàng <strong>{orderResult?.orderId}</strong> đã được tạo thành công.</p>
        
        {orderResult?.customer && (
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800">🎁 Tích điểm thành viên:</h3>
            <p>Bạn được tích <strong>+{orderResult.customer.pointsEarned} điểm</strong></p>
            <p>Tổng điểm hiện tại: <strong>{orderResult.customer.newTotalPoints} điểm</strong></p>
            <Badge variant="secondary" className="mt-2">
              Hạng thành viên: {orderResult.customer.membershipTier}
            </Badge>
          </div>
        )}
        
        <p className="text-sm text-gray-600">
          Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất để xác nhận đơn hàng.
        </p>
      </CardContent>
    </Card>
  );

  if (step === 'payment') {
    return renderPaymentStep();
  }

  if (step === 'success') {
    return renderSuccessStep();
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="text-center mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">🛒 Đặt hàng nhanh</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-2">Nhang sạch chất lượng cao - Giao hàng toàn quốc</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <div>
          {renderCustomerInfo()}
        </div>
        
        <div>
          {renderVoucherCard()}
          {renderOrderSummary()}
          
          <Button
            onClick={handleSubmitOrder}
            disabled={loading}
            className="w-full mt-4 bg-green-600 hover:bg-green-700"
            size="lg"
          >
            {loading ? 'Đang xử lý...' : `Đặt hàng - ${formatPrice(finalTotal)}`}
          </Button>
        </div>
      </div>
    </div>
  );
}