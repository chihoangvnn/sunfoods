'use client'

import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { fetchProducts } from '@/services/apiService';
import { useResponsive } from '@/hooks/use-mobile';
import { Product } from '@/types/api';
import { MobileHeader } from '@/components/MobileHeader';
import { DesktopShopeeHeader } from '@/components/DesktopShopeeHeader';
import { BraceletProductCard } from '@/components/BraceletProductCard';
import { SizeGuideModal } from '@/components/SizeGuideModal';
import { CatalogFilterHeader, FilterGroup } from '@/components/CatalogFilterHeader';

export default function ChuoiHatTramHuongPage() {
  const router = useRouter();
  const { isMobile } = useResponsive();
  const [selectedMaterial, setSelectedMaterial] = useState<string>('all');
  const [selectedBeadSize, setSelectedBeadSize] = useState<string>('all');
  const [selectedGiftType, setSelectedGiftType] = useState<string>('all');
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['products', 'chuoi-hat-tram-huong'],
    queryFn: async () => {
      return await fetchProducts({
        limit: 100,
        categoryId: 'chuoi-hat-tram-huong',
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
    if (selectedBeadSize !== 'all') {
      filtered = filtered.filter(p => p.specifications?.beadSize === selectedBeadSize);
    }
    if (selectedGiftType !== 'all') {
      filtered = filtered.filter(p => p.giftCategory === selectedGiftType);
    }
    return filtered;
  }, [products, selectedMaterial, selectedBeadSize, selectedGiftType]);

  const filterGroups: FilterGroup[] = [
    {
      label: 'Chất liệu',
      options: [
        { value: 'all', label: 'Tất cả' },
        { value: 'Trầm nước', label: 'Trầm nước' },
        { value: 'Trầm bông', label: 'Trầm bông' },
        { value: 'Trầm tạp', label: 'Trầm tạp' },
      ],
      selectedValue: selectedMaterial,
      onChange: setSelectedMaterial,
    },
    {
      label: 'Size',
      options: [
        { value: 'all', label: 'Tất cả' },
        { value: '8mm', label: '8mm' },
        { value: '10mm', label: '10mm' },
        { value: '12mm', label: '12mm' },
        { value: '14mm', label: '14mm' },
      ],
      selectedValue: selectedBeadSize,
      onChange: setSelectedBeadSize,
    },
    {
      label: 'Quà tặng',
      options: [
        { value: 'all', label: 'Tất cả' },
        { value: 'male', label: 'Nam' },
        { value: 'female', label: 'Nữ' },
        { value: 'feng-shui', label: 'Phong thủy' },
        { value: 'couple', label: 'Đôi' },
      ],
      selectedValue: selectedGiftType,
      onChange: setSelectedGiftType,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-tramhuong-primary/5 via-white to-tramhuong-accent/5">
      <title>Vòng Tay Chuỗi Hạt Trầm Hương Thiên Nhiên | Trầm Hương Hoàng Ngân</title>
      
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
              title="Vòng Tay Chuỗi Hạt Trầm Hương"
              subtitle="Chuỗi hạt trầm hương thiên nhiên, mang lại bình an và may mắn"
              ctaText="Hướng dẫn chọn size"
              onCtaClick={() => setShowSizeGuide(true)}
              filterGroups={filterGroups}
            />

            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-tramhuong-accent"></div>
                <p className="mt-4 font-nunito text-tramhuong-primary">Đang tải sản phẩm...</p>
              </div>
            ) : (
              <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-4'} gap-4 lg:gap-6`}>
                {filteredProducts.map((product) => (
                  <BraceletProductCard key={product.id} product={product} />
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

      <SizeGuideModal isOpen={showSizeGuide} onClose={() => setShowSizeGuide(false)} />
    </div>
  );
}
