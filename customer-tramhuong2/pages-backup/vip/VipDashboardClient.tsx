'use client'

import { useState } from 'react';
import { 
  DollarSign, 
  ShoppingCart,
  TrendingUp,
  Package,
  Crown,
  Sparkles
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Customer } from '../../../shared/schema';

interface VipDashboardClientProps {
  initialData: {
    profile: {
      id: string;
      name: string;
      email: string | null;
      phone: string;
      membershipTier: string;
      totalSpent: number;
      totalSpentFormatted: string;
      joinDate: Date | null;
    };
    tierInfo: {
      current: {
        tier: string;
        name: string;
        discount: number;
        benefits: string[];
        icon: string;
      };
      next: {
        tier: string;
        name: string;
        discount: number;
        benefits: string[];
        icon: string;
      } | null;
      progressToNextTier: number;
      remainingToNextTier: number;
    };
    stats: {
      totalOrders: number;
      completedOrders: number;
      totalSavings: number;
      totalSavingsFormatted: string;
      averageOrderValue: number;
    };
    recentOrders: any[];
  };
  customer: Customer;
}

function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}

function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'green'
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: any;
  trend?: string;
  color?: string;
}) {
  const colorClasses = {
    green: 'bg-green-100 text-green-600',
    blue: 'bg-blue-100 text-blue-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    purple: 'bg-purple-100 text-purple-600',
  };

  return (
    <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-gray-600 mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
            <p className="text-xs text-gray-500">{subtitle}</p>
            {trend && (
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="h-3 w-3 text-green-600" />
                <span className="text-xs text-green-600 font-semibold">{trend}</span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TierProgressCard({ tierInfo, totalSpent }: any) {
  const { current, next, progressToNextTier, remainingToNextTier } = tierInfo;
  
  return (
    <Card className="border-none shadow-md overflow-hidden">
      <div className={`bg-gradient-to-r ${current.tier === 'diamond' ? 'from-purple-500 to-blue-600' : current.tier === 'gold' ? 'from-yellow-400 to-orange-500' : 'from-gray-400 to-slate-500'} p-6 text-white`}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold mb-1">
              {current.icon} {current.name.toUpperCase()}
            </h3>
            <p className="text-sm opacity-90">Giảm giá {current.discount}%</p>
          </div>
          {current.tier === 'diamond' && (
            <Crown className="w-8 h-8 opacity-80" />
          )}
        </div>
        
        <div className="space-y-2">
          {current.benefits.slice(0, 3).map((benefit: string, i: number) => (
            <div key={i} className="text-sm opacity-90">
              ✓ {benefit}
            </div>
          ))}
        </div>
      </div>

      {next && (
        <CardContent className="p-6 bg-white">
          <div className="mb-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Tiến độ lên {next.name}</span>
              <span className="font-semibold text-green-700">{progressToNextTier}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-green-400 to-green-600 h-full rounded-full transition-all duration-1000"
                style={{ width: `${progressToNextTier}%` }}
              ></div>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            Còn <span className="font-bold text-green-700">{formatVND(remainingToNextTier)}</span> nữa để lên {next.name}!
          </p>
        </CardContent>
      )}

      {!next && (
        <CardContent className="p-6 bg-white">
          <div className="flex items-center gap-2 text-purple-600">
            <Sparkles className="w-5 h-5" />
            <p className="font-semibold">Bạn đã đạt hạng cao nhất!</p>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export default function VipDashboardClient({ initialData, customer }: VipDashboardClientProps) {
  const { profile, tierInfo, stats, recentOrders } = initialData;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-700 to-green-600 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Cổng VIP</h1>
          <p className="text-green-100">Chào mừng, {profile.name}!</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Tier Progress Card */}
        <TierProgressCard tierInfo={tierInfo} totalSpent={profile.totalSpent} />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard
            title="Tổng đơn hàng"
            value={stats.totalOrders.toString()}
            subtitle={`${stats.completedOrders} đơn hoàn thành`}
            icon={ShoppingCart}
            color="blue"
          />
          <MetricCard
            title="Tổng tiết kiệm"
            value={stats.totalSavingsFormatted}
            subtitle={`Từ ưu đãi VIP ${tierInfo.current.discount}%`}
            icon={DollarSign}
            color="green"
          />
          <MetricCard
            title="Tổng chi tiêu"
            value={profile.totalSpentFormatted}
            subtitle="Tích lũy từ trước đến nay"
            icon={Package}
            color="purple"
          />
        </div>

        {/* Recent Orders */}
        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">Đơn hàng gần đây</CardTitle>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Chưa có đơn hàng nào</p>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">
                        {formatVND(order.total)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-green-600">
                        Tiết kiệm: {order.vipDiscountFormatted}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">{order.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <a
            href="/vip/products"
            className="p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow text-center"
          >
            <Package className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <p className="font-semibold text-gray-900">Sản phẩm VIP</p>
          </a>
          <a
            href="/vip/orders"
            className="p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow text-center"
          >
            <ShoppingCart className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <p className="font-semibold text-gray-900">Đơn hàng</p>
          </a>
          <a
            href="/vip/coupons"
            className="p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow text-center"
          >
            <Sparkles className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
            <p className="font-semibold text-gray-900">Mã giảm giá</p>
          </a>
          <a
            href="/"
            className="p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow text-center"
          >
            <Crown className="w-8 h-8 mx-auto mb-2 text-purple-600" />
            <p className="font-semibold text-gray-900">Trang chủ</p>
          </a>
        </div>
      </div>
    </div>
  );
}
