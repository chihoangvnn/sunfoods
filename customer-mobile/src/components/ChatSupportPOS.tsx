"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { 
  MessageCircle, 
  Send, 
  User, 
  Clock,
  AlertCircle,
  CheckCircle2
} from "lucide-react";

interface FacebookConversation {
  id: string;
  pageId: string;
  pageName: string;
  participantId: string;
  participantName: string;
  participantAvatar?: string;
  status: string;
  tagIds: string[];
  messageCount: number;
  lastMessageAt: Date;
  lastMessagePreview: string;
  isRead: boolean;
  createdAt: Date;
}

interface FacebookMessage {
  id: number;
  conversationId: string;
  facebookMessageId: string;
  senderId: string;
  senderName: string;
  senderType: 'user' | 'page';
  content: string | null;
  messageType: string;
  timestamp: Date;
  isEcho: boolean;
  isRead: boolean;
}

const formatTime = (date: string | Date) => {
  return new Date(date).toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatDate = (date: string | Date) => {
  const d = new Date(date);
  const today = new Date();
  const isToday = d.toDateString() === today.toDateString();
  
  if (isToday) {
    return formatTime(date);
  }
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit'
  });
};

export function ChatSupportPOS() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedConversation, setSelectedConversation] = useState<FacebookConversation | null>(null);
  const [replyMessage, setReplyMessage] = useState("");

  // Fetch support conversations (conversations with tag="support-request")
  const { data: conversations = [], isLoading: loadingConversations } = useQuery<FacebookConversation[]>({
    queryKey: ['/api/facebook/conversations', { tag: 'support-request' }],
    queryFn: async () => {
      const res = await fetch('/api/facebook/conversations?tag=support-request');
      if (!res.ok) throw new Error('Failed to fetch support conversations');
      return res.json();
    },
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  // Fetch messages for selected conversation
  const { data: messages = [], isLoading: loadingMessages } = useQuery<FacebookMessage[]>({
    queryKey: ['/api/facebook/conversations', selectedConversation?.id, 'messages'],
    queryFn: async () => {
      if (!selectedConversation) return [];
      const res = await fetch(`/api/facebook/conversations/${selectedConversation.id}/messages`);
      if (!res.ok) throw new Error('Failed to fetch messages');
      return res.json();
    },
    enabled: !!selectedConversation,
    refetchInterval: 5000, // Refresh every 5 seconds when viewing conversation
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ recipientId, message, pageId }: { recipientId: string; message: string; pageId: string }) => {
      const res = await fetch('/api/facebook/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientId,
          message,
          pageId
        }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to send message');
      }
      return res.json();
    },
    onSuccess: () => {
      setReplyMessage("");
      queryClient.invalidateQueries({ queryKey: ['/api/facebook/conversations'] });
      toast({
        title: "✅ Đã gửi tin nhắn",
        description: "Tin nhắn đã được gửi qua Facebook Messenger"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "❌ Lỗi gửi tin nhắn",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleSendMessage = () => {
    if (!selectedConversation || !replyMessage.trim()) return;
    
    sendMessageMutation.mutate({
      recipientId: selectedConversation.participantId,
      message: replyMessage.trim(),
      pageId: selectedConversation.pageId
    });
  };

  const unreadCount = conversations.filter(c => !c.isRead).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-200px)]">
      {/* Conversations List */}
      <Card className="md:col-span-1">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Chat hỗ trợ
            </CardTitle>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="rounded-full">
                {unreadCount}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-280px)]">
            {loadingConversations ? (
              <div className="p-4 text-center text-muted-foreground">Đang tải...</div>
            ) : conversations.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Chưa có yêu cầu hỗ trợ</p>
              </div>
            ) : (
              <div className="divide-y">
                {conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv)}
                    className={`w-full p-4 text-left hover:bg-accent transition-colors ${
                      selectedConversation?.id === conv.id ? 'bg-accent' : ''
                    } ${!conv.isRead ? 'bg-blue-50' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        {conv.participantAvatar ? (
                          <img 
                            src={conv.participantAvatar} 
                            alt={conv.participantName}
                            className="h-10 w-10 rounded-full"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold truncate">
                            {conv.participantName}
                          </span>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatDate(conv.lastMessageAt)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate mt-1">
                          {conv.lastMessagePreview}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            🆘 Cần hỗ trợ
                          </Badge>
                          {!conv.isRead && (
                            <Badge variant="destructive" className="text-xs">
                              Mới
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Messages View */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {selectedConversation ? (
              <>
                <User className="h-5 w-5" />
                {selectedConversation.participantName}
                <Badge variant="outline" className="ml-auto">
                  {selectedConversation.pageName}
                </Badge>
              </>
            ) : (
              <>
                <MessageCircle className="h-5 w-5" />
                Chọn cuộc hội thoại
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col h-[calc(100vh-320px)]">
          {!selectedConversation ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <p>Chọn một cuộc hội thoại để xem tin nhắn</p>
              </div>
            </div>
          ) : (
            <>
              {/* Messages List */}
              <ScrollArea className="flex-1 mb-4">
                {loadingMessages ? (
                  <div className="text-center py-4 text-muted-foreground">Đang tải tin nhắn...</div>
                ) : (
                  <div className="space-y-3">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.senderType === 'page' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[70%] ${
                          msg.senderType === 'page' 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted'
                        } rounded-lg p-3`}>
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs opacity-70">
                              {formatTime(msg.timestamp)}
                            </span>
                            {msg.senderType === 'page' && (
                              <CheckCircle2 className="h-3 w-3 opacity-70" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>

              {/* Reply Input */}
              <div className="flex gap-2 border-t pt-4">
                <Input
                  placeholder="Nhập tin nhắn trả lời..."
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  disabled={sendMessageMutation.isPending}
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={!replyMessage.trim() || sendMessageMutation.isPending}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
