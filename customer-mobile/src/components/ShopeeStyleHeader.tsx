'use client'

import React, { useState } from 'react';
import { Search, ShoppingCart } from 'lucide-react';

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
    <div className="bg-forest-green h-20">
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between gap-8">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-white cursor-pointer hover:opacity-90 transition-opacity">
            SunFoods.vn
          </h1>
        </div>

        <form onSubmit={handleSearch} className="flex-1 max-w-[700px]">
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-4 pr-12 rounded-full border-none focus:outline-none focus:ring-2 focus:ring-white/30 text-gray-700 placeholder-gray-400"
            />
            <button
              type="submit"
              className="absolute right-0 h-10 px-6 bg-green-700 hover:bg-green-800 text-white rounded-r-full transition-colors flex items-center justify-center"
            >
              <Search className="h-5 w-5" />
            </button>
          </div>
        </form>

        <button
          onClick={onCartClick}
          className="relative text-white hover:text-green-100 transition-colors"
        >
          <ShoppingCart className="h-7 w-7" />
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
              {cartCount > 99 ? '99+' : cartCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
