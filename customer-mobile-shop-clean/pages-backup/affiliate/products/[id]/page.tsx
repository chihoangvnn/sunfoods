import { cookies } from 'next/headers';
import { getAffiliateFromServerComponent } from '../../../../../server/affiliateAuthServer';
import { getProductDetailData } from '../../../../../server/affiliateService';
import ProductDetailClient from './ProductDetailClient';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

function LoginRequired() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Vui lòng đăng nhập</h1>
        <p className="text-gray-600 mb-8">Bạn cần đăng nhập để truy cập Cổng CTV</p>
        <a
          href="/"
          className="inline-block px-6 py-3 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors"
        >
          Về trang chủ để đăng nhập
        </a>
      </div>
    </div>
  );
}

function ProductNotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy sản phẩm</h1>
        <p className="text-gray-600 mb-8">Sản phẩm này không tồn tại hoặc đã bị xóa</p>
        <a
          href="/affiliate/products"
          className="inline-block px-6 py-3 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors"
        >
          Quay lại danh sách sản phẩm
        </a>
      </div>
    </div>
  );
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const affiliate = await getAffiliateFromServerComponent();
  
  if (!affiliate) {
    return <LoginRequired />;
  }

  const { id } = await params;

  try {
    const productData = await getProductDetailData(affiliate, id);
    
    return (
      <ProductDetailClient 
        initialData={productData}
        affiliateCode={affiliate.affiliateCode}
      />
    );
  } catch (error) {
    console.error('Failed to load product:', error);
    return <ProductNotFound />;
  }
}
