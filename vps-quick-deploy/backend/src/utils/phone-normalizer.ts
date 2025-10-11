/**
 * 📱 Phone Number Normalization Utility
 * Converts various phone formats to Vietnam local format (0xxxxxxxxx)
 */

/**
 * Normalize phone number to Vietnam local format (0xxxxxxxxx)
 * Handles Vietnam local and international formats
 * 
 * @param phone - Phone number in any format
 * @returns Normalized phone in Vietnam local format (0xxxxxxxxx)
 * 
 * @example
 * normalizePhoneToE164('0905608298')    // → '0905608298'
 * normalizePhoneToE164('84905608298')   // → '0905608298'
 * normalizePhoneToE164('+84905608298')  // → '0905608298'
 * normalizePhoneToE164('09 056 082 98') // → '0905608298'
 */
export function normalizePhoneToE164(phone: string): string {
  if (!phone || phone.trim() === '') return '';
  
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '');
  
  // Guard against invalid input
  if (cleaned.length === 0) return '';
  
  // Handle Vietnam formats - normalize to 0xxxxxxxxx:
  // 1. International with 00 prefix: 0084905608298 → 0905608298
  if (cleaned.startsWith('0084')) {
    cleaned = cleaned.substring(4); // Remove "0084"
    return `0${cleaned}`;
  }
  
  // 2. Legacy format 084xxx (12 digits): 084905608298 → 0905608298
  if (cleaned.startsWith('084') && cleaned.length === 12) {
    cleaned = cleaned.substring(3); // Remove "084" → 905608298
    return `0${cleaned}`; // Add leading 0 → 0905608298
  }
  
  // 3. International format: +84905608298 or 84905608298 → 0905608298
  if (cleaned.startsWith('84')) {
    cleaned = cleaned.substring(2); // Remove "84"
    return `0${cleaned}`;
  }
  
  // 4. Already in local format: 0905608298 → 0905608298
  if (cleaned.startsWith('0')) {
    return cleaned;
  }
  
  // Default: assume Vietnam local number without 0, add 0
  return `0${cleaned}`;
}

/**
 * Check if a phone number is valid Vietnam phone
 * Vietnam mobile: 03x, 05x, 07x, 08x, 09x (10 digits total)
 * 
 * @param phone - Phone number to validate
 * @returns true if valid Vietnam phone
 */
export function isValidVietnamPhone(phone: string): boolean {
  const normalized = normalizePhoneToE164(phone);
  
  // Vietnam local format: 0 + (3|5|7|8|9) + 8 digits = 10 digits total
  // Valid prefixes: 03x, 05x, 07x, 08x, 09x
  const vietnamMobilePattern = /^0(3|5|7|8|9)\d{8}$/;
  
  return vietnamMobilePattern.test(normalized);
}
