'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Package, HelpCircle, Search, ShoppingCart, Bot } from 'lucide-react';
import { rasaService, ChatMessage } from '@/services/rasaService';

const MobileChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRasaConnected, setIsRasaConnected] = useState(false);
  const [isLoadingGreeting, setIsLoadingGreeting] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load greeting message from backend on mount
  useEffect(() => {
    const loadGreeting = async () => {
      try {
        setIsLoadingGreeting(true);
        // Send greeting trigger to backend
        const greetingMessages = await rasaService.sendMessage('Xin chào', 'user');
        setMessages(greetingMessages);
        setIsRasaConnected(true);
      } catch (error) {
        console.log('Failed to load greeting from backend, using fallback');
        // Fallback greeting if backend fails
        setMessages([{
          id: '1',
          text: 'Xin chào! Tôi là trợ lý AI của NhangSach.Net. Tôi có thể giúp bạn tìm sản phẩm, theo dõi đơn hàng và trả lời các câu hỏi. Bạn cần hỗ trợ gì?',
          isBot: true,
          timestamp: new Date()
        }]);
        setIsRasaConnected(false);
      } finally {
        setIsLoadingGreeting(false);
      }
    };
    loadGreeting();
  }, []);

  const quickActions = rasaService.getQuickActions();

  const handleQuickAction = (payload: string) => {
    // Send payload directly to RASA, but show friendly text to user
    const actionTexts: { [key: string]: string } = {
      '/search_incense': 'Tôi muốn tìm nhang trầm',
      '/check_order': 'Kiểm tra đơn hàng của tôi',
      '/help': 'Tôi cần hỗ trợ',
      '/pricing': 'Cho tôi biết về giá cả'
    };
    
    const displayText = actionTexts[payload] || payload;
    
    // Show user message in chat
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: displayText,
      isBot: false,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    
    // Send actual payload to RASA
    handleRasaMessage(payload, true);
  };

  const handleSendMessage = async (text?: string) => {
    const messageText = text || inputValue.trim();
    if (!messageText) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: messageText,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    
    // Send as regular message (not payload)
    await handleRasaMessage(messageText, false);
  };

  const handleRasaMessage = async (message: string, isPayload: boolean) => {
    setIsTyping(true);

    try {
      // Use RASA service with payload flag
      const botResponses = await rasaService.sendMessage(message, 'user', isPayload);
      
      setIsTyping(false);
      setMessages(prev => [...prev, ...botResponses]);
      
      // Update connection status
      setIsRasaConnected(rasaService.getConnectionStatus());
      
    } catch (error) {
      setIsTyping(false);
      console.error('Error sending message:', error);
      
      // Fallback error message
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: 'Xin lỗi, tôi đang gặp chút vấn đề kỹ thuật. Bạn có thể thử lại sau không?',
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      setIsRasaConnected(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleButtonClick = (payload: string) => {
    // Handle RASA button clicks - preserve payload structure
    handleQuickAction(payload);
  };

  const handleReconnect = async () => {
    setIsTyping(true);
    const connected = await rasaService.forceReconnect();
    setIsRasaConnected(connected);
    setIsTyping(false);
    
    if (connected) {
      const reconnectMessage: ChatMessage = {
        id: Date.now().toString(),
        text: 'Kết nối lại thành công! Tôi sẵn sàng hỗ trợ bạn.',
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, reconnectMessage]);
    }
  };

  return (
    <>
      {/* Floating Chat Button - Mobile Optimized */}
      <div className="fixed bottom-20 right-4 z-50 sm:bottom-6 sm:right-6">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center"
          aria-label="Mở trợ lý AI hỗ trợ khách hàng"
          title="Trợ lý AI - Hỗ trợ 24/7"
        >
          <MessageCircle size={24} className="sm:size-7" />
          {!isOpen && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
          )}
        </button>
      </div>

      {/* Chat Window - Mobile First Design */}
      {isOpen && (
        <div className="fixed inset-x-0 bottom-16 z-[80] bg-white flex flex-col h-[calc(85vh-4rem)] sm:inset-auto sm:bottom-24 sm:right-6 sm:w-96 sm:h-[600px] sm:rounded-2xl shadow-2xl border-t sm:border border-gray-200 animate-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 flex items-center justify-between sm:rounded-t-2xl">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Bot size={18} />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Trợ lý AI NhangSach.Net</h3>
                <p className="text-xs text-green-100 flex items-center">
                  <span className={`inline-block w-2 h-2 rounded-full mr-1 ${isRasaConnected ? 'bg-green-300' : 'bg-yellow-300'}`}></span>
                  {isRasaConnected ? 'RASA Online' : 'Offline Mode'}
                  {!isRasaConnected && (
                    <button 
                      onClick={handleReconnect}
                      className="ml-2 text-xs underline hover:text-white"
                      disabled={isTyping}
                    >
                      Kết nối lại
                    </button>
                  )}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition-colors p-1"
              aria-label="Đóng chat"
            >
              <X size={20} />
            </button>
          </div>

          {/* Quick Actions */}
          <div className="p-3 border-b border-gray-100 flex-shrink-0">
            <div className="grid grid-cols-2 gap-2 sm:flex sm:space-x-2">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickAction(action.payload)}
                  className="flex items-center justify-center space-x-1 py-2 px-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-xs font-medium text-gray-700 transition-colors"
                >
                  <span className="truncate">{action.text}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id}>
                <div className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[85%] sm:max-w-[80%] p-3 rounded-2xl ${
                    message.isBot 
                      ? 'bg-gray-100 text-gray-800 rounded-bl-md' 
                      : 'bg-green-500 text-white rounded-br-md'
                  }`}>
                    <p className="text-sm">{message.text}</p>
                    <p className={`text-xs mt-1 ${message.isBot ? 'text-gray-500' : 'text-green-100'}`}>
                      {message.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>

                {/* Buttons from RASA */}
                {message.buttons && message.buttons.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2 justify-start">
                    {message.buttons.map((button, buttonIndex) => (
                      <button
                        key={buttonIndex}
                        onClick={() => handleButtonClick(button.payload)}
                        className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-full transition-colors"
                      >
                        {button.title}
                      </button>
                    ))}
                  </div>
                )}

                {/* Product Cards from RASA */}
                {message.products && message.products.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {message.products.map((product) => (
                      <div key={product.id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                        <div className="w-10 h-10 bg-gray-200 rounded-md flex items-center justify-center">
                          {product.image ? (
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover rounded-md" />
                          ) : (
                            <Package size={16} className="text-gray-500" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-medium text-gray-800">{product.name}</p>
                          <p className="text-xs text-green-600 font-semibold">{product.price}</p>
                        </div>
                        <ShoppingCart size={14} className="text-gray-400" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 p-3 rounded-2xl rounded-bl-md">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-100 flex-shrink-0 bg-white">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Nhập tin nhắn..."
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                aria-label="Nhập tin nhắn cho trợ lý AI"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim()}
                className="w-10 h-10 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white rounded-lg flex items-center justify-center transition-colors"
                aria-label="Gửi tin nhắn"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileChatBot;