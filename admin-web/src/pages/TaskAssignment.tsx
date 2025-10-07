import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Users, Search, Filter, UserCheck, UserX, Save, X, CheckCircle, AlertCircle, Clock, Calendar } from "lucide-react";

// Mock data for demonstration - in real app, this would come from API
const mockTasks = [
  {
    id: "task-001",
    title: "Cập nhật inventory sản phẩm",
    description: "Kiểm tra và cập nhật số lượng tồn kho cho tất cả sản phẩm",
    assignedTo: "Nguyễn Văn A",
    assigneeId: "user-001",
    priority: "high",
    status: "in_progress",
    dueDate: "2025-09-30",
    category: "inventory"
  },
  {
    id: "task-002", 
    title: "Xử lý đơn hàng khách VIP",
    description: "Ưu tiên xử lý đơn hàng từ khách hàng VIP",
    assignedTo: "Trần Thị B",
    assigneeId: "user-002",
    priority: "high",
    status: "completed",
    dueDate: "2025-09-29",
    category: "orders"
  },
  {
    id: "task-003",
    title: "Trả lời chatbot feedback",
    description: "Xem xét và cải thiện phản hồi chatbot dựa trên feedback khách hàng",
    assignedTo: "Lê Văn C",
    assigneeId: "user-003", 
    priority: "medium",
    status: "pending",
    dueDate: "2025-10-02",
    category: "support"
  }
];

const mockUsers = [
  { id: "user-001", name: "Nguyễn Văn A", email: "a@company.com", department: "Kho hàng" },
  { id: "user-002", name: "Trần Thị B", email: "b@company.com", department: "Bán hàng" },
  { id: "user-003", name: "Lê Văn C", email: "c@company.com", department: "Hỗ trợ" },
  { id: "user-004", name: "Phạm Văn D", email: "d@company.com", department: "Marketing" }
];

export default function TaskAssignment() {
  const { toast } = useToast();
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  
  const [filters, setFilters] = useState({
    search: "",
    priority: "all",
    status: "all",
    category: "all",
    assignee: "all"
  });

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    assigneeId: "",
    priority: "medium",
    dueDate: "",
    category: "general"
  });

  // Mock query - in real app would fetch from API
  const { data: tasks = mockTasks, isLoading } = useQuery({
    queryKey: ['tasks', filters],
    queryFn: async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockTasks.filter(task => {
        const matchesSearch = !filters.search || 
          task.title.toLowerCase().includes(filters.search.toLowerCase()) ||
          task.assignedTo.toLowerCase().includes(filters.search.toLowerCase());
        const matchesPriority = filters.priority === "all" || task.priority === filters.priority;
        const matchesStatus = filters.status === "all" || task.status === filters.status;
        const matchesCategory = filters.category === "all" || task.category === filters.category;
        const matchesAssignee = filters.assignee === "all" || task.assigneeId === filters.assignee;
        
        return matchesSearch && matchesPriority && matchesStatus && matchesCategory && matchesAssignee;
      });
    }
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in_progress': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'pending': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: "bg-green-100 text-green-800 border-green-200",
      in_progress: "bg-blue-100 text-blue-800 border-blue-200", 
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200"
    };
    const labels = {
      completed: "Hoàn thành",
      in_progress: "Đang thực hiện",
      pending: "Chờ xử lý"
    };
    return (
      <Badge className={variants[status as keyof typeof variants] || "bg-gray-100 text-gray-800"}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      high: "bg-red-100 text-red-800 border-red-200",
      medium: "bg-orange-100 text-orange-800 border-orange-200",
      low: "bg-green-100 text-green-800 border-green-200"
    };
    const labels = {
      high: "Cao",
      medium: "Trung bình", 
      low: "Thấp"
    };
    return (
      <Badge className={variants[priority as keyof typeof variants] || "bg-gray-100 text-gray-800"}>
        {labels[priority as keyof typeof labels] || priority}
      </Badge>
    );
  };

  const handleCreateTask = () => {
    if (!newTask.title || !newTask.assigneeId) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin nhiệm vụ",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Thành công",
      description: `Đã tạo nhiệm vụ "${newTask.title}"`,
    });
    
    setIsCreateTaskModalOpen(false);
    setNewTask({
      title: "",
      description: "",
      assigneeId: "",
      priority: "medium",
      dueDate: "",
      category: "general"
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            Phân công nhiệm vụ
          </h1>
          <p className="text-muted-foreground mt-2">
            Quản lý và phân công công việc cho nhân viên
          </p>
        </div>
        
        <Button onClick={() => setIsCreateTaskModalOpen(true)} className="bg-primary hover:bg-primary/90">
          <Save className="h-4 w-4 mr-2" />
          Tạo nhiệm vụ mới
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Bộ lọc
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="lg:col-span-2">
              <Label htmlFor="search">Tìm kiếm</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Tìm theo tên nhiệm vụ hoặc người phụ trách..."
                  value={filters.search}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                  className="pl-9"
                />
              </div>
            </div>

            <div>
              <Label>Ưu tiên</Label>
              <Select value={filters.priority} onValueChange={(value) => setFilters({...filters, priority: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="high">Cao</SelectItem>
                  <SelectItem value="medium">Trung bình</SelectItem>
                  <SelectItem value="low">Thấp</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Trạng thái</Label>
              <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="pending">Chờ xử lý</SelectItem>
                  <SelectItem value="in_progress">Đang thực hiện</SelectItem>
                  <SelectItem value="completed">Hoàn thành</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Danh mục</Label>
              <Select value={filters.category} onValueChange={(value) => setFilters({...filters, category: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="inventory">Kho hàng</SelectItem>
                  <SelectItem value="orders">Đơn hàng</SelectItem>
                  <SelectItem value="support">Hỗ trợ</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="general">Chung</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Người phụ trách</Label>
              <Select value={filters.assignee} onValueChange={(value) => setFilters({...filters, assignee: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  {mockUsers.map(user => (
                    <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tasks List */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách nhiệm vụ ({tasks?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Đang tải...</div>
          ) : tasks?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Không tìm thấy nhiệm vụ nào
            </div>
          ) : (
            <div className="space-y-4">
              {tasks?.map((task) => (
                <div key={task.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(task.status)}
                        <h3 className="font-medium">{task.title}</h3>
                        {getPriorityBadge(task.priority)}
                        {getStatusBadge(task.status)}
                      </div>
                      
                      <p className="text-sm text-muted-foreground">{task.description}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <UserCheck className="h-4 w-4" />
                          {task.assignedTo}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(task.dueDate).toLocaleDateString('vi-VN')}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Chỉnh sửa
                      </Button>
                      <Button variant="outline" size="sm">
                        Xem chi tiết
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Task Modal */}
      {isCreateTaskModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Tạo nhiệm vụ mới
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setIsCreateTaskModalOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Tên nhiệm vụ *</Label>
                <Input
                  id="title"
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  placeholder="Nhập tên nhiệm vụ..."
                />
              </div>

              <div>
                <Label htmlFor="description">Mô tả</Label>
                <Input
                  id="description" 
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  placeholder="Mô tả chi tiết nhiệm vụ..."
                />
              </div>

              <div>
                <Label>Người phụ trách *</Label>
                <Select value={newTask.assigneeId} onValueChange={(value) => setNewTask({...newTask, assigneeId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn người phụ trách" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockUsers.map(user => (
                      <SelectItem key={user.id} value={user.id}>{user.name} - {user.department}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Ưu tiên</Label>
                  <Select value={newTask.priority} onValueChange={(value) => setNewTask({...newTask, priority: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Thấp</SelectItem>
                      <SelectItem value="medium">Trung bình</SelectItem>
                      <SelectItem value="high">Cao</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Danh mục</Label>
                  <Select value={newTask.category} onValueChange={(value) => setNewTask({...newTask, category: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">Chung</SelectItem>
                      <SelectItem value="inventory">Kho hàng</SelectItem>
                      <SelectItem value="orders">Đơn hàng</SelectItem>
                      <SelectItem value="support">Hỗ trợ</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="dueDate">Hạn hoàn thành</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleCreateTask} className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  Tạo nhiệm vụ
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsCreateTaskModalOpen(false)}
                  className="flex-1"
                >
                  Hủy
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}