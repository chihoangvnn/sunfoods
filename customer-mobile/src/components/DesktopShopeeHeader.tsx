'use client'

import React from 'react';
import { TopBar } from './TopBar';
import { ShopeeStyleHeader } from './ShopeeStyleHeader';

interface DesktopShopeeHeaderProps {
  cartCount: number;
  onSearch: (query: string) => void;
  onCartClick: () => void;
  onLogin?: () => void;
  onRegister?: () => void;
}

export function DesktopShopeeHeader({
  cartCount,
  onSearch,
  onCartClick,
  onLogin,
  onRegister
}: DesktopShopeeHeaderProps) {
  return (
    <header 
      className="hidden lg:block sticky top-0 z-50"
    >
      <TopBar onLogin={onLogin} onRegister={onRegister} />
      <ShopeeStyleHeader 
        cartCount={cartCount}
        onSearch={onSearch}
        onCartClick={onCartClick}
      />
    </header>
  );
}
