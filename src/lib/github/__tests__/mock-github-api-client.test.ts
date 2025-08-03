/**
 * Mock GitHub API Client Tests
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { MockGitHubApiClient, getMockGitHubApiClient } from '../mock-github-api-client';
import { getMockData } from '../../mock/mock-data-store';
import { getDevModeConfig } from '../../config/dev-mode';
import { AppError, ErrorCode } from '@/lib/types/api';

// Mock dependencies
vi.mock('../../mock/mock-data-store');
vi.mock('../../config/dev-mode');

describe('MockGitHubApiClient', () => {
  // Sample mock data for testing
  const mockRepositories = [
    {
      id: 123456,
      name: 'test-repo',
      full_name: 'test-user/test-repo',
      owner: {
        id: 1001,
        login: 'test-user',
        avatar_url: 'https://example.com/avatar.png'
      },
      private: false,
      html_url: 'https://github.com/test-user/test-repo',
      description: 'Test repository',
      default_branch: 'main',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-02T00:00:00Z',
      pushed_at: '2023-01-03T00:00:00Z',
      language: 'TypeScript',
      topics: ['test', 'mock']
    }
  ];

  const mockCommits = {
    'test-user/test-repo': [
      {
        sha: 'abc123',
        commit: {
          author: {
            name: 'Test User',
            email: 'test@example.com',
            date: '2023-01-01T12:00:00Z'
          },
          committer: {
            name: 'Test User',
            email: 'test@example.com',
            date: '2023-01-01T12:00:00Z'
          },
          message: 'Test commit'
        },
        author: {
          id: 1001,
          login: 'test-user',
          avatar_url: 'https://example.com/avatar.png'
        },
        committer: {
          id: 1001,
          login: 'test-user',
          avatar_url: 'https://example.com/avatar.png'
        },
        html_url: 'https://github.com/test-user/test-repo/commit/abc123'
      }
    ]
  };

  const mockPullRequests = {
    'test-user/test-repo': [
      {
        id: 987654,
        number: 1,
        title: 'Test PR',
        user: {
          id: 1001,
          login: 'test-user',
          avatar_url: 'https://example.com/avatar.png'
        },
        state: 'open',
        created_at: '2023-01-04T00:00:00Z',
        updated_at: '2023-01-05T00:00:00Z',
        closed_at: null,
        merged_at: null,
        html_url: 'https://github.com/test-user/test-repo/pull/1',
        draft: false
      }
    ]
  };

  const mockIssues = {
    'test-user/test-repo': [
      {
        id: 567890,
        number: 1,
        title: 'Test Issue',
        user: {
          id: 1001,
          login: 'test-user',
          avatar_url: 'https://example.com/avatar.png'
        },
        state: 'open',
        created_at: '2023-01-06T00:00:00Z',
        updated_at: '2023-01-07T00:00:00Z',
        closed_at: null,
        html_url: 'https://github.com/test-user/test-repo/issues/1',
        labels: []
      }
    ]
  };

  // Setup mocks before each test
  beforeEach(() => {
    // Mock getDevModeConfig
    vi.mocked(getDevModeConfig).mockReturnValue({
      useMockAuth: true,
      useMockApi: true,
      mockDataSet: 'test',
      showDevModeIndicator: true,
      logMockCalls: false
    });

    // Mock getMockData
    vi.mocked(getMockData).mockResolvedValue({
      repositories: mockRepositories,
      commits: mockCommits,
      pullRequests: mockPullRequests,
      issues: mockIssues
    });

    // Spy on console.log and console.error
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create a singleton instance', () => {
    const client1 = getMockGitHubApiClient();
    const client2 = getMockGitHubApiClient();
    expect(client1).toBe(client2);
  });

  it('should get rate limit status', async () => {
    const client = getMockGitHubApiClient();
    const rateLimits = await client.getRateLimitStatus();
    
    expect(rateLimits).toBeDefined();
    expect(rateLimits.resources).toBeDefined();
    expect(rateLimits.resources.core).toBeDefined();
    expect(rateLimits.resources.core.limit).toBeGreaterThan(0);
  });

  it('should get user repositories', async () => {
    const client = getMockGitHubApiClient();
    const repositories = await client.getUserRepositories();
    
    expect(repositories).toEqual(mockRepositories);
    expect(getMockData).toHaveBeenCalledWith('test');
  });

  it('should get repository details', async () => {
    const client = getMockGitHubApiClient();
    const repoDetails = await client.getRepositoryDetails('test-user/test-repo');
    
    expect(repoDetails).toBeDefined();
    expect(repoDetails.id).toBe(123456);
    expect(repoDetails.name).toBe('test-repo');
    expect(repoDetails.stargazers_count).toBeDefined();
    expect(repoDetails.watchers_count).toBeDefined();
    expect(repoDetails.forks_count).toBeDefined();
    expect(repoDetails.open_issues_count).toBeDefined();
  });

  it('should throw error for non-existent repository', async () => {
    const client = getMockGitHubApiClient();
    
    await expect(client.getRepositoryDetails('non-existent/repo')).rejects.toThrow(
      new AppError(
        ErrorCode.REPOSITORY_NOT_FOUND,
        'Repository non-existent/repo not found',
        404
      )
    );
  });

  it('should get commits for a repository', async () => {
    const client = getMockGitHubApiClient();
    const commits = await client.getCommits('test-user/test-repo');
    
    expect(commits).toEqual(mockCommits['test-user/test-repo']);
  });

  it('should filter commits by date when since parameter is provided', async () => {
    const client = getMockGitHubApiClient();
    const since = new Date('2023-01-02T00:00:00Z');
    const commits = await client.getCommits('test-user/test-repo', since);
    
    // All commits are before the since date, so should return empty array
    expect(commits).toEqual([]);
  });

  it('should get commit details', async () => {
    const client = getMockGitHubApiClient();
    const commitDetails = await client.getCommitDetails('test-user/test-repo', 'abc123');
    
    expect(commitDetails).toBeDefined();
    expect(commitDetails.sha).toBe('abc123');
    expect(commitDetails.stats).toBeDefined();
    expect(commitDetails.files).toBeDefined();
    expect(Array.isArray(commitDetails.files)).toBe(true);
  });

  it('should throw error for non-existent commit', async () => {
    const client = getMockGitHubApiClient();
    
    await expect(client.getCommitDetails('test-user/test-repo', 'non-existent')).rejects.toThrow(
      new AppError(
        ErrorCode.RECORD_NOT_FOUND,
        'Commit non-existent not found in repository test-user/test-repo',
        404
      )
    );
  });

  it('should get pull requests for a repository', async () => {
    const client = getMockGitHubApiClient();
    const pullRequests = await client.getPullRequests('test-user/test-repo');
    
    expect(pullRequests).toEqual(mockPullRequests['test-user/test-repo']);
  });

  it('should filter pull requests by state', async () => {
    const client = getMockGitHubApiClient();
    const openPRs = await client.getPullRequests('test-user/test-repo', 'open');
    const closedPRs = await client.getPullRequests('test-user/test-repo', 'closed');
    
    expect(openPRs).toHaveLength(1);
    expect(closedPRs).toHaveLength(0);
  });

  it('should get pull request details', async () => {
    const client = getMockGitHubApiClient();
    const prDetails = await client.getPullRequestDetails('test-user/test-repo', 1);
    
    expect(prDetails).toBeDefined();
    expect(prDetails.number).toBe(1);
    expect(prDetails.body).toBeDefined();
    expect(prDetails.requested_reviewers).toBeDefined();
    expect(prDetails.head).toBeDefined();
    expect(prDetails.base).toBeDefined();
    expect(prDetails.mergeable).toBeDefined();
  });

  it('should throw error for non-existent pull request', async () => {
    const client = getMockGitHubApiClient();
    
    await expect(client.getPullRequestDetails('test-user/test-repo', 999)).rejects.toThrow(
      new AppError(
        ErrorCode.RECORD_NOT_FOUND,
        'Pull request #999 not found in repository test-user/test-repo',
        404
      )
    );
  });

  it('should get issues for a repository', async () => {
    const client = getMockGitHubApiClient();
    const issues = await client.getIssues('test-user/test-repo');
    
    expect(issues).toEqual(mockIssues['test-user/test-repo']);
  });

  it('should filter issues by state', async () => {
    const client = getMockGitHubApiClient();
    const openIssues = await client.getIssues('test-user/test-repo', 'open');
    const closedIssues = await client.getIssues('test-user/test-repo', 'closed');
    
    expect(openIssues).toHaveLength(1);
    expect(closedIssues).toHaveLength(0);
  });

  it('should get issue details', async () => {
    const client = getMockGitHubApiClient();
    const issueDetails = await client.getIssueDetails('test-user/test-repo', 1);
    
    expect(issueDetails).toBeDefined();
    expect(issueDetails.number).toBe(1);
    expect(issueDetails.body).toBeDefined();
    expect(issueDetails.assignees).toBeDefined();
    expect(issueDetails.comments).toBeDefined();
  });

  it('should throw error for non-existent issue', async () => {
    const client = getMockGitHubApiClient();
    
    await expect(client.getIssueDetails('test-user/test-repo', 999)).rejects.toThrow(
      new AppError(
        ErrorCode.RECORD_NOT_FOUND,
        'Issue #999 not found in repository test-user/test-repo',
        404
      )
    );
  });

  it('should handle cache invalidation methods without errors', async () => {
    const client = getMockGitHubApiClient();
    
    await expect(client.invalidateRepositoryCache('test-user/test-repo')).resolves.not.toThrow();
    await expect(client.invalidateUserRepositoriesCache()).resolves.not.toThrow();
    await expect(client.invalidateCommitsCache('test-user/test-repo')).resolves.not.toThrow();
    await expect(client.invalidatePullRequestsCache('test-user/test-repo')).resolves.not.toThrow();
    await expect(client.invalidateIssuesCache('test-user/test-repo')).resolves.not.toThrow();
    await expect(client.invalidateAllRepositoryCache('test-user/test-repo')).resolves.not.toThrow();
  });
});