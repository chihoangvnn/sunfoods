import { useQuery } from "@tanstack/react-query";
import { DollarSign, TrendingUp, TrendingDown } from "lucide-react";

interface FinancialData {
  totalBalance: number;
  totalDeposits: number;
  pendingWithdrawals: number;
  transactions: Transaction[];
}

interface Transaction {
  id: string;
  date: string;
  type: "deposit" | "withdrawal" | "commission" | "refund";
  amount: number;
  description: string;
  balanceAfter: number;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
  }).format(value);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getTransactionTypeBadge(type: string) {
  const typeConfig: Record<string, { label: string; className: string }> = {
    deposit: { label: "Deposit", className: "bg-green-100 text-green-800" },
    withdrawal: { label: "Withdrawal", className: "bg-blue-100 text-blue-800" },
    commission: { label: "Commission", className: "bg-purple-100 text-purple-800" },
    refund: { label: "Refund", className: "bg-orange-100 text-orange-800" },
  };

  const config = typeConfig[type] || typeConfig.deposit;
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
}

export default function VendorFinancial() {
  const { data, isLoading } = useQuery<FinancialData>({
    queryKey: ["/api/vendor/financial"],
    queryFn: async () => {
      const response = await fetch('/api/vendor/financial');
      if (!response.ok) throw new Error('Failed to fetch financial data');
      return response.json();
    }
  });

  const financialData = data || {
    totalBalance: 0,
    totalDeposits: 0,
    pendingWithdrawals: 0,
    transactions: [],
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Vendor Financial</h1>
        <p className="text-sm text-gray-500">Track vendor balances and transactions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-50 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mb-1">Total Balance</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(financialData.totalBalance)}
          </p>
          <p className="text-sm text-green-600 mt-2">Available funds</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-50 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mb-1">Total Deposits</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(financialData.totalDeposits)}
          </p>
          <p className="text-sm text-green-600 mt-2">Lifetime deposits</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-orange-50 rounded-lg">
              <TrendingDown className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mb-1">Pending Withdrawals</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(financialData.pendingWithdrawals)}
          </p>
          <p className="text-sm text-orange-600 mt-2">Awaiting approval</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Transactions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Balance After</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : financialData.transactions.length > 0 ? (
                financialData.transactions.map((transaction) => (
                  <tr key={transaction.id} className="odd:bg-gray-50 hover:bg-gray-100">
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(transaction.date)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {getTransactionTypeBadge(transaction.type)}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      <span className={transaction.type === "deposit" || transaction.type === "refund" ? "text-green-600" : "text-red-600"}>
                        {transaction.type === "deposit" || transaction.type === "refund" ? "+" : "-"}
                        {formatCurrency(Math.abs(transaction.amount))}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{transaction.description}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {formatCurrency(transaction.balanceAfter)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                    No transactions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
