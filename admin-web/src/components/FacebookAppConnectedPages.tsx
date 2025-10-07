import React, { useState } from "react";
import { useLocation } from "wouter";
import { 
  MessageCircle, 
  Settings, 
  ExternalLink,
  Activity,
  Users,
  Trash2,
  ChevronDown,
  ChevronRight,
  Facebook,
  Calendar,
  AlertCircle,
  Bot
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { FanpageBotConfigDialog } from "./FanpageBotConfigDialog";

interface ConnectedPage {
  id: string;
  name: string;
  accountId: string;
  connected: boolean;
  followers?: number;
  engagement?: string;
  lastPost?: string;
  lastSync?: string;
  isActive: boolean;
  tokenExpiresAt?: string;
  botConfig?: {
    enabled?: boolean;
    autoReply?: boolean;
    rasaUrl?: string;
    welcomeMessage?: string;
  };
  createdAt: string;
  updatedAt?: string;
}

interface FacebookAppConnectedPagesProps {
  appId: string;
  appName: string;
}

export function FacebookAppConnectedPages({ appId, appName }: FacebookAppConnectedPagesProps) {
  const [location, navigate] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [botConfigPage, setBotConfigPage] = useState<ConnectedPage | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch connected pages
  const { data: pagesData, isLoading } = useQuery<{ appId: string; total: number; pages: ConnectedPage[] }>({
    queryKey: ["/api/facebook-apps", appId, "connected-pages"],
    enabled: isOpen, // Only fetch when expanded
  });

  const pages: ConnectedPage[] = pagesData?.pages || [];

  // Disconnect page mutation
  const disconnectMutation = useMutation({
    mutationFn: async (pageId: string) => {
      const response = await fetch(`/api/facebook/disconnect/${pageId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to disconnect page');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/facebook-apps", appId, "connected-pages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/social-accounts"] });
      toast({
        title: "Đã ngắt kết nối",
        description: "Fanpage đã được ngắt kết nối thành công",
      });
    },
    onError: () => {
      toast({
        title: "Lỗi",
        description: "Không thể ngắt kết nối fanpage",
        variant: "destructive",
      });
    },
  });

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "Chưa có";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    
    return date.toLocaleDateString('vi-VN');
  };

  const isTokenExpired = (tokenExpiresAt?: string) => {
    if (!tokenExpiresAt) return false;
    return new Date(tokenExpiresAt) < new Date();
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
      <CollapsibleTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-md transition-colors"
        >
          {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          <Facebook className="h-4 w-4" />
          <span>Connected Pages</span>
          <Badge variant="secondary" className="ml-1">
            {pages.length}
          </Badge>
        </Button>
      </CollapsibleTrigger>
      
      <CollapsibleContent className="mt-3 border-l-2 border-blue-200 pl-4 ml-2">
        {isLoading ? (
          <div className="py-4 text-sm text-gray-500">Đang tải...</div>
        ) : pages.length === 0 ? (
          <div className="py-4 text-sm text-gray-500">
            Chưa có fanpage nào kết nối qua App này
          </div>
        ) : (
          <div className="space-y-2">
            {pages.map((page) => {
              const tokenExpired = isTokenExpired(page.tokenExpiresAt);
              
              return (
                <div
                  key={page.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-sm truncate">{page.name}</h4>
                      {!page.connected && (
                        <Badge variant="destructive" className="text-xs">
                          Ngắt kết nối
                        </Badge>
                      )}
                      {tokenExpired && (
                        <Badge variant="outline" className="text-xs border-orange-300 text-orange-600">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Token hết hạn
                        </Badge>
                      )}
                      {page.botConfig?.enabled && (
                        <Badge variant="outline" className="text-xs border-cyan-300 text-cyan-600">
                          🤖 Bot
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                      {page.followers !== undefined && (
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {page.followers.toLocaleString()}
                        </span>
                      )}
                      {page.lastSync && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(page.lastSync)}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setBotConfigPage(page)}
                      className="text-xs text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50"
                    >
                      <Bot className="h-3 w-3 mr-1" />
                      Bot Config
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50">
                          <Trash2 className="h-3 w-3 mr-1" />
                          Ngắt kết nối
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Xác nhận ngắt kết nối</AlertDialogTitle>
                          <AlertDialogDescription>
                            Bạn có chắc muốn ngắt kết nối fanpage "{page.name}"? <br />
                            Thao tác này sẽ xóa access token và dừng tất cả webhook.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Hủy</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => disconnectMutation.mutate(page.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Ngắt kết nối
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CollapsibleContent>
      
      {/* Bot Config Dialog */}
      {botConfigPage && (
        <FanpageBotConfigDialog
          account={botConfigPage as any}
          open={!!botConfigPage}
          onOpenChange={(open) => !open && setBotConfigPage(null)}
        />
      )}
    </Collapsible>
  );
}
