'use client'

import React from 'react';
import { TopBar } from './TopBar';
import { ShopeeStyleHeader } from './ShopeeStyleHeader';
import { CategoryIconsGrid } from './CategoryIconsGrid';

interface DesktopShopeeHeaderProps {
  cartCount: number;
  onSearch: (query: string) => void;
  onCategoryClick: (categoryId: string) => void;
  onCartClick: () => void;
  onLogin?: () => void;
  onRegister?: () => void;
}

export function DesktopShopeeHeader({
  cartCount,
  onSearch,
  onCategoryClick,
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
      <CategoryIconsGrid onCategoryClick={onCategoryClick} />
    </header>
  );
}
