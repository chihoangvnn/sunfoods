import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Package, ShoppingCart } from "lucide-react";

interface Product {
  id: number;
  name: string;
  price: number;
  sku: string;
}

interface QuickOrderFormProps {
  affiliateId: string;
}

export default function QuickOrderForm({ affiliateId }: QuickOrderFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    customerPhone: "",
    customerName: "",
    customerAddress: "",
    productId: "",
    quantity: "1",
  });

  // Fetch products
  const { data: products, isLoading: loadingProducts } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await fetch("/api/products");
      if (!res.ok) throw new Error("Failed to fetch products");
      return res.json();
    },
  });

  // Create quick order mutation
  const createOrderMutation = useMutation({
    mutationFn: async (orderData: typeof formData) => {
      const res = await fetch("/api/affiliate-portal/quick-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          affiliateId,
          ...orderData,
        }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create order");
      }
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Đơn hàng đã được tạo!",
        description: `Mã đơn: ${data.orderId}. Hoa hồng của bạn: ${data.commission?.toLocaleString('vi-VN')}₫`,
      });
      // Reset form
      setFormData({
        customerPhone: "",
        customerName: "",
        customerAddress: "",
        productId: "",
        quantity: "1",
      });
      // Refetch affiliate stats
      queryClient.invalidateQueries({ queryKey: ["affiliate-stats"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi tạo đơn hàng",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customerPhone || !formData.customerName || !formData.customerAddress || !formData.productId) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng điền đầy đủ thông tin khách hàng và sản phẩm",
        variant: "destructive",
      });
      return;
    }

    createOrderMutation.mutate(formData);
  };

  const selectedProduct = products?.find(p => p.id.toString() === formData.productId);
  const totalAmount = selectedProduct ? selectedProduct.price * parseInt(formData.quantity || "1") : 0;

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-primary" />
          Lên đơn nhanh cho khách
        </CardTitle>
        <CardDescription>
          Tạo đơn hàng nhanh và nhận hoa hồng ngay lập tức
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customerPhone">Số điện thoại khách *</Label>
              <Input
                id="customerPhone"
                placeholder="0912345678"
                value={formData.customerPhone}
                onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerName">Tên khách hàng *</Label>
              <Input
                id="customerName"
                placeholder="Nguyễn Văn A"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="customerAddress">Địa chỉ giao hàng *</Label>
            <Input
              id="customerAddress"
              placeholder="123 Đường ABC, Quận 1, TP.HCM"
              value={formData.customerAddress}
              onChange={(e) => setFormData({ ...formData, customerAddress: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="productId">Sản phẩm *</Label>
              <Select
                value={formData.productId}
                onValueChange={(value) => setFormData({ ...formData, productId: value })}
              >
                <SelectTrigger id="productId">
                  <SelectValue placeholder="Chọn sản phẩm" />
                </SelectTrigger>
                <SelectContent>
                  {loadingProducts ? (
                    <SelectItem value="loading" disabled>
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </SelectItem>
                  ) : (
                    products?.map((product) => (
                      <SelectItem key={product.id} value={product.id.toString()}>
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4" />
                          {product.name} - {product.price.toLocaleString('vi-VN')}₫
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Số lượng *</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                placeholder="1"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                required
              />
            </div>
          </div>

          {selectedProduct && (
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tổng tiền:</span>
                <span className="font-medium">{totalAmount.toLocaleString('vi-VN')}₫</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Hoa hồng dự kiến (10%):</span>
                <span className="font-bold text-emerald-500">
                  {(totalAmount * 0.1).toLocaleString('vi-VN')}₫
                </span>
              </div>
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full"
            disabled={createOrderMutation.isPending}
          >
            {createOrderMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Đang tạo đơn...
              </>
            ) : (
              "Tạo đơn hàng"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
