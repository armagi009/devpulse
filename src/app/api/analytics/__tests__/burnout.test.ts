/**
 * Burnout API Tests
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { calculateBurnoutRisk } from '@/lib/analytics/burnout-calculator';
import { GET } from '../burnout/route';

// Mock dependencies
jest.mock('next-auth');
jest.mock('@/lib/analytics/burnout-calculator');

describe('Burnout API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 if user is not authenticated', async () => {
    // Mock session to return null (not authenticated)
    (getServerSession as jest.Mock).mockResolvedValue(null);
    
    // Create request
    const request = new NextRequest('http://localhost:3000/api/analytics/burnout');
    
    // Call API
    const response = await GET(request);
    const data = await response.json();
    
    // Check response
    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error.message).toBe('Not authenticated');
  });

  it('returns burnout risk assessment for a user', async () => {
    // Mock session
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { id: 'user-123', name: 'Test User' },
    });
    
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
    const response = await GET(request);
    const data = await response.json();
    
    // Check response
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.riskScore).toBe(65);
    expect(data.data.userId).toBe('user-123');
    expect(calculateBurnoutRisk).toHaveBeenCalledWith('user-123', undefined, 30);
  });

  it('accepts repositoryId and days parameters', async () => {
    // Mock session
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { id: 'user-123', name: 'Test User' },
    });
    
    // Mock burnout risk calculation
    const mockBurnoutRisk = {
      riskScore: 65,
      confidence: 0.8,
      keyFactors: [],
      recommendations: [],
      historicalTrend: [],
    };
    (calculateBurnoutRisk as jest.Mock).mockResolvedValue(mockBurnoutRisk);
    
    // Create request with parameters
    const request = new NextRequest('http://localhost:3000/api/analytics/burnout?repositoryId=repo-123&days=60');
    
    // Call API
    const response = await GET(request);
    
    // Check that calculateBurnoutRisk was called with the correct parameters
    expect(calculateBurnoutRisk).toHaveBeenCalledWith('user-123', 'repo-123', 60);
  });

  it('returns 400 for invalid parameters', async () => {
    // Mock session
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { id: 'user-123', name: 'Test User' },
    });
    
    // Create request with invalid parameters
    const request = new NextRequest('http://localhost:3000/api/analytics/burnout?days=invalid');
    
    // Call API
    const response = await GET(request);
    const data = await response.json();
    
    // Check response
    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.message).toBe('Invalid burnout risk query parameters');
  });
});