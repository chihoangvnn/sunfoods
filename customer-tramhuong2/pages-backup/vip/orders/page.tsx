import { getVipCustomerFromServerComponent } from '../../../../server/vipAuthServer';
import { getVipOrders } from '../../../../server/vipService';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}

function getStatusBadge(status: string) {
  const badges: Record<string, { text: string; class: string }> = {
    pending: { text: 'Chờ xử lý', class: 'bg-yellow-100 text-yellow-800' },
    confirmed: { text: 'Đã xác nhận', class: 'bg-blue-100 text-blue-800' },
    shipping: { text: 'Đang giao', class: 'bg-purple-100 text-purple-800' },
    delivered: { text: 'Đã giao', class: 'bg-green-100 text-green-800' },
    cancelled: { text: 'Đã hủy', class: 'bg-red-100 text-red-800' },
  };
  
  const badge = badges[status] || badges.pending;
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${badge.class}`}>
      {badge.text}
    </span>
  );
}

export default async function VipOrdersPage() {
  const customer = await getVipCustomerFromServerComponent();
  
  if (!customer) {
    redirect('/vip');
  }

  const { orders } = await getVipOrders(customer);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-green-700 to-green-600 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Đơn hàng của tôi</h1>
          <p className="text-green-100">Lịch sử đơn hàng và tiết kiệm VIP</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Chưa có đơn hàng</h2>
            <p className="text-gray-600 mb-6">
              Bạn chưa có đơn hàng nào. Bắt đầu mua sắm ngay!
            </p>
            <a
              href="/"
              className="inline-block px-6 py-3 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors"
            >
              Mua sắm ngay
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">
                        {formatVND(order.totalAmount)}
                      </h3>
                      {getStatusBadge(order.status)}
                    </div>
                    <p className="text-sm text-gray-600">
                      Ngày đặt: {new Date(order.createdAt!).toLocaleDateString('vi-VN')}
                    </p>
                    <p className="text-sm text-gray-600">
                      {order.customerName} - {order.customerPhone}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm text-gray-600 mb-1">Tiết kiệm VIP</p>
                    <p className="text-2xl font-bold text-green-600">
                      {order.vipDiscountFormatted}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-6 text-center">
          <a
            href="/vip"
            className="inline-block px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            ← Về Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
