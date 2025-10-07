import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import {
  Truck,
  Package,
  Settings,
  Phone,
  Mail,
  MapPin,
  Globe,
  Plus,
  Edit,
  Trash2,
  Star,
  Key,
  Webhook,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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

interface ViettelPostConfig {
  id: string;
  configName: string;
  username: string;
  groupAddressId?: number;
  defaultSenderInfo: {
    fullName: string;
    address: string;
    phone: string;
    email?: string;
    wardId: number;
    districtId: number;
    provinceId: number;
  };
  defaultServiceCode: string;
  autoCreateOrder: boolean;
  autoUpdateStatus: boolean;
  webhookUrl?: string;
  isActive: boolean;
  isDefault: boolean;
  lastTokenRefresh?: string;
  apiCallCount?: number;
  errorCount?: number;
  lastError?: string;
  createdAt: string;
  updatedAt: string;
  passwordSet?: boolean;
  webhookSecretSet?: boolean;
}

const vtpConfigSchema = z.object({
  configName: z.string().min(1, "Tên cấu hình là bắt buộc"),
  username: z.string().min(1, "Username ViettelPost là bắt buộc"),
  password: z.string().optional(),
  groupAddressId: z.number().optional(),
  defaultSenderInfo: z.object({
    fullName: z.string().min(1, "Tên người gửi là bắt buộc"),
    address: z.string().min(1, "Địa chỉ người gửi là bắt buộc"),
    phone: z.string().min(1, "Số điện thoại là bắt buộc"),
    email: z.string().email("Email không hợp lệ").optional().or(z.literal("")),
    wardId: z.number().min(1, "Phường/xã là bắt buộc"),
    districtId: z.number().min(1, "Quận/huyện là bắt buộc"),
    provinceId: z.number().min(1, "Tỉnh/thành phố là bắt buộc"),
  }),
  defaultServiceCode: z.string().default("VCN"),
  autoCreateOrder: z.boolean().default(false),
  autoUpdateStatus: z.boolean().default(true),
  webhookUrl: z.string().url("Webhook URL không hợp lệ").optional().or(z.literal("")),
  isDefault: z.boolean().default(false),
});

type VTPConfigForm = z.infer<typeof vtpConfigSchema>;

const serviceOptions = [
  { value: "VCN", label: "Viettel Chuyển phát nhanh" },
  { value: "VNM", label: "Viettel Chuyển phát tiết kiệm" },
  { value: "VTK", label: "Viettel Chuyển phát tiêu chuẩn" },
];

export default function ViettelPostSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<ViettelPostConfig | null>(null);
  const [deleteConfig, setDeleteConfig] = useState<ViettelPostConfig | null>(null);
  const [testingConnection, setTestingConnection] = useState<string | null>(null);

  // Fetch ViettelPost configs
  const { data: configs = [], isLoading } = useQuery<ViettelPostConfig[]>({
    queryKey: ['/api/viettelpost/configs'],
  });

  // Create/Update config mutation
  const configMutation = useMutation({
    mutationFn: async (data: VTPConfigForm & { id?: string }) => {
      if (data.id) {
        return await apiRequest('PUT', `/api/viettelpost/configs/${data.id}`, data);
      } else {
        return await apiRequest('POST', '/api/viettelpost/configs', data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/viettelpost/configs'] });
      setIsDialogOpen(false);
      setEditingConfig(null);
      form.reset();
      toast({
        title: "Thành công",
        description: editingConfig ? "Đã cập nhật cấu hình ViettelPost!" : "Đã tạo cấu hình ViettelPost mới!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.details || error.message || "Có lỗi xảy ra khi lưu cấu hình",
        variant: "destructive",
      });
    },
  });

  // Delete config mutation
  const deleteMutation = useMutation({
    mutationFn: async (configId: string) => {
      return await apiRequest('DELETE', `/api/viettelpost/configs/${configId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/viettelpost/configs'] });
      setDeleteConfig(null);
      toast({
        title: "Thành công",
        description: "Đã xóa cấu hình ViettelPost!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Có lỗi xảy ra khi xóa cấu hình",
        variant: "destructive",
      });
    },
  });

  // Test connection mutation
  const testConnectionMutation = useMutation({
    mutationFn: async (configId: string) => {
      return await apiRequest('POST', `/api/viettelpost/test-connection/${configId}`);
    },
    onSuccess: () => {
      setTestingConnection(null);
      toast({
        title: "Kết nối thành công",
        description: "Kết nối đến ViettelPost API thành công!",
      });
    },
    onError: (error: any) => {
      setTestingConnection(null);
      toast({
        title: "Kết nối thất bại",
        description: error.details || error.message || "Không thể kết nối đến ViettelPost API",
        variant: "destructive",
      });
    },
  });

  const form = useForm<VTPConfigForm>({
    resolver: zodResolver(vtpConfigSchema),
    defaultValues: {
      configName: "",
      username: "",
      password: "",
      groupAddressId: undefined,
      defaultSenderInfo: {
        fullName: "",
        address: "",
        phone: "",
        email: "",
        wardId: 1,
        districtId: 1,
        provinceId: 1,
      },
      defaultServiceCode: "VCN",
      autoCreateOrder: false,
      autoUpdateStatus: true,
      webhookUrl: "",
      isDefault: false,
    },
  });

  // Reset form when editing config changes
  useEffect(() => {
    if (editingConfig) {
      form.reset({
        configName: editingConfig.configName,
        username: editingConfig.username,
        password: "", // Don't populate password for security
        groupAddressId: editingConfig.groupAddressId,
        defaultSenderInfo: editingConfig.defaultSenderInfo,
        defaultServiceCode: editingConfig.defaultServiceCode,
        autoCreateOrder: editingConfig.autoCreateOrder,
        autoUpdateStatus: editingConfig.autoUpdateStatus,
        webhookUrl: editingConfig.webhookUrl || "",
        isDefault: editingConfig.isDefault,
      });
    }
  }, [editingConfig, form]);

  const onSubmit = (data: VTPConfigForm) => {
    configMutation.mutate({
      ...data,
      id: editingConfig?.id,
    });
  };

  const handleEdit = (config: ViettelPostConfig) => {
    setEditingConfig(config);
    setIsDialogOpen(true);
  };

  const handleNew = () => {
    setEditingConfig(null);
    form.reset();
    setIsDialogOpen(true);
  };

  const handleDelete = (config: ViettelPostConfig) => {
    setDeleteConfig(config);
  };

  const confirmDelete = () => {
    if (deleteConfig) {
      deleteMutation.mutate(deleteConfig.id);
    }
  };

  const handleTestConnection = (configId: string) => {
    setTestingConnection(configId);
    testConnectionMutation.mutate(configId);
  };

  const getStatusBadge = (config: ViettelPostConfig) => {
    if (!config.isActive) {
      return <Badge variant="secondary"><XCircle className="w-3 h-3 mr-1" />Không hoạt động</Badge>;
    }
    
    if (config.errorCount && config.errorCount > 0) {
      return <Badge variant="destructive"><AlertTriangle className="w-3 h-3 mr-1" />Có lỗi</Badge>;
    }

    if (config.lastTokenRefresh) {
      return <Badge variant="default"><CheckCircle className="w-3 h-3 mr-1" />Hoạt động</Badge>;
    }

    return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />Chưa test</Badge>;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center space-x-4 mb-6">
          <Truck className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Cấu hình ViettelPost</h1>
        </div>
        <div className="text-center py-8">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Truck className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Cấu hình ViettelPost</h1>
        </div>
        <Button onClick={handleNew} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Thêm cấu hình</span>
        </Button>
      </div>

      {/* Configs List */}
      <div className="grid gap-4">
        {configs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">Chưa có cấu hình ViettelPost</p>
              <p className="text-muted-foreground mb-4">Tạo cấu hình đầu tiên để bắt đầu sử dụng dịch vụ vận chuyển</p>
              <Button onClick={handleNew}>
                <Plus className="h-4 w-4 mr-2" />
                Tạo cấu hình đầu tiên
              </Button>
            </CardContent>
          </Card>
        ) : (
          configs.map((config) => (
            <Card key={config.id} className={config.isDefault ? "border-primary" : ""}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CardTitle className="flex items-center space-x-2">
                      <Settings className="h-5 w-5" />
                      <span>{config.configName}</span>
                    </CardTitle>
                    {config.isDefault && (
                      <Badge variant="default">
                        <Star className="w-3 h-3 mr-1" />
                        Mặc định
                      </Badge>
                    )}
                    {getStatusBadge(config)}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTestConnection(config.id)}
                      disabled={testingConnection === config.id}
                    >
                      {testingConnection === config.id ? (
                        <>
                          <Clock className="h-3 w-3 mr-1 animate-spin" />
                          Đang test...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Test kết nối
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(config)}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Chỉnh sửa
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(config)}
                      disabled={config.isDefault}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Xóa
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-muted-foreground">Username</p>
                    <p>{config.username}</p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">Dịch vụ mặc định</p>
                    <p>{serviceOptions.find(s => s.value === config.defaultServiceCode)?.label || config.defaultServiceCode}</p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">Người gửi</p>
                    <p>{config.defaultSenderInfo.fullName}</p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">Số điện thoại</p>
                    <p>{config.defaultSenderInfo.phone}</p>
                  </div>
                </div>
                
                {config.lastError && (
                  <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded">
                    <p className="text-sm text-destructive font-medium">Lỗi gần nhất:</p>
                    <p className="text-sm text-destructive">{config.lastError}</p>
                  </div>
                )}

                <div className="mt-4 flex flex-wrap gap-2">
                  {config.autoCreateOrder && (
                    <Badge variant="outline">Tự động tạo đơn</Badge>
                  )}
                  {config.autoUpdateStatus && (
                    <Badge variant="outline">Tự động cập nhật trạng thái</Badge>
                  )}
                  {config.webhookUrl && (
                    <Badge variant="outline">Webhook đã cấu hình</Badge>
                  )}
                </div>

                {config.apiCallCount !== undefined && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    API calls: {config.apiCallCount} | Errors: {config.errorCount || 0}
                    {config.lastTokenRefresh && (
                      <span> | Token làm mới: {new Date(config.lastTokenRefresh).toLocaleString('vi-VN')}</span>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingConfig ? "Chỉnh sửa cấu hình ViettelPost" : "Tạo cấu hình ViettelPost mới"}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Config */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="configName">Tên cấu hình *</Label>
                <Input
                  id="configName"
                  {...form.register("configName")}
                  placeholder="Ví dụ: ViettelPost Production"
                />
                {form.formState.errors.configName && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.configName.message}
                  </p>
                )}
              </div>
              
              <div>
                <Label htmlFor="username">Username ViettelPost *</Label>
                <Input
                  id="username"
                  {...form.register("username")}
                  placeholder="Username từ ViettelPost"
                />
                {form.formState.errors.username && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.username.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="password">
                  {editingConfig ? "Mật khẩu mới (để trống nếu không đổi)" : "Mật khẩu *"}
                </Label>
                <Input
                  id="password"
                  type="password"
                  {...form.register("password")}
                  placeholder={editingConfig ? "Để trống nếu không đổi" : "Mật khẩu từ ViettelPost"}
                />
                {form.formState.errors.password && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="groupAddressId">Group Address ID</Label>
                <Input
                  id="groupAddressId"
                  type="number"
                  {...form.register("groupAddressId", { valueAsNumber: true })}
                  placeholder="Để trống để sử dụng mặc định"
                />
              </div>
            </div>

            {/* Sender Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Thông tin người gửi mặc định</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="senderFullName">Tên người gửi *</Label>
                  <Input
                    id="senderFullName"
                    {...form.register("defaultSenderInfo.fullName")}
                    placeholder="Tên công ty hoặc cá nhân"
                  />
                  {form.formState.errors.defaultSenderInfo?.fullName && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.defaultSenderInfo.fullName.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="senderPhone">Số điện thoại *</Label>
                  <Input
                    id="senderPhone"
                    {...form.register("defaultSenderInfo.phone")}
                    placeholder="0123456789"
                  />
                  {form.formState.errors.defaultSenderInfo?.phone && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.defaultSenderInfo.phone.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="senderEmail">Email</Label>
                  <Input
                    id="senderEmail"
                    type="email"
                    {...form.register("defaultSenderInfo.email")}
                    placeholder="email@example.com"
                  />
                  {form.formState.errors.defaultSenderInfo?.email && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.defaultSenderInfo.email.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="senderAddress">Địa chỉ *</Label>
                <Textarea
                  id="senderAddress"
                  {...form.register("defaultSenderInfo.address")}
                  placeholder="Địa chỉ đầy đủ của người gửi"
                  rows={2}
                />
                {form.formState.errors.defaultSenderInfo?.address && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.defaultSenderInfo.address.message}
                  </p>
                )}
              </div>

              {/* Location IDs - In production, these would be dropdowns */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="provinceId">Mã Tỉnh/Thành phố *</Label>
                  <Input
                    id="provinceId"
                    type="number"
                    {...form.register("defaultSenderInfo.provinceId", { valueAsNumber: true })}
                    placeholder="1"
                  />
                </div>
                <div>
                  <Label htmlFor="districtId">Mã Quận/Huyện *</Label>
                  <Input
                    id="districtId"
                    type="number"
                    {...form.register("defaultSenderInfo.districtId", { valueAsNumber: true })}
                    placeholder="1"
                  />
                </div>
                <div>
                  <Label htmlFor="wardId">Mã Phường/Xã *</Label>
                  <Input
                    id="wardId"
                    type="number"
                    {...form.register("defaultSenderInfo.wardId", { valueAsNumber: true })}
                    placeholder="1"
                  />
                </div>
              </div>
            </div>

            {/* Service Options */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Tùy chọn dịch vụ</h3>
              
              <div>
                <Label htmlFor="defaultServiceCode">Dịch vụ mặc định</Label>
                <Select
                  value={form.watch("defaultServiceCode")}
                  onValueChange={(value) => form.setValue("defaultServiceCode", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceOptions.map((service) => (
                      <SelectItem key={service.value} value={service.value}>
                        {service.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="webhookUrl">Webhook URL</Label>
                <Input
                  id="webhookUrl"
                  {...form.register("webhookUrl")}
                  placeholder="https://your-domain.com/api/webhooks/viettelpost"
                />
                {form.formState.errors.webhookUrl && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.webhookUrl.message}
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="autoCreateOrder"
                    checked={form.watch("autoCreateOrder")}
                    onCheckedChange={(checked) => form.setValue("autoCreateOrder", checked)}
                  />
                  <Label htmlFor="autoCreateOrder">Tự động tạo đơn</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="autoUpdateStatus"
                    checked={form.watch("autoUpdateStatus")}
                    onCheckedChange={(checked) => form.setValue("autoUpdateStatus", checked)}
                  />
                  <Label htmlFor="autoUpdateStatus">Tự động cập nhật trạng thái</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isDefault"
                    checked={form.watch("isDefault")}
                    onCheckedChange={(checked) => form.setValue("isDefault", checked)}
                  />
                  <Label htmlFor="isDefault">Làm mặc định</Label>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={configMutation.isPending}>
                {configMutation.isPending ? "Đang lưu..." : "Lưu cấu hình"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfig} onOpenChange={() => setDeleteConfig(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa cấu hình ViettelPost "{deleteConfig?.configName}"?
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? "Đang xóa..." : "Xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}