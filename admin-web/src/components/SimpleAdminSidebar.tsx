import { Link, useLocation } from "wouter";
import { Home, Package, ShoppingCart, Users, Settings } from "lucide-react";

interface MenuItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

const menuItems: MenuItem[] = [
  { path: "/", label: "Dashboard", icon: <Home className="w-5 h-5" /> },
  { path: "/products", label: "Sản phẩm", icon: <Package className="w-5 h-5" /> },
  { path: "/orders", label: "Đơn hàng", icon: <ShoppingCart className="w-5 h-5" /> },
  { path: "/customers", label: "Khách hàng", icon: <Users className="w-5 h-5" /> },
  { path: "/shop-settings", label: "Cài đặt", icon: <Settings className="w-5 h-5" /> },
];

export default function SimpleAdminSidebar() {
  const [location] = useLocation();

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Package className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Admin</h1>
            <p className="text-xs text-gray-500">Dashboard</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="px-3 space-y-1">
          {menuItems.map((item) => {
            const isActive = location === item.path;
            
            return (
              <Link key={item.path} href={item.path}>
                <a
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all
                    ${isActive 
                      ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600' 
                      : 'text-gray-700 hover:bg-gray-50 border-l-4 border-transparent'
                    }
                  `}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </a>
              </Link>
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
            <p className="text-xs text-gray-500 truncate">admin@example.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
