import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Edit3, Trash2, Eye, Grid3X3, List, RefreshCw } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { ProductFormTabbed as ProductForm } from "@/components/ProductFormTabbed";
import type { CloudinaryImage, CloudinaryVideo } from "@shared/schema";
import { trackProductView, trackSearch, trackCategoryBrowse, trackCustomEvent } from "@/lib/analytics";

interface Product {
  id: string;
  name: string;
  description?: string;
  sku?: string; // Auto-generated SKU
  price: string;
  stock: number;
  categoryId?: string;
  categoryName?: string;
  status: "active" | "inactive" | "out-of-stock";
  image?: string; // Legacy field for backward compatibility
  images?: CloudinaryImage[];
  videos?: CloudinaryVideo[];
  createdAt?: string;
  updatedAt?: string;
}

interface Category {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
}

export default function Products() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table'); // Default to table view
  const [editingField, setEditingField] = useState<{productId: string, field: 'price' | 'stock', value: string} | null>(null);

  // Fetch products with categories
  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ['/api/products', { withCategories: true }],
    queryFn: async () => {
      const res = await fetch(`/api/products?withCategories=true&_t=${Date.now()}`, {
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache',
        }
      });
      if (!res.ok) {
        throw new Error(`Failed to fetch products: ${res.status}`);
      }
      return res.json();
    },
  });

  // Fetch categories for filter
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
    queryFn: async () => {
      const res = await fetch(`/api/categories?_t=${Date.now()}`, {
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache',
        }
      });
      if (!res.ok) {
        throw new Error(`Failed to fetch categories: ${res.status}`);
      }
      return res.json();
    },
  });

  // Delete product mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log('🗑️ Attempting to delete product with ID:', id);
      const url = `/api/products/${id}`;
      console.log('🔗 DELETE URL:', url);
      
      const response = await fetch(url, {
        method: 'DELETE',
      });
      
      console.log('📡 DELETE response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ DELETE failed:', errorText);
        throw new Error(`Failed to delete: ${response.status} ${errorText}`);
      }
      
      // For 204 No Content, don't try to parse JSON
      if (response.status === 204) {
        return { success: true };
      }
      return response.json();
    },
    onSuccess: (_, productId) => {
      // Track successful product deletion
      trackCustomEvent('product_deleted', {
        product_id: productId,
        event_label: 'admin_product_management'
      });
      toast({
        title: "Thành công",
        description: "Sản phẩm đã được xóa",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
    },
    onError: () => {
      toast({
        title: "Lỗi",
        description: "Không thể xóa sản phẩm",
        variant: "destructive",
      });
    },
  });

  // Update product field mutation (price, stock)
  const updateFieldMutation = useMutation({
    mutationFn: async ({ id, field, value }: { id: string, field: string, value: string | number }) => {
      const response = await apiRequest('PUT', `/api/products/${id}`, {
        [field]: value
      });
      return response.json();
    },
    onSuccess: (data, { id, field, value }) => {
      // Track field update
      trackCustomEvent('product_field_updated', {
        product_id: id,
        field_name: field,
        new_value: value,
        event_label: 'admin_product_edit'
      });
      toast({
        title: "Cập nhật thành công",
        description: `Đã cập nhật ${field === 'price' ? 'giá' : 'tồn kho'}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      setEditingField(null);
    },
    onError: () => {
      toast({
        title: "Lỗi cập nhật",
        description: "Không thể cập nhật sản phẩm",
        variant: "destructive",
      });
      setEditingField(null);
    },
  });

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(parseFloat(price));
  };

  const getStatusBadge = (status: string, stock: number) => {
    if (status === "out-of-stock" || stock === 0) {
      return <Badge variant="destructive">Hết hàng</Badge>;
    }
    if (stock < 5) {
      return <Badge variant="secondary">Sắp hết</Badge>;
    }
    return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">Còn hàng</Badge>;
  };

  const handleDelete = (product: Product) => {
    if (window.confirm(`Bạn có chắc muốn xóa sản phẩm "${product.name}"?`)) {
      // Track admin action - NOT e-commerce event
      trackCustomEvent('admin_product_delete_attempt', {
        product_id: product.id,
        product_name: product.name,
        event_label: 'admin_product_management'
      });
      deleteMutation.mutate(product.id);
    }
  };

  const handleEdit = (product: Product) => {
    // Track admin action - NOT e-commerce event
    trackCustomEvent('admin_product_edit_open', {
      product_id: product.id,
      product_name: product.name,
      event_label: 'admin_product_management'
    });
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const handleCreate = () => {
    setEditingProduct(null);
    setShowProductForm(true);
  };

  const handleFieldEdit = (productId: string, field: 'price' | 'stock', currentValue: string | number) => {
    setEditingField({
      productId,
      field,
      value: currentValue.toString()
    });
  };

  const handleFieldSave = (productId: string, field: 'price' | 'stock', value: string) => {
    if (!value.trim()) {
      setEditingField(null);
      return;
    }
    
    const parsedValue = field === 'price' ? value : parseInt(value);
    if (field === 'stock' && isNaN(parsedValue as number)) {
      toast({
        title: "Lỗi",
        description: "Tồn kho phải là số",
        variant: "destructive",
      });
      setEditingField(null);
      return;
    }
    
    updateFieldMutation.mutate({
      id: productId,
      field,
      value: parsedValue
    });
  };

  const handleFieldCancel = () => {
    setEditingField(null);
  };

  // Filter products
  const filteredProducts = products.filter((product: Product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Track search events
  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    if (term.length >= 3) {
      // Calculate fresh filtered results for accurate count
      const searchResults = products.filter((product: Product) => {
        const matchesSearch = product.name.toLowerCase().includes(term.toLowerCase()) ||
                             product.description?.toLowerCase().includes(term.toLowerCase());
        const matchesCategory = selectedCategory === "all" || product.categoryId === selectedCategory;
        return matchesSearch && matchesCategory;
      });
      trackSearch(term, searchResults.length);
    }
  };

  // Track category browsing
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    if (categoryId !== "all") {
      const category = categories.find(c => c.id === categoryId);
      if (category) {
        trackCategoryBrowse(category.name, categoryId);
      }
    }
  };

  if (productsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Đang tải sản phẩm...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl" data-testid="page-products">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Quản lý sản phẩm</h1>
          <p className="text-muted-foreground">
            Quản lý danh sách sản phẩm và thông tin chi tiết
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleCreate} data-testid="button-add-product">
            <Plus className="h-4 w-4 mr-2" />
            Thêm sản phẩm
          </Button>
          
          {/* View Toggle */}
          <div className="flex bg-muted p-1 rounded-lg">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="h-8"
              title="Xem dạng ô"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
              className="h-8"
              title="Xem dạng bảng"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="products-search"
                name="products-search"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
                data-testid="input-search"
              />
            </div>
            <Select value={selectedCategory} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-full md:w-48" data-testid="select-category-filter">
                <SelectValue placeholder="Lọc theo danh mục" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả danh mục</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid or Table */}
      {productsLoading ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="animate-spin mx-auto mb-4 w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
            <p className="text-muted-foreground">Đang tải sản phẩm...</p>
          </CardContent>
        </Card>
      ) : filteredProducts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="mb-4">
              <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                <Plus className="h-8 w-8 text-muted-foreground" />
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2">Không tìm thấy sản phẩm</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || selectedCategory !== "all" 
                ? "Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc" 
                : "Thêm sản phẩm đầu tiên để bắt đầu"}
            </p>
            {!searchTerm && selectedCategory === "all" && (
              <Button onClick={handleCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Thêm sản phẩm đầu tiên
              </Button>
            )}
          </CardContent>
        </Card>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Hình</TableHead>
                <TableHead>Tên</TableHead>
                <TableHead className="w-24">SKU</TableHead>
                <TableHead className="w-32">Giá</TableHead>
                <TableHead className="w-24">Tồn kho</TableHead>
                <TableHead className="w-32">Danh mục</TableHead>
                <TableHead className="w-20">Trạng thái</TableHead>
                <TableHead className="w-20">Sửa</TableHead>
                <TableHead className="w-20">Xóa</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product: Product) => (
                <TableRow key={product.id}>
                  {/* Product Image */}
                  <TableCell>
                    <div className="w-12 h-12 bg-muted rounded-lg overflow-hidden">
                      {product.images && product.images.length > 0 ? (
                        <img 
                          src={product.images[0].secure_url} 
                          alt={product.images[0].alt || product.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : product.image && product.image !== 'https://via.placeholder.com/300x300' ? (
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                          N/A
                        </div>
                      )}
                    </div>
                  </TableCell>
                  
                  {/* Product Name */}
                  <TableCell>
                    <div className="font-medium">{product.name}</div>
                    {product.description && (
                      <div className="text-sm text-muted-foreground truncate max-w-xs">
                        {product.description}
                      </div>
                    )}
                  </TableCell>
                  
                  {/* SKU */}
                  <TableCell>
                    <span className="font-mono text-sm text-primary">{product.sku || 'N/A'}</span>
                  </TableCell>
                  
                  {/* Price - Inline Editable */}
                  <TableCell>
                    {editingField?.productId === product.id && editingField.field === 'price' ? (
                      <div className="flex gap-1">
                        <Input
                          type="text"
                          value={editingField.value}
                          onChange={(e) => setEditingField({...editingField, value: e.target.value})}
                          onBlur={() => handleFieldSave(product.id, 'price', editingField.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleFieldSave(product.id, 'price', editingField.value);
                            if (e.key === 'Escape') handleFieldCancel();
                          }}
                          className="w-24 h-8 text-sm"
                          autoFocus
                        />
                        {updateFieldMutation.isPending && (
                          <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
                        )}
                      </div>
                    ) : (
                      <button 
                        className="text-left hover:bg-muted p-1 rounded transition-colors font-semibold text-green-600"
                        onClick={() => handleFieldEdit(product.id, 'price', product.price)}
                        title="Click để sửa giá"
                      >
                        {formatPrice(product.price)}
                      </button>
                    )}
                  </TableCell>
                  
                  {/* Stock - Inline Editable */}
                  <TableCell>
                    {editingField?.productId === product.id && editingField.field === 'stock' ? (
                      <div className="flex gap-1">
                        <Input
                          type="number"
                          value={editingField.value}
                          onChange={(e) => setEditingField({...editingField, value: e.target.value})}
                          onBlur={() => handleFieldSave(product.id, 'stock', editingField.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleFieldSave(product.id, 'stock', editingField.value);
                            if (e.key === 'Escape') handleFieldCancel();
                          }}
                          className="w-20 h-8 text-sm"
                          autoFocus
                        />
                        {updateFieldMutation.isPending && (
                          <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
                        )}
                      </div>
                    ) : (
                      <button 
                        className="text-left hover:bg-muted p-1 rounded transition-colors"
                        onClick={() => handleFieldEdit(product.id, 'stock', product.stock)}
                        title="Click để sửa tồn kho"
                      >
                        {product.stock}
                      </button>
                    )}
                  </TableCell>
                  
                  {/* Category */}
                  <TableCell>
                    <span className="text-sm">{product.categoryName || 'Chưa phân loại'}</span>
                  </TableCell>
                  
                  {/* Status */}
                  <TableCell>
                    {getStatusBadge(product.status, product.stock)}
                  </TableCell>
                  
                  {/* Edit Button */}
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(product)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                  
                  {/* Delete Button */}
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(product)}
                      disabled={deleteMutation.isPending}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product: Product) => (
            <Card key={product.id} className="hover-elevate" data-testid={`card-product-${product.id}`}>
              <CardHeader className="pb-3">
                <div className="aspect-square bg-muted rounded-lg mb-3 overflow-hidden">
                  {/* Prioritize Cloudinary images, fallback to video thumbnail, then legacy image */}
                  {product.images && product.images.length > 0 ? (
                    <img 
                      src={product.images[0].secure_url} 
                      alt={product.images[0].alt || product.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : product.videos && product.videos.length > 0 && product.videos[0].thumbnail_url ? (
                    <div className="relative w-full h-full">
                      <img 
                        src={product.videos[0].thumbnail_url} 
                        alt={product.videos[0].alt || `${product.name} - Video thumbnail`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      {/* Video play icon overlay */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20">
                        <div className="w-12 h-12 rounded-full bg-white bg-opacity-80 flex items-center justify-center">
                          <svg className="w-6 h-6 text-gray-800 ml-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                  ) : product.image && product.image !== 'https://via.placeholder.com/300x300' ? (
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-muted-foreground">Không có media</span>
                    </div>
                  )}
                </div>
                <CardTitle className="text-lg line-clamp-2">{product.name}</CardTitle>
                {product.description && (
                  <CardDescription className="line-clamp-2">
                    {product.description}
                  </CardDescription>
                )}
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-green-600">
                    {formatPrice(product.price)}
                  </span>
                  {getStatusBadge(product.status, product.stock)}
                </div>

                <div className="space-y-1 text-sm">
                  {product.sku && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">SKU:</span>
                      <span className="font-mono text-primary">{product.sku}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tồn kho:</span>
                    <span>{product.stock}</span>
                  </div>
                  {product.categoryName && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Danh mục:</span>
                      <span>{product.categoryName}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEdit(product)}
                    data-testid={`button-edit-${product.id}`}
                  >
                    <Edit3 className="h-4 w-4 mr-1" />
                    Sửa
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(product)}
                    disabled={deleteMutation.isPending}
                    data-testid={`button-delete-${product.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Show total count */}
      <div className="mt-6 text-center text-muted-foreground">
        Hiển thị {filteredProducts.length} trong tổng số {Array.isArray(products) ? products.length : 0} sản phẩm
      </div>

      {/* ProductForm modal */}
      {showProductForm && (
        <ProductForm
          product={editingProduct}
          onClose={() => {
            setShowProductForm(false);
            setEditingProduct(null);
          }}
          onSuccess={() => {
            // Optional: Add any success handling here
          }}
        />
      )}
    </div>
  );
}