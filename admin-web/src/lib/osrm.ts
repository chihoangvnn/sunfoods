/**
 * OpenRouteService (ORS) Utility
 * Calculates route distance using real road networks via secure backend proxy
 * 
 * SECURITY: API key is stored server-side, never exposed to browsers
 */

/**
 * Calculate route distance between two coordinates using secure backend proxy
 * @param lat1 Start latitude
 * @param lon1 Start longitude
 * @param lat2 End latitude
 * @param lon2 End longitude
 * @returns Distance in kilometers, or null if failed
 */
export async function calculateRouteDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): Promise<number | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout for backend call
    
    const response = await fetch('/api/admin/calculate-route-distance', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ lat1, lon1, lat2, lon2 })
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.warn('[ORS] Backend proxy request failed:', response.status);
      return null;
    }
    
    const data = await response.json();
    
    if (data.error) {
      console.warn('[ORS] Backend error:', data.error);
      return null;
    }
    
    return data.distance;
    
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.warn('[ORS] Request timeout');
    } else {
      console.warn('[ORS] Failed to calculate route distance:', error);
    }
    return null;
  }
}
