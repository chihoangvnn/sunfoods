'use client'

import React, { useRef, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Category {
  id: string;
  name: string;
  icon?: string;
}

interface HorizontalCategoryBarProps {
  categories: Category[];
  selectedCategory: string;
  onCategorySelect: (categoryId: string) => void;
}

export function HorizontalCategoryBar({
  categories,
  selectedCategory,
  onCategorySelect
}: HorizontalCategoryBarProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(true);

  const toggleMenu = () => setIsMenuVisible(!isMenuVisible);

  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth);
    }
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -200,
        behavior: 'smooth'
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 200,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    checkScrollButtons();
    const handleResize = () => checkScrollButtons();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [categories]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollButtons);
      return () => container.removeEventListener('scroll', checkScrollButtons);
    }
  }, []);

  useEffect(() => {
    if (selectedCategory && scrollContainerRef.current && isMenuVisible) {
      const selectedButton = scrollContainerRef.current.querySelector(
        `[data-category-id="${selectedCategory}"]`
      ) as HTMLElement;
      
      if (selectedButton) {
        selectedButton.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        });
      }
    }
  }, [selectedCategory, isMenuVisible]);

  if (!categories.length) return null;

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsMenuVisible(true)}
      onMouseLeave={() => setIsMenuVisible(false)}
    >
      {!isMenuVisible && (
        <button 
          onClick={toggleMenu}
          className="w-full h-8 md:h-10 bg-tramhuong-accent/10 hover:bg-tramhuong-accent/20 
                     flex items-center justify-center transition-all duration-300
                     border-b border-tramhuong-accent/20"
          aria-label="Hiện danh mục"
        >
          <ChevronDown className="w-5 h-5 text-tramhuong-accent" />
        </button>
      )}

      <div 
        className={`
          transition-all duration-300 overflow-hidden
          ${isMenuVisible ? 'max-h-[200px]' : 'max-h-0'}
        `}
      >
        <div className="relative bg-white/60 backdrop-blur-md border-t border-tramhuong-accent/20">
          <div className="w-full px-6 lg:px-8 xl:px-12 2xl:px-16">
            <div className="relative flex items-center py-3">
              {showLeftArrow && (
                <button
                  onClick={scrollLeft}
                  className="absolute left-4 z-10 flex items-center justify-center w-8 h-8 bg-tramhuong-accent/80 hover:bg-tramhuong-accent text-white rounded-full shadow-[0_8px_32px_rgba(193,168,117,0.3)] transition-all duration-300 backdrop-blur-sm"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}

              <div
                ref={scrollContainerRef}
                className="flex items-center gap-2 overflow-x-auto scrollbar-hide scroll-smooth px-10 md:px-8 lg:px-4"
                style={{
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                }}
              >
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    data-category-id={category.id}
                    onClick={() => onCategorySelect(category.id)}
                    variant="ghost"
                    size="sm"
                    className={`
                      flex-shrink-0 px-4 py-2 rounded-full font-medium transition-all duration-300 whitespace-nowrap
                      ${
                        selectedCategory === category.id
                          ? 'bg-tramhuong-accent text-white shadow-[0_8px_32px_rgba(193,168,117,0.3)] hover:bg-tramhuong-accent/90'
                          : 'text-tramhuong-primary hover:text-tramhuong-accent hover:bg-tramhuong-accent/10 border border-tramhuong-accent/20 hover:border-tramhuong-accent/40'
                      }
                    `}
                  >
                    {category.icon && (
                      <span className="mr-1.5 text-sm">{category.icon}</span>
                    )}
                    <span className="text-sm">{category.name}</span>
                  </Button>
                ))}
              </div>

              {showRightArrow && (
                <button
                  onClick={scrollRight}
                  className="absolute right-4 z-10 flex items-center justify-center w-8 h-8 bg-tramhuong-accent/80 hover:bg-tramhuong-accent text-white rounded-full shadow-[0_8px_32px_rgba(193,168,117,0.3)] transition-all duration-300 backdrop-blur-sm"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          <button 
            onClick={toggleMenu}
            className="absolute top-2 right-2 text-tramhuong-accent/60 hover:text-tramhuong-accent transition-colors duration-200 p-1 rounded-full hover:bg-tramhuong-accent/10"
            aria-label="Ẩn danh mục"
          >
            <ChevronUp className="w-4 h-4" />
          </button>

          <style jsx>{`
            .scrollbar-hide {
              -webkit-overflow-scrolling: touch;
            }
            .scrollbar-hide::-webkit-scrollbar {
              display: none;
            }
          `}</style>
        </div>
      </div>
    </div>
  );
}
