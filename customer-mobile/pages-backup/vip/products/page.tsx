import { getVipCustomerFromServerComponent } from '../../../../server/vipAuthServer';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function VipProductsPage() {
  const customer = await getVipCustomerFromServerComponent();
  
  if (!customer) {
    redirect('/vip');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-green-700 to-green-600 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Sản phẩm VIP</h1>
          <p className="text-green-100">Sản phẩm độc quyền dành cho khách VIP</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-6xl mb-4">🎁</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Sắp ra mắt!</h2>
          <p className="text-gray-600 mb-6">
            Sản phẩm VIP độc quyền đang được chuẩn bị. Quay lại sau nhé!
          </p>
          <a
            href="/vip"
            className="inline-block px-6 py-3 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors"
          >
            Về Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
