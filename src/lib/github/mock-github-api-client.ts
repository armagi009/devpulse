/**
 * Mock GitHub API Client
 * 
 * This module provides a mock implementation of the GitHub API client for development and testing.
 * It intercepts GitHub API calls and returns mock responses based on stored mock data.
 * 
 * Implementation for Requirements 2.1, 2.2, 2.3, 2.4, 2.5:
 * - Intercept GitHub API calls and return mock responses
 * - Return realistic mock repository data
 * - Return mock commit data with realistic patterns
 * - Return mock pull request data
 * - Return mock issue data
 */

import { GitHubApiClient, RequestPriority } from './github-api-client';
import { 
  Repository, 
  RepositoryDetails, 
  Commit, 
  CommitDetails, 
  PullRequest, 
  PRDetails, 
  Issue, 
  IssueDetails, 
  RateLimitStatus,
  PRState,
  IssueState
} from '@/lib/types/github';
import { AppError, ErrorCode } from '@/lib/types/api';
import { getMockData } from '../mock/mock-data-store';
import { getDevModeConfig } from '../config/dev-mode';
import { 
  executeWithErrorSimulation, 
  getErrorSimulationConfig, 
  MockErrorConfig 
} from '../mock/mock-errors';

/**
 * Mock GitHub API Client
 * Extends the real GitHub API client and overrides methods to return mock data
 */
export class MockGitHubApiClient extends GitHubApiClient {
  private mockDataSet: string;
  private logMockCalls: boolean;
  private rateLimits: RateLimitStatus | null = null;
  private errorConfig: MockErrorConfig;

  /**
   * Constructor
   */
  constructor() {
    super();
    
    // Get development mode configuration
    const config = getDevModeConfig();
    this.mockDataSet = config.mockDataSet;
    this.logMockCalls = config.logMockCalls;
    
    // Get error simulation configuration
    this.errorConfig = getErrorSimulationConfig();
    
    // Initialize mock rate limits
    this.initializeRateLimits();
  }

  /**
   * Initialize mock rate limits
   */
  private initializeRateLimits(): void {
    const now = Math.floor(Date.now() / 1000);
    const resetTime = now + 3600; // Reset in 1 hour
    
    this.rateLimits = {
      resources: {
        core: {
          limit: 5000,
          used: 0,
          remaining: 5000,
          reset: resetTime
        },
        search: {
          limit: 30,
          used: 0,
          remaining: 30,
          reset: resetTime
        },
        graphql: {
          limit: 5000,
          used: 0,
          remaining: 5000,
          reset: resetTime
        }
      },
      rate: {
        limit: 5000,
        used: 0,
        remaining: 5000,
        reset: resetTime
      }
    };
  }

  /**
   * Update mock rate limits to simulate API usage
   */
  private updateRateLimits(): void {
    if (this.rateLimits) {
      // Simulate API usage by decrementing remaining calls
      this.rateLimits.resources.core.used += 1;
      this.rateLimits.resources.core.remaining -= 1;
      this.rateLimits.rate.used += 1;
      this.rateLimits.rate.remaining -= 1;
      
      // Reset if we've reached the limit
      if (this.rateLimits.rate.remaining <= 0) {
        this.initializeRateLimits();
      }
    }
  }

  /**
   * Log mock API call
   */
  private logMockCall(method: string, params?: any): void {
    if (this.logMockCalls) {
      // Log to console
      console.log(`🔧 [MockGitHubAPI] ${method}`, params ? params : '');
      
      // Emit custom event for the dev mode indicator to capture
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('mockApiCall', {
          detail: {
            timestamp: new Date(),
            method: method,
            params: params
          }
        });
        window.dispatchEvent(event);
      }
    }
  }

  /**
   * Get rate limit status
   */
  public async getRateLimitStatus(): Promise<RateLimitStatus> {
    this.logMockCall('getRateLimitStatus');
    
    return executeWithErrorSimulation(async () => {
      if (!this.rateLimits) {
        this.initializeRateLimits();
      }
      
      return this.rateLimits!;
    }, this.errorConfig);
  }

  /**
   * Get user repositories
   */
  public async getUserRepositories(): Promise<Repository[]> {
    this.logMockCall('getUserRepositories');
    this.updateRateLimits();
    
    return executeWithErrorSimulation(async () => {
      try {
        const mockData = await getMockData(this.mockDataSet);
        return mockData.repositories;
      } catch (error) {
        console.error('Error getting mock repositories:', error);
        return [];
      }
    }, this.errorConfig);
  }

  /**
   * Get repository details
   */
  public async getRepositoryDetails(repoFullName: string): Promise<RepositoryDetails> {
    this.logMockCall('getRepositoryDetails', { repoFullName });
    this.updateRateLimits();
    
    return executeWithErrorSimulation(async () => {
      try {
        const mockData = await getMockData(this.mockDataSet);
        const repository = mockData.repositories.find(repo => repo.full_name === repoFullName);
        
        if (!repository) {
          throw new AppError(
            ErrorCode.REPOSITORY_NOT_FOUND,
            `Repository ${repoFullName} not found`,
            404
          );
        }
        
        // Convert Repository to RepositoryDetails by adding additional fields
        return {
          ...repository,
          stargazers_count: Math.floor(Math.random() * 1000),
          watchers_count: Math.floor(Math.random() * 500),
          forks_count: Math.floor(Math.random() * 300),
          open_issues_count: Math.floor(Math.random() * 50),
          license: Math.random() > 0.3 ? {
            key: 'mit',
            name: 'MIT License',
            url: 'https://api.github.com/licenses/mit'
          } : null
        };
      } catch (error) {
        if (error instanceof AppError) {
          throw error;
        }
        
        console.error('Error getting mock repository details:', error);
        throw new AppError(
          ErrorCode.GITHUB_API_ERROR,
          `Error getting repository details: ${(error as Error).message}`,
          500
        );
      }
    }, this.errorConfig);
  }

  /**
   * Get commits for a repository
   */
  public async getCommits(repoFullName: string, since?: Date): Promise<Commit[]> {
    this.logMockCall('getCommits', { repoFullName, since });
    this.updateRateLimits();
    
    return executeWithErrorSimulation(async () => {
      try {
        const mockData = await getMockData(this.mockDataSet);
        let commits = mockData.commits[repoFullName] || [];
        
        // Filter by date if 'since' is provided
        if (since) {
          const sinceTime = since.getTime();
          commits = commits.filter(commit => {
            const commitDate = new Date(commit.commit.author.date).getTime();
            return commitDate >= sinceTime;
          });
        }
        
        return commits;
      } catch (error) {
        console.error('Error getting mock commits:', error);
        return [];
      }
    }, this.errorConfig);
  }

  /**
   * Get commit details
   */
  public async getCommitDetails(repoFullName: string, sha: string): Promise<CommitDetails> {
    this.logMockCall('getCommitDetails', { repoFullName, sha });
    this.updateRateLimits();
    
    return executeWithErrorSimulation(async () => {
      try {
        const mockData = await getMockData(this.mockDataSet);
        const commits = mockData.commits[repoFullName] || [];
        const commit = commits.find(c => c.sha === sha);
        
        if (!commit) {
          throw new AppError(
            ErrorCode.RECORD_NOT_FOUND,
            `Commit ${sha} not found in repository ${repoFullName}`,
            404
          );
        }
        
        // Convert Commit to CommitDetails by adding additional fields
        return {
          ...commit,
          stats: {
            additions: Math.floor(Math.random() * 100),
            deletions: Math.floor(Math.random() * 50),
            total: Math.floor(Math.random() * 150)
          },
          files: Array.from({ length: Math.floor(Math.random() * 5) + 1 }, () => ({
            filename: `src/${['components', 'lib', 'utils', 'pages', 'api'][Math.floor(Math.random() * 5)]}/${Math.random().toString(36).substring(2, 10)}.ts`,
            additions: Math.floor(Math.random() * 50),
            deletions: Math.floor(Math.random() * 20),
            changes: Math.floor(Math.random() * 70),
            status: ['added', 'modified', 'removed'][Math.floor(Math.random() * 3)],
            patch: Math.random() > 0.5 ? '@@ -1,3 +1,4 @@\n const foo = () => {\n+  console.log("Hello world");\n   return 42;\n };\n' : undefined
          }))
        };
      } catch (error) {
        if (error instanceof AppError) {
          throw error;
        }
        
        console.error('Error getting mock commit details:', error);
        throw new AppError(
          ErrorCode.GITHUB_API_ERROR,
          `Error getting commit details: ${(error as Error).message}`,
          500
        );
      }
    }, this.errorConfig);
  }

  /**
   * Get pull requests for a repository
   */
  public async getPullRequests(repoFullName: string, state: PRState = 'all'): Promise<PullRequest[]> {
    this.logMockCall('getPullRequests', { repoFullName, state });
    this.updateRateLimits();
    
    return executeWithErrorSimulation(async () => {
      try {
        const mockData = await getMockData(this.mockDataSet);
        let pullRequests = mockData.pullRequests[repoFullName] || [];
        
        // Filter by state if not 'all'
        if (state !== 'all') {
          pullRequests = pullRequests.filter(pr => pr.state === state);
        }
        
        return pullRequests;
      } catch (error) {
        console.error('Error getting mock pull requests:', error);
        return [];
      }
    }, this.errorConfig);
  }

  /**
   * Get pull request details
   */
  public async getPullRequestDetails(repoFullName: string, prNumber: number): Promise<PRDetails> {
    this.logMockCall('getPullRequestDetails', { repoFullName, prNumber });
    this.updateRateLimits();
    
    return executeWithErrorSimulation(async () => {
      try {
        const mockData = await getMockData(this.mockDataSet);
        const pullRequests = mockData.pullRequests[repoFullName] || [];
        const pullRequest = pullRequests.find(pr => pr.number === prNumber);
        
        if (!pullRequest) {
          throw new AppError(
            ErrorCode.RECORD_NOT_FOUND,
            `Pull request #${prNumber} not found in repository ${repoFullName}`,
            404
          );
        }
        
        // Convert PullRequest to PRDetails by adding additional fields
        return {
          ...pullRequest,
          body: `This PR implements feature X.\n\n- Added new component\n- Fixed bug in existing code\n- Updated tests`,
          requested_reviewers: Array.from({ length: Math.floor(Math.random() * 3) }, (_, i) => ({
            id: 2000 + i,
            login: `reviewer-${i}`,
            avatar_url: `https://avatars.githubusercontent.com/u/${2000 + i}`
          })),
          head: {
            ref: `feature-branch-${Math.floor(Math.random() * 100)}`,
            sha: Math.random().toString(36).substring(2, 15)
          },
          base: {
            ref: 'main',
            sha: Math.random().toString(36).substring(2, 15)
          },
          mergeable: Math.random() > 0.1, // 90% chance of being mergeable
          mergeable_state: ['clean', 'dirty', 'unknown'][Math.floor(Math.random() * 3)],
          comments: Math.floor(Math.random() * 10),
          review_comments: Math.floor(Math.random() * 5),
          commits: Math.floor(Math.random() * 8) + 1,
          additions: Math.floor(Math.random() * 300),
          deletions: Math.floor(Math.random() * 100),
          changed_files: Math.floor(Math.random() * 10) + 1
        };
      } catch (error) {
        if (error instanceof AppError) {
          throw error;
        }
        
        console.error('Error getting mock pull request details:', error);
        throw new AppError(
          ErrorCode.GITHUB_API_ERROR,
          `Error getting pull request details: ${(error as Error).message}`,
          500
        );
      }
    }, this.errorConfig);
  }

  /**
   * Get issues for a repository
   */
  public async getIssues(repoFullName: string, state: IssueState = 'all'): Promise<Issue[]> {
    this.logMockCall('getIssues', { repoFullName, state });
    this.updateRateLimits();
    
    return executeWithErrorSimulation(async () => {
      try {
        const mockData = await getMockData(this.mockDataSet);
        let issues = mockData.issues[repoFullName] || [];
        
        // Filter by state if not 'all'
        if (state !== 'all') {
          issues = issues.filter(issue => issue.state === state);
        }
        
        return issues;
      } catch (error) {
        console.error('Error getting mock issues:', error);
        return [];
      }
    }, this.errorConfig);
  }

  /**
   * Get issue details
   */
  public async getIssueDetails(repoFullName: string, issueNumber: number): Promise<IssueDetails> {
    this.logMockCall('getIssueDetails', { repoFullName, issueNumber });
    this.updateRateLimits();
    
    return executeWithErrorSimulation(async () => {
      try {
        const mockData = await getMockData(this.mockDataSet);
        const issues = mockData.issues[repoFullName] || [];
        const issue = issues.find(i => i.number === issueNumber);
        
        if (!issue) {
          throw new AppError(
            ErrorCode.RECORD_NOT_FOUND,
            `Issue #${issueNumber} not found in repository ${repoFullName}`,
            404
          );
        }
        
        // Convert Issue to IssueDetails by adding additional fields
        return {
          ...issue,
          body: `## Description\nThis issue is about feature Y.\n\n## Steps to reproduce\n1. Go to page Z\n2. Click button\n3. Observe error`,
          assignees: Array.from({ length: Math.floor(Math.random() * 2) }, (_, i) => ({
            id: 3000 + i,
            login: `assignee-${i}`,
            avatar_url: `https://avatars.githubusercontent.com/u/${3000 + i}`
          })),
          comments: Math.floor(Math.random() * 8)
        };
      } catch (error) {
        if (error instanceof AppError) {
          throw error;
        }
        
        console.error('Error getting mock issue details:', error);
        throw new AppError(
          ErrorCode.GITHUB_API_ERROR,
          `Error getting issue details: ${(error as Error).message}`,
          500
        );
      }
    }, this.errorConfig);
  }

  /**
   * These methods are overridden to prevent actual cache operations
   * since we're using mock data
   */
  public async invalidateRepositoryCache(): Promise<void> {
    this.logMockCall('invalidateRepositoryCache');
    // No-op for mock client
  }

  public async invalidateUserRepositoriesCache(): Promise<void> {
    this.logMockCall('invalidateUserRepositoriesCache');
    // No-op for mock client
  }

  public async invalidateCommitsCache(): Promise<void> {
    this.logMockCall('invalidateCommitsCache');
    // No-op for mock client
  }

  public async invalidatePullRequestsCache(): Promise<void> {
    this.logMockCall('invalidatePullRequestsCache');
    // No-op for mock client
  }

  public async invalidateIssuesCache(): Promise<void> {
    this.logMockCall('invalidateIssuesCache');
    // No-op for mock client
  }

  public async invalidateAllRepositoryCache(): Promise<void> {
    this.logMockCall('invalidateAllRepositoryCache');
    // No-op for mock client
  }
}

// Singleton instance
let mockGitHubApiClient: MockGitHubApiClient | null = null;

/**
 * Get mock GitHub API client instance
 */
export function getMockGitHubApiClient(): MockGitHubApiClient {
  if (!mockGitHubApiClient) {
    mockGitHubApiClient = new MockGitHubApiClient();
  }
  return mockGitHubApiClient;
}