'use client';

import PortalLayout, { type NavTab } from '@/components/PortalLayout';
import { Home, Crown, Package, Receipt, Ticket } from 'lucide-react';

const vipTabs: NavTab[] = [
  {
    id: 'home',
    label: 'Trang chủ',
    href: '/',
    icon: Home,
  },
  {
    id: 'vip',
    label: 'VIP',
    href: '/vip',
    icon: Crown,
  },
  {
    id: 'products',
    label: 'Sản phẩm',
    href: '/vip/products',
    icon: Package,
  },
  {
    id: 'orders',
    label: 'Đơn hàng',
    href: '/vip/orders',
    icon: Receipt,
  },
  {
    id: 'coupons',
    label: 'Mã giảm giá',
    href: '/vip/coupons',
    icon: Ticket,
  },
];

const getVipIsActive = (pathname: string | null, tab: NavTab): boolean => {
  if (!pathname) return false;
  
  if (tab.href === '/') {
    return pathname === '/';
  }
  
  if (tab.href === '/vip') {
    return pathname === '/vip';
  }
  
  return pathname?.startsWith(tab.href);
};

export default function VipLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PortalLayout
      tabs={vipTabs}
      portalName="VIP"
      theme="green"
      getIsActive={getVipIsActive}
      mobileHeaderContent={
        <div className="p-4">
          <h1 className="text-xl font-bold text-white">VIP Club</h1>
        </div>
      }
      desktopSidebarHeader={
        <div className="p-6">
          <h1 className="text-2xl font-bold text-white">VIP Club</h1>
        </div>
      }
    >
      {children}
    </PortalLayout>
  );
}
