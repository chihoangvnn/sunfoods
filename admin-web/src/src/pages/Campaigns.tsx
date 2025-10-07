import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useState } from 'react';
import { 
  Share2, 
  Gift, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ExternalLink, 
  Award, 
  Sparkles,
  AlertCircle,
  Copy
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

const participateSchema = z.object({
  shareUrl: z.string().url({ message: 'Vui lòng nhập URL hợp lệ' })
    .refine(url => url.includes('facebook.com'), {
      message: 'Vui lòng nhập liên kết Facebook'
    })
});

interface Campaign {
  id: string;
  name: string;
  description: string | null;
  type: 'share_for_voucher' | 'share_for_points';
  rewardType: 'voucher' | 'points';
  rewardPoints: number | null;
  startDate: string;
  endDate: string | null;
  shareTemplate: string | null;
  requiredHashtags: string[] | null;
  maxParticipations: number | null;
  maxParticipationsPerCustomer: number | null;
  voucherCode: string | null;
  voucherName: string | null;
  voucherDescription: string | null;
}

interface Participation {
  id: string;
  campaignId: string;
  shareUrl: string;
  status: 'pending' | 'verifying' | 'verified' | 'rejected' | 'rewarded';
  submittedAt: string;
  verificationScheduledAt: string | null;
  lastVerifiedAt: string | null;
  rejectionReason: string | null;
  rewardedAt: string | null;
  campaignName: string;
  campaignType: string;
  rewardType: 'voucher' | 'points';
  rewardPoints: number | null;
  voucherCode: string | null;
  voucherName: string | null;
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('vi-VN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getStatusBadge = (status: Participation['status']) => {
  switch (status) {
    case 'pending':
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
        <Clock className="w-3 h-3 mr-1" />
        Đang chờ xác minh
      </Badge>;
    case 'verifying':
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
        <AlertCircle className="w-3 h-3 mr-1" />
        Đang xác minh
      </Badge>;
    case 'verified':
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
        <CheckCircle2 className="w-3 h-3 mr-1" />
        Đã xác minh
      </Badge>;
    case 'rewarded':
      return <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
        <Award className="w-3 h-3 mr-1" />
        Đã nhận thưởng
      </Badge>;
    case 'rejected':
      return <Badge variant="destructive">
        <XCircle className="w-3 h-3 mr-1" />
        Từ chối
      </Badge>;
    default:
      return null;
  }
};

export default function Campaigns() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [isParticipateDialogOpen, setIsParticipateDialogOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [validationError, setValidationError] = useState('');

  const { data: campaignsData, isLoading: campaignsLoading } = useQuery({
    queryKey: ['campaigns'],
    queryFn: async () => {
      const response = await fetch('/api/campaigns', {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Không thể tải danh sách chiến dịch');
      }
      const data = await response.json();
      return data;
    }
  });

  const { data: participationsData, isLoading: participationsLoading } = useQuery({
    queryKey: ['my-participations'],
    queryFn: async () => {
      const response = await fetch('/api/campaigns/my-participations', {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Không thể tải lịch sử tham gia');
      }
      const data = await response.json();
      return data;
    }
  });

  const participateMutation = useMutation({
    mutationFn: async ({ campaignId, shareUrl }: { campaignId: string; shareUrl: string }) => {
      const response = await fetch(`/api/campaigns/${campaignId}/participate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shareUrl }),
        credentials: 'include'
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Không thể gửi tham gia');
      }
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: '✅ Thành công!',
        description: data.message || 'Đã gửi tham gia thành công. Chúng tôi sẽ xác minh và trao thưởng trong vòng 24 giờ.',
      });
      queryClient.invalidateQueries({ queryKey: ['my-participations'] });
      setShareUrl('');
      setIsParticipateDialogOpen(false);
      setSelectedCampaign(null);
      setValidationError('');
    },
    onError: (error: Error) => {
      toast({
        title: '❌ Lỗi',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  const handleParticipate = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setShareUrl('');
    setValidationError('');
    setIsParticipateDialogOpen(true);
  };

  const handleSubmitParticipation = () => {
    setValidationError('');
    
    const validation = participateSchema.safeParse({ shareUrl });
    if (!validation.success) {
      setValidationError(validation.error.errors[0].message);
      return;
    }

    if (!selectedCampaign) return;

    participateMutation.mutate({
      campaignId: selectedCampaign.id,
      shareUrl
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: '✅ Đã sao chép',
      description: 'Đã sao chép vào clipboard',
    });
  };

  const campaigns: Campaign[] = campaignsData?.campaigns || [];
  const participations: Participation[] = participationsData?.participations || [];

  const pendingParticipations = participations.filter(p => p.status === 'pending' || p.status === 'verifying');
  const verifiedParticipations = participations.filter(p => p.status === 'verified');
  const rewardedParticipations = participations.filter(p => p.status === 'rewarded');
  const rejectedParticipations = participations.filter(p => p.status === 'rejected');

  const CampaignCard = ({ campaign }: { campaign: Campaign }) => {
    return (
      <Card className="border-0 shadow-lg transition-all hover:shadow-xl bg-gradient-to-br from-purple-50 to-pink-50">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-xl mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {campaign.name}
              </CardTitle>
              {campaign.description && (
                <CardDescription className="text-gray-600">
                  {campaign.description}
                </CardDescription>
              )}
            </div>
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              {campaign.type === 'share_for_voucher' ? 'Chia sẻ nhận voucher' : 'Chia sẻ nhận điểm'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>Từ {formatDate(campaign.startDate)}</span>
            </div>
            {campaign.endDate && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>Đến {formatDate(campaign.endDate)}</span>
              </div>
            )}
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg border border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <Gift className="w-5 h-5 text-purple-600" />
              <h4 className="font-semibold text-purple-900">Phần thưởng:</h4>
            </div>
            {campaign.rewardType === 'voucher' && campaign.voucherName && (
              <div className="space-y-1">
                <p className="text-lg font-bold text-purple-600">{campaign.voucherName}</p>
                {campaign.voucherDescription && (
                  <p className="text-sm text-gray-600">{campaign.voucherDescription}</p>
                )}
              </div>
            )}
            {campaign.rewardType === 'points' && campaign.rewardPoints && (
              <p className="text-lg font-bold text-purple-600">
                {campaign.rewardPoints} điểm thưởng
              </p>
            )}
          </div>

          {campaign.shareTemplate && (
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-500 mb-1">Mẫu nội dung chia sẻ:</p>
              <p className="text-sm text-gray-700 italic line-clamp-3">
                {campaign.shareTemplate}
              </p>
            </div>
          )}

          <Button
            onClick={() => handleParticipate(campaign)}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Tham Gia Ngay
          </Button>
        </CardContent>
      </Card>
    );
  };

  const ParticipationRow = ({ participation }: { participation: Participation }) => {
    return (
      <Card className="mb-3">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-semibold text-gray-900">{participation.campaignName}</h4>
                {getStatusBadge(participation.status)}
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <ExternalLink className="w-4 h-4" />
                <a 
                  href={participation.shareUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline truncate max-w-md"
                >
                  {participation.shareUrl}
                </a>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                <span>Gửi lúc: {formatDateTime(participation.submittedAt)}</span>
              </div>

              {participation.rejectionReason && (
                <Alert variant="destructive" className="mt-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Lý do từ chối: {participation.rejectionReason}
                  </AlertDescription>
                </Alert>
              )}

              {participation.status === 'rewarded' && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-lg border border-green-200 mt-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-5 h-5 text-green-600" />
                    <h5 className="font-semibold text-green-900">Phần thưởng đã nhận:</h5>
                  </div>
                  {participation.rewardType === 'voucher' && participation.voucherCode && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <code className="text-lg font-bold bg-white px-3 py-1 rounded border-2 border-dashed border-green-300">
                          {participation.voucherCode}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(participation.voucherCode!)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                      {participation.voucherName && (
                        <p className="text-sm text-green-700">{participation.voucherName}</p>
                      )}
                      <Button
                        variant="ghost"
                        className="text-green-600 p-0 h-auto hover:bg-transparent"
                        onClick={() => window.location.href = '/member/vouchers'}
                      >
                        <Gift className="w-4 h-4 mr-1" />
                        Xem tất cả voucher
                      </Button>
                    </div>
                  )}
                  {participation.rewardType === 'points' && participation.rewardPoints && (
                    <p className="text-lg font-bold text-green-600">
                      +{participation.rewardPoints} điểm thưởng
                    </p>
                  )}
                  {participation.rewardedAt && (
                    <p className="text-xs text-gray-500 mt-1">
                      Nhận lúc: {formatDateTime(participation.rewardedAt)}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (campaignsLoading || participationsLoading) {
    return (
      <div className="container mx-auto p-4 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-40 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6 bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50 min-h-screen">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full">
            <Share2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Chiến Dịch Khuyến Mãi
          </h1>
        </div>
        <p className="text-gray-600">Tham gia chiến dịch và nhận thưởng hấp dẫn</p>
      </div>

      <Tabs defaultValue="campaigns" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-white/80 backdrop-blur-sm">
          <TabsTrigger 
            value="campaigns" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white"
          >
            Chiến Dịch Đang Diễn Ra ({campaigns.length})
          </TabsTrigger>
          <TabsTrigger 
            value="participations"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white"
          >
            Lịch Sử Tham Gia ({participations.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-4 mt-6">
          {campaigns.length === 0 ? (
            <Alert className="bg-white/80 backdrop-blur-sm border-purple-200">
              <AlertCircle className="h-4 w-4 text-purple-600" />
              <AlertDescription className="text-gray-600">
                Hiện tại chưa có chiến dịch nào đang diễn ra. Vui lòng quay lại sau!
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {campaigns.map(campaign => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="participations" className="space-y-4 mt-6">
          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-purple-200">
            <div className="flex items-center gap-6 flex-wrap">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{pendingParticipations.length}</div>
                <div className="text-sm text-gray-600">Đang chờ</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{verifiedParticipations.length}</div>
                <div className="text-sm text-gray-600">Đã xác minh</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600">{rewardedParticipations.length}</div>
                <div className="text-sm text-gray-600">Đã nhận thưởng</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{rejectedParticipations.length}</div>
                <div className="text-sm text-gray-600">Từ chối</div>
              </div>
            </div>
          </div>

          {participations.length === 0 ? (
            <Alert className="bg-white/80 backdrop-blur-sm border-purple-200">
              <AlertCircle className="h-4 w-4 text-purple-600" />
              <AlertDescription className="text-gray-600">
                Bạn chưa tham gia chiến dịch nào. Hãy bắt đầu chia sẻ để nhận thưởng!
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-3">
              {participations.map(participation => (
                <ParticipationRow key={participation.id} participation={participation} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={isParticipateDialogOpen} onOpenChange={setIsParticipateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Tham Gia Chiến Dịch
            </DialogTitle>
            <DialogDescription>
              {selectedCampaign?.name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedCampaign && (
            <div className="space-y-4 py-4">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <Gift className="w-5 h-5 text-purple-600" />
                  <h4 className="font-semibold text-purple-900">Phần thưởng:</h4>
                </div>
                {selectedCampaign.rewardType === 'voucher' && selectedCampaign.voucherName && (
                  <p className="text-lg font-bold text-purple-600">{selectedCampaign.voucherName}</p>
                )}
                {selectedCampaign.rewardType === 'points' && selectedCampaign.rewardPoints && (
                  <p className="text-lg font-bold text-purple-600">
                    {selectedCampaign.rewardPoints} điểm thưởng
                  </p>
                )}
              </div>

              {selectedCampaign.shareTemplate && (
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-gray-700">Mẫu nội dung chia sẻ:</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(selectedCampaign.shareTemplate!)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-gray-700 italic whitespace-pre-wrap">
                    {selectedCampaign.shareTemplate}
                  </p>
                </div>
              )}

              <Alert className="bg-blue-50 border-blue-200">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-sm text-blue-900">
                  <strong>Hướng dẫn:</strong>
                  <ol className="list-decimal list-inside mt-2 space-y-1">
                    <li>Chia sẻ nội dung chiến dịch lên Facebook</li>
                    <li>Sao chép đường dẫn bài viết của bạn</li>
                    <li>Dán vào ô bên dưới và gửi</li>
                  </ol>
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="share-url">Liên kết bài viết Facebook</Label>
                <Input
                  id="share-url"
                  placeholder="https://www.facebook.com/..."
                  value={shareUrl}
                  onChange={(e) => {
                    setShareUrl(e.target.value);
                    setValidationError('');
                  }}
                  className={validationError ? 'border-red-500' : ''}
                />
                {validationError && (
                  <p className="text-sm text-red-600">{validationError}</p>
                )}
              </div>

              <Button
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                onClick={handleSubmitParticipation}
                disabled={participateMutation.isPending}
              >
                {participateMutation.isPending ? 'Đang gửi...' : 'Gửi Tham Gia'}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
