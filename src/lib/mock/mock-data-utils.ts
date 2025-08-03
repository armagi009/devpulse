/**
 * Mock Data Utilities
 * 
 * This module provides utility functions for working with mock data
 * and integrating it with existing components.
 */

import { getDevModeConfig } from '../config/dev-mode';

/**
 * Check if the application is using mock data
 * 
 * @returns True if mock API is enabled
 */
export function isUsingMockData(): boolean {
  const config = getDevModeConfig();
  return config.useMockApi;
}

/**
 * Get the current mock data set name
 * 
 * @returns The name of the current mock data set
 */
export function getCurrentMockDataSet(): string {
  const config = getDevModeConfig();
  return config.mockDataSet;
}

// Note: JSX components should be in .tsx files, not .ts files
// This function has been moved to MockDataWrapper.tsx

/**
 * Log mock data usage
 * 
 * This function logs when mock data is being used for a specific component.
 * It's useful for debugging and development.
 * 
 * @param componentName The name of the component using mock data
 */
export function logMockDataUsage(componentName: string): void {
  if (isUsingMockData() && process.env.NODE_ENV === 'development') {
    const config = getDevModeConfig();
    if (config.logMockCalls) {
      console.info(`🔧 [MockData] ${componentName} is using mock data from set: ${config.mockDataSet}`);
    }
  }
}