import React, { useState } from "react";
import { useLocation } from "wouter";
import { Search, MoreHorizontal, UserPlus, Filter, Mail, Phone, Edit, Trash2, Facebook, Eye, User, Crown, Users, Truck, Building } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CustomerDialog, DeleteCustomerDialog } from "./CustomerDialog";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { type Customer as BaseCustomer } from "@shared/schema";

// Extend the base Customer type to include additional stats fields from API
export interface Customer extends BaseCustomer {
  totalOrders: number;
  lastOrderDate: string;
}

interface CustomerListProps {
  onViewCustomer?: (customer: Customer) => void;
  onEditCustomer?: (customer: Customer) => void;
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    notation: 'compact',
    maximumFractionDigits: 0,
  }).format(price);
};

const getTierBadgeConfig = (tier: string) => {
  switch (tier) {
    case "diamond":
      return {
        icon: "💎",
        name: "Kim Cương",
        bgClass: "bg-slate-100 text-slate-700 border border-slate-200",
        borderClass: "border-slate-200",
        glowClass: "shadow-sm"
      };
    case "gold":
      return {
        icon: "🥇",
        name: "Vàng",
        bgClass: "bg-amber-50 text-amber-800 border border-amber-200",
        borderClass: "border-amber-200",
        glowClass: "shadow-sm"
      };
    case "silver":
      return {
        icon: "🥈",
        name: "Bạc",
        bgClass: "bg-gray-50 text-gray-700 border border-gray-200",
        borderClass: "border-gray-200",
        glowClass: "shadow-sm"
      };
    case "member":
    default:
      return {
        icon: "🥉",
        name: "Thành viên",
        bgClass: "bg-blue-50 text-blue-700 border border-blue-200",
        borderClass: "border-blue-200",
        glowClass: "shadow-sm"
      };
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('vi-VN');
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case "active":
      return "Hoạt động";
    case "inactive":
      return "Không hoạt động";
    case "vip":
      return "VIP";
    default:
      return "Không xác định";
  }
};

const getStatusBadge = (status: string) => {
  const label = getStatusLabel(status);
  switch (status) {
    case "active":
      return <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200">{label}</Badge>;
    case "inactive":
      return <Badge className="bg-slate-50 text-slate-600 border border-slate-200">{label}</Badge>;
    case "vip":
      return <Badge className="bg-amber-50 text-amber-700 border border-amber-200">{label}</Badge>;
    default:
      return <Badge className="bg-gray-50 text-gray-600 border border-gray-200">{label}</Badge>;
  }
};

const getInitials = (name: string) => {
  return name.split(' ').map(part => part[0]).join('').toUpperCase().slice(0, 2);
};

const getTierBadge = (tier: string) => {
  switch (tier) {
    case "member":
      return <Badge className="text-xs bg-blue-50 text-blue-700 border border-blue-200">🥉 Thành viên</Badge>;
    case "silver":
      return <Badge className="text-xs bg-gray-50 text-gray-700 border border-gray-200">🥈 Bạc</Badge>;
    case "gold":
      return <Badge className="text-xs bg-amber-50 text-amber-800 border border-amber-200">🥇 Vàng</Badge>;
    case "diamond":
      return <Badge className="text-xs bg-slate-100 text-slate-700 border border-slate-200">💎 Kim Cương</Badge>;
    default:
      return <Badge className="text-xs bg-blue-50 text-blue-700 border border-blue-200">🥉 Thành viên</Badge>;
  }
};

const getRoleBadgeConfig = (role: string) => {
  switch (role) {
    case "vip":
      return {
        icon: Crown,
        label: "VIP",
        className: "bg-purple-50 text-purple-700 border border-purple-200"
      };
    case "affiliate":
      return {
        icon: Users,
        label: "Đại lý",
        className: "bg-blue-50 text-blue-700 border border-blue-200"
      };
    case "driver":
      return {
        icon: Truck,
        label: "Tài xế",
        className: "bg-green-50 text-green-700 border border-green-200"
      };
    case "corporate":
      return {
        icon: Building,
        label: "Doanh nghiệp",
        className: "bg-indigo-50 text-indigo-700 border border-indigo-200"
      };
    case "customer":
    default:
      return {
        icon: User,
        label: "Khách hàng",
        className: "bg-gray-50 text-gray-700 border border-gray-200"
      };
  }
};

const getRoleLabel = (role: string) => {
  switch (role) {
    case "vip":
      return "VIP";
    case "affiliate":
      return "Đại lý";
    case "driver":
      return "Tài xế";
    case "corporate":
      return "Doanh nghiệp";
    case "customer":
    default:
      return "Khách hàng";
  }
};

export function CustomerList({ 
  onViewCustomer, 
  onEditCustomer 
}: CustomerListProps) {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [customerDialog, setCustomerDialog] = useState<{
    open: boolean;
    mode: "add" | "edit";
    customer?: Customer | null;
  }>({ open: false, mode: "add", customer: null });
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    customer: Customer | null;
  }>({ open: false, customer: null });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery<Customer[]>({
    queryKey: ["customers"],
    queryFn: async (): Promise<Customer[]> => {
      console.log("🔄 Fetching customers from API...");
      const response = await fetch("/api/customers");
      if (!response.ok) {
        throw new Error(`Failed to fetch customers: ${response.statusText}`);
      }
      const rawData = await response.json();
      console.log("✅ API Response received, count:", rawData?.length || 0);
      return Array.isArray(rawData) ? rawData : [];
    },
  });

  const customers = data || [];

  // Debug React Query states
  console.log("🔍 CustomerList Debug:", { 
    isLoading, 
    hasData: !!data,
    customersLength: customers?.length,
    error: !!error
  });



  // Delete mutation
  const deleteCustomerMutation = useMutation({
    mutationFn: async (customerId: string) => {
      await apiRequest("DELETE", `/api/customers/${customerId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      toast({
        title: "Thành công",
        description: "Khách hàng đã được xóa thành công",
      });
      setDeleteDialog({ open: false, customer: null });
    },
    onError: (error: any) => {
      console.error("Delete customer error:", error);
      toast({
        title: "Lỗi",
        description: error.message || "Không thể xóa khách hàng",
        variant: "destructive",
      });
    },
  });

  const filteredCustomers = (customers || []).filter((customer: any) => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (customer.phone || "").includes(searchTerm);
    const matchesStatus = statusFilter === "all" || customer.status === statusFilter;
    const matchesRole = roleFilter === "all" || (customer.customerRole || "customer") === roleFilter;
    return matchesSearch && matchesStatus && matchesRole;
  });


  const handleCustomerAction = (action: string, customer: Customer) => {
    console.log(`${action} triggered for customer:`, customer.name);
    switch (action) {
      case "view":
        setLocation(`/customers/${customer.id}`);
        break;
      case "edit":
        setCustomerDialog({ open: true, mode: "edit", customer });
        break;
      case "delete":
        setDeleteDialog({ open: true, customer });
        break;
      case "email":
        console.log(`Email customer: ${customer.email}`);
        // In a real app, would open email client or send email
        break;
      case "call":
        console.log(`Call customer: ${customer.phone}`);
        // In a real app, would initiate phone call
        break;
    }
  };

  const handleAddCustomer = () => {
    setCustomerDialog({ open: true, mode: "add", customer: null });
  };

  const handleDeleteConfirm = () => {
    if (deleteDialog.customer) {
      deleteCustomerMutation.mutate(deleteDialog.customer.id);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 bg-slate-50 border border-slate-200 rounded-lg">
        <h2 className="text-2xl font-bold text-slate-700 mb-4">🔄 Đang tải danh sách khách hàng...</h2>
        <p className="text-slate-600">API đang fetch dữ liệu từ server...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6" data-testid="customer-list-error">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold">Khách hàng</h2>
            <p className="text-muted-foreground">Quản lý thông tin khách hàng</p>
          </div>
          <Button data-testid="button-add-customer" onClick={handleAddCustomer}>
            <UserPlus className="h-4 w-4 mr-2" />
            Thêm khách hàng
          </Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">Không thể tải danh sách khách hàng</p>
              <Button onClick={() => window.location.reload()} variant="outline">
                Thử lại
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="customer-list">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Khách hàng</h2>
          <p className="text-muted-foreground">Quản lý thông tin khách hàng</p>
        </div>
        <Button data-testid="button-add-customer" onClick={handleAddCustomer}>
          <UserPlus className="h-4 w-4 mr-2" />
          Thêm khách hàng
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col gap-4 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="customers-search"
            name="customers-search"
            placeholder="Tìm kiếm khách hàng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="input-search-customers"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" data-testid="button-filter-role">
              <Filter className="h-4 w-4 mr-2" />
              {roleFilter === "all" ? "Tất cả vai trò" : getRoleLabel(roleFilter)}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setRoleFilter("all")}>
              Tất cả vai trò
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setRoleFilter("customer")}>
              Khách hàng
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setRoleFilter("vip")}>
              VIP
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setRoleFilter("affiliate")}>
              Đại lý
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setRoleFilter("driver")}>
              Tài xế
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setRoleFilter("corporate")}>
              Doanh nghiệp
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" data-testid="button-filter-status">
              <Filter className="h-4 w-4 mr-2" />
              {statusFilter === "all" ? "Tất cả trạng thái" : getStatusLabel(statusFilter)}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setStatusFilter("all")}>
              Tất cả trạng thái
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("active")}>
              Hoạt động
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("inactive")}>
              Không hoạt động
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("vip")}>
              VIP
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* DESKTOP TABLE LAYOUT (md+ screens) */}
      <div className="hidden md:block bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            {/* Table Header */}
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Khách hàng
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Vai trò
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Hạng
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Thống kê
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
            {filteredCustomers.map((customer) => {
          const tierConfig = getTierBadgeConfig(customer.membershipTier);
          const roleConfig = getRoleBadgeConfig(customer.customerRole || "customer");
          const RoleIcon = roleConfig.icon;
          
          return (
            <tr 
              key={customer.id}
              className="hover:bg-slate-50 cursor-pointer transition-colors"
              onClick={() => handleCustomerAction("view", customer)}
              data-testid={`customer-row-${customer.id}`}
            >
              {/* Avatar + Name/Email Column */}
              <td className="px-4 py-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    <AvatarImage src={customer.avatar || ''} alt={customer.name} />
                    <AvatarFallback className="bg-slate-100 text-slate-700 text-sm font-medium">
                      {getInitials(customer.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-slate-900 truncate" data-testid={`customer-name-${customer.id}`}>
                      {customer.name}
                    </div>
                    <div className="text-xs text-slate-500 truncate">{customer.email}</div>
                  </div>
                </div>
              </td>
              
              {/* Role Column */}
              <td className="px-4 py-4">
                <div className="flex items-center gap-2">
                  <RoleIcon className="h-4 w-4 text-slate-600" />
                  <Badge className={`text-xs ${roleConfig.className}`}>
                    {roleConfig.label}
                  </Badge>
                </div>
              </td>
              
              {/* Tier Column */}
              <td className="px-4 py-4">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{tierConfig.icon}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${tierConfig.bgClass}`}>
                    {tierConfig.name}
                  </span>
                </div>
              </td>
              
              {/* Stats Column */}
              <td className="px-4 py-4">
                <div className="space-y-1">
                  <div className="text-sm font-semibold text-slate-900">
                    {formatPrice(parseFloat(customer.totalSpent || '0'))}
                  </div>
                  <div className="text-xs text-slate-500">
                    {customer.totalOrders || 0} đơn hàng
                  </div>
                </div>
              </td>
              
              {/* Status Column */}
              <td className="px-4 py-4">
                {getStatusBadge(customer.status)}
              </td>
              
              {/* Actions Column */}
              <td className="px-4 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (customer.phone) window.open(`tel:${customer.phone}`, '_self');
                    }}
                    className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Gọi điện"
                  >
                    <Phone className="h-4 w-4" />
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (customer.email) window.open(`mailto:${customer.email}`, '_self');
                    }}
                    className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Gửi email"
                  >
                    <Mail className="h-4 w-4" />
                  </button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        data-testid={`button-actions-${customer.id}`}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleCustomerAction("view", customer)}>
                        <Eye className="h-4 w-4 mr-2" />
                        Xem chi tiết
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleCustomerAction("edit", customer)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Chỉnh sửa
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => window.open(`https://facebook.com/search/top/?q=${encodeURIComponent(customer.name)}`, '_blank')}>
                        <Facebook className="h-4 w-4 mr-2" />
                        Tìm Facebook
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => handleCustomerAction("delete", customer)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Xóa khách hàng
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </td>
            </tr>
          );
        })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MOBILE CARD LAYOUT (below md screens) */}
      <div className="md:hidden space-y-3">
        {filteredCustomers.map((customer) => {
          const tierConfig = getTierBadgeConfig(customer.membershipTier);
          const roleConfig = getRoleBadgeConfig(customer.customerRole || "customer");
          const RoleIcon = roleConfig.icon;
          
          return (
            <div
              key={customer.id}
              className="bg-white rounded-lg border border-slate-200 p-4 hover:bg-slate-50 cursor-pointer transition-colors"
              onClick={() => handleCustomerAction("view", customer)}
              data-testid={`customer-card-${customer.id}`}
            >
              <div className="space-y-3">
                {/* Header - Avatar, Name & Badges */}
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 flex-shrink-0">
                    <AvatarImage src={customer.avatar || ''} alt={customer.name} />
                    <AvatarFallback className="bg-slate-100 text-slate-700 text-sm font-medium">
                      {getInitials(customer.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <div className="flex items-center gap-1">
                        <RoleIcon className="h-3 w-3 text-slate-600" />
                        <Badge className={`text-xs ${roleConfig.className}`}>
                          {roleConfig.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-base">{tierConfig.icon}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${tierConfig.bgClass}`}>
                          {tierConfig.name}
                        </span>
                      </div>
                    </div>
                    <h3 className="font-semibold text-slate-900 truncate" data-testid={`customer-name-${customer.id}`}>
                      {customer.name}
                    </h3>
                    <p className="text-sm text-slate-500 truncate">{customer.email}</p>
                  </div>
                </div>
                
                {/* Stats & Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">
                      {formatPrice(parseFloat(customer.totalSpent || '0'))}
                    </div>
                    <div className="text-xs text-slate-500">
                      {customer.totalOrders || 0} đơn hàng
                    </div>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(customer.status)}
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (customer.phone) window.open(`tel:${customer.phone}`, '_self');
                      }}
                      className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Gọi điện"
                    >
                      <Phone className="h-4 w-4" />
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (customer.email) window.open(`mailto:${customer.email}`, '_self');
                      }}
                      className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Gửi email"
                    >
                      <Mail className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        data-testid={`button-actions-${customer.id}`}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleCustomerAction("view", customer)}>
                        <Eye className="h-4 w-4 mr-2" />
                        Xem chi tiết
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleCustomerAction("edit", customer)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Chỉnh sửa
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => window.open(`https://facebook.com/search/top/?q=${encodeURIComponent(customer.name)}`, '_blank')}>
                        <Facebook className="h-4 w-4 mr-2" />
                        Tìm Facebook
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => handleCustomerAction("delete", customer)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Xóa khách hàng
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredCustomers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Không tìm thấy khách hàng nào.</p>
        </div>
      )}
      
      {/* Customer Dialog */}
      <CustomerDialog
        open={customerDialog.open}
        onOpenChange={(open) => 
          setCustomerDialog({ open, mode: customerDialog.mode, customer: customerDialog.customer })
        }
        customer={customerDialog.customer}
        mode={customerDialog.mode}
      />
      
      {/* Delete Confirmation Dialog */}
      <DeleteCustomerDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, customer: deleteDialog.customer })}
        customer={deleteDialog.customer}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteCustomerMutation.isPending}
      />
    </div>
  );
}