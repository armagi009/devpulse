/**
 * Secure Token Storage Tests
 */

import { storeToken, getToken, deleteToken, hasValidToken, rotateToken } from '../secure-token-storage';
import { prisma } from '@/lib/db/prisma';
import { encrypt, decrypt } from '@/lib/utils/encryption';

// Mock Prisma
jest.mock('@/lib/db/prisma', () => ({
  prisma: {
    userToken: {
      upsert: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
  },
}));

// Mock encryption utilities
jest.mock('@/lib/utils/encryption', () => ({
  encrypt: jest.fn((text) => `encrypted:${text}`),
  decrypt: jest.fn((text) => text.replace('encrypted:', '')),
}));

describe('Secure Token Storage', () => {
  const userId = 'test-user-id';
  const tokenType = 'github';
  const token = 'test-token-value';
  const encryptedToken = 'encrypted:test-token-value';
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('storeToken', () => {
    it('should encrypt and store a token', async () => {
      // Setup
      (prisma.userToken.upsert as jest.Mock).mockResolvedValue({
        id: 'token-id',
        userId,
        tokenType,
        token: encryptedToken,
      });
      
      // Execute
      await storeToken(userId, tokenType, token);
      
      // Verify
      expect(encrypt).toHaveBeenCalledWith(token);
      expect(prisma.userToken.upsert).toHaveBeenCalledWith({
        where: {
          userId_tokenType: {
            userId,
            tokenType,
          },
        },
        update: {
          token: encryptedToken,
          updatedAt: expect.any(Date),
        },
        create: {
          userId,
          tokenType,
          token: encryptedToken,
        },
      });
    });
    
    it('should throw an error if storage fails', async () => {
      // Setup
      (prisma.userToken.upsert as jest.Mock).mockRejectedValue(new Error('Database error'));
      
      // Execute & Verify
      await expect(storeToken(userId, tokenType, token)).rejects.toThrow('Failed to store github token');
    });
  });
  
  describe('getToken', () => {
    it('should retrieve and decrypt a token', async () => {
      // Setup
      (prisma.userToken.findUnique as jest.Mock).mockResolvedValue({
        id: 'token-id',
        userId,
        tokenType,
        token: encryptedToken,
      });
      
      // Execute
      const result = await getToken(userId, tokenType);
      
      // Verify
      expect(prisma.userToken.findUnique).toHaveBeenCalledWith({
        where: {
          userId_tokenType: {
            userId,
            tokenType,
          },
        },
      });
      expect(decrypt).toHaveBeenCalledWith(encryptedToken);
      expect(result).toEqual(token);
    });
    
    it('should return null if token is not found', async () => {
      // Setup
      (prisma.userToken.findUnique as jest.Mock).mockResolvedValue(null);
      
      // Execute
      const result = await getToken(userId, tokenType);
      
      // Verify
      expect(result).toBeNull();
    });
    
    it('should return null if retrieval fails', async () => {
      // Setup
      (prisma.userToken.findUnique as jest.Mock).mockRejectedValue(new Error('Database error'));
      
      // Execute
      const result = await getToken(userId, tokenType);
      
      // Verify
      expect(result).toBeNull();
    });
  });
  
  describe('deleteToken', () => {
    it('should delete a token', async () => {
      // Setup
      (prisma.userToken.delete as jest.Mock).mockResolvedValue({
        id: 'token-id',
        userId,
        tokenType,
      });
      
      // Execute
      await deleteToken(userId, tokenType);
      
      // Verify
      expect(prisma.userToken.delete).toHaveBeenCalledWith({
        where: {
          userId_tokenType: {
            userId,
            tokenType,
          },
        },
      });
    });
    
    it('should not throw if deletion fails', async () => {
      // Setup
      (prisma.userToken.delete as jest.Mock).mockRejectedValue(new Error('Database error'));
      
      // Execute & Verify
      await expect(deleteToken(userId, tokenType)).resolves.not.toThrow();
    });
  });
  
  describe('hasValidToken', () => {
    it('should return true if token exists', async () => {
      // Setup
      (prisma.userToken.findUnique as jest.Mock).mockResolvedValue({
        id: 'token-id',
        userId,
        tokenType,
        token: encryptedToken,
      });
      
      // Execute
      const result = await hasValidToken(userId, tokenType);
      
      // Verify
      expect(result).toBe(true);
    });
    
    it('should return false if token does not exist', async () => {
      // Setup
      (prisma.userToken.findUnique as jest.Mock).mockResolvedValue(null);
      
      // Execute
      const result = await hasValidToken(userId, tokenType);
      
      // Verify
      expect(result).toBe(false);
    });
    
    it('should return false if check fails', async () => {
      // Setup
      (prisma.userToken.findUnique as jest.Mock).mockRejectedValue(new Error('Database error'));
      
      // Execute
      const result = await hasValidToken(userId, tokenType);
      
      // Verify
      expect(result).toBe(false);
    });
  });
});