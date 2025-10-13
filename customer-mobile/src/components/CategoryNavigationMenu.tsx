'use client'

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface CategoryNavigationMenuProps {
  activeCategory: string;
}

interface Category {
  id: string;
  name: string;
  icon: string;
  path: string;
  color: string;
}

const CATEGORIES: Category[] = [
  {
    id: 'rau-cu-qua',
    name: 'Rau Củ Quả',
    icon: '🥒',
    path: '/rau-cu-qua',
    color: '#059669',
  },
  {
    id: 'trai-cay-nhap-khau',
    name: 'Trái Cây Nhập Khẩu',
    icon: '🍎',
    path: '/trai-cay-nhap-khau',
    color: '#f97316',
  },
  {
    id: 'my-pham',
    name: 'Mỹ Phẩm',
    icon: '💄',
    path: '/my-pham',
    color: '#ec4899',
  },
  {
    id: 'thuc-pham-kho',
    name: 'Thực Phẩm Khô',
    icon: '🌾',
    path: '/thuc-pham-kho',
    color: '#57534e',
  },
  {
    id: 'an-dam-cho-be',
    name: 'Ăn Dặm Cho Bé',
    icon: '👶',
    path: '/an-dam-cho-be',
    color: '#0ea5e9',
  },
  {
    id: 'gia-dung',
    name: 'Gia Dụng',
    icon: '🏠',
    path: '/gia-dung',
    color: '#0d9488',
  },
  {
    id: 'thuc-pham-tuoi',
    name: 'Thực Phẩm Tươi',
    icon: '🥩',
    path: '/thuc-pham-tuoi',
    color: '#ef4444',
  },
];

export function CategoryNavigationMenu({ activeCategory }: CategoryNavigationMenuProps) {
  const router = useRouter();

  const handleCategoryClick = (path: string) => {
    router.push(path);
  };

  return (
    <div className="sticky top-[72px] z-40 bg-white border-b border-gray-200">
      <div 
        className="flex overflow-x-auto scrollbar-hide scroll-smooth px-4 py-3 gap-4"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {CATEGORIES.map((category) => {
          const isActive = activeCategory === category.id;
          
          return (
            <Link
              key={category.id}
              href={category.path}
              className="flex-shrink-0"
            >
              <button
                onClick={() => handleCategoryClick(category.path)}
                className="flex flex-col items-center gap-2 min-w-[80px] group relative"
              >
                <div className="text-3xl transition-transform group-hover:scale-110">
                  {category.icon}
                </div>
                <span 
                  className={`text-xs font-medium text-center leading-tight transition-colors ${
                    isActive ? 'font-semibold' : 'text-gray-600 group-hover:text-gray-900'
                  }`}
                  style={isActive ? { color: category.color } : {}}
                >
                  {category.name}
                </span>
                
                {isActive && (
                  <div 
                    className="absolute -bottom-3 left-0 right-0 h-1 rounded-t-sm"
                    style={{ backgroundColor: category.color }}
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
