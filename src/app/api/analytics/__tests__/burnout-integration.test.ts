/**
 * Burnout API Integration Tests
 * Testing the burnout analytics endpoint used by wellness dashboard
 */

import { NextRequest } from 'next/server';
import { GET } from '../burnout/route';

// Mock the auth and database dependencies
jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn()
}));

jest.mock('@/lib/db/test-connection', () => ({
  testConnection: jest.fn().mockResolvedValue(true)
}));

jest.mock('@/lib/analytics/burnout-calculator', () => ({
  BurnoutCalculator: {
    calculateBurnoutRisk: jest.fn()
  }
}));

import { getServerSession } from 'next-auth/next';
import { BurnoutCalculator } from '@/lib/analytics/burnout-calculator';

const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;
const mockCalculateBurnoutRisk = BurnoutCalculator.calculateBurnoutRisk as jest.MockedFunction<
  typeof BurnoutCalculator.calculateBurnoutRisk
>;

const mockSession = {
  user: {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User'
  }
};

const mockBurnoutData = {
  userId: 'user-123',
  repositoryId: 'repo-456',
  riskScore: 65,
  confidence: 0.85,
  keyFactors: [
    {
      name: 'Late Night Commits',
      impact: 0.4,
      description: 'High frequency of commits after 10 PM'
    },
    {
      name: 'Code Review Pressure',
      impact: 0.25,
      description: 'Increased review turnaround time'
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

describe('/api/analytics/burnout Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Authentication', () => {
    it('returns 401 when user is not authenticated', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/analytics/burnout');
      const response = await GET(request);

      expect(response.status).toBe(401);
      
      const data = await response.json();
      expect(data).toEqual({
        success: false,
        error: 'Unauthorized'
      });
    });

    it('processes request when user is authenticated', async () => {
      mockGetServerSession.mockResolvedValue(mockSession);
      mockCalculateBurnoutRisk.mockResolvedValue(mockBurnoutData);

      const request = new NextRequest('http://localhost:3000/api/analytics/burnout');
      const response = await GET(request);

      expect(response.status).toBe(200);
    });
  });

  describe('Query Parameters', () => {
    beforeEach(() => {
      mockGetServerSession.mockResolvedValue(mockSession);
      mockCalculateBurnoutRisk.mockResolvedValue(mockBurnoutData);
    });

    it('uses default parameters when none provided', async () => {
      const request = new NextRequest('http://localhost:3000/api/analytics/burnout');
      const response = await GET(request);

      expect(mockCalculateBurnoutRisk).toHaveBeenCalledWith(
        'user-123',
        'default',
        30
      );
      expect(response.status).toBe(200);
    });

    it('uses provided repositoryId parameter', async () => {
      const request = new NextRequest('http://localhost:3000/api/analytics/burnout?repositoryId=custom-repo');
      const response = await GET(request);

      expect(mockCalculateBurnoutRisk).toHaveBeenCalledWith(
        'user-123',
        'custom-repo',
        30
      );
    });

    it('uses provided days parameter', async () => {
      const request = new NextRequest('http://localhost:3000/api/analytics/burnout?days=60');
      const response = await GET(request);

      expect(mockCalculateBurnoutRisk).toHaveBeenCalledWith(
        'user-123',
        'default',
        60
      );
    });

    it('uses both repositoryId and days parameters', async () => {
      const request = new NextRequest('http://localhost:3000/api/analytics/burnout?repositoryId=test-repo&days=90');
      const response = await GET(request);

      expect(mockCalculateBurnoutRisk).toHaveBeenCalledWith(
        'user-123',
        'test-repo',
        90
      );
    });

    it('handles invalid days parameter gracefully', async () => {
      const request = new NextRequest('http://localhost:3000/api/analytics/burnout?days=invalid');
      const response = await GET(request);

      expect(mockCalculateBurnoutRisk).toHaveBeenCalledWith(
        'user-123',
        'default',
        30 // Should use default
      );
    });

    it('handles negative days parameter', async () => {
      const request = new NextRequest('http://localhost:3000/api/analytics/burnout?days=-10');
      const response = await GET(request);

      expect(mockCalculateBurnoutRisk).toHaveBeenCalledWith(
        'user-123',
        'default',
        30 // Should use default
      );
    });

    it('handles extremely large days parameter', async () => {
      const request = new NextRequest('http://localhost:3000/api/analytics/burnout?days=10000');
      const response = await GET(request);

      expect(mockCalculateBurnoutRisk).toHaveBeenCalledWith(
        'user-123',
        'default',
        365 // Should be capped at maximum
      );
    });
  });

  describe('Response Format', () => {
    beforeEach(() => {
      mockGetServerSession.mockResolvedValue(mockSession);
    });

    it('returns success response with burnout data', async () => {
      mockCalculateBurnoutRisk.mockResolvedValue(mockBurnoutData);

      const request = new NextRequest('http://localhost:3000/api/analytics/burnout');
      const response = await GET(request);

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toEqual({
        success: true,
        data: mockBurnoutData
      });
    });

    it('includes all required burnout data fields', async () => {
      mockCalculateBurnoutRisk.mockResolvedValue(mockBurnoutData);

      const request = new NextRequest('http://localhost:3000/api/analytics/burnout');
      const response = await GET(request);
      const data = await response.json();

      expect(data.data).toHaveProperty('userId');
      expect(data.data).toHaveProperty('repositoryId');
      expect(data.data).toHaveProperty('riskScore');
      expect(data.data).toHaveProperty('confidence');
      expect(data.data).toHaveProperty('keyFactors');
      expect(data.data).toHaveProperty('recommendations');
      expect(data.data).toHaveProperty('historicalTrend');
      expect(data.data).toHaveProperty('lastUpdated');
    });

    it('properly formats key factors', async () => {
      mockCalculateBurnoutRisk.mockResolvedValue(mockBurnoutData);

      const request = new NextRequest('http://localhost:3000/api/analytics/burnout');
      const response = await GET(request);
      const data = await response.json();

      expect(data.data.keyFactors).toHaveLength(2);
      expect(data.data.keyFactors[0]).toHaveProperty('name');
      expect(data.data.keyFactors[0]).toHaveProperty('impact');
      expect(data.data.keyFactors[0]).toHaveProperty('description');
    });

    it('properly formats historical trend', async () => {
      mockCalculateBurnoutRisk.mockResolvedValue(mockBurnoutData);

      const request = new NextRequest('http://localhost:3000/api/analytics/burnout');
      const response = await GET(request);
      const data = await response.json();

      expect(data.data.historicalTrend).toHaveLength(3);
      expect(data.data.historicalTrend[0]).toHaveProperty('date');
      expect(data.data.historicalTrend[0]).toHaveProperty('value');
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      mockGetServerSession.mockResolvedValue(mockSession);
    });

    it('handles burnout calculation errors', async () => {
      mockCalculateBurnoutRisk.mockRejectedValue(new Error('Calculation failed'));

      const request = new NextRequest('http://localhost:3000/api/analytics/burnout');
      const response = await GET(request);

      expect(response.status).toBe(500);
      
      const data = await response.json();
      expect(data).toEqual({
        success: false,
        error: 'Failed to calculate burnout risk'
      });
    });

    it('handles database connection errors', async () => {
      mockCalculateBurnoutRisk.mockRejectedValue(new Error('Database connection failed'));

      const request = new NextRequest('http://localhost:3000/api/analytics/burnout');
      const response = await GET(request);

      expect(response.status).toBe(500);
      
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to calculate burnout risk');
    });

    it('handles missing user ID in session', async () => {
      const sessionWithoutUserId = {
        user: {
          email: 'test@example.com',
          name: 'Test User'
          // Missing id
        }
      };
      mockGetServerSession.mockResolvedValue(sessionWithoutUserId);

      const request = new NextRequest('http://localhost:3000/api/analytics/burnout');
      const response = await GET(request);

      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data).toEqual({
        success: false,
        error: 'User ID not found in session'
      });
    });
  });

  describe('Data Validation', () => {
    beforeEach(() => {
      mockGetServerSession.mockResolvedValue(mockSession);
    });

    it('validates risk score is within valid range', async () => {
      const invalidBurnoutData = {
        ...mockBurnoutData,
        riskScore: 150 // Invalid: > 100
      };
      mockCalculateBurnoutRisk.mockResolvedValue(invalidBurnoutData);

      const request = new NextRequest('http://localhost:3000/api/analytics/burnout');
      const response = await GET(request);

      // Should still return the data but log a warning
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.success).toBe(true);
    });

    it('validates confidence is within valid range', async () => {
      const invalidBurnoutData = {
        ...mockBurnoutData,
        confidence: 1.5 // Invalid: > 1.0
      };
      mockCalculateBurnoutRisk.mockResolvedValue(invalidBurnoutData);

      const request = new NextRequest('http://localhost:3000/api/analytics/burnout');
      const response = await GET(request);

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.success).toBe(true);
    });

    it('handles empty key factors array', async () => {
      const burnoutDataWithoutFactors = {
        ...mockBurnoutData,
        keyFactors: []
      };
      mockCalculateBurnoutRisk.mockResolvedValue(burnoutDataWithoutFactors);

      const request = new NextRequest('http://localhost:3000/api/analytics/burnout');
      const response = await GET(request);

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.data.keyFactors).toEqual([]);
    });

    it('handles empty recommendations array', async () => {
      const burnoutDataWithoutRecommendations = {
        ...mockBurnoutData,
        recommendations: []
      };
      mockCalculateBurnoutRisk.mockResolvedValue(burnoutDataWithoutRecommendations);

      const request = new NextRequest('http://localhost:3000/api/analytics/burnout');
      const response = await GET(request);

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.data.recommendations).toEqual([]);
    });
  });

  describe('Performance', () => {
    beforeEach(() => {
      mockGetServerSession.mockResolvedValue(mockSession);
    });

    it('completes request within reasonable time', async () => {
      mockCalculateBurnoutRisk.mockResolvedValue(mockBurnoutData);

      const startTime = Date.now();
      const request = new NextRequest('http://localhost:3000/api/analytics/burnout');
      const response = await GET(request);
      const endTime = Date.now();

      expect(response.status).toBe(200);
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it('handles concurrent requests', async () => {
      mockCalculateBurnoutRisk.mockResolvedValue(mockBurnoutData);

      const requests = Array.from({ length: 5 }, () => 
        GET(new NextRequest('http://localhost:3000/api/analytics/burnout'))
      );

      const responses = await Promise.all(requests);

      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });
  });

  describe('Caching Behavior', () => {
    beforeEach(() => {
      mockGetServerSession.mockResolvedValue(mockSession);
    });

    it('sets appropriate cache headers', async () => {
      mockCalculateBurnoutRisk.mockResolvedValue(mockBurnoutData);

      const request = new NextRequest('http://localhost:3000/api/analytics/burnout');
      const response = await GET(request);

      expect(response.status).toBe(200);
      
      // Check for cache control headers
      const cacheControl = response.headers.get('Cache-Control');
      expect(cacheControl).toBeTruthy();
    });

    it('returns fresh data on subsequent requests', async () => {
      const firstCallData = { ...mockBurnoutData, riskScore: 65 };
      const secondCallData = { ...mockBurnoutData, riskScore: 70 };

      mockCalculateBurnoutRisk
        .mockResolvedValueOnce(firstCallData)
        .mockResolvedValueOnce(secondCallData);

      const request1 = new NextRequest('http://localhost:3000/api/analytics/burnout');
      const response1 = await GET(request1);
      const data1 = await response1.json();

      const request2 = new NextRequest('http://localhost:3000/api/analytics/burnout');
      const response2 = await GET(request2);
      const data2 = await response2.json();

      expect(data1.data.riskScore).toBe(65);
      expect(data2.data.riskScore).toBe(70);
    });
  });

  describe('Edge Cases', () => {
    beforeEach(() => {
      mockGetServerSession.mockResolvedValue(mockSession);
    });

    it('handles null burnout calculation result', async () => {
      mockCalculateBurnoutRisk.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/analytics/burnout');
      const response = await GET(request);

      expect(response.status).toBe(500);
      
      const data = await response.json();
      expect(data.success).toBe(false);
    });

    it('handles undefined burnout calculation result', async () => {
      mockCalculateBurnoutRisk.mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost:3000/api/analytics/burnout');
      const response = await GET(request);

      expect(response.status).toBe(500);
      
      const data = await response.json();
      expect(data.success).toBe(false);
    });

    it('handles malformed session data', async () => {
      const malformedSession = {
        user: 'not an object'
      };
      mockGetServerSession.mockResolvedValue(malformedSession as any);

      const request = new NextRequest('http://localhost:3000/api/analytics/burnout');
      const response = await GET(request);

      expect(response.status).toBe(400);
    });
  });
});