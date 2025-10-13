"use client";

import React from "react";
import { Home, Grid3X3, User, Heart, ShoppingCart, Car } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface StorefrontBottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  wishlistCount?: number;
  cartCount?: number;
}

export function StorefrontBottomNav({
  activeTab,
  onTabChange,
  wishlistCount = 0,
  cartCount = 0,
}: StorefrontBottomNavProps) {
  const tabs = [
    {
      id: "home",
      label: "Trang chủ",
      icon: Home,
      badge: null,
    },
    {
      id: "categories",
      label: "Danh mục",
      icon: Grid3X3,
      badge: null,
    },
    {
      id: "wishlist",
      label: "Yêu thích",
      icon: Heart,
      badge: wishlistCount > 0 ? wishlistCount : null,
    },
    {
      id: "cart",
      label: "Giỏ hàng",
      icon: ShoppingCart,
      badge: cartCount > 0 ? cartCount : null,
    },
    {
      id: "profile",
      label: "Cá nhân",
      icon: User,
      badge: null,
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-[70] shadow-lg backdrop-blur-sm">
      <div className="flex items-center justify-around py-2 pb-safe-area">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                flex flex-col items-center justify-center py-2 px-3 min-w-0 flex-1 relative
                transition-all duration-200 ease-in-out
                ${isActive ? "text-sunrise-leaf" : "text-gray-500 hover:text-sunrise-leaf"}
              `}
            >
              <div className="relative">
                <IconComponent
                  className={`h-6 w-6 transition-all duration-200 ${
                    isActive ? "scale-110" : "scale-100"
                  }`}
                />
                {tab.badge && (
                  <Badge
                    className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-warm-sun text-white text-xs flex items-center justify-center p-0 min-w-0 shadow-md"
                    style={{ fontSize: "10px" }}
                  >
                    {tab.badge > 99 ? "99+" : tab.badge}
                  </Badge>
                )}
              </div>

              <span
                className={`
                  text-xs mt-1 transition-all duration-200 truncate max-w-full
                  ${isActive ? "font-semibold text-sunrise-leaf" : "font-normal text-gray-500"}
                `}
              >
                {tab.label}
              </span>

              {/* Active indicator */}
              {isActive && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-warm-sun rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
