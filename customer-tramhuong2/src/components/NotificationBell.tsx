'use client'

import React, { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

interface Notification {
  id: string;
  type: string;
  message: string;
  orderId: string | null;
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
      try {
        const response = await fetch('/api/notifications');
        if (!response.ok) {
          if (response.status === 404) {
            return { notifications: [], count: 0 };
          }
          console.warn('Failed to fetch notifications:', response.status);
          return { notifications: [], count: 0 };
        }
        const data = await response.json();
        return data;
      } catch (error) {
        console.warn('Error fetching notifications:', error);
        return { notifications: [], count: 0 };
      }
    },
    refetchInterval: 30000,
    staleTime: 25000,
    retry: false,
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      try {
        const response = await fetch('/api/notifications/mark-read', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ notificationId }),
        });
        if (!response.ok) {
          if (response.status === 404) {
            return null;
          }
          console.warn('Failed to mark notification as read:', response.status);
          return null;
        }
        return response.json();
      } catch (error) {
        console.warn('Error marking notification as read:', error);
        return null;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const notifications: Notification[] = data?.notifications || [];
  const count = data?.count || 0;

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

  const handleNotificationClick = (notificationId: string, orderId: string | null) => {
    markAsReadMutation.mutate(notificationId);
    if (orderId) {
      window.location.href = `/order/${orderId}`;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="hover:text-tramhuong-accent transition-all duration-300 flex items-center gap-1 relative px-2 py-1"
      >
        <Bell className="h-4 w-4 text-tramhuong-accent transition-all duration-300" />
        <span>Thông Báo</span>
        {count > 0 && (
          <span className="absolute top-0 right-0 bg-tramhuong-accent/20 border border-tramhuong-accent text-tramhuong-primary text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-bold z-10 transition-all duration-300">
            {count > 99 ? '99+' : count}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white/60 backdrop-blur-md rounded-lg shadow-[0_8px_32px_rgba(193,168,117,0.3)] border border-tramhuong-accent/20 z-50 max-h-96 overflow-y-auto">
          <div className="p-3 border-b border-tramhuong-accent/20 bg-tramhuong-accent/10 backdrop-blur-sm">
            <h3 className="font-playfair font-semibold text-tramhuong-primary text-sm">
              Thông báo ({count})
            </h3>
          </div>
          
          {isLoading ? (
            <div className="p-4 text-center text-tramhuong-accent text-sm">
              Đang tải...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-tramhuong-accent text-sm">
              Không có thông báo mới
            </div>
          ) : (
            <div className="divide-y divide-tramhuong-accent/10">
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification.id, notification.orderId)}
                  className="w-full p-3 hover:bg-tramhuong-accent/10 transition-all duration-300 text-left"
                >
                  <div className="flex items-start gap-2">
                    <div className="bg-tramhuong-accent/20 text-tramhuong-accent rounded-full p-1.5 mt-0.5 transition-all duration-300">
                      <Bell className="h-3 w-3" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-tramhuong-primary font-medium mb-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-tramhuong-accent">
                        {formatDistanceToNow(new Date(notification.createdAt), {
                          addSuffix: true,
                          locale: vi,
                        })}
                      </p>
                    </div>
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
