'use client'

import React, { useState, Suspense } from 'react';
import { Package, Clock, Truck, CheckCircle, Calendar, Eye, Filter, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatVietnamPrice } from '@/utils/currency';
import { useQuery } from '@tanstack/react-query';
import { fetchOrders } from '@/lib/orderApi';
import dynamic from 'next/dynamic';

// Lazy load modals - only load when user opens them
const GiftPurchaseModal = dynamic(() => import('@/components/GiftPurchaseModal').then(mod => mod.GiftPurchaseModal), {
  loading: () => null,
  ssr: false
});

const SchedulePurchaseModal = dynamic(() => import('@/components/SchedulePurchaseModal').then(mod => mod.SchedulePurchaseModal), {
  loading: () => null,
  ssr: false
});

export interface Order {
  id: string;
  orderNumber: string;
  status: 'shipped' | 'delivered';
  date: string;
  total: number;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
    image?: string;
  }>;
  shippingAddress?: string;
  estimatedDelivery?: string;
}

// Demo fallback data (used when API is unavailable)
const FALLBACK_ORDERS: Order[] = [
  {
    id: '1',
    orderNumber: 'DH240927001',
    status: 'delivered',
    date: '2024-09-20',
    total: 850000,
    items: [
      { id: '1', name: 'Nhang trầm hương cao cấp', quantity: 2, price: 300000 },
      { id: '2', name: 'Tinh dầu sả chanh', quantity: 1, price: 250000 }
    ],
    shippingAddress: 'Quận 1, TP.HCM',
    estimatedDelivery: '2024-09-22'
  },
  {
    id: '2',
    orderNumber: 'DH240926015',
    status: 'shipped',
    date: '2024-09-25',
    total: 1200000,
    items: [
      { id: '3', name: 'Bộ bàn thờ phong thủy', quantity: 1, price: 1200000 }
    ],
    shippingAddress: 'Quận 3, TP.HCM',
    estimatedDelivery: '2024-09-28'
  },
  {
    id: '3',
    orderNumber: 'DH240927002',
    status: 'shipped',
    date: '2024-09-27',
    total: 450000,
    items: [
      { id: '4', name: 'Đá phong thủy may mắn', quantity: 3, price: 150000 }
    ],
    shippingAddress: 'Quận 7, TP.HCM'
  },
  {
    id: '4',
    orderNumber: 'DH240927003',
    status: 'delivered',
    date: '2024-09-27',
    total: 320000,
    items: [
      { id: '5', name: 'Cung Ram tháng 7', quantity: 1, price: 320000 }
    ],
    shippingAddress: 'Quận 2, TP.HCM'
  }
];

const ORDER_STATUS_CONFIG = {
  shipped: {
    label: 'Đã gởi',
    color: 'bg-tramhuong-accent/10 backdrop-blur-sm text-tramhuong-primary border-tramhuong-accent/20',
    icon: Truck,
    iconColor: 'text-tramhuong-accent',
    dotColor: 'bg-tramhuong-accent'
  },
  delivered: {
    label: 'Đã giao',
    color: 'bg-tramhuong-accent/20 backdrop-blur-sm text-tramhuong-primary border-tramhuong-accent/30',
    icon: CheckCircle,
    iconColor: 'text-tramhuong-accent',
    dotColor: 'bg-tramhuong-accent'
  }
};

interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
  media?: string;
  category_id: string;
  stock: number;
  short_description?: string;
  status: string;
}

interface OrderHistoryProps {
  className?: string;
  addToCart?: (product: Product) => void;
  setActiveTab?: (tab: string) => void;
}

export function OrderHistory({ className = '', addToCart, setActiveTab }: OrderHistoryProps) {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [giftModalOpen, setGiftModalOpen] = useState<boolean>(false);
  const [selectedGiftOrder, setSelectedGiftOrder] = useState<Order | null>(null);
  
  // Schedule purchase modal state
  const [scheduleModalOpen, setScheduleModalOpen] = useState<boolean>(false);
  const [selectedScheduleOrder, setSelectedScheduleOrder] = useState<Order | null>(null);

  // Fetch orders from API
  const { 
    data: orders = [], 
    isLoading, 
    error,
    isError 
  } = useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: fetchOrders,
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Use API data if available, otherwise fallback data
  const availableOrders: Order[] = isError ? FALLBACK_ORDERS : orders;

  // Log error for debugging if API fails
  React.useEffect(() => {
    if (error) {
      console.warn('Failed to fetch orders, using fallback data:', error);
    }
  }, [error]);

  const filteredOrders = selectedFilter === 'all' 
    ? availableOrders 
    : availableOrders.filter((order: Order) => order.status === selectedFilter);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const StatusBadge = ({ status }: { status: Order['status'] }) => {
    const config = ORDER_STATUS_CONFIG[status];
    const IconComponent = config.icon;

    return (
      <div className={`${config.color} border px-4 py-2 rounded-full font-medium text-sm flex items-center shadow-sm`}>
        <div className={`w-2 h-2 rounded-full ${config.dotColor} mr-2 animate-pulse`}></div>
        <IconComponent className={`h-4 w-4 mr-1.5 ${config.iconColor}`} />
        {config.label}
      </div>
    );
  };

  const toggleOrderDetails = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  // Handle "Mua Lại" functionality
  const handleBuyAgain = (order: Order) => {
    if (!addToCart || !setActiveTab) {
      console.warn('addToCart or setActiveTab functions not available');
      return;
    }

    // Convert order items to Product objects and add to cart
    order.items.forEach((item: Order['items'][0]) => {
      const product: Product = {
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        media: item.image, // Use image as media fallback
        category_id: 'general', // Default category
        stock: 999, // Assume in stock
        short_description: `Sản phẩm từ đơn hàng #${order.orderNumber}`,
        status: 'active'
      };

      // Add each item to cart with original quantity
      for (let i = 0; i < item.quantity; i++) {
        addToCart(product);
      }
    });

    // Switch to cart tab to show added items
    setActiveTab('cart');
    
    // Optional: Show success message (could be enhanced later)
    console.log(`Đã thêm ${order.items.length} sản phẩm từ đơn #${order.orderNumber} vào giỏ hàng`);
  };

  // Handle "Mua Tặng" functionality
  const handleGiftPurchase = (order: Order) => {
    setSelectedGiftOrder(order);
    setGiftModalOpen(true);
  };

  const handleGiftPurchaseConfirm = async (order: Order, recipientInfo: any) => {
    try {
      // In a real app, this would call an API to create a gift order
      console.log('Gift purchase confirmed:', { order, recipientInfo });
      
      // For now, just add to cart like a regular purchase
      if (addToCart && setActiveTab) {
        order.items.forEach((item: Order['items'][0]) => {
          const product: Product = {
            id: item.id,
            name: item.name,
            price: item.price,
            image: item.image,
            media: item.image,
            category_id: 'general',
            stock: 999,
            short_description: `Quà tặng - ${item.name}`,
            status: 'active'
          };

          for (let i = 0; i < item.quantity; i++) {
            addToCart(product);
          }
        });

        setActiveTab('cart');
      }
      
      alert(`Đã tạo đơn quà tặng cho ${recipientInfo.name}!`);
    } catch (error) {
      console.error('Gift purchase failed:', error);
      throw error;
    }
  };

  const handleCloseGiftModal = () => {
    setGiftModalOpen(false);
    setSelectedGiftOrder(null);
  };

  // Handle "Lên Lịch" functionality  
  const handleSchedulePurchase = (order: Order) => {
    setSelectedScheduleOrder(order);
    setScheduleModalOpen(true);
  };

  const handleSchedulePurchaseConfirm = async (order: Order, scheduleInfo: { frequency: 'weekly' | 'biweekly' | 'monthly' | 'quarterly'; startDate: string }) => {
    try {
      // In a real app, this would call an API to create a scheduled order
      console.log('Schedule purchase confirmed:', { order, scheduleInfo });
      
      // For demo purposes, just show success message
      const frequencyText = {
        weekly: 'hàng tuần',
        biweekly: 'hai tuần một lần', 
        monthly: 'hàng tháng',
        quarterly: 'hàng quý'
      };
      
      alert(`Đã lên lịch đặt hàng ${frequencyText[scheduleInfo.frequency]} bắt đầu từ ${scheduleInfo.startDate}!`);
    } catch (error) {
      console.error('Schedule purchase failed:', error);
      throw error;
    }
  };

  const handleCloseScheduleModal = () => {
    setScheduleModalOpen(false);
    setSelectedScheduleOrder(null);
  };

  return (
    <div className={`space-y-5 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-playfair font-bold text-tramhuong-primary tracking-tight">Lịch sử đơn hàng</h2>
        <div className="bg-tramhuong-accent/10 backdrop-blur-sm px-3 py-1 rounded-full border border-tramhuong-accent/20">
          <span className="text-sm font-medium text-tramhuong-accent">
            {filteredOrders.length} đơn hàng
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 bg-white/60 backdrop-blur-md p-2 rounded-xl border border-tramhuong-accent/20 shadow-[0_8px_32px_rgba(193,168,117,0.2)]">
        <button
          onClick={() => setSelectedFilter('all')}
          className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
            selectedFilter === 'all'
              ? 'bg-tramhuong-accent text-white shadow-md border border-tramhuong-accent'
              : 'text-tramhuong-primary hover:text-tramhuong-accent hover:bg-white/50'
          }`}
        >
          Tất cả
        </button>
        {Object.entries(ORDER_STATUS_CONFIG).map(([status, config]) => (
          <button
            key={status}
            onClick={() => setSelectedFilter(status)}
            className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
              selectedFilter === status
                ? 'bg-tramhuong-accent text-white shadow-md border border-tramhuong-accent'
                : 'text-tramhuong-primary hover:text-tramhuong-accent hover:bg-white/50'
            }`}
          >
            {config.label}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-12 px-4">
          <div className="bg-white/60 backdrop-blur-md rounded-2xl shadow-[0_8px_32px_rgba(193,168,117,0.3)] border border-tramhuong-accent/20 p-8 flex flex-col items-center max-w-sm mx-auto">
            <Loader2 className="h-8 w-8 animate-spin text-tramhuong-accent mb-4" />
            <h3 className="text-lg font-playfair font-semibold text-tramhuong-primary mb-2">Đang tải đơn hàng</h3>
            <p className="text-sm text-tramhuong-text text-center">
              Vui lòng đợi trong giây lát...
            </p>
          </div>
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="flex flex-col items-center justify-center py-8 px-4">
          <div className="bg-white/60 backdrop-blur-md border border-tramhuong-accent/20 rounded-2xl shadow-[0_8px_32px_rgba(193,168,117,0.3)] p-6 flex flex-col items-center max-w-sm mx-auto">
            <AlertCircle className="h-8 w-8 text-tramhuong-accent mb-3" />
            <h3 className="text-lg font-semibold text-tramhuong-primary mb-2">Kết nối thất bại</h3>
            <p className="text-sm text-tramhuong-primary text-center mb-4">
              Không thể tải dữ liệu từ server. Hiển thị dữ liệu demo.
            </p>
            <div className="text-xs text-tramhuong-primary/80 bg-tramhuong-accent/10 px-3 py-1 rounded-full">
              Sử dụng dữ liệu fallback
            </div>
          </div>
        </div>
      )}

      {/* Orders List */}
      <div className="space-y-4">
        {!isLoading && filteredOrders.length > 0 ? (
          filteredOrders.map((order: Order, index: number) => (
            <div 
              key={order.id} 
              className={`bg-white/60 backdrop-blur-md rounded-2xl border border-tramhuong-accent/20 shadow-[0_8px_32px_rgba(193,168,117,0.3)] hover:shadow-[0_12px_40px_rgba(193,168,117,0.4)] transition-all duration-300 overflow-hidden ${
                expandedOrder === order.id ? 'ring-2 ring-tramhuong-accent/30' : ''
              }`}
            >
              {/* Desktop-Optimized Layout */}
              <div className="p-4 md:p-6">
                {/* Desktop Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  {/* Order Number & Status - Col 1-3 */}
                  <div className="md:col-span-3">
                    <h3 className="font-playfair font-bold text-base md:text-lg text-tramhuong-primary mb-2 md:mb-0">
                      #{order.orderNumber}
                    </h3>
                    <div className="md:hidden"><StatusBadge status={order.status} /></div>
                  </div>

                  {/* Order Details - Col 4-6 */}
                  <div className="md:col-span-3">
                    <div className="text-sm text-tramhuong-primary/60 mb-1 md:mb-2">
                      {order.shippingAddress || 'Địa chỉ giao hàng'}
                    </div>
                    <div className="text-sm text-tramhuong-primary/60">
                      {formatDate(order.date)}
                    </div>
                  </div>

                  {/* Status & Price - Col 7-9 */}
                  <div className="md:col-span-3 flex flex-col md:items-end">
                    <div className="hidden md:block mb-2"><StatusBadge status={order.status} /></div>
                    <div className="font-playfair font-bold text-tramhuong-accent text-lg md:text-xl">
                      {formatVietnamPrice(order.total)}
                    </div>
                  </div>

                  {/* Actions - Col 10-12 */}
                  <div className="md:col-span-3 flex flex-col gap-2">
                    {/* Desktop: Vertical stacked buttons */}
                    <div className="hidden md:flex md:flex-col gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs px-3 py-2 border-tramhuong-accent/30 text-tramhuong-accent hover:bg-tramhuong-accent/10 transition-all duration-300 w-full"
                        onClick={() => handleBuyAgain(order)}
                      >
                        Mua Lại
                      </Button>
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs px-2 py-1 border-tramhuong-accent/30 text-tramhuong-accent hover:bg-tramhuong-accent/10 transition-all duration-300 flex-1"
                          onClick={() => handleGiftPurchase(order)}
                        >
                          Tặng
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs px-2 py-1 border-tramhuong-accent/30 text-tramhuong-accent hover:bg-tramhuong-accent/10 transition-all duration-300 flex-1"
                          onClick={() => handleSchedulePurchase(order)}
                        >
                          Lịch
                        </Button>
                      </div>
                    </div>
                    
                    {/* Mobile: Horizontal buttons */}
                    <div className="md:hidden flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-sm px-4 py-3 min-h-[44px] border-tramhuong-accent/30 text-tramhuong-accent hover:bg-tramhuong-accent/10 touch-manipulation transition-all duration-300"
                        onClick={() => handleSchedulePurchase(order)}
                      >
                        Lên Lịch
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-sm px-4 py-3 min-h-[44px] border-tramhuong-accent/30 text-tramhuong-accent hover:bg-tramhuong-accent/10 touch-manipulation transition-all duration-300"
                        onClick={() => handleGiftPurchase(order)}
                      >
                        Mua Tặng
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-sm px-4 py-3 min-h-[44px] border-tramhuong-accent/30 text-tramhuong-accent hover:bg-tramhuong-accent/10 touch-manipulation transition-all duration-300"
                        onClick={() => handleBuyAgain(order)}
                      >
                        Mua Lại
                      </Button>
                    </div>
                    
                    {/* View Details Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleOrderDetails(order.id)}
                      className={`text-xs px-3 py-2 transition-all duration-300 md:w-full ${
                        expandedOrder === order.id
                          ? 'border-tramhuong-accent/30 bg-tramhuong-accent/10 text-tramhuong-accent'
                          : 'border-tramhuong-accent/20 hover:border-tramhuong-accent/30 hover:bg-tramhuong-accent/10 text-tramhuong-primary'
                      }`}
                    >
                      <Eye className="h-3 w-3 mr-1 text-tramhuong-accent" />
                      Chi Tiết
                    </Button>
                  </div>
                </div>
              </div>

              {/* Order Details (Expandable) */}
              {expandedOrder === order.id && (
                <div className="border-t border-tramhuong-accent/20 p-5 md:p-6 bg-gradient-to-b from-tramhuong-accent/5 to-white/60 backdrop-blur-sm">
                  <div className="flex items-center mb-4">
                    <Package className="h-5 w-5 text-tramhuong-accent mr-2" />
                    <h4 className="font-playfair font-bold text-tramhuong-primary">Sản phẩm đã đặt</h4>
                  </div>
                  
                  {/* Desktop: Table layout, Mobile: Card layout */}
                  <div className="hidden md:block">
                    <div className="bg-white rounded-lg border border-tramhuong-accent/20 overflow-hidden">
                      <div className="bg-tramhuong-accent/5 px-4 py-3 grid grid-cols-12 gap-4 text-sm font-medium text-tramhuong-primary">
                        <div className="col-span-6">Sản phẩm</div>
                        <div className="col-span-2 text-center">Số lượng</div>
                        <div className="col-span-2 text-center">Đơn giá</div>
                        <div className="col-span-2 text-right">Thành tiền</div>
                      </div>
                      {order.items.map((item: Order['items'][0], itemIndex: number) => (
                        <div 
                          key={item.id} 
                          className="px-4 py-4 grid grid-cols-12 gap-4 items-center border-b border-tramhuong-accent/10 last:border-b-0 hover:bg-tramhuong-accent/5 transition-all duration-300"
                        >
                          <div className="col-span-6">
                            <div className="font-semibold text-tramhuong-primary">{item.name}</div>
                          </div>
                          <div className="col-span-2 text-center">
                            <span className="bg-tramhuong-accent/10 px-3 py-1 rounded-full text-sm">
                              {item.quantity}
                            </span>
                          </div>
                          <div className="col-span-2 text-center text-tramhuong-primary/60">
                            {formatVietnamPrice(item.price)}
                          </div>
                          <div className="col-span-2 text-right">
                            <div className="bg-tramhuong-accent/10 px-3 py-2 rounded-lg inline-block">
                              <div className="font-bold text-tramhuong-accent">
                                {formatVietnamPrice(item.price * item.quantity)}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Mobile: Card layout */}
                  <div className="md:hidden space-y-4">
                    {order.items.map((item: Order['items'][0], itemIndex: number) => (
                      <div 
                        key={item.id} 
                        className="bg-white rounded-lg p-4 shadow-sm border border-tramhuong-accent/20 flex justify-between items-center"
                      >
                        <div className="flex-1">
                          <div className="font-semibold text-tramhuong-primary mb-1">{item.name}</div>
                          <div className="flex items-center text-xs text-tramhuong-primary/60">
                            <div className="bg-tramhuong-accent/10 px-2 py-1 rounded-full">
                              Số lượng: {item.quantity}
                            </div>
                          </div>
                        </div>
                        <div className="bg-tramhuong-accent/10 px-3 py-2 rounded-lg">
                          <div className="font-bold text-tramhuong-accent">
                            {formatVietnamPrice(item.price * item.quantity)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {order.estimatedDelivery && (
                    <div className="mt-4 p-4 bg-tramhuong-accent/10 backdrop-blur-sm rounded-xl border-l-4 border-tramhuong-accent">
                      <div className="flex items-center text-tramhuong-primary">
                        <Truck className="h-5 w-5 mr-2 text-tramhuong-accent" />
                        <div>
                          <div className="font-playfair font-semibold">Dự kiến giao hàng</div>
                          <div className="text-sm">{formatDate(order.estimatedDelivery)}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-6 p-4 md:p-6 bg-tramhuong-accent/10 backdrop-blur-sm rounded-xl border border-tramhuong-accent/20">
                    <div className="flex justify-between items-center">
                      <div className="text-tramhuong-primary font-playfair font-semibold text-lg">Tổng thanh toán:</div>
                      <div className="text-2xl md:text-3xl font-playfair font-bold text-tramhuong-accent">
                        {formatVietnamPrice(order.total)}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : !isLoading ? (
          <div className="text-center py-16 bg-gradient-to-b from-white to-tramhuong-accent/5 rounded-2xl border border-tramhuong-accent/20 shadow-lg">
            <div className="w-20 h-20 bg-tramhuong-accent/10 rounded-full mx-auto mb-6 flex items-center justify-center">
              <Package className="h-10 w-10 text-tramhuong-accent" />
            </div>
            <h3 className="text-xl font-bold text-tramhuong-primary mb-3">Chưa có đơn hàng</h3>
            <p className="text-tramhuong-primary/60 mb-8 max-w-md mx-auto leading-relaxed">
              {selectedFilter === 'all' 
                ? 'Bạn chưa có đơn hàng nào. Hãy khám phá các sản phẩm tuyệt vời của chúng tôi!' 
                : `Không có đơn hàng nào ở trạng thái "${ORDER_STATUS_CONFIG[selectedFilter as keyof typeof ORDER_STATUS_CONFIG]?.label}".`
              }
            </p>
            <Button 
              className="bg-gradient-to-r from-tramhuong-accent to-tramhuong-primary hover:from-tramhuong-primary hover:to-tramhuong-accent text-white px-8 py-3 rounded-xl font-semibold shadow-lg transition-all duration-200 transform hover:scale-105"
              onClick={() => window.location.href = '/'}
            >
              Mua sắm ngay
            </Button>
          </div>
        ) : null}
      </div>

      {/* Gift Purchase Modal */}
      <Suspense fallback={null}>
        <GiftPurchaseModal
          order={selectedGiftOrder}
          isOpen={giftModalOpen}
          onClose={handleCloseGiftModal}
          onGiftPurchase={handleGiftPurchaseConfirm}
        />
      </Suspense>

      {/* Schedule Purchase Modal */}
      <Suspense fallback={null}>
        <SchedulePurchaseModal
          order={selectedScheduleOrder}
          isOpen={scheduleModalOpen}
          onClose={handleCloseScheduleModal}
          onSchedulePurchase={handleSchedulePurchaseConfirm}
        />
      </Suspense>
    </div>
  );
}