'use client'

import React, { useState, useMemo, useCallback, useEffect, Suspense } from 'react';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { ShoppingCart, User, ArrowLeft, Plus, Minus, Store, Calendar, Star, Leaf, Flame, Crown, Package, Gift, Sparkles, Award, Shield, ChevronDown, Circle, Heart, ShoppingBag, Smartphone, BookOpen, Shirt, Home, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StorefrontBottomNav } from '@/components/StorefrontBottomNav';
import { MobileHeader } from '@/components/MobileHeader';
import { DesktopHeader } from '@/components/DesktopHeader';
import { DesktopShopeeHeader } from '@/components/DesktopShopeeHeader';
import { AutoHideSearchBar } from '@/components/AutoHideSearchBar';
import { HiddenSearchBar } from '@/components/HiddenSearchBar';
import { FullScreenLunarCalendar } from '@/components/FullScreenLunarCalendar';
import CategoryBottomSheet from '@/components/CategoryBottomSheet';
import { MediaViewer } from '@/components/MediaViewer';
import { ImageSlider } from '@/components/ImageSlider';
import DesktopFooter from '@/components/DesktopFooter';
import { ProductModal } from '@/components/ProductModal';
import { ProductCard } from '@/components/ProductCard';
import { useResponsive } from '@/hooks/use-mobile';
import { useAuth } from '@/hooks/useAuth';
import { formatVietnamPrice } from '@/utils/currency';
import { VipTierCard } from '@/components/VipTierCard';
import { calculateVipStatus } from '@/utils/vipCalculator';
import { calculateMarketingBadges } from '@/utils/marketingBadges';
import { fetchProducts } from '@/services/apiService';
import { markInternalNav } from '@/utils/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

const ProfileTab = dynamic(() => import('@/components/ProfileTab').then(m => m.ProfileTab), {
  loading: () => <div className="p-4 text-center">Đang tải...</div>,
  ssr: false
});

const BlogTab = dynamic(() => import('@/components/BlogTab').then(m => m.BlogTab), {
  loading: () => <div className="p-4 text-center">Đang tải...</div>,
  ssr: false
});

const BlogPost = dynamic(() => import('@/components/BlogPost').then(m => m.BlogPost), {
  loading: () => <div className="p-4 text-center">Đang tải...</div>,
  ssr: false
});

const DesktopChatBot = dynamic(() => import('@/components/DesktopChatBot').then(m => m.default), {
  loading: () => null,
  ssr: false
});

const MobileChatBot = dynamic(() => import('@/components/MobileChatBot').then(m => m.default), {
  loading: () => null,
  ssr: false
});

const DesktopFullPageView = dynamic(() => import('@/components/DesktopFullPageView').then(m => m.DesktopFullPageView), {
  loading: () => <div className="p-4 text-center">Đang tải...</div>,
  ssr: false
});

// Lazy load blog section - only load when user scrolls near it
const BlogFeaturedSection = dynamic(() => import('@/components/BlogFeaturedSection').then(mod => ({ default: mod.BlogFeaturedSection })), {
  loading: () => (
    <div className="w-full h-96 bg-white/60 backdrop-blur-md rounded-xl border border-tramhuong-accent/20 animate-pulse" />
  ),
  ssr: false // Blog is below the fold, client-only is fine
});

// API base URL from environment or default  
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

// Luxury packaging-themed hero images (fallback)
const LUXURY_HERO_IMAGES = [
  {
    type: 'image' as const,
    url: '/images/tramhuong-packaging-hero.png',
    alt: 'Trầm Hương Hoàng Ngân - Bộ sản phẩm cao cấp'
  },
  {
    type: 'image' as const,
    url: '/images/tramhuong-packaging-hero.png',
    alt: 'Tinh hoa trầm hương từ đất Bồi'
  },
  {
    type: 'image' as const,
    url: '/images/tramhuong-packaging-hero.png',
    alt: 'Trầm hương trong văn hóa tâm linh'
  }
];

// Interface for shop settings
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

interface Product {
  id: string;
  slug?: string;
  name: string;
  price: number;
  originalPrice?: number;  // For calculating discount
  image?: string;
  media?: string; // Support both image and video URLs
  category_id: string;
  stock: number;
  short_description?: string;
  status: string;
  benefits?: string | string[];
  // Badge properties
  isNew?: boolean;
  isTopseller?: boolean;
  isFreeshipping?: boolean;
  isBestseller?: boolean;
  // Review metrics for marketing badges
  rating?: number;
  reviewCount?: number;
  totalReviews?: number;
  positivePercent?: number;
  // Timestamps
  createdAt?: string | Date;
}

interface Category {
  id: string;
  name: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  publishedAt: string;
  category: string;
  tags: string[];
  imageUrl?: string;
  readingTime: number;
  isNew?: boolean;
  isFeatured?: boolean;
  views?: number;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
}

export default function MobileStorefront() {
  // Router for navigation
  const router = useRouter();
  
  // Responsive hooks
  const { isMobile, isTablet } = useResponsive();
  
  // Authentication
  const { user, isAuthenticated } = useAuth();
  
  // Suppress timeout errors in browser console
  useEffect(() => {
    const handleRejection = (event: PromiseRejectionEvent) => {
      if (event.reason?.message?.includes('timeout') || event.reason?.name === 'TimeoutError') {
        event.preventDefault();
        console.warn('Request timeout - using fallback data');
      }
    };
    window.addEventListener('unhandledrejection', handleRejection);
    return () => window.removeEventListener('unhandledrejection', handleRejection);
  }, []);
  
  const [activeTab, setActiveTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [forceFullView, setForceFullView] = useState(false);
  const [showCategorySheet, setShowCategorySheet] = useState(false);
  
  // Sample products for Enhanced Product Cards demo
  const sampleProducts = [
    { id: 1, name: 'Nhang Trầm Hương Cao Cấp', price: 150000 },
    { id: 2, name: 'Tinh Dầu Thầo Dược Thiên Nhiên', price: 200000 },
    { id: 3, name: 'Nước Hoa Hương Đào', price: 120000 },
    { id: 4, name: 'Thầy Tinh Thanh Tịnh', price: 180000 }
  ];
  const [selectedBlogPost, setSelectedBlogPost] = useState<BlogPost | null>(null);
  const [blogSearchQuery, setBlogSearchQuery] = useState('');
  const [blogSelectedCategory, setBlogSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'newest'>('newest');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Enhanced responsive layout configurations - Memoized for performance
  const layoutConfig = useMemo(() => ({
    gridCols: isMobile ? 'grid-cols-1' : 'grid-cols-3',
    containerClass: 'w-full',
    contentPadding: isMobile ? 'px-3 py-4' : 'px-6 py-8 lg:px-12 xl:px-16',
    gridGap: isMobile ? 'gap-2' : 'gap-4 lg:gap-5 xl:gap-6',
    showBottomNav: isMobile,
    desktopProductContainer: 'max-w-7xl mx-auto',
    sectionSpacing: 'mb-16',
    cardShadow: 'shadow-lg hover:shadow-xl',
    cardBorder: 'border border-gray-100 hover:border-tramhuong-accent'
  }), [isMobile, isTablet]);
  
  
  

  // Infinite scroll setup - fetch products with pagination
  const { 
    data: productsData,
    isLoading: productsLoading, 
    error: productsError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isRefetching: productsRefetching 
  } = useInfiniteQuery<Product[]>({
    queryKey: ['mobile-products', selectedCategory, searchQuery, sortBy, sortOrder],
    queryFn: async ({ pageParam = 0 }) => {
      try {
        return await fetchProducts({
          limit: 20,
          offset: pageParam as number,
          categoryId: selectedCategory !== 'all' ? selectedCategory : undefined,
          search: searchQuery || undefined,
          sortBy,
          sortOrder
        });
      } catch (error) {
        console.error('Query error caught, returning empty array:', error);
        return [];
      }
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < 20) return undefined;
      return allPages.length * 20;
    },
    initialPageParam: 0,
    retry: false,
    staleTime: 30000,
  });
  
  // Flatten pages into single array
  const products = productsData?.pages.flat() || [];

  // Fetch shop settings for hero slider
  const { data: shopSettingsData, isLoading: shopSettingsLoading } = useQuery<{ data: ShopSettings }>({
    queryKey: ['/api/shop-settings'],
    queryFn: async () => {
      const res = await fetch('/api/shop-settings');
      if (!res.ok) throw new Error('Failed to fetch shop settings');
      return res.json();
    },
    retry: false,
    staleTime: 60000,
  });

  // Process hero slider data - use fetched data or fallback to luxury images
  const heroSlides = useMemo(() => {
    const heroSlider = shopSettingsData?.data?.heroSlider;
    if (heroSlider && heroSlider.length > 0) {
      return heroSlider;
    }
    // Fallback to LUXURY_HERO_IMAGES if no hero slider data
    return LUXURY_HERO_IMAGES;
  }, [shopSettingsData]);

  // Demo products with badges for testing (when API fails)
  const demoProducts: Product[] = [
    {
      id: 'demo-1',
      name: 'Nhang Trầm Hương Cao Cấp',
      price: 150000,
      originalPrice: 200000,  // 25% discount
      image: '/images/modern_e-commerce_ba_70f9ff6e.jpg',
      category_id: 'incense',
      stock: 50,
      short_description: 'Nhang trầm hương thượng hạng từ Huế',
      status: 'active',
      benefits: ['Thanh tịnh tâm hồn', 'Thơm dịu nhẹ'],
      isNew: true,
      isTopseller: true,
      rating: 4.8,
      totalReviews: 120,
      positivePercent: 92,
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) // 15 days ago
    },
    {
      id: 'demo-2', 
      name: 'Nhang Sandalwood Premium',
      price: 200000,
      originalPrice: 250000,  // 20% discount
      image: '/images/modern_e-commerce_ba_a5ed4b23.jpg',
      category_id: 'incense',
      stock: 30,
      short_description: 'Nhang gỗ đàn hương nguyên chất',
      status: 'active',
      benefits: ['Thư giãn', 'Thiền định'],
      isFreeshipping: true,
      isBestseller: true,
      rating: 4.6,
      totalReviews: 85,
      positivePercent: 88,
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) // 60 days ago
    },
    {
      id: 'demo-3',
      name: 'Nhang Que Truyền Thống',
      price: 80000,
      originalPrice: 110000,  // 27% discount
      image: '/images/modern_e-commerce_ba_9f23a27c.jpg',
      category_id: 'incense',
      stock: 100,
      short_description: 'Nhang que làm thủ công theo phương pháp cổ truyền',
      status: 'active',
      benefits: ['Tôn giáo', 'Gia đình'],
      isNew: true,
      isFreeshipping: true,
      rating: 4.9,
      totalReviews: 203,
      positivePercent: 95,
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) // 10 days ago
    },
    {
      id: 'demo-4',
      name: 'Bộ Nhang Ngũ Hành',
      price: 350000,
      originalPrice: 400000,  // 12.5% discount
      image: '/images/modern_e-commerce_ba_70f9ff6e.jpg',
      category_id: 'incense',
      stock: 20,
      short_description: 'Bộ nhang 5 loại theo ngũ hành kim, mộc, thủy, hỏa, thổ',
      status: 'active',
      benefits: ['Cân bằng năng lượng', 'Phong thủy'],
      isTopseller: true,
      isBestseller: true,
      isFreeshipping: true,
      rating: 4.3,
      totalReviews: 45,
      positivePercent: 78,
      createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // 90 days ago
    }
  ];

  // Use demo products when API fails or returns empty
  const displayProducts = (products.length > 0 || productsLoading) ? products : demoProducts;
  
  // Force demo products when error or no products available (even during loading if products exist)
  const finalProducts = products.length > 0 ? products : demoProducts;

  // Fetch real categories with loading states
  const { 
    data: allCategories = [], 
    isLoading: categoriesLoading,
    error: categoriesError 
  } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      // Use local proxy route instead of external API
      const response = await fetch(`/api/categories/filter?frontendId=frontend-a`);
      if (!response.ok) throw new Error('Failed to fetch categories');
      return response.json();
    }
  });
  
  // Helper function to get category icons
  function getCategoryIcon(categoryName: string): JSX.Element {
    const name = categoryName.toLowerCase();
    const iconClass = "w-6 h-6 text-tramhuong-accent";
    if (name.includes('điện') || name.includes('phone') || name.includes('tech')) return <Smartphone className={iconClass} />;
    if (name.includes('sách') || name.includes('book')) return <BookOpen className={iconClass} />;
    if (name.includes('làm đẹp') || name.includes('beauty') || name.includes('cosmetic')) return <Sparkles className={iconClass} />;
    if (name.includes('thời trang') || name.includes('fashion') || name.includes('clothes')) return <Shirt className={iconClass} />;
    if (name.includes('gia dụng') || name.includes('home')) return <Home className={iconClass} />;
    if (name.includes('thể thao') || name.includes('sport')) return <Circle className={iconClass} />;
    return <Package className={iconClass} />;
  }
  
  // Create simplified category list with real IDs (filter out duplicate "all")
  const categories = categoriesLoading ? [] : [
    { id: 'all', name: 'Tất cả', icon: <ShoppingBag className="w-6 h-6 text-tramhuong-accent" /> },
    ...allCategories
      .filter(cat => cat.id !== 'all') // Prevent duplicate "all" key
      .map(cat => ({
        id: cat.id,
        name: cat.name,
        icon: getCategoryIcon(cat.name)
      }))
  ];

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev => 
      prev.map(item =>
        item.product.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const handleTabChange = (tab: string) => {
    setSelectedProduct(null); // Always clear product view when changing tabs
    
    // Navigate to ride-sharing page
    if (tab === 'ride') {
      router.push('/datxe');
      return;
    }
    
    // Handle categories tab - open bottom sheet
    if (tab === 'categories') {
      setShowCategorySheet(true);
      return;
    }
    
    setActiveTab(tab);
  };


  const handleHeaderSearchClick = () => {
    setActiveTab('home');
    // Focus search input if it exists
    setTimeout(() => {
      const searchInput = document.querySelector('input[placeholder*="Tìm kiếm"]') as HTMLInputElement;
      if (searchInput) {
        searchInput.focus();
        searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  const handleHeaderCartClick = () => {
    setActiveTab('cart');
  };

  const handleProfileClick = () => {
    setActiveTab('profile');
  };

  // Helper function to render product badges
  const renderProductBadges = (product: Product) => {
    const badges = [];
    
    if (product.isNew) {
      badges.push(
        <Badge key="new" variant="new" className="text-sm flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-tramhuong-accent" />
          MỚI
        </Badge>
      );
    }
    
    if (product.isTopseller) {
      badges.push(
        <Badge key="topseller" variant="topseller" className="text-sm flex items-center gap-1">
          <Award className="w-3 h-3 text-tramhuong-accent" />
          BÁN CHẠY
        </Badge>
      );
    }
    
    if (product.isFreeshipping) {
      badges.push(
        <Badge key="freeshipping" variant="freeshipping" className="text-sm flex items-center gap-1">
          <Truck className="w-3 h-3 text-tramhuong-accent" />
          FREESHIP
        </Badge>
      );
    }
    
    if (product.isBestseller) {
      badges.push(
        <Badge key="bestseller" variant="bestseller" className="text-sm flex items-center gap-1">
          <Star className="w-3 h-3 text-tramhuong-accent" />
          YÊU THÍCH
        </Badge>
      );
    }
    
    return badges;
  };

  const renderContent = () => {
    // Desktop full page view - use professional 2-column layout
    if (selectedProduct && !isMobile && forceFullView) {
      return (
        <DesktopFullPageView
          product={selectedProduct}
          cart={cart}
          onBack={() => {
            setSelectedProduct(null);
            setForceFullView(false);
          }}
          onAddToCart={(product, quantity) => {
            // Add multiple quantities at once
            for (let i = 0; i < quantity; i++) {
              addToCart(product);
            }
          }}
        />
      );
    }

    // Mobile full page view - use existing mobile layout
    if (selectedProduct && isMobile) {
      return (
        <div className="bg-white min-h-screen">
          {/* Product Image */}
          <div className="aspect-square bg-gray-100 relative">
            <MediaViewer
              src={selectedProduct.media || selectedProduct.image}
              alt={selectedProduct.name}
              className="w-full h-full object-cover"
              isHomepage={false} // Product detail view is not homepage
            />
            {/* Back Button */}
            <button 
              onClick={() => {
                setSelectedProduct(null);
                setForceFullView(false);
              }}
              className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-white/90 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-700" />
            </button>
          </div>

          {/* Product Info */}
          <div className="p-6 space-y-4">
            {/* Name & Price */}
            <div>
              {/* Product Name and Badges - inline layout */}
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <h1 className="text-2xl font-bold text-gray-900">
                  {selectedProduct.name}
                </h1>
                {/* Product Badges - displayed next to product name */}
                {renderProductBadges(selectedProduct).length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {renderProductBadges(selectedProduct)}
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl font-bold text-tramhuong-accent font-playfair">
                  {formatVietnamPrice(selectedProduct.price)}
                </span>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-tramhuong-accent text-tramhuong-accent" />
                  <Star className="h-4 w-4 fill-tramhuong-accent text-tramhuong-accent" />
                  <Star className="h-4 w-4 fill-tramhuong-accent text-tramhuong-accent" />
                  <Star className="h-4 w-4 fill-tramhuong-accent text-tramhuong-accent" />
                  <Star className="h-4 w-4 fill-gray-200 text-gray-200" />
                  <span className="text-sm text-gray-600 ml-1">(4.0)</span>
                </div>
              </div>
            </div>

            {/* Description */}
            {selectedProduct.short_description && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Mô tả</h3>
                <p className="text-gray-600 leading-relaxed">
                  {selectedProduct.short_description}
                </p>
              </div>
            )}

            {/* Benefits */}
            {selectedProduct.benefits && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Công dụng</h3>
                <ul className="space-y-1">
                  {(typeof selectedProduct.benefits === 'string' 
                    ? selectedProduct.benefits.split(',').map(b => b.trim()).filter(b => b.length > 0)
                    : selectedProduct.benefits
                  ).map((benefit, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-600">
                      <span className="text-tramhuong-accent mt-1">•</span>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Tình trạng:</span>
              {selectedProduct.stock > 0 ? (
                <span className="text-sm text-tramhuong-accent font-medium">
                  Còn hàng ({selectedProduct.stock} sản phẩm)
                </span>
              ) : (
                <span className="text-sm text-red-600 font-medium">Hết hàng</span>
              )}
            </div>

            {/* Quantity in Cart */}
            {cart.find(item => item.product.id === selectedProduct.id) && (
              <div className="bg-tramhuong-accent/10 border border-tramhuong-accent rounded-lg p-3">
                <div className="flex items-center gap-2 text-tramhuong-accent">
                  <ShoppingCart className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    Đã có {cart.find(item => item.product.id === selectedProduct.id)?.quantity} sản phẩm trong giỏ hàng
                  </span>
                </div>
              </div>
            )}

            {/* Add to Cart Button */}
            <div className="pt-4">
              <Button
                onClick={() => addToCart(selectedProduct)}
                disabled={selectedProduct.stock === 0}
                className="w-full gradient-incense-gold text-white py-3 text-lg font-semibold shadow-lg hover:shadow-luxury-lg transition-all duration-300 disabled:bg-gray-400"
              >
                <Plus className="h-5 w-5 mr-2" />
                {selectedProduct.stock === 0 ? 'Hết hàng' : 'Thêm vào giỏ'}
              </Button>
            </div>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'categories':
        return (
          <div className={`${layoutConfig.containerClass}`}>
            <div className={`${layoutConfig.contentPadding} pt-6`}>
              <h2 className="text-xl font-bold mb-4 text-tramhuong-primary font-playfair">Danh mục sản phẩm</h2>
              <div className={`grid ${isMobile ? 'grid-cols-2' : isTablet ? 'grid-cols-3' : 'grid-cols-4 lg:grid-cols-5'} gap-4 md:gap-5 lg:gap-6`}>
                {categories.map((category) => {
                  const isSelected = selectedCategory === category.id;
                  
                  return (
                    <button
                      key={category.id}
                      onClick={() => {
                        setSelectedCategory(category.id);
                        setActiveTab('home');
                      }}
                      className={`
                        group relative
                        min-h-[200px] ${isMobile ? 'min-h-[160px] p-6' : isTablet ? 'p-7' : 'p-8'}
                        rounded-xl
                        transition-all duration-300 ease-out
                        cursor-pointer
                        ${isSelected 
                          ? 'bg-[rgba(193,168,117,0.15)] border-2 border-tramhuong-accent shadow-[0_4px_16px_rgba(193,168,117,0.3),0_12px_32px_rgba(193,168,117,0.2)] -translate-y-2' 
                          : 'bg-[rgba(250,248,245,0.7)] border border-[rgba(61,43,31,0.2)] shadow-[0_2px_8px_rgba(61,43,31,0.08),0_8px_24px_rgba(61,43,31,0.12)] hover:-translate-y-2 hover:shadow-[0_4px_16px_rgba(61,43,31,0.12),0_12px_32px_rgba(61,43,31,0.18),0_16px_40px_rgba(193,168,117,0.15)] hover:border-[rgba(193,168,117,0.6)]'
                        }
                        backdrop-blur-[12px]
                      `}
                    >
                      <div className="flex flex-col items-center justify-center gap-5 h-full">
                        <div 
                          className={`
                            w-20 h-20 rounded-full
                            flex items-center justify-center
                            transition-all duration-300 ease-out
                            ${isSelected
                              ? 'bg-[rgba(193,168,117,0.3)] border-2 border-[rgba(193,168,117,0.5)] scale-110'
                              : 'bg-[rgba(193,168,117,0.1)] border-2 border-[rgba(193,168,117,0.3)] group-hover:bg-[rgba(193,168,117,0.2)] group-hover:border-[rgba(193,168,117,0.5)] group-hover:scale-110'
                            }
                          `}
                        >
                          {category.icon}
                        </div>
                        
                        <h3 className={`
                          font-playfair text-lg text-center tracking-wide
                          ${isSelected ? 'text-tramhuong-accent font-semibold' : 'text-tramhuong-primary font-medium'}
                          transition-colors duration-300
                        `}>
                          {category.name}
                        </h3>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        );

      case 'cart':
        return (
          <div className="p-4 pt-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Giỏ hàng ({getTotalItems()} sản phẩm)</h2>
            {cart.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">Giỏ hàng trống</p>
                <p className="text-gray-400 text-sm">Thêm sản phẩm để bắt đầu mua sắm</p>
              </div>
            ) : (
              <div>
                <div className="space-y-4 mb-6">
                  {cart.map((item) => (
                    <div key={item.product.id} className="flex items-center gap-3 p-3 bg-white border rounded-lg">
                      <MediaViewer
                        src={item.product.media || item.product.image}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded-lg"
                        isHomepage={false} // Cart view is not homepage
                      />
                      <div className="flex-1">
                        <h3 className="font-medium">{item.product.name}</h3>
                        <p className="text-tramhuong-accent font-bold">
                          {formatVietnamPrice(item.product.price)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="w-8 h-8 p-0"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center font-semibold">{item.quantity}</span>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="w-8 h-8 p-0"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="bg-white p-4 rounded-xl border border-gray-200">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-semibold">Tổng cộng:</span>
                    <span className="text-2xl font-bold text-tramhuong-accent font-playfair">
                      {formatVietnamPrice(getTotalPrice())}
                    </span>
                  </div>
                  <Button className="w-full gradient-incense-gold text-white py-3 rounded-full font-semibold shadow-lg hover:shadow-luxury-lg transition-all duration-300">
                    Đặt hàng ngay
                  </Button>
                </div>
              </div>
            )}
          </div>
        );

      case 'calendar':
        return <FullScreenLunarCalendar />;

      case 'profile':
        return <ProfileTab addToCart={addToCart} setActiveTab={setActiveTab} />;

      default:
        // Enhanced Product Cards - Blue Theme with Real Products
        return (
          <div className={layoutConfig.containerClass}>
            {/* Heritage Section - Brand Storytelling */}
            {activeTab === 'home' && (
              <section className="heritage-section py-12 md:py-20 bg-gradient-to-b from-amber-50 to-white">
                <div className="container mx-auto px-4">
                  <div className="text-center mb-8 md:mb-12">
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-playfair text-tramhuong-primary mb-4 animate-fade-in-up">
                      Di Sản Trầm Hương
                    </h2>
                    <div className="w-24 h-1 bg-tramhuong-accent mx-auto mb-4 md:mb-6"></div>
                    <p className="text-base md:text-lg text-tramhuong-text max-w-3xl mx-auto animate-fade-in-up stagger-1">
                      Trầm Hương Hoàng Ngân - Tinh hoa từ đất Bồi, nơi những cây trầm quý hiếm 
                      được ươm mầm qua hàng trăm năm. Mỗi que trầm là một câu chuyện, 
                      một hành trình tâm linh độc đáo.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                    <div className="luxury-card text-center p-6 md:p-8 rounded-xl animate-fade-in-up stagger-2">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-tramhuong-accent/20 flex items-center justify-center">
                        <Leaf className="w-8 h-8 text-tramhuong-accent" />
                      </div>
                      <h3 className="text-lg md:text-xl font-playfair text-tramhuong-primary mb-3">
                        Nguồn Gốc Quý Hiếm
                      </h3>
                      <p className="text-sm md:text-base text-tramhuong-text/80">
                        Trầm hương tự nhiên từ vùng đất Bồi nổi tiếng, 
                        được tuyển chọn kỹ lưỡng qua nhiều thế hệ
                      </p>
                    </div>

                    <div className="luxury-card text-center p-6 md:p-8 rounded-xl animate-fade-in-up stagger-3">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-tramhuong-accent/20 flex items-center justify-center">
                        <Package className="w-8 h-8 text-tramhuong-accent" />
                      </div>
                      <h3 className="text-lg md:text-xl font-playfair text-tramhuong-primary mb-3">
                        Quy Trình Truyền Thống
                      </h3>
                      <p className="text-sm md:text-base text-tramhuong-text/80">
                        Sản xuất theo phương pháp thủ công cổ truyền,
                        kết hợp kỹ thuật hiện đại để giữ nguyên hương thơm
                      </p>
                    </div>

                    <div className="luxury-card text-center p-6 md:p-8 rounded-xl animate-fade-in-up stagger-4">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-tramhuong-accent/20 flex items-center justify-center">
                        <Award className="w-8 h-8 text-tramhuong-accent" />
                      </div>
                      <h3 className="text-lg md:text-xl font-playfair text-tramhuong-primary mb-3">
                        Giá Trị Tâm Linh
                      </h3>
                      <p className="text-sm md:text-base text-tramhuong-text/80">
                        Mang lại sự thanh tịnh, bình an và tĩnh tâm
                        cho không gian cúng bái và thiền định
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            )}
            
            {/* Products Section with Enhanced Design */}
            <div id="products-section" data-section="products" className={`${layoutConfig.contentPadding} ${layoutConfig.sectionSpacing}`}>
              <div className={layoutConfig.desktopProductContainer}>
                {/* Enhanced Product Grid */}
                <div className={`grid ${layoutConfig.gridCols} ${layoutConfig.gridGap}`}>
                {productsLoading && products.length === 0 && !productsError ? (
                  // Loading skeleton - only show when no products loaded yet
                  Array.from({ length: 8 }).map((_, index) => (
                    <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                      <div className="aspect-[2/3] bg-gray-100 animate-pulse" />
                      <div className="p-4">
                        <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
                        <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
                      </div>
                    </div>
                  ))
                ) : finalProducts.length === 0 ? (
                  <div className="text-center py-8 col-span-full">
                    <Star className="h-16 w-16 mx-auto mb-4 text-tramhuong-accent opacity-50" />
                    <p className="text-gray-600">Không tìm thấy sản phẩm</p>
                  </div>
                ) : (
                  // Limit to 6 products on desktop, show all on mobile
                  (isMobile ? finalProducts : finalProducts.slice(0, 6)).map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={addToCart}
                    />
                  ))
                )}
                </div>
                
                {/* "Xem tất cả sản phẩm" button - Desktop only */}
                {!isMobile && (
                  <div className="mt-8 text-center">
                    <Link href="/products">
                      <button className="gradient-incense-gold hover:luxury-glow text-tramhuong-bg font-semibold py-3 px-8 rounded-lg transition-all duration-300 shadow-lg">
                        Xem tất cả sản phẩm →
                      </button>
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Featured Blog Posts - After products, only on home tab */}
            {activeTab === 'home' && (
              <Suspense fallback={
                <div className="w-full h-96 bg-white/60 backdrop-blur-md rounded-xl border border-tramhuong-accent/20 animate-pulse" />
              }>
                <BlogFeaturedSection 
                  onPostClick={(post) => {
                    setSelectedBlogPost(post);
                    setActiveTab('blog-detail');
                  }}
                />
              </Suspense>
            )}

            {/* Philosophy Section - Brand Storytelling */}
            {activeTab === 'home' && (
              <section className="philosophy-section py-12 md:py-20 bg-tramhuong-primary text-white relative overflow-hidden">
                {/* Smoke decoration elements */}
                <div className="absolute top-0 left-0 w-32 h-32 opacity-10 animate-smoke-rise">
                  <div className="w-full h-full bg-tramhuong-accent rounded-full blur-3xl"></div>
                </div>
                <div className="absolute bottom-0 right-0 w-40 h-40 opacity-10 animate-smoke-rise" style={{animationDelay: '2s'}}>
                  <div className="w-full h-full bg-tramhuong-accent rounded-full blur-3xl"></div>
                </div>
                
                <div className="container mx-auto px-4 relative z-10">
                  <div className="text-center mb-8 md:mb-12">
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-playfair text-tramhuong-accent mb-4">
                      Triết Lý Tâm Linh
                    </h2>
                    <div className="w-24 h-1 bg-tramhuong-accent mx-auto mb-4 md:mb-6"></div>
                  </div>
                  
                  <div className="max-w-4xl mx-auto">
                    <p className="text-lg md:text-xl text-center mb-8 md:mb-12 text-amber-100 px-4">
                      "Trầm hương không chỉ là hương thơm, mà là cầu nối giữa thế giới vật chất 
                      và tâm linh. Mỗi luồng khói bay lên mang theo những lời cầu nguyện, 
                      sự thanh tịnh và bình an."
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                      <div className="text-center p-6">
                        <Sparkles className="h-12 w-12 md:h-14 md:w-14 mx-auto mb-4 text-tramhuong-accent" />
                        <h4 className="font-playfair text-lg md:text-xl text-tramhuong-accent mb-2">
                          Thanh Tịnh
                        </h4>
                        <p className="text-sm md:text-base text-amber-100/80">
                          Làm sạch không gian và tâm hồn khỏi năng lượng tiêu cực
                        </p>
                      </div>
                      
                      <div className="text-center p-6">
                        <Circle className="h-12 w-12 md:h-14 md:w-14 mx-auto mb-4 text-tramhuong-accent" />
                        <h4 className="font-playfair text-lg md:text-xl text-tramhuong-accent mb-2">
                          Thiền Định
                        </h4>
                        <p className="text-sm md:text-base text-amber-100/80">
                          Hỗ trợ tập trung và an tĩnh trong thiền định, yoga
                        </p>
                      </div>
                      
                      <div className="text-center p-6">
                        <Heart className="h-12 w-12 md:h-14 md:w-14 mx-auto mb-4 text-tramhuong-accent" />
                        <h4 className="font-playfair text-lg md:text-xl text-tramhuong-accent mb-2">
                          Bình An
                        </h4>
                        <p className="text-sm md:text-base text-amber-100/80">
                          Mang lại sự yên tĩnh, thư thái cho tâm trí
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Quality Promise Section - Brand Storytelling */}
            {activeTab === 'home' && (
              <section className="quality-section py-12 md:py-20 bg-white">
                <div className="container mx-auto px-4">
                  <div className="text-center mb-8 md:mb-12">
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-playfair text-tramhuong-primary mb-4">
                      Cam Kết Chất Lượng
                    </h2>
                    <div className="w-24 h-1 bg-tramhuong-accent mx-auto mb-4 md:mb-6"></div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
                    <div className="text-center p-4 md:p-6 luxury-card rounded-xl">
                      <div className="text-4xl md:text-5xl mb-3 md:mb-4 text-tramhuong-accent">✓</div>
                      <h4 className="font-playfair text-lg md:text-xl text-tramhuong-primary mb-2">
                        100% Tự Nhiên
                      </h4>
                      <p className="text-sm md:text-base text-tramhuong-text/70">
                        Không hóa chất, không tạp chất
                      </p>
                    </div>
                    
                    <div className="text-center p-4 md:p-6 luxury-card rounded-xl">
                      <Award className="h-12 w-12 md:h-14 md:w-14 mx-auto mb-3 md:mb-4 text-tramhuong-accent" />
                      <h4 className="font-playfair text-lg md:text-xl text-tramhuong-primary mb-2">
                        Chứng Nhận
                      </h4>
                      <p className="text-sm md:text-base text-tramhuong-text/70">
                        Đạt chuẩn chất lượng quốc tế
                      </p>
                    </div>
                    
                    <div className="text-center p-4 md:p-6 luxury-card rounded-xl">
                      <Package className="h-12 w-12 md:h-14 md:w-14 mx-auto mb-3 md:mb-4 text-tramhuong-accent" />
                      <h4 className="font-playfair text-lg md:text-xl text-tramhuong-primary mb-2">
                        Giao Hàng Toàn Quốc
                      </h4>
                      <p className="text-sm md:text-base text-tramhuong-text/70">
                        Nhanh chóng, an toàn, bảo mật
                      </p>
                    </div>
                    
                    <div className="text-center p-4 md:p-6 luxury-card rounded-xl">
                      <Shield className="h-12 w-12 md:h-14 md:w-14 mx-auto mb-3 md:mb-4 text-tramhuong-accent" />
                      <h4 className="font-playfair text-lg md:text-xl text-tramhuong-primary mb-2">
                        Đổi Trả Dễ Dàng
                      </h4>
                      <p className="text-sm md:text-base text-tramhuong-text/70">
                        Hoàn tiền 100% nếu không hài lòng
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            )}
          </div>
        );
    }
  };

  // Generate structured data for SEO
  const generateStructuredData = () => {
    if (!finalProducts?.length) return null;
    
    const organizationSchema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Cửa Hàng Tâm Linh",
      "url": "https://cuahangtamlinh.com",
      "logo": "/images/spiritual-banner-1.jpg",
      "description": "Chuyên cung cấp sản phẩm tâm linh chính hãng: nhang trầm hương, đồ thờ cúng, phật phẩm"
    };

    const websiteSchema = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Cửa Hàng Tâm Linh",
      "url": "https://cuahangtamlinh.com",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://cuahangtamlinh.com/?search={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    };

    const productsSchema = finalProducts.slice(0, 10).map(product => ({
      "@context": "https://schema.org",
      "@type": "Product",
      "name": product.name,
      "description": product.short_description || "Sản phẩm tâm linh chất lượng cao",
      "image": product.image || "/images/spiritual-banner-1.jpg",
      "sku": product.id,
      "category": "Tâm Linh",
      "brand": {
        "@type": "Brand",
        "name": "Cửa Hàng Tâm Linh"
      },
      "offers": {
        "@type": "Offer",
        "price": product.price,
        "priceCurrency": "VND",
        "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        "seller": {
          "@type": "Organization",
          "name": "Cửa Hàng Tâm Linh"
        }
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "reviewCount": "128",
        "bestRating": "5",
        "worstRating": "1"
      }
    }));

    return {
      "@context": "https://schema.org",
      "@graph": [organizationSchema, websiteSchema, ...productsSchema]
    };
  };

  return (
    <div className="min-h-screen bg-white">
      
      {/* Structured Data for SEO */}
      {finalProducts?.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateStructuredData())
          }}
        />
      )}
      
      {/* Desktop Shopee Header - Only on desktop */}
      <DesktopShopeeHeader 
        cartCount={getTotalItems()}
        onSearch={(query) => setSearchQuery(query)}
        onCategoryClick={(cat) => {
          setSelectedCategory(cat);
          setActiveTab('home');
        }}
        onCartClick={() => setActiveTab('cart')}
        onAccountClick={() => setActiveTab('profile')}
        onLogin={() => {
          // Handle login - can be implemented with modal or navigation
          setActiveTab('profile');
        }}
        onRegister={() => {
          // Handle register - can be implemented with modal or navigation
          setActiveTab('profile');
        }}
      />

      {/* Existing Mobile Header - Only on mobile */}
      <MobileHeader
        storeName="SunFoods.vn"
        cartCount={getTotalItems()}
        onCartClick={() => setActiveTab('cart')}
        onSearchClick={handleHeaderSearchClick}
        onProfileClick={() => setActiveTab('profile')}
      />

      {/* Premium Luxury Glass Hero Section - Only on home tab */}
      {activeTab === 'home' && (
        <section className="relative h-[70vh] md:h-[80vh] overflow-hidden">
          {/* Layer 1: ImageSlider Background */}
          <div className="absolute inset-0">
            <ImageSlider 
              slides={heroSlides}
              className="h-full"
              autoplay={true}
              autoplayDelay={5000}
            />
          </div>
          
          {/* Layer 2: Deep Brown Gradient for depth */}
          <div className="absolute inset-0 bg-gradient-to-b from-tramhuong-primary/40 via-tramhuong-primary/60 to-tramhuong-primary/80" />
          
          {/* Layer 3: Glass morphism overlay */}
          <div className="absolute inset-0 backdrop-blur-[2px]" />
          
          {/* Layer 4: Texture overlay */}
          <div className="absolute inset-0 texture-overlay opacity-10" />
          
          {/* Hero Content */}
          <div className="relative z-10 container mx-auto px-4 h-full flex flex-col items-center justify-center text-center">
            {/* Logo Container - Luxury Glass Circular */}
            <div className="mb-8 animate-fade-in-up">
              <div className="w-28 h-28 md:w-32 md:h-32 mx-auto rounded-full bg-tramhuong-accent/10 backdrop-blur-md border-2 border-tramhuong-accent/30 flex items-center justify-center shadow-[0_8px_32px_rgba(193,168,117,0.2)] hover:scale-110 transition-transform duration-300">
                <Sparkles className="w-14 h-14 md:w-16 md:h-16 text-tramhuong-accent" />
              </div>
            </div>
            
            {/* Main Headline with Bronze Gold Accent */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-playfair text-white mb-6 animate-fade-in-up stagger-1">
              TRẦM HƯƠNG 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-tramhuong-accent to-amber-300"> HOÀNG NGÂN</span>
            </h1>
            
            {/* Subtitle with decorative underline */}
            <div className="relative inline-block mb-4 animate-fade-in-up stagger-2">
              <p className="text-xl md:text-3xl text-tramhuong-accent font-playfair">
                TINH HOA TRẦM HƯƠNG
              </p>
              {/* Bronze gold decorative underline */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-24 md:w-32 h-0.5 bg-gradient-to-r from-transparent via-tramhuong-accent to-transparent" />
            </div>
            
            {/* Description text */}
            <p className="text-base md:text-xl text-white/80 mb-10 max-w-2xl mx-auto font-nunito animate-fade-in-up stagger-3 leading-relaxed">
              Hơn 20 năm tinh luyện trầm hương Khánh Hòa • Sản phẩm cao cấp từ đất Bồi
            </p>
            
            {/* Floating CTA Buttons - Glass Style */}
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up stagger-4">
              {/* Primary CTA - Glass with bronze gradient */}
              <Button 
                onClick={() => document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="group relative px-8 py-6 text-lg font-semibold rounded-xl overflow-hidden bg-gradient-to-r from-tramhuong-primary to-tramhuong-accent text-white shadow-[0_8px_32px_rgba(193,168,117,0.3)] hover:shadow-[0_12px_48px_rgba(193,168,117,0.4)] transition-all duration-300 hover:scale-105"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Khám Phá Bộ Sưu Tập
                </span>
                {/* Glass shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              </Button>

              {/* Secondary CTA - Glass outline */}
              <Button 
                onClick={() => setActiveTab('categories')}
                variant="outline"
                className="px-8 py-6 text-lg font-semibold rounded-xl bg-white/10 backdrop-blur-md border-2 border-tramhuong-accent/50 text-white hover:bg-tramhuong-accent/20 hover:border-tramhuong-accent transition-all duration-300 shadow-luxury"
              >
                <span className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Danh Mục Sản Phẩm
                </span>
              </Button>
            </div>
            
            {/* Trust Badges Row - Glass Containers */}
            <div className="mt-12 flex flex-wrap justify-center gap-6 animate-fade-in-up stagger-5">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-tramhuong-accent/30">
                <Award className="w-5 h-5 text-tramhuong-accent" />
                <span className="text-sm text-white/90">20+ Năm Kinh Nghiệm</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-tramhuong-accent/30">
                <Star className="w-5 h-5 text-tramhuong-accent" />
                <span className="text-sm text-white/90">4.95/5 Đánh Giá</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-tramhuong-accent/30">
                <Shield className="w-5 h-5 text-tramhuong-accent" />
                <span className="text-sm text-white/90">Chứng Nhận Nguồn Gốc</span>
              </div>
            </div>
          </div>
          
          {/* Scroll Indicator - Bronze Gold */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce z-10">
            <ChevronDown className="w-8 h-8 text-tramhuong-accent" />
          </div>
        </section>
      )}

      {/* Main Content - Add top padding for desktop sticky header only for non-home tabs */}
      <div className={activeTab === 'home' ? '' : 'lg:pt-[160px]'}>
        {renderContent()}
      </div>

      {/* Bottom Navigation - Mobile only */}
      {isMobile && (
        <StorefrontBottomNav
          activeTab={activeTab}
          onTabChange={handleTabChange}
          cartCount={getTotalItems()}
        />
      )}

      {/* Category Bottom Sheet */}
      <CategoryBottomSheet
        isOpen={showCategorySheet}
        onClose={() => setShowCategorySheet(false)}
        onCategorySelect={(path) => {
          router.push(path);
          setShowCategorySheet(false);
        }}
      />

      {/* ChatBot - Responsive */}
      {isMobile ? <MobileChatBot /> : <DesktopChatBot />}

      {/* Desktop Footer - Show on desktop only */}
      {!isMobile && <DesktopFooter />}

      {/* Product Modal - Desktop only, hide when force full view */}
      {!isMobile && !forceFullView && (
        <ProductModal
          product={selectedProduct}
          isOpen={!!selectedProduct}
          onClose={() => {
            setSelectedProduct(null);
            setForceFullView(false);
          }}
          onAddToCart={addToCart}
          onViewFull={(product) => {
            // Enable full page view mode for desktop
            setForceFullView(true);
            // Scroll to top for better UX
            window.scrollTo(0, 0);
            // Modal will automatically close due to updated render logic
          }}
          cart={cart}
        />
      )}

    </div>
  );
}
