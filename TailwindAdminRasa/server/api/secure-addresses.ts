/**
 * 🔐 SECURE ADDRESS MANAGEMENT API
 * 
 * Endpoints for managing encrypted customer addresses with affiliate system
 * - Add secure addresses with encryption
 * - Get affiliate's visible addresses
 * - Hide addresses from affiliates
 * - Admin decrypt for order fulfillment
 */

import { Request, Response } from 'express';
import { z } from 'zod';
import {
  addSecureAddress,
  getAffiliateAddresses,
  hideAddressFromAffiliate,
  getDecryptedAddress,
  checkAddressExists
} from '../services/secure-address-service.js';

// Validation schemas
const AddAddressSchema = z.object({
  affiliateId: z.string().min(1, "Affiliate ID is required"),
  customerName: z.string().min(2, "Tên khách hàng phải có ít nhất 2 ký tự"),
  address: z.string().min(10, "Địa chỉ phải có ít nhất 10 ký tự"),
  customerPhone: z.string().optional(),
  customerEmail: z.string().email("Email không hợp lệ").optional(),
  notes: z.string().optional()
});

const HideAddressSchema = z.object({
  addressId: z.string().min(1, "Address ID is required"),
  affiliateId: z.string().optional() // Optional for admin usage
});

/**
 * POST /api/secure-addresses
 * Add new secure customer address
 */
export async function addSecureCustomerAddress(req: Request, res: Response) {
  try {
    // Validate request body
    const validatedData = AddAddressSchema.parse(req.body);
    
    const { affiliateId, customerName, address, customerPhone, customerEmail, notes } = validatedData;
    
    // Add secure address using service
    const result = await addSecureAddress({
      affiliateId,
      customerName,
      rawAddress: address,
      customerPhone,
      customerEmail,
      notes
    });
    
    if (result.success) {
      res.status(201).json({
        success: true,
        message: result.message,
        data: {
          addressId: result.addressId,
          isDuplicate: result.isDuplicate || false
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message,
        isDuplicate: result.isDuplicate || false
      });
    }
    
  } catch (error) {
    console.error('Error in addSecureCustomerAddress:', error);
    
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Lỗi hệ thống khi thêm địa chỉ'
      });
    }
  }
}

/**
 * GET /api/secure-addresses/:affiliateId
 * Get affiliate's addresses (SECURITY: ALWAYS PROTECTED - NO DECRYPTION)
 * SECURITY: Affiliates NEVER see decrypted addresses regardless of parameters
 */
export async function getAffiliateSecureAddresses(req: Request, res: Response) {
  try {
    const { affiliateId } = req.params;
    
    if (!affiliateId) {
      return res.status(400).json({
        success: false,
        message: 'Affiliate ID is required'
      });
    }
    
    // SECURITY: NO PARAMETERS ACCEPTED - all affiliate requests get protected addresses
    // Ignore any includeHidden, admin, or other parameters
    const addresses = await getAffiliateAddresses(affiliateId);
    
    res.json({
      success: true,
      message: 'Protected addresses retrieved successfully',
      data: {
        addresses,
        count: addresses.length,
        securityNote: 'All addresses are protected for privacy'
      }
    });
    
  } catch (error) {
    console.error('Error in getAffiliateSecureAddresses:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống khi lấy danh sách địa chỉ'
    });
  }
}

/**
 * POST /api/secure-addresses/:id/hide
 * Hide address from affiliate view (security feature)
 */
export async function hideSecureAddress(req: Request, res: Response) {
  try {
    const { id: addressId } = req.params;
    const { affiliateId } = req.body;
    
    if (!addressId) {
      return res.status(400).json({
        success: false,
        message: 'Address ID is required'
      });
    }
    
    const result = await hideAddressFromAffiliate(addressId, affiliateId);
    
    if (result.success) {
      res.json({
        success: true,
        message: result.message
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message
      });
    }
    
  } catch (error) {
    console.error('Error in hideSecureAddress:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống khi ẩn địa chỉ'
    });
  }
}

/**
 * GET /api/secure-addresses/:id/decrypt
 * ADMIN ONLY: Get decrypted address for order fulfillment
 * SECURITY: This endpoint is DISABLED until proper admin auth is implemented
 */
export async function getDecryptedSecureAddress(req: Request, res: Response) {
  try {
    // SECURITY: BLOCK ALL ACCESS until proper admin authentication is implemented
    return res.status(403).json({
      success: false,
      message: 'ADMIN AUTHORIZATION REQUIRED - This endpoint is disabled for security',
      code: 'ADMIN_AUTH_REQUIRED'
    });
    
    /* DISABLED FOR SECURITY - Enable only after implementing proper admin auth
    const { id: addressId } = req.params;
    
    if (!addressId) {
      return res.status(400).json({
        success: false,
        message: 'Address ID is required'
      });
    }
    
    // TODO: Add proper admin authentication check here
    // if (!req.session?.isAdmin || req.session?.role !== 'admin') {
    //   return res.status(403).json({ 
    //     success: false, 
    //     message: 'Admin access required' 
    //   });
    // }
    
    const decryptedAddress = await getDecryptedAddress(addressId);
    
    if (decryptedAddress) {
      res.json({
        success: true,
        message: 'Address decrypted successfully',
        data: {
          addressId,
          decryptedAddress
        }
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Không tìm thấy địa chỉ'
      });
    }
    */
    
  } catch (error) {
    console.error('Error in getDecryptedSecureAddress:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống khi giải mã địa chỉ'
    });
  }
}

/**
 * GET /api/secure-addresses/check-duplicate
 * Check if address already exists (for frontend validation)
 */
export async function checkAddressDuplicate(req: Request, res: Response) {
  try {
    const { address } = req.query;
    
    if (!address || typeof address !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Address parameter is required'
      });
    }
    
    const exists = await checkAddressExists(address);
    
    res.json({
      success: true,
      data: {
        address,
        exists,
        message: exists ? 'Địa chỉ đã tồn tại' : 'Địa chỉ có thể sử dụng'
      }
    });
    
  } catch (error) {
    console.error('Error in checkAddressDuplicate:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống khi kiểm tra địa chỉ'
    });
  }
}

// API route handlers export
export const secureAddressHandlers = {
  addSecureCustomerAddress,
  getAffiliateSecureAddresses,
  hideSecureAddress,
  getDecryptedSecureAddress,
  checkAddressDuplicate
};