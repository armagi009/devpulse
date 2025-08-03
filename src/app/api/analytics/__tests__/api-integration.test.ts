/**
 * Analytics API Integration Tests
 * 
 * Tests the integration between the analytics API endpoints and the underlying services.
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { GET as getBurnoutData } from '../burnout/route';
import { GET as getProductivityData } from '../productivity/route';
import { GET as getTeamData } from '../team/route';
import { GET as getTrendsData } from '../trends/route';
import { calculateBurnoutRisk } from '@/lib/analytics/burnout-calculator';
import { getProductivityMetrics } from '@/lib/analytics/productivity-metrics';
import { getTeamCollaborationMetrics } from '@/lib/analytics/team-collaboration';
import { prisma } from '@/lib/db/prisma';

// Mock dependencies
jest.mock('next-auth');
jest.mock('@/lib/analytics/burnout-calculator');
jest.mock('@/lib/analytics/productivity-metrics');
jest.mock('@/lib/analytics/team-collaboration');
jest.mock('@/lib/db/prisma');

describe('Analytics API Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock authenticated session for all tests
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { id: 'user-123', name: 'Test User' },
    });
  });

  describe('Burnout API', () => {
    it('should return burnout risk data', async () => {
      // Mock burnout risk calculation
      const mockBurnoutRisk = {
        riskScore: 65,
        confidence: 0.8,
        keyFactors: [
          { name: 'Work Hours Pattern', impact: 0.7, description: 'Frequent work outside normal hours' },
        ],
        recommendations: ['Try to limit work during late night hours'],
        historicalTrend: [{ date: new Date(), value: 65 }],
      };
      (calculateBurnoutRisk as jest.Mock).mockResolvedValue(mockBurnoutRisk);
      
      // Create request
      const request = new NextRequest('http://localhost:3000/api/analytics/burnout');
      
      // Call API
      const response = await getBurnoutData(request);
      const data = await response.json();
      
      // Check response
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.riskScore).toBe(65);
      expect(calculateBurnoutRisk).toHaveBeenCalled();
    });

    it('should handle burnout calculation errors', async () => {
      // Mock burnout risk calculation to throw an error
      (calculateBurnoutRisk as jest.Mock).mockRejectedValue(new Error('Failed to calculate burnout risk'));
      
      // Create request
      const request = new NextRequest('http://localhost:3000/api/analytics/burnout');
      
      // Call API
      const response = await getBurnoutData(request);
      const data = await response.json();
      
      // Check response
      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.message).toBeDefined();
    });
  });

  describe('Productivity API', () => {
    it('should return productivity metrics', async () => {
      // Mock productivity metrics
      const mockProductivityMetrics = {
        commitFrequency: 5.2,
        codeQuality: 0.85,
        workHoursDistribution: [
          { hour: 9, count: 10 },
          { hour: 10, count: 15 },
        ],
        averageCommitSize: 120,
        userId: 'user-123',
      };
      (getProductivityMetrics as jest.Mock).mockResolvedValue(mockProductivityMetrics);
      
      // Create request
      const request = new NextRequest('http://localhost:3000/api/analytics/productivity');
      
      // Call API
      const response = await getProductivityData(request);
      const data = await response.json();
      
      // Check response
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.commitFrequency).toBe(5.2);
      expect(getProductivityMetrics).toHaveBeenCalled();
    });

    it('should handle productivity metrics errors', async () => {
      // Mock productivity metrics to throw an error
      (getProductivityMetrics as jest.Mock).mockRejectedValue(new Error('Failed to get productivity metrics'));
      
      // Create request
      const request = new NextRequest('http://localhost:3000/api/analytics/productivity');
      
      // Call API
      const response = await getProductivityData(request);
      const data = await response.json();
      
      // Check response
      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.message).toBeDefined();
    });
  });

  describe('Team API', () => {
    it('should return team metrics', async () => {
      // Mock team metrics
      const mockTeamMetrics = {
        velocityScore: 85,
        collaborationScore: 0.75,
        knowledgeDistribution: 0.8,
        prReviewTime: 24.5,
        teamId: 'team-123',
      };
      (getTeamCollaborationMetrics as jest.Mock).mockResolvedValue(mockTeamMetrics);
      
      // Create request
      const request = new NextRequest('http://localhost:3000/api/analytics/team?teamId=team-123');
      
      // Call API
      const response = await getTeamData(request);
      const data = await response.json();
      
      // Check response
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.velocityScore).toBe(85);
      expect(getTeamCollaborationMetrics).toHaveBeenCalledWith('team-123', expect.anything());
    });

    it('should return 400 when teamId is missing', async () => {
      // Create request without teamId
      const request = new NextRequest('http://localhost:3000/api/analytics/team');
      
      // Call API
      const response = await getTeamData(request);
      const data = await response.json();
      
      // Check response
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.message).toBeDefined();
    });
  });

  describe('Trends API', () => {
    it('should return commit trend data', async () => {
      // Mock commit data
      const mockCommits = [
        { authorDate: new Date('2025-07-01') },
        { authorDate: new Date('2025-07-01') },
        { authorDate: new Date('2025-07-02') },
      ];
      (prisma.commit.findMany as jest.Mock).mockResolvedValue(mockCommits);
      
      // Create request
      const request = new NextRequest('http://localhost:3000/api/analytics/trends?metric=commits');
      
      // Call API
      const response = await getTrendsData(request);
      const data = await response.json();
      
      // Check response
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.metric).toBe('commits');
      expect(data.data.trend).toHaveLength(2); // Two days of data
    });

    it('should return burnout trend data', async () => {
      // Mock burnout metrics
      const mockBurnoutMetrics = [
        { date: new Date('2025-07-01'), burnoutRiskScore: 65 },
        { date: new Date('2025-07-02'), burnoutRiskScore: 70 },
      ];
      (prisma.burnoutMetric.findMany as jest.Mock).mockResolvedValue(mockBurnoutMetrics);
      
      // Create request
      const request = new NextRequest('http://localhost:3000/api/analytics/trends?metric=burnout');
      
      // Call API
      const response = await getTrendsData(request);
      const data = await response.json();
      
      // Check response
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.metric).toBe('burnout');
      expect(data.data.trend).toHaveLength(2);
    });

    it('should handle database errors', async () => {
      // Mock database error
      (prisma.commit.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));
      
      // Create request
      const request = new NextRequest('http://localhost:3000/api/analytics/trends?metric=commits');
      
      // Call API
      const response = await getTrendsData(request);
      const data = await response.json();
      
      // Check response
      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.message).toBeDefined();
    });
  });
});