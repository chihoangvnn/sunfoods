'use client'

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  mockDepositTransactions, 
  mockVendor, 
  mockMonthlyInvoices,
  mockMonthlyPayments,
  mockUpfrontPurchases,
  mockUpfrontPayments,
  mockRevenueReports,
  mockPayoutHistory
} from '@/data/mockVendorData';
import { PaymentModel } from '@/types/vendor';
import { 
  Wallet, 
  Plus, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  RefreshCcw,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Download,
  Eye,
  Receipt,
  CreditCard
} from 'lucide-react';

const getFinancialTabs = (model: PaymentModel) => {
  switch (model) {
    case 'deposit':
      return ['Giao dịch ký quỹ', 'Lịch sử trừ tiền'];
    case 'monthly':
      return ['Hóa đơn', 'Lịch sử thanh toán', 'Công nợ'];
    case 'upfront':
      return ['Lịch sử mua hàng', 'Thanh toán'];
    case 'revenue_share':
      return ['Báo cáo doanh thu', 'Lịch sử chi trả'];
    default:
      return ['Giao dịch'];
  }
};

const StatusBadge = ({ status }: { status: string }) => {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    paid: { bg: 'bg-green-100', text: 'text-green-800', label: 'Đã thanh toán' },
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Chờ thanh toán' },
    overdue: { bg: 'bg-red-100', text: 'text-red-800', label: 'Quá hạn' },
    completed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Hoàn thành' }
  };

  const { bg, text, label } = config[status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: status };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${bg} ${text}`}>
      {label}
    </span>
  );
};

export default function VendorFinancial() {
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');

  const tabs = getFinancialTabs(mockVendor.paymentModel);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const handleDepositRequest = () => {
    console.log('Deposit request:', { amount: depositAmount });
    setDepositModalOpen(false);
    setDepositAmount('');
  };

  const renderDepositTab1 = () => {
    const transactionsWithBalance = useMemo(() => {
      const sorted = [...mockDepositTransactions].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      let runningBalance = 0;
      const withBalance = sorted.reverse().map(transaction => {
        if (transaction.type === 'deposit' || transaction.type === 'refund') {
          runningBalance += transaction.amount;
        } else if (transaction.type === 'deduction') {
          runningBalance -= transaction.amount;
        }
        return {
          ...transaction,
          balanceAfter: runningBalance
        };
      });

      return withBalance.reverse();
    }, []);

    const getTransactionIcon = (type: string) => {
      switch (type) {
        case 'deposit':
          return <ArrowDownCircle className="h-5 w-5 text-green-600" />;
        case 'deduction':
          return <ArrowUpCircle className="h-5 w-5 text-red-600" />;
        case 'refund':
          return <RefreshCcw className="h-5 w-5 text-blue-600" />;
        default:
          return <Wallet className="h-5 w-5 text-gray-600" />;
      }
    };

    const getTransactionColor = (type: string) => {
      switch (type) {
        case 'deposit':
          return 'text-green-600';
        case 'deduction':
          return 'text-red-600';
        case 'refund':
          return 'text-blue-600';
        default:
          return 'text-gray-600';
      }
    };

    const getTransactionLabel = (type: string) => {
      switch (type) {
        case 'deposit':
          return 'Nạp tiền';
        case 'deduction':
          return 'Khấu trừ';
        case 'refund':
          return 'Hoàn tiền';
        default:
          return type;
      }
    };

    return (
      <div className="space-y-4">
        <div className="hidden md:block">
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày giờ</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loại</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mô tả</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Số tiền</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Số dư sau</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {transactionsWithBalance.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {new Date(transaction.createdAt).toLocaleString('vi-VN')}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {getTransactionIcon(transaction.type)}
                          <span className={`text-sm font-medium ${getTransactionColor(transaction.type)}`}>
                            {getTransactionLabel(transaction.type)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{transaction.description}</td>
                      <td className={`px-4 py-3 text-sm text-right font-semibold ${getTransactionColor(transaction.type)}`}>
                        {transaction.type === 'deduction' ? '-' : '+'}
                        {formatCurrency(transaction.amount)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                        {formatCurrency(transaction.balanceAfter)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div className="md:hidden space-y-3">
          {transactionsWithBalance.map((transaction) => (
            <Card key={transaction.id} className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getTransactionIcon(transaction.type)}
                  <span className={`text-sm font-medium ${getTransactionColor(transaction.type)}`}>
                    {getTransactionLabel(transaction.type)}
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(transaction.createdAt).toLocaleDateString('vi-VN')}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{transaction.description}</p>
              <div className="flex justify-between items-center">
                <span className={`text-lg font-bold ${getTransactionColor(transaction.type)}`}>
                  {transaction.type === 'deduction' ? '-' : '+'}
                  {formatCurrency(transaction.amount)}
                </span>
                <span className="text-sm text-gray-600">
                  Số dư: <span className="font-semibold">{formatCurrency(transaction.balanceAfter)}</span>
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const renderDepositTab2 = () => {
    const deductions = mockDepositTransactions.filter(t => t.type === 'deduction');

    return (
      <div className="space-y-4">
        <div className="hidden md:block">
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày giờ</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã đơn hàng</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mô tả</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Số tiền COD</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Số tiền trừ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {deductions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {new Date(transaction.createdAt).toLocaleString('vi-VN')}
                      </td>
                      <td className="px-4 py-3">
                        {transaction.orderId ? (
                          <a href={`/vendor/orders`} className="text-sm text-orange-600 hover:underline font-medium">
                            {transaction.orderId}
                          </a>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{transaction.description}</td>
                      <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">
                        {formatCurrency(transaction.amount)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-semibold text-red-600">
                        -{formatCurrency(transaction.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div className="md:hidden space-y-3">
          {deductions.map((transaction) => (
            <Card key={transaction.id} className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <ArrowUpCircle className="h-5 w-5 text-red-600" />
                  <span className="text-sm font-medium text-red-600">Khấu trừ</span>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(transaction.createdAt).toLocaleDateString('vi-VN')}
                </span>
              </div>
              {transaction.orderId && (
                <a href={`/vendor/orders`} className="text-sm text-orange-600 hover:underline font-medium mb-1 block">
                  {transaction.orderId}
                </a>
              )}
              <p className="text-sm text-gray-600 mb-2">{transaction.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  COD: <span className="font-semibold">{formatCurrency(transaction.amount)}</span>
                </span>
                <span className="text-lg font-bold text-red-600">
                  -{formatCurrency(transaction.amount)}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const renderMonthlyTab1 = () => (
    <div className="space-y-4">
      <div className="hidden md:block">
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã hóa đơn</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kỳ hạn</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Tổng tiền</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hạn thanh toán</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {mockMonthlyInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{invoice.id}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{invoice.period}</td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">
                      {formatCurrency(invoice.totalDue)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{invoice.dueDate}</td>
                    <td className="px-4 py-3 text-center">
                      <StatusBadge status={invoice.status} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        PDF
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <div className="md:hidden space-y-3">
        {mockMonthlyInvoices.map((invoice) => (
          <Card key={invoice.id} className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-gray-900">{invoice.id}</p>
                <p className="text-xs text-gray-500">{invoice.period}</p>
              </div>
              <StatusBadge status={invoice.status} />
            </div>
            <div className="space-y-2 mb-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Tổng tiền:</span>
                <span className="text-sm font-semibold text-gray-900">{formatCurrency(invoice.totalDue)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Hạn thanh toán:</span>
                <span className="text-sm text-gray-900">{invoice.dueDate}</span>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Tải PDF
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderMonthlyTab2 = () => (
    <div className="space-y-4">
      <div className="hidden md:block">
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày thanh toán</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã hóa đơn</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Số tiền</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phương thức</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã tham chiếu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {mockMonthlyPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{payment.paymentDate}</td>
                    <td className="px-4 py-3 text-sm font-medium text-orange-600">{payment.invoiceId}</td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-green-600">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{payment.method}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 font-mono">{payment.reference}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <div className="md:hidden space-y-3">
        {mockMonthlyPayments.map((payment) => (
          <Card key={payment.id} className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-sm font-medium text-orange-600">{payment.invoiceId}</p>
                <p className="text-xs text-gray-500">{payment.paymentDate}</p>
              </div>
              <span className="text-lg font-bold text-green-600">{formatCurrency(payment.amount)}</span>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-600">
                <span className="font-medium">Phương thức:</span> {payment.method}
              </p>
              <p className="text-xs text-gray-600">
                <span className="font-medium">Mã tham chiếu:</span> <span className="font-mono">{payment.reference}</span>
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderMonthlyTab3 = () => (
    <div className="space-y-4">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tổng quan công nợ</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">Hạn mức tín dụng</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(mockVendor.creditLimit || 0)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Đã sử dụng</p>
            <p className="text-2xl font-bold text-orange-600">{formatCurrency(mockVendor.creditUsed || 0)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Còn lại</p>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency((mockVendor.creditLimit || 0) - (mockVendor.creditUsed || 0))}
            </p>
          </div>
        </div>
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-orange-600 h-3 rounded-full transition-all"
              style={{ width: `${((mockVendor.creditUsed || 0) / (mockVendor.creditLimit || 1)) * 100}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            {(((mockVendor.creditUsed || 0) / (mockVendor.creditLimit || 1)) * 100).toFixed(1)}% đã sử dụng
          </p>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Phân tích độ tuổi công nợ</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
            <span className="text-sm font-medium text-gray-700">Hiện tại (0-30 ngày)</span>
            <span className="text-sm font-bold text-green-600">{formatCurrency(8500000)}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
            <span className="text-sm font-medium text-gray-700">30-60 ngày</span>
            <span className="text-sm font-bold text-yellow-600">{formatCurrency(0)}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
            <span className="text-sm font-medium text-gray-700">Trên 60 ngày</span>
            <span className="text-sm font-bold text-red-600">{formatCurrency(0)}</span>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderUpfrontTab1 = () => (
    <div className="space-y-4">
      <div className="hidden md:block">
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã PO</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Số SP</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Tổng tiền</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {mockUpfrontPurchases.map((po) => (
                  <tr key={po.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{po.id}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{po.date}</td>
                    <td className="px-4 py-3 text-sm text-right text-gray-900">{po.productsCount}</td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">
                      {formatCurrency(po.totalAmount)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StatusBadge status={po.status} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      {po.receiptUrl && (
                        <Button variant="ghost" size="sm">
                          <Receipt className="h-4 w-4 mr-1" />
                          Biên lai
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <div className="md:hidden space-y-3">
        {mockUpfrontPurchases.map((po) => (
          <Card key={po.id} className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-gray-900">{po.id}</p>
                <p className="text-xs text-gray-500">{po.date}</p>
              </div>
              <StatusBadge status={po.status} />
            </div>
            <div className="space-y-2 mb-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Số sản phẩm:</span>
                <span className="text-sm font-semibold text-gray-900">{po.productsCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Tổng tiền:</span>
                <span className="text-sm font-semibold text-gray-900">{formatCurrency(po.totalAmount)}</span>
              </div>
            </div>
            {po.receiptUrl && (
              <Button variant="outline" size="sm" className="w-full">
                <Receipt className="h-4 w-4 mr-2" />
                Xem biên lai
              </Button>
            )}
          </Card>
        ))}
      </div>
    </div>
  );

  const renderUpfrontTab2 = () => (
    <div className="space-y-4">
      <div className="hidden md:block">
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày thanh toán</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã PO</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Số tiền</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phương thức</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã tham chiếu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {mockUpfrontPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{payment.datePaid}</td>
                    <td className="px-4 py-3 text-sm font-medium text-orange-600">{payment.poNumber}</td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-green-600">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{payment.method}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 font-mono">{payment.reference}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <div className="md:hidden space-y-3">
        {mockUpfrontPayments.map((payment) => (
          <Card key={payment.id} className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-sm font-medium text-orange-600">{payment.poNumber}</p>
                <p className="text-xs text-gray-500">{payment.datePaid}</p>
              </div>
              <span className="text-lg font-bold text-green-600">{formatCurrency(payment.amount)}</span>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-600">
                <span className="font-medium">Phương thức:</span> {payment.method}
              </p>
              <p className="text-xs text-gray-600">
                <span className="font-medium">Mã tham chiếu:</span> <span className="font-mono">{payment.reference}</span>
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderRevenueTab1 = () => (
    <div className="space-y-4">
      <div className="hidden md:block">
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kỳ báo cáo</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Tổng DT</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Phần bạn (70%)</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Phần shop (30%)</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Số đơn</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {mockRevenueReports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{report.period}</td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">
                      {formatCurrency(report.totalRevenue)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-green-600">
                      {formatCurrency(report.vendorShare)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-orange-600">
                      {formatCurrency(report.shopShare)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-900">{report.ordersCount}</td>
                    <td className="px-4 py-3 text-center">
                      <StatusBadge status={report.status} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        Chi tiết
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <div className="md:hidden space-y-3">
        {mockRevenueReports.map((report) => (
          <Card key={report.id} className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-gray-900">{report.period}</p>
                <p className="text-xs text-gray-500">{report.ordersCount} đơn hàng</p>
              </div>
              <StatusBadge status={report.status} />
            </div>
            <div className="space-y-2 mb-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Tổng doanh thu:</span>
                <span className="text-sm font-semibold text-gray-900">{formatCurrency(report.totalRevenue)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Phần bạn (70%):</span>
                <span className="text-sm font-semibold text-green-600">{formatCurrency(report.vendorShare)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Phần shop (30%):</span>
                <span className="text-sm font-semibold text-orange-600">{formatCurrency(report.shopShare)}</span>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full">
              <Eye className="h-4 w-4 mr-2" />
              Xem chi tiết
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderRevenueTab2 = () => (
    <div className="space-y-4">
      <div className="hidden md:block">
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày chi trả</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kỳ báo cáo</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Số tiền</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã chuyển khoản</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {mockPayoutHistory.map((payout) => (
                  <tr key={payout.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {payout.payoutDate || <span className="text-gray-400 italic">Chưa chi trả</span>}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{payout.periodCovered}</td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-green-600">
                      {formatCurrency(payout.revenueShareAmount)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 font-mono">
                      {payout.bankTransferRef || <span className="text-gray-400">-</span>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StatusBadge status={payout.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <div className="md:hidden space-y-3">
        {mockPayoutHistory.map((payout) => (
          <Card key={payout.id} className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-gray-900">{payout.periodCovered}</p>
                <p className="text-xs text-gray-500">
                  {payout.payoutDate || <span className="italic">Chưa chi trả</span>}
                </p>
              </div>
              <StatusBadge status={payout.status} />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Số tiền:</span>
                <span className="text-lg font-bold text-green-600">{formatCurrency(payout.revenueShareAmount)}</span>
              </div>
              {payout.bankTransferRef && (
                <p className="text-xs text-gray-600">
                  <span className="font-medium">Mã CK:</span> <span className="font-mono">{payout.bankTransferRef}</span>
                </p>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderTabContent = (tabIndex: number) => {
    switch (mockVendor.paymentModel) {
      case 'deposit':
        return tabIndex === 0 ? renderDepositTab1() : renderDepositTab2();
      case 'monthly':
        return tabIndex === 0 ? renderMonthlyTab1() : tabIndex === 1 ? renderMonthlyTab2() : renderMonthlyTab3();
      case 'upfront':
        return tabIndex === 0 ? renderUpfrontTab1() : renderUpfrontTab2();
      case 'revenue_share':
        return tabIndex === 0 ? renderRevenueTab1() : renderRevenueTab2();
      default:
        return <div>Unknown payment model</div>;
    }
  };

  const getSummaryCard = () => {
    switch (mockVendor.paymentModel) {
      case 'deposit':
        const balanceStatus = mockVendor.depositBalance > 1000000 
          ? { color: 'text-green-600', bgColor: 'bg-green-100', text: 'Tốt' }
          : mockVendor.depositBalance >= 500000
          ? { color: 'text-yellow-600', bgColor: 'bg-yellow-100', text: 'Cảnh báo' }
          : { color: 'text-red-600', bgColor: 'bg-red-100', text: 'Thấp' };

        return (
          <Card className="p-6 bg-gradient-to-br from-orange-50 to-white border-orange-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-sm text-gray-600">Số dư ký quỹ hiện tại</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${balanceStatus.bgColor} ${balanceStatus.color}`}>
                    {balanceStatus.text}
                  </span>
                </div>
                <p className={`text-4xl font-bold ${balanceStatus.color} mb-2`}>
                  {formatCurrency(mockVendor.depositBalance)}
                </p>
                <p className="text-sm text-gray-500 italic">
                  Số dư ký quỹ tự động trừ khi COD về shop
                </p>
              </div>
              <div className={`h-16 w-16 ${balanceStatus.bgColor} rounded-lg flex items-center justify-center`}>
                <Wallet className={`h-8 w-8 ${balanceStatus.color}`} />
              </div>
            </div>
          </Card>
        );

      case 'monthly':
        return (
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-white border-blue-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-2">Hạn mức tín dụng</p>
                <p className="text-4xl font-bold text-blue-600 mb-2">
                  {formatCurrency((mockVendor.creditLimit || 0) - (mockVendor.creditUsed || 0))}
                </p>
                <p className="text-sm text-gray-500">
                  Còn lại / {formatCurrency(mockVendor.creditLimit || 0)}
                </p>
              </div>
              <div className="h-16 w-16 bg-blue-100 rounded-lg flex items-center justify-center">
                <CreditCard className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </Card>
        );

      case 'upfront':
        return (
          <Card className="p-6 bg-gradient-to-br from-purple-50 to-white border-purple-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-2">Tổng giá trị mua hàng</p>
                <p className="text-4xl font-bold text-purple-600 mb-2">
                  {formatCurrency(mockUpfrontPurchases.reduce((sum, po) => sum + po.totalAmount, 0))}
                </p>
                <p className="text-sm text-gray-500">
                  {mockUpfrontPurchases.length} đơn mua hàng
                </p>
              </div>
              <div className="h-16 w-16 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </Card>
        );

      case 'revenue_share':
        const totalVendorShare = mockRevenueReports.reduce((sum, r) => sum + r.vendorShare, 0);
        return (
          <Card className="p-6 bg-gradient-to-br from-green-50 to-white border-green-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-2">Tổng doanh thu của bạn</p>
                <p className="text-4xl font-bold text-green-600 mb-2">
                  {formatCurrency(totalVendorShare)}
                </p>
                <p className="text-sm text-gray-500">
                  70% doanh thu - {mockRevenueReports.reduce((sum, r) => sum + r.ordersCount, 0)} đơn hàng
                </p>
              </div>
              <div className="h-16 w-16 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tài chính</h1>
          <p className="text-gray-600 mt-1">
            Mô hình thanh toán: <span className="font-semibold">
              {mockVendor.paymentModel === 'deposit' && 'Ký quỹ'}
              {mockVendor.paymentModel === 'monthly' && 'Thanh toán cuối tháng'}
              {mockVendor.paymentModel === 'upfront' && 'Mua đứt bán đoạn'}
              {mockVendor.paymentModel === 'revenue_share' && 'Chia doanh thu'}
            </span>
          </p>
        </div>
        {mockVendor.paymentModel === 'deposit' && (
          <Button 
            className="bg-orange-600 hover:bg-orange-700"
            onClick={() => setDepositModalOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nạp tiền ký quỹ
          </Button>
        )}
      </div>

      {getSummaryCard()}

      <Tabs defaultValue={tabs[0]} className="w-full">
        <TabsList className="w-full md:w-auto overflow-x-auto flex-nowrap justify-start">
          {tabs.map((tab) => (
            <TabsTrigger key={tab} value={tab} className="whitespace-nowrap">
              {tab}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((tab, index) => (
          <TabsContent key={tab} value={tab}>
            {renderTabContent(index)}
          </TabsContent>
        ))}
      </Tabs>

      <Dialog open={depositModalOpen} onOpenChange={setDepositModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nạp tiền ký quỹ</DialogTitle>
            <DialogDescription>
              Nhập số tiền bạn muốn nạp vào tài khoản ký quỹ
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="amount">Số tiền (VNĐ)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Nhập số tiền"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Phương thức thanh toán</Label>
              <p className="text-sm text-gray-600 mt-1">Chuyển khoản ngân hàng</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDepositModalOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleDepositRequest} className="bg-orange-600 hover:bg-orange-700">
              Xác nhận
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
