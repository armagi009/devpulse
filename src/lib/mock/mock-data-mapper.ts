/**
 * Mock Data Mapper
 * 
 * This module provides utility functions for mapping between GitHub API types and our internal mock data structure.
 * It helps with converting between the different formats when generating or using mock data.
 */

import { 
  Repository, 
  RepositoryDetails, 
  Commit, 
  CommitDetails, 
  PullRequest, 
  PRDetails, 
  Issue, 
  IssueDetails 
} from '../types/github';
import { MockData } from '../types/mock';

/**
 * Convert a repository from our internal format to GitHub API format
 * 
 * @param repo Repository from mock data
 * @returns Repository in GitHub API format
 */
export function mapToGitHubRepository(repo: any): Repository {
  return {
    id: repo.githubId,
    name: repo.name,
    full_name: repo.fullName,
    owner: {
      id: parseInt(repo.ownerId, 10) || 0,
      login: repo.fullName.split('/')[0],
      avatar_url: `https://avatars.githubusercontent.com/u/${parseInt(repo.ownerId, 10) || 0}`,
    },
    private: repo.isPrivate,
    html_url: `https://github.com/${repo.fullName}`,
    description: repo.description || null,
    default_branch: repo.defaultBranch,
    created_at: new Date(repo.createdAt).toISOString(),
    updated_at: new Date(repo.updatedAt).toISOString(),
    pushed_at: new Date(repo.updatedAt).toISOString(),
    language: repo.language || null,
    topics: [],
  };
}

/**
 * Convert a commit from our internal format to GitHub API format
 * 
 * @param commit Commit from mock data
 * @returns Commit in GitHub API format
 */
export function mapToGitHubCommit(commit: any): Commit {
  return {
    sha: commit.sha,
    commit: {
      author: {
        name: commit.authorName,
        email: commit.authorEmail,
        date: new Date(commit.authorDate).toISOString(),
      },
      committer: {
        name: commit.committerName,
        email: commit.committerEmail,
        date: new Date(commit.committerDate).toISOString(),
      },
      message: commit.message,
    },
    author: null, // Would be populated with user data if available
    committer: null, // Would be populated with user data if available
    html_url: `https://github.com/mock/commit/${commit.sha}`,
  };
}

/**
 * Convert a pull request from our internal format to GitHub API format
 * 
 * @param pr Pull request from mock data
 * @returns Pull request in GitHub API format
 */
export function mapToGitHubPullRequest(pr: any): PullRequest {
  return {
    id: pr.githubId,
    number: pr.number,
    title: pr.title,
    user: {
      id: parseInt(pr.authorId, 10) || 0,
      login: `user-${pr.authorId}`,
      avatar_url: `https://avatars.githubusercontent.com/u/${parseInt(pr.authorId, 10) || 0}`,
    },
    state: pr.state as any,
    created_at: new Date(pr.createdAt).toISOString(),
    updated_at: new Date(pr.updatedAt).toISOString(),
    closed_at: pr.closedAt ? new Date(pr.closedAt).toISOString() : null,
    merged_at: pr.mergedAt ? new Date(pr.mergedAt).toISOString() : null,
    html_url: `https://github.com/mock/pull/${pr.number}`,
    draft: false,
  };
}

/**
 * Convert an issue from our internal format to GitHub API format
 * 
 * @param issue Issue from mock data
 * @returns Issue in GitHub API format
 */
export function mapToGitHubIssue(issue: any): Issue {
  return {
    id: issue.githubId,
    number: issue.number,
    title: issue.title,
    user: {
      id: parseInt(issue.authorId, 10) || 0,
      login: `user-${issue.authorId}`,
      avatar_url: `https://avatars.githubusercontent.com/u/${parseInt(issue.authorId, 10) || 0}`,
    },
    state: issue.state as any,
    created_at: new Date(issue.createdAt).toISOString(),
    updated_at: new Date(issue.updatedAt).toISOString(),
    closed_at: issue.closedAt ? new Date(issue.closedAt).toISOString() : null,
    html_url: `https://github.com/mock/issues/${issue.number}`,
    labels: issue.labels.map((label: string, index: number) => ({
      id: index,
      name: label,
      color: generateColorFromString(label),
    })),
  };
}

/**
 * Generate a consistent color from a string
 * 
 * @param str Input string
 * @returns Hex color code
 */
function generateColorFromString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xFF;
    color += ('00' + value.toString(16)).substr(-2);
  }
  return color;
}

/**
 * Convert mock data to GitHub API format
 * 
 * @param mockData Mock data
 * @returns Data in GitHub API format
 */
export function convertMockDataToGitHubFormat(mockData: MockData): {
  repositories: Repository[];
  commits: Record<string, Commit[]>;
  pullRequests: Record<string, PullRequest[]>;
  issues: Record<string, Issue[]>;
} {
  const repositories = mockData.repositories.map(mapToGitHubRepository);
  
  const commits: Record<string, Commit[]> = {};
  Object.entries(mockData.commits).forEach(([repoName, repoCommits]) => {
    commits[repoName] = repoCommits.map(mapToGitHubCommit);
  });
  
  const pullRequests: Record<string, PullRequest[]> = {};
  Object.entries(mockData.pullRequests).forEach(([repoName, repoPRs]) => {
    pullRequests[repoName] = repoPRs.map(mapToGitHubPullRequest);
  });
  
  const issues: Record<string, Issue[]> = {};
  Object.entries(mockData.issues).forEach(([repoName, repoIssues]) => {
    issues[repoName] = repoIssues.map(mapToGitHubIssue);
  });
  
  return { repositories, commits, pullRequests, issues };
}