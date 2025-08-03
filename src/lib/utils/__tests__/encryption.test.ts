/**
 * Encryption Utility Tests
 */

import { encrypt, decrypt, isEncrypted, hashValue, generateSecureToken } from '../encryption';

describe('Encryption Utility', () => {
  const testValue = 'sensitive-test-data-123';
  
  describe('encrypt and decrypt', () => {
    it('should encrypt and decrypt a string correctly', () => {
      const encrypted = encrypt(testValue);
      
      // Encrypted value should be different from original
      expect(encrypted).not.toEqual(testValue);
      
      // Encrypted value should contain a colon (IV:encryptedData format)
      expect(encrypted).toContain(':');
      
      // Decrypted value should match original
      const decrypted = decrypt(encrypted);
      expect(decrypted).toEqual(testValue);
    });
    
    it('should produce different ciphertexts for the same plaintext', () => {
      // Due to random IV, encrypting the same value twice should produce different results
      const encrypted1 = encrypt(testValue);
      const encrypted2 = encrypt(testValue);
      
      expect(encrypted1).not.toEqual(encrypted2);
      
      // But both should decrypt to the same value
      expect(decrypt(encrypted1)).toEqual(testValue);
      expect(decrypt(encrypted2)).toEqual(testValue);
    });
    
    it('should throw an error when decrypting invalid data', () => {
      expect(() => decrypt('invalid-encrypted-data')).toThrow();
    });
  });
  
  describe('isEncrypted', () => {
    it('should correctly identify encrypted strings', () => {
      const encrypted = encrypt(testValue);
      expect(isEncrypted(encrypted)).toBe(true);
    });
    
    it('should correctly identify non-encrypted strings', () => {
      expect(isEncrypted('plain text')).toBe(false);
      expect(isEncrypted('123456')).toBe(false);
      expect(isEncrypted('')).toBe(false);
    });
  });
  
  describe('hashValue', () => {
    it('should create a hash of a string', () => {
      const hash = hashValue(testValue);
      
      // Hash should be a hex string
      expect(hash).toMatch(/^[0-9a-f]+$/i);
      
      // Hash should be 64 characters (SHA-256 produces 32 bytes = 64 hex chars)
      expect(hash).toHaveLength(64);
    });
    
    it('should produce the same hash for the same input', () => {
      const hash1 = hashValue(testValue);
      const hash2 = hashValue(testValue);
      
      expect(hash1).toEqual(hash2);
    });
    
    it('should produce different hashes for different inputs', () => {
      const hash1 = hashValue(testValue);
      const hash2 = hashValue(testValue + '!');
      
      expect(hash1).not.toEqual(hash2);
    });
  });
  
  describe('generateSecureToken', () => {
    it('should generate a random token of the specified length', () => {
      const token = generateSecureToken(16);
      
      // Token should be a hex string
      expect(token).toMatch(/^[0-9a-f]+$/i);
      
      // Token should be 32 characters (16 bytes = 32 hex chars)
      expect(token).toHaveLength(32);
    });
    
    it('should generate different tokens on each call', () => {
      const token1 = generateSecureToken();
      const token2 = generateSecureToken();
      
      expect(token1).not.toEqual(token2);
    });
  });
});