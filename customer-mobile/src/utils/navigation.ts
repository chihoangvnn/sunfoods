'use client';

/**
 * Marks the current navigation as internal (user clicked a link within the app).
 * 
 * **CRITICAL: Must ONLY be called inside onClick handlers, never during render.**
 * 
 * @example
 * // ✅ CORRECT - Called on actual click:
 * <div onClick={() => {
 *   markInternalNav();
 *   router.push(`/product/${slug}`);
 * }}>
 * 
 * @example
 * // ❌ INCORRECT - Runs during render:
 * <Link href={someFunction(id)}> // BAD: executes during render
 * 
 * This function sets a sessionStorage flag to distinguish between:
 * - Internal navigation (user clicked a link in the app)
 * - External visits (user came from outside, refreshed, or direct URL)
 * 
 * Setting this flag during render causes ALL visits to be marked as internal,
 * breaking analytics and user flow tracking.
 */
export const markInternalNav = () => {
  sessionStorage.setItem('internal-nav', 'true');
};
