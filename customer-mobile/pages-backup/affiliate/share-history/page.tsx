'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { History, Share2, MousePointerClick, Calendar, Filter, RefreshCw } from 'lucide-react';

interface ShareLog {
  id: string;
  productId: string;
  productSlug: string | null;
  productName: string;
  platform: string;
  imageIndex: number;
  captionTemplate: string | null;
  customCaption: string | null;
  shortCode: string | null;
  clickCount: number;
  sharedAt: string;
}

interface ShareHistoryData {
  shareLogs: ShareLog[];
  aggregates: {
    totalClicks: number;
    avgClicksPerShare: string;
  };
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export default function ShareHistoryPage() {
  const [data, setData] = useState<ShareHistoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [platformFilter, setPlatformFilter] = useState('');
  const [offset, setOffset] = useState(0);
  const limit = 20;

  useEffect(() => {
    loadHistory();
  }, [offset, startDate, endDate, platformFilter]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
      });
      
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);
      if (platformFilter) params.set('platform', platformFilter);

      const response = await fetch(`/api/affiliate-portal/share-history?${params}`);
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      console.error('Error loading share history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReShare = (log: ShareLog) => {
    // Copy the short link to clipboard
    const shortUrl = log.shortCode 
      ? `${window.location.origin}/api/r/${log.shortCode}`
      : `${window.location.origin}/product/${log.productSlug || log.productId}`;
    
    navigator.clipboard.writeText(shortUrl);
    
    // Open Facebook share dialog
    const fbShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shortUrl)}`;
    
    if (confirm(`📋 Link đã được copy!\n\n🔗 ${shortUrl}\n\nBạn có muốn mở Facebook để chia sẻ lại không?`)) {
      window.open(fbShareUrl, 'facebook-share-dialog', 'width=626,height=436');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const resetFilters = () => {
    setStartDate('');
    setEndDate('');
    setPlatformFilter('');
    setOffset(0);
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải lịch sử...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <History className="h-8 w-8 text-blue-600" />
          📜 Lịch sử chia sẻ
        </h1>
        <p className="text-gray-600 mt-1">Xem lại các bài đăng đã chia sẻ</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5" />
            Bộ lọc
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                <Calendar className="h-4 w-4 inline mr-1" />
                Từ ngày
              </label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setOffset(0);
                }}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                <Calendar className="h-4 w-4 inline mr-1" />
                Đến ngày
              </label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setOffset(0);
                }}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                📱 Nền tảng
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={platformFilter}
                onChange={(e) => {
                  setPlatformFilter(e.target.value);
                  setOffset(0);
                }}
              >
                <option value="">Tất cả</option>
                <option value="facebook">Facebook</option>
                <option value="zalo">Zalo</option>
                <option value="instagram">Instagram</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={resetFilters}
                className="w-full"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Đặt lại
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="text-sm text-gray-600">Tổng lượt chia sẻ</div>
              <div className="text-2xl font-bold text-blue-600">{data.pagination.total}</div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="text-sm text-gray-600">Tổng lượt click</div>
              <div className="text-2xl font-bold text-green-600">
                {data.aggregates.totalClicks}
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50">
            <CardContent className="p-4">
              <div className="text-sm text-gray-600">Click trung bình / share</div>
              <div className="text-2xl font-bold text-purple-600">
                {data.aggregates.avgClicksPerShare}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Share Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách chia sẻ</CardTitle>
        </CardHeader>
        <CardContent>
          {data && data.shareLogs.length > 0 ? (
            <div className="space-y-3">
              {data.shareLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{log.productName}</h3>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded capitalize">
                          {log.platform}
                        </span>
                      </div>

                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {formatDate(log.sharedAt)}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <MousePointerClick className="h-4 w-4" />
                          <span className="font-semibold text-green-600">{log.clickCount} clicks</span>
                        </div>

                        {log.captionTemplate && (
                          <div className="text-xs text-gray-500">
                            Template: {log.captionTemplate}
                          </div>
                        )}

                        {log.customCaption && (
                          <div className="mt-2 p-2 bg-white rounded border border-gray-200">
                            <div className="text-xs text-gray-500 mb-1">Caption:</div>
                            <div className="text-sm text-gray-700 line-clamp-3">
                              {log.customCaption}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleReShare(log)}
                        className="whitespace-nowrap"
                      >
                        <Share2 className="h-4 w-4 mr-1" />
                        Chia sẻ lại
                      </Button>
                      
                      {log.shortCode && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const url = `${window.location.origin}/api/r/${log.shortCode}`;
                            navigator.clipboard.writeText(url);
                            alert('✅ Đã copy link!');
                          }}
                        >
                          📋 Copy link
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <History className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p>Chưa có lịch sử chia sẻ nào</p>
            </div>
          )}

          {/* Pagination */}
          {data && data.pagination.total > limit && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t">
              <Button
                variant="outline"
                disabled={offset === 0}
                onClick={() => setOffset(Math.max(0, offset - limit))}
              >
                ← Trang trước
              </Button>

              <div className="text-sm text-gray-600">
                Hiển thị {offset + 1} - {Math.min(offset + limit, data.pagination.total)} / {data.pagination.total}
              </div>

              <Button
                variant="outline"
                disabled={!data.pagination.hasMore}
                onClick={() => setOffset(offset + limit)}
              >
                Trang sau →
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
