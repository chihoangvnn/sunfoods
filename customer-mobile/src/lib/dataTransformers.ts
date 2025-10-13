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
 * Updated for SunFoods organic marketplace
 */
export const demoProducts: Product[] = [
  {
    id: 'demo-1',
    slug: 'rau-cai-xanh-organic',
    name: 'Rau Cải Xanh Organic',
    price: 45000,
    image: '/images/modern_e-commerce_ba_70f9ff6e.jpg',
    category_id: 'rau-cu',
    stock: 50,
    short_description: 'Rau cải xanh tươi ngon từ nông trại organic Đà Lạt',
    status: 'active',
    benefits: ['Giàu vitamin', 'Không hóa chất'],
    isNew: true,
    isTopseller: true
  },
  {
    id: 'demo-2',
    slug: 'tao-my-gala',
    name: 'Táo Mỹ Gala Premium',
    price: 120000,
    image: '/images/modern_e-commerce_ba_a5ed4b23.jpg',
    category_id: 'trai-cay-nhap',
    stock: 30,
    short_description: 'Táo Gala nhập khẩu trực tiếp từ Mỹ, giòn ngọt tự nhiên',
    status: 'active',
    benefits: ['Nhập khẩu chính hãng', 'Giòn ngọt'],
    isFreeshipping: true,
    isBestseller: true
  },
  {
    id: 'demo-3',
    slug: 'gao-lut-do-organic',
    name: 'Gạo Lứt Đỏ Organic',
    price: 65000,
    image: '/images/modern_e-commerce_ba_9f23a27c.jpg',
    category_id: 'thuc-pham-kho',
    stock: 100,
    short_description: 'Gạo lứt đỏ organic giàu chất xơ, tốt cho sức khỏe',
    status: 'active',
    benefits: ['Giàu chất xơ', 'Organic'],
    isNew: true,
    isFreeshipping: true
  },
  {
    id: 'demo-4',
    slug: 'bot-an-dam-organic',
    name: 'Bột Ăn Dặm Organic Cho Bé',
    price: 85000,
    image: '/images/modern_e-commerce_ba_70f9ff6e.jpg',
    category_id: 'an-dam-be',
    stock: 20,
    short_description: 'Bột ăn dặm organic an toàn cho bé từ 6 tháng tuổi',
    status: 'active',
    benefits: ['An toàn cho bé', 'Giàu dinh dưỡng'],
    isTopseller: true,
    isBestseller: true,
    isFreeshipping: true
  },
  {
    id: 'demo-5',
    slug: 'dau-duong-organic',
    name: 'Dầu Dưỡng Thể Organic',
    price: 280000,
    image: '/images/modern_e-commerce_ba_a5ed4b23.jpg',
    category_id: 'my-pham',
    stock: 15,
    short_description: 'Dầu dưỡng thể từ thiên nhiên, làm đẹp an toàn',
    status: 'active',
    benefits: ['Từ thiên nhiên', 'Dưỡng ẩm'],
    isTopseller: true,
    isFreeshipping: true
  },
  {
    id: 'demo-6',
    slug: 'thit-bo-tuoi',
    name: 'Thịt Bò Úc Tươi',
    price: 320000,
    image: '/images/modern_e-commerce_ba_9f23a27c.jpg',
    category_id: 'thuc-pham-tuoi',
    stock: 60,
    short_description: 'Thịt bò Úc tươi ngon, thu hoạch sáng nay',
    status: 'active',
    benefits: ['Tươi sáng nay', 'Chất lượng cao'],
    isNew: true
  },
  {
    id: 'demo-7',
    slug: 'nuoc-rua-chen-eco',
    name: 'Nước Rửa Chén Eco Friendly',
    price: 55000,
    image: '/images/modern_e-commerce_ba_70f9ff6e.jpg',
    category_id: 'gia-dung',
    stock: 80,
    short_description: 'Nước rửa chén sinh học, thân thiện môi trường',
    status: 'active',
    benefits: ['Sinh học', 'An toàn'],
    isFreeshipping: true
  }
];

export const demoCategories: Category[] = [
  { id: 'all', name: 'Tất cả' },
  { id: 'rau-cu', name: 'Rau Củ Quả' },
  { id: 'trai-cay-nhap', name: 'Trái Cây Nhập Khẩu' },
  { id: 'my-pham', name: 'Mỹ Phẩm' },
  { id: 'thuc-pham-kho', name: 'Thực Phẩm Khô' },
  { id: 'an-dam-be', name: 'Ăn Dặm Cho Bé' },
  { id: 'gia-dung', name: 'Gia Dụng' },
  { id: 'thuc-pham-tuoi', name: 'Thực Phẩm Tươi' }
];