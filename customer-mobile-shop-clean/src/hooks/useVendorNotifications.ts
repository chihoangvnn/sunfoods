import { useEffect } from 'react';
import { toast } from 'sonner';

export interface VendorNotificationEvent {
  type: 'new_order' | 'return_request' | 'low_stock' | 'payment_reminder' | 'order_delivered' | 'deposit_low';
  title: string;
  message: string;
  data?: any;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function useVendorNotifications() {
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < 0.1) {
        triggerMockNotification();
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);
  
  const triggerNotification = (event: VendorNotificationEvent) => {
    switch (event.type) {
      case 'new_order':
        toast.success(event.title, {
          description: event.message,
          action: event.action ? {
            label: event.action.label,
            onClick: event.action.onClick
          } : undefined,
          duration: 8000
        });
        break;
      
      case 'return_request':
        toast.warning(event.title, {
          description: event.message,
          action: event.action,
          duration: 8000
        });
        break;
      
      case 'low_stock':
        toast.error(event.title, {
          description: event.message,
          action: event.action
        });
        break;
      
      case 'payment_reminder':
        toast.info(event.title, {
          description: event.message,
          action: event.action,
          duration: 10000
        });
        break;
      
      case 'deposit_low':
        toast.error('⚠️ Số dư ký quỹ thấp', {
          description: event.message,
          action: event.action,
          duration: 12000
        });
        break;
      
      case 'order_delivered':
        toast.success('✅ ' + event.title, {
          description: event.message,
          action: event.action
        });
        break;
      
      default:
        toast(event.title, {
          description: event.message
        });
    }
  };
  
  const triggerMockNotification = () => {
    const mockEvents: VendorNotificationEvent[] = [
      {
        type: 'new_order',
        title: 'Đơn hàng mới!',
        message: 'Bạn có đơn hàng mới từ khách Nguyễn V.A - Giá trị: 450,000₫',
        action: {
          label: 'Xem đơn',
          onClick: () => window.location.href = '/vendor/orders'
        }
      },
      {
        type: 'return_request',
        title: 'Yêu cầu trả hàng',
        message: 'Khách hàng yêu cầu trả "Bộ trầm hương Kỳ Nam" - Lý do: Lỗi sản phẩm',
        action: {
          label: 'Xử lý ngay',
          onClick: () => window.location.href = '/vendor/returns'
        }
      },
      {
        type: 'low_stock',
        title: 'Sản phẩm sắp hết hàng',
        message: 'Sách Kinh Phật Bà chỉ còn 5 cuốn. Hãy nhập thêm hàng!',
        action: {
          label: 'Xem kho',
          onClick: () => window.location.href = '/vendor/products'
        }
      },
      {
        type: 'deposit_low',
        title: 'Số dư ký quỹ thấp',
        message: 'Số dư hiện tại: 850,000₫ - Dưới mức tối thiểu 1,000,000₫',
        action: {
          label: 'Nạp tiền',
          onClick: () => alert('Chuyển đến trang nạp tiền')
        }
      }
    ];
    
    const randomEvent = mockEvents[Math.floor(Math.random() * mockEvents.length)];
    triggerNotification(randomEvent);
  };
  
  return {
    triggerNotification,
    triggerMockNotification
  };
}
