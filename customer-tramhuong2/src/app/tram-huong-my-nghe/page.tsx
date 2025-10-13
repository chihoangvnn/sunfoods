'use client'

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { fetchProducts } from '@/services/apiService';
import { useResponsive } from '@/hooks/use-mobile';
import { Product } from '@/types/api';
import { MobileHeader } from '@/components/MobileHeader';
import { DesktopShopeeHeader } from '@/components/DesktopShopeeHeader';
import { SliderProductCard, LuxurySpecs } from '@/components/SliderProductCard';
import { HeroSliderSection } from '@/components/HeroSliderSection';
import { FullScreenImageModal } from '@/components/FullScreenImageModal';

const sampleProducts: Product[] = [
  {
    id: 'sample-1',
    name: 'Tượng Phật Di Lặc Gỗ Trầm Hương',
    price: 15000000,
    image: '/images/buddha-statue.jpg',
    images: [
      '/images/buddha-statue.jpg',
      '/images/buddha-statue-2.jpg',
      '/images/buddha-statue-3.jpg',
      '/images/buddha-statue-4.jpg'
    ],
    media: '/videos/tram-huong-1.mp4',
    category_id: 'tram-huong-my-nghe',
    stock: 5,
    short_description: 'Tượng Phật Di Lặc cao cấp từ gỗ trầm hương quý hiếm, chạm khắc tinh xảo',
    status: 'active'
  },
  {
    id: 'sample-2',
    name: 'Vòng Trầm Hương 108 Hạt AAA',
    price: 8500000,
    image: '/images/bracelet-108.jpg',
    images: [
      '/images/bracelet-108.jpg',
      '/images/bracelet-108-2.jpg',
      '/images/bracelet-108-3.jpg',
      '/images/bracelet-108-4.jpg'
    ],
    media: '/videos/tram-huong-2.mp4',
    category_id: 'tram-huong-my-nghe',
    stock: 12,
    short_description: 'Vòng tay trầm hương 108 hạt đẳng cấp AAA, mùi hương đậm đà',
    status: 'active'
  },
  {
    id: 'sample-3',
    name: 'Tượng Quan Âm Bồ Tát Trầm Hương',
    price: 18000000,
    image: '/images/quan-am-statue.jpg',
    images: [
      '/images/quan-am-statue.jpg',
      '/images/quan-am-statue-2.jpg',
      '/images/quan-am-statue-3.jpg',
      '/images/quan-am-statue-4.jpg'
    ],
    media: '/videos/tram-huong-3.mp4',
    category_id: 'tram-huong-my-nghe',
    stock: 3,
    short_description: 'Tượng Quan Âm Bồ Tát từ gỗ trầm hương nguyên khối, ý nghĩa phong thủy cao',
    status: 'active'
  },
  {
    id: 'sample-4',
    name: 'Lư Hương Rồng Phượng Trầm Hương',
    price: 12000000,
    image: '/images/incense-burner.jpg',
    images: [
      '/images/incense-burner.jpg',
      '/images/incense-burner-2.jpg',
      '/images/incense-burner-3.jpg'
    ],
    media: '/videos/tram-huong-4.mp4',
    category_id: 'tram-huong-my-nghe',
    stock: 8,
    short_description: 'Lư hương trầm khắc hình rồng phượng, tượng trưng quyền lực và thịnh vượng',
    status: 'active'
  },
  {
    id: 'sample-5',
    name: 'Tượng Tam Đa Trầm Hương',
    price: 20000000,
    image: '/images/tam-da-statue.jpg',
    images: [
      '/images/tam-da-statue.jpg',
      '/images/tam-da-statue-2.jpg',
      '/images/tam-da-statue-3.jpg',
      '/images/tam-da-statue-4.jpg'
    ],
    media: '/videos/tram-huong-5.mp4',
    category_id: 'tram-huong-my-nghe',
    stock: 2,
    short_description: 'Tượng Tam Đa (Phúc - Lộc - Thọ) gỗ trầm hương quý hiếm, nghệ thuật đỉnh cao',
    status: 'active'
  },
  {
    id: 'sample-6',
    name: 'Vòng Trầm Hương Nam Phi 16mm',
    price: 6500000,
    image: '/images/bracelet-16mm.jpg',
    images: [
      '/images/bracelet-16mm.jpg',
      '/images/bracelet-16mm-2.jpg',
      '/images/bracelet-16mm-3.jpg'
    ],
    media: '/videos/tram-huong-6.mp4',
    category_id: 'tram-huong-my-nghe',
    stock: 15,
    short_description: 'Vòng tay trầm hương Nam Phi size 16mm, hương thơm ngát thanh tao',
    status: 'active'
  },
  {
    id: 'sample-7',
    name: 'Tượng Đạt Ma Sư Tổ Trầm Hương',
    price: 16500000,
    image: '/images/dat-ma-statue.jpg',
    images: [
      '/images/dat-ma-statue.jpg',
      '/images/dat-ma-statue-2.jpg',
      '/images/dat-ma-statue-3.jpg',
      '/images/dat-ma-statue-4.jpg'
    ],
    media: '/videos/tram-huong-7.mp4',
    category_id: 'tram-huong-my-nghe',
    stock: 4,
    short_description: 'Tượng Đạt Ma Sư Tổ điêu khắc từ gỗ trầm hương Khánh Hòa',
    status: 'active'
  },
  {
    id: 'sample-8',
    name: 'Chuỗi Niệm Trầm Hương 54 Hạt',
    price: 5000000,
    image: '/images/prayer-beads.jpg',
    images: [
      '/images/prayer-beads.jpg',
      '/images/prayer-beads-2.jpg',
      '/images/prayer-beads-3.jpg'
    ],
    media: '/videos/tram-huong-8.mp4',
    category_id: 'tram-huong-my-nghe',
    stock: 20,
    short_description: 'Chuỗi niệm trầm hương 54 hạt, phù hợp với tu tập thiền định',
    status: 'active'
  }
];

const createLuxurySpecs = (index: number): LuxurySpecs => {
  const origins = ['Khánh Hòa', 'Quảng Nam', 'Nha Trang'];
  const grades = ['AAA', 'AA+', 'A+'];
  const fragrances = ['Ngọt nhẹ', 'Đậm đà', 'Thanh tao'];
  
  return {
    origin: origins[index % origins.length],
    grade: grades[index % grades.length],
    fragrance: fragrances[index % fragrances.length],
    dimensions: `${20 + index * 5}cm x ${10 + index * 2}cm x ${5 + index}cm`,
    weight: `${1.5 + index * 0.5}kg`,
    age: 30 + index * 10
  };
};

export default function TramHuongMyNghePage() {
  const router = useRouter();
  const { isMobile } = useResponsive();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['products', 'tram-huong-my-nghe'],
    queryFn: async () => {
      return await fetchProducts({
        limit: 100,
        categoryId: 'tram-huong-my-nghe',
        sortBy: 'newest',
        sortOrder: 'desc'
      });
    },
  });

  const displayProducts = products.length > 0 ? products : sampleProducts;
  const heroProduct = displayProducts[0];

  const openModal = (product: Product) => {
    setSelectedProduct(product);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setTimeout(() => setSelectedProduct(null), 300);
  };

  const scrollToGrid = () => {
    const gridElement = document.getElementById('products-grid');
    if (gridElement) {
      gridElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-tramhuong-primary/5 via-white to-tramhuong-accent/5">
      <title>Trầm Hương Mỹ Nghệ Thủ Công Cao Cấp | Trầm Hương Hoàng Ngân</title>
      
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

      <div className="lg:pt-0">
        {heroProduct && (
          <HeroSliderSection
            images={heroProduct.images || (heroProduct.image ? [heroProduct.image] : [])}
            posterUrl={heroProduct.image}
            productName={heroProduct.name}
            price={heroProduct.price}
            onViewDetails={scrollToGrid}
            onContactConsultation={() => router.push('/contact')}
          />
        )}

        <div className={isMobile ? 'px-3 py-4' : 'px-6 py-8 lg:px-12 xl:px-16'}>
          <div className="max-w-7xl mx-auto">

            <div className="bg-white/60 backdrop-blur-md rounded-xl border border-tramhuong-accent/30 shadow-[0_4px_24px_rgba(193,168,117,0.15)] p-6 md:p-8 mb-12">
              <h2 className="text-2xl md:text-3xl font-playfair font-bold text-tramhuong-primary mb-4">
                Câu chuyện nghệ nhân
              </h2>
              <div className="space-y-4 font-nunito text-tramhuong-primary/80 leading-relaxed">
                <p>
                  Trầm hương mỹ nghệ là sự kết hợp hoàn hảo giữa nghệ thuật điêu khắc truyền thống và vẻ đẹp tự nhiên của gỗ trầm hương quý hiếm. 
                  Mỗi tác phẩm đều được chế tác tỉ mỉ bởi những nghệ nhân lành nghề với kinh nghiệm hơn 30 năm.
                </p>
                <p>
                  Từ khâu tuyển chọn nguyên liệu, phác thảo ý tưởng, cho đến quá trình chạm khắc từng chi tiết nhỏ nhất, 
                  tất cả đều được thực hiện bằng tay với sự tâm huyết và kỹ năng cao siêu. Mỗi sản phẩm là một tác phẩm nghệ thuật độc nhất, 
                  mang trong mình linh hồn của người thợ và tinh hoa của thiên nhiên.
                </p>
                <p>
                  Chúng tôi tự hào mang đến những tác phẩm trầm hương mỹ nghệ không chỉ có giá trị thẩm mỹ cao 
                  mà còn mang ý nghĩa phong thủy sâu sắc, mang lại bình an và thịnh vượng cho gia chủ.
                </p>
              </div>
            </div>

            <h2 id="products-grid" className="text-2xl md:text-3xl font-playfair font-bold text-tramhuong-primary mb-6">
              Bộ sưu tập đặc biệt
            </h2>

            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-tramhuong-accent"></div>
                <p className="mt-4 font-nunito text-tramhuong-primary">Đang tải sản phẩm...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                {displayProducts.map((product, index) => (
                  <SliderProductCard
                    key={product.id}
                    images={product.images || (product.image ? [product.image] : [])}
                    posterUrl={product.image}
                    title={product.name}
                    price={product.price}
                    specs={createLuxurySpecs(index)}
                    onClick={() => openModal(product)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedProduct && (
        <FullScreenImageModal
          isOpen={modalOpen}
          onClose={closeModal}
          images={selectedProduct.images || (selectedProduct.image ? [selectedProduct.image] : [])}
          currentImageIndex={0}
          productName={selectedProduct.name}
          price={selectedProduct.price}
          description={selectedProduct.short_description}
          specs={createLuxurySpecs(displayProducts.findIndex(p => p.id === selectedProduct.id))}
          onAddToCart={() => {
            closeModal();
            router.push('/cart');
          }}
          onContactConsultation={() => {
            closeModal();
            router.push('/contact');
          }}
        />
      )}
    </div>
  );
}
