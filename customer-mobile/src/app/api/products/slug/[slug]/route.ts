import { NextRequest, NextResponse } from 'next/server';

interface ProductData {
  id: string;
  slug: string;
  name: string;
  price: number;
  originalPrice: number;
  image: string;
  images: string[];
  category_id: string;
  stock: number;
  short_description: string;
  description: string;
  status: string;
  benefits: string[];
  isNew?: boolean;
  isTopseller?: boolean;
  isFreeshipping?: boolean;
  isBestseller?: boolean;
  salesCount: number;
  rating: number;
  reviewCount: number;
  flashSale?: {
    startTime: string;
    endTime: string;
    discountPercent: number;
  };
  delivery: {
    from: string;
    to: string;
  };
  vouchers?: Array<{
    code: string;
    discount?: number;
    minPurchase?: number;
    type?: string;
  }>;
  returnPolicy: string;
  paymentOptions: string[];
}

// Demo organic food products
const DEMO_PRODUCTS: Record<string, ProductData> = {
  'rau-cai-xanh-organic': {
    id: 'demo-1',
    slug: 'rau-cai-xanh-organic',
    name: 'Rau Cải Xanh Organic',
    price: 25000,
    originalPrice: 35000,
    image: '/images/organic-farm-1.jpg',
    images: ['/images/organic-farm-1.jpg', '/images/organic-farm-2.jpg', '/images/organic-farm-3.jpg'],
    category_id: 'vegetables',
    stock: 50,
    short_description: 'Rau cải xanh hữu cơ tươi, thu hoạch sáng nay',
    description: 'Rau cải xanh hữu cơ được trồng tại farm Đà Lạt theo tiêu chuẩn VietGAP, hoàn toàn không sử dụng hóa chất, thuốc trừ sâu. Thu hoạch mỗi sáng để đảm bảo độ tươi ngon tối đa. Giàu vitamin A, C, K và chất xơ, tốt cho sức khỏe tim mạch và hệ tiêu hóa. Sản phẩm được kiểm định nghiêm ngặt trước khi giao đến tay khách hàng.',
    status: 'active',
    benefits: [
      'Giàu vitamin A, C, K - Tốt cho thị lực và miễn dịch',
      'Chất xơ cao - Hỗ trợ tiêu hóa',
      'Chứng nhận Organic VietGAP',
      'Thu hoạch sáng nay - Tươi 100%',
      'Không hóa chất, không thuốc trừ sâu'
    ],
    isNew: true,
    isTopseller: true,
    isFreeshipping: true,
    salesCount: 450,
    rating: 4.8,
    reviewCount: 120,
    delivery: {
      from: new Date().toISOString(),
      to: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    vouchers: [
      { code: 'FRESH10', discount: 10000, minPurchase: 50000, type: 'discount' },
      { code: 'FREESHIP', type: 'freeship' }
    ],
    returnPolicy: 'Đổi trả miễn phí trong 24h nếu sản phẩm không tươi',
    paymentOptions: ['COD - Thanh toán khi nhận hàng', 'Chuyển khoản ngân hàng', 'Ví Momo', 'ZaloPay']
  },
  'trai-cay-nhiet-doi-mix': {
    id: 'demo-2',
    slug: 'trai-cay-nhiet-doi-mix',
    name: 'Trái Cây Nhiệt Đới Mix Organic',
    price: 85000,
    originalPrice: 120000,
    image: '/images/organic-farm-2.jpg',
    images: ['/images/organic-farm-2.jpg', '/images/organic-farm-1.jpg'],
    category_id: 'fruits',
    stock: 30,
    short_description: 'Hộp trái cây hữu cơ: xoài, ổi, bưởi - Vitamin C tự nhiên',
    description: 'Hộp trái cây organic mix gồm xoài Cát Hòa Lộc, ổi nữ hoàng, và bưởi da xanh. Tất cả đều được trồng theo quy trình hữu cơ tại các farm chuyên nghiệp ở Tiền Giang và Đồng Tháp. Trái cây được chọn lọc kỹ càng, đảm bảo độ chín vừa phải, ngọt tự nhiên.',
    status: 'active',
    benefits: [
      'Vitamin C cao - Tăng cường miễn dịch',
      '100% hữu cơ - An toàn tuyệt đối',
      'Trái cây farm Việt Nam - Hỗ trợ nông dân',
      'Ngọt tự nhiên - Không hóa chất bảo quản',
      'Giàu chất chống oxy hóa'
    ],
    isFreeshipping: true,
    isBestseller: true,
    salesCount: 380,
    rating: 4.9,
    reviewCount: 85,
    delivery: {
      from: new Date().toISOString(),
      to: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    vouchers: [
      { code: 'FRUIT20', discount: 20000, minPurchase: 100000, type: 'discount' }
    ],
    returnPolicy: 'Hoàn tiền 100% nếu trái cây không ngọt hoặc không tươi',
    paymentOptions: ['COD - Thanh toán khi nhận hàng', 'Chuyển khoản', 'Ví điện tử']
  }
};

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    
    // Check if demo product exists
    const demoProduct = DEMO_PRODUCTS[slug];
    if (demoProduct) {
      return NextResponse.json(demoProduct);
    }
    
    // If not found in demo, try fetching from backend
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';
    const response = await fetch(`${backendUrl}/api/products/slug/${slug}`, {
      next: { revalidate: 60 }
    });
    
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(await response.json());
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
