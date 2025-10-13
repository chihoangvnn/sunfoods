"use client";

import React from "react";
import { Home, Grid3X3, User, Calendar, ShoppingCart, Car } from "lucide-react";
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
      id: "calendar",
      label: "Lịch Âm",
      icon: Calendar,
      badge: null,
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
    <div className="fixed bottom-0 left-0 right-0 bg-tramhuong-primary/95 backdrop-blur-md border-t border-tramhuong-accent/20 z-[70] shadow-[0_8px_32px_rgba(193,168,117,0.3)]">
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
                transition-all duration-300 ease-in-out
                ${isActive ? "text-tramhuong-accent" : "text-tramhuong-bg/70 hover:text-tramhuong-accent"}
              `}
            >
              <div className="relative">
                <IconComponent
                  className={`h-6 w-6 transition-all duration-300 ${
                    isActive ? "scale-110" : "scale-100"
                  }`}
                />
                {tab.badge && (
                  <Badge
                    className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-tramhuong-accent text-tramhuong-primary text-xs flex items-center justify-center p-0 min-w-0 shadow-[0_4px_16px_rgba(193,168,117,0.4)]"
                    style={{ fontSize: "10px" }}
                  >
                    {tab.badge > 99 ? "99+" : tab.badge}
                  </Badge>
                )}
              </div>

              <span
                className={`
                  text-xs mt-1 transition-all duration-300 truncate max-w-full
                  ${isActive ? "font-semibold text-tramhuong-accent" : "font-normal text-tramhuong-bg/70"}
                `}
              >
                {tab.label}
              </span>

              {/* Active indicator */}
              {isActive && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-tramhuong-accent rounded-full shadow-[0_2px_8px_rgba(193,168,117,0.5)]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
