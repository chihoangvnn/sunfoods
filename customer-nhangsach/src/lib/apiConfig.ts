import { ApiConfig } from '@/types/api';
import { STORE_CONFIG } from '@/config/store';

// API Configuration
export const apiConfig: ApiConfig = {
  baseUrl: process.env.NEXT_PUBLIC_BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || '/api',
  frontendId: process.env.NEXT_PUBLIC_FRONTEND_ID || 'frontend-a',
  enableFallback: process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_ENABLE_DEMO_FALLBACK === 'true'
};

// Check if we should use external API or local demo
export const useExternalApi = () => {
  return process.env.NEXT_PUBLIC_BACKEND_API_URL && 
         process.env.NEXT_PUBLIC_BACKEND_API_URL !== process.env.NEXT_PUBLIC_API_URL;
};

// API URLs
export const getApiUrls = () => {
  const isExternal = useExternalApi();
  const baseUrl = isExternal ? process.env.NEXT_PUBLIC_BACKEND_API_URL! : apiConfig.baseUrl;
  
  return {
    products: `${baseUrl}/stores/${STORE_CONFIG.storeId}/products`,
    categories: `${baseUrl}/categories`,
    categoriesFilter: `${baseUrl}/categories/filter?frontendId=${apiConfig.frontendId}`,
    isExternal
  };
};