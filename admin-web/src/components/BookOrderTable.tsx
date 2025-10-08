import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Eye, MoreHorizontal, Search, Filter, Plus, Edit, Trash2, Store, ShoppingBag, Bolt, UserPlus, RefreshCw, Book, Package, Award } from "lucide-react";
import { useResponsive, useTouchFriendly } from "@/hooks/use-mobile";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { BookOrderForm } from "./BookOrderForm";
import { useNewOrderNotification } from "@/components/NewOrderNotification";
import { formatOrderId, getShortOrderId, isMarketplaceOrder, createOrderDisplayInfo } from "@/utils/orderUtils";
import type { BookOrder, BookSeller } from "@shared/schema";

interface BookOrderWithCustomerInfo extends BookOrder {
  sellerName?: string;
  sourceInfo?: {
    source: 'admin' | 'storefront' | 'tiktok-shop' | 'landing-page';
    sourceOrderId: string | null;
    sourceReference: string | null;
    syncStatus: 'synced' | 'pending' | 'failed' | 'manual';
  };
  bookInfo?: {
    sellerId: string | null;
    bookSource: 'abebooks' | 'local_inventory' | 'dropship' | 'consignment';
    isbn: string | null;
    condition: 'new' | 'like_new' | 'very_good' | 'good' | 'acceptable';
    sellerCommission: string | null;
    bookMetadata: any;
    inventoryStatus: 'reserved' | 'allocated' | 'shipped' | 'returned' | null;
  };
}

interface BookOrderTableProps {
  onViewOrder?: (order: BookOrderWithCustomerInfo) => void;
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(price);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US');
};

// Helper function to get status labels
const getStatusLabel = (status: string) => {
  const labels = {
    pending: "Pending",
    processing: "Processing", 
    shipped: "Shipped",
    delivered: "Delivered",
    cancelled: "Cancelled"
  };
  return labels[status as keyof typeof labels] || status;
};

// 🎨 Enhanced Status Badge với colors và icons
const getStatusBadge = (status: string) => {
  const statusConfig = {
    pending: { 
      label: "🟡 Pending", 
      variant: "outline" as const,
      className: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
    },
    processing: { 
      label: "🔵 Processing", 
      variant: "outline" as const,
      className: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
    },
    shipped: { 
      label: "🟢 Shipped", 
      variant: "outline" as const,
      className: "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
    },
    delivered: { 
      label: "✅ Delivered", 
      variant: "outline" as const,
      className: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
    },
    cancelled: { 
      label: "🔴 Cancelled", 
      variant: "outline" as const,
      className: "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
    },
  };

  const config = statusConfig[status as keyof typeof statusConfig];
  return <Badge variant={config.variant} className={config.className}>{config.label}</Badge>;
};

// 📚 Book Condition Badge
const getConditionBadge = (condition: string) => {
  const conditionConfig = {
    new: { 
      label: "✨ New", 
      className: "bg-emerald-50 text-emerald-700 border-emerald-200"
    },
    like_new: { 
      label: "⭐ Like New", 
      className: "bg-green-50 text-green-700 border-green-200"
    },
    very_good: { 
      label: "👍 Very Good", 
      className: "bg-blue-50 text-blue-700 border-blue-200"
    },
    good: { 
      label: "👌 Good", 
      className: "bg-yellow-50 text-yellow-700 border-yellow-200"
    },
    acceptable: { 
      label: "📖 Acceptable", 
      className: "bg-orange-50 text-orange-700 border-orange-200"
    },
  };

  const config = conditionConfig[condition as keyof typeof conditionConfig];
  if (!config) return <Badge variant="secondary">Unspecified</Badge>;
  
  return <Badge variant="outline" className={config.className}>{config.label}</Badge>;
};

// 📦 Book Source Badge
const getBookSourceBadge = (bookSource: string) => {
  const sourceConfig = {
    abebooks: { 
      label: "📚 AbeBooks", 
      className: "bg-purple-50 text-purple-700 border-purple-200"
    },
    local_inventory: { 
      label: "🏪 Local Inventory", 
      className: "bg-blue-50 text-blue-700 border-blue-200"
    },
    dropship: { 
      label: "🚚 Dropship", 
      className: "bg-orange-50 text-orange-700 border-orange-200"
    },
    consignment: { 
      label: "🤝 Consignment", 
      className: "bg-green-50 text-green-700 border-green-200"
    },
  };

  const config = sourceConfig[bookSource as keyof typeof sourceConfig];
  if (!config) return <Badge variant="secondary">Unspecified</Badge>;
  
  return <Badge variant="outline" className={config.className}>{config.label}</Badge>;
};

// 📦 Inventory Status Badge
const getInventoryStatusBadge = (inventoryStatus: string | null) => {
  if (!inventoryStatus) return null;
  
  const statusConfig = {
    reserved: { 
      label: "🔒 Reserved", 
      className: "bg-yellow-50 text-yellow-700 border-yellow-200"
    },
    allocated: { 
      label: "📦 Allocated", 
      className: "bg-blue-50 text-blue-700 border-blue-200"
    },
    shipped: { 
      label: "🚚 Shipped", 
      className: "bg-green-50 text-green-700 border-green-200"
    },
    returned: { 
      label: "↩️ Returned", 
      className: "bg-red-50 text-red-700 border-red-200"
    },
  };

  const config = statusConfig[inventoryStatus as keyof typeof statusConfig];
  if (!config) return <Badge variant="secondary">Unspecified</Badge>;
  
  return <Badge variant="outline" className={config.className}>{config.label}</Badge>;
};

// 🔄 Status Update Button Component for Book Orders
const getStatusUpdateButton = (order: BookOrderWithCustomerInfo, onUpdateStatus: (orderId: string, newStatus: string) => void, isUpdating: boolean = false) => {
  const statusFlow = {
    pending: { 
      nextStatus: "processing", 
      buttonText: "Process",
      icon: "🔵",
      className: "bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
    },
    processing: { 
      nextStatus: "shipped", 
      buttonText: "Ship",
      icon: "🚚",
      className: "bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
    },
    shipped: { 
      nextStatus: "delivered", 
      buttonText: "Complete",
      icon: "✅",
      className: "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200"
    }
  };

  const config = statusFlow[order.status as keyof typeof statusFlow];
  
  // If no next status available, show disabled completed state
  if (!config) {
    return (
      <Button size="sm" variant="outline" disabled className="bg-gray-50 text-gray-500">
        {order.status === 'delivered' ? '✅ Delivered' : '🔴 Cancelled'}
      </Button>
    );
  }

  return (
    <Button
      size="sm"
      variant="outline" 
      disabled={isUpdating}
      onClick={() => onUpdateStatus(order.id, config.nextStatus)}
      className={`${config.className} transition-all duration-200`}
      title={`Change to: ${getStatusLabel(config.nextStatus)}`}
    >
      {isUpdating ? (
        <RefreshCw className="h-3 w-3 animate-spin" />
      ) : (
        <>
          {config.icon} {config.buttonText}
        </>
      )}
    </Button>
  );
};

// 🎨 Enhanced Source Badge Component với Brand Colors
const getSourceBadge = (sourceInfo: BookOrderWithCustomerInfo['sourceInfo']) => {
  const defaultBadge = (
    <Badge className="bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100">
      ⚙️ Admin
    </Badge>
  );
  
  if (!sourceInfo) return defaultBadge;
  
  const sourceConfig = {
    admin: { 
      label: "⚙️ Admin", 
      className: "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
    },
    storefront: { 
      label: "🏪 Storefront", 
      className: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
    },
    'tiktok-shop': { 
      label: "🎵 TikTok Shop", 
      className: "bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200 font-semibold"
    },
    'landing-page': { 
      label: "🔗 Landing Page", 
      className: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
    }
  };

  const config = sourceConfig[sourceInfo.source] || sourceConfig.admin;
  
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
};

// 🔄 Sync Status Badge Component  
const getSyncStatusBadge = (syncStatus?: string) => {
  if (!syncStatus || syncStatus === 'manual') return null;
  
  const syncConfig = {
    synced: { label: "Synced", variant: "default" as const, color: "text-green-600" },
    pending: { label: "Syncing", variant: "secondary" as const, color: "text-yellow-600" },
    failed: { label: "Sync Failed", variant: "destructive" as const, color: "text-red-600" }
  };

  const config = syncConfig[syncStatus as keyof typeof syncConfig];
  if (!config) return null;
  
  return (
    <Badge variant={config.variant} className="flex items-center gap-1 text-xs">
      <RefreshCw className={`h-2 w-2 ${config.color}`} />
      {config.label}
    </Badge>
  );
};

export function BookOrderTable({ onViewOrder }: BookOrderTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isbnSearch, setIsbnSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [conditionFilter, setConditionFilter] = useState<string>("all");
  const [bookSourceFilter, setBookSourceFilter] = useState<string>("all");
  const [inventoryStatusFilter, setInventoryStatusFilter] = useState<string>("all");
  const [sellerFilter, setSellerFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [syncStatusFilter, setSyncStatusFilter] = useState<string>("all");
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<BookOrderWithCustomerInfo | null>(null);
  const [deletingOrder, setDeletingOrder] = useState<BookOrderWithCustomerInfo | null>(null);
  
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // 🌿 Gentle Green Notifications for Book Orders
  const { triggerNewOrderNotification, NewOrderNotificationComponent } = useNewOrderNotification();
  
  // 📱 Enhanced responsive design hooks
  const { isMobile, isTablet, deviceType } = useResponsive();
  const { touchButtonSize, minTouchTarget, touchPadding, touchGap } = useTouchFriendly();

  // 🚀 Enhanced Book Orders Query with comprehensive filtering
  const { data: bookOrders = [], isLoading, error } = useQuery<BookOrderWithCustomerInfo[]>({
    queryKey: ["/api/book-orders", sourceFilter, syncStatusFilter, conditionFilter, bookSourceFilter, inventoryStatusFilter, sellerFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (sourceFilter && sourceFilter !== 'all') {
        params.set('source', sourceFilter);
      }
      if (syncStatusFilter && syncStatusFilter !== 'all') {
        params.set('syncStatus', syncStatusFilter);
      }
      if (conditionFilter && conditionFilter !== 'all') {
        params.set('condition', conditionFilter);
      }
      if (bookSourceFilter && bookSourceFilter !== 'all') {
        params.set('bookSource', bookSourceFilter);
      }
      if (inventoryStatusFilter && inventoryStatusFilter !== 'all') {
        params.set('inventoryStatus', inventoryStatusFilter);
      }
      if (sellerFilter && sellerFilter !== 'all') {
        params.set('sellerId', sellerFilter);
      }
      
      const response = await apiRequest('GET', `/api/book-orders?${params.toString()}`);
      return response.json();
    },
    refetchInterval: 30000, // Check for new orders every 30 seconds
  });

  // Fetch book sellers for seller filter
  const { data: bookSellers = [] } = useQuery<BookSeller[]>({
    queryKey: ["/api/book-sellers"],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/book-sellers');
        return response.json();
      } catch (error) {
        console.log("Book sellers API not available yet, returning empty array");
        return [];
      }
    },
  });

  // 🌿 New Order Detection for Book Orders (Robust)
  useEffect(() => {
    if (bookOrders?.length > 0) {
      // Only process notifications when no search/filter applied (clean state)
      const isCleanState = searchTerm === "" && statusFilter === "all" && isbnSearch === "";
      
      if (!isCleanState) return;
      
      // Get persistent state for book orders
      const lastSeenKey = `lastSeenBookOrder`;
      const seenIdsKey = `seenBookOrderIds`;
      
      const lastSeenTimestamp = localStorage.getItem(lastSeenKey);
      const lastSeen = lastSeenTimestamp ? new Date(lastSeenTimestamp) : null;
      
      const seenIdsJson = localStorage.getItem(seenIdsKey);
      const seenIds = new Set<string>(seenIdsJson ? JSON.parse(seenIdsJson) : []);
      
      // Initialize baseline on first load to prevent deadlock
      if (!lastSeen) {
        const newestOrderDate = bookOrders[0].createdAt ? new Date(bookOrders[0].createdAt) : new Date();
        localStorage.setItem(lastSeenKey, newestOrderDate.toISOString());
        // Add all current order IDs to seen set to prevent immediate notifications
        bookOrders.forEach((order: BookOrderWithCustomerInfo) => seenIds.add(order.id));
        localStorage.setItem(seenIdsKey, JSON.stringify(Array.from(seenIds)));
        return; // Skip notifications on initialization
      }
      
      // Find truly new orders (after last seen time AND not in seen IDs)
      const newOrders = bookOrders.filter((order: BookOrderWithCustomerInfo) => {
        if (!lastSeen || !order.createdAt) return false; // Safety guard
        const orderDate = new Date(order.createdAt);
        return orderDate > lastSeen && !seenIds.has(order.id);
      });
      
      // Process each new order sequentially with stagger (max 20 to avoid spam)
      const notifyOrders = newOrders.slice(0, 20);
      const remainingCount = newOrders.length - notifyOrders.length;
      
      notifyOrders.forEach((order: BookOrderWithCustomerInfo, index: number) => {
        setTimeout(() => {
          // Calculate time ago
          const orderDate = order.createdAt ? new Date(order.createdAt) : new Date();
          const now = new Date();
          const diffInMinutes = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60));
          
          let timeAgo = 'Just now';
          if (diffInMinutes >= 1 && diffInMinutes < 60) {
            timeAgo = `${diffInMinutes} min ago`;
          } else if (diffInMinutes >= 60) {
            const hours = Math.floor(diffInMinutes / 60);
            timeAgo = `${hours} hr ago`;
          }
          
          // Trigger gentle green notification for book order with ISBN info
          triggerNewOrderNotification({
            id: order.id,
            orderNumber: formatOrderId(order),
            customerName: order.customerNameBook,
            totalAmount: Number(order.total),
            currency: 'USD',
            itemCount: typeof order.items === 'number' ? order.items : 1,
            timeAgo: timeAgo
          });
          
          // Add to seen IDs
          seenIds.add(order.id);
        }, index * 800); // Stagger by 800ms
      });
      
      // Show summary notification if too many new orders
      if (remainingCount > 0) {
        setTimeout(() => {
          toast({
            variant: 'gentle-success',
            title: `+${remainingCount} More New Book Orders`,
            description: 'Multiple new book orders arrived simultaneously'
          });
        }, notifyOrders.length * 800 + 400);
      }
      
      // Update persistent state (burst-safe lastSeen advancement)
      if (newOrders.length > 0) {
        // Only advance lastSeen if there's no potential truncation
        const pageIsFull = bookOrders.length >= 25; // Assuming pagination limit
        const potentialTruncation = remainingCount > 0 || (pageIsFull && newOrders.length >= 25);
        
        if (!potentialTruncation) {
          // Safe to advance lastSeen - all new orders are on this page
          const maxNotifiedDate = Math.max(...notifyOrders.map(o => o.createdAt ? new Date(o.createdAt).getTime() : 0));
          const currentLastSeen = lastSeen || new Date(0);
          const newLastSeen = new Date(Math.max(maxNotifiedDate, currentLastSeen.getTime()));
          localStorage.setItem(lastSeenKey, newLastSeen.toISOString());
        }
        // If truncation detected, rely on seenIds for deduplication without advancing lastSeen
      }
      
      // Always update seen IDs to maintain LRU cache
      if (bookOrders.length > 0) {
        // Add all notified order IDs to seen set 
        notifyOrders.forEach((order: BookOrderWithCustomerInfo) => seenIds.add(order.id));
        
        // Prune seenIds to maintain LRU with 500 limit
        const seenIdsArray = Array.from(seenIds);
        const prunedSeenIds = seenIdsArray.slice(-500);
        localStorage.setItem(seenIdsKey, JSON.stringify(prunedSeenIds));
      }
    }
  }, [bookOrders, searchTerm, statusFilter, isbnSearch, triggerNewOrderNotification, toast]);

  // 🚀 Enhanced Filtering with Book-Specific Features
  const filteredOrders = bookOrders.filter(order => {
    const matchesSearch = order.customerNameBook.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (order.customerEmailBook && order.customerEmailBook.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (order.sellerName && order.sellerName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesISBN = !isbnSearch || (order.isbn && order.isbn.toLowerCase().includes(isbnSearch.toLowerCase()));
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    const matchesCondition = conditionFilter === "all" || order.condition === conditionFilter;
    const matchesBookSource = bookSourceFilter === "all" || order.bookSource === bookSourceFilter;
    const matchesInventoryStatus = inventoryStatusFilter === "all" || order.inventoryStatus === inventoryStatusFilter;
    const matchesSeller = sellerFilter === "all" || order.sellerId === sellerFilter;
    const matchesSource = sourceFilter === "all" || (order.sourceInfo?.source || 'admin') === sourceFilter;
    const matchesSyncStatus = syncStatusFilter === "all" || (order.sourceInfo?.syncStatus || 'manual') === syncStatusFilter;
    
    return matchesSearch && matchesISBN && matchesStatus && matchesCondition && 
           matchesBookSource && matchesInventoryStatus && matchesSeller && 
           matchesSource && matchesSyncStatus;
  });

  // Delete book order mutation
  const deleteMutation = useMutation({
    mutationFn: async (orderId: string) => {
      await apiRequest('DELETE', `/api/book-orders/${orderId}`);
    },
    onSuccess: () => {
      toast({
        title: "Order deleted",
        description: "Order has been successfully deleted",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/book-orders"] });
      setDeletingOrder(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Status update mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, newStatus }: { orderId: string; newStatus: string }) => {
      const response = await apiRequest('PUT', `/api/book-orders/${orderId}/status`, {
        status: newStatus
      });
      return response.json();
    },
    onSuccess: (data, { orderId, newStatus }) => {
      toast({
        title: "Order status updated",
        description: `Order has been updated to: ${getStatusLabel(newStatus)}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/book-orders"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Status update error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleViewOrder = (order: BookOrderWithCustomerInfo) => {
    setLocation(`/book-orders/${order.id}`);
  };

  const handleEditOrder = (order: BookOrderWithCustomerInfo) => {
    setEditingOrder(order);
  };

  const handleDeleteOrder = (order: BookOrderWithCustomerInfo) => {
    setDeletingOrder(order);
  };

  const handleUpdateStatus = (orderId: string, newStatus: string) => {
    updateStatusMutation.mutate({ orderId, newStatus });
  };

  const confirmDelete = () => {
    if (deletingOrder) {
      deleteMutation.mutate(deletingOrder.id);
    }
  };

  if (isLoading) {
    return (
      <Card data-testid="book-order-table">
        <CardHeader>
          <CardTitle>Recent Book Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center gap-4">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card data-testid="book-order-table">
        <CardHeader>
          <CardTitle>Recent Book Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">Unable to load book order data</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* 🌿 Gentle Green Notifications for Book Orders */}
      <NewOrderNotificationComponent />
      
      <Card data-testid="book-order-table">
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <Book className="h-5 w-5 text-blue-600" />
              <CardTitle>Recent Book Orders</CardTitle>
            </div>
            <div className="flex flex-col gap-2 md:flex-row md:items-center">
              <Button 
                onClick={() => setIsCreateFormOpen(true)}
                data-testid="button-create-book-order"
                className="md:order-last"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Order
              </Button>
              
              {/* Search Controls */}
              <div className="flex flex-col gap-2 md:flex-row md:items-center">
                {/* General Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="book-orders-search"
                    name="book-orders-search"
                    placeholder="Search by customer name, order ID, ISBN..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 md:w-64"
                    data-testid="input-search-book-orders"
                  />
                </div>

                {/* ISBN Search */}
                <div className="relative">
                  <Book className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="isbn-search"
                    name="isbn-search"
                    placeholder="Search by ISBN"
                    value={isbnSearch}
                    onChange={(e) => setIsbnSearch(e.target.value)}
                    className="pl-10 md:w-48"
                    data-testid="input-search-isbn"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Filter Controls */}
          <div className="flex flex-wrap gap-2 mt-4">
            {/* Status Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" data-testid="button-filter-status">
                  <Filter className="h-4 w-4 mr-2" />
                  {statusFilter === "all" ? "Status" : getStatusBadge(statusFilter).props.children}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                  All
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("pending")}>
                  Pending
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("processing")}>
                  Processing
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("shipped")}>
                  Shipped
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("delivered")}>
                  Delivered
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("cancelled")}>
                  Cancelled
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Book Condition Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" data-testid="button-filter-condition">
                  <Award className="h-4 w-4 mr-2" />
                  {conditionFilter === "all" ? "Book Condition" : (() => {
                    const conditionLabels = {
                      new: "New",
                      like_new: "Like New", 
                      very_good: "Very Good",
                      good: "Good",
                      acceptable: "Acceptable"
                    };
                    return conditionLabels[conditionFilter as keyof typeof conditionLabels] || conditionFilter;
                  })()}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setConditionFilter("all")}>
                  All
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setConditionFilter("new")}>
                  ✨ New
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setConditionFilter("like_new")}>
                  ⭐ Like New
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setConditionFilter("very_good")}>
                  👍 Very Good
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setConditionFilter("good")}>
                  👌 Good
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setConditionFilter("acceptable")}>
                  📖 Acceptable
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Book Source Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" data-testid="button-filter-book-source">
                  <Package className="h-4 w-4 mr-2" />
                  {bookSourceFilter === "all" ? "Book Source" : (() => {
                    const sourceLabels = {
                      abebooks: "AbeBooks",
                      local_inventory: "Local Inventory",
                      dropship: "Dropship",
                      consignment: "Consignment"
                    };
                    return sourceLabels[bookSourceFilter as keyof typeof sourceLabels] || bookSourceFilter;
                  })()}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setBookSourceFilter("all")}>
                  All
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setBookSourceFilter("abebooks")}>
                  📚 AbeBooks
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setBookSourceFilter("local_inventory")}>
                  🏪 Local Inventory
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setBookSourceFilter("dropship")}>
                  🚚 Dropship
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setBookSourceFilter("consignment")}>
                  🤝 Consignment
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Inventory Status Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" data-testid="button-filter-inventory">
                  <Package className="h-4 w-4 mr-2" />
                  {inventoryStatusFilter === "all" ? "Inventory Status" : (() => {
                    const inventoryLabels = {
                      reserved: "Reserved",
                      allocated: "Allocated", 
                      shipped: "Shipped",
                      returned: "Returned"
                    };
                    return inventoryLabels[inventoryStatusFilter as keyof typeof inventoryLabels] || inventoryStatusFilter;
                  })()}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setInventoryStatusFilter("all")}>
                  All
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setInventoryStatusFilter("reserved")}>
                  🔒 Reserved
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setInventoryStatusFilter("allocated")}>
                  📦 Allocated
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setInventoryStatusFilter("shipped")}>
                  🚚 Shipped
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setInventoryStatusFilter("returned")}>
                  ↩️ Returned
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Seller Filter */}
            {bookSellers.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" data-testid="button-filter-seller">
                    <UserPlus className="h-4 w-4 mr-2" />
                    {sellerFilter === "all" ? "Filter by Seller" : (() => {
                      const seller = bookSellers.find(s => s.id === sellerFilter);
                      return seller ? seller.displayName : "Selected Seller";
                    })()}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setSellerFilter("all")}>
                    All Sellers
                  </DropdownMenuItem>
                  {bookSellers.map(seller => (
                    <DropdownMenuItem key={seller.id} onClick={() => setSellerFilter(seller.id)}>
                      {seller.displayName}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Source Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" data-testid="button-filter-source">
                  <Store className="h-4 w-4 mr-2" />
                  {sourceFilter === "all" ? "Order Source" : (() => {
                    const sourceLabels = {
                      admin: "Admin", 
                      storefront: "Storefront",
                      'tiktok-shop': "TikTok Shop",
                      'landing-page': "Landing Page"
                    };
                    return sourceLabels[sourceFilter as keyof typeof sourceLabels] || sourceFilter;
                  })()}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSourceFilter("all")}>
                  All
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSourceFilter("admin")}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Admin
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSourceFilter("storefront")}>
                  <Store className="h-4 w-4 mr-2" />
                  Storefront
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSourceFilter("tiktok-shop")}>
                  <Bolt className="h-4 w-4 mr-2" />
                  TikTok Shop
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSourceFilter("landing-page")}>
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Landing Page
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Sync Status Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" data-testid="button-filter-sync">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {syncStatusFilter === "all" ? "Sync Status" : (() => {
                    const syncLabels = {
                      manual: "Manual",
                      synced: "Synced", 
                      pending: "Syncing",
                      failed: "Sync Failed"
                    };
                    return syncLabels[syncStatusFilter as keyof typeof syncLabels] || syncStatusFilter;
                  })()}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSyncStatusFilter("all")}>
                  All
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSyncStatusFilter("manual")}>
                  Manual
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSyncStatusFilter("synced")}>
                  Synced
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSyncStatusFilter("pending")}>
                  Syncing
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSyncStatusFilter("failed")}>
                  Sync Failed
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        
        <CardContent>
          {filteredOrders.length === 0 ? (
            <div className="text-center py-8">
              <Book className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No book orders yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>ISBN</TableHead>
                    <TableHead>Condition</TableHead>
                    <TableHead>Book Source</TableHead>
                    <TableHead>Inventory</TableHead>
                    <TableHead>Seller</TableHead>
                    <TableHead>Commission</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Sync</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id} className="group hover:bg-muted/50">
                      <TableCell className="font-mono text-sm">
                        {getShortOrderId(order)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{order.customerNameBook}</div>
                          <div className="text-sm text-muted-foreground">{order.customerEmailBook || 'None'}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-mono text-sm">
                          {order.isbn || "None"}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getConditionBadge(order.condition)}
                      </TableCell>
                      <TableCell>
                        {getBookSourceBadge(order.bookSource)}
                      </TableCell>
                      <TableCell>
                        {getInventoryStatusBadge(order.inventoryStatus)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {order.sellerName || "None"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium">
                          {order.sellerCommission ? formatPrice(Number(order.sellerCommission)) : "0 ₫"}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatPrice(Number(order.total))}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(order.status)}
                      </TableCell>
                      <TableCell>
                        {getSourceBadge(order.sourceInfo)}
                      </TableCell>
                      <TableCell>
                        {getSyncStatusBadge(order.sourceInfo?.syncStatus)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {order.createdAt ? formatDate(order.createdAt.toString()) : "Unspecified"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusUpdateButton(order, handleUpdateStatus, updateStatusMutation.isPending)}
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewOrder(order)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditOrder(order)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDeleteOrder(order)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Form Dialog */}
      {(isCreateFormOpen || editingOrder) && (
        <BookOrderForm
          order={editingOrder}
          onClose={() => {
            setIsCreateFormOpen(false);
            setEditingOrder(null);
          }}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["/api/book-orders"] });
            setIsCreateFormOpen(false);
            setEditingOrder(null);
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingOrder} onOpenChange={() => setDeletingOrder(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this order? This action cannot be undone.
              {deletingOrder && (
                <div className="mt-2 p-2 bg-muted rounded">
                  <div className="font-medium">Order: {getShortOrderId(deletingOrder)}</div>
                  <div className="text-sm">Customer: {deletingOrder.customerNameBook}</div>
                  <div className="text-sm">ISBN: {deletingOrder.isbn || "None"}</div>
                  <div className="text-sm">Total: {formatPrice(Number(deletingOrder.total))}</div>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}