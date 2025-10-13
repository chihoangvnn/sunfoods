'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { LucideIcon } from 'lucide-react';

export interface NavTab {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
}

export type PortalTheme = 'green' | 'blue' | 'purple' | 'orange';

export interface PortalLayoutProps {
  children: React.ReactNode;
  tabs: NavTab[];
  portalName: string;
  theme?: PortalTheme; // Default: green
  mobileHeaderContent?: React.ReactNode;
  desktopSidebarHeader?: React.ReactNode;
  desktopSidebarFooter?: React.ReactNode;
  getIsActive?: (pathname: string | null, tab: NavTab) => boolean;
}

const themeColors = {
  green: {
    bg: 'bg-green-700',
    bgHover: 'hover:bg-green-600',
    bgActive: 'bg-green-800',
    bgActiveHover: 'active:bg-green-700',
    border: 'border-green-600',
    borderDark: 'border-green-800',
  },
  blue: {
    bg: 'bg-blue-700',
    bgHover: 'hover:bg-blue-600',
    bgActive: 'bg-blue-800',
    bgActiveHover: 'active:bg-blue-700',
    border: 'border-blue-600',
    borderDark: 'border-blue-800',
  },
  purple: {
    bg: 'bg-purple-700',
    bgHover: 'hover:bg-purple-600',
    bgActive: 'bg-purple-800',
    bgActiveHover: 'active:bg-purple-700',
    border: 'border-purple-600',
    borderDark: 'border-purple-800',
  },
  orange: {
    bg: 'bg-orange-700',
    bgHover: 'hover:bg-orange-600',
    bgActive: 'bg-orange-800',
    bgActiveHover: 'active:bg-orange-700',
    border: 'border-orange-600',
    borderDark: 'border-orange-800',
  },
};

export default function PortalLayout({
  children,
  tabs,
  portalName,
  theme = 'green',
  mobileHeaderContent,
  desktopSidebarHeader,
  desktopSidebarFooter,
  getIsActive,
}: PortalLayoutProps) {
  const pathname = usePathname();
  const colors = themeColors[theme];

  const defaultIsActive = (pathname: string | null, tab: NavTab): boolean => {
    if (!pathname) return false;
    
    if (tab.href === '/') {
      return pathname === '/';
    }
    
    return pathname?.startsWith(tab.href);
  };

  const isActiveFunc = getIsActive || defaultIsActive;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile header */}
      <div className={`md:hidden sticky top-0 z-50 ${colors.bg} shadow-sm`}>
        {mobileHeaderContent}
      </div>

      <div className="flex min-h-screen">
        {/* Desktop Sidebar */}
        <aside className={`hidden md:block w-64 ${colors.bg} ${colors.border} border-r flex-shrink-0`}>
          <div className="flex flex-col h-screen sticky top-0">
            {/* Desktop Header */}
            {desktopSidebarHeader && (
              <div className={`${colors.borderDark} border-b`}>
                {desktopSidebarHeader}
              </div>
            )}

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {tabs.map((tab) => {
                const isActive = isActiveFunc(pathname, tab);
                const Icon = tab.icon;
                
                return (
                  <Link
                    key={tab.id}
                    href={tab.href}
                    prefetch={true}
                    scroll={false}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-150
                      active:scale-95
                      ${isActive 
                        ? `${colors.bgActive} text-white shadow-md` 
                        : `text-white ${colors.bgHover} ${colors.bgActiveHover}`
                      }
                    `}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{tab.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Desktop Footer */}
            {desktopSidebarFooter && (
              <div className={`${colors.borderDark} border-t`}>
                {desktopSidebarFooter}
              </div>
            )}
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 md:p-8 p-4 pb-20 md:pb-8 overflow-auto">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation - CSS media query, no useState */}
      <nav className={`md:hidden fixed bottom-0 left-0 right-0 ${colors.bg} ${colors.border} border-t z-[70] shadow-lg`}>
        <div className="flex items-center justify-around py-2 pb-safe-area">
          {tabs.map((tab) => {
            const isActive = isActiveFunc(pathname, tab);
            const Icon = tab.icon;
            
            return (
              <Link
                key={tab.id}
                href={tab.href}
                prefetch={true}
                scroll={false}
                className={`
                  flex flex-col items-center justify-center py-2 px-3 min-w-0 flex-1 relative
                  transition-all duration-150 ease-in-out
                  active:scale-95
                  ${isActive ? 'text-white' : 'text-gray-200 hover:text-white'}
                `}
              >
                <Icon 
                  className={`h-6 w-6 transition-all duration-150 ${
                    isActive ? 'scale-110' : 'scale-100'
                  }`} 
                />
                
                <span 
                  className={`
                    text-xs mt-1 transition-all duration-150 truncate max-w-full
                    ${isActive ? 'font-semibold text-white' : 'font-normal text-gray-200'}
                  `}
                >
                  {tab.label}
                </span>
                
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-white rounded-full" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
