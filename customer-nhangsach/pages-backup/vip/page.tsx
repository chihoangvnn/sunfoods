import { getVipCustomerFromServerComponent } from '../../../server/vipAuthServer';
import { getDashboardData } from '../../../server/vipService';
import VipDashboardClient from './VipDashboardClient';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

function LoginRequired() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">💎</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Cổng VIP - Chỉ dành cho Khách VIP</h1>
        <p className="text-gray-600 mb-2">
          Bạn cần đăng nhập với tài khoản VIP (Bạc, Vàng, Kim Cương) để truy cập khu vực này.
        </p>
        <p className="text-sm text-gray-500 mb-8">
          Chưa là thành viên VIP? Mua sắm ngay để thăng hạng!
        </p>
        <a
          href="/"
          className="inline-block px-6 py-3 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors"
        >
          Về trang chủ
        </a>
      </div>
    </div>
  );
}

export default async function VipPortalPage() {
  const customer = await getVipCustomerFromServerComponent();
  
  if (!customer) {
    return <LoginRequired />;
  }

  const dashboardData = await getDashboardData(customer);

  return <VipDashboardClient initialData={dashboardData} customer={customer} />;
}
