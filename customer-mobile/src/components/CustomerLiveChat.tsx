'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Send } from 'lucide-react';

interface Message {
  id: string;
  message: string;
  sender: string;
  timestamp: string;
  isBot: boolean;
}

interface CustomerLiveChatProps {
  customerId: string;
  onClose: () => void;
}

export default function CustomerLiveChat({ customerId, onClose }: CustomerLiveChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize conversation session
  useEffect(() => {
    const initSession = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/chat/conversations`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ customerId }),
        });

        if (!response.ok) throw new Error('Failed to create session');

        const session = await response.json();
        setSessionId(session.id);
        
        // Load initial messages
        await loadMessages(session.id);
      } catch (error) {
        console.error('Error initializing chat session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initSession();
  }, [customerId]);

  // Load messages
  const loadMessages = async (sid: string, since?: string) => {
    try {
      const url = new URL(`${BACKEND_URL}/api/chat/conversations/${sid}/messages`);
      if (since) url.searchParams.append('since', since);

      const response = await fetch(url.toString(), {
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to load messages');

      const newMessages = await response.json();
      if (newMessages.length > 0) {
        setMessages(prev => [...prev, ...newMessages]);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  // Start polling for new messages
  useEffect(() => {
    if (!sessionId) return;

    // Poll every 2 seconds for new messages
    pollingIntervalRef.current = setInterval(async () => {
      const lastMessage = messages[messages.length - 1];
      const since = lastMessage?.timestamp;
      
      try {
        const url = new URL(`${BACKEND_URL}/api/chat/conversations/${sessionId}/messages`);
        if (since) url.searchParams.append('since', since);

        const response = await fetch(url.toString(), {
          credentials: 'include',
        });

        if (response.ok) {
          const newMessages = await response.json();
          if (newMessages.length > 0) {
            setMessages(prev => {
              const existingIds = new Set(prev.map(m => m.id));
              const uniqueNew = newMessages.filter((m: Message) => !existingIds.has(m.id));
              return [...prev, ...uniqueNew];
            });
          }
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 2000);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [sessionId, messages]);

  // Send message
  const sendMessage = async () => {
    if (!inputMessage.trim() || !sessionId || isSending) return;

    const messageText = inputMessage.trim();
    setInputMessage('');
    setIsSending(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/chat/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          sessionId,
          message: messageText,
          customerId,
          isAdmin: false,
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');

      const sentMessage = await response.json();
      setMessages(prev => [...prev, sentMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      setInputMessage(messageText); // Restore message on error
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg h-[600px] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1F7A4D] to-[#2a9d68] text-white p-4 rounded-t-lg flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg">Hỗ Trợ Trực Tuyến</h3>
            <p className="text-xs text-green-100">Chúng tôi sẵn sàng giúp bạn</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1F7A4D]"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              <p>Xin chào! 👋</p>
              <p className="text-sm mt-2">Bạn cần hỗ trợ gì không?</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'customer' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] rounded-lg p-3 ${
                    msg.sender === 'customer'
                      ? 'bg-[#1F7A4D] text-white'
                      : 'bg-white text-gray-800 border border-gray-200'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                  <p
                    className={`text-xs mt-1 ${
                      msg.sender === 'customer' ? 'text-green-100' : 'text-gray-400'
                    }`}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-gray-200">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Nhập tin nhắn..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#1F7A4D] focus:border-transparent"
              disabled={isSending || !sessionId}
            />
            <button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isSending || !sessionId}
              className="bg-[#1F7A4D] text-white p-2 rounded-full hover:bg-[#16593a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
