import { useState, useEffect } from "react";
import { GuestCheckout } from "@/components/GuestCheckout";
import { useLocation } from "wouter";
import SocialLoginPanel from "@/components/SocialLoginPanel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export default function GuestCheckoutPage() {
  const [location] = useLocation();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSocialLogin, setShowSocialLogin] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const productIds = urlParams.get('products')?.split(',') || [];
    const quantities = urlParams.get('quantities')?.split(',').map(Number) || [];

    if (productIds.length === 0) {
      // No products specified, show error or redirect
      setError('Chưa có sản phẩm nào được chọn. Vui lòng quay lại trang sản phẩm.');
      setLoading(false);
      return;
    }

    fetchProducts(productIds, quantities);
  }, []);

  const fetchProducts = async (productIds: string[], quantities: number[]) => {
    try {
      setLoading(true);
      const response = await fetch('/api/products');
      
      if (!response.ok) {
        throw new Error('Không thể tải thông tin sản phẩm');
      }

      const allProducts = await response.json();
      
      // Filter and map products with quantities
      const selectedProducts: Product[] = productIds.map((id, index) => {
        const product = allProducts.find((p: any) => p.id === id);
        if (!product) {
          throw new Error(`Sản phẩm với ID ${id} không tồn tại`);
        }
        
        return {
          id: product.id,
          name: product.name,
          price: product.price || 0,
          quantity: quantities[index] || 1
        };
      });

      setProducts(selectedProducts);
      setError(null);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const handleOrderSuccess = (orderId: string) => {
    console.log('🎉 Order created successfully:', orderId);
    // You can add analytics tracking here
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin sản phẩm...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Có lỗi xảy ra</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.history.back()}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          
          {/* Header with Login Options */}
          <Card className="mb-6 border-0 shadow-lg bg-white/90 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                <span className="text-2xl">🛒</span>
                Thanh Toán Đơn Hàng
              </CardTitle>
              <p className="text-gray-600 mt-2">
                Đã có tài khoản? Đăng nhập để thanh toán nhanh hơn và theo dõi đơn hàng
              </p>
            </CardHeader>
            <CardContent>
              {!showSocialLogin ? (
                <div className="text-center">
                  <Button
                    onClick={() => setShowSocialLogin(true)}
                    variant="outline"
                    className="mb-4 hover:scale-105 transition-transform"
                  >
                    <span className="mr-2">🔐</span>
                    Đăng Nhập Tài Khoản Có Sẵn
                  </Button>
                  <div className="text-sm text-gray-500">
                    Hoặc tiếp tục mua hàng với thông tin khách vãng lai bên dưới
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <SocialLoginPanel compact={true} showTitle={true} />
                  <div className="text-center">
                    <Button
                      onClick={() => setShowSocialLogin(false)}
                      variant="ghost"
                      size="sm"
                      className="text-gray-500"
                    >
                      Ẩn tùy chọn đăng nhập
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Guest Checkout Form */}
          <GuestCheckout products={products} onSuccess={handleOrderSuccess} />
        </div>
      </div>
    </div>
  );
}