/**
 * Encryption Utility
 * Provides functions for encrypting and decrypting sensitive data
 */

import crypto from 'crypto';

// Get encryption key from environment variable or use a default for development
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'devpulse-default-encryption-key-32chars';
const ENCRYPTION_IV_LENGTH = 16; // For AES, this is always 16 bytes
const ENCRYPTION_ALGORITHM = 'aes-256-cbc';

/**
 * Encrypt a string value
 * @param text The text to encrypt
 * @returns The encrypted text as a hex string with IV prepended
 */
export function encrypt(text: string): string {
  try {
    // Generate a random initialization vector
    const iv = crypto.randomBytes(ENCRYPTION_IV_LENGTH);
    
    // Create cipher with key and iv
    const cipher = crypto.createCipheriv(
      ENCRYPTION_ALGORITHM, 
      Buffer.from(ENCRYPTION_KEY), 
      iv
    );
    
    // Encrypt the text
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Prepend the IV to the encrypted text (IV is needed for decryption)
    return iv.toString('hex') + ':' + encrypted;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt an encrypted string value
 * @param encryptedText The encrypted text with IV prepended
 * @returns The decrypted text
 */
export function decrypt(encryptedText: string): string {
  try {
    // Split the IV and encrypted text
    const textParts = encryptedText.split(':');
    if (textParts.length !== 2) {
      throw new Error('Invalid encrypted text format');
    }
    
    const iv = Buffer.from(textParts[0], 'hex');
    const encryptedData = textParts[1];
    
    // Create decipher with key and iv
    const decipher = crypto.createDecipheriv(
      ENCRYPTION_ALGORITHM, 
      Buffer.from(ENCRYPTION_KEY), 
      iv
    );
    
    // Decrypt the text
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Check if a string is encrypted
 * @param text The text to check
 * @returns True if the text appears to be encrypted
 */
export function isEncrypted(text: string): boolean {
  // Check if the text matches our encryption format (hex IV + ':' + hex encrypted data)
  const pattern = /^[0-9a-f]{32}:[0-9a-f]+$/i;
  return pattern.test(text);
}

/**
 * Hash a value (one-way encryption, cannot be decrypted)
 * @param value The value to hash
 * @returns The hashed value
 */
export function hashValue(value: string): string {
  return crypto
    .createHash('sha256')
    .update(value)
    .digest('hex');
}

/**
 * Generate a secure random token
 * @param length The length of the token in bytes (default: 32)
 * @returns A random token as a hex string
 */
export function generateSecureToken(length = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Safely encrypt a value, with error handling
 * @param value The value to encrypt
 * @returns The encrypted value or the original value if encryption fails
 */
export function safeEncrypt(value: string): string {
  try {
    return encrypt(value);
  } catch (error) {
    console.error('Safe encryption failed:', error);
    return value;
  }
}

/**
 * Safely decrypt a value, with error handling
 * @param value The value to decrypt
 * @returns The decrypted value or the original value if decryption fails
 */
export function safeDecrypt(value: string): string {
  try {
    if (isEncrypted(value)) {
      return decrypt(value);
    }
    return value;
  } catch (error) {
    console.error('Safe decryption failed:', error);
    return value;
  }
}