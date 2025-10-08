import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  TrendingUp, Heart, MessageCircle, Share2, Eye, 
  BarChart as BarChartIcon, Calendar, Filter, RefreshCw, Target
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface PostAnalytics {
  likes?: number;
  comments?: number;
  shares?: number;
  reach?: number;
  impressions?: number;
  engagementRate?: number;
  lastFetched?: string;
}

interface Post {
  id: string;
  platform: string;
  caption: string;
  publishedAt: string;
  platformUrl: string;
  analytics: PostAnalytics;
}

interface AnalyticsSummary {
  summary: {
    totalPosts: number;
    totalLikes: number;
    totalComments: number;
    totalShares: number;
    totalReach: number;
    totalImpressions: number;
    avgEngagementRate: number;
  };
  platformBreakdown: {
    [platform: string]: {
      count: number;
      likes: number;
      comments: number;
      shares: number;
    };
  };
  dateRange: {
    from: string | null;
    to: string | null;
  };
}

const COLORS = {
  facebook: '#1877F2',
  instagram: '#E4405F',
  twitter: '#1DA1F2',
  tiktok: '#000000',
};

const platformIcons = {
  facebook: '📘',
  instagram: '📷',
  twitter: '🐦',
  tiktok: '🎵',
};

export default function PostPerformanceAnalytics() {
  const [dateFilter, setDateFilter] = useState<string>('7d');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('publishedAt');

  const getDateRange = () => {
    const now = new Date();
    const ranges: { [key: string]: { from: Date; to: Date } } = {
      '7d': { from: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), to: now },
      '30d': { from: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), to: now },
      '90d': { from: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000), to: now },
    };
    return ranges[dateFilter] || ranges['7d'];
  };

  const { data: summary, isLoading: summaryLoading, refetch: refetchSummary } = useQuery<AnalyticsSummary>({
    queryKey: ['analytics-summary', platformFilter, dateFilter],
    queryFn: async () => {
      const { from, to } = getDateRange();
      const params = new URLSearchParams({
        ...(platformFilter !== 'all' && { platform: platformFilter }),
        dateFrom: from.toISOString(),
        dateTo: to.toISOString(),
      });
      const response = await fetch(`/api/analytics/posts/summary?${params}`);
      if (!response.ok) throw new Error('Failed to fetch analytics summary');
      return response.json();
    },
  });

  const { data: topPosts, isLoading: postsLoading, refetch: refetchPosts } = useQuery<{ posts: Post[] }>({
    queryKey: ['top-posts', platformFilter, sortBy, dateFilter],
    queryFn: async () => {
      const { from, to } = getDateRange();
      const params = new URLSearchParams({
        status: 'posted',
        ...(platformFilter !== 'all' && { platform: platformFilter }),
        sortBy,
        sortOrder: 'desc',
        limit: '10',
        dateFrom: from.toISOString(),
        dateTo: to.toISOString(),
      });
      const response = await fetch(`/api/analytics/posts/performance?${params}`);
      if (!response.ok) throw new Error('Failed to fetch top posts');
      return response.json();
    },
  });

  const { data: timelinePosts, isLoading: timelineLoading, refetch: refetchTimeline } = useQuery<{ posts: Post[] }>({
    queryKey: ['timeline-posts', platformFilter, dateFilter],
    queryFn: async () => {
      const { from, to } = getDateRange();
      const params = new URLSearchParams({
        status: 'posted',
        ...(platformFilter !== 'all' && { platform: platformFilter }),
        sortBy: 'publishedAt',
        sortOrder: 'asc',
        limit: '1000',
        dateFrom: from.toISOString(),
        dateTo: to.toISOString(),
      });
      const response = await fetch(`/api/analytics/posts/performance?${params}`);
      if (!response.ok) throw new Error('Failed to fetch timeline posts');
      return response.json();
    },
  });

  const handleRefresh = () => {
    refetchSummary();
    refetchPosts();
    refetchTimeline();
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatEngagementRate = (rate: number) => {
    return `${(rate * 100).toFixed(2)}%`;
  };

  const platformData = summary?.platformBreakdown 
    ? Object.entries(summary.platformBreakdown).map(([platform, data]) => ({
        name: platform,
        posts: data.count,
        likes: data.likes,
        comments: data.comments,
        shares: data.shares,
      }))
    : [];

  const timelineData = (() => {
    if (!timelinePosts?.posts || timelinePosts.posts.length === 0) return [];

    const dailyData: { [date: string]: { likes: number; comments: number; shares: number; reach: number; postCount: number } } = {};

    timelinePosts.posts.forEach(post => {
      if (!post.publishedAt) return;

      const date = new Date(post.publishedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });

      if (!dailyData[date]) {
        dailyData[date] = { likes: 0, comments: 0, shares: 0, reach: 0, postCount: 0 };
      }

      dailyData[date].likes += post.analytics.likes || 0;
      dailyData[date].comments += post.analytics.comments || 0;
      dailyData[date].shares += post.analytics.shares || 0;
      dailyData[date].reach += post.analytics.reach || 0;
      dailyData[date].postCount += 1;
    });

    return Object.entries(dailyData).map(([date, data]) => ({
      date,
      likes: data.likes,
      comments: data.comments,
      shares: data.shares,
      reach: data.reach,
      engagement: data.likes + data.comments + data.shares,
      avgEngagement: Math.round((data.likes + data.comments + data.shares) / data.postCount),
    }));
  })();

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Post Performance Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Track engagement metrics across Facebook, Instagram, and Twitter
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="flex gap-4 items-center">
        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger className="w-[180px]">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Date range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>

        <Select value={platformFilter} onValueChange={setPlatformFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Platform" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Platforms</SelectItem>
            <SelectItem value="facebook">Facebook</SelectItem>
            <SelectItem value="instagram">Instagram</SelectItem>
            <SelectItem value="twitter">Twitter</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {summaryLoading ? (
        <div className="text-center py-12">Loading analytics...</div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
                <BarChartIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary?.summary.totalPosts || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Published in selected period
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Reach</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatNumber(summary?.summary.totalReach || 0)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Unique users reached
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Engagement</CardTitle>
                <Heart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatNumber(
                    (summary?.summary.totalLikes || 0) +
                    (summary?.summary.totalComments || 0) +
                    (summary?.summary.totalShares || 0)
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Likes, comments & shares
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Engagement Rate</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatEngagementRate(summary?.summary.avgEngagementRate || 0)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Engagement per reach
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Engagement Trends</CardTitle>
            </CardHeader>
            <CardContent>
              {timelineLoading ? (
                <div className="text-center py-12">Loading timeline...</div>
              ) : timelineData.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={timelineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="likes" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      name="Likes"
                      dot={{ r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="comments" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      name="Comments"
                      dot={{ r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="shares" 
                      stroke="#f59e0b" 
                      strokeWidth={2}
                      name="Shares"
                      dot={{ r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="reach" 
                      stroke="#8b5cf6" 
                      strokeWidth={2}
                      name="Reach"
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No engagement data available for selected period
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Platform Performance</CardTitle>
              </CardHeader>
              <CardContent>
                {platformData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={platformData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="likes" fill="#3b82f6" name="Likes" />
                      <Bar dataKey="comments" fill="#10b981" name="Comments" />
                      <Bar dataKey="shares" fill="#f59e0b" name="Shares" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    No data available for selected period
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Platform Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                {platformData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={platformData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="posts"
                      >
                        {platformData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={COLORS[entry.name as keyof typeof COLORS] || '#8884d8'} 
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    No data available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Top Performing Posts</CardTitle>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="publishedAt">Latest First</SelectItem>
                  <SelectItem value="engagementRate">Engagement Rate</SelectItem>
                  <SelectItem value="reach">Reach</SelectItem>
                  <SelectItem value="likes">Likes</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              {postsLoading ? (
                <div className="text-center py-6">Loading posts...</div>
              ) : topPosts?.posts && topPosts.posts.length > 0 ? (
                <div className="space-y-4">
                  {topPosts.posts.map((post) => (
                    <div
                      key={post.id}
                      className="flex items-start gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="text-2xl">{platformIcons[post.platform as keyof typeof platformIcons]}</div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium line-clamp-2">{post.caption}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(post.publishedAt).toLocaleDateString('vi-VN', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                          <Badge variant="outline" className="ml-2">
                            {post.platform}
                          </Badge>
                        </div>
                        
                        <div className="flex gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Heart className="h-4 w-4 text-red-500" />
                            <span>{formatNumber(post.analytics.likes || 0)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="h-4 w-4 text-blue-500" />
                            <span>{formatNumber(post.analytics.comments || 0)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Share2 className="h-4 w-4 text-green-500" />
                            <span>{formatNumber(post.analytics.shares || 0)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4 text-purple-500" />
                            <span>{formatNumber(post.analytics.reach || 0)}</span>
                          </div>
                          {post.analytics.engagementRate !== undefined && (
                            <div className="flex items-center gap-1">
                              <TrendingUp className="h-4 w-4 text-orange-500" />
                              <span>{formatEngagementRate(post.analytics.engagementRate)}</span>
                            </div>
                          )}
                        </div>

                        {post.platformUrl && (
                          <a
                            href={post.platformUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline"
                          >
                            View on {post.platform}
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No posts found. Schedule and publish posts to see analytics.
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
