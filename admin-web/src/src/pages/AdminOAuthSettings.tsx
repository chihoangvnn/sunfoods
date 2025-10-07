import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, MessageCircle, Code, CheckCircle2, XCircle, ExternalLink, Copy, Users, BarChart3, Clock, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

interface ProviderStatus {
  configured: boolean;
  customerCount: number;
  envVars: {
    [key: string]: boolean;
  };
}

interface OAuthStatus {
  providers: {
    google: ProviderStatus;
    facebook: ProviderStatus;
    zalo: ProviderStatus;
    replit: ProviderStatus;
  };
}

interface ProviderStat {
  provider: string;
  count: number;
}

interface RecentLogin {
  provider: string;
  customerName: string;
  customerEmail: string;
  connectedAt: string;
}

interface OAuthStats {
  stats: ProviderStat[];
  recentLogins: RecentLogin[];
  totalOAuthCustomers: number;
}

const PROVIDERS = [
  {
    id: 'google',
    name: 'Google',
    icon: <Mail className="w-6 h-6 text-red-500" />,
    color: 'text-red-500',
    envVars: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'],
    setupUrl: 'https://console.developers.google.com/',
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>,
    color: 'text-blue-600',
    envVars: ['FACEBOOK_APP_ID', 'FACEBOOK_APP_SECRET'],
    setupUrl: 'https://developers.facebook.com/',
  },
  {
    id: 'zalo',
    name: 'Zalo',
    icon: <MessageCircle className="w-6 h-6 text-blue-500" />,
    color: 'text-blue-500',
    envVars: ['ZALO_APP_ID', 'ZALO_APP_SECRET'],
    setupUrl: 'https://developers.zalo.me/',
  },
  {
    id: 'replit',
    name: 'Replit',
    icon: <Code className="w-6 h-6 text-orange-500" />,
    color: 'text-orange-500',
    envVars: ['REPLIT_APP_ID', 'REPLIT_APP_SECRET'],
    setupUrl: 'https://replit.com/account',
  },
];

export default function AdminOAuthSettings() {
  const { toast } = useToast();
  const [setupGuideOpen, setSetupGuideOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<typeof PROVIDERS[0] | null>(null);

  const { data: status, isLoading: loadingStatus, refetch: refetchStatus } = useQuery<OAuthStatus>({
    queryKey: ['admin-oauth-status'],
    queryFn: async () => {
      const res = await fetch('/api/admin/oauth/status', { credentials: 'include' });
      if (!res.ok) throw new Error('Lỗi tải trạng thái OAuth');
      return res.json();
    },
  });

  const { data: stats, isLoading: loadingStats, refetch: refetchStats } = useQuery<OAuthStats>({
    queryKey: ['admin-oauth-stats'],
    queryFn: async () => {
      const res = await fetch('/api/admin/oauth/stats', { credentials: 'include' });
      if (!res.ok) throw new Error('Lỗi tải thống kê OAuth');
      return res.json();
    },
  });

  const handleShowSetupGuide = (providerId: string) => {
    const provider = PROVIDERS.find(p => p.id === providerId);
    if (provider) {
      setSelectedProvider(provider);
      setSetupGuideOpen(true);
    }
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Đã sao chép",
      description: "Đã sao chép vào clipboard",
    });
  };

  const handleRefresh = () => {
    refetchStatus();
    refetchStats();
    toast({
      title: "Làm mới thành công",
      description: "Đã cập nhật dữ liệu mới nhất",
    });
  };

  const getProviderDisplayName = (provider: string): string => {
    const providerMap: { [key: string]: string } = {
      google: 'Google',
      facebook: 'Facebook',
      zalo: 'Zalo',
      replit: 'Replit',
    };
    return providerMap[provider] || provider;
  };

  const getProviderIcon = (provider: string) => {
    const providerObj = PROVIDERS.find(p => p.id === provider);
    return providerObj?.icon || <Users className="w-4 h-4" />;
  };

  if (loadingStatus || loadingStats) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Quản Lý OAuth Providers</h1>
          <p className="text-muted-foreground">
            Cấu hình và theo dõi các nhà cung cấp đăng nhập OAuth
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Làm mới
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {PROVIDERS.map((provider) => {
          const providerStatus = status?.providers[provider.id as keyof OAuthStatus['providers']];
          const isConfigured = providerStatus?.configured || false;
          const customerCount = providerStatus?.customerCount || 0;

          return (
            <Card key={provider.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  {provider.icon}
                  <CardTitle className="text-lg">{provider.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Trạng thái:</span>
                  <Badge variant={isConfigured ? "default" : "destructive"} className="gap-1">
                    {isConfigured ? (
                      <>
                        <CheckCircle2 className="w-3 h-3" />
                        Đã cấu hình
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3" />
                        Chưa cấu hình
                      </>
                    )}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Khách hàng:</span>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="font-semibold">{customerCount}</span>
                  </div>
                </div>

                <div className="pt-2 space-y-2">
                  {provider.envVars.map((envVar) => {
                    const isSet = providerStatus?.envVars[
                      envVar.toLowerCase().replace(/_/g, '') as keyof typeof providerStatus.envVars
                    ] || false;
                    
                    return (
                      <div key={envVar} className="flex items-center justify-between text-xs">
                        <code className="text-muted-foreground">{envVar}</code>
                        {isSet ? (
                          <CheckCircle2 className="w-3 h-3 text-green-500" />
                        ) : (
                          <XCircle className="w-3 h-3 text-red-500" />
                        )}
                      </div>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => handleShowSetupGuide(provider.id)}
                >
                  Hướng dẫn cấu hình
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Thống Kê Sử Dụng
            </CardTitle>
            <CardDescription>
              Tổng số khách hàng: <span className="font-bold text-foreground">{stats?.totalOAuthCustomers || 0}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.stats.map((stat) => {
                const total = stats.stats.reduce((sum, s) => sum + s.count, 0);
                const percentage = total > 0 ? (stat.count / total) * 100 : 0;
                
                return (
                  <div key={stat.provider} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        {getProviderIcon(stat.provider)}
                        <span className="font-medium">{getProviderDisplayName(stat.provider)}</span>
                      </div>
                      <span className="text-muted-foreground">{stat.count}</span>
                    </div>
                    <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              {(!stats?.stats || stats.stats.length === 0) && (
                <Alert>
                  <AlertDescription>Chưa có dữ liệu thống kê</AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Đăng Nhập OAuth Gần Đây
            </CardTitle>
            <CardDescription>10 lượt đăng nhập mới nhất</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.recentLogins && stats.recentLogins.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Provider</TableHead>
                      <TableHead>Khách hàng</TableHead>
                      <TableHead>Thời gian</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.recentLogins.map((login, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getProviderIcon(login.provider)}
                            <span className="text-sm">{getProviderDisplayName(login.provider)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">{login.customerName}</div>
                            {login.customerEmail && (
                              <div className="text-muted-foreground text-xs">{login.customerEmail}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(login.connectedAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Alert>
                  <AlertDescription>Chưa có dữ liệu đăng nhập</AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={setupGuideOpen} onOpenChange={setSetupGuideOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedProvider?.icon}
              Hướng dẫn cấu hình {selectedProvider?.name}
            </DialogTitle>
            <DialogDescription>
              Làm theo các bước sau để cấu hình OAuth với {selectedProvider?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <Alert>
              <AlertDescription>
                <strong>Biến môi trường cần thiết:</strong>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  {selectedProvider?.envVars.map((envVar) => (
                    <li key={envVar}>
                      <code className="text-sm bg-secondary px-2 py-1 rounded">{envVar}</code>
                    </li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <h4 className="font-semibold">Các bước thực hiện:</h4>
              
              {selectedProvider?.id === 'google' && (
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Truy cập <a href={selectedProvider.setupUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">Google Cloud Console <ExternalLink className="w-3 h-3" /></a></li>
                  <li>Tạo project mới hoặc chọn project có sẵn</li>
                  <li>Vào mục "APIs & Services" → "Credentials"</li>
                  <li>Nhấn "Create Credentials" → "OAuth client ID"</li>
                  <li>Chọn "Web application"</li>
                  <li>Thêm Redirect URI:
                    <div className="flex items-center gap-2 mt-1">
                      <code className="bg-secondary px-2 py-1 rounded text-xs flex-1">
                        {window.location.origin}/api/auth/google/callback
                      </code>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => handleCopyToClipboard(`${window.location.origin}/api/auth/google/callback`)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </li>
                  <li>Sao chép Client ID và Client Secret vào biến môi trường</li>
                </ol>
              )}

              {selectedProvider?.id === 'facebook' && (
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Truy cập <a href={selectedProvider.setupUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">Facebook Developers <ExternalLink className="w-3 h-3" /></a></li>
                  <li>Tạo ứng dụng mới hoặc chọn ứng dụng có sẵn</li>
                  <li>Vào "Settings" → "Basic"</li>
                  <li>Sao chép App ID và App Secret</li>
                  <li>Vào mục "Facebook Login" → "Settings"</li>
                  <li>Thêm Valid OAuth Redirect URIs:
                    <div className="flex items-center gap-2 mt-1">
                      <code className="bg-secondary px-2 py-1 rounded text-xs flex-1">
                        {window.location.origin}/api/auth/facebook/callback
                      </code>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => handleCopyToClipboard(`${window.location.origin}/api/auth/facebook/callback`)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </li>
                  <li>Lưu App ID và App Secret vào biến môi trường</li>
                </ol>
              )}

              {selectedProvider?.id === 'zalo' && (
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Truy cập <a href={selectedProvider.setupUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">Zalo Developers <ExternalLink className="w-3 h-3" /></a></li>
                  <li>Đăng ký ứng dụng mới hoặc chọn ứng dụng có sẵn</li>
                  <li>Vào "Thông tin ứng dụng"</li>
                  <li>Sao chép App ID và App Secret Key</li>
                  <li>Thêm Callback URL:
                    <div className="flex items-center gap-2 mt-1">
                      <code className="bg-secondary px-2 py-1 rounded text-xs flex-1">
                        {window.location.origin}/api/auth/zalo/callback
                      </code>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => handleCopyToClipboard(`${window.location.origin}/api/auth/zalo/callback`)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </li>
                  <li>Lưu App ID và App Secret vào biến môi trường</li>
                </ol>
              )}

              {selectedProvider?.id === 'replit' && (
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Truy cập <a href={selectedProvider.setupUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">Replit Account Settings <ExternalLink className="w-3 h-3" /></a></li>
                  <li>Vào mục "OAuth Applications"</li>
                  <li>Tạo ứng dụng OAuth mới</li>
                  <li>Thêm Redirect URI:
                    <div className="flex items-center gap-2 mt-1">
                      <code className="bg-secondary px-2 py-1 rounded text-xs flex-1">
                        {window.location.origin}/api/auth/replit/callback
                      </code>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => handleCopyToClipboard(`${window.location.origin}/api/auth/replit/callback`)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </li>
                  <li>Sao chép Client ID và Client Secret vào biến môi trường</li>
                </ol>
              )}
            </div>

            <Alert>
              <AlertDescription>
                <strong>Lưu ý:</strong> Sau khi thêm biến môi trường, cần khởi động lại ứng dụng để áp dụng thay đổi.
              </AlertDescription>
            </Alert>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSetupGuideOpen(false)}>
                Đóng
              </Button>
              <Button asChild>
                <a href={selectedProvider?.setupUrl} target="_blank" rel="noopener noreferrer">
                  Mở Developer Console
                  <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
