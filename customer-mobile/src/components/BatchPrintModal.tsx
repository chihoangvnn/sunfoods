'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Printer, Package } from 'lucide-react';

interface BatchPrintModalProps {
  open: boolean;
  onClose: () => void;
  orders: any[];
}

export function BatchPrintModal({ open, onClose, orders }: BatchPrintModalProps) {
  const handlePrint = (type: 'labels' | 'slips') => {
    window.print();
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>In hàng loạt - {orders.length} đơn hàng</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="labels" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="labels">
              <Printer className="w-4 h-4 mr-2" />
              Nhãn vận chuyển
            </TabsTrigger>
            <TabsTrigger value="slips">
              <Package className="w-4 h-4 mr-2" />
              Phiếu đóng gói
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="labels" className="space-y-4">
            <div className="grid grid-cols-2 gap-4 printable-labels">
              {orders.map(order => (
                <div key={order.id} className="border rounded p-4 print-label">
                  <div className="space-y-2">
                    <div className="font-bold text-lg">NhangSach.Net</div>
                    <div className="border-t pt-2">
                      <div className="font-semibold">Người nhận:</div>
                      <div>{order.maskedCustomerName}</div>
                      <div className="text-sm text-gray-600">{order.maskedAddress}</div>
                      <div className="text-sm">{order.maskedCustomerPhone}</div>
                    </div>
                    <div className="border-t pt-2">
                      <div className="font-semibold">Mã đơn: {order.orderId}</div>
                      <div className="text-sm">
                        Số lượng: {order.items?.length || 0} sản phẩm
                      </div>
                      <div className="text-sm">
                        Thu hộ: {order.codAmount.toLocaleString('vi-VN')} ₫
                      </div>
                    </div>
                    <div className="border-t pt-2">
                      <div className="text-sm">
                        Dịch vụ: {order.shippingCarrier || 'GHN'}
                      </div>
                      <div className="text-sm">
                        Mã vận đơn: {order.trackingCode}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2 no-print">
              <Button variant="outline" onClick={onClose}>
                Đóng
              </Button>
              <Button onClick={() => handlePrint('labels')}>
                <Printer className="w-4 h-4 mr-2" />
                In nhãn
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="slips" className="space-y-4">
            <div className="space-y-6 printable-slips">
              {orders.map(order => (
                <div key={order.id} className="border rounded p-6 print-slip page-break">
                  <div className="text-center mb-4">
                    <h2 className="text-2xl font-bold">PHIẾU ĐÓNG GÓI</h2>
                    <div className="text-gray-600">NhangSach.Net</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="font-semibold">Mã đơn hàng:</div>
                      <div className="text-lg">{order.orderId}</div>
                    </div>
                    <div>
                      <div className="font-semibold">Ngày đặt:</div>
                      <div>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</div>
                    </div>
                  </div>
                  
                  <div className="border rounded p-4 mb-4 bg-gray-50">
                    <div className="font-semibold mb-2">Thông tin người nhận:</div>
                    <div>{order.maskedCustomerName}</div>
                    <div className="text-sm text-gray-600">{order.maskedAddress}</div>
                    <div className="text-sm">{order.maskedCustomerPhone}</div>
                  </div>
                  
                  <table className="w-full border mb-4">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border p-2 text-left">Sản phẩm</th>
                        <th className="border p-2 text-center w-24">SL</th>
                        <th className="border p-2 text-right w-32">Đơn giá</th>
                        <th className="border p-2 text-right w-32">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items?.map((item: any, idx: number) => (
                        <tr key={idx}>
                          <td className="border p-2">{item.name || 'Sản phẩm'}</td>
                          <td className="border p-2 text-center">{item.quantity || 1}</td>
                          <td className="border p-2 text-right">
                            {(item.price || 0).toLocaleString('vi-VN')} ₫
                          </td>
                          <td className="border p-2 text-right">
                            {((item.quantity || 1) * (item.price || 0)).toLocaleString('vi-VN')} ₫
                          </td>
                        </tr>
                      )) || (
                        <tr>
                          <td colSpan={4} className="border p-2 text-center text-gray-500">
                            Không có thông tin sản phẩm
                          </td>
                        </tr>
                      )}
                      <tr className="font-bold bg-gray-50">
                        <td colSpan={3} className="border p-2 text-right">Tổng cộng:</td>
                        <td className="border p-2 text-right">
                          {order.codAmount.toLocaleString('vi-VN')} ₫
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  
                  <div className="flex justify-between text-sm text-gray-600">
                    <div>Mã vận đơn: {order.trackingCode}</div>
                    <div>Vận chuyển: {order.shippingCarrier || 'GHN'}</div>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t text-center text-sm text-gray-500">
                    Cảm ơn quý khách đã mua hàng tại NhangSach.Net
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2 no-print">
              <Button variant="outline" onClick={onClose}>
                Đóng
              </Button>
              <Button onClick={() => handlePrint('slips')}>
                <Printer className="w-4 h-4 mr-2" />
                In phiếu
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
