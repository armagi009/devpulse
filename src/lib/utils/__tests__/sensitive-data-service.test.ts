/**
 * Sensitive Data Service Tests
 */

import {
  storeSensitiveData,
  getSensitiveData,
  deleteSensitiveData,
  getAllSensitiveDataByType,
  deleteAllSensitiveData,
} from '../sensitive-data-service';
import { prisma } from '@/lib/db/prisma';
import { encrypt, decrypt } from '../encryption';

// Mock Prisma
jest.mock('@/lib/db/prisma', () => ({
  prisma: {
    sensitiveData: {
      upsert: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
      deleteMany: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
  },
}));

// Mock encryption utilities
jest.mock('../encryption', () => ({
  encrypt: jest.fn((text) => `encrypted:${text}`),
  decrypt: jest.fn((text) => text.replace('encrypted:', '')),
}));

describe('Sensitive Data Service', () => {
  const userId = 'test-user-id';
  const dataType = 'personal';
  const dataKey = 'phone';
  const dataValue = '555-123-4567';
  const encryptedValue = 'encrypted:555-123-4567';
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('storeSensitiveData', () => {
    it('should encrypt and store sensitive data', async () => {
      // Setup
      (prisma.sensitiveData.upsert as jest.Mock).mockResolvedValue({
        id: 'data-id',
        userId,
        dataType,
        dataKey,
        dataValue: encryptedValue,
      });
      
      // Execute
      await storeSensitiveData(userId, dataType, dataKey, dataValue);
      
      // Verify
      expect(encrypt).toHaveBeenCalledWith(dataValue);
      expect(prisma.sensitiveData.upsert).toHaveBeenCalledWith({
        where: {
          userId_dataType_dataKey: {
            userId,
            dataType,
            dataKey,
          },
        },
        update: {
          dataValue: encryptedValue,
          updatedAt: expect.any(Date),
        },
        create: {
          userId,
          dataType,
          dataKey,
          dataValue: encryptedValue,
        },
      });
      expect(prisma.auditLog.create).toHaveBeenCalled();
    });
    
    it('should throw an error if storage fails', async () => {
      // Setup
      (prisma.sensitiveData.upsert as jest.Mock).mockRejectedValue(new Error('Database error'));
      
      // Execute & Verify
      await expect(storeSensitiveData(userId, dataType, dataKey, dataValue)).rejects.toThrow('Failed to store sensitive data');
    });
  });
  
  describe('getSensitiveData', () => {
    it('should retrieve and decrypt sensitive data', async () => {
      // Setup
      (prisma.sensitiveData.findUnique as jest.Mock).mockResolvedValue({
        id: 'data-id',
        userId,
        dataType,
        dataKey,
        dataValue: encryptedValue,
      });
      
      // Execute
      const result = await getSensitiveData(userId, dataType, dataKey);
      
      // Verify
      expect(prisma.sensitiveData.findUnique).toHaveBeenCalledWith({
        where: {
          userId_dataType_dataKey: {
            userId,
            dataType,
            dataKey,
          },
        },
      });
      expect(decrypt).toHaveBeenCalledWith(encryptedValue);
      expect(result).toEqual(dataValue);
      expect(prisma.auditLog.create).toHaveBeenCalled();
    });
    
    it('should return null if data is not found', async () => {
      // Setup
      (prisma.sensitiveData.findUnique as jest.Mock).mockResolvedValue(null);
      
      // Execute
      const result = await getSensitiveData(userId, dataType, dataKey);
      
      // Verify
      expect(result).toBeNull();
    });
    
    it('should return null if retrieval fails', async () => {
      // Setup
      (prisma.sensitiveData.findUnique as jest.Mock).mockRejectedValue(new Error('Database error'));
      
      // Execute
      const result = await getSensitiveData(userId, dataType, dataKey);
      
      // Verify
      expect(result).toBeNull();
    });
  });
  
  describe('deleteSensitiveData', () => {
    it('should delete sensitive data', async () => {
      // Setup
      (prisma.sensitiveData.delete as jest.Mock).mockResolvedValue({
        id: 'data-id',
        userId,
        dataType,
        dataKey,
      });
      
      // Execute
      await deleteSensitiveData(userId, dataType, dataKey);
      
      // Verify
      expect(prisma.sensitiveData.delete).toHaveBeenCalledWith({
        where: {
          userId_dataType_dataKey: {
            userId,
            dataType,
            dataKey,
          },
        },
      });
      expect(prisma.auditLog.create).toHaveBeenCalled();
    });
    
    it('should not throw if deletion fails', async () => {
      // Setup
      (prisma.sensitiveData.delete as jest.Mock).mockRejectedValue(new Error('Database error'));
      
      // Execute & Verify
      await expect(deleteSensitiveData(userId, dataType, dataKey)).resolves.not.toThrow();
    });
  });
  
  describe('getAllSensitiveDataByType', () => {
    it('should retrieve and decrypt all sensitive data of a type', async () => {
      // Setup
      const items = [
        {
          id: 'data-id-1',
          userId,
          dataType,
          dataKey: 'phone',
          dataValue: 'encrypted:555-123-4567',
        },
        {
          id: 'data-id-2',
          userId,
          dataType,
          dataKey: 'address',
          dataValue: 'encrypted:123 Main St',
        },
      ];
      
      (prisma.sensitiveData.findMany as jest.Mock).mockResolvedValue(items);
      
      // Execute
      const result = await getAllSensitiveDataByType(userId, dataType);
      
      // Verify
      expect(prisma.sensitiveData.findMany).toHaveBeenCalledWith({
        where: {
          userId,
          dataType,
        },
      });
      expect(decrypt).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        phone: '555-123-4567',
        address: '123 Main St',
      });
      expect(prisma.auditLog.create).toHaveBeenCalled();
    });
    
    it('should return empty object if no data is found', async () => {
      // Setup
      (prisma.sensitiveData.findMany as jest.Mock).mockResolvedValue([]);
      
      // Execute
      const result = await getAllSensitiveDataByType(userId, dataType);
      
      // Verify
      expect(result).toEqual({});
    });
    
    it('should return empty object if retrieval fails', async () => {
      // Setup
      (prisma.sensitiveData.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));
      
      // Execute
      const result = await getAllSensitiveDataByType(userId, dataType);
      
      // Verify
      expect(result).toEqual({});
    });
  });
  
  describe('deleteAllSensitiveData', () => {
    it('should delete all sensitive data for a user', async () => {
      // Setup
      (prisma.sensitiveData.deleteMany as jest.Mock).mockResolvedValue({ count: 2 });
      
      // Execute
      await deleteAllSensitiveData(userId);
      
      // Verify
      expect(prisma.sensitiveData.deleteMany).toHaveBeenCalledWith({
        where: {
          userId,
        },
      });
      expect(prisma.auditLog.create).toHaveBeenCalled();
    });
    
    it('should throw if deletion fails', async () => {
      // Setup
      (prisma.sensitiveData.deleteMany as jest.Mock).mockRejectedValue(new Error('Database error'));
      
      // Execute & Verify
      await expect(deleteAllSensitiveData(userId)).rejects.toThrow('Failed to delete all sensitive data');
    });
  });
});