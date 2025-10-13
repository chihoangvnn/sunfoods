import { BackendProduct, BackendCategory, Product, Category } from '@/types/api';
import { slugify } from './slugify';

/**
 * Transform backend product to UI-compatible product
 */
export function transformProduct(backendProduct: BackendProduct): Product {
  return {
    id: backendProduct.id,
    slug: backendProduct.slug || slugify(backendProduct.name),
    name: backendProduct.name,
    price: parseFloat(backendProduct.price) || 0,
    image: backendProduct.image || backendProduct.images?.[0] || undefined,
    media: backendProduct.image || backendProduct.images?.[0] || undefined,
    category_id: backendProduct.categoryId || 'uncategorized',
    stock: backendProduct.stock || 0,
    short_description: backendProduct.shortDescription || backendProduct.description || undefined,
    status: backendProduct.status || 'active',
    benefits: backendProduct.benefits?.length > 0 ? backendProduct.benefits : undefined,
    // Badge properties from backend
    isNew: backendProduct.isNew || false,
    isTopseller: backendProduct.isTopseller || false,
    isFreeshipping: backendProduct.isFreeshipping || false,
    isBestseller: backendProduct.isBestseller || false,
  };
}

/**
 * Transform backend category to UI-compatible category
 */
export function transformCategory(backendCategory: BackendCategory): Category {
  return {
    id: backendCategory.id,
    name: backendCategory.name,
  };
}

/**
 * Transform array of backend products
 */
export function transformProducts(backendProducts: BackendProduct[]): Product[] {
  return backendProducts.map(transformProduct);
}

/**
 * Transform array of backend categories
 */
export function transformCategories(backendCategories: BackendCategory[]): Category[] {
  return backendCategories.map(transformCategory);
}

/**
 * Fallback/demo data for when backend is unavailable
 */
export const demoProducts: Product[] = [
  {
    id: 'demo-1',
    slug: 'nhang-tram-huong-cao-cap',
    name: 'Nhang Trầm Hương Cao Cấp',
    price: 150000,
    image: '/images/modern_e-commerce_ba_70f9ff6e.jpg',
    category_id: 'incense',
    stock: 50,
    short_description: 'Nhang trầm hương thượng hạng từ Huế',
    status: 'active',
    benefits: ['Thanh tịnh tâm hồn', 'Thơm dịu nhẹ'],
    isNew: true,
    isTopseller: true
  },
  {
    id: 'demo-2',
    slug: 'nhang-sandalwood-premium',
    name: 'Nhang Sandalwood Premium',
    price: 200000,
    image: '/images/modern_e-commerce_ba_a5ed4b23.jpg',
    category_id: 'incense',
    stock: 30,
    short_description: 'Nhang gỗ đàn hương nguyên chất',
    status: 'active',
    benefits: ['Thư giãn', 'Thiền định'],
    isFreeshipping: true,
    isBestseller: true
  },
  {
    id: 'demo-3',
    slug: 'nhang-que-truyen-thong',
    name: 'Nhang Que Truyền Thống',
    price: 80000,
    image: '/images/modern_e-commerce_ba_9f23a27c.jpg',
    category_id: 'incense',
    stock: 100,
    short_description: 'Nhang que làm thủ công theo phương pháp cổ truyền',
    status: 'active',
    benefits: ['Tôn giáo', 'Gia đình'],
    isNew: true,
    isFreeshipping: true
  },
  {
    id: 'demo-4',
    slug: 'bo-nhang-ngu-hanh',
    name: 'Bộ Nhang Ngũ Hành',
    price: 350000,
    image: '/images/modern_e-commerce_ba_70f9ff6e.jpg',
    category_id: 'incense',
    stock: 20,
    short_description: 'Bộ nhang 5 loại theo ngũ hành kim, mộc, thủy, hỏa, thổ',
    status: 'active',
    benefits: ['Cân bằng năng lượng', 'Phong thủy'],
    isTopseller: true,
    isBestseller: true,
    isFreeshipping: true
  },
  {
    id: 'demo-5',
    slug: 'nhang-tram-huong-dac-biet',
    name: 'Nhang Trầm Hương Đặc Biệt',
    price: 280000,
    image: '/images/modern_e-commerce_ba_a5ed4b23.jpg',
    category_id: 'premium',
    stock: 15,
    short_description: 'Nhang trầm hương cao cấp nhập khẩu từ Ấn Độ',
    status: 'active',
    benefits: ['Thiền định sâu', 'Thư giãn tinh thần'],
    isTopseller: true,
    isFreeshipping: true
  },
  {
    id: 'demo-6',
    slug: 'nhang-cung-to-tien',
    name: 'Nhang Cúng Tổ Tiên',
    price: 120000,
    image: '/images/modern_e-commerce_ba_9f23a27c.jpg',
    category_id: 'traditional',
    stock: 60,
    short_description: 'Nhang cúng dành riêng cho lễ cúng tổ tiên',
    status: 'active',
    benefits: ['Tôn giáo', 'Linh thiêng'],
    isNew: true
  },
  {
    id: 'bracelet-1',
    slug: 'vong-tay-tram-huong-aaa-108-hat-12mm',
    name: 'Vòng Tay Trầm Hương AAA 108 Hạt 12mm',
    price: 12500000,
    image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80',
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80',
      'https://images.unsplash.com/photo-1596944924591-4b8c162f67b5?w=800&q=80',
      'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800&q=80'
    ],
    category_id: 'chuoi-hat-tram-huong',
    stock: 5,
    short_description: 'Vòng tay trầm hương cao cấp AAA, 108 hạt 12mm, mạch hương nồng đượm, sang trọng quý phái',
    status: 'active',
    benefits: ['Hương thơm nồng nàn', 'Giá trị sưu tầm cao', 'Phong thủy tài lộc'],
    specifications: { material: 'Trầm nước', beadSize: '12mm' },
    grade: 'AAA' as const,
    beadCount: 108,
    beadSize: '12mm',
    hasCertificate: true,
    isGiftReady: true,
    giftCategory: 'male' as const,
    availableSizes: ['M', 'L', 'XL'],
    isNew: true,
    isTopseller: true,
    isBestseller: true
  },
  {
    id: 'bracelet-2',
    slug: 'vong-tay-tram-huong-aa-phong-thuy-108-hat',
    name: 'Vòng Tay Trầm Hương AA+ Phong Thủy 108 Hạt',
    price: 8800000,
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80',
      'https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?w=800&q=80',
      'https://images.unsplash.com/photo-1611652022419-a9419f74343a?w=800&q=80',
      'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=800&q=80'
    ],
    category_id: 'chuoi-hat-tram-huong',
    stock: 8,
    short_description: 'Vòng tay trầm hương AA+ chuẩn phong thủy, 108 hạt 10mm, giúp tăng tài vận, bình an',
    status: 'active',
    benefits: ['Tăng tài lộc', 'Bình an may mắn', 'Tĩnh tâm thiền định'],
    specifications: { material: 'Trầm bông', beadSize: '10mm' },
    grade: 'AA+' as const,
    beadCount: 108,
    beadSize: '10mm',
    hasCertificate: true,
    isGiftReady: true,
    giftCategory: 'feng-shui' as const,
    availableSizes: ['S', 'M', 'L'],
    isTopseller: true,
    isFreeshipping: true
  },
  {
    id: 'bracelet-3',
    slug: 'vong-tay-tram-huong-a-nu-cao-cap-8mm',
    name: 'Vòng Tay Trầm Hương A+ Nữ Cao Cấp 8mm',
    price: 5800000,
    image: 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=800&q=80',
      'https://images.unsplash.com/photo-1583292650898-7d22cd27ca6f?w=800&q=80',
      'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=800&q=80',
      'https://images.unsplash.com/photo-1543508905-f56a6e57b5ca?w=800&q=80'
    ],
    category_id: 'chuoi-hat-tram-huong',
    stock: 12,
    short_description: 'Vòng tay trầm hương A+ dành cho nữ, 108 hạt 8mm nhỏ xinh, thanh lịch tao nhã',
    status: 'active',
    benefits: ['Thanh lịch sang trọng', 'Hương nhẹ nhàng', 'Quà tặng ý nghĩa'],
    specifications: { material: 'Trầm bông', beadSize: '8mm' },
    grade: 'A+' as const,
    beadCount: 108,
    beadSize: '8mm',
    hasCertificate: false,
    isGiftReady: true,
    giftCategory: 'female' as const,
    availableSizes: ['S', 'M'],
    isNew: true,
    isFreeshipping: true
  },
  {
    id: 'bracelet-4',
    slug: 'vong-tay-tram-huong-doi-cap-aa-21-hat',
    name: 'Vòng Tay Trầm Hương Đôi AA+ 21 Hạt',
    price: 10500000,
    image: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800&q=80',
      'https://images.unsplash.com/photo-1611652022419-a9419f74343a?w=800&q=80',
      'https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?w=800&q=80',
      'https://images.unsplash.com/photo-1596944924591-4b8c162f67b5?w=800&q=80'
    ],
    category_id: 'chuoi-hat-tram-huong',
    stock: 6,
    short_description: 'Cặp vòng tay trầm hương AA+ 21 hạt 10mm dành cho đôi lứa, gắn kết tình yêu bền lâu',
    status: 'active',
    benefits: ['Tình yêu bền vững', 'Hạnh phúc viên mãn', 'Quà cưới ý nghĩa'],
    specifications: { material: 'Trầm nước', beadSize: '10mm' },
    grade: 'AA+' as const,
    beadCount: 21,
    beadSize: '10mm',
    hasCertificate: true,
    isGiftReady: true,
    giftCategory: 'couple' as const,
    availableSizes: ['M', 'L'],
    isBestseller: true,
    isFreeshipping: true
  },
  {
    id: 'bracelet-5',
    slug: 'vong-tay-tram-huong-pho-thong-8mm-108-hat',
    name: 'Vòng Tay Trầm Hương A 8mm 108 Hạt',
    price: 3200000,
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80',
      'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80',
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80',
      'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=800&q=80'
    ],
    category_id: 'chuoi-hat-tram-huong',
    stock: 25,
    short_description: 'Vòng tay trầm hương A phổ thông 108 hạt 8mm, phù hợp người mới bắt đầu sưu tầm',
    status: 'active',
    benefits: ['Giá cả phải chăng', 'Chất lượng tốt', 'Phù hợp mọi lứa tuổi'],
    specifications: { material: 'Trầm tạp', beadSize: '8mm' },
    grade: 'A' as const,
    beadCount: 108,
    beadSize: '8mm',
    hasCertificate: false,
    isGiftReady: false,
    availableSizes: ['S', 'M', 'L'],
    isNew: true
  },
  {
    id: 'bracelet-6',
    slug: 'vong-tay-tram-huong-a-18-hat-10mm',
    name: 'Vòng Tay Trầm Hương A+ 18 Hạt 10mm',
    price: 4500000,
    image: 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=800&q=80',
      'https://images.unsplash.com/photo-1583292650898-7d22cd27ca6f?w=800&q=80',
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80',
      'https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?w=800&q=80'
    ],
    category_id: 'chuoi-hat-tram-huong',
    stock: 18,
    short_description: 'Vòng tay trầm hương A+ 18 hạt 10mm, mẫu đơn giản thanh lịch cho đời thường',
    status: 'active',
    benefits: ['Thiết kế tối giản', 'Dễ phối đồ', 'Hương nhẹ dễ chịu'],
    specifications: { material: 'Trầm bông', beadSize: '10mm' },
    grade: 'A+' as const,
    beadCount: 18,
    beadSize: '10mm',
    hasCertificate: false,
    isGiftReady: false,
    availableSizes: ['S', 'M', 'L', 'XL'],
    isFreeshipping: true
  }
];

export const demoCategories: Category[] = [
  { id: 'all', name: 'Tất cả' },
  { id: 'incense', name: 'Nhang Trầm' },
  { id: 'premium', name: 'Cao Cấp' },
  { id: 'traditional', name: 'Truyền Thống' },
  { id: 'gift', name: 'Quà Tặng' }
];