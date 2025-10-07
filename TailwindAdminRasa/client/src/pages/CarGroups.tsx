import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Edit, Folder, AlertCircle, Car } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

interface CarGroup {
  id: string;
  name: string;
  description: string | null;
  color: string;
  icon: string;
  groupType: 'region' | 'vehicle_type' | 'service' | 'custom';
  isActive: boolean;
  vehicleCount?: number;
  createdAt: string;
}

export default function CarGroups() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<CarGroup | null>(null);

  const { data: groups, isLoading, error } = useQuery<CarGroup[]>({
    queryKey: ["car-groups"],
    queryFn: async () => {
      const res = await fetch('/api/delivery-management/car-groups', {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch car groups");
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/delivery-management/car-groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create group');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["car-groups"] });
      setIsDialogOpen(false);
      toast({
        title: "Thành công",
        description: "Đã tạo nhóm xe mới",
      });
    },
    onError: () => {
      toast({
        title: "Lỗi",
        description: "Không thể tạo nhóm xe",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await fetch(`/api/delivery-management/car-groups/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update group');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["car-groups"] });
      setIsDialogOpen(false);
      setEditingGroup(null);
      toast({
        title: "Thành công",
        description: "Đã cập nhật nhóm xe",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/delivery-management/car-groups/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to delete group');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["car-groups"] });
      toast({
        title: "Thành công",
        description: "Đã xóa nhóm xe",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      description: formData.get('description'),
      color: formData.get('color'),
      icon: formData.get('icon'),
      groupType: formData.get('groupType'),
      isActive: formData.get('isActive') === 'true',
    };

    if (editingGroup) {
      updateMutation.mutate({ id: editingGroup.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const openEditDialog = (group: CarGroup) => {
    setEditingGroup(group);
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingGroup(null);
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error.message || "Failed to load car groups"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-purple-500/5 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">
              Nhóm Xe
            </h1>
            <p className="text-muted-foreground mt-1">
              Quản lý và phân loại phương tiện theo nhóm
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog} className="gap-2">
                <Plus className="h-4 w-4" />
                Tạo nhóm mới
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingGroup ? "Chỉnh sửa nhóm xe" : "Tạo nhóm xe mới"}
                </DialogTitle>
                <DialogDescription>
                  {editingGroup ? "Cập nhật thông tin nhóm xe" : "Thêm nhóm xe để phân loại phương tiện"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Tên nhóm *</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={editingGroup?.name}
                    placeholder="Xe Miền Bắc, Xe Tải Nặng..."
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Mô tả</Label>
                  <Textarea
                    id="description"
                    name="description"
                    defaultValue={editingGroup?.description || ""}
                    placeholder="Mô tả chi tiết về nhóm xe"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="color">Màu sắc</Label>
                    <Input
                      id="color"
                      name="color"
                      type="color"
                      defaultValue={editingGroup?.color || "#3b82f6"}
                    />
                  </div>
                  <div>
                    <Label htmlFor="icon">Icon</Label>
                    <Input
                      id="icon"
                      name="icon"
                      defaultValue={editingGroup?.icon || "car"}
                      placeholder="car, truck, van..."
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="groupType">Loại nhóm</Label>
                  <Select name="groupType" defaultValue={editingGroup?.groupType || "custom"}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="region">Khu vực (Region)</SelectItem>
                      <SelectItem value="vehicle_type">Loại xe (Vehicle Type)</SelectItem>
                      <SelectItem value="service">Dịch vụ (Service)</SelectItem>
                      <SelectItem value="custom">Tùy chỉnh (Custom)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="isActive">Trạng thái</Label>
                  <Select name="isActive" defaultValue={editingGroup?.isActive ? "true" : "true"}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Hoạt động</SelectItem>
                      <SelectItem value="false">Tạm ngừng</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Hủy
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    {editingGroup ? "Cập nhật" : "Tạo mới"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups?.map((group) => (
            <Card key={group.id} className="border-2" style={{ borderColor: `${group.color}20` }}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-10 w-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${group.color}20` }}
                    >
                      <Car className="h-5 w-5" style={{ color: group.color }} />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{group.name}</CardTitle>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {group.groupType}
                        </Badge>
                        {group.isActive ? (
                          <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            Inactive
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => openEditDialog(group)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        if (confirm(`Xóa nhóm "${group.name}"?`)) {
                          deleteMutation.mutate(group.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {group.description && (
                  <p className="text-sm text-muted-foreground mb-3">
                    {group.description}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Số lượng xe:</span>
                  <Badge style={{ backgroundColor: `${group.color}20`, color: group.color }}>
                    {group.vehicleCount || 0}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {groups?.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Folder className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Chưa có nhóm xe nào</p>
              <p className="text-sm text-muted-foreground mt-1">Tạo nhóm mới để phân loại phương tiện</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
