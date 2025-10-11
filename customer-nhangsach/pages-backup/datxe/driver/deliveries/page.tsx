'use client'

import { useState } from 'react';
import { Truck, MapPin, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Delivery {
  id: string;
  from: string;
  to: string;
  receiverName: string;
  receiverPhone: string;
  price: number;
  status: 'confirmed' | 'in_transit' | 'delivered' | 'cancelled';
  eta: string;
}

const mockDeliveries: Delivery[] = [
  {
    id: 'PKG001',
    from: 'Quận 1',
    to: 'Quận 7',
    receiverName: 'Nguyễn Văn A',
    receiverPhone: '0901234567',
    price: 50000,
    status: 'in_transit',
    eta: '15p'
  },
  {
    id: 'PKG002',
    from: 'Quận 3',
    to: 'Bình Thạnh',
    receiverName: 'Trần Thị B',
    receiverPhone: '0907654321',
    price: 35000,
    status: 'confirmed',
    eta: '30p'
  },
];

function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}

export default function DriverDeliveriesPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>(mockDeliveries);
  
  const activeCount = deliveries.filter(d => d.status === 'in_transit').length;
  const totalEarnings = deliveries.filter(d => d.status !== 'cancelled').reduce((sum, d) => sum + d.price, 0);
  const avgETA = '20p';

  const handleStartDelivery = (id: string) => {
    setDeliveries(prev => prev.map(d => 
      d.id === id ? { ...d, status: 'in_transit' as const } : d
    ));
  };

  const handleComplete = (id: string) => {
    setDeliveries(prev => prev.map(d => 
      d.id === id ? { ...d, status: 'delivered' as const } : d
    ));
  };

  const handleCancel = (id: string) => {
    setDeliveries(prev => prev.map(d => 
      d.id === id ? { ...d, status: 'cancelled' as const } : d
    ));
  };

  const statusConfig = {
    confirmed: { label: 'Đã nhận', color: 'bg-blue-100 text-blue-800' },
    in_transit: { label: 'Đang giao', color: 'bg-orange-100 text-orange-800' },
    delivered: { label: 'Hoàn thành', color: 'bg-green-100 text-green-800' },
    cancelled: { label: 'Đã hủy', color: 'bg-red-100 text-red-800' },
  };

  return (
    <div className="pb-20">
      {/* Live Metrics */}
      <Card className="border-none shadow-md m-4">
        <CardContent className="p-3">
          <div className="flex items-center justify-around gap-4">
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-0.5">Đang giao</p>
              <p className="text-3xl font-bold text-orange-600">{activeCount}</p>
            </div>
            <div className="h-10 w-px bg-gray-200"></div>
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-0.5">ETA TB</p>
              <p className="text-2xl font-bold text-gray-900">{avgETA}</p>
            </div>
            <div className="h-10 w-px bg-gray-200"></div>
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-0.5">Thu nhập</p>
              <p className="text-xl font-bold text-green-600">{formatVND(totalEarnings)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deliveries List */}
      <div className="px-4 space-y-2.5">
        {deliveries.length === 0 ? (
          <Card className="border-none shadow-md">
            <CardContent className="p-12 text-center">
              <Truck className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Chưa có đơn giao
              </h3>
              <p className="text-gray-600">
                Tìm Ship để nhận đơn mới
              </p>
            </CardContent>
          </Card>
        ) : (
          deliveries.map((delivery) => (
            <Card key={delivery.id} className={`border-none shadow-md ${
              delivery.status === 'delivered' || delivery.status === 'cancelled' ? 'opacity-60' : ''
            }`}>
              <CardContent className="p-3">
                {/* Header - Compact */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-gray-900">#{delivery.id}</span>
                    <span className={`px-1.5 py-0.5 rounded text-xs font-semibold ${
                      statusConfig[delivery.status].color
                    }`}>
                      {statusConfig[delivery.status].label}
                    </span>
                  </div>
                  <span className="text-lg font-bold text-green-600">
                    {formatVND(delivery.price)}
                  </span>
                </div>

                {/* Route - Compact Inline */}
                <div className="flex items-center gap-1.5 mb-2 text-sm">
                  <MapPin className="h-3.5 w-3.5 text-blue-600 flex-shrink-0" />
                  <span className="font-medium text-gray-900 truncate">{delivery.from}</span>
                  <span className="text-gray-400">→</span>
                  <MapPin className="h-3.5 w-3.5 text-orange-600 flex-shrink-0" />
                  <span className="font-medium text-gray-900 truncate">{delivery.to}</span>
                </div>

                {/* Info - Ultra Compact */}
                <div className="flex items-center justify-between text-xs text-gray-600 mb-2 pb-2 border-b">
                  <span>{delivery.receiverName}</span>
                  <span>ETA: {delivery.eta}</span>
                </div>

                {/* Actions */}
                {delivery.status !== 'delivered' && delivery.status !== 'cancelled' && (
                  <div className="flex gap-2">
                    {delivery.status === 'confirmed' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleStartDelivery(delivery.id)}
                          className="flex-1 bg-orange-600 hover:bg-orange-700 h-8 text-xs"
                        >
                          <Truck className="h-3.5 w-3.5 mr-1" />
                          Bắt đầu
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCancel(delivery.id)}
                          className="text-red-600 hover:bg-red-50 h-8 px-2"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                        </Button>
                      </>
                    )}
                    {delivery.status === 'in_transit' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleComplete(delivery.id)}
                          className="flex-1 bg-green-600 hover:bg-green-700 h-8 text-xs"
                        >
                          <CheckCircle className="h-3.5 w-3.5 mr-1" />
                          Hoàn thành
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCancel(delivery.id)}
                          className="text-red-600 hover:bg-red-50 h-8 px-2"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
