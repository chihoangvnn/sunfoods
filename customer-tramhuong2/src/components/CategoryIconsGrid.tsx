'use client'

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Droplet, Church, Link2 } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
  path: string;
}

interface CategoryIconsGridProps {
  onCategoryClick?: (categoryId: string) => void;
}

const categories: Category[] = [
  { id: 'tram-huong-my-nghe', name: 'Trầm Hương Mỹ Nghệ', icon: <Church className="h-6 w-6" />, path: '/tram-huong-my-nghe' },
  { id: 'chuoi-hat-tram-huong', name: 'Chuỗi Hạt Trầm Hương', icon: <Link2 className="h-6 w-6" />, path: '/chuoi-hat-tram-huong' },
  { id: 'nhang-tram-huong', name: 'Nhang Trầm Hương', icon: <Sparkles className="h-6 w-6" />, path: '/nhang-tram-huong' },
  { id: 'tram-huong-xong-dot', name: 'Trầm Hương Xông Đốt', icon: <Droplet className="h-6 w-6" />, path: '/tram-huong-xong-dot' },
];

const SCROLL_BUFFER = 10;

export function CategoryIconsGrid({ onCategoryClick }: CategoryIconsGridProps) {
  const router = useRouter();
  const [isHidden, setIsHidden] = useState(false);
  const lastScrollYRef = useRef(0);
  const lastCommittedScrollRef = useRef(0);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pendingDirectionRef = useRef<'down' | 'up' | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Only hide if scrolled down more than 100px
      if (currentScrollY > 100) {
        // Scrolling DOWN past buffer
        if (currentScrollY > lastCommittedScrollRef.current + SCROLL_BUFFER) {
          // Only set timer if no pending DOWN action or direction changed
          if (pendingDirectionRef.current !== 'down') {
            if (debounceTimerRef.current) {
              clearTimeout(debounceTimerRef.current);
            }
            pendingDirectionRef.current = 'down';
            
            debounceTimerRef.current = setTimeout(() => {
              setIsHidden(true);
              lastCommittedScrollRef.current = currentScrollY;
              pendingDirectionRef.current = null;
            }, 150);
          }
          // If already pending DOWN, do nothing (let timer run)
        } 
        // Scrolling UP past buffer
        else if (currentScrollY < lastCommittedScrollRef.current - SCROLL_BUFFER) {
          // Only set timer if no pending UP action or direction changed
          if (pendingDirectionRef.current !== 'up') {
            if (debounceTimerRef.current) {
              clearTimeout(debounceTimerRef.current);
            }
            pendingDirectionRef.current = 'up';
            
            debounceTimerRef.current = setTimeout(() => {
              setIsHidden(false);
              lastCommittedScrollRef.current = currentScrollY;
              pendingDirectionRef.current = null;
            }, 150);
          }
          // If already pending UP, do nothing (let timer run)
        }
        // Inside buffer zone - cancel any pending action
        else {
          if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
            pendingDirectionRef.current = null;
          }
        }
      } else {
        // At top - immediate show, cancel pending
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
          pendingDirectionRef.current = null;
        }
        setIsHidden(false);
        lastCommittedScrollRef.current = currentScrollY;
      }
      
      lastScrollYRef.current = currentScrollY;
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
    return () => {
      window.removeEventListener('scroll', scrollListener);
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return (
    <div 
      className={`backdrop-blur-sm md:backdrop-blur-md will-change-transform bg-tramhuong-bg/40 
        transition-[transform,opacity] duration-500
        lg:sticky lg:top-[60px] lg:mb-0 
        ${isHidden 
          ? 'lg:pointer-events-none' 
          : 'border-b border-tramhuong-accent/30 shadow-[0_4px_24px_rgba(61,43,31,0.15)]'
        }`}
      style={{ 
        backfaceVisibility: 'hidden',
        transform: isHidden 
          ? 'translate3d(0, -100%, 0)'
          : 'translate3d(0, 0, 0)',
        opacity: isHidden ? 0 : 1,
        transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      <div className="max-w-7xl mx-auto px-6 py-3 lg:pb-0">
        <div className="grid grid-cols-4 gap-3">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => {
                router.push(category.path);
                onCategoryClick?.(category.id);
              }}
              className="group flex flex-col items-center gap-2 p-3 rounded-xl 
                bg-white/60 backdrop-blur-sm will-change-transform
                border border-tramhuong-accent/20
                shadow-[0_2px_12px_rgba(193,168,117,0.1)]
                hover:bg-tramhuong-accent/10 
                hover:border-tramhuong-accent/40
                hover:shadow-[0_4px_20px_rgba(193,168,117,0.25)]
                hover:scale-105 hover:-translate-y-0.5
                transition-all duration-300"
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-tramhuong-accent/10 backdrop-blur-sm md:backdrop-blur-md border border-tramhuong-accent/30 flex items-center justify-center
                  group-hover:bg-tramhuong-accent/20 group-hover:border-tramhuong-accent/50 group-hover:shadow-[0_0_20px_rgba(193,168,117,0.3)]
                  transition-all duration-300">
                  <div className="text-tramhuong-accent group-hover:text-tramhuong-primary transition-all duration-300">
                    {category.icon}
                  </div>
                </div>
              </div>
              <span className="text-sm font-playfair font-medium text-tramhuong-primary group-hover:text-tramhuong-accent transition-all duration-300 text-center tracking-wide">
                {category.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
