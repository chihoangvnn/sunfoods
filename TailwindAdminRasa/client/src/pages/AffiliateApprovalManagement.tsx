import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Handshake,
  UserCheck,
  UserX,
  Users,
  Clock,
  CheckCircle,
  Ban,
  Power,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AffiliateMember {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  status: "active" | "inactive";
  commissionRate: string | null;
  joinDate: string | null;
  limitsData: any;
}

interface DashboardStats {
  totalAffiliates: number;
  pendingAffiliates: number;
  activeAffiliates: number;
  suspendedAffiliates: number;
}

export default function AffiliateApprovalManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<string>("all");
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedAffiliate, setSelectedAffiliate] = useState<AffiliateMember | null>(null);
  const [commissionRate, setCommissionRate] = useState("10");
  const [rejectReason, setRejectReason] = useState("");

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["affiliate-management", "dashboard"],
    queryFn: async () => {
      const res = await fetch("/api/affiliate-management/dashboard", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch dashboard stats");
      const data = await res.json();
      return data.data;
    },
  });

  const { data: affiliates = [], isLoading: affiliatesLoading } = useQuery<AffiliateMember[]>({
    queryKey: ["affiliate-management", "members", activeTab],
    queryFn: async () => {
      const statusParam = activeTab === "all" ? "" : `?status=${activeTab}`;
      const res = await fetch(`/api/affiliate-management/members${statusParam}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch affiliates");
      const data = await res.json();
      return data.data;
    },
  });

  const approveMutation = useMutation({
    mutationFn: async ({ customerId, rate }: { customerId: string; rate: string }) => {
      const res = await fetch(`/api/affiliate-management/approve/${customerId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ commissionRate: rate }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to approve affiliate");
      }
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["affiliate-management"] });
      toast({
        title: "✅ Duyệt thành công",
        description: data.message || "Affiliate đã được duyệt thành công",
      });
      setApproveDialogOpen(false);
      setSelectedAffiliate(null);
      setCommissionRate("10");
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
      const res = await fetch(`/api/affiliate-management/reject/${customerId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to reject affiliate application");
      }
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["affiliate-management"] });
      toast({
        title: "🚫 Đã từ chối",
        description: data.message || "Đơn affiliate đã bị từ chối",
      });
      setRejectDialogOpen(false);
      setSelectedAffiliate(null);
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
      const res = await fetch(`/api/affiliate-management/toggle-status/${customerId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to toggle affiliate status");
      }
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["affiliate-management"] });
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

  const getStatusBadge = (affiliate: AffiliateMember) => {
    if (affiliate.limitsData?.suspended === true || affiliate.limitsData?.suspended === "true") {
      return <Badge variant="destructive">🔴 Tạm ngưng</Badge>;
    }
    if (affiliate.status === "inactive") {
      return <Badge variant="secondary">🟡 Chờ duyệt</Badge>;
    }
    if (affiliate.status === "active") {
      return <Badge variant="default">🟢 Hoạt động</Badge>;
    }
    return <Badge variant="outline">Không rõ</Badge>;
  };

  if (statsLoading || affiliatesLoading) {
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
            <Handshake className="h-8 w-8 text-green-500" />
            Quản Lý Affiliate
          </h1>
          <p className="text-muted-foreground mt-1">
            Duyệt và quản lý đăng ký affiliate
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng Affiliate</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalAffiliates || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chờ duyệt</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pendingAffiliates || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hoạt động</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeAffiliates || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tạm ngưng</CardTitle>
            <Ban className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.suspendedAffiliates || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách Affiliate</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">Tất cả</TabsTrigger>
              <TabsTrigger value="pending">Chờ duyệt</TabsTrigger>
              <TabsTrigger value="active">Hoạt động</TabsTrigger>
              <TabsTrigger value="suspended">Tạm ngưng</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-4">
              {affiliates.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Không có affiliate nào trong danh sách này.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tên</TableHead>
                        <TableHead>Liên hệ</TableHead>
                        <TableHead>Hoa hồng</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead>Ngày đăng ký</TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {affiliates.map((affiliate) => {
                        const isSuspended = affiliate.limitsData?.suspended === true || affiliate.limitsData?.suspended === "true";
                        const isPending = affiliate.status === "inactive";
                        const isActive = affiliate.status === "active" && !isSuspended;

                        return (
                          <TableRow key={affiliate.id}>
                            <TableCell className="font-medium">{affiliate.name}</TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div>{affiliate.phone}</div>
                                {affiliate.email && (
                                  <div className="text-muted-foreground">{affiliate.email}</div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {affiliate.commissionRate ? `${affiliate.commissionRate}%` : "-"}
                            </TableCell>
                            <TableCell>{getStatusBadge(affiliate)}</TableCell>
                            <TableCell>
                              {affiliate.joinDate
                                ? new Date(affiliate.joinDate).toLocaleDateString("vi-VN")
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
                                        setSelectedAffiliate(affiliate);
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
                                        setSelectedAffiliate(affiliate);
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
                                        customerId: affiliate.id,
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
                                        customerId: affiliate.id,
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
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Duyệt affiliate</DialogTitle>
            <DialogDescription>
              Duyệt đơn đăng ký affiliate cho: <strong>{selectedAffiliate?.name}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="commission">Tỷ lệ hoa hồng (%)</Label>
              <Input
                id="commission"
                type="number"
                min="0"
                max="100"
                value={commissionRate}
                onChange={(e) => setCommissionRate(e.target.value)}
                placeholder="10"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setApproveDialogOpen(false);
                setSelectedAffiliate(null);
                setCommissionRate("10");
              }}
            >
              Hủy
            </Button>
            <Button
              onClick={() => {
                if (selectedAffiliate) {
                  approveMutation.mutate({
                    customerId: selectedAffiliate.id,
                    rate: commissionRate,
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
            <DialogTitle>Từ chối đơn affiliate</DialogTitle>
            <DialogDescription>
              Bạn đang từ chối đơn đăng ký affiliate của: <strong>{selectedAffiliate?.name}</strong>
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
                setSelectedAffiliate(null);
                setRejectReason("");
              }}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (selectedAffiliate) {
                  rejectMutation.mutate({
                    customerId: selectedAffiliate.id,
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
    </div>
  );
}
