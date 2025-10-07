'use client'

import { useState } from 'react';
import { MapPin, Clock, Users, DollarSign, ArrowRight, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}

export default function CreateTripPage() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [seats, setSeats] = useState(4);
  const [pricePerSeat, setPricePerSeat] = useState(50000);

  const totalRevenue = seats * pricePerSeat;

  const handleCreate = () => {
    console.log('Creating trip:', { from, to, date, time, seats, pricePerSeat });
  };

  return (
    <div className="pb-24 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="px-4 py-4 bg-white border-b sticky top-0 z-10">
        <h1 className="text-xl font-bold text-gray-900">Tạo chuyến xe mới</h1>
      </div>

      {/* Form */}
      <div className="p-4 space-y-4">
        {/* Route */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="h-5 w-5 text-green-600" />
            <h2 className="font-semibold text-gray-900">Tuyến đường</h2>
          </div>
          
          <div className="space-y-3">
            <input
              type="text"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              placeholder="Điểm đi (VD: Bến xe Miền Đông)"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg text-base focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            
            <div className="flex justify-center">
              <ArrowRight className="h-5 w-5 text-gray-400" />
            </div>
            
            <input
              type="text"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="Điểm đến (VD: Vũng Tàu)"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg text-base focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Date & Time */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="h-5 w-5 text-green-600" />
            <h2 className="font-semibold text-gray-900">Thời gian khởi hành</h2>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-600 mb-2 block flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                Ngày
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600 mb-2 block flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                Giờ
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Seats & Price - Grab Style */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="space-y-4">
            {/* Seats */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Users className="h-5 w-5 text-green-600" />
                <h2 className="font-semibold text-gray-900">Số chỗ trống</h2>
              </div>
              <div className="flex items-center justify-between gap-4">
                <button
                  onClick={() => setSeats(Math.max(1, seats - 1))}
                  className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 font-bold text-xl"
                >
                  −
                </button>
                <div className="text-center">
                  <p className="text-4xl font-bold text-gray-900">{seats}</p>
                  <p className="text-sm text-gray-500">chỗ</p>
                </div>
                <button
                  onClick={() => setSeats(Math.min(10, seats + 1))}
                  className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 font-bold text-xl"
                >
                  +
                </button>
              </div>
            </div>

            {/* Price - Prominent */}
            <div className="border-t pt-4">
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className="h-5 w-5 text-green-600" />
                <h2 className="font-semibold text-gray-900">Giá vé / người</h2>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={pricePerSeat}
                  onChange={(e) => setPricePerSeat(Number(e.target.value))}
                  step="5000"
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-lg text-lg font-semibold focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <span className="text-lg font-medium text-gray-600">đ</span>
              </div>
            </div>
          </div>
        </div>

        {/* Summary - Grab Style */}
        <div className="bg-green-50 rounded-xl p-4 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Doanh thu dự kiến</span>
            <span className="text-xs text-gray-500">{seats} chỗ × {formatVND(pricePerSeat)}</span>
          </div>
          <div className="text-3xl font-bold text-green-700">
            {formatVND(totalRevenue)}
          </div>
        </div>
      </div>

      {/* Sticky CTA Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
        <Button
          onClick={handleCreate}
          disabled={!from || !to || !date || !time}
          className="w-full bg-green-600 hover:bg-green-700 text-white h-14 text-lg font-semibold disabled:bg-gray-300"
        >
          Tạo chuyến xe
        </Button>
      </div>
    </div>
  );
}
