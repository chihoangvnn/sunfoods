// Client-side AES encryption utilities for Cookie Sync Extension
// Uses Web Crypto API for secure encryption/decryption

class CookieCrypto {
  constructor() {
    this.algorithm = 'AES-GCM';
    this.keyLength = 256;
    this.ivLength = 12; // 96 bits for GCM
  }

  // Generate a new encryption key
  async generateKey() {
    return await crypto.subtle.generateKey(
      {
        name: this.algorithm,
        length: this.keyLength,
      },
      true, // extractable
      ['encrypt', 'decrypt']
    );
  }

  // Derive key from password using PBKDF2
  async deriveKeyFromPassword(password, salt) {
    const encoder = new TextEncoder();
    const passwordKey = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveKey']
    );

    return await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256',
      },
      passwordKey,
      {
        name: this.algorithm,
        length: this.keyLength,
      },
      false, // not extractable
      ['encrypt', 'decrypt']
    );
  }

  // Generate random salt
  generateSalt() {
    return crypto.getRandomValues(new Uint8Array(16));
  }

  // Generate random IV
  generateIV() {
    return crypto.getRandomValues(new Uint8Array(this.ivLength));
  }

  // Encrypt data
  async encrypt(data, key) {
    try {
      const encoder = new TextEncoder();
      const iv = this.generateIV();
      
      const encrypted = await crypto.subtle.encrypt(
        {
          name: this.algorithm,
          iv: iv,
        },
        key,
        encoder.encode(JSON.stringify(data))
      );

      // Combine IV and encrypted data
      const combined = new Uint8Array(iv.length + encrypted.byteLength);
      combined.set(iv);
      combined.set(new Uint8Array(encrypted), iv.length);

      // Return as base64
      return this.arrayBufferToBase64(combined);
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  // Decrypt data
  async decrypt(encryptedData, key) {
    try {
      const combined = this.base64ToArrayBuffer(encryptedData);
      
      // Extract IV and encrypted data
      const iv = combined.slice(0, this.ivLength);
      const encrypted = combined.slice(this.ivLength);

      const decrypted = await crypto.subtle.decrypt(
        {
          name: this.algorithm,
          iv: iv,
        },
        key,
        encrypted
      );

      const decoder = new TextDecoder();
      return JSON.parse(decoder.decode(decrypted));
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  // Encrypt with password (convenience method)
  async encryptWithPassword(data, password) {
    const salt = this.generateSalt();
    const key = await this.deriveKeyFromPassword(password, salt);
    const encrypted = await this.encrypt(data, key);
    
    // Return salt + encrypted data
    const saltBase64 = this.arrayBufferToBase64(salt);
    return {
      salt: saltBase64,
      data: encrypted
    };
  }

  // Decrypt with password (convenience method)
  async decryptWithPassword(encryptedPayload, password) {
    const salt = this.base64ToArrayBuffer(encryptedPayload.salt);
    const key = await this.deriveKeyFromPassword(password, salt);
    return await this.decrypt(encryptedPayload.data, key);
  }

  // Utility: ArrayBuffer to Base64
  arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  // Utility: Base64 to ArrayBuffer
  base64ToArrayBuffer(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

  // Generate a secure random password
  generateSecurePassword(length = 32) {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    const randomValues = crypto.getRandomValues(new Uint8Array(length));
    let password = '';
    
    for (let i = 0; i < length; i++) {
      password += charset[randomValues[i] % charset.length];
    }
    
    return password;
  }

  // Hash data (for integrity checks)
  async hash(data) {
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(JSON.stringify(data)));
    return this.arrayBufferToBase64(hashBuffer);
  }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CookieCrypto;
} else {
  window.CookieCrypto = CookieCrypto;
}