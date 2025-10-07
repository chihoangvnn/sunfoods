import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, TrendingUp, Calendar, Sparkles, Facebook, Instagram, Twitter } from 'lucide-react';
import { Link } from 'wouter';

const PLATFORMS = [
  { value: 'all', label: 'All Platforms', icon: null },
  { value: 'facebook', label: 'Facebook', icon: Facebook },
  { value: 'instagram', label: 'Instagram', icon: Instagram },
  { value: 'twitter', label: 'Twitter', icon: Twitter },
];

const TIMEZONES = [
  { value: 'UTC', label: 'UTC' },
  { value: 'Asia/Ho_Chi_Minh', label: 'Vietnam (GMT+7)' },
  { value: 'America/New_York', label: 'New York (EST)' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (PST)' },
  { value: 'Europe/London', label: 'London (GMT)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
];

const CONFIDENCE_COLORS = {
  high: 'bg-green-100 text-green-800 border-green-300',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  low: 'bg-gray-100 text-gray-800 border-gray-300',
};

export default function BestTimeRecommendations() {
  const [platform, setPlatform] = useState('all');
  const [timezone, setTimezone] = useState('Asia/Ho_Chi_Minh');
  const [daysBack, setDaysBack] = useState('90');

  const { data: recommendations, isLoading: loadingRecs } = useQuery({
    queryKey: ['/api/recommendations/best-times', platform, timezone, daysBack],
    queryFn: async () => {
      const params = new URLSearchParams({
        topN: '10',
        daysBack,
        timezone,
        ...(platform !== 'all' && { platform }),
      });
      const res = await fetch(`/api/recommendations/best-times?${params}`);
      if (!res.ok) throw new Error('Failed to fetch recommendations');
      return res.json();
    },
  });

  const { data: heatmapData, isLoading: loadingHeatmap } = useQuery({
    queryKey: ['/api/recommendations/heatmap', platform, timezone, daysBack],
    queryFn: async () => {
      const params = new URLSearchParams({
        daysBack,
        timezone,
        ...(platform !== 'all' && { platform }),
      });
      const res = await fetch(`/api/recommendations/heatmap?${params}`);
      if (!res.ok) throw new Error('Failed to fetch heatmap');
      return res.json();
    },
  });

  const { data: platformStats } = useQuery({
    queryKey: ['/api/recommendations/platform-stats'],
    queryFn: async () => {
      const res = await fetch('/api/recommendations/platform-stats');
      if (!res.ok) throw new Error('Failed to fetch platform stats');
      return res.json();
    },
  });

  const getHeatmapColor = (score: number) => {
    if (score === 0) return 'bg-gray-50';
    if (score < 20) return 'bg-blue-100';
    if (score < 40) return 'bg-blue-200';
    if (score < 60) return 'bg-blue-300';
    if (score < 80) return 'bg-blue-400';
    return 'bg-blue-500';
  };

  const getDayName = (day: number) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[day];
  };

  const formatHour = (hour: number) => {
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}${ampm}`;
  };

  const PlatformIcon = PLATFORMS.find(p => p.value === platform)?.icon;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-blue-600" />
            Best Time to Post
          </h1>
          <p className="text-gray-600 mt-1">
            AI-powered recommendations based on your historical engagement data
          </p>
        </div>
        <Link href="/post-analytics">
          <Button variant="outline">
            <TrendingUp className="w-4 h-4 mr-2" />
            View Analytics
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-600 mb-2">Platform</div>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PLATFORMS.map(p => (
                  <SelectItem key={p.value} value={p.value}>
                    <div className="flex items-center gap-2">
                      {p.icon && <p.icon className="w-4 h-4" />}
                      {p.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-600 mb-2">Timezone</div>
            <Select value={timezone} onValueChange={setTimezone}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map(tz => (
                  <SelectItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-600 mb-2">Analysis Period</div>
            <Select value={daysBack} onValueChange={setDaysBack}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="60">Last 60 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="180">Last 6 months</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      {platformStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(platformStats.stats || {}).map(([plat, stats]: [string, any]) => (
            <Card key={plat}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium capitalize flex items-center gap-2">
                  {plat === 'facebook' && <Facebook className="w-4 h-4" />}
                  {plat === 'instagram' && <Instagram className="w-4 h-4" />}
                  {plat === 'twitter' && <Twitter className="w-4 h-4" />}
                  {plat}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalPosts}</div>
                <p className="text-xs text-gray-600">
                  Avg {stats.avgEngagementRate.toFixed(1)}% engagement
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Tabs defaultValue="recommendations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="recommendations">Top Times</TabsTrigger>
          <TabsTrigger value="heatmap">Heatmap</TabsTrigger>
        </TabsList>

        <TabsContent value="recommendations" className="space-y-4">
          {loadingRecs ? (
            <Card>
              <CardContent className="p-12 text-center text-gray-500">
                Loading recommendations...
              </CardContent>
            </Card>
          ) : !recommendations?.recommendations?.length ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Sparkles className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Not Enough Data
                </h3>
                <p className="text-gray-600">
                  We need more historical posts to generate recommendations.
                  <br />
                  Keep posting and check back soon!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendations.recommendations.map((rec: any, idx: number) => (
                <Card key={`${rec.platform}-${rec.hour}-${rec.dayOfWeek}`} className="relative">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {idx === 0 && <Sparkles className="w-5 h-5 text-yellow-500" />}
                          <span className="capitalize">{rec.platform}</span>
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {rec.dayName} at {rec.timeLabel}
                        </CardDescription>
                      </div>
                      <Badge className={CONFIDENCE_COLORS[rec.confidence as keyof typeof CONFIDENCE_COLORS]}>
                        {rec.confidence}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Expected Engagement</span>
                        <span className="font-semibold">{rec.engagementScore.toFixed(0)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Based on</span>
                        <span className="font-semibold">{rec.sampleSize} posts</span>
                      </div>
                      <Link href={`/satellites?day=${rec.dayOfWeek}&hour=${rec.hour}&platform=${rec.platform}`}>
                        <Button className="w-full mt-2" size="sm">
                          <Calendar className="w-4 h-4 mr-2" />
                          Schedule Post
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {recommendations?.analyzed && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <p className="text-sm text-blue-800">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Analysis based on {daysBack} days of data in {timezone} timezone
                  {recommendations.analyzed.platform !== 'all' && ` for ${recommendations.analyzed.platform}`}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="heatmap" className="space-y-4">
          {loadingHeatmap ? (
            <Card>
              <CardContent className="p-12 text-center text-gray-500">
                Loading heatmap...
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Engagement Heatmap</CardTitle>
                <CardDescription>
                  Darker colors indicate higher engagement. Hover for details.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <div className="inline-block min-w-full">
                    <div className="flex gap-1">
                      <div className="flex flex-col justify-around py-8">
                        {[0, 1, 2, 3, 4, 5, 6].map(day => (
                          <div
                            key={day}
                            className="text-xs font-medium text-gray-600 h-8 flex items-center"
                          >
                            {getDayName(day)}
                          </div>
                        ))}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          {Array.from({ length: 24 }, (_, hour) => (
                            <div key={hour} className="text-xs text-gray-600 w-8 text-center">
                              {hour % 4 === 0 ? formatHour(hour) : ''}
                            </div>
                          ))}
                        </div>
                        <div className="space-y-1">
                          {heatmapData?.heatmap?.matrix?.map((row: number[], day: number) => (
                            <div key={day} className="flex gap-1">
                              {row.map((score: number, hour: number) => {
                                const count = heatmapData.heatmap.countMatrix[day][hour];
                                return (
                                  <div
                                    key={hour}
                                    className={`w-8 h-8 rounded ${getHeatmapColor(score)} transition-all hover:ring-2 hover:ring-blue-400 cursor-pointer`}
                                    title={`${getDayName(day)} ${formatHour(hour)}\nScore: ${score.toFixed(0)}\nPosts: ${count}`}
                                  />
                                );
                              })}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-4 mt-6">
                  <span className="text-sm text-gray-600">Low</span>
                  <div className="flex gap-1">
                    <div className="w-8 h-4 bg-gray-50 rounded" />
                    <div className="w-8 h-4 bg-blue-100 rounded" />
                    <div className="w-8 h-4 bg-blue-200 rounded" />
                    <div className="w-8 h-4 bg-blue-300 rounded" />
                    <div className="w-8 h-4 bg-blue-400 rounded" />
                    <div className="w-8 h-4 bg-blue-500 rounded" />
                  </div>
                  <span className="text-sm text-gray-600">High</span>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
