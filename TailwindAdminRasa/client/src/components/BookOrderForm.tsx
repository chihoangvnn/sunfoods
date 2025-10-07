import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { X, Save, Plus, Trash2, Book, Package, Award, UserPlus } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { getShortOrderId } from "@/utils/orderUtils";
import { ProductSearchInput } from "@/components/ProductSearchInput";
import type { BookOrder, Customer, Product, BookSeller } from "@shared/schema";

interface BookOrderWithDetails extends BookOrder {
  orderItems?: Array<{
    id: string;
    orderId: string;
    productId: string;
    quantity: number;
    price: string;
    isbn?: string;
    condition?: string;
    sellerPrice?: string;
    marketPrice?: string;
    sourceCost?: string;
    productName: string;
  }>;
}

interface BookOrderFormProps {
  order?: BookOrderWithDetails | null;
  onClose: () => void;
  onSuccess?: () => void;
}

interface BookOrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
  isbn: string;
  condition: 'new' | 'like_new' | 'very_good' | 'good' | 'acceptable';
  sellerPrice?: number;
  marketPrice?: number;
  sourceCost?: number;
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(price);
};

export function BookOrderForm({ order, onClose, onSuccess }: BookOrderFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = Boolean(order);

  const [formData, setFormData] = useState({
    customerNameBook: "",
    customerEmailBook: "",
    customerPhoneBook: "",
    customerAddressBook: "",
    status: "pending" as "pending" | "processing" | "shipped" | "delivered" | "cancelled",
    paymentMethod: "cash" as "cash" | "bank_transfer" | "debt",
    // Book-specific fields
    sellerId: "" as string,
    bookSource: "local_inventory" as "abebooks" | "local_inventory" | "dropship" | "consignment",
    isbn: "",
    condition: "new" as "new" | "like_new" | "very_good" | "good" | "acceptable",
    sellerCommission: "",
    inventoryStatus: "reserved" as "reserved" | "allocated" | "shipped" | "returned",
    bookMetadata: {
      author: "",
      publisher: "",
      edition: "",
      publishedYear: 0,
      pageCount: 0,
      language: "vi"
    }
  });

  const [orderItems, setOrderItems] = useState<BookOrderItem[]>([]);

  // Load order data if editing
  useEffect(() => {
    if (order) {
      setFormData({
        customerNameBook: order.customerNameBook || "",
        customerEmailBook: order.customerEmailBook || "",
        customerPhoneBook: order.customerPhoneBook || "",
        customerAddressBook: order.customerAddressBook || "",
        status: order.status,
        paymentMethod: (order as any).paymentMethod || "cash",
        sellerId: order.sellerId || "",
        bookSource: order.bookSource || "local_inventory",
        isbn: order.isbn || "",
        condition: order.condition || "new",
        sellerCommission: order.sellerCommission?.toString() || "",
        inventoryStatus: order.inventoryStatus || "reserved",
        bookMetadata: {
          author: order.bookMetadata?.author || "",
          publisher: order.bookMetadata?.publisher || "",
          edition: order.bookMetadata?.edition || "",
          publishedYear: order.bookMetadata?.publishedYear || 0,
          pageCount: order.bookMetadata?.pageCount || 0,
          language: order.bookMetadata?.language || "vi"
        }
      });
      
      // Convert order items to the format expected by the form
      const items = (order.orderItems || []).map(item => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        price: parseFloat(item.price),
        total: item.quantity * parseFloat(item.price),
        isbn: item.isbn || "",
        condition: (item.condition as any) || "new",
        sellerPrice: item.sellerPrice ? parseFloat(item.sellerPrice) : undefined,
        marketPrice: item.marketPrice ? parseFloat(item.marketPrice) : undefined,
        sourceCost: item.sourceCost ? parseFloat(item.sourceCost) : undefined,
      }));
      setOrderItems(items);
    }
  }, [order]);

  // Fetch products for dropdowns
  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  // Fetch book sellers for dropdown
  const { data: bookSellers = [] } = useQuery<BookSeller[]>({
    queryKey: ['/api/book-sellers'],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/book-sellers');
        return response.json();
      } catch (error) {
        console.log("Book sellers API not available yet, returning empty array");
        return [];
      }
    },
  });

  // Calculate totals
  const totalAmount = orderItems.reduce((sum, item) => sum + item.total, 0);
  const totalItems = orderItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalCommission = parseFloat(formData.sellerCommission) || 0;

  // Add new order item
  const addOrderItem = () => {
    setOrderItems([...orderItems, {
      productId: "",
      productName: "",
      quantity: 1,
      price: 0,
      total: 0,
      isbn: "",
      condition: "new",
    }]);
  };

  // Remove order item
  const removeOrderItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  // Update order item
  const updateOrderItem = (index: number, field: keyof BookOrderItem, value: any) => {
    const newItems = [...orderItems];
    const item = newItems[index];
    
    if (field === 'productId') {
      if (value === '' || !value) {
        // Clear product selection
        item.productId = '';
        item.productName = '';
        item.price = 0;
      } else {
        // Find product and populate data
        const product = products.find(p => p.id === value);
        if (product) {
          item.productId = value;
          item.productName = product.name;
          item.price = parseFloat(product.price);
        }
      }
    } else {
      (item as any)[field] = value;
    }
    
    // Recalculate total
    if (field === 'quantity' || field === 'price') {
      item.total = item.quantity * item.price;
    }
    
    setOrderItems(newItems);
  };

  // Create/Update mutation
  const createUpdateMutation = useMutation({
    mutationFn: async (data: any) => {
      const endpoint = isEditing ? `/api/book-orders/${order!.id}` : '/api/book-orders';
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await apiRequest(method, endpoint, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: isEditing ? "Đơn hàng sách đã được cập nhật" : "Đơn hàng sách đã được tạo",
      });
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.customerNameBook.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập tên khách hàng",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.customerPhoneBook.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập số điện thoại khách hàng",
        variant: "destructive",
      });
      return;
    }
    
    if (orderItems.length === 0) {
      toast({
        title: "Lỗi", 
        description: "Vui lòng thêm ít nhất một sản phẩm",
        variant: "destructive",
      });
      return;
    }

    // Prepare data
    const bookOrderData = {
      customerNameBook: formData.customerNameBook,
      customerPhoneBook: formData.customerPhoneBook,
      customerEmailBook: formData.customerEmailBook || null,
      customerAddressBook: formData.customerAddressBook || null,
      total: totalAmount.toString(),
      status: formData.status,
      paymentMethod: formData.paymentMethod,
      items: orderItems.length,
      
      // Book-specific fields
      sellerId: formData.sellerId || null,
      bookSource: formData.bookSource,
      isbn: formData.isbn || null,
      condition: formData.condition,
      sellerCommission: formData.sellerCommission ? parseFloat(formData.sellerCommission).toString() : "0",
      inventoryStatus: formData.inventoryStatus,
      bookMetadata: {
        author: formData.bookMetadata.author || null,
        publisher: formData.bookMetadata.publisher || null,
        edition: formData.bookMetadata.edition || null,
        publishedYear: formData.bookMetadata.publishedYear || null,
        pageCount: formData.bookMetadata.pageCount || null,
        language: formData.bookMetadata.language || "vi"
      },
      
      // Order items array
      orderItems: orderItems
    };

    createUpdateMutation.mutate(bookOrderData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <form onSubmit={handleSubmit} className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center gap-2">
              <Book className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-semibold">
                {isEditing ? `Chỉnh sửa đơn hàng sách ${getShortOrderId(order!)}` : 'Tạo đơn hàng sách mới'}
              </h2>
            </div>
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Thông tin khách hàng
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="customerNameBook">Tên khách hàng *</Label>
                    <Input
                      id="customerNameBook"
                      value={formData.customerNameBook}
                      onChange={(e) => setFormData({ ...formData, customerNameBook: e.target.value })}
                      placeholder="Nhập tên khách hàng"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="customerPhoneBook">Số điện thoại *</Label>
                    <Input
                      id="customerPhoneBook"
                      value={formData.customerPhoneBook}
                      onChange={(e) => setFormData({ ...formData, customerPhoneBook: e.target.value })}
                      placeholder="Nhập số điện thoại"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="customerEmailBook">Email</Label>
                    <Input
                      id="customerEmailBook"
                      type="email"
                      value={formData.customerEmailBook}
                      onChange={(e) => setFormData({ ...formData, customerEmailBook: e.target.value })}
                      placeholder="Nhập email (không bắt buộc)"
                    />
                  </div>
                  <div>
                    <Label htmlFor="customerAddressBook">Địa chỉ</Label>
                    <Input
                      id="customerAddressBook"
                      value={formData.customerAddressBook}
                      onChange={(e) => setFormData({ ...formData, customerAddressBook: e.target.value })}
                      placeholder="Nhập địa chỉ (không bắt buộc)"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Status and Payment */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">Trạng thái</Label>
                <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Chờ xử lý</SelectItem>
                    <SelectItem value="processing">Đang xử lý</SelectItem>
                    <SelectItem value="shipped">Đã gửi</SelectItem>
                    <SelectItem value="delivered">Hoàn thành</SelectItem>
                    <SelectItem value="cancelled">Đã hủy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="paymentMethod">Phương thức thanh toán</Label>
                <Select value={formData.paymentMethod} onValueChange={(value: any) => setFormData({ ...formData, paymentMethod: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Tiền mặt</SelectItem>
                    <SelectItem value="bank_transfer">Chuyển khoản</SelectItem>
                    <SelectItem value="debt">Ghi nợ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="seller">Người bán</Label>
                <Select value={formData.sellerId} onValueChange={(value) => setFormData({ ...formData, sellerId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn người bán" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Không chọn</SelectItem>
                    {bookSellers.map(seller => (
                      <SelectItem key={seller.id} value={seller.id}>
                        {seller.displayName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Book-specific Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Thông tin sách
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="isbn">ISBN</Label>
                    <Input
                      id="isbn"
                      value={formData.isbn}
                      onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                      placeholder="ISBN của sách"
                    />
                  </div>
                  <div>
                    <Label htmlFor="condition">Tình trạng sách</Label>
                    <Select value={formData.condition} onValueChange={(value: any) => setFormData({ ...formData, condition: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">✨ Mới</SelectItem>
                        <SelectItem value="like_new">⭐ Như mới</SelectItem>
                        <SelectItem value="very_good">👍 Rất tốt</SelectItem>
                        <SelectItem value="good">👌 Tốt</SelectItem>
                        <SelectItem value="acceptable">📖 Chấp nhận</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="bookSource">Nguồn sách</Label>
                    <Select value={formData.bookSource} onValueChange={(value: any) => setFormData({ ...formData, bookSource: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="abebooks">📚 AbeBooks</SelectItem>
                        <SelectItem value="local_inventory">🏪 Kho local</SelectItem>
                        <SelectItem value="dropship">🚚 Dropship</SelectItem>
                        <SelectItem value="consignment">🤝 Ký gửi</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sellerCommission">Hoa hồng người bán</Label>
                    <Input
                      id="sellerCommission"
                      type="number"
                      value={formData.sellerCommission}
                      onChange={(e) => setFormData({ ...formData, sellerCommission: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="inventoryStatus">Trạng thái kho</Label>
                    <Select value={formData.inventoryStatus} onValueChange={(value: any) => setFormData({ ...formData, inventoryStatus: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="reserved">🔒 Đặt chỗ</SelectItem>
                        <SelectItem value="allocated">📦 Phân bổ</SelectItem>
                        <SelectItem value="shipped">🚚 Đã gửi</SelectItem>
                        <SelectItem value="returned">↩️ Trả lại</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Book Metadata */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="author">Tác giả</Label>
                    <Input
                      id="author"
                      value={formData.bookMetadata.author}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        bookMetadata: { ...formData.bookMetadata, author: e.target.value }
                      })}
                      placeholder="Tên tác giả"
                    />
                  </div>
                  <div>
                    <Label htmlFor="publisher">Nhà xuất bản</Label>
                    <Input
                      id="publisher"
                      value={formData.bookMetadata.publisher}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        bookMetadata: { ...formData.bookMetadata, publisher: e.target.value }
                      })}
                      placeholder="Tên nhà xuất bản"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edition">Phiên bản</Label>
                    <Input
                      id="edition"
                      value={formData.bookMetadata.edition}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        bookMetadata: { ...formData.bookMetadata, edition: e.target.value }
                      })}
                      placeholder="Phiên bản/Lần in"
                    />
                  </div>
                  <div>
                    <Label htmlFor="publishedYear">Năm xuất bản</Label>
                    <Input
                      id="publishedYear"
                      type="number"
                      value={formData.bookMetadata.publishedYear}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        bookMetadata: { ...formData.bookMetadata, publishedYear: parseInt(e.target.value) || 0 }
                      })}
                      placeholder="2023"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="pageCount">Số trang</Label>
                  <Input
                    id="pageCount"
                    type="number"
                    value={formData.bookMetadata.pageCount}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      bookMetadata: { ...formData.bookMetadata, pageCount: parseInt(e.target.value) || 0 }
                    })}
                    placeholder="300"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Sản phẩm trong đơn hàng</CardTitle>
                  <Button type="button" variant="outline" size="sm" onClick={addOrderItem}>
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm sản phẩm
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {orderItems.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Chưa có sản phẩm nào. Nhấn "Thêm sản phẩm" để bắt đầu.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orderItems.map((item, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-medium">Sản phẩm {index + 1}</h4>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeOrderItem(index)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="md:col-span-2">
                            <Label>Sản phẩm</Label>
                            <ProductSearchInput
                              onSelect={(product) => {
                                if (product) {
                                  updateOrderItem(index, 'productId', product.id);
                                }
                              }}
                              placeholder="Chọn sản phẩm..."
                            />
                          </div>
                          
                          <div>
                            <Label>ISBN</Label>
                            <Input
                              value={item.isbn}
                              onChange={(e) => updateOrderItem(index, 'isbn', e.target.value)}
                              placeholder="ISBN của sách"
                            />
                          </div>
                          
                          <div>
                            <Label>Tình trạng</Label>
                            <Select 
                              value={item.condition} 
                              onValueChange={(value: any) => updateOrderItem(index, 'condition', value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="new">✨ Mới</SelectItem>
                                <SelectItem value="like_new">⭐ Như mới</SelectItem>
                                <SelectItem value="very_good">👍 Rất tốt</SelectItem>
                                <SelectItem value="good">👌 Tốt</SelectItem>
                                <SelectItem value="acceptable">📖 Chấp nhận</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <Label>Số lượng</Label>
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateOrderItem(index, 'quantity', parseInt(e.target.value) || 1)}
                            />
                          </div>
                          
                          <div>
                            <Label>Giá bán</Label>
                            <Input
                              type="number"
                              value={item.price}
                              onChange={(e) => updateOrderItem(index, 'price', parseFloat(e.target.value) || 0)}
                            />
                          </div>
                          
                          <div>
                            <Label>Giá người bán</Label>
                            <Input
                              type="number"
                              value={item.sellerPrice || ''}
                              onChange={(e) => updateOrderItem(index, 'sellerPrice', parseFloat(e.target.value) || undefined)}
                              placeholder="Giá người bán"
                            />
                          </div>
                          
                          <div>
                            <Label>Giá thị trường</Label>
                            <Input
                              type="number"
                              value={item.marketPrice || ''}
                              onChange={(e) => updateOrderItem(index, 'marketPrice', parseFloat(e.target.value) || undefined)}
                              placeholder="Giá thị trường"
                            />
                          </div>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Thành tiền:</span>
                            <span className="font-bold text-lg">{formatPrice(item.total)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Tổng kết đơn hàng</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Tổng số sản phẩm:</span>
                    <span>{totalItems}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Hoa hồng người bán:</span>
                    <span>{formatPrice(totalCommission)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t">
                    <span>Tổng tiền:</span>
                    <span>{formatPrice(totalAmount)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-4 p-6 border-t bg-muted/50">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button 
              type="submit" 
              disabled={createUpdateMutation.isPending || !formData.customerNameBook.trim() || !formData.customerPhoneBook.trim() || orderItems.length === 0}
              className="min-w-32"
            >
              {createUpdateMutation.isPending ? (
                "Đang xử lý..."
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditing ? "Cập nhật" : "Tạo đơn hàng"}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}