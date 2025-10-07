/**
 * Server-side permission utilities
 * DO NOT import this in client components - use permissions.ts instead
 */

/**
 * Get authorized shop owner IDs from environment
 * This is server-only to prevent leaking owner IDs to client
 */
function getShopOwnerIds(): string[] {
  const ids = process.env.SHOP_OWNER_IDS || 'shop-owner-default';
  return ids.split(',').map(id => id.trim());
}

/**
 * Check if a user ID is authorized to receive shop notifications (server-side)
 */
export function isShopOwner(userId: string | undefined): boolean {
  if (!userId) return false;
  const authorizedIds = getShopOwnerIds();
  return authorizedIds.includes(userId);
}

/**
 * Verify shop owner permission or throw error
 * Use this in API routes to enforce authorization
 */
export function requireShopOwner(userId: string | undefined): void {
  if (!isShopOwner(userId)) {
    throw new Error('Unauthorized: Shop owner permission required');
  }
}
