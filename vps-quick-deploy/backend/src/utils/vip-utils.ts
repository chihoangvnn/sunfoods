/**
 * VIP Tier-based Access Control Utilities
 * 
 * VIP Tier Hierarchy (lowest to highest):
 * silver < gold < platinum < diamond
 */

export type VIPTier = "member" | "silver" | "gold" | "platinum" | "diamond";
export type ProductVIPTier = "silver" | "gold" | "platinum" | "diamond";

/**
 * VIP tier hierarchy with numerical values for comparison
 * member = 0 (non-VIP)
 * silver = 1
 * gold = 2
 * platinum = 3
 * diamond = 4
 */
const TIER_HIERARCHY: Record<VIPTier, number> = {
  member: 0,
  silver: 1,
  gold: 2,
  platinum: 3,
  diamond: 4,
};

/**
 * Check if a customer can access a VIP-only product
 * 
 * @param customerTier - Customer's membership tier (from customer.membershipTier)
 * @param requiredTier - Product's required VIP tier (from product.requiredVipTier)
 * @returns true if customer can access the product, false otherwise
 * 
 * Logic:
 * - requiredTier is null/undefined → All VIP customers can access
 * - customerTier >= requiredTier → Customer can access
 * - Otherwise → Customer cannot access
 */
export function canAccessVIPProduct(
  customerTier: string | null | undefined,
  requiredTier: string | null | undefined
): boolean {
  // Normalize inputs - handle null, undefined, empty strings
  const normalizedCustomerTier = normalizeVIPTier(customerTier);
  const normalizedRequiredTier = normalizeVIPTier(requiredTier);
  
  // If required tier is null/undefined, all VIP customers can access
  if (normalizedRequiredTier === null) {
    // Customer must be at least silver VIP to access VIP products
    return normalizedCustomerTier !== null && normalizedCustomerTier !== "member";
  }
  
  // If customer tier is null or "member", they're not VIP
  if (normalizedCustomerTier === null || normalizedCustomerTier === "member") {
    return false;
  }
  
  // Compare tier hierarchy - customer tier must be >= required tier
  const customerLevel = TIER_HIERARCHY[normalizedCustomerTier];
  const requiredLevel = TIER_HIERARCHY[normalizedRequiredTier as VIPTier];
  
  return customerLevel >= requiredLevel;
}

/**
 * Normalize VIP tier string - handle case sensitivity, null, undefined, empty strings
 * @param tier - Raw tier string from database
 * @returns Normalized tier or null if invalid
 */
function normalizeVIPTier(tier: string | null | undefined): VIPTier | null {
  if (!tier || typeof tier !== 'string') {
    return null;
  }
  
  const normalized = tier.trim().toLowerCase() as VIPTier;
  
  // Validate against known tiers
  if (normalized in TIER_HIERARCHY) {
    return normalized;
  }
  
  return null;
}

/**
 * Filter products array based on customer VIP tier
 * 
 * @param products - Array of products to filter
 * @param customerTier - Customer's membership tier
 * @param isAdmin - Whether the user is an admin (admins see all products)
 * @returns Filtered products array
 */
export function filterProductsByVIPAccess<T extends { isVipOnly?: boolean; requiredVipTier?: string | null }>(
  products: T[],
  customerTier: string | null | undefined,
  isAdmin: boolean = false
): T[] {
  // Admins see all products
  if (isAdmin) {
    return products;
  }
  
  return products.filter(product => {
    // Public products (not VIP-only) are visible to everyone
    if (!product.isVipOnly) {
      return true;
    }
    
    // VIP-only products require tier checking
    return canAccessVIPProduct(customerTier, product.requiredVipTier);
  });
}

/**
 * Check if a single product is accessible to a customer
 * 
 * @param product - Product to check
 * @param customerTier - Customer's membership tier
 * @param isAdmin - Whether the user is an admin
 * @returns true if accessible, false otherwise
 */
export function isProductAccessible(
  product: { isVipOnly?: boolean; requiredVipTier?: string | null },
  customerTier: string | null | undefined,
  isAdmin: boolean = false
): boolean {
  // Admins can access all products
  if (isAdmin) {
    return true;
  }
  
  // Public products are accessible to everyone
  if (!product.isVipOnly) {
    return true;
  }
  
  // VIP-only products require tier checking
  return canAccessVIPProduct(customerTier, product.requiredVipTier);
}

/**
 * Get customer tier from session or customer record
 * 
 * @param session - Express session object
 * @param customerRecord - Customer record from database (optional)
 * @returns Customer's membership tier or null
 */
export function getCustomerTierFromSession(
  session: any,
  customerRecord?: { membershipTier?: string | null }
): string | null {
  // Try to get from customer record first
  if (customerRecord?.membershipTier) {
    return customerRecord.membershipTier;
  }
  
  // Try to get from session
  if (session?.customer?.membershipTier) {
    return session.customer.membershipTier;
  }
  
  if (session?.customerTier) {
    return session.customerTier;
  }
  
  // Non-logged-in users are considered "member" (non-VIP)
  return "member";
}

/**
 * Check if user is admin from session
 * 
 * @param session - Express session object
 * @returns true if user is admin, false otherwise
 */
export function isAdminUser(session: any): boolean {
  return !!(
    session?.userId || 
    session?.adminId || 
    session?.isAdmin || 
    session?.user?.role === 'admin' ||
    session?.admin
  );
}
