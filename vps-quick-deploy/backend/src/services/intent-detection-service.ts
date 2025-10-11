export interface DetectedIntent {
  intent: string;
  confidence: number;
  matchedKeywords: string[];
}

const INTENT_PATTERNS = {
  tier_upgrade_interest: {
    keywords: [
      'hạng', 'thăng hạng', 'nâng hạng', 'lên hạng', 
      'thành viên', 'membership', 'tier', 'vip',
      'bạc', 'vàng', 'kim cương', 'silver', 'gold', 'diamond',
      'ưu đãi', 'quyền lợi', 'benefit', 'privilege',
      'còn thiếu bao nhiêu', 'cần mua thêm'
    ],
    weight: 1.0
  },
  
  product_recommendation_request: {
    keywords: [
      'gợi ý', 'recommend', 'đề xuất', 'tư vấn',
      'sản phẩm nào', 'mua gì', 'nên mua',
      'hot', 'bán chạy', 'trending', 'phổ biến',
      'phù hợp', 'suitable', 'dành cho tôi',
      'có gì mới', 'new arrival'
    ],
    weight: 1.0
  },
  
  cart_recovery: {
    keywords: [
      'giỏ hàng', 'cart', 'basket',
      'chưa thanh toán', 'chưa mua',
      'bỏ quên', 'quên', 'forgotten',
      'đơn hàng', 'order', 'checkout',
      'hoàn tất', 'complete'
    ],
    weight: 1.0
  },

  seasonal_recommendations: {
    keywords: [
      'tết', 'lễ', 'festival', 'holiday',
      'mùa', 'season', 'dịp',
      'rằm', 'vu lan', 'trung thu',
      'noel', 'giáng sinh', 'năm mới'
    ],
    weight: 0.9
  },

  tier_status_check: {
    keywords: [
      'hạng của tôi', 'my tier', 'my level',
      'thành viên của tôi', 'membership status',
      'tôi đang ở hạng', 'level nào',
      'kiểm tra hạng', 'check tier'
    ],
    weight: 1.0
  }
};

function normalizeVietnameseText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd');
}

export function detectIntent(userMessage: string): DetectedIntent | null {
  const normalizedMessage = normalizeVietnameseText(userMessage);
  const scores: { [intent: string]: { score: number; matches: string[] } } = {};

  for (const [intent, config] of Object.entries(INTENT_PATTERNS)) {
    scores[intent] = { score: 0, matches: [] };

    for (const keyword of config.keywords) {
      const normalizedKeyword = normalizeVietnameseText(keyword);
      
      if (normalizedMessage.includes(normalizedKeyword)) {
        scores[intent].score += config.weight;
        scores[intent].matches.push(keyword);
      }
    }
  }

  const sortedIntents = Object.entries(scores)
    .filter(([_, data]) => data.score > 0)
    .map(([intent, data]) => ({
      intent,
      confidence: Math.min(data.score / 3, 1.0),
      matchedKeywords: data.matches
    }))
    .sort((a, b) => b.confidence - a.confidence);

  if (sortedIntents.length === 0) {
    return null;
  }

  return sortedIntents[0];
}

export function getIntentResponse(intent: string): string {
  const responses: { [key: string]: string } = {
    tier_upgrade_interest: '🎯 Để xem thông tin hạng thành viên và điều kiện nâng hạng, bạn vui lòng cho mình biết số điện thoại đăng ký nhé!',
    product_recommendation_request: '✨ Mình sẽ gợi ý sản phẩm phù hợp nhất cho bạn! Bạn muốn xem sản phẩm dành riêng cho bạn, sản phẩm bán chạy, hay sản phẩm theo mùa/dịp lễ?',
    cart_recovery: '🛒 Để kiểm tra giỏ hàng của bạn, vui lòng cho mình biết số điện thoại đăng ký nhé!',
    seasonal_recommendations: '🎉 Bạn muốn xem sản phẩm theo dịp lễ/mùa nào? Tết, Vu Lan, Trung Thu, hay dịp khác?',
    tier_status_check: '💎 Để kiểm tra hạng thành viên hiện tại, bạn vui lòng cho mình biết số điện thoại đăng ký nhé!'
  };

  return responses[intent] || 'Xin lỗi, mình chưa hiểu ý bạn. Bạn có thể nói rõ hơn được không?';
}

export function requiresCustomerIdentification(intent: string): boolean {
  return ['tier_upgrade_interest', 'cart_recovery', 'tier_status_check', 'product_recommendation_request'].includes(intent);
}
