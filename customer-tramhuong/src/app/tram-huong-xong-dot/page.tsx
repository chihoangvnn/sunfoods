'use client'

import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { fetchProducts } from '@/services/apiService';
import { useResponsive } from '@/hooks/use-mobile';
import { Product } from '@/types/api';
import { MobileHeader } from '@/components/MobileHeader';
import { DesktopShopeeHeader } from '@/components/DesktopShopeeHeader';
import { GalleryProductCard } from '@/components/GalleryProductCard';
import { CatalogFilterHeader, FilterGroup } from '@/components/CatalogFilterHeader';

export default function TramHuongXongDotPage() {
  const router = useRouter();
  const { isMobile } = useResponsive();
  const [selectedMaterial, setSelectedMaterial] = useState<string>('all');
  const [selectedOrigin, setSelectedOrigin] = useState<string>('all');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedWeight, setSelectedWeight] = useState<string>('all');
  const [showGuideModal, setShowGuideModal] = useState(false);

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['products', 'tram-huong-xong-dot'],
    queryFn: async () => {
      return await fetchProducts({
        limit: 100,
        categoryId: 'tram-huong-xong-dot',
        sortBy: 'newest',
        sortOrder: 'desc'
      });
    },
  });

  const filteredProducts = useMemo(() => {
    let filtered = [...products];
    if (selectedMaterial !== 'all') {
      filtered = filtered.filter(p => p.specifications?.material === selectedMaterial);
    }
    if (selectedOrigin !== 'all') {
      filtered = filtered.filter(p => p.specifications?.origin === selectedOrigin);
    }
    if (selectedGrade !== 'all') {
      filtered = filtered.filter(p => p.specifications?.grade === selectedGrade);
    }
    if (selectedWeight !== 'all') {
      filtered = filtered.filter(p => p.specifications?.weight === selectedWeight);
    }
    return filtered;
  }, [products, selectedMaterial, selectedOrigin, selectedGrade, selectedWeight]);

  const filterGroups: FilterGroup[] = [
    {
      label: 'Nguyên liệu',
      options: [
        { value: 'all', label: 'Tất cả' },
        { value: 'Trầm miếng', label: 'Trầm miếng' },
        { value: 'Trầm vụn', label: 'Trầm vụn' },
        { value: 'Trầm bột', label: 'Trầm bột' },
      ],
      selectedValue: selectedMaterial,
      onChange: setSelectedMaterial,
    },
    {
      label: 'Xuất xứ',
      options: [
        { value: 'all', label: 'Tất cả' },
        { value: 'Việt Nam', label: 'Việt Nam' },
        { value: 'Lào', label: 'Lào' },
        { value: 'Campuchia', label: 'Campuchia' },
      ],
      selectedValue: selectedOrigin,
      onChange: setSelectedOrigin,
    },
    {
      label: 'Grade',
      options: [
        { value: 'all', label: 'Tất cả' },
        { value: 'AAA', label: 'AAA' },
        { value: 'AA+', label: 'AA+' },
        { value: 'A+', label: 'A+' },
        { value: 'A', label: 'A' },
      ],
      selectedValue: selectedGrade,
      onChange: setSelectedGrade,
    },
    {
      label: 'Khối lượng',
      options: [
        { value: 'all', label: 'Tất cả' },
        { value: '10g', label: '10g' },
        { value: '20g', label: '20g' },
        { value: '50g', label: '50g' },
        { value: '100g', label: '100g' },
      ],
      selectedValue: selectedWeight,
      onChange: setSelectedWeight,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-tramhuong-primary/5 via-white to-tramhuong-accent/5">
      <title>Trầm Hương Xông Đốt Nguyên Chất | Trầm Hương Hoàng Ngân</title>
      
      <DesktopShopeeHeader 
        cartCount={0}
        onSearch={() => router.push('/')}
        onCategoryClick={() => {}}
        onCartClick={() => router.push('/cart')}
        onAccountClick={() => router.push('/profile')}
        onLogin={() => router.push('/')}
        onRegister={() => router.push('/')}
      />

      <MobileHeader
        storeName="Trầm Hương Hoàng Ngân"
        cartCount={0}
        onCartClick={() => router.push('/cart')}
        onSearchClick={() => router.push('/')}
        onProfileClick={() => router.push('/profile')}
      />

      <div className="lg:pt-[120px]">
        <div className={isMobile ? 'px-3 py-4' : 'px-6 py-8 lg:px-12 xl:px-16'}>
          <div className="max-w-7xl mx-auto">
            <CatalogFilterHeader
              title="Trầm Hương Xông Đốt Nguyên Chất"
              subtitle="Trầm hương nguyên chất phong thủy, thanh lọc không gian linh thiêng"
              ctaText="Hướng dẫn xông đốt chuẩn nghi thức"
              onCtaClick={() => {
                setShowGuideModal(true);
                alert('Hướng dẫn xông đốt chuẩn nghi thức sẽ sớm ra mắt');
              }}
              filterGroups={filterGroups}
            />

            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-tramhuong-accent"></div>
                <p className="mt-4 font-nunito text-tramhuong-primary">Đang tải sản phẩm...</p>
              </div>
            ) : (
              <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-3'} gap-4 lg:gap-6`}>
                {filteredProducts.map((product) => (
                  <GalleryProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {!isLoading && filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="font-nunito text-lg text-tramhuong-primary/70">
                  Không tìm thấy sản phẩm phù hợp
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
