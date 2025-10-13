'use client'

import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';

interface HiddenSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  placeholder?: string;
}

export function HiddenSearchBar({ 
  searchQuery, 
  onSearchChange, 
  placeholder = "Tìm kiếm sản phẩm..." 
}: HiddenSearchBarProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show search bar when scrolling down past 200px
      if (currentScrollY > 200 && currentScrollY > lastScrollY) {
        setIsVisible(true);
      } 
      // Hide when scrolling up or at top
      else if (currentScrollY < lastScrollY || currentScrollY <= 100) {
        setIsVisible(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);

  return (
    <div 
      className={`
        fixed top-16 left-0 right-0 z-[40] bg-white/60 backdrop-blur-md shadow-[0_8px_32px_rgba(193,168,117,0.3)] border-b border-tramhuong-accent/20
        transition-transform duration-300 ease-in-out
        ${isVisible ? 'translate-y-0' : '-translate-y-full'}
        hidden lg:block
      `}
    >
      <div className="w-full px-6 lg:px-8 xl:px-12 2xl:px-16 py-3">
        <div className="flex items-center gap-4">
          {/* Search Icon */}
          <Search className="h-5 w-5 text-tramhuong-accent flex-shrink-0 transition-all duration-300" />
          
          {/* Search Input */}
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder={placeholder}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full px-4 py-2 border border-tramhuong-accent/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-tramhuong-accent focus:border-tramhuong-accent text-sm bg-white/60 backdrop-blur-md placeholder:text-tramhuong-accent/50 transition-all duration-300"
              autoFocus={isVisible}
            />
          </div>
          
          {/* Clear Button */}
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="p-2 text-tramhuong-accent hover:text-tramhuong-primary transition-all duration-300"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          
          {/* Close Button */}
          <button
            onClick={() => setIsVisible(false)}
            className="p-2 text-tramhuong-accent hover:text-tramhuong-primary transition-all duration-300 flex-shrink-0"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}