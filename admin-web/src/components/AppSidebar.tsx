import { Link, useLocation } from "wouter";
import { useState, useMemo, Fragment } from "react";
import * as LucideIcons from "lucide-react";

// Destructure icons from wildcard import (bypasses TypeScript named export checking)
const {
  Package2,
  ShoppingCart,
  ShoppingBag,
  Users,
  BarChart3,
  Facebook,
  Instagram,
  Twitter,
  Settings,
  Home,
  Zap,
  Store,
  Tags,
  Hash,
  Palette,
  Image,
  Calendar,
  Activity,
  Share2,
  Satellite,
  Server,
  Monitor,
  MapPin,
  Cloud,
  Star,
  Bot,
  CreditCard,
  BookOpen,
  FileQuestion,
  Percent,
  Gift,
  Mail,
  Truck,
  Building2,
  UserCheck,
  Handshake,
  Crown,
  Shield,
  TrendingUp,
  Search,
  X,
  Pin,
  PinOff,
  FolderKanban,
  Package,
  Clock,
  LayoutList
} = LucideIcons as any;

const ShopeeIcon = ShoppingBag;

// TikTok Icon Component with enhanced styling
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M19.321 5.562a5.122 5.122 0 0 1-.443-.258 6.242 6.242 0 0 1-1.137-.966c-.849-.849-1.347-2.143-1.347-3.416C16.394.482 15.912 0 15.372 0h-3.372c-.54 0-.976.436-.976.976v11.405c0 1.47-1.194 2.665-2.665 2.665s-2.665-1.194-2.665-2.665c0-1.47 1.194-2.665 2.665-2.665.273 0 .537.041.786.117.54.166 1.119-.138 1.285-.678s-.138-1.119-.678-1.285a4.647 4.647 0 0 0-1.393-.203c-2.551 0-4.617 2.066-4.617 4.617s2.066 4.617 4.617 4.617 4.617-2.066 4.617-4.617V6.853c1.346.713 2.88 1.097 4.464 1.097.54 0 .976-.436.976-.976s-.436-.976-.976-.976c-1.346 0-2.64-.524-3.608-1.436z"/>
  </svg>
);

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { CollapsibleSidebarGroup } from "@/components/CollapsibleSidebarGroup";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAdminAuth } from "@/contexts/AdminAuthContext";

const { LogOut, CheckCircle } = LucideIcons as any;

// 1. TỔNG QUAN - Overview and reporting
const overviewItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
    gradient: "gradient-teal",
    description: "Tổng quan và thống kê chính"
  },
  {
    title: "Analytics",
    url: "/analytics",
    icon: BarChart3,
    gradient: "gradient-mint",
    description: "Phân tích chi tiết và insights"
  },
  {
    title: "Post Analytics",
    url: "/post-analytics",
    icon: TrendingUp,
    gradient: "gradient-purple",
    description: "Hiệu suất bài đăng trên social media"
  },
  {
    title: "Best Time to Post",
    url: "/best-time-recommendations",
    icon: Clock,
    gradient: "gradient-blue",
    description: "AI đề xuất thời điểm đăng bài tối ưu"
  },
  {
    title: "Báo cáo",
    url: "/reports",
    icon: FileQuestion,
    gradient: "gradient-blue",
    description: "Báo cáo tài chính và kinh doanh"
  },
  {
    title: "Chatbot",
    url: "/chatbot",
    icon: Bot,
    gradient: "gradient-cyan",
    description: "RASA chatbot và hỗ trợ khách hàng"
  },
];

// 2. BÁN HÀNG - Sales and inventory
const salesItems = [
  {
    title: "Sản phẩm",
    url: "/products",
    icon: Package2,
    badge: "24",
    gradient: "gradient-pink",
    description: "Quản lý sản phẩm và catalog"
  },
  {
    title: "Danh mục sản phẩm",
    url: "/categories-admin",
    icon: Tags,
    gradient: "gradient-mint",
    description: "Quản lý danh mục hương nến, nến thơm, phụ kiện"
  },
  {
    title: "Đơn hàng",
    url: "/orders",
    icon: ShoppingCart,
    badge: "12",
    gradient: "gradient-blue",
    description: "Theo dõi và xử lý đơn hàng"
  },
  {
    title: "Bán hàng POS",
    url: "/pos",
    icon: CreditCard,
    gradient: "gradient-green",
    description: "Giao diện bán hàng tại quầy"
  },
  {
    title: "Kho hàng",
    url: "/inventory",
    icon: Package2,
    gradient: "gradient-orange",
    description: "Quản lý tồn kho và nhập xuất"
  },
  {
    title: "Khuyến mãi",
    url: "/promotions",
    icon: Percent,
    gradient: "gradient-pink",
    description: "Mã giảm giá và chương trình khuyến mãi"
  },
  {
    title: "Tạo mã khuyến mãi",
    url: "/discounts",
    icon: Percent,
    gradient: "gradient-purple",
    description: "Tạo và quản lý mã giảm giá"
  },
  {
    title: "Quà tặng",
    url: "/gifts",
    icon: Gift,
    gradient: "gradient-green",
    description: "Quản lý chương trình quà tặng"
  },
  {
    title: "Đánh giá",
    url: "/review-management",
    icon: Star,
    gradient: "gradient-orange",
    description: "Quản lý reviews và feedback"
  },
  {
    title: "Shopee",
    url: "/shopee",
    icon: ShopeeIcon,
    gradient: "gradient-orange",
    description: "Quản lý shop và sản phẩm Shopee"
  },
  {
    title: "TikTok Business",
    url: "/tiktok-business",
    icon: TikTokIcon,
    gradient: "gradient-purple",
    description: "TikTok for Business và quảng cáo"
  },
  {
    title: "TikTok Seller",
    url: "/tiktok-shop",
    icon: TikTokIcon,
    gradient: "gradient-pink",
    description: "TikTok Shop seller center"
  },
];

// 3. KHÁCH HÀNG - Customer management and support
const customerItems = [
  {
    title: "Khách hàng",
    url: "/customers",
    icon: Users,
    gradient: "gradient-purple",
    description: "Quản lý thông tin khách hàng"
  },
  {
    title: "Quản lý Affiliate",
    url: "/affiliate-management",
    icon: Handshake,
    gradient: "gradient-green",
    description: "Theo dõi và quản lý hệ thống affiliate"
  },
  {
    title: "Gán sản phẩm Affiliate",
    url: "/affiliate-products",
    icon: Package,
    gradient: "gradient-cyan",
    description: "Gán sản phẩm cho affiliate hàng loạt"
  },
  {
    title: "Quản lý SP Affiliate",
    url: "/affiliate-product-management",
    icon: Settings,
    gradient: "gradient-indigo",
    description: "Xem và quản lý sản phẩm affiliate"
  },
  {
    title: "Duyệt YC Sản Phẩm",
    url: "/affiliate-product-requests",
    icon: CheckCircle,
    gradient: "gradient-purple",
    description: "Duyệt yêu cầu sản phẩm từ affiliate"
  },
  {
    title: "Duyệt VIP",
    url: "/vip-approvals",
    icon: Crown,
    gradient: "gradient-gold",
    description: "Duyệt và quản lý đơn đăng ký VIP"
  },
  {
    title: "Duyệt Tài xế",
    url: "/driver-approvals",
    icon: Truck,
    gradient: "gradient-blue",
    description: "Duyệt và quản lý đơn đăng ký tài xế"
  },
  {
    title: "Duyệt Affiliate",
    url: "/affiliate-approvals",
    icon: UserCheck,
    gradient: "gradient-green",
    description: "Duyệt và quản lý đơn đăng ký affiliate"
  },
  {
    title: "Thành viên",
    url: "/membership",
    icon: Gift,
    gradient: "gradient-pink",
    description: "Chương trình thành viên và loyalty"
  },
  {
    title: "Phân quyền địa phương",
    url: "/customer-local-assignment",
    icon: MapPin,
    gradient: "gradient-green",
    description: "Phân quyền khách hàng theo khu vực"
  },
  {
    title: "FAQ Templates",
    url: "/faq-templates",
    icon: FileQuestion,
    gradient: "gradient-blue",
    description: "Quản lý câu hỏi thường gặp"
  },
  {
    title: "Phân công nhiệm vụ",
    url: "/task-assignment",
    icon: Users,
    gradient: "gradient-orange",
    description: "Phân công công việc cho nhân viên"
  },
];

// 4. MARKETING - Marketing and content management
const marketingItems = [
  {
    title: "Satellites",
    url: "/satellites",
    icon: Satellite,
    gradient: "gradient-purple",
    description: "Hệ thống vệ tinh tự động đăng bài"
  },
  {
    title: "Queue Manager",
    url: "/queue-manager",
    icon: LayoutList,
    gradient: "gradient-orange",
    description: "Quản lý hàng đợi scheduled posts"
  },
  {
    title: "Content Library",
    url: "/content-library",
    icon: Image,
    gradient: "gradient-pink",
    description: "Thư viện nội dung & assets"
  },
  {
    title: "Groups Manager",
    url: "/groups-manager",
    icon: Users,
    gradient: "gradient-teal",
    description: "Quản lý groups và account groups"
  },
  {
    title: "Facebook Apps",
    url: "/facebook-apps",
    icon: Settings,
    gradient: "gradient-blue",
    description: "Quản lý Facebook Apps và Webhook"
  },
  {
    title: "Email & SMS",
    url: "/email-sms-marketing",
    icon: Mail,
    gradient: "gradient-blue",
    description: "Email marketing và SMS campaigns"
  },
  {
    title: "Landing Pages",
    url: "/product-landing-pages",
    icon: Palette,
    gradient: "gradient-purple",
    description: "Tạo và quản lý trang đích"
  },
  {
    title: "Storefront Manager",
    url: "/storefront-manager",
    icon: Store,
    gradient: "gradient-blue",
    description: "Tạo và quản lý cửa hàng online"
  },
  {
    title: "Đối tác & Affiliate",
    url: "/affiliate-program",
    icon: Users,
    gradient: "gradient-orange",
    description: "Chương trình đối tác và affiliate"
  },
];

// 5. VẬN HÀNH - Operations and logistics
const operationsItems = [
  {
    title: "Nhà cung cấp",
    url: "/suppliers",
    icon: Building2,
    gradient: "gradient-blue",
    description: "Quản lý nhà cung cấp và đối tác"
  },
  {
    title: "Đơn đặt hàng",
    url: "/purchase-orders",
    icon: ShoppingCart,
    gradient: "gradient-green",
    description: "Quản lý đơn đặt hàng từ nhà cung cấp"
  },
  {
    title: "Vận chuyển",
    url: "/shipping",
    icon: Truck,
    gradient: "gradient-orange",
    description: "Quản lý vận chuyển và giao hàng"
  },
  {
    title: "API Management",
    url: "/api-management",
    icon: Zap,
    gradient: "gradient-purple",
    description: "Giám sát và quản lý API endpoints"
  },
];

// 6. SÁCH & ĐỌC GIẢ - Books and readers management
const bookItems = [
  {
    title: "Book Catalog Admin",
    url: "/book-catalog-admin",
    icon: BookOpen,
    badge: "NEW",
    gradient: "gradient-purple",
    description: "Quản lý catalog sách với Amazon integration"
  },
  {
    title: "Danh mục sách",
    url: "/general-categories-admin",
    icon: Tags,
    gradient: "gradient-indigo",
    description: "Quản lý danh mục sách theo thể loại"
  },
  {
    title: "Quản lý sách",
    url: "/books",
    icon: BookOpen,
    gradient: "gradient-indigo",
    description: "Quản lý sách và AbeBooks integration"
  },
  {
    title: "Phân loại sách",
    url: "/book-categories",
    icon: Tags,
    gradient: "gradient-blue",
    description: "Quản lý categories cho sách"
  },
  {
    title: "Đơn hàng sách",
    url: "/book-orders",
    icon: ShoppingCart,
    gradient: "gradient-green",
    description: "Quản lý đơn hàng sách riêng biệt"
  },
  {
    title: "Dashboard Đơn Sách",
    url: "/book-orders-dashboard",
    icon: BarChart3,
    gradient: "gradient-blue",
    description: "Thống kê và phân tích đơn hàng sách"
  },
  {
    title: "Quản lý Driver",
    url: "/driver-management",
    icon: Truck,
    gradient: "gradient-orange",
    description: "Quản lý tài xế, phương tiện và chuyến đi"
  },
  {
    title: "Khách hàng sách",
    url: "/book-customers",
    icon: Users,
    gradient: "gradient-purple",
    description: "Quản lý khách hàng và độc giả sách"
  },
  {
    title: "Người bán sách",
    url: "/book-sellers",
    icon: UserCheck,
    gradient: "gradient-green",
    description: "Quản lý 20+ người bán sách tự động"
  },
  {
    title: "Hiệu Suất Nhà Bán",
    url: "/seller-performance",
    icon: TrendingUp,
    badge: "NEW",
    gradient: "gradient-purple",
    description: "Dashboard phân tích real-time"
  },
  {
    title: "AbeBooks",
    url: "/books-abebooks",
    icon: BookOpen,
    badge: "VN",
    gradient: "gradient-blue",
    description: "Quản lý sách và giá AbeBooks"
  },
];

// 7. GIAO HÀNG & XE - Delivery & Vehicle Management
const deliveryItems = [
  {
    title: "Dashboard Giao hàng",
    url: "/delivery-dashboard",
    icon: BarChart3,
    gradient: "gradient-blue",
    description: "Tổng quan quản lý giao hàng và xe"
  },
  {
    title: "Quản lý Phương tiện",
    url: "/vehicle-management",
    icon: Truck,
    gradient: "gradient-green",
    description: "Danh sách và quản lý xe"
  },
  {
    title: "Đơn Giao hàng",
    url: "/delivery-orders",
    icon: Package,
    gradient: "gradient-purple",
    description: "Quản lý đơn hàng cần giao"
  },
  {
    title: "Nhóm Xe",
    url: "/car-groups",
    icon: FolderKanban,
    gradient: "gradient-orange",
    description: "Phân loại và tổ chức phương tiện"
  },
];

// 8. HỆ THỐNG - System settings and configuration  
const systemItems = [
  {
    title: "Quản lý Admin",
    url: "/admin-users",
    icon: Shield,
    gradient: "gradient-red",
    description: "Quản lý tài khoản quản trị viên"
  },
  {
    title: "Cài đặt Shop",
    url: "/shop-settings",
    icon: Settings,
    gradient: "gradient-pink",
    description: "Cấu hình cửa hàng và hệ thống"
  },
  {
    title: "Thiết kế Hóa đơn",
    url: "/admin/invoice-designer",
    icon: Palette,
    gradient: "gradient-purple",
    description: "Tùy chỉnh giao diện hóa đơn trực quan"
  },
  {
    title: "Worker Management",
    url: "/worker-management",
    icon: Server,
    gradient: "gradient-teal",
    description: "Quản lý workers và background jobs"
  },
  {
    title: "IP Pool Manager",
    url: "/ip-pool-manager",
    icon: Cloud,
    gradient: "gradient-cyan",
    description: "Quản lý IP sources cho auto-posting"
  },
  {
    title: "Danh mục & Tags",
    url: "/categories",
    icon: Tags,
    gradient: "gradient-mint",
    description: "Quản lý danh mục hệ thống và tags"
  },
  {
    title: "Frontend Management",
    url: "/frontend-management",
    icon: Monitor,
    gradient: "gradient-purple",
    description: "Quản lý Frontend A, B, C và phân công categories"
  },
  {
    title: "Cookie Management",
    url: "/cookie-management",
    icon: Shield,
    gradient: "gradient-amber",
    description: "Quản lý hồ sơ cookie mã hóa cho automation"
  },
  {
    title: "Nghành nghề",
    url: "/industries",
    icon: Building2,
    gradient: "gradient-blue",
    description: "Quản lý ngành nghề và lĩnh vực kinh doanh"
  },
];


export function AppSidebar() {
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const { admin, logout } = useAdminAuth();
  
  // Favorites/Pins functionality
  const [pinnedItems, setPinnedItems] = useState<string[]>(() => {
    const saved = localStorage.getItem('sidebar-pinned-items');
    return saved ? JSON.parse(saved) : [];
  });

  const togglePin = (url: string) => {
    setPinnedItems((prev) => {
      const newPinned = prev.includes(url)
        ? prev.filter((item) => item !== url)
        : [...prev, url];
      localStorage.setItem('sidebar-pinned-items', JSON.stringify(newPinned));
      return newPinned;
    });
  };

  const isPinned = (url: string) => pinnedItems.includes(url);
  
  // Filter menu items based on search query
  const normalizeVietnamese = (str: string) => {
    return str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D");
  };

  const filterItems = (items: any[]) => {
    if (!searchQuery.trim()) return items;
    const normalizedQuery = normalizeVietnamese(searchQuery);
    return items.filter((item) => {
      const normalizedTitle = normalizeVietnamese(item.title);
      const normalizedDesc = normalizeVietnamese(item.description || "");
      return (
        normalizedTitle.includes(normalizedQuery) ||
        normalizedDesc.includes(normalizedQuery)
      );
    });
  };

  const filteredOverview = useMemo(() => filterItems(overviewItems), [searchQuery]);
  const filteredSales = useMemo(() => filterItems(salesItems), [searchQuery]);
  const filteredCustomer = useMemo(() => filterItems(customerItems), [searchQuery]);
  const filteredMarketing = useMemo(() => filterItems(marketingItems), [searchQuery]);
  const filteredOperations = useMemo(() => filterItems(operationsItems), [searchQuery]);
  const filteredBooks = useMemo(() => filterItems(bookItems), [searchQuery]);
  const filteredDelivery = useMemo(() => filterItems(deliveryItems), [searchQuery]);
  const filteredSystem = useMemo(() => filterItems(systemItems), [searchQuery]);
  
  // Get pinned items from all groups
  const allItems = [
    ...overviewItems,
    ...salesItems,
    ...customerItems,
    ...marketingItems,
    ...operationsItems,
    ...bookItems,
    ...deliveryItems,
    ...systemItems,
  ];
  
  const pinnedMenuItems = useMemo(() => {
    return allItems.filter((item) => isPinned(item.url));
  }, [pinnedItems]);
  
  return (
    <Sidebar className="modern-sidebar border-r border-border/50 bg-surface/80 backdrop-blur-xl">
      {/* Modern Header với activity branding */}
      <SidebarHeader className="p-6 border-b border-border/50 space-y-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-teal-500 to-teal-600 shadow-lg">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full animate-pulse shadow-lg"></div>
          </div>
          <div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Social Admin
            </h2>
            <p className="text-sm text-muted-foreground/80">Activity Manager</p>
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Tìm kiếm menu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-9 h-10 bg-muted/50 border-border/50 focus:bg-background transition-colors"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchQuery("")}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 hover:bg-muted"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="flex-1 overflow-y-auto">
        {/* ⭐ Favorites Section */}
        {!searchQuery && pinnedMenuItems.length > 0 && (
          <CollapsibleSidebarGroup 
            title="YÊU THÍCH"
            icon="⭐"
            defaultCollapsed={false}
            persistKey="favorites"
            itemCount={pinnedMenuItems.length}
          >
            <SidebarMenu className="space-y-2">
              {pinnedMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location === item.url}
                    className={`group relative overflow-hidden rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-md ${
                      location === item.url 
                        ? 'bg-primary/10 text-primary border-primary/20 border shadow-sm' 
                        : 'hover:bg-card/80 hover:shadow-sm'
                    }`}
                  >
                    <Link href={item.url} className="flex items-center gap-3 p-3">
                      <div className={`
                        relative flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200
                        ${location === item.url 
                          ? 'bg-primary text-primary-foreground shadow-sm' 
                          : 'bg-muted/50 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
                        }
                      `}>
                        <item.icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-sm">{item.title}</span>
                        {item.description && (
                          <p className="text-xs text-muted-foreground/70 truncate mt-0.5">
                            {item.description}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          togglePin(item.url);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 p-0"
                      >
                        <PinOff className="h-3 w-3 text-yellow-500" />
                      </Button>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </CollapsibleSidebarGroup>
        )}

        {/* 1. Tổng quan */}
        {filteredOverview.length > 0 && (
          <CollapsibleSidebarGroup 
          title="TỔNG QUAN"
          icon="📊"
          defaultCollapsed={false}
          persistKey="overview"
          itemCount={filteredOverview.length}
        >
          <SidebarMenu className="space-y-2">
              {filteredOverview.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location === item.url}
                    className={`group relative overflow-hidden rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-md ${
                      location === item.url 
                        ? 'bg-primary/10 text-primary border-primary/20 border shadow-sm' 
                        : 'hover:bg-card/80 hover:shadow-sm'
                    }`}
                    data-testid={`nav-${item.title.toLowerCase()}`}
                  >
                    <Link href={item.url} className="flex items-center gap-3 p-3">
                      <div className={`
                        relative flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200
                        ${location === item.url 
                          ? 'bg-primary text-primary-foreground shadow-sm' 
                          : 'bg-muted/50 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
                        }
                      `}>
                        <item.icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-sm">{item.title}</span>
                        {item.description && (
                          <p className="text-xs text-muted-foreground/70 truncate mt-0.5">
                            {item.description}
                          </p>
                        )}
                      </div>
                      {(item as any).badge && (
                        <Badge 
                          variant="secondary" 
                          className="bg-primary/10 text-primary border-primary/20 text-xs px-2 py-0.5"
                        >
                          {(item as any).badge}
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          togglePin(item.url);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 p-0"
                      >
                        {isPinned(item.url) ? (
                          <PinOff className="h-3 w-3 text-yellow-500" />
                        ) : (
                          <Pin className="h-3 w-3" />
                        )}
                      </Button>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
          </SidebarMenu>
          </CollapsibleSidebarGroup>
        )}

        {/* 2. Bán hàng */}
        {filteredSales.length > 0 && (
          <CollapsibleSidebarGroup 
          title="BÁN HÀNG"
          icon="🛒"
          defaultCollapsed={false}
          persistKey="sales"
          itemCount={filteredSales.length}
        >
          <SidebarMenu className="space-y-2">
              {filteredSales.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location === item.url}
                    className={`group relative overflow-hidden rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-md ${
                      location === item.url 
                        ? 'bg-primary/10 text-primary border-primary/20 border shadow-sm' 
                        : 'hover:bg-card/80 hover:shadow-sm'
                    }`}
                    data-testid={`nav-${item.title.toLowerCase()}`}
                  >
                    <Link href={item.url} className="flex items-center gap-3 p-3">
                      <div className={`
                        relative flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200
                        ${location === item.url 
                          ? 'bg-primary text-primary-foreground shadow-sm' 
                          : 'bg-muted/50 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
                        }
                      `}>
                        <item.icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-sm">{item.title}</span>
                        {item.description && (
                          <p className="text-xs text-muted-foreground/70 truncate mt-0.5">
                            {item.description}
                          </p>
                        )}
                      </div>
                      {(item as any).badge && (
                        <Badge 
                          variant="secondary" 
                          className="bg-primary/10 text-primary border-primary/20 text-xs px-2 py-0.5"
                        >
                          {(item as any).badge}
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          togglePin(item.url);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 p-0"
                      >
                        {isPinned(item.url) ? (
                          <PinOff className="h-3 w-3 text-yellow-500" />
                        ) : (
                          <Pin className="h-3 w-3" />
                        )}
                      </Button>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
          </SidebarMenu>
          </CollapsibleSidebarGroup>
        )}

        {/* 3. Khách hàng */}
        {filteredCustomer.length > 0 && (
          <CollapsibleSidebarGroup 
          title="KHÁCH HÀNG"
          icon="👥"
          defaultCollapsed={false}
          persistKey="customers"
          itemCount={filteredCustomer.length}
        >
          <SidebarMenu className="space-y-2">
              {filteredCustomer.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location === item.url}
                    className={`group relative overflow-hidden rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-md ${
                      location === item.url 
                        ? 'bg-primary/10 text-primary border-primary/20 border shadow-sm' 
                        : 'hover:bg-card/80 hover:shadow-sm'
                    }`}
                  >
                    <Link href={item.url} className="flex items-center gap-3 p-3">
                      <div className={`
                        relative flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200
                        ${location === item.url 
                          ? 'bg-primary text-primary-foreground shadow-sm' 
                          : 'bg-muted/50 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
                        }
                      `}>
                        <item.icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-sm">{item.title}</span>
                        <p className="text-xs text-muted-foreground/70 truncate mt-0.5">
                          {item.description}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          togglePin(item.url);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 p-0"
                      >
                        {isPinned(item.url) ? (
                          <PinOff className="h-3 w-3 text-yellow-500" />
                        ) : (
                          <Pin className="h-3 w-3" />
                        )}
                      </Button>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
          </SidebarMenu>
          </CollapsibleSidebarGroup>
        )}

        {/* 4. Marketing */}
        {filteredMarketing.length > 0 && (
          <CollapsibleSidebarGroup 
          title="MARKETING"
          icon="📢"
          defaultCollapsed={false}
          persistKey="marketing"
          itemCount={filteredMarketing.length}
        >
          <SidebarMenu className="space-y-2">
              {filteredMarketing.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location === item.url}
                    className={`group relative overflow-hidden rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-md ${
                      location === item.url 
                        ? 'bg-primary/10 text-primary border-primary/20 border shadow-sm' 
                        : 'hover:bg-card/80 hover:shadow-sm'
                    }`}
                  >
                    <Link href={item.url} className="flex items-center gap-3 p-3">
                      <div className={`
                        relative flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200
                        ${location === item.url 
                          ? 'bg-primary text-primary-foreground shadow-sm' 
                          : 'bg-muted/50 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
                        }
                      `}>
                        <item.icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-sm">{item.title}</span>
                        <p className="text-xs text-muted-foreground/70 truncate mt-0.5">
                          {item.description}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          togglePin(item.url);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 p-0"
                      >
                        {isPinned(item.url) ? (
                          <PinOff className="h-3 w-3 text-yellow-500" />
                        ) : (
                          <Pin className="h-3 w-3" />
                        )}
                      </Button>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
          </SidebarMenu>
          </CollapsibleSidebarGroup>
        )}

        {/* 5. Vận hành */}
        {filteredOperations.length > 0 && (
          <CollapsibleSidebarGroup 
          title="VẬN HÀNH"
          icon="⚙️"
          defaultCollapsed={false}
          persistKey="operations"
          itemCount={filteredOperations.length}
        >
          <SidebarMenu className="space-y-2">
              {filteredOperations.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location === item.url}
                    className={`group relative overflow-hidden rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-md ${
                      location === item.url 
                        ? 'bg-primary/10 text-primary border-primary/20 border shadow-sm' 
                        : 'hover:bg-card/80 hover:shadow-sm'
                    }`}
                  >
                    <Link href={item.url} className="flex items-center gap-3 p-3">
                      <div className={`
                        relative flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200
                        ${location === item.url 
                          ? 'bg-primary text-primary-foreground shadow-sm' 
                          : 'bg-muted/50 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
                        }
                      `}>
                        <item.icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-sm">{item.title}</span>
                        <p className="text-xs text-muted-foreground/70 truncate mt-0.5">
                          {item.description}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          togglePin(item.url);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 p-0"
                      >
                        {isPinned(item.url) ? (
                          <PinOff className="h-3 w-3 text-yellow-500" />
                        ) : (
                          <Pin className="h-3 w-3" />
                        )}
                      </Button>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
          </SidebarMenu>
          </CollapsibleSidebarGroup>
        )}

        {/* 6. Sách & Độc giả */}
        {filteredBooks.length > 0 && (
          <CollapsibleSidebarGroup 
          title="SÁCH & ĐỌC GIẢ"
          icon="📚"
          defaultCollapsed={false}
          persistKey="books"
          itemCount={filteredBooks.length}
        >
          <SidebarMenu className="space-y-2">
              {filteredBooks.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location === item.url}
                    className={`group relative overflow-hidden rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-md ${
                      location === item.url 
                        ? 'bg-primary/10 text-primary border-primary/20 border shadow-sm' 
                        : 'hover:bg-card/80 hover:shadow-sm'
                    }`}
                    data-testid={`nav-${item.title.toLowerCase()}`}
                  >
                    <Link href={item.url} className="flex items-center gap-3 p-3">
                      <div className={`
                        relative flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200
                        ${location === item.url 
                          ? 'bg-primary text-primary-foreground shadow-sm' 
                          : 'bg-muted/50 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
                        }
                      `}>
                        <item.icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-sm">{item.title}</span>
                        {item.description && (
                          <p className="text-xs text-muted-foreground/70 truncate mt-0.5">
                            {item.description}
                          </p>
                        )}
                      </div>
                      {(item as any).badge && (
                        <Badge 
                          variant="secondary" 
                          className="bg-primary/10 text-primary border-primary/20 text-xs px-2 py-0.5"
                        >
                          {(item as any).badge}
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          togglePin(item.url);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 p-0"
                      >
                        {isPinned(item.url) ? (
                          <PinOff className="h-3 w-3 text-yellow-500" />
                        ) : (
                          <Pin className="h-3 w-3" />
                        )}
                      </Button>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
          </SidebarMenu>
          </CollapsibleSidebarGroup>
        )}

        {/* 7. Giao hàng & Xe */}
        {filteredDelivery.length > 0 && (
          <CollapsibleSidebarGroup 
          title="GIAO HÀNG & XE"
          icon="🚚"
          defaultCollapsed={false}
          persistKey="delivery"
          itemCount={filteredDelivery.length}
        >
          <SidebarMenu className="space-y-2">
              {filteredDelivery.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location === item.url}
                    className={`group relative overflow-hidden rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-md ${
                      location === item.url 
                        ? 'bg-primary/10 text-primary border-primary/20 border shadow-sm' 
                        : 'hover:bg-card/80 hover:shadow-sm'
                    }`}
                  >
                    <Link href={item.url} className="flex items-center gap-3 p-3">
                      <div className={`
                        relative flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200
                        ${location === item.url 
                          ? 'bg-primary text-primary-foreground shadow-sm' 
                          : 'bg-muted/50 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
                        }
                      `}>
                        <item.icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-sm">{item.title}</span>
                        <p className="text-xs text-muted-foreground/70 truncate mt-0.5">
                          {item.description}
                        </p>
                      </div>
                      {(item as any).badge && (
                        <Badge 
                          variant="secondary" 
                          className="bg-primary/10 text-primary border-primary/20 text-xs px-2 py-0.5"
                        >
                          {(item as any).badge}
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          togglePin(item.url);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 p-0"
                      >
                        {isPinned(item.url) ? (
                          <PinOff className="h-3 w-3 text-yellow-500" />
                        ) : (
                          <Pin className="h-3 w-3" />
                        )}
                      </Button>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
          </SidebarMenu>
          </CollapsibleSidebarGroup>
        )}

        {/* 8. Hệ thống */}
        {filteredSystem.length > 0 && (
          <CollapsibleSidebarGroup 
          title="HỆ THỐNG"
          icon="🔧"
          defaultCollapsed={false}
          persistKey="system"
          itemCount={filteredSystem.length}
        >
          <SidebarMenu className="space-y-2">
              {filteredSystem.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location === item.url}
                    className={`group relative overflow-hidden rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-md ${
                      location === item.url 
                        ? 'bg-primary/10 text-primary border-primary/20 border shadow-sm' 
                        : 'hover:bg-card/80 hover:shadow-sm'
                    }`}
                  >
                    <Link href={item.url} className="flex items-center gap-3 p-3">
                      <div className={`
                        relative flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200
                        ${location === item.url 
                          ? 'bg-primary text-primary-foreground shadow-sm' 
                          : 'bg-muted/50 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
                        }
                      `}>
                        <item.icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-sm">{item.title}</span>
                        <p className="text-xs text-muted-foreground/70 truncate mt-0.5">
                          {item.description}
                        </p>
                      </div>
                      {(item as any).badge && (
                        <Badge 
                          variant="secondary" 
                          className="bg-primary/10 text-primary border-primary/20 text-xs px-2 py-0.5"
                        >
                          {(item as any).badge}
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          togglePin(item.url);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 p-0"
                      >
                        {isPinned(item.url) ? (
                          <PinOff className="h-3 w-3 text-yellow-500" />
                        ) : (
                          <Pin className="h-3 w-3" />
                        )}
                      </Button>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
          </SidebarMenu>
          </CollapsibleSidebarGroup>
        )}

      </SidebarContent>

      {/* Modern Footer với user profile */}
      <SidebarFooter className="p-4 border-t border-border/50">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-card/50 hover:bg-card/80 transition-all duration-200">
          <div className="relative">
            <Avatar className="h-10 w-10 ring-2 ring-primary/20">
              <AvatarImage src="/placeholder-avatar.jpg" alt="Admin" />
              <AvatarFallback className="bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold">
                {admin?.name?.substring(0, 2).toUpperCase() || 'AD'}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full border-2 border-background"></div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{admin?.name || 'Admin'}</p>
            <p className="text-xs text-muted-foreground/70 truncate">{admin?.email || ''}</p>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={logout}
            className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
            title="Đăng xuất"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}