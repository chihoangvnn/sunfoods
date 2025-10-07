'use client'

import PortalLayout, { type NavTab } from '@/components/PortalLayout';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Wallet, 
  RotateCcw, 
  Settings,
  Store,
  TrendingUp
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Toaster } from 'sonner';

const vendorTabs: NavTab[] = [
  { id: 'dashboard', label: 'Dashboard', href: '/vendor/dashboard', icon: LayoutDashboard },
  { id: 'products', label: 'Sản phẩm ký gửi', href: '/vendor/products', icon: Package },
  { id: 'deals', label: 'Deals', href: '/vendor/deals', icon: TrendingUp },
  { id: 'orders', label: 'Đơn hàng', href: '/vendor/orders', icon: ShoppingCart },
  { id: 'financial', label: 'Tài chính', href: '/vendor/financial', icon: Wallet },
  { id: 'returns', label: 'Hoàn hàng', href: '/vendor/returns', icon: RotateCcw },
  { id: 'settings', label: 'Cài đặt', href: '/vendor/settings', icon: Settings },
];

const getVendorIsActive = (pathname: string | null, tab: NavTab): boolean => {
  if (!pathname) return false;
  
  if (tab.href === '/vendor/dashboard') {
    return pathname === '/vendor' || pathname === '/vendor/dashboard';
  }
  
  return pathname?.startsWith(tab.href);
};

export default function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // TODO: Replace with actual session-based auth check for vendor role
  const [vendorData, setVendorData] = useState({
    name: 'Nhà cung cấp Thiên Nhiên',
    depositBalance: 5000000
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  return (
    <>
      <PortalLayout
        tabs={vendorTabs}
        portalName="Vendor"
        theme="orange"
        getIsActive={getVendorIsActive}
        mobileHeaderContent={
          <div className="flex items-center justify-between px-4 py-3">
            <h1 className="text-lg font-bold text-white">Cổng Nhà Cung Cấp</h1>
            <div className="flex flex-col items-end">
              <span className="text-xs text-orange-100">Số dư ký quỹ</span>
              <span className="text-sm font-semibold text-white">
                {formatCurrency(vendorData.depositBalance)}
              </span>
            </div>
          </div>
        }
        desktopSidebarHeader={
          <div className="flex flex-col gap-3 p-6">
            <div className="flex items-center gap-2">
              <Store className="h-8 w-8 text-white" />
              <h1 className="text-xl font-bold text-white">Cổng NCC</h1>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-sm text-orange-100">{vendorData.name}</span>
              <div className="flex items-center justify-between">
                <span className="text-sm text-orange-100">Số dư ký quỹ:</span>
                <span className="text-sm font-semibold text-white">
                  {formatCurrency(vendorData.depositBalance)}
                </span>
              </div>
            </div>
          </div>
        }
        desktopSidebarFooter={
          <div className="p-4">
            <div className="text-xs text-white text-center">
              <p>Nhà cung cấp: <span className="font-semibold">{vendorData.name}</span></p>
            </div>
          </div>
        }
      >
        {children}
      </PortalLayout>
      <Toaster 
        position="top-right"
        richColors
        closeButton
        duration={5000}
      />
    </>
  );
}
