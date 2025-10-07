import { getAffiliateFromServerComponent } from '../../../server/affiliateAuthServer';
import { getDashboardData } from '../../../server/affiliateService';
import DashboardClient from './DashboardClient';
import LoginModal from '@/components/LoginModal';
import DesktopLoginModal from '@/components/DesktopLoginModal';

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

export default async function AffiliateDashboardPage() {
  const affiliate = await getAffiliateFromServerComponent();
  
  if (!affiliate) {
    return <LoginRequired />;
  }

  const dashboardData = await getDashboardData(affiliate);

  return <DashboardClient initialData={dashboardData} />;
}
