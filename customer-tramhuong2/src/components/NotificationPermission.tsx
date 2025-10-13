'use client'

import { useState, useEffect } from 'react';
import { Bell, BellOff, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  isNotificationSupported,
  requestNotificationPermission,
  subscribeToPushNotifications,
  getNotificationSubscription
} from '@/lib/notificationService';

export function NotificationPermission() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    if (isNotificationSupported()) {
      setPermission(Notification.permission);
      
      getNotificationSubscription().then(sub => {
        setIsSubscribed(!!sub);
        
        if (!sub && Notification.permission === 'default') {
          setShowBanner(true);
        }
      });
    }
  }, []);
  
  const handleEnableNotifications = async () => {
    setIsLoading(true);
    try {
      const perm = await requestNotificationPermission();
      setPermission(perm);
      
      if (perm === 'granted') {
        await subscribeToPushNotifications();
        setIsSubscribed(true);
        setShowBanner(false);
        
        new Notification('Thông báo đã bật!', {
          body: 'Bạn sẽ nhận được thông báo về đơn hàng mới, trả hàng và các sự kiện quan trọng.',
          icon: '/logo.png'
        });
      }
    } catch (error) {
      console.error('Failed to enable notifications:', error);
      alert('Không thể bật thông báo. Vui lòng kiểm tra cài đặt trình duyệt.');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!isNotificationSupported()) {
    return null;
  }
  
  if (showBanner && permission !== 'granted') {
    return (
      <Card className="mb-4 border-tramhuong-accent/20 bg-white/60 backdrop-blur-md shadow-[0_8px_32px_rgba(193,168,117,0.3)]">
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-tramhuong-accent transition-all duration-300" />
              <div>
                <p className="font-playfair font-medium text-tramhuong-primary">
                  Bật thông báo để không bỏ lỡ đơn hàng
                </p>
                <p className="text-sm text-tramhuong-accent">
                  Nhận thông báo ngay khi có đơn hàng mới, yêu cầu trả hàng
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleEnableNotifications}
                disabled={isLoading}
                className="bg-tramhuong-accent hover:bg-tramhuong-accent/80 text-white transition-all duration-300"
              >
                {isLoading ? 'Đang bật...' : 'Bật thông báo'}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowBanner(false)}
                className="text-tramhuong-accent hover:text-tramhuong-primary transition-all duration-300"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="flex items-center gap-2">
      {isSubscribed ? (
        <div className="flex items-center gap-1 text-tramhuong-accent text-sm transition-all duration-300">
          <Bell className="w-4 h-4" />
          <span className="hidden sm:inline">Thông báo đang bật</span>
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={handleEnableNotifications}
          disabled={isLoading}
          className="border-tramhuong-accent/20 text-tramhuong-accent hover:bg-tramhuong-accent/10 transition-all duration-300"
        >
          <BellOff className="w-4 h-4 mr-2" />
          Bật thông báo
        </Button>
      )}
    </div>
  );
}
