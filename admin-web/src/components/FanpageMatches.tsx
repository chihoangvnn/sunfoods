import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Loader2, CheckCircle, Star, Target, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FanpageMatch {
  accountId: string;
  accountName: string;
  platform: string;
  score: number;
  matchedTags: string[];
  matchReason: 'exact' | 'preferred' | 'partial' | 'general';
  matchedTagDetails?: {
    id: string;
    name: string;
    color?: string;
  }[];
}

interface FanpageMatchesProps {
  tagIds: string[];
  platform?: string;
  maxDisplay?: number;
}

const platformConfig = {
  facebook: { icon: '📘', color: 'bg-blue-100 text-blue-800', label: 'Facebook' },
  instagram: { icon: '📷', color: 'bg-pink-100 text-pink-800', label: 'Instagram' },
  tiktok: { icon: '🎵', color: 'bg-gray-100 text-gray-800', label: 'TikTok' },
  'tiktok-business': { icon: '🎵', color: 'bg-gray-600 text-white', label: 'TikTok Business' },
  'tiktok-shop': { icon: '🛍️', color: 'bg-orange-100 text-orange-800', label: 'TikTok Shop' },
  twitter: { icon: '🐦', color: 'bg-sky-100 text-sky-800', label: 'Twitter' },
};

const matchReasonConfig = {
  exact: { 
    icon: <CheckCircle className="w-3 h-3" />, 
    color: 'bg-green-100 text-green-800 border-green-300', 
    label: 'Exact Match' 
  },
  preferred: { 
    icon: <Star className="w-3 h-3" />, 
    color: 'bg-purple-100 text-purple-800 border-purple-300', 
    label: 'Preferred' 
  },
  partial: { 
    icon: <Target className="w-3 h-3" />, 
    color: 'bg-blue-100 text-blue-800 border-blue-300', 
    label: 'Partial Match' 
  },
  general: { 
    icon: <AlertCircle className="w-3 h-3" />, 
    color: 'bg-gray-100 text-gray-800 border-gray-300', 
    label: 'General' 
  },
};

export function FanpageMatches({ tagIds, platform, maxDisplay = 10 }: FanpageMatchesProps) {
  const [matches, setMatches] = useState<FanpageMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchMatches = async () => {
      if (tagIds.length === 0) {
        setMatches([]);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch('/api/fanpage-matching/match', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contentTagIds: tagIds,
            platform,
            minScore: 10,
            limit: maxDisplay,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch matching fanpages');
        }

        const data = await response.json();
        setMatches(data.matches || []);
      } catch (error) {
        console.error('Error fetching fanpage matches:', error);
        toast({
          variant: 'destructive',
          title: 'Lỗi',
          description: 'Không thể tải danh sách fanpage phù hợp',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [tagIds, platform, maxDisplay, toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4 text-gray-500">
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        <span className="text-sm">Đang tìm fanpage phù hợp...</span>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <Card className="p-4">
        <div className="text-center text-gray-500">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm font-medium">Chưa có fanpage phù hợp</p>
          <p className="text-xs text-gray-400 mt-1">
            {tagIds.length === 0 
              ? 'Hãy thêm tags để tìm fanpage phù hợp' 
              : 'Không tìm thấy fanpage nào match với tags này'}
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">
          Fanpage Phù Hợp ({matches.length})
        </h3>
        {matches.length > 0 && (
          <div className="text-xs text-gray-500">
            Điểm cao nhất: {Math.max(...matches.map(m => m.score))}
          </div>
        )}
      </div>

      <div className="grid gap-2 max-h-[400px] overflow-y-auto pr-2">
        {matches.map((match) => {
          const platformInfo = platformConfig[match.platform as keyof typeof platformConfig];
          const reasonInfo = matchReasonConfig[match.matchReason];

          return (
            <Card key={match.accountId} className="p-3 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={platformInfo?.color || 'bg-gray-100 text-gray-800'}>
                      {platformInfo?.icon} {platformInfo?.label || match.platform}
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className={reasonInfo.color + ' flex items-center gap-1'}
                    >
                      {reasonInfo.icon}
                      <span>{reasonInfo.label}</span>
                    </Badge>
                  </div>

                  <h4 className="font-medium text-gray-900 truncate">
                    {match.accountName}
                  </h4>

                  {match.matchedTagDetails && match.matchedTagDetails.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {match.matchedTagDetails.map((tag) => (
                        <Badge 
                          key={tag.id} 
                          variant="secondary"
                          className="text-xs"
                          style={{ 
                            backgroundColor: tag.color ? `${tag.color}20` : undefined,
                            borderColor: tag.color || undefined,
                          }}
                        >
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="text-right flex-shrink-0">
                  <div className="text-2xl font-bold text-green-600">
                    {match.score}
                  </div>
                  <div className="text-xs text-gray-500">điểm</div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {matches.length > 0 && (
        <div className="text-xs text-gray-500 text-center pt-2 border-t">
          💡 Tip: Điểm càng cao = độ phù hợp càng tốt
        </div>
      )}
    </div>
  );
}
