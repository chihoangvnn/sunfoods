import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Package, Users, Plus, CheckSquare, Square, Star, Trash2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
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

interface Affiliate {
  id: string;
  name: string;
  email: string;
  affiliate_code: string;
  commission_rate: string;
}

interface Assignment {
  id: string;
  affiliateId: string;
  targetId: string;
  assignmentType: string;
  commissionRate: string;
  commissionType: string;
  isPremium: boolean;
  isActive: boolean;
  createdAt: string;
  affiliateName: string | null;
  affiliateEmail: string | null;
  productName: string | null;
  productPrice: string | null;
}

export default function AffiliateProductAssignment() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [selectedAffiliates, setSelectedAffiliates] = useState<Set<string>>(new Set());
  const [commissionRate, setCommissionRate] = useState("");
  const [isPremium, setIsPremium] = useState(false);
  const [isDefaultAssignment, setIsDefaultAssignment] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [affiliateSearch, setAffiliateSearch] = useState("");

  const { data: productsData, isLoading: productsLoading } = useQuery<{ success: boolean; products: Product[] }>({
    queryKey: ["/api/products/admin/all"],
  });

  const { data: affiliatesData, isLoading: affiliatesLoading } = useQuery<{ success: boolean; data: Affiliate[] }>({
    queryKey: ["/api/affiliate-management/members"],
  });

  const { data: assignmentsData, isLoading: assignmentsLoading, refetch: refetchAssignments } = useQuery<{ success: boolean; data: Assignment[]; total: number }>({
    queryKey: ["/api/affiliate-management/product-assignments"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/affiliate-management/product-assignments/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Không thể xóa assignment");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "✅ Đã xóa assignment" });
      queryClient.invalidateQueries({ queryKey: ["/api/affiliate-management/product-assignments"] });
    },
    onError: () => {
      toast({ title: "❌ Lỗi khi xóa", variant: "destructive" });
    }
  });

  const bulkAssignMutation = useMutation({
    mutationFn: async (data: {
      productIds: string[];
      affiliateIds: string[];
      commissionRate?: string;
      isPremium: boolean;
      isDefaultAssignment: boolean;
    }) => {
      const res = await fetch("/api/affiliate-management/bulk-assign-products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data)
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Không thể gán sản phẩm");
      }
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "✅ Gán sản phẩm thành công",
        description: data.message || `Đã gán ${data.data.totalAssignments} sản phẩm`
      });
      setSelectedProducts(new Set());
      setSelectedAffiliates(new Set());
      setCommissionRate("");
      setIsPremium(false);
      setIsDefaultAssignment(false);
      queryClient.invalidateQueries({ queryKey: ["/api/affiliate-portal/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/affiliate-management/product-assignments"] });
    },
    onError: (error: Error) => {
      toast({
        title: "❌ Lỗi",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const products = productsData?.products || [];
  const affiliates = affiliatesData?.data || [];

  const filteredProducts = products.filter(p => 
    productSearch === "" || 
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.sku?.toLowerCase().includes(productSearch.toLowerCase())
  );

  const filteredAffiliates = affiliates.filter(a =>
    affiliateSearch === "" ||
    a.name.toLowerCase().includes(affiliateSearch.toLowerCase()) ||
    a.email.toLowerCase().includes(affiliateSearch.toLowerCase()) ||
    a.affiliate_code.toLowerCase().includes(affiliateSearch.toLowerCase())
  );

  const toggleProduct = (id: string) => {
    const newSet = new Set(selectedProducts);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedProducts(newSet);
  };

  const toggleAffiliate = (id: string) => {
    const newSet = new Set(selectedAffiliates);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedAffiliates(newSet);
  };

  const selectAllProducts = () => {
    if (selectedProducts.size === filteredProducts.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(filteredProducts.map(p => p.id)));
    }
  };

  const selectAllAffiliates = () => {
    if (selectedAffiliates.size === filteredAffiliates.length) {
      setSelectedAffiliates(new Set());
    } else {
      setSelectedAffiliates(new Set(filteredAffiliates.map(a => a.id)));
    }
  };

  const handleSubmit = () => {
    if (selectedProducts.size === 0) {
      toast({
        title: "⚠️ Thiếu thông tin",
        description: "Vui lòng chọn ít nhất 1 sản phẩm",
        variant: "destructive"
      });
      return;
    }
    
    // Skip affiliate selection validation if isDefaultAssignment is true
    if (!isDefaultAssignment && selectedAffiliates.size === 0) {
      toast({
        title: "⚠️ Thiếu thông tin",
        description: "Vui lòng chọn ít nhất 1 affiliate hoặc tick 'Áp dụng cho tất cả'",
        variant: "destructive"
      });
      return;
    }

    bulkAssignMutation.mutate({
      productIds: Array.from(selectedProducts),
      affiliateIds: Array.from(selectedAffiliates),
      commissionRate: commissionRate || undefined,
      isPremium,
      isDefaultAssignment
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">📦 Gán Sản Phẩm Cho Affiliate</h1>
        <p className="text-muted-foreground mt-1">
          Chọn nhiều sản phẩm và affiliate để gán hàng loạt
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Products Selection */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Sản phẩm ({selectedProducts.size} đã chọn)
                </CardTitle>
                <CardDescription>Chọn sản phẩm để gán</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={selectAllProducts}
                className="gap-2"
              >
                {selectedProducts.size === filteredProducts.length ? (
                  <><CheckSquare className="w-4 h-4" /> Bỏ chọn tất cả</>
                ) : (
                  <><Square className="w-4 h-4" /> Chọn tất cả</>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Tìm sản phẩm..."
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
            />
            <div className="border rounded-md max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Sản phẩm</TableHead>
                    <TableHead>Giá</TableHead>
                    <TableHead>Kho</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productsLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center">Đang tải...</TableCell>
                    </TableRow>
                  ) : filteredProducts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        Không tìm thấy sản phẩm
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProducts.map((product) => (
                      <TableRow
                        key={product.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => toggleProduct(product.id)}
                      >
                        <TableCell>
                          <Checkbox
                            checked={selectedProducts.has(product.id)}
                            onCheckedChange={() => toggleProduct(product.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{product.name}</p>
                            {product.sku && (
                              <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{parseInt(product.price).toLocaleString('vi-VN')}₫</TableCell>
                        <TableCell>
                          <Badge variant={product.stock > 0 ? "outline" : "destructive"}>
                            {product.stock}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Affiliates Selection */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Affiliate ({selectedAffiliates.size} đã chọn)
                </CardTitle>
                <CardDescription>Chọn affiliate nhận sản phẩm</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={selectAllAffiliates}
                className="gap-2"
              >
                {selectedAffiliates.size === filteredAffiliates.length ? (
                  <><CheckSquare className="w-4 h-4" /> Bỏ chọn tất cả</>
                ) : (
                  <><Square className="w-4 h-4" /> Chọn tất cả</>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Tìm affiliate..."
              value={affiliateSearch}
              onChange={(e) => setAffiliateSearch(e.target.value)}
            />
            <div className="border rounded-md max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Affiliate</TableHead>
                    <TableHead>HH</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {affiliatesLoading ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center">Đang tải...</TableCell>
                    </TableRow>
                  ) : filteredAffiliates.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground">
                        Không tìm thấy affiliate
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAffiliates.map((affiliate) => (
                      <TableRow
                        key={affiliate.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => toggleAffiliate(affiliate.id)}
                      >
                        <TableCell>
                          <Checkbox
                            checked={selectedAffiliates.has(affiliate.id)}
                            onCheckedChange={() => toggleAffiliate(affiliate.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{affiliate.name}</p>
                            <p className="text-xs text-muted-foreground">{affiliate.email}</p>
                            <p className="text-xs text-muted-foreground">Code: {affiliate.affiliate_code}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{affiliate.commission_rate}</Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assignment Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Cài đặt gán sản phẩm</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="commissionRate">Hoa hồng tùy chỉnh (tùy chọn)</Label>
              <Input
                id="commissionRate"
                placeholder="Ví dụ: 12% hoặc 50000"
                value={commissionRate}
                onChange={(e) => setCommissionRate(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Để trống để dùng hoa hồng mặc định theo hạng
              </p>
            </div>

            <div className="space-y-3 pt-6">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="isPremium"
                  checked={isPremium}
                  onCheckedChange={(checked) => setIsPremium(checked as boolean)}
                />
                <Label htmlFor="isPremium" className="flex items-center gap-2 cursor-pointer">
                  <Star className="w-4 h-4 text-yellow-500" />
                  Sản phẩm Premium (chỉ affiliate VIP)
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="isDefaultAssignment"
                  checked={isDefaultAssignment}
                  onCheckedChange={(checked) => setIsDefaultAssignment(checked as boolean)}
                />
                <Label htmlFor="isDefaultAssignment" className="flex items-center gap-2 cursor-pointer">
                  <Users className="w-4 h-4 text-green-500" />
                  Áp dụng cho TẤT CẢ affiliate (kể cả member vào sau)
                </Label>
              </div>
            </div>
          </div>

          {isDefaultAssignment && (
            <div className="bg-green-50 border border-green-200 rounded-md p-3">
              <p className="text-sm text-green-800 font-medium">
                🎯 Chế độ gán toàn bộ: Sản phẩm sẽ được gán cho TẤT CẢ affiliate hiện tại và tự động gán cho affiliate mới vào sau
              </p>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              {isDefaultAssignment ? (
                <span>Sẽ gán cho <span className="font-bold text-foreground">TẤT CẢ affiliate</span> hiện tại + tương lai</span>
              ) : (
                <span>Sẽ tạo <span className="font-bold text-foreground">
                  {selectedProducts.size * selectedAffiliates.size}
                </span> phân công</span>
              )}
            </div>
            <Button
              onClick={handleSubmit}
              disabled={bulkAssignMutation.isPending || selectedProducts.size === 0 || (!isDefaultAssignment && selectedAffiliates.size === 0)}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              {bulkAssignMutation.isPending ? "Đang gán..." : "Gán sản phẩm"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Assignments List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>📋 Danh Sách Phân Công</CardTitle>
              <CardDescription>
                {assignmentsData?.total || 0} assignments đã tạo
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetchAssignments()}
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Làm mới
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Affiliate</TableHead>
                  <TableHead>Sản phẩm</TableHead>
                  <TableHead>Hoa hồng</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead className="w-20"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignmentsLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">Đang tải...</TableCell>
                  </TableRow>
                ) : !assignmentsData?.data || assignmentsData.data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      Chưa có assignments nào. Hãy gán sản phẩm cho affiliate ở trên.
                    </TableCell>
                  </TableRow>
                ) : (
                  assignmentsData.data.map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{assignment.affiliateName || "N/A"}</p>
                          <p className="text-xs text-muted-foreground">{assignment.affiliateEmail || ""}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{assignment.productName || "N/A"}</p>
                          {assignment.productPrice && (
                            <p className="text-xs text-muted-foreground">
                              {parseInt(assignment.productPrice).toLocaleString('vi-VN')}₫
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {assignment.commissionRate}
                          {assignment.commissionType === "percentage" ? "%" : "₫"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {assignment.isPremium && (
                          <Badge variant="default" className="gap-1">
                            <Star className="w-3 h-3" />
                            Premium
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={assignment.isActive ? "outline" : "secondary"}>
                          {assignment.isActive ? "Hoạt động" : "Tắt"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(assignment.createdAt).toLocaleDateString('vi-VN')}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteMutation.mutate(assignment.id)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
