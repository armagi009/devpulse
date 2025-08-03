/**
 * Team Collaboration Analytics Tests
 */

import { 
  calculateTeamVelocity,
  calculateTeamCollaboration,
  calculateKnowledgeDistribution,
  saveTeamMetrics
} from '../team-collaboration';
import { prisma } from '@/lib/db/prisma';

// Mock Prisma
jest.mock('@/lib/db/prisma', () => ({
  prisma: {
    repository: {
      findUnique: jest.fn(),
    },
    commit: {
      findMany: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    pullRequest: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    issue: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    teamInsight: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
  },
}));

// Mock date-fns
jest.mock('date-fns', () => ({
  subDays: jest.fn((date, days) => new Date(date.getTime() - days * 86400000)),
  differenceInDays: jest.fn(() => 30),
  differenceInHours: jest.fn(() => 24),
  format: jest.fn(() => '2025-07-01'),
  parseISO: jest.fn((str) => new Date(str)),
  startOfDay: jest.fn((date) => date),
  endOfDay: jest.fn((date) => date),
  eachDayOfInterval: jest.fn(() => [new Date('2025-07-01'), new Date('2025-07-02')]),
}));

describe('Team Collaboration Analytics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('calculateTeamVelocity', () => {
    it('should calculate team velocity metrics', async () => {
      // Mock repository
      (prisma.repository.findUnique as jest.Mock).mockResolvedValue({
        id: 'repo-123',
        name: 'Test Repo',
      });

      // Mock commits
      (prisma.commit.findMany as jest.Mock).mockResolvedValue([
        {
          id: 'commit-1',
          sha: 'abc123',
          authorDate: new Date('2025-07-01'),
          author: { id: 'user-1', username: 'user1' },
        },
        {
          id: 'commit-2',
          sha: 'def456',
          authorDate: new Date('2025-07-02'),
          author: { id: 'user-2', username: 'user2' },
        },
      ]);

      // Mock pull requests
      (prisma.pullRequest.findMany as jest.Mock).mockResolvedValue([
        {
          id: 'pr-1',
          number: 1,
          createdAt: new Date('2025-07-01'),
          mergedAt: new Date('2025-07-02'),
          author: { id: 'user-1', username: 'user1' },
          reviews: [
            { reviewerId: 'user-2', reviewer: 'user2', submittedAt: new Date('2025-07-01') },
          ],
        },
        {
          id: 'pr-2',
          number: 2,
          createdAt: new Date('2025-07-02'),
          mergedAt: null,
          author: { id: 'user-2', username: 'user2' },
          reviews: [],
        },
      ]);

      // Mock issues
      (prisma.issue.findMany as jest.Mock).mockResolvedValue([
        {
          id: 'issue-1',
          number: 1,
          createdAt: new Date('2025-07-01'),
          closedAt: new Date('2025-07-02'),
          author: { id: 'user-1', username: 'user1' },
        },
        {
          id: 'issue-2',
          number: 2,
          createdAt: new Date('2025-07-02'),
          closedAt: null,
          author: { id: 'user-2', username: 'user2' },
        },
      ]);

      // Mock team insights
      (prisma.teamInsight.findMany as jest.Mock).mockResolvedValue([
        {
          date: new Date('2025-07-01'),
          velocityScore: 75,
        },
      ]);

      // Call the function
      const result = await calculateTeamVelocity('repo-123', {
        start: new Date('2025-07-01'),
        end: new Date('2025-07-30'),
      });

      // Assertions
      expect(result).toBeDefined();
      expect(result.velocityScore).toBeGreaterThan(0);
      expect(result.commitFrequency).toBeDefined();
      expect(result.prMergeRate).toBe(0.5); // 1 out of 2 PRs merged
      expect(result.issueResolutionRate).toBe(0.5); // 1 out of 2 issues closed
      expect(result.cycleTimeAverage).toBe(24); // Mocked to 24 hours
      expect(result.historicalTrend).toHaveLength(1);
    });

    it('should handle errors gracefully', async () => {
      // Mock repository to throw error
      (prisma.repository.findUnique as jest.Mock).mockRejectedValue(new Error('Database error'));

      // Call the function and expect it to throw
      await expect(calculateTeamVelocity('repo-123', {
        start: new Date('2025-07-01'),
        end: new Date('2025-07-30'),
      })).rejects.toThrow('Database error');
    });
  });

  describe('calculateTeamCollaboration', () => {
    it('should calculate team collaboration metrics', async () => {
      // Mock repository
      (prisma.repository.findUnique as jest.Mock).mockResolvedValue({
        id: 'repo-123',
        name: 'Test Repo',
      });

      // Mock pull requests
      (prisma.pullRequest.findMany as jest.Mock).mockResolvedValue([
        {
          id: 'pr-1',
          number: 1,
          author: { id: 'user-1', username: 'user1' },
          reviews: [
            { reviewerId: 'user-2', reviewer: 'user2', submittedAt: new Date() },
            { reviewerId: 'user-3', reviewer: 'user3', submittedAt: new Date() },
          ],
        },
        {
          id: 'pr-2',
          number: 2,
          author: { id: 'user-2', username: 'user2' },
          reviews: [
            { reviewerId: 'user-1', reviewer: 'user1', submittedAt: new Date() },
          ],
        },
      ]);

      // Mock commits
      (prisma.commit.findMany as jest.Mock).mockResolvedValue([
        {
          id: 'commit-1',
          sha: 'abc123',
          author: { id: 'user-1', username: 'user1' },
        },
        {
          id: 'commit-2',
          sha: 'def456',
          author: { id: 'user-2', username: 'user2' },
        },
        {
          id: 'commit-3',
          sha: 'ghi789',
          author: { id: 'user-3', username: 'user3' },
        },
      ]);

      // Call the function
      const result = await calculateTeamCollaboration('repo-123', {
        start: new Date('2025-07-01'),
        end: new Date('2025-07-30'),
      });

      // Assertions
      expect(result).toBeDefined();
      expect(result.collaborationScore).toBeGreaterThan(0);
      expect(result.prReviewDistribution).toHaveLength(3);
      expect(result.codeOwnershipDistribution).toHaveLength(3);
      expect(result.collaborationNetwork.nodes).toHaveLength(3);
      expect(result.collaborationNetwork.links).toHaveLength(2);
    });
  });

  describe('calculateKnowledgeDistribution', () => {
    it('should calculate knowledge distribution metrics', async () => {
      // Mock repository
      (prisma.repository.findUnique as jest.Mock).mockResolvedValue({
        id: 'repo-123',
        name: 'Test Repo',
      });

      // Mock commits
      (prisma.commit.findMany as jest.Mock).mockResolvedValue([
        {
          id: 'commit-1',
          sha: 'abc123',
          author: { id: 'user-1', username: 'user1' },
        },
        {
          id: 'commit-2',
          sha: 'def456',
          author: { id: 'user-2', username: 'user2' },
        },
        {
          id: 'commit-3',
          sha: 'abc123', // Same file as commit-1
          author: { id: 'user-1', username: 'user1' },
        },
      ]);

      // Call the function
      const result = await calculateKnowledgeDistribution('repo-123', {
        start: new Date('2025-07-01'),
        end: new Date('2025-07-30'),
      });

      // Assertions
      expect(result).toBeDefined();
      expect(result.knowledgeSharingScore).toBeGreaterThan(0);
      expect(result.fileOwnership).toHaveLength(2); // 2 unique files
      expect(result.riskAreas).toHaveLength(3); // 3 risk areas
    });
  });

  describe('saveTeamMetrics', () => {
    it('should update existing team insight', async () => {
      // Mock existing insight
      (prisma.teamInsight.findUnique as jest.Mock).mockResolvedValue({
        id: 'insight-1',
        repositoryId: 'repo-123',
        date: new Date('2025-07-01'),
      });

      // Mock counts
      (prisma.commit.count as jest.Mock).mockResolvedValue(10);
      (prisma.pullRequest.count as jest.Mock).mockResolvedValue(5);
      (prisma.issue.count as jest.Mock).mockResolvedValue(3);

      // Call the function
      await saveTeamMetrics('repo-123', new Date('2025-07-01'), {
        velocityScore: 75,
        prMergeRate: 0.8,
        issueResolutionRate: 0.7,
        cycleTimeAverage: 24,
        collaborationScore: 80,
        knowledgeSharingScore: 70,
        memberCount: 5,
      });

      // Assertions
      expect(prisma.teamInsight.update).toHaveBeenCalled();
      expect(prisma.teamInsight.create).not.toHaveBeenCalled();
    });

    it('should create new team insight if none exists', async () => {
      // Mock no existing insight
      (prisma.teamInsight.findUnique as jest.Mock).mockResolvedValue(null);

      // Mock counts
      (prisma.commit.count as jest.Mock).mockResolvedValue(10);
      (prisma.pullRequest.count as jest.Mock).mockResolvedValue(5);
      (prisma.issue.count as jest.Mock).mockResolvedValue(3);

      // Call the function
      await saveTeamMetrics('repo-123', new Date('2025-07-01'), {
        velocityScore: 75,
        prMergeRate: 0.8,
        issueResolutionRate: 0.7,
        cycleTimeAverage: 24,
        collaborationScore: 80,
        knowledgeSharingScore: 70,
        memberCount: 5,
      });

      // Assertions
      expect(prisma.teamInsight.update).not.toHaveBeenCalled();
      expect(prisma.teamInsight.create).toHaveBeenCalled();
    });
  });
});