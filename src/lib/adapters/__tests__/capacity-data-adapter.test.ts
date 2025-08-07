/**
 * Capacity Data Adapter Tests
 * Testing data mapping and integration for capacity dashboard
 */

import { CapacityDataAdapter } from '../capacity-data-adapter';
import { TeamMetrics, BurnoutRiskAssessment } from '@/lib/types/analytics';

// Mock fetch globally
global.fetch = jest.fn();

const mockTeamData = {
  teamId: 'team-123',
  metrics: {
    velocity: {
      average: 8.5,
      trend: 'increasing',
      percentageChange: 12.3
    },
    collaboration: {
      score: 0.75,
      network: {
        nodes: [
          { id: '1', name: 'Sarah Chen' },
          { id: '2', name: 'Marcus Rodriguez' },
          { id: '3', name: 'Priya Patel' },
          { id: '4', name: 'Alex Kim' }
        ]
      },
      bottlenecks: [
        { memberId: '1', reason: 'High review load' }
      ]
    }
  }
};

const mockBurnoutData: BurnoutRiskAssessment = {
  userId: 'user-123',
  repositoryId: 'repo-456',
  riskScore: 75,
  confidence: 0.85,
  keyFactors: [
    {
      name: 'Late Night Commits',
      impact: 0.4,
      description: 'High frequency of commits after 10 PM'
    }
  ],
  recommendations: [
    'Redistribute 2-3 tasks from backlog',
    'Schedule wellness check-in',
    'Pair with junior dev to reduce load'
  ],
  historicalTrend: [
    { date: new Date('2024-01-01'), value: 65 },
    { date: new Date('2024-02-01'), value: 75 }
  ],
  lastUpdated: new Date('2024-02-01')
};

const mockUserSession = {
  user: {
    name: 'Sarah Chen',
    email: 'sarah@example.com',
    image: 'https://example.com/avatar.jpg'
  }
};

describe('CapacityDataAdapter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('adaptTeamAnalyticsToMembers', () => {
    it('adapts team data with collaboration nodes to team members', () => {
      const result = CapacityDataAdapter.adaptTeamAnalyticsToMembers(
        mockTeamData,
        mockBurnoutData,
        mockUserSession
      );

      expect(result).toHaveLength(4);
      expect(result[0]).toMatchObject({
        id: '1',
        name: 'Sarah Chen',
        avatar: 'https://example.com/avatar.jpg', // First member gets session avatar
        role: 'Senior Frontend',
        burnoutRisk: 'high', // Based on burnout risk score of 75
        velocity: expect.any(Number),
        wellnessFactor: expect.any(Number),
        collaborationHealth: expect.any(Number),
        keyMetrics: expect.any(Object),
        alerts: expect.any(Array),
        recommendations: expect.arrayContaining([
          'Redistribute 2-3 tasks from backlog',
          'Schedule wellness check-in',
          'Pair with junior dev to reduce load'
        ])
      });
    });

    it('generates mock team members when no collaboration nodes exist', () => {
      const teamDataWithoutNodes = {
        ...mockTeamData,
        metrics: {
          ...mockTeamData.metrics,
          collaboration: {
            score: 0.75,
            network: { nodes: [] },
            bottlenecks: []
          }
        }
      };

      const result = CapacityDataAdapter.adaptTeamAnalyticsToMembers(
        teamDataWithoutNodes,
        mockBurnoutData,
        mockUserSession
      );

      expect(result).toHaveLength(4);
      expect(result[0].name).toBe('Sarah Chen');
      expect(result[1].name).toBe('Marcus Rodriguez');
      expect(result[2].name).toBe('Priya Patel');
      expect(result[3].name).toBe('Alex Kim');
    });

    it('assigns correct roles to team members', () => {
      const result = CapacityDataAdapter.adaptTeamAnalyticsToMembers(
        mockTeamData,
        mockBurnoutData,
        mockUserSession
      );

      const roles = result.map(member => member.role);
      expect(roles).toContain('Senior Frontend');
      expect(roles).toContain('Full Stack');
      expect(roles).toContain('Backend Lead');
      expect(roles).toContain('Junior Developer');
    });

    it('calculates risk levels correctly', () => {
      const lowRiskBurnout = { ...mockBurnoutData, riskScore: 25 };
      const moderateRiskBurnout = { ...mockBurnoutData, riskScore: 50 };
      const highRiskBurnout = { ...mockBurnoutData, riskScore: 85 };

      const lowRiskResult = CapacityDataAdapter.adaptTeamAnalyticsToMembers(
        mockTeamData, lowRiskBurnout, mockUserSession
      );
      const moderateRiskResult = CapacityDataAdapter.adaptTeamAnalyticsToMembers(
        mockTeamData, moderateRiskBurnout, mockUserSession
      );
      const highRiskResult = CapacityDataAdapter.adaptTeamAnalyticsToMembers(
        mockTeamData, highRiskBurnout, mockUserSession
      );

      expect(lowRiskResult[0].burnoutRisk).toBe('low');
      expect(moderateRiskResult[0].burnoutRisk).toBe('moderate');
      expect(highRiskResult[0].burnoutRisk).toBe('high');
    });
  });

  describe('calculateTeamOverview', () => {
    const mockTeamMembers = [
      {
        id: '1',
        name: 'Sarah Chen',
        role: 'Senior Frontend',
        capacity: 92,
        burnoutRisk: 'high' as const,
        trend: 'declining' as const,
        velocity: 85,
        wellnessFactor: 0.7,
        collaborationHealth: 88,
        stressMultiplier: 1.3,
        keyMetrics: {
          lateNightCommits: 8,
          weekendActivity: 12,
          reviewResponseTime: '4.2h',
          codeQuality: 78,
          teamInteractions: 23,
          mentoringHours: 2.5
        },
        alerts: [],
        recommendations: []
      },
      {
        id: '2',
        name: 'Marcus Rodriguez',
        role: 'Full Stack',
        capacity: 78,
        burnoutRisk: 'moderate' as const,
        trend: 'stable' as const,
        velocity: 92,
        wellnessFactor: 0.85,
        collaborationHealth: 95,
        stressMultiplier: 1.1,
        keyMetrics: {
          lateNightCommits: 2,
          weekendActivity: 4,
          reviewResponseTime: '1.8h',
          codeQuality: 91,
          teamInteractions: 45,
          mentoringHours: 6.5
        },
        alerts: [],
        recommendations: []
      }
    ];

    it('calculates team overview correctly', () => {
      const result = CapacityDataAdapter.calculateTeamOverview(mockTeamMembers);

      expect(result).toEqual({
        averageCapacity: 85, // (92 + 78) / 2
        highRiskCount: 1, // Sarah Chen
        optimalCount: 1, // Marcus Rodriguez (78% is in 60-80 range)
        needsSupportCount: 1, // Sarah Chen (high risk)
        totalVelocity: 177, // 85 + 92
        teamMorale: 78, // ((0.7 + 0.85) * 100) / 2
        burnoutPrevented: 3, // Mock value
        interventionsThisMonth: expect.any(Number)
      });
    });

    it('handles empty team members array', () => {
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

    it('correctly identifies optimal capacity members', () => {
      const membersWithVariedCapacity = [
        { ...mockTeamMembers[0], capacity: 50 }, // Below optimal
        { ...mockTeamMembers[1], capacity: 70 }, // Optimal
        { ...mockTeamMembers[0], capacity: 85, id: '3' }, // High
        { ...mockTeamMembers[1], capacity: 95, id: '4' } // Critical
      ];

      const result = CapacityDataAdapter.calculateTeamOverview(membersWithVariedCapacity);

      expect(result.optimalCount).toBe(1); // Only the 70% capacity member
    });
  });

  describe('calculateCapacityDistribution', () => {
    const mockTeamMembers = [
      { capacity: 50 }, // Underutilized
      { capacity: 70 }, // Optimal
      { capacity: 85 }, // High
      { capacity: 95 }  // Critical
    ] as any[];

    it('calculates capacity distribution correctly', () => {
      const result = CapacityDataAdapter.calculateCapacityDistribution(mockTeamMembers);

      expect(result).toEqual([
        {
          range: '0-60%',
          count: 1,
          color: 'bg-green-500',
          label: 'Underutilized'
        },
        {
          range: '60-80%',
          count: 1,
          color: 'bg-blue-500',
          label: 'Optimal'
        },
        {
          range: '80-90%',
          count: 1,
          color: 'bg-yellow-500',
          label: 'High'
        },
        {
          range: '90-100%',
          count: 1,
          color: 'bg-red-500',
          label: 'Critical'
        }
      ]);
    });

    it('handles empty team members array', () => {
      const result = CapacityDataAdapter.calculateCapacityDistribution([]);

      expect(result.every(item => item.count === 0)).toBe(true);
    });
  });

  describe('adaptTeamAnalytics', () => {
    it('adapts team analytics data correctly', () => {
      const result = CapacityDataAdapter.adaptTeamAnalytics(mockTeamData);

      expect(result).toEqual({
        teamId: 'team-123',
        metrics: {
          velocity: {
            average: 8.5,
            trend: 'increasing',
            percentageChange: 12.3
          },
          collaboration: {
            score: 0.75,
            bottlenecks: [
              { memberId: '1', reason: 'High review load' }
            ]
          }
        }
      });
    });

    it('uses default values when team data is null', () => {
      const result = CapacityDataAdapter.adaptTeamAnalytics(null);

      expect(result).toEqual({
        teamId: 'default',
        metrics: {
          velocity: {
            average: 8.5,
            trend: 'increasing',
            percentageChange: 12.3
          },
          collaboration: {
            score: 0.75,
            bottlenecks: []
          }
        }
      });
    });
  });

  describe('fetchCapacityData', () => {
    it('fetches and adapts data from APIs successfully', async () => {
      const mockTeamResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: true,
          data: mockTeamData
        })
      };

      const mockBurnoutResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: true,
          data: mockBurnoutData
        })
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce(mockTeamResponse)
        .mockResolvedValueOnce(mockBurnoutResponse);

      const result = await CapacityDataAdapter.fetchCapacityData('team-123');

      expect(result.teamMembers).toHaveLength(4);
      expect(result.teamOverview).toBeDefined();
      expect(result.teamAnalytics).toBeDefined();
      expect(result.error).toBeUndefined();
    });

    it('handles API errors gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await CapacityDataAdapter.fetchCapacityData();

      expect(result.teamMembers).toEqual([]);
      expect(result.teamOverview).toBeDefined();
      expect(result.teamAnalytics).toBeDefined();
      expect(result.error).toBe('Failed to fetch capacity data');
    });

    it('handles failed API responses', async () => {
      const mockFailedResponse = {
        ok: false,
        status: 500
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce(mockFailedResponse)
        .mockResolvedValueOnce(mockFailedResponse);

      const result = await CapacityDataAdapter.fetchCapacityData();

      expect(result.teamMembers).toEqual([]);
      expect(result.error).toBeUndefined(); // Should not error, just use fallback data
    });

    it('handles partial API failures', async () => {
      const mockTeamResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: true,
          data: mockTeamData
        })
      };

      const mockFailedBurnoutResponse = {
        ok: false,
        status: 500
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce(mockTeamResponse)
        .mockResolvedValueOnce(mockFailedBurnoutResponse);

      const result = await CapacityDataAdapter.fetchCapacityData();

      expect(result.teamMembers).toHaveLength(4);
      expect(result.error).toBeUndefined();
    });
  });

  describe('Helper Methods', () => {
    it('generates appropriate key metrics based on risk score', () => {
      // This tests the private generateKeyMetrics method indirectly
      const highRiskMembers = CapacityDataAdapter.adaptTeamAnalyticsToMembers(
        { metrics: { collaboration: { network: { nodes: [{ id: '1', name: 'Test' }] } } } },
        { ...mockBurnoutData, riskScore: 85 }
      );

      const lowRiskMembers = CapacityDataAdapter.adaptTeamAnalyticsToMembers(
        { metrics: { collaboration: { network: { nodes: [{ id: '1', name: 'Test' }] } } } },
        { ...mockBurnoutData, riskScore: 25 }
      );

      expect(highRiskMembers[0].keyMetrics.lateNightCommits).toBeGreaterThan(
        lowRiskMembers[0].keyMetrics.lateNightCommits
      );
      expect(highRiskMembers[0].keyMetrics.weekendActivity).toBeGreaterThan(
        lowRiskMembers[0].keyMetrics.weekendActivity
      );
    });

    it('generates appropriate alerts based on risk score', () => {
      const highRiskMembers = CapacityDataAdapter.adaptTeamAnalyticsToMembers(
        { metrics: { collaboration: { network: { nodes: [{ id: '1', name: 'Test' }] } } } },
        { ...mockBurnoutData, riskScore: 85 }
      );

      const lowRiskMembers = CapacityDataAdapter.adaptTeamAnalyticsToMembers(
        { metrics: { collaboration: { network: { nodes: [{ id: '1', name: 'Test' }] } } } },
        { ...mockBurnoutData, riskScore: 25 }
      );

      expect(highRiskMembers[0].alerts.some(alert => alert.type === 'critical')).toBe(true);
      expect(lowRiskMembers[0].alerts.some(alert => alert.type === 'info')).toBe(true);
    });

    it('generates appropriate recommendations based on risk score', () => {
      const highRiskMembers = CapacityDataAdapter.adaptTeamAnalyticsToMembers(
        { metrics: { collaboration: { network: { nodes: [{ id: '1', name: 'Test' }] } } } },
        { ...mockBurnoutData, riskScore: 85 }
      );

      const lowRiskMembers = CapacityDataAdapter.adaptTeamAnalyticsToMembers(
        { metrics: { collaboration: { network: { nodes: [{ id: '1', name: 'Test' }] } } } },
        { ...mockBurnoutData, riskScore: 25 }
      );

      expect(highRiskMembers[0].recommendations).toContain('Redistribute 2-3 tasks from backlog');
      expect(lowRiskMembers[0].recommendations).toContain('Consider for tech lead opportunities');
    });
  });

  describe('State Management Helpers', () => {
    it('creates loading state correctly', () => {
      const result = CapacityDataAdapter.createLoadingState();

      expect(result).toEqual({
        teamMembers: [],
        teamOverview: null,
        isLoading: true,
        error: null
      });
    });

    it('creates error state correctly', () => {
      const result = CapacityDataAdapter.createErrorState('Test error');

      expect(result).toEqual({
        teamMembers: [],
        teamOverview: null,
        isLoading: false,
        error: 'Test error'
      });
    });
  });

  describe('validateTeamData', () => {
    it('validates correct team data', () => {
      const validData = {
        teamMembers: [],
        teamOverview: {
          averageCapacity: 75
        }
      };

      expect(CapacityDataAdapter.validateTeamData(validData)).toBe(true);
    });

    it('rejects invalid team data', () => {
      const invalidData = {
        teamMembers: 'not an array',
        teamOverview: {
          averageCapacity: 75
        }
      };

      expect(CapacityDataAdapter.validateTeamData(invalidData)).toBe(false);
    });

    it('rejects null or undefined data', () => {
      expect(CapacityDataAdapter.validateTeamData(null)).toBe(false);
      expect(CapacityDataAdapter.validateTeamData(undefined)).toBe(false);
    });

    it('rejects data with missing required fields', () => {
      const incompleteData = {
        teamMembers: []
        // Missing teamOverview
      };

      expect(CapacityDataAdapter.validateTeamData(incompleteData)).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('handles team data without collaboration network', () => {
      const teamDataWithoutNetwork = {
        teamId: 'team-123',
        metrics: {
          velocity: { average: 8.5 },
          collaboration: { score: 0.75 }
        }
      };

      const result = CapacityDataAdapter.adaptTeamAnalyticsToMembers(teamDataWithoutNetwork);

      expect(result).toHaveLength(4); // Should generate mock members
    });

    it('handles burnout data without recommendations', () => {
      const burnoutWithoutRecommendations = {
        ...mockBurnoutData,
        recommendations: []
      };

      const result = CapacityDataAdapter.adaptTeamAnalyticsToMembers(
        mockTeamData,
        burnoutWithoutRecommendations
      );

      expect(result[0].recommendations).toHaveLength(3); // Should generate default recommendations
    });

    it('handles extreme capacity values', () => {
      const membersWithExtremeCapacity = [
        { capacity: 0 },
        { capacity: 100 },
        { capacity: 150 } // Over 100%
      ] as any[];

      const distribution = CapacityDataAdapter.calculateCapacityDistribution(membersWithExtremeCapacity);
      const overview = CapacityDataAdapter.calculateTeamOverview(membersWithExtremeCapacity as any);

      expect(distribution[0].count).toBe(1); // 0% in underutilized
      expect(distribution[3].count).toBe(2); // 100% and 150% in critical
      expect(overview.averageCapacity).toBe(83); // (0 + 100 + 150) / 3, rounded
    });

    it('handles user session without image', () => {
      const sessionWithoutImage = {
        user: {
          name: 'Test User',
          email: 'test@example.com'
        }
      };

      const result = CapacityDataAdapter.adaptTeamAnalyticsToMembers(
        mockTeamData,
        mockBurnoutData,
        sessionWithoutImage
      );

      expect(result[0].avatar).toBeUndefined();
    });
  });
});