/**
 * Productivity Metrics Tests
 */

import { 
  calculateProductivityMetrics,
  getWorkPatternAnalysis,
  detectProductivityTrends,
  TimeRange
} from '../productivity-metrics';
import { prisma } from '@/lib/db/prisma';

// Mock Prisma
jest.mock('@/lib/db/prisma', () => ({
  prisma: {
    user: {
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
  },
}));

// Mock date-fns
jest.mock('date-fns', () => ({
  startOfDay: jest.fn((date) => date),
  endOfDay: jest.fn((date) => date),
  parseISO: jest.fn((str) => new Date(str)),
  format: jest.fn((date, formatStr) => '2025-07-01'),
  subDays: jest.fn((date, days) => new Date(date.getTime() - days * 86400000)),
  getHours: jest.fn((date) => {
    // Return different hours based on the date to simulate different commit times
    const dateStr = date.toISOString();
    if (dateStr.includes('early')) return 8; // Morning
    if (dateStr.includes('late')) return 22; // Late night
    return 14; // Afternoon (default)
  }),
  getDay: jest.fn((date) => {
    // Return different days based on the date to simulate different weekdays
    const dateStr = date.toISOString();
    if (dateStr.includes('weekend')) return 0; // Sunday
    return 3; // Wednesday (default)
  }),
  differenceInDays: jest.fn(() => 30),
  differenceInHours: jest.fn((end, start) => {
    // Simulate different PR/issue resolution times
    if (end.toISOString().includes('quick')) return 4;
    if (end.toISOString().includes('slow')) return 72;
    return 24; // Default
  }),
  isWeekend: jest.fn((date) => {
    const dateStr = date.toISOString();
    return dateStr.includes('weekend');
  }),
  eachDayOfInterval: jest.fn(() => [
    new Date('2025-07-01'),
    new Date('2025-07-02'),
    new Date('2025-07-03')
  ]),
}));

describe('Productivity Metrics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('calculateProductivityMetrics', () => {
    it('should calculate productivity metrics correctly', async () => {
      // Mock user
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-123',
        username: 'testuser',
      });

      // Mock commits with different times and days
      (prisma.commit.findMany as jest.Mock).mockResolvedValue([
        {
          id: 'commit-1',
          sha: 'abc123',
          message: 'Fix bug in login component',
          authorDate: new Date('2025-07-01T14:00:00Z'), // Afternoon
          additions: 50,
          deletions: 20,
          repository: { language: 'TypeScript' },
        },
        {
          id: 'commit-2',
          sha: 'def456',
          message: 'Add new feature',
          authorDate: new Date('2025-07-02T08:00:00Z-early'), // Morning
          additions: 120,
          deletions: 30,
          repository: { language: 'TypeScript' },
        },
        {
          id: 'commit-3',
          sha: 'ghi789',
          message: 'Refactor code',
          authorDate: new Date('2025-07-03T22:00:00Z-late'), // Late night
          additions: 80,
          deletions: 60,
          repository: { language: 'JavaScript' },
        },
        {
          id: 'commit-4',
          sha: 'jkl012',
          message: 'Update README',
          authorDate: new Date('2025-07-04T10:00:00Z-weekend'), // Weekend
          additions: 30,
          deletions: 10,
          repository: { language: 'Markdown' },
        },
      ]);

      // Mock pull requests
      (prisma.pullRequest.findMany as jest.Mock).mockResolvedValue([
        {
          id: 'pr-1',
          number: 1,
          title: 'Feature PR',
          createdAt: new Date('2025-07-01T10:00:00Z'),
          mergedAt: new Date('2025-07-02T10:00:00Z'), // 24 hours
          additions: 200,
          deletions: 50,
          reviewComments: 5,
        },
        {
          id: 'pr-2',
          number: 2,
          title: 'Bug fix PR',
          createdAt: new Date('2025-07-02T14:00:00Z'),
          mergedAt: new Date('2025-07-02T18:00:00Z-quick'), // 4 hours
          additions: 30,
          deletions: 20,
          reviewComments: 2,
        },
        {
          id: 'pr-3',
          number: 3,
          title: 'Refactor PR',
          createdAt: new Date('2025-07-03T09:00:00Z'),
          mergedAt: null, // Not merged
          additions: 150,
          deletions: 100,
          reviewComments: 0,
        },
      ]);

      // Mock issues
      (prisma.issue.findMany as jest.Mock).mockResolvedValue([
        {
          id: 'issue-1',
          number: 1,
          title: 'Bug report',
          createdAt: new Date('2025-07-01T09:00:00Z'),
          closedAt: new Date('2025-07-03T09:00:00Z'), // 48 hours
        },
        {
          id: 'issue-2',
          number: 2,
          title: 'Feature request',
          createdAt: new Date('2025-07-02T11:00:00Z'),
          closedAt: null, // Not closed
        },
      ]);

      // Define time range
      const timeRange: TimeRange = {
        start: new Date('2025-07-01'),
        end: new Date('2025-07-07'),
      };

      // Call the function
      const result = await calculateProductivityMetrics('user-123', timeRange);

      // Assertions
      expect(result).toBeDefined();
      expect(result.userId).toBe('user-123');
      expect(result.commitCount).toBe(4);
      expect(result.linesAdded).toBe(280); // Sum of all additions
      expect(result.linesDeleted).toBe(120); // Sum of all deletions
      expect(result.prCount).toBe(3);
      expect(result.issueCount).toBe(2);
      
      // Check derived metrics
      expect(result.avgCommitSize).toBe(100); // (280 + 120) / 4 = 100
      expect(result.avgPrSize).toBe(183); // (200+50 + 30+20 + 150+100) / 3 ≈ 183
      expect(result.avgTimeToMergePr).toBe(14); // Average of 24 and 4 hours
      expect(result.avgTimeToResolveIssue).toBe(48); // Only one issue resolved
      
      // Check distributions
      expect(result.workHoursDistribution).toHaveLength(24);
      expect(result.weekdayDistribution).toHaveLength(7);
      expect(result.topLanguages.length).toBeGreaterThan(0);
      expect(result.topLanguages[0].language).toBe('TypeScript');
      
      // Check code quality score
      expect(result.codeQualityScore).toBeGreaterThanOrEqual(0);
      expect(result.codeQualityScore).toBeLessThanOrEqual(100);
    });

    it('should handle user not found error', async () => {
      // Mock user not found
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      // Define time range
      const timeRange: TimeRange = {
        start: new Date('2025-07-01'),
        end: new Date('2025-07-07'),
      };

      // Call the function and expect it to throw
      await expect(calculateProductivityMetrics('user-123', timeRange)).rejects.toThrow('User user-123 not found');
    });

    it('should handle empty data gracefully', async () => {
      // Mock user
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-123',
        username: 'testuser',
      });

      // Mock empty data
      (prisma.commit.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.pullRequest.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.issue.findMany as jest.Mock).mockResolvedValue([]);

      // Define time range
      const timeRange: TimeRange = {
        start: new Date('2025-07-01'),
        end: new Date('2025-07-07'),
      };

      // Call the function
      const result = await calculateProductivityMetrics('user-123', timeRange);

      // Assertions
      expect(result).toBeDefined();
      expect(result.commitCount).toBe(0);
      expect(result.linesAdded).toBe(0);
      expect(result.linesDeleted).toBe(0);
      expect(result.prCount).toBe(0);
      expect(result.issueCount).toBe(0);
      expect(result.avgCommitSize).toBe(0);
      expect(result.avgPrSize).toBe(0);
      expect(result.avgTimeToMergePr).toBeNull();
      expect(result.avgTimeToResolveIssue).toBeNull();
    });
  });

  describe('getWorkPatternAnalysis', () => {
    it('should analyze work patterns correctly', async () => {
      // Mock commits with different times
      (prisma.commit.findMany as jest.Mock).mockResolvedValue([
        {
          id: 'commit-1',
          authorDate: new Date('2025-07-01T09:30:00Z-early'), // Morning
        },
        {
          id: 'commit-2',
          authorDate: new Date('2025-07-01T17:45:00Z'), // Evening
        },
        {
          id: 'commit-3',
          authorDate: new Date('2025-07-02T10:15:00Z-early'), // Morning
        },
        {
          id: 'commit-4',
          authorDate: new Date('2025-07-02T16:30:00Z'), // Afternoon
        },
        {
          id: 'commit-5',
          authorDate: new Date('2025-07-03T22:00:00Z-late'), // Late night
        },
        {
          id: 'commit-6',
          authorDate: new Date('2025-07-04T11:00:00Z-weekend'), // Weekend
        },
      ]);

      // Define time range
      const timeRange: TimeRange = {
        start: new Date('2025-07-01'),
        end: new Date('2025-07-07'),
      };

      // Call the function
      const result = await getWorkPatternAnalysis('user-123', timeRange);

      // Assertions
      expect(result).toBeDefined();
      expect(result.averageStartTime).toBeDefined();
      expect(result.averageEndTime).toBeDefined();
      expect(result.weekendWorkPercentage).toBeGreaterThanOrEqual(0);
      expect(result.weekendWorkPercentage).toBeLessThanOrEqual(100);
      expect(result.afterHoursPercentage).toBeGreaterThanOrEqual(0);
      expect(result.afterHoursPercentage).toBeLessThanOrEqual(100);
      expect(result.consistencyScore).toBeGreaterThanOrEqual(0);
      expect(result.consistencyScore).toBeLessThanOrEqual(100);
      expect(result.workPatternCalendar.length).toBeGreaterThan(0);
    });

    it('should handle empty data gracefully', async () => {
      // Mock empty commits
      (prisma.commit.findMany as jest.Mock).mockResolvedValue([]);

      // Define time range
      const timeRange: TimeRange = {
        start: new Date('2025-07-01'),
        end: new Date('2025-07-07'),
      };

      // Call the function
      const result = await getWorkPatternAnalysis('user-123', timeRange);

      // Assertions
      expect(result).toBeDefined();
      expect(result.weekendWorkPercentage).toBe(0);
      expect(result.afterHoursPercentage).toBe(0);
      expect(result.workPatternCalendar).toHaveLength(0);
    });
  });

  describe('detectProductivityTrends', () => {
    it('should detect productivity trends correctly', async () => {
      // Mock current period data
      const mockCurrentPeriod = () => {
        (prisma.commit.findMany as jest.Mock).mockResolvedValue([
          { id: 'commit-1' },
          { id: 'commit-2' },
          { id: 'commit-3' },
        ]);
        (prisma.pullRequest.findMany as jest.Mock).mockResolvedValue([
          { id: 'pr-1', reviewComments: 5 },
          { id: 'pr-2', reviewComments: 3 },
        ]);
        (prisma.issue.findMany as jest.Mock).mockResolvedValue([
          { id: 'issue-1' },
          { id: 'issue-2' },
        ]);
      };

      // Mock previous period data (less activity)
      const mockPreviousPeriod = () => {
        (prisma.commit.findMany as jest.Mock).mockResolvedValue([
          { id: 'commit-old-1' },
        ]);
        (prisma.pullRequest.findMany as jest.Mock).mockResolvedValue([
          { id: 'pr-old-1', reviewComments: 2 },
        ]);
        (prisma.issue.findMany as jest.Mock).mockResolvedValue([
          { id: 'issue-old-1' },
        ]);
      };

      // Setup mock to return different data based on date range
      let callCount = 0;
      (prisma.commit.findMany as jest.Mock).mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.resolve([{ id: 'commit-old-1' }]); // Previous period
        } else {
          return Promise.resolve([
            { id: 'commit-1' },
            { id: 'commit-2' },
            { id: 'commit-3' },
          ]); // Current period
        }
      });

      (prisma.pullRequest.findMany as jest.Mock).mockImplementation(() => {
        if (callCount <= 2) {
          return Promise.resolve([{ id: 'pr-old-1', reviewComments: 2 }]); // Previous period
        } else {
          return Promise.resolve([
            { id: 'pr-1', reviewComments: 5 },
            { id: 'pr-2', reviewComments: 3 },
          ]); // Current period
        }
      });

      (prisma.issue.findMany as jest.Mock).mockImplementation(() => {
        if (callCount <= 4) {
          return Promise.resolve([{ id: 'issue-old-1' }]); // Previous period
        } else {
          return Promise.resolve([
            { id: 'issue-1' },
            { id: 'issue-2' },
          ]); // Current period
        }
      });

      // Define time range
      const timeRange: TimeRange = {
        start: new Date('2025-07-01'),
        end: new Date('2025-07-30'),
      };

      // Call the function
      const result = await detectProductivityTrends('user-123', timeRange);

      // Assertions
      expect(result).toBeDefined();
      expect(result.trend).toBe('improving'); // More activity in current period
      expect(result.percentageChange).toBeGreaterThan(0);
      expect(result.metrics.current.commitCount).toBe(3);
      expect(result.metrics.previous.commitCount).toBe(1);
      expect(result.metrics.current.prCount).toBe(2);
      expect(result.metrics.previous.prCount).toBe(1);
    });

    it('should handle errors gracefully', async () => {
      // Mock database error
      (prisma.commit.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));

      // Define time range
      const timeRange: TimeRange = {
        start: new Date('2025-07-01'),
        end: new Date('2025-07-30'),
      };

      // Call the function
      const result = await detectProductivityTrends('user-123', timeRange);

      // Should return default stable trend
      expect(result).toBeDefined();
      expect(result.trend).toBe('stable');
      expect(result.percentageChange).toBe(0);
    });
  });
});