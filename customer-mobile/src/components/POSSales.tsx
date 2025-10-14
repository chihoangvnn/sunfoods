"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

// Performance Optimized Components & Hooks
import { useOptimizedQuery, useOptimizedProductQuery } from "@/hooks/useOptimizedQuery";
import { usePerformanceMonitor, useRenderPerformance, useInteractionPerformance } from "@/hooks/usePerformanceMonitor";
import { useOptimizedTabManager } from "@/components/OptimizedTabManager";
import { OptimizedProductGrid } from "@/components/OptimizedProductGrid";
import { VirtualizedProductList } from "@/components/VirtualizedProductList";
import { PerformanceOverlay, usePerformanceOverlayControl } from "@/components/PerformanceOverlay";
import { useMemoryMonitor, useComponentMemoryTracking, useMultiTabMemoryOptimization } from "@/hooks/useMemoryMonitor";

// Vietnamese Search Optimization
import { 
  vietnameseFilter, 
  createSearchCacheKey, 
  createSearchString,
  testVietnameseSearch 
} from "@/utils/vietnameseSearch";

import { formatOrderId } from "@/utils/orderUtils";
import CartManager from "@/utils/cartManager";

import { 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  ShoppingCart, 
  CreditCard,
  QrCode,
  User,
  Users,
  Calculator,
  Camera,
  X,
  MoreVertical,
  CheckCircle,
  Circle,
  Clock,
  Printer,
  Settings,
  RotateCcw,
  Receipt,
  Filter,
  Tag,
  Grid3x3,
  Activity
} from "lucide-react";

// Default customer for walk-in customers (khách vãng lai)
const DEFAULT_CUSTOMER_ID = 'feefc007-c238-4758-bdbd-9b49ed89c11c';
import { CustomerSearchInput, CustomerSearchInputRef } from "@/components/CustomerSearchInput";
import { QRPayment } from "@/components/QRPayment";
import { QRScanner } from "@/components/QRScanner";
import { DecimalQuantityInput } from "@/components/DecimalQuantityInput";
import { ReceiptPrinter } from "@/components/ReceiptPrinter";
import { ReceiptSettings, useReceiptSettings } from "@/components/ReceiptSettings";
import { SplitOrderModal, type SplitOrderData } from "@/components/SplitOrderModal";
import type { Product, Customer, Order, OrderItem, ShopSettings, Category } from "@shared/schema";
import type { CartItem } from "@/components/OptimizedTabManager";

interface POSSalesProps {}

const formatPrice = (price: string | number) => {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(numPrice);
};

interface QuantityInputProps {
  productId: string;
  quantity: number;
  allowDecimals: boolean;
  minQuantity: number;
  maxQuantity: number;
  quantityStep: number;
  updateQuantity: (productId: string, qty: number) => void;
}

const QuantityInput = ({ productId, quantity, allowDecimals, minQuantity, maxQuantity, quantityStep, updateQuantity }: QuantityInputProps) => {
  const [localValue, setLocalValue] = useState(String(quantity));
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
  };
  
  const handleBlur = () => {
    let num = parseFloat(localValue);
    
    if (isNaN(num) || num <= 0) {
      num = minQuantity;
    }
    
    num = Math.max(minQuantity, Math.min(maxQuantity, num));
    
    setLocalValue(num.toFixed(allowDecimals ? 2 : 0));
    updateQuantity(productId, num);
  };
  
  const handleIncrement = () => {
    const num = parseFloat(localValue) || 0;
    const next = Math.min(maxQuantity, num + quantityStep);
    setLocalValue(next.toFixed(allowDecimals ? 2 : 0));
    updateQuantity(productId, next);
  };
  
  const handleDecrement = () => {
    const num = parseFloat(localValue) || 0;
    const next = Math.max(minQuantity, num - quantityStep);
    setLocalValue(next.toFixed(allowDecimals ? 2 : 0));
    updateQuantity(productId, next);
  };
  
  useEffect(() => {
    setLocalValue(quantity.toFixed(allowDecimals ? 2 : 0));
  }, [quantity, allowDecimals]);
  
  return (
    <div className="flex items-center gap-1">
      <Button type="button" variant="outline" size="sm" onClick={handleDecrement} className="h-7 w-7 p-0">
        <Minus className="h-3 w-3" />
      </Button>
      
      <Input
        type="text"
        value={localValue}
        onChange={handleChange}
        onBlur={handleBlur}
        className="h-7 w-16 text-center text-sm"
      />
      
      <Button type="button" variant="outline" size="sm" onClick={handleIncrement} className="h-7 w-7 p-0">
        <Plus className="h-3 w-3" />
      </Button>
    </div>
  );
};

export default function POSSales({}: POSSalesProps) {
  // Performance tracking for the entire POS component
  useRenderPerformance('POSSales');
  useComponentMemoryTracking('POSSales');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Performance and memory monitoring
  const { measureOperation, measureAsync } = usePerformanceMonitor();
  const { measureInteraction } = useInteractionPerformance();
  const { memoryStats } = useMemoryMonitor();
  const { shouldReduceMemoryUsage } = useMultiTabMemoryOptimization();
  const performanceOverlay = usePerformanceOverlayControl();
  
  // Refs for keyboard shortcuts
  const productSearchRef = useRef<HTMLInputElement>(null);
  const customerSearchRef = useRef<CustomerSearchInputRef>(null);
  
  // Optimized Tab Manager with performance tracking
  const tabManager = useOptimizedTabManager();
  
  // Get current tab data safely
  const activeTab = tabManager.activeTab;
  const setCategoryFilter = tabManager.setCategoryFilter;
  const selectedCategoryId = activeTab?.selectedCategoryId || null;
  
  // Receipt Settings
  const [receiptConfig, setReceiptConfig] = useReceiptSettings();
  
  // Global state (not tab-specific)
  const [searchTerm, setSearchTerm] = useState("");
  const [normalizedSearchTerm, setNormalizedSearchTerm] = useState("");
  const [showPayment, setShowPayment] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [currentOrderItems, setCurrentOrderItems] = useState<(OrderItem & { product: Product })[]>([]);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [isSearchingBarcode, setIsSearchingBarcode] = useState(false);
  const [showReceiptPrinter, setShowReceiptPrinter] = useState(false);
  const [showSplitOrderModal, setShowSplitOrderModal] = useState(false);
  const [lastPrintedOrder, setLastPrintedOrder] = useState<{
    order: Order;
    orderItems: (OrderItem & { product: Product })[];
    customer?: Customer;
  } | null>(null);
  const [sendInvoiceToChat, setSendInvoiceToChat] = useState(false);
  
  // Vietnamese search normalization with performance tracking
  useEffect(() => {
    const measure = measureOperation('vietnamese-search-normalize');
    const normalized = createSearchString(searchTerm);
    setNormalizedSearchTerm(normalized);
    measure.end();
  }, [searchTerm, measureOperation]);
  
  // Test Vietnamese search functionality in development
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      testVietnameseSearch();
    }
  }, []);

  // Categories query - using standard React Query for reliability
  const { 
    data: categories = [], 
    isLoading: categoriesLoading
  } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => measureAsync('api-categories', () => 
      fetch('/api/categories').then(res => res.json())
    ),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
  });

  // Manual prefetch function for backwards compatibility
  const prefetchCategories = useCallback(() => {
    queryClient.prefetchQuery({
      queryKey: ['categories'],
      queryFn: () => fetch('/api/categories').then(res => res.json()),
      staleTime: 10 * 60 * 1000,
    });
  }, [queryClient]);

  // Optimized products query with Vietnamese search and performance tracking
  const searchQueryKey = useMemo(() => 
    createSearchCacheKey(normalizedSearchTerm, { categoryId: selectedCategoryId }),
    [normalizedSearchTerm, selectedCategoryId]
  );

  const { 
    data: products = [], 
    isLoading: productsLoading
  } = useQuery<Product[]>({
    queryKey: ['products', { categoryId: selectedCategoryId, search: searchQueryKey }],
    queryFn: () => measureAsync('api-products-search', async () => {
      const params = new URLSearchParams();
      if (selectedCategoryId) {
        params.append('categoryId', selectedCategoryId);
      }
      if (searchTerm.trim()) {
        // Use original search term for API call (server handles normalization)
        params.append('search', searchTerm.trim());
      }
      const url = `/api/products${params.toString() ? '?' + params.toString() : ''}`;
      const response = await fetch(url);
      return response.json();
    }),
    staleTime: 1 * 60 * 1000, // 1 minute for products (less than categories due to frequent updates)
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });

  // Manual prefetch function for backwards compatibility
  const prefetchProducts = useCallback(() => {
    queryClient.prefetchQuery({
      queryKey: ['products', { categoryId: selectedCategoryId, search: searchQueryKey }],
      queryFn: () => measureAsync('api-products-search', async () => {
        const params = new URLSearchParams();
        if (selectedCategoryId) {
          params.append('categoryId', selectedCategoryId);
        }
        if (searchTerm.trim()) {
          params.append('search', searchTerm.trim());
        }
        const url = `/api/products${params.toString() ? '?' + params.toString() : ''}`;
        const response = await fetch(url);
        return response.json();
      }),
      staleTime: 1 * 60 * 1000,
    });
  }, [queryClient, selectedCategoryId, searchQueryKey, searchTerm]);

  // Background refresh function for backwards compatibility
  const backgroundRefreshProducts = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['products'] });
  }, [queryClient]);

  // Optimized shop settings query (API returns single object, not array)
  const { 
    data: shopSettings = null, 
    isLoading: shopSettingsLoading 
  } = useOptimizedQuery<ShopSettings>(
    ['shop-settings'],
    () => measureAsync('api-shop-settings', () =>
      fetch('/api/shop-settings').then(res => res.json())
    ),
    {
      customerDataCaching: true,
      prefetchOnMount: true,
    }
  );


  // Get default shop settings (API returns single object)
  const defaultShopSettings = shopSettings || {
    id: 'default',
    businessName: 'Cửa hàng POS',
    address: '',
    phone: '',
    email: '',
    website: '',
    description: null,
    logo: null,
    isDefault: true,
    createdAt: null,
    updatedAt: null
  } as ShopSettings;

  // Intelligent prefetching on mount for better performance
  useEffect(() => {
    const prefetchCommonData = async () => {
      const measure = measureOperation('prefetch-common-data');
      try {
        // Prefetch all categories immediately
        await prefetchCategories();
        
        // Prefetch products for first category after a short delay
        if (categories.length > 0) {
          setTimeout(async () => {
            try {
              await prefetchProducts();
              // Prefetch products from the most popular category
              await queryClient.prefetchQuery({
                queryKey: ['products', { categoryId: categories[0]?.id }],
                queryFn: () => fetch(`/api/products?categoryId=${categories[0]?.id}`).then(res => res.json()),
                staleTime: 2 * 60 * 1000, // Cache for 2 minutes
              });
            } catch (error) {
              console.warn('Failed to prefetch products:', error);
            }
          }, 500);
        }
        
        // Background refresh every 5 minutes for inventory updates
        setTimeout(() => {
          backgroundRefreshProducts();
        }, 5 * 60 * 1000);
        
      } catch (error) {
        console.warn('Failed to prefetch common data:', error);
      } finally {
        measure.end();
      }
    };

    prefetchCommonData();
  }, [prefetchCategories, prefetchProducts, backgroundRefreshProducts, categories, queryClient, measureOperation]);

  // Ensure products is always an array with Vietnamese filtering fallback
  const safeProducts = Array.isArray(products) ? products : [];
  
  // Client-side Vietnamese search filtering as fallback for better search quality
  const filteredProducts = useMemo(() => {
    const measure = measureOperation('client-side-vietnamese-filter');
    
    let filtered = safeProducts.filter(product => product.status === 'active');
    
    // If we have a search term, apply Vietnamese-aware filtering
    if (normalizedSearchTerm.length > 0) {
      filtered = vietnameseFilter(filtered, searchTerm, ['name', 'description', 'sku', 'itemCode']);
    }
    
    measure.end();
    return filtered;
  }, [safeProducts, normalizedSearchTerm, searchTerm, measureOperation]);

  // Get cart and customer data from activeTab with safety checks
  const cart = activeTab?.cart || [];
  const selectedCustomer = activeTab?.selectedCustomer || null;
  
  // Use CartManager for decimal-safe calculations
  const roundedCartTotal = CartManager.calculateCartTotal(cart);
  const cartItemCount = CartManager.calculateCartItemCount(cart);

  // Helper function to get product unit settings
  const getProductUnitSettings = (product: Product) => {
    // API returns camelCase fields (transformed from database snake_case)
    const unitType = (product as any).unitType || 'count';
    const unit = (product as any).unit || 'cái';
    
    // POS ALWAYS allows decimals for flexible quantity input
    const allowDecimals = true;
    
    // POS ALWAYS uses minimum 0.01 for all products
    const minQuantity = 0.01;
    const quantityStep = 0.01;
    
    return {
      unitType,
      unit,
      allowDecimals,
      minQuantity,
      quantityStep
    };
  };

  // Performance-instrumented keyboard shortcuts with technical goals tracking
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Prevent default browser behavior for F2, F3, and 1-5
      if (event.key === 'F2' || event.key === 'F3' || ['1', '2', '3', '4', '5'].includes(event.key)) {
        // Only prevent default if not typing in an input field
        const activeElement = document.activeElement;
        const isTyping = activeElement?.tagName === 'INPUT' || activeElement?.tagName === 'TEXTAREA';
        
        if (!isTyping || event.key === 'F2' || event.key === 'F3') {
          event.preventDefault();
        }
      }

      // F2: Focus product search with performance tracking
      if (event.key === 'F2') {
        const searchMeasure = measureInteraction('search-focus', { source: 'keyboard-f2' });
        productSearchRef.current?.focus();
        const duration = searchMeasure.end();
        
        // Technical goal: Search operations < 200ms (focus is part of search UX)
        if (duration > 200) {
          console.warn(`🚨 Search focus slow: ${duration.toFixed(2)}ms > 200ms target`);
        }
        
        toast({
          title: "Tìm sản phẩm",
          description: "Đã chuyển đến ô tìm kiếm sản phẩm",
          duration: 1500,
        });
      }

      // F3: Focus customer search with performance tracking
      if (event.key === 'F3') {
        const customerMeasure = measureInteraction('customer-search-focus', { source: 'keyboard-f3' });
        customerSearchRef.current?.focus();
        const duration = customerMeasure.end();
        
        // Track customer search focus time
        if (duration > 100) {
          console.warn(`🚨 Customer search focus slow: ${duration.toFixed(2)}ms`);
        }
        
        toast({
          title: "Tìm khách hàng",
          description: "Đã chuyển đến ô tìm kiếm khách hàng", 
          duration: 1500,
        });
      }

      // 1-5: Switch tabs with technical goal instrumentation
      const activeElement = document.activeElement;
      const isTyping = activeElement?.tagName === 'INPUT' || activeElement?.tagName === 'TEXTAREA';
      
      if (!isTyping && ['1', '2', '3', '4', '5'].includes(event.key)) {
        // Technical goal: Tab switching < 100ms
        const tabSwitchMeasure = measureInteraction('tab-switch-keyboard', { 
          key: event.key,
          source: 'keyboard-shortcut',
          targetTab: `tab-${event.key}`
        });
        
        const tabIndex = parseInt(event.key) - 1;
        const targetTabId = `tab-${event.key}`;
        tabManager.switchToTab(targetTabId);
        
        const duration = tabSwitchMeasure.end();
        
        // Performance alert if tab switching exceeds 100ms threshold
        if (duration > 100) {
          console.warn(`🚨 Tab switch slow: ${duration.toFixed(2)}ms > 100ms target`);
        }
        
        toast({
          title: `Đã chuyển sang ${tabManager.tabs[tabIndex]?.name || 'tab'}`,
          description: `Phím tắt: ${event.key} (${duration.toFixed(1)}ms)`,
          duration: 1000,
        });
      }
    };

    // Add event listener
    document.addEventListener('keydown', handleKeyDown);

    // Cleanup event listener on unmount
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [toast, tabManager, measureInteraction]);

  // Performance-optimized add to cart with technical goals instrumentation
  const addToCart = useCallback((product: Product) => {
    // Technical goal: Cart operations < 50ms
    const cartMeasure = measureInteraction('cart-add-product', { 
      productId: product.id, 
      productName: product.name 
    });
    
    try {
      // Safety check: ensure tabManager and activeTab are available
      if (!tabManager || !activeTab) {
        toast({
          title: "Lỗi hệ thống",
          description: "Tab Manager chưa được khởi tạo",
          variant: "destructive",
        });
        return;
      }
      
      if (product.status === 'out-of-stock' || product.stock <= 0) {
        toast({
          title: "Hết hàng",
          description: "Sản phẩm này hiện đã hết hàng",
          variant: "destructive",
        });
        return;
      }

      const { quantityStep, minQuantity } = getProductUnitSettings(product);
      const existingItem = cart.find(item => item.product.id === product.id);
      
      if (existingItem) {
        const newQuantity = existingItem.quantity + quantityStep;
        
        // Check if we have enough stock
        if (newQuantity > product.stock) {
          toast({
            title: "Không đủ hàng",
            description: `Chỉ còn ${product.stock} sản phẩm trong kho`,
            variant: "destructive",
          });
          return;
        }
        
        tabManager.updateQuantity(product.id, newQuantity);
      } else {
        // Use minimum quantity for initial add
        const initialQuantity = Math.max(quantityStep, minQuantity);
        tabManager.addToCart(product, initialQuantity);
      }

      toast({
        title: "Đã thêm vào giỏ",
        description: `${product.name} đã được thêm vào ${tabManager.activeTab?.name || 'giỏ hàng'}`,
      });
    } finally {
      const duration = cartMeasure.end();
      
      // Performance alert if cart operation exceeds 50ms threshold
      if (duration > 50) {
        console.warn(`🚨 Cart operation slow: ${duration.toFixed(2)}ms > 50ms target`);
      }
    }
  }, [tabManager, activeTab, cart, measureInteraction, toast]);

  // Update quantity with decimal support
  const updateQuantity = (productId: string, newQuantity: number) => {
    // Safety check: ensure tabManager is available
    if (!tabManager) {
      toast({
        title: "Lỗi hệ thống",
        description: "Tab Manager chưa được khởi tạo",
        variant: "destructive",
      });
      return;
    }
    
    const product = cart.find(item => item.product.id === productId)?.product;
    
    if (product) {
      const { minQuantity } = getProductUnitSettings(product);
      
      // Remove if quantity <= 0
      if (newQuantity <= 0) {
        tabManager.removeFromCart(productId);
        return;
      }
      
      // Check minimum quantity (default 0.01 for all products)
      if (newQuantity < minQuantity) {
        toast({
          title: "Số lượng không hợp lệ",
          description: `Số lượng tối thiểu: ${minQuantity}`,
          variant: "destructive",
        });
        return;
      }
      
      // Check stock availability
      if (newQuantity > product.stock) {
        toast({
          title: "Không đủ hàng",
          description: `Chỉ còn ${product.stock} sản phẩm trong kho`,
          variant: "destructive",
        });
        return;
      }
    }

    tabManager.updateQuantity(productId, newQuantity);
  };

  // Remove from cart
  const removeFromCart = (productId: string) => {
    if (!tabManager) return;
    tabManager.removeFromCart(productId);
  };

  // Clear cart (full clear)
  const clearCart = () => {
    if (!tabManager) return;
    tabManager.clearActiveTab();
  };

  // Selective cart clearing - only remove specific items that were part of an order from specific tab
  const clearOrderItemsFromCart = (targetTabId: string, orderItems: CartItem[]) => {
    if (!tabManager || !orderItems.length) return;

    // Get the target tab's current cart at clearing time
    const targetTab = tabManager.tabs.find(tab => tab.id === targetTabId);
    if (!targetTab) return;

    // Prepare all cart mutations to batch them into a single state update
    const cartMutations: Array<{productId: string, action: 'remove' | 'update', quantity?: number}> = [];
    
    orderItems.forEach(orderItem => {
      const existingCartItem = targetTab.cart.find(item => item.product.id === orderItem.product.id);
      if (existingCartItem) {
        const remainingQuantity = existingCartItem.quantity - orderItem.quantity;
        
        if (remainingQuantity <= 0) {
          // Mark for removal if no quantity left
          cartMutations.push({
            productId: orderItem.product.id,
            action: 'remove'
          });
        } else {
          // Mark for quantity update if some quantity remains
          cartMutations.push({
            productId: orderItem.product.id,
            action: 'update',
            quantity: remainingQuantity
          });
        }
      }
    });

    // Apply all mutations in a single batched operation
    if (cartMutations.length > 0) {
      tabManager.updateTabCartBatch(targetTabId, cartMutations);
    }

    toast({
      title: "Đã dọn dẹp giỏ hàng",
      description: `Đã xóa ${orderItems.length} sản phẩm từ đơn hàng vừa lưu`,
    });
  };

  // Track items that were used to create the current order (scoped by tab)
  const [orderCartData, setOrderCartData] = useState<{
    tabId: string;
    cartItems: CartItem[];
  } | null>(null);

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: async ({ orderData, orderContext }: { orderData: any, orderContext: { tabId: string, cartItems: CartItem[] } }) => {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create order');
      }
      
      const result = await response.json();
      return { order: result, orderContext };
    },
    onSuccess: ({ order, orderContext }) => {
      setCurrentOrder(order);
      
      // Store the order context (tab ID + cart items used for this order)
      setOrderCartData({
        tabId: orderContext.tabId,
        cartItems: orderContext.cartItems
      });
      
      // Prepare order items with product info for receipt printing
      const orderItemsWithProducts = orderContext.cartItems.map(cartItem => ({
        id: '', // Will be set after order items are created
        orderId: order.id,
        productId: cartItem.product.id,
        quantity: cartItem.quantity.toString(),
        price: cartItem.product.price,
        product: cartItem.product
      }));
      
      setCurrentOrderItems(orderItemsWithProducts);
      setShowPayment(true);
      
      // Clear only the items that were part of this order from the specific tab
      clearOrderItemsFromCart(orderContext.tabId, orderContext.cartItems);
      
      toast({
        title: "Đơn hàng đã tạo",
        description: `Đơn hàng #${formatOrderId(order)} đã được tạo thành công. Giỏ hàng đã được dọn dẹp.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi tạo đơn hàng",
        description: error.message || "Không thể tạo đơn hàng",
        variant: "destructive",
      });
    },
  });

  // Process checkout
  const handleCheckout = () => {
    if (cart.length === 0) {
      toast({
        title: "Giỏ hàng trống",
        description: "Vui lòng thêm sản phẩm vào giỏ hàng",
        variant: "destructive",
      });
      return;
    }

    // Capture current tab ID and cart snapshot BEFORE async mutation
    const currentTabId = tabManager.activeTabId;
    const cartSnapshot = [...cart]; // Create snapshot at submit time
    
    const orderData = {
      customerId: selectedCustomer?.id || DEFAULT_CUSTOMER_ID, // Use default customer for walk-in sales
      total: roundedCartTotal.toString(), // Convert to string for validation
      status: 'pending',
      items: cartSnapshot.map(item => ({
        productId: item.product.id,
        quantity: item.quantity, // Decimal quantities are supported
        price: parseFloat(item.product.price),
      })),
      source: 'pos', // Mark as POS order
      tags: ['POS'], // Auto-tag POS orders
      sendInvoiceToChat, // Add checkbox state
    };

    // Store the order context for selective clearing
    const orderContext = {
      tabId: currentTabId,
      cartItems: cartSnapshot
    };

    createOrderMutation.mutate({ orderData, orderContext });
  };

  // Handle split order creation
  const handleSplitOrderComplete = async (splitOrders: SplitOrderData[]) => {
    try {
      const createdOrders: Order[] = [];
      
      // Create separate orders for each customer
      for (const splitOrder of splitOrders) {
        const orderData = {
          customerId: splitOrder.customer.id,
          total: splitOrder.total.toString(),
          status: 'pending',
          items: splitOrder.items.map(item => ({
            productId: item.cartItem.product.id,
            quantity: item.quantity,
            price: parseFloat(item.cartItem.product.price),
          })),
          source: 'pos',
          tags: ['POS'], // Auto-tag POS orders
        };

        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderData),
        });

        if (!response.ok) {
          throw new Error(`Failed to create order for ${splitOrder.customer.name}`);
        }

        const order = await response.json();
        createdOrders.push(order);
      }

      // Clear cart and show success
      clearCart();
      
      toast({
        title: "Đơn hàng đã được tách thành công",
        description: `Đã tạo ${createdOrders.length} đơn hàng riêng biệt cho từng khách hàng`,
      });

      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });

    } catch (error: any) {
      toast({
        title: "Lỗi tách đơn hàng",
        description: error.message || "Không thể tách đơn hàng",
        variant: "destructive",
      });
    }
  };

  // Handle payment completion
  const handlePaymentComplete = () => {
    if (currentOrder && currentOrderItems.length > 0) {
      // Store last printed order for reprint functionality
      setLastPrintedOrder({
        order: currentOrder,
        orderItems: currentOrderItems,
        customer: selectedCustomer || undefined
      });
      
      // Auto-print receipt if enabled
      const shouldAutoPrint = localStorage.getItem('pos-auto-print') === 'true';
      if (shouldAutoPrint) {
        setShowReceiptPrinter(true);
      }
    }
    
    // Don't clear cart here anymore - items are already selectively cleared after order creation
    // Only clear order tracking states
    setOrderCartData(null);
    setCurrentOrder(null);
    setCurrentOrderItems([]);
    setShowPayment(false);
    
    toast({
      title: "Thanh toán hoàn tất",
      description: "Đơn hàng đã được xử lý thành công",
    });
    
    queryClient.invalidateQueries({ queryKey: ['orders'] });
    queryClient.invalidateQueries({ queryKey: ['customers'] });
  };

  // Handle print receipt
  const handlePrintReceipt = () => {
    if (currentOrder && currentOrderItems.length > 0) {
      setShowReceiptPrinter(true);
    } else {
      toast({
        title: "Không có hóa đơn để in",
        description: "Vui lòng hoàn tất thanh toán trước",
        variant: "destructive",
      });
    }
  };

  // Handle receipt print success
  const handleReceiptPrintSuccess = () => {
    toast({
      title: "In hóa đơn thành công",
      description: "Hóa đơn đã được in",
    });
    setShowReceiptPrinter(false);
  };

  // Handle receipt print error
  const handleReceiptPrintError = (error: string) => {
    toast({
      title: "Lỗi in hóa đơn",
      description: error,
      variant: "destructive",
    });
  };

  // Barcode scanner handlers
  const openBarcodeScanner = () => {
    setShowBarcodeScanner(true);
  };

  const closeBarcodeScanner = () => {
    setShowBarcodeScanner(false);
    setIsSearchingBarcode(false);
  };

  const handleBarcodeScanned = async (barcode: string) => {
    setIsSearchingBarcode(true);
    closeBarcodeScanner();
    
    try {
      // Search for product by barcode
      const response = await fetch(`/api/products?search=${encodeURIComponent(barcode)}`);
      const products = await response.json();
      
      if (products.length > 0) {
        // Add first matching product to cart
        addToCart(products[0]);
        toast({
          title: "Tìm thấy sản phẩm",
          description: `${products[0].name} đã được thêm vào giỏ hàng`,
        });
      } else {
        toast({
          title: "Không tìm thấy sản phẩm",
          description: `Không có sản phẩm nào với mã: ${barcode}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Lỗi tìm kiếm",
        description: "Không thể tìm kiếm sản phẩm",
        variant: "destructive",
      });
    } finally {
      setIsSearchingBarcode(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white shadow-lg">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                <ShoppingCart className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Bán hàng POS</h1>
                <p className="text-sm text-green-100">
                  Hệ thống bán hàng nhanh
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-green-100">Tổng giỏ hàng</p>
                <p className="text-2xl font-bold">{formatPrice(roundedCartTotal)}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (lastPrintedOrder) {
                    setShowReceiptPrinter(true);
                  } else {
                    toast({
                      title: "Chưa có hóa đơn",
                      description: "Chưa có hóa đơn nào để in lại",
                      variant: "destructive",
                    });
                  }
                }}
                className="bg-white/10 text-white border-white/30 hover:bg-white/20"
              >
                <Printer className="h-4 w-4 mr-2" />
                In lại hóa đơn
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b px-6 py-2">
        <div className="flex items-center space-x-1">
          {tabManager.tabs.map((tab, index) => {
            const tabStats = tabManager.getTabStats(tab);
            const isActive = tab.id === tabManager.activeTabId;
            const shortcutKey = (index + 1).toString();
            
            // Get status icon
            const getStatusIcon = () => {
              switch (tab.status) {
                case 'empty':
                  return <Circle className="h-3 w-3 text-gray-400" />;
                case 'draft':
                  return <Clock className="h-3 w-3 text-orange-500" />;
                case 'pending':
                  return <CheckCircle className="h-3 w-3 text-green-500" />;
                default:
                  return <Circle className="h-3 w-3 text-gray-400" />;
              }
            };

            return (
              <div
                key={tab.id}
                onClick={() => {
                  // Technical goal: Tab switching < 100ms instrumentation
                  const tabSwitchMeasure = measureInteraction('tab-switch-click', {
                    fromTab: tabManager.activeTabId,
                    toTab: tab.id,
                    source: 'mouse-click'
                  });
                  
                  tabManager.switchToTab(tab.id);
                  
                  const duration = tabSwitchMeasure.end();
                  
                  // Performance alert if tab switching exceeds 100ms threshold
                  if (duration > 100) {
                    console.warn(`🚨 Tab switch click slow: ${duration.toFixed(2)}ms > 100ms target`);
                  }
                }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  const contextMenu = document.getElementById(`context-menu-${tab.id}`);
                  if (contextMenu) {
                    contextMenu.style.display = 'block';
                    contextMenu.style.left = `${e.clientX}px`;
                    contextMenu.style.top = `${e.clientY}px`;
                    
                    // Close context menu when clicking outside
                    const closeMenu = (event: MouseEvent) => {
                      if (!contextMenu.contains(event.target as Node)) {
                        contextMenu.style.display = 'none';
                        document.removeEventListener('click', closeMenu);
                      }
                    };
                    setTimeout(() => document.addEventListener('click', closeMenu), 0);
                  }
                }}
                className={`
                  relative flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer
                  ${isActive 
                    ? 'bg-green-600 text-white shadow-lg' 
                    : tab.status === 'empty' 
                      ? 'bg-gray-100 text-gray-500 hover:bg-gray-200' 
                      : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                  }
                `}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    tabManager.switchToTab(tab.id);
                  }
                }}
              >
                {/* Status Icon */}
                {getStatusIcon()}
                
                {/* Tab Name */}
                <span>{tab.name}</span>
                
                {/* Keyboard Shortcut */}
                <Badge 
                  variant="outline" 
                  className={`text-xs px-1 py-0 ${
                    isActive 
                      ? 'bg-white/20 text-white border-white/30' 
                      : 'bg-white text-gray-600 border-gray-300'
                  }`}
                >
                  {shortcutKey}
                </Badge>
                
                {/* Item Count Badge */}
                {tabStats.itemCount > 0 && (
                  <Badge 
                    className={`
                      ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs font-bold
                      ${isActive 
                        ? 'bg-white text-green-600' 
                        : 'bg-orange-500 text-white'
                      }
                    `}
                  >
                    {tabStats.itemCount > 99 ? '99+' : tabStats.itemCount}
                  </Badge>
                )}
                
                {/* Customer Indicator */}
                {tab.selectedCustomer && (
                  <User className="h-3 w-3 ml-1" />
                )}

                {/* Context Menu */}
                <div
                  id={`context-menu-${tab.id}`}
                  className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-2 min-w-[150px] hidden"
                  style={{ display: 'none' }}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (tab.status !== 'empty') {
                        if (confirm(`Bạn có chắc muốn xóa ${tab.name}? Tất cả dữ liệu sẽ bị mất.`)) {
                          tabManager.clearTab(tab.id);
                          toast({
                            title: "Đã xóa tab",
                            description: `${tab.name} đã được làm sạch`,
                          });
                        }
                      } else {
                        tabManager.clearTab(tab.id);
                      }
                      document.getElementById(`context-menu-${tab.id}`)!.style.display = 'none';
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Xóa tab</span>
                  </button>
                  
                  {tab.status !== 'empty' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const emptyTab = tabManager.tabs.find(t => t.status === 'empty');
                        if (emptyTab) {
                          tabManager.duplicateTab(tab.id, emptyTab.id);
                          tabManager.switchToTab(emptyTab.id);
                          toast({
                            title: "Đã sao chép tab",
                            description: `${tab.name} đã được sao chép sang ${emptyTab.name}`,
                          });
                        } else {
                          toast({
                            title: "Không thể sao chép",
                            description: "Không có tab trống để sao chép",
                            variant: "destructive",
                          });
                        }
                        document.getElementById(`context-menu-${tab.id}`)!.style.display = 'none';
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Sao chép sang tab mới</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          
          {/* Tab Actions */}
          <div className="flex items-center space-x-2 ml-4">
            <Button
              variant="outline"
              size="sm"
              onClick={tabManager.switchToNewOrder}
              className="text-green-600 border-green-600 hover:bg-green-50"
            >
              <Plus className="h-4 w-4 mr-1" />
              Đơn mới
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (confirm('Bạn có chắc muốn xóa tất cả đơn hàng?')) {
                  tabManager.clearAllTabs();
                  toast({
                    title: "Đã xóa tất cả đơn hàng",
                    description: "Tất cả tab đã được làm sạch",
                  });
                }
              }}
              className="text-red-600 border-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Xóa tất cả
            </Button>
          </div>
        </div>
        
        {/* Tab Status Summary */}
        <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <Circle className="h-3 w-3 text-gray-400" />
            <span>Trống</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="h-3 w-3 text-orange-500" />
            <span>Nháp</span>
          </div>
          <div className="flex items-center space-x-1">
            <CheckCircle className="h-3 w-3 text-green-500" />
            <span>Sẵn sàng</span>
          </div>
          <div className="flex items-center space-x-1">
            <User className="h-3 w-3 text-blue-500" />
            <span>Có khách hàng</span>
          </div>
          <span className="ml-4 text-gray-400">• Phím 1-5: Chuyển tab • F2: Tìm sản phẩm • F3: Tìm khách hàng</span>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Side - Products */}
        <div className="flex-1 flex flex-col bg-white">
          {/* Search & Category Filter */}
          <div className="p-4 border-b space-y-3">
            {/* Search Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Tìm sản phẩm</label>
                <Badge variant="outline" className="text-xs px-2 py-1 bg-blue-50 text-blue-600 border-blue-200">
                  F2
                </Badge>
              </div>
              <div className="flex space-x-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    ref={productSearchRef}
                    placeholder="Tìm sản phẩm theo tên hoặc mã SKU... (F2)"
                    value={searchTerm}
                    onChange={(e) => {
                  // Technical goal: Search response time < 200ms instrumentation
                  const searchMeasure = measureInteraction('search-input-change', {
                    query: e.target.value,
                    length: e.target.value.length
                  });
                  
                  setSearchTerm(e.target.value);
                  
                  const duration = searchMeasure.end();
                  
                  // Performance alert if search input handling exceeds threshold
                  if (duration > 50) {
                    console.warn(`🚨 Search input slow: ${duration.toFixed(2)}ms`);
                  }
                }}
                    className="pl-10 text-lg py-3"
                  />
                </div>
                <Button
                  onClick={openBarcodeScanner}
                  disabled={isSearchingBarcode}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-3 text-lg font-medium"
                >
                  <Camera className="h-5 w-5 mr-2" />
                  📷 Quét mã vạch
                </Button>
              </div>
            </div>

            {/* Category Filter Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-gray-800">Danh mục sản phẩm</label>
                <div className="flex items-center space-x-1 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-md">
                  <Grid3x3 className="h-3 w-3" />
                  <span>{filteredProducts.length} sản phẩm</span>
                </div>
              </div>
              
              {/* Category Buttons - Improved Responsive Layout */}
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
                {categoriesLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-pulse h-8 w-20 bg-gray-200 rounded-full"></div>
                    <div className="animate-pulse h-8 w-24 bg-gray-200 rounded-full"></div>
                    <div className="animate-pulse h-8 w-16 bg-gray-200 rounded-full"></div>
                  </div>
                ) : (
                  <>
                    {/* All Categories Button */}
                    <Button
                      variant={selectedCategoryId === null ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCategoryFilter(null)}
                      className={`
                        text-xs font-medium transition-all duration-200 px-3 py-1.5 h-8
                        ${selectedCategoryId === null 
                          ? 'bg-blue-600 text-white shadow-sm hover:bg-blue-700 border-blue-600 ring-2 ring-blue-200' 
                          : 'bg-white text-gray-600 border-gray-200 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700'
                        }
                      `}
                    >
                      <Tag className="h-3 w-3 mr-1" />
                      <span className="truncate">Tất cả</span>
                    </Button>
                    
                    {/* Individual Category Buttons */}
                    {categories.map((category) => {
                      const isSelected = selectedCategoryId === category.id;
                      return (
                        <Button
                          key={category.id}
                          variant={isSelected ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCategoryFilter(category.id)}
                          className={`
                            text-xs font-medium transition-all duration-200 px-3 py-1.5 h-8 max-w-32
                            ${isSelected 
                              ? 'bg-blue-600 text-white shadow-sm hover:bg-blue-700 border-blue-600 ring-2 ring-blue-200' 
                              : 'bg-white text-gray-600 border-gray-200 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700'
                            }
                          `}
                          title={category.name}
                        >
                          <Filter className="h-3 w-3 mr-1 flex-shrink-0" />
                          <span className="truncate">{category.name}</span>
                        </Button>
                      );
                    })}
                    
                    {categories.length === 0 && (
                      <div className="col-span-2 text-sm text-gray-500 italic text-center py-2">
                        Chưa có danh mục nào
                      </div>
                    )}
                  </>
                )}
              </div>
              
              {/* Active Filter Info - Enhanced */}
              {selectedCategoryId && (
                <div className="flex items-center justify-between text-xs text-blue-700 bg-gradient-to-r from-blue-50 to-blue-100 px-3 py-2 rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-2">
                    <Filter className="h-3 w-3" />
                    <span className="font-medium">
                      Đang lọc: {categories.find(c => c.id === selectedCategoryId)?.name}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCategoryFilter(null)}
                    className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-200 rounded-full transition-colors"
                    title="Xóa bộ lọc"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Optimized Product Grid with Performance Monitoring */}
          <div className="flex-1 p-4 overflow-hidden">
            {productsLoading ? (
              // Skeleton loading states for better perceived performance
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Card key={i} className="h-60 animate-pulse">
                    <CardContent className="p-4">
                      <div className="aspect-square mb-3 bg-gray-200 rounded-lg"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-3 bg-gray-200 rounded w-full"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                        <div className="h-8 bg-gray-200 rounded w-full mt-3"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <>
                {/* Use VirtualizedProductList for large product lists (>20 items) */}
                {filteredProducts.length > 20 ? (
                  <VirtualizedProductList
                    products={filteredProducts}
                    onAddToCart={addToCart}
                    containerHeight={600}
                    itemHeight={240}
                    className="h-full"
                  />
                ) : (
                  /* Use OptimizedProductGrid for smaller lists */
                  <OptimizedProductGrid
                    products={filteredProducts}
                    onAddToCart={addToCart}
                    selectedCategoryId={selectedCategoryId}
                    searchTerm={searchTerm}
                    className="h-full overflow-y-auto"
                    itemsPerRow={4}
                    enableVirtualization={false} // Disable for small lists
                  />
                )}
              </>
            )}

            {!productsLoading && filteredProducts.length === 0 && (
              <div className="flex items-center justify-center h-64">
                <div className="text-center text-gray-500">
                  <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg">Không tìm thấy sản phẩm</p>
                  <p className="text-sm">
                    {searchTerm 
                      ? `Không có sản phẩm nào phù hợp với "${searchTerm}". Thử tìm kiếm với từ khóa khác.`
                      : 'Danh mục này chưa có sản phẩm nào.'
                    }
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Cart & Checkout */}
        <div className="w-80 bg-white border-l flex flex-col">
          {/* Customer Selection */}
          <div className="border-b">
            <div className="p-3">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">Khách hàng</label>
                <div className="flex items-center space-x-2">
                  {selectedCustomer && (
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      {selectedCustomer.name}
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-xs px-2 py-1 bg-green-50 text-green-600 border-green-200">
                    F3
                  </Badge>
                </div>
              </div>
              <CustomerSearchInput
                ref={customerSearchRef}
                onSelect={(customer) => {
                  if (customer) {
                    measureInteraction('customer-select', () => {
                      tabManager.setCustomer({
                        ...customer,
                        totalSpent: customer.totalSpent.toString()
                      });
                    });
                  }
                }}
                className="w-full"
              />
            </div>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto">
            {cart.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-gray-500">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg">Giỏ hàng trống</p>
                  <p className="text-sm">Thêm sản phẩm để bắt đầu</p>
                </div>
              </div>
            ) : (
              <div className="p-4 space-y-3">
{cart.map((item) => {
                  const unitSettings = getProductUnitSettings(item.product);
                  const itemTotal = CartManager.calculateItemTotal(item.product.price, item.quantity);
                  
                  return (
                  <Card key={`cart-item-${item.product.id}`} className="p-2">
                    {/* Row 1: Icon + Product Name */}
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-gray-100 rounded flex-shrink-0 flex items-center justify-center overflow-hidden">
                        {item.product.image || (item.product.images && item.product.images.length > 0) ? (
                          <img
                            src={item.product.image || item.product.images![0].secure_url}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-gray-400 text-sm">📦</div>
                        )}
                      </div>
                      <h4 className="font-medium text-sm line-clamp-1 flex-1 min-w-0">
                        {item.product.name}
                      </h4>
                    </div>

                    {/* Row 2: Simple Quantity + Delete */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <QuantityInput 
                          productId={item.product.id}
                          quantity={item.quantity}
                          allowDecimals={unitSettings.allowDecimals}
                          minQuantity={unitSettings.minQuantity}
                          maxQuantity={item.product.stock || 100}
                          quantityStep={unitSettings.quantityStep}
                          updateQuantity={updateQuantity}
                        />
                        <div className="text-sm font-bold text-gray-700 mt-1">
                          {formatPrice(itemTotal)}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          console.log('🗑️ Remove from cart:', item.product.id);
                          removeFromCart(item.product.id);
                        }}
                        className="px-3 py-1 text-red-600 hover:text-red-700 font-semibold text-sm flex-shrink-0 cursor-pointer rounded hover:bg-red-50 transition-colors"
                        type="button"
                      >
                        XÓA
                      </button>
                    </div>
                  </Card>
                )})}
              </div>
            )}
          </div>

          {/* Cart Summary & Checkout */}
          {cart.length > 0 && (
            <div className="border-t p-4 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-lg">
                  <span>Tổng cộng:</span>
                  <span className="font-bold text-green-600">
                    {formatPrice(roundedCartTotal)}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  {cartItemCount} sản phẩm
                </div>
              </div>

              <Separator />

              {/* Send Invoice to Chat Checkbox */}
              <div className="flex items-center space-x-2 p-2 rounded-md bg-gray-50">
                <input
                  id="send-invoice-checkbox"
                  type="checkbox"
                  checked={sendInvoiceToChat}
                  onChange={(e) => setSendInvoiceToChat(e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label 
                  htmlFor="send-invoice-checkbox" 
                  className="text-sm font-medium text-gray-700 cursor-pointer select-none"
                >
                  Gửi hóa đơn qua chat
                </label>
              </div>

              <div className="space-y-2">
                <Button
                  onClick={handleCheckout}
                  disabled={createOrderMutation.isPending}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg"
                >
                  <CreditCard className="h-5 w-5 mr-2" />
                  {createOrderMutation.isPending ? 'Đang xử lý...' : 'Thanh toán'}
                </Button>

                <Button
                  onClick={() => setShowSplitOrderModal(true)}
                  variant="outline"
                  className="w-full border-blue-200 text-blue-600 hover:bg-blue-50 py-3 text-lg"
                >
                  <Users className="h-5 w-5 mr-2" />
                  Tách đơn hàng (nhiều khách)
                </Button>

                <Button
                  onClick={clearCart}
                  variant="outline"
                  className="w-full"
                >
                  Xóa giỏ hàng
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {showPayment && currentOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Thanh toán đơn hàng</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPayment(false)}
              >
                ✕
              </Button>
            </div>
            
            <QRPayment
              order={currentOrder}
              onPaymentCreated={(payment) => {
                toast({
                  title: "QR thanh toán đã tạo",
                  description: "Vui lòng quét mã QR để thanh toán",
                });
              }}
            />

            <div className="mt-4 space-y-2">
              {/* Print Receipt Button */}
              <Button
                onClick={handlePrintReceipt}
                variant="outline"
                className="w-full border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                <Printer className="h-4 w-4 mr-2" />
                In hóa đơn
              </Button>
              
              <div className="flex space-x-2">
                <Button
                  onClick={handlePaymentComplete}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Hoàn tất thanh toán
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowPayment(false)}
                  className="flex-1"
                >
                  Đóng
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Barcode Scanner Modal */}
      <QRScanner
        isOpen={showBarcodeScanner}
        onClose={closeBarcodeScanner}
        onScan={handleBarcodeScanned}
      />

      {/* Receipt Printer Modal */}
      {(showReceiptPrinter && ((currentOrder && currentOrderItems.length > 0) || lastPrintedOrder)) && (
        <ReceiptPrinter
          order={currentOrder || lastPrintedOrder!.order}
          orderItems={currentOrderItems.length > 0 ? currentOrderItems : lastPrintedOrder!.orderItems}
          shopSettings={defaultShopSettings}
          customer={selectedCustomer || lastPrintedOrder?.customer}
          onPrintSuccess={handleReceiptPrintSuccess}
          onPrintError={handleReceiptPrintError}
          autoPrint={localStorage.getItem('pos-auto-print') === 'true' && !!currentOrder}
          autoClose={true}
        />
      )}

      {/* Split Order Modal */}
      <SplitOrderModal
        isOpen={showSplitOrderModal}
        onClose={() => setShowSplitOrderModal(false)}
        cartItems={cart}
        onSplitComplete={handleSplitOrderComplete}
      />
    </div>
  );
}
