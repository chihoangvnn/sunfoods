'use client'

import React, { useState, useEffect } from 'react';
import { Sparkles, Droplet, Home, Church, User, ImageIcon, Watch, Link2 } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
}

interface CategoryIconsGridProps {
  onCategoryClick: (categoryId: string) => void;
}

const categories: Category[] = [
  { id: 'nhang-tram', name: 'Nhang Trầm', icon: <Sparkles className="h-6 w-6" /> },
  { id: 'tinh-dau', name: 'Tinh Dầu', icon: <Droplet className="h-6 w-6" /> },
  { id: 'do-tho', name: 'Đồ Thờ', icon: <Home className="h-6 w-6" /> },
  { id: 'phat-pham', name: 'Phật Phẩm', icon: <Church className="h-6 w-6" /> },
  { id: 'tuong', name: 'Tượng', icon: <User className="h-6 w-6" /> },
  { id: 'tranh', name: 'Tranh', icon: <ImageIcon className="h-6 w-6" /> },
  { id: 'vong-tay', name: 'Vòng Tay', icon: <Watch className="h-6 w-6" /> },
  { id: 'chuoi', name: 'Chuỗi', icon: <Link2 className="h-6 w-6" /> },
];

export function CategoryIconsGrid({ onCategoryClick }: CategoryIconsGridProps) {
  const [isHidden, setIsHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Only hide if scrolled down more than 50px
      if (currentScrollY > 50) {
        // Scrolling down - hide
        if (currentScrollY > lastScrollY) {
          setIsHidden(true);
        } 
        // Scrolling up - show
        else if (currentScrollY < lastScrollY) {
          setIsHidden(false);
        }
      } else {
        // At top of page - always show
        setIsHidden(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    // Throttle scroll events for performance
    let ticking = false;
    const scrollListener = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', scrollListener, { passive: true });
    return () => window.removeEventListener('scroll', scrollListener);
  }, [lastScrollY]);

  return (
    <div 
      className={`bg-white transition-all duration-300 ease-in-out lg:sticky lg:top-[60px] lg:mb-0 ${
        isHidden ? 'lg:-translate-y-full lg:opacity-0 lg:pointer-events-none' : 'lg:translate-y-0 lg:opacity-100 border-b border-gray-200'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-3 lg:pb-0">
        <div className="grid grid-cols-8 gap-3">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategoryClick(category.id)}
              className="flex flex-col items-center gap-1.5 p-2 rounded-lg hover:bg-green-50 transition-all duration-200 group"
            >
              <div className="text-green-600 group-hover:text-green-700 transition-colors">
                {category.icon}
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-green-700 transition-colors text-center">
                {category.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
