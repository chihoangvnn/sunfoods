import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  ShoppingCart, 
  Plus, 
  Minus,
  Trash2,
  Loader2,
  CheckCircle,
  Package,
  User,
  MapPin,
  Phone,
  DollarSign,
  TrendingUp,
  Search,
  AlertCircle
} from 'lucide-react';
import AffiliateLayout from '@/layouts/AffiliateLayout';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Product {
  id: string;
  name: string;
  price: string;
  stock: number;
  image?: string;
  categoryId?: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

interface CreateOrderRequest {
  phone: string;
  productId: string;
  quantity: number;
  shippingAddress?: string;
  customerName?: string;
  note?: string;
}

export default function AffiliateCreateOrder() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  
  // Form state
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    shippingAddress: '',
    note: ''
  });

  // Fetch affiliate session to get commission rate
  const { data: sessionData } = useQuery({
    queryKey: ['/api/affiliate-auth/session'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/affiliate-auth/session');
      if (!response.ok) throw new Error('Not authenticated');
      return response.json();
    },
  });

  // Fetch products
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['/api/products', { search: searchQuery }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      
      const response = await apiRequest('GET', `/api/products?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch products');
      
      return response.json();
    },
  });

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: async (orderData: CreateOrderRequest) => {
      const response = await apiRequest('POST', '/api/affiliate/me/create-order', {
        body: JSON.stringify(orderData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Không thể tạo đơn hàng');
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Tạo đơn hàng thành công!",
        description: `Hoa hồng của bạn: ${data.data.commission.amount} VND (${data.data.commission.rate})`,
        duration: 5000,
      });
      
      // Reset form and cart
      setCart([]);
      setFormData({
        customerName: '',
        phone: '',
        shippingAddress: '',
        note: ''
      });
      
      // Redirect to earnings page
      setTimeout(() => {
        setLocation('/aff/earnings');
      }, 2000);
    },
    onError: (error: Error) => {
      toast({
        title: "Tạo đơn hàng thất bại",
        description: error.message || 'Vui lòng kiểm tra lại thông tin',
        variant: "destructive",
        duration: 5000,
      });
    },
  });

  // Add product to cart
  const addToCart = () => {
    if (!selectedProductId) {
      toast({
        title: "Chưa chọn sản phẩm",
        description: "Vui lòng chọn sản phẩm trước khi thêm vào giỏ",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    const product = productsData?.find((p: Product) => p.id === selectedProductId);
    if (!product) return;

    // Check stock availability
    if (product.stock <= 0) {
      toast({
        title: "Sản phẩm hết hàng",
        description: "Sản phẩm này hiện không còn hàng trong kho",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    // Enforce single-product limitation (backend constraint)
    if (cart.length >= 1) {
      toast({
        title: "Chỉ hỗ trợ 1 sản phẩm",
        description: "Hiện tại chỉ có thể tạo đơn hàng với 1 sản phẩm. Vui lòng xóa sản phẩm hiện tại nếu muốn thêm sản phẩm khác.",
        variant: "destructive",
        duration: 5000,
      });
      return;
    }

    // Check if product already in cart
    const existingItem = cart.find(item => item.product.id === product.id);
    if (existingItem) {
      toast({
        title: "Sản phẩm đã có trong giỏ",
        description: "Vui lòng điều chỉnh số lượng trong giỏ hàng",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    setCart([...cart, { product, quantity: 1 }]);
    setSelectedProductId('');
    
    toast({
      title: "Đã thêm vào giỏ",
      description: product.name,
      duration: 2000,
    });
  };

  // Update cart item quantity
  const updateQuantity = (productId: string, delta: number) => {
    setCart(prevCart => 
      prevCart.map(item => {
        if (item.product.id === productId) {
          const newQty = Math.max(1, Math.min(item.product.stock, item.quantity + delta));
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  // Remove from cart
  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
  };

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => 
    sum + (parseFloat(item.product.price) * item.quantity), 0
  );
  const shippingFee = 5.00; // Estimate only - backend calculates actual fee
  const total = subtotal + shippingFee;
  
  // Commission - use actual affiliate commission rate from session
  const commissionRate = sessionData?.affiliate?.commission_rate 
    ? parseFloat(sessionData.affiliate.commission_rate) / 100 
    : 0.10; // Fallback to 10% if not available
  const estimatedCommission = subtotal * commissionRate;

  // Handle form input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Submit order
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.phone.trim()) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng nhập số điện thoại khách hàng",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    if (cart.length === 0) {
      toast({
        title: "Giỏ hàng trống",
        description: "Vui lòng thêm ít nhất một sản phẩm vào giỏ",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    // Single product validation (should not happen since we enforce at add, but double-check)
    if (cart.length !== 1) {
      toast({
        title: "Lỗi giỏ hàng",
        description: "Chỉ có thể tạo đơn hàng với đúng 1 sản phẩm.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    const firstItem = cart[0];
    
    createOrderMutation.mutate({
      phone: formData.phone.trim(),
      productId: firstItem.product.id,
      quantity: firstItem.quantity,
      shippingAddress: formData.shippingAddress.trim() || undefined,
      customerName: formData.customerName.trim() || undefined,
      note: formData.note.trim() || undefined
    });
  };

  const products = productsData || [];

  return (
    <AffiliateLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <ShoppingCart className="h-8 w-8 text-blue-600" />
            Tạo đơn hàng cho khách
          </h1>
          <p className="text-gray-600 mt-2">
            Tạo đơn hàng trực tiếp và nhận hoa hồng ngay lập tức
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Customer & Product */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600" />
                  Thông tin khách hàng
                </CardTitle>
                <CardDescription>
                  Nhập thông tin người nhận hàng
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">
                      Số điện thoại <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="0901234567"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customerName">
                      Tên khách hàng
                    </Label>
                    <Input
                      id="customerName"
                      name="customerName"
                      value={formData.customerName}
                      onChange={handleInputChange}
                      placeholder="Nguyễn Văn A"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shippingAddress">
                    Địa chỉ giao hàng
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Textarea
                      id="shippingAddress"
                      name="shippingAddress"
                      value={formData.shippingAddress}
                      onChange={handleInputChange}
                      placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                      className="pl-10 min-h-[80px]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="note">
                    Ghi chú đơn hàng
                  </Label>
                  <Textarea
                    id="note"
                    name="note"
                    value={formData.note}
                    onChange={handleInputChange}
                    placeholder="Ghi chú thêm về đơn hàng (tùy chọn)"
                    className="min-h-[60px]"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Product Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-purple-600" />
                  Chọn sản phẩm
                </CardTitle>
                <CardDescription>
                  Tìm và thêm sản phẩm vào đơn hàng
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search & Select */}
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      type="text"
                      placeholder="Tìm sản phẩm..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Chọn sản phẩm" />
                    </SelectTrigger>
                    <SelectContent>
                      {productsLoading ? (
                        <SelectItem value="loading" disabled>Đang tải...</SelectItem>
                      ) : products.length === 0 ? (
                        <SelectItem value="empty" disabled>Không có sản phẩm</SelectItem>
                      ) : (
                        products.map((product: Product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name} - {parseFloat(product.price).toLocaleString('vi-VN')}đ
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <Button 
                    type="button"
                    onClick={addToCart}
                    disabled={!selectedProductId}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm
                  </Button>
                </div>

                {/* Cart Items */}
                <div className="space-y-3">
                  {cart.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p>Chưa có sản phẩm nào trong giỏ</p>
                    </div>
                  ) : (
                    <>
                      {cart.length > 1 && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-yellow-800">
                            <strong>Lưu ý:</strong> Hiện tại chỉ hỗ trợ tạo đơn hàng với 1 sản phẩm. Vui lòng xóa các sản phẩm thừa.
                          </p>
                        </div>
                      )}
                      {cart.map((item) => (
                        <div 
                          key={item.product.id} 
                          className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
                        >
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{item.product.name}</h4>
                            <p className="text-sm text-gray-600">
                              {parseFloat(item.product.price).toLocaleString('vi-VN')}đ × {item.quantity}
                            </p>
                            <p className="text-xs text-gray-500">Kho: {item.product.stock}</p>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.product.id, -1)}
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.product.id, 1)}
                              disabled={item.quantity >= item.product.stock}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">
                              {(parseFloat(item.product.price) * item.quantity).toLocaleString('vi-VN')}đ
                            </p>
                          </div>
                          
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromCart(item.product.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  Tổng kết đơn hàng
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Price Breakdown */}
                <div className="space-y-3 pb-4 border-b">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tổng sản phẩm:</span>
                    <span className="font-medium">{subtotal.toLocaleString('vi-VN')}đ</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Phí vận chuyển (ước tính):</span>
                    <span className="font-medium">{shippingFee.toLocaleString('vi-VN')}đ</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span className="text-gray-900">Tổng thanh toán:</span>
                    <span className="text-blue-600">{total.toLocaleString('vi-VN')}đ</span>
                  </div>
                </div>

                {/* Commission Preview */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <h4 className="font-semibold text-green-900">Hoa hồng của bạn</h4>
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    ~{estimatedCommission.toLocaleString('vi-VN')}đ
                  </p>
                  <p className="text-xs text-green-700 mt-1">
                    Ước tính {(commissionRate * 100).toFixed(1)}% trên tổng sản phẩm
                  </p>
                </div>

                {/* Submit Button */}
                <Button 
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  disabled={createOrderMutation.isPending || cart.length === 0}
                  size="lg"
                >
                  {createOrderMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang tạo đơn...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Tạo đơn hàng
                    </>
                  )}
                </Button>

                {/* Info */}
                <div className="text-xs text-gray-500 space-y-1 pt-2 border-t">
                  <p>💡 Đơn hàng sẽ được xử lý ngay sau khi tạo thành công</p>
                  <p>📱 Khách hàng sẽ nhận được thông báo qua số điện thoại</p>
                  <p>💰 Hoa hồng được tính trên tổng sản phẩm (không bao gồm phí ship)</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </form>
      </div>
    </AffiliateLayout>
  );
}
