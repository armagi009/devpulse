/**
 * Data Processor Tests
 */

import { 
  processRawData,
  saveProcessedMetrics,
  processAndSaveMetrics
} from '../data-processor';
import { prisma } from '@/lib/db/prisma';

// Mock Prisma
jest.mock('@/lib/db/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
    repository: {
      findUnique: jest.fn(),
    },
    commit: {
      findMany: jest.fn(),
    },
    pullRequest: {
      findMany: jest.fn(),
    },
    issue: {
      findMany: jest.fn(),
    },
    burnoutMetric: {
      findUnique: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
  },
}));

// Mock date-fns
jest.mock('date-fns', () => ({
  startOfDay: jest.fn((date) => new Date(date.setHours(0, 0, 0, 0))),
  endOfDay: jest.fn((date) => new Date(date.setHours(23, 59, 59, 999))),
  parseISO: jest.fn((str) => new Date(str)),
  isWeekend: jest.fn((date) => {
    const day = date.getDay();
    return day === 0 || day === 6;
  }),
  getHours: jest.fn((date) => {
    // Return different hours based on the date to simulate different commit times
    const dateStr = date.toISOString();
    if (dateStr.includes('early')) return 5; // Early morning
    if (dateStr.includes('late')) return 23; // Late night
    return 14; // Afternoon (default)
  }),
  differenceInDays: jest.fn(() => 3),
  differenceInHours: jest.fn(() => 24),
  format: jest.fn(() => '2025-07-01'),
  subDays: jest.fn((date, days) => new Date(date.getTime() - days * 86400000)),
}));

describe('Data Processor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('processRawData', () => {
    it('should process raw data into daily metrics', async () => {
      // Mock user
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-123',
        username: 'testuser',
      });

      // Mock repository
      (prisma.repository.findUnique as jest.Mock).mockResolvedValue({
        id: 'repo-123',
        name: 'test-repo',
      });

      // Mock commits with different times
      (prisma.commit.findMany as jest.Mock).mockResolvedValue([
        {
          id: 'commit-1',
          sha: 'abc123',
          message: 'Fix bug',
          authorDate: new Date('2025-07-01T14:00:00Z'), // Regular hour
          authorId: 'user-123',
          additions: 50,
          deletions: 20,
        },
        {
          id: 'commit-2',
          sha: 'def456',
          message: 'Add feature',
          authorDate: new Date('2025-07-01T23:00:00Z-late'), // Late night
          authorId: 'user-123',
          additions: 100,
          deletions: 30,
        },
        {
          id: 'commit-3',
          sha: 'ghi789',
          message: 'Update docs',
          authorDate: new Date('2025-07-02T10:00:00Z'), // Regular hour
          authorId: 'user-123',
          additions: 20,
          deletions: 5,
        },
        {
          id: 'commit-4',
          sha: 'jkl012',
          message: 'Fix typo',
          authorDate: new Date('2025-07-03T09:00:00Z-weekend'), // Weekend
          authorId: 'user-123',
          additions: 5,
          deletions: 5,
        },
      ]);

      // Mock pull requests
      (prisma.pullRequest.findMany as jest.Mock).mockResolvedValue([
        {
          id: 'pr-1',
          number: 1,
          title: 'Feature PR',
          createdAt: new Date('2025-07-01T10:00:00Z'),
          authorId: 'user-123',
          reviews: [
            {
              id: 'review-1',
              reviewerId: 'user-456',
              submittedAt: new Date('2025-07-01T15:00:00Z'),
            },
            {
              id: 'review-2',
              reviewerId: 'user-789',
              submittedAt: new Date('2025-07-01T16:00:00Z'),
            },
          ],
        },
        {
          id: 'pr-2',
          number: 2,
          title: 'Bug fix PR',
          createdAt: new Date('2025-07-02T14:00:00Z'),
          authorId: 'user-123',
          reviews: [],
        },
      ]);

      // Mock issues
      (prisma.issue.findMany as jest.Mock).mockResolvedValue([
        {
          id: 'issue-1',
          number: 1,
          title: 'Bug report',
          createdAt: new Date('2025-07-01T09:00:00Z'),
          closedAt: new Date('2025-07-02T09:00:00Z'),
          authorId: 'user-123',
        },
        {
          id: 'issue-2',
          number: 2,
          title: 'Feature request',
          createdAt: new Date('2025-07-02T11:00:00Z'),
          closedAt: null,
          authorId: 'user-123',
        },
      ]);

      // Call the function
      const result = await processRawData(
        'user-123',
        'repo-123',
        new Date('2025-07-01'),
        new Date('2025-07-03')
      );

      // Assertions
      expect(result).toBeDefined();
      expect(result).toHaveLength(3); // 3 days of metrics
      
      // Check first day metrics
      const day1 = result[0];
      expect(day1.date).toEqual(expect.any(Date));
      expect(day1.commitsCount).toBe(2); // 2 commits on day 1
      expect(day1.linesAdded).toBe(150); // 50 + 100
      expect(day1.linesDeleted).toBe(50); // 20 + 30
      expect(day1.prsOpened).toBe(1); // 1 PR on day 1
      expect(day1.issuesCreated).toBe(1); // 1 issue on day 1
      expect(day1.lateNightCommits).toBe(1); // 1 late night commit
      expect(day1.weekendCommits).toBe(0); // No weekend commits
      
      // Check second day metrics
      const day2 = result[1];
      expect(day2.commitsCount).toBe(1); // 1 commit on day 2
      expect(day2.prsOpened).toBe(1); // 1 PR on day 2
      expect(day2.issuesResolved).toBe(1); // 1 issue resolved on day 2
      
      // Check third day metrics
      const day3 = result[2];
      expect(day3.commitsCount).toBe(1); // 1 commit on day 3
      expect(day3.weekendCommits).toBe(1); // 1 weekend commit
    });

    it('should handle empty data gracefully', async () => {
      // Mock user
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-123',
        username: 'testuser',
      });

      // Mock repository
      (prisma.repository.findUnique as jest.Mock).mockResolvedValue({
        id: 'repo-123',
        name: 'test-repo',
      });

      // Mock empty data
      (prisma.commit.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.pullRequest.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.issue.findMany as jest.Mock).mockResolvedValue([]);

      // Call the function
      const result = await processRawData(
        'user-123',
        'repo-123',
        new Date('2025-07-01'),
        new Date('2025-07-03')
      );

      // Assertions
      expect(result).toBeDefined();
      expect(result).toHaveLength(3); // 3 days of metrics
      
      // Check that metrics are all zeros
      result.forEach(day => {
        expect(day.commitsCount).toBe(0);
        expect(day.linesAdded).toBe(0);
        expect(day.linesDeleted).toBe(0);
        expect(day.prsOpened).toBe(0);
        expect(day.prsReviewed).toBe(0);
        expect(day.issuesCreated).toBe(0);
        expect(day.issuesResolved).toBe(0);
        expect(day.weekendCommits).toBe(0);
        expect(day.lateNightCommits).toBe(0);
      });
    });

    it('should handle user not found error', async () => {
      // Mock user not found
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      // Call the function and expect it to throw
      await expect(processRawData(
        'user-123',
        'repo-123',
        new Date('2025-07-01'),
        new Date('2025-07-03')
      )).rejects.toThrow('User user-123 not found');
    });

    it('should handle repository not found error', async () => {
      // Mock user
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-123',
        username: 'testuser',
      });

      // Mock repository not found
      (prisma.repository.findUnique as jest.Mock).mockResolvedValue(null);

      // Call the function and expect it to throw
      await expect(processRawData(
        'user-123',
        'repo-123',
        new Date('2025-07-01'),
        new Date('2025-07-03')
      )).rejects.toThrow('Repository repo-123 not found');
    });
  });

  describe('saveProcessedMetrics', () => {
    it('should update existing metrics', async () => {
      // Mock existing metrics
      (prisma.burnoutMetric.findUnique as jest.Mock).mockResolvedValue({
        id: 'metric-1',
        userId: 'user-123',
        repositoryId: 'repo-123',
        date: new Date('2025-07-01'),
      });

      // Sample processed metrics
      const metrics = [
        {
          date: new Date('2025-07-01'),
          commitsCount: 5,
          linesAdded: 100,
          linesDeleted: 50,
          prsOpened: 2,
          prsReviewed: 1,
          issuesCreated: 1,
          issuesResolved: 0,
          avgCommitTimeHour: 14,
          weekendCommits: 0,
          lateNightCommits: 1,
          avgPrReviewTimeHours: 24,
          avgCommitMessageLength: 50,
          codeReviewComments: 5,
        },
      ];

      // Call the function
      await saveProcessedMetrics('user-123', 'repo-123', metrics);

      // Assertions
      expect(prisma.burnoutMetric.update).toHaveBeenCalled();
      expect(prisma.burnoutMetric.create).not.toHaveBeenCalled();
    });

    it('should create new metrics if none exist', async () => {
      // Mock no existing metrics
      (prisma.burnoutMetric.findUnique as jest.Mock).mockResolvedValue(null);

      // Sample processed metrics
      const metrics = [
        {
          date: new Date('2025-07-01'),
          commitsCount: 5,
          linesAdded: 100,
          linesDeleted: 50,
          prsOpened: 2,
          prsReviewed: 1,
          issuesCreated: 1,
          issuesResolved: 0,
          avgCommitTimeHour: 14,
          weekendCommits: 0,
          lateNightCommits: 1,
          avgPrReviewTimeHours: 24,
          avgCommitMessageLength: 50,
          codeReviewComments: 5,
        },
      ];

      // Call the function
      await saveProcessedMetrics('user-123', 'repo-123', metrics);

      // Assertions
      expect(prisma.burnoutMetric.update).not.toHaveBeenCalled();
      expect(prisma.burnoutMetric.create).toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      // Mock database error
      (prisma.burnoutMetric.findUnique as jest.Mock).mockRejectedValue(new Error('Database error'));

      // Sample processed metrics
      const metrics = [
        {
          date: new Date('2025-07-01'),
          commitsCount: 5,
          linesAdded: 100,
          linesDeleted: 50,
          prsOpened: 2,
          prsReviewed: 1,
          issuesCreated: 1,
          issuesResolved: 0,
          avgCommitTimeHour: 14,
          weekendCommits: 0,
          lateNightCommits: 1,
          avgPrReviewTimeHours: 24,
          avgCommitMessageLength: 50,
          codeReviewComments: 5,
        },
      ];

      // Call the function and expect it to throw
      await expect(saveProcessedMetrics('user-123', 'repo-123', metrics)).rejects.toThrow('Database error');
    });
  });

  describe('processAndSaveMetrics', () => {
    it('should process and save metrics successfully', async () => {
      // Mock dependencies
      // Mock user
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-123',
        username: 'testuser',
      });

      // Mock repository
      (prisma.repository.findUnique as jest.Mock).mockResolvedValue({
        id: 'repo-123',
        name: 'test-repo',
      });

      // Mock commits
      (prisma.commit.findMany as jest.Mock).mockResolvedValue([
        {
          id: 'commit-1',
          sha: 'abc123',
          message: 'Fix bug',
          authorDate: new Date('2025-07-01T14:00:00Z'),
          authorId: 'user-123',
          additions: 50,
          deletions: 20,
        },
      ]);

      // Mock pull requests and issues
      (prisma.pullRequest.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.issue.findMany as jest.Mock).mockResolvedValue([]);

      // Mock no existing metrics
      (prisma.burnoutMetric.findUnique as jest.Mock).mockResolvedValue(null);

      // Call the function
      await processAndSaveMetrics('user-123', 'repo-123', 7);

      // Assertions
      expect(prisma.commit.findMany).toHaveBeenCalled();
      expect(prisma.burnoutMetric.create).toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      // Mock database error
      (prisma.user.findUnique as jest.Mock).mockRejectedValue(new Error('Database error'));

      // Call the function and expect it to throw
      await expect(processAndSaveMetrics('user-123', 'repo-123', 7)).rejects.toThrow('Database error');
    });
  });
});