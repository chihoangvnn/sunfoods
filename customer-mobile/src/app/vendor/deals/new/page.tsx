'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup } from '@/components/ui/radio-group';
import { Select } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Sparkles, Users, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface Product {
  id: string;
  name: string;
  price: string;
  image: string | null;
  stock: number;
}

interface ValidationErrors {
  salePrice?: string;
  startTime?: string;
  endTime?: string;
  targetQuantity?: string;
  deadline?: string;
}

function vietnameseToSlug(text: string): string {
  const from = 'àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ·/_,:;';
  const to = 'aaaaaaaaaaaaaaaaaeeeeeeeeeeeiiiiiooooooooooooooooouuuuuuuuuuuyyyyyd------';
  
  let str = text.toLowerCase();
  for (let i = 0; i < from.length; i++) {
    str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
  }
  
  str = str
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
  
  return str;
}

export default function NewDealPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [dealType, setDealType] = useState<'flash_sale' | 'group_buy'>('flash_sale');
  const [copiedLink, setCopiedLink] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    slug: '',
    originalPrice: '',
    salePrice: '',
    discountPercent: 0,
    startTime: '',
    endTime: '',
    targetQuantity: '',
    deadline: '',
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (formData.title) {
      const autoSlug = vietnameseToSlug(formData.title);
      setFormData(prev => ({ ...prev, slug: autoSlug }));
    }
  }, [formData.title]);

  useEffect(() => {
    if (formData.originalPrice && formData.salePrice) {
      const original = parseFloat(formData.originalPrice);
      const sale = parseFloat(formData.salePrice);
      if (original > 0 && sale > 0) {
        const discount = Math.round(((original - sale) / original) * 100);
        setFormData(prev => ({ ...prev, discountPercent: discount }));
      }
    }
  }, [formData.originalPrice, formData.salePrice]);

  const validatePrices = () => {
    const errors: ValidationErrors = {};
    const original = parseFloat(formData.originalPrice);
    const sale = parseFloat(formData.salePrice);

    if (sale <= 0) {
      errors.salePrice = 'Giá khuyến mãi phải lớn hơn 0';
    } else if (sale >= original) {
      errors.salePrice = 'Giá khuyến mãi phải nhỏ hơn giá gốc';
    }

    return errors;
  };

  const validateFlashSaleTimes = () => {
    const errors: ValidationErrors = {};
    
    if (formData.startTime && formData.endTime) {
      const start = new Date(formData.startTime);
      const end = new Date(formData.endTime);
      const now = new Date();

      if (start >= end) {
        errors.endTime = 'Thời gian kết thúc phải sau thời gian bắt đầu';
      } else if (end <= now) {
        errors.endTime = 'Thời gian kết thúc phải ở tương lai';
      }
    }

    return errors;
  };

  const validateGroupBuy = () => {
    const errors: ValidationErrors = {};
    const quantity = parseInt(formData.targetQuantity);

    if (quantity <= 0) {
      errors.targetQuantity = 'Số lượng mục tiêu phải lớn hơn 0';
    } else if (quantity > 10000) {
      errors.targetQuantity = 'Số lượng mục tiêu không được vượt quá 10,000';
    }

    if (formData.deadline) {
      const deadline = new Date(formData.deadline);
      const now = new Date();
      
      if (deadline <= now) {
        errors.deadline = 'Hạn chót phải ở tương lai';
      }
    }

    return errors;
  };

  const validateForm = () => {
    let errors: ValidationErrors = {};

    errors = { ...errors, ...validatePrices() };

    if (dealType === 'flash_sale') {
      errors = { ...errors, ...validateFlashSaleTimes() };
    } else if (dealType === 'group_buy') {
      errors = { ...errors, ...validateGroupBuy() };
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePriceChange = (field: 'originalPrice' | 'salePrice', value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    setTimeout(() => {
      const errors = validatePrices();
      setValidationErrors(prev => ({ ...prev, salePrice: errors.salePrice }));
    }, 100);
  };

  const handleFlashSaleTimeChange = (field: 'startTime' | 'endTime', value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    setTimeout(() => {
      const errors = validateFlashSaleTimes();
      setValidationErrors(prev => ({ 
        ...prev, 
        startTime: errors.startTime, 
        endTime: errors.endTime 
      }));
    }, 100);
  };

  const handleGroupBuyChange = (field: 'targetQuantity' | 'deadline', value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    setTimeout(() => {
      const errors = validateGroupBuy();
      setValidationErrors(prev => ({ 
        ...prev, 
        targetQuantity: errors.targetQuantity,
        deadline: errors.deadline
      }));
    }, 100);
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products?limit=100&sortBy=newest');
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Không thể tải danh sách sản phẩm');
    }
  };

  const handleProductSelect = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    setSelectedProduct(product);
    const price = parseFloat(product.price);
    
    setFormData(prev => ({
      ...prev,
      originalPrice: price.toString(),
      title: dealType === 'flash_sale' 
        ? `Flash Sale - ${product.name}`
        : `Gom Đơn - ${product.name}`,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProduct) {
      toast.error('Vui lòng chọn sản phẩm');
      return;
    }
    
    if (!formData.slug) {
      toast.error('Vui lòng nhập URL slug');
      return;
    }

    if (!validateForm()) {
      toast.error('Vui lòng kiểm tra lại thông tin nhập vào');
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch('/api/vendor/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: formData.slug,
          productId: selectedProduct.id,
          type: dealType,
          title: formData.title,
          description: formData.description || null,
          originalPrice: parseFloat(formData.originalPrice),
          salePrice: parseFloat(formData.salePrice),
          discountPercent: formData.discountPercent,
          startTime: dealType === 'flash_sale' ? formData.startTime : null,
          endTime: dealType === 'flash_sale' ? formData.endTime : null,
          targetQuantity: dealType === 'group_buy' ? parseInt(formData.targetQuantity) : null,
          deadline: dealType === 'group_buy' ? formData.deadline : null,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create deal');
      }

      toast.success('Deal đã được tạo thành công!', {
        description: 'Bạn có thể chia sẻ link trên Facebook ngay bây giờ',
        duration: 5000,
      });

      const shareableUrl = data.shareableUrl;
      await navigator.clipboard.writeText(shareableUrl);
      
      setTimeout(() => {
        router.push('/vendor/deals');
      }, 2000);
      
    } catch (error: any) {
      console.error('Error creating deal:', error);
      toast.error(error.message || 'Không thể tạo deal');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () => {
    if (!selectedProduct || !formData.slug) return false;
    if (Object.keys(validationErrors).some(key => validationErrors[key as keyof ValidationErrors])) return false;
    
    const original = parseFloat(formData.originalPrice);
    const sale = parseFloat(formData.salePrice);
    
    if (!original || !sale || sale <= 0 || sale >= original) return false;
    
    if (dealType === 'flash_sale') {
      if (!formData.startTime || !formData.endTime) return false;
      const start = new Date(formData.startTime);
      const end = new Date(formData.endTime);
      if (start >= end || end <= new Date()) return false;
    }
    
    if (dealType === 'group_buy') {
      const quantity = parseInt(formData.targetQuantity);
      if (!formData.targetQuantity || !formData.deadline) return false;
      if (quantity <= 0 || quantity > 10000) return false;
      if (new Date(formData.deadline) <= new Date()) return false;
    }
    
    return true;
  };

  const previewUrl = `${typeof window !== 'undefined' ? window.location.origin : 'https://nhangsach.net'}/deals/${formData.slug || '[slug]'}`;

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center gap-4">
        <Link href="/vendor/deals">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tạo Deal Mới</h1>
          <p className="text-gray-600 mt-1">Flash Sale hoặc Group Buy</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Chọn loại deal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => {
                  setDealType('flash_sale');
                  setValidationErrors({});
                  if (selectedProduct) {
                    setFormData(prev => ({
                      ...prev,
                      title: `Flash Sale - ${selectedProduct.name}`,
                    }));
                  }
                }}
                className={cn(
                  'p-6 border-2 rounded-lg text-left transition-all',
                  dealType === 'flash_sale'
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 hover:border-red-300'
                )}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Sparkles className="w-6 h-6 text-red-600" />
                  <h3 className="font-bold text-lg">Flash Sale</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Giảm giá trong thời gian giới hạn
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setDealType('group_buy');
                  setValidationErrors({});
                  if (selectedProduct) {
                    setFormData(prev => ({
                      ...prev,
                      title: `Gom Đơn - ${selectedProduct.name}`,
                    }));
                  }
                }}
                className={cn(
                  'p-6 border-2 rounded-lg text-left transition-all',
                  dealType === 'group_buy'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                )}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Users className="w-6 h-6 text-blue-600" />
                  <h3 className="font-bold text-lg">Group Buy</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Gom đơn đạt số lượng để có giá tốt
                </p>
              </button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Chọn sản phẩm</CardTitle>
            <CardDescription>Sản phẩm sẽ được áp dụng cho deal này</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Sản phẩm</Label>
              <select
                className="w-full mt-2 p-2 border rounded-lg"
                onChange={(e) => handleProductSelect(e.target.value)}
                value={selectedProduct?.id || ''}
                required
              >
                <option value="">-- Chọn sản phẩm --</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} - {parseFloat(product.price).toLocaleString('vi-VN')} ₫
                  </option>
                ))}
              </select>
            </div>

            {selectedProduct && (
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                {selectedProduct.image && (
                  <img
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                    className="w-20 h-20 rounded object-cover"
                  />
                )}
                <div>
                  <h3 className="font-semibold">{selectedProduct.name}</h3>
                  <p className="text-sm text-gray-600">
                    Giá hiện tại: {parseFloat(selectedProduct.price).toLocaleString('vi-VN')} ₫
                  </p>
                  <p className="text-sm text-gray-600">Tồn kho: {selectedProduct.stock}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Thông tin deal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Tiêu đề</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder={dealType === 'flash_sale' ? 'Flash Sale 50% - Tên sản phẩm' : 'Gom Đơn - Tên sản phẩm'}
                required
              />
            </div>

            <div>
              <Label>Mô tả (không bắt buộc)</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Mô tả ngắn gọn về deal"
                rows={3}
              />
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label>Giá gốc (₫)</Label>
                <Input
                  type="number"
                  value={formData.originalPrice}
                  onChange={(e) => handlePriceChange('originalPrice', e.target.value)}
                  onBlur={() => validatePrices()}
                  required
                />
              </div>
              <div>
                <Label>Giá khuyến mãi (₫)</Label>
                <Input
                  type="number"
                  value={formData.salePrice}
                  onChange={(e) => handlePriceChange('salePrice', e.target.value)}
                  onBlur={() => validatePrices()}
                  className={validationErrors.salePrice ? 'border-red-500' : ''}
                  required
                />
                {validationErrors.salePrice && (
                  <p className="text-red-600 text-sm mt-1">{validationErrors.salePrice}</p>
                )}
              </div>
              <div>
                <Label>Giảm giá (%)</Label>
                <Input
                  type="number"
                  value={formData.discountPercent}
                  readOnly
                  className="bg-gray-100"
                />
              </div>
            </div>

            {dealType === 'flash_sale' && (
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Thời gian bắt đầu</Label>
                  <Input
                    type="datetime-local"
                    value={formData.startTime}
                    onChange={(e) => handleFlashSaleTimeChange('startTime', e.target.value)}
                    onBlur={() => validateFlashSaleTimes()}
                    className={validationErrors.startTime ? 'border-red-500' : ''}
                    required
                  />
                  {validationErrors.startTime && (
                    <p className="text-red-600 text-sm mt-1">{validationErrors.startTime}</p>
                  )}
                </div>
                <div>
                  <Label>Thời gian kết thúc</Label>
                  <Input
                    type="datetime-local"
                    value={formData.endTime}
                    onChange={(e) => handleFlashSaleTimeChange('endTime', e.target.value)}
                    onBlur={() => validateFlashSaleTimes()}
                    className={validationErrors.endTime ? 'border-red-500' : ''}
                    required
                  />
                  {validationErrors.endTime && (
                    <p className="text-red-600 text-sm mt-1">{validationErrors.endTime}</p>
                  )}
                </div>
              </div>
            )}

            {dealType === 'group_buy' && (
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Số lượng mục tiêu</Label>
                  <Input
                    type="number"
                    value={formData.targetQuantity}
                    onChange={(e) => handleGroupBuyChange('targetQuantity', e.target.value)}
                    onBlur={() => validateGroupBuy()}
                    className={validationErrors.targetQuantity ? 'border-red-500' : ''}
                    placeholder="VD: 50"
                    required
                  />
                  {validationErrors.targetQuantity && (
                    <p className="text-red-600 text-sm mt-1">{validationErrors.targetQuantity}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">Số đơn hàng cần đạt để deal thành công</p>
                </div>
                <div>
                  <Label>Hạn chót</Label>
                  <Input
                    type="datetime-local"
                    value={formData.deadline}
                    onChange={(e) => handleGroupBuyChange('deadline', e.target.value)}
                    onBlur={() => validateGroupBuy()}
                    className={validationErrors.deadline ? 'border-red-500' : ''}
                    required
                  />
                  {validationErrors.deadline && (
                    <p className="text-red-600 text-sm mt-1">{validationErrors.deadline}</p>
                  )}
                </div>
              </div>
            )}

            {dealType === 'group_buy' && formData.targetQuantity && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-sm mb-2">Xem trước tiến độ:</h4>
                <div className="flex justify-between text-sm mb-2">
                  <span>0 / {formData.targetQuantity} người</span>
                  <span>0%</span>
                </div>
                <Progress value={0} className="h-3" />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>URL Slug</CardTitle>
            <CardDescription>Link chia sẻ cho deal của bạn</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Slug (tự động tạo từ tiêu đề)</Label>
              <Input
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: vietnameseToSlug(e.target.value) }))}
                placeholder="vd: flash-sale-giam-50"
                required
              />
            </div>

            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Link chia sẻ:</p>
                  <p className="font-mono text-sm text-orange-800 break-all">{previewUrl}</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={async () => {
                    await navigator.clipboard.writeText(previewUrl);
                    setCopiedLink(true);
                    toast.success('Đã sao chép link!');
                    setTimeout(() => setCopiedLink(false), 2000);
                  }}
                >
                  {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Link href="/vendor/deals" className="flex-1">
            <Button type="button" variant="outline" className="w-full">
              Hủy
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={loading || !isFormValid()}
            className="flex-1 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Đang tạo...' : 'Tạo Deal'}
          </Button>
        </div>
      </form>
    </div>
  );
}
