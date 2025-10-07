import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  Truck,
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

interface DriverMember {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  status: "active" | "inactive";
  joinDate: string | null;
  limitsData: any;
}

interface DashboardStats {
  totalDrivers: number;
  pendingDrivers: number;
  activeDrivers: number;
  suspendedDrivers: number;
}

export default function DriverApprovalManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<string>("all");
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<DriverMember | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["driver-management", "dashboard"],
    queryFn: async () => {
      const res = await fetch("/api/driver-management/dashboard", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch dashboard stats");
      const data = await res.json();
      return data.data;
    },
  });

  const { data: drivers = [], isLoading: driversLoading } = useQuery<DriverMember[]>({
    queryKey: ["driver-management", "members", activeTab],
    queryFn: async () => {
      const statusParam = activeTab === "all" ? "" : `?status=${activeTab}`;
      const res = await fetch(`/api/driver-management/members${statusParam}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch drivers");
      const data = await res.json();
      return data.data;
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (customerId: string) => {
      const res = await fetch(`/api/driver-management/approve/${customerId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to approve driver");
      }
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["driver-management"] });
      toast({
        title: "✅ Duyệt thành công",
        description: data.message || "Tài xế đã được duyệt thành công",
      });
      setApproveDialogOpen(false);
      setSelectedDriver(null);
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
      const res = await fetch(`/api/driver-management/reject/${customerId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to reject driver application");
      }
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["driver-management"] });
      toast({
        title: "🚫 Đã từ chối",
        description: data.message || "Đơn tài xế đã bị từ chối",
      });
      setRejectDialogOpen(false);
      setSelectedDriver(null);
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
      const res = await fetch(`/api/driver-management/toggle-status/${customerId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to toggle driver status");
      }
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["driver-management"] });
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

  const getStatusBadge = (driver: DriverMember) => {
    if (driver.limitsData?.suspended === true || driver.limitsData?.suspended === "true") {
      return <Badge variant="destructive">🔴 Tạm ngưng</Badge>;
    }
    if (driver.status === "inactive") {
      return <Badge variant="secondary">🟡 Chờ duyệt</Badge>;
    }
    if (driver.status === "active") {
      return <Badge variant="default">🟢 Hoạt động</Badge>;
    }
    return <Badge variant="outline">Không rõ</Badge>;
  };

  if (statsLoading || driversLoading) {
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
            <Truck className="h-8 w-8 text-blue-500" />
            Quản Lý Tài Xế
          </h1>
          <p className="text-muted-foreground mt-1">
            Duyệt và quản lý đăng ký tài xế
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng tài xế</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalDrivers || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chờ duyệt</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pendingDrivers || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hoạt động</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeDrivers || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tạm ngưng</CardTitle>
            <Ban className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.suspendedDrivers || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách tài xế</CardTitle>
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
              {drivers.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Không có tài xế nào trong danh sách này.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tên</TableHead>
                        <TableHead>Liên hệ</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead>Ngày đăng ký</TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {drivers.map((driver) => {
                        const isSuspended = driver.limitsData?.suspended === true || driver.limitsData?.suspended === "true";
                        const isPending = driver.status === "inactive";
                        const isActive = driver.status === "active" && !isSuspended;

                        return (
                          <TableRow key={driver.id}>
                            <TableCell className="font-medium">{driver.name}</TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div>{driver.phone}</div>
                                {driver.email && (
                                  <div className="text-muted-foreground">{driver.email}</div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{getStatusBadge(driver)}</TableCell>
                            <TableCell>
                              {driver.joinDate
                                ? new Date(driver.joinDate).toLocaleDateString("vi-VN")
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
                                        setSelectedDriver(driver);
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
                                        setSelectedDriver(driver);
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
                                        customerId: driver.id,
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
                                        customerId: driver.id,
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
            <DialogTitle>Duyệt tài xế</DialogTitle>
            <DialogDescription>
              Bạn đang duyệt đơn đăng ký tài xế của: <strong>{selectedDriver?.name}</strong>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setApproveDialogOpen(false);
                setSelectedDriver(null);
              }}
            >
              Hủy
            </Button>
            <Button
              onClick={() => {
                if (selectedDriver) {
                  approveMutation.mutate(selectedDriver.id);
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
            <DialogTitle>Từ chối đơn tài xế</DialogTitle>
            <DialogDescription>
              Bạn đang từ chối đơn đăng ký tài xế của: <strong>{selectedDriver?.name}</strong>
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
                setSelectedDriver(null);
                setRejectReason("");
              }}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (selectedDriver) {
                  rejectMutation.mutate({
                    customerId: selectedDriver.id,
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
