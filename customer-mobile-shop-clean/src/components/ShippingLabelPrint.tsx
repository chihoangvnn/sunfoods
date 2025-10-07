'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { VendorOrder } from '@/types/vendor';
import { Package, MapPin, User } from 'lucide-react';

interface ShippingLabelPrintProps {
  open: boolean;
  onClose: () => void;
  orders: VendorOrder[];
}

export function ShippingLabelPrint({ open, onClose, orders }: ShippingLabelPrintProps) {
  const handlePrint = () => {
    window.print();
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="print:hidden">
          <DialogTitle>Xem trước tem gửi hàng ({orders.length} đơn)</DialogTitle>
          <div className="flex gap-2 pt-4">
            <Button onClick={handlePrint}>
              In ngay
            </Button>
            <Button variant="outline" onClick={onClose}>
              Đóng
            </Button>
          </div>
        </DialogHeader>
        
        <div className="print-container">
          {orders.map((order, index) => (
            <div 
              key={order.id} 
              className="shipping-label"
              style={{ pageBreakAfter: index < orders.length - 1 ? 'always' : 'auto' }}
            >
              <div className="border-b-2 border-black pb-2 mb-2">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold">NHANGSACH.NET</h2>
                    <p className="text-sm">Sản phẩm tâm linh Việt Nam</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">Đơn hàng: {order.orderId}</p>
                    <p className="text-sm">Ngày: {new Date(order.orderDate).toLocaleDateString('vi-VN')}</p>
                  </div>
                </div>
              </div>
              
              <div className="mb-3">
                <div className="flex items-center gap-2 mb-1">
                  <User className="w-4 h-4" />
                  <span className="font-semibold">Người gửi:</span>
                </div>
                <p className="font-medium">{order.vendorName || 'NhangSach.Net'}</p>
                <p className="text-sm">SĐT: 0901234567</p>
                <p className="text-sm">Địa chỉ: 123 Đường ABC, Quận 1, TP.HCM</p>
              </div>
              
              <div className="mb-3 bg-gray-100 p-3 rounded">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="w-4 h-4" />
                  <span className="font-semibold">Người nhận:</span>
                </div>
                <p className="font-bold text-lg">{order.customerName}</p>
                <p className="text-sm font-medium">SĐT: {order.customerPhone || '0909123456'}</p>
                <p className="text-sm">{order.shippingAddress || 'Địa chỉ giao hàng'}</p>
              </div>
              
              <div className="mb-3">
                <div className="flex items-center gap-2 mb-1">
                  <Package className="w-4 h-4" />
                  <span className="font-semibold">Thông tin hàng hóa:</span>
                </div>
                <p className="text-sm">Số lượng sản phẩm: {order.items.length}</p>
                <p className="text-sm">Giá trị: {order.totalAmount.toLocaleString('vi-VN')} ₫</p>
                <p className="text-sm">Thu hộ (COD): {order.totalAmount.toLocaleString('vi-VN')} ₫</p>
              </div>
              
              <div className="text-center border-2 border-dashed border-gray-300 p-4">
                <p className="text-2xl font-mono font-bold">{order.trackingCode}</p>
                <p className="text-xs text-gray-500">Mã vận đơn</p>
              </div>
              
              <div className="mt-3 text-center text-xs text-gray-600 border-t pt-2">
                <p>Đơn vị vận chuyển: {order.shippingCarrier || 'GHN'}</p>
                <p>Lưu ý: Hàng dễ vỡ, xin vui lòng cẩn thận</p>
              </div>
            </div>
          ))}
        </div>
        
        <style jsx>{`
          @media print {
            .print\\:hidden {
              display: none !important;
            }
            
            .shipping-label {
              width: 10cm;
              height: 15cm;
              padding: 1cm;
              border: 2px solid black;
              font-family: Arial, sans-serif;
              box-sizing: border-box;
            }
            
            @page {
              size: 10cm 15cm;
              margin: 0;
            }
          }
          
          .shipping-label {
            width: 10cm;
            padding: 1cm;
            border: 2px solid #ddd;
            margin: 1rem auto;
            font-family: Arial, sans-serif;
            background: white;
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
}
