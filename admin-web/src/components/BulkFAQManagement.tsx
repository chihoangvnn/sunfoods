import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDebounce } from '../hooks/use-debounce';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Bot, 
  Loader2, 
  CheckCircle, 
  XCircle, 
  Users, 
  Settings, 
  Clock,
  Bolt,
  AlertTriangle,
  RefreshCw,
  Download,
  Eye,
  Trash2,
  Search,
  Filter,
  Tag,
  X
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Product {
  id: string;
  name: string;
  categoryId: string;
  status?: string;
  category?: {
    id: string;
    name: string;
  };
}

interface Category {
  id: string;
  name: string;
}

interface BulkJob {
  id: string;
  type: string;
  status: 'started' | 'pending' | 'completed' | 'failed';
  totalProducts: number;
  completedProducts: number;
  failedProducts: number;
  startedAt: string;
  requestedBy: string;
  settings: {
    prompt: string;
    overwriteExisting: boolean;
  };
}

interface BulkProgress {
  jobId: string;
  status: string;
  totalProducts: number;
  completedProducts: number;
  failedProducts: number;
  inProgressProducts: number;
  progressPercentage: number;
  estimatedTimeRemaining: number | null;
  lastUpdated: string;
}

interface BulkResult {
  productId: string;
  productName: string;
  status: 'completed' | 'failed';
  error: string | null;
  completedAt: string | null;
  generatedFaqs: Array<{
    id: string | null;
    question: string | null;
    answer: string | null;
    status: string | null;
  }>;
}

interface BulkResponse {
  success: boolean;
  bulkJob: BulkJob;
  message: string;
  statusUrl: string;
  resultsUrl: string;
}

export function BulkFAQManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State management
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'configure' | 'progress' | 'results'>('configure');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [bulkMode, setBulkMode] = useState<'all' | 'selected'>('all');
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  
  // Product filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  
  // Form data
  const [prompt, setPrompt] = useState('Tạo 5 câu hỏi ngắn gọn về sản phẩm nhang này và trả lời chi tiết');
  const [overwriteExisting, setOverwriteExisting] = useState(false);
  
  // Fetch all products
  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ['/api/products'],
    queryFn: async () => {
      const response = await fetch('/api/products?limit=1000');
      if (!response.ok) throw new Error('Failed to fetch products');
      return response.json();
    }
  });

  // Fetch categories for filtering
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
    queryFn: async () => {
      const response = await fetch('/api/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      return response.json();
    }
  });

  // Filter products based on search and filters
  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Search filter
    if (debouncedSearchQuery.trim()) {
      const searchTerm = debouncedSearchQuery.toLowerCase();
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchTerm) ||
        product.category?.name?.toLowerCase().includes(searchTerm)
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.categoryId === selectedCategory);
    }

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(product => product.status === selectedStatus);
    }

    return filtered;
  }, [products, debouncedSearchQuery, selectedCategory, selectedStatus]);

  // Bulk generation mutation
  const startBulkGeneration = useMutation({
    mutationFn: async (data: {
      productIds: string[] | 'all';
      prompt: string;
      overwriteExisting: boolean;
    }) => {
      const response = await fetch('/api/product-faqs/bulk-autogen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to start bulk generation');
      }
      
      return response.json() as Promise<BulkResponse>;
    },
    onSuccess: (data) => {
      setCurrentJobId(data.bulkJob.id);
      setActiveTab('progress');
      toast({
        title: "Đã bắt đầu tạo FAQ hàng loạt",
        description: `Đang xử lý ${data.bulkJob.totalProducts} sản phẩm`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Progress tracking
  const { data: progress, isLoading: progressLoading } = useQuery<BulkProgress>({
    queryKey: [`/api/product-faqs/bulk-status/${currentJobId}`],
    queryFn: async () => {
      if (!currentJobId) return null;
      const response = await fetch(`/api/product-faqs/bulk-status/${currentJobId}`);
      if (!response.ok) throw new Error('Failed to fetch progress');
      const result = await response.json();
      return result.progress;
    },
    enabled: !!currentJobId,
    refetchInterval: currentJobId && activeTab === 'progress' ? 2000 : false, // Refetch every 2 seconds when viewing progress
  });

  // Results fetching
  const { data: results, isLoading: resultsLoading } = useQuery<{
    success: boolean;
    bulkJobId: string;
    totalProducts: number;
    completedProducts: number;
    failedProducts: number;
    results: BulkResult[];
  }>({
    queryKey: [`/api/product-faqs/bulk-results/${currentJobId}`],
    queryFn: async () => {
      if (!currentJobId) return null;
      const response = await fetch(`/api/product-faqs/bulk-results/${currentJobId}`);
      if (!response.ok) throw new Error('Failed to fetch results');
      return response.json();
    },
    enabled: !!currentJobId && activeTab === 'results',
  });

  const handleStartGeneration = () => {
    if (!prompt.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập prompt để tạo FAQ",
        variant: "destructive",
      });
      return;
    }

    // Determine the actual product IDs to process
    let productIds: string[] | 'all';
    
    if (bulkMode === 'all') {
      // Check if any filters are applied
      const hasFilters = searchQuery.trim() || selectedCategory !== 'all' || selectedStatus !== 'all';
      
      if (hasFilters) {
        // Use filtered products when filters are applied
        productIds = filteredProducts.map(p => p.id);
        if (productIds.length === 0) {
          toast({
            title: "Lỗi",
            description: "Không có sản phẩm nào phù hợp với bộ lọc hiện tại",
            variant: "destructive",
          });
          return;
        }
      } else {
        // No filters applied, process all products
        productIds = 'all';
      }
    } else {
      // Selected mode - use manually selected products
      productIds = selectedProducts;
      if (productIds.length === 0) {
        toast({
          title: "Lỗi", 
          description: "Vui lòng chọn ít nhất 1 sản phẩm",
          variant: "destructive",
        });
        return;
      }
    }

    startBulkGeneration.mutate({
      productIds,
      prompt: prompt.trim(),
      overwriteExisting
    });
  };

  const handleProductToggle = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAll = () => {
    setSelectedProducts(filteredProducts.map(p => p.id));
  };

  const handleDeselectAll = () => {
    setSelectedProducts([]);
  };

  const resetDialog = () => {
    setActiveTab('configure');
    setCurrentJobId(null);
    setSelectedProducts([]);
    setBulkMode('all');
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedStatus('all');
    setPrompt('Tạo 5 câu hỏi ngắn gọn về sản phẩm nhang này và trả lời chi tiết');
    setOverwriteExisting(false);
  };

  // Auto-switch to results when job completes
  useEffect(() => {
    if (progress?.status === 'completed' || progress?.status === 'failed') {
      setActiveTab('results');
    }
  }, [progress?.status]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) {
        resetDialog();
      }
    }}>
      <DialogTrigger asChild>
        <Button 
          className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg"
        >
          <Bolt className="h-4 w-4" />
          🚀 Tạo FAQ hàng loạt
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col">
        <DialogHeader className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b pb-3">
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-purple-600" />
            Tạo FAQ hàng loạt bằng AI
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto pt-3">
          <Tabs value={activeTab} onValueChange={(tab) => setActiveTab(tab as 'configure' | 'progress' | 'results')} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="configure" className="gap-2">
              <Settings className="h-4 w-4" />
              Cấu hình
            </TabsTrigger>
            <TabsTrigger value="progress" disabled={!currentJobId} className="gap-2">
              <Clock className="h-4 w-4" />
              Tiến độ
            </TabsTrigger>
            <TabsTrigger value="results" disabled={!currentJobId} className="gap-2">
              <Eye className="h-4 w-4" />
              Kết quả
            </TabsTrigger>
          </TabsList>

          {/* Configuration Tab */}
          <TabsContent value="configure" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Product Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Chọn sản phẩm
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Bulk Mode Selection */}
                  <div className="space-y-3">
                    <Label>Phạm vi tạo FAQ</Label>
                    <Select value={bulkMode} onValueChange={(value: 'all' | 'selected') => setBulkMode(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">
                          <div className="flex items-center gap-2">
                            <Bolt className="h-4 w-4" />
                            Tất cả sản phẩm ({products.length})
                          </div>
                        </SelectItem>
                        <SelectItem value="selected">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Chọn sản phẩm cụ thể
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Product Selection (when selected mode) */}
                  {bulkMode === 'selected' && (
                    <div className="space-y-3">
                      {/* Search and Filters */}
                      <div className="space-y-3 border-b pb-3">
                        {/* Search Input */}
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <Input
                            type="text"
                            placeholder="Tìm kiếm sản phẩm..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-10"
                          />
                          {searchQuery && (
                            <button
                              onClick={() => setSearchQuery('')}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        {/* Filters */}
                        <div className="grid grid-cols-2 gap-3">
                          {/* Category Filter */}
                          <div className="space-y-1">
                            <Label className="text-xs text-gray-500">Danh mục</Label>
                            <Select value={selectedCategory} onValueChange={(value: string) => setSelectedCategory(value)}>
                              <SelectTrigger className="h-8 text-sm">
                                <SelectValue placeholder="Chọn danh mục" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">
                                  <div className="flex items-center gap-2">
                                    <Tag className="h-3 w-3" />
                                    Tất cả danh mục
                                  </div>
                                </SelectItem>
                                {categories.map(category => (
                                  <SelectItem key={category.id} value={category.id}>
                                    {category.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Status Filter */}
                          <div className="space-y-1">
                            <Label className="text-xs text-gray-500">Trạng thái</Label>
                            <Select value={selectedStatus} onValueChange={(value: string) => setSelectedStatus(value)}>
                              <SelectTrigger className="h-8 text-sm">
                                <SelectValue placeholder="Chọn trạng thái" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">
                                  <div className="flex items-center gap-2">
                                    <Filter className="h-3 w-3" />
                                    Tất cả trạng thái
                                  </div>
                                </SelectItem>
                                <SelectItem value="active">Đang hoạt động</SelectItem>
                                <SelectItem value="draft">Nháp</SelectItem>
                                <SelectItem value="inactive">Tạm ngưng</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Filter Summary */}
                        {(searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all') && (
                          <div className="flex items-center gap-2 text-xs">
                            <Badge variant="secondary" className="text-xs">
                              {filteredProducts.length}/{products.length} sản phẩm
                            </Badge>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => {
                                setSearchQuery('');
                                setSelectedCategory('all');
                                setSelectedStatus('all');
                              }}
                              className="h-6 px-2 text-xs"
                            >
                              <X className="h-3 w-3 mr-1" />
                              Xóa bộ lọc
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Product List Header */}
                      <div className="flex justify-between items-center">
                        <Label>Sản phẩm được chọn ({selectedProducts.length}/{filteredProducts.length})</Label>
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={handleSelectAll}
                            disabled={productsLoading || filteredProducts.length === 0}
                          >
                            Chọn tất cả
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={handleDeselectAll}
                            disabled={selectedProducts.length === 0}
                          >
                            Bỏ chọn
                          </Button>
                        </div>
                      </div>

                      {/* Product List */}
                      <div className="border rounded-lg p-3 max-h-60 overflow-y-auto space-y-2">
                        {productsLoading ? (
                          <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin" />
                          </div>
                        ) : filteredProducts.length === 0 ? (
                          <div className="text-center py-8 text-gray-500">
                            <div className="text-sm">Không tìm thấy sản phẩm phù hợp</div>
                            <div className="text-xs mt-1">Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm</div>
                          </div>
                        ) : (
                          filteredProducts.map(product => (
                            <div key={product.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                              <Checkbox
                                checked={selectedProducts.includes(product.id)}
                                onCheckedChange={() => handleProductToggle(product.id)}
                              />
                              <div className="flex-1">
                                <div className="font-medium text-sm">{product.name}</div>
                                <div className="text-xs text-gray-500 flex items-center gap-2">
                                  <span>{product.category?.name || 'Không có danh mục'}</span>
                                  {product.status && (
                                    <Badge variant="outline" className="text-xs px-1 py-0">
                                      {product.status === 'active' ? 'Hoạt động' : 
                                       product.status === 'draft' ? 'Nháp' : 
                                       product.status === 'inactive' ? 'Tạm ngưng' : product.status}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {/* Summary */}
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="text-sm font-medium text-blue-800">
                      Sẽ tạo FAQ cho: {bulkMode === 'all' ? filteredProducts.length : selectedProducts.length} sản phẩm
                    </div>
                    <div className="text-xs text-blue-600">
                      Ước tính thời gian: ~{Math.ceil((bulkMode === 'all' ? filteredProducts.length : selectedProducts.length) * 0.5)} phút
                    </div>
                    {bulkMode === 'all' && filteredProducts.length < products.length && (
                      <div className="text-xs text-orange-600 mt-1">
                        ✅ Chỉ xử lý: {filteredProducts.length}/{products.length} sản phẩm (theo bộ lọc)
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Right Column - Generation Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="h-5 w-5" />
                    Cài đặt AI
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Prompt */}
                  <div className="space-y-2">
                    <Label htmlFor="bulk-prompt">Prompt cho AI</Label>
                    <Textarea
                      id="bulk-prompt"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="min-h-[100px] font-mono text-sm"
                      placeholder="Nhập prompt để tạo FAQ..."
                    />
                    <p className="text-xs text-gray-500">
                      💡 Prompt này sẽ được áp dụng cho tất cả sản phẩm được chọn
                    </p>
                  </div>

                  {/* Options */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="overwrite"
                        checked={overwriteExisting}
                        onCheckedChange={(checked) => setOverwriteExisting(checked === true)}
                      />
                      <Label htmlFor="overwrite" className="text-sm">
                        Ghi đè FAQ hiện có
                      </Label>
                    </div>
                    <p className="text-xs text-gray-500 ml-6">
                      {overwriteExisting 
                        ? '⚠️ FAQ cũ sẽ bị thay thế bằng FAQ mới'
                        : '✅ Chỉ tạo FAQ cho sản phẩm chưa có FAQ'
                      }
                    </p>
                  </div>

                  {/* Start Button */}
                  <div className="pt-4">
                    <Button
                      onClick={handleStartGeneration}
                      disabled={startBulkGeneration.isPending || !prompt.trim()}
                      className="w-full gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                      size="lg"
                    >
                      {startBulkGeneration.isPending ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Đang khởi động...
                        </>
                      ) : (
                        <>
                          <Bolt className="h-5 w-5" />
                          🚀 Bắt đầu tạo FAQ
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress" className="space-y-6">
            {progressLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : progress ? (
              <div className="space-y-6">
                {/* Progress Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Tiến độ xử lý
                      </div>
                      <Badge variant={
                        progress.status === 'completed' ? 'default' :
                        progress.status === 'failed' ? 'destructive' : 'secondary'
                      }>
                        {progress.status === 'completed' ? 'Hoàn thành' :
                         progress.status === 'failed' ? 'Thất bại' :
                         progress.status === 'pending' ? 'Đang chờ' : 'Đang xử lý'}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Tiến độ</span>
                        <span>{progress.progressPercentage}%</span>
                      </div>
                      <Progress value={progress.progressPercentage} className="h-3" />
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-blue-50 p-3 rounded-lg text-center">
                        <div className="text-2xl font-bold text-blue-700">{progress.totalProducts}</div>
                        <div className="text-xs text-blue-600">Tổng cộng</div>
                      </div>
                      <div className="bg-green-50 p-3 rounded-lg text-center">
                        <div className="text-2xl font-bold text-green-700">{progress.completedProducts}</div>
                        <div className="text-xs text-green-600">Hoàn thành</div>
                      </div>
                      <div className="bg-yellow-50 p-3 rounded-lg text-center">
                        <div className="text-2xl font-bold text-yellow-700">{progress.inProgressProducts}</div>
                        <div className="text-xs text-yellow-600">Đang xử lý</div>
                      </div>
                      <div className="bg-red-50 p-3 rounded-lg text-center">
                        <div className="text-2xl font-bold text-red-700">{progress.failedProducts}</div>
                        <div className="text-xs text-red-600">Thất bại</div>
                      </div>
                    </div>

                    {/* Time Estimate */}
                    {progress.estimatedTimeRemaining && (
                      <div className="text-sm text-gray-600 text-center">
                        Ước tính thời gian còn lại: {Math.ceil(progress.estimatedTimeRemaining / 60)} phút
                      </div>
                    )}

                    {/* Last Updated */}
                    <div className="text-xs text-gray-500 text-center">
                      Cập nhật lần cuối: {new Date(progress.lastUpdated).toLocaleString('vi-VN')}
                    </div>
                  </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex justify-center gap-3">
                  <Button
                    variant="outline"
                    onClick={() => queryClient.invalidateQueries({ 
                      queryKey: [`/api/product-faqs/bulk-status/${currentJobId}`] 
                    })}
                    className="gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Làm mới
                  </Button>
                  
                  {(progress.status === 'completed' || progress.status === 'failed') && (
                    <Button
                      onClick={() => setActiveTab('results')}
                      className="gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      Xem kết quả
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                Không có dữ liệu tiến độ
              </div>
            )}
          </TabsContent>

          {/* Results Tab */}
          <TabsContent value="results" className="space-y-6">
            {resultsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : results ? (
              <div className="space-y-6">
                {/* Results Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      Tổng kết kết quả
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-700">{results.totalProducts}</div>
                        <div className="text-sm text-gray-600">Tổng số sản phẩm</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-700">{results.completedProducts}</div>
                        <div className="text-sm text-gray-600">Thành công</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-700">{results.failedProducts}</div>
                        <div className="text-sm text-gray-600">Thất bại</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Results List */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Eye className="h-5 w-5" />
                        Chi tiết kết quả
                      </div>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Download className="h-4 w-4" />
                        Xuất báo cáo
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {results.results.map((result, index) => (
                        <div
                          key={`${result.productId}-${index}`}
                          className={`p-4 border rounded-lg ${
                            result.status === 'completed' 
                              ? 'border-green-200 bg-green-50' 
                              : 'border-red-200 bg-red-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="font-medium">{result.productName}</div>
                              <div className="text-sm text-gray-600">{result.productId}</div>
                              {result.error && (
                                <div className="text-sm text-red-600 mt-1 bg-red-100 p-2 rounded">
                                  <AlertTriangle className="h-4 w-4 inline mr-1" />
                                  {result.error}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {result.status === 'completed' ? (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                              ) : (
                                <XCircle className="h-5 w-5 text-red-600" />
                              )}
                              <Badge variant={result.status === 'completed' ? 'default' : 'destructive'}>
                                {result.status === 'completed' ? 'Thành công' : 'Thất bại'}
                              </Badge>
                            </div>
                          </div>
                          {result.completedAt && (
                            <div className="text-xs text-gray-500 mt-2">
                              Hoàn thành: {new Date(result.completedAt).toLocaleString('vi-VN')}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex justify-center gap-3">
                  <Button
                    variant="outline"
                    onClick={resetDialog}
                    className="gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Tạo job mới
                  </Button>
                  
                  <Button
                    onClick={() => {
                      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
                      toast({
                        title: "Thành công",
                        description: "Đã làm mới danh sách sản phẩm",
                      });
                    }}
                    className="gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Làm mới danh sách
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                Không có kết quả
              </div>
            )}
          </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}