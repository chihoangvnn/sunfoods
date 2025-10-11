'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { VendorOrder } from '@/types/vendor';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface PackingSlipPrintProps {
  open: boolean;
  onClose: () => void;
  orders: VendorOrder[];
}

export function PackingSlipPrint({ open, onClose, orders }: PackingSlipPrintProps) {
  const handlePrint = () => {
    window.print();
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="print:hidden">
          <DialogTitle>Xem trước phiếu đóng gói ({orders.length} đơn)</DialogTitle>
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
              className="packing-slip"
              style={{ pageBreakAfter: index < orders.length - 1 ? 'always' : 'auto' }}
            >
              <div className="text-center border-b-2 border-black pb-4 mb-4">
                <h1 className="text-2xl font-bold">PHIẾU ĐÓNG GÓI</h1>
                <h2 className="text-xl">NHANGSACH.NET</h2>
                <p className="text-sm">Sản phẩm tâm linh Việt Nam</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p><strong>Mã đơn hàng:</strong> {order.orderId}</p>
                  <p><strong>Ngày đặt:</strong> {new Date(order.orderDate).toLocaleDateString('vi-VN')}</p>
                  <p><strong>Người bán:</strong> {order.vendorName}</p>
                </div>
                <div>
                  <p><strong>Khách hàng:</strong> {order.customerName}</p>
                  <p><strong>Số điện thoại:</strong> {order.customerPhone || '0909123456'}</p>
                  <p><strong>Địa chỉ:</strong> {order.shippingAddress || 'Địa chỉ giao hàng'}</p>
                </div>
              </div>
              
              <Table className="border">
                <TableHeader>
                  <TableRow>
                    <TableHead className="border">STT</TableHead>
                    <TableHead className="border">Sản phẩm</TableHead>
                    <TableHead className="border text-center">Số lượng</TableHead>
                    <TableHead className="border text-right">Đơn giá</TableHead>
                    <TableHead className="border text-right">Thành tiền</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="border">{idx + 1}</TableCell>
                      <TableCell className="border">{item.productName}</TableCell>
                      <TableCell className="border text-center">{item.quantity}</TableCell>
                      <TableCell className="border text-right">
                        {item.price.toLocaleString('vi-VN')} ₫
                      </TableCell>
                      <TableCell className="border text-right">
                        {(item.quantity * item.price).toLocaleString('vi-VN')} ₫
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              <div className="mt-4 text-right">
                <p className="text-lg">
                  <strong>Tổng cộng:</strong>{' '}
                  <span className="text-xl font-bold">
                    {order.totalAmount.toLocaleString('vi-VN')} ₫
                  </span>
                </p>
                {order.paymentStatus === 'cod' && (
                  <p className="text-red-600 font-medium">Thu hộ (COD)</p>
                )}
              </div>
              
              <div className="mt-6 border-t pt-4">
                <p className="text-sm"><strong>Ghi chú:</strong> {order.notes || 'Không có ghi chú'}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-8 mt-8">
                <div className="text-center">
                  <p className="font-medium mb-12">Người đóng gói</p>
                  <p className="text-sm text-gray-600">(Ký và ghi rõ họ tên)</p>
                </div>
                <div className="text-center">
                  <p className="font-medium mb-12">Người nhận hàng</p>
                  <p className="text-sm text-gray-600">(Ký và ghi rõ họ tên)</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <style jsx>{`
          @media print {
            .print\\:hidden {
              display: none !important;
            }
            
            .packing-slip {
              padding: 2cm;
              font-family: Arial, sans-serif;
            }
            
            @page {
              size: A4;
              margin: 1cm;
            }
          }
          
          .packing-slip {
            padding: 2rem;
            max-width: 21cm;
            margin: 1rem auto;
            background: white;
            border: 1px solid #ddd;
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
}
