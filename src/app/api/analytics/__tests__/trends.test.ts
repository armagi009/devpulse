/**
 * Trends API Tests
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db/prisma';
import { GET } from '../trends/route';

// Mock dependencies
jest.mock('next-auth');
jest.mock('@/lib/db/prisma');

describe('Trends API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 if user is not authenticated', async () => {
    // Mock session to return null (not authenticated)
    (getServerSession as jest.Mock).mockResolvedValue(null);
    
    // Create request
    const request = new NextRequest('http://localhost:3000/api/analytics/trends?metric=commits');
    
    // Call API
    const response = await GET(request);
    const data = await response.json();
    
    // Check response
    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error.message).toBe('Not authenticated');
  });

  it('returns commit trend data', async () => {
    // Mock session
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { id: 'user-123', name: 'Test User' },
    });
    
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
    const response = await GET(request);
    const data = await response.json();
    
    // Check response
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.metric).toBe('commits');
    expect(data.data.trend).toHaveLength(2); // Two days of data
    expect(data.data.trend[0].value).toBe(2); // Two commits on first day
    expect(data.data.trend[1].value).toBe(1); // One commit on second day
  });

  it('returns burnout trend data', async () => {
    // Mock session
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { id: 'user-123', name: 'Test User' },
    });
    
    // Mock burnout metrics
    const mockBurnoutMetrics = [
      { date: new Date('2025-07-01'), burnoutRiskScore: 65 },
      { date: new Date('2025-07-02'), burnoutRiskScore: 70 },
    ];
    (prisma.burnoutMetric.findMany as jest.Mock).mockResolvedValue(mockBurnoutMetrics);
    
    // Create request
    const request = new NextRequest('http://localhost:3000/api/analytics/trends?metric=burnout');
    
    // Call API
    const response = await GET(request);
    const data = await response.json();
    
    // Check response
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.metric).toBe('burnout');
    expect(data.data.trend).toHaveLength(2);
    expect(data.data.trend[0].value).toBe(65);
    expect(data.data.trend[1].value).toBe(70);
  });

  it('returns velocity trend data when repositoryId is provided', async () => {
    // Mock session
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { id: 'user-123', name: 'Test User' },
    });
    
    // Mock team insights
    const mockTeamInsights = [
      { date: new Date('2025-07-01'), velocityScore: 75 },
      { date: new Date('2025-07-02'), velocityScore: 80 },
    ];
    (prisma.teamInsight.findMany as jest.Mock).mockResolvedValue(mockTeamInsights);
    
    // Create request
    const request = new NextRequest('http://localhost:3000/api/analytics/trends?metric=velocity&repositoryId=repo-123');
    
    // Call API
    const response = await GET(request);
    const data = await response.json();
    
    // Check response
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.metric).toBe('velocity');
    expect(data.data.trend).toHaveLength(2);
    expect(data.data.trend[0].value).toBe(75);
    expect(data.data.trend[1].value).toBe(80);
  });

  it('returns empty array for velocity trend when repositoryId is not provided', async () => {
    // Mock session
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { id: 'user-123', name: 'Test User' },
    });
    
    // Create request
    const request = new NextRequest('http://localhost:3000/api/analytics/trends?metric=velocity');
    
    // Call API
    const response = await GET(request);
    const data = await response.json();
    
    // Check response
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.metric).toBe('velocity');
    expect(data.data.trend).toEqual([]);
  });

  it('returns 400 for invalid metric parameter', async () => {
    // Mock session
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { id: 'user-123', name: 'Test User' },
    });
    
    // Create request with invalid metric
    const request = new NextRequest('http://localhost:3000/api/analytics/trends?metric=invalid');
    
    // Call API
    const response = await GET(request);
    const data = await response.json();
    
    // Check response
    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.message).toBe('Invalid trends query parameters');
  });
});