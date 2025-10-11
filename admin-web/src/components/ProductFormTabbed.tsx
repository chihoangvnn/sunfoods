import { useState, useEffect, useRef, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { X, Save, Wand2, Loader2, QrCode, Tag, Info, Package, TrendingUp, Search, Bot, Calendar } from "lucide-react";
import { ImageUploader } from "./ImageUploader";
import { QRScanner } from "./QRScanner";
import { FAQManagement } from "./FAQManagement";
import type { 
  CloudinaryImage
} from "@shared/schema";

// Types
interface Industry {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
}

interface Tag {
  id: string;
  name: string;
  slug: string;
  category: string;
  color: string;
  platforms?: string[];
  icon?: string;
  description?: string;
}

interface Product {
  id: string;
  name: string;
  description?: string;
  sku?: string;
  itemCode?: string;
  price: string;
  stock: number;
  categoryId?: string;
  status: "active" | "inactive" | "out-of-stock";
  image?: string;
  images?: CloudinaryImage[];
  seoTitle?: string;
  seoDescription?: string;
  slug?: string;
  productStory?: any;
  ogImageUrl?: string;
  unitType?: "weight" | "count" | "volume";
  unit?: string;
  originalPrice?: string;
  fakeSalesCount?: number;
  isNew?: boolean;
  isTopseller?: boolean;
  isFreeshipping?: boolean;
  isBestseller?: boolean;
  tagIds?: string[];
  smartFaq?: any;
  createdAt?: string;
  updatedAt?: string;
}

interface Category {
  id: string;
  name: string;
  description?: string;
  industryId: string;
  isActive: boolean;
  sortOrder: number;
}

interface ProductFormProps {
  product?: Product | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ProductFormTabbed({ product, onClose, onSuccess }: ProductFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = Boolean(product);
  
  // Tab state
  const [activeTab, setActiveTab] = useState<'basic' | 'media' | 'info' | 'marketing' | 'seo' | 'ai'>('basic');
  
  // Form data state
  const [formData, setFormData] = useState({
    // Core fields
    name: "",
    description: "",
    price: "",
    stock: "0",
    categoryId: "",
    status: "active" as "active" | "inactive" | "out-of-stock",
    
    // Media
    image: "",
    images: [] as CloudinaryImage[],
    
    // Product Info
    sku: "",
    itemCode: "",
    slug: "",
    unitType: "count" as "weight" | "count" | "volume",
    unit: "cái",
    
    // Marketing
    originalPrice: "",
    fakeSalesCount: 0,
    isNew: false,
    isTopseller: false,
    isFreeshipping: false,
    isBestseller: false,
    
    // SEO
    seoTitle: "",
    seoDescription: "",
    ogImageUrl: "",
    tagIds: [] as string[],
    productStory: "",
    
    // AI
    smartFaq: null as any,
    
    // Helper field (not in DB)
    industryId: "",
  });
  
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  
  // Fetch industries and categories
  const { data: industries = [] } = useQuery<Industry[]>({
    queryKey: ['/api/industries'],
    queryFn: async () => {
      const response = await fetch('/api/industries');
      if (!response.ok) throw new Error('Failed to fetch industries');
      return response.json();
    },
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
    queryFn: async () => {
      const response = await fetch('/api/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      return response.json();
    },
  });

  // Fetch tags for tag selector
  const { data: tags = [] } = useQuery<Tag[]>({
    queryKey: ['/api/tags'],
    queryFn: async () => {
      const response = await fetch('/api/tags');
      if (!response.ok) throw new Error('Failed to fetch tags');
      return response.json();
    },
  });

  // Load product data if editing
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description || "",
        price: product.price,
        stock: product.stock.toString(),
        categoryId: product.categoryId || "",
        status: product.status,
        
        image: product.image || "",
        images: product.images || [],
        
        sku: product.sku || "",
        itemCode: product.itemCode || "",
        slug: product.slug || "",
        unitType: product.unitType || "count",
        unit: product.unit || "cái",
        
        originalPrice: product.originalPrice || "",
        fakeSalesCount: product.fakeSalesCount || 0,
        isNew: product.isNew || false,
        isTopseller: product.isTopseller || false,
        isFreeshipping: product.isFreeshipping || false,
        isBestseller: product.isBestseller || false,
        
        seoTitle: product.seoTitle || "",
        seoDescription: product.seoDescription || "",
        ogImageUrl: product.ogImageUrl || "",
        tagIds: product.tagIds || [],
        productStory: typeof product.productStory === 'string' ? product.productStory : JSON.stringify(product.productStory || {}),
        
        smartFaq: product.smartFaq || null,
        
        industryId: "",
      });
    }
  }, [product]);

  // Auto-select industry when editing
  useEffect(() => {
    if (product && product.categoryId && categories.length > 0 && !formData.industryId) {
      const category = categories.find(c => c.id === product.categoryId);
      if (category) {
        setFormData(prev => ({ ...prev, industryId: category.industryId }));
      }
    }
  }, [product, categories, formData.industryId]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const url = isEditing ? `/api/products/${product?.id}` : '/api/products';
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save product');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: `Sản phẩm đã được ${isEditing ? 'cập nhật' : 'thêm'}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      if (product?.id) {
        queryClient.invalidateQueries({ queryKey: ['/api/products', product.id] });
      }
      onSuccess?.();
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

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Lỗi",
        description: "Tên sản phẩm không được để trống",
        variant: "destructive",
      });
      return;
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast({
        title: "Lỗi",
        description: "Giá sản phẩm phải lớn hơn 0",
        variant: "destructive",
      });
      return;
    }
    
    let parsedProductStory = undefined;
    if (formData.productStory) {
      if (typeof formData.productStory === 'string') {
        try {
          parsedProductStory = JSON.parse(formData.productStory);
        } catch (err) {
          toast({
            title: "Lỗi",
            description: "Product Story phải là JSON hợp lệ",
            variant: "destructive",
          });
          return;
        }
      } else {
        parsedProductStory = formData.productStory;
      }
    }
    
    const dataToSave = {
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      price: formData.price,
      stock: parseInt(formData.stock) || 0,
      categoryId: formData.categoryId || undefined,
      status: formData.status,
      
      image: formData.image || undefined,
      images: formData.images || [],
      
      sku: formData.sku || undefined,
      itemCode: formData.itemCode || undefined,
      slug: formData.slug || undefined,
      unitType: formData.unitType,
      unit: formData.unit,
      
      originalPrice: formData.originalPrice || undefined,
      fakeSalesCount: formData.fakeSalesCount || 0,
      isNew: formData.isNew,
      isTopseller: formData.isTopseller,
      isFreeshipping: formData.isFreeshipping,
      isBestseller: formData.isBestseller,
      
      seoTitle: formData.seoTitle || undefined,
      seoDescription: formData.seoDescription || undefined,
      ogImageUrl: formData.ogImageUrl || undefined,
      tagIds: formData.tagIds || [],
      productStory: parsedProductStory,
      
      smartFaq: formData.smartFaq || undefined,
    };
    
    saveMutation.mutate(dataToSave);
  };

  // QR Scanner handler
  const handleQRScan = (result: string) => {
    setFormData(prev => ({ ...prev, itemCode: result }));
    setIsQRScannerOpen(false);
    toast({
      title: "Quét thành công",
      description: `Mã sản phẩm: ${result}`,
    });
  };

  // Filter categories based on selected industry
  const filteredCategories = categories.filter(category => {
    const industryMatch = formData.industryId ? category.industryId === formData.industryId : true;
    return category.isActive && industryMatch;
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="w-full max-w-4xl mx-auto py-8">
        
        {/* Main Form Card */}
        <Card className="w-full">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold">
                {isEditing ? '📝 Sửa sản phẩm' : '➕ Thêm sản phẩm'}
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Tab Navigation */}
            <div className="flex space-x-1 border-b mt-4 overflow-x-auto">
              <TabButton
                active={activeTab === 'basic'}
                onClick={() => setActiveTab('basic')}
                icon={<Info className="h-4 w-4" />}
                label="Cơ bản"
              />
              <TabButton
                active={activeTab === 'media'}
                onClick={() => setActiveTab('media')}
                icon={<Package className="h-4 w-4" />}
                label="Media"
              />
              <TabButton
                active={activeTab === 'info'}
                onClick={() => setActiveTab('info')}
                icon={<Package className="h-4 w-4" />}
                label="Thông tin SP"
              />
              <TabButton
                active={activeTab === 'marketing'}
                onClick={() => setActiveTab('marketing')}
                icon={<TrendingUp className="h-4 w-4" />}
                label="Marketing"
              />
              <TabButton
                active={activeTab === 'seo'}
                onClick={() => setActiveTab('seo')}
                icon={<Search className="h-4 w-4" />}
                label="SEO"
              />
              <TabButton
                active={activeTab === 'ai'}
                onClick={() => setActiveTab('ai')}
                icon={<Bot className="h-4 w-4" />}
                label="AI FAQ"
              />
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Tab Content */}
              {activeTab === 'basic' && (
                <BasicInfoTab 
                  formData={formData}
                  setFormData={setFormData}
                  industries={industries}
                  categories={filteredCategories}
                  product={product}
                />
              )}
              
              {activeTab === 'media' && (
                <MediaTab 
                  formData={formData}
                  setFormData={setFormData}
                />
              )}
              
              {activeTab === 'info' && (
                <ProductInfoTab 
                  formData={formData}
                  setFormData={setFormData}
                  isQRScannerOpen={isQRScannerOpen}
                  setIsQRScannerOpen={setIsQRScannerOpen}
                />
              )}
              
              {activeTab === 'marketing' && (
                <MarketingTab 
                  formData={formData}
                  setFormData={setFormData}
                />
              )}
              
              {activeTab === 'seo' && (
                <SEOTab 
                  formData={formData}
                  setFormData={setFormData}
                  tags={tags}
                />
              )}
              
              {activeTab === 'ai' && (
                <AIFAQTab 
                  formData={formData}
                  setFormData={setFormData}
                />
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                >
                  ❌ Hủy
                </Button>
                <Button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="flex-1"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saveMutation.isPending 
                    ? 'Đang lưu...' 
                    : (isEditing ? '✅ Cập nhật' : '✅ Thêm sản phẩm')
                  }
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* QR Scanner Modal */}
        <QRScanner
          isOpen={isQRScannerOpen}
          onClose={() => setIsQRScannerOpen(false)}
          onScan={handleQRScan}
        />
      </div>
    </div>
  );
}

// Tab Button Component
function TabButton({ active, onClick, icon, label }: any) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
        active
          ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-700'
          : 'text-gray-500 hover:text-gray-700'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

// Basic Info Tab
function BasicInfoTab({ formData, setFormData, industries, categories, product }: any) {
  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 mb-4">
        Thông tin cơ bản của sản phẩm
      </div>
      
      {/* Name */}
      <div>
        <Label htmlFor="name">Tên sản phẩm *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData((prev: any) => ({ ...prev, name: e.target.value }))}
          placeholder="Nhập tên sản phẩm"
          required
        />
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="description">Mô tả</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData((prev: any) => ({ ...prev, description: e.target.value }))}
          placeholder="Mô tả sản phẩm"
          rows={4}
        />
      </div>

      {/* Price & Stock */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="price">Giá *</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData((prev: any) => ({ ...prev, price: e.target.value }))}
            placeholder="0.00"
            required
          />
        </div>
        <div>
          <Label htmlFor="stock">Tồn kho *</Label>
          <Input
            id="stock"
            type="number"
            value={formData.stock}
            onChange={(e) => setFormData((prev: any) => ({ ...prev, stock: e.target.value }))}
            placeholder="0"
            required
          />
        </div>
      </div>

      {/* Industry & Category */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="industryId">Ngành hàng</Label>
          <Select
            value={formData.industryId}
            onValueChange={(value) => {
              setFormData((prev: any) => ({ ...prev, industryId: value, categoryId: "" }));
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn ngành hàng" />
            </SelectTrigger>
            <SelectContent>
              {industries.map((industry: Industry) => (
                <SelectItem key={industry.id} value={industry.id}>
                  {industry.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="categoryId">Danh mục</Label>
          <Select
            value={formData.categoryId}
            onValueChange={(value) => setFormData((prev: any) => ({ ...prev, categoryId: value }))}
            disabled={!formData.industryId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn danh mục" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category: any) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Status */}
      <div>
        <Label htmlFor="status">Trạng thái</Label>
        <Select
          value={formData.status}
          onValueChange={(value) => setFormData((prev: any) => ({ ...prev, status: value }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Kích hoạt</SelectItem>
            <SelectItem value="inactive">Tạm dừng</SelectItem>
            <SelectItem value="out-of-stock">Hết hàng</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Timestamps (Read-only) */}
      {product && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
          <div>
            <Label className="flex items-center gap-2 text-gray-600">
              <Calendar className="h-4 w-4" />
              Ngày tạo
            </Label>
            <Input
              value={product.createdAt ? new Date(product.createdAt).toLocaleString('vi-VN') : 'N/A'}
              disabled
              className="bg-gray-50"
            />
          </div>
          <div>
            <Label className="flex items-center gap-2 text-gray-600">
              <Calendar className="h-4 w-4" />
              Cập nhật lần cuối
            </Label>
            <Input
              value={product.updatedAt ? new Date(product.updatedAt).toLocaleString('vi-VN') : 'N/A'}
              disabled
              className="bg-gray-50"
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Media Tab
function MediaTab({ formData, setFormData }: any) {
  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 mb-4">
        Hình ảnh và media sản phẩm
      </div>
      
      {/* Legacy Image Field */}
      <div>
        <Label htmlFor="image">URL Hình ảnh (Legacy)</Label>
        <Input
          id="image"
          value={formData.image}
          onChange={(e) => setFormData((prev: any) => ({ ...prev, image: e.target.value }))}
          placeholder="https://example.com/image.jpg"
        />
      </div>

      {/* Image Uploader */}
      <div>
        <Label>Hình ảnh sản phẩm (Cloudinary)</Label>
        <ImageUploader
          images={formData.images}
          onImagesChange={(images) => setFormData((prev: any) => ({ ...prev, images }))}
          maxImages={10}
        />
      </div>
    </div>
  );
}

// Product Info Tab
function ProductInfoTab({ formData, setFormData, isQRScannerOpen, setIsQRScannerOpen }: any) {
  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 mb-4">
        Thông tin chi tiết sản phẩm
      </div>
      
      {/* SKU */}
      <div>
        <Label htmlFor="sku">Mã SKU</Label>
        <Input
          id="sku"
          value={formData.sku}
          onChange={(e) => setFormData((prev: any) => ({ ...prev, sku: e.target.value }))}
          placeholder="Auto-generated hoặc nhập thủ công"
        />
      </div>

      {/* Item Code with QR Scanner */}
      <div>
        <Label htmlFor="itemCode">Mã sản phẩm (Item Code)</Label>
        <div className="flex gap-2">
          <Input
            id="itemCode"
            value={formData.itemCode}
            onChange={(e) => setFormData((prev: any) => ({ ...prev, itemCode: e.target.value }))}
            placeholder="Nhập mã sản phẩm hoặc quét QR"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsQRScannerOpen(true)}
            className="px-3"
          >
            <QrCode className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Slug */}
      <div>
        <Label htmlFor="slug">Slug URL</Label>
        <Input
          id="slug"
          value={formData.slug}
          onChange={(e) => setFormData((prev: any) => ({ ...prev, slug: e.target.value }))}
          placeholder="url-thân-thiện-cho-sản-phẩm"
        />
      </div>

      {/* Unit Type & Unit */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="unitType">Loại đơn vị</Label>
          <Select
            value={formData.unitType}
            onValueChange={(value) => setFormData((prev: any) => ({ ...prev, unitType: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="count">Đếm (cái, chiếc, hộp...)</SelectItem>
              <SelectItem value="weight">Cân nặng (kg, g...)</SelectItem>
              <SelectItem value="volume">Thể tích (lít, ml...)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="unit">Đơn vị</Label>
          <Select
            value={formData.unit}
            onValueChange={(value) => setFormData((prev: any) => ({ ...prev, unit: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {formData.unitType === 'count' && (
                <>
                  <SelectItem value="cái">Cái</SelectItem>
                  <SelectItem value="chiếc">Chiếc</SelectItem>
                  <SelectItem value="hộp">Hộp</SelectItem>
                  <SelectItem value="bộ">Bộ</SelectItem>
                </>
              )}
              {formData.unitType === 'weight' && (
                <>
                  <SelectItem value="kg">Kilogram (kg)</SelectItem>
                  <SelectItem value="g">Gram (g)</SelectItem>
                  <SelectItem value="lạng">Lạng</SelectItem>
                </>
              )}
              {formData.unitType === 'volume' && (
                <>
                  <SelectItem value="lít">Lít</SelectItem>
                  <SelectItem value="ml">Mililít (ml)</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

// Marketing Tab
function MarketingTab({ formData, setFormData }: any) {
  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 mb-4">
        Cấu hình marketing và badges sản phẩm
      </div>
      
      {/* Original Price & Fake Sales Count */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="originalPrice">Giá gốc (để tính discount)</Label>
          <Input
            id="originalPrice"
            type="number"
            step="0.01"
            value={formData.originalPrice}
            onChange={(e) => setFormData((prev: any) => ({ ...prev, originalPrice: e.target.value }))}
            placeholder="0.00"
          />
        </div>
        <div>
          <Label htmlFor="fakeSalesCount">Số lượt bán giả (cho marketing)</Label>
          <Input
            id="fakeSalesCount"
            type="number"
            value={formData.fakeSalesCount}
            onChange={(e) => setFormData((prev: any) => ({ ...prev, fakeSalesCount: parseInt(e.target.value) || 0 }))}
            placeholder="0"
          />
        </div>
      </div>

      {/* Marketing Badges */}
      <div className="space-y-3 pt-4 border-t">
        <h4 className="font-medium text-gray-900">Marketing Badges</h4>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="isNew" className="cursor-pointer">
            🆕 Sản phẩm mới
          </Label>
          <Switch
            id="isNew"
            checked={formData.isNew}
            onCheckedChange={(checked) => setFormData((prev: any) => ({ ...prev, isNew: checked }))}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="isBestseller" className="cursor-pointer">
            🏆 Bestseller
          </Label>
          <Switch
            id="isBestseller"
            checked={formData.isBestseller}
            onCheckedChange={(checked) => setFormData((prev: any) => ({ ...prev, isBestseller: checked }))}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="isTopseller" className="cursor-pointer">
            ⭐ Topseller
          </Label>
          <Switch
            id="isTopseller"
            checked={formData.isTopseller}
            onCheckedChange={(checked) => setFormData((prev: any) => ({ ...prev, isTopseller: checked }))}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="isFreeshipping" className="cursor-pointer">
            🚚 Miễn phí vận chuyển
          </Label>
          <Switch
            id="isFreeshipping"
            checked={formData.isFreeshipping}
            onCheckedChange={(checked) => setFormData((prev: any) => ({ ...prev, isFreeshipping: checked }))}
          />
        </div>
      </div>
    </div>
  );
}

// SEO Tab
function SEOTab({ formData, setFormData, tags }: any) {
  // Toggle tag selection
  const toggleTag = (tagId: string) => {
    const currentTags = formData.tagIds || [];
    const newTags = currentTags.includes(tagId)
      ? currentTags.filter((id: string) => id !== tagId)
      : [...currentTags, tagId];
    setFormData((prev: any) => ({ ...prev, tagIds: newTags }));
  };

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 mb-4">
        Tối ưu hóa SEO và marketing cho sản phẩm
      </div>
      
      {/* SEO Title */}
      <div>
        <Label htmlFor="seoTitle">SEO Title</Label>
        <Input
          id="seoTitle"
          value={formData.seoTitle}
          onChange={(e) => setFormData((prev: any) => ({ ...prev, seoTitle: e.target.value }))}
          placeholder="Tiêu đề SEO (50-60 ký tự)"
          maxLength={60}
        />
        <p className="text-xs text-muted-foreground mt-1">
          {formData.seoTitle.length}/60 ký tự
        </p>
      </div>

      {/* SEO Description */}
      <div>
        <Label htmlFor="seoDescription">SEO Description</Label>
        <Textarea
          id="seoDescription"
          value={formData.seoDescription}
          onChange={(e) => setFormData((prev: any) => ({ ...prev, seoDescription: e.target.value }))}
          placeholder="Mô tả SEO (150-160 ký tự)"
          maxLength={160}
          rows={3}
        />
        <p className="text-xs text-muted-foreground mt-1">
          {formData.seoDescription.length}/160 ký tự
        </p>
      </div>

      {/* OG Image URL */}
      <div>
        <Label htmlFor="ogImageUrl">Open Graph Image URL</Label>
        <Input
          id="ogImageUrl"
          value={formData.ogImageUrl}
          onChange={(e) => setFormData((prev: any) => ({ ...prev, ogImageUrl: e.target.value }))}
          placeholder="URL hình ảnh cho social sharing"
        />
      </div>

      {/* Tag Selector */}
      <div className="pt-4 border-t">
        <Label className="flex items-center gap-2 mb-3">
          <Tag className="h-4 w-4" />
          Tags
        </Label>
        <div className="flex flex-wrap gap-2 mb-3">
          {tags.map((tag: Tag) => (
            <Badge
              key={tag.id}
              variant={formData.tagIds?.includes(tag.id) ? "default" : "outline"}
              className="cursor-pointer hover:opacity-80 transition-opacity"
              style={{
                backgroundColor: formData.tagIds?.includes(tag.id) ? tag.color : 'transparent',
                borderColor: tag.color,
                color: formData.tagIds?.includes(tag.id) ? 'white' : tag.color,
              }}
              onClick={() => toggleTag(tag.id)}
            >
              {tag.name}
            </Badge>
          ))}
        </div>
        {formData.tagIds?.length > 0 && (
          <p className="text-xs text-muted-foreground">
            {formData.tagIds.length} tag(s) đã chọn
          </p>
        )}
      </div>

      {/* Product Story */}
      <div className="pt-4 border-t">
        <Label htmlFor="productStory">Product Story (JSON)</Label>
        <Textarea
          id="productStory"
          value={formData.productStory}
          onChange={(e) => setFormData((prev: any) => ({ ...prev, productStory: e.target.value }))}
          placeholder='{"origin": "...", "inspiration": "...", "impact": "..."}'
          rows={4}
          className="font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Nhập JSON object cho câu chuyện sản phẩm
        </p>
      </div>
    </div>
  );
}

// AI FAQ Tab
function AIFAQTab({ formData, setFormData }: any) {
  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 mb-4">
        Cấu hình Smart FAQ cho AI chatbot
      </div>
      
      <div>
        <Label htmlFor="smartFaq">Smart FAQ Data (JSON)</Label>
        <Textarea
          id="smartFaq"
          value={formData.smartFaq ? JSON.stringify(formData.smartFaq, null, 2) : ''}
          onChange={(e) => {
            try {
              const parsed = JSON.parse(e.target.value);
              setFormData((prev: any) => ({ ...prev, smartFaq: parsed }));
            } catch (err) {
              setFormData((prev: any) => ({ ...prev, smartFaq: e.target.value }));
            }
          }}
          placeholder='{"questions": [], "answers": [], "context": "..."}'
          rows={10}
          className="font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Nhập JSON object cho Smart FAQ. Format: {`{"questions": [], "answers": [], "context": ""}`}
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">💡 Gợi ý Smart FAQ</h4>
        <p className="text-sm text-blue-700 mb-3">
          Smart FAQ giúp AI chatbot trả lời câu hỏi khách hàng một cách thông minh và tự nhiên.
        </p>
        <div className="text-xs text-blue-600 space-y-1">
          <p>• <strong>questions</strong>: Danh sách câu hỏi thường gặp</p>
          <p>• <strong>answers</strong>: Câu trả lời tương ứng</p>
          <p>• <strong>context</strong>: Ngữ cảnh và thông tin bổ sung</p>
        </div>
      </div>
    </div>
  );
}
