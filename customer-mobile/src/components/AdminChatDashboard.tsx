'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, Send, Users, Clock, X } from 'lucide-react';

interface Conversation {
  id: string;
  userId: string;
  customerName?: string;
  lastActiveAt: string;
  messageCount: number;
  status: string;
}

interface Message {
  id: string;
  message: string;
  sender: string;
  timestamp: string;
}

export default function AdminChatDashboard() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';

  // Load conversations
  useEffect(() => {
    loadConversations();
    const interval = setInterval(loadConversations, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const loadConversations = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/chat/admin/conversations?status=active`, {
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to load conversations');

      const data = await response.json();
      setConversations(data);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load messages when conversation selected
  useEffect(() => {
    if (!selectedConversation) return;

    loadMessages(selectedConversation.id);
    const interval = setInterval(() => loadMessages(selectedConversation.id), 2000);
    return () => clearInterval(interval);
  }, [selectedConversation]);

  const loadMessages = async (sessionId: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/chat/conversations/${sessionId}/messages`, {
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to load messages');

      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !selectedConversation || isSending) return;

    const messageText = inputMessage.trim();
    setInputMessage('');
    setIsSending(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/chat/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          sessionId: selectedConversation.id,
          message: messageText,
          isAdmin: true,
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');

      const sentMessage = await response.json();
      setMessages(prev => [...prev, sentMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      setInputMessage(messageText);
    } finally {
      setIsSending(false);
    }
  };

  const closeConversation = async (conversationId: string) => {
    try {
      await fetch(`${BACKEND_URL}/api/chat/conversations/${conversationId}/close`, {
        method: 'PATCH',
        credentials: 'include',
      });
      
      setConversations(prev => prev.filter(c => c.id !== conversationId));
      if (selectedConversation?.id === conversationId) {
        setSelectedConversation(null);
        setMessages([]);
      }
    } catch (error) {
      console.error('Error closing conversation:', error);
    }
  };

  return (
    <div className="h-screen flex">
      {/* Sidebar - Conversations List */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-[#1F7A4D]" />
            Live Chat Admin
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {conversations.length} cuộc hội thoại đang hoạt động
          </p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1F7A4D]"></div>
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>Chưa có cuộc hội thoại nào</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedConversation(conv)}
                className={`w-full p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors text-left ${
                  selectedConversation?.id === conv.id ? 'bg-green-50' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {conv.customerName || `Khách hàng #${conv.userId.slice(0, 8)}`}
                    </h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3" />
                      {new Date(conv.lastActiveAt).toLocaleString('vi-VN')}
                    </p>
                  </div>
                  <span className="bg-[#1F7A4D] text-white text-xs px-2 py-1 rounded-full">
                    {conv.messageCount}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="bg-white p-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">
                  {selectedConversation.customerName || `Khách hàng #${selectedConversation.userId.slice(0, 8)}`}
                </h3>
                <p className="text-sm text-gray-500">
                  Hoạt động: {new Date(selectedConversation.lastActiveAt).toLocaleTimeString('vi-VN')}
                </p>
              </div>
              <button
                onClick={() => closeConversation(selectedConversation.id)}
                className="text-gray-500 hover:text-red-600 transition-colors"
                title="Đóng cuộc hội thoại"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      msg.sender === 'admin'
                        ? 'bg-[#1F7A4D] text-white'
                        : 'bg-white text-gray-800 border border-gray-200'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                    <p
                      className={`text-xs mt-1 ${
                        msg.sender === 'admin' ? 'text-green-100' : 'text-gray-400'
                      }`}
                    >
                      {new Date(msg.timestamp).toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="bg-white p-4 border-t border-gray-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Nhập tin nhắn trả lời..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F7A4D] focus:border-transparent"
                  disabled={isSending}
                />
                <button
                  onClick={sendMessage}
                  disabled={!inputMessage.trim() || isSending}
                  className="bg-[#1F7A4D] text-white px-6 py-2 rounded-lg hover:bg-[#16593a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Gửi
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <MessageCircle className="w-16 h-16 mx-auto mb-4" />
              <p>Chọn một cuộc hội thoại để bắt đầu</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
