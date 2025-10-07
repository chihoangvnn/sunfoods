'use client'

import React from 'react';
import { HelpCircle } from 'lucide-react';
import { NotificationBell } from './NotificationBell';

interface TopBarProps {
  onLogin?: () => void;
  onRegister?: () => void;
}

export function TopBar({ onLogin, onRegister }: TopBarProps) {
  return (
    <div className="bg-green-800 text-white text-sm h-9">
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        <div className="flex items-center gap-4">
          <a href="#" className="hover:text-green-200 transition-colors">Kênh Người Bán</a>
          <span className="text-green-600">|</span>
          <a href="#" className="hover:text-green-200 transition-colors">Tải App</a>
          <span className="text-green-600">|</span>
          <a href="#" className="hover:text-green-200 transition-colors flex items-center gap-1">
            Kết Nối
          </a>
        </div>

        <div className="flex items-center gap-4">
          <NotificationBell />
          <button className="hover:text-green-200 transition-colors flex items-center gap-1">
            <HelpCircle className="h-4 w-4" />
            <span>Hỗ Trợ</span>
          </button>
          <button 
            onClick={onRegister}
            className="hover:text-green-200 transition-colors"
          >
            Đăng Ký
          </button>
          <span className="text-green-600">|</span>
          <button 
            onClick={onLogin}
            className="hover:text-green-200 transition-colors"
          >
            Đăng Nhập
          </button>
        </div>
      </div>
    </div>
  );
}
