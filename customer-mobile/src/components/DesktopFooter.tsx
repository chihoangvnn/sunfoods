'use client';

import React from 'react';
import { Truck, Shield } from 'lucide-react';

const DesktopFooter = () => {
  return (
    <footer className="border-t border-warm-sun/30 mt-16">
      {/* Tier 1: Trust Signals Bar - Warm & Inviting (warm-sun/20) */}
      <div className="bg-warm-sun/20 py-6">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="flex flex-col items-center space-y-2">
              <div className="text-2xl">🌿</div>
              <div>
                <p className="text-xs font-semibold text-sunrise-leaf">100% Organic</p>
                <p className="text-xs text-sunrise-leaf/70">Chứng nhận hữu cơ</p>
              </div>
            </div>
            
            <div className="flex flex-col items-center space-y-2">
              <div className="text-2xl">🌾</div>
              <div>
                <p className="text-xs font-semibold text-warm-sun">Farm Fresh</p>
                <p className="text-xs text-sunrise-leaf/70">Thu hoạch hôm nay</p>
              </div>
            </div>
            
            <div className="flex flex-col items-center space-y-2">
              <Truck size={24} className="text-sunrise-leaf" />
              <div>
                <p className="text-xs font-semibold text-sunrise-leaf">Giao Nhanh 2H</p>
                <p className="text-xs text-sunrise-leaf/70">Nội thành TP.HCM</p>
              </div>
            </div>
            
            <div className="flex flex-col items-center space-y-2">
              <Shield size={24} className="text-sunrise-leaf" />
              <div>
                <p className="text-xs font-semibold text-sunrise-leaf">Thanh Toán An Toàn</p>
                <p className="text-xs text-sunrise-leaf/70">Đa dạng & Bảo mật</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tier 2: Main Footer Content - Clean White with Green Accent */}
      <div className="bg-white border-t-2 border-sunrise-leaf py-12">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* About Column */}
            <div className="lg:col-span-1">
              <h3 className="text-2xl font-bold text-sunrise-leaf mb-4">🌿 SunFoods.vn</h3>
              <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                Thực phẩm hữu cơ cao cấp từ farm Việt Nam. Tinh hoa thiên nhiên - Từ farm đến bàn ăn.
              </p>
            </div>

            {/* Products Column */}
            <div className="lg:col-span-1">
              <h4 className="text-lg font-semibold text-sunrise-leaf mb-4">Sản Phẩm</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="hover:text-sunrise-leaf transition-colors cursor-pointer">Rau Củ Organic</li>
                <li className="hover:text-sunrise-leaf transition-colors cursor-pointer">Trái Cây Tươi</li>
                <li className="hover:text-sunrise-leaf transition-colors cursor-pointer">Thực Phẩm Khô</li>
                <li className="hover:text-sunrise-leaf transition-colors cursor-pointer">Farm Fresh Daily</li>
              </ul>
            </div>

            {/* Support Column */}
            <div className="lg:col-span-1">
              <h4 className="text-lg font-semibold text-sunrise-leaf mb-4">Hỗ Trợ</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="hover:text-sunrise-leaf transition-colors cursor-pointer">Liên Hệ</li>
                <li className="hover:text-sunrise-leaf transition-colors cursor-pointer">Hướng Dẫn Mua Hàng</li>
                <li className="hover:text-sunrise-leaf transition-colors cursor-pointer">Chính Sách Giao Hàng</li>
                <li className="hover:text-sunrise-leaf transition-colors cursor-pointer">FAQ</li>
              </ul>
            </div>

            {/* Connect Column */}
            <div className="lg:col-span-1">
              <h4 className="text-lg font-semibold text-sunrise-leaf mb-4">Kết Nối</h4>
              <p className="text-sm text-gray-700">Facebook | Zalo | Email</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tier 3: Copyright Section - Darkest (solid sunrise-leaf) */}
      <div className="bg-sunrise-leaf py-6">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-center md:text-left">
              <p className="text-sm text-white">
                🌿 © 2024 <strong>SunFoods.vn</strong> - Tinh Hoa Thiên Nhiên
              </p>
              <p className="text-xs text-white/80 mt-1">
                Thực phẩm hữu cơ cao cấp từ farm Việt Nam
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default DesktopFooter;
