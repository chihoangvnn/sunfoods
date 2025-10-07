import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mail, Facebook, MessageCircle, Code, CheckCircle, Link, Unlink, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

interface OAuthConnection {
  id: string;
  provider: string;
  email: string | null;
  isPrimary: boolean;
  profileData: any;
  connectedAt: string;
}

interface ConnectionsResponse {
  customerId: string;
  connections: OAuthConnection[];
  primaryProvider: string | null;
}

export default function LinkedAccounts() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: connectionData, isLoading } = useQuery<ConnectionsResponse>({
    queryKey: ['oauth-connections'],
    queryFn: async () => {
      const res = await fetch('/api/auth/connections', {
        credentials: 'include'
      });
      if (!res.ok) {
        throw new Error('Không thể tải danh sách kết nối');
      }
      return res.json();
    }
  });
  
  const unlinkMutation = useMutation({
    mutationFn: async (provider: string) => {
      const res = await fetch(`/api/auth/unlink/${provider}`, { 
        method: 'POST',
        credentials: 'include'
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Không thể hủy liên kết');
      }
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: '✅ Thành công',
        description: data.message || 'Đã hủy liên kết thành công',
      });
      queryClient.invalidateQueries({ queryKey: ['oauth-connections'] });
    },
    onError: (error: Error) => {
      toast({
        title: '❌ Lỗi',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
  
  const setPrimaryMutation = useMutation({
    mutationFn: async (provider: string) => {
      const res = await fetch(`/api/auth/set-primary/${provider}`, { 
        method: 'POST',
        credentials: 'include'
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Không thể đặt phương thức đăng nhập chính');
      }
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: '✅ Thành công',
        description: data.message || 'Đã đặt phương thức đăng nhập chính',
      });
      queryClient.invalidateQueries({ queryKey: ['oauth-connections'] });
    },
    onError: (error: Error) => {
      toast({
        title: '❌ Lỗi',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
  
  const providers: Record<string, { name: string; icon: any; color: string }> = {
    google: { name: 'Google', icon: Mail, color: 'text-red-500' },
    facebook: { name: 'Facebook', icon: Facebook, color: 'text-blue-600' },
    zalo: { name: 'Zalo', icon: MessageCircle, color: 'text-blue-500' },
    replit: { name: 'Replit', icon: Code, color: 'text-orange-500' }
  };
  
  const connectedProviders = connectionData?.connections || [];
  const availableProviders = Object.keys(providers).filter(
    p => !connectedProviders.find(c => c.provider === p)
  );

  const handleUnlink = (provider: string, providerName: string) => {
    if (connectedProviders.length <= 1) {
      toast({
        title: '⚠️ Cảnh báo',
        description: 'Không thể xóa phương thức đăng nhập duy nhất! Vui lòng liên kết thêm phương thức khác trước.',
        variant: 'destructive',
      });
      return;
    }
    
    const connection = connectedProviders.find(c => c.provider === provider);
    if (connection?.isPrimary && connectedProviders.length > 1) {
      toast({
        title: '⚠️ Cảnh báo',
        description: 'Không thể xóa phương thức đăng nhập chính. Vui lòng đặt phương thức khác làm chính trước.',
        variant: 'destructive',
      });
      return;
    }
    
    if (confirm(`Xác nhận hủy liên kết ${providerName}?`)) {
      unlinkMutation.mutate(provider);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Tài Khoản Liên Kết
        </h1>
        <p className="text-gray-600 mt-2">Quản lý các phương thức đăng nhập của bạn</p>
      </div>
      
      {connectionData?.primaryProvider && (
        <Alert className="mb-6 bg-blue-50 border-blue-200">
          <CheckCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription>
            Phương thức đăng nhập chính hiện tại: <strong>{providers[connectionData.primaryProvider]?.name || connectionData.primaryProvider}</strong>
          </AlertDescription>
        </Alert>
      )}
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          Đã Liên Kết
        </h2>
        {connectedProviders.length === 0 ? (
          <Alert className="bg-gray-50 border-gray-200">
            <AlertCircle className="h-4 w-4 text-gray-600" />
            <AlertDescription className="text-gray-600">
              Chưa có kết nối nào
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            {connectedProviders.map(conn => {
              const Provider = providers[conn.provider];
              if (!Provider) return null;
              
              return (
                <Card key={conn.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="flex flex-col md:flex-row md:items-center justify-between p-4 gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-full bg-gray-100`}>
                        <Provider.icon className={`w-6 h-6 ${Provider.color}`} />
                      </div>
                      <div>
                        <div className="font-medium flex items-center gap-2 flex-wrap">
                          <span className="text-lg">{Provider.name}</span>
                          {conn.isPrimary && (
                            <Badge variant="default" className="bg-blue-600 text-white">Chính</Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">{conn.email || 'Không có email'}</div>
                        <div className="text-xs text-gray-400">
                          Kết nối vào {new Date(conn.connectedAt).toLocaleDateString('vi-VN')}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {!conn.isPrimary && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setPrimaryMutation.mutate(conn.provider)}
                          disabled={setPrimaryMutation.isPending}
                          className="hover:bg-blue-50 hover:border-blue-300"
                        >
                          Đặt làm chính
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleUnlink(conn.provider, Provider.name)}
                        disabled={unlinkMutation.isPending}
                        className="gap-1"
                      >
                        <Unlink className="w-4 h-4" />
                        Hủy liên kết
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
      
      {availableProviders.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Link className="w-5 h-5 text-purple-600" />
            Liên Kết Thêm
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableProviders.map(provider => {
              const Provider = providers[provider];
              if (!Provider) return null;
              
              return (
                <Card key={provider} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-gray-100">
                        <Provider.icon className={`w-6 h-6 ${Provider.color}`} />
                      </div>
                      <span className="font-medium text-lg">{Provider.name}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1 hover:bg-purple-50 hover:border-purple-300"
                      onClick={() => {
                        const urls: Record<string, string> = {
                          google: '/api/auth/google',
                          facebook: '/api/auth/facebook-login',
                          zalo: '/api/auth/zalo',
                          replit: '/api/auth/replit'
                        };
                        window.location.href = urls[provider];
                      }}
                    >
                      <Link className="w-4 h-4" />
                      Liên kết
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
