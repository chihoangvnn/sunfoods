import { DollarSign, TrendingUp, Package, Car } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}

export default function DriverEarningsPage() {
  const mockEarnings = {
    totalEarnings: 2500000,
    todayEarnings: 350000,
    completedTrips: 45,
    rating: 4.8,
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Thu nhập</h1>
        <p className="text-gray-600 mt-1">Theo dõi thu nhập và thống kê của bạn</p>
      </div>

      {/* Summary Stats */}
      <Card className="border-none shadow-md">
        <CardContent className="p-4">
          <div className="flex items-center justify-around gap-4">
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Tổng thu nhập</p>
              <p className="text-3xl font-bold text-green-600">
                {formatVND(mockEarnings.totalEarnings)}
              </p>
            </div>
            <div className="h-12 w-px bg-gray-200"></div>
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Hôm nay</p>
              <p className="text-3xl font-bold text-blue-600">
                {formatVND(mockEarnings.todayEarnings)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Stats */}
      <Card className="border-none shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-600" />
            Thống kê
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-around gap-4">
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Chuyến đi</p>
              <p className="text-2xl font-bold text-gray-900">
                {mockEarnings.completedTrips}
              </p>
            </div>
            <div className="h-10 w-px bg-gray-200"></div>
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Đánh giá</p>
              <p className="text-2xl font-bold text-yellow-600">
                {mockEarnings.rating} ⭐
              </p>
            </div>
            <div className="h-10 w-px bg-gray-200"></div>
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">TB/chuyến</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatVND(Math.round(mockEarnings.totalEarnings / mockEarnings.completedTrips))}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Coming Soon */}
      <Card className="border-none shadow-md">
        <CardContent className="p-12 text-center">
          <DollarSign className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Tính năng đang phát triển
          </h3>
          <p className="text-gray-600">
            Biểu đồ thu nhập chi tiết và lịch sử giao dịch sẽ sớm ra mắt
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
