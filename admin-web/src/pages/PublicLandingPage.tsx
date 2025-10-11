import { useState, useEffect, useMemo } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useResponsive } from "@/hooks/use-mobile";
import { 
  Mail, 
  MapPin, 
  Star, 
  Check, 
  CheckCircle2,
  Plus, 
  ShoppingCart, 
  Shield,
  Truck,
  CreditCard,
  Clock,
  Users,
  Eye,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  X,
  Package
} from "lucide-react";
import ChatbotWidget from "@/components/ChatbotWidget";
import { MobileHeader } from "@/components/MobileHeader";
import { DesktopHeader } from "@/components/DesktopHeader";
import { ImageSlider } from "@/components/ImageSlider";
import { ProductModal } from "@/components/ProductModal";
import { ProductReviews } from "@/components/ProductReviews";
import { StorefrontBottomNav } from "@/components/StorefrontBottomNav";
import { calculateMarketingBadges } from "@/utils/marketingBadges";
import { formatVietnamPrice } from "@/utils/currency";

interface OrderFormData {
  name: string;
  phone: string;
  email: string;
  address: string;
  quantity: number;
  paymentMethod: 'cod' | 'bank_transfer' | 'online';
  notes: string;
}

interface ValidationErrors {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  paymentMethod?: string;
}

type CheckoutStep = 'product' | 'customer' | 'payment' | 'confirm';

const CHECKOUT_STEPS = [
  { id: 'product', title: 'Sản phẩm', description: 'Xem lại sản phẩm' },
  { id: 'customer', title: 'Thông tin', description: 'Thông tin khách hàng' },
  { id: 'payment', title: 'Thanh toán', description: 'Phương thức thanh toán' },
  { id: 'confirm', title: 'Xác nhận', description: 'Xác nhận đơn hàng' }
] as const;

export default function PublicLandingPage() {
  const { slug } = useParams();
  const { toast } = useToast();
  const { isMobile, isTablet, isDesktop } = useResponsive();

  const [orderForm, setOrderForm] = useState<OrderFormData>({
    name: "",
    phone: "",
    email: "",
    address: "",
    quantity: 1,
    paymentMethod: 'cod',
    notes: ""
  });

  const [showOrderForm, setShowOrderForm] = useState(false);
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('product');
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const [viewersCount, setViewersCount] = useState(Math.floor(Math.random() * 20) + 5);
  const [recentPurchases, setRecentPurchases] = useState([
    "Anh Minh vừa mua 2 phút trước",
    "Chị Hương vừa mua 5 phút trước",
    "Anh Nam vừa mua 8 phút trước"
  ]);
  
  // Stable social proof numbers (generated once per session)
  const [stableStats, setStableStats] = useState(() => ({
    bonusSales: Math.floor(Math.random() * 50) + 100,
    availableStock: Math.floor(Math.random() * 20) + 5,
    urgencyHours: Math.floor(Math.random() * 12) + 1
  }));

  // Affiliate tracking state
  const [affiliateCode, setAffiliateCode] = useState<string | null>(null);

  // Mobile navigation state
  const [activeTab, setActiveTab] = useState('home');

  // Product modal state
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

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
  
  // Simulate dynamic viewers count
  useEffect(() => {
    const interval = setInterval(() => {
      setViewersCount(prev => Math.max(3, prev + Math.floor(Math.random() * 3) - 1));
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Fetch landing page data
  const { data: landingPage, isLoading, error } = useQuery<any>({
    queryKey: ['/api/public-landing', slug],
  });

  // Create order mutation
  const orderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const response = await fetch('/api/landing-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...orderData,
          affiliateCode: affiliateCode
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create order');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Đặt hàng thành công!",
        description: "Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất.",
      });
      resetCheckoutForm();
    },
    onError: () => {
      toast({
        title: "Lỗi",
        description: "Không thể đặt hàng. Vui lòng thử lại.",
        variant: "destructive",
      });
    },
  });

  // Form validation functions
  const validateField = (field: string, value: string) => {
    switch (field) {
      case 'name':
        if (!value.trim()) return 'Họ và tên là bắt buộc';
        if (value.trim().length < 2) return 'Họ và tên phải có ít nhất 2 ký tự';
        return '';
      case 'phone':
        if (!value.trim()) return 'Số điện thoại là bắt buộc';
        const phoneRegex = /^(\+84|0)[0-9]{9,10}$/;
        if (!phoneRegex.test(value.replace(/\s/g, ''))) {
          return 'Số điện thoại không hợp lệ (VD: 0123456789)';
        }
        return '';
      case 'email':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return 'Email không hợp lệ';
        }
        return '';
      case 'address':
        if (!value.trim()) return 'Địa chỉ giao hàng là bắt buộc';
        if (value.trim().length < 10) return 'Vui lòng nhập địa chỉ chi tiết';
        return '';
      default:
        return '';
    }
  };

  const validateCurrentStep = () => {
    const errors: ValidationErrors = {};
    
    if (currentStep === 'customer') {
      errors.name = validateField('name', orderForm.name);
      errors.phone = validateField('phone', orderForm.phone);
      errors.email = validateField('email', orderForm.email);
      errors.address = validateField('address', orderForm.address);
    }
    
    setValidationErrors(errors);
    return Object.values(errors).every(error => !error);
  };

  const handleFieldChange = (field: string, value: string) => {
    setOrderForm(prev => ({ ...prev, [field]: value }));
    setTouchedFields(prev => new Set(prev).add(field));
    
    if (touchedFields.has(field)) {
      const error = validateField(field, value);
      setValidationErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  const handleNextStep = () => {
    if (validateCurrentStep()) {
      const stepIndex = CHECKOUT_STEPS.findIndex(step => step.id === currentStep);
      if (stepIndex < CHECKOUT_STEPS.length - 1) {
        setCurrentStep(CHECKOUT_STEPS[stepIndex + 1].id as CheckoutStep);
      }
    }
  };

  const handlePrevStep = () => {
    const stepIndex = CHECKOUT_STEPS.findIndex(step => step.id === currentStep);
    if (stepIndex > 0) {
      setCurrentStep(CHECKOUT_STEPS[stepIndex - 1].id as CheckoutStep);
    }
  };

  const handleOrder = () => {
    if (!validateCurrentStep()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng kiểm tra lại thông tin.",
        variant: "destructive",
      });
      return;
    }

    const totalPrice = (landingPage.finalPrice || 0) * orderForm.quantity;

    const orderData = {
      landingPageId: landingPage.id,
      customerInfo: {
        name: orderForm.name,
        phone: orderForm.phone,
        email: orderForm.email,
        address: orderForm.address,
      },
      productInfo: {
        productId: landingPage.productId,
        variantId: landingPage.variantId,
        quantity: orderForm.quantity,
        unitPrice: landingPage.finalPrice,
        totalPrice: totalPrice,
      },
      paymentMethod: orderForm.paymentMethod,
      notes: orderForm.notes,
    };

    orderMutation.mutate(orderData);
  };

  const resetCheckoutForm = () => {
    setShowOrderForm(false);
    setCurrentStep('product');
    setValidationErrors({});
    setTouchedFields(new Set());
    setOrderForm({
      name: "",
      phone: "",
      email: "",
      address: "",
      quantity: 1,
      paymentMethod: 'cod',
      notes: ""
    });
  };

  // Define safe derived variables with fallbacks
  const isDarkTheme = (landingPage?.theme ?? 'light') === 'dark';
  const finalPrice = landingPage?.finalPrice ?? 0;
  const originalPrice = landingPage?.originalPrice ?? null;
  const hasDiscount = originalPrice != null && originalPrice > finalPrice;
  const discountPercent = hasDiscount ? Math.round(((originalPrice - finalPrice)/originalPrice)*100) : 0;

  // Memoized color info calculation
  const colorInfo = useMemo(() => {
    const primaryColor = landingPage?.primaryColor || '#22c55e';
    const normalizeColor = (color: string) => {
      try {
        if (color.startsWith('#')) {
          let hex = color.toLowerCase();
          if (hex.length === 4) {
            hex = '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
          }
          
          if (hex.length === 7) {
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            
            if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
              return {
                hex,
                rgb: `${r}, ${g}, ${b}`
              };
            }
          }
        }
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) return { hex: '#22c55e', rgb: '34, 197, 94' };
        
        context.clearRect(0, 0, 1, 1);
        context.fillStyle = color;
        const normalizedColor = context.fillStyle;
        
        const rgbMatch = normalizedColor.match(/rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/i);
        if (rgbMatch) {
          const r = parseInt(rgbMatch[1], 10);
          const g = parseInt(rgbMatch[2], 10);
          const b = parseInt(rgbMatch[3], 10);
          
          if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
            const hex = '#' + [r, g, b].map(c => c.toString(16).padStart(2, '0')).join('');
            return {
              hex,
              rgb: `${r}, ${g}, ${b}`
            };
          }
        }
        
        return { hex: '#22c55e', rgb: '34, 197, 94' };
      } catch (error) {
        return { hex: '#22c55e', rgb: '34, 197, 94' };
      }
    };
    
    return normalizeColor(primaryColor);
  }, [landingPage?.primaryColor]);
  
  // Generate CSS custom properties
  const themeStyles = useMemo(() => ({
    '--theme-primary': colorInfo.hex,
    '--theme-primary-rgb': colorInfo.rgb,
    '--theme-primary-light': `rgba(${colorInfo.rgb}, 0.1)`,
    '--theme-primary-lighter': `rgba(${colorInfo.rgb}, 0.05)`,
    '--theme-primary-dark': `rgba(${colorInfo.rgb}, 0.9)`,
  } as React.CSSProperties), [colorInfo]);

  // Theme-aware CSS classes
  const themeClasses = useMemo(() => ({
    background: isDarkTheme ? 'bg-gray-900 text-white' : 'bg-background',
    card: isDarkTheme ? 'bg-gray-800 text-white' : 'bg-card',
    header: isDarkTheme ? 'bg-gray-800/95 border-gray-700' : 'bg-card/95 border-border',
    socialProof: isDarkTheme 
      ? 'bg-gradient-to-r from-green-900/50 to-emerald-900/50 border-green-700' 
      : 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200',
    textMuted: isDarkTheme ? 'text-gray-300' : 'text-muted-foreground',
  }), [isDarkTheme]);
  
  // Transform landing page product to ProductModal format
  const transformedProduct = useMemo(() => {
    if (!landingPage?.product) return null;

    const product = landingPage.product;
    const reviews = landingPage.reviewsData;

    return {
      id: product.id || landingPage.productId,
      name: product.name || landingPage.displayName,
      price: finalPrice,
      image: landingPage.displayImage || product.image,
      category_id: product.category_id || 'general',
      stock: landingPage.availableStock || stableStats.availableStock,
      short_description: product.short_description || landingPage.displayDescription,
      status: 'active',
      benefits: product.benefits || landingPage.features,
      rating: reviews?.averageRating || 4.8,
      reviewCount: reviews?.totalReviews || 0,
      totalReviews: reviews?.totalReviews || 0,
      positivePercent: reviews?.totalReviews > 0 ? 85 : undefined,
      createdAt: product.createdAt || new Date().toISOString(),
      originalPrice: originalPrice || undefined,
      isNew: false,
      isBestseller: (reviews?.totalReviews || 0) > 50,
      isFreeshipping: true,
      isTopseller: (reviews?.averageRating || 0) >= 4.5
    };
  }, [landingPage, finalPrice, originalPrice, stableStats.availableStock]);

  // Calculate marketing badges
  const marketingBadges = useMemo(() => {
    if (!transformedProduct) return { pricingBadges: [], reviewBadges: [] };

    return calculateMarketingBadges(
      {
        rating: transformedProduct.rating || 4.8,
        totalReviews: transformedProduct.totalReviews || 0,
        positivePercent: transformedProduct.positivePercent
      },
      {
        price: transformedProduct.price,
        originalPrice: transformedProduct.originalPrice,
        createdAt: transformedProduct.createdAt
      }
    );
  }, [transformedProduct]);

  // Prepare hero slider slides from product media
  const heroSlides = useMemo(() => {
    if (!landingPage?.displayImage) return [];

    const isVideo = (url: string) => {
      const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov'];
      return videoExtensions.some(ext => url.toLowerCase().endsWith(ext));
    };

    const slides = [];
    
    const displayImage = landingPage.displayImage;
    slides.push({
      url: displayImage,
      type: isVideo(displayImage) ? 'video' as const : 'image' as const,
      alt: landingPage.displayName
    });

    if (landingPage.product?.image && landingPage.product.image !== displayImage) {
      slides.push({
        url: landingPage.product.image,
        type: isVideo(landingPage.product.image) ? 'video' as const : 'image' as const,
        alt: landingPage.displayName
      });
    }

    return slides;
  }, [landingPage]);

  // SEO Meta Tags
  useEffect(() => {
    if (!landingPage) return;

    const product = landingPage.product;
    const reviews = landingPage.reviewsData;
    
    const seoTitle = `${product?.name || landingPage.title} - Giá chỉ ${finalPrice.toLocaleString('vi-VN')}đ | Mua ngay`;
    const seoDescription = landingPage.description || product?.description || `Mua ${product?.name} chính hãng, giá tốt nhất thị trường. ⭐ ${reviews?.averageRating?.toFixed(1) || '4.8'}/5 từ ${reviews?.totalReviews || 0} đánh giá.`;
    
    document.title = seoTitle;
    
    const existingMetaTags = document.querySelectorAll('meta[data-seo="true"]');
    existingMetaTags.forEach(tag => tag.remove());
    
    const metaTags = [
      { name: 'description', content: seoDescription },
      { property: 'og:type', content: 'product' },
      { property: 'og:title', content: seoTitle },
      { property: 'og:description', content: seoDescription },
      { property: 'og:image', content: landingPage.displayImage || product?.image || '' },
      { name: 'twitter:card', content: 'summary_large_image' },
    ];
    
    metaTags.forEach(({ name, property, content }) => {
      const meta = document.createElement('meta');
      if (name) meta.setAttribute('name', name);
      if (property) meta.setAttribute('property', property);
      meta.setAttribute('content', content);
      meta.setAttribute('data-seo', 'true');
      document.head.appendChild(meta);
    });
  }, [landingPage, finalPrice]);

  // Handle product quick view
  const handleProductQuickView = () => {
    if (transformedProduct) {
      setSelectedProduct(transformedProduct);
      setIsProductModalOpen(true);
    }
  };

  // Handle add to cart from ProductModal
  const handleAddToCartFromModal = (product: any) => {
    setShowOrderForm(true);
    setIsProductModalOpen(false);
  };

  // Mobile navigation handlers
  const handleCartClick = () => {
    setShowOrderForm(true);
  };

  const handleProfileClick = () => {
    toast({
      title: "Tính năng đang phát triển",
      description: "Trang cá nhân đang được phát triển"
    });
  };

  // Early returns for loading and error states
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error || !landingPage) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Không tìm thấy trang</h1>
          <p className="text-muted-foreground">Trang landing page không tồn tại hoặc đã bị tắt.</p>
        </div>
      </div>
    );
  }

  const storeName = landingPage.contactInfo?.businessName || "Shop Online";

  return (
    <div 
      className={`min-h-screen transition-colors duration-300 ${themeClasses.background} pb-20 lg:pb-0`}
      style={themeStyles}
    >
      {/* Responsive Header */}
      {isMobile || isTablet ? (
        <MobileHeader
          storeName={storeName}
          cartCount={orderForm.quantity}
          onCartClick={handleCartClick}
          onProfileClick={handleProfileClick}
        />
      ) : (
        <DesktopHeader
          storeName={storeName}
          cartCount={orderForm.quantity}
          searchQuery=""
          onSearchChange={() => {}}
          onCartClick={handleCartClick}
          onProfileClick={handleProfileClick}
          onLogoClick={() => window.location.href = '/'}
        />
      )}

      {/* Hero Section with ImageSlider */}
      <section className="bg-gradient-to-b from-green-50 to-white dark:from-gray-800 dark:to-gray-900 py-8 lg:py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Product Image/Video Slider */}
            <div className="order-1 lg:order-2">
              {heroSlides.length > 0 ? (
                <ImageSlider
                  slides={heroSlides}
                  className="rounded-lg shadow-2xl"
                  autoplay={heroSlides.length > 1}
                  autoplayDelay={5000}
                />
              ) : (
                <div className="w-full aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                  <Package className="h-24 w-24 text-gray-300" />
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="order-2 lg:order-1">
              <div className="space-y-4">
                {/* Marketing Badges */}
                {marketingBadges.topRating && (
                  <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-300">
                    {marketingBadges.topRating}
                  </Badge>
                )}

                <h1 className="text-3xl lg:text-4xl font-bold leading-tight">
                  {landingPage.heroTitle || landingPage.title}
                </h1>

                {landingPage.heroSubtitle && (
                  <p className="text-lg text-muted-foreground">
                    {landingPage.heroSubtitle}
                  </p>
                )}

                {/* Price */}
                <div className="py-4">
                  <div className="flex items-baseline gap-4 flex-wrap">
                    <span className="text-4xl lg:text-5xl font-bold text-green-600">
                      {formatVietnamPrice(finalPrice)}
                    </span>
                    {hasDiscount && (
                      <>
                        <span className="text-2xl line-through text-muted-foreground">
                          {formatVietnamPrice(originalPrice)}
                        </span>
                        <Badge variant="destructive" className="text-lg px-3 py-1">
                          -{discountPercent}%
                        </Badge>
                      </>
                    )}
                  </div>
                  {hasDiscount && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Tiết kiệm: {formatVietnamPrice(originalPrice - finalPrice)}
                    </p>
                  )}
                </div>

                {/* Marketing Badges Row */}
                <div className="flex flex-wrap gap-2">
                  {marketingBadges.pricingBadges.map((badge, idx) => (
                    <Badge key={idx} variant="outline" className="border-green-300 text-green-700 bg-green-50">
                      {badge}
                    </Badge>
                  ))}
                  {marketingBadges.reviewBadges.map((badge, idx) => (
                    <Badge key={idx} variant="outline" className="border-blue-300 text-blue-700 bg-blue-50">
                      {badge}
                    </Badge>
                  ))}
                </div>

                {/* Social Proof Stats */}
                <div className="flex flex-wrap items-center gap-4 py-4">
                  <div className="flex items-center gap-2 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
                    <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                    <span className="font-bold text-amber-700">
                      {landingPage.reviewsData?.averageRating?.toFixed(1) || '4.8'}
                    </span>
                    <span className="text-xs text-amber-600">
                      ({landingPage.reviewsData?.totalReviews || 0} đánh giá)
                    </span>
                  </div>

                  <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-lg border border-green-200">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="font-bold text-green-700">
                      {(landingPage.orderCount || 0) + stableStats.bonusSales}
                    </span>
                    <span className="text-xs text-green-600">Đã bán</span>
                  </div>

                  <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
                    <Eye className="h-4 w-4 text-blue-600" />
                    <span className="font-bold text-blue-700">{viewersCount}</span>
                    <span className="text-xs text-blue-600">đang xem</span>
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    { icon: Shield, text: 'Bảo hành chính hãng', color: 'text-green-600', emoji: '🛡️' },
                    { icon: Truck, text: 'Giao hàng miễn phí', color: 'text-blue-600', emoji: '🚚' },
                    { icon: null, text: 'Đổi trả 30 ngày', color: 'text-yellow-600', emoji: '🏆' },
                    { icon: null, text: 'Thanh toán bảo mật', color: 'text-purple-600', emoji: '🔒' }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      {item.icon ? <item.icon className={`h-5 w-5 ${item.color}`} /> : <span className="text-lg">{item.emoji}</span>}
                      <span className="text-xs lg:text-sm">{item.text}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button 
                    size="lg" 
                    className="flex-1 bg-green-600 hover:bg-green-700 text-lg h-12"
                    onClick={() => setShowOrderForm(true)}
                  >
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    {landingPage.callToAction || "Đặt hàng ngay"}
                  </Button>
                  
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="flex-1 lg:flex-none border-green-600 text-green-600 hover:bg-green-50 h-12"
                    onClick={handleProductQuickView}
                  >
                    <Eye className="h-5 w-5 mr-2" />
                    Xem chi tiết
                  </Button>
                </div>

                {/* Contact Info */}
                {landingPage.contactInfo?.phone && (
                  <a 
                    href={`tel:${landingPage.contactInfo.phone}`}
                    className="flex items-center gap-2 text-green-600 hover:text-green-700 transition-colors"
                  >
                    <span className="text-xl">📞</span>
                    <span className="font-semibold">{landingPage.contactInfo.phone}</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Strip */}
      <section className={`py-4 border-y transition-colors duration-300 ${themeClasses.socialProof}`}>
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap justify-center lg:justify-start">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-semibold text-green-800 dark:text-green-300">
                🔥 Hoạt động gần đây:
              </span>
              <div className="flex flex-wrap gap-2 text-xs text-green-700 dark:text-green-400">
                {recentPurchases.slice(0, 2).map((purchase, i) => (
                  <span key={i} className="flex items-center gap-1">
                    • {purchase}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
              <Clock className="h-4 w-4 animate-pulse" />
              <span className="text-sm font-medium">⏰ Còn {stableStats.urgencyHours}h!</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      {landingPage.features && landingPage.features.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Điểm nổi bật</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {landingPage.features.map((feature: string, index: number) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <p className="text-lg">{feature}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Customer Reviews Section */}
      {transformedProduct?.id && (
        <section className="py-16 bg-gray-50 dark:bg-gray-800">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Khách hàng nói gì</h2>
            <ProductReviews productId={transformedProduct.id} />
          </div>
        </section>
      )}

      {/* Trust Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <Truck className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Giao hàng tận nơi</h3>
              <p className="text-muted-foreground text-sm">Giao hàng toàn quốc, nhanh chóng</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Bảo hành chính hãng</h3>
              <p className="text-muted-foreground text-sm">Cam kết chất lượng 100%</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <CreditCard className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Đa dạng thanh toán</h3>
              <p className="text-muted-foreground text-sm">COD, chuyển khoản, online</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Liên hệ với chúng tôi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {landingPage.contactInfo?.phone && (
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-xl">📞</span>
                    <a 
                      href={`tel:${landingPage.contactInfo.phone}`}
                      className="text-lg font-semibold text-green-600 hover:underline"
                    >
                      {landingPage.contactInfo.phone}
                    </a>
                  </div>
                )}
                {landingPage.contactInfo?.email && (
                  <div className="flex items-center justify-center gap-3">
                    <Mail className="h-5 w-5 text-green-600" />
                    <a 
                      href={`mailto:${landingPage.contactInfo.email}`}
                      className="text-green-600 hover:underline"
                    >
                      {landingPage.contactInfo.email}
                    </a>
                  </div>
                )}
              </div>
              <Separator className="my-6" />
              <div className="text-center">
                <Button 
                  size="lg" 
                  onClick={() => setShowOrderForm(true)}
                  className="bg-green-600 hover:bg-green-700 text-lg px-8 py-4"
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  {landingPage.callToAction || "Đặt hàng ngay"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Mobile Bottom Navigation */}
      {(isMobile || isTablet) && (
        <StorefrontBottomNav
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            if (tab === 'cart') {
              handleCartClick();
            }
          }}
          cartCount={orderForm.quantity}
        />
      )}

      {/* Product Modal */}
      {transformedProduct && (
        <ProductModal
          product={transformedProduct}
          isOpen={isProductModalOpen}
          onClose={() => setIsProductModalOpen(false)}
          onAddToCart={handleAddToCartFromModal}
          cart={[{ product: transformedProduct, quantity: orderForm.quantity }]}
        />
      )}

      {/* Multi-Step Checkout Modal */}
      {showOrderForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <Card className={`w-full max-w-lg max-h-[95vh] overflow-hidden transition-all duration-300 transform ${themeClasses.card}`}>
            {/* Header with Progress */}
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between mb-4">
                <CardTitle className="text-lg md:text-xl">Đặt hàng</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetCheckoutForm}
                  className="h-8 w-8 p-0 hover:bg-destructive/10"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  {CHECKOUT_STEPS.map((step, index) => {
                    const isActive = step.id === currentStep;
                    const isCompleted = CHECKOUT_STEPS.findIndex(s => s.id === currentStep) > index;
                    return (
                      <div key={step.id} className={`flex-1 text-center transition-colors duration-200 ${
                        isActive ? 'text-primary font-medium' : isCompleted ? 'text-green-600' : ''
                      }`}>
                        {step.title}
                      </div>
                    );
                  })}
                </div>
                <div className="flex gap-1">
                  {CHECKOUT_STEPS.map((step, index) => {
                    const isActive = step.id === currentStep;
                    const isCompleted = CHECKOUT_STEPS.findIndex(s => s.id === currentStep) > index;
                    return (
                      <div
                        key={step.id}
                        className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                          isActive ? 'bg-primary' : isCompleted ? 'bg-green-500' : 'bg-muted'
                        }`}
                      />
                    );
                  })}
                </div>
              </div>
            </CardHeader>

            <CardContent className="px-6 pb-6 space-y-6 overflow-y-auto max-h-[60vh]">
              {/* Step 1: Product Review */}
              {currentStep === 'product' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2">Xem lại sản phẩm</h3>
                    <p className="text-sm text-muted-foreground">Kiểm tra thông tin sản phẩm và số lượng</p>
                  </div>
                  
                  <div className={`p-4 rounded-lg border ${isDarkTheme ? 'bg-gray-800 border-gray-700' : 'bg-muted/50 border-border'}`}>
                    <div className="flex gap-4 items-start">
                      {landingPage.displayImage && (
                        <img
                          src={landingPage.displayImage}
                          alt={landingPage.displayName}
                          className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold mb-1 truncate">{landingPage.displayName}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {landingPage.displayDescription}
                        </p>
                        <div className="flex items-baseline gap-2 mt-2">
                          <span className="text-xl font-bold text-primary">
                            {formatVietnamPrice(finalPrice)}
                          </span>
                          {hasDiscount && (
                            <span className="text-sm line-through text-muted-foreground">
                              {formatVietnamPrice(originalPrice)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quantity Selector */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Số lượng</Label>
                    <div className="flex items-center justify-center gap-4">
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => setOrderForm(prev => ({ 
                          ...prev, 
                          quantity: Math.max(1, prev.quantity - 1) 
                        }))}
                        className="h-12 w-12 rounded-full"
                        disabled={orderForm.quantity <= 1}
                      >
                        <span className="text-xl font-bold">−</span>
                      </Button>
                      
                      <div className="bg-muted rounded-lg px-6 py-3 min-w-[80px] text-center">
                        <span className="text-2xl font-bold">{orderForm.quantity}</span>
                      </div>
                      
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => setOrderForm(prev => ({ 
                          ...prev, 
                          quantity: prev.quantity + 1 
                        }))}
                        className="h-12 w-12 rounded-full"
                      >
                        <Plus className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>

                  {/* Price Summary */}
                  <div className={`p-4 rounded-lg border ${isDarkTheme ? 'bg-gray-800 border-gray-700' : 'bg-primary/5 border-primary/20'}`}>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Tổng cộng:</span>
                      <span className="text-2xl font-bold text-primary">
                        {formatVietnamPrice(finalPrice * orderForm.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Customer Information */}
              {currentStep === 'customer' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2">Thông tin khách hàng</h3>
                    <p className="text-sm text-muted-foreground">Điền thông tin để chúng tôi giao hàng</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="orderName" className="text-base font-medium">
                        Họ và tên <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="orderName"
                        value={orderForm.name}
                        onChange={(e) => handleFieldChange('name', e.target.value)}
                        onBlur={() => setTouchedFields(prev => new Set(prev).add('name'))}
                        placeholder="Nguyễn Văn A"
                        className={`h-12 text-base ${
                          validationErrors.name && touchedFields.has('name') ? 'border-destructive' : ''
                        }`}
                      />
                      {validationErrors.name && touchedFields.has('name') && (
                        <div className="flex items-center gap-1 text-destructive text-sm">
                          <span className="text-base">⚠️</span>
                          {validationErrors.name}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="orderPhone" className="text-base font-medium">
                        Số điện thoại <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="orderPhone"
                        type="tel"
                        value={orderForm.phone}
                        onChange={(e) => handleFieldChange('phone', e.target.value)}
                        onBlur={() => setTouchedFields(prev => new Set(prev).add('phone'))}
                        placeholder="0123 456 789"
                        className={`h-12 text-base ${
                          validationErrors.phone && touchedFields.has('phone') ? 'border-destructive' : ''
                        }`}
                      />
                      {validationErrors.phone && touchedFields.has('phone') && (
                        <div className="flex items-center gap-1 text-destructive text-sm">
                          <span className="text-base">⚠️</span>
                          {validationErrors.phone}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="orderEmail" className="text-base font-medium">Email</Label>
                      <Input
                        id="orderEmail"
                        type="email"
                        value={orderForm.email}
                        onChange={(e) => handleFieldChange('email', e.target.value)}
                        onBlur={() => setTouchedFields(prev => new Set(prev).add('email'))}
                        placeholder="email@example.com"
                        className={`h-12 text-base ${
                          validationErrors.email && touchedFields.has('email') ? 'border-destructive' : ''
                        }`}
                      />
                      {validationErrors.email && touchedFields.has('email') && (
                        <div className="flex items-center gap-1 text-destructive text-sm">
                          <span className="text-base">⚠️</span>
                          {validationErrors.email}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="orderAddress" className="text-base font-medium">
                        Địa chỉ giao hàng <span className="text-destructive">*</span>
                      </Label>
                      <Textarea
                        id="orderAddress"
                        value={orderForm.address}
                        onChange={(e) => handleFieldChange('address', e.target.value)}
                        onBlur={() => setTouchedFields(prev => new Set(prev).add('address'))}
                        placeholder="Số nhà, đường, phường, quận, thành phố"
                        rows={3}
                        className={`text-base resize-none ${
                          validationErrors.address && touchedFields.has('address') ? 'border-destructive' : ''
                        }`}
                      />
                      {validationErrors.address && touchedFields.has('address') && (
                        <div className="flex items-center gap-1 text-destructive text-sm">
                          <span className="text-base">⚠️</span>
                          {validationErrors.address}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Payment Method */}
              {currentStep === 'payment' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2">Phương thức thanh toán</h3>
                    <p className="text-sm text-muted-foreground">Chọn cách thức thanh toán phù hợp</p>
                  </div>
                  
                  <div className="space-y-3">
                    {landingPage.paymentMethods?.cod && (
                      <label 
                        className={`flex items-start gap-4 p-4 border rounded-lg cursor-pointer transition-all hover:bg-muted/50 ${
                          orderForm.paymentMethod === 'cod' ? 'border-primary bg-primary/5' : 'border-border'
                        }`}
                      >
                        <input
                          type="radio"
                          value="cod"
                          checked={orderForm.paymentMethod === 'cod'}
                          onChange={(e) => setOrderForm(prev => ({ ...prev, paymentMethod: e.target.value as any }))}
                          className="mt-1 w-4 h-4"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Truck className="h-5 w-5 text-primary" />
                            <span className="font-medium">Thanh toán khi nhận hàng (COD)</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Thanh toán bằng tiền mặt khi nhận được hàng
                          </p>
                        </div>
                      </label>
                    )}
                    
                    {landingPage.paymentMethods?.bankTransfer && (
                      <label 
                        className={`flex items-start gap-4 p-4 border rounded-lg cursor-pointer transition-all hover:bg-muted/50 ${
                          orderForm.paymentMethod === 'bank_transfer' ? 'border-primary bg-primary/5' : 'border-border'
                        }`}
                      >
                        <input
                          type="radio"
                          value="bank_transfer"
                          checked={orderForm.paymentMethod === 'bank_transfer'}
                          onChange={(e) => setOrderForm(prev => ({ ...prev, paymentMethod: e.target.value as any }))}
                          className="mt-1 w-4 h-4"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <CreditCard className="h-5 w-5 text-primary" />
                            <span className="font-medium">Chuyển khoản ngân hàng</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Chuyển khoản trước khi giao hàng
                          </p>
                        </div>
                      </label>
                    )}
                    
                    {landingPage.paymentMethods?.online && (
                      <label 
                        className={`flex items-start gap-4 p-4 border rounded-lg cursor-pointer transition-all hover:bg-muted/50 ${
                          orderForm.paymentMethod === 'online' ? 'border-primary bg-primary/5' : 'border-border'
                        }`}
                      >
                        <input
                          type="radio"
                          value="online"
                          checked={orderForm.paymentMethod === 'online'}
                          onChange={(e) => setOrderForm(prev => ({ ...prev, paymentMethod: e.target.value as any }))}
                          className="mt-1 w-4 h-4"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Shield className="h-5 w-5 text-primary" />
                            <span className="font-medium">Thanh toán online</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Thanh toán an toàn qua cổng thanh toán
                          </p>
                        </div>
                      </label>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="orderNotes" className="text-base font-medium">Ghi chú</Label>
                    <Textarea
                      id="orderNotes"
                      value={orderForm.notes}
                      onChange={(e) => setOrderForm(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Ghi chú thêm cho đơn hàng (không bắt buộc)..."
                      rows={3}
                      className="text-base resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Step 4: Order Confirmation */}
              {currentStep === 'confirm' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Xác nhận đặt hàng</h3>
                    <p className="text-sm text-muted-foreground">Kiểm tra lại thông tin trước khi đặt hàng</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className={`p-4 border rounded-lg space-y-3 ${isDarkTheme ? 'bg-gray-800 border-gray-700' : 'bg-muted/30 border-border'}`}>
                      <div className="flex items-center gap-3">
                        <ShoppingCart className="h-5 w-5 text-primary" />
                        <span className="font-medium">Sản phẩm</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>{landingPage.displayName} x {orderForm.quantity}</span>
                        <span className="font-semibold">{formatVietnamPrice(finalPrice * orderForm.quantity)}</span>
                      </div>
                    </div>
                    
                    <div className={`p-4 border rounded-lg space-y-3 ${isDarkTheme ? 'bg-gray-800 border-gray-700' : 'bg-muted/30 border-border'}`}>
                      <div className="flex items-center gap-3">
                        <Users className="h-5 w-5 text-primary" />
                        <span className="font-medium">Thông tin khách hàng</span>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div><strong>Tên:</strong> {orderForm.name}</div>
                        <div><strong>SĐT:</strong> {orderForm.phone}</div>
                        {orderForm.email && <div><strong>Email:</strong> {orderForm.email}</div>}
                        <div><strong>Địa chỉ:</strong> {orderForm.address}</div>
                      </div>
                    </div>
                    
                    <div className={`p-4 border rounded-lg space-y-3 ${isDarkTheme ? 'bg-gray-800 border-gray-700' : 'bg-muted/30 border-border'}`}>
                      <div className="flex items-center gap-3">
                        <CreditCard className="h-5 w-5 text-primary" />
                        <span className="font-medium">Thanh toán</span>
                      </div>
                      <div className="text-sm">
                        {orderForm.paymentMethod === 'cod' && 'Thanh toán khi nhận hàng (COD)'}
                        {orderForm.paymentMethod === 'bank_transfer' && 'Chuyển khoản ngân hàng'}
                        {orderForm.paymentMethod === 'online' && 'Thanh toán online'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>

            {/* Footer Navigation */}
            <div className="p-6 border-t flex gap-3">
              {currentStep !== 'product' && (
                <Button
                  variant="outline"
                  onClick={handlePrevStep}
                  className="flex-1"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Quay lại
                </Button>
              )}
              
              {currentStep !== 'confirm' ? (
                <Button
                  onClick={handleNextStep}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  Tiếp tục
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleOrder}
                  disabled={orderMutation.isPending}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {orderMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Xác nhận đặt hàng
                    </>
                  )}
                </Button>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Chatbot Widget */}
      <ChatbotWidget pageType="landing_page" />
    </div>
  );
}
