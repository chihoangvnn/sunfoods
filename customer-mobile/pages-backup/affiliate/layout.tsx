'use client'

import PortalLayout, { type NavTab } from '@/components/PortalLayout';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  DollarSign, 
  User,
  PlusCircle,
  TrendingUp
} from 'lucide-react';
import { useState, useEffect } from 'react';

const affiliateTabs: NavTab[] = [
  { id: 'dashboard', label: 'Tổng quan', href: '/affiliate', icon: LayoutDashboard },
  { id: 'products', label: 'Sản phẩm', href: '/affiliate/products', icon: Package },
  { id: 'quick-order', label: 'Tạo đơn', href: '/affiliate/quick-order', icon: PlusCircle },
  { id: 'orders', label: 'Đơn hàng', href: '/affiliate/orders', icon: ShoppingCart },
  { id: 'earnings', label: 'Thu nhập', href: '/affiliate/earnings', icon: DollarSign },
];

const getAffiliateIsActive = (pathname: string | null, tab: NavTab): boolean => {
  if (!pathname) return false;
  
  if (tab.href === '/affiliate') {
    return pathname === '/affiliate';
  }
  
  return pathname?.startsWith(tab.href);
};

export default function AffiliateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [affiliateData, setAffiliateData] = useState({
    name: 'CTV Demo',
    code: 'AFF001',
    tier: 'Bronze',
    commissionRate: 5
  });

  return (
    <PortalLayout
      tabs={affiliateTabs}
      portalName="Affiliate"
      theme="green"
      getIsActive={getAffiliateIsActive}
      mobileHeaderContent={
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-lg font-bold text-white">Cổng CTV</h1>
          <div className="px-3 py-1 text-xs font-semibold rounded-full bg-green-900/40 text-white border border-green-800/60">
            {affiliateData.tier} {affiliateData.commissionRate}%
          </div>
        </div>
      }
      desktopSidebarHeader={
        <div className="flex flex-col gap-3 p-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-8 w-8 text-white" />
            <h1 className="text-xl font-bold text-white">Cổng CTV</h1>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-green-100">Cấp độ:</span>
            <div className="px-3 py-1 text-sm font-semibold rounded-full bg-green-900/40 text-white border border-green-800/60">
              {affiliateData.tier} {affiliateData.commissionRate}%
            </div>
          </div>
        </div>
      }
      desktopSidebarFooter={
        <div className="p-4">
          <div className="text-xs text-white text-center">
            <p>Mã CTV: <span className="font-semibold">{affiliateData.code}</span></p>
          </div>
        </div>
      }
    >
      {children}
    </PortalLayout>
  );
}
