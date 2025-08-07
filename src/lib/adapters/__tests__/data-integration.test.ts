/**
 * Data Integration Tests
 * Tests for wellness and capacity data adapters
 */

import { WellnessDataAdapter } from '../wellness-data-adapter';
import { CapacityDataAdapter } from '../capacity-data-adapter';
import { DashboardDataService } from '../../services/dashboard-data-service';

// Mock data that matches the existing API structure
const mockBurnoutData = {
  riskScore: 65,
  confidence: 0.85,
  keyFactors: [
    {
      name: 'Work Hours Pattern',
      impact: 0.75,
      description: 'Frequent work outside normal hours'
    },
    {
      name: 'Weekend Work Frequency',
      impact: 0.68,
      description: 'Regular weekend work'
    }
  ],
  recommendations: [
    'Consider taking time off to recharge and prevent burnout.',
    'Try to limit work during late night hours and establish more regular working hours.'
  ],
  historicalTrend: [
    { date: new Date('2025-06-21'), value: 60 },
    { date: new Date('2025-06-28'), value: 62 },
    { date: new Date('2025-07-05'), value: 65 }
  ]
};

const mockProductivityData = {
  userId: 'test-user',
  timeRange: {
    start: new Date('2025-07-01'),
    end: new Date('2025-07-31')
  },
  commitCount: 87,
  linesAdded: 3245,
  linesDeleted: 1876,
  prCount: 12,
  issueCount: 8,
  commitFrequency: [
    { date: new Date('2025-07-01'), value: 5 },
    { date: new Date('2025-07-02'), value: 8 },
    { date: new Date('2025-07-03'), value: 3 }
  ],
  workHoursDistribution: [
    { hour: 9, count: 15 },
    { hour: 10, count: 20 },
    { hour: 11, count: 18 }
  ],
  weekdayDistribution: [
    { day: 1, count: 25 },
    { day: 2, count: 30 },
    { day: 3, count: 28 }
  ],
  topLanguages: [
    { language: 'TypeScript', percentage: 0.45 },
    { language: 'JavaScript', percentage: 0.25 }
  ]
};

const mockTeamData = {
  teamId: 'test-team',
  timeRange: {
    start: new Date('2025-07-01'),
    end: new Date('2025-07-31')
  },
  metrics: {
    velocity: {
      data: [
        { date: '2025-07-01', value: 8 },
        { date: '2025-07-02', value: 10 }
      ],
      average: 8.5,
      trend: 'increasing',
      percentageChange: 12.3
    },
    collaboration: {
      network: {
        nodes: [
          { id: '1', name: 'Alice Johnson', role: 'Team Lead', commits: 45 },
          { id: '2', name: 'Bob Smith', role: 'Developer', commits: 78 }
        ],
        links: [
          { source: '1', target: '2', strength: 0.8 }
        ]
      },
      score: 0.75,
      bottlenecks: []
    }
  }
};

const mockUserSession = {
  user: {
    id: 'test-user',
    name: 'Test User',
    email: 'test@example.com',
    image: 'https://example.com/avatar.jpg'
  }
};

describe('WellnessDataAdapter', () => {
  describe('adaptBurnoutToWellness', () => {
    it('should correctly adapt burnout data to wellness format', () => {
      const result = WellnessDataAdapter.adaptBurnoutToWellness(mockBurnoutData);

      expect(result).toEqual({
        riskScore: 65,
        confidence: 0.85,
        keyFactors: [
          {
            name: 'Work Hours Pattern',
            impact: 0.75,
            description: 'Frequent work outside normal hours'
          },
          {
            name: 'Weekend Work Frequency',
            impact: 0.68,
            description: 'Regular weekend work'
          }
        ],
        recommendations: [
          'Consider taking time off to recharge and prevent burnout.',
          'Try to limit work during late night hours and establish more regular working hours.'
        ],
        historicalTrend: [
          { date: new Date('2025-06-21'), value: 60 },
          { date: new Date('2025-06-28'), value: 62 },
          { date: new Date('2025-07-05'), value: 65 }
        ]
      });
    });
  });

  describe('createDeveloperProfile', () => {
    it('should create developer profile from user session and wellness data', () => {
      const wellnessData = WellnessDataAdapter.adaptBurnoutToWellness(mockBurnoutData);
      const result = WellnessDataAdapter.createDeveloperProfile(
        mockUserSession,
        wellnessData,
        mockProductivityData
      );

      expect(result).toEqual({
        name: 'Test User',
        avatar: 'https://example.com/avatar.jpg',
        currentStreak: 3, // From commitFrequency length
        wellnessScore: 35, // 100 - 65 (risk score)
        riskLevel: 'moderate', // 65 is between 30-70
        lastCommit: '23 minutes ago'
      });
    });

    it('should handle missing data gracefully', () => {
      const result = WellnessDataAdapter.createDeveloperProfile(mockUserSession);

      expect(result).toEqual({
        name: 'Test User',
        avatar: 'https://example.com/avatar.jpg',
        currentStreak: 12, // Default value
        wellnessScore: 78, // Default value
        riskLevel: 'moderate', // Default value
        lastCommit: '23 minutes ago'
      });
    });
  });

  describe('calculateWellnessMetrics', () => {
    it('should calculate wellness metrics from various data sources', () => {
      const burnoutData = mockBurnoutData;
      const workPatterns = {
        userId: 'test-user',
        timeRange: mockProductivityData.timeRange,
        averageStartTime: '9:30 AM',
        averageEndTime: '6:15 PM',
        weekendWorkPercentage: 15,
        afterHoursPercentage: 20,
        consistencyScore: 82,
        workPatternCalendar: []
      };

      const result = WellnessDataAdapter.calculateWellnessMetrics(
        burnoutData,
        mockProductivityData,
        workPatterns
      );

      expect(result.workLifeBalance).toBe(65); // 100 - (15 + 20)
      expect(result.stressLevel).toBe(65); // Same as risk score
      expect(result.productivityTrend).toBe('improving'); // Based on historical trend
      expect(typeof result.codeQuality).toBe('number');
      expect(typeof result.collaborationHealth).toBe('number');
    });
  });

  describe('validateWellnessData', () => {
    it('should validate correct wellness data structure', () => {
      const validData = {
        riskScore: 50,
        confidence: 0.8,
        keyFactors: [],
        recommendations: [],
        historicalTrend: []
      };

      expect(WellnessDataAdapter.validateWellnessData(validData)).toBe(true);
    });

    it('should reject invalid wellness data structure', () => {
      const invalidData = {
        riskScore: 50,
        // Missing required fields
      };

      expect(WellnessDataAdapter.validateWellnessData(invalidData)).toBe(false);
    });
  });
});

describe('CapacityDataAdapter', () => {
  describe('adaptTeamAnalyticsToMembers', () => {
    it('should adapt team analytics to team members', () => {
      const result = CapacityDataAdapter.adaptTeamAnalyticsToMembers(
        mockTeamData,
        mockBurnoutData,
        mockUserSession
      );

      expect(result).toHaveLength(2); // Based on collaboration nodes
      expect(result[0]).toHaveProperty('id', '1');
      expect(result[0]).toHaveProperty('name', 'Alice Johnson');
      expect(result[0]).toHaveProperty('capacity');
      expect(result[0]).toHaveProperty('burnoutRisk');
      expect(result[0]).toHaveProperty('keyMetrics');
      expect(result[0]).toHaveProperty('alerts');
      expect(result[0]).toHaveProperty('recommendations');
    });

    it('should generate mock data when no collaboration nodes exist', () => {
      const emptyTeamData = {
        ...mockTeamData,
        metrics: {
          ...mockTeamData.metrics,
          collaboration: {
            ...mockTeamData.metrics.collaboration,
            network: { nodes: [], links: [] }
          }
        }
      };

      const result = CapacityDataAdapter.adaptTeamAnalyticsToMembers(
        emptyTeamData,
        mockBurnoutData,
        mockUserSession
      );

      expect(result).toHaveLength(4); // Default mock team size
      expect(result[0].name).toBe('Test User'); // From session
    });
  });

  describe('calculateTeamOverview', () => {
    it('should calculate team overview from team members', () => {
      const teamMembers = CapacityDataAdapter.adaptTeamAnalyticsToMembers(
        mockTeamData,
        mockBurnoutData,
        mockUserSession
      );

      const result = CapacityDataAdapter.calculateTeamOverview(teamMembers);

      expect(result).toHaveProperty('averageCapacity');
      expect(result).toHaveProperty('highRiskCount');
      expect(result).toHaveProperty('optimalCount');
      expect(result).toHaveProperty('needsSupportCount');
      expect(result).toHaveProperty('totalVelocity');
      expect(result).toHaveProperty('teamMorale');
      expect(typeof result.averageCapacity).toBe('number');
    });

    it('should handle empty team members array', () => {
      const result = CapacityDataAdapter.calculateTeamOverview([]);

      expect(result).toEqual({
        averageCapacity: 0,
        highRiskCount: 0,
        optimalCount: 0,
        needsSupportCount: 0,
        totalVelocity: 0,
        teamMorale: 50,
        burnoutPrevented: 0,
        interventionsThisMonth: 0
      });
    });
  });

  describe('calculateCapacityDistribution', () => {
    it('should calculate capacity distribution correctly', () => {
      const teamMembers = [
        { capacity: 50 } as any, // Underutilized
        { capacity: 70 } as any, // Optimal
        { capacity: 85 } as any, // High
        { capacity: 95 } as any  // Critical
      ];

      const result = CapacityDataAdapter.calculateCapacityDistribution(teamMembers);

      expect(result).toHaveLength(4);
      expect(result[0]).toEqual({
        range: '0-60%',
        count: 1,
        color: 'bg-green-500',
        label: 'Underutilized'
      });
      expect(result[1]).toEqual({
        range: '60-80%',
        count: 1,
        color: 'bg-blue-500',
        label: 'Optimal'
      });
      expect(result[2]).toEqual({
        range: '80-90%',
        count: 1,
        color: 'bg-yellow-500',
        label: 'High'
      });
      expect(result[3]).toEqual({
        range: '90-100%',
        count: 1,
        color: 'bg-red-500',
        label: 'Critical'
      });
    });
  });
});

describe('DashboardDataService', () => {
  // Mock fetch globally
  global.fetch = jest.fn();

  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  describe('handleApiError', () => {
    it('should return user-friendly error messages', () => {
      const unauthorizedError = { code: 'UNAUTHORIZED' };
      const networkError = { code: 'NETWORK_ERROR' };
      const unknownError = { message: 'Something went wrong' };

      expect(DashboardDataService.handleApiError(unauthorizedError))
        .toBe('You are not authorized to view this data. Please sign in again.');
      
      expect(DashboardDataService.handleApiError(networkError))
        .toBe('Network connection error. Please check your internet connection.');
      
      expect(DashboardDataService.handleApiError(unknownError))
        .toBe('Something went wrong');
    });
  });

  describe('validateApiResponse', () => {
    it('should validate correct API response structure', () => {
      const validResponse = {
        success: true,
        data: { test: 'data' },
        timestamp: new Date().toISOString()
      };

      expect(DashboardDataService.validateApiResponse(validResponse)).toBe(true);
    });

    it('should validate error response structure', () => {
      const errorResponse = {
        success: false,
        error: { code: 'ERROR', message: 'Test error' },
        timestamp: new Date().toISOString()
      };

      expect(DashboardDataService.validateApiResponse(errorResponse)).toBe(true);
    });

    it('should reject invalid response structure', () => {
      const invalidResponse = {
        data: { test: 'data' }
        // Missing required fields
      };

      expect(DashboardDataService.validateApiResponse(invalidResponse)).toBe(false);
    });
  });

  describe('cache management', () => {
    it('should cache and retrieve data correctly', () => {
      const testData = { test: 'data' };
      const cacheKey = 'test-key';

      // Initially no cached data
      expect(DashboardDataService.getCachedData(cacheKey)).toBeNull();

      // Set cached data
      DashboardDataService.setCachedData(cacheKey, testData, 1000);

      // Should retrieve cached data
      expect(DashboardDataService.getCachedData(cacheKey)).toEqual(testData);

      // Clear cache
      DashboardDataService.clearCache(cacheKey);
      expect(DashboardDataService.getCachedData(cacheKey)).toBeNull();
    });

    it('should expire cached data after TTL', (done) => {
      const testData = { test: 'data' };
      const cacheKey = 'test-key-ttl';

      // Set cached data with very short TTL
      DashboardDataService.setCachedData(cacheKey, testData, 10);

      // Should be available immediately
      expect(DashboardDataService.getCachedData(cacheKey)).toEqual(testData);

      // Should expire after TTL
      setTimeout(() => {
        expect(DashboardDataService.getCachedData(cacheKey)).toBeNull();
        done();
      }, 20);
    });
  });
});

// Integration tests
describe('Data Integration', () => {
  it('should integrate wellness data end-to-end', async () => {
    // Mock successful API responses
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: mockBurnoutData
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
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
      });

    const result = await DashboardDataService.fetchWellnessDashboardData(mockUserSession);

    expect(result.error).toBeNull();
    expect(result.isLoading).toBe(false);
    expect(result.data).toBeDefined();
    expect(result.data?.wellnessData?.riskScore).toBe(65);
    expect(result.data?.developerProfile?.name).toBe('Test User');
  });

  it('should integrate capacity data end-to-end', async () => {
    // Mock successful API responses
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: mockTeamData
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: mockBurnoutData
        })
      });

    const result = await DashboardDataService.fetchCapacityDashboardData(mockUserSession);

    expect(result.error).toBeNull();
    expect(result.isLoading).toBe(false);
    expect(result.data).toBeDefined();
    expect(result.data?.teamMembers).toHaveLength(2);
    expect(result.data?.teamOverview).toBeDefined();
    expect(result.data?.capacityDistribution).toHaveLength(4);
  });

  it('should handle API errors gracefully', async () => {
    // Mock failed API response
    (fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    const result = await DashboardDataService.fetchWellnessDashboardData(mockUserSession);

    expect(result.data).toBeNull();
    expect(result.isLoading).toBe(false);
    expect(result.error).toBe('Failed to load wellness dashboard data');
  });
});