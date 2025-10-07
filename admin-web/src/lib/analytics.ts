// Declare gtag function for TypeScript
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

// GA4 Configuration
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

// Initialize GA4
export const initializeGA4 = () => {
  if (!GA_MEASUREMENT_ID) {
    console.warn('GA4 Measurement ID not provided. Analytics tracking disabled.');
    return;
  }

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || [];
  
  // Define gtag function
  window.gtag = function gtag(...args: any[]) {
    window.dataLayer.push(args);
  };
  
  // Load GA4 script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);
  
  // Configure GA4
  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, {
    page_title: document.title,
    page_location: window.location.href,
  });
  
  console.log('✅ GA4 initialized with ID:', GA_MEASUREMENT_ID);
};

// Track page views
export const trackPageView = (page_title: string, page_location: string) => {
  if (!GA_MEASUREMENT_ID) return;
  
  window.gtag('config', GA_MEASUREMENT_ID, {
    page_title,
    page_location,
  });
};

// E-commerce tracking functions for incense business
export const trackProductView = (productId: string, productName: string, category: string, price: number) => {
  if (!GA_MEASUREMENT_ID) return;
  
  window.gtag('event', 'view_item', {
    currency: 'VND',
    value: price,
    items: [{
      item_id: productId,
      item_name: productName,
      item_category: category,
      price: price,
      quantity: 1
    }]
  });
};

export const trackAddToCart = (productId: string, productName: string, category: string, price: number, quantity: number = 1) => {
  if (!GA_MEASUREMENT_ID) return;
  
  window.gtag('event', 'add_to_cart', {
    currency: 'VND',
    value: price * quantity,
    items: [{
      item_id: productId,
      item_name: productName,
      item_category: category,
      price: price,
      quantity: quantity
    }]
  });
};

export const trackBeginCheckout = (items: any[], totalValue: number) => {
  if (!GA_MEASUREMENT_ID) return;
  
  window.gtag('event', 'begin_checkout', {
    currency: 'VND',
    value: totalValue,
    items: items
  });
};

export const trackPurchase = (orderId: string, items: any[], totalValue: number, customerId?: string) => {
  if (!GA_MEASUREMENT_ID) return;
  
  window.gtag('event', 'purchase', {
    transaction_id: orderId,
    value: totalValue,
    currency: 'VND',
    items: items,
    ...(customerId && { customer_id: customerId })
  });
};

// Custom events for incense business
export const trackSearch = (searchTerm: string, resultCount?: number) => {
  if (!GA_MEASUREMENT_ID) return;
  
  window.gtag('event', 'search', {
    search_term: searchTerm,
    ...(resultCount !== undefined && { search_result_count: resultCount })
  });
};

export const trackCategoryBrowse = (categoryName: string, categoryId: string) => {
  if (!GA_MEASUREMENT_ID) return;
  
  window.gtag('event', 'view_item_list', {
    item_list_name: categoryName,
    item_list_id: categoryId
  });
};

export const trackCustomerRegistration = (method: string = 'email') => {
  if (!GA_MEASUREMENT_ID) return;
  
  window.gtag('event', 'sign_up', {
    method: method
  });
};

export const trackCustomerLogin = (method: string = 'email') => {
  if (!GA_MEASUREMENT_ID) return;
  
  window.gtag('event', 'login', {
    method: method
  });
};

// Custom events for Vietnamese incense business specifics
export const trackIncenseConsultation = (productId: string, consultationType: string) => {
  if (!GA_MEASUREMENT_ID) return;
  
  window.gtag('event', 'incense_consultation', {
    product_id: productId,
    consultation_type: consultationType,
    event_category: 'engagement',
    event_label: 'product_consultation'
  });
};

export const trackFAQInteraction = (productId: string, faqQuestion: string) => {
  if (!GA_MEASUREMENT_ID) return;
  
  window.gtag('event', 'faq_interaction', {
    product_id: productId,
    faq_question: faqQuestion,
    event_category: 'engagement',
    event_label: 'product_faq'
  });
};

export const trackReviewSubmission = (productId: string, rating: number) => {
  if (!GA_MEASUREMENT_ID) return;
  
  window.gtag('event', 'review_submission', {
    product_id: productId,
    rating: rating,
    event_category: 'engagement',
    event_label: 'product_review'
  });
};

// Generic custom event tracking for admin actions
export const trackCustomEvent = (eventName: string, parameters: Record<string, any> = {}) => {
  if (!GA_MEASUREMENT_ID) return;
  
  window.gtag('event', eventName, {
    event_category: 'admin_action',
    ...parameters
  });
};