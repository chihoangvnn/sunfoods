import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
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
import { 
  Calendar, 
  Clock, 
  MoreVertical, 
  RefreshCw, 
  Trash2, 
  Edit, 
  XCircle,
  CheckCircle,
  AlertCircle,
  Search,
  Grid,
  List,
  ArrowUpDown,
  Star,
  StarOff
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { toast } from "@/hooks/use-toast";
import EditScheduledPostDialog from "./EditScheduledPostDialog";

interface ScheduledPost {
  id: string;
  caption: string;
  hashtags: string[];
  assetIds: string[];
  platform: string;
  scheduledTime: string;
  timezone: string;
  priority: number;
  status: 'draft' | 'scheduled' | 'posting' | 'posted' | 'failed' | 'cancelled';
  retryCount: number;
  errorMessage?: string;
  account?: {
    id: string;
    name: string;
    platform: string;
  };
  assets?: Array<{
    id: string;
    cloudinaryUrl: string;
    type: string;
  }>;
}

const STATUS_COLORS = {
  draft: 'bg-gray-500',
  scheduled: 'bg-blue-500',
  posting: 'bg-yellow-500',
  posted: 'bg-green-500',
  failed: 'bg-red-500',
  cancelled: 'bg-gray-400',
};

const STATUS_LABELS = {
  draft: 'Bản nháp',
  scheduled: 'Đã lên lịch',
  posting: 'Đang đăng',
  posted: 'Đã đăng',
  failed: 'Thất bại',
  cancelled: 'Đã hủy',
};

const PRIORITY_LABELS = {
  1: 'Rất thấp',
  2: 'Thấp',
  3: 'Thấp',
  4: 'Trung bình',
  5: 'Trung bình',
  6: 'Trung bình',
  7: 'Cao',
  8: 'Cao',
  9: 'Rất cao',
  10: 'Khẩn cấp',
};

export default function ScheduledPostsQueue() {
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'time' | 'priority'>('time');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<ScheduledPost | null>(null);
  const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<string>('');
  const [bulkPriority, setBulkPriority] = useState<number>(5);

  // Fetch scheduled posts
  const { data, isLoading } = useQuery<{ posts: ScheduledPost[]; total: number }>({
    queryKey: ['/api/scheduled-posts', statusFilter, platformFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (platformFilter !== 'all') params.append('platform', platformFilter);
      
      const res = await fetch(`/api/scheduled-posts?${params}`);
      if (!res.ok) throw new Error('Failed to fetch posts');
      return res.json();
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (postId: string) => {
      const res = await fetch(`/api/scheduled-posts/${postId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete post');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/scheduled-posts'] });
      toast({
        title: "Thành công",
        description: "Đã xóa bài đăng khỏi hàng đợi",
      });
      setDeleteDialogOpen(false);
      setSelectedPost(null);
    },
    onError: () => {
      toast({
        title: "Lỗi",
        description: "Không thể xóa bài đăng",
        variant: "destructive",
      });
    },
  });

  // Retry mutation
  const retryMutation = useMutation({
    mutationFn: async (postId: string) => {
      const res = await fetch(`/api/scheduled-posts/${postId}/retry`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to retry post');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/scheduled-posts'] });
      toast({
        title: "Thành công",
        description: "Đã đưa bài đăng vào hàng đợi thử lại",
      });
    },
    onError: () => {
      toast({
        title: "Lỗi",
        description: "Không thể thử lại bài đăng",
        variant: "destructive",
      });
    },
  });

  // Update priority mutation
  const updatePriorityMutation = useMutation({
    mutationFn: async ({ postId, priority }: { postId: string; priority: number }) => {
      const res = await fetch(`/api/scheduled-posts/${postId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priority }),
      });
      if (!res.ok) throw new Error('Failed to update priority');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/scheduled-posts'] });
      toast({
        title: "Thành công",
        description: "Đã cập nhật độ ưu tiên",
      });
    },
  });

  // Filter and sort posts
  const posts = data?.posts ?? [];
  const filteredPosts = posts
    .filter((post) => {
      if (searchQuery) {
        const search = searchQuery.toLowerCase();
        return (
          post.caption.toLowerCase().includes(search) ||
          post.account?.name?.toLowerCase()?.includes(search) ||
          post.hashtags.some(tag => tag.toLowerCase().includes(search))
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'priority') {
        return b.priority - a.priority;
      }
      return new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime();
    });

  const handleEdit = (post: ScheduledPost) => {
    setSelectedPost(post);
    setEditDialogOpen(true);
  };

  const handleDelete = (post: ScheduledPost) => {
    setSelectedPost(post);
    setDeleteDialogOpen(true);
  };

  const handleRetry = (postId: string) => {
    retryMutation.mutate(postId);
  };

  const toggleSelectPost = (postId: string) => {
    setSelectedPosts((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) {
        next.delete(postId);
      } else {
        next.add(postId);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedPosts.size === filteredPosts.length) {
      setSelectedPosts(new Set());
    } else {
      setSelectedPosts(new Set(filteredPosts.map((p) => p.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedPosts.size === 0) return;
    
    try {
      const results = await Promise.all(
        Array.from(selectedPosts).map(async (postId) => {
          const res = await fetch(`/api/scheduled-posts/${postId}`, { method: 'DELETE' });
          if (!res.ok) throw new Error(`Failed to delete post ${postId}`);
          return res;
        })
      );
      
      queryClient.invalidateQueries({ queryKey: ['/api/scheduled-posts'] });
      toast({
        title: "Thành công",
        description: `Đã xóa ${selectedPosts.size} bài đăng`,
      });
      setSelectedPosts(new Set());
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể xóa các bài đăng",
        variant: "destructive",
      });
    }
  };

  const handleBulkPriority = async () => {
    if (selectedPosts.size === 0) return;
    
    try {
      await Promise.all(
        Array.from(selectedPosts).map(async (postId) => {
          const res = await fetch(`/api/scheduled-posts/${postId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ priority: bulkPriority }),
          });
          if (!res.ok) throw new Error(`Failed to update priority for post ${postId}`);
          return res;
        })
      );
      
      queryClient.invalidateQueries({ queryKey: ['/api/scheduled-posts'] });
      toast({
        title: "Thành công",
        description: `Đã cập nhật độ ưu tiên cho ${selectedPosts.size} bài đăng`,
      });
      setSelectedPosts(new Set());
      setBulkAction('');
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật độ ưu tiên",
        variant: "destructive",
      });
    }
  };

  const handleBulkCancel = async () => {
    if (selectedPosts.size === 0) return;
    
    try {
      await Promise.all(
        Array.from(selectedPosts).map(async (postId) => {
          const res = await fetch(`/api/scheduled-posts/${postId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'cancelled' }),
          });
          if (!res.ok) throw new Error(`Failed to cancel post ${postId}`);
          return res;
        })
      );
      
      queryClient.invalidateQueries({ queryKey: ['/api/scheduled-posts'] });
      toast({
        title: "Thành công",
        description: `Đã hủy ${selectedPosts.size} bài đăng`,
      });
      setSelectedPosts(new Set());
      setBulkAction('');
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể hủy các bài đăng",
        variant: "destructive",
      });
    }
  };

  const handlePriorityChange = (postId: string, priority: number) => {
    updatePriorityMutation.mutate({ postId, priority });
  };

  const getPriorityIcon = (priority: number) => {
    if (priority >= 7) return <Star className="h-4 w-4 text-orange-500" />;
    if (priority <= 3) return <StarOff className="h-4 w-4 text-gray-400" />;
    return null;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Hàng Đợi Đăng Bài
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm nội dung, fanpage..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="draft">Bản nháp</SelectItem>
                <SelectItem value="scheduled">Đã lên lịch</SelectItem>
                <SelectItem value="posting">Đang đăng</SelectItem>
                <SelectItem value="posted">Đã đăng</SelectItem>
                <SelectItem value="failed">Thất bại</SelectItem>
                <SelectItem value="cancelled">Đã hủy</SelectItem>
              </SelectContent>
            </Select>
            <Select value={platformFilter} onValueChange={setPlatformFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Nền tảng" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="facebook">Facebook</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="twitter">Twitter</SelectItem>
                <SelectItem value="tiktok">TikTok</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(v: 'time' | 'priority') => setSortBy(v)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Sắp xếp" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="time">Theo thời gian</SelectItem>
                <SelectItem value="priority">Theo độ ưu tiên</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bulk Actions Toolbar */}
          {selectedPosts.size > 0 && (
            <div className="flex items-center gap-3 bg-blue-50 p-3 rounded-lg mb-4">
              <div className="text-sm font-medium text-blue-900">
                {selectedPosts.size} bài đăng được chọn
              </div>
              <div className="flex gap-2 ml-auto">
                <Select value={bulkAction} onValueChange={setBulkAction}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Chọn hành động..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cancel">Hủy bài đăng</SelectItem>
                    <SelectItem value="priority">Thay đổi độ ưu tiên</SelectItem>
                    <SelectItem value="delete">Xóa bài đăng</SelectItem>
                  </SelectContent>
                </Select>
                
                {bulkAction === 'priority' && (
                  <Select value={String(bulkPriority)} onValueChange={(v) => setBulkPriority(Number(v))}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((p) => (
                        <SelectItem key={p} value={String(p)}>
                          Độ ưu tiên {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                
                <Button
                  size="sm"
                  disabled={!bulkAction}
                  onClick={() => {
                    if (bulkAction === 'delete') handleBulkDelete();
                    else if (bulkAction === 'cancel') handleBulkCancel();
                    else if (bulkAction === 'priority') handleBulkPriority();
                  }}
                >
                  Thực hiện
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedPosts(new Set())}
                >
                  Bỏ chọn
                </Button>
              </div>
            </div>
          )}

          {/* Posts Table/Grid */}
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Đang tải...</div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Không có bài đăng nào</div>
          ) : viewMode === 'list' ? (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">
                      <Checkbox
                        checked={selectedPosts.size === filteredPosts.length && filteredPosts.length > 0}
                        onCheckedChange={toggleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Nội dung</TableHead>
                    <TableHead>Fanpage</TableHead>
                    <TableHead>Thời gian</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Độ ưu tiên</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPosts.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedPosts.has(post.id)}
                          onCheckedChange={() => toggleSelectPost(post.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="max-w-md">
                          <p className="font-medium line-clamp-1">{post.caption}</p>
                          {post.hashtags.length > 0 && (
                            <p className="text-xs text-gray-500 line-clamp-1">
                              {post.hashtags.join(' ')}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{post.platform}</Badge>
                          <span className="text-sm">{post.account?.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-gray-400" />
                          {format(parseISO(post.scheduledTime), "dd/MM/yyyy HH:mm")}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={STATUS_COLORS[post.status]}>
                          {STATUS_LABELS[post.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={String(post.priority)}
                          onValueChange={(v) => handlePriorityChange(post.id, Number(v))}
                        >
                          <SelectTrigger className="w-[120px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((p) => (
                              <SelectItem key={p} value={String(p)}>
                                {p} - {PRIORITY_LABELS[p as keyof typeof PRIORITY_LABELS]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(post)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Chỉnh sửa
                            </DropdownMenuItem>
                            {post.status === 'failed' && (
                              <DropdownMenuItem onClick={() => handleRetry(post.id)}>
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Thử lại
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => handleDelete(post)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Xóa
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPosts.map((post) => (
                <Card key={post.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={selectedPosts.has(post.id)}
                          onCheckedChange={() => toggleSelectPost(post.id)}
                        />
                        {getPriorityIcon(post.priority)}
                        <Badge className={STATUS_COLORS[post.status]}>
                          {STATUS_LABELS[post.status]}
                        </Badge>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(post)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                          {post.status === 'failed' && (
                            <DropdownMenuItem onClick={() => handleRetry(post.id)}>
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Thử lại
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => handleDelete(post)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Xóa
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="font-medium mb-2 line-clamp-2">{post.caption}</p>
                    {post.hashtags.length > 0 && (
                      <p className="text-xs text-gray-500 mb-3 line-clamp-1">
                        {post.hashtags.join(' ')}
                      </p>
                    )}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{post.platform}</Badge>
                        <span className="text-gray-600">{post.account?.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="h-4 w-4" />
                        {format(parseISO(post.scheduledTime), "dd/MM/yyyy HH:mm")}
                      </div>
                      <Select
                        value={String(post.priority)}
                        onValueChange={(v) => handlePriorityChange(post.id, Number(v))}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((p) => (
                            <SelectItem key={p} value={String(p)}>
                              {p} - {PRIORITY_LABELS[p as keyof typeof PRIORITY_LABELS]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <EditScheduledPostDialog
        post={selectedPost}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa bài đăng này khỏi hàng đợi? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedPost && deleteMutation.mutate(selectedPost.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
