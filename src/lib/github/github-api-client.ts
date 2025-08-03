/**
 * GitHub API Client
 * Handles GitHub API requests with rate limiting and error handling
 */

import { AppError, ErrorCode } from '@/lib/types/api';
import { getGitHubAccessToken } from '@/lib/auth/auth-service';
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
import { getMultiLevelCache, CacheOptions } from './github-api-cache';
import { getCircuitBreaker } from '@/lib/utils/circuit-breaker';
import { logError } from '@/lib/utils/error-handler';

// GitHub API base URL
const GITHUB_API_BASE_URL = 'https://api.github.com';

// Default request headers
const DEFAULT_HEADERS = {
  'Accept': 'application/vnd.github.v3+json',
};

// Request priority levels
export enum RequestPriority {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

// Request queue item interface
interface QueueItem {
  id: string;
  priority: RequestPriority;
  execute: () => Promise<any>;
  resolve: (value: any) => void;
  reject: (error: any) => void;
  timestamp: number;
}

/**
 * GitHub API Client
 */
export class GitHubApiClient {
  private accessToken: string | null = null;
  private rateLimits: RateLimitStatus | null = null;
  private rateLimitResetTime: number | null = null;
  private requestQueue: QueueItem[] = [];
  private isProcessingQueue = false;
  private retryDelays = [1000, 2000, 4000, 8000, 16000]; // Exponential backoff delays in ms
  private cache: ReturnType<typeof getMultiLevelCache>;

  /**
   * Constructor
   */
  constructor() {
    // Start processing the queue
    this.processQueue();

    // Initialize cache
    const memoryCacheOptions: Partial<CacheOptions> = {
      ttl: 5 * 60 * 1000,        // 5 minutes
      staleTime: 2 * 60 * 1000,  // 2 minutes
      maxSize: 1000,             // 1000 items
    };

    const redisCacheOptions: Partial<CacheOptions> = {
      ttl: 15 * 60 * 1000,       // 15 minutes
      staleTime: 5 * 60 * 1000,  // 5 minutes
    };

    this.cache = getMultiLevelCache(memoryCacheOptions, redisCacheOptions);
  }

  /**
   * Set access token
   */
  public setAccessToken(token: string): void {
    this.accessToken = token;
  }

  /**
   * Get access token
   */
  private async getAccessToken(): Promise<string> {
    if (!this.accessToken) {
      try {
        this.accessToken = await getGitHubAccessToken();
      } catch (error) {
        throw new AppError(
          ErrorCode.UNAUTHORIZED,
          'GitHub access token not available',
          401
        );
      }
    }
    return this.accessToken;
  }

  /**
   * Make API request with rate limiting and retries
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    priority: RequestPriority = RequestPriority.MEDIUM,
    retryCount = 0
  ): Promise<T> {
    // Create a unique request ID
    const requestId = Math.random().toString(36).substring(2, 15);

    // Service key for circuit breaker
    const serviceKey = `github-api-${endpoint.split('/')[1] || 'general'}`;

    // Get circuit breaker
    const circuitBreaker = getCircuitBreaker(serviceKey);

    // Return a promise that will be resolved when the request is processed
    return new Promise<T>((resolve, reject) => {
      // Add request to queue
      this.requestQueue.push({
        id: requestId,
        priority,
        execute: async () => {
          // Use circuit breaker to protect against GitHub API failures
          return circuitBreaker.execute(async () => {
            try {
              // Check if we need to wait for rate limit reset
              await this.waitForRateLimitReset();

              // Get access token
              const token = await this.getAccessToken();

              // Prepare headers
              const headers = {
                ...DEFAULT_HEADERS,
                'Authorization': `token ${token}`,
                ...options.headers,
              };

              // Make request
              const response = await fetch(`${GITHUB_API_BASE_URL}${endpoint}`, {
                ...options,
                headers,
              });

              // Update rate limit information
              this.updateRateLimits(response);

              // Handle response
              if (response.ok) {
                // Parse response body
                const data = await response.json();
                return data;
              } else {
                // Handle error response
                const errorData = await response.json().catch(() => ({}));

                // Handle rate limiting
                if (response.status === 403 && response.headers.get('x-ratelimit-remaining') === '0') {
                  if (retryCount < this.retryDelays.length) {
                    // Wait and retry with exponential backoff
                    await new Promise(resolve => setTimeout(resolve, this.retryDelays[retryCount]));
                    return this.makeRequest<T>(endpoint, options, priority, retryCount + 1);
                  }
                }

                // Log error details
                logError(new Error(`GitHub API error: ${response.status}`), {
                  endpoint,
                  status: response.status,
                  errorData,
                });

                // Handle other errors
                throw new AppError(
                  ErrorCode.GITHUB_API_ERROR,
                  errorData.message || `GitHub API error: ${response.status}`,
                  response.status
                );
              }
            } catch (error) {
              // Handle network errors and retries
              if (error instanceof Error && error.name === 'TypeError' && retryCount < this.retryDelays.length) {
                // Network error, retry with exponential backoff
                await new Promise(resolve => setTimeout(resolve, this.retryDelays[retryCount]));
                return this.makeRequest<T>(endpoint, options, priority, retryCount + 1);
              }

              // Log error details
              logError(error, {
                endpoint,
                retryCount,
              });

              // Re-throw other errors
              throw error;
            }
          })
            .catch(async () => {
              // Fallback function to return cached data or empty result when circuit is open
              // Try to get from cache
              const cacheKey = `${endpoint}${options.body ? `-${JSON.stringify(options.body)}` : ''}`;
              const cachedData = await this.cache.getRaw<T>(cacheKey);

              if (cachedData) {
                // Log fallback to cache
                console.warn(`Circuit open for ${serviceKey}, using cached data for ${endpoint}`);
                return cachedData;
              }

              // Log fallback to empty result
              console.warn(`Circuit open for ${serviceKey}, no cached data available for ${endpoint}`);

              // Return empty result based on endpoint
              if (endpoint.includes('/repos/') && endpoint.endsWith('/commits')) {
                return [] as unknown as T; // Empty commits array
              } else if (endpoint.includes('/repos/') && endpoint.endsWith('/pulls')) {
                return [] as unknown as T; // Empty PRs array
              } else if (endpoint.includes('/repos/') && endpoint.endsWith('/issues')) {
                return [] as unknown as T; // Empty issues array
              } else if (endpoint === '/user/repos') {
                return [] as unknown as T; // Empty repos array
              } else {
                // For specific resources, we can't provide a meaningful fallback
                throw new AppError(
                  ErrorCode.SERVICE_UNAVAILABLE,
                  `GitHub API is currently unavailable (${endpoint})`,
                  503
                );
              }
            });
        },
        resolve,
        reject,
        timestamp: Date.now(),
      });

      // Trigger queue processing
      this.processQueue();
    });
  }

  /**
   * Process request queue
   */
  private async processQueue(): Promise<void> {
    // Return if already processing
    if (this.isProcessingQueue) {
      return;
    }

    // Set processing flag
    this.isProcessingQueue = true;

    try {
      // Process queue until empty
      while (this.requestQueue.length > 0) {
        // Sort queue by priority and timestamp
        this.requestQueue.sort((a, b) => {
          // Sort by priority first
          const priorityOrder = {
            [RequestPriority.HIGH]: 0,
            [RequestPriority.MEDIUM]: 1,
            [RequestPriority.LOW]: 2,
          };

          const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];

          if (priorityDiff !== 0) {
            return priorityDiff;
          }

          // Then by timestamp (older first)
          return a.timestamp - b.timestamp;
        });

        // Get next request
        const request = this.requestQueue.shift();

        if (request) {
          try {
            // Execute request
            const result = await request.execute();
            request.resolve(result);
          } catch (error) {
            request.reject(error);
          }
        }
      }
    } finally {
      // Reset processing flag
      this.isProcessingQueue = false;
    }
  }

  /**
   * Update rate limit information from response headers
   */
  private updateRateLimits(response: Response): void {
    const remaining = response.headers.get('x-ratelimit-remaining');
    const reset = response.headers.get('x-ratelimit-reset');
    const limit = response.headers.get('x-ratelimit-limit');

    if (remaining && reset && limit) {
      this.rateLimits = {
        resources: {
          core: {
            limit: parseInt(limit, 10),
            used: parseInt(limit, 10) - parseInt(remaining, 10),
            remaining: parseInt(remaining, 10),
            reset: parseInt(reset, 10),
          },
          search: {
            limit: 0,
            used: 0,
            remaining: 0,
            reset: 0,
          },
          graphql: {
            limit: 0,
            used: 0,
            remaining: 0,
            reset: 0,
          },
        },
        rate: {
          limit: parseInt(limit, 10),
          used: parseInt(limit, 10) - parseInt(remaining, 10),
          remaining: parseInt(remaining, 10),
          reset: parseInt(reset, 10),
        },
      };

      this.rateLimitResetTime = parseInt(reset, 10) * 1000; // Convert to milliseconds
    }
  }

  /**
   * Wait for rate limit reset if needed
   */
  private async waitForRateLimitReset(): Promise<void> {
    if (this.rateLimits && this.rateLimitResetTime) {
      const now = Date.now();

      // If rate limit is exceeded and reset time is in the future
      if (this.rateLimits.rate.remaining <= 0 && this.rateLimitResetTime > now) {
        // Calculate wait time
        const waitTime = this.rateLimitResetTime - now + 1000; // Add 1 second buffer

        // Wait for rate limit reset
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  /**
   * Get raw cached data without fetching from API
   */
  public async getRawCachedData<T>(cacheKey: string): Promise<T | null> {
    try {
      // Try to get from cache directly
      const cachedData = await this.cache.get<T>(cacheKey);
      return cachedData;
    } catch (error) {
      logError(error, { cacheKey });
      return null;
    }
  }

  /**
   * Get rate limit status
   */
  public async getRateLimitStatus(): Promise<RateLimitStatus> {
    // If we already have rate limit info, return it
    if (this.rateLimits) {
      return this.rateLimits;
    }

    // Otherwise, fetch rate limit info
    return this.makeRequest<RateLimitStatus>(
      '/rate_limit',
      { method: 'GET' },
      RequestPriority.LOW
    );
  }

  /**
   * Get user repositories
   */
  public async getUserRepositories(): Promise<Repository[]> {
    const cacheKey = 'user_repos';

    // Try to get from cache first
    const cachedData = await this.cache.get<Repository[]>(cacheKey, async () => {
      return this.makeRequest<Repository[]>(
        '/user/repos?sort=updated&per_page=100',
        { method: 'GET' },
        RequestPriority.HIGH
      );
    });

    return cachedData || [];
  }

  /**
   * Get repository details
   */
  public async getRepositoryDetails(repoFullName: string): Promise<RepositoryDetails> {
    const cacheKey = `repo_details_${repoFullName}`;

    // Try to get from cache first
    const cachedData = await this.cache.get<RepositoryDetails>(cacheKey, async () => {
      return this.makeRequest<RepositoryDetails>(
        `/repos/${repoFullName}`,
        { method: 'GET' },
        RequestPriority.MEDIUM
      );
    });

    if (!cachedData) {
      throw new AppError(
        ErrorCode.REPOSITORY_NOT_FOUND,
        `Repository ${repoFullName} not found`,
        404
      );
    }

    return cachedData;
  }

  /**
   * Get commits for a repository
   */
  public async getCommits(repoFullName: string, since?: Date): Promise<Commit[]> {
    let url = `/repos/${repoFullName}/commits?per_page=100`;

    if (since) {
      url += `&since=${since.toISOString()}`;
    }

    const cacheKey = `commits_${repoFullName}_${since ? since.toISOString() : 'all'}`;

    // Try to get from cache first
    const cachedData = await this.cache.get<Commit[]>(cacheKey, async () => {
      return this.makeRequest<Commit[]>(
        url,
        { method: 'GET' },
        RequestPriority.MEDIUM
      );
    });

    return cachedData || [];
  }

  /**
   * Get commit details
   */
  public async getCommitDetails(repoFullName: string, sha: string): Promise<CommitDetails> {
    const cacheKey = `commit_details_${repoFullName}_${sha}`;

    // Try to get from cache first
    const cachedData = await this.cache.get<CommitDetails>(cacheKey, async () => {
      return this.makeRequest<CommitDetails>(
        `/repos/${repoFullName}/commits/${sha}`,
        { method: 'GET' },
        RequestPriority.LOW
      );
    });

    if (!cachedData) {
      throw new AppError(
        ErrorCode.RECORD_NOT_FOUND,
        `Commit ${sha} not found in repository ${repoFullName}`,
        404
      );
    }

    return cachedData;
  }

  /**
   * Get pull requests for a repository
   */
  public async getPullRequests(repoFullName: string, state: PRState = 'all'): Promise<PullRequest[]> {
    const cacheKey = `prs_${repoFullName}_${state}`;

    // Try to get from cache first
    const cachedData = await this.cache.get<PullRequest[]>(cacheKey, async () => {
      return this.makeRequest<PullRequest[]>(
        `/repos/${repoFullName}/pulls?state=${state}&per_page=100`,
        { method: 'GET' },
        RequestPriority.MEDIUM
      );
    });

    return cachedData || [];
  }

  /**
   * Get pull request details
   */
  public async getPullRequestDetails(repoFullName: string, prNumber: number): Promise<PRDetails> {
    const cacheKey = `pr_details_${repoFullName}_${prNumber}`;

    // Try to get from cache first
    const cachedData = await this.cache.get<PRDetails>(cacheKey, async () => {
      return this.makeRequest<PRDetails>(
        `/repos/${repoFullName}/pulls/${prNumber}`,
        { method: 'GET' },
        RequestPriority.LOW
      );
    });

    if (!cachedData) {
      throw new AppError(
        ErrorCode.RECORD_NOT_FOUND,
        `Pull request #${prNumber} not found in repository ${repoFullName}`,
        404
      );
    }

    return cachedData;
  }

  /**
   * Get issues for a repository
   */
  public async getIssues(repoFullName: string, state: IssueState = 'all'): Promise<Issue[]> {
    const cacheKey = `issues_${repoFullName}_${state}`;

    // Try to get from cache first
    const cachedData = await this.cache.get<Issue[]>(cacheKey, async () => {
      return this.makeRequest<Issue[]>(
        `/repos/${repoFullName}/issues?state=${state}&per_page=100`,
        { method: 'GET' },
        RequestPriority.MEDIUM
      );
    });

    return cachedData || [];
  }

  /**
   * Get issue details
   */
  public async getIssueDetails(repoFullName: string, issueNumber: number): Promise<IssueDetails> {
    const cacheKey = `issue_details_${repoFullName}_${issueNumber}`;

    // Try to get from cache first
    const cachedData = await this.cache.get<IssueDetails>(cacheKey, async () => {
      return this.makeRequest<IssueDetails>(
        `/repos/${repoFullName}/issues/${issueNumber}`,
        { method: 'GET' },
        RequestPriority.LOW
      );
    });

    if (!cachedData) {
      throw new AppError(
        ErrorCode.RECORD_NOT_FOUND,
        `Issue #${issueNumber} not found in repository ${repoFullName}`,
        404
      );
    }

    return cachedData;
  }

  /**
   * Invalidate repository cache
   */
  public async invalidateRepositoryCache(repoFullName: string): Promise<void> {
    await this.cache.invalidateByPrefix(`repo_details_${repoFullName}`);
  }

  /**
   * Invalidate user repositories cache
   */
  public async invalidateUserRepositoriesCache(): Promise<void> {
    await this.cache.invalidateByPrefix('user_repos');
  }

  /**
   * Invalidate commits cache
   */
  public async invalidateCommitsCache(repoFullName: string): Promise<void> {
    await this.cache.invalidateByPrefix(`commits_${repoFullName}`);
  }

  /**
   * Invalidate pull requests cache
   */
  public async invalidatePullRequestsCache(repoFullName: string): Promise<void> {
    await this.cache.invalidateByPrefix(`prs_${repoFullName}`);
    await this.cache.invalidateByPrefix(`pr_details_${repoFullName}`);
  }

  /**
   * Invalidate issues cache
   */
  public async invalidateIssuesCache(repoFullName: string): Promise<void> {
    await this.cache.invalidateByPrefix(`issues_${repoFullName}`);
    await this.cache.invalidateByPrefix(`issue_details_${repoFullName}`);
  }

  /**
   * Invalidate all cache for a repository
   */
  public async invalidateAllRepositoryCache(repoFullName: string): Promise<void> {
    await this.invalidateRepositoryCache(repoFullName);
    await this.invalidateCommitsCache(repoFullName);
    await this.invalidatePullRequestsCache(repoFullName);
    await this.invalidateIssuesCache(repoFullName);
  }
}

// Create singleton instance
let githubApiClient: GitHubApiClient | null = null;

/**
 * Get GitHub API client instance
 */
export function getGitHubApiClient(): GitHubApiClient {
  // Check if we're in mock mode
  const { getDevModeConfig } = require('@/lib/config/dev-mode');
  const { useMockApi } = getDevModeConfig();
  
  if (useMockApi) {
    // In mock mode, use the mock client
    const { getMockGitHubApiClient } = require('./mock-github-api-client');
    return getMockGitHubApiClient();
  }
  
  // In real mode, use the real client
  if (!githubApiClient) {
    githubApiClient = new GitHubApiClient();
  }
  return githubApiClient;
}