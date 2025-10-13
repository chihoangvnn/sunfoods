'use client'

import React, { useState } from 'react';
import { X, Gift, MapPin, Phone, User, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatVietnamPrice } from '@/utils/currency';
import { Order } from '@/components/OrderHistory';

interface GiftPurchaseModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onGiftPurchase: (order: Order, recipientInfo: RecipientInfo) => void;
}

interface RecipientInfo {
  name: string;
  phone: string;
  address: string;
  message?: string;
}

export function GiftPurchaseModal({ order, isOpen, onClose, onGiftPurchase }: GiftPurchaseModalProps) {
  const [recipientInfo, setRecipientInfo] = useState<RecipientInfo>({
    name: '',
    phone: '',
    address: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !order) return null;

  const handleInputChange = (field: keyof RecipientInfo) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setRecipientInfo(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!recipientInfo.name.trim() || !recipientInfo.phone.trim() || !recipientInfo.address.trim()) {
      alert('Vui lòng điền đầy đủ thông tin người nhận');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onGiftPurchase(order, recipientInfo);
      
      // Reset form and close modal
      setRecipientInfo({ name: '', phone: '', address: '', message: '' });
      onClose();
    } catch (error) {
      console.error('Gift purchase failed:', error);
      alert('Có lỗi xảy ra khi xử lý quà tặng. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      setRecipientInfo({ name: '', phone: '', address: '', message: '' });
    }
  };

  return (
    <div>
      <div className="fixed inset-0 bg-black/50 z-50 animate-in fade-in-0 duration-300" onClick={handleClose} />
      
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white/60 backdrop-blur-md rounded-2xl max-w-lg w-full max-h-[90vh] animate-in slide-in-from-bottom-4 zoom-in-95 duration-300 shadow-[0_8px_32px_rgba(193,168,117,0.3)] flex flex-col">
          <div className="flex items-center justify-between p-6 border-b border-tramhuong-accent/20 bg-tramhuong-accent/10 flex-shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/60 backdrop-blur-md border border-tramhuong-accent/30 rounded-full flex items-center justify-center">
                <Gift className="w-5 h-5 text-tramhuong-accent" />
              </div>
              <div>
                <h2 className="text-xl font-playfair font-bold text-tramhuong-primary">Mua tặng</h2>
                <p className="text-sm text-tramhuong-accent">#{order.orderNumber}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleClose} className="h-8 w-8 p-0 hover:bg-white/80 transition-all duration-300" disabled={isSubmitting}>
              <X className="w-4 h-4 text-tramhuong-accent" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              
              <div className="bg-tramhuong-accent/5 rounded-xl p-4 border border-tramhuong-accent/20">
                <h3 className="font-playfair font-semibold text-tramhuong-primary mb-3">Đơn hàng được tặng</h3>
                <div className="space-y-2 mb-3">
                  {order.items.map((item, index) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-tramhuong-primary/70">
                        {item.name} x{item.quantity}
                      </span>
                      <span className="font-medium text-tramhuong-primary">
                        {formatVietnamPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-tramhuong-accent/20 pt-2">
                  <div className="flex justify-between font-bold text-tramhuong-accent">
                    <span>Tổng cộng:</span>
                    <span>{formatVietnamPrice(order.total)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-playfair font-semibold text-tramhuong-primary flex items-center">
                  <User className="w-5 h-5 mr-2 text-tramhuong-accent" />
                  Thông tin người nhận
                </h3>

                <div>
                  <label className="block text-sm font-medium text-tramhuong-primary mb-2">
                    Họ và tên *
                  </label>
                  <input
                    type="text"
                    value={recipientInfo.name}
                    onChange={handleInputChange('name')}
                    placeholder="Nhập họ tên người nhận"
                    className="w-full px-4 py-3 border border-tramhuong-accent/20 rounded-lg focus:ring-2 focus:ring-tramhuong-accent focus:border-tramhuong-accent transition-all duration-300"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-tramhuong-primary mb-2">
                    Số điện thoại *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 w-5 h-5 text-tramhuong-accent/60" />
                    <input
                      type="tel"
                      value={recipientInfo.phone}
                      onChange={handleInputChange('phone')}
                      placeholder="0xxx xxx xxx"
                      className="w-full pl-12 pr-4 py-3 border border-tramhuong-accent/20 rounded-lg focus:ring-2 focus:ring-tramhuong-accent focus:border-tramhuong-accent transition-all duration-300"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-tramhuong-primary mb-2">
                    Địa chỉ giao hàng *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-5 h-5 text-tramhuong-accent/60" />
                    <input
                      type="text"
                      value={recipientInfo.address}
                      onChange={handleInputChange('address')}
                      placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành"
                      className="w-full pl-12 pr-4 py-3 border border-tramhuong-accent/20 rounded-lg focus:ring-2 focus:ring-tramhuong-accent focus:border-tramhuong-accent transition-all duration-300"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-tramhuong-primary mb-2">
                    Lời chúc (tùy chọn)
                  </label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-tramhuong-accent/60" />
                    <textarea
                      value={recipientInfo.message}
                      onChange={handleInputChange('message')}
                      placeholder="Nhập lời chúc cho người nhận..."
                      rows={3}
                      className="w-full pl-12 pr-4 py-3 border border-tramhuong-accent/20 rounded-lg focus:ring-2 focus:ring-tramhuong-accent focus:border-tramhuong-accent transition-all duration-300 resize-none"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="flex-1 border-tramhuong-accent/30 text-tramhuong-primary hover:bg-tramhuong-accent/10 transition-all duration-300"
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !recipientInfo.name.trim() || !recipientInfo.phone.trim() || !recipientInfo.address.trim()}
                  className="flex-1 bg-tramhuong-accent hover:bg-tramhuong-accent/90 text-white transition-all duration-300"
                >
                  {isSubmitting ? 'Đang xử lý...' : 'Xác nhận tặng'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}