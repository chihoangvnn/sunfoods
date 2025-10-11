import { BackendProduct, BackendCategory, Product, Category } from '@/types/api';
import { transformProducts, transformCategories, demoProducts, demoCategories } from '@/lib/dataTransformers';
import { getApiUrls, apiConfig } from '@/lib/apiConfig';

/**
 * Enhanced fetch with error handling and timeout
 * Note: Next.js fetch cache options (revalidate) only work in Server Components/Actions,
 * not in client-side fetches. For client-side caching, use React Query (already configured).
 */
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout = 20000): Promise<Response> {
  const controller = new AbortController();
  
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Request timeout after ${timeout}ms`));
    }, timeout);
  });

  const fetchPromise = fetch(url, {
    ...options,
    signal: controller.signal,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  try {
    const response = await Promise.race([fetchPromise, timeoutPromise]);
    return response;
  } catch (error) {
    controller.abort();
    
    if (error instanceof Error) {
      if (error.message.includes('timeout') || error.name === 'AbortError') {
        const timeoutError = new Error(`Request timeout after ${timeout}ms`);
        timeoutError.name = 'TimeoutError';
        throw timeoutError;
      }
    }
    throw error;
  }
}

/**
 * Fetch products from backend API with fallback to demo data
 */
export async function fetchProducts(params: {
  limit?: number;
  offset?: number;
  categoryId?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
} = {}): Promise<Product[]> {
  try {
    const urls = getApiUrls();
    
    if (!urls.isExternal) {
      console.log('Using local demo API');
      return filterDemoProducts(params);
    }

    // Build query string
    const queryParams = new URLSearchParams();
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.offset) queryParams.append('offset', params.offset.toString());
    if (params.categoryId && params.categoryId !== 'all') queryParams.append('categoryId', params.categoryId);
    if (params.search) queryParams.append('search', params.search);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const url = `${urls.products}?${queryParams.toString()}`;
    console.log('Fetching products from:', url);
    
    const response = await fetchWithTimeout(url);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const backendProducts: BackendProduct[] = await response.json();
    return transformProducts(backendProducts);

  } catch (error) {
    // Handle timeout errors gracefully
    if (error instanceof Error && (error.name === 'TimeoutError' || error.name === 'AbortError')) {
      console.warn('Request timeout - falling back to demo products');
      return filterDemoProducts(params);
    }
    
    console.error('Error fetching products from backend:', error);
    
    if (apiConfig.enableFallback) {
      console.log('Falling back to demo products');
      return filterDemoProducts(params);
    }
    
    throw error;
  }
}

/**
 * Filter demo products for local development
 */
function filterDemoProducts(params: {
  limit?: number;
  offset?: number;
  categoryId?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
}): Product[] {
  let filtered = [...demoProducts];

  // Filter by category
  if (params.categoryId && params.categoryId !== 'all') {
    filtered = filtered.filter(p => p.category_id === params.categoryId);
  }

  // Filter by search
  if (params.search) {
    const searchLower = params.search.toLowerCase();
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(searchLower) ||
      p.short_description?.toLowerCase().includes(searchLower)
    );
  }

  // Sort products
  filtered.sort((a, b) => {
    let comparison = 0;
    switch (params.sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'price':
        comparison = a.price - b.price;
        break;
      case 'newest':
      default:
        comparison = b.id.localeCompare(a.id);
        break;
    }
    return params.sortOrder === 'desc' ? -comparison : comparison;
  });

  // Pagination
  const offset = params.offset || 0;
  const limit = params.limit || 20;
  return filtered.slice(offset, offset + limit);
}

/**
 * Fetch categories from backend API with fallback to demo data
 */
export async function fetchCategories(): Promise<Category[]> {
  try {
    const urls = getApiUrls();
    
    if (!urls.isExternal) {
      console.log('Using local demo categories');
      return demoCategories;
    }

    console.log('Fetching categories from:', urls.categories);
    const response = await fetchWithTimeout(urls.categories);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const backendCategories: BackendCategory[] = await response.json();
    return transformCategories(backendCategories);

  } catch (error) {
    // Handle timeout errors gracefully
    if (error instanceof Error && (error.name === 'TimeoutError' || error.name === 'AbortError')) {
      console.warn('Request timeout - falling back to demo categories');
      return demoCategories;
    }
    
    console.error('Error fetching categories from backend:', error);
    
    if (apiConfig.enableFallback) {
      console.log('Falling back to demo categories');
      return demoCategories;
    }
    
    throw error;
  }
}

/**
 * Fetch filtered categories from backend API with fallback to demo data
 */
export async function fetchFilteredCategories(): Promise<Category[]> {
  try {
    const urls = getApiUrls();
    
    if (!urls.isExternal) {
      console.log('Using local demo categories for filter');
      return demoCategories;
    }

    console.log('Fetching filtered categories from:', urls.categoriesFilter);
    const response = await fetchWithTimeout(urls.categoriesFilter);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const backendCategories: BackendCategory[] = await response.json();
    return transformCategories(backendCategories);

  } catch (error) {
    // Handle timeout errors gracefully
    if (error instanceof Error && (error.name === 'TimeoutError' || error.name === 'AbortError')) {
      console.warn('Request timeout - falling back to demo categories');
      return demoCategories;
    }
    
    console.error('Error fetching filtered categories from backend:', error);
    
    if (apiConfig.enableFallback) {
      console.log('Falling back to demo categories');
      return demoCategories;
    }
    
    throw error;
  }
}