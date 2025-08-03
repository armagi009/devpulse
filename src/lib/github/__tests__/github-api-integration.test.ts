/**
 * GitHub API Integration Tests
 * 
 * Tests the integration between the GitHub API client and the GitHub API.
 * Uses the mock GitHub API client to avoid making real API calls.
 */

import { getGitHubClient, resetGitHubApiClients } from '../github-api-factory';
import { getMockGitHubApiClient } from '../mock-github-api-client';
import { getDevModeConfig } from '@/lib/config/dev-mode';
import { AppError, ErrorCode } from '@/lib/types/api';

// Mock the dev mode config to ensure we use the mock client
jest.mock('@/lib/config/dev-mode', () => ({
  getDevModeConfig: jest.fn().mockReturnValue({
    useMockApi: true,
    mockDataSet: 'default',
    logMockCalls: false
  })
}));

describe('GitHub API Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetGitHubApiClients();
  });

  it('should get user repositories', async () => {
    // Get the GitHub client (should be mock client due to mocked config)
    const client = getGitHubClient();
    
    // Spy on the mock client's getUserRepositories method
    const mockClient = getMockGitHubApiClient();
    const spy = jest.spyOn(mockClient, 'getUserRepositories');
    
    // Call the method
    const repos = await client.getUserRepositories();
    
    // Verify the method was called
    expect(spy).toHaveBeenCalled();
    
    // Verify we got repositories back
    expect(Array.isArray(repos)).toBe(true);
  });

  it('should get repository details', async () => {
    // Get the GitHub client
    const client = getGitHubClient();
    
    // First get repositories to find a valid repo name
    const repos = await client.getUserRepositories();
    expect(repos.length).toBeGreaterThan(0);
    
    const repoFullName = repos[0].full_name;
    
    // Spy on the mock client's getRepositoryDetails method
    const mockClient = getMockGitHubApiClient();
    const spy = jest.spyOn(mockClient, 'getRepositoryDetails');
    
    // Call the method
    const repoDetails = await client.getRepositoryDetails(repoFullName);
    
    // Verify the method was called with the correct parameters
    expect(spy).toHaveBeenCalledWith(repoFullName);
    
    // Verify we got repository details back
    expect(repoDetails).toBeDefined();
    expect(repoDetails.full_name).toBe(repoFullName);
  });

  it('should throw an error for non-existent repository', async () => {
    // Get the GitHub client
    const client = getGitHubClient();
    
    // Call the method with a non-existent repository
    await expect(client.getRepositoryDetails('non-existent/repo'))
      .rejects
      .toThrow(AppError);
  });

  it('should get commits for a repository', async () => {
    // Get the GitHub client
    const client = getGitHubClient();
    
    // First get repositories to find a valid repo name
    const repos = await client.getUserRepositories();
    expect(repos.length).toBeGreaterThan(0);
    
    const repoFullName = repos[0].full_name;
    
    // Spy on the mock client's getCommits method
    const mockClient = getMockGitHubApiClient();
    const spy = jest.spyOn(mockClient, 'getCommits');
    
    // Call the method
    const commits = await client.getCommits(repoFullName);
    
    // Verify the method was called with the correct parameters
    expect(spy).toHaveBeenCalledWith(repoFullName, undefined);
    
    // Verify we got commits back
    expect(Array.isArray(commits)).toBe(true);
  });

  it('should get commits since a specific date', async () => {
    // Get the GitHub client
    const client = getGitHubClient();
    
    // First get repositories to find a valid repo name
    const repos = await client.getUserRepositories();
    expect(repos.length).toBeGreaterThan(0);
    
    const repoFullName = repos[0].full_name;
    const sinceDate = new Date('2025-01-01');
    
    // Spy on the mock client's getCommits method
    const mockClient = getMockGitHubApiClient();
    const spy = jest.spyOn(mockClient, 'getCommits');
    
    // Call the method
    const commits = await client.getCommits(repoFullName, sinceDate);
    
    // Verify the method was called with the correct parameters
    expect(spy).toHaveBeenCalledWith(repoFullName, sinceDate);
    
    // Verify we got commits back
    expect(Array.isArray(commits)).toBe(true);
  });

  it('should get pull requests for a repository', async () => {
    // Get the GitHub client
    const client = getGitHubClient();
    
    // First get repositories to find a valid repo name
    const repos = await client.getUserRepositories();
    expect(repos.length).toBeGreaterThan(0);
    
    const repoFullName = repos[0].full_name;
    
    // Spy on the mock client's getPullRequests method
    const mockClient = getMockGitHubApiClient();
    const spy = jest.spyOn(mockClient, 'getPullRequests');
    
    // Call the method
    const prs = await client.getPullRequests(repoFullName);
    
    // Verify the method was called with the correct parameters
    expect(spy).toHaveBeenCalledWith(repoFullName, 'all');
    
    // Verify we got pull requests back
    expect(Array.isArray(prs)).toBe(true);
  });

  it('should get issues for a repository', async () => {
    // Get the GitHub client
    const client = getGitHubClient();
    
    // First get repositories to find a valid repo name
    const repos = await client.getUserRepositories();
    expect(repos.length).toBeGreaterThan(0);
    
    const repoFullName = repos[0].full_name;
    
    // Spy on the mock client's getIssues method
    const mockClient = getMockGitHubApiClient();
    const spy = jest.spyOn(mockClient, 'getIssues');
    
    // Call the method
    const issues = await client.getIssues(repoFullName);
    
    // Verify the method was called with the correct parameters
    expect(spy).toHaveBeenCalledWith(repoFullName, 'all');
    
    // Verify we got issues back
    expect(Array.isArray(issues)).toBe(true);
  });

  it('should get rate limit status', async () => {
    // Get the GitHub client
    const client = getGitHubClient();
    
    // Spy on the mock client's getRateLimitStatus method
    const mockClient = getMockGitHubApiClient();
    const spy = jest.spyOn(mockClient, 'getRateLimitStatus');
    
    // Call the method
    const rateLimits = await client.getRateLimitStatus();
    
    // Verify the method was called
    expect(spy).toHaveBeenCalled();
    
    // Verify we got rate limit info back
    expect(rateLimits).toBeDefined();
    expect(rateLimits.resources).toBeDefined();
    expect(rateLimits.rate).toBeDefined();
  });

  it('should handle error simulation', async () => {
    // Mock the error simulation config
    jest.mock('@/lib/mock/mock-errors', () => ({
      executeWithErrorSimulation: jest.fn().mockImplementation((fn, config) => {
        throw new AppError(ErrorCode.GITHUB_API_ERROR, 'Simulated GitHub API error', 500);
      }),
      getErrorSimulationConfig: jest.fn().mockReturnValue({
        enabled: true,
        probability: 1.0 // Always throw an error
      })
    }));
    
    // Reset clients to pick up the new mock
    resetGitHubApiClients();
    
    // Get the GitHub client
    const client = getGitHubClient();
    
    // Call the method and expect it to throw
    await expect(client.getUserRepositories())
      .rejects
      .toThrow(AppError);
  });
});