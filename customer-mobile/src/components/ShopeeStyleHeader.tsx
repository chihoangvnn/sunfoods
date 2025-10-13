'use client'

import React, { useState } from 'react';
import { Search, ShoppingCart } from 'lucide-react';
import { SunFoodsLogo } from './SunFoodsLogo';
import { useTheme } from '@/contexts/ThemeContext';

interface ShopeeStyleHeaderProps {
  cartCount: number;
  onSearch: (query: string) => void;
  onCartClick: () => void;
}

export function ShopeeStyleHeader({ cartCount, onSearch, onCartClick }: ShopeeStyleHeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <div 
      className="h-20 bg-sunrise-leaf shadow-sm border-b border-sunrise-leaf"
    >
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between gap-8">
        <div className="flex items-center cursor-pointer hover:opacity-80 transition-opacity">
          <SunFoodsLogo size="lg" showText={true} variant="default" />
        </div>

        <form onSubmit={handleSearch} className="flex-1 max-w-[700px]">
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder="Tìm thực phẩm organic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-5 pr-14 rounded-lg border border-warm-sun/30 bg-white focus:outline-none focus:ring-2 focus:ring-warm-sun focus:bg-white text-gray-700 placeholder-gray-400"
            />
            <button
              type="submit"
              className="absolute right-1 h-9 px-5 bg-warm-sun hover:bg-warm-sun/90 text-sunrise-leaf rounded-md flex items-center justify-center shadow-sm transition-all"
            >
              <Search className="h-5 w-5" />
            </button>
          </div>
        </form>

        <button
          onClick={onCartClick}
          className="relative text-warm-sun hover:text-warm-sun/80 transition-colors"
        >
          <ShoppingCart className="h-7 w-7" />
          {cartCount > 0 && (
            <span 
              className="absolute -top-2 -right-2 bg-warm-sun text-sunrise-leaf text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold shadow-md"
            >
              {cartCount > 99 ? '99+' : cartCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
