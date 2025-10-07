import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Plus, 
  Pencil, 
  Trash2, 
  TrendingUp, 
  Eye, 
  Calendar as CalendarIcon,
  RefreshCw,
  ExternalLink,
  Filter,
  Users,
  Gift,
  Share2,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { z } from "zod";

interface Campaign {
  id: string;
  name: string;
  description: string | null;
  type: "share_to_earn" | "referral" | "engagement";
  rewardType: "voucher" | "points" | "both";
  rewardVoucherCodeId: string | null;
  rewardPoints: number;
  status: "draft" | "active" | "paused" | "ended";
  startDate: string;
  endDate: string | null;
  verificationDelayHours: number;
  minEngagementLikes: number;
  minEngagementShares: number;
  minEngagementComments: number;
  requirePostStillExists: boolean;
  maxParticipations: number | null;
  maxParticipationsPerCustomer: number;
  shareTemplate: string | null;
  requiredHashtags: string[];
  voucherName?: string;
  totalParticipations: number;
  rewardedCount: number;
  createdAt: string;
  updatedAt: string;
}

interface CampaignDetails extends Campaign {
  stats: {
    pending: number;
    verifying: number;
    verified: number;
    rejected: number;
    rewarded: number;
  };
  voucherCode?: string;
  voucherDescription?: string;
}

interface Participation {
  id: string;
  campaignId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shareUrl: string;
  submittedAt: string;
  status: "pending" | "verifying" | "verified" | "rejected" | "rewarded";
  verificationScheduledAt: string | null;
  lastVerifiedAt: string | null;
  rewardedAt: string | null;
  voucherId: string | null;
  rejectionReason: string | null;
  verificationAttempts: number;
  metadata: any;
  createdAt: string;
  updatedAt: string;
}

interface DiscountCode {
  id: string;
  code: string;
  name: string;
  description: string | null;
}

const campaignFormSchema = z.object({
  name: z.string().min(3, "Tên chiến dịch phải có ít nhất 3 ký tự").max(200, "Tên chiến dịch không được quá 200 ký tự"),
  description: z.string().optional(),
  type: z.enum(["share_to_earn", "referral", "engagement"]),
  rewardType: z.enum(["voucher", "points", "both"]),
  rewardVoucherCodeId: z.string().optional(),
  rewardPoints: z.number().int().min(0, "Số điểm thưởng không được âm"),
  startDate: z.date(),
  endDate: z.date().optional(),
  verificationDelayHours: z.number().int().min(0, "Thời gian chờ xác minh không được âm"),
  minEngagementLikes: z.number().int().min(0, "Số lượt thích tối thiểu không được âm"),
  minEngagementShares: z.number().int().min(0, "Số lượt chia sẻ tối thiểu không được âm"),
  minEngagementComments: z.number().int().min(0, "Số bình luận tối thiểu không được âm"),
  requirePostStillExists: z.boolean(),
  maxParticipations: z.number().int().positive("Số lượng tham gia tối đa phải lớn hơn 0").optional(),
  maxParticipationsPerCustomer: z.number().int().positive("Số lượng tham gia tối đa mỗi khách hàng phải lớn hơn 0"),
  shareTemplate: z.string().optional(),
  requiredHashtags: z.array(z.string()),
});

type CampaignFormData = z.infer<typeof campaignFormSchema>;

export default function AdminCampaigns() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [location, setLocation] = useLocation();

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [viewingCampaignId, setViewingCampaignId] = useState<string | null>(null);
  const [hashtagInput, setHashtagInput] = useState("");
  
  const [formData, setFormData] = useState<Partial<CampaignFormData>>({
    name: "",
    description: "",
    type: "share_to_earn",
    rewardType: "voucher",
    rewardPoints: 0,
    verificationDelayHours: 24,
    minEngagementLikes: 0,
    minEngagementShares: 0,
    minEngagementComments: 0,
    requirePostStillExists: true,
    maxParticipationsPerCustomer: 1,
    requiredHashtags: [],
  });

  const { data: campaigns = [], isLoading: loadingCampaigns } = useQuery<Campaign[]>({
    queryKey: ['admin-campaigns', statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }
      const res = await fetch(`/api/admin/admin-campaigns?${params}`, { 
        credentials: 'include' 
      });
      if (!res.ok) throw new Error('Lỗi tải danh sách chiến dịch');
      return res.json();
    },
  });

  const { data: vouchers = [], isLoading: loadingVouchers } = useQuery<DiscountCode[]>({
    queryKey: ['discount-codes'],
    queryFn: async () => {
      const res = await fetch('/api/discount-codes', { credentials: 'include' });
      if (!res.ok) throw new Error('Lỗi tải danh sách voucher');
      return res.json();
    },
  });

  const { data: campaignDetails, isLoading: loadingDetails, refetch: refetchDetails } = useQuery<CampaignDetails>({
    queryKey: ['admin-campaigns', viewingCampaignId],
    queryFn: async () => {
      const res = await fetch(`/api/admin/admin-campaigns/${viewingCampaignId}`, { 
        credentials: 'include' 
      });
      if (!res.ok) throw new Error('Lỗi tải thông tin chiến dịch');
      return res.json();
    },
    enabled: !!viewingCampaignId,
  });

  const { data: participations = [], isLoading: loadingParticipations } = useQuery<Participation[]>({
    queryKey: ['campaign-participations', viewingCampaignId],
    queryFn: async () => {
      const res = await fetch(`/api/admin/admin-campaigns/${viewingCampaignId}/participations`, { 
        credentials: 'include' 
      });
      if (!res.ok) throw new Error('Lỗi tải danh sách tham gia');
      return res.json();
    },
    enabled: !!viewingCampaignId,
  });

  const createMutation = useMutation({
    mutationFn: async (data: CampaignFormData) => {
      const payload = {
        ...data,
        startDate: data.startDate.toISOString(),
        endDate: data.endDate?.toISOString(),
      };
      const res = await fetch('/api/admin/admin-campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Tạo chiến dịch thất bại');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-campaigns'] });
      toast({ title: "Thành công", description: "Tạo chiến dịch thành công" });
      setIsCreateDialogOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Lỗi", description: error.message });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CampaignFormData> }) => {
      const payload: any = { ...data };
      if (data.startDate) payload.startDate = data.startDate.toISOString();
      if (data.endDate) payload.endDate = data.endDate.toISOString();
      
      const res = await fetch(`/api/admin/admin-campaigns/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Cập nhật chiến dịch thất bại');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-campaigns'] });
      toast({ title: "Thành công", description: "Cập nhật chiến dịch thành công" });
      setEditingCampaign(null);
      resetForm();
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Lỗi", description: error.message });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/admin-campaigns/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Xóa chiến dịch thất bại');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-campaigns'] });
      toast({ title: "Thành công", description: "Xóa chiến dịch thành công" });
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Lỗi", description: error.message });
    }
  });

  const statusUpdateMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Campaign['status'] }) => {
      const res = await fetch(`/api/admin/admin-campaigns/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Cập nhật trạng thái thất bại');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-campaigns'] });
      toast({ title: "Thành công", description: "Cập nhật trạng thái thành công" });
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Lỗi", description: error.message });
    }
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      type: "share_to_earn",
      rewardType: "voucher",
      rewardPoints: 0,
      verificationDelayHours: 24,
      minEngagementLikes: 0,
      minEngagementShares: 0,
      minEngagementComments: 0,
      requirePostStillExists: true,
      maxParticipationsPerCustomer: 1,
      requiredHashtags: [],
    });
    setHashtagInput("");
  };

  const handleOpenCreateDialog = () => {
    resetForm();
    setEditingCampaign(null);
    setIsCreateDialogOpen(true);
  };

  const handleOpenEditDialog = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setFormData({
      name: campaign.name,
      description: campaign.description || "",
      type: campaign.type,
      rewardType: campaign.rewardType,
      rewardVoucherCodeId: campaign.rewardVoucherCodeId || undefined,
      rewardPoints: campaign.rewardPoints,
      startDate: new Date(campaign.startDate),
      endDate: campaign.endDate ? new Date(campaign.endDate) : undefined,
      verificationDelayHours: campaign.verificationDelayHours,
      minEngagementLikes: campaign.minEngagementLikes,
      minEngagementShares: campaign.minEngagementShares,
      minEngagementComments: campaign.minEngagementComments,
      requirePostStillExists: campaign.requirePostStillExists,
      maxParticipations: campaign.maxParticipations || undefined,
      maxParticipationsPerCustomer: campaign.maxParticipationsPerCustomer,
      shareTemplate: campaign.shareTemplate || "",
      requiredHashtags: campaign.requiredHashtags || [],
    });
    setIsCreateDialogOpen(true);
  };

  const handleSubmit = () => {
    try {
      const validatedData = campaignFormSchema.parse(formData);
      
      if (editingCampaign) {
        updateMutation.mutate({ id: editingCampaign.id, data: validatedData });
      } else {
        createMutation.mutate(validatedData);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({ 
          variant: "destructive", 
          title: "Lỗi", 
          description: error.errors[0]?.message || "Vui lòng kiểm tra lại thông tin" 
        });
      }
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc muốn xóa chiến dịch này?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleStatusChange = (id: string, status: Campaign['status']) => {
    statusUpdateMutation.mutate({ id, status });
  };

  const addHashtag = () => {
    if (hashtagInput.trim()) {
      const tag = hashtagInput.trim().startsWith('#') 
        ? hashtagInput.trim() 
        : `#${hashtagInput.trim()}`;
      setFormData({
        ...formData,
        requiredHashtags: [...(formData.requiredHashtags || []), tag],
      });
      setHashtagInput("");
    }
  };

  const removeHashtag = (index: number) => {
    setFormData({
      ...formData,
      requiredHashtags: formData.requiredHashtags?.filter((_, i) => i !== index) || [],
    });
  };

  const getTypeBadge = (type: string) => {
    const variants: Record<string, { variant: any; label: string; icon: any }> = {
      share_to_earn: { variant: "default", label: "Chia sẻ kiếm thưởng", icon: Share2 },
      referral: { variant: "secondary", label: "Giới thiệu", icon: Users },
      engagement: { variant: "outline", label: "Tương tác", icon: TrendingUp },
    };
    const config = variants[type] || variants.share_to_earn;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant as any} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string; icon: any }> = {
      draft: { variant: "outline", label: "Nháp", icon: AlertCircle },
      active: { variant: "default", label: "Đang chạy", icon: CheckCircle },
      paused: { variant: "secondary", label: "Tạm dừng", icon: Clock },
      ended: { variant: "destructive", label: "Đã kết thúc", icon: XCircle },
    };
    const config = variants[status] || variants.draft;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant as any} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getParticipationStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      pending: { variant: "outline", label: "Chờ xử lý" },
      verifying: { variant: "secondary", label: "Đang xác minh" },
      verified: { variant: "default", label: "Đã xác minh" },
      rejected: { variant: "destructive", label: "Từ chối" },
      rewarded: { variant: "default", label: "Đã thưởng" },
    };
    const config = variants[status] || variants.pending;
    return <Badge variant={config.variant as any}>{config.label}</Badge>;
  };

  if (viewingCampaignId) {
    return (
      <div className="p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Button variant="ghost" onClick={() => setViewingCampaignId(null)}>
              ← Quay lại
            </Button>
            <h1 className="text-3xl font-bold mt-2">{campaignDetails?.name}</h1>
            <p className="text-muted-foreground">{campaignDetails?.description}</p>
          </div>
          <Button onClick={() => refetchDetails()} disabled={loadingDetails}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loadingDetails ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Chờ xử lý</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{campaignDetails?.stats.pending || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Đang xác minh</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{campaignDetails?.stats.verifying || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Đã xác minh</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{campaignDetails?.stats.verified || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Từ chối</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{campaignDetails?.stats.rejected || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Đã thưởng</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{campaignDetails?.stats.rewarded || 0}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Thông tin chiến dịch</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Loại chiến dịch</Label>
                <div className="mt-1">{getTypeBadge(campaignDetails?.type || '')}</div>
              </div>
              <div>
                <Label className="text-muted-foreground">Trạng thái</Label>
                <div className="mt-1">{getStatusBadge(campaignDetails?.status || '')}</div>
              </div>
              <div>
                <Label className="text-muted-foreground">Loại thưởng</Label>
                <div className="mt-1 capitalize">{campaignDetails?.rewardType}</div>
              </div>
              {campaignDetails?.rewardVoucherCodeId && (
                <div>
                  <Label className="text-muted-foreground">Voucher</Label>
                  <div className="mt-1">{campaignDetails?.voucherName}</div>
                </div>
              )}
              {campaignDetails?.rewardPoints ? (
                <div>
                  <Label className="text-muted-foreground">Điểm thưởng</Label>
                  <div className="mt-1">{campaignDetails?.rewardPoints} điểm</div>
                </div>
              ) : null}
              <div>
                <Label className="text-muted-foreground">Ngày bắt đầu</Label>
                <div className="mt-1">
                  {campaignDetails?.startDate 
                    ? format(new Date(campaignDetails.startDate), "dd/MM/yyyy HH:mm", { locale: vi })
                    : "N/A"}
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Ngày kết thúc</Label>
                <div className="mt-1">
                  {campaignDetails?.endDate 
                    ? format(new Date(campaignDetails.endDate), "dd/MM/yyyy HH:mm", { locale: vi })
                    : "Không giới hạn"}
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Số lượt tham gia tối đa</Label>
                <div className="mt-1">{campaignDetails?.maxParticipations || "Không giới hạn"}</div>
              </div>
              <div>
                <Label className="text-muted-foreground">Tham gia tối đa/khách hàng</Label>
                <div className="mt-1">{campaignDetails?.maxParticipationsPerCustomer}</div>
              </div>
              <div>
                <Label className="text-muted-foreground">Thời gian chờ xác minh</Label>
                <div className="mt-1">{campaignDetails?.verificationDelayHours} giờ</div>
              </div>
            </div>
            
            {campaignDetails?.requiredHashtags && campaignDetails.requiredHashtags.length > 0 && (
              <div>
                <Label className="text-muted-foreground">Hashtags bắt buộc</Label>
                <div className="mt-1 flex flex-wrap gap-2">
                  {campaignDetails.requiredHashtags.map((tag, i) => (
                    <Badge key={i} variant="outline">{tag}</Badge>
                  ))}
                </div>
              </div>
            )}

            {campaignDetails?.shareTemplate && (
              <div>
                <Label className="text-muted-foreground">Nội dung chia sẻ mẫu</Label>
                <div className="mt-1 p-3 bg-muted rounded-md text-sm">{campaignDetails.shareTemplate}</div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Danh sách tham gia</CardTitle>
            <CardDescription>
              Tổng {participations.length} lượt tham gia
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingParticipations ? (
              <div className="text-center py-8">Đang tải...</div>
            ) : participations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">Chưa có người tham gia</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Khách hàng</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Link chia sẻ</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Ngày tham gia</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {participations.map((participation) => (
                    <TableRow key={participation.id}>
                      <TableCell className="font-medium">{participation.customerName}</TableCell>
                      <TableCell>{participation.customerEmail}</TableCell>
                      <TableCell>
                        <a 
                          href={participation.shareUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline flex items-center gap-1"
                        >
                          Xem bài viết <ExternalLink className="h-3 w-3" />
                        </a>
                      </TableCell>
                      <TableCell>{getParticipationStatusBadge(participation.status)}</TableCell>
                      <TableCell>
                        {format(new Date(participation.submittedAt), "dd/MM/yyyy HH:mm", { locale: vi })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Quản lý chiến dịch viral</h1>
          <p className="text-muted-foreground">Tạo và quản lý các chiến dịch marketing viral</p>
        </div>
        <Button onClick={handleOpenCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Tạo chiến dịch mới
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Danh sách chiến dịch</CardTitle>
              <CardDescription>Tổng {campaigns.length} chiến dịch</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Lọc theo trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="draft">Nháp</SelectItem>
                  <SelectItem value="active">Đang chạy</SelectItem>
                  <SelectItem value="paused">Tạm dừng</SelectItem>
                  <SelectItem value="ended">Đã kết thúc</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loadingCampaigns ? (
            <div className="text-center py-8">Đang tải...</div>
          ) : campaigns.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Chưa có chiến dịch nào. Tạo chiến dịch đầu tiên của bạn!
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên chiến dịch</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày bắt đầu</TableHead>
                  <TableHead>Ngày kết thúc</TableHead>
                  <TableHead>Tham gia</TableHead>
                  <TableHead>Đã thưởng</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell className="font-medium">{campaign.name}</TableCell>
                    <TableCell>{getTypeBadge(campaign.type)}</TableCell>
                    <TableCell>
                      <Select 
                        value={campaign.status} 
                        onValueChange={(value) => handleStatusChange(campaign.id, value as Campaign['status'])}
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Nháp</SelectItem>
                          <SelectItem value="active">Đang chạy</SelectItem>
                          <SelectItem value="paused">Tạm dừng</SelectItem>
                          <SelectItem value="ended">Đã kết thúc</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      {format(new Date(campaign.startDate), "dd/MM/yyyy", { locale: vi })}
                    </TableCell>
                    <TableCell>
                      {campaign.endDate 
                        ? format(new Date(campaign.endDate), "dd/MM/yyyy", { locale: vi })
                        : "Không giới hạn"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{campaign.totalParticipations}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="default">{campaign.rewardedCount}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setViewingCampaignId(campaign.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEditDialog(campaign)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(campaign.id)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCampaign ? "Chỉnh sửa chiến dịch" : "Tạo chiến dịch mới"}
            </DialogTitle>
            <DialogDescription>
              Điền thông tin chiến dịch marketing viral
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Cơ bản</TabsTrigger>
              <TabsTrigger value="reward">Phần thưởng</TabsTrigger>
              <TabsTrigger value="anti-fraud">Chống gian lận</TabsTrigger>
              <TabsTrigger value="limits">Giới hạn</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 mt-4">
              <div>
                <Label>Tên chiến dịch *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Chia sẻ để nhận voucher 100k"
                />
              </div>

              <div>
                <Label>Mô tả</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Mô tả chi tiết về chiến dịch"
                  rows={3}
                />
              </div>

              <div>
                <Label>Loại chiến dịch *</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="share_to_earn">Chia sẻ kiếm thưởng</SelectItem>
                    <SelectItem value="referral">Giới thiệu</SelectItem>
                    <SelectItem value="engagement">Tương tác</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Ngày bắt đầu *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.startDate 
                          ? format(formData.startDate, "dd/MM/yyyy", { locale: vi })
                          : "Chọn ngày"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.startDate}
                        onSelect={(date) => setFormData({ ...formData, startDate: date })}
                        locale={vi}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label>Ngày kết thúc</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.endDate 
                          ? format(formData.endDate, "dd/MM/yyyy", { locale: vi })
                          : "Không giới hạn"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.endDate}
                        onSelect={(date) => setFormData({ ...formData, endDate: date })}
                        locale={vi}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div>
                <Label>Nội dung chia sẻ mẫu</Label>
                <Textarea
                  value={formData.shareTemplate}
                  onChange={(e) => setFormData({ ...formData, shareTemplate: e.target.value })}
                  placeholder="Mình vừa nhận được voucher từ chiến dịch này!"
                  rows={3}
                />
              </div>

              <div>
                <Label>Hashtags bắt buộc</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={hashtagInput}
                    onChange={(e) => setHashtagInput(e.target.value)}
                    placeholder="#hashtag"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addHashtag())}
                  />
                  <Button type="button" onClick={addHashtag}>Thêm</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.requiredHashtags?.map((tag, i) => (
                    <Badge key={i} variant="secondary" className="cursor-pointer" onClick={() => removeHashtag(i)}>
                      {tag} ×
                    </Badge>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="reward" className="space-y-4 mt-4">
              <div>
                <Label>Loại phần thưởng *</Label>
                <Select 
                  value={formData.rewardType} 
                  onValueChange={(value: any) => setFormData({ ...formData, rewardType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="voucher">Voucher</SelectItem>
                    <SelectItem value="points">Điểm thưởng</SelectItem>
                    <SelectItem value="both">Cả hai</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(formData.rewardType === "voucher" || formData.rewardType === "both") && (
                <div>
                  <Label>Chọn voucher *</Label>
                  <Select 
                    value={formData.rewardVoucherCodeId} 
                    onValueChange={(value) => setFormData({ ...formData, rewardVoucherCodeId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn voucher" />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingVouchers ? (
                        <SelectItem value="loading" disabled>Đang tải...</SelectItem>
                      ) : vouchers.length === 0 ? (
                        <SelectItem value="empty" disabled>Không có voucher</SelectItem>
                      ) : (
                        vouchers.map((voucher) => (
                          <SelectItem key={voucher.id} value={voucher.id}>
                            {voucher.name} ({voucher.code})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {(formData.rewardType === "points" || formData.rewardType === "both") && (
                <div>
                  <Label>Số điểm thưởng *</Label>
                  <Input
                    type="number"
                    value={formData.rewardPoints}
                    onChange={(e) => setFormData({ ...formData, rewardPoints: parseInt(e.target.value) || 0 })}
                    min={0}
                  />
                </div>
              )}
            </TabsContent>

            <TabsContent value="anti-fraud" className="space-y-4 mt-4">
              <div>
                <Label>Thời gian chờ xác minh (giờ) *</Label>
                <Input
                  type="number"
                  value={formData.verificationDelayHours}
                  onChange={(e) => setFormData({ ...formData, verificationDelayHours: parseInt(e.target.value) || 0 })}
                  min={0}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Thời gian chờ trước khi xác minh bài viết (để tích lũy tương tác)
                </p>
              </div>

              <div>
                <Label>Số lượt thích tối thiểu</Label>
                <Input
                  type="number"
                  value={formData.minEngagementLikes}
                  onChange={(e) => setFormData({ ...formData, minEngagementLikes: parseInt(e.target.value) || 0 })}
                  min={0}
                />
              </div>

              <div>
                <Label>Số lượt chia sẻ tối thiểu</Label>
                <Input
                  type="number"
                  value={formData.minEngagementShares}
                  onChange={(e) => setFormData({ ...formData, minEngagementShares: parseInt(e.target.value) || 0 })}
                  min={0}
                />
              </div>

              <div>
                <Label>Số bình luận tối thiểu</Label>
                <Input
                  type="number"
                  value={formData.minEngagementComments}
                  onChange={(e) => setFormData({ ...formData, minEngagementComments: parseInt(e.target.value) || 0 })}
                  min={0}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.requirePostStillExists}
                  onCheckedChange={(checked) => setFormData({ ...formData, requirePostStillExists: checked })}
                />
                <Label>Yêu cầu bài viết còn tồn tại khi xác minh</Label>
              </div>
            </TabsContent>

            <TabsContent value="limits" className="space-y-4 mt-4">
              <div>
                <Label>Số lượt tham gia tối đa (toàn chiến dịch)</Label>
                <Input
                  type="number"
                  value={formData.maxParticipations || ""}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    maxParticipations: e.target.value ? parseInt(e.target.value) : undefined 
                  })}
                  min={1}
                  placeholder="Không giới hạn"
                />
              </div>

              <div>
                <Label>Số lượt tham gia tối đa mỗi khách hàng *</Label>
                <Input
                  type="number"
                  value={formData.maxParticipationsPerCustomer}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    maxParticipationsPerCustomer: parseInt(e.target.value) || 1 
                  })}
                  min={1}
                />
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Hủy
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending 
                ? 'Đang xử lý...' 
                : editingCampaign ? 'Cập nhật' : 'Tạo chiến dịch'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
