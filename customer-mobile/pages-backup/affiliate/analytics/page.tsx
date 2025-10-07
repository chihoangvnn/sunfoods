'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Share2, MousePointerClick, TrendingUp, Clock, Award } from 'lucide-react';

interface AnalyticsData {
  summary: {
    totalShares: number;
    totalClicks: number;
    clickThroughRate: number;
    dateRange: {
      from: string;
      to: string;
      days: number;
    };
  };
  topProducts: Array<{
    productId: string;
    productName: string;
    productSlug: string;
    shareCount: number;
    clickCount: number;
    ctr: string;
  }>;
  platformStats: Array<{
    platform: string;
    shareCount: number;
    clickCount: number;
    ctr: string;
  }>;
  templateStats: Array<{
    template: string;
    shareCount: number;
    clickCount: number;
    ctr: string;
  }>;
  dailyTimeline: Array<{
    date: string;
    shareCount: number;
    clickCount: number;
  }>;
  bestHours: string[];
  hourlyStats: Array<{
    hour: number;
    shareCount: number;
    clickCount: number;
  }>;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState(30); // default 30 days

  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/affiliate-portal/analytics?days=${dateRange}`);
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-600">Không thể tải dữ liệu phân tích</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📊 Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Phân tích hiệu quả chia sẻ của bạn</p>
        </div>
        
        {/* Date Range Selector */}
        <div className="flex gap-2">
          {[7, 30, 90].map((days) => (
            <Button
              key={days}
              variant={dateRange === days ? 'default' : 'outline'}
              onClick={() => setDateRange(days)}
              size="sm"
            >
              {days} ngày
            </Button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Tổng lượt chia sẻ
            </CardTitle>
            <Share2 className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{data.summary.totalShares}</div>
            <p className="text-xs text-gray-500 mt-1">
              Trong {data.summary.dateRange.days} ngày qua
            </p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Tổng lượt click
            </CardTitle>
            <MousePointerClick className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{data.summary.totalClicks}</div>
            <p className="text-xs text-gray-500 mt-1">
              Từ {data.summary.totalShares} lần chia sẻ
            </p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Tỷ lệ Click (CTR)
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              {data.summary.clickThroughRate}%
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Click trung bình / share
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Best Hours */}
      {data.bestHours.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-600" />
              🌟 Giờ vàng để đăng bài
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {data.bestHours.map((hour, index) => (
                <div
                  key={index}
                  className="px-4 py-2 bg-orange-50 border border-orange-200 rounded-lg"
                >
                  <span className="text-orange-700 font-semibold">{hour}</span>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-3">
              💡 Những khung giờ này có tỷ lệ click cao nhất. Đăng bài vào giờ này để tăng hiệu quả!
            </p>
          </CardContent>
        </Card>
      )}

      {/* Top Products */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-600" />
            🏆 Top sản phẩm được chia sẻ nhiều nhất
            </CardTitle>
        </CardHeader>
        <CardContent>
          {data.topProducts.length > 0 ? (
            <div className="space-y-3">
              {data.topProducts.slice(0, 5).map((product, index) => (
                <div key={product.productId} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{product.productName}</h3>
                    <p className="text-sm text-gray-500">
                      {product.shareCount} shares · {product.clickCount} clicks · CTR {product.ctr}%
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">{product.ctr}%</div>
                    <div className="text-xs text-gray-500">CTR</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-6">Chưa có dữ liệu chia sẻ</p>
          )}
        </CardContent>
      </Card>

      {/* Platform Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>📱 Thống kê theo nền tảng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.platformStats.map((platform) => (
                <div key={platform.platform} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <div className="font-semibold capitalize">{platform.platform}</div>
                    <div className="text-sm text-gray-500">
                      {platform.shareCount} shares · {platform.clickCount} clicks
                    </div>
                  </div>
                  <div className="text-xl font-bold text-blue-600">{platform.ctr}%</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>📝 Hiệu quả theo template</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.templateStats.map((template, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <div className="font-semibold">{template.template}</div>
                    <div className="text-sm text-gray-500">
                      {template.shareCount} shares · {template.clickCount} clicks
                    </div>
                  </div>
                  <div className="text-xl font-bold text-green-600">{template.ctr}%</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Timeline */}
      {data.dailyTimeline.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>📈 Biểu đồ theo ngày</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.dailyTimeline.slice(-14).map((day) => (
                <div key={day.date} className="flex items-center gap-3">
                  <div className="w-24 text-sm text-gray-600">
                    {new Date(day.date).toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' })}
                  </div>
                  <div className="flex-1 flex gap-2">
                    <div className="bg-blue-500 rounded" style={{ width: `${(day.shareCount / (data.summary.totalShares / data.dailyTimeline.length)) * 100}%`, minWidth: '2px', height: '20px' }}></div>
                    <span className="text-sm text-gray-600">{day.shareCount} shares</span>
                  </div>
                  <div className="flex-1 flex gap-2">
                    <div className="bg-green-500 rounded" style={{ width: `${(day.clickCount / (data.summary.totalClicks / data.dailyTimeline.length)) * 100}%`, minWidth: '2px', height: '20px' }}></div>
                    <span className="text-sm text-gray-600">{day.clickCount} clicks</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
