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
    <div className="bg-tramhuong-secondary text-white text-sm h-9">
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        <div className="flex items-center gap-4">
          <a href="#" className="hover:text-tramhuong-accent transition-colors">Kênh Người Bán</a>
          <span className="text-tramhuong-accent/50">|</span>
          <a href="#" className="hover:text-tramhuong-accent transition-colors">Tải App</a>
          <span className="text-tramhuong-accent/50">|</span>
          <a href="#" className="hover:text-tramhuong-accent transition-colors flex items-center gap-1">
            Kết Nối
          </a>
        </div>

        <div className="flex items-center gap-4">
          <NotificationBell />
          <button className="hover:text-tramhuong-accent transition-colors flex items-center gap-1">
            <HelpCircle className="h-4 w-4" />
            <span>Hỗ Trợ</span>
          </button>
          <button 
            onClick={onRegister}
            className="hover:text-tramhuong-accent transition-colors"
          >
            Đăng Ký
          </button>
          <span className="text-tramhuong-accent/50">|</span>
          <button 
            onClick={onLogin}
            className="hover:text-tramhuong-accent transition-colors"
          >
            Đăng Nhập
          </button>
        </div>
      </div>
    </div>
  );
}
