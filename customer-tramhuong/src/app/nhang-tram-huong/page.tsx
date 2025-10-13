'use client'

import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { fetchProducts } from '@/services/apiService';
import { useResponsive } from '@/hooks/use-mobile';
import { Product } from '@/types/api';
import { MobileHeader } from '@/components/MobileHeader';
import { DesktopShopeeHeader } from '@/components/DesktopShopeeHeader';
import { IncenseProductCard } from '@/components/IncenseProductCard';
import { CatalogFilterHeader, FilterGroup } from '@/components/CatalogFilterHeader';

export default function NhangTramHuongPage() {
  const router = useRouter();
  const { isMobile } = useResponsive();
  const [selectedIncenseType, setSelectedIncenseType] = useState<string>('all');
  const [selectedBurnTime, setSelectedBurnTime] = useState<string>('all');
  const [selectedUsage, setSelectedUsage] = useState<string>('all');
  const [showCompareModal, setShowCompareModal] = useState(false);

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['products', 'nhang-tram-huong'],
    queryFn: async () => {
      return await fetchProducts({
        limit: 100,
        categoryId: 'nhang-tram-huong',
        sortBy: 'newest',
        sortOrder: 'desc'
      });
    },
  });

  const filteredProducts = useMemo(() => {
    let filtered = [...products];
    if (selectedIncenseType !== 'all') {
      filtered = filtered.filter(p => p.specifications?.incenseType === selectedIncenseType);
    }
    if (selectedBurnTime !== 'all') {
      filtered = filtered.filter(p => p.specifications?.burnTime === selectedBurnTime);
    }
    if (selectedUsage !== 'all') {
      filtered = filtered.filter(p => p.specifications?.usage === selectedUsage);
    }
    return filtered;
  }, [products, selectedIncenseType, selectedBurnTime, selectedUsage]);

  const filterGroups: FilterGroup[] = [
    {
      label: 'Loại nhang',
      options: [
        { value: 'all', label: 'Tất cả' },
        { value: 'Trầm bột', label: 'Trầm bột' },
        { value: 'Trầm keo', label: 'Trầm keo' },
        { value: 'Khoanh', label: 'Khoanh' },
      ],
      selectedValue: selectedIncenseType,
      onChange: setSelectedIncenseType,
    },
    {
      label: 'Thời gian cháy',
      options: [
        { value: 'all', label: 'Tất cả' },
        { value: '30 phút', label: '30 phút' },
        { value: '1 giờ', label: '1 giờ' },
        { value: '2 giờ', label: '2 giờ' },
        { value: '3 giờ', label: '3 giờ' },
      ],
      selectedValue: selectedBurnTime,
      onChange: setSelectedBurnTime,
    },
    {
      label: 'Không gian sử dụng',
      options: [
        { value: 'all', label: 'Tất cả' },
        { value: 'Thờ cúng', label: 'Thờ cúng' },
        { value: 'Thiền định', label: 'Thiền định' },
        { value: 'Spa', label: 'Spa' },
        { value: 'Xông phòng', label: 'Xông phòng' },
      ],
      selectedValue: selectedUsage,
      onChange: setSelectedUsage,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-tramhuong-primary/5 via-white to-tramhuong-accent/5">
      <title>Nhang Trầm Hương Thiên Nhiên Cao Cấp | Trầm Hương Hoàng Ngân</title>
      
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
              title="Nhang Trầm Hương Thiên Nhiên"
              subtitle="Nhang trầm hương thuần tự nhiên, hương thơm thanh tịnh lâu phai"
              ctaText="So sánh thời gian cháy"
              onCtaClick={() => {
                setShowCompareModal(true);
                alert('Tính năng so sánh thời gian cháy sẽ sớm ra mắt');
              }}
              filterGroups={filterGroups}
            />

            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-tramhuong-accent"></div>
                <p className="mt-4 font-nunito text-tramhuong-primary">Đang tải sản phẩm...</p>
              </div>
            ) : (
              <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-3'} gap-4 lg:gap-6`}>
                {filteredProducts.map((product) => (
                  <IncenseProductCard key={product.id} product={product} />
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
