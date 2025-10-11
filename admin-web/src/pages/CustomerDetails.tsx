import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Phone, 
  Mail, 
  User,
  Calendar,
  Package,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Eye,
  CreditCard,
  Receipt,
  Share2,
  Settings,
  Shield,
  Link,
  Facebook,
  Instagram,
  Twitter,
  Globe,
  AlertTriangle,
  CheckCircle,
  Clock,
  Ban,
  Crown,
  Coins,
  History,
  Banknote,
  UserCheck,
  MessageSquare,
  Bolt,
  Activity,
  BarChart,
  Database,
  ChevronDown,
  Target,
  Award,
  Users2,
  Share,
  HandCoins,
  TrendingDown,
  TrendingUp as TrendingUpIcon,
  PiggyBank,
  UserPlus,
  Handshake,
  Smartphone,
  Monitor,
  Tablet,
  MapPin,
  Bird,
  Car
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { CustomerDialog } from "@/components/CustomerDialog";
import { useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import type { Customer, Order } from "@shared/schema";
import { AddressMapPicker } from "@/components/AddressMapPicker";

// Extended Customer type matching the CustomerList interface
interface CustomerWithStats extends Customer {
  totalOrders: number;
  totalSpent: string; // Matches schema decimal type
  lastOrderDate: string;
}

// Order type with customer info for table display
interface OrderWithInfo extends Order {
  customerName: string;
  customerEmail: string;
}

// Affiliate data interfaces
interface AffiliateData {
  activatedAt?: string;
  activatedBy?: string;
  totalCommissionEarned?: number;
  totalCommissionPaid?: number;
  totalCommissionPending?: number;
  totalReferrals?: number;
  totalReferralRevenue?: number;
  conversionRate?: number;
  bestPerformingProducts?: string[];
  paymentMethod?: 'bank_transfer' | 'cash' | 'digital_wallet';
  bankAccount?: string;
  paymentSchedule?: 'weekly' | 'monthly' | 'quarterly';
  allowedCategories?: string[];
  restrictedProducts?: string[];
  maxCommissionPerOrder?: number;
  requiresApproval?: boolean;
  lastLoginAt?: string;
  lastReferralAt?: string;
  notes?: string;
}

interface AffiliateStats {
  totalOrders: number;
  totalCommission: number;
  pendingCommission: number;
  paidCommission: number;
  conversionRate: number;
  bestPerformingProducts: string[];
}

interface AffiliateOrderType {
  type: 'created' | 'shared_link' | 'customer_proxy';
  label: string;
  description: string;
  icon: React.ReactNode;
  count: number;
  commission: number;
  color: string;
}

// Field visibility settings interface
interface FieldVisibility {
  // Thông tin cơ bản
  avatarNameEmail: boolean;
  customerRole: boolean;
  membershipTier: boolean;
  phone: boolean;
  joinDate: boolean;
  registrationSource: boolean;
  status: boolean;
  lastOrderDate: boolean;
  // Tài chính
  totalSpent: boolean;
  totalOrders: boolean;
  totalDebt: boolean;
  creditLimit: boolean;
  pointsBalance: boolean;
  pointsEarned: boolean;
  // Địa chỉ
  address: boolean;
  address2: boolean;
  distanceFromShop: boolean;
}

// Default visibility (all fields visible)
const DEFAULT_FIELD_VISIBILITY: FieldVisibility = {
  avatarNameEmail: true,
  customerRole: true,
  membershipTier: true,
  phone: true,
  joinDate: true,
  registrationSource: true,
  status: true,
  lastOrderDate: true,
  totalSpent: true,
  totalOrders: true,
  totalDebt: true,
  creditLimit: true,
  pointsBalance: true,
  pointsEarned: true,
  address: true,
  address2: true,
  distanceFromShop: true,
};

const formatPrice = (price: string | number) => {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(numPrice);
};

const formatDate = (dateInput: string | Date | null) => {
  if (!dateInput) return 'Không có thông tin';
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  return date.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatShortDate = (dateInput: string | Date | null) => {
  if (!dateInput) return 'N/A';
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  return date.toLocaleDateString('vi-VN');
};

const getStatusBadge = (status: string) => {
  const statusConfig = {
    active: { label: "Hoạt động", variant: "default" as const },
    inactive: { label: "Không hoạt động", variant: "secondary" as const },
    vip: { label: "VIP", variant: "secondary" as const },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

const getOrderStatusBadge = (status: string) => {
  const statusConfig = {
    pending: { label: "Chờ xử lý", variant: "secondary" as const },
    processing: { label: "Đang xử lý", variant: "default" as const },
    shipped: { label: "Đã gửi", variant: "secondary" as const },
    delivered: { label: "Đã giao", variant: "default" as const },
    cancelled: { label: "Đã hủy", variant: "destructive" as const },
  };

  const config = statusConfig[status as keyof typeof statusConfig];
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

const getInitials = (name: string) => {
  return name.split(' ').map(part => part[0]).join('').toUpperCase().slice(0, 2);
};

export default function CustomerDetails() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  
  // Field visibility state with localStorage persistence
  const [fieldVisibility, setFieldVisibility] = useState<FieldVisibility>(() => {
    const saved = localStorage.getItem('customerFieldsVisibility');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_FIELD_VISIBILITY;
      }
    }
    return DEFAULT_FIELD_VISIBILITY;
  });

  // Save to localStorage whenever visibility changes
  useEffect(() => {
    localStorage.setItem('customerFieldsVisibility', JSON.stringify(fieldVisibility));
  }, [fieldVisibility]);

  // Toggle field visibility
  const toggleField = (field: keyof FieldVisibility) => {
    setFieldVisibility(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };
  
  // Collapsible section states (default collapsed)
  const [socialOpen, setSocialOpen] = useState(false);
  const [limitsOpen, setLimitsOpen] = useState(false);
  const [financialOpen, setFinancialOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [communicationOpen, setCommunicationOpen] = useState(false);
  const [apiOpen, setApiOpen] = useState(false);
  const [orderAnalyticsOpen, setOrderAnalyticsOpen] = useState(false);
  const [webAnalyticsOpen, setWebAnalyticsOpen] = useState(false);
  
  // Order filter state
  const [orderSourceFilter, setOrderSourceFilter] = useState<string>('all');
  
  // Fetch customer details
  const { data: customer, isLoading, error } = useQuery<CustomerWithStats>({
    queryKey: ['/api/customers', id],
    enabled: !!id,
  });

  // 🎯 AFFILIATE SYSTEM STATES (after customer is declared)
  const [affiliateOpen, setAffiliateOpen] = useState(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [upgradeLoading, setUpgradeLoading] = useState(false);

  // Sync affiliate open state when customer data loads
  useEffect(() => {
    if (customer?.isAffiliate) {
      setAffiliateOpen(true);
    }
  }, [customer?.isAffiliate]);

  // Fetch customer orders
  const { data: orders = [], isLoading: ordersLoading } = useQuery<OrderWithInfo[]>({
    queryKey: ['/api/orders', 'customer', id],
    queryFn: async () => {
      // Fetch all orders and filter by customer ID client-side
      // TODO: Enhance API to support customer ID filtering for better performance
      const response = await apiRequest('GET', '/api/orders');
      const allOrders = (await response.json()) as OrderWithInfo[];
      // Fix type mismatch in customer ID filtering with explicit string conversion
      console.log(`🔍 Filtering orders for customer ID: "${id}"`);
      console.log(`📋 Total orders before filter: ${allOrders.length}`);
      const filteredOrders = allOrders.filter((order: OrderWithInfo) => {
        const orderCustomerId = String(order.customerId || '').trim();
        const targetId = String(id || '').trim();
        return orderCustomerId === targetId;
      });
      console.log(`✅ Filtered orders for customer: ${filteredOrders.length}`);
      return filteredOrders;
    },
    enabled: !!id,
  });

  // 🎯 AFFILIATE DATA FETCHING
  const { data: affiliateData, isLoading: affiliateLoading } = useQuery({
    queryKey: ['/api/customer-management', id, 'affiliate'],
    queryFn: async () => {
      if (!customer?.isAffiliate) return null;
      const response = await apiRequest('GET', `/api/customer-management/${id}/affiliate`);
      return response.json();
    },
    enabled: !!id && !!customer?.isAffiliate,
  });

  // Affiliate upgrade mutation
  const affiliateUpgradeMutation = useMutation({
    mutationFn: async (upgradeData: any) => {
      const response = await apiRequest('POST', `/api/customer-management/${id}/affiliate/upgrade`, {
        body: JSON.stringify(upgradeData),
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Đã nâng cấp customer thành affiliate",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/customers', id] });
      queryClient.invalidateQueries({ queryKey: ['/api/customer-management', id, 'affiliate'] });
      setShowUpgradeDialog(false);
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể nâng cấp affiliate",
        variant: "destructive",
      });
    },
  });

  // Fetch customer social management data
  const { data: socialManagement } = useQuery({
    queryKey: ['/api/customer-management', id, 'social'],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/customer-management/${id}/social`);
      return await response.json();
    },
    enabled: !!id,
  });

  // Fetch customer limits management data
  const { data: limitsManagement } = useQuery({
    queryKey: ['/api/customer-management', id, 'limits'],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/customer-management/${id}/limits`);
      return await response.json();
    },
    enabled: !!id,
  });

  // Delete customer mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('DELETE', `/api/customers/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Khách hàng đã được xóa",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/customers'] });
      setLocation('/customers');
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDelete = () => {
    deleteMutation.mutate();
    setIsDeleteDialogOpen(false);
  };

  const handleViewOrder = (orderId: string) => {
    setLocation(`/orders/${orderId}`);
  };

  // Calculate additional stats from orders
  // Split stats to match membership logic: only completed orders count for spending/tier calculation
  const completedOrders = orders.filter(order => order.status === 'delivered' || order.status === 'completed');
  const calculatedTotalSpent = completedOrders.reduce((sum, order) => sum + parseFloat(order.total), 0);
  
  // Filter orders based on source
  const filteredOrders = orderSourceFilter === 'all' 
    ? orders 
    : orders.filter(order => {
        const source = (order as any).sourceInfo?.source || (order as any).source || '';
        
        if (orderSourceFilter === 'chatbot') return source === 'bot' || source === 'chatbot';
        if (orderSourceFilter === 'pos') return source === 'pos';
        if (orderSourceFilter === 'admin') return source === 'admin';
        if (orderSourceFilter === 'storefront') return source === 'storefront' || source === 'web';
        if (orderSourceFilter === 'landing') return source === 'landing_page' || source === 'landing';
        
        return true;
      });

  const stats = {
    totalOrders: orders.length,
    completedOrders: completedOrders.length,
    totalSpent: calculatedTotalSpent, // Only from completed orders - matches membership logic
    averageOrderValue: completedOrders.length > 0 ? calculatedTotalSpent / completedOrders.length : 0,
    lastOrderDate: orders.length > 0 ? orders.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())[0].createdAt : null,
  };

  if (isLoading) {
    return (
      <div className="p-6" data-testid="page-customer-details">
        <div className="mb-6">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-6">
          <Skeleton className="h-32" />
          <div className="grid gap-6 md:grid-cols-3">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="p-6" data-testid="page-customer-details">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => setLocation('/customers')}
            data-testid="button-back-to-customers"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại danh sách
          </Button>
        </div>
        <Card>
          <CardContent className="p-6">
            <p className="text-destructive">Không thể tải thông tin khách hàng</p>
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
              className="mt-4"
            >
              Thử lại
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4" data-testid="page-customer-details">
      {/* Compact Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setLocation('/customers')}
              data-testid="button-back-to-customers"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Quay lại
            </Button>
            <h1 className="text-xl font-bold">Chi tiết khách hàng</h1>
            {getStatusBadge(customer.status)}
          </div>

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsSettingsDialogOpen(true)}
              data-testid="button-field-settings"
            >
              <Settings className="h-3 w-3 mr-1" />
              Cài đặt
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsEditFormOpen(true)}
              data-testid="button-edit-customer"
            >
              <Edit className="h-3 w-3 mr-1" />
              Sửa
            </Button>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => setIsDeleteDialogOpen(true)}
              data-testid="button-delete-customer"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Xóa
            </Button>
          </div>
        </div>
      </div>

      {/* Compact Customer Information */}
      <Card className="mb-4" data-testid="card-customer-info">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-4 w-4" />
            Thông tin khách hàng
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          {fieldVisibility.avatarNameEmail && (
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={customer.avatar || ""} />
                <AvatarFallback className="text-sm">
                  {getInitials(customer.name)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <h2 className="text-lg font-bold">{customer.name}</h2>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {customer.email}
                  </div>
                  {fieldVisibility.phone && customer.phone && (
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {customer.phone}
                    </div>
                  )}
                  {fieldVisibility.joinDate && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatShortDate(customer.joinDate)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 💎 Hệ thống Membership - Moved into customer info */}
          {fieldVisibility.membershipTier && (
            <>
              {fieldVisibility.avatarNameEmail && <Separator className="my-4" />}
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Crown className="h-4 w-4 text-yellow-500" />
                  <span className="font-semibold">💎 Cấp thành viên</span>
                </div>
                
                {/* Current Tier Display */}
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Cấp hiện tại</span>
                  <Badge variant={
                    customer.membershipTier === 'diamond' ? 'default' :
                    customer.membershipTier === 'gold' ? 'secondary' : 
                    customer.membershipTier === 'silver' ? 'outline' : 'secondary'
                  } className="text-xs">
                    {customer.membershipTier === 'member' && '🥉 Thành viên'}
                    {customer.membershipTier === 'silver' && '🥈 Bạc'}
                    {customer.membershipTier === 'gold' && '🥇 Vàng'}
                    {customer.membershipTier === 'diamond' && '💎 Kim Cương'}
                  </Badge>
                </div>

                {/* Points Balance */}
                {fieldVisibility.pointsBalance && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Coins className="h-3 w-3" />
                      Điểm tích lũy
                    </span>
                    <div className="text-right">
                      <div className="font-semibold">{customer.pointsBalance?.toLocaleString() || 0} điểm</div>
                      {fieldVisibility.pointsEarned && (
                        <div className="text-xs text-muted-foreground">
                          Tổng tích: {customer.pointsEarned?.toLocaleString() || 0}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Tier Progress */}
                {customer.membershipData?.tierProgressPercent && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Tiến độ lên hạng</span>
                      <span>{customer.membershipData.tierProgressPercent}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${customer.membershipData.tierProgressPercent}%` }}
                      ></div>
                    </div>
                    {customer.membershipData.nextTierThreshold && (
                      <div className="text-xs text-muted-foreground">
                        Cần thêm {formatPrice(customer.membershipData.nextTierThreshold)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Compact Statistics Grid */}
      <div className="grid gap-3 grid-cols-2 md:grid-cols-5 mb-4">
        {fieldVisibility.totalOrders && (
          <Card data-testid="card-total-orders">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <ShoppingCart className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">Đơn hàng</span>
              </div>
              <div className="text-lg font-bold">{stats.totalOrders}</div>
            </CardContent>
          </Card>
        )}
        
        {fieldVisibility.totalSpent && (
          <Card data-testid="card-total-spent">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">Chi tiêu</span>
              </div>
              <div className="text-lg font-bold">{formatPrice(stats.totalSpent)}</div>
            </CardContent>
          </Card>
        )}
        
        {fieldVisibility.lastOrderDate && (
          <Card data-testid="card-average-order">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">TB/đơn</span>
              </div>
              <div className="text-lg font-bold">{formatPrice(stats.averageOrderValue)}</div>
            </CardContent>
          </Card>
        )}

        {fieldVisibility.totalDebt && (
          <Card data-testid="card-total-debt">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <Receipt className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">Công nợ</span>
              </div>
              <div className={`text-lg font-bold ${parseFloat(customer.totalDebt || '0') > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {formatPrice(parseFloat(customer.totalDebt || '0'))}
              </div>
            </CardContent>
          </Card>
        )}

        {fieldVisibility.creditLimit && (
          <Card data-testid="card-credit-limit">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <CreditCard className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">Hạn mức</span>
              </div>
              <div className="text-lg font-bold text-blue-600">
                {formatPrice(parseFloat(customer.creditLimit || '0'))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Registration Info Card */}
      {(fieldVisibility.registrationSource || fieldVisibility.joinDate || fieldVisibility.customerRole || fieldVisibility.status) && (
        <Card className="mb-4" data-testid="card-registration-info">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Thông tin đăng ký
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="grid gap-3 text-sm">
              {/* Registration Source */}
              {fieldVisibility.registrationSource && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Nguồn đăng ký</span>
                  <Badge 
                    variant="outline"
                    className={`
                      ${customer.registrationSource === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-200' : ''}
                      ${customer.registrationSource === 'bot' ? 'bg-cyan-50 text-cyan-700 border-cyan-200' : ''}
                      ${customer.registrationSource === 'web' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}
                      ${customer.registrationSource === 'app' ? 'bg-green-50 text-green-700 border-green-200' : ''}
                      ${customer.registrationSource === 'pos' ? 'bg-orange-50 text-orange-700 border-orange-200' : ''}
                    `}
                  >
                    {customer.registrationSource === 'admin' && '⚙️ Admin'}
                    {customer.registrationSource === 'bot' && '🤖 Bot'}
                    {customer.registrationSource === 'web' && '🌐 Web'}
                    {customer.registrationSource === 'app' && '📱 App'}
                    {customer.registrationSource === 'pos' && '💳 POS'}
                    {!customer.registrationSource && '🌐 Web'}
                  </Badge>
                </div>
              )}

              {/* Join Date */}
              {fieldVisibility.joinDate && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Ngày tham gia</span>
                  <span className="font-medium">{formatDate(customer.joinDate)}</span>
                </div>
              )}

              {/* Customer Role(s) */}
              {fieldVisibility.customerRole && (customer.customerRole || (customer as any).customerRoles) && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Vai trò</span>
                  <div className="flex gap-1 flex-wrap justify-end">
                    {customer.customerRole && (
                      <Badge variant="secondary" className="text-xs">
                        {customer.customerRole}
                      </Badge>
                    )}
                    {(customer as any).customerRoles && Array.isArray((customer as any).customerRoles) && (
                      (customer as any).customerRoles.map((role: string) => (
                        <Badge key={role} variant="secondary" className="text-xs">
                          {role}
                        </Badge>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 🎯 AFFILIATE DASHBOARD SECTION */}
      {customer.isAffiliate ? (
        <div className="mb-4">
          <Collapsible open={affiliateOpen} onOpenChange={setAffiliateOpen}>
            <Card data-testid="card-affiliate-dashboard">
              <CollapsibleTrigger className="w-full">
                <CardHeader className="pb-2 hover:bg-muted/50 transition-colors">
                  <CardTitle className="text-base flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Handshake className="h-4 w-4 text-green-600" />
                      <span>Bảng điều khiển Affiliate</span>
                      <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
                        {customer.affiliateCode || 'AFF000'}
                      </Badge>
                    </div>
                    <ChevronDown className={`h-4 w-4 transition-transform ${affiliateOpen ? 'rotate-180' : ''}`} />
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-2">
                  {/* Affiliate Stats Grid */}
                  <div className="grid gap-3 grid-cols-2 md:grid-cols-5 mb-4">
                    <div className="p-3 border rounded-lg bg-green-50">
                      <div className="flex items-center gap-2 mb-1">
                        <HandCoins className="h-3 w-3 text-green-600" />
                        <span className="text-xs font-medium text-muted-foreground">Hoa hồng tổng</span>
                      </div>
                      <div className="text-lg font-bold text-green-600">
                        {formatPrice(customer.affiliateData?.totalCommissionEarned || 0)}
                      </div>
                    </div>
                    
                    <div className="p-3 border rounded-lg bg-blue-50">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="h-3 w-3 text-blue-600" />
                        <span className="text-xs font-medium text-muted-foreground">Chưa thanh toán</span>
                      </div>
                      <div className="text-lg font-bold text-blue-600">
                        {formatPrice(customer.affiliateData?.totalCommissionPending || 0)}
                      </div>
                    </div>
                    
                    <div className="p-3 border rounded-lg bg-emerald-50">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle className="h-3 w-3 text-emerald-600" />
                        <span className="text-xs font-medium text-muted-foreground">Đã thanh toán</span>
                      </div>
                      <div className="text-lg font-bold text-emerald-600">
                        {formatPrice(customer.affiliateData?.totalCommissionPaid || 0)}
                      </div>
                    </div>
                    
                    <div className="p-3 border rounded-lg bg-purple-50">
                      <div className="flex items-center gap-2 mb-1">
                        <Target className="h-3 w-3 text-purple-600" />
                        <span className="text-xs font-medium text-muted-foreground">Tỷ lệ chuyển đổi</span>
                      </div>
                      <div className="text-lg font-bold text-purple-600">
                        {((customer.affiliateData?.conversionRate || 0) * 100).toFixed(1)}%
                      </div>
                    </div>

                    <div className="p-3 border rounded-lg bg-indigo-50">
                      <div className="flex items-center gap-2 mb-1">
                        <Users2 className="h-3 w-3 text-indigo-600" />
                        <span className="text-xs font-medium text-muted-foreground">Tổng giới thiệu</span>
                      </div>
                      <div className="text-lg font-bold text-indigo-600">
                        {customer.affiliateData?.totalReferrals || 0}
                      </div>
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  <div className="grid gap-3 grid-cols-1 md:grid-cols-3 mb-4">
                    <div className="p-3 border rounded-lg bg-orange-50">
                      <div className="flex items-center gap-2 mb-1">
                        <DollarSign className="h-3 w-3 text-orange-600" />
                        <span className="text-xs font-medium text-muted-foreground">Doanh thu tạo ra</span>
                      </div>
                      <div className="text-lg font-bold text-orange-600">
                        {formatPrice(customer.affiliateData?.totalReferralRevenue || 0)}
                      </div>
                    </div>

                    <div className="p-3 border rounded-lg bg-pink-50">
                      <div className="flex items-center gap-2 mb-1">
                        <BarChart className="h-3 w-3 text-pink-600" />
                        <span className="text-xs font-medium text-muted-foreground">Giá trị trung bình</span>
                      </div>
                      <div className="text-lg font-bold text-pink-600">
                        {customer.affiliateData?.totalReferrals && customer.affiliateData?.totalReferralRevenue
                          ? formatPrice(customer.affiliateData.totalReferralRevenue / customer.affiliateData.totalReferrals)
                          : formatPrice(0)
                        }
                      </div>
                    </div>

                    <div className="p-3 border rounded-lg bg-amber-50">
                      <div className="flex items-center gap-2 mb-1">
                        <Activity className="h-3 w-3 text-amber-600" />
                        <span className="text-xs font-medium text-muted-foreground">Hoạt động cuối</span>
                      </div>
                      <div className="text-sm font-bold text-amber-600">
                        {customer.affiliateData?.lastReferralAt 
                          ? formatShortDate(customer.affiliateData.lastReferralAt)
                          : 'Chưa có hoạt động'
                        }
                      </div>
                    </div>
                  </div>

                  {/* Order Types - 3 types as requested */}
                  <div className="space-y-3 mb-4">
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      <Users2 className="h-4 w-4" />
                      Phân loại đơn hàng
                    </h4>
                    <div className="grid gap-2 md:grid-cols-3">
                      {/* Đơn hàng đã lên */}
                      <div className="p-3 border rounded-lg bg-gradient-to-br from-blue-50 to-blue-100">
                        <div className="flex items-center gap-2 mb-2">
                          <Package className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-800">Đã lên</span>
                        </div>
                        <div className="text-xs text-blue-600 mb-1">Tạo đơn trực tiếp</div>
                        <div className="flex justify-between items-end">
                          <div className="text-lg font-bold text-blue-700">
                            {customer.affiliateData?.vietnameseOrderTypes?.daLen?.count || 0}
                          </div>
                          <div className="text-xs text-blue-600">
                            +{formatPrice(customer.affiliateData?.vietnameseOrderTypes?.daLen?.commission || 0)}
                          </div>
                        </div>
                      </div>

                      {/* Đơn hàng chia sẻ link */}
                      <div className="p-3 border rounded-lg bg-gradient-to-br from-green-50 to-green-100">
                        <div className="flex items-center gap-2 mb-2">
                          <Share className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-green-800">Chia sẻ link</span>
                        </div>
                        <div className="text-xs text-green-600 mb-1">Từ link giới thiệu</div>
                        <div className="flex justify-between items-end">
                          <div className="text-lg font-bold text-green-700">
                            {customer.affiliateData?.vietnameseOrderTypes?.chiaSeLink?.count || 0}
                          </div>
                          <div className="text-xs text-green-600">
                            +{formatPrice(customer.affiliateData?.vietnameseOrderTypes?.chiaSeLink?.commission || 0)}
                          </div>
                        </div>
                      </div>

                      {/* Đơn hàng đặt cho khách */}
                      <div className="p-3 border rounded-lg bg-gradient-to-br from-orange-50 to-orange-100">
                        <div className="flex items-center gap-2 mb-2">
                          <UserPlus className="h-4 w-4 text-orange-600" />
                          <span className="text-sm font-medium text-orange-800">Đặt cho khách</span>
                        </div>
                        <div className="text-xs text-orange-600 mb-1">Đại diện khách đặt</div>
                        <div className="flex justify-between items-end">
                          <div className="text-lg font-bold text-orange-700">
                            {customer.affiliateData?.vietnameseOrderTypes?.datChoKhach?.count || 0}
                          </div>
                          <div className="text-xs text-orange-600">
                            +{formatPrice(customer.affiliateData?.vietnameseOrderTypes?.datChoKhach?.commission || 0)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Affiliate Settings */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Cài đặt Affiliate
                    </h4>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Tỷ lệ hoa hồng:</span>
                          <span className="font-medium">{customer.commissionRate || 5}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Trạng thái:</span>
                          <Badge variant={customer.affiliateStatus === 'active' ? 'default' : 'secondary'}>
                            {customer.affiliateStatus === 'active' ? 'Hoạt động' : 'Tạm dừng'}
                          </Badge>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Phương thức thanh toán:</span>
                          <span className="text-xs">
                            {customer.affiliateData?.paymentMethod === 'bank_transfer' ? 'Chuyển khoản' :
                             customer.affiliateData?.paymentMethod === 'cash' ? 'Tiền mặt' : 'Ví điện tử'}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Chu kỳ thanh toán:</span>
                          <span className="text-xs">
                            {customer.affiliateData?.paymentSchedule === 'weekly' ? 'Hàng tuần' :
                             customer.affiliateData?.paymentSchedule === 'monthly' ? 'Hàng tháng' : 'Hàng quý'}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Kích hoạt:</span>
                          <span className="text-xs">{formatShortDate(customer.affiliateData?.activatedAt)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Cần duyệt:</span>
                          <Badge variant={customer.affiliateData?.requiresApproval ? 'destructive' : 'default'}>
                            {customer.affiliateData?.requiresApproval ? 'Có' : 'Không'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Affiliate Link Generator */}
                  <div className="space-y-3 mb-4">
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      <Link className="h-4 w-4" />
                      Link giới thiệu
                    </h4>
                    <div className="p-3 border rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Globe className="h-3 w-3" />
                          <span>Link chính thức</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 px-3 py-2 bg-white border rounded text-xs font-mono text-blue-600">
                            {`${window.location.origin}/storefront/public?ref=${customer.affiliateCode}`}
                          </code>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              navigator.clipboard.writeText(`${window.location.origin}/storefront/public?ref=${customer.affiliateCode}`);
                              toast({
                                title: "Đã sao chép",
                                description: "Link giới thiệu đã được sao chép vào clipboard",
                              });
                            }}
                          >
                            <Share className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          💡 Chia sẻ link này để nhận {customer.commissionRate || 5}% hoa hồng từ mỗi đơn hàng
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Commission History */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      <History className="h-4 w-4" />
                      Lịch sử hoa hồng gần đây
                    </h4>
                    <div className="border rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/30">
                            <TableHead className="text-xs">Ngày</TableHead>
                            <TableHead className="text-xs">Đơn hàng</TableHead>
                            <TableHead className="text-xs">Loại</TableHead>
                            <TableHead className="text-xs">Giá trị</TableHead>
                            <TableHead className="text-xs">Hoa hồng</TableHead>
                            <TableHead className="text-xs">Trạng thái</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {/* Sample commission history - in real app, this would come from API */}
                          {customer.affiliateData?.commissionHistory?.slice(0, 5).map((commission: any, index: number) => (
                            <TableRow key={index} className="text-xs">
                              <TableCell>{formatShortDate(commission.earnedAt)}</TableCell>
                              <TableCell className="font-mono text-blue-600">
                                #{commission.orderId?.slice(0, 8)}...
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="text-xs">
                                  {commission.orderType === 'created' ? 'Đã lên' :
                                   commission.orderType === 'shared_link' ? 'Chia sẻ' : 'Đại diện'}
                                </Badge>
                              </TableCell>
                              <TableCell>{formatPrice(commission.orderTotal)}</TableCell>
                              <TableCell className="font-bold text-green-600">
                                {formatPrice(commission.commissionAmount)}
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  variant={commission.status === 'paid' ? 'default' : 
                                          commission.status === 'pending' ? 'secondary' : 'destructive'}
                                  className="text-xs"
                                >
                                  {commission.status === 'paid' ? 'Đã trả' :
                                   commission.status === 'pending' ? 'Chờ trả' : 'Đã hủy'}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          )) || (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                                <div className="flex items-center justify-center gap-2">
                                  <PiggyBank className="h-4 w-4" />
                                  <span>Chưa có giao dịch hoa hồng nào</span>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                      {customer.affiliateData?.commissionHistory && customer.affiliateData.commissionHistory.length > 5 && (
                        <div className="p-2 bg-muted/30 text-center">
                          <Button variant="ghost" size="sm" className="text-xs">
                            Xem tất cả {customer.affiliateData.commissionHistory.length} giao dịch
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        </div>
      ) : (
        /* Affiliate Upgrade Button - When customer is not affiliate */
        <Card className="mb-4 border-dashed border-2 border-green-200">
          <CardContent className="p-4">
            <div className="text-center space-y-3">
              <div className="flex justify-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Award className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-800">Nâng cấp thành Affiliate</h3>
                <p className="text-sm text-green-600 mt-1">
                  Cho phép khách hàng này kiếm hoa hồng từ việc giới thiệu sản phẩm
                </p>
              </div>
              <Button 
                onClick={() => setShowUpgradeDialog(true)}
                className="bg-green-600 hover:bg-green-700"
                disabled={affiliateUpgradeMutation.isPending}
              >
                <Handshake className="h-4 w-4 mr-2" />
                {affiliateUpgradeMutation.isPending ? 'Đang nâng cấp...' : 'Nâng cấp Affiliate'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Address & Map Card - Always Visible */}
      <Card className="mb-4" data-testid="card-address-map">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Địa chỉ & Bản đồ
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-2 space-y-4">
          {/* Address Information */}
          {customer.address && (
            <div className="space-y-2">
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <div className="font-medium">Địa chỉ chính</div>
                  <div className="text-muted-foreground">{customer.address}</div>
                </div>
              </div>
              {customer.address2 && (
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="font-medium">Địa chỉ phụ</div>
                    <div className="text-muted-foreground">{customer.address2}</div>
                  </div>
                </div>
              )}
              {(customer.distanceFromShop || customer.routeDistanceFromShop) && (
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground mb-1">Khoảng cách từ cửa hàng:</div>
                  <div className="flex flex-col gap-2">
                    {customer.distanceFromShop && (
                      <div className="flex items-center gap-2 text-sm">
                        <Bird className="h-4 w-4 text-blue-500" />
                        <span className="text-muted-foreground">Chim bay:</span>
                        <span className="font-medium text-blue-600">
                          {parseFloat(customer.distanceFromShop).toFixed(1)} km
                        </span>
                      </div>
                    )}
                    {customer.routeDistanceFromShop !== undefined && (
                      <div className="flex items-center gap-2 text-sm">
                        <Car className="h-4 w-4 text-green-500" />
                        <span className="text-muted-foreground">Đường đi:</span>
                        <span className="font-medium text-green-600">
                          {customer.routeDistanceFromShop !== null 
                            ? `${parseFloat(customer.routeDistanceFromShop).toFixed(1)} km`
                            : 'Không tính được'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Map Picker */}
          <div>
            <AddressMapPicker
              initialLatitude={customer.latitude ? parseFloat(customer.latitude) : null}
              initialLongitude={customer.longitude ? parseFloat(customer.longitude) : null}
              onLocationSelect={async (address, latitude, longitude, distanceFromShop, district, routeDistanceFromShop) => {
                try {
                  // Clean payload: only send necessary fields, avoid spreading entire customer object
                  const payload: any = {
                    address,
                    district,
                  };
                  
                  // Only add numeric fields if they have valid values
                  if (latitude !== null && latitude !== undefined) {
                    payload.latitude = latitude.toString();
                  }
                  if (longitude !== null && longitude !== undefined) {
                    payload.longitude = longitude.toString();
                  }
                  if (distanceFromShop !== null && distanceFromShop !== undefined) {
                    payload.distanceFromShop = distanceFromShop.toString();
                  }
                  if (routeDistanceFromShop !== null && routeDistanceFromShop !== undefined) {
                    payload.routeDistanceFromShop = routeDistanceFromShop.toString();
                  }

                  const response = await fetch(`/api/customers/${customer.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify(payload),
                  });

                  if (!response.ok) throw new Error('Failed to update location');

                  queryClient.invalidateQueries({ queryKey: ['/api/customers', id] });
                  toast({
                    title: "Thành công",
                    description: "Vị trí khách hàng đã được cập nhật",
                  });
                } catch (error) {
                  toast({
                    title: "Lỗi",
                    description: "Không thể cập nhật vị trí",
                    variant: "destructive",
                  });
                }
              }}
              height="400px"
            />
          </div>
        </CardContent>
      </Card>

      {/* Web Analytics & Tracking Collapsible Card */}
      <Collapsible open={webAnalyticsOpen} onOpenChange={setWebAnalyticsOpen}>
        <Card className="mb-4" data-testid="card-web-analytics">
          <CollapsibleTrigger className="w-full">
            <CardHeader className="pb-2 hover:bg-muted/50 transition-colors">
              <CardTitle className="text-base flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Web Analytics & Tracking
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform ${webAnalyticsOpen ? 'rotate-180' : ''}`} />
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-2">
              {customer.membershipData?.webAnalytics ? (
                <div className="grid gap-3 text-sm">
                  {/* IP Address */}
                  {(customer.membershipData.webAnalytics as any).ipAddress && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">IP Address</span>
                      <span className="font-mono text-xs">{(customer.membershipData.webAnalytics as any).ipAddress}</span>
                    </div>
                  )}

                  {/* Last Geolocation */}
                  {((customer.membershipData.webAnalytics as any).lastCity || (customer.membershipData.webAnalytics as any).lastCountry) && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        Vị trí
                      </span>
                      <span className="font-medium">
                        {(customer.membershipData.webAnalytics as any).lastCity && `${(customer.membershipData.webAnalytics as any).lastCity}, `}
                        {(customer.membershipData.webAnalytics as any).lastCountry}
                      </span>
                    </div>
                  )}

                  {/* Device Preference */}
                  {customer.membershipData.webAnalytics.devicePreference && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Thiết bị ưa thích</span>
                      <div className="flex items-center gap-2">
                        {customer.membershipData.webAnalytics.devicePreference === 'mobile' && (
                          <>
                            <Smartphone className="h-4 w-4 text-blue-500" />
                            <span>Mobile</span>
                          </>
                        )}
                        {customer.membershipData.webAnalytics.devicePreference === 'desktop' && (
                          <>
                            <Monitor className="h-4 w-4 text-green-500" />
                            <span>Desktop</span>
                          </>
                        )}
                        {customer.membershipData.webAnalytics.devicePreference === 'tablet' && (
                          <>
                            <Tablet className="h-4 w-4 text-purple-500" />
                            <span>Tablet</span>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Browser Fingerprint */}
                  {customer.membershipData.webAnalytics.browserFingerprint && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Browser Fingerprint</span>
                      <span className="font-mono text-xs">
                        {customer.membershipData.webAnalytics.browserFingerprint.slice(0, 16)}...
                      </span>
                    </div>
                  )}

                  {/* Total Page Views */}
                  {customer.membershipData.webAnalytics.totalPageViews !== undefined && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Tổng lượt xem</span>
                      <span className="font-bold text-blue-600">
                        {customer.membershipData.webAnalytics.totalPageViews.toLocaleString()}
                      </span>
                    </div>
                  )}

                  {/* Avg Session Duration */}
                  {customer.membershipData.webAnalytics.avgSessionDuration !== undefined && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Thời lượng TB</span>
                      <span className="font-medium">
                        {Math.floor(customer.membershipData.webAnalytics.avgSessionDuration / 60)}:
                        {String(customer.membershipData.webAnalytics.avgSessionDuration % 60).padStart(2, '0')}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <Database className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Chưa có dữ liệu</p>
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Social Media Management Section */}
      <div className="grid gap-3 md:grid-cols-2 mb-4">
        <Collapsible open={socialOpen} onOpenChange={setSocialOpen}>
          <Card data-testid="card-social-management">
            <CollapsibleTrigger className="w-full">
              <CardHeader className="pb-2 hover:bg-muted/50 transition-colors">
                <CardTitle className="text-base flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Share2 className="h-4 w-4" />
                    Quản lý Social Media
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform ${socialOpen ? 'rotate-180' : ''}`} />
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-2">
            <div className="space-y-3">
              {/* Social Platform Links */}
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2 p-2 border rounded">
                  <Facebook className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">
                    {socialManagement?.socialData?.facebookId ? (
                      <Badge variant="default" className="text-xs">Kết nối</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">Chưa kết nối</Badge>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-2 p-2 border rounded">
                  <Instagram className="h-4 w-4 text-pink-600" />
                  <span className="text-sm">
                    {socialManagement?.socialData?.instagramId ? (
                      <Badge variant="default" className="text-xs">Kết nối</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">Chưa kết nối</Badge>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-2 p-2 border rounded">
                  <Twitter className="h-4 w-4 text-blue-400" />
                  <span className="text-sm">
                    {socialManagement?.socialData?.twitterId ? (
                      <Badge variant="default" className="text-xs">Kết nối</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">Chưa kết nối</Badge>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-2 p-2 border rounded">
                  <Globe className="h-4 w-4 text-green-600" />
                  <span className="text-sm">
                    {socialManagement?.socialData?.linkedinId ? (
                      <Badge variant="default" className="text-xs">Kết nối</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">Chưa kết nối</Badge>
                    )}
                  </span>
                </div>
              </div>

              {/* Social Engagement Stats */}
              {socialManagement?.socialData?.socialEngagement && (
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div>
                    <div className="text-sm font-bold">{socialManagement.socialData.socialEngagement.followers || 0}</div>
                    <div className="text-xs text-muted-foreground">Followers</div>
                  </div>
                  <div>
                    <div className="text-sm font-bold">{socialManagement.socialData.socialEngagement.likes || 0}</div>
                    <div className="text-xs text-muted-foreground">Likes</div>
                  </div>
                  <div>
                    <div className="text-sm font-bold">{socialManagement.socialData.socialEngagement.shares || 0}</div>
                    <div className="text-xs text-muted-foreground">Shares</div>
                  </div>
                  <div>
                    <div className="text-sm font-bold">{socialManagement.socialData.socialEngagement.comments || 0}</div>
                    <div className="text-xs text-muted-foreground">Comments</div>
                  </div>
                </div>
              )}

              {/* Show linked accounts count */}
              {socialManagement?.summary && (
                <div className="text-xs text-muted-foreground text-center">
                  {socialManagement.summary.totalPlatforms} platform(s) liên kết • {socialManagement.summary.totalFollowers} followers
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Link className="h-3 w-3 mr-1" />
                  Kết nối Social
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="h-3 w-3 mr-1" />
                  Cài đặt
                </Button>
              </div>
            </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Limits & Restrictions Management */}
        <Collapsible open={limitsOpen} onOpenChange={setLimitsOpen}>
          <Card data-testid="card-limits-management">
            <CollapsibleTrigger className="w-full">
              <CardHeader className="pb-2 hover:bg-muted/50 transition-colors">
                <CardTitle className="text-base flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Hạn mức & Quyền hạn
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform ${limitsOpen ? 'rotate-180' : ''}`} />
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-2">
            <div className="space-y-3">
              {/* Order Limits */}
              <div className="border-l-2 border-blue-500 pl-3">
                <div className="text-sm font-medium">Hạn mức đặt hàng</div>
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div>Ngày: {limitsManagement?.limitsData?.maxOrdersPerDay || '∞'}</div>
                  <div>Tháng: {limitsManagement?.limitsData?.maxOrdersPerMonth || '∞'}</div>
                </div>
              </div>

              {/* Discount Limits */}
              <div className="border-l-2 border-green-500 pl-3">
                <div className="text-sm font-medium">Hạn mức giảm giá</div>
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div>Sử dụng: {limitsManagement?.limitsData?.maxDiscountUsage || '∞'}/tháng</div>
                  <div>Tối đa: {limitsManagement?.limitsData?.maxDiscountPercent || '∞'}%</div>
                </div>
              </div>

              {/* Social Limits */}
              <div className="border-l-2 border-pink-500 pl-3">
                <div className="text-sm font-medium">Hạn mức Social</div>
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div>Share: {limitsManagement?.limitsData?.maxSocialShares || '∞'}/tháng</div>
                  <div>Posts: {limitsManagement?.limitsData?.maxSocialPosts || '∞'}/tháng</div>
                </div>
              </div>

              {/* Account Status */}
              <div className="flex items-center gap-2">
                {limitsManagement?.status?.hasRestrictions ? (
                  <>
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    <Badge variant="destructive" className="text-xs">
                      Có hạn chế ({limitsManagement.limitsData?.accountRestrictions?.length || 0})
                    </Badge>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <Badge variant="default" className="text-xs">Không hạn chế</Badge>
                  </>
                )}
              </div>

              {/* Usage Summary */}
              {limitsManagement?.usage && (
                <div className="text-xs text-muted-foreground text-center">
                  Đơn hôm nay: {limitsManagement.usage.todayOrders} • Đơn tháng: {limitsManagement.usage.monthOrders}
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Settings className="h-3 w-3 mr-1" />
                  Cấu hình
                </Button>
                <Button variant="outline" size="sm">
                  <Shield className="h-3 w-3 mr-1" />
                  Quyền hạn
                </Button>
              </div>
            </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      </div>

      {/* Row 3: Financial Management */}
      <div className="grid grid-cols-1 gap-4">
        {/* Financial Management */}
        <Collapsible open={financialOpen} onOpenChange={setFinancialOpen}>
          <Card data-testid="card-financial">
            <CollapsibleTrigger className="w-full">
              <CardHeader className="pb-2 hover:bg-muted/50 transition-colors">
                <CardTitle className="text-base flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Banknote className="h-4 w-4 text-green-500" />
                    💰 Quản lý Tài chính
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform ${financialOpen ? 'rotate-180' : ''}`} />
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-3 text-sm">
            {/* Debt & Credit */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-muted-foreground text-xs">Công nợ hiện tại</div>
                <div className={`font-semibold ${parseFloat(customer.totalDebt) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {formatPrice(customer.totalDebt)}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs">Hạn mức tín dụng</div>
                <div className="font-semibold">{formatPrice(customer.creditLimit)}</div>
              </div>
            </div>

            {/* Total Spent */}
            <div>
              <div className="text-muted-foreground text-xs">Tổng chi tiêu</div>
              <div className="font-semibold text-blue-600">{formatPrice(customer.totalSpent)}</div>
            </div>

            {/* Credit Utilization */}
            {parseFloat(customer.creditLimit) > 0 && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Sử dụng tín dụng</span>
                  <span>{((parseFloat(customer.totalDebt) / parseFloat(customer.creditLimit)) * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      (parseFloat(customer.totalDebt) / parseFloat(customer.creditLimit)) > 0.8 ? 'bg-red-500' : 
                      (parseFloat(customer.totalDebt) / parseFloat(customer.creditLimit)) > 0.5 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min((parseFloat(customer.totalDebt) / parseFloat(customer.creditLimit)) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            )}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      </div>

      {/* Row 4: Account & Communication Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Account Integration */}
        <Collapsible open={accountOpen} onOpenChange={setAccountOpen}>
          <Card data-testid="card-account-integration">
            <CollapsibleTrigger className="w-full">
              <CardHeader className="pb-2 hover:bg-muted/50 transition-colors">
                <CardTitle className="text-base flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-blue-500" />
                    🔐 Liên kết Tài khoản
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform ${accountOpen ? 'rotate-180' : ''}`} />
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-3 text-sm">
            {/* Auth Status */}
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Trạng thái đăng nhập</span>
              <div className="flex items-center gap-2">
                {customer.authUserId ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <Badge variant="default" className="text-xs">Đã liên kết</Badge>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    <Badge variant="outline" className="text-xs">Chưa liên kết</Badge>
                  </>
                )}
              </div>
            </div>

            {customer.authUserId && (
              <div className="text-xs text-muted-foreground">
                Auth ID: {customer.authUserId.slice(-8)}...
              </div>
            )}

            {/* Join Date */}
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Ngày tham gia</span>
              <span>{formatDate(customer.joinDate)}</span>
            </div>

            {/* Last Tier Update */}
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Cập nhật hạng</span>
              <span>{formatDate(customer.lastTierUpdate)}</span>
            </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Communication Management */}
        <Collapsible open={communicationOpen} onOpenChange={setCommunicationOpen}>
          <Card data-testid="card-communication">
            <CollapsibleTrigger className="w-full">
              <CardHeader className="pb-2 hover:bg-muted/50 transition-colors">
                <CardTitle className="text-base flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-purple-500" />
                    📞 Quản lý Liên hệ
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform ${communicationOpen ? 'rotate-180' : ''}`} />
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-3 text-sm">
            {/* Preferred Platforms */}
            {customer.socialData?.preferredPlatforms && customer.socialData.preferredPlatforms.length > 0 && (
              <div>
                <div className="text-muted-foreground text-xs mb-1">Nền tảng ưa thích</div>
                <div className="flex flex-wrap gap-1">
                  {customer.socialData.preferredPlatforms.map((platform) => (
                    <Badge key={platform} variant="outline" className="text-xs">
                      {platform === 'facebook' && '📘'}
                      {platform === 'instagram' && '📷'}
                      {platform === 'twitter' && '🐦'}
                      {platform === 'linkedin' && '💼'}
                      {' '}{platform}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Marketing Limits */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-muted-foreground text-xs">Email/tuần</div>
                <div className="font-semibold">
                  {customer.limitsData?.maxEmailsPerWeek || '∞'}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs">SMS/tháng</div>
                <div className="font-semibold">
                  {customer.limitsData?.maxSMSPerMonth || '∞'}
                </div>
              </div>
            </div>

            {/* Marketing Permission */}
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Cho phép marketing</span>
              <div className="flex items-center gap-2">
                {customer.limitsData?.allowMarketing !== false ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <Badge variant="default" className="text-xs">Cho phép</Badge>
                  </>
                ) : (
                  <>
                    <Ban className="h-4 w-4 text-red-500" />
                    <Badge variant="destructive" className="text-xs">Từ chối</Badge>
                  </>
                )}
              </div>
            </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      </div>

      {/* Row 5: API & Order Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* API & Automation */}
        <Collapsible open={apiOpen} onOpenChange={setApiOpen}>
          <Card data-testid="card-api-automation">
            <CollapsibleTrigger className="w-full">
              <CardHeader className="pb-2 hover:bg-muted/50 transition-colors">
                <CardTitle className="text-base flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Bolt className="h-4 w-4 text-blue-500" />
                    ⚡ API & Tự động hóa
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform ${apiOpen ? 'rotate-180' : ''}`} />
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-3 text-sm">
            {/* API Rate Limit */}
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">API Rate Limit</span>
              <span className="font-semibold">
                {customer.limitsData?.apiRateLimit || '∞'} calls/hour
              </span>
            </div>

            {/* Automation Level */}
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Mức tự động hóa</span>
              <Badge variant={
                customer.limitsData?.automationLevel === 'unlimited' ? 'default' :
                customer.limitsData?.automationLevel === 'advanced' ? 'secondary' :
                customer.limitsData?.automationLevel === 'basic' ? 'outline' : 'destructive'
              } className="text-xs">
                {customer.limitsData?.automationLevel === 'unlimited' && '🚀 Unlimited'}
                {customer.limitsData?.automationLevel === 'advanced' && '⭐ Advanced'}
                {customer.limitsData?.automationLevel === 'basic' && '⚡ Basic'}
                {customer.limitsData?.automationLevel === 'none' && '🚫 None'}
                {!customer.limitsData?.automationLevel && '⚡ Basic'}
              </Badge>
            </div>

            {/* Override Permissions */}
            {customer.limitsData?.overridePermissions && (
              <div className="border-t pt-2 mt-2">
                <div className="text-xs text-muted-foreground mb-1">Quyền đặc biệt</div>
                <div className="flex items-center justify-between">
                  <span className="text-xs">Vượt giới hạn</span>
                  {customer.limitsData.overridePermissions.canExceedLimits ? (
                    <CheckCircle className="h-3 w-3 text-green-500" />
                  ) : (
                    <Ban className="h-3 w-3 text-red-500" />
                  )}
                </div>
                {customer.limitsData.overridePermissions.overrideBy && (
                  <div className="text-xs text-muted-foreground">
                    Bởi: {customer.limitsData.overridePermissions.overrideBy}
                  </div>
                )}
              </div>
            )}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Order Analytics */}
        <Collapsible open={orderAnalyticsOpen} onOpenChange={setOrderAnalyticsOpen}>
          <Card data-testid="card-order-analytics">
            <CollapsibleTrigger className="w-full">
              <CardHeader className="pb-2 hover:bg-muted/50 transition-colors">
                <CardTitle className="text-base flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <BarChart className="h-4 w-4 text-green-500" />
                    📈 Thống kê Đơn hàng
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform ${orderAnalyticsOpen ? 'rotate-180' : ''}`} />
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-3 text-sm">
            {/* Order Sources - This will show data from orders when available */}
            <div className="text-muted-foreground text-xs text-center">
              Thống kê theo nguồn đơn hàng
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span>📊 Admin</span>
                <span>-</span>
              </div>
              <div className="flex justify-between">
                <span>🏪 Storefront</span>
                <span>-</span>
              </div>
              <div className="flex justify-between">
                <span>🎵 TikTok Shop</span>
                <span>-</span>
              </div>
              <div className="flex justify-between">
                <span>📱 POS</span>
                <span>-</span>
              </div>
            </div>

            {/* Sync Status Summary */}
            <div className="border-t pt-2">
              <div className="text-xs text-muted-foreground mb-1">Trạng thái đồng bộ</div>
              <div className="flex items-center gap-2">
                <Activity className="h-3 w-3 text-green-500" />
                <span className="text-xs">Tất cả đồng bộ</span>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="border-t pt-2">
              <div className="text-xs text-center text-muted-foreground">
                Tổng: {orders.length} đơn • Đã hoàn thành: {formatPrice(orders.filter(order => order.status === 'delivered' || order.status === 'completed').reduce((sum, order) => sum + parseFloat(order.total), 0))}
              </div>
            </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      </div>

      {/* Compact Order History */}
      <Card data-testid="card-order-history">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="h-4 w-4" />
              Lịch sử đơn hàng ({filteredOrders.length}{orderSourceFilter !== 'all' && `/${orders.length}`})
            </CardTitle>
            
            {/* Order Source Filter */}
            <div className="flex items-center gap-2">
              <Label htmlFor="order-source-filter" className="text-xs text-muted-foreground">
                Lọc theo nguồn:
              </Label>
              <Select value={orderSourceFilter} onValueChange={setOrderSourceFilter}>
                <SelectTrigger id="order-source-filter" className="w-[180px] h-8 text-xs">
                  <SelectValue placeholder="Chọn nguồn" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="chatbot">🤖 Chatbot</SelectItem>
                  <SelectItem value="pos">💳 POS</SelectItem>
                  <SelectItem value="admin">⚙️ Admin</SelectItem>
                  <SelectItem value="storefront">🏪 Storefront</SelectItem>
                  <SelectItem value="landing">🔗 Landing Page</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          {ordersLoading ? (
            <div className="space-y-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : filteredOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b">
                    <TableHead className="h-8 px-2 text-xs">Đơn hàng</TableHead>
                    <TableHead className="h-8 px-2 text-xs">Ngày</TableHead>
                    <TableHead className="h-8 px-2 text-xs">Trạng thái</TableHead>
                    <TableHead className="h-8 px-2 text-xs">SP</TableHead>
                    <TableHead className="h-8 px-2 text-xs text-right">Tổng tiền</TableHead>
                    <TableHead className="h-8 px-2 text-xs text-center">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id} data-testid={`order-row-${order.id}`} className="border-b">
                      <TableCell className="px-2 py-2 text-sm font-medium">
                        #{order.id.slice(-6)}
                      </TableCell>
                      <TableCell className="px-2 py-2 text-sm">{formatShortDate(order.createdAt)}</TableCell>
                      <TableCell className="px-2 py-2">{getOrderStatusBadge(order.status)}</TableCell>
                      <TableCell className="px-2 py-2 text-sm">
                        {Array.isArray(order.items) ? `${order.items.length} SP` : '0 SP'}
                      </TableCell>
                      <TableCell className="px-2 py-2 text-sm text-right font-medium">
                        {formatPrice(order.total)}
                      </TableCell>
                      <TableCell className="px-2 py-2 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewOrder(order.id)}
                          data-testid={`button-view-order-${order.id}`}
                          className="h-6 w-6 p-0"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Chưa có đơn hàng</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Form Modal */}
      {isEditFormOpen && (
        <CustomerDialog
          mode="edit"
          customer={customer}
          open={isEditFormOpen}
          onOpenChange={setIsEditFormOpen}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa khách hàng</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa khách hàng "{customer.name}" không? 
              Hành động này không thể hoàn tác và sẽ xóa tất cả dữ liệu liên quan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              data-testid="button-confirm-delete"
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? 'Đang xóa...' : 'Xóa khách hàng'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Field Visibility Settings Dialog */}
      <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Cài đặt hiển thị trường thông tin
            </DialogTitle>
            <DialogDescription>
              Tùy chỉnh các trường thông tin hiển thị trên trang chi tiết khách hàng
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Thông tin cơ bản */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <User className="h-4 w-4" />
                Thông tin cơ bản
              </h3>
              <div className="space-y-3 pl-6">
                <div className="flex items-center justify-between">
                  <Label htmlFor="avatarNameEmail" className="text-sm font-normal cursor-pointer">
                    Avatar + Tên + Email
                  </Label>
                  <Switch
                    id="avatarNameEmail"
                    checked={fieldVisibility.avatarNameEmail}
                    onCheckedChange={() => toggleField('avatarNameEmail')}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="customerRole" className="text-sm font-normal cursor-pointer">
                    Vai trò
                  </Label>
                  <Switch
                    id="customerRole"
                    checked={fieldVisibility.customerRole}
                    onCheckedChange={() => toggleField('customerRole')}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="membershipTier" className="text-sm font-normal cursor-pointer">
                    Hạng thành viên
                  </Label>
                  <Switch
                    id="membershipTier"
                    checked={fieldVisibility.membershipTier}
                    onCheckedChange={() => toggleField('membershipTier')}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="phone" className="text-sm font-normal cursor-pointer">
                    Số điện thoại
                  </Label>
                  <Switch
                    id="phone"
                    checked={fieldVisibility.phone}
                    onCheckedChange={() => toggleField('phone')}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="joinDate" className="text-sm font-normal cursor-pointer">
                    Ngày tham gia
                  </Label>
                  <Switch
                    id="joinDate"
                    checked={fieldVisibility.joinDate}
                    onCheckedChange={() => toggleField('joinDate')}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="registrationSource" className="text-sm font-normal cursor-pointer">
                    Nguồn đăng ký
                  </Label>
                  <Switch
                    id="registrationSource"
                    checked={fieldVisibility.registrationSource}
                    onCheckedChange={() => toggleField('registrationSource')}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="status" className="text-sm font-normal cursor-pointer">
                    Trạng thái
                  </Label>
                  <Switch
                    id="status"
                    checked={fieldVisibility.status}
                    onCheckedChange={() => toggleField('status')}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="lastOrderDate" className="text-sm font-normal cursor-pointer">
                    Đơn hàng gần nhất
                  </Label>
                  <Switch
                    id="lastOrderDate"
                    checked={fieldVisibility.lastOrderDate}
                    onCheckedChange={() => toggleField('lastOrderDate')}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Tài chính */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Tài chính
              </h3>
              <div className="space-y-3 pl-6">
                <div className="flex items-center justify-between">
                  <Label htmlFor="totalSpent" className="text-sm font-normal cursor-pointer">
                    Tổng chi tiêu
                  </Label>
                  <Switch
                    id="totalSpent"
                    checked={fieldVisibility.totalSpent}
                    onCheckedChange={() => toggleField('totalSpent')}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="totalOrders" className="text-sm font-normal cursor-pointer">
                    Số đơn hàng
                  </Label>
                  <Switch
                    id="totalOrders"
                    checked={fieldVisibility.totalOrders}
                    onCheckedChange={() => toggleField('totalOrders')}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="totalDebt" className="text-sm font-normal cursor-pointer">
                    Công nợ
                  </Label>
                  <Switch
                    id="totalDebt"
                    checked={fieldVisibility.totalDebt}
                    onCheckedChange={() => toggleField('totalDebt')}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="creditLimit" className="text-sm font-normal cursor-pointer">
                    Hạn mức tín dụng
                  </Label>
                  <Switch
                    id="creditLimit"
                    checked={fieldVisibility.creditLimit}
                    onCheckedChange={() => toggleField('creditLimit')}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="pointsBalance" className="text-sm font-normal cursor-pointer">
                    Điểm tích lũy
                  </Label>
                  <Switch
                    id="pointsBalance"
                    checked={fieldVisibility.pointsBalance}
                    onCheckedChange={() => toggleField('pointsBalance')}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="pointsEarned" className="text-sm font-normal cursor-pointer">
                    Tổng điểm đã kiếm
                  </Label>
                  <Switch
                    id="pointsEarned"
                    checked={fieldVisibility.pointsEarned}
                    onCheckedChange={() => toggleField('pointsEarned')}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Địa chỉ */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Địa chỉ
              </h3>
              <div className="space-y-3 pl-6">
                <div className="flex items-center justify-between">
                  <Label htmlFor="address" className="text-sm font-normal cursor-pointer">
                    Địa chỉ 1
                  </Label>
                  <Switch
                    id="address"
                    checked={fieldVisibility.address}
                    onCheckedChange={() => toggleField('address')}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="address2" className="text-sm font-normal cursor-pointer">
                    Địa chỉ 2
                  </Label>
                  <Switch
                    id="address2"
                    checked={fieldVisibility.address2}
                    onCheckedChange={() => toggleField('address2')}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="distanceFromShop" className="text-sm font-normal cursor-pointer">
                    Khoảng cách từ shop
                  </Label>
                  <Switch
                    id="distanceFromShop"
                    checked={fieldVisibility.distanceFromShop}
                    onCheckedChange={() => toggleField('distanceFromShop')}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setFieldVisibility(DEFAULT_FIELD_VISIBILITY);
                toast({
                  title: "Đã đặt lại",
                  description: "Tất cả trường đã được hiển thị",
                });
              }}
            >
              Đặt lại mặc định
            </Button>
            <Button onClick={() => setIsSettingsDialogOpen(false)}>
              Đóng
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}