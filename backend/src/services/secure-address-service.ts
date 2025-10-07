import crypto from 'crypto';
import { sql, eq, and } from 'drizzle-orm';
// DISABLED: Table does not exist in database
// import { secureCustomerAddresses } from '../../shared/schema.js';

// Import database connection - check storage file for correct export
import * as storage from '../storage.js';
const db = (storage as any).db || storage;

/**
 * 🔐 SECURE ADDRESS MANAGEMENT SERVICE
 * 
 * ⚠️ CURRENTLY DISABLED - secureCustomerAddresses table not in database
 * 
 * Features (when enabled):
 * - AES-256-GCM encryption for customer addresses
 * - SHA-256 hash deduplication to prevent duplicate addresses
 * - View restrictions for affiliate privacy
 * - Automatic hiding after creation (affiliate can't see customer address)
 */

// Encryption key management (consistent with existing pattern)
const ENCRYPTION_KEY = (() => {
  const key = process.env.ENCRYPTION_KEY;
  
  // In development mode, use a default key if not provided
  if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
    const defaultKey = key || '7dffad63efad7b86be74caa78dfe0d045d0ce331e9d70230aa740370f354e406';
    if (defaultKey.length !== 64) {
      throw new Error('ENCRYPTION_KEY must be a 64-character (32-byte) hex string');
    }
    return Buffer.from(defaultKey, 'hex');
  }
  
  // In production, require the environment variable
  if (!key || key.length !== 64) {
    throw new Error('ENCRYPTION_KEY environment variable must be a 64-character (32-byte) hex string');
  }
  return Buffer.from(key, 'hex');
})();

/**
 * Encrypt customer address using AES-256-GCM
 */
function encryptAddress(address: string): string {
  const iv = crypto.randomBytes(16); // 128-bit IV for AES
  const cipher = crypto.createCipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
  
  let encrypted = cipher.update(address, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  // Format: iv:authTag:encryptedData
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypt customer address using AES-256-GCM
 */
function decryptAddress(encryptedAddress: string): string {
  try {
    const parts = encryptedAddress.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted address format');
    }
    
    const [ivHex, authTagHex, encryptedData] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    
    const decipher = crypto.createDecipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Error decrypting address:', error);
    throw new Error('Failed to decrypt address');
  }
}

/**
 * Generate SHA-256 hash for address deduplication
 */
function generateAddressHash(address: string): string {
  // Normalize address: lowercase, trim, remove extra spaces
  const normalizedAddress = address.toLowerCase().trim().replace(/\s+/g, ' ');
  return crypto.createHash('sha256').update(normalizedAddress, 'utf8').digest('hex');
}

/**
 * Check if address already exists (by hash)
 * DISABLED: secureCustomerAddresses table not in database
 */
export async function checkAddressExists(address: string): Promise<boolean> {
  console.warn('checkAddressExists: Feature disabled - secureCustomerAddresses table not in database');
  return false;
}

/**
 * Add secure customer address (affiliate adds customer address)
 * DISABLED: secureCustomerAddresses table not in database
 */
export async function addSecureAddress(params: {
  affiliateId: string;
  customerName: string;
  rawAddress: string;
  customerPhone?: string;
  customerEmail?: string;
  notes?: string;
}): Promise<{ 
  success: boolean; 
  addressId?: string; 
  isDuplicate?: boolean; 
  message: string;
}> {
  console.warn('addSecureAddress: Feature disabled - secureCustomerAddresses table not in database');
  return {
    success: false,
    message: 'Tính năng địa chỉ bảo mật hiện không khả dụng'
  };
}

/**
 * Get affiliate's addresses (SECURITY: ALWAYS RETURN PROTECTED ADDRESSES)
 * DISABLED: secureCustomerAddresses table not in database
 */
export async function getAffiliateAddresses(affiliateId: string) {
  console.warn('getAffiliateAddresses: Feature disabled - secureCustomerAddresses table not in database');
  return [];
}

/**
 * Hide address from affiliate view (security feature)
 * DISABLED: secureCustomerAddresses table not in database
 */
export async function hideAddressFromAffiliate(addressId: string, affiliateId?: string): Promise<{
  success: boolean;
  message: string;
}> {
  console.warn('hideAddressFromAffiliate: Feature disabled - secureCustomerAddresses table not in database');
  return {
    success: false,
    message: 'Tính năng địa chỉ bảo mật hiện không khả dụng'
  };
}

/**
 * Update address order statistics (when order is placed)
 * DISABLED: secureCustomerAddresses table not in database
 */
export async function updateAddressStats(addressId: string, orderValue: number): Promise<void> {
  console.warn('updateAddressStats: Feature disabled - secureCustomerAddresses table not in database');
}

/**
 * Admin function: Get decrypted address (for order fulfillment)
 * DISABLED: secureCustomerAddresses table not in database
 */
export async function getDecryptedAddress(addressId: string): Promise<string | null> {
  console.warn('getDecryptedAddress: Feature disabled - secureCustomerAddresses table not in database');
  return null;
}

// Export encryption functions for testing
export { encryptAddress, decryptAddress, generateAddressHash };