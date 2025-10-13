'use client'

import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Home, ChevronRight } from 'lucide-react';
import { 
  VegetablesIcon, 
  FruitsIcon, 
  PantryIcon, 
  WellnessIcon, 
  ProteinIcon, 
  HerbsIcon 
} from '@/components/icons/CategoryIcons';

interface Category {
  id: string;
  name: string;
}

interface CategoryWithIcon extends Category {
  IconComponent: any;
  color: string;
}

export default function CategoriesPage() {
  const router = useRouter();

  // Demo categories for when API fails
  const demoCategories: Category[] = [
    { id: 'vegetables', name: 'Rau Củ Quả' },
    { id: 'fruits', name: 'Trái Cây' },
    { id: 'herbs', name: 'Rau Thơm' },
    { id: 'pantry', name: 'Thực Phẩm Khô' },
    { id: 'protein', name: 'Đạm & Protein' },
    { id: 'wellness', name: 'Sức Khỏe' },
  ];

  // Fetch categories from API (same logic as homepage)
  const { 
    data: allCategories, 
    isLoading: categoriesLoading,
    error: categoriesError 
  } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await fetch(`/api/categories/filter?frontendId=frontend-a`);
      if (!response.ok) throw new Error('Failed to fetch categories');
      return response.json();
    },
    retry: false,
    staleTime: 60000,
  });

  // Use API categories or fallback to demo categories
  const finalCategories = (allCategories && allCategories.length > 0) ? allCategories : demoCategories;

  // Helper function to map backend categories to organic food display with icons
  function getOrganicCategoryIcon(categoryName: string): { IconComponent: any; color: string } | null {
    const name = categoryName.toLowerCase();
    if (name.includes('rau') || name.includes('vegetable') || name.includes('củ')) {
      return { IconComponent: VegetablesIcon, color: 'text-category-vegetables' };
    }
    if (name.includes('trái cây') || name.includes('fruit') || name.includes('hoa quả')) {
      return { IconComponent: FruitsIcon, color: 'text-category-fruits' };
    }
    if (name.includes('thơm') || name.includes('herb')) {
      return { IconComponent: HerbsIcon, color: 'text-sunrise-leaf' };
    }
    if (name.includes('khô') || name.includes('pantry') || name.includes('gạo') || name.includes('ngũ cốc')) {
      return { IconComponent: PantryIcon, color: 'text-category-pantry' };
    }
    if (name.includes('protein') || name.includes('đậu') || name.includes('sữa')) {
      return { IconComponent: ProteinIcon, color: 'text-sunrise-leaf' };
    }
    if (name.includes('wellness') || name.includes('chức năng') || name.includes('tinh dầu')) {
      return { IconComponent: WellnessIcon, color: 'text-category-wellness' };
    }
    return { IconComponent: VegetablesIcon, color: 'text-sunrise-leaf' };
  }

  // Map backend categories with organic icons while preserving real IDs
  const categories = useMemo(() => {
    if (categoriesLoading) return [];
    
    return finalCategories
      .filter(cat => cat.id !== 'all')
      .map(cat => {
        const iconData = getOrganicCategoryIcon(cat.name);
        return {
          id: cat.id,
          name: cat.name,
          IconComponent: iconData?.IconComponent || VegetablesIcon,
          color: iconData?.color || 'text-sunrise-leaf'
        } as CategoryWithIcon;
      });
  }, [finalCategories, categoriesLoading]);

  // Navigate to homepage with selected category filter
  const handleCategoryClick = (categoryId: string) => {
    // Use window.location for proper query parameter handling
    window.location.href = `/?category=${categoryId}`;
  };

  // Navigate to homepage
  const handleBreadcrumbHome = () => {
    router.push('/');
  };

  // Loading skeleton
  if (categoriesLoading) {
    return (
      <div className="min-h-screen bg-neutral-cloud">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-sunrise-leaf to-sunrise-leaf/80 text-white py-12 px-6">
          <div className="max-w-7xl mx-auto">
            {/* Breadcrumb Skeleton */}
            <div className="flex items-center gap-2 mb-4">
              <div className="w-20 h-5 bg-white/20 rounded animate-pulse"></div>
              <ChevronRight className="h-4 w-4" />
              <div className="w-24 h-5 bg-white/30 rounded animate-pulse"></div>
            </div>
            
            {/* Title Skeleton */}
            <div className="w-64 h-10 bg-white/20 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Grid Skeleton */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-6 border border-sunrise-leaf/30">
                <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 animate-pulse"></div>
                <div className="w-full h-5 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with breadcrumb integrated */}
      <div className="bg-gradient-to-b from-neutral-mist/50 to-white py-8 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-6 text-sm">
            <button
              onClick={handleBreadcrumbHome}
              className="flex items-center gap-1 text-gray-600 hover:text-sunrise-leaf transition-colors"
            >
              <Home className="h-4 w-4" />
              <span>Trang chủ</span>
            </button>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <span className="text-sunrise-leaf font-medium">Danh mục</span>
          </div>
          
          {/* Title */}
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
              Danh mục sản phẩm 🌿
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Tinh hoa thiên nhiên - Mang sức khỏe đến mọi gia đình Việt
            </p>
          </div>
        </div>
      </div>

      {/* Categories Grid - Match feature boxes style */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
        {categories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Không có danh mục nào</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.map((category) => {
              const IconComponent = category.IconComponent;
              
              return (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id)}
                  className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100"
                >
                  {/* Icon */}
                  <div className={`w-12 h-12 mx-auto mb-3 flex items-center justify-center ${category.color}`}>
                    {IconComponent && <IconComponent size={48} />}
                  </div>
                  
                  {/* Category Name */}
                  <h3 className="text-center font-semibold text-gray-800 group-hover:text-sunrise-leaf transition-colors">
                    {category.name}
                  </h3>
                  
                  {/* Subtitle hint */}
                  <p className="text-center text-sm text-gray-500 mt-1">
                    Tươi ngon tự nhiên
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Back to Home Button */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 pb-16 text-center">
        <button
          onClick={handleBreadcrumbHome}
          className="inline-flex items-center gap-2 px-8 py-3 bg-white text-sunrise-leaf border border-sunrise-leaf rounded-xl 
                   hover:bg-sunrise-leaf hover:text-white transition-all shadow-sm hover:shadow-md"
        >
          <Home className="h-4 w-4" />
          <span className="font-semibold">Quay về trang chủ</span>
        </button>
      </div>
    </div>
  );
}
