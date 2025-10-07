import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter 
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
import { Switch } from "@/components/ui/switch";
import { UserPlus, Pencil, Trash2, Shield, ShieldCheck, User } from "lucide-react";

interface Admin {
  id: number;
  email: string;
  name: string;
  role: 'superadmin' | 'admin' | 'staff';
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

interface CreateAdminForm {
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'staff';
}

export default function AdminUsersManagement() {
  const { admin } = useAdminAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [formData, setFormData] = useState<CreateAdminForm>({
    email: '',
    password: '',
    name: '',
    role: 'staff'
  });

  // Fetch admins list - Must be BEFORE any conditional returns (React hooks rules)
  const { data: admins, isLoading } = useQuery<Admin[]>({
    queryKey: ['/api/admin/list'],
    queryFn: async () => {
      const res = await fetch('/api/admin/list', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch admins');
      return res.json();
    },
    enabled: admin?.role === 'superadmin', // Only fetch if superadmin
  });

  // Only Super Admin can access this page
  if (!admin || admin.role !== 'superadmin') {
    return (
      <div className="p-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Không có quyền truy cập</CardTitle>
            <CardDescription>Chỉ Super Admin mới có thể quản lý người dùng</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Create admin mutation
  const createMutation = useMutation({
    mutationFn: async (data: CreateAdminForm) => {
      const res = await fetch('/api/admin/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Tạo admin thất bại');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/list'] });
      toast({ title: "Thành công", description: "Tạo admin mới thành công" });
      setIsCreateDialogOpen(false);
      setFormData({ email: '', password: '', name: '', role: 'staff' });
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Lỗi", description: error.message });
    }
  });

  // Update admin mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: number; role?: string; isActive?: boolean }) => {
      const res = await fetch(`/api/admin/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Cập nhật thất bại');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/list'] });
      toast({ title: "Thành công", description: "Cập nhật admin thành công" });
      setEditingAdmin(null);
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Lỗi", description: error.message });
    }
  });

  // Delete admin mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/admin/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Xóa thất bại');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/list'] });
      toast({ title: "Thành công", description: "Xóa admin thành công" });
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Lỗi", description: error.message });
    }
  });

  const handleCreate = () => {
    if (!formData.email || !formData.password || !formData.name) {
      toast({ variant: "destructive", title: "Lỗi", description: "Vui lòng điền đầy đủ thông tin" });
      return;
    }
    createMutation.mutate(formData);
  };

  const handleToggleActive = (admin: Admin) => {
    updateMutation.mutate({ id: admin.id, isActive: !admin.isActive });
  };

  const handleDelete = (id: number) => {
    if (confirm('Bạn có chắc muốn xóa admin này?')) {
      deleteMutation.mutate(id);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'superadmin': return <ShieldCheck className="h-4 w-4" />;
      case 'admin': return <Shield className="h-4 w-4" />;
      case 'staff': return <User className="h-4 w-4" />;
      default: return null;
    }
  };

  const getRoleBadge = (role: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      superadmin: 'destructive',
      admin: 'default',
      staff: 'secondary'
    };
    return (
      <Badge variant={variants[role]} className="flex items-center gap-1">
        {getRoleIcon(role)}
        {role === 'superadmin' ? 'Super Admin' : role === 'admin' ? 'Admin' : 'Staff'}
      </Badge>
    );
  };

  if (isLoading) {
    return <div className="p-8">Đang tải...</div>;
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Quản lý Admin</h1>
          <p className="text-muted-foreground">Quản lý tài khoản quản trị viên</p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Tạo Admin mới
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tạo Admin mới</DialogTitle>
              <DialogDescription>Thêm tài khoản quản trị viên mới</DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="admin@example.com"
                />
              </div>
              
              <div>
                <Label>Tên</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nguyễn Văn A"
                />
              </div>

              <div>
                <Label>Mật khẩu</Label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                />
              </div>

              <div>
                <Label>Vai trò</Label>
                <Select value={formData.role} onValueChange={(value: 'admin' | 'staff') => setFormData({ ...formData, role: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Hủy</Button>
              <Button onClick={handleCreate} disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Đang tạo...' : 'Tạo'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách Admin</CardTitle>
          <CardDescription>Tổng {admins?.length || 0} tài khoản</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Vai trò</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Đăng nhập gần nhất</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admins?.map((adminUser) => (
                <TableRow key={adminUser.id}>
                  <TableCell className="font-medium">{adminUser.name}</TableCell>
                  <TableCell>{adminUser.email}</TableCell>
                  <TableCell>{getRoleBadge(adminUser.role)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={adminUser.isActive}
                        onCheckedChange={() => handleToggleActive(adminUser)}
                        disabled={adminUser.role === 'superadmin'}
                      />
                      <span className="text-sm text-muted-foreground">
                        {adminUser.isActive ? 'Hoạt động' : 'Vô hiệu hóa'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {adminUser.lastLoginAt 
                      ? new Date(adminUser.lastLoginAt).toLocaleString('vi-VN')
                      : 'Chưa đăng nhập'}
                  </TableCell>
                  <TableCell className="text-right">
                    {adminUser.role !== 'superadmin' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(adminUser.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
