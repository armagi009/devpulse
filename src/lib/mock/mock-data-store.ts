/**
 * Mock Data Store
 * 
 * This module provides functions for managing mock data persistence, loading, and resetting.
 * It interacts with the database to store and retrieve mock data sets.
 * 
 * Implementation for Requirements 5.1, 5.2, 5.3, 5.4:
 * - Store mock data in a local database
 * - Load previously generated mock data on application restart
 * - Provide options to reset mock data
 * - Support exporting and importing mock data sets
 */

import { prisma } from '../db/prisma';
import { MockData, MockDataOptions, MockDataSet } from '../types/mock';
import { generateMockData } from './mock-data-generator';

/**
 * Get mock data from the database or generate new data if it doesn't exist
 * 
 * @param dataSet The name of the mock data set to retrieve
 * @param options Optional configuration for generating new mock data
 * @returns The mock data object
 */
export async function getMockData(dataSet = 'default', options?: MockDataOptions): Promise<MockData> {
  try {
    // Check if mock data exists in the database
    const existingData = await prisma.mockDataSet.findUnique({
      where: { name: dataSet },
    });

    if (existingData) {
      return JSON.parse(existingData.data) as MockData;
    }

    // If no data exists and options are provided, generate new mock data
    if (options) {
      const mockData = await generateMockData(options);
      await storeMockData(dataSet, mockData);
      return mockData;
    }

    // If no options are provided, use default options to generate mock data
    const defaultOptions: MockDataOptions = {
      repositories: 5,
      usersPerRepo: 3,
      timeRangeInDays: 90,
      activityLevel: 'medium',
      burnoutPatterns: true,
      collaborationPatterns: true,
    };

    const mockData = await generateMockData(defaultOptions);
    await storeMockData(dataSet, mockData);
    return mockData;
  } catch (error) {
    console.error('Error getting mock data:', error);
    throw new Error(`Failed to get mock data: ${(error as Error).message}`);
  }
}

/**
 * Store mock data in the database
 * 
 * @param dataSet The name of the mock data set
 * @param data The mock data to store
 * @returns The stored mock data set
 */
export async function storeMockData(dataSet: string, data: MockData): Promise<MockDataSet> {
  try {
    return await prisma.mockDataSet.upsert({
      where: { name: dataSet },
      update: {
        data: JSON.stringify(data),
        updatedAt: new Date(),
      },
      create: {
        name: dataSet,
        data: JSON.stringify(data),
      },
    });
  } catch (error) {
    console.error('Error storing mock data:', error);
    throw new Error(`Failed to store mock data: ${(error as Error).message}`);
  }
}

/**
 * Reset mock data by deleting existing data and optionally generating new data
 * 
 * @param dataSet The name of the mock data set to reset
 * @param options Optional configuration for generating new mock data
 * @param newData Optional new data to store after resetting (takes precedence over options)
 * @returns The new mock data
 */
export async function resetMockData(
  dataSet = 'default', 
  options?: MockDataOptions,
  newData?: MockData
): Promise<MockData> {
  try {
    // Delete existing mock data
    await prisma.mockDataSet.deleteMany({
      where: { name: dataSet },
    });

    // If new data is provided, store it
    if (newData) {
      await storeMockData(dataSet, newData);
      return newData;
    }

    // If options are provided, generate new mock data
    if (options) {
      const mockData = await generateMockData(options);
      await storeMockData(dataSet, mockData);
      return mockData;
    }

    // Otherwise, generate with default options
    const defaultOptions: MockDataOptions = {
      repositories: 5,
      usersPerRepo: 3,
      timeRangeInDays: 90,
      activityLevel: 'medium',
      burnoutPatterns: true,
      collaborationPatterns: true,
    };

    const mockData = await generateMockData(defaultOptions);
    await storeMockData(dataSet, mockData);
    return mockData;
  } catch (error) {
    console.error('Error resetting mock data:', error);
    throw new Error(`Failed to reset mock data: ${(error as Error).message}`);
  }
}

/**
 * List all available mock data sets
 * 
 * @returns Array of mock data set names
 */
export async function listMockDataSets(): Promise<string[]> {
  try {
    const dataSets = await prisma.mockDataSet.findMany({
      select: { name: true },
    });
    return dataSets.map(set => set.name);
  } catch (error) {
    console.error('Error listing mock data sets:', error);
    throw new Error(`Failed to list mock data sets: ${(error as Error).message}`);
  }
}

/**
 * Export a mock data set as a JSON string
 * 
 * @param dataSet The name of the mock data set to export
 * @returns JSON string representation of the mock data
 */
export async function exportMockData(dataSet = 'default'): Promise<string> {
  try {
    const existingData = await prisma.mockDataSet.findUnique({
      where: { name: dataSet },
    });

    if (!existingData) {
      throw new Error(`Mock data set '${dataSet}' not found`);
    }

    return existingData.data;
  } catch (error) {
    console.error('Error exporting mock data:', error);
    throw new Error(`Failed to export mock data: ${(error as Error).message}`);
  }
}

/**
 * Import mock data from a JSON string
 * 
 * @param dataSet The name to give the imported mock data set
 * @param jsonData JSON string representation of the mock data
 * @returns The imported mock data
 */
export async function importMockData(dataSet: string, jsonData: string): Promise<MockData> {
  try {
    // Validate that the JSON data is a valid MockData structure
    const parsedData = JSON.parse(jsonData) as MockData;
    
    // Ensure the data has the required structure
    if (!parsedData.repositories || !parsedData.commits || 
        !parsedData.pullRequests || !parsedData.issues) {
      throw new Error('Invalid mock data structure');
    }

    // Store the imported data
    await storeMockData(dataSet, parsedData);
    return parsedData;
  } catch (error) {
    console.error('Error importing mock data:', error);
    throw new Error(`Failed to import mock data: ${(error as Error).message}`);
  }
}