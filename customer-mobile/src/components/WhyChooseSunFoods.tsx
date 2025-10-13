'use client'

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';

interface WhyChooseSunFoodsProps {
  onCategorySelect?: (categoryId: string) => void;
}

export function WhyChooseSunFoods({ onCategorySelect }: WhyChooseSunFoodsProps = {}) {
  const router = useRouter();
  const { currentTheme, setTheme, activeCategory } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const heroSectionRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);
  const hideScrollY = useRef(0); // Position where menu was hidden
  const scrollThreshold = 10;
  const showThreshold = 80; // Must scroll up 80px to show menu (responsive)
  
  const categories = [
    {
      id: "rau-cu",
      icon: "🥒",
      title: "Rau Củ Quả",
      slug: "rau-cu-qua",
      description: "Tươi ngon tự nhiên"
    },
    {
      id: "trai-cay-nhap",
      icon: "🍎",
      title: "Trái Cây Nhập Khẩu",
      slug: "trai-cay-nhap-khau",
      description: "Tươi ngon tự nhiên"
    },
    {
      id: "my-pham",
      icon: "💄",
      title: "Mỹ Phẩm",
      slug: "my-pham",
      description: "Tươi ngon tự nhiên"
    },
    {
      id: "thuc-pham-kho",
      icon: "🌾",
      title: "Thực Phẩm Khô",
      slug: "thuc-pham-kho",
      description: "Tươi ngon tự nhiên"
    },
    {
      id: "an-dam-cho-be",
      icon: "👶",
      title: "Ăn Dặm Cho Bé",
      slug: "an-dam-cho-be",
      description: "Tươi ngon tự nhiên"
    },
    {
      id: "gia-dung",
      icon: "🏠",
      title: "Gia Dụng",
      slug: "gia-dung",
      description: "Tươi ngon tự nhiên"
    },
    {
      id: "thuc-pham-tuoi",
      icon: "🥩",
      title: "Thực Phẩm Tươi",
      slug: "thuc-pham-tuoi",
      description: "Tươi ngon tự nhiên"
    }
  ];

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      
      // Find the complete hero section by data attribute
      const heroElement = document.querySelector('[data-hero-section="organic-hero"]');
      
      if (!heroElement) {
        // Fallback: hide sticky bar if hero not found
        setIsScrolled(false);
        return;
      }
      
      // Get actual position and height of entire hero section (slider + countdown + badges)
      const heroTop = (heroElement as HTMLElement).offsetTop;
      const heroHeight = (heroElement as HTMLElement).offsetHeight;
      const heroBottom = heroTop + heroHeight;
      
      // Add large offset to show sticky bar ONLY after scrolling past grid categories
      // This prevents menu from covering the top product images
      const gridCategoriesHeight = 400; // Approximate height of grid categories section
      const shouldShowSticky = scrollPosition > (heroBottom + gridCategoriesHeight);
      setIsScrolled(shouldShowSticky);
      
      // Auto-hide/show based on scroll direction (only when sticky bar is active)
      if (shouldShowSticky) {
        if (Math.abs(scrollPosition - lastScrollY.current) > scrollThreshold) {
          if (scrollPosition > lastScrollY.current && scrollPosition > (heroBottom + 100)) {
            // Scrolling down - hide sticky bar and record position
            if (isVisible) {
              hideScrollY.current = scrollPosition;
            }
            setIsVisible(false);
          } else if (scrollPosition < lastScrollY.current) {
            // Scrolling up - only show if scrolled up enough from hide position (reach green line)
            const scrolledUpDistance = hideScrollY.current - scrollPosition;
            if (scrolledUpDistance >= showThreshold) {
              setIsVisible(true);
            }
          }
          lastScrollY.current = scrollPosition;
        }
      } else {
        // Always show when not past hero
        setIsVisible(true);
        hideScrollY.current = 0;
      }
    };

    // Initial check after DOM is ready
    handleScroll();

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll); // Recalculate on resize
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  const handleCategoryClick = (categoryId: string, slug?: string) => {
    setTheme(categoryId);
    
    // Navigate to category page if slug is provided
    if (slug) {
      router.push(`/${slug}`);
      return;
    }
    
    // Fallback: Call parent's onCategorySelect to filter products
    if (onCategorySelect) {
      onCategorySelect(categoryId);
    }
    
    // Scroll to products if on homepage
    const productGrid = document.querySelector('[data-section="product-grid"]');
    if (productGrid) {
      productGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (isScrolled) {
    return (
      <div className={`
        fixed top-14 lg:top-28 left-0 right-0 w-full bg-white/95 backdrop-blur-md border-b border-gray-200 z-30 
        transition-all duration-300 ease-in-out
        ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}
      `}>
        <div className="max-w-7xl mx-auto px-2 py-2">
          <div className="flex items-center justify-around lg:justify-center lg:gap-4 overflow-x-auto touch-pan-x [&::-webkit-scrollbar]:hidden [-webkit-overflow-scrolling:touch] [scrollbar-width:none]">
            {categories.map((category, index) => {
              const isActive = activeCategory === category.id;
              return (
                <button
                  key={index}
                  onClick={() => handleCategoryClick(category.id, category.slug)}
                  className="flex-shrink-0 flex flex-col items-center justify-center px-2 py-2 lg:flex-row lg:gap-2 lg:px-4 lg:py-2 rounded-xl transition-all duration-300 border-l-4 hover:scale-105 cursor-pointer group min-w-[70px] lg:min-w-0"
                  style={{
                    borderLeftColor: isActive ? currentTheme.primary : currentTheme.primary + '66',
                    backgroundColor: isActive ? currentTheme.secondary + '1A' : 'transparent'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderLeftColor = currentTheme.hoverColor}
                  onMouseLeave={(e) => e.currentTarget.style.borderLeftColor = isActive ? currentTheme.primary : currentTheme.primary + '66'}
                >
                  <div 
                    className="text-2xl lg:text-xl transition-transform group-hover:scale-110"
                    style={{ filter: isActive ? 'brightness(1.1)' : 'none' }}
                  >
                    {category.icon}
                  </div>
                  <span 
                    className="text-xs lg:text-sm font-semibold mt-1 lg:mt-0 text-center transition-colors"
                    style={{ color: isActive ? currentTheme.primary : '#111827' }}
                  >
                    {category.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white py-4 md:py-6">
      <div className="max-w-7xl mx-auto px-0 lg:px-12">
        {/* Mobile: Vertical List (7 categories) */}
        <div className="block md:hidden">
          {categories.slice(0, 7).map((category, index) => {
            const isActive = activeCategory === category.id;
            return (
              <button
                key={index}
                onClick={() => handleCategoryClick(category.id, category.slug)}
                className="flex items-center justify-between px-4 py-3 border-b border-gray-100 hover:bg-sunrise-leaf/5 transition-all duration-200 w-full text-left group"
                style={{
                  backgroundColor: isActive ? currentTheme.secondary + '1A' : undefined
                }}
              >
                {/* Icon Left */}
                <div className="flex items-center gap-3 flex-1">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 group-hover:scale-110"
                    style={{ 
                      backgroundColor: isActive ? currentTheme.primary + '20' : currentTheme.secondary + '20',
                    }}
                  >
                    <span className="text-2xl">{category.icon}</span>
                  </div>
                  
                  {/* Category Name */}
                  <span 
                    className="font-medium text-base transition-colors duration-200"
                    style={{ color: isActive ? currentTheme.primary : '#374151' }}
                  >
                    {category.title}
                  </span>
                </div>
                
                {/* Arrow Right */}
                <svg 
                  className="w-5 h-5 transition-all duration-200 group-hover:translate-x-1" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  style={{ color: isActive ? currentTheme.primary : '#9CA3AF' }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            );
          })}
        </div>

        {/* Desktop: Horizontal Scroll Grid (original layout) */}
        <div className="hidden md:block px-4">
          <div className="overflow-x-auto touch-pan-x [&::-webkit-scrollbar]:hidden [-webkit-overflow-scrolling:touch] [scrollbar-width:none]">
            <div className="flex gap-4 pb-2">
              {categories.map((category, index) => {
                const isActive = activeCategory === category.id;
                return (
                  <button
                    key={index}
                    onClick={() => handleCategoryClick(category.id, category.slug)}
                    className="flex-shrink-0 w-36 flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-300 border-2 hover:scale-105 cursor-pointer group"
                    style={{
                      borderColor: isActive ? currentTheme.primary : currentTheme.primary + '33',
                      backgroundColor: isActive ? currentTheme.secondary + '1A' : 'transparent'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = currentTheme.hoverColor}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = isActive ? currentTheme.primary : currentTheme.primary + '33'}
                  >
                    <div 
                      className="text-4xl mb-2 transition-transform group-hover:scale-110"
                      style={{ filter: isActive ? 'brightness(1.1)' : 'none' }}
                    >
                      {category.icon}
                    </div>
                    <span 
                      className="text-sm font-semibold text-center transition-colors"
                      style={{ color: isActive ? currentTheme.primary : '#374151' }}
                    >
                      {category.title}
                    </span>
                    <span className="text-xs text-gray-500 mt-1 text-center">{category.description}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
