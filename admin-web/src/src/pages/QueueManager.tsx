import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, List, Clock, Calendar, MoreVertical, Settings, 
  Trash2, Edit2, Eye, Sparkles, ArrowUp, ArrowDown,
  Play, Pause, CheckCircle2, XCircle, AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

interface QueueItem {
  id: string;
  contentLibraryId?: string;
  caption?: string;
  hashtags: string[];
  assetIds: string[];
  targetType: 'group' | 'accounts' | 'all';
  targetGroupId?: string;
  targetAccountIds: string[];
  priority: number;
  queuePosition: number;
  autoFill: boolean;
  preferredTimeSlots: Array<{
    dayOfWeek: number;
    hour: number;
    minute: number;
  }>;
  useAiVariation: boolean;
  variationTone?: 'formal' | 'casual' | 'trendy' | 'sales';
  status: 'pending' | 'ready' | 'processing' | 'scheduled' | 'completed' | 'failed' | 'paused';
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

interface AutoFillSettings {
  id: string;
  enabled: boolean;
  minQueueSize: number;
  maxQueueSize: number;
  fillStrategy: 'priority' | 'tag_match' | 'random' | 'round_robin';
  allowDuplicates: boolean;
  duplicateCooldown: number;
  tagMatchingMode: 'strict' | 'any' | 'weighted';
  preferredContentTypes: string[];
}

export function QueueManager() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [editingItem, setEditingItem] = useState<QueueItem | null>(null);
  
  // Form states
  const [formCaption, setFormCaption] = useState('');
  const [formHashtags, setFormHashtags] = useState('');
  const [formPriority, setFormPriority] = useState(5);
  const [formAutoFill, setFormAutoFill] = useState(false);
  const [formUseAiVariation, setFormUseAiVariation] = useState(false);
  const [formVariationTone, setFormVariationTone] = useState<'formal' | 'casual' | 'trendy' | 'sales'>('casual');
  
  // Settings form
  const [settingsEnabled, setSettingsEnabled] = useState(true);
  const [settingsMinQueue, setSettingsMinQueue] = useState(5);
  const [settingsMaxQueue, setSettingsMaxQueue] = useState(20);
  const [settingsFillStrategy, setSettingsFillStrategy] = useState<'priority' | 'tag_match' | 'random' | 'round_robin'>('priority');

  // Fetch queue items
  const { data: queueItems = [], isLoading, refetch } = useQuery({
    queryKey: ['content-queue', statusFilter, priorityFilter],
    queryFn: async () => {
      let url = '/api/content/queue';
      const params = new URLSearchParams();
      
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (priorityFilter !== 'all') params.append('priority', priorityFilter);
      
      if (params.toString()) url += `?${params.toString()}`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch queue items');
      return await response.json() as QueueItem[];
    },
  });

  // Fetch auto-fill settings
  const { data: autoFillSettings } = useQuery({
    queryKey: ['queue-settings'],
    queryFn: async () => {
      const response = await fetch('/api/content/queue/settings');
      if (!response.ok) throw new Error('Failed to fetch settings');
      return await response.json() as AutoFillSettings;
    },
  });

  // Fetch all queue items (unfiltered) for accurate stats
  const { data: allQueueItems = [] } = useQuery({
    queryKey: ['content-queue-all'],
    queryFn: async () => {
      const response = await fetch('/api/content/queue');
      if (!response.ok) throw new Error('Failed to fetch all queue items');
      return await response.json() as QueueItem[];
    },
  });

  // Create queue item mutation
  const createItemMutation = useMutation({
    mutationFn: async (data: Partial<QueueItem>) => {
      const response = await fetch('/api/content/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          hashtags: formHashtags.split(',').map(h => h.trim()).filter(Boolean),
          priority: formPriority,
          queuePosition: allQueueItems.length,
          autoFill: formAutoFill,
          useAiVariation: formUseAiVariation,
          variationTone: formUseAiVariation ? formVariationTone : undefined,
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create queue item');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-queue'] });
      queryClient.invalidateQueries({ queryKey: ['content-queue-all'] });
      resetForm();
      setShowAddModal(false);
      toast({
        title: "✅ Thành công",
        description: "Đã thêm vào hàng đợi!",
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

  // Update queue item mutation
  const updateItemMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<QueueItem> }) => {
      const response = await fetch(`/api/content/queue/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update queue item');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-queue'] });
      queryClient.invalidateQueries({ queryKey: ['content-queue-all'] });
      setShowEditModal(false);
      setEditingItem(null);
      toast({
        title: "✅ Thành công",
        description: "Cập nhật thành công!",
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

  // Delete queue item mutation
  const deleteItemMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/content/queue/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete queue item');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-queue'] });
      queryClient.invalidateQueries({ queryKey: ['content-queue-all'] });
      toast({
        title: "✅ Thành công",
        description: "Đã xóa khỏi hàng đợi!",
      });
    },
    onError: () => {
      toast({
        title: "❌ Lỗi",
        description: "Không thể xóa. Vui lòng thử lại.",
        variant: "destructive",
      });
    },
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (data: Partial<AutoFillSettings>) => {
      const response = await fetch('/api/content/queue/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update settings');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['queue-settings'] });
      setShowSettingsModal(false);
      toast({
        title: "✅ Thành công",
        description: "Cài đặt đã được cập nhật!",
      });
    },
    onError: () => {
      toast({
        title: "❌ Lỗi",
        description: "Không thể cập nhật cài đặt.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormCaption('');
    setFormHashtags('');
    setFormPriority(5);
    setFormAutoFill(false);
    setFormUseAiVariation(false);
    setFormVariationTone('casual');
  };

  // Hydrate settings form when modal opens or data loads
  useEffect(() => {
    if (showSettingsModal && autoFillSettings) {
      setSettingsEnabled(autoFillSettings.enabled);
      setSettingsMinQueue(autoFillSettings.minQueueSize);
      setSettingsMaxQueue(autoFillSettings.maxQueueSize);
      setSettingsFillStrategy(autoFillSettings.fillStrategy);
    }
  }, [showSettingsModal, autoFillSettings]);

  const handleEdit = (item: QueueItem) => {
    setEditingItem(item);
    setFormCaption(item.caption || '');
    setFormHashtags(item.hashtags.join(', '));
    setFormPriority(item.priority);
    setFormAutoFill(item.autoFill);
    setFormUseAiVariation(item.useAiVariation);
    setFormVariationTone(item.variationTone || 'casual');
    setShowEditModal(true);
  };

  const getStatusBadge = (status: QueueItem['status']) => {
    const statusConfig = {
      pending: { color: 'bg-gray-100 text-gray-700', icon: Clock, label: 'Chờ' },
      ready: { color: 'bg-green-100 text-green-700', icon: CheckCircle2, label: 'Sẵn sàng' },
      processing: { color: 'bg-blue-100 text-blue-700', icon: Play, label: 'Đang xử lý' },
      scheduled: { color: 'bg-purple-100 text-purple-700', icon: Calendar, label: 'Đã lên lịch' },
      completed: { color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2, label: 'Hoàn thành' },
      failed: { color: 'bg-red-100 text-red-700', icon: XCircle, label: 'Thất bại' },
      paused: { color: 'bg-yellow-100 text-yellow-700', icon: Pause, label: 'Tạm dừng' },
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Smart Queue Manager</h1>
          <p className="text-muted-foreground">
            Quản lý hàng đợi đăng bài tự động với AI
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowSettingsModal(true)}
          >
            <Settings className="w-4 h-4 mr-2" />
            Cài đặt
          </Button>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Thêm vào hàng đợi
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-sm text-blue-600 font-medium">Tổng số</div>
          <div className="text-2xl font-bold text-blue-700">{allQueueItems.length}</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-sm text-green-600 font-medium">Sẵn sàng</div>
          <div className="text-2xl font-bold text-green-700">
            {allQueueItems.filter(i => i.status === 'ready').length}
          </div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="text-sm text-purple-600 font-medium">Đã lên lịch</div>
          <div className="text-2xl font-bold text-purple-700">
            {allQueueItems.filter(i => i.status === 'scheduled').length}
          </div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="text-sm text-yellow-600 font-medium">Auto-fill</div>
          <div className="text-2xl font-bold text-yellow-700">
            {autoFillSettings?.enabled ? 'BẬT' : 'TẮT'}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="pending">Chờ</SelectItem>
            <SelectItem value="ready">Sẵn sàng</SelectItem>
            <SelectItem value="processing">Đang xử lý</SelectItem>
            <SelectItem value="scheduled">Đã lên lịch</SelectItem>
            <SelectItem value="completed">Hoàn thành</SelectItem>
            <SelectItem value="failed">Thất bại</SelectItem>
            <SelectItem value="paused">Tạm dừng</SelectItem>
          </SelectContent>
        </Select>

        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Độ ưu tiên" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(p => (
              <SelectItem key={p} value={p.toString()}>Mức {p}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Queue List */}
      <div className="border rounded-lg">
        {isLoading ? (
          <div className="p-12 text-center text-muted-foreground">
            Đang tải...
          </div>
        ) : queueItems.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            Chưa có nội dung nào trong hàng đợi
          </div>
        ) : (
          <div className="divide-y">
            {queueItems.map((item, index) => (
              <div key={item.id} className="p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-bold">
                      {item.queuePosition + 1}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        {getStatusBadge(item.status)}
                        <Badge variant="outline">Mức {item.priority}</Badge>
                        {item.autoFill && (
                          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                            <Sparkles className="w-3 h-3 mr-1" />
                            Auto-fill
                          </Badge>
                        )}
                        {item.useAiVariation && (
                          <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                            <Sparkles className="w-3 h-3 mr-1" />
                            AI Variation
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {item.caption || 'Không có caption'}
                      </p>
                      {item.hashtags.length > 0 && (
                        <div className="flex items-center gap-1 flex-wrap">
                          {item.hashtags.map((tag, i) => (
                            <span key={i} className="text-xs text-blue-600">#{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(item)}>
                        <Edit2 className="w-4 h-4 mr-2" />
                        Chỉnh sửa
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={() => {
                          if (confirm('Xóa khỏi hàng đợi?')) {
                            deleteItemMutation.mutate(item.id);
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Xóa
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Thêm vào hàng đợi</DialogTitle>
            <DialogDescription>
              Tạo nội dung mới để thêm vào hàng đợi đăng bài tự động
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="caption">Caption</Label>
              <Textarea
                id="caption"
                value={formCaption}
                onChange={(e) => setFormCaption(e.target.value)}
                placeholder="Nhập nội dung caption..."
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="hashtags">Hashtags (phân cách bởi dấu phẩy)</Label>
              <Input
                id="hashtags"
                value={formHashtags}
                onChange={(e) => setFormHashtags(e.target.value)}
                placeholder="nhahang, monan, ngonvl"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="priority">Độ ưu tiên (1-10)</Label>
                <Input
                  id="priority"
                  type="number"
                  min={1}
                  max={10}
                  value={formPriority}
                  onChange={(e) => setFormPriority(parseInt(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="variationTone">Tone AI</Label>
                <Select 
                  value={formVariationTone} 
                  onValueChange={(v: any) => setFormVariationTone(v)}
                  disabled={!formUseAiVariation}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="formal">Formal</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="trendy">Trendy</SelectItem>
                    <SelectItem value="sales">Sales</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="autoFill" 
                checked={formAutoFill}
                onCheckedChange={(checked) => setFormAutoFill(checked as boolean)}
              />
              <label htmlFor="autoFill" className="text-sm font-medium">
                Cho phép Auto-fill
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="aiVariation" 
                checked={formUseAiVariation}
                onCheckedChange={(checked) => setFormUseAiVariation(checked as boolean)}
              />
              <label htmlFor="aiVariation" className="text-sm font-medium">
                Sử dụng AI Variation
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              Hủy
            </Button>
            <Button 
              onClick={() => createItemMutation.mutate({ caption: formCaption })}
              disabled={createItemMutation.isPending}
            >
              {createItemMutation.isPending ? 'Đang thêm...' : 'Thêm vào hàng đợi'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-caption">Caption</Label>
              <Textarea
                id="edit-caption"
                value={formCaption}
                onChange={(e) => setFormCaption(e.target.value)}
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="edit-hashtags">Hashtags</Label>
              <Input
                id="edit-hashtags"
                value={formHashtags}
                onChange={(e) => setFormHashtags(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="edit-priority">Độ ưu tiên</Label>
              <Input
                id="edit-priority"
                type="number"
                min={1}
                max={10}
                value={formPriority}
                onChange={(e) => setFormPriority(parseInt(e.target.value))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditModal(false)}>
              Hủy
            </Button>
            <Button 
              onClick={() => {
                if (editingItem) {
                  updateItemMutation.mutate({
                    id: editingItem.id,
                    data: {
                      caption: formCaption,
                      hashtags: formHashtags.split(',').map(h => h.trim()).filter(Boolean),
                      priority: formPriority,
                    }
                  });
                }
              }}
              disabled={updateItemMutation.isPending}
            >
              {updateItemMutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Modal */}
      <Dialog open={showSettingsModal} onOpenChange={setShowSettingsModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cài đặt Auto-fill</DialogTitle>
            <DialogDescription>
              Cấu hình hệ thống tự động điền hàng đợi
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="settings-enabled" 
                checked={settingsEnabled}
                onCheckedChange={(checked) => setSettingsEnabled(checked as boolean)}
              />
              <label htmlFor="settings-enabled" className="text-sm font-medium">
                Bật Auto-fill
              </label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Kích thước tối thiểu</Label>
                <Input
                  type="number"
                  value={settingsMinQueue}
                  onChange={(e) => setSettingsMinQueue(parseInt(e.target.value))}
                />
              </div>
              <div>
                <Label>Kích thước tối đa</Label>
                <Input
                  type="number"
                  value={settingsMaxQueue}
                  onChange={(e) => setSettingsMaxQueue(parseInt(e.target.value))}
                />
              </div>
            </div>
            <div>
              <Label>Chiến lược điền</Label>
              <Select 
                value={settingsFillStrategy} 
                onValueChange={(v: any) => setSettingsFillStrategy(v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="priority">Theo độ ưu tiên</SelectItem>
                  <SelectItem value="tag_match">Khớp tag</SelectItem>
                  <SelectItem value="random">Ngẫu nhiên</SelectItem>
                  <SelectItem value="round_robin">Round Robin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSettingsModal(false)}>
              Hủy
            </Button>
            <Button 
              onClick={() => {
                updateSettingsMutation.mutate({
                  enabled: settingsEnabled,
                  minQueueSize: settingsMinQueue,
                  maxQueueSize: settingsMaxQueue,
                  fillStrategy: settingsFillStrategy,
                });
              }}
              disabled={updateSettingsMutation.isPending}
            >
              {updateSettingsMutation.isPending ? 'Đang lưu...' : 'Lưu cài đặt'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
