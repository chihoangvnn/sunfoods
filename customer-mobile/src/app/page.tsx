'use client'

import React, { useState, useMemo, useCallback, useEffect, lazy, Suspense } from 'react';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { ShoppingCart, User, ArrowLeft, Plus, Minus, Store, Calendar, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StorefrontBottomNav } from '@/components/StorefrontBottomNav';
import { MobileHeader } from '@/components/MobileHeader';
import { DesktopHeader } from '@/components/DesktopHeader';
import { DesktopShopeeHeader } from '@/components/DesktopShopeeHeader';
import { AutoHideSearchBar } from '@/components/AutoHideSearchBar';
import { HiddenSearchBar } from '@/components/HiddenSearchBar';
import { MediaViewer } from '@/components/MediaViewer';
import { ImageSlider } from '@/components/ImageSlider';
import { OrganicHeroSection } from '@/components/OrganicHeroSection';
import { WhyChooseSunFoods } from '@/components/WhyChooseSunFoods';
import { OrganicProductBadge } from '@/components/OrganicProductBadge';
import { FeaturedProducts } from '@/components/FeaturedProducts';
import { CustomBanner } from '@/components/CustomBanner';
import { ProfileTab } from '@/components/ProfileTab';
import { BlogTab } from '@/components/BlogTab';
import { BlogPost } from '@/components/BlogPost';
import DesktopFooter from '@/components/DesktopFooter';
import { ProductModal } from '@/components/ProductModal';
import { DesktopFullPageView } from '@/components/DesktopFullPageView';
import { ProductStrip } from '@/components/ProductStrip';
import { useResponsive } from '@/hooks/use-mobile';
import { useAuth } from '@/hooks/useAuth';
import { formatVietnamPrice } from '@/utils/currency';
import { VipTierCard } from '@/components/VipTierCard';
import { calculateVipStatus } from '@/utils/vipCalculator';
import { calculateMarketingBadges } from '@/utils/marketingBadges';
import { fetchProducts } from '@/services/apiService';
import { markInternalNav } from '@/utils/navigation';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  VegetablesIcon, 
  FruitsIcon, 
  PantryIcon, 
  WellnessIcon, 
  ProteinIcon, 
  HerbsIcon 
} from '@/components/icons/CategoryIcons';

// Lazy load non-critical components for better performance
const DesktopChatBot = lazy(() => import('@/components/DesktopChatBot'));
const MobileChatBot = lazy(() => import('@/components/MobileChatBot'));
const FullScreenLunarCalendar = lazy(() => import('@/components/FullScreenLunarCalendar').then(module => ({ default: module.FullScreenLunarCalendar })));

// API base URL from environment or default  
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

// Organic farm images for hero section (fallback)
const ORGANIC_HERO_IMAGES = [
  '/images/organic-farm-1.jpg', // Fresh organic vegetables from local farm
  '/images/organic-farm-2.jpg', // Farmer harvesting fresh produce
  '/images/organic-farm-3.jpg'  // Organic fruits and vegetables display
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
    targetPage?: 'home' | 'category' | 'product' | 'all';
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
  const searchParams = useSearchParams();
  
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
  
  // Handle category from URL parameter
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setSelectedCategory(categoryParam);
      setActiveTab('home'); // Make sure we're on home tab
    }
  }, [searchParams]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [forceFullView, setForceFullView] = useState(false);
  const [shouldLoadChatbot, setShouldLoadChatbot] = useState(false);
  
  // Lazy load chatbot after scroll or 3 seconds
  useEffect(() => {
    let hasLoaded = false;
    
    const loadChatbot = () => {
      if (!hasLoaded) {
        setShouldLoadChatbot(true);
        hasLoaded = true;
      }
    };
    
    // Load after 3 seconds idle
    const timer = setTimeout(loadChatbot, 3000);
    
    // Load on scroll
    const handleScroll = () => {
      if (window.scrollY > 100) {
        loadChatbot();
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
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
    gridCols: (isMobile || isTablet) ? 'grid-cols-2' : 'grid-cols-4',
    containerClass: 'w-full',
    contentPadding: isMobile ? 'px-3 py-4' : 'px-6 py-8 lg:px-12 xl:px-16',
    gridGap: (isMobile || isTablet) ? 'gap-3' : 'gap-4 lg:gap-5 xl:gap-6',
    showBottomNav: isMobile,
    desktopProductContainer: 'max-w-7xl mx-auto',
    sectionSpacing: 'mb-16',
    cardShadow: 'shadow-lg hover:shadow-xl',
    cardBorder: 'border border-gray-100 hover:border-lime-green'
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
  
  // Infinite scroll implementation with 0.8 threshold
  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const scrollTop = document.documentElement.scrollTop;
      const clientHeight = document.documentElement.clientHeight;
      
      const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;
      
      if (scrollPercentage >= 0.8 && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

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

  // Process hero slider data - use fetched data or fallback to organic farm images
  const heroSlides = useMemo(() => {
    const heroSlider = shopSettingsData?.data?.heroSlider;
    if (heroSlider && heroSlider.length > 0) {
      // Filter slides for homepage: show 'home' or 'all' targetPage
      return heroSlider.filter((slide: any) => 
        !slide.targetPage || slide.targetPage === 'all' || slide.targetPage === 'home'
      );
    }
    // Fallback to ORGANIC_HERO_IMAGES if no hero slider data
    return ORGANIC_HERO_IMAGES.map(url => ({ url }));
  }, [shopSettingsData]);

  // Demo organic food products for testing (when API fails)
  // Updated to use new SunFoods category IDs
  const demoProducts: Product[] = [
    {
      id: 'demo-1',
      slug: 'rau-cai-xanh-organic-dalat',
      name: 'Rau Cải Xanh Organic Đà Lạt',
      price: 25000,
      image: '/images/organic-farm-1.jpg',
      category_id: 'rau-cu',
      stock: 50,
      short_description: 'Rau cải xanh hữu cơ tươi, thu hoạch sáng nay từ Farm Đà Lạt',
      status: 'active',
      benefits: ['100% Organic', 'Không hóa chất', 'Tươi trong ngày'],
      isNew: true,
      isTopseller: true,
    },
    {
      id: 'demo-2',
      slug: 'tao-organic-usa',
      name: 'Táo Organic USA',
      price: 120000,
      image: '/images/organic-farm-2.jpg',
      category_id: 'trai-cay-nhap',
      stock: 30,
      short_description: 'Táo organic nhập khẩu từ Mỹ - Giòn ngọt tự nhiên',
      status: 'active',
      benefits: ['100% Organic USA', 'Giòn ngọt', 'An toàn tuyệt đối'],
      isFreeshipping: true,
      isBestseller: true,
    },
    {
      id: 'demo-3',
      name: 'Gạo Lứt Hữu Cơ ST25',
      price: 75000,
      originalPrice: 95000,
      image: '/images/organic-farm-3.jpg',
      category_id: 'thuc-pham-kho',
      stock: 100,
      short_description: 'Gạo lứt organic ST25 - Gạo ngon nhất thế giới 2023',
      status: 'active',
      benefits: ['Chứng nhận Organic', 'Giàu chất xơ', 'Đồng Tháp Mười'],
      isNew: true,
      isFreeshipping: true,
      rating: 4.9,
      totalReviews: 203,
      positivePercent: 97,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
    },
    {
      id: 'demo-4',
      name: 'Dâu Tây Nhật Bản',
      price: 180000,
      originalPrice: 220000,
      image: '/images/organic-farm-1.jpg',
      category_id: 'trai-cay-nhap',
      stock: 20,
      short_description: 'Dâu tây Nhật Bản cao cấp - Ngọt thanh, mọng nước',
      status: 'active',
      benefits: ['Nhập khẩu Nhật', 'Ngọt tự nhiên', 'Đóng gói cẩn thận'],
      isTopseller: true,
      isBestseller: true,
      isFreeshipping: true,
      rating: 4.8,
      totalReviews: 89,
      positivePercent: 94,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
    },
    {
      id: 'demo-5',
      name: 'Cà Chua Cherry Organic Sapa',
      price: 45000,
      image: '/images/organic-farm-2.jpg',
      category_id: 'rau-cu',
      stock: 35,
      short_description: 'Cà chua cherry organic từ Sapa - Ngọt tự nhiên',
      status: 'active',
      benefits: ['VietGAP', 'Farm Sapa', 'Tươi sáng nay'],
      isNew: true,
      rating: 4.6,
      totalReviews: 67,
      createdAt: new Date()
    },
    {
      id: 'demo-6',
      name: 'Bơ Hass Úc',
      price: 95000,
      image: '/images/organic-farm-3.jpg',
      category_id: 'trai-cay-nhap',
      stock: 25,
      short_description: 'Bơ Hass nhập khẩu Úc - Béo ngậy, dinh dưỡng',
      status: 'active',
      benefits: ['Nhập Australia', 'Béo ngậy', 'Chín tự nhiên'],
      isFreeshipping: true,
      rating: 4.9,
      totalReviews: 156
    }
  ];

  // Use demo products when API fails or returns empty
  const displayProducts = (products.length > 0 || productsLoading) ? products : demoProducts;
  
  // Force demo products when error or no products available (even during loading if products exist)
  const finalProducts = products.length > 0 ? products : demoProducts;

  // Merchandising Strips - Product Collections
  const bestSellerProducts = useMemo(() => {
    const filtered = finalProducts.filter(p => p.isBestseller || p.isTopseller);
    if (filtered.length > 0) return filtered.slice(0, 6);
    // Fallback: First 6 products sorted by rating
    return [...finalProducts]
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 6);
  }, [finalProducts]);

  const newHarvestProducts = useMemo(() => {
    const filtered = finalProducts.filter(p => p.isNew);
    if (filtered.length > 0) return filtered.slice(0, 6);
    // Fallback: Products created in last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return finalProducts
      .filter(p => {
        if (!p.createdAt) return false;
        const createdDate = new Date(p.createdAt);
        return createdDate >= sevenDaysAgo;
      })
      .slice(0, 6);
  }, [finalProducts]);

  const topRatedProducts = useMemo(() => {
    return [...finalProducts]
      .filter(p => (p.rating || 0) >= 4.7)
      .sort((a, b) => {
        // Sort by rating DESC
        const ratingDiff = (b.rating || 0) - (a.rating || 0);
        if (ratingDiff !== 0) return ratingDiff;
        // Then by totalReviews DESC
        return (b.totalReviews || 0) - (a.totalReviews || 0);
      })
      .slice(0, 6);
  }, [finalProducts]);

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
  
  // Helper function to map backend categories to organic food display with icons
  function getOrganicCategoryIcon(categoryName: string): { IconComponent: any; color: string } | null {
    const name = categoryName.toLowerCase();
    if (name.includes('rau') || name.includes('vegetable') || name.includes('củ')) {
      return { IconComponent: VegetablesIcon, color: 'text-category-vegetables' };
    }
    if (name.includes('trái cây') || name.includes('fruit') || name.includes('hoa quả')) {
      return { IconComponent: FruitsIcon, color: 'text-category-fruits' };
    }
    if (name.includes('thơm') || name.includes('herb')) {
      return { IconComponent: HerbsIcon, color: 'text-sunrise-leaf' };
    }
    if (name.includes('khô') || name.includes('pantry') || name.includes('gạo') || name.includes('ngũ cốc')) {
      return { IconComponent: PantryIcon, color: 'text-category-pantry' };
    }
    if (name.includes('protein') || name.includes('đậu') || name.includes('sữa')) {
      return { IconComponent: ProteinIcon, color: 'text-sunrise-leaf' };
    }
    if (name.includes('wellness') || name.includes('chức năng') || name.includes('tinh dầu')) {
      return { IconComponent: WellnessIcon, color: 'text-category-wellness' };
    }
    // Default to vegetables icon for unmatched categories
    return { IconComponent: VegetablesIcon, color: 'text-sunrise-leaf' };
  }
  
  // Map backend categories with organic icons while preserving real IDs
  const categories = categoriesLoading ? [] : [
    { id: 'all', name: 'Tất cả', IconComponent: null, color: 'text-sunrise-leaf' },
    ...allCategories
      .filter(cat => cat.id !== 'all')
      .map(cat => {
        const iconData = getOrganicCategoryIcon(cat.name);
        return {
          id: cat.id,  // Preserve backend ID for filtering
          name: cat.name,  // Keep backend name for now (can customize display later)
          IconComponent: iconData?.IconComponent || null,
          color: iconData?.color || 'text-sunrise-leaf'
        };
      })
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
        <Badge key="new" variant="new" className="text-sm">
          🆕 MỚI
        </Badge>
      );
    }
    
    if (product.isTopseller) {
      badges.push(
        <Badge key="topseller" variant="topseller" className="text-sm">
          🏆 BÁN CHẠY
        </Badge>
      );
    }
    
    if (product.isFreeshipping) {
      badges.push(
        <Badge key="freeshipping" variant="freeshipping" className="text-sm">
          🚚 FREESHIP
        </Badge>
      );
    }
    
    if (product.isBestseller) {
      badges.push(
        <Badge key="bestseller" variant="bestseller" className="text-sm">
          ⭐ YÊU THÍCH
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
                <h1 className="text-2xl font-bold text-sunrise-leaf">
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
                <span className="text-3xl font-bold text-forest-green">
                  {formatVietnamPrice(selectedProduct.price)}
                </span>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-warm-sun text-warm-sun" />
                  <Star className="h-4 w-4 fill-warm-sun text-warm-sun" />
                  <Star className="h-4 w-4 fill-warm-sun text-warm-sun" />
                  <Star className="h-4 w-4 fill-warm-sun text-warm-sun" />
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
                      <span className="text-lime-green mt-1">•</span>
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
                <span className="text-sm text-lime-green font-medium">
                  Còn hàng ({selectedProduct.stock} sản phẩm)
                </span>
              ) : (
                <span className="text-sm text-red-600 font-medium">Hết hàng</span>
              )}
            </div>

            {/* Quantity in Cart */}
            {cart.find(item => item.product.id === selectedProduct.id) && (
              <div className="bg-lime-green/10 border border-lime-green rounded-lg p-3">
                <div className="flex items-center gap-2 text-lime-green">
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
                className="w-full bg-sunset-orange hover:bg-sunset-orange/90 text-white py-3 text-lg font-semibold"
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
        const mainCategories = [
          {
            id: "rau-cu",
            icon: "🥒",
            title: "Rau Củ Quả",
            slug: "rau-cu-qua",
            description: "Tươi ngon tự nhiên"
          },
          {
            id: "trai-cay-nhap",
            icon: "🍎",
            title: "Trái Cây Nhập Khẩu",
            slug: "trai-cay-nhap-khau",
            description: "Tươi ngon tự nhiên"
          },
          {
            id: "my-pham",
            icon: "💄",
            title: "Mỹ Phẩm",
            slug: "my-pham",
            description: "Tươi ngon tự nhiên"
          },
          {
            id: "thuc-pham-kho",
            icon: "🌾",
            title: "Thực Phẩm Khô",
            slug: "thuc-pham-kho",
            description: "Tươi ngon tự nhiên"
          },
          {
            id: "an-dam-cho-be",
            icon: "👶",
            title: "Ăn Dặm Cho Bé",
            slug: "an-dam-cho-be",
            description: "Tươi ngon tự nhiên"
          },
          {
            id: "gia-dung",
            icon: "🏠",
            title: "Gia Dụng",
            slug: "gia-dung",
            description: "Tươi ngon tự nhiên"
          },
          {
            id: "thuc-pham-tuoi",
            icon: "🥩",
            title: "Thực Phẩm Tươi",
            slug: "thuc-pham-tuoi",
            description: "Tươi ngon tự nhiên"
          }
        ];

        return (
          <div className={`${layoutConfig.containerClass} pb-20`}>
            <div className={`${layoutConfig.contentPadding} pt-6`}>
              <h2 className="text-xl font-bold mb-4 text-gray-900">Danh mục sản phẩm</h2>
              <div className="grid grid-cols-2 gap-3">
                {mainCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => {
                      router.push(`/${category.slug}`);
                    }}
                    className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-sunrise-leaf/30 transition-all"
                  >
                    <div className="text-center">
                      <div className="mb-2 text-4xl">{category.icon}</div>
                      <h3 className="font-semibold text-gray-900 text-sm">{category.title}</h3>
                      <p className="text-xs text-gray-500 mt-1">{category.description}</p>
                    </div>
                  </button>
                ))}
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
                        <p className="text-forest-green font-bold">
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
                    <span className="text-2xl font-bold text-forest-green">
                      {formatVietnamPrice(getTotalPrice())}
                    </span>
                  </div>
                  <Button className="w-full bg-sunset-orange hover:bg-sunset-orange/90 text-white py-3 rounded-full font-semibold">
                    Đặt hàng ngay
                  </Button>
                </div>
              </div>
            )}
          </div>
        );

      case 'wishlist':
        return (
          <div className="px-5 pt-5 pb-20">
            <div className="flex items-center mb-6">
              <Button
                variant="ghost"
                onClick={() => setActiveTab('home')}
                className="p-2 mr-2"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-semibold text-gray-900">Yêu thích</h1>
            </div>
            <p className="text-gray-600 text-center py-8">Tính năng yêu thích đang được phát triển</p>
          </div>
        );

      case 'profile':
        return <ProfileTab addToCart={addToCart} setActiveTab={setActiveTab} />;

      default:
        // Enhanced Product Cards - Blue Theme with Real Products
        return (
          <div className={layoutConfig.containerClass}>
            {/* Categories Section - Only on home tab */}
            {activeTab === 'home' && <WhyChooseSunFoods onCategorySelect={setSelectedCategory} />}
            
            {/* Featured Products Section */}
            {activeTab === 'home' && <FeaturedProducts />}

            {/* Custom Banner - Middle Position */}
            {activeTab === 'home' && <CustomBanner position="middle" />}
            
            {/* Products Section with Enhanced Design */}
            <div className={`${layoutConfig.contentPadding} ${layoutConfig.sectionSpacing}`}>
              <div className={layoutConfig.desktopProductContainer}>
                {/* Enhanced Product Grid */}
                <div className={`grid ${layoutConfig.gridCols} ${layoutConfig.gridGap}`}>
                {productsLoading && products.length === 0 && !productsError ? (
                  // Enhanced skeleton with organic colors and proper sizing
                  Array.from({ length: 8 }).map((_, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-sm border border-neutral-mist/30 overflow-hidden">
                      <div className="aspect-[4/5] bg-neutral-mist/20 animate-pulse" />
                      <div className="p-4 space-y-3">
                        <div className="h-4 bg-neutral-mist/30 rounded animate-pulse" />
                        <div className="h-6 bg-neutral-mist/30 rounded w-2/3 animate-pulse" />
                        <div className="h-10 bg-sunrise-leaf/10 rounded animate-pulse" />
                      </div>
                    </div>
                  ))
                ) : finalProducts.length === 0 ? (
                  <div className="text-center py-8 col-span-full">
                    <span className="text-4xl mb-4 block">🔍</span>
                    <p className="text-gray-600">Không tìm thấy sản phẩm</p>
                  </div>
                ) : (
                  // Show all products on both desktop and mobile for infinite scroll
                  finalProducts.map((product) => {
                    // Get rating value (default to 4.5 if not available)
                    const rating = product.rating || 4.5;
                    const fullStars = Math.floor(rating);
                    const hasHalfStar = rating % 1 >= 0.5;
                    
                    // Check if media is a video
                    const mediaUrl = product.media || product.image || '';
                    const isVideo = /\.(mp4|webm|mov)$/i.test(mediaUrl);
                    
                    return (
                    <Link 
                      key={product.id} 
                      href={`/product/${product.slug || product.id}`}
                      className="group relative bg-white rounded-lg border border-gray-200 overflow-hidden transition-all duration-300 shadow-sm hover:shadow-xl hover:border-lime-green block"
                    >
                      {/* Lime-green "NEW" badge - top-left corner, absolute positioned */}
                      {product.isNew && (
                        <div className="absolute top-2 left-2 z-10">
                          <span className="bg-lime-green text-white text-xs font-semibold px-2 py-1 rounded">
                            NEW
                          </span>
                        </div>
                      )}

                      {/* Product image/video - aspect-[4/5] ratio */}
                      <div className="relative aspect-[4/5] bg-gray-100 overflow-hidden">
                        {isVideo ? (
                          <video 
                            src={mediaUrl}
                            autoPlay 
                            muted 
                            loop 
                            playsInline 
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />

                        ) : product.image ? (
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            sizes="(max-width: 768px) 50vw, 33vw"
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                            loading="lazy"
                            quality={85}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <span className="text-sm">Sản phẩm</span>
                          </div>
                        )}
                      </div>

                      {/* Product info */}
                      <div className="p-3 space-y-2">
                        {/* Organic Badges Row */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <OrganicProductBadge type="certified" size="sm" />
                          <OrganicProductBadge type="fresh" size="sm" />
                        </div>
                        
                        {/* Product name - single line, medium weight, green color */}
                        <h3 className="font-medium text-sunrise-leaf line-clamp-1 text-base" title={product.name}>
                          {product.name}
                        </h3>

                        {/* Short description with lime-green icon */}
                        {product.short_description && (
                          <div className="flex items-start gap-1">
                            <span className="text-lime-green mt-0.5">✓</span>
                            <p className="text-xs text-lime-green line-clamp-2">
                              {product.short_description}
                            </p>
                          </div>
                        )}

                        {/* Star rating row - yellow stars */}
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, index) => (
                            <Star 
                              key={index} 
                              className={`h-4 w-4 ${
                                index < fullStars 
                                  ? 'fill-warm-sun text-warm-sun' 
                                  : index === fullStars && hasHalfStar
                                  ? 'fill-warm-sun text-warm-sun'
                                  : 'fill-gray-200 text-gray-200'
                              }`}
                            />
                          ))}
                          <span className="text-sm text-gray-600">({rating.toFixed(1)})</span>
                        </div>

                        {/* Price - Large, bold, forest-green color */}
                        <div className="pt-1">
                          <span className="text-xl font-bold text-forest-green">
                            {formatVietnamPrice(product.price)}
                          </span>
                        </div>

                        {/* "Thêm vào giỏ" button - Full width, theme color */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            addToCart(product);
                          }}
                          disabled={product.stock === 0}
                          className="w-full bg-sunrise-leaf hover:bg-sunrise-leaf/90 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                          <ShoppingCart className="h-5 w-5" />
                          <span>Thêm vào giỏ</span>
                        </button>
                      </div>
                    </Link>
                    );
                  })
                )}
                </div>
                
                {/* Infinite Scroll Loading Indicator */}
                {isFetchingNextPage && (
                  <div className="mt-8 py-6 flex flex-col items-center justify-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 border-4 border-neutral-mist/30 border-t-sunrise-leaf rounded-full animate-spin"></div>
                    </div>
                    <p className="text-sunrise-leaf font-medium">Đang tải thêm sản phẩm...</p>
                  </div>
                )}
                
                {/* End of products message */}
                {!hasNextPage && finalProducts.length > 0 && (
                  <div className="mt-8 py-4 text-center text-neutral-mist">
                    <p className="text-sm">🌿 Bạn đã xem hết tất cả sản phẩm</p>
                  </div>
                )}
              </div>
            </div>
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
        onCartClick={() => setActiveTab('cart')}
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
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        categories={categories}
        selectedCategory={selectedCategory}
        onCategorySelect={setSelectedCategory}
      />

      {/* Organic Hero Section - Only on home tab, sits directly under CategoryIconsGrid */}
      {activeTab === 'home' && (
        <OrganicHeroSection 
          slides={heroSlides}
        />
      )}

      {/* Custom Banner - Top Position */}
      {activeTab === 'home' && <CustomBanner position="top" />}

      {/* Main Content - Add top padding for desktop sticky header only for non-home tabs */}
      <div className={activeTab === 'home' ? '' : 'lg:pt-[160px]'}>
        {renderContent()}
      </div>

      {/* Bottom Navigation - Mobile only */}
      {isMobile && (
        <StorefrontBottomNav
          activeTab={activeTab}
          onTabChange={handleTabChange}
          wishlistCount={0}
          cartCount={getTotalItems()}
        />
      )}

      {/* ChatBot - Responsive - Lazy loaded for performance */}
      {shouldLoadChatbot && (
        <Suspense fallback={null}>
          {isMobile ? <MobileChatBot /> : <DesktopChatBot />}
        </Suspense>
      )}

      {/* Custom Banner - Bottom Position */}
      {activeTab === 'home' && <CustomBanner position="bottom" />}

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
