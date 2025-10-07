'use client'

import { useState } from 'react';
import { 
  DollarSign, 
  ShoppingCart,
  TrendingUp,
  Package
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LoginModal from '@/components/LoginModal';
import DesktopLoginModal from '@/components/DesktopLoginModal';
import { useResponsive } from '@/hooks/use-mobile';

interface DashboardClientProps {
  initialData: {
    affiliate: {
      name: string;
      affiliateCode: string;
    };
    dashboard: {
      metrics: {
        totalEarnings: number;
        paidEarnings: number;
        pendingEarnings: number;
        totalReferrals: number;
        totalRevenue: number;
        conversionRate: number;
        revenueGrowth: number;
      };
      quickStats: {
        ordersThisMonth: number;
        revenueThisMonth: number;
        averageOrderValue: number;
      };
      recentActivity?: any[];
    };
    stats?: {
      dailyStats?: any[];
      topProducts?: any[];
    };
  };
}

function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}

function formatCompactVND(amount: number): string {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(0)}K`;
  }
  return formatVND(amount);
}

export default function DashboardClient({ initialData }: DashboardClientProps) {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { isMobile } = useResponsive();

  const { affiliate, dashboard, stats } = initialData;

  return (
    <>
      <div className="space-y-6">
        {/* Header - Compact */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Xin chào, <span className="font-semibold">{affiliate.name}</span>!
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Mã CTV</p>
            <p className="text-lg font-bold text-green-600">{affiliate.affiliateCode}</p>
          </div>
        </div>

        {/* Top Metrics - Compact Horizontal */}
        <Card className="border-none shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-around gap-4">
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1">Tổng thu nhập</p>
                <p className="text-3xl font-bold text-green-600">
                  {formatVND(dashboard.metrics.totalEarnings)}
                </p>
              </div>
              <div className="h-12 w-px bg-gray-200"></div>
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1">Tổng đơn</p>
                <p className="text-3xl font-bold text-gray-900">
                  {dashboard.metrics.totalReferrals}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatCompactVND(dashboard.metrics.totalRevenue)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Stats - Compact Single Row */}
        <Card className="border-none shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="h-4 w-4 text-green-600" />
              Tháng này
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-around gap-4">
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1">Đơn hàng</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboard.quickStats.ordersThisMonth}
                </p>
              </div>
              <div className="h-10 w-px bg-gray-200"></div>
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1">Doanh thu</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatVND(dashboard.quickStats.revenueThisMonth)}
                </p>
              </div>
              <div className="h-10 w-px bg-gray-200"></div>
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1">TB/đơn</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCompactVND(dashboard.quickStats.averageOrderValue)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Trend Chart */}
        {stats && stats.dailyStats && stats.dailyStats.length > 0 && (
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-4 w-4 text-green-600" />
                Xu hướng doanh thu
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48 flex items-end justify-between gap-1">
                {stats.dailyStats.slice(-15).map((day: any, index: number) => {
                  const maxRevenue = Math.max(...stats.dailyStats!.map((d: any) => d.revenue || 0), 1);
                  const height = maxRevenue > 0 ? ((day.revenue || 0) / maxRevenue) * 100 : 0;
                  
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center group">
                      <div className="relative w-full">
                        <div
                          className="w-full bg-gradient-to-t from-green-600 to-green-400 rounded-t transition-all hover:from-green-700 hover:to-green-500"
                          style={{ height: `${height}%`, minHeight: '8px' }}
                        />
                        <div className="hidden group-hover:block absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                          {formatVND(day.revenue || 0)}
                        </div>
                      </div>
                      <span className="text-xs text-gray-500 mt-2">
                        {new Date(day.date).getDate()}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Top Products */}
        {stats && stats.topProducts && stats.topProducts.length > 0 && (
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Package className="h-4 w-4 text-green-600" />
                Top sản phẩm
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {stats.topProducts.slice(0, 5).map((product: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-green-600">#{index + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate">{product.productName || product.name}</p>
                        <p className="text-xs text-gray-500">{product.sales || product.totalSales} đơn</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600 text-sm">{formatCompactVND(product.revenue || product.totalRevenue)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Orders - Compact */}
        {dashboard.recentActivity && dashboard.recentActivity.length > 0 && (
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ShoppingCart className="h-4 w-4 text-green-600" />
                Đơn hàng gần đây
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {dashboard.recentActivity.slice(0, 5).map((activity: any, index: number) => (
                  <div 
                    key={index}
                    className="p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-gray-900 text-sm">{activity.customerName || 'Khách hàng'}</p>
                      <p className="font-bold text-green-600 text-sm">
                        {formatVND(activity.commission || activity.amount)}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-600 truncate flex-1">{activity.productName || activity.description}</p>
                      <p className="text-xs text-gray-500 ml-2">
                        {new Date(activity.createdAt).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {(!dashboard.recentActivity || dashboard.recentActivity.length === 0) && (
          <Card className="border-none shadow-md">
            <CardContent className="p-12 text-center">
              <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Chưa có hoạt động
              </h3>
              <p className="text-gray-600 mb-4">
                Tạo đơn hàng để bắt đầu kiếm hoa hồng
              </p>
              <a
                href="/affiliate/quick-order"
                className="inline-block px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Tạo đơn ngay
              </a>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Login Modal */}
      {isMobile ? (
        <LoginModal 
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          hideGuestOption={true}
        />
      ) : (
        <DesktopLoginModal 
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          hideGuestOption={true}
        />
      )}
    </>
  );
}
