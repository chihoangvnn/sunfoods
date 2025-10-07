import crypto from 'crypto';
import { sql, eq, and } from 'drizzle-orm';
import { secureCustomerAddresses } from '../../shared/schema.js';

// Import database connection - check storage file for correct export
import * as storage from '../storage.js';
const db = (storage as any).db || storage;

/**
 * 🔐 SECURE ADDRESS MANAGEMENT SERVICE
 * 
 * Features:
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
 */
export async function checkAddressExists(address: string): Promise<boolean> {
  const addressHash = generateAddressHash(address);
  
  try {
    const existing = await db
      .select()
      .from(secureCustomerAddresses)
      .where(eq(secureCustomerAddresses.addressHash, addressHash))
      .limit(1);
    
    return existing.length > 0;
  } catch (error) {
    console.error('Error checking address existence:', error);
    return false;
  }
}

/**
 * Add secure customer address (affiliate adds customer address)
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
  try {
    const { affiliateId, customerName, rawAddress, customerPhone, customerEmail, notes } = params;
    
    // Validate input
    if (!affiliateId || !customerName || !rawAddress) {
      return {
        success: false,
        message: 'Thiếu thông tin bắt buộc: affiliate ID, tên khách hàng, địa chỉ'
      };
    }
    
    // Check for duplicate addresses
    const addressHash = generateAddressHash(rawAddress);
    const existingAddress = await db
      .select()
      .from(secureCustomerAddresses)
      .where(eq(secureCustomerAddresses.addressHash, addressHash))
      .limit(1);
    
    if (existingAddress.length > 0) {
      return {
        success: false,
        isDuplicate: true,
        message: 'Địa chỉ này đã tồn tại trong hệ thống'
      };
    }
    
    // Encrypt the address
    const encryptedAddress = encryptAddress(rawAddress);
    
    // Insert secure address - IMMEDIATELY HIDDEN for privacy protection
    const [newAddress] = await db
      .insert(secureCustomerAddresses)
      .values({
        affiliateId,
        encryptedAddress,
        addressHash,
        customerName,
        customerPhone: customerPhone || null,
        customerEmail: customerEmail || null,
        notes: notes || null,
        totalOrders: 0,
        totalRevenue: '0',
        isActive: true,
        isHidden: true, // SECURITY: Hidden immediately after creation for privacy
      })
      .returning();
    
    return {
      success: true,
      addressId: newAddress.id,
      message: 'Địa chỉ khách hàng đã được thêm thành công'
    };
    
  } catch (error) {
    console.error('Error adding secure address:', error);
    return {
      success: false,
      message: 'Lỗi hệ thống khi thêm địa chỉ'
    };
  }
}

/**
 * Get affiliate's addresses (SECURITY: ALWAYS RETURN PROTECTED ADDRESSES)
 * Affiliates NEVER see decrypted addresses regardless of any parameters
 */
export async function getAffiliateAddresses(affiliateId: string) {
  try {
    // SECURITY: NO ADMIN REQUEST PARAMETER - affiliates NEVER get decrypted addresses
    const whereCondition = eq(secureCustomerAddresses.affiliateId, affiliateId);
    
    const addresses = await db
      .select()
      .from(secureCustomerAddresses)
      .where(whereCondition)
      .orderBy(secureCustomerAddresses.createdAt);
    
    // SECURITY: ALWAYS return protected addresses - NO DECRYPTION FOR AFFILIATES
    return addresses.map((addr: any) => ({
      id: addr.id,
      customerName: addr.customerName,
      customerPhone: addr.customerPhone,
      customerEmail: addr.customerEmail,
      // SECURITY: ALWAYS protected - affiliates NEVER see real addresses
      address: '[PROTECTED FOR PRIVACY]',
      notes: addr.notes,
      totalOrders: addr.totalOrders,
      totalRevenue: addr.totalRevenue,
      isActive: addr.isActive,
      isHidden: true, // Always hidden from affiliates
      createdAt: addr.createdAt,
      updatedAt: addr.updatedAt
    }));
    
  } catch (error) {
    console.error('Error getting affiliate addresses:', error);
    throw new Error('Failed to retrieve addresses');
  }
}

/**
 * Hide address from affiliate view (security feature)
 * After hiding, affiliate cannot see the actual address
 */
export async function hideAddressFromAffiliate(addressId: string, affiliateId?: string): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const whereCondition = affiliateId 
      ? and(
          eq(secureCustomerAddresses.id, addressId),
          eq(secureCustomerAddresses.affiliateId, affiliateId)
        )
      : eq(secureCustomerAddresses.id, addressId);
    
    const [updated] = await db
      .update(secureCustomerAddresses)
      .set({ 
        isHidden: true,
        updatedAt: new Date()
      })
      .where(whereCondition)
      .returning();
    
    if (!updated) {
      return {
        success: false,
        message: 'Không tìm thấy địa chỉ hoặc không có quyền thực hiện'
      };
    }
    
    return {
      success: true,
      message: 'Địa chỉ đã được ẩn khỏi affiliate'
    };
    
  } catch (error) {
    console.error('Error hiding address:', error);
    return {
      success: false,
      message: 'Lỗi hệ thống khi ẩn địa chỉ'
    };
  }
}

/**
 * Update address order statistics (when order is placed)
 */
export async function updateAddressStats(addressId: string, orderValue: number): Promise<void> {
  try {
    await db
      .update(secureCustomerAddresses)
      .set({
        totalOrders: sql`${secureCustomerAddresses.totalOrders} + 1`,
        totalRevenue: sql`${secureCustomerAddresses.totalRevenue} + ${orderValue}`,
        updatedAt: new Date()
      })
      .where(eq(secureCustomerAddresses.id, addressId));
      
  } catch (error) {
    console.error('Error updating address stats:', error);
  }
}

/**
 * Admin function: Get decrypted address (for order fulfillment)
 */
export async function getDecryptedAddress(addressId: string): Promise<string | null> {
  try {
    const [address] = await db
      .select()
      .from(secureCustomerAddresses)
      .where(eq(secureCustomerAddresses.id, addressId))
      .limit(1);
    
    if (!address) {
      return null;
    }
    
    return decryptAddress(address.encryptedAddress);
    
  } catch (error) {
    console.error('Error getting decrypted address:', error);
    return null;
  }
}

// Export encryption functions for testing
export { encryptAddress, decryptAddress, generateAddressHash };