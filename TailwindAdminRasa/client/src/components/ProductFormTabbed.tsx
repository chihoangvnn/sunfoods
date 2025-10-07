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
import { X, Save, Wand2, Loader2, Eye, EyeOff, Copy, QrCode, HelpCircle, Target, AlertTriangle, Users, MessageCircle, ShieldCheck, FileText, Bot, Tag, Search } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { ImageUploader } from "./ImageUploader";
import { QRScanner } from "./QRScanner";
import { RichTextEditor } from "./RichTextEditor";
import { FAQManagement } from "./FAQManagement";
import { 
  SalesModuleSection,
  SmartFAQForm,
  ConsultationScenariosForm,
  CrossSellDataForm,
  ConsultationTrackingForm
} from "./admin/SalesModuleComponents";
import type { 
  CloudinaryImage, 
  CloudinaryVideo, 
  RasaDescriptions,
  SmartFAQData,
  CrossSellData,
  ConsultationTrackingData
} from "@shared/schema";

// Types remain the same as original
interface Industry {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

interface Product {
  id: string;
  name: string;
  description?: string;
  sku?: string;
  itemCode?: string;
  isbn?: string; // New field
  price: string;
  stock: number;
  categoryId?: string;
  status: "active" | "inactive" | "out-of-stock";
  image?: string;
  images?: CloudinaryImage[];
  videos?: CloudinaryVideo[];
  descriptions?: RasaDescriptions;
  defaultImageIndex?: number;
  // SEO fields
  seoTitle?: string;
  seoDescription?: string;
  slug?: string;
  shortDescription?: string;
  productStory?: any;
  ingredients?: string[];
  benefits?: string[];
  usageInstructions?: string;
  specifications?: any;
  ogImageUrl?: string;
  // Unit fields
  unitType?: "weight" | "count" | "volume";
  unit?: string;
  allowDecimals?: boolean;
  minQuantity?: string;
  quantityStep?: string;
}

interface Category {
  id: string;
  name: string;
  description?: string;
  industryId: string;
  isActive: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
  consultationConfig?: any;
  consultationTemplates?: any;
  salesAdviceTemplate?: any;
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
  const [activeTab, setActiveTab] = useState<'basic' | 'seo' | 'ai' | 'faq'>('basic');
  
  // Form data state
  const [formData, setFormData] = useState({
    // Basic fields
    name: "",
    description: "",
    sku: "",
    itemCode: "",
    isbn: "",
    price: "",
    stock: "0",
    industryId: "",
    categoryId: "",
    status: "active" as "active" | "inactive" | "out-of-stock",
    images: [] as CloudinaryImage[],
    videos: [] as CloudinaryVideo[],
    unitType: "count" as "weight" | "count" | "volume",
    unit: "cái",
    allowDecimals: false,
    minQuantity: "1",
    quantityStep: "1",
    
    // Marketing & Pricing fields
    originalPrice: "",
    fakeSalesCount: 0,
    isNew: false,
    isTopseller: false,
    isFreeshipping: false,
    isBestseller: false,
    isVipOnly: false,
    requiredVipTier: null as string | null,
    
    // SEO fields
    seoTitle: "",
    seoDescription: "",
    slug: "",
    shortDescription: "",
    productStory: {},
    ingredients: [] as string[],
    benefits: [] as string[],
    usageInstructions: "",
    specifications: {},
    ogImageUrl: "",
  });
  
  // AI data state
  const [generatedDescriptions, setGeneratedDescriptions] = useState<RasaDescriptions | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showDescriptionPreview, setShowDescriptionPreview] = useState(false);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  
  // Fetch industries and categories
  const { data: industries = [], isLoading: industriesLoading } = useQuery<Industry[]>({
    queryKey: ['/api/industries'],
    queryFn: async () => {
      const response = await fetch('/api/industries');
      if (!response.ok) throw new Error('Failed to fetch industries');
      return response.json();
    },
  });

  const { data: categories = [], isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
    queryFn: async () => {
      const response = await fetch('/api/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      return response.json();
    },
  });

  // Load product data if editing
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description || "",
        sku: product.sku || "",
        itemCode: product.itemCode || "",
        isbn: product.isbn || "",
        price: product.price,
        stock: product.stock.toString(),
        industryId: "",
        categoryId: product.categoryId || "",
        status: product.status,
        images: product.images || [],
        videos: product.videos || [],
        unitType: product.unitType || "count",
        unit: product.unit || "cái",
        allowDecimals: product.allowDecimals || false,
        minQuantity: product.minQuantity || "1",
        quantityStep: product.quantityStep || "1",
        
        // Marketing & Pricing fields
        originalPrice: (product as any).originalPrice || "",
        fakeSalesCount: (product as any).fakeSalesCount || 0,
        isNew: (product as any).isNew || false,
        isTopseller: (product as any).isTopseller || false,
        isFreeshipping: (product as any).isFreeshipping || false,
        isBestseller: (product as any).isBestseller || false,
        isVipOnly: (product as any).isVipOnly || false,
        requiredVipTier: (product as any).requiredVipTier || null,
        
        // SEO fields
        seoTitle: product.seoTitle || "",
        seoDescription: product.seoDescription || "",
        slug: product.slug || "",
        shortDescription: product.shortDescription || "",
        productStory: product.productStory || {},
        ingredients: product.ingredients || [],
        benefits: product.benefits || [],
        usageInstructions: product.usageInstructions || "",
        specifications: product.specifications || {},
        ogImageUrl: product.ogImageUrl || "",
      });
      
      // Load AI descriptions
      if (product.descriptions) {
        setGeneratedDescriptions(product.descriptions);
        setShowDescriptionPreview(true);
      }
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
    
    const dataToSave = {
      ...formData,
      stock: parseInt(formData.stock),
      price: formData.price,
      descriptions: generatedDescriptions,
    };
    
    // 🐛 DEBUG: Log payload to check if unit field is included
    console.log('🚀 Product Update Payload:', {
      unit: dataToSave.unit,
      unitType: dataToSave.unitType,
      fullPayload: dataToSave
    });
    
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

  // AI Description Generation
  const generateDescriptions = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập tên sản phẩm trước khi tạo mô tả",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const selectedIndustry = industries.find(i => i.id === formData.industryId);
      const selectedCategory = categories.find(c => c.id === formData.categoryId);

      const response = await fetch('/api/ai/generate-product-descriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: formData.name,
          productDescription: formData.description,
          industryName: selectedIndustry?.name || '',
          categoryName: selectedCategory?.name || '',
          price: formData.price,
          features: [],
          consultationContext: '',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate descriptions');
      }

      const data = await response.json();
      console.log('🤖 AI Response received:', data);
      
      // Fix: API returns data directly, not in data.descriptions
      const aiDescriptions = {
        primary: data.primary || '',
        rasa_variations: data.rasa_variations || {},
        contexts: data.contexts || {}
      };
      
      console.log('🤖 Processed AI descriptions:', aiDescriptions);
      setGeneratedDescriptions(aiDescriptions);
      setShowDescriptionPreview(true);
      
      // 🔄 Auto-populate form fields with AI-generated content
      if (aiDescriptions.primary) {
        setFormData(prev => ({
          ...prev,
          description: aiDescriptions.primary,
          shortDescription: aiDescriptions.primary.substring(0, 160) // SEO-friendly length
        }));
        
        toast({
          title: "✨ Content Applied",
          description: "AI content has been applied to form fields. You can edit before saving.",
        });
      }
      
      toast({
        title: "Thành công",
        description: "Đã tạo mô tả sản phẩm bằng AI",
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tạo mô tả sản phẩm",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Đã sao chép",
      description: "Nội dung đã được sao chép vào clipboard",
    });
  };

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
            <div className="flex space-x-1 border-b mt-4">
              <button
                onClick={() => setActiveTab('basic')}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                  activeTab === 'basic'
                    ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                📝 Cơ bản
              </button>
              <button
                onClick={() => setActiveTab('seo')}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                  activeTab === 'seo'
                    ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                🏷️ SEO
              </button>
              <button
                onClick={() => setActiveTab('ai')}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                  activeTab === 'ai'
                    ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                🤖 AI Generate
              </button>
              {isEditing && (
                <button
                  onClick={() => setActiveTab('faq')}
                  className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                    activeTab === 'faq'
                      ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  🙋‍♂️ FAQ
                </button>
              )}
            </div>
          </CardHeader>

          <CardContent>
            {/* FAQ Tab - Outside form to avoid nesting */}
            {activeTab === 'faq' && isEditing && product?.id ? (
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">🙋‍♂️ Quản lý FAQ sản phẩm</h3>
                  <p className="text-sm text-gray-600">
                    Thêm, chỉnh sửa và sắp xếp các câu hỏi thường gặp cho sản phẩm này
                  </p>
                </div>
                <FAQManagement productId={product.id} />
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Tab Content */}
              {activeTab === 'basic' && (
                <BasicTab 
                  formData={formData}
                  setFormData={setFormData}
                  industries={industries}
                  categories={categories}
                  isQRScannerOpen={isQRScannerOpen}
                  setIsQRScannerOpen={setIsQRScannerOpen}
                />
              )}
              
              {activeTab === 'seo' && (
                <SEOTab 
                  formData={formData}
                  setFormData={setFormData}
                />
              )}
              
              {activeTab === 'ai' && (
                <AITab 
                  formData={formData}
                  generatedDescriptions={generatedDescriptions}
                  showDescriptionPreview={showDescriptionPreview}
                  setShowDescriptionPreview={setShowDescriptionPreview}
                  isGenerating={isGenerating}
                  generateDescriptions={generateDescriptions}
                  copyToClipboard={copyToClipboard}
                  product={product}
                  salesData={salesData}
                  setSalesData={setSalesData}
                  handleSalesSave={handleSalesSave}
                  salesMutation={salesMutation}
                  moduleCollapseState={moduleCollapseState}
                  toggleModuleCollapse={toggleModuleCollapse}
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
            )}
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

// Tab Components (will implement these next)
function BasicTab({ formData, setFormData, industries, categories, isQRScannerOpen, setIsQRScannerOpen }: any) {
  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 mb-4">
        Thông tin cơ bản của sản phẩm
      </div>
      
      {/* Row 1: Tên sản phẩm + SKU */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        <div>
          <Label htmlFor="sku">Mã SKU</Label>
          <Input
            id="sku"
            value={formData.sku}
            onChange={(e) => setFormData((prev: any) => ({ ...prev, sku: e.target.value }))}
            placeholder="Auto-generated hoặc nhập thủ công"
          />
        </div>
      </div>

      {/* Row 2: Item Code + ISBN + QR Scanner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        <div>
          <Label htmlFor="isbn">Mã ISBN</Label>
          <Input
            id="isbn"
            value={formData.isbn}
            onChange={(e) => setFormData((prev: any) => ({ ...prev, isbn: e.target.value }))}
            placeholder="ISBN cho sách"
          />
        </div>
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
      </div>

      {/* Row 3: Industry + Category */}
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
              {categories
                .filter((cat: Category) => cat.industryId === formData.industryId)
                .map((category: Category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Row 4: Price + Stock + Units */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <Label htmlFor="price">Giá tiền (VND) *</Label>
          <Input
            id="price"
            type="number"
            min="0"
            step="1000"
            value={formData.price}
            onChange={(e) => setFormData((prev: any) => ({ ...prev, price: e.target.value }))}
            placeholder="0"
            required
          />
        </div>
        <div>
          <Label htmlFor="stock">Số lượng tồn kho</Label>
          <Input
            id="stock"
            type="number"
            min="0"
            value={formData.stock}
            onChange={(e) => setFormData((prev: any) => ({ ...prev, stock: e.target.value }))}
            placeholder="0"
          />
        </div>
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
              <SelectItem value="count">Đếm (cái, hộp)</SelectItem>
              <SelectItem value="weight">Cân (kg, lạng, gram)</SelectItem>
              <SelectItem value="volume">Thể tích (lít, ml)</SelectItem>
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
              {formData.unitType === 'weight' && (
                <>
                  <SelectItem value="kg">kg</SelectItem>
                  <SelectItem value="lạng">lạng (0.1 kg = 100g)</SelectItem>
                  <SelectItem value="gram">gram</SelectItem>
                </>
              )}
              {formData.unitType === 'volume' && (
                <>
                  <SelectItem value="lít">lít</SelectItem>
                  <SelectItem value="ml">ml</SelectItem>
                </>
              )}
              {formData.unitType === 'count' && (
                <>
                  <SelectItem value="cái">cái</SelectItem>
                  <SelectItem value="hộp">hộp</SelectItem>
                  <SelectItem value="gói">gói</SelectItem>
                  <SelectItem value="thùng">thùng</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Row 5: Marketing & Pricing */}
      <div className="space-y-4 p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-purple-50">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">💰 Marketing & Pricing</h3>
        
        {/* Pricing Fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="originalPrice">Giá gốc (VND)</Label>
            <Input
              id="originalPrice"
              type="number"
              min="0"
              step="1000"
              value={formData.originalPrice || ''}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, originalPrice: e.target.value }))}
              placeholder="Để trống nếu không giảm giá"
            />
            <p className="text-xs text-gray-500 mt-1">Hiển thị % giảm giá</p>
          </div>
          <div>
            <Label htmlFor="fakeSalesCount">Lượt bán ảo</Label>
            <Input
              id="fakeSalesCount"
              type="number"
              min="0"
              value={formData.fakeSalesCount || 0}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, fakeSalesCount: parseInt(e.target.value) || 0 }))}
              placeholder="0"
            />
            <p className="text-xs text-gray-500 mt-1">Tăng uy tín sản phẩm</p>
          </div>
          <div className="flex items-center">
            <div className="text-sm text-gray-600">
              {(() => {
                const originalPrice = parseFloat(formData.originalPrice);
                const currentPrice = parseFloat(formData.price);
                
                if (!formData.originalPrice || !formData.price || originalPrice <= 0 || currentPrice <= 0) {
                  return <div className="text-gray-400 text-xs">Nhập giá gốc để hiển thị % giảm</div>;
                }
                
                if (currentPrice >= originalPrice) {
                  return <div className="text-amber-600 text-xs">Giá hiện tại phải nhỏ hơn giá gốc</div>;
                }
                
                const discountPercent = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
                
                return (
                  <div className="bg-green-100 p-2 rounded">
                    <span className="text-green-800 font-medium">
                      -{discountPercent}% 
                    </span>
                    <div className="text-xs">Giảm giá</div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Marketing Badges */}
        <div>
          <Label className="text-sm font-medium">🏷️ Huy hiệu Marketing</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isNew"
                checked={formData.isNew || false}
                onChange={(e) => setFormData((prev: any) => ({ ...prev, isNew: e.target.checked }))}
                className="rounded border-gray-300"
              />
              <Label htmlFor="isNew" className="text-sm cursor-pointer">🆕 NEW</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isTopseller"
                checked={formData.isTopseller || false}
                onChange={(e) => setFormData((prev: any) => ({ ...prev, isTopseller: e.target.checked }))}
                className="rounded border-gray-300"
              />
              <Label htmlFor="isTopseller" className="text-sm cursor-pointer">🏆 TOPSELLER</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isFreeshipping"
                checked={formData.isFreeshipping || false}
                onChange={(e) => setFormData((prev: any) => ({ ...prev, isFreeshipping: e.target.checked }))}
                className="rounded border-gray-300"
              />
              <Label htmlFor="isFreeshipping" className="text-sm cursor-pointer">🚚 FREESHIP</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isBestseller"
                checked={formData.isBestseller || false}
                onChange={(e) => setFormData((prev: any) => ({ ...prev, isBestseller: e.target.checked }))}
                className="rounded border-gray-300"
              />
              <Label htmlFor="isBestseller" className="text-sm cursor-pointer">⭐ BESTSELLER</Label>
            </div>
          </div>
        </div>
      </div>

      {/* VIP Settings Section */}
      <div className="space-y-4 p-4 border rounded-lg bg-gradient-to-r from-purple-50 to-pink-50">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">👑 VIP Settings</h3>
        
        {/* VIP Only Toggle */}
        <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
          <div className="flex-1">
            <Label htmlFor="isVipOnly" className="text-sm font-medium cursor-pointer">
              Sản phẩm VIP Only
            </Label>
            <p className="text-xs text-gray-500 mt-1">
              Chỉ khách hàng VIP mới có thể mua sản phẩm này
            </p>
          </div>
          <Switch
            id="isVipOnly"
            checked={formData.isVipOnly || false}
            onCheckedChange={(checked) => {
              setFormData((prev: any) => ({ 
                ...prev, 
                isVipOnly: checked,
                requiredVipTier: checked ? prev.requiredVipTier : null
              }));
            }}
          />
        </div>

        {/* VIP Tier Dropdown - Only show when isVipOnly is true */}
        {formData.isVipOnly && (
          <div className="pl-3 border-l-2 border-purple-300">
            <Label htmlFor="requiredVipTier" className="text-sm font-medium">
              Yêu cầu hạng VIP tối thiểu
            </Label>
            <p className="text-xs text-gray-500 mb-2">
              Chọn hạng VIP tối thiểu để mua sản phẩm (để trống = tất cả VIP)
            </p>
            <Select
              value={formData.requiredVipTier || ""}
              onValueChange={(value) => setFormData((prev: any) => ({ 
                ...prev, 
                requiredVipTier: value || null 
              }))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Tất cả VIP có thể mua" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tất cả VIP</SelectItem>
                <SelectItem value="silver">🥈 Silver VIP</SelectItem>
                <SelectItem value="gold">🥇 Gold VIP</SelectItem>
                <SelectItem value="platinum">💎 Platinum VIP</SelectItem>
                <SelectItem value="diamond">💠 Diamond VIP</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Row 6: Description */}
      <div>
        <Label htmlFor="description">Mô tả chi tiết</Label>
        <RichTextEditor
          id="description"
          value={formData.description}
          onChange={(value) => setFormData((prev: any) => ({ ...prev, description: value }))}
          placeholder="Nhập mô tả sản phẩm hoặc sử dụng AI Generate để tự động tạo"
          height="120px"
          className="w-full mt-2"
        />
      </div>

      {/* Row 6: Media Upload */}
      <div>
        <Label>Hình ảnh & Video sản phẩm</Label>
        <p className="text-sm text-muted-foreground mb-3">
          Upload hình ảnh và video để giới thiệu sản phẩm
        </p>
        <ImageUploader
          value={[...formData.images, ...formData.videos]}
          onChange={(media) => {
            const images = media.filter((m): m is CloudinaryImage => m.resource_type === 'image');
            const videos = media.filter((m): m is CloudinaryVideo => m.resource_type === 'video');
            setFormData((prev: any) => ({ ...prev, images, videos }));
          }}
          maxFiles={8}
          maxFileSize={50}
          acceptImages={true}
          acceptVideos={true}
          folder="products"
          className="mt-2"
        />
      </div>
    </div>
  );
}

function SEOTab({ formData, setFormData }: any) {
  const [isGeneratingSEO, setIsGeneratingSEO] = useState(false);
  const { toast } = useToast();

  const handleAutoGenerateSEO = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Thiếu thông tin",
        description: "Cần có tên sản phẩm để tạo SEO data",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingSEO(true);
    try {
      console.log('🔍 Generating SEO for:', formData.name);
      
      const response = await fetch('/api/ai/generate-seo-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productName: formData.name,
          productDescription: formData.description || formData.shortDescription,
          category: formData.categoryId, // We'll try to get category name later
          options: {
            targetMarket: 'vietnam',
            includeLocalKeywords: true
          }
        })
      });

      const result = await response.json();

      if (result.seo_title && result.seo_description && result.slug) {
        // Update form data with generated SEO content
        setFormData((prev: any) => ({
          ...prev,
          seoTitle: result.seo_title,
          seoDescription: result.seo_description,
          slug: result.slug,
          ogImageUrl: result.og_title ? `https://og-image-generator.com/api?title=${encodeURIComponent(result.og_title)}` : prev.ogImageUrl
        }));

        toast({
          title: "✨ SEO đã được tạo!",
          description: `Tạo thành công SEO cho "${formData.name}" với ${result.keywords?.length || 0} keywords tối ưu`,
        });

        console.log('🔍 SEO generation successful:', result);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error: any) {
      console.error('SEO generation error:', error);
      toast({
        title: "Lỗi tạo SEO",
        description: error.message || 'Không thể tạo dữ liệu SEO. Vui lòng thử lại.',
        variant: "destructive"
      });
    } finally {
      setIsGeneratingSEO(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Tối ưu hóa SEO và marketing cho sản phẩm
        </div>
        <Button 
          onClick={handleAutoGenerateSEO}
          disabled={isGeneratingSEO || !formData.name.trim()}
          variant="outline" 
          size="sm"
          className="border-blue-200 text-blue-700 hover:bg-blue-50"
        >
          {isGeneratingSEO ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Đang tạo SEO...
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4 mr-2" />
              ✨ Auto Generate SEO
            </>
          )}
        </Button>
      </div>
      
      {/* SEO Basic */}
      <div className="grid grid-cols-1 gap-4">
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
        
        <div>
          <Label htmlFor="slug">Slug URL</Label>
          <Input
            id="slug"
            value={formData.slug}
            onChange={(e) => setFormData((prev: any) => ({ ...prev, slug: e.target.value }))}
            placeholder="url-thân-thiện-cho-sản-phẩm"
          />
        </div>
      </div>

      {/* Product Marketing */}
      <div className="space-y-4 pt-4 border-t">
        <h4 className="font-medium text-gray-900">Marketing Content</h4>
        
        <div>
          <Label htmlFor="shortDescription">Mô tả ngắn (1-2 câu highlight)</Label>
          <Textarea
            id="shortDescription"
            value={formData.shortDescription}
            onChange={(e) => setFormData((prev: any) => ({ ...prev, shortDescription: e.target.value }))}
            placeholder="Mô tả ngắn gọn về sản phẩm"
            rows={2}
          />
        </div>

        <div>
          <Label htmlFor="usageInstructions">Hướng dẫn sử dụng</Label>
          <Textarea
            id="usageInstructions"
            value={formData.usageInstructions}
            onChange={(e) => setFormData((prev: any) => ({ ...prev, usageInstructions: e.target.value }))}
            placeholder="Cách sử dụng sản phẩm chi tiết"
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="ogImageUrl">Open Graph Image URL</Label>
          <Input
            id="ogImageUrl"
            value={formData.ogImageUrl}
            onChange={(e) => setFormData((prev: any) => ({ ...prev, ogImageUrl: e.target.value }))}
            placeholder="URL hình ảnh cho social sharing"
          />
        </div>
      </div>

      {/* Arrays for ingredients and benefits */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
        <div>
          <Label>Thành phần</Label>
          <div className="space-y-2 mt-2">
            {formData.ingredients.map((ingredient: string, index: number) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={ingredient}
                  onChange={(e) => {
                    const newIngredients = [...formData.ingredients];
                    newIngredients[index] = e.target.value;
                    setFormData((prev: any) => ({ ...prev, ingredients: newIngredients }));
                  }}
                  placeholder="Thành phần"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newIngredients = formData.ingredients.filter((_: any, i: number) => i !== index);
                    setFormData((prev: any) => ({ ...prev, ingredients: newIngredients }));
                  }}
                >
                  ✕
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setFormData((prev: any) => ({ ...prev, ingredients: [...prev.ingredients, ''] }));
              }}
            >
              ➕ Thêm thành phần
            </Button>
          </div>
        </div>

        <div>
          <Label>Lợi ích</Label>
          <div className="space-y-2 mt-2">
            {formData.benefits.map((benefit: string, index: number) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={benefit}
                  onChange={(e) => {
                    const newBenefits = [...formData.benefits];
                    newBenefits[index] = e.target.value;
                    setFormData((prev: any) => ({ ...prev, benefits: newBenefits }));
                  }}
                  placeholder="Lợi ích"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newBenefits = formData.benefits.filter((_: any, i: number) => i !== index);
                    setFormData((prev: any) => ({ ...prev, benefits: newBenefits }));
                  }}
                >
                  ✕
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setFormData((prev: any) => ({ ...prev, benefits: [...prev.benefits, ''] }));
              }}
            >
              ➕ Thêm lợi ích
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AITab({ 
  formData, 
  generatedDescriptions, 
  showDescriptionPreview, 
  setShowDescriptionPreview, 
  isGenerating, 
  generateDescriptions, 
  copyToClipboard, 
  product, 
  salesData,
  setSalesData,
  handleSalesSave,
  salesMutation,
  moduleCollapseState,
  toggleModuleCollapse
}: any) {
  return (
    <div className="space-y-6">
      <div className="text-sm text-gray-600 mb-4">
        AI tự động tạo nội dung và quản lý sales techniques nâng cao
      </div>
      
      {/* AI Description Generation - Collapsible */}
      <SalesModuleSection
        title="🤖 AI Description Generator - Tự Động Tạo Nội Dung"
        icon={<Wand2 className="h-5 w-5 text-purple-600" />}
        moduleKey="aiGenerator"
        isOpen={moduleCollapseState.aiGenerator}
        onToggle={toggleModuleCollapse}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              AI tự động tạo mô tả sản phẩm và variations cho RASA chatbot
            </p>
            <Button
              type="button"
              onClick={generateDescriptions}
              disabled={isGenerating || !formData.name.trim()}
              variant="outline"
              size="sm"
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Wand2 className="h-4 w-4 mr-2" />
              )}
              {isGenerating ? 'Đang tạo...' : '🪄 Tự động tạo mô tả'}
            </Button>
          </div>

          {!formData.name.trim() && (
            <p className="text-xs text-muted-foreground">
              💡 Nhập tên sản phẩm ở tab "Cơ bản" trước để AI có thể tạo mô tả phù hợp
            </p>
          )}

          {/* Enhanced AI Generated Descriptions Preview with Tabs */}
          {generatedDescriptions && (
            <EnhancedAIPreview 
              generatedDescriptions={generatedDescriptions}
              showDescriptionPreview={showDescriptionPreview}
              setShowDescriptionPreview={setShowDescriptionPreview}
              copyToClipboard={copyToClipboard}
            />
          )}
        </div>
      </SalesModuleSection>
    </div>
  );
}

// Enhanced AI Preview Component with Professional Tabs UI
function EnhancedAIPreview({ generatedDescriptions, showDescriptionPreview, setShowDescriptionPreview, copyToClipboard }: any) {
  const [activeTab, setActiveTab] = useState('primary');

  const tabs = [
    { id: 'primary', label: '📝 Mô tả chính', icon: <FileText className="h-4 w-4" />, count: 1 },
    { id: 'rasa', label: '🤖 RASA Variants', icon: <Bot className="h-4 w-4" />, count: Object.keys(generatedDescriptions.rasa_variations || {}).length },
    { id: 'contexts', label: '🎯 Contexts', icon: <Tag className="h-4 w-4" />, count: Object.keys(generatedDescriptions.contexts || {}).length },
    { id: 'seo', label: '🔍 SEO', icon: <Search className="h-4 w-4" />, count: (generatedDescriptions.seo_title || generatedDescriptions.seo_description) ? 1 : 0 },
    { id: 'custom', label: '🔥 Custom', icon: <HelpCircle className="h-4 w-4" />, count: 1 }
  ];

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
            <div className="absolute inset-0 w-4 h-4 bg-green-400 rounded-full animate-ping opacity-75"></div>
          </div>
          <h5 className="text-sm font-semibold text-green-700 flex items-center gap-2">
            ✨ AI Content Generated Successfully
            <Badge variant="secondary" className="text-xs">
              {tabs.reduce((sum, tab) => sum + tab.count, 0)} items
            </Badge>
          </h5>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowDescriptionPreview(!showDescriptionPreview)}
          className="text-gray-600 hover:text-gray-800 border-green-200 hover:border-green-300"
        >
          {showDescriptionPreview ? (
            <EyeOff className="h-4 w-4 mr-2" />
          ) : (
            <Eye className="h-4 w-4 mr-2" />
          )}
          {showDescriptionPreview ? 'Thu gọn preview' : 'Xem chi tiết'}
        </Button>
      </div>

      {showDescriptionPreview && (
        <Card className="border-l-4 border-l-green-500 bg-gradient-to-r from-green-50 via-white to-blue-50 shadow-lg">
          <CardContent className="p-6">
            {/* Professional Tab Navigation */}
            <div className="flex flex-wrap gap-2 mb-6 p-2 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-white text-blue-700 shadow-md ring-2 ring-blue-100'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-white/60'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <Badge variant={activeTab === tab.id ? "default" : "outline"} className="text-xs min-w-[20px] h-5">
                      {tab.count}
                    </Badge>
                  )}
                </button>
              ))}
            </div>

            {/* Enhanced Tab Content */}
            <div className="space-y-6">
              {/* Primary Description Tab */}
              {activeTab === 'primary' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300 px-3 py-1">
                      📝 Primary Content • {generatedDescriptions.primary?.length || 0} characters
                    </Badge>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(generatedDescriptions.primary)}
                      className="h-8 gap-2 hover:bg-green-50 border-green-200"
                    >
                      <Copy className="h-3 w-3" />
                      Copy Text
                    </Button>
                  </div>
                  <Card className="border border-green-200">
                    <CardContent className="p-4">
                      <p className="text-gray-800 leading-relaxed text-sm">
                        {generatedDescriptions.primary}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* RASA Variations Tab */}
              {activeTab === 'rasa' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300 px-3 py-1">
                      🤖 RASA Chatbot Variations • {Object.keys(generatedDescriptions.rasa_variations || {}).length} variants
                    </Badge>
                  </div>
                  <div className="grid gap-4">
                    {Object.entries(generatedDescriptions.rasa_variations || {}).map(([index, description]: [string, any]) => {
                      const contextLabels = {
                        "0": { label: "🛡️ An toàn & Tin cậy", color: "bg-green-100 text-green-800 border-green-300", accent: "border-l-green-500" },
                        "1": { label: "⚡ Tiện lợi & Nhanh chóng", color: "bg-yellow-100 text-yellow-800 border-yellow-300", accent: "border-l-yellow-500" }, 
                        "2": { label: "⭐ Chất lượng cao", color: "bg-purple-100 text-purple-800 border-purple-300", accent: "border-l-purple-500" },
                        "3": { label: "💚 Sức khỏe & Tự nhiên", color: "bg-emerald-100 text-emerald-800 border-emerald-300", accent: "border-l-emerald-500" }
                      };
                      const context = contextLabels[index as keyof typeof contextLabels];
                      return (
                        <Card key={index} className={`border-l-4 ${context?.accent} border-gray-200 hover:shadow-md transition-shadow`}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <Badge variant="outline" className={context?.color}>
                                {context?.label}
                              </Badge>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(description)}
                                className="h-7 w-7 p-0 hover:bg-gray-100"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                            <p className="text-gray-700 text-sm leading-relaxed">{description}</p>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                  <div className="text-center mt-4">
                    <Badge variant="secondary" className="text-blue-600 px-4 py-2">
                      💡 RASA bot sẽ tự động chọn variation phù hợp dựa trên context cuộc hội thoại
                    </Badge>
                  </div>
                </div>
              )}

              {/* Contexts Tab - Fixed Implementation */}
              {activeTab === 'contexts' && (
                <div className="space-y-4">
                  <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300 px-3 py-1">
                    🎯 Context Mappings • {Object.keys(generatedDescriptions.contexts || {}).length} contexts
                  </Badge>
                  <Card className="border border-orange-200">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        {Object.keys(generatedDescriptions.contexts || {}).length > 0 ? (
                          Object.entries(generatedDescriptions.contexts || {}).map(([context, rasaIndex]) => {
                            const rasaIndexStr = String(rasaIndex);
                            const rasaVariation = generatedDescriptions.rasa_variations?.[rasaIndexStr];
                            return (
                              <div key={context} className="flex justify-between items-start p-3 bg-orange-50 rounded-lg border border-orange-200">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Tag className="h-4 w-4 text-orange-600" />
                                    <span className="font-medium text-orange-800 capitalize">
                                      {context.replace('_', ' ')}
                                    </span>
                                    <span className="text-xs text-orange-600 bg-orange-200 px-2 py-1 rounded">
                                      → RASA #{rasaIndexStr}
                                    </span>
                                  </div>
                                  {rasaVariation && (
                                    <p className="text-sm text-gray-700 leading-relaxed">
                                      {rasaVariation}
                                    </p>
                                  )}
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(rasaVariation || `Context: ${context} → RASA Variant #${rasaIndexStr}`)}
                                  className="h-7 w-7 p-0 hover:bg-orange-100 ml-2"
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                            );
                          })
                        ) : (
                          <div className="text-center py-8">
                            <Tag className="h-12 w-12 text-orange-400 mx-auto mb-3 opacity-50" />
                            <p className="text-orange-600 font-medium">No context mappings available</p>
                            <p className="text-xs text-orange-500 mt-1">
                              Context mappings will appear here after AI generation
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* SEO Data Tab */}
              {activeTab === 'seo' && (
                <div className="space-y-4">
                  <Badge variant="outline" className="bg-indigo-100 text-indigo-800 border-indigo-300 px-3 py-1">
                    🔍 SEO Optimization Data
                  </Badge>
                  <Card className="border border-indigo-200">
                    <CardContent className="p-4">
                      <div className="space-y-4">
                        {generatedDescriptions.seo_title && (
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <Search className="h-4 w-4" />
                                SEO Title
                              </Label>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(generatedDescriptions.seo_title)}
                                className="h-6 w-6 p-0 hover:bg-gray-100"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                            <Card className="bg-gray-50 border border-gray-200">
                              <CardContent className="p-3">
                                <p className="text-gray-800 text-sm font-medium">
                                  {generatedDescriptions.seo_title}
                                </p>
                              </CardContent>
                            </Card>
                          </div>
                        )}
                        {generatedDescriptions.seo_description && (
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                SEO Description
                              </Label>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(generatedDescriptions.seo_description)}
                                className="h-6 w-6 p-0 hover:bg-gray-100"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                            <Card className="bg-gray-50 border border-gray-200">
                              <CardContent className="p-3">
                                <p className="text-gray-800 text-sm">
                                  {generatedDescriptions.seo_description}
                                </p>
                              </CardContent>
                            </Card>
                          </div>
                        )}
                        {!generatedDescriptions.seo_title && !generatedDescriptions.seo_description && (
                          <div className="text-center py-12">
                            <Search className="h-16 w-16 text-gray-400 mx-auto mb-4 opacity-50" />
                            <p className="text-gray-500 font-medium">SEO data not available</p>
                            <p className="text-xs text-gray-400 mt-2">
                              Try regenerating content with SEO optimization enabled
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Custom Tab - NEW */}
              {activeTab === 'custom' && (
                <div className="space-y-4">
                  <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300 px-3 py-1">
                    🔥 Custom Content & Advanced Features
                  </Badge>
                  <Card className="border border-purple-200">
                    <CardContent className="p-4">
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                              <HelpCircle className="h-4 w-4" />
                              Custom Product Features
                            </Label>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard("Custom content for advanced product features")}
                              className="h-6 w-6 p-0 hover:bg-gray-100"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                          <Card className="bg-purple-50 border border-purple-200">
                            <CardContent className="p-3">
                              <p className="text-purple-800 text-sm">
                                🎯 Advanced product customization options
                              </p>
                              <p className="text-purple-700 text-xs mt-2">
                                • Custom variations and configurations<br/>
                                • Advanced pricing rules<br/>
                                • Special promotional content<br/>
                                • Extended product specifications
                              </p>
                            </CardContent>
                          </Card>
                        </div>
                        
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                              <Target className="h-4 w-4" />
                              Enhanced Descriptions
                            </Label>
                          </div>
                          <Card className="bg-purple-50 border border-purple-200">
                            <CardContent className="p-3">
                              <p className="text-purple-800 text-sm font-medium">
                                Nội dung tùy chỉnh cho sản phẩm đặc biệt
                              </p>
                              <p className="text-purple-700 text-xs mt-2">
                                Tab này có thể chứa các thông tin mở rộng, mô tả chi tiết hơn về sản phẩm, 
                                hoặc các tính năng đặc biệt mà bạn muốn highlight cho khách hàng.
                              </p>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}