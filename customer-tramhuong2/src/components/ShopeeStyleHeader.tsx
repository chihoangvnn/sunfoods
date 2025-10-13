'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';

interface ShopeeStyleHeaderProps {
  cartCount: number;
  onSearch: (query: string) => void;
  onCartClick: () => void;
  onAccountClick: () => void;
}

export function ShopeeStyleHeader({ cartCount, onSearch, onCartClick, onAccountClick }: ShopeeStyleHeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <div className="bg-[#FAF8F5] border-b border-tramhuong-accent/20 shadow-luxury">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center gap-6">
          {/* Logo/Brand Section */}
          <Link 
            href="/"
            className="flex items-center gap-3 min-w-fit cursor-pointer group transition-all duration-300 hover:scale-105"
          >
            {/* Logo Icon */}
            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-tramhuong-accent/10 flex items-center justify-center border-2 border-tramhuong-accent group-hover:bg-tramhuong-accent/20 group-hover:shadow-luxury transition-all duration-300">
              <div className="w-6 h-6 lg:w-7 lg:h-7 text-tramhuong-accent group-hover:text-tramhuong-primary group-hover:scale-110 transition-all duration-300">
                <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2V18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M12 6C14 6 16 4 16 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
                  <path d="M12 6C10 6 8 4 8 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
                  <circle cx="12" cy="18" r="4" stroke="currentColor" strokeWidth="2" fill="none"/>
                  <line x1="8" y1="22" x2="16" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
            </div>
            
            {/* Brand Text */}
            <div className="flex flex-col">
              <h1 className="text-base lg:text-xl font-playfair font-bold text-tramhuong-primary tracking-wide">
                TRẦM HƯƠNG HOÀNG NGÂN
              </h1>
              <p className="text-[10px] lg:text-xs font-nunito text-tramhuong-accent tracking-wider">
                TINH HOA TRẦM HƯƠNG
              </p>
            </div>
          </Link>

          {/* Search Bar - Luxury Rounded Design */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm trầm hương..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-5 pr-14 py-3 border-2 border-tramhuong-accent/30 rounded-full focus:outline-none focus:ring-2 focus:ring-tramhuong-accent/50 focus:border-tramhuong-accent text-sm bg-white/80 backdrop-blur-sm shadow-luxury transition-all duration-300 placeholder:text-tramhuong-primary/40 placeholder:font-nunito"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-gradient-to-br from-tramhuong-accent to-tramhuong-primary text-white rounded-full flex items-center justify-center hover:scale-110 hover:shadow-luxury transition-all duration-300 group"
              >
                <Search className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
              </button>
            </div>
          </form>

          {/* Cart Button - Luxury Style */}
          <div 
            className="relative flex items-center gap-2 cursor-pointer group"
            onClick={onCartClick}
          >
            {/* Icon container with luxury hover effects */}
            <div className="p-2.5 rounded-full bg-tramhuong-accent/10 border-2 border-tramhuong-accent/30 group-hover:bg-tramhuong-accent/20 group-hover:border-tramhuong-accent group-hover:shadow-luxury transition-all duration-300">
              <svg className="w-5 h-5 text-tramhuong-accent group-hover:text-tramhuong-primary group-hover:scale-110 transition-all duration-300" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 2L3 6V20C3 21.1 3.9 22 5 22H19C20.1 22 21 21.1 21 20V6L18 2H6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                <path d="M9 6C9 4.34 10.34 3 12 3C13.66 3 15 4.34 15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
                <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            
            {/* Optional label (desktop only) */}
            <span className="hidden lg:block text-sm font-nunito text-tramhuong-primary group-hover:text-tramhuong-accent transition-colors duration-300">
              Giỏ hàng
            </span>
            
            {/* Cart badge with luxury styling */}
            {cartCount > 0 && (
              <div className="absolute -top-1 -right-1 lg:right-auto lg:-top-1 lg:-left-1 w-5 h-5 bg-gradient-to-br from-tramhuong-accent to-tramhuong-primary text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white shadow-luxury">
                {cartCount > 9 ? '9+' : cartCount}
              </div>
            )}
          </div>

          {/* Account Button - Luxury Style */}
          <div 
            className="relative flex items-center gap-2 cursor-pointer group"
            onClick={onAccountClick}
          >
            {/* Icon container with luxury hover effects */}
            <div className="p-2.5 rounded-full bg-tramhuong-accent/10 border-2 border-tramhuong-accent/30 group-hover:bg-tramhuong-accent/20 group-hover:border-tramhuong-accent group-hover:shadow-luxury transition-all duration-300">
              <svg className="w-5 h-5 text-tramhuong-accent group-hover:text-tramhuong-primary group-hover:scale-110 transition-all duration-300" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Head */}
                <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" fill="none"/>
                {/* Body/Shoulders */}
                <path d="M6 20C6 16.6863 8.68629 14 12 14C15.3137 14 18 16.6863 18 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            
            {/* Optional label (desktop only) */}
            <span className="hidden lg:block text-sm font-nunito text-tramhuong-primary group-hover:text-tramhuong-accent transition-colors duration-300">
              Tài khoản
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
