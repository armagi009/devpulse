/**
 * Integration tests for mock data store
 * 
 * These tests verify that the mock data store functions work correctly with the database.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '../../db/prisma';
import { getMockData, resetMockData, storeMockData, listMockDataSets, exportMockData, importMockData } from '../mock-data-store';
import { MockData } from '../../types/mock';

describe('Mock Data Store Integration Tests', () => {
  // Create a test data set
  const testData: MockData = {
    repositories: [
      {
        id: 'test-repo-1',
        githubId: 12345,
        name: 'test-repository',
        fullName: 'test-user/test-repository',
        ownerId: 'test-user-1',
        isPrivate: false,
        description: 'Test repository for mock data',
        defaultBranch: 'main',
        language: 'JavaScript',
        createdAt: new Date().toISOString() as any,
        updatedAt: new Date().toISOString() as any,
      }
    ],
    commits: {
      'test-user/test-repository': [
        {
          id: 'commit-1',
          sha: 'abc123def456',
          message: 'Initial commit',
          authorName: 'Test User',
          authorEmail: 'test@example.com',
          authorDate: new Date().toISOString() as any,
          committerName: 'Test User',
          committerEmail: 'test@example.com',
          committerDate: new Date().toISOString() as any,
          additions: 100,
          deletions: 0,
          repositoryId: 'test-repo-1',
          createdAt: new Date().toISOString() as any,
        }
      ]
    },
    pullRequests: {
      'test-user/test-repository': []
    },
    issues: {
      'test-user/test-repository': []
    }
  };

  // Clean up test data after all tests
  afterAll(async () => {
    await prisma.mockDataSet.deleteMany({
      where: {
        name: {
          in: ['integration-test', 'imported-test']
        }
      }
    });
    await prisma.$disconnect();
  });

  it('should store and retrieve mock data', async () => {
    // Store test data
    await storeMockData('integration-test', testData);
    
    // Retrieve the stored data
    const retrievedData = await getMockData('integration-test');
    
    // Verify the data was stored correctly
    expect(retrievedData.repositories.length).toBe(1);
    expect(retrievedData.repositories[0].name).toBe('test-repository');
    expect(retrievedData.commits['test-user/test-repository'].length).toBe(1);
    expect(retrievedData.commits['test-user/test-repository'][0].message).toBe('Initial commit');
  });

  it('should reset mock data', async () => {
    // Reset the data
    await resetMockData('integration-test');
    
    // Get the reset data
    const resetData = await getMockData('integration-test');
    
    // Verify the data was reset
    expect(resetData.repositories.length).toBe(0);
    expect(Object.keys(resetData.commits).length).toBe(0);
  });

  it('should export and import mock data', async () => {
    // Store test data
    await storeMockData('integration-test', testData);
    
    // Export the data
    const exportedData = await exportMockData('integration-test');
    
    // Import the data with a new name
    await importMockData('imported-test', exportedData);
    
    // Retrieve the imported data
    const importedData = await getMockData('imported-test');
    
    // Verify the imported data matches the original
    expect(importedData.repositories.length).toBe(1);
    expect(importedData.repositories[0].name).toBe('test-repository');
    expect(importedData.commits['test-user/test-repository'].length).toBe(1);
    expect(importedData.commits['test-user/test-repository'][0].message).toBe('Initial commit');
  });

  it('should list all mock data sets', async () => {
    // List data sets
    const dataSets = await listMockDataSets();
    
    // Verify our test data sets are in the list
    expect(dataSets).toContain('integration-test');
    expect(dataSets).toContain('imported-test');
  });
});