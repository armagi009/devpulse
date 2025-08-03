/**
 * Mock Data Mapper Tests
 */

import { describe, it, expect } from 'vitest';
import { 
  mapToGitHubRepository, 
  mapToGitHubCommit, 
  mapToGitHubPullRequest, 
  mapToGitHubIssue,
  convertMockDataToGitHubFormat
} from '../mock-data-mapper';
import { MockData } from '../../types/mock';

describe('Mock Data Mapper', () => {
  // Create a fixed date string for testing
  const testDate = '2025-01-01T00:00:00.000Z';
  
  describe('mapToGitHubRepository', () => {
    it('should convert internal repository format to GitHub API format', () => {
      const internalRepo = {
        id: '1',
        githubId: 123,
        name: 'test-repo',
        fullName: 'user/test-repo',
        ownerId: '456',
        isPrivate: false,
        description: 'Test repository',
        defaultBranch: 'main',
        language: 'TypeScript',
        createdAt: testDate,
        updatedAt: testDate,
      };

      const githubRepo = mapToGitHubRepository(internalRepo);

      expect(githubRepo.id).toBe(123);
      expect(githubRepo.name).toBe('test-repo');
      expect(githubRepo.full_name).toBe('user/test-repo');
      expect(githubRepo.owner.login).toBe('user');
      expect(githubRepo.private).toBe(false);
      expect(githubRepo.description).toBe('Test repository');
      expect(githubRepo.default_branch).toBe('main');
      expect(githubRepo.language).toBe('TypeScript');
    });
  });

  describe('mapToGitHubCommit', () => {
    it('should convert internal commit format to GitHub API format', () => {
      const internalCommit = {
        id: '1',
        sha: 'abc123',
        message: 'Initial commit',
        authorName: 'Test User',
        authorEmail: 'test@example.com',
        authorDate: testDate,
        committerName: 'Test User',
        committerEmail: 'test@example.com',
        committerDate: testDate,
        additions: 100,
        deletions: 0,
        repositoryId: '1',
        createdAt: testDate,
      };

      const githubCommit = mapToGitHubCommit(internalCommit);

      expect(githubCommit.sha).toBe('abc123');
      expect(githubCommit.commit.message).toBe('Initial commit');
      expect(githubCommit.commit.author.name).toBe('Test User');
      expect(githubCommit.commit.author.email).toBe('test@example.com');
      expect(githubCommit.commit.committer.name).toBe('Test User');
    });
  });

  describe('mapToGitHubPullRequest', () => {
    it('should convert internal pull request format to GitHub API format', () => {
      const internalPR = {
        id: '1',
        githubId: 123,
        number: 42,
        title: 'Add new feature',
        authorId: '456',
        state: 'open',
        createdAt: testDate,
        updatedAt: testDate,
        closedAt: null,
        mergedAt: null,
        repositoryId: '1',
        additions: 100,
        deletions: 0,
        changedFiles: 5,
        comments: 2,
        reviewComments: 3,
      };

      const githubPR = mapToGitHubPullRequest(internalPR);

      expect(githubPR.id).toBe(123);
      expect(githubPR.number).toBe(42);
      expect(githubPR.title).toBe('Add new feature');
      expect(githubPR.state).toBe('open');
      expect(githubPR.user.id).toBe(456);
      expect(githubPR.closed_at).toBeNull();
      expect(githubPR.merged_at).toBeNull();
    });
  });

  describe('mapToGitHubIssue', () => {
    it('should convert internal issue format to GitHub API format', () => {
      const internalIssue = {
        id: '1',
        githubId: 123,
        number: 42,
        title: 'Bug report',
        authorId: '456',
        state: 'open',
        createdAt: testDate,
        updatedAt: testDate,
        closedAt: null,
        repositoryId: '1',
        comments: 2,
        labels: ['bug', 'high-priority'],
      };

      const githubIssue = mapToGitHubIssue(internalIssue);

      expect(githubIssue.id).toBe(123);
      expect(githubIssue.number).toBe(42);
      expect(githubIssue.title).toBe('Bug report');
      expect(githubIssue.state).toBe('open');
      expect(githubIssue.user.id).toBe(456);
      expect(githubIssue.closed_at).toBeNull();
      expect(githubIssue.labels.length).toBe(2);
      expect(githubIssue.labels[0].name).toBe('bug');
      expect(githubIssue.labels[1].name).toBe('high-priority');
    });
  });

  describe('convertMockDataToGitHubFormat', () => {
    it('should convert entire mock data structure to GitHub API format', () => {
      const mockData: MockData = {
        repositories: [
          {
            id: '1',
            githubId: 123,
            name: 'test-repo',
            fullName: 'user/test-repo',
            ownerId: '456',
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
          'user/test-repo': [
            {
              id: '1',
              githubId: 123,
              number: 42,
              title: 'Add new feature',
              state: 'open',
              createdAt: testDate as any,
              updatedAt: testDate as any,
              closedAt: null,
              mergedAt: null,
              repositoryId: '1',
              authorId: '456',
              additions: 100,
              deletions: 0,
              changedFiles: 5,
              comments: 2,
              reviewComments: 3,
            },
          ],
        },
        issues: {
          'user/test-repo': [
            {
              id: '1',
              githubId: 123,
              number: 42,
              title: 'Bug report',
              state: 'open',
              createdAt: testDate as any,
              updatedAt: testDate as any,
              closedAt: null,
              repositoryId: '1',
              authorId: '456',
              comments: 2,
              labels: ['bug', 'high-priority'],
            },
          ],
        },
      };

      const githubFormat = convertMockDataToGitHubFormat(mockData);

      expect(githubFormat.repositories.length).toBe(1);
      expect(githubFormat.repositories[0].name).toBe('test-repo');
      
      expect(githubFormat.commits['user/test-repo'].length).toBe(1);
      expect(githubFormat.commits['user/test-repo'][0].sha).toBe('abc123');
      
      expect(githubFormat.pullRequests['user/test-repo'].length).toBe(1);
      expect(githubFormat.pullRequests['user/test-repo'][0].number).toBe(42);
      
      expect(githubFormat.issues['user/test-repo'].length).toBe(1);
      expect(githubFormat.issues['user/test-repo'][0].title).toBe('Bug report');
    });
  });
});