/**
 * GitHub API Client Factory
 * 
 * This module provides a factory function to get the appropriate GitHub API client
 * based on the current development mode configuration.
 */

import { GitHubApiClient, getGitHubApiClient } from './github-api-client';
import { MockGitHubApiClient, getMockGitHubApiClient } from './mock-github-api-client';
import { getDevModeConfig } from '../config/dev-mode';

// Cache for client instances
let realClientInstance: GitHubApiClient | null = null;
let mockClientInstance: MockGitHubApiClient | null = null;

/**
 * Get the appropriate GitHub API client based on development mode configuration
 * 
 * @returns GitHubApiClient instance (either real or mock)
 */
export function getAppropriateGitHubApiClient(): GitHubApiClient {
  const config = getDevModeConfig();
  
  if (config.useMockApi) {
    // Log when using mock API client in development mode
    if (process.env.NODE_ENV === 'development' && config.logMockCalls) {
      console.info('🔧 Using mock GitHub API client');
    }
    
    // Return cached instance or create new one
    if (!mockClientInstance) {
      mockClientInstance = getMockGitHubApiClient();
    }
    return mockClientInstance;
  } else {
    // Return cached instance or create new one
    if (!realClientInstance) {
      realClientInstance = getGitHubApiClient();
    }
    return realClientInstance;
  }
}

/**
 * Reset the GitHub API client instances
 * This is useful for testing and when switching between mock and real modes
 */
export function resetGitHubApiClients(): void {
  realClientInstance = null;
  mockClientInstance = null;
}

/**
 * Get GitHub API client based on the current configuration
 * This is a convenience function that can be used instead of importing
 * the client directly from github-api-client.ts
 */
export function getGitHubClient(): GitHubApiClient {
  return getAppropriateGitHubApiClient();
}