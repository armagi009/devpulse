/**
 * Burnout Calculator Tests
 */

import { 
  calculateBurnoutRisk,
  calculateRiskScore,
  saveBurnoutRiskScore,
  BurnoutFactors,
  BurnoutRiskAssessment
} from '../burnout-calculator';
import { prisma } from '@/lib/db/prisma';

// Mock Prisma
jest.mock('@/lib/db/prisma', () => ({
  prisma: {
    burnoutMetric: {
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
  isWeekend: jest.fn((date) => {
    const day = date.getDay();
    return day === 0 || day === 6;
  }),
  format: jest.fn(() => '2025-07-01'),
  parseISO: jest.fn((str) => new Date(str)),
  startOfDay: jest.fn((date) => date),
  endOfDay: jest.fn((date) => date),
}));

describe('Burnout Calculator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('calculateBurnoutRisk', () => {
    it('should calculate burnout risk assessment', async () => {
      // Mock burnout metrics
      const mockMetrics = [
        {
          id: 'metric-1',
          userId: 'user-123',
          repositoryId: 'repo-123',
          date: new Date('2025-07-01'),
          commitsCount: 10,
          linesAdded: 500,
          linesDeleted: 200,
          prsOpened: 3,
          prsReviewed: 2,
          issuesCreated: 1,
          issuesResolved: 1,
          avgCommitTimeHour: 14, // 2 PM
          weekendCommits: 2,
          lateNightCommits: 1,
          avgPrReviewTimeHours: 24,
          avgCommitMessageLength: 50,
          codeReviewComments: 5,
          burnoutRiskScore: 45,
        },
        {
          id: 'metric-2',
          userId: 'user-123',
          repositoryId: 'repo-123',
          date: new Date('2025-07-02'),
          commitsCount: 8,
          linesAdded: 300,
          linesDeleted: 100,
          prsOpened: 2,
          prsReviewed: 1,
          issuesCreated: 2,
          issuesResolved: 0,
          avgCommitTimeHour: 22, // 10 PM
          weekendCommits: 0,
          lateNightCommits: 3,
          avgPrReviewTimeHours: 48,
          avgCommitMessageLength: 20,
          codeReviewComments: 2,
          burnoutRiskScore: 65,
        },
      ];

      // Mock historical trend
      const mockTrend = [
        {
          date: new Date('2025-07-01'),
          burnoutRiskScore: 45,
        },
        {
          date: new Date('2025-07-02'),
          burnoutRiskScore: 65,
        },
      ];

      // Setup mocks
      (prisma.burnoutMetric.findMany as jest.Mock)
        .mockImplementation((args) => {
          if (args.select) {
            return mockTrend;
          }
          return mockMetrics;
        });

      // Call the function
      const result = await calculateBurnoutRisk('user-123', 'repo-123', 30);

      // Assertions
      expect(result).toBeDefined();
      expect(result.riskScore).toBeGreaterThanOrEqual(0);
      expect(result.riskScore).toBeLessThanOrEqual(100);
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
      expect(result.keyFactors).toHaveLength(3);
      expect(result.recommendations.length).toBeGreaterThan(0);
      expect(result.historicalTrend).toHaveLength(2);
    });

    it('should handle empty metrics gracefully', async () => {
      // Mock empty metrics
      (prisma.burnoutMetric.findMany as jest.Mock).mockResolvedValue([]);

      // Call the function
      const result = await calculateBurnoutRisk('user-123', 'repo-123', 30);

      // Assertions
      expect(result).toBeDefined();
      expect(result.riskScore).toBe(0);
      expect(result.confidence).toBe(0);
      expect(result.keyFactors).toHaveLength(3);
      expect(result.recommendations.length).toBeGreaterThan(0);
      expect(result.historicalTrend).toHaveLength(0);
    });

    it('should handle errors gracefully', async () => {
      // Mock database error
      (prisma.burnoutMetric.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));

      // Call the function and expect it to throw
      await expect(calculateBurnoutRisk('user-123', 'repo-123', 30)).rejects.toThrow('Database error');
    });
  });

  describe('calculateRiskScore', () => {
    it('should calculate risk score correctly', () => {
      // Test factors
      const factors: BurnoutFactors = {
        workHoursPattern: 0.7,      // High (outside normal hours)
        codeQualityTrend: 0.3,      // Medium (average commit quality)
        collaborationLevel: 0.5,     // Medium (moderate collaboration)
        workloadDistribution: 0.8,   // High (uneven workload)
        timeToResolution: 0.4,       // Medium (moderate PR review times)
        weekendWorkFrequency: 0.2,   // Low (rare weekend work)
      };

      // Call the function directly
      // Note: calculateRiskScore is not exported in the original file, so we're testing it indirectly
      // In a real implementation, we would export it for testing or use a different approach
      const result = calculateRiskScore(factors);

      // Assertions
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(100);
      
      // Expected calculation based on weights:
      // workHoursPattern: 0.7 * 0.25 = 0.175
      // codeQualityTrend: 0.3 * 0.15 = 0.045
      // collaborationLevel: 0.5 * 0.15 = 0.075
      // workloadDistribution: 0.8 * 0.20 = 0.16
      // timeToResolution: 0.4 * 0.10 = 0.04
      // weekendWorkFrequency: 0.2 * 0.15 = 0.03
      // Total: 0.525 * 100 = 52.5 (rounded to 53)
      expect(result).toBeCloseTo(53, 0);
    });

    it('should handle extreme values correctly', () => {
      // Test with all factors at maximum
      const maxFactors: BurnoutFactors = {
        workHoursPattern: 1,
        codeQualityTrend: 1,
        collaborationLevel: 1,
        workloadDistribution: 1,
        timeToResolution: 1,
        weekendWorkFrequency: 1,
      };

      const maxResult = calculateRiskScore(maxFactors);
      expect(maxResult).toBe(100);

      // Test with all factors at minimum
      const minFactors: BurnoutFactors = {
        workHoursPattern: 0,
        codeQualityTrend: 0,
        collaborationLevel: 0,
        workloadDistribution: 0,
        timeToResolution: 0,
        weekendWorkFrequency: 0,
      };

      const minResult = calculateRiskScore(minFactors);
      expect(minResult).toBe(0);
    });
  });

  describe('saveBurnoutRiskScore', () => {
    it('should update existing burnout metric', async () => {
      // Mock existing metric
      (prisma.burnoutMetric.findUnique as jest.Mock).mockResolvedValue({
        id: 'metric-1',
        userId: 'user-123',
        repositoryId: 'repo-123',
        date: new Date('2025-07-01'),
      });

      // Call the function
      await saveBurnoutRiskScore('user-123', 'repo-123', new Date('2025-07-01'), 75);

      // Assertions
      expect(prisma.burnoutMetric.update).toHaveBeenCalled();
      expect(prisma.burnoutMetric.create).not.toHaveBeenCalled();
    });

    it('should create new burnout metric if none exists', async () => {
      // Mock no existing metric
      (prisma.burnoutMetric.findUnique as jest.Mock).mockResolvedValue(null);

      // Call the function
      await saveBurnoutRiskScore('user-123', 'repo-123', new Date('2025-07-01'), 75);

      // Assertions
      expect(prisma.burnoutMetric.update).not.toHaveBeenCalled();
      expect(prisma.burnoutMetric.create).toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      // Mock database error
      (prisma.burnoutMetric.findUnique as jest.Mock).mockRejectedValue(new Error('Database error'));

      // Call the function and expect it to throw
      await expect(saveBurnoutRiskScore('user-123', 'repo-123', new Date('2025-07-01'), 75)).rejects.toThrow('Database error');
    });
  });
});