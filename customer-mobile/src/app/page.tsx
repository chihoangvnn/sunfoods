'use client'

import React, { useState, useMemo, useCallback, useEffect } from 'react';
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
import { FullScreenLunarCalendar } from '@/components/FullScreenLunarCalendar';
import { MediaViewer } from '@/components/MediaViewer';
import { ImageSlider } from '@/components/ImageSlider';
import { ProfileTab } from '@/components/ProfileTab';
import { BlogTab } from '@/components/BlogTab';
import { BlogPost } from '@/components/BlogPost';
import DesktopChatBot from '@/components/DesktopChatBot';
import MobileChatBot from '@/components/MobileChatBot';
import DesktopFooter from '@/components/DesktopFooter';
import { ProductModal } from '@/components/ProductModal';
import { DesktopFullPageView } from '@/components/DesktopFullPageView';
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
import { useRouter } from 'next/navigation';

// API base URL from environment or default  
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

// Spiritual-themed banner images for mobile
const BANNER_IMAGES = [
  '/images/spiritual-banner-1.jpg', // Vietnamese incense burning on altar
  '/images/spiritual-banner-2.jpg', // Spiritual meditation atmosphere
  '/images/spiritual-banner-3.jpg'  // Serene incense ceremony
];


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
    gridCols: isMobile ? 'grid-cols-2' : isTablet ? 'grid-cols-3' : 'grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
    containerClass: 'w-full',
    contentPadding: isMobile ? 'px-3 py-4' : 'px-6 py-8 lg:px-12 xl:px-16',
    gridGap: isMobile ? 'gap-2' : 'gap-4 lg:gap-5 xl:gap-6',
    showBottomNav: isMobile,
    desktopProductContainer: 'max-w-7xl mx-auto',
    sectionSpacing: 'mb-16',
    cardShadow: 'shadow-lg hover:shadow-xl',
    cardBorder: 'border border-gray-100 hover:border-green-200'
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
  
  // Create simplified category list with real IDs (filter out duplicate "all")
  const categories = categoriesLoading ? [] : [
    { id: 'all', name: 'Tất cả', icon: '🛍️' },
    ...allCategories
      .filter(cat => cat.id !== 'all') // Prevent duplicate "all" key
      .map(cat => ({
        id: cat.id,
        name: cat.name,
        icon: getCategoryIcon(cat.name)
      }))
  ];
  
  // Helper function to get category icons
  function getCategoryIcon(categoryName: string): string {
    const name = categoryName.toLowerCase();
    if (name.includes('điện') || name.includes('phone') || name.includes('tech')) return '📱';
    if (name.includes('sách') || name.includes('book')) return '📚';
    if (name.includes('làm đẹp') || name.includes('beauty') || name.includes('cosmetic')) return '💄';
    if (name.includes('thời trang') || name.includes('fashion') || name.includes('clothes')) return '👕';
    if (name.includes('gia dụng') || name.includes('home')) return '🏠';
    if (name.includes('thể thao') || name.includes('sport')) return '⚽';
    return '📦';
  }

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
                <span className="text-3xl font-bold text-green-600">
                  {formatVietnamPrice(selectedProduct.price)}
                </span>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
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
                      <span className="text-green-500 mt-1">•</span>
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
                <span className="text-sm text-green-600 font-medium">
                  Còn hàng ({selectedProduct.stock} sản phẩm)
                </span>
              ) : (
                <span className="text-sm text-red-600 font-medium">Hết hàng</span>
              )}
            </div>

            {/* Quantity in Cart */}
            {cart.find(item => item.product.id === selectedProduct.id) && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-green-800">
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
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 text-lg font-semibold"
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
              <h2 className="text-xl font-bold mb-4 text-gray-900">Danh mục sản phẩm</h2>
              <div className={`grid ${layoutConfig.gridCols} ${layoutConfig.gridGap}`}>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => {
                      setSelectedCategory(category.id);
                      setActiveTab('home');
                    }}
                    className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                  >
                    <div className="text-center">
                      <div className="text-3xl mb-2">{category.icon}</div>
                      <h3 className="font-semibold text-gray-900">{category.name}</h3>
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
                        <p className="text-green-600 font-bold">
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
                    <span className="text-2xl font-bold text-green-600">
                      {formatVietnamPrice(getTotalPrice())}
                    </span>
                  </div>
                  <Button className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 rounded-full font-semibold">
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
            {/* Products Section with Enhanced Design */}
            <div className={`${layoutConfig.contentPadding} ${layoutConfig.sectionSpacing}`}>
              <div className={layoutConfig.desktopProductContainer}>
                {/* Enhanced Product Grid */}
                <div className={`grid ${layoutConfig.gridCols} ${layoutConfig.gridGap}`}>
                {productsLoading && products.length === 0 && !productsError ? (
                  // Loading skeleton - only show when no products loaded yet
                  Array.from({ length: 8 }).map((_, index) => (
                    <div key={index} className="bg-white rounded-xl shadow-sm border border-green-100 overflow-hidden">
                      <div className="aspect-square bg-green-50 animate-pulse" />
                      <div className="p-4">
                        <div className="h-4 bg-green-100 rounded animate-pulse mb-2" />
                        <div className="h-3 bg-green-100 rounded animate-pulse w-2/3" />
                      </div>
                    </div>
                  ))
                ) : finalProducts.length === 0 ? (
                  <div className="text-center py-8 col-span-full">
                    <span className="text-4xl mb-4 block">🔍</span>
                    <p className="text-gray-600">Không tìm thấy sản phẩm</p>
                  </div>
                ) : (
                  finalProducts.map((product) => {
                    // Calculate marketing badges for this product
                    const badges = calculateMarketingBadges(
                      product.rating !== undefined ? {
                        rating: product.rating,
                        totalReviews: product.totalReviews || product.reviewCount || 0,
                        positivePercent: product.positivePercent
                      } : undefined,
                      {
                        price: product.price,
                        originalPrice: product.originalPrice,
                        createdAt: product.createdAt
                      }
                    );
                    
                    // Calculate actual discount percent
                    const discountPercent = product.originalPrice
                      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
                      : 0;
                    
                    return (
                    <Link 
                      key={product.id} 
                      href={`/product/${product.slug || product.id}`}
                      onClick={markInternalNav}
                      prefetch={true}
                      className={`relative bg-white rounded-2xl border border-gray-200 overflow-hidden transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1 cursor-pointer block w-full ${isMobile ? 'h-[380px]' : 'h-[540px]'}`}
                    >
                      <div className={`relative overflow-hidden group bg-gray-100 ${isMobile ? 'h-[240px]' : 'h-[320px]'}`}>
                        {product.image ? (
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
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

                      <div className={`flex-1 flex flex-col space-y-[3px] ${isMobile ? 'p-2.5' : 'p-3.5'}`}>
                        {/* Top Rating Badge (if rating >= 4.5) */}
                        {badges.topRating && (
                          <div>
                            <span className="text-sm font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                              {badges.topRating}
                            </span>
                          </div>
                        )}
                        
                        {/* Product Title - 1 line with ellipsis */}
                        <h3 className={`font-medium text-gray-800 line-clamp-1 ${isMobile ? 'mt-0.5 text-base' : 'mt-[3px] text-lg'}`} title={product.name}>
                          {product.name}
                        </h3>

                        {/* Price Section - All in 1 line */}
                        <div className="flex items-center gap-1.5">
                          <span className={`font-bold text-red-600 ${isMobile ? 'text-xl' : 'text-2xl'}`}>
                            ₫{product.price?.toLocaleString() || '0'}
                          </span>
                          {product.originalPrice && (
                            <>
                              <span className={`text-gray-400 line-through ${isMobile ? 'text-sm' : 'text-base'}`}>
                                ₫{product.originalPrice.toLocaleString()}
                              </span>
                              {discountPercent > 0 && (
                                <span className={`text-red-500 font-medium ${isMobile ? 'text-sm' : 'text-base'}`}>
                                  -{discountPercent}%
                                </span>
                              )}
                            </>
                          )}
                        </div>

                        {/* Pricing Badges Row */}
                        {badges.pricingBadges.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {badges.pricingBadges.map((badge, idx) => (
                              <span key={idx} className="text-sm text-red-600 bg-red-50 px-2 py-1 rounded font-medium">
                                {badge}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Review Badges Row */}
                        {badges.reviewBadges.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {badges.reviewBadges.map((badge, idx) => (
                              <span key={idx} className="text-sm text-green-600 bg-green-50 px-2 py-1 rounded font-medium">
                                {badge}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </Link>
                    );
                  })
                )}
                </div>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      
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
      <div className="lg:hidden">
        <MobileHeader
          storeName="Nhang Sạch .Net"
          cartCount={getTotalItems()}
          onCartClick={() => setActiveTab('cart')}
          onSearchClick={handleHeaderSearchClick}
          onProfileClick={() => setActiveTab('profile')}
        />
      </div>

      {/* Banner Slider - Only on home tab, sits directly under CategoryIconsGrid */}
      {activeTab === 'home' && (
        <ImageSlider 
          images={BANNER_IMAGES}
          className="mb-0"
          autoplay={true}
          autoplayDelay={4000}
        />
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
