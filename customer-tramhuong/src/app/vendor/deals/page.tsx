'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table } from '@/components/ui/table';
import { Plus, ExternalLink, Pencil, Trash2, Copy, Clock, Users, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Deal {
  id: string;
  slug: string;
  productId: string;
  type: 'flash_sale' | 'group_buy';
  title: string;
  description: string | null;
  originalPrice: number | null;
  salePrice: number | null;
  discountPercent: number | null;
  startTime: string | null;
  endTime: string | null;
  targetQuantity: number | null;
  currentQuantity: number | null;
  deadline: string | null;
  status: string;
  createdAt: string;
  productName: string;
  productImage: string | null;
  productPrice: string;
  orderCount: number;
}

function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
}

function formatDateTime(dateString: string | null): string {
  if (!dateString) return 'N/A';
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(dateString));
}

function getDealStatus(deal: Deal): { label: string; variant: 'default' | 'secondary' | 'destructive' } {
  if (deal.status === 'expired') return { label: 'Đã hết hạn', variant: 'secondary' };
  if (deal.status === 'completed') return { label: 'Hoàn thành', variant: 'default' };
  if (deal.status === 'cancelled') return { label: 'Đã hủy', variant: 'destructive' };
  
  if (deal.type === 'flash_sale' && deal.endTime) {
    const now = new Date();
    const endTime = new Date(deal.endTime);
    if (now > endTime) return { label: 'Đã hết hạn', variant: 'secondary' };
  }
  
  if (deal.type === 'group_buy' && deal.deadline) {
    const now = new Date();
    const deadline = new Date(deal.deadline);
    if (now > deadline) return { label: 'Đã hết hạn', variant: 'secondary' };
  }
  
  return { label: 'Đang hoạt động', variant: 'default' };
}

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    try {
      const response = await fetch('/api/vendor/deals');
      const data = await response.json();
      setDeals(data.deals || []);
    } catch (error) {
      console.error('Error fetching deals:', error);
      toast.error('Không thể tải danh sách deals');
    } finally {
      setLoading(false);
    }
  };

  const copyShareLink = (slug: string) => {
    const url = `${window.location.origin}/deals/${slug}`;
    navigator.clipboard.writeText(url);
    toast.success('Đã sao chép link!');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa deal này?')) return;
    
    toast.info('Chức năng xóa sẽ được thêm sau');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Deals</h1>
          <p className="text-gray-600 mt-1">Flash Sale và Group Buy</p>
        </div>
        <Link href="/vendor/deals/new">
          <Button className="gap-2 bg-orange-600 hover:bg-orange-700">
            <Plus className="w-4 h-4" />
            Tạo Deal Mới
          </Button>
        </Link>
      </div>

      {deals.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có deal nào</h3>
              <p className="text-gray-600 mb-6">Tạo deal đầu tiên để bắt đầu thu hút khách hàng</p>
              <Link href="/vendor/deals/new">
                <Button className="gap-2 bg-orange-600 hover:bg-orange-700">
                  <Plus className="w-4 h-4" />
                  Tạo Deal Mới
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="hidden md:block">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Deal
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Loại
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Giá
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Trạng thái
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Thời gian
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tiến độ
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Thao tác
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {deals.map((deal) => {
                        const statusInfo = getDealStatus(deal);
                        return (
                          <tr key={deal.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                {deal.productImage && (
                                  <img
                                    src={deal.productImage}
                                    alt={deal.productName}
                                    className="w-12 h-12 rounded object-cover mr-3"
                                  />
                                )}
                                <div>
                                  <div className="font-semibold text-gray-900">{deal.title}</div>
                                  <div className="text-sm text-gray-500">{deal.productName}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <Badge variant={deal.type === 'flash_sale' ? 'destructive' : 'default'}>
                                {deal.type === 'flash_sale' ? 'Flash Sale' : 'Group Buy'}
                              </Badge>
                            </td>
                            <td className="px-6 py-4">
                              <div>
                                <div className="text-sm text-gray-500 line-through">
                                  {formatVND(deal.originalPrice || 0)}
                                </div>
                                <div className="font-semibold text-orange-600">
                                  {formatVND(deal.salePrice || 0)}
                                </div>
                                {deal.discountPercent && (
                                  <div className="text-xs text-green-600">
                                    -{deal.discountPercent}%
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <Badge variant={statusInfo.variant}>
                                {statusInfo.label}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 text-sm">
                              {deal.type === 'flash_sale' ? (
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  <div>
                                    <div>{formatDateTime(deal.startTime)}</div>
                                    <div className="text-gray-500">đến {formatDateTime(deal.endTime)}</div>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  <div>{formatDateTime(deal.deadline)}</div>
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              {deal.type === 'group_buy' ? (
                                <div className="flex items-center gap-2">
                                  <Users className="w-4 h-4 text-gray-500" />
                                  <div className="text-sm">
                                    <span className="font-semibold">{deal.currentQuantity || 0}</span>
                                    <span className="text-gray-500">/{deal.targetQuantity}</span>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-gray-500">{deal.orderCount} đơn</span>
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => window.open(`/deals/${deal.slug}`, '_blank')}
                                  title="Xem trang deal"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyShareLink(deal.slug)}
                                  title="Sao chép link"
                                >
                                  <Copy className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(deal.id)}
                                  title="Xóa"
                                >
                                  <Trash2 className="w-4 h-4 text-red-600" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:hidden space-y-4">
            {deals.map((deal) => {
              const statusInfo = getDealStatus(deal);
              return (
                <Card key={deal.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3 mb-3">
                      {deal.productImage && (
                        <img
                          src={deal.productImage}
                          alt={deal.productName}
                          className="w-20 h-20 rounded object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{deal.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">{deal.productName}</p>
                        <div className="flex gap-2">
                          <Badge variant={deal.type === 'flash_sale' ? 'destructive' : 'default'} className="text-xs">
                            {deal.type === 'flash_sale' ? 'Flash Sale' : 'Group Buy'}
                          </Badge>
                          <Badge variant={statusInfo.variant} className="text-xs">
                            {statusInfo.label}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Giá gốc:</span>
                        <span className="text-sm line-through">{formatVND(deal.originalPrice || 0)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Giá khuyến mãi:</span>
                        <span className="font-semibold text-orange-600">{formatVND(deal.salePrice || 0)}</span>
                      </div>
                      {deal.discountPercent && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">Giảm giá:</span>
                          <span className="text-sm text-green-600 font-semibold">-{deal.discountPercent}%</span>
                        </div>
                      )}
                    </div>

                    {deal.type === 'group_buy' && (
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Tiến độ:</span>
                          <span className="font-semibold">
                            {deal.currentQuantity || 0}/{deal.targetQuantity} người
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-orange-600 h-2 rounded-full transition-all"
                            style={{
                              width: `${Math.min(
                                ((deal.currentQuantity || 0) / (deal.targetQuantity || 1)) * 100,
                                100
                              )}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`/deals/${deal.slug}`, '_blank')}
                        className="flex-1"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Xem
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyShareLink(deal.slug)}
                        className="flex-1"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Link
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
