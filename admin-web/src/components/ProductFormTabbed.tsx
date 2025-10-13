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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { X, Save, Tag, Package, TrendingUp, Search, Bot, Calendar, Plus, Sparkles, FileText, RefreshCw, Image } from "lucide-react";
import { ImageUploader } from "./ImageUploader";
import { QRScanner } from "./QRScanner";
import { FAQManagement } from "./FAQManagement";
import type { ProductFAQ, BasicInfoContent } from "@/lib/gemini";
import { generateBasicInfo } from "@/lib/gemini";

// CloudinaryImage type definition
export interface CloudinaryImage {
  public_id: string;
  version: number;
  signature: string;
  width: number;
  height: number;
  format: string;
  resource_type: 'image' | 'video';
  created_at: string;
  bytes: number;
  type: string;
  url: string;
  secure_url: string;
  alt?: string;
  caption?: string;
  display_order?: number;
}

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

  // Filter categories based on selected industry (REQUIRED for industry-based categories)
  const filteredCategories = categories.filter(category => {
    // MUST select industry first - only show categories matching selected industry
    if (!formData.industryId) {
      return false; // No industry selected = no categories shown
    }
    // Match industryId
    const industryMatch = category.industryId === formData.industryId;
    // Show only active categories
    const activeMatch = category.isActive === true;
    return activeMatch && industryMatch;
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
            
          </CardHeader>

          <CardContent className="px-3 py-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Accordion Sections */}
              <Accordion type="single" defaultValue="basic" className="w-full" collapsible>
                <AccordionItem value="basic">
                  <AccordionTrigger className="py-3 px-3 hover:no-underline hover:bg-gray-50 rounded-t-md">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-600" />
                      <span className="font-semibold">Thông tin cơ bản</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-3 pt-2">
                    <BasicInfoTab 
                      formData={formData}
                      setFormData={setFormData}
                      industries={industries}
                      categories={filteredCategories}
                      product={product}
                    />
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="media">
                  <AccordionTrigger className="py-3 px-3 hover:no-underline hover:bg-gray-50">
                    <div className="flex items-center gap-2">
                      <Image className="h-4 w-4 text-purple-600" />
                      <span className="font-semibold">Media & Hình ảnh</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-3 pt-2">
                    <MediaTab 
                      formData={formData}
                      setFormData={setFormData}
                    />
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="info">
                  <AccordionTrigger className="py-3 px-3 hover:no-underline hover:bg-gray-50">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-green-600" />
                      <span className="font-semibold">Thông tin sản phẩm</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-3 pt-2">
                    <ProductInfoTab 
                      formData={formData}
                      setFormData={setFormData}
                      isQRScannerOpen={isQRScannerOpen}
                      setIsQRScannerOpen={setIsQRScannerOpen}
                    />
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="marketing">
                  <AccordionTrigger className="py-3 px-3 hover:no-underline hover:bg-gray-50">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-orange-600" />
                      <span className="font-semibold">Marketing & Khuyến mãi</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-3 pt-2">
                    <MarketingTab 
                      formData={formData}
                      setFormData={setFormData}
                    />
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="seo">
                  <AccordionTrigger className="py-3 px-3 hover:no-underline hover:bg-gray-50">
                    <div className="flex items-center gap-2">
                      <Search className="h-4 w-4 text-indigo-600" />
                      <span className="font-semibold">SEO & Tags</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-3 pt-2">
                    <SEOTab 
                      formData={formData}
                      setFormData={setFormData}
                      tags={tags}
                    />
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="ai">
                  <AccordionTrigger className="py-3 px-3 hover:no-underline hover:bg-gray-50 rounded-b-md">
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4 text-pink-600" />
                      <span className="font-semibold">AI FAQ</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-3 pt-2">
                    <AIFAQTab 
                      formData={formData}
                      setFormData={setFormData}
                    />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

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

// Basic Info Tab
function BasicInfoTab({ formData, setFormData, industries, categories, product }: any) {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleAIGenerate = async () => {
    if (!formData.name || !formData.categoryId) {
      toast({
        title: "⚠️ Thiếu thông tin",
        description: "Vui lòng nhập tên sản phẩm và chọn danh mục trước khi dùng AI.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const categoryName = categories.find((c: any) => c.id === formData.categoryId)?.name || '';
      const industryName = industries.find((i: Industry) => i.id === formData.industryId)?.name;
      
      const result = await generateBasicInfo(formData.name, categoryName, industryName);
      
      setFormData((prev: any) => ({
        ...prev,
        description: result.description,
        shortDescription: result.shortDescription,
        metaDescription: result.seoDescription,
        seoTitle: result.seoTitle,
        tags: result.tags
      }));

      toast({
        title: "✨ AI đã tạo thành công!",
        description: "Thông tin sản phẩm đã được tự động điền vào form.",
      });
    } catch (error: any) {
      toast({
        title: "❌ Lỗi AI generation",
        description: error.message || "Không thể tạo nội dung. Vui lòng thử lại.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

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
              <SelectValue placeholder={formData.industryId ? "Chọn danh mục" : "Chọn ngành hàng trước"} />
            </SelectTrigger>
            <SelectContent>
              {filteredCategories.map((category: any) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* AI Auto-fill Button */}
      <div className="flex justify-center py-2">
        <Button
          type="button"
          onClick={handleAIGenerate}
          disabled={isGenerating || !formData.name || !formData.categoryId}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              AI đang tạo...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              ✨ AI Tự động điền thông tin
            </>
          )}
        </Button>
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
          value={formData.images}
          onChange={(images) => setFormData((prev: any) => ({ ...prev, images }))}
          maxFiles={10}
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
        <Label htmlFor="itemCode">Mã sản phẩm</Label>
        <div className="flex gap-2">
          <Input
            id="itemCode"
            value={formData.itemCode}
            onChange={(e) => setFormData((prev: any) => ({ ...prev, itemCode: e.target.value }))}
            placeholder="Nhập hoặc quét mã"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsQRScannerOpen(true)}
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Slug */}
      <div>
        <Label htmlFor="slug">Slug (URL)</Label>
        <Input
          id="slug"
          value={formData.slug}
          onChange={(e) => setFormData((prev: any) => ({ ...prev, slug: e.target.value }))}
          placeholder="san-pham-mau"
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
              <SelectItem value="count">Đếm (cái, chiếc)</SelectItem>
              <SelectItem value="weight">Cân nặng (kg, g)</SelectItem>
              <SelectItem value="volume">Thể tích (l, ml)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="unit">Đơn vị</Label>
          <Input
            id="unit"
            value={formData.unit}
            onChange={(e) => setFormData((prev: any) => ({ ...prev, unit: e.target.value }))}
            placeholder="cái, kg, l..."
          />
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
        Cấu hình marketing và khuyến mãi
      </div>
      
      {/* Original Price & Fake Sales Count */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="originalPrice">Giá gốc (hiển thị giảm giá)</Label>
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
          <Label htmlFor="fakeSalesCount">Lượt bán giả</Label>
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
      <div className="grid grid-cols-2 gap-4 pt-4 border-t">
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <Label htmlFor="isNew" className="cursor-pointer">
            🆕 Sản phẩm mới
          </Label>
          <Switch
            id="isNew"
            checked={formData.isNew}
            onCheckedChange={(checked) => setFormData((prev: any) => ({ ...prev, isNew: checked }))}
          />
        </div>

        <div className="flex items-center justify-between p-3 border rounded-lg">
          <Label htmlFor="isTopseller" className="cursor-pointer">
            🔥 Bán chạy
          </Label>
          <Switch
            id="isTopseller"
            checked={formData.isTopseller}
            onCheckedChange={(checked) => setFormData((prev: any) => ({ ...prev, isTopseller: checked }))}
          />
        </div>

        <div className="flex items-center justify-between p-3 border rounded-lg">
          <Label htmlFor="isFreeshipping" className="cursor-pointer">
            🚚 Miễn phí ship
          </Label>
          <Switch
            id="isFreeshipping"
            checked={formData.isFreeshipping}
            onCheckedChange={(checked) => setFormData((prev: any) => ({ ...prev, isFreeshipping: checked }))}
          />
        </div>

        <div className="flex items-center justify-between p-3 border rounded-lg">
          <Label htmlFor="isBestseller" className="cursor-pointer">
            ⭐ Bestseller
          </Label>
          <Switch
            id="isBestseller"
            checked={formData.isBestseller}
            onCheckedChange={(checked) => setFormData((prev: any) => ({ ...prev, isBestseller: checked }))}
          />
        </div>
      </div>
    </div>
  );
}

// SEO Tab
function SEOTab({ formData, setFormData, tags }: any) {
  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 mb-4">
        Tối ưu hóa công cụ tìm kiếm (SEO)
      </div>
      
      {/* SEO Title */}
      <div>
        <Label htmlFor="seoTitle">SEO Title</Label>
        <Input
          id="seoTitle"
          value={formData.seoTitle}
          onChange={(e) => setFormData((prev: any) => ({ ...prev, seoTitle: e.target.value }))}
          placeholder="Tiêu đề tối ưu cho SEO"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Tối ưu: 50-60 ký tự
        </p>
      </div>

      {/* SEO Description */}
      <div>
        <Label htmlFor="seoDescription">SEO Description</Label>
        <Textarea
          id="seoDescription"
          value={formData.seoDescription}
          onChange={(e) => setFormData((prev: any) => ({ ...prev, seoDescription: e.target.value }))}
          placeholder="Mô tả meta cho SEO"
          rows={3}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Tối ưu: 150-160 ký tự
        </p>
      </div>

      {/* OG Image URL */}
      <div>
        <Label htmlFor="ogImageUrl">OG Image URL (Social Sharing)</Label>
        <Input
          id="ogImageUrl"
          value={formData.ogImageUrl}
          onChange={(e) => setFormData((prev: any) => ({ ...prev, ogImageUrl: e.target.value }))}
          placeholder="https://example.com/og-image.jpg"
        />
      </div>

      {/* Tags Selector */}
      <div className="pt-4 border-t">
        <Label className="flex items-center gap-2 mb-2">
          <Tag className="h-4 w-4" />
          Tags
        </Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-60 overflow-y-auto p-3 border rounded-lg">
          {tags.map((tag: Tag) => (
            <div key={tag.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                id={`tag-${tag.id}`}
                checked={formData.tagIds?.includes(tag.id)}
                onChange={(e) => {
                  const newTagIds = e.target.checked
                    ? [...(formData.tagIds || []), tag.id]
                    : formData.tagIds?.filter((id: string) => id !== tag.id) || [];
                  setFormData((prev: any) => ({ ...prev, tagIds: newTagIds }));
                }}
                className="rounded"
              />
              <Label htmlFor={`tag-${tag.id}`} className="text-sm cursor-pointer">
                {tag.name}
              </Label>
            </div>
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

// AI FAQ Tab - Enhanced with form fields
function AIFAQTab({ formData, setFormData }: any) {
  const { toast } = useToast();
  const [faqs, setFaqs] = useState<ProductFAQ[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Load FAQ data from formData.smartFaq
  useEffect(() => {
    if (formData.smartFaq) {
      try {
        if (Array.isArray(formData.smartFaq)) {
          setFaqs(formData.smartFaq);
        } else if (typeof formData.smartFaq === 'object' && formData.smartFaq.questions && formData.smartFaq.answers) {
          // Convert old format to new format
          const converted: ProductFAQ[] = [];
          const questions = formData.smartFaq.questions || [];
          const answers = formData.smartFaq.answers || [];
          for (let i = 0; i < Math.min(questions.length, answers.length); i++) {
            converted.push({
              question: questions[i],
              answer: answers[i]
            });
          }
          setFaqs(converted);
        }
      } catch (err) {
        console.error('Error parsing FAQ data:', err);
      }
    }
  }, [formData.smartFaq]);

  // Update formData when FAQs change
  useEffect(() => {
    setFormData((prev: any) => ({ ...prev, smartFaq: faqs }));
  }, [faqs, setFormData]);

  const handleGenerateFAQs = async () => {
    if (!formData.name) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng nhập tên sản phẩm trước khi tạo FAQ",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const { generateProductFAQs } = await import('@/lib/gemini');
      const generatedFaqs = await generateProductFAQs(
        formData.name,
        formData.description || '',
        formData.categoryId || 'general',
        ''
      );
      
      setFaqs(generatedFaqs);
      toast({
        title: "Thành công",
        description: `Đã tạo ${generatedFaqs.length} câu hỏi FAQ tự động`
      });
    } catch (error) {
      console.error('Error generating FAQs:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tạo FAQ tự động. Vui lòng thử lại.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const addFAQ = () => {
    setFaqs([...faqs, { question: '', answer: '' }]);
  };

  const removeFAQ = (index: number) => {
    setFaqs(faqs.filter((_, i) => i !== index));
  };

  const updateFAQ = (index: number, field: 'question' | 'answer', value: string) => {
    const updated = [...faqs];
    updated[index][field] = value;
    setFaqs(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b pb-2">
        <div className="text-sm text-gray-600">
          Cấu hình Smart FAQ cho AI chatbot
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleGenerateFAQs}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Đang tạo...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                AI Tạo FAQ
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addFAQ}
          >
            <Plus className="h-4 w-4 mr-2" />
            Thêm FAQ
          </Button>
        </div>
      </div>

      {faqs.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed">
          <p className="text-gray-500 mb-2">Chưa có FAQ</p>
          <p className="text-sm text-gray-400">Nhấn "AI Tạo FAQ" để tự động tạo hoặc "Thêm FAQ" để nhập thủ công</p>
        </div>
      ) : (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {faqs.map((faq, index) => (
            <div key={index} className="p-4 border rounded-lg bg-white space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm text-gray-600">FAQ #{index + 1}</h4>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFAQ(index)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div>
                <Label htmlFor={`faq-question-${index}`} className="text-sm">
                  Câu hỏi <span className="text-red-500">*</span>
                </Label>
                <Input
                  id={`faq-question-${index}`}
                  value={faq.question}
                  onChange={(e) => updateFAQ(index, 'question', e.target.value)}
                  placeholder="Ví dụ: Sản phẩm này có nguồn gốc từ đâu?"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor={`faq-answer-${index}`} className="text-sm">
                  Trả lời <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id={`faq-answer-${index}`}
                  value={faq.answer}
                  onChange={(e) => updateFAQ(index, 'answer', e.target.value)}
                  placeholder="Nhập câu trả lời chi tiết..."
                  rows={3}
                  className="mt-1"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-sm text-blue-700">
          💡 <strong>Gợi ý:</strong> FAQ giúp khách hàng hiểu rõ hơn về sản phẩm. 
          Sử dụng AI để tạo tự động hoặc thêm thủ công các câu hỏi thường gặp.
        </p>
      </div>
    </div>
  );
}
