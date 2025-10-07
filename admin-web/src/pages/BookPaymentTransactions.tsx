import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Download, Filter, CreditCard, DollarSign, ShoppingBag, Eye, Smartphone, Banknote, Wallet } from "lucide-react";

// Mock transaction data
const MOCK_TRANSACTIONS = [
  {
    id: "TXN-001",
    orderNumber: "ORD-1701234567890",
    customer: "John Doe",
    email: "john@example.com",
    amount: 55.96,
    gateway: "stripe",
    status: "completed",
    date: "2025-09-29 14:30",
    paymentId: "pi_3ABC123DEF456"
  },
  {
    id: "TXN-002",
    orderNumber: "ORD-1701234567891",
    customer: "Jane Smith",
    email: "jane@example.com",
    amount: 32.50,
    gateway: "paypal",
    status: "completed",
    date: "2025-09-29 13:15",
    paymentId: "PP-ABC123DEF"
  },
  {
    id: "TXN-003",
    orderNumber: "ORD-1701234567892",
    customer: "Bob Johnson",
    email: "bob@example.com",
    amount: 89.99,
    gateway: "shopify",
    status: "pending",
    date: "2025-09-29 12:00",
    paymentId: "SHOP-ABC123"
  },
  {
    id: "TXN-004",
    orderNumber: "ORD-1701234567893",
    customer: "Alice Brown",
    email: "alice@example.com",
    amount: 45.00,
    gateway: "stripe",
    status: "failed",
    date: "2025-09-29 11:30",
    paymentId: "pi_3XYZ789GHI012"
  },
  {
    id: "TXN-005",
    orderNumber: "ORD-1701234567894",
    customer: "Charlie Wilson",
    email: "charlie@example.com",
    amount: 120.75,
    gateway: "paypal",
    status: "refunded",
    date: "2025-09-28 16:45",
    paymentId: "PP-XYZ789GHI"
  },
  {
    id: "TXN-006",
    orderNumber: "ORD-1701234567895",
    customer: "Emily Davis",
    email: "emily@example.com",
    amount: 67.50,
    gateway: "klarna",
    status: "completed",
    date: "2025-09-29 10:15",
    paymentId: "KLARNA-ABC123"
  },
  {
    id: "TXN-007",
    orderNumber: "ORD-1701234567896",
    customer: "Michael Chen",
    email: "michael@example.com",
    amount: 95.00,
    gateway: "braintree",
    status: "completed",
    date: "2025-09-29 09:45",
    paymentId: "BT-XYZ789DEF"
  },
  {
    id: "TXN-008",
    orderNumber: "ORD-1701234567897",
    customer: "Sarah Johnson",
    email: "sarah@example.com",
    amount: 42.99,
    gateway: "applepay",
    status: "completed",
    date: "2025-09-29 09:00",
    paymentId: "AP-123ABC456"
  },
  {
    id: "TXN-009",
    orderNumber: "ORD-1701234567898",
    customer: "David Martinez",
    email: "david@example.com",
    amount: 78.50,
    gateway: "googlepay",
    status: "completed",
    date: "2025-09-28 18:30",
    paymentId: "GP-789XYZ123"
  },
  {
    id: "TXN-010",
    orderNumber: "ORD-1701234567899",
    customer: "Lisa Anderson",
    email: "lisa@example.com",
    amount: 156.00,
    gateway: "klarna",
    status: "pending",
    date: "2025-09-28 17:00",
    paymentId: "KLARNA-DEF456"
  },
  {
    id: "TXN-011",
    orderNumber: "ORD-1701234567900",
    customer: "James Wilson",
    email: "james@example.com",
    amount: 38.75,
    gateway: "braintree",
    status: "failed",
    date: "2025-09-28 15:20",
    paymentId: "BT-GHI789JKL"
  }
];

export default function BookPaymentTransactions() {
  const [searchQuery, setSearchQuery] = useState("");
  const [gatewayFilter, setGatewayFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const transactions = MOCK_TRANSACTIONS;

  const filteredTransactions = transactions.filter(txn => {
    const matchesSearch = txn.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         txn.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         txn.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGateway = gatewayFilter === "all" || txn.gateway === gatewayFilter;
    const matchesStatus = statusFilter === "all" || txn.status === statusFilter;
    return matchesSearch && matchesGateway && matchesStatus;
  });

  const totalAmount = filteredTransactions.reduce((sum, txn) => 
    txn.status === "completed" ? sum + txn.amount : sum, 0
  );

  const getGatewayIcon = (gateway: string) => {
    switch (gateway) {
      case "stripe": return <CreditCard className="h-4 w-4 text-blue-500" />;
      case "paypal": return <DollarSign className="h-4 w-4 text-yellow-500" />;
      case "shopify": return <ShoppingBag className="h-4 w-4 text-green-500" />;
      case "klarna": return <Banknote className="h-4 w-4 text-pink-500" />;
      case "braintree": return <Smartphone className="h-4 w-4 text-blue-400" />;
      case "applepay": return <Smartphone className="h-4 w-4 text-gray-700" />;
      case "googlepay": return <Wallet className="h-4 w-4 text-blue-600" />;
      default: return <CreditCard className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      completed: { variant: "default", label: "Completed" },
      pending: { variant: "secondary", label: "Pending" },
      failed: { variant: "destructive", label: "Failed" },
      refunded: { variant: "outline", label: "Refunded" }
    };
    const config = variants[status] || variants.completed;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Payment Transactions</h1>
        <p className="text-gray-600">View and manage all book order payments</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600 mb-1">Total Transactions</div>
            <div className="text-2xl font-bold">{filteredTransactions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600 mb-1">Total Revenue</div>
            <div className="text-2xl font-bold text-green-600">${totalAmount.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600 mb-1">Completed</div>
            <div className="text-2xl font-bold text-blue-600">
              {filteredTransactions.filter(t => t.status === "completed").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600 mb-1">Failed</div>
            <div className="text-2xl font-bold text-red-600">
              {filteredTransactions.filter(t => t.status === "failed").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by customer, order, or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Select value={gatewayFilter} onValueChange={setGatewayFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Payment Gateway" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Gateways</SelectItem>
                  <SelectItem value="stripe">Stripe</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                  <SelectItem value="shopify">Shopify</SelectItem>
                  <SelectItem value="klarna">Klarna</SelectItem>
                  <SelectItem value="braintree">Braintree</SelectItem>
                  <SelectItem value="applepay">Apple Pay</SelectItem>
                  <SelectItem value="googlepay">Google Pay</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Transactions</CardTitle>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Gateway</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    No transactions found
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map((txn) => (
                  <TableRow key={txn.id}>
                    <TableCell className="font-mono text-sm">{txn.id}</TableCell>
                    <TableCell className="font-medium">{txn.orderNumber}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{txn.customer}</div>
                        <div className="text-xs text-gray-500">{txn.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getGatewayIcon(txn.gateway)}
                        <span className="capitalize">{txn.gateway}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">${txn.amount.toFixed(2)}</TableCell>
                    <TableCell>{getStatusBadge(txn.status)}</TableCell>
                    <TableCell className="text-sm text-gray-600">{txn.date}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
