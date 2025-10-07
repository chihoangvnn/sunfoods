/**
 * Client-side permission utilities
 * For server-side validation, use permissions.server.ts
 */

/**
 * Check if current authenticated user can access shop owner features
 * This is a client-side check only - server must validate separately
 * 
 * IMPORTANT: This performs a simple check. Real authorization happens server-side.
 * Never trust client-side checks alone.
 */
export async function canAccessShopFeatures(): Promise<boolean> {
  try {
    // Call backend to verify permissions (uses session auth)
    const response = await fetch('/api/auth/check-shop-owner');
    if (!response.ok) return false;
    const data = await response.json();
    return data.isShopOwner === true;
  } catch (error) {
    console.error('Failed to check shop owner status:', error);
    return false;
  }
}

/**
 * Synchronous check based on localStorage cache
 * Use this for immediate UI rendering, then verify with canAccessShopFeatures
 */
export function isShopOwnerCached(userId: string | undefined): boolean {
  if (!userId) return false;
  
  try {
    const cached = localStorage.getItem('shop_owner_status');
    if (cached) {
      const data = JSON.parse(cached);
      if (data.userId === userId && Date.now() - data.timestamp < 60000) {
        return data.isShopOwner;
      }
    }
  } catch (e) {
    // Ignore cache errors
  }
  
  return false;
}

/**
 * Update shop owner status cache
 */
export function updateShopOwnerCache(userId: string, isShopOwner: boolean): void {
  try {
    localStorage.setItem('shop_owner_status', JSON.stringify({
      userId,
      isShopOwner,
      timestamp: Date.now()
    }));
  } catch (e) {
    // Ignore storage errors
  }
}
