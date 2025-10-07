'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import PortalLayout, { type NavTab } from '@/components/PortalLayout';
import { PhoneVerificationBanner } from '@/components/PhoneVerificationBanner';
import { Car, Package, ClipboardList, Truck, DollarSign, PackageOpen, PlusCircle, Settings, Users, MessageSquare } from 'lucide-react';

const customerTabs: NavTab[] = [
  {
    id: 'ride',
    label: 'Đặt xe',
    href: '/datxe',
    icon: Car,
  },
  {
    id: 'book-ride',
    label: 'Đặt xe riêng',
    href: '/datxe/book-ride',
    icon: Users,
  },
  {
    id: 'package',
    label: 'Gửi hàng',
    href: '/datxe/send-package',
    icon: Package,
  },
  {
    id: 'bookings',
    label: 'Đơn của tôi',
    href: '/datxe/bookings',
    icon: ClipboardList,
  },
];

const driverTabs: NavTab[] = [
  {
    id: 'driver-deliveries',
    label: 'Nhận đơn',
    href: '/datxe/driver/deliveries',
    icon: Truck,
  },
  {
    id: 'driver-find-rides',
    label: 'Tìm khách',
    href: '/datxe/driver/find-rides',
    icon: Users,
  },
  {
    id: 'driver-my-quotes',
    label: 'Báo giá',
    href: '/datxe/driver/my-quotes',
    icon: MessageSquare,
  },
  {
    id: 'driver-packages',
    label: 'Tìm Ship',
    href: '/datxe/driver/packages',
    icon: PackageOpen,
  },
  {
    id: 'driver-earnings',
    label: 'Thu nhập',
    href: '/datxe/driver/earnings',
    icon: DollarSign,
  },
  {
    id: 'driver-create',
    label: 'Tạo xe',
    href: '/datxe/create',
    icon: PlusCircle,
  },
  {
    id: 'driver-manage',
    label: 'Quản lý xe',
    href: '/datxe/manage',
    icon: Settings,
  },
];

const getCustomerIsActive = (pathname: string | null, tab: NavTab): boolean => {
  if (!pathname) return false;
  
  if (tab.href === '/datxe/book-ride') {
    return pathname?.startsWith('/datxe/book-ride') || pathname?.startsWith('/datxe/ride-request');
  }
  
  if (tab.href === '/datxe/send-package') {
    return pathname?.startsWith('/datxe/send-package') || pathname?.startsWith('/datxe/packages');
  }
  
  if (tab.href === '/datxe/bookings') {
    return pathname?.startsWith('/datxe/bookings') || pathname?.startsWith('/datxe/trip');
  }
  
  if (tab.href === '/datxe') {
    return pathname === '/datxe';
  }
  
  return pathname?.startsWith(tab.href);
};

const getDriverIsActive = (pathname: string | null, tab: NavTab): boolean => {
  if (!pathname) return false;
  
  if (tab.href === '/datxe/driver/find-rides') {
    return pathname?.startsWith('/datxe/driver/find-rides');
  }
  
  if (tab.href === '/datxe/driver/my-quotes') {
    return pathname?.startsWith('/datxe/driver/my-quotes') || pathname?.startsWith('/datxe/driver/quotes');
  }
  
  if (tab.href === '/datxe/create') {
    return pathname?.startsWith('/datxe/create');
  }
  
  if (tab.href === '/datxe/manage') {
    return pathname?.startsWith('/datxe/manage') || pathname?.startsWith('/datxe/vehicles');
  }
  
  return pathname?.startsWith(tab.href);
};

export default function DatXeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mode, setMode] = useState<'customer' | 'driver'>('customer');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedMode = localStorage.getItem('datxe-mode') as 'customer' | 'driver' | null;
    
    if (savedMode === 'driver' || savedMode === 'customer') {
      setMode(savedMode);
    } else {
      const isDriverPath = pathname?.startsWith('/datxe/driver') || 
                          pathname?.startsWith('/datxe/create') || 
                          pathname?.startsWith('/datxe/manage') ||
                          pathname?.startsWith('/datxe/vehicles');
      setMode(isDriverPath ? 'driver' : 'customer');
    }
    
    setMounted(true);
  }, [pathname]);

  const handleToggleMode = () => {
    const newMode = mode === 'customer' ? 'driver' : 'customer';
    setMode(newMode);
    localStorage.setItem('datxe-mode', newMode);
  };

  if (!mounted) {
    return null;
  }

  const currentTabs = mode === 'customer' ? customerTabs : driverTabs;
  const currentIsActive = mode === 'customer' ? getCustomerIsActive : getDriverIsActive;

  return (
    <>
      <PhoneVerificationBanner />
      <PortalLayout
        tabs={currentTabs}
        portalName="Đặt xe"
        theme="green"
        getIsActive={currentIsActive}
        mobileHeaderContent={
        <div className="p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-white">Đặt xe & Gửi hàng</h1>
            <button
              onClick={handleToggleMode}
              className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              {mode === 'customer' ? (
                <>
                  <Truck className="h-4 w-4" />
                  <span>Tài xế</span>
                </>
              ) : (
                <>
                  <Car className="h-4 w-4" />
                  <span>Khách</span>
                </>
              )}
            </button>
          </div>
        </div>
      }
      desktopSidebarHeader={
        <div className="p-6">
          <h1 className="text-2xl font-bold text-white mb-4">Đặt xe & Gửi hàng</h1>
          <button
            onClick={handleToggleMode}
            className="w-full px-4 py-2.5 bg-white/20 hover:bg-white/30 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {mode === 'customer' ? (
              <>
                <Truck className="h-5 w-5" />
                <span>Chế độ Tài xế</span>
              </>
            ) : (
              <>
                <Car className="h-5 w-5" />
                <span>Chế độ Khách</span>
              </>
            )}
          </button>
        </div>
      }
    >
        {children}
      </PortalLayout>
    </>
  );
}
