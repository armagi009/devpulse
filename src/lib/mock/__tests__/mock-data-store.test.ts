/**
 * Mock Data Store Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getMockData, storeMockData, resetMockData, listMockDataSets, exportMockData, importMockData } from '../mock-data-store';
import { MockData } from '../../types/mock';
import { prisma } from '../../db/prisma';

// Mock Prisma client
vi.mock('../../db/prisma', () => {
  return {
    prisma: {
      mockDataSet: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
        upsert: vi.fn(),
        deleteMany: vi.fn(),
      },
    },
  };
});

describe('Mock Data Store', () => {
  // Create a fixed date string for testing to avoid JSON serialization issues
  const testDate = '2025-01-01T00:00:00.000Z';
  
  const mockDataSample: MockData = {
    repositories: [
      {
        id: '1',
        githubId: 123,
        name: 'test-repo',
        fullName: 'user/test-repo',
        ownerId: 'user-1',
        isPrivate: false,
        description: 'Test repository',
        defaultBranch: 'main',
        language: 'TypeScript',
        createdAt: testDate as any,
        updatedAt: testDate as any,
      },
    ],
    commits: {
      'user/test-repo': [
        {
          id: '1',
          sha: 'abc123',
          message: 'Initial commit',
          authorName: 'Test User',
          authorEmail: 'test@example.com',
          authorDate: testDate as any,
          committerName: 'Test User',
          committerEmail: 'test@example.com',
          committerDate: testDate as any,
          additions: 100,
          deletions: 0,
          repositoryId: '1',
          createdAt: testDate as any,
        },
      ],
    },
    pullRequests: {
      'user/test-repo': [],
    },
    issues: {
      'user/test-repo': [],
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('getMockData', () => {
    it('should return existing mock data if it exists', async () => {
      const mockDataSet = {
        id: '1',
        name: 'default',
        data: JSON.stringify(mockDataSample),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.mockDataSet.findUnique as any).mockResolvedValue(mockDataSet);

      const result = await getMockData();
      expect(result).toEqual(mockDataSample);
      expect(prisma.mockDataSet.findUnique).toHaveBeenCalledWith({
        where: { name: 'default' },
      });
    });

    it('should create empty mock data if it does not exist', async () => {
      (prisma.mockDataSet.findUnique as any).mockResolvedValue(null);
      (prisma.mockDataSet.upsert as any).mockResolvedValue({
        id: '1',
        name: 'default',
        data: JSON.stringify({
          repositories: [],
          commits: {},
          pullRequests: {},
          issues: {},
        }),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await getMockData();
      expect(result).toEqual({
        repositories: [],
        commits: {},
        pullRequests: {},
        issues: {},
      });
      expect(prisma.mockDataSet.upsert).toHaveBeenCalled();
    });
  });

  describe('storeMockData', () => {
    it('should store mock data in the database', async () => {
      const mockDataSet = {
        id: '1',
        name: 'test',
        data: JSON.stringify(mockDataSample),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.mockDataSet.upsert as any).mockResolvedValue(mockDataSet);

      const result = await storeMockData('test', mockDataSample);
      expect(result).toEqual(mockDataSet);
      expect(prisma.mockDataSet.upsert).toHaveBeenCalledWith({
        where: { name: 'test' },
        update: {
          data: JSON.stringify(mockDataSample),
          updatedAt: expect.any(Date),
        },
        create: {
          name: 'test',
          data: JSON.stringify(mockDataSample),
        },
      });
    });
  });

  describe('resetMockData', () => {
    it('should delete existing mock data and create empty data', async () => {
      (prisma.mockDataSet.deleteMany as any).mockResolvedValue({ count: 1 });
      (prisma.mockDataSet.upsert as any).mockResolvedValue({
        id: '1',
        name: 'default',
        data: JSON.stringify({
          repositories: [],
          commits: {},
          pullRequests: {},
          issues: {},
        }),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await resetMockData();
      expect(result).toEqual({
        repositories: [],
        commits: {},
        pullRequests: {},
        issues: {},
      });
      expect(prisma.mockDataSet.deleteMany).toHaveBeenCalledWith({
        where: { name: 'default' },
      });
      expect(prisma.mockDataSet.upsert).toHaveBeenCalled();
    });

    it('should store new data if provided', async () => {
      (prisma.mockDataSet.deleteMany as any).mockResolvedValue({ count: 1 });
      (prisma.mockDataSet.upsert as any).mockResolvedValue({
        id: '1',
        name: 'test',
        data: JSON.stringify(mockDataSample),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await resetMockData('test', mockDataSample);
      expect(result).toEqual(mockDataSample);
      expect(prisma.mockDataSet.deleteMany).toHaveBeenCalledWith({
        where: { name: 'test' },
      });
      expect(prisma.mockDataSet.upsert).toHaveBeenCalled();
    });
  });

  describe('listMockDataSets', () => {
    it('should return a list of mock data set names', async () => {
      (prisma.mockDataSet.findMany as any).mockResolvedValue([
        { name: 'default' },
        { name: 'test' },
      ]);

      const result = await listMockDataSets();
      expect(result).toEqual(['default', 'test']);
      expect(prisma.mockDataSet.findMany).toHaveBeenCalledWith({
        select: { name: true },
      });
    });
  });

  describe('exportMockData', () => {
    it('should return the JSON string of the mock data', async () => {
      const mockDataSet = {
        id: '1',
        name: 'default',
        data: JSON.stringify(mockDataSample),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.mockDataSet.findUnique as any).mockResolvedValue(mockDataSet);

      const result = await exportMockData();
      expect(result).toEqual(JSON.stringify(mockDataSample));
      expect(prisma.mockDataSet.findUnique).toHaveBeenCalledWith({
        where: { name: 'default' },
      });
    });

    it('should throw an error if the mock data set does not exist', async () => {
      (prisma.mockDataSet.findUnique as any).mockResolvedValue(null);

      await expect(exportMockData('nonexistent')).rejects.toThrow(
        "Failed to export mock data: Mock data set 'nonexistent' not found"
      );
    });
  });

  describe('importMockData', () => {
    it('should import mock data from a JSON string', async () => {
      const jsonData = JSON.stringify(mockDataSample);
      const mockDataSet = {
        id: '1',
        name: 'imported',
        data: jsonData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.mockDataSet.upsert as any).mockResolvedValue(mockDataSet);

      const result = await importMockData('imported', jsonData);
      expect(result).toEqual(mockDataSample);
      expect(prisma.mockDataSet.upsert).toHaveBeenCalledWith({
        where: { name: 'imported' },
        update: {
          data: jsonData,
          updatedAt: expect.any(Date),
        },
        create: {
          name: 'imported',
          data: jsonData,
        },
      });
    });

    it('should throw an error if the JSON data is invalid', async () => {
      const invalidJson = '{"repositories": []}'; // Missing required fields

      await expect(importMockData('invalid', invalidJson)).rejects.toThrow(
        'Failed to import mock data: Invalid mock data structure'
      );
    });
  });
});