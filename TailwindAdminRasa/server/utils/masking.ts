/**
 * Customer Data Masking Utilities
 * Protects customer privacy while maintaining useful information for vendor shipping purposes
 */

/**
 * Masks a Vietnamese customer name for vendor privacy protection
 * 
 * Logic:
 * - Keeps the first word (họ/family name) intact
 * - Masks other words showing only first character + "**"
 * - Returns "Khách hàng" for empty/null/undefined input
 * 
 * @param fullName - The full customer name to mask
 * @returns The masked name
 * 
 * @example
 * maskCustomerName("Nguyễn Văn An") // Returns: "Nguyễn V** A**"
 * maskCustomerName("An") // Returns: "A**"
 * maskCustomerName("") // Returns: "Khách hàng"
 * maskCustomerName(null) // Returns: "Khách hàng"
 * maskCustomerName("Trần Thị Hương Giang") // Returns: "Trần T** H** G**"
 */
export function maskCustomerName(fullName: string): string {
  if (!fullName || typeof fullName !== 'string' || fullName.trim() === '') {
    return 'Khách hàng';
  }

  const words = fullName.trim().split(/\s+/);

  if (words.length === 1) {
    const word = words[0];
    return word.charAt(0) + '**';
  }

  const maskedWords = words.map((word, index) => {
    if (index === 0) {
      return word;
    }
    return word.charAt(0) + '**';
  });

  return maskedWords.join(' ');
}

/**
 * Masks a Vietnamese phone number for vendor privacy protection
 * 
 * Logic:
 * - Normalizes phone to Vietnamese format (removes country code, spaces, dashes)
 * - Keeps first 3 digits + last 4 digits
 * - Masks middle digits with "***"
 * 
 * @param phone - The phone number to mask (supports various formats)
 * @returns The masked phone number
 * 
 * @example
 * maskPhone("0987654321") // Returns: "098***4321"
 * maskPhone("098 765 4321") // Returns: "098***4321"
 * maskPhone("098-765-4321") // Returns: "098***4321"
 * maskPhone("+84987654321") // Returns: "098***4321"
 * maskPhone("84987654321") // Returns: "098***4321"
 * maskPhone("") // Returns: "***"
 * maskPhone("123") // Returns: "123"
 */
export function maskPhone(phone: string): string {
  if (!phone || typeof phone !== 'string') {
    return '***';
  }

  let normalized = phone.trim().replace(/[\s\-\(\)]/g, '');

  if (normalized.startsWith('+84')) {
    normalized = '0' + normalized.slice(3);
  } else if (normalized.startsWith('84')) {
    normalized = '0' + normalized.slice(2);
  }

  const digits = normalized.replace(/\D/g, '');

  if (digits.length === 0) {
    return '***';
  }

  if (digits.length <= 7) {
    return digits;
  }

  const first3 = digits.slice(0, 3);
  const last4 = digits.slice(-4);

  return `${first3}***${last4}`;
}

/**
 * Masks a Vietnamese address for vendor privacy protection
 * 
 * Logic:
 * - Keeps street address (first part before first comma) intact
 * - Masks ward/district/city by showing first word + ".**"
 * - Handles addresses with different comma separators
 * 
 * @param address - The full address to mask
 * @returns The masked address
 * 
 * @example
 * maskAddress("456 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM") 
 * // Returns: "456 Nguyễn Huệ, Phường.**, Quận.**, TP.**"
 * 
 * maskAddress("123 Lê Lợi, Phường 1, Quận 5")
 * // Returns: "123 Lê Lợi, Phường.**, Quận.**"
 * 
 * maskAddress("789 Trần Hưng Đạo")
 * // Returns: "789 Trần Hưng Đạo"
 * 
 * maskAddress("")
 * // Returns: ""
 */
export function maskAddress(address: string): string {
  if (!address || typeof address !== 'string' || address.trim() === '') {
    return '';
  }

  const parts = address.split(',').map(part => part.trim());

  if (parts.length === 1) {
    return parts[0];
  }

  const maskedParts = parts.map((part, index) => {
    if (index === 0) {
      return part;
    }

    const words = part.trim().split(/\s+/);
    if (words.length === 0) {
      return part;
    }

    const firstWord = words[0];
    return `${firstWord}.**`;
  });

  return maskedParts.join(', ');
}
