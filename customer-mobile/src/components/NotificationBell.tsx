'use client'

import React, { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await fetch('/api/notifications');
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }
      const data = await response.json();
      return data;
    },
    refetchInterval: 30000,
    staleTime: 25000,
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationIds: string[]) => {
      const response = await fetch('/api/notifications/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds }),
      });
      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const notifications: Notification[] = Array.isArray(data) ? data : [];
  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsReadMutation.mutate([notification.id]);
    }
    if (notification.link) {
      window.location.href = notification.link;
    }
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="hover:text-green-200 transition-colors flex items-center gap-1 relative px-2 py-1"
      >
        <Bell className="h-4 w-4" />
        <span>Thông Báo</span>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-bold z-10">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
          <div className="p-3 border-b border-gray-200 bg-green-50">
            <h3 className="font-semibold text-gray-800 text-sm">
              Thông báo ({notifications.length})
            </h3>
          </div>
          
          {isLoading ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              Đang tải...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              Không có thông báo mới
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`w-full p-3 hover:bg-gray-50 transition-colors text-left ${
                    !notification.isRead ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <div className={`${
                      !notification.isRead ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                    } rounded-full p-1.5 mt-0.5`}>
                      <Bell className="h-3 w-3" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm mb-1 ${
                        !notification.isRead ? 'text-gray-900 font-semibold' : 'text-gray-800 font-medium'
                      }`}>
                        {notification.title}
                      </p>
                      <p className="text-sm text-gray-600 mb-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(notification.createdAt), {
                          addSuffix: true,
                          locale: vi,
                        })}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
