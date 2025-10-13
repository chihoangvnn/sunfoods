'use client'

interface RasaMessage {
  sender: string;
  message: string;
}

interface RasaResponse {
  text?: string;
  custom?: any;
  buttons?: Array<{
    title: string;
    payload: string;
  }>;
  image?: string;
  elements?: Array<{
    title: string;
    subtitle?: string;
    image_url?: string;
    buttons?: Array<{
      title: string;
      type: string;
      payload?: string;
      url?: string;
    }>;
  }>;
}

export interface ChatMessage {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  buttons?: Array<{
    title: string;
    payload: string;
  }>;
  products?: Array<{
    id: string;
    name: string;
    price: string;
    image?: string;
  }>;
}

class RasaService {
  private baseUrl: string;
  private fallbackResponses: string[];
  private isConnected: boolean = false;

  constructor() {
    // Use backend API instead of direct RASA connection (secure)
    this.baseUrl = this.getBackendApiUrl();
    
    this.fallbackResponses = [
      'Xin lỗi, tôi đang gặp chút vấn đề kỹ thuật. Bạn có thể thử lại sau hoặc liên hệ trực tiếp với chúng tôi?',
      'Tôi chưa hiểu rõ ý bạn. Bạn có thể nói rõ hơn không?',
      'Để tôi kết nối với chuyên viên hỗ trợ cho bạn nhé.',
      'Cảm ơn bạn đã liên hệ. Chúng tôi sẽ hỗ trợ bạn ngay.',
    ];
  }

  /**
   * Send message to backend chat API
   */
  async sendMessage(message: string, userId: string = 'user', isPayload: boolean = false): Promise<ChatMessage[]> {
    try {
      const payload = {
        message: isPayload ? message : message.trim(),
        sender: userId,
        context: {} // Can include cart items, customer info, etc.
      };

      // Always attempt chat request (don't gate on health check)
      try {
        const response = await fetch(`${this.baseUrl}/rasa/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Include session cookies
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(10000) // 10 second timeout
        });

        // Handle specific error codes with user-friendly messages
        if (response.status === 401) {
          console.warn('Unauthorized - session expired or not logged in');
          return this.createErrorMessage('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        }
        
        if (response.status === 403) {
          console.warn('CSRF token invalid or forbidden');
          return this.createErrorMessage('Không thể xử lý yêu cầu. Vui lòng tải lại trang.');
        }
        
        if (response.status === 429) {
          console.warn('Rate limited');
          const retryAfter = response.headers.get('Retry-After');
          const waitTime = retryAfter ? ` ${retryAfter} giây` : ' vài giây';
          return this.createErrorMessage(`Bạn đang gửi tin nhắn quá nhanh. Vui lòng đợi${waitTime}.`);
        }

        if (!response.ok) {
          throw new Error(`Backend API error: ${response.status}`);
        }

        const data = await response.json();
        this.isConnected = true;
        
        // Parse backend responses - handle multiple formats
        // Format 1: { status: 'success', responses: [...] }
        if (data.status === 'success' && Array.isArray(data.responses)) {
          return this.parseBackendResponses(data.responses);
        }
        
        // Format 2: { status: 'success', data: { responses: [...] } }
        if (data.status === 'success' && data.data && Array.isArray(data.data.responses)) {
          return this.parseBackendResponses(data.data.responses);
        }
        
        // Format 3: { status: 'success', data: [...] } - direct array
        if (data.status === 'success' && Array.isArray(data.data)) {
          return this.parseBackendResponses(data.data);
        }
        
        // Format 4: Direct array at top level [...] (unlikely but handle it)
        if (Array.isArray(data)) {
          return this.parseBackendResponses(data);
        }
        
        // If we can't parse any known format, log and fallback
        console.warn('[Chatbot] Response format issue:', JSON.stringify(data).substring(0, 200));
        throw new Error('Invalid response format from backend');

      } catch (apiError: any) {
        this.isConnected = false;
        console.log('[Chatbot] Backend temporarily unavailable:', apiError?.message || 'Unknown error');
        return this.getFallbackResponse(message);
      }

    } catch (error) {
      console.error('Error in RasaService:', error);
      this.isConnected = false;
      return this.getFallbackResponse(message);
    }
  }

  /**
   * Parse backend chat API responses into our ChatMessage format
   */
  private parseBackendResponses(responses: any[]): ChatMessage[] {
    if (!responses || responses.length === 0) {
      return this.getFallbackResponse('');
    }

    return responses.map((response, index) => {
      const message: ChatMessage = {
        id: Date.now().toString() + index,
        text: response.text || 'Tôi đã nhận được tin nhắn của bạn.',
        isBot: true,
        timestamp: new Date(),
      };

      // Add buttons if available
      if (response.buttons && response.buttons.length > 0) {
        message.buttons = response.buttons;
      }

      // Parse custom data (products, etc.)
      if (response.custom) {
        if (response.custom.products) {
          message.products = response.custom.products.map((product: any) => ({
            id: product.id || product.title?.toLowerCase().replace(/\s+/g, '-'),
            name: product.name || product.title,
            price: product.price || 'Liên hệ',
            image: product.image || product.imageUrl
          }));
        }
      }

      return message;
    });
  }

  /**
   * Create error message with specific text
   */
  private createErrorMessage(errorText: string): ChatMessage[] {
    return [{
      id: Date.now().toString(),
      text: errorText,
      isBot: true,
      timestamp: new Date()
    }];
  }

  /**
   * Generate fallback response when backend is unavailable
   */
  private getFallbackResponse(userMessage: string): ChatMessage[] {
    const lowerMessage = userMessage.toLowerCase();
    let responseText = '';

    // Simple rule-based fallback
    if (lowerMessage.includes('nhang') || lowerMessage.includes('hương') || lowerMessage.includes('trầm')) {
      responseText = 'Chúng tôi có nhiều loại nhang và hương trầm chất lượng cao. Bạn muốn tìm loại nào cụ thể?';
    } else if (lowerMessage.includes('đơn hàng') || lowerMessage.includes('order')) {
      responseText = 'Để kiểm tra đơn hàng, bạn vui lòng cung cấp mã đơn hàng hoặc số điện thoại đặt hàng.';
    } else if (lowerMessage.includes('giá') || lowerMessage.includes('price')) {
      responseText = 'Giá sản phẩm tại NhangSach.Net rất cạnh tranh. Bạn có thể xem giá chi tiết từng sản phẩm hoặc cho tôi biết sản phẩm bạn quan tâm.';
    } else if (lowerMessage.includes('giao hàng') || lowerMessage.includes('ship')) {
      responseText = 'Chúng tôi giao hàng toàn quốc. Phí ship chỉ từ 25.000đ và miễn phí với đơn hàng trên 500.000đ.';
    } else {
      // Random fallback response
      const randomIndex = Math.floor(Math.random() * this.fallbackResponses.length);
      responseText = this.fallbackResponses[randomIndex];
    }

    return [{
      id: Date.now().toString(),
      text: responseText,
      isBot: true,
      timestamp: new Date()
    }];
  }

  /**
   * Get quick action suggestions
   */
  getQuickActions(): Array<{ text: string; payload: string }> {
    return [
      { text: 'Tìm nhang trầm', payload: '/search_incense' },
      { text: 'Kiểm tra đơn hàng', payload: '/check_order' },
      { text: 'Hỗ trợ', payload: '/help' },
      { text: 'Giá cả', payload: '/pricing' }
    ];
  }

  /**
   * Update RASA server URL
   */
  updateServerUrl(url: string): void {
    this.baseUrl = url;
  }

  /**
   * Get backend API URL from environment
   */
  private getBackendApiUrl(): string {
    // Always use local Next.js API routes (proxy to backend)
    // This avoids CORS issues and provides same-origin security
    return '/api';
  }

  /**
   * Check if backend API is available (optional diagnostic)
   */
  async checkServerHealth(): Promise<boolean> {
    try {
      // Attempt to ping backend - for diagnostic purposes only
      const response = await fetch(`${this.baseUrl}/rasa/chat`, {
        method: 'OPTIONS', // Use OPTIONS to avoid triggering actual chat logic
        signal: AbortSignal.timeout(3000)
      });
      return response.ok;
    } catch (error) {
      console.log('Backend API health check failed:', error);
      return false;
    }
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  /**
   * Force reconnection attempt
   */
  async forceReconnect(): Promise<boolean> {
    return await this.checkServerHealth();
  }
}

// Export singleton instance
export const rasaService = new RasaService();
export default RasaService;