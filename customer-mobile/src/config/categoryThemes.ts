export interface CategoryTheme {
  id: string;
  name: string;
  icon: string;
  
  // Color palette
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  
  // Hero section
  heroImages: string[];
  heroTagline: string;
  ctaText: string;
  ctaColor: string;
  
  // Typography & UI
  textPrimary: string;
  textSecondary: string;
  borderColor: string;
  hoverColor: string;
  
  // Special effects
  pattern?: string;
  gradient?: string;
}

export const categoryThemes: Record<string, CategoryTheme> = {
  'default': {
    id: 'default',
    name: 'Tất Cả Sản Phẩm',
    icon: '🌿',
    primary: '#1F7A4D',      // sunrise-leaf
    secondary: '#FFC145',     // warm-sun
    accent: '#90EE90',
    background: '#FFFFFF',
    heroImages: [
      '/images/organic-farm-1.jpg',
      '/images/organic-farm-2.jpg',
      '/images/organic-farm-3.jpg'
    ],
    heroTagline: 'Thực Phẩm Organic Tươi Mỗi Ngày',
    ctaText: 'Mua Ngay',
    ctaColor: '#1F7A4D',
    textPrimary: '#1F7A4D',
    textSecondary: '#6B7280',
    borderColor: '#1F7A4D',
    hoverColor: '#FFC145',
    gradient: 'from-white to-green-50'
  },
  
  'an-dam-be': {
    id: 'an-dam-be',
    name: 'Ăn Dặm Cho Bé',
    icon: '👶',
    primary: '#FFB6C1',       // baby pink
    secondary: '#B0E0E6',     // powder blue
    accent: '#FFE4E1',        // misty rose
    background: '#FFF5F7',
    heroImages: [
      '/images/baby-food-1.jpg',
      '/images/baby-food-2.jpg',
      '/images/baby-food-3.jpg'
    ],
    heroTagline: '🍼 Dinh Dưỡng An Toàn Cho Bé Yêu',
    ctaText: 'Khám Phá Ngay',
    ctaColor: '#FFB6C1',
    textPrimary: '#DB7093',   // pale violet red
    textSecondary: '#9CA3AF',
    borderColor: '#FFB6C1',
    hoverColor: '#FF69B4',
    gradient: 'from-pink-50 to-blue-50',
    pattern: 'baby-pattern'
  },
  
  'rau-cu': {
    id: 'rau-cu',
    name: 'Rau Củ Quả',
    icon: '🥬',
    primary: '#1F7A4D',       // sunrise-leaf
    secondary: '#90EE90',     // light green
    accent: '#7CFC00',        // lawn green
    background: '#F0FFF0',
    heroImages: [
      '/images/vegetables-1.jpg',
      '/images/vegetables-2.jpg',
      '/images/vegetables-3.jpg'
    ],
    heroTagline: '🥬 Tươi Từ Vườn Đến Bàn Ăn',
    ctaText: 'Xem Ngay',
    ctaColor: '#1F7A4D',
    textPrimary: '#1F7A4D',
    textSecondary: '#6B7280',
    borderColor: '#1F7A4D',
    hoverColor: '#90EE90',
    gradient: 'from-green-50 to-emerald-50',
    pattern: 'leaf-pattern'
  },
  
  'trai-cay-nhap': {
    id: 'trai-cay-nhap',
    name: 'Trái Cây Nhập Khẩu',
    icon: '🍎',
    primary: '#9370DB',       // medium purple
    secondary: '#FFD700',     // gold
    accent: '#DDA0DD',        // plum
    background: '#F8F4FF',
    heroImages: [
      '/images/imported-fruits-1.jpg',
      '/images/imported-fruits-2.jpg',
      '/images/imported-fruits-3.jpg'
    ],
    heroTagline: '✈️ Hương Vị Thế Giới Từ 5 Châu',
    ctaText: 'Khám Phá Thế Giới',
    ctaColor: '#9370DB',
    textPrimary: '#6A0DAD',   // dark purple
    textSecondary: '#6B7280',
    borderColor: '#9370DB',
    hoverColor: '#FFD700',
    gradient: 'from-purple-50 to-amber-50',
    pattern: 'world-map'
  },
  
  'my-pham': {
    id: 'my-pham',
    name: 'Mỹ Phẩm',
    icon: '💄',
    primary: '#F8C8DC',       // pink lavender
    secondary: '#DDA0DD',     // plum
    accent: '#FFE4E1',        // misty rose
    background: '#FFF5F8',
    heroImages: [
      '/images/cosmetics-1.jpg',
      '/images/cosmetics-2.jpg',
      '/images/cosmetics-3.jpg'
    ],
    heroTagline: '💅 Vẻ Đẹp Từ Thiên Nhiên Thuần Khiết',
    ctaText: 'Làm Đẹp Ngay',
    ctaColor: '#DB7093',
    textPrimary: '#C71585',   // medium violet red
    textSecondary: '#9CA3AF',
    borderColor: '#F8C8DC',
    hoverColor: '#DDA0DD',
    gradient: 'from-rose-50 to-pink-50',
    pattern: 'floral-pattern'
  },
  
  'thuc-pham-kho': {
    id: 'thuc-pham-kho',
    name: 'Thực Phẩm Khô',
    icon: '🌾',
    primary: '#D2691E',       // chocolate
    secondary: '#F4A460',     // sandy brown
    accent: '#DEB887',        // burlywood
    background: '#FFF8DC',    // cornsilk
    heroImages: [
      '/images/pantry-1.jpg',
      '/images/pantry-2.jpg',
      '/images/pantry-3.jpg'
    ],
    heroTagline: '🌾 Kho Báu Dinh Dưỡng Cho Gia Đình',
    ctaText: 'Khám Phá Kho',
    ctaColor: '#D2691E',
    textPrimary: '#8B4513',   // saddle brown
    textSecondary: '#6B7280',
    borderColor: '#D2691E',
    hoverColor: '#F4A460',
    gradient: 'from-amber-50 to-orange-50',
    pattern: 'grain-texture'
  },
  
  'gia-dung': {
    id: 'gia-dung',
    name: 'Gia Dụng',
    icon: '🏠',
    primary: '#20B2AA',       // light sea green
    secondary: '#87CEEB',     // sky blue
    accent: '#B0E0E6',        // powder blue
    background: '#F0F8FF',    // alice blue
    heroImages: [
      '/images/household-1.jpg',
      '/images/household-2.jpg',
      '/images/household-3.jpg'
    ],
    heroTagline: '🏡 Nhà Xanh, Sống Sạch Mỗi Ngày',
    ctaText: 'Xây Ngôi Nhà Xanh',
    ctaColor: '#20B2AA',
    textPrimary: '#008B8B',   // dark cyan
    textSecondary: '#6B7280',
    borderColor: '#20B2AA',
    hoverColor: '#87CEEB',
    gradient: 'from-cyan-50 to-sky-50',
    pattern: 'eco-pattern'
  },
  
  'thuc-pham-tuoi': {
    id: 'thuc-pham-tuoi',
    name: 'Thực Phẩm Tươi',
    icon: '🥩',
    primary: '#FF6347',       // tomato red
    secondary: '#FF8C00',     // dark orange
    accent: '#FFA07A',        // light salmon
    background: '#FFF5EE',    // seashell
    heroImages: [
      '/images/fresh-food-1.jpg',
      '/images/fresh-food-2.jpg',
      '/images/fresh-food-3.jpg'
    ],
    heroTagline: '🥩 Tươi Thu Hoạch Sáng Nay',
    ctaText: 'Mua Tươi Ngay',
    ctaColor: '#FF6347',
    textPrimary: '#DC143C',   // crimson
    textSecondary: '#6B7280',
    borderColor: '#FF6347',
    hoverColor: '#FF8C00',
    gradient: 'from-red-50 to-orange-50',
    pattern: 'fresh-badge'
  }
};

export const getCategoryTheme = (categoryId: string): CategoryTheme => {
  return categoryThemes[categoryId] || categoryThemes.default;
};
