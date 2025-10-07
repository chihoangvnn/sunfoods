import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

interface UnassignedPage {
  id: string;
  name: string;
  accountId: string;
  connected: boolean;
  followers: number;
  createdAt: string;
}

interface FacebookApp {
  id: string;
  appName: string;
  appId: string;
  environment: string;
}

export const UnassignedPagesManager: React.FC = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedApps, setSelectedApps] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { data: unassignedData, isLoading: loadingPages } = useQuery<{ total: number; pages: UnassignedPage[] }>({
    queryKey: ['unassigned-pages'],
    queryFn: async () => {
      const response = await fetch('/api/facebook-apps/unassigned-pages');
      if (!response.ok) throw new Error('Failed to fetch unassigned pages');
      return response.json();
    }
  });

  const { data: appsData } = useQuery<FacebookApp[]>({
    queryKey: ['facebook-apps'],
    queryFn: async () => {
      const response = await fetch('/api/facebook-apps');
      if (!response.ok) throw new Error('Failed to fetch apps');
      return response.json();
    }
  });

  const assignMutation = useMutation({
    mutationFn: async ({ accountId, facebookAppId }: { accountId: string; facebookAppId: string }) => {
      const response = await fetch(`/api/social-accounts/${accountId}/assign-app`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ facebookAppId })
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to assign page');
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['unassigned-pages'] });
      queryClient.invalidateQueries({ queryKey: ['facebook-apps'] });
      setSuccessMessage(`✅ ${data.pageName} đã được gán vào ${data.appName}`);
      setTimeout(() => setSuccessMessage(null), 5000);
      toast({
        title: 'Gán thành công!',
        description: `${data.pageName} đã được gán vào ${data.appName}`,
        variant: 'default'
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Lỗi gán page',
        description: error.message || 'Không thể gán page vào App. Vui lòng thử lại.',
        variant: 'destructive'
      });
    }
  });

  const handleAssign = (pageId: string, pageName: string) => {
    const appId = selectedApps[pageId];
    if (!appId) {
      alert('Vui lòng chọn App trước khi gán');
      return;
    }
    assignMutation.mutate({ accountId: pageId, facebookAppId: appId });
  };

  if (loadingPages) {
    return (
      <Card className="mb-6">
        <CardContent className="py-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
          <p className="mt-2 text-sm text-gray-500">Đang tải...</p>
        </CardContent>
      </Card>
    );
  }

  if (!unassignedData?.pages || unassignedData.pages.length === 0) {
    return null;
  }

  return (
    <Card className="mb-6 border-amber-200 bg-amber-50/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-amber-900 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Fanpages Chưa Gán App
            </CardTitle>
            <CardDescription className="text-amber-700">
              {unassignedData.total} fanpage{unassignedData.total > 1 ? 's' : ''} chưa được gán vào App nào. 
              Hãy chọn App để quản lý webhook và bot configuration.
            </CardDescription>
          </div>
          <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
            {unassignedData.total} chưa gán
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {successMessage && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-900">Thành công!</AlertTitle>
            <AlertDescription className="text-green-700">{successMessage}</AlertDescription>
          </Alert>
        )}
        
        {unassignedData.pages.map((page) => (
          <div key={page.id} className="flex items-center gap-3 p-4 bg-white rounded-lg border border-amber-200">
            <div className="flex-1">
              <div className="font-medium text-gray-900">{page.name}</div>
              <div className="text-sm text-gray-500">
                {page.followers.toLocaleString()} followers
                {page.connected && <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">Connected</Badge>}
              </div>
            </div>
            
            <Select
              value={selectedApps[page.id] || ''}
              onValueChange={(value) => setSelectedApps(prev => ({ ...prev, [page.id]: value }))}
            >
              <SelectTrigger className="w-[280px]">
                <SelectValue placeholder="Chọn Facebook App..." />
              </SelectTrigger>
              <SelectContent>
                {appsData?.map((app) => (
                  <SelectItem key={app.id} value={app.id}>
                    {app.appName} ({app.environment})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button
              onClick={() => handleAssign(page.id, page.name)}
              disabled={!selectedApps[page.id] || assignMutation.isPending}
              size="sm"
              className="bg-amber-600 hover:bg-amber-700"
            >
              {assignMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Đang gán...
                </>
              ) : (
                'Gán vào App'
              )}
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
