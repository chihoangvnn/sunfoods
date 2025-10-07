import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  MessageSquare, 
  User, 
  Clock, 
  ChevronDown, 
  ChevronRight, 
  Search,
  Star,
  Filter,
  MessageCircle
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

interface ConversationMessage {
  id: string;
  content: string;
  senderType: 'user' | 'bot';
  senderName?: string;
  messageType: string;
  timestamp: string;
}

interface Conversation {
  id: string;
  sessionId: string;
  customerId?: string;
  customerName?: string;
  customerAvatar?: string;
  isVIP?: boolean;
  status: 'active' | 'closed';
  messages: ConversationMessage[];
  createdAt: string;
  updatedAt: string;
  lastMessage?: string;
  unreadCount?: number;
}

const fetchConversations = async (): Promise<Conversation[]> => {
  const response = await fetch('/api/rasa/conversations');
  if (!response.ok) {
    throw new Error('Failed to fetch conversations');
  }
  const data = await response.json();
  return data.data || [];
};

const ConversationCard: React.FC<{
  conversation: Conversation;
  isExpanded: boolean;
  onToggleExpanded: () => void;
}> = ({ conversation, isExpanded, onToggleExpanded }) => {
  const lastMessage = conversation.messages?.[conversation.messages.length - 1];
  const userMessages = conversation.messages?.filter(m => m.senderType === 'user') || [];
  const previewMessage = lastMessage?.content || 'Chưa có tin nhắn';

  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardHeader 
        className="pb-3 cursor-pointer hover:bg-gray-50"
        onClick={onToggleExpanded}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              {conversation.customerAvatar ? (
                <img 
                  src={conversation.customerAvatar} 
                  alt={conversation.customerName || 'Khách hàng'}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
              )}
              {conversation.status === 'active' && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="font-medium text-sm truncate">
                  {conversation.customerName || `Khách #${conversation.sessionId.slice(-6)}`}
                </h3>
                {conversation.isVIP && (
                  <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                    <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
                    VIP
                  </Badge>
                )}
              </div>
              <p className="text-xs text-gray-500 truncate mt-1">
                {previewMessage}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="text-right">
              <p className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(conversation.updatedAt), { 
                  addSuffix: true, 
                  locale: vi 
                })}
              </p>
              <div className="flex items-center justify-end space-x-1 mt-1">
                <MessageCircle className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-500">
                  {userMessages.length}
                </span>
              </div>
            </div>
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-400" />
            )}
          </div>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="pt-0 border-t bg-gray-50">
          <div className="space-y-3 max-h-96 overflow-y-auto">
            <div className="grid grid-cols-2 gap-4 text-xs text-gray-600 mb-3">
              <div>
                <span className="font-medium">Session ID:</span> {conversation.sessionId}
              </div>
              <div>
                <span className="font-medium">Trạng thái:</span>{' '}
                <Badge variant={conversation.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                  {conversation.status === 'active' ? 'Đang hoạt động' : 'Đã đóng'}
                </Badge>
              </div>
            </div>
            
            {conversation.messages && conversation.messages.length > 0 ? (
              <div className="space-y-2">
                {conversation.messages.map((message, index) => (
                  <div
                    key={message.id || index}
                    className={`flex ${message.senderType === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-2 rounded-lg text-xs ${
                        message.senderType === 'user'
                          ? 'bg-blue-500 text-white'
                          : 'bg-white border'
                      }`}
                    >
                      <p>{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.senderType === 'user' ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {formatDistanceToNow(new Date(message.timestamp), { 
                          addSuffix: true, 
                          locale: vi 
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 text-sm py-4">
                Chưa có tin nhắn nào trong cuộc hội thoại này
              </p>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default function ChatLogs() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'closed' | 'vip'>('all');
  const [expandedConversations, setExpandedConversations] = useState<Set<string>>(new Set());

  const { data: conversations, isLoading, error } = useQuery({
    queryKey: ['conversations'],
    queryFn: fetchConversations,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const handleToggleExpanded = (conversationId: string) => {
    setExpandedConversations(prev => {
      const newSet = new Set(prev);
      if (newSet.has(conversationId)) {
        newSet.delete(conversationId);
      } else {
        newSet.add(conversationId);
      }
      return newSet;
    });
  };

  const filteredConversations = conversations?.filter(conversation => {
    // Search filter
    const matchesSearch = !searchTerm || 
      (conversation.customerName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      conversation.sessionId.includes(searchTerm) ||
      conversation.messages?.some(msg => 
        msg.content.toLowerCase().includes(searchTerm.toLowerCase())
      );

    // Status filter
    const matchesStatus = 
      statusFilter === 'all' ||
      (statusFilter === 'vip' && conversation.isVIP) ||
      conversation.status === statusFilter;

    return matchesSearch && matchesStatus;
  }) || [];

  // Sort conversations by most recent activity
  const sortedConversations = filteredConversations.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold">Chat Logs</h1>
          <p className="text-muted-foreground">Quản lý cuộc hội thoại khách hàng</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Đang tải cuộc hội thoại...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold">Chat Logs</h1>
          <p className="text-muted-foreground">Quản lý cuộc hội thoại khách hàng</p>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <p className="text-red-600 font-medium">Không thể tải cuộc hội thoại</p>
              <p className="text-gray-500 mt-1">Vui lòng thử lại sau</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Chat Logs</h1>
        <p className="text-muted-foreground">
          Quản lý và theo dõi cuộc hội thoại khách hàng
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng cuộc hội thoại</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversations?.length || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đang hoạt động</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {conversations?.filter(c => c.status === 'active').length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Khách VIP</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {conversations?.filter(c => c.isVIP).length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hôm nay</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {conversations?.filter(c => {
                const today = new Date();
                const convDate = new Date(c.createdAt);
                return convDate.toDateString() === today.toDateString();
              }).length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Tìm theo tên khách hàng, session ID hoặc nội dung..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="active">Đang hoạt động</SelectItem>
            <SelectItem value="closed">Đã đóng</SelectItem>
            <SelectItem value="vip">Khách VIP</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Conversations List */}
      <div className="space-y-3">
        {sortedConversations.length > 0 ? (
          sortedConversations.map((conversation) => (
            <ConversationCard
              key={conversation.id}
              conversation={conversation}
              isExpanded={expandedConversations.has(conversation.id)}
              onToggleExpanded={() => handleToggleExpanded(conversation.id)}
            />
          ))
        ) : (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Không tìm thấy cuộc hội thoại nào phù hợp' 
                    : 'Chưa có cuộc hội thoại nào'}
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  {searchTerm || statusFilter !== 'all'
                    ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
                    : 'Cuộc hội thoại sẽ xuất hiện ở đây khi khách hàng bắt đầu chat'}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}