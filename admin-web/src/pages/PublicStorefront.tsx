import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Minus, Plus, ShoppingCart, Phone, Mail, MapPin, Star, Heart, X, Trash2, Truck, Package, Clock } from "lucide-react";
import ChatbotWidget from "@/components/ChatbotWidget";
import { MobileHeader } from "@/components/MobileHeader";
import { DesktopHeader } from "@/components/DesktopHeader";
import { ImageSlider } from "@/components/ImageSlider";
import { ProductModal } from "@/components/ProductModal";
import { StorefrontBottomNav } from "@/components/StorefrontBottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useResponsive } from "@/hooks/use-mobile";
import { apiRequest } from "@/lib/queryClient";

interface StorefrontData {
  name: string;
  theme: string;
  primaryColor: string;
  contactInfo: {
    phone: string;
    email: string;
    businessName: string;
    address?: string;
  };
  products: Array<{
    id: string;
    name: string;
    description: string;
    price: string;
    image: string;
    category: string;
    stock?: number;
    short_description?: string;
    status?: string;
  }>;
  storefrontConfigId: string;
}

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  category: string;
}

interface CustomerInfo {
  name: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
  deliveryType: "local_delivery" | "cod_shipping";
}

interface SearchResult {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: string;
  recentAddress: string | null;
}

interface ShopSettings {
  heroSlider?: Array<{
    type?: 'image' | 'video';
    url: string;
    alt?: string;
    thumbnail?: string;
    link?: string;
    buttonText?: string;
    showButton?: boolean;
  }>;
}

export default function PublicStorefront() {
  const { name } = useParams<{ name: string }>();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isMobile, isTablet, isDesktop } = useResponsive();
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
    deliveryType: 'local_delivery'
  });
  
  // Member search states
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedMember, setSelectedMember] = useState<SearchResult | null>(null);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [searchDebounceTimer, setSearchDebounceTimer] = useState<NodeJS.Timeout | null>(null);
  const [cartNotification, setCartNotification] = useState<{show: boolean, message: string}>({show: false, message: ''});
  
  // Affiliate tracking state
  const [affiliateCode, setAffiliateCode] = useState<string | null>(null);
  
  // Mobile navigation state
  const [activeTab, setActiveTab] = useState('home');
  
  // Product modal state
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Parse URL parameters for affiliate code on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    
    if (refCode) {
      localStorage.setItem('affiliateRef', refCode);
      setAffiliateCode(refCode);
      console.log(`🔗 Affiliate code captured: ${refCode}`);
    } else {
      const existingRef = localStorage.getItem('affiliateRef');
      if (existingRef) {
        setAffiliateCode(existingRef);
        console.log(`🔗 Using existing affiliate code: ${existingRef}`);
      }
    }
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (searchDebounceTimer) {
        clearTimeout(searchDebounceTimer);
      }
    };
  }, [searchDebounceTimer]);

  // Fetch storefront data
  const { data: storefrontData, isLoading, error } = useQuery({
    queryKey: ['/api/storefront/public', name],
    enabled: !!name
  });

  // Fetch shop settings for hero slider
  const { data: shopSettings } = useQuery({
    queryKey: ['/api/shop-info/public'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/shop-info/public');
        if (!response.ok) throw new Error('Failed to fetch shop settings');
        const data = await response.json();
        return data as ShopSettings;
      } catch (error) {
        console.error('Shop settings error:', error);
        return null;
      }
    }
  });

  // Cart functions
  const addToCart = (product: StorefrontData["products"][0]) => {
    const existingItem = cart.find(item => item.productId === product.id);
    
    if (existingItem) {
      setCart(cart.map(item =>
        item.productId === product.id
          ? { ...item, quantity: Math.round((item.quantity + 0.1) * 100) / 100 }
          : item
      ));
      setCartNotification({
        show: true, 
        message: `Tăng ${product.name} lên ${Math.round((existingItem.quantity + 0.1) * 100) / 100}kg`
      });
      setTimeout(() => setCartNotification({show: false, message: ''}), 3000);
    } else {
      setCart([...cart, {
        productId: product.id,
        name: product.name,
        price: parseFloat(product.price),
        quantity: 0.1,
        image: product.image,
        category: product.category
      }]);
      setCartNotification({
        show: true, 
        message: `Đã thêm ${product.name} - 0.1kg vào giỏ hàng`
      });
      setTimeout(() => setCartNotification({show: false, message: ''}), 3000);
    }
  };

  const updateCartQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity < 0.01) {
      setCart(cart.filter(item => item.productId !== productId));
      return;
    }
    
    const roundedQuantity = Math.round(newQuantity * 100) / 100;
    setCart(cart.map(item =>
      item.productId === productId
        ? { ...item, quantity: roundedQuantity }
        : item
    ));
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.productId !== productId));
    toast({
      title: "Đã xóa khỏi giỏ hàng",
      description: "Sản phẩm đã được xóa khỏi giỏ hàng",
    });
  };

  const getCartTotal = () => {
    return Math.round(cart.reduce((total, item) => total + (item.price * item.quantity), 0) * 100) / 100;
  };

  const getCartItemCount = () => {
    return Math.round(cart.reduce((total, item) => total + item.quantity, 0) * 100) / 100;
  };

  // Time-based free shipping logic
  const isFreeShippingTime = () => {
    const now = new Date();
    const hour = now.getHours();
    return hour === 11 || hour === 17;
  };

  const getDeliveryInfo = (deliveryType: string) => {
    const isFreeTime = isFreeShippingTime();
    
    if (deliveryType === 'local_delivery') {
      return {
        title: '🚚 Giao hàng quanh thị trấn',
        description: 'Giao hàng trong ngày, khu vực thị trấn và lân cận',
        timeInfo: isFreeTime ? '🆓 FREE SHIP hiện tại!' : 'FREE SHIP vào lúc 11:00 và 17:00',
        isFree: isFreeTime,
        estimatedTime: '2-4 giờ'
      };
    } else {
      return {
        title: '📦 Ship COD toàn quốc',
        description: 'Giao hàng toàn quốc, thanh toán khi nhận hàng',
        timeInfo: 'Phí ship theo khoảng cách',
        isFree: false,
        estimatedTime: '1-3 ngày'
      };
    }
  };

  // Customer search functionality
  const searchCustomers = async (phoneDigits: string) => {
    if (phoneDigits.length < 3) {
      setSearchResults([]);
      setSelectedMember(null);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`/api/customers/search?phone=${phoneDigits}`);
      const results: SearchResult[] = await response.json();
      setSearchResults(results);
      
      if (results.length === 1) {
        setSelectedMember(results[0]);
        setCustomerInfo({
          ...customerInfo,
          name: results[0].name,
          email: results[0].email,
          phone: results[0].phone,
          address: results[0].recentAddress || customerInfo.address
        });
      } else if (results.length === 0) {
        setSelectedMember(null);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      setSelectedMember(null);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced phone input handler
  const handlePhoneChange = (value: string) => {
    setCustomerInfo({...customerInfo, phone: value});
    
    if (searchDebounceTimer) {
      clearTimeout(searchDebounceTimer);
    }
    
    if (selectedMember && selectedMember.phone !== value) {
      setSelectedMember(null);
      setSearchResults([]);
    }
    
    const phoneDigits = value.replace(/\D/g, '');
    
    const timer = setTimeout(() => {
      if (phoneDigits.length >= 3) {
        searchCustomers(phoneDigits);
      } else {
        setSearchResults([]);
        setSelectedMember(null);
      }
    }, 300);
    
    setSearchDebounceTimer(timer);
  };

  // Create order mutation
  const orderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const response = await fetch(`/api/storefront/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          storefrontConfigId: (storefrontData as StorefrontData)?.storefrontConfigId,
          customerName: orderData.customerName,
          customerPhone: orderData.customerPhone,
          customerEmail: orderData.customerEmail,
          customerAddress: orderData.customerAddress,
          deliveryType: orderData.deliveryType,
          notes: orderData.notes,
          items: orderData.items,
          total: orderData.total,
          affiliateCode: orderData.affiliateCode
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Có lỗi xảy ra');
      }
      
      return await response.json();
    },
    onSuccess: (result: any) => {
      toast({
        title: "Đặt hàng thành công!",
        description: result.message || "Chúng tôi sẽ liên hệ với bạn sớm nhất có thể.",
      });
      setCart([]);
      setIsCheckoutOpen(false);
      setCustomerInfo({
        name: '',
        phone: '',
        email: '',
        address: '',
        notes: '',
        deliveryType: 'local_delivery'
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi đặt hàng",
        description: error.message || "Có lỗi xảy ra khi đặt hàng",
        variant: "destructive",
      });
    }
  });

  const handleCheckout = () => {
    if (!customerInfo.name || !customerInfo.phone) {
      toast({
        title: "Thông tin chưa đầy đủ",
        description: "Vui lòng điền đầy đủ họ tên và số điện thoại",
        variant: "destructive",
      });
      return;
    }

    if (!customerInfo.address) {
      toast({
        title: "Thiếu địa chỉ giao hàng",
        description: "Vui lòng nhập địa chỉ giao hàng để hoàn tất đơn hàng",
        variant: "destructive",
      });
      return;
    }

    if (cart.length === 0) {
      toast({
        title: "Giỏ hàng trống",
        description: "Vui lòng thêm sản phẩm vào giỏ hàng",
        variant: "destructive",
      });
      return;
    }

    const orderData = {
      customerName: customerInfo.name,
      customerPhone: customerInfo.phone,
      customerEmail: customerInfo.email,
      customerAddress: customerInfo.address,
      deliveryType: customerInfo.deliveryType,
      notes: customerInfo.notes,
      items: cart,
      total: getCartTotal(),
      affiliateCode: affiliateCode
    };

    orderMutation.mutate(orderData);
  };

  // Handle tab changes from bottom nav
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'cart') {
      setIsCartOpen(true);
    } else if (tab === 'home') {
      setIsCartOpen(false);
    }
  };

  // Filter products by search query
  const filteredProducts = searchQuery.trim() 
    ? (storefrontData as StorefrontData)?.products.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : (storefrontData as StorefrontData)?.products;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-green-700">Đang tải cửa hàng...</p>
        </div>
      </div>
    );
  }

  if (error || !storefrontData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-6">
            <div className="text-red-500 mb-4">
              <Heart className="w-12 h-12 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Cửa hàng không tồn tại</h2>
            <p className="text-gray-600">
              Không thể tìm thấy cửa hàng "{name}" hoặc cửa hàng đã ngừng hoạt động.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Prepare hero slider images
  const heroSlides = shopSettings?.heroSlider?.length 
    ? shopSettings.heroSlider 
    : [{
        url: '',
        type: 'image' as const,
        alt: 'Storefront Banner'
      }];

  // Convert products to ProductModal format
  const convertedProducts = (storefrontData as StorefrontData).products.map(product => ({
    id: product.id,
    name: product.name,
    price: parseFloat(product.price),
    image: product.image,
    category_id: product.category,
    stock: product.stock || 100,
    short_description: product.description,
    status: product.status || 'active',
    isNew: false,
    isTopseller: false,
    isFreeshipping: true,
    isBestseller: false
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Responsive Header */}
      {isMobile || isTablet ? (
        <MobileHeader
          storeName={(storefrontData as StorefrontData).contactInfo.businessName}
          cartCount={cart.length}
          onCartClick={() => setIsCartOpen(true)}
        />
      ) : (
        <DesktopHeader
          storeName={(storefrontData as StorefrontData).contactInfo.businessName}
          cartCount={cart.length}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onCartClick={() => setIsCartOpen(true)}
          onLogoClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        />
      )}

      {/* Cart Notification - Top */}
      {cartNotification.show && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-top-2">
          <div className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
            <ShoppingCart className="w-5 h-5" />
            <span className="font-medium">{cartNotification.message}</span>
          </div>
        </div>
      )}

      {/* Hero Section with ImageSlider */}
      <section className="relative">
        {shopSettings?.heroSlider?.length ? (
          <ImageSlider
            slides={heroSlides}
            autoplay={true}
            autoplayDelay={5000}
            className="w-full"
          />
        ) : (
          <div 
            className="bg-gradient-to-r from-green-500 to-green-600 text-white py-16 lg:py-24"
            style={{ 
              backgroundColor: (storefrontData as StorefrontData).primaryColor || '#16a34a'
            }}
          >
            <div className="container mx-auto px-4 text-center">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4" data-testid="text-hero-title">
                🌱 Thực phẩm Organic tươi ngon mỗi ngày
              </h2>
              <p className="text-green-100 mb-6 max-w-2xl mx-auto text-sm md:text-base">
                Chúng tôi cung cấp những sản phẩm organic chất lượng cao, 
                an toàn cho sức khỏe và thân thiện với môi trường.
              </p>
            </div>
          </div>
        )}
      </section>

      {/* Products Section with Modern Card Layout */}
      <section className={`py-6 lg:py-8 ${isMobile ? 'pb-24' : ''}`}>
        <div className="container mx-auto px-4">
          <h3 className="text-xl lg:text-2xl font-semibold text-green-800 mb-6" data-testid="text-products-title">
            Sản phẩm nổi bật
          </h3>
          
          {/* Product grid - Mobile first responsive */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 lg:gap-6">
            {filteredProducts?.map((product) => {
              const convertedProduct = convertedProducts.find(p => p.id === product.id);
              return (
                <Card 
                  key={product.id}
                  className="group hover:shadow-xl transition-all duration-300 border-gray-200 hover:border-green-300 cursor-pointer overflow-hidden"
                  data-testid={`card-product-${product.id}`}
                  onClick={() => setSelectedProduct(convertedProduct)}
                >
                  <CardContent className="p-2 md:p-3 lg:p-4">
                    <div className="relative aspect-square mb-2 md:mb-3 bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={product.image || '/placeholder-organic.jpg'}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        data-testid={`img-product-${product.id}`}
                      />
                      <Badge 
                        className="absolute top-2 left-2 bg-green-500 text-white text-xs"
                      >
                        Mới
                      </Badge>
                    </div>
                    
                    <h4 className="font-semibold text-gray-800 mb-1 text-sm md:text-base line-clamp-2" data-testid={`text-product-name-${product.id}`}>
                      {product.name}
                    </h4>
                    
                    <p className="text-xs text-gray-500 mb-2 line-clamp-1">
                      {product.category}
                    </p>
                    
                    <div className="flex items-center justify-between mb-2 md:mb-3">
                      <span className="text-base md:text-lg font-bold text-green-600" data-testid={`text-product-price-${product.id}`}>
                        {parseInt(product.price).toLocaleString('vi-VN')}đ
                      </span>
                      <div className="flex items-center text-yellow-500">
                        <Star className="w-3 h-3 md:w-4 md:h-4 fill-current" />
                        <span className="text-xs md:text-sm ml-1">4.8</span>
                      </div>
                    </div>
                    
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(product);
                      }}
                      className="w-full bg-green-600 hover:bg-green-700 text-white text-xs md:text-sm py-2"
                      data-testid={`button-add-cart-${product.id}`}
                    >
                      <ShoppingCart className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                      <span className="hidden md:inline">Thêm vào giỏ</span>
                      <span className="md:hidden">Thêm</span>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Product Modal */}
      <ProductModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={(product) => {
          const originalProduct = (storefrontData as StorefrontData).products.find(p => p.id === product.id);
          if (originalProduct) {
            addToCart(originalProduct);
          }
        }}
        cart={cart.map(item => ({
          product: convertedProducts.find(p => p.id === item.productId)!,
          quantity: item.quantity
        }))}
      />

      {/* Cart Sidebar */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsCartOpen(false)} />
          <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-lg lg:max-w-lg">
            <CartContent
              cart={cart}
              updateCartQuantity={updateCartQuantity}
              removeFromCart={removeFromCart}
              getCartTotal={getCartTotal}
              onCheckout={() => {
                setIsCartOpen(false);
                setIsCheckoutOpen(true);
              }}
              onClose={() => setIsCartOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsCheckoutOpen(false)} />
          <Card className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="text-green-800" data-testid="text-checkout-title">
                Thông tin đặt hàng
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Order Summary */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">Đơn hàng của bạn</h4>
                <div className="space-y-2">
                  {cart.map(item => (
                    <div key={item.productId} className="flex justify-between text-sm">
                      <span>{item.name} x {item.quantity}kg</span>
                      <span>{Math.round(item.price * item.quantity * 100) / 100}đ</span>
                    </div>
                  ))}
                  <Separator />
                  <div className="flex justify-between font-bold text-green-800">
                    <span>Tổng cộng:</span>
                    <span data-testid="text-checkout-total">
                      {getCartTotal().toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Customer Info */}
              <div className="space-y-3">
                {/* Phone Input */}
                <div>
                  <Label htmlFor="customerPhoneSearch">Số điện thoại *</Label>
                  <Input
                    id="customerPhoneSearch"
                    name="customerPhoneSearch"
                    value={customerInfo.phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="Nhập số điện thoại (3 số cuối để tìm member)"
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                    data-testid="input-customer-phone"
                  />
                  {isSearching && (
                    <p className="text-xs text-blue-600 mt-1" data-testid="text-searching">Đang tìm kiếm...</p>
                  )}
                  {selectedMember && (
                    <div className="mt-2 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 shadow-sm" data-testid="card-member-found">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-sm font-bold">★</span>
                            </div>
                            <div>
                              <p className="text-base font-bold text-blue-800">
                                Chào {selectedMember.name}!
                              </p>
                              <p className="text-xs text-blue-600">Thành viên VIP</p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Phone className="w-4 h-4 text-blue-500" />
                              <span>{selectedMember.phone}</span>
                            </div>
                            {selectedMember.email && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Mail className="w-4 h-4 text-blue-500" />
                                <span>{selectedMember.email}</span>
                              </div>
                            )}
                            {selectedMember.recentAddress && (
                              <div className="flex items-start gap-2 text-sm text-gray-600">
                                <MapPin className="w-4 h-4 text-blue-500 mt-0.5" />
                                <span className="flex-1">{selectedMember.recentAddress}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedMember(null);
                            setCustomerInfo({
                              ...customerInfo,
                              name: '',
                              email: '',
                              address: ''
                            });
                          }}
                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                  {!selectedMember && searchResults.length > 1 && (
                    <div className="mt-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
                      {searchResults.map(member => (
                        <button
                          key={member.id}
                          onClick={() => {
                            setSelectedMember(member);
                            setCustomerInfo({
                              ...customerInfo,
                              name: member.name,
                              email: member.email,
                              phone: member.phone,
                              address: member.recentAddress || customerInfo.address
                            });
                            setSearchResults([]);
                          }}
                          className="w-full p-3 hover:bg-gray-50 text-left border-b border-gray-100 last:border-0"
                        >
                          <p className="font-medium text-gray-800">{member.name}</p>
                          <p className="text-sm text-gray-500">{member.phone}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="customerName">Họ và tên *</Label>
                  <Input
                    id="customerName"
                    name="customerName"
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                    placeholder="Nhập họ tên đầy đủ"
                    data-testid="input-customer-name"
                  />
                </div>

                <div>
                  <Label htmlFor="customerEmail">Email</Label>
                  <Input
                    id="customerEmail"
                    name="customerEmail"
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                    placeholder="email@example.com"
                    data-testid="input-customer-email"
                  />
                </div>

                <div>
                  <Label htmlFor="customerAddress">Địa chỉ giao hàng *</Label>
                  <Textarea
                    id="customerAddress"
                    name="customerAddress"
                    value={customerInfo.address}
                    onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})}
                    placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                    rows={3}
                    data-testid="input-customer-address"
                  />
                </div>

                <div>
                  <Label>Hình thức giao hàng</Label>
                  <div className="space-y-2 mt-2">
                    <div
                      onClick={() => setCustomerInfo({...customerInfo, deliveryType: 'local_delivery'})}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        customerInfo.deliveryType === 'local_delivery' 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-gray-200 hover:border-green-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Truck className={`w-5 h-5 mt-0.5 ${
                          customerInfo.deliveryType === 'local_delivery' ? 'text-green-600' : 'text-gray-500'
                        }`} />
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">{getDeliveryInfo('local_delivery').title}</p>
                          <p className="text-sm text-gray-600">{getDeliveryInfo('local_delivery').description}</p>
                          <p className="text-xs text-green-600 mt-1">{getDeliveryInfo('local_delivery').timeInfo}</p>
                        </div>
                      </div>
                    </div>

                    <div
                      onClick={() => setCustomerInfo({...customerInfo, deliveryType: 'cod_shipping'})}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        customerInfo.deliveryType === 'cod_shipping' 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-gray-200 hover:border-green-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Package className={`w-5 h-5 mt-0.5 ${
                          customerInfo.deliveryType === 'cod_shipping' ? 'text-green-600' : 'text-gray-500'
                        }`} />
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">{getDeliveryInfo('cod_shipping').title}</p>
                          <p className="text-sm text-gray-600">{getDeliveryInfo('cod_shipping').description}</p>
                          <p className="text-xs text-gray-500 mt-1">{getDeliveryInfo('cod_shipping').timeInfo}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="customerNotes">Ghi chú</Label>
                  <Textarea
                    id="customerNotes"
                    name="customerNotes"
                    value={customerInfo.notes}
                    onChange={(e) => setCustomerInfo({...customerInfo, notes: e.target.value})}
                    placeholder="Thêm ghi chú cho đơn hàng (tùy chọn)"
                    rows={2}
                    data-testid="input-customer-notes"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsCheckoutOpen(false)}
                  className="flex-1"
                  data-testid="button-cancel-checkout"
                >
                  Hủy
                </Button>
                <Button
                  onClick={handleCheckout}
                  disabled={orderMutation.isPending}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  data-testid="button-confirm-checkout"
                >
                  {orderMutation.isPending ? 'Đang xử lý...' : 'Xác nhận đặt hàng'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      {(isMobile || isTablet) && (
        <StorefrontBottomNav
          activeTab={activeTab}
          onTabChange={handleTabChange}
          cartCount={cart.length}
        />
      )}

      {/* Chatbot Widget */}
      <ChatbotWidget pageType="storefront" />
    </div>
  );
}

// Cart Content Component
interface CartContentProps {
  cart: CartItem[];
  updateCartQuantity: (productId: string, newQuantity: number) => void;
  removeFromCart: (productId: string) => void;
  getCartTotal: () => number;
  onCheckout: () => void;
  onClose: () => void;
}

function CartContent({ cart, updateCartQuantity, removeFromCart, getCartTotal, onCheckout, onClose }: CartContentProps) {
  return (
    <Card className="h-full flex flex-col rounded-none">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-green-100">
        <CardTitle className="text-lg text-green-800">Giỏ hàng</CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose} data-testid="button-close-cart">
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto p-4">
        {cart.length === 0 ? (
          <div className="text-center py-8">
            <ShoppingCart className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">Giỏ hàng trống</p>
            <p className="text-sm text-gray-400">Thêm sản phẩm để bắt đầu mua sắm</p>
          </div>
        ) : (
          <div className="space-y-4">
            {cart.map((item) => (
              <div key={item.productId} className="bg-green-50 p-3 rounded-lg" data-testid={`cart-item-${item.productId}`}>
                <div className="flex gap-3 mb-3">
                  <img
                    src={item.image || '/placeholder-organic.jpg'}
                    alt={item.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-sm text-gray-800">{item.name}</h4>
                    <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                      {item.category}
                    </Badge>
                    <p className="text-sm text-green-600 font-semibold mt-1">
                      {item.price.toLocaleString('vi-VN')}đ/kg
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFromCart(item.productId)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    data-testid={`button-remove-${item.productId}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateCartQuantity(item.productId, Math.max(0.01, item.quantity - 0.1))}
                    className="h-8 w-8 p-0"
                    data-testid={`button-decrease-${item.productId}`}
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    <Input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={item.quantity}
                      onChange={(e) => {
                        const newQty = Math.round((parseFloat(e.target.value) || 0.01) * 100) / 100;
                        updateCartQuantity(item.productId, newQty);
                      }}
                      className="w-16 h-8 text-center text-sm"
                      data-testid={`input-quantity-${item.productId}`}
                    />
                    <span className="text-xs text-gray-500">kg</span>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateCartQuantity(item.productId, item.quantity + 0.1)}
                    className="h-8 w-8 p-0"
                    data-testid={`button-increase-${item.productId}`}
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
                
                <div className="flex justify-between items-center mt-2 text-sm">
                  <span className="text-gray-600">Thành tiền:</span>
                  <span className="font-semibold text-green-600">
                    {Math.round(item.price * item.quantity * 100) / 100}đ
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      
      {cart.length > 0 && (
        <CardFooter className="border-t border-green-100 p-4">
          <div className="w-full">
            <div className="bg-green-600 text-white p-3 rounded-lg mb-3">
              <div className="flex justify-between items-center">
                <span className="font-medium">Tổng cộng:</span>
                <span className="font-bold text-lg" data-testid="text-cart-total">
                  {getCartTotal().toLocaleString('vi-VN')}đ
                </span>
              </div>
            </div>
            <Button 
              onClick={onCheckout} 
              className="w-full bg-green-600 hover:bg-green-700"
              data-testid="button-checkout"
            >
              Tiến hành đặt hàng
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
