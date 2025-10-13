'use client'

import React, { useState, useEffect } from 'react';
import { VegetablesIcon, FruitsIcon, PantryIcon, HerbsIcon, WellnessIcon, ProteinIcon, FreshnessIcon, FarmOriginIcon } from '@/components/icons/CategoryIcons';

interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
}

interface CategoryIconsGridProps {
  onCategoryClick: (categoryId: string) => void;
}

const categories: Category[] = [
  { id: 'rau-cu', name: 'Rau Củ Sạch', icon: <VegetablesIcon size={24} className="text-sunrise-leaf" /> },
  { id: 'trai-cay', name: 'Trái Cây Tươi', icon: <FruitsIcon size={24} className="text-sunrise-leaf" /> },
  { id: 'thuc-pham-kho', name: 'Thực Phẩm Khô', icon: <PantryIcon size={24} className="text-sunrise-leaf" /> },
  { id: 'wellness', name: 'Sức Khỏe', icon: <WellnessIcon size={24} className="text-sunrise-leaf" /> },
  { id: 'protein', name: 'Protein', icon: <ProteinIcon size={24} className="text-sunrise-leaf" /> },
  { id: 'farm-fresh', name: 'Farm Fresh', icon: <FarmOriginIcon size={24} className="text-warm-sun" /> },
];

export function CategoryIconsGrid({ onCategoryClick }: CategoryIconsGridProps) {
  const [isHidden, setIsHidden] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Find hero section and get its position
      const heroSection = document.querySelector('[data-hero-section="organic-hero"]');
      
      if (heroSection) {
        const heroRect = heroSection.getBoundingClientRect();
        const heroBottom = heroRect.bottom;
        
        // Debug: log values to understand behavior
        console.log('Hero Bottom:', heroBottom, 'ScrollY:', currentScrollY, 'Direction:', currentScrollY > lastScrollY ? 'DOWN' : 'UP');
        
        // Only show menu when scrolling up AND very close to hero section (within 80px)
        if (heroBottom < 0) {
          // Hero scrolled past viewport
          if (currentScrollY > lastScrollY) {
            // Scrolling down - always hide
            console.log('→ HIDE (scrolling down)');
            setIsHidden(true);
          } 
          else if (currentScrollY < lastScrollY && heroBottom > -80) {
            // Scrolling up AND close to hero (within 80px) - show menu
            console.log('→ SHOW (scrolling up & close to hero)');
            setIsHidden(false);
          } else {
            // Scrolling up but still far from hero - keep hidden
            console.log('→ HIDE (scrolling up but far from hero)');
            setIsHidden(true);
          }
        } else {
          // Hero visible - always hide menu
          console.log('→ HIDE (hero visible)');
          setIsHidden(true);
        }
      } else {
        console.log('⚠️ Hero section not found!');
        // Fallback: if no hero section found, use old 800px logic
        if (currentScrollY > 800) {
          if (currentScrollY > lastScrollY) {
            setIsHidden(true);
          } 
          else if (currentScrollY < lastScrollY) {
            setIsHidden(false);
          }
        } else {
          setIsHidden(false);
        }
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
    
    // Run scroll handler once on mount to set initial state
    handleScroll();
    
    return () => window.removeEventListener('scroll', scrollListener);
  }, [lastScrollY]);

  return (
    <div 
      className={`bg-[#F5F5F5] border-b border-gray-200 transition-all duration-300 ease-in-out lg:sticky lg:top-[116px] lg:mb-0 ${
        isHidden ? 'lg:-translate-y-full lg:opacity-0 lg:pointer-events-none' : 'lg:translate-y-0 lg:opacity-100'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="grid grid-cols-6 gap-4">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategoryClick(category.id)}
              className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-white transition-all duration-200 group relative"
            >
              <div className="transition-transform duration-200 group-hover:scale-110">
                {category.icon}
              </div>
              <span className="text-base font-semibold text-gray-700 group-hover:text-sunrise-leaf transition-colors text-center leading-tight">
                {category.name}
              </span>
              {/* Bottom indicator on hover */}
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-warm-sun transition-all duration-200 group-hover:w-12" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
