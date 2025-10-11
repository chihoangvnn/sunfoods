'use client'

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { mockVendorProducts, mockConsignmentRequests, mockVendor } from '@/data/mockVendorData';
import { VendorProduct, PaymentModel } from '@/types/vendor';
import { Package, Plus, Search, Grid3x3, List, AlertTriangle, RotateCcw, Edit, Calendar, DollarSign, TrendingUp, Upload, Trash2, Download, PowerOff } from 'lucide-react';
import { toast } from 'sonner';
import { BulkUploadModal } from '@/components/BulkUploadModal';
import { Checkbox } from '@/components/ui/checkbox';
import { BulkPriceModal } from '@/components/BulkPriceModal';
import { BulkStatusModal } from '@/components/BulkStatusModal';
import * as XLSX from 'xlsx';

type ViewMode = 'grid' | 'list';
type StatusFilter = 'all' | 'active' | 'out_of_stock' | 'expired' | 'pending_approval';

export default function VendorProducts() {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showBulkPriceModal, setShowBulkPriceModal] = useState(false);
  const [showBulkStatusModal, setShowBulkStatusModal] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [products, setProducts] = useState<VendorProduct[]>(mockVendorProducts);
  const [formData, setFormData] = useState({
    productName: '',
    quantity: '',
    proposedPrice: '',
    discountPercent: '',
    revenueShareVendor: '70',
    revenueShareShop: '30',
    notes: '',
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      active: { label: 'Đang bán', color: 'bg-green-100 text-green-700 border-green-200' },
      out_of_stock: { label: 'Hết hàng', color: 'bg-red-100 text-red-700 border-red-200' },
      expired: { label: 'Hết hạn', color: 'bg-gray-100 text-gray-700 border-gray-200' },
      pending_approval: { label: 'Chờ duyệt', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || { label: status, color: 'bg-gray-100 text-gray-700 border-gray-200' };
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusInfo.color}`}>
        {statusInfo.label}
      </span>
    );
  };

  const getPaymentModelBorderColor = (model: PaymentModel) => {
    switch (model) {
      case 'deposit':
        return 'border-l-4 border-l-orange-500';
      case 'monthly':
        return 'border-l-4 border-l-blue-500';
      case 'upfront':
        return 'border-l-4 border-l-purple-500';
      case 'revenue_share':
        return 'border-l-4 border-l-green-500';
      default:
        return '';
    }
  };

  const renderPricing = (product: VendorProduct, model: PaymentModel) => {
    switch (model) {
      case 'deposit':
      case 'monthly':
        return (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Giá ký gửi:</span>
              <span className="font-medium text-gray-900">
                {product.consignmentPrice ? formatCurrency(product.consignmentPrice) : 'N/A'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Chiết khấu:</span>
              <span className="font-medium text-orange-600">{product.discountPercent}%</span>
            </div>
            {product.consignmentPrice && product.discountPercent && (
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <span className="text-xs text-gray-500">Giá bán lẻ:</span>
                <span className="text-sm font-semibold text-gray-700">
                  {formatCurrency(product.consignmentPrice / (1 - product.discountPercent / 100))}
                </span>
              </div>
            )}
          </div>
        );
      
      case 'upfront':
        return (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Giá bán buôn:</span>
              <span className="font-medium text-purple-600">
                {product.wholesalePrice ? formatCurrency(product.wholesalePrice) : 'N/A'}
              </span>
            </div>
            {product.shopMarkup && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Markup shop:</span>
                <span className="text-xs text-gray-500">{product.shopMarkup}%</span>
              </div>
            )}
            <div className="pt-2">
              <Badge variant="outline" className="text-xs border-purple-300 text-purple-700">
                Đã bán cho shop
              </Badge>
            </div>
            <p className="text-xs text-gray-500 italic pt-1">
              Shop đã mua đứt. Bạn không quản lý giá bán lẻ.
            </p>
          </div>
        );
      
      case 'revenue_share':
        return (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Giá bán lẻ:</span>
              <span className="font-medium text-gray-900">
                {product.suggestedRetailPrice ? formatCurrency(product.suggestedRetailPrice) : 'N/A'}
              </span>
            </div>
            <div className="flex gap-1 mt-2">
              <Badge className="bg-green-600 text-white text-xs">
                Bạn: {product.revenueShareVendor}%
              </Badge>
              <Badge className="bg-orange-600 text-white text-xs">
                Shop: {product.revenueShareShop}%
              </Badge>
            </div>
            {product.suggestedRetailPrice && product.revenueShareVendor && (
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <span className="text-xs text-gray-500">Bạn nhận:</span>
                <span className="text-sm font-semibold text-green-600">
                  {formatCurrency(product.suggestedRetailPrice * product.revenueShareVendor / 100)}
                </span>
              </div>
            )}
            <p className="text-xs text-gray-500 italic pt-1">
              Giá cuối cùng do shop quyết định dựa trên thị trường.
            </p>
          </div>
        );
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.productId.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [products, searchQuery, statusFilter]);

  const stats = useMemo(() => {
    const totalProducts = products.length;
    const needsRestock = products.filter(p => p.quantity < 5 && p.quantity > 0 && p.status === 'active').length;
    const pendingApproval = mockConsignmentRequests.filter(r => r.status === 'pending').length;
    
    let totalValue = 0;
    let secondaryLabel = '';
    let secondaryValue = 0;
    
    switch (mockVendor.paymentModel) {
      case 'deposit':
      case 'monthly':
        totalValue = products.reduce((sum, p) => {
          return sum + (p.quantity * (p.consignmentPrice || 0));
        }, 0);
        secondaryLabel = 'Giá trị tồn kho (ký gửi)';
        break;
      
      case 'upfront':
        totalValue = products.reduce((sum, p) => {
          return sum + (p.quantity * (p.wholesalePrice || 0));
        }, 0);
        secondaryLabel = 'Đã bán cho shop';
        break;
      
      case 'revenue_share':
        totalValue = products.reduce((sum, p) => {
          const retailValue = p.suggestedRetailPrice || 0;
          const vendorShare = p.revenueShareVendor || 70;
          return sum + (p.quantity * retailValue * vendorShare / 100);
        }, 0);
        secondaryLabel = 'Doanh thu tiềm năng';
        secondaryValue = products.reduce((sum, p) => {
          return sum + (p.quantity * (p.suggestedRetailPrice || 0));
        }, 0);
        break;
    }
    
    return { totalProducts, totalValue, secondaryLabel, secondaryValue, needsRestock, pendingApproval };
  }, [products]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting request:', formData);
    setIsModalOpen(false);
    setFormData({
      productName: '',
      quantity: '',
      proposedPrice: '',
      discountPercent: '',
      revenueShareVendor: '70',
      revenueShareShop: '30',
      notes: '',
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map(p => p.id));
    }
  };

  const handleSelectProduct = (productId: string) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleBulkPriceUpdate = (updateType: 'set' | 'increase' | 'decrease', value: number) => {
    setProducts(prev => prev.map(product => {
      if (!selectedProducts.includes(product.id)) return product;
      
      let newPrice = product.consignmentPrice || 0;
      
      if (updateType === 'set') {
        newPrice = value;
      } else if (updateType === 'increase') {
        newPrice = (product.consignmentPrice || 0) * (1 + value / 100);
      } else if (updateType === 'decrease') {
        newPrice = (product.consignmentPrice || 0) * (1 - value / 100);
      }
      
      return {
        ...product,
        consignmentPrice: Math.round(newPrice),
        suggestedRetailPrice: Math.round(newPrice * 1.2)
      };
    }));
    
    toast.success(`Đã cập nhật giá cho ${selectedProducts.length} sản phẩm`);
    setSelectedProducts([]);
  };

  const handleBulkStatusChange = (targetStatus: 'active' | 'out_of_stock') => {
    setProducts(prev => prev.map(product => {
      if (!selectedProducts.includes(product.id)) return product;
      
      return {
        ...product,
        status: targetStatus
      };
    }));
    
    const statusText = targetStatus === 'active' ? 'Hoạt động' : 'Hết hàng';
    toast.success(`Đã đặt ${selectedProducts.length} sản phẩm sang trạng thái: ${statusText}`);
    setSelectedProducts([]);
  };

  const handleBulkExport = () => {
    const selectedData = products
      .filter(p => selectedProducts.includes(p.id))
      .map(p => ({
        'Tên sản phẩm': p.productId,
        'Số lượng': p.quantity,
        'Giá ký gửi': p.consignmentPrice || 0,
        'Chiết khấu (%)': p.discountPercent || 0,
        'Trạng thái': p.status === 'active' ? 'Hoạt động' : 'Tạm dừng',
        'Ngày hết hạn': p.expiryDate ? new Date(p.expiryDate).toISOString().split('T')[0] : ''
      }));
    
    const worksheet = XLSX.utils.json_to_sheet(selectedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sản phẩm');
    XLSX.writeFile(workbook, `san_pham_${new Date().toISOString().split('T')[0]}.xlsx`);
    
    toast.success(`Đã xuất ${selectedProducts.length} sản phẩm ra Excel`);
    setSelectedProducts([]);
  };

  const handleBulkDelete = () => {
    if (confirm(`Bạn có chắc muốn xóa ${selectedProducts.length} sản phẩm?`)) {
      setProducts(prev => prev.filter(p => !selectedProducts.includes(p.id)));
      toast.success(`Đã xóa ${selectedProducts.length} sản phẩm`);
      setSelectedProducts([]);
    }
  };

  const getModalContent = () => {
    switch (mockVendor.paymentModel) {
      case 'deposit':
      case 'monthly':
        return {
          title: 'Gửi yêu cầu ký gửi mới',
          description: 'Điền thông tin sản phẩm bạn muốn ký gửi tại cửa hàng',
          priceLabel: 'Giá ký gửi (VND)',
          note: mockVendor.paymentModel === 'deposit' 
            ? 'COD sẽ tự động được trừ từ số dư ký quỹ của bạn.' 
            : 'Thanh toán vào ngày 5 hàng tháng.',
        };
      
      case 'upfront':
        return {
          title: 'Gửi yêu cầu mua thêm hàng',
          description: 'Đề xuất sản phẩm để shop mua đứt',
          priceLabel: 'Giá bán buôn (VND)',
          note: 'Shop sẽ mua đứt và thanh toán ngay khi nhận hàng.',
        };
      
      case 'revenue_share':
        return {
          title: 'Gửi sản phẩm chia doanh thu',
          description: 'Ký gửi sản phẩm với mô hình chia doanh thu',
          priceLabel: 'Giá bán lẻ đề xuất (VND)',
          note: 'Hàng không bán được sẽ được hoàn trả sau 90 ngày.',
        };
    }
  };

  const modalContent = getModalContent();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sản phẩm của bạn</h1>
          <p className="text-gray-600 mt-1">
            Quản lý sản phẩm - Mô hình: <span className="font-semibold capitalize">{mockVendor.paymentModel.replace('_', ' ')}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setShowUploadModal(true)}
            className="gap-2 bg-green-600 hover:bg-green-700 text-white"
          >
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Nhập hàng loạt (Excel)</span>
            <span className="sm:hidden">Excel</span>
          </Button>
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Gửi yêu cầu mới</span>
            <span className="sm:hidden">Thêm mới</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tổng sản phẩm</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalProducts}</p>
            </div>
            <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Package className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{stats.secondaryLabel}</p>
              <p className="text-xl font-bold text-gray-900 mt-1">{formatCurrency(stats.totalValue)}</p>
              {stats.secondaryValue > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  Tổng: {formatCurrency(stats.secondaryValue)}
                </p>
              )}
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Cần nhập thêm</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.needsRestock}</p>
            </div>
            <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Chờ duyệt</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.pendingApproval}</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center gap-3">
            <Checkbox
              checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
              onCheckedChange={handleSelectAll}
            />
            <span className="text-sm text-gray-600">Chọn tất cả</span>
          </div>

          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Tìm kiếm sản phẩm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Lọc theo trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="active">Đang bán</SelectItem>
              <SelectItem value="out_of_stock">Hết hàng</SelectItem>
              <SelectItem value="expired">Hết hạn</SelectItem>
              <SelectItem value="pending_approval">Chờ duyệt</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('grid')}
              className={viewMode === 'grid' ? 'bg-orange-600 hover:bg-orange-700' : ''}
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('list')}
              className={viewMode === 'list' ? 'bg-orange-600 hover:bg-orange-700' : ''}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      <div className={viewMode === 'grid' 
        ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
        : 'grid grid-cols-1 gap-4'
      }>
        {filteredProducts.map((product) => (
          <Card 
            key={product.id} 
            className={`p-4 hover:shadow-md transition-shadow ${getPaymentModelBorderColor(mockVendor.paymentModel)}`}
          >
            <div className={viewMode === 'grid' ? 'space-y-3' : 'flex gap-4'}>
              <div className={viewMode === 'grid' 
                ? 'h-32 w-full bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg flex items-center justify-center'
                : 'h-24 w-24 flex-shrink-0 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg flex items-center justify-center'
              }>
                <Package className="h-12 w-12 text-orange-600" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedProducts.includes(product.id)}
                      onCheckedChange={() => handleSelectProduct(product.id)}
                    />
                    <h3 className="font-semibold text-gray-900">{product.productId}</h3>
                  </div>
                  {getStatusBadge(product.status)}
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Số lượng:</span>
                    <span className={`font-medium ${product.quantity < 5 && product.quantity > 0 ? 'text-yellow-600 flex items-center gap-1' : 'text-gray-900'}`}>
                      {product.quantity < 5 && product.quantity > 0 && (
                        <AlertTriangle className="h-3 w-3" />
                      )}
                      {product.quantity}
                    </span>
                  </div>
                  
                  {renderPricing(product, mockVendor.paymentModel)}
                  
                  {product.expiryDate && (
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <span className="text-sm text-gray-600 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Hạn dùng:
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {new Date(product.expiryDate).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Cập nhật
                  </Button>
                  {mockVendor.paymentModel !== 'upfront' && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs"
                    >
                      <RotateCcw className="h-3 w-3 mr-1" />
                      Hoàn hàng
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <Card className="p-12">
          <div className="text-center">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Không tìm thấy sản phẩm</h3>
            <p className="text-gray-600">Thử thay đổi bộ lọc hoặc tìm kiếm khác</p>
          </div>
        </Card>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{modalContent.title}</DialogTitle>
            <DialogDescription>
              {modalContent.description}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="productName">Tên sản phẩm *</Label>
              <Input
                id="productName"
                placeholder="Nhập tên sản phẩm"
                value={formData.productName}
                onChange={(e) => handleInputChange('productName', e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Số lượng *</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  placeholder="0"
                  value={formData.quantity}
                  onChange={(e) => handleInputChange('quantity', e.target.value)}
                  required
                />
              </div>

              {(mockVendor.paymentModel === 'deposit' || mockVendor.paymentModel === 'monthly') && (
                <div className="space-y-2">
                  <Label htmlFor="discountPercent">Chiết khấu (%) *</Label>
                  <Input
                    id="discountPercent"
                    type="number"
                    min="0"
                    max="100"
                    placeholder="0"
                    value={formData.discountPercent}
                    onChange={(e) => handleInputChange('discountPercent', e.target.value)}
                    required
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="proposedPrice">{modalContent.priceLabel} *</Label>
              <Input
                id="proposedPrice"
                type="number"
                min="0"
                placeholder="0"
                value={formData.proposedPrice}
                onChange={(e) => handleInputChange('proposedPrice', e.target.value)}
                required
              />
            </div>

            {mockVendor.paymentModel === 'revenue_share' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="revenueShareVendor">Bạn nhận (%)</Label>
                  <Input
                    id="revenueShareVendor"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.revenueShareVendor}
                    onChange={(e) => {
                      const vendorShare = parseInt(e.target.value) || 0;
                      handleInputChange('revenueShareVendor', e.target.value);
                      handleInputChange('revenueShareShop', (100 - vendorShare).toString());
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="revenueShareShop">Shop nhận (%)</Label>
                  <Input
                    id="revenueShareShop"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.revenueShareShop}
                    disabled
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes">Ghi chú</Label>
              <Textarea
                id="notes"
                placeholder="Mô tả chi tiết về sản phẩm..."
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={4}
              />
            </div>

            {modalContent.note && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>Lưu ý:</strong> {modalContent.note}
                </p>
              </div>
            )}

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                Gửi yêu cầu
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <BulkUploadModal 
        open={showUploadModal} 
        onClose={() => setShowUploadModal(false)}
        onImportSuccess={(products) => {
          setProducts(prev => [...prev, ...products]);
          toast.success(`Đã nhập ${products.length} sản phẩm thành công`);
        }}
      />

      <BulkPriceModal
        open={showBulkPriceModal}
        onClose={() => setShowBulkPriceModal(false)}
        selectedCount={selectedProducts.length}
        onUpdate={handleBulkPriceUpdate}
      />

      <BulkStatusModal
        open={showBulkStatusModal}
        onClose={() => setShowBulkStatusModal(false)}
        selectedCount={selectedProducts.length}
        onUpdate={handleBulkStatusChange}
      />

      {selectedProducts.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white border shadow-lg rounded-lg p-4 flex flex-col sm:flex-row items-center gap-4 z-50 max-w-4xl w-full mx-4">
          <span className="text-sm font-medium">
            Đã chọn {selectedProducts.length} sản phẩm
          </span>
          
          <div className="flex flex-wrap gap-2 justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowBulkPriceModal(true)}
              className="gap-2"
            >
              <Edit className="w-4 h-4" />
              Cập nhật giá
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowBulkStatusModal(true)}
              className="gap-2"
            >
              <PowerOff className="w-4 h-4" />
              Thay đổi trạng thái
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkExport}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Xuất Excel
            </Button>
            
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
              className="gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Xóa
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedProducts([])}
            >
              Hủy
            </Button>
          </div>
        </div>
      )}
      
      {/* TODO Backend:
        - Product pricing varies by vendor's payment model
        - API should return appropriate price fields based on vendor.paymentModel
        - Validate pricing rules per model (e.g., wholesale < retail, revenue shares = 100%)
      */}
    </div>
  );
}
