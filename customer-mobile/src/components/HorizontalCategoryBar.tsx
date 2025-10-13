'use client'

import React, { useRef, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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

  // Auto-scroll to selected category
  useEffect(() => {
    if (selectedCategory && scrollContainerRef.current) {
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
  }, [selectedCategory]);

  if (!categories.length) return null;

  return (
    <div className="relative bg-sunrise-leaf/5 border-t border-sunrise-leaf/30">
      <div className="w-full px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="relative flex items-center py-3">
          {/* Left scroll arrow */}
          {showLeftArrow && (
            <button
              onClick={scrollLeft}
              className="absolute left-4 z-10 flex items-center justify-center w-8 h-8 bg-sunrise-leaf/20 hover:bg-sunrise-leaf/30 text-sunrise-leaf rounded-full shadow-md transition-all duration-200 backdrop-blur-sm"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          {/* Category buttons container */}
          <div
            ref={scrollContainerRef}
            className="flex items-center gap-3 overflow-x-auto scrollbar-hide scroll-smooth px-10 md:px-8 lg:px-4"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {categories.map((category) => (
              <button
                key={category.id}
                data-category-id={category.id}
                onClick={() => onCategorySelect(category.id)}
                className={`
                  flex-shrink-0 px-4 py-2 font-semibold transition-all duration-200 whitespace-nowrap relative group
                  ${
                    selectedCategory === category.id
                      ? 'text-sunrise-leaf'
                      : 'text-gray-600 hover:text-sunrise-leaf'
                  }
                `}
              >
                {category.icon && (
                  <span className="mr-1.5 text-base">{category.icon}</span>
                )}
                <span className="text-sm tracking-wide">{category.name}</span>
                
                {/* Bottom border - warm-sun for selected, subtle for hover */}
                <span className={`
                  absolute bottom-0 left-0 right-0 h-0.5 transition-all duration-200
                  ${
                    selectedCategory === category.id
                      ? 'bg-warm-sun'
                      : 'bg-transparent group-hover:bg-warm-sun/50'
                  }
                `} />
              </button>
            ))}
          </div>

          {/* Right scroll arrow */}
          {showRightArrow && (
            <button
              onClick={scrollRight}
              className="absolute right-4 z-10 flex items-center justify-center w-8 h-8 bg-sunrise-leaf/20 hover:bg-sunrise-leaf/30 text-sunrise-leaf rounded-full shadow-md transition-all duration-200 backdrop-blur-sm"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Custom scrollbar hiding styles */}
      <style jsx>{`
        .scrollbar-hide {
          -webkit-overflow-scrolling: touch;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}