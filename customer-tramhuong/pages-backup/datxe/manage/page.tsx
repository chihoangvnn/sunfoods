'use client'

import { useState } from 'react';
import { Car, Calendar, DollarSign, Users, MapPin, ChevronDown, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface Trip {
  id: string;
  route: string;
  from: string;
  to: string;
  date: string;
  time: string;
  seats: number;
  booked: number;
  revenue: number;
  status: 'upcoming' | 'completed' | 'cancelled';
  passengers?: string[];
}

const mockTrips: Trip[] = [
  {
    id: 'T001',
    route: 'TP.HCM → Vũng Tàu',
    from: 'TP.HCM',
    to: 'Vũng Tàu',
    date: '2024-01-15',
    time: '07:00',
    seats: 4,
    booked: 3,
    revenue: 150000,
    status: 'upcoming',
    passengers: ['Nguyễn Văn A', 'Trần Thị B', 'Lê Văn C']
  },
  {
    id: 'T002',
    route: 'TP.HCM → Đà Lạt',
    from: 'TP.HCM',
    to: 'Đà Lạt',
    date: '2024-01-12',
    time: '05:00',
    seats: 4,
    booked: 4,
    revenue: 400000,
    status: 'completed',
    passengers: ['Phạm Thị D', 'Hoàng Văn E', 'Đỗ Thị F', 'Vũ Văn G']
  },
  {
    id: 'T003',
    route: 'TP.HCM → Phan Thiết',
    from: 'TP.HCM',
    to: 'Phan Thiết',
    date: '2024-01-10',
    time: '06:30',
    seats: 4,
    booked: 2,
    revenue: 120000,
    status: 'completed',
    passengers: ['Bùi Văn H', 'Lý Thị I']
  },
];

function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}

export default function ManageTripsPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'upcoming' | 'completed'>('all');
  const [expandedTrip, setExpandedTrip] = useState<string | null>(null);
  
  const totalTrips = mockTrips.length;
  const upcomingCount = mockTrips.filter(t => t.status === 'upcoming').length;
  const totalRevenue = mockTrips.reduce((sum, t) => sum + t.revenue, 0);

  const filteredTrips = activeTab === 'all' 
    ? mockTrips 
    : mockTrips.filter(t => t.status === activeTab);

  const tabs = [
    { id: 'all' as const, label: 'Tất cả' },
    { id: 'upcoming' as const, label: 'Sắp tới' },
    { id: 'completed' as const, label: 'Hoàn thành' },
  ];

  const statusConfig = {
    upcoming: { label: 'Sắp tới', color: 'bg-blue-100 text-blue-800' },
    completed: { label: 'Hoàn thành', color: 'bg-green-100 text-green-800' },
    cancelled: { label: 'Đã hủy', color: 'bg-red-100 text-red-800' },
  };

  const toggleExpand = (tripId: string) => {
    setExpandedTrip(expandedTrip === tripId ? null : tripId);
  };

  return (
    <div className="pb-6">
      {/* Top Stats */}
      <Card className="border-none shadow-md m-4">
        <CardContent className="p-4">
          <div className="flex items-center justify-around gap-4">
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Tổng chuyến</p>
              <p className="text-3xl font-bold text-gray-900">{totalTrips}</p>
            </div>
            <div className="h-12 w-px bg-gray-200"></div>
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Sắp tới</p>
              <p className="text-3xl font-bold text-blue-600">{upcomingCount}</p>
            </div>
            <div className="h-12 w-px bg-gray-200"></div>
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Doanh thu</p>
              <p className="text-xl font-bold text-green-600">{formatVND(totalRevenue)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Segmented Tabs */}
      <div className="px-4 mb-4">
        <div className="bg-gray-100 rounded-lg p-1 flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Trips List */}
      <div className="px-4 space-y-3">
        {filteredTrips.length === 0 ? (
          <Card className="border-none shadow-md">
            <CardContent className="p-12 text-center">
              <Car className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Chưa có chuyến xe
              </h3>
              <p className="text-gray-600">
                Tạo chuyến xe mới để bắt đầu
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredTrips.map((trip) => (
            <Card key={trip.id} className="border-none shadow-md">
              <CardContent className="p-4">
                <div 
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleExpand(trip.id)}
                >
                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-gray-900">#{trip.id}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        statusConfig[trip.status].color
                      }`}>
                        {statusConfig[trip.status].label}
                      </span>
                    </div>

                    {/* Route & Date */}
                    <div className="space-y-1 mb-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Car className="h-3.5 w-3.5 text-gray-500" />
                        <span className="font-medium text-gray-900">{trip.route}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{new Date(trip.date).toLocaleDateString('vi-VN')} • {trip.time}</span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-xs text-gray-600">
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span className="font-semibold text-gray-900">{trip.booked}/{trip.seats}</span>
                        <span>chỗ</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        <span className="font-semibold text-green-600">{formatVND(trip.revenue)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Chevron */}
                  {expandedTrip === trip.id ? (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  )}
                </div>

                {/* Expanded Details */}
                {expandedTrip === trip.id && (
                  <div className="mt-4 pt-4 border-t space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-2">Chi tiết tuyến đường</p>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5 text-blue-600" />
                          <span className="text-sm">{trip.from}</span>
                        </div>
                        <div className="h-4 w-px bg-gray-300 ml-1.5"></div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5 text-orange-600" />
                          <span className="text-sm">{trip.to}</span>
                        </div>
                      </div>
                    </div>

                    {trip.passengers && trip.passengers.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-500 mb-2">Danh sách hành khách</p>
                        <div className="space-y-1">
                          {trip.passengers.map((passenger, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm">
                              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                                <span className="text-xs font-semibold text-green-700">{idx + 1}</span>
                              </div>
                              <span>{passenger}</span>
                            </div>
                          ))}
                        </div>
                      </div>
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
