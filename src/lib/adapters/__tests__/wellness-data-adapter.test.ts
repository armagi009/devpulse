/**
 * Wellness Data Adapter Tests
 * Testing data mapping and integration for wellness dashboard
 */

import { WellnessDataAdapter } from '../wellness-data-adapter';
import { BurnoutRiskAssessment, ProductivityMetrics, WorkPatternAnalysis } from '@/lib/types/analytics';

// Mock fetch globally
global.fetch = jest.fn();

const mockBurnoutData: BurnoutRiskAssessment = {
  userId: 'user-123',
  repositoryId: 'repo-456',
  riskScore: 65,
  confidence: 0.85,
  keyFactors: [
    {
      name: 'Late Night Commits',
      impact: 0.4,
      description: 'High frequency of commits after 10 PM indicating potential overwork'
    },
    {
      name: 'Code Review Pressure',
      impact: 0.25,
      description: 'Increased review turnaround time and complexity'
    }
  ],
  recommendations: [
    'Consider reducing late-night coding sessions',
    'Schedule regular breaks during intensive work periods',
    'Increase pair programming to distribute knowledge'
  ],
  historicalTrend: [
    { date: new Date('2024-01-01'), value: 45 },
    { date: new Date('2024-01-15'), value: 55 },
    { date: new Date('2024-02-01'), value: 65 }
  ],
  lastUpdated: new Date('2024-02-01')
};

const mockProductivityData: ProductivityMetrics = {
  userId: 'user-123',
  timeRange: {
    start: new Date('2024-01-01'),
    end: new Date('2024-02-01')
  },
  commitCount: 45,
  prCount: 12,
  issueCount: 8,
  reviewCount: 15,
  linesAdded: 2500,
  linesDeleted: 800,
  commitFrequency: [
    { date: new Date('2024-01-01'), count: 3 },
    { date: new Date('2024-01-02'), count: 5 },
    { date: new Date('2024-01-03'), count: 2 }
  ],
  codeQualityScore: 0.88,
  collaborationScore: 0.75
};

const mockWorkPatterns: WorkPatternAnalysis = {
  userId: 'user-123',
  timeRange: {
    start: new Date('2024-01-01'),
    end: new Date('2024-02-01')
  },
  averageStartTime: '9:30 AM',
  averageEndTime: '6:15 PM',
  weekendWorkPercentage: 15,
  afterHoursPercentage: 20,
  consistencyScore: 0.82,
  workPatternCalendar: []
};

const mockUser = {
  name: 'John Developer',
  email: 'john@example.com',
  image: 'https://example.com/avatar.jpg'
};

describe('WellnessDataAdapter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('adaptBurnoutToWellness', () => {
    it('correctly maps burnout data to wellness data', () => {
      const result = WellnessDataAdapter.adaptBurnoutToWellness(mockBurnoutData);

      expect(result).toEqual({
        riskScore: 65,
        confidence: 0.85,
        keyFactors: [
          {
            name: 'Late Night Commits',
            impact: 0.4,
            description: 'High frequency of commits after 10 PM indicating potential overwork'
          },
          {
            name: 'Code Review Pressure',
            impact: 0.25,
            description: 'Increased review turnaround time and complexity'
          }
        ],
        recommendations: [
          'Consider reducing late-night coding sessions',
          'Schedule regular breaks during intensive work periods',
          'Increase pair programming to distribute knowledge'
        ],
        historicalTrend: [
          { date: new Date('2024-01-01'), value: 45 },
          { date: new Date('2024-01-15'), value: 55 },
          { date: new Date('2024-02-01'), value: 65 }
        ]
      });
    });

    it('handles empty key factors array', () => {
      const burnoutDataWithoutFactors = {
        ...mockBurnoutData,
        keyFactors: []
      };

      const result = WellnessDataAdapter.adaptBurnoutToWellness(burnoutDataWithoutFactors);

      expect(result.keyFactors).toEqual([]);
    });

    it('handles empty recommendations array', () => {
      const burnoutDataWithoutRecommendations = {
        ...mockBurnoutData,
        recommendations: []
      };

      const result = WellnessDataAdapter.adaptBurnoutToWellness(burnoutDataWithoutRecommendations);

      expect(result.recommendations).toEqual([]);
    });
  });

  describe('createDeveloperProfile', () => {
    it('creates developer profile with wellness data', () => {
      const wellnessData = WellnessDataAdapter.adaptBurnoutToWellness(mockBurnoutData);
      const result = WellnessDataAdapter.createDeveloperProfile(mockUser, wellnessData, mockProductivityData);

      expect(result).toEqual({
        name: 'John Developer',
        avatar: 'https://example.com/avatar.jpg',
        currentStreak: 3, // From productivity data commitFrequency length
        wellnessScore: 35, // 100 - 65 (risk score)
        riskLevel: 'moderate',
        lastCommit: '23 minutes ago'
      });
    });

    it('creates developer profile without wellness data', () => {
      const result = WellnessDataAdapter.createDeveloperProfile(mockUser);

      expect(result).toEqual({
        name: 'John Developer',
        avatar: 'https://example.com/avatar.jpg',
        currentStreak: 12, // Default value
        wellnessScore: 78, // Default value
        riskLevel: 'moderate',
        lastCommit: '23 minutes ago'
      });
    });

    it('handles user without name', () => {
      const userWithoutName = { ...mockUser, name: null };
      const result = WellnessDataAdapter.createDeveloperProfile(userWithoutName);

      expect(result.name).toBe('Developer');
    });

    it('calculates correct risk levels', () => {
      const lowRiskData = { ...mockBurnoutData, riskScore: 25 };
      const moderateRiskData = { ...mockBurnoutData, riskScore: 50 };
      const highRiskData = { ...mockBurnoutData, riskScore: 85 };

      const lowRiskWellness = WellnessDataAdapter.adaptBurnoutToWellness(lowRiskData);
      const moderateRiskWellness = WellnessDataAdapter.adaptBurnoutToWellness(moderateRiskData);
      const highRiskWellness = WellnessDataAdapter.adaptBurnoutToWellness(highRiskData);

      const lowProfile = WellnessDataAdapter.createDeveloperProfile(mockUser, lowRiskWellness);
      const moderateProfile = WellnessDataAdapter.createDeveloperProfile(mockUser, moderateRiskWellness);
      const highProfile = WellnessDataAdapter.createDeveloperProfile(mockUser, highRiskWellness);

      expect(lowProfile.riskLevel).toBe('low');
      expect(moderateProfile.riskLevel).toBe('moderate');
      expect(highProfile.riskLevel).toBe('high');
    });
  });

  describe('calculateWellnessMetrics', () => {
    it('calculates wellness metrics from all data sources', () => {
      const result = WellnessDataAdapter.calculateWellnessMetrics(
        mockBurnoutData,
        mockProductivityData,
        mockWorkPatterns
      );

      expect(result).toEqual({
        workLifeBalance: 65, // 100 - (15 + 20) from work patterns
        codeQuality: 75, // (45 / 12) * 20, capped at reasonable value
        collaborationHealth: 81, // Default since no collaboration factor in mock data
        stressLevel: 65, // From burnout risk score
        productivityTrend: 'declining' // Last value > first value in historical trend
      });
    });

    it('uses default values when data is missing', () => {
      const result = WellnessDataAdapter.calculateWellnessMetrics();

      expect(result).toEqual({
        workLifeBalance: 72,
        codeQuality: 88,
        collaborationHealth: 81,
        stressLevel: 34,
        productivityTrend: 'stable'
      });
    });

    it('calculates productivity trend correctly', () => {
      const improvingTrendData = {
        ...mockBurnoutData,
        historicalTrend: [
          { date: new Date('2024-01-01'), value: 65 },
          { date: new Date('2024-02-01'), value: 45 }
        ]
      };

      const result = WellnessDataAdapter.calculateWellnessMetrics(improvingTrendData);

      expect(result.productivityTrend).toBe('improving');
    });
  });

  describe('generateAIInsights', () => {
    it('generates AI insights from data', () => {
      const result = WellnessDataAdapter.generateAIInsights(mockBurnoutData, mockProductivityData);

      expect(result.selfReassurance.message).toBe('Consider reducing late-night coding sessions');
      expect(result.selfReassurance.confidence).toBe(85);
      expect(result.selfReassurance.historicalData).toHaveLength(3);

      expect(result.peerValidation.message).toContain('team members');
      expect(result.peerValidation.teamMetrics.avgReviewTime).toBe('2.4 hours');

      expect(result.socialProjection.message).toContain('code contributions');
      expect(result.socialProjection.impact.codeQuality).toBe(5); // commitCount / 10
    });

    it('uses default values when data is missing', () => {
      const result = WellnessDataAdapter.generateAIInsights();

      expect(result.selfReassurance.confidence).toBe(89);
      expect(result.socialProjection.impact.codeQuality).toBe(92);
    });
  });

  describe('generateRealtimeActivity', () => {
    it('generates realtime activity data', () => {
      const result = WellnessDataAdapter.generateRealtimeActivity(mockProductivityData);

      expect(result).toHaveLength(5);
      expect(result[0]).toEqual({
        time: "2:34 PM",
        action: "Merged PR #247",
        type: "success",
        impact: "high"
      });
    });

    it('returns default activities when no data provided', () => {
      const result = WellnessDataAdapter.generateRealtimeActivity();

      expect(result).toHaveLength(5);
      expect(result[0].type).toBe('success');
    });
  });

  describe('fetchWellnessData', () => {
    it('fetches and adapts data from APIs successfully', async () => {
      const mockBurnoutResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: true,
          data: mockBurnoutData
        })
      };

      const mockProductivityResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: true,
          data: {
            metrics: mockProductivityData,
            workPatterns: {
              averageStartTime: '9:30 AM',
              averageEndTime: '6:15 PM',
              weekendWorkPercentage: 15,
              consistencyScore: 82
            }
          }
        })
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce(mockBurnoutResponse)
        .mockResolvedValueOnce(mockProductivityResponse);

      const result = await WellnessDataAdapter.fetchWellnessData('repo-123', 30);

      expect(result.wellnessData).toBeDefined();
      expect(result.productivityData).toBeDefined();
      expect(result.workPatterns).toBeDefined();
      expect(result.error).toBeUndefined();
    });

    it('handles API errors gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await WellnessDataAdapter.fetchWellnessData();

      expect(result.wellnessData).toBeNull();
      expect(result.productivityData).toBeNull();
      expect(result.workPatterns).toBeNull();
      expect(result.error).toBe('Failed to fetch wellness data');
    });

    it('handles failed API responses', async () => {
      const mockFailedResponse = {
        ok: false,
        status: 500
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce(mockFailedResponse)
        .mockResolvedValueOnce(mockFailedResponse);

      const result = await WellnessDataAdapter.fetchWellnessData();

      expect(result.wellnessData).toBeNull();
      expect(result.productivityData).toBeNull();
    });

    it('handles partial API failures', async () => {
      const mockBurnoutResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: true,
          data: mockBurnoutData
        })
      };

      const mockFailedProductivityResponse = {
        ok: false,
        status: 500
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce(mockBurnoutResponse)
        .mockResolvedValueOnce(mockFailedProductivityResponse);

      const result = await WellnessDataAdapter.fetchWellnessData();

      expect(result.wellnessData).toBeDefined();
      expect(result.productivityData).toBeNull();
      expect(result.error).toBeUndefined();
    });
  });

  describe('State Management Helpers', () => {
    it('creates loading state correctly', () => {
      const result = WellnessDataAdapter.createLoadingState();

      expect(result).toEqual({
        wellnessData: null,
        isLoading: true,
        error: null
      });
    });

    it('creates error state correctly', () => {
      const result = WellnessDataAdapter.createErrorState('Test error');

      expect(result).toEqual({
        wellnessData: null,
        isLoading: false,
        error: 'Test error'
      });
    });
  });

  describe('validateWellnessData', () => {
    it('validates correct wellness data', () => {
      const validData = {
        riskScore: 50,
        confidence: 0.8,
        keyFactors: [],
        recommendations: [],
        historicalTrend: []
      };

      expect(WellnessDataAdapter.validateWellnessData(validData)).toBe(true);
    });

    it('rejects invalid wellness data', () => {
      const invalidData = {
        riskScore: 'invalid',
        confidence: 0.8,
        keyFactors: [],
        recommendations: [],
        historicalTrend: []
      };

      expect(WellnessDataAdapter.validateWellnessData(invalidData)).toBe(false);
    });

    it('rejects null or undefined data', () => {
      expect(WellnessDataAdapter.validateWellnessData(null)).toBe(false);
      expect(WellnessDataAdapter.validateWellnessData(undefined)).toBe(false);
    });

    it('rejects data with missing required fields', () => {
      const incompleteData = {
        riskScore: 50,
        confidence: 0.8
        // Missing keyFactors, recommendations, historicalTrend
      };

      expect(WellnessDataAdapter.validateWellnessData(incompleteData)).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('handles empty historical trend', () => {
      const dataWithoutTrend = {
        ...mockBurnoutData,
        historicalTrend: []
      };

      const wellnessData = WellnessDataAdapter.adaptBurnoutToWellness(dataWithoutTrend);
      const insights = WellnessDataAdapter.generateAIInsights(dataWithoutTrend);

      expect(wellnessData.historicalTrend).toEqual([]);
      expect(insights.selfReassurance.historicalData).toEqual([]);
    });

    it('handles zero risk score', () => {
      const zeroRiskData = {
        ...mockBurnoutData,
        riskScore: 0
      };

      const wellnessData = WellnessDataAdapter.adaptBurnoutToWellness(zeroRiskData);
      const profile = WellnessDataAdapter.createDeveloperProfile(mockUser, wellnessData);

      expect(profile.wellnessScore).toBe(100);
      expect(profile.riskLevel).toBe('low');
    });

    it('handles maximum risk score', () => {
      const maxRiskData = {
        ...mockBurnoutData,
        riskScore: 100
      };

      const wellnessData = WellnessDataAdapter.adaptBurnoutToWellness(maxRiskData);
      const profile = WellnessDataAdapter.createDeveloperProfile(mockUser, wellnessData);

      expect(profile.wellnessScore).toBe(0);
      expect(profile.riskLevel).toBe('high');
    });
  });
});