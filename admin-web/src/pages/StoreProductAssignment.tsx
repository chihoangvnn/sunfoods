import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Package, Store, DollarSign, Star, Save, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Product {
  id: string;
  name: string;
  sku: string | null;
  price: string;
  stock: number;
}

interface Store {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
}

interface Assignment {
  storeId: string;
  productId: string;
  storeName: string;
  productName: string;
  priceOverride: string | null;
  isFeatured: boolean;
  sortOrder: number;
  isActive: boolean;
}

export default function StoreProductAssignment() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [productSearch, setProductSearch] = useState("");
  
  // State Management: Track assignments, price overrides, and featured status
  const [assignments, setAssignments] = useState<Map<string, Set<string>>>(new Map());
  const [priceOverrides, setPriceOverrides] = useState<Map<string, Map<string, string>>>(new Map());
  const [featuredStatus, setFeaturedStatus] = useState<Map<string, Map<string, boolean>>>(new Map());
  
  // Track initial state for comparison
  const [initialAssignments, setInitialAssignments] = useState<Map<string, Set<string>>>(new Map());
  const [initialPriceOverrides, setInitialPriceOverrides] = useState<Map<string, Map<string, string>>>(new Map());
  const [initialFeaturedStatus, setInitialFeaturedStatus] = useState<Map<string, Map<string, boolean>>>(new Map());

  // Fetch stores
  const { data: storesData, isLoading: storesLoading } = useQuery<{ stores: Store[] }>({
    queryKey: ["/api/stores"],
  });

  // Fetch products
  const { data: productsData, isLoading: productsLoading } = useQuery<{ success: boolean; products: Product[] }>({
    queryKey: ["/api/products/admin/all"],
  });

  // Fetch assignments
  const { data: assignmentsData, isLoading: assignmentsLoading, refetch: refetchAssignments } = useQuery<Assignment[]>({
    queryKey: ["/api/stores/admin/store-products/assignments"],
  });

  const stores = storesData?.stores || [];
  const products = productsData?.products || [];
  const currentAssignments = assignmentsData || [];

  // Initialize state from fetched assignments
  useEffect(() => {
    if (currentAssignments.length > 0) {
      const assignmentMap = new Map<string, Set<string>>();
      const priceMap = new Map<string, Map<string, string>>();
      const featuredMap = new Map<string, Map<string, boolean>>();

      currentAssignments.forEach((assignment) => {
        const { productId, storeId, priceOverride, isFeatured } = assignment;
        
        if (!assignmentMap.has(productId)) {
          assignmentMap.set(productId, new Set());
        }
        assignmentMap.get(productId)!.add(storeId);

        if (priceOverride) {
          if (!priceMap.has(productId)) {
            priceMap.set(productId, new Map());
          }
          priceMap.get(productId)!.set(storeId, priceOverride);
        }

        if (isFeatured) {
          if (!featuredMap.has(productId)) {
            featuredMap.set(productId, new Map());
          }
          featuredMap.get(productId)!.set(storeId, isFeatured);
        }
      });

      setAssignments(new Map(assignmentMap));
      setPriceOverrides(new Map(priceMap));
      setFeaturedStatus(new Map(featuredMap));
      
      // Save as initial state
      setInitialAssignments(new Map(assignmentMap));
      setInitialPriceOverrides(new Map(priceMap));
      setInitialFeaturedStatus(new Map(featuredMap));
    }
  }, [currentAssignments]);

  // Filter products
  const filteredProducts = products.filter(p => 
    productSearch === "" || 
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.sku?.toLowerCase().includes(productSearch.toLowerCase())
  );

  // Toggle assignment
  const toggleAssignment = (productId: string, storeId: string) => {
    setAssignments(prev => {
      const newMap = new Map(prev);
      if (!newMap.has(productId)) {
        newMap.set(productId, new Set());
      }
      const storeSet = new Set(newMap.get(productId)!);
      
      if (storeSet.has(storeId)) {
        storeSet.delete(storeId);
      } else {
        storeSet.add(storeId);
      }
      
      newMap.set(productId, storeSet);
      return newMap;
    });
  };

  // Update price override
  const updatePriceOverride = (productId: string, storeId: string, value: string) => {
    setPriceOverrides(prev => {
      const newMap = new Map(prev);
      if (!newMap.has(productId)) {
        newMap.set(productId, new Map());
      }
      const priceMap = new Map(newMap.get(productId)!);
      
      if (value) {
        priceMap.set(storeId, value);
      } else {
        priceMap.delete(storeId);
      }
      
      newMap.set(productId, priceMap);
      return newMap;
    });
  };

  // Toggle featured status
  const toggleFeatured = (productId: string, storeId: string) => {
    setFeaturedStatus(prev => {
      const newMap = new Map(prev);
      if (!newMap.has(productId)) {
        newMap.set(productId, new Map());
      }
      const featuredMap = new Map(newMap.get(productId)!);
      
      featuredMap.set(storeId, !featuredMap.get(storeId));
      
      newMap.set(productId, featuredMap);
      return newMap;
    });
  };

  // Check if product is assigned to store
  const isAssigned = (productId: string, storeId: string): boolean => {
    return assignments.get(productId)?.has(storeId) || false;
  };

  // Get price override
  const getPriceOverride = (productId: string, storeId: string): string => {
    return priceOverrides.get(productId)?.get(storeId) || "";
  };

  // Get featured status
  const isFeatured = (productId: string, storeId: string): boolean => {
    return featuredStatus.get(productId)?.get(storeId) || false;
  };

  // Check if initially assigned
  const wasInitiallyAssigned = (productId: string, storeId: string): boolean => {
    return initialAssignments.get(productId)?.has(storeId) || false;
  };

  // Save mutations
  const createMutation = useMutation({
    mutationFn: async (data: { storeId: string; productIds: string[]; priceOverride?: string; isFeatured?: boolean }) => {
      const res = await fetch("/api/stores/admin/store-products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("Failed to create assignment");
      return res.json();
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { storeId: string; productId: string; priceOverride?: string | null; isFeatured?: boolean }) => {
      const res = await fetch(`/api/stores/admin/store-products/${data.storeId}/${data.productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          priceOverride: data.priceOverride,
          isFeatured: data.isFeatured
        })
      });
      if (!res.ok) throw new Error("Failed to update assignment");
      return res.json();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (data: { storeId: string; productId: string }) => {
      const res = await fetch(`/api/stores/admin/store-products/${data.storeId}/${data.productId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete assignment");
      return res.json();
    }
  });

  // Save all changes
  const handleSaveChanges = async () => {
    try {
      const operations: Promise<any>[] = [];

      // Process each product-store combination
      products.forEach((product) => {
        stores.forEach((store) => {
          const isCurrentlyAssigned = isAssigned(product.id, store.id);
          const wasAssigned = wasInitiallyAssigned(product.id, store.id);
          const currentPrice = getPriceOverride(product.id, store.id);
          const initialPrice = initialPriceOverrides.get(product.id)?.get(store.id) || "";
          const currentFeatured = isFeatured(product.id, store.id);
          const initialFeaturedValue = initialFeaturedStatus.get(product.id)?.get(store.id) || false;

          // New assignment
          if (isCurrentlyAssigned && !wasAssigned) {
            operations.push(
              createMutation.mutateAsync({
                storeId: store.id,
                productIds: [product.id],
                priceOverride: currentPrice || undefined,
                isFeatured: currentFeatured
              })
            );
          }
          // Remove assignment
          else if (!isCurrentlyAssigned && wasAssigned) {
            operations.push(
              deleteMutation.mutateAsync({
                storeId: store.id,
                productId: product.id
              })
            );
          }
          // Update existing assignment if price or featured changed
          else if (isCurrentlyAssigned && wasAssigned) {
            if (currentPrice !== initialPrice || currentFeatured !== initialFeaturedValue) {
              operations.push(
                updateMutation.mutateAsync({
                  storeId: store.id,
                  productId: product.id,
                  priceOverride: currentPrice || null,
                  isFeatured: currentFeatured
                })
              );
            }
          }
        });
      });

      if (operations.length === 0) {
        toast({
          title: "ℹ️ Không có thay đổi",
          description: "Chưa có thay đổi nào để lưu"
        });
        return;
      }

      await Promise.all(operations);

      toast({
        title: "✅ Lưu thành công",
        description: `Đã cập nhật ${operations.length} thay đổi`
      });

      // Refresh data
      await refetchAssignments();
      queryClient.invalidateQueries({ queryKey: ["/api/stores/admin/store-products/assignments"] });
    } catch (error) {
      toast({
        title: "❌ Lỗi",
        description: "Không thể lưu thay đổi",
        variant: "destructive"
      });
    }
  };

  // Reset to initial state
  const handleReset = () => {
    setAssignments(new Map(initialAssignments));
    setPriceOverrides(new Map(initialPriceOverrides));
    setFeaturedStatus(new Map(initialFeaturedStatus));
    toast({
      title: "🔄 Đã làm mới",
      description: "Dữ liệu đã được reset về trạng thái ban đầu"
    });
  };

  // Store badge colors
  const getStoreBadgeColor = (storeName: string): string => {
    if (storeName.toLowerCase().includes('sunfoods')) return 'bg-green-100 text-green-800 border-green-300';
    if (storeName.toLowerCase().includes('trầm hương')) return 'bg-amber-100 text-amber-800 border-amber-300';
    if (storeName.toLowerCase().includes('nhang sạch')) return 'bg-teal-100 text-teal-800 border-teal-300';
    return 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const hasChanges = useMemo(() => {
    // Compare current state with initial state
    for (const [productId, storeSet] of Array.from(assignments)) {
      const initialStoreSet = initialAssignments.get(productId);
      if (!initialStoreSet || storeSet.size !== initialStoreSet.size) return true;
      for (const storeId of Array.from(storeSet)) {
        if (!initialStoreSet.has(storeId)) return true;
      }
    }
    
    for (const [productId, priceMap] of Array.from(priceOverrides)) {
      const initialPriceMap = initialPriceOverrides.get(productId);
      for (const [storeId, price] of Array.from(priceMap)) {
        if (initialPriceMap?.get(storeId) !== price) return true;
      }
    }
    
    for (const [productId, featMap] of Array.from(featuredStatus)) {
      const initialFeatMap = initialFeaturedStatus.get(productId);
      for (const [storeId, featured] of Array.from(featMap)) {
        if (initialFeatMap?.get(storeId) !== featured) return true;
      }
    }
    
    return false;
  }, [assignments, priceOverrides, featuredStatus, initialAssignments, initialPriceOverrides, initialFeaturedStatus]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Store className="w-8 h-8" />
          Quản Lý Sản Phẩm Theo Cửa Hàng
        </h1>
        <p className="text-muted-foreground mt-1">
          Gán sản phẩm cho từng cửa hàng và tùy chỉnh giá riêng
        </p>
      </div>

      {/* Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <Input
              placeholder="🔍 Tìm sản phẩm (tên hoặc SKU)..."
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              className="max-w-md"
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleReset}
                className="gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Làm Mới
              </Button>
              <Button
                onClick={handleSaveChanges}
                disabled={!hasChanges || createMutation.isPending || updateMutation.isPending || deleteMutation.isPending}
                className="gap-2"
              >
                <Save className="w-4 h-4" />
                {createMutation.isPending || updateMutation.isPending || deleteMutation.isPending ? "Đang lưu..." : "Lưu Thay Đổi"}
              </Button>
            </div>
          </div>
          {hasChanges && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800 font-medium">
                ⚠️ Có thay đổi chưa lưu. Nhấn "Lưu Thay Đổi" để cập nhật hoặc "Làm Mới" để hủy.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Bảng Gán Sản Phẩm ({filteredProducts.length} sản phẩm)
          </CardTitle>
          <CardDescription>
            Tick chọn để gán sản phẩm, nhập giá để override, và đánh dấu featured
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[250px] sticky left-0 bg-background z-10">Sản Phẩm</TableHead>
                  <TableHead className="text-right">Giá Gốc</TableHead>
                  {stores.map((store) => (
                    <TableHead key={store.id} className="text-center min-w-[200px]">
                      <Badge className={getStoreBadgeColor(store.name)}>
                        {store.name}
                      </Badge>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {productsLoading || storesLoading || assignmentsLoading ? (
                  <TableRow>
                    <TableCell colSpan={2 + stores.length} className="text-center py-8">
                      Đang tải...
                    </TableCell>
                  </TableRow>
                ) : filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2 + stores.length} className="text-center py-8 text-muted-foreground">
                      Không tìm thấy sản phẩm
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="sticky left-0 bg-background z-10">
                        <div>
                          <p className="font-medium">{product.name}</p>
                          {product.sku && (
                            <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-medium">
                          {parseInt(product.price).toLocaleString('vi-VN')}₫
                        </span>
                      </TableCell>
                      {stores.map((store) => (
                        <TableCell key={store.id} className="text-center">
                          <div className="space-y-2">
                            <div className="flex items-center justify-center gap-2">
                              <Checkbox
                                checked={isAssigned(product.id, store.id)}
                                onCheckedChange={() => toggleAssignment(product.id, store.id)}
                              />
                              <Checkbox
                                checked={isFeatured(product.id, store.id)}
                                onCheckedChange={() => toggleFeatured(product.id, store.id)}
                                disabled={!isAssigned(product.id, store.id)}
                                className="border-yellow-500"
                              />
                              <Star className={`w-4 h-4 ${isFeatured(product.id, store.id) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
                            </div>
                            <Input
                              type="number"
                              placeholder="Giá riêng"
                              value={getPriceOverride(product.id, store.id)}
                              onChange={(e) => updatePriceOverride(product.id, store.id, e.target.value)}
                              disabled={!isAssigned(product.id, store.id)}
                              className="text-sm h-8"
                            />
                          </div>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Store Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Chú thích</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Checkbox checked disabled />
              <span>Sản phẩm được bán tại cửa hàng</span>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox checked disabled className="border-yellow-500" />
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span>Sản phẩm nổi bật (Featured)</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              <span>Giá riêng cho cửa hàng (để trống = dùng giá gốc)</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
