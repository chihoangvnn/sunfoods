import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Crown,
  UserCheck,
  UserX,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Ban,
  Power,
  AlertCircle,
  Edit,
  Package,
  QrCode,
  Plus,
  Copy,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VIPMember {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  status: "active" | "inactive";
  membershipTier: string | null;
  joinDate: string | null;
  limitsData: any;
}

interface DashboardStats {
  totalVIPs: number;
  pendingVIPs: number;
  activeVIPs: number;
  suspendedVIPs: number;
}

interface VIPProduct {
  id: string;
  name: string;
  sku: string;
  price: string;
  requiredVipTier: string | null;
  isVipOnly: boolean;
  status: "active" | "inactive" | "out-of-stock";
}

interface QRToken {
  id: string;
  token: string;
  tier: string;
  maxUses: number;
  usedCount: number;
  validityDays: number;
  expiresAt: string;
  notes: string | null;
  createdAt: string;
  isActive: boolean;
}

interface Category {
  id: string;
  name: string;
  description: string | null;
}

export default function VIPManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<string>("all");
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<VIPMember | null>(null);
  const [selectedTier, setSelectedTier] = useState<string>("silver");
  const [rejectReason, setRejectReason] = useState("");
  
  const [editProductDialogOpen, setEditProductDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<VIPProduct | null>(null);
  const [editIsVipOnly, setEditIsVipOnly] = useState(false);
  const [editRequiredTier, setEditRequiredTier] = useState<string | null>(null);

  const [createQRDialogOpen, setCreateQRDialogOpen] = useState(false);
  const [qrTier, setQrTier] = useState<string>("silver");
  const [qrMaxUses, setQrMaxUses] = useState<string>("10");
  const [qrValidityDays, setQrValidityDays] = useState<string>("30");
  const [qrNotes, setQrNotes] = useState<string>("");
  
  const [qrSuccessDialogOpen, setQrSuccessDialogOpen] = useState(false);
  const [generatedQRData, setGeneratedQRData] = useState<{
    qrCodeImage: string;
    registrationUrl: string;
    token: string;
  } | null>(null);

  const [assignProductDialogOpen, setAssignProductDialogOpen] = useState(false);
  const [assignProductTab, setAssignProductTab] = useState<string>("single");
  const [bulkCategoryId, setBulkCategoryId] = useState<string>("");
  const [bulkIsVipOnly, setBulkIsVipOnly] = useState(false);
  const [bulkRequiredTier, setBulkRequiredTier] = useState<string | null>(null);

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["vip-management", "dashboard"],
    queryFn: async () => {
      const res = await fetch("/api/vip-management/dashboard", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch dashboard stats");
      const data = await res.json();
      return data.data;
    },
  });

  const { data: members = [], isLoading: membersLoading } = useQuery<VIPMember[]>({
    queryKey: ["vip-management", "members", activeTab],
    queryFn: async () => {
      const statusParam = activeTab === "all" ? "" : `?status=${activeTab}`;
      const res = await fetch(`/api/vip-management/members${statusParam}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch VIP members");
      const data = await res.json();
      return data.data;
    },
  });

  const { data: vipProducts = [], isLoading: productsLoading } = useQuery<VIPProduct[]>({
    queryKey: ["vip-management", "vip-products"],
    queryFn: async () => {
      const res = await fetch("/api/vip-management/vip-products", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch VIP products");
      const data = await res.json();
      return data.data;
    },
    enabled: activeTab === "vip-products",
  });

  const { data: qrTokens = [], isLoading: tokensLoading } = useQuery<QRToken[]>({
    queryKey: ["vip-registration", "tokens"],
    queryFn: async () => {
      const res = await fetch("/api/vip-registration/tokens", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch QR tokens");
      const data = await res.json();
      if (!data.success && data.data) {
        return data.data;
      }
      return Array.isArray(data.data) ? data.data : [];
    },
    enabled: activeTab === "qr-codes",
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await fetch("/api/categories", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch categories");
      const data = await res.json();
      return data;
    },
    enabled: assignProductDialogOpen && assignProductTab === "bulk",
  });

  const approveMutation = useMutation({
    mutationFn: async ({ customerId, tier }: { customerId: string; tier: string }) => {
      const res = await fetch(`/api/vip-management/approve/${customerId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ membershipTier: tier }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to approve VIP");
      }
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["vip-management"] });
      toast({
        title: "✅ Duyệt thành công",
        description: data.message || "VIP đã được duyệt thành công",
      });
      setApproveDialogOpen(false);
      setSelectedMember(null);
    },
    onError: (error: Error) => {
      toast({
        title: "❌ Lỗi",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ customerId, reason }: { customerId: string; reason: string }) => {
      const res = await fetch(`/api/vip-management/reject/${customerId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to reject VIP application");
      }
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["vip-management"] });
      toast({
        title: "🚫 Đã từ chối",
        description: data.message || "Đơn VIP đã bị từ chối",
      });
      setRejectDialogOpen(false);
      setSelectedMember(null);
      setRejectReason("");
    },
    onError: (error: Error) => {
      toast({
        title: "❌ Lỗi",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ customerId, status }: { customerId: string; status: "active" | "suspended" }) => {
      const res = await fetch(`/api/vip-management/toggle-status/${customerId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to toggle VIP status");
      }
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["vip-management"] });
      toast({
        title: "✅ Cập nhật thành công",
        description: data.message,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "❌ Lỗi",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateProductVIPMutation = useMutation({
    mutationFn: async ({ productId, isVipOnly, requiredVipTier }: { 
      productId: string; 
      isVipOnly: boolean; 
      requiredVipTier: string | null 
    }) => {
      const res = await fetch(`/api/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ isVipOnly, requiredVipTier }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update product VIP settings");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vip-management", "vip-products"] });
      toast({
        title: "✅ Cập nhật thành công",
        description: "Cài đặt VIP đã được cập nhật",
      });
      setEditProductDialogOpen(false);
      setSelectedProduct(null);
    },
    onError: (error: Error) => {
      toast({
        title: "❌ Lỗi",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const generateQRMutation = useMutation({
    mutationFn: async ({ tier, maxUses, validityDays, notes }: { 
      tier: string; 
      maxUses: number; 
      validityDays: number; 
      notes: string 
    }) => {
      const res = await fetch("/api/vip-registration/generate-qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ tier, maxUses, validityDays, notes }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to generate QR code");
      }
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["vip-registration", "tokens"] });
      setGeneratedQRData({
        qrCodeImage: data.qrCodeImage,
        registrationUrl: data.registrationUrl,
        token: data.token,
      });
      setCreateQRDialogOpen(false);
      setQrSuccessDialogOpen(true);
      toast({
        title: "✅ Tạo QR Code thành công",
        description: "QR Code VIP đã được tạo",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "❌ Lỗi",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const bulkAssignCategoryMutation = useMutation({
    mutationFn: async ({ categoryId, isVipOnly, requiredVipTier }: {
      categoryId: string;
      isVipOnly: boolean;
      requiredVipTier: string | null;
    }) => {
      const res = await fetch("/api/vip-management/bulk-assign-category", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ categoryId, isVipOnly, requiredVipTier }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to bulk assign category");
      }
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["vip-management", "vip-products"] });
      toast({
        title: "✅ Cập nhật thành công",
        description: `Đã cập nhật ${data.updatedCount || 0} sản phẩm`,
      });
      setAssignProductDialogOpen(false);
      setBulkCategoryId("");
      setBulkIsVipOnly(false);
      setBulkRequiredTier(null);
    },
    onError: (error: Error) => {
      toast({
        title: "❌ Lỗi",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (member: VIPMember) => {
    if (member.limitsData?.suspended === true || member.limitsData?.suspended === "true") {
      return <Badge variant="destructive">🔴 Tạm ngưng</Badge>;
    }
    if (member.status === "inactive") {
      return <Badge variant="secondary">🟡 Chờ duyệt</Badge>;
    }
    if (member.status === "active") {
      return <Badge variant="default">🟢 Hoạt động</Badge>;
    }
    return <Badge variant="outline">Không rõ</Badge>;
  };

  const getTierBadge = (tier: string | null) => {
    const tierMap: Record<string, { label: string; variant: any }> = {
      silver: { label: "🥈 Bạc", variant: "secondary" },
      gold: { label: "🥇 Vàng", variant: "default" },
      platinum: { label: "💎 Bạch Kim", variant: "default" },
      diamond: { label: "💠 Kim Cương", variant: "default" },
    };
    const config = tierMap[tier || ""] || { label: tier || "Chưa có", variant: "outline" };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getProductTierBadge = (tier: string | null) => {
    if (!tier) {
      return <Badge variant="outline">Tất cả VIP</Badge>;
    }
    const tierMap: Record<string, { label: string; variant: any }> = {
      silver: { label: "🥈 Bạc", variant: "secondary" },
      gold: { label: "🥇 Vàng", variant: "default" },
      platinum: { label: "💎 Bạch Kim", variant: "default" },
      diamond: { label: "💠 Kim Cương", variant: "default" },
    };
    const config = tierMap[tier] || { label: tier, variant: "outline" };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getProductStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: any }> = {
      active: { label: "Hoạt động", variant: "default" },
      inactive: { label: "Không hoạt động", variant: "secondary" },
      "out-of-stock": { label: "Hết hàng", variant: "destructive" },
    };
    const config = statusMap[status] || { label: status, variant: "outline" };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getQRStatusBadge = (token: QRToken) => {
    const now = new Date();
    const expiresAt = new Date(token.expiresAt);
    const isExpired = now > expiresAt;
    
    if (isExpired) {
      return <Badge variant="destructive">Hết hạn</Badge>;
    }
    if (!token.isActive) {
      return <Badge variant="secondary">Không hoạt động</Badge>;
    }
    return <Badge variant="default">Hoạt động</Badge>;
  };

  const truncateToken = (token: string) => {
    if (token.length <= 12) return token;
    return `${token.substring(0, 8)}...${token.substring(token.length - 4)}`;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "✅ Đã sao chép",
        description: "Link đã được sao chép vào clipboard",
      });
    } catch (err) {
      toast({
        title: "❌ Lỗi",
        description: "Không thể sao chép link",
        variant: "destructive",
      });
    }
  };

  if (statsLoading || membersLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Crown className="h-8 w-8 text-yellow-500" />
            Quản Lý VIP
          </h1>
          <p className="text-muted-foreground mt-1">
            Duyệt và quản lý thành viên VIP
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng VIP</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalVIPs || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chờ duyệt</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pendingVIPs || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hoạt động</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeVIPs || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tạm ngưng</CardTitle>
            <Ban className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.suspendedVIPs || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách VIP</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="all">Tất cả</TabsTrigger>
              <TabsTrigger value="pending">Chờ duyệt</TabsTrigger>
              <TabsTrigger value="active">Hoạt động</TabsTrigger>
              <TabsTrigger value="suspended">Tạm ngưng</TabsTrigger>
              <TabsTrigger value="vip-products">Sản phẩm VIP</TabsTrigger>
              <TabsTrigger value="qr-codes">Mã QR</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-4" style={{ display: activeTab === "vip-products" || activeTab === "qr-codes" ? "none" : "block" }}>
              {members.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Không có thành viên VIP nào trong danh sách này.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tên</TableHead>
                        <TableHead>Liên hệ</TableHead>
                        <TableHead>Hạng</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead>Ngày đăng ký</TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {members.map((member) => {
                        const isSuspended = member.limitsData?.suspended === true || member.limitsData?.suspended === "true";
                        const isPending = member.status === "inactive";
                        const isActive = member.status === "active" && !isSuspended;

                        return (
                          <TableRow key={member.id}>
                            <TableCell className="font-medium">{member.name}</TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div>{member.phone}</div>
                                {member.email && (
                                  <div className="text-muted-foreground">{member.email}</div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{getTierBadge(member.membershipTier)}</TableCell>
                            <TableCell>{getStatusBadge(member)}</TableCell>
                            <TableCell>
                              {member.joinDate
                                ? new Date(member.joinDate).toLocaleDateString("vi-VN")
                                : "-"}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                {isPending && (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="default"
                                      onClick={() => {
                                        setSelectedMember(member);
                                        setApproveDialogOpen(true);
                                      }}
                                    >
                                      <UserCheck className="h-4 w-4 mr-1" />
                                      Duyệt
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => {
                                        setSelectedMember(member);
                                        setRejectDialogOpen(true);
                                      }}
                                    >
                                      <UserX className="h-4 w-4 mr-1" />
                                      Từ chối
                                    </Button>
                                  </>
                                )}
                                {isActive && (
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() =>
                                      toggleStatusMutation.mutate({
                                        customerId: member.id,
                                        status: "suspended",
                                      })
                                    }
                                  >
                                    <Ban className="h-4 w-4 mr-1" />
                                    Tạm ngưng
                                  </Button>
                                )}
                                {isSuspended && (
                                  <Button
                                    size="sm"
                                    variant="default"
                                    onClick={() =>
                                      toggleStatusMutation.mutate({
                                        customerId: member.id,
                                        status: "active",
                                      })
                                    }
                                  >
                                    <Power className="h-4 w-4 mr-1" />
                                    Kích hoạt
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            <TabsContent value="vip-products" className="mt-4">
              <div className="flex justify-end mb-4">
                <Button
                  onClick={() => {
                    setAssignProductTab("single");
                    setAssignProductDialogOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Gán sản phẩm VIP
                </Button>
              </div>
              
              {productsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : vipProducts.length === 0 ? (
                <Alert>
                  <Package className="h-4 w-4" />
                  <AlertDescription>
                    Chưa có sản phẩm VIP nào.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tên sản phẩm</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead>Giá</TableHead>
                        <TableHead>Hạng VIP yêu cầu</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {vipProducts.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>{product.sku || "-"}</TableCell>
                          <TableCell>{Number(product.price).toLocaleString("vi-VN")} đ</TableCell>
                          <TableCell>{getProductTierBadge(product.requiredVipTier)}</TableCell>
                          <TableCell>{getProductStatusBadge(product.status)}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedProduct(product);
                                setEditIsVipOnly(product.isVipOnly);
                                setEditRequiredTier(product.requiredVipTier);
                                setEditProductDialogOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Sửa cài đặt VIP
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            <TabsContent value="qr-codes" className="mt-4">
              <div className="flex justify-end mb-4">
                <Button
                  onClick={() => {
                    setQrTier("silver");
                    setQrMaxUses("10");
                    setQrValidityDays("30");
                    setQrNotes("");
                    setCreateQRDialogOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Tạo QR Code VIP
                </Button>
              </div>
              
              {tokensLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : qrTokens.length === 0 ? (
                <Alert>
                  <QrCode className="h-4 w-4" />
                  <AlertDescription>
                    Chưa có mã QR nào được tạo.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Token</TableHead>
                        <TableHead>Hạng VIP</TableHead>
                        <TableHead>Ngày tạo</TableHead>
                        <TableHead>Hết hạn</TableHead>
                        <TableHead>Đã dùng/Tối đa</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead>Ghi chú</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {qrTokens.map((token) => (
                        <TableRow key={token.id}>
                          <TableCell className="font-mono text-sm">
                            {truncateToken(token.token)}
                          </TableCell>
                          <TableCell>{getTierBadge(token.tier)}</TableCell>
                          <TableCell>
                            {new Date(token.createdAt).toLocaleDateString("vi-VN")}
                          </TableCell>
                          <TableCell>
                            {new Date(token.expiresAt).toLocaleDateString("vi-VN")}
                          </TableCell>
                          <TableCell>
                            {token.usedCount}/{token.maxUses}
                          </TableCell>
                          <TableCell>{getQRStatusBadge(token)}</TableCell>
                          <TableCell className="max-w-xs truncate">
                            {token.notes || "-"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Duyệt thành viên VIP</DialogTitle>
            <DialogDescription>
              Chọn hạng VIP cho thành viên: <strong>{selectedMember?.name}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="tier">Hạng VIP</Label>
              <Select value={selectedTier} onValueChange={setSelectedTier}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn hạng" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="silver">🥈 Bạc</SelectItem>
                  <SelectItem value="gold">🥇 Vàng</SelectItem>
                  <SelectItem value="platinum">💎 Bạch Kim</SelectItem>
                  <SelectItem value="diamond">💠 Kim Cương</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setApproveDialogOpen(false);
                setSelectedMember(null);
              }}
            >
              Hủy
            </Button>
            <Button
              onClick={() => {
                if (selectedMember) {
                  approveMutation.mutate({
                    customerId: selectedMember.id,
                    tier: selectedTier,
                  });
                }
              }}
              disabled={approveMutation.isPending}
            >
              {approveMutation.isPending ? "Đang duyệt..." : "Duyệt"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Từ chối đơn VIP</DialogTitle>
            <DialogDescription>
              Bạn đang từ chối đơn VIP của: <strong>{selectedMember?.name}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Lý do từ chối</Label>
              <Textarea
                id="reason"
                placeholder="Nhập lý do từ chối..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRejectDialogOpen(false);
                setSelectedMember(null);
                setRejectReason("");
              }}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (selectedMember) {
                  rejectMutation.mutate({
                    customerId: selectedMember.id,
                    reason: rejectReason,
                  });
                }
              }}
              disabled={rejectMutation.isPending || !rejectReason.trim()}
            >
              {rejectMutation.isPending ? "Đang từ chối..." : "Từ chối"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editProductDialogOpen} onOpenChange={setEditProductDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sửa cài đặt VIP</DialogTitle>
            <DialogDescription>
              Chỉnh sửa cài đặt VIP cho sản phẩm: <strong>{selectedProduct?.name}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="isVipOnly" className="flex-1">
                Sản phẩm VIP độc quyền
              </Label>
              <Switch
                id="isVipOnly"
                checked={editIsVipOnly}
                onCheckedChange={setEditIsVipOnly}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="requiredTier">Hạng VIP yêu cầu</Label>
              <Select 
                value={editRequiredTier || "null"} 
                onValueChange={(value) => setEditRequiredTier(value === "null" ? null : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn hạng VIP" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="null">Tất cả VIP</SelectItem>
                  <SelectItem value="silver">🥈 Bạc</SelectItem>
                  <SelectItem value="gold">🥇 Vàng</SelectItem>
                  <SelectItem value="platinum">💎 Bạch Kim</SelectItem>
                  <SelectItem value="diamond">💠 Kim Cương</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                {editRequiredTier ? 
                  `Chỉ VIP ${editRequiredTier} trở lên mới được mua` : 
                  "Tất cả VIP đều được mua"
                }
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditProductDialogOpen(false);
                setSelectedProduct(null);
              }}
            >
              Hủy
            </Button>
            <Button
              onClick={() => {
                if (selectedProduct) {
                  updateProductVIPMutation.mutate({
                    productId: selectedProduct.id,
                    isVipOnly: editIsVipOnly,
                    requiredVipTier: editRequiredTier,
                  });
                }
              }}
              disabled={updateProductVIPMutation.isPending}
            >
              {updateProductVIPMutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={createQRDialogOpen} onOpenChange={setCreateQRDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tạo QR Code VIP</DialogTitle>
            <DialogDescription>
              Tạo mã QR để đăng ký VIP cho khách hàng
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="qr-tier">Hạng VIP</Label>
              <Select value={qrTier} onValueChange={setQrTier}>
                <SelectTrigger id="qr-tier">
                  <SelectValue placeholder="Chọn hạng VIP" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="silver">🥈 Bạc</SelectItem>
                  <SelectItem value="gold">🥇 Vàng</SelectItem>
                  <SelectItem value="platinum">💎 Bạch Kim</SelectItem>
                  <SelectItem value="diamond">💠 Kim Cương</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="qr-max-uses">Số lần sử dụng tối đa</Label>
              <Input
                id="qr-max-uses"
                type="number"
                min="1"
                value={qrMaxUses}
                onChange={(e) => setQrMaxUses(e.target.value)}
                placeholder="10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="qr-validity">Thời hạn (ngày)</Label>
              <Input
                id="qr-validity"
                type="number"
                min="1"
                value={qrValidityDays}
                onChange={(e) => setQrValidityDays(e.target.value)}
                placeholder="30"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="qr-notes">Ghi chú</Label>
              <Textarea
                id="qr-notes"
                value={qrNotes}
                onChange={(e) => setQrNotes(e.target.value)}
                placeholder="Nhập ghi chú cho mã QR này..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCreateQRDialogOpen(false);
              }}
            >
              Hủy
            </Button>
            <Button
              onClick={() => {
                const maxUses = parseInt(qrMaxUses);
                const validityDays = parseInt(qrValidityDays);
                
                if (isNaN(maxUses) || maxUses < 1) {
                  toast({
                    title: "❌ Lỗi",
                    description: "Số lần sử dụng phải lớn hơn 0",
                    variant: "destructive",
                  });
                  return;
                }
                
                if (isNaN(validityDays) || validityDays < 1) {
                  toast({
                    title: "❌ Lỗi",
                    description: "Thời hạn phải lớn hơn 0",
                    variant: "destructive",
                  });
                  return;
                }
                
                generateQRMutation.mutate({
                  tier: qrTier,
                  maxUses,
                  validityDays,
                  notes: qrNotes,
                });
              }}
              disabled={generateQRMutation.isPending}
            >
              {generateQRMutation.isPending ? "Đang tạo..." : "Tạo QR Code"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={qrSuccessDialogOpen} onOpenChange={setQrSuccessDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>✅ QR Code đã được tạo thành công</DialogTitle>
            <DialogDescription>
              Sử dụng QR code hoặc link đăng ký bên dưới
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {generatedQRData && (
              <>
                <div className="flex justify-center">
                  <img 
                    src={generatedQRData.qrCodeImage} 
                    alt="QR Code" 
                    className="w-64 h-64 border rounded-lg"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Link đăng ký VIP</Label>
                  <div className="flex gap-2">
                    <Input
                      value={generatedQRData.registrationUrl}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(generatedQRData.registrationUrl)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Token</Label>
                  <div className="flex gap-2">
                    <Input
                      value={generatedQRData.token}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(generatedQRData.token)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                setQrSuccessDialogOpen(false);
                setGeneratedQRData(null);
              }}
            >
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={assignProductDialogOpen} onOpenChange={setAssignProductDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Gán sản phẩm VIP</DialogTitle>
            <DialogDescription>
              Chọn cách gán sản phẩm VIP
            </DialogDescription>
          </DialogHeader>
          
          <Tabs value={assignProductTab} onValueChange={setAssignProductTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="single">Gán đơn lẻ</TabsTrigger>
              <TabsTrigger value="bulk">Gán hàng loạt theo catalog</TabsTrigger>
            </TabsList>

            <TabsContent value="single" className="space-y-4 mt-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Để gán sản phẩm đơn lẻ, vui lòng sử dụng nút "Sửa cài đặt VIP" bên cạnh mỗi sản phẩm trong danh sách.
                </AlertDescription>
              </Alert>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAssignProductDialogOpen(false)}>
                  Đóng
                </Button>
              </DialogFooter>
            </TabsContent>

            <TabsContent value="bulk" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Chọn danh mục</Label>
                  <Select value={bulkCategoryId} onValueChange={setBulkCategoryId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn danh mục" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="bulk-vip-only"
                    checked={bulkIsVipOnly}
                    onCheckedChange={setBulkIsVipOnly}
                  />
                  <Label htmlFor="bulk-vip-only" className="cursor-pointer">
                    Chỉ VIP mới xem được
                  </Label>
                </div>

                <div className="space-y-2">
                  <Label>Hạng VIP yêu cầu (tùy chọn)</Label>
                  <Select 
                    value={bulkRequiredTier || "all"} 
                    onValueChange={(value) => setBulkRequiredTier(value === "all" ? null : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tất cả VIP có thể xem" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả VIP có thể xem</SelectItem>
                      <SelectItem value="silver">🥈 Bạc trở lên</SelectItem>
                      <SelectItem value="gold">🥇 Vàng trở lên</SelectItem>
                      <SelectItem value="platinum">💎 Bạch Kim trở lên</SelectItem>
                      <SelectItem value="diamond">💠 Kim Cương</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {bulkCategoryId && (
                  <Alert>
                    <Package className="h-4 w-4" />
                    <AlertDescription>
                      Tất cả sản phẩm trong danh mục <strong>{categories.find(c => c.id === bulkCategoryId)?.name}</strong> sẽ được cập nhật
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setAssignProductDialogOpen(false);
                    setBulkCategoryId("");
                    setBulkIsVipOnly(false);
                    setBulkRequiredTier(null);
                  }}
                >
                  Hủy
                </Button>
                <Button
                  onClick={() => {
                    if (bulkCategoryId) {
                      bulkAssignCategoryMutation.mutate({
                        categoryId: bulkCategoryId,
                        isVipOnly: bulkIsVipOnly,
                        requiredVipTier: bulkRequiredTier,
                      });
                    }
                  }}
                  disabled={!bulkCategoryId || bulkAssignCategoryMutation.isPending}
                >
                  {bulkAssignCategoryMutation.isPending ? "Đang xử lý..." : "Cập nhật"}
                </Button>
              </DialogFooter>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}
