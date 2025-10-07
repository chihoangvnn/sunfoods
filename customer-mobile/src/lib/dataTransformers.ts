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
  }
];

export const demoCategories: Category[] = [
  { id: 'all', name: 'Tất cả' },
  { id: 'incense', name: 'Nhang Trầm' },
  { id: 'premium', name: 'Cao Cấp' },
  { id: 'traditional', name: 'Truyền Thống' },
  { id: 'gift', name: 'Quà Tặng' }
];