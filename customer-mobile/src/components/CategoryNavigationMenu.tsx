'use client'

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Leaf, Apple, Fish, Package, Sparkles, Coffee, Cookie } from 'lucide-react';

interface CategoryNavigationMenuProps {
  activeCategory: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  sortOrder: number;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'Rau củ quả': <Leaf className="h-7 w-7" />,
  'Trái cây': <Apple className="h-7 w-7" />,
  'Thịt cá': <Fish className="h-7 w-7" />,
  'Đồ khô': <Package className="h-7 w-7" />,
  'Gia vị': <Sparkles className="h-7 w-7" />,
  'Đồ uống': <Coffee className="h-7 w-7" />,
  'Đồ ăn vặt': <Cookie className="h-7 w-7" />,
};

const CATEGORY_COLORS: Record<string, string> = {
  'Rau củ quả': '#059669',
  'Trái cây': '#f97316',
  'Thịt cá': '#ef4444',
  'Đồ khô': '#57534e',
  'Gia vị': '#eab308',
  'Đồ uống': '#0ea5e9',
  'Đồ ăn vặt': '#ec4899',
};

export function CategoryNavigationMenu({ activeCategory }: CategoryNavigationMenuProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCategories() {
      try {
        const frontendId = process.env.NEXT_PUBLIC_FRONTEND_ID || 'frontend-a';
        const res = await fetch(`/api/categories/filter?frontendId=${frontendId}`);
        if (res.ok) {
          const data = await res.json();
          setCategories(data.filter((cat: Category) => cat.isActive));
        }
      } catch (error) {
        console.error('Failed to load categories:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadCategories();
  }, []);

  if (loading) {
    return (
      <div className="sticky top-[72px] z-40 bg-white border-b border-gray-200">
        <div className="flex overflow-x-auto scrollbar-hide scroll-smooth px-4 py-3 gap-4">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="flex-shrink-0 flex flex-col items-center gap-2 min-w-[80px]">
              <div className="h-7 w-7 bg-gray-200 rounded-full animate-pulse" />
              <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="sticky top-[72px] z-40 bg-white border-b border-gray-200">
      <div 
        className="flex overflow-x-auto scrollbar-hide scroll-smooth px-4 py-3 gap-4"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {categories.map((category) => {
          const isActive = activeCategory === category.id;
          const icon = CATEGORY_ICONS[category.name] || <Package className="h-7 w-7" />;
          const color = CATEGORY_COLORS[category.name] || '#059669';
          
          return (
            <Link
              key={category.id}
              href={`/${category.slug}`}
              className="flex-shrink-0"
            >
              <button
                className="flex flex-col items-center gap-2 min-w-[80px] group relative"
              >
                <div 
                  className="transition-transform group-hover:scale-110"
                  style={{ color: isActive ? color : '#6b7280' }}
                >
                  {icon}
                </div>
                <span 
                  className={`text-xs font-medium text-center leading-tight transition-colors ${
                    isActive ? 'font-semibold' : 'text-gray-600 group-hover:text-gray-900'
                  }`}
                  style={isActive ? { color } : {}}
                >
                  {category.name}
                </span>
                
                {isActive && (
                  <div 
                    className="absolute -bottom-3 left-0 right-0 h-1 rounded-t-sm"
                    style={{ backgroundColor: color }}
                  />
                )}
              </button>
            </Link>
          );
        })}
      </div>

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
