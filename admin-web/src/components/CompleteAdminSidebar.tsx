import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import {
  Home,
  Package,
  ShoppingCart,
  Users,
  Share2,
  Bot,
  Truck,
  Settings,
  Shield,
  BarChart,
  Facebook,
  TrendingUp,
  Satellite,
  MessageSquare,
  Gift,
  Tag,
  BookOpen,
  Star,
  FolderKanban,
  Calendar,
  UserCheck,
  Clock,
  Bolt,
  Cloud,
  ShoppingBag,
  Grid,
  Activity,
  Server,
  CreditCard,
  MapPin,
  Store,
} from "lucide-react";

interface MenuItem {
  path: string;
  label: string;
  icon?: React.ReactNode;
}

interface MenuGroup {
  id: string;
  label: string;
  icon: React.ReactNode;
  items: MenuItem[];
}

const menuGroups: MenuGroup[] = [
  {
    id: "dashboard",
    label: "Dashboard & Analytics",
    icon: <Home className="w-5 h-5" />,
    items: [
      { path: "/", label: "Dashboard", icon: <Home className="w-4 h-4" /> },
      { path: "/analytics", label: "Analytics", icon: <BarChart className="w-4 h-4" /> },
      { path: "/post-analytics", label: "Post Performance", icon: <TrendingUp className="w-4 h-4" /> },
      { path: "/best-time-recommendations", label: "Best Time", icon: <Clock className="w-4 h-4" /> },
      { path: "/seller-performance", label: "Seller Performance", icon: <TrendingUp className="w-4 h-4" /> },
    ],
  },
  {
    id: "products",
    label: "Sản phẩm & Kho",
    icon: <Package className="w-5 h-5" />,
    items: [
      { path: "/products", label: "Products", icon: <ShoppingBag className="w-4 h-4" /> },
      { path: "/store-products", label: "Store Products", icon: <Store className="w-4 h-4" /> },
      { path: "/categories", label: "Categories", icon: <FolderKanban className="w-4 h-4" /> },
      { path: "/general-categories-admin", label: "General Categories", icon: <Grid className="w-4 h-4" /> },
      { path: "/categories-admin", label: "Product Categories", icon: <FolderKanban className="w-4 h-4" /> },
      { path: "/industries", label: "Industries", icon: <Cloud className="w-4 h-4" /> },
      { path: "/review-management", label: "Reviews", icon: <Star className="w-4 h-4" /> },
      { path: "/faq-templates", label: "FAQ Templates", icon: <BookOpen className="w-4 h-4" /> },
      { path: "/faq-library", label: "FAQ Library", icon: <BookOpen className="w-4 h-4" /> },
      { path: "/tag-management", label: "Tags", icon: <Tag className="w-4 h-4" /> },
    ],
  },
  {
    id: "frontend",
    label: "Frontend & Storefronts",
    icon: <Grid className="w-5 h-5" />,
    items: [
      { path: "/store", label: "Store", icon: <ShoppingBag className="w-4 h-4" /> },
      { path: "/storefront-manager", label: "Storefront Manager", icon: <ShoppingBag className="w-4 h-4" /> },
      { path: "/mobile", label: "Mobile Storefront", icon: <Activity className="w-4 h-4" /> },
      { path: "/product-landing-pages", label: "Product Landing Pages", icon: <BookOpen className="w-4 h-4" /> },
      { path: "/landing-page-manager", label: "Landing Page Manager", icon: <BookOpen className="w-4 h-4" /> },
      { path: "/landing-page-editor", label: "Landing Page Editor", icon: <BookOpen className="w-4 h-4" /> },
      { path: "/frontend-management", label: "Frontend Management", icon: <Grid className="w-4 h-4" /> },
    ],
  },
  {
    id: "orders",
    label: "Đơn hàng",
    icon: <ShoppingCart className="w-5 h-5" />,
    items: [
      { path: "/orders", label: "Orders", icon: <ShoppingCart className="w-4 h-4" /> },
      { path: "/pos", label: "POS", icon: <CreditCard className="w-4 h-4" /> },
      { path: "/admin/invoice-designer", label: "Invoices", icon: <BookOpen className="w-4 h-4" /> },
    ],
  },
  {
    id: "vendors",
    label: "Vendors & Consignment",
    icon: <Store className="w-5 h-5" />,
    items: [
      { path: "/vendors", label: "Vendor Management", icon: <Users className="w-4 h-4" /> },
      { path: "/vendor-orders", label: "Vendor Orders", icon: <ShoppingCart className="w-4 h-4" /> },
      { path: "/vendor-returns", label: "Vendor Returns", icon: <Package className="w-4 h-4" /> },
      { path: "/vendor-financial", label: "Vendor Financial", icon: <CreditCard className="w-4 h-4" /> },
    ],
  },
  {
    id: "customers",
    label: "Khách hàng & Membership",
    icon: <Users className="w-5 h-5" />,
    items: [
      { path: "/customers", label: "Customers", icon: <Users className="w-4 h-4" /> },
      { path: "/customer-local-assignment", label: "Customer Assignment", icon: <UserCheck className="w-4 h-4" /> },
      { path: "/member-profile", label: "Member Profile", icon: <Users className="w-4 h-4" /> },
      { path: "/vip-approvals", label: "VIP Management", icon: <Star className="w-4 h-4" /> },
      { path: "/affiliate-management", label: "Affiliates", icon: <Users className="w-4 h-4" /> },
      { path: "/affiliate-products", label: "Affiliate Products", icon: <Package className="w-4 h-4" /> },
      { path: "/affiliate-product-management", label: "Affiliate Product Mgmt", icon: <Grid className="w-4 h-4" /> },
      { path: "/affiliate-product-requests", label: "Product Requests", icon: <MessageSquare className="w-4 h-4" /> },
      { path: "/affiliate-approvals", label: "Affiliate Approvals", icon: <UserCheck className="w-4 h-4" /> },
      { path: "/member/vouchers", label: "Vouchers", icon: <Gift className="w-4 h-4" /> },
      { path: "/discounts", label: "Discounts", icon: <Tag className="w-4 h-4" /> },
      { path: "/member/campaigns", label: "Campaigns", icon: <Bolt className="w-4 h-4" /> },
      { path: "/gifts", label: "Gifts", icon: <Gift className="w-4 h-4" /> },
    ],
  },
  {
    id: "social",
    label: "Social Media",
    icon: <Share2 className="w-5 h-5" />,
    items: [
      { path: "/facebook-apps", label: "Facebook Apps", icon: <Facebook className="w-4 h-4" /> },
      { path: "/tiktok-business", label: "TikTok Business", icon: <Activity className="w-4 h-4" /> },
      { path: "/tiktok-shop", label: "TikTok Shop", icon: <ShoppingBag className="w-4 h-4" /> },
      { path: "/shopee", label: "Shopee", icon: <ShoppingBag className="w-4 h-4" /> },
      { path: "/satellites", label: "Satellites", icon: <Satellite className="w-4 h-4" /> },
      { path: "/groups-manager", label: "Groups", icon: <Users className="w-4 h-4" /> },
      { path: "/content-library", label: "Content Library", icon: <FolderKanban className="w-4 h-4" /> },
      { path: "/queue-manager", label: "Queue", icon: <Calendar className="w-4 h-4" /> },
      { path: "/post-scheduler", label: "Post Scheduler", icon: <Clock className="w-4 h-4" /> },
      { path: "/linked-accounts", label: "Linked Accounts", icon: <Cloud className="w-4 h-4" /> },
    ],
  },
  {
    id: "chatbot",
    label: "Chatbot",
    icon: <Bot className="w-5 h-5" />,
    items: [
      { path: "/chatbot", label: "Chatbot Dashboard", icon: <Bot className="w-4 h-4" /> },
      { path: "/chatbot-settings", label: "Settings", icon: <Settings className="w-4 h-4" /> },
      { path: "/chat-logs", label: "Chat Logs", icon: <BookOpen className="w-4 h-4" /> },
      { path: "/chatbot-responses", label: "Conversations", icon: <MessageSquare className="w-4 h-4" /> },
      { path: "/chatbot-test", label: "Test", icon: <Bolt className="w-4 h-4" /> },
      { path: "/bot-status", label: "RASA Status", icon: <Activity className="w-4 h-4" /> },
      { path: "/chatbot-analytics", label: "Analytics", icon: <BarChart className="w-4 h-4" /> },
    ],
  },
  {
    id: "delivery",
    label: "Vận chuyển",
    icon: <Truck className="w-5 h-5" />,
    items: [
      { path: "/delivery-dashboard", label: "Dashboard", icon: <Home className="w-4 h-4" /> },
      { path: "/driver-management", label: "Drivers", icon: <Users className="w-4 h-4" /> },
      { path: "/driver-approvals", label: "Driver Approvals", icon: <UserCheck className="w-4 h-4" /> },
      { path: "/vehicle-management", label: "Vehicles", icon: <Truck className="w-4 h-4" /> },
      { path: "/delivery-orders", label: "Delivery Orders", icon: <ShoppingCart className="w-4 h-4" /> },
      { path: "/car-groups", label: "Routes", icon: <MapPin className="w-4 h-4" /> },
    ],
  },
  {
    id: "settings",
    label: "Cài đặt",
    icon: <Settings className="w-5 h-5" />,
    items: [
      { path: "/shop-settings", label: "Shop Settings", icon: <Settings className="w-4 h-4" /> },
      { path: "/task-assignment", label: "Task Assignment", icon: <Calendar className="w-4 h-4" /> },
      { path: "/cookie-management", label: "Cookie Management", icon: <Shield className="w-4 h-4" /> },
      { path: "/api-management", label: "API Management", icon: <Server className="w-4 h-4" /> },
      { path: "/worker-management", label: "Workers", icon: <Server className="w-4 h-4" /> },
      { path: "/ip-pool-manager", label: "IP Pool", icon: <Activity className="w-4 h-4" /> },
      { path: "/ngrok-config", label: "Ngrok", icon: <Cloud className="w-4 h-4" /> },
      { path: "/viettelpost-settings", label: "ViettelPost", icon: <Truck className="w-4 h-4" /> },
      { path: "/payment-settings", label: "Payment Gateway", icon: <CreditCard className="w-4 h-4" /> },
    ],
  },
  {
    id: "admin",
    label: "Admin",
    icon: <Shield className="w-5 h-5" />,
    items: [
      { path: "/admin-users", label: "Admin Users", icon: <Users className="w-4 h-4" /> },
      { path: "/admin/oauth-settings", label: "OAuth Settings", icon: <Settings className="w-4 h-4" /> },
      { path: "/admin-campaigns", label: "Admin Campaigns", icon: <Bolt className="w-4 h-4" /> },
    ],
  },
];

export default function CompleteAdminSidebar() {
  const [location] = useLocation();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => {
    const saved = localStorage.getItem("adminSidebarExpanded");
    if (saved) {
      try {
        return new Set(JSON.parse(saved));
      } catch {
        return new Set(["dashboard"]);
      }
    }
    return new Set(["dashboard"]);
  });

  useEffect(() => {
    localStorage.setItem("adminSidebarExpanded", JSON.stringify(Array.from(expandedGroups)));
  }, [expandedGroups]);

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };

  const isActive = (path: string) => {
    if (path === "/") {
      return location === "/";
    }
    // Exact match or followed by / or ? to prevent false positives
    // e.g., /categories won't match /categories-admin
    return location === path || location.startsWith(path + "/") || location.startsWith(path + "?");
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Menu Groups */}
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="px-3 space-y-1">
          {menuGroups.map((group) => {
            const isExpanded = expandedGroups.has(group.id);

            return (
              <div key={group.id} className="mb-1">
                {/* Group Header */}
                <button
                  onClick={() => toggleGroup(group.id)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {group.icon}
                    <span>{group.label}</span>
                  </div>
                  {isExpanded ? (
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </button>

                {/* Group Items */}
                {isExpanded && (
                  <div className="mt-1 ml-3 space-y-0.5">
                    {group.items.map((item) => {
                      const active = isActive(item.path);

                      return (
                        <Link
                          key={item.path}
                          href={item.path}
                          className={`
                            flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all
                            ${
                              active
                                ? "bg-blue-50 text-blue-600 font-medium border-l-4 border-blue-600 pl-2"
                                : "text-gray-600 hover:bg-gray-50 border-l-4 border-transparent pl-2"
                            }
                          `}
                        >
                          {item.icon}
                          <span className="truncate">{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-lg">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-sm font-bold text-white">AD</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">Admin</p>
            <p className="text-xs text-gray-500 truncate">System Administrator</p>
          </div>
        </div>
      </div>
    </div>
  );
}
